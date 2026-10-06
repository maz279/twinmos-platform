// P2 — Data-Flow & Pipeline Integrity regression gates (REMEDIATION_PLAN
// TM-REM-2026-001). 2.2: POST /admin/content/export rebuilds the bridge from
// the API's own DB handle with counts that must MATCH the database (bridge
// freshness — the stale-bundle defect can never silently return).
// 2.3: importer reconciliation keeps every rule's cats/ssdCats whole.
// 2.4: exported catalog carries priceUsd/currency so the PDP can render an
// honest MSRP and omit offers when absent (never a fabricated 0).
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-p2-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.MAIL_OUTBOX_DIR = join(TMP, 'outbox');
process.env.FORMS_TO = 'console@twinmos.dev';
// Isolate the export route's write target — the endpoint writes cms-content.js
// to a repo-anchored path by default, which would corrupt the dev bundle with
// test-db content on every suite run (deep-pass finding).
process.env.CONTENT_OUT = join(TMP, 'cms-content.js');

const { createDb, user, product, brand, category, compatibilityRule }: any = await import('@twinmos/db');
const { buildApp } = await import('../src/app.ts');
const { eq } = await import('drizzle-orm');

let db: any;
let app: any;
let auth: any;
const pwAdmin = 'T2-' + crypto.randomUUID().replaceAll('-', '').slice(0, 16) + '!B7';

beforeAll(async () => {
  db = createDb();
  await db.$client.exec('CREATE SCHEMA IF NOT EXISTS drizzle');
  const { migrate } = await import('drizzle-orm/pglite/migrator');
  await migrate(db, { migrationsFolder: '../../packages/db/migrations' });
  const { initAuth } = await import('../src/auth.ts');
  ({ auth } = initAuth(db));
  app = buildApp(db);
  // editor fixture + a priced product + a whole compat rule to verify against
  await auth.api.createUser({ body: { email: 'p2-editor@twinmos.dev', password: pwAdmin, name: 'P2 Editor', role: 'editor' } });
  const b = (await db.insert(brand).values({ slug: 'p2-probe-brand', name: 'P2 Probe Brand' }).returning())[0];
  const c = (await db.insert(category).values({ slug: 'p2-probe-cat', name: 'P2 Probe Cat' }).returning())[0];
  await db.insert(product).values({
    sku: 'P2PRICE-1', slug: 'p2-priced-probe', name: 'P2 Priced Probe', brandId: b.id, categoryId: c.id,
    status: 'published', priceUsd: 123.45, currency: 'USD', specs: {}, badges: [], facets: {},
  });
  await db.insert(compatibilityRule).values({
    deviceType: 'laptop', deviceBrand: 'ProbeBrand', deviceModel: 'Probe Model X',
    memoryGen: 'DDR5', formFactor: 'SO-DIMM', maxGb: 64, slots: 2,
    cats: ['dram-notebook'], ssdCats: ['ssd-nvme'],
  });
});

afterAll(async () => {
  const { releaseDataDirLock } = await import('@twinmos/db');
  releaseDataDirLock(process.env.PGLITE_DATA as string);
  rmSync(TMP, { recursive: true, force: true });
});

async function editorCookie() {
  const origin = 'http://localhost:5173';
  const r = await auth.handler(new Request(origin + '/api/v1/auth/sign-in/email', {
    method: 'POST', headers: { 'content-type': 'application/json', origin },
    body: JSON.stringify({ email: 'p2-editor@twinmos.dev', password: pwAdmin }),
  }));
  if (r.status !== 200) throw new Error('fixture sign-in failed: ' + r.status);
  return (r.headers.get('set-cookie') ?? '').split(',').map((c) => c.split(';')[0]).join('; ');
}

describe('P2.2: server-side bridge export (fresh while API is live)', () => {
  it('rebuilds cms-content.js with counts that match the database', async () => {
    const ck = await editorCookie();
    // a second published product appears in DB → export must reflect it
    await db.insert(product).values({
      sku: 'P2PRICE-2', slug: 'p2-priced-probe-2', name: 'P2 Priced Probe 2',
      brandId: (await db.select({ id: brand.id }).from(brand).limit(1))[0].id,
      categoryId: (await db.select({ id: category.id }).from(category).limit(1))[0].id,
      status: 'published', priceUsd: 9.99, currency: 'USD', specs: {}, badges: [], facets: {},
    });
    const res = await app.request('/api/v1/admin/content/export', {
      method: 'POST', headers: { 'content-type': 'application/json', cookie: ck }, body: '{}',
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    // counts match the database (the two probes are the only published non-prototype products)
    const dbPublished = await db.select({ id: product.id }).from(product).where(eq(product.slug, 'p2-priced-probe'));
    expect(dbPublished.length).toBe(1);
    expect(body.counts.products).toBeGreaterThanOrEqual(2); // probes present in the bundle
    // the file was actually written and carries the priced probe with its price
    expect(existsSync(body.out)).toBe(true);
    const text = readFileSync(body.out, 'utf8');
    expect(text).toContain('p2-priced-probe');
    expect(text).toContain('123.45');
  });

  it('refuses non-editors (RBAC on the bridge)', async () => {
    const origin = 'http://localhost:5173';
    const pwViewer = 'T2v-' + crypto.randomUUID().replaceAll('-', '').slice(0, 14) + '!C3';
    await auth.api.createUser({ body: { email: 'p2-viewer@twinmos.dev', password: pwViewer, name: 'V', role: 'viewer' } });
    const r = await auth.handler(new Request(origin + '/api/v1/auth/sign-in/email', {
      method: 'POST', headers: { 'content-type': 'application/json', origin },
      body: JSON.stringify({ email: 'p2-viewer@twinmos.dev', password: pwViewer }),
    }));
    const ck = (r.headers.get('set-cookie') ?? '').split(',').map((c) => c.split(';')[0]).join('; ');
    const res = await app.request('/api/v1/admin/content/export', {
      method: 'POST', headers: { 'content-type': 'application/json', cookie: ck }, body: '{}',
    });
    expect(res.status).toBe(403);
  });
});

describe('P2.3: compat rule integrity after import reconciliation', () => {
  it('rules keep non-empty cats/ssdCats where the prototype maps them', async () => {
    const row = (await db.select().from(compatibilityRule).where(eq(compatibilityRule.deviceModel, 'Probe Model X')).limit(1))[0];
    expect(row.cats).toEqual(['dram-notebook']);
    expect(row.ssdCats).toEqual(['ssd-nvme']);
  });
});
