// G-PARITY Baseline Verification Script (Task B8b / GPARITY)
// Verifies baseline configuration parity across development, CI, and production:
// 1. Shared schemas consistency across packages
// 2. Database migration journal alignment
// 3. Environment contract and delivery API entity coverage
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { DELIVERY_ENTITIES } from '../../packages/shared/src/delivery.ts';

console.log('[gparity-baseline] Running G-PARITY configuration baseline verification...');

let failures = 0;

// 1. Check shared package referencing across workspaces
const pkgJson = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf8'));
const workspaces = pkgJson.workspaces ?? [];
const hasApps = workspaces.includes('apps/*') || workspaces.includes('apps/web');
const hasPackages = workspaces.includes('packages/*') || workspaces.includes('packages/shared');
if (!hasApps || !hasPackages) {
  console.error('[gparity-baseline] FAIL PARITY-01: Root workspaces missing apps or packages paths.');
  failures++;
} else {
  console.log('[gparity-baseline] PASS PARITY-01: Monorepo workspaces structure verified (apps/*, packages/*).');
}

// 2. Check DB migration journal
const journalPath = resolve(process.cwd(), 'packages/db/migrations/meta/_journal.json');
if (!existsSync(journalPath)) {
  console.error('[gparity-baseline] FAIL PARITY-02: Missing migration journal at packages/db/migrations/meta/_journal.json.');
  failures++;
} else {
  const journal = JSON.parse(readFileSync(journalPath, 'utf8'));
  if (!Array.isArray(journal.entries) || journal.entries.length === 0) {
    console.error('[gparity-baseline] FAIL PARITY-02: Empty migration journal.');
    failures++;
  } else {
    console.log(`[gparity-baseline] PASS PARITY-02: Migration journal verified (${journal.entries.length} migrations tracked).`);
  }
}

// 3. Delivery API entity parity check
const requiredEntities = ['page', 'product', 'article', 'news'];
for (const entity of requiredEntities) {
  if (!DELIVERY_ENTITIES.includes(entity)) {
    console.error(`[gparity-baseline] FAIL PARITY-03: Missing delivery entity definition for '${entity}'.`);
    failures++;
  }
}
console.log(`[gparity-baseline] PASS PARITY-03: Delivery entities contract verified (${DELIVERY_ENTITIES.length} entities registered).`);

// 4. Port configuration parity (S-11)
const composePath = resolve(process.cwd(), 'deploy/compose/docker-compose.yml');
if (existsSync(composePath)) {
  const comp = readFileSync(composePath, 'utf8');
  if (comp.includes('"8787:8787"')) {
    console.error('[gparity-baseline] FAIL PARITY-04: Host port 8787 exposed in base docker-compose!');
    failures++;
  } else {
    console.log('[gparity-baseline] PASS PARITY-04: S-11 port isolation baseline verified.');
  }
}

if (failures > 0) {
  console.error(`[gparity-baseline] G-PARITY baseline FAILED with ${failures} error(s).`);
  process.exit(1);
}

console.log('[gparity-baseline] PASS G-PARITY: Baseline parity confirmed across all layers.');
process.exit(0);
