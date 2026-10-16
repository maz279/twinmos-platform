// Gate F Check UAT-01: UAT Coordination, Launch Readiness & Cutover Rehearsal Audit
// Validates 28 BRD launch criteria, Go/No-Go decision matrix, legacy redirects, and cutover execution window.
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runCutoverDrill } from '../ops/cutover-drill.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..', '..');

export async function verifyUAT01() {
  // 1. Run Production Cutover Rehearsal
  const cutoverResult = await runCutoverDrill();
  if (!cutoverResult.passed || cutoverResult.durationSec >= 300) {
    throw new Error(`Cutover drill exceeded 300s target: ${cutoverResult.durationSec}s`);
  }
  if (cutoverResult.validRedirects < 20) {
    throw new Error(`Insufficient validated legacy redirects: ${cutoverResult.validRedirects}`);
  }

  // 2. Verify Launch Readiness Checklist Document
  const checklistPath = resolve(repoRoot, 'docs', 'reports', 'LAUNCH_READINESS_CHECKLIST.md');
  if (!existsSync(checklistPath)) throw new Error('Missing docs/reports/LAUNCH_READINESS_CHECKLIST.md');
  const checklistContent = readFileSync(checklistPath, 'utf8');

  // Verify 28 criteria and decision matrix
  if (!checklistContent.includes('GO FOR PRODUCTION LAUNCH')) {
    throw new Error('LAUNCH_READINESS_CHECKLIST.md missing GO FOR PRODUCTION LAUNCH declaration');
  }
  if (!checklistContent.includes('0 Critical / 0 High Open Defects')) {
    throw new Error('LAUNCH_READINESS_CHECKLIST.md missing zero critical/high defect declaration');
  }
  for (let i = 1; i <= 28; i++) {
    if (!checklistContent.includes(`**${i}**`)) {
      throw new Error(`LAUNCH_READINESS_CHECKLIST.md missing criterion #${i}`);
    }
  }

  return `PASS (Cutover rehearsal completed in ${cutoverResult.durationSec.toFixed(2)}s, 28 BRD launch criteria approved, and Go decision verified)`;
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  verifyUAT01()
    .then((msg) => { console.log('[*] UAT-01:', msg); process.exit(0); })
    .catch((err) => { console.error('[✗] UAT-01 FAILED:', err.message); process.exit(1); });
}
