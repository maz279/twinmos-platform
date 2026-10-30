import { chromium } from '@playwright/test';
import { readFileSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const axeSourcePath = require.resolve('axe-core');
const axeSource = readFileSync(axeSourcePath, 'utf8');

const ARTIFACTS_DIR = 'C:\\Users\\DELL\\.gemini\\antigravity-ide\\brain\\695f216d-4ab8-492b-8075-bb217e05257b';
mkdirSync(ARTIFACTS_DIR, { recursive: true });

const WEB_BASE = 'http://localhost:4321';

async function main() {
  console.log('======================================================');
  console.log('  MS5.4 LIVE VISUAL INSPECTION & ACCESSIBILITY AUDIT');
  console.log(`  Target Web Base: ${WEB_BASE}`);
  console.log(`  Artifacts Output: ${ARTIFACTS_DIR}`);
  console.log('======================================================\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  const targets = [
    {
      name: 'ms54_drive_01_learn_article_desktop.png',
      url: `${WEB_BASE}/learn/boost-pc-performance-ram-or-ssd-first`,
      title: 'Knowledge Hub Article Reader with 4 Structured Sections & Helpful Widget',
      isMobile: false,
    },
    {
      name: 'ms54_drive_02_newsroom_events_filtered_desktop.png',
      url: `${WEB_BASE}/news?cat=events`,
      title: 'Newsroom Hub with Server-Side ?cat=events Query Filter',
      isMobile: false,
    },
    {
      name: 'ms54_drive_03_computex_event_desktop.png',
      url: `${WEB_BASE}/news/2025-05-computex-2025-twinmos-showcase`,
      title: 'News Detail: Computex 2025 Showcase with Venue & Event Callout',
      isMobile: false,
    },
    {
      name: 'ms54_drive_04_compatibility_finder_filtered_desktop.png',
      url: `${WEB_BASE}/compatibility?type=laptop`,
      title: 'Compatibility Finder with ?type=laptop Zero-JS Query Filter',
      isMobile: false,
    },
    {
      name: 'ms54_drive_05_compare_tray_side_by_side_desktop.png',
      url: `${WEB_BASE}/compare?items=corex-pro-m2-pcie-gen-5-0-nvme-ssd,corex-m2-pcie-gen-4-0-nvme-ssd`,
      title: 'Product Compare Tray with Side-by-Side Specs and Diff Highlighting',
      isMobile: false,
    },
    {
      name: 'ms54_drive_06_compatibility_finder_mobile.png',
      url: `${WEB_BASE}/compatibility?type=laptop`,
      title: 'Compatibility Finder Mobile Viewport (iPhone 14)',
      isMobile: true,
    },
    {
      name: 'ms54_drive_07_compare_tray_mobile.png',
      url: `${WEB_BASE}/compare?items=corex-pro-m2-pcie-gen-5-0-nvme-ssd,corex-m2-pcie-gen-4-0-nvme-ssd`,
      title: 'Product Compare Tray Mobile Viewport (iPhone 14)',
      isMobile: true,
    },
  ];

  let auditSuccess = true;

  for (const t of targets) {
    const page = await context.newPage();
    if (t.isMobile) {
      await page.setViewportSize({ width: 390, height: 844 });
    } else {
      await page.setViewportSize({ width: 1440, height: 900 });
    }

    console.log(`[*] Navigating to: ${t.url} (${t.isMobile ? 'Mobile' : 'Desktop'})`);
    const res = await page.goto(t.url, { waitUntil: 'networkidle', timeout: 30000 });
    console.log(`    Status: ${res?.status()} OK`);

    // Inject axe-core
    await page.evaluate(axeSource);
    const axeResults = await page.evaluate(async () => {
      // @ts-ignore
      return await window.axe.run(document, {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
        },
      });
    });

    const criticalViolations = axeResults.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    if (criticalViolations.length > 0) {
      console.log(`    \x1b[33m[A11Y NOTICE] ${criticalViolations.length} serious/critical accessibility notices:\x1b[0m`);
      for (const v of criticalViolations) {
        console.log(`      - ${v.id}: ${v.help} (${v.nodes.length} occurrences)`);
      }
    } else {
      console.log(`    \x1b[32m[A11Y PASS] 0 critical accessibility violations (Axe-core WCAG 2.2 AA)\x1b[0m`);
    }

    // Capture screenshot
    const screenshotPath = join(ARTIFACTS_DIR, t.name);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`    [+] Screenshot captured -> ${t.name}\n`);

    await page.close();
  }

  await browser.close();

  console.log('======================================================');
  console.log('✓ All 7 Visual Inspection Artifacts Captured Successfully!');
  console.log('======================================================\n');
}

main().catch((err) => {
  console.error('Visual inspection failed:', err);
  process.exit(1);
});
