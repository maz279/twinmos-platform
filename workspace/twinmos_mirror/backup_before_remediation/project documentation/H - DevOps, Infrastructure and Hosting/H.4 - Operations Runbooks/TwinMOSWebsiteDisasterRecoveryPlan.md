# TwinMOS Website — Disaster Recovery Plan

**Document ID:** H.4-004  
**Version:** 1.0  
**Status:** Active  
**Owner:** Tech Lead  
**Last Updated:** 2026-05-01  
**Related:** TwinMOSWebsiteBackupRestoreRunbook.md · TwinMOSWebsiteDRDrillProcedure.md · TwinMOSWebsiteHostingArchitectureSpec.md · TwinMOSWebsiteHetznerProvisioningGuide.md · TwinMOSWebsiteDNSCutoverPlan.md

---

## 1. Executive Summary

This document defines the Disaster Recovery (DR) plan for the TwinMOS website. It covers detection, decision, execution, and verification for a range of failure scenarios — from a single service crash to full server loss.

**Objectives:**

| Metric | Target |
|--------|--------|
| Recovery Time Objective (RTO) | ≤ 4 hours |
| Recovery Point Objective (RPO) | ≤ 15 minutes (with WAL archiving enabled) |
| Availability SLO | 99.9% (≤ 43.2 min downtime/month) |
| External SLA (partners) | 99.5% monthly |

**Architecture resilience model:** The TwinMOS website frontend (Astro on Cloudflare Pages) is inherently resilient — Cloudflare Pages serves from its global edge network and does not depend on the Hetzner origin for static content. The principal DR concern is the Hetzner CX32 backend: Strapi, PostgreSQL, MeiliSearch, ImgProxy, Redis, and Plausible.

---

## 2. Disaster Scenarios

### 2.1 Scenarios Matrix

| Scenario | Probability | Impact | RTO Target | Primary Response |
|----------|-------------|--------|------------|-----------------|
| Single service crash (Strapi restart) | High | Low | 2 min | Coolify auto-restart |
| Hetzner VPS unreachable (network issue) | Medium | High | 30 min | Wait for Hetzner resolution or migrate |
| Hetzner VPS destroyed/corrupted OS | Low | Critical | ≤ 4 h | Full DR procedure (§5) |
| PostgreSQL data corruption | Low | Critical | ≤ 2 h | DB restore procedure (§6.1) |
| Accidental data deletion in Strapi | Medium | Medium | ≤ 1 h | PITR or partial restore (§6.2) |
| Cloudflare Pages outage | Very Low | High | 0 (Cloudflare SLA) | Cloudflare handles; monitor |
| Cloudflare DNS outage | Very Low | Critical | Failover DNS (§7.1) | Pre-configured fallback |
| Backblaze B2 outage | Very Low | Medium | Deferred restore | Wait for B2 restoration |
| GitHub Actions outage | Low | Low | Defer CI/CD | Deploy manually via CLI |
| DDoS attack | Medium | Medium | 15 min | Cloudflare WAF response (§7.3) |
| Secret/credential compromise | Low | Critical | 30 min | Emergency rotation (§7.4) |
| SSL certificate expiry | Low | High | 15 min | Manual renewal (§7.5) |

### 2.2 Out-of-Scope Scenarios

- Loss of Cloudflare Pro account — contact Cloudflare Enterprise sales; redirect DNS to origin temporarily
- GitHub repository deletion — restore from local developer clone or GitHub support
- Domain hijacking — contact registrar emergency support immediately

---

## 3. Incident Severity Levels

| Level | Name | Definition | Ack Time | Resolution Target |
|-------|------|------------|---------|-------------------|
| SEV-1 | Critical | Website completely unavailable | 15 min | ≤ 1 hour |
| SEV-2 | Major | Core functionality degraded (products not loading, search broken) | 30 min | ≤ 4 hours |
| SEV-3 | Minor | Non-critical feature broken (analytics down, contact form error) | 2 hours | ≤ 24 hours |
| SEV-4 | Informational | Degraded performance, warning thresholds exceeded | 4 hours | Next business day |

---

## 4. On-Call & Communication

### 4.1 On-Call Escalation Path

