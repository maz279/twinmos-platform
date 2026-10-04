# TwinMOS Website — Hosting Architecture Diagram & Specification

| | |
|:---|:---|
| **Reference** | H.3-001 |
| **Priority** | P0 |
| **Status** | [M] Must-have |
| **Author** | DevOps Lead |
| **Version** | 1.0 |
| **Date** | 2026-05-01 |
| **Review Cycle** | Quarterly or on infrastructure change |

---

## 1. Purpose

This document provides the complete hosting architecture for the TwinMOS corporate website, including infrastructure topology, data flow diagrams, component specifications, and network boundaries.

---

## 2. Architecture Overview

### 2.1 High-Level Topology

```
                                    Internet Users
                                          |
                                          v
+----------------------------------------------------------------------------------+
|                              Cloudflare Edge Network                              |
|  +------------------+  +------------------+  +------------------+  +-----------+  |
|  |   DDoS Protection |  |   WAF / Firewall  |  |   CDN Caching     |  |  DNS      |  |
|  |   (Layer 3/4/7)   |  |   OWASP Rules     |  |   300+ PoPs       |  |  Managed  |  |
|  +------------------+  +------------------+  +------------------+  +-----------+  |
+----------------------------------------------------------------------------------+
                                          |
                    +---------------------+---------------------+
                    |                                           |
                    v                                           v
+-----------------------------------+    +-----------------------------------------+
|     FRONTEND: Cloudflare Pages     |    |         BACKEND: Hetzner VPS           |
|     (Edge-Deployed Astro)          |    |         (Coolify v4 Self-Hosted PaaS)   |
|                                    |    |                                         |
|  Astro 5.x Static Build            |    |  Strapi 5.x CMS (Docker)                |
|  - ISR / On-Demand                 |    |  - GraphQL / REST APIs                  |
|  - i18n (9 locales)                |    |  - Admin Panel                          |
|  - RTL (Arabic)                    |    |  - Webhooks                             |
|                                    |    |                                         |
|  Cloudflare Workers                |    |  PostgreSQL 16 (Docker)                 |
|  - Edge Functions                  |    |  - WAL Streaming                        |
|  - Form Handling                   |    |  - Automated Backups                    |
|                                    |    |                                         |
|  Cloudflare Images                 |    |  MeiliSearch 1.13 (Docker)              |
|  - Responsive Variants             |    |  - Arabic/CJK Tokenization              |
|                                    |    |                                         |
+-----------------------------------+    |  ImgProxy 3.x (Docker)                  |
                                         |  - Runtime Image Processing             |
                                         |                                         |
                                         |  Redis 7 (Docker)                       |
                                         |  - Session Cache                        |
                                         |  - Rate Limiting                        |
                                         |                                         |
                                         |  Plausible 2.1 (Docker)                 |
                                         |  - Privacy Analytics                    |
                                         |                                         |
                                         +-----------------------------------------+
                                                           |
                                                           v
+----------------------------------------------------------------------------------+
|                           OBJECT STORAGE: Backblaze B2                              |
|  Media Uploads  |  Database Backups  |  Static Assets                             |
|  S3-compatible  |  Daily encrypted   |  Build artifacts                           |
+----------------------------------------------------------------------------------+
```

### 2.2 Data Flow: Page Request

1. **DNS Resolution**: `twinmos.com` resolves via Cloudflare DNS
2. **CDN Edge**: Cloudflare checks cache (300+ PoPs); applies WAF rules
3. **Cache HIT**: Static HTML served directly from edge
4. **Cache MISS**: Request forwarded to Cloudflare Pages origin (Astro build)
5. **API Calls**: Astro fetches data from `api.twinmos.com` (Hetzner/Strapi)
6. **Database Query**: Strapi queries PostgreSQL or MeiliSearch
7. **Response**: HTML rendered and returned to user

### 2.3 Data Flow: CMS Content Update

1. CMS user edits content in Strapi Admin Panel
2. Content saved to PostgreSQL database
3. MeiliSearch index automatically synchronized
4. Webhook triggered to invalidate Cloudflare cache
5. Astro on-demand ISR regenerates affected pages
6. Next user request receives fresh content

---

## 3. Component Specifications

### 3.1 Frontend: Cloudflare Pages

