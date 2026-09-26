// DB client factory — PGlite (dev/test) or Postgres (staging/prod).
// PRODUCTION GUARD: refuses PGlite when NODE_ENV=production (PGlite is single-tenant dev tooling).
import { drizzle } from 'drizzle-orm/pglite';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { PGlite } from '@electric-sql/pglite';
import pg from 'pg';
import * as schema from './schema.ts';

export type DB = ReturnType<typeof createDb>;

export function createDb(databaseUrl?: string) {
  const url = databaseUrl ?? process.env.DATABASE_URL;
  if (process.env.NODE_ENV === 'production' && !url) {
    throw new Error('DATABASE_URL is required in production (PGlite is dev-only)');
  }
  if (url) {
    const pool = new pg.Pool({ connectionString: url, max: 10 });
    return drizzlePg(pool, { schema });
  }
  const dataDir = process.env.PGLITE_DATA ?? './data/dev.pgdata';
  return drizzle(new PGlite(dataDir), { schema });
}
