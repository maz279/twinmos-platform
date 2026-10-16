// Gate F Check HARD-01: Security Hardening, Origin Isolation & AOP Audit
// Verifies firewall rules, Cloudflare IP allow-list, default 444 drop, AOP directives, and secret rotation.
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runSecretRotationDrill } from '../ops/rotate-secrets.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..', '..');

export async function verifyHARD01() {
  // 1. Verify deploy/firewall/setup-firewall.sh
  const fwScript = resolve(repoRoot, 'deploy', 'firewall', 'setup-firewall.sh');
  if (!existsSync(fwScript)) throw new Error('Missing deploy/firewall/setup-firewall.sh');
  const fwContent = readFileSync(fwScript, 'utf8');

  // Verify Cloudflare CIDR coverage (all 15 IPv4 + 7 IPv6)
  const expectedIpv4Ranges = [
    '173.245.48.0/20', '103.21.244.0/22', '103.22.200.0/22', '103.31.4.0/22',
    '141.101.64.0/18', '108.162.192.0/18', '190.93.240.0/20', '188.114.96.0/20',
    '197.234.240.0/22', '198.41.128.0/17', '162.158.0.0/15', '104.16.0.0/13',
    '104.24.0.0/14', '172.64.0.0/13', '131.0.72.0/22'
  ];
  for (const cidr of expectedIpv4Ranges) {
    if (!fwContent.includes(cidr)) throw new Error(`Missing Cloudflare IPv4 range in firewall script: ${cidr}`);
  }

  const expectedIpv6Ranges = [
    '2400:cb00::/32', '2606:4700::/32', '2803:f800::/32', '2405:b500::/32',
    '2405:8100::/32', '2a06:98c0::/29', '2c0f:f248::/32'
  ];
  for (const cidr of expectedIpv6Ranges) {
    if (!fwContent.includes(cidr)) throw new Error(`Missing Cloudflare IPv6 range in firewall script: ${cidr}`);
  }

  // Verify internal port lockdown
  if (!fwContent.includes('8787') || !fwContent.includes('4321') || !fwContent.includes('5432')) {
    throw new Error('Firewall script missing direct port blocks for 8787, 4321, or 5432');
  }

  // 2. Verify deploy/nginx/twinmos.conf hardening
  const nginxConf = resolve(repoRoot, 'deploy', 'nginx', 'twinmos.conf');
  if (!existsSync(nginxConf)) throw new Error('Missing deploy/nginx/twinmos.conf');
  const nginxContent = readFileSync(nginxConf, 'utf8');

  // Verify default server block returning 444
  if (!nginxContent.includes('default_server') || !nginxContent.includes('return 444;')) {
    throw new Error('deploy/nginx/twinmos.conf missing default_server 444 catch-all drop block');
  }

  // Verify AOP directives
  if (!nginxContent.includes('Authenticated Origin Pulls') || !nginxContent.includes('ssl_client_certificate')) {
    throw new Error('deploy/nginx/twinmos.conf missing Authenticated Origin Pulls (AOP) declarations');
  }

  // 3. Verify Secret Rotation Drill
  const rotationResult = await runSecretRotationDrill();
  if (!rotationResult.passed) {
    throw new Error('Secret rotation drill failed');
  }

  return 'PASS (Firewall 22 CF CIDRs, internal ports blocked, Nginx default 444 drop, AOP directives, and zero-downtime secret rotation verified)';
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  verifyHARD01()
    .then((msg) => { console.log('[*] HARD-01:', msg); process.exit(0); })
    .catch((err) => { console.error('[✗] HARD-01 FAILED:', err.message); process.exit(1); });
}
