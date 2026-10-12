// A14: Repair translations encoding integrity (DATA-01)
// Scans translation table for any rows containing '???' or U+FFFD (encoding corruption)
// and purges them so fallback applies or clean translations are maintained.
import { createDb, translation } from '@twinmos/db';
import { and, eq, or, sql } from 'drizzle-orm';

export async function repairTranslations(db = createDb()) {
  const rows = await db.select().from(translation);
  const corrupted = rows.filter((r) => r.value.includes('???') || r.value.includes('\uFFFD'));

  console.log(`[repair-translations] Scanned ${rows.length} translation rows, found ${corrupted.length} corrupted.`);

  const repaired: Array<{ locale: string; ns: string; key: string; oldValue: string }> = [];

  for (const c of corrupted) {
    console.log(`[repair-translations] Removing corrupted translation: ${c.locale}:${c.ns}:${c.key} -> "${c.value}"`);
    await db
      .delete(translation)
      .where(and(eq(translation.locale, c.locale), eq(translation.ns, c.ns), eq(translation.key, c.key)));
    repaired.push({ locale: c.locale, ns: c.ns, key: c.key, oldValue: c.value });
  }

  return { scanned: rows.length, corruptedCount: corrupted.length, repaired };
}

// Direct invocation
const isMain = !process.argv[1] || import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/')) || process.argv[1].includes('repair-translations');
if (isMain) {
  const result = await repairTranslations();
  console.log('[repair-translations] Done. Repaired items:', result.repaired.length);
  process.exit(0);
}

