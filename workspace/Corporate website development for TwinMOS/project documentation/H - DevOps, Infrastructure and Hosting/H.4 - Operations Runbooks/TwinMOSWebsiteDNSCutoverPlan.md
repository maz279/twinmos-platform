# TwinMOS Website — DNS Cutover Plan

**Document ID:** H.4-006  
**Version:** 1.0  
**Status:** Active  
**Owner:** Tech Lead  
**Last Updated:** 2026-05-01  
**Related:** TwinMOSWebsiteDNSRecordsSpecification.md · TwinMOSWebsiteCloudflareConfigurationGuide.md · TwinMOSWebsiteDisasterRecoveryPlan.md · TwinMOSWebsiteHostingArchitectureSpec.md

---

## 1. Overview

This document defines the DNS cutover procedure for migrating the twinmos.com domain from its current hosting environment to the new Cloudflare + Hetzner architecture. This is a one-time production go-live operation.

**Objective:** Switch twinmos.com from the current provider's DNS/hosting to:
- **Frontend:** Cloudflare Pages (twinmos-website.pages.dev)
- **Backend:** Hetzner CX32 production server via Cloudflare proxy
- **DNS:** Cloudflare DNS (Anycast)

**Cutover window:** Tuesday 01:00–03:00 UTC (minimum MENA traffic; ~05:00 GST)

**Downtime estimate:** 0–5 minutes (Cloudflare proxy absorbs most of the transition; the primary risk window is during nameserver propagation)

---

## 2. Pre-Cutover Completion Checklist

All items must be marked complete before the DNS cutover window begins. Typically completed 48–72 hours before cutover.

### 2.1 Infrastructure Ready

```
□ Hetzner CX32 production server provisioned and fully configured
  Verify: ssh deploy@<hetzner-ip> "docker ps | grep twinmos"
  All 6 containers running: strapi, postgres, meilisearch, imgproxy, redis, plausible

□ All services pass health checks:
  curl https://staging-api.twinmos.com/api/_health   → {"data":{"server":"running"}}
  curl https://staging.twinmos.com/health            → HTTP 200
  curl https://staging-search.twinmos.com/health     → {"status":"available"}

□ Cloudflare Pages production deployment live:
  Visit: https://twinmos-website.pages.dev
  Confirm: Latest content visible, no build errors

□ Backblaze B2 buckets configured and accessible:
  b2 ls twinmos-media-prod
  b2 ls twinmos-backups-prod/daily/ | tail -3

□ SSL certificates provisioned:
  curl -sI https://twinmos-website.pages.dev | grep -i "strict-transport"
  Check Coolify → Services → All domains show green SSL status

□ Cloudflare Origin Certificate installed on Hetzner server (Coolify/Traefik)
  Verify: No SSL errors when accessing services via staging subdomain

□ Environment variables configured in Cloudflare Pages (production environment):
  PUBLIC_API_URL=https://api.twinmos.com
  PUBLIC_SEARCH_URL=https://search.twinmos.com
  [All variables in TwinMOSWebsiteCloudflareConfigurationGuide.md §2.2]
```

### 2.2 Testing Complete

```
□ Full Playwright test suite passing against staging.twinmos.com:
  pnpm exec playwright test --reporter=list
  All E2E tests pass

□ Lighthouse audit on staging meets thresholds:
  Homepage desktop: Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95
  Homepage mobile: Performance ≥ 80

□ Multi-locale test: AR, HI, BN locales load correctly on staging

□ All 9 locales render: /ar/, /hi/, /bn/, /ru/, /fr/, /es/, /de/, /zh/ verified

□ Contact form tested: Form submits via staging-api.twinmos.com
  Confirm Resend email received at info@twinmos.com

□ Product pages: At least 10 products visible with images and specs

□ Search: Product search returns relevant results

□ UAT sign-off obtained from: □ Chairman □ Tech Lead □ Marketing
  (Documented via Slack thread in #launch-approval)
```

### 2.3 DNS Pre-Work (48 Hours Before Cutover)

