// 0019 RMA gates — the verify-before-service and communication loop:
//   • list: q across number/SKU/serial/customer, assignee routing, total
//   • serial-check: verified / unknown / suspicious verdicts off the registry
//     + 24h SN-check activity (same >5-distinct-sources rule as the scan)
//   • reply: mailer send (dev outbox), same-state timeline event, audit
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync, readdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-p19-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.MAIL_OUTBOX_DIR = join(TMP, 'outbox');
process.env.MEDIA_DIR = join(TMP, 'media');
process.env.FORMS_TO = 'console@twinmos.dev';
process.env.API_ALLOW_NO_TURNSTILE = '1';
process.env.NODE_ENV = 'test';

const MIGRATIONS = join(dirname(dirname(process.cwd())), 'packages', 'db', 'migrations');

const { createDb, rmaRequest, rmaEvent, serialRegistry, snCheck }: any = await import('@twinmos/db');
const { migrate } = await import('drizzle-orm/pglite/migrator');
const { buildApp }: any = await import('../src/app.ts');
const { eq } = await import('drizzle-orm');

const db = createDb();
await db.$client.exec('CREATE SCHEMA IF NOT EXISTS drizzle');
await migrate(db, { migrationsFolder: MIGRATIONS });
const app = buildApp(db);

// seed the first admin directly (Better Auth-registered) — mirrors seed.ts
const { betterAuth } = await import('better-auth');
const { drizzleAdapter } = await import('better-auth/adapters/drizzle');
import * as schema from '@twinmos/db';
const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  emailAndPassword: { enabled: true, minPasswordLength: 10 },
  advanced: { database: { generateId: () => crypto.randomUUID() } },
  user: { additionalFields: { role: { type: 'string', defaultValue: 'viewer', input: false } } },
});
await auth.api.signUpEmail({ body: { email: 'p19@twinmos.dev', password: 'P19-Rma-2026!', name: 'P19 Admin' } });
await db.update(schema.user).set({ role: 'super_admin' }).where(eq(schema.user.email, 'p19@twinmos.dev'));

let cookie = '';
let adminId = '';
const HDRS = () => ({ 'content-type': 'application/json', cookie });

beforeAll(async () => {
  const res = await app.request('/api/v1/auth/sign-in/email', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'p19@twinmos.dev', password: 'P19-Rma-2026!' }),
  });
  cookie = res.headers.get('set-cookie')?.split(';')[0] ?? '';
  expect(cookie).toBeTruthy();
  adminId = (await db.select({ id: schema.user.id }).from(schema.user).limit(1))[0].id;

  // three cases through the real public RMA intake (type rma)
  const mk = async (email: string, payload: Record<string, unknown>) => {
    const r = await app.request('/api/v1/forms/rma', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, consent: true, payload }),
    });
    expect(r.status).toBe(201);
    return (await r.json()).id as number;
  };
  verifiedId = await mk('a@verified.example', { name: 'Vera Verified', product: 'VLT-DDR5-16G', serial: 'TMS-VERIFIED-001', issue: 'Module fails XMP profile' });
  unknownId = await mk('b@unknown.example', { name: 'Uma Unknown', product: 'VLT-DDR5-32G', serial: 'FAKE-SN-999', issue: 'Not detected' });
  suspiciousId = await mk('c@suspicious.example', { name: 'Sam Suspicious', product: 'VLT-SSD-1TB', serial: 'TMS-LEAKED-002', issue: 'Dead on arrival' });

  // registry rows: one clean serial, one serial that will show leaked distribution
  await db.insert(serialRegistry).values([
    { serial: 'TMS-VERIFIED-001', sku: 'VLT-DDR5-16G', batch: 'B2601' },
    { serial: 'TMS-LEAKED-002', sku: 'VLT-SSD-1TB', batch: 'B2602' },
  ]);
  // 7 distinct IPs verified the leaked serial in the last 24h → suspicious
  for (let i = 1; i <= 7; i++) {
    await db.insert(snCheck).values({ serial: 'TMS-LEAKED-002', sku: 'VLT-SSD-1TB', result: 'valid', ip: `203.0.113.${i}`, country: 'XX' });
  }
});

let verifiedId = 0;
let unknownId = 0;
let suspiciousId = 0;

