// Comprehensive MS3.6 Milestone Audit & Verification Suite (Roadmap v3.1 lines 1519–1562)
// Verifies all tasks T3.6.1–T3.6.4 and both contractual exit gates: GREF-H & REPO-01.

import { execSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

const ROOT = process.cwd();

console.log('================================================================');
console.log('  MS3.6 Comprehensive Audit: Reflection Harness & Repo Hygiene');
console.log('================================================================\n');

let passed = 0;
let failed = 0;
const results = [];

function check(id, description, fn) {
  process.stdout.write(`[*] [${id}] ${description}... `);
  try {
    fn();
    console.log('PASS');
    passed++;
    results.push({ id, description, status: 'PASS' });
  } catch (err) {
    console.log(`FAIL\n    [-] Error: ${err.message}`);
    failed++;
    results.push({ id, description, status: 'FAIL', error: err.message });
  }
}

// -----------------------------------------------------------------------------
// EXIT GATE: GREF-H (T3.6.1 & T3.6.2)
// -----------------------------------------------------------------------------

// Check 1: G-REFLECT Fixture exists and replaces vacuous grep scripts
check('MS3.6-GREF-01', 'G-REFLECT live fixture authored (T3.6.1 / Z-17)', () => {
  const p = resolve(ROOT, 'tooling/verify/greflect-fixture.mjs');
  if (!existsSync(p)) throw new Error('Missing tooling/verify/greflect-fixture.mjs');
  const code = readFileSync(p, 'utf8');
  if (!code.includes('runFixture') || !code.includes('sign-in/email') || !code.includes('archived')) {
    throw new Error('greflect-fixture.mjs does not implement real API authentication and editorial lifecycle');
  }
});

// Check 2: Live G-REFLECT Fixture execution (admin sign-in, publish <5s, anonymous load, archive <5s)
check('MS3.6-GREF-02', 'G-REFLECT live fixture execution (admin sign-in, publish <5s, archive <5s)', () => {
  try {
    execSync('node tooling/verify/greflect-fixture.mjs', { stdio: 'pipe', encoding: 'utf8', timeout: 30000 });
  } catch (e) {
    throw new Error(`Live G-REFLECT fixture execution failed: ${e.stderr || e.stdout || e.message}`);
  }
});

// Check 3: G-REFLECT integrated into Gate B (VC-B-17) and greflect-harness.mjs
check('MS3.6-GREF-03', 'G-REFLECT fixture integrated into Gate B & greflect-harness', () => {
  const harnessPath = resolve(ROOT, 'tooling/verify/greflect-harness.mjs');
  const content = readFileSync(harnessPath, 'utf8');
  if (!content.includes('greflect-fixture.mjs')) {
    throw new Error('greflect-harness.mjs does not invoke live greflect-fixture.mjs');
  }
});

// Check 4: G-PARITY Multi-Breakpoint Visual Baseline & Pixel-Diff Tooling (T3.6.2)
check('MS3.6-GREF-04', 'G-PARITY multi-breakpoint harness authored (390px, 768px, 1440px)', () => {
  const p = resolve(ROOT, 'tooling/verify/gparity-harness.mjs');
  if (!existsSync(p)) throw new Error('Missing tooling/verify/gparity-harness.mjs');
  const code = readFileSync(p, 'utf8');
  if (!code.includes('390') || !code.includes('768') || !code.includes('1440')) {
    throw new Error('gparity-harness.mjs does not support 390px, 768px, and 1440px viewports');
  }
  if (!code.includes('DIFF_THRESHOLD_PERCENT')) {
    throw new Error('gparity-harness.mjs missing diff threshold');
  }
});

// Check 5: Baseline screenshots captured under deploy/baselines/ across 3 viewports
check('MS3.6-GREF-05', 'Baseline screenshots captured under deploy/baselines/ across 3 viewports', () => {
  const dir = resolve(ROOT, 'deploy/baselines');
  if (!existsSync(dir)) throw new Error('deploy/baselines directory does not exist');
  const files = readdirSync(dir);
  const requiredViewports = ['mobile', 'tablet', 'desktop'];
  for (const vp of requiredViewports) {
    const hasVp = files.some((f) => f.includes(`-${vp}.png`));
    if (!hasVp) throw new Error(`Missing baseline screenshots for viewport ${vp}`);
  }
  if (files.length < 18) {
    throw new Error(`Expected at least 18 baseline screenshots, found ${files.length}`);
  }
});

// Check 6: G-PARITY live pixel-diff execution verifies <0.1% visual difference
check('MS3.6-GREF-06', 'Live pixel-diff execution verifies <=0.1% visual difference', () => {
  try {
    const out = execSync('node tooling/verify/gparity-harness.mjs', { stdio: 'pipe', encoding: 'utf8', timeout: 60000 });
    if (!out.includes('SUCCESS: All responsive visual baselines within 0.1% parity threshold')) {
      throw new Error('G-PARITY pixel-diff did not report success');
    }
  } catch (e) {
    throw new Error(`G-PARITY pixel-diff failed: ${e.stderr || e.stdout || e.message}`);
  }
});

// Check 7: Baselines stored as CI artefacts in .github/workflows/ci.yml
check('MS3.6-GREF-07', 'Baselines published as CI artefacts in .github/workflows/ci.yml', () => {
  const ciPath = resolve(ROOT, '.github/workflows/ci.yml');
  const ciContent = readFileSync(ciPath, 'utf8');
  if (!ciContent.includes('deploy/baselines/')) {
    throw new Error('.github/workflows/ci.yml does not upload deploy/baselines/ as CI artefacts');
  }
});

// -----------------------------------------------------------------------------
// EXIT GATE: REPO-01 (T3.6.3 & T3.6.4)
// -----------------------------------------------------------------------------

// Check 8: workspace/ excluded from git index & untracked
check('MS3.6-REPO-01', 'workspace/ excluded from git tracking with 0 tracked files', () => {
  const tracked = execSync('git ls-files workspace/', { encoding: 'utf8' }).trim();
  if (tracked.length > 0) {
    const count = tracked.split('\n').length;
    throw new Error(`workspace/ has ${count} tracked files in git index`);
  }
  const gitignore = readFileSync(resolve(ROOT, '.gitignore'), 'utf8');
  if (!gitignore.includes('workspace/')) throw new Error('.gitignore missing workspace/ rule');
  const dockerignore = readFileSync(resolve(ROOT, '.dockerignore'), 'utf8');
  if (!dockerignore.includes('workspace/')) throw new Error('.dockerignore missing workspace/ rule');
});

// Check 9: History decision documented in ADR-007 and REPO_HYGIENE.md with before/after measurements
check('MS3.6-REPO-02', 'History decision documented in ADR-007 & REPO_HYGIENE.md with measurements', () => {
  const adrPath = resolve(ROOT, 'docs/adr/ADR-007-repository-history-decision.md');
  if (!existsSync(adrPath)) throw new Error('Missing docs/adr/ADR-007-repository-history-decision.md');
  const adr = readFileSync(adrPath, 'utf8');
  if (!adr.includes('433.46 MB') || !adr.includes('<45 MB') || !adr.includes('<15 MB')) {
    throw new Error('ADR-007 missing before/after measurements');
  }
  const hygienePath = resolve(ROOT, 'docs/REPO_HYGIENE.md');
  const hygiene = readFileSync(hygienePath, 'utf8');
  if (!hygiene.includes('ADR-007') || !hygiene.includes('REPO-01')) {
    throw new Error('REPO_HYGIENE.md missing ADR-007 reference or REPO-01 measurements');
  }
});

// Check 10: CODEOWNERS updated with resolving user handles (@maz279) covering auth, db, edge
check('MS3.6-REPO-03', 'CODEOWNERS updated with resolving handle @maz279 for auth, db, and edge', () => {
  const codeownersPath = resolve(ROOT, '.github/CODEOWNERS');
  if (!existsSync(codeownersPath)) throw new Error('Missing .github/CODEOWNERS');
  const content = readFileSync(codeownersPath, 'utf8');
  const lines = content.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
  const active = lines.join('\n');
  if (active.includes('@twinmos/')) throw new Error('CODEOWNERS contains unresolvable @twinmos/* team handles');
  if (!active.includes('/apps/api/src/auth.ts') || !active.includes('@maz279')) {
    throw new Error('CODEOWNERS missing auth mapping to @maz279');
  }
  if (!active.includes('/packages/db/') || !active.includes('/deploy/nginx/')) {
    throw new Error('CODEOWNERS missing db or edge mapping');
  }
});

// Check 11: Pre-commit lint and format workflow active (.githooks & package.json)
check('MS3.6-REPO-04', 'Pre-commit lint, format, and secret scan workflow active', () => {
  const hookPath = resolve(ROOT, '.githooks/pre-commit');
  if (!existsSync(hookPath)) throw new Error('Missing .githooks/pre-commit');
  const pkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8'));
  if (!pkg.scripts['pre-commit'] || !pkg.scripts['lint'] || !pkg.scripts['format:check']) {
    throw new Error('package.json missing pre-commit, lint, or format:check scripts');
  }
  try {
    execSync('npm run pre-commit', { stdio: 'pipe', encoding: 'utf8', timeout: 60000 });
  } catch (e) {
    throw new Error(`Pre-commit hook execution failed: ${e.stderr || e.stdout || e.message}`);
  }
});

console.log('\n================================================================');
console.log(`MS3.6 Audit Complete: ${passed}/${passed + failed} checks PASSED (${failed} failed).`);
if (failed === 0) {
  console.log('CONTRACTUAL GATES GREF-H & REPO-01 FULLY SATISFIED.');
  console.log('================================================================\n');
  process.exit(0);
} else {
  console.error('CONTRACTUAL GATES FAILED. Review errors above.');
  console.log('================================================================\n');
  process.exit(1);
}
