import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-delivery-contract-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.NODE_ENV = 'test';
process.env.PREVIEW_SIGNING_KEY = 'test-signing-key-for-preview-contract-tests-32chars';
process.env.BETTER_AUTH_SECRET = 'test-signing-key-for-preview-contract-tests-32chars';

const {
  createDb,
  page,
  product,
  category,
  brand,
  article,
  newsPost,
  faq,
  setting,
  redirect,
  navMenu,
  navItem,
  glossaryTerm,
  office,
  testimonial,
  policyDocument,
  formDefinition,
  formField,
  compatibilityRule,
}: any = await import('@twinmos/db');
const { migrate } = await import('drizzle-orm/pglite/migrator');
const { buildApp }: any = await import('../src/app.ts');
const { createPreviewToken }: any = await import('../src/routes/delivery/preview.ts');

describe('Delivery API Contract & Preview Token Suite (MS3.1 / T3.1.2 / T3.1.4 / SEC-PREVIEW)', () => {
  let app: any;
  let db: any;

  beforeAll(async () => {
    db = createDb();
    await db.$client.exec('CREATE SCHEMA IF NOT EXISTS drizzle');
    await migrate(db, { migrationsFolder: '../../packages/db/migrations' });
    app = buildApp(db);

    // Seed master catalog fixtures
    const [b] = await db
      .insert(brand)
      .values({ name: 'TwinMOS Tech', slug: 'twinmos' })
      .returning();
    const [cat] = await db
      .insert(category)
      .values({ name: 'Solid State Drives', slug: 'ssd-drives' })
      .returning();

    // Seed published entities
    await db.insert(page).values([
      {
        slug: 'home',
        path: '/index',
        title: 'TwinMOS Home',
        locale: 'en',
        status: 'published',
        publishedAt: new Date(Date.now() - 3600_000),
      },
      {
        slug: 'draft-page',
        path: '/draft',
        title: 'Unpublished Draft Page',
        locale: 'en',
        status: 'draft',
      },
    ]);

    await db.insert(product).values([
      {
        sku: 'TM-SSD-01',
        slug: 'hyper-ssd-1tb',
        name: 'Hyper SSD 1TB',
        brandId: b.id,
        categoryId: cat.id,
        status: 'published',
        priceUsd: 89.99,
        currency: 'USD',
        shortSpec: 'NVMe Gen4 x4 M.2 2280',
        warranty: '5 Years',
        facets: { gen: 'Gen4', form: 'M.2', cap: '1TB' },
        launchDate: new Date(Date.now() - 3600_000),
      },
      {
        sku: 'TM-SSD-02',
        slug: 'hyper-ssd-2tb',
        name: 'Hyper SSD 2TB',
        brandId: b.id,
        categoryId: cat.id,
        status: 'published',
        priceUsd: 159.99,
        currency: 'USD',
        shortSpec: 'NVMe Gen4 x4 M.2 2280',
        warranty: '5 Years',
        facets: { gen: 'Gen4', form: 'M.2', cap: '2TB' },
        launchDate: new Date(Date.now() - 3600_000),
      },
      {
        sku: 'TM-SSD-ARCHIVED',
        slug: 'legacy-ssd-120gb',
        name: 'Legacy SSD 120GB',
        brandId: b.id,
        categoryId: cat.id,
        status: 'archived',
        priceUsd: 19.99,
        currency: 'USD',
      },
      {
        sku: 'TM-SSD-DRAFT',
        slug: 'prototype-gen5-4tb',
        name: 'Prototype Gen5 4TB',
        brandId: b.id,
        categoryId: cat.id,
        status: 'draft',
        priceUsd: 299.99,
        currency: 'USD',
      },
    ]);

    await db.insert(article).values([
      {
        slug: 'nvme-cooling-guide',
        title: 'NVMe Cooling Guide',
        locale: 'en',
        deck: 'How to keep your Gen4 SSD cool',
        body: 'Full content of the cooling guide.',
        status: 'published',
        category: 'Guide',
        publishAt: new Date(Date.now() - 3600_000),
      },
      {
        slug: 'internal-memo-draft',
        title: 'Internal Memo',
        locale: 'en',
        deck: 'Secret roadmap preview',
        body: 'Secret content',
        status: 'draft',
      },
    ]);

    await db.insert(newsPost).values([
      {
        slug: 'computex-2026-announcement',
        title: 'TwinMOS at Computex 2026',
        locale: 'en',
        body: 'Join us at booth M0412.',
        status: 'published',
        publishAt: new Date(Date.now() - 3600_000),
      },
    ]);

    await db.insert(faq).values([
      {
        groupKey: 'warranty',
        locale: 'en',
        question: 'What is the warranty period on SSDs?',
        answer: 'Up to 5 years depending on product series.',
        status: 'published',
        sort: 1,
      },
    ]);

    const [menu] = await db
      .insert(navMenu)
      .values({ code: 'header-main', title: 'Main Navigation', locale: 'en' })
      .returning();
    await db.insert(navItem).values([
      { menuId: menu.id, title: 'Products', url: '/shop.html', sort: 1 },
      { menuId: menu.id, title: 'Support', url: '/support.html', sort: 2 },
    ]);

    await db.insert(glossaryTerm).values([
      {
        term: 'NVMe',
        definition: 'Non-Volatile Memory Express specification.',
        letter: 'N',
        locale: 'en',
      },
    ]);

    await db.insert(office).values([
      {
        role: 'Global Headquarters',
        title: 'Dubai Global HQ',
        entity: 'TwinMOS Technologies FZE',
        address: 'Jebel Ali Free Zone, Dubai, UAE',
        locale: 'en',
        sort: 1,
      },
    ]);

    await db.insert(testimonial).values([
      {
        author: 'Chief Systems Architect',
        company: 'HyperScale Cloud',
        quote: 'TwinMOS reliability is unmatched.',
        locale: 'en',
        permissionFlag: true,
        sort: 1,
      },
    ]);

    await db.insert(policyDocument).values([
      {
        slug: 'privacy-policy',
        title: 'Privacy Policy',
        content: 'Privacy policy content...',
        locale: 'en',
        status: 'published',
      },
    ]);

    const [form] = await db
      .insert(formDefinition)
      .values({
        type: 'contact',
        title: 'Contact Us',
        routingEmail: 'sensitive-internal-routing@twinmos.com',
        isActive: true,
      })
      .returning();
    await db.insert(formField).values([
      {
        formId: form.id,
        name: 'email',
        label: 'Work Email',
        type: 'email',
        required: true,
        sort: 1,
      },
    ]);

    await db.insert(setting).values([
      { key: 'site_name', value: 'TwinMOS Global' },
      { key: 'site_url', value: 'https://www.twinmos.com' },
      { key: 'contact_email', value: 'info@twinmos.com' },
      { key: 'secret_master_database_url', value: 'postgres://admin:secret@internal-db:5432/twinmos' },
      { key: 'aws_s3_secret_access_key', value: 'AKIAIOSFODNN7EXAMPLESECRET' },
    ]);

    await db.insert(redirect).values([
      { from: '/old-ssd', to: '/shop.html?cat=ssd-drives', code: 301 },
    ]);

    await db.insert(compatibilityRule).values([
      {
        deviceBrand: 'Lenovo',
        deviceModel: 'ThinkPad X1 Carbon Gen 10',
        deviceType: 'laptop',
        memoryGen: 'DDR5',
        formFactor: 'SO-DIMM',
        maxGb: 32,
        notes: 'Supports PCIe Gen4 NVMe M.2 2280',
      },
    ]);
  });

  afterAll(() => {
    try {
      rmSync(TMP, { recursive: true, force: true });
    } catch {}
  });

  // --- 1. Response Headers & Cache-Tag Contracts (T3.1.2) ---

  it('CONTRACT: /pages carries Cache-Tag, X-Cache-Tags, and public Cache-Control', async () => {
    const res = await app.request('/api/v1/delivery/pages');
    expect(res.status).toBe(200);

    const cacheHeader = res.headers.get('cache-control');
    expect(cacheHeader).toContain('public');
    expect(cacheHeader).toContain('s-maxage=300');

    const cacheTag = res.headers.get('cache-tag');
    expect(cacheTag).toContain('pages');
    expect(cacheTag).toContain('pages:en');

    const xCacheTags = res.headers.get('x-cache-tags');
    expect(xCacheTags).toContain('pages');

    const body = await res.json();
    expect(body.data).toBeDefined();
    expect(body.meta.cacheTags).toContain('pages');
  });

  it('CONTRACT: /products carries Cache-Tag and meta.cacheTags', async () => {
    const res = await app.request('/api/v1/delivery/products');
    expect(res.status).toBe(200);

    const tag = res.headers.get('cache-tag');
    expect(tag).toContain('products');

    const body = await res.json();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.meta.cacheTags).toContain('products');
  });

  it('CONTRACT: /products/facets returns aggregated facet bag and cache headers', async () => {
    const res = await app.request('/api/v1/delivery/products/facets');
    expect(res.status).toBe(200);

    const tag = res.headers.get('cache-tag');
    expect(tag).toContain('products');
    expect(tag).toContain('facets');

    const body = await res.json();
    expect(body.data.total).toBeGreaterThan(0);
    expect(body.data.categories).toBeDefined();
    expect(body.data.capacities).toBeDefined();
  });

  it('CONTRACT: /products/compare returns compared products and compare cache tags', async () => {
    const res = await app.request('/api/v1/delivery/products/compare?slugs=hyper-ssd-1tb,hyper-ssd-2tb');
    expect(res.status).toBe(200);

    const tag = res.headers.get('cache-tag');
    expect(tag).toContain('products');
    expect(tag).toContain('compare');

    const body = await res.json();
    expect(body.data.length).toBe(2);
    expect(body.data[0].slug).toBe('hyper-ssd-1tb');
    expect(body.data[1].slug).toBe('hyper-ssd-2tb');
  });

  it('CONTRACT: /compatibility returns system upgrade rules with tags', async () => {
    const res = await app.request('/api/v1/delivery/compatibility?brand=Lenovo');
    expect(res.status).toBe(200);

    const tag = res.headers.get('cache-tag');
    expect(tag).toContain('compatibility');

    const body = await res.json();
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data[0].deviceBrand).toBe('Lenovo');
  });

  it('CONTRACT: /articles and /articles/:slug emit article cache tags', async () => {
    const resList = await app.request('/api/v1/delivery/articles');
    expect(resList.status).toBe(200);
    expect(resList.headers.get('cache-tag')).toContain('articles');

    const resSingle = await app.request('/api/v1/delivery/articles/nvme-cooling-guide');
    expect(resSingle.status).toBe(200);
    expect(resSingle.headers.get('cache-tag')).toContain('article:nvme-cooling-guide');
  });

  it('CONTRACT: /news and /news/:slug emit news cache tags', async () => {
    const res = await app.request('/api/v1/delivery/news/computex-2026-announcement');
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-tag')).toContain('news:computex-2026-announcement');
  });

  it('CONTRACT: /navigation and /navigation/:code emit nav and menu tags', async () => {
    const res = await app.request('/api/v1/delivery/navigation/header-main');
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-tag')).toContain('nav:header-main');
    const body = await res.json();
    expect(body.data.items.length).toBe(2);
  });

  it('CONTRACT: /settings strictly exposes allowlist only and conceals secrets', async () => {
    const res = await app.request('/api/v1/delivery/settings');
    expect(res.status).toBe(200);

    const body = await res.json();
    // Allow-listed public keys must be present
    expect(body.data.site_name).toBe('TwinMOS Global');
    expect(body.data.site_url).toBe('https://www.twinmos.com');
    expect(body.data.contact_email).toBe('info@twinmos.com');

    // Secrets MUST be completely absent
    expect(body.data.secret_master_database_url).toBeUndefined();
    expect(body.data.aws_s3_secret_access_key).toBeUndefined();
    expect(Object.keys(body.data).some((k) => k.includes('secret'))).toBe(false);
  });

  it('CONTRACT: /forms/:type strips routingEmail from public schema output', async () => {
    const res = await app.request('/api/v1/delivery/forms/contact');
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.data.type).toBe('contact');
    expect(body.data.fields.length).toBe(1);
    expect(body.data.routingEmail).toBeUndefined();
  });

  it('CONTRACT: /sitemap lists only published URLs with strict 0 drafts', async () => {
    const res = await app.request('/api/v1/delivery/sitemap');
    expect(res.status).toBe(200);

    const body = await res.json();
    const locs: string[] = body.data.map((item: any) => item.loc);

    expect(locs.some((l) => l.includes('hyper-ssd-1tb'))).toBe(true);
    expect(locs.some((l) => l.includes('prototype-gen5-4tb'))).toBe(false);
    expect(locs.some((l) => l.includes('legacy-ssd-120gb'))).toBe(false);
    expect(locs.some((l) => l.includes('draft-page'))).toBe(false);
    expect(locs.some((l) => l.includes('internal-memo-draft'))).toBe(false);
  });

  it('CONTRACT: /search/suggest returns search suggestions with type and url', async () => {
    const res = await app.request('/api/v1/delivery/search/suggest?q=ssd');
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.suggestions.length).toBeGreaterThan(0);
    expect(body.suggestions[0].type).toBe('product');
    expect(body.suggestions[0].url).toContain('hyper-ssd');
  });

  it('CONTRACT: /search returns paginated results with facet counts', async () => {
    const res = await app.request('/api/v1/delivery/search?q=hyper');
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.total).toBe(2);
    expect(body.facets.product).toBe(2);
    expect(body.results.length).toBe(2);
  });

  // --- 2. Preview Token Security Contracts (T3.1.4 / SEC-PREVIEW / Z-01) ---

  it('SEC-PREVIEW: Valid token unlocks draft page with private no-store headers', async () => {
    const token = createPreviewToken('page', 999, 'draft-page', 300);
    const res = await app.request(`/api/v1/delivery/pages/draft-page?preview=${token}`);
    expect(res.status).toBe(200);

    const cacheHeader = res.headers.get('cache-control');
    expect(cacheHeader).toContain('private');
    expect(cacheHeader).toContain('no-store');

    const robotsHeader = res.headers.get('x-robots-tag');
    expect(robotsHeader).toContain('noindex');

    const body = await res.json();
    expect(body.data.slug).toBe('draft-page');
    expect(body.meta.isPreview).toBe(true);
  });

  it('SEC-PREVIEW: Reject token when entityType does not match (page token used on product)', async () => {
    const pageToken = createPreviewToken('page', 999, 'prototype-gen5-4tb', 300);
    const res = await app.request(`/api/v1/delivery/products/prototype-gen5-4tb?preview=${pageToken}`);
    expect(res.status).toBe(404);
  });

  it('SEC-PREVIEW: Reject token when slug does not match (token for slug A used on slug B)', async () => {
    const wrongSlugToken = createPreviewToken('product', 999, 'other-different-slug', 300);
    const res = await app.request(`/api/v1/delivery/products/prototype-gen5-4tb?preview=${wrongSlugToken}`);
    expect(res.status).toBe(404);
  });

  it('SEC-PREVIEW: Reject expired preview token (exp < now)', async () => {
    const expiredToken = createPreviewToken('product', 999, 'prototype-gen5-4tb', -60);
    const res = await app.request(`/api/v1/delivery/products/prototype-gen5-4tb?preview=${expiredToken}`);
    expect(res.status).toBe(404);
  });

  it('SEC-PREVIEW: Reject tampered HMAC signature', async () => {
    const validToken = createPreviewToken('product', 999, 'prototype-gen5-4tb', 300);
    const [payload, sig] = validToken.split('.');
    const tamperedSig = sig.slice(0, -4) + 'AAAA';
    const tamperedToken = `${payload}.${tamperedSig}`;

    const res = await app.request(`/api/v1/delivery/products/prototype-gen5-4tb?preview=${tamperedToken}`);
    expect(res.status).toBe(404);
  });

  it('SEC-PREVIEW: Reject tampered payload base64', async () => {
    const validToken = createPreviewToken('product', 999, 'prototype-gen5-4tb', 300);
    const [, sig] = validToken.split('.');
    const forgedPayload = Buffer.from(
      JSON.stringify({ entityType: 'product', entityId: 999, slug: 'prototype-gen5-4tb', exp: Math.floor(Date.now() / 1000) + 9999 })
    ).toString('base64url');
    const forgedToken = `${forgedPayload}.${sig}`;

    const res = await app.request(`/api/v1/delivery/products/prototype-gen5-4tb?preview=${forgedToken}`);
    expect(res.status).toBe(404);
  });

  it('SEC-PREVIEW: Archived products return 410 Gone on direct read', async () => {
    const res = await app.request('/api/v1/delivery/products/legacy-ssd-120gb');
    expect(res.status).toBe(410);
    const body = await res.json();
    expect(body.title).toBe('Product Archived');
  });
});
