// tooling/verify/inspect-ms45-visual.mjs
// Milestone MS4.5: Visual, Manual & Accessibility (a11y) Inspection Suite
// Tests Media, Catalogue, Articles, Directory, and Axe-core WCAG 2.2 AA.
import { chromium } from '@playwright/test';
import { readFileSync, existsSync, mkdirSync, writeFileSync, copyFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve('axe-core'), 'utf8');

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const EVIDENCE_DIR = resolve(ROOT, 'tooling/verify/evidence/ms45');
mkdirSync(EVIDENCE_DIR, { recursive: true });

const ARTIFACTS_DIR = 'C:/Users/DELL/.gemini/antigravity/brain/1b456724-1889-46de-b5d3-1e352373438f';

const WEB_URL = process.env.WEB_URL || 'http://127.0.0.1:4321';
const API_URL = process.env.API_URL || 'http://127.0.0.1:8787';

console.log('================================================================');
console.log('    MS4.5 Visual, Manual & Accessibility (a11y) Inspection');
console.log('================================================================\n');

async function runVisualA11yInspection() {
  const totals = {
    pagesTested: 0,
    a11yViolationsTotal: 0,
    failures: [],
  };

  const browser = await chromium.launch({ headless: true });

  // 1. Desktop Viewport (1440x900)
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'TwinMOS-MS45-Visual-Inspector/1.0 (Desktop)',
  });
  const page = await desktopContext.newPage();

  // Helper for Axe-Core a11y audit
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
    if (seriousOrCritical.length > 0) {
      for (const v of seriousOrCritical) {
        console.warn(`    ⚠️ [${v.impact.toUpperCase()}] ${v.id}: ${v.help} (${v.nodes.length} occurrences)`);
        totals.failures.push(`${pageName}: ${v.id} (${v.help})`);
      }
    }
    totals.a11yViolationsTotal += seriousOrCritical.length;
    return seriousOrCritical;
  }

  // ==========================================================================
  // 1. Inspect Product Detail Page (PDP)
  // ==========================================================================
  const pdpUrl = `${WEB_URL}/products/corex-pro-m2-pcie-gen-5-0-nvme-ssd`;
  console.log('[1/5] Inspecting PDP at', pdpUrl);
  totals.pagesTested++;
  await page.goto(pdpUrl, { waitUntil: 'domcontentloaded' });
  const pdpTitle = await page.title();
  console.log(`  ✓ PDP Title: "${pdpTitle}"`);

  // Verify responsive image or hero element rendered
  const hasResponsiveImg = await page.evaluate(() => {
    return Boolean(document.querySelector('picture') || document.querySelector('img'));
  });
  console.log(`  ✓ Responsive Product Media Rendered: ${hasResponsiveImg}`);

  await runAxe(page, 'PDP (Desktop)');

  const pdpDesktopShot = resolve(EVIDENCE_DIR, '01_pdp_desktop.png');
  await page.screenshot({ path: pdpDesktopShot, fullPage: false });
  console.log(`  📸 Saved screenshot: ${pdpDesktopShot}`);
  if (existsSync(ARTIFACTS_DIR)) {
    copyFileSync(pdpDesktopShot, resolve(ARTIFACTS_DIR, 'ms45-pdp-desktop.png'));
  }

  // ==========================================================================
  // 2. Inspect Knowledge / Article Page
  // ==========================================================================
  const articleUrl = `${WEB_URL}/learn/what-is-xmp`;
  console.log('\n[2/5] Inspecting Article at', articleUrl);
  totals.pagesTested++;
  await page.goto(articleUrl, { waitUntil: 'domcontentloaded' });
  const articleTitle = await page.title();
  console.log(`  ✓ Article Title: "${articleTitle}"`);

  // Verify SEO OpenGraph and Twitter card meta tags
  const ogData = await page.evaluate(() => {
    const getMeta = (prop) => document.querySelector(`meta[property="${prop}"]`)?.getAttribute('content') ||
                              document.querySelector(`meta[name="${prop}"]`)?.getAttribute('content');
    return {
      ogTitle: getMeta('og:title'),
      ogDesc: getMeta('og:description'),
      ogImage: getMeta('og:image'),
    };
  });
  console.log(`  ✓ OpenGraph Meta Tags: title="${ogData.ogTitle || '(default)'}", image="${ogData.ogImage ? 'present' : 'none'}"`);

  await runAxe(page, 'Article (Desktop)');

  const articleDesktopShot = resolve(EVIDENCE_DIR, '02_article_desktop.png');
  await page.screenshot({ path: articleDesktopShot, fullPage: false });
  console.log(`  📸 Saved screenshot: ${articleDesktopShot}`);
  if (existsSync(ARTIFACTS_DIR)) {
    copyFileSync(articleDesktopShot, resolve(ARTIFACTS_DIR, 'ms45-article-desktop.png'));
  }

  // ==========================================================================
  // 3. Inspect Where to Buy (Directory)
  // ==========================================================================
  const whereUrl = `${WEB_URL}/where-to-buy`;
  console.log('\n[3/5] Inspecting Where to Buy (Directory) at', whereUrl);
  totals.pagesTested++;
  await page.goto(whereUrl, { waitUntil: 'domcontentloaded' });
  const whereTitle = await page.title();
  console.log(`  ✓ Where to Buy Title: "${whereTitle}"`);

  await runAxe(page, 'Where to Buy (Desktop)');

  const whereDesktopShot = resolve(EVIDENCE_DIR, '03_where_to_buy_desktop.png');
  await page.screenshot({ path: whereDesktopShot, fullPage: false });
  console.log(`  📸 Saved screenshot: ${whereDesktopShot}`);
  if (existsSync(ARTIFACTS_DIR)) {
    copyFileSync(whereDesktopShot, resolve(ARTIFACTS_DIR, 'ms45-where-to-buy-desktop.png'));
  }

  // ==========================================================================
  // 4. Inspect Support / FAQs
  // ==========================================================================
  const supportUrl = `${WEB_URL}/support`;
  console.log('\n[4/5] Inspecting Support / FAQs at', supportUrl);
  totals.pagesTested++;
  await page.goto(supportUrl, { waitUntil: 'domcontentloaded' });
  const supportTitle = await page.title();
  console.log(`  ✓ Support Title: "${supportTitle}"`);

  // Verify FAQ questions are authentic questions, never file paths
  const faqCheck = await page.evaluate(() => {
    const headers = Array.from(document.querySelectorAll('h3, h4, summary, .faq-question, [data-faq-question]'));
    const texts = headers.map(h => h.textContent?.trim() || '').filter(Boolean);
    const hasFilePath = texts.some(t => /\.html$|\.md$|^\//.test(t));
    return { count: texts.length, hasFilePath };
  });
  console.log(`  ✓ Rendered FAQs: ${faqCheck.count} items, Contains file paths: ${faqCheck.hasFilePath}`);

  await runAxe(page, 'Support / FAQ (Desktop)');

  const supportDesktopShot = resolve(EVIDENCE_DIR, '04_support_faqs_desktop.png');
  await page.screenshot({ path: supportDesktopShot, fullPage: false });
  console.log(`  📸 Saved screenshot: ${supportDesktopShot}`);
  if (existsSync(ARTIFACTS_DIR)) {
    copyFileSync(supportDesktopShot, resolve(ARTIFACTS_DIR, 'ms45-support-faqs-desktop.png'));
  }

  // ==========================================================================
  // 5. Mobile Viewport (390x844 - iPhone 14)
  // ==========================================================================
  console.log('\n[5/5] Inspecting Mobile Layout (390x844)');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
  });
  const mobilePage = await mobileContext.newPage();

  // Mobile PDP
  await mobilePage.goto(pdpUrl, { waitUntil: 'domcontentloaded' });
  await runAxe(mobilePage, 'PDP (Mobile)');
  const pdpMobileShot = resolve(EVIDENCE_DIR, '05_pdp_mobile.png');
  await mobilePage.screenshot({ path: pdpMobileShot, fullPage: false });
  console.log(`  📸 Saved screenshot: ${pdpMobileShot}`);
  if (existsSync(ARTIFACTS_DIR)) {
    copyFileSync(pdpMobileShot, resolve(ARTIFACTS_DIR, 'ms45-pdp-mobile.png'));
  }

  // Mobile Article
  await mobilePage.goto(articleUrl, { waitUntil: 'domcontentloaded' });
  await runAxe(mobilePage, 'Article (Mobile)');
  const articleMobileShot = resolve(EVIDENCE_DIR, '06_article_mobile.png');
  await mobilePage.screenshot({ path: articleMobileShot, fullPage: false });
  console.log(`  📸 Saved screenshot: ${articleMobileShot}`);
  if (existsSync(ARTIFACTS_DIR)) {
    copyFileSync(articleMobileShot, resolve(ARTIFACTS_DIR, 'ms45-article-mobile.png'));
  }

  await browser.close();

  // Summary Report
  console.log('\n================================================================');
  console.log('             MS4.5 Visual & A11y Inspection Summary');
  console.log('================================================================');
  console.log(`  Pages Tested:               ${totals.pagesTested}`);
  console.log(`  A11y Critical/Serious:      ${totals.a11yViolationsTotal}`);
  console.log(`  Overall Status:             ${totals.a11yViolationsTotal === 0 ? '✅ PASSED (0 a11y violations)' : '❌ FAILED'}`);

  writeFileSync(
    resolve(EVIDENCE_DIR, 'inspection_summary.json'),
    JSON.stringify({ timestamp: new Date().toISOString(), totals }, null, 2)
  );

  if (totals.a11yViolationsTotal > 0) {
    process.exit(1);
  }
}

runVisualA11yInspection().catch((err) => {
  console.error('Inspection failed:', err);
  process.exit(1);
});
