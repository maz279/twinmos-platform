# TwinMOS Website — SLI/SLO Definitions

**Document ID:** H.5-008  
**Version:** 1.0  
**Status:** Active  
**Owner:** Tech Lead  
**Last Updated:** 2026-05-01  
**Related:** TwinMOSWebsiteMonitoring_Specification.md · TwinMOSWebsiteAlerting_Rules.md · TwinMOSWebsiteUptimeRobot_Setup.md · TwinMOSWebsiteDisasterRecoveryPlan.md

---

## 1. Definitions

| Term | Definition |
|------|-----------|
| **SLI** (Service Level Indicator) | A specific metric that measures one aspect of service quality (e.g., availability percentage, response latency). What we *measure*. |
| **SLO** (Service Level Objective) | The target value or range for an SLI (e.g., ≥99.9% availability). What we *commit to internally*. |
| **SLA** (Service Level Agreement) | A contractual commitment to external parties (distributors, partners). Always *lower* than the corresponding SLO to provide a buffer. |
| **Error Budget** | The amount of time or request volume the SLO allows to be "bad." For a 99.9% availability SLO in a 30-day month: 43.2 minutes. |

**Hierarchy:**
```
SLO (internal target: 99.9% availability)
  └─ SLA (external commitment: 99.5% availability)
       └─ Error budget (43.2 min/month for SLO; 3.6 hours/month for SLA)
```

---

## 2. Service Level Indicators (SLIs)

These are the measurable quantities that define service quality for the TwinMOS website.

| SLI ID | Name | Formula | Tool |
|--------|------|---------|------|
| SLI-01 | **Availability** | successful_requests / total_requests × 100 (where successful = HTTP 2xx) | UptimeRobot |
| SLI-02 | **TTFB (median)** | 50th percentile Time to First Byte from Cloudflare edge | Cloudflare Analytics |
| SLI-03 | **API Latency (p95)** | 95th percentile API response time (Strapi endpoints) | Sentry Performance |
| SLI-04 | **API Error Rate** | (5xx responses) / (total API requests) × 100 | Sentry + Cloudflare |
| SLI-05 | **LCP (p75)** | 75th percentile Largest Contentful Paint from real users | Sentry RUM |
| SLI-06 | **INP (p75)** | 75th percentile Interaction to Next Paint | Sentry RUM |
| SLI-07 | **CLS (p75)** | 75th percentile Cumulative Layout Shift | Sentry RUM |
| SLI-08 | **Search Latency (p95)** | 95th percentile MeiliSearch response time | Sentry Performance |
| SLI-09 | **CDN Cache Hit Ratio** | (cache_hits) / (total_requests) × 100 | Cloudflare Analytics |
| SLI-10 | **Deployment Success Rate** | successful_deploys / total_deploys × 100 | GitHub Actions |

---

## 3. Service Level Objectives (SLOs)

### 3.1 Phase 1 SLOs

| SLO ID | SLI | Target | Measurement Window | Error Budget (30d) | Priority |
|--------|-----|--------|-------------------|--------------------|---------|
| SLO-01 | Availability (SLI-01) | ≥ 99.9% | Rolling 30 days | 43.2 min/month | P0 |
| SLO-02 | API Latency p95 (SLI-03) | < 500 ms | Rolling 7 days | 5% of requests | P1 |
| SLO-03 | API Error Rate (SLI-04) | < 1% | Rolling 24 hours | 1% of requests/day | P0 |
| SLO-04 | LCP Desktop p75 (SLI-05) | < 2.5 s | Rolling 7 days | 25% of page loads | P1 |
| SLO-05 | INP p75 (SLI-06) | < 200 ms | Rolling 7 days | 10% of interactions | P1 |
| SLO-06 | CLS p75 (SLI-07) | < 0.1 | Rolling 7 days | 25% of page loads | P2 |
| SLO-07 | Search Latency p95 (SLI-08) | < 200 ms | Rolling 7 days | 5% of searches | P1 |
| SLO-08 | CDN Cache Hit Ratio (SLI-09) | ≥ 85% | Rolling 7 days | N/A (advisory) | P2 |
| SLO-09 | Deployment Success Rate (SLI-10) | ≥ 95% | Rolling 30 days | 5% of deployments | P2 |

### 3.2 SLO Rationale

**SLO-01 — 99.9% Availability:**
At 99.9% with 30-day window = 43.2 minutes allowable downtime.
This accommodates planned maintenance (~5 min) and unplanned incidents (~38 min). For context: most planned deployments cause 0 minutes downtime (frontend is serverless; backend uses rolling restart).

**SLO-02 — API p95 < 500ms:**
Strapi API serves structured content used to hydrate product pages. If API latency exceeds 500ms at p95, pages that require ISR re-render will be noticeably slow. 500ms matches Cloudflare Analytics recommended TTFB.

**SLO-03 — Error Rate < 1%:**
Any persistent 5xx above 1% indicates a systemic problem (DB connection issues, memory leak, OOM). Below 1% allows for transient container restarts without alarm.

