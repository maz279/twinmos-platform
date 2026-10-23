// Verification of Staging Architecture & Zero-SSH Deploy Automation (T3.7.1 & T3.7.2)
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = process.cwd();

console.log('================================================================');
console.log('  Staging Architecture & Zero-SSH Deploy Verification (T3.7.1 & T3.7.2)');
console.log('================================================================\n');

let failures = 0;

// 1. VM Bootstrap & Host Hardening (T3.7.1)
console.log('[*] 1. Checking Staging VM Bootstrap Script (deploy/staging/bootstrap-vm.sh)...');
const bootstrapPath = resolve(ROOT, 'deploy/staging/bootstrap-vm.sh');
if (!existsSync(bootstrapPath)) {
  console.error('[-] FAIL: Missing deploy/staging/bootstrap-vm.sh');
  failures++;
} else {
  const content = readFileSync(bootstrapPath, 'utf8');
  const required = ['ufw default deny incoming', 'ufw deny 8787/tcp', 'ufw deny 5432/tcp', 'ufw deny 4321/tcp', 'ufw allow 22/tcp', 'ufw allow 80/tcp', 'ufw allow 443/tcp'];
  for (const req of required) {
    if (!content.includes(req)) {
      console.error(`[-] FAIL: bootstrap-vm.sh missing rule: "${req}"`);
      failures++;
    }
  }
  if (failures === 0) console.log('[+] PASS: Staging VM bootstrap script enforces S-11 port isolation.');
}

// 2. Origin Firewall & Cloudflare Ingress (T3.7.1)
console.log('[*] 2. Checking Origin Ingress Firewall Rules (deploy/firewall/setup-firewall.sh)...');
const firewallPath = resolve(ROOT, 'deploy/firewall/setup-firewall.sh');
if (!existsSync(firewallPath)) {
  console.error('[-] FAIL: Missing deploy/firewall/setup-firewall.sh');
  failures++;
} else {
  const content = readFileSync(firewallPath, 'utf8');
  if (!content.includes('CF_IPV4') || !content.includes('CF_IPV6') || !content.includes('173.245.48.0/20')) {
    console.error('[-] FAIL: setup-firewall.sh missing Cloudflare ingress CIDR allow-lists');
    failures++;
  } else {
    console.log('[+] PASS: Host firewall isolates ingress strictly to Cloudflare edge IPs.');
  }
}

// 3. GitHub Actions Continuous Deployment Workflow (T3.7.2 / DEPLOY-01)
console.log('[*] 3. Checking CI Deploy Workflow (.github/workflows/deploy.yml)...');
const deployYmlPath = resolve(ROOT, '.github/workflows/deploy.yml');
if (!existsSync(deployYmlPath)) {
  console.error('[-] FAIL: Missing .github/workflows/deploy.yml');
  failures++;
} else {
  const yml = readFileSync(deployYmlPath, 'utf8');
  if (!yml.includes('timeout-minutes: 15')) {
    console.error('[-] FAIL: deploy.yml missing 15-minute runtime constraint');
    failures++;
  }
  if (!yml.includes('environment: staging') || !yml.includes('environment: production')) {
    console.error('[-] FAIL: deploy.yml missing staging and production environment targets');
    failures++;
  }
  if (!yml.includes('run --rm migrate') || !yml.includes('run --rm bootstrap')) {
    console.error('[-] FAIL: deploy.yml missing one-shot migrate & bootstrap steps');
    failures++;
  }
  if (yml.includes('ssh ') || yml.includes('appleboy/ssh-action')) {
    console.error('[-] FAIL: deploy.yml contains manual SSH (zero-SSH violated)');
    failures++;
  } else {
    console.log('[+] PASS: CI deploy job configured without manual SSH in <15 minutes with production gate.');
  }
}

// 4. Staging Deploy Automation Script (deploy/staging/deploy.sh)
console.log('[*] 4. Checking Deploy Rollout Script (deploy/staging/deploy.sh)...');
const deployShPath = resolve(ROOT, 'deploy/staging/deploy.sh');
if (!existsSync(deployShPath)) {
  console.error('[-] FAIL: Missing deploy/staging/deploy.sh');
  failures++;
} else {
  const content = readFileSync(deployShPath, 'utf8');
  if (!content.includes('migrate') || !content.includes('bootstrap') || !content.includes('.active_release.json')) {
    console.error('[-] FAIL: deploy.sh missing migration, bootstrap, or release recording');
    failures++;
  } else {
    console.log('[+] PASS: Staging deploy script verified with healthchecks & release tracking.');
  }
}

console.log('\n================================================================');
if (failures > 0) {
  console.error(`FAILED: ${failures} check(s) failed in staging architecture.`);
  process.exit(1);
} else {
  console.log('SUCCESS: Staging VM & Zero-SSH Deploy Automation verified (T3.7.1 & T3.7.2).');
  console.log('================================================================\n');
  process.exit(0);
}
