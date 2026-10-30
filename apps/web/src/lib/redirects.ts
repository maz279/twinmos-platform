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

  // 2. Fallback to exact pathname match
  if (!matched) {
    matched = cachedRedirects.find((r) => r.from === pathname);
  }

  // 3. Trailing slash normalization
  if (!matched) {
    const trimmed = pathname.replace(/\/+$/, '');
    if (trimmed && trimmed !== pathname) {
      matched = cachedRedirects.find((r) => r.from === trimmed);
    } else if (trimmed) {
      matched = cachedRedirects.find((r) => r.from === `${trimmed}/`);
    }
  }

  // 4. If URL ends with .html, check if clean path is in redirects
  if (!matched && pathname.endsWith('.html')) {
    const withoutHtml = pathname.replace(/\.html$/, '');
    matched = cachedRedirects.find((r) => r.from === withoutHtml || r.from === `${withoutHtml}/`);
  }

  if (!matched) return null;

  // Prevent self-redirects immediately
  if (matched.to === pathname || matched.to === fullPath) {
    return null;
  }

  // Prevent redirect chains / loops by resolving to terminal target
  let target = matched.to;
  let status = matched.code || 301;
  let hops = 0;
  const visited = new Set<string>([matched.from]);

  while (hops < 5 && status !== 410) {
    const nextHop = cachedRedirects.find((r) => r.from === target);
    if (!nextHop || visited.has(nextHop.from)) break;
    visited.add(nextHop.from);
    target = nextHop.to;
    status = nextHop.code || 301;
    hops++;
  }

  // Guard against self-redirect after chain resolution
  if (target === pathname || target === fullPath) {
    return null;
  }

  // A path-only redirect entry must never drop the query string — legacy
  // deep links like /quote.html?product=<slug> carry live parameters the
  // destination route consumes (URL-01: parameters preserved, 0 loss).
  if (!matched.to.includes('?') && search) {
    target = `${target}${search}`;
  }

  return {
    to: target,
    status,
  };
}

export function invalidateRedirectsCache(): void {
  cachedRedirects = null;
  cacheExpiresAt = 0;
}
