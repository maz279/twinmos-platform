import type { APIRoute } from 'astro';
import { invalidateRedirectsCache } from '../../lib/redirects.ts';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const expectedSecret = process.env.REVALIDATION_SECRET || process.env.REVALIDATE_SECRET || 'dev-revalidate-secret';
  const headerSecret = request.headers.get('x-revalidate-secret') || request.headers.get('x-revalidation-secret');

  let body: any = {};
  try {
    body = await request.json();
  } catch {}

  const providedSecret = headerSecret || body?.secret;

  // Enforce shared secret authentication (403 on failure)
  if (!providedSecret || providedSecret !== expectedSecret) {
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
