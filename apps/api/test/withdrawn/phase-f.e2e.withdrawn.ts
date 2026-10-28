import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-phase-f-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.NODE_ENV = 'test';
process.env.AUDIT_RETENTION_DISABLED = '1';
process.env.BETTER_AUTH_SECRET = 'test-secret-twinmos-phase-f-12345';

const { createDb, user }: any = await import('@twinmos/db');
const { migrate } = await import('drizzle-orm/pglite/migrator');
const { buildApp } = await import('../src/app.ts');
const { alertManager } = await import('../src/services/alerts.ts');
const { runSecretRotationDrill } = await import('../../../tooling/demo/rotate-secrets.mjs');
const { eq } = await import('drizzle-orm');

const db = createDb();
await db.$client.exec('CREATE SCHEMA IF NOT EXISTS drizzle');
await migrate(db, { migrationsFolder: '../../packages/db/migrations' });
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
  adminCookie = await makeSession('admin-f@twinmos.dev', 'P7-Admin-2026!', 'super_admin');
});

afterAll(() => {
  try {
    rmSync(TMP, { recursive: true, force: true });
  } catch { /* cleanup */ }
});

describe('Phase F Operations & Launch (VC-F / S5–S11)', () => {
  describe('F2 / OBS-01: Observability, Metrics & Alerting Engine', () => {
    it('truthful /health returns 200 with db connected status', async () => {
      const res = await app.request('/api/v1/health');
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.status).toBe('ok');
      expect(json.db).toBe('connected');
    });

    it('deep health probe /health/deep returns component diagnostics & latency', async () => {
      const res = await app.request('/api/v1/health/deep', { headers: { cookie: adminCookie } });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.status).toBe('ok');
      expect(json.components).toBeDefined();
      expect(json.components.database.status).toBe('connected');
      expect(json.components.outbox.status).toBe('healthy');
      expect(json.components.alerts).toBeDefined();
      expect(res.headers.get('x-request-id')).toBeTruthy();
    });

    it('records 5xx rate alerts and p95 latency spike alerts in telemetry', async () => {
      alertManager.clear();
      for (let i = 0; i < 5; i++) {
        alertManager.recordRequest(500, 30);
      }
      alertManager.recordRequest(200, 1500);

      const alerts = alertManager.getAlerts();
      expect(alerts.some((a) => a.ruleId === 'http.5xx_rate_exceeded')).toBe(true);
      expect(alerts.some((a) => a.ruleId === 'http.latency_p95_exceeded')).toBe(true);
    });

    it('records form notification email delivery failure alert (V-09 resolution)', async () => {
      const alert = alertManager.recordMailFailure('contact', 'CT-TEST-01', new Error('SMTP timeout'));
      expect(alert.ruleId).toBe('mail.form_notification_failed');
      expect(alert.severity).toBe('high');
      expect(alert.meta?.refCode).toBe('CT-TEST-01');
    });

    it('admin alerts endpoints return telemetry and permit alert resolution', async () => {
      const res = await app.request('/api/v1/admin/alerts', {
        headers: { cookie: adminCookie },
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(Array.isArray(json.alerts)).toBe(true);
      expect(json.summary).toBeDefined();

      if (json.alerts.length > 0) {
        const alertId = json.alerts[0].id;
        const resolveRes = await app.request(`/api/v1/admin/alerts/${alertId}/resolve`, {
          method: 'POST',
          headers: { cookie: adminCookie },
        });
        expect(resolveRes.status).toBe(200);
        const resolveJson = await resolveRes.json();
        expect(resolveJson.resolved).toBe(true);
      }
    });
  });

  describe('F3 / HARD-01: Zero-Downtime Secret Rotation', () => {
    it('demonstrates dual-key rotation without session disruption', async () => {
      const drillResult = await runSecretRotationDrill();
      expect(drillResult.passed).toBe(true);
      expect(drillResult.newSecretFingerprint).toBeDefined();
      expect(drillResult.oldSecretFingerprint).toBeDefined();
    });
  });

  describe('F4 / LOAD-01: Concurrent Health & Latency Validation', () => {
    it('handles 50 concurrent health and deep health requests cleanly', async () => {
      const promises = Array.from({ length: 50 }, (_, i) =>
        i % 2 === 0 ? app.request('/api/v1/health') : app.request('/api/v1/health/deep', { headers: { cookie: adminCookie } })
      );
      const responses = await Promise.all(promises);
      for (const res of responses) {
        expect(res.status).toBe(200);
      }
    });
  });
});
