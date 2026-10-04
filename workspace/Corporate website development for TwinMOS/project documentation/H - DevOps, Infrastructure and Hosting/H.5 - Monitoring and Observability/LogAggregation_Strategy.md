# TwinMOS Website — Log Aggregation Strategy

**Document ID:** H.5-006  
**Version:** 1.0  
**Status:** [M] Must-Have  
**Priority:** P1  
**Owner:** DevOps Lead / Security Lead  
**Date:** 2026-05-01  
**Review Cycle:** Quarterly

---

## 1. Purpose & Scope

This document defines the log aggregation strategy for the TwinMOS website infrastructure. It covers collection, processing, storage, and analysis of logs from all components including frontend (Cloudflare Pages), backend (Coolify/Strapi), database (PostgreSQL), search (MeiliSearch), and infrastructure (Hetzner VPS, Coolify).

**Scope:**
- Log sources and classification
- Collection pipeline architecture
- Processing and enrichment rules
- Storage tiers and retention policies
- Query and analysis patterns
- Security and compliance (GDPR, UAE PDPL, KSA PDPL)

**Out of scope:** Application-level structured logging standards (covered in coding standards).

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         LOG SOURCES                                 │
├─────────────┬─────────────┬─────────────┬─────────────┬─────────────┤
│  Cloudflare │   Coolify   │   Strapi    │  PostgreSQL │  MeiliSearch│
│   (Edge)    │   (Docker)  │  (App Logs) │  (DB Logs)  │ (Search)    │
└──────┬──────┴──────┬──────┴──────┬──────┴──────┬──────┴──────┬──────┘
       │             │             │             │             │
       ▼             ▼             ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      LOG COLLECTION LAYER                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐ │
│  │ Cloudflare  │  │  Vector     │  │ Docker      │  │  Journald │ │
│  │ Logpush     │  │  Agent      │  │  Logging    │  │  (system) │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └───────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     LOG PROCESSING LAYER                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │  Parse/     │  │  Enrich     │  │  Filter/    │                 │
│  │  Structure  │  │  (geo,host) │  │  Sample     │                 │
│  └─────────────┘  └─────────────┘  └─────────────┘                 │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      LOG STORAGE LAYER                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │  Grafana    │  │  Backblaze  │  │  Coolify    │                 │
│  │  Loki       │  │  B2 Archive │  │  (short)    │                 │
│  │  (hot)      │  │  (cold)     │  │  (ephemeral)│                 │
│  └─────────────┘  └─────────────┘  └─────────────┘                 │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     LOG ANALYSIS LAYER                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │  Grafana    │  │  Alert      │  │  Scheduled  │                 │
│  │  Dashboards │  │  Rules      │  │  Reports    │                 │
│  └─────────────┘  └─────────────┘  └─────────────┘                 │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Log Sources & Classification

### 3.1 Source Inventory

| Source | Type | Volume/Day | Format | Sensitivity |
|--------|------|-----------|--------|-------------|
| Cloudflare Edge | HTTP access + firewall | ~500 MB | JSON (Logpush) | Medium (IPs) |
| Coolify Proxy (Traefik) | HTTP access | ~200 MB | Common Log | Medium |
| Strapi Application | App + audit logs | ~100 MB | JSON structured | High (PII) |
| PostgreSQL | Query + error logs | ~50 MB | CSV / text | High (query data) |
| MeiliSearch | Search + error logs | ~20 MB | JSON | Medium |
| ImgProxy | Image processing | ~30 MB | JSON | Low |
| Plausible | Analytics events | ~80 MB | TSV | Medium (anonymized) |
| System (journald) | Kernel + system | ~20 MB | Journal | Low |
| Docker Daemon | Container events | ~10 MB | JSON | Low |
| SSH/Auth | Authentication | ~5 MB | Text | High |

### 3.2 Log Classification

| Class | Description | Retention | Examples |
|-------|-------------|-----------|----------|
| **Security** | Auth, access control, anomalies | 2 years | SSH logs, failed logins, WAF blocks |
| **Audit** | Data access, admin actions | 7 years | Strapi admin actions, content changes |
| **Application** | App errors, performance | 90 days | Stack traces, request logs |
| **Access** | HTTP requests, CDN | 30 days | Edge access logs, Traefik logs |
| **System** | Infrastructure health | 30 days | CPU, memory, disk metrics |
| **Debug** | Development troubleshooting | 7 days | Verbose logs, trace data |

---

## 4. Collection Pipeline

### 4.1 Cloudflare Logpush

