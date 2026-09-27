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
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ar', 'hi', 'ru', 'zh-cn', 'fr', 'es', 'pt', 'de'],
    routing: { prefixDefaultLocale: false },
  },
});
