# TwinMOS Corporate Website — Maintenance Handover Document

**Document Reference:** TWN-Q-MAINTENANCE-2026-001  
**Version:** 1.0  
**Date:** October 2027  
**Prepared by:** Unisoft Solutions Ltd. — Team Lead  
**Approved by:** TwinMOS IT Lead  
**Classification:** CONFIDENTIAL — Internal Use Only — Contains Sensitive Infrastructure Information  
**Distribution:** TwinMOS IT Lead, TwinMOS PM, Designated TwinMOS System Administrator  
**Parent Documents:** TWN-Q-SRCCODE-2026-001, J.1 Operations Runbooks, H.1–H.5 DevOps documentation  

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | September 2027 | Unisoft Team Lead | Initial draft |
| 1.0 | October 2027 | Unisoft Team Lead (reviewed by TwinMOS IT Lead) | Final — ready for handover |

---

## ⚠️ Security Notice

This document contains infrastructure topology information, service architecture details, and references to credential storage locations. It must be:
- Stored in an access-controlled system (not shared publicly or emailed unencrypted)
- Accessible only to TwinMOS IT Lead, designated System Administrator, and Phase 4 vendor (if retained)
- Reviewed and updated whenever infrastructure changes occur

**All credentials and passwords referenced herein are stored in TwinMOS's secure credential management system. This document contains architecture references, NOT the actual credential values.**

---

## 1. System Architecture Overview

### 1.1 Infrastructure Map

```
                    ┌─────────────────────────────┐
                    │   Users (twinmos.com)        │
                    └──────────┬──────────────────┘
                               │ HTTPS (TLS 1.3)
                    ┌──────────▼──────────────────┐
                    │   Cloudflare CDN + WAF       │
                    │   (DDoS protection, CDN,     │
                    │    WAF rules, Pages host)    │
                    └──────────┬──────────────────┘
              ┌────────────────┼────────────────┐
              │                │                │
    ┌─────────▼──────┐  ┌─────▼──────┐  ┌─────▼──────────┐
    │ Cloudflare     │  │ Hetzner    │  │ Backblaze B2   │
    │ Pages          │  │ VPS        │  │ (Media + DB    │
    │ (Astro static  │  │ (Backend   │  │  backups)      │
    │  frontend)     │  │  services) │  └────────────────┘
    └────────────────┘  └─────┬──────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
    ┌─────────▼──────┐  ┌─────▼──────┐  ┌─────▼──────────┐
    │ Strapi v5 CMS  │  │ PostgreSQL │  │ MeiliSearch    │
    │ (Port 1337)    │  │ 16         │  │ (Port 7700)    │
    │ [Coolify]      │  │ [Coolify]  │  │ [Coolify]      │
    └─────────┬──────┘  └────────────┘  └────────────────┘
              │
    ┌─────────┴──────────────────────────────┐
    │ Additional services on Hetzner VPS:    │
    │ • Chatwoot (live chat, Port 3000)      │
    │ • PostHog OSS (analytics, Port 8000)  │
    │ • Plausible (analytics, Port 8080)    │
    │ • ImgProxy (image transform, Port 8181)│
    │ • Coolify (management UI, Port 3001)  │
    │ • Nginx (reverse proxy, Port 80/443)  │
    └────────────────────────────────────────┘
```

### 1.2 Technology Stack Summary

| Layer | Technology | Version | Hosting |
|-------|-----------|---------|---------|
| Frontend | Astro 5 + React 19 | 5.x | Cloudflare Pages |
| CMS | Strapi v5 | 5.x | Hetzner VPS (Coolify) |
| Database | PostgreSQL | 16 | Hetzner VPS (Coolify) |
| Search | MeiliSearch | 1.x | Hetzner VPS (Coolify) |
| E-Commerce | Medusa.js + Stripe | 2.x | Hetzner VPS (Coolify) |
| Auth | Better Auth | Latest stable | Embedded in Strapi |
| Live Chat | Chatwoot | Latest stable | Hetzner VPS (Coolify) |
| Analytics | PostHog OSS + Plausible | Latest | Hetzner VPS (Coolify) |
| Image Proxy | ImgProxy | Latest | Hetzner VPS (Coolify) |
| Object Storage | Backblaze B2 | N/A | Backblaze Cloud |
| CDN + WAF | Cloudflare | N/A | Cloudflare Cloud |
| Container Orchestration | Coolify v4 | 4.x | Hetzner VPS |
| Reverse Proxy | Nginx | Latest stable | Hetzner VPS |
| Email | Resend | N/A | Resend Cloud |
| Error Monitoring | Sentry | N/A | Sentry Cloud |
| Uptime Monitoring | UptimeRobot | N/A | UptimeRobot Cloud |

