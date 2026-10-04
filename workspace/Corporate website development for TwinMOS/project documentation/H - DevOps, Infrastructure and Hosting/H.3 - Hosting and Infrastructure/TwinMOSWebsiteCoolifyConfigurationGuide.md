# TwinMOS Website — Coolify Configuration Guide

**Document ID:** H.3-002  
**Version:** 1.0  
**Status:** Active  
**Owner:** Tech Lead  
**Last Updated:** 2026-05-01  
**Related:** TwinMOSWebsiteHetznerProvisioningGuide.md · TwinMOSWebsiteHostingArchitectureSpec.md · TwinMOSWebsiteEnvironmentVariablesReference.md

---

## 1. Overview

**Coolify v4** is the self-hosted PaaS used to manage all backend services on the TwinMOS Hetzner VPS. It provides a web dashboard for deploying Docker containers, configuring environment variables, setting up domains with auto SSL, scheduling backups, and managing rolling deployments.

| Attribute | Value |
|-----------|-------|
| Version | v4.0.0-beta.470+ (production-grade despite beta label) |
| Dashboard | `https://coolify.twinmos.com` (or direct via Hetzner IP:8000 before DNS is live) |
| Admin account | Tech Lead only (MFA required) |
| Runs on | Hetzner CX32 (Falkenstein DE) |
| Manages | Strapi, PostgreSQL, MeiliSearch, ImgProxy, Redis, Plausible, Traefik |

> **Coolify v5 monitoring:** TRISK-22 in the Tech Stack risk register tracks Coolify v5 GA. Upgrade path will be documented when v5 GA is released.

---

## 2. Installation

Run on the freshly provisioned Hetzner CX32 as root or sudo user:

```bash
# One-line installer (run after cloud-init completes, ~5 min post-provision)
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash

# The installer:
# 1. Installs Docker if not present
# 2. Downloads Coolify docker-compose.yml
# 3. Starts Coolify stack (coolify, coolify-proxy, coolify-db, coolify-redis, coolify-realtime)
# 4. Exposes dashboard on port 8000 (HTTP, pre-SSL)

# After installation, Coolify is accessible at:
# http://<hetzner-ip>:8000
```

### 2.1 Initial Setup Wizard

1. Open `http://<hetzner-ip>:8000` in browser
2. Create admin account (use Tech Lead email + strong password from Bitwarden)
3. Enable MFA (TOTP) immediately — required before any team member uses Coolify
4. Register the Hetzner CX32 as a **server** using local (loopback) SSH
5. Add SSH key (Hetzner root key) for remote server management
6. Set up a **project** named `twinmos-production`

### 2.2 Domain & SSL Setup for Dashboard

After DNS is pointed:
```bash
# In Coolify: Settings → Instance → Domain
# Set: coolify.twinmos.com
# Coolify auto-provisions Let's Encrypt wildcard cert
# Dashboard becomes available at https://coolify.twinmos.com
```

---

## 3. Service Configurations

### 3.1 Strapi 5 — CMS Backend

```yaml
# Coolify Application Settings: twinmos-strapi
Type: Docker Image (or Docker Compose service)
Image: ghcr.io/twinmos/twinmos-backend:latest
Port: 1337
Domain: api.twinmos.com
Health Check: GET /api/_health → expect HTTP 200

Environment Variables (set in Coolify → Environment):
  NODE_ENV=production
  HOST=0.0.0.0
  PORT=1337
  APP_KEYS=<64-char random hex, comma-separated 4 keys>
  API_TOKEN_SALT=<32-char random hex>
  ADMIN_JWT_SECRET=<64-char random hex>
  TRANSFER_TOKEN_SALT=<32-char random hex>
  JWT_SECRET=<64-char random hex>
  DATABASE_CLIENT=postgres
  DATABASE_HOST=postgres
  DATABASE_PORT=5432
  DATABASE_NAME=strapi_prod
  DATABASE_USERNAME=strapi_user
  DATABASE_PASSWORD=<strong password from Bitwarden>
  DATABASE_SSL=false
  MEILI_HOST=http://meilisearch:7700
  MEILI_MASTER_KEY=<master key>
  B2_ENDPOINT=https://s3.us-west-002.backblazeb2.com
  B2_BUCKET=twinmos-media-prod
  B2_ACCESS_KEY_ID=<B2 application key ID>
  B2_SECRET_ACCESS_KEY=<B2 application key>
  B2_REGION=us-west-002
  B2_CDN_URL=https://twinmos-media-prod.s3.us-west-002.backblazeb2.com
  RESEND_API_KEY=<Resend API key>
  EMAIL_FROM=noreply@twinmos.com
  SENTRY_DSN=<Strapi Sentry DSN>

Resource Limits:
  Memory: 1536m
  CPU: 1.5

Restart Policy: unless-stopped
Deploy: Rolling restart (zero downtime)
```

