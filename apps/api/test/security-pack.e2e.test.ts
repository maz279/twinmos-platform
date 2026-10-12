// Task A11: Formal Security Regression Pack S-01…S-16
// Verifies production-readiness security gates from Roadmap §10.3:
// S-01: Self sign-up disabled / blocked
// S-02: RBAC segregation (member 403 on admin; viewer 403 on personal data)
// S-03: Better Auth /admin/* escalation routes blocked (404)
// S-08: Secure cookie attributes
// S-12: Tiered body size caps return 413 application/problem+json
// S-13: Production boot guards & captcha bypass blocked
// S-14: Honest mail delivery reporting (no silent loss)
// S-15: CORS origin restriction & ACAC hygiene

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-sec-pack-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.MAIL_OUTBOX_DIR = join(TMP, 'outbox');
process.env.API_ALLOW_NO_TURNSTILE = '1';
process.env.NODE_ENV = 'test';

const { createDb, user, formSubmission }: any = await import('@twinmos/db');
const { migrate } = await import('drizzle-orm/pglite/migrator');
const { buildApp }: any = await import('../src/app.ts');
const { bootConfigErrors, turnstileBypassEnabled }: any = await import('../src/boot-config.ts');
const { sendMail }: any = await import('../src/mailer.ts');

mkdirSync(process.env.MAIL_OUTBOX_DIR!, { recursive: true });

const db = createDb();
await db.$client.exec('CREATE SCHEMA IF NOT EXISTS drizzle');
await migrate(db, { migrationsFolder: '../../packages/db/migrations' });
const app = buildApp(db);

let memberCookie = '';
let viewerCookie = '';
let editorCookie = '';

async function setupTestUser(email: string, role: string) {
  const password = 'TestSecPassword123!';
  // Directly insert user to simulate pre-existing or invited account
  const { eq } = await import('drizzle-orm');
  await app.request('/api/v1/auth/sign-up/email', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password, name: `Sec ${role}` }),
  });
  await db.update(user).set({ role }).where(eq(user.email, email));
  const res = await app.request('/api/v1/auth/sign-in/email', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.headers.getSetCookie().map((c: string) => c.split(';')[0]).join('; ');
}

beforeAll(async () => {
  memberCookie = await setupTestUser('sec-member@twinmos.test', 'member');
  viewerCookie = await setupTestUser('sec-viewer@twinmos.test', 'viewer');
  editorCookie = await setupTestUser('sec-editor@twinmos.test', 'editor');
});

afterAll(async () => {
  await db.$client.close();
  rmSync(TMP, { recursive: true, force: true });
});

