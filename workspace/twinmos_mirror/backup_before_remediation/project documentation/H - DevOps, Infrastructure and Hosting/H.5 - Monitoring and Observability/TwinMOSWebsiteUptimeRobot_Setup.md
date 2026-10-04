# TwinMOS Website — UptimeRobot Setup Guide

**Document ID:** H.5-005  
**Version:** 1.0  
**Status:** Active  
**Owner:** Tech Lead  
**Last Updated:** 2026-05-01  
**Related:** TwinMOSWebsiteMonitoring_Specification.md · TwinMOSWebsiteAlerting_Rules.md · TwinMOSWebsiteSLISLODefinitions.md · TwinMOSWebsiteSSLCertificateRenewal_Runbook.md

---

## 1. Account Configuration

```
Provider:  UptimeRobot Pro
Plan:      Pro ($7/month — 50 monitors, 1-min check intervals, 6-month log retention)
Account:   devops@twinmos.com
2FA:       Required (TOTP)
```

**Why UptimeRobot Pro over free tier:**
- 1-minute check intervals (free = 5 min — too slow for production SLO tracking)
- SSL monitoring with configurable expiry alert thresholds
- Status page (public-facing status.twinmos.com)
- 6-month uptime history for SLO reporting
- Advanced alert contacts (Slack webhook, email, SMS)

---

## 2. Monitor Inventory

### 2.1 Production Monitors

| Monitor ID | Friendly Name | URL / Target | Type | Interval | Alert Contacts |
|-----------|--------------|-------------|------|----------|----------------|
| MON-001 | TwinMOS Homepage | https://twinmos.com | HTTP(S) | 5 min | Email + Slack #ops |
| MON-002 | TwinMOS API Health | https://api.twinmos.com/api/_health | HTTP(S) | 5 min | Email + Slack #ops |
| MON-003 | Strapi Admin Panel | https://admin.twinmos.com/admin | HTTP(S) | 5 min | Email |
| MON-004 | MeiliSearch Health | https://search.twinmos.com/health | HTTP(S) | 5 min | Email + Slack #alerts |
| MON-005 | ImgProxy Health | https://imgproxy.twinmos.com/health | HTTP(S) | 10 min | Email |
| MON-006 | Plausible Analytics | https://analytics.twinmos.com | HTTP(S) | 10 min | Email |
| MON-007 | Homepage Keyword Check | https://twinmos.com | Keyword | 5 min | Email + Slack #ops |
| MON-008 | PostgreSQL Port | <hetzner-ip>:5432 | Port | 10 min | Email |

### 2.2 Staging Monitors

| Monitor ID | Friendly Name | URL | Type | Interval | Alert Contacts |
|-----------|--------------|-----|------|----------|----------------|
| MON-009 | Staging Homepage | https://staging.twinmos.com | HTTP(S) | 15 min | Email only |
| MON-010 | Staging API | https://staging-api.twinmos.com/api/_health | HTTP(S) | 15 min | Email only |

### 2.3 SSL Certificate Monitors

| Monitor ID | Friendly Name | Domain | Type | Check Interval | Alert At |
|-----------|--------------|--------|------|---------------|---------|
| MON-011 | SSL — twinmos.com | twinmos.com | SSL | Daily | 14 days before expiry |
| MON-012 | SSL — api.twinmos.com | api.twinmos.com | SSL | Daily | 14 days before expiry |
| MON-013 | SSL — admin.twinmos.com | admin.twinmos.com | SSL | Daily | 14 days before expiry |
| MON-014 | SSL — search.twinmos.com | search.twinmos.com | SSL | Daily | 14 days before expiry |
| MON-015 | SSL — staging.twinmos.com | staging.twinmos.com | SSL | Daily | 14 days before expiry |

---

## 3. Monitor Configuration Details

### 3.1 HTTP(S) Monitor Configuration

Settings applied to all HTTP(S) monitors:

```
Monitor Type: HTTP(S)
HTTP Method: GET
Expected Status Code: 200
Follow Redirects: Yes (up to 3 redirects)
Ignore SSL Errors: No (must be No — we want to detect SSL issues)
Alert After: 2 consecutive failures (prevents false alarms from transient issues)
Alert Type: Down + Recovery (alert when service goes down AND when it comes back up)
```

### 3.2 MON-001 — Homepage Configuration

```
Friendly Name: TwinMOS Homepage
URL: https://twinmos.com
Monitoring Interval: Every 5 minutes
Request Timeout: 30 seconds
HTTP Method: GET
Expected HTTP Status: 200

Expected HTTP Response Headers:
  CF-Cache-Status: (any) — confirms Cloudflare is in path
  
Notes: Will alert via Slack #ops and email on failure.
       Recovery notification: Yes
```

### 3.3 MON-002 — API Health Configuration

```
Friendly Name: TwinMOS API Health
URL: https://api.twinmos.com/api/_health
Monitoring Interval: Every 5 minutes
Request Timeout: 30 seconds
HTTP Method: GET
Expected HTTP Status: 200

Response Keyword Check:
  Keyword: "running"
  Keyword Type: Must exist

Notes: Strapi health endpoint returns {"data":{"server":"running"}}
       Alert if "running" keyword not found.
```

