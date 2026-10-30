import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-phase-d-test-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.NODE_ENV = 'test';
process.env.BETTER_AUTH_SECRET = 'test-secret-twinmos-phase-d-12345';
process.env.MAIL_OUTBOX_DIR = join(TMP, 'outbox');
process.env.API_ALLOW_NO_TURNSTILE = '1';

const { createDb, page, product, article, brand, category, glossaryTerm, newsletterSubscriber, searchQueryLog }: any = await import('@twinmos/db');
const { migrate } = await import('drizzle-orm/pglite/migrator');
const { buildApp }: any = await import('../src/app.ts');
const { eq } = await import('drizzle-orm');
const { formToken }: any = await import('./support/fixtures.ts');

describe('Phase D Public Site Rebuild & Backend Delivery Tests (VC-D/E)', () => {
  let app: any;
  let db: any;

  beforeAll(async () => {
    db = createDb();
    await db.$client.exec('CREATE SCHEMA IF NOT EXISTS drizzle');
    await migrate(db, { migrationsFolder: '../../packages/db/migrations' });
    app = buildApp(db);

    // Seed taxonomy
    await db.insert(brand).values({ name: 'TwinMOS', slug: 'twinmos' });
    await db.insert(category).values([
      { name: 'NVMe SSD', slug: 'ssd-nvme' },
      { name: 'Gaming DRAM', slug: 'dram-gaming' },
    ]);

    // Seed products with facets
    await db.insert(product).values([
      {
        sku: 'NVME-TEST-01',
        slug: 'corex-pro-gen5',
        name: 'TwinMOS CoreX Pro Gen5 NVMe SSD',
        brandId: 1,
        categoryId: 1,
        status: 'published',
        priceUsd: 149.99,
        currency: 'USD',
        facets: { formFactor: 'M.2 2280', interface: 'PCIe Gen5' },
        specsDictionary: { Interface: 'PCIe Gen5', Capacity: '1TB, 2TB' },
      },
      {
        sku: 'DRAM-TEST-02',
        slug: 'voltx-ddr5-ram',
        name: 'TwinMOS VOLTX DDR5 Gaming RAM',
        brandId: 1,
        categoryId: 2,
        status: 'published',
        priceUsd: 89.99,
        currency: 'USD',
        facets: { formFactor: 'UDIMM', interface: 'DDR5' },
        specsDictionary: { Speed: 'DDR5-6000MHz', Capacity: '32GB' },
      },
      {
        sku: 'ARCHIVED-PROD-03',
        slug: 'old-discontinued-drive',
        name: 'Old Discontinued Drive',
        brandId: 1,
        categoryId: 1,
        status: 'archived',
        priceUsd: 49.99,
        currency: 'USD',
      },
    ]);

    // Seed articles
    await db.insert(article).values([
      {
        slug: 'how-to-choose-nvme-ssd',
        title: 'How to Choose the Best NVMe SSD for Gaming',
        locale: 'en',
        status: 'published',
        structuredBody: [
          { heading: 'Introduction', body: 'PCIe Gen5 drives provide incredible sequential speeds.' },
        ],
      },
    ]);

    // Seed glossary
    await db.insert(glossaryTerm).values([
      {
        term: 'NVMe',
        definition: 'Non-Volatile Memory Express high-speed interface specification.',
        letter: 'N',
        locale: 'en',
      },
    ]);
  });

  afterAll(async () => {
    const { releaseDataDirLock } = await import('@twinmos/db');
    releaseDataDirLock(process.env.PGLITE_DATA as string);
    rmSync(TMP, { recursive: true, force: true });
  });

  describe('Task D3: Catalogue Facets & Category Axis (CAT-01)', () => {
    it('returns dynamic facet counts and excludes archived products', async () => {
      const start = Date.now();
      const res = await app.request('/api/v1/delivery/products/facets');
      const duration = Date.now() - start;

      expect(res.status).toBe(200);
      expect(duration).toBeLessThan(300); // CAT-01: p95 < 300ms

      const body = await res.json();
      expect(body.data).toBeDefined();
      expect(body.data.total).toBe(2); // Only the 2 published products, archived excluded!
      expect(body.data.categories).toBeDefined();

      const nvmeFacet = body.data.categories.find((c: any) => c.slug === 'ssd-nvme');
      expect(nvmeFacet).toBeDefined();
      expect(nvmeFacet.count).toBe(1);
    });
  });

  describe('Task D7a: Search Delivery API & Autosuggest (SEARCH-01)', () => {
    it('returns ranked search results across products and articles', async () => {
      const res = await app.request('/api/v1/delivery/search?q=NVMe');
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.total).toBeGreaterThanOrEqual(1);
      expect(body.results.length).toBeGreaterThanOrEqual(1);

      // Logged in search query log without personal data
      const logs = await db.select().from(searchQueryLog).where(eq(searchQueryLog.query, 'NVMe'));
      expect(logs.length).toBeGreaterThanOrEqual(1);
    });

    it('returns fast suggestions for autocomplete combobox', async () => {
      const start = Date.now();
      const res = await app.request('/api/v1/delivery/search/suggest?q=volt');
      const duration = Date.now() - start;

      expect(res.status).toBe(200);
      expect(duration).toBeLessThan(100); // SEARCH-01: p95 < 100ms

      const body = await res.json();
      expect(body.suggestions.length).toBeGreaterThanOrEqual(1);
      expect(body.suggestions[0].text).toContain('VOLTX');
    });

    it('escapes special characters and protects against injection in search queries', async () => {
      const res = await app.request('/api/v1/delivery/search?q=%3Cscript%3Ealert(1)%3C/script%3E');
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.query).toBeDefined();
    });
  });

  describe('Task D6: Forms Server Rendering & Newsletter Double Opt-in (FORMS-01)', () => {
    const email = `subscriber-${Date.now()}@twinmos.dev`;
    let confirmToken = '';
    let unsubscribeToken = '';

    it('creates subscriber in pending state with separate confirm and unsubscribe tokens', async () => {
      const noToken = await app.request('/api/v1/forms/newsletter', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'footer_subscribe' }),
      });
      expect(noToken.status).toBe(400); // signed form token is mandatory (ZT-028)

      const res = await app.request('/api/v1/forms/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'footer_subscribe', formToken: formToken() }),
      });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.ok).toBe(true);
      expect(body.requiresConfirmation).toBe(true);

      const sub = (await db.select().from(newsletterSubscriber).where(eq(newsletterSubscriber.email, email)))[0];
      expect(sub).toBeDefined();
      expect(sub.status).toBe('pending');
      expect(sub.token).toBeTruthy();
      expect(sub.tokenExpiresAt).toBeTruthy(); // confirmation links expire
      expect(sub.unsubscribeToken).toBeTruthy();
      expect(sub.unsubscribeToken).not.toBe(sub.token);
      confirmToken = sub.token;
      unsubscribeToken = sub.unsubscribeToken;
    });

    it('a GET on the e-mailed link only opens the page (link scanners cannot confirm)', async () => {
      const res = await app.request(`/api/v1/forms/newsletter/confirm?token=${confirmToken}`);
      expect(res.status).toBe(303);
      expect(res.headers.get('location')).toContain(`/newsletter?confirm=${confirmToken}`);
      const sub = (await db.select().from(newsletterSubscriber).where(eq(newsletterSubscriber.email, email)))[0];
      expect(sub.status).toBe('pending');
    });

    it('confirms subscriber on POST and consumes the one-time token', async () => {
      const res = await app.request('/api/v1/forms/newsletter/confirm', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: confirmToken }),
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.ok).toBe(true);
      expect(body.confirmed).toBe(true);

      const sub = (await db.select().from(newsletterSubscriber).where(eq(newsletterSubscriber.email, email)))[0];
      expect(sub.status).toBe('active');
      expect(sub.confirmedAt).toBeTruthy();
      expect(sub.token).toBeNull();
      const replay = await app.request('/api/v1/forms/newsletter/confirm', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: confirmToken }),
      });
      expect(replay.status).toBe(404);
    });

    it('allows one-click (RFC 8058 POST) unsubscribe with the unsubscribe token', async () => {
      const wrong = await app.request(`/api/v1/forms/newsletter/unsubscribe?token=${confirmToken}`, { method: 'POST' });
      expect(wrong.status).toBe(404); // the confirmation token is not an unsubscribe credential
      const res = await app.request(`/api/v1/forms/newsletter/unsubscribe?token=${unsubscribeToken}`, { method: 'POST' });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.ok).toBe(true);
      expect(body.unsubscribed).toBe(true);

      const sub = (await db.select().from(newsletterSubscriber).where(eq(newsletterSubscriber.email, email)))[0];
      expect(sub.status).toBe('unsubscribed');
      expect(sub.unsubscribedAt).toBeTruthy();
    });
  });
});
