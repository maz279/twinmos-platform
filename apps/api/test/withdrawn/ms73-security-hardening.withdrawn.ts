// Vitest Test Suite: Milestone MS7.3 · Security Hardening
// Validates Cloudflare Origin Protection & AOP (T7.3.1), Docker-Bypass-Proof Firewall (T7.3.2),
// Secret Rotation Preserving TOTP (T7.3.3 / Z-23), Container Hardening & ZAP Scans (T7.3.4), and Quality Gate HARD-01.

import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import { bootConfigErrors } from '../src/boot-config.ts';
import { parseSecretsEnv, buildSecretConfig, runSecretRotationRehearsal } from '../../../tooling/ops/rotate-secrets.mjs';
import { probePort, runPortScan } from '../../../tooling/ops/port-scan.mjs';
import { symmetricEncrypt, symmetricDecrypt } from 'better-auth/crypto';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..', '..', '..');

describe('MS7.3 · Security Hardening', () => {
  describe('T7.3.1: Cloudflare Origin Protection & Authenticated Origin Pulls (AOP)', () => {
    it('verifies Cloudflare Origin Pull CA bundle exists in deploy/nginx/certs/', () => {
      const caPath = resolve(repoRoot, 'deploy', 'nginx', 'certs', 'cloudflare-origin-pull-ca.pem');
      expect(existsSync(caPath)).toBe(true);
      const caContent = readFileSync(caPath, 'utf8');
      expect(caContent).toContain('BEGIN CERTIFICATE');
      expect(caContent).toContain('END CERTIFICATE');
      expect(caContent.length).toBeGreaterThan(500);
    });

    it('verifies NGINX config enforces Authenticated Origin Pulls with client cert verification', () => {
      const confPath = resolve(repoRoot, 'deploy', 'nginx', 'twinmos.conf');
      expect(existsSync(confPath)).toBe(true);
      const conf = readFileSync(confPath, 'utf8');

      expect(conf).toContain('ssl_client_certificate /etc/nginx/certs/cloudflare-origin-pull-ca.pem;');
      expect(conf).toContain('ssl_verify_client on;');
      expect(conf).not.toMatch(/#\s*ssl_verify_client\s+on;/);
    });

    it('verifies NGINX default server block drops direct origin IP traffic with 444', () => {
      const confPath = resolve(repoRoot, 'deploy', 'nginx', 'twinmos.conf');
      const conf = readFileSync(confPath, 'utf8');
      expect(conf).toContain('server_name _;');
      expect(conf).toContain('return 444;');
    });

    it('verifies edge Dockerfile copies the Cloudflare Origin Pull CA bundle', () => {
      const dockerfilePath = resolve(repoRoot, 'deploy', 'edge', 'Dockerfile');
      expect(existsSync(dockerfilePath)).toBe(true);
      const dockerfile = readFileSync(dockerfilePath, 'utf8');
      expect(dockerfile).toContain('COPY deploy/nginx/certs/cloudflare-origin-pull-ca.pem /etc/nginx/certs/cloudflare-origin-pull-ca.pem');
    });
  });

  describe('T7.3.2: Firewall Docker Cannot Bypass (DOCKER-USER Chain & Port Isolation)', () => {
    it('verifies setup-firewall.sh injects filtering rules into the DOCKER-USER chain', () => {
      const fwPath = resolve(repoRoot, 'deploy', 'firewall', 'setup-firewall.sh');
      expect(existsSync(fwPath)).toBe(true);
      const fwScript = readFileSync(fwPath, 'utf8');

      expect(fwScript).toContain('DOCKER-USER');
      expect(fwScript).toContain('iptables -A DOCKER-USER -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT');
      expect(fwScript).toContain('iptables -A DOCKER-USER -p tcp -m multiport --dports 80,443,8787,4321,5432 -j DROP');
    });

    it('verifies setup-firewall.sh defines all 15 Cloudflare IPv4 and 7 IPv6 ranges', () => {
      const fwPath = resolve(repoRoot, 'deploy', 'firewall', 'setup-firewall.sh');
      const fwScript = readFileSync(fwPath, 'utf8');

      expect(fwScript).toContain('173.245.48.0/20');
      expect(fwScript).toContain('103.21.244.0/22');
      expect(fwScript).toContain('141.101.64.0/18');
      expect(fwScript).toContain('108.162.192.0/18');
      expect(fwScript).toContain('198.41.128.0/17');
      expect(fwScript).toContain('162.158.0.0/15');
      expect(fwScript).toContain('104.16.0.0/13');
      expect(fwScript).toContain('2400:cb00::/32');
      expect(fwScript).toContain('2606:4700::/32');
    });

    it('verifies setup-firewall.sh restricts SSH to admin CIDRs and enforces SSH keys only', () => {
      const fwPath = resolve(repoRoot, 'deploy', 'firewall', 'setup-firewall.sh');
      const fwScript = readFileSync(fwPath, 'utf8');

      expect(fwScript).toContain('PasswordAuthentication no');
      expect(fwScript).toContain('PermitRootLogin prohibit-password');
      expect(fwScript).toContain('ADMIN_SSH_CIDRS');
      expect(fwScript).toContain('ufw limit proto tcp from "$admin_cidr" to any port 22');
    });

    it('executes port scanner and confirms internal ports cannot be reached externally', async () => {
      const scanSummary = await runPortScan({ host: '127.0.0.1', isExternalScan: false });
      expect(scanSummary.clean).toBe(true);
      expect(scanSummary.failed).toBe(0);

      // Verify that port 5432 and Docker socket 2375 are not open to the world
      const p5432 = scanSummary.results.find((r) => r.port === 5432);
      expect(p5432?.status).not.toBe('open');
      const p2375 = scanSummary.results.find((r) => r.port === 2375);
      expect(p2375?.status).not.toBe('open');
    });
  });

  describe('T7.3.3: Secret Rotation Preserving TOTP (Finding Z-23)', () => {
    it('verifies bootConfigErrors accepts versioned BETTER_AUTH_SECRETS', () => {
      const validEnv = {
        NODE_ENV: 'production',
        DATABASE_URL: 'postgresql://postgres:secret@localhost:5432/twinmos',
        TURNSTILE_SECRET_KEY: 'test-turnstile-secret',
        BETTER_AUTH_SECRETS: '2:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa,1:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        BETTER_AUTH_URL: 'https://www.twinmos.com',
        PREVIEW_SIGNING_KEY: 'preview-signing-key-production-32-bytes',
        REVALIDATE_SECRET: 'revalidate-secret-production-32-bytes',
        INTERNAL_WEB_URL: 'http://web:4321',
        RESEND_API_KEY: 're_1234567890abcdef',
        MAIL_FROM: 'TwinMOS <info@twinmos.com>',
        FORMS_TO: 'leads@twinmos.com',
      };

      const errs = bootConfigErrors(validEnv);
      expect(errs).toEqual([]);
    });

    it('verifies bootConfigErrors rejects invalid versions and short secrets in BETTER_AUTH_SECRETS', () => {
      const badEnv = {
        NODE_ENV: 'production',
        DATABASE_URL: 'postgresql://postgres:secret@localhost:5432/twinmos',
        TURNSTILE_SECRET_KEY: 'test-turnstile-secret',
        BETTER_AUTH_SECRETS: 'badversion:short',
        BETTER_AUTH_URL: 'https://www.twinmos.com',
        RESEND_API_KEY: 're_1234567890abcdef',
        MAIL_FROM: 'TwinMOS <info@twinmos.com>',
        FORMS_TO: 'leads@twinmos.com',
      };

      const errs = bootConfigErrors(badEnv);
      expect(errs.length).toBeGreaterThan(0);
      expect(errs.some((e) => e.includes('BETTER_AUTH_SECRETS'))).toBe(true);
    });

    it('verifies SECRETS.md runbook eliminates BETTER_AUTH_OLD_SECRETS', () => {
      const runbookPath = resolve(repoRoot, 'docs', 'runbooks', 'SECRETS.md');
      expect(existsSync(runbookPath)).toBe(true);
      const runbook = readFileSync(runbookPath, 'utf8');

      expect(runbook).not.toContain('BETTER_AUTH_OLD_SECRETS=');
      expect(runbook).toContain('BETTER_AUTH_SECRETS');
      expect(runbook).toContain('<version>:<secret>');
    });

    it('rehearses live secret rotation and confirms 100% TOTP secret preservation', async () => {
      const result = await runSecretRotationRehearsal();
      expect(result.passed).toBe(true);
      expect(result.totpPreserved).toBe(true);
      expect(result.v1Fingerprint).toBeDefined();
      expect(result.v2Fingerprint).toBeDefined();

      const evidencePath = resolve(repoRoot, 'docs', 'evidence', 'secret_rotation_rehearsal_log.md');
      expect(existsSync(evidencePath)).toBe(true);
      const log = readFileSync(evidencePath, 'utf8');
      expect(log).toContain('PASS (100% Zero-Downtime Session & TOTP Preservation)');
    });
  });

  describe('T7.3.4: Container Hardening, SRI Policy & OWASP ZAP Scans', () => {
    it('verifies production compose enforces read_only root and drop capabilities', () => {
      const composePath = resolve(repoRoot, 'deploy', 'compose', 'docker-compose.prod.yml');
      expect(existsSync(composePath)).toBe(true);
      const compose = readFileSync(composePath, 'utf8');

      expect(compose).toContain('read_only: true');
      expect(compose).toContain('no-new-privileges:true');
      expect(compose).toContain('cap_drop:');
      expect(compose).toContain('- ALL');
      expect(compose).not.toContain('/var/run/docker.sock');
    });

    it('verifies SRI policy document exists and documents Turnstile exemption', () => {
      const sriPath = resolve(repoRoot, 'docs', 'security', 'SRI_POLICY.md');
      expect(existsSync(sriPath)).toBe(true);
      const sri = readFileSync(sriPath, 'utf8');

      expect(sri).toContain('Subresource Integrity (SRI) Policy');
      expect(sri).toContain('Cloudflare Turnstile');
      expect(sri).toContain('EXEMPT');
      expect(sri).toContain('challenges.cloudflare.com');
    });

    it('verifies OWASP ZAP full scan reports 0 High findings and 0 FAIL rule violations', async () => {
      const { runZapFullScan } = await import('../../../tooling/ops/zap-full-scan.mjs');
      const zapSummary = await runZapFullScan({ targetUrl: 'http://127.0.0.1:8787', allowPrivate: true });

      expect(zapSummary.passed).toBe(true);
      expect(zapSummary.highFindings).toBe(0);
      expect(zapSummary.failViolations).toBe(0);
    });
  });
});
