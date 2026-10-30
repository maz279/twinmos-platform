// Re-loads given pages N times in Chromium (same context options as crawl.mjs)
// and reports every failed request — separates real defects from one-off
// network failures in a crawl.
// Usage (inside run-in-browser.sh): node tooling/audit-zt/recheck.mjs <times> <path> [path ...]
import { chromium } from 'playwright';

const [times, ...paths] = process.argv.slice(2);
const CERTS = 'tooling/audit-zt/lab/.certs';
const ORIGIN = 'https://www.twinmos.com';
const browser = await chromium.launch();
const context = await browser.newContext({
  ignoreHTTPSErrors: true,
  clientCertificates: [{ origin: ORIGIN, certPath: `${CERTS}/client.pem`, keyPath: `${CERTS}/client.key` }],
  serviceWorkers: 'block',
});
let bad = 0;
for (const p of paths) {
  for (let i = 1; i <= Number(times); i++) {
    const page = await context.newPage();
    const failed = [];
    page.on('requestfailed', (r) => failed.push(`${r.failure()?.errorText} ${r.url()}`));
    page.on('response', (r) => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`); });
    const res = await page.goto(ORIGIN + p, { waitUntil: 'load' });
    await page.waitForTimeout(1200);
    console.log(`${p} #${i}: ${res?.status()} failed=${failed.length}${failed.length ? ' ' + failed.join(' | ') : ''}`);
    if (failed.length) bad++;
    await page.close();
  }
}
await browser.close();
console.log(`recheck: ${bad} load(s) with failures`);
process.exit(bad ? 1 : 0);