**SLO-04 — LCP < 2.5s:**
Google's "Good" threshold. Required for green Core Web Vitals status in Google Search Console — directly affects SEO ranking for TwinMOS's target search keywords.

**SLO-05 — INP < 200ms:**
Google's "Good" threshold (replaces FID since March 2024). Important for pages with interactive elements: search, product configurator, compatibility finder.

**SLO-07 — Search < 200ms p95:**
MeiliSearch is marketed as <50ms typical. Setting 200ms p95 allows for index updates and cold-start situations while maintaining a responsive user experience. Exceeding 200ms makes search feel laggy.

---

## 4. Error Budget Policy

### 4.1 Error Budget Tracking

| SLO | Monthly Error Budget | How to Track |
|-----|---------------------|-------------|
| SLO-01 (Availability) | 43.2 min | UptimeRobot → Reports → Monthly → Sum downtime events |
| SLO-02 (API Latency) | 5% of API requests in 7d | Sentry Performance → p95 trend chart |
| SLO-03 (Error Rate) | 1% of daily requests | Sentry → Error rate graph (daily) |
| SLO-04 (LCP) | 25% of page loads exceeding 2.5s | Sentry RUM → Web Vitals → LCP distribution |

### 4.2 Error Budget Policy Actions

```
Normal (0–50% budget consumed):
  No action required. Continue normal deployment cadence.

Caution (50–80% budget consumed):
  Notify Tech Lead via Slack #ops:
  "SLO [X] error budget at [Y]%. Increased monitoring for remainder of period."
  Deploy only high-priority fixes.
  Defer non-critical features.

Critical (>80% budget consumed):
  Freeze all non-critical deployments.
  Mandatory post-mortem for the root cause event.
  Sentry error review to identify top contributors.
  Do not resume normal deployment cadence until next measurement period.

Budget Exhausted (100%):
  SLO is violated for this period.
  Incident report required.
  Document in monthly SLO review.
  Root cause must be fixed before next SLO period begins.
```

### 4.3 Example Error Budget Calculation

**SLO-01 — April 2026 (30 days = 43,200 minutes):**

```
Budget: 43.2 minutes (99.9% of 43,200)

Events:
  Apr 3: Strapi container OOM restart — downtime: 4 min → Budget remaining: 39.2 min
  Apr 17: Hetzner scheduled maintenance window — we declared maintenance, not counted
  Apr 24: DNS propagation delay — user-reported, UptimeRobot confirmed 8 min → 31.2 min remaining

Budget consumed: 12 min / 43.2 min = 27.8%
Status: Normal ✅ (under 50%)
```

---

## 5. External SLA (Partners & Distributors)

The external SLA offered to TwinMOS distributors and partners is lower than the internal SLO, providing a buffer:

| Metric | Internal SLO | External SLA | Buffer |
|--------|-------------|-------------|--------|
| Monthly Availability | 99.9% | 99.5% | 0.4% (3.6h extra) |
| API Response Time | p95 < 500ms | p95 < 1000ms | 2× |
| Incident Resolution | ≤ 4h RTO | ≤ 8h RTO | 2× |

**SLA commitment language (for partner agreements):**

```
TwinMOS warrants that the TwinMOS website (twinmos.com) will be available 
for at least 99.5% of the time in any given calendar month, excluding:
  a) Scheduled maintenance windows (announced 48h in advance)
  b) Events caused by third-party providers (Cloudflare, Hetzner force majeure)
  c) Failures caused by distributor systems or integrations

Measurement: UptimeRobot monitoring dashboard; monthly report available upon request.
Contact for SLA issues: devops@twinmos.com
```

---

## 6. Phase 2 SLO Additions

When the Partner Portal (Phase 2) launches, add:

| SLO ID | SLI | Target | Window | Notes |
|--------|-----|--------|--------|-------|
| SLO-P2-01 | Partner Portal Availability | ≥ 99.5% | Rolling 30d | Lower than main site (B2B tool, not consumer) |
| SLO-P2-02 | Partner Portal API Latency | p95 < 800ms | Rolling 7d | Slightly relaxed; complex queries |

---

## 7. Phase 3 SLO Additions

When E-commerce (Phase 3) launches, add commerce-specific SLOs:

| SLO ID | SLI | Target | Window | Business Rationale |
|--------|-----|--------|--------|-------------------|
| SLO-P3-01 | Checkout Page Availability | ≥ 99.95% | Rolling 30d | Any downtime during checkout = lost revenue |
| SLO-P3-02 | Checkout API Latency | p95 < 300ms | Rolling 7d | Stripe payment must be fast |
| SLO-P3-03 | Payment Success Rate | ≥ 99% | Rolling 24h | <1% payment failures acceptable (card declines) |
| SLO-P3-04 | Order Confirmation Email | sent within 60s for 95% of orders | Rolling 24h | Resend API SLO |

---

## 8. SLO Measurement and Reporting

### 8.1 Monthly SLO Review Process

