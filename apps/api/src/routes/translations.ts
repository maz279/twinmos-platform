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
import type { Role } from '@twinmos/shared';
import { translation, auditLog, glossaryTerm, office, testimonial, policyDocument, page, product, entityTranslation } from '@twinmos/db';
import { createHash } from 'node:crypto';
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

export function translationsRoute(db: DB, deps: { requireRole: (r: Role) => Guard; sessionFromRequest: (req: Request) => Promise<AuthSession> }) {
  const r = new Hono();

  /** Session + RBAC guard (defaults to viewer; returns session or 401/403). */
  async function authed(c: any, minRole: Role = 'viewer'): Promise<Exclude<AuthSession, null> | Response> {
    const s = await deps.sessionFromRequest(c.req.raw);
    if (!s) return c.json(problem(401, 'Unauthorized from translations line 96'), 401, { 'Content-Type': P });
    const ok = await deps.requireRole(minRole)(c.req.raw);
    return ok ? s : c.json(problem(403, `Requires ${minRole} role or above`), 403, { 'Content-Type': P });
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

  /** §5.1 progress matrix — KEY-EXACT coverage per locale and per namespace:
   *  a locale counts a key only when that same key exists in the EN source
   *  (a locale full of unrelated keys can never reach 100%). */
  r.get('/translations/progress', async (c) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const rows = await db.select({ locale: translation.locale, ns: translation.ns, key: translation.key })
      .from(translation).limit(20_000);
    const keySets = new Map<string, Set<string>>(); // `${locale}\u0000${ns}` → keys
    for (const r2 of rows) {
      const k = r2.locale + '\u0000' + r2.ns;
      (keySets.get(k) ?? keySets.set(k, new Set()).get(k)!).add(r2.key);
    }
    const namespaces = [...new Set(rows.filter((x) => x.locale === 'en').map((x) => x.ns))];
    const enKeysOf = (ns: string) => keySets.get('en\u0000' + ns) ?? new Set<string>();
    const cover = (locale: string, ns: string): number => {
      const en = enKeysOf(ns);
      if (!en.size) return locale === 'en' ? 100 : 0;
      if (locale === 'en') return 100;
      const tgt = keySets.get(locale + '\u0000' + ns) ?? new Set<string>();
      let hit = 0;
      for (const k of en) if (tgt.has(k)) hit += 1;
      return Math.round((hit / en.size) * 100);
    };
    const perLocale: Record<string, { strings: number; coverage: number }> = {};
    const enTotal = namespaces.reduce((s, ns) => s + enKeysOf(ns).size, 0);
    for (const l of LOCALES) {
      const strings = rows.filter((x) => x.locale === l).length;
      const hits = namespaces.reduce((s, ns) => s + Math.round(cover(l, ns) / 100 * enKeysOf(ns).size), 0);
      perLocale[l] = { strings, coverage: enTotal ? Math.min(100, Math.round((hits / enTotal) * 100)) : (l === 'en' ? 100 : 0) };
    }
    const perNs: Record<string, Record<string, number>> = {};
    for (const ns of namespaces) {
      perNs[ns] = {};
      for (const l of LOCALES) perNs[ns][l] = cover(l, ns);
    }
    return c.json({ enKeys: enTotal, perLocale, namespaces, perNs });
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
    const units = parseXliff(xml);
    if (!units.length) return c.json(problem(422, 'Validation Failed', 'No trans-unit (XLIFF 1.2) or unit (XLIFF 2.0) elements found.'), 422, { 'Content-Type': P });
    const corruptedUnits = units.filter((u) => u.target != null && (u.target.includes('???') || u.target.includes('\uFFFD')));
    if (corruptedUnits.length > 0) {
      return c.json(
        problem(
          422,
          'Encoding Validation Failed',
          `${corruptedUnits.length} trans-unit target(s) contain corrupted characters (??? or \\uFFFD).`,
          corruptedUnits.map((u) => ({ path: ['xml', u.id], message: `Target for unit "${u.id}" contains encoding-loss characters (??? or \\uFFFD)` }))
        ),
        422,
        { 'Content-Type': P }
      );
    }
    const guard = await translateGuard(c, ns);
    if (guard instanceof Response) return guard;
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

  /** Phase C (LOC-01) & MS4.8: Entity XLIFF export — Glossary, Offices, Testimonials, Policies, Pages, Products */
  r.get('/translations/entities/xliff', async (c) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const locale = LOCALE_SCHEMA.safeParse(c.req.query('locale') ?? 'ar');
    if (!locale.success) return c.json(problem(422, 'Validation Failed', 'locale is required.'), 422, { 'Content-Type': P });

    const entityParam = c.req.query('entity');
    const [enGlossary, enOffices, enTestimonials, enPolicies, enPages, enProducts, existingTranslations] = await Promise.all([
      (!entityParam || entityParam === 'all' || entityParam === 'glossary' || entityParam === 'glossary_term')
        ? db.select().from(glossaryTerm).where(eq(glossaryTerm.locale, 'en'))
        : Promise.resolve([]),
      (!entityParam || entityParam === 'all' || entityParam === 'office')
        ? db.select().from(office).where(eq(office.locale, 'en'))
        : Promise.resolve([]),
      (!entityParam || entityParam === 'all' || entityParam === 'testimonial')
        ? db.select().from(testimonial).where(eq(testimonial.locale, 'en'))
        : Promise.resolve([]),
      (!entityParam || entityParam === 'all' || entityParam === 'policy')
        ? db.select().from(policyDocument).where(eq(policyDocument.locale, 'en'))
        : Promise.resolve([]),
      (!entityParam || entityParam === 'all' || entityParam === 'page')
        ? db.select().from(page).where(eq(page.locale, 'en'))
        : Promise.resolve([]),
      (!entityParam || entityParam === 'all' || entityParam === 'product')
        ? db.select().from(product)
        : Promise.resolve([]),
      db.select().from(translation).where(and(eq(translation.locale, locale.data), eq(translation.ns, 'entities'))),
    ]);

    const transMap = new Map(existingTranslations.map((t) => [t.key, t.value]));
    const units: string[] = [];

    for (const p of enPages) {
      if (p.title) {
        const key = `page:${p.id}:title`;
        const tgt = transMap.get(key) ?? '';
        units.push(`    <trans-unit id="${key}">\n      <source xml:lang="en">${esc(p.title)}</source>\n      <target xml:lang="${locale.data}">${esc(tgt)}</target>\n    </trans-unit>`);
      }
      const desc = (p.seo as any)?.description;
      if (desc) {
        const key = `page:${p.id}:seoDescription`;
        const tgt = transMap.get(key) ?? '';
        units.push(`    <trans-unit id="${key}">\n      <source xml:lang="en">${esc(desc)}</source>\n      <target xml:lang="${locale.data}">${esc(tgt)}</target>\n    </trans-unit>`);
      }
    }

    for (const pr of enProducts) {
      if (pr.name) {
        const key = `product:${pr.id}:name`;
        const tgt = transMap.get(key) ?? '';
        units.push(`    <trans-unit id="${key}">\n      <source xml:lang="en">${esc(pr.name)}</source>\n      <target xml:lang="${locale.data}">${esc(tgt)}</target>\n    </trans-unit>`);
      }
      if (pr.shortSpec) {
        const key = `product:${pr.id}:shortSpec`;
        const tgt = transMap.get(key) ?? '';
        units.push(`    <trans-unit id="${key}">\n      <source xml:lang="en">${esc(pr.shortSpec)}</source>\n      <target xml:lang="${locale.data}">${esc(tgt)}</target>\n    </trans-unit>`);
      }
      if (pr.description) {
        const key = `product:${pr.id}:description`;
        const tgt = transMap.get(key) ?? '';
        units.push(`    <trans-unit id="${key}">\n      <source xml:lang="en">${esc(pr.description)}</source>\n      <target xml:lang="${locale.data}">${esc(tgt)}</target>\n    </trans-unit>`);
      }
    }

    for (const g of enGlossary) {
      const kTerm = `glossary:${g.id}:term`;
      const kDef = `glossary:${g.id}:definition`;
      units.push(
        `    <trans-unit id="${kTerm}">\n      <source xml:lang="en">${esc(g.term)}</source>\n      <target xml:lang="${locale.data}">${esc(transMap.get(kTerm) ?? '')}</target>\n    </trans-unit>`,
        `    <trans-unit id="${kDef}">\n      <source xml:lang="en">${esc(g.definition)}</source>\n      <target xml:lang="${locale.data}">${esc(transMap.get(kDef) ?? '')}</target>\n    </trans-unit>`
      );
    }

    for (const o of enOffices) {
      const kTitle = `office:${o.id}:title`;
      const kAddr = `office:${o.id}:address`;
      units.push(
        `    <trans-unit id="${kTitle}">\n      <source xml:lang="en">${esc(o.title)}</source>\n      <target xml:lang="${locale.data}">${esc(transMap.get(kTitle) ?? '')}</target>\n    </trans-unit>`,
        `    <trans-unit id="${kAddr}">\n      <source xml:lang="en">${esc(o.address)}</source>\n      <target xml:lang="${locale.data}">${esc(transMap.get(kAddr) ?? '')}</target>\n    </trans-unit>`
      );
    }

    for (const t of enTestimonials) {
      const kQuote = `testimonial:${t.id}:quote`;
      const kAuthor = `testimonial:${t.id}:author`;
      units.push(
        `    <trans-unit id="${kQuote}">\n      <source xml:lang="en">${esc(t.quote)}</source>\n      <target xml:lang="${locale.data}">${esc(transMap.get(kQuote) ?? '')}</target>\n    </trans-unit>`,
        `    <trans-unit id="${kAuthor}">\n      <source xml:lang="en">${esc(t.author)}</source>\n      <target xml:lang="${locale.data}">${esc(transMap.get(kAuthor) ?? '')}</target>\n    </trans-unit>`
      );
    }

    for (const p of enPolicies) {
      const kTitle = `policy:${p.id}:title`;
      units.push(
        `    <trans-unit id="${kTitle}">\n      <source xml:lang="en">${esc(p.title)}</source>\n      <target xml:lang="${locale.data}">${esc(transMap.get(kTitle) ?? '')}</target>\n    </trans-unit>`
      );
    }

    const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<xliff xmlns="urn:oasis:names:tc:xliff:document:1.2" version="1.2">\n  <file original="twinmos/entities" source-language="en" target-language="' + locale.data + '" datatype="plaintext">\n    <body>\n' + units.join('\n') + '\n    </body>\n  </file>\n</xliff>\n';
    return c.body(xml, 200, {
      'content-type': 'application/xliff+xml; charset=utf-8',
      'content-disposition': `attachment; filename="twinmos-entities-${locale.data}.xliff"`,
    });
  });

  /** Phase 5.1 / MS4.8: Entity Translation Per-Field Status (missing, outdated, current) */
  r.get('/translations/entities/status', async (c) => {
    const a = await authed(c);
    if (a instanceof Response) return a;
    const locale = LOCALE_SCHEMA.safeParse(c.req.query('locale') ?? 'ar');
    if (!locale.success) return c.json(problem(422, 'Validation Failed', 'locale is required.'), 422, { 'Content-Type': P });

    const [enGlossary, enOffices, enTestimonials, enPolicies, enPages, enProducts, existingTranslations] = await Promise.all([
      db.select().from(glossaryTerm).where(eq(glossaryTerm.locale, 'en')),
      db.select().from(office).where(eq(office.locale, 'en')),
      db.select().from(testimonial).where(eq(testimonial.locale, 'en')),
      db.select().from(policyDocument).where(eq(policyDocument.locale, 'en')),
      db.select().from(page).where(eq(page.locale, 'en')),
      db.select().from(product),
      db.select().from(translation).where(and(eq(translation.locale, locale.data), eq(translation.ns, 'entities'))),
    ]);

    const transMap = new Map(existingTranslations.map((t) => [t.key, t]));

    const items: Array<{
      id: string;
      entity: string;
      entityId: number;
      field: string;
      source: string;
      target: string | null;
      status: 'missing' | 'outdated' | 'current';
      sourceUpdatedAt: string;
      targetUpdatedAt: string | null;
    }> = [];

    function addField(entity: string, entityId: number, field: string, source: string | null | undefined, srcUpdatedAt: Date | null | undefined) {
      if (!source) return;
      const key = `${entity}:${entityId}:${field}`;
      const tr = transMap.get(key);
      const target = tr?.value ?? null;
      const sourceDate = srcUpdatedAt ? new Date(srcUpdatedAt).toISOString() : new Date().toISOString();
      const targetDate = tr?.updatedAt ? new Date(tr.updatedAt).toISOString() : null;

      let status: 'missing' | 'outdated' | 'current' = 'missing';
      if (target != null && target.trim().length > 0) {
        if (targetDate && new Date(targetDate).getTime() < new Date(sourceDate).getTime() - 1000) {
          status = 'outdated';
        } else {
          status = 'current';
        }
      }

      items.push({
        id: key,
        entity,
        entityId,
        field,
        source,
        target,
        status,
        sourceUpdatedAt: sourceDate,
        targetUpdatedAt: targetDate,
      });
    }

    for (const p of enPages) {
      addField('page', p.id, 'title', p.title, p.updatedAt);
      if ((p.seo as any)?.description) addField('page', p.id, 'seoDescription', (p.seo as any).description, p.updatedAt);
    }
    for (const pr of enProducts) {
      addField('product', pr.id, 'name', pr.name, pr.updatedAt);
      if (pr.shortSpec) addField('product', pr.id, 'shortSpec', pr.shortSpec, pr.updatedAt);
      if (pr.description) addField('product', pr.id, 'description', pr.description, pr.updatedAt);
    }
    for (const g of enGlossary) {
      addField('glossary', g.id, 'term', g.term, g.updatedAt);
      addField('glossary', g.id, 'definition', g.definition, g.updatedAt);
    }
    for (const o of enOffices) {
      addField('office', o.id, 'title', o.title, o.updatedAt);
      addField('office', o.id, 'address', o.address, o.updatedAt);
    }
    for (const t of enTestimonials) {
      addField('testimonial', t.id, 'quote', t.quote, t.updatedAt);
      addField('testimonial', t.id, 'author', t.author, t.updatedAt);
    }
    for (const pol of enPolicies) {
      addField('policy', pol.id, 'title', pol.title, pol.updatedAt);
      if (pol.body) addField('policy', pol.id, 'body', pol.body, pol.updatedAt);
    }

    const summary = {
      total: items.length,
      missing: items.filter((x) => x.status === 'missing').length,
      outdated: items.filter((x) => x.status === 'outdated').length,
      current: items.filter((x) => x.status === 'current').length,
    };

    return c.json({ locale: locale.data, summary, items });
  });

  /** Phase C (LOC-01): Entity XLIFF import — validates encoding and stores translations */
  r.post('/translations/entities/xliff', async (c) => {
    const contentType = c.req.header('content-type') || '';
    let localeStr = c.req.query('locale');
    let xml = '';
    if (contentType.includes('xml')) {
      xml = await c.req.text();
      const match = xml.match(/target-language="([a-zA-Z-]+)"/);
      if (match) localeStr = match[1].toLowerCase();
    } else {
      const body = await c.req.json().catch(() => ({}));
      localeStr = (body as any).locale ?? localeStr;
      xml = String((body as any).xml ?? '');
    }
    if (!localeStr) localeStr = 'ar';
    const locale = LOCALE_SCHEMA.safeParse(localeStr);
    if (!locale.success) return c.json(problem(422, 'Validation Failed', 'locale is required and must be supported.'), 422, { 'Content-Type': P });
    if (!xml.includes('<xliff')) return c.json(problem(422, 'Validation Failed', 'Body is not an XLIFF document.'), 422, { 'Content-Type': P });

    const guard = await translateGuard(c, 'entities');
    if (guard instanceof Response) return guard;

    const units = parseXliff(xml);
    if (!units.length) return c.json(problem(422, 'Validation Failed', 'No trans-unit (XLIFF 1.2) or unit (XLIFF 2.0) elements found.'), 422, { 'Content-Type': P });

    const corruptedUnits = units.filter((u) => u.target != null && (u.target.includes('???') || u.target.includes('\uFFFD')));
    if (corruptedUnits.length > 0 || xml.includes('???') || xml.includes('\uFFFD')) {
      return c.json(
        problem(
          422,
          'Encoding Validation Failed',
          `${Math.max(1, corruptedUnits.length)} trans-unit target(s) contain corrupted characters (??? or \\uFFFD).`,
          corruptedUnits.map((u) => ({ path: ['xml', u.id], message: `Target for unit "${u.id}" contains encoding-loss characters (??? or \\uFFFD)` }))
        ),
        422,
        { 'Content-Type': P }
      );
    }

    let imported = 0;
    let skippedEmpty = 0;

    let applied = 0;
    for (const u of units) {
      if (u.target == null || u.target === '') {
        skippedEmpty += 1;
        continue;
      }
      // Store in translation table under 'entities' namespace
      await db.insert(translation).values({
        locale: locale.data,
        ns: 'entities',
        key: u.id,
        value: u.target,
        updatedBy: guard.user.id,
      }).onConflictDoUpdate({
        target: [translation.locale, translation.ns, translation.key],
        set: { value: u.target, updatedBy: guard.user.id, updatedAt: new Date() },
      });
      imported += 1;
      // T4.8.3: also materialize the applied layer the delivery API reads —
      // entity translations must reach the site, not just the studio table.
      const m = u.id.match(/^([a-z_]+):(\d+):([a-zA-Z]+)$/);
      if (m) {
        await db.insert(entityTranslation).values({
          entity: m[1], entityId: Number(m[2]), locale: locale.data, field: m[3],
          value: u.target, status: 'current',
          sourceHash: createHash('sha256').update(u.source).digest('hex'),
          updatedBy: guard.user.id,
        }).onConflictDoUpdate({
          target: [entityTranslation.entity, entityTranslation.entityId, entityTranslation.locale, entityTranslation.field],
          set: { value: u.target, status: 'current', sourceHash: createHash('sha256').update(u.source).digest('hex'), updatedBy: guard.user.id, updatedAt: new Date() },
        });
        applied += 1;
      }
    }

    await auditRow(c, guard.user.id, 'translation.entities.xliff.import', locale.data + ':entities', { imported, skippedEmpty, applied });
    return c.json({ locale: locale.data, ns: 'entities', imported, skippedEmpty, applied });
  });

  /** Upsert a single string. */
  r.put('/translations', async (c) => {
    const parsed = translationUpsertSchema.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) return c.json(problem(422, 'Validation Failed', undefined, parsed.error.issues), 422, { 'Content-Type': P });
    const { locale, ns, key, value } = parsed.data;
    if (value.includes('???') || value.includes('\uFFFD')) {
      return c.json(
        problem(
          422,
          'Encoding Validation Failed',
          'Translation value contains corrupted characters (??? or \\uFFFD).',
          [{ path: ['value'], message: 'Value contains encoding-loss characters (??? or \\uFFFD)' }]
        ),
        422,
        { 'Content-Type': P }
      );
    }
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
    const corruptedEntries = Object.entries(strings).filter(([_, val]) => val.includes('???') || val.includes('\uFFFD'));
    if (corruptedEntries.length > 0) {
      return c.json(
        problem(
          422,
          'Encoding Validation Failed',
          `${corruptedEntries.length} translation value(s) contain corrupted characters (??? or \\uFFFD).`,
          corruptedEntries.map(([k]) => ({ path: ['strings', k], message: `Key "${k}" contains encoding-loss characters` }))
        ),
        422,
        { 'Content-Type': P }
      );
    }
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
