import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async () => {
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /404.html
Disallow: /__audit/
Disallow: /*?preview=
Disallow: /internal/

Sitemap: https://www.twinmos.com/sitemap.xml
`;

  return new Response(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
