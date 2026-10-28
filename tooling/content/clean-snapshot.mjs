// Applies the truth corrections to a raw CMS export before it becomes the
// production content snapshot (apps/api/content/snapshot). Source of truth:
// twinmos_mirror/authoritative_facts.md (crawl of www.twinmos.com, 2026-09-23).
// Every correction is listed in apps/api/content/CORRECTIONS.md so the content
// owner can review exactly what changed and why. Nothing here invents facts:
// unverifiable rows are withheld (draft / removed), never rewritten into claims.
// Usage: node tooling/content/clean-snapshot.mjs <rawExportDir> [outDir]
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const [rawDir, outDir = 'apps/api/content/snapshot'] = process.argv.slice(2);
if (!rawDir) { console.error('usage: clean-snapshot.mjs <rawExportDir> [outDir]'); process.exit(2); }
const load = (t) => JSON.parse(readFileSync(join(rawDir, `${t}.json`), 'utf8'));
const log = [];
const note = (table, what, why) => log.push({ table, what, why });
const FACTS = 'twinmos_mirror/authoritative_facts.md (www.twinmos.com crawl 2026-09-23)';

const tables = {};
for (const f of readdirSync(rawDir).filter((f) => f.endsWith('.json') && !f.startsWith('_'))) tables[f.slice(0, -5)] = load(f.slice(0, -5));

// 1. Provenance: every "approver" value in the export is an invented persona —
//    no such person exists in the repo history or the client documents.
const PERSONAS = /^(Victoria Sterling|Tariq Al-Mansoor|Tariq Al-Hashimi|Marcus Brody|Elena Rostova|David Vance)$/;
for (const [t, rows] of Object.entries(tables)) {
  let n = 0;
  for (const r of rows) if (typeof r.approver === 'string' && PERSONAS.test(r.approver)) { r.approver = null; n++; }
  if (n) note(t, `cleared approver on ${n} row(s)`, 'approver names are invented personas, not real sign-offs');
}

// 2. Offices — exactly the five on twinmos.com/contact. The US address on the
//    live site ("12345 Silicon Valley Blvd") reads as a placeholder, so that
//    row is kept as DRAFT for the content owner to confirm, not published.
const now = '2026-10-28T00:00:00.000Z'; // fixed: regenerating the snapshot must not churn it
const office = (id, sort, role, title, entity, address, flag, status) => ({
  id, role, title, entity, address, flag, note: null, sort, locale: 'en', created_at: now, updated_at: now,
  status, source: 'www.twinmos.com/contact (crawl 2026-09-23)', approver: null,
});
note('office', `replaced ${tables.office.length} rows with the 5 offices listed on twinmos.com`, `removed Dhaka (prohibited contamination), Hong Kong (not an office), and wrong Dubai/Taipei/San Jose/Cologne addresses — ${FACTS}`);
tables.office = [
  office(1, 1, 'HQ & R&D Center', 'Taiwan Headquarters', 'TwinMOS Technologies Ltd.', '5F.-5, No. 29, Sec. 1, Minsheng E. Rd., Zhongshan Dist., Taipei City 104619, Taiwan (R.O.C.)', 'TW', 'published'),
  office(2, 2, 'International office (MEA/CIS operations)', 'Dubai Office', 'TwinMOS Technologies', 'C-9, DAFZA (Dubai Airport Free Zone), Dubai, UAE', 'AE', 'published'),
  office(3, 3, 'Manufacturing facility', 'China Manufacturing', 'TwinMOS Technologies Co., Ltd.', 'No. 5, Tech Road, Dongguan, Guangdong, China', 'CN', 'published'),
  office(4, 4, 'European office', 'Europe Office', 'TwinMOS Europe GmbH', 'Schanzenstraße 23, 51063 Cologne, Germany', 'DE', 'published'),
  office(5, 5, 'US office', 'USA Office', 'TwinMOS America Inc.', '12345 Silicon Valley Blvd, Suite 100, San Jose, CA 95123, USA', 'US', 'published'),
];
note('office', 'USA office published exactly as on twinmos.com', 'the address (12345 Silicon Valley Blvd) reads like a placeholder on the live site itself — listed in CLAIMS_REVIEW.md for the content owner');

// 3. Testimonials — no permission evidence exists for any quoted person.
for (const r of tables.testimonial) if (r.status === 'published') { r.status = 'draft'; r.permission_evidence = null; }
note('testimonial', `unpublished ${tables.testimonial.length} testimonial(s)`, 'quoted people are not verifiable; publishing invented endorsements is prohibited (roadmap §2.3 rule 8)');

// 4. Job postings — no openings are listed on twinmos.com/career.
for (const r of tables.job_posting) if (r.status === 'published') r.status = 'draft';
note('job_posting', `unpublished ${tables.job_posting.length} posting(s)`, 'roles and salary bands have no source; HR must publish real openings');

// 5. Products — invented prices and test residue.
for (const p of tables.product) {
  if (p.price_usd != null) { note('product', `${p.sku}: removed price ${p.price_usd}`, 'price not published on twinmos.com'); p.price_usd = null; }
  if (/probe|test|e2e/i.test(p.warranty ?? '')) { note('product', `${p.sku}: removed warranty "${p.warranty}"`, 'e2e test residue'); p.warranty = null; }
  if (/^part no\.?$/i.test((p.short_spec ?? '').trim())) { note('product', `${p.sku}: removed short spec "${p.short_spec}"`, 'label fragment scraped as a spec'); p.short_spec = null; }
}