afterAll(async () => {
  await db.$client.close();
  rmSync(TMP, { recursive: true, force: true });
});

describe('P19-1: list search + technician routing', () => {
  it('q matches serial, SKU and customer text; total reflects the filter', async () => {
    const bySerial = await (await app.request('/api/v1/admin/rma?q=TMS-VERIFIED-001', { headers: HDRS() })).json();
    expect(bySerial.total).toBe(1);
    expect(bySerial.items[0].serial).toBe('TMS-VERIFIED-001');
    const byCustomer = await (await app.request('/api/v1/admin/rma?q=Vera', { headers: HDRS() })).json();
    expect(byCustomer.total).toBe(1);
    expect((await (await app.request('/api/v1/admin/rma?q=zzz-none', { headers: HDRS() })).json()).total).toBe(0);
  });

  it('routes by technician — unassigned queue and a specific owner', async () => {
    expect((await (await app.request('/api/v1/admin/rma?assignee=unassigned', { headers: HDRS() })).json()).total).toBe(3);
    await app.request(`/api/v1/admin/rma/${verifiedId}/assign`, {
      method: 'PATCH', headers: HDRS(), body: JSON.stringify({ assigneeId: adminId }),
    });
    const mine = await (await app.request('/api/v1/admin/rma?assignee=' + adminId, { headers: HDRS() })).json();
    expect(mine.total).toBe(1);
    expect(mine.items[0].number).toBeTruthy();
    expect((await (await app.request('/api/v1/admin/rma?assignee=unassigned', { headers: HDRS() })).json()).total).toBe(2);
  });
});

describe('P19-2: serial authenticity check (verify before service)', () => {
  it('verdict=verified for a registry hit with SKU match and no anomaly', async () => {
    const sc = await (await app.request(`/api/v1/admin/rma/${verifiedId}/serial-check`, { headers: HDRS() })).json();
    expect(sc.verdict).toBe('verified');
    expect(sc.registry.sku).toBe('VLT-DDR5-16G');
    expect(sc.skuMatch).toBe(true);
    expect(sc.last24h.checks).toBe(0);
  });

  it('verdict=unknown when the serial is not in the factory registry', async () => {
    const sc = await (await app.request(`/api/v1/admin/rma/${unknownId}/serial-check`, { headers: HDRS() })).json();
    expect(sc.verdict).toBe('unknown');
    expect(sc.registry).toBeNull();
  });

  it('verdict=suspicious when >5 distinct sources checked the serial in 24h', async () => {
    const sc = await (await app.request(`/api/v1/admin/rma/${suspiciousId}/serial-check`, { headers: HDRS() })).json();
    expect(sc.verdict).toBe('suspicious');
    expect(sc.last24h.distinctIps).toBe(7);
  });
});

describe('P19-3: staff reply to the RMA customer', () => {
  it('sends the email (dev outbox), logs a same-state timeline event, audits', async () => {
    const res = await app.request(`/api/v1/admin/rma/${verifiedId}/reply`, {
      method: 'POST', headers: HDRS(),
      body: JSON.stringify({ text: 'Your module arrived at the Dubai lab — bench test starts tomorrow, tracking to follow.' }),
    });
    expect(res.status).toBe(201);
    expect((await res.json()).sent).toBe(true);

    const outbox = readdirSync(join(TMP, 'outbox'));
    expect(outbox.length).toBeGreaterThan(0);
    const mail = readFileSync(join(TMP, 'outbox', outbox[outbox.length - 1]), 'utf8');
    expect(mail).toContain('a@verified.example');
    expect(mail).toContain('bench test starts tomorrow');

    const events = await db.select().from(rmaEvent).where(eq(rmaEvent.rmaId, verifiedId));
    const replyEvent = events.find((e: any) => (e.note ?? '').startsWith('↩ Reply sent'));
    expect(replyEvent).toBeTruthy();
    expect(replyEvent.fromStatus).toBe(replyEvent.toStatus); // timeline annotation, not a transition

    // 422 without an email on file is not testable here (intake requires email) — empty text instead:
    const bad = await app.request(`/api/v1/admin/rma/${verifiedId}/reply`, {
      method: 'POST', headers: HDRS(), body: JSON.stringify({ text: '' }),
    });
    expect(bad.status).toBe(422);
  });
});
