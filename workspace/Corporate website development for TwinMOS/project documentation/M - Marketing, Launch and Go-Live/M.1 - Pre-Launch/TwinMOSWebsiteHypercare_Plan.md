# TwinMOS Corporate Website — Hypercare Plan

**Document Reference:** TWN-OPS-HC-2026-001  
**Document Version:** 1.0  
**Status:** FINAL  
**Date:** 30 April 2026  
**Prepared by:** TwinMOS Digital Transformation Team  
**Owner:** Marketing Director (Business) / IT Lead (Technical)  
**Audience:** All project stakeholders, support team, marketing team  
**Classification:** CONFIDENTIAL — Internal Use Only  
**Synchronized With:** BRD v3.0, RFP v3.0, Tech Stack v1.1, Launch Plan v1.0, QA Strategy v1.0

---

## 1. Purpose

Hypercare is the **intensive post-launch support period** designed to ensure the rebuilt TwinMOS.com stabilizes, performs, and delivers business value from day one. It bridges the gap between "launch" and "business as usual."

Given the current site's 51 critical issues and the high stakes of this transformation (India market entry, distributor recruitment, competitive parity), hypercare is essential to protect brand credibility and maximize ROI.

---

## 2. Hypercare Scope & Duration

### 2.1 Duration

| Phase | Timeline | Intensity |
|-------|----------|-----------|
| **Intensive Hypercare** | Weeks 19–22 (first 4 weeks post-launch) | Daily standups, 24/7 on-call, real-time monitoring |
| **Standard Hypercare** | Weeks 23–26 (weeks 5–8 post-launch) | Weekly check-ins, business-hours support, periodic reviews |
| **Transition to BAU** | Week 27+ | Monthly reviews, SLA-based support, ongoing optimization |

### 2.2 Scope

| Area | Activities |
|------|------------|
| **Bug Fixes** | P1/P2 defects from launch; user-reported issues |
| **Performance Tuning** | Lighthouse optimization; CDN tuning; database query optimization |
| **Monitoring & Alerting** | 24/7 uptime monitoring; error tracking; performance dashboards |
| **CMS Training** | Marketing team content publishing; product updates; news publishing |
| **Stakeholder Communication** | Daily/weekly status reports; metric dashboards |
| **Security Monitoring** | Dependency updates; vulnerability scanning; access log review |
| **SEO Monitoring** | Indexation tracking; Core Web Vitals; ranking changes |
| **Business Validation** | Lead flow verification; form submission quality; distributor inquiries |

---

## 3. Hypercare Team & Responsibilities

### 3.1 Team Roster

| Role | Person | Hypercare Duty | Contact |
|------|--------|---------------|---------|
| **Hypercare Lead** | Marketing Director | Business outcomes, stakeholder comms, priority setting | Primary escalation |
| **Technical Lead** | IT Lead | Infrastructure, security, vendor coordination | Technical escalation |
| **On-Call Developer** | Dev A (Weeks 19–20) / Dev B (Weeks 21–22) | Frontend fixes, performance, CDN | 24/7 on-call rotation |
| **On-Call Developer** | Dev B (Weeks 19–20) / Dev A (Weeks 21–22) | Backend fixes, database, forms, CMS | 24/7 on-call rotation |
| **QA Lead** | QA Lead | Defect triage, regression testing, UAT support | Business hours + on-call |
| **Support Liaison** | TwinMOS Support Manager | Customer issue triage, warranty/RMA questions | Business hours |

### 3.2 On-Call Rotation

| Week | Primary On-Call | Secondary On-Call | Backup |
|------|----------------|-------------------|--------|
| 19 (Launch week) | Dev A | Dev B | Unisoft bench dev |
| 20 | Dev B | Dev A | Unisoft bench dev |
| 21 | Dev A | Dev B | Unisoft bench dev |
| 22 | Dev B | Dev A | Unisoft bench dev |
| 23–26 | Dev A (Mon–Wed) | Dev B (Thu–Fri) | Unisoft bench dev |

**On-call expectations:**
- Response to critical alerts within 15 minutes.
- S1 defect resolution within 4 hours.
- S2 defect resolution within 24 hours.
- Communication to Hypercare Lead within 30 minutes of any incident.

---

## 4. Monitoring & Alerting

### 4.1 Monitoring Stack

| Tool | Purpose | Alert Channel | Threshold |
|------|---------|---------------|-----------|
| **UptimeRobot** | Uptime from 3+ regions | Email + Slack | Down for > 2 minutes |
| **Sentry** | Error tracking + performance | Slack #alerts | Error rate > 0.1% |
| **Plausible** | Privacy-first analytics | Daily digest | Traffic drop > 30% |
| **Google Analytics 4** | Traffic + conversion tracking | Daily digest | Anomaly detection |
| **Google Search Console** | SEO health + indexation | Weekly email | Coverage drop > 10% |
| **Cloudflare Analytics** | CDN performance + security | Dashboard | DDoS detected |
| **Coolify** | Server health + containers | Slack | CPU > 80% for 5 min |
| **Backblaze B2** | Backup verification | Weekly email | Backup failure |

