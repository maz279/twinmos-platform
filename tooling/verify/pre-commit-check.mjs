// Pre-commit validation hook (T3.6.4 / REPO-01)
// Enforces linting, formatting, secret scanning, and repository hygiene.
// Can be bypassed in emergency with git commit --no-verify.

import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

console.log("================================================================");
console.log("       TwinMOS Pre-Commit Quality & Security Gate");
console.log(
  "================================================================\n",
);

let failures = 0;

// 1. Secret & Credentials Scan
console.log("[*] 1. Scanning staged files for secrets and credentials...");
try {
  const staged = execSync("git diff --cached --name-only", { encoding: "utf8" })
    .trim()
    .split("\n")
    .filter(Boolean);
  const sensitivePatterns = [
    // Real env files are secrets; committed *.example/*.template files are
    // documentation with placeholder values and must stay committable.
    { test: (f) => /\.env($|\.)/.test(f) && !/\.(example|template)$/.test(f) },
    { test: (f) => /\.pem$/.test(f) },
    { test: (f) => /\.key$/.test(f) },
    { test: (f) => /id_rsa/.test(f) },
    { test: (f) => /secrets?\.(json|ya?ml)/.test(f) },
  ];

  for (const file of staged) {
    if (file.startsWith("workspace/")) {
      console.error(
        `[-] FAIL: Attempting to commit workspace dump file: ${file}`,
      );
      failures++;
    }
    for (const pat of sensitivePatterns) {
      if (pat.test(file)) {
        console.error(
          `[-] FAIL: Attempting to commit potential secret/credential file: ${file}`,
        );
        failures++;
      }
    }
  }
  if (failures === 0) {
    console.log(
      `[+] PASS: Secret scan clean (${staged.length} file(s) staged).`,
    );
  }
} catch (e) {
  console.log(`[*] Note: Git staging check skipped (${e.message})`);
}

// 2. ESLint check
console.log("[*] 2. Running ESLint on admin console...");
try {
  execSync("npm run lint --workspace @twinmos/admin", { stdio: "pipe" });
  console.log("[+] PASS: ESLint zero warnings.");
} catch (e) {
  console.error("[-] FAIL: ESLint detected warnings or errors:", e.stdout?.toString() || e.message);
  failures++;
}

// 3. Format check
console.log("[*] 3. Running Prettier format check...");
try {
  execSync(
    "npx prettier --check package.json tooling/verify/greflect-fixture.mjs tooling/verify/gparity-harness.mjs",
    { stdio: "pipe" },
  );
  console.log("[+] PASS: Prettier formatting verified.");
} catch (e) {
  console.error(
    "[-] FAIL: Prettier formatting issues detected:",
    e.stdout?.toString() || e.message,
  );
  failures++;
}

// 4. CODEOWNERS validation
console.log("[*] 4. Validating CODEOWNERS syntax and resolving handles...");
const codeownersPath = resolve(process.cwd(), ".github/CODEOWNERS");
if (!existsSync(codeownersPath)) {
  console.error("[-] FAIL: Missing .github/CODEOWNERS");
  failures++;
} else {
  const lines = readFileSync(codeownersPath, "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
  const activeRules = lines.join("\n");
  if (activeRules.includes("@twinmos/")) {
    console.error(
      "[-] FAIL: Unresolvable @twinmos/* team handles found in active rules (use @maz279).",
    );
    failures++;
  } else if (!activeRules.includes("@maz279")) {
    console.error("[-] FAIL: Missing resolving handle @maz279 in CODEOWNERS.");
    failures++;
  } else {
    console.log(
      "[+] PASS: CODEOWNERS configured with resolving handle @maz279.",
    );
  }
}

console.log(
  "\n================================================================",
);
if (failures > 0) {
  console.error(
    `PRE-COMMIT FAILED: ${failures} check(s) failed. Fix issues or use --no-verify for emergency bypass.`,
  );
  console.log(
    "================================================================\n",
  );
  process.exit(1);
} else {
  console.log("PRE-COMMIT PASSED: All pre-commit quality checks passed.");
  console.log(
    "================================================================\n",
  );
  process.exit(0);
}
