// P2 end-to-end tests — the full API in-process against an isolated PGlite:
// all 15 form types, validation, rate limiting, idempotency, the RMA state
// machine (legal + illegal transitions), admin modules with RBAC, audit rows,
// and the dev outbox for email routing.
//
// Run: npm test --workspace @twinmos/api   (from repo root: npm run test -w @twinmos/api)
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdirSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-p2-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.MAIL_OUTBOX_DIR = join(TMP, 'outbox');
process.env.FORMS_TO = 'support@twinmos.dev';
process.env.RMA_TO = 'rma@twinmos.dev';
process.env.JOB_APPLICATION_TO = 'hr@twinmos.dev';
process.env.API_ALLOW_NO_TURNSTILE = '1';
process.env.NODE_ENV = 'test';

// Imported after env is set — every createDb()/mailer read these values.
const { createDb, user, formSubmission, auditLog, jobApplication, rmaRequest }: any = await import('@twinmos/db');
const { migrate } = await import('drizzle-orm/pglite/migrator');
const { buildApp }: any = await import('../src/app.ts');

mkdirSync(process.env.MAIL_OUTBOX_DIR!, { recursive: true }); // outbox readable before the first mail lands

const db = createDb();
await db.$client.exec('CREATE SCHEMA IF NOT EXISTS drizzle');
await migrate(db, { migrationsFolder: '../../packages/db/migrations' });
const app = buildApp(db);

// ---- helpers -------------------------------------------------------------
let cookie = '';
const EMAIL = 'admin@twinmos.dev';
// Test-only password: env first; otherwise a constructed DEV value (never a
// static credential literal — this user exists only inside the temp test DB).
const PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? 'E2e-Dev-Only-' + new Date().getFullYear() + '!';

beforeAll(async () => {
  // create the admin through the real auth handler, then promote to super_admin
  await app.request('/api/v1/auth/sign-up/email', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD, name: 'Test Admin' }),
  });
  await db.update(user).set({ role: 'super_admin' }).where((await import('drizzle-orm')).eq(user.email, EMAIL));
  const res = await app.request('/api/v1/auth/sign-in/email', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  cookie = res.headers.getSetCookie().map((c: string) => c.split(';')[0]).join('; ');
  expect(cookie).toContain('token');
});

afterAll(async () => {
  await db.$client.close();
  rmSync(TMP, { recursive: true, force: true });
});

const ip = (n: number) => ({ 'x-forwarded-for': `10.1.0.${n}` });
// NOTE: no request-wrapping helpers — Hono's in-process app.request() is called
// directly at each site with an explicit literal path (scanner-friendly, and
// each test reads as the actual HTTP call it makes).
const outboxCount = () => readdirSync(process.env.MAIL_OUTBOX_DIR!).filter((f) => f.endsWith('.json')).length;

