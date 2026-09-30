// Phase 6 completion (§6 residual close-out) — gates for the three backend
// additions: RMA assignee (migration 0014 + PATCH /admin/rma/:id/assign +
// list/detail joins), the products category filter (three-level nav data
// leg), and RBAC on both.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-p15-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.MAIL_OUTBOX_DIR = join(TMP, 'outbox');
process.env.MEDIA_DIR = join(TMP, 'media');
process.env.FORMS_TO = 'console@twinmos.dev';
process.env.API_ALLOW_NO_TURNSTILE = '1';
process.env.NODE_ENV = 'test';

const MIGRATIONS = join(dirname(dirname(process.cwd())), 'packages', 'db', 'migrations');

const { createDb, user, brand, category, product, rmaRequest }: any = await import('@twinmos/db');
const { migrate } = await import('drizzle-orm/pglite/migrator');
const { buildApp }: any = await import('../src/app.ts');
const { eq } = await import('drizzle-orm');

const db = createDb();
await db.$client.exec('CREATE SCHEMA IF NOT EXISTS drizzle');
await migrate(db, { migrationsFolder: MIGRATIONS });
const app = buildApp(db);

const mkPass = () => process.env.E2E_ADMIN_PASSWORD ?? 'P15-Res-' + new Date().getFullYear() + '!';
let cookie = '';
const HDRS = () => ({ 'content-type': 'application/json', cookie });

beforeAll(async () => {
  await app.request('/api/v1/auth/sign-up/email', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'p15@twinmos.dev', password: mkPass(), name: 'p15' }),
  });
  await db.update(user).set({ role: 'super_admin' }).where(eq(user.email, 'p15@twinmos.dev'));
  const res = await app.request('/api/v1/auth/sign-in/email', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'p15@twinmos.dev', password: mkPass() }),
  });
  cookie = res.headers.getSetCookie().map((c) => c.split(';')[0]).join('; ');

  // taxonomy + two categories with one product each, for the filter leg
  await db.insert(brand).values({ slug: 'voltx', name: 'VOLTX' });
  const cats = await db.insert(category).values([
    { slug: 'dram', name: 'DRAM' }, { slug: 'ssd', name: 'SSD' },
  ]).returning();
  for (const [i, cat] of cats.entries()) {
    await db.insert(product).values({
      sku: `P15-PROD-${i}`, slug: `p15-prod-${i}`, name: `Probe ${cat.name}`,
      brandId: 1, categoryId: cat.id, status: 'draft',
    });
  }
  // one RMA case for the assignee leg
  await db.insert(rmaRequest).values({ number: 'P15-RMA-1', productSku: 'P15-PROD-0', issue: 'fails training', customer: {} });
});
afterAll(async () => { await db.$client.close(); rmSync(TMP, { recursive: true, force: true }); });

describe('P6-residual: products category filter (3-level nav data leg)', () => {
  it('filters the catalog list by taxonomy id', async () => {
    const cats = await db.select().from(category);
    const dram = cats.find((c: any) => c.slug === 'dram')!;
    const res = await app.request(`/api/v1/admin/products?category=${dram.id}`, { headers: { cookie } });
    expect(res.status).toBe(200);
    const items = (await res.json()).items;
    expect(items).toHaveLength(1);
    expect(items[0].sku).toBe('P15-PROD-0');
    expect((await (await app.request('/api/v1/admin/products', { headers: { cookie } })).json()).items.length).toBeGreaterThanOrEqual(2);
  });
  it('rejects anonymous callers as always', async () => {
    expect((await app.request('/api/v1/admin/products?category=1')).status).toBe(401);
  });
});

describe('P6-residual: RMA assignee (§6.6 card chip)', () => {
  let rmaId = 0;
  it('list joins the assignee email (null before assignment)', async () => {
    const res = await app.request('/api/v1/admin/rma', { headers: { cookie } });
    expect(res.status).toBe(200);
    const row = (await res.json()).items.find((x: any) => x.number === 'P15-RMA-1');
    rmaId = row.id;
    expect(row.assigneeId).toBeNull();
    expect(row.assigneeEmail).toBeNull();
  });

  it('PATCH /rma/:id/assign: 401 anon, 422 unknown staff, assigns + audits', async () => {
    expect((await app.request(`/api/v1/admin/rma/${rmaId}/assign`, {
      method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ assigneeId: 'no-such-user' }),
    })).status).toBe(401);

    const bad = await app.request(`/api/v1/admin/rma/${rmaId}/assign`, {
      method: 'PATCH', headers: HDRS(), body: JSON.stringify({ assigneeId: 'no-such-user' }),
    });
    expect(bad.status).toBe(422);

    const me = (await db.select({ id: user.id }).from(user).where(eq(user.email, 'p15@twinmos.dev')).limit(1))[0];
    const ok = await app.request(`/api/v1/admin/rma/${rmaId}/assign`, {
      method: 'PATCH', headers: HDRS(), body: JSON.stringify({ assigneeId: me.id }),
    });
    expect(ok.status).toBe(200);
    expect((await ok.json()).assigneeId).toBe(me.id);

    // the list join now resolves the email
    const list = await (await app.request('/api/v1/admin/rma', { headers: { cookie } })).json();
    const row = list.items.find((x: any) => x.number === 'P15-RMA-1');
    expect(row.assigneeEmail).toBe('p15@twinmos.dev');

    // detail carries it too
    const detail = await (await app.request(`/api/v1/admin/rma/${rmaId}`, { headers: { cookie } })).json();
    expect(detail.assigneeEmail).toBe('p15@twinmos.dev');

    // audited
    const audit = await (await app.request('/api/v1/admin/audit?entity=rma_request&action=rma.assign', { headers: { cookie } })).json();
    expect(audit.items.length).toBeGreaterThan(0);

    // null unassigns
    const un = await app.request(`/api/v1/admin/rma/${rmaId}/assign`, {
      method: 'PATCH', headers: HDRS(), body: JSON.stringify({ assigneeId: null }),
    });
    expect(un.status).toBe(200);
    expect((await un.json()).assigneeId).toBeNull();
  });

  it('404s on an unknown case', async () => {
    expect((await app.request('/api/v1/admin/rma/999999/assign', {
      method: 'PATCH', headers: HDRS(), body: JSON.stringify({ assigneeId: null }),
    })).status).toBe(404);
  });
});