// 6. Distributors / marketplaces — unverifiable named partners and store URLs.
const named = tables.distributor.filter((d) => !d.source);
tables.distributor = tables.distributor.filter((d) => d.source);
note('distributor', `removed ${named.length} named companies (${named.map((d) => d.name).join(', ')})`, 'no named distributor appears on twinmos.com; Supertron is explicitly flagged unverified in the fact base');
note('marketplace_listing', `removed ${tables.marketplace_listing.length} listing(s)`, 'store URLs were never verified (verified_at null)');
tables.marketplace_listing = [];

// 7. Settings — contact data exactly as on twinmos.com.
for (const s of tables.setting) {
  if (s.key === 'site.contact') { s.value = { ...s.value, phone: '+886 970-368-077', email: 'sales@twinmos.com' }; note('setting', 'site.contact phone/email', `+886 2 2659 0880 / info@ are not on twinmos.com — ${FACTS}`); }
  if (s.key === 'site.whatsapp') { s.value = { ...s.value, waUrl: 'https://wa.me/886970368077', phoneNumber: '886970368077' }; note('setting', 'site.whatsapp number', 'twinmos.com WhatsApp link uses +886 970 368 077'); }
  if (s.key === 'site.cookie' && /legal.html#cookies/.test(s.value?.policyUrl ?? '')) { s.value = { ...s.value, policyUrl: '/legal?tab=privacy' }; note('setting', 'site.cookie.policyUrl → /legal?tab=privacy', 'old anchor matched no policy tab'); }
  if (s.key === 'site.figures') { s.value = { ...s.value, productCount: tables.product.filter((p) => p.status === 'published').length }; note('setting', 'site.figures.productCount = published catalogue size', 'was 40 against a 39-SKU catalogue'); }
  if (s.key === 'integrations') { s.value = { ...s.value, turnstileSiteKey: '' }; note('setting', 'integrations.turnstileSiteKey cleared', 'placeholder key 0x4AAAAAAAx disabled the captcha widget; the deploy-time key (PUBLIC_TURNSTILE_SITE_KEY) applies instead'); }
}

// 7b. Policies: the "legal approval" by "H. Lin, Legal Counsel" comes from the
//     withdrawn, fabricated claims register — no named counsel exists in the
//     fact base. Approval is cleared (delivery then withholds the policies) until
//     a real legal owner approves real texts. Duplicate short-slug copies are archived.
for (const pd of tables.policy_document) {
  if (pd.legal_approved || pd.approver || pd.approved_by) {
    note('policy_document', `${pd.slug}: cleared legal approval (approver "${pd.approver ?? ''}")`, 'sign-off by a person who does not exist in the client records; Terms (105 chars) and Warranty (124 chars) bodies are one-sentence stubs');
    pd.legal_approved = false; pd.approver = null; pd.approved_by = null;
  }
  if ((pd.slug === 'privacy' && tables.policy_document.some((x) => x.slug === 'privacy-policy')) || (pd.slug === 'warranty' && tables.policy_document.some((x) => x.slug === 'warranty-policy'))) {
    pd.status = 'archived';
    note('policy_document', `${pd.slug}: archived duplicate`, `duplicate of ${pd.slug}-policy`);
  }
}

// 8. Navigation entry point for the warranty registration & lookup feature.
{
  let id = Math.max(...tables.nav_item.map((i) => i.id));
  const parents = tables.nav_item.filter((i) => i.target_url === '/rma' && i.title === 'Warranty & RMA');
  for (const p of parents) {
    if (tables.nav_item.some((i) => i.target_url === '/support/warranty' && i.menu_id === p.menu_id)) continue;
    tables.nav_item.push({ ...p, id: ++id, title: 'Warranty registration', target_url: '/support/warranty', sort: p.sort });
  }
  note('nav_item', `added "Warranty registration" → /support/warranty next to each "Warranty & RMA" link (${parents.length} menus)`, 'entry point for the warranty registration & lookup feature (BRD §F8.3)');
}

mkdirSync(outDir, { recursive: true });
const manifest = {};
for (const [t, rows] of Object.entries(tables)) {
  writeFileSync(join(outDir, `${t}.json`), JSON.stringify(rows, null, 1) + '\n');
  manifest[t] = rows.length;
}
writeFileSync(join(outDir, '_manifest.json'), JSON.stringify({ source: 'dev CMS export 2026-10-28, cleaned by tooling/content/clean-snapshot.mjs', tables: manifest }, null, 1) + '\n');
const md = ['# Content snapshot — truth corrections', '', `Applied by \`tooling/content/clean-snapshot.mjs\` against ${FACTS}.`, 'The content owner reviews this list before go-live; withheld rows stay in the snapshot as drafts where the table supports it.', '', '| Table | Change | Reason |', '|---|---|---|', ...log.map((l) => `| ${l.table} | ${l.what} | ${l.why} |`), ''];
writeFileSync(join(outDir, '..', 'CORRECTIONS.md'), md.join('\n'));
console.log(JSON.stringify(manifest));
console.log(`${log.length} corrections`);
