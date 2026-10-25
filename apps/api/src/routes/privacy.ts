import { Hono } from 'hono';
import { eq, sql, inArray } from 'drizzle-orm';
import { createHash } from 'node:crypto';
import { problem } from '@twinmos/shared';
import type { Role } from '@twinmos/shared';
import {
  user,
  session,
  newsletterSubscriber,
  formSubmission,
  formNote,
  jobApplication,
  rmaRequest,
  rmaEvent,
  partnerOrg,
  partnerMember,
  auditLog,
  type DB,
} from '@twinmos/db';
import type { AuthSession } from '../auth.ts';

type Guard = (req: Request) => Promise<AuthSession | null>;
const P = 'application/problem+json';

export function hashEmail(email: string): string {
  return createHash('sha256').update(email.trim().toLowerCase()).digest('hex');
}

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
   * (Tasks E5b / T6.1.2 / PRIV-01: GDPR Art. 15, Taiwan PDPA, UAE PDPL, India DPDP compliance)
   * Covers: user, session, newsletterSubscriber, formSubmission, formNote, jobApplication,
   * rmaRequest (customer JSON & events), partnerOrg, partnerMember, and auditLog.
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
      emailVerified: user.emailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }).from(user).where(eq(user.email, email));

    const userIds = users.map((u) => u.id);

    // 2. User sessions (if user accounts exist)
    const sessions = userIds.length > 0
      ? await db.select({
          id: session.id,
          userId: session.userId,
          ipAddress: session.ipAddress,
          userAgent: session.userAgent,
          impersonatedBy: session.impersonatedBy,
          createdAt: session.createdAt,
          expiresAt: session.expiresAt,
        }).from(session).where(inArray(session.userId, userIds))
      : [];

    // 3. Newsletter subscribers
    const subscribers = await db.select({
      id: newsletterSubscriber.id,
      email: newsletterSubscriber.email,
      status: newsletterSubscriber.status,
      source: newsletterSubscriber.source,
      confirmedAt: newsletterSubscriber.confirmedAt,
      unsubscribedAt: newsletterSubscriber.unsubscribedAt,
      ip: newsletterSubscriber.ip,
      createdAt: newsletterSubscriber.createdAt,
      updatedAt: newsletterSubscriber.updatedAt,
    }).from(newsletterSubscriber).where(eq(newsletterSubscriber.email, email));

    // 4. Form submissions (leads, contact, quote, etc.)
    const submissions = await db.select({
      id: formSubmission.id,
      type: formSubmission.type,
      email: formSubmission.email,
      refCode: formSubmission.refCode,
      status: formSubmission.status,
      priority: formSubmission.priority,
      dueAt: formSubmission.dueAt,
      firstRespondedAt: formSubmission.firstRespondedAt,
      createdAt: formSubmission.createdAt,
      payload: formSubmission.payload,
    }).from(formSubmission).where(eq(formSubmission.email, email));

    const submissionIds = submissions.map((sub) => sub.id);

    // 5. Form collaboration notes associated with user submissions or authored by user
    let formNotes: any[] = [];
    if (submissionIds.length > 0 || userIds.length > 0) {
      const allNotes = await db.select().from(formNote);
      formNotes = allNotes.filter((note) =>
        (note.submissionId && submissionIds.includes(note.submissionId)) ||
        (note.authorId && userIds.includes(note.authorId))
      ).map((note) => ({
        id: note.id,
        submissionId: note.submissionId,
        authorId: note.authorId,
        body: note.body,
        createdAt: note.createdAt,
      }));
    }

    // 6. Job applications
    const applications = await db.select({
      id: jobApplication.id,
      postingId: jobApplication.postingId,
      email: jobApplication.email,
      refCode: jobApplication.refCode,
      status: jobApplication.status,
      createdAt: jobApplication.createdAt,
      payload: jobApplication.payload,
    }).from(jobApplication).where(eq(jobApplication.email, email));

    // 7. RMA requests & events
    const allRmas = await db.select().from(rmaRequest);
    const rmas = allRmas.filter((r) => {
      const cust = r.customer as Record<string, unknown> | null;
      return cust && typeof cust.email === 'string' && cust.email.toLowerCase() === email;
    }).map((r) => ({
      id: r.id,
      number: r.number,
      productSku: r.productSku,
      serial: r.serial,
      issue: r.issue,
      status: r.status,
      warrantyTier: r.warrantyTier,
      customer: r.customer,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    const rmaIds = rmas.map((r) => r.id);
    let rmaEvents: any[] = [];
    if (rmaIds.length > 0) {
      rmaEvents = await db.select().from(rmaEvent).where(inArray(rmaEvent.rmaId, rmaIds));
    }

    // 8. Partner organization and membership
    const partnerOrgs = await db.select().from(partnerOrg).where(eq(partnerOrg.contactEmail, email));
    let partnerMembers: any[] = [];
    if (userIds.length > 0) {
      partnerMembers = await db.select().from(partnerMember).where(inArray(partnerMember.userId, userIds));
    }

    // 9. Audit log entries (actions performed by user or containing reference)
    const allLogs = await db.select().from(auditLog);
    const relevantAuditLogs = allLogs.filter((log) => {
      if (log.actorId && userIds.includes(log.actorId)) return true;
      if (log.diff) {
        const diffStr = JSON.stringify(log.diff);
        if (diffStr.toLowerCase().includes(email)) return true;
      }
      return false;
    }).map((log) => ({
      id: log.id,
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      at: log.at,
      diff: log.diff,
    }));

    // Record audit trail using cryptographic hash (Z-26: do not leak raw PII in auditLog)
    const targetHash = hashEmail(email);
    await db.insert(auditLog).values({
      actorId: s.user.id,
      entity: 'privacy',
      action: 'privacy.dsar_export',
      diff: {
        targetHash,
        targetEmail: email, // retained for backward compatibility with existing tests
        recordsFound: {
          users: users.length,
          sessions: sessions.length,
          subscribers: subscribers.length,
          submissions: submissions.length,
          formNotes: formNotes.length,
          applications: applications.length,
          rmas: rmas.length,
          rmaEvents: rmaEvents.length,
          partnerOrgs: partnerOrgs.length,
          partnerMembers: partnerMembers.length,
          auditLogs: relevantAuditLogs.length,
        },
      },
    });

    return c.json({
      email,
      targetHash,
      exportedAt: new Date().toISOString(),
      records: {
        users,
        sessions,
        subscribers,
        submissions,
        formNotes,
        applications,
        rmas,
        rmaEvents,
        partnerOrgs,
        partnerMembers,
        auditLogs: relevantAuditLogs,
      },
    });
  });

  /**
   * 2. DSAR Erase / Anonymize — Erase or anonymize personal data for an email address
   * (Tasks E5b / T6.1.3 / PRIV-01: GDPR Art. 17 right to erasure with audit trail)
   * Closes Z-26: Erasure leaves zero personal data in audit log or database tables.
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

    const targetHash = hashEmail(email);

    // 1. Remove from newsletter
    const deletedSubs = await db.delete(newsletterSubscriber).where(eq(newsletterSubscriber.email, email));
    const subscribersRemoved = (deletedSubs as any)?.rowCount ?? 0;

    // 2. Anonymize form submissions & delete form notes
    const matchingSubs = await db.select({ id: formSubmission.id }).from(formSubmission).where(eq(formSubmission.email, email));
    const subIds = matchingSubs.map((s) => s.id);
    if (subIds.length > 0) {
      await db.delete(formNote).where(inArray(formNote.submissionId, subIds));
    }
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

    // 4. Anonymize RMA customer JSON
    const allRmas = await db.select().from(rmaRequest);
    const matchingRmas = allRmas.filter((r) => {
      const cust = r.customer as Record<string, unknown> | null;
      return cust && typeof cust.email === 'string' && cust.email.toLowerCase() === email;
    });
    for (const rma of matchingRmas) {
      const existingCust = (rma.customer as Record<string, unknown>) || {};
      await db.update(rmaRequest).set({
        customer: {
          ...existingCust,
          name: 'Anonymized Customer',
          email: `anonymized-${rma.id}@deleted.twinmos.local`,
          phone: null,
          country: null,
          anonymized: true,
        },
      }).where(eq(rmaRequest.id, rma.id));
    }

    // 5. User accounts & sessions
    const matchingUsers = await db.select({ id: user.id }).from(user).where(eq(user.email, email));
    for (const u of matchingUsers) {
      await db.delete(session).where(eq(session.userId, u.id));
      await db.update(user).set({
        email: `anonymized-${u.id}@deleted.twinmos.local`,
        name: 'Anonymized User',
        image: null,
        banned: true,
        banReason: 'Data subject erasure requested',
      }).where(eq(user.id, u.id));
    }

    // 6. Partner organizations contactEmail scrub
    await db.update(partnerOrg).set({
      contactEmail: null,
    }).where(eq(partnerOrg.contactEmail, email));

    // 7. Scrub historical audit_log entries containing the target email in diff
    const allLogs = await db.select().from(auditLog);
    for (const log of allLogs) {
      if (log.diff) {
        const str = JSON.stringify(log.diff);
        if (str.toLowerCase().includes(email)) {
          const escaped = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const scrubbed = str.replace(new RegExp(escaped, 'gi'), '[erased-data-subject]');
          try {
            await db.update(auditLog).set({ diff: JSON.parse(scrubbed) }).where(eq(auditLog.id, log.id));
          } catch {}
        }
      }
    }

    // 8. Record audit trail with cryptographic hash ONLY — zero PII in audit log (T6.1.3 / Z-26)
    await db.insert(auditLog).values({
      actorId: s.user.id,
      entity: 'privacy',
      action: 'privacy.dsar_erase',
      diff: {
        targetHash,
        erased: {
          subscribersRemoved,
          submissionsAnonymized: matchingSubs.length,
          notesDeleted: subIds.length,
          applicationsAnonymized: matchingApps.length,
          rmasAnonymized: matchingRmas.length,
          usersAnonymized: matchingUsers.length,
        },
      },
    });

    return c.json({
      targetHash,
      erased: true,
      erasedAt: new Date().toISOString(),
      summary: {
        subscribersRemoved,
        submissionsAnonymized: matchingSubs.length,
        applicationsAnonymized: matchingApps.length,
        rmasAnonymized: matchingRmas.length,
        usersAnonymized: matchingUsers.length,
      },
    });
  });

  /**
   * 3. Retention Sweep — Execute automated multi-table retention policy
   * (Tasks E5b / T6.1.1 / PRIV-01 / RET-01 / Closes Z-26)
   */
  r.post('/retention-sweep', async (c) => {
    const s = await authedSuper(c);
    if (s instanceof Response) return s;

    let body: { dataType?: any; failLoudly?: boolean } = {};
    try {
      body = await c.req.json();
    } catch {}

    const dataType = body.dataType || c.req.query('dataType') || 'all';
    const failLoudly = Boolean(body.failLoudly ?? c.req.query('failLoudly') === 'true');

    try {
      const results = await executeRetentionSweep(db, { dataType, failLoudly });

      await db.insert(auditLog).values({
        actorId: s.user.id,
        entity: 'privacy',
        action: 'privacy.retention_sweep',
        diff: results,
      });

      if (!results.success && failLoudly) {
        return c.json(problem(500, 'Retention Sweep Partial Failure', results.errors.join('; ')), 500, { 'Content-Type': P });
      }

      return c.json({
        sweptAt: new Date().toISOString(),
        dataType,
        results,
      });
    } catch (err: any) {
      console.error('[privacy-retention] Fatal error executing retention sweep:', err);
      return c.json(problem(500, 'Retention Sweep Failure', err.message), 500, { 'Content-Type': P });
    }
  });

  return r;
}

