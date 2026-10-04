# TwinMOS Website — UptimeRobot Setup Guide

| | |
|:---|:---|
| **Reference** | H.5-003 |
| **Priority** | P1 |
| **Status** | [M] Must-have |
| **Author** | DevOps Lead |
| **Version** | 1.0 |
| **Date** | 2026-05-01 |
| **Review Cycle** | Quarterly |

---

## 1. Purpose

This document defines the UptimeRobot configuration for monitoring the TwinMOS website availability and response times.

---

## 2. Account Setup

| Setting | Value |
|:---|:---|
| **Plan** | Free (50 monitors) |
| **Alert Contact** | Slack webhook + Email |
| **Monitoring Interval** | 5 minutes |
| **Monitor Type** | HTTP(s) |

---

## 3. Monitor Configuration

### 3.1 Production Monitors

| Monitor Name | URL | Type | Interval | Keyword | Alert After |
|:---|:---|:---|:---|:---|:---|
| Homepage | https://www.twinmos.com | HTTP(s) | 5 min | - | 2 failures |
| API Health | https://api.twinmos.com/health | HTTP(s) | 5 min | `ok` | 2 failures |
| Admin Panel | https://api.twinmos.com/admin | HTTP(s) | 5 min | - | 3 failures |
| Staging Site | https://staging.twinmos.com | HTTP(s) | 5 min | - | 3 failures |
| Staging API | https://api-staging.twinmos.com/health | HTTP(s) | 5 min | `ok` | 3 failures |

### 3.2 SSL Certificate Monitors

| Monitor Name | URL | Expiry Alert |
|:---|:---|:---|
| twinmos.com SSL | https://www.twinmos.com | 14 days before |
| api.twinmos.com SSL | https://api.twinmos.com | 14 days before |

### 3.3 Port Monitors

| Monitor Name | Host | Port | Purpose |
|:---|:---|:---|:---|
| SSH Access | `<Hetzner-IP>` | 22 | Server accessibility |
| PostgreSQL | `<Hetzner-IP>` | 5432 | Database (internal) |

---

## 4. Alert Contacts

### 4.1 Slack Integration

1. UptimeRobot -> My Settings -> Alert Contacts -> Add Alert Contact
2. **Type**: Slack
3. **Webhook URL**: `https://hooks.slack.com/services/...`
4. **Channel**: `#ops-alerts`

### 4.2 Email Contacts

| Contact | Email | Schedule |
|:---|:---|:---|
| DevOps Lead | devops@twinmos.com | 24/7 |
| Tech Lead | techlead@twinmos.com | 24/7 |
| Project Manager | pm@twinmos.com | Business hours |

---

## 5. Status Page

| Setting | Value |
|:---|:---|
| **URL** | https://status.twinmos.com |
| **Custom Domain** | Enabled (CNAME to stats.uptimerobot.com) |
| **Public** | Yes |
| **Monitors Shown** | Production only |

---

## 6. Maintenance Windows

| Window | Schedule | Action |
|:---|:---|:---|
| Weekly deploy | Tuesday 09:00 UTC | Pause monitors for 30 min |
| Emergency maintenance | Ad-hoc | Pause affected monitors |

---

## 7. Troubleshooting

| Issue | Solution |
|:---|:---|
| False positives | Increase alert after threshold, check from multiple locations |
| SSL alerts early | Verify certificate chain, check intermediate certs |
| Slow response alerts | Adjust threshold, investigate origin performance |

---

## 8. Change Log

| Version | Date | Author | Changes |
|:---|:---|:---|:---|
| 1.0 | 2026-05-01 | DevOps Lead | Initial release |

---

## 9. Sign-off

| Role | Name | Date | Signature |
|:---|:---|:---|:---|
| DevOps Lead | | | |
| Tech Lead | | | |
| Project Manager | | | |
