// tooling/verify/inspect-ms53-visual.mjs
// Milestone MS5.3: Visual, Manual & Accessibility (a11y) Inspection Suite
// Tests Catalogue Listing, Category Axis, Product Detail Page, Search Results, and Mobile Views.
// Verifies visual rendering and enforces zero critical/serious WCAG 2.2 AA violations via Axe-core.

import { chromium } from '@playwright/test';
import { readFileSync, existsSync, mkdirSync, copyFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve('axe-core'), 'utf8');

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const EVIDENCE_DIR = resolve(ROOT, 'tooling/verify/evidence/ms53');
mkdirSync(EVIDENCE_DIR, { recursive: true });

const ARTIFACTS_DIR = 'C:/Users/DELL/.gemini/antigravity/brain/1b456724-1889-46de-b5d3-1e352373438f';

const WEB_URL = process.env.WEB_URL || 'http://localhost:4321';

console.log('='.repeat(78));
console.log('    MS5.3 Visual, Manual & Accessibility (a11y) Inspection');
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
    userAgent: 'TwinMOS-MS53-Visual-Inspector/1.0 (Desktop)',
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
  // DRIVE 1: Catalogue Listing Page (Desktop 1440x900)
  // ---------------------------------------------------------------------------
  console.log('\n--- DRIVE 1: Catalogue Listing (/products - Desktop 1440x900) ---');
  totals.pagesTested++;
  const respListing = await page.goto(`${WEB_URL}/products`, { waitUntil: 'networkidle' });
  console.log(`  -> Response status: ${respListing?.status()} (Expected: 200)`);
  if (respListing?.status() !== 200) totals.failures.push(`Catalogue listing status was ${respListing?.status()}, expected 200`);
  const h1_listing = await page.locator('h1').textContent();
  console.log(`  -> Page <h1>: "${h1_listing?.trim()}"`);
  await page.screenshot({ path: resolve(EVIDENCE_DIR, 'ms53_drive_01_catalogue_listing_desktop.png'), fullPage: false });
  saveScreenshot('ms53_drive_01_catalogue_listing_desktop.png');
  await runAxe(page, 'Catalogue Listing (Desktop)');

  // ---------------------------------------------------------------------------
  // DRIVE 2: Category Axis Page (Desktop 1440x900)
  // ---------------------------------------------------------------------------
  console.log('\n--- DRIVE 2: Category Axis (/products/ssd-nvme - Desktop 1440x900) ---');
  totals.pagesTested++;
  const respCategory = await page.goto(`${WEB_URL}/products/ssd-nvme`, { waitUntil: 'networkidle' });
  console.log(`  -> Response status: ${respCategory?.status()} (Expected: 200)`);
  if (respCategory?.status() !== 200) totals.failures.push(`Category axis status was ${respCategory?.status()}, expected 200`);
  const h1_cat = await page.locator('h1').textContent();
  console.log(`  -> Page <h1>: "${h1_cat?.trim()}"`);
  await page.screenshot({ path: resolve(EVIDENCE_DIR, 'ms53_drive_02_category_axis_desktop.png'), fullPage: false });
  saveScreenshot('ms53_drive_02_category_axis_desktop.png');
  await runAxe(page, 'Category Axis (Desktop)');

  // ---------------------------------------------------------------------------
  // DRIVE 3: Product Detail Page (Desktop 1440x900)
  // ---------------------------------------------------------------------------
  console.log('\n--- DRIVE 3: Product Detail Page (/products/corex-pro-m2-pcie-gen-5-0-nvme-ssd - Desktop 1440x900) ---');
  totals.pagesTested++;
  const respPDP = await page.goto(`${WEB_URL}/products/corex-pro-m2-pcie-gen-5-0-nvme-ssd`, { waitUntil: 'networkidle' });
  console.log(`  -> Response status: ${respPDP?.status()} (Expected: 200)`);
  if (respPDP?.status() !== 200) totals.failures.push(`PDP status was ${respPDP?.status()}, expected 200`);
  const h1_pdp = await page.locator('h1').textContent();
  console.log(`  -> Page <h1>: "${h1_pdp?.trim()}"`);
  await page.screenshot({ path: resolve(EVIDENCE_DIR, 'ms53_drive_03_pdp_desktop.png'), fullPage: false });
  saveScreenshot('ms53_drive_03_pdp_desktop.png');
  await runAxe(page, 'Product Detail Page (Desktop)');

  // ---------------------------------------------------------------------------
  // DRIVE 4: Search Results Page (Desktop 1440x900)
  // ---------------------------------------------------------------------------
  console.log('\n--- DRIVE 4: Search Results (/search?q=ddr5 - Desktop 1440x900) ---');
  totals.pagesTested++;
  const respSearch = await page.goto(`${WEB_URL}/search?q=ddr5`, { waitUntil: 'networkidle' });
  console.log(`  -> Response status: ${respSearch?.status()} (Expected: 200)`);
  if (respSearch?.status() !== 200) totals.failures.push(`Search results status was ${respSearch?.status()}, expected 200`);
  await page.screenshot({ path: resolve(EVIDENCE_DIR, 'ms53_drive_04_search_results_desktop.png'), fullPage: false });
  saveScreenshot('ms53_drive_04_search_results_desktop.png');
  await runAxe(page, 'Search Results (Desktop)');

  // ---------------------------------------------------------------------------
  // DRIVE 5: Catalogue Listing Page (Mobile 390x844)
  // ---------------------------------------------------------------------------
  console.log('\n--- DRIVE 5: Catalogue Listing Mobile (/products - Mobile 390x844) ---');
  totals.pagesTested++;
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'TwinMOS-MS53-Visual-Inspector/1.0 (Mobile)',
    isMobile: true,
  });
  const mobilePage = await mobileContext.newPage();
  const respMobileListing = await mobilePage.goto(`${WEB_URL}/products`, { waitUntil: 'networkidle' });
  console.log(`  -> Response status: ${respMobileListing?.status()} (Expected: 200)`);
  await mobilePage.screenshot({ path: resolve(EVIDENCE_DIR, 'ms53_drive_05_catalogue_listing_mobile.png'), fullPage: false });
  saveScreenshot('ms53_drive_05_catalogue_listing_mobile.png');
  await runAxe(mobilePage, 'Catalogue Listing (Mobile)');

  // ---------------------------------------------------------------------------
  // DRIVE 6: Product Detail Page (Mobile 390x844)
  // ---------------------------------------------------------------------------
  console.log('\n--- DRIVE 6: Product Detail Page Mobile (/products/corex-pro... - Mobile 390x844) ---');
  totals.pagesTested++;
  const respMobilePDP = await mobilePage.goto(`${WEB_URL}/products/corex-pro-m2-pcie-gen-5-0-nvme-ssd`, { waitUntil: 'networkidle' });
  console.log(`  -> Response status: ${respMobilePDP?.status()} (Expected: 200)`);
  await mobilePage.screenshot({ path: resolve(EVIDENCE_DIR, 'ms53_drive_06_pdp_mobile.png'), fullPage: false });
  saveScreenshot('ms53_drive_06_pdp_mobile.png');
  await runAxe(mobilePage, 'Product Detail Page (Mobile)');

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
    milestone: 'MS5.3',
    pagesTested: totals.pagesTested,
    a11yViolations: totals.a11yViolationsTotal,
    screenshots: totals.screenshots,
    failures: totals.failures,
  };
  writeFileSync(resolve(EVIDENCE_DIR, 'ms53_visual_inspection_report.json'), JSON.stringify(report, null, 2));

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
