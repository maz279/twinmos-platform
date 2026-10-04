# TwinMOS Website — Alerting Rules

**Document ID:** H.5-002  
**Version:** 1.0  
**Status:** Active  
**Owner:** Tech Lead  
**Last Updated:** 2026-05-01  
**Related:** TwinMOSWebsiteMonitoring_Specification.md · TwinMOSWebsiteSLISLODefinitions.md · TwinMOSWebsiteUptimeRobot_Setup.md · TwinMOSWebsiteSentryConfigurationGuide.md

---

## 1. Severity Framework

| Level | Name | Examples | Ack Time | Resolution Target | Channel |
|-------|------|---------|---------|------------------|---------|
| **P0** | Critical | Website 100% down, complete API failure, DB unrecoverable | 15 min | ≤ 1 hour | Slack #ops + DM Tech Lead + Email |
| **P1** | High | Core feature broken (search down, images broken), API >5% error rate, Sentry spike | 30 min | ≤ 4 hours | Slack #ops + Email |
| **P2** | Medium | Non-critical service down (Plausible, ImgProxy degraded), SSL expiry <14d, error rate 1–5% | 2 hours | ≤ 24 hours | Slack #alerts + Email |
| **P3** | Low | Warning thresholds crossed, performance degradation, backup missing | 4 hours | Next business day | Slack #alerts |
| **P4** | Info | Deployment completed, cache purge triggered, low cache hit ratio | N/A | N/A | Slack #ops (bot message) |

---

## 2. Alerting Rules by Category

### 2.1 Uptime Alerts (UptimeRobot)

| Alert ID | Name | Condition | Severity | Configured In |
|----------|------|-----------|---------|---------------|
| UP-001 | Homepage Down | https://twinmos.com non-200 for 2 consecutive checks (5 min) | P0 | UptimeRobot |
| UP-002 | API Health Down | https://api.twinmos.com/api/_health non-200 for 2 checks | P0 | UptimeRobot |
| UP-003 | Strapi Admin Down | https://admin.twinmos.com/admin non-200 for 2 checks | P1 | UptimeRobot |
| UP-004 | Search Down | https://search.twinmos.com/health non-200 for 2 checks | P1 | UptimeRobot |
| UP-005 | ImgProxy Down | https://imgproxy.twinmos.com/health non-200 for 2 checks | P2 | UptimeRobot |
| UP-006 | Staging Down | https://staging.twinmos.com non-200 for 3 checks | P3 | UptimeRobot |
| UP-007 | Homepage Keyword Missing | "TwinMOS Technologies" not found on homepage | P1 | UptimeRobot keyword |
| UP-008 | SSL — twinmos.com expiring | Certificate expiry < 14 days | P1 | UptimeRobot SSL |
| UP-009 | SSL — api.twinmos.com expiring | Certificate expiry < 14 days | P1 | UptimeRobot SSL |
| UP-010 | SSL — Any service expiring | Any monitored SSL cert < 14 days | P2 | UptimeRobot SSL |

**UptimeRobot configuration:**
```
Alert contact for P0/P1: Email devops@twinmos.com + Slack #ops webhook
Alert contact for P2/P3: Email devops@twinmos.com + Slack #alerts webhook
Check failure threshold: 2 consecutive failures before alert fires
Recovery notification: Yes (alert when service restored)
```

### 2.2 Application Error Alerts (Sentry)

