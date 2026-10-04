# TwinMOS Corporate Website — DNS Migration Plan

**Document Reference:** TWN-TECH-DNS-2026-001  
**Document Version:** 1.0  
**Status:** FINAL  
**Date:** 30 April 2026  
**Prepared by:** TwinMOS Digital Transformation Team / IT Lead  
**Owner:** IT/Technical Lead  
**Audience:** IT Team, DevOps, Marketing, Executive Leadership  
**Classification:** CONFIDENTIAL — Internal Use Only  
**Synchronized With:** BRD v3.0, RFP v3.0, Tech Stack v1.1, Launch Plan v1.0, Go/No-Go Checklist v1.0

---

## 1. Executive Summary

This document details the Domain Name System (DNS) migration strategy for cutting over the **twinmos.com** domain from the legacy (broken) WordPress/WooCommerce platform to the newly rebuilt modern stack (Astro 5 frontend + Strapi v5 backend).

The migration follows a **zero-downtime, instant-rollback** approach using Cloudflare's DNS proxy and global edge network. Given the current site's critical failures (51 critical issues, multiple 404s, server errors), this migration is both urgent and high-risk — necessitating rigorous preparation and rehearsal.

---

## 2. DNS Architecture Overview

### 2.1 Current State (Legacy)

```
Internet User
      ↓
  twinmos.com
      ↓
[Legacy Hosting Provider]
  WordPress/WooCommerce
  (Broken — 404s, server errors, broken images)
```

### 2.2 Future State (New Platform)

```
Internet User
      ↓
  twinmos.com
      ↓
[Cloudflare Global Edge]
      ├── Static Content → Cloudflare Pages (Astro 5)
      ├── API Calls → Hetzner CX32 VPS (Strapi v5 + PostgreSQL + MeiliSearch)
      ├── Images → ImgProxy (self-hosted on Hetzner) + Backblaze B2
      └── CDN Cache → Cloudflare Edge Caching
```

### 2.3 Key DNS Records

| Record | Type | Current Value | Future Value | Purpose |
|--------|------|---------------|--------------|---------|
| `twinmos.com` | A | [Legacy IP] | Cloudflare Pages / Origin | Primary domain |
| `www.twinmos.com` | CNAME | [Legacy host] | `twinmos.com` | WWW redirect |
| `admin.twinmos.com` | A | — | Hetzner VPS IP | Strapi CMS admin |
| `preview.twinmos.com` | A | — | Cloudflare Pages / Staging | Soft launch preview |
| `api.twinmos.com` | A | — | Hetzner VPS IP | Strapi API endpoint |
| `cdn.twinmos.com` | CNAME | — | Cloudflare | Asset delivery (optional) |
| `status.twinmos.com` | CNAME | — | UptimeRobot status page | Public status page |

---

## 3. Pre-Migration Preparation

### 3.1 Timeline (T-Minus Countdown)

| Phase | Timing | Activities |
|-------|--------|------------|
| **T-7 Days** | 1 week before launch | Audit all existing DNS records; document TTLs; identify unused records |
| **T-3 Days** | 72 hours before | Reduce TTL on all mutable records to 300 seconds (5 minutes) |
| **T-1 Day** | 24 hours before | Final DNS configuration prepared but not published; dry-run checklist complete |
| **T-2 Hours** | Pre-cutover | War room active; monitoring dashboards open; rollback script tested |
| **T-Zero** | Cutover moment | Update DNS A/CNAME records; purge CDN cache; smoke test |
| **T+15 Min** | Post-cutover | Verify global propagation; monitor error rates; confirm forms functional |
| **T+24 Hrs** | Day after | Review metrics; confirm stability; restore TTLs to standard (1 hour) |

### 3.2 TTL Reduction Strategy

Standard DNS TTLs are 3600–86400 seconds (1–24 hours). To enable rapid rollback, TTLs must be reduced before cutover.

| Record | Standard TTL | Pre-Cutover TTL | Post-Cutover TTL |
|--------|-------------|-----------------|------------------|
| `twinmos.com` A | 3600s | 300s | 3600s |
| `www.twinmos.com` CNAME | 3600s | 300s | 3600s |
| `admin.twinmos.com` A | 3600s | 300s | 3600s |
| `api.twinmos.com` A | 3600s | 300s | 3600s |
| MX (email) | 3600s | 3600s (unchanged) | 3600s |
| TXT (SPF/DKIM/DMARC) | 3600s | 3600s (unchanged) | 3600s |

