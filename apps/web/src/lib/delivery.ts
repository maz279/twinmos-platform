/**
 * Delivery API Client for Astro SSR (Tasks D1–D8, VC-D/E)
 * Fetches published entities with timeouts and resilient local fallback.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const API_BASE = process.env.CMS_URL || process.env.API_URL || 'http://127.0.0.1:8787';

let localPagesCache: Record<string, any> = {};
try {
  const cachePath = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'pages-cache.json');
  if (existsSync(cachePath)) {
    localPagesCache = JSON.parse(readFileSync(cachePath, 'utf8'));
  }
} catch {
  localPagesCache = {};
}

function getLocalFallbackPages(): Record<string, any> {
  if (localPagesCache && Object.keys(localPagesCache).length > 0) {
    return localPagesCache as Record<string, any>;
  }
  return {};
}

async function fetchDelivery(endpoint: string, options: { preview?: string; tags?: string[] } = {}) {
  const url = new URL(`${API_BASE}/api/v1/delivery${endpoint}`);
  if (options.preview) {
    url.searchParams.set('preview', options.preview);
  }

  try {
    const res = await fetch(url.toString(), {
      signal: AbortSignal.timeout(5000),
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch {
    // API may be offline during standalone Astro build/test; return null for fallback handling
    return null;
  }
}

export async function getDeliveryPage(slug: string, locale = 'en', preview?: string) {
  const res = await fetchDelivery(`/pages/${encodeURIComponent(slug)}?locale=${encodeURIComponent(locale)}`, { preview });
  if (res?.data) {
    return res.data;
  }
  // Resilient fallback: read from pre-compiled cache if delivery API server is not running
  const localMap = getLocalFallbackPages();
  const normalizedSlug = slug.replace(/\.html$/, '');
  return localMap[normalizedSlug] || localMap[slug] || null;
}

export async function getDeliveryPages(locale = 'en') {
  const res = await fetchDelivery(`/pages?locale=${encodeURIComponent(locale)}`);
  if (res?.data && res.data.length > 0) return res.data;
  const localMap = getLocalFallbackPages();
  return Object.values(localMap);
}

export async function getDeliveryProduct(slug: string, preview?: string) {
  const res = await fetchDelivery(`/products/${encodeURIComponent(slug)}`, { preview });
  return res?.data ?? null;
}

export async function getDeliveryProducts() {
  const res = await fetchDelivery('/products');
  return res?.data ?? [];
}

export async function getDeliveryFacets() {
  const res = await fetchDelivery('/products/facets');
  return res?.data ?? { categories: [], warrantyTiers: [], series: [] };
}

export async function getDeliverySearchResults(q: string, type?: string, category?: string) {
  let endpoint = `/search?q=${encodeURIComponent(q)}`;
  if (type) endpoint += `&type=${encodeURIComponent(type)}`;
  if (category) endpoint += `&category=${encodeURIComponent(category)}`;
  const res = await fetchDelivery(endpoint);
  return res?.data ?? { results: [], total: 0, facets: { types: {}, categories: {} }, query: q };
}

export async function getDeliverySearchSuggestions(q: string) {
  const res = await fetchDelivery(`/search/suggest?q=${encodeURIComponent(q)}`);
  return res?.data ?? { suggestions: [], query: q };
}

export async function getDeliveryArticle(slug: string, locale = 'en', preview?: string) {
  const res = await fetchDelivery(`/articles/${encodeURIComponent(slug)}?locale=${encodeURIComponent(locale)}`, { preview });
  return res?.data ?? null;
}

export async function getDeliveryArticles(locale = 'en') {
  const res = await fetchDelivery(`/articles?locale=${encodeURIComponent(locale)}`);
  return res?.data ?? [];
}

export async function getDeliveryNewsPost(slug: string, locale = 'en', preview?: string) {
  const res = await fetchDelivery(`/news/${encodeURIComponent(slug)}?locale=${encodeURIComponent(locale)}`, { preview });
  return res?.data ?? null;
}

export async function getDeliveryNews(locale = 'en') {
  const res = await fetchDelivery(`/news?locale=${encodeURIComponent(locale)}`);
  return res?.data ?? [];
}

export async function getDeliveryFaqs(groupKey?: string, locale = 'en') {
  const endpoint = groupKey
    ? `/faqs?groupKey=${encodeURIComponent(groupKey)}&locale=${encodeURIComponent(locale)}`
    : `/faqs?locale=${encodeURIComponent(locale)}`;
  const res = await fetchDelivery(endpoint);
  return res?.data ?? [];
}

export async function getDeliverySettings() {
  const res = await fetchDelivery('/settings');
  return res?.data ?? {};
}

export async function getDeliveryMenus() {
  const res = await fetchDelivery('/menus');
  return res?.data ?? {};
}

export async function getDeliveryRedirects() {
  const res = await fetchDelivery('/redirects');
  return res?.data ?? [];
}

export async function getDeliverySitemap() {
  const res = await fetchDelivery('/sitemap');
  return res?.data ?? [];
}
