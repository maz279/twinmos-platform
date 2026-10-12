/**
 * Delivery API Client for Astro SSR
 * Fetches published entities with timeouts and cache tag parsing.
 */

const API_BASE = process.env.CMS_URL || process.env.API_URL || 'http://127.0.0.1:8787';

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
  } catch (err) {
    console.error(`[DeliveryClient] Error fetching ${endpoint}:`, err);
    return null;
  }
}

export async function getDeliveryPage(slug: string, locale = 'en', preview?: string) {
  const res = await fetchDelivery(`/pages/${encodeURIComponent(slug)}?locale=${encodeURIComponent(locale)}`, { preview });
  return res?.data ?? null;
}

export async function getDeliveryPages(locale = 'en') {
  const res = await fetchDelivery(`/pages?locale=${encodeURIComponent(locale)}`);
  return res?.data ?? [];
}

export async function getDeliveryProduct(slug: string, preview?: string) {
  const res = await fetchDelivery(`/products/${encodeURIComponent(slug)}`, { preview });
  return res?.data ?? null;
}

export async function getDeliveryProducts() {
  const res = await fetchDelivery('/products');
  return res?.data ?? [];
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
