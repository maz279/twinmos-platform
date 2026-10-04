# TwinMOS Website — Monitoring Specification

**Document ID:** H.5-001  
**Version:** 1.0  
**Status:** Active  
**Owner:** Tech Lead  
**Last Updated:** 2026-05-01  
**Related:** TwinMOSWebsiteAlerting_Rules.md · TwinMOSWebsiteLogging_Strategy.md · TwinMOSWebsiteSentryConfigurationGuide.md · TwinMOSWebsiteUptimeRobot_Setup.md · TwinMOSWebsiteSLISLODefinitions.md

---

## 1. Monitoring Stack Overview

The TwinMOS website uses a layered monitoring approach spanning frontend, backend, infrastructure, and CDN.

| Tool | Purpose | Tier | Cost |
|------|---------|------|------|
| **Sentry 9.x** | Frontend + backend error tracking, RUM, performance tracing | Application | Free (dev) / $26/mo (Team) |
| **UptimeRobot Pro** | Uptime monitoring, SSL expiry, port checks, public status page | Uptime | $7/mo (50 monitors) |
| **Plausible 2.1** | GDPR-compliant web analytics, custom events, funnel analysis | Analytics | Self-hosted (free) |
| **Lighthouse CI 12.x** | Core Web Vitals regression testing per PR + weekly production | Performance | Free (GitHub Actions) |
| **k6** | Load testing before major events | Performance | Free (self-hosted) |
| **Coolify dashboard** | Docker container health, CPU/RAM/disk on Hetzner server | Infrastructure | Included in Coolify |
| **Cloudflare Analytics** | CDN metrics, WAF events, cache hit ratio, bot traffic | CDN/Security | Included in CF Pro |
| **Cloudflare Logpush** | Raw access log archival to Backblaze B2 | Log Archive | Included in CF Pro |

---

## 2. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          DATA SOURCES                                   │
│                                                                         │
│  Browser (RUM)   Cloudflare (CDN)   Hetzner (Docker)   PostgreSQL      │
│       │               │                   │                │            │
└───────┼───────────────┼───────────────────┼────────────────┼────────────┘
        │               │                   │                │
        ▼               ▼                   ▼                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        COLLECTION AGENTS                                │
│                                                                         │
│  @sentry/astro     Cloudflare        Docker stats       pg_stat_        │
│  @sentry/node      Analytics API     Coolify agent      activity        │
│  Plausible script  CF Logpush → B2   UptimeRobot probe  slow query log  │
│                                                                         │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          STORAGE & ANALYSIS                             │
│                                                                         │
│  Sentry.io (EU)    Cloudflare dash    Coolify metrics    Plausible DB   │
│  30d error events  Real-time CDN      Real-time server   5yr analytics  │
│  7d performance    WAF events         resource graphs    ClickHouse     │
│                                                                         │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          ALERTING & NOTIFICATION                        │
│                                                                         │
│  Sentry Alerts         UptimeRobot Alerts      Cloudflare Alerts        │
│       │                      │                        │                 │
│       └──────────────────────┼────────────────────────┘                 │
│                              ▼                                          │
│                    Slack #alerts / #ops                                 │
│                    Email: devops@twinmos.com                            │
│                    (P2+) PagerDuty                                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Coverage Matrix

| Concern | Tool | Metric | Alert? |
|---------|------|--------|--------|
| Frontend JavaScript errors | Sentry | Error count, error rate | ✅ Yes (Sentry) |
| Backend (Strapi) errors | Sentry | Error count, exception type | ✅ Yes (Sentry) |
| API response time | Sentry Performance, Cloudflare | p50, p95, p99 latency | ✅ Yes (Sentry) |
| Page availability (uptime) | UptimeRobot | HTTP response code | ✅ Yes (UR) |
| API availability | UptimeRobot | HTTP response code + health check | ✅ Yes (UR) |
| SSL certificate expiry | UptimeRobot | Days until expiry | ✅ Yes (UR, 14d) |
| Server CPU | Coolify | % utilization | ✅ Manual (Coolify) |
| Server RAM | Coolify | % used | ✅ Manual (Coolify) |
| Server disk | Coolify | % used | ✅ Manual (Coolify) |
| Docker container health | Coolify | Health check status | ✅ Manual (Coolify) |
| Core Web Vitals (LCP, CLS, INP) | Sentry RUM | Real user measurements | ✅ Yes (Sentry) |
| Core Web Vitals (synthetic) | Lighthouse CI | Lighthouse score | ✅ Yes (CI gate) |
| CDN cache hit ratio | Cloudflare Analytics | % hits | ⚠️ Manual (30min check) |
| WAF blocks / bot attacks | Cloudflare Security | Block count, attack type | ✅ Yes (CF email) |
| PostgreSQL connections | Coolify / pg_stat | Active connection count | ⚠️ Manual check |
| Search latency | Sentry | MeiliSearch response time | ✅ Yes (Sentry) |
| User behaviour analytics | Plausible | Pageviews, conversions | 📊 Reports only |
| Deployment success/fail | GitHub Actions | Workflow status | ✅ Yes (Slack) |
| Backup completion | Cron + Slack webhook | Backup file exists | ✅ Yes (backup script) |