### 3.2 PostgreSQL 16 — Primary Database

```yaml
# Coolify Database Resource: twinmos-postgres
Type: PostgreSQL
Image: postgres:16
Port: 5432 (internal only — NOT exposed externally)
Volume: /var/lib/coolify/databases/postgres_prod:/var/lib/postgresql/data

Environment Variables:
  POSTGRES_DB=strapi_prod
  POSTGRES_USER=strapi_user
  POSTGRES_PASSWORD=<strong password from Bitwarden>

Post-init SQL (run once after first start):
  CREATE DATABASE plausible_prod;
  CREATE USER plausible_user WITH PASSWORD '<plausible-db-password>';
  GRANT ALL PRIVILEGES ON DATABASE plausible_prod TO plausible_user;

Resource Limits:
  Memory: 2048m
  CPU: 1.0

Backup: Coolify scheduled backup → B2 (see Section 7)
```

### 3.3 MeiliSearch 1.13 — Search Engine

```yaml
# Coolify Service: twinmos-meilisearch
Type: Docker Service
Image: getmeili/meilisearch:v1.13
Port: 7700 (internal)
Domain: search.twinmos.com (public, read-only key exposed)
Health Check: GET /health → expect {"status":"available"}

Environment Variables:
  MEILI_MASTER_KEY=<master key — also stored in Strapi env>
  MEILI_ENV=production
  MEILI_DB_PATH=/meili_data
  MEILI_NO_ANALYTICS=true

Volume: /var/lib/coolify/meilisearch:/meili_data

Resource Limits:
  Memory: 1024m
  CPU: 0.5

Note: Public search key (NOT master key) is exposed to frontend.
      Master key is used only by Strapi plugin for index management.
```

### 3.4 ImgProxy 3 — Image Transformation

```yaml
# Coolify Service: twinmos-imgproxy
Type: Docker Service
Image: darthsim/imgproxy:v3
Port: 8080 (internal)
Domain: imgproxy.twinmos.com

Environment Variables:
  IMGPROXY_KEY=<hex key, min 16 bytes>
  IMGPROXY_SALT=<hex salt, min 16 bytes>
  IMGPROXY_MAX_SRC_RESOLUTION=50
  IMGPROXY_MAX_ANIMATION_FRAMES=100
  IMGPROXY_ENABLE_WEBP_DETECTION=true
  IMGPROXY_ENABLE_AVIF_DETECTION=true
  IMGPROXY_ENFORCE_WEBP=true
  IMGPROXY_JPEG_PROGRESSIVE=true
  IMGPROXY_PNG_INTERLACED=true
  IMGPROXY_FALLBACK_IMAGE_URL=https://twinmos-media-prod.s3.us-west-002.backblazeb2.com/placeholder.png
  IMGPROXY_USE_S3=true
  IMGPROXY_S3_REGION=us-west-002
  IMGPROXY_S3_ENDPOINT=https://s3.us-west-002.backblazeb2.com
  AWS_ACCESS_KEY_ID=<B2 key ID>
  AWS_SECRET_ACCESS_KEY=<B2 application key>

Resource Limits:
  Memory: 512m
  CPU: 0.5
```

### 3.5 Redis 7 — Cache (Phase 2)

```yaml
# Coolify Service: twinmos-redis
Type: Docker Service
Image: redis:7-alpine
Port: 6379 (internal only)
Command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru --requirepass <redis-password>

Volume: /var/lib/coolify/redis:/data

Resource Limits:
  Memory: 320m
  CPU: 0.25

Note: Activated at Phase 2. In Phase 1, Strapi connects without Redis.
      Redis password stored in Coolify secrets + Bitwarden.
```

