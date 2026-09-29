// Phase 3 (TWN-ADMIN-CMS-AUDIT-PLAN-2026-001 §3) — catalog engineering gates:
//   3.1 product variants CRUD (+ RBAC, unique-SKU 409, audit, jsonb attrs)
//   3.2 QVL compatibility matrix CRUD (+ q/memoryGen filters)
//   3.3 bulk CSV import (dry-run report + transactional commit) / export / template
//   3.4 optimistic locking — If-Match 409 on product + content PATCH
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-p11-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.MAIL_OUTBOX_DIR = join(TMP, 'outbox');
process.env.FORMS_TO = 'console@twinmos.dev';
process.env.API_ALLOW_NO_TURNSTILE = '1';
process.env.NODE_ENV = 'test';

// Repo root = parent of the workspace cwd (apps/api); no traversal literals.
const MIGRATIONS = join(dirname(dirname(process.cwd())), 'packages', 'db', 'migrations');

const { createDb, brand, category, user }: any = await import('@twinmos/db');
const { migrate } = await import('drizzle-orm/pglite/migrator');
const { buildApp }: any = await import('../src/app.ts');
const { eq } = await import('drizzle-orm');

const db = createDb();
await db.$client.exec('CREATE SCHEMA IF NOT EXISTS drizzle');
await migrate(db, { migrationsFolder: MIGRATIONS });
const app = buildApp(db);

const mkPass = () => process.env.E2E_ADMIN_PASSWORD ?? 'P11-Cat-' + new Date().getFullYear() + '!';
let cookie = '';
let viewerCookie = '';
let productId = 0;
let articleId = 0;

const HDRS = () => ({ 'content-type': 'application/json', cookie });

beforeAll(async () => {
  await app.request('/api/v1/auth/sign-up/email', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'p11@twinmos.dev', password: mkPass(), name: 'p11' }),
  });
  await db.update(user).set({ role: 'super_admin' }).where(eq(user.email, 'p11@twinmos.dev'));
  const res = await app.request('/api/v1/auth/sign-in/email', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'p11@twinmos.dev', password: mkPass() }),
  });
  cookie = res.headers.getSetCookie().map((c) => c.split(';')[0]).join('; ');

  // viewer account for RBAC gates
  await app.request('/api/v1/auth/sign-up/email', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'p11v@twinmos.dev', password: mkPass() + 'v', name: 'p11v' }),
  });
  await db.update(user).set({ role: 'viewer' }).where(eq(user.email, 'p11v@twinmos.dev'));
  const res2 = await app.request('/api/v1/auth/sign-in/email', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'p11v@twinmos.dev', password: mkPass() + 'v' }),
  });
  viewerCookie = res2.headers.getSetCookie().map((c) => c.split(';')[0]).join('; ');

  // taxonomy + product + article fixtures
  await db.insert(brand).values({ slug: 'voltx', name: 'VOLTX' });
  await db.insert(category).values({ slug: 'ddr5', name: 'DDR5 Memory' });
  const pr = await app.request('/api/v1/admin/products', {
    method: 'POST', headers: HDRS(),
    body: JSON.stringify({ sku: 'VLT-DDR5-P11', slug: 'voltx-ddr5-p11', name: 'VOLTX DDR5 P11', brandId: 1, categoryId: 1, status: 'draft' }),
  });
  expect(pr.status).toBe(201);
  productId = (await pr.json()).id;

  const ar = await app.request('/api/v1/admin/content/article', {
    method: 'POST', headers: HDRS(),
    body: JSON.stringify({ title: 'P11 conflict probe', body: 'draft body' }),
  });
  expect([200, 201]).toContain(ar.status);
  articleId = (await ar.json()).id;
});
afterAll(async () => { await db.$client.close(); rmSync(TMP, { recursive: true, force: true }); });

