// Gate F Check RUN-01: Operational Runbooks & Documentation Alignment Audit
// Verifies deployment runbooks, rollback, secrets rotation, incident post-mortem, and spec alignment (NF-38, NEW-07).
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..', '..');

export async function verifyRUN01() {
  // 1. Verify DEPLOY.md
  const deployPath = resolve(repoRoot, 'docs', 'runbooks', 'DEPLOY.md');
  if (!existsSync(deployPath)) throw new Error('Missing docs/runbooks/DEPLOY.md');
  const deployContent = readFileSync(deployPath, 'utf8');
  if (!deployContent.includes('Postgres 18') && !deployContent.includes('PostgreSQL 18')) {
    throw new Error('docs/runbooks/DEPLOY.md missing pinned PostgreSQL 18 reference');
  }
  if (!deployContent.includes('BOOTSTRAP_SEED=1')) {
    throw new Error('docs/runbooks/DEPLOY.md missing BOOTSTRAP_SEED=1 initialization');
  }

  // 2. Verify ROLLBACK.md
  const rollbackPath = resolve(repoRoot, 'docs', 'runbooks', 'ROLLBACK.md');
  if (!existsSync(rollbackPath)) throw new Error('Missing docs/runbooks/ROLLBACK.md');
  const rollbackContent = readFileSync(rollbackPath, 'utf8');
  if (!rollbackContent.includes('symlink') || !rollbackContent.includes('health/deep')) {
    throw new Error('docs/runbooks/ROLLBACK.md missing symlink or verification steps');
  }

  // 3. Verify SECRETS.md
  const secretsPath = resolve(repoRoot, 'docs', 'runbooks', 'SECRETS.md');
  if (!existsSync(secretsPath)) throw new Error('Missing docs/runbooks/SECRETS.md');
  const secretsContent = readFileSync(secretsPath, 'utf8');
  if (!secretsContent.includes('BETTER_AUTH_SECRET') || !secretsContent.includes('Dual-Key') || !secretsContent.includes('rotate-secrets.mjs')) {
    throw new Error('docs/runbooks/SECRETS.md missing dual-key rotation procedure');
  }

  // 4. Verify INCIDENT.md
  const incidentPath = resolve(repoRoot, 'docs', 'runbooks', 'INCIDENT.md');
  if (!existsSync(incidentPath)) throw new Error('Missing docs/runbooks/INCIDENT.md');
  const incidentContent = readFileSync(incidentPath, 'utf8');
  if (!incidentContent.includes('P1 - Critical') || !incidentContent.includes('5 Whys')) {
    throw new Error('docs/runbooks/INCIDENT.md missing severity matrix or RCA post-mortem template');
  }

  // 5. Verify OBSERVABILITY.md
  const obsPath = resolve(repoRoot, 'docs', 'runbooks', 'OBSERVABILITY.md');
  if (!existsSync(obsPath)) throw new Error('Missing docs/runbooks/OBSERVABILITY.md');

  // 6. Verify docs/04-ADMIN-CMS-SPEC.md (NF-38, NEW-07)
  const specPath = resolve(repoRoot, 'docs', '04-ADMIN-CMS-SPEC.md');
  if (!existsSync(specPath)) throw new Error('Missing docs/04-ADMIN-CMS-SPEC.md');
  const specContent = readFileSync(specPath, 'utf8');
  if (!specContent.includes('NEW-07') || !specContent.includes('requireRole()')) {
    throw new Error('docs/04-ADMIN-CMS-SPEC.md missing NEW-07 requireRole() resolution');
  }
  if (!specContent.includes('NF-38')) {
    throw new Error('docs/04-ADMIN-CMS-SPEC.md missing NF-38 configuration note');
  }

  // 7. Verify OpenAPI 3.1 Specification
  const openApiPath = resolve(repoRoot, 'docs', 'api', 'openapi.json');
  if (!existsSync(openApiPath)) throw new Error('Missing docs/api/openapi.json');
  const openApiRaw = readFileSync(openApiPath, 'utf8');
  let openApiJson;
  try {
    openApiJson = JSON.parse(openApiRaw);
  } catch {
    throw new Error('docs/api/openapi.json contains invalid JSON');
  }
  if (openApiJson.openapi !== '3.1.0' || !openApiJson.paths['/health/deep']) {
    throw new Error('docs/api/openapi.json missing version 3.1.0 or core endpoints');
  }

  return 'PASS (DEPLOY.md, ROLLBACK.md, SECRETS.md, INCIDENT.md, OBSERVABILITY.md, 04-ADMIN-CMS-SPEC NF-38/NEW-07, and OpenAPI 3.1 verified)';
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  verifyRUN01()
    .then((msg) => { console.log('[*] RUN-01:', msg); process.exit(0); })
    .catch((err) => { console.error('[✗] RUN-01 FAILED:', err.message); process.exit(1); });
}