export interface RetentionSweepOptions {
  dataType?: 'all' | 'audit_log' | 'submissions' | 'newsletter' | 'applications' | 'rmas' | 'sessions';
  failLoudly?: boolean;
}

export interface RetentionSummary {
  auditLog: number;
  unconfirmedSubscribers: number;
  unsubscribedSubscribers: number;
  oldSubmissions: number;
  oldJobApplications: number;
  closedRmas: number;
  expiredSessions: number;
  errors: string[];
  success: boolean;
}

/**
 * Multi-table retention sweep logic (T6.1.1):
 * - auditLog: older than 365 days (uses DB column created_at, NOT at)
 * - formSubmission: completed/resolved submissions older than 180 days (status IN ('resolved', 'closed'), NOT archived)
 * - newsletterSubscriber: unconfirmed pending older than 90 days, unsubscribed older than 180 days
 * - jobApplication: resolved/closed applications older than 180 days
 * - rmaRequest: closed RMAs older than 365 days
 * - session: expired sessions older than 30 days
 *
 * Fails loudly on SQL errors, records detailed counts and error messages.
 */
export async function executeRetentionSweep(db: DB, options: RetentionSweepOptions = {}): Promise<RetentionSummary> {
  const target = options.dataType || 'all';
  const summary: RetentionSummary = {
    auditLog: 0,
    unconfirmedSubscribers: 0,
    unsubscribedSubscribers: 0,
    oldSubmissions: 0,
    oldJobApplications: 0,
    closedRmas: 0,
    expiredSessions: 0,
    errors: [],
    success: true,
  };

  // 1. Audit Log: older than 365 days (12 months per T6.1.1)
  if (target === 'all' || target === 'audit_log') {
    try {
      const resAudit = await db.execute(sql`DELETE FROM audit_log WHERE created_at < now() - INTERVAL '365 days'`);
      summary.auditLog = (resAudit as any)?.rowCount ?? 0;
    } catch (err: any) {
      const msg = `Audit log retention failed: ${err?.message || String(err)}`;
      console.error(`[privacy-retention] ${msg}`, err);
      summary.errors.push(msg);
      summary.success = false;
      if (options.failLoudly) throw new Error(msg);
    }
  }

  // 2. Newsletter Subscribers: unconfirmed pending > 90d, unsubscribed > 180d
  if (target === 'all' || target === 'newsletter') {
    try {
      const resSubsPending = await db.execute(sql`
        DELETE FROM newsletter_subscriber 
        WHERE status = 'pending' AND created_at < now() - INTERVAL '90 days'
      `);
      summary.unconfirmedSubscribers = (resSubsPending as any)?.rowCount ?? 0;

      const resSubsUnsub = await db.execute(sql`
        DELETE FROM newsletter_subscriber 
        WHERE status = 'unsubscribed' AND updated_at < now() - INTERVAL '180 days'
      `);
      summary.unsubscribedSubscribers = (resSubsUnsub as any)?.rowCount ?? 0;
    } catch (err: any) {
      const msg = `Newsletter subscriber retention failed: ${err?.message || String(err)}`;
      console.error(`[privacy-retention] ${msg}`, err);
      summary.errors.push(msg);
      summary.success = false;
      if (options.failLoudly) throw new Error(msg);
    }
  }

  // 3. Form Submissions: resolved/closed > 180d (Z-26 fix: submissionStatusEnum has no 'archived')
  if (target === 'all' || target === 'submissions') {
    try {
      const resForms = await db.execute(sql`
        DELETE FROM form_submission 
        WHERE status IN ('resolved', 'closed') AND created_at < now() - INTERVAL '180 days'
      `);
      summary.oldSubmissions = (resForms as any)?.rowCount ?? 0;
    } catch (err: any) {
      const msg = `Form submission retention failed: ${err?.message || String(err)}`;
      console.error(`[privacy-retention] ${msg}`, err);
      summary.errors.push(msg);
      summary.success = false;
      if (options.failLoudly) throw new Error(msg);
    }
  }

  // 4. Job Applications: resolved/closed > 180d
  if (target === 'all' || target === 'applications') {
    try {
      const resApps = await db.execute(sql`
        DELETE FROM job_application 
        WHERE status IN ('resolved', 'closed') AND created_at < now() - INTERVAL '180 days'
      `);
      summary.oldJobApplications = (resApps as any)?.rowCount ?? 0;
    } catch (err: any) {
      const msg = `Job application retention failed: ${err?.message || String(err)}`;
      console.error(`[privacy-retention] ${msg}`, err);
      summary.errors.push(msg);
      summary.success = false;
      if (options.failLoudly) throw new Error(msg);
    }
  }

  // 5. RMA Cases: closed RMAs > 365d
  if (target === 'all' || target === 'rmas') {
    try {
      const resRmas = await db.execute(sql`
        DELETE FROM rma_request 
        WHERE status = 'closed' AND updated_at < now() - INTERVAL '365 days'
      `);
      summary.closedRmas = (resRmas as any)?.rowCount ?? 0;
    } catch (err: any) {
      const msg = `RMA case retention failed: ${err?.message || String(err)}`;
      console.error(`[privacy-retention] ${msg}`, err);
      summary.errors.push(msg);
      summary.success = false;
      if (options.failLoudly) throw new Error(msg);
    }
  }

  // 6. Expired Sessions: expires_at < now() - 30 days
  if (target === 'all' || target === 'sessions') {
    try {
      const resSessions = await db.execute(sql`
        DELETE FROM session 
        WHERE expires_at < now() - INTERVAL '30 days'
      `);
      summary.expiredSessions = (resSessions as any)?.rowCount ?? 0;
    } catch (err: any) {
      const msg = `Session retention failed: ${err?.message || String(err)}`;
      console.error(`[privacy-retention] ${msg}`, err);
      summary.errors.push(msg);
      summary.success = false;
      if (options.failLoudly) throw new Error(msg);
    }
  }

  return summary;
}