// ---------------- 3.1 product variants ----------------
describe('P3.1: product variants CRUD', () => {
  it('rejects anonymous and viewer-role writes', async () => {
    expect((await app.request(`/api/v1/admin/products/${productId}/variants`)).status).toBe(401);
    const v = await app.request(`/api/v1/admin/products/${productId}/variants`, {
      method: 'POST', headers: { 'content-type': 'application/json', cookie: viewerCookie },
      body: JSON.stringify({ attrs: { capacity: '16GB' }, sku: 'VLT-DDR5-P11-16' }),
    });
    expect(v.status).toBe(403);
  });

  it('creates a variant with hardware attrs + per-variant pricing inside attrs', async () => {
    const res = await app.request(`/api/v1/admin/products/${productId}/variants`, {
      method: 'POST', headers: HDRS(),
      body: JSON.stringify({
        attrs: { capacity: '32GB', speed: '6000MT/s', finish: 'Titanium', lighting: 'RGB' },
        sku: 'VLT-DDR5-P11-32-RGB', priceUsd: 129.5, status: 'active', stock: 40,
      }),
    });
    expect(res.status).toBe(201);
    const v = await res.json();
    expect(v.sku).toBe('VLT-DDR5-P11-32-RGB');
    expect(v.attrs).toMatchObject({ capacity: '32GB', speed: '6000MT/s', priceUsd: 129.5, stock: 40, status: 'active' });
  });

  it('rejects a duplicate variant SKU with 409 (unique constraint surfaced)', async () => {
    const res = await app.request(`/api/v1/admin/products/${productId}/variants`, {
      method: 'POST', headers: HDRS(),
      body: JSON.stringify({ attrs: { capacity: '32GB' }, sku: 'VLT-DDR5-P11-32-RGB' }),
    });
    expect(res.status).toBe(409);
  });

  it('lists, patches (price/stock merge into attrs) and deletes', async () => {
    const list = await app.request(`/api/v1/admin/products/${productId}/variants`, { headers: { cookie } });
    expect(list.status).toBe(200);
    const items = (await list.json()).items;
    expect(items).toHaveLength(1);
    const id = items[0].id;

    const patch = await app.request(`/api/v1/admin/products/${productId}/variants/${id}`, {
      method: 'PATCH', headers: HDRS(),
      body: JSON.stringify({ priceUsd: 119, stock: 25, attrs: { finish: 'Black' } }),
    });
    expect(patch.status).toBe(200);
    const updated = await patch.json();
    expect(updated.attrs).toMatchObject({ finish: 'Black', speed: '6000MT/s', priceUsd: 119, stock: 25 });

    const del = await app.request(`/api/v1/admin/products/${productId}/variants/${id}`, { method: 'DELETE', headers: { cookie } });
    expect(del.status).toBe(200);
    const after = await app.request(`/api/v1/admin/products/${productId}/variants`, { headers: { cookie } });
    expect((await after.json()).items).toHaveLength(0);
  });

  it('writes audit rows for variant mutations', async () => {
    const res = await app.request('/api/v1/admin/audit?entity=product_variant', { headers: { cookie } });
    expect(res.status).toBe(200);
    const actions = (await res.json()).items.map((r: { action: string }) => r.action);
    expect(actions).toContain('product.variant.create');
    expect(actions).toContain('product.variant.update');
    expect(actions).toContain('product.variant.delete');
  });
});

