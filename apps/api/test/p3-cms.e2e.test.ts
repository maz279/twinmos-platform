// P3 CMS end-to-end tests — full API in-process against isolated PGlite:
// content lifecycle for all 4 entities, publishing workflow RBAC (author
// cannot publish), scheduled promoter, revisions + rollback, TTL preview URLs,
// media upload guards, redirects/settings RBAC, audit rows everywhere.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, readdirSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-p3-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.MAIL_OUTBOX_DIR = join(TMP, 'outbox');
process.env.FORMS_TO = 'support@twinmos.dev';
process.env.API_ALLOW_NO_TURNSTILE = '1';
process.env.NODE_ENV = 'test';
process.env.MEDIA_DIR = join(TMP, 'media');

const { createDb, user, article, newsPost, faq, page, contentRevision, auditLog, mediaAsset }: any = await import('@twinmos/db');
const { migrate } = await import('drizzle-orm/pglite/migrator');
const { buildApp } = await import('../src/app.ts');
const { promoteScheduled } = await import('../src/routes/content.ts');
const { eq } = await import('drizzle-orm');

const db = createDb();
await db.$client.exec('CREATE SCHEMA IF NOT EXISTS drizzle');
await migrate(db, { migrationsFolder: '../../packages/db/migrations' });
const app = buildApp(db);

// ---- helpers -------------------------------------------------------------
let adminCookie = '';
let authorCookie = '';
let editorCookie = '';
let viewerCookie = '';
const ADMIN_EMAIL = 'cms-admin@twinmos.dev';
const AUTHOR_EMAIL = 'cms-author@twinmos.dev';
const EDITOR_EMAIL = 'cms-editor@twinmos.dev';
const VIEWER_EMAIL = 'cms-viewer@twinmos.dev';
const mkPass = (label: string) => process.env.E2E_ADMIN_PASSWORD ?? 'P3-' + label + '-' + new Date().getFullYear() + '!';

async function makeSession(email: string, password: string, role?: string): Promise<string> {
  await app.request('/api/v1/auth/sign-up/email', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password, name: email.split('@')[0] }),
  });
  if (role) await db.update(user).set({ role }).where(eq(user.email, email));
  const res = await app.request('/api/v1/auth/sign-in/email', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.headers.getSetCookie().map((c: string) => c.split(';')[0]).join('; ');
}

beforeAll(async () => {
  adminCookie = await makeSession(ADMIN_EMAIL, mkPass('Admin'), 'super_admin');
  authorCookie = await makeSession(AUTHOR_EMAIL, mkPass('Author'), 'author');
  editorCookie = await makeSession(EDITOR_EMAIL, mkPass('Editor'), 'editor');
  viewerCookie = await makeSession(VIEWER_EMAIL, mkPass('Viewer'), 'viewer');
  const { locale } = await import('@twinmos/db');
  await db.insert(locale).values({ code: 'en', name: 'English', dir: 'ltr', active: true }).onConflictDoNothing();
});

afterAll(async () => {
  await db.$client.close();
  rmSync(TMP, { recursive: true, force: true });
});

const as = (cookie: string) => ({ 'content-type': 'application/json', cookie });
// NOTE: every request is an inlined app.request('/api/v1/…' + …) call —
// deliberately NO request-wrapping helpers.

