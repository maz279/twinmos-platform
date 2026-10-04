# TwinMOS Website — Alerting Rules

**Document ID:** H.5-007  
**Version:** 1.0  
**Status:** [M] Must-Have  
**Priority:** P1  
**Owner:** DevOps Lead / On-Call Engineer  
**Date:** 2026-05-01  
**Review Cycle:** Monthly

---

## 1. Purpose & Scope

This document defines all alerting rules for the TwinMOS website monitoring stack. It covers thresholds, routing, escalation, and notification channels for alerts originating from Sentry, UptimeRobot, Grafana/Loki, Cloudflare, and custom health checks.

**Scope:**
- Alert severity classification
- Threshold definitions by component
- Notification routing and channels
- Escalation procedures
- Alert fatigue prevention (grouping, silencing)
- On-call rotation

**Out of scope:** Manual monitoring procedures (covered in runbooks).

---

## 2. Alert Severity Framework

### 2.1 Severity Definitions

| Severity | Response Time | Impact | Examples | Page? |
|----------|--------------|--------|----------|-------|
| **P0 — Critical** | 5 minutes | Site down, data loss, security breach | All monitors down, DB unreachable, RCE detected | Yes |
| **P1 — High** | 15 minutes | Major feature degraded, significant user impact | Checkout failing, search down, 5xx spike | Yes |
| **P2 — Medium** | 1 hour | Partial degradation, workaround available | Slow queries, elevated errors, CDN cache miss spike | No (Slack) |
| **P3 — Low** | 4 hours | Minor issue, no user impact | Disk > 80%, staging failure, certificate expiry < 14d | No (Email) |
| **P4 — Info** | Next business day | Informational only | Weekly summary, version drift, budget alert | No (Dashboard) |

### 2.2 Severity Assignment Matrix

```
┌─────────────────┬─────────────┬─────────────┬─────────────┐
│     Metric      │  Critical   │    High     │   Medium    │
├─────────────────┼─────────────┼─────────────┼─────────────┤
│ Uptime          │   < 99.9%   │   < 99.5%   │   < 99%     │
│ Error Rate      │   > 10%     │   > 5%      │   > 1%      │
│ Response Time   │   > 5s      │   > 2s      │   > 1s      │
│ DB Connections  │   100% used │   > 90%     │   > 80%     │
│ Disk Usage      │   > 95%     │   > 90%     │   > 80%     │
│ Memory Usage    │   > 95%     │   > 90%     │   > 85%     │
│ Failed Logins   │   > 10/min  │   > 5/min   │   > 2/min   │
│ WAF Blocks      │   > 500/min │   > 200/min │   > 100/min │
└─────────────────┴─────────────┴─────────────┴─────────────┘
```

---

## 3. Alert Inventory

### 3.1 Infrastructure Alerts (Grafana/Prometheus)

| ID | Name | Query/Condition | Severity | For | Auto-Action |
|----|------|----------------|----------|-----|-------------|
| INF-01 | VPS CPU High | `cpu_usage > 90%` | P2 | 5m | None |
| INF-02 | VPS CPU Critical | `cpu_usage > 95%` | P1 | 3m | Notify |
| INF-03 | Memory High | `memory_usage > 85%` | P2 | 5m | None |
| INF-04 | Memory Critical | `memory_usage > 95%` | P1 | 3m | Notify |
| INF-05 | Disk Full Warning | `disk_usage > 80%` | P3 | 1h | None |
| INF-06 | Disk Full Critical | `disk_usage > 90%` | P2 | 5m | Notify |
| INF-07 | Disk Full Emergency | `disk_usage > 95%` | P1 | 1m | Notify |
| INF-08 | Load Average High | `load1 > 4` | P2 | 10m | None |
| INF-09 | OOM Events | `increase(oom_events[5m]) > 0` | P1 | 0m | Notify |
| INF-10 | Docker Container Down | `up{job="docker"} == 0` | P1 | 1m | Auto-restart |
| INF-11 | SSH Brute Force | `failed_ssh > 5 in 5m` | P2 | 2m | Block IP |
| INF-12 | Unusual Process | `new_process not in allowlist` | P1 | 0m | Notify |

