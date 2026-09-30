// P4 translations + Phase 5.1 studio — string store behind the translation
// workflow. Writes: editor+ for content namespaces (§5.1 RBAC relaxation);
// super_admin stays required for the 'common' framework namespace and for
// deletes. The public bundle endpoint serves the merged JSON the website
// consumes; the admin side adds per-locale progress stats and XLIFF 1.2
// exchange for external CAT tools (Crowdin / Trados).
import { Hono } from 'hono';
import { and, asc, eq, sql } from 'drizzle-orm';
import {
  translationUpsertSchema, translationImportSchema, translationDeleteSchema,
  LOCALE_SCHEMA, LOCALES, problem,
} from '@twinmos/shared';
import { translation, auditLog } from '@twinmos/db';
import type { DB } from '@twinmos/db';
import type { AuthSession } from '../auth.ts';

type Guard = (req: Request) => Promise<AuthSession | null>;
const P = 'application/problem+json';

/** XML escape for XLIFF emission / plain unescape for ingestion. */
const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const unesc = (s: string): string => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');

/** Inner text of the next <tag>…</tag> pair, scanned with indexOf (no regex
 *  over user-supplied XML). Self-closing or missing → null. */
function tagText(hay: string, tag: string, from: number): { text: string | null; end: number } {
  const open = hay.indexOf('<' + tag, from);
  if (open < 0) return { text: null, end: from };
  const gt = hay.indexOf('>', open);
  if (gt > 0 && hay[gt - 1] === '/') return { text: null, end: gt + 1 };
  const close = hay.indexOf('</' + tag + '>', gt);
  if (close < 0) return { text: null, end: gt + 1 };
  return { text: unesc(hay.slice(gt + 1, close).trim()), end: close + tag.length + 3 };
}

/** Parse XLIFF 1.2 <trans-unit> pairs (id / source / target). Null target
 *  marks an untranslated unit, which import skips. */
function parseXliff12(xml: string): Array<{ id: string; source: string; target: string | null }> {
  const units: Array<{ id: string; source: string; target: string | null }> = [];
  let i = 0;
  for (;;) {
    const open = xml.indexOf('<trans-unit', i);
    if (open < 0) break;
    const close = xml.indexOf('</trans-unit>', open);
    if (close < 0) break;
    const body = xml.slice(open, close);
    const idStart = body.indexOf('id="') + 4;
    const idEnd = body.indexOf('"', idStart);
    const id = idStart > 4 && idEnd > idStart ? unesc(body.slice(idStart, idEnd)) : '';
    const src = tagText(body, 'source', 0).text ?? '';
    const tgt = tagText(body, 'target', 0).text;
    if (id) units.push({ id, source: src, target: tgt });
    i = close + 13;
  }
  return units;
}

/** Parse XLIFF 2.0 <unit id="…"><segment><source>…</source><target>…</target>
 *  </segment></unit> — the shape Crowdin/Trados emit for v2. Same result shape
 *  as the 1.2 parser; version detection happens at the call site. */
function parseXliff20(xml: string): Array<{ id: string; source: string; target: string | null }> {
  const units: Array<{ id: string; source: string; target: string | null }> = [];
  let i = 0;
  for (;;) {
    const open = xml.indexOf('<unit ', i);
    if (open < 0) break;
    const close = xml.indexOf('</unit>', open);
    if (close < 0) break;
    const body = xml.slice(open, close);
    const idStart = body.indexOf('id="') + 4;
    const idEnd = body.indexOf('"', idStart);
    const id = idStart > 4 && idEnd > idStart ? unesc(body.slice(idStart, idEnd)) : '';
    const src = tagText(body, 'source', 0).text ?? '';
    const tgt = tagText(body, 'target', 0).text;
    if (id) units.push({ id, source: src, target: tgt });
    i = close + 7;
  }
  return units;
}

/** Version-dispatching XLIFF reader: 1.2 documents use <trans-unit>, 2.0
 *  documents use <unit> inside <file>. Anything else is not XLIFF. */
function parseXliff(xml: string): Array<{ id: string; source: string; target: string | null }> {
  if (xml.includes('<trans-unit')) return parseXliff12(xml);
  if (/<unit\s/.test(xml)) return parseXliff20(xml);
  return [];
}

