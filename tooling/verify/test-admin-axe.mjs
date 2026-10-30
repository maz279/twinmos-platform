import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve('axe-core'), 'utf8');

const ADMIN_URL = process.env.ADMIN_URL || 'http://127.0.0.1:5173';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log(`Connecting to ${ADMIN_URL}...`);
  await page.goto(ADMIN_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // Login
  const emailInput = page.locator('input[type="email"]');
  if (await emailInput.isVisible()) {
    console.log('Signing in...');
    await emailInput.fill('admin@twinmos.dev');
    await page.locator('input[type="password"]').fill('admin');
    await page.locator('button:has-text("Sign in")').click();
    await page.waitForTimeout(2000);
  }

  // Find all module buttons in the sidebar
  const navButtons = await page.locator('button.tm-side-item').all();
  console.log(`Found ${navButtons.length} sidebar buttons.`);

  const moduleNames = [];
  for (const btn of navButtons) {
    const text = (await btn.innerText()).trim().split('\n')[0];
    if (text) moduleNames.push(text);
  }
  console.log('Modules to scan:', moduleNames);

  const report = {};

  for (const name of moduleNames) {
    console.log(`\nTesting module: "${name}"...`);
    const btn = page.locator(`button.tm-side-item:has-text("${name}")`).first();
    await btn.click();
    await page.waitForTimeout(1000);

    await page.evaluate(axeSource);
    const results = await page.evaluate(async () => {
      // @ts-ignore
      return await window.axe.run(document, {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
        },
        resultTypes: ['violations'],
      });
    });

    const seriousOrCritical = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    report[name] = {
      total: results.violations.length,
      seriousOrCritical: seriousOrCritical.length,
      items: results.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.length,
        help: v.help,
      })),
    };

    console.log(`  Module [${name}]: Total = ${results.violations.length}, Serious/Critical = ${seriousOrCritical.length}`);
    if (seriousOrCritical.length > 0) {
      seriousOrCritical.forEach((v) => {
        console.log(`   ❌ [${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} nodes)`);
        v.nodes.slice(0, 3).forEach(n => console.log(`      Node: ${n.target.join(' ')} | html: ${n.html.slice(0, 80)}`));
      });
    } else {
      console.log(`  ✅ 0 serious/critical violations`);
    }
  }

  await browser.close();

  console.log('\n=================== SUMMARY ===================');
  let totalViolations = 0;
  for (const [mod, data] of Object.entries(report)) {
    if (data.seriousOrCritical > 0) {
      console.log(`FAILED: ${mod} (${data.seriousOrCritical} serious/critical)`);
      totalViolations += data.seriousOrCritical;
    } else {
      console.log(`PASSED: ${mod}`);
    }
  }
  console.log(`\nTotal Serious/Critical Violations across modules: ${totalViolations}`);
  console.log('================================================\n');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
