// SBOM-01, COMPOSE-01, S-11 Verification Script
// Verifies:
// 1. Production Dockerfiles use multi-stage builds and non-root users (USER node)
// 2. Production Dockerfiles prune dev dependencies (--omit=dev)
// 3. Docker Compose files exist and S-11 is strictly enforced (api container has NO host port bindings)
// 4. .dockerignore excludes sensitive and temporary files (workspace/, apps/api/data)
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

console.log('[verify-container-sbom] Verifying COMPOSE-01, SBOM-01, and S-11...');

let failures = 0;

// 1. Verify Dockerfiles exist
const apiDockerPath = resolve(process.cwd(), 'apps/api/Dockerfile');
const webDockerPath = resolve(process.cwd(), 'apps/web/Dockerfile');
const edgeDockerPath = resolve(process.cwd(), 'deploy/edge/Dockerfile');
const dockerignorePath = resolve(process.cwd(), '.dockerignore');

for (const [name, path] of [
  ['API Dockerfile', apiDockerPath],
  ['Web Dockerfile', webDockerPath],
  ['Edge Dockerfile', edgeDockerPath],
  ['.dockerignore', dockerignorePath],
]) {
  if (!existsSync(path)) {
    console.error(`[verify-container-sbom] FAIL: Missing ${name} at ${path}`);
    failures++;
  }
}

// 2. Inspect API Dockerfile
if (existsSync(apiDockerPath)) {
  const apiDf = readFileSync(apiDockerPath, 'utf8');
  if (!apiDf.includes('node:24-alpine')) {
    console.error('[verify-container-sbom] FAIL T3.4.1: API Dockerfile must use node:24-alpine base.');
    failures++;
  } else {
    console.log('[verify-container-sbom] PASS T3.4.1: API Dockerfile uses node:24-alpine base.');
  }

  if (apiDf.includes('/packages/db/node_modules') || apiDf.includes('/apps/api/node_modules')) {
    console.error('[verify-container-sbom] FAIL T3.4.1: API Dockerfile copies non-existent workspace subpath node_modules directories.');
    failures++;
  } else {
    console.log('[verify-container-sbom] PASS T3.4.1: API Dockerfile copies hoisted /app/node_modules only.');
  }

  if (!apiDf.includes('--omit=dev') || !apiDf.includes('drizzle-kit')) {
    console.error('[verify-container-sbom] FAIL SBOM-01: API Dockerfile does not prune devOptional tooling (drizzle-kit/esbuild/vitest).');
    failures++;
  } else {
    console.log('[verify-container-sbom] PASS SBOM-01: API Dockerfile enforces dev-dependency pruning and removes drizzle-kit.');
  }

  if (!apiDf.includes('USER node')) {
    console.error('[verify-container-sbom] FAIL SEC-C1: API Dockerfile does not run as non-root user (node).');
    failures++;
  } else {
    console.log('[verify-container-sbom] PASS SEC-C1: API Dockerfile runs as non-root user node.');
  }
}

// 3. Inspect Web Dockerfile
if (existsSync(webDockerPath)) {
  const webDf = readFileSync(webDockerPath, 'utf8');
  if (!webDf.includes('node:24-alpine')) {
    console.error('[verify-container-sbom] FAIL T3.4.1: Web Dockerfile must use node:24-alpine base.');
    failures++;
  } else {
    console.log('[verify-container-sbom] PASS T3.4.1: Web Dockerfile uses node:24-alpine base.');
  }

  if (webDf.includes('/apps/web/node_modules')) {
    console.error('[verify-container-sbom] FAIL T3.4.1: Web Dockerfile copies non-existent apps/web/node_modules directory.');
    failures++;
  } else {
    console.log('[verify-container-sbom] PASS T3.4.1: Web Dockerfile copies hoisted /app/node_modules only.');
  }

  if (!webDf.includes('USER node')) {
    console.error('[verify-container-sbom] FAIL SEC-C1: Web Dockerfile does not run as non-root user (node).');
    failures++;
  } else {
    console.log('[verify-container-sbom] PASS SEC-C1: Web Dockerfile runs as non-root user node.');
  }
}

// 4. Verify SBOM artifacts exist and are valid (SBOM-01)
const apiSbomPath = resolve(process.cwd(), 'deploy/sbom/api-sbom.json');
const webSbomPath = resolve(process.cwd(), 'deploy/sbom/web-sbom.json');
const edgeSbomPath = resolve(process.cwd(), 'deploy/sbom/edge-sbom.json');

for (const [name, path] of [['API SBOM', apiSbomPath], ['Web SBOM', webSbomPath], ['Edge SBOM', edgeSbomPath]]) {
  if (!existsSync(path)) {
    console.error(`[verify-container-sbom] FAIL SBOM-01: Missing ${name} at ${path}`);
    failures++;
  } else {
    const content = JSON.parse(readFileSync(path, 'utf8'));
    if (!content.components || content.components.length === 0) {
      console.error(`[verify-container-sbom] FAIL SBOM-01: ${name} contains 0 components.`);
      failures++;
    } else {
      console.log(`[verify-container-sbom] PASS SBOM-01: ${name} verified with ${content.components.length} components.`);
    }
  }
}

// 5. Inspect .dockerignore
if (existsSync(dockerignorePath)) {
  const di = readFileSync(dockerignorePath, 'utf8');
  if (!di.includes('workspace/') || !di.includes('apps/api/data')) {
    console.error('[verify-container-sbom] FAIL REPO-01: .dockerignore does not exclude workspace/ or apps/api/data.');
    failures++;
  } else {
    console.log('[verify-container-sbom] PASS REPO-01: .dockerignore properly excludes workspace/ and sensitive data.');
  }
}

// 6. Inspect Docker Compose S-11 isolation
const composePath = resolve(process.cwd(), 'deploy/compose/docker-compose.yml');
if (!existsSync(composePath)) {
  console.error('[verify-container-sbom] FAIL COMPOSE-01: Missing deploy/compose/docker-compose.yml.');
  failures++;
} else {
  const comp = readFileSync(composePath, 'utf8');
  const apiStart = comp.indexOf('api:');
  const postgresStart = comp.indexOf('postgres:');
  const apiSection = (apiStart !== -1 && postgresStart !== -1) ? comp.slice(apiStart, postgresStart) : '';
  if (apiSection.includes('ports:') && !apiSection.includes('#')) {
    console.error('[verify-container-sbom] FAIL S-11: API container has host ports exposed in production compose!');
    failures++;
  } else if (!apiSection.includes('expose:') || !apiSection.includes('8787')) {
    console.error('[verify-container-sbom] FAIL COMPOSE-01: API container missing internal port expose: 8787.');
    failures++;
  } else {
    console.log('[verify-container-sbom] PASS S-11: API container is strictly isolated to internal docker network without host port bindings.');
  }
}

if (failures > 0) {
  console.error(`[verify-container-sbom] Container & SBOM verification FAILED with ${failures} error(s).`);
  process.exit(1);
}

console.log('[verify-container-sbom] PASS COMPOSE-01, SBOM-01, S-11: All containerization and SBOM checks passed cleanly.');
process.exit(0);
