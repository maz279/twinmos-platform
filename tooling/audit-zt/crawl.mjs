// ZT check CRAWL: a real Chromium walks the public site through the lab edge
// (Cloudflare client certificate presented, www.twinmos.com → edge), following
// every same-origin link from the home page, the sitemap and the header,
// mega-menu, drawer and footer. For every page it records the HTTP status,
// console errors, CSP violations, failed sub-resources and bad hrefs ('#',
// 'javascript:', empty, '.html' links that resolve under nested paths).
// Screenshots of the key templates at 390/768/1440 px go to <out>/shots for
// human review. Runs inside the Playwright image on the lab network:
//   tooling/audit-zt/run-in-browser.sh tooling/audit-zt/crawl.mjs <outDir>
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const outDir = process.argv[2];
const plant = process.argv.includes('--plant');
const MAX = Number(process.env.ZT_MAX_PAGES ?? 700);
const ORIGIN = 'https://www.twinmos.com';
const CERTS = process.env.ZT_CERT_DIR ?? '/repo/tooling/audit-zt/lab/.certs';
mkdirSync(join(outDir, 'shots'), { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  ignoreHTTPSErrors: true, // lab CA; the edge's real TLS/AOP behaviour is still exercised
  clientCertificates: [{ origin: ORIGIN, certPath: `${CERTS}/client.pem`, keyPath: `${CERTS}/client.key` }],
  viewport: { width: 1440, height: 900 },
  // The service worker's own fetches do not honour ignoreHTTPSErrors, so under
  // the lab CA it fails asset loads at random (iter-2: ERR_FAILED on product
  // pages). Blocked here so the crawl measures the pages and the edge; sw.js is
  // network-first and adds nothing a page needs.
  serviceWorkers: 'block',
});

const pages = new Map(); // url -> record
const linkIssues = [];
const external = new Set();
const queue = [];
const norm = (u) => { const x = new URL(u); x.hash = ''; return x.toString(); };
const enqueue = (u, from) => {
  let x;
  try { x = new URL(u, from); } catch { linkIssues.push({ from, href: u, issue: 'unparseable' }); return; }
  if (x.origin !== ORIGIN) { if (/^https?:$/.test(x.protocol)) external.add(x.toString()); return; }
  if (x.pathname.startsWith('/api/') || x.pathname.startsWith('/admin')) return;
  const k = norm(x.toString());
  if (!pages.has(k) && !queue.includes(k)) queue.push(k);
};

// seeds: home + sitemap(s)
enqueue(ORIGIN + '/', ORIGIN + '/');
for (const sm of ['/sitemap.xml']) {
  const r = await context.request.get(ORIGIN + sm);
  const xml = await r.text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  for (const l of locs) {
    if (l.endsWith('.xml')) {
      const sub = await (await context.request.get(l.replace(/^https?:\/\/[^/]+/, ORIGIN))).text();
      for (const m of sub.matchAll(/<loc>([^<]+)<\/loc>/g)) enqueue(m[1].replace(/^https?:\/\/[^/]+/, ORIGIN), ORIGIN + sm);
    } else enqueue(l.replace(/^https?:\/\/[^/]+/, ORIGIN), ORIGIN + sm);
  }
}

const page = await context.newPage();
let current = null;
// Lab artefact, not a product defect: the service worker refuses the lab CA
// (ignoreHTTPSErrors does not extend to SW script fetches).
const LAB_NOISE = /An SSL certificate error occurred when fetching the script/;
page.on('console', (m) => { if (current && !LAB_NOISE.test(m.text()) && (m.type() === 'error' || /Refused to|Content Security Policy/i.test(m.text()))) current.console.push(m.text().slice(0, 300)); });
page.on('pageerror', (e) => { if (current) current.jsErrors.push(String(e).slice(0, 300)); });
page.on('requestfailed', (r) => { if (current) current.failed.push(`${r.failure()?.errorText} ${r.url()}`.slice(0, 300)); });
page.on('response', (r) => { if (current && r.status() >= 400 && r.url() !== current.url) current.failed.push(`${r.status()} ${r.url()}`.slice(0, 300)); });

