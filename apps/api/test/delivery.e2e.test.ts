import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-delivery-test-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.NODE_ENV = 'test';
process.env.BETTER_AUTH_SECRET = 'test-secret-twinmos-delivery-key-12345';

const { createDb, page, product, article, brand, category }: any = await import('@twinmos/db');
const { migrate } = await import('drizzle-orm/pglite/migrator');
const { buildApp }: any = await import('../src/app.ts');
const { createPreviewToken }: any = await import('../src/routes/delivery/preview.ts');

describe('Delivery API (Phase B Task B3 -> DLV-01)', () => {
  let app: any;
  let db: any;

  beforeAll(async () => {
    db = createDb();
    await db.$client.exec('CREATE SCHEMA IF NOT EXISTS drizzle');
    await migrate(db, { migrationsFolder: '../../packages/db/migrations' });
    app = buildApp(db);

    // Seed dummy brand & category for products foreign keys
    await db.insert(brand).values({ name: 'TwinMOS', slug: 'twinmos' });
    await db.insert(category).values({ name: 'DRAM Modules', slug: 'dram-modules' });

    // Seed test published and draft records
    await db.insert(page).values([
      {
        slug: 'test-delivery-published',
        title: 'Test Published Page',
        locale: 'en',
        status: 'published',
        blocks: [{ type: 'hero', title: 'Hello World' }],
      },
      {
        slug: 'test-delivery-draft',
        title: 'Test Draft Page',
        locale: 'en',
        status: 'draft',
        blocks: [{ type: 'hero', title: 'Draft Content' }],
      },
    ]);

    await db.insert(product).values([
      {
        sku: 'TEST-DLV-01',
        slug: 'test-product-published',
        name: 'Test Published Product',
        brandId: 1,
        categoryId: 1,
        status: 'published',
        priceUsd: 99,
        currency: 'USD',
      },
      {
        sku: 'TEST-DLV-02',
        slug: 'test-product-draft',
        name: 'Test Draft Product',
        brandId: 1,
        categoryId: 1,
        status: 'draft',
        priceUsd: 149,
        currency: 'USD',
      },
    ]);
  });

  afterAll(() => {
    try {
      rmSync(TMP, { recursive: true, force: true });
    } catch {}
  });

  it('serves published pages with 200, public cache headers and Cache-Tag', async () => {
    const res = await app.request('/api/v1/delivery/pages/test-delivery-published');
    expect(res.status).toBe(200);

    const cacheHeader = res.headers.get('cache-control');
    expect(cacheHeader).toContain('public');
    expect(cacheHeader).toContain('s-maxage=300');

    const cacheTag = res.headers.get('cache-tag');
    expect(cacheTag).toContain('pages');
    expect(cacheTag).toContain('page:test-delivery-published');

    const body = await res.json();
    expect(body.data.slug).toBe('test-delivery-published');
    expect(body.data.status).toBe('published');
    expect(body.meta.isPreview).toBe(false);
  });

  it('strictly conceals draft pages from public access (returns 404)', async () => {
    const res = await app.request('/api/v1/delivery/pages/test-delivery-draft');
    expect(res.status).toBe(404);
  });

  it('unlocks draft page with a valid, scoped preview token, forcing private no-store and noindex', async () => {
    const token = createPreviewToken('page', 999, 'test-delivery-draft', 300);
    const res = await app.request(`/api/v1/delivery/pages/test-delivery-draft?preview=${token}`);
    expect(res.status).toBe(200);

    const cacheHeader = res.headers.get('cache-control');
    expect(cacheHeader).toContain('private');
    expect(cacheHeader).toContain('no-store');

    const robotsHeader = res.headers.get('x-robots-tag');
    expect(robotsHeader).toContain('noindex');

    const body = await res.json();
    expect(body.data.slug).toBe('test-delivery-draft');
    expect(body.data.status).toBe('draft');
    expect(body.meta.isPreview).toBe(true);
  });

  it('rejects expired or mismatched preview tokens with 404', async () => {
    // Expired token (ttl = -10)
    const expiredToken = createPreviewToken('page', 999, 'test-delivery-draft', -10);
    const res1 = await app.request(`/api/v1/delivery/pages/test-delivery-draft?preview=${expiredToken}`);
    expect(res1.status).toBe(404);

    // Mismatched entity token (token for product, used on page)
    const wrongEntityToken = createPreviewToken('product', 999, 'other-product', 300);
    const res2 = await app.request(`/api/v1/delivery/pages/test-delivery-draft?preview=${wrongEntityToken}`);
    expect(res2.status).toBe(404);
  });

  it('serves published products and hides draft products unless previewed', async () => {
    const resPub = await app.request('/api/v1/delivery/products/test-product-published');
    expect(resPub.status).toBe(200);
    const bodyPub = await resPub.json();
    expect(bodyPub.data.slug).toBe('test-product-published');

    const resDraft = await app.request('/api/v1/delivery/products/test-product-draft');
    expect(resDraft.status).toBe(404);

    const token = createPreviewToken('product', 100, 'test-product-draft', 300);
    const resPreview = await app.request(`/api/v1/delivery/products/test-product-draft?preview=${token}`);
    expect(resPreview.status).toBe(200);
    const bodyPreview = await resPreview.json();
    expect(bodyPreview.data.slug).toBe('test-product-draft');
    expect(bodyPreview.meta.isPreview).toBe(true);
  });

  it('sitemap lists published URLs and strictly zero drafts', async () => {
    const res = await app.request('/api/v1/delivery/sitemap');
    expect(res.status).toBe(200);

    const body = await res.json();
    const locs: string[] = body.data.map((item: any) => item.loc);

    expect(locs.some((l: string) => l.includes('test-delivery-published'))).toBe(true);
    expect(locs.some((l: string) => l.includes('test-product-published'))).toBe(true);
    expect(locs.some((l: string) => l.includes('test-delivery-draft'))).toBe(false);
    expect(locs.some((l: string) => l.includes('test-product-draft'))).toBe(false);
  });

  it('responds with p95 < 50ms for single entity delivery reads', async () => {
    // Warm-up requests keep the first-request JIT cost out of the tail
    // percentiles; 50 samples make p95 stable on a loaded dev machine.
    for (let i = 0; i < 5; i++) {
      await app.request('/api/v1/delivery/pages/test-delivery-published');
    }
    const timings: number[] = [];
    for (let i = 0; i < 50; i++) {
      const start = performance.now();
      const res = await app.request('/api/v1/delivery/pages/test-delivery-published');
      expect(res.status).toBe(200);
      timings.push(performance.now() - start);
    }
    timings.sort((a, b) => a - b);
    const p95 = timings[Math.ceil(timings.length * 0.95) - 1];
    expect(p95).toBeLessThan(50);
  });
});
