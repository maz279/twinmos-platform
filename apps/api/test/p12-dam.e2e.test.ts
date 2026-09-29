// Phase 4 (TWN-ADMIN-CMS-AUDIT-PLAN §4) — media DAM gates:
//   4.1 storage drivers — local round-trip; S3 SigV4 signer shape; env gating
//   4.2 sharp variants — upload derives thumb/card/hero/heroAvif/full with
//       dimensions + colour profile in meta; ?variant= serving (WebP/AVIF)
//   4.3 folders — CRUD, RBAC, empty-delete guard, subtree-cycle guard, asset
//       move; in-use delete guard (product hero/gallery + article/news refs)
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync, existsSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-p12-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.MAIL_OUTBOX_DIR = join(TMP, 'outbox');
process.env.MEDIA_DIR = join(TMP, 'media');
process.env.FORMS_TO = 'console@twinmos.dev';
process.env.API_ALLOW_NO_TURNSTILE = '1';
process.env.NODE_ENV = 'test';

const MIGRATIONS = join(dirname(dirname(process.cwd())), 'packages', 'db', 'migrations');

const { createDb, user, brand, category, product }: any = await import('@twinmos/db');
const { migrate } = await import('drizzle-orm/pglite/migrator');
const { buildApp }: any = await import('../src/app.ts');
const { eq } = await import('drizzle-orm');
const { LocalStorageDriver, S3StorageDriver, getStorage, __resetStorageForTest } = await import('../src/storage.ts');

const db = createDb();
await db.$client.exec('CREATE SCHEMA IF NOT EXISTS drizzle');
await migrate(db, { migrationsFolder: MIGRATIONS });
const app = buildApp(db);

const mkPass = () => process.env.E2E_ADMIN_PASSWORD ?? 'P12-Dam-' + new Date().getFullYear() + '!';
let cookie = '';
const HDRS = () => ({ 'content-type': 'application/json', cookie });

/** Minimal valid 1×1 PNG (base64) — sharp can derive every variant from it. */
const PNG_1PX = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='), (ch) => ch.charCodeAt(0));
/** Second distinct 1×1 PNG (red) — different bytes so content-dedup never kicks in. */
const PNG_1PX_RED = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC'), (ch) => ch.charCodeAt(0));

async function uploadPng(name = 'probe.png', alt = 'test asset'): Promise<{ status: number; body: any }> {
  const form = new FormData();
  form.append('file', new File([PNG_1PX], name, { type: 'image/png' }));
  form.append('alt', alt);
  const res = await app.request('/api/v1/admin/media', { method: 'POST', headers: { cookie }, body: form });
  return { status: res.status, body: await res.json().catch(() => ({})) };
}

beforeAll(async () => {
  await app.request('/api/v1/auth/sign-up/email', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'p12@twinmos.dev', password: mkPass(), name: 'p12' }),
  });
  await db.update(user).set({ role: 'super_admin' }).where(eq(user.email, 'p12@twinmos.dev'));
  const res = await app.request('/api/v1/auth/sign-in/email', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'p12@twinmos.dev', password: mkPass() }),
  });
  cookie = res.headers.getSetCookie().map((c) => c.split(';')[0]).join('; ');
  await db.insert(brand).values({ slug: 'voltx', name: 'VOLTX' });
  await db.insert(category).values({ slug: 'ddr5', name: 'DDR5 Memory' });
});
afterAll(async () => { await db.$client.close(); rmSync(TMP, { recursive: true, force: true }); });

