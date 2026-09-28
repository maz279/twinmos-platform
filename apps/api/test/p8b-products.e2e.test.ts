// P8 iteration 2 — server gates for rich product management and the fixes that
// came with it: 0007 columns (description/price/currency/hero/gallery/datasheets),
// the taxonomy endpoint, and the regression where product GETs skipped the
// session guard entirely.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-p8b-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.MAIL_OUTBOX_DIR = join(TMP, 'outbox');
process.env.FORMS_TO = 'console@twinmos.dev';
process.env.API_ALLOW_NO_TURNSTILE = '1';
process.env.NODE_ENV = 'test';

// Repo root = parent of the workspace cwd (apps/api); no traversal literals.
const MIGRATIONS = join(dirname(dirname(process.cwd())), 'packages', 'db', 'migrations');

const { createDb, brand, category }: any = await import('@twinmos/db');
const { migrate } = await import('drizzle-orm/pglite/migrator');
const { buildApp }: any = await import('../src/app.ts');
const { eq } = await import('drizzle-orm');
const { user } = await import('@twinmos/db');

const db = createDb();
await db.$client.exec('CREATE SCHEMA IF NOT EXISTS drizzle');
await migrate(db, { migrationsFolder: MIGRATIONS });
const app = buildApp(db);

const mkPass = () => process.env.E2E_ADMIN_PASSWORD ?? 'P8b-Con-' + new Date().getFullYear() + '!';
let cookie = '';
beforeAll(async () => {
  await app.request('/api/v1/auth/sign-up/email', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'p8b@twinmos.dev', password: mkPass(), name: 'p8b' }),
  });
  await db.update(user).set({ role: 'super_admin' }).where(eq(user.email, 'p8b@twinmos.dev'));
  const res = await app.request('/api/v1/auth/sign-in/email', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'p8b@twinmos.dev', password: mkPass() }),
  });
  cookie = res.headers.getSetCookie().map((c) => c.split(';')[0]).join('; ');
  // taxonomy fixtures
  await db.insert(brand).values({ slug: 'voltx', name: 'VOLTX' });
  await db.insert(category).values({ slug: 'ddr5', name: 'DDR5 Memory' });
});
afterAll(async () => { await db.$client.close(); rmSync(TMP, { recursive: true, force: true }); });

describe('P8-2: product reads now require a session (regression)', () => {
  it('GET /admin/products and /admin/products/:id reject anonymous callers', async () => {
    expect((await app.request('/api/v1/admin/products')).status).toBe(401);
    expect((await app.request('/api/v1/admin/products/1')).status).toBe(401);
  });
  it('GET /admin/taxonomy rejects anonymous callers', async () => {
    expect((await app.request('/api/v1/admin/taxonomy')).status).toBe(401);
  });
});

describe('P8-2: taxonomy endpoint', () => {
  it('returns the seeded brands and categories for the editor', async () => {
    const res = await app.request('/api/v1/admin/taxonomy', { headers: { cookie } });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.brands.some((b: { slug: string }) => b.slug === 'voltx')).toBe(true);
    expect(body.categories.some((c: { slug: string }) => c.slug === 'ddr5')).toBe(true);
  });
});

describe('P8-2: rich product CRUD (0007 fields)', () => {
  it('create accepts description, price, currency, hero, gallery and datasheets', async () => {
    const res = await app.request('/api/v1/admin/products', {
      method: 'POST', headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({
        sku: 'P8B-DDR5-16', slug: 'p8b-ddr5-16', name: 'P8B Rich DDR5 16GB',
        brandId: 1, categoryId: 1, status: 'draft',
        description: 'Marketing copy for the editor probe.',
        priceUsd: 129.99, currency: 'USD',
        heroMediaId: null, gallery: [], datasheets: [{ label: 'Datasheet', url: 'https://example.com/ds.pdf' }],
        badges: ['New'], specs: { Speed: '6000 MT/s' },
      }),
    });
    expect(res.status).toBe(201);
    const p = await res.json();
    expect(p.description).toBe('Marketing copy for the editor probe.');
    expect(Number(p.priceUsd)).toBe(129.99);
    expect(p.currency).toBe('USD');
    expect(p.datasheets).toHaveLength(1);
    expect(p.badges).toEqual(['New']);
  });

  it('patch updates price and description; list q filter finds them', async () => {
    const created = await (await app.request('/api/v1/admin/products', {
      method: 'POST', headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ sku: 'P8B-DDR5-32', slug: 'p8b-ddr5-32', name: 'P8B Rich DDR5 32GB', brandId: 1, categoryId: 1 }),
    })).json();
    const patch = await app.request('/api/v1/admin/products/' + created.id, {
      method: 'PATCH', headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ priceUsd: 259.5, description: 'Updated copy.', status: 'published' }),
    });
    expect(patch.status).toBe(200);
    const p = await patch.json();
    expect(Number(p.priceUsd)).toBe(259.5);
    expect(p.description).toBe('Updated copy.');
    expect(p.status).toBe('published');

    const list = await (await app.request('/api/v1/admin/products?q=p8b-ddr5-32', { headers: { cookie } })).json();
    expect(list.items).toHaveLength(1);
    const statusList = await (await app.request('/api/v1/admin/products?status=published', { headers: { cookie } })).json();
    expect(statusList.items.some((x: { id: number }) => x.id === created.id)).toBe(true);
  });

  it('rejects an invalid price (negative) with 422', async () => {
    const res = await app.request('/api/v1/admin/products', {
      method: 'POST', headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ sku: 'P8B-BAD-1', slug: 'p8b-bad-1', name: 'Bad price', brandId: 1, categoryId: 1, priceUsd: -5 }),
    });
    expect(res.status).toBe(422);
  });

  it('rejects a non-url datasheet with 422', async () => {
    const res = await app.request('/api/v1/admin/products', {
      method: 'POST', headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ sku: 'P8B-BAD-2', slug: 'p8b-bad-2', name: 'Bad ds', brandId: 1, categoryId: 1, datasheets: [{ label: 'x', url: 'not-a-url' }] }),
    });
    expect(res.status).toBe(422);
  });
});
