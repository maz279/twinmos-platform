// Better Auth — email/password + roles; mounted at /api/v1/auth/*
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { createDb } from '@twinmos/db';
import type { Role } from '@twinmos/shared';

const db = createDb();

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg' }),
  emailAndPassword: { enabled: true, minPasswordLength: 10 },
  advanced: { database: { generateId: () => crypto.randomUUID() } },
  session: { expiresIn: 60 * 60 * 8, updateAge: 60 * 30 }, // 8h, refresh every 30min
});

export type AuthSession = { user: { id: string; email: string; role?: string } } | null;

export async function sessionFromRequest(req: Request): Promise<AuthSession> {
  const r = await auth.api.getSession({ headers: req.headers });
  if (!r?.user) return null;
  return { user: { id: r.user.id, email: String(r.user.email), role: (r.user as any).role } };
}

const RANK: Record<string, number> = { viewer: 1, author: 2, editor: 3, admin: 4, super_admin: 5 };

/** Hono guard factory — deny by default; checks minimum role. */
export function requireRole(min: Role) {
  return async (req: Request): Promise<AuthSession | null> => {
    const s = await sessionFromRequest(req);
    if (!s) return null;
    const have = RANK[s.user.role ?? 'viewer'] ?? 0;
    return have >= RANK[min] ? s : null;
  };
}
