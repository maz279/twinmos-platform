# INCIDENT — Incident Response & Blameless Post-Mortem Runbook (Task F5 / RUN-01)

## 1. Severity Classification Matrix

| Severity | Definition | Target Response (MTTD) | Target Mitigation (MTTR) | Communication Cadence |
| :--- | :--- | :--- | :--- | :--- |
| **P1 - Critical** | Public site down, database unavailable, active data breach | < 15 minutes | < 1 hour | Updates every 30 minutes |
| **P2 - Major** | Core feature impaired (form routing failing, admin console locked, p95 > 1s) | < 30 minutes | < 4 hours | Updates every 2 hours |
| **P3 - Minor** | Non-critical bug, cosmetic asset issue, single partner portal issue | < 4 hours | < 24 hours | Standard ticket queue |
| **P4 - Low** | Minor text discrepancy, non-blocking telemetry warning | Next business day | Next release cycle | Release notes |

---

## 2. Incident Response Workflow

```
[ALERT FIRED] ──> [TRIAGE & ASSIGN IC] ──> [CONTAINMENT] ──> [MITIGATION] ──> [VERIFICATION] ──> [POST-MORTEM]
```

1. **Detection & Triage**:
   - Check alert origin in `GET /api/v1/health/deep` or `GET /api/v1/admin/alerts`.
   - Assign **Incident Commander (IC)** to lead remediation.
2. **Containment & Mitigation**:
   - If bad release: execute `docs/runbooks/ROLLBACK.md`.
   - If origin attack: verify host firewall in `deploy/firewall/setup-firewall.sh`.
   - If database crash: execute disaster restore via `deploy/restore.sh`.
3. **Verification**:
   - Confirm healthy response on `/api/v1/health/deep`.
   - Verify alert resolution via `POST /api/v1/admin/alerts/:id/resolve`.
4. **Post-Mortem Requirement**:
   - Mandatory within 48 hours for all P1 and P2 incidents.

---

## 3. Blameless Post-Mortem Template

```markdown
# Incident Post-Mortem: [INC-YYYYMMDD-01] - [Short Title]

## Metadata
- **Date**: YYYY-MM-DD
- **Incident Commander**: [Name]
- **Severity**: [P1 / P2]
- **Duration**: [X hours Y minutes]
- **Impacted Systems**: [e.g., Public Website / Node API / PostgreSQL]

## Executive Summary
[High-level, non-technical explanation of what occurred, user impact, and resolution.]

## Impact
- **Total Downtime**: XX minutes
- **Requests Affected**: XX requests (5xx error rate X.X%)
- **Data Loss**: Zero data loss (verified via WAL consistency check)

## Chronological Timeline (UTC)
- **HH:MM** - Anomaly detected by alert rule `[rule_name]`.
- **HH:MM** - Incident Commander engaged; investigation commenced.
- **HH:MM** - Root cause identified as [...].
- **HH:MM** - Mitigation applied via [...].
- **HH:MM** - Health confirmed 200 OK; incident resolved.

## Root Cause Analysis (The 5 Whys)
1. Why did the issue occur? [...]
2. Why did that happen? [...]
3. Why was that not prevented? [...]
4. Why did testing not catch it? [...]
5. Why was the systemic process configured this way? [...]

## Corrective Actions & Preventative Tasks
| Action Item | Owner | Target Date | Status |
| :--- | :--- | :--- | :--- |
| Add integration test for edge condition | [Owner] | YYYY-MM-DD | Open |
| Update deployment runbook | [Owner] | YYYY-MM-DD | Open |
| Adjust Prometheus/Alert threshold | [Owner] | YYYY-MM-DD | Open |
```
