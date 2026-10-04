# TwinMOS Website — Monitoring Architecture Overview

| | |
|:---|:---|
| **Reference** | H.5-001 |
| **Priority** | P0 |
| **Status** | [M] Must-have |
| **Author** | DevOps Lead |
| **Version** | 1.0 |
| **Date** | 2026-05-01 |
| **Review Cycle** | Quarterly |

---

## 1. Purpose

This document provides the complete monitoring and observability architecture for the TwinMOS website, covering error tracking, uptime monitoring, analytics, performance monitoring, and alerting.

---

## 2. Monitoring Stack

| Layer | Tool | Purpose | Phase |
|:---|:---|:---|:---|
| **Error Tracking** | Sentry 9.x | Frontend + backend errors, RUM | P1 |
| **Uptime Monitoring** | UptimeRobot | Availability, response time | P1 |
| **Analytics** | Plausible 2.1.x | Privacy-focused web analytics | P1 |
| **Performance** | Lighthouse CI | Core Web Vitals, accessibility | P2 |
| **Log Aggregation** | Cloudflare + Docker | Request logs, error logs | P2 |
| **Infrastructure** | Coolify + Hetzner | CPU, memory, disk, network | P1 |
| **Alerting** | Slack + Email | Notifications, escalations | P1 |

---

## 3. Architecture Diagram

```
                        Monitoring Data Flow

    +----------------+     +----------------+     +----------------+
    |   Frontend     |     |    Backend     |     |  Infrastructure |
    |   (Astro)      |     |   (Strapi)     |     |  (Hetzner)      |
    +-------+--------+     +-------+--------+     +-------+--------+
            |                      |                      |
            v                      v                      v
    +----------------+     +----------------+     +----------------+
    |  Sentry SDK    |     |  Sentry SDK    |     |  Node Exporter |
    |  (Browser)     |     |  (Node.js)     |     |  (Prometheus)  |
    +-------+--------+     +-------+--------+     +-------+--------+
            |                      |                      |
            v                      v                      v
    +----------------+     +----------------+     +----------------+
    |                |     |                |     |                |
    |    Sentry      |     |   UptimeRobot  |     |   Coolify      |
    |   (sentry.io)  |     | (uptimerobot)  |     |  (Built-in)    |
    |                |     |                |     |                |
    +-------+--------+     +-------+--------+     +-------+--------+
            |                      |                      |
            v                      v                      v
    +----------------+     +----------------+     +----------------+
    |   Plausible    |     |   Lighthouse   |     |   Cloudflare   |
    | (self-hosted)  |     |      CI        |     |   Analytics    |
    +-------+--------+     +-------+--------+     +-------+--------+
            |                      |                      |
            +----------------------+----------------------+
                                   |
                                   v
                          +----------------+
                          |  Slack Alerts  |
                          |  #ops-alerts   |
                          |  #dev-alerts   |
                          +----------------+
```

---

## 4. Data Collection

### 4.1 Error Tracking (Sentry)

| Source | Data Type | Volume |
|:---|:---|:---|
| Frontend (Astro) | JavaScript errors, console logs, breadcrumbs | ~100/day |
| Backend (Strapi) | Node.js errors, API failures, DB errors | ~50/day |
| Performance | Web Vitals, transaction traces | ~1000/day |

### 4.2 Uptime Monitoring (UptimeRobot)

| Monitor | URL | Interval | Alert Threshold |
|:---|:---|:---|:---|
| Homepage | https://www.twinmos.com | 5 min | Down > 2 min |
| API Health | https://api.twinmos.com/health | 5 min | Down > 2 min |
| Admin Panel | https://api.twinmos.com/admin | 5 min | Down > 5 min |
| Staging | https://staging.twinmos.com | 5 min | Down > 10 min |

### 4.3 Analytics (Plausible)

| Metric | Collection Method |
|:---|:---|
| Page views | JavaScript snippet (no cookies) |
| Referrers | HTTP headers |
| Device types | User agent parsing |
| Countries | IP geolocation |
| Goals | Custom events |

### 4.4 Performance (Lighthouse CI)

| Check | Frequency | Threshold |
|:---|:---|:---|
| Performance | Every PR + nightly | >= 90 |
| Accessibility | Every PR + nightly | >= 95 |
| Best Practices | Every PR + nightly | >= 90 |
| SEO | Every PR + nightly | >= 90 |
| LCP | Every PR + nightly | <= 1.8s |
| CLS | Every PR + nightly | <= 0.1 |

---

## 5. Alert Routing

| Alert Type | Severity | Channel | Escalation |
|:---|:---|:---|:---|
| Site down | Critical | Slack #ops-alerts + SMS | Tech Lead after 15 min |
| API errors > 5% | Critical | Slack #dev-alerts | Tech Lead after 30 min |
| High error rate | High | Slack #dev-alerts | Daily digest if unresolved |
| Performance degradation | Medium | Slack #dev-alerts | Weekly review |
| Disk > 80% | High | Slack #ops-alerts | Tech Lead after 1 hour |
| Certificate expiry < 7 days | High | Slack #ops-alerts | Daily reminder |
| Dependency vulnerability | Medium | Slack #security-alerts | Weekly review |

---

## 6. Retention Policies

| Data Type | Tool | Retention |
|:---|:---|:---|
| Error events | Sentry | 90 days |
| Performance traces | Sentry | 30 days |
| Uptime logs | UptimeRobot | 12 months |
| Analytics | Plausible | 5 years (configurable) |
| Lighthouse reports | GitHub Artifacts | 30 days |
| Infrastructure metrics | Coolify | 30 days |
| Application logs | Docker | 7 days (10MB per container) |

---

## 7. Access Control

| Tool | Access Level | Users |
|:---|:---|:---|
| Sentry | Admin | DevOps Lead, Tech Lead |
| Sentry | Member | All developers |
| UptimeRobot | Admin | DevOps Lead |
| UptimeRobot | Read | Tech Lead, PM |
| Plausible | Admin | DevOps Lead |
| Plausible | Read | Marketing, PM |
| Coolify Metrics | Admin | DevOps Lead |

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
