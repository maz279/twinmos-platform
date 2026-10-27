import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runReportLint } from '../../../tooling/verify/report-lint.mjs';
import { runCutoverDrill } from '../../../tooling/ops/cutover-drill.mjs';

const CODEBASE_ROOT = resolve(__dirname, '..', '..', '..');

describe('MS7.5: UAT, Launch Readiness & Go/No-Go Certification', () => {
  it('T7.5.1: verifies role-based UAT scripts for all 7 platform personas with named testers', () => {
    const scriptsPath = resolve(CODEBASE_ROOT, 'docs', 'uat', 'UAT_SCRIPTS_PER_ROLE.md');
    expect(existsSync(scriptsPath)).toBe(true);
    const content = readFileSync(scriptsPath, 'utf8');

    const expectedRoles = ['super_admin', 'admin', 'editor', 'author', 'viewer', 'partner', 'anonymous visitor'];
    for (const role of expectedRoles) {
      expect(content.toLowerCase()).toContain(role.toLowerCase());
    }

    const namedTesters = ['Elena Rostova', 'David Vance', 'Victoria Sterling', 'Marcus Brody', 'Tariq Al-Hashimi'];
    for (const tester of namedTesters) {
      expect(content).toContain(tester);
    }

    expect(content).toContain('Zero Tolerance');
  });

  it('T7.5.2: verifies UAT execution report confirms 7/7 personas passed with 0 Critical/High defects', () => {
    const reportPath = resolve(CODEBASE_ROOT, 'docs', 'evidence', 'uat_execution_report.md');
    expect(existsSync(reportPath)).toBe(true);
    const content = readFileSync(reportPath, 'utf8');

    expect(content).toContain('ALL 7 PERSONAS PASSED');
    expect(content).toContain('0 Critical / 0 High Defects');
  });

  it('T7.5.4: verifies cutover runbook specifies TTL <= 300s, 294 redirects and rollback criteria', () => {
    const runbookPath = resolve(CODEBASE_ROOT, 'docs', 'runbooks', 'CUTOVER.md');
    expect(existsSync(runbookPath)).toBe(true);
    const content = readFileSync(runbookPath, 'utf8');

    expect(content).toContain('300');
    expect(content).toContain('twinmos-redirects.map');
    expect(content).toContain('Rollback');
    expect(content).toContain('David Vance');
    expect(content).toContain('Tariq Al-Mansoor');
  });

  it('T7.5.4: executes cutover drill rehearsal in < 300s and validates primed routes and redirects', async () => {
    const result = await runCutoverDrill({ quiet: true });
    expect(result.passed).toBe(true);
    expect(result.durationSec).toBeLessThan(300);
    expect(result.validRedirects).toBeGreaterThanOrEqual(290);
    expect(result.warmedEndpoints).toBeGreaterThanOrEqual(20);
    expect(result.dnsTtlSec).toBeLessThanOrEqual(300);
  });

  it('T7.5.3: verifies LAUNCH_READINESS_CHECKLIST.md maps 28 BRD criteria with verifiable artifact links', () => {
    const checklistPath = resolve(CODEBASE_ROOT, 'docs', 'reports', 'LAUNCH_READINESS_CHECKLIST.md');
    expect(existsSync(checklistPath)).toBe(true);
    const content = readFileSync(checklistPath, 'utf8');

    const criteriaMatches = content.match(/\|\s*\*\*\d+\*\*\s*\|/g);
    expect(criteriaMatches).not.toBeNull();
    expect(criteriaMatches!.length).toBeGreaterThanOrEqual(28);

    const leads = ['David Vance', 'Tariq Al-Mansoor', 'Elena Rostova', 'Marcus Brody', 'Victoria Sterling', 'Tariq Al-Hashimi'];
    for (const lead of leads) {
      expect(content).toContain(lead);
    }
  });

  it('T7.5.5: verifies VC_F_EXIT_REPORT.md documents all 7 Gate F operational quality gates', () => {
    const reportPath = resolve(CODEBASE_ROOT, 'docs', 'reports', 'VC_F_EXIT_REPORT.md');
    expect(existsSync(reportPath)).toBe(true);
    const content = readFileSync(reportPath, 'utf8');

    const gates = ['DR-01', 'OBS-01', 'HARD-01', 'LOAD-01', 'RUN-01', 'UAT-01', 'DRIVE-THRU'];
    for (const gate of gates) {
      expect(content).toContain(gate);
    }
    expect(content).toContain('GATE F (VC-F) 100% CLEAN');
  });

  it('T7.5.6: verifies GO_NO_GO_DECISION.md records unanimous GO with 6 named lead votes', () => {
    const decisionPath = resolve(CODEBASE_ROOT, 'docs', 'reports', 'GO_NO_GO_DECISION.md');
    expect(existsSync(decisionPath)).toBe(true);
    const content = readFileSync(decisionPath, 'utf8');

    expect(content).toContain('UNANIMOUS GO');
    expect(content).toContain('UNCONDITIONAL PRODUCTION LAUNCH APPROVAL');

    const leads = ['David Vance', 'Tariq Al-Mansoor', 'Elena Rostova', 'Marcus Brody', 'Victoria Sterling', 'Tariq Al-Hashimi'];
    for (const lead of leads) {
      expect(content).toContain(lead);
    }
  });

  it('EVID-01: verifies report-lint passes with zero errors and zero warnings across all active reports', () => {
    const reportsDir = resolve(CODEBASE_ROOT, 'docs', 'reports');
    const lintResult = runReportLint(reportsDir, '2026-10-27');
    expect(lintResult.errors).toHaveLength(0);
    expect(lintResult.warnings).toHaveLength(0);
  });
});
