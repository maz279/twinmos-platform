# TwinMOS Website — Deployment Runbook

| | |
|:---|:---|
| **Reference** | H.4-001 |
| **Priority** | P0 |
| **Status** | [M] Must-have |
| **Author** | DevOps Lead |
| **Version** | 1.0 |
| **Date** | 2026-05-01 |
| **Review Cycle** | Per deployment |

---

## 1. Purpose

This runbook provides step-by-step procedures for deploying the TwinMOS website to staging and production environments.

---

## 2. Prerequisites

- [ ] All CI checks passing on `main` branch
- [ ] Release version determined (SemVer)
- [ ] CHANGELOG.md updated
- [ ] Database migration reviewed (if applicable)
- [ ] Rollback plan confirmed
- [ ] Deployment window confirmed (Tue-Thu, 08:00-12:00 UTC)

---

## 3. Standard Deployment (Automated)

### 3.1 Trigger Release Workflow

1. Navigate to GitHub -> Actions -> Release
2. Click "Run workflow"
3. Select version bump: `patch` | `minor` | `major`
4. Click "Run workflow"

### 3.2 Monitor Deployment

```
Release workflow starts
    |
    v
Version bumped -> Git tag created
    |
    v
CD Frontend Production triggered
    |
    v
CD Backend Production triggered
    |
    v
Both complete -> Verify health checks
```

### 3.3 Verification Checklist

- [ ] Frontend: https://www.twinmos.com loads correctly
- [ ] Backend: https://api.twinmos.com/health returns 200
- [ ] Sentry: No new errors (5 min window)
- [ ] UptimeRobot: All monitors green
- [ ] Lighthouse: Scores within threshold

---

## 4. Manual Deployment (Emergency)

### 4.1 Frontend Manual Deploy

```bash
# 1. Checkout release tag
git checkout v1.4.2

# 2. Build
pnpm --filter frontend build

# 3. Deploy to Cloudflare Pages
npx wrangler pages deploy apps/frontend/dist \
  --project-name=twinmos-website-prod \
  --branch=main

# 4. Purge cache
curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/purge_cache" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

### 4.2 Backend Manual Deploy

```bash
# 1. Build Docker image
docker build -t ghcr.io/twinmos/website/backend:v1.4.2 -f docker/backend.Dockerfile .

# 2. Push to GHCR
docker push ghcr.io/twinmos/website/backend:v1.4.2

# 3. Trigger Coolify deployment
curl -X POST "$COOLIFY_WEBHOOK_PRODUCTION" \
  -H "Authorization: Bearer $COOLIFY_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"docker_image": "ghcr.io/twinmos/website/backend:v1.4.2"}'

# 4. Verify health
for i in {1..30}; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://api.twinmos.com/health)
  [ "$STATUS" = "200" ] && echo "Health OK" && exit 0
  sleep 10
done
echo "Health check failed"
```

---

## 5. Database Migration Deployment

### 5.1 Pre-Migration

```bash
# 1. Create backup BEFORE migration
/opt/backup/postgres-backup.sh

# 2. Verify backup uploaded to B2
b2 ls twinmos-db-backups postgres/ | tail -3
```

### 5.2 Migration Execution

```bash
# 1. Deploy backend with new migration
# (Follow standard backend deployment)

# 2. Run migration
docker exec strapi-backend pnpm strapi db:migrate

# 3. Verify migration applied
docker exec postgres-db psql -U strapi -c "\dt"
```

### 5.3 Post-Migration

- [ ] Verify application functionality
- [ ] Check for migration errors in logs
- [ ] Monitor for 30 minutes
- [ ] If failure: execute rollback plan

---

## 6. Post-Deployment

### 6.1 Verification (15 minutes)

| Check | Method | Expected |
|:---|:---|:---|
| Homepage | Browser | Loads, all sections visible |
| API health | curl | HTTP 200, JSON response |
| Admin panel | Browser | Login works |
| Search | Browser | Returns results |
| Mobile | Browser DevTools | Responsive layout |
| Arabic RTL | Browser | Layout correct |

### 6.2 Monitoring Window (30 minutes)

- Sentry: Watch for new errors
- Cloudflare Analytics: Check traffic patterns
- Coolify: Monitor resource usage
- UptimeRobot: Verify all green

### 6.3 Communication

| Channel | Message |
|:---|:---|
| Slack #deployments | "Production deploy v1.4.2 complete. All checks passed." |
| Email (if incident) | Tech Lead + PM notified |

---

## 7. Rollback Trigger

If any critical check fails:

1. **STOP** - Do not proceed with verification
2. **ASSESS** - Determine scope of failure
3. **ROLLBACK** - Follow H.4-002 Rollback Runbook
4. **COMMUNICATE** - Notify team in Slack

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
