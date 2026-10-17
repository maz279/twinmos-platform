// tooling/verify/verify-r05-probes.mjs — Interactive Playwright probes for R0.5
// Asserts SITE-FUNC and CONSENT-CSP on live server.
import { chromium } from '@playwright/test';

const BASE_URL = process.env.TEST_URL || 'http://localhost:4321';

async function run() {
  console.log(`[R0.5 PROBES] Starting verification against ${BASE_URL}...`);
  const browser = await chromium.launch({
    headless: true,
    channel: process.env.PLAYWRIGHT_CHROMIUM_CHANNEL || 'chrome',
  });
  const results = { passed: [], failed: [] };

  function assert(name, condition, details = '') {
    if (condition) {
      console.log(`  ✓ ${name}`);
      results.passed.push(name);
    } else {
      console.error(`  ✗ ${name} — ${details}`);
      results.failed.push({ name, details });
    }
  }

  try {
    // =========================================================================
    // Probe 1: Consent Decline & Persistence
    // =========================================================================
    console.log('\n--- Probe 1: Consent Decline & Persistence ---');
    const ctx1 = await browser.newContext();
    const page1 = await ctx1.newPage();

    let cspViolations1 = [];
    page1.on('console', (msg) => {
      if (msg.type() === 'error' && /content security policy/i.test(msg.text())) {
        cspViolations1.push(msg.text());
      }
    });

    await page1.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });

    // 1.1 Cookie bar visible initially
    const barVisibleInitial = await page1.evaluate(() => {
      const bar = document.getElementById('cookieBar');
      return bar && window.getComputedStyle(bar).display !== 'none';
    });
    assert('Cookie banner visible on first visit without consent', barVisibleInitial);

    // 1.2 Click Decline
    await page1.click('#cookieDecline');
    await page1.waitForTimeout(300);

    const barHiddenAfterDecline = await page1.evaluate(() => {
      const bar = document.getElementById('cookieBar');
      return bar && window.getComputedStyle(bar).display === 'none';
    });
    assert('Cookie banner hidden after clicking Decline', barHiddenAfterDecline);

    const consentDeclineRecord = await page1.evaluate(() => {
      const raw = localStorage.getItem('twinmos_consent');
      return raw ? JSON.parse(raw) : null;
    });
    assert(
      'Decline saves consent record with analytics: false',
      consentDeclineRecord &&
        consentDeclineRecord.categories &&
        consentDeclineRecord.categories.essential === true &&
        consentDeclineRecord.categories.analytics === false,
      JSON.stringify(consentDeclineRecord)
    );

    // 1.3 Reload and verify persistence
    await page1.reload({ waitUntil: 'networkidle' });
    const barHiddenAfterReload = await page1.evaluate(() => {
      const bar = document.getElementById('cookieBar');
      return bar && window.getComputedStyle(bar).display === 'none';
    });
    assert('Decline choice persists across page reloads', barHiddenAfterReload);

    // 1.4 Withdrawal / Re-open via Cookie Preferences button
    await page1.evaluate(() => {
      const btn = document.getElementById('cookiePreferencesBtn');
      if (btn) btn.click();
    });
    await page1.waitForTimeout(300);

    const barReopened = await page1.evaluate(() => {
      const bar = document.getElementById('cookieBar');
      return bar && window.getComputedStyle(bar).display !== 'none';
    });
    assert('Cookie Preferences button successfully re-opens banner', barReopened);

    // 1.5 Click Accept
    await page1.click('#cookieAccept');
    await page1.waitForTimeout(300);

    const consentAcceptRecord = await page1.evaluate(() => {
      const raw = localStorage.getItem('twinmos_consent');
      return raw ? JSON.parse(raw) : null;
    });
    assert(
      'Accept saves consent record with analytics: true',
      consentAcceptRecord &&
        consentAcceptRecord.categories &&
        consentAcceptRecord.categories.analytics === true,
      JSON.stringify(consentAcceptRecord)
    );

    assert('Zero CSP violations during consent flow', cspViolations1.length === 0, cspViolations1.join('; '));

    await ctx1.close();

    // =========================================================================
    // Probe 2: Catalogue & Shop Listing
    // =========================================================================
    console.log('\n--- Probe 2: Catalogue & Shop Listing ---');
    const ctx2 = await browser.newContext();
    const page2 = await ctx2.newPage();

    let jsErrors = [];
    page2.on('pageerror', (err) => jsErrors.push(err.message));

    await page2.goto(`${BASE_URL}/shop.html`, { waitUntil: 'networkidle' });
    await page2.waitForTimeout(600);

    const shopStats = await page2.evaluate(() => {
      const cards = document.querySelectorAll('#shopGrid .prod-card, #shopGrid .card, .shop-grid .card, .shop-grid .prod-card');
      const chips = document.querySelectorAll('#catChips button, #catChips a, .filter-chip');
      const jsErrAttr = document.body.getAttribute('data-js-error');
      const tmProdCount = (window.TM && window.TM.products) ? window.TM.products.length : 0;
      return { cardCount: cards.length, chipCount: chips.length, jsErrAttr, tmProdCount };
    });

    assert('Shop loads window.TM with products', shopStats.tmProdCount >= 39, `Found ${shopStats.tmProdCount}`);
    assert('Shop renders product cards in grid', shopStats.cardCount >= 35, `Rendered ${shopStats.cardCount} cards`);
    assert('Category chips exist for filtering', shopStats.chipCount > 0, `Chips: ${shopStats.chipCount}`);
    assert('Zero JS errors on Shop page', !shopStats.jsErrAttr && jsErrors.length === 0, jsErrors.join('; '));

    await ctx2.close();

    // =========================================================================
    // Probe 3: Sampled PDPs (Product Detail Pages)
    // =========================================================================
    console.log('\n--- Probe 3: 3 Sampled PDPs ---');
    const sampledPdpSlugs = [
      'voltx-ddr5-u-dimm-for-desktop',
      'corex-pro-m2-pcie-gen-5-0-nvme-ssd',
      'portable-hdd-prodrive-ultra-usb-3-0',
    ];

    for (const slug of sampledPdpSlugs) {
      const ctxPdp = await browser.newContext();
      const pagePdp = await ctxPdp.newPage();
      let pdpErrors = [];
      pagePdp.on('pageerror', (e) => pdpErrors.push(e.message));

      await pagePdp.goto(`${BASE_URL}/product.html?id=${slug}`, { waitUntil: 'networkidle' });
      await pagePdp.waitForTimeout(500);

      const pdpData = await pagePdp.evaluate(() => {
        const titleEl = document.querySelector('h1') || document.querySelector('.pdp-title');
        const specTable = document.querySelector('.specs-table') || document.querySelector('.spec-list') || document.querySelector('.pdp-specs') || document.querySelector('table');
        const jsErr = document.body.getAttribute('data-js-error');
        const specRows = specTable ? specTable.querySelectorAll('tr, li, .spec-row').length : 0;
        return {
          title: titleEl ? titleEl.textContent.trim() : '',
          specRows: specRows,
          hasSpecs: Boolean(specTable),
          jsErr,
        };
      });

      assert(`PDP [${slug}] renders product title`, pdpData.title.length > 5, `Title: ${pdpData.title}`);
      assert(`PDP [${slug}] renders specifications`, pdpData.hasSpecs || pdpData.specRows > 0, `Spec rows: ${pdpData.specRows}`);
      assert(`PDP [${slug}] zero JS errors`, !pdpData.jsErr && pdpErrors.length === 0, pdpErrors.join('; '));

      await ctxPdp.close();
    }

    // =========================================================================
    // Probe 4: Article Rendering
    // =========================================================================
    console.log('\n--- Probe 4: Article Rendering ---');
    const ctxArt = await browser.newContext();
    const pageArt = await ctxArt.newPage();
    let artErrors = [];
    pageArt.on('pageerror', (e) => artErrors.push(e.message));

    await pageArt.goto(`${BASE_URL}/article.html?id=how-much-ram-do-you-need`, { waitUntil: 'networkidle' });
    await pageArt.waitForTimeout(500);

    const artData = await pageArt.evaluate(() => {
      const h1 = document.querySelector('h1');
      const bodySections = document.querySelectorAll('.art-body h2, .article-body h2, article h2');
      const toc = document.querySelector('.art-toc') || document.querySelector('aside[aria-label="On this page"]');
      const jsErr = document.body.getAttribute('data-js-error');
      return {
        title: h1 ? h1.textContent.trim() : '',
        sectionCount: bodySections.length,
        hasToc: Boolean(toc),
        jsErr,
      };
    });

    assert('Article renders headline', artData.title.length > 5, `Headline: ${artData.title}`);
    assert('Article renders body sections', artData.sectionCount >= 2, `Sections: ${artData.sectionCount}`);
    assert('Article zero JS errors', !artData.jsErr && artErrors.length === 0, artErrors.join('; '));

    await ctxArt.close();

    // =========================================================================
    // Probe 5: Compare & Search
    // =========================================================================
    console.log('\n--- Probe 5: Compare & Search ---');
    const ctxComp = await browser.newContext();
    const pageComp = await ctxComp.newPage();

    // Pre-populate compare tray with 2 products
    await pageComp.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await pageComp.evaluate(() => {
      localStorage.setItem('tm_compare_v1', JSON.stringify([
        'voltx-ddr5-u-dimm-for-desktop',
        'portable-hdd-prodrive-ultra-usb-3-0'
      ]));
    });

    await pageComp.goto(`${BASE_URL}/compare.html`, { waitUntil: 'networkidle' });
    await pageComp.waitForTimeout(500);

    const compData = await pageComp.evaluate(() => {
      const heads = document.querySelectorAll('#cmpMount .cmp-prod-head');
      const table = document.querySelector('#cmpMount table.cmp');
      const jsErr = document.body.getAttribute('data-js-error');
      return { count: heads.length, hasTable: Boolean(table), jsErr };
    });

    assert('Compare page renders compared products', compData.count >= 2 || compData.hasTable, `Product heads: ${compData.count}`);
    assert('Compare page zero JS errors', !compData.jsErr);

    // Search probe
    await pageComp.goto(`${BASE_URL}/search.html?q=ddr5`, { waitUntil: 'networkidle' });
    await pageComp.waitForTimeout(600);

    const searchData = await pageComp.evaluate(() => {
      const hits = document.querySelectorAll('#searchMount .card, #searchMount section, #searchMount a');
      const jsErr = document.body.getAttribute('data-js-error');
      return { hitCount: hits.length, jsErr };
    });

    assert('Search query "ddr5" returns results', searchData.hitCount > 0, `Hits: ${searchData.hitCount}`);
    assert('Search page zero JS errors', !searchData.jsErr);

    await ctxComp.close();

  } finally {
    await browser.close();
  }

  console.log('\n=============================================================');
  console.log(`[R0.5 PROBES SUMMARY] Passed: ${results.passed.length}, Failed: ${results.failed.length}`);
  if (results.failed.length > 0) {
    console.error('FAILED PROBES:', results.failed);
    process.exit(1);
  } else {
    console.log('ALL R0.5 PROBES PASSED PERFECTLY!');
  }
}

run().catch((err) => {
  console.error('[R0.5 PROBES FATAL ERROR]:', err);
  process.exit(1);
});
