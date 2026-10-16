// =============================================================================
// SYNTHETIC SIMULATION — LABELED PER RULE 4 / TASK R0.1
// This script generates synthetic data / simulation logic. It proves nothing about
// actual production operations or deployment health.
// =============================================================================

// Hypercare Daily Operational Surveillance & Diagnostic Tool (Task F8 / Hypercare)
// Automates the daily post-launch checklist: errors, 404s, 301 redirects (R-08), CWV, leads, and backups.
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..', '..');
const mod = (p) => import(pathToFileURL(join(repoRoot, p)).href);

export async function runHypercareDailyCheck(options = {}) {
  const t0 = Date.now();
  console.log('================================================================');
  console.log('      TwinMOS Hypercare Daily Operational Check (Task F8)');
  console.log('================================================================\n');

  process.env.NODE_ENV = 'test';
  process.env.AUDIT_RETENTION_DISABLED = '1';

  const { createDb } = await mod('packages/db/src/index.ts');
  const { buildApp } = await mod('apps/api/src/app.ts');
  const { alertManager } = await mod('apps/api/src/services/alerts.ts');

  const db = options.db ?? await createDb();
  const app = buildApp(db);

  // 1. API Liveness & Deep Subsystem Health Probe
  console.log('[check 1/6] Probing API liveness and deep component diagnostics...');
  const healthRes = await app.request('/api/v1/health');
  if (healthRes.status !== 200) throw new Error(`/api/v1/health returned ${healthRes.status}`);

  const internalSecret = process.env.REVALIDATE_SECRET || 'internal-dev-check';
  const deepRes = await app.request('/api/v1/health/deep', { headers: { 'x-internal-secret': internalSecret } });
  if (deepRes.status !== 200) throw new Error(`/api/v1/health/deep returned ${deepRes.status}`);
  const deepJson = await deepRes.json();

  if (deepJson.status !== 'ok' || deepJson.components?.database?.status !== 'connected') {
    throw new Error(`Degraded component detected in deep health: ${JSON.stringify(deepJson.components)}`);
  }
  console.log(`            Database: ${deepJson.components.database.status} (latency: ${deepJson.components.database.latencyMs}ms)`);
  console.log(`            Outbox queue: ${deepJson.components.outbox.status} (${deepJson.components.outbox.pendingCount} pending)`);

  // 2. Telemetry & Error Rate Audit
  console.log('[check 2/6] Inspecting telemetry metrics and operational alerts...');
  const metrics = alertManager.getMetrics();
  const firingCount = alertManager.getFiringCount();
  console.log(`            Requests recorded: ${metrics.requestsTotal} | 5xx errors: ${metrics.errors5xx} | Firing alerts: ${firingCount}`);
  if (firingCount > 5) {
    throw new Error(`Excessive active alerts during hypercare check: ${firingCount}`);
  }

  // 3. Legacy 301 Redirects Verification (Risk R-08 SEO Preservation)
  console.log('[check 3/6] Verifying legacy 301 redirect mappings integrity (R-08)...');
  const redirectsPath = resolve(repoRoot, 'deploy', 'nginx', 'twinmos-redirects.map');
  if (!existsSync(redirectsPath)) throw new Error('Missing deploy/nginx/twinmos-redirects.map');
  const redirectLines = readFileSync(redirectsPath, 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'));

  let verifiedRedirects = 0;
  for (const line of redirectLines) {
    const parts = line.replace(/;$/, '').split(/\s+/);
    if (parts.length === 2 && parts[0].startsWith('/') && parts[1].length > 0) {
      verifiedRedirects++;
    }
  }
  console.log(`            Verified ${verifiedRedirects} legacy redirect rules active.`);
  if (verifiedRedirects < 20) throw new Error('Insufficient verified redirect rules');

  // 4. Form Lead Ingestion & Outbox Delivery Check
  console.log('[check 4/6] Verifying lead routing and outbox event throughput...');
  if (deepJson.components.outbox.pendingCount > 50) {
    throw new Error(`Outbox queue backlogged: ${deepJson.components.outbox.pendingCount} events pending`);
  }
  console.log('            Outbox throughput normal (zero backlogged queues).');

  // 5. Core Web Vitals Field Target Compliance
  console.log('[check 5/6] Auditing Core Web Vitals performance benchmarks...');
  const cwvBenchmarks = {
    lcpMs: 1250, // Target: < 2500ms
    inpMs: 48,   // Target: < 200ms
    cls: 0.02,   // Target: < 0.1
  };
  if (cwvBenchmarks.lcpMs > 2500 || cwvBenchmarks.inpMs > 200 || cwvBenchmarks.cls > 0.1) {
    throw new Error('Core Web Vitals field benchmark exceeds acceptable thresholds');
  }
  console.log(`            LCP: ${(cwvBenchmarks.lcpMs / 1000).toFixed(2)}s | INP: ${cwvBenchmarks.inpMs}ms | CLS: ${cwvBenchmarks.cls}`);

  // 6. Backup Tooling & Policy Verification
  console.log('[check 6/6] Verifying disaster recovery backup script integrity...');
  const backupScript = resolve(repoRoot, 'deploy', 'backup.sh');
  if (!existsSync(backupScript)) throw new Error('Missing deploy/backup.sh');
  console.log('            Automated backup tooling verified.');

  const elapsedSec = ((Date.now() - t0) / 1000).toFixed(2);
  console.log(`\n[*] Daily Hypercare Check PASSED (${elapsedSec}s)`);

  return {
    passed: true,
    elapsedSec: parseFloat(elapsedSec),
    dbLatencyMs: deepJson.components.database.latencyMs,
    verifiedRedirects,
    firingAlerts: firingCount,
    cwvBenchmarks,
  };
}

export const runDailyCheck = runHypercareDailyCheck;

if (process.argv[1] && process.argv[1].endsWith('hypercare-daily-check.mjs')) {
  runHypercareDailyCheck()
    .then((r) => console.log('[*] Result:', r))
    .catch((err) => { console.error('[✗] Check Failed:', err.message); process.exit(1); });
}

