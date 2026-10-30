// Gate A Verification Suite Runner (VC-A: 56 Checks)
// Runs all automated verification checks and prints an audited scorecard.
import { execSync } from 'node:child_process';

console.log('================================================================');
console.log('           TwinMOS Phase A Close-Out Verification: Gate A (VC-A)');
console.log('================================================================\n');

const checks = [
  { name: 'GATE-01: TypeScript Compilation Across All Workspaces', cmd: 'npm run typecheck' },
  { name: 'GATE-02 & WALK-ADMIN: ESLint Zero Warnings & JIT-less Zod', cmd: 'node tooling/verify/walk-admin.mjs' },
  { name: 'GATE-03 & S-01..S-16: Security Regression Pack (290 tests)', cmd: 'npm test --workspace @twinmos/api -- test/security-pack.e2e.test.ts' },
  { name: 'GATE-05: Dependency Audit Policy & Exceptions', cmd: 'node tooling/verify/check-dependencies.mjs' },
  { name: 'STATIC-A & SEED-01/02 & PG-06: Static Hygiene Sweep', cmd: 'node tooling/verify/static-sweep.mjs' },
  { name: 'PG-05 & PG-07: Migration Journal & Runner Verification', cmd: 'node tooling/verify/check-migration-journal.mjs' },
  { name: 'EDGE-01 & EDGE-RIP & S-12/16a: Nginx Cloudflare Real-IP & Caps', cmd: 'node tooling/verify/edge-ip-proof.mjs' },
  { name: 'DATA-01 & DATA-02: Translation Encoding Integrity & Reject Corrupt', cmd: 'node --experimental-strip-types --no-warnings tooling/verify/check-translations.mjs' },
  { name: 'BUILD-01 & CONTENT-03: Provenance & Localhost-URL Hygiene', cmd: 'node tooling/verify/build-provenance.mjs' },
  { name: 'AXE-01 & AXE-02: WCAG 2.2 AA Zero Contrast Failures & Visual Audit', cmd: 'node tooling/verify/visual-a11y-audit.mjs' },
  { name: 'GATE-04: Playwright E2E Suite (49 tests)', cmd: 'npx playwright test e2e/public.spec.ts --config=e2e/playwright.config.ts --project=public' },
  { name: 'AUTH-UI & A-INVITE: Interactive Account Security & Manual Suite', cmd: 'node tooling/verify/manual-test-suite.mjs' },
];

let passed = 0;
let failed = 0;

for (const check of checks) {
  process.stdout.write(`[*] Checking ${check.name}... `);
  try {
    execSync(check.cmd, { stdio: 'pipe', encoding: 'utf8' });
    console.log('PASS');
    passed++;
  } catch (err) {
    console.log('FAIL');
    console.error(err.stdout || err.stderr || err.message);
    failed++;
  }
}

console.log('\n================================================================');
console.log(`Gate A Verification Complete: ${passed}/${checks.length} checks PASSED (${failed} failed).`);
console.log('================================================================');

if (failed > 0) process.exit(1);
process.exit(0);
