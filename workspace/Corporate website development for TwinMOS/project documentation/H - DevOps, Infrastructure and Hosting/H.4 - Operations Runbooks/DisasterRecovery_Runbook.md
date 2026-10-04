# TwinMOS Website — Disaster Recovery Runbook

| | |
|:---|:---|
| **Reference** | H.4-007 |
| **Priority** | P1 |
| **Status** | [M] Must-have |
| **Author** | DevOps Lead |
| **Version** | 1.0 |
| **Date** | 2026-05-01 |
| **Review Cycle** | Quarterly drill |

---

## 1. Purpose

This runbook defines the disaster recovery procedures for the TwinMOS website, ensuring business continuity in the event of catastrophic failure.

---

## 2. Recovery Objectives

| Objective | Target | Measurement |
|:---|:---|:---|
| **RTO** (Recovery Time Objective) | <= 4 hours | Time from disaster to full service |
| **RPO** (Recovery Point Objective) | <= 15 minutes | Maximum data loss acceptable |

---

## 3. Disaster Scenarios

| Scenario | Impact | Recovery Method | RTO |
|:---|:---|:---|:---|
| **Frontend failure** | Site inaccessible | Rollback Cloudflare Pages | < 2 min |
| **Backend failure** | API down | Rollback Coolify container | < 5 min |
| **Database corruption** | Data loss | Restore from B2 backup | < 30 min |
| **Hetzner datacenter outage** | Complete backend down | Rebuild on new instance | < 4 hours |
| **Cloudflare outage** | CDN/WAF down | DNS failover to origin (P3) | < 15 min |
| **Backblaze B2 outage** | Media unavailable | Serve from origin cache | < 5 min |
| **Complete infrastructure loss** | Everything down | Full rebuild from backups | < 4 hours |

---

## 4. Full Infrastructure Rebuild

### 4.1 Step 1: Provision New Server

```bash
# Create new Hetzner server
hcloud server create --name twinmos-backend-dr \
  --type cx32 --image ubuntu-24.04 --location nuremberg

# Get IP
NEW_IP=$(hcloud server ip twinmos-backend-dr)
```

### 4.2 Step 2: Install Base Software

```bash
ssh root@$NEW_IP

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh

# Install B2 CLI
pip install b2

# Authenticate with B2
b2 account authorize $B2_KEY_ID $B2_APPLICATION_KEY
```

### 4.3 Step 3: Restore Database

```bash
# Download latest backup
LATEST=$(b2 ls twinmos-db-backups postgres/ | tail -1)
b2 file download twinmos-db-backups "$LATEST" /tmp/restore.dump.gz.gpg

# Decrypt
gpg --decrypt --batch --passphrase "$BACKUP_ENCRYPTION_KEY" \
    --output /tmp/restore.dump.gz /tmp/restore.dump.gz.gpg
gunzip -c /tmp/restore.dump.gz > /tmp/restore.dump

# Start PostgreSQL container
docker run -d --name postgres-db \
  -e POSTGRES_DB=strapi \
  -e POSTGRES_USER=strapi \
  -e POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
  -v postgres_data:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:16-alpine

# Restore
docker exec -i postgres-db pg_restore -U strapi -d strapi --no-owner < /tmp/restore.dump
```

### 4.4 Step 4: Start Application Stack

```bash
# Install Coolify
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash

# Configure Coolify with restored database
# Deploy Strapi, MeiliSearch, Redis, ImgProxy
# See H.3-003 Coolify Hosting Guide
```

### 4.5 Step 5: Update DNS

```bash
# Update api.twinmos.com to new IP
# Cloudflare Dashboard -> DNS -> Update A record
```

### 4.6 Step 6: Verify

```bash
# Health check
curl -f https://api.twinmos.com/health

# Frontend check
curl -f https://www.twinmos.com

# Sentry check - no critical errors
```

---

## 5. Partial Recovery Procedures

### 5.1 Frontend Only Recovery

```bash
# Re-deploy from GitHub Actions
# Or manual deploy with wrangler
npx wrangler pages deploy apps/frontend/dist \
  --project-name=twinmos-website-prod
```

### 5.2 Backend Only Recovery

```bash
# Restore Coolify from configuration backup
# Or re-deploy from GHCR image
docker pull ghcr.io/twinmos/website/backend:latest
docker compose up -d
```

### 5.3 Database Only Recovery

See H.4-003 Database Backup & Restore Runbook.

---

## 6. DR Testing

| Test Type | Frequency | Scope |
|:---|:---|:---|
| **Tabletop exercise** | Quarterly | Walk through procedures |
| **Backup restore test** | Monthly | Restore to staging environment |
| **Full DR drill** | Bi-annually | Complete infrastructure rebuild |
| **Failover test** | Quarterly | Test CDN failover |

---

## 7. DR Checklist

- [ ] Backups verified weekly
- [ ] Backup encryption keys accessible (1Password)
- [ ] B2 credentials current
- [ ] DNS records documented
- [ ] Server provisioning automated
- [ ] Configuration in version control
- [ ] Contact list current
- [ ] DR runbook reviewed quarterly

---

## 8. Change Log

| Version | Date | Author | Changes |
|:---|:---|:---|:---|
| 1.0 | 2026-05-01 | DevOps Lead | Initial release |

---

## 9. Sign-off

| Role | Name | Date | Signature |
|:---|:---|:---|:---|
| DevOps Lead | | | |
| Tech Lead | | | |
| Project Manager | | | |
