// P7: local OWASP-oriented security scan (ZAP-baseline-equivalent for the dev
// workstation; ZAP itself is a staging-VM step — see docs/p7-evidence.md §4).
//
// Host policy (Mimosa constraint): only http/https targets; by default the
// scanner REFUSES localhost/loopback/private/reserved hosts. Scanning your own
// dev server is exactly the exception — opt in explicitly with --allow-private.
//
// Usage:
//   node --experimental-strip-types --no-warnings tooling/owasp-local-scan.mjs \
//        --target http://localhost:8787 --allow-private
//
// Exit 0 = all checks pass; exit 1 = findings (each printed with severity).
import { parseArgs } from 'node:util';
import { isIP } from 'node:net';
import { lookup } from 'node:dns/promises';

const { values } = parseArgs({
  options: {
    target: { type: 'string' },
    'allow-private': { type: 'boolean' },
  },
});

const TARGET = values.target;
if (!TARGET) { console.error('--target required (e.g. https://staging.twinmos.com)'); process.exit(2); }

// ---- host validation (never request loopback/private/reserved unless explicitly allowed) ----
const u = new URL(TARGET);
if (!['http:', 'https:'].includes(u.protocol)) { console.error(`refused: scheme ${u.protocol}`); process.exit(2); }
const host = u.hostname;
const literal = isIP(host) ? host : null;
const PRIVATE_V4 = (ip) => /^(10\.|127\.|0\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|19[23]\.168\.)/.test(ip) || ip.startsWith('fc') || ip.startsWith('fd') || ip.startsWith('fe80');
let isPrivate = false;
if (literal) {
  isPrivate = literal === '::1' || literal.startsWith('fe80') || PRIVATE_V4(literal);
} else if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.internal')) {
  isPrivate = true;
} else {
  try {
    const { address } = await lookup(host);
    isPrivate = PRIVATE_V4(address) || address === '::1';
  } catch {
    console.error(`refused: cannot resolve ${host}`); process.exit(2);
  }
}
if (isPrivate && !values['allow-private']) {
  console.error(`refused: ${host} resolves to a private/loopback address. Pass --allow-private to scan a local dev server deliberately.`);
  process.exit(2);
}

const BASE = u.origin;
const findings = [];
const checks = [];
let requestCount = 0;

async function req(path, init = {}) {
  requestCount += 1;
  try {
    const res = await fetch(BASE + path, { redirect: 'manual', ...init });
    return res;
  } catch (e) {
    return { status: -1, headers: new Map(), text: async () => String(e) };
  }
}
const h = (res, name) => (res.headers.get ? res.headers.get(name) : null);

function check(name, fn) { checks.push([name, fn]); }

// ---------- passive/header checks (ZAP baseline class) ----------
const PUBLIC_PATHS = ['/api/v1/health', '/api/v1/i18n/en', '/api/v1/rma/TM-RMA-2026-000001'];
for (const p of PUBLIC_PATHS) {
  check(`headers ${p}`, async () => {
    const res = await req(p);
    const missing = [];
    if (h(res, 'x-content-type-options') !== 'nosniff') missing.push('nosniff');
    if (h(res, 'x-frame-options') !== 'DENY') missing.push('frame-deny');
    if (!h(res, 'referrer-policy')) missing.push('referrer-policy');
    if (!h(res, 'permissions-policy')) missing.push('permissions-policy');
    if (!h(res, 'content-security-policy')) missing.push('csp');
    if (h(res, 'x-powered-by') || h(res, 'server')) missing.push('server-banner-present');
    if (missing.length) findings.push({ sev: 'HIGH', where: p, what: `missing/leaking: ${missing.join(',')}` });
  });
}

check('no CORS reflection for unknown origin', async () => {
  const res = await req('/api/v1/health', { headers: { origin: 'https://attacker.example' } });
  if (h(res, 'access-control-allow-origin') === 'https://attacker.example') {
    findings.push({ sev: 'HIGH', where: 'CORS', what: 'arbitrary origin reflected with credentials' });
  }
});

// ---------- active probes (ZAP active-scan class, read-only/no-destructive payloads) ----------
check('authz: admin routes unauthenticated → 401 (no data leak)', async () => {
  for (const p of ['/api/v1/admin/stats', '/api/v1/admin/submissions', '/api/v1/admin/audit', '/api/v1/admin/partner-orgs', '/api/v1/admin/sn-checks']) {
    const res = await req(p);
    if (res.status === 200) findings.push({ sev: 'CRITICAL', where: p, what: `admin data without auth (got ${res.status})` });
    if (res.status !== 401) findings.push({ sev: 'MEDIUM', where: p, what: `expected 401 unauthenticated, got ${res.status}` });
  }
});

check('partner portal unauthenticated → 401', async () => {
  for (const p of ['/api/v1/partner/me', '/api/v1/partner/assets']) {
    const res = await req(p);
    if (res.status !== 401) findings.push({ sev: 'HIGH', where: p, what: `expected 401, got ${res.status}` });
  }
});

