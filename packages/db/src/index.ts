// DB client factory — PGlite (dev/test) or Postgres (staging/prod).
// PRODUCTION GUARD: refuses PGlite when NODE_ENV=production (PGlite is single-tenant dev tooling).
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { drizzle } from 'drizzle-orm/pglite';
import type { PgliteDatabase } from 'drizzle-orm/pglite';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { PGlite } from '@electric-sql/pglite';
import pg from 'pg';
import * as schema from './schema.ts';
export * from './schema.ts'; // tables re-exported for apps (single import surface)

/**
 * Canonical DB handle type. The Postgres branch is cast to the PGlite-flavoured
 * type at the factory boundary: both expose the identical drizzle query API
 * (parameter-bound builders), and downstream code stays on one clean type
 * instead of a union that breaks overload resolution.
 */
export type DB = PgliteDatabase<typeof schema>;

export function createDb(databaseUrl?: string): DB {
  const url = databaseUrl ?? process.env.DATABASE_URL;
  if (process.env.NODE_ENV === 'production' && !url) {
    throw new Error('DATABASE_URL is required in production (PGlite is dev-only)');
  }
  if (url) {
    const pool = new pg.Pool({ connectionString: url, max: 10 });
    return drizzlePg(pool, { schema }) as unknown as DB;
  }
  const dataDir = process.env.PGLITE_DATA ?? './data/dev.pgdata';
  // PGlite requires the parent directory to exist before first boot
  mkdirSync(dirname(dataDir), { recursive: true });
  return drizzle(new PGlite(dataDir), { schema });
}
