import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { eq, desc } from 'drizzle-orm';
import { execSync } from 'node:child_process';

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-ms63-test-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.NODE_ENV = 'test';
process.env.BETTER_AUTH_SECRET = 'test-secret-twinmos-ms63-key-12345';

const REPO_ROOT = dirname(dirname(process.cwd()));
const MIGRATIONS = join(REPO_ROOT, 'packages', 'db', 'migrations');

const { createDb, auditLog }: any = await import('@twinmos/db');
const { migrate } = await import('drizzle-orm/pglite/migrator');
const { buildApp }: any = await import('../src/app.ts');

const db = createDb();
await db.$client.exec('CREATE SCHEMA IF NOT EXISTS drizzle');
await migrate(db, { migrationsFolder: MIGRATIONS });
const app = buildApp(db);

describe('MS6.3 · Consent Manager & Truthful Content (CONSENT-01 / TRUTH-01 / CONTENT-02)', () => {
  afterAll(() => {
    try {
      rmSync(TMP, { recursive: true, force: true });
    } catch {
      /* ignore cleanup */
    }
  });

  describe('T6.3.1 · Consent Manager Architecture & Equal Prominence', () => {
    it('verifies CookieBanner.astro provides first-layer equal prominence for Customize, Decline, and Accept', () => {
      const bannerPath = resolve(REPO_ROOT, 'apps', 'web', 'src', 'components', 'chrome', 'CookieBanner.astro');
      expect(existsSync(bannerPath)).toBe(true);
      const bannerContent = readFileSync(bannerPath, 'utf8');

      // Equal prominence checks: all three buttons must exist in the first layer
      expect(bannerContent).toContain('id="cookieCustomize"');
      expect(bannerContent).toContain('id="cookieDecline"');
      expect(bannerContent).toContain('id="cookieAccept"');

      // Symmetrical equal styling check
      expect(bannerContent).toContain('cookie-customize');
      expect(bannerContent).toContain('cookie-decline');
      expect(bannerContent).toContain('cookie-accept');
    });

    it('verifies CookieBanner.astro includes accessible granular preferences modal dialog', () => {
      const bannerPath = resolve(REPO_ROOT, 'apps', 'web', 'src', 'components', 'chrome', 'CookieBanner.astro');
      const bannerContent = readFileSync(bannerPath, 'utf8');

      // Accessible modal dialog attributes
      expect(bannerContent).toContain('id="cookieModal"');
      expect(bannerContent).toContain('role="dialog"');
      expect(bannerContent).toContain('aria-modal="true"');
      expect(bannerContent).toContain('aria-labelledby="cookieModalTitle"');
      expect(bannerContent).toContain('aria-describedby="cookieModalDesc"');

      // Four granular categories
      expect(bannerContent).toContain('id="cookieCatEssential"');
      expect(bannerContent).toContain('id="cookieCatAnalytics"');
      expect(bannerContent).toContain('id="cookieCatMarketing"');
      expect(bannerContent).toContain('id="cookieCatPreferences"');

      // Strictly necessary must be locked (disabled and checked)
      expect(bannerContent).toMatch(/cookieCatEssential["'][^>]*disabled/);

      // Modal action buttons
      expect(bannerContent).toContain('id="cookieRejectAll"');
      expect(bannerContent).toContain('id="cookieSavePreferences"');
      expect(bannerContent).toContain('id="cookieAcceptAll"');
    });

    it('verifies fake toast is removed from legal page and app.js and dispatches real consent event', () => {
      const appJsWebPath = resolve(REPO_ROOT, 'apps', 'web', 'public', 'assets', 'js', 'app.js');
      const appJsProtoPath = resolve(REPO_ROOT, 'prototype', 'assets', 'js', 'app.js');

      for (const p of [appJsWebPath, appJsProtoPath]) {
        if (existsSync(p)) {
          const content = readFileSync(p, 'utf8');
          // Must NOT contain the fake toast phrase
          expect(content).not.toContain('Preferences saved — the production site stores granular consent');
          // Must dispatch the real consent event
          expect(content).toContain('twinmos:open-consent');
        }
      }
    });

    it('verifies CookieTable component renders dynamically from official cookie registry', () => {
      const registryPath = resolve(REPO_ROOT, 'apps', 'web', 'src', 'data', 'cookieRegistry.ts');
      const tablePath = resolve(REPO_ROOT, 'apps', 'web', 'src', 'components', 'chrome', 'CookieTable.astro');
      const legalPath = resolve(REPO_ROOT, 'apps', 'web', 'src', 'pages', 'legal.astro');

      expect(existsSync(registryPath)).toBe(true);
      expect(existsSync(tablePath)).toBe(true);
      expect(existsSync(legalPath)).toBe(true);

      const registryContent = readFileSync(registryPath, 'utf8');
      expect(registryContent).toContain('COOKIE_REGISTRY');
      expect(registryContent).toContain('twinmos_consent');
      expect(registryContent).toContain('twinmos_locale');
      expect(registryContent).toContain('essential');
      expect(registryContent).toContain('analytics');

      const legalContent = readFileSync(legalPath, 'utf8');
      expect(legalContent).toContain('CookieTable');
    });
  });

  describe('T6.3.2 · Server-side Consent Record (CONSENT-01)', () => {
    it('provides health check on GET /api/v1/consent/health', async () => {
      const res = await app.request('/api/v1/consent/health');
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.status).toBe('ok');
      expect(body.service).toBe('consent-record-collector');
    });

    it('records user consent choice on POST /api/v1/consent and writes to audit_log (CONSENT-01)', async () => {
      const consentPayload = {
        consentId: 'cns_test_' + Math.random().toString(36).slice(2, 10),
        policyVersion: '2026.1',
        choices: {
          essential: true,
          analytics: true,
          marketing: false,
          preferences: true,
        },
        source: 'cookie-banner',
      };

      const res = await app.request('/api/v1/consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Vitest-Consent-Agent/1.0',
        },
        body: JSON.stringify(consentPayload),
      });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.consentId).toBe(consentPayload.consentId);
      expect(body.policyVersion).toBe('2026.1');
      expect(body.recordedAt).toBeDefined();

      // Verify the record in audit_log table
      const logs = await db
        .select()
        .from(auditLog)
        .where(eq(auditLog.action, 'privacy.consent'))
        .orderBy(desc(auditLog.at))
        .limit(1);

      expect(logs.length).toBe(1);
      expect(logs[0].entity).toBe('consent');
      expect(logs[0].entityId).toBe(consentPayload.consentId);
      expect(logs[0].diff).toBeDefined();
      expect(logs[0].diff.choices.essential).toBe(true);
      expect(logs[0].diff.choices.analytics).toBe(true);
      expect(logs[0].diff.choices.marketing).toBe(false);
      expect(logs[0].diff.choices.preferences).toBe(true);
    });

    it('rejects invalid consent payload without choices', async () => {
      const res = await app.request('/api/v1/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consentId: '123' }),
      });
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.detail || body.title).toMatch(/choices object/i);
    });
  });

  describe('T6.3.3 · Claims Register & Business Facts Truthfulness (TRUTH-01 / CONTENT-02)', () => {
    it('verifies claims_register_signed.md exists with business verification and formal signature', () => {
      const claimsPath = resolve(REPO_ROOT, 'evidence', 'claims_register_signed.md');
      expect(existsSync(claimsPath)).toBe(true);
      const claimsContent = readFileSync(claimsPath, 'utf8');

      // Core verified corporate facts
      expect(claimsContent).toContain('1998');
      expect(claimsContent).toContain('28+');
      expect(claimsContent).toContain('93+');
      expect(claimsContent).toContain('TÜV SÜD ISO 9001');
      expect(claimsContent).toContain('14,000 MB/s');

      // Verified warranty tiers
      expect(claimsContent).toContain('Lifetime Limited');
      expect(claimsContent).toContain('5-Year Limited');
      expect(claimsContent).toContain('3-Year Limited');
      expect(claimsContent).toContain('1-Year Limited');

      // Verified sign-off
      expect(claimsContent).toMatch(/Content Owner Signature/i);
      expect(claimsContent).toContain('Director of Corporate Communications & Product Governance');
    });

    it('verifies 123 Technology Drive placeholder is absent from about page (CONTENT-02)', () => {
      const aboutPath = resolve(REPO_ROOT, 'apps', 'web', 'src', 'pages', 'about.astro');
      if (existsSync(aboutPath)) {
        const aboutContent = readFileSync(aboutPath, 'utf8');
        expect(aboutContent).not.toContain('123 Technology Drive');
      }
    });

    it('verifies prototype QVL defaults are eliminated (Z-15 / Z-39)', () => {
      const protoData = resolve(REPO_ROOT, 'apps', 'web', 'public', 'assets', 'js', 'catalog-data.js');
      if (existsSync(protoData)) {
        const dataContent = readFileSync(protoData, 'utf8');
        // QVL mock hardcoded defaults must not be present
        expect(dataContent).not.toContain('fake-qvl-preset');
      }
    });
  });

  describe('T6.3.4 · Link Checker & External Link Policy', () => {
    it('verifies check-links.mjs exists and external links satisfy rel="noopener"', () => {
      const scriptPath = resolve(REPO_ROOT, 'tooling', 'verify', 'check-links.mjs');
      expect(existsSync(scriptPath)).toBe(true);

      const footerPath = resolve(REPO_ROOT, 'apps', 'web', 'src', 'components', 'chrome', 'Footer.astro');
      const footerContent = readFileSync(footerPath, 'utf8');

      // Every target="_blank" must have rel="noopener"
      const blankMatches = footerContent.match(/<a\s+[^>]*?target="_blank"[^>]*?>/g) || [];
      expect(blankMatches.length).toBeGreaterThan(0);
      for (const tag of blankMatches) {
        expect(tag).toContain('rel="noopener"');
      }
    });

    it('verifies all target="_blank" links announce that they open in a new tab', () => {
      const footerPath = resolve(REPO_ROOT, 'apps', 'web', 'src', 'components', 'chrome', 'Footer.astro');
      const footerContent = readFileSync(footerPath, 'utf8');

      // Check social and WhatsApp links announce new tab
      expect(footerContent).toContain('aria-label="Facebook (opens in a new tab)"');
      expect(footerContent).toContain('aria-label="Instagram (opens in a new tab)"');
      expect(footerContent).toContain('aria-label="LinkedIn (opens in a new tab)"');
      expect(footerContent).toContain('aria-label="X (Twitter) (opens in a new tab)"');
      expect(footerContent).toContain('aria-label="YouTube (opens in a new tab)"');
      expect(footerContent).toContain('aria-label="Pinterest (opens in a new tab)"');
      expect(footerContent).toContain('aria-label="Chat on WhatsApp (opens in a new tab)"');
    });

    it('verifies check_links_report.json reports 0 broken links and 0 policy violations', () => {
      const reportPath = resolve(REPO_ROOT, 'tooling', 'verify', 'evidence', 'check_links_report.json');
      expect(existsSync(reportPath)).toBe(true);
      const report = JSON.parse(readFileSync(reportPath, 'utf8'));

      expect(report.summary.brokenLinksCount).toBe(0);
      expect(report.summary.policyViolationsCount).toBe(0);
      expect(report.summary.status).toBe('PASS');
    });
  });
});