| Attribute | Specification |
|:---|:---|
| **Service** | Cloudflare Pages |
| **Plan** | Pro ($20/month) |
| **Framework** | Astro 5.x |
| **Build Output** | Static HTML/CSS/JS |
| **Deployment** | GitHub Actions -> Wrangler CLI |
| **Custom Domain** | www.twinmos.com |
| **Redirects** | twinmos.com -> www.twinmos.com |
| **Edge Functions** | Cloudflare Workers (form handling, A/B tests) |
| **Build Time Limit** | 20 minutes |
| **Concurrent Builds** | 1 (Pro plan) |

**Resource Limits:**

| Limit | Value |
|:---|:---|
| Max file size | 25 MB |
| Max files per deployment | 20,000 |
| Max headers per file | 100 |
| Max header value size | 2,048 bytes |
| Functions per deployment | 100 |
| Function invocation timeout | 50 ms (free), 30 s (bundled) |

### 3.2 Backend: Hetzner VPS + Coolify

| Attribute | P1-P2 Spec | P3 Spec |
|:---|:---|:---|
| **Provider** | Hetzner Cloud | Hetzner Cloud |
| **Instance** | CX32 | CX42 |
| **vCPU** | 4 (dedicated) | 8 (dedicated) |
| **RAM** | 16 GB | 32 GB |
| **Storage** | 160 GB NVMe | 320 GB NVMe |
| **Location** | Nuremberg (EU) | Nuremberg (EU) |
| **OS** | Ubuntu 24.04 LTS | Ubuntu 24.04 LTS |
| **PaaS** | Coolify v4 (self-hosted) | Coolify v4 (self-hosted) |
| **Monthly Cost** | ~$18.15 | ~$34.05 |

**Coolify-Managed Services:**

| Service | Container Resource Limit | Port |
|:---|:---|:---|
| Strapi 5.x | 2 vCPU, 4 GB RAM | 1337 |
| PostgreSQL 16 | 1 vCPU, 2 GB RAM | 5432 |
| MeiliSearch 1.13 | 0.5 vCPU, 1 GB RAM | 7700 |
| ImgProxy 3.x | 0.5 vCPU, 512 MB RAM | 8080 |
| Redis 7 | 0.25 vCPU, 256 MB RAM | 6379 |
| Plausible 2.1 | 0.5 vCPU, 512 MB RAM | 8000 |

### 3.3 Object Storage: Backblaze B2

| Attribute | Specification |
|:---|:---|
| **Service** | Backblaze B2 Cloud Storage |
| **Storage Class** | Standard |
| **S3-Compatible API** | Yes |
| **Storage Cost** | $0.005/GB/month |
| **Download Cost** | $0.01/GB (first 1 GB/day free) |
| **Upload Cost** | Free |
| **Max Object Size** | 10 TB |
| **Data Residency** | US West (Sacramento) |
| **Encryption** | AES-256 at rest, TLS in transit |

**Buckets:**

| Bucket Name | Purpose | Lifecycle |
|:---|:---|:---|
| `twinmos-media-prod` | User uploads, CMS media | Keep forever |
| `twinmos-media-staging` | Staging media | Delete after 90 days |
| `twinmos-db-backups` | Database backups | Glacier after 30 days, delete after 365 |
| `twinmos-build-artifacts` | CI build outputs | Delete after 30 days |

### 3.4 CDN: Cloudflare

| Attribute | Specification |
|:---|:---|
| **Plan** | Pro ($20/month) |
| **PoPs** | 300+ worldwide |
| **Caching Levels** | Aggressive |
| **Edge TTL** | 1 hour (HTML), 1 year (static assets) |
| **Browser TTL** | 4 hours (HTML), 1 year (static assets) |
| **WAF** | OWASP Core Rule Set |
| **DDoS Protection** | Unlimited, automatic |
| **Argo Smart Routing** | P3 (optional) |
| **Load Balancing** | Geo-steering (P3) |

---

## 4. Network Architecture

### 4.1 DNS Records