### 3.2 Application Alerts (Sentry)

| ID | Name | Condition | Severity | For | Auto-Action |
|----|------|-----------|----------|-----|-------------|
| APP-01 | Error Spike | `errors > 50/min` | P1 | 2m | Notify |
| APP-02 | Error Flood | `errors > 200/min` | P0 | 1m | Notify |
| APP-03 | New Error Type | `new_issue + first_seen < 1h` | P2 | 0m | Notify |
| APP-04 | Unresolved Issue Spike | `regressed_issue count > 5` | P2 | 5m | Notify |
| APP-05 | Transaction Failure Rate | `failure_rate > 5%` | P1 | 5m | Notify |
| APP-06 | Slow Transaction | `p95_duration > 2s` | P2 | 10m | Notify |
| APP-07 | API 5xx Rate | `http_5xx > 1%` | P1 | 2m | Notify |
| APP-08 | API 4xx Spike | `http_4xx > 10%` | P2 | 5m | Notify |
| APP-09 | Strapi Admin Login Failure | `admin_login_fail > 3` | P2 | 5m | Notify |
| APP-10 | Database Query Slow | `db_query_p95 > 500ms` | P2 | 10m | Notify |
| APP-11 | Session Replay Error | `replay_error > 0` | P3 | 0m | Notify |
| APP-12 | Out of Memory (App) | `oom_killed > 0` | P1 | 0m | Notify |

### 3.3 Uptime Alerts (UptimeRobot)

| ID | Name | Condition | Severity | Check Interval | Locations |
|----|------|-----------|----------|----------------|-----------|
| UPT-01 | Production Down | `status != 200` | P0 | 60s | Global (5) |
| UPT-02 | API Health Down | `health != OK` | P0 | 60s | Global (5) |
| UPT-03 | Admin Panel Down | `status != 200` | P1 | 60s | Global (3) |
| UPT-04 | Staging Down | `status != 200` | P2 | 300s | Global (3) |
| UPT-05 | SSL Expiry Warning | `expires_in < 14 days` | P3 | Daily | — |
| UPT-06 | SSL Expiry Critical | `expires_in < 3 days` | P1 | Daily | — |
| UPT-07 | Response Time High | `response_time > 3s` | P2 | 60s | Global (5) |
| UPT-08 | Content Mismatch | `keyword missing` | P1 | 60s | Global (3) |

### 3.4 CDN/Edge Alerts (Cloudflare)

| ID | Name | Condition | Severity | For |
|----|------|-----------|----------|-----|
| CDN-01 | Origin Error Rate | `origin_5xx > 5%` | P1 | 5m |
| CDN-02 | Edge Error Rate | `edge_5xx > 1%` | P1 | 5m |
| CDN-03 | Cache Hit Ratio Low | `cache_hit < 70%` | P2 | 15m |
| CDN-04 | DDoS Detected | `waf_action = "block" AND rate > 1000/s` | P0 | 0m |
| CDN-05 | Bot Score Low | `bot_score_avg < 10` | P2 | 10m |
| CDN-06 | Origin Response Time | `origin_response_time_p95 > 2s` | P2 | 10m |
| CDN-07 | Rate Limit Triggered | `rate_limit_blocked > 100` | P2 | 5m |

### 3.5 Database Alerts (PostgreSQL)

| ID | Name | Condition | Severity | For |
|----|------|-----------|----------|-----|
| DB-01 | DB Down | `pg_up == 0` | P0 | 0m |
| DB-02 | Connection Pool Exhausted | `pg_connections / pg_max_connections > 0.9` | P1 | 2m |
| DB-03 | Replication Lag | `pg_replication_lag > 30s` | P1 | 5m |
| DB-04 | Slow Queries | `pg_slow_queries > 50/hour` | P2 | 10m |
| DB-05 | Deadlock Detected | `pg_deadlocks > 0` | P1 | 0m |
| DB-06 | Transaction ID Wraparound | `pg_xid_age > 1B` | P1 | 1h |
| DB-07 | Backup Failure | `last_backup_age > 26h` | P1 | 0m |
| DB-08 | WAL Archive Failure | `wal_archive_fail > 0` | P1 | 5m |

