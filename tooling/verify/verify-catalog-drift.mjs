// verify-catalog-drift.mjs — fails when the committed catalog snapshot
// (apps/web/public/assets/js/catalog-data.js, the outage fallback for
// /api/catalog-data.js) diverges from the live Delivery API catalogue.
// With --expect-live the API must be reachable; drift or outage = failure.
// Usage: node tooling/verify/verify-catalog-drift.mjs [--expect-live]
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..', '..');
const SNAPSHOT = resolve(ROOT, 'apps/web/public/assets/js/catalog-data.js');
const LIVE_URL = process.env.DELIVERY_PRODUCTS_URL || 'http://127.0.0.1:8787/api/v1/delivery/products';
const expectLive = process.argv.includes('--expect-live');

function parseSnapshot() {
  const raw = readFileSync(SNAPSHOT, 'utf8');
  const marker = 'window.TM = ';
  const start = raw.indexOf(marker);
  if (start === -1) throw new Error('snapshot has no window.TM assignment');
  let line = raw.slice(start + marker.length, raw.indexOf('\n', start)).trim();
  if (line.endsWith(';')) line = line.slice(0, -1);
  return JSON.parse(line);
}

async function main() {
  const snap = parseSnapshot();
  const snapBySlug = new Map((snap.products || []).map((p) => [p.id, p]));

  let live = null;
  try {
    const res = await fetch(LIVE_URL, { signal: AbortSignal.timeout(8000), headers: { Accept: 'application/json' } });
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data)) live = json.data;
    }
  } catch {
    /* outage handled below */
  }

  if (!live) {
    if (expectLive) {
      console.error(`[catalog-drift] FAIL — Delivery API unreachable at ${LIVE_URL} and --expect-live was set.`);
      process.exit(1);
    }
    console.warn('[catalog-drift] WARN — Delivery API unreachable; skipping live comparison (snapshot-only check).');
    process.exit(0);
  }

  const liveSlugs = new Set(live.map((p) => p.slug || String(p.id)));
  const snapSlugs = new Set(snapBySlug.keys());
  const missingInSnapshot = [...liveSlugs].filter((s) => !snapSlugs.has(s));
  const extraInSnapshot = [...snapSlugs].filter((s) => !liveSlugs.has(s));
  const fieldDrift = [];
  for (const p of live) {
    const s = snapBySlug.get(p.slug || String(p.id));
    if (!s) continue;
    if (p.name && s.name && p.name !== s.name) fieldDrift.push(`${p.slug}: name "${s.name}" -> "${p.name}"`);
    if ((p.warranty || '') !== (s.warranty || '')) fieldDrift.push(`${p.slug}: warranty "${s.warranty}" -> "${p.warranty ?? ''}"`);
    if (Number(p.priceUsd ?? null) !== Number(s.priceUsd ?? null)) fieldDrift.push(`${p.slug}: priceUsd ${s.priceUsd} -> ${p.priceUsd ?? null}`);
    if (p.shortSpec && s.shortSpec && p.shortSpec !== s.shortSpec) fieldDrift.push(`${p.slug}: shortSpec changed`);
  }

  if (missingInSnapshot.length || extraInSnapshot.length || fieldDrift.length) {
    console.error('[catalog-drift] FAIL — snapshot fallback is stale vs live catalogue:');
    if (missingInSnapshot.length) console.error(`  live-only (missing from snapshot): ${missingInSnapshot.join(', ')}`);
    if (extraInSnapshot.length) console.error(`  snapshot-only (unpublished/deleted live): ${extraInSnapshot.join(', ')}`);
    for (const f of fieldDrift.slice(0, 20)) console.error(`  ${f}`);
    console.error('Regenerate the snapshot: start the API and run `npm run build --workspace @twinmos/web` (prebuild regenerates catalog-data.js).');
    process.exit(1);
  }
  console.log(`[catalog-drift] OK — snapshot matches live catalogue (${live.length} products).`);
}

main().catch((e) => {
  console.error('[catalog-drift] FAIL —', e.message);
  process.exit(1);
});