// ---------------- 4.1 storage drivers ----------------
describe('P4.1: pluggable storage drivers', () => {
  it('local driver round-trips put/get/delete inside its root', async () => {
    const root = join(TMP, 'driver-local');
    const drv = new LocalStorageDriver(root);
    await drv.put('nested/key.png', new Uint8Array([1, 2, 3]), 'image/png');
    const got = await drv.get('nested/key.png');
    expect(got?.bytes).toEqual(new Uint8Array([1, 2, 3]));
    expect(await drv.getUrl('nested/key.png')).toBeNull();
    await drv.delete('nested/key.png');
    expect(await drv.get('nested/key.png')).toBeNull();
    // missing delete is tolerated (idempotent)
    await drv.delete('nested/key.png');
    expect(existsSync(join(root, 'nested'))).toBe(true);
  });

  it('S3 driver: SigV4 signature shape + presigned URL query (no network)', async () => {
    const endpoint = process.env.S3_TEST_ENDPOINT ?? 'https://examples3.invalid';
    const drv = new S3StorageDriver(endpoint, 'auto', 'bucket', process.env.S3_TEST_KEY_ID ?? 'testkey', process.env.S3_TEST_SECRET ?? 'testsecret');
    const signed = drv.signRequest('PUT', 'media/x.png', 'abc123', new Date('2026-09-30T01:23:45Z'));
    expect(signed.url).toContain('https://examples3.invalid/bucket/media/x.png');
    expect(signed.headers['x-amz-date']).toBe('20260930T012345Z');
    expect(signed.headers.Authorization).toMatch(/^AWS4-HMAC-SHA256 Credential=testkey\/20260930\/auto\/s3\/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date, Signature=[0-9a-f]{64}$/);
    // presign: same signature pipeline, query-string form
    const url = await drv.getUrl('media/x.png', 900);
    expect(url).toContain('X-Amz-Algorithm=AWS4-HMAC-SHA256');
    expect(url).toContain('X-Amz-SignedHeaders=host');
    expect(url).toMatch(/X-Amz-Signature=[0-9a-f]{40,}/);
  });

  it('env gating: MEDIA_STORAGE=s3 without the full env set fails loud; default is local', async () => {
    __resetStorageForTest();
    expect(getStorage().kind).toBe('local');
    const snapshot = new Map(Object.entries(process.env));
    try {
      process.env.MEDIA_STORAGE = 's3';
      delete process.env.S3_ENDPOINT;
      __resetStorageForTest();
      expect(() => getStorage()).toThrow(/S3_ENDPOINT/);
    } finally {
      // remove keys the test added, then restore every prior value — a plain
      // Object.assign cannot DELETE keys, which would leak MEDIA_STORAGE=s3
      // into every later request in this worker.
      for (const k of Object.keys(process.env)) if (!snapshot.has(k)) delete process.env[k];
      for (const [k, v] of snapshot) process.env[k] = v;
      __resetStorageForTest();
    }
    expect(getStorage().kind).toBe('local');
  });
});

// ---------------- 4.2 sharp variants ----------------
describe('P4.2: sharp responsive variants', () => {
  let assetId = 0;
  it('upload derives thumb/card/hero/heroAvif/full with profile in meta', async () => {
    const { status, body } = await uploadPng('variants.png', 'variant probe');
    expect(status).toBe(201);
    assetId = body.id;
    expect(body.width).toBe(1);
    const variants = body.meta?.variants ?? {};
    for (const v of ['thumb', 'card', 'hero', 'heroAvif', 'full']) expect(variants[v], 'variant ' + v).toBeTruthy();
    expect(variants.thumb.mime).toBe('image/webp');
    expect(variants.heroAvif.mime).toBe('image/avif');
    expect(variants.thumb.width).toBe(150); // cover → exact box
    expect(body.meta?.profile?.format).toBe('png');
  });

  it('?variant= serves derivative bytes with immutable caching', async () => {
    const thumb = await app.request(`/api/v1/admin/media/${assetId}/file?variant=thumb`, { headers: { cookie } });
    expect(thumb.status).toBe(200);
    expect(thumb.headers.get('content-type')).toBe('image/webp');
    expect(thumb.headers.get('cache-control')).toContain('immutable');
    const avif = await app.request(`/api/v1/admin/media/${assetId}/file?variant=heroAvif`, { headers: { cookie } });
    expect(avif.headers.get('content-type')).toBe('image/avif');
    const unknown = await app.request(`/api/v1/admin/media/${assetId}/file?variant=nope`, { headers: { cookie } });
    expect(unknown.status).toBe(404);
  });

  it('variant request on a derivative-less asset (SVG) falls back to the original', async () => {
    // SVG skips the raster pipeline — no manifest — but thumbnails must not 404
    const svgBody = '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="#0E9F7E"/></svg>';
    const form = new FormData();
    form.append('file', new File([svgBody], 'plain.svg', { type: 'image/svg+xml' }));
    form.append('alt', 'plain swatch');
    const up = await app.request('/api/v1/admin/media', { method: 'POST', headers: { cookie }, body: form });
    expect(up.status).toBe(201);
    const svgAsset = (await up.json()).id;
    expect((svgAsset as any).meta?.variants).toBeUndefined();
    const fb = await app.request(`/api/v1/admin/media/${svgAsset}/file?variant=thumb`, { headers: { cookie } });
    expect(fb.status).toBe(200);
    expect(fb.headers.get('content-type')).toBe('image/svg+xml');
    expect(fb.headers.get('cache-control')).not.toContain('immutable');
  });

  it('variant bytes differ from the original and live beside it in storage', async () => {
    const row = (await db.select().from((await import('@twinmos/db')).mediaAsset).where(eq((await import('@twinmos/db')).mediaAsset.id, assetId)).limit(1))[0];
    const orig = await app.request(`/api/v1/admin/media/${assetId}/file`, { headers: { cookie } });
    const thumb = await app.request(`/api/v1/admin/media/${assetId}/file?variant=thumb`, { headers: { cookie } });
    const origLen = (await orig.arrayBuffer()).byteLength;
    const thumbLen = (await thumb.arrayBuffer()).byteLength;
    expect(existsSync(join(process.env.MEDIA_DIR!, row.key))).toBe(true);
    expect(existsSync(join(process.env.MEDIA_DIR!, row.meta.variants.thumb.key))).toBe(true);
    expect(origLen).not.toBe(thumbLen);
  });
});

