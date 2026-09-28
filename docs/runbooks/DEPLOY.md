# DEPLOY — TwinMOS production runbook (P7)

**Topology (docs/01 §4.6):** Cloudflare (TLS, WAF) → VM nginx (this config: `deploy/nginx/twinmos.conf`) → static web + admin bundles on disk, `/api/` → Node service (`deploy/systemd/twinmos-api.service`) → Postgres 16 (same VM or dedicated). One origin keeps Better Auth cookies same-site.

## 0. Prerequisites (once per VM)

```bash
# user + dirs
sudo useradd -r -s /usr/sbin/nologin twinmos
sudo mkdir -p /opt/twinmos/api /var/www/twinmos/web /var/www/twinmos/admin \
             /var/lib/twinmos/partner-files /var/lib/twinmos/media \
             /etc/twinmos /var/backups/twinmos
sudo chown -R twinmos:twinmos /var/lib/twinmos

# node 24 + postgres 16 + nginx (distro or nodesource/pgdg)
```

## 1. Database

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
npm run db:seed          # first boot only: admin user + demo/reference rows
# (rotate the seeded admin password immediately on first sign-in)
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
sudo cp deploy/nginx/twinmos.conf /etc/nginx/sites-available/twinmos.conf
sudo ln -s /etc/nginx/sites-available/twinmos.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

Cloudflare DNS → VM (proxied). Edge rules: TLS full-strict, Brotli, "Full (strict)" origin cert (`/etc/nginx/certs/twinmos.pem`). Set `TRUST_PROXY=1` in `/etc/twinmos/api.env` (already in the template) so rate limiting reads `cf-connecting-ip`.

## 5. Backups

```bash
sudo cp deploy/backup.sh /opt/twinmos/ && sudo chmod 700 /opt/twinmos/backup.sh
# cron root: 15 2 * * * BACKUP_ROOT=/var/backups/twinmos DATABASE_URL=... /opt/twinmos/backup.sh
```

Restore/DR: `deploy/restore.sh` (production restore asks for the stamp; `--drill` restores to a throwaway DB — see docs/runbooks/DR.md).

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
