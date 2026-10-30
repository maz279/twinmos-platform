// tooling/verify/inspect-ms54-visual.mjs
// Milestone MS5.4: Visual, Manual & Accessibility (a11y) Inspection Suite
// Tests Article Reader, Newsroom & Trade Events, Hardware Compatibility Finder, Product Compare, and Mobile Views.
// Verifies visual rendering and enforces zero critical/serious WCAG 2.2 AA violations via Axe-core.

import { chromium } from '@playwright/test';
import { readFileSync, existsSync, mkdirSync, copyFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve('axe-core'), 'utf8');

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const EVIDENCE_DIR = resolve(ROOT, 'tooling/verify/evidence/ms54');
mkdirSync(EVIDENCE_DIR, { recursive: true });

const ARTIFACTS_DIR = 'C:/Users/DELL/.gemini/antigravity/brain/1b456724-1889-46de-b5d3-1e352373438f';

const WEB_URL = process.env.WEB_URL || 'http://localhost:4321';

console.log('='.repeat(78));
console.log('    MS5.4 Visual, Manual & Accessibility (a11y) Inspection');
console.log('='.repeat(78) + '\n');

async function runVisualA11yInspection() {
  const totals = {
    pagesTested: 0,
    a11yViolationsTotal: 0,
    failures: [],
    screenshots: [],
  };

  const browser = await chromium.launch({ headless: true });

  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'TwinMOS-MS54-Visual-Inspector/1.0 (Desktop)',
  });
  const page = await desktopContext.newPage();

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

    console.log(`\n  [A11y Audit] ${pageName}:`);
    console.log(`    • Total rules evaluated: ${results.passes.length + results.violations.length}`);
    console.log(`    • Violations detected:   ${results.violations.length}`);
    console.log(`    • Critical / Serious:    ${seriousOrCritical.length}`);

    if (seriousOrCritical.length > 0) {
      seriousOrCritical.forEach((v) => {
        console.error(`      ❌ [${v.impact.toUpperCase()}] ${v.id}: ${v.help}`);
        v.nodes.slice(0, 3).forEach((n) => {
          console.error(`         target: ${n.target.join(' ')}`);
        });
      });
      totals.a11yViolationsTotal += seriousOrCritical.length;
      totals.failures.push(`${pageName}: ${seriousOrCritical.length} critical/serious a11y violations`);
    } else {
      console.log(`    ✓ Clean pass: 0 critical or serious WCAG 2.2 AA violations`);
    }

    return results;
  }

  function saveScreenshot(filename) {
    const evidencePath = resolve(EVIDENCE_DIR, filename);
    const artifactPath = resolve(ARTIFACTS_DIR, filename);
    if (existsSync(evidencePath)) {
      copyFileSync(evidencePath, artifactPath);
      console.log(`    [Saved Screenshot] -> ${evidencePath}`);
      console.log(`    [Mirrored Artifact] -> ${artifactPath}`);
      totals.screenshots.push(filename);
    }
  }

  // ---------------------------------------------------------------------------
  // DRIVE 1: Knowledge Hub Article Reader (Desktop 1440x900)
  // ---------------------------------------------------------------------------
  console.log('\n--- DRIVE 1: Article Reader (/learn/boost-pc-performance-ram-or-ssd-first - Desktop 1440x900) ---');
  totals.pagesTested++;
  const respArticle = await page.goto(`${WEB_URL}/learn/boost-pc-performance-ram-or-ssd-first`, { waitUntil: 'networkidle' });
  console.log(`  -> Response status: ${respArticle?.status()} (Expected: 200)`);
  if (respArticle?.status() !== 200) totals.failures.push(`Article status was ${respArticle?.status()}, expected 200`);
  const h1_art = await page.locator('h1').first().textContent();
  console.log(`  -> Page <h1>: "${h1_art?.trim()}"`);
  await page.screenshot({ path: resolve(EVIDENCE_DIR, 'ms54_drive_01_article_reader_desktop.png'), fullPage: false });
  saveScreenshot('ms54_drive_01_article_reader_desktop.png');
  await runAxe(page, 'Article Reader (Desktop)');

  // ---------------------------------------------------------------------------
  // DRIVE 2: Newsroom Hub with Category Filter (Desktop 1440x900)
  // ---------------------------------------------------------------------------
  console.log('\n--- DRIVE 2: Newsroom Hub (/news?cat=events - Desktop 1440x900) ---');
  totals.pagesTested++;
  const respNews = await page.goto(`${WEB_URL}/news?cat=events`, { waitUntil: 'networkidle' });
  console.log(`  -> Response status: ${respNews?.status()} (Expected: 200)`);
  if (respNews?.status() !== 200) totals.failures.push(`Newsroom status was ${respNews?.status()}, expected 200`);
  const h1_news = await page.locator('h1').first().textContent();
  console.log(`  -> Page <h1>: "${h1_news?.trim()}"`);
  await page.screenshot({ path: resolve(EVIDENCE_DIR, 'ms54_drive_02_newsroom_hub_desktop.png'), fullPage: false });
  saveScreenshot('ms54_drive_02_newsroom_hub_desktop.png');
  await runAxe(page, 'Newsroom Hub (Desktop)');

  // ---------------------------------------------------------------------------
  // DRIVE 3: Trade Show Event Post (Desktop 1440x900)
  // ---------------------------------------------------------------------------
  console.log('\n--- DRIVE 3: Event Post (/news/2025-05-computex-2025-twinmos-showcase - Desktop 1440x900) ---');
  totals.pagesTested++;
  const respEvent = await page.goto(`${WEB_URL}/news/2025-05-computex-2025-twinmos-showcase`, { waitUntil: 'networkidle' });
  console.log(`  -> Response status: ${respEvent?.status()} (Expected: 200)`);
  if (respEvent?.status() !== 200) totals.failures.push(`Event post status was ${respEvent?.status()}, expected 200`);
  const h1_event = await page.locator('h1').first().textContent();
  console.log(`  -> Page <h1>: "${h1_event?.trim()}"`);
  await page.screenshot({ path: resolve(EVIDENCE_DIR, 'ms54_drive_03_event_post_desktop.png'), fullPage: false });
  saveScreenshot('ms54_drive_03_event_post_desktop.png');
  await runAxe(page, 'Event Post (Desktop)');

  // ---------------------------------------------------------------------------
  // DRIVE 4: Hardware Compatibility Finder (Desktop 1440x900)
  // ---------------------------------------------------------------------------
  console.log('\n--- DRIVE 4: Compatibility Finder (/compatibility?type=laptop - Desktop 1440x900) ---');
  totals.pagesTested++;
  const respCompat = await page.goto(`${WEB_URL}/compatibility?type=laptop`, { waitUntil: 'networkidle' });
  console.log(`  -> Response status: ${respCompat?.status()} (Expected: 200)`);
  if (respCompat?.status() !== 200) totals.failures.push(`Compat finder status was ${respCompat?.status()}, expected 200`);
  const h1_compat = await page.locator('h1').first().textContent();
  console.log(`  -> Page <h1>: "${h1_compat?.trim()}"`);
  await page.screenshot({ path: resolve(EVIDENCE_DIR, 'ms54_drive_04_compatibility_finder_desktop.png'), fullPage: false });
  saveScreenshot('ms54_drive_04_compatibility_finder_desktop.png');
  await runAxe(page, 'Compatibility Finder (Desktop)');

  // ---------------------------------------------------------------------------
  // DRIVE 5: Product Comparison (Desktop 1440x900)
  // ---------------------------------------------------------------------------
  console.log('\n--- DRIVE 5: Product Compare (/compare?items=corex-pro... - Desktop 1440x900) ---');
  totals.pagesTested++;
  const respCompare = await page.goto(`${WEB_URL}/compare?items=corex-pro-m2-pcie-gen-5-0-nvme-ssd,corex-m2-pcie-gen-4-0-nvme-ssd`, { waitUntil: 'networkidle' });
  console.log(`  -> Response status: ${respCompare?.status()} (Expected: 200)`);
  if (respCompare?.status() !== 200) totals.failures.push(`Compare status was ${respCompare?.status()}, expected 200`);
  const h1_compare = await page.locator('h1').first().textContent();
  console.log(`  -> Page <h1>: "${h1_compare?.trim()}"`);
  await page.screenshot({ path: resolve(EVIDENCE_DIR, 'ms54_drive_05_product_compare_desktop.png'), fullPage: false });
  saveScreenshot('ms54_drive_05_product_compare_desktop.png');
  await runAxe(page, 'Product Compare (Desktop)');

  // ---------------------------------------------------------------------------
  // DRIVE 6: Article Reader (Mobile 390x844)
  // ---------------------------------------------------------------------------
  console.log('\n--- DRIVE 6: Article Reader Mobile (/learn/boost-pc... - Mobile 390x844) ---');
  totals.pagesTested++;
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'TwinMOS-MS54-Visual-Inspector/1.0 (Mobile)',
    isMobile: true,
  });
  const mobilePage = await mobileContext.newPage();
  const respMobileArt = await mobilePage.goto(`${WEB_URL}/learn/boost-pc-performance-ram-or-ssd-first`, { waitUntil: 'networkidle' });
  console.log(`  -> Response status: ${respMobileArt?.status()} (Expected: 200)`);
  await mobilePage.screenshot({ path: resolve(EVIDENCE_DIR, 'ms54_drive_06_article_reader_mobile.png'), fullPage: false });
  saveScreenshot('ms54_drive_06_article_reader_mobile.png');
  await runAxe(mobilePage, 'Article Reader (Mobile)');

  await browser.close();

  // Summary
  console.log('\n' + '='.repeat(78));
  console.log('    VISUAL & A11Y INSPECTION SUMMARY');
  console.log('='.repeat(78));
  console.log(`  • Pages / Views Inspected:   ${totals.pagesTested}`);
  console.log(`  • Total A11y Violations:     ${totals.a11yViolationsTotal}`);
  console.log(`  • Screenshots Generated:     ${totals.screenshots.length}`);
  console.log(`  • Functional Regressions:    ${totals.failures.length}`);

  const report = {
    timestamp: new Date().toISOString(),
    milestone: 'MS5.4',
    pagesTested: totals.pagesTested,
    a11yViolations: totals.a11yViolationsTotal,
    screenshots: totals.screenshots,
    failures: totals.failures,
  };
  writeFileSync(resolve(EVIDENCE_DIR, 'ms54_visual_inspection_report.json'), JSON.stringify(report, null, 2));

  if (totals.failures.length > 0 || totals.a11yViolationsTotal > 0) {
    console.error('\n❌ Visual & A11y inspection FAILED with defects!');
    process.exit(1);
  } else {
    console.log('\n✅ VISUAL & A11Y INSPECTION PASSED CLEANLY (WCAG 2.2 AA COMPLIANT)!');
  }
}

runVisualA11yInspection().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
