# TwinMOS Website — Incident Response Runbook

| | |
|:---|:---|
| **Reference** | H.4-005 |
| **Priority** | P1 |
| **Status** | [M] Must-have |
| **Author** | DevOps Lead |
| **Version** | 1.0 |
| **Date** | 2026-05-01 |
| **Review Cycle** | Per incident |

---

## 1. Purpose

This runbook defines the incident response process for the TwinMOS website, including severity classification, response procedures, and post-incident activities.

---

## 2. Severity Levels

| Level | Description | Examples | Response Time |
|:---|:---|:---|:---|
| **P1-Critical** | Complete outage or data loss | Site down, database corrupted, security breach | 15 minutes |
| **P2-High** | Major functionality impaired | Checkout broken, admin inaccessible, major feature failure | 1 hour |
| **P3-Medium** | Partial degradation | Slow performance, minor feature broken, non-critical error | 4 hours |
| **P4-Low** | Cosmetic or minor issue | Typo, minor layout issue, non-urgent bug | 24 hours |

---

## 3. Response Team

| Role | Responsibility | Contact |
|:---|:---|:---|
| **Incident Commander** | Coordinates response, makes decisions | Tech Lead |
| **DevOps Engineer** | Infrastructure, deployment, monitoring | DevOps Lead |
| **Developer** | Code fixes, debugging | Available developer |
| **Communications** | Stakeholder updates | Project Manager |

---

## 4. Response Process

### 4.1 Detection

| Source | Alert Channel |
|:---|:---|
| UptimeRobot | Slack #ops-alerts |
| Sentry | Slack #dev-alerts |
| Cloudflare | Email + Slack |
| Manual report | Slack #support |

### 4.2 Triage (First 15 minutes)

1. **Acknowledge** incident in Slack
2. **Assess** severity using matrix above
3. **Assign** Incident Commander
4. **Create** war room (Slack huddle or call)
5. **Communicate** initial status to stakeholders

### 4.3 Investigation

```
1. Check monitoring dashboards
   - UptimeRobot: Is site up?
   - Sentry: Any new errors?
   - Cloudflare: Any attacks?
   - Coolify: Container status?

2. Check recent changes
   - Last deployment time?
   - Recent commits?
   - Infrastructure changes?

3. Check logs
   - Application logs: docker logs strapi-backend
   - Web server logs: /var/log/nginx/
   - System logs: journalctl
```

### 4.4 Mitigation

| Strategy | When to Use |
|:---|:---|
| **Rollback** | Recent deployment caused issue |
| **Restart** | Service hung or memory leak |
| **Scale up** | Resource exhaustion |
| **Disable feature** | Specific feature causing problems |
| **Failover** | Primary system failure (P3) |

### 4.5 Resolution

1. Apply fix or complete rollback
2. Verify system health
3. Monitor for 30 minutes
4. Update status page
5. Close incident in tracking system

---

## 5. Communication

### 5.1 Internal Communication

| Timing | Audience | Channel | Content |
|:---|:---|:---|:---|
| Immediate | Dev team | Slack #incidents | Incident declared, severity, IC assigned |
| Every 30 min | Stakeholders | Slack #incidents | Status update |
| Resolved | All | Slack #incidents | Resolution summary |
| Post-mortem | Dev team | Meeting | Root cause and action items |

### 5.2 External Communication

| Severity | Action |
|:---|:---|
| P1 | Update status page immediately, email customers if > 1 hour |
| P2 | Update status page if > 30 minutes |
| P3-P4 | Update status page if known issue |

---

## 6. Post-Incident Review

### 6.1 Timeline (within 24 hours)

| Time | Action |
|:---|:---|
| T+1 hour | Draft incident timeline |
| T+24 hours | Post-incident review meeting |
| T+48 hours | Publish post-mortem document |
| T+1 week | Verify all action items assigned |

### 6.2 Post-Mortem Template

```
# Incident Post-Mortem: [Title]

## Summary
- Date/Time:
- Duration:
- Severity:
- Impact:

## Timeline
- HH:MM - Detection
- HH:MM - Response started
- HH:MM - Mitigation applied
- HH:MM - Resolved

## Root Cause
[What caused the incident]

## Resolution
[How it was fixed]

## Action Items
| Item | Owner | Due Date |

## Lessons Learned
[What can we improve]
```

---

## 7. Change Log

| Version | Date | Author | Changes |
|:---|:---|:---|:---|
| 1.0 | 2026-05-01 | DevOps Lead | Initial release |

---

## 8. Sign-off

| Role | Name | Date | Signature |
|:---|:---|:---|:---|
| DevOps Lead | | | |
| Tech Lead | | | |
| Project Manager | | | |
