// Zero-trust audit harness — HTTP client that talks to the lab EDGE exactly like
// Cloudflare would: TLS to www.twinmos.com with an origin-pull client certificate.
// Every probe goes through nginx (deploy/nginx/twinmos.conf), never to the API port.
import { Agent, FormData as UFormData, fetch as ufetch } from 'undici';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
export const CERT_DIR = process.env.ZT_CERT_DIR ?? join(here, '..', 'lab', '.certs');
export const EDGE_HOST = process.env.ZT_EDGE_HOST ?? '127.0.0.1';
export const EDGE_PORT = Number(process.env.ZT_EDGE_PORT ?? 18443);
export const ORIGIN = 'https://www.twinmos.com';
export const MAIL_API = process.env.ZT_MAIL_API ?? 'http://127.0.0.1:18025';

function tls(withClientCert) {
  if (!existsSync(join(CERT_DIR, 'ca.pem'))) throw new Error(`lab certs missing in ${CERT_DIR} — run tooling/audit-zt/lab/up.sh`);
  return {
    ca: readFileSync(join(CERT_DIR, 'ca.pem')),
    servername: 'www.twinmos.com',
    ...(withClientCert ? { cert: readFileSync(join(CERT_DIR, 'client.pem')), key: readFileSync(join(CERT_DIR, 'client.key')) } : {}),
  };
}
const agents = {};
function agent(withClientCert = true) {
  const k = withClientCert ? 'c' : 'n';
  agents[k] ??= new Agent({
    connect: { ...tls(withClientCert), lookup: (_h, _o, cb) => cb(null, [{ address: EDGE_HOST, family: 4 }]) },
  });
  return agents[k];
}

/** fetch() against the edge. path is absolute ("/api/v1/health"). */
export async function edge(path, init = {}, { clientCert = true, jar } = {}) {
  const headers = new Headers(init.headers ?? {});
  if (jar?.cookie) headers.set('cookie', jar.cookie);
  if (init.body && typeof init.body === 'object' && !(init.body instanceof Uint8Array) && !(init.body instanceof FormData) && !(init.body instanceof UFormData)) {
    headers.set('content-type', 'application/json');
    init = { ...init, body: JSON.stringify(init.body) };
  }
  if (!headers.has('origin') && init.method && init.method !== 'GET') headers.set('origin', ORIGIN);
  const res = await ufetch(`https://www.twinmos.com:${EDGE_PORT}${path}`, { ...init, headers, redirect: 'manual', dispatcher: agent(clientCert) });
  if (jar) jar.absorb(res);
  return res;
}

export class Jar {
  constructor() { this.map = new Map(); }
  absorb(res) {
    for (const sc of res.headers.getSetCookie?.() ?? []) {
      const [pair] = sc.split(';');
      const i = pair.indexOf('=');
      const name = pair.slice(0, i).trim();
      const val = pair.slice(i + 1).trim();
      if (/max-age=0|expires=thu, 01 jan 1970/i.test(sc) || val === '') this.map.delete(name); else this.map.set(name, val);
    }
  }
  get cookie() { return [...this.map].map(([k, v]) => `${k}=${v}`).join('; '); }
}

export async function json(res) {
  const t = await res.text();
  try { return JSON.parse(t); } catch { return { _raw: t.slice(0, 500) }; }
}

export async function mails() {
  const r = await ufetch(`${MAIL_API}/_messages`);
  return r.json();
}

/** Result collector: every check records pass/fail with evidence; exit code reflects failures. */
export class Report {
  constructor(name) { this.name = name; this.items = []; }
  check(id, ok, detail = {}) {
    this.items.push({ id, ok: !!ok, ...detail });
    console.log(`${ok ? 'PASS' : 'FAIL'} ${id}${detail.note ? ' — ' + detail.note : ''}`);
    return !!ok;
  }
  get failed() { return this.items.filter((i) => !i.ok); }
  summary() { return { name: this.name, at: new Date().toISOString(), total: this.items.length, failed: this.failed.length, items: this.items }; }
}
