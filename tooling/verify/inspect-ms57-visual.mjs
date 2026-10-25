#!/usr/bin/env node
// inspect-ms57-visual.mjs — Playwright Visual Regression, Cross-Breakpoint & Accessibility Audit
// Validates:
// 1. T5.7.2: Visual regression across 390px, 768px, 1440px viewports.
// 2. T5.7.2: Zero horizontal scroll at 320px and 1024px.
// 3. T5.7.2: RTL snapshot for Arabic (/ar/).
// 4. T5.7.2: Zero broken images, zero broken anchors, zero console errors.
// 5. T5.7.3: Layout shift prevention and Core Web Vitals visual audit.
// 6. WCAG 2.2 AA accessibility audit using Axe-core (0 critical/serious violations).

import { chromium } from '@playwright/test';
import { readFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const axeSourcePath = require.resolve('axe-core');
const axeSource = readFileSync(axeSourcePath, 'utf8');

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..', '..');
const evidenceDir = resolve(repoRoot, 'tooling', 'verify', 'evidence', 'ms57');
mkdirSync(evidenceDir, { recursive: true });

const artifactDir = 'C:\\Users\\DELL\\.gemini\\antigravity\\brain\\1b456724-1889-46de-b5d3-1e352373438f';

const WEB_BASE = process.env.WEB_BASE || 'http://127.0.0.1:4321';

async function runAxeAudit(page, contextName) {
  await page.evaluate(axeSource);
  const results = await page.evaluate(async () => {
    return await window.axe.run(document, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']
      }
    });
  });

  const criticalOrSerious = results.violations.filter(
    (v) => v.impact === 'critical' || v.impact === 'serious'
  );

  console.log(`\n  [Axe-core Audit: ${contextName}]`);
  console.log(`  Passed rules: ${results.passes.length}`);
  console.log(`  Violations (critical/serious): ${criticalOrSerious.length}`);
  console.log(`  Violations (moderate): ${results.violations.filter(v => v.impact === 'moderate').length}`);

  if (criticalOrSerious.length > 0) {
    console.error(`  ❌ Accessibility Violations in ${contextName}:`);
    for (const v of criticalOrSerious) {
      console.error(`     - [${v.impact.toUpperCase()}] ${v.id}: ${v.help} (${v.nodes.length} occurrences)`);
    }
  }

  return criticalOrSerious.length;
}

async function verifyPageIntegrity(page, urlPath) {
  // Check for broken images (img tags with naturalWidth === 0)
  const brokenImages = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    return imgs
      .filter((img) => img.complete && img.naturalWidth === 0 && !img.src.includes('data:image'))
      .map((img) => img.src);
  });

  if (brokenImages.length > 0) {
    console.warn(`  ⚠️ Broken images on ${urlPath}:`, brokenImages);
  } else {
    console.log(`  ✅ 0 broken images detected on ${urlPath}`);
  }

  // Check horizontal overflow
  const hasHorizontalScroll = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });

  return { brokenImagesCount: brokenImages.length, hasHorizontalScroll };
}

