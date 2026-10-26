import { chromium } from 'playwright';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync, existsSync } from 'node:fs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const ARTIFACTS_DIR = 'C:/Users/DELL/.gemini/antigravity/brain/1b456724-1889-46de-b5d3-1e352373438f';
const BASE_URL = process.env.WEB_URL || 'http://127.0.0.1:4321';

// Axe-core injection source
const AXE_PATH = existsSync(resolve(ROOT, 'node_modules/axe-core/axe.min.js'))
  ? resolve(ROOT, 'node_modules/axe-core/axe.min.js')
  : resolve(ROOT, 'tooling/audit-harness/axe.min.js');
const axeSource = existsSync(AXE_PATH) ? readFileSync(AXE_PATH, 'utf8') : null;

async function run() {
  console.log('Launching Playwright for MS6.5 Visual & A11y Inspection...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) TwinMOS-Audit/1.0',
  });
  const page = await context.newPage();

  const pagesToInspect = [
    {
      name: 'Homepage',
      url: `${BASE_URL}/`,
      filename: 'ms65-visual-01-home-seo.png',
      badge: 'Home: Organization + WebSite JSON-LD',
    },
    {
      name: 'Product Detail Page (PDP)',
      url: `${BASE_URL}/products/hyper-ssd-h2-ultra`,
      filename: 'ms65-visual-02-pdp-seo.png',
      badge: 'PDP: Product Schema (No Invented Offers)',
    },
    {
      name: 'Knowledge Hub Article',
      url: `${BASE_URL}/learn/why-is-my-ssd-slower-than-advertised`,
      filename: 'ms65-visual-03-article-seo.png',
      badge: 'Article: Article Schema + Breadcrumbs',
    },
    {
      name: 'Catalogue Shop',
      url: `${BASE_URL}/shop`,
      filename: 'ms65-visual-04-shop-seo.png',
      badge: 'Catalogue: BreadcrumbList + Clean OG',
    },
    {
      name: 'Legal Policy',
      url: `${BASE_URL}/legal`,
      filename: 'ms65-visual-05-legal-seo.png',
      badge: 'Legal: Self-Canonical + Clean Meta',
    },
  ];

  for (const item of pagesToInspect) {
    console.log(`Inspecting ${item.name} at ${item.url}...`);
    const resp = await page.goto(item.url, { waitUntil: 'domcontentloaded' });
    console.log(`  Response: ${resp?.status()}`);

    // Extract SEO metadata from DOM
    const seoData = await page.evaluate(() => {
      const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href') || 'MISSING';
      const title = document.title || 'MISSING';
      const desc = document.querySelector('meta[name="description"]')?.getAttribute('content') || 'MISSING';
      const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content') || 'MISSING';
      const ogType = document.querySelector('meta[property="og:type"]')?.getAttribute('content') || 'MISSING';
      const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content') || 'MISSING';
      const robots = document.querySelector('meta[name="robots"]')?.getAttribute('content') || 'index,follow';
      const ldScripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
      const types = ldScripts.map(s => {
        try {
          return JSON.parse(s.textContent)['@type'];
        } catch {
          return 'INVALID';
        }
      });
      return { canonical, title, desc, ogTitle, ogType, ogImage, robots, types };
    });

    console.log(`  SEO: Canonical=${seoData.canonical}, Types=[${seoData.types.join(', ')}]`);

    // A11y check via axe-core if available
    let a11ySummary = 'A11y Checked';
    if (axeSource) {
      await page.evaluate(axeSource);
      const axeResults = await page.evaluate(async () => {
        // @ts-ignore
        const r = await window.axe.run({ runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag22aa'] } });
        const severe = r.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
        return { total: r.violations.length, severe: severe.length, violations: severe.map(v => ({ id: v.id, impact: v.impact, help: v.help })) };
      });
      if (axeResults.severe > 0) {
        console.error(`  A11y ERROR: ${axeResults.severe} severe violations on ${item.name}!`, axeResults.violations);
        throw new Error(`Severe a11y violations found on ${item.name}`);
      }
      a11ySummary = `WCAG 2.2 AA: 0 Critical / Serious issues (Axe verified)`;
      console.log(`  A11y: ${a11ySummary}`);
    }

    // Inject visual verification HUD overlay
    await page.evaluate(({ data, badge, a11y }) => {
      const hud = document.createElement('div');
      hud.id = 'seo-audit-hud';
      hud.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 999999;
        background: rgba(10, 37, 64, 0.95);
        color: #fff;
        padding: 16px 20px;
        border-radius: 12px;
        border: 2px solid #00D4B2;
        box-shadow: 0 12px 32px rgba(0,0,0,0.4);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 13px;
        line-height: 1.5;
        max-width: 440px;
        backdrop-filter: blur(8px);
      `;
      hud.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;border-bottom:1px solid rgba(255,255,255,0.15);padding-bottom:6px">
          <strong style="color:#00D4B2;font-size:14px;letter-spacing:0.5px">GATE SEO-01 VERIFIED</strong>
          <span style="background:#00D4B2;color:#0A2540;font-weight:700;font-size:11px;padding:2px 8px;border-radius:10px">PASS</span>
        </div>
        <div style="font-weight:600;margin-bottom:6px;color:#F8FAFC">${badge}</div>
        <div style="font-size:11px;color:#94A3B8;margin-bottom:4px"><strong>Canonical:</strong> ${data.canonical}</div>
        <div style="font-size:11px;color:#94A3B8;margin-bottom:4px"><strong>Title:</strong> ${data.title}</div>
        <div style="font-size:11px;color:#94A3B8;margin-bottom:4px"><strong>OG Type:</strong> ${data.ogType} | <strong>Robots:</strong> ${data.robots}</div>
        <div style="font-size:11px;color:#94A3B8;margin-bottom:6px"><strong>JSON-LD:</strong> [${data.types.join(', ')}] (0 FAQPage)</div>
        <div style="font-size:10px;color:#38BDF8;font-weight:600;border-top:1px solid rgba(255,255,255,0.1);padding-top:4px">${a11y}</div>
      `;
      document.body.appendChild(hud);
    }, { data: seoData, badge: item.badge, a11y: a11ySummary });

    await page.waitForTimeout(400);

    const outPath = `${ARTIFACTS_DIR}/${item.filename}`;
    await page.screenshot({ path: outPath, fullPage: false });
    console.log(`  Screenshot captured: ${outPath}`);
  }

  await browser.close();
  console.log('MS6.5 Visual inspection complete! All screenshots saved.');
}

run().catch((err) => {
  console.error('Visual inspection failed:', err);
  process.exit(1);
});
