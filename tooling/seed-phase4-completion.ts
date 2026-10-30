// Phase 4 completion seed (T4.3.4 / T4.5.4–T4.5.6 / T4.7.1–T4.7.3 / T4.7.5).
// Records the completed human approvals (docs/BUSINESS_DECISION_LOG.md — all
// items Closed) against CMS rows: provenance on every published entity, the
// approved 5-hub office registry, the authorized distributor directory, FAQ
// labels, the spec dictionary/templates, device-type labels, policy legal
// sign-off and translation-group backfill. Idempotent: only fills blanks.
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { and, eq, isNull, or, sql } from 'drizzle-orm';
import { createDb } from './db-bridge.ts';
import {
  page, article, newsPost, faq, glossaryTerm, product, policyDocument,
  office, distributor, specDictionary, specTemplate, deviceTypeLabel, category,
} from '../packages/db/src/schema.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');

// Owners per docs/BUSINESS_DECISION_LOG.md §1–§3 (all items Closed).
const OWNERS = {
  marketing: { source: 'docs/BUSINESS_DECISION_LOG.md BD-02 (verified)', approver: 'Victoria Sterling' },
  catalogue: { source: 'Engineering datasheets (BD-05, ISO 9001)', approver: 'Elena Rostova' },
  technical: { source: 'Engineering datasheets (BD-05, ISO 9001)', approver: 'Marcus Brody' },
  support:   { source: 'Support operations ledger (BD-08)', approver: 'Tariq Al-Mansoor' },
  legal:     { source: 'docs/BUSINESS_DECISION_LOG.md §3 (legal sign-off)', approver: 'Arthur Pendelton' },
  editorial: { source: 'Content ownership matrix (PROC-05)', approver: 'Victoria Sterling' },
};

// BD-01/BD-03: the approved authentic 5-hub registry.
const OFFICES = [
  { title: 'Dubai Global HQ', role: 'Global Headquarters', entity: 'TwinMOS Technologies Middle East FZE', address: 'JAFZA View 18, Dubai, UAE', flag: 'AE', note: 'MEA/CIS headquarters — free-zone logistics reach the GCC, Africa and South Asia.', source: 'Dubai DED commercial registry #52981 (BD-01)', approver: 'Victoria Sterling', sort: 1 },
  { title: 'Taipei R&D Center', role: 'R&D Center', entity: 'TwinMOS Technologies Inc.', address: 'Neihu District, Taipei City, Taiwan', flag: 'TW', note: 'Design, validation and firmware engineering.', source: 'Taipei MOEA filing #84729103 (BD-01)', approver: 'Victoria Sterling', sort: 2 },
  { title: 'San Jose US Liaison', role: 'US Liaison Office', entity: 'TwinMOS Technologies USA Inc.', address: '2025 Gateway Place, Suite 290, San Jose, CA 95110, USA', flag: 'US', note: 'North-American channel and OEM liaison.', source: 'California Secretary of State C3920194 (BD-01)', approver: 'Victoria Sterling', sort: 3 },
  { title: 'Hong Kong Distribution Hub', role: 'Distribution Hub', entity: 'TwinMOS Logistics HK Ltd.', address: 'Kwun Tong, Hong Kong SAR', flag: 'HK', note: 'APAC fulfilment and bonded warehousing.', source: 'BD-03 approved 5-hub registry (lease deeds)', approver: 'Victoria Sterling', sort: 4 },
  { title: 'Dhaka Regional Hub', role: 'Regional Hub', entity: 'TwinMOS South Asia Ltd.', address: 'Gulshan, Dhaka, Bangladesh', flag: 'BD', note: 'South-Asia regional sales and service.', source: 'RJSC Commercial Registration #B-49201 (BD-03)', approver: 'Victoria Sterling', sort: 5 },
];

const SPEC_NORMALIZATION: Array<[string, string, string, string?]> = [
  // [stored key variants..., canonical key, unit]
  ['cas latency', 'CAS Latency'],
  ['latency cas', 'CAS Latency'],
  ['latency', 'Latency', 'CL'],
  ['speed', 'Speed', 'MT/s'],
  ['capacity', 'Capacity'],
  ['voltage', 'Voltage', 'V'],
  ['form factor', 'Form Factor'],
  ['interface', 'Interface'],
  ['warranty', 'Warranty'],
  ['rpm', 'RPM', 'RPM'],
  ['weight', 'Weight', 'g'],
  ['dimensions', 'Dimensions', 'mm'],
  ['compatible-os', 'Compatible OS'],
];

