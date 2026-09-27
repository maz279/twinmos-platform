// Applies packages/db/migrations to the dev database (PGlite) or DATABASE_URL (Postgres).
// Usage: npm run db:migrate   (from apps/api, or root: npm run db:migrate)
import { mkdirSync } from 'node:fs';
import { createDb } from '@twinmos/db';
import { PGlite } from '@electric-sql/pglite';

const db = createDb();
const client = (db as any).$client as PGlite | undefined;

if (client && !process.env.DATABASE_URL) {
  // PGlite path — use the pglite migrator
  mkdirSync('./data', { recursive: true });
  await client.exec('CREATE SCHEMA IF NOT EXISTS drizzle');
  const { migrate } = await import('drizzle-orm/pglite/migrator');
  await migrate(db, { migrationsFolder: '../../packages/db/migrations' });
  console.log('[migrate] PGlite schema applied from packages/db/migrations');
} else {
  // Postgres path — same migration files via the node-postgres migrator
  // (db is typed as the PGlite-flavoured handle; same driver API, cast at the boundary)
  const { migrate } = await import('drizzle-orm/node-postgres/migrator');
  await migrate(db as unknown as Parameters<typeof migrate>[0], { migrationsFolder: '../../packages/db/migrations' });
  console.log('[migrate] Postgres schema applied');
}
process.exit(0);