| Alert ID | Name | Condition | Severity | Configured In |
|----------|------|-----------|---------|---------------|
| SENTRY-001 | New Critical Error (Frontend) | Issue with critical priority created | P1 | Sentry Alert Rules |
| SENTRY-002 | Error Rate Spike (Frontend) | >50 errors/hour in twinmos-frontend | P1 | Sentry |
| SENTRY-003 | New Critical Error (Backend) | Issue with critical priority in twinmos-backend | P0 | Sentry |
| SENTRY-004 | Error Rate Spike (Backend) | >20 errors/hour in twinmos-backend | P1 | Sentry |
| SENTRY-005 | Regression | Previously resolved issue reoccurs | P2 | Sentry |
| SENTRY-006 | API Transaction P95 > 2s | Sentry Performance transaction p95 > 2000ms for 5 min | P1 | Sentry |
| SENTRY-007 | API Transaction P95 > 500ms | p95 > 500ms (warning, pre-alert) | P3 | Sentry |
| SENTRY-008 | LCP Degradation | P75 LCP > 4.0s on any key page | P1 | Sentry RUM |
| SENTRY-009 | INP Degradation | P75 INP > 500ms | P2 | Sentry RUM |
| SENTRY-010 | Release Error Spike | Error rate increases >2x within 30 min of a release | P1 | Sentry Release Health |

**Sentry alert configuration (YAML format for reference):**
```yaml
# Rule: SENTRY-003 — Backend Critical Error
alert_rule:
  name: "Backend Critical Error"
  query: "level:critical"
  timeWindow: 1
  aggregate: count()
  thresholds:
    critical: 1
    warning: null
  actions:
    - type: slack
      workspace: twinmos
      channel: "#ops"
      notes: "@tech-lead New critical backend error. Immediate investigation required."
    - type: email
      targetType: team
      targetIdentifier: twinmos-backend

# Rule: SENTRY-006 — API Latency
alert_rule:
  name: "API P95 Latency Critical"
  dataset: transactions
  query: "transaction.duration:>2000 event.type:transaction"
  timeWindow: 5
  aggregate: count()
  thresholds:
    critical: 10
  actions:
    - type: slack
      channel: "#ops"
```

### 2.3 Infrastructure Alerts (Coolify)

Coolify does not have native alerting webhooks in all versions. Use periodic checks via cron:

| Alert ID | Name | Condition | Severity | Implementation |
|----------|------|-----------|---------|----------------|
| INFRA-001 | CPU Critical | Hetzner CPU > 90% sustained 2 min | P0 | Coolify webhook / cron check |
| INFRA-002 | CPU Warning | Hetzner CPU > 70% sustained 5 min | P2 | Cron check |
| INFRA-003 | RAM Critical | Hetzner RAM > 90% | P0 | Cron check |
| INFRA-004 | RAM Warning | Hetzner RAM > 80% | P2 | Cron check |
| INFRA-005 | Disk Critical | Hetzner Disk > 80% | P1 | Cron check |
| INFRA-006 | Disk Warning | Hetzner Disk > 70% | P2 | Cron check |
| INFRA-007 | Container Restart Loop | Any container restarted > 3 times/hour | P1 | Cron check |
| INFRA-008 | Container Not Running | Any expected container stopped | P0 | Cron check |

**Cron-based infrastructure alert script:**