---

## 2. Access Credentials and Accounts

> **All credentials are stored in TwinMOS's designated password manager.** This section documents WHERE credentials exist, not their values.

### 2.1 Service Account Access Map

| Service | Admin Account | Credential Location | Emergency Contact |
|---------|--------------|---------------------|------------------|
| **Cloudflare** (domain + CDN + Pages + WAF) | it@twinmos.com | TwinMOS Password Manager | Cloudflare Support |
| **Hetzner Cloud** (VPS) | it@twinmos.com | TwinMOS Password Manager | Hetzner Support |
| **Coolify** (container management UI) | TwinMOS admin account | Coolify admin panel on Hetzner (URL per Coolify deployment) | N/A — self-hosted |
| **Strapi Admin** (CMS) | cms-admin@twinmos.com | TwinMOS Password Manager | N/A — self-hosted |
| **PostgreSQL** (database) | `twinmos_admin` user | TwinMOS Password Manager (database credentials) | N/A — self-hosted |
| **MeiliSearch** | Master Key | TwinMOS Password Manager | N/A — self-hosted |
| **Backblaze B2** (storage) | it@twinmos.com | TwinMOS Password Manager | Backblaze Support |
| **Resend** (email) | it@twinmos.com | TwinMOS Password Manager | Resend Support |
| **Sentry** (errors) | it@twinmos.com | TwinMOS Password Manager | Sentry Support |
| **UptimeRobot** (uptime) | it@twinmos.com | TwinMOS Password Manager | UptimeRobot Support |
| **GitHub** (source code) | TwinMOS GitHub org admin | TwinMOS Password Manager (GitHub PAT) | GitHub Support |
| **Stripe** (payments) | finance@twinmos.com | TwinMOS Finance system | Stripe Support |
| **PostHog OSS** (analytics) | it@twinmos.com | Coolify + TwinMOS Password Manager | N/A — self-hosted |
| **Chatwoot** (live chat) | it@twinmos.com | Coolify + TwinMOS Password Manager | N/A — self-hosted |

### 2.2 Emergency SSH Access

| Target | Access Method | Notes |
|--------|-------------|-------|
| Hetzner VPS (Strapi, PostgreSQL, MeiliSearch, etc.) | SSH key-based authentication | SSH private key in TwinMOS Password Manager; public key registered in Hetzner account |
| Coolify UI | HTTPS via Hetzner VPS domain | Available at `https://[coolify-domain]` — credentials in Hetzner admin |

---

## 3. Routine Maintenance Schedule

### 3.1 Daily Tasks (Automated)

| Task | Automation | Alert Destination |
|------|-----------|------------------|
| Uptime check (every 5 minutes) | UptimeRobot | it@twinmos.com + Slack (if configured) |
| Sentry error rate monitoring | Sentry | it@twinmos.com (threshold alerts) |
| Cloudflare security events review | Cloudflare dashboard | it@twinmos.com (anomaly alerts) |
| PostgreSQL automated backup | Coolify scheduled job + `scripts/backup.sh` | Backup to Backblaze B2 `twinmos-db-backups/` |
| Strapi media backup | Coolify scheduled job | Backup to Backblaze B2 `twinmos-media-backups/` |

### 3.2 Weekly Tasks (Manual or Semi-Automated)

