// Gate F Operations & Launch Verification Suite Runner (VC-F: Section 8.6)
// Executes all 6 Gate F operational audit checks and the 3-iteration visual drive-through suite.
import { execSync } from 'node:child_process';

console.log('================================================================');
console.log('       TwinMOS Phase F Operations & Launch: Gate F (VC-F)');
console.log('================================================================\n');

const checks = [
  {
    id: 'DR-01',
    name: 'Disaster Recovery & Point-In-Time Restore (RTO < 15m, PITR drill, backup/restore scripts)',
    cmd: 'node tooling/verify/dr-01-audit.mjs',
  },
  {
    id: 'OBS-01',
    name: 'Observability & Alerting Engine (5xx/latency rules, V-09 mail alert, /health/deep diagnostics)',
    cmd: 'node tooling/verify/obs-01-audit.mjs',
  },
  {
    id: 'HARD-01',
    name: 'Security Hardening & Origin Isolation (22 CF CIDRs, Nginx 444 drop, AOP, dual-key rotation)',
    cmd: 'node tooling/verify/hard-01-audit.mjs',
  },
  {
    id: 'LOAD-01',
    name: 'Load & System Resilience (Throughput > 200 req/s, p95 < 300ms, 503->200 recovery, VM sizing)',
    cmd: 'node tooling/verify/load-01-audit.mjs',
  },
  {
    id: 'RUN-01',
    name: 'Runbooks & Documentation Alignment (DEPLOY, ROLLBACK, SECRETS, INCIDENT, NF-38, NEW-07, OpenAPI)',
    cmd: 'node tooling/verify/run-01-audit.mjs',
  },
  {
    id: 'UAT-01',
    name: 'Cutover Rehearsal & Redirect Validation (cutover < 300s, legacy redirects)',
    cmd: 'node tooling/ops/cutover-drill.mjs',
  },
  {
    id: 'DRIVE-THRU',
    name: '3-Iteration Visual Drive-Through Suite (11 screenshots, WCAG 2.2 AA Axe audits clean)',
    cmd: 'node tooling/verify/drive-through-visual-suite.mjs',
  },
];

let passCount = 0;
let failCount = 0;
const results = [];

for (const check of checks) {
  process.stdout.write(`[*] Running ${check.id}: ${check.name} ... `);
  const start = Date.now();
  try {
    const out = execSync(check.cmd, { stdio: 'pipe', encoding: 'utf8', env: process.env });
    const duration = ((Date.now() - start) / 1000).toFixed(2);
    console.log(`PASS (${duration}s)`);
    passCount++;
    results.push({ ...check, status: 'PASS', duration });
  } catch (err) {
    const duration = ((Date.now() - start) / 1000).toFixed(2);
    console.log(`FAIL (${duration}s)`);
    console.error(`\n--- ERROR OUTPUT FOR ${check.id} ---`);
    console.error(err.stdout || err.stderr || err.message);
    console.error('------------------------------------\n');
    failCount++;
    results.push({ ...check, status: 'FAIL', duration });
  }
}

console.log('\n================================================================');
console.log('                     GATE F (VC-F) SCORECARD');
console.log('================================================================');
for (const r of results) {
  console.log(`  [${r.status === 'PASS' ? '✓' : '✗'}] ${r.id.padEnd(12)} : ${r.status} (${r.duration}s) - ${r.name}`);
}
console.log('----------------------------------------------------------------');
console.log(`Total Checks: ${checks.length} | Passed: ${passCount} | Failed: ${failCount}`);
console.log('================================================================\n');

if (failCount > 0) {
  console.error('[!] Gate F (VC-F) Verification FAILED. Please review failing checks above.\n');
  process.exit(1);
} else {
  console.log('[*] Gate F (VC-F) 100% CLEAN: All operational, security, and launch criteria satisfied!\n');
  process.exit(0);
}
