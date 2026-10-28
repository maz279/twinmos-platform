// Production content load: applies the reviewed CMS snapshot
// (apps/api/content/snapshot/*.json, see content/CORRECTIONS.md) to a migrated
// database in ONE transaction. Default mode is --if-empty: a database that
// already has catalogue content is left untouched, so re-running a deploy can
// never overwrite editors' work. --force re-applies (insert-or-skip per row).
// Usage: node --experimental-strip-types scripts/load-content.ts [--if-empty|--force]
import type pg from 'pg';
import { createDb } from '@twinmos/db';
import { validateBlocks } from '@twinmos/shared';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONTENT_TABLES } from '../content/tables.ts';

const here = dirname(fileURLToPath(import.meta.url));
const SNAP = join(here, '..', 'content', 'snapshot');
const force = process.argv.includes('--force');
const url = process.env.DATABASE_URL;
if (!url) { console.error('[content] DATABASE_URL is required'); process.exit(1); }

// the node-postgres pool behind the shared Drizzle client (same driver as the API)
// The snapshot must satisfy the same block contract the admin API enforces.
{
  const pages = JSON.parse(readFileSync(join(SNAP, 'page.json'), 'utf8')) as Array<{ path: string; blocks: unknown }>;
  const invalid = pages.filter((p) => !validateBlocks(p.blocks ?? []).success).map((p) => p.path);
  if (invalid.length) { console.error('[content] refusing: invalid page blocks in', invalid.join(', ')); process.exit(1); }
}
const pool = (createDb(url) as unknown as { $client: pg.Pool }).$client;
const client = await pool.connect();
try {
  // --update-pages: replace ONLY page blocks/SEO text from the snapshot (by page
  // id), bumping each page's version — the upgrade path for databases loaded
  // before the page content rebuild (ZT-036). Nothing else is touched.
  if (process.argv.includes('--update-pages')) {
    const pages = JSON.parse(readFileSync(join(SNAP, 'page.json'), 'utf8')) as Array<{ id: number; path: string; locale: string; blocks: unknown }>;
    await client.query('begin');
    let n = 0;
    for (const p of pages) {
      // match on path + locale (ids differ between databases)
      const r = await client.query('update page set blocks = $3::jsonb, version = coalesce(version, 1) + 1, updated_at = now() where path = $1 and locale = $2 and deleted_at is null', [p.path, p.locale ?? 'en', JSON.stringify(p.blocks)]);
      if (!r.rowCount) console.warn(`[content] no page at ${p.path} (${p.locale ?? 'en'}) — skipped`);
      n += r.rowCount ?? 0;
    }
    await client.query('commit');
    console.log(`[content] page blocks updated: ${n}/${pages.length}`);
    process.exit(0);
  }
  const { rows: [{ n }] } = await client.query('select count(*)::int as n from product');
  if (n > 0 && !force) {
    console.log(`[content] catalogue already has ${n} products — skipping (use --force to re-apply)`);
    process.exit(0);
  }
  await client.query('begin');
  for (const t of CONTENT_TABLES) {
    const file = join(SNAP, `${t}.json`);
    if (!existsSync(file)) continue;
    const rows = JSON.parse(readFileSync(file, 'utf8'));
    if (!rows.length) continue;
    // Settings carry the reviewed contact data: the snapshot wins over bootstrap defaults.
    const onConflict = t === 'setting' ? 'on conflict (key) do update set value = excluded.value' : 'on conflict do nothing';
    const res = await client.query(`insert into "${t}" select * from json_populate_recordset(null::"${t}", $1::json) ${onConflict}`, [JSON.stringify(rows)]);
    const hasId = (await client.query(`select 1 from information_schema.columns where table_name = $1 and column_name = 'id' and column_default like 'nextval%'`, [t])).rowCount;
    if (hasId) await client.query(`select setval(pg_get_serial_sequence('"${t}"', 'id'), coalesce((select max(id) from "${t}"), 1), (select max(id) is not null from "${t}"))`);
    console.log(`[content] ${t}: ${res.rowCount}/${rows.length} rows`);
  }
  await client.query('commit');
  console.log('[content] snapshot applied');
} catch (e) {
  await client.query('rollback').catch(() => {});
  console.error('[content] FAILED — rolled back:', e);
  process.exit(1);
} finally {
  client.release();
  await pool.end();
}