while (queue.length && pages.size < MAX) {
  const url = queue.shift();
  current = { url, status: 0, console: [], jsErrors: [], failed: [], finalUrl: null };
  pages.set(url, current);
  let res;
  // 'load' + settle: pages with the live Turnstile widget never reach networkidle
  try { res = await page.goto(url, { waitUntil: 'load', timeout: 30_000 }); await page.waitForTimeout(1200); } catch (e) { current.status = -1; current.error = String(e).slice(0, 200); continue; }
  current.status = res?.status() ?? 0;
  current.finalUrl = page.url();
  current.title = await page.title();
  const hrefs = await page.$$eval('a', (as) => as.map((a) => ({ raw: a.getAttribute('href'), abs: a.href, text: (a.textContent || '').trim().slice(0, 40), role: a.getAttribute('role') })));
  for (const h of hrefs) {
    if (h.raw === null || h.raw === '') { linkIssues.push({ from: url, href: h.raw, text: h.text, issue: 'missing href' }); continue; }
    if (h.raw === '#' && h.role !== 'button') { linkIssues.push({ from: url, href: '#', text: h.text, issue: 'dead # link' }); continue; }
    if (h.raw.startsWith('#')) continue;
    if (/^javascript:/i.test(h.raw)) { linkIssues.push({ from: url, href: h.raw, text: h.text, issue: 'javascript: link' }); continue; }
    if (/^(mailto|tel):/i.test(h.raw)) continue;
    if (!/^[a-z]+:|^\//i.test(h.raw) && new URL(url).pathname.split('/').length > 2) linkIssues.push({ from: url, href: h.raw, text: h.text, issue: 'relative link on nested page' });
    enqueue(h.abs, url);
  }
}
current = null;

// Status check for every internal link target that was discovered but not crawled (cap reached)
const notCrawled = queue.slice(0, 300);
for (const u of notCrawled) {
  const r = await context.request.get(u, { maxRedirects: 5 }).catch(() => null);
  pages.set(u, { url: u, status: r?.status() ?? -1, console: [], jsErrors: [], failed: [], statusOnly: true });
}

// Screenshots of key templates at three widths (human review)
const KEY = ['/', '/products', '/products/corex-pro-m2-pcie-gen-5-0-nvme-ssd', '/compare?items=corex-pro-m2-pcie-gen-5-0-nvme-ssd,corex-m2-pcie-gen-4-0-nvme-ssd', '/compatibility', '/support', '/rma', '/contact', '/quote', '/careers', '/about', '/learn', '/where-to-buy', '/partners', '/search?q=ddr5', '/legal', '/ar', '/does-not-exist-zt'];
for (const w of [390, 768, 1440]) {
  await page.setViewportSize({ width: w, height: 900 });
  for (const p of KEY) {
    try {
      await page.goto(ORIGIN + p, { waitUntil: 'load', timeout: 30_000 });
      await page.waitForTimeout(1500);
      const name = (p === '/' ? 'home' : p.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '')).slice(0, 60);
      await page.screenshot({ path: join(outDir, 'shots', `${name}-${w}.png`), fullPage: true });
    } catch (e) { linkIssues.push({ from: p, issue: `screenshot failed at ${w}px: ${String(e).slice(0, 120)}` }); }
  }
}
// Mobile drawer + desktop mega-menu interaction
await page.setViewportSize({ width: 390, height: 900 });
await page.goto(ORIGIN + '/', { waitUntil: 'load' });
await page.waitForTimeout(1000);
const burger = page.locator('[aria-controls*="drawer" i], .burger, .menu-toggle, button[aria-label*="menu" i]').first();
if (await burger.count()) { await burger.click(); await page.waitForTimeout(500); await page.screenshot({ path: join(outDir, 'shots', 'drawer-open-390.png') }); }
else linkIssues.push({ from: '/', issue: 'no mobile menu toggle found at 390px' });
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(ORIGIN + '/', { waitUntil: 'load' });
await page.waitForTimeout(1000);
const navTop = page.locator('header nav a, header nav button').first();
if (await navTop.count()) { await navTop.hover(); await page.waitForTimeout(500); await page.screenshot({ path: join(outDir, 'shots', 'megamenu-hover-1440.png') }); }

await browser.close();

const all = [...pages.values()];
const bad = all.filter((p) => p.status >= 400 || p.status <= 0);
const withErrors = all.filter((p) => p.console.length || p.jsErrors.length || p.failed.length);
const summary = {
  at: new Date().toISOString(), crawled: all.filter((p) => !p.statusOnly).length, statusOnly: all.filter((p) => p.statusOnly).length,
  badStatus: bad.map((p) => ({ url: p.url, status: p.status, error: p.error })),
  pagesWithErrors: withErrors.map((p) => ({ url: p.url, console: [...new Set(p.console)].slice(0, 5), jsErrors: p.jsErrors.slice(0, 3), failed: [...new Set(p.failed)].slice(0, 8) })),
  linkIssues: linkIssues.slice(0, 500), linkIssueCount: linkIssues.length,
  external: [...external].sort(),
};
writeFileSync(join(outDir, 'crawl.json'), JSON.stringify({ summary, pages: all }, null, 1));
const failed = bad.length + withErrors.length + linkIssues.length + (plant ? 1 : 0);
console.log(`crawl: ${summary.crawled} pages crawled, ${summary.statusOnly} status-only; ${bad.length} bad status, ${withErrors.length} pages with errors, ${linkIssues.length} link issues`);
process.exit(failed ? 1 : 0);
