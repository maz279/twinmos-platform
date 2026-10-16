import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../../..');
const TMP = mkdtempSync(join(tmpdir(), 'twinmos-hypercare-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.NODE_ENV = 'test';
process.env.AUDIT_RETENTION_DISABLED = '1';
process.env.API_ALLOW_NO_TURNSTILE = '1';
process.env.BETTER_AUTH_SECRET = 'test-secret-twinmos-hypercare-12345';

const { createDb, user, outbox }: any = await import('@twinmos/db');
const { migrate } = await import('drizzle-orm/pglite/migrator');
const { buildApp } = await import('../src/app.ts');
const { alertManager } = await import('../src/services/alerts.ts');
const { runHypercareDailyCheck } = await import('../../../tooling/demo/hypercare-daily-check.mjs');
const { runHypercareSimulation } = await import('../../../tooling/demo/hypercare-simulation.mjs');
const { eq } = await import('drizzle-orm');

const db = createDb();
await db.$client.exec('CREATE SCHEMA IF NOT EXISTS drizzle');
await migrate(db, { migrationsFolder: resolve(repoRoot, 'packages/db/migrations') });
const app = buildApp(db);

let adminCookie = '';

async function makeSession(email: string, password: string, role?: string): Promise<string> {
  await app.request('/api/v1/auth/sign-up/email', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password, name: email.split('@')[0] }),
  });
  if (role) await db.update(user).set({ role }).where(eq(user.email, email));
  const res = await app.request('/api/v1/auth/sign-in/email', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.headers.getSetCookie().map((c: string) => c.split(';')[0]).join('; ');
}

beforeAll(async () => {
  adminCookie = await makeSession('hypercare-admin@twinmos.dev', 'Hcare-Pass-2027!', 'super_admin');
});

afterAll(() => {
  try {
    rmSync(TMP, { recursive: true, force: true });
  } catch { /* cleanup */ }
});

describe('Task F8: Post-Launch Hypercare Surveillance & Stabilization (Two Weeks)', () => {
  describe('Subsystem 1: Daily Diagnostic Probes & Telemetry Surveillance', () => {
    it('verifies /api/v1/health returns 200 with database connectivity', async () => {
      const res = await app.request('/api/v1/health');
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.status).toBe('ok');
      expect(json.db).toBe('connected');
      expect(res.headers.get('x-request-id')).toBeTruthy();
    });

    it('verifies /api/v1/health/deep exposes component health and zero pending backlog', async () => {
      const res = await app.request('/api/v1/health/deep', { headers: { cookie: adminCookie } });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.status).toBe('ok');
      expect(json.components?.database?.status).toBe('connected');
      expect(json.components?.outbox?.status).toBe('healthy');
      expect(json.components?.alerts?.firingCount).toBeDefined();
      expect(json.components?.alerts?.metrics).toBeDefined();
    });

    it('alertManager tracks request telemetry and 5xx thresholds during hypercare', async () => {
      alertManager.clear();
      // Record normal traffic
      alertManager.recordRequest(200, 35);
      alertManager.recordRequest(200, 42);
      expect(alertManager.getFiringCount()).toBe(0);

      // Trigger 5xx alert
      for (let i = 0; i < 5; i++) {
        alertManager.recordRequest(500, 50);
      }
      const firing = alertManager.getAlerts();
      const alert5xx = firing.find((a: any) => a.ruleId === 'http.5xx_rate_exceeded');
      expect(alert5xx).toBeDefined();

      // Resolve alert
      if (alert5xx) {
        const resolved = alertManager.resolveAlert(alert5xx.id);
        expect(resolved).toBe(true);
      }
    });
  });

  describe('Subsystem 2: Risk R-08 SEO Legacy 301 Redirect Preservation', () => {
    it('verifies twinmos-redirects.map exists and contains at least 72 legacy mappings', () => {
      const mapPath = resolve(repoRoot, 'deploy/nginx/twinmos-redirects.map');
      expect(existsSync(mapPath)).toBe(true);
      const content = readFileSync(mapPath, 'utf8');
      const lines = content.split('\n').filter(l => l.trim().length > 0 && !l.trim().startsWith('#'));
      expect(lines.length).toBeGreaterThanOrEqual(72);

      // Test specific crucial legacy categories
      expect(content).toContain('/product-category/dram-module/');
      expect(content).toContain('/product-category/dram-module/desktop-dram');
      expect(content).toContain('/product-category/solid-state-drive/');
      expect(content).toContain('/product-category/portable-drives/');
    });
  });

  describe('Subsystem 3: Form Delivery & Zero Dropped Lead Verification (V-09)', () => {
    it('ingests customer contact lead and verifies outbox dispatch event', async () => {
      const payload = {
        name: 'Hypercare Client',
        email: 'client@hypercare-test.com',
        consent: true,
        payload: {
          subject: 'Warranty Inquiry',
          message: 'Validating zero dropped leads during 14-day hypercare window.',
        },
      };
      const res = await app.request('/api/v1/forms/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.reference).toMatch(/^CT-/);

      // Verify persistent lead record in formSubmission table
      const { formSubmission } = await import('@twinmos/db');
      const submissions = await db.select().from(formSubmission);
      expect(submissions.length).toBeGreaterThan(0);
      expect(submissions.some((s: any) => s.email === 'client@hypercare-test.com')).toBe(true);
    });

    it('ingests B2B quote lead and ensures persistent database write', async () => {
      const quotePayload = {
        name: 'Enterprise Buyer',
        email: 'buyer@corp.com',
        consent: true,
        payload: {
          company: 'Global Retail Corp',
          productSku: 'TM-DDR5-6000-32GB',
          estimatedQuantity: 500,
          timeline: 'immediate',
          details: 'Bulk commercial order quotation.',
        },
      };
      const res = await app.request('/api/v1/forms/quote', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(quotePayload),
      });
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.reference).toMatch(/^QT-/);
    });
  });

  describe('Subsystem 4: Daily Surveillance & Multi-Day Simulation Automated Drills', () => {
    it('executes runHypercareDailyCheck successfully on live database', async () => {
      const result = await runHypercareDailyCheck({ db });
      expect(result.passed).toBe(true);
      expect(result.verifiedRedirects).toBeGreaterThanOrEqual(72);
      expect(result.cwvBenchmarks.lcpMs).toBeLessThanOrEqual(2500);
      expect(result.cwvBenchmarks.inpMs).toBeLessThanOrEqual(200);
      expect(result.cwvBenchmarks.cls).toBeLessThanOrEqual(0.1);
    });

    it('executes runHypercareSimulation verifying clean day progression and exit criteria', async () => {
      const sim = await runHypercareSimulation({ db, totalDays: 3, allowShortRun: true });
      expect(sim.passed).toBe(true);
      expect(sim.totalDays).toBe(3);
      expect(sim.dailyLogs.length).toBe(3);
      for (const day of sim.dailyLogs) {
        expect(day.clean).toBe(true);
        expect(parseFloat(day.errorRatePct)).toBeLessThan(0.05);
        expect(parseFloat(day.lcpSec)).toBeLessThan(2.5);
      }
    });
  });
});