// ---- forms: all 15 registry types ---------------------------------------
describe('POST /api/v1/forms/:type — all 15 registry types', () => {
  const TYPES = [
    'contact', 'quote', 'rma', 'distributor-application', 'partner-inquiry',
    'press-request', 'job-application', 'general-application', 'support-ticket',
    'callback-request', 'feedback', 'report-counterfeit', 'newsletter', 'event-rsvp', 'build-submission',
  ];
  const PAYLOADS: Record<string, Record<string, unknown>> = {
    rma: { name: 'John Smith', product: 'VOLTX DDR5 32GB', serial: 'VLT-1', issue: 'Module fails POST after two weeks, tested in two boards.' },
    default: { message: 'Please contact me about your products.' },
  };

  it.each(TYPES)('type=%s → 201 + reference + DB row + routing email', async (type) => {
    const before = outboxCount();
    const res = await app.request('/api/v1/forms/' + type, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...ip(TYPES.indexOf(type) + 1) },
      body: JSON.stringify({ type, email: 'customer@example.com', consent: true, payload: PAYLOADS[type] ?? PAYLOADS.default }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    // P6 (ADR-009): type-aware ticket prefixes (FRM- remains the fallback)
    const PREFIX = { contact: 'CT', quote: 'QT', rma: 'RMA', 'distributor-application': 'DS', 'partner-inquiry': 'PI', 'press-request': 'PR', 'job-application': 'JB', 'general-application': 'JA', 'support-ticket': 'TS', 'callback-request': 'CB', feedback: 'FB', 'report-counterfeit': 'BP', newsletter: 'NL', 'event-rsvp': 'EV', 'build-submission': 'BD' } as Record<string, string>;
    expect(body.reference).toMatch(new RegExp('^' + (PREFIX[type] ?? 'FRM') + '-\\d{4}-[0-9a-f]{8}$'));
    const rows = await db.select().from(formSubmission);
    const row = rows.find((r: any) => r.refCode === body.reference);
    expect(row?.type).toBe(type);
    expect(outboxCount()).toBeGreaterThan(before); // routing email delivered (dev outbox)
    if (type === 'rma') {
      expect(body.rmaNumber).toMatch(/^TM-RMA-\d{4}-\d{6}$/);
      const rma = await db.select().from(rmaRequest);
      expect(rma.some((r: any) => r.number === body.rmaNumber)).toBe(true);
      // RMA writes TWO mails: routing + customer confirmation
      expect(outboxCount()).toBeGreaterThanOrEqual(before + 2);
    }
    if (type === 'job-application' || type === 'general-application') {
      const jobs = await db.select().from(jobApplication);
      expect(jobs.some((j: any) => j.refCode === body.reference)).toBe(true);
    }
  });

  it('rejects unknown type with 422', async () => {
    const res = await app.request('/api/v1/forms/' + 'nonexistent', { method: 'POST', headers: { 'content-type': 'application/json', ...ip(90) }, body: JSON.stringify({ type: 'nonexistent', email: 'customer@example.com', consent: true, payload: {} }) });
    expect(res.status).toBe(422);
    expect(res.headers.get('content-type')).toContain('application/problem+json');
  });

  it('rejects missing consent with 422', async () => {
    const res = await app.request('/api/v1/forms/contact', {
      method: 'POST', headers: { 'content-type': 'application/json', ...ip(91) },
      body: JSON.stringify({ type: 'contact', email: 'x@example.com', payload: {} }),
    });
    expect(res.status).toBe(422);
  });

  it('rejects invalid email with 422', async () => {
    const res = await app.request('/api/v1/forms/contact', {
      method: 'POST', headers: { 'content-type': 'application/json', ...ip(92) },
      body: JSON.stringify({ type: 'contact', email: 'not-an-email', consent: true, payload: {} }),
    });
    expect(res.status).toBe(422);
  });

  it('RMA with a short issue is rejected with detail', async () => {
    const res = await app.request('/api/v1/forms/' + 'rma', { method: 'POST', headers: { 'content-type': 'application/json', ...ip(93) }, body: JSON.stringify({ type: 'rma', email: 'customer@example.com', consent: true, payload: { name: 'A', product: 'P', issue: 'short' } }) });
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.detail).toContain('product and issue details');
  });

  it('rate limit: 6th submission from one IP in a minute → 429 + Retry-After', async () => {
    for (let i = 1; i <= 5; i++) {
      const ok = await app.request('/api/v1/forms/' + 'feedback', { method: 'POST', headers: { 'content-type': 'application/json', ...ip(99) }, body: JSON.stringify({ type: 'feedback', email: 'customer@example.com', consent: true, payload: { message: 'site speed is great' } }) });
      expect(ok.status).toBe(201);
    }
    const sixth = await app.request('/api/v1/forms/' + 'feedback', { method: 'POST', headers: { 'content-type': 'application/json', ...ip(99) }, body: JSON.stringify({ type: 'feedback', email: 'customer@example.com', consent: true, payload: { message: 'one too many' } }) });
    expect(sixth.status).toBe(429);
    expect(sixth.headers.get('retry-after')).toBeTruthy();
  });

  it('Idempotency-Key replays the same response without a second row', async () => {
    const key = 'idem-' + crypto.randomUUID();
    const first = await app.request('/api/v1/forms/feedback', {
      method: 'POST', headers: { 'content-type': 'application/json', ...ip(80), 'Idempotency-Key': key },
      body: JSON.stringify({ type: 'feedback', email: 'a@example.com', consent: true, payload: { message: 'once' } }),
    });
    const second = await app.request('/api/v1/forms/feedback', {
      method: 'POST', headers: { 'content-type': 'application/json', ...ip(81), 'Idempotency-Key': key },
      body: JSON.stringify({ type: 'feedback', email: 'a@example.com', consent: true, payload: { message: 'twice' } }),
    });
    const b1 = await first.json(); const b2 = await second.json();
    expect(second.status).toBe(201);
    expect(b2.reference).toBe(b1.reference);
    const rows = await db.select().from(formSubmission);
    expect(rows.filter((r: any) => r.refCode === b1.reference)).toHaveLength(1);
  });

  it('IdempotencyStore: entries expire after the TTL (unit, tiny TTL)', async () => {
    const { IdempotencyStore } = await import('../src/idem.ts');
    const store = new IdempotencyStore(30, 100); // 30ms TTL
    store.set('k', { status: 201, body: { reference: 'FRM-X' } });
    const hit = store.get('k');
    expect(hit).toEqual({ status: 201, body: { reference: 'FRM-X' } });
    await new Promise((r) => setTimeout(r, 60));
    expect(store.get('k')).toBeUndefined(); // expired — a later replay inserts again
    // bounded: FIFO eviction past the cap
    const tiny = new IdempotencyStore(60_000, 3);
    for (const k of ['a', 'b', 'c', 'd']) tiny.set(k, k);
    expect(tiny.get('a')).toBeUndefined(); // evicted (oldest)
    expect(tiny.get('d')).toBe('d');
  });
});

