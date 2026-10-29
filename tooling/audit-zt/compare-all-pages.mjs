import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync, createReadStream, mkdirSync, writeFileSync } from 'node:fs';
import { join, extname, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let axeSource = '';
try {
  const axePath = require.resolve('axe-core');
  axeSource = readFileSync(axePath, 'utf8');
} catch {
  console.warn('axe-core not found, a11y tests will use basic checks');
}

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..', '..');
const PROTO_DIR = join(repoRoot, 'prototype');
const EVIDENCE_DIR = join(repoRoot, '_audit_evidence');
mkdirSync(EVIDENCE_DIR, { recursive: true });

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp',
  '.json': 'application/json', '.woff2': 'font/woff2', '.ico': 'image/x-icon'
};

const protoServer = createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/' || urlPath === '') urlPath = '/index.html';
  const filePath = join(PROTO_DIR, urlPath);
  if (existsSync(filePath) && statSync(filePath).isFile()) {
    res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] || 'application/octet-stream' });
    createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404).end('Not found: ' + filePath);
  }
});

const PROTO_PORT = 8099;
await new Promise(r => protoServer.listen(PROTO_PORT, r));
console.log(`[Audit] Proto server running on http://127.0.0.1:${PROTO_PORT}`);

const PAGES = [
  { name: 'index', proto: '/index.html', prod: '/' },
  { name: 'shop', proto: '/shop.html', prod: '/shop' },
  { name: 'product', proto: '/product.html?id=corex-pro-m2-pcie-gen-5-0-nvme-ssd', prod: '/products/corex-pro-m2-pcie-gen-5-0-nvme-ssd' },
  { name: 'compatibility', proto: '/compatibility.html', prod: '/compatibility' },
  { name: 'support', proto: '/support.html', prod: '/support' },
  { name: 'rma', proto: '/rma.html', prod: '/rma' },
  { name: 'about', proto: '/about.html', prod: '/about' },
  { name: 'careers', proto: '/careers.html', prod: '/careers' },
  { name: 'compare', proto: '/compare.html', prod: '/compare' },
  { name: 'contact', proto: '/contact.html', prod: '/contact' },
  { name: 'gaming', proto: '/gaming.html', prod: '/gaming' },
  { name: 'solutions', proto: '/solutions.html', prod: '/solutions' },
  { name: 'technology', proto: '/technology.html', prod: '/technology' },
  { name: 'where-to-buy', proto: '/where-to-buy.html', prod: '/where-to-buy' },
  { name: 'quote', proto: '/quote.html', prod: '/quote' },
  { name: 'news', proto: '/news.html', prod: '/news' },
  { name: 'partners', proto: '/partners.html', prod: '/partners' },
  { name: 'search', proto: '/search.html', prod: '/search' },
  { name: 'learn', proto: '/learn.html', prod: '/learn' },
  { name: 'learn-guides', proto: '/learn-guides.html', prod: '/learn-guides' },
  { name: 'learn-explained', proto: '/learn-explained.html', prod: '/learn-explained' },
  { name: 'learn-benchmarks', proto: '/learn-benchmarks.html', prod: '/learn-benchmarks' },
  { name: 'learn-glossary', proto: '/learn-glossary.html', prod: '/learn-glossary' },
  { name: 'learn-blog', proto: '/learn-blog.html', prod: '/learn-blog' },
  { name: 'legal', proto: '/legal.html', prod: '/legal' },
  { name: 'article', proto: '/article.html?id=best-ram-for-gaming', prod: '/learn/best-ram-for-gaming' },
  { name: 'sitemap', proto: '/sitemap.html', prod: '/sitemap' },
  { name: '404', proto: '/404.html', prod: '/404' }
];

const browser = await chromium.launch({ headless: true });
const results = [];

