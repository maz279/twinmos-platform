import { beforeAll, describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const CODEBASE_ROOT = resolve(process.cwd(), '../..');
const CLASSIFICATION_PATH = resolve(CODEBASE_ROOT, 'tooling', 'data', 'legacy_url_classification.json');
const NGINX_MAP_PATH = resolve(CODEBASE_ROOT, 'deploy', 'nginx', 'twinmos-redirects.map');
const WP_PATHS_FILE = resolve(CODEBASE_ROOT, '../audit/Audit_report/audit_finding_Implementation/evidence/seo_migration/legacy_live_paths_2023plus.txt');
const CRAWL_URLS_FILE = resolve(CODEBASE_ROOT, '../audit/Audit_report/audit_finding_Implementation/evidence/seo_migration/live_crawl_urls_2026-09-23.txt');

interface ClassificationItem {
  from: string;
  to: string;
  code: number;
  category: string;
  source: string;
  reason: string;
}

describe('MS6.4 · URL Migration & URL-01 Certification', () => {
  let items: ClassificationItem[];
  let nginxMapContent: string;
  let wpPaths: string[] = [];
  let crawlPaths: string[] = [];

  beforeAll(() => {
    expect(existsSync(CLASSIFICATION_PATH)).toBe(true);
    items = JSON.parse(readFileSync(CLASSIFICATION_PATH, 'utf8'));

    expect(existsSync(NGINX_MAP_PATH)).toBe(true);
    nginxMapContent = readFileSync(NGINX_MAP_PATH, 'utf8');

    expect(existsSync(WP_PATHS_FILE)).toBe(true);
    wpPaths = readFileSync(WP_PATHS_FILE, 'utf8')
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith('#'))
      .map((p) => (p.startsWith('/') ? p : '/' + p));

    expect(existsSync(CRAWL_URLS_FILE)).toBe(true);
    crawlPaths = readFileSync(CRAWL_URLS_FILE, 'utf8')
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith('#'))
      .map((url) => {
        try {
          return new URL(url).pathname;
        } catch {
          return url.startsWith('/') ? url : '/' + url;
        }
      });
  });

  describe('T6.4.1 · Comprehensive Legacy URL Classification Coverage', () => {
    it('contains at least 320 classified URLs with comprehensive metadata', () => {
      expect(items.length).toBeGreaterThanOrEqual(320);

      const redirect301Count = items.filter((i) => i.code === 301).length;
      const gone410Count = items.filter((i) => i.code === 410).length;
      const canonical200Count = items.filter((i) => i.code === 200).length;

      expect(redirect301Count).toBeGreaterThanOrEqual(280);
      expect(gone410Count).toBeGreaterThanOrEqual(20);
      expect(canonical200Count).toBeGreaterThanOrEqual(5);
    });

    it('covers all 289 WordPress paths from legacy_live_paths_2023plus.txt', () => {
      expect(wpPaths.length).toBe(289);
      const itemsMap = new Map<string, ClassificationItem>();
      for (const item of items) {
        itemsMap.set(item.from, item);
        const norm = item.from.endsWith('/') ? item.from.slice(0, -1) : item.from + '/';
        itemsMap.set(norm, item);
      }

      const missing: string[] = [];
      for (const p of wpPaths) {
        if (!itemsMap.has(p)) {
          missing.push(p);
        }
      }
      expect(missing, `Missing WP paths: ${missing.join(', ')}`).toEqual([]);
    });

    it('covers all 69 live crawl URLs from live_crawl_urls_2026-09-23.txt', () => {
      expect(crawlPaths.length).toBe(69);
      const itemsMap = new Map<string, ClassificationItem>();
      for (const item of items) {
        itemsMap.set(item.from, item);
        const norm = item.from.endsWith('/') ? item.from.slice(0, -1) : item.from + '/';
        itemsMap.set(norm, item);
      }

      const missing: string[] = [];
      for (const p of crawlPaths) {
        if (!itemsMap.has(p)) {
          missing.push(p);
        }
      }
      expect(missing, `Missing crawl paths: ${missing.join(', ')}`).toEqual([]);
    });

    it('covers prototype .html and query fallbacks', () => {
      const itemsMap = new Map<string, ClassificationItem>(items.map((i) => [i.from, i]));
      const prototypeRoutes = [
        '/index.html',
        '/about.html',
        '/shop.html',
        '/product.html',
        '/news.html',
        '/support.html',
        '/contact.html',
        '/partners.html',
        '/legal.html',
        '/compare.html',
        '/compatibility.html',
        '/gaming.html',
        '/technology.html',
        '/solutions.html',
        '/where-to-buy.html',
      ];

      for (const proto of prototypeRoutes) {
        expect(itemsMap.has(proto), `Expected prototype route ${proto} in classification`).toBe(true);
      }
    });

    it('satisfies zero mass-redirects to root (to: /)', () => {
      // Only legitimate homepage variants (/index.php and /index.html) map to root /
      const nonHomepageRedirectsToRoot = items.filter(
        (i) => i.code === 301 && (i.to === '/' || i.to === '') && i.from !== '/index.php' && i.from !== '/index.html'
      );
      expect(nonHomepageRedirectsToRoot.length, `Found unexpected mass redirects to /: ${JSON.stringify(nonHomepageRedirectsToRoot)}`).toBe(0);
    });

    it('satisfies zero redirect chains or loops (0 chains)', () => {
      const sources = new Set<string>();
      for (const item of items) {
        if (item.code === 301) {
          sources.add(item.from);
          sources.add(item.from.endsWith('/') ? item.from.slice(0, -1) : item.from + '/');
        }
      }

      const chains: any[] = [];
      for (const item of items) {
        if (item.code === 301) {
          const dest = item.to.split('?')[0]; // base destination path
          if (sources.has(dest)) {
            chains.push({ source: item.from, target: dest });
          }
        }
      }
      expect(chains, `Found redirect chains: ${JSON.stringify(chains)}`).toEqual([]);
    });

    it('maps WordPress administrative/internals cleanly to 410 Gone', () => {
      const itemsMap = new Map<string, ClassificationItem>(items.map((i) => [i.from, i]));
      const sample410s = [
        '/wp-login.php',
        '/sample-page',
      ];

      for (const p of sample410s) {
        const entry = itemsMap.get(p) || itemsMap.get(p + '/');
        expect(entry, `Entry for ${p} should exist`).toBeDefined();
        expect(entry!.code).toBe(410);
      }

      const wpInternalItems = items.filter((i) =>
        i.from.startsWith('/wp-json') ||
        i.from.startsWith('/wp-content') ||
        i.from.startsWith('/elementor-hf') ||
        i.from.startsWith('/.well-known')
      );
      expect(wpInternalItems.length).toBeGreaterThan(0);
      for (const item of wpInternalItems) {
        expect(item.code).toBe(410);
      }
    });

    it('maps legacy product pages 1-to-1 to active PDPs', () => {
      const itemsMap = new Map<string, ClassificationItem>(items.map((i) => [i.from, i]));
      const legacyProducts = [
        { legacy: '/product/twinmos-voltx-rgb-ddr5-u-dimm-for-desktop', target: '/products/voltx-rgb-ddr5-u-dimm-for-desktop' },
        { legacy: '/product/twinmos-corex-pro-m-2-pcie-gen-5-0-nvme-ssd', target: '/products/corex-pro-m2-pcie-gen-5-0-nvme-ssd' },
        { legacy: '/product/twinmos-hyper-ssd-h2-ultra', target: '/products/hyper-ssd-h2-ultra' },
        { legacy: '/product/twinmos-m16-usb-3-2-flash-drive', target: '/products/m16-usb-3-2-flash-drive' },
        { legacy: '/product/twinmos-xtreme-gen4-x4-nvme-pro-m-2-2280-ssd', target: '/products/xtreme-gen4x4-nvme-pro-m2-2280-ssd' },
      ];

      for (const lp of legacyProducts) {
        const item = itemsMap.get(lp.legacy) || itemsMap.get(lp.legacy + '/');
        expect(item, `Legacy product ${lp.legacy} should be mapped`).toBeDefined();
        expect(item!.code).toBe(301);
        expect(item!.to).toBe(lp.target);
      }
    });

    it('maps legacy category pages to faceted shop routes', () => {
      const itemsMap = new Map<string, ClassificationItem>(items.map((i) => [i.from, i]));
      const legacyCategories = [
        { legacy: '/product-category/solid-state-drive', cat: 'ssd' },
        { legacy: '/product-category/solid-state-drive/sata-ssd', cat: 'ssd-sata' },
        { legacy: '/product-category/dram-module', cat: 'dram-desktop' },
        { legacy: '/product-category/flash-drive', cat: 'flash' },
      ];

      for (const lc of legacyCategories) {
        const item = itemsMap.get(lc.legacy) || itemsMap.get(lc.legacy + '/');
        expect(item, `Legacy category ${lc.legacy} should be mapped`).toBeDefined();
        expect(item!.code).toBe(301);
        expect(item!.to).toContain('/shop');
        expect(item!.to).toContain(lc.cat);
      }
    });

    it('enforces press release decision from T2.1.5 / BD-06', () => {
      const newsItems = items.filter((i) => i.category === 'press_legacy' || i.category === 'press_archived');
      expect(newsItems.length).toBeGreaterThan(0);
      for (const item of newsItems) {
        expect(item.code).toBe(301);
        expect(['/news', '/support']).toContain(item.to);
      }
    });
  });

  describe('T6.4.2 · NGINX Map Parity & Edge Consistency', () => {
    it('verifies deploy/nginx/twinmos-redirects.map format and rule count', () => {
      const lines = nginxMapContent
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0 && !l.startsWith('#'));

      const redirect301Count = items.filter((i) => i.code === 301).length;
      expect(lines.length).toBe(redirect301Count);

      // Verify no unexpected mass redirects to /; (only /index.php and /index.html allowed)
      const unexpectedRootRedirects = lines.filter((l) => {
        const parts = l.split(/\s+/);
        return parts.length >= 2 && parts[1] === '/;' && parts[0] !== '/index.php' && parts[0] !== '/index.html';
      });
      expect(unexpectedRootRedirects.length).toBe(0);

      // Verify semicolon termination
      for (const l of lines) {
        expect(l.endsWith(';'), `Line should end with semicolon: ${l}`).toBe(true);
      }
    });


    it('verifies llms.txt provides corporate and product markdown index', () => {
      const llmsPath = resolve(CODEBASE_ROOT, 'apps', 'web', 'public', 'llms.txt');
      expect(existsSync(llmsPath)).toBe(true);
      const content = readFileSync(llmsPath, 'utf8');

      expect(content).toContain('# TwinMOS Technologies');
      expect(content).toContain('1998');
      expect(content).toContain('/products');
      expect(content).toContain('/support');
    });
  });
});
