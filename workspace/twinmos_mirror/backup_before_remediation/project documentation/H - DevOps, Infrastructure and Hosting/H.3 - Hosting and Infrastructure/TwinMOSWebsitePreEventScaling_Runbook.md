# TwinMOS Website — Pre-Event Scaling Runbook

**Document ID:** H.3-008  
**Version:** 1.0  
**Status:** Active  
**Owner:** Tech Lead  
**Last Updated:** 2026-05-01  
**Related:** TwinMOSWebsiteHostingArchitectureSpec.md · TwinMOSWebsiteHetznerProvisioningGuide.md · TwinMOSWebsiteCDNCachingStrategy.md · TwinMOSWebsiteDeployment_Runbook.md

---

## 1. Overview

Certain events drive significant traffic spikes to the TwinMOS website. This runbook defines the preparation procedures to ensure the website remains performant and available during peak demand.

**Events requiring pre-scaling:**

| Event | Timing | Expected Peak | Required Server |
|-------|--------|--------------|----------------|
| COMPUTEX Taipei | Late May/early June annually | 5,000–10,000 concurrent users | CX42 |
| GITEX Global Dubai | Mid-October annually | 3,000–8,000 concurrent users | CX42 |
| Black Friday / Cyber Monday (P3) | Late November | 3,000–8,000 concurrent users | CX42 + DB read replica |
| Product launches (major) | As scheduled | 1,000–3,000 concurrent users | CX32 sufficient |
| Regional distributor events | As scheduled | 500–1,000 concurrent users | CX32 sufficient |

---

## 2. Scaling Trigger Metrics

Monitor these metrics in Coolify and Cloudflare Analytics. If thresholds are exceeded, immediate action is required.

| Metric | Warning | Critical | Tool |
|--------|---------|---------|------|
| Hetzner CPU | > 70% sustained 5 min | > 90% sustained 2 min | Coolify dashboard |
| Hetzner RAM | > 80% used | > 90% used | Coolify dashboard |
| Hetzner disk | > 70% used | > 80% used | Coolify dashboard |
| API response time (p95) | > 500 ms | > 1,000 ms | Sentry Performance |
| Strapi error rate | > 1% | > 5% | Sentry |
| Cloudflare cache hit ratio | < 75% | < 60% | Cloudflare Analytics |
| Concurrent connections | > 800 | > 1,200 | Cloudflare Analytics |
| PostgreSQL connections | > 70 active | > 90 active | Coolify / pg_stat_activity |

---

## 3. Pre-Event Timeline

### 7 Days Before Event

**Owner:** Tech Lead

```
□ Announce scaling window in Slack #ops: "COMPUTEX scaling begins [date]"

□ Run k6 load test against staging environment
  Target: 5,000 virtual users (10,000 for COMPUTEX/GITEX peak estimate)
  Duration: 10 minutes ramping + 20 minutes sustained
  Script: k6/scenarios/peak-traffic.js

□ Review k6 results:
  - P95 API latency < 500 ms?
  - Error rate < 1%?
  - Database connection pool not exhausted?

□ Review Cloudflare cache hit ratio (last 7 days)
  - ≥ 85%? → Good
  - < 75%? → Investigate cache rules (see TwinMOSWebsiteCDNCachingStrategy.md §9)

□ Verify Backblaze B2 backup from last 24 hours is valid
  b2 ls --long twinmos-backups-prod/daily/ | head -3

□ Confirm Strapi admin login works
□ Confirm MeiliSearch returns product results
□ Confirm ImgProxy serves images correctly
```

### 3 Days Before Event

**Owner:** Tech Lead  
**Maintenance window:** Schedule for 02:00 UTC (minimum MENA traffic, ~6:00 AM GST)