### 3.6 Plausible Analytics 2.1 — Web Analytics

```yaml
# Coolify Service: twinmos-plausible
Type: Docker Service
Image: plausible/community-edition:v2.1
Port: 8000
Domain: analytics.twinmos.com
Depends on: PostgreSQL (plausible_prod DB), ClickHouse

Environment Variables:
  BASE_URL=https://analytics.twinmos.com
  DATABASE_URL=postgresql://plausible_user:<password>@postgres:5432/plausible_prod
  CLICKHOUSE_DATABASE_URL=http://plausible-clickhouse:8123/plausible_prod
  SECRET_KEY_BASE=<64-char random hex>
  TOTP_VAULT_KEY=<32-char random base64>
  DISABLE_REGISTRATION=true
  MAILER_EMAIL=analytics@twinmos.com
  SMTP_HOST_ADDR=smtp.resend.com
  SMTP_HOST_PORT=465
  SMTP_USER_NAME=resend
  SMTP_USER_PWD=<Resend SMTP password>

Resource Limits:
  Memory: 512m
  CPU: 0.5

Note: Plausible requires ClickHouse for event storage.
      ClickHouse is deployed as a separate Coolify service (twinmos-clickhouse).
```

### 3.7 ClickHouse — Plausible Event Storage

```yaml
# Coolify Service: twinmos-clickhouse
Type: Docker Service
Image: clickhouse/clickhouse-server:23
Port: 8123 (internal), 9000 (internal)
Volume: /var/lib/coolify/clickhouse:/var/lib/clickhouse

Resource Limits:
  Memory: 512m
  CPU: 0.25
```

---

## 4. Full Docker Compose Reference (Coolify-Managed)

The following is the equivalent docker-compose specification for all Coolify-managed services. This is for reference only — actual configuration is managed through the Coolify dashboard.

```yaml
# docker-compose.coolify.yml (reference — managed by Coolify)
version: "3.9"

services:
  strapi:
    image: ghcr.io/twinmos/twinmos-backend:latest
    restart: unless-stopped
    ports:
      - "1337:1337"
    environment:
      NODE_ENV: production
      # ... (see Section 3.1)
    depends_on:
      postgres:
        condition: service_healthy
      meilisearch:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:1337/api/_health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    deploy:
      resources:
        limits:
          memory: 1536M
          cpus: "1.5"
    networks:
      - twinmos-backend

  postgres:
    image: postgres:16
    restart: unless-stopped
    environment:
      POSTGRES_DB: strapi_prod
      POSTGRES_USER: strapi_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U strapi_user -d strapi_prod"]
      interval: 10s
      timeout: 5s
      retries: 5
    deploy:
      resources:
        limits:
          memory: 2048M
          cpus: "1.0"
    networks:
      - twinmos-backend

  meilisearch:
    image: getmeili/meilisearch:v1.13
    restart: unless-stopped
    ports:
      - "7700:7700"
    environment:
      MEILI_MASTER_KEY: ${MEILI_MASTER_KEY}
      MEILI_ENV: production
      MEILI_NO_ANALYTICS: "true"
    volumes:
      - meilisearch_data:/meili_data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:7700/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          memory: 1024M
          cpus: "0.5"
    networks:
      - twinmos-backend

  imgproxy:
    image: darthsim/imgproxy:v3
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      IMGPROXY_KEY: ${IMGPROXY_KEY}
      IMGPROXY_SALT: ${IMGPROXY_SALT}
      IMGPROXY_ENABLE_WEBP_DETECTION: "true"
      IMGPROXY_ENABLE_AVIF_DETECTION: "true"
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: "0.5"
    networks:
      - twinmos-backend

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: >
      redis-server
      --maxmemory 256mb
      --maxmemory-policy allkeys-lru
      --requirepass ${REDIS_PASSWORD}
      --appendonly yes
    volumes:
      - redis_data:/data
    deploy:
      resources:
        limits:
          memory: 320M
          cpus: "0.25"
    networks:
      - twinmos-backend

  plausible:
    image: plausible/community-edition:v2.1
    restart: unless-stopped
    ports:
      - "8000:8000"
    environment:
      BASE_URL: https://analytics.twinmos.com
      DATABASE_URL: postgresql://plausible_user:${PLAUSIBLE_DB_PASSWORD}@postgres:5432/plausible_prod
      CLICKHOUSE_DATABASE_URL: http://clickhouse:8123/plausible_prod
      SECRET_KEY_BASE: ${PLAUSIBLE_SECRET_KEY}
      DISABLE_REGISTRATION: "true"
    depends_on:
      postgres:
        condition: service_healthy
      clickhouse:
        condition: service_started
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: "0.5"
    networks:
      - twinmos-backend

  clickhouse:
    image: clickhouse/clickhouse-server:23
    restart: unless-stopped
    volumes:
      - clickhouse_data:/var/lib/clickhouse
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: "0.25"
    networks:
      - twinmos-backend

networks:
  twinmos-backend:
    driver: bridge
    name: twinmos-backend

volumes:
  postgres_data:
  meilisearch_data:
  redis_data:
  clickhouse_data:
```

