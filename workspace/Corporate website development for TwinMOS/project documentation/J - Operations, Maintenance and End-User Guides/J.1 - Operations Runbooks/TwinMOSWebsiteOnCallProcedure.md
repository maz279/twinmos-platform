# TwinMOS Website — On-Call Procedure

**Document Reference:** TWN-OPS-2026-002  
**Version:** 1.0  
**Status:** FINAL  
**Date:** 1 May 2026  
**Prepared by:** TwinMOS Digital Transformation Team / Unisoft Engineering  
**Owner:** Unisoft Team Lead  
**Audience:** On-call engineers, DevOps, TwinMOS IT Staff  
**Classification:** CONFIDENTIAL — Internal Use Only  
**Synchronized With:** BRD v3.0 §23.4, Tech Stack v1.1 §23.4, MSA §205

---

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 1 May 2026 | TwinMOS Digital Transformation Team | Initial release |

---

## 1. Purpose

This document defines the on-call rotation, responsibilities, alerting channels, and incident response workflow for the TwinMOS corporate website production environment. It ensures 24/7 coverage for critical incidents (Sev 1) and business-hours coverage for all other severities.

---

## 2. On-Call Rotation

### 2.1 Rotation Members

| Order | Role | Primary Responsibility | Backup |
|-------|------|------------------------|--------|
| 1 | Unisoft Team Lead | Frontend, Astro, Cloudflare, DevOps | Unisoft Senior Developer |
| 2 | Unisoft Senior Developer | Backend, Strapi, PostgreSQL, MeiliSearch | Unisoft Team Lead |
| 3 | Unisoft Backup Developer | Vacation/illness coverage for both leads | — |

### 2.2 Schedule

- **Rotation period:** 1 week (Monday 00:00 UTC → Sunday 23:59 UTC)
- **Handoff:** Monday 09:00 GST (UTC+4) via Slack #ops with status summary
- **Coverage window:**
  - Sev 1 (Critical): 24/7 — primary on-call must respond within 15 minutes
  - Sev 2 (High): 24/7 — primary on-call must respond within 30 minutes
  - Sev 3/4: Business hours only (09:00–18:00 GST, Sunday–Thursday)

### 2.3 Rotation Calendar

Managed via shared calendar (Google Calendar / Outlook). The TwinMOS PM maintains the master calendar with:
- Primary on-call assignment per week
- Backup availability
- Known PTO / holidays
- Phase launch windows (all-hands on deck)

---

## 3. Alerting Channels

### 3.1 Severity-Based Routing

| Severity | Primary Channel | Backup Channel | Escalation if No Ack |
|----------|-----------------|----------------|----------------------|
| Sev 1 | PagerDuty / SMS → Slack #incident | Phone call to primary | 15 min → backup dev SMS; 30 min → Team Lead phone; 45 min → TwinMOS IT Lead |
| Sev 2 | Slack #ops (mention @oncall) | Email to on-call | 30 min → backup dev; 1 hour → Team Lead |
| Sev 3 | GitHub Issues / Jira | Slack #ops | Next business day |
| Sev 4 | Backlog / Sprint planning | — | Next sprint |

### 3.2 Monitoring Sources

| Tool | Alert Type | Typical Severity |
|------|------------|------------------|
| UptimeRobot | Site down / API down | Sev 1 |
| Sentry | Error spike / critical exception | Sev 1–2 |
| Cloudflare | DDoS detected / WAF block spike | Sev 1–2 |
| Coolify | Container restart loop / OOM | Sev 2 |
| Plausible | Traffic anomaly (spike/drop) | Sev 3 |
| GitHub Actions | CI/CD failure | Sev 3 |

---

## 4. Incident Response Workflow

### 4.1 Sev 1 — Critical Outage Response

```
T+0 min    Alert fired (UptimeRobot / Sentry / Cloudflare)
T+0 min    Slack #incident auto-created; @oncall paged
T+5 min    On-call acknowledges alert (Slack reaction / PagerDuty)
T+15 min   If no ack: escalate to backup dev
T+15 min   Initial triage: identify affected component
T+30 min   Mitigation attempt #1 (restart, rollback, failover)
T+45 min   If unresolved: escalate to Team Lead + TwinMOS IT Lead
T+60 min   If still unresolved: war room (Slack huddle / Zoom)
T+2h       Executive notification (Operational Sponsor)
T+4h       If still unresolved: Chairman notification
Post-fix   Post-incident review within 24 hours
```

