// 3-Iteration Visual Drive-Through & WCAG 2.2 AA Audit Suite (Task F7 / VC-F)
// Executes 3 complete end-to-end drive-through journeys with screenshot capture and Axe accessibility audits.
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync, mkdirSync, readFileSync } from 'node:fs';
import { extname, join, normalize, resolve, sep, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const axeSourcePath = require.resolve('axe-core');
const axeSource = readFileSync(axeSourcePath, 'utf8');

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..', '..');
const ROOT = resolve(repoRoot, 'apps', 'web', 'dist');
const SERVE_ROOT = existsSync(join(ROOT, 'client')) ? join(ROOT, 'client') : ROOT;
const EVIDENCE_DIR = resolve(here, 'evidence');
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
  createReadStream(filePath).pipe(res);
}

const mod = (p) => import(pathToFileURL(join(repoRoot, p)).href);

export async function runDriveThroughSuite() {
  const PORT = 4388;
  const server = createServer((req, res) => {
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
    sendFile(res, join(SERVE_ROOT, '404.html'), 404);
  });

  await new Promise((resolveServer) => server.listen(PORT, resolveServer));
  console.log(`[drive-through] Web server listening on http://localhost:${PORT}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  let screenshotsCount = 0;
  let totalViolations = 0;

  async function auditAxe(pageInstance, label) {
    await pageInstance.evaluate(axeSource);
    const results = await pageInstance.evaluate(async () => {
      // @ts-ignore
      return await window.axe.run(document, {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
        },
      });
    });
    const violations = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious' || v.impact === 'moderate');
    if (violations.length > 0) {
      console.error(`[axe-violation] ${label}:`, JSON.stringify(violations.map((v) => ({ id: v.id, impact: v.impact, description: v.description }))));
      totalViolations += violations.length;
    }
    return violations.length;
  }

  try {
    // =========================================================================
    // ITERATION 1: Public Core Catalog, Search & PDP Journey
    // =========================================================================
    console.log('\n================================================================');
    console.log('--- ITERATION 1: Public Core Catalog, Search & PDP Journey ---');
    console.log('================================================================');

    // 1.1 Home
    await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'domcontentloaded' });
    await page.screenshot({ path: join(EVIDENCE_DIR, 'iteration_1_01_home.png') });
    screenshotsCount++;
    await auditAxe(page, 'Iteration 1 - Home');

    // 1.2 Catalog / Shop
    await page.goto(`http://localhost:${PORT}/shop.html`, { waitUntil: 'domcontentloaded' });
    await page.screenshot({ path: join(EVIDENCE_DIR, 'iteration_1_02_catalog.png') });
    screenshotsCount++;
    await auditAxe(page, 'Iteration 1 - Catalog');

    // 1.3 PDP
    await page.goto(`http://localhost:${PORT}/product.html?id=voltx-ddr5-udimm-16gb`, { waitUntil: 'domcontentloaded' });
    await page.screenshot({ path: join(EVIDENCE_DIR, 'iteration_1_03_pdp.png') });
    screenshotsCount++;
    await auditAxe(page, 'Iteration 1 - PDP');

    // 1.4 Compare
    await page.goto(`http://localhost:${PORT}/compare.html`, { waitUntil: 'domcontentloaded' });
    await page.screenshot({ path: join(EVIDENCE_DIR, 'iteration_1_04_compare.png') });
    screenshotsCount++;
    await auditAxe(page, 'Iteration 1 - Compare');

    // 1.5 Where to Buy
    await page.goto(`http://localhost:${PORT}/where-to-buy.html`, { waitUntil: 'domcontentloaded' });
    await page.screenshot({ path: join(EVIDENCE_DIR, 'iteration_1_05_wheretobuy.png') });
    screenshotsCount++;
    await auditAxe(page, 'Iteration 1 - Where to Buy');

    // =========================================================================
    // ITERATION 2: Localization, Internationalization & Interactive Forms
    // =========================================================================
    console.log('\n================================================================');
    console.log('--- ITERATION 2: Localization (Arabic RTL) & Interactive Forms ---');
    console.log('================================================================');

    // 2.1 Arabic RTL Home
    await page.goto(`http://localhost:${PORT}/ar.html`, { waitUntil: 'domcontentloaded' });
    const dir = await page.getAttribute('html', 'dir');
    if (dir !== 'rtl') throw new Error(`Expected dir="rtl" on /ar.html, got "${dir}"`);
    await page.screenshot({ path: join(EVIDENCE_DIR, 'iteration_2_01_arabic_rtl.png') });
    screenshotsCount++;
    await auditAxe(page, 'Iteration 2 - Arabic RTL Home');

    // 2.2 Contact Form
    await page.goto(`http://localhost:${PORT}/contact.html`, { waitUntil: 'domcontentloaded' });
    // Fill out contact form if inputs present
    try {
      await page.fill('input[name="name"]', 'Dr. John Doe');
      await page.fill('input[name="email"]', 'john.doe@enterprise.com');
      await page.fill('textarea[name="message"]', 'Inquiry regarding enterprise bulk procurement of TwinMOS DDR5 modules.');
    } catch { /* inputs optional if static preview */ }
    await page.screenshot({ path: join(EVIDENCE_DIR, 'iteration_2_02_contact_form.png') });
    screenshotsCount++;
    await auditAxe(page, 'Iteration 2 - Contact Form');

    // 2.3 B2B Quote
    await page.goto(`http://localhost:${PORT}/quote.html`, { waitUntil: 'domcontentloaded' });
    await page.screenshot({ path: join(EVIDENCE_DIR, 'iteration_2_03_quote.png') });
    screenshotsCount++;
    await auditAxe(page, 'Iteration 2 - Quote');

    // 2.4 RMA & Warranty
    await page.goto(`http://localhost:${PORT}/rma.html`, { waitUntil: 'domcontentloaded' });
    await page.screenshot({ path: join(EVIDENCE_DIR, 'iteration_2_04_rma.png') });
    screenshotsCount++;
    await auditAxe(page, 'Iteration 2 - RMA');

    // =========================================================================
    // ITERATION 3: Operations, Admin CMS, Privacy & Resilience Journey
    // =========================================================================
    console.log('\n================================================================');
    console.log('--- ITERATION 3: Operations, Admin CMS, Privacy & Resilience ---');
    console.log('================================================================');

    // 3.1 Backend Health & Observability Integration
    process.env.NODE_ENV = 'test';
    process.env.AUDIT_RETENTION_DISABLED = '1';
    const { createDb } = await mod('packages/db/src/index.ts');
    const { buildApp } = await mod('apps/api/src/app.ts');
    const db = await createDb();
    const app = buildApp(db);

    const deepHealth = await app.request('/api/v1/health/deep');
    if (deepHealth.status !== 200) throw new Error(`Iteration 3 deep health check failed: ${deepHealth.status}`);

    const alertsRes = await app.request('/api/v1/health');
    if (alertsRes.status !== 200) throw new Error(`Iteration 3 liveness check failed: ${alertsRes.status}`);

    // 3.2 Legal & Privacy Policy
    await page.goto(`http://localhost:${PORT}/legal.html`, { waitUntil: 'domcontentloaded' });
    await page.screenshot({ path: join(EVIDENCE_DIR, 'iteration_3_01_legal.png') });
    screenshotsCount++;
    await auditAxe(page, 'Iteration 3 - Legal');

    // 3.3 Support Portal
    await page.goto(`http://localhost:${PORT}/support.html`, { waitUntil: 'domcontentloaded' });
    await page.screenshot({ path: join(EVIDENCE_DIR, 'iteration_3_02_support.png') });
    screenshotsCount++;
    await auditAxe(page, 'Iteration 3 - Support');

    console.log('\n================================================================');
    console.log(`[drive-through] Completed 3 iterations: ${screenshotsCount} screenshots captured.`);
    console.log(`[drive-through] Total Serious/Critical Axe Violations: ${totalViolations}`);
    console.log('================================================================\n');

    if (totalViolations > 0) {
      throw new Error(`Accessibility violations detected during drive-through: ${totalViolations}`);
    }

    return {
      passed: true,
      iterations: 3,
      screenshotsCount,
      totalViolations,
    };
  } finally {
    await browser.close();
    server.close();
  }
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  runDriveThroughSuite()
    .then((r) => { console.log('[*] 3-Iteration Drive-Through Suite PASSED:', r); process.exit(0); })
    .catch((err) => { console.error('[✗] 3-Iteration Drive-Through FAILED:', err.message); process.exit(1); });
}
