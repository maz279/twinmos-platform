# TwinMOS Website — Environment Configuration Specification

**Document Reference:** TWN-DEVOPS-H1-003
**Document Version:** 1.0
**Status:** DRAFT — for Unisoft Engineering Review
**Date:** 2 May 2026
**Prepared by:** TwinMOS Digital Transformation Team
**Owner:** IT/Technical Lead (Implementation)
**Audience:** Unisoft engineering team, DevOps operators, TwinMOS IT
**Classification:** CONFIDENTIAL — Unisoft + TwinMOS Internal Use
**Synchronized With:** Technology Stack v1.1 §19.2, BRD v3.0 §27.1, RFP v3.0 §6.3

---

## Change Log

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | 2 May 2026 | Initial release — four-tier environment specification |

---

## Table of Contents

1. [Environment Tiers Overview](#1-environment-tiers-overview)
2. [Local Environment](#2-local-environment)
3. [Development Environment](#3-development-environment)
4. [Staging / UAT Environment](#4-staging--uat-environment)
5. [Production Environment](#5-production-environment)
6. [Environment Comparison Matrix](#6-environment-comparison-matrix)
7. [Data Residency & Compliance](#7-data-residency--compliance)
8. [Environment Promotion Workflow](#8-environment-promotion-workflow)
9. [Environment Isolation Requirements](#9-environment-isolation-requirements)
10. [Environment Naming Conventions](#10-environment-naming-conventions)

---

## 1. Environment Tiers Overview

The TwinMOS website operates across four distinct environment tiers, each with isolated infrastructure, credentials, and data. This model satisfies BRD §27.1 and RFP §6.3 requirements for three-tier isolation with the addition of a dedicated local tier.

| Tier | Purpose | Domain | Backend Host | Access Control |
|------|---------|--------|--------------|----------------|
| **Local** | Per-developer workstation | `localhost` | Docker Compose | Developer only |
| **Development** | Shared integration testing | `dev.twinmos.com` | Hetzner CX22 | Engineering team |
| **Staging / UAT** | Pre-production validation | `staging.twinmos.com` | Hetzner CX32 | Engineering + TwinMOS stakeholders |
| **Production** | Public-facing live site | `twinmos.com` | Hetzner CX32 (P1–P2) → CX42 (P3) | Restricted; deployment gated |

### 1.1 Isolation Principles

Per RFP §6.3 and BRD §27.1:
- **Independent databases:** Each environment has its own PostgreSQL instance
- **Independent credentials:** No shared API keys, JWT secrets, or admin passwords
- **Independent object storage:** Separate Backblaze B2 buckets per environment
- **Independent email domains:** Separate Resend domains per environment
- **Independent Sentry projects:** Separate error tracking per environment
- **Network isolation:** Staging and Prod backend services bind to localhost only; access via Cloudflare tunnel/reverse proxy

---

## 2. Local Environment

### 2.1 Purpose
Individual developer workstations for feature development, debugging, and local testing.

### 2.2 Configuration

| Aspect | Specification |
|--------|---------------|
| **Frontend URL** | `http://localhost:4321` |
| **Backend URL** | `http://localhost:1337` |
| **Admin URL** | `http://localhost:1337/admin` |
| **Database** | PostgreSQL 16 in Docker (port 5432) |
| **Search** | MeiliSearch in Docker (port 7700) |
| **Image Proxy** | ImgProxy in Docker (port 8080) |
| **Cache** | Redis in Docker (port 6379) — Phase 2+ |
| **Analytics** | Plausible in Docker (port 8000) — optional |
| **Object Storage** | Local filesystem (no B2 in dev) |
| **Email** | Console output (no Resend in dev) |
| **Error Monitoring** | Optional Sentry DSN (or disabled) |

### 2.3 Data Characteristics

- **Database:** Seeded with development dataset (~100 products, sample content)
- **Media uploads:** Stored in `backend/public/uploads/` (local filesystem)
- **Search index:** Rebuilt on-demand from local database
- **No PII:** Development dataset must not contain real customer data

### 2.4 Local Environment File

See [TwinMOSWebsiteLocalDevSetup_Guide.md](TwinMOSWebsiteLocalDevSetup_Guide.md) §6 for complete `.env.local` and `.env` templates.

---

## 3. Development Environment

### 3.1 Purpose
Shared integration environment for continuous integration, feature branch previews, and team-wide testing.

### 3.2 Configuration

| Aspect | Specification |
|--------|---------------|
| **Domain** | `dev.twinmos.com` |
| **Frontend** | Cloudflare Pages (branch previews) |
| **Backend** | Hetzner CX22 (€4.51/mo) via Coolify |
| **Database** | PostgreSQL 16 on CX22 |
| **Search** | MeiliSearch on CX22 |
| **Image Proxy** | ImgProxy on CX22 |
| **Object Storage** | `twinmos-assets-development` Backblaze B2 bucket |
| **Email** | Resend sandbox domain |
| **Error Monitoring** | Sentry "Development" project |
| **Uptime Monitoring** | UptimeRobot (lower frequency) |

### 3.3 Infrastructure Spec

```
Hetzner CX22 (Falkenstein DE)
├── 2 vCPU
├── 4 GB RAM
├── 40 GB SSD
├── Ubuntu 24.04 LTS
├── Docker + Coolify v4
└── Services:
    ├── Strapi v5 (port 1337, bound to localhost)
    ├── PostgreSQL 16 (port 5432, bound to localhost)
    ├── MeiliSearch 1.13 (port 7700, bound to localhost)
    └── ImgProxy 3.x (port 8080, bound to localhost)
```

### 3.4 Access Control

| Role | Access | Method |
|------|--------|--------|
| Engineering team | Full | SSH key + Coolify dashboard |
| TwinMOS stakeholders | Read-only (frontend) | Public URL |
| External testers | Frontend only | Public URL |

### 3.5 Data Characteristics

- **Database:** Auto-seeded from production anonymized snapshot (weekly refresh)
- **Media uploads:** Isolated B2 bucket
- **Search index:** Auto-rebuilt on database refresh
- **No real customer data:** Anonymization pipeline required

---

## 4. Staging / UAT Environment

### 4.1 Purpose
Pre-production environment that mirrors production sizing and configuration for:
- User Acceptance Testing (UAT)
- Load testing
- Security scanning (OWASP ZAP)
- Penetration test dry-runs
- Marketing content preview

### 4.2 Configuration

| Aspect | Specification |
|--------|---------------|
| **Domain** | `staging.twinmos.com` |
| **Frontend** | Cloudflare Pages (separate project) |
| **Backend** | Hetzner CX32 (€13.10/mo) via Coolify |
| **Database** | PostgreSQL 16 on CX32 |
| **Search** | MeiliSearch on CX32 |
| **Image Proxy** | ImgProxy on CX32 |
| **Cache** | Redis on CX32 (Phase 2+) |
| **Object Storage** | `twinmos-assets-staging` Backblaze B2 bucket |
| **Email** | Resend staging domain |
| **Error Monitoring** | Sentry "Staging" project |
| **Uptime Monitoring** | UptimeRobot (5-min checks, 3 regions) |
| **Analytics** | Plausible self-hosted (isolated DB) |

### 4.3 Infrastructure Spec

```
Hetzner CX32 (Falkenstein DE)
├── 4 vCPU
├── 8 GB RAM
├── 80 GB SSD
├── Ubuntu 24.04 LTS
├── Docker + Coolify v4
└── Services:
    ├── Strapi v5 (port 1337, bound to localhost)
    ├── PostgreSQL 16 (port 5432, bound to localhost)
    ├── MeiliSearch 1.13 (port 7700, bound to localhost)
    ├── ImgProxy 3.x (port 8080, bound to localhost)
    ├── Redis 7 (port 6379, bound to localhost) — P2+
    └── Plausible 2.1 (port 8000, bound to localhost)
```

### 4.4 Access Control

| Role | Access | Method |
|------|--------|--------|
| Engineering team | Full | SSH key + Coolify dashboard |
| TwinMOS PM/Marketing | CMS admin + frontend | Role-based accounts |
| TwinMOS leadership | Frontend preview | Password-protected (basic auth) |
| External pen-testers | Scoped access | Time-limited credentials |

### 4.5 Data Characteristics

- **Database:** Restored from production backup (anonymized) before each UAT cycle
- **Media uploads:** Isolated B2 bucket with production-like volume
- **Search index:** Production-like index size for performance validation
- **Content freeze:** During UAT windows, content changes require approval

### 4.6 UAT Windows

Per Implementation Strategy v3.0 §12.1 and §21.3:

| UAT Round | Timing | Audience | Duration |
|-----------|--------|----------|----------|
| Alpha | Phase 1 Week 17 | Tech Lead + Dev B | 1 week |
| Beta | Phase 1 Week 18 | Marketing + Sales + Product Directors | 1 week |
| Stakeholder | Phase 1 Week 19 | Chairman + GM | 3 days |
| Soft Launch | Phase 1 Week 19–20 | TwinMOS staff + key distributors | 1 week |
| Phase 2 UAT | Month 9 | Stakeholders | 1 week |
| Phase 3 UAT | Month 15 | Stakeholders | 1 week |

---

## 5. Production Environment

### 5.1 Purpose
Public-facing live website serving all TwinMOS customers, partners, and prospects.

### 5.2 Configuration

| Aspect | Specification |
|--------|---------------|
| **Primary Domain** | `twinmos.com` |
| **WWW Redirect** | `www.twinmos.com` → 301 to apex |
| **Admin Domain** | `admin.twinmos.com` |
| **API Domain** | `api.twinmos.com` |
| **Search Domain** | `search.twinmos.com` |
| **Image Domain** | `imgproxy.twinmos.com` |
| **Chat Domain** | `chat.twinmos.com` (P2) |
| **Shop Domain** | `shop.twinmos.com` (P3) |
| **Partner Domain** | `partner.twinmos.com` (P2) |
| **Frontend** | Cloudflare Pages (edge-deployed) |
| **Backend** | Hetzner CX32 (P1–P2) → CX42 (P3) via Coolify |
| **Database** | PostgreSQL 16 on Hetzner |
| **Search** | MeiliSearch on Hetzner |
| **Image Proxy** | ImgProxy on Hetzner |
| **Cache** | Redis on Hetzner (P2+) |
| **Object Storage** | `twinmos-assets-production` Backblaze B2 |
| **Email** | Resend production domain |
| **Error Monitoring** | Sentry "Production" project (Team tier) |
| **Uptime Monitoring** | UptimeRobot (5-min checks, EU/US/MEA) |
| **Analytics** | Plausible self-hosted + GA4 (consent-gated) |

### 5.3 Infrastructure Spec — Phase 1–2

```
Hetzner CX32 (Falkenstein DE)
├── 4 vCPU
├── 8 GB RAM
├── 80 GB SSD
├── Ubuntu 24.04 LTS
├── Docker + Coolify v4
├── LUKS volume encryption
└── Services:
    ├── Strapi v5 (port 1337, bound to localhost)
    ├── PostgreSQL 16 (port 5432, bound to localhost)
    ├── MeiliSearch 1.13 (port 7700, bound to localhost)
    ├── ImgProxy 3.x (port 8080, bound to localhost)
    ├── Plausible 2.1 (port 8000, bound to localhost)
    └── Redis 7 (port 6379, bound to localhost) — P2+
```

### 5.4 Infrastructure Spec — Phase 3

```
Hetzner CX42 (Falkenstein DE)
├── 8 vCPU
├── 16 GB RAM
├── 160 GB SSD
├── Ubuntu 24.04 LTS
├── Docker + Coolify v4
├── LUKS volume encryption
└── Services:
    ├── Strapi v5
    ├── PostgreSQL 16
    ├── MeiliSearch 1.13
    ├── ImgProxy 3.x
    ├── Plausible 2.1
    ├── Redis 7
    ├── Chatwoot 3.x (separate container)
    └── Medusa.js 2.x (separate container)
```

### 5.5 Access Control

| Role | Access | Method |
|------|--------|--------|
| Engineering team (deploy) | Coolify deployment webhook | GitHub Actions + manual gate |
| Engineering team (emergency) | SSH key (break-glass) | Documented in incident runbook |
| TwinMOS Marketing | CMS admin | MFA-enforced accounts |
| TwinMOS Product team | CMS editor accounts | Role-based |
| Public | Frontend only | N/A |

### 5.6 Data Characteristics

- **Database:** Live production data — all customer, product, and content data
- **Media uploads:** Production B2 bucket with versioning enabled
- **Search index:** Live index synchronized with CMS lifecycle hooks
- **Backups:** Daily encrypted `pg_dump` + continuous WAL streaming to B2
- **Retention:** 30-day daily backups; 12-month monthly backups; 7-year archive for invoices (P3)

---

## 6. Environment Comparison Matrix

| Aspect | Local | Development | Staging | Production |
|--------|-------|-------------|---------|------------|
| **Domain** | localhost | dev.twinmos.com | staging.twinmos.com | twinmos.com |
| **Frontend Host** | Local dev server | Cloudflare Pages | Cloudflare Pages | Cloudflare Pages |
| **Backend Host** | Docker Compose | Hetzner CX22 | Hetzner CX32 | Hetzner CX32 → CX42 |
| **VPS Cost** | N/A | €4.51/mo | €13.10/mo | €13.10 → €25.20/mo |
| **CPU** | Workstation | 2 vCPU | 4 vCPU | 4 → 8 vCPU |
| **RAM** | Workstation | 4 GB | 8 GB | 8 → 16 GB |
| **Storage** | Workstation SSD | 40 GB SSD | 80 GB SSD | 80 → 160 GB SSD |
| **Database** | Docker volume | Docker volume | Docker volume | Docker volume + WAL |
| **SSL/TLS** | None | Cloudflare-managed | Cloudflare-managed | Cloudflare-managed + HSTS preload |
| **WAF** | None | Cloudflare Pro | Cloudflare Pro | Cloudflare Pro |
| **CDN** | None | Cloudflare edge | Cloudflare edge | Cloudflare edge |
| **Object Storage** | Local filesystem | B2 dev bucket | B2 staging bucket | B2 production bucket |
| **Email** | Console only | Resend sandbox | Resend staging | Resend production |
| **Error Monitoring** | Optional/disabled | Sentry Dev | Sentry Staging | Sentry Production |
| **Uptime Checks** | None | Low frequency | 5 min, 3 regions | 5 min, 3 regions |
| **Analytics** | Optional Plausible | Plausible dev | Plausible staging | Plausible + GA4 |
| **Log Level** | debug | debug | info | warn |
| **Source Maps** | Full | Full | Full | Uploaded to Sentry only |
| **Debug Endpoints** | Enabled | Enabled | Disabled | Disabled |
| **Rate Limiting** | None | Relaxed | Production-like | Strict |
| **CSP Reporting** | Console only | Sentry staging | Sentry staging | Sentry production |
| **Pen-testing** | N/A | N/A | Pre-launch + quarterly | Annual recurring |
| **DR Drill** | N/A | N/A | Before each phase | Quarterly |

---

## 7. Data Residency & Compliance

### 7.1 Hosting Region Strategy

Per Technology Stack v1.1 §19.3 and RFP §6.3:

| User Region | Primary Data Center | CDN Edge | Compliance Notes |
|-------------|---------------------|----------|------------------|
| EU/EEA | Hetzner Falkenstein (DE) | Cloudflare EU | GDPR Art. 44 transfer safeguards |
| MEA / Africa | Hetzner Falkenstein (DE) | Cloudflare MEA | Closest geographic; UAE PDPL |
| Asia (India/BD/Pakistan/SEA) | Hetzner Helsinki (FI) | Cloudflare Asia | India DPDP Act 2023 |
| US / North America | Hetzner Ashburn (US) | Cloudflare US | CCPA/CPRA ready |
| KSA | Hetzner Falkenstein (DE) | Cloudflare Riyadh | KSA PDPL; transfer impact assessment |

### 7.2 Compliance by Environment

| Requirement | Local | Dev | Staging | Production |
|-------------|-------|-----|---------|------------|
| GDPR consent flows | Mock | Mock | Functional | Full |
| UAE PDPL disclosures | N/A | N/A | Review | Full |
| India DPDP Grievance Officer | N/A | N/A | Review | Full |
| KSA PDPL localization | N/A | N/A | Review | Full |
| Cookie banner | Enabled | Enabled | Enabled | Full CMP |
| DSAR endpoint | N/A | N/A | Functional | Full workflow |
| Audit logging | Console | File | File + Sentry | File + Sentry + B2 archive |

---

## 8. Environment Promotion Workflow

### 8.1 Code Promotion

```
Feature Branch → Pull Request → CI Green → Merge to main
                                    ↓
                            Cloudflare Pages (auto-deploy preview)
                                    ↓
                            Manual approval → Staging (Coolify webhook)
                                    ↓
                            UAT Pass + Security Scan Green → Production
```

### 8.2 Data Promotion

| Direction | Method | Frequency | Owner |
|-----------|--------|-----------|-------|
| Prod → Staging | Anonymized backup restore | Before each UAT | DevOps |
| Prod → Dev | Anonymized backup restore | Weekly | DevOps |
| Staging → Prod | Not permitted | N/A | N/A |
| Dev → Staging | Not permitted | N/A | N/A |

### 8.3 Configuration Promotion

| Component | Promotion Method | Version Control |
|-----------|-----------------|-----------------|
| Application code | Git merge | GitHub |
| Environment variables | Coolify env var sync | Coolify dashboard (not in Git) |
| Database schema | Strapi auto-migrate + manual SQL | Migration files in repo |
| CMS content | Strapi export/import | Content seed scripts in repo |
| Infrastructure | Coolify configuration | Documented in runbooks |

---

## 9. Environment Isolation Requirements

### 9.1 Network Isolation

- **Production database:** No direct external access; accessible only via Strapi application
- **Staging database:** Accessible from engineering IPs + VPN only
- **Admin panels:** Geo-fenced to TwinMOS office IPs + VPN (Cloudflare Access)
- **API endpoints:** Public read-only; authenticated endpoints rate-limited

### 9.2 Credential Isolation

Each environment has independent:
- PostgreSQL credentials
- JWT secrets (Strapi)
- MeiliSearch master keys
- ImgProxy key/salt pairs
- Backblaze B2 application keys
- Resend API keys
- Sentry DSNs
- Cloudflare API tokens

### 9.3 Secret Rotation Schedule

| Secret Type | Rotation Frequency | Trigger |
|-------------|-------------------|---------|
| Database passwords | Quarterly | Calendar |
| JWT secrets | On personnel change | Event |
| API keys (B2, Resend) | Quarterly | Calendar |
| Cloudflare tokens | On personnel change | Event |
| ImgProxy key/salt | Annually | Calendar |

See [TwinMOSWebsiteSecretsManagementPlan.md](TwinMOSWebsiteSecretsManagementPlan.md) for detailed rotation procedures.

---

## 10. Environment Naming Conventions

### 10.1 Resource Naming

| Resource Type | Pattern | Example |
|---------------|---------|---------|
| Git branch (feature) | `feature/TWN-123-short-desc` | `feature/TWN-456-arabic-rtl` |
| Git branch (hotfix) | `hotfix/TWN-123-short-desc` | `hotfix/TWN-789-security-patch` |
| Docker image tag | `env-gitsha` | `staging-a1b2c3d` |
| Backblaze bucket | `twinmos-assets-{env}` | `twinmos-assets-staging` |
| Sentry project | `twinmos-website-{env}` | `twinmos-website-production` |
| Resend domain | `{env}.twinmos.com` | `staging.twinmos.com` |
| Database name | `twinmos_{env}` | `twinmos_staging` |
| Coolify project | `twinmos-{env}` | `twinmos-production` |

### 10.2 DNS Subdomain Mapping

| Subdomain | Environment | Target |
|-----------|-------------|--------|
| `dev.twinmos.com` | Development | Cloudflare Pages (dev branch) |
| `staging.twinmos.com` | Staging | Cloudflare Pages (staging branch) |
| `twinmos.com` | Production | Cloudflare Pages (main branch) |
| `admin.twinmos.com` | Production | Hetzner CX32/CX42 (Strapi admin) |
| `api.twinmos.com` | Production | Hetzner CX32/CX42 (Strapi API) |
| `search.twinmos.com` | Production | Hetzner CX32/CX42 (MeiliSearch) |
| `imgproxy.twinmos.com` | Production | Hetzner CX32/CX42 (ImgProxy) |
| `chat.twinmos.com` | Production (P2) | Hetzner CX42 (Chatwoot) |
| `shop.twinmos.com` | Production (P3) | Hetzner CX42 (Medusa) |
| `partner.twinmos.com` | Production (P2) | Hetzner CX42 (Partner portal) |

See [TwinMOSWebsiteDNSRecordsSpecification.md](../H.3%20-%20Hosting%20and%20Infrastructure/TwinMOSWebsiteDNSRecordsSpecification.md) for full DNS record details.

---

## Document Governance

| Role | Name | Sign-Off | Date |
|------|------|----------|------|
| IT/Technical Lead | (TBC) | _______________ | _________ |
| Unisoft Team Lead | (TBC) | _______________ | _________ |
| Unisoft Senior Developer | (TBC) | _______________ | _________ |

---

**Document Version:** 1.0
**Issued:** 2 May 2026
**Next Review:** Upon environment provisioning (Sprint 0) and at each phase boundary
**Canonical Location:** `H.1 - Local and Environment Setup/TwinMOSWebsiteEnvironmentConfigurationSpec.md`
