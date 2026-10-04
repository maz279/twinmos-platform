// P3 content exporter — regenerates apps/web/public/assets/js/cms-content.js
// from the DB (published + due only). The site merge layer (cms-merge.js) adds
// ONLY slugs not already present in the prototype data.js, so a corpus import
// can never duplicate what the prototype already renders — parity by design.
// Run from repo root:  node --experimental-strip-types --no-warnings tooling/export-content.mjs
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDb, article, newsPost, faq, product, productVariant, brand, category, compatibilityRule, distributor, marketplaceListing, jobPosting } from './db-bridge.ts';

const HERE = dirname(fileURLToPath(import.meta.url)); // .../twinmso_codebase/tooling
const OUT = join(HERE, '..', 'apps', 'web', 'public', 'assets', 'js', 'cms-content.js');

const db = createDb();
const now = new Date();

const arts = await db.select().from(article);
const news = await db.select().from(newsPost);
const faqs = await db.select().from(faq);

// Build-time slug-diff against the prototype data.js (synced by the prebuild
// before this runs): anything the prototype already renders is EXCLUDED, so
// cms-content.js stays tiny (only genuinely new CMS content) and parity plus
// Lighthouse gates are unaffected.
function prototypeIds() {
  try {
    const src = readFileSync(join(HERE, '..', 'apps', 'web', 'public', 'assets', 'js', 'data.js'), 'utf8');
    const ids = new Set();
    for (const m of src.matchAll(/"id":"([^"]{2,120})"/g)) ids.add(m[1]);
    return ids;
  } catch {
    return new Set(); // data.js not synced yet — export everything (runtime merge still guards)
  }
}
const known = prototypeIds();

const published = (rows, entity) => rows
  .filter((r) => r.status === 'published' && !r.deletedAt && (!r.publishAt || new Date(r.publishAt) <= now))
  .filter((r) => !known.has(r.slug)) // prototype already renders it — skip
  .map((r) => ({
    id: entity + '-' + r.id,
    slug: r.slug,
    title: r.title,
    deck: r.deck ?? (r.tag ?? ''),
    cat: entity === 'news' ? (r.eventDate ? 'Event' : 'News') : r.category,
    tag: r.tag ?? null,
    eventDate: r.eventDate ?? null,
    date: r.publishAt ?? r.createdAt,
    body: r.body,
    source: 'cms',
  }));

// FAQs are admin/support-facing (not consumed by the site merge layer) —
// excluded here so the shipped file carries only what the site renders.
const faqItems = [];

// Published products — the catalog bridge (master plan §4.1 direction).
// The merge layer OVERRIDES matching prototype entries per-field (only
// non-empty values) and appends genuinely new SKUs, so catalog edits made
// in the admin render on the public site after this export runs.
const prods = await db.select().from(product);
const brands = await db.select({ id: brand.id, name: brand.name, slug: brand.slug }).from(brand);
const cats = await db.select({ id: category.id, name: category.name, slug: category.slug }).from(category);
const variantRows = await db.select().from(productVariant);
const variantsByProduct = new Map();
for (const v of variantRows) {
  if (!variantsByProduct.has(v.productId)) variantsByProduct.set(v.productId, []);
  variantsByProduct.get(v.productId).push(v);
}
const brandName = new Map(brands.map((b) => [b.id, b.name]));
const catById = new Map(cats.map((c) => [c.id, c]));
// Public media URL for the imagery bridge. PUBLIC_API_URL is the API root and
// already includes /api/v1 (same convention as forms.js): set → absolute
// (cross-origin dev); unset → same-origin /api/v1 (the production reverse
// proxy). Run dev exports with PUBLIC_API_URL=http://127.0.0.1:8787/api/v1.
const API_BASE = (process.env.PUBLIC_API_URL ?? '').replace(/\/+$/, '');
const mediaUrl = (id, variant) => `${API_BASE || '/api/v1'}/media/${id}/file${variant ? '?variant=' + variant : ''}`;
const catalog = prods
  .filter((p) => p.status === 'published' && !p.deletedAt)
  .map((p) => {
    const cat = p.categoryId ? catById.get(p.categoryId) : undefined;
    const f = p.facets ?? {};
    const variants = (variantsByProduct.get(p.id) ?? [])
      .map((v) => [v.attrs?.capacity, v.attrs?.speed].filter(Boolean).join(' · '))
      .filter(Boolean);
    const out = {
      slug: p.slug,
      sku: p.sku,
      name: p.name,
      cat: cat?.slug ?? '',
      catLabel: cat?.name ?? '',
      brand: p.brandId ? brandName.get(p.brandId) ?? '' : '',
      description: p.description || '',
      shortSpec: p.shortSpec || p.description || '',
      warranty: p.warranty ?? null,
      badges: p.badges ?? [],
      specs: p.specs && Object.keys(p.specs).length ? p.specs : null,
      priceUsd: p.priceUsd != null ? Number(p.priceUsd) : null,
      currency: p.currency,
      // 0016 storefront facets + variant chips (public shop filters / PDP)
      gen: f.gen || '', cap: f.cap || '', interface: f.interface || '', form: f.form || '',
      variants: variants.length ? variants : null,
    };
    // Imagery bridge: admin-picked hero/gallery reach the public card + PDP.
    // Empty values export nothing, so prototype imagery stays in charge.
    if (p.heroMediaId) out.img = mediaUrl(p.heroMediaId, 'card');
    if ((p.gallery ?? []).length) out.gallery = p.gallery.map((g) => mediaUrl(g));
    return out;
  });