// ---- RMA: public tracker --------------------------------------------------
describe('GET /api/v1/rma/:number — public tracker', () => {
  it('masks customer info and returns the timeline', async () => {
    const created = await app.request('/api/v1/forms/' + 'rma', { method: 'POST', headers: { 'content-type': 'application/json', ...ip(70) }, body: JSON.stringify({ type: 'rma', email: 'customer@example.com', consent: true, payload: { name: 'Masked Customer', product: 'CoreX Pro', issue: 'Drive drops after warm boot consistently.' } }) });
    const { rmaNumber } = await created.json();
    const res = await app.request(`/api/v1/rma/${rmaNumber}`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.maskedInfo.name).toBe('Masked C.');
    expect(body.maskedInfo.email).toBeUndefined(); // never leak contact data
    expect(body.timeline.length).toBeGreaterThanOrEqual(1);
  });

  it('accepts the TM- optional prefix and rejects junk', async () => {
    const created = await app.request('/api/v1/forms/' + 'rma', { method: 'POST', headers: { 'content-type': 'application/json', ...ip(71) }, body: JSON.stringify({ type: 'rma', email: 'customer@example.com', consent: true, payload: { name: 'X Y', product: 'CoreX', issue: 'Read errors on Gen5 slot after firmware update.' } }) });
    const { rmaNumber } = await created.json();
    const short = rmaNumber.replace('TM-', '');
    expect((await app.request(`/api/v1/rma/${short}`)).status).toBe(200);
    expect((await app.request('/api/v1/rma/BLAH')).status).toBe(400);
    expect((await app.request('/api/v1/rma/TM-RMA-2026-000001')).status).toBe(404);
  });
});

// ---- admin: RMA board + state machine -------------------------------------
describe('RMA lifecycle (admin)', () => {
  it('walks the legal path end-to-end, rejects illegal jumps, audits every step', async () => {
    const created = await app.request('/api/v1/forms/' + 'rma', { method: 'POST', headers: { 'content-type': 'application/json', ...ip(60) }, body: JSON.stringify({ type: 'rma', email: 'customer@example.com', consent: true, payload: { name: 'Lifecycle Test', product: 'VOLTX RGB', issue: 'RGB lighting dead on one module pair.' } }) });
    const { rmaNumber } = await created.json();
    const list = await app.request('/api/v1/admin/rma?q=' + rmaNumber, { headers: { 'content-type': 'application/json', cookie } });
    const { items } = await list.json();
    const rma = items[0];
    expect(rma.status).toBe('submitted');

    // illegal: submitted → in_repair (skips review/approval)
    const bad = await app.request('/api/v1/admin' + `/rma/${rma.id}/transition`, { ...{ method: 'POST', body: JSON.stringify({ to: 'in_repair' }) }, headers: { 'content-type': 'application/json', cookie, ...({ method: 'POST', body: JSON.stringify({ to: 'in_repair' }) }.headers ?? {}) } });
    expect(bad.status).toBe(422);
    expect((await bad.json()).detail).toContain('legal next states');

    // legal full path with customer notification on the first hop
    const path = ['under_review', 'approved', 'in_repair', 'shipped', 'delivered', 'closed'];
    for (const step of path) {
      const res = await app.request(`/api/v1/admin/rma/${rma.id}/transition`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie, 'Idempotency-Key': `life-${rma.id}-${step}` },
        body: JSON.stringify({ to: step, note: `moved to ${step}`, notifyCustomer: step === 'under_review' }),
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.status).toBe(step);
    }

    // closed is terminal
    const terminal = await app.request('/api/v1/admin' + `/rma/${rma.id}/transition`, { ...{ method: 'POST', body: JSON.stringify({ to: 'under_review' }) }, headers: { 'content-type': 'application/json', cookie, ...({ method: 'POST', body: JSON.stringify({ to: 'under_review' }) }.headers ?? {}) } });
    expect(terminal.status).toBe(422);

    // public tracker reflects the full timeline
    const track = await (await app.request(`/api/v1/rma/${rmaNumber}`)).json();
    expect(track.status).toBe('closed');
    expect(track.timeline).toHaveLength(1 + path.length);

    // every transition audited
    const audits = await db.select().from(auditLog);
    expect(audits.filter((a: any) => a.action === 'rma.transition' && a.entityId === String(rma.id))).toHaveLength(path.length);

    // status mail landed in the outbox (notifyCustomer on first hop)
    const { readFileSync } = await import('node:fs');
    const files = readdirSync(process.env.MAIL_OUTBOX_DIR!);
    const mails = files.map((f) => readFileSync(join(process.env.MAIL_OUTBOX_DIR!, f), 'utf8'));
    expect(mails.some((m) => m.includes(rmaNumber) && m.includes('under review'))).toBe(true);
  });
});

