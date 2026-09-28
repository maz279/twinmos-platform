// P7: locally-executable DR drill (dev-stack equivalent of deploy/restore.sh --drill).
//
// Production drill = pg_restore a nightly dump into a THROWAWAY Postgres + run
// verification queries (deploy/restore.sh). The dev stack has no pg_dump; its
// "backup of record" is declarative (migrations + seed + corpus import), so
// this drill rebuilds a throwaway database from exactly those inputs, times
// the whole path, runs the same verification queries, then boots the FULL API
// against the restored DB and exercises key routes. It proves the
// restore→verify→serve procedure end-to-end; the pg_restore mechanics get
// proven on the staging VM (docs/runbooks/DR.md drill log).
//
// The throwaway DB lives in a temp dir; the dev database is never touched.
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url)); // twinmso_codebase/tooling
const ROOT = join(HERE, '..');
const TMP = mkdtempSync(join(tmpdir(), 'twinmos-dr-drill-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.NODE_ENV = 'test'; // test env: buildApp boots on PGlite
process.env.AUDIT_RETENTION_DISABLED ??= '1';
const MIGRATIONS = join(ROOT, 'packages', 'db', 'migrations');
const mod = (p) => import(pathToFileURL(join(ROOT, p)).href); // Windows-safe dynamic imports

const t0 = Date.now();
const step = (label, ms) => console.log(`[drill] ${label.padEnd(34)} ${(ms / 1000).toFixed(1)}s`);
let last = t0;
const mark = (label) => { const n = Date.now(); step(label, n - last); last = n; };

console.log(`[drill] throwaway DB: ${process.env.PGLITE_DATA}`);
const { createDb } = await mod('node_modules/@twinmos/db/src/index.ts');
const { migrate } = await import(pathToFileURL(join(ROOT, 'node_modules', 'drizzle-orm', 'pglite', 'migrator.js')).href);

// 1) RESTORE equivalent — replay the declarative backup
let db = createDb();
await db.$client.exec('CREATE SCHEMA IF NOT EXISTS drizzle');
await migrate(db, { migrationsFolder: MIGRATIONS });
mark('restore: migrations');

// The seed/corpus run as SUBPROCESSES — PGlite is single-process per datadir,
// so close this handle first and re-open afterwards to see their writes.
await db.$client.close();

const { spawnSync } = await import('node:child_process');
const run = (cmd) => spawnSync(cmd, { cwd: join(ROOT, 'apps', 'api'), shell: true, stdio: 'ignore' });
if (run('node --experimental-strip-types --no-warnings scripts/seed.ts').status !== 0) throw new Error('seed failed');
mark('restore: seed');
const corpus = spawnSync('node --experimental-strip-types --no-warnings tooling/import-corpus.ts', {
  cwd: ROOT, shell: true, stdio: 'ignore',
  env: { ...process.env, PGLITE_DATA: join(TMP, 'db') },
});
if (corpus.status !== 0) throw new Error('corpus import failed');
mark('restore: corpus import');

// Re-open the handle AFTER the subprocess writes (single-process rule)
db = createDb();

// 2) VERIFICATION queries (same four as deploy/restore.sh + extras)
const { user, product, article, formSubmission, auditLog, partnerOrg } = await mod('node_modules/@twinmos/db/src/schema.ts');
const count = async (table) => (await db.select({ id: table.id }).from(table).limit(10000)).length;
const counts = {
  users: await count(user),
  products: await count(product),
  articles: await count(article),
  leads: await count(formSubmission),
  audit: await count(auditLog),
  partnerOrgs: await count(partnerOrg),
};
mark('verify: queries');
console.log('[drill] counts:', JSON.stringify(counts));
const failures = [];
if (counts.users < 1) failures.push('users empty');
if (counts.products < 1) failures.push('products empty');
if (counts.articles < 100) failures.push(`articles=${counts.articles} (expected corpus scale)`);
if (counts.partnerOrgs < 1) failures.push('partner orgs empty');

// 3) SERVE check — boot the full app against the restored DB
const { buildApp } = await mod('apps/api/src/app.ts');
const app = buildApp(db);
const health = await app.request('/api/v1/health');
const i18n = await app.request('/api/v1/i18n/ar');
const anonAdmin = await app.request('/api/v1/admin/stats');
const sn = await app.request('/api/v1/sn-check', {
  method: 'POST', headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ serial: 'TM-DEMO-0001' }),
});
mark('serve: API boot + probes');
if (health.status !== 200) failures.push(`health ${health.status}`);
if (i18n.status !== 200) failures.push(`i18n ${i18n.status}`);
if (anonAdmin.status !== 401) failures.push(`authz ${anonAdmin.status}`);
if (sn.status !== 200) failures.push(`sn-check ${sn.status}`);

// 4) close + report
await db.$client.close();
rmSync(TMP, { recursive: true, force: true });
const total = ((Date.now() - t0) / 1000).toFixed(1);
console.log('\n[drill] RESULT:', failures.length ? `FAIL — ${failures.join('; ')}` : 'PASS (local dev-stack drill)');
console.log(`[drill] total ${total}s (RTO budget 4h → dev-stack drill well inside; production pg_restore timing recorded on staging VM)`);
if (failures.length) process.exit(1);
console.log('[drill] paste into docs/runbooks/DR.md drill log:');
console.log(`| local-dev ${new Date().toISOString().slice(0, 10)} | ${total}s | PASS (migrations+seed+corpus restore-equivalent, ${counts.articles} articles, API served) | none |`);
