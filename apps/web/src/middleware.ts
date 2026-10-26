import { defineMiddleware } from 'astro:middleware';
import { LOCALES } from '@twinmos/shared';
import { matchRedirect } from './lib/redirects.ts';
import { routeCache } from './lib/route-cache.ts';
import { getDeliveryPage } from './lib/delivery.ts';

const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' https://challenges.cloudflare.com https://static.cloudflareinsights.com https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self' http://127.0.0.1:8787 http://localhost:8787 https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com",
  "frame-src https://challenges.cloudflare.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, request } = context;

  // 1. Check CMS Redirects (Task B6 & MS6.4)
  const redirect = await matchRedirect(url.pathname, url.search);
  if (redirect) {
    if (redirect.status === 410 || redirect.to === '/410') {
      return context.rewrite('/410');
    }
    return context.redirect(redirect.to, redirect.status as 301 | 302);
  }

  // 1b. Legacy query route redirects (Task T3.2.2, ADR D-5)
  if (url.pathname === '/product.html' || url.pathname === '/product') {
    const slug = url.searchParams.get('id') || url.searchParams.get('slug');
    if (slug) {
      return context.redirect(`/products/${encodeURIComponent(slug)}`, 301);
    }
    return context.redirect('/shop', 301);
  }

  if (url.pathname === '/article.html' || url.pathname === '/article') {
    const slug = url.searchParams.get('id') || url.searchParams.get('slug');
    if (slug) {
      return context.redirect(`/learn/${encodeURIComponent(slug)}`, 301);
    }
    return context.redirect('/learn', 301);
  }

  // 1c. Clean route .html twins return 404 per T3.2.2 (no .html twin under clean route prefixes)
  if ((url.pathname.startsWith('/products/') || url.pathname.startsWith('/learn/')) && url.pathname.endsWith('.html')) {
    return new Response('Not Found', { status: 404, statusText: 'Not Found' });
  }

  // Generic legacy .html extension redirect to clean URL (ADR D-5 / MS3.2)
  if (url.pathname.endsWith('.html')) {
    const cleanPath = url.pathname.replace(/\.html$/, '');
    const target = cleanPath === '/index' ? '/' : cleanPath;
    return context.redirect(`${target}${url.search}`, 301);
  }

  // 2. Localisation resolution (Task T4.7.5 / rule D-8)
  // Serve a published variant in the requested locale; otherwise 301 to the
  // English URL. The [locale]/[...slug] route renders published variants.
  const localeMatch = url.pathname.match(/^\/([a-z]{2}(?:-[a-z]{2})?)\/(.+)$/i);
  if (localeMatch) {
    const loc = localeMatch[1].toLowerCase();
    const subpath = localeMatch[2];
    if (LOCALES.includes(loc as any) && loc !== 'en') {
      const slug = subpath.replace(/\.html$/i, '').replace(/\/+$/, '') || 'index';
      let translated: unknown = null;
      try {
        translated = await getDeliveryPage(slug, loc);
      } catch {
        translated = null;
      }
      if (!translated) {
        return context.redirect(`/${subpath}${url.search}`, 301);
      }
    }
  }

  // 3. Internal endpoints protection (Task T3.2.4, S-16b)
  if (url.pathname.startsWith('/internal/')) {
    // Endpoints like /internal/revalidate handle their own auth; ensure private, no-store
    const response = await next();
    response.headers.set('Cache-Control', 'private, no-store, must-revalidate');
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  }

  const isPreview = url.searchParams.has('preview') || context.cookies.has('tm_preview');
  const isGet = request.method === 'GET';
  const cacheKey = routeCache.makeKey(url.pathname, url.searchParams);

  // 4. In-Memory Route Cache Check (Task T3.2.3)
  // Preview requests bypass cache completely
  if (isGet && !isPreview) {
    const cached = routeCache.get(cacheKey);
    if (cached) {
      const headers = new Headers(cached.headers);
      headers.set('X-Astro-Cache', 'HIT');
      headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
      headers.set('X-Accel-Expires', '5');
      headers.set('Content-Security-Policy', CSP_DIRECTIVES);
      headers.set('X-Content-Type-Options', 'nosniff');
      headers.set('X-Frame-Options', 'DENY');

      return new Response(cached.body, {
        status: cached.status,
        headers,
      });
    }
  }

  // 5. Execute route handler with outage resilience (T3.2.3)
  let response: Response;
  try {
    response = await next();
  } catch (err: any) {
    console.error('[middleware] render failed:', err?.stack || err?.message || err);
    // Check if stale cached entry exists (stale-if-error)
    const stale = isGet && !isPreview ? routeCache.getStale(cacheKey) : null;
    if (stale) {
      const headers = new Headers(stale.headers);
      headers.set('X-Astro-Cache', 'STALE');
      headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
      headers.set('X-Accel-Expires', '5');
      return new Response(stale.body, { status: stale.status, headers });
    }

    // Never cached: return 503 with Retry-After (Task T3.2.3 item 4)
    return new Response(
      '<!doctype html><html lang="en"><head><meta charset="utf-8"/><title>Service Temporarily Unavailable — TwinMOS</title></head><body><h1>503 Service Unavailable</h1><p>Our service is momentarily unavailable. Please try again shortly.</p></body></html>',
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'private, no-store',
          'Retry-After': '30',
        },
      }
    );
  }

  // 6. Header policies (Tasks B4a, B4b, S-16b, NF-30)
  response.headers.set('Content-Security-Policy', CSP_DIRECTIVES);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');

  if (isPreview || url.pathname.startsWith('/search')) {
    if (isPreview) response.headers.set('Cache-Control', 'private, no-store, must-revalidate');
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  } else {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      if (response.status >= 500) {
        // Outage response
        response.headers.set('Cache-Control', 'private, no-store');
        response.headers.set('Retry-After', '30');
      } else {
        // Public HTML: strictly public, max-age=0, must-revalidate + X-Accel-Expires: 5 (never s-maxage)
        response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
        response.headers.set('X-Accel-Expires', '5');
        response.headers.set('X-Astro-Cache', 'MISS');

        // Store 200 HTML in route cache
        if (isGet && response.status === 200) {
          try {
            const cloned = response.clone();
            const body = await cloned.text();
            
            // Every page renders the chrome, so settings and menu changes must
            // purge every cached HTML entry (MS4.2 T4.2.1 / T4.2.4).
            const tags: string[] = ['site', 'nav', 'menus'];
            if (url.pathname.startsWith('/products/')) {
              tags.push('products', 'catalog');
              const pSlug = url.pathname.slice('/products/'.length).replace(/\.html$/, '');
              if (pSlug) tags.push(`product:${pSlug}`);
            }
            if (url.pathname.startsWith('/learn/')) {
              tags.push('articles', 'learn');
              const aSlug = url.pathname.slice('/learn/'.length).replace(/\.html$/, '');
              if (aSlug) tags.push(`article:${aSlug}`);
            }
            if (url.pathname === '/' || url.pathname === '/index.html') tags.push('page:index');

            const headerMap: Record<string, string> = {};
            response.headers.forEach((val, key) => {
              if (key.toLowerCase() !== 'x-astro-cache') {
                headerMap[key] = val;
              }
            });

            routeCache.set(cacheKey, {
              body,
              status: response.status,
              headers: headerMap,
              tags,
            });
          } catch {
            /* best effort caching */
          }
        }
      }
    }
  }

  return response;
});
