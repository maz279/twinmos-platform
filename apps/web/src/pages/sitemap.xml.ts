import type { APIRoute } from 'astro';
import { getDeliverySitemap } from '../lib/delivery.ts';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const origin = 'https://www.twinmos.com';
  const url = new URL(request.url);
  const format = url.searchParams.get('format');
  const locale = url.searchParams.get('locale');

  // Per-locale sitemap index (T6.2.3 / T3.5.2)
  // Default shape is the sitemap index (SEO-01 per-locale sitemaps): /sitemap.xml
  // lists the 9 per-locale children; each child serves its urlset via ?locale=.
  if (format === 'index' || (!locale && format !== 'urls')) {
    const activeLocales = ['en', 'ar', 'hi', 'ru', 'zh-cn', 'fr', 'es', 'pt', 'de'];
    const sitemapsXml = activeLocales
      .map((code) => {
        return `  <sitemap>\n    <loc>${origin}/sitemap.xml?locale=${code}</loc>\n    <lastmod>${new Date().toISOString()}</lastmod>\n  </sitemap>`;
      })
      .join('\n');

    const indexXml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapsXml}\n</sitemapindex>`;
    return new Response(indexXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      },
    });
  }

  let entries: Array<{ loc: string; lastmod?: string; locale?: string }> = [];

  try {
    entries = await getDeliverySitemap(locale || undefined);
  } catch (err) {
    console.error('Failed to fetch dynamic sitemap from delivery API:', err);
  }

  // Fallback defaults for core pages if API is cold. Clean URLs only: every
  // .html alias is a 301 on this site.
  if (!entries || entries.length === 0) {
    if (locale && locale !== 'en') {
      // A locale sitemap must never advertise English URLs as translated ones;
      // the landing is the one route guaranteed to exist for every locale.
      entries = [{ loc: `/${locale}`, locale }];
    } else {
      const corePaths = [
        '/', '/about', '/shop', '/support', '/contact', '/legal', '/partners', '/careers',
      ];
      entries = corePaths.map((p) => ({ loc: p, locale: locale || 'en' }));
    }
  }

  const activeLocales = ['en', 'ar', 'hi', 'ru', 'zh-cn', 'fr', 'es', 'pt', 'de'];

  const urlsXml = entries
    .map((e) => {
      const loc = e.loc.startsWith('http') ? e.loc : `${origin}${e.loc.startsWith('/') ? '' : '/'}${e.loc}`;
      const urlObj = new URL(loc);
      const rawPath = urlObj.pathname;
      const basePath = rawPath.replace(/^\/(?:ar|hi|ru|zh-cn|fr|es|pt|de)(?=\/|$)/, '') || '/';
      
      const lastmod = e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : '';
      const priority = basePath === '/' ? '1.0' : '0.8';

      const xhtmlLinks = activeLocales
        .map((lang) => {
          const altHref = lang === 'en'
            ? `${origin}${basePath}`
            : `${origin}/${lang}${basePath === '/' ? '' : basePath}`;
          const hreflangAttr = lang === 'zh-cn' ? 'zh-CN' : lang;
          return `    <xhtml:link rel="alternate" hreflang="${hreflangAttr}" href="${altHref}" />`;
        })
        .join('\n');

      const xDefaultLink = `    <xhtml:link rel="alternate" hreflang="x-default" href="${origin}${basePath}" />`;

      return `  <url>\n    <loc>${loc}</loc>${lastmod ? '\n    ' + lastmod : ''}\n${xhtmlLinks}\n${xDefaultLink}\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urlsXml}\n</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
};