```
STEP 1: Notify team
  Post in Slack #ops:
  "Scaling twinmos-production CX32 → CX42 tonight at 02:00 UTC.
   Expected ~5 min downtime. All deployments frozen from now until post-event."

STEP 2: Freeze deployments
  □ Set GitHub branch protection: require Tech Lead approval for ALL merges to main
  □ No backend deployments until post-event

STEP 3: Take server snapshot (for rollback)
  Hetzner Console → twinmos-production-01 → Snapshots → Create Snapshot
  Name: "pre-computex-YYYYMMDD"

STEP 4: Resize server
  Hetzner Console → twinmos-production-01 → Power Off (graceful)
  → Resize → Select CX42 (8 vCPU / 16 GB RAM / 160 GB SSD)
  → Click Resize
  (Takes ~3-5 minutes)
  → Power On

STEP 5: Update Coolify resource limits
  After server restart, update memory limits for each service:
  Strapi:       1536m → 3000m
  PostgreSQL:   2048m → 4096m
  MeiliSearch:  1024m → 2048m
  ImgProxy:     512m  → 1024m
  Redis:        320m  → 512m
  Plausible:    512m  → 1024m

STEP 6: Verify all services healthy
  curl https://api.twinmos.com/api/_health     → {"data":{"server":"running"}}
  curl https://search.twinmos.com/health       → {"status":"available"}
  # Verify Plausible dashboard accessible
  # Verify Strapi admin login works

STEP 7 (Optional): Enable Cloudflare Argo Smart Routing
  Cloudflare Dashboard → twinmos.com → Speed → Optimization → Argo Smart Routing
  Toggle ON ($5/mo + $0.10/GB charged)
  Note: Enable only if Cloudflare Analytics shows slow regional TTFBs

STEP 8: Post to Slack #ops
  "CX42 scaling complete. All services healthy. Pre-event watch begins."
```

### 1 Day Before Event

**Owner:** Tech Lead + Developer B

```
□ Deploy freeze confirmation: No code changes until post-event
□ Full database backup completed and verified
  docker exec twinmos-postgres-1 pg_dump -U strapi_user strapi_prod | wc -c
  (Verify non-zero output)

□ Pre-warm Cloudflare cache
  Run: bash scripts/warm-cache.sh
  Target: 50 key product and landing pages

□ Increase Cloudflare HTML cache TTL temporarily (optional)
  Cache Rule: Increase HTML Edge TTL from 1h → 4h for event day
  (Reduces origin load; acceptable as content is frozen)

□ Verify Sentry is capturing events
  Check Sentry dashboard: no new critical issues in last 24h

□ Verify UptimeRobot: all monitors green

□ Enable on-call mode:
  Tech Lead monitors Slack #alerts on mobile throughout event

□ Brief stakeholders:
  "Website is ready for COMPUTEX traffic. Monitoring active."
```

---

## 4. During Event — Active Monitoring

**Monitor every 30 minutes:**

| Check | Tool | Target |
|-------|------|--------|
| All monitors green | UptimeRobot status page | 100% green |
| Cache hit ratio | Cloudflare Analytics → Caching | ≥ 85% |
| API response time | Cloudflare Analytics → Speed | < 500 ms |
| Error rate | Sentry → Issues | 0 new critical issues |
| Server CPU/RAM | Coolify → Server | CPU < 70%, RAM < 80% |
| Database connections | Coolify → PostgreSQL logs | < 80 active connections |

### 4.1 If Cache Hit Ratio Drops Below 75%

```bash
# Identify uncached URLs
# Cloudflare Analytics → Caching → Uncached requests → Sort by volume

# If product pages uncached: increase cache TTL temporarily
# Cloudflare → Cache Rules → HTML pages Edge TTL: 1h → 4h

# If due to query params (e.g. ?utm_source=computex):
# Cloudflare → Cache → Cache Rules → Add rule to ignore query string on /products/*
```

### 4.2 If API Response Time Exceeds 1,000 ms

```bash
# SSH to Hetzner
ssh deploy@<server-ip>

# Check PostgreSQL slow queries
docker exec twinmos-postgres-1 psql -U strapi_user -c \
  "SELECT pid, now() - pg_stat_activity.query_start AS duration, query
   FROM pg_stat_activity
   WHERE (now() - pg_stat_activity.query_start) > interval '5 seconds';"

# Check Strapi container resource usage
docker stats twinmos-strapi-1 --no-stream

# Check active connections
docker exec twinmos-postgres-1 psql -U strapi_user -c \
  "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';"

# If near connection limit: restart Strapi (frees idle connections)
# (In Coolify: Application → twinmos-strapi → Restart)
```

