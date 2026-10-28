// Zero-trust audit — Iteration 2: live functional tests of every public app.
// Creates clearly-labelled audit rows (prefix AUDIT-) so they can be found later.
const API = 'http://127.0.0.1:8787/api/v1';
const WEB = 'http://127.0.0.1:4321';
import { readFileSync } from 'node:fs';
const env = readFileSync(new URL('../.env', import.meta.url), 'utf8');
const EMAIL = /^SEED_ADMIN_EMAIL=(.+)$/m.exec(env)[1].trim();
const PASS = /^SEED_ADMIN_PASSWORD=(.+)$/m.exec(env)[1].trim();

const results = [];
const check = (name, ok, detail) => { results.push({ name, ok, detail }); console.log(ok ? 'PASS' : 'FAIL', name, detail ?? ''); };

// --- admin session for registry lookups ---
const si = await fetch(API + '/auth/sign-in/email', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'http://localhost:5173' }, body: JSON.stringify({ email: EMAIL, password: PASS }) });
const cookie = (si.headers.get('set-cookie') ?? '').split(';')[0];
check('admin sign-in', si.status === 200);

// --- 1. SN-CHECK: valid serial ---
const serials = await (await fetch(API + '/admin/serials?limit=5', { headers: { cookie } })).json();
const aSerial = (serials.items ?? [])[0];
check('serial registry has rows', !!aSerial, JSON.stringify(aSerial).slice(0, 120));
if (aSerial) {
  const v = await (await fetch(API + '/sn-check', { method: 'POST', headers: { 'content-type': 'application/json', 'cf-connecting-ip': '198.51.100.77' }, body: JSON.stringify({ serial: aSerial.serial }) })).json();
  check('sn-check valid serial', v.result === 'valid', JSON.stringify(v).slice(0, 160));
  const iv = await (await fetch(API + '/sn-check', { method: 'POST', headers: { 'content-type': 'application/json', 'cf-connecting-ip': '198.51.100.77' }, body: JSON.stringify({ serial: 'AUDIT-BOGUS-9999' }) })).json();
  check('sn-check bogus serial', iv.result === 'unverified', JSON.stringify(iv).slice(0, 120));
}

// --- 2. RMA submission via public form ---
const rmaPost = await fetch(API + '/forms/rma', {
  method: 'POST', headers: { 'content-type': 'application/json', 'cf-connecting-ip': '198.51.100.78' },
  body: JSON.stringify({ type: 'rma', email: 'audit-probe@twinmos.dev', consent: true, payload: { name: 'Audit Probe', country: 'AE', product: 'VOLTX DDR5 16GB', serial: aSerial?.serial ?? 'TM-DEMO-0001', issue: 'Audit iteration-2 live functional probe — unit fails POST', purchaseDate: '2026-08-01' } }),
});
const rmaBody = await rmaPost.json();
check('RMA form accepted', rmaPost.status === 201 && !!rmaBody.rmaNumber, JSON.stringify(rmaBody).slice(0, 160));

// --- 3. RMA status check (public) ---
if (rmaBody.rmaNumber) {
  const st = await (await fetch(API + `/rma/${rmaBody.rmaNumber}`, { headers: { 'cf-connecting-ip': '198.51.100.79' } })).json();
  check('RMA status check', st.number === rmaBody.rmaNumber && st.status === 'submitted' && st.maskedInfo?.name, JSON.stringify(st).slice(0, 200));
}

// --- 4. Contact form ---
const ct = await fetch(API + '/forms/contact', {
  method: 'POST', headers: { 'content-type': 'application/json', 'cf-connecting-ip': '198.51.100.80' },
  body: JSON.stringify({ type: 'contact', email: 'audit-probe@twinmos.dev', consent: true, payload: { name: 'Audit Probe', message: 'Iteration-2 audit live form probe' } }),
});
check('contact form accepted', ct.status === 201, JSON.stringify(await ct.json()).slice(0, 120));

// --- 5. Compatibility finder SSR (server-rendered with query) ---
const comp = await fetch(WEB + '/compatibility?type=laptop&brand=Lenovo');
const compHtml = await comp.text();
check('compatibility SSR 200', comp.status === 200);
check('compatibility SSR renders results section', compHtml.includes('compat-results') || compHtml.includes('compat-card') || compHtml.includes('No exact') || compHtml.includes('matches'), `len=${compHtml.length}`);

// --- 6. SN-check widget page loads ---
const sup = await fetch(WEB + '/support');
const supHtml = await sup.text();
check('support page 200 with SN widget', sup.status === 200 && /serial/i.test(supHtml));

// --- 7. RMA page loads ---
const rmaPage = await fetch(WEB + '/rma');
check('RMA page 200', rmaPage.status === 200);

// --- 8. i18n bundles for all 9 locales ---
for (const loc of ['en','ar','hi','ru','zh-cn','fr','es','pt','de']) {
  const r = await fetch(API + `/i18n/${loc}`);
  check(`i18n ${loc}`, r.status === 200);
}

// --- 9. sitemap + robots ---
check('sitemap.xml', (await fetch(WEB + '/sitemap.xml')).status === 200);
check('robots.txt', (await fetch(WEB + '/robots.txt')).status === 200);

const fails = results.filter(r => !r.ok);
console.log(`\n=== FUNCTIONAL: ${results.length - fails.length}/${results.length} passed ===`);
if (fails.length) { console.log('FAILURES:', JSON.stringify(fails, null, 1)); process.exit(1); }
