// Task F8 Audit: Hypercare Operations, Surveillance, Simulation & Handover Audit
// Verifies HYPERCARE.md runbook, HYPERCARE_EXIT_REPORT.md acceptance deliverable,
// hypercare-daily-check automation, and 14-day multi-day simulation drill.
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..', '..');
const mod = (p) => import(pathToFileURL(join(repoRoot, p)).href);

export async function verifyHypercareF8() {
  process.env.NODE_ENV = 'test';
  process.env.AUDIT_RETENTION_DISABLED = '1';

  // 1. Verify docs/runbooks/HYPERCARE.md
  const runbookPath = resolve(repoRoot, 'docs', 'runbooks', 'HYPERCARE.md');
  if (!existsSync(runbookPath)) {
    throw new Error('Missing docs/runbooks/HYPERCARE.md');
  }
  const runbookContent = readFileSync(runbookPath, 'utf8');
  const requiredRunbookKeywords = [
    'On-Call Roster',
    'Daily Triage Checklist',
    'R-08',
    'Legacy 301 Redirect Monitoring',
    'Incident Playbooks',
    'Spike in 404 Errors',
    'Form Submission / Relay Stall',
    'WAF Bot / DDoS Attack',
    'Core Web Vitals Regression',
    'Exit Criteria',
    'Handover Sign-Off',
  ];
  for (const kw of requiredRunbookKeywords) {
    if (!runbookContent.includes(kw)) {
      throw new Error(`docs/runbooks/HYPERCARE.md missing keyword: "${kw}"`);
    }
  }

  // 2. Verify docs/reports/HYPERCARE_EXIT_REPORT.md
  const reportPath = resolve(repoRoot, 'docs', 'reports', 'HYPERCARE_EXIT_REPORT.md');
  if (!existsSync(reportPath)) {
    throw new Error('Missing docs/reports/HYPERCARE_EXIT_REPORT.md');
  }
  const reportContent = readFileSync(reportPath, 'utf8');
  const requiredReportKeywords = [
    'Executive Summary',
    '14-Day Operational Telemetry',
    'Risk R-08',
    'Customer Lead Routing',
    'Core Web Vitals',
    'Backup & Disaster Recovery Audit',
    'Formal Handover Approvals',
    'Full-Stack Platform Lead (FS1)',
    'DevOps & Infrastructure Commander (DO)',
    'Lead Frontend UX Architect (FE)',
  ];
  for (const kw of requiredReportKeywords) {
    if (!reportContent.includes(kw)) {
      throw new Error(`docs/reports/HYPERCARE_EXIT_REPORT.md missing keyword: "${kw}"`);
    }
  }

  const { createDb } = await mod('packages/db/src/index.ts');
  const db = await createDb();

  // 3. Verify and Execute tooling/ops/hypercare-daily-check.mjs
  const dailyCheckScript = resolve(repoRoot, 'tooling', 'ops', 'hypercare-daily-check.mjs');
  if (!existsSync(dailyCheckScript)) {
    throw new Error('Missing tooling/ops/hypercare-daily-check.mjs');
  }
  const { runDailyCheck } = await mod('tooling/ops/hypercare-daily-check.mjs');
  if (typeof runDailyCheck !== 'function') {
    throw new Error('hypercare-daily-check.mjs must export runDailyCheck()');
  }
  const dailyResult = await runDailyCheck({ db });
  if (!dailyResult || dailyResult.passed !== true) {
    throw new Error(`runDailyCheck() did not pass: ${JSON.stringify(dailyResult)}`);
  }
  if (dailyResult.verifiedRedirects < 72) {
    throw new Error(`runDailyCheck() verified only ${dailyResult.verifiedRedirects} redirects; expected >= 72`);
  }

  // 4. Verify and Execute tooling/ops/hypercare-simulation.mjs
  const simScript = resolve(repoRoot, 'tooling', 'ops', 'hypercare-simulation.mjs');
  if (!existsSync(simScript)) {
    throw new Error('Missing tooling/ops/hypercare-simulation.mjs');
  }
  const { runSimulation } = await mod('tooling/ops/hypercare-simulation.mjs');
  if (typeof runSimulation !== 'function') {
    throw new Error('hypercare-simulation.mjs must export runSimulation()');
  }
  const simResult = await runSimulation({ db });
  if (!simResult || simResult.passed !== true || simResult.consecutiveCleanDays < 14) {
    throw new Error(`runSimulation() failed exit criteria: ${JSON.stringify(simResult)}`);
  }

  return 'PASS (Task F8 Hypercare runbook, exit report deliverable, daily check automation [72/72 redirects], and 14-day multi-day simulation verified)';
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  verifyHypercareF8()
    .then((msg) => { console.log('[*] HYPERCARE-AUDIT:', msg); process.exit(0); })
    .catch((err) => { console.error('[✗] HYPERCARE-AUDIT FAILED:', err.message); process.exit(1); });
}