```hcl
# Cloudflare Logpush job configuration
resource "cloudflare_logpush_job" "edge_logs" {
  zone_id          = var.cloudflare_zone_id
  name             = "twinmos-edge-logs"
  dataset          = "http_requests"
  destination_conf = "https://logs.twinmos.com/cloudflare"
  
  logpull_options = jsonencode({
    fields = [
      "ClientIP", "ClientRequestHost", "ClientRequestMethod",
      "ClientRequestURI", "EdgeEndTimestamp", "EdgeResponseStatus",
      "EdgeResponseBytes", "CacheCacheStatus", "WAFAction",
      "WAFFlags", "BotScore", "BotScoreSrc", "OriginResponseTime",
      "OriginIP", "RayID", "Country", "City"
    ]
  })
  
  filter = jsonencode({
    where = {
      and = [
        { "EdgeResponseStatus" = { neq = 404 } },
        { "ClientRequestPath" = { neq = "/health" } }
      ]
    }
  })
}
```

### 4.2 Vector Agent Configuration (Hetzner VPS)

```yaml
# /etc/vector/vector.toml
# Vector: High-performance log router

[sources.docker_logs]
type = "docker_logs"
include_labels = ["com.docker.compose.project=twinmos"]

[sources.journald]
type = "journald"
include_units = ["sshd", "coolify", "docker"]

[sources.file_logs]
type = "file"
include = [
  "/var/log/postgresql/*.csv",
  "/var/log/coolify/*.log",
  "/var/log/traefik/*.log"
]
read_from = "end"

# Transform: Parse and enrich
[transforms.parse_logs]
type = "remap"
inputs = ["docker_logs", "file_logs"]
source = '''
  # Parse JSON logs
  if is_string(.message) {
    parsed, err = parse_json(.message)
    if err == null {
      . = merge(., parsed)
    }
  }
  
  # Add metadata
  .environment = get_env_var("ENVIRONMENT") ?? "unknown"
  .service = .container_name ?? .unit ?? "unknown"
  .host = get_hostname()
  
  # Classify log level
  if exists(.level) {
    level = downcase(string!(.level))
    if level == "error" || level == "fatal" {
      .log_class = "error"
    } else if level == "warn" || level == "warning" {
      .log_class = "warning"
    } else if level == "info" {
      .log_class = "info"
    } else {
      .log_class = "debug"
    }
  }
  
  # PII redaction for GDPR compliance
  if exists(.email) {
    .email = redact(.email, filters=["email"])
  }
  if exists(.ip) {
    .ip = redact(.ip, filters=["ipv4"])
  }
'''

# Transform: Route by log class
[transforms.route_logs]
type = "route"
inputs = ["parse_logs"]
route.security = '.log_class == "error" || .service == "sshd" || exists(.waf_action)'
route.audit = 'exists(.audit_event) || .service == "strapi" && exists(.admin_action)'
route.app = '.log_class == "error" || .log_class == "warning"'
route.access = '!exists(.log_class) || .log_class == "info"'

# Sink: Grafana Loki (hot storage)
[sinks.loki]
type = "loki"
inputs = ["route_logs.security", "route_logs.audit", "route_logs.app"]
endpoint = "https://loki.twinmos.com"
auth.strategy = "basic"
auth.user = "${LOKI_USER}"
auth.password = "${LOKI_PASSWORD}"

labels.environment = "{{environment}}"
labels.service = "{{service}}"
labels.host = "{{host}}"
labels.log_class = "{{log_class}}"

encoding.codec = "json"
out_of_order_action = "accept"

# Sink: Backblaze B2 (cold archive)
[sinks.b2_archive]
type = "aws_s3"
inputs = ["route_logs.access", "route_logs.security"]
bucket = "twinmos-logs-archive"
region = "us-west-002"
endpoint = "https://s3.us-west-002.backblazeb2.com"
auth.access_key_id = "${B2_APPLICATION_KEY_ID}"
auth.secret_access_key = "${B2_APPLICATION_KEY}"

key_prefix = "logs/%Y/%m/%d/{{service}}/"
encoding.codec = "json"
compression = "gzip"

batch.max_bytes = 10485760
batch.timeout_secs = 300

# Sink: Coolify ephemeral (debug)
[sinks.console]
type = "console"
inputs = ["route_logs.app"]
encoding.codec = "json"
encoding.only_fields = ["timestamp", "service", "level", "message"]
target = "stdout"
```

### 4.3 Docker Logging Driver

```yaml
# docker-compose.override.yml (logging configuration)
services:
  strapi:
    logging:
      driver: "json-file"
      options:
        max-size: "100m"
        max-file: "5"
        labels: "service,environment"
        tag: "{{.ImageName}}/{{.Name}}/{{.ID}}"

  postgres:
    logging:
      driver: "json-file"
      options:
        max-size: "50m"
        max-file: "3"

  meilisearch:
    logging:
      driver: "json-file"
      options:
        max-size: "50m"
        max-file: "3"
```

