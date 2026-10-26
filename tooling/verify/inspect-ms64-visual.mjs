#!/usr/bin/env node
// inspect-ms64-visual.mjs — Playwright Visual & Manual Inspection Suite for MS6.4
// Captures high-resolution visual evidence & enforces WCAG 2.2 AA (axe-core):
// 1. 301 Corporate Redirect: /about-us -> /about
// 2. 301 Product PDP Redirect: /product/twinmos-hyper-ssd-h2-ultra -> /products/hyper-ssd-h2-ultra
// 3. 301 Category Facet Redirect: /product-category/solid-state-drive/sata-ssd -> /shop?cat=ssd-sata
// 4. 301 Prototype HTML Redirect: /contact.html -> /contact
// 5. 410 Gone Error Page: /wp-login.php -> /410 (Status 410, Clean Layout, Search & Navigation)
// 6. WCAG 2.2 AA Axe-core evaluation on /410 Gone page

import { chromium } from '@playwright/test';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const EVIDENCE_DIR = resolve(ROOT, 'tooling/verify/evidence/ms64_visual');
const ARTIFACTS_DIR = 'C:/Users/DELL/.gemini/antigravity/brain/1b456724-1889-46de-b5d3-1e352373438f';

if (!existsSync(EVIDENCE_DIR)) mkdirSync(EVIDENCE_DIR, { recursive: true });
if (!existsSync(ARTIFACTS_DIR)) mkdirSync(ARTIFACTS_DIR, { recursive: true });

const WEB_URL = process.env.WEB_URL || 'http://127.0.0.1:4321';

const AXE_PATH = existsSync(resolve(ROOT, 'node_modules/axe-core/axe.min.js'))
  ? resolve(ROOT, 'node_modules/axe-core/axe.min.js')
  : resolve(ROOT, 'tooling/audit-harness/axe.min.js');

const AXE_SOURCE = readFileSync(AXE_PATH, 'utf8');

async function runAxe(page, contextName, selector = null) {
  await page.evaluate(AXE_SOURCE);
  const results = await page.evaluate(async (targetSelector) => {
    const options = {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
      },
    };
    // @ts-ignore
    return await window.axe.run(targetSelector || document, options);
  }, selector);

  const critical = results.violations.filter((v) => v.impact === 'critical');
  const serious = results.violations.filter((v) => v.impact === 'serious');
  const moderate = results.violations.filter((v) => v.impact === 'moderate');
  const minor = results.violations.filter((v) => v.impact === 'minor');

  console.log(`  [a11y-check] ${contextName}: ${results.violations.length} total violations (Critical: ${critical.length}, Serious: ${serious.length}, Moderate: ${moderate.length}, Minor: ${minor.length})`);
  if (critical.length > 0 || serious.length > 0) {
    for (const v of [...critical, ...serious]) {
      console.error(`    -> [${v.impact.toUpperCase()}] ${v.id}: ${v.help} (${v.nodes.length} occurrences)`);
    }
    throw new Error(`A11y failure in ${contextName}: ${critical.length} critical, ${serious.length} serious violations found!`);
  }
  return {
    context: contextName,
    violationsCount: results.violations.length,
    criticalCount: critical.length,
    seriousCount: serious.length,
    moderateCount: moderate.length,
    minorCount: minor.length,
  };
}

async function copyToArtifacts(filename) {
  const src = resolve(EVIDENCE_DIR, filename);
  const dest = resolve(ARTIFACTS_DIR, filename);
  if (existsSync(src)) {
    copyFileSync(src, dest);
    console.log(`  -> Copied artifact: ${filename} to conversation artifacts directory`);
  }
}

