// G-NOHARDCODE Gate (Task B8a / T3.3.6 / T3.3.7)
// Enforces two layers of protection:
// 1. Secrets & Credentials: Scans source code in apps/ and packages/ for production secrets,
//    API keys, private tokens, and PEM keys.
// 2. Astro Template Hardcoding AST Lint (Task T3.3.6): Scans apps/web/src/**/*.astro for raw hardcoded text
//    strings outside CMS BlockDispatcher / dynamic Delivery bindings, with an allow-list for structural chrome.
// 3. Ratchet Baseline Enforcement (Task T3.3.7): Enforces that hardcoded literal count does not exceed maxLiterals.

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';

console.log('[gnohardcode] Running G-NOHARDCODE secrets and template literal gate...');

let violations = 0;

// ============================================================
// 1. Secrets & Credentials Scan
// ============================================================
const SECRET_PATTERNS = [
  { name: 'AWS Access Key', regex: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: 'GitHub Personal Token', regex: /\bghp_[0-9a-zA-Z]{36}\b/ },
  { name: 'Resend API Key', regex: /\bre_[0-9a-zA-Z]{24,}\b/ },
  { name: 'Stripe Secret Key', regex: /\bsk_live_[0-9a-zA-Z]{24,}\b/ },
  { name: 'Private Key PEM', regex: /-----BEGIN (RSA |EC )?PRIVATE KEY-----/ },
  { name: 'Slack Bot Token', regex: /\bxoxb-[0-9]{11,}-[0-9]{11,}-[0-9a-zA-Z]{24,}\b/ },
];

const SCAN_DIRS = [
  resolve(process.cwd(), 'apps/api/src'),
  resolve(process.cwd(), 'apps/web/src'),
  resolve(process.cwd(), 'packages/db/src'),
  resolve(process.cwd(), 'packages/shared/src'),
];

let filesScanned = 0;

function walkDir(dir) {
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      if (entry === 'node_modules' || entry === '.git' || entry === 'dist' || entry === 'test') continue;
      walkDir(fullPath);
    } else if (stat.isFile()) {
      if (entry.endsWith('.ts') || entry.endsWith('.js') || entry.endsWith('.mjs') || entry.endsWith('.astro')) {
        if (entry.includes('.test.') || entry.includes('.spec.')) continue;
        filesScanned++;
        const content = readFileSync(fullPath, 'utf8');
        for (const { name, regex } of SECRET_PATTERNS) {
          if (regex.test(content)) {
            console.error(`[gnohardcode] FAIL: Possible ${name} detected in ${fullPath}`);
            violations++;
          }
        }
      }
    }
  }
}

for (const dir of SCAN_DIRS) {
  try {
    walkDir(dir);
  } catch (err) {
    console.error(`[gnohardcode] Could not read ${dir}:`, err.message);
  }
}

// ============================================================
// 2. Astro Template Hardcoding AST / Literal Lint (Task T3.3.6)
// ============================================================
const ALLOW_LIST = new Set([
  'Layout.astro',
  'BlockDispatcher.astro',
  'Header.astro',
  'Footer.astro',
  'Drawer.astro',
  'Breadcrumb.astro',
  'CookieBanner.astro',
  'CompareTray.astro',
  'SearchOverlay.astro',
]);

const webSrcDir = resolve(process.cwd(), 'apps/web/src');
let astroFilesScanned = 0;
let allowlistedCount = 0;
let totalHardcodedLiterals = 0;
const literalDetails = [];

function scanAstroDirectory(dir) {
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      if (entry === 'node_modules' || entry === 'dist') continue;
      scanAstroDirectory(fullPath);
    } else if (stat.isFile() && entry.endsWith('.astro')) {
      astroFilesScanned++;
      const fileName = basename(fullPath);
      if (ALLOW_LIST.has(fileName)) {
        allowlistedCount++;
        continue;
      }

      const content = readFileSync(fullPath, 'utf8');
      // Extract template body after frontmatter (--- ... ---)
      const parts = content.split(/^---$/m);
      const templateBody = parts.length >= 3 ? parts.slice(2).join('---') : content;

      // Strip <script> and <style> tags
      let cleaned = templateBody.replace(/<script[\s\S]*?<\/script>/gi, '');
      cleaned = cleaned.replace(/<style[\s\S]*?<\/style>/gi, '');

      // Strip Astro expressions { ... }
      cleaned = cleaned.replace(/\{[\s\S]*?\}/g, '');

      // Strip HTML tags <...>
      cleaned = cleaned.replace(/<[^>]+>/g, ' ');

      // Strip comments
      cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');

      // Find non-whitespace substantive text literals (> 10 chars)
      const lines = cleaned.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        // Ignore empty, short punctuation, or purely numeric tokens
        if (trimmed.length >= 10 && /[a-zA-Z]/.test(trimmed)) {
          totalHardcodedLiterals++;
          literalDetails.push({ file: fileName, text: trimmed.slice(0, 40) });
        }
      }
    }
  }
}

