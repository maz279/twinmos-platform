// ZT check ROUTES-AUTHZ: every registered API route, probed through the edge.
//  1. anonymous: every /admin/* and /partner/* route must answer 401/403 (never 2xx,
//     never a 4xx/5xx that reveals it ran logic before auth);
//  2. viewer session: no mutating /admin/* route may answer 2xx;
//  3. partner member session: no /admin/* route may answer 2xx.
// Input: routes.jsonl (from lib/dump-routes.ts). Output: JSON report.
// --plant: flips the expectation for one admin route to prove the check can fail.
import { readFileSync, writeFileSync } from 'node:fs';
import { edge, Report } from './lib/edge.mjs';
import { signIn, loadAccounts } from './lib/staff.mjs';

const [routesFile, outFile] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const plant = process.argv.includes('--plant');
const routes = readFileSync(routesFile, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const rep = new Report('routes-authz');

const fill = (p) => p.replace(/:(\w+)\{[^}]*\}/g, '1').replace(/:id|:orgId|:assetId|:memberId|:pageId|:versionId/g, '1')
  .replace(/:serial/g, 'ZTPROBE0001').replace(/:locale/g, 'en').replace(/:slug/g, 'zt-probe').replace(/:(\w+)/g, 'zt').replace(/\*$/, 'zt');
const guarded = (p) => p.startsWith('/api/v1/admin') || p.startsWith('/api/v1/partner');
const mutating = (m) => !['GET', 'HEAD', 'OPTIONS'].includes(m);

const pause = (ms) => new Promise((r) => setTimeout(r, ms));
async function hit(r, jar) {
  await pause(40); // stay under the edge limit_req (30 r/s) so 503s never mask results
  const path = fill(r.path);
  const init = { method: r.method === 'ALL' ? 'GET' : r.method };
  if (mutating(init.method)) init.body = {};
  const res = await edge(path, init, { jar });
  await res.arrayBuffer();
  return { path, status: res.status };
}

const acc = loadAccounts();
const sessions = {};
for (const role of ['viewer', 'partner']) {
  const a = acc[role];
  if (!a) { rep.check(`session:${role}`, false, { note: 'lab account missing — run lab/provision.mjs' }); continue; }
  const s = await signIn(a.email, a.password, a.totp);
  rep.check(`session:${role}`, s.res.status === 200, { status: s.res.status });
  sessions[role] = s.jar;
}

let planted = false;
const targets = routes.filter((x) => guarded(x.path));
for (const r of plant ? targets.slice(0, 1) : targets) {
  const anon = await hit(r);
  let ok = anon.status === 401 || anon.status === 403;
  if (plant && !planted) { ok = !ok; planted = true; }
  rep.check(`anon ${r.method} ${r.path}`, ok, { status: anon.status, note: ok ? undefined : `anonymous got ${anon.status}` });
  if (sessions.viewer && mutating(r.method) && r.path.startsWith('/api/v1/admin') && !r.path.includes('/users/me/')) {
    const v = await hit(r, sessions.viewer);
    rep.check(`viewer ${r.method} ${r.path}`, v.status < 200 || v.status >= 300, { status: v.status, note: v.status < 300 ? 'viewer mutated' : undefined });
  }
  if (sessions.partner && r.path.startsWith('/api/v1/admin')) {
    const p = await hit(r, sessions.partner);
    rep.check(`partner ${r.method} ${r.path}`, p.status === 401 || p.status === 403, { status: p.status, note: p.status === 401 || p.status === 403 ? undefined : `partner got ${p.status}` });
  }
}
writeFileSync(outFile, JSON.stringify(rep.summary(), null, 2));
console.log(`routes-authz: ${rep.items.length} checks, ${rep.failed.length} failed`);
process.exit(rep.failed.length ? 1 : 0);
