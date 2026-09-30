// Phase 7 (TWN-ADMIN-CMS-AUDIT-PLAN-2026-001 §7.1) — module analytics
// endpoints backing the per-module dashboards: reads-only aggregates over
// existing tables, session-guarded (any authenticated role), parameter-bound
// Drizzle queries. The frontend renders these with the console's zero-dep
// inline-SVG chart primitives (charts.tsx) — same architecture decision as
// the main dashboard ("no chart library in the bundle"), keeping the Phase 6
// code-split entry small.
//
//   GET /admin/analytics/leads   — lead funnel by status, SLA gauge buckets,
//                                  type split, 14-day arrival series
//   GET /admin/analytics/rma     — status distribution, return reasons by
//                                  product category, resolution time, monthly trend
//   GET /admin/analytics/content — publish velocity per entity per week
//                                  (12-week window) + pipeline counts
import { Hono } from 'hono';
import { and, count, eq, gte, isNull, sql } from 'drizzle-orm';
import { problem } from '@twinmos/shared';
import { article, category as categoryTable, faq, formSubmission, newsPost, page, product, rmaRequest, translation } from '@twinmos/db';
import { LOCALES } from '@twinmos/shared';
import type { DB } from '@twinmos/db';
import type { AuthSession } from '../auth.ts';

type Guard = (req: Request) => Promise<AuthSession | null>;
const P = 'application/problem+json';

