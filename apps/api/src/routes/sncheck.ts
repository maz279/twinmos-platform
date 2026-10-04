// P5 anti-counterfeit — public SN-check endpoint (rate-limited, registry
// lookup, verification log, verifiedCount increment) + admin reporting.
import { Hono } from 'hono';
import { and, count, desc, eq, gte, isNotNull, lte, sql } from 'drizzle-orm';
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
      country: (c.req.header('cf-ipcountry') ?? '').slice(0, 8).toUpperCase() || null,
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
    const parseDate = (raw: string | undefined, fallback: () => Date): Date | null => {
      if (!raw) return fallback();
      const d = new Date(raw);
      return Number.isNaN(d.getTime()) ? null : d; // Invalid Date would crash the PG bind
    };
    const from = parseDate(c.req.query('from'), () => new Date(Date.now() - 30 * 86400_000));
    const to = parseDate(c.req.query('to'), () => new Date());
    if (!from || !to) {
      return c.json(problem(422, 'Validation Failed', 'from/to must be ISO-8601 dates (e.g. 2026-09-01).'), 422, { 'Content-Type': P });
    }

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

// ==================== Phase 5.3: serial registry management ====================
// Batch CSV ingest of factory production runs, registry search, and
// anti-counterfeit anomaly detection: a serial queried from >5 distinct IPs
// inside a rolling 24h window is flagged "suspicious" and (on demand) the
// ops/compliance team is notified by email via the existing mailer (Resend).
const SERIAL_CSV_COLUMNS = ['serial', 'sku', 'manufacturedat', 'batch'] as const;

