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

  test('?region=africa activates the Africa chip (P2.5)', async ({ page }) => {
    await page.goto('where-to-buy.html?region=africa');
    await expect(page.locator('[data-rg="af"]')).toHaveClass(/on/);
  });

  test('?country=IN focuses India', async ({ page }) => {
    await page.goto('where-to-buy.html?country=IN');
    await expect(page.locator('#locCount')).toContainText(/1 market/i);
  });

  test('?product=<db-slug> prefills the quote select (P2.5)', async ({ page }) => {
    await page.goto('quote.html?product=voltx-ddr5-udimm-16gb');
    await expect(page.locator('#qProduct')).toHaveValue(/VOLTX DDR5/i);
  });

  test('?cat=dram-gaming filters the shop grid', async ({ page }) => {
    await page.goto('shop.html?cat=dram-gaming');
    // the grid renders client-side — wait for cards, not just domcontentloaded
    await page.waitForSelector('#main .grid .card, #main .p-card', { timeout: 10_000 });
    const cards = page.locator('#main .p-card, #main .card.p-card, #main .grid .card');
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test('?q=DDR5 returns search results', async ({ page }) => {
    await page.goto('search.html?q=DDR5');
    await page.waitForSelector('#main a[href*="product.html"], #main a[href*="article.html"]', { timeout: 10_000 });
    const results = page.locator('#main a[href*="product.html"], #main a[href*="article.html"]');
    expect(await results.count()).toBeGreaterThan(0);
  });

  test('PDP shows MSRP for a priced product and omits offers for a priceless one (P2.4)', async ({ page }) => {
    await page.goto('product.html?id=voltx-ddr5-udimm-16gb');
    await expect(page.locator('.pdp-info')).toContainText(/USD 89\.99/);
    await page.goto('product.html?id=corex-pro-m2-pcie-gen-5-0-nvme-ssd');
    const ld = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
      const product = els.map((e) => { try { return JSON.parse(e.textContent ?? ''); } catch { return null; } })
        .find((j) => j && j['@type'] === 'Product');
      return product?.offers ?? 'ABSENT';
    });
    expect(ld).toBe('ABSENT');
  });

  test('mega menu shows the live catalog count, not the baked 39 (P2.6)', async ({ page }) => {
    await page.goto('index.html', { waitUntil: 'load', timeout: 30_000 });
    // poll for the patched text — the count patch runs at app boot; poll
    // avoids coupling to any one marker element
    await expect.poll(async () => page.evaluate(() => document.body.textContent ?? ''), { timeout: 15_000 })
      .not.toMatch(/\b39 products\b/);
  });
});