export function analyticsRoute(db: DB, deps: { requireRole: (r: any) => Guard; sessionFromRequest: (req: Request) => Promise<AuthSession> }) {
  const r = new Hono();

  async function authed(c: any): Promise<Exclude<AuthSession, null> | Response> {
    const s = await deps.sessionFromRequest(c.req.raw);
    return s ?? c.json(problem(401, 'Unauthorized'), 401, { 'Content-Type': P });
  }

  const OPEN_LEAD_STATES = ['new', 'assigned', 'in_progress'] as const;

  /** §7.1 "Sales/Leads Dashboard": funnel of lead progression, SLA countdown
   *  gauge buckets, type split and a 14-day arrival series. */
  r.get('/analytics/leads', async (c) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const now = Date.now();

    const [byStatus, byType, byPriority, arrivals] = await Promise.all([
      db.select({ status: formSubmission.status, n: count() }).from(formSubmission).groupBy(formSubmission.status),
      db.select({ type: formSubmission.type, n: count() }).from(formSubmission).groupBy(formSubmission.type).orderBy(sql`count(*) desc`).limit(10),
      db.select({ priority: formSubmission.priority, n: count() }).from(formSubmission).groupBy(formSubmission.priority),
      db.select({ d: sql<string>`to_char(${formSubmission.createdAt}, 'YYYY-MM-DD')`, n: count() })
        .from(formSubmission)
        .where(gte(formSubmission.createdAt, new Date(now - 13 * 86400_000)))
        .groupBy(sql`to_char(${formSubmission.createdAt}, 'YYYY-MM-DD')`),
    ]);

    const statusCount = Object.fromEntries(byStatus.map((x: any) => [x.status, Number(x.n)]));
    // Funnel: cumulative reach — every lead that ever ENTERED a stage. A lead
    // counts for a later stage when its current status is at or beyond it
    // (resolved/closed passed through in_progress etc.); spam is excluded.
    const reached = (s: string) => {
      const order = ['new', 'assigned', 'in_progress', 'resolved', 'closed'];
      const idx = order.indexOf(s);
      if (idx < 0) return 0;
      return order.slice(idx).reduce((sum, k) => sum + (statusCount[k] ?? 0), 0);
    };
    const funnel = ['new', 'assigned', 'in_progress', 'resolved', 'closed'].map((stage) => ({ stage, count: reached(stage) }));

    // SLA gauge: open leads bucketed by countdown state (mirrors P6 slaState).
    const open = OPEN_LEAD_STATES.reduce((s, k) => s + (statusCount[k] ?? 0), 0);
    const slaRows = await db.select({ dueAt: formSubmission.dueAt, status: formSubmission.status, createdAt: formSubmission.createdAt })
      .from(formSubmission)
      .where(sql`${formSubmission.status} in ('new','assigned','in_progress')`)
      .limit(2000);
    let overdue = 0; let dueSoon = 0; let onTrack = 0; let noSla = 0; let ageSumMs = 0;
    for (const row of slaRows) {
      ageSumMs += now - new Date(row.createdAt).getTime();
      if (!row.dueAt) { noSla += 1; continue; }
      const due = new Date(row.dueAt).getTime();
      if (due < now) overdue += 1;
      else if (due < now + 4 * 3600_000) dueSoon += 1;
      else onTrack += 1;
    }
    const sla = {
      open, overdue, dueSoon, onTrack, noSla,
      avgAgeDays: slaRows.length ? Math.round((ageSumMs / slaRows.length / 86400_000) * 10) / 10 : 0,
      // gauge value 0..100 = share of open leads still inside their SLA window
      healthyPct: open ? Math.round(((onTrack + dueSoon) / open) * 100) : 100,
    };

    const series: Array<{ d: string; n: number }> = [];
    for (let i = 13; i >= 0; i--) {
      const key = new Date(now - i * 86400_000).toISOString().slice(0, 10);
      series.push({ d: key, n: Number(arrivals.find((x: any) => x.d === key)?.n ?? 0) });
    }

    return c.json({
      total: byStatus.reduce((s: number, x: any) => s + Number(x.n), 0),
      spam: statusCount.spam ?? 0,
      funnel,
      sla,
      byType: byType.map((x: any) => ({ type: x.type, n: Number(x.n) })),
      byPriority: byPriority.map((x: any) => ({ priority: x.priority, n: Number(x.n) })),
      series,
    });
  });

  /** §7.1 "RMA Dashboard": status distribution pie, return-reason bars by
   *  product category (SKU → product → category), avg resolution time for
   *  closed cases and a 6-month volume trend. */
  r.get('/analytics/rma', async (c) => {
    const a = await authed(c);
    if (a instanceof Response) return a;

    const [byStatus, byCategory, closedAgg, monthly] = await Promise.all([
      db.select({ status: rmaRequest.status, n: count() }).from(rmaRequest).groupBy(rmaRequest.status),
      db.select({ category: categoryTable.name, n: count() })
        .from(rmaRequest)
        .leftJoin(product, eq(rmaRequest.productSku, product.sku))
        .leftJoin(categoryTable, eq(product.categoryId, categoryTable.id))
        .groupBy(categoryTable.name)
        .orderBy(sql`count(*) desc`)
        .limit(10),
      db.select({ n: count(), avgDays: sql<string | null>`avg(extract(epoch from (${rmaRequest.updatedAt} - ${rmaRequest.createdAt})) / 86400)` })
        .from(rmaRequest)
        .where(eq(rmaRequest.status, 'closed')),
      db.select({ m: sql<string>`to_char(${rmaRequest.createdAt}, 'YYYY-MM')`, n: count() })
        .from(rmaRequest)
        .where(gte(rmaRequest.createdAt, new Date(Date.now() - 183 * 86400_000)))
        .groupBy(sql`to_char(${rmaRequest.createdAt}, 'YYYY-MM')`)
        .orderBy(sql`to_char(${rmaRequest.createdAt}, 'YYYY-MM')`),
    ]);

    const statusCount = Object.fromEntries(byStatus.map((x: any) => [x.status, Number(x.n)]));
    const total = byStatus.reduce((s: number, x: any) => s + Number(x.n), 0);
    const open = total - (statusCount.closed ?? 0) - (statusCount.delivered ?? 0);

    // fill the 6-month trend so sparse months render as zero-height bars
    const trend: Array<{ m: string; n: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const key = new Date(Date.now() - i * 30.4 * 86400_000).toISOString().slice(0, 7);
      trend.push({ m: key, n: Number(monthly.find((x: any) => x.m === key)?.n ?? 0) });
    }

    return c.json({
      total, open,
      byStatus: byStatus.map((x: any) => ({ status: x.status, n: Number(x.n) })),
      reasons: byCategory.map((x: any) => ({ category: x.category ?? 'Uncategorized', n: Number(x.n) })),
      avgResolutionDays: closedAgg[0]?.avgDays ? Math.round(Number(closedAgg[0].avgDays) * 10) / 10 : null,
      trend,
    });
  });

  /** §7.1 "Content Dashboard": publish velocity (published per calendar week
   *  per entity over the last 12 weeks) plus the current pipeline census.
   *  Translation coverage intentionally stays on /admin/translations/progress
   *  (§5.1) — the content dashboard consumes it client-side for the heatmap. */
  r.get('/analytics/content', async (c) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const since = new Date(Date.now() - 84 * 86400_000); // 12 weeks

    const tables = { article, news: newsPost, page, faq } as const;
    const velocity: Array<{ w: string; article: number; news: number; page: number; faq: number }> = [];
    const weeks: string[] = [];
    for (let i = 11; i >= 0; i--) {
      // ISO week key from the Monday of each trailing week
      const monday = new Date(Date.now() - (i * 7 + ((new Date().getDay() + 6) % 7)) * 86400_000);
      weeks.push(monday.toISOString().slice(0, 10));
      velocity.push({ w: monday.toISOString().slice(0, 10), article: 0, news: 0, page: 0, faq: 0 });
    }

    // Only article and news carry a publishAt column — page and faq publish
    // via status alone, so they contribute pipeline counts and stay zeroed in
    // the velocity series (documented in the response as velocityEntities).
    const dated: Array<'article' | 'news'> = ['article', 'news'];
    const perEntity = await Promise.all(dated.map(async (entity) => {
      const t = tables[entity] as any;
      const rows = await db.select({ w: sql<string>`to_char(date_trunc('week', ${t.publishAt}), 'YYYY-MM-DD')`, n: count() })
        .from(t)
        .where(and(eq(t.status, 'published'), gte(t.publishAt, since), isNull(t.deletedAt)))
        .groupBy(sql`date_trunc('week', ${t.publishAt})`);
      return { entity, rows };
    }));
    for (const { entity, rows } of perEntity) {
      for (const row of rows as any[]) {
        // snap each DB week to the nearest trailing Monday bucket
        const ts = new Date(row.w + 'T00:00:00Z').getTime();
        let best: string | undefined;
        for (const w of weeks) {
          const wt = new Date(w + 'T00:00:00Z').getTime();
          if (wt <= ts && (!best || wt > new Date(best + 'T00:00:00Z').getTime())) best = w;
        }
        const bucket = velocity.find((v) => v.w === best);
        if (bucket) (bucket as any)[entity] = Number(row.n);
      }
    }

    const pipeline = await Promise.all((Object.keys(tables) as Array<keyof typeof tables>).map(async (entity) => {
      const t = tables[entity] as any;
      // faq carries neither slug nor deletedAt (P3 schema note) — no soft-delete
      // filter applies to it; the other three filter live rows only.
      const where = entity === 'faq' ? undefined : isNull(t.deletedAt);
      const rows = await db.select({ status: t.status, n: count() }).from(t).where(where).groupBy(t.status);
      return { entity, byStatus: Object.fromEntries(rows.map((x: any) => [x.status, Number(x.n)])) };
    }));

    // translation coverage row for the heatmap strip (reuses §5.1 key-exact math)
    const trRows = await db.select({ locale: translation.locale, ns: translation.ns, key: translation.key }).from(translation).limit(20_000);
    const keySets = new Map<string, Set<string>>();
    for (const row of trRows) {
      const k = row.locale + '\u0000' + row.ns;
      (keySets.get(k) ?? keySets.set(k, new Set()).get(k)!).add(row.key);
    }
    const namespaces = [...new Set(trRows.filter((x) => x.locale === 'en').map((x) => x.ns))];
    const coverage: Record<string, Record<string, number>> = {};
    for (const l of LOCALES) {
      coverage[l] = {};
      for (const ns of namespaces) {
        const en = keySets.get('en\u0000' + ns) ?? new Set<string>();
        if (l === 'en' || !en.size) { coverage[l][ns] = l === 'en' ? 100 : 0; continue; }
        const tgt = keySets.get(l + '\u0000' + ns) ?? new Set<string>();
        let hit = 0;
        for (const k of en) if (tgt.has(k)) hit += 1;
        coverage[l][ns] = Math.round((hit / en.size) * 100);
      }
    }

    return c.json({
      weeks,
      velocity,
      /** Entities that carry a publish date and appear in `velocity`;
       *  page/faq have no publishAt column and are pipeline-only. */
      velocityEntities: dated,
      pipeline,
      translationCoverage: { namespaces, coverage },
    });
  });

  return r;
}
