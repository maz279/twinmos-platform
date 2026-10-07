import { defineConfig } from 'astro/config';

// P1: URL scheme preserved 1:1 from the prototype — every route emits /page.html
// (format:'file') so all internal links (shop.html?cat=…, product.html?id=…)
// keep working verbatim. Parity testing runs against `astro build` + `astro preview`.
// P4: 9-locale routing (EN default, unprefixed; BN removed per the
// post-remediation fact base). Locale landings live under /[locale]/.
export default defineConfig({
  site: 'https://www.twinmos.com',
  output: 'static',
  build: { format: 'file' },
  // Production parity for `astro preview` (dev + preview both honor this):
  // the deployed shape is same-origin /api/v1 behind the nginx reverse proxy
  // (deploy/nginx/twinmos.conf). Locally, a same-origin build (PUBLIC_API_URL
  // unset/empty) needs the same forwarding to reach the API on :8787.
  // Cross-origin dev (apps/web/.env PUBLIC_API_URL=…) bypasses this entirely.
  // `astro preview` does NOT proxy (server.proxy is dev-only) — production-shape
  // preview locally is served by tooling/prod-preview.mjs (static dist +
  // /api forwarding, mirroring deploy/nginx/twinmos.conf). server.proxy here
  // covers bare-clone `astro dev` without PUBLIC_API_URL in apps/web/.env.
  server: { proxy: { '/api': 'http://127.0.0.1:8787' } },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ar', 'hi', 'ru', 'zh-cn', 'fr', 'es', 'pt', 'de'],
    routing: { prefixDefaultLocale: false },
  },
});