```bash
#!/usr/bin/env bash
# /opt/twinmos/monitoring/check-infra.sh
# Run every 5 minutes via cron: */5 * * * * /opt/twinmos/monitoring/check-infra.sh

SLACK_OPS="${SLACK_WEBHOOK_OPS}"
SLACK_ALERTS="${SLACK_WEBHOOK_ALERTS}"

notify() {
  local level="$1"
  local message="$2"
  local webhook="${SLACK_OPS}"
  [[ "${level}" == "P3" || "${level}" == "P4" ]] && webhook="${SLACK_ALERTS}"
  curl -s -X POST "${webhook}" -H "Content-Type: application/json" \
    -d "{\"text\":\"[${level}] TwinMOS: ${message}\"}" > /dev/null
}

# CPU check
CPU=$(docker stats --no-stream --format "{{.CPUPerc}}" twinmos-strapi-1 2>/dev/null | tr -d '%')
if [[ -n "${CPU}" ]] && (( $(echo "${CPU} > 90" | bc -l) )); then
  notify "P0" "CPU CRITICAL: ${CPU}% on Strapi container"
elif [[ -n "${CPU}" ]] && (( $(echo "${CPU} > 70" | bc -l) )); then
  notify "P2" "CPU WARNING: ${CPU}% on Strapi container"
fi

# RAM check (total server)
RAM_USED=$(free | awk '/^Mem:/ {printf "%.0f", $3/$2*100}')
if [[ "${RAM_USED}" -gt 90 ]]; then
  notify "P0" "RAM CRITICAL: ${RAM_USED}% used on production server"
elif [[ "${RAM_USED}" -gt 80 ]]; then
  notify "P2" "RAM WARNING: ${RAM_USED}% used on production server"
fi

# Disk check
DISK_USED=$(df / | awk 'NR==2 {print $5}' | tr -d '%')
if [[ "${DISK_USED}" -gt 80 ]]; then
  notify "P1" "DISK CRITICAL: ${DISK_USED}% used on root volume"
elif [[ "${DISK_USED}" -gt 70 ]]; then
  notify "P2" "DISK WARNING: ${DISK_USED}% used on root volume"
fi

# Container health check
EXPECTED_CONTAINERS="twinmos-strapi-1 twinmos-postgres-1 twinmos-meilisearch-1 twinmos-imgproxy-1 twinmos-redis-1"
for container in ${EXPECTED_CONTAINERS}; do
  STATUS=$(docker inspect --format="{{.State.Status}}" "${container}" 2>/dev/null || echo "missing")
  if [[ "${STATUS}" != "running" ]]; then
    notify "P0" "CONTAINER DOWN: ${container} is ${STATUS}"
  fi
done
```

### 2.4 CDN & Cache Alerts (Cloudflare)

These are monitored manually via Cloudflare Analytics. Cloudflare Pro sends email alerts for specific events.

| Alert ID | Name | Condition | Severity | Tool |
|----------|------|-----------|---------|------|
| CDN-001 | Cache Hit Ratio Critical | Overall cache hit ratio < 60% | P1 | Manual check (Cloudflare) |
| CDN-002 | Cache Hit Ratio Warning | Overall cache hit ratio < 75% | P3 | Manual check |
| CDN-003 | DDoS Attack Detected | Cloudflare detects DDoS pattern | P0 | Cloudflare email alert |
| CDN-004 | WAF Rate Spike | WAF blocks > 1000/min | P1 | Cloudflare email alert |
| CDN-005 | Error Rate | Cloudflare 5xx error rate > 5% | P1 | Manual check |
| CDN-006 | Pages Build Failed | Cloudflare Pages build failure | P2 | GitHub Actions notification |

**Enable Cloudflare email alerts:**
```
Cloudflare Dashboard → Notifications → Add Notification
  DDoS Attack: On
  Security Events: On (threshold 100 events/min)
  Health Check: On
  Email: devops@twinmos.com
```

### 2.5 Database Alerts

| Alert ID | Name | Condition | Severity | Implementation |
|----------|------|-----------|---------|----------------|
| DB-001 | Connection Pool Near Limit | Active connections > 70 | P2 | Cron + pg_stat_activity |
| DB-002 | Connection Pool Critical | Active connections > 90 | P0 | Cron + pg_stat_activity |
| DB-003 | Long-Running Query | Query duration > 30 seconds | P2 | Cron + pg_stat_activity |
| DB-004 | DB Unavailable | PostgreSQL not accepting connections | P0 | UptimeRobot port monitor |
| DB-005 | Disk Usage > 70% | PostgreSQL data volume > 70% full | P1 | Cron check |
| DB-006 | Replication Lag (P3) | Read replica lag > 5 minutes | P1 | Cron (Phase 3 only) |

**Database monitoring script:**

