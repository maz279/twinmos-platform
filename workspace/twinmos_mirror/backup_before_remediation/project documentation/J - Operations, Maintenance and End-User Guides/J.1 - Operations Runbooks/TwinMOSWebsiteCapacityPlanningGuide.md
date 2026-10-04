# TwinMOS Website — Capacity Planning Guide

**Document Reference:** TWN-OPS-2026-005  
**Version:** 1.0  
**Status:** FINAL  
**Date:** 1 May 2026  
**Prepared by:** TwinMOS Digital Transformation Team / Unisoft Engineering  
**Owner:** Unisoft Team Lead / TwinMOS IT Lead  
**Audience:** DevOps, System Administrators, Project Management, TwinMOS Leadership  
**Classification:** CONFIDENTIAL — Internal Use Only  
**Synchronized With:** BRD v3.0 §20.3, §23.2, Tech Stack v1.1 §6.3, §19.4, §22.4

---

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 1 May 2026 | TwinMOS Digital Transformation Team | Initial release |

---

## 1. Purpose

This document provides the capacity planning framework for the TwinMOS corporate website, including 3-year traffic forecasts, infrastructure scaling triggers, pre-event scaling procedures, and database growth projections. It ensures the platform can handle normal operations, product launches, and major events without degradation.

---

## 2. Capacity Baseline & Forecast

### 2.1 3-Year Traffic Projection (BRD §23.2)

| Metric | Year 1 (P1–P2) | Year 2 (P3) | Year 3 (Post-Engagement) |
|--------|----------------|-------------|--------------------------|
| **Page Views / Month** | 50,000 | 250,000 | 500,000 |
| **Peak Concurrent Users** | 1,000 | 5,000 | 10,000 |
| **Products (SKUs)** | ~100 | ~150 | ~200 |
| **CMS Content Entries** | ~10,000 | ~50,000 | ~100,000 |
| **Database Size** | < 5 GB | < 20 GB | < 50 GB |
| **Partner Portal Users** | 0 → 50 | 100+ | 200+ |
| **E-Commerce Orders/Month** | N/A | 500+ | 2,000+ |

### 2.2 Growth Assumptions

- **Organic traffic:** +200% YoY (BRD §28.2)
- **India market entry:** Supertron partnership drives 20–30% of traffic growth in Year 2
- **E-commerce launch (P3):** Adds transactional load (cart, checkout, inventory queries)
- **Multi-language expansion:** Each new locale adds ~15–20% page volume
- **Event spikes:** COMPUTEX, GITEX, Black Friday drive 5–10× normal peak

---

## 3. Infrastructure Sizing

### 3.1 Current Configuration (Phase 1–2)

| Component | Specification | Purpose |
|-----------|--------------|---------|
| **Hetzner VPS** | CX32 — 4 vCPU, 8 GB RAM, 80 GB SSD | Hosts Strapi + PostgreSQL + MeiliSearch + ImgProxy + Plausible |
| **Cloudflare Pages** | Free tier (P1) → Pro ($20/mo, P2+) | Astro static site hosting + CDN |
| **Backblaze B2** | ~$1–5/mo (P1) → $5–15/mo (P2) | Object storage for uploads + backups |
| **Chatwoot** | Separate CX22 or shared CX32 (P2) | Live chat + helpdesk |
| **PostHog** | Separate Hetzner instance (P3) | Session replay + analytics |

### 3.2 Phase 3 Configuration

| Component | Upgrade | Trigger |
|-----------|---------|---------|
| **Hetzner VPS** | CX42 — 8 vCPU, 16 GB RAM, 160 GB SSD | E-commerce launch (P3 Month 10) |
| **PostgreSQL** | Add read replica | Sustained >5,000 concurrent users |
| **Redis** | Add Redis cache layer | Strapi connection count >100 or API latency >300ms |
| **MeiliSearch** | MeiliSearch Cloud Pro or EE sharding | Index size exceeds available RAM |
| **Cloudflare** | Pro tier ($20/mo) + Rate Limiting rules | WAF rule needs exceed free tier |

---

## 4. Scaling Triggers

