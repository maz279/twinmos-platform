// Better Auth — email/password + roles; mounted at /api/v1/auth/*
// initAuth(db): one database handle shared with the whole API (a second PGlite
// instance on the same data dir would break cross-module write visibility).
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { twoFactor, admin, createAccessControl } from 'better-auth/plugins';
import { defaultStatements } from 'better-auth/plugins/admin/access';
import * as schema from '@twinmos/db';
import { eq } from 'drizzle-orm';
import type { DB } from '@twinmos/db';
import type { Role } from '@twinmos/shared';
import { sendMail } from './mailer.ts';

export function initAuth(db: DB) {
  const ac = createAccessControl(defaultStatements);
  const adminAcRole = ac.newRole({
    user: defaultStatements.user,
    session: defaultStatements.session,
  });
  const staffAcRole = ac.newRole({
    user: [],
    session: [],
  });
  const memberAcRole = ac.newRole({
    user: [],
    session: [],
  });

  const disableSignUp = process.env.NODE_ENV === 'production' || process.env.AUTH_DISABLE_SIGNUP === '1';

  const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL ?? 'http://127.0.0.1:8787',
    basePath: '/api/v1/auth', // mount point used by app.ts
    // Cross-origin dev surfaces (admin SPA on Vite, website on astro preview)
    // are trusted via env; production serves everything same-origin.
    trustedOrigins: (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? '')
      .split(',').map((s) => s.trim()).filter(Boolean),
    database: drizzleAdapter(db, { provider: 'pg', schema }),
    emailVerification: {
      sendVerificationEmail: async ({ user, url, token }: any) => {
        // Security (Roadmap R0.3 / Z-09 / RESET-LOG): never log verification URLs or tokens to console.
        await sendMail({
          to: user.email,
          subject: 'TwinMOS Admin Portal — Verify your email',
          text: [
            `Hello ${user.name || user.email},`,
            '',
            'Please verify your email address to activate your TwinMOS account by visiting the link below:',
            url,
            '',
            'This verification link is single-use and will expire in 1 hour.',
            '',
            'Regards,',
            'TwinMOS Security Team',
          ].join('\n'),
          meta: { kind: 'email-verification', email: user.email },
        });
      },
      sendOnSignUp: true,
      autoSignInAfterVerification: false,
    },
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 10,
      disableSignUp,
      requireEmailVerification: process.env.NODE_ENV === 'production' || process.env.REQUIRE_EMAIL_VERIFICATION === '1',
      revokeSessionsOnPasswordReset: true,
      resetPasswordTokenExpiresIn: 60 * 60, // 1 hour expiration
      sendResetPassword: async ({ user, url, token }: any) => {
        // Security (Roadmap R0.3 / Z-09 / RESET-LOG): never log reset URLs or tokens to console.
        await sendMail({
          to: user.email,
          subject: 'TwinMOS Admin Portal — Password Reset Request',
          text: [
            `Hello ${user.name || user.email},`,
            '',
            'A password reset was requested for your TwinMOS administration account.',
            'You can reset your password by opening the link below:',
            url,
            '',
            'This link is single-use and will expire in 1 hour.',
            'All active sessions will be revoked upon successful password reset.',
            '',
            'If you did not make this request, you can safely ignore this email.',
            '',
            'Regards,',
            'TwinMOS Security Team',
          ].join('\n'),
          meta: { kind: 'password-reset', email: user.email },
        });
      },
    },
    disabledPaths: [
      ...(disableSignUp ? ['/sign-up/email'] : []),
      // Close admin privilege escalation & account takeover (NEW-03 / A2)
      '/admin/set-role',
      '/admin/get-user',
      '/admin/create-user',
      '/admin/update-user',
      '/admin/list-users',
      '/admin/list-user-sessions',
      '/admin/unban-user',
      '/admin/ban-user',
      '/admin/impersonate-user',
      '/admin/stop-impersonating',
      '/admin/revoke-user-session',
      '/admin/revoke-user-sessions',
      '/admin/remove-user',
      '/admin/set-user-password',
      '/admin/has-permission',
    ],
    advanced: {
      database: { generateId: () => crypto.randomUUID() },
      useSecureCookies: process.env.NODE_ENV === 'production' || (process.env.BETTER_AUTH_URL?.startsWith('https://') ?? false),
      ipAddress: {
        ipAddressHeaders: ['x-real-ip'],
      },
    },
    session: { expiresIn: 60 * 60 * 8, updateAge: 60 * 30 }, // 8h, refresh every 30min
    plugins: [
      // P7+ MFA for the admin panel: TOTP + backup codes (migration 0006).
      // skipVerificationOnEnable stays false — enrollment requires a live code,
      // so twoFactorEnabled only flips after the authenticator is proven working.
      twoFactor({ issuer: process.env.TOTP_ISSUER ?? 'TwinMOS Admin' }),
      admin({
        roles: {
          super_admin: adminAcRole,
          admin: adminAcRole,
          editor: staffAcRole,
          author: staffAcRole,
          viewer: staffAcRole,
          member: memberAcRole,
        },
        adminRoles: ['super_admin', 'admin'],
        defaultRole: 'member',
      }),
    ],
  });

  async function sessionFromRequest(req: Request): Promise<AuthSession> {
    const r = await auth.api.getSession({ headers: req.headers });
    if (!r?.user) return null;
    const u = r.user as any;
    if (u.banned) {
      if (u.banExpires && new Date(u.banExpires).getTime() < Date.now()) {
        // Ban expired — automatically clear suspension in DB and restore active session
        try {
          await db.update(schema.user).set({
            banned: false,
            banReason: null,
            banExpires: null,
            updatedAt: new Date(),
          }).where(eq(schema.user.id, u.id));
        } catch { /* best effort DB update */ }
        u.banned = false;
      } else {
        return null;
      }
    }
    return {
      user: {
        id: r.user.id,
        email: String(r.user.email),
        role: String((r.user as any).role ?? 'member'),
        banned: Boolean(u.banned),
      },
    };
  }

  const RANK: Record<string, number> = { member: 0, viewer: 1, author: 2, editor: 3, admin: 4, super_admin: 5 };

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

export type AuthSession = { user: { id: string; email: string; role: string; banned?: boolean } } | null;