---

## 5. Processing & Enrichment

### 5.1 Parsing Rules

| Source | Parser | Key Fields |
|--------|--------|-----------|
| Traefik access | Common Log Format | timestamp, method, path, status, bytes, duration |
| Strapi JSON | Native JSON | level, message, requestId, userId, action |
| PostgreSQL CSV | CSV | log_time, user_name, database_name, query |
| Cloudflare JSON | Native JSON | ClientIP, EdgeResponseStatus, CacheCacheStatus |

### 5.2 Enrichment Pipeline

```javascript
// vector enrichment (VRL - Vector Remap Language)
// Add geolocation from IP
if exists(.ClientIP) && .ClientIP != "" {
  geo = get_enrichment_table_record("geoip", {
    "ip": .ClientIP
  })
  if exists(geo) {
    .geo_country = geo.country.iso_code
    .geo_city = geo.city.names.en
  }
}

// Add service correlation
if exists(.requestId) {
  .correlation_id = .requestId
}

// Calculate response time buckets
if exists(.duration) {
  duration_ms = .duration * 1000
  if duration_ms < 100 {
    .duration_bucket = "fast"
  } else if duration_ms < 500 {
    .duration_bucket = "normal"
  } else if duration_ms < 1000 {
    .duration_bucket = "slow"
  } else {
    .duration_bucket = "very_slow"
  }
}
```

### 5.3 Sampling Rules

| Log Type | Sampling Rate | Condition |
|----------|--------------|-----------|
| Access logs (200 OK) | 10% | Only sample successful requests |
| Access logs (errors) | 100% | All error responses |
| Debug logs | 1% | In production only |
| Health check | 0% | Drop entirely |
| Static asset | 0.1% | Very low sample rate |

---

## 6. Storage Tiers

### 6.1 Tier Architecture

| Tier | Technology | Retention | Use Case | Cost |
|------|-----------|-----------|----------|------|
| **Hot** | Grafana Loki (7 days) | 7 days | Real-time debugging, alerts | ~$15/mo |
| **Warm** | Loki (compressed) | 30 days | Recent investigation | Included |
| **Cold** | Backblaze B2 | 2 years | Compliance, forensics | ~$5/mo |
| **Glacier** | B2 Deep Archive | 7 years | Audit, legal hold | ~$1/mo |

### 6.2 Loki Configuration

```yaml
# loki-config.yml
auth_enabled: false

server:
  http_listen_port: 3100
  grpc_listen_port: 9096

common:
  path_prefix: /loki
  storage:
    filesystem:
      chunks_directory: /loki/chunks
      rules_directory: /loki/rules
  replication_factor: 1
  ring:
    instance_addr: 127.0.0.1
    kvstore:
      store: inmemory

schema_config:
  configs:
    - from: 2026-01-01
      store: tsdb
      object_store: filesystem
      schema: v13
      index:
        prefix: index_
        period: 24h

storage_config:
  tsdb_shipper:
    active_index_directory: /loki/tsdb-index
    cache_location: /loki/tsdb-cache
  filesystem:
    directory: /loki/chunks

compactor:
  working_directory: /loki/compactor
  compaction_interval: 10m
  retention_enabled: true
  retention_delete_delay: 2h
  retention_delete_worker_count: 150

limits_config:
  retention_period: 720h  # 30 days
  ingestion_rate_mb: 16
  ingestion_burst_size_mb: 32
  per_stream_rate_limit: 5MB
  per_stream_rate_limit_burst: 20MB
  max_global_streams_per_user: 10000
  reject_old_samples: true
  reject_old_samples_max_age: 168h
```

### 6.3 Backblaze B2 Archive Structure

```
twinmos-logs-archive/
├── 2026/
│   ├── 05/
│   │   ├── 01/
│   │   │   ├── strapi/
│   │   │   │   └── 000000.json.gz
│   │   │   ├── postgres/
│   │   │   │   └── 000000.json.gz
│   │   │   └── cloudflare/
│   │   │       └── 000000.json.gz
│   │   └── ...
│   └── ...
└── ...
```

---

## 7. Query & Analysis

### 7.1 Common LogQL Queries

```logql
# Error rate by service in last hour
sum by (service) (rate({log_class="error"}[1h]))

# 5xx errors from Strapi
{service="strapi"} 
  | json 
  | status >= 500 
  | line_format "{{.timestamp}} {{.method}} {{.path}} {{.status}} {{.duration}}ms"

# Slow queries (>1s)
{service="postgres"} 
  | json 
  | query_duration_ms > 1000 
  | line_format "{{.query}}"

# WAF blocked requests
{service="cloudflare"} 
  | json 
  | WAFAction = "block" 
  | line_format "{{.ClientIP}} {{.ClientRequestURI}} {{.Country}}"

# Failed SSH attempts
{service="sshd"} 
  |~ "Failed password" 
  | regexp "Failed password for (invalid user )?(?P<user>\\w+) from (?P<ip>[\\d.]+)"
  | line_format "User: {{.user}}, IP: {{.ip}}"
```

