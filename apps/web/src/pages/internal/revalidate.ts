import type { APIRoute } from 'astro';
import { timingSafeEqual } from 'node:crypto';
import { invalidateRedirectsCache } from '../../lib/redirects.ts';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const expectedSecret = process.env.REVALIDATE_SECRET || process.env.REVALIDATION_SECRET || 'dev-revalidate-secret';
  const headerSecret = request.headers.get('x-revalidate-secret') || request.headers.get('x-revalidation-secret');

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

  // Invalidate in-memory redirects cache
  invalidateRedirectsCache();

  return new Response(
    JSON.stringify({
      revalidated: true,
      timestamp: new Date().toISOString(),
      tags,
      paths,
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