export function translationsRoute(db: DB, deps: { requireRole: (r: any) => Guard; sessionFromRequest: (req: Request) => Promise<AuthSession> }) {
  const r = new Hono();

  async function authed(c: any): Promise<Exclude<AuthSession, null> | Response> {
    const s = await deps.sessionFromRequest(c.req.raw);
    return s ?? c.json(problem(401, 'Unauthorized'), 401, { 'Content-Type': P });
  }
  /** §5.1 RBAC: editor+ translates content namespaces; the 'common'
   *  framework namespace stays super_admin-only. */
  async function translateGuard(c: any, ns: string): Promise<Exclude<AuthSession, null> | Response> {
    const s = await authed(c);
    if (s instanceof Response) return s;
    const needed = ns === 'common' ? 'super_admin' : 'editor';
    return (await deps.requireRole(needed)(c.req.raw))
      ? s : c.json(problem(403, needed === 'super_admin' ? 'The common framework namespace is super_admin-only.' : 'Requires editor role or above'), 403, { 'Content-Type': P });
  }
  async function auditRow(c: any, actorId: string | undefined, action: string, entityId: string, diff: unknown) {
    await db.insert(auditLog).values({
      actorId: actorId ?? null, action, entity: 'translation', entityId, diff: diff ?? null,
      requestId: c.req.header('x-request-id') ?? c.get('requestId') ?? null,
      ip: c.req.header('cf-connecting-ip') ?? null,
    });
  }

  /** List strings for a locale (optionally one ns) — the export source. */
  r.get('/translations', async (c) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const locale = LOCALE_SCHEMA.safeParse(c.req.query('locale') ?? undefined);
    if (!locale.success) return c.json(problem(422, 'Validation Failed', 'locale must be one of the 9 supported codes.'), 422, { 'Content-Type': P });
    const ns = c.req.query('ns');
    const filters = [
      eq(translation.locale, locale.data),
      ns ? eq(translation.ns, ns) : undefined,
    ].filter((f) => f !== undefined);
    const rows = await db.select().from(translation)
      .where(and(...filters)).orderBy(asc(translation.ns), asc(translation.key)).limit(5000);
    return c.json({ items: rows });
  });

  /** §5.1 progress matrix — string coverage per locale and per namespace
   *  against the EN source of truth. */
  r.get('/translations/progress', async (c) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const rows = await db.select({ locale: translation.locale, ns: translation.ns, n: sql<number>`count(*)` })
      .from(translation).groupBy(translation.locale, translation.ns);
    const perLocale: Record<string, { strings: number; coverage: number }> = {};
    const namespaces = [...new Set(rows.filter((x) => x.locale === 'en').map((x) => x.ns))];
    const enPerNs = new Map(namespaces.map((ns) => [ns, Number(rows.find((x) => x.locale === 'en' && x.ns === ns)?.n ?? 0)]));
    const enKeys = [...enPerNs.values()].reduce((s, n) => s + n, 0);
    for (const l of LOCALES) {
      const total = rows.filter((x) => x.locale === l).reduce((s, x) => s + Number(x.n), 0);
      perLocale[l] = { strings: total, coverage: enKeys ? Math.min(100, Math.round((total / enKeys) * 100)) : (l === 'en' ? 100 : 0) };
    }
    const perNs: Record<string, Record<string, number>> = {};
    for (const ns of namespaces) {
      perNs[ns] = {};
      const en = enPerNs.get(ns) ?? 0;
      for (const l of LOCALES) {
        const n = Number(rows.find((x) => x.locale === l && x.ns === ns)?.n ?? 0);
        perNs[ns][l] = en ? Math.min(100, Math.round((n / en) * 100)) : 0;
      }
    }
    return c.json({ enKeys, perLocale, namespaces, perNs });
  });

  /** §5.1 XLIFF 1.2 export — EN source + current targets for a locale/ns. */
  r.get('/translations/xliff', async (c) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const locale = LOCALE_SCHEMA.safeParse(c.req.query('locale') ?? undefined);
    if (!locale.success) return c.json(problem(422, 'Validation Failed', 'locale is required.'), 422, { 'Content-Type': P });
    const ns = c.req.query('ns') ?? 'common';
    const [enRows, targetRows] = await Promise.all([
      db.select().from(translation).where(and(eq(translation.locale, 'en'), eq(translation.ns, ns))).orderBy(asc(translation.key)).limit(5000),
      db.select().from(translation).where(and(eq(translation.locale, locale.data), eq(translation.ns, ns))).limit(5000),
    ]);
    const targets = new Map(targetRows.map((t) => [t.key, t.value]));
    const units = enRows.map((row) => {
      const t = targets.get(row.key) ?? '';
      return '    <trans-unit id="' + esc(row.key) + '">\n      <source xml:lang="en">' + esc(row.value) + '</source>\n      <target xml:lang="' + locale.data + '">' + esc(t) + '</target>\n    </trans-unit>';
    });
    const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<xliff xmlns="urn:oasis:names:tc:xliff:document:1.2" version="1.2">\n  <file original="twinmos/' + ns + '" source-language="en" target-language="' + locale.data + '" datatype="plaintext">\n    <body>\n' + units.join('\n') + '\n    </body>\n  </file>\n</xliff>\n';
    return c.body(xml, 200, {
      'content-type': 'application/xliff+xml; charset=utf-8',
      'content-disposition': 'attachment; filename="twinmos-' + locale.data + '-' + ns + '.xliff"',
    });
  });

  /** §5.1 XLIFF 1.2 import — upserts every non-empty trans-unit target. */
  r.post('/translations/xliff', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const locale = LOCALE_SCHEMA.safeParse((body as any).locale ?? undefined);
    const ns = String((body as any).ns ?? 'common');
    const xml = String((body as any).xml ?? '');
    if (!locale.success) return c.json(problem(422, 'Validation Failed', 'locale is required.'), 422, { 'Content-Type': P });
    if (!xml.includes('<xliff')) return c.json(problem(422, 'Validation Failed', 'Body is not an XLIFF document.'), 422, { 'Content-Type': P });
    const guard = await translateGuard(c, ns);
    if (guard instanceof Response) return guard;
    const units = parseXliff(xml);
    if (!units.length) return c.json(problem(422, 'Validation Failed', 'No trans-unit (XLIFF 1.2) or unit (XLIFF 2.0) elements found.'), 422, { 'Content-Type': P });
    let imported = 0;
    let skippedEmpty = 0;
    for (const u of units) {
      if (u.target == null || u.target === '') { skippedEmpty += 1; continue; }
      await db.insert(translation).values({ locale: locale.data, ns, key: u.id, value: u.target, updatedBy: guard.user.id })
        .onConflictDoUpdate({
          target: [translation.locale, translation.ns, translation.key],
          set: { value: u.target, updatedBy: guard.user.id, updatedAt: new Date() },
        });
      imported += 1;
    }
    await auditRow(c, guard.user.id, 'translation.xliff.import', locale.data + ':' + ns, { imported, skippedEmpty });
    return c.json({ locale: locale.data, ns, imported, skippedEmpty });
  });

  /** Upsert a single string. */
  r.put('/translations', async (c) => {
    const parsed = translationUpsertSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });
    const { locale, ns, key, value } = parsed.data;
    const guard = await translateGuard(c, ns);
    if (guard instanceof Response) return guard;
    await db.insert(translation).values({ locale, ns, key, value, updatedBy: guard.user.id })
      .onConflictDoUpdate({
        target: [translation.locale, translation.ns, translation.key],
        set: { value, updatedBy: guard.user.id, updatedAt: new Date() },
      });
    await auditRow(c, guard.user.id, 'translation.upsert', locale + ':' + ns + ':' + key, { len: value.length });
    return c.json({ locale, ns, key, stored: true });
  });

  /** Bulk import (translation workflow "import" leg) — upsert every pair. */
  r.post('/translations/import', async (c) => {
    const parsed = translationImportSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });
    const { locale, ns, strings } = parsed.data;
    const guard = await translateGuard(c, ns);
    if (guard instanceof Response) return guard;
    const entries = Object.entries(strings);
    let imported = 0;
    for (const [key, value] of entries) {
      await db.insert(translation).values({ locale, ns, key, value, updatedBy: guard.user.id })
        .onConflictDoUpdate({
          target: [translation.locale, translation.ns, translation.key],
          set: { value, updatedBy: guard.user.id, updatedAt: new Date() },
        });
      imported += 1;
    }
    await auditRow(c, guard.user.id, 'translation.import', locale + ':' + ns, { count: imported });
    return c.json({ locale, ns, imported });
  });

  r.delete('/translations', async (c) => {
    const s = await deps.sessionFromRequest(c.req.raw);
    if (!s) return c.json(problem(401, 'Unauthorized'), 401, { 'Content-Type': P });
    if (!(await deps.requireRole('super_admin')(c.req.raw))) {
      return c.json(problem(403, 'Requires super_admin role'), 403, { 'Content-Type': P });
    }
    const parsed = translationDeleteSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });
    const { locale, ns, key } = parsed.data;
    const rows = await db.delete(translation)
      .where(and(eq(translation.locale, locale), eq(translation.ns, ns), eq(translation.key, key)))
      .returning();
    if (!rows[0]) return c.json(problem(404, 'Translation not found'), 404, { 'Content-Type': P });
    await auditRow(c, s.user.id, 'translation.delete', locale + ':' + ns + ':' + key, {});
    return c.json({ deleted: true });
  });

  return r;
}

/** Public i18n bundle the website boots with: { ns: { key: value } } merged. */
export function i18nPublicRoute(db: DB) {
  const r = new Hono();
  r.get('/i18n/:locale', async (c) => {
    const locale = LOCALE_SCHEMA.safeParse(c.req.param('locale'));
    if (!locale.success) return c.json(problem(404, 'Unknown locale'), 404, { 'Content-Type': P });
    const rows = await db.select().from(translation).where(eq(translation.locale, locale.data)).limit(5000);
    const bundle: Record<string, Record<string, string>> = {};
    for (const row of rows) {
      (bundle[row.ns] ??= {})[row.key] = row.value;
    }
    c.header('Cache-Control', 'public, max-age=60');
    return c.json({ locale: locale.data, strings: bundle });
  });
  return r;
}
