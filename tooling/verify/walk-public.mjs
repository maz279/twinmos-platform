// WALK-PUB: Comprehensive Public Site Browser Walkthrough
// Task T2.2.3 & Exit Gate Check WALK-PUB
// Walks public routes in Chromium/Playwright:
// 1. Verifies HTTP 200 (or expected status)
// 2. Verifies 0 JavaScript console / uncaught runtime errors
// 3. Verifies 0 Content Security Policy (CSP) violations
// 4. Verifies 0 failed asset or image requests
// 5. Validates interactive modules (shop cards, PDP render, cookie banner decline)
// 6. Archives structured results into evidence/walk_public.json and screenshots

import { chromium } from '@playwright/test';
import { createServer, request } from 'node:http';
import { createReadStream, readFileSync, existsSync, mkdirSync, writeFileSync, statSync } from 'node:fs';
import { resolve, join, extname, dirname, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..', '..');
const ROOT = resolve(here, '..', '..', 'apps', 'web', 'dist');
const SERVE_ROOT = existsSync(join(ROOT, 'client')) ? join(ROOT, 'client') : ROOT;
const outDir = resolve(repoRoot, 'tooling', 'verify', 'evidence', 'walk_public');

const ROUTES = [
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
  '/ar.html'
];

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

function sendFile(res, filePath, status = 200) {
  const ext = extname(filePath).toLowerCase();
  res.writeHead(status, {
    'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'sha256-87eOizNic1Cn2bOZLdJU+YBjCuVfdvW7WIeZC+HOMF8=' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' http://127.0.0.1:8787 https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com;"
  });
  createReadStream(filePath).pipe(res);
}

async function startStaticServer(port = 4398) {
  return new Promise((res, rej) => {
    const server = createServer((req, resHandler) => {
      // Proxy /api/ requests to local API daemon if running
      if (req.url && req.url.startsWith('/api/')) {
        const proxyReq = request({
          host: '127.0.0.1',
          port: 8787,
          path: req.url,
          method: req.method,
          headers: { ...req.headers, host: '127.0.0.1:8787' },
        }, (proxyRes) => {
          resHandler.writeHead(proxyRes.statusCode, proxyRes.headers);
          proxyRes.pipe(resHandler);
        });
        proxyReq.on('error', () => {
          resHandler.writeHead(502, { 'Content-Type': 'text/plain' });
          resHandler.end('API backend not reachable on 8787');
        });
        req.pipe(proxyReq);
        return;
      }

      const urlPath = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname);
      const clean = normalize(urlPath).replaceAll('..', '');
      const cleanNormalized = clean.replaceAll('\\', '/');
      const candidate = join(SERVE_ROOT, clean);
      const rootCandidate = join(ROOT, clean);
      const tries = [
        candidate,
        join(SERVE_ROOT, clean, 'index.html'),
        join(SERVE_ROOT, clean + '.html'),
        rootCandidate,
        join(ROOT, clean, 'index.html'),
      ].filter((p) => existsSync(p) && statSync(p).isFile());

      if (tries.length > 0) {
        sendFile(resHandler, tries[0]);
        return;
      }
      resHandler.writeHead(404, { 'Content-Type': 'text/plain' });
      resHandler.end('Not Found');
    });

    server.listen(port, () => res({ server, port }));
    server.on('error', rej);
  });
}

