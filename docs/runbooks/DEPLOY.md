# DEPLOY — TwinMOS production runbook (P7)

**Topology (docs/01 §4.6, ADR D-2):** Cloudflare (TLS, WAF) → VM nginx (`deploy/nginx/twinmos.conf` with `deploy/nginx/realip_cloudflare.conf`) → static web + admin bundles on disk, `/api/` → Node service (`deploy/systemd/twinmos-api.service`) → Postgres 18 (same VM or dedicated managed PG18 per ADR D-2). One origin keeps Better Auth cookies same-site.

## 0. Prerequisites (once per VM)

```bash
# user + dirs
sudo useradd -r -s /usr/sbin/nologin twinmos
sudo mkdir -p /opt/twinmos/api /var/www/twinmos/web /var/www/twinmos/admin \
             /var/lib/twinmos/partner-files /var/lib/twinmos/media \
             /etc/twinmos /var/backups/twinmos
sudo chown -R twinmos:twinmos /var/lib/twinmos

# node 24 + postgres 18 (PGDG repository) + nginx
```

## 1. Database (PostgreSQL 18 pinned)

```bash
sudo -u postgres createuser twinmos && sudo -u postgres createdb twinmos -O twinmos
# Enable WAL archiving for RPO 15min (archive_command → B2/backup volume) — see DR.md
```

## 2. API service

```bash
# ship the repo (git clone / rsync), then from twinmso_codebase:
cd apps/api && npm ci --omit=dev
# secrets: sudo $EDITOR /etc/twinmos/api.env   (copy .env.production.example; chmod 600)
export $(cat /etc/twinmos/api.env | xargs) && npm run db:migrate   # applies all migrations
# Bootstrap super admin creation (SEED-01, SEED-02, AUTH-BOOT):
# The bootstrap super_admin is created verified (emailVerified: true), and the operator attests
# this verification during setup to immediately unblock staff sign-in without activation tokens.
# Demo partner orgs, demo leads, demo products, and demo translations are strictly skipped in production/bootstrap mode.
BOOTSTRAP_SEED=1 SEED_ADMIN_EMAIL=admin@twinmos.com SEED_ADMIN_PASSWORD='<SECURE_STRONG_PASSWORD>' npm run db:seed
# (operator attestation: verify admin can sign in, then rotate password or enroll 2FA immediately on first sign-in)
sudo cp deploy/systemd/twinmos-api.service /etc/systemd/system/
sudo systemctl daemon-reload && sudo systemctl enable --now twinmos-api
curl -s http://127.0.0.1:8787/api/v1/health   # expect {status:"ok"}
```

## 3. Web + admin bundles

```bash
# Web build env is BAKED into the HTML. On a FRESH CLONE (no apps/web/.env — it is
# gitignored), PUBLIC_API_URL defaults to '' which forms.js resolves to same-origin
# /api/v1 behind nginx — exactly right. ONLY the Turnstile site key needs setting:
#   - Linux build box:  PUBLIC_TURNSTILE_SITE_KEY=0xXXXX npm run build
#   - Git Bash/Windows: leading-slash values get MSYS-mangled — prefer building from
#     a clean clone and put PUBLIC_TURNSTILE_SITE_KEY in apps/web/.env instead.
# NEVER set PUBLIC_API_URL=/api/v1 by assignment on Git Bash (it becomes
# "C:/Program Files/Git/api/v1"); the empty default is already correct.
ls apps/web/.env 2>/dev/null && { echo "apps/web/.env present — remove it before production builds"; exit 1; }
cd apps/web && npm ci && npm run build    # dist/ (vendored app.js/data.js sync runs in prebuild)
cd ../admin && npm ci && npm run build
sudo rsync -a --delete apps/web/dist/  /var/www/twinmos/web/
sudo rsync -a --delete apps/admin/dist/ /var/www/twinmos/admin/
```

## 4. nginx + Cloudflare

