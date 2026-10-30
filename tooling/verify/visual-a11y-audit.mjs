import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync, mkdirSync, readFileSync } from 'node:fs';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const axeSourcePath = require.resolve('axe-core');
const axeSource = readFileSync(axeSourcePath, 'utf8');

const PORT = process.env.AUDIT_PORT ? Number(process.env.AUDIT_PORT) : 4401;
const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)), '..', '..', 'apps', 'web', 'dist');
const SERVE_ROOT = existsSync(join(ROOT, 'client')) ? join(ROOT, 'client') : ROOT;
const EVIDENCE_DIR = resolve(fileURLToPath(new URL('.', import.meta.url)), '..', '..', 'tooling', 'verify', 'evidence');
mkdirSync(EVIDENCE_DIR, { recursive: true });

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.mjs': 'text/javascript', '.json': 'application/json', '.xml': 'application/xml',
  '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.pdf': 'application/pdf',
};

function sendFile(res, filePath, status = 200) {
  res.writeHead(status, {
    'content-type': MIME[extname(filePath).toLowerCase()] ?? 'application/octet-stream',
  });
  const stream = createReadStream(filePath);
  stream.on('error', () => {
    if (!res.headersSent) res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('Not Found');
  });
  stream.pipe(res);
}

const server = createServer(async (req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname);
  const clean = normalize(urlPath).replaceAll('..', '');
  const candidate = join(SERVE_ROOT, clean);
  const rootCandidate = join(ROOT, clean);
  if (!candidate.startsWith(SERVE_ROOT + sep) && candidate !== SERVE_ROOT) { res.writeHead(403).end(); return; }
  const tries = [
    candidate,
    join(SERVE_ROOT, clean, 'index.html'),
    join(SERVE_ROOT, clean + '.html'),
    rootCandidate,
    join(ROOT, clean, 'index.html'),
  ].filter((p) => existsSync(p) && statSync(p).isFile());
  if (tries.length > 0) { sendFile(res, tries[0]); return; }
  
  // SSR fallback: proxy to live Astro server
  try {
    let targetPath = req.url;
    if (targetPath.endsWith('.html')) {
      targetPath = targetPath.slice(0, -5);
    } else if (targetPath.includes('.html?')) {
      targetPath = targetPath.replace('.html?', '?');
    }
    const upstreamRes = await fetch(`http://localhost:4321${targetPath}`, {
      headers: { ...req.headers, host: 'localhost:4321' },
      redirect: 'follow',
    });
    const headers = {};
    upstreamRes.headers.forEach((v, k) => { headers[k] = v; });
    res.writeHead(upstreamRes.status, headers);
    const buf = Buffer.from(await upstreamRes.arrayBuffer());
    res.end(buf);
    return;
  } catch {
    if (existsSync(join(SERVE_ROOT, '404.html'))) {
      sendFile(res, join(SERVE_ROOT, '404.html'), 404);
    } else {
      res.writeHead(404, { 'content-type': 'text/plain' }).end('Not Found');
    }
  }
});