| Task | Responsible | Instructions | Effort |
|------|------------|-------------|--------|
| Sentry error review | TwinMOS IT Lead | Log into Sentry; review unresolved issues in the past 7 days; assign or dismiss | 30 min |
| Cloudflare analytics review | TwinMOS IT Lead | Review WAF event counts; flag unusual traffic patterns | 15 min |
| PostHog/Plausible traffic review | Marketing | Check weekly traffic metrics in PostHog dashboard | 30 min |
| Backup verification | TwinMOS IT Lead | Confirm latest daily backup exists in Backblaze B2; check file size is within expected range | 10 min |
| Dependabot PR review | TwinMOS IT Lead | Review and merge/reject Dependabot pull requests in GitHub | 30 min |

### 3.3 Monthly Tasks

| Task | Responsible | Instructions | Effort |
|------|------------|-------------|--------|
| Lighthouse CI performance audit | TwinMOS IT Lead | Trigger manual Lighthouse CI run via GitHub Actions; review scores; address any regressions > 5 points | 1 hour |
| OWASP ZAP security scan | TwinMOS IT Lead | Trigger ZAP baseline scan from CI or run locally per Security Architecture doc; review results | 2 hours |
| PostgreSQL maintenance | TwinMOS IT Lead | Run `VACUUM ANALYZE` on the PostgreSQL database via Coolify or SSH; review `pg_stat_user_tables` for bloat | 30 min |
| MeiliSearch index health check | TwinMOS IT Lead | Verify index document counts match Strapi counts; trigger re-index if counts diverge | 30 min |
| Hetzner VPS OS patch | TwinMOS IT Lead | Via Coolify or SSH: `sudo apt update && sudo apt upgrade -y`; restart services via Coolify | 1 hour |
| Cloudflare SSL certificate check | TwinMOS IT Lead | Verify TLS cert auto-renew (Cloudflare manages this automatically; verify in Cloudflare dashboard) | 5 min |
| Email deliverability check | TwinMOS IT Lead | Check Resend dashboard for bounce rates and delivery rates; flag if bounce rate > 2% | 15 min |
| Review active CMS user accounts | TwinMOS IT Lead | Review active Strapi user accounts; deactivate any accounts for departed staff | 15 min |

### 3.4 Quarterly Tasks

| Task | Responsible | Instructions | Effort |
|------|------------|-------------|--------|
| Full DR drill | TwinMOS IT Lead | Restore latest backup to a test environment; verify all services start; confirm twinmos.com serves from test environment before switching back | 4–6 hours |
| Dependency major version review | TwinMOS IT Lead (or Phase 4 vendor) | Review all major dependencies for available major version updates; plan upgrade sprints | 2 hours |
| SSL/TLS configuration review | TwinMOS IT Lead | Verify TLS 1.3 enforcement; check HSTS header; review Cloudflare SSL settings | 1 hour |
| Storage costs review | TwinMOS Finance | Review Hetzner + Backblaze B2 monthly costs vs. budget | 15 min |
| Access credential rotation | TwinMOS IT Lead | Rotate: PostgreSQL admin password, Strapi JWT secret, MeiliSearch Master Key, Backblaze Application Key, GitHub Personal Access Token | 2 hours |

### 3.5 Annual Tasks

| Task | Responsible | Instructions | Effort |
|------|------------|-------------|--------|
| Third-party penetration test | TwinMOS IT Lead | Engage external security vendor; schedule pen test; review findings; execute remediation | 2–3 weeks |
| WCAG accessibility audit | TwinMOS IT Lead (or Phase 4 vendor) | Full axe-core automated scan + manual NVDA/VoiceOver test on top 30 pages; update accessibility statement | 1–2 weeks |
| Data retention compliance audit | TwinMOS Legal | Review data in Strapi against data retention policy; delete/anonymize data past retention period per jurisdiction | 1 week |
| Cookie consent compliance review | TwinMOS Legal | Audit all cookies vs. cookie declaration; update cookie policy if new cookies added; verify consent signal | 1 week |
| Disaster Recovery plan review | TwinMOS IT Lead | Review and update DR plan; re-validate RTO and RPO; update emergency contacts | 1 day |

