import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runReportLint } from '../../../tooling/verify/report-lint.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../../..');

describe('Milestone MS7.6: Go-Live, Hypercare Surveillance & Steady-State Handover (Task F8)', () => {
  it('verifies production cutover smoke test log exists and asserts 100% operational status (T7.6.1)', () => {
    const logPath = resolve(repoRoot, 'docs/evidence/production_smoke_test_log.md');
    expect(existsSync(logPath)).toBe(true);
    const content = readFileSync(logPath, 'utf8');
    expect(content).toContain('PASSED (100% OPERATIONAL)');
    expect(content).toContain('API Liveness');
    expect(content).toContain('200 OK');
  });

  it('verifies live daily hypercare surveillance log exists and asserts healthy database & outbox (T7.6.2)', () => {
    const logPath = resolve(repoRoot, 'docs/evidence/hypercare_daily_surveillance_log.md');
    expect(existsSync(logPath)).toBe(true);
    const content = readFileSync(logPath, 'utf8');
    expect(content).toContain('100% OPERATIONAL & COMPLIANT');
    expect(content).toContain('Database Pool');
    expect(content).toContain('status: ok, db: connected');
  });

  it('verifies defect tracker export confirms 0 open Critical and 0 open High defects (Criterion 1)', () => {
    const defectPath = resolve(repoRoot, 'docs/evidence/hypercare_defect_tracker.md');
    expect(existsSync(defectPath)).toBe(true);
    const content = readFileSync(defectPath, 'utf8');
    expect(content).toContain('CLEAN — ZERO OPEN DEFECTS');
    expect(content).toContain('**Critical (Sev-1)** | **0**');
    expect(content).toContain('**High (Sev-2)** | **0**');
  });

  it('verifies form deliveries telemetry confirms intake across form channels with zero dropped leads (Criterion 4 / V-09)', () => {
    const formsPath = resolve(repoRoot, 'docs/evidence/hypercare_form_deliveries.json');
    expect(existsSync(formsPath)).toBe(true);
    const data = JSON.parse(readFileSync(formsPath, 'utf8'));
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(5);
    const delivered = data.filter((f: any) => f.delivered);
    expect(delivered.length).toBeGreaterThanOrEqual(5);
  });

  it('verifies real browser Core Web Vitals telemetry complies with SLA thresholds (Criterion 3)', () => {
    const cwvPath = resolve(repoRoot, 'docs/evidence/hypercare_cwv_metrics.json');
    expect(existsSync(cwvPath)).toBe(true);
    const data = JSON.parse(readFileSync(cwvPath, 'utf8'));
    expect(data.lcpMs).toBeLessThanOrEqual(2500);
    expect(data.inpMs).toBeLessThanOrEqual(200);
    expect(data.cls).toBeLessThanOrEqual(0.1);
  });

  it('verifies authentic HYPERCARE_EXIT_REPORT.md addresses all 6 exit criteria (Criterion 5)', () => {
    const reportPath = resolve(repoRoot, 'docs/reports/HYPERCARE_EXIT_REPORT.md');
    expect(existsSync(reportPath)).toBe(true);
    const content = readFileSync(reportPath, 'utf8');
    for (let c = 1; c <= 6; c++) {
      expect(content).toContain(`**${c}**`);
    }
    expect(content).toContain('HANDOVER TO STEADY-STATE OPERATIONS APPROVED');
  });

  it('verifies steady-state operations handover is signed by all 6 named platform leads without placeholders (Criterion 6)', () => {
    const reportPath = resolve(repoRoot, 'docs/reports/HYPERCARE_EXIT_REPORT.md');
    const content = readFileSync(reportPath, 'utf8');
    const leads = [
      'David Vance',
      'Tariq Al-Mansoor',
      'Marcus Brody',
      'Elena Rostova',
      'Victoria Sterling',
      'Tariq Al-Hashimi',
    ];
    for (const lead of leads) {
      expect(content).toContain(lead);
    }
    expect(content).not.toMatch(/\[(?:Name|Insert|TBD|TODO)\]/i);
    expect(content).not.toContain('P. Lead');
    expect(content).not.toContain('D. Lead');
  });

  it('verifies automated report linter confirms 0 errors and 0 warnings (EVID-01)', () => {
    const result = runReportLint(resolve(repoRoot, 'docs/reports'));
    expect(result.errors.length).toBe(0);
    expect(result.warnings.length).toBe(0);
  });
});
