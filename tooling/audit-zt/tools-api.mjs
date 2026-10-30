// ZT check TOOLS-API: the public business tools exercised end-to-end THROUGH THE
// EDGE as an anonymous visitor would, with staff-side effects checked through the
// real admin API and outbound mail checked at the mail mock. Every assertion is
// a business rule (BRD/URD) or a security property; failures are findings.
// Usage: node tooling/audit-zt/tools-api.mjs <out.json> [--plant]
import { writeFileSync } from 'node:fs';
import { edge, json, mails, Report } from './lib/edge.mjs';
import { signIn, loadAccounts } from './lib/staff.mjs';

const [outFile] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const plant = process.argv.includes('--plant');
const rep = new Report('tools-api');
const TS = 'XXXX.DUMMY.TOKEN.XXXX'; // Cloudflare's published test token (lab uses the always-pass test secret)
const uniq = Date.now().toString(36);
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
const mailsTo = async (addr) => (await mails()).filter((m) => JSON.stringify(m.body?.to ?? '').includes(addr)).map((m) => m.body);
const post = (p, body, headers = {}) => edge(p, { method: 'POST', body, headers });

const acc = loadAccounts();
const admin = (await signIn(acc.admin.email, acc.admin.password, acc.admin.totp)).jar;
const author = (await signIn(acc.author.email, acc.author.password)).jar;

// ---------- contact form ----------
{
  const email = `zt-contact-${uniq}@example.org`;
  const noCaptcha = await post('/api/v1/forms/contact', { email, consent: true, payload: { message: 'hello from the audit' } });
  rep.check('FORM-01 captcha required', noCaptcha.status === 400, { status: noCaptcha.status });
  const tok = await json(await edge('/api/v1/forms/token'));
  const ok = await post('/api/v1/forms/contact', { email, consent: true, formToken: tok.token, turnstileToken: TS, payload: { message: 'Audit contact message', name: 'ZT Visitor' } });
  const body = await json(ok);
  rep.check('FORM-02 contact accepted', ok.status === 201 && /^[A-Z]+-\d{4}-/.test(body.reference ?? ''), { status: ok.status, ref: body.reference });
  await pause(800);
  const customer = await mailsTo(email);
  rep.check('FORM-03 customer auto-reply sent', customer.some((m) => (m.text ?? '').includes(body.reference)), { n: customer.length });
  const noToken = await post('/api/v1/forms/contact', { email, consent: true, turnstileToken: TS, payload: { message: 'no form token' } });
  rep.check('FORM-04 form token mandatory', noToken.status === 400, { status: noToken.status, note: noToken.status === 201 ? 'submission accepted without the anti-spam form token' : undefined });
  const noConsent = await post('/api/v1/forms/contact', { email, consent: false, formToken: tok.token, turnstileToken: TS, payload: {} });
  rep.check('FORM-05 consent mandatory', noConsent.status === 422, { status: noConsent.status });
}
await pause(61_000); // forms limiter: 5 POST/min/IP

// ---------- idempotency replay must not leak another submission ----------
{
  const key = `zt-${uniq}-idem`;
  const tok = await json(await edge('/api/v1/forms/token'));
  const a = await json(await post('/api/v1/forms/contact', { email: `zt-idem-a-${uniq}@example.org`, consent: true, formToken: tok.token, turnstileToken: TS, payload: { message: 'first' } }, { 'idempotency-key': key }));
  const b = await json(await post('/api/v1/forms/contact', { email: `zt-idem-b-${uniq}@example.org`, consent: true, formToken: tok.token, turnstileToken: TS, payload: { message: 'different person' } }, { 'idempotency-key': key }));
  rep.check('FORM-06 idempotency key not replayable across bodies', !(a.reference && a.reference === b.reference), { a: a.reference, b: b.reference, note: a.reference === b.reference ? 'a different submitter received the first submitter\'s reference' : undefined });
}

