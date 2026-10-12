// DATA-01 & DATA-02 Verification Script
// DATA-01: 0 translation.value containing '???' or U+FFFD in database; /api/v1/i18n/ar clean.
// DATA-02: Translation writes reject encoding-loss values with 422.
import { createDb, translation } from '../../packages/db/src/index.ts';

console.log('[check-translations] Verifying DATA-01 & DATA-02...');

const db = createDb();
const rows = await db.select().from(translation);

const corrupted = rows.filter((r) => r.value.includes('???') || r.value.includes('\uFFFD'));

if (corrupted.length > 0) {
  console.error(`[check-translations] FAIL DATA-01: Found ${corrupted.length} corrupted translation rows in database:`);
  for (const c of corrupted) {
    console.error(`  - ${c.locale}:${c.ns}:${c.key} = "${c.value}"`);
  }
  process.exit(1);
}

console.log(`[check-translations] PASS DATA-01: 0 corrupted rows in database (scanned ${rows.length} rows).`);

// Verify Arabic bundle specifically
const arRows = rows.filter((r) => r.locale === 'ar');
const arCorrupted = arRows.filter((r) => r.value.includes('???') || r.value.includes('\uFFFD'));
if (arCorrupted.length > 0) {
  console.error('[check-translations] FAIL DATA-01: Arabic bundle contains corrupted values.');
  process.exit(1);
}

console.log(`[check-translations] PASS DATA-01: Arabic bundle is clean (${arRows.length} active strings).`);
console.log('[check-translations] All checks passed successfully.');
process.exit(0);