---

## 4. Deployment Procedures

### 4.1 Frontend Deployment (Astro → Cloudflare Pages)

Deployments are **fully automated via GitHub Actions CI/CD**.

```
1. Developer pushes code to `main` branch (or merges a PR to `main`)
2. GitHub Actions workflow `.github/workflows/deploy-frontend.yml` triggers:
   a. Lint (ESLint)
   b. TypeScript type check (tsc --noEmit)
   c. Unit tests (Vitest)
   d. Build (astro build)
   e. Lighthouse CI (lhci autorun — must score >= 90)
   f. Deploy to Cloudflare Pages (wrangler deploy)
3. Cloudflare Pages serves the new build globally within ~30 seconds
4. Sentry release created for the new deployment
```

**Manual deployment (emergency):**
```bash
cd twinmos-website-frontend
pnpm install
pnpm build
# Then deploy via Cloudflare Pages dashboard (manual upload) or:
npx wrangler pages deploy ./dist --project-name=twinmos-website
```

### 4.2 CMS Deployment (Strapi → Hetzner VPS via Coolify)

```
1. Developer pushes to `main` branch of `twinmos-website-cms` repo
2. GitHub Actions workflow `.github/workflows/deploy-cms.yml` triggers:
   a. Lint
   b. Unit tests
   c. Security scan (npm audit + Snyk)
   d. Build Docker image
   e. Push to Hetzner container registry
   f. Coolify webhook triggers new container deployment
3. Coolify performs rolling deployment (zero-downtime for Strapi)
4. Health check endpoint verified before traffic is switched to new container
```

**Manual deployment (emergency):**
```bash
# SSH into Hetzner VPS
ssh twinmos-admin@[HETZNER_VPS_IP]
# Pull latest image
docker pull [registry]/twinmos-cms:latest
# Restart Strapi via Coolify API or:
docker compose -f /coolify/apps/twinmos-cms/docker-compose.yml up -d
```

### 4.3 Database Migrations

Database migrations run **automatically** when Strapi starts a new deployment. Migration files are in `twinmos-website-cms/database/migrations/`.

**Before a deployment that includes database migrations:**
1. Take a manual database snapshot: `./scripts/backup.sh manual-pre-migration`
2. Verify snapshot in Backblaze B2
3. Proceed with deployment
4. Monitor Strapi startup logs for migration success

**Rolling back a migration:**
- PostgreSQL migration rollback via `psql` and the rollback SQL in the migration file
- If rollback is needed: SSH to VPS, restore from pre-migration snapshot, redeploy previous Strapi version

### 4.4 Rollback Procedure

**Frontend rollback (Cloudflare Pages):**
1. Log into Cloudflare Dashboard → Pages → `twinmos-website`
2. Select the previous successful deployment
3. Click "Rollback to this deployment"
4. Rollback is live within 30 seconds

**CMS rollback:**
1. In Coolify UI, navigate to the `twinmos-cms` app
2. Select the previous healthy deployment version
3. Click "Redeploy previous version"
4. If database migration was included, also restore the database from backup

---

## 5. Monitoring and Alerting Reference

### 5.1 Alert Destinations and Escalation

| Alert Type | Source | Primary Recipient | Escalation |
|------------|--------|------------------|------------|
| P1 error spike | Sentry | it@twinmos.com | Escalate to Phase 4 vendor within 30 min |
| Lighthouse score regression | GitHub Actions CI | it@twinmos.com | Flag to TwinMOS IT Lead for investigation |
| Disk usage > 80% | Coolify / Hetzner | it@twinmos.com | Expand Hetzner VPS storage plan |
| Backup failure | Coolify job failure | it@twinmos.com | Immediately investigate; do not deploy until backup is healthy |
| Security incident (WAF spike) | Cloudflare | it@twinmos.com | Engage Phase 4 vendor or emergency security vendor |

### 5.2 Key Dashboard URLs

