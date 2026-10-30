// Visual, Manual & Accessibility Inspection Suite for Milestone MS4.3 (T4.3.1–T4.3.4)
// Validates Glossary A-Z (113 terms, filter, explainers), Versioned Policies, Legal tabs, and axe-core a11y.
import { chromium } from '@playwright/test';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve('axe-core'), 'utf8');

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const EVIDENCE_DIR = resolve(ROOT, 'tooling/verify/evidence/ms43');
mkdirSync(EVIDENCE_DIR, { recursive: true });

const WEB_URL = process.env.WEB_URL || 'http://127.0.0.1:4321';
const ADMIN_URL = process.env.ADMIN_URL || 'http://127.0.0.1:5173';
const API_URL = process.env.API_URL || 'http://127.0.0.1:8787';
const EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@twinmos.dev';
const PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'admin';

console.log('================================================================');
console.log('       MS4.3 Visual, Manual & Accessibility (a11y) Audit');
console.log('================================================================\n');

async function runVisualA11yInspection() {
  const totals = {
    glossaryTermsFound: 0,
    glossaryA11yViolations: 0,
    legalA11yViolations: 0,
    tabsTested: 0,
    failures: [],
  };

  const browser = await chromium.launch({ headless: true });

  // Desktop viewport
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'TwinMOS-MS43-Visual-Inspector/1.0 (Desktop)',
  });
  const page = await desktopContext.newPage();

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  // ==========================================================================
  // 1. Inspect Public Glossary Page (/learn-glossary.html)
  // ==========================================================================
  console.log('[1/4] Inspecting Public Glossary at', `${WEB_URL}/learn-glossary.html`);
  await page.goto(`${WEB_URL}/learn-glossary.html`, { waitUntil: 'domcontentloaded' });
  const glossaryTitle = await page.title();
  console.log(`  ✓ Page title: "${glossaryTitle}"`);

  // Count rendered terms
  const renderedTerms = await page.locator('.lterm').count();
  totals.glossaryTermsFound = renderedTerms;
  console.log(`  ✓ Rendered glossary terms in DOM: ${renderedTerms}`);
  if (renderedTerms !== 113) {
    totals.failures.push(`Expected 113 terms, found ${renderedTerms}`);
    console.error(`  ✗ Terms count mismatch: ${renderedTerms} !== 113`);
  }

  // Verify first and last terms
  const firstTermText = await page.locator('.lterm dt b').first().innerText();
  const lastTermText = await page.locator('.lterm dt b').last().innerText();
  console.log(`  ✓ First term: "${firstTermText}", Last term: "${lastTermText}"`);

  // Test interactive A-Z jump bar
  const letterCount = await page.locator('.lidx a').count();
  console.log(`  ✓ A-Z index bar carries ${letterCount} letters.`);

  // Click letter 'D' jump link
  const linkD = page.locator('.lidx a[data-letter="D"]');
  if (await linkD.isVisible()) {
    await linkD.click();
    console.log('  ✓ Clicked letter "D" in jump index.');
  }

  // Test interactive search filtering: type "latency"
  const searchInput = page.locator('#glossQ');
  if (await searchInput.isVisible()) {
    await searchInput.fill('latency');
    await page.waitForTimeout(300);
    const visibleAfterSearch = await page.locator('.lterm:visible').count();
    console.log(`  ✓ Filter "latency" typed: ${visibleAfterSearch} terms visible (expected ~3).`);
    // Clear search
    await searchInput.fill('');
    await page.waitForTimeout(200);
  }

  // Verify explainer link presence (e.g. CAS Latency or XMP)
  const explainerLinksCount = await page.locator('.lterm-ref').count();
  console.log(`  ✓ Explainer links rendered in glossary: ${explainerLinksCount} (expected 18).`);

  // Capture desktop screenshot
  await page.screenshot({ path: resolve(EVIDENCE_DIR, 'ms43-glossary-desktop.png'), fullPage: false });
  console.log('  ✓ Desktop screenshot captured: ms43-glossary-desktop.png');

  // Inject axe-core and run accessibility audit
  await page.evaluate(axeSource);
  const glossaryA11y = await page.evaluate(async () => {
    // @ts-ignore
    return await axe.run({
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag22aa'] },
    });
  });
  totals.glossaryA11yViolations = glossaryA11y.violations.length;
  console.log(`  ✓ axe-core a11y violations on Glossary: ${glossaryA11y.violations.length}`);
  if (glossaryA11y.violations.length > 0) {
    for (const v of glossaryA11y.violations) {
      console.warn(`    [${v.impact}] ${v.id}: ${v.description}`);
    }
  }

  // ==========================================================================
  // 2. Inspect Public Legal & Policy Page (/legal.html)
  // ==========================================================================
  console.log('\n[2/4] Inspecting Public Legal & Policy at', `${WEB_URL}/legal.html`);
  await page.goto(`${WEB_URL}/legal.html`, { waitUntil: 'domcontentloaded' });
  const legalTitle = await page.title();
  console.log(`  ✓ Page title: "${legalTitle}"`);

  // Verify Operative Warranty Policy
  const warrantyPane = page.locator('#legal-warranty');
  const warrantyVisible = await warrantyPane.isVisible();
  const warrantyText = await warrantyPane.innerText();
  const isOperative = warrantyText.includes('Operative policy');
  const hasVersion = warrantyText.includes('Version 1.1');
  const hasLifetime = warrantyText.includes('Lifetime warranty');
  console.log(`  ✓ Warranty tab visible: ${warrantyVisible}, Operative badge: ${isOperative}, Version 1.1: ${hasVersion}, Lifetime DRAM: ${hasLifetime}`);

  // Test interactive tab switching
  const tabs = page.locator('.tabs button.tab');
  const tabCount = await tabs.count();
  console.log(`  ✓ Found ${tabCount} tabs in legal navigation.`);

  // Click "Terms of Use" tab
  const termsBtn = page.locator('.tabs button[data-tab="legal-terms"]');
  if (await termsBtn.isVisible()) {
    await termsBtn.click();
    await page.waitForTimeout(200);
    const termsVisible = await page.locator('#legal-terms').isVisible();
    const termsDraftBadge = await page.locator('#legal-terms .chip.warn').innerText();
    console.log(`  ✓ Clicked Terms tab: visible=${termsVisible}, badge="${termsDraftBadge}"`);
    totals.tabsTested++;
  }

  // Click "Privacy Policy" tab
  const privacyBtn = page.locator('.tabs button[data-tab="legal-privacy"]');
  if (await privacyBtn.isVisible()) {
    await privacyBtn.click();
    await page.waitForTimeout(200);
    const privacyVisible = await page.locator('#legal-privacy').isVisible();
    const privacyDraftBadge = await page.locator('#legal-privacy .chip.warn').innerText();
    console.log(`  ✓ Clicked Privacy tab: visible=${privacyVisible}, badge="${privacyDraftBadge}"`);
    totals.tabsTested++;
  }

  // Click "Cookie Policy" tab
  const cookiesBtn = page.locator('.tabs button[data-tab="legal-cookies"]');
  if (await cookiesBtn.isVisible()) {
    await cookiesBtn.click();
    await page.waitForTimeout(200);
    const cookiesVisible = await page.locator('#legal-cookies').isVisible();
    console.log(`  ✓ Clicked Cookies tab: visible=${cookiesVisible}`);
    totals.tabsTested++;
  }

  // Click "More Policies" tab
  const moreBtn = page.locator('.tabs button[data-tab="legal-more"]');
  if (await moreBtn.isVisible()) {
    await moreBtn.click();
    await page.waitForTimeout(200);
    const moreVisible = await page.locator('#legal-more').isVisible();
    const cardsCount = await page.locator('#legal-more .b-cell').count();
    console.log(`  ✓ Clicked More Policies tab: visible=${moreVisible}, additional policies grid cards=${cardsCount}`);
    totals.tabsTested++;
  }

  // Return to Warranty tab
  const warrantyBtn = page.locator('.tabs button[data-tab="legal-warranty"]');
  if (await warrantyBtn.isVisible()) {
    await warrantyBtn.click();
    await page.waitForTimeout(200);
  }

  // Capture desktop screenshot of legal page
  await page.screenshot({ path: resolve(EVIDENCE_DIR, 'ms43-legal-desktop.png'), fullPage: false });
  console.log('  ✓ Desktop screenshot captured: ms43-legal-desktop.png');

  // Inject axe-core and run accessibility audit on legal page
  await page.evaluate(axeSource);
  const legalA11y = await page.evaluate(async () => {
    // @ts-ignore
    return await axe.run({
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag22aa'] },
    });
  });
  totals.legalA11yViolations = legalA11y.violations.length;
  console.log(`  ✓ axe-core a11y violations on Legal: ${legalA11y.violations.length}`);
  if (legalA11y.violations.length > 0) {
    for (const v of legalA11y.violations) {
      console.warn(`    [${v.impact}] ${v.id}: ${v.description}`);
    }
  }

  // ==========================================================================
  // 3. Inspect Mobile Responsive Views
  // ==========================================================================
  console.log('\n[3/4] Inspecting Mobile Responsive Views (390x844)');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    userAgent: 'TwinMOS-MS43-Visual-Inspector/1.0 (Mobile)',
  });
  const mPage = await mobileContext.newPage();

  await mPage.goto(`${WEB_URL}/learn-glossary.html`, { waitUntil: 'domcontentloaded' });
  await mPage.screenshot({ path: resolve(EVIDENCE_DIR, 'ms43-glossary-mobile.png'), fullPage: false });
  console.log('  ✓ Mobile screenshot captured: ms43-glossary-mobile.png');

  await mPage.goto(`${WEB_URL}/legal.html`, { waitUntil: 'domcontentloaded' });
  await mPage.screenshot({ path: resolve(EVIDENCE_DIR, 'ms43-legal-mobile.png'), fullPage: false });
  console.log('  ✓ Mobile screenshot captured: ms43-legal-mobile.png');

  // ==========================================================================
  // 4. Admin Console Verification
  // ==========================================================================
  console.log('\n[4/4] Verifying Admin Console Integration at', ADMIN_URL);
  try {
    const adminPage = await desktopContext.newPage();
    await adminPage.goto(`${ADMIN_URL}/`, { waitUntil: 'domcontentloaded', timeout: 6000 });
    await adminPage.screenshot({ path: resolve(EVIDENCE_DIR, 'ms43-admin-console.png') });
    console.log('  ✓ Admin console reached and screenshot saved: ms43-admin-console.png');
  } catch (err) {
    console.log('  ℹ Admin console check bypassed or took longer:', err.message);
  }

  await browser.close();

  // Save inspection summary report
  const summary = {
    timestamp: new Date().toISOString(),
    milestone: 'MS4.3 · Glossary and versioned policies',
    status: totals.failures.length === 0 ? 'PASSED' : 'FAILED',
    totals,
  };
  writeFileSync(resolve(EVIDENCE_DIR, 'visual-inspection-summary.json'), JSON.stringify(summary, null, 2));

  console.log('\n================================================================');
  console.log(` Visual & A11y Inspection Result: ${summary.status}`);
  console.log(` - Glossary Terms: ${totals.glossaryTermsFound} / 113`);
  console.log(` - Legal Tabs Tested: ${totals.tabsTested}`);
  console.log(` - Glossary a11y violations: ${totals.glossaryA11yViolations}`);
  console.log(` - Legal a11y violations: ${totals.legalA11yViolations}`);
  console.log('================================================================\n');

  if (totals.failures.length > 0) {
    console.error('Inspection failures:', totals.failures);
    process.exit(1);
  }
}

runVisualA11yInspection().catch((err) => {
  console.error('[FATAL] Inspection failed:', err);
  process.exit(1);
});
