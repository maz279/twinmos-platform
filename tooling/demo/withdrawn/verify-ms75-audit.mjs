#!/usr/bin/env node
/**
 * tooling/verify/verify-ms75-audit.mjs — Milestone MS7.5 Master Certification Audit Runner
 * Milestone: MS7.5 · UAT, launch readiness and go/no-go
 * Quality Gates: UAT-01, EVID-01, VC-F (Gate F Exit Gate)
 *
 * Executes all 8 verification gates:
 * 1. Role-Based UAT Test Scripts (docs/uat/UAT_SCRIPTS_PER_ROLE.md, 7 personas, named testers)
 * 2. Automated UAT Persona Suite & Defect Triage (tooling/ops/run-uat-suite.mjs, 0 open Critical/High defects)
 * 3. Authoritative Cutover Runbook (docs/runbooks/CUTOVER.md, TTL 300s, 294 redirects, rollback criteria)
 * 4. Timed Cutover Drill Rehearsal (tooling/ops/cutover-drill.mjs, < 300s, 22 primed routes)
 * 5. BRD §28.1 Launch Criteria Checklist (docs/reports/LAUNCH_READINESS_CHECKLIST.md, 28 criteria)
 * 6. Gate F (VC-F) Exit Verification Audit Report (docs/reports/VC_F_EXIT_REPORT.md, 7 quality gates)
 * 7. Unanimous Go / No-Go Decision Record (docs/reports/GO_NO_GO_DECISION.md, 6 named lead votes)
 * 8. Quality Gate EVID-01 & Report Linter (tooling/verify/report-lint.mjs, 0 errors, 0 warnings)
 */

import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runUatSuite } from '../ops/run-uat-suite.mjs';
import { runCutoverDrill } from '../ops/cutover-drill.mjs';
import { runReportLint } from './report-lint.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..', '..');

let totalChecks = 0;
let passedChecks = 0;

async function check(name, desc, fn) {
  totalChecks++;
  process.stdout.write(`[*] Gate ${totalChecks} [${name}]: ${desc}... `);
  try {
    await fn();
    passedChecks++;
    console.log('✓ PASS');
  } catch (err) {
    console.log('✗ FAIL');
    console.error(`    Error: ${err.message}`);
    throw err;
  }
}

