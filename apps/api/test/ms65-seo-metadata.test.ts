import { beforeAll, describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const CODEBASE_ROOT = resolve(process.cwd(), '../..');
const SECURITY_WELL_KNOWN = resolve(CODEBASE_ROOT, 'apps', 'web', 'public', '.well-known', 'security.txt');
const SECURITY_ROOT = resolve(CODEBASE_ROOT, 'apps', 'web', 'public', 'security.txt');
const HUMANS_TXT = resolve(CODEBASE_ROOT, 'apps', 'web', 'public', 'humans.txt');
const ADMIN_INDEX = resolve(CODEBASE_ROOT, 'apps', 'admin', 'index.html');
const LAYOUT_ASTRO = resolve(CODEBASE_ROOT, 'apps', 'web', 'src', 'layouts', 'Layout.astro');
const SITEMAP_XML_TS = resolve(CODEBASE_ROOT, 'apps', 'web', 'src', 'pages', 'sitemap.xml.ts');
const ROBOTS_TXT_TS = resolve(CODEBASE_ROOT, 'apps', 'web', 'src', 'pages', 'robots.txt.ts');
const API_APP_TS = resolve(CODEBASE_ROOT, 'apps', 'api', 'src', 'app.ts');

describe('MS6.5 · SEO Metadata and Structured Data (Gate SEO-01)', () => {
  describe('T6.5.1 · Canonicals, Titles & Double-Escaping Fixes (Z-24)', () => {
    it('Layout.astro defines single self-canonical and canonical override support', () => {
      const content = readFileSync(LAYOUT_ASTRO, 'utf8');
      expect(content).toContain('<link rel="canonical" href={canonical.toString()} />');
      expect(content).toContain('canonical: customCanonical');
    });

    it('Layout.astro unescapes HTML entities to prevent double-escaping &amp; in titles', () => {
      const content = readFileSync(LAYOUT_ASTRO, 'utf8');
      expect(content).toContain('function cleanSeoText(');
      expect(content).toContain('.replace(/&amp;/g, \'&\')');
    });

    it('Page templates have zero raw &amp; in title declarations', () => {
      const pageFiles = [
        resolve(CODEBASE_ROOT, 'apps', 'web', 'src', 'pages', 'index.astro'),
        resolve(CODEBASE_ROOT, 'apps', 'web', 'src', 'pages', 'technology.astro'),
        resolve(CODEBASE_ROOT, 'apps', 'web', 'src', 'pages', 'solutions.astro'),
        resolve(CODEBASE_ROOT, 'apps', 'web', 'src', 'pages', 'learn-guides.astro'),
        resolve(CODEBASE_ROOT, 'apps', 'web', 'src', 'pages', 'learn-glossary.astro'),
        resolve(CODEBASE_ROOT, 'apps', 'web', 'src', 'pages', 'learn-explained.astro'),
        resolve(CODEBASE_ROOT, 'apps', 'web', 'src', 'pages', 'learn-blog.astro'),
      ];

      for (const file of pageFiles) {
        const content = readFileSync(file, 'utf8');
        const titleMatch = content.match(/const\s+title\s*=\s*[^;]+;/);
        expect(titleMatch).toBeTruthy();
        expect(titleMatch![0]).not.toContain('&amp;');
      }
    });
  });

  describe('T6.5.2 · Social Tags and Structured Data (Z-24)', () => {
    it('Layout.astro includes all 4 required Open Graph properties and Twitter cards', () => {
      const content = readFileSync(LAYOUT_ASTRO, 'utf8');
      expect(content).toContain('property="og:title"');
      expect(content).toContain('property="og:type"');
      expect(content).toContain('property="og:image"');
      expect(content).toContain('property="og:url"');
      expect(content).toContain('name="twitter:card" content="summary_large_image"');
      expect(content).toContain('name="twitter:image"');
    });

    it('Organization and WebSite JSON-LD schemas are strictly scoped to homepage only', () => {
      const content = readFileSync(LAYOUT_ASTRO, 'utf8');
      expect(content).toContain('const isHomepage = path === \'/\' || path === \'\';');
      expect(content).toContain('{isHomepage && (');
      // serialised through jsonForScript so a CMS value cannot close the tag (ZT-056)
      expect(content).toContain('set:html={jsonForScript(ORG_LD)}');
      expect(content).toContain('set:html={jsonForScript(SITE_LD)}');
    });

    it('BreadcrumbList is generated for internal pages with breadcrumbs', () => {
      const content = readFileSync(LAYOUT_ASTRO, 'utf8');
      expect(content).toContain('const BREADCRUMB_LD = breadcrumbs && breadcrumbs.length > 0');
      expect(content).toContain('\'@type\': \'BreadcrumbList\'');
      expect(content).toContain('{BREADCRUMB_LD && <script type="application/ld+json" set:html={jsonForScript(BREADCRUMB_LD)} />}');
    });

    it('Zero FAQPage schema in the entire web application', () => {
      const webSrc = resolve(CODEBASE_ROOT, 'apps', 'web', 'src');
      // Read all files in webSrc recursively
      const { readdirSync, statSync } = require('node:fs');
      function checkFaq(dir: string) {
        const files = readdirSync(dir);
        for (const f of files) {
          const full = resolve(dir, f);
          if (statSync(full).isDirectory()) {
            checkFaq(full);
          } else if (f.endsWith('.astro') || f.endsWith('.ts') || f.endsWith('.tsx')) {
            const code = readFileSync(full, 'utf8');
            expect(code).not.toContain('FAQPage');
          }
        }
      }
      checkFaq(webSrc);
    });
  });

  describe('T6.5.3 · Sitemaps, Robots, RFC 9116 security.txt & Noindex (Z-37)', () => {
    it('sitemap.xml.ts includes xmlns:xhtml and reciprocal hreflang links with x-default', () => {
      const content = readFileSync(SITEMAP_XML_TS, 'utf8');
      expect(content).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
      expect(content).toContain('<xhtml:link rel="alternate" hreflang="');
      expect(content).toContain('hreflang="x-default"');
    });

    it('security.txt complies with RFC 9116: Expires < 1 year, valid contact, clean Policy URL', () => {
      expect(existsSync(SECURITY_WELL_KNOWN)).toBe(true);
      expect(existsSync(SECURITY_ROOT)).toBe(true);

      const content = readFileSync(SECURITY_WELL_KNOWN, 'utf8');
      expect(content).toContain('Contact: mailto:security@twinmos.com');
      expect(content).toContain('Policy: https://www.twinmos.com/legal#security');
      expect(content).toContain('Hiring: https://www.twinmos.com/careers');
      expect(content).not.toContain('.html');

      const expiresMatch = content.match(/Expires:\s*([^\r\n]+)/);
      expect(expiresMatch).toBeTruthy();
      const expiresDate = new Date(expiresMatch![1]);
      const now = new Date();
      const diffMs = expiresDate.getTime() - now.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      expect(diffDays).toBeGreaterThan(0);
      expect(diffDays).toBeLessThanOrEqual(365); // RFC 9116 §2.5.5: must NOT be > 1 year in future
    });

    it('humans.txt exists with team and site standards metadata', () => {
      expect(existsSync(HUMANS_TXT)).toBe(true);
      const content = readFileSync(HUMANS_TXT, 'utf8');
      expect(content).toContain('Engineering: TwinMOS Technologies');
      expect(content).toContain('RFC 9116 security.txt');
    });

    it('API server enforces X-Robots-Tag: noindex, nofollow on all responses', () => {
      const content = readFileSync(API_APP_TS, 'utf8');
      expect(content).toContain("c.header('X-Robots-Tag', 'noindex, nofollow')");
    });

    it('Admin SPA HTML contains meta robots noindex, nofollow', () => {
      const content = readFileSync(ADMIN_INDEX, 'utf8');
      expect(content).toContain('<meta name="robots" content="noindex, nofollow" />');
    });

    it('Layout.astro sets noindex and X-Robots-Tag for preview parameter', () => {
      const content = readFileSync(LAYOUT_ASTRO, 'utf8');
      expect(content).toContain("Astro.url.searchParams.get('preview') === 'true'");
      expect(content).toContain("Astro.response.headers.set('X-Robots-Tag', 'noindex, nofollow')");
    });
  });
});