### 4.2 Sev 2 — Degraded Response

```
T+0 min    Alert fired
T+0 min    Slack #ops notified; @oncall mentioned
T+30 min   On-call acknowledges and begins investigation
T+1h       Initial diagnosis posted to #ops
T+2h       Fix deployed or workaround documented
T+4h       Resolution confirmed; monitoring green
Post-fix   Post-incident review within 48 hours
```

### 4.3 Incident Communication Template

**Slack #incident (Sev 1):**
```
:rotating_light: INCIDENT OPENED — Sev 1
Affected: twinmos.com (full outage)
Started: 2026-XX-XX HH:MM UTC
Detected by: UptimeRobot (EU probe)
On-call: @username
Status: Investigating
ETA: T+30 min for first update
```

**Status Update (every 30 min until resolved):**
```
:yellow_circle: INCIDENT UPDATE — Sev 1
Started: 2026-XX-XX HH:MM UTC
Duration: XX minutes
Status: [Investigating / Identified / Monitoring / Resolved]
Details: [Brief description of findings/actions]
Next update: HH:MM UTC
```

**Resolution:**
```
:green_circle: INCIDENT RESOLVED — Sev 1
Duration: XX minutes
Root cause: [Brief description]
Fix: [What was done]
Follow-up: [Post-incident review scheduled for DATE]
```

---

## 5. On-Call Responsibilities

### 5.1 Primary On-Call

- Acknowledge all Sev 1/2 alerts within SLA
- Triage and classify incidents accurately
- Execute runbooks for known failure modes
- Communicate status updates per schedule
- Escalate when stuck or SLA at risk
- Document all actions in incident thread
- Hand off to next rotation with written summary

### 5.2 Backup On-Call

- Monitor primary on-call responsiveness
- Respond if primary is unresponsive within escalation window
- Be available for complex incidents requiring pair debugging
- Cover primary's rotation during PTO

### 5.3 Team Lead (Escalation)

- Engage on Sev 1 incidents after 45 minutes
- Approve major changes during incident (rollback, DNS switch)
- Coordinate with TwinMOS IT Lead on infrastructure issues
- Lead post-incident reviews

---

## 6. Runbook Quick-Reference

| Symptom | Likely Cause | First Action | Runbook |
|---------|--------------|------------|---------|
| Site returns 502/503 | Strapi container down | Check Coolify logs; restart Strapi | Deployment Runbook |
| Site returns 404 on all pages | Cloudflare Pages build failed | Check GitHub Actions; redeploy | Deployment Runbook |
| Database connection errors | PostgreSQL overload / OOM | Check Coolify Postgres metrics; restart if needed | Backup & Restore Runbook |
| Search not working | MeiliSearch down | Restart MeiliSearch container; re-index if needed | — |
| Images not loading | ImgProxy / B2 issue | Check ImgProxy health; verify B2 credentials | — |
| Form submissions failing | Resend API down | Check Resend status page; verify API key | Form Lead Routing Guide |
| High error rate in Sentry | Recent deployment bug | Rollback to previous container image | Rollback Runbook |
| CMS admin inaccessible | Strapi admin crash | Restart Strapi; check for schema migration issues | CMS Admin Guide |

---

## 7. Post-Incident Review

Every Sev 1 and Sev 2 incident requires a post-incident review within:
- **Sev 1:** 24 hours
- **Sev 2:** 48 hours

### Review Template

1. **Timeline:** Precise minute-by-minute chronology
2. **Root Cause:** 5 Whys analysis
3. **Impact:** Users affected, duration, revenue/data impact
4. **Detection:** How was the issue found? Could it have been detected sooner?
5. **Response:** What worked? What was slow/confusing?
6. **Recovery:** Steps taken to restore service
7. **Corrective Actions:** Specific, assigned, with due dates
8. **Runbook Updates:** Any runbook changes required

---

## 8. Document Sign-Off

| Role | Name | Sign-Off | Date |
|------|------|----------|------|
| IT/Technical Lead | (TBC) | _______________ | _________ |
| Unisoft Team Lead | (TBC) | _______________ | _________ |

---

**Document Version:** 1.0  
**Issued:** 1 May 2026  
**Next Review:** Upon Phase 1 launch (Month 5) and quarterly thereafter  
**Canonical Location:** `J - Operations, Maintenance and End-User Guides/J.1 - Operations Runbooks/TwinMOSWebsiteOnCallProcedure.md`
