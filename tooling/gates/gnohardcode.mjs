// G-NOHARDCODE Gate (Task B8a)
// Scans source code in apps/ and packages/ for hardcoded secrets, production API keys,
// and private tokens. Excludes test directories, mock files, and build outputs.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

console.log('[gnohardcode] Running G-NOHARDCODE secrets and credentials gate...');

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
let violations = 0;

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
        // Exclude test files
        if (entry.includes('.test.') || entry.includes('.spec.')) continue;
        scanFile(fullPath);
      }
    }
  }
}

function scanFile(filePath) {
  filesScanned++;
  const content = readFileSync(filePath, 'utf8');
  for (const { name, regex } of SECRET_PATTERNS) {
    if (regex.test(content)) {
      console.error(`[gnohardcode] FAIL: Possible ${name} detected in ${filePath}`);
      violations++;
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

console.log(`[gnohardcode] Scanned ${filesScanned} source files.`);

if (violations > 0) {
  console.error(`[gnohardcode] FAILED: ${violations} secret violation(s) detected.`);
  process.exit(1);
}

console.log('[gnohardcode] PASS G-NOHARDCODE: Zero hardcoded secrets detected.');
process.exit(0);
