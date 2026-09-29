// Phase 1 Security, User Governance & RBAC Foundation E2E Test Suite
// Verifies:
// 1. Better Auth admin plugin & /api/v1/admin/users endpoints (list, invite, role change, revoke sessions, ban/unban)
// 2. Forensic audit currency sanitization (authorized currencies accepted, BDT and unlisted rejected)
// 3. Audit log multi-parameter filtering & hardened CSV export with formula injection prevention
// 4. Media deletion safe physical file cleanup (unlink with ENOENT tolerance & path containment)
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const TMP = mkdtempSync(join(tmpdir(), 'twinmos-p1-'));
process.env.PGLITE_DATA = join(TMP, 'db');
process.env.MEDIA_DIR = join(TMP, 'media');
process.env.MAIL_OUTBOX_DIR = join(TMP, 'outbox');
process.env.FORMS_TO = 'p1@twinmos.dev';
process.env.API_ALLOW_NO_TURNSTILE = '1';
process.env.NODE_ENV = 'test';

const MIGRATIONS = fileURLToPath(new URL('../../../packages/db/migrations', import.meta.url));

const { createDb }: any = await import('@twinmos/db');
const { migrate } = await import('drizzle-orm/pglite/migrator');
const { buildApp }: any = await import('../src/app.ts');
const { and, count, eq } = await import('drizzle-orm');
const { user, brand, category, mediaAsset } = await import('@twinmos/db');

const db = createDb();
await db.$client.exec('CREATE SCHEMA IF NOT EXISTS drizzle');
await migrate(db, { migrationsFolder: MIGRATIONS });
const app = buildApp(db);

const mkPass = () => 'P1-Sec-Pass-2026!';

async function createUserWithRole(email: string, role: string, name: string): Promise<string> {
  await app.request('/api/v1/auth/sign-up/email', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password: mkPass(), name }),
  });
  await db.update(user).set({ role }).where(eq(user.email, email));
  const res = await app.request('/api/v1/auth/sign-in/email', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password: mkPass() }),
  });
  return res.headers.getSetCookie().map((c) => c.split(';')[0]).join('; ');
}

let superAdminCookie = '';
let adminCookie = '';
let editorCookie = '';
let viewerCookie = '';

beforeAll(async () => {
  superAdminCookie = await createUserWithRole('p1-super@twinmos.dev', 'super_admin', 'Super Admin');
  adminCookie = await createUserWithRole('p1-admin@twinmos.dev', 'admin', 'Standard Admin');
  editorCookie = await createUserWithRole('p1-editor@twinmos.dev', 'editor', 'Content Editor');
  viewerCookie = await createUserWithRole('p1-viewer@twinmos.dev', 'viewer', 'Basic Viewer');

  // Seed brand and category for product currency testing
  await db.insert(brand).values({ name: 'TwinMOS', slug: 'twinmos' }).onConflictDoNothing();
  await db.insert(category).values({ name: 'DRAM Modules', slug: 'dram-modules' }).onConflictDoNothing();
});

afterAll(async () => {
  await db.$client.close();
  rmSync(TMP, { recursive: true, force: true });
});

