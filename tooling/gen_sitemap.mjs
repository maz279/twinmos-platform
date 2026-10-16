import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const pagesDir = resolve(repoRoot, 'apps', 'web', 'src', 'pages');
const cacheFile = resolve(repoRoot, 'apps', 'web', 'src', 'data', 'pages-cache.json');
const outFile = resolve(repoRoot, 'apps', 'web', 'public', 'sitemap.xml');

const SITE = 'https://www.twinmos.com/';
const PRIORITY = {
  'index.html': ['1.0', 'daily'],
  'shop.html': ['0.9', 'daily'],
  'product.html': ['0.9', 'weekly'],
  'support.html': ['0.9', 'weekly'],
  'learn.html': ['0.9', 'weekly'],
  '404.html': null
};

const urls = [];

// 1. Core pages
const CORE_PAGES = [
  'index.html', 'shop.html', 'product.html', 'article.html', 'news.html', 'search.html',
  'about.html', 'careers.html', 'compare.html', 'compatibility.html', 'contact.html',
  'gaming.html', 'legal.html', 'partners.html', 'quote.html', 'rma.html',
  'sitemap.html', 'solutions.html', 'support.html', 'technology.html', 'where-to-buy.html',
  'learn.html', 'learn-guides.html', 'learn-explained.html', 'learn-benchmarks.html',
  'learn-glossary.html', 'learn-blog.html'
];

for (const p of CORE_PAGES) {
  const spec = PRIORITY[p] || ['0.7', 'weekly'];
  const loc = p === 'index.html' ? SITE : `${SITE}${p}`;
  urls.push(`  <url><loc>${loc}</loc><changefreq>${spec[1]}</changefreq><priority>${spec[0]}</priority></url>`);
}

// 2. Locale landings (all 8 non-EN locales)
const LOCALES = ['ar', 'hi', 'ru', 'zh-cn', 'fr', 'es', 'pt', 'de'];
for (const code of LOCALES) {
  urls.push(`  <url><loc>${SITE}${code}.html</loc><changefreq>weekly</changefreq><priority>0.6</priority></url>`);
}

// 3. Deep product & article content from pages cache if available
const KNOWN_PRODUCTS = [
  'corex-pro-m2-pcie-gen-5-0-nvme-ssd',
  'voltx-ddr5-udimm-16gb',
  'alphapro-nvme-m2-2280-ssd',
  'tornadox7-ddr4-3200mhz-udimm',
  'elite-drive-pro-portable-ssd'
];

const KNOWN_ARTICLES = [
  'what-is-xmp',
  'ddr4-vs-ddr5-memory-comparison',
  'how-to-choose-best-ssd-for-gaming',
  'nvme-gen3-gen4-gen5-explained',
  'ultimate-ram-glossary-guide'
];

for (const prod of KNOWN_PRODUCTS) {
  urls.push(`  <url><loc>${SITE}product.html?id=${prod}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`);
}

for (const art of KNOWN_ARTICLES) {
  urls.push(`  <url><loc>${SITE}article.html?id=${art}</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>`);
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;

writeFileSync(outFile, xml, 'utf8');
console.log(`[gen-sitemap] Emitted ${urls.length} URLs to ${outFile}`);
