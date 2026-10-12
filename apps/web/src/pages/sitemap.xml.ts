import type { APIRoute } from 'astro';
import { getDeliverySitemap } from '../lib/delivery.ts';

export const prerender = false;

export const GET: APIRoute = async () => {
  const origin = 'https://www.twinmos.com';
  let entries: Array<{ loc: string; lastmod?: string; locale?: string }> = [];

  try {
    entries = await getDeliverySitemap();
  } catch (err) {
    console.error('Failed to fetch dynamic sitemap from delivery API:', err);
  }

  // Fallback defaults for core pages if API is cold
  if (!entries || entries.length === 0) {
    const corePaths = [
      '/', '/about.html', '/products.html', '/support.html',
      '/contact.html', '/warranty.html', '/partners.html', '/careers.html'
    ];
    entries = corePaths.map((p) => ({ loc: p, locale: 'en' }));
  }

  const urlsXml = entries
    .map((e) => {
      const loc = e.loc.startsWith('http') ? e.loc : `${origin}${e.loc.startsWith('/') ? '' : '/'}${e.loc}`;
      const lastmod = e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : '';
      return `  <url>\n    <loc>${loc}</loc>${lastmod ? '\n    ' + lastmod : ''}\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlsXml}\n</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
};
