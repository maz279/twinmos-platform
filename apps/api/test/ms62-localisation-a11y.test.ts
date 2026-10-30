// MS6.2 automated verification suite — Localisation, RTL, hreflang reciprocity,
// and Admin accessibility checks (T6.2.1, T6.2.2, T6.2.3, T6.2.5).
import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const WEB_ORIGIN = process.env.TEST_WEB_ORIGIN || 'http://localhost:4321';
// T6.2.1–T6.2.3 probe a RUNNING web server. The unit run has none, so these
// suites run only when TEST_WEB_ORIGIN names one (they used to fail with
// ECONNREFUSED in every clean-clone run). Against the lab on 2026-10-28 they
// fail for real: the eight locales are not translated or activated (ZT-044).
const liveDescribe = process.env.TEST_WEB_ORIGIN ? describe : describe.skip;
const ROOT_DIR = resolve(import.meta.dirname, '../../..');

liveDescribe('MS6.2 · T6.2.1: Real locale pages (no placeholder)', () => {
  const locales = ['ar', 'hi', 'ru', 'zh-cn', 'fr', 'es', 'pt', 'de'];

  for (const loc of locales) {
    it(`locale /${loc} renders real content with header, nav, footer and no placeholder`, async () => {
      const res = await fetch(`${WEB_ORIGIN}/${loc}`);
      expect(res.status).toBe(200);
      const html = await res.text();

      // Must NOT contain the old placeholder string
      expect(html).not.toContain('This page is being localized');
      expect(html).not.toContain('Check back soon for content');

      // Must contain header, navigation and footer
      expect(html).toMatch(/<header[^>]*>/i);
      expect(html).toMatch(/<nav[^>]*>/i);
      expect(html).toMatch(/<footer[^>]*>/i);

      // Must have the correct lang attribute
      expect(html).toMatch(new RegExp(`<html[^>]*lang=["']${loc}["']`, 'i'));
    });
  }
});

