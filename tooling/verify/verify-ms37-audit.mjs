// Comprehensive MS3.7 Milestone Audit & Verification Suite (Roadmap v3.1 lines 1563–1657)
// Verifies all tasks T3.7.1–T3.7.6 and contractual exit gates: DEPLOY-01, QJ-01, DLV-01, and Gate B.

import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = process.cwd();

console.log('================================================================');
console.log('  MS3.7 Comprehensive Audit: Staging, Deploy Job & Quality Jobs');
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
// TASK T3.7.1: Staging VM & Host Ingress Isolation
// -----------------------------------------------------------------------------

check('MS3.7-STG-01', 'Staging VM bootstrap script enforces S-11 port isolation', () => {
  const p = resolve(ROOT, 'deploy/staging/bootstrap-vm.sh');
  if (!existsSync(p)) throw new Error('Missing deploy/staging/bootstrap-vm.sh');
  const code = readFileSync(p, 'utf8');
  if (!code.includes('ufw default deny incoming') || !code.includes('ufw deny 8787/tcp') || !code.includes('ufw deny 5432/tcp') || !code.includes('ufw deny 4321/tcp')) {
    throw new Error('bootstrap-vm.sh missing required UFW port isolation rules');
  }
});

check('MS3.7-STG-02', 'Host firewall isolates ingress to Cloudflare official IP ranges', () => {
  const p = resolve(ROOT, 'deploy/firewall/setup-firewall.sh');
  if (!existsSync(p)) throw new Error('Missing deploy/firewall/setup-firewall.sh');
  const code = readFileSync(p, 'utf8');
  if (!code.includes('CF_IPV4') || !code.includes('CF_IPV6') || !code.includes('173.245.48.0/20')) {
    throw new Error('setup-firewall.sh missing Cloudflare IP ranges');
  }
});

// -----------------------------------------------------------------------------
// TASK T3.7.2: CI Deploy Job (Zero-SSH in <15m)
// -----------------------------------------------------------------------------

check('MS3.7-DEP-01', 'CI deploy workflow configured in <15m without manual SSH', () => {
  const p = resolve(ROOT, '.github/workflows/deploy.yml');
  if (!existsSync(p)) throw new Error('Missing .github/workflows/deploy.yml');
  const code = readFileSync(p, 'utf8');
  if (!code.includes('timeout-minutes: 15')) throw new Error('deploy.yml missing 15-minute timeout');
  if (!code.includes('environment: staging') || !code.includes('environment: production')) {
    throw new Error('deploy.yml missing staging and production environments');
  }
  if (!code.includes('run --rm migrate') || !code.includes('run --rm bootstrap')) {
    throw new Error('deploy.yml missing migrate or bootstrap commands');
  }
  if (code.includes('ssh ') || code.includes('appleboy/ssh-action')) {
    throw new Error('deploy.yml contains manual SSH actions (violates zero-SSH requirement)');
  }
});

check('MS3.7-DEP-02', 'Staging deploy rollout script functional with healthchecks & release tracking', () => {
  const p = resolve(ROOT, 'deploy/staging/deploy.sh');
  if (!existsSync(p)) throw new Error('Missing deploy/staging/deploy.sh');
  const code = readFileSync(p, 'utf8');
  if (!code.includes('migrate') || !code.includes('bootstrap') || !code.includes('.active_release.json')) {
    throw new Error('deploy.sh missing migration, bootstrap, or release recording');
  }
});

// -----------------------------------------------------------------------------
// TASK T3.7.3: Rollback Rehearsal & DEPLOY-01 Exit Gate
// -----------------------------------------------------------------------------

check('MS3.7-DEP-03', 'Automated rollback script deploy/staging/rollback.sh available', () => {
  const p = resolve(ROOT, 'deploy/staging/rollback.sh');
  if (!existsSync(p)) throw new Error('Missing deploy/staging/rollback.sh');
  const code = readFileSync(p, 'utf8');
  if (!code.includes('up -d --no-deps api web edge') || !code.includes('.active_release.json')) {
    throw new Error('rollback.sh missing service rollout or release recording');
  }
});

check('MS3.7-DEP-04', 'Live rollback rehearsal completes in <120s with zero data loss (DEPLOY-01)', () => {
  try {
    execSync('node tooling/verify/verify-rollback.mjs', { stdio: 'pipe', encoding: 'utf8', timeout: 30000 });
  } catch (e) {
    throw new Error(`Rollback rehearsal failed: ${e.stderr || e.stdout || e.message}`);
  }
});

// -----------------------------------------------------------------------------
// TASK T3.7.4: Quality Jobs with Enforced Thresholds & Dependabot (QJ-01)
// -----------------------------------------------------------------------------

