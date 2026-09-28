// Better Auth — email/password + roles; mounted at /api/v1/auth/*
// initAuth(db): one database handle shared with the whole API (a second PGlite
// instance on the same data dir would break cross-module write visibility).
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { twoFactor } from 'better-auth/plugins';
import * as schema from '@twinmos/db';
import type { DB } from '@twinmos/db';
import type { Role } from '@twinmos/shared';

export function initAuth(db: DB) {
  const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL ?? 'http://127.0.0.1:8787',
    basePath: '/api/v1/auth', // mount point used by app.ts
    // Cross-origin dev surfaces (admin SPA on Vite, website on astro preview)
    // are trusted via env; production serves everything same-origin.
    trustedOrigins: (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? '')
      .split(',').map((s) => s.trim()).filter(Boolean),
    database: drizzleAdapter(db, { provider: 'pg', schema }),
    emailAndPassword: { enabled: true, minPasswordLength: 10 },
    advanced: { database: { generateId: () => crypto.randomUUID() } },
    // role is a custom column on `user` — declare it so Better Auth selects and returns it
    user: {
      additionalFields: { role: { type: 'string', defaultValue: 'viewer', input: false } },
    },
    session: { expiresIn: 60 * 60 * 8, updateAge: 60 * 30 }, // 8h, refresh every 30min
    plugins: [
      // P7+ MFA for the admin panel: TOTP + backup codes (migration 0006).
      // skipVerificationOnEnable stays false — enrollment requires a live code,
      // so twoFactorEnabled only flips after the authenticator is proven working.
      twoFactor({ issuer: process.env.TOTP_ISSUER ?? 'TwinMOS Admin' }),
    ],
  });

  async function sessionFromRequest(req: Request): Promise<AuthSession> {
    const r = await auth.api.getSession({ headers: req.headers });
    if (!r?.user) return null;
    return { user: { id: r.user.id, email: String(r.user.email), role: String((r.user as any).role ?? 'viewer') } };
  }

  const RANK: Record<string, number> = { viewer: 1, author: 2, editor: 3, admin: 4, super_admin: 5 };

  /** Hono guard factory — deny by default; checks minimum role. Returns the session when allowed. */
  function requireRole(min: Role) {
    return async (req: Request): Promise<AuthSession | null> => {
      const s = await sessionFromRequest(req);
      if (!s) return null;
      const have = RANK[s.user.role] ?? 0;
      return have >= RANK[min] ? s : null;
    };
  }

  return { auth, sessionFromRequest, requireRole };
}

export type AuthSession = { user: { id: string; email: string; role: string } } | null;