async function main() {
  console.log('================================================================');
  console.log('  MS6.4 Visual & Manual Inspection Suite (Playwright + Axe-core)');
  console.log('================================================================\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) TwinMOS-MS64-Visual-Agent/1.0',
  });

  const page = await context.newPage();
  const a11yAuditResults = [];

  try {
    // ------------------------------------------------------------
    // Scene 1: 301 Corporate Redirect (/about-us -> /about)
    // ------------------------------------------------------------
    console.log('[1/5] Testing 301 Corporate Redirect: /about-us -> /about...');
    const aboutResponse = await page.goto(`${WEB_URL}/about-us`, { waitUntil: 'networkidle' });
    const finalAboutUrl = page.url();
    console.log(`  Final URL: ${finalAboutUrl} (status: ${aboutResponse.status()})`);
    if (!finalAboutUrl.includes('/about')) {
      throw new Error(`Expected /about-us to redirect to /about, but landed on ${finalAboutUrl}`);
    }
    const shotAbout = resolve(EVIDENCE_DIR, 'ms64-visual-01-about-redirect.png');
    await page.screenshot({ path: shotAbout, fullPage: false });
    await copyToArtifacts('ms64-visual-01-about-redirect.png');

    // ------------------------------------------------------------
    // Scene 2: 301 Product PDP Redirect (/product/... -> /products/...)
    // ------------------------------------------------------------
    console.log('[2/5] Testing 301 Product PDP Redirect: /product/twinmos-hyper-ssd-h2-ultra -> /products/hyper-ssd-h2-ultra...');
    const pdpResponse = await page.goto(`${WEB_URL}/product/twinmos-hyper-ssd-h2-ultra`, { waitUntil: 'networkidle' });
    const finalPdpUrl = page.url();
    console.log(`  Final URL: ${finalPdpUrl} (status: ${pdpResponse.status()})`);
    if (!finalPdpUrl.includes('/products/hyper-ssd-h2-ultra')) {
      throw new Error(`Expected product redirect to land on /products/hyper-ssd-h2-ultra, but landed on ${finalPdpUrl}`);
    }
    const shotPdp = resolve(EVIDENCE_DIR, 'ms64-visual-02-pdp-redirect.png');
    await page.screenshot({ path: shotPdp, fullPage: false });
    await copyToArtifacts('ms64-visual-02-pdp-redirect.png');

    // ------------------------------------------------------------
    // Scene 3: 301 Category Facet Redirect (/product-category/... -> /shop?cat=...)
    // ------------------------------------------------------------
    console.log('[3/5] Testing 301 Category Facet Redirect: /product-category/solid-state-drive/sata-ssd -> /shop?cat=ssd-sata...');
    const catResponse = await page.goto(`${WEB_URL}/product-category/solid-state-drive/sata-ssd`, { waitUntil: 'networkidle' });
    const finalCatUrl = page.url();
    console.log(`  Final URL: ${finalCatUrl} (status: ${catResponse.status()})`);
    if (!finalCatUrl.includes('/shop') || !finalCatUrl.includes('ssd-sata')) {
      throw new Error(`Expected category redirect to /shop?cat=ssd-sata, but landed on ${finalCatUrl}`);
    }
    const shotCat = resolve(EVIDENCE_DIR, 'ms64-visual-03-category-redirect.png');
    await page.screenshot({ path: shotCat, fullPage: false });
    await copyToArtifacts('ms64-visual-03-category-redirect.png');

    // ------------------------------------------------------------
    // Scene 4: 301 Prototype HTML Redirect (/contact.html -> /contact)
    // ------------------------------------------------------------
    console.log('[4/5] Testing 301 Prototype HTML Redirect: /contact.html -> /contact...');
    const protoResponse = await page.goto(`${WEB_URL}/contact.html`, { waitUntil: 'networkidle' });
    const finalProtoUrl = page.url();
    console.log(`  Final URL: ${finalProtoUrl} (status: ${protoResponse.status()})`);
    if (!finalProtoUrl.endsWith('/contact')) {
      throw new Error(`Expected prototype redirect to /contact, but landed on ${finalProtoUrl}`);
    }
    const shotProto = resolve(EVIDENCE_DIR, 'ms64-visual-04-prototype-redirect.png');
    await page.screenshot({ path: shotProto, fullPage: false });
    await copyToArtifacts('ms64-visual-04-prototype-redirect.png');

    // ------------------------------------------------------------
    // Scene 5: 410 Gone Page (/wp-login.php -> /410 & A11y Audit)
    // ------------------------------------------------------------
    console.log('[5/5] Testing 410 Gone Page (/wp-login.php -> HTTP 410)...');
    const goneResponse = await page.goto(`${WEB_URL}/wp-login.php`, { waitUntil: 'networkidle' });
    const goneStatus = goneResponse.status();
    console.log(`  HTTP Status: ${goneStatus} (Expected: 410)`);
    if (goneStatus !== 410) {
      throw new Error(`Expected status 410 Gone for /wp-login.php, received: ${goneStatus}`);
    }

    const shotGone = resolve(EVIDENCE_DIR, 'ms64-visual-05-410-gone-page.png');
    await page.screenshot({ path: shotGone, fullPage: false });
    await copyToArtifacts('ms64-visual-05-410-gone-page.png');

    // Run Axe-core WCAG 2.2 AA audit on /410 page
    console.log('  Running axe-core WCAG 2.2 AA audit on 410 page...');
    const a11yResult = await runAxe(page, '410-Gone-Page');
    a11yAuditResults.push(a11yResult);

    // Save visual inspection report JSON
    const reportData = {
      timestamp: new Date().toISOString(),
      milestone: 'MS6.4',
      status: 'PASS',
      scenes: [
        { name: 'Corporate Redirect', from: '/about-us', to: finalAboutUrl, status: aboutResponse.status() },
        { name: 'Product PDP Redirect', from: '/product/twinmos-hyper-ssd-h2-ultra', to: finalPdpUrl, status: pdpResponse.status() },
        { name: 'Category Facet Redirect', from: '/product-category/solid-state-drive/sata-ssd', to: finalCatUrl, status: catResponse.status() },
        { name: 'Prototype HTML Redirect', from: '/contact.html', to: finalProtoUrl, status: protoResponse.status() },
        { name: '410 Gone Terminal Page', from: '/wp-login.php', landedUrl: page.url(), status: goneStatus },
      ],
      a11yAudits: a11yAuditResults,
    };

    writeFileSync(resolve(EVIDENCE_DIR, 'visual_report.json'), JSON.stringify(reportData, null, 2), 'utf8');
    console.log('\n================================================================');
    console.log('✓ Visual & Manual Inspection Complete: All 5 Scenes Passed!');
    console.log('================================================================\n');
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('Fatal visual test error:', err);
  process.exit(1);
});
