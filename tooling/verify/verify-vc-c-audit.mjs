// Phase 04 exit gate audit (VC-C). Executes every MS4 milestone audit and the
// Phase 04 reflection/contract suites instead of grepping for their existence.
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = process.cwd();
const OUT = resolve(ROOT, 'tooling/verify/evidence/ms48');
mkdirSync(OUT, { recursive: true });

const checks = [];
function run(id, title, command, cwd = ROOT, timeout = 300000) {
  try {
    execSync(command, { cwd, stdio: 'pipe', timeout });
    checks.push({ id, title, passed: true });
    console.log(`[PASS] ${id}: ${title}`);
  } catch (err) {
    const output = String(err?.stdout ?? '') + String(err?.stderr ?? '') + String(err?.message ?? '');
    checks.push({ id, title, passed: false, details: output.slice(-800) });
    console.error(`[FAIL] ${id}: ${title}`);
  }
}

// Milestone audits (each is self-contained; ms42 needs the live API/web).
run('MS4.1', 'Page entity + one block contract audit', 'node tooling/verify/verify-ms41-audit.mjs');
run('MS4.2', 'Site settings + navigation live audit', 'node tooling/verify/verify-ms42-audit.mjs');
run('MS4.3', 'Glossary + versioned policies audit', 'node tooling/verify/verify-ms43-audit.mjs');
run('MS4.4', 'Block library I audit', 'npm run verify:ms44');
run('MS4.5', 'Media, catalogue, articles, directory audit', 'node tooling/verify/verify-ms45-audit.mjs');
run('MS4.6', 'Editorial workflow + pages + reflection audit', 'node tooling/verify/verify-ms46-audit.mjs');
run('MS4.7', 'Truthful entities, forms, localisation, menu editor audit', 'node tooling/verify/verify-ms47-audit.mjs');
run('MS4.8', 'Data-bound blocks, Translation Studio, reflection audit', 'node tooling/verify/verify-ms48-audit.mjs');

// Contract + reflection suites.
run(
  'VC-C-TESTS',
  'Phase 04 contract/reflection vitest suites',
  'npx vitest run test/blocks-contract.test.ts test/settings-navigation.test.ts test/glossary-policies.test.ts test/ms47-entities-forms.test.ts test/c11a-reflection.test.ts test/c11b-full-reflection.test.ts test/ms48-xliff-roundtrip.test.ts',
  resolve(ROOT, 'apps/api'),
  600000,
);

run('GREF-C', 'G-REFLECT-C schema/dispatcher lint', 'node tooling/verify/greflect-c.mjs');

const passed = checks.filter((c) => c.passed).length;
const report = {
  timestamp: new Date().toISOString(),
  gate: 'VC-C',
  passed,
  total: checks.length,
  status: passed === checks.length ? 'CLEARED' : 'FAILED',
  checks,
};
writeFileSync(resolve(OUT, 'gate-c-audit.json'), JSON.stringify(report, null, 2));

console.log(`\nVC-C: ${passed}/${checks.length} checks passed — ${report.status}`);
process.exit(report.status === 'CLEARED' ? 0 : 1);