Run on the first Monday of each month:

```
1. Pull UptimeRobot monthly report (previous month)
   → Calculate SLO-01 availability percentage
   → Calculate actual downtime minutes

2. Pull Sentry Performance data (previous month)
   → API p95 latency trend (SLO-02)
   → Error rate (SLO-03)
   → LCP p75 (SLO-04)
   → INP p75 (SLO-05)

3. Pull Cloudflare Analytics cache hit ratio (SLO-08)

4. Fill in monthly SLO scorecard:
```

```markdown
## SLO Monthly Scorecard — [Month Year]

| SLO | Target | Actual | Status | Budget Remaining |
|-----|--------|--------|--------|-----------------|
| SLO-01 Availability | ≥ 99.9% | X.XX% | ✅/⚠️/❌ | Xmin remaining |
| SLO-02 API p95 | < 500ms | XXXms | ✅/⚠️/❌ | N/A |
| SLO-03 Error Rate | < 1% | X.X% | ✅/⚠️/❌ | N/A |
| SLO-04 LCP Desktop | < 2.5s | X.Xs | ✅/⚠️/❌ | X% of loads above |
| SLO-05 INP | < 200ms | XXXms | ✅/⚠️/❌ | X% of interactions |
| SLO-06 CLS | < 0.1 | X.XX | ✅/⚠️/❌ | N/A |
| SLO-07 Search p95 | < 200ms | XXXms | ✅/⚠️/❌ | N/A |
| SLO-08 Cache Hit | ≥ 85% | XX% | ✅/⚠️/❌ | N/A |

Incidents impacting SLOs:
- [date]: [description] — [SLO impacted] — [duration] — [root cause]

Overall: [MEETING / APPROACHING LIMIT / VIOLATED]
```

```
5. Post scorecard in Slack #ops

6. Email monthly summary to Chairman (first Monday)

7. If any SLO violated: create post-incident action item
```

### 8.2 Automated Data Collection Scripts

```bash
#!/usr/bin/env bash
# pull-slo-metrics.sh — collects SLO data for monthly review

echo "=== SLO Metrics Report: $(date +'%B %Y') ==="

# SLO-01: Availability from UptimeRobot API
echo -e "\n--- SLO-01: Availability ---"
curl -s -X POST "https://api.uptimerobot.com/v2/getMonitors" \
  -H "Content-Type: application/json" \
  -d "{\"api_key\":\"${UPTIMEROBOT_API_KEY}\",\"custom_uptime_ratios\":\"30\"}" \
  | jq -r '.monitors[] | "\(.friendly_name): \(.custom_uptime_ratio)%"'

# SLO-08: Cache hit ratio from Cloudflare Analytics API
echo -e "\n--- SLO-08: Cache Hit Ratio (last 7 days) ---"
curl -s "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/analytics/dashboard?since=-168&until=0" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" \
  | jq '(.result.totals.requests.cached / .result.totals.requests.all * 100 | round | tostring) + "% cache hit ratio"'

# SLO-03: Error rate from Cloudflare Analytics
echo -e "\n--- SLO-03: Error Rate (Cloudflare 5xx, last 24h) ---"
curl -s "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/analytics/dashboard?since=-24&until=0" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" \
  | jq '
    .result.totals as $t |
    (.result.timeseries | map(.requests["5xx"] // 0) | add) as $errors |
    ($errors / $t.requests.all * 100 | round * 0.01 | tostring) + "% 5xx error rate"
  '
```

---

## 9. SLO Adjustment Process

SLOs are reviewed quarterly. Adjustment criteria:

```
Tighten SLO when:
  - 3 consecutive months meeting target with >50% budget remaining
  - Business requirement demands higher reliability (e.g., P3 commerce launch)
  - Competitor website sets a new performance standard

Relax SLO when:
  - SLO violated in 2+ consecutive months with documented root cause
  - Infrastructure constraints make target unachievable without major investment
  - Business impact of violations is lower than cost of maintaining target

SLO Change Process:
  1. Tech Lead proposes change with data justification
  2. Chairman approval required
  3. Update this document (version bump)
  4. Notify any parties with SLA references
  5. Update alerting rules if thresholds change
```

---

## 10. SLO Dashboard Quick Reference

| What you want to know | Where to look | How to calculate |
|----------------------|--------------|-----------------|
| Current availability | UptimeRobot → Monitors → Homepage | Uptime % this month |
| API latency trend | Sentry → Performance → Transactions | p95 filter, 7-day range |
| Error rate today | Sentry → Discover → Error rate | Count errors / total requests |
| LCP real users | Sentry → Performance → Web Vitals | LCP p75 histogram |
| Cache hit ratio | Cloudflare → Analytics → Caching | "Cache hit rate" metric |
| Monthly budget remaining | UptimeRobot → Reports | 43.2min - sum(downtime events) |

---

*Approved by: Chairman · Tech Lead*  
*Synchronized With: Technology Stack v1.1 §20.8, §23.1*
