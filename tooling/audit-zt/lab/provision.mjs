// Provisions one real account per role on the lab stack THROUGH THE PRODUCT'S OWN
// FLOWS (seeded super admin → TOTP enrolment → staff invites → e-mail
// verification links from the mail mock → partner org + member invite).
// Writes credentials to lab/.state/accounts.json (git-ignored).
import { edge, json, mails } from '../lib/edge.mjs';
import { signIn, enrolTotp, loadAccounts, saveAccounts } from '../lib/staff.mjs';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const env = Object.fromEntries(readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'lab.vars'), 'utf8')
  .split('\n').filter((l) => l && !l.startsWith('#')).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]));
const acc = loadAccounts();
const log = (...a) => console.log('[provision]', ...a);
const die = (m) => { console.error('[provision] FAIL', m); process.exit(1); };

async function latestMailTo(addr, re) {
  for (let i = 0; i < 20; i++) {
    const all = (await mails()).filter((m) => m.body && [].concat(m.body.to).includes(addr) && re.test(m.body.subject ?? ''));
    if (all.length) return all[all.length - 1].body;
    await new Promise((r) => setTimeout(r, 500));
  }
  return null;
}
async function verifyEmail(addr) {
  const m = await latestMailTo(addr, /verify/i);
  if (!m) die(`no verification mail for ${addr}`);
  const url = new URL(/https?:\/\/\S+/.exec(m.text)[0]);
  const r = await edge(url.pathname + url.search);
  log('verify', addr, r.status);
}

// 1. super admin
if (!acc.super_admin) acc.super_admin = { email: env.SEED_ADMIN_EMAIL, password: env.SEED_ADMIN_PASSWORD };
let s = await signIn(acc.super_admin.email, acc.super_admin.password, acc.super_admin.totp);
if (s.res.status !== 200) die(`super_admin sign-in ${s.res.status} ${JSON.stringify(s.body)}`);
if (!acc.super_admin.totp) { acc.super_admin.totp = await enrolTotp(s.jar, acc.super_admin.password); saveAccounts(acc); log('super_admin TOTP enrolled'); }
s = await signIn(acc.super_admin.email, acc.super_admin.password, acc.super_admin.totp);
if (s.res.status !== 200) die(`super_admin MFA sign-in ${s.res.status}`);
const sa = s.jar;

// 2. staff roles
for (const role of ['admin', 'editor', 'author', 'viewer']) {
  if (acc[role]?.ready) continue;
  if (!acc[role]?.email) { // resumable: an earlier run may have invited + verified already
    const email = `zt-${role}@twinmos.com`;
    const password = `ZT-${role}-${crypto.randomUUID().slice(0, 12)}!`;
    const r = await edge('/api/v1/admin/users/invite', { method: 'POST', body: { email, name: `ZT ${role}`, role, password } }, { jar: sa });
    const b = await json(r);
    if (r.status !== 201) die(`invite ${role}: ${r.status} ${JSON.stringify(b).slice(0, 300)}`);
    acc[role] = { email, password };
    saveAccounts(acc);
    await verifyEmail(email);
  }
  const { email, password } = acc[role];
  const u = await signIn(email, password);
  if (u.res.status !== 200) die(`${role} sign-in ${u.res.status} ${JSON.stringify(u.body).slice(0, 200)}`);
  if (['admin', 'editor'].includes(role)) acc[role].totp = await enrolTotp(u.jar, password);
  acc[role].ready = true;
  saveAccounts(acc);
  log(role, 'ready', acc[role].totp ? '(TOTP)' : '(no TOTP)');
}

// 3. partner org + member: verification link, then the single-use set-password
//    link (the invite never carries a password — ZT-014)
if (!acc.partner?.ready) {
  const o = await edge('/api/v1/admin/partner-orgs', { method: 'POST', body: { name: 'ZT Audit Partner Org', type: 'distributor', status: 'active', country: 'Singapore' } }, { jar: sa });
  const org = await json(o);
  if (o.status !== 201 && o.status !== 200) die(`partner org ${o.status} ${JSON.stringify(org).slice(0, 300)}`);
  // orgs are created 'pending'; activation is a separate admin approval step
  const act = await edge(`/api/v1/admin/partner-orgs/${org.id}`, { method: 'PATCH', body: { status: 'active' } }, { jar: sa });
  if (act.status !== 200) die(`partner org activation ${act.status} ${await act.text()}`);
  const email = 'zt-partner@twinmos.com';
  const m = await edge(`/api/v1/admin/partner-orgs/${org.id}/members`, { method: 'POST', body: { email, role: 'staff' } }, { jar: sa });
  if (m.status !== 201) die(`partner member ${m.status} ${await m.text()}`);
  const invite = await latestMailTo(email, /partner portal invitation/i);
  acc.partner = { email, orgId: org.id, passwordInInviteMail: /password is:/i.test(invite?.text ?? '') };
  saveAccounts(acc);
  await verifyEmail(email);
  const resetMail = await latestMailTo(email, /password reset/i);
  if (!resetMail) die('no set-password mail for partner');
  const link = new URL(/https?:\/\/\S+/.exec(resetMail.text)[0]);
  const hop = await edge(link.pathname + link.search); // Better Auth → 302 to the console with ?token=
  const token = new URL(hop.headers.get('location') ?? '', 'https://www.twinmos.com').searchParams.get('token');
  const newPw = `ZT-partner-${crypto.randomUUID().slice(0, 12)}!`;
  const rp = await edge('/api/v1/auth/reset-password', { method: 'POST', body: { newPassword: newPw, token } });
  log('partner set-password', hop.status, rp.status);
  acc.partner.password = newPw;
  const p = await signIn(email, newPw);
  log('partner sign-in', p.res.status);
  const me = await edge('/api/v1/partner/me', {}, { jar: p.jar });
  log('partner portal /partner/me', me.status);
  acc.partner.ready = p.res.status === 200;
  saveAccounts(acc);
}
log('done', Object.keys(acc).join(', '));
