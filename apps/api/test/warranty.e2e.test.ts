// Warranty registration, lookup and BR-6.2 RMA gating (BRD §F8.3, URD UR-6.1.7 /
// UR-6.4.3 / UR-17.1.5) — regression gates for the zero-trust audit findings:
//   • register: same 202 answer AND same mail for a taken serial (ZT-065);
//     the conflict surfaces at confirm (409) with an alert to support (ZT-066)
//   • purchase date "today" valid in every time zone
//   • lookup reveals details to the owner only
//   • admin list never shows confirmation tokens; pending rows say "pending" (ZT-067)
//   • RMA: unregistered / expired refused; concurrent duplicates → one case (ZT-068)
//   • public SN check counts the current request's country (ZT-074)
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-wty-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.MAIL_OUTBOX_DIR = join(TMP, 'outbox');
process.env.FORMS_TO = 'support@twinmos.dev';
process.env.API_ALLOW_NO_TURNSTILE = '1';
process.env.NODE_ENV = 'test';
process.env.TRUST_PROXY = '1'; // per-request x-real-ip keeps the per-IP limiters out of the way
delete process.env.RESEND_API_KEY;

const rootDir = existsSync(join(process.cwd(), 'packages', 'db', 'migrations'))
  ? process.cwd()
  : dirname(dirname(process.cwd()));
const MIGRATIONS = join(rootDir, 'packages', 'db', 'migrations');

const schema: any = await import('@twinmos/db');
const { createDb, productRegistration, rmaRequest, serialRegistry, snCheck } = schema;
const { migrate } = await import('drizzle-orm/pglite/migrator');
const { buildApp }: any = await import('../src/app.ts');
const { eq } = await import('drizzle-orm');
const { formToken, registerSerial }: any = await import('./support/fixtures.ts');

const db = createDb();
await db.$client.exec('CREATE SCHEMA IF NOT EXISTS drizzle');
await migrate(db, { migrationsFolder: MIGRATIONS });
const app = buildApp(db);
mkdirSync(process.env.MAIL_OUTBOX_DIR!, { recursive: true });

process.env.ENFORCE_MFA = '0';
const ADMIN_PW = 'Wty-Admin-' + new Date().getFullYear() + '!';

let cookie = '';
let n = 0;
const ip = () => ({ 'x-real-ip': `10.77.${Math.floor(++n / 250)}.${n % 250}` });
const post = (path: string, body: unknown) => app.request(path, {
  method: 'POST', headers: { 'content-type': 'application/json', ...ip() }, body: JSON.stringify(body),
});
const mailsTo = (to: string) => readdirSync(process.env.MAIL_OUTBOX_DIR!).filter((f) => f.endsWith('.json')).sort()
  .map((f) => JSON.parse(readFileSync(join(process.env.MAIL_OUTBOX_DIR!, f), 'utf8')))
  .filter((m: any) => m.to === to);
const confirmTokenFor = (to: string) => /confirm=([a-f0-9]{64})/.exec(mailsTo(to).pop()?.text ?? '')?.[1] ?? '';
const register = (serial: string, email: string, purchaseDate = '2026-01-15') =>
  post('/api/v1/warranty/register', { serial, email, name: 'Wendy Owner', purchaseDate, consent: true, formToken: formToken() });

beforeAll(async () => {
  await app.request('/api/v1/auth/sign-up/email', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'wty-admin@twinmos.dev', password: ADMIN_PW, name: 'Wty Admin' }),
  });
  await db.update(schema.user).set({ role: 'super_admin', emailVerified: true }).where(eq(schema.user.email, 'wty-admin@twinmos.dev'));

  const res = await app.request('/api/v1/auth/sign-in/email', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'wty-admin@twinmos.dev', password: ADMIN_PW }),
  });
  cookie = res.headers.getSetCookie().map((c: string) => c.split(';')[0]).join('; ');
  expect(cookie).toBeTruthy();
  await db.insert(serialRegistry).values([
    { serial: 'WTY-0001', manufacturedAt: new Date('2025-06-01T00:00:00Z') },
    { serial: 'WTY-0002' },
  ]);
});

afterAll(async () => {
  await db.$client.close();
  rmSync(TMP, { recursive: true, force: true });
});

