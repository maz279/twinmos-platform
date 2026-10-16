// =============================================================================
// SYNTHETIC SIMULATION — LABELED PER RULE 4 / TASK R0.1
// This script generates synthetic data / simulation logic. It proves nothing about
// actual production operations or deployment health.
// =============================================================================

// Failure Injection & System Resilience Drill (LOAD-01 / Task F4)
// Validates graceful degradation under backend impairment and automatic recovery.
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..', '..');
const mod = (p) => import(pathToFileURL(join(repoRoot, p)).href);

export async function runResilienceDrill(options = {}) {
  console.log('--- Starting Failure Injection & Resilience Drill ---');

  process.env.NODE_ENV = 'test';
  process.env.AUDIT_RETENTION_DISABLED = '1';

  const { createDb } = await mod('packages/db/src/index.ts');
  const { buildApp } = await mod('apps/api/src/app.ts');
  const realDb = options.db ?? await createDb();

  // 1. Baseline Healthy State
  const healthyApp = buildApp(realDb);
  const baselineRes = await healthyApp.request('/api/v1/health');
  if (baselineRes.status !== 200) throw new Error(`Baseline health failed: status ${baselineRes.status}`);

  // 2. Failure Injection: Broken DB Handle simulating database network cut/crash
  console.log('[resilience] Injecting simulated database outage...');
  let shouldFail = true;
  const resilientDbProxy = new Proxy(realDb, {
    get(target, prop) {
      if (prop === 'execute') {
        return async (...args) => {
          if (shouldFail) throw new Error('connection closed by remote peer (simulated outage)');
          return target.execute(...args);
        };
      }
      return target[prop];
    },
  });

  const resilientApp = buildApp(resilientDbProxy);
  const degradedRes = await resilientApp.request('/api/v1/health');
  if (degradedRes.status !== 503) {
    throw new Error(`Expected 503 during simulated DB failure, got ${degradedRes.status}`);
  }
  const degradedJson = await degradedRes.json();
  if (degradedJson.status !== 'degraded' || degradedJson.db !== 'unreachable') {
    throw new Error(`Unexpected degradation response: ${JSON.stringify(degradedJson)}`);
  }

  const degradedDeep = await resilientApp.request('/api/v1/health/deep');
  if (degradedDeep.status !== 503) {
    throw new Error(`Expected 503 deep health during simulated outage, got ${degradedDeep.status}`);
  }

  // 3. Recovery: Restore DB connectivity without process reboot
  console.log('[resilience] Restoring database connectivity (reconnect simulation)...');
  shouldFail = false;

  const recoveredRes = await resilientApp.request('/api/v1/health');
  if (recoveredRes.status !== 200) {
    throw new Error(`Health failed to recover automatically: status ${recoveredRes.status}`);
  }
  const recoveredJson = await recoveredRes.json();
  if (recoveredJson.status !== 'ok' || recoveredJson.db !== 'connected') {
    throw new Error(`Unexpected recovered response: ${JSON.stringify(recoveredJson)}`);
  }

  const recoveredDeep = await resilientApp.request('/api/v1/health/deep');
  if (recoveredDeep.status !== 200) {
    throw new Error(`Deep health failed to recover: status ${recoveredDeep.status}`);
  }

  console.log('--- Resilience Drill Passed (Zero Process Restart Required) ---');
  return {
    passed: true,
    degradedStatusCode: 503,
    recoveredStatusCode: 200,
  };
}

if (process.argv[1] && process.argv[1].endsWith('resilience-drill.mjs')) {
  runResilienceDrill()
    .then((r) => console.log('[*] Resilience Result:', r))
    .catch((err) => { console.error('[✗] Drill Failed:', err); process.exit(1); });
}