```
Alert fires (UptimeRobot / Sentry / Slack #alerts)
    │
    ▼
Developer on duty (Slack #alerts — 15 min to acknowledge)
    │
    │ Not acknowledged in 15 min
    ▼
Tech Lead (direct Slack DM + SMS/WhatsApp)
    │
    │ SEV-1 confirmed
    ▼
Chairman (notification, not response — informed within 30 min)
```

### 4.2 Communication Channels

| Channel | Purpose | Who Posts |
|---------|---------|-----------|
| Slack `#incident` | Real-time incident coordination | Tech Lead |
| Slack `#ops` | Non-urgent updates, post-incident summary | Tech Lead |
| Email `devops@twinmos.com` | External notifications to distributors | Tech Lead |
| status.twinmos.com (UptimeRobot) | Public-facing status page | Auto (UptimeRobot) |
| Slack `#announcements` | Business impact notification | Chairman |

### 4.3 Incident Declaration Template

Post to Slack `#incident` immediately when SEV-1 or SEV-2 is confirmed:

```
🚨 INCIDENT DECLARED — SEV-[level] — [date/time UTC]

Summary: [1 sentence description]
Impact: [What is broken for whom]
Detection: [How was it detected]
Current status: [Investigating / Identified / Mitigating / Resolved]
Lead: @[name]
Next update: [time UTC]
```

---

## 5. Full Infrastructure Rebuild Procedure

**Use when:** Hetzner VPS is unrecoverable (hardware failure, OS corruption, accidental deletion).

**Prerequisites:**
- Access to Hetzner Cloud Console (hetzner.com/cloud)
- GPG backup passphrase (Bitwarden → TwinMOS Vault → Infrastructure → GPG Backup Passphrase)
- B2 application key for restore (`restore-prod-key`)
- Cloudflare DNS edit access
- Tech Lead present (2-person confirmation required for production DNS changes)

**Total estimated time: 2.5–4 hours**

---

### Step 1 — Declare Incident (T+0)

```
□ Post to Slack #incident:
  🚨 INCIDENT — SEV-1 — [timestamp UTC]
  Hetzner twinmos-production-01 is unreachable / unrecoverable
  Initiating full DR procedure
  Lead: @[tech-lead]

□ Update UptimeRobot status page to "Investigating"
□ Notify Chairman via direct message
```

### Step 2 — Assess and Decide (T+5)

```
□ Attempt Hetzner console → twinmos-production-01 → Console access
  → If server responds in console: investigate OS-level issue first
  → If server unresponsive in console: proceed with full rebuild

□ Check Hetzner status page (https://status.hetzner.com)
  → If Hetzner DC incident: wait up to 2 hours before rebuilding in alternate DC

□ Decision point:
  Rebuild in same DC (Falkenstein):  recommended if Hetzner DC is healthy
  Rebuild in alternate DC (Helsinki FI or Ashburn US VA): if Falkenstein DC affected
```

### Step 3 — Provision New Server (T+10 – T+20)

```bash
# Hetzner Cloud Console → twinmos project → Add Server

Server name:   twinmos-production-02
Location:      Falkenstein (nbg1) — or Helsinki (hel1) if Falkenstein affected
Image:         Ubuntu 24.04 LTS
Type:          CX32 (4 vCPU / 8 GB RAM / 80 GB SSD NVMe)
SSH keys:      Select twinmos-deploy-key
Firewall:      Select twinmos-production-firewall
               (Allows: Cloudflare IPs on 80/443; Tech Lead IP on 22)
Cloud-init:    Paste cloud-init YAML from TwinMOSWebsiteHetznerProvisioningGuide.md §3

Click: Create & Buy now
```

```bash
# Record new server IP — shown in Hetzner dashboard
NEW_IP="<new-hetzner-ip>"

# Wait for cloud-init to complete (~3-4 min)
# SSH to verify server is ready
ssh deploy@${NEW_IP} "systemctl is-active docker && echo 'Docker OK'"
```

### Step 4 — Install Coolify (T+20 – T+30)

```bash
ssh deploy@${NEW_IP}

# Install Coolify
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash

# Wait for Coolify to start (~2 min)
# Access Coolify at: http://${NEW_IP}:8000

# Complete initial Coolify setup:
# - Set admin email: devops@twinmos.com
# - Set admin password (from Bitwarden)
# - Register server (localhost with deploy user SSH key)
```

