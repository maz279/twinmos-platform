// Live-first catalog data endpoint for app.js widgets (replaces the build-time
// catalog-data.js stop-gap as the primary source). Served at /api/catalog-data.js.
// Behavior: canonical data comes from the Delivery API on every refresh (60s
// server cache); unpublish/deletes propagate because the live set is canonical.
// The committed build-time snapshot (public/assets/js/catalog-data.js) is kept
// only as (a) enrichment for display-only fields and (b) byte-for-byte fallback
// payload when the Delivery API is unreachable.
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { APIRoute } from 'astro';
import {
  getDeliveryProducts,
  getDeliveryFacets,
  getDeliveryCompatibility,
  getDeliveryGlossary,
  getDeliveryArticles,
  getDeliveryDeviceTypeLabels,
} from '../../lib/delivery';

const CACHE_TTL_MS = 60_000;

type Cached = { at: number; js: string; source: 'live' | 'snapshot-fallback' };
let cache: Cached | null = null;

let snapshotCache: Record<string, any> | null = null;

function loadSnapshot(): Record<string, any> {
  if (snapshotCache) return snapshotCache;
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    process.env.CATALOG_SNAPSHOT_FILE,
    // dev: src/pages/api -> apps/web/public/assets/js/catalog-data.js
    resolve(here, '..', '..', '..', 'public', 'assets', 'js', 'catalog-data.js'),
    // built: dist/server/chunks/* or dist/server/pages/* -> dist/client/...
    resolve(here, '..', '..', 'client', 'assets', 'js', 'catalog-data.js'),
    resolve(here, '..', 'client', 'assets', 'js', 'catalog-data.js'),
  ].filter(Boolean) as string[];
  for (const p of candidates) {
    try {
      if (!existsSync(p)) continue;
      const raw = readFileSync(p, 'utf8');
      const marker = 'window.TM = ';
      const start = raw.indexOf(marker);
      if (start === -1) continue;
      let line = raw.slice(start + marker.length, raw.indexOf('\n', start) === -1 ? undefined : raw.indexOf('\n', start)).trim();
      if (line.endsWith(';')) line = line.slice(0, -1);
      snapshotCache = JSON.parse(line);
      return snapshotCache;
    } catch {
      // try next candidate
    }
  }
  snapshotCache = {};
  return snapshotCache;
}

function snapshotFileBytes(): string | null {
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    process.env.CATALOG_SNAPSHOT_FILE,
    resolve(here, '..', '..', '..', 'public', 'assets', 'js', 'catalog-data.js'),
    resolve(here, '..', '..', 'client', 'assets', 'js', 'catalog-data.js'),
    resolve(here, '..', 'client', 'assets', 'js', 'catalog-data.js'),
  ].filter(Boolean) as string[];
  for (const p of candidates) {
    try {
      if (existsSync(p)) return readFileSync(p, 'utf8');
    } catch {
      // try next
    }
  }
  return null;
}

const slugify = (s: string) =>
  String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

function validImg(v: unknown): string | null {
  if (typeof v !== 'string' || !v) return null;
  if (v.startsWith('assets/') || v.startsWith('/') || v.startsWith('http')) return v.startsWith('/') ? v : '/' + v;
  return null;
}

function mapProducts(live: any[], facets: any, snap: Record<string, any>) {
  const snapBySlug = new Map<string, any>((snap.products || []).map((p: any) => [p.id, p]));
  const facetById = new Map<number, any>((facets?.categories || []).map((c: any) => [Number(c.id), c]));
  const out: any[] = [];
  for (const dbP of live) {
    const slug = dbP.slug || String(dbP.id);
    const pr = snapBySlug.get(slug) || {};
    const facet = facetById.get(Number(dbP.categoryId));
    const galleryRaw = Array.isArray(dbP.gallery) ? dbP.gallery : [];
    const validGallery = galleryRaw.map(validImg).filter(Boolean) as string[];
    const img = validImg(galleryRaw[0]) || pr.img || (slug.includes('ddr5') || slug.includes('ram') || slug.includes('dimm') ? '/assets/img/voltx-rgb-elem.webp' : '/assets/img/prodrive-1.webp');
    const gallery = validGallery.length ? validGallery : (pr.gallery || [img]);
    const imgC = pr.imgC || (img.startsWith('/assets/img/') && !img.includes('/card/') ? img.replace('/assets/img/', '/assets/img/card/') : img);
    const galleryC = pr.galleryC || gallery.map((g: string) => (g.startsWith('assets/img/') && !g.includes('/card/') ? g.replace('assets/img/', 'assets/img/card/') : g));
    out.push({
      id: slug,
      dbId: dbP.id,
      sku: dbP.sku || pr.sku || slug.toUpperCase(),
      name: dbP.name || pr.name || slug,
      cat: facet?.slug || pr.cat || 'memory',
      catLabel: facet?.name || pr.catLabel || 'Memory',
      shortSpec: dbP.shortSpec || pr.shortSpec || (dbP.specs && dbP.specs.Capacity) || '',
      // CMS values only — never invent warranty or price
      warranty: dbP.warranty || '',
      warrantyTier: dbP.warrantyTier || '',
      badge: (dbP.badges && dbP.badges[0]) || pr.badge || '',
      brand: pr.brand || 'TwinMOS',
      gen: pr.gen || '',
      cap: pr.cap || (dbP.specs && dbP.specs.Capacity) || '',
      interface: pr.interface || (dbP.specs && dbP.specs.Interface) || '',
      form: pr.form || '',
      img,
      gallery,
      variants: pr.variants || (dbP.specs && dbP.specs.Capacity ? [dbP.specs.Capacity] : ['Standard']),
      specs: dbP.specs && Object.keys(dbP.specs).length ? dbP.specs : pr.specs || {},
      description: dbP.description || pr.description || '',
      featured: Boolean(dbP.featured ?? pr.featured),
      isNew: Boolean(dbP.isNew ?? pr.isNew),
      priceUsd: dbP.priceUsd != null ? Number(dbP.priceUsd) : null,
      currency: dbP.currency || pr.currency || 'USD',
      search: `${dbP.name || pr.name} ${facet?.name || ''} ${pr.search || ''} ${JSON.stringify(dbP.specs || {})}`.slice(0, 500),
      imgC,
      galleryC,
    });
  }
  return out;
}