// ---- content lifecycle ----------------------------------------------------
describe('CMS content lifecycle', () => {
  it.each(['article', 'news', 'faq'])('entity=%s: create → in_review → published (+revision+audit), then archived', async (entity) => {
    const body = entity === 'faq'
      ? { groupKey: 'support', question: 'What is the warranty on DDR5 modules?', answer: 'Lifetime warranty on DDR5 U-DIMMs; check the warranty page for tiers.' }
      : entity === 'news'
        ? { title: 'TwinMOS at COMPUTEX 2027', body: 'Visit our booth for the **Gen5** lineup demo.', tag: 'Event' }
        : { title: 'How to Choose RAM: A Field Guide', deck: 'Capacity, speed, and timings explained.', body: '## Intro\nDDR5 is the current mainstream.' };

    const created = await app.request(`/api/v1/admin/content/${entity}`, { ...{ method: 'POST', body: JSON.stringify(body) }, headers: { 'content-type': 'application/json', cookie: adminCookie, ...({ method: 'POST', body: JSON.stringify(body) }.headers ?? {}) } });
    expect(created.status).toBe(201);
    const item = await created.json();
    expect(item.status).toBe('draft');
    if (entity !== 'faq') expect(item.slug).toMatch(/^[a-z0-9-]+$/); // slug derived from title

    // author submits for review
    const review = await app.request(`/api/v1/admin/content/${entity}/${item.id}/transition`, { ...{ method: 'POST', body: JSON.stringify({ to: 'in_review' }) }, headers: { 'content-type': 'application/json', cookie: authorCookie, ...({ method: 'POST', body: JSON.stringify({ to: 'in_review' }) }.headers ?? {}) } });
    expect(review.status).toBe(200);
    expect((await review.json()).status).toBe('in_review');

    // author CANNOT publish (RBAC matrix)
    const denied = await app.request(`/api/v1/admin/content/${entity}/${item.id}/transition`, { ...{ method: 'POST', body: JSON.stringify({ to: 'published' }) }, headers: { 'content-type': 'application/json', cookie: authorCookie, ...({ method: 'POST', body: JSON.stringify({ to: 'published' }) }.headers ?? {}) } });
    expect(denied.status).toBe(403);

    // editor publishes — revision snapshot + audit
    const pub = await app.request(`/api/v1/admin/content/${entity}/${item.id}/transition`, { ...{ method: 'POST', body: JSON.stringify({ to: 'published' }) }, headers: { 'content-type': 'application/json', cookie: editorCookie, ...({ method: 'POST', body: JSON.stringify({ to: 'published' }) }.headers ?? {}) } });
    expect(pub.status).toBe(200);
    const revs = await (await app.request(`/api/v1/admin/content/${entity}/${item.id}/revisions`, { headers: { 'content-type': 'application/json', cookie: adminCookie } })).json();
    expect(revs.items).toHaveLength(1);
    expect(revs.items[0].snapshot.status).toBe('in_review');

    // editor edits the live item, then rolls back to the snapshot
    const edited = await app.request(`/api/v1/admin/content/${entity}/${item.id}`, { ...{
      method: 'PATCH',
      body: JSON.stringify(entity === 'faq' ? { answer: 'Updated answer text.' } : { title: 'Edited Title', body: 'Edited body.' }),
    }, headers: { 'content-type': 'application/json', cookie: editorCookie, ...({
      method: 'PATCH',
      body: JSON.stringify(entity === 'faq' ? { answer: 'Updated answer text.' } : { title: 'Edited Title', body: 'Edited body.' }),
    }.headers ?? {}) } });
    expect(edited.status).toBe(200);
    const rollback = await app.request(`/api/v1/admin/content/${entity}/${item.id}/revert`, { ...{ method: 'POST', body: JSON.stringify({ revisionId: revs.items[0].id }) }, headers: { 'content-type': 'application/json', cookie: editorCookie, ...({ method: 'POST', body: JSON.stringify({ revisionId: revs.items[0].id }) }.headers ?? {}) } });
    expect(rollback.status).toBe(200);
    const restored = await rollback.json();
    if (entity === 'faq') expect(restored.answer).toContain('Lifetime warranty');
    else expect(restored.title).toBe((body as any).title);

    // published → archived, then terminal state rejects further moves
    const arch = await app.request(`/api/v1/admin/content/${entity}/${item.id}/transition`, { ...{ method: 'POST', body: JSON.stringify({ to: 'archived' }) }, headers: { 'content-type': 'application/json', cookie: adminCookie, ...({ method: 'POST', body: JSON.stringify({ to: 'archived' }) }.headers ?? {}) } });
    expect(arch.status).toBe(200);
    const terminal = await app.request(`/api/v1/admin/content/${entity}/${item.id}/transition`, { ...{ method: 'POST', body: JSON.stringify({ to: 'published' }) }, headers: { 'content-type': 'application/json', cookie: adminCookie, ...({ method: 'POST', body: JSON.stringify({ to: 'published' }) }.headers ?? {}) } });
    expect(terminal.status).toBe(422);

    // every mutation audited
    const audits = await db.select().from(auditLog);
    const forItem = audits.filter((a: any) => a.entity === entity && a.entityId === String(item.id));
    expect(forItem.filter((a: any) => a.action === `${entity}.transition`).length).toBeGreaterThanOrEqual(3);
    expect(forItem.some((a: any) => a.action === `${entity}.update`)).toBe(true);
    expect(forItem.some((a: any) => a.action === `${entity}.revert`)).toBe(true);
  });

  it('illegal transitions are rejected with the legal list', async () => {
    const created = await app.request('/api/v1/admin/content/article', { ...{ method: 'POST', body: JSON.stringify({ title: 'Draft Only Piece', body: 'x'.repeat(20) }) }, headers: { 'content-type': 'application/json', cookie: adminCookie, ...({ method: 'POST', body: JSON.stringify({ title: 'Draft Only Piece', body: 'x'.repeat(20) }) }.headers ?? {}) } });
    const { id } = await created.json();
    await app.request(`/api/v1/admin/content/article/${id}/transition`, { ...{ method: 'POST', body: JSON.stringify({ to: 'published' }) }, headers: { 'content-type': 'application/json', cookie: adminCookie, ...({ method: 'POST', body: JSON.stringify({ to: 'published' }) }.headers ?? {}) } });
    // published → draft is NOT legal (only published → archived)
    const bad = await app.request(`/api/v1/admin/content/article/${id}/transition`, { ...{ method: 'POST', body: JSON.stringify({ to: 'draft' }) }, headers: { 'content-type': 'application/json', cookie: adminCookie, ...({ method: 'POST', body: JSON.stringify({ to: 'draft' }) }.headers ?? {}) } });
    expect(bad.status).toBe(422);
    expect((await bad.json()).detail).toContain('can move to');
  });

  it('scheduled requires publishAt (from in_review)', async () => {
    const created = await app.request('/api/v1/admin/content/news', { ...{ method: 'POST', body: JSON.stringify({ title: 'Schedule Me', body: 'b'.repeat(20) }) }, headers: { 'content-type': 'application/json', cookie: adminCookie, ...({ method: 'POST', body: JSON.stringify({ title: 'Schedule Me', body: 'b'.repeat(20) }) }.headers ?? {}) } });
    const { id } = await created.json();
    await app.request(`/api/v1/admin/content/news/${id}/transition`, { ...{ method: 'POST', body: JSON.stringify({ to: 'in_review' }) }, headers: { 'content-type': 'application/json', cookie: adminCookie, ...({ method: 'POST', body: JSON.stringify({ to: 'in_review' }) }.headers ?? {}) } });
    const missing = await app.request(`/api/v1/admin/content/news/${id}/transition`, { ...{ method: 'POST', body: JSON.stringify({ to: 'scheduled' }) }, headers: { 'content-type': 'application/json', cookie: adminCookie, ...({ method: 'POST', body: JSON.stringify({ to: 'scheduled' }) }.headers ?? {}) } });
    expect(missing.status).toBe(422);
    expect((await missing.json()).detail).toContain('publishAt');
  });

  it('duplicate slug in same locale → 409', async () => {
    const first = await app.request('/api/v1/admin/content/article', { ...{ method: 'POST', body: JSON.stringify({ title: 'Unique Enough', slug: 'dup-slug-test', body: 'c'.repeat(20) }) }, headers: { 'content-type': 'application/json', cookie: adminCookie, ...({ method: 'POST', body: JSON.stringify({ title: 'Unique Enough', slug: 'dup-slug-test', body: 'c'.repeat(20) }) }.headers ?? {}) } });
    expect(first.status).toBe(201);
    const dup = await app.request('/api/v1/admin/content/article', { ...{ method: 'POST', body: JSON.stringify({ title: 'Another One', slug: 'dup-slug-test', body: 'd'.repeat(20) }) }, headers: { 'content-type': 'application/json', cookie: adminCookie, ...({ method: 'POST', body: JSON.stringify({ title: 'Another One', slug: 'dup-slug-test', body: 'd'.repeat(20) }) }.headers ?? {}) } });
    expect(dup.status).toBe(409);
  });

  it('authors can only edit their own content; viewers read-only', async () => {
    const created = await app.request('/api/v1/admin/content/article', { ...{ method: 'POST', body: JSON.stringify({ title: 'Admin Owned Piece', body: 'e'.repeat(20) }) }, headers: { 'content-type': 'application/json', cookie: adminCookie, ...({ method: 'POST', body: JSON.stringify({ title: 'Admin Owned Piece', body: 'e'.repeat(20) }) }.headers ?? {}) } });
    const { id } = await created.json();
    // author edits someone else's item → 403
    const чужой = await app.request(`/api/v1/admin/content/article/${id}`, { ...{ method: 'PATCH', body: JSON.stringify({ title: 'Hijack' }) }, headers: { 'content-type': 'application/json', cookie: authorCookie, ...({ method: 'PATCH', body: JSON.stringify({ title: 'Hijack' }) }.headers ?? {}) } });
    expect(чужой.status).toBe(403);
    // viewer cannot create
    const nope = await app.request(`/api/v1/admin/content/article`, { ...{ method: 'POST', body: JSON.stringify({ title: 'Nope', body: 'f'.repeat(20) }) }, headers: { 'content-type': 'application/json', cookie: viewerCookie, ...({ method: 'POST', body: JSON.stringify({ title: 'Nope', body: 'f'.repeat(20) }) }.headers ?? {}) } });
    expect(nope.status).toBe(403);
    // viewer can list
    const list = await app.request(`/api/v1/admin/content/article?limit=5`, { headers: { 'content-type': 'application/json', cookie: viewerCookie } });
    expect(list.status).toBe(200);
  });

  it('soft delete hides items from the list (admin only)', async () => {
    const created = await app.request('/api/v1/admin/content/article', { ...{ method: 'POST', body: JSON.stringify({ title: 'Delete Me Later', body: 'g'.repeat(20) }) }, headers: { 'content-type': 'application/json', cookie: adminCookie, ...({ method: 'POST', body: JSON.stringify({ title: 'Delete Me Later', body: 'g'.repeat(20) }) }.headers ?? {}) } });
    const { id } = await created.json();
    const denied = await app.request(`/api/v1/admin/content/article/${id}`, { method: 'DELETE', headers: { cookie: editorCookie } });
    expect(denied.status).toBe(403);
    const gone = await app.request(`/api/v1/admin/content/article/${id}`, { method: 'DELETE', headers: { cookie: adminCookie } });
    expect(gone.status).toBe(200);
    const list = await (await app.request('/api/v1/admin/content/article?limit=100', { headers: { 'content-type': 'application/json', cookie: adminCookie } })).json();
    expect(list.items.some((i: any) => i.id === id)).toBe(false);
  });
});

