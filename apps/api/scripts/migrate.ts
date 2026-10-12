// Set-based migration runner (A10, PG-01..PG-06, ADR D-2).
// Resolves V-12: applies migrations by set-identity, never skips out-of-order timestamps,
// wraps each migration file in its own transaction (preventing 55P04), supports --dry-run
// and enforces PostgreSQL 18 minimum version in production.
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDb } from '@twinmos/db';
import { PGlite } from '@electric-sql/pglite';
import { readMigrationFiles } from 'drizzle-orm/migrator';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const migrationsFolder = resolve(__dirname, '../../../packages/db/migrations');
const journalPath = join(migrationsFolder, 'meta', '_journal.json');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const minVerArg = args.find((a) => a.startsWith('--min-version='));
const minVersion = minVerArg
  ? Number(minVerArg.split('=')[1])
  : (process.env.NODE_ENV === 'production' && !process.env.ALLOW_PRE_PG18 ? 180000 : 0);

const journal = JSON.parse(readFileSync(journalPath, 'utf8')) as {
  entries: Array<{ idx: number; version: string; when: number; tag: string }>;
};
const tags = journal.entries.map((e) => e.tag);
const migs = readMigrationFiles({ migrationsFolder });

const isPostgres = !!process.env.DATABASE_URL;

if (isPostgres) {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const verRes = await client.query("SELECT current_setting('server_version_num') AS v");
  const serverVersion = Number(verRes.rows[0].v);
  if (minVersion > 0 && serverVersion < minVersion) {
    console.error(`[migrate] Refusing: PostgreSQL version ${serverVersion} < ${minVersion} (ADR D-2, PG-06)`);
    await client.end();
    process.exit(2);
  }

  await client.query('CREATE SCHEMA IF NOT EXISTS drizzle');
  await client.query('CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (id SERIAL PRIMARY KEY, hash text NOT NULL, created_at bigint)');

  const recordedRes = await client.query('SELECT created_at FROM drizzle.__drizzle_migrations');
  const recorded = new Set(recordedRes.rows.map((r) => Number(r.created_at)));
  const known = new Set(migs.map((m) => m.folderMillis));
  const unknown = [...recorded].filter((x) => !known.has(x));
  if (unknown.length > 0) {
    console.error(`[migrate] Refusing: database records migrations not in this release: ${unknown.join(',')}`);
    await client.end();
    process.exit(3);
  }

  const pending = migs.map((m, i) => ({ ...m, tag: tags[i] })).filter((m) => !recorded.has(m.folderMillis));
  console.log(`[migrate] server ${serverVersion}; journal ${migs.length}; recorded ${recorded.size}; pending ${pending.length}${pending.length ? ': ' + pending.map((m) => m.tag).join(', ') : ''}`);

  if (dryRun) {
    await client.end();
    process.exit(0);
  }

  for (const m of pending) {
    await client.query('BEGIN');
    try {
      for (const statement of m.sql) {
        if (statement.trim()) await client.query(statement);
      }
      await client.query('INSERT INTO drizzle.__drizzle_migrations (hash, created_at) VALUES ($1, $2)', [m.hash, m.folderMillis]);
      await client.query('COMMIT');
    } catch (e: any) {
      await client.query('ROLLBACK');
      console.error(`[migrate] FAILED in ${m.tag}: ${e.message} (${e.code})`);
      await client.end();
      process.exit(1);
    }
  }

  const tableCount = (await client.query("SELECT count(*)::int AS n FROM information_schema.tables WHERE table_schema='public'")).rows[0].n;
  const colCount = (await client.query("SELECT count(*)::int AS n FROM information_schema.columns WHERE table_schema='public'")).rows[0].n;
  console.log(`[migrate] Postgres applied ${pending.length}; public tables ${tableCount}; columns ${colCount}`);
  await client.end();
} else {
  // PGlite dev/test path
  const db = createDb();
  const pglite = (db as any).$client as PGlite;
  await pglite.exec('CREATE SCHEMA IF NOT EXISTS drizzle');
  await pglite.exec('CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (id SERIAL PRIMARY KEY, hash text NOT NULL, created_at bigint)');

  const recordedRes = await pglite.query<{ created_at: string | number }>('SELECT created_at FROM drizzle.__drizzle_migrations');
  const recorded = new Set(recordedRes.rows.map((r) => Number(r.created_at)));
  const known = new Set(migs.map((m) => m.folderMillis));
  const unknown = [...recorded].filter((x) => !known.has(x));
  if (unknown.length > 0) {
    console.error(`[migrate] Refusing: database records migrations not in this release: ${unknown.join(',')}`);
    process.exit(3);
  }

  const pending = migs.map((m, i) => ({ ...m, tag: tags[i] })).filter((m) => !recorded.has(m.folderMillis));
  console.log(`[migrate] PGlite dev; journal ${migs.length}; recorded ${recorded.size}; pending ${pending.length}${pending.length ? ': ' + pending.map((m) => m.tag).join(', ') : ''}`);

  if (dryRun) {
    process.exit(0);
  }

  for (const m of pending) {
    await pglite.exec('BEGIN');
    try {
      for (const statement of m.sql) {
        if (statement.trim()) await pglite.exec(statement);
      }
      await pglite.query('INSERT INTO drizzle.__drizzle_migrations (hash, created_at) VALUES ($1, $2)', [m.hash, m.folderMillis]);
      await pglite.exec('COMMIT');
    } catch (e: any) {
      await pglite.exec('ROLLBACK');
      console.error(`[migrate] FAILED in ${m.tag}: ${e.message}`);
      process.exit(1);
    }
  }

  const tableRes = await pglite.query<{ n: number }>("SELECT count(*)::int AS n FROM information_schema.tables WHERE table_schema='public'");
  const colRes = await pglite.query<{ n: number }>("SELECT count(*)::int AS n FROM information_schema.columns WHERE table_schema='public'");
  console.log(`[migrate] PGlite applied ${pending.length}; public tables ${tableRes.rows[0]?.n}; columns ${colRes.rows[0]?.n}`);
}

process.exit(0);
