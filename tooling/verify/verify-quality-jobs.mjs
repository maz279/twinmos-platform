// Verification of Quality Jobs, Thresholds & Dependabot (T3.7.4 / QJ-01)
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = process.cwd();

console.log("================================================================");
console.log("       QJ-01: Quality Jobs, Thresholds & Dependabot Audit");
console.log(
  "================================================================\n",
);

let failures = 0;

// 1. ZAP Baseline Enforced Without continue-on-error (T3.7.4)
console.log(
  "[*] 1. Auditing OWASP ZAP Baseline Security in .github/workflows/quality.yml...",
);
const qualityPath = resolve(ROOT, ".github/workflows/quality.yml");
if (!existsSync(qualityPath)) {
  console.error("[-] FAIL: Missing .github/workflows/quality.yml");
  failures++;
} else {
  const content = readFileSync(qualityPath, "utf8");
  if (content.includes("continue-on-error: true")) {
    console.error(
      "[-] FAIL: quality.yml still contains continue-on-error: true for ZAP scan",
    );
    failures++;
  } else if (!content.includes("continue-on-error: false")) {
    console.error(
      "[-] FAIL: quality.yml missing explicit continue-on-error: false for ZAP scan",
    );
    failures++;
  } else {
    console.log(
      "[+] PASS: OWASP ZAP baseline scan configured with enforced failure threshold.",
    );
  }

  // 2. Schedule & Release Branch Triggers (T3.7.4) — quote-style agnostic
  // (prettier normalizes YAML strings to double quotes).
  console.log(
    "[*] 2. Auditing Quality Job Triggers (Nightly & Release Branches)...",
  );
  if (
    !content.includes("cron:") ||
    !/branches:\s*\[main,\s*['"]release\/\*\*['"]\]/.test(content)
  ) {
    console.error(
      "[-] FAIL: quality.yml missing nightly schedule or release branch trigger",
    );
    failures++;
  } else {
    console.log(
      "[+] PASS: Quality jobs trigger nightly and on release branches.",
    );
  }

  // 3. Axe-core on all sitemap routes (T3.7.4)
  console.log("[*] 3. Auditing WCAG 2.2 AA Axe-core Integration...");
  if (!content.includes("visual-a11y-audit.mjs")) {
    console.error(
      "[-] FAIL: quality.yml missing visual-a11y-audit.mjs execution",
    );
    failures++;
  } else {
    console.log("[+] PASS: Axe-core audit integrated for all sitemap routes.");
  }
}

// 4. Lighthouse CI Performance as Error (T3.7.4)
console.log(
  "[*] 4. Auditing Lighthouse CI Performance & Core Web Vitals (lighthouserc.json)...",
);
const lhciPath = resolve(ROOT, "lighthouserc.json");
if (!existsSync(lhciPath)) {
  console.error("[-] FAIL: Missing lighthouserc.json");
  failures++;
} else {
  const lhci = JSON.parse(readFileSync(lhciPath, "utf8"));
  const assertions = lhci.ci?.assert?.assertions ?? {};
  const perf = assertions["categories:performance"];
  const lcp = assertions["largest-contentful-paint"];
  const cls = assertions["cumulative-layout-shift"];
  const bytes = assertions["total-byte-weight"];

  if (!perf || perf[0] !== "error") {
    console.error(
      '[-] FAIL: categories:performance is not configured as an "error"',
    );
    failures++;
  } else if (!lcp || lcp[0] !== "error" || lcp[1]?.maxNumericValue > 2500) {
    console.error(
      "[-] FAIL: largest-contentful-paint threshold missing or exceeds 2500ms",
    );
    failures++;
  } else if (!cls || cls[0] !== "error" || cls[1]?.maxNumericValue > 0.1) {
    console.error(
      "[-] FAIL: cumulative-layout-shift threshold missing or exceeds 0.1",
    );
    failures++;
  } else if (!bytes || bytes[0] !== "error") {
    console.error(
      "[-] FAIL: total-byte-weight resource budget assertion missing",
    );
    failures++;
  } else {
    console.log(
      "[+] PASS: Lighthouse CI enforces LCP <= 2.5s, CLS <= 0.1, and performance as error.",
    );
  }
}

// 5. Dependabot Configuration (T3.7.4)
console.log(
  "[*] 5. Auditing Dependabot Security Configuration (.github/dependabot.yml)...",
);
const dependabotPath = resolve(ROOT, ".github/dependabot.yml");
if (!existsSync(dependabotPath)) {
  console.error("[-] FAIL: Missing .github/dependabot.yml");
  failures++;
} else {
  const depContent = readFileSync(dependabotPath, "utf8");
  if (
    !depContent.includes('package-ecosystem: "npm"') ||
    !depContent.includes('package-ecosystem: "docker"') ||
    !depContent.includes('package-ecosystem: "github-actions"')
  ) {
    console.error(
      "[-] FAIL: dependabot.yml missing npm, docker, or github-actions ecosystems",
    );
    failures++;
  } else {
    console.log(
      "[+] PASS: Dependabot active across npm, docker, and github-actions.",
    );
  }
}

// 6. ZAP Baseline Rules
console.log(
  "[*] 6. Auditing ZAP Baseline Rules File (deploy/zap/zap-baseline.rules)...",
);
const zapRulesPath = resolve(ROOT, "deploy/zap/zap-baseline.rules");
if (!existsSync(zapRulesPath)) {
  console.error("[-] FAIL: Missing deploy/zap/zap-baseline.rules");
  failures++;
} else {
  console.log("[+] PASS: OWASP ZAP baseline rules present.");
}

console.log(
  "\n================================================================",
);
if (failures > 0) {
  console.error(
    `FAILED: QJ-01 quality jobs audit failed with ${failures} error(s).`,
  );
  process.exit(1);
} else {
  console.log(
    "SUCCESS: QJ-01 passed completely (ZAP, Axe, Lighthouse CWV, Dependabot).",
  );
  console.log(
    "================================================================\n",
  );
  process.exit(0);
}
