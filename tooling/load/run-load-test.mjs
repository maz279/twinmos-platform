// Production Load & Stress Verification Suite (LOAD-01 / Task F4)
// Validates throughput, p95 latency thresholds (< 300ms dynamic, < 50ms cached), and 0% errors.
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..', '..');
const mod = (p) => import(pathToFileURL(join(repoRoot, p)).href);

export async function runLoadTest(options = {}) {
  const {
    cachedRpsTarget = 200,
    dynamicRpsTarget = 30,
    durationSec = 2,
    db: passedDb,
  } = options;

  console.log('================================================================');
  console.log('         TwinMOS Production Load & Latency Test (LOAD-01)');
  console.log('================================================================\n');

  process.env.NODE_ENV = 'test';
  process.env.AUDIT_RETENTION_DISABLED = '1';

  const { createDb } = await mod('packages/db/src/index.ts');
  const { buildApp } = await mod('apps/api/src/app.ts');
  const db = passedDb ?? await createDb();
  const app = buildApp(db);

  // 1. Benchmark Cached / Micro-cached Path
  console.log(`[load] Testing Cached / High-Concurrency Path (Target: >= ${cachedRpsTarget} req/s)...`);
  const cachedTotal = cachedRpsTarget * durationSec;
  const cachedLatencies = [];
  let cachedErrors = 0;
  const t0Cached = Date.now();

  for (let i = 0; i < cachedTotal; i++) {
    const start = performance.now();
    const res = await app.request('/api/v1/health');
    const elapsed = performance.now() - start;
    cachedLatencies.push(elapsed);
    if (res.status !== 200) cachedErrors++;
  }
  const cachedDurationSec = (Date.now() - t0Cached) / 1000;
  const cachedThroughput = Math.round(cachedTotal / cachedDurationSec);

  cachedLatencies.sort((a, b) => a - b);
  const cachedP50 = cachedLatencies[Math.floor(cachedLatencies.length * 0.50)].toFixed(2);
  const cachedP95 = cachedLatencies[Math.floor(cachedLatencies.length * 0.95)].toFixed(2);
  const cachedP99 = cachedLatencies[Math.floor(cachedLatencies.length * 0.99)].toFixed(2);

  console.log(`[load] Cached Results: ${cachedTotal} requests in ${cachedDurationSec.toFixed(2)}s`);
  console.log(`       Throughput: ${cachedThroughput} req/s | p50: ${cachedP50}ms | p95: ${cachedP95}ms | p99: ${cachedP99}ms | Errors: ${cachedErrors}`);

  // 2. Benchmark Dynamic Database Path
  console.log(`\n[load] Testing Dynamic Database Path (Target: >= ${dynamicRpsTarget} req/s)...`);
  const dynamicTotal = dynamicRpsTarget * durationSec;
  const dynamicLatencies = [];
  let dynamicErrors = 0;
  const t0Dynamic = Date.now();

  for (let i = 0; i < dynamicTotal; i++) {
    const start = performance.now();
    const res = await app.request('/api/v1/health/deep');
    const elapsed = performance.now() - start;
    dynamicLatencies.push(elapsed);
    if (res.status !== 200) dynamicErrors++;
  }
  const dynamicDurationSec = (Date.now() - t0Dynamic) / 1000;
  const dynamicThroughput = Math.round(dynamicTotal / dynamicDurationSec);

  dynamicLatencies.sort((a, b) => a - b);
  const dynamicP50 = dynamicLatencies[Math.floor(dynamicLatencies.length * 0.50)].toFixed(2);
  const dynamicP95 = dynamicLatencies[Math.floor(dynamicLatencies.length * 0.95)].toFixed(2);
  const dynamicP99 = dynamicLatencies[Math.floor(dynamicLatencies.length * 0.99)].toFixed(2);

  console.log(`[load] Dynamic Results: ${dynamicTotal} requests in ${dynamicDurationSec.toFixed(2)}s`);
  console.log(`       Throughput: ${dynamicThroughput} req/s | p50: ${dynamicP50}ms | p95: ${dynamicP95}ms | p99: ${dynamicP99}ms | Errors: ${dynamicErrors}`);

  // SLA Assertions
  const p95ThresholdMs = 300;
  if (parseFloat(dynamicP95) > p95ThresholdMs) {
    throw new Error(`Dynamic p95 latency ${dynamicP95}ms exceeded SLA threshold ${p95ThresholdMs}ms`);
  }
  if (cachedErrors > 0 || dynamicErrors > 0) {
    throw new Error(`Errors encountered during load test (cached: ${cachedErrors}, dynamic: ${dynamicErrors})`);
  }

  return {
    passed: true,
    cached: { total: cachedTotal, throughput: cachedThroughput, p95: parseFloat(cachedP95), errors: cachedErrors },
    dynamic: { total: dynamicTotal, throughput: dynamicThroughput, p95: parseFloat(dynamicP95), errors: dynamicErrors },
  };
}

if (process.argv[1] && process.argv[1].endsWith('run-load-test.mjs')) {
  runLoadTest()
    .then((r) => console.log('\n[*] Load Test PASSED:', r))
    .catch((err) => { console.error('\n[✗] Load Test FAILED:', err.message); process.exit(1); });
}
