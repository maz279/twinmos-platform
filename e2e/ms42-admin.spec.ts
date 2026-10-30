// MS4.2 — admin settings editor gates (T4.2.2).
// Verifies all eight typed groups mount, a save round-trips, and invalid input
// is refused. Restores any value it mutates.
import { test, expect } from '@playwright/test';

const ADMIN = process.env.E2E_ADMIN_URL ?? 'http://localhost:5173';
const EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@twinmos.dev';
const PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'admin';

test.use({ baseURL: ADMIN });

const GROUPS = [
  'Figures & N-Years',
  'Brand & Identity',
  'Social Media',
  'WhatsApp Chat',
  'Contact Info',
  'Cookie Consent',
  'SEO Defaults',
  'Integrations',
];

async function signIn(page: import('@playwright/test').Page) {
  await page.goto('/#/m/settings');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForSelector('input, nav, .site-header', { timeout: 20_000 });
  const onLogin = (await page.locator('text=Staff sign-in').count()) > 0;
  if (onLogin) {
    await page.locator('input').first().fill(EMAIL);
    await page.locator('input').last().fill(PASSWORD);
    await page.locator('button:has-text("Sign in")').click();
    await page.waitForSelector('nav, .site-header', { timeout: 15_000 });
  }
  await page.goto('/#/m/settings');
  await page.waitForSelector('#site-settings-module', { timeout: 15_000 });
}

test.describe('MS4.2 admin settings', () => {
  test('all eight typed groups mount', async ({ page }) => {
    await signIn(page);
    for (const label of GROUPS) {
      await expect(page.locator('button', { hasText: label }).first()).toBeVisible();
    }
    await expect(page.locator('#site-settings-module')).toContainText('Site Settings');
  });

  test('figures group saves and persists', async ({ page }) => {
    await signIn(page);
    await page.locator('button', { hasText: 'Figures & N-Years' }).first().click();
    const productCount = page.locator('input[aria-label="Total Products Count"]');
    await expect(productCount).toBeVisible();
    const original = await productCount.inputValue();

    await productCount.fill('40');
    await page.locator('button', { hasText: 'Save Figures & N-Years' }).click();
    await expect(page.locator('#site-settings-module')).toContainText('Saved "site.figures"', { timeout: 10_000 });

    // Reload from the server and confirm persistence.
    await page.reload();
    await page.waitForSelector('#site-settings-module', { timeout: 15_000 });
    await page.locator('button', { hasText: 'Figures & N-Years' }).first().click();
    // The settings GET can resolve after the module mounts; wait for the
    // server round-trip rather than the default 5 s assertion timeout.
    await expect(page.locator('input[aria-label="Total Products Count"]')).toHaveValue('40', { timeout: 15_000 });

    // Restore.
    await page.locator('input[aria-label="Total Products Count"]').fill(original);
    await page.locator('button', { hasText: 'Save Figures & N-Years' }).click();
    await expect(page.locator('#site-settings-module')).toContainText('Saved "site.figures"', { timeout: 10_000 });
    // Let the outbox dispatcher purge the `site`-tagged HTML cache before the
    // next spec runs (dispatch interval is 2 s).
    await page.waitForTimeout(3000);
  });

  test('invalid founding year is refused', async ({ page }) => {
    await signIn(page);
    await page.locator('button', { hasText: 'Figures & N-Years' }).first().click();
    const year = page.locator('input[aria-label="Founding Year"]');
    const original = await year.inputValue();
    await year.fill('1800');
    await page.locator('button', { hasText: 'Save Figures & N-Years' }).click();
    await expect(page.locator('#site-settings-module')).toContainText('between 1900 and 2100');
    await year.fill(original);
  });
});
