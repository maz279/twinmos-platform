// P4.1 — public-site gates: page-load matrix + deep-link params + live widgets.
// Runs against the built static bundle (astro preview) with the live API.
// The params matrix encodes the P2.5 deep-link contract so a regression in
// ?region= / ?product= / ?cat= / ?q= handling fails CI.
import { test, expect } from '@playwright/test';

const PAGES = [
  'index.html', 'shop.html', 'product.html?id=corex-pro-m2-pcie-gen-5-0-nvme-ssd',
  'where-to-buy.html', 'compatibility.html', 'support.html', 'rma.html',
  'careers.html', 'partners.html', 'quote.html', 'contact.html', 'about.html',
  'technology.html', 'gaming.html', 'solutions.html', 'learn.html',
  'learn-guides.html', 'learn-explained.html', 'learn-benchmarks.html',
  'learn-glossary.html', 'learn-blog.html', 'news.html', 'legal.html',
  'article.html?id=what-is-xmp', 'search.html?q=DDR5', 'sitemap.html', 'compare.html',
];

test.describe('public site', () => {
  for (const page of PAGES) {
    test(`page loads: ${page}`, async ({ page: p }) => {
      const res = await p.goto(page, { waitUntil: 'domcontentloaded' });
      expect(res?.status(), `HTTP status for ${page}`).toBeLessThan(400);
      // the merge layer + app boot must not crash: mega menu renders
      await expect(p.locator('.site-header')).toBeVisible();
      // no module error text anywhere
      const body = await p.textContent('body');
      expect(body).not.toContain('could not be loaded');
    });
  }

  // MS5.2 page conversion: the CMS where-to-buy/quote/shop/search pages mount
  // the prototype widgets (locator, product select, shop grid, search results).
  test('?region=africa activates the Africa chip (P2.5)', async ({ page }) => {
    await page.goto('where-to-buy.html?region=africa');
    await expect(page.locator('[data-rg="af"]')).toHaveClass(/on/);
  });

  test('?country=IN focuses India', async ({ page }) => {
    await page.goto('where-to-buy.html?country=IN');
    await expect(page.locator('#locCount')).toContainText(/1 market/i);
  });

  test('?product=<db-slug> prefills the quote select (P2.5)', async ({ page }) => {
    // Corpus-reconciled product (old udimm-16gb fixture removed by the MS6
    // importer reconciliation back to the 39-item corpus).
    await page.goto('quote.html?product=voltx-ddr5-u-dimm-for-desktop');
    // The prefill runs from the lazily-loaded app layer (requestIdleCallback),
    // so give the assertion the same budget the interaction allows.
    await expect(page.locator('#qProduct')).toHaveValue(/VOLTX DDR5/i, { timeout: 15_000 });
  });

  test('?cat=dram-gaming filters the shop grid', async ({ page }) => {
    await page.goto('shop.html?cat=dram-gaming');
    // the grid renders client-side — wait for cards, not just domcontentloaded
    await page.waitForSelector('#main .grid .card, #main .p-card', { timeout: 10_000 });
    const cards = page.locator('#main .p-card, #main .card.p-card, #main .grid .card');
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test('?q=DDR5 returns search results', async ({ page }) => {
    // T5.6.3: /search is server-rendered from Delivery /search with clean
    // result URLs; the legacy search.html alias 301s here.
    const res = await page.goto('search?q=DDR5');
    expect(res?.status()).toBe(200);
    await page.waitForSelector('#main a[href*="/products/"], #main a[href*="/learn/"]', { timeout: 10_000 });
    const results = page.locator('#main a[href*="/products/"], #main a[href*="/learn/"]');
    expect(await results.count()).toBeGreaterThan(0);
  });

  test('PDP shows MSRP for a priced product and omits offers for a priceless one (P2.4)', async ({ page }) => {
    // Corpus-reconciled priced product (the old udimm-16gb fixture row was
    // removed by the MS6 importer reconciliation back to the 39-item corpus).
    await page.goto('product.html?id=voltx-ddr5-u-dimm-for-desktop');
    await expect(page.locator('.pdp-info')).toContainText(/USD 89\.99/);
    await page.goto('product.html?id=corex-pro-m2-pcie-gen-5-0-nvme-ssd');
    const ld = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
      const product = els.map((e) => { try { return JSON.parse(e.textContent ?? ''); } catch { return null; } })
        .find((j) => j && j['@type'] === 'Product');
      return product?.offers ?? 'ABSENT';
    });
    expect(ld).toBe('ABSENT');
    // warranty phrasing regression (visual-audit fix): values that already
    // end in "warranty" ("Lifetime warranty") must never get a second one.
    // NOTE the target: this product's corpus warranty VALUE CONTAINS the
    // word, so the pre-fix template ('…' + ' warranty') renders a visible
    // duplication and fails here — a clean value like "5 Years" passes under
    // both code vintages and proves nothing (the original assertion's mistake).
    await page.goto('product.html?id=microsdxc-class-10-v30-uhs-3');
    await page.waitForSelector('.pdp-info', { timeout: 10_000 });
    const body = await page.textContent('body');
    expect(body).not.toMatch(/warranty\s+warranty/i);
  });

  test('mega menu states the CMS product count (MS4.2 T4.2.3)', async ({ page, request }) => {
    const API = process.env.E2E_API_URL ?? 'http://127.0.0.1:8787';
    const settings = await request.get(`${API}/api/v1/delivery/settings/site.figures`);
    const figures = (await settings.json()).data;
    await page.goto('index.html', { waitUntil: 'load', timeout: 30_000 });
    await expect.poll(async () => page.locator('.mega-all').first().textContent(), { timeout: 15_000 })
      .toContain(`${figures.productCount} products`);
  });
});
