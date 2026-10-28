// Full-page screenshots of chosen paths through the lab edge, for human review.
// Also records console errors per page. Runs inside the Playwright image:
//   tooling/audit-zt/run-in-browser.sh tooling/audit-zt/shots.mjs <outDir> <width> <path> [path...]
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [outDir, width, ...paths] = process.argv.slice(2);
const ORIGIN = 'https://www.twinmos.com';
const CERTS = process.env.ZT_CERT_DIR ?? '/repo/tooling/audit-zt/lab/.certs';
mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({
  ignoreHTTPSErrors: true,
  clientCertificates: [{ origin: ORIGIN, certPath: `${CERTS}/client.pem`, keyPath: `${CERTS}/client.key` }],
  viewport: { width: Number(width), height: 900 },
});
const page = await ctx.newPage();
const errors = {};
let cur = '';
page.on('console', (m) => { if (m.type() === 'error' && !/SSL certificate error occurred when fetching the script/.test(m.text())) (errors[cur] ??= []).push(m.text().slice(0, 200)); });
page.on('pageerror', (e) => (errors[cur] ??= []).push(String(e).slice(0, 200)));
for (const p of paths) {
  cur = p;
  const res = await page.goto(ORIGIN + p, { waitUntil: 'load', timeout: 30_000 }).catch((e) => ({ status: () => String(e).slice(0, 80) }));
  await page.waitForTimeout(1500);
  const name = (p === '/' ? 'home' : p.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '')).slice(0, 60);
  await page.screenshot({ path: join(outDir, `${name}-${width}.png`), fullPage: true });
  console.log(p, res?.status?.());
}
writeFileSync(join(outDir, `console-${width}.json`), JSON.stringify(errors, null, 1));
await browser.close();