```
□ Document current DNS configuration at existing registrar/provider:
  - Current nameservers (NS records) for twinmos.com
  - Current A record for twinmos.com (old server IP)
  - All MX records (if email needs to be preserved)
  - Any CNAME/TXT/other records to preserve

□ Reduce TTL on twinmos.com DNS records at CURRENT provider:
  Target TTL: 300 seconds (5 minutes)
  Purpose: Ensures DNS changes propagate quickly during cutover
  IMPORTANT: Must be done 48 hours before cutover for TTL to be effective
  
  At current DNS provider:
    twinmos.com A record   → TTL: 300
    www.twinmos.com        → TTL: 300
    (All A/CNAME records)  → TTL: 300

□ Verify Cloudflare DNS zone is pre-configured (all records in TwinMOSWebsiteDNSRecordsSpecification.md)
  Do NOT activate (change nameservers) yet — just ensure records are ready

□ Confirm Cloudflare DNS shows correct records:
  Cloudflare Dashboard → twinmos.com → DNS → Records
  api.twinmos.com       → A → <hetzner-prod-ip> [Proxied]
  admin.twinmos.com     → A → <hetzner-prod-ip> [Proxied]
  search.twinmos.com    → A → <hetzner-prod-ip> [Proxied]
  @.twinmos.com         → CNAME → twinmos-website.pages.dev [Proxied]
  www.twinmos.com       → CNAME → twinmos-website.pages.dev [Proxied]
  [All records from TwinMOSWebsiteDNSRecordsSpecification.md]

□ Verify DKIM for Resend is configured in Cloudflare DNS:
  resend._domainkey.twinmos.com TXT record present

□ Verify SPF and DMARC records pre-configured in Cloudflare DNS

□ Notify key stakeholders of cutover schedule:
  Email template:
  ---
  Subject: TwinMOS Website — DNS Migration [Date] 01:00–03:00 UTC

  We will be migrating twinmos.com to our new infrastructure on [date].
  
  Expected impact: None for end users (Cloudflare handles transition seamlessly).
  Very brief (1–5 min) access interruption possible during nameserver change propagation.
  
  Questions? Contact devops@twinmos.com
  ---
```

### 2.4 Rollback Readiness

```
□ Old server remains running and accessible during cutover (do not decommission)
□ Old server IP recorded: _______________
□ Old nameservers recorded: NS1: _______________  NS2: _______________
□ Rollback TTL (300s) confirmed active at old provider
□ Rollback procedure understood by Tech Lead and Developer B (see §6)
```

---

## 3. Cutover Window Procedure

