// Users & Roles Management — super_admin only per docs/04-ADMIN-CMS-SPEC.md §RBAC
// Endpoints: list users, invite staff, change roles, revoke sessions, ban/unban.
import { Hono } from 'hono';
import { and, count, desc, eq, ilike, isNull, or, sql } from 'drizzle-orm';
import { z } from 'zod';
import { problem } from '@twinmos/shared';
import { auditLog, session, user } from '@twinmos/db';
import type { DB } from '@twinmos/db';
import type { AuthSession } from '../auth.ts';
import type { Role } from '@twinmos/shared';
import { sendStaffInviteMail } from '../mailer.ts';

class AsyncMutex {
  private queue: Promise<void> = Promise.resolve();

  runExclusive<T>(fn: () => Promise<T>): Promise<T> {
    let release: () => void;
    const next = new Promise<void>((resolve) => {
      release = resolve;
    });
    const current = this.queue;
    this.queue = current.then(() => next, () => next);
    return current.then(async () => {
      try {
        return await fn();
      } finally {
        release();
      }
    });
  }
}

const superAdminGovernanceLock = new AsyncMutex();

type Guard = (req: Request) => Promise<AuthSession | null>;
const P = 'application/problem+json';

const inviteSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  name: z.string().trim().min(2).max(120),
  role: z.enum(['super_admin', 'admin', 'editor', 'author', 'viewer']).default('viewer'),
  password: z.string().min(10).optional(),
});

const roleSchema = z.object({
  role: z.enum(['super_admin', 'admin', 'editor', 'author', 'viewer']),
});

