// G-PARITY Multi-Breakpoint Visual Baseline & Pixel-Diff Harness (T3.6.2 / GREF-H)
// Captures responsive visual baselines at 390px, 768px, and 1440px.
// Compares live renders against baselines, flagging changes exceeding 0.1% visual difference.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { chromium } from "playwright";
import { PNG } from "pngjs";

const BASE_URL = process.env.WEB_URL || "http://localhost:4321";
const BASELINE_DIR = resolve(process.cwd(), "deploy/baselines");
const DIFF_THRESHOLD_PERCENT = 0.1; // 0.1% visual difference threshold (T3.6.2)

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
];

const ROUTES = [
  { name: "home", path: "/" },
  { name: "shop", path: "/shop" },
  { name: "product", path: "/products/voltx-ddr5-udimm-16gb" },
  { name: "rma", path: "/rma" },
  { name: "learn", path: "/learn" },
  { name: "arabic", path: "/ar/" },
];

function compareImages(baselineBuffer, currentBuffer) {
  const img1 = PNG.sync.read(baselineBuffer);
  const img2 = PNG.sync.read(currentBuffer);

  if (img1.width !== img2.width || img1.height !== img2.height) {
    return {
      match: false,
      diffPercentage: 100,
      reason: `Dimension mismatch: ${img1.width}x${img1.height} vs ${img2.width}x${img2.height}`,
      diffPng: null,
    };
  }

  const { width, height } = img1;
  const totalPixels = width * height;
  let diffPixels = 0;

  const diff = new PNG({ width, height });

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;

      const r1 = img1.data[idx];
      const g1 = img1.data[idx + 1];
      const b1 = img1.data[idx + 2];
      const a1 = img1.data[idx + 3];

      const r2 = img2.data[idx];
      const g2 = img2.data[idx + 1];
      const b2 = img2.data[idx + 2];
      const a2 = img2.data[idx + 3];

      // Per-channel color delta tolerance (16 to avoid font subpixel rendering jitter)
      const isDiff =
        Math.abs(r1 - r2) > 16 ||
        Math.abs(g1 - g2) > 16 ||
        Math.abs(b1 - b2) > 16 ||
        Math.abs(a1 - a2) > 16;

      if (isDiff) {
        diffPixels++;
        // Highlight diff in bright red
        diff.data[idx] = 255;
        diff.data[idx + 1] = 0;
        diff.data[idx + 2] = 0;
        diff.data[idx + 3] = 255;
      } else {
        // Draw dimmed grayscale original
        const gray = Math.round(0.299 * r1 + 0.587 * g1 + 0.114 * b1);
        diff.data[idx] = Math.round(gray * 0.7);
        diff.data[idx + 1] = Math.round(gray * 0.7);
        diff.data[idx + 2] = Math.round(gray * 0.7);
        diff.data[idx + 3] = 255;
      }
    }
  }

  const diffPercentage = (diffPixels / totalPixels) * 100;
  return {
    match: diffPercentage <= DIFF_THRESHOLD_PERCENT,
    diffPercentage,
    diffPixels,
    totalPixels,
    diffPng:
      diffPercentage > DIFF_THRESHOLD_PERCENT ? PNG.sync.write(diff) : null,
  };
}

async function run() {
  console.log(
    "================================================================",
  );
  console.log("       G-PARITY: Multi-Breakpoint Visual Baseline & Pixel-Diff");
  console.log(
    "================================================================\n",
  );

  if (!existsSync(BASELINE_DIR)) {
    mkdirSync(BASELINE_DIR, { recursive: true });
  }

  const updateMode =
    process.argv.includes("--update") ||
    process.argv.includes("--update-baselines");
  console.log(`[*] Target Web URL: ${BASE_URL}`);
  console.log(`[*] Baseline Directory: ${BASELINE_DIR}`);
  console.log(
    `[*] Mode: ${updateMode ? "UPDATE BASELINES" : "VERIFY & PIXEL-DIFF"}`,
  );
  console.log(`[*] Max Visual Diff Threshold: ${DIFF_THRESHOLD_PERCENT}%\n`);

  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-lcd-text", "--disable-font-subpixel-positioning"],
  });

  let totalChecks = 0;
  let passedChecks = 0;
  let updatedBaselines = 0;
  const failures = [];

  try {
    for (const vp of VIEWPORTS) {
      console.log(
        `--- Viewport: ${vp.name.toUpperCase()} (${vp.width}px x ${vp.height}px) ---`,
      );

      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 1,
      });

      const page = await context.newPage();

      for (const route of ROUTES) {
        totalChecks++;
        const filename = `${route.name}-${vp.name}.png`;
        const baselinePath = join(BASELINE_DIR, filename);
        const url = `${BASE_URL}${route.path}`;

        process.stdout.write(
          `  [${vp.name}] ${route.name.padEnd(8)} (${route.path})... `,
        );

        try {
          await page.goto(url, { waitUntil: "networkidle", timeout: 15000 });
          // Ensure animations finish settling
          await page.waitForTimeout(300);

          const currentBuffer = await page.screenshot({
            fullPage: false,
            animations: "disabled",
          });

          if (updateMode || !existsSync(baselinePath)) {
            writeFileSync(baselinePath, currentBuffer);
            console.log(
              `SAVED BASELINE (${(currentBuffer.length / 1024).toFixed(1)} KB)`,
            );
            updatedBaselines++;
            passedChecks++;
          } else {
            const baselineBuffer = readFileSync(baselinePath);
            const result = compareImages(baselineBuffer, currentBuffer);

            if (result.match) {
              console.log(`PASS (diff: ${result.diffPercentage.toFixed(4)}%)`);
              passedChecks++;
            } else {
              console.log(
                `FAIL (diff: ${result.diffPercentage.toFixed(3)}% > ${DIFF_THRESHOLD_PERCENT}%)`,
              );
              if (result.diffPng) {
                const diffPath = join(BASELINE_DIR, `diff-${filename}`);
                writeFileSync(diffPath, result.diffPng);
              }
              failures.push({
                route: route.name,
                viewport: vp.name,
                diffPercentage: result.diffPercentage,
                reason: result.reason,
              });
            }
          }
        } catch (err) {
          console.log(`ERROR: ${err.message}`);
          failures.push({
            route: route.name,
            viewport: vp.name,
            reason: err.message,
          });
        }
      }

      await context.close();
      console.log("");
    }
  } finally {
    await browser.close();
  }

  console.log(
    "================================================================",
  );
  console.log(
    `Summary: ${passedChecks}/${totalChecks} passed. (${updatedBaselines} baselines updated/created)`,
  );
  if (failures.length > 0) {
    console.error(
      `\nFAILED: ${failures.length} visual parity check(s) exceeded threshold:`,
    );
    for (const f of failures) {
      console.error(
        `  - ${f.route} @ ${f.viewport}: ${f.diffPercentage ? `${f.diffPercentage.toFixed(3)}% diff` : f.reason}`,
      );
    }
    console.log(
      "================================================================\n",
    );
    process.exit(1);
  } else {
    console.log(
      "SUCCESS: All responsive visual baselines within 0.1% parity threshold (T3.6.2 / GREF-H)",
    );
    console.log(
      "================================================================\n",
    );
    process.exit(0);
  }
}

run().catch((err) => {
  console.error(`Fatal G-PARITY Error: ${err.message}`);
  process.exit(1);
});
