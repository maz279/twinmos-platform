// P6 end-to-end tests (ADR-009: quote/lead hardening) — ticketed intake with
// type prefixes, auto-priority + SLA due dates, ticketed auto-replies, the
// server-enforced lead state machine, assignment auto-advance, internal notes,
// filtered CSV export, SLA filters, and RBAC.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve, sep } from 'node:path';

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-p6-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.MAIL_OUTBOX_DIR = join(TMP, 'outbox');
process.env.FORMS_TO = 'sales@twinmos.dev';
process.env.API_ALLOW_NO_TURNSTILE = '1';
process.env.NODE_ENV = 'test';
mkdirSync(process.env.MAIL_OUTBOX_DIR!, { recursive: true }); // outbox readable before the first mail lands

// Repo root = parent of the workspace cwd (apps/api); then down into packages.
// Built with dirname() instead of traversal literals.
const MIGRATIONS = join(dirname(dirname(process.cwd())), 'packages', 'db', 'migrations');

const { createDb, user, formSubmission, formNote }: any = await import('@twinmos/db');
const { migrate } = await import('drizzle-orm/pglite/migrator');
const { buildApp } = await import('../src/app.ts');
const { eq } = await import('drizzle-orm');

const db = createDb();
await db.$client.exec('CREATE SCHEMA IF NOT EXISTS drizzle');
await migrate(db, { migrationsFolder: MIGRATIONS });
const app = buildApp(db);

let adminCookie = '';
let editorCookie = '';
let viewerCookie = '';
const mkPass = (label: string) => process.env.E2E_ADMIN_PASSWORD ?? 'P6-' + label + '-' + new Date().getFullYear() + '!';

async function makeSession(email: string, password: string, role?: string): Promise<string> {
  await app.request('/api/v1/auth/sign-up/email', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password, name: email.split('@')[0] }),
  });
  if (role) await db.update(user).set({ role }).where(eq(user.email, email));
  const res = await app.request('/api/v1/auth/sign-in/email', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.headers.getSetCookie().map((c: string) => c.split(';')[0]).join('; ');
}

/** Newest dev-outbox mail, read with normalized + containment-checked paths. */
function latestOutbox(): Record<string, any> | null {
  const root = resolve(process.env.MAIL_OUTBOX_DIR!);
  const files = readdirSync(root).filter((f) => f.endsWith('.json')).sort();
  if (!files.length) return null;
  const p = resolve(root, files[files.length - 1]); // normalize
  if (p !== root && !p.startsWith(root + sep)) throw new Error('outbox path escaped its directory'); // containment
  return JSON.parse(readFileSync(p, 'utf8'));
}

beforeAll(async () => {
  adminCookie = await makeSession('p6-admin@twinmos.dev', mkPass('Admin'), 'super_admin');
  editorCookie = await makeSession('p6-editor@twinmos.dev', mkPass('Editor'), 'editor');
  viewerCookie = await makeSession('p6-viewer@twinmos.dev', mkPass('Viewer'), 'viewer');
});

afterAll(async () => {
  await db.$client.close();
  rmSync(TMP, { recursive: true, force: true });
});

const ip = (n: number) => ({ 'x-forwarded-for': `10.30.0.${n}` });
const json = { 'content-type': 'application/json' };