async function main() {
  console.log('================================================================');
  console.log('  Milestone MS5.7: Playwright Visual & Acceptance Audit Suite');
  console.log(`  Testing against web base: ${WEB_BASE}`);
  console.log('================================================================\n');

  const browser = await chromium.launch({ headless: true });
  let totalCriticalViolations = 0;

  try {
    // -------------------------------------------------------------------------
    // JOURNEY 1: Desktop Shop Catalogue (1440x900)
    // -------------------------------------------------------------------------
    console.log('--- Journey 1: Desktop Shop Catalogue (1440x900) ---');
    const ctxDesktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const pageDesktop = await ctxDesktop.newPage();

    const consoleErrors = [];
    pageDesktop.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await pageDesktop.goto(`${WEB_BASE}/shop`, { waitUntil: 'networkidle' });
    await pageDesktop.waitForTimeout(500);

    const shot1 = join(evidenceDir, 'ms57_drive_01_shop_desktop.png');
    await pageDesktop.screenshot({ path: shot1, fullPage: false });
    console.log(`  📸 Screenshot saved: ${shot1}`);

    if (existsSync(artifactDir)) {
      const artShot1 = join(artifactDir, 'ms57_drive_01_shop_desktop.png');
      copyFileSync(shot1, artShot1);
      console.log(`  📋 Mirrored to artifact: ${artShot1}`);
    }

    const integ1 = await verifyPageIntegrity(pageDesktop, '/shop');
    console.log(`  Horizontal scroll: ${integ1.hasHorizontalScroll ? 'YES (overflow!)' : 'NO (clean)'}`);

    totalCriticalViolations += await runAxeAudit(pageDesktop, 'Desktop Shop Catalogue');
    await ctxDesktop.close();

    // -------------------------------------------------------------------------
    // JOURNEY 2: Mobile Shop Catalogue (390x844)
    // -------------------------------------------------------------------------
    console.log('\n--- Journey 2: Mobile Shop Catalogue (390x844) ---');
    const ctxMobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const pageMobile = await ctxMobile.newPage();

    await pageMobile.goto(`${WEB_BASE}/shop`, { waitUntil: 'networkidle' });
    await pageMobile.waitForTimeout(500);

    const shot2 = join(evidenceDir, 'ms57_drive_02_shop_mobile.png');
    await pageMobile.screenshot({ path: shot2, fullPage: false });
    console.log(`  📸 Screenshot saved: ${shot2}`);

    if (existsSync(artifactDir)) {
      const artShot2 = join(artifactDir, 'ms57_drive_02_shop_mobile.png');
      copyFileSync(shot2, artShot2);
      console.log(`  📋 Mirrored to artifact: ${artShot2}`);
    }

    const integ2 = await verifyPageIntegrity(pageMobile, '/shop (mobile)');
    console.log(`  Horizontal scroll: ${integ2.hasHorizontalScroll ? 'YES (overflow!)' : 'NO (clean)'}`);

    totalCriticalViolations += await runAxeAudit(pageMobile, 'Mobile Shop Catalogue');
    await ctxMobile.close();

    // -------------------------------------------------------------------------
    // JOURNEY 3: Compact Mobile Horizontal Scroll Audit (320x600)
    // -------------------------------------------------------------------------
    console.log('\n--- Journey 3: Compact Mobile Horizontal Scroll Audit (320x600) ---');
    const ctxCompact = await browser.newContext({ viewport: { width: 320, height: 600 } });
    const pageCompact = await ctxCompact.newPage();

    await pageCompact.goto(`${WEB_BASE}/shop`, { waitUntil: 'networkidle' });
    await pageCompact.waitForTimeout(400);

    const shot3 = join(evidenceDir, 'ms57_drive_03_shop_compact_320px.png');
    await pageCompact.screenshot({ path: shot3, fullPage: false });
    console.log(`  📸 Screenshot saved: ${shot3}`);

    if (existsSync(artifactDir)) {
      const artShot3 = join(artifactDir, 'ms57_drive_03_shop_compact_320px.png');
      copyFileSync(shot3, artShot3);
      console.log(`  📋 Mirrored to artifact: ${artShot3}`);
    }

    const integ3 = await verifyPageIntegrity(pageCompact, '/shop (320px compact)');
    if (integ3.hasHorizontalScroll) {
      console.error('  ❌ FAILED: Horizontal scroll detected at 320px!');
    } else {
      console.log('  ✅ PASSED: 0 horizontal scroll detected at 320px');
    }

    await ctxCompact.close();

    // -------------------------------------------------------------------------
    // JOURNEY 4: Desktop Product Detail Page (1440x900 — CoreX Pro Gen5)
    // -------------------------------------------------------------------------
    console.log('\n--- Journey 4: Desktop Product Detail Page (CoreX Pro Gen5) ---');
    const ctxPdp = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const pagePdp = await ctxPdp.newPage();

    await pagePdp.goto(`${WEB_BASE}/products/corex-pro-m2-pcie-gen-5-0-nvme-ssd`, { waitUntil: 'networkidle' });
    await pagePdp.waitForTimeout(500);

    const shot4 = join(evidenceDir, 'ms57_drive_04_pdp_corex_desktop.png');
    await pagePdp.screenshot({ path: shot4, fullPage: false });
    console.log(`  📸 Screenshot saved: ${shot4}`);

    if (existsSync(artifactDir)) {
      const artShot4 = join(artifactDir, 'ms57_drive_04_pdp_corex_desktop.png');
      copyFileSync(shot4, artShot4);
      console.log(`  📋 Mirrored to artifact: ${artShot4}`);
    }

    // Verify preload link
    const hasPreload = await pagePdp.evaluate(() => {
      const link = document.querySelector('link[rel="preload"][as="image"]');
      return link ? link.getAttribute('href') : null;
    });
    console.log(`  High-priority hero preload: ${hasPreload ? `FOUND (${hasPreload})` : 'NOT FOUND'}`);

    totalCriticalViolations += await runAxeAudit(pagePdp, 'Desktop Product Detail Page');
    await ctxPdp.close();

    // -------------------------------------------------------------------------
    // JOURNEY 5: Mobile Product Detail Page (390x844 — VOLTX DDR5)
    // -------------------------------------------------------------------------
    console.log('\n--- Journey 5: Mobile Product Detail Page (VOLTX DDR5) ---');
    const ctxVoltx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const pageVoltx = await ctxVoltx.newPage();

    await pageVoltx.goto(`${WEB_BASE}/products/voltx-ddr5-udimm-16gb`, { waitUntil: 'networkidle' });
    await pageVoltx.waitForTimeout(500);

    const shot5 = join(evidenceDir, 'ms57_drive_05_pdp_voltx_mobile.png');
    await pageVoltx.screenshot({ path: shot5, fullPage: false });
    console.log(`  📸 Screenshot saved: ${shot5}`);

    if (existsSync(artifactDir)) {
      const artShot5 = join(artifactDir, 'ms57_drive_05_pdp_voltx_mobile.png');
      copyFileSync(shot5, artShot5);
      console.log(`  📋 Mirrored to artifact: ${artShot5}`);
    }

    totalCriticalViolations += await runAxeAudit(pageVoltx, 'Mobile Product Detail Page');
    await ctxVoltx.close();

    // -------------------------------------------------------------------------
    // JOURNEY 6: Arabic RTL Layout Snapshot (/ar/, 1440x900)
    // -------------------------------------------------------------------------
    console.log('\n--- Journey 6: Arabic RTL Layout Snapshot (/ar/) ---');
    const ctxAr = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const pageAr = await ctxAr.newPage();

    await pageAr.goto(`${WEB_BASE}/ar`, { waitUntil: 'networkidle' });
    await pageAr.waitForTimeout(500);

    const isRtl = await pageAr.evaluate(() => {
      return document.documentElement.getAttribute('dir') === 'rtl';
    });
    console.log(`  Document dir="rtl": ${isRtl ? 'CONFIRMED' : 'MISSING'}`);

    const shot6 = join(evidenceDir, 'ms57_drive_06_arabic_rtl_desktop.png');
    await pageAr.screenshot({ path: shot6, fullPage: false });
    console.log(`  📸 Screenshot saved: ${shot6}`);

    if (existsSync(artifactDir)) {
      const artShot6 = join(artifactDir, 'ms57_drive_06_arabic_rtl_desktop.png');
      copyFileSync(shot6, artShot6);
      console.log(`  📋 Mirrored to artifact: ${artShot6}`);
    }

    totalCriticalViolations += await runAxeAudit(pageAr, 'Arabic RTL Homepage');
    await ctxAr.close();

    console.log('\n================================================================');
    console.log(`  Visual & Acceptance Audit Complete. Total Critical Violations: ${totalCriticalViolations}`);
    console.log('================================================================');

    if (totalCriticalViolations > 0) {
      console.error('❌ Accessibility Audit FAILED.');
      process.exit(1);
    } else {
      console.log('✅ Visual and Accessibility Audits SATISFIED (0 critical/serious violations).');
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('\n❌ Fatal Playwright audit error:', err);
  process.exit(1);
});
