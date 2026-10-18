// tooling/verify/verify-ms15-audit.mjs — Comprehensive Auditor for Milestone MS1.5
// Public-site stop-gap: catalogue, consent, CSP (Tasks T1.5.1 – T1.5.5)
// Findings: Z-05, Z-19, Z-27, NF-30 | Gates: SITE-FUNC (stop-gap), CONSENT-CSP
import { readFileSync, existsSync, readdirSync, statSync, createReadStream } from 'node:fs';
import { join, resolve, extname, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer, request } from 'node:http';
import { chromium } from '@playwright/test';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(HERE, '..', '..');
const WEB_SRC = join(ROOT, 'apps', 'web', 'src');
const WEB_DIST = join(ROOT, 'apps', 'web', 'dist');
const WEB_PUBLIC = join(ROOT, 'apps', 'web', 'public');

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

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.pdf': 'application/pdf',
};

function createStaticServer(port = 4321) {
  const serveRoot = existsSync(join(WEB_DIST, 'client')) ? join(WEB_DIST, 'client') : WEB_DIST;
  const server = createServer((req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname);
    const clean = normalize(urlPath).replaceAll('..', '');

    // Reverse-proxy /api/ to running API daemon on port 8787 (like Nginx does)
    if (urlPath.startsWith('/api/')) {
      const proxyReq = request(`http://127.0.0.1:8787${req.url}`, {
        method: req.method,
        headers: { ...req.headers, host: '127.0.0.1:8787' },
      }, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
      });
      proxyReq.on('error', () => {
        res.writeHead(502).end('Bad Gateway');
      });
      req.pipe(proxyReq);
      return;
    }
    const candidate = join(serveRoot, clean);
    const rootCandidate = join(ROOT, clean);

    if (!candidate.startsWith(serveRoot + sep) && candidate !== serveRoot) {
      res.writeHead(403).end();
      return;
    }

    const tries = [
      candidate,
      join(serveRoot, clean, 'index.html'),
      join(serveRoot, clean + '.html'),
      rootCandidate,
      join(ROOT, clean, 'index.html'),
    ].filter((p) => existsSync(p) && statSync(p).isFile());

    // Security headers matching CSP
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' http://127.0.0.1:8787 https:; frame-src https://challenges.cloudflare.com; object-src 'none'; base-uri 'self'; form-action 'self'");
    res.setHeader('X-Content-Type-Options', 'nosniff');

    if (tries.length > 0) {
      const filePath = tries[0];
      res.writeHead(200, {
        'content-type': MIME[extname(filePath).toLowerCase()] ?? 'application/octet-stream',
      });
      createReadStream(filePath).pipe(res);
      return;
    }

    const notFound = join(serveRoot, '404.html');
    if (existsSync(notFound)) {
      res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
      createReadStream(notFound).pipe(res);
    } else {
      res.writeHead(404).end('Not Found');
    }
  });

  return new Promise((resolveReady) => {
    server.listen(port, '127.0.0.1', () => {
      resolveReady(server);
    });
  });
}

const ALL_29_ROUTES = [
  '/',
  '/shop.html',
  '/product.html?id=corex-pro-m2-pcie-gen-5-0-nvme-ssd',
  '/product.html?id=voltx-ddr5-u-dimm-for-desktop',
  '/where-to-buy.html',
  '/compatibility.html',
  '/support.html',
  '/rma.html',
  '/careers.html',
  '/partners.html',
  '/quote.html',
  '/contact.html',
  '/about.html',
  '/technology.html',
  '/gaming.html',
  '/solutions.html',
  '/learn.html',
  '/learn-guides.html',
  '/learn-explained.html',
  '/learn-benchmarks.html',
  '/learn-glossary.html',
  '/learn-blog.html',
  '/news.html',
  '/legal.html',
  '/article.html?id=what-is-xmp',
  '/search.html?q=DDR5',
  '/sitemap.html',
  '/compare.html',
  '/ar.html',
];

