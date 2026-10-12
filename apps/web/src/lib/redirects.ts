import { getDeliveryRedirects } from './delivery.ts';

interface RedirectRow {
  id: number;
  from: string;
  to: string;
  code: number;
}

let cachedRedirects: RedirectRow[] | null = null;
let cacheExpiresAt = 0;

/**
 * Resolves a redirect for a path and optional query string.
 * Supports exact matches and query-aware matching (e.g. /product.html?id=demo).
 */
export async function matchRedirect(
  pathname: string,
  search = ''
): Promise<{ to: string; status: number } | null> {
  const now = Date.now();
  if (!cachedRedirects || now > cacheExpiresAt) {
    try {
      cachedRedirects = await getDeliveryRedirects();
      cacheExpiresAt = now + 60_000; // 60s cache
    } catch {
      cachedRedirects = cachedRedirects || [];
    }
  }

  if (!cachedRedirects || cachedRedirects.length === 0) {
    return null;
  }

  const fullPath = search ? `${pathname}${search}` : pathname;

  // 1. Check exact fullPath match (query-aware)
  let matched = cachedRedirects.find((r) => r.from === fullPath);

  // 2. Fallback to pathname match
  if (!matched) {
    matched = cachedRedirects.find((r) => r.from === pathname);
  }

  // 3. Normalized trailing slash / .html fallback
  if (!matched) {
    const normalized = pathname.replace(/\.html$/, '');
    matched = cachedRedirects.find((r) => r.from === normalized || r.from === `${normalized}.html`);
  }

  if (!matched) return null;

  // Prevent redirect chains / loops by resolving single hop
  let target = matched.to;
  let hops = 0;
  const visited = new Set<string>([matched.from]);

  while (hops < 5) {
    const nextHop = cachedRedirects.find((r) => r.from === target);
    if (!nextHop || visited.has(nextHop.from)) break;
    visited.add(nextHop.from);
    target = nextHop.to;
    hops++;
  }

  return {
    to: target,
    status: matched.code || 301,
  };
}

export function invalidateRedirectsCache(): void {
  cachedRedirects = null;
  cacheExpiresAt = 0;
}
