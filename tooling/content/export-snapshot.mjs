// Exports the CMS CONTENT tables (no users, sessions, audit, submissions, RMA,
// subscribers, serials or any other operational/PII table) from a database into
// content/snapshot/<table>.json — the reviewed, versioned source the production
// content load (load-snapshot.mjs) applies. Staff FK columns are nulled.
// Usage: node --experimental-strip-types tooling/content/export-snapshot.mjs --pglite <datadir> [outDir]
//        node tooling/content/export-snapshot.mjs --pg <DATABASE_URL> [outDir]
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { CONTENT_TABLES } from '../../apps/api/content/tables.ts';

const [mode, src, outDir = 'content/snapshot'] = process.argv.slice(2);
let query;
if (mode === '--pglite') {
  const { PGlite } = await import('@electric-sql/pglite');
  const pg = new PGlite(src);
  query = async (sql) => (await pg.query(sql)).rows;
} else if (mode === '--pg') {
  const pg = (await import('pg')).default;
  const pool = new pg.Pool({ connectionString: src });
  query = async (sql) => (await pool.query(sql)).rows;
} else {
  console.error('usage: export-snapshot.mjs --pglite <dir> | --pg <url> [outDir]');
  process.exit(2);
}

const userFks = await query(`
  select kcu.table_name, kcu.column_name from information_schema.referential_constraints rc
  join information_schema.key_column_usage kcu on kcu.constraint_name = rc.constraint_name
  join information_schema.constraint_column_usage ccu on ccu.constraint_name = rc.unique_constraint_name
  where ccu.table_name = 'user'`);
mkdirSync(outDir, { recursive: true });
const manifest = {};
for (const t of CONTENT_TABLES) {
  const order = (await query(`select 1 from information_schema.columns where table_name='${t}' and column_name='id'`)).length ? ' order by id' : '';
  const rows = await query(`select * from "${t}"${order}`);
  const nulls = userFks.filter((f) => f.table_name === t).map((f) => f.column_name);
  for (const r of rows) for (const c of nulls) r[c] = null;
  writeFileSync(join(outDir, `${t}.json`), JSON.stringify(rows, null, 1) + '\n');
  manifest[t] = rows.length;
}
writeFileSync(join(outDir, '_manifest.json'), JSON.stringify({ tables: manifest }, null, 1) + '\n');
console.log(JSON.stringify(manifest));
process.exit(0);