### 3.6 Security Alerts

| ID | Name | Condition | Severity | For |
|----|------|-----------|----------|-----|
| SEC-01 | SQL Injection Attempt | `waf_sql_pattern > 3 in 5m` | P0 | 1m |
| SEC-02 | XSS Attempt | `waf_xss_pattern > 3 in 5m` | P0 | 1m |
| SEC-03 | Path Traversal | `path_traversal_attempt > 0` | P1 | 0m |
| SEC-04 | Admin Panel Brute Force | `admin_login_fail > 5 in 5m` | P1 | 2m |
| SEC-05 | Unusual API Access Pattern | `api_anomaly_score > 0.9` | P2 | 10m |
| SEC-06 | Certificate Transparency | `new_cert_for_domain` | P3 | 0m |
| SEC-07 | Dependency Vulnerability | `snyk_critical > 0` | P1 | 0m |
| SEC-08 | Container Image Vulnerability | `trivy_critical > 0` | P1 | 0m |
| SEC-09 | Secret Leak Detected | `gitguardian_alert > 0` | P0 | 0m |
| SEC-10 | Privilege Escalation | `sudo_usage_unexpected > 0` | P1 | 0m |

---

## 4. Notification Routing

### 4.1 Channel Configuration

| Channel | Purpose | P0 | P1 | P2 | P3 |
|---------|---------|----|----|----|----|
| **PagerDuty** | On-call paging | Yes | Yes | No | No |
| **Slack #alerts-critical** | Real-time team alerts | Yes | Yes | No | No |
| **Slack #alerts-warning** | Non-urgent issues | No | No | Yes | No |
| **Email ops@twinmos.com** | Daily digest | No | No | No | Yes |
| **SMS (backup)** | P0 only | Yes | No | No | No |

### 4.2 Routing Rules

```yaml
# alertmanager-routing.yml
route:
  group_by: ['alertname', 'severity', 'service']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  receiver: default
  routes:
    # P0 — Critical: Page immediately
    - match:
        severity: critical
      receiver: pagerduty-critical
      group_wait: 10s
      repeat_interval: 5m
      continue: true
      routes:
        - match:
            alertname: ProductionDown
          receiver: sms-backup

    # P1 — High: Page + Slack
    - match:
        severity: high
      receiver: pagerduty-high
      group_wait: 30s
      repeat_interval: 15m
      continue: true

    # P2 — Medium: Slack only
    - match:
        severity: medium
      receiver: slack-warnings
      group_wait: 1m
      repeat_interval: 1h

    # P3 — Low: Email digest
    - match:
        severity: low
      receiver: email-ops
      group_wait: 5m
      repeat_interval: 24h

    # Security alerts → Security channel
    - match_re:
        alertname: SEC-.*
      receiver: slack-security
      continue: true

receivers:
  - name: default
    slack_configs:
      - api_url: '${SLACK_WEBHOOK_URL}'
        channel: '#alerts-general'

  - name: pagerduty-critical
    pagerduty_configs:
      - service_key: '${PAGERDUTY_CRITICAL_KEY}'
        severity: critical

  - name: pagerduty-high
    pagerduty_configs:
      - service_key: '${PAGERDUTY_HIGH_KEY}'
        severity: error

  - name: slack-warnings
    slack_configs:
      - api_url: '${SLACK_WEBHOOK_WARNINGS}'
        channel: '#alerts-warning'
        title: 'Warning: {{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'

  - name: slack-security
    slack_configs:
      - api_url: '${SLACK_WEBHOOK_SECURITY}'
        channel: '#security-alerts'
        title: 'Security Alert: {{ .GroupLabels.alertname }}'

  - name: email-ops
    email_configs:
      - to: 'ops@twinmos.com'
        from: 'alerts@twinmos.com'
        smarthost: 'smtp.resend.com:587'
        auth_username: '${RESEND_SMTP_USER}'
        auth_password: '${RESEND_SMTP_PASS}'
        headers:
          Subject: 'TwinMOS Daily Alert Digest'

  - name: sms-backup
    webhook_configs:
      - url: '${TWILIO_SMS_WEBHOOK}'
        send_resolved: false
```