### 4.1 Automatic Scaling (Vertical)

| Metric | Warning Threshold | Critical Threshold | Action |
|--------|-------------------|-------------------|--------|
| **CPU Usage** | >70% for 5 min | >90% for 5 min | Investigate; plan resize if sustained |
| **RAM Usage** | >70% for 5 min | >90% for 5 min | Investigate; add swap or resize |
| **Disk Usage** | >70% | >85% | Clean logs; plan storage expansion |
| **Database Connections** | >80 | >100 | Add PgBouncer connection pool; plan Redis |
| **API Response Time (p95)** | >300ms | >500ms | Enable Redis cache; optimize queries |
| **MeiliSearch Memory** | >80% of allocated | >95% | Plan index sharding or Cloud migration |
| **Cloudflare Pages Build Minutes** | >80% of free tier | >95% | Upgrade to Pro tier |

### 4.2 Manual Scaling Decisions

| Scenario | Decision Maker | Lead Time | Action |
|----------|---------------|-----------|--------|
| Sustained traffic >2,000 concurrent | Unisoft Team Lead + TwinMOS IT Lead | 1 week | CX32 → CX42 resize |
| Database >15 GB | Unisoft Senior Developer | 1 week | Add read replica or resize storage |
| E-commerce order volume >1,000/mo | TwinMOS Sales Director | 2 weeks | Evaluate Medusa scaling; consider dedicated commerce VPS |
| New market launch (e.g., Africa expansion) | Operational Sponsor | 1 month | Evaluate regional CDN; consider additional Hetzner region |

---

## 5. Pre-Event Scaling

### 5.1 Events Requiring Pre-Scaling

| Event | Typical Traffic Multiplier | Pre-Scaling Action | Timing |
|-------|---------------------------|-------------------|--------|
| **COMPUTEX** | 5–10× peak | CX32 → CX42; aggressive Cloudflare cache; static-first strategy | 7 days before |
| **GITEX Global** | 5–10× peak | Same as COMPUTEX | 7 days before |
| **Black Friday (P3)** | 3–8× peak | CX32 → CX42; e-commerce DB read replica; Stripe load test | 7 days before |
| **Product Launch (major)** | 2–5× peak | Monitor closely; scale if metrics indicate | 3 days before |
| **Regional Campaign (India, etc.)** | 2–3× peak | Review cache rules; ensure locale CDN warm | 2 days before |

### 5.2 Pre-Event Checklist (7 Days Before)

- [ ] Upgrade Hetzner VPS: CX32 → CX42 (if not already)
- [ ] Run load test (k6) at projected peak traffic
- [ ] Verify Cloudflare cache rules are aggressive
- [ ] Warm CDN cache for key pages (homepage, product pages, regional landings)
- [ ] Verify backup system is functional
- [ ] Confirm on-call rotation covers event period
- [ ] Prepare rollback plan (downgrade CX42 → CX32 if needed)
- [ ] Notify stakeholders of scaling changes

### 5.3 Post-Event Scaling (2–3 Days After)

- [ ] Review metrics: peak traffic, response times, error rates
- [ ] If traffic returns to normal: downgrade CX42 → CX32
- [ ] Document actual vs. projected traffic for future planning
- [ ] Update capacity models with observed data
- [ ] Review costs and optimize

---

## 6. Database Growth Planning

### 6.1 PostgreSQL Capacity

| Year | Estimated Size | Growth Driver | Action |
|------|---------------|---------------|--------|
| Year 1 (P1–P2) | < 5 GB | Content entries, form submissions, warranty registrations | CX32 default sufficient |
| Year 2 (P3) | < 20 GB | E-commerce orders, customer accounts, analytics data | Upgrade to CX42 |
| Year 3 | < 50 GB | Continued growth, historical data retention | Add read replica; evaluate dedicated DB server |

### 6.2 Backup Storage (Backblaze B2)

| Data Type | Daily Volume | Monthly Growth | Retention |
|-----------|-------------|----------------|-----------|
| PostgreSQL dumps | ~500 MB–2 GB | +10% | 30 days daily; 12 months monthly |
| WAL archives | ~100 MB/day | +10% | 7 days |
| Strapi uploads | Variable | +5 GB/mo (product images) | Versioned; 30-day daily |
| Compliance archive | Quarterly snapshot | +1 GB/quarter | 7 years |

