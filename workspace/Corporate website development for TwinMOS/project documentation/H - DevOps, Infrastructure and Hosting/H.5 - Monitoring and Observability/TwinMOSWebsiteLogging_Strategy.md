# TwinMOS Website — Logging Strategy

**Document ID:** H.5-003  
**Version:** 1.0  
**Status:** Active  
**Owner:** Tech Lead  
**Last Updated:** 2026-05-01  
**Related:** TwinMOSWebsiteMonitoring_Specification.md · TwinMOSWebsiteAlerting_Rules.md · TwinMOSWebsiteBackblazeB2Bucket_Spec.md · TwinMOSWebsiteSentryConfigurationGuide.md

---

## 1. Logging Strategy Overview

### 1.1 Objectives

1. Capture sufficient information to diagnose production issues within 30 minutes
2. Maintain audit trails for security and compliance (GDPR Article 30 Records of Processing)
3. Minimise cost — avoid logging noise that provides no diagnostic value
4. Protect user privacy — mask PII before storage

### 1.2 Phase Approach

| Phase | Log Infrastructure | Cost |
|-------|-------------------|------|
| P1 (current) | Docker JSON logs → Coolify dashboard; Cloudflare Logpush → B2 cold archive | ~$0.05/mo (B2 storage) |
| P2 | Add Vector agent → structured log forwarding; consider Loki for hot storage | ~$5–20/mo |
| P3 | Full Grafana + Loki stack; Prometheus for metrics; structured audit trail | ~$20–50/mo |

---

## 2. Log Sources

### 2.1 Source Inventory

| Source | Type | Estimated Volume (P1) | Estimated Volume (P3) |
|--------|------|----------------------|----------------------|
| Cloudflare Access Logs (Logpush) | Access, CDN, security | ~500K req/day → ~200 MB/day | ~5M req/day → 2 GB/day |
| Strapi application logs | Application errors, audit | ~10 MB/day | ~50 MB/day |
| Traefik access logs | Reverse proxy access | ~5 MB/day | ~20 MB/day |
| PostgreSQL slow query log | Database performance | ~1 MB/day | ~5 MB/day |
| MeiliSearch logs | Search queries, indexing | ~2 MB/day | ~10 MB/day |
| Plausible logs | Analytics application | ~1 MB/day | ~2 MB/day |
| System logs (journald) | OS-level, security events | ~5 MB/day | ~5 MB/day |
| Coolify/Docker daemon | Container lifecycle | ~1 MB/day | ~2 MB/day |
| **Total** | | **~225 MB/day** | **~2.1 GB/day** |

### 2.2 Log Classification

| Class | Retention | Examples | Storage |
|-------|-----------|---------|---------|
| Security | 2 years | Login attempts, WAF blocks, IP bans | Cloudflare B2 archive |
| Audit | 2 years | Content publish events, admin actions, env changes | Strapi audit + B2 |
| Application | 30 days | Strapi errors, API errors, unhandled exceptions | Docker logs + Sentry |
| Access | 90 days (hot) / 2 years (cold) | HTTP requests, response codes, cache status | Cloudflare Logpush → B2 |
| Performance | 30 days | Slow queries, high-latency traces | Sentry + PostgreSQL |
| Debug | 7 days | Verbose development logs | Docker logs only |

---

## 3. Phase 1 — Docker Log Management

### 3.1 Docker Logging Configuration

All containers use Docker's default `json-file` log driver with size rotation:

```json
// /etc/docker/daemon.json on Hetzner server
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m",
    "max-file": "5"
  }
}
```

This keeps the last 5 × 100 MB = 500 MB of logs per container on disk. Older logs are automatically rotated.

### 3.2 Viewing Logs

```bash
# SSH to Hetzner server
ssh deploy@<server-ip>

# View Strapi logs (last 100 lines)
docker logs --tail 100 twinmos-strapi-1

# Stream Strapi logs in real-time
docker logs -f twinmos-strapi-1

# Filter for errors only
docker logs twinmos-strapi-1 --since 1h 2>&1 | grep -iE "error|warn|exception"

# View PostgreSQL slow query log
docker logs twinmos-postgres-1 --since 1h 2>&1 | grep -i "duration"

# View Traefik access log
docker logs coolify-proxy --since 1h | grep -v "200 OK"

# View all container logs simultaneously
docker compose -f /data/coolify/docker-compose.yml logs --tail 50 --follow
```

