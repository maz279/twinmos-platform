// Catalog importer — bootstraps the DB product catalog from the prototype's
// data.js (137 SKUs with warranty/specs/badges), so the admin Products module
// manages the SAME catalog the public site renders (master plan §4.1 direction).
// Idempotent by design: brands/categories/products are only INSERTED when
// missing (onConflictDoNothing / skip-by-slug) — re-running never clobbers
// admin edits. Delete a product in the admin to have it re-imported fresh.
// Run from repo root:  node --experimental-strip-types --no-warnings tooling/import-catalog.ts
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDb, product, brand, category } from './db-bridge.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA_JS = join(HERE, '..', 'apps', 'web', 'public', 'assets', 'js', 'data.js');

type ProtoProduct = {
  id: string; name: string; cat: string; catLabel: string; shortSpec?: string;
  warranty?: string; badge?: string; brand?: string; specs?: Record<string, unknown>;
};

const src = readFileSync(DATA_JS, 'utf8');
const start = src.indexOf('window.TM = ') + 'window.TM = '.length;
// brace-match the object literal (data.js may carry further statements after TM)
let depth = 0, end = -1, inStr: string | null = null;
for (let i = start; i < src.length; i++) {
  const ch = src[i];
  if (inStr) { if (ch === inStr && src[i - 1] !== '\\') inStr = null; continue; }
  if (ch === '"' || ch === "'") { inStr = ch; continue; }
  if (ch === '{') depth++;
  else if (ch === '}') { depth--; if (depth === 0) { end = i; break; } }
}
if (end < 0) throw new Error('Could not parse window.TM object from data.js');
const TM = JSON.parse(src.slice(start, end + 1)) as { products: ProtoProduct[] };
const items = (TM.products ?? []).filter((p) => p && p.id && p.name);

function slugify(s: string): string {
  return String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
}
/** Deterministic DB SKU from the prototype id: A-Z0-9-, ≤40 chars, collision-safe suffix when truncated. */
function skuFromId(id: string): string {
  const base = id.toUpperCase().replace(/[^A-Z0-9-]/g, '-');
  if (base.length <= 40) return base;
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return base.slice(0, 34) + '-' + h.toString(36).toUpperCase().slice(0, 5);
}

const db = createDb();

// 1) taxonomy — insert-missing only
const brands = [...new Map(items.filter((p) => p.brand).map((p) => [slugify(p.brand!), p.brand!])).entries()];
const cats = [...new Map(items.map((p) => [p.cat, p.catLabel ?? p.cat])).entries()];
for (const [slug, name] of brands) {
  await db.insert(brand).values({ slug, name }).onConflictDoNothing({ target: brand.slug });
}
for (const [slug, name] of cats) {
  await db.insert(category).values({ slug, name }).onConflictDoNothing({ target: category.slug });
}
const brandRows = await db.select({ id: brand.id, slug: brand.slug }).from(brand);
const catRows = await db.select({ id: category.id, slug: category.slug }).from(category);
const brandBySlug = new Map(brandRows.map((b) => [b.slug, b.id]));
const catBySlug = new Map(catRows.map((c) => [c.slug, c.id]));

// 2) products — skip anything already present (by slug OR sku)
const existingSlugs = new Set((await db.select({ slug: product.slug }).from(product)).map((r) => r.slug));
const existingSkus = new Set((await db.select({ sku: product.sku }).from(product)).map((r) => r.sku));
// prototype catalog has no brand for some rows — use the first brand as a safe anchor
const fallbackBrandId = brandRows[0]?.id;
if (!fallbackBrandId) throw new Error('No brands available — taxonomy import failed');

let created = 0;
const skipped: string[] = [];
for (const p of items) {
  const sku = skuFromId(p.id);
  if (existingSlugs.has(p.id) || existingSkus.has(sku)) { skipped.push(p.id); continue; }
  const categoryId = catBySlug.get(p.cat) ?? catRows[0]?.id;
  const brandId = (p.brand && brandBySlug.get(slugify(p.brand))) ?? fallbackBrandId;
  await db.insert(product).values({
    sku, slug: p.id, name: p.name, brandId, categoryId,
    status: 'published', // already live on the prototype site — truthful state
    specs: p.specs ?? {},
    description: p.shortSpec ?? '',
    warranty: p.warranty ?? null,
    badges: p.badge ? [p.badge] : [],
  });
  existingSlugs.add(p.id);
  existingSkus.add(sku);
  created++;
}

const total = (await db.select({ sku: product.sku }).from(product)).length;
console.log(`[import-catalog] prototype items=${items.length} created=${created} already-present=${skipped.length} catalog-total=${total}`);
const client = (db as any).$client;
await client.close();
