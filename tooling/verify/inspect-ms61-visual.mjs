#!/usr/bin/env node
// inspect-ms61-visual.mjs — Playwright Visual, Manual & Axe-core WCAG 2.2 AA Audit for Milestone MS6.1
// Covers:
// 1. Public /legal: Operative v1.0 Privacy Policy, counsel sign-off (H. Lin), multi-jurisdiction TOC.
// 2. Public /contact: JIT privacy notice (data-form-privacy-notice) and consent link to /legal?tab=privacy.
// 3. Public /rma: Customer intake personal data notice & compliance link.
// 4. Public Footer: Global newsletter subscription JIT notice (data-newsletter-notice).
// 5. Admin Console: Privacy & DSAR Console (super_admin exclusive module).
// 6. Admin Console: DSAR Data Subject Export execution & breakdown badges preview.

import { chromium } from '@playwright/test';
import { readFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve('axe-core'), 'utf8');

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const EVIDENCE_DIR = resolve(ROOT, 'tooling/verify/evidence/ms61');
mkdirSync(EVIDENCE_DIR, { recursive: true });

const ARTIFACTS_DIR = 'C:/Users/DELL/.gemini/antigravity/brain/1b456724-1889-46de-b5d3-1e352373438f';

const WEB_URL = process.env.WEB_URL || 'http://127.0.0.1:4321';
const ADMIN_URL = process.env.ADMIN_URL || 'http://127.0.0.1:5173';

console.log('================================================================');
console.log('  Milestone MS6.1: Visual, Manual & A11y Inspection Suite');
console.log('  Privacy Operations, Legal Sign-off, JIT Notices & Admin Console');
console.log('================================================================\n');