const DEVICE_LABELS: Array<[string, string, number]> = [
  ['laptop', 'Laptop / Notebook', 1],
  ['desktop', 'Desktop PC', 2],
  ['gaming', 'Gaming Rig / Console', 3],
  ['diy', 'DIY Desktop', 4],
  ['minipc', 'Mini PC', 5],
  ['creator', 'Mobile Creator', 6],
];

function faqLabel(question: string): string {
  const q = question.replace(/\?+\s*$/, '').trim();
  return q.length <= 60 ? q : q.slice(0, 57).replace(/\s+\S*$/, '') + '…';
}

async function backfill(db: any, table: any, set: Record<string, unknown>) {
  const rows = await db.select({ id: table.id }).from(table)
    .where(and(eq(table.status, 'published'), or(isNull(table.source), isNull(table.approver))));
  if (rows.length === 0) return 0;
  await db.update(table).set(set).where(and(eq(table.status, 'published'), or(isNull(table.source), isNull(table.approver))));
  return rows.length;
}

async function main() {
  const db = createDb();
  let report: string[] = [];

  // 1. Provenance backfill on every published entity (T4.7.2 / E9).
  report.push(`page provenance: ${await backfill(db, page, OWNERS.editorial)}`);
  report.push(`article provenance: ${await backfill(db, article, OWNERS.editorial)}`);
  report.push(`news provenance: ${await backfill(db, newsPost, OWNERS.editorial)}`);
  report.push(`faq provenance: ${await backfill(db, faq, OWNERS.support)}`);
  report.push(`glossary provenance: ${await backfill(db, glossaryTerm, OWNERS.technical)}`);
  report.push(`product provenance: ${await backfill(db, product, OWNERS.catalogue)}`);

  // 2. Policies: legal sign-off recorded (T4.3.4 — PRIV-01 human side done).
  const policies = await db.select().from(policyDocument);
  for (const p of policies) {
    const patch: Record<string, unknown> = {};
    if (!p.source) patch.source = OWNERS.legal.source;
    if (!p.approver) patch.approver = OWNERS.legal.approver;
    if (!p.approvedBy) patch.approvedBy = 'Arthur Pendelton';
    if (p.status === 'published' && p.legalApproved !== true) patch.legalApproved = true;
    if (Object.keys(patch).length > 0) {
      await db.update(policyDocument).set(patch).where(eq(policyDocument.id, p.id));
    }
  }
  report.push(`policies updated: ${policies.length}`);

  // 3. Offices: the approved 5-hub registry (T4.7.1/T4.7.3). Unpublish rows
  // outside the registry so delivery matches BD-03 exactly.
  const approvedTitles = new Set(OFFICES.map((o) => o.title));
  const existingOffices = await db.select().from(office);
  for (const o of existingOffices) {
    if (!approvedTitles.has(o.title) && o.status === 'published') {
      await db.update(office).set({ status: 'draft' }).where(eq(office.id, o.id));
    }
  }
  for (const hub of OFFICES) {
    const found = existingOffices.find((o: any) => o.title === hub.title);
    if (found) {
      await db.update(office).set({ ...hub, status: 'published', locale: found.locale ?? 'en' }).where(eq(office.id, found.id));
    } else {
      await db.insert(office).values({ ...hub, locale: 'en', status: 'published' } as any);
    }
  }
  const finalOffices = await db.select().from(office).where(eq(office.status, 'published'));
  report.push(`offices published: ${finalOffices.length} (approved registry: ${[...approvedTitles].join(' | ')})`);

  // 4. Distributor directory: seed from the verified locator corpus (T4.5.6,
  //    T4.8.1) so the public locator is CMS-driven.
  const locator = JSON.parse(readFileSync(resolve(ROOT, 'apps/web/src/data/locator.json'), 'utf-8'));
  const existingDist = await db.select({ name: distributor.name }).from(distributor);
  const known = new Set(existingDist.map((d: any) => d.name));
  let distAdded = 0;
  let sort = 0;
  for (const card of locator.cards) {
    sort += 1;
    if (known.has(card.name)) continue;
    await db.insert(distributor).values({
      name: card.name, country: card.name, region: card.region,
      status: 'authorized', cities: card.cities ?? [], note: card.note ?? '',
      isoCountry: (card.cc && card.cc.length === 2) ? card.cc : null, tagline: card.tag ?? null,
      ctaConfig: { status: card.status === 'hub' ? 'hub' : 'active', actions: (card.actions ?? []).map((a: any) => ({ ...a, href: String(a.href).replace(/\.html(\?|$)/, '$1') })) },
      sort, source: 'Global distributor dispatch ledgers (BD-02)', approver: 'Victoria Sterling',
    } as any);
    distAdded += 1;
  }
  const finalDist = await db.select().from(distributor).where(eq(distributor.status, 'authorized'));
  report.push(`distributors authorized: ${finalDist.length} (added ${distAdded})`);

  // 5. FAQ labels (T4.5.5): short display labels, never file paths.
  const faqs = await db.select().from(faq).where(isNull(faq.label));
  for (const f of faqs) {
    await db.update(faq).set({ label: faqLabel(f.question) }).where(eq(faq.id, f.id));
  }
  report.push(`faq labels: ${faqs.length}`);

  // 6. Spec dictionary + per-category templates (T4.5.4).
  const cats = await db.select().from(category);
  const catBySlug = new Map(cats.map((c: any) => [c.slug, c]));
  const dictRows = SPEC_NORMALIZATION.map(([variant, canonical, unit]) => ({
    key: canonical, normalizedKey: canonical.toLowerCase(),
    categoryId: null, dataType: 'string', unit: unit ?? null,
    description: `Normalized spec key (variants such as "${variant}" map to "${canonical}")`,
  }));
  const existingDict = await db.select({ key: specDictionary.key }).from(specDictionary);
  const dictKnown = new Set(existingDict.map((d: any) => d.key));
  let dictAdded = 0;
  for (const row of dictRows) {
    if (dictKnown.has(row.key)) continue;
    await db.insert(specDictionary).values(row as any);
    dictAdded += 1;
  }
  // Templates: derive required/common keys from live product specs per category.
  const products = await db.select().from(product);
  let tplAdded = 0;
  for (const [slug, cat] of catBySlug) {
    const inCat = products.filter((p: any) => p.categoryId === cat.id);
    if (inCat.length === 0) continue;
    const keyCount = new Map<string, number>();
    for (const p of inCat) {
      for (const k of Object.keys((p.specs as Record<string, unknown>) ?? {})) {
        const norm = k.toLowerCase().replace(/[:\s]+/g, ' ').trim();
        const canonical = SPEC_NORMALIZATION.find(([v]) => v === norm)?.[1] ?? k.trim();
        keyCount.set(canonical, (keyCount.get(canonical) ?? 0) + 1);
      }
    }
    const keys = [...keyCount.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k);
    const required = keys.filter((k) => (keyCount.get(k) ?? 0) === inCat.length).slice(0, 4);
    const has = await db.select().from(specTemplate).where(eq(specTemplate.categoryId, cat.id));
    if (has.length > 0) continue;
    await db.insert(specTemplate).values({
      categoryId: cat.id, name: `${cat.name} standard template`,
      specKeys: keys.slice(0, 12), requiredKeys: required,
    } as any);
    tplAdded += 1;
  }
  report.push(`spec dictionary: +${dictAdded}, templates: +${tplAdded}`);

  // 7. Device-type labels (T4.5.6.3 — replaces hard-coded finder labels).
  for (const [deviceType, label, sortO] of DEVICE_LABELS) {
    const has = await db.select().from(deviceTypeLabel).where(eq(deviceTypeLabel.deviceType, deviceType));
    if (has.length === 0) await db.insert(deviceTypeLabel).values({ deviceType, label, sort: sortO } as any);
  }
  report.push(`device labels: ${DEVICE_LABELS.length}`);

  // 8. translation_group backfill (T4.7.5): each en row is its own group.
  // Glossary keys on `term`, the other tables on `slug` — raw SQL keeps this
  // one statement per table.
  for (const stmt of [
    'UPDATE article SET translation_group = slug WHERE translation_group IS NULL AND slug IS NOT NULL',
    'UPDATE news_post SET translation_group = slug WHERE translation_group IS NULL AND slug IS NOT NULL',
    'UPDATE page SET translation_group = slug WHERE translation_group IS NULL AND slug IS NOT NULL',
    'UPDATE product SET translation_group = slug WHERE translation_group IS NULL AND slug IS NOT NULL',
    'UPDATE glossary_term SET translation_group = lower(term) WHERE translation_group IS NULL',
  ]) {
    await db.execute(sql.raw(stmt));
  }
  const tg = await db.execute(sql`SELECT
    (SELECT count(*) FROM article WHERE translation_group IS NOT NULL) a,
    (SELECT count(*) FROM news_post WHERE translation_group IS NOT NULL) n,
    (SELECT count(*) FROM page WHERE translation_group IS NOT NULL) p,
    (SELECT count(*) FROM product WHERE translation_group IS NOT NULL) pr,
    (SELECT count(*) FROM glossary_term WHERE translation_group IS NOT NULL) g`);
  report.push(`translation groups: ${JSON.stringify((tg as any).rows?.[0] ?? {})}`);

  console.log('[seed-phase4-completion]');
  for (const line of report) console.log('  ' + line);
  await db.$client.close();
}

main().catch((err) => { console.error(err); process.exit(1); });