```bash
sudo cp deploy/nginx/realip_cloudflare.conf /etc/nginx/snippets/realip_cloudflare.conf
sudo cp deploy/nginx/twinmos.conf /etc/nginx/sites-available/twinmos.conf
sudo ln -s /etc/nginx/sites-available/twinmos.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

Cloudflare DNS → VM (proxied). Edge rules: TLS full-strict, Brotli, "Full (strict)" origin cert (`/etc/nginx/certs/twinmos.pem`).
nginx includes `realip_cloudflare.conf` to restore client IP from Cloudflare ranges and passes single trusted `X-Real-IP: $remote_addr`.
Set `TRUST_PROXY=1` in `/etc/twinmos/api.env` so the API reads the single canonical `X-Real-IP` header (`EDGE-01`).

## 5. Backups

Run from the repo checkout that runs the stack (the scripts use `docker compose exec`;
override the compose command with `TWINMOS_COMPOSE` if your project name/overlays differ):

```bash
# cron root: 15 2 * * * cd /opt/twinmos && BACKUP_ENCRYPTION_KEY=... B2_BUCKET=... deploy/backup.sh >> /var/log/twinmos-backup.log 2>&1
```

Off-site sync refuses to run without `BACKUP_ENCRYPTION_KEY`; only `offsite/*.enc` leave the host.
Restore/DR: `deploy/restore.sh [--drill] <backup-dir>` (production restore asks for the stamp; `--drill` restores into a throwaway database — see docs/runbooks/DR.md).

## 6. Cutover checklist

- [ ] `curl https://www.twinmos.com/api/v1/health` → ok
- [ ] Sign in to /admin (seeded admin) → **rotate password** → create real staff users
- [ ] Turnstile keys live (site key baked into web build; secret in api.env) — remove `API_ALLOW_NO_TURNSTILE`
- [ ] Resend live (`RESEND_API_KEY`) — submit the quote form, confirm auto-reply
- [ ] Rate limits: `TRUST_PROXY=1` + Cloudflare; verify 429s via rapid curl
- [ ] Partner portal E2E on production (sign-in → gated download)
- [ ] SN-check on production (a registry serial → genuine)
- [ ] Backups: first `backup.sh` run + one `restore.sh --drill` recorded
- [ ] Monitoring: uptime check on /health; log shipping for `twinmos-api`
- [ ] ZAP baseline + load test re-run against production (record in p7-evidence)

## 7. Rollback

Static bundles: redeploy previous `dist` (keep last 3 dated copies on the VM).
API: `git checkout <prev-tag> && systemctl restart twinmos-api`.
Database: migrations are forward-only — restore from backup (`restore.sh`) if a migration must be undone.

## 8. Containerized Staging & Automated Deployment (Phase B / DEPLOY-01)

### VM Bootstrap (One-time host setup)
```bash
sudo ./deploy/staging/bootstrap-vm.sh
# Provisions Docker, enables UFW firewall (allows 22, 80, 443; enforces S-11 port isolation)
```

### Automated Rollout
```bash
./deploy/staging/deploy.sh
# Executes pre-flight checks, builds multi-stage containers (non-root node),
# runs migrations, healthchecks API & Web SSR, and performs atomic edge reload.
```

### Docker Compose Topologies
- **Base topology**: `deploy/compose/docker-compose.yml` (Edge, Web SSR, API with internal-only S-11 network, Postgres 18)
- **Production overlay**: `deploy/compose/docker-compose.prod.yml` (resource limits, restart: always)
- **CI overlay**: `deploy/compose/docker-compose.ci.yml` (tmpfs postgres, automated runner port maps)
- **Dev overlay**: `deploy/compose/docker-compose.dev.yml` (loopback bind for local debugging)

---

## 9. Self-Hosted CI Runner Architecture (A10 Runner)

Continuous integration and automated staging validation execute on the **A10 Self-Hosted Runner**:
- **Hardware Profile**: 8 vCPU, 16 GB RAM, 100 GB NVMe storage on dedicated isolated VPC.
- **Operating System**: Ubuntu 24.04 LTS (pinned Docker Engine 27.x, Node.js 24 LTS, PostgreSQL 18 client).
- **Security & Privilege Isolation**:
  - The runner service executes under an unprivileged system user (`github-runner`).
  - Read-only filesystem layers for base container images; containers run with `USER node:node` (UID 1000).
  - No host Docker socket (`/var/run/docker.sock`) mounts exposed to test workloads.
  - Ephemeral runner containers are destroyed and recreated per job execution.

---

## 10. Host Firewall & DOCKER-USER Isolation (Finding S-11 / Hardening)

To prevent Docker's default iptables rules from bypassing host UFW and exposing PostgreSQL (5432) or upstream API (8787) to the public internet:
```bash
# 1. Enforce DOCKER-USER chain filtering in iptables:
sudo iptables -I DOCKER-USER -i eth0 ! -s 127.0.0.1 -p tcp --dport 5432 -j DROP
sudo iptables -I DOCKER-USER -i eth0 ! -s 127.0.0.1 -p tcp --dport 8787 -j DROP

# 2. UFW default deny with explicit ingress rules (deploy/firewall/setup-firewall.sh):
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP (Cloudflare Proxy / Certbot)'
sudo ufw allow 443/tcp comment 'HTTPS (Cloudflare Proxy)'
sudo ufw enable

# 3. Verify external ports are closed (returns connection refused or timeout from external probe):
nc -zv <PUBLIC_IP> 5432 # FAIL / Closed
nc -zv <PUBLIC_IP> 8787 # FAIL / Closed
```

---

## 11. Cloudflare IP Range Refresh Automation (`EDGE-01`)

To guarantee that client IP addresses are accurately resolved and spoofed `X-Forwarded-For` headers are discarded:
```bash
# Cross-platform Node.js synchronization:
node tooling/refresh-cf-ranges.mjs

# Generates deploy/nginx/realip_cloudflare.conf:
# set_real_ip_from 173.245.48.0/20;
# ...
# real_ip_header X-Forwarded-For;
# real_ip_recursive on;

# Automated weekly crontab (root):
0 3 * * 0 /usr/bin/node /opt/twinmos/code/tooling/refresh-cf-ranges.mjs && /usr/bin/systemctl reload nginx
```

---

## 12. Administrative Role Hierarchy & Governance (`adminRoles` / NEW-07)

Administrative access is gated using the normalized `adminRoles` mapping across `@twinmos/db` and API middlewares:
- **`super_admin`**: Full platform control (security settings, MFA revocation, user management, and DSAR erasure).
- **`admin`**: Content publishing, SKU catalog unlocks, support routing, RMA adjudication, and setting configurations.
- **`editor`**: Multi-locale content authoring, review, publishing, and audit inspection.
- **`author`**: Draft content creation (cannot publish directly).
- **`viewer`**: Read-only oversight across CRM, RMA, and analytics.

All administrative routes enforce `requireRole(['super_admin', 'admin'])` at the API handler level (`NEW-07`).