async function runVisualA11yInspection() {
  const totals = {
    pagesTested: 0,
    a11yViolationsTotal: 0,
    screenshots: [],
    failures: [],
  };

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) TwinMOS-MS61-Inspector/1.0',
  });
  const page = await context.newPage();

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

    console.log(`  [Axe-core Audit: ${pageName}]`);
    console.log(`    Total Violations: ${results.violations.length} (Critical/Serious: ${seriousOrCritical.length})`);

    if (seriousOrCritical.length > 0) {
      seriousOrCritical.forEach((v) => {
        console.error(`    ❌ [${v.impact?.toUpperCase()}] ${v.id}: ${v.description}`);
        totals.failures.push(`${pageName}: [${v.impact}] ${v.id} - ${v.description}`);
      });
    } else {
      console.log(`    ✅ 0 critical/serious WCAG 2.2 AA violations`);
    }

    totals.a11yViolationsTotal += seriousOrCritical.length;
    return results;
  }

  function saveShot(buffer, filename) {
    const localPath = join(EVIDENCE_DIR, filename);
    const { writeFileSync } = require('node:fs');
    writeFileSync(localPath, buffer);
    console.log(`  📸 Screenshot saved: ${localPath}`);

    if (existsSync(ARTIFACTS_DIR)) {
      const artifactPath = join(ARTIFACTS_DIR, filename);
      copyFileSync(localPath, artifactPath);
      console.log(`  📋 Mirrored to artifact: ${artifactPath}`);
    }
    totals.screenshots.push(filename);
  }

  // --------------------------------------------------------------------------
  // DRIVE 1: Public Legal & Privacy Policy (/legal)
  // --------------------------------------------------------------------------
  console.log('1. Drive 1: Public Legal & Privacy Policy Page (/legal)...');
  totals.pagesTested++;
  await page.goto(`${WEB_URL}/legal`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // Click the Privacy Policy tab
  const privacyTab = page.locator('button:has-text("Privacy Policy"), button[data-tab="privacy"]').first();
  if (await privacyTab.isVisible()) {
    await privacyTab.click();
    await page.waitForTimeout(600);
  }

  // Verify counsel approval & operative badge
  const content = await page.content();
  const hasOperative = content.includes('Operative policy');
  const hasCounsel = content.includes('H. Lin') || content.includes('Legal Counsel');
  console.log(`  - Operative Policy Badge: ${hasOperative ? 'YES' : 'NO'}`);
  console.log(`  - Legal Counsel Sign-off: ${hasCounsel ? 'YES' : 'NO'}`);

  const shot1 = await page.screenshot({ fullPage: true });
  saveShot(shot1, 'ms61_drive_01_legal_privacy_policy.png');
  await runAxe(page, 'Public Legal & Privacy Policy (/legal)');

  // --------------------------------------------------------------------------
  // DRIVE 2: Public Contact Form JIT Notice & Consent (/contact)
  // --------------------------------------------------------------------------
  console.log('\n2. Drive 2: Public Contact Form JIT Notice (/contact)...');
  totals.pagesTested++;
  await page.goto(`${WEB_URL}/contact`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // Scroll to contact form
  const formSection = page.locator('form, [data-form-privacy-notice]').first();
  if (await formSection.isVisible()) {
    await formSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
  }

  const shot2 = await page.screenshot({ fullPage: true });
  saveShot(shot2, 'ms61_drive_02_contact_jit_notice.png');
  await runAxe(page, 'Public Contact Form (/contact)');

  // --------------------------------------------------------------------------
  // DRIVE 3: Public RMA Portal JIT Notice (/rma)
  // --------------------------------------------------------------------------
  console.log('\n3. Drive 3: Public RMA Portal JIT Notice (/rma)...');
  totals.pagesTested++;
  await page.goto(`${WEB_URL}/rma`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  const shot3 = await page.screenshot({ fullPage: true });
  saveShot(shot3, 'ms61_drive_03_rma_jit_notice.png');
  await runAxe(page, 'Public RMA Portal (/rma)');

  // --------------------------------------------------------------------------
  // DRIVE 4: Global Footer Newsletter Subscription Notice (/)
  // --------------------------------------------------------------------------
  console.log('\n4. Drive 4: Global Footer Newsletter Subscription Notice (/)...');
  totals.pagesTested++;
  await page.goto(`${WEB_URL}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // Scroll to footer
  const footer = page.locator('footer').first();
  if (await footer.isVisible()) {
    await footer.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
  }

  const shot4 = await page.screenshot({ fullPage: true });
  saveShot(shot4, 'ms61_drive_04_footer_newsletter_notice.png');
  await runAxe(page, 'Global Footer (/footer)');

  // --------------------------------------------------------------------------
  // DRIVE 5: Admin Privacy & DSAR Console GUI (/admin)
  // --------------------------------------------------------------------------
  console.log('\n5. Drive 5: Admin Privacy Operations Console (/admin)...');
  totals.pagesTested++;
  await page.goto(`${ADMIN_URL}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  // Sign in if on login page
  const emailInput = page.locator('input[type="email"]');
  if (await emailInput.isVisible()) {
    console.log('  - Authenticating as platform super_admin...');
    await emailInput.fill('admin@twinmos.dev');
    await page.locator('input[type="password"]').fill('admin');
    await page.locator('button:has-text("Sign in")').click();
    await page.waitForTimeout(1500);
  }

  // Navigate to Privacy & DSAR module
  const privacyNavBtn = page.locator('button:has-text("Privacy & DSAR")').first();
  if (await privacyNavBtn.isVisible()) {
    console.log('  - Clicking Privacy & DSAR navigation button...');
    await privacyNavBtn.click();
    await page.waitForTimeout(1000);
  }

  const shot5 = await page.screenshot({ fullPage: true });
  saveShot(shot5, 'ms61_drive_05_admin_privacy_console.png');
  await runAxe(page, 'Admin Privacy Console (/admin)');

  // --------------------------------------------------------------------------
  // DRIVE 6: Admin Privacy Console - DSAR Export Execution & Badges Preview
  // --------------------------------------------------------------------------
  console.log('\n6. Drive 6: Admin Privacy Console - DSAR Export Execution...');
  totals.pagesTested++;

  const exportInput = page.locator('#dsar-export-email');
  if (await exportInput.isVisible()) {
    await exportInput.fill('user@example.com');
    const exportBtn = page.locator('button:has-text("Export Subject Data")');
    if (await exportBtn.isVisible()) {
      await exportBtn.click();
      await page.waitForTimeout(1200);
    }
  }

  const shot6 = await page.screenshot({ fullPage: true });
  saveShot(shot6, 'ms61_drive_06_admin_export_result.png');

  await browser.close();

  console.log('\n----------------------------------------------------------------');
  console.log(`Inspection Complete: ${totals.pagesTested} drives inspected.`);
  console.log(`Screenshots Captured: ${totals.screenshots.length}`);
  console.log(`Critical/Serious A11y Violations: ${totals.a11yViolationsTotal}`);
  if (totals.a11yViolationsTotal === 0) {
    console.log('✅ ALL AXE-CORE WCAG 2.2 AA CHECKS PASSED WITH 0 CRITICAL/SERIOUS VIOLATIONS.');
  } else {
    console.error(`❌ Found ${totals.a11yViolationsTotal} accessibility violations.`);
    process.exit(1);
  }
  console.log('----------------------------------------------------------------\n');
}

runVisualA11yInspection().catch((err) => {
  console.error('Fatal inspection failure:', err);
  process.exit(1);
});