---

## 4. Monitoring Details by Tool

### 4.1 Sentry — Error & Performance Monitoring

**Organisation:** TwinMOS Technologies (EU region — sentry.io/eu)  
**Projects:** `twinmos-frontend`, `twinmos-backend`  
**Retention:** 90 days (Sentry Team plan)

Key metrics collected:
- JavaScript errors with source maps (exact file + line)
- API endpoint transaction traces (Strapi routes)
- Web Vitals per page: LCP, INP, CLS, FCP, TTFB
- Release health: crash-free sessions per deployment
- Performance regression detection between releases

**Sampling rates:**
```
Error events:          100% (always captured)
Performance traces:    10% of transactions (configurable per project)
Session replays:       100% on error, 0% on normal sessions
```

Full configuration: see [TwinMOSWebsiteSentryConfigurationGuide.md](TwinMOSWebsiteSentryConfigurationGuide.md)

### 4.2 UptimeRobot — Uptime Monitoring

**Plan:** Pro (50 monitors, 1-min check intervals)  
**Monitors:** 10 monitors (8 HTTP/HTTPS + 2 SSL expiry)  
**Alert channels:** Email (devops@twinmos.com) + Slack webhook (#alerts)  
**Status page:** https://status.twinmos.com (public)

Check interval per monitor type:
```
Homepage, API health:      5 min (production)
Internal services:         10 min
Staging:                   15 min
SSL certificates:          Daily
```

Full configuration: see [TwinMOSWebsiteUptimeRobot_Setup.md](TwinMOSWebsiteUptimeRobot_Setup.md)

### 4.3 Cloudflare Analytics

Available under Cloudflare Dashboard → twinmos.com → Analytics & Logs:

| Panel | Key Metric | Target |
|-------|-----------|--------|
| Web Analytics → Traffic | Total requests, unique visitors | Baseline awareness |
| Security → WAF | Blocked requests, attack types | 0 bypasses of production data |
| Caching → Cache Analytics | Cache hit ratio | ≥ 85% overall |
| Speed → Performance | TTFB, LCP (Cloudflare RUM) | LCP < 2.5s, TTFB < 150ms |
| Workers & Pages → Deployments | Build success rate | 100% |

**Review cadence:**
- Cache hit ratio: Daily (during event weeks) / Weekly (normal)
- Security events: Weekly
- Performance (TTFB/LCP): Included in weekly report

### 4.4 Coolify Infrastructure Dashboard

Access: https://coolify.twinmos.com (restricted to office IP + VPN)

| Metric | Location in Coolify | Warning | Critical |
|--------|--------------------|---------|---------| 
| CPU utilization | Server → [server-name] → CPU | > 70% 5min | > 90% 2min |
| RAM usage | Server → [server-name] → RAM | > 80% | > 90% |
| Disk usage | Server → [server-name] → Disk | > 70% | > 80% |
| Container status | Applications → [app] → Status | Unhealthy | Not Running |
| Container restarts | Applications → [app] → Logs | > 3 restarts/hr | > 10 restarts/hr |

**Review cadence:** Before and after each deployment; daily during event periods.

### 4.5 Plausible Analytics

Access: https://analytics.twinmos.com (team login)

| Report | Metric | Business Value |
|--------|--------|---------------|
| Top pages | Pageviews per URL | Product page engagement |
| Traffic sources | Referrer domains | Campaign effectiveness |
| Funnel: Product → Datasheet | Conversion rate | Content effectiveness |
| Custom event: CTA Click | Count per product | Content optimisation |
| Geography | Country distribution | MENA vs global ratio |
| Device | Mobile vs desktop | Design priority |

**Review cadence:** Weekly (marketing team); monthly (Chairman report).  
Full configuration: see [TwinMOSWebsitePlausible_Configuration.md](TwinMOSWebsitePlausible_Configuration.md)

---

## 5. Alert Routing

| Severity | Definition | Channels | Ack Time |
|----------|-----------|----------|---------|
| SEV-1 Critical | Complete outage | Slack #ops + email + DM Tech Lead | 15 min |
| SEV-2 Major | Core feature degraded | Slack #ops + email | 30 min |
| SEV-3 Minor | Non-critical service degraded | Slack #alerts | 2 hours |
| SEV-4 Info | Warning threshold crossed | Slack #alerts | 4 hours |

Full alerting rules: see [TwinMOSWebsiteAlerting_Rules.md](TwinMOSWebsiteAlerting_Rules.md)

---

## 6. Data Retention Policy

| Tool | Data Type | Retention | Notes |
|------|-----------|-----------|-------|
| Sentry (Team plan) | Error events | 90 days | After 90d: summary stats only |
| Sentry (Team plan) | Performance data | 90 days | p95 latency trends available |
| Sentry (Team plan) | Session replays | 30 days | Higher storage cost |
| Cloudflare Analytics | Traffic, CDN data | 365 days on Pro | Dashboard shows up to 1 year |
| Cloudflare Logpush | Raw access logs (B2) | 730 days | Archival for compliance/forensics |
| UptimeRobot | Uptime history | 365 days | Required for SLO reporting |
| Plausible | Analytics events | No expiry (5yr policy) | Self-hosted, configurable |
| Coolify | Container logs | Rolling (7 days) | Older logs via journald |

---

## 7. Access Control Matrix

| Team Member | Sentry | Cloudflare Analytics | Coolify | UptimeRobot | Plausible |
|------------|--------|---------------------|---------|-------------|-----------|
| Tech Lead | Owner (all projects) | Super Admin | Admin | Admin | Admin |
| Developer B | Member (all projects) | Admin (Zone) | Operator | Editor | Viewer |
| Chairman | Viewer | Read Only | No access | Viewer | Admin |
| Marketing | No access | No access | No access | No access | Viewer |

---

## 8. Monitoring Dashboards Quick Reference

| Dashboard | URL | When to Use |
|-----------|-----|-------------|
| Sentry — Frontend | sentry.io/eu/organizations/twinmos/issues/?project=twinmos-frontend | Any frontend error investigation |
| Sentry — Backend | sentry.io/eu/organizations/twinmos/issues/?project=twinmos-backend | Strapi/API error investigation |
| Sentry — Performance | sentry.io/eu/.../performance/ | Latency investigation |
| Cloudflare Analytics | dash.cloudflare.com → twinmos.com → Analytics | CDN, WAF, cache investigation |
| Coolify | coolify.twinmos.com | Server resource investigation |
| UptimeRobot | uptimerobot.com/dashboard | Uptime history, SSL status |
| Plausible | analytics.twinmos.com | User behaviour |
| Public Status | status.twinmos.com | Share with users during incidents |

---

## 9. Monitoring Gaps and Future Additions

| Gap | Planned Tool | Phase |
|-----|-------------|-------|
| PostgreSQL-level metrics (query time histogram, vacuum stats) | Prometheus + postgres_exporter | P2 |
| Redis metrics (hit rate, memory) | Prometheus + redis_exporter | P2 |
| Grafana dashboards for infrastructure metrics | Grafana OSS | P2 |
| Session replay for UX debugging | Sentry (already in plan) or PostHog | P2 |
| Real User Monitoring — mobile app (future) | Sentry Mobile SDK | P3+ |
| E-commerce funnel monitoring | Plausible Revenue + Sentry | P3 |
| Security incident monitoring (SIEM) | Cloudflare SIEM or Elastic | P3 |

---

*Approved by: Chairman · Tech Lead*  
*Synchronized With: Technology Stack v1.1 §20.1–§20.6*