// ---------- serial registry + warranty registration (BRD §F8.3) ----------
const custEmail = `zt-rma-${uniq}@example.org`;
const serials = [`ZTOK${uniq}`.toUpperCase(), `ZTOK2${uniq}`.toUpperCase(), `ZTOLD${uniq}`.toUpperCase()];
const freshToken = async () => (await json(await edge('/api/v1/forms/token'))).token;
{
  const csv = `serial,sku,manufacturedAt,batch\n${serials[0]},COREX-M2-PCIE-GEN-4-0-NVME-SSD,2025-11-02,ZT-B1\n${serials[1]},HYPER-SSD-H2-ULTRA,2025-08-14,ZT-B1\n${serials[2]},M2-2280-SSD-SATAIII,2019-03-01,ZT-B0\n`;
  const imp = await edge('/api/v1/admin/serials/import', { method: 'POST', body: { csv, dryRun: false } }, { jar: admin });
  rep.check('SN-01 registry CSV import', imp.status === 200, { status: imp.status });
  const reg = async (serial, email, purchaseDate) => edge('/api/v1/warranty/register', { method: 'POST', body: { serial, email, name: 'Zed Trust', country: 'Singapore', purchaseDate, consent: true, formToken: await freshToken(), turnstileToken: TS } });
  const confirmFor = async (email) => {
    await pause(700);
    const m = (await mailsTo(email)).filter((x) => /Confirm your TwinMOS warranty registration/.test(x.subject ?? '')).pop();
    const token = m && /confirm=([a-f0-9]{64})/.exec(m.text)?.[1];
    if (!token) return { status: 0 };
    const r = await edge('/api/v1/warranty/confirm', { method: 'POST', body: { token } });
    return { status: r.status, body: await json(r) };
  };
  // a squatter registers first but cannot confirm (no access to the owner's mailbox)
  const squat = await reg(serials[0], `squatter-${uniq}@example.org`, '2026-02-01'); // after the 2025-11-02 manufacture date
  rep.check('WTY-00 registration answers 202 pending (no oracle)', squat.status === 202, { status: squat.status });
  const w1 = await reg(serials[0], custEmail, '2026-01-15');
  const conf = await confirmFor(custEmail);
  rep.check('WTY-01 owner confirms by e-mail link → active (squatter pending does not block)', w1.status === 202 && conf.status === 200 && conf.body.status === 'active' && String(conf.body.expiresAt).startsWith('2031-01-15'), { status: conf.status, body: conf.body });
  const reuse = await edge('/api/v1/warranty/confirm', { method: 'POST', body: { token: '0'.repeat(64) } });
  await reuse.arrayBuffer();
  rep.check('WTY-01b forged/used confirmation token refused', reuse.status === 404, { status: reuse.status });
  // A second claimant gets the SAME answer and the SAME mail (the requester picks
  // the mailbox, so a different mail would be an oracle); the conflict surfaces
  // only after they prove the mailbox, as a 409 plus an alert to support.
  const dup = await reg(serials[0], `other-${uniq}@example.org`, '2026-01-15');
  const dupConf = await confirmFor(`other-${uniq}@example.org`);
  await pause(700);
  const dupMails = await mailsTo(`other-${uniq}@example.org`);
  const sameMail = dupMails.length > 0 && dupMails.every((m) => /Confirm your TwinMOS warranty registration/.test(m.subject ?? '') && !/already registered/i.test(m.text ?? ''));
  const disputeAlert = (await mailsTo('support@twinmos.com')).some((m) => /Warranty registration dispute/.test(m.subject ?? '') && (m.text ?? '').includes(serials[0]));
  rep.check('WTY-02 second claimant: same 202 and same mail; confirm → 409 + dispute alert to support', dup.status === 202 && sameMail && dupConf.status === 409 && disputeAlert, { status: dup.status, sameMail, confirm: dupConf.status, disputeAlert });
  await pause(61_000); // /warranty/* limiter: 10 requests/min/IP (6 used above; 7 more below)
  const fut = await reg(serials[1], custEmail, '2099-01-01');
  rep.check('WTY-03 future purchase date refused', fut.status === 422, { status: fut.status });
  const bogus = await reg(serials[1], custEmail, '2025-02-30');
  rep.check('WTY-03b impossible calendar date refused (422, not 500)', bogus.status === 422, { status: bogus.status });
  const unk = await reg(`ZTNOPE${uniq}`.toUpperCase(), custEmail, '2026-01-15');
  rep.check('WTY-04 serial outside the factory registry refused', unk.status === 422, { status: unk.status });
  const old = await reg(serials[2], custEmail, '2019-04-01');
  const oldConf = await confirmFor(custEmail);
  rep.check('WTY-05 old purchase registers as expired', old.status === 202 && oldConf.body?.status === 'expired', { status: oldConf.status, body: oldConf.body });
  const mine = await json(await edge('/api/v1/warranty/lookup', { method: 'POST', body: { serial: serials[0], email: custEmail } }));
  rep.check('WTY-06 owner lookup shows status', mine.status === 'active' && Boolean(mine.product), { body: mine });
  const theirs = await json(await edge('/api/v1/warranty/lookup', { method: 'POST', body: { serial: serials[0], email: `x-${uniq}@example.org` } }));
  rep.check('WTY-07 non-owner lookup reveals nothing', theirs.status === 'not_registered' && !theirs.purchaseDate, { body: theirs });
  const sn = await json(await post('/api/v1/sn-check', { serial: serials[0] }));
  rep.check('SN-02 registered serial verified genuine', sn.result === 'valid' && sn.sku === 'COREX-M2-PCIE-GEN-4-0-NVME-SSD', { result: sn.result });
  rep.check('SN-04 public SN check reveals no registration/warranty data (UR-17.1.5 via owner lookup)', !('warranty' in sn) && sn.warrantyLookup === '/support/warranty' && !JSON.stringify(sn).includes(custEmail), { keys: Object.keys(sn) });
  const bad = await json(await post('/api/v1/sn-check', { serial: `ZTFAKE${uniq}`.toUpperCase() }));
  rep.check('SN-03 unknown serial not verified', bad.result === 'unverified', { result: bad.result });
}
await pause(61_000); // forms limiter