function mapCompat(rules: any[], labels: any[], snap: Record<string, any>) {
  if (!Array.isArray(rules) || rules.length === 0) return snap.compat || { types: [] };
  const labelByType = new Map<string, string>((labels || []).map((l: any) => [l.deviceType, l.label]));
  const types = new Map<string, any>();
  for (const r of rules) {
    const tId = r.deviceType || 'other';
    if (!types.has(tId)) types.set(tId, { id: tId, label: labelByType.get(tId) || tId, brands: new Map() });
    const t = types.get(tId);
    const bKey = slugify(r.deviceBrand || 'other');
    if (!t.brands.has(bKey)) t.brands.set(bKey, { id: bKey, label: r.deviceBrand || 'Other', models: [] });
    t.brands.get(bKey).models.push({
      v: slugify(r.deviceModel || ''),
      l: r.deviceModel || '',
      gen: r.memoryGen || '',
      form: r.formFactor || '',
      cats: r.cats || [],
      max_gb: r.maxGb ?? null,
      slots: r.slots ?? null,
      speed: r.speed || '',
      ssd: r.ssdNote || '',
      ssd_cats: r.ssdCats || [],
      note: r.notes || '',
    });
  }
  const snapTypes: any[] = (snap.compat && Array.isArray(snap.compat.types)) ? snap.compat.types : [];
  const snapTypeById = new Map(snapTypes.map((t) => [t.id, t]));
  return {
    types: [...types.values()].map((t) => ({
      id: t.id,
      label: t.label !== t.id ? t.label : (snapTypeById.get(t.id)?.label || t.id),
      brands: [...t.brands.values()],
    })),
  };
}

async function buildLivePayload(): Promise<{ js: string; source: 'live' | 'snapshot-fallback' } | null> {
  const [products, facets, compatRules, deviceLabels, glossary, articles] = await Promise.all([
    getDeliveryProducts(),
    getDeliveryFacets(),
    getDeliveryCompatibility(),
    getDeliveryDeviceTypeLabels(),
    getDeliveryGlossary(),
    getDeliveryArticles(),
  ]);
  if (!Array.isArray(products) || products.length === 0) return null; // outage → snapshot fallback

  const snap = loadSnapshot();
  const snapArticleBySlug = new Map<string, any>((snap.articles || []).map((a: any) => [a.id, a]));

  const payload = {
    products: mapProducts(products, facets, snap),
    categories: (facets?.categories || []).map((c: any) => ({ id: c.slug, label: c.name })),
    articles: (Array.isArray(articles) ? articles : []).map((a: any) => {
      const sa = snapArticleBySlug.get(a.slug) || {};
      return {
        id: a.slug,
        slug: a.slug,
        title: a.title || sa.title || a.slug,
        category: a.category || sa.category || '',
        date: a.publishAt || a.createdAt || sa.date || '',
        readTime: a.readingTimeMin ? `${a.readingTimeMin} min read` : (sa.readTime || ''),
      };
    }),
    compat: mapCompat(compatRules, deviceLabels, snap),
    glossary: (Array.isArray(glossary) ? glossary : []).map((g: any) => ({
      t: g.term,
      d: g.definition,
      l: g.letter || (g.term || '').slice(0, 1).toUpperCase(),
      ref: g.explainerSlug || '',
    })),
  };
  const js = `/* Live catalog from Delivery API (${new Date().toISOString()}) — snapshot fallback at build time */\n(function(){'use strict';\nwindow.TM = ${JSON.stringify(payload)};\n})();\n`;
  return { js, source: 'live' };
}

export const GET: APIRoute = async () => {
  const now = Date.now();
  if (cache && now - cache.at < CACHE_TTL_MS) {
    return respond(cache);
  }
  let built: { js: string; source: 'live' | 'snapshot-fallback' } | null = null;
  try {
    built = await buildLivePayload();
  } catch {
    built = null;
  }
  if (!built) {
    const fallbackBytes = snapshotFileBytes();
    if (fallbackBytes) {
      built = { js: fallbackBytes, source: 'snapshot-fallback' };
    } else {
      built = { js: `(function(){'use strict';\nwindow.TM = {products:[],categories:[],articles:[],compat:{types:[]},glossary:[]};\n})();\n`, source: 'snapshot-fallback' };
    }
  }
  cache = { at: now, js: built.js, source: built.source };
  return respond(cache);
};

function respond(c: Cached): Response {
  const headers: Record<string, string> = {
    'Content-Type': 'application/javascript; charset=utf-8',
    'X-Catalog-Source': c.source,
  };
  if (c.source === 'live') {
    headers['Cache-Control'] = 'public, max-age=60, stale-while-revalidate=600';
  } else {
    // outage fallback: short cache so recovery is quick once the API returns
    headers['Cache-Control'] = 'public, max-age=10';
  }
  return new Response(c.js, { headers });
}
