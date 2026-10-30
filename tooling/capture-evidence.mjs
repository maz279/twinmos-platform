import { chromium } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outDir = path.join(__dirname, 'verify', 'evidence');

const PAGES = [
  { name: 'evidence_01_home.png', url: 'http://localhost:4321/' },
  { name: 'evidence_02_shop.png', url: 'http://localhost:4321/shop' },
  { name: 'evidence_03_quote.png', url: 'http://localhost:4321/quote' },
  { name: 'evidence_04_rma.png', url: 'http://localhost:4321/rma' },
  { name: 'evidence_05_support.png', url: 'http://localhost:4321/support' },
  { name: 'evidence_06_arabic_rtl.png', url: 'http://localhost:4321/ar' },
];

async function capture() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  for (const item of PAGES) {
    console.log(`Capturing ${item.name} from ${item.url}...`);
    await page.goto(item.url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const dest = path.join(outDir, item.name);
    await page.screenshot({ path: dest, fullPage: false });
    console.log(`Saved ${dest}`);
  }

  // Admin capture
  console.log('Capturing admin console...');
  await page.goto('http://localhost:5173/#/m/products', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const onLogin = (await page.locator('text=Staff sign-in').count()) > 0;
  if (onLogin) {
    await page.fill('input[type="email"], input[name="email"]', 'admin@twinmos.dev');
    await page.fill('input[type="password"], input[name="password"]', 'admin');
    await page.locator('button:has-text("Sign in")').click();
    await page.waitForTimeout(1000);
  }
  const adminDest = path.join(outDir, 'evidence_07_admin_products.png');
  await page.screenshot({ path: adminDest, fullPage: false });
  console.log(`Saved ${adminDest}`);

  await browser.close();
  console.log('All screenshots captured successfully.');
}

capture().catch(err => {
  console.error('Capture failed:', err);
  process.exit(1);
});