const ROUTES_29 = [
  '/',
  '/shop.html',
  '/product.html?id=corex-pro-m2-pcie-gen-5-0-nvme-ssd',
  '/product.html?id=voltx-ddr5-udimm-16gb',
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

async function main() {
  console.log('================================================================');
  console.log('         TwinMOS Visual & WCAG 2.2 AA Audit Runner');
  console.log('================================================================');
  
  await new Promise(resolveServer => server.listen(PORT, resolveServer));
  console.log(`[audit-server] Serving static bundle from ${ROOT} on http://localhost:${PORT}`);

  const browser = await chromium.launch({
    headless: true,
    channel: process.env.PLAYWRIGHT_CHROMIUM_CHANNEL || 'chrome'
  });
  
  // -------------------------------------------------------------
  // Test AXE-01: prefers-reduced-motion: reduce (29 routes)
  // -------------------------------------------------------------
  console.log('\n[*] Executing AXE-01: axe-core scan on 29 routes (prefers-reduced-motion: reduce)...');
  const contextReduced = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce'
  });
  const pageReduced = await contextReduced.newPage();

  let axe01Violations = 0;
  const axe01Details = [];

  for (const route of ROUTES_29) {
    const url = `http://localhost:${PORT}${route}`;
    await pageReduced.goto(url, { waitUntil: 'domcontentloaded' });
    await pageReduced.waitForTimeout(400);

    // Inject axe-core
    await pageReduced.evaluate(axeSource);

    // Run axe with WCAG 2.0/2.1/2.2 AA tags
    const results = await pageReduced.evaluate(async () => {
      return await window.axe.run(document, {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']
        }
      });
    });

    const violations = results.violations || [];
    if (violations.length > 0) {
      axe01Violations += violations.length;
      axe01Details.push({ route, violations: violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, help: v.help })) });
      console.log(`  FAIL [${route}]: ${violations.length} violation(s) found`);
    } else {
      console.log(`  PASS [${route}]: 0 violations`);
    }
  }

  await contextReduced.close();

  // -------------------------------------------------------------
  // Test AXE-02: full motion settled after scrolling (29 routes)
  // -------------------------------------------------------------
  console.log('\n[*] Executing AXE-02: axe-core scan on 29 routes (full motion, settled after scroll)...');
  const contextFull = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'no-preference'
  });
  const pageFull = await contextFull.newPage();

  let axe02Violations = 0;
  const axe02Details = [];

  for (const route of ROUTES_29) {
    const url = `http://localhost:${PORT}${route}`;
    await pageFull.goto(url, { waitUntil: 'load' });
    // Scroll down to settle any scroll-driven animations / reveals
    await pageFull.evaluate(async () => {
      window.scrollTo(0, document.body.scrollHeight / 2);
      await new Promise(r => setTimeout(r, 200));
      window.scrollTo(0, 0);
      await new Promise(r => setTimeout(r, 200));
    });
    await pageFull.waitForTimeout(300);

    await pageFull.evaluate(axeSource);
    const results = await pageFull.evaluate(async () => {
      return await window.axe.run(document, {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']
        }
      });
    });

    const violations = results.violations || [];
    if (violations.length > 0) {
      axe02Violations += violations.length;
      axe02Details.push({ route, violations: violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, help: v.help })) });
      console.log(`  FAIL [${route}]: ${violations.length} violation(s) found`);
    } else {
      console.log(`  PASS [${route}]: 0 violations`);
    }
  }

  // -------------------------------------------------------------
  // Visual Inspection & Screenshot Capture
  // -------------------------------------------------------------
  console.log('\n[*] Capturing Visual Evidence Screenshots...');
  const keyScreens = [
    { name: '01_homepage.png', route: '/' },
    { name: '02_shop_catalog.png', route: '/shop.html' },
    { name: '03_pdp_voltx.png', route: '/product.html?id=voltx-ddr5-udimm-16gb' },
    { name: '04_compare.png', route: '/compare.html' },
    { name: '05_support_rma.png', route: '/rma.html' },
    { name: '06_arabic_locale.png', route: '/ar.html' }
  ];

  for (const screen of keyScreens) {
    await pageFull.goto(`http://localhost:${PORT}${screen.route}`, { waitUntil: 'load' });
    await pageFull.waitForTimeout(500);
    const shotPath = join(EVIDENCE_DIR, screen.name);
    await pageFull.screenshot({ path: shotPath, fullPage: false });
    console.log(`  Screenshot saved: ${screen.name}`);
  }

  await contextFull.close();
  await browser.close();
  server.close();

  console.log('\n================================================================');
  console.log(`AXE-01 Violations: ${axe01Violations}`);
  console.log(`AXE-02 Violations: ${axe02Violations}`);
  if (axe01Violations > 0) {
    console.log('AXE-01 Details:', JSON.stringify(axe01Details, null, 2));
  }
  if (axe02Violations > 0) {
    console.log('AXE-02 Details:', JSON.stringify(axe02Details, null, 2));
  }
  console.log('================================================================');

  if (axe01Violations > 0 || axe02Violations > 0) {
    console.error('[audit] FAIL: Accessibility contrast or structure violations detected.');
    process.exit(1);
  } else {
    console.log('[audit] SUCCESS: Zero accessibility violations across all 29 routes (AXE-01 / AXE-02 PASSED).');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('[audit] Unhandled exception:', err);
  if (server.listening) server.close();
  process.exit(1);
});