liveDescribe('MS6.2 · T6.2.2: Right-to-left isolation & i18n runtime', () => {
  it('English root page has no explicit dir (LTR default) and does NOT link rtl.css', async () => {
    const res = await fetch(`${WEB_ORIGIN}/`);
    expect(res.status).toBe(200);
    const html = await res.text();
    // Parity contract (P4 p4-i18n): dir is emitted ONLY for RTL — an explicit
    // dir="ltr" shifted Chrome's text rasterization.
    expect(html).not.toMatch(/<html[^>]*\sdir=/i);
    expect(html).toContain('lang="en"');
    expect(html).not.toContain('/assets/css/rtl.css');
  });

  it('Arabic /ar page has dir="rtl" and links rtl.css', async () => {
    const res = await fetch(`${WEB_ORIGIN}/ar`);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toMatch(/<html[^>]*dir=["']rtl["']/i);
    expect(html).toContain('/assets/css/rtl.css');
  });

  it('French /fr page has no explicit dir (LTR default) and does NOT link rtl.css', async () => {
    const res = await fetch(`${WEB_ORIGIN}/fr`);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).not.toMatch(/<html[^>]*\sdir=/i);
    expect(html).toContain('lang="fr"');
    expect(html).not.toContain('/assets/css/rtl.css');
  });

  it('i18n.js sets twinmos_locale cookie and provides Intl formatters', () => {
    const i18nJsPath = resolve(ROOT_DIR, 'apps/web/public/assets/js/i18n.js');
    expect(existsSync(i18nJsPath)).toBe(true);
    const content = readFileSync(i18nJsPath, 'utf8');

    // Cookie persistence
    expect(content).toContain('twinmos_locale=');

    // Strict RTL isolation (only for /ar)
    expect(content).toContain("RTL = ['ar']");
    expect(content).toContain("RTL.indexOf(pathLocale) !== -1");

    // Intl formatting functions
    expect(content).toContain('formatDate');
    expect(content).toContain('formatNumber');
    expect(content).toContain('Intl.DateTimeFormat');
    expect(content).toContain('Intl.NumberFormat');
  });
});

liveDescribe('MS6.2 · T6.2.3: Reciprocal hreflang validator & sitemaps', () => {
  const allLocales = ['en', 'ar', 'hi', 'ru', 'zh-cn', 'fr', 'es', 'pt', 'de'];

  function extractHreflangLinks(html: string): Map<string, string> {
    const links = new Map<string, string>();
    const regex = /<link\s+[^>]*rel=["']alternate["'][^>]*>/gi;
    let match;
    while ((match = regex.exec(html)) !== null) {
      const tag = match[0];
      const hreflangMatch = tag.match(/hreflang=["']([^"']+)["']/i);
      const hrefMatch = tag.match(/href=["']([^"']+)["']/i);
      if (hreflangMatch && hrefMatch) {
        links.set(hreflangMatch[1], hrefMatch[1]);
      }
    }
    return links;
  }

  it('English root / has reciprocal hreflang set with x-default and valid zh-CN', async () => {
    const res = await fetch(`${WEB_ORIGIN}/`);
    const html = await res.text();
    const links = extractHreflangLinks(html);

    expect(links.has('x-default')).toBe(true);
    expect(links.has('en')).toBe(true);
    expect(links.has('ar')).toBe(true);
    expect(links.has('zh-CN')).toBe(true); // Must be valid BCP-47 uppercase region
    expect(links.has('fr')).toBe(true);
    expect(links.has('de')).toBe(true);
  });

  it('Arabic /ar and English / have reciprocal hreflang entries pointing to each other', async () => {
    const [enRes, arRes] = await Promise.all([
      fetch(`${WEB_ORIGIN}/`),
      fetch(`${WEB_ORIGIN}/ar`),
    ]);
    const enLinks = extractHreflangLinks(await enRes.text());
    const arLinks = extractHreflangLinks(await arRes.text());

    // Both must know about each other
    expect(enLinks.get('ar')).toBe(arLinks.get('ar'));
    expect(enLinks.get('en')).toBe(arLinks.get('en'));
    expect(enLinks.get('x-default')).toBe(arLinks.get('x-default'));
    expect(enLinks.get('zh-CN')).toBe(arLinks.get('zh-CN'));
  });

  it('sitemapindex returns sub-sitemaps for all locales', async () => {
    const res = await fetch(`${WEB_ORIGIN}/sitemap.xml`);
    expect(res.status).toBe(200);
    const xml = await res.text();
    expect(xml).toContain('<sitemapindex');
    for (const loc of allLocales) {
      expect(xml).toContain(`locale=${loc}`);
    }
  });
});

describe('MS6.2 · T6.2.5: Admin accessibility and keyboard alternatives', () => {
  it('PageBuilder provides programmatic labels on field controls', () => {
    const pbPath = resolve(ROOT_DIR, 'apps/admin/src/modules/page-builder/PageBuilder.tsx');
    const content = readFileSync(pbPath, 'utf8');

    // Must have htmlFor and id binding
    expect(content).toContain('htmlFor={inputId}');
    expect(content).toContain('id={inputId}');
    expect(content).toContain('aria-label={field.label}');
  });

  it('PageBuilder and Menu Editor provide keyboard alternatives to dragging', () => {
    const pbPath = resolve(ROOT_DIR, 'apps/admin/src/modules/page-builder/PageBuilder.tsx');
    const pbContent = readFileSync(pbPath, 'utf8');
    expect(pbContent).toContain('ariaLabel={`Move ${def?.label ?? block.type} block up`}');
    expect(pbContent).toContain('ariaLabel={`Move ${def?.label ?? block.type} block down`}');

    const menuPath = resolve(ROOT_DIR, 'apps/admin/src/modules/menu-editor.tsx');
    const menuContent = readFileSync(menuPath, 'utf8');
    expect(menuContent).toContain('aria-label={`Move ${draft.title} up`}');
    expect(menuContent).toContain('aria-label={`Move ${draft.title} down`}');
  });

  it('Admin dialogs utilize useDialogA11y with focus trap and aria-modal="true"', () => {
    const dialogA11yPath = resolve(ROOT_DIR, 'apps/admin/src/dialog-a11y.ts');
    expect(existsSync(dialogA11yPath)).toBe(true);
    const hookContent = readFileSync(dialogA11yPath, 'utf8');
    expect(hookContent).toContain("e.key === 'Tab'");
    expect(hookContent).toContain('onClose');

    // Dialog components
    const searchContent = readFileSync(resolve(ROOT_DIR, 'apps/admin/src/search.tsx'), 'utf8');
    expect(searchContent).toContain('role="dialog"');
    expect(searchContent).toContain('aria-modal="true"');
    expect(searchContent).toContain('ref={dialogRef}');

    const mediaContent = readFileSync(resolve(ROOT_DIR, 'apps/admin/src/media-picker.tsx'), 'utf8');
    expect(mediaContent).toContain('role="dialog"');
    expect(mediaContent).toContain('aria-modal="true"');
    expect(mediaContent).toContain('ref={dialogRef}');

    const previewContent = readFileSync(resolve(ROOT_DIR, 'apps/admin/src/modules/page-builder/preview.tsx'), 'utf8');
    expect(previewContent).toContain('role="dialog"');
    expect(previewContent).toContain('aria-modal="true"');
    expect(previewContent).toContain('ref={dialogRef}');
  });

  it('Admin authentication forms have programmatic labels and allow paste', () => {
    const loginContent = readFileSync(resolve(ROOT_DIR, 'apps/admin/src/login.tsx'), 'utf8');
    expect(loginContent).toContain('htmlFor="login-email"');
    expect(loginContent).toContain('id="login-email"');
    expect(loginContent).toContain('htmlFor="login-password"');
    expect(loginContent).toContain('id="login-password"');
    expect(loginContent).not.toContain('onPaste'); // Native paste is completely unblocked (WCAG 3.3.8)
  });
});
