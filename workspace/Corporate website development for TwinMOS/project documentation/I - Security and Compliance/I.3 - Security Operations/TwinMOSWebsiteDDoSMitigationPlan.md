# TwinMOS Website — DDoS Mitigation Plan

| Document Attribute | Value |
|---|---|
| **Document ID** | TWN-OPS-2026-006 |
| **Version** | 1.0.0 |
| **Status** | Draft |
| **Author** | Unisoft Technologies Security Team |
| **Owner** | DevOps Lead / Security Engineer |
| **Review Date** | 2026-11-01 |
| **Classification** | Confidential |
| **Related Documents** | TWN-SEC-2026-001 (Security Architecture §4), TWN-SEC-2026-010 (STRIDE Threat Model — T-PUB-05, T-PUB-06), TWN-SEC-2026-011 (Security Controls Catalog — SC-5), TWN-OPS-2026-003 (Security Incident Response Plan), TWN-OPS-2026-005 (WAF Rule Configuration) |
| **Compliance Mapping** | NIST SP 800-53 Rev. 5 SC-5, CP-2, CP-8, IR-4; ISO/IEC 27001:2022 A.5.29, A.5.30, A.8.20; GDPR Art. 32 (availability) |
| **Synchronized With** | BRD v3.0, Tech Stack v1.1, Implementation Strategy v3.0 |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [DDoS Threat Landscape](#2-ddos-threat-landscape)
3. [Protection Architecture](#3-protection-architecture)
4. [Cloudflare DDoS Protection Configuration](#4-cloudflare-ddos-protection-configuration)
5. [Rate Limiting Architecture](#5-rate-limiting-architecture)
6. [Traffic Analysis and Anomaly Detection](#6-traffic-analysis-and-anomaly-detection)
7. [Geo-Based Traffic Filtering](#7-geo-based-traffic-filtering)
8. [Incident Response Playbook](#8-incident-response-playbook)
9. [RACI Matrix](#9-raci-matrix)
10. [Communication Plan](#10-communication-plan)
11. [RTO/RPO Targets](#11-rtorpo-targets)
12. [Testing and Drills](#12-testing-and-drills)
13. [Metrics and Continuous Improvement](#13-metrics-and-continuous-improvement)
14. [Appendix A — DDoS Attack Classification](#appendix-a--ddos-attack-classification)
15. [Appendix B — Emergency Contact Directory](#appendix-b--emergency-contact-directory)

---

## 1. Executive Summary

This DDoS Mitigation Plan defines TwinMOS's strategy for **detecting, absorbing, and recovering from Distributed Denial-of-Service attacks** targeting the corporate website platform. TwinMOS's 27-year brand reputation and global distributor network depend on reliable website availability. A successful DDoS attack could disrupt partner communications, product inquiries, and (in Phase 3) e-commerce operations — causing both direct revenue loss and reputational damage.

### 1.1 Risk Context

| Risk Factor | Assessment |
|---|---|
| **Attack likelihood** | Medium — corporate websites are targeted opportunistically; TwinMOS's global reach increases exposure |
| **Potential impact** | High — website unavailability during business hours disrupts distributor communications across 93+ countries |
| **Current protection maturity** | High — Cloudflare's unmetered DDoS protection provides industry-leading mitigation |
| **Primary residual risk** | L7 (application-layer) attacks that mimic legitimate traffic and are harder to auto-detect |

### 1.2 Protection Summary

| Layer | Technology | Capacity |
|---|---|---|
| **L3/L4 Network** | Cloudflare — unmetered DDoS absorption | 100+ Tbps network capacity |
| **L7 Application** | Cloudflare WAF + custom rules + rate limiting | Adaptive rule-based mitigation |
| **Origin** | Hetzner server + NGINX rate limiting | Last-resort application-level protection |
| **DNS** | Cloudflare DNS (DDoS-resistant) | Anycast, globally distributed |

### 1.3 Availability Targets

| Tier | Target Availability | Max Allowed Downtime/Month |
|---|---|---|
| Public website (twinmos.com) | 99.9% | 43 minutes |
| Strapi API | 99.9% | 43 minutes |
| Partner Portal (P2) | 99.5% | 3.6 hours |
| E-Commerce (P3) | 99.95% | 22 minutes |

---

## 2. DDoS Threat Landscape

### 2.1 Network/Transport Layer Attacks (L3/L4)

| Attack Type | Mechanism | Detection Signal | Challenge |
|---|---|---|---|
| **UDP Flood** | High-volume UDP packets to random/specific ports | Sudden traffic spike; high packet rate with no TCP handshake | Volumetric; absorb at CDN edge |
| **ICMP Flood (Smurf)** | Mass ICMP echo requests | High ICMP traffic; source IP spoofing common | Amplification possible; block at ISP level |
| **SYN Flood** | Incomplete TCP handshakes overwhelm server connection table | High SYN rate; SYN-ACK with no ACK response | TCP stack exhaustion; SYN cookies mitigate |
| **ACK Flood** | Spoofed ACK packets; no matching SYN | High ACK rate from many IPs | Stateful tracking required |
| **DNS Amplification** | Exploit open DNS resolvers to amplify traffic toward target | Very high inbound traffic; source IPs of DNS resolvers | BCP38 filtering; CDN absorbs |
| **NTP Amplification** | Exploit NTP `monlist` command for 100x+ amplification | Large UDP packets from NTP servers (port 123) | High amplification factor; ISP/CDN mitigation |
| **Volumetric Bandwidth Flood** | Raw bandwidth exhaustion | Total traffic >> baseline; ISP upstream congestion | Cloudflare 100+ Tbps capacity handles |

### 2.2 Application Layer Attacks (L7)

| Attack Type | Mechanism | Detection Signal | Challenge |
|---|---|---|---|
| **HTTP Flood (GET/POST)** | Millions of legitimate-looking HTTP requests | High request rate; distributed source IPs; user-agent diversity | Mimics real traffic; behavioral analysis required |
| **Slowloris** | Many partial HTTP connections held open; starves server connection pool | High number of open connections; slow data rate per connection | NGINX `keepalive_timeout` limits; connection limiting |
| **Slow Read** | Request legitimate content; read it extremely slowly | Connections with very slow download rates | Server connection timeout limits |
| **SSL/TLS Exhaustion** | Many TLS handshakes; exhausts CPU (handshake is computationally expensive) | High TLS handshake rate; CPU spike without completed sessions | TLS session resumption; Cloudflare absorbs at edge |
| **Search/API Abuse** | Hammer search API or heavy API endpoints with valid requests | Spike in specific endpoint; valid HTTP 200 responses | Rate limiting per endpoint; query complexity limits |
| **Cache Bypass** | Requests crafted to prevent CDN caching (random query strings) | Cache hit rate drops to near zero; origin receives all traffic | Cache-Control normalization; Cloudflare Cache Rules ignore query strings for static assets |
| **Credential Stuffing (as DDoS)** | Mass credential testing overwhelms auth endpoints | Login endpoint spike; high 401/403 rate from distributed IPs | Rate limiting; CAPTCHA on auth endpoints |

---

## 3. Protection Architecture

### 3.1 Defense-in-Depth Layers

```
[ Attacker — Botnet / Amplification Source ]
        │
        ▼
[ Internet / ISP Layer ]
  Cloudflare anycast network absorbs volumetric attacks
  before traffic reaches Hetzner ISP uplink
        │
        ▼
[ Layer 1: Cloudflare Edge ]
  ├─ Automatic DDoS Mitigation (unmetered)
  │   ├─ L3/L4: UDP/TCP flood, amplification, SYN flood
  │   └─ L7: HTTP flood detection (adaptive rules)
  ├─ WAF Custom Rules (TWN-OPS-2026-005)
  ├─ Rate Limiting Rules (per endpoint)
  ├─ Bot Management (Cloudflare score)
  └─ Geo-based filtering (Challenge, not hard block)
        │ Origin HTTP (Authenticated Pull — Cloudflare IPs only)
        ▼
[ Layer 2: Hetzner Network Layer ]
  ├─ Hetzner upstream DDoS filtering (included in Hetzner Cloud)
  └─ Hetzner firewall: allow only Cloudflare IP ranges
        │
        ▼
[ Layer 3: NGINX Application Layer ]
  ├─ `limit_conn` — connection limiting per IP
  ├─ `limit_req` — request rate limiting per zone
  ├─ `keepalive_timeout` — Slowloris mitigation
  └─ `client_body_timeout` / `client_header_timeout` — Slow HTTP mitigation
        │
        ▼
[ Layer 4: Application — Strapi / Astro ]
  ├─ @upstash/ratelimit middleware
  ├─ GraphQL query depth/complexity limits
  └─ Meilisearch search rate limiting
```

### 3.2 Static Content Offloading

A critical DDoS resilience factor is the aggressive caching of static content at Cloudflare's edge, ensuring that most public website traffic **never reaches the Hetzner origin server**:

| Content Type | Cache Strategy | Cache Hit Rate Target |
|---|---|---|
| Public product pages (Astro SSG) | Cache-Control: public, max-age=86400 | > 95% |
| Product images (Backblaze B2 via Cloudflare) | Immutable + 30-day TTL | > 99% |
| JavaScript/CSS bundles | Immutable + content-hash filename | > 99% |
| API responses (public product list) | Cache 5 minutes + stale-while-revalidate | > 80% |
| Admin UI (/admin/*) | Cache-Control: no-store | 0% (intentional) |
| Contact form submissions | No cache | 0% (intentional) |

High cache hit rates mean the origin server receives only a small fraction of total traffic during an attack, dramatically improving resilience.

---

## 4. Cloudflare DDoS Protection Configuration

### 4.1 Cloudflare DDoS Managed Rules

| Rule Group | Status | Action |
|---|---|---|
| **HTTP DDoS Attack Protection** | ✅ Enabled | Block (automatic sensitivity) |
| **Network-layer DDoS Attack Protection** | ✅ Enabled | Block (automatic) |
| **Advanced TCP Protection** | ✅ Enabled (Business/Enterprise) | Block (SYN floods, out-of-state TCP) |

### 4.2 HTTP DDoS Rule Sensitivity

| Ruleset | Default Sensitivity | TwinMOS Override | Rationale |
|---|---|---|---|
| HTTP DDoS Heuristics | Medium | High (for `/admin/*`, `/api/auth/*`) | Admin paths need aggressive protection |
| HTTP DDoS Heuristics | Medium | Medium (for `/products/*`, `/`) | Standard pages; avoid false positives |
| HTTP DDoS Heuristics | Medium | High (for `/contact*`, `/api/contact*`) | Contact form abuse is common |

### 4.3 Under Attack Mode

**Cloudflare "Under Attack Mode" (I'm Under Attack™)** presents a JavaScript challenge to all visitors, effectively stopping most automated DDoS traffic while allowing legitimate users through after a 5-second wait.

**When to activate:** Automatically recommended during L7 DDoS detection; also manually activated per incident response playbook (Phase 3 below).

```
Activation steps:
1. Log into Cloudflare dashboard
2. Navigate to: Security → Settings → Security Level
3. Change from "Medium" to "I'm Under Attack"
4. Alternatively via API:
   curl -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/security_level" \
     -H "Authorization: Bearer $CF_API_TOKEN" \
     -H "Content-Type: application/json" \
     --data '{"value":"under_attack"}'
```

**Reversion:** Return to "Medium" after attack subsides and traffic normalizes.

### 4.4 Cloudflare DDoS Override Rules

Custom DDoS override rules for TwinMOS-specific traffic patterns:

| Override | Path | Sensitivity | Rationale |
|---|---|---|---|
| Increase sensitivity | `/admin/*` | High | Admin is high-value target; aggressive protection justified |
| Increase sensitivity | `/api/auth/*` | High | Auth endpoint is common DDoS target |
| Maintain sensitivity | `/api/products*` | Medium | High legitimate API traffic; avoid false positives |
| Skip DDoS rule | `/health` | Off | Monitoring must always reach health check |

---

## 5. Rate Limiting Architecture

### 5.1 Three-Tier Rate Limiting

TwinMOS implements rate limiting at three distinct layers for defense-in-depth:

#### Tier 1 — Cloudflare Edge Rate Limiting

Global rate limiting before traffic reaches origin. See TWN-OPS-2026-005 §5 for full rule table. Key thresholds:

| Endpoint | Requests | Window | Action |
|---|---|---|---|
| Login endpoints | 5 | 5 min | Block 30 min |
| Contact form | 5 | 10 min | Block 60 min |
| General API | 200 | 1 min | Challenge |
| Search | 60 | 1 min | Challenge |

#### Tier 2 — NGINX Rate Limiting

NGINX-level rate limiting as fallback (applied to traffic that reaches origin):

```nginx
# nginx.conf — Rate limiting zones
limit_req_zone $binary_remote_addr zone=login:10m rate=1r/m;
limit_req_zone $binary_remote_addr zone=api_general:50m rate=10r/s;
limit_req_zone $binary_remote_addr zone=search:10m rate=1r/s;
limit_req_zone $binary_remote_addr zone=contact:10m rate=1r/m;

# Connection limiting
limit_conn_zone $binary_remote_addr zone=addr:10m;
limit_conn addr 20;  # Max 20 concurrent connections per IP

# Apply zones to location blocks
location /admin/auth/ {
    limit_req zone=login burst=2 nodelay;
    limit_req_status 429;
}

location /api/ {
    limit_req zone=api_general burst=20 nodelay;
    limit_req_status 429;
}

location /api/search {
    limit_req zone=search burst=10 nodelay;
    limit_req_status 429;
}

# Slowloris mitigation
keepalive_timeout 10;
client_body_timeout 10;
client_header_timeout 10;
send_timeout 10;

# Connection-based limits
client_max_body_size 10M;
```

#### Tier 3 — Application Rate Limiting (Upstash Redis / In-Memory)

Application-level rate limiting using `@upstash/ratelimit` in Strapi middleware and Better Auth (P2):

```typescript
// Strapi middleware / Better Auth — rate limiting example
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
  prefix: "@twinmos/ratelimit",
});

// Per-endpoint middleware
export const rateLimitMiddleware = async (ctx, next) => {
  const identifier = ctx.request.ip;
  const { success, limit, reset, remaining } = await ratelimit.limit(identifier);

  ctx.set("X-RateLimit-Limit", String(limit));
  ctx.set("X-RateLimit-Remaining", String(remaining));
  ctx.set("X-RateLimit-Reset", String(reset));

  if (!success) {
    ctx.status = 429;
    ctx.body = { error: "Rate limit exceeded. Please try again later." };
    return;
  }
  await next();
};
```

---

## 6. Traffic Analysis and Anomaly Detection

### 6.1 Baseline Traffic Metrics

Baselines established during first 30 days post-launch. Reviewed quarterly:

| Metric | Normal Baseline | Alert Threshold | Critical Threshold | Automated Response |
|---|---|---|---|---|
| Requests per second (total) | 50–200 rps | 1,000 rps | 5,000 rps | Cloudflare adaptive DDoS rule activation |
| Unique IPs per minute | 100–500 | 5,000 | 20,000 | Cloudflare challenge mode |
| Bot score < 30 (% of traffic) | < 5% | > 20% | > 50% | Bot Fight Mode activation |
| 4xx error rate | < 2% | > 15% | > 40% | Alert + investigation |
| 5xx error rate | < 0.5% | > 5% | > 20% | Alert + origin investigation |
| Login failures per minute | < 5 | > 50 | > 200 | Rate limit escalation + alert |
| Search endpoint rps | < 10 | > 100 | > 500 | Search endpoint rate limit enforcement |
| API endpoint rps | < 50 | > 500 | > 2,000 | API rate limit enforcement |
| Origin bandwidth (Mbps) | < 50 Mbps | > 200 Mbps | > 500 Mbps | Alert DevOps + review |
| Cache hit rate | > 90% | < 70% | < 50% | Cache bypass attack suspected; investigate |

### 6.2 Monitoring Tools

| Tool | What It Monitors | Alert Mechanism |
|---|---|---|
| **Cloudflare Analytics** | Traffic volume, WAF events, bot scores, cache hit rates, error rates | Cloudflare Notifications → Slack/email |
| **UptimeRobot** | Website availability (HTTP 200), response time, SSL certificate expiry | Email + Slack alert if down > 1 min |
| **Sentry** | Application errors, performance degradation (P95 response time) | Sentry alert → Slack #security |
| **Hetzner Metrics** | Server CPU, memory, network bandwidth, disk I/O | Hetzner notification → Email |
| **NGINX access log analysis** | Origin request rate, IP distribution, error rates | Log aggregation + alerting rules |
| **Cloudflare Logpush** | Full WAF event stream, DDoS event stream | Stored in R2/S3; queried on demand |

### 6.3 Automated DDoS Detection Triggers

Cloudflare automatically activates enhanced protection when it detects:

- Unusual traffic volume compared to 7-day historical baseline (adaptive detection)
- Traffic patterns matching known DDoS signatures
- High rate of bot-score-zero traffic
- Spike in 4xx/5xx responses at origin

When Cloudflare auto-detects a DDoS event, it:
1. Automatically applies adaptive rate limiting rules
2. Sends a notification to the registered alert email
3. Logs the event in the Security Events dashboard with `ddos` tag

---

## 7. Geo-Based Traffic Filtering

### 7.1 Philosophy

TwinMOS operates in 93+ countries globally. **Hard geo-blocking is not appropriate** as it would block legitimate customers, partners, and distributors worldwide. Instead, TwinMOS applies **challenge-based geo-filtering** for high-risk traffic patterns.

### 7.2 Geo-Filtering Rules

| Scenario | Countries | Action | Rationale |
|---|---|---|---|
| Traffic spike (>300% baseline) from specific country | Attack-source countries | JS Challenge | Mitigates amplification without blocking legitimate users |
| Access to admin paths from outside known admin countries | All except UAE, Taiwan, India | Block (admin paths only) | CF-001 rule: admin access from known offices only |
| High bot-score traffic (score < 10) | Any | Managed Challenge | Bot traffic challenged regardless of geography |
| Partner portal access (P2) | Configured per partner agreement | Allowlist countries per partner | Partners in specific regions; restrict accordingly |

### 7.3 Geo-Filtering Review

Geo-filtering rules reviewed:
- **Immediately** when an active DDoS attack is identified (add attack-source countries to enhanced challenge)
- **Weekly** — review Cloudflare analytics for unexpected geographic traffic patterns
- **Quarterly** — formal review of all geo-rules with Security Lead sign-off

---

## 8. Incident Response Playbook

### 8.1 DDoS Incident Severity Classification

| Severity | Criteria | Response Time |
|---|---|---|
| **P0 — Critical** | Website unavailable (> 2 min) or origin overwhelmed; business impact confirmed | Immediate (< 5 min) |
| **P1 — High** | Significant degradation (>50% error rate or >5x normal latency) or active DDoS confirmed but service partially available | < 15 min |
| **P2 — Medium** | Elevated traffic (3-5x baseline); Cloudflare auto-mitigating; website still accessible | < 60 min |
| **P3 — Low** | Monitoring alert; traffic within 2-3x baseline; no impact; precautionary | Next business day |

### 8.2 Six-Phase Incident Response Playbook

---

#### Phase 1: Detection (Time: 0–5 minutes)

**Trigger:** UptimeRobot alert OR Cloudflare notification OR DevOps observes anomaly

**Actions:**
1. Confirm attack vs. legitimate traffic spike
   - Check Cloudflare Analytics: requests per second, unique IPs, countries
   - Check UptimeRobot: is site actually down or slow?
   - Check Sentry: application error spike or performance degradation?
2. Classify severity (P0–P3) per table above
3. Log incident start time and initial observations
4. Notify Security Lead (if P0/P1: immediate page; P2: Slack message)

**Decision Point:** Is this a real DDoS or a traffic spike from a marketing campaign/announcement?
- Traffic spike from marketing: normal IPs, normal bot scores → not DDoS → monitor only
- DDoS: clustered IPs/ASNs, low bot scores, abnormal request patterns → proceed to Phase 2

---

#### Phase 2: Immediate Containment (Time: 5–15 minutes)

**Goal:** Stop the bleeding; restore availability as quickly as possible

**Actions (in order):**

1. **Activate Cloudflare "Under Attack" mode** (if P0/P1):
   ```
   Cloudflare Dashboard → twinmos.com → Security → Settings → Security Level → I'm Under Attack
   ```

2. **Apply emergency rate limiting** to the most-abused endpoint:
   - Identify top abused URL in Cloudflare Analytics (Traffic → Requests by URL)
   - Add temporary Cloudflare custom rule to block/challenge that specific path

3. **Block top attacker ASNs** (if attack concentrated in a few ASNs):
   - Cloudflare → Security → WAF → Custom Rules → Add rule blocking `ip.geoip.asnum in {AS12345 AS67890}`

4. **Enable additional Cloudflare bot protection:**
   - WAF → Bot Fight Mode: Ensure enabled
   - Rate Limiting: Lower thresholds on affected endpoints temporarily

5. **Verify origin server health:**
   - SSH to Hetzner VPS: check CPU, memory, NGINX process status
   - If origin overwhelmed: temporarily redirect to maintenance page via Cloudflare Workers (see Appendix B for maintenance page URL)

6. **Log all actions taken with timestamps**

---

#### Phase 3: Analysis (Time: 15–60 minutes, concurrent with containment)

**Goal:** Understand the attack to implement targeted mitigations

**Analysis steps:**

1. **Attack profile:**
   - Attack type (volumetric/protocol/application)?
   - Source: single IP, distributed IPs, specific ASNs/countries?
   - Targeted endpoints: specific URL, entire site?
   - Request characteristics: user-agent patterns, header patterns, request body patterns?
   - Traffic volume: peak rps, total bandwidth?

2. **Cloudflare Firewall Events analysis:**
   - Filter by time of attack
   - Group by IP, ASN, country, user-agent, URI path
   - Identify patterns suitable for rule targeting

3. **Bot score distribution:**
   - If predominantly score < 10: likely bot attack → Bot Fight Mode + challenge
   - If score > 30: L7 application attack mimicking real users → behavioral rules needed

4. **NGINX log analysis (if accessible):**
   ```bash
   # Top IPs hitting origin
   awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head 20
   
   # Most requested URLs
   awk '{print $7}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head 20
   
   # Request rate per minute
   awk '{print $4}' /var/log/nginx/access.log | cut -d: -f1,2,3 | sort | uniq -c
   ```

5. **Determine if attack is targeted or opportunistic:**
   - Targeted (specific to TwinMOS): investigate motivation; consider coordinated response
   - Opportunistic (generic botnet): standard mitigations usually sufficient

---

#### Phase 4: Extended Mitigation (Time: 1–4 hours)

**Goal:** Implement precise, sustainable mitigations that allow legitimate traffic

**Actions:**

1. **Replace broad "Under Attack" mode with targeted rules** (once attack pattern is understood):
   - Cloudflare custom rule targeting identified attack signatures (user-agent, header pattern, IP range)
   - Revert security level from "I'm Under Attack" to "High" or "Medium"

2. **Implement IP reputation block (if attack from known bad IPs):**
   - Upload malicious IP list to Cloudflare IP Lists
   - Apply blocking rule: `ip.src in $malicious_ips`

3. **Apply virtual patch for specific vulnerability being targeted** (if applicable):
   - Coordinate with Dev Lead
   - WAF rule to block specific exploit pattern until code fix deployed

4. **Coordinate with Cloudflare (if Enterprise):**
   - Open Cloudflare support ticket for persistent or extreme attacks
   - Request Magic Transit activation for L3/L4 attacks beyond free protection scope

5. **Consider BGP blackholing (nuclear option):**
   - If attack is on specific IP and is persistent: request Hetzner to null-route the attacked IP temporarily
   - Migrate origin to new IP during attack
   - Update Cloudflare origin IP to new Hetzner IP

6. **Preserve forensic evidence:**
   - Export Cloudflare WAF events (full attack timeframe)
   - Archive NGINX access logs from attack period
   - Record all attacker IPs, ASNs, attack signatures

---

#### Phase 5: Recovery (Time: After attack subsides)

**Goal:** Return to normal operations safely; verify no ongoing attack

**Actions:**

1. **Confirm attack has subsided:**
   - Traffic returned to baseline
   - Error rates normal
   - Bot score distribution normal
   - All UptimeRobot checks passing

2. **Gradually relax protections:**
   - Remove emergency custom rules that may affect legitimate traffic
   - Revert security level to "Medium" (standard setting)
   - Keep any targeted IP/ASN blocks in place for 48 hours minimum

3. **Verify full site functionality:**
   - Test all critical user journeys (product browsing, contact form, search)
   - Test admin access (Strapi login)
   - Test partner portal (P2) if applicable
   - Run Lighthouse / automated test suite against staging

4. **Clear any stale Cloudflare cache** if content was served incorrectly during attack:
   ```
   Cloudflare → Caching → Configuration → Purge Everything
   ```

5. **Restore monitoring to normal sensitivity:**
   - Confirm all UptimeRobot checks active
   - Confirm Cloudflare Notifications configured
   - Confirm Sentry alerting active

---

#### Phase 6: Post-Incident Review (Within 48 hours of incident close)

**Goal:** Learn from the incident; improve defenses

**Deliverables:**

1. **Incident Report** (template in TWN-OPS-2026-003 Appendix):
   - Timeline of events (detection → containment → resolution)
   - Attack profile (type, scale, duration, source characteristics)
   - Actions taken and their effectiveness
   - Total impact (downtime duration, error rate, estimated lost traffic)
   - Regulatory assessment (was GDPR availability breach threshold triggered?)

2. **Lessons Learned:**
   - What detection tool identified the attack? Was it fast enough?
   - Which mitigation actions were most effective?
   - What took longer than expected? Why?
   - What gaps were revealed?

3. **Improvement Actions:**
   - Update this DDoS Mitigation Plan with new playbook steps learned
   - Add new Cloudflare rules targeting identified attack signatures
   - Adjust rate limiting thresholds if too aggressive or too lenient
   - Update threat model (TWN-SEC-2026-010) if new threat pattern identified
   - Schedule tabletop exercise to practice new playbook steps

4. **Communication:**
   - Send post-incident report to TwinMOS IT Lead within 48 hours
   - If public downtime > 5 minutes: post status page update confirming resolution
   - If GDPR availability impact: consult Legal Counsel on reporting obligations

---

## 9. RACI Matrix

### 9.1 DDoS Incident Response RACI

| Activity | Security Lead (Unisoft) | DevOps Engineer (Unisoft) | Dev Lead (Unisoft) | TwinMOS IT Lead | TwinMOS GM Dubai | Legal Counsel |
|---|---|---|---|---|---|---|
| **Attack Detection / Alert** | Responsible | Responsible | Informed | Informed | — | — |
| **Severity Classification** | Responsible | Consulted | — | Informed | Informed (P0) | — |
| **Phase 2: Immediate Containment** | Accountable | Responsible | Consulted | Informed | — | — |
| **Cloudflare Configuration** | Consulted | Responsible | — | — | — | — |
| **Phase 3: Analysis** | Responsible | Responsible | — | Informed | — | — |
| **Phase 4: Extended Mitigation** | Accountable | Responsible | Consulted | Informed | — | — |
| **Executive Communication** | — | — | — | Responsible | Accountable | — |
| **Customer/Partner Communication** | — | — | — | Consulted | Accountable | Informed |
| **Status Page Update** | — | Responsible | — | Approves | — | — |
| **GDPR Impact Assessment** | Informed | — | — | Consulted | — | Accountable |
| **Phase 5: Recovery** | Accountable | Responsible | Consulted | Informed | — | — |
| **Phase 6: Post-Incident Report** | Responsible | Consulted | — | Informed | — | — |

**Key:** Responsible = Does the work | Accountable = Owns the outcome | Consulted = Input required | Informed = Keep in the loop

---

## 10. Communication Plan

### 10.1 Internal Escalation Matrix

| Incident Severity | Notify Immediately | Notify Within 1 Hour | Notify Within 4 Hours |
|---|---|---|---|
| **P0** | Security Lead, DevOps Engineer | TwinMOS IT Lead, Dev Lead | TwinMOS Chairman, GM Dubai, Legal Counsel |
| **P1** | Security Lead, DevOps Engineer | TwinMOS IT Lead | TwinMOS GM Dubai |
| **P2** | DevOps Engineer | Security Lead | TwinMOS IT Lead |
| **P3** | DevOps Engineer (log only) | — | — |

### 10.2 External Communication

#### Customer and Visitor Communication

TwinMOS maintains a **status page** at `status.twinmos.com` (Cloudflare-hosted; resilient to origin outage).

Update frequency during incident:
- P0: Update every 30 minutes
- P1: Update every 60 minutes
- P2: Update within 2 hours if visible impact

Status page message template (DDoS):
```
Title: Service Disruption — Website Performance Issues
Status: Investigating / Identified / Monitoring / Resolved

We are aware that twinmos.com is experiencing [intermittent availability / slow loading times].
Our team is actively investigating and working to restore full service.
For urgent inquiries, please contact us at info@twinmos.com or call +971-4-2996421.
We will provide updates every [30/60] minutes.

Last updated: [TIMESTAMP UTC]
```

#### Partner/Distributor Communication (P2)

During partner portal outage:
- Email to all registered partners sent within 1 hour of P0/P1 detection
- Include: estimated restoration time, alternative contact channels (email, phone)
- Follow-up email when service restored

#### Media / PR Response

If attack generates media attention or social media questions:
- All media inquiries routed to TwinMOS GM Dubai or designated PR contact
- Standard response: "We experienced a technical issue that has been resolved. TwinMOS does not comment on security incidents in detail, but customer data was not compromised."
- Do not confirm or characterize the attack type in public statements

### 10.3 Cloudflare Communication

For active attacks where Cloudflare support may be required:
- Cloudflare Business plan: open priority support ticket via dashboard
- Cloudflare Enterprise: dedicated account team contact (if applicable)
- DDoS escalation: `ddos@cloudflare.com` (last resort; prefer dashboard ticket)

---

## 11. RTO/RPO Targets

### 11.1 Recovery Time Objectives (RTO)

| System Tier | Component | RTO (DDoS scenario) | RTO (Origin failure scenario) |
|---|---|---|---|
| **Public Website** | twinmos.com static pages | 5 minutes (Cloudflare-served) | 15 minutes |
| **Contact Forms** | Form submission API | 30 minutes | 60 minutes |
| **Site Search** | Meilisearch API | 30 minutes | 60 minutes |
| **Strapi API** | Product content API | 30 minutes | 60 minutes |
| **Strapi Admin** | CMS management UI | 60 minutes | 120 minutes |
| **Partner Portal (P2)** | Distributor portal | 120 minutes | 240 minutes |
| **E-Commerce (P3)** | Checkout flow | 60 minutes | 120 minutes |
| **Database (PostgreSQL)** | Data persistence | N/A (not externally exposed) | 240 minutes (restore from backup) |

### 11.2 Recovery Point Objectives (RPO)

| Data Type | RPO | Backup Method |
|---|---|---|
| CMS content (product pages, articles) | 24 hours | Daily automated backup to Backblaze B2 |
| User account data | 1 hour | Hourly PostgreSQL snapshot to Hetzner Volume |
| Contact form submissions | 24 hours | Daily backup |
| Partner portal data (P2) | 1 hour | Hourly snapshot |
| E-commerce orders (P3) | < 1 minute | Stripe maintains authoritative order record; synchronized to PostgreSQL every 5 minutes |
| Audit/security logs | 0 minutes | Real-time log shipping to remote aggregator |

### 11.3 Maintenance Page Fallback

If the origin server is completely unreachable during a severe DDoS attack, a **static maintenance page** is served by Cloudflare Workers (deployed independently of origin):

- URL: `twinmos.com` → Cloudflare Worker serves cached maintenance page
- Content: TwinMOS branding, incident message, contact information (email, phone), estimated restoration time
- Deployment: Maintenance page Worker deployed during Phase 2 containment if needed
- Dependencies: None (no origin server required)

---

## 12. Testing and Drills

### 12.1 Testing Strategy

| Test Type | Frequency | Description | Success Criteria |
|---|---|---|---|
| **Tabletop Exercise** | Quarterly | Walk through the incident response playbook using a hypothetical DDoS scenario; no live traffic affected | Team correctly identifies severity, executes playbook steps, produces incident report |
| **Rate Limit Testing** | Monthly | Send controlled traffic to verify rate limiting thresholds are enforced correctly | Correct HTTP 429 responses at defined thresholds; legitimate traffic not blocked |
| **Cloudflare "Under Attack" Mode Test** | Semi-annual | Activate "Under Attack" mode in staging environment; verify JS challenge appears; verify UptimeRobot alerts | Challenge page appears; monitoring alerts trigger correctly |
| **Maintenance Page Test** | Annual | Deploy maintenance page Worker to staging; verify rendering | Page renders with correct content; contact information accurate |
| **Monitoring Alert Test** | Monthly | Trigger test alert to verify notification pipeline | All team members receive alerts within defined SLA |
| **Live DDoS Simulation** | Annual (optional) | Coordinated with Cloudflare and Hetzner; low-scale HTTP flood against staging only | Cloudflare auto-mitigates; no origin impact; alerts fire; team responds per playbook |

### 12.2 Tabletop Exercise Scenario Template

**Scenario: "Black Friday Surprise"**
- Context: TwinMOS has just launched its Phase 3 e-commerce platform. A competitor-motivated DDoS attack begins on a Monday morning coinciding with a major product launch.
- Attack: 50,000 rps HTTP flood targeting the product listing and checkout endpoints. Cloudflare auto-detects but unusual traffic mimics search engine crawlers.
- Complications: Two team members are unavailable (travel); TwinMOS Chairman is in a press interview.

**Exercise questions:**
1. How quickly is the attack detected? Who detects it first?
2. How is severity classified? Who is notified and in what order?
3. What containment actions are taken? In what order?
4. How is the Chairman's press interview situation handled?
5. When is the status page updated? What does it say?
6. How long does Phase 5 (recovery) take? What verification is done?

### 12.3 Drill Documentation

Each tabletop exercise produces:
- Attendee list and roles
- Scenario walkthrough notes
- Identified gaps and improvement actions
- Updated DDoS Mitigation Plan (if gaps require plan changes)
- Sign-off by Security Lead and TwinMOS IT Lead

---

## 13. Metrics and Continuous Improvement

### 13.1 DDoS KPIs

| KPI | Target | Measurement Frequency |
|---|---|---|
| **Mean Time to Detect (MTTD)** | < 5 minutes | Per incident |
| **Mean Time to Contain (MTTC)** | < 30 minutes (P0) | Per incident |
| **Mean Time to Recover (MTTR)** | < 60 minutes (P0) | Per incident |
| **Website availability (monthly)** | > 99.9% | Monthly |
| **DDoS incidents per quarter** | Tracked (no target) | Quarterly |
| **False positive rate (legitimate traffic blocked)** | < 0.1% of requests | Ongoing |
| **Maximum attack traffic absorbed** | Tracked for capacity planning | Per incident |
| **Cloudflare cache hit rate** | > 90% | Weekly |

### 13.2 Improvement Review Cadence

| Review | Frequency | Inputs | Output |
|---|---|---|---|
| Post-incident review | After every P0/P1 incident | Incident timeline, logs, team feedback | Updated playbook, new WAF rules |
| Quarterly DDoS posture review | Quarterly | KPI trends, industry threat intelligence, Cloudflare updates | Configuration updates, drill planning |
| Annual plan review | Annual | All quarterly reviews, penetration test findings, new attack trends | Revised DDoS Mitigation Plan (new version) |
| Technology review | Annual | Cloudflare product updates, new mitigation technologies | Platform upgrade decisions |

---

## Appendix A — DDoS Attack Classification

### A.1 Attack Layer Reference

| OSI Layer | Layer Name | Attack Examples | Primary Defense |
|---|---|---|---|
| L3 | Network | ICMP flood, IP fragmentation | Cloudflare network filtering |
| L4 | Transport | SYN flood, UDP flood, ACK flood | Cloudflare TCP protection, Hetzner ISP |
| L7 | Application | HTTP flood, Slowloris, cache bypass, API abuse | Cloudflare WAF + rate limiting + NGINX |

### A.2 Amplification Attack Vectors

| Protocol | Amplification Factor | Mitigation |
|---|---|---|
| DNS | Up to 70x | Cloudflare blocks; TwinMOS DNS via Cloudflare (not open resolver) |
| NTP | Up to 556x | Cloudflare blocks; Hetzner upstream filtering |
| SSDP | Up to 30x | Cloudflare blocks; no SSDP services exposed |
| Memcached | Up to 50,000x | No Memcached exposed; Cloudflare blocks |
| QUIC/UDP | Variable | Cloudflare blocks UDP (HTTPS only accepted) |

---

## Appendix B — Emergency Contact Directory

| Role | Name | Contact Method | Availability |
|---|---|---|---|
| **Security Lead (Unisoft)** | TBC | PagerDuty on-call + Slack + Phone | 24/7 on-call |
| **DevOps Engineer (Unisoft)** | TBC | PagerDuty on-call + Phone | 24/7 on-call |
| **Development Lead (Unisoft)** | TBC | Slack + Phone | Business hours + on-call |
| **TwinMOS IT Lead** | TBC | Phone + Email | Business hours (Dubai GMT+4) |
| **Legal Counsel** | TBC | Email + Phone | Business hours |
| **Cloudflare Support** | support.cloudflare.com | Dashboard ticket + emergency phone (Enterprise) | 24/7 |
| **Hetzner Support** | Robot console + support@hetzner.com | Dashboard + Email | 24/7 |

### B.1 Emergency Runbook Quick Reference

| Situation | Immediate Action |
|---|---|
| Site completely down | 1. Check UptimeRobot → 2. Check Cloudflare status → 3. SSH to Hetzner → 4. Activate Under Attack Mode |
| Cloudflare dashboard unreachable | Check status.cloudflare.com → Contact Cloudflare support → Escalate to TwinMOS IT Lead |
| Cannot SSH to Hetzner | Use Hetzner Robot console (web-based) → Contact Hetzner support |
| Under Attack Mode accidentally blocks all users | Revert to Security Level "Medium" → Check rate limiting → Implement targeted custom rule instead |
| Attack from specific country | Add JS Challenge to that country via Cloudflare → Monitor for collateral impact on legitimate users |
| Database under load from L7 attack | Apply query rate limiting at Strapi middleware → Enable read replica if available → Cache API responses |

---

*Document ID: TWN-OPS-2026-006 | Version 1.0.0 | Classification: Confidential | © 2026 TwinMOS Technologies. All rights reserved.*
