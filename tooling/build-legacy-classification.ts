import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const WP_FILE = resolve(ROOT, '../audit/Audit_report/audit_finding_Implementation/evidence/seo_migration/legacy_live_paths_2023plus.txt');
const LIVE_FILE = resolve(ROOT, '../audit/Audit_report/audit_finding_Implementation/evidence/seo_migration/live_crawl_urls_2026-09-23.txt');
const OUT_FILE = resolve(HERE, 'data/legacy_url_classification.json');

interface ClassificationEntry {
  from: string;
  to: string;
  code: number;
  category: string;
  source: 'wordpress_289' | 'live_crawl_69' | 'prototype_html' | 'both';
  reason: string;
}

const wpLines = readFileSync(WP_FILE, 'utf8').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
const liveLines = readFileSync(LIVE_FILE, 'utf8').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
const livePaths = liveLines.map((u) => u.replace(/^https?:\/\/[^\/]+/, '') || '/');

const wpSet = new Set(wpLines);
const liveSet = new Set(livePaths);
const allLegacy = [...new Set([...wpLines, ...livePaths])].sort();

// Direct PDP mappings for historical products to active catalog PDPs
const PRODUCT_PDP_MAP: Record<string, string> = {
  '/product/twinmos-voltx-rgb-ddr5-u-dimm-for-desktop': '/products/voltx-rgb-ddr5-u-dimm-for-desktop',
  '/product/twinmos-voltx-ddr5-u-dimm-for-desktop': '/products/voltx-ddr5-u-dimm-for-desktop',
  '/product/twinmos-voltx-ddr5-so-dimm-for-laptop': '/products/voltx-ddr5-so-dimm-for-laptop',
  '/product/twinmos-thunder-gx-ddr4-u-dimm-for-desktop': '/products/thunder-gx-ddr4-u-dimm-for-desktop',
  '/product/twinmos-tornadox6-ddr4-3200mhz-u-dimm-for-desktop': '/products/tornadox6-ddr4-3200mhz-u-dimm-for-desktop',
  '/product/twinmos-tornadox7-ddr4-3200mhz-cl22-u-dimm-for-desktop': '/products/tornadox7-ddr4-3200mhz-cl22-u-dimm-for-desktop',
  '/product/twinmos-tornadox7-pro-ddr4-3200mhz-cl16-gaming-ram': '/products/tornadox7-pro-ddr4-3200mhz-cl16-u-dimm-for-desktop',
  '/product/twinmos-corex-pro-m-2-pcie-gen-5-0-nvme-ssd': '/products/corex-pro-m2-pcie-gen-5-0-nvme-ssd',
  '/product/twinmos-corex-m-2-pcie-gen-4-0-nvme-ssd': '/products/corex-m2-pcie-gen-4-0-nvme-ssd',
  '/product/twinmos-xtreme-gen4-x4-nvme-pro-m-2-2280-ssd': '/products/xtreme-gen4x4-nvme-pro-m2-2280-ssd',
  '/product/twinmos-alphapro-nvme-m-2-2280-new-ssd': '/products/alphapro-nvme-m2-2280-new-ssd',
  '/product/twinmos-nvme-m-2-2280-ssd': '/products/nvme-m2-2280-ssd',
  '/product/twinmos-hyper-ssd-h2-ultra': '/products/hyper-ssd-h2-ultra',
  '/product/twinmos-portable-ssd-elite-drive-pro-usb-type-c': '/products/portable-ssd-elite-drive-pro-usb-type-c',
  '/product/twinmos-portable-external-ssd-elitedrive-usb-3-0-type-c': '/products/portable-ssd-elitedrive-usb-3-0-type-c',
  '/product/twinmos-portable-hdd-prodrive-ultra-usb-3-0': '/products/portable-hdd-prodrive-ultra-usb-3-0',
  '/product/twinmos-portable-hdd-prodrive-usb-3-0': '/products/portable-hdd-prodrive-usb-3-0',
  '/product/twinmos-x3-ultra-usb-3-2-flash-drive': '/products/x3-ultra-usb-3-2-flash-drive',
  '/product/twinmos-m16-usb-3-2-flash-drive': '/products/m16-usb-3-2-flash-drive',
  '/product/twinmos-smartx-rgb-80-plus-bronze-power-supply-450w': '/products/smartx-rgb-80-plus-bronze-power-supply-450w',
  '/product/twinmos-smartx-rgb-80-plus-bronze-power-supply-550w': '/products/smartx-rgb-80-plus-bronze-power-supply-550w',
  '/product/twinmos-xpower-80-plus-bronze-450w': '/products/xpower-80-plus-bronze-450w',
  '/product/twinmos-xpower-80-plus-bronze-550w': '/products/xpower-80-plus-bronze-550w',
  '/product/twinmos-4-port-usb3-0-hub-ezeehub-34l-m': '/products/4-port-usb3-0-hub-ezeehub-34l-m',
  '/product/twinmos-3-ports-usb-2-0-and-1-port-usb-3-0-hub-23l': '/products/3-ports-usb-2-0-and-1-port-usb-3-0-hub-23l',
  '/product/twinmos-3-ports-usb-2-0-and-1-port-usb-3-0-hub-ezeehub23p': '/products/3-ports-usb-2-0-and-1-port-usb-3-0-hub-ezeehub23p',
  '/product/twinmos-64gb-microsdxc-class-10-uhs-1': '/products/microsdxc-class-10-v30-uhs-3',
  '/twinmos-h2-ultra-ssd': '/products/hyper-ssd-h2-ultra',
  '/twinmos-tornadox7-pro-ddr4-3200mhz-cl16-gaming-ram': '/products/tornadox7-pro-ddr4-3200mhz-cl16-u-dimm-for-desktop',
  '/twinmos-voltx-ddr5-u-dimm-for-desktop': '/products/voltx-ddr5-u-dimm-for-desktop',
  '/twinmos-voltx-rgb-ddr5-u-dimm-for-desktop': '/products/voltx-rgb-ddr5-u-dimm-for-desktop',
};

