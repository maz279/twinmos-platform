// 0018 lead-speed gates — speed-to-lead and ownership routing:
//   • list: free-text q (email/ref/payload), assignee routing (id/unassigned), total
//   • reply endpoint: sends mail (dev outbox), stamps first_responded_at once,
//     claims unowned leads, logs an internal note, audits
//   • staff-options: minimal editor+ directory for assignment dropdowns
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync, readdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-p18-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.MAIL_OUTBOX_DIR = join(TMP, 'outbox');
process.env.MEDIA_DIR = join(TMP, 'media');
process.env.FORMS_TO = 'console@twinmos.dev';
process.env.API_ALLOW_NO_TURNSTILE = '1';
process.env.NODE_ENV = 'test';

const MIGRATIONS = join(dirname(dirname(process.cwd())), 'packages', 'db', 'migrations');

const { createDb, formSubmission }: any = await import('@twinmos/db');
const { migrate } = await import('drizzle-orm/pglite/migrator');
const { buildApp }: any = await import('../src/app.ts');

const db = createDb();
await db.$client.exec('CREATE SCHEMA IF NOT EXISTS drizzle');
await migrate(db, { migrationsFolder: MIGRATIONS });
const app = buildApp(db);

// seed the first admin directly (Better Auth-registered) — mirrors seed.ts
const { betterAuth } = await import('better-auth');
const { drizzleAdapter } = await import('better-auth/adapters/drizzle');
import * as schema from '@twinmos/db';
const { eq } = await import('drizzle-orm');
const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  emailAndPassword: { enabled: true, minPasswordLength: 10 },
  advanced: { database: { generateId: () => crypto.randomUUID() } },
  user: { additionalFields: { role: { type: 'string', defaultValue: 'viewer', input: false } } },
});
await auth.api.signUpEmail({ body: { email: 'p18@twinmos.dev', password: 'P18-Leads-2026!', name: 'P18 Admin' } });
await db.update(schema.user).set({ role: 'super_admin' }).where(eq(schema.user.email, 'p18@twinmos.dev'));

let cookie = '';
let adminId = '';
let leadId = 0;

const HDRS = () => ({ 'content-type': 'application/json', cookie });

beforeAll(async () => {
  const res = await app.request('/api/v1/auth/sign-in/email', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'p18@twinmos.dev', password: 'P18-Leads-2026!' }),
  });
  cookie = res.headers.get('set-cookie')?.split(';')[0] ?? '';
  expect(cookie).toBeTruthy();
  adminId = (await db.select({ id: schema.user.id }).from(schema.user).limit(1))[0].id;

  // two leads through the real public intake
  const mk = async (email: string, type: string, payload: Record<string, unknown>) => {
    const r = await app.request('/api/v1/forms/' + type, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, consent: true, payload }),
    });
    expect(r.status).toBe(201);
    return (await r.json()).id as number;
  };
  leadId = await mk('buyer@acme.example', 'quote', { company: 'ACME Corp', product: 'VOLTX DDR5 32GB kits', quantity: 250, region: 'EMEA' });
  await mk('info@other.example', 'contact', { message: 'General question about SSD warranty' });
});

afterAll(async () => {
  await db.$client.close();
  rmSync(TMP, { recursive: true, force: true });
});

describe('P18-1: list filters + ownership routing', () => {
  it('free-text q matches email, refCode and payload text; total reflects the filter', async () => {
    const byEmail = await (await app.request('/api/v1/admin/submissions?q=acme', { headers: HDRS() })).json();
    expect(byEmail.total).toBe(1);
    expect(byEmail.items[0].email).toBe('buyer@acme.example');
    const byPayload = await (await app.request('/api/v1/admin/submissions?q=EMEA', { headers: HDRS() })).json();
    expect(byPayload.total).toBe(1);
    const none = await (await app.request('/api/v1/admin/submissions?q=zzz-nothing', { headers: HDRS() })).json();
    expect(none.total).toBe(0);
  });

  it('routes by assignee — unassigned queue and a specific owner', async () => {
    const unassigned = await (await app.request('/api/v1/admin/submissions?assignee=unassigned', { headers: HDRS() })).json();
    expect(unassigned.total).toBe(2);
    await app.request('/api/v1/admin/submissions/' + leadId, {
      method: 'PATCH', headers: HDRS(), body: JSON.stringify({ assigneeId: adminId }),
    });
    const unassignedAfter = await (await app.request('/api/v1/admin/submissions?assignee=unassigned', { headers: HDRS() })).json();
    expect(unassignedAfter.total).toBe(1);
    const mine = await (await app.request('/api/v1/admin/submissions?assignee=' + adminId, { headers: HDRS() })).json();
    expect(mine.total).toBe(1);
    expect(mine.items[0].status).toBe('assigned'); // claiming advances new → assigned
  });
});

describe('P18-2: reply to lead (speed-to-lead)', () => {
  it('sends the reply, stamps first_responded_at once, logs a note, and audits', async () => {
    const res = await app.request('/api/v1/admin/submissions/' + leadId + '/reply', {
      method: 'POST', headers: HDRS(),
      body: JSON.stringify({ text: 'Thanks for the RFQ — 250 kits of VOLTX DDR5 32GB are in stock; formal quote follows today.' }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.sent).toBe(true); // dev mail driver writes to the outbox
    expect(body.firstRespondedAt).toBeTruthy();

    // dev outbox received the customer email
    const outbox = readdirSync(join(TMP, 'outbox'));
    expect(outbox.length).toBeGreaterThan(0);
    const mail = readFileSync(join(TMP, 'outbox', outbox[outbox.length - 1]), 'utf8');
    expect(mail).toContain('buyer@acme.example');
    expect(mail).toContain('formal quote follows');

    // note trail shows the reply
    const detail = await (await app.request('/api/v1/admin/submissions/' + leadId, { headers: HDRS() })).json();
    expect(detail.notes.some((n: any) => n.body.includes('↩ Reply sent') && n.body.includes('formal quote follows'))).toBe(true);
    const first = body.firstRespondedAt;

    // a second reply does NOT re-stamp the first-response time
    const again = await app.request('/api/v1/admin/submissions/' + leadId + '/reply', {
      method: 'POST', headers: HDRS(), body: JSON.stringify({ text: 'Quote attached — valid 30 days.' }),
    });
    const body2 = await again.json();
    expect(new Date(body2.firstRespondedAt).getTime()).toBe(new Date(first).getTime());
  });

  it('refuses empty replies with 422', async () => {
    const res = await app.request('/api/v1/admin/submissions/' + leadId + '/reply', {
      method: 'POST', headers: HDRS(), body: JSON.stringify({ text: '   ' }),
    });
    expect(res.status).toBe(422);
  });
});

describe('P18-3: staff options for assignment', () => {
  it('returns editor+ staff only (minimal fields), requires a session', async () => {
    const res = await app.request('/api/v1/admin/staff-options', { headers: HDRS() });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.items.length).toBeGreaterThanOrEqual(1);
    expect(Object.keys(body.items[0]).sort()).toEqual(['email', 'id', 'role']);
    expect(['editor', 'admin', 'super_admin']).toContain(body.items[0].role);

    const anon = await app.request('/api/v1/admin/staff-options');
    expect(anon.status).toBe(401);
  });
});
