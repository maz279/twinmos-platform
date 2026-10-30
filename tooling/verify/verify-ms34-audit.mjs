// MS3.4 Comprehensive Milestone Verification & Audit Suite
// Evaluates all tasks T3.4.1 through T3.4.6 and audits all MS3.4 success criteria:
// 1. COMPOSE-01: Docker Compose topology, one-shot migrate/bootstrap, S-11 host port shielding
// 2. SBOM-01: Pure production runtime SBOMs (0 drizzle-kit/esbuild/vitest), sharp native bindings
// 3. BUILD-CLEAN: Clean-checkout build without untracked external dependencies
// 4. CI-01: Production parity pipeline with 7 ordered stages, Node 24, Postgres 18, zero Turnstile bypass
// 5. CI-02: Security reversion parity proof (negative mutations turn pipeline red)
// 6. TYPE-WEB: Zero TypeScript / astro check compilation errors across monorepo
// 7. CI-RUN: Production pipeline runtime bounded under 20 minutes

import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

console.log('================================================================');
console.log('       MS3.4: Containers and Production-Parity CI Audit Suite');
console.log('================================================================\n');

let totalChecks = 0;
let passedChecks = 0;

function runAuditCheck(id, description, checkFn) {
  totalChecks++;
  process.stdout.write(`[*] [${id}] ${description}... `);
  try {
    checkFn();
    console.log('PASS');
    passedChecks++;
  } catch (err) {
    console.log('FAIL');
    console.error(`    Error: ${err.message}`);
  }
}