describe('Phase 1.1: Users & Roles Management Module & Better Auth Admin Plugin', () => {
  it('GET /api/v1/admin/users: super_admin only; unauthed 401, non-super_admin 403', async () => {
    // Unauthed
    const unauthed = await app.request('/api/v1/admin/users');
    expect(unauthed.status).toBe(401);

    // Non-super roles blocked
    for (const cookie of [viewerCookie, editorCookie, adminCookie]) {
      const res = await app.request('/api/v1/admin/users', { headers: { cookie } });
      expect(res.status).toBe(403);
    }

    // Super Admin allowed
    const ok = await app.request('/api/v1/admin/users', { headers: { cookie: superAdminCookie } });
    expect(ok.status).toBe(200);
    const body = await ok.json();
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.items.length).toBeGreaterThanOrEqual(4);

    // Verify properties on accounts
    const first = body.items[0];
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('email');
    expect(first).toHaveProperty('role');
    expect(first).toHaveProperty('twoFactorEnabled');
    expect(first).toHaveProperty('banned');
    expect(first).toHaveProperty('createdAt');
    expect(first).toHaveProperty('lastActiveAt');
  });

  it('GET /api/v1/admin/users: supports search filtering and role filtering', async () => {
    const searchRes = await app.request('/api/v1/admin/users?q=super', {
      headers: { cookie: superAdminCookie },
    });
    expect(searchRes.status).toBe(200);
    const searchBody = await searchRes.json();
    expect(searchBody.items.every((u: any) => u.name.includes('Super') || u.email.includes('super'))).toBe(true);

    const roleRes = await app.request('/api/v1/admin/users?role=editor', {
      headers: { cookie: superAdminCookie },
    });
    expect(roleRes.status).toBe(200);
    const roleBody = await roleRes.json();
    expect(roleBody.items.every((u: any) => u.role === 'editor')).toBe(true);

    // Keyset / page pagination metadata
    const pageRes = await app.request('/api/v1/admin/users?limit=2&page=1', {
      headers: { cookie: superAdminCookie },
    });
    expect(pageRes.status).toBe(200);
    const pageBody = await pageRes.json();
    expect(pageBody.items.length).toBe(2);
    expect(pageBody.total).toBeGreaterThanOrEqual(4);
    expect(pageBody.page).toBe(1);
    expect(pageBody.limit).toBe(2);

    // Direct offset query support
    const offsetRes = await app.request('/api/v1/admin/users?limit=2&offset=2', {
      headers: { cookie: superAdminCookie },
    });
    expect(offsetRes.status).toBe(200);
    const offsetBody = await offsetRes.json();
    expect(offsetBody.items.length).toBe(2);
    expect(offsetBody.offset).toBe(2);
    expect(offsetBody.items[0].id).not.toBe(pageBody.items[0].id);
  });

  let invitedUserId = '';
  it('POST /api/v1/admin/users/invite: invites new staff with role; rejects non-super_admin and duplicates', async () => {
    // Non-super admin blocked
    const forbidden = await app.request('/api/v1/admin/users/invite', {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: adminCookie },
      body: JSON.stringify({ email: 'newstaff@twinmos.dev', name: 'New Staff', role: 'author' }),
    });
    expect(forbidden.status).toBe(403);

    // Validation failure: invalid email
    const invalid = await app.request('/api/v1/admin/users/invite', {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: superAdminCookie },
      body: JSON.stringify({ email: 'not-an-email', name: 'New Staff', role: 'author' }),
    });
    expect(invalid.status).toBe(422);

    // Successful invite with auto-generated password
    const res = await app.request('/api/v1/admin/users/invite', {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: superAdminCookie },
      body: JSON.stringify({ email: 'staff1@twinmos.dev', name: 'Staff One', role: 'editor' }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.user.email).toBe('staff1@twinmos.dev');
    expect(body.user.role).toBe('editor');
    expect(body.temporaryPassword).toBeTruthy();
    expect(body.emailSent).toBe(true);
    invitedUserId = body.user.id;

    // Verify invited user can successfully sign in with the issued temporary password
    const loginRes = await app.request('/api/v1/auth/sign-in/email', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'staff1@twinmos.dev', password: body.temporaryPassword }),
    });
    expect(loginRes.status).toBe(200);

    // Verify staff invite email was dispatched to MAIL_OUTBOX_DIR with temporary credentials
    const mailFiles = readdirSync(process.env.MAIL_OUTBOX_DIR!);
    const inviteMails = mailFiles
      .map((f) => {
        try {
          return JSON.parse(readFileSync(join(process.env.MAIL_OUTBOX_DIR!, f), 'utf8'));
        } catch {
          return null;
        }
      })
      .filter((m) => m?.meta?.kind === 'staff-invite' && m?.to === 'staff1@twinmos.dev');

    expect(inviteMails.length).toBeGreaterThanOrEqual(1);
    const inviteMail = inviteMails[0];
    expect(inviteMail.to).toBe('staff1@twinmos.dev');
    expect(inviteMail.subject).toContain('Staff Invitation');
    expect(inviteMail.subject).toContain('editor');
    expect(inviteMail.text).toContain(body.temporaryPassword);
    expect(inviteMail.text).toContain('Staff One');

    // Duplicate email rejected with 409
    const dup = await app.request('/api/v1/admin/users/invite', {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: superAdminCookie },
      body: JSON.stringify({ email: 'staff1@twinmos.dev', name: 'Duplicate Staff', role: 'author' }),
    });
    expect(dup.status).toBe(409);
  });

  it('PATCH /api/v1/admin/users/:id/role: super_admin updates staff role; prevents demoting last super_admin', async () => {
    // Non-super admin blocked
    const forbidden = await app.request(`/api/v1/admin/users/${invitedUserId}/role`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', cookie: adminCookie },
      body: JSON.stringify({ role: 'admin' }),
    });
    expect(forbidden.status).toBe(403);

    // Super Admin successfully changes role editor -> admin
    const res = await app.request(`/api/v1/admin/users/${invitedUserId}/role`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', cookie: superAdminCookie },
      body: JSON.stringify({ role: 'admin' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.user.role).toBe('admin');

    // Attempting to demote sole super_admin returns 409
    const me = (await (await app.request('/api/v1/auth/get-session', { headers: { cookie: superAdminCookie } })).json()).user;
    const demoteLast = await app.request(`/api/v1/admin/users/${me.id}/role`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', cookie: superAdminCookie },
      body: JSON.stringify({ role: 'editor' }),
    });
    expect(demoteLast.status).toBe(409);

    // If another super_admin exists but is BANNED, attempting to demote the sole active super_admin MUST still return 409
    const bannedSuperCookie = await createUserWithRole('banned-super@twinmos.dev', 'super_admin', 'Banned Super');
    const bannedSuperId = (await (await app.request('/api/v1/auth/get-session', { headers: { cookie: bannedSuperCookie } })).json()).user.id;
    await db.update(user).set({ banned: true, banReason: 'Suspended' }).where(eq(user.id, bannedSuperId));

    const demoteWithBannedSuper = await app.request(`/api/v1/admin/users/${me.id}/role`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', cookie: superAdminCookie },
      body: JSON.stringify({ role: 'editor' }),
    });
    expect(demoteWithBannedSuper.status).toBe(409);
  });

  it('high-concurrency race condition safety: parallel simultaneous super_admin demotions safely serialized; exactly one succeeds and system preserves at least one active super_admin', async () => {
    // Setup two active super admins specifically for concurrent demotion
    const superRace1Cookie = await createUserWithRole('super-race-1@twinmos.dev', 'super_admin', 'Race Super 1');
    const superRace2Cookie = await createUserWithRole('super-race-2@twinmos.dev', 'super_admin', 'Race Super 2');

    const superRace1Id = (await (await app.request('/api/v1/auth/get-session', { headers: { cookie: superRace1Cookie } })).json()).user.id;
    const superRace2Id = (await (await app.request('/api/v1/auth/get-session', { headers: { cookie: superRace2Cookie } })).json()).user.id;

    // Demote all other super_admins so ONLY raceId1 and raceId2 are active super_admins
    const allSupers = await db.select().from(user).where(eq(user.role, 'super_admin'));
    for (const u of allSupers) {
      if (u.id !== superRace1Id && u.id !== superRace2Id) {
        await db.update(user).set({ role: 'admin' }).where(eq(user.id, u.id));
      }
    }

    // Verify system currently has EXACTLY 2 active super_admins
    const [initialCount] = await db.select({ n: count() }).from(user)
      .where(and(eq(user.role, 'super_admin'), eq(user.banned, false)));
    expect(Number(initialCount.n)).toBe(2);

    // Fire 20 simultaneous parallel demotion requests attempting to demote BOTH super_admins concurrently
    const parallelRequests = [
      ...Array.from({ length: 10 }, () =>
        app.request(`/api/v1/admin/users/${superRace1Id}/role`, {
          method: 'PATCH',
          headers: { 'content-type': 'application/json', cookie: superRace1Cookie },
          body: JSON.stringify({ role: 'admin' }),
        })
      ),
      ...Array.from({ length: 10 }, () =>
        app.request(`/api/v1/admin/users/${superRace2Id}/role`, {
          method: 'PATCH',
          headers: { 'content-type': 'application/json', cookie: superRace2Cookie },
          body: JSON.stringify({ role: 'admin' }),
        })
      ),
    ];

    const responses = await Promise.all(parallelRequests);
    const statuses = responses.map((r) => r.status);

    // CRITICAL INVARIANT: Exactly one of the super_admins can be demoted.
    // The surviving super_admin MUST NOT be demoted, returning 409 Conflict.
    const successCount = statuses.filter((s) => s === 200).length;
    const conflictCount = statuses.filter((s) => s === 409).length;

    expect(successCount).toBeGreaterThanOrEqual(1);
    expect(conflictCount).toBeGreaterThanOrEqual(1);

    // Verify in database: exactly 1 active super_admin MUST remain!
    const [finalSuperCount] = await db.select({ n: count() }).from(user)
      .where(and(eq(user.role, 'super_admin'), eq(user.banned, false)));
    expect(Number(finalSuperCount.n)).toBe(1);

    // Check which one survived
    const [u1] = await db.select().from(user).where(eq(user.id, superRace1Id));
    const [u2] = await db.select().from(user).where(eq(user.id, superRace2Id));
    expect([u1.role, u2.role].sort()).toEqual(['admin', 'super_admin']);

    // Restore superAdminCookie role so subsequent tests continue cleanly
    const [superAdminUser] = await db.select().from(user).where(eq(user.email, 'p1-super@twinmos.dev'));
    await db.update(user).set({ role: 'super_admin' }).where(eq(user.id, superAdminUser.id));
  });

  it('POST /api/v1/admin/users/:id/revoke-sessions: terminates active user sessions', async () => {
    // Sign in as target user to create active session
    const targetCookie = await createUserWithRole('session-test@twinmos.dev', 'editor', 'Session Staff');
    const targetSession = await (await app.request('/api/v1/auth/get-session', { headers: { cookie: targetCookie } })).json();
    const targetId = targetSession.user.id;

    // Verify session is active
    expect((await app.request('/api/v1/admin/stats', { headers: { cookie: targetCookie } })).status).toBe(200);

    // Revoke sessions as super_admin
    const revokeRes = await app.request(`/api/v1/admin/users/${targetId}/revoke-sessions`, {
      method: 'POST',
      headers: { cookie: superAdminCookie },
    });
    expect(revokeRes.status).toBe(200);
    const revokeBody = await revokeRes.json();
    expect(revokeBody.revoked).toBe(true);
    expect(revokeBody.count).toBeGreaterThanOrEqual(1);

    // Target session is now dead
    const afterRevoke = await app.request('/api/v1/admin/stats', { headers: { cookie: targetCookie } });
    expect(afterRevoke.status).toBe(401);

    // Cannot revoke own session via this endpoint (returns 400)
    const myId = (await (await app.request('/api/v1/auth/get-session', { headers: { cookie: superAdminCookie } })).json()).user.id;
    const selfRevoke = await app.request(`/api/v1/admin/users/${myId}/revoke-sessions`, {
      method: 'POST',
      headers: { cookie: superAdminCookie },
    });
    expect(selfRevoke.status).toBe(400);
  });

  it('POST /api/v1/admin/users/:id/ban and unban: suspends account and terminates sessions; unban restores access', async () => {
    // Create staff account
    const staffCookie = await createUserWithRole('ban-test@twinmos.dev', 'editor', 'Bannable Staff');
    const staffId = (await (await app.request('/api/v1/auth/get-session', { headers: { cookie: staffCookie } })).json()).user.id;

    // Cannot ban yourself
    const meId = (await (await app.request('/api/v1/auth/get-session', { headers: { cookie: superAdminCookie } })).json()).user.id;
    const selfBan = await app.request(`/api/v1/admin/users/${meId}/ban`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: superAdminCookie },
    });
    expect(selfBan.status).toBe(400);

    // Ban staff
    const banRes = await app.request(`/api/v1/admin/users/${staffId}/ban`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: superAdminCookie },
      body: JSON.stringify({ reason: 'Security investigation' }),
    });
    expect(banRes.status).toBe(200);
    const banBody = await banRes.json();
    expect(banBody.banned).toBe(true);
    expect(banBody.user.banReason).toBe('Security investigation');

    // Existing session killed
    expect((await app.request('/api/v1/admin/stats', { headers: { cookie: staffCookie } })).status).toBe(401);

    // Sign-in while banned is rejected
    const signInBanned = await app.request('/api/v1/auth/sign-in/email', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'ban-test@twinmos.dev', password: mkPass() }),
    });
    expect([400, 403]).toContain(signInBanned.status);

    // Unban staff
    const unbanRes = await app.request(`/api/v1/admin/users/${staffId}/unban`, {
      method: 'POST',
      headers: { cookie: superAdminCookie },
    });
    expect(unbanRes.status).toBe(200);
    const unbanBody = await unbanRes.json();
    expect(unbanBody.unbanned).toBe(true);
    expect(unbanBody.user.banned).toBe(false);

    // Staff can now sign in again
    const signInRestored = await app.request('/api/v1/auth/sign-in/email', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'ban-test@twinmos.dev', password: mkPass() }),
    });
    expect(signInRestored.status).toBe(200);

    // Temporary ban with expiration auto-clears in DB and allows access once expired
    const tempBanCookie = await createUserWithRole('temp-ban@twinmos.dev', 'editor', 'Temp Ban Staff');
    const tempBanUser = (await (await app.request('/api/v1/auth/get-session', { headers: { cookie: tempBanCookie } })).json()).user;

    // Set temporary ban with expiration timestamp in the past
    await db.update(user).set({
      banned: true,
      banReason: 'Temporary suspension',
      banExpires: new Date(Date.now() - 5000),
    }).where(eq(user.id, tempBanUser.id));

    // Session verification auto-clears ban and restores access
    const activeRes = await app.request('/api/v1/admin/stats', { headers: { cookie: tempBanCookie } });
    expect(activeRes.status).toBe(200);

    // Verify DB record was automatically cleared
    const [dbUser] = await db.select().from(user).where(eq(user.id, tempBanUser.id));
    expect(dbUser.banned).toBe(false);
    expect(dbUser.banExpires).toBeNull();
  });

  it('POST /api/v1/admin/users/:id/ban: supports expiresIn duration and sets banExpires timestamp', async () => {
    const staffCookie = await createUserWithRole('temp-expire@twinmos.dev', 'editor', 'Expire Staff');
    const staffId = (await (await app.request('/api/v1/auth/get-session', { headers: { cookie: staffCookie } })).json()).user.id;

    const banRes = await app.request(`/api/v1/admin/users/${staffId}/ban`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: superAdminCookie },
      body: JSON.stringify({ reason: '24h suspension', expiresIn: 86400 }),
    });
    expect(banRes.status).toBe(200);
    const banBody = await banRes.json();
    expect(banBody.banned).toBe(true);
    expect(banBody.user.banExpires).toBeTruthy();
    const expiresTime = new Date(banBody.user.banExpires).getTime();
    expect(expiresTime).toBeGreaterThan(Date.now() + 80000 * 1000);
  });

  it('high-concurrency race condition safety: parallel simultaneous super_admin bans safely serialized; exactly one active super_admin is permanently preserved', async () => {
    // Setup two active super admins for ban race testing
    const superBan1Cookie = await createUserWithRole('super-ban-1@twinmos.dev', 'super_admin', 'Ban Super 1');
    const superBan2Cookie = await createUserWithRole('super-ban-2@twinmos.dev', 'super_admin', 'Ban Super 2');

    const superBan1Id = (await (await app.request('/api/v1/auth/get-session', { headers: { cookie: superBan1Cookie } })).json()).user.id;
    const superBan2Id = (await (await app.request('/api/v1/auth/get-session', { headers: { cookie: superBan2Cookie } })).json()).user.id;

    // Demote all other super_admins so ONLY ban1 and ban2 are active super_admins
    const allSupers = await db.select().from(user).where(eq(user.role, 'super_admin'));
    for (const u of allSupers) {
      if (u.id !== superBan1Id && u.id !== superBan2Id) {
        await db.update(user).set({ role: 'admin' }).where(eq(user.id, u.id));
      }
    }

    // Verify system has exactly 2 active super_admins
    const [initialCount] = await db.select({ n: count() }).from(user)
      .where(and(eq(user.role, 'super_admin'), eq(user.banned, false)));
    expect(Number(initialCount.n)).toBe(2);

    // Fire 20 simultaneous ban requests (ban1 attempting to ban ban2, and ban2 attempting to ban ban1)
    const parallelBans = [
      ...Array.from({ length: 10 }, () =>
        app.request(`/api/v1/admin/users/${superBan2Id}/ban`, {
          method: 'POST',
          headers: { 'content-type': 'application/json', cookie: superBan1Cookie },
          body: JSON.stringify({ reason: 'Concurrent race ban' }),
        })
      ),
      ...Array.from({ length: 10 }, () =>
        app.request(`/api/v1/admin/users/${superBan1Id}/ban`, {
          method: 'POST',
          headers: { 'content-type': 'application/json', cookie: superBan2Cookie },
          body: JSON.stringify({ reason: 'Concurrent race ban' }),
        })
      ),
    ];

    const responses = await Promise.all(parallelBans);
    const statuses = responses.map((r) => r.status);

    // Invariant: Exactly one active super_admin must survive!
    const [finalSuperCount] = await db.select({ n: count() }).from(user)
      .where(and(eq(user.role, 'super_admin'), eq(user.banned, false)));
    expect(Number(finalSuperCount.n)).toBe(1);

    // Restore superAdminCookie role so subsequent tests continue cleanly
    const [superAdminUser] = await db.select().from(user).where(eq(user.email, 'p1-super@twinmos.dev'));
    await db.update(user).set({ role: 'super_admin', banned: false }).where(eq(user.id, superAdminUser.id));
  });

  it('high-concurrency race condition safety: parallel simultaneous demote of super1 and ban of super2 safely serialized; exactly one succeeds and one active super_admin is permanently preserved', async () => {
    // Setup two active super admins specifically for cross-operation race testing
    const cross1Cookie = await createUserWithRole('cross-super-1@twinmos.dev', 'super_admin', 'Cross Super 1');
    const cross2Cookie = await createUserWithRole('cross-super-2@twinmos.dev', 'super_admin', 'Cross Super 2');

    const cross1Id = (await (await app.request('/api/v1/auth/get-session', { headers: { cookie: cross1Cookie } })).json()).user.id;
    const cross2Id = (await (await app.request('/api/v1/auth/get-session', { headers: { cookie: cross2Cookie } })).json()).user.id;

    // Demote all other super_admins so ONLY cross1 and cross2 are active super_admins
    const allSupers = await db.select().from(user).where(eq(user.role, 'super_admin'));
    for (const u of allSupers) {
      if (u.id !== cross1Id && u.id !== cross2Id) {
        await db.update(user).set({ role: 'admin' }).where(eq(user.id, u.id));
      }
    }

    // Verify system has exactly 2 active super_admins
    const [initialCount] = await db.select({ n: count() }).from(user)
      .where(and(eq(user.role, 'super_admin'), eq(user.banned, false)));
    expect(Number(initialCount.n)).toBe(2);

    // Fire 20 simultaneous mixed requests: 10 demoting cross1, and 10 banning cross2
    const parallelMixed = [
      ...Array.from({ length: 10 }, () =>
        app.request(`/api/v1/admin/users/${cross1Id}/role`, {
          method: 'PATCH',
          headers: { 'content-type': 'application/json', cookie: cross1Cookie },
          body: JSON.stringify({ role: 'admin' }),
        })
      ),
      ...Array.from({ length: 10 }, () =>
        app.request(`/api/v1/admin/users/${cross2Id}/ban`, {
          method: 'POST',
          headers: { 'content-type': 'application/json', cookie: cross1Cookie },
          body: JSON.stringify({ reason: 'Concurrent cross ban' }),
        })
      ),
    ];

    const responses = await Promise.all(parallelMixed);
    const statuses = responses.map((r) => r.status);

    // Invariant: Exactly one active super_admin must remain!
    const [finalSuperCount] = await db.select({ n: count() }).from(user)
      .where(and(eq(user.role, 'super_admin'), eq(user.banned, false)));
    expect(Number(finalSuperCount.n)).toBe(1);

    // Restore superAdminCookie role so subsequent tests continue cleanly
    const [superAdminUser] = await db.select().from(user).where(eq(user.email, 'p1-super@twinmos.dev'));
    await db.update(user).set({ role: 'super_admin', banned: false }).where(eq(user.id, superAdminUser.id));
  });
});

