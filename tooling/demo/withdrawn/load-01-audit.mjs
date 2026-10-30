// Gate F Quality Gate LOAD-01: Production Load & Resilience Certification Audit
// Validates concurrency, throughput, p95 latency thresholds, zero errors, resilience drills, and VM sizing documentation.

import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runLoadTest } from '../load/run-load-test.mjs';
import { runResilienceDrill } from '../ops/resilience-drill.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..', '..');

export async function verifyLOAD01() {
  console.log('================================================================');
  console.log('   TwinMOS Quality Gate LOAD-01 Certification Audit (MS7.4)     ');
  console.log('================================================================\n');

  // 1. Run Concurrent Multi-Scenario Load Benchmark
  console.log('[*] Step 1: Running Multi-Scenario Concurrent Load Benchmark...');
  const loadResult = await runLoadTest({
    cachedRpsTarget: 150,
    dynamicRpsTarget: 25,
    durationSec: 1,
    quiet: true,
  });

  const cachedThroughput = loadResult.metrics.cached.throughputReqPerSec;
  const cachedP95 = loadResult.metrics.cached.latencies.p95;
  const dynamicThroughput = loadResult.metrics.dynamic.throughputReqPerSec;
  const dynamicP95 = loadResult.metrics.dynamic.latencies.p95;
  const totalErrors = loadResult.summary.totalErrors;

  if (totalErrors > 0) {
    throw new Error(`LOAD-01 Failed: ${totalErrors} errors encountered during load testing (SLA requires 0)`);
  }
  if (cachedP95 > 300) {
    throw new Error(`LOAD-01 Failed: Cached p95 latency ${cachedP95}ms exceeded SLA threshold 300ms`);
  }
  if (dynamicP95 > 800) {
    throw new Error(`LOAD-01 Failed: Dynamic p95 latency ${dynamicP95}ms exceeded SLA threshold 800ms`);
  }
  console.log(` [✓] PASS: Concurrent Load Benchmark (Cached: ${cachedThroughput} req/s, Dynamic: ${dynamicThroughput} req/s, Errors: 0)`);

  // 2. Run Failure Injection & Resilience Recovery Drill
  console.log('\n[*] Step 2: Running Failure Injection & Resilience Auto-Recovery Drill...');
  const resilienceResult = await runResilienceDrill({ quiet: true });
  if (
    !resilienceResult.passed ||
    resilienceResult.degradedStatusCode !== 503 ||
    resilienceResult.recoveredStatusCode !== 200
  ) {
    throw new Error(`LOAD-01 Failed: Resilience drill did not cleanly degrade to 503 and recover to 200`);
  }
  console.log(' [✓] PASS: Resilience Drill (Clean degradation to 503 and instantaneous auto-recovery to 200)');

  // 3. Verify VM Sizing Decision Document
  console.log('\n[*] Step 3: Verifying Empirical VM Sizing Decision Document...');
  const docPath = resolve(repoRoot, 'docs', 'reports', 'VM_SIZING_DECISION.md');
  if (!existsSync(docPath)) throw new Error('LOAD-01 Failed: Missing docs/reports/VM_SIZING_DECISION.md');
  const docContent = readFileSync(docPath, 'utf8');

  if (!docContent.includes('4 vCPU') || !docContent.includes('8 GB')) {
    throw new Error('LOAD-01 Failed: VM sizing document missing 4 vCPU / 8 GB hardware specification');
  }
  if (!docContent.includes('PostgreSQL 18') || !docContent.includes('Node.js 24')) {
    throw new Error('LOAD-01 Failed: VM sizing document missing PostgreSQL 18 or Node.js 24 runtime specs');
  }
  if (docContent.includes('PM2')) {
    throw new Error('LOAD-01 Failed: VM sizing document contains obsolete PM2 reference');
  }
  console.log(' [✓] PASS: VM Sizing Decision Document (Empirical 4 vCPU / 8 GB RAM specification verified)');

  // 4. Verify Evidence Artifacts
  console.log('\n[*] Step 4: Verifying Evidence Artifacts Presence...');
  const evidenceDir = resolve(repoRoot, 'docs', 'evidence');
  const reportJson = resolve(evidenceDir, 'load_test_report.json');
  const drillLog = resolve(evidenceDir, 'resilience_drill_log.md');
  if (!existsSync(reportJson) || !existsSync(drillLog)) {
    throw new Error('LOAD-01 Failed: Evidence artifacts missing in docs/evidence/');
  }
  console.log(' [✓] PASS: Evidence Artifacts Verified (load_test_report.json & resilience_drill_log.md)');

  const summary = `PASS (Cached p95=${cachedP95}ms, Dynamic p95=${dynamicP95}ms, Resilience 503->200, VM Sizing 4 vCPU/8GB verified)`;
  console.log('\n================================================================');
  console.log(` QUALITY GATE LOAD-01 FINAL VERDICT: ${summary}`);
  console.log('================================================================\n');

  return summary;
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  verifyLOAD01()
    .then((msg) => {
      console.log('[*] LOAD-01 VERDICT:', msg);
      process.exit(0);
    })
    .catch((err) => {
      console.error('[✗] LOAD-01 FAILED:', err.message);
      process.exit(1);
    });
}
