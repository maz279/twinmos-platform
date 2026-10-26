import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const CODEBASE_ROOT = resolve(process.cwd(), '../..');
const A11Y_OVERRIDES_CSS = resolve(CODEBASE_ROOT, 'apps', 'web', 'public', 'assets', 'css', 'a11y-overrides.css');
const A11Y_JS = resolve(CODEBASE_ROOT, 'apps', 'web', 'public', 'assets', 'js', 'a11y.js');
const FORMS_JS = resolve(CODEBASE_ROOT, 'apps', 'web', 'public', 'assets', 'js', 'forms.js');
const CONSENT_JS = resolve(CODEBASE_ROOT, 'apps', 'web', 'public', 'assets', 'js', 'consent.js');
const HEADER_ASTRO = resolve(CODEBASE_ROOT, 'apps', 'web', 'src', 'components', 'chrome', 'Header.astro');
const FOOTER_ASTRO = resolve(CODEBASE_ROOT, 'apps', 'web', 'src', 'components', 'chrome', 'Footer.astro');
const LAYOUT_ASTRO = resolve(CODEBASE_ROOT, 'apps', 'web', 'src', 'layouts', 'Layout.astro');

describe('MS6.6 · Public Accessibility and Compliance Verification (Gate AXE-E & CONSENT-01)', () => {
  describe('T6.6.1 · WCAG 2.2 AA Rebuilt Site Accessibility Hardening', () => {
    it('a11y-overrides.css enforces scroll-padding to prevent sticky header and cookie banner focus obscuration (WCAG 2.4.11)', () => {
      expect(existsSync(A11Y_OVERRIDES_CSS)).toBe(true);
      const css = readFileSync(A11Y_OVERRIDES_CSS, 'utf8');
      expect(css).toContain('scroll-padding-top: 80px');
      expect(css).toContain('scroll-padding-bottom: 96px');
    });

    it('a11y-overrides.css enforces high-contrast focus rings and skip-link focus reveal (WCAG 2.4.7)', () => {
      const css = readFileSync(A11Y_OVERRIDES_CSS, 'utf8');
      expect(css).toContain(':focus-visible');
      expect(css).toContain('outline: 2px solid #00a3e0');
      expect(css).toContain('.skip-link:focus');
    });

    it('a11y-overrides.css enforces minimum 24x24px target size bounding box (WCAG 2.5.8)', () => {
      const css = readFileSync(A11Y_OVERRIDES_CSS, 'utf8');
      expect(css).toContain('min-width: 24px');
      expect(css).toContain('min-height: 24px');
    });

    it('a11y.js implements comprehensive arrow-key tab and accordion navigation', () => {
      expect(existsSync(A11Y_JS)).toBe(true);
      const js = readFileSync(A11Y_JS, 'utf8');
      expect(js).toContain('initKeyboardA11y');
      expect(js).toContain('ArrowRight');
      expect(js).toContain('ArrowLeft');
      expect(js).toContain('ArrowDown');
      expect(js).toContain('ArrowUp');
      expect(js).toContain('Home');
      expect(js).toContain('End');
    });

    it('Header.astro and a11y.js ensure accessible names for brand logos', () => {
      const js = readFileSync(A11Y_JS, 'utf8');
      expect(js).toContain("' Home'");
      const header = readFileSync(HEADER_ASTRO, 'utf8');
      expect(header).toContain('TwinMOS Technologies');
    });

    it('forms.js manages aria-invalid, error description binding, and privacy notices', () => {
      expect(existsSync(FORMS_JS)).toBe(true);
      const js = readFileSync(FORMS_JS, 'utf8');
      expect(js).toContain('aria-invalid');
      expect(js).toContain('aria-describedby');
      expect(js).toContain('ensurePrivacyNotice');
      expect(js).toContain('/legal?tab=privacy');
    });
  });

  describe('T6.6.3 · Compliance Verification (CONSENT-01)', () => {
    it('consent.js stores consent and syncs decision with privacy operations API', () => {
      expect(existsSync(CONSENT_JS)).toBe(true);
      const js = readFileSync(CONSENT_JS, 'utf8');
      expect(js).toContain('STORAGE_KEY = \'twinmos_consent\'');
      expect(js).toContain('sendServerRecord');
      expect(js).toContain('/api/v1/consent');
    });

    it('Footer.astro provides persistent Cookie Preferences trigger button', () => {
      const footer = readFileSync(FOOTER_ASTRO, 'utf8');
      expect(footer).toContain('Cookie Preferences');
      expect(footer).toContain('cookiePreferencesBtn');
    });

    it('Layout.astro includes standard accessibility stylesheets and metadata', () => {
      const layout = readFileSync(LAYOUT_ASTRO, 'utf8');
      expect(layout).toContain('a11y-overrides.css');
    });
  });
});