### 4.2 Alert Severity & Response

| Severity | Condition | Response Time | Action |
|----------|-----------|---------------|--------|
| **P0 — Critical** | Site down; S1 defect affecting > 10% users; security breach | 15 min | On-call dev + IT Lead paged; war room opened |
| **P1 — High** | Core feature broken (search, forms, product pages); performance degradation | 1 hour | On-call dev responds; Hypercare Lead informed |
| **P2 — Medium** | Cosmetic issue; non-core feature broken; SEO warning | 4 hours | Backlog; fix in next business day |
| **P3 — Low** | Enhancement request; minor optimization | 24–48 hours | Scheduled for standard sprint |

---

## 5. Daily Operations

### 5.1 Daily Standup (Intensive Phase: Weeks 19–22)

**Time:** 09:00 GST (Dubai time)  
**Duration:** 15 minutes  
**Attendees:** Dev A, Dev B, QA Lead, Marketing Director (optional), IT Lead (optional)

**Agenda:**
1. What happened yesterday? (incidents, fixes, deployments)
2. What's happening today? (planned fixes, monitoring focus)
3. Any blockers or escalations needed?

### 5.2 Daily Metrics Review

**Morning (09:30 GST):**

| Metric | Source | Target | Action if Missed |
|--------|--------|--------|------------------|
| Uptime (24h) | UptimeRobot | ≥ 99.9% | Investigate; page on-call |
| Error rate | Sentry | < 0.1% | Triage top errors |
| Page views (24h) | Plausible / GA4 | Trending up | Investigate traffic drop |
| Unique visitors | Plausible / GA4 | Trending up | Investigate traffic drop |
| Bounce rate | Plausible / GA4 | < 50% | Review landing pages |
| Avg. session duration | Plausible / GA4 | > 2:00 | Review content engagement |
| Form submissions | Strapi | > 0 expected | Verify form delivery |
| Newsletter signups | Strapi | > 0 expected | Verify double opt-in |
| Warranty registrations | Strapi | > 0 expected | Verify DB + email |
| Core Web Vitals (LCP) | Sentry / Lighthouse | < 2.0s | Performance tuning |

**Evening (17:00 GST):**
- Summary email to all stakeholders with key metrics and any issues.

---

## 6. Weekly Operations (Standard Phase: Weeks 23–26)

### 6.1 Weekly Hypercare Review

**Time:** Monday 10:00 GST  
**Duration:** 30 minutes  
**Attendees:** Marketing Director, IT Lead, Dev A, Dev B, QA Lead, Sales Director

**Agenda:**
1. Week-in-review metrics (vs. previous week, vs. target)
2. Defect summary (opened, closed, carry-over)
3. Performance trends
4. SEO progress (indexation, rankings)
5. Business outcomes (leads, distributor inquiries, support ticket volume)
6. Upcoming priorities for next week
7. Risks and blockers

### 6.2 Weekly Report Template

```
TWINMOS.COM HYPERCARE REPORT — Week [N]
Date: [Date]

1. TRAFFIC & ENGAGEMENT
   - Page Views: [X] (↑/↓ Y%)
   - Unique Visitors: [X] (↑/↓ Y%)
   - Bounce Rate: [X]% (↑/↓ Y%)
   - Avg. Session: [X:XX] (↑/↓ Y%)
   - Mobile Share: [X]%

2. BUSINESS OUTCOMES
   - Contact Forms: [X]
   - Distributor Inquiries: [X]
   - Newsletter Signups: [X]
   - Warranty Registrations: [X]

3. TECHNICAL HEALTH
   - Uptime: [X]% (target: 99.9%)
   - Error Rate: [X]% (target: < 0.1%)
   - LCP: [X]s (target: < 2.0s)
   - S1 Defects Open: [X]
   - S2 Defects Open: [X]

4. SEO PROGRESS
   - Indexed Pages: [X]
   - Organic Sessions: [X]
   - Core Web Vitals Good: [X]%

5. THIS WEEK'S FIXES
   - [List]

6. NEXT WEEK'S PRIORITIES
   - [List]

7. RISKS
   - [List]
```

---

## 7. Defect Management During Hypercare

### 7.1 Defect Triage Process

