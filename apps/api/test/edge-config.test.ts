// apps/api/test/edge-config.test.ts — Unit & integration tests for R0.6: Edge Nginx configuration (Z-07, EDGE-START, EDGE-01)
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..', '..');
const NGINX_DIR = join(ROOT, 'deploy', 'nginx');
const EDGE_DIR = join(ROOT, 'deploy', 'edge');
const CI_YML = join(ROOT, '.github', 'workflows', 'ci.yml');

describe('R0.6 · Edge Configuration & Startup (Z-07, EDGE-START, EDGE-01)', () => {
  const confPath = join(NGINX_DIR, 'twinmos.conf');
  const realipPath = join(NGINX_DIR, 'realip_cloudflare.conf');
  const redirectsPath = join(NGINX_DIR, 'twinmos-redirects.map');
  const dockerfilePath = join(EDGE_DIR, 'Dockerfile');

  it('configuration files exist in deploy/nginx/ and deploy/edge/', () => {
    expect(existsSync(confPath)).toBe(true);
    expect(existsSync(realipPath)).toBe(true);
    expect(existsSync(redirectsPath)).toBe(true);
    expect(existsSync(dockerfilePath)).toBe(true);
    expect(existsSync(CI_YML)).toBe(true);
  });

  describe('Z-07 / EDGE-START: twinmos.conf syntax & startup rules', () => {
    const conf = readFileSync(confPath, 'utf8');

    it('has zero duplicate real_ip_header directives in twinmos.conf', () => {
      // real_ip_header must only be defined in realip_cloudflare.conf
      expect(conf).not.toContain('real_ip_header');
    });

    it('includes realip_cloudflare.conf snippet', () => {
      expect(conf).toContain('include /etc/nginx/snippets/realip_cloudflare.conf;');
    });

    it('defines map_hash_bucket_size 128 before the first map directive', () => {
      expect(conf).toContain('map_hash_bucket_size 128;');
      const bucketIdx = conf.indexOf('map_hash_bucket_size 128;');
      const firstMapIdx = conf.indexOf('map $uri $twinmos_csp');
      expect(bucketIdx).toBeGreaterThan(0);
      expect(firstMapIdx).toBeGreaterThan(bucketIdx);
    });

    it('removes unverified private CIDR ranges from set_real_ip_from', () => {
      const privateRanges = ['127.0.0.1/32', '172.16.0.0/12', '10.0.0.0/8', '192.168.0.0/16'];
      for (const range of privateRanges) {
        expect(conf).not.toContain(`set_real_ip_from ${range}`);
      }
    });

    it('includes CMS redirect map', () => {
      expect(conf).toContain('include /etc/nginx/twinmos-redirects.map;');
      expect(conf).toContain('if ($twinmos_redirect) { return 301 $twinmos_redirect; }');
    });
  });

  describe('EDGE-RIP / EDGE-01: Cloudflare Real IP & propagation', () => {
    const realipConf = readFileSync(realipPath, 'utf8');
    const conf = readFileSync(confPath, 'utf8');

    it('realip_cloudflare.conf contains official Cloudflare IPv4 and IPv6 CIDRs', () => {
      const expectedCidrs = [
        '173.245.48.0/20',
        '103.21.244.0/22',
        '103.22.200.0/22',
        '103.31.4.0/22',
        '141.101.64.0/18',
        '108.162.192.0/18',
        '190.93.240.0/20',
        '188.114.96.0/20',
        '197.234.240.0/22',
        '198.41.128.0/17',
        '162.158.0.0/15',
        '104.16.0.0/13',
        '104.24.0.0/14',
        '172.64.0.0/13',
        '131.0.72.0/22',
        '2400:cb00::/32',
        '2606:4700::/32',
        '2803:f800::/32',
        '2405:b500::/32',
        '2405:8100::/32',
        '2a06:98c0::/29',
        '2c0f:f248::/32',
      ];
      for (const cidr of expectedCidrs) {
        expect(realipConf).toContain(`set_real_ip_from ${cidr};`);
      }
    });

    it('realip_cloudflare.conf sets real_ip_header CF-Connecting-IP', () => {
      expect(realipConf).toContain('real_ip_header CF-Connecting-IP;');
    });

    it('passes canonical X-Real-IP to API backend', () => {
      expect(conf).toContain('proxy_set_header X-Real-IP $remote_addr;');
    });
  });

  describe('S-16a / EDGE-01: Security headers & upload caps', () => {
    const conf = readFileSync(confPath, 'utf8');

    it('configures server_tokens off', () => {
      expect(conf).toContain('server_tokens off;');
    });

    it('configures HSTS and map-driven CSP', () => {
      expect(conf).toContain('add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;');
      expect(conf).toContain('add_header Content-Security-Policy $twinmos_csp always;');
    });

    it('enforces body size tiers (1m default, 15m media/serials, 30m partner assets)', () => {
      expect(conf).toContain('client_max_body_size 1m;');
      expect(conf).toContain('client_max_body_size 15m;');
      expect(conf).toContain('client_max_body_size 30m;');
    });
  });

  describe('EDGE-START: Dockerfile & CI Pipeline Wiring', () => {
    const dockerfile = readFileSync(dockerfilePath, 'utf8');
    const ciYml = readFileSync(CI_YML, 'utf8');

    it('Dockerfile generates test certificates for standalone start and syntax testing', () => {
      expect(dockerfile).toContain('/etc/nginx/certs/twinmos.key');
      expect(dockerfile).toContain('/etc/nginx/certs/twinmos.pem');
      expect(dockerfile).toContain('openssl req -x509');
    });

    it('CI workflow includes test-edge-config job executing docker build and nginx -t', () => {
      expect(ciYml).toContain('test-edge-config:');
      expect(ciYml).toContain('docker build -t twinmos-edge:test -f deploy/edge/Dockerfile .');
      expect(ciYml.match(/docker run --rm[^\n]*twinmos-edge:test nginx -t/)).toBeTruthy();
      expect(ciYml).toContain('node tooling/verify/edge-ip-proof.mjs');
    });
  });
});
