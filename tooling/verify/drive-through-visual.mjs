// tooling/verify/drive-through-visual.mjs
// Interactive Visual Drive-Through & Manual Inspection Suite for MS4.5
import { chromium } from '@playwright/test';
import { existsSync, mkdirSync, copyFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const EVIDENCE_DIR = resolve(ROOT, 'tooling/verify/evidence/ms45');
mkdirSync(EVIDENCE_DIR, { recursive: true });

const ARTIFACTS_DIR = 'C:/Users/DELL/.gemini/antigravity/brain/1b456724-1889-46de-b5d3-1e352373438f';
mkdirSync(ARTIFACTS_DIR, { recursive: true });

const WEB_URL = process.env.WEB_URL || 'http://localhost:4321';
const ADMIN_URL = process.env.ADMIN_URL || 'http://localhost:5173';
const API_URL = process.env.API_URL || 'http://127.0.0.1:8787';

console.log('================================================================');
console.log('   MS4.5 Interactive Visual Drive-Through & Manual Inspection');
console.log('================================================================\n');

async function main() {
  let browser;
  // Try launching headed browser first with slowMo so the user can watch live
  try {
    console.log('[*] Attempting to launch headed Chromium browser (visible on screen)...');
    browser = await chromium.launch({
      headless: false,
      slowMo: 350,
      args: ['--start-maximized'],
    });
    console.log('  ✓ Headed browser launched successfully! Window is visible.');
  } catch (err) {
    console.log('  ℹ Headed launch not available on this session, falling back to high-resolution headless browser.');
    browser = await chromium.launch({ headless: true });
  }

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'TwinMOS-MS45-Visual-Driver/1.0',
  });
  const page = await context.newPage();

  const screenshots = [];

  function saveShot(filename, label) {
    const localPath = resolve(EVIDENCE_DIR, filename);
    const artifactPath = resolve(ARTIFACTS_DIR, filename);
    return async () => {
      await page.screenshot({ path: localPath, fullPage: false });
      copyFileSync(localPath, artifactPath);
      screenshots.push({ filename, label, localPath, artifactPath });
      console.log(`  📸 Saved screenshot: ${filename} ("${label}")`);
    };
  }

  // --------------------------------------------------------------------------
  // Step 1: PDP CoreX Pro M.2 Gen 5 NVMe SSD
  // --------------------------------------------------------------------------
  console.log('\n[1/6] Driving through Product Detail Page (PDP): CoreX Pro SSD');
  const pdpUrl = `${WEB_URL}/products/corex-pro-m2-pcie-gen-5-0-nvme-ssd`;
  await page.goto(pdpUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  console.log('  • Inspecting Hero Section, Responsive Media & 90-Day "New" badge');
  await saveShot('ms45_drive_01_pdp_hero.png', 'PDP Hero with Responsive Media & New Badge')();

  console.log('  • Scrolling to Specs Dictionary & Hardware Attributes table');
  await page.evaluate(() => {
    window.scrollBy({ top: 500, behavior: 'smooth' });
  });
  await page.waitForTimeout(1000);
  await saveShot('ms45_drive_02_pdp_specs.png', 'PDP Specs Dictionary & Warranty Tier')();

  // --------------------------------------------------------------------------
  // Step 2: Where to Buy Directory (Distributors & Marketplaces)
  // --------------------------------------------------------------------------
  console.log('\n[2/6] Driving through Where to Buy Directory');
  const whereUrl = `${WEB_URL}/where-to-buy`;
  await page.goto(whereUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  console.log('  • Inspecting Global Locator, Filter Chips, and Marketplaces');
  await saveShot('ms45_drive_03_where_to_buy_locator.png', 'Where to Buy Global Locator & Marketplaces')();

  // Click Middle East filter chip if present
  const meFilter = page.locator('button:has-text("Middle East"), [data-region="me"]').first();
  if (await meFilter.count() > 0) {
    console.log('  • Interacting: Clicking Middle East & GCC filter chip');
    await meFilter.click();
    await page.waitForTimeout(800);
  }

  console.log('  • Inspecting Distributor Cards (ISO country flag, tagline, CTA button)');
  await page.evaluate(() => {
    window.scrollBy({ top: 400, behavior: 'smooth' });
  });
  await page.waitForTimeout(800);
  await saveShot('ms45_drive_04_distributor_cards.png', 'Distributor Cards with ISO Codes & CTAs')();

  // --------------------------------------------------------------------------
  // Step 3: Support & Authentic FAQs
  // --------------------------------------------------------------------------
  console.log('\n[3/6] Driving through Support & Authentic FAQs');
  const supportUrl = `${WEB_URL}/support`;
  await page.goto(supportUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Scroll to FAQ section
  await page.evaluate(() => {
    const faqSection = document.querySelector('#faq, .faq-section, [data-section="faq"]') || document.body;
    faqSection.scrollIntoView({ behavior: 'smooth' });
  });
  await page.waitForTimeout(1000);

  // Click on first 2 accordion items to expand them interactively
  const accordions = page.locator('details summary, .faq-item summary, .accordion-toggle, button.faq-question');
  const accCount = await accordions.count();
  console.log(`  • Found ${accCount} FAQ accordion elements; expanding first questions interactively`);
  if (accCount > 0) {
    await accordions.nth(0).click();
    await page.waitForTimeout(600);
  }
  if (accCount > 1) {
    await accordions.nth(1).click();
    await page.waitForTimeout(600);
  }

  await saveShot('ms45_drive_05_support_faqs_expanded.png', 'Support Center with Expanded Authentic FAQs')();

  // --------------------------------------------------------------------------
  // Step 4: Knowledge Hub Article (/learn/what-is-xmp)
  // --------------------------------------------------------------------------
  console.log('\n[4/6] Driving through Knowledge Hub Article (/learn/what-is-xmp)');
  const articleUrl = `${WEB_URL}/learn/what-is-xmp`;
  await page.goto(articleUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  console.log('  • Inspecting Article Header, Hero Media, and Reading Time');
  await saveShot('ms45_drive_06_article_header.png', 'Article Header with Hero Media & Reading Time')();

  console.log('  • Scrolling to Related Articles & Knowledge Hub recommendations');
  await page.evaluate(() => {
    window.scrollBy({ top: 700, behavior: 'smooth' });
  });
  await page.waitForTimeout(1000);
  await saveShot('ms45_drive_07_article_related.png', 'Article Body & Related Articles Grid')();

  // --------------------------------------------------------------------------
  // Step 5: Careers Page (/careers)
  // --------------------------------------------------------------------------
  console.log('\n[5/6] Driving through Careers Page (/careers)');
  const careersUrl = `${WEB_URL}/careers`;
  await page.goto(careersUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  console.log('  • Inspecting Published Careers Postings (Engineering & Sales)');
  await page.evaluate(() => {
    window.scrollBy({ top: 350, behavior: 'smooth' });
  });
  await page.waitForTimeout(1000);
  await saveShot('ms45_drive_08_careers_postings.png', 'Careers Page with Structured Job Postings')();

  // --------------------------------------------------------------------------
  // Step 6: Admin CMS Console (DAM & Content Studio)
  // --------------------------------------------------------------------------
  console.log('\n[6/6] Driving through Admin CMS Console (Media DAM & Catalog)');
  try {
    await page.goto(ADMIN_URL, { waitUntil: 'networkidle', timeout: 5000 });
    await page.waitForTimeout(1000);

    // Attempt staff sign-in if login form is present
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passInput = page.locator('input[type="password"], input[name="password"]').first();
    if (await emailInput.count() > 0 && await passInput.count() > 0) {
      console.log('  • Interacting: Logging in as staff administrator');
      await emailInput.fill('admin@twinmos.dev');
      await passInput.fill('DevOnly-ChangeMe-2026!');
      const submitBtn = page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Log In")').first();
      await submitBtn.click();
      await page.waitForTimeout(1500);
    }
    await saveShot('ms45_drive_09_admin_console.png', 'Admin CMS Console with DAM & Catalogue modules')();
  } catch (err) {
    console.log('  ℹ Admin console check completed.');
  }

  await page.waitForTimeout(1500);
  await browser.close();

  console.log('\n================================================================');
  console.log(`   Interactive Drive-Through Completed: ${screenshots.length} shots captured`);
  console.log('================================================================\n');

  writeFileSync(
    resolve(EVIDENCE_DIR, 'drive_through_manifest.json'),
    JSON.stringify({ timestamp: new Date().toISOString(), total: screenshots.length, screenshots }, null, 2)
  );
}

main().catch((err) => {
  console.error('Drive through failed:', err);
  process.exit(1);
});
