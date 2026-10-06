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
import { eq } from 'drizzle-orm';

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
const looseKeyOf = (r: any) =>
  `${r.deviceType}|${String(r.deviceBrand).toLowerCase()}|${String(r.deviceModel).toLowerCase()}`;
const existingKeys = new Set(existing.map(keyOf));

// Prototype rows indexed by loose key — the reconciliation source of truth.
const prototypeRows = new Map<string, { gen: string | null; form: string | null; cats: string[]; ssdCats: string[] }>();
for (const t of TM.compat.types ?? []) {
  for (const b of t.brands ?? []) {
    for (const m of b.models ?? []) {
      const lk = `${t.id}|${String(b.label).toLowerCase()}|${String(m.l ?? m.v).toLowerCase()}`;
      prototypeRows.set(lk, {
        gen: m.gen || null,
        form: m.form || null,
        cats: m.cats ?? [],
        ssdCats: m.ssd_cats ?? [],
      });
    }
  }
}
const existingByLoose = new Map<string, any[]>();
for (const r of existing) {
  const k = looseKeyOf(r);
  if (!existingByLoose.has(k)) existingByLoose.set(k, []);
  existingByLoose.get(k)!.push(r);
}

// P2.3 pre-pass: reconcile legacy rows created before gen/form existed in the
// import path (their natural key diverged from the prototype's, so re-imports
// inserted duplicates — audit U-7's empty-cats IdeaPad was exactly this).
// For each loose-key cluster, promote the fullest row to canonical, backfill
// empty cats/ssdCats/gen/form from the prototype, and delete pure duplicates
// (rows whose every field is a subset of the canonical row).
let reconciled = 0;
for (const [lk, rows] of existingByLoose) {
  if (rows.length < 2) continue;
  const proto = prototypeRows.get(lk);
  const canonical = rows.reduce((best, r) => {
    const score = (r.memoryGen ? 1 : 0) + (r.formFactor ? 1 : 0) + ((r.cats ?? []).length ? 1 : 0) + ((r.ssdCats ?? []).length ? 1 : 0);
    const bestScore = (best.memoryGen ? 1 : 0) + (best.formFactor ? 1 : 0) + ((best.cats ?? []).length ? 1 : 0) + ((best.ssdCats ?? []).length ? 1 : 0);
    return score > bestScore ? r : best;
  });
  for (const r of rows) {
    if (r.id === canonical.id) continue;
    const dup = await db.delete(compatibilityRule).where(eq(compatibilityRule.id, r.id)).returning({ id: compatibilityRule.id });
    if (dup.length) { reconciled++; existingKeys.delete(keyOf(r)); }
  }
  if (proto) {
    await db.update(compatibilityRule).set({
      ...(proto.gen && !canonical.memoryGen ? { memoryGen: proto.gen } : {}),
      ...(proto.form && !canonical.formFactor ? { formFactor: proto.form } : {}),
      ...(proto.cats.length && !(canonical.cats ?? []).length ? { cats: proto.cats } : {}),
      ...(proto.ssdCats.length && !(canonical.ssdCats ?? []).length ? { ssdCats: proto.ssdCats } : {}),
    }).where(eq(compatibilityRule.id, canonical.id));
    existingKeys.delete(keyOf(canonical));
  }
}
if (reconciled) console.log(`[import-compat] reconciled ${reconciled} duplicate rule(s) by loose key (gen/form backfilled from prototype)`);

let created = 0;
let skipped = 0;
let repaired = 0;
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
      if (existingKeys.has(key)) {
        // P2.3 (audit U-7): already-present rows keep admin edits, BUT a rule
        // whose prototype mapping carried categories and the DB row lost them
        // (empty cats/ssdCats) breaks the finder — no upgrade cards render.
        // Backfill empties only; never overwrite non-empty admin values.
        const existingRow = existing.find((r) => keyOf(r) === key)!;
        const protoCats = row.cats ?? [];
        const protoSsd = row.ssdCats ?? [];
        if ((protoCats.length && !(existingRow.cats ?? []).length) || (protoSsd.length && !(existingRow.ssdCats ?? []).length)) {
          await db.update(compatibilityRule).set({
            ...(protoCats.length && !(existingRow.cats ?? []).length ? { cats: protoCats } : {}),
            ...(protoSsd.length && !(existingRow.ssdCats ?? []).length ? { ssdCats: protoSsd } : {}),
          }).where(eq(compatibilityRule.id, existingRow.id));
          repaired++;
        }
        skipped++;
        continue;
      }
      await db.insert(compatibilityRule).values(row);
      existingKeys.add(key);
      created++;
    }
  }
}

const total = (await db.select({ id: compatibilityRule.id }).from(compatibilityRule)).length;
console.log(`[import-compat] prototype models=${(TM.compat.types ?? []).reduce((a, t) => a + t.brands.reduce((x, b) => x + b.models.length, 0), 0)} created=${created} already-present=${skipped} repaired-cats=${repaired} rules-total=${total}`);
const client = (db as any).$client;
await client.close();