---

## 5. Domain & SSL Configuration

Coolify uses **Traefik** as its reverse proxy and automatically provisions **Let's Encrypt** certificates via ACME.

```
Domain routing in Traefik (managed by Coolify):
  api.twinmos.com       → Strapi:1337
  admin.twinmos.com     → Strapi:1337/admin
  search.twinmos.com    → MeiliSearch:7700
  imgproxy.twinmos.com  → ImgProxy:8080
  analytics.twinmos.com → Plausible:8000
  coolify.twinmos.com   → Coolify dashboard:8000

SSL: Let's Encrypt ACME (HTTP-01 or TLS-ALPN-01 challenge)
     Certificates auto-renewed 30 days before expiry
     Stored in: /data/coolify/traefik/acme.json
```

---

## 6. CI/CD Webhook Integration

GitHub Actions triggers deployments via Coolify webhook:

```yaml
# In deploy-backend-prod.yml (excerpt)
- name: Deploy to Production Coolify
  run: |
    curl -X POST "${{ secrets.COOLIFY_WEBHOOK_URL }}" \
      -H "Authorization: Bearer ${{ secrets.COOLIFY_WEBHOOK_TOKEN }}" \
      -H "Content-Type: application/json" \
      -d '{"type":"deploy","ref":"main"}'
```

**Coolify webhook setup:**
1. Coolify dashboard → Application (twinmos-strapi) → Webhooks
2. Copy "Deploy Webhook URL"
3. Store as `COOLIFY_WEBHOOK_URL` in GitHub Actions Secrets (production environment)
4. Set webhook token in `COOLIFY_WEBHOOK_TOKEN`

---

## 7. Backup Configuration

### 7.1 Automated PostgreSQL Backup

Create as a cron job on Hetzner (via `crontab -e` as `deploy` user):

```bash
# /home/deploy/scripts/backup-postgres.sh
#!/usr/bin/env bash
set -euo pipefail

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/tmp/backups"
B2_BUCKET="twinmos-backups-prod"
GPG_PASSPHRASE="${GPG_BACKUP_PASSPHRASE}"  # from environment

mkdir -p "${BACKUP_DIR}"

# Dump PostgreSQL
docker exec twinmos-postgres-1 pg_dump \
  -U strapi_user strapi_prod \
  -F c \
  -f "/tmp/pg_backup.dump"

docker cp twinmos-postgres-1:/tmp/pg_backup.dump "${BACKUP_DIR}/pg_backup_${DATE}.dump"

# Encrypt
gpg --symmetric --cipher-algo AES256 \
    --passphrase "${GPG_PASSPHRASE}" \
    --batch --yes \
    -o "${BACKUP_DIR}/pg_backup_${DATE}.dump.gpg" \
    "${BACKUP_DIR}/pg_backup_${DATE}.dump"

# Upload to B2
b2 upload-file \
  "${B2_BUCKET}" \
  "${BACKUP_DIR}/pg_backup_${DATE}.dump.gpg" \
  "daily/pg_backup_${DATE}.dump.gpg"

# Cleanup local files
rm -f "${BACKUP_DIR}/pg_backup_${DATE}.dump" \
      "${BACKUP_DIR}/pg_backup_${DATE}.dump.gpg"

# Remove daily backups older than 30 days from B2
b2 ls --long "${B2_BUCKET}/daily/" | \
  awk -v cutoff="$(date -d '30 days ago' +%Y%m%d)" \
  '$0 < cutoff {print $NF}' | \
  xargs -r b2 delete-file-version

echo "Backup completed: pg_backup_${DATE}.dump.gpg"
```