describe('P6 lead intake (ADR-009)', () => {
  let qtRef = '';
  let ctRef = '';

  it('quote submit → QT- reference, high priority, SLA due ≈ +24h, ticketed auto-reply', async () => {
    const res = await app.request('/api/v1/forms/quote', {
      method: 'POST', headers: { ...json, ...ip(1) },
      body: JSON.stringify({
        type: 'quote', email: 'buyer@acme.example', name: 'Sarah Chen',
        payload: { company: 'ACME Systems', country: 'Germany', product: 'VOLTX DDR5 32GB kit', quantity: '250', message: 'Q1 build cycle quote requested.' },
        consent: true,
      }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.reference).toMatch(/^QT-\d{4}-[0-9a-f]{8}$/);
    qtRef = body.reference;

    const row = (await db.select().from(formSubmission)).find((r: any) => r.refCode === qtRef);
    expect(row.priority).toBe('high');
    expect(row.dueAt).toBeTruthy();
    const hoursOut = (new Date(row.dueAt).getTime() - Date.now()) / 3600_000;
    expect(hoursOut).toBeGreaterThan(23.8);
    expect(hoursOut).toBeLessThan(24.2);

    const mail = latestOutbox();
    expect(mail.to).toBe('buyer@acme.example');
    expect(mail.subject).toContain(qtRef);
    expect(mail.text).toContain(qtRef);
  });

  it('contact submit → CT- reference, normal priority, auto-reply too', async () => {
    const res = await app.request('/api/v1/forms/contact', {
      method: 'POST', headers: { ...json, ...ip(2) },
      body: JSON.stringify({ type: 'contact', email: 'hi@visitor.example', payload: { message: 'General question about warranty terms.' }, consent: true }),
    });
    const body = await res.json();
    expect(body.reference).toMatch(/^CT-\d{4}-[0-9a-f]{8}$/);
    ctRef = body.reference;
    const row = (await db.select().from(formSubmission)).find((r: any) => r.refCode === ctRef);
    expect(row.priority).toBe('normal');
  });

  it('list carries priority + slaState; sla=overdue filter matches only past-due open leads', async () => {
    // make one lead overdue directly
    await db.update(formSubmission).set({ dueAt: new Date(Date.now() - 3600_000) }).where(eq(formSubmission.refCode, ctRef));
    const all = await (await app.request('/api/v1/admin/submissions', { headers: { cookie: viewerCookie } })).json();
    const qt = all.items.find((i: any) => i.refCode === qtRef);
    const ct = all.items.find((i: any) => i.refCode === ctRef);
    expect(qt.slaState).toBe('on_track');
    expect(ct.slaState).toBe('overdue');
    const overdue = await (await app.request('/api/v1/admin/submissions?sla=overdue', { headers: { cookie: viewerCookie } })).json();
    expect(overdue.items.some((i: any) => i.refCode === ctRef)).toBe(true);
    expect(overdue.items.some((i: any) => i.refCode === qtRef)).toBe(false);
  });

  it('state machine: illegal jumps rejected (422), happy path new→assigned→in_progress→resolved→closed', async () => {
    const id = (await db.select().from(formSubmission)).find((r: any) => r.refCode === qtRef).id;
    const patch = (body: unknown, cookie = editorCookie) =>
      app.request(`/api/v1/admin/submissions/${id}`, { method: 'PATCH', headers: { ...json, cookie }, body: JSON.stringify(body) });

    expect((await patch({ status: 'closed' })).status).toBe(422); // new → closed illegal
    // assignment with a REAL user id auto-advances new → assigned
    const editorId = (await db.select().from(user)).find((u: any) => u.email === 'p6-editor@twinmos.dev').id;
    const assigned = await (await patch({ assigneeId: editorId })).json();
    expect(assigned.status).toBe('assigned');
    expect((await patch({ status: 'in_progress' })).status).toBe(200);
    expect((await patch({ status: 'resolved' })).status).toBe(200);
    expect((await patch({ status: 'closed' })).status).toBe(200);
    const afterClosed = await patch({ status: 'assigned' });
    expect(afterClosed.status).toBe(422); // closed is terminal
    // slaState nulls out for closed leads
    const detail = await (await app.request(`/api/v1/admin/submissions/${id}`, { headers: { cookie: viewerCookie } })).json();
    expect(detail.slaState).toBeNull();
    expect(detail.status).toBe('closed');
  });

  it('spam flow: new → spam → back to new', async () => {
    const res = await app.request('/api/v1/forms/feedback', {
      method: 'POST', headers: { ...json, ...ip(3) },
      body: JSON.stringify({ type: 'feedback', email: 'x@y.example', payload: { message: 'site feedback here' }, consent: true }),
    });
    const { reference } = await res.json();
    const id = (await db.select().from(formSubmission)).find((r: any) => r.refCode === reference).id;
    const patch = (body: unknown) =>
      app.request(`/api/v1/admin/submissions/${id}`, { method: 'PATCH', headers: { ...json, cookie: editorCookie }, body: JSON.stringify(body) });
    expect((await patch({ status: 'spam' })).status).toBe(200);
    expect((await patch({ status: 'new' })).status).toBe(200); // un-spam returns to queue
  });

  it('priority patch is audited; viewer cannot write', async () => {
    const id = (await db.select().from(formSubmission)).find((r: any) => r.refCode === qtRef).id;
    expect((await app.request(`/api/v1/admin/submissions/${id}`, {
      method: 'PATCH', headers: { ...json, cookie: viewerCookie }, body: JSON.stringify({ priority: 'urgent' }),
    })).status).toBe(403);
    const ok = await app.request(`/api/v1/admin/submissions/${id}`, {
      method: 'PATCH', headers: { ...json, cookie: adminCookie }, body: JSON.stringify({ priority: 'urgent' }),
    });
    expect(ok.status).toBe(200);
    expect((await ok.json()).priority).toBe('urgent');
    const { auditLog } = await import('@twinmos/db');
    const audits = await db.select().from(auditLog);
    expect(audits.some((a: any) => a.action === 'submission.update' && a.entityId === String(id))).toBe(true);
  });

  it('notes: editor adds, viewer 403, listed newest-first with author', async () => {
    const id = (await db.select().from(formSubmission)).find((r: any) => r.refCode === qtRef).id;
    expect((await app.request(`/api/v1/admin/submissions/${id}/notes`, {
      method: 'POST', headers: { ...json, cookie: viewerCookie }, body: JSON.stringify({ body: 'nope' }),
    })).status).toBe(403);
    expect((await app.request(`/api/v1/admin/submissions/${id}/notes`, {
      method: 'POST', headers: { ...json, cookie: editorCookie }, body: JSON.stringify({ body: 'Called the buyer — needs 250 units by March.' }),
    })).status).toBe(201);
    expect((await app.request(`/api/v1/admin/submissions/${id}/notes`, {
      method: 'POST', headers: { ...json, cookie: editorCookie }, body: JSON.stringify({ body: 'Sent draft quote v1.' }),
    })).status).toBe(201);
    const detail = await (await app.request(`/api/v1/admin/submissions/${id}`, { headers: { cookie: viewerCookie } })).json();
    expect(detail.notes.length).toBe(2);
    expect(detail.notes[0].body).toContain('draft quote');
    expect(detail.notes[0].author).toBe('p6-editor@twinmos.dev');
    const notes = await db.select().from(formNote);
    expect(notes.length).toBeGreaterThanOrEqual(2);
  });

  it('CSV export: editor 200 text/csv with structured lead columns; viewer 403', async () => {
    const denied = await app.request('/api/v1/admin/submissions.csv', { headers: { cookie: viewerCookie } });
    expect(denied.status).toBe(403);
    const res = await app.request('/api/v1/admin/submissions.csv?type=quote', { headers: { cookie: editorCookie } });
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/csv');
    const csv = await res.text();
    expect(csv.split('\r\n')[0]).toBe('ref,type,status,priority,email,company,country,product,quantity,due_at,created_at,assignee');
    const qtRow = csv.split('\r\n').find((l) => l.includes(qtRef));
    expect(qtRow).toBeTruthy();
    expect(qtRow!).toContain('ACME Systems');
    expect(qtRow!).toContain('250');
    expect(qtRow!).toContain('urgent');
  });

  it('dashboard reports open + overdue lead counts', async () => {
    const dash = await (await app.request('/api/v1/admin/stats', { headers: { cookie: viewerCookie } })).json();
    expect(dash.submissions.open).toBeGreaterThanOrEqual(1);
    expect(dash.submissions.overdue).toBeGreaterThanOrEqual(1); // the CT lead made overdue above
    expect(typeof dash.submissions.byStatus.closed).toBe('number');
  });
});