// ---- 0017 compat bridge — rules → the finder hierarchy the public page walks.
// The merge layer merges per-model (type/brand/model-v key), field-by-field.
const compatRules = await db.select().from(compatibilityRule);
const COMPAT_TYPE_LABELS = { laptop: 'Laptop', desktop: 'Desktop PC', diy: 'Motherboard (DIY build)', minipc: 'Mini PC / NUC' };
const slugify = (s) => String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const compatTree = { types: [] };
for (const r of compatRules) {
  const typeId = r.deviceType || 'laptop';
  let t = compatTree.types.find((x) => x.id === typeId);
  if (!t) { t = { id: typeId, label: COMPAT_TYPE_LABELS[typeId] ?? typeId, brands: [] }; compatTree.types.push(t); }
  const brandId = slugify(r.deviceBrand);
  let b = t.brands.find((x) => x.id === brandId);
  if (!b) { b = { id: brandId, label: r.deviceBrand, models: [] }; t.brands.push(b); }
    b.models.push({
    v: slugify(r.deviceModel), l: r.deviceModel,
    gen: r.memoryGen ?? '', form: r.formFactor ?? '',
    cats: r.cats ?? [], max_gb: r.maxGb ?? null,
    slots: r.slots ?? null, speed: r.speed ?? '',
    ssd: r.ssdNote ?? '', ssd_cats: r.ssdCats ?? [],
    note: r.notes ?? '',
  });
}

// ---- 0020: where-to-buy directory bridge — distributors + marketplaces ----
const distRows = await db.select().from(distributor);
const mkRows = await db.select().from(marketplaceListing);
const directory = {
  distributors: distRows.map((d) => ({
    name: d.name, country: d.country, region: d.region, status: d.status,
    cities: d.cities ?? [], note: d.note ?? '',
    website: d.contact?.website ?? '', email: d.contact?.email ?? '',
  })),
  marketplaces: mkRows.map((m) => ({ platform: m.platform, url: m.url, country: m.country ?? '' })),
};

// ---- 0022: careers bridge — published job postings append to the public
// careers page openings table (matched by title, never duplicated).
const jobRows = await db.select().from(jobPosting);
const jobs = jobRows
  .filter((j) => j.status === 'published' && !j.deletedAt)
  .map((j) => {
    // first markdown paragraph that isn't a heading = the one-line focus summary
    const summary = (j.body || '').split(/\n{2,}/).map((p) => p.trim())
      .find((p) => p && !p.startsWith('#')) ?? '';
    return {
      title: j.title,
      location: j.location,
      dept: j.dept,
      type: j.type,
      level: j.level,
      salaryBand: j.salaryBand ?? '',
      applyBy: j.applyBy ? new Date(j.applyBy).toISOString().slice(0, 10) : '',
      summary: summary.replace(/[*_`]/g, '').slice(0, 160),
    };
  });

const payload = `/* AUTO-GENERATED by tooling/export-content.mjs — CMS content for the website.
 * The merge layer only adds slugs ABSENT from the prototype data.js (no duplication). */
window.CMS_CONTENT = ${JSON.stringify({
  articles: published(arts, 'article'),
  news: published(news, 'news'),
  faqs: faqItems,
  products: catalog,
  compat: compatTree,
  directory,
  jobs,
  generatedAt: now.toISOString(),
}, null, 0)};
`;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, payload, 'utf8');
console.log(`[export-content] cms-content.js: articles=${published(arts, 'article').length} news=${published(news, 'news').length} faqs=${faqItems.length} products=${catalog.length}`);
await db.$client.close();