check('path traversal on file-serving routes → 4xx, no file content', async () => {
  for (const p of [
    '/api/v1/media/..%2f..%2f..%2fetc%2fpasswd',
    '/api/v1/partner/assets/1/download', // no auth → 401 before any file access
    '/api/v1/media/%2e%2e%2fpackage.json',
  ]) {
    const res = await req(p);
    const body = res.status > 0 ? await res.text() : '';
    if (res.status >= 500) findings.push({ sev: 'HIGH', where: p, what: `server error ${res.status}` });
    if (/root:.*:0:0:/.test(body)) findings.push({ sev: 'CRITICAL', where: p, what: 'file content disclosed' });
  }
});

check('SQL injection strings → clean 4xx, no SQL error reflection', async () => {
  const payloads = ["' OR '1'='1", "1; DROP TABLE users;--", "'; SELECT pg_sleep(10)--"];
  for (const pl of payloads) {
    const res = await req('/api/v1/forms/quote', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': `10.77.0.${requestCount}` },
      body: JSON.stringify({ type: 'quote', email: `${encodeURIComponent(pl)}@x.io`, payload: { company: pl }, consent: true }),
    });
    const body = await res.text();
    if (res.status >= 500) findings.push({ sev: 'HIGH', where: 'forms sqli', what: `500 on payload (${res.status})` });
    if (/pg_sleep|syntax error|unterminated quoted/i.test(body)) findings.push({ sev: 'HIGH', where: 'forms sqli', what: 'SQL error reflected' });
  }
});

check('XSS payload not reflected unescaped', async () => {
  const res = await req('/api/v1/forms/feedback', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': `10.77.1.${requestCount}` },
    body: JSON.stringify({ type: 'feedback', email: 'xss@example.com', payload: { message: '<script>alert(1)</script>' }, consent: true }),
  });
  const body = await res.text();
  if (body.includes('<script>alert(1)</script>')) findings.push({ sev: 'HIGH', where: 'forms xss', what: 'payload reflected unescaped' });
});

check('malformed JSON → 4xx not 500', async () => {
  const res = await req('/api/v1/forms/quote', { method: 'POST', headers: { 'content-type': 'application/json', 'x-forwarded-for': '10.77.2.1' }, body: '{not json' });
  if (res.status >= 500) findings.push({ sev: 'MEDIUM', where: 'malformed json', what: `got ${res.status}` });
});

check('verb tampering on public routes → no 5xx', async () => {
  for (const [m, p] of [['PUT', '/api/v1/health'], ['DELETE', '/api/v1/i18n/en'], ['PATCH', '/api/v1/rma/TM-RMA-2026-000001']]) {
    const res = await req(p, { method: m });
    if (res.status >= 500) findings.push({ sev: 'MEDIUM', where: `${m} ${p}`, what: `got ${res.status}` });
  }
});

check('rate limit engaged (sn-check flood ×12 one IP)', async () => {
  let saw429 = false;
  for (let i = 0; i < 12; i++) {
    const res = await req('/api/v1/sn-check', {
      method: 'POST', headers: { 'content-type': 'application/json', 'x-forwarded-for': '10.77.3.99' },
      body: JSON.stringify({ serial: 'SCAN-PROBE-0001' }),
    });
    if (res.status === 429) { saw429 = true; break; }
  }
  if (!saw429) findings.push({ sev: 'MEDIUM', where: 'rate limit', what: '12 rapid sn-checks without a 429 (TRUST_PROXY/IP policy?)' });
});

check('oversized body → clean rejection', async () => {
  const big = 'x'.repeat(2_000_000);
  const res = await req('/api/v1/forms/quote', {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-forwarded-for': '10.77.4.1' },
    body: JSON.stringify({ type: 'quote', email: 'big@example.com', payload: { message: big }, consent: true }),
  });
  if (res.status >= 500) findings.push({ sev: 'MEDIUM', where: 'oversize', what: `got ${res.status}` });
});

check('problem+json envelopes on errors (RFC 9457)', async () => {
  const res = await req('/api/v1/forms/quote', { method: 'POST', headers: { 'content-type': 'application/json', 'x-forwarded-for': '10.77.5.1' }, body: '{}' });
  const ct = h(res, 'content-type') || '';
  if (res.status >= 400 && !ct.includes('application/problem+json')) {
    findings.push({ sev: 'LOW', where: 'error envelope', what: `content-type ${ct}` });
  }
});

// ---------- run ----------
for (const [name, fn] of checks) {
  try { await fn(); console.log(`ok   ${name}`); }
  catch (e) { findings.push({ sev: 'MEDIUM', where: name, what: `check crashed: ${e}` }); console.log(`ERR  ${name}: ${e}`); }
}

console.log(`\n[owasp-local-scan] ${requestCount} requests, ${checks.length} checks against ${BASE}`);
if (findings.length) {
  console.log(`FINDINGS (${findings.length}):`);
  for (const f of findings) console.log(`  [${f.sev}] ${f.where}: ${f.what}`);
  process.exit(1);
}
console.log('NO FINDINGS — all checks passed.');
