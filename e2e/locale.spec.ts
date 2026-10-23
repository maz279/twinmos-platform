// Localisation gate (T4.7.5) — the eight locale landings are real SSR routes.
// Rendered lang/dir, the clean-URL hreflang grid and the sitemap contract are
// asserted here because a static dist/ no longer exists (output: 'server').
import { test, expect } from '@playwright/test';
import { PNG } from 'pngjs';

const LOCALES = ['ar', 'hi', 'ru', 'zh-cn', 'fr', 'es', 'pt', 'de'];

test.describe('localised landings', () => {
  for (const code of LOCALES) {
    test(`/${code} renders lang/dir and a clean hreflang grid`, async ({ page }) => {
      const res = await page.goto(`/${code}`);
      expect(res?.status()).toBe(200);
      const html = page.locator('html');
      await expect(html).toHaveAttribute('lang', code);
      if (code === 'ar') {
        await expect(html).toHaveAttribute('dir', 'rtl');
        await expect(page.locator('link[rel="stylesheet"][href*="rtl.css"]')).toHaveCount(1);
      } else {
        expect(await html.getAttribute('dir')).toBeNull();
      }

      for (const alternate of ['en', ...LOCALES]) {
        const link = page.locator(`link[rel="alternate"][hreflang="${alternate}"]`);
        await expect(link, `missing hreflang ${alternate}`).toHaveCount(1);
        const href = await link.getAttribute('href');
        expect(href, `hreflang ${alternate} must be a clean URL`).not.toMatch(/\.html$/);
      }
      await expect(page.locator('link[rel="alternate"][hreflang="x-default"]'))
        .toHaveAttribute('href', 'https://www.twinmos.com/');
      await expect(page.locator('link[rel="alternate"][hreflang="ar"]'))
        .toHaveAttribute('href', 'https://www.twinmos.com/ar');
    });
  }

  test('Arabic landing actually paints content (skip-link must not shift the RTL viewport)', async ({ page }) => {
    await page.goto('/ar');
    const png = PNG.sync.read(await page.screenshot());
    let painted = 0;
    for (let i = 0; i < png.data.length; i += 4) {
      if (png.data[i] < 245 || png.data[i + 1] < 245 || png.data[i + 2] < 245) painted++;
    }
    expect(painted / (png.width * png.height), 'Arabic page rendered blank').toBeGreaterThan(0.05);
  });

  test('English home keeps a single en alternate and no locale grid', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(1);
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1);
    await expect(page.locator('link[rel="alternate"][hreflang="de"]')).toHaveCount(0);
  });

  test('sitemap lists the eight locale landings and no .html aliases', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    const xml = await res.text();
    for (const code of LOCALES) {
      expect(xml, `sitemap missing /${code}`).toContain(`<loc>https://www.twinmos.com/${code}</loc>`);
    }
    expect(xml).not.toMatch(/<loc>[^<]*\.html(<|\?)/);
  });

  test('untranslated locale path 301s to its English route', async ({ request }) => {
    const res = await request.get('/fr/about', { maxRedirects: 0 });
    expect(res.status()).toBe(301);
    expect(res.headers()['location']).toContain('/about');
  });
});
