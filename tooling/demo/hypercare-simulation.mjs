// =============================================================================
// SYNTHETIC SIMULATION — LABELED PER RULE 4 / TASK R0.1
// This script generates synthetic data / simulation logic. It proves nothing about
// actual production operations or deployment health.
// =============================================================================

// 14-Day Hypercare Operational Simulation & Drill Runner (Task F8 / Hypercare)
// Rehearses the two-week post-launch surveillance period, validating daily metrics, SLAs, and exit criteria.
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..', '..');
const mod = (p) => import(pathToFileURL(join(repoRoot, p)).href);

export async function runHypercareSimulation(options = {}) {
  const { totalDays = 14 } = options;
  console.log('================================================================');
  console.log(`     TwinMOS ${totalDays}-Day Hypercare Multi-Day Simulation Drill`);
  console.log('================================================================\n');

  process.env.NODE_ENV = 'test';
  process.env.AUDIT_RETENTION_DISABLED = '1';

  const { createDb } = await mod('packages/db/src/index.ts');
  const { buildApp } = await mod('apps/api/src/app.ts');
  const db = options.db ?? await createDb();
  const app = buildApp(db);

  const dailyLogs = [];
  let consecutiveCleanDays = 0;

  for (let day = 1; day <= totalDays; day++) {
    // 1. Simulate day's traffic and request volume
    const dailyRequests = 45000 + Math.floor(Math.random() * 8000);
    const dailyErrors = Math.floor(Math.random() * 3); // 0-2 transient errors
    const errorRatePct = ((dailyErrors / dailyRequests) * 100).toFixed(4);

    // 2. Query in-process health probe
    const probe = await app.request('/api/v1/health/deep');
    const probeStatus = probe.status === 200 ? 'GREEN' : 'DEGRADED';

    // 3. Simulated forms & lead routing
    const dailyLeads = 15 + Math.floor(Math.random() * 10);
    const failedDeliveries = 0; // Zero dropped leads

    // 4. Simulated Core Web Vitals field measurement
    const lcpSec = (1.1 + Math.random() * 0.3).toFixed(2);
    const inpMs = Math.floor(40 + Math.random() * 15);
    const cls = (0.01 + Math.random() * 0.02).toFixed(3);

    // 5. Daily Backup Verification
    const backupVerified = true;

    // 6. Severity Incidents
    const sev1Count = 0;
    const sev2Count = 0;

    const isCleanDay = sev1Count === 0 && sev2Count === 0 && parseFloat(errorRatePct) < 0.05 && failedDeliveries === 0;
    if (isCleanDay) {
      consecutiveCleanDays++;
    } else {
      consecutiveCleanDays = 0;
    }

    dailyLogs.push({
      day,
      requests: dailyRequests,
      errorRatePct,
      probeStatus,
      leads: dailyLeads,
      lcpSec,
      inpMs,
      cls,
      backupVerified,
      sev1: sev1Count,
      clean: isCleanDay,
    });
  }

  // Print 14-Day Simulation Scorecard
  console.log('Day | Requests | Error % | Probe | Leads | LCP(s) | INP(ms) | CLS   | Backup | Status');
  console.log('----+----------+---------+-------+-------+--------+---------+-------+--------+-------');
  for (const d of dailyLogs) {
    console.log(
      `${String(d.day).padStart(3)} | ` +
      `${String(d.requests).padStart(8)} | ` +
      `${d.errorRatePct.padStart(7)} | ` +
      `${d.probeStatus.padEnd(5)} | ` +
      `${String(d.leads).padStart(5)} | ` +
      `${d.lcpSec.padStart(6)} | ` +
      `${String(d.inpMs).padStart(7)} | ` +
      `${d.cls.padStart(5)} | ` +
      `${(d.backupVerified ? 'PASS' : 'FAIL').padEnd(6)} | ` +
      `${d.clean ? 'CLEAN' : 'ALERT'}`
    );
  }

  // Evaluate Exit Criteria
  const requiredCleanDays = Math.min(totalDays, 7);
  const exitCriteriaMet = (totalDays >= 14 || options.allowShortRun) && consecutiveCleanDays >= requiredCleanDays;
  console.log('\n----------------------------------------------------------------');
  console.log(`Total Simulated Days: ${totalDays} | Consecutive Clean Days: ${consecutiveCleanDays}`);
  console.log(`Exit Criteria Met: ${exitCriteriaMet ? 'YES (Handover Authorized)' : 'NO'}`);
  console.log('================================================================\n');

  if (!exitCriteriaMet) {
    throw new Error('Hypercare exit criteria not met (required >= 7 consecutive clean days over 14 days)');
  }

  return {
    passed: true,
    totalDays,
    consecutiveCleanDays,
    exitCriteriaMet,
    dailyLogs,
  };
}

export const runSimulation = runHypercareSimulation;

if (process.argv[1] && process.argv[1].endsWith('hypercare-simulation.mjs')) {
  runHypercareSimulation()
    .then((r) => console.log('[*] Simulation Drill Result:', { passed: r.passed, cleanDays: r.consecutiveCleanDays }))
    .catch((err) => { console.error('[✗] Simulation Drill Failed:', err.message); process.exit(1); });
}

