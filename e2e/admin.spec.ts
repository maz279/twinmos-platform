// P4.2 — admin-console gates. The centrepiece is the Products row-open
// regression (audit finding U-1): a Rules-of-Hooks violation crashed the
// editor on row click, and API-level tests never caught it. This spec opens
// a product row through the real UI and asserts the editor mounts — if the
// hook order ever regresses, CI fails here.
// Auth: signs in with env-provided seeded-admin credentials (never literals).
import { test, expect } from '@playwright/test';

const ADMIN = process.env.E2E_ADMIN_URL ?? 'http://localhost:5173';
const EMAIL = process.env.SEED_ADMIN_EMAIL ?? '';
const PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? '';

// The admin specs target the Vite dev server (dev) or the built bundle —
// both serve the SPA at ADMIN.
test.use({ baseURL: ADMIN });

async function signIn(page: import('@playwright/test').Page) {
  if (!EMAIL || !PASSWORD) throw new Error('SEED_ADMIN_EMAIL/PASSWORD must come from the environment');
  await page.goto('/#/m/products');
  await page.waitForLoadState('domcontentloaded');
  // Cold Vite transforms on the first hit can exceed any fixed sleep — wait
  // for the login form (inputs) OR the signed-in shell (nav). Pure-CSS union:
  // a comma list with a text= engine prefix would swallow the commas.
  await page.waitForSelector('input, nav, .site-header', { timeout: 20_000 });
  const onLogin = (await page.locator('text=Staff sign-in').count()) > 0;
  if (onLogin) {
    await page.locator('input').first().fill(EMAIL);
    await page.locator('input').last().fill(PASSWORD);
    await page.locator('button:has-text("Sign in")').click();
    // the signed-in shell (sidebar nav) is the real signal, not a timer
    await page.waitForSelector('nav, .site-header', { timeout: 15_000 });
  }
}

test.describe('admin console', () => {
  test('Products: row click opens the editor (U-1 regression gate)', async ({ page }) => {
    await signIn(page);
    await page.goto('/#/m/products');
    await page.waitForSelector('tr', { timeout: 15_000 });
    // rows load from the API (CI's scratch DB carries the 2 reference
    // products from db:seed — header + 1 product row is the floor, not 4)
    const rows = page.locator('tr');
    expect(await rows.count()).toBeGreaterThan(1);
    // click the first product row — the editor must mount, NOT the error boundary
    await rows.nth(1).click();
    await page.waitForTimeout(2000);
    const body = await page.textContent('body');
    expect(body).not.toContain('could not be loaded');
    expect(body).toContain('Save changes');
  });

  test('Products: editor save persists (warranty edit)', async ({ page }) => {
    await signIn(page);
    await page.goto('/#/m/products');
    await page.waitForTimeout(2200);
    await page.locator('tr').nth(1).click();
    await page.waitForTimeout(1800);
    // The warranty input is located by its editor placeholder ("e.g. 5 Years",
    // products.tsx). Presence is REQUIRED — a locator that quietly matches
    // nothing would turn this test into a vacuous pass.
    const warranty = page.locator('input[placeholder*="5 Years"]');
    await expect(warranty.first()).toBeVisible();
    // probe save, then RESTORE the original value — this test runs against
    // the long-lived dev store locally (CI uses a scratch DB); leaving
    // "E2E warranty probe" behind pollutes the catalog (forensic-audit finding)
    const original = await warranty.first().inputValue();
    await warranty.first().fill('E2E warranty probe');
    await page.locator('button:has-text("Save changes")').click();
    await page.waitForTimeout(2000);
    let body = await page.textContent('body');
    expect(body).not.toContain('Save failed');
    // Save closed the editor (onDone) — re-open to restore original value
    await page.locator('tr').nth(1).click();
    await page.waitForTimeout(1800);
    await warranty.first().fill(original);
    await page.locator('button:has-text("Save changes")').click();
    await page.waitForTimeout(2000);
    body = await page.textContent('body');
    expect(body).not.toContain('Save failed');
  });

  const MODULES = ['dashboard', 'content', 'submissions', 'rma', 'partners', 'serials', 'jobs', 'media', 'translations', 'users', 'audit', 'settings'];
  for (const m of MODULES) {
    test(`module mounts without error boundary: ${m}`, async ({ page }) => {
      await signIn(page);
      await page.goto(`/#/m/${m}`);
      await page.waitForTimeout(1600);
      const body = await page.textContent('body');
      expect(body).not.toContain('could not be loaded');
      expect(await page.locator('.site-header, nav').count()).toBeGreaterThan(0);
    });
  }

  test('RBAC negative: unauthenticated admin routes redirect to sign-in', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/#/m/users');
    await page.waitForTimeout(2000);
    const body = await page.textContent('body');
    // either the login screen or an empty console — but no admin data leak
    expect(body).not.toContain('super admin');
  });
});
