#!/usr/bin/env node
// PG-07: Migration journal verification suite
// Validates 1:1 parity between _journal.json and packages/db/migrations/*.sql files.
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const migrationsDir = resolve(__dirname, '../../packages/db/migrations');
const journalPath = join(migrationsDir, 'meta', '_journal.json');

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

if (errors > 0) {
  console.error(`[check-migration-journal] Verification FAILED with ${errors} error(s).`);
  process.exit(1);
}

console.log(`[check-migration-journal] PASS: Verified ${entries.length} migrations in journal and filesystem.`);
process.exit(0);