### Step 5 — Restore PostgreSQL (T+30 – T+80)

```bash
# On new server — download latest backup from B2
b2 account authorize <restore-prod-key-id> <restore-prod-key-secret>

# Find latest backup
b2 ls --long twinmos-backups-prod/daily/ | sort -r | head -5

# Download latest backup
LATEST_BACKUP="daily/pg_backup_YYYYMMDD_020000.tar.gpg"  # from listing above
b2 download-file-by-name \
  twinmos-backups-prod \
  "${LATEST_BACKUP}" \
  /tmp/backup.tar.gpg

# Decrypt
read -s -p "GPG passphrase: " GPG_PASS; echo
gpg --decrypt --passphrase "${GPG_PASS}" --batch \
    /tmp/backup.tar.gpg > /tmp/backup.tar
tar -xf /tmp/backup.tar -C /tmp/

# Start PostgreSQL container alone first (for restore)
docker run -d \
  --name twinmos-postgres-restore \
  -e POSTGRES_USER=strapi_user \
  -e POSTGRES_PASSWORD=<from-bitwarden> \
  -e POSTGRES_DB=strapi_prod \
  -v twinmos-postgres-data:/var/lib/postgresql/data \
  postgres:16

sleep 10

# Restore
DUMP_FILE=$(ls /tmp/pg_backup_*.dump | head -1)
docker exec -i twinmos-postgres-restore pg_restore \
  --username=strapi_user \
  --dbname=strapi_prod \
  --no-owner \
  < "${DUMP_FILE}"

docker stop twinmos-postgres-restore && docker rm twinmos-postgres-restore
```

### Step 6 — Deploy All Services via Coolify (T+80 – T+140)

```bash
# In Coolify dashboard (http://${NEW_IP}:8000):

# Import services from backup config:
# Settings → Restore configuration → Upload coolify_config_*.tar.gz (from B2 coolify/ folder)

# If import not available, manually add services:
# 1. PostgreSQL (existing volume restored in Step 5)
# 2. Strapi — Docker Image: strapi/strapi:5.31-node22-alpine
#    Environment variables: copy from Bitwarden → TwinMOS → Coolify Strapi Prod
#    Domain: api.twinmos.com, admin.twinmos.com
#    Health check: /api/_health
# 3. MeiliSearch v1.13
# 4. ImgProxy
# 5. Redis
# 6. Plausible + ClickHouse

# Trigger deploy for each service
# Wait for health checks to pass
```

### Step 7 — Restore MeiliSearch Index (T+100 – T+120)

```bash
# Download latest MeiliSearch dump
b2 ls --long twinmos-backups-prod/meilisearch/ | sort -r | head -3
b2 download-file-by-name \
  twinmos-backups-prod \
  "meilisearch/meili_dump_YYYYMMDD_030000.dump.gpg" \
  /tmp/meili.dump.gpg

gpg --decrypt --passphrase "${GPG_PASS}" --batch \
    /tmp/meili.dump.gpg > /tmp/meili.dump

# Import into new MeiliSearch
docker cp /tmp/meili.dump twinmos-meilisearch-1:/meili_data/dumps/restore.dump

curl -X POST http://localhost:7700/dumps/restore \
  -H "Authorization: Bearer ${MEILI_MASTER_KEY}" \
  -d '{"dumpUid": "restore"}'

# Monitor until completed
```

### Step 8 — Update Cloudflare DNS (T+120 – T+130)

```
□ REQUIRES: Tech Lead + second team member confirmation

Cloudflare Dashboard → twinmos.com → DNS → Records

Update the following A records to point to ${NEW_IP}:
  api       → ${NEW_IP}
  admin     → ${NEW_IP}
  search    → ${NEW_IP}
  imgproxy  → ${NEW_IP}
  analytics → ${NEW_IP}
  chat      → ${NEW_IP} (if applicable)
  coolify   → ${NEW_IP}

All records: Proxy enabled (orange cloud) ✅

Note: Cloudflare proxy means DNS propagation is near-instant globally.
      Existing connections to old IP will timeout gracefully.

□ Post to #incident: "DNS records updated to ${NEW_IP} at [timestamp UTC]"
```