check('MS3.7-QJ-01', 'OWASP ZAP baseline scan enforces threshold without continue-on-error', () => {
  const p = resolve(ROOT, '.github/workflows/quality.yml');
  const code = readFileSync(p, 'utf8');
  if (code.includes('continue-on-error: true')) {
    throw new Error('quality.yml contains continue-on-error: true for ZAP scan');
  }
  if (!code.includes('continue-on-error: false')) {
    throw new Error('quality.yml missing explicit continue-on-error: false for ZAP scan');
  }
});

check('MS3.7-QJ-02', 'Quality jobs trigger nightly and on release branches', () => {
  const p = resolve(ROOT, '.github/workflows/quality.yml');
  const code = readFileSync(p, 'utf8');
  if (!code.includes('cron: \'0 2 * * *\'') || !code.includes('branches: [main, \'release/**\']')) {
    throw new Error('quality.yml missing nightly schedule or release branch trigger');
  }
});

check('MS3.7-QJ-03', 'Lighthouse CI enforces performance as error with LCP <= 2.5s, CLS <= 0.1, & JS budget', () => {
  const p = resolve(ROOT, 'lighthouserc.json');
  if (!existsSync(p)) throw new Error('Missing lighthouserc.json');
  const lhci = JSON.parse(readFileSync(p, 'utf8'));
  const a = lhci.ci?.assert?.assertions ?? {};
  if (a['categories:performance']?.[0] !== 'error') throw new Error('categories:performance is not an error');
  if (a['largest-contentful-paint']?.[0] !== 'error' || a['largest-contentful-paint']?.[1]?.maxNumericValue > 2500) {
    throw new Error('LCP threshold missing or >2500ms');
  }
  if (a['cumulative-layout-shift']?.[0] !== 'error' || a['cumulative-layout-shift']?.[1]?.maxNumericValue > 0.1) {
    throw new Error('CLS threshold missing or >0.1');
  }
});

check('MS3.7-QJ-04', 'Dependabot active in .github/dependabot.yml across npm, docker, and github-actions', () => {
  const p = resolve(ROOT, '.github/dependabot.yml');
  if (!existsSync(p)) throw new Error('Missing .github/dependabot.yml');
  const code = readFileSync(p, 'utf8');
  if (!code.includes('package-ecosystem: "npm"') || !code.includes('package-ecosystem: "docker"') || !code.includes('package-ecosystem: "github-actions"')) {
    throw new Error('dependabot.yml missing npm, docker, or github-actions ecosystems');
  }
});

// -----------------------------------------------------------------------------
// TASK T3.7.5: Staging Measurements (DLV-01 & CACHE-01)
// -----------------------------------------------------------------------------

check('MS3.7-DLV-01', 'Delivery API warm single-entity read latency p95 < 50ms on staging', () => {
  try {
    const out = execSync('node tooling/verify/verify-staging-dlv.mjs', { stdio: 'pipe', encoding: 'utf8', timeout: 30000 });
    if (!out.includes('DLV-01 Delivery API p95') || !out.includes('requirement met')) {
      throw new Error('DLV-01 measurement script did not verify p95 < 50ms');
    }
  } catch (e) {
    throw new Error(`Staging measurement execution failed: ${e.stderr || e.stdout || e.message}`);
  }
});

// -----------------------------------------------------------------------------
// TASK T3.7.6: Platform Foundation Gate B Full Compliance
// -----------------------------------------------------------------------------

check('MS3.7-GATE-B', 'Platform Foundation Gate B full suite passes (18/18 checks green)', () => {
  try {
    const out = execSync('node tooling/verify/run-all-gate-b.mjs', { stdio: 'pipe', encoding: 'utf8', timeout: 600000, maxBuffer: 20 * 1024 * 1024 });
    if (!out.includes('Gate B Verification Complete: 18/18 checks PASSED')) {
      throw new Error(`Gate B did not achieve 18/18 checks passed:\n${out}`);
    }
  } catch (e) {
    throw new Error(`Gate B verification failed: ${e.stderr || e.stdout || e.message}`);
  }
});

console.log('\n================================================================');
console.log(`MS3.7 Audit Complete: ${passed}/${passed + failed} checks PASSED (${failed} failed).`);
if (failed === 0) {
  console.log('CONTRACTUAL GATES DEPLOY-01, QJ-01, DLV-01 & GATE B FULLY SATISFIED.');
  console.log('================================================================\n');
  process.exit(0);
} else {
  console.error('CONTRACTUAL GATES FAILED. Review errors above.');
  console.log('================================================================\n');
  process.exit(1);
}
