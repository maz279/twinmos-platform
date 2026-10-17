// apps/api/test/consent-csp.test.ts — Unit & integration tests for R0.5: CONSENT-CSP & SITE-FUNC stop-gap
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..', '..');
const WEB_SRC = join(ROOT, 'apps', 'web', 'src');
const WEB_PUBLIC = join(ROOT, 'apps', 'web', 'public');

function walk(dir: string): string[] {
  let results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results = results.concat(walk(full));
    } else {
      results.push(full);
    }
  }
  return results;
}

describe('R0.5 · CONSENT-CSP: No Inline Scripts or Event Handlers', () => {
  it('has zero inline script tags in apps/web/src templates (excluding application/ld+json)', () => {
    const astroFiles = walk(WEB_SRC).filter((f) => f.endsWith('.astro') || f.endsWith('.html'));
    const inlineScripts: { file: string; line: number; text: string }[] = [];

    for (const file of astroFiles) {
      const lines = readFileSync(file, 'utf8').split('\n');
      lines.forEach((l, idx) => {
        // Exclude schema.org ld+json scripts and external scripts with src=
        if (
          /<script/i.test(l) &&
          !/type=[\"']application\/ld\+json[\"']/i.test(l) &&
          !/src=[\"']/i.test(l)
        ) {
          inlineScripts.push({ file, line: idx + 1, text: l.trim() });
        }
      });
    }

    expect(inlineScripts).toEqual([]);
  });

  it('has zero inline event handlers (onclick, onload, etc.) in apps/web/src templates', () => {
    const astroFiles = walk(WEB_SRC).filter((f) => f.endsWith('.astro') || f.endsWith('.html'));
    const inlineHandlers: { file: string; line: number; text: string }[] = [];

    for (const file of astroFiles) {
      const lines = readFileSync(file, 'utf8').split('\n');
      lines.forEach((l, idx) => {
        // Match inline DOM event handlers like onclick=, onchange=, onsubmit=
        if (/\bon(click|change|submit|load|error|input|keyup|keydown|mouseover)=/i.test(l)) {
          inlineHandlers.push({ file, line: idx + 1, text: l.trim() });
        }
      });
    }

    expect(inlineHandlers).toEqual([]);
  });

  it('CookieBanner does not contain "optional analytics cookies" wording', () => {
    const bannerPath = join(WEB_SRC, 'components', 'chrome', 'CookieBanner.astro');
    const content = readFileSync(bannerPath, 'utf8');
    expect(content).not.toContain('optional analytics cookies');
    expect(content).toContain('cookieDecline');
    expect(content).toContain('cookieAccept');
  });

  it('Layout.astro defines turnstile site key via meta tag, without inline script', () => {
    const layoutPath = join(WEB_SRC, 'layouts', 'Layout.astro');
    const content = readFileSync(layoutPath, 'utf8');
    expect(content).toContain('<meta name="turnstile-site-key"');
    expect(content).not.toContain('window.TURNSTILE_SITE_KEY = turnstileSiteKey');
  });

  it('Footer.astro has cookiePreferencesBtn without inline onclick', () => {
    const footerPath = join(WEB_SRC, 'components', 'chrome', 'Footer.astro');
    const content = readFileSync(footerPath, 'utf8');
    expect(content).toContain('id="cookiePreferencesBtn"');
    expect(content).not.toMatch(/id="cookiePreferencesBtn"[^>]*onclick=/);
  });
});

describe('R0.5 · Service Worker Hardening (apps/web/public/sw.js)', () => {
  it('sw.js excludes /api/ and /internal/ routes from caching', () => {
    const swPath = join(WEB_PUBLIC, 'sw.js');
    expect(existsSync(swPath)).toBe(true);
    const content = readFileSync(swPath, 'utf8');

    expect(content).toMatch(/url\.pathname\.startsWith\(['"]\/api\/['"]\)/);
    expect(content).toMatch(/url\.pathname\.startsWith\(['"]\/internal\/['"]\)/);
  });

  it('sw.js respects Cache-Control private and no-store headers', () => {
    const swPath = join(WEB_PUBLIC, 'sw.js');
    const content = readFileSync(swPath, 'utf8');

    expect(content).toMatch(/no-store/i);
    expect(content).toMatch(/private/i);
    expect(content).toMatch(/no-cache/i);
  });

  it('sw.js uses versioned cache and evicts old caches on activate', () => {
    const swPath = join(WEB_PUBLIC, 'sw.js');
    const content = readFileSync(swPath, 'utf8');

    expect(content).toMatch(/const\s+CACHE_NAME\s*=\s*['"]twinmos-v/);
    expect(content).toMatch(/caches\.delete/);
    expect(content).toMatch(/caches\.keys/);
  });
});

describe('R0.5 · Catalogue Stop-Gap (catalog-data.js & layout-init.js)', () => {
  it('layout-init.js loads consent.js and catalog-data.js before app.js', () => {
    const layoutInitPath = join(WEB_PUBLIC, 'assets', 'js', 'layout-init.js');
    const content = readFileSync(layoutInitPath, 'utf8');

    const consentIdx = content.indexOf('assets/js/consent.js');
    const catalogIdx = content.indexOf('assets/js/catalog-data.js');
    const appIdx = content.indexOf('assets/js/app.js');

    expect(consentIdx).toBeGreaterThan(-1);
    expect(catalogIdx).toBeGreaterThan(-1);
    expect(appIdx).toBeGreaterThan(-1);
    expect(consentIdx).toBeLessThan(appIdx);
    expect(catalogIdx).toBeLessThan(appIdx);
  });

  it('catalog-data.js defines window.TM with required datasets', () => {
    const catalogDataPath = join(WEB_PUBLIC, 'assets', 'js', 'catalog-data.js');
    expect(existsSync(catalogDataPath)).toBe(true);
    const content = readFileSync(catalogDataPath, 'utf8');

    expect(content).toContain('window.TM =');
    expect(content).toContain('"products"');
    expect(content).toContain('"categories"');
    expect(content).toContain('"articles"');
    expect(content).toContain('"compat"');
    expect(content).toContain('"glossary"');
  });

  it('app.js does not contain prototype locale toasts or demo compat database wording', () => {
    const appJsPath = join(WEB_PUBLIC, 'assets', 'js', 'app.js');
    const content = readFileSync(appJsPath, 'utf8');

    expect(content).not.toContain('in this prototype');
    expect(content).not.toContain('Demo compatibility database for the prototype');
    expect(content).not.toContain('full localization ships with the production i18n pipeline');
  });
});