### 6.3 Index Growth (MeiliSearch)

| Index | Phase 1 Entries | Phase 2 Entries | Phase 3 Entries |
|-------|----------------|-----------------|-----------------|
| `products` | ~100 | ~150 | ~200 |
| `articles` | ~200 | ~400 | ~600 |
| `kb_articles` | ~30 | ~50 | ~100 |
| `news` | ~20 | ~50 | ~100 |
| `compatibility` | ~100 | ~500 | ~1,000 |
| `retailers` | ~200 | ~300 | ~500 |
| `valid_serials` | — | ~10,000 | ~50,000 |
| `medusa_products` | — | — | ~200 |

**Memory requirement:** MeiliSearch typically requires 2–3× index size in RAM. Monitor via Coolify metrics.

---

## 7. Cost Projection

### 7.1 Monthly Infrastructure Cost by Phase

| Service | Phase 1 | Phase 2 | Phase 3 |
|---------|---------|---------|---------|
| Hetzner CX32/CX42 | $13 | $13 | $25 |
| Cloudflare Pro | $0 | $20 | $20 |
| Backblaze B2 | $1–5 | $5–15 | $15–30 |
| Chatwoot VPS | — | $13 | $13 |
| PostHog VPS | — | — | $13 |
| Sentry Team | $0 | $26 | $26 |
| Resend Pro | $0 | $20 | $20 |
| **Total Monthly** | **~$45–60** | **~$120–150** | **~$180–230** |

### 7.2 Scaling Cost Impact

| Action | One-Time Cost | Monthly Impact |
|--------|--------------|----------------|
| CX32 → CX42 | None (same provider) | +$12/mo |
| Add read replica | None | +$13/mo (additional CX32) |
| Add Redis | None | Included on same VPS |
| MeiliSearch Cloud Pro | — | +$29/mo |
| Cloudflare Business | — | +$180/mo (if needed) |

---

## 8. Monitoring & Alerting

### 8.1 Capacity-Related Alerts

| Alert | Source | Threshold | Action |
|-------|--------|-----------|--------|
| CPU >70% | Coolify | Sustained 5 min | Review; plan resize if trend continues |
| RAM >80% | Coolify | Sustained 5 min | Investigate memory leak; plan resize |
| Disk >80% | Coolify | Immediate | Clean logs; expand storage |
| DB connections >90 | PostgreSQL | Sustained 2 min | Add PgBouncer; investigate connection leaks |
| API p95 latency >500ms | Sentry RUM | Sustained 5 min | Enable Redis; optimize slow queries |
| Build minutes >80% | Cloudflare Pages | Daily | Upgrade tier or optimize build |

### 8.2 Capacity Review Meetings

| Meeting | Frequency | Participants | Agenda |
|---------|-----------|--------------|--------|
| Capacity Review | Monthly | Unisoft Team Lead, TwinMOS IT Lead | Review metrics, trends, upcoming events |
| Pre-Event Planning | Per event | All stakeholders | Scaling plan, load test results, rollback plan |
| Annual Capacity Planning | Annually | Project Sponsor, IT Lead, Team Lead | 3-year forecast, budget, infrastructure roadmap |

---

## 9. Document Sign-Off

| Role | Name | Sign-Off | Date |
|------|------|----------|------|
| Project Sponsor (Chairman) | Mohd Mazharul Islam | _______________ | _________ |
| Operational Sponsor (GM Dubai) | Robiul Islam | _______________ | _________ |
| IT/Technical Lead | (TBC) | _______________ | _________ |
| Unisoft Team Lead | (TBC) | _______________ | _________ |

---

**Document Version:** 1.0  
**Issued:** 1 May 2026  
**Next Review:** Monthly (capacity review meeting) and at each phase boundary  
**Canonical Location:** `J - Operations, Maintenance and End-User Guides/J.1 - Operations Runbooks/TwinMOSWebsiteCapacityPlanningGuide.md`