describe('registration (two-step, no oracle)', () => {
  it('owner registers → 202 + pending; confirm link activates', async () => {
    const r = await register('WTY-0001', 'owner@example.com');
    expect(r.status).toBe(202);
    const conf = await post('/api/v1/warranty/confirm', { token: confirmTokenFor('owner@example.com') });
    expect(conf.status).toBe(200);
    expect((await conf.json()).serial).toBe('WTY-0001');
  });

  it('a second claimant gets the same answer and the same mail; confirming → 409 + dispute alert', async () => {
    const r = await register('WTY-0001', 'squatter@example.com');
    expect(r.status).toBe(202);
    const mails = mailsTo('squatter@example.com');
    expect(mails).toHaveLength(1);
    expect(mails[0].subject).toMatch(/^Confirm your TwinMOS warranty registration/);
    expect(mails[0].subject.replace('WTY-0001', '')).toBe(mailsTo('owner@example.com')[0].subject.replace('WTY-0001', ''));
    const conf = await post('/api/v1/warranty/confirm', { token: confirmTokenFor('squatter@example.com') });
    expect(conf.status).toBe(409);
    expect((await conf.json()).code).toBe('ALREADY_REGISTERED');
    const alert = mailsTo('support@twinmos.dev').find((m: any) => /Warranty registration dispute/.test(m.subject));
    expect(alert?.text).toContain('squatter@example.com');
    expect(alert?.text).toContain('owner@example.com');
  });

  it('purchase date: today is valid in UTC+14, tomorrow+1 and pre-manufacture are not', async () => {
    const plus14 = new Date(Date.now() + 14 * 3600_000).toISOString().slice(0, 10);
    expect((await register('WTY-0002', 'tz@example.com', plus14)).status).toBe(202);
    const tooFar = new Date(Date.now() + 2 * 86400_000).toISOString().slice(0, 10);
    expect((await register('WTY-0002', 'tz@example.com', tooFar)).status).toBe(422);
    expect((await register('WTY-0001', 'tz@example.com', '2025-05-01')).status).toBe(422);
  });

  it('lookup: owner sees status, anyone else gets not_registered', async () => {
    const mine = await (await post('/api/v1/warranty/lookup', { serial: 'WTY-0001', email: 'owner@example.com' })).json();
    expect(mine.serial).toBe('WTY-0001');
    expect(mine.status).not.toBe('not_registered');
    const theirs = await (await post('/api/v1/warranty/lookup', { serial: 'WTY-0001', email: 'squatter@example.com' })).json();
    expect(theirs).toEqual({ serial: 'WTY-0001', status: 'not_registered' });
  });

  it('admin list never exposes confirmation tokens; pending rows read "pending"', async () => {
    const res = await app.request('/api/v1/admin/warranty-registrations?q=WTY-', { headers: { cookie } });
    expect(res.status).toBe(200);
    const { items } = await res.json();
    expect(items.length).toBeGreaterThanOrEqual(3);
    for (const it of items) expect(it).not.toHaveProperty('confirmToken');
    expect(items.filter((x: any) => x.status === 'pending').every((x: any) => x.warrantyStatus === 'pending')).toBe(true);
    expect((await app.request('/api/v1/admin/warranty-registrations')).status).toBe(401);
  });
});

describe('BR-6.2 RMA intake', () => {
  const rma = (serial: string, email: string) => post('/api/v1/forms/rma', {
    email, consent: true, formToken: formToken(),
    payload: { name: 'Rita Owner', product: 'CoreX', serial, issue: 'Drive disappears after a warm reboot.' },
  });

  it('refuses an unregistered serial and an expired warranty', async () => {
    await db.insert(serialRegistry).values({ serial: 'WTY-NOREG' });
    const a = await rma('WTY-NOREG', 'rita@example.com');
    expect(a.status).toBe(422);
    expect((await a.json()).code).toBe('NOT_REGISTERED');
    await registerSerial(db, 'WTY-OLD', 'rita@example.com', { expired: true });
    const b = await rma('WTY-OLD', 'rita@example.com');
    expect(b.status).toBe(422);
    expect((await b.json()).code).toBe('WARRANTY_EXPIRED');
  });

  it('concurrent submissions for one serial open exactly one case', async () => {
    await registerSerial(db, 'WTY-RACE', 'rita@example.com');
    const results = await Promise.all([rma('WTY-RACE', 'rita@example.com'), rma('WTY-RACE', 'rita@example.com'), rma('WTY-RACE', 'rita@example.com')]);
    const statuses = results.map((r) => r.status).sort();
    expect(statuses.filter((s) => s === 201)).toHaveLength(1);
    expect(statuses.filter((s) => s === 409)).toHaveLength(2);
    const cases = await db.select().from(rmaRequest).where(eq(rmaRequest.serial, 'WTY-RACE'));
    expect(cases).toHaveLength(1);
    // PGlite serialises connections, so the race above may resolve in the fast
    // path; the database rule itself is what makes it hold under Postgres.
    await expect(db.insert(rmaRequest).values({ number: 'TM-RMA-2026-999998', serial: 'WTY-RACE', issue: 'dup' })).rejects.toThrow();
    await db.update(rmaRequest).set({ status: 'closed' }).where(eq(rmaRequest.serial, 'WTY-RACE'));
    await db.insert(rmaRequest).values({ number: 'TM-RMA-2026-999997', serial: 'WTY-RACE', issue: 'new case after close' });
  });
});

describe('public SN check', () => {
  it('a 6th distinct country flags the serial on that very request', async () => {
    await db.insert(serialRegistry).values({ serial: 'WTY-CC' });
    for (const cc of ['DE', 'AE', 'IN', 'BR', 'ZA']) {
      await db.insert(snCheck).values({ serial: 'WTY-CC', result: 'valid', ip: '192.0.2.1', country: cc });
    }
    const res = await app.request('/api/v1/sn-check', {
      method: 'POST', headers: { 'content-type': 'application/json', 'x-real-ip': '192.0.2.1', 'cf-ipcountry': 'JP' },
      body: JSON.stringify({ serial: 'WTY-CC' }),
    });
    expect((await res.json()).result).toBe('suspicious');
    expect(await db.select().from(productRegistration).where(eq(productRegistration.serial, 'WTY-CC'))).toHaveLength(0);
  });
});
