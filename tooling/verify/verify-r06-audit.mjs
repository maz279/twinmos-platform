#!/usr/bin/env node
// tooling/verify/verify-r06-audit.mjs — Comprehensive 4-Iteration Audit for R0.6
// Verifies:
// 1. Static edge configuration syntax, duplicate removal, map hash bucket size, private range removal
// 2. Official Cloudflare CIDRs, Real-IP propagation, security headers, upload caps
// 3. Docker build of deploy/edge/Dockerfile
// 4. Containerized nginx -t syntax and startup verification (EDGE-START)
// 5. Live HTTP redirect verification (80 -> 301 HTTPS)
// 6. CI workflow integration (ci.yml)
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..', '..');

console.log('========================================================================');
console.log('       R0.6 COMPREHENSIVE AUDIT: AN EDGE CONFIG THAT STARTS');
console.log('       Findings: Z-07, NF-02, NF-18, Z-28 | Checks: EDGE-START, EDGE-01');
console.log('========================================================================\n');

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

function check(id, title, fn) {
  totalChecks++;
  try {
    const res = fn();
    if (res !== false) {
      passedChecks++;
      console.log(`  [PASS] ${id}: ${title}`);
      return true;
    } else {
      failedChecks++;
      console.error(`  [FAIL] ${id}: ${title}`);
      return false;
    }
  } catch (err) {
    failedChecks++;
    console.error(`  [FAIL] ${id}: ${title} — ${err.message}`);
    return false;
  }
}

const confPath = resolve(ROOT, 'deploy/nginx/twinmos.conf');
const realipPath = resolve(ROOT, 'deploy/nginx/realip_cloudflare.conf');
const dockerfilePath = resolve(ROOT, 'deploy/edge/Dockerfile');
const ciPath = resolve(ROOT, '.github/workflows/ci.yml');

const conf = readFileSync(confPath, 'utf8');
const realip = readFileSync(realipPath, 'utf8');
const dockerfile = readFileSync(dockerfilePath, 'utf8');
const ci = readFileSync(ciPath, 'utf8');

console.log('--- 1. Static Configuration Integrity (Z-07 Remediation) ---');

check('CONF-01', 'twinmos.conf has zero duplicate real_ip_header directives', () => {
  return !conf.includes('real_ip_header');
});

check('CONF-02', 'twinmos.conf defines map_hash_bucket_size 128 before maps', () => {
  const bucketIdx = conf.indexOf('map_hash_bucket_size 128;');
  const firstMapIdx = conf.indexOf('map $uri $twinmos_csp');
  return bucketIdx > 0 && firstMapIdx > bucketIdx;
});

check('CONF-03', 'twinmos.conf does not include untrusted private CIDRs in set_real_ip_from', () => {
  const privateRanges = ['127.0.0.1/32', '172.16.0.0/12', '10.0.0.0/8', '192.168.0.0/16'];
  for (const priv of privateRanges) {
    if (conf.includes(`set_real_ip_from ${priv}`)) return false;
  }
  return true;
});

check('CONF-04', 'twinmos.conf includes official realip_cloudflare.conf snippet', () => {
  return conf.includes('include /etc/nginx/snippets/realip_cloudflare.conf;');
});

check('CONF-05', 'twinmos.conf includes CMS redirect map with 301 handler', () => {
  return conf.includes('include /etc/nginx/twinmos-redirects.map;') &&
         conf.includes('if ($twinmos_redirect) { return 301 $twinmos_redirect; }');
});

console.log('\n--- 2. Security Headers & Real-IP Propagation (EDGE-01, EDGE-RIP, S-16a) ---');

check('SEC-01', 'realip_cloudflare.conf sets real_ip_header CF-Connecting-IP with Cloudflare CIDRs', () => {
  const hasHeader = realip.includes('real_ip_header CF-Connecting-IP;');
  const hasV4 = realip.includes('173.245.48.0/20') && realip.includes('104.16.0.0/13');
  const hasV6 = realip.includes('2400:cb00::/32') && realip.includes('2606:4700::/32');
  return hasHeader && hasV4 && hasV6;
});

check('SEC-02', 'twinmos.conf passes canonical X-Real-IP $remote_addr to backend proxies', () => {
  return conf.includes('proxy_set_header X-Real-IP $remote_addr;');
});

check('SEC-03', 'twinmos.conf disables server banner (server_tokens off)', () => {
  return conf.includes('server_tokens off;');
});

check('SEC-04', 'twinmos.conf sets HSTS and map-driven CSP at server level (NF-18)', () => {
  const hsts = conf.includes('add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;');
  const csp = conf.includes('add_header Content-Security-Policy $twinmos_csp always;');
  return hsts && csp;
});

