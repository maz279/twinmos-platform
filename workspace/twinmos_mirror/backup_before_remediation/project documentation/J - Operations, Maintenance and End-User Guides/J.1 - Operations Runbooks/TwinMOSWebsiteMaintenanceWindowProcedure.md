# TwinMOS Website — Maintenance Window Procedure

**Document Reference:** TWN-OPS-2026-004  
**Version:** 1.0  
**Status:** FINAL  
**Date:** 1 May 2026  
**Prepared by:** TwinMOS Digital Transformation Team / Unisoft Engineering  
**Owner:** Unisoft Team Lead  
**Audience:** DevOps, System Administrators, TwinMOS IT Staff  
**Classification:** CONFIDENTIAL — Internal Use Only  
**Synchronized With:** BRD v3.0 §23.1, Tech Stack v1.1 §19.4, §20.5

---

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 1 May 2026 | TwinMOS Digital Transformation Team | Initial release |

---

## 1. Purpose

This document defines the standard operating procedure for planned maintenance windows on the TwinMOS corporate website production environment. It covers scheduling, stakeholder notification, pre-maintenance checklists, execution steps, and post-maintenance verification.

---

## 2. Maintenance Window Schedule

### 2.1 Standard Window

| Parameter | Value |
|-----------|-------|
| **Day** | Sunday (lowest traffic per analytics baseline) |
| **Time** | 02:00–06:00 GMT (06:00–10:00 GST) |
| **Duration** | Maximum 4 hours (BRD §23.1) |
| **Frequency** | Maximum 1 per month |
| **Notice Required** | 72 hours minimum for standard; 24 hours for emergency |

### 2.2 Window by Phase

| Phase | Maintenance Types | Typical Frequency |
|-------|-------------------|-------------------|
| Phase 1 (Months 1–5) | Security patches, dependency updates, Strapi minor upgrades | Bi-weekly during build; monthly post-launch |
| Phase 2 (Months 6–9) | Localization deploys, partner portal updates, Chatwoot patches | Monthly |
| Phase 3 (Months 10–15) | E-commerce updates, Medusa patches, payment gateway updates | Monthly |
| Post-Engagement | Security patches, critical updates only | Monthly |

---

## 3. Maintenance Types

### 3.1 Type A — Standard (Planned)

- Dependency updates (patch/minor)
- Strapi plugin updates
- Content model changes (non-breaking)
- CMS configuration updates
- SSL certificate renewal
- Backup verification

### 3.2 Type B — Major (Requires Extended Window)

- Strapi major version upgrades
- Astro major version upgrades
- Database schema migrations (manual SQL)
- Infrastructure resizing (CX32 → CX42)
- CDN configuration changes
- DNS changes

### 3.3 Type C — Emergency (Unscheduled)

- Security patch (CVE with exploit in wild)
- Zero-day vulnerability mitigation
- Critical dependency fix
- Data corruption recovery
- DDoS mitigation rule updates

---

## 4. Pre-Maintenance Checklist

### 4.1 72 Hours Before (Standard) / 24 Hours Before (Emergency)