if (existsSync(webSrcDir)) {
  scanAstroDirectory(webSrcDir);
}

// ============================================================
// 3. Baselines & Ratchet Enforcement (Task T3.3.7)
// ============================================================
const baselinesPath = resolve(process.cwd(), 'tooling/gates/baselines.json');
let baseline = {
  hardcode: { maxLiterals: 45, currentLiterals: 24 }
};
if (existsSync(baselinesPath)) {
  try {
    baseline = JSON.parse(readFileSync(baselinesPath, 'utf8'));
  } catch {
    // default baseline
  }
}

const maxAllowed = baseline.hardcode?.maxLiterals ?? 45;

console.log(`\n[gnohardcode] Hardcoded Template Literal AST Scan (Task T3.3.6):`);
console.log(`              • Astro templates scanned: ${astroFilesScanned}`);
console.log(`              • Structural allow-listed: ${allowlistedCount}`);
console.log(`              • Hardcoded literals found: ${totalHardcodedLiterals}`);
console.log(`              • Ratchet threshold:       ≤ ${maxAllowed} literals`);

if (totalHardcodedLiterals > maxAllowed) {
  console.error(`[gnohardcode] FAIL: Hardcoded literals (${totalHardcodedLiterals}) exceed ratchet limit (${maxAllowed}).`);
  violations++;
} else {
  console.log(`[gnohardcode] PASS: Hardcoded literals within ratchet allowance.`);
}

// ============================================================
// 4. Island Scripts Data Literals Check (Task T4.8.2 / C4e)
// ============================================================
console.log(`\n[gnohardcode] Island Scripts Data Literals Check (Task T4.8.2 / C4e):`);
const islandScripts = [
  resolve(process.cwd(), 'apps/web/public/assets/js/app.js'),
  resolve(process.cwd(), 'prototype/assets/js/app.js'),
];

let islandLiteralViolations = 0;
const FORBIDDEN_ISLAND_LITERAL_PATTERNS = [
  { name: 'advisors literal object', regex: /var\s+advisors\s*=\s*\{\s*laptop\s*:/ },
  { name: 'workloads literal object', regex: /var\s+workloads\s*=\s*\{\s*directstorage\s*:/ },
  { name: 'segments literal object', regex: /var\s+segments\s*=\s*\{\s*all\s*:\s*\[/ },
];

for (const scriptPath of islandScripts) {
  if (existsSync(scriptPath)) {
    const content = readFileSync(scriptPath, 'utf8');
    for (const pattern of FORBIDDEN_ISLAND_LITERAL_PATTERNS) {
      if (pattern.regex.test(content)) {
        console.error(`[gnohardcode] FAIL: Embedded ${pattern.name} found in ${basename(scriptPath)}`);
        islandLiteralViolations++;
        violations++;
      }
    }
  }
}

if (islandLiteralViolations === 0) {
  console.log(`              • 0 widget data literals detected in island scripts (decoupled to widgets-config / data-config).`);
  console.log(`[gnohardcode] PASS: Island scripts data decoupling check passed.`);
} else {
  console.error(`[gnohardcode] FAIL: ${islandLiteralViolations} data literal violations detected in island scripts.`);
}

console.log(`\n[gnohardcode] Secrets & Security Scan:`);
console.log(`              • Source files scanned:    ${filesScanned}`);
console.log(`              • Secrets detected:        ${violations > 0 && totalHardcodedLiterals <= maxAllowed ? violations : 0}`);

if (violations > 0) {
  console.error(`\n[gnohardcode] G-NOHARDCODE gate FAILED with ${violations} violation(s).`);
  process.exit(1);
}

console.log('\n[gnohardcode] PASS G-NOHARDCODE: All checks passed successfully.');
process.exit(0);
