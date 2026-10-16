# Observability, Telemetry & Alerting Runbook

## 1. Overview & Architecture

The TwinMOS platform uses an in-process, zero-dependency telemetry and alert management subsystem (`apps/api/src/services/alerts.ts`) coupled with RFC 9457 structured problem details, Hono request-level telemetry, and edge-to-origin tracing via `X-Request-Id`.

All alerts emit structured JSON logs to `stderr` and are buffered in-memory for console querying via `GET /api/v1/admin/alerts`.

---

## 2. Service Level Objectives (SLOs)

| Metric | Target | Measurement Period | Alert Threshold |
| :--- | :--- | :--- | :--- |
| **Public Site Availability** | 99.9% | Rolling 30 days | > 5 server 5xx errors in 60s |
| **Edge Cache Hit Latency (p95)**| < 50ms | Rolling 1 hour | N/A (Edge) |
| **API Response Latency (p95)** | < 300ms | Rolling 1 hour | > 1000ms latency spike |
| **Form Notification Delivery** | 99.99% | Continuous | Any failed SMTP dispatch (V-09) |
| **Serial Anti-Counterfeit Verification** | < 250ms | Rolling 24 hours | > 5 unique IPs on single SN |
| **Disaster Recovery RTO** | 4 hours | Per drill/incident (DR.md / 01 §4.6) | > 4 hours restore time |
| **Disaster Recovery RPO** | 15 min | Continuous WAL archiving (DR.md) | Backup gap > 15 minutes |

---

## 3. Alert Rules Reference

### `http.5xx_rate_exceeded`
- **Severity**: High / Critical
- **Description**: Triggered when the API records 5 or more HTTP 500-range responses.
- **Triage Action**: Inspect server logs with `journalctl -u twinmos-api -n 100` or `docker compose logs --tail=100 api`. Correlate with `X-Request-Id`. Check database connectivity and disk capacity.

### `http.latency_p95_exceeded`
- **Severity**: Medium
- **Description**: Triggered when a single request or p95 rolling window exceeds 1000ms.
- **Triage Action**: Check CPU utilization and database slow query logs. Verify whether cold start or complex reporting query caused the spike.

### `mail.form_notification_failed` (V-09)
- **Severity**: High
- **Description**: Triggered when a public form submission is persisted to the database (returning 201 to the user) but backend internal notification email delivery fails.
- **Triage Action**: Review Resend credentials (`RESEND_API_KEY`). Check Resend dashboard and quotas. Query pending/un-notified form leads via admin console leads table.

### `auth.account_locked` (S-06 / A4a)
- **Severity**: High
- **Description**: Triggered when an account encounters 5 consecutive failed login attempts within 15 minutes, activating temporary lockout.
- **Triage Action**: Verify origin IP address in the alert payload. If widespread across multiple accounts, check for distributed brute force attacks at Cloudflare WAF.

### `outbox.revalidation_failed`
- **Severity**: Medium
- **Description**: Triggered when asynchronous ISR outbox messages accumulate without being processed.
- **Triage Action**: Check cron worker status for `/api/v1/admin/cron/dispatch-outbox`. Ensure `REVALIDATION_SECRET` is matching between API and Astro SSR.

### `backup.stale_threshold_exceeded`
- **Severity**: Critical
- **Description**: Triggered when automated daily database backup has not succeeded within 24 hours.
- **Triage Action**: Check backup cron job and `/var/backups/twinmos` storage space. Run manual test: `./deploy/backup.sh`.

---

## 4. Health Check Endpoints

### Basic Liveness Probe: `GET /api/v1/health`
- **Purpose**: Kubernetes / Docker / Systemd liveness probe.
- **Success (200 OK)**:
  ```json
  { "status": "ok", "service": "twinmos-api", "version": "0.3.0", "db": "connected" }
  ```
- **Failure (503 Service Unavailable)**:
  ```json
  { "status": "degraded", "service": "twinmos-api", "version": "0.3.0", "db": "unreachable" }
  ```

### Deep Diagnostics Probe: `GET /api/v1/health/deep`
- **Purpose**: Load balancer readiness check and operator diagnostics.
- **Success (200 OK)**:
  ```json
  {
    "status": "ok",
    "service": "twinmos-api",
    "version": "0.3.0",
    "uptimeSec": 3600,
    "timestamp": "2026-10-14T00:00:00.000Z",
    "components": {
      "database": { "status": "connected", "latencyMs": 4 },
      "outbox": { "status": "healthy", "pendingCount": 0 },
      "alerts": { "firingCount": 0, "metrics": { ... } }
    }
  }
  ```

---

## 5. Log Inspection Commands

```bash
# View live API log stream (systemd or Docker)
journalctl -u twinmos-api -f
# or if containerized:
docker compose -f deploy/compose/docker-compose.yml logs -f api

# Filter for alerts in systemd logs
journalctl -u twinmos-api -f | grep 'alert'

# Test deep health probe
curl -s http://127.0.0.1:8787/api/v1/health/deep | jq .
```
