// tooling/build-catalog-data.ts — Generates versioned catalog data stop-gap for app.js
// Tasks R0.5 / SITE-FUNC compliant.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const PROTO_DATA_JS = join(ROOT, 'prototype', 'assets', 'js', 'data.js');
const TARGET_JS = join(ROOT, 'apps', 'web', 'public', 'assets', 'js', 'catalog-data.js');
const PDP_HERO_JS = join(ROOT, 'apps', 'web', 'public', 'assets', 'js', 'pdp-hero.js');

async function main() {
  console.log('[build-catalog-data] Generating catalog-data.js...');

  // 1. Read prototype data.js as rich baseline
  let proto = { products: [], categories: [], articles: [], compat: {}, glossary: [] };
  if (existsSync(PROTO_DATA_JS)) {
    const raw = readFileSync(PROTO_DATA_JS, 'utf8');
    const jsonStr = raw.replace(/^\/\*[^*]*\*\/\s*window\.TM\s*=\s*/, '').replace(/;?\s*$/, '');
    try {
      proto = JSON.parse(jsonStr);
      console.log(`[build-catalog-data] Loaded prototype data: ${proto.products.length} products, ${proto.articles.length} articles.`);
    } catch (e) {
      console.warn('[build-catalog-data] Warning: Could not parse prototype/assets/js/data.js', e.message);
    }
  }

  // 2. Load hero image map if available
  let heroMap = {};
  if (existsSync(PDP_HERO_JS)) {
    try {
      const rawHero = readFileSync(PDP_HERO_JS, 'utf8');
      const heroJson = rawHero.replace(/^\/\*[^*]*\*\/\s*window\.PDP_HERO\s*=\s*/, '').replace(/;?\s*$/, '');
      heroMap = JSON.parse(heroJson);
    } catch (e) {
      /* best-effort */
    }
  }

  // 3. Try to fetch live published products from Delivery API
  let dbProducts = [];
  try {
    const res = await fetch('http://127.0.0.1:8787/api/v1/delivery/products', { signal: AbortSignal.timeout(2500) });
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data)) {
        dbProducts = json.data;
        console.log(`[build-catalog-data] Fetched ${dbProducts.length} published products from Delivery API.`);
      }
    }
  } catch (e) {
    console.log('[build-catalog-data] Delivery API not running or timed out; using prototype data baseline.');
  }

  // 4. Merge products
  const protoProdMap = new Map(proto.products.map((p) => [p.id, p]));
  const mergedProducts = [];
  const processedSlugs = new Set();

  // If Delivery API returned products, use them as canonical published set
  if (dbProducts.length > 0) {
    for (const dbP of dbProducts) {
      const slug = dbP.slug || String(dbP.id);
      processedSlugs.add(slug);
      const pr = protoProdMap.get(slug) || {};
      const img = heroMap[slug] || (dbP.gallery && dbP.gallery[0]) || pr.img || 'assets/img/prodrive-1.webp';
      const gallery = (dbP.gallery && dbP.gallery.length > 0) ? dbP.gallery : (pr.gallery || [img]);

      mergedProducts.push({
        id: slug,
        dbId: dbP.id,
        sku: dbP.sku || pr.sku || slug.toUpperCase(),
        name: dbP.name || pr.name || slug,
        cat: pr.cat || 'memory',
        catLabel: pr.catLabel || 'Memory',
        shortSpec: dbP.shortSpec || pr.shortSpec || (dbP.specs && dbP.specs.Capacity) || '',
        warranty: dbP.warranty || pr.warranty || '3 Years',
        badge: (dbP.badges && dbP.badges[0]) || pr.badge || '',
        brand: pr.brand || 'TwinMOS',
        gen: pr.gen || '',
        cap: pr.cap || (dbP.specs && dbP.specs.Capacity) || '',
        interface: pr.interface || (dbP.specs && dbP.specs.Interface) || '',
        form: pr.form || '',
        img: img,
        gallery: gallery,
        variants: pr.variants || (dbP.specs && dbP.specs.Capacity ? [dbP.specs.Capacity] : ['Standard']),
        specs: (dbP.specs && Object.keys(dbP.specs).length > 0) ? dbP.specs : (pr.specs || {}),
        description: dbP.description || pr.description || '',
        featured: Boolean(dbP.featured ?? pr.featured),
        isNew: Boolean(pr.isNew),
        search: `${dbP.name || pr.name} ${pr.catLabel || ''} ${pr.search || ''} ${JSON.stringify(dbP.specs || {})}`.slice(0, 500),
        imgC: pr.imgC || img,
        galleryC: pr.galleryC || gallery,
      });
    }
  }

  // Add any prototype products not already present
  for (const pr of proto.products) {
    if (!processedSlugs.has(pr.id)) {
      processedSlugs.add(pr.id);
      mergedProducts.push(pr);
    }
  }

  // 5. Merge articles
  const mergedArticles = (proto.articles || []).map((a) => {
    // ensure body is structured as [{ h, p }]
    let body = a.body;
    if (typeof body === 'string') {
      body = [{ h: 'Overview', p: body }];
    } else if (Array.isArray(body)) {
      body = body.map((s) => ({
        h: s.h || s.heading || 'Details',
        p: s.p || s.text || '',
      }));
    }
    return {
      ...a,
      body: body || [],
    };
  });

  const payload = {
    products: mergedProducts,
    categories: proto.categories || [],
    articles: mergedArticles,
    compat: proto.compat || {},
    glossary: proto.glossary || [],
  };

  const code = `/* AUTO-GENERATED by tooling/build-catalog-data.ts — R0.5 Catalogue Stop-Gap */
(function() {
  'use strict';
  window.TM = ${JSON.stringify(payload)};

  // Optional background refresh if Delivery API is reachable online
  if (typeof fetch === 'function' && location.protocol.indexOf('http') === 0) {
    var apiBase = (document.querySelector('meta[name="twinmos-api"]') || {}).content || '';
    var url = apiBase ? (apiBase + '/delivery/products') : '/api/v1/delivery/products';
    fetch(url, { headers: { 'Accept': 'application/json' } })
      .then(function(res) { return res.ok ? res.json() : null; })
      .then(function(json) {
        if (!json || !Array.isArray(json.data) || json.data.length === 0) return;
        var existing = new Map();
        (window.TM.products || []).forEach(function(p) { existing.set(p.id, p); });
        json.data.forEach(function(dbP) {
          var slug = dbP.slug || String(dbP.id);
          var cur = existing.get(slug);
          if (cur) {
            if (dbP.name) cur.name = dbP.name;
            if (dbP.specs && Object.keys(dbP.specs).length > 0) cur.specs = dbP.specs;
            if (dbP.warranty) cur.warranty = dbP.warranty;
            if (dbP.description) cur.description = dbP.description;
          } else {
            var item = {
              id: slug,
              dbId: dbP.id,
              sku: dbP.sku || slug.toUpperCase(),
              name: dbP.name || slug,
              cat: 'memory',
              catLabel: 'Memory',
              shortSpec: dbP.shortSpec || (dbP.specs && dbP.specs.Capacity) || '',
              warranty: dbP.warranty || '3 Years',
              badge: (dbP.badges && dbP.badges[0]) || '',
              brand: 'TwinMOS',
              specs: dbP.specs || {},
              description: dbP.description || '',
              featured: Boolean(dbP.featured),
              img: (dbP.gallery && dbP.gallery[0]) || 'assets/img/prodrive-1.webp',
              gallery: dbP.gallery || ['assets/img/prodrive-1.webp'],
              variants: ['Standard'],
              search: dbP.name || slug
            };
            window.TM.products.push(item);
            existing.set(slug, item);
          }
        });
      })
      .catch(function() { /* best-effort */ });
  }
})();
`;

  writeFileSync(TARGET_JS, code, 'utf8');
  console.log(`[build-catalog-data] Wrote ${mergedProducts.length} products to ${TARGET_JS}`);
}

main().catch((err) => {
  console.error('[build-catalog-data] Error:', err);
  process.exit(1);
});