```
Defect Reported (user, monitoring, or manual test)
    ↓
QA Lead triages within 2 hours
    ↓
├── S1 → Assign to on-call dev immediately → Fix within 4h → Re-test → Deploy
├── S2 → Assign to dev → Fix within 24h → Re-test → Deploy
├── S3 → Backlog for next sprint → Fix within 1 week
└── S4 → Icebox → Evaluate for Phase 2
```

### 7.2 Defect Prioritization Matrix

| Severity | Business Impact | Technical Impact | Fix SLA |
|----------|----------------|------------------|---------|
| **S1** | Revenue at risk; brand damage; legal exposure | Site down; data loss; security breach | 4 hours |
| **S2** | Feature unusable; lead flow blocked; poor UX | Core function broken; significant performance hit | 24 hours |
| **S3** | Workaround exists; minor UX degradation | Non-core feature broken; minor performance | 1 week |
| **S4** | Nice-to-have; enhancement | Cosmetic; optimization opportunity | Phase 2+ |

---

## 8. CMS Training & Knowledge Transfer

### 8.1 Training Schedule

| Session | Topic | Audience | Timing | Owner |
|---------|-------|----------|--------|-------|
| Session 1 | CMS basics: login, navigation, content editing | Marketing team | Week 17 (pre-launch) | Dev B |
| Session 2 | Product management: adding SKUs, updating specs | Product Manager + Marketing | Week 19 | Dev B |
| Session 3 | News & events publishing | Marketing + PR | Week 19 | Dev B |
| Session 4 | Form submission review + lead export | Sales + Marketing | Week 20 | Dev B |
| Session 5 | Image optimization + media library | Marketing | Week 21 | Dev B |
| Session 6 | SEO fields + meta data editing | Marketing + Content | Week 21 | Dev B |
| Session 7 | Advanced: redirects, user management, backups | IT Lead + Marketing | Week 22 | Dev B |

### 8.2 Training Artifacts

| Artifact | Format | Location | Owner |
|----------|--------|----------|-------|
| CMS User Guide | PDF + video | Shared drive / Confluence | Dev B |
| Product Publishing Checklist | Markdown | GitHub / Wiki | Dev B |
| SEO Best Practices Guide | PDF | Shared drive | Marketing |
| Image Standards Document | PDF | Shared drive | Marketing |
| Emergency Contact Card | PDF | Shared drive | IT Lead |

---

## 9. Business Validation

### 9.1 Lead Flow Verification

| Form Type | Verification Method | Frequency | Owner |
|-----------|---------------------|-----------|-------|
| General contact | Submit test; verify email delivery | Daily (Week 1), Weekly | Sales |
| Sales/quote request | Submit test; verify CRM routing | Daily (Week 1), Weekly | Sales |
| Distributor application | Submit test; verify Slack + partners@ | Daily (Week 1), Weekly | Sales |
| Technical support | Submit test; verify ticket creation | Daily (Week 1), Weekly | Support |
| Warranty registration | Submit test; verify DB + confirmation | Daily (Week 1), Weekly | Support |
| Newsletter signup | Submit test; verify double opt-in | Weekly | Marketing |
| Job application | Submit test; verify hr@ delivery | Weekly | HR |

### 9.2 Distributor Feedback Loop

| Week | Activity | Owner |
|------|----------|-------|
| 21–22 | Collect structured feedback; prioritize fixes | Marketing Director |
| 23–24 | Implement distributor-requested improvements | Dev A / Dev B |
| 25–26 | Validate improvements; close feedback loop | Sales Director |

---

## 10. Performance Tuning

### 10.1 Hypercare Performance Targets

| Metric | Launch Target | Week 4 Target | Week 8 Target |
|--------|---------------|---------------|---------------|
| Lighthouse Performance | ≥ 90 | ≥ 92 | ≥ 95 |
| LCP | ≤ 2.0s | ≤ 1.8s | ≤ 1.5s |
| CLS | ≤ 0.1 | ≤ 0.05 | ≤ 0.05 |
| INP | ≤ 200ms | ≤ 150ms | ≤ 100ms |
| TTFB | ≤ 200ms | ≤ 150ms | ≤ 100ms |
| Error rate | < 0.1% | < 0.05% | < 0.01% |

### 10.2 Performance Tuning Tasks

| # | Task | Impact | Owner | Timing |
|---|------|--------|-------|--------|
| 10.2.1 | Image budget audit; compress oversized assets | LCP, Performance | Dev A | Week 19 |
| 10.2.2 | Font subsetting optimization; remove unused weights | LCP, FCP | Dev A | Week 20 |
| 10.2.3 | Third-party script audit; defer non-essential | TTI, INP | Dev A | Week 20 |
| 10.2.4 | Database query optimization; add Strapi indexes | TTFB, API latency | Dev B | Week 21 |
| 10.2.5 | MeiliSearch index tuning; faceting optimization | Search speed | Dev B | Week 21 |
| 10.2.6 | Cloudflare cache rules refinement; edge TTL tuning | TTFB, CDN hit ratio | Dev A | Week 22 |
| 10.2.7 | Astro build optimization; route-level code splitting | Build time, bundle size | Dev A | Week 22 |
| 10.2.8 | Redis caching layer (if needed for Strapi) | API latency | Dev B | Week 23 |

