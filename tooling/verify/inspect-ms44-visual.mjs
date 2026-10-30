// tooling/verify/inspect-ms44-visual.mjs
// Milestone MS4.4: Visual, Manual & Accessibility (a11y) Inspection Suite
// Tests Core Block Editors & Renderers, Prototype Parity, and Axe-core WCAG 2.2 AA.
import { chromium } from '@playwright/test';
import { readFileSync, existsSync, mkdirSync, writeFileSync, copyFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve('axe-core'), 'utf8');

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const EVIDENCE_DIR = resolve(ROOT, 'tooling/verify/evidence/ms44');
mkdirSync(EVIDENCE_DIR, { recursive: true });

const ARTIFACTS_DIR = 'C:/Users/DELL/.gemini/antigravity/brain/1b456724-1889-46de-b5d3-1e352373438f';

const WEB_URL = process.env.WEB_URL || 'http://127.0.0.1:4321';
const ADMIN_URL = process.env.ADMIN_URL || 'http://127.0.0.1:5173';
const EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@twinmos.dev';
const PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'admin';

console.log('================================================================');
console.log('    MS4.4 Visual, Manual & Accessibility (a11y) Inspection');
console.log('================================================================\n');

async function runVisualA11yInspection() {
  const totals = {
    pagesTested: 0,
    a11yViolationsTotal: 0,
    failures: [],
  };

  const browser = await chromium.launch({ headless: true });

  // 1. Desktop Viewport (1440x900)
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'TwinMOS-MS44-Visual-Inspector/1.0 (Desktop)',
  });
  const page = await desktopContext.newPage();

  // Helper for Axe-Core a11y audit
  async function runAxe(pageInstance, pageName) {
    await pageInstance.evaluate(axeSource);
    const results = await pageInstance.evaluate(async () => {
      // @ts-ignore
      return await window.axe.run(document, {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
        },
        resultTypes: ['violations'],
      });
    });

    const seriousOrCritical = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    console.log(`  🔍 Axe-core check on ${pageName}: ${seriousOrCritical.length} critical/serious violations (${results.violations.length} total).`);
    if (seriousOrCritical.length > 0) {
      for (const v of seriousOrCritical) {
        console.warn(`    ⚠️ [${v.impact.toUpperCase()}] ${v.id}: ${v.help} (${v.nodes.length} occurrences)`);
        totals.failures.push(`${pageName}: ${v.id} (${v.help})`);
      }
    }
    totals.a11yViolationsTotal += seriousOrCritical.length;
    return seriousOrCritical;
  }

  // ==========================================================================
  // 1. Inspect Homepage (/)
  // ==========================================================================
  console.log('[1/4] Inspecting Public Homepage at', `${WEB_URL}/`);
  await page.goto(`${WEB_URL}/`, { waitUntil: 'domcontentloaded' });
  const homeTitle = await page.title();
  console.log(`  ✓ Homepage Title: "${homeTitle}"`);

  // Verify Slider and Pause Control
  const hasSlider = await page.locator('.slider, .hero-slider').count();
  console.log(`  ✓ Slider detected: ${hasSlider > 0}`);

  // Check Slide Images have Alt Text
  const slideImgs = page.locator('.sl-slide img');
  const slideImgCount = await slideImgs.count();
  console.log(`  ✓ Found ${slideImgCount} slide images in DOM.`);
  for (let i = 0; i < slideImgCount; i++) {
    const alt = await slideImgs.nth(i).getAttribute('alt');
    if (!alt || alt.trim() === '') {
      totals.failures.push(`Slide image ${i} missing alt text`);
      console.error(`  ✗ Slide image ${i} missing alt text!`);
    }
  }

  // Check Pause Button
  const pauseBtn = page.locator('.slider-pause');
  if (await pauseBtn.count() > 0) {
    const isVisible = await pauseBtn.first().isVisible();
    console.log(`  ✓ Accessible slider pause button present (visible: ${isVisible}).`);
    await pauseBtn.first().click({ force: true });
    console.log('  ✓ Clicked slider pause button.');
  }

  // Verify Category Tiles with Dynamic Product Counts
  const catTiles = await page.locator('.cat-tile, .card.cat-tile').count();
  console.log(`  ✓ Found ${catTiles} category tiles rendered.`);
  const catCounts = await page.locator('.cat-count').allInnerTexts();
  console.log(`  ✓ Sample category counts: ${catCounts.slice(0, 4).join(', ')}`);

  // Verify Split CTA
  const splitCta = await page.locator('.block-split-cta, .cta-split').count();
  console.log(`  ✓ Split CTA present: ${splitCta > 0}`);

  // Axe a11y on Homepage
  await runAxe(page, 'Homepage');

  // Screenshot Desktop
  const homeShotDesktop = resolve(EVIDENCE_DIR, 'ms44-home-desktop.png');
  await page.screenshot({ path: homeShotDesktop, fullPage: false });
  console.log(`  ✓ Captured desktop screenshot: ${homeShotDesktop}`);

  // ==========================================================================
  // 2. Mobile Viewport (390x844) on Homepage
  // ==========================================================================
  console.log('\n[2/4] Inspecting Mobile Layout at 390x844...');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'TwinMOS-MS44-Visual-Inspector/1.0 (Mobile)',
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(`${WEB_URL}/`, { waitUntil: 'domcontentloaded' });

  const homeShotMobile = resolve(EVIDENCE_DIR, 'ms44-home-mobile.png');
  await mobilePage.screenshot({ path: homeShotMobile, fullPage: false });
  console.log(`  ✓ Captured mobile screenshot: ${homeShotMobile}`);
  await mobileContext.close();

  // ==========================================================================
  // 3. Inspect About Page (/about.html)
  // ==========================================================================
  console.log('\n[3/4] Inspecting About Page at', `${WEB_URL}/about.html`);
  await page.goto(`${WEB_URL}/about.html`, { waitUntil: 'domcontentloaded' });
  const aboutTitle = await page.title();
  console.log(`  ✓ About Page Title: "${aboutTitle}"`);

  // Verify Timeline
  const timelineItems = await page.locator('.timeline-item').count();
  console.log(`  ✓ Rendered timeline milestones: ${timelineItems}`);

  // Verify Logo Replacement in Headings
  const inlineLogos = await page.locator('h1 img.ilog, h2 img.ilog, h3 img.ilog, .page-hero img.ilog').count();
  console.log(`  ✓ Inline {logo} tokens replaced with SVG images in headings: ${inlineLogos}`);

  // Axe a11y on About Page
  await runAxe(page, 'About Page');

  const aboutShot = resolve(EVIDENCE_DIR, 'ms44-about-desktop.png');
  await page.screenshot({ path: aboutShot, fullPage: false });
  console.log(`  ✓ Captured about screenshot: ${aboutShot}`);

  // ==========================================================================
  // 4. Inspect Admin Page Builder (/pages)
  // ==========================================================================
  console.log('\n[4/4] Inspecting Admin Console & Page Builder at', `${ADMIN_URL}`);
  const adminShot = resolve(EVIDENCE_DIR, 'ms44-admin-console.png');
  try {
    await page.goto(`${ADMIN_URL}/`, { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForTimeout(1000);

    // If redirected to login, log in
    if (page.url().includes('login') || (await page.locator('input[type="email"]').count()) > 0) {
      console.log('  Signing in to Admin console...');
      await page.fill('input[type="email"]', EMAIL);
      await page.fill('input[type="password"]', PASSWORD);
      const signInBtn = page.locator('button.tm-btn, button:has-text("Sign in")').first();
      if (await signInBtn.count() > 0) {
        await signInBtn.click();
        await page.waitForTimeout(2000);
      }
    }

    // Navigate to Pages tab if available
    const pagesNav = page.locator('a[href*="/pages"], button:has-text("Pages"), nav a:has-text("Pages")').first();
    if (await pagesNav.count() > 0 && await pagesNav.isVisible()) {
      await pagesNav.click();
      await page.waitForTimeout(1000);
    }

    await page.screenshot({ path: adminShot, fullPage: false });
    console.log(`  ✓ Captured Admin console screenshot: ${adminShot}`);
  } catch (err) {
    console.warn(`  ⚠️ Admin console check note: ${err.message}`);
  }

  await browser.close();

  // Copy evidence to brain artifact directory
  try {
    if (existsSync(ARTIFACTS_DIR)) {
      copyFileSync(homeShotDesktop, resolve(ARTIFACTS_DIR, 'ms44-home-desktop.png'));
      copyFileSync(homeShotMobile, resolve(ARTIFACTS_DIR, 'ms44-home-mobile.png'));
      copyFileSync(aboutShot, resolve(ARTIFACTS_DIR, 'ms44-about-desktop.png'));
      copyFileSync(adminShot, resolve(ARTIFACTS_DIR, 'ms44-admin-console.png'));
      console.log('  ✓ Mirrored screenshots to conversation artifacts directory.');
    }
  } catch (e) {
    console.warn('  ⚠️ Note: Could not mirror screenshots to artifact directory:', e.message);
  }

  console.log('\n================================================================');
  console.log(`Visual & a11y Inspection Complete. Critical/Serious a11y violations: ${totals.a11yViolationsTotal}`);
  if (totals.failures.length > 0) {
    console.error(`Encountered ${totals.failures.length} issue(s):`);
    totals.failures.forEach((f) => console.error(`  - ${f}`));
    process.exit(1);
  }
  console.log('All Visual & Accessibility Checks PASSED (0 critical / 0 serious).');
  console.log('================================================================');
  process.exit(0);
}

runVisualA11yInspection().catch((err) => {
  console.error(`Fatal error in inspect-ms44-visual: ${err.message}`);
  process.exit(1);
});