export function usersRoute(db: DB, deps: {
  requireRole: (r: Role) => Guard;
  sessionFromRequest: (req: Request) => Promise<AuthSession>;
  auth: any;
}) {
  const r = new Hono();

  async function superAdminGuard(c: any): Promise<Exclude<AuthSession, null> | Response> {
    const s = await deps.sessionFromRequest(c.req.raw);
    if (!s) return c.json(problem(401, 'Unauthorized'), 401, { 'Content-Type': P });
    const ok = await deps.requireRole('super_admin')(c.req.raw);
    return ok ? s : c.json(problem(403, 'Requires super_admin role'), 403, { 'Content-Type': P });
  }

  /** Any authenticated staff session (P1.4 me/password endpoints). */
  async function sessionGuard(c: any): Promise<Exclude<AuthSession, null> | Response> {
    const s = await deps.sessionFromRequest(c.req.raw);
    return s ?? c.json(problem(401, 'Unauthorized'), 401, { 'Content-Type': P });
  }

  async function auditRow(c: any, actorId: string | undefined, action: string, entityId: string, diff: unknown) {
    await db.insert(auditLog).values({
      actorId: actorId ?? null,
      action,
      entity: 'user',
      entityId,
      diff: diff ?? null,
      requestId: c.req.header('x-request-id') ?? c.get('requestId') ?? null,
      ip: c.req.header('cf-connecting-ip') ?? null,
    });
  }

  // ---- P1.4: forced password rotation endpoints -----------------------------
  // Both are allowlisted past the app-level mustChangePassword guard so a
  // flagged account can (only) check its state and clear the flag by rotating.
  r.get('/users/me/password-state', async (c) => {
    const s = await sessionGuard(c);
    if (s instanceof Response) return s;
    const row = (await db.select({ f: user.mustChangePassword }).from(user).where(eq(user.id, s.user.id)).limit(1))[0];
    return c.json({ mustChangePassword: Boolean(row?.f) });
  });

  r.post('/users/me/accept-password', async (c) => {
    const s = await sessionGuard(c);
    if (s instanceof Response) return s;
    // Clear only after Better Auth's change-password succeeded — the SPA calls
    // this right after POST /auth/change-password with the temporary credential.
    await db.update(user).set({ mustChangePassword: false, updatedAt: new Date() }).where(eq(user.id, s.user.id));
    await auditRow(c, s.user.id, 'user.password-rotated', s.user.id, { invitedRotation: true });
    return c.json({ ok: true });
  });

  // GET /api/v1/admin/users
  r.get('/users', async (c) => {
    const s = await superAdminGuard(c);
    if (s instanceof Response) return s;
    const q = (c.req.query('q') ?? '').trim();
    const role = c.req.query('role');
    const limit = Math.min(Number(c.req.query('limit') ?? 100) || 100, 200);
    const page = Math.max(Number(c.req.query('page') ?? 1) || 1, 1);
    const rawOffset = c.req.query('offset');
    const offset = rawOffset !== undefined && !isNaN(Number(rawOffset))
      ? Math.max(Number(rawOffset), 0)
      : (page - 1) * limit;

    const filters = [];
    if (q) {
      const sanitized = `%${q.replace(/[%_]/g, '')}%`;
      filters.push(or(ilike(user.name, sanitized), ilike(user.email, sanitized)));
    }
    if (role && ['super_admin', 'admin', 'editor', 'author', 'viewer'].includes(role)) {
      filters.push(eq(user.role, role as any));
    }

    const lastActiveSub = db
      .select({
        userId: session.userId,
        lastActiveAt: sql<Date>`max(${session.updatedAt})`.as('last_active_at'),
      })
      .from(session)
      .groupBy(session.userId)
      .as('last_active_sub');

    const [totalRow] = await db.select({ n: count() }).from(user).where(filters.length ? and(...filters) : undefined);
    const total = Number(totalRow?.n ?? 0);

    const rows = await db.select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      banned: user.banned,
      banReason: user.banReason,
      banExpires: user.banExpires,
      image: user.image,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastActiveAt: lastActiveSub.lastActiveAt,
    }).from(user)
      .leftJoin(lastActiveSub, eq(user.id, lastActiveSub.userId))
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(user.createdAt), desc(user.id))
      .limit(limit)
      .offset(offset);

    return c.json({ items: rows, total, page, limit, offset });
  });

  /** 0024: directory analytics — IAM visibility dashboard: role distribution,
   *  MFA coverage, active sessions, suspended count, 14-day join trend. */
  r.get('/users/analytics', async (c) => {
    const s = await superAdminGuard(c);
    if (s instanceof Response) return s;
    const [byRole, mfa, suspended, activeSessions] = await Promise.all([
      db.select({ role: user.role, n: count() }).from(user).groupBy(user.role),
      db.select({
        total: count(),
        withMfa: sql<number>`count(*) filter (where ${user.twoFactorEnabled})`,
        verified: sql<number>`count(*) filter (where ${user.emailVerified})`,
      }).from(user),
      db.select({ n: count() }).from(user).where(eq(user.banned, true)),
      db.select({ n: count() }).from(session).where(sql`${session.expiresAt} > now()`),
    ]);
    const joins = await db.select({ d: sql<string>`to_char(${user.createdAt}, 'YYYY-MM-DD')`, n: count() })
      .from(user).where(sql`${user.createdAt} > now() - interval '13 days'`)
      .groupBy(sql`to_char(${user.createdAt}, 'YYYY-MM-DD')`);
    const series: Array<{ d: string; n: number }> = [];
    for (let i = 13; i >= 0; i--) {
      const key = new Date(Date.now() - i * 86400_000).toISOString().slice(0, 10);
      series.push({ d: key, n: Number(joins.find((x) => x.d === key)?.n ?? 0) });
    }
    const total = Number(mfa[0]?.total ?? 0) || 1;
    return c.json({
      total: Number(mfa[0]?.total ?? 0),
      byRole: byRole.map((x) => ({ role: x.role, n: Number(x.n) })),
      mfaCoverage: Math.round((Number(mfa[0]?.withMfa ?? 0) / total) * 100),
      emailVerified: Number(mfa[0]?.verified ?? 0),
      suspended: Number(suspended[0]?.n ?? 0),
      activeSessions: Number(activeSessions[0]?.n ?? 0),
      series,
    });
  });

  /** 0024: per-user security profile — active session count + the user's
   *  recent audited actions (access-review visibility). super_admin only. */
  r.get('/users/:id/activity', async (c) => {
    const s = await superAdminGuard(c);
    if (s instanceof Response) return s;
    const id = c.req.param('id');
    const row = (await db.select().from(user).where(eq(user.id, id)).limit(1))[0];
    if (!row) return c.json({ error: 'Not Found', title: 'User not found', status: 404 }, 404, { 'Content-Type': P });
    const [sess] = await db.select({ n: count() }).from(session)
      .where(and(eq(session.userId, id), sql`${session.expiresAt} > now()`));
    const activity = await db.select({
      id: auditLog.id, action: auditLog.action, entity: auditLog.entity, entityId: auditLog.entityId,
      ip: auditLog.ip, at: auditLog.at,
    }).from(auditLog).where(eq(auditLog.actorId, id)).orderBy(desc(auditLog.id)).limit(20);
    return c.json({
      id,
      email: row.email, name: row.name, role: row.role,
      twoFactorEnabled: row.twoFactorEnabled, banned: row.banned, banReason: row.banReason,
      emailVerified: row.emailVerified, createdAt: row.createdAt, updatedAt: row.updatedAt,
      activeSessions: Number(sess?.n ?? 0),
      activity,
    });
  });

  // POST /api/v1/admin/users/invite
  r.post('/users/invite', async (c) => {
    const s = await superAdminGuard(c);
    if (s instanceof Response) return s;
    const parsed = inviteSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });

    const existing = await db.select().from(user).where(ilike(user.email, parsed.data.email)).limit(1);
    if (existing[0]) {
      return c.json(problem(409, 'User already exists', 'An account with this email address already exists.'), 409, { 'Content-Type': P });
    }

    // P1.4 (CWE-338, audit finding U-5/F-2): 100% CSPRNG material — two UUID
    // segments ≈ 96 bits (NIST 800-63B-compliant generated secret). The old
    // form mixed in Math.random() digits (~42 bits total). Accounts invited
    // with a generated password are flagged mustChangePassword and locked out
    // of /admin until they set their own (guard in app.ts).
    const generated = !parsed.data.password;
    const tempPassword = parsed.data.password || ('TwinMOS-' + crypto.randomUUID().slice(0, 8) + '!' + crypto.randomUUID().slice(0, 8));
    try {
      const res = await deps.auth.api.createUser({
        body: {
          email: parsed.data.email,
          password: tempPassword,
          name: parsed.data.name,
          role: parsed.data.role,
        },
      });
      const createdUser = res.user ?? res;
      await db.update(user).set({ role: parsed.data.role, ...(generated ? { mustChangePassword: true } : {}) }).where(eq(user.id, createdUser.id));
      await auditRow(c, s.user.id, 'user.invite', createdUser.id, { email: parsed.data.email, role: parsed.data.role, name: parsed.data.name, generatedCredential: generated });

      // Dispatch staff invitation email containing login instructions and temporary credentials
      const emailSent = await sendStaffInviteMail(
        parsed.data.email,
        parsed.data.name,
        parsed.data.role,
        parsed.data.password ? undefined : tempPassword,
      );

      return c.json({
        user: { ...createdUser, role: parsed.data.role },
        temporaryPassword: parsed.data.password ? undefined : tempPassword,
        emailSent,
      }, 201);
    } catch (err: any) {
      console.error('[users.invite] error', err);
      if (err?.message?.toLowerCase().includes('already exists') || err?.code === '23505' || String(err).includes('unique')) {
        return c.json(problem(409, 'User already exists', 'An account with this email address already exists.'), 409, { 'Content-Type': P });
      }
      return c.json(problem(400, 'Failed to create user', err?.message), 400, { 'Content-Type': P });
    }
  });

  // PATCH /api/v1/admin/users/:id/role
  r.patch('/users/:id/role', async (c) => {
    const s = await superAdminGuard(c);
    if (s instanceof Response) return s;
    const id = c.req.param('id');
    const parsed = roleSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });

    const result = await superAdminGovernanceLock.runExclusive(async () => {
      return db.transaction(async (tx) => {
        const targetRows = await tx.select().from(user).where(eq(user.id, id)).for('update');
        const target = targetRows[0];
        if (!target) return { status: 404, error: problem(404, 'User not found') };

        const isTargetActiveSuper = target.role === 'super_admin' && !target.banned;
        if (isTargetActiveSuper && parsed.data.role !== 'super_admin') {
          // Lock all active super_admins to serialize and prevent parallel race condition demotions
          const superRows = await tx
            .select({ id: user.id })
            .from(user)
            .where(and(eq(user.role, 'super_admin'), or(eq(user.banned, false), isNull(user.banned))))
            .for('update');

          if (superRows.length <= 1) {
            return {
              status: 409,
              error: problem(
                409,
                'Cannot demote the last super_admin',
                'The system must retain at least one active super_admin.',
              ),
            };
          }
        }

        const updated = await tx
          .update(user)
          .set({ role: parsed.data.role, updatedAt: new Date() })
          .where(eq(user.id, id))
          .returning();

        // Terminate existing sessions so changed permissions take immediate effect
        await tx.delete(session).where(eq(session.userId, id));
        return { status: 200, user: updated[0], previousRole: target.role };
      });
    });

    if (result.status !== 200) {
      return c.json(result.error, result.status as 400 | 404 | 409, { 'Content-Type': P });
    }

    await auditRow(c, s.user.id, 'user.role_change', id, { from: result.previousRole, to: parsed.data.role });
    return c.json({ user: result.user });
  });

  // POST /api/v1/admin/users/:id/revoke-sessions
  r.post('/users/:id/revoke-sessions', async (c) => {
    const s = await superAdminGuard(c);
    if (s instanceof Response) return s;
    const id = c.req.param('id');
    if (id === s.user.id) {
      return c.json(problem(400, 'Cannot revoke own session', 'Use sign-out to end your current session.'), 400, { 'Content-Type': P });
    }
    const target = await db.select().from(user).where(eq(user.id, id)).limit(1);
    if (!target[0]) return c.json(problem(404, 'User not found'), 404, { 'Content-Type': P });

    const deleted = await db.delete(session).where(eq(session.userId, id)).returning();
    await auditRow(c, s.user.id, 'user.revoke_sessions', id, { revokedCount: deleted.length });
    return c.json({ revoked: true, count: deleted.length });
  });

  // POST /api/v1/admin/users/:id/ban
  r.post('/users/:id/ban', async (c) => {
    const s = await superAdminGuard(c);
    if (s instanceof Response) return s;
    const id = c.req.param('id');
    if (id === s.user.id) {
      return c.json(problem(400, 'Cannot ban yourself', 'Super administrators cannot suspend their own account.'), 400, { 'Content-Type': P });
    }

    const body = (await c.req.json().catch(() => ({}))) as { reason?: string; expiresIn?: number };
    const banReason = body?.reason ? String(body.reason).trim().slice(0, 500) : 'Suspended by super_admin';
    const banExpires = body?.expiresIn && Number(body.expiresIn) > 0 ? new Date(Date.now() + Number(body.expiresIn) * 1000) : null;

    const result = await superAdminGovernanceLock.runExclusive(async () => {
      return db.transaction(async (tx) => {
        const targetRows = await tx.select().from(user).where(eq(user.id, id)).for('update');
        const target = targetRows[0];
        if (!target) return { status: 404, error: problem(404, 'User not found') };

        const isTargetActiveSuper = target.role === 'super_admin' && !target.banned;
        if (isTargetActiveSuper) {
          const superRows = await tx
            .select({ id: user.id })
            .from(user)
            .where(and(eq(user.role, 'super_admin'), or(eq(user.banned, false), isNull(user.banned))))
            .for('update');

          if (superRows.length <= 1) {
            return {
              status: 409,
              error: problem(
                409,
                'Cannot ban the last active super_admin',
                'The system must retain at least one active super_admin.',
              ),
            };
          }
        }

        const updated = await tx
          .update(user)
          .set({
            banned: true,
            banReason,
            banExpires,
            updatedAt: new Date(),
          })
          .where(eq(user.id, id))
          .returning();

        // Terminate all active sessions
        await tx.delete(session).where(eq(session.userId, id));
        return { status: 200, user: updated[0] };
      });
    });

    if (result.status !== 200) {
      return c.json(result.error, result.status as 400 | 404 | 409, { 'Content-Type': P });
    }

    await auditRow(c, s.user.id, 'user.ban', id, { reason: banReason, banExpires });
    return c.json({ banned: true, user: result.user });
  });

  // POST /api/v1/admin/users/:id/unban
  r.post('/users/:id/unban', async (c) => {
    const s = await superAdminGuard(c);
    if (s instanceof Response) return s;
    const id = c.req.param('id');
    const target = await db.select().from(user).where(eq(user.id, id)).limit(1);
    if (!target[0]) return c.json(problem(404, 'User not found'), 404, { 'Content-Type': P });

    const updated = await db.update(user).set({
      banned: false,
      banReason: null,
      banExpires: null,
      updatedAt: new Date(),
    }).where(eq(user.id, id)).returning();

    await auditRow(c, s.user.id, 'user.unban', id, {});
    return c.json({ unbanned: true, user: updated[0] });
  });

  return r;
}
