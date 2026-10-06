// P2.2 shared content-payload builder — the single source of truth for what
// goes into cms-content.js. Used by BOTH the CLI exporter (API stopped) and
// the API's POST /admin/content/export (API live — the API owns the PGlite
// handle, so no second open can ever corrupt the store). Receives the db
// handle; never creates one. Plain TS: both consumers run under
// --experimental-strip-types.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { article, newsPost, product, productVariant, brand, category, compatibilityRule, distributor, marketplaceListing, jobPosting } from './db-bridge.ts';

const HERE = dirname(fileURLToPath(import.meta.url)); // .../twinmso_codebase/tooling
const DATA_JS = join(HERE, '..', 'apps', 'web', 'public', 'assets', 'js', 'data.js');

function prototypeIds(): Set<string> {
  try {
    const src = readFileSync(DATA_JS, 'utf8');
    const ids = new Set<string>();
    for (const m of src.matchAll(/"id":"([^"]{2,120})"/g)) ids.add(m[1] ?? '');
    return ids;
  } catch {
    return new Set(); // data.js not synced yet — export everything (runtime merge still guards)
  }
}

type AnyRow = Record<string, any>;

/** Builds the CMS_CONTENT object (callers decide the write shape). */
export async function buildContentPayload(db: any, opts: { apiBase?: string } = {}) {
  const now = new Date();
  const known = prototypeIds();

  const published = (rows: AnyRow[], entity: string) => rows
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
  const faqItems: AnyRow[] = [];

  const arts: AnyRow[] = await db.select().from(article);
  const news: AnyRow[] = await db.select().from(newsPost);
  const prods: AnyRow[] = await db.select().from(product);
  const brands = await db.select({ id: brand.id, name: brand.name, slug: brand.slug }).from(brand);
  const cats = await db.select({ id: category.id, name: category.name, slug: category.slug }).from(category);
  const variantRows: AnyRow[] = await db.select().from(productVariant);
  const variantsByProduct = new Map<number, AnyRow[]>();
  for (const v of variantRows) {
    if (!variantsByProduct.has(v.productId)) variantsByProduct.set(v.productId, []);
    variantsByProduct.get(v.productId)!.push(v);
  }
  const brandName = new Map<number, string>(brands.map((b: AnyRow) => [b.id as number, String(b.name)]));
  const catById = new Map<number, AnyRow>(cats.map((c: AnyRow) => [c.id as number, c]));
  // Public media URL for the imagery bridge. apiBase from the caller: the CLI
  // uses PUBLIC_API_URL (absolute in dev), the API route passes its own base;
  // '' → same-origin /api/v1 (the production reverse proxy).
  const API_BASE = String(opts.apiBase ?? process.env.PUBLIC_API_URL ?? '').replace(/\/+$/, '');
  const mediaUrl = (id: number, variant?: string) => `${API_BASE || '/api/v1'}/media/${id}/file${variant ? '?variant=' + variant : ''}`;
  const catalog = prods
    .filter((p: AnyRow) => p.status === 'published' && !p.deletedAt)
    .map((p: AnyRow) => {
      const cat = p.categoryId ? catById.get(p.categoryId) : undefined;
      const f = p.facets ?? {};
      const variants = (variantsByProduct.get(p.id) ?? [])
        .map((v) => [v.attrs?.capacity, v.attrs?.speed].filter(Boolean).join(' · '))
        .filter(Boolean);
      const out: AnyRow = {
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
        gen: f.gen || '', cap: f.cap || '', interface: f.interface || '', form: f.form || '',
        variants: variants.length ? variants : null,
      };
      if (p.heroMediaId) out.img = mediaUrl(p.heroMediaId, 'card');
      if ((p.gallery ?? []).length) out.gallery = p.gallery.map((g: number) => mediaUrl(g));
      return out;
    });

  const compatRules: AnyRow[] = await db.select().from(compatibilityRule);
  const COMPAT_TYPE_LABELS: Record<string, string> = { laptop: 'Laptop', desktop: 'Desktop PC', diy: 'Motherboard (DIY build)', minipc: 'Mini PC / NUC' };
  const slugify = (s: string) => String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const compatTree: AnyRow = { types: [] };
  for (const r of compatRules) {
    const typeId = r.deviceType || 'laptop';
    let t = compatTree.types.find((x: AnyRow) => x.id === typeId);
    if (!t) { t = { id: typeId, label: COMPAT_TYPE_LABELS[typeId] ?? typeId, brands: [] }; compatTree.types.push(t); }
    const brandId = slugify(r.deviceBrand);
    let b = t.brands.find((x: AnyRow) => x.id === brandId);
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

  const distRows: AnyRow[] = await db.select().from(distributor);
  const mkRows: AnyRow[] = await db.select().from(marketplaceListing);
  const directory = {
    distributors: distRows.map((d) => ({
      name: d.name, country: d.country, region: d.region, status: d.status,
      cities: d.cities ?? [], note: d.note ?? '',
      website: d.contact?.website ?? '', email: d.contact?.email ?? '',
    })),
    marketplaces: mkRows.map((m) => ({ platform: m.platform, url: m.url, country: m.country ?? '' })),
  };

  const jobRows: AnyRow[] = await db.select().from(jobPosting);
  const jobs = jobRows
    .filter((j: AnyRow) => j.status === 'published' && !j.deletedAt)
    .map((j: AnyRow) => {
      const summary = (j.body || '').split(/\n{2,}/).map((p: string) => p.trim())
        .find((p: string) => p && !p.startsWith('#')) ?? '';
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

  return {
    counts: {
      articles: published(arts, 'article').length,
      news: published(news, 'news').length,
      faqs: faqItems.length,
      products: catalog.length,
      compatRules: compatRules.length,
      distributors: directory.distributors.length,
      jobs: jobs.length,
    },
    payload: {
      articles: published(arts, 'article'),
      news: published(news, 'news'),
      faqs: faqItems,
      products: catalog,
      compat: compatTree,
      directory,
      jobs,
      generatedAt: now.toISOString(),
    },
  };
}

/** The full wrapper-script text written to cms-content.js. */
export function contentScriptText(payload: unknown): string {
  return `/* AUTO-GENERATED — CMS content for the website.
 * The merge layer only adds slugs ABSENT from the prototype data.js (no duplication). */
window.CMS_CONTENT = ${JSON.stringify(payload)};
`;
}

/** Where cms-content.js lives (repo-anchored, cwd-independent). */
export function contentOutPath(): string {
  return join(HERE, '..', 'apps', 'web', 'public', 'assets', 'js', 'cms-content.js');
}