| Dashboard | URL | Access |
|-----------|-----|--------|
| Cloudflare (CDN + WAF + Pages) | cloudflare.com — TwinMOS account | it@twinmos.com login |
| Sentry (error monitoring) | sentry.io — TwinMOS org | it@twinmos.com login |
| UptimeRobot (uptime) | uptimerobot.com — TwinMOS account | it@twinmos.com login |
| PostHog (analytics) | `https://[hetzner-vps-domain]/posthog` | TwinMOS PostHog admin login |
| Plausible (simple analytics) | `https://[hetzner-vps-domain]/plausible` | TwinMOS Plausible admin login |
| Strapi Admin (CMS) | `https://cms.twinmos.com/admin` | cms-admin@twinmos.com login |
| Coolify (infrastructure) | `https://[coolify-domain]` | TwinMOS Coolify admin login |
| Hetzner Cloud Console | console.hetzner.cloud | it@twinmos.com login |
| Backblaze B2 | backblaze.com | it@twinmos.com login |
| Resend (email) | resend.com | it@twinmos.com login |
| Stripe (payments) | dashboard.stripe.com | finance@twinmos.com login |
| GitHub (source code) | github.com/twinmos-technologies | TwinMOS GitHub org admin |

---

## 6. Content Management (CMS Operations)

### 6.1 CMS Access Levels

| Role | Permissions | Typical Users |
|------|------------|---------------|
| **Admin** | Full access — user management, content types, all content | TwinMOS IT Lead |
| **Editor** | Create, edit, publish, delete all content | Marketing Director, Senior Marketing |
| **Author** | Create and edit own content; cannot publish | Marketing Staff, Regional Editors |
| **Viewer** | Read-only access to CMS admin | External reviewers, Legal counsel |

### 6.2 Content Publishing Workflow

```
Author creates/edits content (Draft state)
    ↓
Editor reviews and approves (Review state)
    ↓
Editor publishes to production (Published state)
    ↓
Astro frontend rebuilds affected static pages via Cloudflare Pages webhook
    ↓
Updated content live on twinmos.com within ~60 seconds
```

Full workflow documentation: [J.2 - CMS and Content Operations/TwinMOSWebsiteContentPublishingWorkflow.md](../J%20-%20Operations%2C%20Maintenance%20and%20End-User%20Guides/J.2%20-%20CMS%20and%20Content%20Operations/TwinMOSWebsiteContentPublishingWorkflow.md)

### 6.3 Adding New Content

- **New product SKU:** Follow template in `03-products/_template-product-detail.md`; create in Strapi Product collection; update Master SKU Reference
- **New blog post:** Create in Strapi NewsArticle collection; use article template; set publish date; publish
- **New regional page:** Duplicate an existing regional page markdown in `/11-regional/`; update Strapi locale routing
- **New team member:** Add entry to Strapi Leader collection; upload headshot to Strapi media library (300×300px, WebP)
- **New distributor:** Add to Strapi Distributor collection; map pin will auto-appear on Where to Buy locator

### 6.4 CMS Backup Procedure (Manual)

```bash
# SSH to Hetzner VPS
ssh twinmos-admin@[HETZNER_VPS_IP]

# Run manual backup
./scripts/backup.sh manual

# Backup is uploaded to Backblaze B2 twinmos-db-backups/manual/
# Confirm upload success
```

---

## 7. Incident Response Quick Reference

### 7.1 P1 — Site Completely Down

```
1. Check UptimeRobot alert for details
2. Check Cloudflare status page: cloudflarestatus.com (is it Cloudflare outage?)
3. Check Hetzner status page: status.hetzner.com (is it VPS outage?)
4. SSH to Hetzner VPS — are services running?
   → docker ps (check all containers are 'Up')
   → coolify-managed services: check Coolify dashboard
5. If Strapi is down: docker restart [strapi-container-name]
6. If PostgreSQL is down: docker restart [postgres-container-name]
7. If Cloudflare Pages is serving stale: purge Cloudflare cache (Cloudflare dashboard → Caching → Purge Everything)
9. Write incident post-mortem within 24 hours (use template in J.1 Runbooks)
```