// Specific article redirects
const ARTICLE_MAP: Record<string, string> = {
  '/a-generational-leap-in-ssd-technology-understanding-nvme-speeds-gen3-gen4-gen5-explained': '/learn/nvme-gen3-gen4-gen5-explained',
  '/explaining-direct-storage-how-our-gen5-ssd-will-change-your-gaming': '/learn/directstorage-gen5-gaming',
  '/decoding-the-language-of-ram-your-ultimate-computer-memory-glossary': '/learn/ram-glossary',
  '/boost-pc-performance-should-you-upgrade-ram-or-ssd-first': '/learn/boost-pc-performance-ram-or-ssd-first',
  '/bring-new-life-to-your-old-laptop': '/learn/laptop-nvme-upgrade-guide',
  '/how-do-you-choose-the-best-dram-and-memory-solution-for-ai-computing': '/learn/dram-for-ai-computing',
  '/how-much-ram-do-you-need-on-your-computer': '/learn/how-much-ram-do-you-need',
  '/how-to-check-your-motherboard-and-ram-compatibility': '/learn/how-to-check-motherboard-ram-compatibility',
  '/elevate-your-gaming-experience-with-twinmos-voltx-ddr5-desktop-dram-rgb': '/learn/voltx-ddr5-rgb-gaming',
  '/unleashing-the-power-of-twinmos-voltx-ddr5-desktop-dram': '/learn/voltx-ddr5-rgb-gaming',
  '/introducing-the-twinmos-corex-pcie-gen4-nvme-ssd-next-level-storage-performance': '/learn/corex-pro-gen5-launch',
  '/twinmos-unleashes-unprecedented-speed-with-corex-pro-m-2-pcie-gen-5-0-nvme-ssd-redefining-storage-performance': '/learn/corex-pro-gen5-launch',
  '/twinmos-launches-the-all-new-voltx-series-7200mhz-cl34-high-performance-memory': '/learn/voltx-ddr5-rgb-gaming',
  '/twinmos-unveils-the-voltx-series-6000mhz-cl34-power-and-performance-redefined': '/learn/voltx-ddr5-rgb-gaming',
  '/twinmos-to-showcase-cutting-edge-memory-storage-solutions-at-computex-2025': '/learn/computex-2025',
};

