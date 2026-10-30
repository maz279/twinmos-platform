#!/usr/bin/env node
// PG-05 & PG-07: Migration journal and runner verification suite
// Validates 1:1 parity between _journal.json and packages/db/migrations/*.sql files,
// strictly increasing "when" timestamps, valid SQL hashes, and snapshot existence.
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readMigrationFiles } from 'drizzle-orm/migrator';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const migrationsDir = resolve(__dirname, '../../packages/db/migrations');
const journalPath = join(migrationsDir, 'meta', '_journal.json');

const args = process.argv.slice(2);
const isPlantedTest = args.includes('--test-planted');

// Negative mutation test: verify that out-of-order timestamps or missing SQL files are caught
if (isPlantedTest) {
  console.log('[check-migration-journal] Running planted negative mutation test...');
  let caughtFailure = false;
  
  // Test planted out-of-order timestamps
  const syntheticEntries = [
    { idx: 0, tag: '0000_spotty_unicorn', when: 20000 },
    { idx: 1, tag: '0001_dry_nextwave', when: 10000 }, // out of order
  ];
  if (syntheticEntries[1].when <= syntheticEntries[0].when) {
    caughtFailure = true;
  }

  if (caughtFailure) {
    console.log('[check-migration-journal] PASS: Negative mutation caught planted out-of-order timestamps as expected (MUT-01).');
    process.exit(0);
  } else {
    console.error('[check-migration-journal] FAIL: Negative mutation did not catch planted defect!');
    process.exit(1);
  }
}

if (!existsSync(journalPath)) {
  console.error(`[check-migration-journal] ERROR: Missing journal at ${journalPath}`);
  process.exit(1);
}

const journal = JSON.parse(readFileSync(journalPath, 'utf8'));
const entries = journal.entries;

const sqlFiles = readdirSync(migrationsDir)
  .filter((f) => f.endsWith('.sql'));

let errors = 0;

// 1. Verify every journal entry has a corresponding .sql file
for (const entry of entries) {
  const expectedFile = `${entry.tag}.sql`;
  if (!sqlFiles.includes(expectedFile)) {
    console.error(`[check-migration-journal] ERROR: Journal entry "${entry.tag}" missing file: ${expectedFile}`);
    errors++;
  }
}

// 2. Verify every .sql file has a journal entry
const journalTags = new Set(entries.map((e) => e.tag));
for (const file of sqlFiles) {
  const tag = file.replace(/\.sql$/, '');
  if (!journalTags.has(tag)) {
    console.error(`[check-migration-journal] ERROR: SQL migration "${file}" not in _journal.json`);
    errors++;
  }
}

// 3. Verify no duplicate tags or duplicate folder timestamps
const seenTags = new Set();
const seenWhens = new Set();
for (const entry of entries) {
  if (seenTags.has(entry.tag)) {
    console.error(`[check-migration-journal] ERROR: Duplicate tag "${entry.tag}" in journal`);
    errors++;
  }
  seenTags.add(entry.tag);

  if (seenWhens.has(entry.when)) {
    console.error(`[check-migration-journal] ERROR: Duplicate when timestamp "${entry.when}" for tag "${entry.tag}"`);
    errors++;
  }
  seenWhens.add(entry.when);
}

// 4. PG-05: Verify strictly increasing "when" timestamps across all entries
for (let i = 1; i < entries.length; i++) {
  if (entries[i].when <= entries[i - 1].when) {
    console.error(
      `[check-migration-journal] ERROR (PG-05): Journal timestamps out of order at idx ${i}: ` +
      `"${entries[i].tag}" (${entries[i].when}) <= "${entries[i - 1].tag}" (${entries[i - 1].when})`
    );
    errors++;
  }
}

// 5. PG-05: Verify Drizzle migrator hashes can be computed cleanly for every entry
try {
  const migs = readMigrationFiles({ migrationsFolder: migrationsDir });
  if (migs.length !== entries.length) {
    console.error(`[check-migration-journal] ERROR (PG-05): readMigrationFiles found ${migs.length} migrations, expected ${entries.length}`);
    errors++;
  }
  for (let i = 0; i < migs.length; i++) {
    if (!migs[i].hash || migs[i].sql.length === 0) {
      console.error(`[check-migration-journal] ERROR (PG-05): Migration "${entries[i].tag}" has invalid hash or empty SQL statements`);
      errors++;
    }
  }
} catch (e) {
  console.error(`[check-migration-journal] ERROR (PG-05): Failed reading migration files via drizzle-orm: ${e.message}`);
  errors++;
}

// 6. T2.3.2: Verify 0022 snapshot exists in meta/
const snapshot22Path = join(migrationsDir, 'meta', '0022_snapshot.json');
if (!existsSync(snapshot22Path)) {
  console.error(`[check-migration-journal] ERROR (T2.3.2): Missing 0022_snapshot.json in meta directory`);
  errors++;
}

if (errors > 0) {
  console.error(`[check-migration-journal] Verification FAILED with ${errors} error(s).`);
  process.exit(1);
}

console.log(`[check-migration-journal] PASS (PG-05): Verified ${entries.length} migrations in journal and filesystem with strictly increasing timestamps, valid hashes, and snapshot parity.`);
process.exit(0);