async function runAudit() {
  console.log('========================================================================');
  console.log('   MS1.5 COMPREHENSIVE AUDIT: PUBLIC-SITE STOP-GAP (CATALOGUE, CONSENT, CSP)');
  console.log('   Roadmap v3.1 Phased (2026-10-17) | Tasks T1.5.1 – T1.5.5');
  console.log('   Findings: Z-05, Z-19, Z-27, NF-30 | Gates: SITE-FUNC, CONSENT-CSP');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  function record(id, title, ok, details = '') {
    if (ok) {
      passed++;
      console.log(`  [PASS] ${id}: ${title}`);
    } else {
      failed++;
      console.error(`  [FAIL] ${id}: ${title}`);
      if (details) console.error(`         Reason: ${details}`);
    }
  }

  // --------------------------------------------------------------------------
  // 1. T1.5.1: Inline Scripts & Event Handlers (Z-19 / NF-30)
  // --------------------------------------------------------------------------
  console.log('--- 1. T1.5.1: Zero Inline Scripts & Handlers (CSP Strictness) ---');
  const sourceFiles = walk(WEB_SRC).filter((f) => f.endsWith('.astro') || f.endsWith('.html'));
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
    'T1.5.1a',
    'Zero inline <script> blocks across web templates (excluding application/ld+json)',
    inlineScripts.length === 0,
    inlineScripts.join('; ')
  );

  record(
    'T1.5.1b',
    'Zero inline event handlers (onclick, etc.) across web templates',
    inlineHandlers.length === 0,
    inlineHandlers.join('; ')
  );

  const layoutPath = join(WEB_SRC, 'layouts', 'Layout.astro');
  const layoutContent = readFileSync(layoutPath, 'utf8');
  record(
    'T1.5.1c',
    'Layout.astro carries turnstile site key via <meta> tag without inline script',
    layoutContent.includes('<meta name="turnstile-site-key"') && !layoutContent.includes('window.TURNSTILE_SITE_KEY = turnstileSiteKey')
  );

  const footerPath = join(WEB_SRC, 'components', 'chrome', 'Footer.astro');
  const footerContent = readFileSync(footerPath, 'utf8');
  record(
    'T1.5.1d',
    'Footer.astro has cookiePreferencesBtn without inline onclick attribute',
    footerContent.includes('id="cookiePreferencesBtn"') && !footerContent.includes('onclick=')
  );

  // --------------------------------------------------------------------------
  // 2. T1.5.2: Catalogue Stop-Gap Feed (Z-05)
  // --------------------------------------------------------------------------
  console.log('\n--- 2. T1.5.2: Catalogue Stop-Gap Feed & Clean Prototype ---');
  const catalogJsPath = join(WEB_PUBLIC, 'assets', 'js', 'catalog-data.js');
  const catalogExists = existsSync(catalogJsPath);
  record('T1.5.2a', 'catalog-data.js exists in public/assets/js/', catalogExists);

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
          prodCount >= 35 &&
          Array.isArray(parsed.categories) &&
          parsed.categories.length >= 8 &&
          Array.isArray(parsed.articles) &&
          parsed.articles.length >= 10;
      } catch (e) {}
    }
  }

  record(
    'T1.5.2b',
    `catalog-data.js sets window.TM with products, categories, articles (${prodCount} products)`,
    catDataValid,
    `Product count: ${prodCount}`
  );

  const layoutInitPath = join(WEB_PUBLIC, 'assets', 'js', 'layout-init.js');
  const layoutInitContent = readFileSync(layoutInitPath, 'utf8');
  const consentIdx = layoutInitContent.indexOf('assets/js/consent.js');
  const catalogIdx = layoutInitContent.indexOf('assets/js/catalog-data.js');
  const appIdx = layoutInitContent.indexOf('assets/js/app.js');
  record(
    'T1.5.2c',
    'layout-init.js loads consent.js and catalog-data.js before app.js',
    consentIdx > -1 && catalogIdx > -1 && appIdx > -1 && consentIdx < appIdx && catalogIdx < appIdx
  );

  const appJsPath = join(WEB_PUBLIC, 'assets', 'js', 'app.js');
  const appJsContent = readFileSync(appJsPath, 'utf8');
  record(
    'T1.5.2d',
    'app.js is free of prototype toasts and demo copy phrases',
    !appJsContent.includes('in this prototype') &&
      !appJsContent.includes('Demo compatibility database for the prototype') &&
      !appJsContent.includes('full localization ships with the production i18n pipeline')
  );

  // --------------------------------------------------------------------------
  // 3. T1.5.3: Cookie Consent Engine (Z-19)
  // --------------------------------------------------------------------------
  console.log('\n--- 3. T1.5.3: Cookie Consent Engine (Decline & Withdrawal) ---');
  const bannerSource = readFileSync(join(WEB_SRC, 'components', 'chrome', 'CookieBanner.astro'), 'utf8');
  record(
    'T1.5.3a',
    'CookieBanner copy is strictly free of "optional analytics cookies" wording',
    !bannerSource.includes('optional analytics cookies')
  );

  record(
    'T1.5.3b',
    'CookieBanner provides both cookieAccept and cookieDecline action buttons',
    bannerSource.includes('id="cookieAccept"') && bannerSource.includes('id="cookieDecline"')
  );

  const consentJsPath = join(WEB_PUBLIC, 'assets', 'js', 'consent.js');
  const consentJsContent = readFileSync(consentJsPath, 'utf8');
  record(
    'T1.5.3c',
    'consent.js binds cookieDecline to saveConsent(false) and hides banner',
    consentJsContent.includes('cookieDecline') && consentJsContent.includes('saveConsent(false)')
  );

  record(
    'T1.5.3d',
    'consent.js binds cookiePreferencesBtn to openConsentBar for consent withdrawal',
    consentJsContent.includes('cookiePreferencesBtn') && consentJsContent.includes('openConsentBar')
  );

  // --------------------------------------------------------------------------
  // 4. T1.5.4: Service Worker Hardening (Z-27)
  // --------------------------------------------------------------------------
  console.log('\n--- 4. T1.5.4: Service Worker Hardening (sw.js) ---');
  const swPath = join(WEB_PUBLIC, 'sw.js');
  const swContent = readFileSync(swPath, 'utf8');

  record(
    'T1.5.4a',
    'sw.js excludes /api/ and /internal/ routes from offline caching',
    swContent.includes("url.pathname.startsWith('/api/')") && swContent.includes("url.pathname.startsWith('/internal/')")
  );

  record(
    'T1.5.4b',
    'sw.js respects Cache-Control private and no-store headers',
    /no-store/i.test(swContent) && /private/i.test(swContent) && /no-cache/i.test(swContent)
  );

  record(
    'T1.5.4c',
    'sw.js uses versioned cache (twinmos-v*) and evicts old caches on activate',
    /const\s+CACHE_NAME\s*=\s*['"]twinmos-v/.test(swContent) &&
      swContent.includes('caches.delete') &&
      swContent.includes('caches.keys')
  );

  // --------------------------------------------------------------------------
  // 5. T1.5.5: Live Interactive Playwright Walkthrough (SITE-FUNC & CSP)
  // --------------------------------------------------------------------------
  console.log('\n--- 5. T1.5.5: Live Interactive Playwright Walkthrough (SITE-FUNC & CSP) ---');
  const TEST_PORT = 4399;
  const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

  const server = await createStaticServer(TEST_PORT);
  console.log(`  [+] In-process test HTTP server listening on ${BASE_URL}`);

  const browser = await chromium.launch({
    headless: true,
  });

  try {
    // 5.1 Consent Decline & Persistence
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();

    let cspErrors = [];
    let jsErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        if (/Content Security Policy/i.test(msg.text())) {
          cspErrors.push(msg.text());
        } else {
          jsErrors.push(msg.text());
        }
      }
    });

    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    await page.waitForSelector('#cookieBar', { state: 'visible', timeout: 3000 }).catch(() => {});
    const initialBar = await page.evaluate(() => {
      const b = document.getElementById('cookieBar');
      return b && window.getComputedStyle(b).display !== 'none';
    });
    record('T1.5.5a', 'Cookie banner rendered on initial visit', initialBar);

    await page.click('#cookieDecline');
    await page.waitForTimeout(300);

    const declineRecord = await page.evaluate(() => {
      const raw = localStorage.getItem('twinmos_consent');
      return raw ? JSON.parse(raw) : null;
    });
    record(
      'T1.5.5b',
      'Decline stores choice (analytics: false)',
      declineRecord && declineRecord.categories && declineRecord.categories.analytics === false
    );

    await page.reload({ waitUntil: 'networkidle' });
    const barHiddenReload = await page.evaluate(() => {
      const b = document.getElementById('cookieBar');
      return b && window.getComputedStyle(b).display === 'none';
    });
    record('T1.5.5c', 'Decline persists across page reloads (banner stays hidden)', barHiddenReload);

    await page.evaluate(() => {
      const btn = document.getElementById('cookiePreferencesBtn');
      if (btn) btn.click();
    });
    await page.waitForTimeout(300);
    const reopened = await page.evaluate(() => {
      const b = document.getElementById('cookieBar');
      return b && window.getComputedStyle(b).display !== 'none';
    });
    record('T1.5.5d', 'Withdrawal: Cookie Preferences button re-opens banner', reopened);

    // 5.2 Shop Catalogue
    await page.goto(`${BASE_URL}/shop.html`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    const shopCards = await page.evaluate(() => {
      return document.querySelectorAll('#shopGrid .prod-card, #shopGrid .card, .shop-grid .card').length;
    });
    record('T1.5.5e', `Shop lists published products (${shopCards} rendered)`, shopCards >= 35);

    // 5.3 3 Sampled PDPs
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
    record('T1.5.5f', '3 sampled PDPs render product title and specifications', allPdpsPassed);

    // 5.4 Article Reader
    await page.goto(`${BASE_URL}/article.html?id=how-much-ram-do-you-need`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    const artTitle = await page.evaluate(() => (document.querySelector('h1') || {}).textContent || '');
    const artSections = await page.evaluate(() => document.querySelectorAll('h2').length);
    record('T1.5.5g', 'Article renders title and body sections', artTitle.length > 5 && artSections >= 2);

    // 5.5 Compare & Search
    await page.goto(`${BASE_URL}/compare.html`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    const compareMount = await page.evaluate(() => Boolean(document.getElementById('cmpMount')));
    record('T1.5.5h', 'Compare page mounts comparison tool', compareMount);

    await page.goto(`${BASE_URL}/search.html?q=ddr5`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const searchHits = await page.evaluate(() => document.querySelectorAll('#searchMount .card, #searchMount a').length);
    record('T1.5.5i', 'Search returns query results', searchHits > 0, `Hits: ${searchHits}`);

    // 5.6 29-Route Walkthrough for 0 JS Errors & 0 CSP Violations
    let totalCspViolations = 0;
    let totalJsErrors = 0;

    for (const route of ALL_29_ROUTES) {
      const routeCsp = [];
      const routeJs = [];
      const cspHandler = (msg) => {
        if (msg.type() === 'error' && /Content Security Policy/i.test(msg.text())) {
          routeCsp.push(msg.text());
        }
      };
      const errorHandler = (err) => {
        routeJs.push(err.message || String(err));
      };
      page.on('console', cspHandler);
      page.on('pageerror', errorHandler);
      try {
        await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
        await page.waitForTimeout(200);
      } catch (e) {
        routeJs.push(e.message);
      } finally {
        page.off('console', cspHandler);
        page.off('pageerror', errorHandler);
      }

      if (routeJs.length > 0) {
        console.log(`      [ERRORS on ${route}]:`, routeJs);
      }
      totalCspViolations += routeCsp.length;
      totalJsErrors += routeJs.length;
    }

    record(
      'T1.5.5j',
      `Walk of all 29 routes: 0 CSP violations (detected: ${totalCspViolations})`,
      totalCspViolations === 0,
      `CSP errors: ${totalCspViolations}`
    );

    record(
      'T1.5.5k',
      `Walk of all 29 routes: 0 unhandled JS errors (detected: ${totalJsErrors})`,
      totalJsErrors === 0,
      `JS errors: ${totalJsErrors}`
    );

    await ctx.close();
  } finally {
    await browser.close();
    server.close();
  }

  // --------------------------------------------------------------------------
  // Summary & Exit
  // --------------------------------------------------------------------------
  console.log('\n========================================================================');
  console.log(`TOTAL MS1.5 AUDIT CHECKS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('========================================================================\n');

  if (failed > 0) {
    console.error(`AUDIT FAILED: ${failed} check(s) did not meet acceptance criteria.`);
    process.exit(1);
  } else {
    console.log('STATUS: 100% VERIFIED — ALL MS1.5 ACCEPTANCE CRITERIA PASSED CLEANLY.');
  }
}

runAudit().catch((err) => {
  console.error('[verify-ms15-audit] Fatal error:', err);
  process.exit(1);
});