> **Note:** MX and TXT records for email should NOT have TTL reduced to avoid email delivery disruption.

### 3.3 Pre-Migration Checklist

| # | Checklist Item | Status | Owner | Evidence |
|---|---------------|--------|-------|----------|
| 3.3.1 | Cloudflare account configured for twinmos.com | ☐ | IT Lead | Dashboard access |
| 3.3.2 | All DNS records documented (current state) | ☐ | IT Lead | DNS export CSV |
| 3.3.3 | New origin endpoints tested and stable | ☐ | Dev A | Health check green |
| 3.3.4 | SSL certificate installed and valid on new origin | ☐ | Dev A | SSL Labs test |
| 3.3.5 | Cloudflare Pages custom domain configured (`twinmos.com`) | ☐ | Dev A | Pages dashboard |
| 3.3.6 | Hetzner VPS firewall rules configured (Cloudflare IP ranges only) | ☐ | Dev B | Firewall config |
| 3.3.7 | Rollback script tested and documented | ☐ | IT Lead | Test execution log |
| 3.3.8 | DNS change notification sent to stakeholders | ☐ | IT Lead | Email sent |
| 3.3.9 | Monitoring alerts configured for DNS-specific errors | ☐ | Dev A | Alert rules |
| 3.3.10 | Stakeholder communication plan ready (internal + external) | ☐ | Marketing | Comms draft |

---

## 4. Migration Runbook

### 4.1 Rollback-First Design

Every step in this runbook is reversible within **5 minutes** (TTL × 2 propagation buffer).

**Rollback trigger conditions:**
- S1 defect discovered within 30 minutes of cutover
- Error rate spike > 1% in Sentry
- UptimeRobot reports downtime from 2+ regions
- Chairman or GM requests immediate rollback

### 4.2 Step-by-Step Cutover

#### Phase 1: Pre-Cutover Verification (T-2 Hours)

```bash
# 1. Verify new origin health
curl -I https://twinmos.com --resolve twinmos.com:443:[NEW_ORIGIN_IP]
# Expected: HTTP 200, Server: cloudflare, Content-Type: text/html

# 2. Verify API health
curl https://api.twinmos.com/api/health
# Expected: {"status":"ok","version":"1.0.0"}

# 3. Verify admin accessibility
curl -I https://admin.twinmos.com/admin
# Expected: HTTP 200

# 4. Verify SSL certificate
echo | openssl s_client -servername twinmos.com -connect twinmos.com:443 2>/dev/null | openssl x509 -noout -dates -subject
# Expected: Valid dates, Subject: CN=twinmos.com

# 5. Verify from multiple global locations (using VPN or online tools)
# - Dubai, UAE
# - Mumbai, India
# - London, UK
# - New York, USA
# - Singapore
```

#### Phase 2: DNS Update (T-Zero)

**Method: Cloudflare Dashboard (Primary)**

1. Log in to Cloudflare dashboard → Select `twinmos.com` zone.
2. Navigate to **DNS** → **Records**.
3. Update A record for `twinmos.com`:
   - Name: `@`
   - IPv4 address: `[CLOUDFLARE_PAGES_IP or CNAME to pages.dev]`
   - Proxy status: **Proxied** (orange cloud)
   - TTL: Auto (respects 300s pre-reduced value)
4. Update CNAME record for `www`:
   - Name: `www`
   - Target: `twinmos.com`
   - Proxy status: **Proxied**
5. Add/update `admin.twinmos.com` A record:
   - Name: `admin`
   - IPv4 address: `[HETZNER_VPS_IP]`
   - Proxy status: **DNS only** (gray cloud) — admin should not be CDN-cached
6. Add/update `api.twinmos.com` A record:
   - Name: `api`
   - IPv4 address: `[HETZNER_VPS_IP]`
   - Proxy status: **Proxied** (orange cloud) — API benefits from DDoS protection
7. Click **Save**.

**Method: CLI / API (Backup)**

