import type { APIRoute } from 'astro';
import { getDeliverySettings } from '../lib/delivery.ts';

export const prerender = false;

export const GET: APIRoute = async () => {
  let customRobots: string | undefined;
  try {
    const settings = await getDeliverySettings();
    if (typeof settings?.robotsTxt === 'string' && settings.robotsTxt.trim().length > 0) {
      customRobots = settings.robotsTxt;
    } else if (typeof settings?.robots_txt === 'string' && settings.robots_txt.trim().length > 0) {
      customRobots = settings.robots_txt;
    }
  } catch {}

  const robotsTxt = customRobots || `User-agent: *
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

