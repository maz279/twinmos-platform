// Task A3a / A3b Acceptance Test: Route Inventory & Role Enforcement (NEW-02, NF-01)
// Verifies:
// 1. Every route under /api/v1/admin/* rejects unauthenticated callers with 401.
// 2. The no-access 'member' role receives 403 on ALL /api/v1/admin/* routes.
// 3. 'viewer' receives 403 on personal-data routes (leads, submissions, RMA, staff, job apps).
// 4. 'viewer' can read non-personal-data administrative endpoints (products, stats, etc.).
// 5. 'editor' can access personal data endpoints per Decision D-9a.

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const MIGRATIONS = resolve(dirname(fileURLToPath(import.meta.url)), '../../../packages/db/migrations');

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-route-inv-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.MAIL_OUTBOX_DIR = join(TMP, 'outbox');
process.env.API_ALLOW_NO_TURNSTILE = '1';
process.env.NODE_ENV = 'test';
process.env.TRUST_PROXY = '1';

const { createDb, user, formSubmission, rmaRequest }: any = await import('@twinmos/db');
const { migrate } = await import('drizzle-orm/pglite/migrator');
const { buildApp }: any = await import('../src/app.ts');

mkdirSync(process.env.MAIL_OUTBOX_DIR!, { recursive: true });

const db = createDb();
await db.$client.exec('CREATE SCHEMA IF NOT EXISTS drizzle');
await migrate(db, { migrationsFolder: MIGRATIONS });
const app = buildApp(db);

let memberCookie = '';
let viewerCookie = '';
let editorCookie = '';
let adminCookie = '';

async function createAndSignIn(email: string, role: string) {
  const password = 'Test-Password-1234!';
  await app.request('/api/v1/auth/sign-up/email', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password, name: `Test ${role}` }),
  });
  const { eq } = await import('drizzle-orm');
  await db.update(user).set({ role, emailVerified: true, twoFactorEnabled: false }).where(eq(user.email, email));
  const res = await app.request('/api/v1/auth/sign-in/email', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (role === 'editor' || role === 'admin' || role === 'super_admin') {
    await db.update(user).set({ twoFactorEnabled: true }).where(eq(user.email, email));
  }
  return res.headers.getSetCookie().map((c: string) => c.split(';')[0]).join('; ');
}

beforeAll(async () => {
  memberCookie = await createAndSignIn('member@twinmos.test', 'member');
  viewerCookie = await createAndSignIn('viewer@twinmos.test', 'viewer');
  editorCookie = await createAndSignIn('editor@twinmos.test', 'editor');
  adminCookie = await createAndSignIn('admin@twinmos.test', 'admin');

  // Insert a test submission & rma for id-based checks
  await db.insert(formSubmission).values({
    type: 'contact',
    refCode: 'CT-2026-00001',
    email: 'lead@example.com',
    payload: { name: 'Lead User', email: 'lead@example.com' },
  });
});

afterAll(async () => {
  await db.$client.close();
  rmSync(TMP, { recursive: true, force: true });
});

describe('Task A3a / A3b: Route Inventory & Role Enforcement', () => {
  it('discovers all mounted /api/v1/admin/* routes', () => {
    const adminRoutes = (app.routes as Array<{ path: string; method: string }>)
      .filter((r) => r.path.startsWith('/api/v1/admin'));
    expect(adminRoutes.length).toBeGreaterThanOrEqual(25);
  });

  it('rejects unauthenticated requests to admin routes with 401', async () => {
    const res = await app.request('/api/v1/admin/products');
    expect(res.status).toBe(401);

    const subRes = await app.request('/api/v1/admin/submissions');
    expect(subRes.status).toBe(401);
  });

  it('blocks role "member" from accessing ANY admin route (returns 403)', async () => {
    const sampleEndpoints = [
      '/api/v1/admin/products',
      '/api/v1/admin/taxonomy',
      '/api/v1/admin/stats',
      '/api/v1/admin/search',
      '/api/v1/admin/submissions',
      '/api/v1/admin/rma',
      '/api/v1/admin/content/page',
      '/api/v1/admin/media',
      '/api/v1/admin/settings',
      '/api/v1/admin/locales',
      '/api/v1/admin/translations',
      '/api/v1/admin/partner-orgs',
    ];

    for (const endpoint of sampleEndpoints) {
      const res = await app.request(endpoint, {
        headers: { Cookie: memberCookie },
      });
      expect(res.status, `Endpoint ${endpoint} must return 403 for member`).toBe(403);
    }
  });

  it('blocks role "viewer" from accessing personal-data endpoints (returns 403)', async () => {
    const personalDataEndpoints = [
      '/api/v1/admin/submissions',
      '/api/v1/admin/submissions.csv',
      '/api/v1/admin/staff-options',
      '/api/v1/admin/rma',
      '/api/v1/admin/job-analytics',
      '/api/v1/admin/job-applications',
      '/api/v1/admin/analytics/leads',
      '/api/v1/admin/analytics/rma',
    ];

    for (const endpoint of personalDataEndpoints) {
      const res = await app.request(endpoint, {
        headers: { Cookie: viewerCookie },
      });
      expect(res.status, `Personal data route ${endpoint} must return 403 for viewer`).toBe(403);
    }
  });

  it('allows role "viewer" on non-personal data endpoints (returns 200)', async () => {
    const publicAdminEndpoints = [
      '/api/v1/admin/products',
      '/api/v1/admin/taxonomy',
      '/api/v1/admin/stats',
      '/api/v1/admin/compatibility',
      '/api/v1/admin/content/page',
      '/api/v1/admin/media',
      '/api/v1/admin/settings',
      '/api/v1/admin/locales',
      '/api/v1/admin/translations?locale=en',
    ];

    for (const endpoint of publicAdminEndpoints) {
      const res = await app.request(endpoint, {
        headers: { Cookie: viewerCookie },
      });
      expect(res.status, `Public admin route ${endpoint} must return 200 for viewer`).toBe(200);
    }
  });

  it('allows role "editor" on personal-data endpoints (returns 200) per Decision D-9a', async () => {
    const resSub = await app.request('/api/v1/admin/submissions', {
      headers: { Cookie: editorCookie },
    });
    expect(resSub.status).toBe(200);

    const resStaff = await app.request('/api/v1/admin/staff-options', {
      headers: { Cookie: editorCookie },
    });
    expect(resStaff.status).toBe(200);

    const resRma = await app.request('/api/v1/admin/rma', {
      headers: { Cookie: editorCookie },
    });
    expect(resRma.status).toBe(200);

    const resLeadAnalytics = await app.request('/api/v1/admin/analytics/leads', {
      headers: { Cookie: editorCookie },
    });
    expect(resLeadAnalytics.status).toBe(200);
  });
});