```bash
# Using Cloudflare API (requires API token with Zone:Edit permission)
export CF_API_TOKEN="[TOKEN]"
export ZONE_ID="[ZONE_ID]"

# Update A record for root
curl -X PUT "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/[RECORD_ID]" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{
    "type": "A",
    "name": "twinmos.com",
    "content": "[NEW_IP]",
    "ttl": 300,
    "proxied": true
  }'

# Add admin subdomain (DNS only)
curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{
    "type": "A",
    "name": "admin",
    "content": "[HETZNER_IP]",
    "ttl": 300,
    "proxied": false
  }'
```

#### Phase 3: Post-DNS Verification (T+5 Minutes)

```bash
# 1. Check DNS propagation from multiple locations
dig +short twinmos.com @1.1.1.1
dig +short twinmos.com @8.8.8.8
dig +short twinmos.com @9.9.9.9
# Expected: All return new origin IP

# 2. HTTP smoke test
curl -s -o /dev/null -w "%{http_code}" https://twinmos.com
# Expected: 200

# 3. HTTPS + certificate verification
curl -v https://twinmos.com 2>&1 | grep -E "(subject:|issuer:|start date:|expire date:)"

# 4. Key page checks
pages=(
  "https://twinmos.com/"
  "https://twinmos.com/products/"
  "https://twinmos.com/about/"
  "https://twinmos.com/support/"
  "https://twinmos.com/contact/"
  "https://twinmos.com/products/memory/ddr5/voltx-udimm/"
  "https://twinmos.com/products/ssd/corex-pro/"
)
for page in "${pages[@]}"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "$page")
  echo "$page → $status"
done
# Expected: All 200

# 5. API endpoint check
curl -s https://api.twinmos.com/api/products | head -c 200
# Expected: Valid JSON response

# 6. Form submission test
curl -X POST https://api.twinmos.com/api/form-submissions \
  -H "Content-Type: application/json" \
  -d '{"type":"general","name":"DNS Test","email":"test@twinmos.com","message":"Migration smoke test"}'
# Expected: 200 OK, confirmation email received
```

#### Phase 4: Global Propagation Verification (T+15 Minutes)

Use online tools to verify from global vantage points:
- https://www.whatsmydns.net (type: A, name: twinmos.com)
- https://dnschecker.org
- https://gtmetrix.com (performance from multiple regions)

Target regions for verification:
- Middle East (Dubai, Riyadh)
- South Asia (Mumbai)
- Europe (London, Frankfurt)
- North America (New York, Los Angeles)
- Southeast Asia (Singapore, Hong Kong)
- Africa (Cape Town, Lagos)

#### Phase 5: Monitoring & Stability (T+1 Hour to T+24 Hours)

| Time | Action | Owner |
|------|--------|-------|
| T+15 min | Verify Sentry error dashboard — zero unexpected errors | Dev A |
| T+30 min | Verify Plausible/GA4 receiving traffic | Marketing |
| T+1 hr | First metrics review (page views, bounce rate, load time) | Dev A |
| T+2 hrs | Form submission verification (contact, newsletter, warranty) | Dev B |
| T+4 hrs | CDN cache hit ratio check | Dev A |
| T+8 hrs | Second metrics review; compare to baseline | Marketing |
| T+24 hrs | Full day report; restore DNS TTLs to standard | IT Lead |

---

## 5. Rollback Procedure

### 5.1 Instant Rollback (Emergency — < 5 Minutes)

If critical issues are detected within 30 minutes of cutover:

1. **Cloudflare Dashboard:**
   - Navigate to DNS → Records.
   - Revert `twinmos.com` A record to legacy IP.
   - Save.

2. **CLI Method:**
   ```bash
   curl -X PUT "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/[RECORD_ID]" \
     -H "Authorization: Bearer $CF_API_TOKEN" \
     -H "Content-Type: application/json" \
     --data '{
       "type": "A",
       "name": "twinmos.com",
       "content": "[LEGACY_IP]",
       "ttl": 300,
       "proxied": true
     }'
   ```

3. **Purge Cloudflare cache:**
   - Caching → Purge Everything.

4. **Verify rollback:**
   ```bash
   curl -s -o /dev/null -w "%{http_code}" https://twinmos.com
   # Expected: 200 (legacy site)
   ```

5. **Notify stakeholders** via #launch-war-room Slack.

### 5.2 Staged Rollback (Planned — If Issues Found After T+30 Min)

If issues emerge after initial stability but before full confidence:

1. Enable Cloudflare "Always Online" with cached static pages.
2. Investigate root cause on new origin.
3. Fix and re-deploy.
4. Re-attempt cutover after QA re-validation.