```bash
#!/usr/bin/env bash
# DB health check — add to /opt/twinmos/monitoring/check-db.sh

SLACK_OPS="${SLACK_WEBHOOK_OPS}"

# Connection count check
ACTIVE_CONNECTIONS=$(docker exec twinmos-postgres-1 psql -U strapi_user strapi_prod -t -c \
  "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';" 2>/dev/null | tr -d ' ')

if [[ "${ACTIVE_CONNECTIONS}" -gt 90 ]]; then
  curl -s -X POST "${SLACK_OPS}" \
    -d "{\"text\":\"[P0] DB connections CRITICAL: ${ACTIVE_CONNECTIONS}/100 active\"}"
elif [[ "${ACTIVE_CONNECTIONS}" -gt 70 ]]; then
  curl -s -X POST "${SLACK_OPS}" \
    -d "{\"text\":\"[P2] DB connections WARNING: ${ACTIVE_CONNECTIONS}/100 active\"}"
fi

# Long-running query check
LONG_QUERIES=$(docker exec twinmos-postgres-1 psql -U strapi_user strapi_prod -t -c \
  "SELECT count(*) FROM pg_stat_activity 
   WHERE (now() - query_start) > interval '30 seconds' 
   AND state = 'active';" 2>/dev/null | tr -d ' ')

if [[ "${LONG_QUERIES}" -gt 0 ]]; then
  curl -s -X POST "${SLACK_OPS}" \
    -d "{\"text\":\"[P2] ${LONG_QUERIES} query(ies) running > 30 seconds — check pg_stat_activity\"}"
fi
```

### 2.6 Security Alerts

| Alert ID | Name | Condition | Severity | Tool |
|----------|------|-----------|---------|------|
| SEC-001 | GitGuardian Secret Detected | Secret pattern in code commit | P0 | GitGuardian CI |
| SEC-002 | Snyk Critical Vulnerability | New critical CVE in dependency | P1 | Snyk (GitHub) |
| SEC-003 | WAF Block Spike | >500 blocks/5min | P1 | Cloudflare Notifications |
| SEC-004 | Admin Login Failures | >10 failed Strapi admin logins/5min | P1 | Sentry + WAF rate limit |
| SEC-005 | Suspicious IP Activity | Single IP making >100 req/min | P2 | Cloudflare WAF custom rule |
| SEC-006 | Content Defacement | Keyword monitor fails (homepage keyword missing) | P0 | UptimeRobot keyword |

### 2.7 CI/CD & Backup Alerts

| Alert ID | Name | Condition | Severity | Tool |
|----------|------|-----------|---------|------|
| CICD-001 | Production Deploy Failed | GitHub Actions deploy workflow failed | P1 | GitHub Actions → Slack |
| CICD-002 | CI Tests Failed | PR tests failed before merge | P2 | GitHub Actions → Slack |
| BACKUP-001 | Daily Backup Missing | No backup file for yesterday in B2 | P1 | verify-backup.sh → Slack |
| BACKUP-002 | Weekly Restore Test Failed | Dev restore test returned 0 products | P1 | restore-test.sh → Slack |

---

## 3. Notification Configuration

### 3.1 Slack Webhooks Setup

```
Create two Slack webhooks for the TwinMOS workspace:

Webhook 1 — #ops (for P0/P1 critical alerts):
  Slack → Apps → Incoming Webhooks → Add to #ops
  Name: TwinMOS Alerts — Critical
  URL: https://hooks.slack.com/services/<id>/<secret>
  Store as: SLACK_WEBHOOK_OPS in Coolify + GitHub Actions Secrets

Webhook 2 — #alerts (for P2/P3 warning alerts):
  Slack → Apps → Incoming Webhooks → Add to #alerts
  Name: TwinMOS Alerts — Warnings
  URL: https://hooks.slack.com/services/<id>/<secret>
  Store as: SLACK_WEBHOOK_ALERTS in Coolify + GitHub Actions Secrets
```

### 3.2 Sentry → Slack Integration

```
Sentry → twinmos org → Settings → Integrations → Slack
  Workspace: TwinMOS
  Authorize

Then per alert rule:
  Action: "Send a Slack notification to [#ops or #alerts]"
  With message: "[{project}] {issue_title} — {issue_url}"
```

### 3.3 UptimeRobot → Slack Integration

```
UptimeRobot → My Settings → Alert Contacts → Add Alert Contact
  Alert Contact Type: Slack
  Friendly Name: TwinMOS #ops
  Webhook URL: [SLACK_WEBHOOK_OPS]
```

---

