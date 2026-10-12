import { defineMiddleware } from 'astro:middleware';
import { matchRedirect } from './lib/redirects.ts';

export const onRequest = defineMiddleware(async (context, next) => {
  const { url } = context;

  // 1. Check CMS Redirects (Task B6)
  const redirect = await matchRedirect(url.pathname, url.search);
  if (redirect) {
    return context.redirect(redirect.to, redirect.status as 301 | 302);
  }

  // 2. Execute inner route handler
  const response = await next();

  // 3. Header policy (Tasks B4a, B4b, S-16b)
  const isPreview = url.searchParams.has('preview') || context.cookies.has('tm_preview');
  if (isPreview) {
    response.headers.set('Cache-Control', 'private, no-store, must-revalidate');
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  } else {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
      response.headers.set('X-Accel-Expires', '5');
    }
  }

  return response;
});
