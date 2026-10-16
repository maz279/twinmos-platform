import { Hono } from 'hono';
import { eq, sql } from 'drizzle-orm';
import { problem } from '@twinmos/shared';
import type { Role } from '@twinmos/shared';
import {
  user,
  newsletterSubscriber,
  formSubmission,
  jobApplication,
  rmaRequest,
  auditLog,
  type DB,
} from '@twinmos/db';
import type { AuthSession } from '../auth.ts';

type Guard = (req: Request) => Promise<AuthSession | null>;
const P = 'application/problem+json';

export function privacyRoute(
  db: DB,
  deps: {
    requireRole: (r: Role) => Guard;
    sessionFromRequest: (req: Request) => Promise<AuthSession>;
  }
) {
  const r = new Hono();

  async function authedSuper(c: any): Promise<Exclude<AuthSession, null> | Response> {
    const s = await deps.sessionFromRequest(c.req.raw);
    if (!s) return c.json(problem(401, 'Unauthorized'), 401, { 'Content-Type': P });
    const ok = await deps.requireRole('super_admin')(c.req.raw);
    if (!ok) {
      return c.json(problem(403, 'Forbidden', 'Privacy operations require super_admin role.'), 403, { 'Content-Type': P });
    }
    return s;
  }

  /**
   * 1. DSAR Export — Collect all data associated with an email address across tables
   * (Tasks E5b / PRIV-01: GDPR Art. 15, Taiwan PDPA, UAE PDPL, India DPDP compliance)
   */
  r.post('/dsar-export', async (c) => {
    const s = await authedSuper(c);
    if (s instanceof Response) return s;

    let body: { email?: string };
    try {
      body = await c.req.json();
    } catch {
      return c.json(problem(400, 'Bad Request', 'Invalid JSON body'), 400, { 'Content-Type': P });
    }

    const email = String(body.email || '').trim().toLowerCase();
    if (!email || !email.includes('@')) {
      return c.json(problem(422, 'Unprocessable Entity', 'Valid email address required'), 422, { 'Content-Type': P });
    }

    // 1. User account
    const users = await db.select({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    }).from(user).where(eq(user.email, email));

    // 2. Newsletter subscribers
    const subscribers = await db.select({
      id: newsletterSubscriber.id,
      email: newsletterSubscriber.email,
      status: newsletterSubscriber.status,
      source: newsletterSubscriber.source,
      confirmedAt: newsletterSubscriber.confirmedAt,
      createdAt: newsletterSubscriber.createdAt,
    }).from(newsletterSubscriber).where(eq(newsletterSubscriber.email, email));

    // 3. Form submissions (leads, contact, quote, etc.)
    const submissions = await db.select({
      id: formSubmission.id,
      type: formSubmission.type,
      email: formSubmission.email,
      refCode: formSubmission.refCode,
      status: formSubmission.status,
      createdAt: formSubmission.createdAt,
      payload: formSubmission.payload,
    }).from(formSubmission).where(eq(formSubmission.email, email));

    // 4. Job applications
    const applications = await db.select({
      id: jobApplication.id,
      email: jobApplication.email,
      refCode: jobApplication.refCode,
      status: jobApplication.status,
      createdAt: jobApplication.createdAt,
      payload: jobApplication.payload,
    }).from(jobApplication).where(eq(jobApplication.email, email));

    // 5. RMA requests
    const allRmas = await db.select().from(rmaRequest);
    const rmas = allRmas.filter((r) => {
      const cust = r.customer as Record<string, unknown> | null;
      return cust && typeof cust.email === 'string' && cust.email.toLowerCase() === email;
    }).map((r) => ({
      id: r.id,
      number: r.number,
      productSku: r.productSku,
      status: r.status,
      createdAt: r.createdAt,
    }));

    // Record audit trail
    await db.insert(auditLog).values({
      actorId: s.user.id,
      entity: 'privacy',
      action: 'privacy.dsar_export',
      diff: {
        targetEmail: email,
        recordsFound: {
          users: users.length,
          subscribers: subscribers.length,
          submissions: submissions.length,
          applications: applications.length,
          rmas: rmas.length,
        },
      },
    });

    return c.json({
      email,
      exportedAt: new Date().toISOString(),
      records: {
        users,
        subscribers,
        submissions,
        applications,
        rmas,
      },
    });
  });

  /**
   * 2. DSAR Erase / Anonymize — Erase or anonymize personal data for an email address
   * (Tasks E5b / PRIV-01: GDPR Art. 17 right to erasure with audit trail)
   */
  r.post('/dsar-erase', async (c) => {
    const s = await authedSuper(c);
    if (s instanceof Response) return s;

    let body: { email?: string };
    try {
      body = await c.req.json();
    } catch {
      return c.json(problem(400, 'Bad Request', 'Invalid JSON body'), 400, { 'Content-Type': P });
    }

    const email = String(body.email || '').trim().toLowerCase();
    if (!email || !email.includes('@')) {
      return c.json(problem(422, 'Unprocessable Entity', 'Valid email address required'), 422, { 'Content-Type': P });
    }

    // 1. Remove from newsletter
    const deletedSubs = await db.delete(newsletterSubscriber).where(eq(newsletterSubscriber.email, email));

    // 2. Anonymize form submissions
    const matchingSubs = await db.select({ id: formSubmission.id }).from(formSubmission).where(eq(formSubmission.email, email));
    for (const sub of matchingSubs) {
      await db.update(formSubmission).set({
        email: `anonymized-${sub.id}@deleted.twinmos.local`,
        ip: null,
        ua: null,
        payload: { anonymized: true },
      }).where(eq(formSubmission.id, sub.id));
    }

    // 3. Anonymize job applications
    const matchingApps = await db.select({ id: jobApplication.id }).from(jobApplication).where(eq(jobApplication.email, email));
    for (const app of matchingApps) {
      await db.update(jobApplication).set({
        email: `anonymized-${app.id}@deleted.twinmos.local`,
        payload: { anonymized: true },
      }).where(eq(jobApplication.id, app.id));
    }

    // Record audit trail
    await db.insert(auditLog).values({
      actorId: s.user.id,
      entity: 'privacy',
      action: 'privacy.dsar_erase',
      diff: {
        targetEmail: email,
        erased: {
          subscribersRemoved: (deletedSubs as any)?.rowCount ?? 0,
          submissionsAnonymized: matchingSubs.length,
          applicationsAnonymized: matchingApps.length,
        },
      },
    });

    return c.json({
      email,
      erased: true,
      erasedAt: new Date().toISOString(),
      summary: {
        submissionsAnonymized: matchingSubs.length,
        applicationsAnonymized: matchingApps.length,
      },
    });
  });

  /**
   * 3. Retention Sweep — Execute automated multi-table retention policy
   * (Tasks E5b / PRIV-01 / RET-01)
   */
  r.post('/retention-sweep', async (c) => {
    const s = await authedSuper(c);
    if (s instanceof Response) return s;

    const results = await executeRetentionSweep(db);

    await db.insert(auditLog).values({
      actorId: s.user.id,
      entity: 'privacy',
      action: 'privacy.retention_sweep',
      diff: results,
    });

    return c.json({
      sweptAt: new Date().toISOString(),
      results,
    });
  });

  return r;
}

/**
 * Multi-table retention sweep logic:
 * - auditLog: older than 365 days
 * - formSubmission: completed/resolved submissions older than 180 days
 * - newsletterSubscriber: unconfirmed pending tokens older than 90 days
 */
export async function executeRetentionSweep(db: DB) {
  const summary = { auditLog: 0, unconfirmedSubscribers: 0, oldSubmissions: 0 };

  try {
    const resAudit = await db.execute(sql`DELETE FROM audit_log WHERE at < now() - INTERVAL '365 days'`);
    summary.auditLog = (resAudit as any)?.rowCount ?? 0;
  } catch {}

  try {
    const resSubs = await db.execute(sql`
      DELETE FROM newsletter_subscriber 
      WHERE status = 'pending' AND created_at < now() - INTERVAL '90 days'
    `);
    summary.unconfirmedSubscribers = (resSubs as any)?.rowCount ?? 0;
  } catch {}

  try {
    const resForms = await db.execute(sql`
      DELETE FROM form_submission 
      WHERE status IN ('resolved', 'closed', 'archived') AND created_at < now() - INTERVAL '180 days'
    `);
    summary.oldSubmissions = (resForms as any)?.rowCount ?? 0;
  } catch {}

  return summary;
}