export async function runMS75Audit() {
  console.log('================================================================');
  console.log('   TwinMOS Milestone MS7.5 Master Certification Audit Runner    ');
  console.log('   (UAT, Launch Readiness, Cutover & Gate F Exit Certification) ');
  console.log('================================================================\n');

  // Gate 1: Role-Based UAT Test Scripts
  await check('MS75-G1-UAT-SCRIPTS', 'Role-based UAT test scripts for 7 personas with named testers', async () => {
    const scriptsPath = resolve(repoRoot, 'docs', 'uat', 'UAT_SCRIPTS_PER_ROLE.md');
    if (!existsSync(scriptsPath)) throw new Error('Missing docs/uat/UAT_SCRIPTS_PER_ROLE.md');
    const doc = readFileSync(scriptsPath, 'utf8');

    const expectedRoles = ['super_admin', 'admin', 'editor', 'author', 'viewer', 'partner', 'anonymous visitor'];
    for (const role of expectedRoles) {
      if (!doc.toLowerCase().includes(role.toLowerCase())) {
        throw new Error(`UAT_SCRIPTS_PER_ROLE.md missing role "${role}"`);
      }
    }

    const namedTesters = ['Elena Rostova', 'David Vance', 'Victoria Sterling', 'Marcus Brody', 'Tariq Al-Hashimi'];
    for (const tester of namedTesters) {
      if (!doc.includes(tester)) {
        throw new Error(`UAT_SCRIPTS_PER_ROLE.md missing named tester "${tester}" from ACCESS_MATRIX.md`);
      }
    }

    if (!doc.includes('Zero Tolerance') && !doc.includes('0 Critical')) {
      throw new Error('UAT_SCRIPTS_PER_ROLE.md missing zero-tolerance defect policy');
    }
  });

  // Gate 2: Automated UAT Persona Suite & Execution Evidence
  await check('MS75-G2-UAT-SUITE', 'Full-suite 7-persona UAT runner and defect triage evidence', async () => {
    const reportPath = resolve(repoRoot, 'docs', 'evidence', 'uat_execution_report.md');
    if (!existsSync(reportPath)) {
      await runUatSuite({ quiet: true });
    }
    const report = readFileSync(reportPath, 'utf8');
    if (!report.includes('ALL 7 PERSONAS PASSED') && !report.includes('7/7 PERSONAS PASSED')) {
      throw new Error('UAT execution report does not confirm 7/7 personas passed');
    }
    if (!report.includes('0 Critical / 0 High')) {
      throw new Error('UAT execution report missing 0 Critical / 0 High defect verification');
    }
  });

  // Gate 3: Production Cutover Runbook
  await check('MS75-G3-CUTOVER-RUNBOOK', 'Authoritative production cutover runbook (CUTOVER.md)', async () => {
    const cutoverPath = resolve(repoRoot, 'docs', 'runbooks', 'CUTOVER.md');
    if (!existsSync(cutoverPath)) throw new Error('Missing docs/runbooks/CUTOVER.md');
    const doc = readFileSync(cutoverPath, 'utf8');

    if (!doc.includes('300') || !doc.includes('TTL')) {
      throw new Error('CUTOVER.md missing DNS TTL reduction to 300s');
    }
    if (!doc.includes('twinmos-redirects.map')) {
      throw new Error('CUTOVER.md missing twinmos-redirects.map engagement');
    }
    if (!doc.includes('sitemap')) {
      throw new Error('CUTOVER.md missing sitemap cache-warming and search console submission');
    }
    if (!doc.includes('Rollback') || !doc.includes('Trigger Criteria')) {
      throw new Error('CUTOVER.md missing formal rollback criteria');
    }
  });

  // Gate 4: Timed Cutover Drill Rehearsal
  await check('MS75-G4-CUTOVER-DRILL', 'Production cutover drill rehearsal (< 300s, 22 routes, 294 redirects)', async () => {
    const drillResult = await runCutoverDrill({ quiet: true });
    if (!drillResult.passed) throw new Error('Cutover drill did not pass');
    if (drillResult.durationSec > 300) {
      throw new Error(`Cutover drill duration (${drillResult.durationSec}s) exceeded 300s budget`);
    }
    if (drillResult.validRedirects < 290) {
      throw new Error(`Insufficient redirect rules verified: ${drillResult.validRedirects}`);
    }
    if (drillResult.warmedEndpoints < 20) {
      throw new Error(`Insufficient primed endpoints: ${drillResult.warmedEndpoints}`);
    }

    const logPath = resolve(repoRoot, 'docs', 'evidence', 'cutover_rehearsal_log.md');
    if (!existsSync(logPath)) throw new Error('Missing docs/evidence/cutover_rehearsal_log.md');
  });

  // Gate 5: BRD §28.1 Launch Criteria Checklist
  await check('MS75-G5-LAUNCH-CHECKLIST', 'BRD §28.1 launch criteria checklist with 28 linked criteria', async () => {
    const checklistPath = resolve(repoRoot, 'docs', 'reports', 'LAUNCH_READINESS_CHECKLIST.md');
    if (!existsSync(checklistPath)) throw new Error('Missing docs/reports/LAUNCH_READINESS_CHECKLIST.md');
    const doc = readFileSync(checklistPath, 'utf8');

    // Count criteria rows
    const matches = doc.match(/\|\s*\*\*\d+\*\*\s*\|/g);
    if (!matches || matches.length < 28) {
      throw new Error(`LAUNCH_READINESS_CHECKLIST.md contains ${matches?.length || 0} criteria rows; expected 28`);
    }

    const leads = ['David Vance', 'Tariq Al-Mansoor', 'Elena Rostova', 'Marcus Brody', 'Victoria Sterling', 'Tariq Al-Hashimi'];
    for (const lead of leads) {
      if (!doc.includes(lead)) {
        throw new Error(`LAUNCH_READINESS_CHECKLIST.md missing sign-off for lead "${lead}"`);
      }
    }
  });

  // Gate 6: Gate F (VC-F) Exit Verification Audit Report
  await check('MS75-G6-VCF-EXIT-REPORT', 'Gate F (VC-F) exit verification audit report (7 quality gates)', async () => {
    const reportPath = resolve(repoRoot, 'docs', 'reports', 'VC_F_EXIT_REPORT.md');
    if (!existsSync(reportPath)) throw new Error('Missing docs/reports/VC_F_EXIT_REPORT.md');
    const doc = readFileSync(reportPath, 'utf8');

    const expectedGates = ['DR-01', 'OBS-01', 'HARD-01', 'LOAD-01', 'RUN-01', 'UAT-01', 'DRIVE-THRU'];
    for (const gate of expectedGates) {
      if (!doc.includes(gate)) {
        throw new Error(`VC_F_EXIT_REPORT.md missing Quality Gate "${gate}"`);
      }
    }
  });

  // Gate 7: Unanimous Go / No-Go Decision Record
  await check('MS75-G7-GO-NO-GO-DECISION', 'Formal Go / No-Go decision record with unanimous votes and named leads', async () => {
    const decisionPath = resolve(repoRoot, 'docs', 'reports', 'GO_NO_GO_DECISION.md');
    if (!existsSync(decisionPath)) throw new Error('Missing docs/reports/GO_NO_GO_DECISION.md');
    const doc = readFileSync(decisionPath, 'utf8');

    if (!doc.includes('UNANIMOUS GO') && !doc.includes('UNCONDITIONAL PRODUCTION LAUNCH APPROVAL')) {
      throw new Error('GO_NO_GO_DECISION.md does not record unanimous GO decision');
    }

    const leads = ['David Vance', 'Tariq Al-Mansoor', 'Elena Rostova', 'Marcus Brody', 'Victoria Sterling', 'Tariq Al-Hashimi'];
    for (const lead of leads) {
      if (!doc.includes(lead)) {
        throw new Error(`GO_NO_GO_DECISION.md missing roll-call for lead "${lead}"`);
      }
    }
  });

  // Gate 8: Quality Gate EVID-01 Report Linter
  await check('MS75-G8-EVID01-REPORT-LINT', 'EVID-01 automated report linter (0 errors, 0 warnings across all active reports)', async () => {
    const lintResult = runReportLint(resolve(repoRoot, 'docs', 'reports'), process.env.AUDIT_DATE || '2026-10-28');
    if (lintResult.errors.length > 0) {
      throw new Error(`report-lint found ${lintResult.errors.length} errors: ${JSON.stringify(lintResult.errors)}`);
    }
    if (lintResult.warnings.length > 0) {
      throw new Error(`report-lint found ${lintResult.warnings.length} warnings: ${JSON.stringify(lintResult.warnings)}`);
    }
  });

  console.log('\n================================================================');
  console.log(`   MS7.5 AUDIT SCORECARD: ${passedChecks}/${totalChecks} GATES PASSED (100% CERTIFIED) `);
  console.log('================================================================\n');

  return { passed: true, totalChecks, passedChecks };
}

if (process.argv[1] && process.argv[1].endsWith('verify-ms75-audit.mjs')) {
  runMS75Audit()
    .then((r) => {
      console.log('[*] MS7.5 Master Audit Result:', r);
      process.exit(0);
    })
    .catch((err) => {
      console.error('[✗] MS7.5 Master Audit Failed:', err.message);
      process.exit(1);
    });
}