```
# Cron schedule (daily at 02:00 UTC):
0 2 * * * /home/deploy/scripts/backup-postgres.sh >> /var/log/backup.log 2>&1
```

### 7.2 MeiliSearch Dump

```bash
# /home/deploy/scripts/backup-meilisearch.sh
#!/usr/bin/env bash

DATE=$(date +%Y%m%d_%H%M%S)
MEILI_KEY="${MEILI_MASTER_KEY}"

# Trigger MeiliSearch dump
TASK_UID=$(curl -s -X POST "http://localhost:7700/dumps" \
  -H "Authorization: Bearer ${MEILI_KEY}" | jq -r '.taskUid')

# Wait for dump to complete (poll until succeeded)
for i in {1..30}; do
  STATUS=$(curl -s "http://localhost:7700/tasks/${TASK_UID}" \
    -H "Authorization: Bearer ${MEILI_KEY}" | jq -r '.status')
  [ "${STATUS}" = "succeeded" ] && break
  sleep 5
done

# Encrypt and upload dump
DUMP_PATH=$(docker exec twinmos-meilisearch-1 ls -t /meili_data/dumps/ | head -1)
docker cp "twinmos-meilisearch-1:/meili_data/dumps/${DUMP_PATH}" /tmp/meili_dump.dump

gpg --symmetric --cipher-algo AES256 \
    --passphrase "${GPG_BACKUP_PASSPHRASE}" \
    --batch --yes \
    -o "/tmp/meili_dump_${DATE}.dump.gpg" \
    /tmp/meili_dump.dump

b2 upload-file twinmos-backups-prod \
  "/tmp/meili_dump_${DATE}.dump.gpg" \
  "meilisearch/meili_dump_${DATE}.dump.gpg"

rm -f /tmp/meili_dump.dump "/tmp/meili_dump_${DATE}.dump.gpg"
```

---

## 8. Health Check Endpoints

| Service | URL | Expected Response |
|---------|-----|------------------|
| Strapi | `GET /api/_health` | `HTTP 200 {"data":{"server":"running"}}` |
| MeiliSearch | `GET /health` | `HTTP 200 {"status":"available"}` |
| ImgProxy | `GET /health` | `HTTP 200 OK` |
| Plausible | `GET /api/health` | `HTTP 200` |
| PostgreSQL | `pg_isready -U strapi_user` | `localhost:5432 - accepting connections` |

---

## 9. Troubleshooting Guide

### Strapi fails to start

```bash
# Check container logs
docker logs twinmos-strapi-1 --tail 100

# Common causes:
# 1. PostgreSQL not ready → wait for postgres health check
# 2. Missing env var → check Coolify environment variables
# 3. Port 1337 already in use → docker ps; kill conflicting container

# Force restart via Coolify
# Dashboard → twinmos-strapi → Restart
```

### PostgreSQL connection refused

```bash
# Check if postgres is running
docker ps | grep postgres

# Check postgres logs
docker logs twinmos-postgres-1 --tail 50

# Test connection
docker exec -it twinmos-postgres-1 pg_isready -U strapi_user
```

### MeiliSearch out of disk space

```bash
# Check disk usage
df -h /var/lib/coolify/meilisearch

# Delete old dumps
docker exec twinmos-meilisearch-1 find /meili_data/dumps -mtime +7 -delete

# Restart with fresh index (use only if dump restore is available!)
docker restart twinmos-meilisearch-1
```

### Coolify dashboard unreachable

```bash
# SSH to Hetzner
ssh deploy@<hetzner-ip>

# Check Coolify containers
docker ps | grep coolify

# Restart Coolify
cd /data/coolify/source
docker compose restart

# Full Coolify restart
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

### SSL certificate not renewing

```bash
# Check Traefik logs for ACME errors
docker logs coolify-proxy --tail 100 | grep -i acme

# Force renewal via Coolify dashboard
# Settings → Server → Force SSL Renewal
```

---

*Approved by: Chairman · Tech Lead*  
*Synchronized With: Technology Stack v1.1 §19.4*