### 5.3 Rollback Decision Matrix

| Condition | Action | Authority |
|-----------|--------|-----------|
| Error rate > 1% for > 5 minutes | Instant rollback | Dev A (execute) / IT Lead (approve) |
| Any S1 defect affecting > 10% of users | Instant rollback | QA Lead |
| UptimeRobot reports downtime from 2+ regions | Instant rollback | Dev A |
| Chairman or GM requests rollback | Instant rollback | Chairman |
| Performance degradation (LCP > 4s for > 10 min) | Staged rollback | IT Lead |
| Form delivery failure | Staged rollback | Dev B |

---

## 6. Post-Migration Tasks

### 6.1 Immediate (T+24 Hours)

| # | Task | Owner | Status |
|---|------|-------|--------|
| 6.1.1 | Restore DNS TTLs to standard values (3600s) | IT Lead | ☐ |
| 6.1.2 | Verify email deliverability unaffected (SPF/DKIM/DMARC) | Dev B | ☐ |
| 6.1.3 | Confirm no mixed-content warnings (HTTP assets on HTTPS) | Dev A | ☐ |
| 6.1.4 | Verify www → non-www redirect works | Dev A | ☐ |
| 6.1.5 | Verify admin.twinmos.com accessible only to authorized IPs | Dev B | ☐ |
| 6.1.6 | Archive legacy DNS configuration for reference | IT Lead | ☐ |

### 6.2 Short-Term (Week 1)

| # | Task | Owner | Status |
|---|------|-------|--------|
| 6.2.1 | Monitor for DNS propagation stragglers (some ISPs cache longer) | IT Lead | ☐ |
| 6.2.2 | Update any hardcoded IP references in documentation | Dev A | ☐ |
| 6.2.3 | Verify search engine crawling unaffected (Google Search Console) | Marketing | ☐ |
| 6.2.4 | Confirm SSL certificate auto-renewal scheduled | IT Lead | ☐ |
| 6.2.5 | Update internal wiki/network docs with new DNS records | IT Lead | ☐ |

### 6.3 Long-Term (Ongoing)

- Quarterly DNS record audit.
- Annual DNS provider/security review.
- Monitor for DNS hijacking or unauthorized changes.

---

## 7. Risk Register

| ID | Risk | Probability | Impact | Mitigation |
|----|------|-------------|--------|------------|
| R-DNS-1 | DNS propagation takes longer than TTL (ISP caching) | Medium | Medium | Reduce TTL 72h in advance; use Cloudflare anycast |
| R-DNS-2 | Email deliverability disrupted by DNS changes | Low | High | Do not modify MX/TXT records during cutover; verify post-cutover |
| R-DNS-3 | SSL certificate mismatch on new origin | Low | High | Pre-install and test certificate; use Cloudflare Origin CA |
| R-DNS-4 | DDoS during cutover window | Very Low | Critical | Cloudflare proxy active; under-attack mode ready |
| R-DNS-5 | Registrar lock prevents DNS changes | Very Low | High | Verify registrar access 1 week before; unlock if needed |
| R-DNS-6 | Subdomain (admin/api) exposed to public | Low | High | admin.twinmos.com set to DNS-only; IP-restricted firewall |
| R-DNS-7 | Rollback fails (legacy origin already decommissioned) | Very Low | Critical | Keep legacy origin running for 48h post-launch |

---

## 8. Contact List (Migration War Room)

| Role | Name | Phone | Slack | Availability |
|------|------|-------|-------|--------------|
| IT/Technical Lead | | | @it-lead | 24/7 during cutover window |
| Dev A (Frontend/Cloudflare) | | | @dev-a | 24/7 during cutover window |
| Dev B (Backend/Strapi) | | | @dev-b | 24/7 during cutover window |
| QA Lead | | | @qa-lead | On-call |
| Marketing Director | | | @marketing-dir | Business hours + on-call |
| Cloudflare Support | N/A | N/A | N/A | https://support.cloudflare.com |
| Hetzner Support | N/A | N/A | N/A | https://www.hetzner.com/support |

---

*This plan is a sub-document of the Master Launch Plan (`TwinMOSWebsiteLaunch_Plan.md`). All DNS changes are logged in Cloudflare audit log and project issue tracker.*