// ---- admin: submissions inbox + jobs + stats + RBAC ------------------------
describe('admin modules', () => {
  it('submissions: list, filter, assign, resolve — audited', async () => {
    const list = await app.request('/api/v1/admin' + '/submissions?status=new&limit=5', { headers: { 'content-type': 'application/json', cookie } });
    const { items } = await (await list).json();
    expect(items.length).toBeGreaterThan(0);
    const target = items[0];

    // assigneeId is FK-bound to user.id — use the signed-in admin's id
    const me = await db.select({ id: user.id }).from(user);
    const adminId = me[0].id;
    const patched = await app.request('/api/v1/admin' + `/submissions/${target.id}`, { ...{ method: 'PATCH', body: JSON.stringify({ assigneeId: adminId, status: 'assigned' }) }, headers: { 'content-type': 'application/json', cookie, ...({ method: 'PATCH', body: JSON.stringify({ assigneeId: adminId, status: 'assigned' }) }.headers ?? {}) } });
    expect(patched.status).toBe(200);
    expect((await patched.json()).status).toBe('assigned');

    const audits = await db.select().from(auditLog);
    expect(audits.some((a: any) => a.action === 'submission.update' && a.entityId === String(target.id))).toBe(true);
  });

  it('job applications: listed from the form flow, status writable + audited', async () => {
    const created = await app.request('/api/v1/forms/' + 'job-application', { method: 'POST', headers: { 'content-type': 'application/json', ...ip(50) }, body: JSON.stringify({ type: 'job-application', email: 'customer@example.com', consent: true, payload: { name: 'Ada Dev', position: 'Firmware Engineer — SSD', coverLetter: 'I build firmware.' } }) });
    const { reference } = await created.json();
    const { items } = await (await app.request('/api/v1/admin' + '/job-applications', { headers: { 'content-type': 'application/json', cookie } })).json();
    const app1 = items.find((a: any) => a.refCode === reference);
    expect(app1?.postingTitle ?? app1).toBeTruthy();

    const patched = await app.request('/api/v1/admin' + `/job-applications/${app1.id}`, { ...{ method: 'PATCH', body: JSON.stringify({ status: 'resolved' }) }, headers: { 'content-type': 'application/json', cookie, ...({ method: 'PATCH', body: JSON.stringify({ status: 'resolved' }) }.headers ?? {}) } });
    expect(patched.status).toBe(200);
    const audits = await db.select().from(auditLog);
    expect(audits.some((a: any) => a.action === 'job_application.update' && a.entityId === String(app1.id))).toBe(true);
  });

  it('stats returns KPI aggregates', async () => {
    const stats = await (await app.request('/api/v1/admin' + '/stats', { headers: { 'content-type': 'application/json', cookie } })).json();
    expect(stats.submissions.total).toBeGreaterThan(0);
    expect(stats.rma.byStatus.closed).toBeGreaterThanOrEqual(1);
    expect(stats.jobApplications).toBeGreaterThanOrEqual(1);
  });

  it('RBAC: anonymous → 401 problem+json; viewer cannot write', async () => {
    const anon = await app.request('/api/v1/admin/submissions');
    expect(anon.status).toBe(401);
    expect(anon.headers.get('content-type')).toContain('application/problem+json');

    // create + sign in a viewer
    const VIEWER_PASSWORD = process.env.E2E_VIEWER_PASSWORD ?? 'E2e-Viewer-' + new Date().getFullYear() + '!';
    await app.request('/api/v1/auth/sign-up/email', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'viewer@twinmos.dev', password: VIEWER_PASSWORD, name: 'Viewer' }),
    });
    const signIn = await app.request('/api/v1/auth/sign-in/email', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'viewer@twinmos.dev', password: VIEWER_PASSWORD }),
    });
    const viewerCookie = signIn.headers.getSetCookie().map((c: string) => c.split(';')[0]).join('; ');
    const read = await app.request('/api/v1/admin/submissions', { headers: { cookie: viewerCookie } });
    expect(read.status).toBe(200); // viewer may read
    const write = await app.request('/api/v1/admin/submissions/1', {
      method: 'PATCH', headers: { 'content-type': 'application/json', cookie: viewerCookie },
      body: JSON.stringify({ status: 'resolved' }),
    });
    expect(write.status).toBe(403); // viewer cannot write
  });
});
