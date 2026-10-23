// tooling/verify/inspect-ms48-visual.mjs
// Milestone MS4.8: Visual, Manual & Accessibility (a11y) Inspection Suite
// Tests Data-bound blocks (policyTabs, officeCards, glossaryIndex, articleList),
// appEmbed interactive islands (0-hardcode via widgets-config.js),
// and Admin Translation Studio Content Entities split view with RTL and status pills.

import { chromium } from '@playwright/test';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve('axe-core'), 'utf8');

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const EVIDENCE_DIR = resolve(ROOT, 'tooling/verify/evidence/ms48');
mkdirSync(EVIDENCE_DIR, { recursive: true });

const ARTIFACTS_DIR = 'C:/Users/DELL/.gemini/antigravity/brain/1b456724-1889-46de-b5d3-1e352373438f';

const WEB_URL = process.env.WEB_URL || 'http://127.0.0.1:4321';
const API_URL = process.env.API_URL || 'http://127.0.0.1:8787';
const ADMIN_URL = process.env.ADMIN_URL || 'http://127.0.0.1:5173';

console.log('================================================================');
console.log('    MS4.8 Visual, Manual & Accessibility (a11y) Inspection');
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
    userAgent: 'TwinMOS-MS48-Visual-Inspector/1.0 (Desktop)',
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
    // Step 1: Homepage & Interactive Upgrade Advisor Island (appEmbed)
    // -------------------------------------------------------------
    console.log('1. Inspecting Homepage & Upgrade Advisor Island (/)...');
    await page.goto(`${WEB_URL}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Scroll to the Upgrade Advisor widget
    const advisorSection = await page.$('#advisor, [data-widget="advisor"], .advisor-wizard, section:has-text("Advisor"), section:has-text("Find Your Upgrade")');
    if (advisorSection) {
      await advisorSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      // Attempt interaction with advisor island
      const laptopOption = await page.$('button[data-device="laptop"], .advisor-option:first-child, button:has-text("Laptop")');
      if (laptopOption) {
        await laptopOption.click();
        await page.waitForTimeout(400);
      }
    }

    const homeShot = await page.screenshot({ fullPage: true });
    saveShot(homeShot, 'ms48_drive_01_homepage_advisor_island.png');
    await runAxe(page, 'Homepage with Upgrade Advisor Island (/)');

    // -------------------------------------------------------------
    // Step 2: Learning Center Hub (/learn.html) - ArticleList Block
    // -------------------------------------------------------------
    console.log('2. Inspecting Learning Center Articles Hub (/learn.html)...');
    await page.goto(`${WEB_URL}/learn.html`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    const learnShot = await page.screenshot({ fullPage: true });
    saveShot(learnShot, 'ms48_drive_02_learning_center_articles.png');
    await runAxe(page, 'Learning Center Hub (/learn.html)');

    // -------------------------------------------------------------
    // Step 3: Glossary Directory (/learn-glossary.html) - GlossaryIndex Block
    // -------------------------------------------------------------
    console.log('3. Inspecting Memory & Storage Glossary (/learn-glossary.html)...');
    await page.goto(`${WEB_URL}/learn-glossary.html`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    const glossaryShot = await page.screenshot({ fullPage: true });
    saveShot(glossaryShot, 'ms48_drive_03_glossary_index_az.png');
    await runAxe(page, 'Glossary Directory (/learn-glossary.html)');

    // -------------------------------------------------------------
    // Step 4: Legal & Policies (/legal.html) - PolicyTabs Block
    // -------------------------------------------------------------
    console.log('4. Inspecting Legal & Policies (/legal.html)...');
    await page.goto(`${WEB_URL}/legal.html`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    const legalShot = await page.screenshot({ fullPage: true });
    saveShot(legalShot, 'ms48_drive_04_legal_policy_tabs.png');
    await runAxe(page, 'Legal & Policies (/legal.html)');

    // -------------------------------------------------------------
    // Step 5: Admin Translation Studio - Content Entities View
    // -------------------------------------------------------------
    console.log('5. Inspecting Admin Translation Studio Content Entities (/admin)...');
    await page.goto(`${ADMIN_URL}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const isLogin = await page.$('input[type="email"]');
    if (isLogin) {
      await page.fill('input[type="email"]', 'admin@twinmos.dev');
      await page.fill('input[type="password"]', 'admin');
      await page.click('button:has-text("Sign in")');
      await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
      await page.waitForTimeout(1000);
    }

    // Switch to Translations module
    const transTab = await page.$('button:has-text("Translations")');
    if (transTab) {
      await transTab.click();
      await page.waitForTimeout(1000);
    }

    // Ensure "Content Entities" sub-tab is selected
    const entitiesTab = await page.$('button:has-text("Content Entities")');
    if (entitiesTab) {
      await entitiesTab.click();
      await page.waitForTimeout(1200);
    }

    const adminTransShot = await page.screenshot({ fullPage: true });
    saveShot(adminTransShot, 'ms48_drive_05_admin_translation_entities_studio.png');
    await runAxe(page, 'Admin Translation Studio Content Entities');

    // -------------------------------------------------------------
    // Step 6: Mobile Viewport (iPhone 14) Visual Check
    // -------------------------------------------------------------
    console.log('6. Mobile Viewport (iPhone 14) Visual Check...');
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(`${WEB_URL}/learn.html`, { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(800);

    const mobileShot = await mobilePage.screenshot({ fullPage: false });
    saveShot(mobileShot, 'ms48_drive_06_mobile_learning_center.png');
    await runAxe(mobilePage, 'Mobile Learning Center (/learn.html)');

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
  if (totals.failures.length > 0) {
    console.error(`  Failures Encountered:\n    - ${totals.failures.join('\n    - ')}`);
  }
  console.log('================================================================');

  if (totals.a11yViolationsTotal > 0 || totals.failures.length > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runVisualA11yInspection();
