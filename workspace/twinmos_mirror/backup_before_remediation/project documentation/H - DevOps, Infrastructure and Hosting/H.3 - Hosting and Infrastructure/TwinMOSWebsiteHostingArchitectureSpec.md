# TwinMOS Website — Hosting Architecture Specification

**Document ID:** H.3-001  
**Version:** 1.0  
**Status:** Active  
**Owner:** Tech Lead  
**Last Updated:** 2026-05-01  
**Related:** TwinMOSWebsiteCoolifyConfigurationGuide.md · TwinMOSWebsiteHetznerProvisioningGuide.md · TwinMOSWebsiteCloudflareConfigurationGuide.md · TwinMOSWebsiteDisasterRecoveryPlan.md

---

## 1. Executive Summary

The TwinMOS website hosting architecture is a **two-layer hybrid** design:

- **Frontend (Astro 5):** Deployed to **Cloudflare Pages Pro** — globally distributed static/edge hosting with 300+ Points of Presence (PoPs). No origin server required for page loads.
- **Backend (Strapi 5 + all services):** Deployed on a **Hetzner Cloud VPS (CX32)** in Falkenstein, Germany, managed via **Coolify v4**. All backend services run as Docker containers.
- **Object Storage:** **Backblaze B2** (us-west-002) for media assets and encrypted backups.
- **DNS + WAF:** **Cloudflare DNS** (Anycast) + **Cloudflare Pro WAF** (OWASP Core Rule Set).

This architecture achieves:
- **RTO ≤ 4 hours** (full rebuild from backup)
- **RPO ≤ 15 minutes** (PostgreSQL WAL streaming)
- **99.9% availability SLO**
- **LCP < 1.8 s** for global visitors via Cloudflare edge caching

---

## 2. Architecture Topology