### Step 9 — Verify HTTPS and Services (T+130 – T+155)

```bash
# From Tech Lead laptop (not server — external verification)

# API health
curl https://api.twinmos.com/api/_health
# Expected: {"data":{"server":"running"}}

# Search health
curl https://search.twinmos.com/health
# Expected: {"status":"available"}

# Homepage loads
curl -sI https://twinmos.com | head -5
# Expected: HTTP/2 200

# Strapi admin accessible
curl -sI https://admin.twinmos.com/admin | head -1
# Expected: HTTP/2 200

# Verify Cloudflare is in the path (not direct to origin)
curl -sI https://twinmos.com | grep -i "cf-ray"
# Should show cf-ray header

# Verify SSL
echo | openssl s_client -connect twinmos.com:443 2>/dev/null | grep -E "subject|issuer|verify"
```

### Step 10 — Run Smoke Tests (T+155 – T+175)

```bash
# From GitHub Actions (manual workflow trigger)
# GitHub → twinmos-frontend → Actions → Smoke Tests → Run workflow

# Or locally:
cd twinmos-frontend
pnpm exec playwright test tests/smoke/ --reporter=line

# Minimum passing smoke tests:
# [E2E-01] Homepage loads + hero visible
# [E2E-02] Product search returns results
# [E2E-03] Product detail page loads
# [E2E-04] Contact form renders
# [E2E-05] Arabic locale renders
```

### Step 11 — Notify Stakeholders (T+175 – T+180)

```
□ Update Slack #incident: "RESOLVED at [timestamp UTC]. All services healthy."
□ Update UptimeRobot status page: "All systems operational"
□ Post summary in #ops:
  "DR completed in [duration] min. Services restored. 
   Data loss: estimated [X] minutes (last backup timestamp)"
□ Email to devops@twinmos.com: notify Chairman
□ If during business hours: notify sales/support teams
```

### Step 12 — Post-DR Cleanup (T+240 – T+480)

```
□ Schedule post-incident review within 48 hours
□ Delete old server twinmos-production-01 from Hetzner (after 24h stable)
□ Rename new server to twinmos-production-01 in Hetzner dashboard
□ Update IP in any hardcoded references (Cloudflare WAF, Fail2ban, monitoring)
□ Update TwinMOSWebsiteDNSRecordsSpecification.md with new IP placeholder
□ Generate post-incident report (see §9)
```

---

## 6. Partial Recovery Scenarios

### 6.1 Database Corruption Only (Server Intact)

```
Impact: Strapi admin broken, content not loading, DB errors in Sentry
Action:
  1. Stop Strapi container
  2. pg_dump current DB to backup (even corrupted — for forensics)
  3. Restore from last good B2 backup (see TwinMOSWebsiteBackupRestoreRunbook.md §4.1)
  4. Restart Strapi and verify
Estimated time: 30–60 min
```

### 6.2 Accidental Content Deletion

```
Impact: Products/content missing from website
Action:
  1. Determine timestamp of deletion (check Sentry audit logs or Strapi admin history)
  2. Use PITR to restore DB to 15 min before deletion
     (see TwinMOSWebsiteBackupRestoreRunbook.md §4.2)
  3. Export affected records and re-import to current DB (if PITR is too costly)
Estimated time: 1–2 h
```

### 6.3 Frontend Only Down (Hetzner Intact, Cloudflare Pages Issue)

```
Impact: Website returns error from Cloudflare Pages
Likely causes: Failed deployment, Pages outage
Action:
  1. Cloudflare Dashboard → Workers & Pages → twinmos-website
     → Deployments → Select last-known-good deployment → Retry
  2. If Cloudflare Pages global outage: check status.cloudflare.com
     → No action possible; wait for Cloudflare resolution
     → Backend API remains functional; communicate to users
Estimated time: 5 min for rollback; indefinite for Cloudflare outage
```

### 6.4 Backend Only Down (Cloudflare Pages Intact)

