// Live navigation target resolution check (MS4.2 · T4.2.3/T4.2.4).
//
// Loads the delivered header/drawer/footer trees and requests every unique
// internal target against the running web server (following redirects).
// External links are validated as URLs only. Fails when any target returns
// >= 400, contains whitespace, or is stored as an empty "#".
//
// Usage: node tooling/verify/nav-targets.mjs
// Env: API_BASE (default http://127.0.0.1:8787), WEB_BASE (default http://127.0.0.1:4321)
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT_DIR = resolve(ROOT, 'tooling/verify/evidence/ms42');
const API_BASE = process.env.API_BASE || 'http://127.0.0.1:8787';
const WEB_BASE = process.env.WEB_BASE || 'http://127.0.0.1:4321';
const MENUS = ['header', 'drawer', 'footer'];

const flatten = (nodes) => (nodes || []).flatMap((n) => [n, ...flatten(n.children || [])]);

async function main() {
  const results = [];
  let targets = 0;
  let groupNodes = 0;
  const problems = [];

  for (const code of MENUS) {
    const res = await fetch(`${API_BASE}/api/v1/delivery/navigation/${code}`);
    if (!res.ok) throw new Error(`Delivery ${code} returned ${res.status}`);
    const menu = (await res.json()).data;
    for (const item of flatten(menu.items)) {
      if (!item.targetUrl) {
        groupNodes++;
        continue;
      }
      targets++;
      if (item.targetUrl === '#') problems.push(`${code}: empty "#" target for "${item.title}"`);
      if (/\s/.test(item.targetUrl)) problems.push(`${code}: whitespace in "${item.targetUrl}"`);
      results.push({ menu: code, title: item.title, targetType: item.targetType, targetId: item.targetId, targetUrl: item.targetUrl });
    }
  }

  const uniqueInternal = [...new Set(results.map((r) => r.targetUrl).filter((u) => u.startsWith('/')))];
  const uniqueExternal = [...new Set(results.map((r) => r.targetUrl).filter((u) => /^https?:\/\//i.test(u)))];
  const invalidExternal = uniqueExternal.filter((u) => {
    try {
      const parsed = new URL(u);
      return !/^https?:$/.test(parsed.protocol);
    } catch {
      return true;
    }
  });
  for (const url of invalidExternal) problems.push(`invalid external URL: ${url}`);

  const checks = [];
  for (const url of uniqueInternal) {
    let status = 0;
    let error = '';
    try {
      const res = await fetch(`${WEB_BASE}${url}`, { redirect: 'follow', signal: AbortSignal.timeout(15000) });
      status = res.status;
    } catch (err) {
      error = err.message;
    }
    checks.push({ url, status, error });
    if (status < 200 || status >= 400) {
      problems.push(`${url} -> ${status || error}`);
    }
  }

  const report = {
    timestamp: new Date().toISOString(),
    apiBase: API_BASE,
    webBase: WEB_BASE,
    menus: MENUS,
    menuTargets: targets,
    groupNodes,
    uniqueInternal: uniqueInternal.length,
    uniqueExternal: uniqueExternal.length,
    external: uniqueExternal,
    checks,
    problems,
    passed: problems.length === 0,
  };

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(resolve(OUT_DIR, 'nav_targets.json'), JSON.stringify(report, null, 2));

  for (const check of checks) {
    console.log(`${check.status >= 200 && check.status < 400 ? '✓' : '✗'} ${check.status || '-'} ${check.url}`);
  }
  console.log(
    `\n${report.passed ? 'PASS' : 'FAIL'}: ${targets} targets (${uniqueInternal.length} unique internal, ${uniqueExternal.length} external), ${groupNodes} group nodes, ${problems.length} problem(s).`,
  );
  if (problems.length) {
    for (const p of problems) console.error(`  - ${p}`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('[nav-targets] failed:', err);
  process.exit(1);
});