// Corporate page 1-to-1 mappings
const CORP_MAP: Record<string, string> = {
  '/about-us': '/about',
  '/since1998': '/about',
  '/quality-assurance': '/about',
  '/career': '/careers',
  '/partners': '/partners',
  '/contact': '/contact',
  '/support': '/support',
  '/rd': '/technology',
  '/media-events': '/news',
  '/computex-2026': '/news',
  '/terms-of-use': '/legal',
  '/privacy-policy-2': '/legal',
  '/warranty-policy': '/legal',
  '/request-a-quote': '/quote',
  '/shop': '/shop',
  '/shop-2': '/shop',
  '/cart': '/shop',
  '/wishlist': '/shop',
  '/index.php': '/',
  '/sitemap.xml': '/sitemap.xml',
  '/llms.txt': '/llms.txt',
  '/faq-dram': '/support',
  '/faq-ssd': '/support',
  '/faq-ssd-copy': '/support',
  '/faq-accessories': '/support',
};

function classifyPath(p: string): { to: string; code: number; category: string; reason: string } {
  // 1. Root and active endpoints that return 200 directly
  if (p === '/') {
    return { to: '/', code: 200, category: 'homepage', reason: 'Canonical root URL' };
  }
  if (p === '/sitemap.xml') {
    return { to: '/sitemap.xml', code: 200, category: 'sitemap', reason: 'Canonical dynamic sitemap' };
  }
  if (p === '/llms.txt') {
    return { to: '/llms.txt', code: 200, category: 'llms', reason: 'Canonical llms.txt' };
  }

  // 2. Direct PDP product match
  if (PRODUCT_PDP_MAP[p]) {
    return { to: PRODUCT_PDP_MAP[p], code: 301, category: 'product_pdp', reason: '1-to-1 product match to active catalog' };
  }
  if (p.startsWith('/product/')) {
    // Unmatched legacy product: map to nearest category in shop
    if (p.includes('power-supply')) return { to: '/shop?cat=psu', code: 301, category: 'product_fallback', reason: 'Legacy PSU product mapped to PSU catalog' };
    if (p.includes('ssd')) return { to: '/shop?cat=ssd', code: 301, category: 'product_fallback', reason: 'Legacy SSD product mapped to SSD catalog' };
    if (p.includes('ddr')) return { to: '/shop?cat=dram-desktop', code: 301, category: 'product_fallback', reason: 'Legacy DRAM product mapped to DRAM catalog' };
    return { to: '/shop', code: 301, category: 'product_fallback', reason: 'Legacy product mapped to catalog' };
  }

  // 3. Direct Article / Learn match
  if (ARTICLE_MAP[p]) {
    return { to: ARTICLE_MAP[p], code: 301, category: 'article_single', reason: '1-to-1 article match to active learn section' };
  }

  // 4. Corporate & Support exact matches
  if (CORP_MAP[p]) {
    const to = CORP_MAP[p];
    return { to, code: to === p ? 200 : 301, category: 'corporate_page', reason: '1-to-1 canonical page migration' };
  }

  // 5. Product categories (WooCommerce -> shop faceted search)
  if (p.startsWith('/product-category/')) {
    if (p.includes('dram')) {
      if (p.includes('gaming')) return { to: '/shop?cat=dram-gaming', code: 301, category: 'catalog_category', reason: 'Gaming DRAM category' };
      if (p.includes('notebook')) return { to: '/shop?cat=dram-notebook', code: 301, category: 'catalog_category', reason: 'Notebook DRAM category' };
      return { to: '/shop?cat=dram-desktop', code: 301, category: 'catalog_category', reason: 'Desktop DRAM category' };
    }
    if (p.includes('solid-state-drive') || p.includes('nvme') || p.includes('sata')) {
      if (p.includes('nvme')) return { to: '/shop?cat=ssd-nvme', code: 301, category: 'catalog_category', reason: 'NVMe SSD category' };
      if (p.includes('sata')) return { to: '/shop?cat=ssd-sata', code: 301, category: 'catalog_category', reason: 'SATA SSD category' };
      return { to: '/shop?cat=ssd', code: 301, category: 'catalog_category', reason: 'SSD master category' };
    }
    if (p.includes('portable-drives') || p.includes('portable-ssd') || p.includes('portable-hdd')) {
      if (p.includes('portable-hdd')) return { to: '/shop?cat=portable-hdd', code: 301, category: 'catalog_category', reason: 'Portable HDD category' };
      return { to: '/shop?cat=portable-ssd', code: 301, category: 'catalog_category', reason: 'Portable SSD category' };
    }
    if (p.includes('power-supply')) return { to: '/shop?cat=psu', code: 301, category: 'catalog_category', reason: 'PSU category' };
    if (p.includes('flash-drive')) return { to: '/shop?cat=flash', code: 301, category: 'catalog_category', reason: 'USB Flash category' };
    if (p.includes('microsd-card')) return { to: '/shop?cat=microsd', code: 301, category: 'catalog_category', reason: 'MicroSD category' };
    if (p.includes('usb-hub')) return { to: '/shop?cat=hub', code: 301, category: 'catalog_category', reason: 'USB Hub category' };
    return { to: '/shop', code: 301, category: 'catalog_category', reason: 'Product category archive' };
  }

  // 6. Brand and catalog pagination
  if (p.startsWith('/product-brand/') || p.startsWith('/brands/') || p.startsWith('/shop/page/')) {
    return { to: '/shop', code: 301, category: 'brand_pagination', reason: 'Brand filter or pagination mapped to catalog' };
  }

  // 7. Compatibility filters
  if (p.startsWith('/compatible-') || p.startsWith('/interface') || p.startsWith('/form-factor') || p.includes('compatibility')) {
    return { to: '/compatibility', code: 301, category: 'compatibility', reason: 'Legacy compatibility filter mapped to Compatibility Finder' };
  }

  // 8. Technical explainers and specs (heat-sink, endurance, speed, nand-, etc.)
  if (
    p.startsWith('/heat-sink') ||
    p.startsWith('/endurance') ||
    p.startsWith('/speed') ||
    p.startsWith('/nand-') ||
    p.startsWith('/ssd-') ||
    p.startsWith('/sequential-') ||
    p.startsWith('/random-') ||
    p.startsWith('/latency-') ||
    p.startsWith('/wattage') ||
    p.startsWith('/smart') ||
    p.startsWith('/power-') ||
    p.startsWith('/low-') ||
    p.startsWith('/bridge-') ||
    p.startsWith('/bad-') ||
    p.startsWith('/wear-')
  ) {
    return { to: '/learn-explained', code: 301, category: 'tech_spec', reason: 'Hardware spec filter mapped to Learn Explained hub' };
  }

  // 9. Knowledge hub hubs, blog, and category pagination
  if (p.startsWith('/category/articles')) {
    return { to: '/learn', code: 301, category: 'learn_hub', reason: 'Articles category archive mapped to Learn hub' };
  }
  if (p.startsWith('/category/news') || p.startsWith('/category/product-news')) {
    return { to: '/news', code: 301, category: 'news_hub', reason: 'News category archive mapped to News hub' };
  }
  if (p.startsWith('/blog')) {
    return { to: '/learn-blog', code: 301, category: 'blog_hub', reason: 'Blog archive mapped to Learn Blog' };
  }
  if (p.startsWith('/notice')) {
    return { to: '/news', code: 301, category: 'notice_hub', reason: 'Corporate notices mapped to News center' };
  }
  if (p.startsWith('/author/')) {
    return { to: '/news', code: 301, category: 'author_archive', reason: 'Author archive mapped to News' };
  }
  if (p.startsWith('/warranty/')) {
    return { to: '/legal', code: 301, category: 'warranty', reason: 'Warranty tier page mapped to Legal policy hub' };
  }

  // 10. Dated press release archive (2009–2023) — BD-06 compliance
  if (/^\/\d{4}\//.test(p)) {
    const yearMatch = p.match(/^\/(\d{4})\//);
    const year = yearMatch ? parseInt(yearMatch[1], 10) : 2010;
    if (year >= 2014) {
      return { to: '/news', code: 301, category: 'press_archived', reason: 'BD-06: Retain archived announcements (2014-present) mapped to News' };
    } else {
      // 2009-2013 announcements: obsolete DDR2/DDR3 memory standards -> 301 to news or support per BD-06
      return { to: '/news', code: 301, category: 'press_legacy', reason: 'BD-06: Legacy 2009-2013 announcements with broken media mapped to News' };
    }
  }

  // 11. Obsolete WordPress internals and system endpoints removed on purpose -> 410 Gone
  if (
    p.startsWith('/wp-') ||
    p.startsWith('/.well-known') ||
    p.startsWith('/elementor-hf') ||
    p.startsWith('/razox-breadcrumb') ||
    p.startsWith('/my-account') ||
    p.startsWith('/feeds') ||
    p === '/sample-page'
  ) {
    return { to: '/410', code: 410, category: 'purged_system', reason: 'Obsolete WordPress endpoint removed on purpose (410 Gone)' };
  }

  // Fallback: nearest relevant section
  if (p.includes('ram') || p.includes('dimm')) {
    return { to: '/shop?cat=dram-desktop', code: 301, category: 'dram_fallback', reason: 'Legacy memory query mapped to DRAM catalog' };
  }

  return { to: '/shop', code: 301, category: 'general_fallback', reason: 'Nearest relevant product catalog' };
}

// Build classification entries
const results: ClassificationEntry[] = [];

for (const p of allLegacy) {
  const isWp = wpSet.has(p);
  const isLive = liveSet.has(p);
  const source = isWp && isLive ? 'both' : (isWp ? 'wordpress_289' : 'live_crawl_69');
  const classified = classifyPath(p);

  results.push({
    from: p,
    to: classified.to,
    code: classified.code,
    category: classified.category,
    source,
    reason: classified.reason,
  });
}

// Add Prototype HTML entries (25 static pages)
const PROTO_HTML_PAGES = [
  'about', 'careers', 'compare', 'compatibility', 'contact', 'gaming', 'index',
  'learn-benchmarks', 'learn-blog', 'learn-explained', 'learn-glossary', 'learn-guides',
  'learn', 'legal', 'news', 'partners', 'quote', 'rma', 'search', 'shop', 'sitemap',
  'solutions', 'support', 'technology', 'where-to-buy'
];

for (const name of PROTO_HTML_PAGES) {
  const from = `/${name}.html`;
  const to = name === 'index' ? '/' : `/${name}`;
  if (!results.some((r) => r.from === from)) {
    results.push({
      from,
      to,
      code: 301,
      category: 'prototype_html',
      source: 'prototype_html',
      reason: 'Prototype .html extension canonical redirect to clean URL',
    });
  }
}

// Add Prototype product & article entry fallbacks
results.push({
  from: '/product.html',
  to: '/shop',
  code: 301,
  category: 'prototype_html',
  source: 'prototype_html',
  reason: 'Prototype product.html without query mapped to shop',
});

results.push({
  from: '/article.html',
  to: '/learn',
  code: 301,
  category: 'prototype_html',
  source: 'prototype_html',
  reason: 'Prototype article.html without query mapped to learn',
});

// Verification assertions:
// 1. Zero mass-redirects to '/'
const homeRedirects = results.filter((r) => r.to === '/' && r.code !== 200);
console.log('Redirects to /:', homeRedirects.map((r) => r.from));
if (homeRedirects.length > 2) {
  throw new Error(`Violation: Found ${homeRedirects.length} redirects to root '/'. Only index aliases allowed.`);
}

// 2. Zero chains (target cannot be an existing source)
const sourceMap = new Map(results.map((r) => [r.from, r]));
let chainCount = 0;
for (const r of results) {
  if (r.code === 301 && r.to !== '/' && r.to !== '/410') {
    const cleanTo = r.to.split('?')[0];
    if (sourceMap.has(cleanTo)) {
      const nextHop = sourceMap.get(cleanTo);
      if (nextHop && nextHop.code === 301) {
        console.warn(`Chain detected: ${r.from} -> ${r.to} -> ${nextHop.to}`);
        chainCount++;
      }
    }
  }
}

if (chainCount > 0) {
  throw new Error(`Violation: Found ${chainCount} redirect chains! Single-hop guarantee failed.`);
}

mkdirSync(dirname(OUT_FILE), { recursive: true });
writeFileSync(OUT_FILE, JSON.stringify(results, null, 2));

console.log(`Successfully classified ${results.length} total URLs.`);
console.log(`- 301 Redirects: ${results.filter((r) => r.code === 301).length}`);
console.log(`- 410 Gone: ${results.filter((r) => r.code === 410).length}`);
console.log(`- 200 Canonical: ${results.filter((r) => r.code === 200).length}`);
console.log(`Saved classification to ${OUT_FILE}`);