### 4.3 If Server CPU Sustained Above 85%

```bash
# Identify the resource-hungry container
docker stats --no-stream

# Options:
# 1. Scale Strapi to 2 replicas (requires Coolify Enterprise or manual Docker setup)
# 2. Aggressively cache more pages (increase TTL)
# 3. Emergency: scale to larger Hetzner server
#    (Repeat the CX42 upgrade procedure above — but now requires ~5 min downtime)
```

---

## 5. Post-Event Procedure (Within 72 Hours)

```
□ Generate event metrics report:
  - Peak concurrent users (Cloudflare Analytics)
  - Cache hit ratio during event
  - API error rate
  - Server resource utilisation peak
  - Any incidents during event

□ Determine if CX42 should remain permanently or revert to CX32
  Decision criteria:
    CX42 permanent (P3 is close or traffic warrants):
      → Retain CX42 if P3 launch is within 2 months
    Revert to CX32:
      → If peak CPU < 60% on CX42, revert to save €12.10/mo
      → Follow revert procedure below

□ Revert to CX32 (if applicable):
  Hetzner Console → twinmos-production-01 → Power Off
  → Resize → CX32 → Resize → Power On
  Update Coolify resource limits back to CX32 values
  Verify all services healthy

□ Disable Argo Smart Routing (if was enabled):
  Cloudflare → Speed → Argo → Toggle OFF (saves $5+/mo)

□ Restore normal deployment window:
  Remove extra branch protection; normal CI/CD resumes

□ Delete pre-event snapshot (after 7 days stable):
  Hetzner Console → Snapshots → Delete "pre-computex-YYYYMMDD"

□ Update this runbook with any lessons learned
□ Post event summary in Slack #ops
```

---

## 6. Phase 3 Horizontal Scaling (Commerce Traffic)

For P3 commerce launch or Black Friday, vertical scaling may be insufficient. This is a reference for future planning.

```
Horizontal scaling options (P3):

Option A: Hetzner Load Balancer
  Cost: €6.25/mo + traffic
  Setup: Hetzner Cloud Load Balancer → 2× CX32 nodes
  Coolify: Configure shared PostgreSQL + Redis (not replicated per node)

Option B: Database Read Replica
  For heavy product catalog reads:
  Deploy PostgreSQL replica on separate CX22 (€4.51/mo)
  Configure Strapi to use replica for read-only queries
  Primary CX32 handles writes only

Option C: Cloudflare D1 edge database (experimental, P3)
  Move product catalog reads to Cloudflare D1
  Virtually unlimited read capacity at edge
  Complex to implement; evaluate post-P3-launch

Decision: Defer to P3 planning. Track as implementation risk.
```

---

## 7. K6 Load Test Reference

```javascript
// k6/scenarios/peak-traffic.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '5m', target: 1000 },   // Ramp up to 1,000 users
    { duration: '5m', target: 5000 },   // Ramp up to 5,000 users (COMPUTEX peak)
    { duration: '20m', target: 5000 },  // Sustain 5,000 users
    { duration: '5m', target: 0 },      // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],   // 95th percentile < 500ms
    http_req_failed: ['rate<0.01'],     // Error rate < 1%
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://staging.twinmos.com';

const pages = [
  '/',
  '/products/',
  '/products/memory/',
  '/products/voltx-ddr5/',
  '/products/corex-pro-gen5/',
  '/where-to-buy/',
  '/support/',
];

export default function () {
  const page = pages[Math.floor(Math.random() * pages.length)];
  const res = http.get(`${BASE_URL}${page}`);
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  sleep(Math.random() * 3 + 1); // Random think time 1-4 seconds
}
```

```bash
# Run load test against staging
k6 run --env BASE_URL=https://staging.twinmos.com k6/scenarios/peak-traffic.js

# Run against production (coordinate with team — real traffic!)
k6 run --env BASE_URL=https://twinmos.com k6/scenarios/peak-traffic.js
```

---

*Approved by: Chairman · Tech Lead*  
*Synchronized With: Technology Stack v1.1 §19.4, §22.4*
