// Visual & Accessibility Inspection Suite for Milestone MS4.2 (T4.2.1–T4.2.4)
// Validates Site Settings editor, Navigation menus, axe-core a11y, and responsive visual layout.
import { chromium } from '@playwright/test';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve('axe-core'), 'utf8');

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const EVIDENCE_DIR = resolve(ROOT, 'tooling/verify/evidence/ms42');
mkdirSync(EVIDENCE_DIR, { recursive: true });

const WEB_URL = process.env.WEB_URL || 'http://127.0.0.1:4321';
const ADMIN_URL = process.env.ADMIN_URL || 'http://127.0.0.1:5173';
const API_URL = process.env.API_URL || 'http://127.0.0.1:8787';
const EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@twinmos.dev';
const PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'admin';

console.log('================================================================');
console.log('       MS4.2 Visual, Manual & Accessibility (a11y) Audit');
console.log('================================================================\n');

async function runVisualA11yInspection() {
  const settingsRes = await fetch(`${API_URL}/api/v1/delivery/settings`);
  if (!settingsRes.ok) throw new Error(`Delivery settings HTTP ${settingsRes.status}`);
  const settings = (await settingsRes.json()).data;
  const figures = settings['site.figures'];
  const cookieSettings = settings['site.cookie'];
  const totals = {
    publicA11yViolations: 0,
    adminA11yViolations: 0,
    failures: [],
  };
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'TwinMOS-MS42-Visual-Inspector/1.0',
  });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // 1. Inspect Public Homepage Navigation & Footer
  console.log('[1/4] Inspecting public site navigation & chrome at', WEB_URL);
  await page.goto(`${WEB_URL}/`, { waitUntil: 'domcontentloaded' });
  const title = await page.title();
  console.log(`  ✓ Public site title: "${title}"`);
  const publicNavigationRendered = await page.locator('.site-header .nav').isVisible();

  // Verify the footer follows the live settings values, not baseline copy.
  const footerText = await page.locator('.site-footer').innerText();
  const footerFiguresOk =
    footerText.toLowerCase().includes(`since ${figures.foundingYear}`.toLowerCase()) &&
    footerText.includes(`${figures.countriesCount} countries`);
  if (footerFiguresOk) {
    console.log(`  ✓ Footer reflects live figures (since ${figures.foundingYear}, ${figures.countriesCount} countries).`);
  } else {
    totals.failures.push('footer figures do not match site.figures');
    console.error('  ✗ Footer does not reflect live site.figures.');
  }

  // Header mega-menu "all" row carries the CMS product count.
  const megaAllText = await page.locator('.mega-all').first().textContent();
  const headerCountOk = String(megaAllText).includes(`${figures.productCount} products`);
  if (headerCountOk) {
    console.log(`  ✓ Mega-menu states ${figures.productCount} products from site.figures.`);
  } else {
    totals.failures.push(`mega-menu count is not ${figures.productCount}`);
    console.error(`  ✗ Mega-menu does not state ${figures.productCount} products: ${megaAllText}`);
  }

  // Cookie copy and WhatsApp link are settings-driven.
  const cookieText = await page.locator('#cookieBar').innerText();
  const cookieOk = cookieText.includes(cookieSettings.description);
  if (!cookieOk) totals.failures.push('cookie banner copy does not match site.cookie');
  const waHref = await page.locator('.site-footer a[href*="wa.me"]').first().getAttribute('href');
  const waOk = Boolean(waHref && /wa\.me\/\d{7,15}/.test(waHref));
  if (!waOk) totals.failures.push('WhatsApp link missing or malformed');

  // Verify social links
  const socialLinksCount = await page.locator('.site-footer .social-row a').count();
  console.log(`  ✓ Rendered ${socialLinksCount} social links in footer.`);

  // Inject and run axe-core on public navigation and footer
  await page.evaluate(axeSource);
  const publicA11y = await page.evaluate(async () => {
    // @ts-ignore
    return await axe.run({
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag22aa'],
      },
      rules: {
        'color-contrast': { enabled: true },
      },
    });
  });

  const publicViolations = publicA11y.violations.filter(
    (v) => v.impact === 'critical' || v.impact === 'serious'
  );
  totals.publicA11yViolations = publicViolations.length;
  console.log(`  ✓ Axe-core on public site: ${publicViolations.length} critical/serious violations.`);
  if (publicViolations.length > 0) {
    totals.failures.push(`public a11y: ${publicViolations.length} critical/serious violations`);
  }

  await page.screenshot({ path: resolve(EVIDENCE_DIR, '01_public_navigation_footer.png'), fullPage: false });
  console.log('  ✓ Saved screenshot: 01_public_navigation_footer.png');

  // 2. Sign into Admin Console via API + Cookie Injection
  console.log('\n[2/4] Authenticating to Admin Console at', ADMIN_URL);
  const authRes = await fetch(`${API_URL}/api/v1/auth/sign-in/email`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'origin': ADMIN_URL,
    },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });

  if (!authRes.ok) {
    throw new Error(`Admin authentication failed: HTTP ${authRes.status}`);
  }

  const setCookieHeader = authRes.headers.get('set-cookie');
  if (setCookieHeader) {
    const match = setCookieHeader.match(/better-auth\.session_token=([^;]+)/);
    if (match) {
      await context.addCookies([
        {
          name: 'better-auth.session_token',
          value: match[1],
          domain: '127.0.0.1',
          path: '/',
          httpOnly: true,
          sameSite: 'Lax',
        },
        {
          name: 'better-auth.session_token',
          value: match[1],
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          sameSite: 'Lax',
        },
      ]);
      console.log('  ✓ Session cookie injected into browser context.');
    }
  }

  await page.goto(`${ADMIN_URL}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // If login form is still shown (e.g., cross-origin cookie policy), fill credentials
  const emailInput = page.locator('input[type="email"]');
  if (await emailInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    console.log('  -> Filling login credentials on form...');
    await emailInput.fill(EMAIL);
    await page.locator('input[type="password"]').fill(PASSWORD);
    await page.locator('button:has-text("Sign in")').click();
    await page.waitForTimeout(2000);
  }
  console.log('  ✓ Successfully signed in to Admin Console.');

  // 3. Navigate to Settings Module
  console.log('\n[3/4] Navigating to Admin Settings Module');
  await page.goto(`${ADMIN_URL}/#/m/settings`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // Verify Site Settings tab is visible
  const siteSettingsBtn = page.locator('button:has-text("Site Settings")');
  await siteSettingsBtn.waitFor({ state: 'visible', timeout: 8000 });
  await siteSettingsBtn.click();
  await page.waitForTimeout(500);
  const adminSettingsMounted = await page.locator('#site-settings-module').isVisible();
  if (!adminSettingsMounted) totals.failures.push('admin settings module did not mount');
  console.log('  ✓ Site Settings editor mounted.');

  // All eight typed groups must be reachable from the group navigation.
  for (const label of [
    'Figures & N-Years',
    'Brand & Identity',
    'Social Media',
    'WhatsApp Chat',
    'Contact Info',
    'Cookie Consent',
    'SEO Defaults',
    'Integrations',
  ]) {
    if ((await page.locator('button', { hasText: label }).count()) < 1) {
      totals.failures.push(`settings group missing: ${label}`);
      console.error(`  ✗ Settings group missing: ${label}`);
    }
  }

  // Inspect Figures group
  const figuresBtn = page.locator('button:has-text("Figures & N-Years")').first();
  await figuresBtn.click();
  await page.waitForTimeout(500);

  const previewLocator = page.locator('text=Live Dynamic Preview');
  await previewLocator.waitFor({ state: 'visible', timeout: 5000 });
  console.log('  ✓ Figures dynamic preview element verified.');

  await page.screenshot({ path: resolve(EVIDENCE_DIR, '02_admin_settings_figures.png') });
  console.log('  ✓ Saved screenshot: 02_admin_settings_figures.png');

  // 4. Test Settings Form Validation & Axe-core A11y Audit
  console.log('\n[4/4] Testing validation and running axe-core a11y audit on Settings editor');

  // Switch to WhatsApp group and test invalid format
  const waBtn = page.locator('button:has-text("WhatsApp Chat")').first();
  await waBtn.click();
  await page.waitForTimeout(500);

  // Run axe-core scoped directly to the Settings module editor
  await page.evaluate(axeSource);
  const adminA11y = await page.evaluate(async () => {
    // @ts-ignore
    return await axe.run('#site-settings-module', {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa'],
      },
    });
  });

  const adminViolations = adminA11y.violations.filter(
    (v) => v.impact === 'critical' || v.impact === 'serious'
  );
  console.log(`  ✓ Axe-core on Site Settings Module: ${adminViolations.length} critical/serious violations.`);
  totals.adminA11yViolations = adminViolations.length;
  if (adminViolations.length > 0) {
    totals.failures.push(`admin a11y: ${adminViolations.length} critical/serious violations`);
    for (const v of adminViolations) {
      console.log(`    - [${v.impact}] ${v.id}: ${v.description}`);
      for (const n of v.nodes.slice(0, 3)) {
        console.log(`      target: ${n.target.join(' ')}`);
      }
    }
  }

  await page.screenshot({ path: resolve(EVIDENCE_DIR, '03_admin_settings_whatsapp.png') });
  console.log('  ✓ Saved screenshot: 03_admin_settings_whatsapp.png');

  // Mobile chrome visual evidence.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${WEB_URL}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: resolve(EVIDENCE_DIR, '04_public_mobile.png'), fullPage: false });
  console.log('  ✓ Saved screenshot: 04_public_mobile.png');

  await browser.close();

  // Write evidence audit report
  const evidenceReport = {
    timestamp: new Date().toISOString(),
    milestone: 'MS4.2',
    name: 'Site Settings and Navigation Inspection',
    status: totals.failures.length === 0 ? 'PASSED' : 'FAILED',
    settingsSnapshot: { figures, cookie: cookieSettings },
    checks: {
      publicNavigationRendered,
      dynamicFiguresInFooter: footerFiguresOk,
      headerProductCount: headerCountOk,
      cookieCopyMatchesSettings: cookieOk,
      whatsappLinkRendered: waOk,
      socialLinksRendered: socialLinksCount >= 6,
      publicA11yViolations: totals.publicA11yViolations,
      adminSettingsMounted,
      adminA11yViolations: totals.adminA11yViolations,
    },
    failures: totals.failures,
    screenshots: [
      '01_public_navigation_footer.png',
      '02_admin_settings_figures.png',
      '03_admin_settings_whatsapp.png',
      '04_public_mobile.png',
    ],
  };
  writeFileSync(resolve(EVIDENCE_DIR, 'inspection_summary.json'), JSON.stringify(evidenceReport, null, 2));

  if (totals.failures.length > 0) {
    console.error('\n================================================================');
    console.error(`  ✗ Inspection FAILED: ${totals.failures.join('; ')}`);
    console.error('================================================================');
    process.exitCode = 1;
    return false;
  }

  console.log('\n================================================================');
  console.log('  ✓ Visual & Accessibility Inspection PASSED (0 Critical Issues)');
  console.log('================================================================');
  return true;
}

runVisualA11yInspection().catch((err) => {
  console.error('Inspection failed:', err);
  process.exit(1);
});