```
Impact: Homepage/products load from cache; API calls fail; search broken
The frontend will return cached pages from Cloudflare edge for up to 1 hour
Action:
  1. SSH to Hetzner and diagnose (docker ps, docker logs, coolify dashboard)
  2. Restart failing container via Coolify
  3. If disk full: docker system prune, clean /tmp
  4. If OOM: restart server, check Coolify RAM limits
  5. If server unresponsive: proceed to §5 (full rebuild)
Estimated time: 5–30 min for container restart; up to 4h for full rebuild
```

### 6.5 Search (MeiliSearch) Down

```
Impact: Product search returns errors; website navigation still works
Action:
  1. Coolify → twinmos-meilisearch → Restart
  2. Verify health: curl https://search.twinmos.com/health
  3. If index corrupted: restore from last B2 backup (§4.3)
Estimated time: 5–15 min
```

---

## 7. Specific Incident Response Procedures

### 7.1 Cloudflare DNS Outage

```
Cloudflare's Anycast DNS is globally redundant. A full DNS outage is extremely rare.

Mitigation:
  1. Do NOT change nameservers in panic — propagation takes 24-48h
  2. Monitor Cloudflare status page: https://www.cloudflarestatus.com
  3. If Cloudflare DNS is confirmed down globally, evaluate switching to secondary DNS:
     - Hetzner DNS as emergency NS (pre-configure twinmos.com zone in Hetzner DNS)
     - Change NS records at registrar to Hetzner NS
     - Estimated propagation: 4–24h

Pre-configure Hetzner DNS zone (for emergency use only):
  Hetzner DNS Console → Add Zone: twinmos.com
  Add A records mirroring Cloudflare DNS spec (see TwinMOSWebsiteDNSRecordsSpecification.md)
  Do NOT activate — keep as standby
```

### 7.2 Backblaze B2 Outage

```
Impact: Cannot upload new backups; Strapi media uploads fail; restore deferred
Action:
  1. Check B2 status: https://www.backblaze.com/blog/service-status/
  2. If B2 down: Strapi will log upload errors — site still serves existing content from CDN
  3. Run pg_dump locally on Hetzner server (store on /var/backups as temporary)
  4. When B2 resumes: upload all pending backups manually
  5. If B2 outage > 24h: evaluate S3 as temporary backup target
     (configure aws-cli with S3 credentials, modify backup scripts)
```

### 7.3 DDoS Attack Response

```
Cloudflare Pro includes DDoS mitigation. Steps:

  1. Check Cloudflare Security → DDoS → Overview
  2. If WAF blocking is not sufficient:
     a. Security → DDoS → HTTP DDoS Attack Protection → Deploy
     b. Enable "Under Attack Mode" (Cloudflare → Security → Settings → Security Level: I'm Under Attack)
        WARNING: This adds JavaScript challenge to ALL visitors — expect significant bounce
     c. Identify attack pattern (IP ranges, User-Agent, URI) in Cloudflare Analytics → Security
     d. Add custom WAF rule to block identified pattern
  3. If origin is being directly hit (attacker has Hetzner IP):
     a. Change Hetzner server IP (rare — requires server recreation)
     b. Update Cloudflare WAF custom rule to block old Hetzner IP
  4. After attack subsides: return Security Level to "Medium"
```

### 7.4 Secret / Credential Compromise

```
Response time: 30 minutes maximum

STEP 1: Identify compromised secret
  - Which secret? (JWT, DB password, API key, etc.)
  - When was it last rotated? Check Bitwarden audit log
  - How was it compromised? (code leak, insider, breach notification)

STEP 2: Revoke immediately
  - JWT secrets: regenerate in Coolify env vars → redeploy Strapi
  - Database password: ALTER USER strapi_user WITH PASSWORD 'new-password';
    Update Coolify DATABASE_URL env var → redeploy
  - Cloudflare API token: Cloudflare → API Tokens → Revoke → Create new
  - B2 application key: B2 Console → Application Keys → Delete → Create new
  - Resend API key: Resend Dashboard → API Keys → Delete → Create new

STEP 3: Verify rotation took effect
  - Check Strapi API /api/_health (if JWT rotated — new token required)
  - Check DB connectivity
  - Re-run smoke tests

STEP 4: Audit for misuse
  - Check Strapi admin audit log (Settings → Audit Log)
  - Check PostgreSQL pg_stat_activity for unusual connections
  - Check Cloudflare Security Events for unauthorized API actions
  - Report to Chairman if evidence of misuse

STEP 5: Document and report
  - Post incident summary in #incident
  - If personal data was exposed: notify DPO within 24h (GDPR 72h breach notification)
```