// ---------- RMA intake (BR-6.2) → staff handling → public tracking ----------
let rmaNumber = null;
{
  const intake = async (serial, email) => post('/api/v1/forms/rma', { email, consent: true, formToken: await freshToken(), turnstileToken: TS, payload: { name: 'Zed Trust', product: 'TwinMOS CoreX M.2 PCIe Gen 4.0 NVMe SSD', serialNumber: serial, issue: 'Drive disappears from BIOS after warm reboot.', warrantyTier: 'premium-lifetime' } });
  const unreg = await intake(serials[1], custEmail);
  rep.check('RMA-02 BR-6.2 unregistered serial refused', unreg.status === 422 && (await json(unreg)).code === 'NOT_REGISTERED', { status: unreg.status });
  const expired = await intake(serials[2], custEmail);
  rep.check('RMA-02b BR-6.2 expired warranty refused', expired.status === 422 && (await json(expired)).code === 'WARRANTY_EXPIRED', { status: expired.status });
  const r = await intake(serials[0], custEmail);
  const b = await json(r);
  rmaNumber = b.rmaNumber;
  rep.check('RMA-01 intake creates case for a registered, in-warranty serial', r.status === 201 && /^TM-RMA-\d{4}-\d{6}$/.test(rmaNumber ?? ''), { status: r.status, body: b });
  const again = await intake(serials[0], custEmail);
  await again.arrayBuffer();
  rep.check('RMA-01b only one open RMA per serial', again.status === 409, { status: again.status });
  await pause(800);
  rep.check('RMA-03 confirmation mail with number', (await mailsTo(custEmail)).some((m) => (m.text ?? '').includes(rmaNumber)), {});
}
if (rmaNumber) {
  const list = await json(await edge(`/api/v1/admin/rma?q=${rmaNumber}`, {}, { jar: admin }));
  const item = (list.items ?? list.data ?? list).find?.((x) => x.number === rmaNumber);
  rep.check('RMA-04 case visible to staff', Boolean(item), {});
  rep.check('RMA-05 warranty tier set by the server from the registration', item?.warrantyTier === '5 Years', { warrantyTier: item?.warrantyTier });
  if (item) {
    const rr = await edge(`/api/v1/admin/rma/${item.id}/reply`, { method: 'POST', body: { text: 'Please ship the drive with the RMA number on the box. Internal note: customer flagged VIP.' } }, { jar: admin });
    rep.check('RMA-06 staff reply sent', rr.status === 201, { status: rr.status });
    const tr = await edge(`/api/v1/admin/rma/${item.id}/transition`, { method: 'POST', body: { to: 'under_review', note: 'Technician: suspect controller firmware; check batch 2025-11', notifyCustomer: false } }, { jar: admin });
    rep.check('RMA-07 legal transition', tr.status === 200, { status: tr.status });
    const bad = await edge(`/api/v1/admin/rma/${item.id}/transition`, { method: 'POST', body: { to: 'shipped' } }, { jar: admin });
    rep.check('RMA-08 illegal transition refused', bad.status === 422, { status: bad.status });
  }
  const legacy = await edge(`/api/v1/rma/${rmaNumber}`);
  await legacy.arrayBuffer();
  rep.check('RMA-09 number-only lookup no longer answers', legacy.status === 410, { status: legacy.status });
  const wrong = await edge('/api/v1/rma/track', { method: 'POST', body: { number: rmaNumber, email: `nobody-${uniq}@example.org` } });
  await wrong.arrayBuffer();
  rep.check('RMA-09b wrong e-mail gets the not-found answer', wrong.status === 404, { status: wrong.status });
  const owner = await edge('/api/v1/rma/track', { method: 'POST', body: { number: rmaNumber, email: custEmail } });
  const ownerBody = await owner.text();
  rep.check('RMA-11 owner can track with number + e-mail', owner.status === 200 && ownerBody.includes('under_review'), { status: owner.status });
  const leaks = [custEmail, 'Internal note', 'Technician:', 'Reply sent'].filter((x) => ownerBody.includes(x));
  rep.check('RMA-10 tracking response carries no PII/staff notes', leaks.length === 0, { leaks });
  let throttled = false;
  for (let i = 0; i < 14; i++) { const x = await edge(`/api/v1/forms/rma/TM-RMA-2026-${String(100000 + i)}`); await x.arrayBuffer(); if (x.status === 429) { throttled = true; break; } }
  rep.check('RMA-12 lookup paths rate-limited', throttled, { note: throttled ? undefined : '14 lookups/min accepted' });
}

