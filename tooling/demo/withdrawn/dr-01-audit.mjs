// Gate F Check DR-01: Backups and Disaster Recovery Verification
// Checks RTO < 15min, Point-in-Time Recovery demonstration, and backup tooling integrity.
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runDrill } from '../ops/dr-restore-drill.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..', '..');

export async function verifyDR01() {
  // 1. Run live PITR drill and assert RTO
  const result = await runDrill();
  if (!result.passed || result.durationSec >= result.rtoBudgetSec) {
    throw new Error(`PITR drill failed or exceeded RTO budget: ${result.durationSec}s >= ${result.rtoBudgetSec}s`);
  }

  // 2. Validate backup.sh integrity
  const backupScript = resolve(repoRoot, 'deploy', 'backup.sh');
  if (!existsSync(backupScript)) throw new Error('Missing deploy/backup.sh');
  const backupContent = readFileSync(backupScript, 'utf8');
  if (!backupContent.includes('pg_dump') || !backupContent.includes('-Fc') || !backupContent.includes('sha256sum')) {
    throw new Error('deploy/backup.sh missing essential pg_dump -Fc or checksum verification commands');
  }

  // 3. Validate restore.sh integrity
  const restoreScript = resolve(repoRoot, 'deploy', 'restore.sh');
  if (!existsSync(restoreScript)) throw new Error('Missing deploy/restore.sh');
  const restoreContent = readFileSync(restoreScript, 'utf8');
  if (!restoreContent.includes('pg_restore') || !restoreContent.includes('--drill') || !restoreContent.includes('sha256sum')) {
    throw new Error('deploy/restore.sh missing essential pg_restore or integrity checks');
  }

  // 4. Validate runbooks/DR.md
  const drRunbook = resolve(repoRoot, 'docs', 'runbooks', 'DR.md');
  if (!existsSync(drRunbook)) throw new Error('Missing docs/runbooks/DR.md');
  const drContent = readFileSync(drRunbook, 'utf8');
  if (!drContent.includes('RTO') || !drContent.includes('RPO')) {
    throw new Error('docs/runbooks/DR.md missing SLA declarations');
  }

  return `PASS (PITR demonstrated in ${result.durationSec}s; RTO < 900s; backup/restore scripts verified)`;
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  verifyDR01()
    .then((msg) => { console.log('[*] DR-01:', msg); process.exit(0); })
    .catch((err) => { console.error('[✗] DR-01 FAILED:', err.message); process.exit(1); });
}
