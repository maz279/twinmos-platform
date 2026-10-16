// Gate F Check LOAD-01: Load & Resilience Test Verification
// Validates concurrency, throughput, p95 latency (< 300ms), error rates, resilience recovery, and VM sizing documentation.
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runLoadTest } from '../load/run-load-test.mjs';
import { runResilienceDrill } from '../ops/resilience-drill.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..', '..');
const mod = (p) => import(pathToFileURL(join(repoRoot, p)).href);

export async function verifyLOAD01() {
  const { createDb } = await mod('packages/db/src/index.ts');
  const db = await createDb();

  // 1. Run Load & Concurrency Benchmark
  const loadResult = await runLoadTest({
    db,
    cachedRpsTarget: 100,
    dynamicRpsTarget: 25,
    durationSec: 1,
  });
  if (!loadResult.passed || loadResult.dynamic.p95 > 300 || loadResult.dynamic.errors > 0) {
    throw new Error(`Load benchmark failed SLA: p95=${loadResult.dynamic.p95}ms, errors=${loadResult.dynamic.errors}`);
  }

  // 2. Run Failure Injection & Resilience Recovery Drill
  const resilienceResult = await runResilienceDrill({ db });
  if (!resilienceResult.passed || resilienceResult.degradedStatusCode !== 503 || resilienceResult.recoveredStatusCode !== 200) {
    throw new Error('Resilience drill failed: did not cleanly degrade to 503 and recover to 200');
  }

  // 3. Verify VM Sizing Decision Document
  const docPath = resolve(repoRoot, 'docs', 'reports', 'VM_SIZING_DECISION.md');
  if (!existsSync(docPath)) throw new Error('Missing docs/reports/VM_SIZING_DECISION.md');
  const docContent = readFileSync(docPath, 'utf8');
  if (!docContent.includes('4 vCPU') || !docContent.includes('8 GB') || !docContent.includes('200 req/s')) {
    throw new Error('docs/reports/VM_SIZING_DECISION.md missing required sizing and workload declarations');
  }

  return `PASS (Load test dynamic p95=${loadResult.dynamic.p95}ms, resilience drill recovery 503->200, and VM sizing report verified)`;
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  verifyLOAD01()
    .then((msg) => { console.log('[*] LOAD-01:', msg); process.exit(0); })
    .catch((err) => { console.error('[✗] LOAD-01 FAILED:', err.message); process.exit(1); });
}
