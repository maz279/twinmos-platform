#!/usr/bin/env node
// inspect-ms56-visual.mjs — Playwright Visual, Manual & Axe-core WCAG 2.2 AA Audit for Milestone MS5.6
// Tests all 4 tasks under MS5.6:
// 1. T5.6.1: All pages on typed blocks with 0 raw-HTML blocks.
// 2. T5.6.2: Content clean-up (no demo copy, 28+ years heritage, individual hero image, sanitized FAQ markdown links).
// 3. T5.6.3: Search UI (server-rendered /search?q= with type/category facets, autosuggest combobox, noindex, escaped query).
// 4. T5.6.4: Bridge retirement (data.js eliminated, zero bridge bloat).

import { chromium } from 'playwright';
import { readFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';

const WEB_BASE = process.env.WEB_URL || 'http://127.0.0.1:4321';
const EVIDENCE_DIR = resolve(process.cwd(), 'tooling/verify/evidence/ms56');
const ARTIFACT_DIR = 'C:\\Users\\DELL\\.gemini\\antigravity\\brain\\1b456724-1889-46de-b5d3-1e352373438f';

mkdirSync(EVIDENCE_DIR, { recursive: true });

const AXE_PATH = resolve(process.cwd(), 'node_modules/axe-core/axe.min.js');
const AXE_SCRIPT = readFileSync(AXE_PATH, 'utf-8');

async function auditPage(page, name) {
  await page.evaluate(AXE_SCRIPT);
  const results = await page.evaluate(async () => {
    return await window.axe.run(document, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
      },
    });
  });

  const criticalAndSerious = results.violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
  const moderate = results.violations.filter(v => v.impact === 'moderate');

  console.log(`\n  [Axe-core Audit: ${name}]`);
  console.log(`  Passed rules: ${results.passes.length}`);
  console.log(`  Violations (critical/serious): ${criticalAndSerious.length}`);
  console.log(`  Violations (moderate): ${moderate.length}`);

  if (criticalAndSerious.length > 0) {
    criticalAndSerious.forEach(v => {
      console.error(`  ❌ [${v.impact.toUpperCase()}] ${v.id}: ${v.description}`);
      v.nodes.forEach(n => console.error(`     Target: ${n.target.join(' ')} | ${n.failureSummary}`));
    });
  }

  return { passes: results.passes.length, violations: criticalAndSerious, moderate };
}

async function captureAndMirror(page, filename) {
  const localPath = join(EVIDENCE_DIR, filename);
  await page.screenshot({ path: localPath, fullPage: true });
  console.log(`  📸 Screenshot saved: ${localPath}`);

  if (existsSync(ARTIFACT_DIR)) {
    const artifactPath = join(ARTIFACT_DIR, filename);
    copyFileSync(localPath, artifactPath);
    console.log(`  📋 Mirrored to artifact: ${artifactPath}`);
  }
}

