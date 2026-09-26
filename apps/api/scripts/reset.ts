// Dev convenience: recreate the PGlite dev database from scratch (migrate + seed).
// Needed when the API was force-killed (taskkill /F) — PGlite's WASM Postgres can
// abort on the next boot after an unclean shutdown. Dev data is fully reproducible.
import { rmSync } from 'node:fs';
import { execSync } from 'node:child_process';

const dataDir = process.env.PGLITE_DATA ?? './data/dev.pgdata';
console.log('[reset] removing ' + dataDir);
rmSync(dataDir, { recursive: true, force: true });
rmSync('./data', { recursive: true, force: true });
execSync('node --experimental-strip-types --no-warnings scripts/migrate.ts', { stdio: 'inherit', env: process.env });
execSync('node --experimental-strip-types --no-warnings scripts/seed.ts', { stdio: 'inherit', env: process.env });
console.log('[reset] dev database recreated');
process.exit(0);