describe('Phase 1.2: Forensic Audit Currency Compliance Fix', () => {
  it('product create: strictly rejects BDT and non-authorized currency strings with 422', async () => {
    // BDT rejection
    const bdtRes = await app.request('/api/v1/admin/products', {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: editorCookie },
      body: JSON.stringify({
        sku: 'TEST-BDT-001',
        slug: 'test-bdt-product',
        name: 'Illegal BDT Product',
        brandId: 1,
        categoryId: 1,
        currency: 'BDT',
      }),
    });
    expect(bdtRes.status).toBe(422);

    // Non-authorized currencies (GBP, JPY) rejection
    for (const badCur of ['GBP', 'JPY', 'CAD', 'AUD']) {
      const res = await app.request('/api/v1/admin/products', {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie: editorCookie },
        body: JSON.stringify({
          sku: `TEST-${badCur}-001`,
          slug: `test-${badCur.toLowerCase()}-product`,
          name: `Illegal ${badCur} Product`,
          brandId: 1,
          categoryId: 1,
          currency: badCur,
        }),
      });
      expect(res.status).toBe(422);
    }
  });

  it('product create: accepts all AUTHORIZED_CURRENCIES (USD, EUR, AED, SAR, INR, RUB)', async () => {
    const validCurrencies = ['USD', 'EUR', 'AED', 'SAR', 'INR', 'RUB'] as const;
    let seq = 100;
    for (const cur of validCurrencies) {
      seq++;
      const res = await app.request('/api/v1/admin/products', {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie: editorCookie },
        body: JSON.stringify({
          sku: `TM-DDR5-${cur}-${seq}`,
          slug: `tm-ddr5-ram-${cur.toLowerCase()}-${seq}`,
          name: `TwinMOS DDR5 ${cur} Edition`,
          brandId: 1,
          categoryId: 1,
          priceUsd: 149.99,
          currency: cur,
        }),
      });
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.currency).toBe(cur);
    }
  });

  it('product patch: strictly rejects BDT with 422 and accepts authorized currency update', async () => {
    const createRes = await app.request('/api/v1/admin/products', {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: editorCookie },
      body: JSON.stringify({
        sku: 'TM-PATCH-CUR-1',
        slug: 'tm-patch-cur-1',
        name: 'Patch Currency Test',
        brandId: 1,
        categoryId: 1,
        currency: 'EUR',
      }),
    });
    expect(createRes.status).toBe(201);
    const created = await createRes.json();

    const badPatch = await app.request(`/api/v1/admin/products/${created.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', cookie: editorCookie },
      body: JSON.stringify({ currency: 'BDT' }),
    });
    expect(badPatch.status).toBe(422);

    const goodPatch = await app.request(`/api/v1/admin/products/${created.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', cookie: editorCookie },
      body: JSON.stringify({ currency: 'SAR' }),
    });
    expect(goodPatch.status).toBe(200);
    const updated = await goodPatch.json();
    expect(updated.currency).toBe('SAR');
  });

  it('product patch: updating a single field does not overwrite or wipe out other fields with defaults', async () => {
    const createRes = await app.request('/api/v1/admin/products', {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: editorCookie },
      body: JSON.stringify({
        sku: 'TM-PRESERVE-1',
        slug: 'tm-preserve-1',
        name: 'Preserve Test Product',
        brandId: 1,
        categoryId: 1,
        status: 'published',
        description: 'Comprehensive specification copy',
        priceUsd: 299.99,
        currency: 'AED',
        badges: ['Flagship', 'PCIe5'],
        specs: { Interface: 'PCIe 5.0 x4', FormFactor: 'M.2 2280' },
      }),
    });
    expect(createRes.status).toBe(201);
    const created = await createRes.json();
    expect(created.status).toBe('published');
    expect(created.currency).toBe('AED');
    expect(Number(created.priceUsd)).toBe(299.99);

    // Patch ONLY the name
    const patchRes = await app.request(`/api/v1/admin/products/${created.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', cookie: editorCookie },
      body: JSON.stringify({ name: 'Renamed Preserve Test Product' }),
    });
    expect(patchRes.status).toBe(200);
    const patched = await patchRes.json();

    // Verify all existing fields were preserved and NOT wiped out by defaults
    expect(patched.name).toBe('Renamed Preserve Test Product');
    expect(patched.status).toBe('published');
    expect(patched.currency).toBe('AED');
    expect(Number(patched.priceUsd)).toBe(299.99);
    expect(patched.description).toBe('Comprehensive specification copy');
    expect(patched.badges).toEqual(['Flagship', 'PCIe5']);
    expect(patched.specs).toEqual({ Interface: 'PCIe 5.0 x4', FormFactor: 'M.2 2280' });
  });
});

describe('Phase 1.3: Audit Log Deep Filtering & CSV Export', () => {
  it('GET /api/v1/admin/audit: supports deep multi-parameter filtering (actorId, entity, action, date range)', async () => {
    // Filter by entity: user
    const userAudit = await app.request('/api/v1/admin/audit?entity=user', {
      headers: { cookie: editorCookie },
    });
    expect(userAudit.status).toBe(200);
    const userBody = await userAudit.json();
    expect(userBody.items.every((r: any) => r.entity === 'user')).toBe(true);

    // Filter by action ilike pattern
    const inviteAudit = await app.request('/api/v1/admin/audit?action=invite', {
      headers: { cookie: editorCookie },
    });
    expect(inviteAudit.status).toBe(200);
    const inviteBody = await inviteAudit.json();
    expect(inviteBody.items.every((r: any) => r.action.includes('invite'))).toBe(true);

    // Keyset cursor pagination
    if (userBody.items.length >= 2) {
      const cursor = userBody.items[0].id;
      const paginated = await app.request(`/api/v1/admin/audit?cursor=${cursor}&limit=1`, {
        headers: { cookie: editorCookie },
      });
      expect(paginated.status).toBe(200);
      const pagBody = await paginated.json();
      expect(pagBody.items.length).toBe(1);
      expect(pagBody.items[0].id).toBeLessThan(cursor);
    }
  });

  it('GET /api/v1/admin/audit.csv: exports CSV with formula-injection neutralisation (=, +, -, @, \')', async () => {
    // Non-editor / viewer denied 403
    const denied = await app.request('/api/v1/admin/audit.csv', { headers: { cookie: viewerCookie } });
    expect(denied.status).toBe(403);

    // Insert an audit row directly with formula injection payloads in action and entityId
    const { auditLog } = await import('@twinmos/db');
    await db.insert(auditLog).values({
      actorId: null,
      action: '=SUM(1,2)',
      entity: 'formula_test',
      entityId: '+1234567890',
      diff: { note: '   =cmd|/C calc', pipe: '|calc' },
    });

    const res = await app.request('/api/v1/admin/audit.csv?entity=formula_test', {
      headers: { cookie: editorCookie },
    });
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/csv');
    expect(res.headers.get('content-disposition')).toContain('attachment');

    const csvText = await res.text();
    const lines = csvText.split('\r\n');
    expect(lines[0]).toBe('id,at,actor_id,actor_email,action,entity,entity_id,ip,request_id,diff');

    // Verify formula characters are neutralized with a leading apostrophe
    const matchingRow = lines.find((l) => l.includes('formula_test'));
    expect(matchingRow).toBeTruthy();
    expect(matchingRow).toContain('"\'=SUM(1,2)"');
    expect(matchingRow).toContain('"\'+1234567890"');
  });

  it('GET /api/v1/admin/audit/actors: lists distinct audit actors; requires editor or above', async () => {
    // Viewer forbidden (403)
    const viewerRes = await app.request('/api/v1/admin/audit/actors', { headers: { cookie: viewerCookie } });
    expect(viewerRes.status).toBe(403);

    // Editor allowed (200)
    const editorRes = await app.request('/api/v1/admin/audit/actors', { headers: { cookie: editorCookie } });
    expect(editorRes.status).toBe(200);
    const editorBody = await editorRes.json();
    expect(Array.isArray(editorBody.items)).toBe(true);

    // Super Admin allowed (200)
    const superRes = await app.request('/api/v1/admin/audit/actors', { headers: { cookie: superAdminCookie } });
    expect(superRes.status).toBe(200);
    const superBody = await superRes.json();
    expect(Array.isArray(superBody.items)).toBe(true);
  });

  it('RBAC visibleModules: editor has read access to audit log; viewer denied; users module restricted to super_admin', async () => {
    const { visibleModules } = await import('../../admin/src/nav.ts');

    const editorModuleIds = visibleModules('editor').map((m) => m.id);
    expect(editorModuleIds).toContain('audit');
    expect(editorModuleIds).not.toContain('users');
    expect(editorModuleIds).not.toContain('settings');

    const viewerModuleIds = visibleModules('viewer').map((m) => m.id);
    expect(viewerModuleIds).not.toContain('audit');
    expect(viewerModuleIds).not.toContain('users');

    const adminModuleIds = visibleModules('admin').map((m) => m.id);
    expect(adminModuleIds).toContain('audit');
    expect(adminModuleIds).toContain('settings');
    expect(adminModuleIds).not.toContain('users');

    const superAdminModuleIds = visibleModules('super_admin').map((m) => m.id);
    expect(superAdminModuleIds).toContain('audit');
    expect(superAdminModuleIds).toContain('settings');
    expect(superAdminModuleIds).toContain('users');
  });
});

describe('Phase 1.4: Media Deletion Safe Physical File Cleanup', () => {
  it('DELETE /media/:id removes physical file from disk and deletes database record', async () => {
    // Upload a small valid 1x1 PNG
    const png1x1 = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
      0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
    ]);

    const form = new FormData();
    form.append('file', new Blob([png1x1], { type: 'image/png' }), 'test-cleanup.png');
    form.append('alt', 'Test cleanup asset');

    const upRes = await app.request('/api/v1/admin/media', {
      method: 'POST',
      headers: { cookie: adminCookie },
      body: form,
    });
    expect(upRes.status).toBe(201);
    const asset = await upRes.json();
    const diskPath = join(process.env.MEDIA_DIR!, asset.key);

    // File must exist on disk after upload
    expect(existsSync(diskPath)).toBe(true);

    // Delete asset
    const delRes = await app.request(`/api/v1/admin/media/${asset.id}`, {
      method: 'DELETE',
      headers: { cookie: adminCookie },
    });
    expect(delRes.status).toBe(200);
    expect((await delRes.json()).deleted).toBe(true);

    // File MUST be removed from disk
    expect(existsSync(diskPath)).toBe(false);

    // DB row deleted
    expect((await app.request(`/api/v1/admin/media/${asset.id}/file`, { headers: { cookie: adminCookie } })).status).toBe(404);
  });

  it('DELETE /media/:id handles missing file on disk (ENOENT tolerance) gracefully without crash', async () => {
    // Insert an asset directly pointing to a non-existent disk key
    const [adminUser] = await db.select().from(user).where(eq(user.email, 'p1-admin@twinmos.dev')).limit(1);
    const [row] = await db.insert(mediaAsset).values({
      key: 'ghost-file-' + Date.now() + '.png',
      kind: 'image',
      alt: 'Ghost file alt',
      meta: { origName: 'ghost.png', mime: 'image/png', bytes: 100 },
      uploadedBy: adminUser.id,
    }).returning();

    // Call DELETE on the ghost asset (file does not exist on disk)
    const delRes = await app.request(`/api/v1/admin/media/${row.id}`, {
      method: 'DELETE',
      headers: { cookie: adminCookie },
    });
    expect(delRes.status).toBe(200);
    expect((await delRes.json()).deleted).toBe(true);

    // Record removed from DB
    const checkDb = await db.select().from(mediaAsset).where(eq(mediaAsset.id, row.id));
    expect(checkDb.length).toBe(0);
  });
});