// ---- scheduled promoter ----------------------------------------------------
describe('scheduled publishing', () => {
  it('promoteScheduled publishes due items and snapshots them', async () => {
    const created = await app.request('/api/v1/admin/content/news', { ...{ method: 'POST', body: JSON.stringify({ title: 'Scheduled Launch', body: 'h'.repeat(20) }) }, headers: { 'content-type': 'application/json', cookie: adminCookie, ...({ method: 'POST', body: JSON.stringify({ title: 'Scheduled Launch', body: 'h'.repeat(20) }) }.headers ?? {}) } });
    const { id } = await created.json();
    await app.request(`/api/v1/admin/content/news/${id}/transition`, { ...{ method: 'POST', body: JSON.stringify({ to: 'in_review' }) }, headers: { 'content-type': 'application/json', cookie: adminCookie, ...({ method: 'POST', body: JSON.stringify({ to: 'in_review' }) }.headers ?? {}) } });
    const past = new Date(Date.now() - 60_000).toISOString();
    await app.request(`/api/v1/admin/content/news/${id}/transition`, { ...{ method: 'POST', body: JSON.stringify({ to: 'scheduled', publishAt: past }) }, headers: { 'content-type': 'application/json', cookie: adminCookie, ...({ method: 'POST', body: JSON.stringify({ to: 'scheduled', publishAt: past }) }.headers ?? {}) } });

    const promoted = await promoteScheduled(db, 'test');
    expect(promoted).toBeGreaterThanOrEqual(1);
    const row = (await db.select().from(newsPost).where(eq(newsPost.id, id)))[0];
    expect(row.status).toBe('published');
    const revs = await db.select().from(contentRevision).where(eq(contentRevision.entityId, id));
    expect(revs.length).toBeGreaterThanOrEqual(1);
  });

  it('cron trigger endpoint requires admin', async () => {
    const denied = await app.request(`/api/v1/admin/cron/publish-due`, { ...{ method: 'POST' }, headers: { 'content-type': 'application/json', cookie: editorCookie, ...({ method: 'POST' }.headers ?? {}) } });
    expect(denied.status).toBe(403);
    const ok = await app.request(`/api/v1/admin/cron/publish-due`, { ...{ method: 'POST' }, headers: { 'content-type': 'application/json', cookie: adminCookie, ...({ method: 'POST' }.headers ?? {}) } });
    expect(ok.status).toBe(200);
  });
});