```
┌──────────────────────────────────────────────────────────────────┐
│                       INTERNET USERS                              │
│        (MENA, Africa, South Asia, EU, US, SEA)                   │
└───────────────────────────┬──────────────────────────────────────┘
                            │ HTTPS (TLS 1.3)
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                  CLOUDFLARE EDGE NETWORK                          │
│                     300+ Global PoPs                              │
│                                                                   │
│  ┌─────────────────────┐   ┌─────────────────────────────────┐  │
│  │   Cloudflare DNS     │   │      Cloudflare Pro WAF          │  │
│  │   (Anycast, DNSSEC)  │   │  OWASP CRS + Rate Limiting       │  │
│  │                      │   │  Bot Fight Mode + DDoS Protection│  │
│  └──────────┬───────────┘   └───────────────┬─────────────────┘  │
│             │                               │                     │
│  ┌──────────▼───────────────────────────────▼─────────────────┐  │
│  │                  Cloudflare Pages Pro ($20/mo)               │  │
│  │              twinmos.com / www.twinmos.com                   │  │
│  │   Astro 5 static site + Edge Functions                       │  │
│  │   Cache: HTML 1h, assets 1yr, images 7d                      │  │
│  └─────────────────────────┬───────────────────────────────────┘  │
└────────────────────────────┼─────────────────────────────────────┘
                             │ Origin requests (cache miss / API)
                             │ Cloudflare origin cert (mutual TLS)
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│              HETZNER CLOUD — Falkenstein DE (eu-central)          │
│                      CX32: 4 vCPU / 8 GB RAM / 80 GB SSD         │
│                                                                   │
│  ┌───────────────────────── COOLIFY v4 ──────────────────────┐  │
│  │   Traefik Reverse Proxy (HTTPS termination, Let's Encrypt) │  │
│  │                                                             │  │
│  │  ┌──────────────┐  ┌─────────────┐  ┌─────────────────┐  │  │
│  │  │  Strapi 5     │  │ MeiliSearch │  │    ImgProxy 3   │  │  │
│  │  │  (port 1337)  │  │  (port 7700)│  │   (port 8080)   │  │  │
│  │  │  api.twinmos  │  │search.twinm │  │ imgproxy.twinm  │  │  │
│  │  └──────┬────────┘  └─────────────┘  └─────────────────┘  │  │
│  │         │                                                    │  │
│  │  ┌──────▼────────┐  ┌─────────────┐  ┌─────────────────┐  │  │
│  │  │  PostgreSQL 16 │  │   Redis 7   │  │  Plausible 2.1  │  │  │
│  │  │  (port 5432)   │  │  (port 6379)│  │  (port 8000)    │  │  │
│  │  │  Internal only │  │ Internal    │  │ analytics.twinm │  │  │
│  │  └───────────────┘  └─────────────┘  └─────────────────┘  │  │
│  │                                                              │  │
│  │  Phase 2+: Chatwoot (P2)          Phase 3+: Medusa (P3)    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  Cloud Firewall:                                                  │
│  • Port 443/80: Allow Cloudflare IPs only                        │
│  • Port 22: Allow office IP + VPN only                           │
│  • All other: DENY                                               │
└──────────────────────────────────────────────────────────────────┘
                             │
                             │ S3-compatible API (HTTPS)
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                    BACKBLAZE B2 (us-west-002)                     │
│                                                                   │
│  twinmos-media-prod    → Public read (Strapi uploads)            │
│  twinmos-media-staging → Public read (staging media)             │
│  twinmos-backups-prod  → Private (encrypted DB + config backups) │
│  twinmos-artifacts     → Private (build artifacts, 14d TTL)     │
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. Component Inventory

| Component | Provider | Version | Cost/Month | Region | Purpose |
|-----------|----------|---------|------------|--------|---------|
| Cloudflare Pages | Cloudflare Pro | — | $20.00 | Global edge | Frontend CDN + edge deploy |
| Cloudflare WAF | Included in Pro | — | Included | Global edge | OWASP protection, DDoS |
| Cloudflare DNS | Included in Pro | — | Included | Anycast | DNS + DNSSEC |
| Hetzner CX32 (P1–P2) | Hetzner Cloud | Ubuntu 24.04 | €13.10 | Falkenstein DE | VPS for all backend services |
| Hetzner CX42 (P3) | Hetzner Cloud | Ubuntu 24.04 | €25.20 | Falkenstein DE | Upgraded VPS for P3 commerce |
| Coolify v4 | Self-hosted | v4.0.0-beta.470+ | Free | On CX32 | Docker orchestration + PaaS |
| Traefik | Managed by Coolify | 3.x | Free | On CX32 | Reverse proxy + SSL |
| Strapi 5 | Self-hosted | 5.31.x | Free | On CX32 | Headless CMS + REST API |
| PostgreSQL 16 | Self-hosted | 16 | Free | On CX32 | Primary relational database |
| MeiliSearch | Self-hosted | 1.13.x | Free | On CX32 | Full-text search engine |
| ImgProxy | Self-hosted | 3.x | Free | On CX32 | Runtime image resizing/conversion |
| Redis 7 | Self-hosted | 7-alpine | Free | On CX32 | Cache + session store (P2) |
| Plausible | Self-hosted | 2.1.x | Free | On CX32 | Privacy-first analytics |
| Backblaze B2 | Backblaze | — | ~$0.05/mo (P1) | us-west-002 | Object storage |
| Resend | SaaS | — | Free tier | Global | Transactional email |
| **Total (P1–P2)** | | | **~$35–40/mo** | | |

---

## 4. Network Architecture

### 4.1 Domain-to-Service Routing

| Domain | Points To | Cloudflare Proxy | Port | Purpose |
|--------|-----------|-----------------|------|---------|
| `twinmos.com` | Cloudflare Pages | N/A (Pages) | 443 | Frontend (production) |
| `www.twinmos.com` | → 301 to `twinmos.com` | Yes | 443 | www redirect |
| `api.twinmos.com` | Hetzner CX32 IP | Yes (orange cloud) | 443 | Strapi REST API |
| `admin.twinmos.com` | Hetzner CX32 IP | Yes (orange cloud) | 443 | Strapi admin panel |
| `search.twinmos.com` | Hetzner CX32 IP | Yes (orange cloud) | 443 | MeiliSearch (read-only public key) |
| `imgproxy.twinmos.com` | Hetzner CX32 IP | Yes (orange cloud) | 443 | Image transformation proxy |
| `analytics.twinmos.com` | Hetzner CX32 IP | No (DNS only) | 443 | Plausible Analytics |
| `chat.twinmos.com` | Hetzner CX32 IP | Yes | 443 | Chatwoot live chat (P2) |
| `shop.twinmos.com` | Cloudflare Pages | N/A (Pages) | 443 | Medusa storefront (P3) |
| `staging.twinmos.com` | Hetzner CX32 IP (staging) | Yes | 443 | Staging environment |
| `dev.twinmos.com` | Hetzner CX22 IP | Yes | 443 | Development environment |

### 4.2 Cloudflare Network Security

| Layer | Control | Configuration |
|-------|---------|--------------|
| TLS | TLS 1.3 only (TLS 1.2 min for legacy) | Cloudflare SSL/TLS → Edge Certificates |
| HSTS | `max-age=31536000; includeSubDomains; preload` | Transform Rules |
| WAF | OWASP Core Rule Set (CRS) | Cloudflare WAF → Managed Rules |
| Rate limiting | 100 req/min public, 1000 req/min auth | Cloudflare Rate Limiting |
| Bot protection | Bot Fight Mode enabled | Cloudflare Bot Management |
| DDoS | Unmetered L3/L4/L7 | Cloudflare DDoS Protection (included) |
| Geo-block | `/admin/*` routes: allow office IPs + VPN only | Cloudflare WAF Custom Rules |
| Turnstile CAPTCHA | Contact form + RMA submission | Cloudflare Turnstile (free) |

### 4.3 Hetzner Origin Security

| Control | Implementation |
|---------|---------------|
| Cloud Firewall | Port 443/80: Cloudflare IP ranges only; Port 22: office + VPN only |
| UFW | Same rules redundantly at OS level |
| Fail2ban | SSH brute-force protection (10 attempts → 1h ban) |
| Cloudflare Origin Cert | Mutual TLS between Cloudflare edge and Hetzner origin |
| Non-root Docker | All containers run as non-root user |
| No public IPv6 | IPv4 only on Hetzner (reduces attack surface) |
| Auto security updates | `unattended-upgrades` for critical patches |

---

## 5. Data Flow Diagrams

### 5.1 Static Page Request (Cache Hit)
```
User → Cloudflare edge PoP → Serve from cache → User
(0 origin requests; ~10ms TTFB globally)
```

### 5.2 Static Page Request (Cache Miss / ISR)
```
User → Cloudflare edge PoP → Cache miss → Cloudflare Pages origin
     → Astro renders page (or fetches from Strapi API) → Cloudflare caches → User
```

### 5.3 API Request (Strapi)
```
Astro frontend → api.twinmos.com → Cloudflare WAF check
              → Cloudflare origin (Hetzner CX32)
              → Traefik → Strapi 5 (port 1337)
              → PostgreSQL query → Response → Cloudflare → User
```

### 5.4 Media Upload (CMS)
```
CMS admin → Strapi media upload endpoint
          → Strapi validates (type, size, ClamAV)
          → @strapi/provider-upload-aws-s3 (B2 endpoint)
          → B2 bucket: twinmos-media-prod
          → ImgProxy generates thumbnails on first access
```

### 5.5 Search Request
```
User types search query → Astro frontend
→ search.twinmos.com (MeiliSearch, read-only public key)
→ MeiliSearch returns results in <100ms
→ Rendered in Astro island (no page reload)
```

### 5.6 Nightly Backup
```
Coolify scheduled job (daily 02:00 UTC):
  1. pg_dump → GPG encrypt → upload to twinmos-backups-prod/daily/
  2. PostgreSQL WAL → streamed continuously (every 15 min)
  3. MeiliSearch dump → encrypt → upload to B2
  4. Coolify config export → upload to B2
```

---

## 6. Phase Scaling Roadmap

### 6.1 Phase 1–2: CX32 (Current)

**Hetzner CX32:** 4 vCPU / 8 GB RAM / 80 GB SSD NVMe — €13.10/mo

Services allocated RAM:
| Service | RAM Allocation |
|---------|---------------|
| Strapi 5 | 1.5 GB |
| PostgreSQL 16 | 2.0 GB |
| MeiliSearch 1.13 | 1.0 GB |
| ImgProxy 3 | 512 MB |
| Redis 7 | 256 MB |
| Plausible 2.1 | 512 MB |
| System + Coolify | 2.0 GB |
| **Total** | **~7.8 GB** |

Handles: 500 concurrent users (peak 1,000).

### 6.2 Phase 3: CX42 (Commerce Upgrade)

**Hetzner CX42:** 8 vCPU / 16 GB RAM / 160 GB SSD NVMe — €25.20/mo

Additional P3 services: Medusa (commerce), Chatwoot (live chat), PostHog (analytics)  
Handles: 2,000 concurrent users (peak 5,000).

### 6.3 Pre-Event Scaling

For COMPUTEX / GITEX / Black Friday (peak 5,000–10,000 users):
- Upgrade CX32 → CX42 (7 days before event, ~5 min downtime)
- Enable Cloudflare Argo Smart Routing ($5/mo additional)
- Aggressive cache warm-up (pre-build product pages, prime CDN)
- See `TwinMOSWebsitePreEventScaling_Runbook.md` for full procedure

---

## 7. Data Residency & Compliance

| User Region | Data Processing | Justification |
|-------------|----------------|--------------|
| EU/EEA | Hetzner Falkenstein DE (GDPR Article 46) | EU-based server; no transfer needed |
| MEA / Africa | Hetzner Falkenstein DE | Closest geography; Cloudflare PoPs in MEA serve static content |
| South Asia (India/BD/PK) | Hetzner Falkenstein DE | Static pages from Cloudflare Singapore PoP; API from DE |
| KSA | Hetzner Falkenstein DE + Transfer Impact Assessment | Cloudflare PoP in Riyadh caches static; API crosses to EU — TIA documented |
| US | Hetzner Falkenstein DE | Cloudflare US PoP caches static; API from DE |

> All personal data (form submissions, warranty registrations, contacts) is stored exclusively on Hetzner Falkenstein DE (EU jurisdiction). No personal data is sent to Backblaze B2 (only media files and encrypted database backups).

---

## 8. Disaster Recovery Architecture

| Component | Recovery Method | RTO | RPO |
|-----------|----------------|-----|-----|
| Frontend (Astro) | Redeploy from `main` branch to Cloudflare Pages | < 30 min | 0 (Git is source of truth) |
| Backend (Strapi) | Redeploy from `main` branch to new Coolify instance | < 2 h | 0 |
| PostgreSQL | Restore pg_dump + apply WAL from B2 | < 1 h | < 15 min |
| MeiliSearch | Restore dump from B2 | < 30 min | < 24 h |
| Media (Strapi uploads) | Reconnects to B2 automatically | < 5 min | 0 |
| **Overall** | **Full rebuild on new Hetzner instance** | **≤ 4 h** | **≤ 15 min** |

See `TwinMOSWebsiteDisasterRecoveryPlan.md` for step-by-step procedures.

---

## 9. Cost Breakdown

### Monthly Operational Costs

| Service | Cost | Notes |
|---------|------|-------|
| Hetzner CX32 | €13.10 (~$14.10) | P1–P2; scales to CX42 €25.20 at P3 |
| Cloudflare Pages Pro | $20.00 | Includes WAF, Workers, image transforms |
| Backblaze B2 | ~$0.05 | P1 (~5 GB storage + minimal egress) |
| Resend | $0 | Free tier: 3,000 emails/mo; $20/mo paid if exceeded |
| UptimeRobot Pro | ~$7.00 | 50 monitors, 1-min intervals |
| Sentry (Developer tier) | $0 | Free until P2 launch; Team $26/mo at P2 |
| **P1 Total** | **~$41/mo** | |
| **P3 Total** | **~$60/mo** | (CX42 + Sentry Team + Stripe fees extra) |

---

*Approved by: Chairman · Tech Lead*  
*Synchronized With: Technology Stack v1.1 §19*