---

## 5. Escalation Procedures

### 5.1 Escalation Matrix

| Time | P0 Action | P1 Action | P2 Action |
|------|-----------|-----------|-----------|
| T+0 | Page on-call | Page on-call | Slack notify |
| T+5m | SMS backup | — | — |
| T+10m | Escalate to lead | Escalate to lead | — |
| T+15m | All team paged | — | Email if unacknowledged |
| T+30m | Executive notification | Escalate to lead | — |

### 5.2 Auto-Remediation Actions

| Alert | Auto-Action | Condition | Safety |
|-------|-------------|-----------|--------|
| Docker container down | Restart container | < 3 restarts in 10m | Yes |
| High memory | Trigger GC | Node.js apps | Yes |
| SSH brute force | Block IP (1h) | > 5 failed attempts | Yes |
| 5xx spike | Scale up (Coolify) | > 10% for 2m | No (notify only) |
| DB connection pool | Increase pool size | < max limit | Yes |

```bash
# Auto-restart script (Coolify hook)
#!/bin/bash
# /opt/coolify/hooks/auto-restart.sh

CONTAINER=$1
RESTART_COUNT=$(docker inspect --format='{{.RestartCount}}' $CONTAINER)

if [ "$RESTART_COUNT" -lt 3 ]; then
  docker restart $CONTAINER
  curl -X POST "$SLACK_WEBHOOK" \
    -d "{\"text\":\"Auto-restarted $CONTAINER (restart #$RESTART_COUNT)\"}"
else
  # Too many restarts — alert for manual intervention
  curl -X POST "$PAGERDUTY_WEBHOOK" \
    -d "{\"service_key\":\"$PD_KEY\",\"incident_key\":\"$CONTAINER\",\"event_type\":\"trigger\",\"description\":\"Container $CONTAINER failing repeatedly\"}"
fi
```

---

## 6. Alert Fatigue Prevention

### 6.1 Grouping Rules

```yaml
# Group related alerts
group_by:
  - alertname      # Group same alert type
  - severity       # Group by severity
  - service        # Group by affected service
  - instance       # Group by server instance

# Example: All "High CPU" alerts from different nodes group into one notification
group_wait: 30s      # Wait for related alerts
group_interval: 5m   # Minimum time between group notifications
```

### 6.2 Inhibition Rules

```yaml
# Prevent redundant alerts
inhibit_rules:
  # If node is down, suppress all "instance unreachable" alerts
  - source_match:
      severity: critical
    target_match:
      severity: warning
    equal: ['instance']

  # If DB is down, suppress "slow query" alerts
  - source_match:
      alertname: DBDown
    target_match_re:
      alertname: DB-.*
    equal: ['instance']

  # If production is down, suppress staging alerts
  - source_match:
      alertname: ProductionDown
    target_match:
      environment: staging
```

### 6.3 Silencing Rules

| Scenario | Silence Duration | Authorized By |
|----------|-----------------|---------------|
| Planned maintenance | Maintenance window + 30m | DevOps Lead |
| Known issue being worked | Issue resolution + 1h | On-call engineer |
| False positive tuning | Until fix deployed | DevOps Lead |
| Holiday freeze | Freeze period | Engineering Manager |

```bash
# Create silence via Alertmanager API
curl -X POST http://alertmanager:9093/api/v1/silences \
  -H 'Content-Type: application/json' \
  -d '{
    "matchers": [
      {"name": "alertname", "value": "DiskFullWarning", "isRegex": false},
      {"name": "instance", "value": "staging.*", "isRegex": true}
    ],
    "startsAt": "2026-05-15T02:00:00Z",
    "endsAt": "2026-05-15T06:00:00Z",
    "createdBy": "devops-lead",
    "comment": "Staging maintenance window"
  }'
```

