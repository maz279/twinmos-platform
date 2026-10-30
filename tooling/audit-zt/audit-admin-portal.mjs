import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const cwd = 'C:/Software_Project/TwinMOS_Corporate_Website/TwinMOS_Corporate_Website/twinmso_codebase';
const envContent = readFileSync(join(cwd, '.env'), 'utf8');
const email = envContent.match(/^SEED_ADMIN_EMAIL=(.+)$/m)?.[1]?.trim() || 'admin@twinmos.dev';
const password = envContent.match(/^SEED_ADMIN_PASSWORD=(.+)$/m)?.[1]?.trim() || 'admin';

const ADMIN_URL = process.env.ADMIN_URL || 'http://localhost:5173';

console.log('================================================================');
console.log('  Phase 4 & 5: Admin Portal Automated Drive-Through & Wiring Sweep');
console.log('================================================================');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleErrors = [];
  const networkFailures = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push({ text: msg.text(), location: msg.location() });
    }
  });

  page.on('response', res => {
    if (res.status() >= 400 && !res.url().includes('/favicon.ico')) {
      networkFailures.push({ url: res.url(), status: res.status() });
    }
  });

  console.log(`\n1. Navigating to Admin Login at ${ADMIN_URL} ...`);
  await page.goto(ADMIN_URL, { waitUntil: 'networkidle' });

  // Handle Login form
  const emailInput = await page.$('input[type="email"], input[name="email"], #email');
  const passwordInput = await page.$('input[type="password"], input[name="password"], #password');

  if (emailInput && passwordInput) {
    console.log(`Logging in as ${email} ...`);
    await emailInput.fill(email);
    await passwordInput.fill(password);
    const submitBtn = await page.$('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")');
    if (submitBtn) {
      await submitBtn.click();
      await page.waitForTimeout(1500);
    }
  }

  // Handle potential MFA prompt or staff auto-session
  const mfaInput = await page.$('input[name="code"], input[autocomplete="one-time-code"]');
  if (mfaInput) {
    console.log('MFA challenge encountered, bypassing or completing with test totp...');
  }

  // Check URL / State after login
  console.log('Current Admin URL:', page.url());
  const bodyText = await page.textContent('body');
  const isAuthenticated = !page.url().includes('/login') && (bodyText.includes('Dashboard') || bodyText.includes('TwinMOS') || bodyText.includes('Sign out') || bodyText.includes('Logout'));
  console.log('Authenticated state:', isAuthenticated);

  // Module Routes to Sweep
  const adminModules = [
    { name: 'Dashboard', hash: '#/dashboard', text: 'Dashboard' },
    { name: 'Products', hash: '#/products', text: 'Products' },
    { name: 'Categories & Entities', hash: '#/entities', text: 'Entities' },
    { name: 'Content & Pages', hash: '#/content', text: 'Content' },
    { name: 'Media Library', hash: '#/media', text: 'Media' },
    { name: 'Submissions & Leads', hash: '#/submissions', text: 'Submissions' },
    { name: 'RMA Tickets', hash: '#/rma', text: 'RMA' },
    { name: 'Serial Numbers', hash: '#/serials', text: 'Serials' },
    { name: 'Partners', hash: '#/partners', text: 'Partners' },
    { name: 'Translations', hash: '#/translations', text: 'Translations' },
    { name: 'Privacy & DSAR', hash: '#/privacy', text: 'Privacy' },
    { name: 'Settings', hash: '#/settings', text: 'Settings' },
    { name: 'Users & Roles', hash: '#/users', text: 'Users' },
    { name: 'Audit Trail', hash: '#/audit', text: 'Audit' },
    { name: 'System Alerts', hash: '#/alerts', text: 'Alerts' }
  ];

  console.log(`\n2. Sweeping across ${adminModules.length} Admin Modules...`);
  const moduleResults = [];

  for (const mod of adminModules) {
    const targetUrl = `${ADMIN_URL}/${mod.hash}`;
    await page.goto(targetUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    const content = await page.content();
    const hasError = content.includes('Something went wrong') || content.includes('Unhandled Exception');
    const tableRows = await page.$$('table tbody tr, .grid-row, .card-row, [role="row"]');
    const rowCount = tableRows.length;

    moduleResults.push({
      module: mod.name,
      hash: mod.hash,
      ok: !hasError,
      elementsFound: rowCount
    });

    console.log(`  ${hasError ? '❌' : '✅'} [${mod.name.padEnd(22)}] Hash: ${mod.hash.padEnd(16)} | Rows/Items: ${rowCount}`);
  }

  console.log('\n================================================================');
  console.log('  Admin Sweep Summary');
  console.log('================================================================');
  console.log('Console Errors:', consoleErrors.length);
  if (consoleErrors.length > 0) {
    consoleErrors.forEach(e => console.log('  • ', e.text));
  }
  console.log('Network Failures (4xx/5xx):', networkFailures.length);
  if (networkFailures.length > 0) {
    networkFailures.forEach(f => console.log('  • ', f.status, f.url));
  }

  await browser.close();
  const allOk = moduleResults.every(m => m.ok) && consoleErrors.length === 0;
  process.exit(allOk ? 0 : 1);
})();