// ---------- compatibility finder ----------
{
  const all = await json(await edge('/api/v1/delivery/compatibility'));
  const wild = await json(await edge('/api/v1/delivery/compatibility?brand=%25'));
  const n = (x) => (x.data ?? x).length ?? 0;
  rep.check('COMPAT-01 finder returns rules', n(all) > 0, { n: n(all) });
  rep.check('COMPAT-02 LIKE wildcards escaped', n(wild) === 0, { n: n(wild), note: n(wild) ? '"%" returns the whole table' : undefined });
  const asus = await json(await edge('/api/v1/delivery/compatibility?brand=ASUS'));
  rep.check('COMPAT-03 brand filter works', n(asus) > 0 && (asus.data ?? asus).every((r) => /asus/i.test(r.deviceBrand ?? r.device_brand ?? '')), { n: n(asus) });
}

// (distributor ?status= is a public display-category filter — hub/authorized/
// expanding/seeking — not a draft state, so it is not a leak; verified 2026-10-28)

// ---------- search robustness ----------
{
  const q = encodeURIComponent('memory '.repeat(400));
  const t0 = Date.now();
  const s = await edge(`/api/v1/delivery/search?q=${q}`);
  await s.arrayBuffer();
  const ms = Date.now() - t0;
  rep.check('SEARCH-01 oversized query bounded', s.status === 400 || s.status === 422 || ms < 1500, { status: s.status, ms });
  const ok = await json(await edge('/api/v1/delivery/search?q=corex'));
  rep.check('SEARCH-02 search finds CoreX', JSON.stringify(ok).toLowerCase().includes('corex'), {});
}

