// DB client factory — PGlite (dev/test) or Postgres (staging/prod).
// PRODUCTION GUARD: refuses PGlite when NODE_ENV=production (PGlite is single-tenant dev tooling).
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { drizzle } from 'drizzle-orm/pglite';
import type { PgliteDatabase } from 'drizzle-orm/pglite';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { PGlite } from '@electric-sql/pglite';
import pg from 'pg';
import * as schema from './schema.ts';
import { acquireDataDirLock } from './lock.ts';
export * from './schema.ts'; // tables re-exported for apps (single import surface)
export { acquireDataDirLock, releaseDataDirLock } from './lock.ts';

/**
 * Canonical DB handle type. The Postgres branch is cast to the PGlite-flavoured
 * type at the factory boundary: both expose the identical drizzle query API
 * (parameter-bound builders), and downstream code stays on one clean type
 * instead of a union that breaks overload resolution.
 */
export type DB = PgliteDatabase<typeof schema>;

export function createPgliteDb(dataDir?: string): DB {
  const dir = dataDir ?? process.env.PGLITE_DATA
    ?? resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'apps', 'api', 'data', 'dev.pgdata');
  acquireDataDirLock(dir);
  mkdirSync(dirname(dir), { recursive: true });
  return drizzle(new PGlite(dir), { schema });
}

export function createDb(databaseUrl?: string, options?: { forcePglite?: boolean }): DB {
  if (options?.forcePglite || process.env.FORCE_PGLITE === '1') {
    // The production guard must come first: FORCE_PGLITE used to bypass it and
    // run production on an embedded single-file database (ZT audit).
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FORCE_PGLITE is not allowed when NODE_ENV=production (PGlite is dev/test only)');
    }
    return createPgliteDb();
  }
  const url = databaseUrl ?? process.env.DATABASE_URL;
  if (process.env.NODE_ENV === 'production' && !url) {
    throw new Error('DATABASE_URL is required in production (PGlite is dev-only)');
  }
  if (url && process.env.FORCE_PGLITE !== '1') {
    const pool = new pg.Pool({ connectionString: url, max: 10 });
    return drizzlePg(pool, { schema }) as unknown as DB;
  }
  return createPgliteDb();
}