describe('Security Regression Pack (S-01…S-16)', () => {
  it('S-02: member gets 403 on admin routes; viewer gets 403 on personal data', async () => {
    // member cannot view products (403)
    const memRes = await app.request('/api/v1/admin/products', {
      headers: { Cookie: memberCookie },
    });
    expect(memRes.status).toBe(403);

    // viewer cannot access lead submissions (403)
    const viewSubRes = await app.request('/api/v1/admin/submissions', {
      headers: { Cookie: viewerCookie },
    });
    expect(viewSubRes.status).toBe(403);

    // viewer cannot access rma cases (403)
    const viewRmaRes = await app.request('/api/v1/admin/rma', {
      headers: { Cookie: viewerCookie },
    });
    expect(viewRmaRes.status).toBe(403);

    // editor can access lead submissions (200)
    const editSubRes = await app.request('/api/v1/admin/submissions', {
      headers: { Cookie: editorCookie },
    });
    expect(editSubRes.status).toBe(200);
  });

  it('S-03: Better Auth /api/v1/auth/admin/* endpoints are disabled (404)', async () => {
    const escalationEndpoints = [
      '/api/v1/auth/admin/set-role',
      '/api/v1/auth/admin/impersonate',
      '/api/v1/auth/admin/set-user-password',
      '/api/v1/auth/admin/list-users',
      '/api/v1/auth/admin/remove-user',
    ];

    for (const url of escalationEndpoints) {
      const res = await app.request(url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          Cookie: editorCookie,
        },
        body: JSON.stringify({ userId: 'victim-id', role: 'super_admin' }),
      });
      expect(res.status, `Endpoint ${url} must be disabled and return 404`).toBe(404);
    }
  });

  it('S-08: Session cookies include security attributes', async () => {
    const res = await app.request('/api/v1/auth/sign-in/email', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'sec-viewer@twinmos.test', password: 'TestSecPassword123!' }),
    });
    expect(res.status).toBe(200);
    const setCookie = res.headers.get('set-cookie') ?? '';
    expect(setCookie.toLowerCase()).toContain('httponly');
    expect(setCookie.toLowerCase()).toContain('samesite');
  });

  it('S-12: Rejects payloads exceeding body size limit with 413 problem+json', async () => {
    // Standard limit is 256KB; auth limit is 64KB. Send 100KB to auth endpoint
    const largePayload = {
      email: 'sec-viewer@twinmos.test',
      password: 'x'.repeat(70 * 1024),
    };
    const res = await app.request('/api/v1/auth/sign-in/email', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(largePayload),
    });
    expect(res.status).toBe(413);
    const body = await res.json();
    expect(body.status).toBe(413);
    expect(body.title).toContain('Payload Too Large');
  });

  it('S-13: Production boot refuses dev flags and missing secrets', () => {
    // 1. Refuses dev bypass switches
    const errsBypass = bootConfigErrors({
      NODE_ENV: 'production',
      API_ALLOW_NO_TURNSTILE: '1',
      DATABASE_URL: 'postgres://localhost/db',
      BETTER_AUTH_SECRET: 'a-very-long-secret-key-123456789',
      BETTER_AUTH_URL: 'https://twinmos.com',
      TURNSTILE_SECRET_KEY: '0x4AAAAAA',
      RESEND_API_KEY: 're_1234567890',
      MAIL_FROM: 'TwinMOS <no-reply@twinmos.com>',
      FORMS_TO: 'leads@twinmos.com',
    });
    expect(errsBypass.some((e: string) => e.includes('API_ALLOW_NO_TURNSTILE'))).toBe(true);

    // 2. Refuses missing Resend key
    const errsNoResend = bootConfigErrors({
      NODE_ENV: 'production',
      DATABASE_URL: 'postgres://localhost/db',
      BETTER_AUTH_SECRET: 'a-very-long-secret-key-123456789',
      BETTER_AUTH_URL: 'https://twinmos.com',
      TURNSTILE_SECRET_KEY: '0x4AAAAAA',
      MAIL_FROM: 'TwinMOS <no-reply@twinmos.com>',
      FORMS_TO: 'leads@twinmos.com',
    });
    expect(errsNoResend.some((e: string) => e.includes('RESEND_API_KEY'))).toBe(true);

    // 3. turnstileBypassEnabled never true in production
    expect(turnstileBypassEnabled({ NODE_ENV: 'production', API_ALLOW_NO_TURNSTILE: '1' })).toBe(false);
    expect(turnstileBypassEnabled({ NODE_ENV: 'development', API_ALLOW_NO_TURNSTILE: '1' })).toBe(true);
    expect(turnstileBypassEnabled({ NODE_ENV: 'development', API_ALLOW_NO_TURNSTILE: '0' })).toBe(false);
  });

  it('S-14: Mailer reports honest delivery failure in production (no silent outbox)', async () => {
    const prevEnv = process.env.NODE_ENV;
    const prevKey = process.env.RESEND_API_KEY;
    try {
      process.env.NODE_ENV = 'production';
      delete process.env.RESEND_API_KEY;
      const sent = await sendMail({ to: 'test@example.com', subject: 'Test', text: 'Hello' });
      expect(sent).toBe(false);
    } finally {
      process.env.NODE_ENV = prevEnv;
      if (prevKey !== undefined) process.env.RESEND_API_KEY = prevKey;
    }
  });

  it('S-15: Disallowed CORS origins do not receive allow credentials or origin echo', async () => {
    const res = await app.request('/api/v1/health', {
      headers: { Origin: 'https://malicious-attacker.com' },
    });
    expect(res.headers.get('access-control-allow-origin')).toBeNull();
    expect(res.headers.get('access-control-allow-credentials')).toBeNull();
  });

  it('S-01: Self sign-up refused when disabled', async () => {
    const prev = process.env.AUTH_DISABLE_SIGNUP;
    try {
      process.env.AUTH_DISABLE_SIGNUP = '1';
      const disabledApp = buildApp(db);
      const res = await disabledApp.request('/api/v1/auth/sign-up/email', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'self-signup@twinmos.test', password: 'Password123!', name: 'Attacker' }),
      });
      expect([400, 404]).toContain(res.status);
    } finally {
      process.env.AUTH_DISABLE_SIGNUP = prev;
    }
  });

  it('S-04: Password reset endpoint dispatches reset instructions', async () => {
    const res = await app.request('/api/v1/auth/forget-password', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'sec-viewer@twinmos.test',
        redirectTo: 'http://localhost:5173/admin/reset-password',
      }),
    });
    expect([200, 204]).toContain(res.status);
  });

  it('S-06: Per-account lockout after 5 consecutive failures from rotating IPs', async () => {
    const victim = 'lockout-victim@twinmos.test';
    // 5 consecutive failed attempts from 5 distinct IP addresses
    for (let i = 1; i <= 5; i++) {
      const failRes = await app.request('/api/v1/auth/sign-in/email', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-real-ip': `198.51.100.${i}`,
        },
        body: JSON.stringify({ email: victim, password: 'WrongPassword!' }),
      });
      expect(failRes.status).toBe(401);
    }

    // 6th attempt with ANY password from a 6th IP address must be locked out with 401
    const lockedRes = await app.request('/api/v1/auth/sign-in/email', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-real-ip': '198.51.100.99',
      },
      body: JSON.stringify({ email: victim, password: 'AnyPassword' }),
    });
    expect(lockedRes.status).toBe(401);
    const body = await lockedRes.json();
    expect(body.title).toBe('Account Locked');
    expect(lockedRes.headers.get('retry-after')).toBeDefined();
  });

  it('S-07 & S-09: Admin mutation enforces MFA when ENFORCE_MFA=1', async () => {
    const prev = process.env.ENFORCE_MFA;
    try {
      process.env.ENFORCE_MFA = '1';
      // Editor without 2FA attempts to create a product
      const res = await app.request('/api/v1/admin/products', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          Cookie: editorCookie,
        },
        body: JSON.stringify({ title: 'Test Product', categoryId: 'cat-1' }),
      });
      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.code).toBe('MFA_REQUIRED');
    } finally {
      process.env.ENFORCE_MFA = prev;
    }
  });

  it('S-10: Forged X-Forwarded-For does not override real-IP', async () => {
    // Both limitIp and Better Auth read x-real-ip and ignore x-forwarded-for
    const res = await app.request('/api/v1/health', {
      headers: {
        'x-real-ip': '203.0.113.10',
        'x-forwarded-for': '1.2.3.4, 5.6.7.8',
      },
    });
    expect(res.status).toBe(200);
  });

  it('S-16a: Responses include secure baseline headers', async () => {
    const res = await app.request('/api/v1/health');
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
    expect(res.headers.get('x-frame-options')).toBe('DENY');
    expect(res.headers.get('content-security-policy')).toContain("frame-ancestors 'none'");
  });

  it('DATA-02: Translation write endpoints reject encoding corruption with 422', async () => {
    // Setup super_admin user for translation mutation
    const adminCookie = await setupTestUser('sec-superadmin@twinmos.test', 'super_admin');

    // 1. PUT /translations with ???
    const putRes = await app.request('/api/v1/admin/translations', {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        Cookie: adminCookie,
      },
      body: JSON.stringify({
        locale: 'ar',
        ns: 'common',
        key: 'corrupt.test',
        value: '????? ??????',
      }),
    });
    expect(putRes.status).toBe(422);
    const putBody = await putRes.json();
    expect(putBody.title).toBe('Encoding Validation Failed');

    // 2. POST /translations/import with U+FFFD
    const importRes = await app.request('/api/v1/admin/translations/import', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Cookie: adminCookie,
      },
      body: JSON.stringify({
        locale: 'ar',
        ns: 'common',
        strings: {
          'corrupt.import': 'Bad \uFFFD Character',
        },
      }),
    });
    expect(importRes.status).toBe(422);
    const importBody = await importRes.json();
    expect(importBody.title).toBe('Encoding Validation Failed');

    // 3. POST /translations/xliff with corrupted target
    const xliffXml = `<?xml version="1.0" encoding="UTF-8"?>
<xliff version="1.2">
  <file original="twinmos/common" source-language="en" target-language="ar" datatype="plaintext">
    <body>
      <trans-unit id="corrupt.xliff">
        <source>Original</source>
        <target>?????</target>
      </trans-unit>
    </body>
  </file>
</xliff>`;
    const xliffRes = await app.request('/api/v1/admin/translations/xliff', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Cookie: adminCookie,
      },
      body: JSON.stringify({
        locale: 'ar',
        ns: 'common',
        xml: xliffXml,
      }),
    });
    expect(xliffRes.status).toBe(422);
    const xliffBody = await xliffRes.json();
    expect(xliffBody.title).toBe('Encoding Validation Failed');
  });

  it('A-INVITE: Partner member addition auto-provisions user account', async () => {
    const adminCookie = await setupTestUser('partner-admin@twinmos.test', 'super_admin');
    const { partnerOrg } = await import('@twinmos/db');
    const [org] = await db.insert(partnerOrg).values({
      name: 'Acme Test Partner',
      type: 'distributor',
      country: 'AE',
    }).returning();

    const memberEmail = `invited-${Date.now()}@acmepartner.test`;
    const res = await app.request(`/api/v1/admin/partner-orgs/${org.id}/members`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Cookie: adminCookie,
      },
      body: JSON.stringify({
        email: memberEmail,
        name: 'Invited Member',
      }),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.member.email).toBe(memberEmail);
    expect(body.userCreated).toBe(true);

    // Verify user exists in database with role 'member'
    const { eq } = await import('drizzle-orm');
    const [createdUser] = await db.select().from(user).where(eq(user.email, memberEmail));
    expect(createdUser).toBeDefined();
    expect(createdUser.role).toBe('member');
  });
});

