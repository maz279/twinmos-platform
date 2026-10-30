// Shared fixtures for the hardened public intake (zero-trust audit 2026-10-28).
// Load with a dynamic import AFTER the test has set its env, like buildApp:
//   const { formToken, registerSerial }: any = await import('./support/fixtures.ts');
import { createFormToken } from '../../src/routes/forms.ts';
import { productRegistration, serialRegistry } from '@twinmos/db';

/** A fresh signed form token — every public form must carry one (ZT-028). */
export const formToken = (): string => createFormToken();

/**
 * BR-6.2: an RMA is accepted only for a serial from the factory registry with
 * an active, in-warranty registration under the submitter's e-mail. Seeds both
 * rows directly (the e-mail-verified registration flow has its own tests).
 */
export async function registerSerial(
  db: any,
  serial: string,
  email: string,
  opts: { sku?: string; expired?: boolean } = {},
): Promise<string> {
  const s = serial.toUpperCase();
  await db.insert(serialRegistry).values({ serial: s, sku: opts.sku ?? null }).onConflictDoNothing();
  const day = 86400_000;
  const purchase = new Date(Date.now() - (opts.expired ? 4 * 365 : 30) * day);
  await db.insert(productRegistration).values({
    serial: s,
    sku: opts.sku ?? null,
    email: email.trim().toLowerCase(),
    name: 'Test Owner',
    purchaseDate: purchase.toISOString().slice(0, 10),
    warrantyTerm: '3 years',
    warrantyExpiresAt: new Date(purchase.getTime() + 3 * 365 * day),
    status: 'active',
  });
  return s;
}