**Target: P1 resolved within 4 hours**

### 7.2 P2 — E-Commerce Checkout Broken

```
1. Check Stripe Dashboard for payment failures or API errors
2. Check Sentry for Medusa.js errors
3. Check Resend for email delivery failures (order confirmations)
4. Verify Stripe webhook endpoint is responding (check Stripe webhook logs in Stripe Dashboard)
5. If checkout is down:
   a. Check Medusa.js service in Coolify — restart if crashed
   b. Verify Stripe API keys are valid (check Stripe Dashboard → API Keys)
6. Rollback Medusa.js to previous deployment if new deployment caused the issue
```

**Target: P2 resolved within 24 hours**

### 7.3 Security Incident Response

```
1. Identify scope: what has been compromised? (Cloudflare WAF logs, Sentry errors, DB query logs)
2. Immediately: rotate compromised credentials
3. If active attack: enable Cloudflare "Under Attack" mode (dashboard → Security → Settings)
4. If data breach suspected: notify TwinMOS Legal within 1 hour; notify affected data subjects within 72 hours (GDPR/PDPL obligation)
5. Isolate compromised service if necessary (Coolify: stop affected app)
6. Engage Phase 4 security vendor or emergency security incident response service
7. Document timeline and actions for post-incident report
```

---

## 8. Performance Troubleshooting Reference

### 8.1 Lighthouse Score Regression

If Lighthouse scores drop below targets (Performance < 90, Accessibility < 95):

| Symptom | Likely Cause | Investigation |
|---------|-------------|---------------|
| Performance regression after deploy | New JS bundle too large; unoptimized image added; slow API call in SSR | Check GitHub Actions Lighthouse CI report for the failing build; compare bundle sizes |
| LCP regression | Large hero image; slow font load; render-blocking scripts | Run PageSpeed Insights; check Network waterfall in DevTools; check ImgProxy image optimization |
| CLS regression | Content shifting after lazy-load; new font causing reflow | Record screen; identify shifting element; check CSS `aspect-ratio` and font-display settings |
| Accessibility score drop | New page missing alt text; new color contrast issue; focus trap added | Run axe-core in browser; check which rule failed |

### 8.2 Database Performance

If Strapi CMS is slow:
```sql
-- Find slow queries (run in PostgreSQL via psql or Coolify admin)
SELECT pid, now() - query_start AS duration, query
FROM pg_stat_activity
WHERE state = 'active' AND duration > interval '5 seconds'
ORDER BY duration DESC;

-- Check table bloat
SELECT schemaname, tablename, n_dead_tup, n_live_tup
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC LIMIT 20;

-- Run VACUUM if bloat is high
VACUUM ANALYZE [tablename];
```

### 8.3 MeiliSearch Index Issues

```bash
# SSH to Hetzner VPS
# Check MeiliSearch status
curl -X GET 'http://localhost:7700/health' -H 'Authorization: Bearer [master-key]'

# Check index document counts
curl -X GET 'http://localhost:7700/indexes/products/stats' -H 'Authorization: Bearer [master-key]'

# Trigger full re-index from Strapi (run in Strapi admin or via API)
# This will re-index all content types — takes ~5-10 minutes for full catalog
```

---

## 9. Key Contact Directory

### 9.1 Internal TwinMOS Contacts

| Role | Name | Contact | Escalation Level |
|------|------|---------|-----------------|
| IT Lead | [Name] | it@twinmos.com | First-line technical escalation |
| Marketing Director | [Name] | marketing@twinmos.com | Content, SEO, campaign issues |
| Legal Counsel | [Name] | legal@twinmos.com | Data breach, compliance, IP issues |
| Finance Director | [Name] | finance@twinmos.com | Payment/Stripe issues, invoice matters |

### 9.2 Phase 4 Vendor Contact (if Unisoft retained)

| Role | Name | Contact | Availability |
|------|------|---------|-------------|
| Unisoft Team Lead | [Name] | [Email] | Business hours; P1 on-call number: [Phone] |
| Unisoft Senior Developer | [Name] | [Email] | Business hours |