## 4. Escalation Procedures

### 4.1 Standard Escalation

```
T+0:   Alert fires → Slack #alerts or #ops
T+15:  No acknowledgment → DM Tech Lead via Slack
T+30:  No acknowledgment → Call/WhatsApp Tech Lead
T+60:  No resolution in progress → Escalate to Chairman (SEV-1 only)
T+4h:  SEV-1 still unresolved → Consider external support (Cloudflare, Hetzner)
```

### 4.2 Alert Acknowledgment in Slack

When acknowledging an alert, post in the relevant Slack channel:

```
👀 Investigating [alert name] — @[your-name] — [timestamp UTC]
```

When resolved:

```
✅ [alert name] RESOLVED — Root cause: [1 sentence] — Duration: [X min]
```

---

## 5. Auto-Remediation

### 5.1 Container Auto-Restart (Coolify)

Coolify is configured to automatically restart crashed containers:
```
All services: Restart policy = unless-stopped
Restart delay: 5 seconds
Max restart attempts: 10 (Coolify default)
```

### 5.2 Automatic IP Block via Cloudflare

Cloudflare WAF rules automatically block:
- Known malicious IPs (Cloudflare threat intelligence)
- IPs exceeding rate limits (100 req/min → 10-min block)
- Requests from detected bot patterns

### 5.3 Automatic Cache Purge on Content Update

Strapi lifecycle hooks automatically purge Cloudflare cache on content publish — no manual intervention needed. See TwinMOSWebsiteCDNCachingStrategy.md §5.

---

## 6. Alert Fatigue Prevention

### 6.1 Grouping Windows

| Tool | Grouping Rule |
|------|--------------|
| Sentry | Group similar issues (same error type + stack trace) — only alert once per new issue type |
| UptimeRobot | Alert after 2 consecutive failures (not first failure) |
| Infrastructure cron | Alert at most once per 30 min per alert type (use lock file) |

### 6.2 Inhibition Rules (Suppress Derivative Alerts)

```
If UP-001 (Homepage Down) fires:
  → Suppress: SENTRY-001, SENTRY-002, CDN-005 (they are likely symptoms, not causes)

If INFRA-001 (CPU Critical) fires:
  → Alert on-call for root cause; suppress SENTRY-006 (API latency expected to degrade)

If BACKUP-001 (B2 outage) fires:
  → Suppress BACKUP-002 (restore test will also fail)
```

### 6.3 Business Hours Consideration

```
P3 and P4 alerts: Only send to Slack (not email/DM) — developers check Slack during hours
P0 and P1 alerts: Send at any hour (website has global users 24/7)

MENA peak traffic: 15:00–22:00 UTC (19:00–02:00 GST)
  → Higher alert sensitivity during these hours
  → Reduce P2/P3 threshold to catch issues before they impact peak traffic
```

---

## 7. Monthly Alert Review

Run on the first Monday of each month:

```
□ Review all alerts that fired in the past month (Sentry, UptimeRobot, Slack logs)
□ Identify:
  - False positives (alerts that fired but were not real issues)
  - False negatives (issues that occurred but no alert fired)
  - Alert fatigue (same alert fires too frequently)
□ Adjust thresholds or add/remove rules as needed
□ Update this document with any rule changes
□ Document review outcome in Slack #ops: "Alert review [month]: [N] rules adjusted"
```

---

## 8. Alert Fire Drill

Once per quarter, Tech Lead simulates an alert:

```bash
# Test Slack webhook is working
curl -X POST "${SLACK_WEBHOOK_OPS}" \
  -H "Content-Type: application/json" \
  -d '{"text":"[DRILL] Testing P0 alert channel — ignore this message"}'

# Test UptimeRobot notification
# UptimeRobot → Monitors → [any monitor] → Alert contacts → Send test alert

# Test Sentry alert
# Sentry → Alert Rules → [any rule] → Send Test Notification
```

---

*Approved by: Chairman · Tech Lead*  
*Synchronized With: Technology Stack v1.1 §20.3, §20.4*
