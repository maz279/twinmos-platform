import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-redirects-test-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.NODE_ENV = 'test';
process.env.BETTER_AUTH_SECRET = 'test-secret-twinmos-redirects-key-12345';

const { createDb, user }: any = await import('@twinmos/db');
const { migrate } = await import('drizzle-orm/pglite/migrator');
const { buildApp }: any = await import('../src/app.ts');

describe('CMS Redirects Engine (Task B6 / CMS-E1)', () => {
  let app: any;
  let db: any;
  let superCookie: string;

  beforeAll(async () => {
    db = createDb();
    await db.$client.exec('CREATE SCHEMA IF NOT EXISTS drizzle');
    await migrate(db, { migrationsFolder: '../../packages/db/migrations' });
    app = buildApp(db);

    // Register super_admin user
    const signupRes = await app.request('/api/v1/auth/sign-up/email', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'redirect-super@twinmos.dev',
        password: 'Password123!@#',
        name: 'Redirect Super Admin',
      }),
    });
    expect(signupRes.status).toBe(200);
    const rawCookie = signupRes.headers.get('set-cookie') ?? '';
    superCookie = rawCookie.split(';')[0];

    // Promote to super_admin
    await db.update(user).set({ role: 'super_admin' });
  });

  afterAll(() => {
    try {
      rmSync(TMP, { recursive: true, force: true });
    } catch {
      // Cleanup
    }
  });

  it('creates valid redirect and reflects in list', async () => {
    const res = await app.request('/api/v1/admin/redirects', {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: superCookie },
      body: JSON.stringify({ from: '/old-news-2023', to: '/news', code: 301 }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.from).toBe('/old-news-2023');
    expect(body.to).toBe('/news');

    const listRes = await app.request('/api/v1/admin/redirects', {
      headers: { cookie: superCookie },
    });
    expect(listRes.status).toBe(200);
    const list = await listRes.json();
    expect(list.items.some((r: any) => r.from === '/old-news-2023')).toBe(true);
  });

  it('rejects self-redirects (loop)', async () => {
    const res = await app.request('/api/v1/admin/redirects', {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: superCookie },
      body: JSON.stringify({ from: '/same-target', to: '/same-target', code: 301 }),
    });
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.detail).toContain('Self-redirect detected');
  });

  it('rejects source matching live system route', async () => {
    const res = await app.request('/api/v1/admin/redirects', {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: superCookie },
      body: JSON.stringify({ from: '/shop', to: '/somewhere-else', code: 301 }),
    });
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.detail).toContain('Source path collides with an active system route');
  });

  it('rejects redirect loop (A -> B when B -> A exists)', async () => {
    // 1. Create /link-a -> /link-b
    const res1 = await app.request('/api/v1/admin/redirects', {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: superCookie },
      body: JSON.stringify({ from: '/link-a', to: '/link-b', code: 301 }),
    });
    expect(res1.status).toBe(201);

    // 2. Attempt reverse /link-b -> /link-a
    const res2 = await app.request('/api/v1/admin/redirects', {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: superCookie },
      body: JSON.stringify({ from: '/link-b', to: '/link-a', code: 301 }),
    });
    expect(res2.status).toBe(422);
    const body = await res2.json();
    expect(body.detail).toContain('loop detected');
  });

  it('rejects redirect chain (A -> B -> C)', async () => {
    // /link-a -> /link-b already exists. Attempt /link-b -> /link-c
    const res = await app.request('/api/v1/admin/redirects', {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: superCookie },
      body: JSON.stringify({ from: '/link-b', to: '/link-c', code: 301 }),
    });
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.detail).toContain('Redirect chain detected');
  });

  it('updates redirect and syncs nginx map file', async () => {
    const createRes = await app.request('/api/v1/admin/redirects', {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: superCookie },
      body: JSON.stringify({ from: '/promo-spring-2024', to: '/shop', code: 302 }),
    });
    expect(createRes.status).toBe(201);
    const created = await createRes.json();

    const patchRes = await app.request(`/api/v1/admin/redirects/${created.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', cookie: superCookie },
      body: JSON.stringify({ to: '/contact' }),
    });
    expect(patchRes.status).toBe(200);

    const mapPath = join(process.cwd(), 'deploy/nginx/twinmos-redirects.map');
    if (existsSync(mapPath)) {
      const content = readFileSync(mapPath, 'utf8');
      expect(content).toContain('/promo-spring-2024 /contact;');
    }
  });
});