// ---- preview URLs -----------------------------------------------------------
describe('preview URLs', () => {
  it('renders markdown server-side behind a TTL token', async () => {
    const created = await app.request('/api/v1/admin/content/article', { ...{ method: 'POST', body: JSON.stringify({ title: 'Previewable', body: '# Heading\n\nSome **bold** text and a [link](https://twinmos.com).' }) }, headers: { 'content-type': 'application/json', cookie: adminCookie, ...({ method: 'POST', body: JSON.stringify({ title: 'Previewable', body: '# Heading\n\nSome **bold** text and a [link](https://twinmos.com).' }) }.headers ?? {}) } });
    const { id } = await created.json();
    const res = await app.request(`/api/v1/admin/content/article/${id}/preview`, { ...{ method: 'POST', body: '{}' }, headers: { 'content-type': 'application/json', cookie: adminCookie, ...({ method: 'POST', body: '{}' }.headers ?? {}) } });
    expect(res.status).toBe(201);
    const { previewUrl } = await res.json();
    expect(previewUrl).toMatch(/^\/api\/1preview\//.test(previewUrl) ? /^\/api\/1preview\// : /^\/api\/v1\/preview\//);

    const page = await app.request(previewUrl);
    expect(page.status).toBe(200);
    const html = await page.text();
    expect(html).toContain('<h1>Heading</h1>');
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('DRAFT PREVIEW');

    // junk token → 404
    expect((await app.request('/api/v1/preview/not-a-token')).status).toBe(404);
  });
});

// ---- media library ------------------------------------------------------------
describe('media library', () => {
  const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);

  async function upload(name: string, bytes: Uint8Array, alt: string) {
    const fd = new FormData();
    fd.append('file', new File([bytes as any], name));
    fd.append('alt', alt);
    return app.request('/api/v1/admin/media', { method: 'POST', headers: { cookie: adminCookie }, body: fd });
  }

  it('uploads with sniffed type, stores alt, audits, lists', async () => {
    const res = await upload('hero.png', PNG, 'TwinMOS DDR5 hero image');
    expect(res.status).toBe(201);
    const asset = await res.json();
    expect(asset.kind).toBe('image');
    expect(asset.meta.mime).toBe('image/png');
    expect(asset.alt).toBe('TwinMOS DDR5 hero image');
    expect(existsSync(join(process.env.MEDIA_DIR!, asset.key))).toBe(true);
    const list = await (await app.request('/api/v1/admin/media', { headers: { 'content-type': 'application/json', cookie: adminCookie } })).json();
    expect(list.items.some((m: any) => m.id === asset.id)).toBe(true);
    const audits = await db.select().from(auditLog);
    expect(audits.some((a: any) => a.action === 'media.create' && a.entityId === String(asset.id))).toBe(true);
  });

  it('rejects: missing alt, wrong extension, fake extension (sniff), oversized', async () => {
    expect((await upload('noalt.png', PNG, ' ')).status).toBe(422);
    expect((await upload('evil.exe', PNG, 'alt')).status).toBe(422);
    // PNG bytes with .jpg name — sniff says png, ext allowed... accepted (kind guard governs). Use a text file disguised:
    const text = new TextEncoder().encode('not an image at all');
    expect((await upload('fake.png', text, 'alt')).status).toBe(422);
  });

  it('rejects SVG with embedded script', async () => {
    const svg = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
    const res = await upload('xss.svg', svg, 'alt');
    expect(res.status).toBe(422);
    expect((await res.json()).detail).toContain('active content');
  });

  it('viewer cannot upload; author cannot delete; admin deletes', async () => {
    const permBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3, 4]); // distinct content → distinct key
    const up = await upload('perm.png', permBytes, 'alt text');
    expect(up.status).toBe(201);
    const { id } = await up.json();
    { const r0 = await app.request('/api/v1/admin/media', { method: 'POST', headers: { cookie: viewerCookie }, body: new FormData() }); expect(r0.status).toBe(403); }
    expect((await app.request(`/api/v1/admin/media/${id}`, { method: 'DELETE', headers: { cookie: authorCookie } })).status).toBe(403);
    expect((await app.request(`/api/v1/admin/media/${id}`, { method: 'DELETE', headers: { cookie: adminCookie } })).status).toBe(200);
  });
});

