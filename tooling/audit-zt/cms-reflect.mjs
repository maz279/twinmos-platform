// ZT check CMS: an editor edits a SEEDED page through the real admin API (MFA
// session through the edge), the change reaches an anonymous visitor within 5 s
// (G-REFLECT), unpublishing takes the page down, an author cannot publish,
// the block contract rejects a script URL, and every mutation is audited.
// Usage: node tooling/audit-zt/cms-reflect.mjs <out.json> [--plant]
import { writeFileSync } from 'node:fs';
import { edge, json, Report } from './lib/edge.mjs';
import { signIn, loadAccounts } from './lib/staff.mjs';

const [outFile] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const plant = process.argv.includes('--plant');
const rep = new Report('cms-reflect');
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
const acc = loadAccounts();
const editor = (await signIn(acc.editor.email, acc.editor.password, acc.editor.totp)).jar;
const author = (await signIn(acc.author.email, acc.author.password)).jar;
const admin = (await signIn(acc.super_admin.email, acc.super_admin.password, acc.super_admin.totp)).jar;

const list = await json(await edge('/api/v1/admin/content/page?limit=100', {}, { jar: editor }));
const rows = list.items ?? list.data ?? list;
const about = rows.find?.((p) => p.slug === 'about');
rep.check('CMS-01 editor lists seeded pages', Boolean(about), { n: rows?.length });
if (about) {
  const full = await json(await edge(`/api/v1/admin/content/page/${about.id}`, {}, { jar: editor }));
  const blocks = full.blocks ?? full.data?.blocks;
  const marker = `ZT reflect ${Date.now().toString(36)}`;
  const edited = blocks.map((b) => (b.type === 'page-hero' ? { ...b, lede: `${b.lede} ${marker}` } : b));
  const save = await edge(`/api/v1/admin/content/page/${about.id}`, { method: 'PATCH', body: { blocks: edited, version: full.version } }, { jar: editor });
  const saveBody = await json(save);
  rep.check('CMS-02 seeded page saves through the block contract', save.status === 200, { status: save.status, body: JSON.stringify(saveBody).slice(0, 300) });
  const t0 = Date.now();
  let seenMs = -1;
  for (let i = 0; i < 20 && seenMs < 0; i++) {
    const html = await (await edge(`/about?zt=${Date.now()}`)).text();
    if (html.includes(marker)) seenMs = Date.now() - t0;
    else await pause(500);
  }
  rep.check('CMS-03 G-REFLECT: published edit visible to visitors within 5 s', seenMs >= 0 && seenMs <= 5000, { seenMs });
  const evil = blocks.map((b, i) => (i === blocks.length - 1 && b.type === 'cta-banner' ? { ...b, ctas: [{ label: 'x', url: 'java\tscript:alert(1)' }] } : b));
  const bad = await edge(`/api/v1/admin/content/page/${about.id}`, { method: 'PATCH', body: { blocks: evil } }, { jar: editor });
  await bad.arrayBuffer();
  rep.check('CMS-04 script URL rejected by the block contract', bad.status === 422, { status: bad.status });
  const restore = await edge(`/api/v1/admin/content/page/${about.id}`, { method: 'PATCH', body: { blocks } }, { jar: editor });
  await restore.arrayBuffer();
  const unpub = await edge(`/api/v1/admin/content/page/${about.id}/transition`, { method: 'POST', body: { to: 'draft' } }, { jar: editor });
  await unpub.arrayBuffer();
  await pause(5500);
  const gone = await edge(`/about?zt=${Date.now()}`);
  const goneHtml = await gone.text();
  rep.check('CMS-05 unpublished page no longer served', unpub.status === 200 && (gone.status === 404 || !goneHtml.includes('Engineering confidence since 1998')), { unpub: unpub.status, status: gone.status });
  const authorPub = await edge(`/api/v1/admin/content/page/${about.id}/transition`, { method: 'POST', body: { to: 'published' } }, { jar: author });
  await authorPub.arrayBuffer();
  rep.check('CMS-06 author cannot publish', authorPub.status === 403, { status: authorPub.status });
  // T4.7.2: publishing needs a source AND an approver. The seeded pages carry no
  // approver (the invented ones were cleared), so a republish must be refused
  // until a real person is recorded — here the lab editor account.
  const noProv = await edge(`/api/v1/admin/content/page/${about.id}/transition`, { method: 'POST', body: { to: 'published' } }, { jar: editor });
  const noProvBody = await json(noProv);
  rep.check('CMS-07a republish refused without an approver (provenance rule)', noProv.status === 422 && /provenance/i.test(noProvBody.title ?? ''), { status: noProv.status, title: noProvBody.title });
  const cur = await json(await edge(`/api/v1/admin/content/page/${about.id}`, {}, { jar: editor }));
  const prov = await edge(`/api/v1/admin/content/page/${about.id}`, { method: 'PATCH', body: { approver: acc.editor.email, version: cur.version } }, { jar: editor });
  await prov.arrayBuffer();
  const repub = await edge(`/api/v1/admin/content/page/${about.id}/transition`, { method: 'POST', body: { to: 'published' } }, { jar: editor });
  const repubBody = await json(repub);
  rep.check('CMS-07 editor records an approver and republishes', prov.status === 200 && repub.status === 200, { prov: prov.status, status: repub.status, body: JSON.stringify(repubBody).slice(0, 200) });
  const audit = await json(await edge('/api/v1/admin/audit?limit=50', {}, { jar: admin }));
  const auditRows = JSON.stringify(audit);
  rep.check('CMS-08 page edits and transitions are audited', /content\.|page/.test(auditRows) && auditRows.includes(String(about.id)), {});
}
if (plant) rep.check('PLANTED', false, { note: '--plant: proves this check can fail' });
writeFileSync(outFile, JSON.stringify(rep.summary(), null, 2));
console.log(`cms-reflect: ${rep.items.length} checks, ${rep.failed.length} failed`);
process.exit(rep.failed.length ? 1 : 0);
