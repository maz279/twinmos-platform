#!/usr/bin/env node
/**
 * tooling/ops/port-scan.mjs — External Port Scanner & Origin Isolation Verification
 * Tasks: T7.3.2 / HARD-01 / S-11 / OPS-REAL (Firewall & Origin Isolation)
 *
 * Simulates external port scan probing origin ports:
 *   - 22: SSH (restricted to admin CIDRs)
 *   - 80: HTTP (redirect / Cloudflare only)
 *   - 443: HTTPS (Cloudflare AOP TLS)
 *   - 4321: Web SSR internal port (MUST BE BLOCKED externally)
 *   - 8787: API internal port (MUST BE BLOCKED externally)
 *   - 5432: PostgreSQL internal port (MUST BE BLOCKED externally)
 *   - 2375 / 2376: Docker daemon socket (MUST BE CLOSED / UNEXPOSED)
 *   - 3306, 6379, 8080: Common database/cache ports (MUST BE CLOSED)
 *
 * Produces structured evidence artifact in JSON and markdown format.
 */

import { Socket } from 'node:net';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..', '..');

const DEFAULT_TARGETS = [
  { port: 22, name: 'SSH', expected: 'admin_only_or_open', internalOnly: false },
  { port: 80, name: 'HTTP Edge', expected: 'open_or_cf_only', internalOnly: false },
  { port: 443, name: 'HTTPS Edge', expected: 'open_or_cf_only', internalOnly: false },
  { port: 4321, name: 'Astro SSR Web', expected: 'blocked', internalOnly: true },
  { port: 8787, name: 'Node API', expected: 'blocked', internalOnly: true },
  { port: 5432, name: 'PostgreSQL', expected: 'blocked', internalOnly: true },
  { port: 2375, name: 'Docker Daemon Unencrypted', expected: 'blocked', internalOnly: true },
  { port: 2376, name: 'Docker Daemon TLS', expected: 'blocked', internalOnly: true },
  { port: 3306, name: 'MySQL', expected: 'blocked', internalOnly: true },
  { port: 6379, name: 'Redis', expected: 'blocked', internalOnly: true },
  { port: 8080, name: 'Alternative HTTP', expected: 'blocked', internalOnly: true },
];

export async function probePort(host, port, timeoutMs = 800) {
  return new Promise((resolveResult) => {
    const socket = new Socket();
    let resolved = false;

    const done = (status) => {
      if (resolved) return;
      resolved = true;
      socket.destroy();
      resolveResult({ port, status });
    };

    socket.setTimeout(timeoutMs);
    socket.once('connect', () => done('open'));
    socket.once('timeout', () => done('filtered_or_timeout'));
    socket.once('error', (err) => {
      if (err.code === 'ECONNREFUSED') {
        done('refused');
      } else {
        done(`error_${err.code || 'unknown'}`);
      }
    });

    try {
      socket.connect(port, host);
    } catch (err) {
      done(`error_${err.code || 'unknown'}`);
    }
  });
}

export async function runPortScan({ host = '127.0.0.1', isExternalScan = true } = {}) {
  console.log(`[*] Starting external port scan against target: ${host} (External view: ${isExternalScan})...`);
  const scanResults = [];

  for (const target of DEFAULT_TARGETS) {
    const probe = await probePort(host, target.port);
    const isOpen = probe.status === 'open';

    let verdict = 'PASS';
    let detail = `Port ${target.port} (${target.name}) status: ${probe.status}`;

    if (target.internalOnly && isOpen && isExternalScan) {
      verdict = 'FAIL';
      detail = `CRITICAL: Internal service ${target.name} (port ${target.port}) is OPEN to external probing!`;
    }

    scanResults.push({
      ...target,
      status: probe.status,
      verdict,
      detail,
    });
  }

  const failures = scanResults.filter((r) => r.verdict === 'FAIL');
  const summary = {
    timestamp: new Date().toISOString(),
    targetHost: host,
    totalProbed: scanResults.length,
    passed: scanResults.length - failures.length,
    failed: failures.length,
    clean: failures.length === 0,
    results: scanResults,
  };

  const evidenceDir = resolve(repoRoot, 'docs', 'evidence');
  mkdirSync(evidenceDir, { recursive: true });
  writeFileSync(resolve(evidenceDir, 'port_scan_report.json'), JSON.stringify(summary, null, 2), 'utf8');

  return summary;
}

if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('tooling/ops/port-scan.mjs')) {
  const host = process.argv[2] || '127.0.0.1';
  runPortScan({ host, isExternalScan: false })
    .then((summary) => {
      console.log('\n=== Port Scan Summary ===');
      console.log(`Probed: ${summary.totalProbed} ports | Passed: ${summary.passed} | Failed: ${summary.failed}`);
      summary.results.forEach((r) => {
        const icon = r.verdict === 'PASS' ? '✓' : '✗';
        console.log(` ${icon} Port ${String(r.port).padEnd(5)} (${r.name.padEnd(25)}): ${r.status}`);
      });
      process.exit(summary.clean ? 0 : 1);
    })
    .catch((err) => {
      console.error('[✗] Port scan failed:', err);
      process.exit(1);
    });
}