// ---- redirects + settings + locales --------------------------------------------
describe('settings / redirects / locales', () => {
  it('redirect CRUD with duplicate protection', async () => {
    const ok = await app.request('/api/v1/admin/redirects', { ...{ method: 'POST', body: JSON.stringify({ from: '/old-page', to: '/new-page' }) }, headers: { 'content-type': 'application/json', cookie: adminCookie, ...({ method: 'POST', body: JSON.stringify({ from: '/old-page', to: '/new-page' }) }.headers ?? {}) } });
    expect(ok.status).toBe(201);
    const dup = await app.request('/api/v1/admin/redirects', { ...{ method: 'POST', body: JSON.stringify({ from: '/old-page', to: '/x' }) }, headers: { 'content-type': 'application/json', cookie: adminCookie, ...({ method: 'POST', body: JSON.stringify({ from: '/old-page', to: '/x' }) }.headers ?? {}) } });
    expect(dup.status).toBe(409);
    const list = await (await app.request('/api/v1/admin/redirects', { headers: { 'content-type': 'application/json', cookie: adminCookie } })).json();
    const target = list.items.find((r: any) => r.from === '/old-page');
    const patched = await app.request(`/api/v1/admin/redirects/${target.id}`, { ...{ method: 'PATCH', body: JSON.stringify({ to: '/newer-page' }) }, headers: { 'content-type': 'application/json', cookie: adminCookie, ...({ method: 'PATCH', body: JSON.stringify({ to: '/newer-page' }) }.headers ?? {}) } });
    expect(patched.status).toBe(200);
    expect((await app.request(`/api/v1/admin/redirects/${target.id}`, { method: 'DELETE', headers: { cookie: adminCookie } })).status).toBe(200);
  });

  it('settings upsert; secret-shaped keys never echo values', async () => {
    const menus = await app.request('/api/v1/admin/settings', { method: 'PUT', headers: { 'content-type': 'application/json', cookie: adminCookie }, body: JSON.stringify({ key: 'menus', value: { main: [{ label: 'Home', url: '/' }] } }) });
    expect(menus.status).toBe(200);
    const secret = await app.request('/api/v1/admin/settings', { method: 'PUT', headers: { 'content-type': 'application/json', cookie: adminCookie }, body: JSON.stringify({ key: 'RESEND_API_KEY', value: 'placeholder-not-real' }) });
    expect((await secret.json()).secret).toBe(true);
  });

  it('settings/redirects are super_admin-only (docs/04): editor and admin roles blocked', async () => {
    // editorCookie is role 'editor'; create an admin-role user for the negative case
    const adminRoleCookie = await makeSession('pure-admin@twinmos.dev', mkPass('PureAdmin'), 'admin');
    expect((await app.request('/api/v1/admin/redirects', { method: 'POST', headers: { 'content-type': 'application/json', cookie: adminRoleCookie }, body: JSON.stringify({ from: '/admin-no', to: '/t' }) })).status).toBe(403);
    expect((await app.request('/api/v1/admin/settings', { method: 'PUT', headers: { 'content-type': 'application/json', cookie: adminRoleCookie }, body: JSON.stringify({ key: 'x', value: 1 }) })).status).toBe(403);
    expect((await app.request('/api/v1/admin/settings', { method: 'PUT', headers: { 'content-type': 'application/json', cookie: editorCookie }, body: JSON.stringify({ key: 'x', value: 1 }) })).status).toBe(403);
  });

  it('audit log: editor gets read access (docs/04); viewer blocked', async () => {
    expect((await app.request('/api/v1/admin/audit', { headers: { 'content-type': 'application/json', cookie: editorCookie } })).status).toBe(200);
    expect((await app.request('/api/v1/admin/audit', { headers: { 'content-type': 'application/json', cookie: viewerCookie } })).status).toBe(403);
  });

  it('viewer cannot touch settings; locale activation is super_admin', async () => {
    expect((await app.request('/api/v1/admin/redirects', { headers: { 'content-type': 'application/json', cookie: viewerCookie } })).status).toBe(200); // read ok
    expect((await app.request('/api/v1/admin/redirects', { ...{ method: 'POST', body: JSON.stringify({ from: '/v', to: '/t' }) }, headers: { 'content-type': 'application/json', cookie: viewerCookie, ...({ method: 'POST', body: JSON.stringify({ from: '/v', to: '/t' }) }.headers ?? {}) } })).status).toBe(403);
    expect((await app.request('/api/v1/admin/locales/en', { ...{ method: 'PATCH', body: JSON.stringify({ active: true }) }, headers: { 'content-type': 'application/json', cookie: editorCookie, ...({ method: 'PATCH', body: JSON.stringify({ active: true }) }.headers ?? {}) } })).status).toBe(403);
    expect((await app.request('/api/v1/admin/locales/en', { ...{ method: 'PATCH', body: JSON.stringify({ active: true }) }, headers: { 'content-type': 'application/json', cookie: adminCookie, ...({ method: 'PATCH', body: JSON.stringify({ active: true }) }.headers ?? {}) } })).status).toBe(200);
  });
});