export function serialAdminRoute(db: DB, deps: { requireRole: (r: any) => Guard; sessionFromRequest: (req: Request) => Promise<AuthSession> }, mail: { sendOpsAlert: (subject: string, text: string) => Promise<boolean> }) {
  const r = new Hono();

  async function editorGuard(c: any): Promise<Exclude<AuthSession, null> | Response> {
    const s = await deps.sessionFromRequest(c.req.raw);
    if (!s) return c.json(problem(401, 'Unauthorized'), 401, { 'Content-Type': P });
    return (await deps.requireRole('editor')(c.req.raw)) ? s : c.json(problem(403, 'Requires editor role or above'), 403, { 'Content-Type': P });
  }
  async function auditRow(c: any, actorId: string | undefined, action: string, entityId: string, diff: unknown) {
    const { auditLog } = await import('@twinmos/db');
    await db.insert(auditLog).values({
      actorId: actorId ?? null, action, entity: 'serial_registry', entityId, diff: diff ?? null,
      requestId: c.req.header('x-request-id') ?? c.get('requestId') ?? null,
      ip: c.req.header('cf-connecting-ip') ?? null,
    });
  }

  /** Registry search — serial prefix / exact SKU / batch, newest first, with total. */
  r.get('/serials', async (c) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const q = (c.req.query('q') ?? '').trim().toUpperCase();
    const batch = (c.req.query('batch') ?? '').trim();
    const limit = Math.min(Number(c.req.query('limit') ?? 100) || 100, 200);
    const offset = Math.max(Number(c.req.query('offset') ?? 0) || 0, 0);
    const filter = and(
      q ? sql`upper(${serialRegistry.serial}) like ${'%' + q + '%'} or upper(coalesce(${serialRegistry.sku}, '')) like ${'%' + q + '%'}` : undefined,
      batch ? eq(serialRegistry.batch, batch) : undefined,
    );
    const rows = await db.select().from(serialRegistry)
      .where(filter ?? undefined)
      .orderBy(desc(serialRegistry.serial)).limit(limit).offset(offset);
    const [{ n: total }] = await db.select({ n: count() }).from(serialRegistry).where(filter ?? undefined);
    return c.json({ items: rows, total: Number(total) });
  });

  /** 0021: registry analytics — registry size, verification volume and validity
   *  split (24h + 7d), top SKUs and countries by verification activity. */
  r.get('/serials/analytics', async (c) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const now = Date.now();
    const [registryCount] = await db.select({ n: count() }).from(serialRegistry);
    const [c24] = await db.select({ n: count() }).from(snCheck).where(gte(snCheck.checkedAt, new Date(now - 24 * 3600_000)));
    const [c7] = await db.select({ n: count() }).from(snCheck).where(gte(snCheck.checkedAt, new Date(now - 7 * 86400_000)));
    const byResult = await db.select({ result: snCheck.result, n: count() }).from(snCheck)
      .where(gte(snCheck.checkedAt, new Date(now - 7 * 86400_000))).groupBy(snCheck.result);
    const topSkus = await db.select({ sku: snCheck.sku, n: count() }).from(snCheck)
      .where(and(gte(snCheck.checkedAt, new Date(now - 7 * 86400_000)), isNotNull(snCheck.sku)))
      .groupBy(snCheck.sku).orderBy(desc(count())).limit(6);
    const countries = await db.select({ country: snCheck.country, n: count() }).from(snCheck)
      .where(and(gte(snCheck.checkedAt, new Date(now - 7 * 86400_000)), isNotNull(snCheck.country)))
      .groupBy(snCheck.country).orderBy(desc(count())).limit(6);
    const total7 = Number(c7.n) || 1;
    const valid7 = Number(byResult.find((x: any) => x.result === 'valid')?.n ?? 0);
    return c.json({
      registry: Number(registryCount.n),
      checks24h: Number(c24.n),
      checks7d: Number(c7.n),
      validRate7d: Math.round((valid7 / total7) * 100),
      topSkus: topSkus.map((x: any) => ({ sku: x.sku, n: Number(x.n) })),
      countries: countries.map((x: any) => ({ country: x.country, n: Number(x.n) })),
    });
  });

  /** 0021: registry export — the filtered set as CSV (ops handoff). */
  r.get('/serials/export.csv', async (c) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const q = (c.req.query('q') ?? '').trim().toUpperCase();
    const batch = (c.req.query('batch') ?? '').trim();
    const filter = and(
      q ? sql`upper(${serialRegistry.serial}) like ${'%' + q + '%'} or upper(coalesce(${serialRegistry.sku}, '')) like ${'%' + q + '%'}` : undefined,
      batch ? eq(serialRegistry.batch, batch) : undefined,
    );
    const rows = await db.select().from(serialRegistry).where(filter ?? undefined)
      .orderBy(desc(serialRegistry.serial)).limit(5000);
    const lines = [SERIAL_CSV_COLUMNS.join(',')];
    for (const row of rows) {
      lines.push([row.serial, row.sku ?? '', row.manufacturedAt ? new Date(row.manufacturedAt).toISOString().slice(0, 10) : '', row.batch ?? ''].join(','));
    }
    await auditRow(c, guard.user.id, 'serial.export', 'batch', { rows: rows.length });
    return c.body(lines.join('\r\n') + '\r\n', 200, {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': 'attachment; filename="twinmos-serial-registry.csv"',
    });
  });

  /** Batch CSV import — columns: serial,sku,manufacturedAt,batch. Upsert by
   *  serial (PK); manufacturedAt ISO date; batch lands in a sidecar column of
   *  the row report (registry has no batch column — kept in the audit diff). */
  r.post('/serials/import', async (c) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const body = await c.req.json().catch(() => ({}));
    const csv = String((body as any).csv ?? '');
    const dryRun = (body as any).dryRun !== false;
    const lines = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return c.json(problem(422, 'Validation Failed', 'CSV needs a header and at least one row.'), 422, { 'Content-Type': P });
    const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
    if (header.join(',') !== SERIAL_CSV_COLUMNS.join(',')) {
      return c.json(problem(422, 'Validation Failed', 'Header must be exactly: ' + SERIAL_CSV_COLUMNS.join(',')), 422, { 'Content-Type': P });
    }
    type Parsed = { serial: string; sku: string | null; manufacturedAt: Date | null; batch: string | null };
    const valid: Parsed[] = [];
    const errors: Array<{ line: number; message: string }> = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map((s) => s.trim());
      const [serial, sku, mfg, batch] = cols;
      const lineNo = i + 1;
      if (!/^[A-Z0-9-]{4,60}$/i.test(serial ?? '')) { errors.push({ line: lineNo, message: 'Serial must be 4-60 chars of A-Z, 0-9, dashes.' }); continue; }
      let mfgDate: Date | null = null;
      if (mfg) {
        mfgDate = new Date(mfg);
        if (Number.isNaN(mfgDate.getTime())) { errors.push({ line: lineNo, message: 'manufacturedAt must be an ISO date (e.g. 2026-08-14).' }); continue; }
      }
      valid.push({ serial: serial.toUpperCase(), sku: sku ? sku.toUpperCase() : null, manufacturedAt: mfgDate, batch: batch || null });
    }
    if (dryRun) return c.json({ dryRun: true, validCount: valid.length, errors });
    if (errors.length) return c.json(problem(422, 'Validation Failed', errors.length + ' row(s) failed — fix and re-run.', errors), 422, { 'Content-Type': P });
    for (const v of valid) {
      await db.insert(serialRegistry).values({ serial: v.serial, sku: v.sku, manufacturedAt: v.manufacturedAt, batch: v.batch })
        .onConflictDoUpdate({ target: serialRegistry.serial, set: { sku: v.sku, manufacturedAt: v.manufacturedAt, batch: v.batch } });
    }
    await auditRow(c, guard.user.id, 'serial.import', 'batch', { count: valid.length, batches: [...new Set(valid.map((v) => v.batch).filter(Boolean))] });
    return c.json({ dryRun: false, imported: valid.length });
  });

  /** Anomaly scan — §5.3 "queried >5 times across distinct IP addresses OR
   *  distinct country codes within a 24-hour window". Optional notify=true
   *  fires the ops/compliance email. */
  r.get('/serials/anomalies', async (c) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const threshold = Math.min(Math.max(Number(c.req.query('threshold') ?? 5) || 5, 2), 100);
    const since = new Date(Date.now() - 24 * 3600_000);
    const rows = await db
      .select({
        serial: snCheck.serial,
        checks: sql<number>`count(*)`,
        distinctIps: sql<number>`count(distinct ${snCheck.ip})`,
        distinctCountries: sql<number>`count(distinct ${snCheck.country})`,
        lastSeen: sql<string>`max(${snCheck.checkedAt})`,
      })
      .from(snCheck)
      .where(gte(snCheck.checkedAt, since))
      .groupBy(snCheck.serial)
      .having(sql`count(distinct ${snCheck.ip}) > ${threshold} or count(distinct ${snCheck.country}) > ${threshold}`)
      .orderBy(desc(sql`count(distinct ${snCheck.ip})`))
      .limit(100);
    const flagged = rows.map((x: any) => ({
      serial: x.serial, checks: Number(x.checks), distinctIps: Number(x.distinctIps),
      distinctCountries: Number(x.distinctCountries), lastSeen: x.lastSeen,
      verdict: 'suspicious — suspected counterfeit distribution',
    }));

    let notified = false;
    if (c.req.query('notify') === 'true' && flagged.length) {
      const list = flagged.map((f) => `${f.serial}: ${f.checks} checks from ${f.distinctIps} IPs / ${f.distinctCountries} countries (last ${f.lastSeen})`).join('\n');
      notified = await mail.sendOpsAlert(
        `TwinMOS anti-counterfeit alert — ${flagged.length} suspicious serial(s) in 24h`,
        `The following serials were verified from more than ${threshold} distinct IP addresses OR country codes in the last 24 hours —\na pattern consistent with counterfeit distribution or serial leakage.\n\n${list}\n\nReview in the admin console: Partners & channel → SN-check → Anomalies.`,
      );
      await auditRow(c, guard.user.id, 'serial.anomaly.alert', 'batch', { flagged: flagged.length, notified });
    }
    return c.json({ windowHours: 24, threshold, flagged, notified });
  });

  // ---- 0021: parametric routes LAST — /serials/:serial must not capture the
  // literal segments above (analytics, export.csv, import, anomalies).

  /** Single-serial drill-down — registry row + recent verification log +
   *  24h activity summary (the same distinct-source rule as the anomaly scan). */
  r.get('/serials/:serial', async (c) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const serial = (c.req.param('serial') ?? '').trim().toUpperCase();
    if (!/^[A-Z0-9-]{4,60}$/.test(serial)) {
      return c.json(problem(422, 'Validation Failed', 'Serial must be 4-60 chars of A-Z, 0-9, dashes.'), 422, { 'Content-Type': P });
    }
    const row = (await db.select().from(serialRegistry).where(eq(serialRegistry.serial, serial)).limit(1))[0] ?? null;
    const since = new Date(Date.now() - 24 * 3600_000);
    const [activity] = await db.select({
      checks: count(),
      distinctIps: sql<number>`count(distinct ${snCheck.ip})`,
      distinctCountries: sql<number>`count(distinct ${snCheck.country})`,
    }).from(snCheck).where(and(eq(snCheck.serial, serial), gte(snCheck.checkedAt, since)));
    const recent = await db.select().from(snCheck).where(eq(snCheck.serial, serial))
      .orderBy(desc(snCheck.checkedAt)).limit(50);
    const ips = Number(activity?.distinctIps ?? 0);
    const countries = Number(activity?.distinctCountries ?? 0);
    return c.json({
      serial,
      registry: row,
      last24h: { checks: Number(activity?.checks ?? 0), distinctIps: ips, distinctCountries: countries },
      verdict: !row ? 'unknown' : ips > 5 || countries > 5 ? 'suspicious' : 'verified',
      history: recent.map((h: any) => ({
        result: h.result, ip: h.ip, country: h.country, ua: h.ua ? String(h.ua).slice(0, 90) : null, checkedAt: h.checkedAt,
      })),
    });
  });

  /** Delete a registry entry — editor+, audited. The verification log
   *  (sn_check rows) is history and stays; the serial simply stops verifying. */
  r.delete('/serials/:serial', async (c) => {
    const guard = await editorGuard(c);
    if (guard instanceof Response) return guard;
    const serial = (c.req.param('serial') ?? '').trim().toUpperCase();
    const rows = await db.delete(serialRegistry).where(eq(serialRegistry.serial, serial)).returning();
    if (!rows[0]) return c.json(problem(404, 'Serial not found in registry'), 404, { 'Content-Type': P });
    await auditRow(c, guard.user.id, 'serial.delete', serial, { sku: rows[0].sku, batch: rows[0].batch });
    return c.json({ deleted: true, serial });
  });

  return r;
}