- [ ] Maintenance window scheduled in shared calendar
- [ ] Stakeholders notified (Slack #ops + email to TwinMOS IT Lead, Marketing Director)
- [ ] Maintenance type and scope documented in change request
- [ ] Rollback plan prepared and tested on staging
- [ ] Backup completed and verified (PostgreSQL pg_dump + Strapi uploads)
- [ ] Staging environment updated and tested with same changes
- [ ] CI/CD pipeline paused (if applicable)

### 4.2 1 Hour Before

- [ ] Confirm low traffic period (check Plausible analytics)
- [ ] Verify backup is accessible and restorable
- [ ] Ensure on-call engineer is available and aware
- [ ] Prepare maintenance banner/status page message (if user-visible downtime expected)
- [ ] Open Slack #ops thread for real-time updates
- [ ] Confirm all required credentials and access are available

---

## 5. Maintenance Execution

### 5.1 Pre-Maintenance (T-5 min)

```bash
# 1. Set maintenance mode (if applicable)
# Cloudflare Workers route to maintenance page

# 2. Verify backup
coolify backup:verify --project=twinmos-prod

# 3. Notify team
slack post --channel=#ops "Maintenance starting in 5 minutes: [description]"
```

### 5.2 Service-Specific Procedures

#### Strapi Update

```bash
# 1. Stop Strapi container
coolify stop --service=strapi --project=twinmos-prod

# 2. Update image/tag
coolify update --service=strapi --tag=[new-version]

# 3. Start and verify
coolify start --service=strapi --project=twinmos-prod
# Check logs for migration success
coolify logs --service=strapi --tail=100

# 4. Verify admin loads and key API endpoints respond
curl https://api.twinmos.com/api/v1/products?pagination[pageSize]=1
```

#### PostgreSQL Maintenance

```bash
# 1. Create fresh backup before any DB work
pg_dump -h [host] -U [user] -d [db] > /backups/pre-maintenance-$(date +%Y%m%d-%H%M).sql

# 2. Apply migrations (if manual SQL)
psql -h [host] -U [user] -d [db] -f migration.sql

# 3. Verify schema
du -sh /var/lib/postgresql/data
# Check for errors in PostgreSQL logs
```

#### Astro Frontend Deploy

```bash
# 1. Build on CI
# GitHub Actions builds and deploys to Cloudflare Pages

# 2. Verify preview deploy
# Check PR preview URL for build success

# 3. Merge to main (triggers production deploy)
# Cloudflare Pages deploys automatically

# 4. Verify production
curl -I https://twinmos.com/
# Check Cloudflare Pages dashboard for deploy status
```

#### MeiliSearch Re-index

```bash
# 1. Stop MeiliSearch
coolify stop --service=meilisearch

# 2. Update if needed
coolify update --service=meilisearch --tag=[new-version]

# 3. Start
coolify start --service=meilisearch

# 4. Trigger re-index from Strapi admin
# Or via API: POST /api/v1/search/reindex
```

#### ImgProxy Update

```bash
# 1. Stop ImgProxy
coolify stop --service=imgproxy

# 2. Update
coolify update --service=imgproxy --tag=[new-version]

# 3. Start and test
coolify start --service=imgproxy
curl https://imgproxy.twinmos.com/health
```

### 5.3 Post-Maintenance Verification

- [ ] All services show "healthy" in Coolify dashboard
- [ ] UptimeRobot checks pass (all monitors green)
- [ ] Sentry shows no new errors in last 5 minutes
- [ ] Key user journeys tested (homepage, product page, contact form, search)
- [ ] CMS admin accessible and functional
- [ ] API endpoints respond correctly
- [ ] Images load correctly (ImgProxy + B2)
- [ ] Analytics tracking functional (Plausible, GA4 if applicable)

### 5.4 Rollback Procedure (If Maintenance Fails)

```bash
# 1. Stop failed service
coolify stop --service=[service] --project=twinmos-prod

# 2. Rollback to previous image
coolify rollback --service=[service] --project=twinmos-prod

# 3. For database: restore from pre-maintenance backup
psql -h [host] -U [user] -d [db] < /backups/pre-maintenance-[timestamp].sql

# 4. Verify rollback success
# Run full smoke test suite

# 5. Document rollback reason and reschedule maintenance
```

---

## 6. Communication Templates

### 6.1 Maintenance Announcement (72h Before)

```
Subject: [SCHEDULED] TwinMOS Website Maintenance — [DATE] 02:00–06:00 GMT

Dear Team,

A scheduled maintenance window is planned for the TwinMOS website:

Date: [DAY], [DATE]
Time: 02:00–06:00 GMT (06:00–10:00 GST)
Duration: Up to 4 hours
Impact: Brief periods of reduced availability
Services: [List affected services]

What we're doing:
[Description of maintenance]

What to expect:
- The website may be intermittently unavailable
- No data will be lost
- All services will be verified before completion

Contact:
For urgent issues during maintenance, contact [On-call engineer] via Slack #ops.

Thank you for your patience.
```

### 6.2 Maintenance Start Notification

```
:tools: MAINTENANCE STARTED
Window: [DATE] 02:00–06:00 GMT
Scope: [Description]
On-call: @username
Status thread: [Link to Slack thread]
```

### 6.3 Maintenance Complete Notification

```
:white_check_mark: MAINTENANCE COMPLETED
Duration: [X] minutes
Services: All healthy
Verification: [Smoke test / Lighthouse / UptimeRobot] — PASSED
Any issues: [None / See thread for details]
```

### 6.4 Emergency Maintenance Notification

```
:rotating_light: EMERGENCY MAINTENANCE
Reason: [Security patch / Critical fix]
Started: [TIME]
ETA: [TIME]
Impact: [Brief description]
We apologize for the short notice. This maintenance is required to address [reason].
```

---

## 7. Post-Maintenance Documentation

Within 24 hours of maintenance completion, the on-call engineer must update:

1. **Change Log:** What was changed, why, and by whom
2. **Verification Results:** Smoke test outcomes, performance metrics
3. **Issues Encountered:** Any problems and how they were resolved
4. **Lessons Learned:** Improvements for future maintenance windows
5. **Runbook Updates:** If procedures need refinement

---

## 8. Document Sign-Off

| Role | Name | Sign-Off | Date |
|------|------|----------|------|
| Project Sponsor (Chairman) | Mohd Mazharul Islam | _______________ | _________ |
| Operational Sponsor (GM Dubai) | Robiul Islam | _______________ | _________ |
| IT/Technical Lead | (TBC) | _______________ | _________ |
| Unisoft Team Lead | (TBC) | _______________ | _________ |

---

**Document Version:** 1.0  
**Issued:** 1 May 2026  
**Next Review:** Upon Phase 1 launch (Month 5) and quarterly thereafter  
**Canonical Location:** `J - Operations, Maintenance and End-User Guides/J.1 - Operations Runbooks/TwinMOSWebsiteMaintenanceWindowProcedure.md`
