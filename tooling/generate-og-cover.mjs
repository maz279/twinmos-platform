import { chromium } from 'playwright';
import { copyFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const WEB_TARGET = resolve(ROOT, 'apps/web/public/assets/img/og-cover.png');
const PROTO_TARGET = resolve(ROOT, 'prototype/assets/img/og-cover.png');

async function main() {
  console.log('[OG Generator] Launching headless browser...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1200px;
      height: 630px;
      background: radial-gradient(circle at 85% 15%, rgba(0, 163, 224, 0.25) 0%, transparent 50%),
                  radial-gradient(circle at 15% 85%, rgba(0, 130, 179, 0.2) 0%, transparent 45%),
                  linear-gradient(135deg, #061524 0%, #0A2540 50%, #081D33 100%);
      color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 72px 84px;
      overflow: hidden;
      position: relative;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: rgba(0, 163, 224, 0.15);
      border: 1px solid rgba(0, 163, 224, 0.4);
      padding: 8px 18px;
      border-radius: 999px;
      color: #00F0FF;
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      align-self: flex-start;
    }
    .badge::before {
      content: "";
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #00F0FF;
      box-shadow: 0 0 10px #00F0FF;
    }
    .brand-title {
      font-size: 58px;
      font-weight: 800;
      letter-spacing: -0.02em;
      line-height: 1.12;
      background: linear-gradient(180deg, #FFFFFF 0%, #CBD5E1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-top: 24px;
      max-width: 900px;
    }
    .brand-subtitle {
      font-size: 24px;
      font-weight: 400;
      color: #94A3B8;
      line-height: 1.4;
      margin-top: 16px;
      max-width: 820px;
    }
    .footer-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid rgba(255, 255, 255, 0.12);
      padding-top: 28px;
    }
    .pill-group {
      display: flex;
      gap: 14px;
    }
    .pill {
      background: rgba(255, 255, 255, 0.07);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 8px;
      padding: 6px 16px;
      font-size: 15px;
      font-weight: 600;
      color: #E2E8F0;
    }
    .domain {
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 0.04em;
      color: #00A3E0;
    }
    .grid-pattern {
      position: absolute;
      right: 0;
      top: 0;
      width: 450px;
      height: 100%;
      background-image: radial-gradient(rgba(0, 163, 224, 0.15) 1px, transparent 1px);
      background-size: 24px 24px;
      mask-image: linear-gradient(to left, black 30%, transparent 90%);
      pointer-events: none;
    }
  </style>
</head>
<body>
  <div class="grid-pattern"></div>
  <div>
    <div class="badge">Official Brand Portal</div>
    <h1 class="brand-title">TwinMOS Technologies</h1>
    <p class="brand-subtitle">Legendary Memory Brand Since 1998 · High-Performance DDR5 & Gaming DRAM, PCIe Gen 5.0 NVMe SSDs & Portable Storage Trusted in 93+ Countries.</p>
  </div>

  <div class="footer-bar">
    <div class="pill-group">
      <span class="pill">DDR5 & DDR4 DRAM</span>
      <span class="pill">NVMe PCIe 5.0 / 4.0</span>
      <span class="pill">Portable SSDs</span>
      <span class="pill">Memory Cards</span>
    </div>
    <div class="domain">twinmos.com</div>
  </div>
</body>
</html>
`;

  await page.setContent(html);
  await page.screenshot({ path: WEB_TARGET, type: 'png' });
  console.log(`[OG Generator] Generated web asset at ${WEB_TARGET}`);

  copyFileSync(WEB_TARGET, PROTO_TARGET);
  console.log(`[OG Generator] Copied to prototype asset at ${PROTO_TARGET}`);

  await browser.close();
  console.log('[OG Generator] Done.');
}

main().catch((err) => {
  console.error('[OG Generator] Error:', err);
  process.exit(1);
});