// ---------- newsletter double opt-in ----------
{
  const email = `zt-nl-${uniq}@example.org`;
  await pause(61_000);
  const sub = async (e) => post('/api/v1/forms/newsletter', { email: e, turnstileToken: TS, fillTimeMs: 3000, formToken: await freshToken() });
  const noTok = await post('/api/v1/forms/newsletter', { email, turnstileToken: TS, fillTimeMs: 3000 });
  rep.check('NL-00 form token required', noTok.status === 400, { status: noTok.status });
  const s = await sub(email);
  rep.check('NL-01 subscribe pending', s.status === 201, { status: s.status });
  await pause(800);
  const m = (await mailsTo(email)).find((x) => /confirm/i.test(x.subject ?? ''));
  const confirmTok = m && /newsletter\?confirm=([a-f0-9]{64})/.exec(m.text)?.[1];
  const unsubTok = m && /newsletter\?unsubscribe=([a-f0-9]{64})/.exec(m.text)?.[1];
  rep.check('NL-02 separate confirm/unsubscribe tokens; links open the site page', Boolean(confirmTok && unsubTok && confirmTok !== unsubTok), {});
  // a mail link scanner fetching the old-style API GET must not change state
  const scan = await edge(`/api/v1/forms/newsletter/confirm?token=${confirmTok}`);
  await scan.arrayBuffer();
  rep.check('NL-03 GET on the confirm URL does not confirm (redirects to the page)', scan.status === 303 && /\/newsletter\?confirm=/.test(scan.headers.get('location') ?? ''), { status: scan.status });
  const page = await edge(`/newsletter?confirm=${confirmTok}`);
  rep.check('NL-04 landing page offers an explicit confirm button', page.status === 200 && (await page.text()).includes('id="nlAction"'), { status: page.status });
  const viaUnsub = await edge('/api/v1/forms/newsletter/confirm', { method: 'POST', body: { token: unsubTok } });
  await viaUnsub.arrayBuffer();
  rep.check('NL-02b unsubscribe token cannot confirm', viaUnsub.status === 404, { status: viaUnsub.status });
  const ok = await edge('/api/v1/forms/newsletter/confirm', { method: 'POST', body: { token: confirmTok } });
  await ok.arrayBuffer();
  rep.check('NL-05 explicit POST confirms', ok.status === 200, { status: ok.status });
  const again = await edge('/api/v1/forms/newsletter/confirm', { method: 'POST', body: { token: confirmTok } });
  await again.arrayBuffer();
  rep.check('NL-06 confirmation token is one-time', again.status === 404, { status: again.status });
  const dupe = await sub(email);
  const dupeBody = await json(dupe);
  rep.check('NL-07 already-subscribed address gets the same answer (no oracle)', dupe.status === 201 && dupeBody.status === 'pending', { status: dupe.status });
  const badEmail = await post('/api/v1/forms/newsletter', { email: 'a@', turnstileToken: TS, fillTimeMs: 3000, formToken: await freshToken() });
  rep.check('NL-08 malformed email rejected', badEmail.status === 422, { status: badEmail.status });
  let limited = false;
  for (let i = 0; i < 7; i++) { const u = await edge(`/api/v1/forms/newsletter/unsubscribe?token=${'f'.repeat(64)}`, { method: 'POST' }); await u.arrayBuffer(); if (u.status === 429) limited = true; }
  rep.check('NL-09 one-click unsubscribe never throttled by the forms limiter', !limited, {});
  // ZT-086: token pages are private — never served from a shared cache to the next visitor
  const tA = 'a'.repeat(64), tB = 'b'.repeat(64);
  const pA = await edge(`/newsletter?confirm=${tA}`);
  const hA = await pA.text();
  const pB = await edge(`/newsletter?unsubscribe=${tB}`);
  const hB = await pB.text();
  rep.check('NL-10 token pages are private (no-store) and never show another visitor\'s token', /no-store/.test(pA.headers.get('cache-control') ?? '') && /no-store/.test(pB.headers.get('cache-control') ?? '') && hB.includes(tB) && !hB.includes(tA) && hA.includes(tA), { ccA: pA.headers.get('cache-control'), ccB: pB.headers.get('cache-control'), leak: hB.includes(tA) });
}
await pause(61_000);

// ---------- misc ----------
{
  const arts = await json(await edge('/api/v1/delivery/search?q=compatibility'));
  const slug = JSON.stringify(arts).match(/"slug":"([a-z0-9-]+)"/g)?.map((x) => x.slice(8, -1)).find(Boolean) ?? 'how-to-check-your-motherboard-and-ram-compatibility';
  const noTokVote = await post('/api/v1/forms/content-feedback', { entity: 'article', slug, helpful: true });
  rep.check('ART-00 vote needs a form token', noTokVote.status === 400, { status: noTokVote.status });
  const vote = await post('/api/v1/forms/content-feedback', { entity: 'article', slug, helpful: true, formToken: await freshToken() });
  rep.check('ART-01 "Was this helpful?" vote is stored', vote.status === 201, { status: vote.status, slug });
  const junk = await post('/api/v1/forms/content-feedback', { entity: 'article', slug: 'no-such-article-zt', helpful: true, formToken: await freshToken() });
  rep.check('ART-02 vote for unknown content refused', junk.status === 404, { status: junk.status });
  const metrics = await edge('/api/v1/metrics');
  await metrics.arrayBuffer();
  rep.check('OPS-01 /metrics not public', metrics.status === 401 || metrics.status === 403 || metrics.status === 404, { status: metrics.status });
  const deep = await edge('/api/v1/health/deep');
  await deep.arrayBuffer();
  rep.check('OPS-02 /health/deep not public', deep.status === 401, { status: deep.status });
  const pt = await edge('/api/v1/delivery/preview-token', { method: 'POST', body: { entityType: 'page', entityId: 1 } }, { jar: author });
  rep.check('PREV-01 author cannot mint preview tokens for pages they do not own', pt.status === 403, { status: pt.status });
}

if (plant) rep.check('PLANTED', false, { note: '--plant: proves this check can fail' });
writeFileSync(outFile, JSON.stringify(rep.summary(), null, 2));
console.log(`tools-api: ${rep.items.length} checks, ${rep.failed.length} failed`);
process.exit(rep.failed.length ? 1 : 0);
