// MS4.2 — public gates: settings-driven chrome, seeded Knowledge Hub article,
// live target resolution, and an end-to-end G-REFLECT save → anonymous load.
import { test, expect } from '@playwright/test';

const WEB = process.env.E2E_WEB_URL ?? 'http://localhost:4321';
const API = process.env.E2E_API_URL ?? 'http://127.0.0.1:8787';
const EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@twinmos.dev';
const PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'admin';
const ADMIN_ORIGIN = process.env.E2E_ADMIN_URL ?? 'http://localhost:5173';

test.describe('MS4.2 public chrome', () => {
  test('homepage chrome uses live figures, contact, cookie and WhatsApp settings', async ({ page, request }) => {
    const settingsRes = await request.get(`${API}/api/v1/delivery/settings/site.figures`);
    const figures = (await settingsRes.json()).data;

    // The chrome is cache-tagged `site`; poll briefly so a just-restored value
    // from another spec cannot race this assertion.
    await expect
      .poll(
        async () => {
          await page.goto('/');
          return page.locator('.mega-all a').filter({ hasText: 'catalog' }).textContent();
        },
        { timeout: 10_000 },
      )
      .toContain(`${figures.productCount} products`);

    await expect(page.locator('.site-header')).toContainText(`${figures.countriesCount} countries`);
    await expect(page.locator('.site-header')).toContainText(`Since ${figures.foundingYear}`);
    await expect(page.locator('footer.site-footer')).toContainText('5F.-5, No. 29');
    await expect(page.locator('footer.site-footer')).toContainText('sales@twinmos.com');
    await expect(page.locator('footer.site-footer a[href*="wa.me"]')).toBeVisible();
    await expect(page.locator('#cookieBar')).toBeVisible();
    await expect(page.locator('#cookieBar')).toContainText('essential cookies');
    // Turnstile key is supplied by site settings at render time. The zero-trust
    // hardening deliberately blanks the demo placeholder (Layout.astro), so with
    // no real key configured the meta must render EMPTY — never a fake key.
    const key = await page.locator('meta[name="turnstile-site-key"]').getAttribute('content');
    expect(key ?? '').toBe('');
    // Analytics is disabled by default, so no measurement ID is emitted.
    expect(await page.locator('meta[name="twinmos-analytics"]').getAttribute('content')).toBe('');
  });

  test('seeded Knowledge Hub article renders', async ({ page }) => {
    const res = await page.goto('/learn/what-is-amd-expo');
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1.article-title')).toContainText('AMD EXPO');
    await expect(page.locator('.article-body')).toContainText('EXPO');
  });

  test('all delivered navigation targets resolve', async ({ request }) => {
    const targets = new Set<string>();
    for (const code of ['header', 'drawer', 'footer']) {
      const res = await request.get(`${API}/api/v1/delivery/navigation/${code}`);
      expect(res.ok()).toBeTruthy();
      const walk = (nodes: any[]) => {
        for (const node of nodes || []) {
          if (typeof node.targetUrl === 'string' && node.targetUrl.startsWith('/')) targets.add(node.targetUrl);
          walk(node.children || []);
        }
      };
      walk((await res.json()).data.items);
    }
    expect(targets.size).toBeGreaterThan(50);
    for (const url of targets) {
      const res = await request.get(`${WEB}${url}`, { maxRedirects: 5 });
      expect(res.status(), url).toBeLessThan(400);
    }
  });

  test('G-REFLECT: settings save reaches the anonymous site within 5 s', async ({ request }) => {
    const signIn = await request.post(`${API}/api/v1/auth/sign-in/email`, {
      data: { email: EMAIL, password: PASSWORD },
      headers: { 'content-type': 'application/json', origin: ADMIN_ORIGIN },
    });
    expect(signIn.ok()).toBeTruthy();

    const current = await (await request.get(`${API}/api/v1/delivery/settings/site.figures`)).json();
    const original = {
      countriesCount: current?.data?.countriesCount ?? '93+',
      foundingYear: current?.data?.foundingYear ?? 1998,
      productCount: current?.data?.productCount ?? 40,
    };
    try {
      const put = await request.put(`${API}/api/v1/admin/settings`, {
        data: { key: 'site.figures', value: { countriesCount: '96+', foundingYear: 1997, productCount: original.productCount } },
        headers: { 'content-type': 'application/json' },
      });
      expect(put.ok()).toBeTruthy();

      // Outbox dispatch runs every 2 s; the HTML route cache is tagged `site`.
      await new Promise((resolve) => setTimeout(resolve, 3500));
      const html = await (await request.get(`${WEB}/?e2e=${Date.now()}`)).text();
      expect(html).toContain('Since 1997');
      expect(html).toContain('96+ countries');
      expect(html).not.toContain('Since 1998');
      expect(html).not.toContain('93+ countries');
    } finally {
      await request.put(`${API}/api/v1/admin/settings`, {
        data: { key: 'site.figures', value: original },
        headers: { 'content-type': 'application/json' },
      });
      await new Promise((resolve) => setTimeout(resolve, 2500));
    }
  });
});