| Record | Type | Value | TTL |
|:---|:---|:---|:---|
| `twinmos.com` | A | Cloudflare AnycIP | Auto |
| `www.twinmos.com` | CNAME | `twinmos-website-prod.pages.dev` | Auto |
| `api.twinmos.com` | A | `<Hetzner-IP>` | 300 |
| `api-staging.twinmos.com` | A | `<Hetzner-IP>` | 300 |
| `staging.twinmos.com` | CNAME | `twinmos-website-staging.pages.dev` | Auto |
| `admin.twinmos.com` | CNAME | `api.twinmos.com` | 300 |
| `status.twinmos.com` | CNAME | `stats.uptimerobot.com` | 300 |
| `_dmarc.twinmos.com` | TXT | `v=DMARC1; p=quarantine; rua=mailto:dmarc@twinmos.com` | 3600 |

### 4.2 Firewall Rules (Cloudflare)

| Priority | Expression | Action |
|:---|:---|:---|
| 1 | `(http.request.uri.path contains "/admin") and (not ip.src in $office_ips)` | Block |
| 2 | `(http.request.uri.path contains "/api/admin") and (not ip.src in $office_ips)` | Block |
| 3 | `(http.user_agent contains "bot") and (not cf.client.bot)` | Challenge |
| 4 | `(http.request.uri.path contains "/graphql") and (http.request.method != "POST")` | Block |
| 5 | `(cf.threat_score > 50)` | Challenge |

### 4.3 Origin Security

| Measure | Implementation |
|:---|:---|
| **Origin IP exposure** | Only Cloudflare IPs can reach Hetzner (firewall) |
| **Authenticated Origin Pulls** | Cloudflare origin certificate required |
| **TLS** | Full (strict) -- origin certificate validated |
| **SSH Access** | Key-based only, port 22 restricted to office IP |
| **Fail2ban** | Brute-force protection on SSH and Strapi admin |

---

## 5. Data Residency & Compliance

| Requirement | Implementation |
|:---|:---|
| **GDPR (EU)** | Cloudflare EU PoPs, Hetzner EU datacenter, DPA signed |
| **UAE PDPL** | Cloudflare Middle East PoPs, no PII without consent |
| **India DPDP Act** | Consent management in Strapi, data localization P3 |
| **KSA PDPL** | Arabic content served from EU, no Saudi PII without localization P3 |
| **Data Encryption** | TLS 1.3 in transit, AES-256 at rest |
| **Backup Encryption** | GPG-encrypted before upload to Backblaze B2 |

---

## 6. Scalability Planning

### 6.1 Current Capacity (P1-P2)

| Metric | Capacity | Headroom |
|:---|:---|:---|
| Concurrent users | 1,000 | 5x |
| Requests/minute | 10,000 | CDN handles 100x |
| Database connections | 100 (PgBouncer) | 10x |
| Storage (media) | 100 GB | 900 GB |
| Search index size | 10 GB | 90 GB |

### 6.2 Scaling Triggers

| Metric | Threshold | Action |
|:---|:---|:---|
| CPU > 70% for 10 min | Scale up | Upgrade to CX42 |
| RAM > 80% for 10 min | Scale up | Add swap or upgrade |
| Disk > 80% | Scale storage | Add volume or upgrade |
| Response time > 2s | Optimize | Enable Cloudflare Argo, add caching |
| Error rate > 1% | Investigate | Check Sentry, review logs |

### 6.3 P3 Scaling (Commerce Phase)

| Change | From | To |
|:---|:---|:---|
| VPS | CX32 | CX42 (8 vCPU, 32 GB) |
| Database | Single instance | Primary + read replica |
| CDN | Pro | Business ($200/mo) |
| Search | Single MeiliSearch | MeiliSearch cluster |
| Object Storage | Single bucket | Regional buckets |

---

## 7. Disaster Recovery Architecture

| RTO | RPO | Implementation |
|:---|:---|:---|
| <= 4 hours | <= 15 minutes | WAL streaming + hourly snapshots + daily B2 backups |

**Recovery Scenarios:**

| Failure | Recovery Action | Time |
|:---|:---|:---|
| Frontend failure | Rollback Cloudflare Pages deployment | < 2 minutes |
| Backend failure | Rollback Coolify container | < 5 minutes |
| Database failure | Restore from Backblaze B2 backup | < 30 minutes |
| Full datacenter | Rebuild on new Hetzner instance from backups | < 4 hours |

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