### 3.3 Log Retention on Disk

```bash
# Check current log sizes
for container in twinmos-strapi-1 twinmos-postgres-1 twinmos-meilisearch-1 twinmos-redis-1; do
  SIZE=$(docker inspect "${container}" --format="{{.LogPath}}" | xargs ls -lh 2>/dev/null | awk '{print $5}')
  echo "${container}: ${SIZE}"
done

# Manual log cleanup if needed (also rotated automatically)
docker exec twinmos-strapi-1 sh -c "truncate -s 0 /tmp/strapi.log" 2>/dev/null || true
```

---

## 4. Cloudflare Logpush Configuration

### 4.1 Enable Logpush to Backblaze B2

Cloudflare Pro includes Logpush to S3-compatible storage. B2 is configured as the destination.

```
Cloudflare Dashboard → twinmos.com → Analytics & Logs → Logpush → Create a job

Destination type: Amazon S3 compatible
Access key ID: <B2 artifacts-key keyID>
Secret access key: <B2 artifacts-key applicationKey>
Endpoint URL: https://s3.us-west-002.backblazeb2.com
Bucket path: twinmos-logs-archive/cloudflare/

Dataset: HTTP requests (recommended)
Fields to log:
  ClientIP, ClientCountry, ClientRequestHost, ClientRequestMethod,
  ClientRequestURI, ClientRequestBytes, ClientRequestUserAgent,
  EdgeResponseStatus, EdgeResponseBytes, CacheCacheStatus,
  WAFAction, WAFRuleID, BotScore, EdgeStartTimestamp,
  OriginResponseDurationMs, EdgeTimeToFirstByteMs

Frequency: Every 5 minutes
Format: JSON Lines (one JSON object per line)
Compression: GZIP
```

### 4.2 Log Field Reference

| Field | Example | Use Case |
|-------|---------|---------|
| `ClientIP` | "203.0.113.42" | Security investigation (mask for GDPR — see §7) |
| `ClientCountry` | "AE" | Geographic analysis |
| `ClientRequestURI` | "/products/voltx-ddr5/" | URL analysis, 404 patterns |
| `EdgeResponseStatus` | 200 | Error rate calculation |
| `CacheCacheStatus` | "HIT" | Cache hit ratio analysis |
| `WAFAction` | "block" | Security event analysis |
| `BotScore` | 1 (bot) – 99 (human) | Bot traffic analysis |
| `OriginResponseDurationMs` | 45 | Origin latency monitoring |
| `EdgeTimeToFirstByteMs` | 12 | CDN latency monitoring |

### 4.3 Log Analysis Queries

Cloudflare logs stored in B2 are in gzip JSON Lines format. Query locally:

```bash
# Download a log file from B2
b2 download-file-by-name twinmos-logs-archive \
  "cloudflare/2026-01-01/00:00:00Z.log.gz" \
  /tmp/cf.log.gz

# Decompress and analyze
gunzip /tmp/cf.log.gz

# Error rate calculation
cat /tmp/cf.log | jq -r '.EdgeResponseStatus' | sort | uniq -c | sort -rn

# Top 404 URLs
cat /tmp/cf.log | jq -r 'select(.EdgeResponseStatus == 404) | .ClientRequestURI' \
  | sort | uniq -c | sort -rn | head 20

# Cache hit ratio
TOTAL=$(cat /tmp/cf.log | wc -l)
HITS=$(cat /tmp/cf.log | jq -r 'select(.CacheCacheStatus == "HIT")' | wc -l)
echo "Cache hit ratio: $(echo "scale=2; ${HITS}*100/${TOTAL}" | bc)%"

# Top countries by request volume
cat /tmp/cf.log | jq -r '.ClientCountry' | sort | uniq -c | sort -rn | head 10

# WAF blocks
cat /tmp/cf.log | jq -r 'select(.WAFAction == "block") | [.ClientIP, .WAFRuleID, .ClientRequestURI] | @csv' | head 20
```

---

## 5. Strapi Application Log Configuration

### 5.1 Strapi Log Levels

```javascript
// config/logger.ts (Strapi 5)
export default {
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  transports: [
    {
      name: 'console',
      options: {
        level: process.env.LOG_LEVEL || 'warn',
      },
    },
  ],
};
```