### 3.4 MON-007 — Homepage Keyword Monitor

```
Friendly Name: TwinMOS Homepage Content Check
URL: https://twinmos.com
Monitor Type: Keyword
Keyword: TwinMOS Technologies
Keyword Type: Must exist
Monitoring Interval: Every 5 minutes

Purpose: Detects content defacement or total page render failure.
         If the homepage renders but "TwinMOS Technologies" is missing,
         it means the content failed to load or was replaced.
         Alert via Slack #ops — treat as P0 (possible defacement).
```

### 3.5 MON-008 — PostgreSQL Port Monitor

```
Friendly Name: PostgreSQL Port Check
Host: <hetzner-production-ip>
Port: 5432
Monitoring Interval: Every 10 minutes

Notes: Only confirms PostgreSQL TCP port is open.
       Does not verify query execution (use API health for end-to-end).
       This detects if PostgreSQL container is completely down.
       
IMPORTANT: Port 5432 should NOT be accessible from the internet.
           This monitor uses UptimeRobot's probe servers.
           Hetzner firewall should allow 5432 only from specific IPs.
           If firewall blocks all external access to 5432, this monitor
           will always show DOWN — disable it and rely on API health check instead.
```

---

## 4. Alert Contacts Configuration

### 4.1 Create Alert Contacts

```
UptimeRobot → My Settings → Alert Contacts → Add Alert Contact

Contact 1 — Email (Primary)
  Alert Contact Type: E-mail
  Friendly Name: TwinMOS DevOps Email
  Email address: devops@twinmos.com

Contact 2 — Slack #ops (Critical Alerts)
  Alert Contact Type: Slack
  Friendly Name: TwinMOS Slack #ops
  Webhook URL: [SLACK_WEBHOOK_OPS from Bitwarden]
  Integration: Select #ops channel

Contact 3 — Slack #alerts (Warnings)
  Alert Contact Type: Slack
  Friendly Name: TwinMOS Slack #alerts
  Webhook URL: [SLACK_WEBHOOK_ALERTS from Bitwarden]
  Integration: Select #alerts channel
```

### 4.2 Alert Contact Assignment

| Monitor | Contacts |
|---------|---------|
| MON-001 Homepage | Email + Slack #ops |
| MON-002 API Health | Email + Slack #ops |
| MON-003 Admin Panel | Email only |
| MON-004 Search Health | Email + Slack #alerts |
| MON-005 ImgProxy | Email only |
| MON-006 Plausible | Email only |
| MON-007 Keyword Check | Email + Slack #ops |
| MON-008 PostgreSQL Port | Email only |
| MON-009/010 Staging | Email only |
| MON-011–015 SSL | Email + Slack #alerts |

---

## 5. Public Status Page

### 5.1 Status Page Configuration

```
UptimeRobot → Status Pages → Add Status Page

Configuration:
  Friendly Name: TwinMOS Website Status
  URL slug: twinmos
  Public URL: https://stats.uptimerobot.com/twinmos (free plan default)
              OR: https://status.twinmos.com (custom domain — requires Pro)

Custom Domain Setup:
  status.twinmos.com → CNAME → stats.uptimerobot.com
  (Add in Cloudflare DNS — NOT proxied — DNS only mode)

Monitors to Include (public-facing only):
  ✅ TwinMOS Homepage (MON-001)
  ✅ TwinMOS API (MON-002)
  ✅ Search (MON-004)
  ❌ Admin Panel (exclude — internal only)
  ❌ PostgreSQL Port (exclude — internal only)
  ❌ Staging (exclude — internal only)

Password Protection: No (public status page)

Branding:
  Page Title: TwinMOS Website Status
  Description: Current operational status of TwinMOS website services
  Logo: TwinMOS logo URL (from B2 media bucket)

Maintenance Windows: Add scheduled maintenance windows to suppress false alarms
```

### 5.2 Incident Communication via Status Page

During an incident, update the status page with custom message:

```
UptimeRobot → Status Pages → twinmos → Add Incident

Title: Service Disruption — API [date]
Message: "We are investigating reports of slow API responses.
          Our team is working on a resolution.
          Next update: [time UTC]"
Status: [Investigating / Identified / Monitoring / Resolved]
```

---

## 6. Maintenance Windows

Add maintenance windows to suppress alerts during planned maintenance:

```
UptimeRobot → Maintenance Windows → Add Maintenance Window

Production Deployments (Backend):
  Name: Backend Deploy Window
  Friendly Name: Scheduled Backend Maintenance
  Type: Once / Recurring Weekly
  Start Time: Tuesday 10:00 UTC
  Duration: 30 minutes
  Monitors: All production monitors

Hetzner Server Restart (Post-Resize):
  Name: Server Restart Window
  Type: Once (set date/time manually)
  Duration: 15 minutes
  Monitors: All production monitors

Note: Add maintenance windows BEFORE performing the maintenance.
      Remove or deactivate after maintenance is complete.
```

