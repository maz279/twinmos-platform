// P7 security gate — OWASP-oriented assertions against the running app:
// security headers on every surface, CORS allow-list enforcement, session
// cookie flags, preflight shape, no server banner, and the clientIp
// trust-proxy policy (rate-limit spoofing protection).
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-p7-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.MAIL_OUTBOX_DIR = join(TMP, 'outbox');
process.env.FORMS_TO = 'security@twinmos.dev';
process.env.API_ALLOW_NO_TURNSTILE = '1';
process.env.NODE_ENV = 'test';

// Repo root = parent of the workspace cwd (apps/api); no traversal literals.
const MIGRATIONS = join(dirname(dirname(process.cwd())), 'packages', 'db', 'migrations');

const { createDb }: any = await import('@twinmos/db');
const { migrate } = await import('drizzle-orm/pglite/migrator');
const { buildApp, clientIp }: any = await import('../src/app.ts');
const { eq } = await import('drizzle-orm');

const db = createDb();
await db.$client.exec('CREATE SCHEMA IF NOT EXISTS drizzle');
await migrate(db, { migrationsFolder: MIGRATIONS });
const app = buildApp(db);
const { user } = await import('@twinmos/db');

const mkPass = () => process.env.E2E_ADMIN_PASSWORD ?? 'P7-Sec-' + new Date().getFullYear() + '!';
async function signIn(): Promise<{ cookie: string; setCookies: string[] }> {
  await app.request('/api/v1/auth/sign-up/email', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'p7-sec@twinmos.dev', password: mkPass(), name: 'p7' }),
  });
  await db.update(user).set({ role: 'super_admin' }).where(eq(user.email, 'p7-sec@twinmos.dev'));
  const res = await app.request('/api/v1/auth/sign-in/email', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'p7-sec@twinmos.dev', password: mkPass() }),
  });
  return { cookie: res.headers.getSetCookie().map((c) => c.split(';')[0]).join('; '), setCookies: res.headers.getSetCookie() };
}

afterAll(async () => {
  await db.$client.close();
  rmSync(TMP, { recursive: true, force: true });
});

describe('P7: security headers on every surface', () => {
  it('public health + sn-check carry the full OWASP header set', async () => {
    for (const path of ['/api/v1/health', '/api/v1/i18n/en']) {
      const res = await app.request(path);
      expect(res.headers.get('x-content-type-options')).toBe('nosniff');
      expect(res.headers.get('x-frame-options')).toBe('DENY');
      expect(res.headers.get('referrer-policy')).toBe('strict-origin-when-cross-origin');
      expect(res.headers.get('permissions-policy')).toContain('camera=()');
      expect(res.headers.get('content-security-policy')).toContain("default-src 'none'");
      expect(res.headers.get('x-request-id')).toBeTruthy();
    }
  });

  it('HSTS is emitted when TRUST_PROXY=1 (behind TLS terminator)', async () => {
    process.env.TRUST_PROXY = '1';
    try {
      const res = await app.request('/api/v1/health');
      expect(res.headers.get('strict-transport-security')).toBe('max-age=31536000; includeSubDomains');
    } finally { delete process.env.TRUST_PROXY; }
  });

  it('error responses (404/422) carry the same headers — no naked errors', async () => {
    const res = await app.request('/api/v1/definitely-not-a-route');
    expect(res.status).toBe(404);
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
    expect(res.headers.get('content-security-policy')).toContain('frame-ancestors');
    const body = await res.json();
    expect(body.type).toBe('about:blank'); // RFC 9457 envelope
  });

  it('no server banner leakage', async () => {
    const res = await app.request('/api/v1/health');
    expect(res.headers.get('x-powered-by')).toBeNull();
    expect(res.headers.get('server')).toBeNull();
  });
});

describe('P7: CORS allow-list', () => {
  it('allowed dev origin gets credentials CORS', async () => {
    const res = await app.request('/api/v1/health', {
      headers: { origin: 'http://localhost:5173' },
    });
    expect(res.headers.get('access-control-allow-credentials')).toBe('true');
    expect(res.headers.get('access-control-allow-origin')).toBe('http://localhost:5173');
  });

  it('evil origin gets no allow-origin reflection', async () => {
    const res = await app.request('/api/v1/health', {
      headers: { origin: 'https://evil.example' },
    });
    expect(res.headers.get('access-control-allow-origin')).toBeNull();
  });

  it('preflight from an allowed origin answers with the method/headers set', async () => {
    const res = await app.request('/api/v1/forms/quote', {
      method: 'OPTIONS',
      headers: {
        origin: 'http://localhost:5173',
        'access-control-request-method': 'POST',
        'access-control-request-headers': 'content-type,idempotency-key',
      },
    });
    expect(res.status).toBeLessThan(400);
    expect(res.headers.get('access-control-allow-methods')).toContain('POST');
    expect(res.headers.get('access-control-allow-headers')).toContain('Idempotency-Key');
  });
});

describe('P7: session cookie flags', () => {
  it('Better Auth session cookie is HttpOnly + SameSite=Lax + Path=/', async () => {
    const { setCookies } = await signIn();
    const session = setCookies.find((c) => c.includes('session_token'));
    expect(session).toBeTruthy();
    expect(session!).toMatch(/httponly/i);
    expect(session!).toMatch(/samesite=lax/i);
    expect(session!).toMatch(/path=\//i);
  });
});

describe('P7: clientIp trust policy (rate-limit spoofing guard)', () => {
  const fakeCtx = (headers: Record<string, string>, env: object = {}) =>
    ({ req: { header: (n: string) => headers[n] }, env }) as never;

  it('honours forwarded headers when TRUST_PROXY=1 (dev/test/staging behind Cloudflare)', () => {
    process.env.TRUST_PROXY = '1';
    try {
      expect(clientIp(fakeCtx({ 'cf-connecting-ip': '203.0.113.9' }))).toBe('203.0.113.9');
      expect(clientIp(fakeCtx({ 'x-forwarded-for': '198.51.100.7' }))).toBe('198.51.100.7');
    } finally { delete process.env.TRUST_PROXY; }
  });

  it('NON-production default keeps header trust (dev/test ergonomics)', () => {
    expect(clientIp(fakeCtx({ 'x-forwarded-for': '198.51.100.1' }))).toBe('198.51.100.1');
  });

  it('production WITHOUT TRUST_PROXY ignores spoofable headers', () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    delete process.env.TRUST_PROXY;
    try {
      const ip = clientIp(fakeCtx({ 'x-forwarded-for': '6.6.6.6', 'cf-connecting-ip': '6.6.6.6' }, {
        incoming: { socket: { remoteAddress: '10.0.0.5' } },
      }));
      expect(ip).toBe('10.0.0.5'); // socket address, not the attacker-chosen header
      expect(clientIp(fakeCtx({}))).toBe('unknown');
    } finally { process.env.NODE_ENV = prev; }
  });
});
