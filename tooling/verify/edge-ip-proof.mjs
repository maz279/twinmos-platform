// EDGE-01, EDGE-RIP, S-16a Static Configuration Lint (Relabeled under T2.2.1 / Z-17)
// Static linter for nginx configuration files:
// - Cloudflare real-IP topology and include file (EDGE-RIP)
// - Single X-Real-IP header passed to API backend (EDGE-RIP, S-09, S-10)
// - Security headers: one CSP per response, HSTS, server_tokens off (S-16a, EDGE-01)
// - Body limit tiers: 1m default, 15m media/serials, 30m partner assets (S-12, EDGE-01)
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

console.log('[edge-ip-lint] Linting EDGE-01, EDGE-RIP, and S-16a static nginx configurations...');

const confPath = resolve(process.cwd(), 'deploy/nginx/twinmos.conf');
const realipConfPath = resolve(process.cwd(), 'deploy/nginx/realip_cloudflare.conf');

if (!existsSync(confPath) || !existsSync(realipConfPath)) {
  console.error('[edge-ip-proof] FAIL: Missing nginx configuration files in deploy/nginx/.');
  process.exit(1);
}

const conf = readFileSync(confPath, 'utf8');
const realipConf = readFileSync(realipConfPath, 'utf8');
let failures = 0;

// 1. Cloudflare CIDRs check
const expectedCidrs = ['173.245.48.0/20', '103.21.244.0/22', '104.16.0.0/13', '2400:cb00::/32', '2606:4700::/32'];
for (const cidr of expectedCidrs) {
  if (!realipConf.includes(cidr)) {
    console.error(`[edge-ip-proof] FAIL EDGE-RIP: Missing expected Cloudflare CIDR: ${cidr}`);
    failures++;
  }
}
if (!realipConf.includes('real_ip_header CF-Connecting-IP;')) {
  console.error('[edge-ip-proof] FAIL EDGE-RIP: real_ip_header CF-Connecting-IP missing.');
  failures++;
} else {
  console.log('[edge-ip-proof] PASS EDGE-RIP: Cloudflare published CIDRs and CF-Connecting-IP header configured.');
}

// 2. Real-IP propagation to API
if (!conf.includes('proxy_set_header X-Real-IP $remote_addr;')) {
  console.error('[edge-ip-proof] FAIL EDGE-RIP: proxy_set_header X-Real-IP missing from proxy locations.');
  failures++;
} else {
  console.log('[edge-ip-proof] PASS EDGE-RIP: proxy_set_header X-Real-IP $remote_addr present in proxy locations.');
}

// 2b. EDGE-START / Z-07 checks (no duplicate real_ip_header, map_hash_bucket_size, no private CIDRs)
if (conf.includes('real_ip_header')) {
  console.error('[edge-ip-proof] FAIL Z-07: Duplicate real_ip_header found in twinmos.conf (must only be in realip_cloudflare.conf).');
  failures++;
} else {
  console.log('[edge-ip-proof] PASS Z-07: Zero duplicate real_ip_header directives in twinmos.conf.');
}
// Z-07: map_hash_bucket_size must be explicitly configured and >= 128 — the
// Cloudflare allow-list map keys overflow nginx's 64-byte default bucket. The
// conf was deliberately raised to 256 in zt-iter-1 (longer redirect-map keys),
// so parse the value instead of grepping for the original literal 128.
const mapHashMatch = conf.match(/map_hash_bucket_size\s+(\d+);/);
if (!mapHashMatch || Number(mapHashMatch[1]) < 128) {
  console.error('[edge-ip-proof] FAIL Z-07: map_hash_bucket_size missing or < 128 in twinmos.conf.');
  failures++;
} else {
  console.log(`[edge-ip-proof] PASS Z-07: map_hash_bucket_size ${mapHashMatch[1]} configured (>= 128).`);
}
const privateCidrs = ['127.0.0.1/32', '172.16.0.0/12', '10.0.0.0/8', '192.168.0.0/16'];
for (const priv of privateCidrs) {
  if (conf.includes(`set_real_ip_from ${priv}`)) {
    console.error(`[edge-ip-proof] FAIL Z-07: Untrusted private range ${priv} present in twinmos.conf.`);
    failures++;
  }
}

// 3. Server tokens off and HSTS
if (!conf.includes('server_tokens off;')) {
  console.error('[edge-ip-proof] FAIL S-16a: server_tokens off missing.');
  failures++;
}
if (!conf.includes('Strict-Transport-Security')) {
  console.error('[edge-ip-proof] FAIL S-16a: Strict-Transport-Security missing.');
  failures++;
}
if (!conf.includes('$twinmos_csp')) {
  console.error('[edge-ip-proof] FAIL S-16a: Single map-driven CSP header missing.');
  failures++;
} else {
  console.log('[edge-ip-proof] PASS S-16a: Edge security headers (CSP map, HSTS, server_tokens off) verified.');
}

// 4. Upload size tiers (S-12, EDGE-01)
const hasMediaCap = conf.includes('location ~ ^/api/v1/admin/media$') && conf.includes('client_max_body_size 15m;');
const hasSerialsCap = conf.includes('location = /api/v1/admin/serials/import') && conf.includes('client_max_body_size 15m;');
const hasPartnerCap = conf.includes('location ~ ^/api/v1/admin/partner-orgs/[^/]+/assets$') && conf.includes('client_max_body_size 30m;');

if (!hasMediaCap || !hasSerialsCap || !hasPartnerCap) {
  console.error('[edge-ip-proof] FAIL S-12 / EDGE-01: Inconsistent upload location body limits.');
  failures++;
} else {
  console.log('[edge-ip-proof] PASS S-12 / EDGE-01: Upload locations have verified headroom caps (15M / 30M).');
}

if (failures > 0) {
  console.error(`[edge-ip-proof] Verification FAILED with ${failures} error(s).`);
  process.exit(1);
}

console.log('[edge-ip-proof] PASS EDGE-01, EDGE-RIP, S-16a: All edge checks passed cleanly.');
process.exit(0);
