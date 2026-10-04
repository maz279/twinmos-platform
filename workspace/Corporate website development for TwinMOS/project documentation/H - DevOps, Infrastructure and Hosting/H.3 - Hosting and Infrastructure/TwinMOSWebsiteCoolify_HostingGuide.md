# TwinMOS Website — Coolify v4 Hosting Guide

| | |
|:---|:---|
| **Reference** | H.3-003 |
| **Priority** | P0 |
| **Status** | [M] Must-have |
| **Author** | DevOps Lead |
| **Version** | 1.0 |
| **Date** | 2026-05-01 |
| **Review Cycle** | Quarterly |

---

## 1. Purpose

This document provides the complete guide for deploying and managing the TwinMOS backend services using Coolify v4, a self-hosted PaaS running on Hetzner Cloud.

---

## 2. Coolify Overview

| Attribute | Specification |
|:---|:---|
| **Version** | v4.x (latest stable) |
| **Installation** | Self-hosted on Hetzner VPS |
| **Orchestration** | Docker Compose |
| **Web UI** | HTTPS on port 8000 |
| **API** | REST + WebSocket |
| **Cost** | Free (open source) |

**Why Coolify:** Zero vendor lock-in, native Docker Compose support, automatic SSL, built-in CI/CD webhooks, simpler than Kubernetes for a 2-dev team.

---

## 3. Installation

### 3.1 Server Prerequisites

```bash
# Hetzner CX32 (P1-P2) or CX42 (P3)
# Ubuntu 24.04 LTS
apt update && apt upgrade -y
curl -fsSL https://get.docker.com | sh
usermod -aG docker root
```

### 3.2 Install Coolify

```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
# Access: https://<hetzner-ip>:8000
```

### 3.3 Initial Setup