---

## 11. Security During Hypercare

| # | Activity | Frequency | Owner |
|---|----------|-----------|-------|
| 11.1 | Dependency vulnerability scan (Snyk/Dependabot) | Daily | Dev B |
| 11.2 | Access log review (Strapi admin, failed logins) | Daily | Dev B |
| 11.3 | Cloudflare security events review (WAF blocks, DDoS) | Daily | IT Lead |
| 11.4 | Backup verification (daily pg_dump restore test) | Weekly | Dev B |
| 11.5 | CMS user account audit (inactive accounts, roles) | Weekly | IT Lead |
| 11.6 | SSL certificate expiry check | Weekly | IT Lead |
| 11.7 | Penetration test delta scan | Week 22 | External vendor |

---

## 12. Hypercare Exit Criteria

Hypercare concludes when ALL of the following are met:

| # | Criterion | Threshold | Evidence |
|---|-----------|-----------|----------|
| 12.1 | Zero S1 defects for 14 consecutive days | 0 | Defect tracker |
| 12.2 | S2 defects ≤ 3 (with approved plan) | ≤ 3 | Defect tracker |
| 12.3 | Uptime ≥ 99.9% for 30 consecutive days | ≥ 99.9% | UptimeRobot |
| 12.4 | Lighthouse Performance ≥ 92 on all templates | ≥ 92 | Lighthouse CI |
| 12.5 | Error rate < 0.05% sustained | < 0.05% | Sentry |
| 12.6 | CMS team self-sufficient (no dev help needed for content edits) | Yes | Marketing sign-off |
| 12.7 | Lead flow validated (all form types working; routing correct) | Yes | Sales sign-off |
| 12.8 | SEO indexation stable (no coverage drops in GSC) | Stable | GSC report |
| 12.9 | Security scan clean (no new vulnerabilities) | Clean | Snyk report |
| 12.10 | Stakeholder sign-off (Marketing, Sales, IT) | Signed | Sign-off sheet |

**Hypercare Exit Meeting:** Scheduled for Week 26 (or earlier if criteria met).  
**Attendees:** Marketing Director, IT Lead, Dev A, Dev B, QA Lead, Sales Director, Chairman (or delegate).

---

## 13. Transition to Business As Usual (BAU)

### 13.1 BAU Support Model

| Support Tier | Scope | Response Time | Owner |
|--------------|-------|---------------|-------|
| **Tier 1** | Content updates, news publishing, minor edits | Same day | Marketing team (self-service CMS) |
| **Tier 2** | CMS issues, form problems, product data updates | 2 business days | Dev B (remote) |
| **Tier 3** | Feature development, architecture changes, security patches | Sprint-based | Unisoft team (retainer) |

### 13.2 Ongoing Retainer (Post-Hypercare)

Recommended Phase 4 retainer scope (Months 16+):
- Monthly security updates and dependency patches
- Quarterly performance audits
- Continuous SEO optimization
- Content publishing support (as needed)
- Analytics reporting and insights
- Feature backlog execution (loyalty program, additional languages, CRO)

---

## 14. Appendices

### Appendix A: Emergency Contacts

| Role | Name | Phone | Slack | Email |
|------|------|-------|-------|-------|
| Hypercare Lead | Marketing Director | | @marketing-dir | |
| Technical Escalation | IT Lead | | @it-lead | |
| On-Call Developer | Dev A / Dev B | | @dev-a / @dev-b | |
| QA Lead | | | @qa-lead | |
| Cloudflare Emergency | N/A | N/A | N/A | support@cloudflare.com |
| Hetzner Emergency | N/A | N/A | N/A | support@hetzner.com |

### Appendix B: Useful Commands

```bash
# Health check
curl -s https://twinmos.com/api/health | jq

# Database backup (manual)
docker exec twinmos-db pg_dump -U strapi strapi > backup_$(date +%Y%m%d_%H%M%S).sql

# Restart Strapi (if needed)
docker restart twinmos-strapi

# View logs
docker logs -f twinmos-strapi --tail 100

# Clear Cloudflare cache
curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/purge_cache" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

---

*This plan is a sub-document of the Master Launch Plan (`TwinMOSWebsiteLaunch_Plan.md`). Hypercare status is reported daily (intensive phase) and weekly (standard phase) to all stakeholders.*