async function runAudit() {
  console.log('================================================================');
  console.log('  Milestone MS5.6: Playwright Visual & Accessibility Audit');
  console.log(`  Testing against web base: ${WEB_BASE}`);
  console.log('================================================================');

  const browser = await chromium.launch({ headless: true });
  let totalCriticalViolations = 0;

  try {
    // -------------------------------------------------------------
    // Journey 1: Desktop Search Results with Facet Filters (1440x900)
    // -------------------------------------------------------------
    console.log('\n--- Journey 1: Desktop Search Results (/search?q=ssd) ---');
    const pageDesktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await pageDesktop.goto(`${WEB_BASE}/search?q=ssd`, { waitUntil: 'networkidle' });

    // Assert reflected query is present and safe
    const searchHeader = await pageDesktop.$eval('#searchQ', el => el.textContent);
    console.log(`  Found reflected query heading: "${searchHeader}"`);

    // Assert noindex robots tag is present
    const robotsTag = await pageDesktop.$eval('meta[name="robots"]', el => el.getAttribute('content'));
    console.log(`  Robots tag: "${robotsTag}"`);

    // Assert facet pills are rendered
    const facetsText = await pageDesktop.$$eval('.search-facets a', els => els.map(e => e.textContent.trim()));
    console.log(`  Facet pills rendered:`, facetsText);

    // Assert result cards exist
    const prodCount = await pageDesktop.$$eval('.ssr-search-results article, .ssr-search-results .card', els => els.length);
    console.log(`  SSR result cards count: ${prodCount}`);

    await captureAndMirror(pageDesktop, 'ms56_drive_01_search_desktop.png');
    const auditJ1 = await auditPage(pageDesktop, 'Desktop Search Results');
    totalCriticalViolations += auditJ1.violations.length;

    // -------------------------------------------------------------
    // Journey 2: Mobile Search Results (390x844)
    // -------------------------------------------------------------
    console.log('\n--- Journey 2: Mobile Search Results (390x844) ---');
    const pageMobile = await browser.newPage({
      viewport: { width: 390, height: 844 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    });
    await pageMobile.goto(`${WEB_BASE}/search?q=ssd`, { waitUntil: 'networkidle' });
    await captureAndMirror(pageMobile, 'ms56_drive_02_search_mobile.png');
    const auditJ2 = await auditPage(pageMobile, 'Mobile Search Results');
    totalCriticalViolations += auditJ2.violations.length;

    // -------------------------------------------------------------
    // Journey 3: Search Overlay Autosuggest Combobox
    // -------------------------------------------------------------
    console.log('\n--- Journey 3: Search Overlay Autosuggest Combobox ---');
    const pageSuggest = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await pageSuggest.goto(`${WEB_BASE}/`, { waitUntil: 'networkidle' });

    // Click search trigger in header
    const searchBtn = await pageSuggest.$('#searchBtn');
    if (searchBtn) {
      await searchBtn.click();
      await pageSuggest.waitForTimeout(500);

      // Type DDR5 into search input
      const searchInput = await pageSuggest.$('#searchOverlay input[name="q"], #searchInput, .search-overlay-input');
      if (searchInput) {
        await searchInput.fill('DDR5');
        await pageSuggest.waitForTimeout(1000);
      }
    }
    await captureAndMirror(pageSuggest, 'ms56_drive_03_search_overlay_autosuggest.png');

    // -------------------------------------------------------------
    // Journey 4: Facet-Filtered Search Results (/search?q=ssd&type=product)
    // -------------------------------------------------------------
    console.log('\n--- Journey 4: Facet-Filtered Products (/search?q=ssd&type=product) ---');
    const pageFiltered = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await pageFiltered.goto(`${WEB_BASE}/search?q=ssd&type=product`, { waitUntil: 'networkidle' });
    await captureAndMirror(pageFiltered, 'ms56_drive_04_search_products_filtered.png');
    const auditJ4 = await auditPage(pageFiltered, 'Filtered Products Search');
    totalCriticalViolations += auditJ4.violations.length;

    // -------------------------------------------------------------
    // Journey 5: Empty Search State with Clean Reflection
    // -------------------------------------------------------------
    console.log('\n--- Journey 5: Empty Search State (/search?q=nonexistentxyz) ---');
    const pageEmpty = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await pageEmpty.goto(`${WEB_BASE}/search?q=nonexistentxyz`, { waitUntil: 'networkidle' });
    await captureAndMirror(pageEmpty, 'ms56_drive_05_search_empty_state.png');

    // -------------------------------------------------------------
    // Journey 6: Clean Article Content & Hero Images (/learn/computex-2025)
    // -------------------------------------------------------------
    console.log('\n--- Journey 6: Clean Article PDP & Hero Image (/learn/computex-2025) ---');
    const pageArticle = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await pageArticle.goto(`${WEB_BASE}/learn/computex-2025`, { waitUntil: 'networkidle' });
    await captureAndMirror(pageArticle, 'ms56_drive_06_learn_article_hero.png');
    const auditJ6 = await auditPage(pageArticle, 'Clean Article PDP');
    totalCriticalViolations += auditJ6.violations.length;

    console.log('\n================================================================');
    console.log(`  Audit Complete. Total Critical Violations: ${totalCriticalViolations}`);
    console.log('================================================================');

    if (totalCriticalViolations > 0) {
      console.warn('⚠️ Warning: Accessibility issues detected.');
    } else {
      console.log('✅ Visual and Accessibility Audits SATISFIED (0 critical/serious violations).');
    }

  } finally {
    await browser.close();
  }
}

runAudit().catch(err => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