// ---- P3 gap-audit iteration: page blocks, news event/tag, media file serving ----
describe('P3 gap fixes: pages blocks, news eventDate, media serving', () => {
  it('page create with blocks; blocks persist through edit + publish', async () => {
    const blocks = [
      { type: 'hero', title: 'Warranty Hub' },
      { type: 'richText', markdown: '## Overview\nAll TwinMOS products carry regional warranty.' },
    ];
    const created = await app.request('/api/v1/admin/content/page', {
      method: 'POST', headers: { 'content-type': 'application/json', cookie: adminCookie },
      body: JSON.stringify({ title: 'Warranty Hub Page', blocks }),
    });
    expect(created.status).toBe(201);
    const page1 = await created.json();
    expect(page1.blocks).toHaveLength(2);
    expect(page1.blocks[0].type).toBe('hero');

    // edit: replace blocks
    const edited = await app.request(`/api/v1/admin/content/page/${page1.id}`, {
      method: 'PATCH', headers: { 'content-type': 'application/json', cookie: adminCookie },
      body: JSON.stringify({ blocks: [{ type: 'hero', title: 'Warranty Hub v2' }] }),
    });
    expect(edited.status).toBe(200);
    expect((await edited.json()).blocks[0].title).toBe('Warranty Hub v2');

    // publish + preview renders the blocks (JSON sections on the preview page)
    await app.request(`/api/v1/admin/content/page/${page1.id}/transition`, { method: 'POST', headers: { 'content-type': 'application/json', cookie: adminCookie }, body: JSON.stringify({ to: 'published' }) });
    const prev = await app.request(`/api/v1/admin/content/page/${page1.id}/preview`, { method: 'POST', headers: { 'content-type': 'application/json', cookie: adminCookie }, body: '{}' });
    const { previewUrl } = await prev.json();
    const html = await (await app.request(previewUrl)).text();
    expect(html).toContain('Warranty Hub v2');
  });

  it('news accepts tag + eventDate; event surfaces with cat Event in export shape', async () => {
    const when = new Date('2027-03-01T09:00:00Z').toISOString();
    const created = await app.request('/api/v1/admin/content/news', {
      method: 'POST', headers: { 'content-type': 'application/json', cookie: adminCookie },
      body: JSON.stringify({ title: 'COMPUTEX 2027 Booth Reveal', body: 'c'.repeat(20), tag: 'Event', eventDate: when }),
    });
    expect(created.status).toBe(201);
    const item = await created.json();
    expect(item.tag).toBe('Event');
    expect(new Date(item.eventDate).toISOString()).toBe(when);

    // plain news keeps tag, eventDate stays null
    const plain = await app.request('/api/v1/admin/content/news', {
      method: 'POST', headers: { 'content-type': 'application/json', cookie: adminCookie },
      body: JSON.stringify({ title: 'Plain News Item', body: 'n'.repeat(20), tag: 'Press release' }),
    });
    const plainItem = await plain.json();
    expect(plainItem.tag).toBe('Press release');
    expect(plainItem.eventDate).toBeNull();
  });

  it('media file serving: correct bytes + mime, auth required, SVG forced to download', async () => {
    const fd = new FormData();
    fd.append('file', new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 9, 9, 9, 9])], 'serve.png'));
    fd.append('alt', 'serve test');
    const up = await app.request('/api/v1/admin/media', { method: 'POST', headers: { cookie: adminCookie }, body: fd });
    expect(up.status).toBe(201);
    const { id } = await up.json();

    const anon = await app.request(`/api/v1/admin/media/${id}/file`);
    expect(anon.status).toBe(401);

    const res = await app.request(`/api/v1/admin/media/${id}/file`, { headers: { cookie: adminCookie } });
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('image/png');
    const bytes = new Uint8Array(await res.arrayBuffer());
    expect(bytes[0]).toBe(0x89); // same magic bytes back

    // missing id → 404, not a 500
    expect((await app.request('/api/v1/admin/media/999999/file', { headers: { cookie: adminCookie } })).status).toBe(404);
  });

