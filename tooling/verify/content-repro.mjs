// CONTENT-REPRO Verification Test (Task T3.3.4 / B11 / MS3.3)
// Validates content reproducibility and seeder/importer idempotence:
// 1. Spins up a fresh, isolated database
// 2. Applies all migrations
// 3. Runs tracked seeder and content reconciler (Run 1)
// 4. Computes deterministic cryptographic hashes (SHA-256) per table
// 5. Runs seeder and reconciler a second time (Run 2)
// 6. Asserts 0 mutations: table hashes and row counts must be 100% identical.

import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';

console.log('================================================================');
console.log('  CONTENT-REPRO: Content Reproducibility & Idempotence Audit');
console.log('  Task T3.3.4 · Source B11 · Zero Drift & Zero Mutation Check');
console.log('================================================================\n');

const repoRoot = resolve(process.cwd());
const TMP = mkdtempSync(join(tmpdir(), 'twinmos-repro-'));
const testDbDir = join(TMP, 'db');
const migrationsFolder = resolve(repoRoot, 'packages/db/migrations');

process.env.PGLITE_DATA = testDbDir;
process.env.NODE_ENV = 'test';

function normalizeRows(rows) {
  return rows.map((r) => {
    const clone = { ...r };
    if (clone.createdAt) clone.createdAt = new Date(clone.createdAt).toISOString();
    if (clone.updatedAt) clone.updatedAt = new Date(clone.updatedAt).toISOString();
    if (clone.publishedAt) clone.publishedAt = new Date(clone.publishedAt).toISOString();
    return clone;
  }).sort((a, b) => {
    const keyA = a.id ?? a.slug ?? a.question ?? a.term ?? a.name ?? '';
    const keyB = b.id ?? b.slug ?? b.question ?? b.term ?? b.name ?? '';
    return String(keyA).localeCompare(String(keyB));
  });
}

function hashRows(rows) {
  const normalized = normalizeRows(rows);
  return createHash('sha256').update(JSON.stringify(normalized)).digest('hex');
}

async function run() {
  const { createPgliteDb, releaseDataDirLock, page, product, article, faq, glossaryTerm, office, testimonial, policyDocument, distributor, compatibilityRule } = await import('@twinmos/db');
  const { migrate } = await import('drizzle-orm/pglite/migrator');

  const tables = [
    { name: 'product', table: product },
    { name: 'article', table: article },
    { name: 'faq', table: faq },
    { name: 'glossary_term', table: glossaryTerm },
    { name: 'office', table: office },
    { name: 'testimonial', table: testimonial },
    { name: 'policy_document', table: policyDocument },
    { name: 'distributor', table: distributor },
    { name: 'compatibility_rule', table: compatibilityRule },
    { name: 'page', table: page },
  ];

  try {
    // 1. Initialize DB and apply migrations
    console.log('[1/5] Initializing fresh isolated test database at:\n      ', testDbDir);
    let dbHandle = createPgliteDb(testDbDir);
    await dbHandle.$client.exec('CREATE SCHEMA IF NOT EXISTS drizzle');
    await migrate(dbHandle, { migrationsFolder });
    console.log('      ✓ Migrations applied successfully.');

    // Release handle before invoking child processes
    await dbHandle.$client.close();
    releaseDataDirLock(testDbDir);

    // 2. Run tracked seeders / importers (Run 1)
    console.log('\n[2/5] Executing initial seed & import (Run 1)...');
    execSync('node --experimental-strip-types --no-warnings tooling/import-corpus-v2.ts', {
      cwd: repoRoot,
      env: { ...process.env, PGLITE_DATA: testDbDir },
      stdio: 'pipe',
    });
    execSync('node --experimental-strip-types --no-warnings tooling/seed-phase-d-pages.ts', {
      cwd: repoRoot,
      env: { ...process.env, PGLITE_DATA: testDbDir },
      stdio: 'pipe',
    });
    console.log('      ✓ Initial import & seed completed.');

    // 3. Compute baseline table hashes
    console.log('\n[3/5] Computing baseline cryptographic table hashes (Run 1)...');
    dbHandle = createPgliteDb(testDbDir);
    const run1Hashes = {};
    for (const t of tables) {
      const rows = await dbHandle.select().from(t.table);
      const hash = hashRows(rows);
      run1Hashes[t.name] = { count: rows.length, hash, rows: normalizeRows(rows) };
      console.log(`      • ${t.name.padEnd(20)}: ${rows.length.toString().padStart(3)} rows | SHA-256: ${hash.slice(0, 16)}...`);
    }
    await dbHandle.$client.close();
    releaseDataDirLock(testDbDir);

    // 4. Run seeders / importers a second time (Run 2: Idempotence test)
    console.log('\n[4/5] Executing second seed & import against existing database (Run 2)...');
    execSync('node --experimental-strip-types --no-warnings tooling/import-corpus-v2.ts', {
      cwd: repoRoot,
      env: { ...process.env, PGLITE_DATA: testDbDir },
      stdio: 'pipe',
    });
    execSync('node --experimental-strip-types --no-warnings tooling/seed-phase-d-pages.ts', {
      cwd: repoRoot,
      env: { ...process.env, PGLITE_DATA: testDbDir },
      stdio: 'pipe',
    });
    console.log('      ✓ Second import & seed completed.');

    // 5. Verify zero mutations
    console.log('\n[5/5] Verifying zero mutations between Run 1 and Run 2...');
    dbHandle = createPgliteDb(testDbDir);
    let failureCount = 0;

    for (const t of tables) {
      const rows = await dbHandle.select().from(t.table);
      const hash = hashRows(rows);
      const baseline = run1Hashes[t.name];

      if (rows.length !== baseline.count) {
        console.error(`      ❌ FAIL: ${t.name} row count changed from ${baseline.count} to ${rows.length}`);
        failureCount++;
      } else if (hash !== baseline.hash) {
        console.error(`      ❌ FAIL: ${t.name} hash mutated!\n         Before: ${baseline.hash}\n         After:  ${hash}`);
        // Find which row differed
        const normRows = normalizeRows(rows);
        for (let i = 0; i < normRows.length; i++) {
          const r1 = baseline.rows ? baseline.rows[i] : null;
          const r2 = normRows[i];
          if (r1 && JSON.stringify(r1) !== JSON.stringify(r2)) {
            console.error(`         Row ${i} (${r2.slug || r2.id}) mutated!`);
            for (const k of Object.keys(r2)) {
              if (JSON.stringify(r1[k]) !== JSON.stringify(r2[k])) {
                console.error(`           Field "${k}": Before=${JSON.stringify(r1[k])} After=${JSON.stringify(r2[k])}`);
              }
            }
          }
        }
        failureCount++;
      } else {
        console.log(`      ✓ PASS: ${t.name.padEnd(20)}: 0 mutations (hash matches: ${hash.slice(0, 12)}...)`);
      }
    }
    await dbHandle.$client.close();
    releaseDataDirLock(testDbDir);

    console.log('\n================================================================');
    if (failureCount > 0) {
      console.error(`❌ CONTENT-REPRO FAILED: ${failureCount} table mutation(s) detected.`);
      console.log('================================================================\n');
      process.exit(1);
    }

    console.log('✓ PASS: CONTENT-REPRO passed! All 10 content tables are 100% reproducible and idempotent.');
    console.log('================================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('\nFatal error in CONTENT-REPRO test:', err);
    process.exit(1);
  } finally {
    try {
      rmSync(TMP, { recursive: true, force: true });
    } catch {
      // ignore temp dir cleanup errors on Windows
    }
  }
}

run();