---

## 7. On-Call Rotation

### 7.1 Schedule

| Period | Primary | Secondary | Escalation |
|--------|---------|-----------|------------|
| Week 1 | Engineer A | Engineer B | DevOps Lead |
| Week 2 | Engineer B | Engineer A | DevOps Lead |
| Week 3 | Engineer A | Engineer B | DevOps Lead |
| Week 4 | Engineer B | Engineer A | DevOps Lead |

### 7.2 Handoff Checklist

- [ ] Review unresolved alerts from previous shift
- [ ] Check ongoing incidents
- [ ] Verify alert channels are functional
- [ ] Review any silences in place
- [ ] Confirm runbook access

### 7.3 Response SLA

| Severity | Acknowledge | Initial Response | Resolution Target |
|----------|------------|------------------|-------------------|
| P0 | 5 min | 15 min | 1 hour |
| P1 | 15 min | 30 min | 4 hours |
| P2 | 1 hour | 2 hours | 24 hours |
| P3 | 4 hours | 8 hours | 72 hours |

---

## 8. Alert Testing

### 8.1 Monthly Fire Drill

| Week | Test | Expected Result |
|------|------|----------------|
| 1 | Trigger test P0 alert | Page received within 30s |
| 2 | Test auto-restart | Container restarts, alert clears |
| 3 | Test escalation | Lead notified after 10m |
| 4 | Test silence creation | Alert suppressed, resume after expiry |

### 8.2 Alert Validation Script

```bash
#!/bin/bash
# test-alerts.sh

echo "Testing alert pipeline..."

# Test P0 — Critical
curl -X POST http://alertmanager:9093/api/v1/alerts \
  -H 'Content-Type: application/json' \
  -d '[{
    "labels": {"alertname": "TestCritical", "severity": "critical", "service": "test"},
    "annotations": {"summary": "TEST: Critical alert pipeline"},
    "startsAt": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  }]'

# Wait and verify
echo "Check PagerDuty and Slack for test alert"
echo "Press enter after verifying..."
read

# Clear test alert
curl -X POST http://alertmanager:9093/api/v1/alerts \
  -H 'Content-Type: application/json' \
  -d '[{
    "labels": {"alertname": "TestCritical", "severity": "critical", "service": "test"},
    "annotations": {"summary": "TEST: Critical alert pipeline"},
    "startsAt": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
    "endsAt": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  }]'

echo "Test complete. Verify resolved notification received."
```

---

## 9. Maintenance

### 9.1 Monthly Review

- [ ] Review alert false positive rate (target: < 5%)
- [ ] Adjust thresholds based on trend data
- [ ] Update routing rules for team changes
- [ ] Verify on-call rotation is current
- [ ] Review and clean up stale silences
- [ ] Test all notification channels

### 9.2 Threshold Tuning Process

```
1. Identify noisy alert ( > 3 false positives/week )
2. Analyze historical data for 2 weeks
3. Propose new threshold with data justification
4. Update rule in Git (PR required)
5. Deploy and monitor for 1 week
6. Evaluate and adjust
```

---

## 10. Related Documents

| Document | ID | Relationship |
|----------|-----|-------------|
| Monitoring Architecture Overview | H.5-001 | Parent architecture |
| Log Aggregation Strategy | H.5-006 | Log-based alert sources |
| Dashboard Design | H.5-008 | Alert visualization |
| Incident Response Runbook | H.4-005 | Response procedures |
| Security Incident Runbook | H.4-006 | Security alert response |
| Sentry Configuration | H.5-002 | Application alert source |
| UptimeRobot Setup | H.5-003 | Uptime alert source |

---

## 11. Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-01 | DevOps Lead | Initial version |

---

*This document is a living specification. Update when adding new alerts, changing thresholds, or modifying routing/escalation procedures.*
