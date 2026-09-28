// Rebuilds the DEV PGlite database from scratch: migrations + seed + corpus.
// Use when the dev DB is corrupted (typically after the API was force-killed
// mid-write — PGlite datadirs are fragile across hard kills; see P6 memory).
// The dev DB is disposable demo data — this is always safe to run.
// Run from anywhere:  node --experimental-strip-types --no-warnings tooling/devdb-rebuild.mjs
import { existsSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url)); // .../twinmso_codebase/tooling
const ROOT = join(HERE, '..');
const API = join(ROOT, 'apps', 'api');
const DATA_DIR = join(API, 'data', 'dev.pgdata');
// createDb resolves './data/dev.pgdata' from CWD — pin the datadir explicitly so
// every step (and any stray cwd like the repo root) hits the SAME database.
const ENV = { ...process.env, PGLITE_DATA: DATA_DIR };
const run = (cmd, cwd) => execSync(cmd, { cwd, stdio: 'inherit', env: ENV });

console.log('[devdb-rebuild] removing', DATA_DIR);
rmSync(DATA_DIR, { recursive: true, force: true });
// a second datadir at the repo root is the classic cwd-relative trap — remove it
const stray = join(ROOT, 'data', 'dev.pgdata');
if (existsSync(stray)) { rmSync(stray, { recursive: true, force: true }); console.log('[devdb-rebuild] removed stray cwd-relative datadir', stray); }
console.log('[devdb-rebuild] applying migrations…');
run('node --experimental-strip-types --no-warnings scripts/migrate.ts', API);
console.log('[devdb-rebuild] seeding…');
run('node --experimental-strip-types --no-warnings scripts/seed.ts', API);
console.log('[devdb-rebuild] importing corpus…');
run('node --experimental-strip-types --no-warnings tooling/import-corpus.ts', ROOT);
console.log('[devdb-rebuild] done — restart the API (it must NOT be running while you run this).');
