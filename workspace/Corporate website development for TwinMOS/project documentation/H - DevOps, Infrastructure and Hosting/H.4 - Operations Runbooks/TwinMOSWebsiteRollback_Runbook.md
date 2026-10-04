# TwinMOS Website — Rollback Runbook

| | |
|:---|:---|
| **Reference** | H.4-002 |
| **Priority** | P0 |
| **Status** | [M] Must-have |
| **Author** | DevOps Lead |
| **Version** | 1.0 |
| **Date** | 2026-05-01 |
| **Review Cycle** | Per rollback event |

---

## 1. Purpose

This runbook provides step-by-step procedures for rolling back the TwinMOS website frontend and backend deployments when issues are detected.

---

## 2. Rollback Decision Matrix

| Scenario | Severity | Rollback? | Time Limit |
|:---|:---|:---|:---|
| 500 errors on homepage | Critical | Yes, immediate | < 5 min |
| API completely down | Critical | Yes, immediate | < 5 min |
| CSS/layout broken | High | Yes, after assessment | < 15 min |
| Performance degraded | Medium | Evaluate first | < 30 min |
| Minor visual bug | Low | No, fix forward | Next release |

---

## 3. Frontend Rollback (Cloudflare Pages)

### 3.1 Method 1: Re-deploy Previous Version

```bash
# Identify previous working version from GitHub releases
# Re-run CD workflow with previous tag (e.g., v1.4.1)
# GitHub Actions -> CD Frontend Production -> Run workflow
```

### 3.2 Method 2: Cloudflare Dashboard

1. Cloudflare Dashboard -> Pages -> twinmos-website-prod
2. Deployments tab -> Find previous successful deployment
3. Click "Rollback to this deployment"

### 3.3 Verification

- [ ] https://www.twinmos.com loads correctly
- [ ] No 500 errors in Sentry
- [ ] UptimeRobot shows green

**Rollback time**: < 2 minutes

---

## 4. Backend Rollback (Coolify)

### 4.1 Method 1: Coolify Auto-Rollback

Coolify automatically rolls back if health checks fail after deployment.

### 4.2 Method 2: Coolify Dashboard

1. Coolify dashboard -> strapi-backend -> Deployments
2. Select previous successful deployment
3. Click "Rollback"

### 4.3 Method 3: Manual Docker

```bash
ssh root@<hetzner-ip>
docker stop strapi-backend
docker run -d --name strapi-backend --network coolify -p 1337:1337 \
  --env-file /data/coolify/applications/<app-id>/.env \
  ghcr.io/twinmos/website/backend:v1.4.1
curl -f http://localhost:1337/api/health
```

**Rollback time**: < 5 minutes

---

## 5. Database Rollback

Only rollback if migration corrupted data and no forward-fix possible.

```bash
# 1. Stop application
docker stop strapi-backend

# 2. Download pre-migration backup
b2 file download twinmos-db-backups \
  "postgres/postgres_YYYYMMDD_020000.sql.gz.gpg" /tmp/restore.sql.gz.gpg

# 3. Decrypt and restore
gpg --decrypt --batch --passphrase "$BACKUP_ENCRYPTION_KEY" \
  --output /tmp/restore.sql.gz /tmp/restore.sql.gz.gpg
gunzip -c /tmp/restore.sql.gz | docker exec -i postgres-db psql -U strapi

# 4. Restart application
docker start strapi-backend
```

**Rollback time**: 15-30 minutes

---

## 6. Post-Rollback Actions

- [ ] Document reason in incident log
- [ ] Create GitHub issue for root cause
- [ ] Notify team in Slack
- [ ] Schedule post-incident review

---

## 7. Change Log

| Version | Date | Author | Changes |
|:---|:---|:---|:---|
| 1.0 | 2026-05-01 | DevOps Lead | Initial release |

---

## 8. Sign-off

| Role | Name | Date | Signature |
|:---|:---|:---|:---|
| DevOps Lead | | | |
| Tech Lead | | | |
| Project Manager | | | |
