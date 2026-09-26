import { defineConfig } from 'astro/config';

// P1: URL scheme preserved 1:1 from the prototype — every route emits /page.html
// (format:'file') so all internal links (shop.html?cat=…, product.html?id=…)
// keep working verbatim. Parity testing runs against `astro build` + `astro preview`.
export default defineConfig({
  site: 'https://www.twinmos.com',
  output: 'static',
  build: { format: 'file' },
  i18n: {
    defaultLocale: 'en',
    locales: ['en'], // P4: ar, bn, hi → ru, zh-CN, fr → es, pt, de
    routing: { prefixDefaultLocale: false },
  },
});
