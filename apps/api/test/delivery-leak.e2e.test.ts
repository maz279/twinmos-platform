import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-delivery-leak-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.NODE_ENV = 'test';
process.env.PREVIEW_SIGNING_KEY = 'test-signing-key-for-leak-sweep-tests-32chars';
process.env.BETTER_AUTH_SECRET = 'test-signing-key-for-leak-sweep-tests-32chars';

const {
  createDb,
  page,
  product,
  category,
  brand,
  article,
  newsPost,
  faq,
  policyDocument,
}: any = await import('@twinmos/db');
const { migrate } = await import('drizzle-orm/pglite/migrator');
const { buildApp }: any = await import('../src/app.ts');
const { createPreviewToken }: any = await import('../src/routes/delivery/preview.ts');

describe('Delivery API Exhaustive Leak Sweep (MS3.1 / T3.1.5 / DLV-LEAK / Z-12)', () => {
  let app: any;
  let db: any;

  beforeAll(async () => {
    db = createDb();
    await db.$client.exec('CREATE SCHEMA IF NOT EXISTS drizzle');
    await migrate(db, { migrationsFolder: '../../packages/db/migrations' });
    app = buildApp(db);

    const [b] = await db
      .insert(brand)
      .values({ name: 'TwinMOS Leak Test', slug: 'twinmos-leak' })
      .returning();
    const [cat] = await db
      .insert(category)
      .values({ name: 'Memory Modules', slug: 'memory-leak' })
      .returning();

    const pastDate = new Date(Date.now() - 3600_000);
    const futureDate = new Date(Date.now() + 86400_000); // 1 day in future
    const deletedDate = new Date(Date.now() - 1800_000); // deleted 30 mins ago

    // 1. Pages seed (published, draft, scheduled, deleted)
    await db.insert(page).values([
      {
        slug: 'leak-page-published',
        path: '/leak-page-published',
        title: 'Visible Published Page',
        locale: 'en',
        status: 'published',
        publishedAt: pastDate,
      },
      {
        slug: 'leak-page-draft',
        path: '/leak-page-draft',
        title: 'Secret Draft Page',
        locale: 'en',
        status: 'draft',
      },
      {
        slug: 'leak-page-scheduled',
        path: '/leak-page-scheduled',
        title: 'Future Scheduled Page',
        locale: 'en',
        status: 'published',
        publishedAt: futureDate,
      },
      {
        slug: 'leak-page-deleted',
        path: '/leak-page-deleted',
        title: 'Soft Deleted Page',
        locale: 'en',
        status: 'published',
        publishedAt: pastDate,
        deletedAt: deletedDate,
      },
    ]);

    // 2. Products seed (published, draft, scheduled, archived, deleted)
    await db.insert(product).values([
      {
        sku: 'LEAK-PROD-PUB',
        slug: 'leak-product-published',
        name: 'Visible Published RAM',
        brandId: b.id,
        categoryId: cat.id,
        status: 'published',
        priceUsd: 49.99,
        currency: 'USD',
        launchDate: pastDate,
      },
      {
        sku: 'LEAK-PROD-DRAFT',
        slug: 'leak-product-draft',
        name: 'Secret Draft RAM',
        brandId: b.id,
        categoryId: cat.id,
        status: 'draft',
        priceUsd: 59.99,
        currency: 'USD',
      },
      {
        sku: 'LEAK-PROD-SCHED',
        slug: 'leak-product-scheduled',
        name: 'Future Scheduled RAM',
        brandId: b.id,
        categoryId: cat.id,
        status: 'published',
        priceUsd: 69.99,
        currency: 'USD',
        launchDate: futureDate,
      },
      {
        sku: 'LEAK-PROD-ARCH',
        slug: 'leak-product-archived',
        name: 'Archived Legacy RAM',
        brandId: b.id,
        categoryId: cat.id,
        status: 'archived',
        priceUsd: 19.99,
        currency: 'USD',
      },
      {
        sku: 'LEAK-PROD-DEL',
        slug: 'leak-product-deleted',
        name: 'Soft Deleted RAM',
        brandId: b.id,
        categoryId: cat.id,
        status: 'published',
        priceUsd: 79.99,
        currency: 'USD',
        launchDate: pastDate,
        deletedAt: deletedDate,
      },
    ]);

    // 3. Articles seed
    await db.insert(article).values([
      {
        slug: 'leak-article-published',
        title: 'Visible Published Article',
        locale: 'en',
        deck: 'Public summary',
        body: 'Public body',
        status: 'published',
        publishAt: pastDate,
      },
      {
        slug: 'leak-article-draft',
        title: 'Secret Draft Article',
        locale: 'en',
        deck: 'Draft summary',
        body: 'Draft body',
        status: 'draft',
      },
      {
        slug: 'leak-article-scheduled',
        title: 'Future Scheduled Article',
        locale: 'en',
        deck: 'Future summary',
        body: 'Future body',
        status: 'published',
        publishAt: futureDate,
      },
      {
        slug: 'leak-article-deleted',
        title: 'Soft Deleted Article',
        locale: 'en',
        deck: 'Deleted summary',
        body: 'Deleted body',
        status: 'published',
        publishAt: pastDate,
        deletedAt: deletedDate,
      },
    ]);

    // 4. News seed
    await db.insert(newsPost).values([
      {
        slug: 'leak-news-published',
        title: 'Visible Published News',
        locale: 'en',
        body: 'Public news',
        status: 'published',
        publishAt: pastDate,
      },
      {
        slug: 'leak-news-draft',
        title: 'Secret Draft News',
        locale: 'en',
        body: 'Draft news',
        status: 'draft',
      },
      {
        slug: 'leak-news-scheduled',
        title: 'Future Scheduled News',
        locale: 'en',
        body: 'Future news',
        status: 'published',
        publishAt: futureDate,
      },
      {
        slug: 'leak-news-deleted',
        title: 'Soft Deleted News',
        locale: 'en',
        body: 'Deleted news',
        status: 'published',
        publishAt: pastDate,
        deletedAt: deletedDate,
      },
    ]);

    // 5. FAQs seed
    await db.insert(faq).values([
      {
        groupKey: 'leak-test',
        locale: 'en',
        question: 'Visible FAQ?',
        answer: 'Yes, published.',
        status: 'published',
        sort: 1,
      },
      {
        groupKey: 'leak-test',
        locale: 'en',
        question: 'Secret Draft FAQ?',
        answer: 'No, draft.',
        status: 'draft',
        sort: 2,
      },
    ]);
  });

  afterAll(() => {
    try {
      rmSync(TMP, { recursive: true, force: true });
    } catch {}
  });

  // --- SWEEP 1: Pages Endpoint ---
  it('DLV-LEAK: /pages list conceals draft, scheduled, and deleted pages', async () => {
    const res = await app.request('/api/v1/delivery/pages');
    expect(res.status).toBe(200);

    const body = await res.json();
    const slugs = body.data.map((p: any) => p.slug);

    expect(slugs).toContain('leak-page-published');
    expect(slugs).not.toContain('leak-page-draft');
    expect(slugs).not.toContain('leak-page-scheduled');
    expect(slugs).not.toContain('leak-page-deleted');
  });

  it('DLV-LEAK: /pages/:slug direct read returns 404 for draft, scheduled, and deleted', async () => {
    const resDraft = await app.request('/api/v1/delivery/pages/leak-page-draft');
    expect(resDraft.status).toBe(404);

    const resSched = await app.request('/api/v1/delivery/pages/leak-page-scheduled');
    expect(resSched.status).toBe(404);

    const resDel = await app.request('/api/v1/delivery/pages/leak-page-deleted');
    expect(resDel.status).toBe(404);
  });

  it('DLV-LEAK: /pages/by-path returns 404 for draft, scheduled, and deleted', async () => {
    const resDraft = await app.request('/api/v1/delivery/pages/by-path?path=/leak-page-draft');
    expect(resDraft.status).toBe(404);

    const resSched = await app.request('/api/v1/delivery/pages/by-path?path=/leak-page-scheduled');
    expect(resSched.status).toBe(404);

    const resDel = await app.request('/api/v1/delivery/pages/by-path?path=/leak-page-deleted');
    expect(resDel.status).toBe(404);
  });

  // --- SWEEP 2: Products Endpoint ---
  it('DLV-LEAK: /products list conceals draft, scheduled, archived, and deleted products', async () => {
    const res = await app.request('/api/v1/delivery/products');
    expect(res.status).toBe(200);

    const body = await res.json();
    const slugs = body.data.map((p: any) => p.slug);

    expect(slugs).toContain('leak-product-published');
    expect(slugs).not.toContain('leak-product-draft');
    expect(slugs).not.toContain('leak-product-scheduled');
    expect(slugs).not.toContain('leak-product-archived');
    expect(slugs).not.toContain('leak-product-deleted');
  });

  it('DLV-LEAK: /products/facets count includes only published, non-deleted, non-scheduled products', async () => {
    const res = await app.request('/api/v1/delivery/products/facets');
    expect(res.status).toBe(200);

    const body = await res.json();
    // Only leak-product-published should be counted in this test suite
    expect(body.data.total).toBe(1);
  });

  it('DLV-LEAK: /products/:slug direct read returns 404 for draft, scheduled, and deleted', async () => {
    const resDraft = await app.request('/api/v1/delivery/products/leak-product-draft');
    expect(resDraft.status).toBe(404);

    const resSched = await app.request('/api/v1/delivery/products/leak-product-scheduled');
    expect(resSched.status).toBe(404);

    const resDel = await app.request('/api/v1/delivery/products/leak-product-deleted');
    expect(resDel.status).toBe(404);
  });

  // --- SWEEP 3: Articles Endpoint ---
  it('DLV-LEAK: /articles conceals draft, scheduled, and deleted articles', async () => {
    const res = await app.request('/api/v1/delivery/articles');
    expect(res.status).toBe(200);

    const body = await res.json();
    const slugs = body.data.map((a: any) => a.slug);

    expect(slugs).toContain('leak-article-published');
    expect(slugs).not.toContain('leak-article-draft');
    expect(slugs).not.toContain('leak-article-scheduled');
    expect(slugs).not.toContain('leak-article-deleted');

    const resDraft = await app.request('/api/v1/delivery/articles/leak-article-draft');
    expect(resDraft.status).toBe(404);

    const resSched = await app.request('/api/v1/delivery/articles/leak-article-scheduled');
    expect(resSched.status).toBe(404);

    const resDel = await app.request('/api/v1/delivery/articles/leak-article-deleted');
    expect(resDel.status).toBe(404);
  });

  // --- SWEEP 4: News Endpoint ---
  it('DLV-LEAK: /news conceals draft, scheduled, and deleted news posts', async () => {
    const res = await app.request('/api/v1/delivery/news');
    expect(res.status).toBe(200);

    const body = await res.json();
    const slugs = body.data.map((n: any) => n.slug);

    expect(slugs).toContain('leak-news-published');
    expect(slugs).not.toContain('leak-news-draft');
    expect(slugs).not.toContain('leak-news-scheduled');
    expect(slugs).not.toContain('leak-news-deleted');
  });

  // --- SWEEP 5: FAQs Endpoint ---
  it('DLV-LEAK: /faqs strictly returns 0 draft or non-published FAQs', async () => {
    const res = await app.request('/api/v1/delivery/faqs?groupKey=leak-test');
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.data.length).toBe(1);
    expect(body.data[0].question).toBe('Visible FAQ?');
    expect(body.data.some((f: any) => f.status === 'draft')).toBe(false);
  });

  // --- SWEEP 6: Sitemap Endpoint ---
  it('DLV-LEAK: /sitemap strictly excludes all draft, scheduled, archived, and deleted rows', async () => {
    const res = await app.request('/api/v1/delivery/sitemap');
    expect(res.status).toBe(200);

    const body = await res.json();
    const locs: string[] = body.data.map((item: any) => item.loc);

    // Visible published entities
    expect(locs.some((l) => l.includes('leak-page-published'))).toBe(true);
    expect(locs.some((l) => l.includes('leak-product-published'))).toBe(true);
    expect(locs.some((l) => l.includes('leak-article-published'))).toBe(true);
    expect(locs.some((l) => l.includes('leak-news-published'))).toBe(true);

    // ZERO leaks of drafts
    expect(locs.some((l) => l.includes('leak-page-draft'))).toBe(false);
    expect(locs.some((l) => l.includes('leak-product-draft'))).toBe(false);
    expect(locs.some((l) => l.includes('leak-article-draft'))).toBe(false);
    expect(locs.some((l) => l.includes('leak-news-draft'))).toBe(false);

    // ZERO leaks of scheduled
    expect(locs.some((l) => l.includes('leak-page-scheduled'))).toBe(false);
    expect(locs.some((l) => l.includes('leak-product-scheduled'))).toBe(false);
    expect(locs.some((l) => l.includes('leak-article-scheduled'))).toBe(false);
    expect(locs.some((l) => l.includes('leak-news-scheduled'))).toBe(false);

    // ZERO leaks of soft-deleted
    expect(locs.some((l) => l.includes('leak-page-deleted'))).toBe(false);
    expect(locs.some((l) => l.includes('leak-product-deleted'))).toBe(false);
    expect(locs.some((l) => l.includes('leak-article-deleted'))).toBe(false);
    expect(locs.some((l) => l.includes('leak-news-deleted'))).toBe(false);

    // ZERO leaks of archived
    expect(locs.some((l) => l.includes('leak-product-archived'))).toBe(false);
  });

  // --- SWEEP 7: Search & Suggestions Endpoints ---
  it('DLV-LEAK: /search returns 0 draft, scheduled, archived, or deleted items', async () => {
    const res = await app.request('/api/v1/delivery/search?q=Secret');
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.total).toBe(0);
    expect(body.results.length).toBe(0);

    const resSched = await app.request('/api/v1/delivery/search?q=Future');
    expect(resSched.status).toBe(200);
    const bodySched = await resSched.json();
    expect(bodySched.total).toBe(0);

    const resDel = await app.request('/api/v1/delivery/search?q=Deleted');
    expect(resDel.status).toBe(200);
    const bodyDel = await resDel.json();
    expect(bodyDel.total).toBe(0);
  });

  // --- SWEEP 8: Preview Token Invariant — Zero Soft-Delete Leak ---
  it('DLV-LEAK: Valid preview token NEVER reveals soft-deleted records', async () => {
    // Generate valid preview token for the soft-deleted product
    const delProdToken = createPreviewToken('product', 999, 'leak-product-deleted', 300);
    const resProd = await app.request(
      `/api/v1/delivery/products/leak-product-deleted?preview=${delProdToken}`
    );
    expect(resProd.status).toBe(404);

    // Generate valid preview token for the soft-deleted page
    const delPageToken = createPreviewToken('page', 999, 'leak-page-deleted', 300);
    const resPage = await app.request(
      `/api/v1/delivery/pages/leak-page-deleted?preview=${delPageToken}`
    );
    expect(resPage.status).toBe(404);

    // Generate valid preview token for the soft-deleted article
    const delArtToken = createPreviewToken('article', 999, 'leak-article-deleted', 300);
    const resArt = await app.request(
      `/api/v1/delivery/articles/leak-article-deleted?preview=${delArtToken}`
    );
    expect(resArt.status).toBe(404);
  });
});