**Date:** [TBD — set at pre-cutover go/no-go meeting]  
**Start time:** 01:00 UTC  
**End time (hard stop for rollback decision):** 03:00 UTC  
**Participants:** Tech Lead (lead), Developer B (monitoring + verify)  
**Observers:** Chairman (Slack #ops — available via DM)

### T−30 min (00:30 UTC): Final Checks

```bash
# Confirm all services healthy on Hetzner (via staging subdomain — pre-cutover)
curl https://staging-api.twinmos.com/api/_health
curl https://staging.twinmos.com | head -5

# Confirm Cloudflare Pages latest build is current
# Cloudflare Dashboard → Workers & Pages → twinmos-website → Deployments → Latest

# Check traffic on current/old server is minimal
# (Expected: near-zero at 00:30 UTC for MENA audience)

# Confirm both people on call
# Post in Slack #ops: "DNS cutover begins in 30 min. T-30 checks complete."
```

### T+0 (01:00 UTC): Begin Cutover

```bash
echo "=== DNS CUTOVER STARTED: $(date -u) ==="

# Post to Slack #ops:
# "DNS cutover started at 01:00 UTC. Changing nameservers for twinmos.com."
```

### T+0 to T+10: Change Nameservers

This is the primary cutover action. It changes DNS authority for twinmos.com from the old provider to Cloudflare.

```
At the DOMAIN REGISTRAR (not old DNS provider):
  Login → Domain Management → twinmos.com → Nameservers

  Replace current nameservers with Cloudflare nameservers:
  Cloudflare Dashboard → twinmos.com → DNS → Cloudflare nameservers
  (Example format: ada.ns.cloudflare.com, matt.ns.cloudflare.com)

  Save changes.
```

```bash
echo "Nameservers updated at $(date -u). Waiting for propagation..."
```

### T+10 to T+30: Monitor Propagation

```bash
# Poll DNS propagation — check every 60 seconds
while true; do
  echo "=== $(date -u) ==="
  
  # Query Google DNS (propagation indicator)
  dig @8.8.8.8 twinmos.com A +short
  
  # Query Cloudflare DNS (should be instant after NS change)
  dig @1.1.1.1 twinmos.com A +short
  
  # Expected: Cloudflare Pages IP (e.g. 192.0.2.1 — actual Cloudflare IPs)
  # When both return Cloudflare IPs → propagation progressing
  
  sleep 60
done

# Confirm DNS resolves globally:
# https://www.whatsmydns.net/#A/twinmos.com
# https://dnschecker.org/#A/twinmos.com
# Target: ≥80% of global nodes showing new IP within 10-15 min (TTL=300s = 5 min)
```

### T+15 to T+30: Verify HTTPS and Core Services

```bash
# Test from external network (mobile hotspot — NOT the Hetzner server itself)

# Homepage (Cloudflare Pages)
curl -sI https://twinmos.com | head -10
# Expected:
#   HTTP/2 200
#   cf-ray: [value]  ← confirms Cloudflare is serving
#   server: cloudflare

# API (Hetzner via Cloudflare proxy)
curl https://api.twinmos.com/api/_health
# Expected: {"data":{"server":"running"}}

# Search
curl https://search.twinmos.com/health
# Expected: {"status":"available"}

# Admin panel (verify Strapi admin loads — DO NOT LOG IN ON PRODUCTION DURING CUTOVER)
curl -sI https://admin.twinmos.com/admin | head -5
# Expected: HTTP/2 200

# Verify SSL certificate is valid
echo | openssl s_client -connect twinmos.com:443 2>/dev/null | grep "notAfter"
echo | openssl s_client -connect api.twinmos.com:443 2>/dev/null | grep "notAfter"
```

### T+30 to T+45: Run Smoke Tests

```bash
# Against PRODUCTION domain (now live on new infrastructure)
cd twinmos-frontend
BASE_URL=https://twinmos.com pnpm exec playwright test tests/smoke/ --reporter=list

# Expected: All smoke tests pass
# If any test fails: investigate immediately
```

### T+45 to T+60: Monitor Error Rate

```bash
# Monitor Sentry for error spike in first 30 minutes
# Cloudflare Dashboard → twinmos.com → Analytics → Web Analytics
#   Watch: Requests, Errors, Cache hit ratio

# UptimeRobot: All monitors should turn green within 5 minutes
# If monitor is red: investigate before declaring success

# Monitor Cloudflare Security Events for any unexpected WAF blocks
# Cloudflare → Security → Events → Filter last 1 hour
```

### T+60: Go/No-Go Decision

```
Tech Lead evaluates:

GO (cutover successful) if ALL of:
  □ DNS propagation ≥80% globally (dnschecker.org)
  □ Homepage returns HTTP 200 with cf-ray header
  □ API returns {"data":{"server":"running"}}
  □ Smoke tests all passing
  □ Sentry showing 0 new critical errors in last 30 min
  □ UptimeRobot all monitors green

NO-GO (rollback) if ANY of:
  □ DNS propagation stuck (< 50% after 30 min — may indicate registrar issue)
  □ Homepage returning 5xx errors
  □ API health check failing
  □ Sentry showing error spike (>10 errors/min vs 0 baseline)
  □ UptimeRobot showing 2+ consecutive down checks

Post to Slack #ops:
  ✅ "DNS cutover SUCCESSFUL at [time UTC]. All services verified healthy."
  OR
  ❌ "DNS cutover ROLLBACK INITIATED at [time UTC]. See Slack #incident."
```

---

## 4. Post-Cutover Actions (Within 48 Hours)

```
□ Increase TTL on DNS records from 300s back to 3600s (or Auto)
  Cloudflare Dashboard → DNS → Edit each record → TTL: Auto
  Benefit: Reduces DNS query load; faster Cloudflare updates globally

□ Enable DNSSEC:
  Cloudflare → twinmos.com → DNS → DNSSEC → Enable
  Submit DS record to domain registrar (takes 24h to propagate)
  Verify: dig twinmos.com DS +dnssec

□ Submit twinmos.com to HSTS preload list (after 6 months of HSTS stability):
  https://hstspreload.org/
  (Requires: HSTS max-age ≥1 year, includeSubDomains, preload)

□ Decommission old server (after 72 hours of stable new infrastructure):
  ⚠️ WAIT 72 hours minimum before decommissioning old server
  Confirm with Chairman before decommission
  Take one final backup of old server if any content was not migrated

□ Update DNS audit checklist date (TwinMOSWebsiteDNSRecordsSpecification.md §9)

□ Post cutover summary in Slack #ops:
  "DNS cutover complete. All services on new infrastructure [X] hours stable.
   Old server decommissioned [Y]. DNSSEC enabled."

□ Email distribution list / key distributor contacts:
  "The new TwinMOS website is live at twinmos.com.
   [Brief highlights of what's new]"
```

---

## 5. Email Continuity During Cutover

Cloudflare Email Routing is configured in the new DNS zone. Email should continue uninterrupted because:

1. Cloudflare Email Routing MX records are already configured in the Cloudflare DNS zone
2. Email propagation follows DNS propagation — during the 5-15 min transition, some email may be queued
3. No email should be lost — SMTP retries for 48–72 hours

**Verify email works after cutover:**

```bash
# Send test email to info@twinmos.com from external email account
# Verify receipt within 5 minutes

# Check MX records are resolving correctly:
dig twinmos.com MX +short
# Expected: route1.mx.cloudflare.net., route2.mx.cloudflare.net., route3.mx.cloudflare.net.
```

---

## 6. Rollback Procedure

If the Go/No-Go decision is NO-GO, immediately execute:

```
ROLLBACK TARGET: Restore DNS to old server within 5 minutes of NO-GO decision
```

### Step 1 — Restore Nameservers (at Registrar)

```
Domain Registrar → twinmos.com → Nameservers
  Replace Cloudflare NS with OLD nameservers:
  NS1: [recorded in pre-cutover checklist]
  NS2: [recorded in pre-cutover checklist]
  Save immediately.
```

### Step 2 — Verify Rollback Propagating

```bash
# Old TTL was 300s — propagation should complete within 5 min

while true; do
  echo "=== $(date -u) ==="
  dig @8.8.8.8 twinmos.com A +short
  # Expected: old server IP
  sleep 30
done
```

### Step 3 — Verify Old Server Responding

```bash
curl -sI https://twinmos.com | head -5
# Expected: HTTP/2 200 from old server (no cf-ray header, or old server headers)
```

### Step 4 — Post Incident Communication

```
□ Post in Slack #ops: "DNS cutover ROLLED BACK at [time UTC]. Old server active. Investigating."
□ Post in Slack #incident: Create incident thread
□ Notify Chairman
□ Document what went wrong (§7 in DR Plan)
□ Schedule follow-up cutover attempt after issues resolved
```

### Rollback Decision Window

```
01:00 UTC — Cutover starts
03:00 UTC — HARD STOP: if not fully resolved, initiate rollback
             (03:00 UTC = approaching business hours in South/Southeast Asia)
```

---

## 7. Monitoring After Cutover

### First 24 Hours

Check every 2 hours:

```bash
# UptimeRobot status page: all green
# Sentry: 0 new critical errors
# Cloudflare Analytics: Cache hit ratio ≥ 85%
# API response time p95 < 500ms (Cloudflare Analytics → Speed)
```

### First 7 Days

Daily checks:

```bash
# Lighthouse CI audit on production
cd twinmos-frontend
pnpm exec lhci autorun --collect.url=https://twinmos.com

# Check all locales accessible
for locale in ar hi bn ru fr es de zh; do
  STATUS=$(curl -sI https://twinmos.com/${locale}/ | head -1 | awk '{print $2}')
  echo "${locale}: ${STATUS}"
done

# Check Sentry for any new error patterns
# Sentry Dashboard → twinmos-frontend → Issues → Sort by: Date
```

---

## 8. Reference: DNS Propagation Times

| DNS TTL | Expected propagation |
|---------|---------------------|
| 300s (5 min) — set 48h before cutover | ~5–15 minutes for most resolvers |
| 3600s (1 hour) — standard | Up to 1 hour globally |
| 86400s (24 hours) — slow | Up to 24 hours |

**Why 48h TTL reduction matters:** DNS resolvers cache based on the TTL *at the time they last queried*. Reducing TTL 48 hours before cutover ensures all major resolvers have refreshed their cache with the new low TTL before the nameserver change.

---

*Approved by: Chairman · Tech Lead*  
*Synchronized With: Technology Stack v1.1 §19.6, §22.5*
