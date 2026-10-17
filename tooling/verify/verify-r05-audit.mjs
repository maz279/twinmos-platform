// tooling/verify/verify-r05-audit.mjs — Comprehensive Auditor for R0.5
// Validates all acceptance criteria for SITE-FUNC (stop-gap) and CONSENT-CSP.
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(HERE, '..', '..');
const WEB_SRC = join(ROOT, 'apps', 'web', 'src');
const WEB_DIST = join(ROOT, 'apps', 'web', 'dist');
const BASE_URL = process.env.TEST_URL || 'http://localhost:4321';

function walk(dir) {
  let results = [];
  if (!existsSync(dir)) return results;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results = results.concat(walk(full));
    } else {
      results.push(full);
    }
  }
  return results;
}

async function audit() {
  console.log('========================================================================');
  console.log('       R0.5 COMPREHENSIVE AUDIT: SITE-FUNC & CONSENT-CSP');
  console.log('========================================================================\n');

  const checklist = [];

  function record(id, title, passed, details = '') {
    checklist.push({ id, title, passed, details });
    const mark = passed ? '  [PASS]' : '  [FAIL]';
    console.log(`${mark} ${id}: ${title}`);
    if (!passed && details) {
      console.error(`         Reason: ${details}`);
    }
  }

  // --------------------------------------------------------------------------
  // Audit 1: No Inline Scripts or Event Handlers
  // --------------------------------------------------------------------------
  console.log('--- 1. CSP Strictness (No Inline Scripts / Handlers) ---');
  const sourceFiles = walk(WEB_SRC).filter(f => f.endsWith('.astro') || f.endsWith('.html'));
  const inlineScripts = [];
  const inlineHandlers = [];

  for (const f of sourceFiles) {
    const lines = readFileSync(f, 'utf8').split('\n');
    lines.forEach((l, i) => {
      if (/<script/i.test(l) && !/type=[\"']application\/ld\+json[\"']/i.test(l) && !/src=[\"']/i.test(l)) {
        inlineScripts.push(`${f}:${i + 1}: ${l.trim()}`);
      }
      if (/\bon(click|change|submit|load|error|input|keyup|keydown)=/i.test(l)) {
        inlineHandlers.push(`${f}:${i + 1}: ${l.trim()}`);
      }
    });
  }

  record(
    'CSP-01',
    'Zero inline <script> blocks across web templates',
    inlineScripts.length === 0,
    inlineScripts.join('; ')
  );

  record(
    'CSP-02',
    'Zero inline event handlers (onclick, etc.) across web templates',
    inlineHandlers.length === 0,
    inlineHandlers.join('; ')
  );

  const bannerSource = readFileSync(join(WEB_SRC, 'components', 'chrome', 'CookieBanner.astro'), 'utf8');
  record(
    'CSP-03',
    'CookieBanner copy free of "optional analytics cookies" wording',
    !bannerSource.includes('optional analytics cookies')
  );

  // --------------------------------------------------------------------------
  // Audit 2: Service Worker Hardening
  // --------------------------------------------------------------------------
  console.log('\n--- 2. Service Worker Rules ---');
  const swPath = join(ROOT, 'apps', 'web', 'public', 'sw.js');
  const swContent = readFileSync(swPath, 'utf8');

  record(
    'SW-01',
    'Service worker never caches /api/ or /internal/ routes',
    swContent.includes("url.pathname.startsWith('/api/')") &&
      swContent.includes("url.pathname.startsWith('/internal/')")
  );

  record(
    'SW-02',
    'Service worker checks Cache-Control for private and no-store',
    /no-store/i.test(swContent) && /private/i.test(swContent)
  );

  record(
    'SW-03',
    'Service worker uses versioned cache and evicts old caches on activate',
    /const\s+CACHE_NAME\s*=\s*['"]twinmos-v/.test(swContent) &&
      swContent.includes('caches.delete') &&
      swContent.includes('caches.keys')
  );

  // --------------------------------------------------------------------------
  // Audit 3: Catalogue Stop-Gap Feed
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Catalogue Stop-Gap Feed ---');
  const catalogJsPath = join(ROOT, 'apps', 'web', 'public', 'assets', 'js', 'catalog-data.js');
  const catalogExists = existsSync(catalogJsPath);
  record('CAT-01', 'catalog-data.js exists in public/assets/js/', catalogExists);

  let catDataValid = false;
  let prodCount = 0;
  if (catalogExists) {
    const raw = readFileSync(catalogJsPath, 'utf8');
    const match = raw.match(/window\.TM\s*=\s*(\{[\s\S]*?\});/);
    if (match) {
      try {
        const parsed = JSON.parse(match[1]);
        prodCount = parsed.products ? parsed.products.length : 0;
        catDataValid =
          prodCount >= 39 &&
          Array.isArray(parsed.categories) &&
          parsed.categories.length >= 10 &&
          Array.isArray(parsed.articles) &&
          parsed.articles.length >= 80;
      } catch (e) {
        /* invalid json */
      }
    }
  }

  record(
    'CAT-02',
    `catalog-data.js sets window.TM with products (${prodCount} products)`,
    catDataValid,
    `Product count: ${prodCount}`
  );

  // --------------------------------------------------------------------------
  // Audit 4: Live Interactive Probes (Browser / Playwright)
  // --------------------------------------------------------------------------
  console.log('\n--- 4. Live Interactive Acceptance (Playwright) ---');
  const browser = await chromium.launch({
    headless: true,
    channel: process.env.PLAYWRIGHT_CHROMIUM_CHANNEL || 'chrome',
  });

  try {
    // 4.1 Consent
    const ctx = await browser.newContext();
    const page = await ctx.newPage();

    let cspErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' && /Content Security Policy/i.test(msg.text())) {
        cspErrors.push(msg.text());
      }
    });

    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    const initialBar = await page.evaluate(() => {
      const b = document.getElementById('cookieBar');
      return b && window.getComputedStyle(b).display !== 'none';
    });
    record('LIVE-01', 'Cookie banner rendered on initial visit', initialBar);

    await page.click('#cookieDecline');
    await page.waitForTimeout(300);

    const declineRecord = await page.evaluate(() => {
      const raw = localStorage.getItem('twinmos_consent');
      return raw ? JSON.parse(raw) : null;
    });
    record(
      'LIVE-02',
      'Decline stores choice (analytics: false)',
      declineRecord && declineRecord.categories && declineRecord.categories.analytics === false
    );

    await page.reload({ waitUntil: 'networkidle' });
    const barHiddenReload = await page.evaluate(() => {
      const b = document.getElementById('cookieBar');
      return b && window.getComputedStyle(b).display === 'none';
    });
    record('LIVE-03', 'Decline persists across page reloads', barHiddenReload);

    await page.evaluate(() => {
      const btn = document.getElementById('cookiePreferencesBtn');
      if (btn) btn.click();
    });
    await page.waitForTimeout(300);
    const reopened = await page.evaluate(() => {
      const b = document.getElementById('cookieBar');
      return b && window.getComputedStyle(b).display !== 'none';
    });
    record('LIVE-04', 'Withdrawal: Cookie Preferences button re-opens banner', reopened);

    record('LIVE-05', 'Zero CSP errors reported by browser', cspErrors.length === 0, cspErrors.join('; '));

    // 4.2 Shop
    await page.goto(`${BASE_URL}/shop.html`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const shopCards = await page.evaluate(() => {
      return document.querySelectorAll('#shopGrid .prod-card, #shopGrid .card, .shop-grid .card').length;
    });
    record('LIVE-06', `Shop lists published products (${shopCards} rendered)`, shopCards >= 35);

    // 4.3 3 Sampled PDPs
    const pdpSlugs = [
      'voltx-ddr5-u-dimm-for-desktop',
      'corex-pro-m2-pcie-gen-5-0-nvme-ssd',
      'portable-hdd-prodrive-ultra-usb-3-0',
    ];
    let allPdpsPassed = true;
    for (const slug of pdpSlugs) {
      await page.goto(`${BASE_URL}/product.html?id=${slug}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(400);
      const title = await page.evaluate(() => (document.querySelector('h1') || {}).textContent || '');
      const hasSpecs = await page.evaluate(() => Boolean(document.querySelector('.specs-table, .spec-list, table, .pdp-specs')));
      if (!title || !hasSpecs) {
        allPdpsPassed = false;
        console.error(`      PDP failure for ${slug}: title=${title}, hasSpecs=${hasSpecs}`);
      }
    }
    record('LIVE-07', '3 sampled PDPs render product title and specifications', allPdpsPassed);

    // 4.4 Article
    await page.goto(`${BASE_URL}/article.html?id=how-much-ram-do-you-need`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    const artTitle = await page.evaluate(() => (document.querySelector('h1') || {}).textContent || '');
    const artSections = await page.evaluate(() => document.querySelectorAll('h2').length);
    record('LIVE-08', 'Article renders title and body sections', artTitle.length > 5 && artSections >= 2);

    // 4.5 Compare & Search
    await page.goto(`${BASE_URL}/compare.html`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    const compareMount = await page.evaluate(() => Boolean(document.getElementById('cmpMount')));
    record('LIVE-09', 'Compare page mounts comparison tool', compareMount);

    await page.goto(`${BASE_URL}/search.html?q=ddr5`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const searchHits = await page.evaluate(() => document.querySelectorAll('#searchMount .card, #searchMount a').length);
    record('LIVE-10', 'Search returns query results', searchHits > 0, `Hits: ${searchHits}`);

    await ctx.close();
  } finally {
    await browser.close();
  }

  // --------------------------------------------------------------------------
  // Audit Summary
  // --------------------------------------------------------------------------
  console.log('\n========================================================================');
  const failed = checklist.filter(c => !c.passed);
  console.log(`TOTAL AUDIT CHECKS: ${checklist.length} | PASSED: ${checklist.length - failed.length} | FAILED: ${failed.length}`);
  console.log('========================================================================\n');

  if (failed.length > 0) {
    console.error('CRITICAL: R0.5 AUDIT FOUND FAILURES:');
    failed.forEach(f => console.error(`  - ${f.id}: ${f.title} (${f.details})`));
    process.exit(1);
  } else {
    console.log('STATUS: 100% VERIFIED — ALL R0.5 ACCEPTANCE CRITERIA PASSED CLEANLY.');
  }
}

audit().catch(err => {
  console.error('[verify-r05-audit] Fatal error:', err);
  process.exit(1);
});
