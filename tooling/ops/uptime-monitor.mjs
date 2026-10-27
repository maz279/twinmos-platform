// External Uptime Monitor Probe (T7.2.3 / OBS-01)
// Probes 4 vital endpoints: home page, product page, health check, admin login.
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const WEB_URL = process.env.WEB_URL || 'http://127.0.0.1:4321';
const API_URL = process.env.API_URL || 'http://127.0.0.1:8787';

export const TARGETS = [
  { name: 'Home Page', url: `${WEB_URL}/`, expectedStatus: 200 },
  { name: 'Product Page', url: `${WEB_URL}/products/corex-pro-m2-pcie-gen-5-0-nvme-ssd`, expectedStatus: 200 },
  { name: 'API Health Probe', url: `${API_URL}/api/v1/health`, expectedStatus: 200 },
  { name: 'Admin Console Login', url: `${WEB_URL}/admin`, expectedStatus: 200 },
];

export async function runUptimeMonitor(targets = TARGETS) {
  console.log('================================================================');
  console.log('      TwinMOS External Uptime Monitor Probe (T7.2.3 / OBS-01)');
  console.log('================================================================\n');

  const results = [];
  let successCount = 0;

  for (const target of targets) {
    const t0 = Date.now();
    try {
      const res = await fetch(target.url, {
        headers: { 'User-Agent': 'TwinMOS-Uptime-Monitor/1.0' },
        signal: AbortSignal.timeout(5000),
      });
      const latencyMs = Date.now() - t0;
      const ok = res.status === target.expectedStatus;
      if (ok) successCount++;

      const r = {
        name: target.name,
        url: target.url,
        status: res.status,
        ok,
        latencyMs,
        timestamp: new Date().toISOString(),
      };
      results.push(r);
      const symbol = ok ? '✓' : '✗';
      console.log(`[${symbol}] ${target.name.padEnd(20)} : HTTP ${res.status} (${latencyMs}ms) -> ${target.url}`);
    } catch (err) {
      const latencyMs = Date.now() - t0;
      results.push({
        name: target.name,
        url: target.url,
        status: 0,
        ok: false,
        latencyMs,
        timestamp: new Date().toISOString(),
      });
      console.log(`[✗] ${target.name.padEnd(20)} : FAILED (${latencyMs}ms) -> ${String(err)}`);
    }
  }

  const uptimeScore = (successCount / targets.length) * 100;
  console.log('\n----------------------------------------------------------------');
  console.log(`Uptime Score: ${uptimeScore.toFixed(1)}% (${successCount}/${targets.length} targets healthy)`);
  console.log('================================================================\n');

  return {
    passed: successCount === targets.length,
    results,
    uptimeScore,
  };
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  runUptimeMonitor()
    .then((r) => process.exit(r.passed ? 0 : 1))
    .catch(() => process.exit(1));
}