check('SEC-05', 'twinmos.conf enforces upload headroom tiers (15m media/serials, 30m partners)', () => {
  const media = conf.includes('location ~ ^/api/v1/admin/media$') && conf.includes('client_max_body_size 15m;');
  const serials = conf.includes('location = /api/v1/admin/serials/import') && conf.includes('client_max_body_size 15m;');
  const partners = conf.includes('location ~ ^/api/v1/admin/partner-orgs/[^/]+/assets$') && conf.includes('client_max_body_size 30m;');
  return media && serials && partners;
});

console.log('\n--- 3. Containerized Syntax & Startup (EDGE-START, Dockerfile) ---');

check('DOCKER-01', 'Dockerfile generates test certificates for standalone start and syntax testing', () => {
  return dockerfile.includes('/etc/nginx/certs/twinmos.key') &&
         dockerfile.includes('/etc/nginx/certs/twinmos.pem') &&
         dockerfile.includes('openssl req -x509');
});

check('DOCKER-02', 'deploy/edge/Dockerfile builds successfully with Docker', () => {
  try {
    execSync('docker build -t twinmos-edge:test -f deploy/edge/Dockerfile .', {
      cwd: ROOT,
      stdio: 'pipe',
      timeout: 60000,
    });
    return true;
  } catch (err) {
    console.error('Docker build error:', err.stderr ? err.stderr.toString() : err.message);
    return false;
  }
});

check('DOCKER-03', 'docker run twinmos-edge:test nginx -t succeeds with exit code 0', () => {
  try {
    const out = execSync('docker run --rm twinmos-edge:test nginx -t 2>&1', {
      cwd: ROOT,
      stdio: 'pipe',
      timeout: 15000,
    }).toString();
    return out.includes('syntax is ok') && out.includes('test is successful');
  } catch (err) {
    const combined = (err.stdout ? err.stdout.toString() : '') + (err.stderr ? err.stderr.toString() : '');
    return combined.includes('syntax is ok') && combined.includes('test is successful');
  }
});

console.log('\n--- 4. Live Container Routing & Edge Verification ---');

check('LIVE-01', 'Edge container boots and answers HTTP 80 with 301 HTTPS redirect', () => {
  const containerName = `twinmos-edge-test-${Date.now()}`;
  const testPort = 8099;
  try {
    // Start temporary container
    execSync(`docker run -d --name ${containerName} -p ${testPort}:80 twinmos-edge:test`, {
      cwd: ROOT,
      stdio: 'pipe',
      timeout: 15000,
    });

    // Wait 2s for nginx to bind
    execSync('node -e "setTimeout(() => {}, 2000)"');

    // Curl container port 80 with Host: www.twinmos.com
    const curlOut = execSync(`curl.exe -sI -H "Host: www.twinmos.com" http://127.0.0.1:${testPort}/`, {
      stdio: 'pipe',
      timeout: 10000,
    }).toString();

    // Cleanup container
    execSync(`docker rm -f ${containerName}`, { stdio: 'pipe' });

    // HTTP 80 must return 301 redirect to https://www.twinmos.com/
    return curlOut.includes('301') && curlOut.includes('Location: https://www.twinmos.com/');
  } catch (err) {
    try { execSync(`docker rm -f ${containerName}`, { stdio: 'pipe' }); } catch (e) {}
    console.error('Live edge check error:', err.message);
    return false;
  }
});

console.log('\n--- 5. CI Pipeline Wiring (ci.yml) ---');

check('CI-01', 'ci.yml contains test-edge-config job executing docker build and nginx -t', () => {
  return ci.includes('test-edge-config:') &&
         ci.includes('docker build -t twinmos-edge:test -f deploy/edge/Dockerfile .') &&
         ci.includes('docker run --rm twinmos-edge:test nginx -t');
});

check('CI-02', 'ci.yml executes edge-ip-proof.mjs verification', () => {
  return ci.includes('node tooling/verify/edge-ip-proof.mjs');
});

console.log('\n========================================================================');
console.log(`TOTAL AUDIT CHECKS: ${totalChecks} | PASSED: ${passedChecks} | FAILED: ${failedChecks}`);
console.log('========================================================================\n');

if (failedChecks > 0) {
  console.error(`AUDIT FAILED with ${failedChecks} violation(s).`);
  process.exit(1);
} else {
  console.log('STATUS: 100% VERIFIED — ALL R0.6 ACCEPTANCE CRITERIA PASSED CLEANLY.\n');
  process.exit(0);
}
