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
  { name: "product", path: "/products/voltx-ddr5-u-dimm-for-desktop" },
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

async function gotoWithRetry(page, url) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      // `domcontentloaded` rather than `load`: third-party analytics can hold
      // the load event for tens of seconds. Determinism comes from the font/
      // image decode waits and the explicit animation settle below.
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.waitForTimeout(400);
      // A slow Delivery API can yield a shell with an empty <main>; never
      // record that as a baseline.
      const contentReady = await page.evaluate(() => {
        const main = document.querySelector("main");
        return !!main && (main.innerText || "").trim().length > 120;
      });
      if (contentReady) return;
      lastError = new Error("empty main content");
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
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
      // The footer newsletter mounts Cloudflare Turnstile. Its challenge keeps
      // a connection open, so `networkidle` never fires and every route times
      // out. The widget is off-screen and irrelevant to layout parity.
      await context.route("https://challenges.cloudflare.com/**", (route) =>
        route.abort(),
      );

      for (const route of ROUTES) {
        totalChecks++;
        const filename = `${route.name}-${vp.name}.png`;
        const baselinePath = join(BASELINE_DIR, filename);
        const url = `${BASE_URL}${route.path}`;

        process.stdout.write(
          `  [${vp.name}] ${route.name.padEnd(8)} (${route.path})... `,
        );

        try {
          // `networkidle` never fires: service workers, analytics and the
          // Turnstile challenge keep connections open. Navigation settles at
          // DOM-ready; the font/image waits and animation freeze make it stable.
          await gotoWithRetry(page, url);
          // Freeze the hero's 7s Ken-Burns zoom and any ambient animation so
          // two captures of the same build cannot differ by sub-pixel motion.
          await page.addStyleTag({
            content:
              "*,*::before,*::after{animation:none!important;transition:none!important}.sl-bg img{transform:scale(1.045)!important}#cookieBar,.cookie-bar{display:none!important}",
          });
          // Counters animate for 1.2s after intersection; pin them to their
          // final values so capture timing cannot change the digits.
          await page.evaluate(() => {
            document.querySelectorAll("[data-counter]").forEach((el) => {
              const target = parseInt(el.getAttribute("data-counter"), 10);
              if (Number.isFinite(target)) {
                el.textContent =
                  target.toLocaleString() + (target === 93 ? "+" : "");
              }
            });
          });
          // Wait past lazy script init, the counter intersection tween and the
          // hero's 7s zoom so the freeze/pin below lands on a settled page.
          await page.waitForTimeout(4500);
          // Pin again after the tween and wait for fonts + image decode, so
          // two captures cannot differ by a frame of animation or a late bitmap.
          await page.evaluate(async () => {
            await Promise.race([
              document.fonts.ready.catch(() => {}),
              new Promise((resolve) => setTimeout(resolve, 2000)),
            ]);
            await Promise.all(
              [...document.images].map((img) =>
                Promise.race([
                  img.decode().catch(() => {}),
                  new Promise((resolve) => setTimeout(resolve, 1500)),
                ]),
              ),
            );
            document.querySelectorAll("[data-counter]").forEach((el) => {
              const target = parseInt(el.getAttribute("data-counter"), 10);
              if (Number.isFinite(target)) {
                el.textContent =
                  target.toLocaleString() + (target === 93 ? "+" : "");
              }
              el.style.transform = "none";
              el.style.opacity = "1";
            });
            // Freeze carousels on slide 1: autoplay can otherwise advance
            // between the baseline and verification captures.
            document.querySelectorAll("[data-slider]").forEach((root) => {
              const dots = root.querySelectorAll("[data-sl-dot]");
              if (dots[0]) dots[0].click();
              const pause = root.querySelector(
                "[data-sl-pause], .slider-pause",
              );
              if (pause && pause.getAttribute("aria-pressed") !== "true")
                pause.click();
            });
          });
          // A reused tab keeps its scroll offset across navigations, and
          // `scroll-behavior:smooth` can animate the reset past the capture.
          await page.evaluate(() => {
            document.documentElement.style.scrollBehavior = "auto";
            document.body.style.scrollBehavior = "auto";
            window.scrollTo(0, 0);
          });
          await page.waitForTimeout(250);

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
