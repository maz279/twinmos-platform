// P5 anti-counterfeit — public SN-check endpoint (rate-limited, registry
// lookup, verification log, verifiedCount increment) + admin reporting.
import { Hono } from 'hono';
import { and, count, desc, eq, gte, lte, sql } from 'drizzle-orm';
import { snCheckSchema, problem } from '@twinmos/shared';
import { serialRegistry, snCheck } from '@twinmos/db';
import type { DB } from '@twinmos/db';
import type { AuthSession } from '../auth.ts';

type Guard = (req: Request) => Promise<AuthSession | null>;
const P = 'application/problem+json';
const RESULT = { VALID: 'valid', UNVERIFIED: 'unverified' } as const;

export function snCheckRoute(db: DB) {
  const r = new Hono();

  r.post('/sn-check', async (c) => {
    const parsed = snCheckSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });
    const serial = parsed.data.serial.toUpperCase();

    const hit = await db.select().from(serialRegistry).where(eq(serialRegistry.serial, serial)).limit(1);
    const row = hit[0];
    const result = row ? RESULT.VALID : RESULT.UNVERIFIED;

    await db.insert(snCheck).values({
      serial, sku: row?.sku ?? null, result,
      ip: c.req.header('cf-connecting-ip') ?? null, ua: c.req.header('user-agent') ?? null,
    });
    if (row) {
      await db.update(serialRegistry)
        .set({ verifiedCount: sql`${serialRegistry.verifiedCount} + 1` })
        .where(eq(serialRegistry.serial, serial));
    }

    return c.json({
      serial,
      result,
      ...(row ? { sku: row.sku, manufacturedAt: row.manufacturedAt } : {}),
      advice: result === RESULT.VALID
        ? 'Serial verified against the TwinMOS registry — genuine article.'
        : 'This serial is not in the TwinMOS registry. If you already own the product, contact support with proof of purchase; if buying, treat unverified serials with caution.',
    }, 200, { 'Cache-Control': 'no-store' });
  });

  return r;
}

/** Admin reporting — verification volume, result split, top serials, recent checks. */
export function snReportRoute(db: DB, deps: { requireRole: (r: any) => Guard; sessionFromRequest: (req: Request) => Promise<AuthSession> }) {
  const r = new Hono();

  r.get('/sn-checks', async (c) => {
    const s = await deps.sessionFromRequest(c.req.raw);
    if (!s) return c.json(problem(401, 'Unauthorized'), 401, { 'Content-Type': P });
    if (!(await deps.requireRole('editor')(c.req.raw))) {
      return c.json(problem(403, 'Requires editor role or above'), 403, { 'Content-Type': P });
    }
    const from = c.req.query('from') ? new Date(c.req.query('from')!) : new Date(Date.now() - 30 * 86400_000);
    const to = c.req.query('to') ? new Date(c.req.query('to')!) : new Date();

    const [byResult, topSerials, recent] = await Promise.all([
      db.select({ result: snCheck.result, n: count() }).from(snCheck)
        .where(and(gte(snCheck.checkedAt, from), lte(snCheck.checkedAt, to)))
        .groupBy(snCheck.result),
      db.select({ serial: snCheck.serial, n: count() }).from(snCheck)
        .where(and(gte(snCheck.checkedAt, from), lte(snCheck.checkedAt, to)))
        .groupBy(snCheck.serial).orderBy(desc(count())).limit(10),
      db.select().from(snCheck)
        .where(and(gte(snCheck.checkedAt, from), lte(snCheck.checkedAt, to)))
        .orderBy(desc(snCheck.id)).limit(50),
    ]);

    const split: Record<string, number> = {};
    byResult.forEach((x: any) => { split[x.result] = Number(x.n); });
    return c.json({
      window: { from: from.toISOString(), to: to.toISOString() },
      total: Object.values(split).reduce((a: number, b) => a + b, 0),
      byResult: split,
      topSerials: topSerials.map((x: any) => ({ serial: x.serial, checks: Number(x.n) })),
      recent,
    });
  });

  return r;
}