Production log level: `warn` — logs warnings and errors only. Avoids excessive info/debug noise in production Docker logs.

### 5.2 Structured Logging

Strapi uses Pino logger. Output is JSON in production:

```json
{"level":30,"time":1704067200000,"pid":1,"hostname":"twinmos-strapi-1","msg":"Server started","port":1337}
{"level":50,"time":1704067260000,"pid":1,"hostname":"twinmos-strapi-1","msg":"Database connection error","err":{"type":"Error","message":"Connection refused"}}
```

### 5.3 Custom Audit Logging

Strapi 5 includes a built-in Audit Log (Settings → Audit Log). Records:
- Content publish/unpublish actions
- Admin user login/logout
- Role changes
- API token creation/deletion

```bash
# Access audit log via Strapi API (admin only)
curl "https://api.twinmos.com/api/audit-logs?sort=createdAt:desc&pagination[pageSize]=50" \
  -H "Authorization: Bearer ${ADMIN_JWT}"
```

---

## 6. PostgreSQL Logging Configuration

### 6.1 Enable Slow Query Logging

```bash
# Add to PostgreSQL config in Coolify (as environment variable or config mount)
docker exec twinmos-postgres-1 psql -U strapi_user -c \
  "ALTER SYSTEM SET log_min_duration_statement = '200';"
  # Log queries taking > 200ms

docker exec twinmos-postgres-1 psql -U strapi_user -c \
  "ALTER SYSTEM SET log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h ';"

docker exec twinmos-postgres-1 psql -U strapi_user -c \
  "SELECT pg_reload_conf();"
```

### 6.2 Monitor Slow Queries

```sql
-- Find currently running slow queries
SELECT
  pid,
  now() - pg_stat_activity.query_start AS duration,
  state,
  query
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '5 seconds'
  AND state = 'active'
ORDER BY duration DESC;

-- Find historically slow queries (pg_stat_statements extension)
SELECT
  calls,
  mean_exec_time::bigint AS avg_ms,
  max_exec_time::bigint AS max_ms,
  LEFT(query, 100) AS query_sample
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;
```

---

## 7. PII Handling and GDPR Compliance

### 7.1 PII in Logs

TwinMOS website collects minimal PII. Log handling:

| Data Type | In Logs? | Handling |
|-----------|---------|---------|
| IP addresses | Yes (Cloudflare access logs) | Mask last octet before cold storage: 203.0.113.x |
| Email addresses | Strapi audit log (admin actions) | Restricted access (Lead only) |
| Search queries | MeiliSearch logs | May contain names; 7-day retention only |
| Contact form content | Not in logs (stored in DB) | Not logged |
| User session tokens | Not in logs | Never log JWT/session tokens |

### 7.2 IP Address Masking Script

Before archiving Cloudflare logs to B2 cold storage (>90 days), mask IP addresses:

```bash
#!/usr/bin/env bash
# mask-logs.sh — masks last IP octet in Cloudflare JSONL logs

INPUT_FILE="$1"
OUTPUT_FILE="${INPUT_FILE%.log}.masked.log"

# IPv4 masking: replace last octet with 0
# IPv6 masking: replace last 16 bits with 0000
jq -c '
  .ClientIP = (
    if (.ClientIP | test("^[0-9]+\\.[0-9]+\\.[0-9]+\\.[0-9]+$"))
    then (.ClientIP | gsub("\\.[0-9]+$"; ".0"))
    else (.ClientIP | gsub(":[0-9a-fA-F]*$"; ":0000"))
    end
  )
' "${INPUT_FILE}" > "${OUTPUT_FILE}"

echo "Masked: ${INPUT_FILE} → ${OUTPUT_FILE}"
```

### 7.3 Data Retention Compliance

```
Access logs:
  Hot (Cloudflare dashboard): 90 days
  Cold archive (B2): 730 days (2 years)
  After 730 days: automatic deletion via B2 lifecycle rule

Application logs (Docker):
  On-disk rotation: 7 days (5 × 100MB files)
  No cold archive (non-sensitive)

Audit logs (Strapi):
  In PostgreSQL: No automatic deletion — part of compliance record
  Annual review: Delete audit entries older than 3 years (unless regulatory hold)
```

---

## 8. Phase 2 — Log Aggregation with Vector (Future)

When log volume or complexity requires centralised aggregation, deploy Vector agent:

### 8.1 Vector Architecture

```
[Docker containers]     [Cloudflare Logpush]
      │                       │
      ▼                       ▼
[Vector Agent]          [B2 direct]
  - Collect Docker        (cold archive)
    log streams
  - Parse JSON
  - Mask PII
  - Tag with env/service
      │
      ▼
[Loki] (hot storage 30d)   [B2] (cold archive 2yr)
      │
      ▼
[Grafana dashboards]
```

### 8.2 Vector Configuration (Reference)

```toml
# /etc/vector/vector.toml

[sources.docker_logs]
  type = "docker_logs"
  include_containers = [
    "twinmos-strapi-1",
    "twinmos-postgres-1",
    "twinmos-meilisearch-1",
    "coolify-proxy"
  ]

[transforms.parse_json]
  type = "remap"
  inputs = ["docker_logs"]
  source = '''
    . = parse_json!(.message) ?? .
    .env = "production"
    # Mask email addresses
    if exists(.email) {
      .email = redact(.email, [{"type": "email_address"}])
    }
  '''

[transforms.add_metadata]
  type = "remap"
  inputs = ["parse_json"]
  source = '''
    .timestamp = now()
    .service = .container_name
  '''

[sinks.loki]
  type = "loki"
  inputs = ["add_metadata"]
  endpoint = "http://loki:3100"
  encoding.codec = "json"
  labels.service = "{{ service }}"
  labels.env = "production"

[sinks.b2_archive]
  type = "aws_s3"
  inputs = ["add_metadata"]
  bucket = "twinmos-logs-archive"
  endpoint = "https://s3.us-west-002.backblazeb2.com"
  region = "us-west-002"
  key_prefix = "vector/{{ strftime_custom(\"%Y/%m/%d\") }}/"
  compression = "gzip"
  encoding.codec = "json"
```

### 8.3 LogQL Query Examples (Loki)

```logql
# Error rate by service (last 5 min)
count_over_time({env="production"} |= "error" [5m])

# Strapi API errors
{service="twinmos-strapi-1"} |= "error" | json | level="error" | line_format "{{.msg}}"

# PostgreSQL slow queries (>200ms)
{service="twinmos-postgres-1"} |= "duration" | regexp "duration: (?P<ms>\\d+)"
  | unwrap ms | quantile_over_time(0.95, [5m]) by (service) > 500

# 404 rate per minute
sum(rate({service="coolify-proxy"} |= "404" [1m])) by (service)

# Failed login attempts
{service="twinmos-strapi-1"} |= "Invalid credentials" | count_over_time([5m]) > 5
```

---

## 9. Access Control for Logs

| Role | Docker logs (SSH) | Cloudflare logs | Strapi audit log | Archived B2 logs |
|------|------------------|-----------------|-----------------|-----------------|
| Tech Lead | ✅ Full access | ✅ Full access | ✅ Full access | ✅ Full access |
| Developer B | ✅ Last 1 hour | ✅ Zone admin | ✅ Read-only | ❌ No (PII) |
| Chairman | ❌ No | ✅ Read-only dash | ❌ No | ❌ No |
| Contractor | ❌ No | ❌ No | ❌ No | ❌ No |

---

## 10. Incident Log Preservation

When a security incident or P0 event occurs:

```bash
# Immediately preserve logs from all containers (before rotation)
INCIDENT_DATE=$(date +%Y%m%d_%H%M%S)
INCIDENT_DIR="/var/incidents/${INCIDENT_DATE}"
sudo mkdir -p "${INCIDENT_DIR}"

for container in twinmos-strapi-1 twinmos-postgres-1 twinmos-meilisearch-1 coolify-proxy; do
  docker logs "${container}" --since 24h \
    > "${INCIDENT_DIR}/${container}.log" 2>&1
done

# Archive incident logs to B2
tar -czf /tmp/incident_${INCIDENT_DATE}.tar.gz "${INCIDENT_DIR}"
b2 upload-file twinmos-logs-archive /tmp/incident_${INCIDENT_DATE}.tar.gz \
  "incidents/incident_${INCIDENT_DATE}.tar.gz"

echo "Incident logs preserved: incidents/incident_${INCIDENT_DATE}.tar.gz"
```

---

*Approved by: Chairman · Tech Lead*  
*Synchronized With: Technology Stack v1.1 §20.5, §21.3*