1. Create admin account
2. Configure server (localhost)
3. Set domain: `coolify.twinmos.com`
4. Enable automatic SSL (Let's Encrypt)

---

## 4. Application Setup

### 4.1 Create Project

- **Project Name**: `twinmos-website`
- **Description**: TwinMOS Corporate Website Backend

### 4.2 Resources

#### Strapi Backend

| Setting | Value |
|:---|:---|
| **Name** | `strapi-backend` |
| **Type** | Docker Compose |
| **Repository** | `https://github.com/twinmos/website` |
| **Branch** | `main` |
| **Dockerfile** | `docker/backend.Dockerfile` |
| **Port** | 1337 |
| **Health Check** | `/api/health` |

**Environment Variables:**

```env
NODE_ENV=production
DATABASE_CLIENT=postgres
DATABASE_HOST=postgres-db
DATABASE_PORT=5432
DATABASE_NAME=strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=${POSTGRES_PASSWORD}
JWT_SECRET=${JWT_SECRET}
ADMIN_JWT_SECRET=${ADMIN_JWT_SECRET}
APP_KEYS=${APP_KEYS}
API_TOKEN_SALT=${API_TOKEN_SALT}
TRANSFER_TOKEN_SALT=${TRANSFER_TOKEN_SALT}
HOST=0.0.0.0
PORT=1337
STRAPI_TELEMETRY_DISABLED=true
```

#### PostgreSQL Database

| Setting | Value |
|:---|:---|
| **Name** | `postgres-db` |
| **Type** | Database (PostgreSQL) |
| **Version** | 16 |
| **Port** | 5432 |
| **Database** | `strapi` |
| **Username** | `strapi` |

**Post-Init SQL:**

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE USER backup_user WITH PASSWORD '<backup-password>';
GRANT CONNECT ON DATABASE strapi TO backup_user;
GRANT USAGE ON SCHEMA public TO backup_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO backup_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO backup_user;
```

#### MeiliSearch

| Setting | Value |
|:---|:---|
| **Name** | `meilisearch` |
| **Image** | `getmeili/meilisearch:v1.13` |
| **Port** | 7700 |
| **Volume** | `meilisearch_data:/meili_data` |

```env
MEILI_MASTER_KEY=${MEILI_MASTER_KEY}
MEILI_HTTP_ADDR=0.0.0.0:7700
MEILI_ENV=production
```

#### Redis

| Setting | Value |
|:---|:---|
| **Name** | `redis-cache` |
| **Image** | `redis:7-alpine` |
| **Port** | 6379 |
| **Command** | `redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru` |

#### ImgProxy

| Setting | Value |
|:---|:---|
| **Name** | `imgproxy` |
| **Image** | `darthsim/imgproxy:v3` |
| **Port** | 8080 |

```env
IMGPROXY_KEY=${IMGPROXY_KEY}
IMGPROXY_SALT=${IMGPROXY_SALT}
IMGPROXY_ALLOW_ORIGIN=*
IMGPROXY_MAX_SRC_RESOLUTION=50
```

#### Plausible Analytics

| Setting | Value |
|:---|:---|
| **Name** | `plausible` |
| **Image** | `plausible/analytics:v2.1` |
| **Port** | 8000 |

```env
BASE_URL=https://analytics.twinmos.com
SECRET_KEY_BASE=${PLAUSIBLE_SECRET}
DATABASE_URL=postgres://plausible:${DB_PASSWORD}@plausible-db:5432/plausible
DISABLE_REGISTRATION=true
```

---

## 5. Docker Compose Specification

```yaml
version: '3.8'

services:
  strapi-backend:
    build:
      context: .
      dockerfile: docker/backend.Dockerfile
    ports:
      - "1337:1337"
    environment:
      - NODE_ENV=production
      - DATABASE_CLIENT=postgres
      - DATABASE_HOST=postgres-db
      - DATABASE_PORT=5432
      - DATABASE_NAME=strapi
      - DATABASE_USERNAME=strapi
      - DATABASE_PASSWORD=${POSTGRES_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
      - ADMIN_JWT_SECRET=${ADMIN_JWT_SECRET}
      - APP_KEYS=${APP_KEYS}
      - API_TOKEN_SALT=${API_TOKEN_SALT}
      - TRANSFER_TOKEN_SALT=${TRANSFER_TOKEN_SALT}
    depends_on:
      - postgres-db
      - redis-cache
      - meilisearch
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:1337/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
    networks:
      - coolify
    restart: unless-stopped

  postgres-db:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=strapi
      - POSTGRES_USER=strapi
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U strapi -d strapi"]
      interval: 10s
      timeout: 5s
      retries: 5
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 2G
    networks:
      - coolify
    restart: unless-stopped

  meilisearch:
    image: getmeili/meilisearch:v1.13
    ports:
      - "7700:7700"
    environment:
      - MEILI_MASTER_KEY=${MEILI_MASTER_KEY}
      - MEILI_HTTP_ADDR=0.0.0.0:7700
      - MEILI_ENV=production
    volumes:
      - meilisearch_data:/meili_data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:7700/health"]
      interval: 10s
      timeout: 5s
      retries: 5
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 1G
    networks:
      - coolify
    restart: unless-stopped

  redis-cache:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3
    deploy:
      resources:
        limits:
          cpus: '0.25'
          memory: 256M
    networks:
      - coolify
    restart: unless-stopped

  imgproxy:
    image: darthsim/imgproxy:v3
    ports:
      - "8080:8080"
    environment:
      - IMGPROXY_KEY=${IMGPROXY_KEY}
      - IMGPROXY_SALT=${IMGPROXY_SALT}
      - IMGPROXY_ALLOW_ORIGIN=*
      - IMGPROXY_MAX_SRC_RESOLUTION=50
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:8080/health"]
      interval: 10s
      timeout: 5s
      retries: 3
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
    networks:
      - coolify
    restart: unless-stopped

volumes:
  postgres_data:
  meilisearch_data:
  redis_data:

networks:
  coolify:
    external: true
```

---

## 6. Domain & SSL

### 6.1 Add Domains

| Domain | Resource | SSL |
|:---|:---|:---|
| `api.twinmos.com` | strapi-backend | Let's Encrypt |
| `api-staging.twinmos.com` | staging Strapi | Let's Encrypt |
| `analytics.twinmos.com` | Plausible | Let's Encrypt |

### 6.2 Certificate Renewal

Coolify auto-renews 30 days before expiry. Manual refresh:

```bash
ssh root@<hetzner-ip>
cd /data/coolify
 docker compose exec traefik traefik certificatesresolvers.letsencrypt.acme.tlschallenge=true
```

---

## 7. CI/CD Integration

### 7.1 Webhook Setup

1. Coolify -> Project -> Settings -> Webhooks
2. **Webhook URL**: `https://coolify.twinmos.com/webhooks/github/<project-id>`
3. Store secret in GitHub as `COOLIFY_WEBHOOK_PRODUCTION`

### 7.2 Deployment Flow

```
GitHub Release -> Build Docker image -> Push to GHCR
-> GitHub Actions calls Coolify webhook
-> Coolify pulls image -> Rolling restart
-> Health checks verify -> Deployment complete
```

### 7.3 Manual Deployment

```bash
curl -X POST "https://coolify.twinmos.com/api/v1/deploy" \
  -H "Authorization: Bearer ${COOLIFY_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"uuid": "<resource-uuid>", "docker_image": "ghcr.io/twinmos/website/backend:v1.4.2"}'
```

---

## 8. Backup Configuration

### 8.1 PostgreSQL Backup

```bash
#!/bin/bash
# /opt/backup/postgres-backup.sh
BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
BUCKET="twinmos-db-backups"

 docker exec postgres-db pg_dump -U strapi strapi | gzip > "$BACKUP_DIR/strapi_$DATE.sql.gz"
gpg --symmetric --cipher-algo AES256 --batch --passphrase "$BACKUP_PASSPHRASE" \
  --output "$BACKUP_DIR/strapi_$DATE.sql.gz.gpg" "$BACKUP_DIR/strapi_$DATE.sql.gz"
b2 upload-file "$BUCKET" "$BACKUP_DIR/strapi_$DATE.sql.gz.gpg" "postgres/strapi_$DATE.sql.gz.gpg"
rm "$BACKUP_DIR/strapi_$DATE.sql.gz" "$BACKUP_DIR/strapi_$DATE.sql.gz.gpg"
find "$BACKUP_DIR" -name "*.gpg" -mtime +7 -delete
```

**Cron**: `0 2 * * *` (daily at 2 AM UTC)

### 8.2 MeiliSearch Backup

```bash
#!/bin/bash
# /opt/backup/meilisearch-backup.sh
BACKUP_DIR="/backups/meilisearch"
DATE=$(date +%Y%m%d_%H%M%S)
BUCKET="twinmos-db-backups"

 docker exec meilisearch meilisearch --dump-dir /meili_data/dumps --dump
tar czf - /meili_data/dumps | gpg --symmetric --cipher-algo AES256 \
  --batch --passphrase "$BACKUP_PASSPHRASE" > "$BACKUP_DIR/meilisearch_$DATE.tar.gz.gpg"
b2 upload-file "$BUCKET" "$BACKUP_DIR/meilisearch_$DATE.tar.gz.gpg" \
  "meilisearch/meilisearch_$DATE.tar.gz.gpg"
rm "$BACKUP_DIR/meilisearch_$DATE.tar.gz.gpg"
```

---

## 9. Monitoring

### 9.1 Built-in Metrics

| Metric | Alert Threshold |
|:---|:---|
| CPU Usage | > 80% for 5 min |
| Memory Usage | > 85% for 5 min |
| Disk Usage | > 80% |
| Container Status | Not running |
| Deployment Status | Failed |

### 9.2 Health Check Endpoints

| Service | Endpoint | Expected |
|:---|:---|:---|
| Strapi | `/api/health` | `{"status":"ok"}` |
| PostgreSQL | `pg_isready -U strapi` | accepting connections |
| MeiliSearch | `/health` | `{"status":"available"}` |
| Redis | `redis-cli ping` | `PONG` |
| ImgProxy | `/health` | HTTP 200 |

---

## 10. Troubleshooting

| Issue | Symptom | Solution |
|:---|:---|:---|
| Container won't start | Exit code 1 | Check logs: `docker logs <container>` |
| DB connection failed | ECONNREFUSED | Verify postgres is running, check credentials |
| Out of memory | OOMKilled | Increase memory limit or scale VPS |
| SSL error | CERT_INVALID | Check domain DNS, force cert renewal |
| Webhook not triggering | No auto-deploy | Verify webhook URL and secret |
| Build fails | Build error | Check build logs, verify Dockerfile |
| Health check fails | Unhealthy | Check endpoint, increase start period |

---

## 11. Change Log

| Version | Date | Author | Changes |
|:---|:---|:---|:---|
| 1.0 | 2026-05-01 | DevOps Lead | Initial release |

---

## 12. Sign-off

| Role | Name | Date | Signature |
|:---|:---|:---|:---|
| DevOps Lead | | | |
| Tech Lead | | | |
| Project Manager | | | |
