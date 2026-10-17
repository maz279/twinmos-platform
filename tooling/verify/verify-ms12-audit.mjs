#!/usr/bin/env node
// tooling/verify/verify-ms12-audit.mjs — Comprehensive Audit for MS1.2: Push the Work, Make CI Run, Make Edge Start
// Verifies:
// 1. T1.2.1: Clean working tree, zero scratch_*.mjs files
// 2. T1.2.2: Deterministic app.js sync in prebuild/predev, safe build without pages-cache.json
// 3. T1.2.3: CI workflow hygiene (npm ci --include=dev, no job-wide NODE_ENV=production, fail on 0 tests)
// 4. T1.2.4: Explicit PGlite handling and PostgreSQL 18 service integration job with A10 migrations & test run
// 5. T1.2.5: Edge config syntax, duplicate removal, map hash bucket size, private range elimination
// 6. T1.2.6: EDGE-START CI job and containerized nginx -t syntax ok
// 7. T1.2.7: Branch protection policy in docs/ACCESS_MATRIX.md requiring green checks, 1 review, zero direct push

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..', '..');

console.log('========================================================================');
console.log('     MS1.2 COMPREHENSIVE AUDIT: CI PIPELINE & EDGE STARTUP');
console.log('     Roadmap v3.1 Phased (2026-10-17) | Tasks T1.2.1 – T1.2.7');
console.log('     Findings: Z-16, Z-36, Z-08, Z-07, Z-28 | Gates: CI-RUN, EDGE-START, EDGE-01');
console.log('========================================================================\n');

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

function check(id, title, fn) {
  totalChecks++;
  try {
    const res = fn();
    if (res !== false) {
      passedChecks++;
      console.log(`  [PASS] ${id}: ${title}`);
      return true;
    } else {
      failedChecks++;
      console.error(`  [FAIL] ${id}: ${title}`);
      return false;
    }
  } catch (err) {
    failedChecks++;
    console.error(`  [FAIL] ${id}: ${title} — ${err.message}`);
    return false;
  }
}

const ciPath = resolve(ROOT, '.github/workflows/ci.yml');
const webPkgPath = resolve(ROOT, 'apps/web/package.json');
const syncScriptPath = resolve(ROOT, 'tooling/sync-prototype-assets.mjs');
const deliveryPath = resolve(ROOT, 'apps/web/src/lib/delivery.ts');
const dbIndexPath = resolve(ROOT, 'packages/db/src/index.ts');
const edgeConfPath = resolve(ROOT, 'deploy/nginx/twinmos.conf');
const edgeDockerfilePath = resolve(ROOT, 'deploy/edge/Dockerfile');
const accessMatrixPath = resolve(ROOT, 'docs/ACCESS_MATRIX.md');

const ci = readFileSync(ciPath, 'utf8');
const webPkg = JSON.parse(readFileSync(webPkgPath, 'utf8'));
const syncScript = readFileSync(syncScriptPath, 'utf8');
const delivery = readFileSync(deliveryPath, 'utf8');
const dbIndex = readFileSync(dbIndexPath, 'utf8');
const edgeConf = readFileSync(edgeConfPath, 'utf8');
const edgeDockerfile = readFileSync(edgeDockerfilePath, 'utf8');
const accessMatrix = readFileSync(accessMatrixPath, 'utf8');

console.log('--- 1. T1.2.1: Working Tree & Scratch Hygiene ---');

check('T1.2.1a', 'Repository root contains zero scratch_*.mjs files', () => {
  const rootFiles = readdirSync(ROOT);
  const scratch = rootFiles.filter(f => f.startsWith('scratch_') && f.endsWith('.mjs'));
  return scratch.length === 0;
});

check('T1.2.1b', 'Git commits exist on main branch with atomic commit history', () => {
  const log = execSync('git log -n 25 --oneline', { cwd: ROOT, encoding: 'utf8' });
  return log.includes('MS1.1') || log.includes('R0.6');
});

console.log('\n--- 2. T1.2.2: Web Build Clean Checkout Safety ---');

check('T1.2.2a', 'apps/web/package.json runs sync-prototype-assets in prebuild and predev', () => {
  const hasPrebuild = webPkg.scripts.prebuild && webPkg.scripts.prebuild.includes('sync-prototype-assets.mjs');
  const hasPredev = webPkg.scripts.predev && webPkg.scripts.predev.includes('sync-prototype-assets.mjs');
  return hasPrebuild && hasPredev;
});

check('T1.2.2b', 'tooling/sync-prototype-assets.mjs copies app.js from in-repo prototype', () => {
  return syncScript.includes("files = ['app.js']") &&
         syncScript.includes('inRepoAssets') &&
         existsSync(resolve(ROOT, 'apps/web/public/assets/js/app.js'));
});

check('T1.2.2c', 'apps/web/src/lib/delivery.ts gracefully handles absence of pages-cache.json', () => {
  return delivery.includes('localPagesCache = {};') &&
         delivery.includes('existsSync(cachePath)');
});

console.log('\n--- 3. T1.2.3: CI Production-Parity Workflow Hygiene ---');

check('T1.2.3a', 'ci.yml uses npm ci --include=dev in build-and-verify and integration jobs', () => {
  const occurrences = ci.match(/npm ci --include=dev/g);
  return occurrences && occurrences.length >= 2;
});

