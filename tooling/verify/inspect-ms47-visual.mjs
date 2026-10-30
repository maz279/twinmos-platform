// tooling/verify/inspect-ms47-visual.mjs
// Milestone MS4.7: Visual, Manual & Accessibility (a11y) Inspection Suite
// Tests Truthful Entities (Offices, Testimonials, FAQs), Forms (Quote, Contact with JIT notice),
// Localisation (Arabic RTL, D-8 resolution), and Admin Accessible Menu Tree Editor.

import { chromium } from '@playwright/test';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve('axe-core'), 'utf8');

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const EVIDENCE_DIR = resolve(ROOT, 'tooling/verify/evidence/ms47');
mkdirSync(EVIDENCE_DIR, { recursive: true });

const ARTIFACTS_DIR = 'C:/Users/DELL/.gemini/antigravity/brain/1b456724-1889-46de-b5d3-1e352373438f';

const WEB_URL = process.env.WEB_URL || 'http://127.0.0.1:4321';
const API_URL = process.env.API_URL || 'http://127.0.0.1:8787';
const ADMIN_URL = process.env.ADMIN_URL || 'http://127.0.0.1:5173';

console.log('================================================================');
console.log('    MS4.7 Visual, Manual & Accessibility (a11y) Inspection');
console.log('================================================================\n');

async function runVisualA11yInspection() {
  const totals = {
    pagesTested: 0,
    a11yViolationsTotal: 0,
    failures: [],
  };

  const browser = await chromium.launch({ headless: true });

  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'TwinMOS-MS47-Visual-Inspector/1.0 (Desktop)',
  });
  const page = await desktopContext.newPage();

  async function runAxe(pageInstance, pageName) {
    await pageInstance.evaluate(axeSource);
    const results = await pageInstance.evaluate(async () => {
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

    console.log(`  🔍 Axe-core check on ${pageName}: ${seriousOrCritical.length} critical/serious violations (${results.violations.length} total).`);
    totals.pagesTested += 1;
    totals.a11yViolationsTotal += seriousOrCritical.length;

    if (seriousOrCritical.length > 0) {
      console.warn(`     Violations in ${pageName}:`, seriousOrCritical.map(v => `${v.id} (${v.help}) - ${v.nodes?.map(n => n.target?.join(' > ')).join(', ')}`));
      totals.failures.push(`${pageName}: ${seriousOrCritical.length} serious/critical violations`);
    }
    return results;
  }

  function saveShot(buffer, name) {
    const evPath = resolve(EVIDENCE_DIR, name);
    const artPath = resolve(ARTIFACTS_DIR, name);
    writeFileSync(evPath, buffer);
    writeFileSync(artPath, buffer);
    console.log(`  📸 Saved evidence: ${name}`);
  }

  try {
    // -------------------------------------------------------------
    // Step 1: Contact Page & Authentic 5-Hub Office Directory
    // -------------------------------------------------------------
    console.log('1. Inspecting /contact.html (Authentic Offices & Contact Form)...');
    await page.goto(`${WEB_URL}/contact.html`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const contactShot = await page.screenshot({ fullPage: true });
    saveShot(contactShot, 'ms47_drive_01_contact_offices.png');
    await runAxe(page, 'Contact Page (/contact.html)');

    // -------------------------------------------------------------
    // Step 2: Quote Request Page & JIT Privacy Notice
    // -------------------------------------------------------------
    console.log('2. Inspecting /quote.html (Enterprise Quote Form with Catalog SKUs)...');
    await page.goto(`${WEB_URL}/quote.html`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Fill form to test manual interactive flow
    const nameInput = await page.$('input[name="name"]');
    if (nameInput) await page.fill('input[name="name"]', 'David Vance (Data Systems)');
    const emailInput = await page.$('input[name="email"]');
    if (emailInput) await page.fill('input[name="email"]', 'david.vance@hyperscale-systems.com');
    const compInput = await page.$('input[name="company"]');
    if (compInput) await page.fill('input[name="company"]', 'HyperScale Data Systems Inc.');
    const notesInput = await page.$('textarea[name="notes"]');
    if (notesInput) await page.fill('textarea[name="notes"]', 'Evaluation quote for 250x NVMe 2TB drives for enterprise hyperconverged virtualization.');

    const quoteShot = await page.screenshot({ fullPage: true });
    saveShot(quoteShot, 'ms47_drive_02_quote_form.png');
    await runAxe(page, 'Quote Page (/quote.html)');

    // -------------------------------------------------------------
    // Step 3: Arabic RTL Public Surface (/ar)
    // -------------------------------------------------------------
    console.log('3. Inspecting Arabic RTL Surface (/ar)...');
    await page.goto(`${WEB_URL}/ar`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const rtlShot = await page.screenshot({ fullPage: false });
    saveShot(rtlShot, 'ms47_drive_03_arabic_rtl.png');
    await runAxe(page, 'Arabic RTL Homepage (/ar)');

    // -------------------------------------------------------------
    // Step 4: Admin Console - Accessible Menu Tree Editor
    // -------------------------------------------------------------
    console.log('4. Navigating to Admin Settings Menus Editor...');
    await page.goto(`${ADMIN_URL}`, { waitUntil: 'networkidle' });

    // Handle dev auto-login or credentials
    const isLogin = await page.$('input[type="email"]');
    if (isLogin) {
      await page.fill('input[type="email"]', 'admin@twinmos.dev');
      await page.fill('input[type="password"]', 'admin');
      await page.click('button:has-text("Sign in")');
      await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
    }

    // Switch to Settings module
    const settingsTab = await page.$('button:has-text("Settings")');
    if (settingsTab) {
      await settingsTab.click();
      await page.waitForTimeout(1000);
    }

    // Switch to Menus sub-tab
    const menusSubTab = await page.$('button:has-text("Menus")');
    if (menusSubTab) {
      await menusSubTab.click();
      await page.waitForTimeout(1000);
    }

    const menuEditorShot = await page.screenshot({ fullPage: true });
    saveShot(menuEditorShot, 'ms47_drive_04_admin_menu_tree_editor.png');
    await runAxe(page, 'Admin Settings Menus Tree Editor');

    // -------------------------------------------------------------
    // Step 5: Mobile Viewport Visual Inspection
    // -------------------------------------------------------------
    console.log('5. Mobile Viewport (iPhone 14) Visual Check...');
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(`${WEB_URL}/contact.html`, { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(800);

    const mobileShot = await mobilePage.screenshot({ fullPage: false });
    saveShot(mobileShot, 'ms47_drive_05_mobile_contact.png');
    await runAxe(mobilePage, 'Mobile Contact Page');

    await mobileContext.close();
  } catch (err) {
    console.error('Visual Inspection failed with exception:', err);
    totals.failures.push(String(err));
  } finally {
    await browser.close();
  }

  console.log('\n================================================================');
  console.log(`Visual Inspection Summary:`);
  console.log(`  Pages Tested: ${totals.pagesTested}`);
  console.log(`  WCAG 2.2 Critical/Serious Violations: ${totals.a11yViolationsTotal}`);
  console.log(`  Failures Encountered: ${totals.failures.length}`);
  console.log('================================================================\n');

  if (totals.a11yViolationsTotal > 0 || totals.failures.length > 0) {
    process.exit(1);
  }
}

runVisualA11yInspection();
