/**
 * refresh-cf-ranges.mjs
 * Roadmap MS2.5 · Task T2.5.1 (Source A6 / EDGE-01 / EDGE-RIP)
 *
 * Fetches official published Cloudflare IP ranges from:
 * - https://www.cloudflare.com/ips-v4
 * - https://www.cloudflare.com/ips-v6
 * Validates the CIDR format, generates deploy/nginx/realip_cloudflare.conf,
 * and ensures only trusted Cloudflare ranges are trusted by nginx.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const TARGET_FILE = path.join(ROOT_DIR, 'deploy', 'nginx', 'realip_cloudflare.conf');

const IPV4_URL = 'https://www.cloudflare.com/ips-v4';
const IPV6_URL = 'https://www.cloudflare.com/ips-v6';

export async function fetchRanges(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${res.status} ${res.statusText}`);
  }
  const text = await res.text();
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'));
}

export function validateCidr(cidr, isV6 = false) {
  if (isV6) {
    const v6Regex = /^[0-9a-fA-F:]+\/\d{1,3}$/;
    return v6Regex.test(cidr);
  }
  const v4Regex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;
  return v4Regex.test(cidr);
}

export async function refreshCloudflareRanges(opts = {}) {
  const dryRun = opts.dryRun || false;
  console.log('[refresh-cf-ranges] Fetching official Cloudflare IP ranges...');

  let ipv4Ranges = [];
  let ipv6Ranges = [];

  try {
    ipv4Ranges = await fetchRanges(IPV4_URL);
    ipv6Ranges = await fetchRanges(IPV6_URL);
  } catch (err) {
    console.warn(`[refresh-cf-ranges] Network fetch failed (${err.message}). Checking offline fallback...`);
    if (opts.offlineFallback && fs.existsSync(TARGET_FILE)) {
      console.log('[refresh-cf-ranges] Using existing verified config as fallback.');
      return { success: true, fallback: true };
    }
    throw err;
  }

  // Validate counts and CIDRs
  const validIpv4 = ipv4Ranges.filter((r) => validateCidr(r, false));
  const validIpv6 = ipv6Ranges.filter((r) => validateCidr(r, true));

  if (validIpv4.length < 10) {
    throw new Error(`Cloudflare IPv4 list returned fewer than expected ranges: ${validIpv4.length}`);
  }
  if (validIpv6.length < 5) {
    throw new Error(`Cloudflare IPv6 list returned fewer than expected ranges: ${validIpv6.length}`);
  }

  const lines = [
    '# Cloudflare official published IP ranges (EDGE-01, EDGE-RIP, T2.5.1)',
    '# Source: https://www.cloudflare.com/ips-v4 and https://www.cloudflare.com/ips-v6',
    '# Generated automatically by tooling/refresh-cf-ranges.mjs',
    `# Updated: ${new Date().toISOString()}`,
    '# Trust ONLY these ranges to restore real client IP via CF-Connecting-IP.',
    '',
    '# IPv4 ranges',
    ...validIpv4.map((r) => `set_real_ip_from ${r};`),
    '',
    '# IPv6 ranges',
    ...validIpv6.map((r) => `set_real_ip_from ${r};`),
    '',
    'real_ip_header CF-Connecting-IP;',
    '',
  ];

  const content = lines.join('\n');

  if (dryRun) {
    console.log(`[refresh-cf-ranges] DRY-RUN: Would write ${validIpv4.length} IPv4 and ${validIpv6.length} IPv6 ranges to ${TARGET_FILE}`);
  } else {
    fs.writeFileSync(TARGET_FILE, content, 'utf8');
    console.log(`[refresh-cf-ranges] Successfully wrote ${validIpv4.length} IPv4 and ${validIpv6.length} IPv6 ranges to ${TARGET_FILE}`);
  }

  return {
    success: true,
    ipv4Count: validIpv4.length,
    ipv6Count: validIpv6.length,
    targetFile: TARGET_FILE,
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  refreshCloudflareRanges({ offlineFallback: true })
    .then((res) => {
      console.log(`[refresh-cf-ranges] Done. Ranges updated: ${res.ipv4Count || 'existing'} IPv4, ${res.ipv6Count || 'existing'} IPv6`);
      process.exit(0);
    })
    .catch((err) => {
      console.error('[refresh-cf-ranges] ERROR:', err.message);
      process.exit(1);
    });
}
