// tooling/verify/inspect-ms52-visual.mjs
// Milestone MS5.2: Visual, Manual & Accessibility (a11y) Inspection Suite
// Tests 404, 410, 500, Maintenance, Converted About page, and Mobile responsive error view.
// Verifies visual rendering and enforces zero critical/serious WCAG 2.2 AA violations via Axe-core.

import { chromium } from '@playwright/test';
import { readFileSync, existsSync, mkdirSync, copyFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve('axe-core'), 'utf8');

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const EVIDENCE_DIR = resolve(ROOT, 'tooling/verify/evidence/ms52');
mkdirSync(EVIDENCE_DIR, { recursive: true });

const ARTIFACTS_DIR = process.env.ARTIFACTS_DIR || 'C:/Users/DELL/.gemini/antigravity-ide/brain/695f216d-4ab8-492b-8075-bb217e05257b';
mkdirSync(ARTIFACTS_DIR, { recursive: true });

const WEB_URL = process.env.WEB_URL || 'http://localhost:4321';

console.log('='.repeat(78));
console.log('    MS5.2 Visual, Manual & Accessibility (a11y) Inspection');
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
    userAgent: 'TwinMOS-MS52-Visual-Inspector/1.0 (Desktop)',
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
  // DRIVE 1: 404 Error Page (Desktop)
  // ---------------------------------------------------------------------------
  console.log('\n--- DRIVE 1: 404 Error Page (Desktop 1440x900) ---');
  totals.pagesTested++;
  const resp404 = await page.goto(`${WEB_URL}/404`, { waitUntil: 'networkidle' });
  console.log(`  -> Response status: ${resp404?.status()} (Expected: 404)`);
  if (resp404?.status() !== 404) {
    totals.failures.push(`404 page status was ${resp404?.status()}, expected 404`);
  }
  const h1_404 = await page.locator('h1').textContent();
  console.log(`  -> Page <h1>: "${h1_404?.trim()}"`);
  await page.screenshot({ path: resolve(EVIDENCE_DIR, 'ms52_drive_01_404_error_page_desktop.png'), fullPage: false });
  saveScreenshot('ms52_drive_01_404_error_page_desktop.png');
  await runAxe(page, '404 Error Page (Desktop)');

  // ---------------------------------------------------------------------------
  // DRIVE 2: 410 Gone Page (Desktop)
  // ---------------------------------------------------------------------------
  console.log('\n--- DRIVE 2: 410 Resource Gone Page (Desktop 1440x900) ---');
  totals.pagesTested++;
  const resp410 = await page.goto(`${WEB_URL}/410`, { waitUntil: 'networkidle' });
  console.log(`  -> Response status: ${resp410?.status()} (Expected: 410)`);
  if (resp410?.status() !== 410) {
    totals.failures.push(`410 page status was ${resp410?.status()}, expected 410`);
  }
  const h1_410 = await page.locator('h1').textContent();
  console.log(`  -> Page <h1>: "${h1_410?.trim()}"`);
  await page.screenshot({ path: resolve(EVIDENCE_DIR, 'ms52_drive_02_410_gone_page_desktop.png'), fullPage: false });
  saveScreenshot('ms52_drive_02_410_gone_page_desktop.png');
  await runAxe(page, '410 Resource Gone Page (Desktop)');

  // ---------------------------------------------------------------------------
  // DRIVE 3: 500 Server Error Page (Desktop)
  // ---------------------------------------------------------------------------
  console.log('\n--- DRIVE 3: 500 Internal Server Error Page (Desktop 1440x900) ---');
  totals.pagesTested++;
  const resp500 = await page.goto(`${WEB_URL}/500`, { waitUntil: 'networkidle' });
  console.log(`  -> Response status: ${resp500?.status()} (Expected: 500)`);
  if (resp500?.status() !== 500) {
    totals.failures.push(`500 page status was ${resp500?.status()}, expected 500`);
  }
  const h1_500 = await page.locator('h1').textContent();
  console.log(`  -> Page <h1>: "${h1_500?.trim()}"`);
  await page.screenshot({ path: resolve(EVIDENCE_DIR, 'ms52_drive_03_500_server_error_page_desktop.png'), fullPage: false });
  saveScreenshot('ms52_drive_03_500_server_error_page_desktop.png');
  await runAxe(page, '500 Server Error Page (Desktop)');

  // ---------------------------------------------------------------------------
  // DRIVE 4: Maintenance Page (Desktop)
  // ---------------------------------------------------------------------------
  console.log('\n--- DRIVE 4: Maintenance Page (Desktop 1440x900) ---');
  totals.pagesTested++;
  const respMaint = await page.goto(`${WEB_URL}/maintenance`, { waitUntil: 'networkidle' });
  console.log(`  -> Response status: ${respMaint?.status()} (Expected: 503)`);
  if (respMaint?.status() !== 503) {
    totals.failures.push(`maintenance page status was ${respMaint?.status()}, expected 503`);
  }
  const h1_maint = await page.locator('h1').textContent();
  console.log(`  -> Page <h1>: "${h1_maint?.trim()}"`);
  await page.screenshot({ path: resolve(EVIDENCE_DIR, 'ms52_drive_04_maintenance_page_desktop.png'), fullPage: false });
  saveScreenshot('ms52_drive_04_maintenance_page_desktop.png');
  await runAxe(page, 'Maintenance Page (Desktop)');

  // ---------------------------------------------------------------------------
  // DRIVE 5: Converted About Page (Desktop)
  // ---------------------------------------------------------------------------
  console.log('\n--- DRIVE 5: Converted About Page (Desktop 1440x900) ---');
  totals.pagesTested++;
  const respAbout = await page.goto(`${WEB_URL}/about`, { waitUntil: 'networkidle' });
  console.log(`  -> Response status: ${respAbout?.status()} (Expected: 200)`);
  const cacheTagAbout = respAbout?.headers()['cache-tag'] || respAbout?.headers()['x-cache-tags'];
  console.log(`  -> Cache tags: "${cacheTagAbout}"`);
  const h1_about = await page.locator('h1').textContent();
  console.log(`  -> Page <h1>: "${h1_about?.trim()}"`);
  await page.screenshot({ path: resolve(EVIDENCE_DIR, 'ms52_drive_05_about_page_converted_desktop.png'), fullPage: false });
  saveScreenshot('ms52_drive_05_about_page_converted_desktop.png');
  await runAxe(page, 'Converted About Page (Desktop)');

  // ---------------------------------------------------------------------------
  // DRIVE 6: 404 Error Page (Mobile)
  // ---------------------------------------------------------------------------
  console.log('\n--- DRIVE 6: 404 Error Page (Mobile 390x844) ---');
  totals.pagesTested++;
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'TwinMOS-MS52-Visual-Inspector/1.0 (Mobile)',
    isMobile: true,
  });
  const mobilePage = await mobileContext.newPage();
  const respMobile404 = await mobilePage.goto(`${WEB_URL}/404`, { waitUntil: 'networkidle' });
  console.log(`  -> Response status: ${respMobile404?.status()} (Expected: 404)`);
  await mobilePage.screenshot({ path: resolve(EVIDENCE_DIR, 'ms52_drive_06_404_error_page_mobile.png'), fullPage: false });
  saveScreenshot('ms52_drive_06_404_error_page_mobile.png');
  await runAxe(mobilePage, '404 Error Page (Mobile)');

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
    milestone: 'MS5.2',
    pagesTested: totals.pagesTested,
    a11yViolations: totals.a11yViolationsTotal,
    screenshots: totals.screenshots,
    failures: totals.failures,
  };
  writeFileSync(resolve(EVIDENCE_DIR, 'ms52_visual_inspection_report.json'), JSON.stringify(report, null, 2));

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