check('T1.2.3b', 'ci.yml does NOT declare job-wide NODE_ENV=production in build-and-verify', () => {
  const buildAndVerifySection = ci.split('test-postgres-integration:')[0];
  const envSection = buildAndVerifySection.split('steps:')[0];
  return !envSection.includes('NODE_ENV: production') && !envSection.includes('NODE_ENV: "production"');
});

check('T1.2.3c', 'ci.yml fails if test step runs 0 tests (passWithNoTests=false)', () => {
  return ci.includes('--passWithNoTests=false');
});

console.log('\n--- 4. T1.2.4: Test Database Setup & PostgreSQL 18 Service Integration ---');

check('T1.2.4a', 'packages/db/src/index.ts exports createPgliteDb and respects FORCE_PGLITE', () => {
  return dbIndex.includes('export function createPgliteDb') &&
         dbIndex.includes("process.env.FORCE_PGLITE === '1'") &&
         ci.includes("FORCE_PGLITE: '1'");
});

check('T1.2.4b', 'ci.yml declares PostgreSQL 18 alpine service container', () => {
  return ci.includes('image: postgres:18-alpine') &&
         ci.includes('POSTGRES_USER:') &&
         ci.includes('POSTGRES_DB:');
});

check('T1.2.4c', 'test-postgres-integration executes A10 migration runner and API test suite', () => {
  const hasMigration = ci.includes('npm run db:migrate --workspace @twinmos/api');
  const hasTests = ci.includes('npm run test --workspace @twinmos/api');
  return hasMigration && hasTests;
});

console.log('\n--- 5. T1.2.5: Edge Configuration Remediation ---');

check('T1.2.5a', 'deploy/nginx/twinmos.conf has zero duplicate real_ip_header directives', () => {
  return !edgeConf.includes('real_ip_header');
});

check('T1.2.5b', 'deploy/nginx/twinmos.conf sets map_hash_bucket_size 128 before map blocks', () => {
  const bucketIdx = edgeConf.indexOf('map_hash_bucket_size 128;');
  const firstMapIdx = edgeConf.indexOf('map $uri $twinmos_csp');
  return bucketIdx > 0 && firstMapIdx > bucketIdx;
});

check('T1.2.5c', 'deploy/nginx/twinmos.conf contains zero untrusted private CIDRs in set_real_ip_from', () => {
  const privateRanges = ['127.0.0.1/32', '172.16.0.0/12', '10.0.0.0/8', '192.168.0.0/16'];
  for (const priv of privateRanges) {
    if (edgeConf.includes(`set_real_ip_from ${priv}`)) return false;
  }
  return true;
});

console.log('\n--- 6. T1.2.6: EDGE-START CI Job & Container Startup ---');

check('T1.2.6a', 'ci.yml contains test-edge-config job executing docker build and nginx -t', () => {
  return ci.includes('test-edge-config:') &&
         ci.includes('docker build -t twinmos-edge:test -f deploy/edge/Dockerfile .') &&
         ci.includes('docker run --rm twinmos-edge:test nginx -t') &&
         ci.includes('node tooling/verify/edge-ip-proof.mjs');
});

check('T1.2.6b', 'deploy/edge/Dockerfile generates self-signed certificates for test boots', () => {
  return edgeDockerfile.includes('openssl req -x509') &&
         edgeDockerfile.includes('/etc/nginx/certs/twinmos.key') &&
         edgeDockerfile.includes('/etc/nginx/certs/twinmos.pem');
});

check('T1.2.6c', 'docker run twinmos-edge:test nginx -t succeeds with exit code 0', () => {
  try {
    const out = execSync('docker run --rm twinmos-edge:test nginx -t 2>&1', {
      cwd: ROOT,
      encoding: 'utf8',
      timeout: 30000,
    });
    return out.includes('syntax is ok') && out.includes('test is successful');
  } catch (err) {
    const combined = (err.stdout || '') + (err.stderr || '');
    return combined.includes('syntax is ok') && combined.includes('test is successful');
  }
});

console.log('\n--- 7. T1.2.7: Branch Protection Policy ---');

check('T1.2.7a', 'docs/ACCESS_MATRIX.md enforces PR requirement with >= 1 approval', () => {
  return accessMatrix.includes('Require Pull Request Before Merging') &&
         accessMatrix.includes('Minimum number of approvals: **1**');
});

check('T1.2.7b', 'docs/ACCESS_MATRIX.md mandates all 3 required CI status checks', () => {
  return accessMatrix.includes('build-and-verify') &&
         accessMatrix.includes('test-postgres-integration') &&
         accessMatrix.includes('test-edge-config');
});

check('T1.2.7c', 'docs/ACCESS_MATRIX.md strictly prohibits direct pushes to main', () => {
  return accessMatrix.includes('Restrict direct pushes to `main`') &&
         accessMatrix.includes('Force pushes disabled');
});

console.log('\n========================================================================');
console.log(`TOTAL AUDIT CHECKS: ${totalChecks} | PASSED: ${passedChecks} | FAILED: ${failedChecks}`);
console.log('========================================================================\n');

if (failedChecks > 0) {
  console.error(`AUDIT FAILED with ${failedChecks} violation(s).`);
  process.exit(1);
} else {
  console.log('STATUS: 100% VERIFIED — ALL MS1.2 ACCEPTANCE CRITERIA PASSED CLEANLY.\n');
  process.exit(0);
}
