// Compat corpus importer — bootstraps the QVL rule table from the prototype's
// data.js compat hierarchy (35 models across 4 device types), so the admin
// Compatibility module manages the SAME rules the public finder renders.
// Idempotent: inserts only rules whose natural key
// (type | brand | model | gen | form) is missing — re-runs never clobber edits.
// Run from repo root:  node --experimental-strip-types --no-warnings tooling/import-compat.ts
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDb, compatibilityRule } from './db-bridge.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA_JS = join(HERE, '..', 'apps', 'web', 'public', 'assets', 'js', 'data.js');

const src = readFileSync(DATA_JS, 'utf8');
const start = src.indexOf('window.TM = ') + 'window.TM = '.length;
let depth = 0, end = -1, inStr: string | null = null;
for (let i = start; i < src.length; i++) {
  const ch = src[i];
  if (inStr) { if (ch === inStr && src[i - 1] !== '\\') inStr = null; continue; }
  if (ch === '"' || ch === "'") { inStr = ch; continue; }
  if (ch === '{') depth++;
  else if (ch === '}') { depth--; if (depth === 0) { end = i; break; } }
}
if (end < 0) throw new Error('Could not parse window.TM object from data.js');
const TM = JSON.parse(src.slice(start, end + 1)) as {
  compat: { types: Array<{ id: string; label: string; brands: Array<{ id: string; label: string; models: Array<Record<string, any>> }> }> };
};

const db = createDb();
const existing = await db.select().from(compatibilityRule);
const keyOf = (r: any) =>
  `${r.deviceType}|${String(r.deviceBrand).toLowerCase()}|${String(r.deviceModel).toLowerCase()}|${r.memoryGen ?? ''}|${r.formFactor ?? ''}`;
const existingKeys = new Set(existing.map(keyOf));

let created = 0;
let skipped = 0;
for (const t of TM.compat.types ?? []) {
  for (const b of t.brands ?? []) {
    for (const m of b.models ?? []) {
      const row = {
        deviceType: t.id,
        deviceBrand: b.label,
        deviceModel: m.l ?? m.v,
        memoryGen: m.gen || null,
        formFactor: m.form || null,
        maxGb: m.max_gb ?? null,
        slots: m.slots ?? null,
        speed: m.speed || null,
        cats: m.cats ?? [],
        ssdNote: m.ssd || null,
        ssdCats: m.ssd_cats ?? [],
        notes: m.note || null,
      };
      const key = keyOf(row);
      if (existingKeys.has(key)) { skipped++; continue; }
      await db.insert(compatibilityRule).values(row);
      existingKeys.add(key);
      created++;
    }
  }
}

const total = (await db.select({ id: compatibilityRule.id }).from(compatibilityRule)).length;
console.log(`[import-compat] prototype models=${(TM.compat.types ?? []).reduce((a, t) => a + t.brands.reduce((x, b) => x + b.models.length, 0), 0)} created=${created} already-present=${skipped} rules-total=${total}`);
const client = (db as any).$client;
await client.close();