> Business hours: Sunday–Thursday 09:00–18:00 GST (Dubai time), unless Phase 4 SOW specifies otherwise.

### 9.3 Third-Party Vendor Emergency Contacts

| Vendor | Service | Support URL / Contact |
|--------|---------|----------------------|
| Cloudflare | CDN, DNS, Pages, WAF | support.cloudflare.com (Pro/Business SLA) |
| Hetzner | VPS | support@hetzner.com / console.hetzner.cloud |
| Stripe | Payments | support.stripe.com |
| Resend | Email | resend.com/support |
| Sentry | Error monitoring | sentry.io/support |
| Backblaze | Storage | help.backblaze.com |

---

## 10. Handover Confirmation Checklist

| # | Handover Item | Confirmed By TwinMOS IT Lead | Date |
|---|--------------|------------------------------|------|
| 1 | Hetzner VPS SSH access confirmed (key-based, working) | ☐ | |
| 2 | Coolify admin access confirmed (login working) | ☐ | |
| 3 | Strapi CMS admin login confirmed | ☐ | |
| 4 | PostgreSQL admin access confirmed (via Coolify or psql) | ☐ | |
| 5 | Cloudflare account access confirmed (twinmos.com domain controlled) | ☐ | |
| 6 | GitHub repository access confirmed (all repos visible) | ☐ | |
| 7 | Backblaze B2 access confirmed (media bucket accessible) | ☐ | |
| 8 | Resend access confirmed (email templates visible) | ☐ | |
| 9 | Sentry access confirmed (projects visible, alerts routing to TwinMOS email) | ☐ | |
| 10 | UptimeRobot access confirmed (monitors visible, alerts routing to TwinMOS email) | ☐ | |
| 11 | Stripe access confirmed (dashboard accessible, webhooks routing correctly) | ☐ | |
| 12 | Unisoft personnel NO LONGER have access to any system | ☐ | |
| 13 | All monitoring alerts routing to TwinMOS email (NOT Unisoft email) | ☐ | |
| 14 | Manual deployment tested (frontend and CMS, without Unisoft involvement) | ☐ | |
| 15 | Database backup and restore tested | ☐ | |
| 16 | Full DR drill completed | ☐ | |
| 17 | IT Lead has read and understood this Maintenance Handover Document | ☐ | |
| 18 | Maintenance schedule entered into TwinMOS IT calendar | ☐ | |
| 19 | Emergency response contacts added to TwinMOS escalation contact list | ☐ | |
| 20 | Phase 4 vendor (if different from Unisoft) granted scoped access | ☐ | |

---

## 11. Document Maintenance Obligation

This document must be kept current. The TwinMOS IT Lead is responsible for updating this document whenever:

- Infrastructure topology changes (new services, migrations, upgrades)
- Service account email addresses change
- Emergency contacts change
- Deployment procedures change
- Any new Phase 4 services are added

**Document Review Schedule:** Quarterly — aligned with quarterly maintenance tasks.

---

**TwinMOS IT Lead Handover Acknowledgment:**

| Field | Details |
|-------|---------|
| **Name** | [TwinMOS IT Lead Name] |
| **Signature** | _______________________________________________ |
| **Date** | _________________________________________ |
| **Declaration** | I confirm receipt of this Maintenance Handover Document and all associated access credentials. I confirm that I can independently operate and maintain the TwinMOS website platform described herein. |

---

**Unisoft Team Lead Handover Completion:**

| Field | Details |
|-------|---------|
| **Name** | [Unisoft Team Lead Name] |
| **Signature** | _______________________________________________ |
| **Date** | _________________________________________ |
| **Declaration** | I confirm that this Maintenance Handover Document accurately reflects the current state of the TwinMOS website platform as of October 2027, and that all access credentials and technical assets have been transferred to TwinMOS. |

---

*Document prepared by Unisoft Solutions Ltd. and TwinMOS Digital Transformation Team | CONFIDENTIAL — Contains sensitive infrastructure information | Restricted circulation*