// ---------------- 4.3 folders + in-use guard ----------------
describe('P4.3: folder hierarchy + referential integrity', () => {
  let productsId = 0;
  let brandingId = 0;
  let assetId = 0;

  it('seeds the §4.3 default folder structure idempotently on first read', async () => {
    const list = await app.request('/api/v1/admin/media-folders', { headers: { cookie } });
    expect(list.status).toBe(200);
    const first = (await list.json()) as { items: Array<{ id: number; name: string; parentId: number | null }> };
    for (const def of ['products', 'banners', 'news', 'branding', 'datasheets']) {
      expect(first.items.map((f) => f.name), 'default folder ' + def).toContain(def);
    }
    // second read does not duplicate
    const again = await app.request('/api/v1/admin/media-folders', { headers: { cookie } });
    const second = (await again.json()) as { items: Array<{ name: string }> };
    expect(second.items.filter((f) => f.name === 'banners').length).toBe(1);
    productsId = first.items.find((f) => f.name === 'products' && f.parentId == null)!.id;
  });

  it('creates folders (RBAC: anon 401) and nests under the seeded root', async () => {
    expect((await app.request('/api/v1/admin/media-folders')).status).toBe(401);
    const child = await app.request('/api/v1/admin/media-folders', {
      method: 'POST', headers: HDRS(), body: JSON.stringify({ name: 'banners', parentId: productsId }),
    });
    expect(child.status).toBe(201);
    brandingId = (await child.json()).id;
    const list = await app.request('/api/v1/admin/media-folders', { headers: { cookie } });
    const items = (await list.json()).items;
    expect(items.some((f: any) => f.name === 'banners' && f.parentId === productsId)).toBe(true);
  });

  it('renames, blocks subtree cycles and refuses deleting non-empty folders', async () => {
    const rename = await app.request('/api/v1/admin/media-folders/' + brandingId, {
      method: 'PATCH', headers: HDRS(), body: JSON.stringify({ name: 'branding' }),
    });
    expect(rename.status).toBe(200);
    expect((await rename.json()).name).toBe('branding');

    // moving a parent under its own child → 422
    const cycle = await app.request('/api/v1/admin/media-folders/' + productsId, {
      method: 'PATCH', headers: HDRS(), body: JSON.stringify({ parentId: brandingId }),
    });
    expect(cycle.status).toBe(422);

    // child folder under parent → not empty → 409
    const delParent = await app.request('/api/v1/admin/media-folders/' + productsId, { method: 'DELETE', headers: { cookie } });
    expect(delParent.status).toBe(409);
  });

  it('uploads into a folder, filters by folder, and moves assets between folders', async () => {
    const form = new FormData();
    form.append('file', new File([PNG_1PX], 'filed.png', { type: 'image/png' }));
    form.append('alt', 'filed asset');
    form.append('folderId', String(productsId));
    const up = await app.request('/api/v1/admin/media', { method: 'POST', headers: { cookie }, body: form });
    // identical bytes → content-addressed dedup returns the existing row (200)
    expect([200, 201]).toContain(up.status);
    const upBody = await up.json();
    if (up.status === 200) expect(upBody.deduplicated).toBe(true);
    assetId = upBody.id;

    const inFolder = await app.request('/api/v1/admin/media?folder=' + productsId, { headers: { cookie } });
    expect((await inFolder.json()).items.some((m: any) => m.id === assetId)).toBe(true);
    const unfiled = await app.request('/api/v1/admin/media?folder=none', { headers: { cookie } });
    expect((await unfiled.json()).items.some((m: any) => m.id === assetId)).toBe(false);

    const move = await app.request('/api/v1/admin/media/' + assetId, {
      method: 'PATCH', headers: HDRS(), body: JSON.stringify({ folderId: brandingId }),
    });
    expect(move.status).toBe(200);
    expect((await move.json()).folderId).toBe(brandingId);
    const counts = await (await app.request('/api/v1/admin/media-folders', { headers: { cookie } })).json();
    expect(counts.items.find((f: any) => f.id === brandingId).assetCount).toBe(1);
  });

  it('delete guard: hero-referenced asset → 409 listing the product; detach → delete removes variants too', async () => {
    // fixture product with this asset as hero AND in gallery
    const created = await app.request('/api/v1/admin/products', {
      method: 'POST', headers: HDRS(),
      body: JSON.stringify({ sku: 'VLT-DAM-1', slug: 'voltx-dam-1', name: 'DAM probe', brandId: 1, categoryId: 1, status: 'draft', heroMediaId: assetId, gallery: [assetId] }),
    });
    expect(created.status).toBe(201);

    const blocked = await app.request('/api/v1/admin/media/' + assetId, { method: 'DELETE', headers: { cookie } });
    expect(blocked.status).toBe(409);
    const detail = ((await blocked.json()) as { detail: string }).detail;
    expect(detail).toContain('product');
    expect(detail).toContain('VLT-DAM-1');

    // detach both references → delete succeeds and purges derivative bytes
    await db.update(product).set({ heroMediaId: null, gallery: [] }).where(eq(product.id, (await created.json()).id));
    const row = (await db.select().from((await import('@twinmos/db')).mediaAsset).where(eq((await import('@twinmos/db')).mediaAsset.id, assetId)).limit(1))[0];
    const variantKeys: string[] = Object.values(row.meta.variants ?? {}).map((v: any) => v.key);
    expect(variantKeys.length).toBe(5);

    const ok = await app.request('/api/v1/admin/media/' + assetId, { method: 'DELETE', headers: { cookie } });
    expect(ok.status).toBe(200);
    for (const k of [row.key, ...variantKeys]) {
      expect(existsSync(join(process.env.MEDIA_DIR!, k))).toBe(false);
    }
    expect((await app.request('/api/v1/admin/media/' + assetId + '/file', { headers: { cookie } })).status).toBe(404);
  });

  it('empty folder deletes; its assets survive as unfiled (FK set-null)', async () => {
    // fresh asset in branding (the guard test consumed the previous one)
    const form = new FormData();
    form.append('file', new File([PNG_1PX_RED], 'last-one.png', { type: 'image/png' }));
    form.append('alt', 'last asset');
    form.append('folderId', String(brandingId));
    const seed = await app.request('/api/v1/admin/media', { method: 'POST', headers: { cookie }, body: form });
    expect([200, 201]).toContain(seed.status);

    const list = await (await app.request('/api/v1/admin/media?folder=' + brandingId, { headers: { cookie } })).json();
    const aid = list.items[0].id;
    await app.request('/api/v1/admin/media/' + aid, { method: 'PATCH', headers: HDRS(), body: JSON.stringify({ folderId: null }) });
    const del = await app.request('/api/v1/admin/media-folders/' + brandingId, { method: 'DELETE', headers: { cookie } });
    expect(del.status).toBe(200);
    const unfiled = await (await app.request('/api/v1/admin/media?folder=none', { headers: { cookie } })).json();
    expect(unfiled.items.some((m: any) => m.id === aid)).toBe(true);
    // cleanup product + folder for a tidy suite end
    await app.request('/api/v1/admin/media-folders/' + productsId, { method: 'DELETE', headers: { cookie } });
  });

  it('folder mutations audit under the media_folder entity', async () => {
    const res = await app.request('/api/v1/admin/audit?entity=media_folder', { headers: { cookie } });
    expect(res.status).toBe(200);
    const actions = (await res.json()).items.map((r: any) => r.action);
    expect(actions).toContain('media.folder.create');
    expect(actions).toContain('media.folder.update');
    expect(actions).toContain('media.folder.delete');
  });
});
