# TwinMOS Website — Docker Compose Specification

**Document Reference:** TWN-DEVOPS-H1-002
**Document Version:** 1.0
**Status:** DRAFT — for Unisoft Engineering Review
**Date:** 2 May 2026
**Prepared by:** TwinMOS Digital Transformation Team
**Owner:** IT/Technical Lead (Implementation)
**Audience:** Unisoft engineering team, DevOps operators
**Classification:** CONFIDENTIAL — Unisoft + TwinMOS Internal Use
**Synchronized With:** Technology Stack v1.1 §3.3, §19.4, §29.2, Implementation Strategy v3.0 §3.2

---

## Change Log

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | 2 May 2026 | Initial release — Docker Compose for local dev and production-like staging |

---

## Table of Contents

1. [Overview](#1-overview)
2. [Container Inventory](#2-container-inventory)
3. [Local Development Compose File](#3-local-development-compose-file)
4. [Staging Environment Compose File](#4-staging-environment-compose-file)
5. [Production Services Reference](#5-production-services-reference)
6. [Networking](#6-networking)
7. [Volumes & Persistence](#7-volumes--persistence)
8. [Health Checks](#8-health-checks)
9. [Resource Limits](#9-resource-limits)
10. [Security Hardening](#10-security-hardening)
11. [Environment Variable Injection](#11-environment-variable-injection)
12. [Operational Commands](#12-operational-commands)

---

## 1. Overview

This document specifies the complete Docker Compose configuration for the TwinMOS website stack. Three variants are maintained:

| Variant | File | Purpose | Environment |
|---------|------|---------|-------------|
| **Local Dev** | `docker-compose.dev.yml` | Per-developer local stack | Localhost |
| **Staging** | `docker-compose.staging.yml` | UAT / pre-production mirror | Staging VPS |
| **Production** | Managed by Coolify | Production deployment | Hetzner via Coolify |

The local and staging compose files are version-controlled in the backend repository. Production services are configured via the Coolify dashboard (see [TwinMOSWebsiteCoolifyConfigurationGuide.md](../H.3%20-%20Hosting%20and%20Infrastructure/TwinMOSWebsiteCoolifyConfigurationGuide.md)).

---

## 2. Container Inventory

| Service | Image | Version | Local Port | Purpose | Phase |
|---------|-------|---------|------------|---------|-------|
| PostgreSQL | `postgres` | 16-alpine | 5432 | Primary database | P1 |
| MeiliSearch | `getmeili/meilisearch` | v1.13 | 7700 | Search engine | P1 |
| ImgProxy | `darthsim/imgproxy` | v3 | 8080 | Image transforms | P1 |
| Redis | `redis` | 7-alpine | 6379 | Cache / sessions | P2 |
| Plausible | `plausible/community-edition` | v2.1 | 8000 | Privacy analytics | P1 |
| Chatwoot | `chatwoot/chatwoot` | v3 | 3000 | Live chat | P2 |
| Strapi | Built from Dockerfile | latest | 1337 | Headless CMS | P1 |
| Medusa (P3) | `medusajs/medusa` | 2.x | 9000 | E-commerce engine | P3 |

---

## 3. Local Development Compose File

### 3.1 Complete `docker-compose.dev.yml`

```yaml
# =============================================================================
# TwinMOS Website — Local Development Docker Compose
# Document: TWN-DEVOPS-H1-002
# Purpose: One-command local stack for Strapi v5 + Astro 5 development
# Usage: docker compose -f docker-compose.dev.yml up -d
# =============================================================================

version: "3.9"

services:
  # ───────────────────────────────────────────────────────────────────────────
  # PostgreSQL 16 — Primary Database
  # ───────────────────────────────────────────────────────────────────────────
  postgres:
    image: postgres:16-alpine
    container_name: twinmos-postgres-dev
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-twinmos_dev}
      POSTGRES_USER: ${POSTGRES_USER:-twinmos}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-twinmos_dev_password}
      PGDATA: /var/lib/postgresql/data/pgdata
    ports:
      - "5432:5432"
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data
      - ./docker/postgres/init:/docker-entrypoint-initdb.d:ro
      - ./docker/postgres/conf:/etc/postgresql/conf.d:ro
    command: >
      postgres
      -c config_file=/etc/postgresql/conf.d/postgresql.conf
      -c logging_collector=on
      -c log_directory=/var/log/postgresql
      -c log_filename=postgresql-%Y-%m-%d_%H%M%S.log
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-twinmos} -d ${POSTGRES_DB:-twinmos_dev}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
    networks:
      - twinmos-dev

  # ───────────────────────────────────────────────────────────────────────────
  # MeiliSearch 1.13 — Multilingual Search Engine
  # ───────────────────────────────────────────────────────────────────────────
  meilisearch:
    image: getmeili/meilisearch:v1.13
    container_name: twinmos-meilisearch-dev
    restart: unless-stopped
    environment:
      MEILI_MASTER_KEY: ${MEILI_MASTER_KEY:-dev_meili_master_key_change_in_prod}
      MEILI_ENV: development
      MEILI_DB_PATH: /meili_data
      MEILI_HTTP_ADDR: 0.0.0.0:7700
    ports:
      - "7700:7700"
    volumes:
      - meilisearch_dev_data:/meili_data
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:7700/health"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 15s
    networks:
      - twinmos-dev

  # ───────────────────────────────────────────────────────────────────────────
  # ImgProxy 3.x — On-Demand Image Transformation
  # ───────────────────────────────────────────────────────────────────────────
  imgproxy:
    image: darthsim/imgproxy:v3
    container_name: twinmos-imgproxy-dev
    restart: unless-stopped
    environment:
      IMGPROXY_KEY: ${IMGPROXY_KEY:-dev_key_change_in_prod}
      IMGPROXY_SALT: ${IMGPROXY_SALT:-dev_salt_change_in_prod}
      IMGPROXY_BIND: ":8080"
      IMGPROXY_USE_ETAG: "true"
      IMGPROXY_TTL: 31536000
      IMGPROXY_AUTO_WEBP: "true"
      IMGPROXY_AUTO_AVIF: "true"
      IMGPROXY_ENFORCE_WEBP: "true"
      IMGPROXY_PRESET_JPEG_BACKUP: "fmt:jpeg,q:85"
      IMGPROXY_S3_REGION: ${B2_REGION:-us-west-002}
      IMGPROXY_S3_ENDPOINT: ${B2_ENDPOINT:-https://s3.us-west-002.backblazeb2.com}
      IMGPROXY_S3_KEY: ${B2_KEY_ID:-}
      IMGPROXY_S3_SECRET: ${B2_APPLICATION_KEY:-}
      IMGPROXY_ENABLE_DEBUG_HEADERS: "true"
    ports:
      - "8080:8080"
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:8080/health"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 10s
    networks:
      - twinmos-dev

  # ───────────────────────────────────────────────────────────────────────────
  # Redis 7 — Cache / Session Store (Phase 2+)
  # ───────────────────────────────────────────────────────────────────────────
  redis:
    image: redis:7-alpine
    container_name: twinmos-redis-dev
    restart: unless-stopped
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
    ports:
      - "6379:6379"
    volumes:
      - redis_dev_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 10s
    networks:
      - twinmos-dev
    profiles:
      - phase2

  # ───────────────────────────────────────────────────────────────────────────
  # Plausible Analytics — Privacy-First Analytics (Optional)
  # ───────────────────────────────────────────────────────────────────────────
  plausible:
    image: plausible/community-edition:v2.1
    container_name: twinmos-plausible-dev
    restart: unless-stopped
    ports:
      - "8000:8000"
    environment:
      BASE_URL: ${PLAUSIBLE_BASE_URL:-http://localhost:8000}
      SECRET_KEY_BASE: ${PLAUSIBLE_SECRET_KEY:-dev_secret_change_in_prod_32_chars_min}
      DATABASE_URL: postgres://${POSTGRES_USER:-twinmos}:${POSTGRES_PASSWORD:-twinmos_dev_password}@postgres:5432/plausible_dev
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:8000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    networks:
      - twinmos-dev
    profiles:
      - analytics

  # ───────────────────────────────────────────────────────────────────────────
  # Chatwoot — Live Chat (Phase 2+)
  # ───────────────────────────────────────────────────────────────────────────
  chatwoot:
    image: chatwoot/chatwoot:v3
    container_name: twinmos-chatwoot-dev
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      RAILS_ENV: development
      SECRET_KEY_BASE: ${CHATWOOT_SECRET_KEY:-dev_chatwoot_secret}
      POSTGRES_HOST: postgres
      POSTGRES_USERNAME: ${POSTGRES_USER:-twinmos}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-twinmos_dev_password}
      POSTGRES_DATABASE: chatwoot_dev
      REDIS_URL: redis://redis:6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - twinmos-dev
    profiles:
      - phase2

# ─────────────────────────────────────────────────────────────────────────────
# Volumes
# ─────────────────────────────────────────────────────────────────────────────
volumes:
  postgres_dev_data:
    driver: local
  meilisearch_dev_data:
    driver: local
  redis_dev_data:
    driver: local

# ─────────────────────────────────────────────────────────────────────────────
# Networks
# ─────────────────────────────────────────────────────────────────────────────
networks:
  twinmos-dev:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

### 3.2 PostgreSQL Configuration

**File:** `docker/postgres/conf/postgresql.conf`

```ini
# TwinMOS Development PostgreSQL Configuration
# Tuned for development — NOT for production

# Connection
listen_addresses = '*'
max_connections = 100

# Memory (adjust for workstation RAM)
shared_buffers = 256MB
effective_cache_size = 768MB
work_mem = 4MB
maintenance_work_mem = 64MB

# WAL / Checkpoint
wal_level = replica
max_wal_size = 1GB
min_wal_size = 80MB
checkpoint_completion_target = 0.9

# Logging
log_statement = 'mod'
log_min_duration_statement = 1000
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
log_checkpoints = on
log_connections = on
log_disconnections = on

# Extensions
shared_preload_libraries = 'pg_stat_statements'
pg_stat_statements.track = all
```

### 3.3 Initialization Scripts

**File:** `docker/postgres/init/01-create-databases.sql`

```sql
-- Create databases for local development
CREATE DATABASE twinmos_dev;
CREATE DATABASE plausible_dev;
CREATE DATABASE chatwoot_dev;

-- Enable extensions
\c twinmos_dev
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
```

---

## 4. Staging Environment Compose File

### 4.1 `docker-compose.staging.yml`

The staging compose file mirrors production sizing on a Hetzner CX32 instance.

```yaml
# =============================================================================
# TwinMOS Website — Staging Environment Docker Compose
# Purpose: UAT / pre-production environment on Hetzner CX32
# Deployed via: Coolify webhook or manual docker compose
# =============================================================================

version: "3.9"

services:
  postgres:
    image: postgres:16-alpine
    container_name: twinmos-postgres-staging
    restart: always
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "127.0.0.1:5432:5432"  # Bind to localhost only
    volumes:
      - postgres_staging_data:/var/lib/postgresql/data
      - ./backups:/backups
    command: >
      postgres
      -c shared_buffers=512MB
      -c effective_cache_size=1536MB
      -c max_connections=200
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - twinmos-staging
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M

  meilisearch:
    image: getmeili/meilisearch:v1.13
    container_name: twinmos-meilisearch-staging
    restart: always
    environment:
      MEILI_MASTER_KEY: ${MEILI_MASTER_KEY}
      MEILI_ENV: production
    ports:
      - "127.0.0.1:7700:7700"
    volumes:
      - meilisearch_staging_data:/meili_data
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:7700/health"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - twinmos-staging
    deploy:
      resources:
        limits:
          memory: 512M

  imgproxy:
    image: darthsim/imgproxy:v3
    container_name: twinmos-imgproxy-staging
    restart: always
    environment:
      IMGPROXY_KEY: ${IMGPROXY_KEY}
      IMGPROXY_SALT: ${IMGPROXY_SALT}
      IMGPROXY_BIND: ":8080"
      IMGPROXY_USE_ETAG: "true"
      IMGPROXY_TTL: 31536000
      IMGPROXY_AUTO_WEBP: "true"
      IMGPROXY_AUTO_AVIF: "true"
      IMGPROXY_S3_REGION: ${B2_REGION}
      IMGPROXY_S3_ENDPOINT: ${B2_ENDPOINT}
      IMGPROXY_S3_KEY: ${B2_KEY_ID}
      IMGPROXY_S3_SECRET: ${B2_APPLICATION_KEY}
    ports:
      - "127.0.0.1:8080:8080"
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:8080/health"]
      interval: 10s
      timeout: 5s
      retries: 3
    networks:
      - twinmos-staging
    deploy:
      resources:
        limits:
          memory: 256M

  redis:
    image: redis:7-alpine
    container_name: twinmos-redis-staging
    restart: always
    command: redis-server --appendonly yes --maxmemory 512mb --maxmemory-policy allkeys-lru
    ports:
      - "127.0.0.1:6379:6379"
    volumes:
      - redis_staging_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3
    networks:
      - twinmos-staging

  plausible:
    image: plausible/community-edition:v2.1
    container_name: twinmos-plausible-staging
    restart: always
    ports:
      - "127.0.0.1:8000:8000"
    environment:
      BASE_URL: ${PLAUSIBLE_BASE_URL}
      SECRET_KEY_BASE: ${PLAUSIBLE_SECRET_KEY}
      DATABASE_URL: postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/plausible_staging
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - twinmos-staging

volumes:
  postgres_staging_data:
  meilisearch_staging_data:
  redis_staging_data:

networks:
  twinmos-staging:
    driver: bridge
```

---

## 5. Production Services Reference

Production services are managed by Coolify v4, not by manual Docker Compose. The following table maps Coolify-managed services to their Docker equivalents:

| Service | Coolify Resource Type | Docker Image | CPU Limit | Memory Limit | Replicas |
|---------|----------------------|--------------|-----------|--------------|----------|
| Strapi | Application | Built from repo | 2 cores | 2 GB | 1 |
| PostgreSQL | Database | `postgres:16-alpine` | 1 core | 1 GB | 1 |
| MeiliSearch | Service | `getmeili/meilisearch:v1.13` | 1 core | 512 MB | 1 |
| ImgProxy | Service | `darthsim/imgproxy:v3` | 0.5 core | 256 MB | 1 |
| Redis (P2+) | Service | `redis:7-alpine` | 0.5 core | 256 MB | 1 |
| Plausible | Service | `plausible/community-edition:v2.1` | 0.5 core | 512 MB | 1 |
| Chatwoot (P2+) | Application | `chatwoot/chatwoot:v3` | 1 core | 1 GB | 1 |
| Medusa (P3) | Application | `medusajs/medusa:2.x` | 1 core | 1 GB | 1 |

See [TwinMOSWebsiteCoolifyConfigurationGuide.md](../H.3%20-%20Hosting%20and%20Infrastructure/TwinMOSWebsiteCoolifyConfigurationGuide.md) for full Coolify configuration.

---

## 6. Networking

### 6.1 Network Topology

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Bridge Network                      │
│                  twinmos-dev / twinmos-staging               │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Postgres │  │MeiliSearch│  │ ImgProxy │  │  Redis   │   │
│  │ :5432    │  │ :7700    │  │ :8080    │  │ :6379    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                              │
│  ┌──────────┐  ┌──────────┐                                 │
│  │ Plausible│  │ Chatwoot │                                 │
│  │ :8000    │  │ :3000    │                                 │
│  └──────────┘  └──────────┘                                 │
└─────────────────────────────────────────────────────────────┘
         │
    Host Network (localhost)
         │
  ┌──────────────┐
  │ Astro Dev    │  (runs outside Docker — pnpm dev)
  │ localhost:4321│
  └──────────────┘
         │
  ┌──────────────┐
  │ Strapi Dev   │  (runs outside Docker — pnpm develop)
  │ localhost:1337│
  └──────────────┘
```

### 6.2 Service Discovery

Services communicate via Docker DNS within the bridge network:

| From | To | Hostname | Port |
|------|----|----------|------|
| Strapi (host) | Postgres | `localhost` | 5432 |
| Strapi (host) | MeiliSearch | `localhost` | 7700 |
| Strapi (host) | ImgProxy | `localhost` | 8080 |
| Strapi (host) | Redis | `localhost` | 6379 |
| Plausible (container) | Postgres | `postgres` | 5432 |
| Chatwoot (container) | Postgres | `postgres` | 5432 |
| Chatwoot (container) | Redis | `redis` | 6379 |

---

## 7. Volumes & Persistence

### 7.1 Volume Mapping

| Volume | Service | Host Path (Dev) | Container Path | Purpose |
|--------|---------|-----------------|----------------|---------|
| `postgres_dev_data` | postgres | Docker-managed | `/var/lib/postgresql/data` | Database files |
| `meilisearch_dev_data` | meilisearch | Docker-managed | `/meili_data` | Search index |
| `redis_dev_data` | redis | Docker-managed | `/data` | Cache / session data |

### 7.2 Backup Strategy (Local)

```bash
# Backup all volumes to tar archives
docker run --rm \
  -v twinmos_postgres_dev_data:/source:ro \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/postgres-$(date +%Y%m%d-%H%M%S).tar.gz -C /source .

# Restore from backup
docker run --rm \
  -v twinmos_postgres_dev_data:/target \
  -v $(pwd)/backups:/backup:ro \
  alpine tar xzf /backup/postgres-YYYYMMDD-HHMMSS.tar.gz -C /target
```

---

## 8. Health Checks

All services include Docker health checks for automatic restart on failure:

| Service | Check Type | Interval | Timeout | Retries | Start Period |
|---------|-----------|----------|---------|---------|--------------|
| PostgreSQL | `pg_isready` | 10s | 5s | 5 | 30s |
| MeiliSearch | HTTP GET /health | 10s | 5s | 5 | 15s |
| ImgProxy | HTTP GET /health | 10s | 5s | 3 | 10s |
| Redis | `redis-cli ping` | 10s | 5s | 3 | 10s |
| Plausible | HTTP GET / | 30s | 10s | 3 | 60s |

---

## 9. Resource Limits

### 9.1 Development Workstation

No hard limits in development to maximize performance on varied hardware.

### 9.2 Staging Environment

| Service | Memory Limit | CPU Limit | Notes |
|---------|-------------|-----------|-------|
| PostgreSQL | 1 GB | 1 core | Shared buffers = 512 MB |
| MeiliSearch | 512 MB | 1 core | Sufficient for < 100K documents |
| ImgProxy | 256 MB | 0.5 core | Image processing is bursty |
| Redis | 512 MB | 0.5 core | AOF enabled |
| Plausible | 512 MB | 0.5 core | Low-traffic staging |

---

## 10. Security Hardening

### 10.1 Local Development

- No secrets in compose files — all via `.env`
- Services bind to `localhost` only (staging/production)
- No TLS in local dev (not needed)
- Default passwords must be changed for any shared environment

### 10.2 Staging/Production Hardening

```yaml
# Additional security options for staging/production
services:
  postgres:
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp:noexec,nosuid,size=100m
    user: "999:999"  # postgres UID/GID

  meilisearch:
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp:noexec,nosuid,size=50m
```

### 10.3 Secret Management

Never commit `.env` files. Use:
- **Local:** `.env.local` (gitignored)
- **Staging:** Coolify environment variables
- **Production:** Coolify secrets (encrypted at rest)

---

## 11. Environment Variable Injection

### 11.1 `.env` File Template

```bash
# ─── Database ───
POSTGRES_DB=twinmos_dev
POSTGRES_USER=twinmos
POSTGRES_PASSWORD=change_me_in_prod

# ─── MeiliSearch ───
MEILI_MASTER_KEY=change_me_in_prod

# ─── ImgProxy ───
IMGPROXY_KEY=change_me_in_prod
IMGPROXY_SALT=change_me_in_prod

# ─── Backblaze B2 ───
B2_REGION=us-west-002
B2_ENDPOINT=https://s3.us-west-002.backblazeb2.com
B2_KEY_ID=change_me
B2_APPLICATION_KEY=change_me

# ─── Plausible ───
PLAUSIBLE_BASE_URL=http://localhost:8000
PLAUSIBLE_SECRET_KEY=change_me_in_prod_32_chars_min

# ─── Chatwoot ───
CHATWOOT_SECRET_KEY=change_me_in_prod
```

---

## 12. Operational Commands

### 12.1 Daily Commands

```bash
# Start everything
docker compose -f docker-compose.dev.yml up -d

# Start with Phase 2 services
docker compose -f docker-compose.dev.yml --profile phase2 up -d

# View logs
docker compose -f docker-compose.dev.yml logs -f

# View specific service logs
docker compose -f docker-compose.dev.yml logs -f postgres

# Restart a service
docker compose -f docker-compose.dev.yml restart meilisearch

# Scale check
docker compose -f docker-compose.dev.yml ps
```

### 12.2 Maintenance Commands

```bash
# Clean up unused images and volumes
docker system prune -f
docker volume prune -f

# Export database
docker exec twinmos-postgres-dev pg_dump -U twinmos twinmos_dev > backup.sql

# Import database
docker exec -i twinmos-postgres-dev psql -U twinmos twinmos_dev < backup.sql

# Reset MeiliSearch index
docker exec twinmos-meilisearch-dev meilisearch-cli delete-index products
docker exec twinmos-meilisearch-dev meilisearch-cli create-index products
```

---

## Document Governance

| Role | Name | Sign-Off | Date |
|------|------|----------|------|
| IT/Technical Lead | (TBC) | _______________ | _________ |
| Unisoft Team Lead | (TBC) | _______________ | _________ |
| Unisoft Senior Developer | (TBC) | _______________ | _________ |

---

**Document Version:** 1.0
**Issued:** 2 May 2026
**Next Review:** Upon Sprint 0 close (Week 2)
**Canonical Location:** `H.1 - Local and Environment Setup/TwinMOSWebsiteDockerComposeSpec.md`