// ---------------- 3.2 compatibility matrix ----------------
describe('P3.2: QVL compatibility matrix CRUD', () => {
  let ruleId = 0;
  it('rejects anonymous access', async () => {
    expect((await app.request('/api/v1/admin/compatibility')).status).toBe(401);
  });
  it('creates a rule and lists it with q + memoryGen filters', async () => {
    const create = await app.request('/api/v1/admin/compatibility', {
      method: 'POST', headers: HDRS(),
      body: JSON.stringify({ deviceBrand: 'ASUS', deviceModel: 'ROG STRIX Z790-E', memoryGen: 'DDR5', formFactor: 'U-DIMM', maxGb: 128, notes: 'Validated up to 6400MT/s' }),
    });
    expect(create.status).toBe(201);
    ruleId = (await create.json()).id;

    const byQ = await app.request('/api/v1/admin/compatibility?q=z790', { headers: { cookie } });
    expect((await byQ.json()).items.some((r: any) => r.id === ruleId)).toBe(true);
    const byGen = await app.request('/api/v1/admin/compatibility?memoryGen=DDR4', { headers: { cookie } });
    expect((await byGen.json()).items.some((r: any) => r.id === ruleId)).toBe(false);
  });
  it('patches and deletes rules (viewer blocked)', async () => {
    const forbidden = await app.request('/api/v1/admin/compatibility/' + ruleId, {
      method: 'PATCH', headers: { 'content-type': 'application/json', cookie: viewerCookie },
      body: JSON.stringify({ maxGb: 64 }),
    });
    expect(forbidden.status).toBe(403);

    const patch = await app.request('/api/v1/admin/compatibility/' + ruleId, {
      method: 'PATCH', headers: HDRS(), body: JSON.stringify({ maxGb: 192, notes: 'BIOS 1402+ for 192GB' }),
    });
    expect(patch.status).toBe(200);
    expect((await patch.json()).maxGb).toBe(192);

    expect((await app.request('/api/v1/admin/compatibility/' + ruleId, { method: 'DELETE', headers: { cookie } })).status).toBe(200);
    expect((await app.request('/api/v1/admin/compatibility/' + ruleId, { method: 'DELETE', headers: { cookie } })).status).toBe(404);
  });
});

// ---------------- 3.3 bulk import / export ----------------
const HEADER = 'sku,slug,name,brand,category,status,currency,priceUsd,description';
describe('P3.3: bulk CSV import, export and template', () => {
  it('serves the template and the catalog export as CSV', async () => {
    const tpl = await app.request('/api/v1/admin/products/import-template.csv', { headers: { cookie } });
    expect(tpl.status).toBe(200);
    expect((await tpl.text()).startsWith(HEADER)).toBe(true);

    const csv = await app.request('/api/v1/admin/products/export.csv', { headers: { cookie } });
    expect(csv.status).toBe(200);
    const text = await csv.text();
    expect(text.startsWith(HEADER)).toBe(true);
    expect(text).toContain('VLT-DDR5-P11');
  });

  it('dry-run reports line-level validation errors and create/update actions without writing', async () => {
    const csv = [
      HEADER,
      'VLT-DDR5-P11,voltx-ddr5-p11,VOLTX DDR5 P11 v2,voltx,ddr5,draft,USD,99.0,updated copy', // update (existing SKU)
      'VLT-NEW-1,voltx-new-1,VOLTX New Module,voltx,ddr5,draft,USD,,creates fine',             // create
      'bad sku!,bad-slug,Bad Row,voltx,ddr5,draft,USD,,',                                       // bad SKU
      'VLT-DUP,voltx-dup,First Dup,voltx,ddr5,draft,USD,,',                                      // dup in file (next line)
      'VLT-DUP,voltx-dup,Second Dup,voltx,ddr5,draft,USD,,',
      'VLT-BR,voltx-br,Bad Brand,nope-brand,ddr5,draft,USD,,',                                   // unknown brand
      'VLT-BDT,voltx-bdt,Bad Currency,voltx,ddr5,draft,BDT,10.0,',                              // prohibited currency
    ].join('\n');
    const res = await app.request('/api/v1/admin/products/import', {
      method: 'POST', headers: HDRS(), body: JSON.stringify({ csv, dryRun: true }),
    });
    expect(res.status).toBe(200);
    const report = await res.json();
    expect(report.dryRun).toBe(true);
    // valid: the update row, the create row, and the FIRST VLT-DUP occurrence
    // (only its second appearance is the in-file duplicate)
    expect(report.validCount).toBe(3);
    expect(report.createCount).toBe(2);
    expect(report.updateCount).toBe(1);
    const messages = report.errors.map((e: { message: string }) => e.message).join(' | ');
    expect(messages).toContain('SKU must be');
    expect(messages).toContain('Duplicate SKU VLT-DUP');
    expect(messages).toContain('Unknown brand slug "nope-brand"');
    expect(messages).toContain('no BDT');

    // nothing was written: the fixture price is unchanged
    const probe = await app.request('/api/v1/admin/products/' + productId, { headers: { cookie } });
    expect((await probe.json()).priceUsd).toBeNull();
  });

  it('commit is refused while errors remain, then commits transactionally and upserts', async () => {
    const badCsv = [HEADER, 'VLT-OK-1,voltx-ok-1,OK Row,voltx,ddr5,draft,USD,,', 'VLT-BAD2,voltx-bad2,Bad,nope,ddr5,draft,USD,,'].join('\n');
    const refused = await app.request('/api/v1/admin/products/import', {
      method: 'POST', headers: HDRS(), body: JSON.stringify({ csv: badCsv, dryRun: false }),
    });
    expect(refused.status).toBe(422);

    const goodCsv = [
      HEADER,
      'VLT-DDR5-P11,voltx-ddr5-p11,VOLTX DDR5 P11 v2,voltx,ddr5,draft,USD,99.0,updated via import',
      'VLT-IMP-NEW,voltx-imp-new,VOLTX Imported Module,voltx,ddr5,draft,EUR,55.5,created via import',
    ].join('\n');
    const res = await app.request('/api/v1/admin/products/import', {
      method: 'POST', headers: HDRS(), body: JSON.stringify({ csv: goodCsv, dryRun: false }),
    });
    expect(res.status).toBe(200);
    const report = await res.json();
    expect(report.committed).toBe(true);
    expect(report.createCount).toBe(1);
    expect(report.updateCount).toBe(1);

    const updated = await app.request('/api/v1/admin/products/' + productId, { headers: { cookie } });
    const u = await updated.json();
    expect(Number(u.priceUsd)).toBe(99);
    expect(u.description).toBe('updated via import');

    const created = await app.request('/api/v1/admin/products?q=VLT-IMP-NEW', { headers: { cookie } });
    expect((await created.json()).items).toHaveLength(1);

    const audit = await app.request('/api/v1/admin/audit?action=product.import', { headers: { cookie } });
    expect((await audit.json()).items.length).toBeGreaterThan(0);
  });

  it('rejects a wrong header outright', async () => {
    const res = await app.request('/api/v1/admin/products/import', {
      method: 'POST', headers: HDRS(), body: JSON.stringify({ csv: 'a,b,c\n1,2,3', dryRun: true }),
    });
    expect(res.status).toBe(422);
    expect((await res.text())).toContain('Header must be exactly');
  });
});