for (const pg of PAGES) {
  console.log(`\n========================================`);
  console.log(`Auditing: ${pg.name} (proto: ${pg.proto} vs prod: ${pg.prod})`);
  console.log(`========================================`);

  const pageProto = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const pageProd = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const protoConsole = [];
  const prodConsole = [];
  const prodErrors = [];

  pageProto.on('console', msg => { if (msg.type() === 'error') protoConsole.push(msg.text()); });
  pageProd.on('console', msg => { if (msg.type() === 'error') prodConsole.push(msg.text()); });
  pageProd.on('pageerror', err => { prodErrors.push(err.message); });

  let protoStatus = 0;
  let prodStatus = 0;

  try {
    const resProto = await pageProto.goto(`http://127.0.0.1:${PROTO_PORT}${pg.proto}`, { waitUntil: 'load', timeout: 15000 });
    protoStatus = resProto?.status() ?? 0;
    await pageProto.waitForTimeout(500);
  } catch (e) {
    console.error(`Error loading proto ${pg.name}:`, e.message);
  }

  try {
    const resProd = await pageProd.goto(`http://127.0.0.1:4321${pg.prod}`, { waitUntil: 'load', timeout: 15000 });
    prodStatus = resProd?.status() ?? 0;
    await pageProd.waitForTimeout(500);
  } catch (e) {
    console.error(`Error loading prod ${pg.name}:`, e.message);
  }

  // Inspect DOM extract
  async function extractData(page) {
    return await page.evaluate(async () => {
      window.scrollTo(0, document.body.scrollHeight);
      await new Promise(r => setTimeout(r, 400));
      window.scrollTo(0, 0);

      const title = document.title;
      const h1s = Array.from(document.querySelectorAll('h1')).map(h => h.innerText.trim().replace(/\s+/g, ' '));
      const h2s = Array.from(document.querySelectorAll('h2')).map(h => h.innerText.trim().replace(/\s+/g, ' '));
      const h3s = Array.from(document.querySelectorAll('h3')).map(h => h.innerText.trim().replace(/\s+/g, ' '));
      
      const sections = Array.from(document.querySelectorAll('main > *')).map(el => ({
        tag: el.tagName.toLowerCase(),
        id: el.id,
        className: el.className,
        headings: Array.from(el.querySelectorAll('h1, h2, h3')).map(h => h.innerText.trim().replace(/\s+/g, ' ')),
        buttons: Array.from(el.querySelectorAll('button, .btn, a.btn')).map(b => b.innerText.trim().replace(/\s+/g, ' ')),
        inputs: Array.from(el.querySelectorAll('input, select, textarea')).map(i => ({
          name: i.getAttribute('name') || i.id,
          type: i.getAttribute('type') || i.tagName.toLowerCase(),
          placeholder: i.getAttribute('placeholder')
        })),
        textLength: el.innerText.length
      }));

      const forms = Array.from(document.querySelectorAll('form')).map(f => ({
        id: f.id,
        action: f.getAttribute('action'),
        fields: Array.from(f.querySelectorAll('input, select, textarea')).map(i => i.getAttribute('name') || i.id)
      }));

      const scripts = Array.from(document.querySelectorAll('script[src]')).map(s => s.getAttribute('src'));
      const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(l => l.getAttribute('href'));
      
      const images = Array.from(document.querySelectorAll('img')).map(img => ({
        src: img.getAttribute('src'),
        alt: img.getAttribute('alt'),
        complete: img.complete,
        naturalWidth: img.naturalWidth
      }));

      const brokenImages = images.filter(img => img.src && !img.src.startsWith('data:') && (img.complete && img.naturalWidth === 0));

      return {
        title,
        h1s,
        h2s,
        h3s,
        sections,
        forms,
        scripts,
        styles,
        imagesCount: images.length,
        brokenImagesCount: brokenImages.length,
        brokenImages: brokenImages.slice(0, 5),
        totalTextLength: document.body.innerText.length
      };
    });
  }

  let protoDom = null;
  let prodDom = null;

  try { protoDom = await extractData(pageProto); } catch (e) { protoDom = { error: e.message }; }
  try { prodDom = await extractData(pageProd); } catch (e) { prodDom = { error: e.message }; }

  // Screenshots
  try {
    await pageProto.screenshot({ path: join(EVIDENCE_DIR, `proto_${pg.name}.png`), fullPage: false });
    await pageProd.screenshot({ path: join(EVIDENCE_DIR, `prod_${pg.name}.png`), fullPage: false });
  } catch (e) {
    console.error(`Screenshot error for ${pg.name}:`, e.message);
  }

  // A11y check on prod if axeSource available
  let prodA11yViolations = [];
  if (axeSource && prodStatus === 200) {
    try {
      await pageProd.evaluate(axeSource);
      const axeResults = await pageProd.evaluate(async () => {
        // @ts-ignore
        return await axe.run({ runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } });
      });
      prodA11yViolations = (axeResults.violations || []).map(v => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodesCount: v.nodes.length
      }));
    } catch (e) {
      console.warn('Axe check failed:', e.message);
    }
  }

  // Calculate gaps
  const missingH2s = (protoDom?.h2s || []).filter(h => !(prodDom?.h2s || []).some(ph => ph.includes(h) || h.includes(ph)));
  const missingH3s = (protoDom?.h3s || []).filter(h => !(prodDom?.h3s || []).some(ph => ph.includes(h) || h.includes(ph)));

  const protoSectionCount = protoDom?.sections?.length || 0;
  const prodSectionCount = prodDom?.sections?.length || 0;

  const gapItem = {
    page: pg.name,
    protoUrl: pg.proto,
    prodUrl: pg.prod,
    protoStatus,
    prodStatus,
    protoTitle: protoDom?.title,
    prodTitle: prodDom?.title,
    protoTextLength: protoDom?.totalTextLength,
    prodTextLength: prodDom?.totalTextLength,
    textLengthRatio: protoDom?.totalTextLength ? ((prodDom?.totalTextLength || 0) / protoDom.totalTextLength).toFixed(2) : 'N/A',
    protoSectionCount,
    prodSectionCount,
    missingH2s,
    missingH3s: missingH3s.slice(0, 10),
    missingH3sTotal: missingH3s.length,
    protoFormsCount: protoDom?.forms?.length || 0,
    prodFormsCount: prodDom?.forms?.length || 0,
    brokenImagesCount: prodDom?.brokenImagesCount || 0,
    brokenImages: prodDom?.brokenImages || [],
    prodConsoleErrors: prodConsole,
    prodJsErrors: prodErrors,
    a11yViolationsCount: prodA11yViolations.length,
    a11yViolations: prodA11yViolations
  };

  console.log(`Status: Proto=${protoStatus}, Prod=${prodStatus}`);
  console.log(`Text Length: Proto=${protoDom?.totalTextLength}, Prod=${prodDom?.totalTextLength} (ratio: ${gapItem.textLengthRatio})`);
  console.log(`Sections in main: Proto=${protoSectionCount}, Prod=${prodSectionCount}`);
  console.log(`Missing H2s (${missingH2s.length}):`, missingH2s);
  if (prodErrors.length > 0) console.log(`Prod JS Errors:`, prodErrors);
  if (prodA11yViolations.length > 0) console.log(`A11y Violations:`, prodA11yViolations.length);

  results.push(gapItem);

  await pageProto.close();
  await pageProd.close();
}

await browser.close();
protoServer.close();

const reportPath = join(EVIDENCE_DIR, 'comprehensive_audit_report.json');
writeFileSync(reportPath, JSON.stringify(results, null, 2), 'utf8');
console.log(`\n\n========================================`);
console.log(`AUDIT COMPLETE. Report saved to: ${reportPath}`);
console.log(`========================================`);
