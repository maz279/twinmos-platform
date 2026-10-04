// Offline admin password setter — dev utility, run while the API is STOPPED
// (PGlite is single-process; a second instance would not see the running server's state).
// Bypasses Better Auth's minPasswordLength on purpose: for local-dev throwaway passwords only.
// Usage: NEW_ADMIN_PASSWORD='...' node --experimental-strip-types --no-warnings scripts/set-admin-password.ts [email]
import { and, eq } from 'drizzle-orm';
import { hashPassword, verifyPassword } from 'better-auth/crypto';
import { createDb, user, account } from '@twinmos/db';

const email = process.argv[2] ?? process.env.SEED_ADMIN_EMAIL ?? 'admin@twinmos.dev';
const newPassword = process.env.NEW_ADMIN_PASSWORD;
if (!newPassword) {
  console.error('[set-password] NEW_ADMIN_PASSWORD env var is required');
  process.exit(1);
}

const db = createDb();
const [u] = await db.select({ id: user.id }).from(user).where(eq(user.email, email)).limit(1);
if (!u) {
  console.error(`[set-password] user not found: ${email}`);
  process.exit(1);
}

const hash = await hashPassword(newPassword);
await db.update(account)
  .set({ password: hash, updatedAt: new Date() })
  .where(and(eq(account.userId, u.id), eq(account.providerId, 'credential')));

// read back and verify with Better Auth's own verifier
const [acct] = await db.select({ password: account.password }).from(account)
  .where(and(eq(account.userId, u.id), eq(account.providerId, 'credential'))).limit(1);
const ok = acct?.password ? await verifyPassword({ password: newPassword, hash: acct.password }) : false;
console.log(`[set-password] ${email}: ${ok ? 'password updated and verified' : 'VERIFICATION FAILED'}`);

const client = (db as any).$client;
await client.close();
process.exit(ok ? 0 : 1);