// ---------------- 3.4 optimistic locking ----------------
describe('P3.4: If-Match optimistic locking (409 on stale revision)', () => {
  it('product PATCH: stale If-Match → 409, fresh → 200, absent → 200', async () => {
    const stale = { method: 'PATCH', headers: { ...HDRS(), 'If-Match': '"2020-01-01T00:00:00.000Z"' }, body: JSON.stringify({ name: 'Stale overwrite' }) };
    expect((await app.request(`/api/v1/admin/products/${productId}`, stale)).status).toBe(409);

    const cur = await (await app.request(`/api/v1/admin/products/${productId}`, { headers: { cookie } })).json();
    const fresh = {
      method: 'PATCH',
      headers: { ...HDRS(), 'If-Match': '"' + new Date(cur.updatedAt).toISOString() + '"' },
      body: JSON.stringify({ badges: ['Imported'] }),
    };
    expect((await app.request(`/api/v1/admin/products/${productId}`, fresh)).status).toBe(200);

    const noHeader = { method: 'PATCH', headers: HDRS(), body: JSON.stringify({ badges: ['Imported', 'QVL'] }) };
    expect((await app.request(`/api/v1/admin/products/${productId}`, noHeader)).status).toBe(200);
  });

  it('content PATCH: stale If-Match → 409', async () => {
    const res = await app.request(`/api/v1/admin/content/article/${articleId}`, {
      method: 'PATCH',
      headers: { ...HDRS(), 'If-Match': '"2020-01-01T00:00:00.000Z"' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.title).toBe('Conflict');
  });
});
