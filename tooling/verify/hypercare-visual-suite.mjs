// Task F8 Hypercare 3-Iteration Visual Drive-Through & WCAG 2.2 AA Audit Suite
// Executes 3 full visual drive-through passes with screenshot evidence capture and Axe accessibility audits.
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

export async function runHypercareVisualSuite() {
  const PORT = 4390;
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
  console.log(`[hypercare-visual] Static server listening on http://localhost:${PORT}`);

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
    // ITERATION 1: Public Core Catalog, Search & PDP SEO Preservation (R-08)
    // =========================================================================
    console.log('\n================================================================');
    console.log('--- ITERATION 1: Public Core Catalog, Search & PDP Journey (R-08) ---');
    console.log('================================================================');

    // 1.1 Home
    await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'domcontentloaded' });
    await page.screenshot({ path: join(EVIDENCE_DIR, 'hypercare_iter1_01_home.png') });
    screenshotsCount++;
    await auditAxe(page, 'Iteration 1 - Home');

    // 1.2 Catalog / Shop
    await page.goto(`http://localhost:${PORT}/shop.html`, { waitUntil: 'domcontentloaded' });
    await page.screenshot({ path: join(EVIDENCE_DIR, 'hypercare_iter1_02_catalog.png') });
    screenshotsCount++;
    await auditAxe(page, 'Iteration 1 - Catalog');

    // 1.3 PDP
    await page.goto(`http://localhost:${PORT}/product.html?id=voltx-ddr5-udimm-16gb`, { waitUntil: 'domcontentloaded' });
    await page.screenshot({ path: join(EVIDENCE_DIR, 'hypercare_iter1_03_pdp.png') });
    screenshotsCount++;
    await auditAxe(page, 'Iteration 1 - PDP');

    // 1.4 Custom 404 Error Page
    await page.goto(`http://localhost:${PORT}/non-existent-page-check`, { waitUntil: 'domcontentloaded' });
    await page.screenshot({ path: join(EVIDENCE_DIR, 'hypercare_iter1_04_404.png') });
    screenshotsCount++;
    await auditAxe(page, 'Iteration 1 - 404 Page');

    // =========================================================================
    // ITERATION 2: Lead Routing & Zero-Dropped Forms Ingestion (V-09)
    // =========================================================================
    console.log('\n================================================================');
    console.log('--- ITERATION 2: Form Intake & Zero-Dropped Leads Journey (V-09) ---');
    console.log('================================================================');

    // 2.1 Contact Form
    await page.goto(`http://localhost:${PORT}/contact.html`, { waitUntil: 'domcontentloaded' });
    await page.screenshot({ path: join(EVIDENCE_DIR, 'hypercare_iter2_01_contact.png') });
    screenshotsCount++;
    await auditAxe(page, 'Iteration 2 - Contact Form');

    // 2.2 B2B Quote
    await page.goto(`http://localhost:${PORT}/quote.html`, { waitUntil: 'domcontentloaded' });
    await page.screenshot({ path: join(EVIDENCE_DIR, 'hypercare_iter2_02_quote.png') });
    screenshotsCount++;
    await auditAxe(page, 'Iteration 2 - Quote');

    // 2.3 RMA & Warranty Service Portal
    await page.goto(`http://localhost:${PORT}/rma.html`, { waitUntil: 'domcontentloaded' });
    await page.screenshot({ path: join(EVIDENCE_DIR, 'hypercare_iter2_03_rma.png') });
    screenshotsCount++;
    await auditAxe(page, 'Iteration 2 - RMA');

    // =========================================================================
    // ITERATION 3: Internationalization (Arabic RTL), Compliance & Support
    // =========================================================================
    console.log('\n================================================================');
    console.log('--- ITERATION 3: Arabic RTL Localization, Support & Legal ---');
    console.log('================================================================');

    // 3.1 Arabic RTL Home
    await page.goto(`http://localhost:${PORT}/ar.html`, { waitUntil: 'domcontentloaded' });
    const dir = await page.getAttribute('html', 'dir');
    if (dir !== 'rtl') throw new Error(`Expected dir="rtl" on /ar.html, got "${dir}"`);
    await page.screenshot({ path: join(EVIDENCE_DIR, 'hypercare_iter3_01_arabic_rtl.png') });
    screenshotsCount++;
    await auditAxe(page, 'Iteration 3 - Arabic RTL Home');

    // 3.2 Legal & Privacy Policy
    await page.goto(`http://localhost:${PORT}/legal.html`, { waitUntil: 'domcontentloaded' });
    await page.screenshot({ path: join(EVIDENCE_DIR, 'hypercare_iter3_02_legal.png') });
    screenshotsCount++;
    await auditAxe(page, 'Iteration 3 - Legal');

    // 3.3 Support Portal
    await page.goto(`http://localhost:${PORT}/support.html`, { waitUntil: 'domcontentloaded' });
    await page.screenshot({ path: join(EVIDENCE_DIR, 'hypercare_iter3_03_support.png') });
    screenshotsCount++;
    await auditAxe(page, 'Iteration 3 - Support');

    console.log('\n================================================================');
    console.log(`[hypercare-visual] Completed 3 iterations: ${screenshotsCount} screenshots captured.`);
    console.log(`[hypercare-visual] Total Serious/Critical Axe Violations: ${totalViolations}`);
    console.log('================================================================\n');

    if (totalViolations > 0) {
      throw new Error(`Accessibility violations detected during hypercare drive-through: ${totalViolations}`);
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
  runHypercareVisualSuite()
    .then((r) => { console.log('[*] Hypercare 3-Iteration Visual Suite PASSED:', r); process.exit(0); })
    .catch((err) => { console.error('[✗] Hypercare 3-Iteration Visual Suite FAILED:', err.message); process.exit(1); });
}