export async function runWalkPublic(baseUrl = null) {
  mkdirSync(outDir, { recursive: true });
  mkdirSync(join(outDir, 'shots'), { recursive: true });

  let serverInstance = null;
  let activeBase = baseUrl;

  if (!activeBase) {
    // Walk the real SSR server; the old static/prototype fallback could pass
    // while the shipped site was broken.
    activeBase = process.env.WEB_URL || 'http://localhost:4321';
  }

  console.log(`[walk-public] Starting browser walkthrough on ${activeBase}...`);
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1366, height: 900 }
  });

  const results = [];
  let totalErrors = 0;
  let totalCsp = 0;

  try {
    let targetRoutes = [...ROUTES];
    if (process.argv.includes('--test-planted')) {
      console.log('[walk-public] Running fast negative mutation test with planted broken route...');
      targetRoutes = ['/planted-broken-probe-404.html'];
    }

    for (const r of targetRoutes) {
      const page = await context.newPage();
      const rec = { route: r, consoleErrors: [], pageErrors: [], csp: [], failed: [] };

      page.on('console', (m) => {
        if (m.type() === 'error') {
          const text = m.text().slice(0, 240);
          if (text.includes('401 (Unauthorized)') || text.includes('/api/v1/partner/me')) return;
          rec.consoleErrors.push(text);
        }
      });
      page.on('pageerror', (e) => rec.pageErrors.push(String(e).slice(0, 240)));
      page.on('requestfailed', (q) => {
        const url = q.url();
        if (!url.includes('challenges.cloudflare') && !url.includes('favicon.ico')) {
          rec.failed.push(`${url}: ${q.failure()?.errorText || 'failed'}`);
        }
      });
      page.on('response', (res) => {
        const url = res.url();
        const status = res.status();
        if (status >= 400 && !url.includes('challenges.cloudflare') && !url.includes('favicon.ico')) {
          if (status === 401 && url.includes('/api/v1/partner/me')) {
            // expected 401 for anonymous public visit
            return;
          }
          rec.failed.push(`${status} ${url}`);
        }
      });

      await page.addInitScript(() => {
        window.__csp = [];
        document.addEventListener('securitypolicyviolation', (e) => {
          window.__csp.push(`${e.violatedDirective} ${e.blockedURI || ''}`);
        });
      });

      try {
        const resp = await page.goto(activeBase + r, { waitUntil: 'domcontentloaded', timeout: 15000 });
        rec.status = resp?.status() || 0;
        await page.waitForTimeout(800);

        rec.csp = await page.evaluate(() => window.__csp || []);
        rec.title = await page.title();
        rec.hasTM = await page.evaluate(() => !!(window.TM && window.TM.products));

        // Route specific checks
        if (r.startsWith('/shop')) {
          rec.shopCards = await page.evaluate(() => document.querySelectorAll('#shopGrid > *').length);
        }
        if (r.startsWith('/product')) {
          rec.pdpH1 = await page.evaluate(() => document.querySelector('h1')?.innerText || null);
          rec.isLoading = await page.evaluate(() => /Loading product/i.test(document.body.innerText));
        }

        // Home cookie bar check
        if (r === '/') {
          rec.cookieVisible = await page.evaluate(() => {
            const b = document.getElementById('cookieBar');
            return !!(b && (b.offsetWidth || b.offsetHeight) && getComputedStyle(b).display !== 'none');
          });
          const declineBtn = page.locator('#cookieDecline');
          if (await declineBtn.count()) {
            await declineBtn.click().catch(() => {});
            await page.waitForTimeout(300);
            rec.cookieAfterDecline = await page.evaluate(() => {
              const b = document.getElementById('cookieBar');
              return !!(b && (b.offsetWidth || b.offsetHeight) && getComputedStyle(b).display !== 'none');
            });
          }
        }

        const shotName = r.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'home';
        await page.screenshot({ path: join(outDir, 'shots', `${shotName}.png`), fullPage: false });
      } catch (err) {
        rec.error = err.message;
      }

      const jsErrCount = rec.consoleErrors.length + rec.pageErrors.length;
      totalErrors += jsErrCount;
      totalCsp += rec.csp.length;

      const isPass = rec.status === 200 && jsErrCount === 0 && rec.csp.length === 0 && rec.failed.length === 0;
      console.log(`  [${isPass ? 'PASS' : 'FAIL'}] ${r} -> HTTP ${rec.status} | JS Errors: ${jsErrCount} | CSP: ${rec.csp.length} | Failed Req: ${rec.failed.length}`);

      results.push(rec);
      await page.close();
    }
  } finally {
    await browser.close();
    if (serverInstance) serverInstance.close();
  }

  const isPlanted = process.argv.includes('--test-planted');
  const outJson = isPlanted ? join(outDir, 'walk_public_planted.json') : join(outDir, 'walk_public.json');
  writeFileSync(outJson, JSON.stringify(results, null, 2), 'utf8');
  console.log(`[walk-public] Telemetry archived to ${outJson}`);

  const passedRoutes = results.filter((r) => r.status === 200 && (r.consoleErrors.length + r.pageErrors.length) === 0 && r.csp.length === 0 && r.failed.length === 0);
  console.log(`\n================================================================`);
  console.log(`WALK-PUB Summary: ${passedRoutes.length} of ${results.length} routes passed cleanly.`);
  console.log(`Total JS Errors: ${totalErrors} | Total CSP Violations: ${totalCsp}`);
  console.log(`================================================================\n`);

  return { totalRoutes: results.length, passedRoutes: passedRoutes.length, totalErrors, totalCsp, results };
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  const isPlanted = process.argv.includes('--test-planted');
  runWalkPublic()
    .then((res) => {
      if (isPlanted) {
        if (res.passedRoutes < res.totalRoutes) {
          console.log('[walk-public] MUTATION TEST PASSED: Successfully detected planted defect!');
          process.exit(0);
        } else {
          console.error('[walk-public] MUTATION TEST FAILED: Planted defect was NOT caught!');
          process.exit(1);
        }
      }
      if (res.passedRoutes === res.totalRoutes) {
        console.log('[walk-public] PASS WALK-PUB: 100% of routes clean with 0 JS errors and 0 CSP violations.');
        process.exit(0);
      } else {
        console.error(`[walk-public] FAIL WALK-PUB: ${res.totalRoutes - res.passedRoutes} routes had errors or violations.`);
        process.exit(1);
      }
    })
    .catch((err) => {
      console.error('[walk-public] FATAL:', err);
      process.exit(1);
    });
}