### 7.2 Grafana Dashboard Panels

| Panel | Query | Alert |
|-------|-------|-------|
| Error Rate | `sum(rate({log_class="error"}[5m]))` | > 10/min |
| 5xx Rate | `sum(rate({status=~"5.."}[5m]))` | > 1/min |
| Slow Queries | `count_over_time({query_duration_ms>1000}[1h])` | > 50/hour |
| Failed Logins | `sum(rate({event="login_failed"}[5m]))` | > 5/min |
| WAF Blocks | `sum(rate({WAFAction="block"}[5m]))` | > 100/min |

---

## 8. Security & Compliance

### 8.1 PII Handling

| Field | Action | Rationale |
|-------|--------|-----------|
| Email addresses | Hash (SHA-256) | Identifiable but not reversible |
| IP addresses | Truncate last octet | Geo retention, individual anonymity |
| User IDs | Retain (internal) | Audit trail requirement |
| Phone numbers | Redact fully | High sensitivity |
| Session tokens | Redact fully | Security risk |
| Passwords | Redact fully | Never log |

### 8.2 GDPR / PDPL Compliance

- **Data minimization**: Only collect logs necessary for operations
- **Retention limits**: Auto-delete per classification schedule
- **Right to erasure**: Manual deletion procedure for user data
- **Access control**: Role-based access to log systems
- **Encryption**: At-rest (B2 SSE) and in-transit (TLS 1.3)

### 8.3 Access Control Matrix

| Role | Loki Query | B2 Archive | Raw Logs |
|------|-----------|------------|----------|
| DevOps Lead | Full | Full | Full |
| Security Lead | Full | Full | Full |
| Developer | Service-own | None | None |
| QA Engineer | Staging only | None | None |
| Auditor | Audit class | Audit class | Read-only |

---

## 9. Alerting Integration

### 9.1 Log-Based Alerts

```yaml
# loki-alert-rules.yml
groups:
  - name: security_alerts
    rules:
      - alert: MultipleFailedLogins
        expr: |
          sum by (ip) (count_over_time({service="sshd"} |= "Failed password" [5m])) > 5
        for: 2m
        labels:
          severity: warning
          team: security
        annotations:
          summary: "Multiple failed SSH logins from {{ $labels.ip }}"
          
      - alert: SQLInjectionAttempt
        expr: |
          sum by (path) (count_over_time({service="strapi"} |~ "(union|select|insert|delete|drop|--)" [5m])) > 3
        for: 1m
        labels:
          severity: critical
          team: security
        annotations:
          summary: "Possible SQL injection attempt detected"

  - name: application_alerts
    rules:
      - alert: HighErrorRate
        expr: |
          sum(rate({log_class="error"}[5m])) / sum(rate({}[5m])) > 0.05
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "Error rate above 5%"
          
      - alert: DatabaseConnectionError
        expr: |
          sum by (host) (count_over_time({service="postgres"} |= "connection refused" [1m])) > 0
        for: 0m
        labels:
          severity: critical
        annotations:
          summary: "Database connection errors detected"
```

---

## 10. Maintenance

### 10.1 Daily Operations

- [ ] Check Loki ingestion rate (target: < 10 MB/s)
- [ ] Verify B2 archive uploads completed
- [ ] Review log-based alerts from previous 24h
- [ ] Check disk usage on Loki volume

### 10.2 Weekly Operations

- [ ] Review and tune sampling rates
- [ ] Verify retention deletions executed
- [ ] Check Vector agent health
- [ ] Update parsing rules for new log formats

### 10.3 Monthly Operations

- [ ] Storage cost review and optimization
- [ ] Retention policy compliance audit
- [ ] Access control review
- [ ] Performance benchmark (query latency)

---

## 11. Related Documents

| Document | ID | Relationship |
|----------|-----|-------------|
| Monitoring Architecture Overview | H.5-001 | Parent architecture |
| Alerting Rules | H.5-007 | Alert configuration |
| Dashboard Design | H.5-008 | Visualization specs |
| Security Incident Runbook | H.4-006 | Incident response |
| Secrets Management Plan | H.1-005 | Credential handling |

---

## 12. Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-01 | DevOps Lead | Initial version |

---

*This document is a living specification. Update when adding new services, changing retention requirements, or modifying the log pipeline architecture.*
