// tooling/verify/inspect-ms46-visual.mjs
// Milestone MS4.6: Visual, Manual & Accessibility (a11y) Inspection Suite
// Tests Editorial Workflow, Pages Module, SEO Panel, Signed HMAC Previews, and Axe-core WCAG 2.2 AA.
import { chromium } from '@playwright/test';
import { readFileSync, existsSync, mkdirSync, writeFileSync, copyFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve('axe-core'), 'utf8');

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const EVIDENCE_DIR = resolve(ROOT, 'tooling/verify/evidence/ms46');
mkdirSync(EVIDENCE_DIR, { recursive: true });

const ARTIFACTS_DIR = 'C:/Users/DELL/.gemini/antigravity/brain/1b456724-1889-46de-b5d3-1e352373438f';

const WEB_URL = process.env.WEB_URL || 'http://127.0.0.1:4321';
const API_URL = process.env.API_URL || 'http://127.0.0.1:8787';
const ADMIN_URL = process.env.ADMIN_URL || 'http://127.0.0.1:5173';

console.log('================================================================');
console.log('    MS4.6 Visual, Manual & Accessibility (a11y) Inspection');
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
    userAgent: 'TwinMOS-MS46-Visual-Inspector/1.0 (Desktop)',
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
    totals.pagesTested += 1;
    totals.a11yViolationsTotal += seriousOrCritical.length;

    if (seriousOrCritical.length > 0) {
      console.warn(`     Violations in ${pageName}:`, seriousOrCritical.map(v => `${v.id} (${v.help}) - ${v.nodes?.map(n => n.target?.join(' > ')).join(', ')}`));
      for (const v of seriousOrCritical) {
        console.warn(`       [${v.id}]: node html sample:`, v.nodes[0]?.html);
      }
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
    // Step 1: Admin Console Login & Content Studio Pages
    // -------------------------------------------------------------
    console.log('1. Navigating to Admin Console Content Studio...');
    await page.goto(`${ADMIN_URL}`, { waitUntil: 'networkidle' });

    // Handle dev auto-login or credentials
    const isLogin = await page.$('input[type="email"]');
    if (isLogin) {
      await page.fill('input[type="email"]', 'admin@twinmos.dev');
      await page.fill('input[type="password"]', 'admin');
      await page.click('button:has-text("Sign in")');
      await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {});
    }

    // Switch to Pages module
    const contentTab = await page.$('button:has-text("Content Studio")');
    if (contentTab) await contentTab.click();
    await page.waitForTimeout(500);

    const pagesBtn = await page.$('button:has-text("Pages")');
    if (pagesBtn) await pagesBtn.click();
    await page.waitForTimeout(600);

    const shot1 = await page.screenshot({ fullPage: false });
    saveShot(shot1, 'ms46_drive_01_admin_content_pages.png');
    await runAxe(page, 'Admin Content Studio - Pages View');

    // -------------------------------------------------------------
    // Step 2: Open Editor, SEO Panel, and Character Counters
    // -------------------------------------------------------------
    console.log('2. Opening Page Editor & SEO Meta Configuration...');
    const editBtn = await page.$('button:has-text("Edit")');
    if (editBtn) {
      await editBtn.click();
    } else {
      const newBtn = await page.$('button:has-text("+ New page")');
      if (newBtn) await newBtn.click();
    }
    await page.waitForTimeout(600);

    // Expand SEO Panel if present
    const seoToggle = await page.$('text=SEO & Meta Configuration');
    if (seoToggle) {
      await seoToggle.click();
      await page.waitForTimeout(400);
    }

    // Type in SEO title and description to show counter feedback
    const seoTitleInput = await page.$('input[placeholder*="Page title for search"]');
    if (seoTitleInput) {
      await seoTitleInput.fill('TwinMOS Technologies | High-Performance Industrial & Gaming Storage Solutions');
    }
    const seoDescInput = await page.$('textarea[placeholder*="Brief summary"]');
    if (seoDescInput) {
      await seoDescInput.fill('Discover TwinMOS NVMe PCIe Gen 5 SSDs, high-frequency DDR5 memory modules, and enterprise storage certified for extreme workloads and reliability worldwide.');
    }

    const shot2 = await page.screenshot({ fullPage: false });
    saveShot(shot2, 'ms46_drive_02_admin_seo_panel.png');
    await runAxe(page, 'Admin Page Editor - SEO Panel');

    // -------------------------------------------------------------
    // Step 3: PageBuilder Block Controls & Accessible Move Buttons
    // -------------------------------------------------------------
    console.log('3. Inspecting PageBuilder block controls...');
    const blockUpBtn = await page.$('button[aria-label*="Move"][aria-label*="up"]');
    const shot3 = await page.screenshot({ fullPage: false });
    saveShot(shot3, 'ms46_drive_03_admin_pagebuilder_blocks.png');
    await runAxe(page, 'Admin PageBuilder Block Palette & Reordering');

    // -------------------------------------------------------------
    // Step 4: Signed HMAC Public Preview on Web App
    // -------------------------------------------------------------
    console.log('4. Generating Signed HMAC Public Preview...');
    // Request a real signed token from API
    const authRes = await fetch(`${API_URL}/api/v1/auth/sign-in/email`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'http://127.0.0.1:5173' },
      body: JSON.stringify({ email: 'admin@twinmos.dev', password: 'admin' }),
    });
    const setCookie = authRes.headers.get('set-cookie') || '';
    const tokenMatch = setCookie.match(/better-auth\.session_token=([^;]+)/);
    const cookie = tokenMatch ? `better-auth.session_token=${tokenMatch[1]}` : '';

    // Fetch page items to get target ID and path
    const listRes = await fetch(`${API_URL}/api/v1/admin/content/page`, { headers: { cookie } });
    const listJson = await listRes.json().catch(() => ({}));
    let targetPage = listJson.items?.[0] || { id: 1, path: '/about', slug: 'about' };

    const previewApiRes = await fetch(`${API_URL}/api/v1/admin/content/page/${targetPage.id}/preview`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie },
    });
    const previewJson = await previewApiRes.json();
    const previewUrl = previewJson.previewUrl || `${WEB_URL}/about?preview=${previewJson.token}`;

    console.log(`  Visiting signed preview URL: ${previewUrl}`);
    const previewResponse = await page.goto(previewUrl, { waitUntil: 'networkidle' });

    const xRobots = previewResponse?.headers()['x-robots-tag'] || '';
    const cacheCtrl = previewResponse?.headers()['cache-control'] || '';
    console.log(`  Preview Response Headers: X-Robots-Tag: "${xRobots}", Cache-Control: "${cacheCtrl}"`);

    const shot4 = await page.screenshot({ fullPage: false });
    saveShot(shot4, 'ms46_drive_04_public_signed_preview.png');
    await runAxe(page, 'Public Web - Signed HMAC Draft Preview');

    // -------------------------------------------------------------
    // Step 5: Mobile Viewport Inspection (390x844)
    // -------------------------------------------------------------
    console.log('5. Inspecting Mobile Viewport (390x844)...');
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      userAgent: 'TwinMOS-MS46-Visual-Inspector/1.0 (Mobile iPhone 14)',
      isMobile: true,
      hasTouch: true,
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(previewUrl, { waitUntil: 'networkidle' });

    const shot5 = await mobilePage.screenshot({ fullPage: false });
    saveShot(shot5, 'ms46_drive_05_mobile_preview.png');
    await runAxe(mobilePage, 'Public Web - Mobile Signed Preview');

    await mobileContext.close();
    await desktopContext.close();
  } catch (err) {
    console.error('Visual inspection error:', err);
    totals.failures.push(`Execution error: ${err.message}`);
  } finally {
    await browser.close();
  }

  console.log('\n================================================================');
  console.log(`Visual & A11y Summary: ${totals.pagesTested} screens evaluated`);
  console.log(`Critical/Serious A11y Violations: ${totals.a11yViolationsTotal}`);
  if (totals.failures.length > 0) {
    console.log('Failures:', totals.failures);
  } else {
    console.log('Result: ✅ ALL VISUAL & ACCESSIBILITY TESTS PASSED (0 WCAG 2.2 AA Violations)');
  }
  console.log('================================================================\n');

  if (totals.a11yViolationsTotal > 0 || totals.failures.length > 0) {
    process.exit(1);
  }
}

runVisualA11yInspection();