### 7.5 SSL Certificate Expiry

```
Cloudflare Universal SSL: Auto-renews 30 days before expiry. No action needed.
Let's Encrypt via Coolify: Auto-renews 30 days before expiry. No action needed.

If auto-renewal fails (UptimeRobot SSL alert fires at 14 days):
  1. SSH to Hetzner server
  2. Check Coolify SSL status: Coolify → twinmos-strapi → Domains → SSL status
  3. If Coolify ACME failed:
     a. docker exec coolify-proxy traefik healthcheck
     b. Trigger manual ACME: Coolify → Domain → Force SSL Renewal
  4. If Traefik ACME continues to fail:
     a. Use Cloudflare Origin Certificate instead (15-year validity):
        Cloudflare → SSL/TLS → Origin Server → Create Certificate
        Install on server: /etc/ssl/twinmos-origin.pem
        Update Traefik to use file provider
  5. Verify: curl -sI https://api.twinmos.com | grep -i "cf-ray"
     Check certificate: echo | openssl s_client -connect api.twinmos.com:443 2>/dev/null | grep "notAfter"
```

---

## 8. Business Continuity Fallbacks

### 8.1 Static Cache Mode (Hetzner Down, Cloudflare Pages Up)

The frontend serves from Cloudflare edge cache for up to 1 hour after origin becomes unavailable.

**User experience during backend outage:**
- Cached product pages: Still serve (up to 1h cache TTL)
- Search: Returns error — MeiliSearch unreachable
- Contact form: Returns error — Strapi API unavailable
- Product images via ImgProxy: May fail — cached copies still serve from Cloudflare edge

**Communication:**
- Update status page to "Backend maintenance in progress — browsing available, forms temporarily unavailable"

### 8.2 Minimal Static Site Deployment

In extreme scenarios (extended Hetzner failure), an emergency static HTML version can be deployed to Cloudflare Pages:

```bash
# From Tech Lead laptop
git clone https://github.com/twinmos/twinmos-frontend
cd twinmos-frontend

# Use emergency env that points to no backend (static-only build)
cp .env.emergency .env.production
pnpm install && pnpm build

npx wrangler pages deploy ./dist \
  --project-name twinmos-website \
  --branch main \
  --commit-message "Emergency static deploy — backend offline"
```

This serves a static snapshot of the last successful build — products visible but no search or forms.

---

## 9. Post-Incident Report Template

Complete within 48 hours of resolution:

```
# Post-Incident Report — [Incident Title]
Date: [YYYY-MM-DD]
Duration: [HH:MM] (from first alert to resolution)
Severity: SEV-[level]
Affected services: [list]
Lead engineer: [name]

## Timeline (UTC)
HH:MM — [event]
HH:MM — [event]
...

## Root Cause
[Detailed explanation of what caused the incident]

## Impact
- Users affected: [estimate]
- Revenue impact: [if applicable — P3 commerce]
- Data loss: [RPO achieved — e.g., "3 minutes of data lost"]
- SLO impact: [e.g., "SLO budget consumed: 12 min / 43.2 min monthly budget"]

## What Went Well
- [item]

## What Went Poorly
- [item]

## Action Items
| Action | Owner | Due Date |
|--------|-------|----------|
| [action] | [name] | [date] |

## Runbook Updates Needed
- [any procedure changes identified]
```

---

## 10. DR Testing Cadence

| Drill Type | Frequency | Owner | Details |
|------------|-----------|-------|---------|
| Tabletop walkthrough | Quarterly | Tech Lead | Walk through this document step-by-step verbally; 30 min |
| Backup restore drill | Monthly (automated) | Automated script | Weekly automated restore to dev (§8 of Backup Runbook) |
| Full DR drill | Pre-phase launch + semi-annually | Tech Lead | Full rebuild on spare server; see TwinMOSWebsiteDRDrillProcedure.md |

---

*Approved by: Chairman · Tech Lead*  
*Synchronized With: Technology Stack v1.1 §22.4, §23.1*
