import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const cwd = 'C:/Software_Project/TwinMOS_Corporate_Website/TwinMOS_Corporate_Website/twinmso_codebase';
const envContent = readFileSync(join(cwd, '.env'), 'utf8');
const email = envContent.match(/^SEED_ADMIN_EMAIL=(.+)$/m)?.[1]?.trim() || 'admin@twinmos.dev';
const password = envContent.match(/^SEED_ADMIN_PASSWORD=(.+)$/m)?.[1]?.trim() || 'admin';

const ADMIN_URL = 'http://localhost:5173';

console.log('================================================================');
console.log('  Testing Admin Sidebar Multi-Tab Interactions & Data Loading');
console.log('================================================================');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto(ADMIN_URL, { waitUntil: 'networkidle' });

  // Handle potential login
  const emailInput = await page.$('input[type="email"], input[name="email"], #email');
  if (emailInput) {
    await emailInput.fill(email);
    const passInput = await page.$('input[type="password"], input[name="password"], #password');
    if (passInput) await passInput.fill(password);
    const btn = await page.$('button[type="submit"]');
    if (btn) await btn.click();
    await page.waitForTimeout(1000);
  }

  // Find all sidebar module items
  const sideItems = await page.$$('.tm-side-item');
  console.log(`Found ${sideItems.length} sidebar items in admin navigation.`);

  const results = [];
  for (let i = 0; i < sideItems.length; i++) {
    // re-query items to avoid stale element reference
    const items = await page.$$('.tm-side-item');
    const item = items[i];
    if (!item) continue;

    const label = (await item.textContent())?.trim() || `Item-${i}`;
    await item.click();
    await page.waitForTimeout(600);

    const bodyText = await page.textContent('body');
    const hasModuleError = bodyText.includes('Failed to load') || bodyText.includes('Error loading');

    // Count elements rendered in the active workspace
    const tableRows = await page.$$('table tbody tr');
    const cards = await page.$$('.card, .stat-card, [role="article"]');
    const buttons = await page.$$('button');

    results.push({
      label,
      ok: !hasModuleError,
      rows: tableRows.length,
      cards: cards.length,
      buttons: buttons.length
    });

    console.log(`  ✅ [${label.padEnd(25)}] -> ${tableRows.length} rows, ${cards.length} cards, ${buttons.length} buttons`);
  }

  console.log(`\nSidebar test summary: ${results.length} modules clicked.`);
  console.log(`Console errors: ${errors.length}`);
  if (errors.length > 0) console.log(errors);

  await browser.close();
  process.exit(errors.length > 0 ? 1 : 0);
})();
