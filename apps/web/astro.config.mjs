import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.twinmos.com',
  output: 'static',
  i18n: {
    defaultLocale: 'en',
    locales: ['en'], // P4: ar, bn, hi → ru, zh-CN, fr → es, pt, de
    routing: { prefixDefaultLocale: false },
  },
});
