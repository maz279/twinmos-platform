# TwinMOS Corporate Website — Network Topology Diagram

**Document Reference:** TWN-NETTOPO-2026-001
**Document Version:** 1.0
**Status:** DRAFT
**Date:** 1 May 2026
**Synchronized With:** Tech Stack v1.1, HLD v1.0, Deployment Diagram v1.0

---

## Table of Contents

1. [Network Architecture Overview](#1-network-architecture-overview)
2. [Cloudflare Edge Network](#2-cloudflare-edge-network)
3. [Hetzner VPS Internal Topology](#3-hetzner-vps-internal-topology)
4. [External Service Connectivity](#4-external-service-connectivity)
5. [TLS and Certificate Management](#5-tls-and-certificate-management)
6. [Firewall Rules and Segmentation](#6-firewall-rules-and-segmentation)
7. [DNS Architecture](#7-dns-architecture)
8. [VPC and Subnet Design](#8-vpc-and-subnet-design)
9. [Traffic Flow Patterns](#9-traffic-flow-patterns)
10. [Monitoring and Alerting](#10-monitoring-and-alerting)

---

## 1. Network Architecture Overview

### 1.1 High-Level Network Diagram

```
                              INTERNET
                                 |
                    +------------+------------+
                    |                         |
                    v                         v
         +---------------------+   +---------------------+
         |   CLOUDFLARE EDGE   |   |   ADMIN/VPN ACCESS  |
         |   (Global Anycast)  |   |   (Office IPs only) |
         +----------+----------+   +----------+----------+
                    |                         |
                    v                         v
         +---------------------+   +---------------------+
         |  CLOUDFLARE PAGES   |   |  HETZNER CX32/CX42  |
         |  (Static Hosting)   |   |  (Coolify VPS)      |
         |  twinmos.com        |   |  Falkenstein DE     |
         +----------+----------+   +----------+----------+
                    |                         |
                    |    +--------------------+    |
                    |    |                    |    |
                    v    v                    v    v
         +---------------------+   +---------------------+
         |   EXTERNAL SERVICES |   |   INTERNAL SERVICES |
         |   • Backblaze B2    |   |   • Strapi          |
         |   • Resend API      |   |   • PostgreSQL      |
         |   • Stripe API      |   |   • MeiliSearch     |
         |   • HubSpot CRM     |   |   • ImgProxy        |
         |   • Sentry          |   |   • Plausible       |
         |   • GA4/GTM         |   |   • Redis (P2)      |
         |   • OpenStreetMap   |   |   • Chatwoot (P2)   |
         |   • UptimeRobot     |   |   • Medusa (P3)     |
         +---------------------+   +---------------------+
```

### 1.2 Network Zones

| Zone | Purpose | Trust Level | Primary Location |
|------|---------|-------------|------------------|
| Edge Zone | CDN, WAF, DDoS protection | Semi-trusted | Cloudflare Global |
| Frontend Zone | Static site hosting | Trusted (read-only) | Cloudflare Pages |
| Application Zone | CMS, APIs, business logic | Trusted | Hetzner VPS |
| Data Zone | Database, search, cache | Highly trusted | Hetzner VPS (localhost) |
| Storage Zone | Object storage, backups | Trusted | Backblaze B2 |
| External Zone | Third-party APIs | Untrusted (external) | Various SaaS |
| Admin Zone | CMS admin, SSH access | Highly trusted | IP-restricted |

---

## 2. Cloudflare Edge Network

### 2.1 Edge Services Configuration

```
                    INTERNET
                       |
           +-----------+-----------+
           |                       |
           v                       v
    +-------------+        +-------------+
    |   DNS       |        |   CDN/WAF   |
    |   (Anycast) |        |   (Edge)    |
    +-------------+        +------+------+
                                  |
                    +-------------+-------------+
                    |                           |
                    v                           v
           +----------------+          +----------------+
           |  Static Cache  |          |  API Proxy     |
           |  (HTML/CSS/JS) |          |  (Strapi)      |
           +----------------+          +----------------+
                    |                           |
                    v                           v
           +----------------+          +----------------+
           |  Cloudflare    |          |  Rate Limiting |
           |  Pages         |          |  100 req/min   |
           |  (Astro SSG)   |          |  (public)      |
           +----------------+          +----------------+
```

### 2.2 Cloudflare Configuration

| Feature | Setting | Purpose |
|---------|---------|---------|
| SSL/TLS | Full (strict) | End-to-end encryption |
| TLS Version | 1.3 minimum | Modern cipher suites |
| HSTS | max-age=31536000; includeSubDomains; preload | Force HTTPS |
| WAF | OWASP Core Rule Set | OWASP Top 10 protection |
| Bot Management | Fight Mode + Turnstile | Block abusive bots |
| DDoS Protection | Unmetered | L3/L4/L7 mitigation |
| Rate Limiting | 100 req/min public, 1000 req/min auth | API protection |
| Geo-blocking | Admin routes: office IPs + VPN only | Reduce attack surface |
| Page Rules | admin.* -> cache bypass; api.* -> cache 60s | Cache strategy |
| Argo Smart Routing | Enabled (Phase 2) | Optimized routing |

---

## 3. Hetzner VPS Internal Topology

### 3.1 Single-VPS Service Layout (Phase 1-2: CX32)

```
+------------------------------------------------------------------+
|                    HETZNER CX32 VPS                              |
|                    Falkenstein, Germany                          |
|                    4 vCPU / 8 GB RAM / 80 GB SSD                 |
+------------------------------------------------------------------+
|                                                                  |
|  +------------------+  +------------------+  +----------------+ |
|  |   DOCKER/COOLIFY |  |   DOCKER/COOLIFY |  |  DOCKER/COOLIFY| |
|  |   CONTAINER      |  |   CONTAINER      |  |  CONTAINER     | |
|  |                  |  |                  |  |                | |
|  |  +------------+  |  |  +------------+  |  |  +----------+  | |
|  |  |  STRAPI    |  |  |  | POSTGRESQL |  |  |  |MEILISEARCH| | |
|  |  |  Node.js   |  |  |  |   16.x     |  |  |  |  1.13.x   | | |
|  |  |  :1337     |  |  |  |   :5432    |  |  |  |  :7700    | | |
|  |  +------------+  |  |  +------------+  |  |  +----------+  | |
|  |       |          |  |       |          |  |       |        | |
|  +-------|----------+  +-------|----------+  +-------|--------+ |
|          |                     |                     |           |
|  +-------|---------------------|---------------------|--------+ |
|  |       |    INTERNAL DOCKER NETWORK (bridge)       |        | |
|  |       v                     v                     v        | |
|  |  +------------+      +------------+      +------------+   | |
|  |  |  IMGPROXY  |      |  PLAUSIBLE |      |   REDIS    |   | |
|  |  |   :8080    |      |   :8000    |      |   :6379    |   | |
|  |  +------------+      +------------+      +------------+   | |
|  |                                                            | |
|  +------------------------------------------------------------+
|                                                                  |
|  +------------------+  +------------------+                     |
|  |   UFW FIREWALL   |  |   FAIL2BAN       |                     |
|  |   (Host level)   |  |   (Brute force)  |                     |
|  +------------------+  +------------------+                     |
|                                                                  |
+------------------------------------------------------------------+
```

### 3.2 Phase 3 Expansion (CX42 + Additional Services)

```
+------------------------------------------------------------------+
|                    HETZNER CX42 VPS                              |
|                    8 vCPU / 16 GB RAM / 160 GB SSD               |
+------------------------------------------------------------------+
|                                                                  |
|  Phase 1-2 services (above) +                                    |
|                                                                  |
|  +------------------+  +------------------+  +----------------+ |
|  |    CHATWOOT      |  |     MEDUSA       |  |   POSTHOG      | |
|  |    (P2)          |  |     (P3)         |  |   (P3)         | |
|  |    :3000         |  |     :9000        |  |   :8000        | |
|  +------------------+  +------------------+  +----------------+ |
|                                                                  |
|  Optional: Separate Chatwoot VPS (CX22) for isolation           |
|                                                                  |
+------------------------------------------------------------------+
```

### 3.3 Internal Port Mapping

| Service | Internal Port | External Exposure | Notes |
|---------|---------------|-------------------|-------|
| Strapi | 1337 | Via Cloudflare proxy only | Admin at /admin |
| PostgreSQL | 5432 | localhost only | No external access |
| MeiliSearch | 7700 | Via Strapi proxy only | Public key read-only |
| ImgProxy | 8080 | Via Cloudflare proxy only | Signed URLs required |
| Plausible | 8000 | localhost + internal | Analytics dashboard |
| Redis | 6379 | localhost only | Session/cache store |
| Chatwoot | 3000 | Via Cloudflare proxy (P2) | Widget endpoint |
| Medusa | 9000 | Via Cloudflare proxy (P3) | Storefront API |
| PostHog | 8000 | Internal only (P3) | Analytics dashboard |

---

## 4. External Service Connectivity

### 4.1 Outbound Connections from Hetzner VPS

```
+------------------------------------------------------------------+
|                    HETZNER VPS                                     |
|                                                                  |
|  +------------------------------------------------------------+ |
|  |  OUTBOUND CONNECTIONS (via NAT / public IP)                | |
|  |                                                            | |
|  |  HTTPS (443) -> api.resend.com        (Transactional email)| |
|  |  HTTPS (443) -> api.stripe.com        (Payments - P3)      | |
|  |  HTTPS (443) -> api.hubapi.com        (CRM leads)          | |
|  |  HTTPS (443) -> o123.ingest.sentry.io (Error monitoring)   | |
|  |  HTTPS (443) -> www.google-analytics.com (GA4 - opt-in)    | |
|  |  HTTPS (443) -> s3.us-west-002.backblazeb2.com (Storage)   | |
|  |  HTTPS (443) -> tile.openstreetmap.org (Map tiles)         | |
|  |  HTTPS (443) -> github.com            (CI/CD webhooks)     | |
|  |                                                            | |
|  |  SMTP (587) -> smtp.resend.com      (Email fallback)       | |
|  |                                                            | |
|  +------------------------------------------------------------+ |
+------------------------------------------------------------------+
```

### 4.2 External Service Integration Matrix

| Service | Protocol | Port | Auth Method | Data Volume |
|---------|----------|------|-------------|-------------|
| Resend API | HTTPS | 443 | API key (Bearer) | ~50K emails/yr |
| Stripe API | HTTPS | 443 | Secret key + webhook sig | ~1K txns/mo (P3) |
| HubSpot CRM | HTTPS | 443 | OAuth 2.0 client credentials | ~5K leads/yr |
| Sentry | HTTPS | 443 | DSN (project key) | ~10K events/mo |
| Backblaze B2 | HTTPS | 443 | Application key + secret | ~100GB/yr |
| OpenStreetMap | HTTPS | 443 | None (attribution required) | ~1GB tiles/mo |
| Google Analytics | HTTPS | 443 | Measurement ID (consent-gated) | ~50K events/mo |
| UptimeRobot | HTTPS | 443 | API key | Health checks |

---

## 5. TLS and Certificate Management

### 5.1 TLS Termination Points

| Layer | Termination | Certificate Source | TLS Version |
|-------|-------------|-------------------|-------------|
| Cloudflare Edge | Primary termination | Cloudflare-managed | TLS 1.3 |
| Cloudflare -> Origin | Origin pull | Cloudflare Origin CA | TLS 1.3 |
| Strapi Admin | Application | Let's Encrypt (Coolify) | TLS 1.3 |
| ImgProxy | Application | Let's Encrypt (Coolify) | TLS 1.3 |
| PostgreSQL | Application | Self-signed (internal) | TLS 1.3 |
| MeiliSearch | Application | Self-signed (internal) | TLS 1.3 |

### 5.2 Certificate Renewal

| Certificate | Source | Auto-renewal | Expiry Alert |
|-------------|--------|--------------|--------------|
| Cloudflare Edge | Cloudflare | Automatic (managed) | N/A |
| Origin CA | Cloudflare | 15-year validity | N/A |
| Let's Encrypt | Certbot (Coolify) | Auto (90-day cycle) | 7 days before |
| Internal (Postgres) | Self-signed | Manual (1-year) | 30 days before |

---

## 6. Firewall Rules and Segmentation

### 6.1 UFW (Uncomplicated Firewall) Rules — Host Level

```
+------------------------------------------------------------------+
|                    UFW FIREWALL RULES                            |
+------------------------------------------------------------------+
|                                                                  |
|  INBOUND (ALLOW):                                                |
|  +--------+----------+----------------------------------------+ |
|  | Port   | Source   | Purpose                                | |
|  +--------+----------+----------------------------------------+ |
|  | 22     | Office IP| SSH (admin access only)                | |
|  | 80     | Any      | HTTP -> redirect to HTTPS              | |
|  | 443    | Any      | HTTPS (Cloudflare proxy)               | |
|  | 1337   | CF only  | Strapi API (Cloudflare proxy)          | |
|  +--------+----------+----------------------------------------+ |
|                                                                  |
|  INBOUND (DENY):                                                 |
|  +--------+----------+----------------------------------------+ |
|  | 5432   | Any      | PostgreSQL (localhost only)            | |
|  | 6379   | Any      | Redis (localhost only)                 | |
|  | 7700   | Any      | MeiliSearch (Strapi proxy only)        | |
|  | 8080   | Any      | ImgProxy (Cloudflare proxy only)       | |
|  +--------+----------+----------------------------------------+ |
|                                                                  |
|  OUTBOUND (ALLOW):                                               |
|  +--------+----------+----------------------------------------+ |
|  | 443    | Any      | HTTPS to external APIs                 | |
|  | 587    | Any      | SMTP (Resend fallback)                 | |
|  | 53     | Any      | DNS resolution                         | |
|  +--------+----------+----------------------------------------+ |
|                                                                  |
+------------------------------------------------------------------+
```

### 6.2 Docker Network Isolation

```
+------------------------------------------------------------------+
|                    DOCKER NETWORK SEGMENTATION                   |
+------------------------------------------------------------------+
|                                                                  |
|  +------------------+  +------------------+  +----------------+ |
|  |  PUBLIC NETWORK  |  |  INTERNAL NETWORK|  |  ADMIN NETWORK | |
|  |  (proxy-net)     |  |  (backend-net)   |  | (admin-net)    | |
|  |                  |  |                  |  |                | |
|  |  Strapi (public) |  |  PostgreSQL      |  |  Plausible     | |
|  |  ImgProxy        |  |  MeiliSearch     |  |  Redis         | |
|  |  Chatwoot widget |  |  Redis           |  |                | |
|  +------------------+  +------------------+  +----------------+ |
|                                                                  |
|  Rules:                                                          |
|  - public-net can access backend-net (via Strapi)               |
|  - backend-net cannot access public-net                         |
|  - admin-net isolated; only SSH tunnel access                   |
|                                                                  |
+------------------------------------------------------------------+
```

---

## 7. DNS Architecture

### 7.1 DNS Zone Configuration

```
twinmos.com (Cloudflare DNS)
|
+-- @ (apex)          -> A/AAAA -> Cloudflare Pages
+-- www               -> CNAME -> twinmos.com (301 redirect)
+-- admin             -> A -> Hetzner VPS (IP-restricted)
+-- api               -> A -> Hetzner VPS (Cloudflare proxy)
+-- search            -> A -> Hetzner VPS (MeiliSearch proxy)
+-- imgproxy          -> A -> Hetzner VPS (image transforms)
+-- chat              -> A -> Hetzner VPS (Chatwoot - P2)
+-- shop              -> A -> Hetzner VPS (Medusa - P3)
+-- partner           -> A -> Hetzner VPS (Partner portal - P2)
+-- plausible         -> A -> Hetzner VPS (analytics dashboard)
+-- dev               -> A -> Hetzner CX22 (dev environment)
+-- staging           -> A -> Hetzner CX32 (staging environment)
+-- mail              -> MX -> Resend / SPF + DKIM + DMARC
+-- _dmarc            -> TXT -> v=DMARC1; p=quarantine; ...
```

### 7.2 DNS Records Detail

| Record | Type | Value | TTL | Purpose |
|--------|------|-------|-----|---------|
| `@` | A | Cloudflare Pages IPs | Auto | Main website |
| `www` | CNAME | twinmos.com | Auto | Redirect to apex |
| `admin` | A | Hetzner VPS IP | 300 | Strapi admin panel |
| `api` | A | Hetzner VPS IP | 300 | Strapi REST API |
| `imgproxy` | A | Hetzner VPS IP | 300 | Image transformation |
| `mail` | MX | 10 feedback-smtp.us-east-1.amazonses.com | 300 | Resend routing |
| `_dmarc` | TXT | v=DMARC1; p=quarantine; rua=mailto:dmarc@twinmos.com | 300 | DMARC policy |
| `_spf` | TXT | v=spf1 include:resend.include:amazonses.com ~all | 300 | SPF record |

---

## 8. VPC and Subnet Design

### 8.1 Hetzner Cloud Network (Optional Phase 3)

For Phase 3, if multi-VPC is required:

```
+------------------------------------------------------------------+
|                    HETZNER CLOUD NETWORK                         |
|                    10.0.0.0/16                                   |
+------------------------------------------------------------------+
|                                                                  |
|  +------------------+  +------------------+  +----------------+ |
|  |  PUBLIC SUBNET   |  |  PRIVATE SUBNET  |  |  ADMIN SUBNET  | |
|  |  10.0.1.0/24     |  |  10.0.2.0/24     |  |  10.0.3.0/24   | |
|  |                  |  |                  |  |                | |
|  |  Load Balancer   |  |  Strapi          |  |  Bastion host  | |
|  |  NAT Gateway     |  |  PostgreSQL      |  |  VPN endpoint  | |
|  +------------------+  |  MeiliSearch     |  +----------------+ |
|                        |  Redis           |                     |
|                        +------------------+                     |
|                                                                  |
|  Routing:                                                        |
|  - Public subnet: Internet gateway attached                      |
|  - Private subnet: NAT gateway for outbound only                 |
|  - Admin subnet: VPN/bastion only; no direct internet            |
|                                                                  |
+------------------------------------------------------------------+
```

### 8.2 Current Phase 1-2 Simplified Model

Single VPS with Docker bridge networking:

```
Host IP: <Hetzner public IP>
  |
  +-- Docker bridge: 172.17.0.0/16
        |
        +-- Container: Strapi (172.17.0.2)
        +-- Container: PostgreSQL (172.17.0.3)
        +-- Container: MeiliSearch (172.17.0.4)
        +-- Container: ImgProxy (172.17.0.5)
        +-- Container: Plausible (172.17.0.6)
        +-- Container: Redis (172.17.0.7) [P2]
```

---

## 9. Traffic Flow Patterns

### 9.1 Normal Visitor Request Flow

```
1. Visitor Browser -> DNS query -> Cloudflare DNS
2. Cloudflare DNS -> Returns Cloudflare Anycast IP
3. Visitor Browser -> HTTPS -> Cloudflare Edge (nearest POP)
4. Cloudflare Edge -> Cache check
   a. HIT -> Return cached HTML (TTFB < 50ms)
   b. MISS -> Forward to origin
5. Cloudflare -> Cloudflare Pages (static) OR Hetzner VPS (API)
6. If API request: Strapi -> PostgreSQL/MeiliSearch
7. Response -> Cloudflare -> Cache -> Visitor
```

### 9.2 Admin Request Flow

```
1. Marketing Editor -> https://admin.twinmos.com
2. Cloudflare Edge -> Geo-check (office IP or VPN)
3. If allowed -> Forward to Hetzner VPS :1337
4. Strapi Admin -> JWT validation + MFA check
5. Strapi -> PostgreSQL (CRUD operations)
6. Response -> Cloudflare -> Editor
```

### 9.3 Form Submission Flow

```
1. Visitor Browser -> POST /api/form-submissions
2. Cloudflare Edge -> Rate limit check (10/10min/IP)
3. Forward to Hetzner VPS -> Strapi controller
4. Strapi -> Turnstile verification
5. Strapi -> Zod validation
6. Strapi -> PostgreSQL (persist)
7. Strapi -> Lifecycle hook -> Resend + HubSpot + Slack
8. Response (200 OK) -> Visitor
```

---

## 10. Monitoring and Alerting

### 10.1 Network Monitoring Stack

| Tool | Scope | Metrics | Alerts |
|------|-------|---------|--------|
| UptimeRobot | External endpoints | HTTP status, response time | Downtime > 1% |
| Cloudflare Analytics | Edge traffic | Requests, bandwidth, threats | DDoS detected |
| Sentry | Application errors | Error rate, performance | Error spike |
| Plausible | Visitor analytics | Page views, sources, goals | Traffic anomaly |
| Coolify Metrics | VPS resources | CPU, RAM, disk, network | Resource > 80% |
| PostgreSQL | Database | Connections, slow queries, locks | Connection limit |

### 10.2 Alert Routing

```
+------------------------------------------------------------------+
|                    ALERT ROUTING MATRIX                          |
+------------------------------------------------------------------+
|                                                                  |
|  SEVERITY    | CHANNEL          | RESPONSE TIME | ESCALATION    |
|  ----------- | ---------------- | ------------- | ------------- |
|  Critical    | PagerDuty + SMS  | 15 minutes    | On-call dev   |
|  High        | Slack #alerts    | 30 minutes    | Tech lead     |
|  Medium      | Slack #ops       | 4 hours       | Next business |
|  Low         | Issue tracker    | 24 hours      | Scheduled     |
|                                                                  |
|  TRIGGERS:                                                       |
|  - UptimeRobot: HTTP != 200 for > 5 min                         |
|  - Sentry: Error rate > 1% for > 5 min                          |
|  - Coolify: CPU > 90% for > 10 min                              |
|  - PostgreSQL: Connection count > 80% of max                    |
|  - Cloudflare: DDoS attack detected                               |
|                                                                  |
+------------------------------------------------------------------+
```

---

**Document End**
