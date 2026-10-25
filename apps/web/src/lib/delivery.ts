/**
 * Delivery API Client for Astro SSR (Tasks D1–D8, VC-D/E)
 * Fetches published entities with timeouts and resilient local fallback.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const API_BASE = process.env.DELIVERY_API_URL
  ? process.env.DELIVERY_API_URL.replace(/\/api\/v1\/delivery\/?$/, '')
  : (process.env.CMS_URL || process.env.API_URL || 'http://127.0.0.1:8787');


let trackedFixturePages: Record<string, any> = {};
if (process.env.NODE_ENV === 'test') {
  try {
    const fixturePath = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'tooling', 'data', 'tracked-fixture-pages.json');
    if (existsSync(fixturePath)) {
      trackedFixturePages = JSON.parse(readFileSync(fixturePath, 'utf8'));
    }
  } catch {
    trackedFixturePages = {};
  }
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

    if (res.status === 404) {
      // A missing entity is a normal read miss (e.g. an unseeded page that has
      // a template fallback), not an outage.
      return null;
    }
    if (!res.ok) {
      console.warn(`[Delivery API] HTTP ${res.status} fetching ${url.toString()}`);
      return null;
    }

    return await res.json();
  } catch (err) {
    console.warn(`[Delivery API] Failed to reach Delivery API at ${url.toString()}: ${(err as Error).message}`);
    return null;
  }
}

export async function getDeliveryPage(slug: string, locale = 'en', preview?: string) {
  const res = await fetchDelivery(`/pages/${encodeURIComponent(slug)}?locale=${encodeURIComponent(locale)}`, { preview });
  if (res?.data) {
    return { ...res.data, cacheTags: res.meta?.cacheTags ?? [`pages`, `page:${res.data.slug}`] };
  }
  // In test environment only: allow fallback to tracked fixture if API is offline
  if (process.env.NODE_ENV === 'test') {
    const normalizedSlug = slug.replace(/\.html$/, '');
    return trackedFixturePages[normalizedSlug] || trackedFixturePages[slug] || null;
  }
  return null;
}

export async function getDeliveryPageByPath(path: string, locale = 'en', preview?: string) {
  const query = `?path=${encodeURIComponent(path)}&locale=${encodeURIComponent(locale)}`;
  const res = await fetchDelivery(`/pages/by-path${query}`, { preview });
  if (res?.data) {
    return { ...res.data, cacheTags: res.meta?.cacheTags ?? [`pages`, `page:${res.data.slug}`] };
  }
  return null;
}

export async function getDeliveryPages(locale = 'en') {
  const res = await fetchDelivery(`/pages?locale=${encodeURIComponent(locale)}`);
  if (res?.data && res.data.length > 0) return res.data;
  if (process.env.NODE_ENV === 'test') {
    return Object.values(trackedFixturePages);
  }
  return [];
}

export async function getDeliveryProductWithStatus(slug: string, preview?: string) {
  const url = new URL(`${API_BASE}/api/v1/delivery/products/${encodeURIComponent(slug)}`);
  if (preview) url.searchParams.set('preview', preview);
  try {
    const res = await fetch(url.toString(), {
      signal: AbortSignal.timeout(5000),
      headers: { 'Accept': 'application/json' },
    });
    if (res.status === 410) {
      return { product: null, status: 410, isArchived: true };
    }
    if (!res.ok) {
      return { product: null, status: res.status, isArchived: false };
    }
    const json = await res.json();
    return { product: json?.data ?? null, status: 200, isArchived: false };
  } catch (err) {
    return { product: null, status: 500, isArchived: false };
  }
}

export async function getDeliveryProduct(slug: string, preview?: string) {
  const result = await getDeliveryProductWithStatus(slug, preview);
  return result.product;
}

export async function getDeliveryProducts(query?: { cat?: string; brand?: string; q?: string; sort?: string }) {
  const params = new URLSearchParams();
  if (query?.cat) params.set('cat', query.cat);
  if (query?.brand) params.set('brand', query.brand);
  if (query?.q) params.set('q', query.q);
  if (query?.sort) params.set('sort', query.sort);
  const qStr = params.toString() ? `?${params.toString()}` : '';
  const res = await fetchDelivery(`/products${qStr}`);
  return res?.data ?? [];
}

export async function getDeliveryFacets() {
  const res = await fetchDelivery('/products/facets');
  return res?.data ?? { categories: [], brands: [], gen: [], form: [], capacities: [] };
}

export async function getDeliverySearchResults(
  q: string,
  type?: string,
  page = 1,
  limit = 20,
  locale = 'en',
  category?: string
) {
  if (!q || !q.trim()) return null;
  let endpoint = `/search?q=${encodeURIComponent(q.trim())}&locale=${encodeURIComponent(locale)}&page=${page}&limit=${limit}`;
  if (type && type !== 'all') {
    endpoint += `&type=${encodeURIComponent(type)}`;
  }
  if (category) {
    endpoint += `&category=${encodeURIComponent(category)}`;
  }
  const res = await fetchDelivery(endpoint);
  return res ?? null;
}

export async function getDeliverySearchSuggestions(q: string) {
  const res = await fetchDelivery(`/search/suggest?q=${encodeURIComponent(q)}`);
  return res?.suggestions ? res : (res?.data ?? { suggestions: [], query: q });
}

export async function getDeliveryArticle(slug: string, locale = 'en', preview?: string) {
  const res = await fetchDelivery(`/articles/${encodeURIComponent(slug)}?locale=${encodeURIComponent(locale)}`, { preview });
  return res?.data ?? null;
}

export async function getDeliveryDistributors(status?: string) {
  const q = status ? `?status=${encodeURIComponent(status)}` : '';
  const res = await fetchDelivery(`/distributors${q}`);
  return res?.data ?? [];
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

export async function getDeliveryNavMenu(code: string, locale = 'en') {
  const res = await fetchDelivery(`/navigation/${encodeURIComponent(code)}?locale=${encodeURIComponent(locale)}`);
  return res?.data ?? null;
}

export async function getDeliveryMenus() {
  const res = await fetchDelivery('/menus');
  return res?.data ?? {};
}

export async function getDeliveryRedirects() {
  const res = await fetchDelivery('/redirects');
  return res?.data ?? [];
}

export async function getDeliverySitemap(locale?: string) {
  const query = locale ? `?locale=${encodeURIComponent(locale)}` : '';
  const res = await fetchDelivery(`/sitemap${query}`);
  return res?.data ?? [];
}

// MS4.3 Delivery Clients: Glossary & Versioned Policies
export async function getDeliveryGlossary(letter?: string, search?: string, locale = 'en') {
  let endpoint = `/glossary?locale=${encodeURIComponent(locale)}`;
  if (letter) endpoint += `&letter=${encodeURIComponent(letter)}`;
  if (search) endpoint += `&search=${encodeURIComponent(search)}`;
  const res = await fetchDelivery(endpoint);
  return res?.data ?? [];
}

export async function getDeliveryPolicies(locale = 'en') {
  const res = await fetchDelivery(`/policies?locale=${encodeURIComponent(locale)}`);
  return res?.data ?? [];
}

export async function getDeliveryPolicy(slug: string, version?: string, locale = 'en') {
  let endpoint = `/policies/${encodeURIComponent(slug)}?locale=${encodeURIComponent(locale)}`;
  if (version) endpoint += `&version=${encodeURIComponent(version)}`;
  const res = await fetchDelivery(endpoint);
  return res?.data ?? null;
}

// MS4.7 Delivery Clients: Offices, Testimonials & Form Definitions
export async function getDeliveryOffices(locale = 'en') {
  const res = await fetchDelivery(`/offices?locale=${encodeURIComponent(locale)}`);
  return res?.data ?? [];
}

export async function getDeliveryTestimonials(locale = 'en') {
  const res = await fetchDelivery(`/testimonials?locale=${encodeURIComponent(locale)}`);
  return res?.data ?? [];
}

export async function getDeliveryFormDefinition(type: string) {
  const res = await fetchDelivery(`/forms/${encodeURIComponent(type)}`);
  return res?.data ?? null;
}

export async function getDeliveryFormToken(): Promise<string> {
  const url = new URL(`${API_BASE}/api/v1/forms/token`);
  try {
    const res = await fetch(url.toString(), {
      signal: AbortSignal.timeout(3000),
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) return '';
    const json = await res.json();
    return json?.token ?? '';
  } catch {
    return '';
  }
}

export async function getDeliveryCompatibility() {
  const res = await fetchDelivery('/compatibility');
  return res?.data ?? [];
}

export async function getDeliveryProductComparison(slugs: string[]) {
  if (!slugs || slugs.length === 0) return [];
  const res = await fetchDelivery(`/products/compare?slugs=${encodeURIComponent(slugs.join(','))}`);
  return res?.data ?? [];
}