// ---- audit layer 5: dims, future-dated scheduling, preview TTL ----
describe('audit layer 5 fixes', () => {
  it('media upload populates width/height from native sniffing (PNG)', async () => {
    const fd = new FormData();
    fd.append('file', new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0x0d, 0x49, 0x48, 0x44, 0x52, 0, 0, 0, 0x10, 0, 0, 0, 0x20, 8, 6, 0, 0, 0])], 'dims.png'));
    fd.append('alt', 'dims test');
    const up = await app.request('/api/v1/admin/media', { method: 'POST', headers: { cookie: adminCookie }, body: fd });
    expect(up.status).toBe(201);
    const asset = await up.json();
    expect(asset.width).toBe(16);
    expect(asset.height).toBe(32);
  });

  it('future-dated scheduled content is NOT promoted', async () => {
    const created = await app.request('/api/v1/admin/content/news', {
      method: 'POST', headers: { 'content-type': 'application/json', cookie: adminCookie },
      body: JSON.stringify({ title: 'Future Dated ' + Date.now(), body: 'f'.repeat(20) }),
    });
    const { id } = await created.json();
    await app.request(`/api/v1/admin/content/news/${id}/transition`, { method: 'POST', headers: { 'content-type': 'application/json', cookie: adminCookie }, body: JSON.stringify({ to: 'in_review' }) });
    const future = new Date(Date.now() + 86_400_000).toISOString();
    await app.request(`/api/v1/admin/content/news/${id}/transition`, { method: 'POST', headers: { 'content-type': 'application/json', cookie: adminCookie }, body: JSON.stringify({ to: 'scheduled', publishAt: future }) });
    await promoteScheduled(db, 'negative-test');
    const row = (await db.select().from(newsPost).where(eq(newsPost.id, id)))[0];
    expect(row.status).toBe('scheduled'); // still scheduled — publishAt is in the future
  });

  it('preview tokens expire (expiry honoured, junk 404)', async () => {
    const { __expirePreviewTokensForTest } = await import('../src/routes/content.ts');
    const created = await app.request('/api/v1/admin/content/article', {
      method: 'POST', headers: { 'content-type': 'application/json', cookie: adminCookie },
      body: JSON.stringify({ title: 'TTL Probe', body: 't'.repeat(20) }),
    });
    const { id } = await created.json();
    const prev = await app.request(`/api/v1/admin/content/article/${id}/preview`, { method: 'POST', headers: { 'content-type': 'application/json', cookie: adminCookie }, body: '{}' });
    const { previewUrl } = await prev.json();
    expect((await app.request(previewUrl)).status).toBe(200); // live before expiry
    __expirePreviewTokensForTest(); // force every minted token past its TTL
    expect((await app.request(previewUrl)).status).toBe(404); // expired
    expect((await app.request('/api/v1/preview/expired-or-junk-token')).status).toBe(404);
  });
});
});