---

## 7. SLA Reporting

### 7.1 Monthly Uptime Report

UptimeRobot Pro generates monthly uptime reports:

```
UptimeRobot → Reports → Monthly

Metrics available:
  - Overall uptime percentage per monitor
  - Downtime events with duration
  - Average response time per monitor

Target (from TwinMOSWebsiteSLISLODefinitions.md):
  Homepage uptime: ≥ 99.9% monthly
  API uptime: ≥ 99.9% monthly
  Maximum downtime: 43.2 min/month

Calculation:
  99.9% = (total_minutes - downtime_minutes) / total_minutes × 100
  January: (44640 - 44.64) / 44640 × 100 = 99.9% → 44.64 min budget
```

### 7.2 Export for Stakeholder Reporting

```
UptimeRobot → API → Generate Read-Only API Key

Monthly export script:
```

```bash
#!/usr/bin/env bash
# export-uptime-report.sh — generates monthly uptime CSV

UPTIMEROBOT_API_KEY="<read-only-api-key>"
YEAR_MONTH=$(date -d 'last month' +%Y-%m)

curl -s -X POST "https://api.uptimerobot.com/v2/getMonitors" \
  -H "Content-Type: application/json" \
  -d "{
    \"api_key\": \"${UPTIMEROBOT_API_KEY}\",
    \"format\": \"json\",
    \"logs\": 1,
    \"logs_start_date\": \"$(date -d ${YEAR_MONTH}-01 +%s)\",
    \"logs_end_date\": \"$(date -d ${YEAR_MONTH}-01 +1month +%s)\"
  }" | jq -r '.monitors[] | [.friendly_name, .uptime_ratio, .status] | @csv'
```

---

## 8. Integrating UptimeRobot with Incident Response

### 8.1 Escalation Flow

```
UptimeRobot detects: homepage down (2 consecutive checks = 10 min)
    │
    ▼
Slack #ops: "🔴 TwinMOS Homepage is DOWN https://twinmos.com (started at [time UTC])"
Email to devops@twinmos.com: Same notification
    │
    ▼
Developer on duty acknowledges in Slack (#ops: "👀 Investigating")
    │
    │ Not acknowledged in 15 min
    ▼
Tech Lead direct message
    │
    │ SEV-1 confirmed
    ▼
Follow TwinMOSWebsiteDisasterRecoveryPlan.md §4 (Incident Response)
```

### 8.2 Recovery Notification

UptimeRobot also sends recovery notifications:

```
Slack #ops: "✅ TwinMOS Homepage is UP https://twinmos.com 
             (downtime: 14 min, started: [time], ended: [time])"
```

---

## 9. API Integration Examples

```bash
# Get all monitor statuses (read-only API key)
curl -s -X POST "https://api.uptimerobot.com/v2/getMonitors" \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "ur-read-only-key",
    "format": "json"
  }' | jq '.monitors[] | {name: .friendly_name, status: .status, uptime: .uptime_ratio}'

# Status codes:
# 0 = Paused
# 1 = Not checked yet
# 2 = Up ✅
# 8 = Seems down ⚠️
# 9 = Down ❌

# Get uptime stats for last 30 days
curl -s -X POST "https://api.uptimerobot.com/v2/getMonitors" \
  -d '{
    "api_key": "ur-read-only-key",
    "custom_uptime_ratios": "30",
    "format": "json"
  }' | jq '.monitors[] | {name: .friendly_name, uptime_30d: .custom_uptime_ratio}'
```

---

## 10. Troubleshooting

### False Positive (Monitor Shows Down, Site Is Up)

```
1. Immediately check from your browser: is the site actually up?
2. Check Cloudflare dashboard: any ongoing incident?
3. UptimeRobot probes from multiple global locations — check if only one region reports down:
   UptimeRobot → Monitor → Edit → Response times → Review by location

4. Common causes of false positives:
   a. UptimeRobot probe IP blocked by Cloudflare WAF (check CF Security Events)
      Fix: Whitelist UptimeRobot IP ranges in Cloudflare WAF if needed
      UptimeRobot IPs: https://uptimerobot.com/help/locations
   b. Slow response timeout (site responded in 31s but timeout is 30s)
      Fix: Increase timeout to 60s in monitor settings
   c. Transient network issue between UptimeRobot probe and Cloudflare
      Fix: Alert after 3 consecutive failures instead of 2

5. If false positive confirmed: pause the monitor, investigate, resume
```

### Monitor Not Sending Alerts

```
1. Check Alert Contact is correctly configured:
   UptimeRobot → Alert Contacts → [contact name] → Send Test Notification

2. Check Slack webhook is still valid:
   curl -X POST "${SLACK_WEBHOOK_OPS}" -d '{"text":"Test"}'

3. Check monitor has the alert contact assigned:
   UptimeRobot → Monitors → [monitor name] → Edit → Alert contacts

4. Check if monitor is in a maintenance window (suppressing alerts)
```

---

*Approved by: Chairman · Tech Lead*  
*Synchronized With: Technology Stack v1.1 §20.1*
