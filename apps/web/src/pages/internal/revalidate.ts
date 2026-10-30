import type { APIRoute } from 'astro';
import { timingSafeEqual } from 'node:crypto';
import { invalidateRedirectsCache } from '../../lib/redirects.ts';
import { routeCache } from '../../lib/route-cache.ts';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  // No literal fallback in production: a missing secret must fail closed, not
  // accept the publicly known dev value.
  const expectedSecret = process.env.REVALIDATE_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'dev-revalidate-secret');
  if (!expectedSecret) {
    return new Response(JSON.stringify({ error: 'Revalidation is not configured' }), { status: 503, headers: { 'content-type': 'application/json' } });
  }
  const headerSecret = request.headers.get('x-revalidate-secret');

  let body: any = {};
  try {
    body = await request.json();
  } catch {}

  const providedSecret = headerSecret || body?.secret;

  let isValid = false;
  if (typeof providedSecret === 'string') {
    const provBuf = Buffer.from(providedSecret, 'utf8');
    const expBuf = Buffer.from(expectedSecret, 'utf8');
    if (provBuf.length === expBuf.length && timingSafeEqual(provBuf, expBuf)) {
      isValid = true;
    }
  }

  // Enforce shared secret authentication with timingSafeEqual (403 on failure)
  if (!isValid) {
    return new Response(JSON.stringify({ error: 'Forbidden: invalid revalidation secret' }), {
      status: 403,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, no-store',
      },
    });
  }

  const tags: string[] = Array.isArray(body?.tags) ? body.tags : [];
  const paths: string[] = Array.isArray(body?.paths) ? body.paths : [];

  // Invalidate in-memory redirects cache and route cache (Task T3.2.3)
  invalidateRedirectsCache();
  const cacheResult = routeCache.invalidate({ paths, tags });

  return new Response(
    JSON.stringify({
      revalidated: true,
      timestamp: new Date().toISOString(),
      tags,
      paths,
      routeCache: cacheResult,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, no-store',
      },
    }
  );
};