// 1. COMPOSE-01: Docker Compose Topology & Host Isolation
runAuditCheck('COMPOSE-01', 'Docker Compose topology, one-shot jobs & S-11 host isolation', () => {
  const composePath = resolve(process.cwd(), 'deploy/compose/docker-compose.yml');
  if (!existsSync(composePath)) throw new Error('Missing deploy/compose/docker-compose.yml');
  const comp = readFileSync(composePath, 'utf8');

  // Verify S-11: API container has NO host port bindings
  const apiIdx = comp.search(/[\r\n]\s{2}api:\s*[\r\n]/);
  const postgresIdx = comp.search(/[\r\n]\s{2}postgres:\s*[\r\n]/);
  const apiSection = comp.slice(apiIdx, postgresIdx);
  const hasHostPorts = apiSection.split(/\r?\n/).some(l => !l.trim().startsWith('#') && l.trim().startsWith('ports:'));
  if (hasHostPorts) throw new Error('API container has host ports exposed (violates S-11)');

  // Verify internal expose
  if (!apiSection.includes('expose:') || !apiSection.includes('8787')) {
    throw new Error('API container missing internal port expose: 8787');
  }

  // Verify migrate and bootstrap services
  if (!comp.includes('migrate:') || !comp.includes('bootstrap:')) {
    throw new Error('Missing one-shot migrate or bootstrap services in docker-compose.yml');
  }

  // Verify Postgres 18 and pgdata volume
  // PG18's image declares VOLUME /var/lib/postgresql (the /data child path is
  // the pre-18 layout); accept both mounts, require the 18-alpine image.
  if (!comp.includes('postgres:18-alpine') || !/\/var\/lib\/postgresql(\/data)?(?=['"]|\s|$)/m.test(comp)) {
    throw new Error('Postgres service does not use postgres:18-alpine or data volume');
  }

  // Verify compose config syntax
  execSync('docker compose -f deploy/compose/docker-compose.yml config', { stdio: 'pipe' });
});

// 2. SBOM-01: Image Hygiene & Pure Production Runtime
runAuditCheck('SBOM-01', 'Production image hygiene & CycloneDX SBOMs (0 dev tooling, sharp native)', () => {
  // Execute SBOM generator
  execSync('node tooling/verify/generate-sbom.mjs', { stdio: 'pipe' });

  const apiSbomPath = resolve(process.cwd(), 'deploy/sbom/api-sbom.json');
  const webSbomPath = resolve(process.cwd(), 'deploy/sbom/web-sbom.json');
  if (!existsSync(apiSbomPath) || !existsSync(webSbomPath)) {
    throw new Error('Missing generated SBOM artifacts');
  }

  const apiSbom = JSON.parse(readFileSync(apiSbomPath, 'utf8'));
  const forbidden = ['drizzle-kit', 'esbuild', 'vitest'];
  for (const comp of apiSbom.components) {
    if (forbidden.includes(comp.name)) {
      throw new Error(`Forbidden dev dependency ${comp.name} present in production SBOM`);
    }
  }

  // Verify sharp is present
  const hasSharp = apiSbom.components.some(c => c.name === 'sharp');
  if (!hasSharp) throw new Error('sharp missing from API runtime SBOM');
});

// 3. BUILD-CLEAN: Clean Monorepo Build from Git-Tracked Code
runAuditCheck('BUILD-CLEAN', 'Monorepo builds cleanly from repository files without untracked artifacts', () => {
  execSync('node tooling/verify/verify-build-clean.mjs', { stdio: 'pipe' });
});

// 4. CI-01: Production-Parity Pipeline (7 Ordered Stages)
runAuditCheck('CI-01', 'CI pipeline enforces 7 ordered stages, Node 24, Postgres 18 & Turnstile', () => {
  const ciPath = resolve(process.cwd(), '.github/workflows/ci.yml');
  const ci = readFileSync(ciPath, 'utf8');

  if (!ci.includes('node-version: 24')) throw new Error('CI pipeline must run on Node 24');
  if (!ci.includes('postgres:18-alpine')) throw new Error('CI pipeline must use postgres:18-alpine service');
  if (!ci.includes('timeout-minutes: 20')) throw new Error('CI pipeline must be bounded under 20 minutes (CI-RUN)');
  if (ci.includes('API_ALLOW_NO_TURNSTILE')) throw new Error('CI pipeline contains forbidden Turnstile bypass flag');

  const requiredStages = [
    'Stage 1 · ESLint',
    'Stage 2 · TypeScript',
    'Stage 3 · Vitest',
    'Stage 4 · Build Container',
    'Stage 5 · Verify Edge',
    'Stage 6 · Run A10 Migrations',
    'Stage 7 · Security Pack',
  ];

  let lastIdx = -1;
  for (const stage of requiredStages) {
    const idx = ci.indexOf(stage);
    if (idx === -1) throw new Error(`Missing stage: ${stage}`);
    if (idx < lastIdx) throw new Error(`Stages out of order: ${stage} appeared before previous stage`);
    lastIdx = idx;
  }
});

// 5. CI-02: Parity Proof Negative Mutations
runAuditCheck('CI-02', 'Parity proof verifies pipeline turns RED on security regressions', () => {
  execSync('node tooling/verify/verify-ci-parity-proof.mjs', { stdio: 'pipe' });
});

// 6. TYPE-WEB: Zero TypeScript / Astro Check Errors
runAuditCheck('TYPE-WEB', 'TypeScript compilation and astro check clean across all workspaces', () => {
  execSync('npm run typecheck', { stdio: 'pipe' });
});

// 7. CI-RUN: Pipeline Execution Efficiency
runAuditCheck('CI-RUN', 'Production pipeline timeout strictly capped at <= 20 minutes', () => {
  const ciPath = resolve(process.cwd(), '.github/workflows/ci.yml');
  const ci = readFileSync(ciPath, 'utf8');
  const timeoutMatch = ci.match(/timeout-minutes:\s*(\d+)/g);
  if (!timeoutMatch) throw new Error('Missing timeout-minutes in CI workflow');
  for (const m of timeoutMatch) {
    const val = Number(m.split(':')[1].trim());
    if (val > 20) throw new Error(`Job timeout ${val} exceeds 20 minutes limit (CI-RUN)`);
  }
});

console.log('\n================================================================');
console.log(`MS3.4 Milestone Audit: ${passedChecks}/${totalChecks} checks PASSED (${totalChecks - passedChecks} failed).`);
console.log('================================================================\n');

if (passedChecks !== totalChecks) {
  process.exit(1);
}

console.log('[verify-ms34-audit] SUCCESS: All MS3.4 milestone criteria verified cleanly.');
process.exit(0);
