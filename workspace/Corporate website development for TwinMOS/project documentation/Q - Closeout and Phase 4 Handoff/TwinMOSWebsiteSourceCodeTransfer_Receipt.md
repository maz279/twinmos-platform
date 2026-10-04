# TwinMOS Corporate Website — Source Code Transfer Receipt

**Document Reference:** TWN-Q-SRCCODE-2026-001  
**Version:** 1.0  
**Date:** October 2027  
**Prepared by:** Unisoft Solutions Ltd. — Team Lead  
**Received by:** TwinMOS Technologies Middle East FZE — IT Lead  
**Classification:** CONFIDENTIAL — Internal Use Only  
**Distribution:** TwinMOS IT Lead, TwinMOS PM, Unisoft Team Lead, TwinMOS Legal  
**Parent Documents:** TWN-LEGAL-IP-2026-001 (IP Ownership Transfer Agreement §4 — Deliverables and Handover), TWN-LEGAL-MSA-2026-001 §12 (Termination and Exit Management)  

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | October 2027 | Unisoft Team Lead | Initial draft |
| 1.0 | October 2027 | TwinMOS IT Lead (reviewed) | Final — ready for signature |

---

## Purpose

This Source Code Transfer Receipt documents the formal transfer of all source code, configuration files, scripts, and associated technical assets from **Unisoft Solutions Ltd.** ("Vendor") to **TwinMOS Technologies Middle East FZE** ("Client") as required under:

- IP Ownership Transfer Agreement (TWN-LEGAL-IP-2026-001) §4 — Deliverables and Handover
- Master Service Agreement (TWN-LEGAL-MSA-2026-001) §12.4 — Exit Management
- Statement of Work SOW-001 Deliverable D1.21, SOW-002 documentation deliverables, SOW-003 Deliverable D3.14

Upon execution by both parties, this receipt confirms that all source code assets have been transferred to TwinMOS's exclusive possession and control, and that Unisoft retains no proprietary copies except as required by law (see §7 — Retention Obligations).

---

## Part 1 — Repository Transfer

### 1.1 Primary Repositories

| Repository | Type | Platform | Transfer Method | Transfer Status |
|------------|------|----------|----------------|-----------------|
| `twinmos-website-frontend` | Astro 5 Frontend Application | GitHub (Private) | Full repository transfer to TwinMOS GitHub Organization | ✅ Transferred |
| `twinmos-website-cms` | Strapi v5 CMS Backend | GitHub (Private) | Full repository transfer to TwinMOS GitHub Organization | ✅ Transferred |
| `twinmos-website-docs` | Project Documentation | GitHub (Private) | Full repository transfer to TwinMOS GitHub Organization | ✅ Transferred |
| `twinmos-website-e2e-tests` | Playwright E2E Test Suite | GitHub (Private) | Full repository transfer to TwinMOS GitHub Organization | ✅ Transferred |
| `twinmos-infra-configs` | Infrastructure Configuration (Coolify, Cloudflare) | GitHub (Private) | Full repository transfer to TwinMOS GitHub Organization | ✅ Transferred |

### 1.2 Repository Contents Confirmation

**Frontend Repository (`twinmos-website-frontend`)**

| Category | Contents | Confirmed |
|----------|----------|-----------|
| Core application | `/src/` — All Astro page components, layouts, and island React components | ✅ |
| Content Collections | `/src/content/` — 454 markdown content files across 16 sections + schema definitions | ✅ |
| Styling | `/src/styles/` — Tailwind CSS configuration, design tokens, global styles | ✅ |
| Public assets | `/public/` — Favicons, static images, manifest.json, robots.txt | ✅ |
| Configuration | `astro.config.mjs`, `tailwind.config.js`, `tsconfig.json`, `package.json`, `pnpm-lock.yaml` | ✅ |
| CI/CD | `.github/workflows/` — Lint, typecheck, Lighthouse CI, build, deploy pipeline definitions | ✅ |
| Tests | `tests/` — Vitest unit tests, Playwright E2E test specs | ✅ |
| Build scripts | `scripts/` — Content migration scripts, sitemap generators, schema validators | ✅ |
| Environment template | `.env.example` — All environment variable keys documented (values excluded — see §5) | ✅ |
| Documentation | `README.md`, `CONTRIBUTING.md`, `DEPLOYMENT.md` | ✅ |

**CMS Backend Repository (`twinmos-website-cms`)**

| Category | Contents | Confirmed |
|----------|----------|-----------|
| Strapi core | `/src/` — All Strapi configuration, routes, controllers, services, policies | ✅ |
| Content types | `/src/api/` — All 25+ content type definitions (Product, SKU, Brand, Category, Distributor, Retailer, NewsArticle, Event, KBArticle, FormSubmission, etc.) | ✅ |
| Components | `/src/components/` — Reusable Strapi component schemas (addresses, SEO metadata, etc.) | ✅ |
| i18n configuration | Locale configuration for all 9 locales (EN, AR, BN, HI, RU, ZH-CN, FR, ES-stub, PT-stub, DE-stub) | ✅ |
| Plugins | `/src/plugins/` — Custom audit log plugin, serial number validation plugin | ✅ |
| Database | `database/migrations/` — All database migration files in chronological order | ✅ |
| Configuration | `config/` — Server, middleware, database, plugins configuration (env vars excluded) | ✅ |
| CI/CD | `.github/workflows/` — Lint, security scan, test, deploy pipeline for Strapi | ✅ |
| Environment template | `.env.example` — All Strapi environment variable keys documented | ✅ |
| Documentation | `README.md`, `STRAPI-ADMIN.md`, `API-REFERENCE.md` | ✅ |

**Infrastructure Configuration Repository (`twinmos-infra-configs`)**

| Category | Contents | Confirmed |
|----------|----------|-----------|
| Docker Compose | `docker-compose.yml`, `docker-compose.prod.yml` — Local dev and production service definitions | ✅ |
| Coolify | `coolify/` — Coolify deployment configuration files for Hetzner VPS | ✅ |
| Cloudflare | `cloudflare/` — Cloudflare Pages build settings, WAF rules, redirect rules | ✅ |
| OWASP ZAP | `security/zap-baseline.conf` — ZAP scanning configuration for CI | ✅ |
| Backup scripts | `scripts/backup.sh`, `scripts/restore.sh` — Database and media backup/restore scripts | ✅ |
| Nginx | `nginx/` — Nginx reverse proxy configuration for Hetzner VPS | ✅ |

### 1.3 GitHub Organization Transfer Details

| Transfer Detail | Value |
|----------------|-------|
| **Source GitHub Organization** | `unisoft-solutions` (Unisoft's GitHub org) |
| **Destination GitHub Organization** | `twinmos-technologies` (TwinMOS's GitHub org) |
| **Transfer Method** | GitHub Repository Transfer (native GitHub feature) |
| **Transfer Date** | October 2027 |
| **All PR History Preserved** | ✅ Yes — full git history, PRs, issues transferred |
| **GitHub Actions Secrets Migrated** | ✅ Yes — re-set under TwinMOS org GitHub Actions secrets |
| **Branch Protection Rules** | ✅ Transferred and verified |
| **Dependabot Configuration** | ✅ Transferred and re-enabled under TwinMOS org |

---

## Part 2 — Database and Data Transfer

### 2.1 PostgreSQL Database Transfer

| Transfer Item | Details | Status |
|---------------|---------|--------|
| **Database Platform** | PostgreSQL 16 on Hetzner VPS, managed by Coolify | — |
| **Production Database Backup** | Full pg_dump taken immediately before handover; compressed and encrypted | ✅ Backup taken |
| **Backup Format** | `.sql.gz` (gzip-compressed SQL dump) | ✅ |
| **Backup Encryption** | AES-256 encrypted backup file | ✅ |
| **Backup Location** | Transferred to TwinMOS Backblaze B2 bucket `twinmos-db-backups/` | ✅ |
| **Backup Verification** | Test restore to clean PostgreSQL instance — all data intact | ✅ Verified |
| **Database Access** | Unisoft database user accounts REVOKED; TwinMOS `admin` user confirmed active | ✅ |
| **Row Counts Verified** | Product: 118; SKU: ~450; Distributor: 47 active; Warranty Registrations: ~4,800; Order: ~1,200 | ✅ |

### 2.2 MeiliSearch Index Transfer

| Transfer Item | Details | Status |
|---------------|---------|--------|
| **Search Engine** | MeiliSearch v1.x self-hosted on Hetzner VPS | — |
| **Index Snapshot** | Full MeiliSearch index dump taken at handover | ✅ |
| **Index Names** | `products`, `sku`, `kb-articles`, `news`, `events`, `distributors` | ✅ All present |
| **Index Backup Location** | TwinMOS Backblaze B2 bucket `twinmos-search-backups/` | ✅ |
| **MeiliSearch Admin API Key** | Rotated to TwinMOS-controlled key; Unisoft key REVOKED | ✅ |

### 2.3 Media Assets Transfer

| Transfer Item | Details | Status |
|---------------|---------|--------|
| **Media Storage** | Backblaze B2 bucket `twinmos-media-prod` | — |
| **Bucket Contents** | All product images, brand assets, event photos, blog images, partner resources, CMS uploads | ✅ |
| **Bucket Ownership** | TwinMOS account (confirmed — Unisoft never had owner-level access; access was application-credential only) | ✅ |
| **Application Credentials** | Unisoft application key REVOKED; new TwinMOS application key active in Strapi | ✅ |
| **ImgProxy Configuration** | ImgProxy serving from Backblaze B2; Unisoft signing key rotated to TwinMOS key | ✅ |

---

## Part 3 — Third-Party Service Account Transfers

### 3.1 SaaS Account Ownership Transfers

| Service | Purpose | Account Transfer Status | TwinMOS Account Email | Unisoft Access Revoked |
|---------|---------|------------------------|----------------------|----------------------|
| **Cloudflare Pages** | Frontend CDN + hosting | ✅ Transferred | it@twinmos.com | ✅ Revoked |
| **Cloudflare DNS** | Domain management for twinmos.com | ✅ Transferred | it@twinmos.com | ✅ Revoked |
| **Cloudflare WAF** | Web Application Firewall | ✅ Under TwinMOS Cloudflare account | it@twinmos.com | ✅ Revoked |
| **Hetzner Cloud** | VPS hosting (Strapi, PostgreSQL, MeiliSearch, Chatwoot, Coolify) | ✅ Transferred | it@twinmos.com | ✅ Revoked |
| **Backblaze B2** | Object storage (media + backups) | ✅ Transferred to TwinMOS account | it@twinmos.com | ✅ Revoked |
| **Sentry** | Error monitoring (frontend + CMS) | ✅ Transferred | it@twinmos.com | ✅ Revoked |
| **UptimeRobot** | Uptime monitoring | ✅ Transferred | it@twinmos.com | ✅ Revoked |
| **Resend** | Transactional email | ✅ Transferred | it@twinmos.com | ✅ Revoked |
| **Plausible Analytics** | Privacy-first web analytics | ✅ Self-hosted; configuration on Hetzner VPS | it@twinmos.com | ✅ Revoked |
| **PostHog OSS** | Advanced analytics (self-hosted) | ✅ Self-hosted; admin account transferred | it@twinmos.com | ✅ Revoked |
| **Chatwoot** | Live chat (self-hosted) | ✅ Self-hosted; admin account transferred | it@twinmos.com | ✅ Revoked |
| **GitHub Organization** | Source code repositories | ✅ Repositories transferred to TwinMOS org | it@twinmos.com | ✅ Revoked |
| **Stripe** | Payment processing | ✅ Account registered under TwinMOS from project start | finance@twinmos.com | N/A — never in Unisoft control |
| **Medusa.js Cloud** (if used) | E-commerce platform | ✅ Under TwinMOS account | it@twinmos.com | ✅ Revoked (if applicable) |

### 3.2 API Keys and Secrets Rotation Log

| Secret | Previous Holder | Rotation Date | New Holder | Rotation Method |
|--------|----------------|---------------|------------|----------------|
| Strapi Admin JWT Secret | Unisoft-generated | October 2027 | TwinMOS IT Lead | New secret generated, deployed to production |
| Strapi API Token (public) | Unisoft-generated | October 2027 | TwinMOS IT Lead | New token generated |
| MeiliSearch Master API Key | Unisoft-generated | October 2027 | TwinMOS IT Lead | New key set in MeiliSearch + Strapi |
| PostgreSQL `admin` user password | Unisoft-generated | October 2027 | TwinMOS IT Lead | New password set; Unisoft user dropped |
| Backblaze B2 Application Key | Unisoft-generated | October 2027 | TwinMOS IT Lead | New key generated; old key deleted |
| Resend API Key | Unisoft account | October 2027 | TwinMOS IT Lead | New key under TwinMOS Resend account |
| Sentry DSN | Unisoft-generated | October 2027 | TwinMOS IT Lead | New DSN under TwinMOS Sentry project |
| reCAPTCHA / Cloudflare Turnstile site key | TwinMOS-registered from Day 1 | N/A — always TwinMOS | TwinMOS IT Lead | No rotation needed |
| Stripe Publishable + Secret Keys | TwinMOS account from Day 1 | N/A | Finance Director | Always under TwinMOS control |
| GitHub Actions Secrets (deploy tokens, etc.) | Unisoft-set in Unisoft org | October 2027 | TwinMOS IT Lead | Re-set under TwinMOS GitHub org |

---

## Part 4 — Documentation and Configuration Assets

### 4.1 Documentation Inventory Transferred

| Document | Location | Transfer Status |
|----------|----------|----------------|
| All project documentation (sections A–R) | `project documentation/` in TwinMOS file system | ✅ Always in TwinMOS possession |
| API Reference Documentation | `twinmos-website-cms/API-REFERENCE.md` | ✅ In transferred CMS repo |
| Architecture Decision Records (ADRs) | `D.5 - Architecture Decision Records/` | ✅ In project documentation |
| CMS Admin Guide | `J.2 - CMS and Content Operations/TwinMOSWebsiteCMSAdminGuide.md` | ✅ |
| Operations Runbook Master | `J.1 - Operations Runbooks/TwinMOSWebsiteOperationsRunbookMaster.md` | ✅ |
| Local Dev Setup Guide | `H.1 - Local and Environment Setup/TwinMOSWebsiteLocalDevSetup_Guide.md` | ✅ |
| Environment Variables Reference | `H.1 - Local and Environment Setup/TwinMOSWebsiteEnvironmentVariablesReference.md` | ✅ |
| Deployment Runbook | Included in Operations Runbook Master | ✅ |
| DR Runbook | Included in Operations Runbook Master | ✅ |
| Incident Response Runbook | Included in Operations Runbook Master | ✅ |
| CMS Training Recordings | Uploaded to Strapi media library (`/training-recordings/`) | ✅ |

### 4.2 Configuration Files Not in Repositories

| Item | Location | Notes |
|------|----------|-------|
| `.env` — Frontend production | Hetzner VPS + TwinMOS secret manager | Provided to TwinMOS IT Lead in encrypted form |
| `.env` — Strapi CMS production | Hetzner VPS + TwinMOS secret manager | Provided to TwinMOS IT Lead in encrypted form |
| Cloudflare Page Rules | Under TwinMOS Cloudflare account | Accessible via TwinMOS Cloudflare login |
| Coolify deployment variables | Coolify UI on Hetzner VPS | Accessible via TwinMOS Coolify admin login |
| GitHub Actions Secrets | Under TwinMOS GitHub org | Accessible via TwinMOS GitHub admin |

---

## Part 5 — Environment Variables Handover

A complete and current list of all production environment variables — including values — has been transmitted to the TwinMOS IT Lead via **end-to-end encrypted channel** (agreed in advance). The variables list corresponds to the template documented in `TwinMOSWebsiteEnvironmentVariablesReference.md`.

**Transmission method:** [Agreed secure channel — BitWarden Send / 1Password / encrypted email attachment — specify per actual method used]  
**Transmitted to:** TwinMOS IT Lead — [Name] — on [Date, October 2027]  
**TwinMOS IT Lead acknowledgment:** _______________ (signature)

> **IMPORTANT:** All environment variable values transmitted at handover should be treated as known to Unisoft. TwinMOS should rotate all secrets (JWT secrets, API keys, database passwords) within 7 days of receiving this handover, following the rotation log in §3.2 above.

---

## Part 6 — Verification and Testing Post-Transfer

### 6.1 Post-Transfer Verification Checklist

| Check | Performed By | Status | Date |
|-------|-------------|--------|------|
| Staging environment builds successfully from transferred repos | TwinMOS IT Lead | ✅ Verified | October 2027 |
| Production Strapi CMS accessible under TwinMOS Hetzner account | TwinMOS IT Lead | ✅ Verified | October 2027 |
| Cloudflare Pages deployment triggered by push to `main` (Unisoft personnel NOT involved) | TwinMOS IT Lead | ✅ Verified | October 2027 |
| Database restore from transferred backup — test environment | TwinMOS IT Lead | ✅ Verified | October 2027 |
| twinmos.com website serves correctly (no dependency on Unisoft infrastructure) | TwinMOS IT Lead | ✅ Verified | October 2027 |
| All Unisoft email addresses removed from Cloudflare, Hetzner, GitHub, Sentry, Resend | TwinMOS IT Lead | ✅ Verified | October 2027 |
| Sentry error alerts routed to TwinMOS email (not Unisoft) | TwinMOS IT Lead | ✅ Verified | October 2027 |
| UptimeRobot alerts routed to TwinMOS email | TwinMOS IT Lead | ✅ Verified | October 2027 |
| Stripe webhooks verified working after Unisoft access revocation | TwinMOS IT Lead | ✅ Verified | October 2027 |
| No Unisoft IP addresses in Cloudflare Access allowlists | TwinMOS IT Lead | ✅ Verified | October 2027 |
| New TwinMOS developer can clone repo and run local dev stack per README | TwinMOS IT Lead (or designate) | ✅ Verified | October 2027 |

---

## Part 7 — Unisoft Post-Transfer Obligations

Per IP Ownership Transfer Agreement §9 (Ongoing Obligations) and MSA §12.4:

| Obligation | Obligation Detail | Timeline |
|------------|------------------|----------|
| **Data Deletion** | Unisoft confirms deletion of all TwinMOS Confidential Information from Unisoft's systems (per MSA §8.5) within 30 days of this receipt execution | By November 2027 |
| **No Retained Copies** | Unisoft shall retain no complete copy of the source code, database dump, or media assets after 30 days | By November 2027 |
| **Legal/Audit Retention Exception** | Unisoft may retain such copies as required by applicable law or active legal proceedings, for a period no longer than legally required | Per applicable law |
| **Warranty Support Access** | During the 90-day warranty period, Unisoft may request temporary read-only access to production logs via TwinMOS IT Lead to diagnose warranty defects | Per MSA §10.4 |
| **Phase 4 Retainer** | If Phase 4 SOW-004 is executed, Unisoft will be granted repository access scoped to the Phase 4 SOW engagement | Per SOW-004 |

### 7.1 Unisoft Data Deletion Confirmation (to be signed at 30 days post-handover)

| Field | Details |
|-------|---------|
| **Confirmation Statement** | Unisoft Solutions Ltd. confirms that all TwinMOS Confidential Information (source code, database dumps, media assets, TwinMOS Data, and Proprietary Information) has been permanently deleted from all Unisoft systems and storage media. |
| **Unisoft Team Lead Name** | [Name] |
| **Signature** | _______________________________________________ |
| **Date** | November 2027 |

---

## Part 8 — Receipt Signatures

**TwinMOS Technologies Middle East FZE — Receiving Party:**

| Field | Details |
|-------|---------|
| **Name** | [TwinMOS IT Lead Name] |
| **Title** | IT Lead / Technical Lead |
| **Signature** | _______________________________________________ |
| **Date** | _________________________________________ |
| **Declaration** | I confirm receipt of all source code, documentation, and service account transfers described in this document. I confirm that post-transfer verification checks have been completed satisfactorily. |

---

**Unisoft Solutions Ltd. — Transferring Party:**

| Field | Details |
|-------|---------|
| **Name** | [Unisoft Team Lead Name] |
| **Title** | Senior Full-Stack Developer / Team Lead |
| **Organisation** | Unisoft Solutions Ltd. |
| **Signature** | _______________________________________________ |
| **Date** | _________________________________________ |
| **Declaration** | I confirm that all source code, configurations, documentation, and service account transfers described in this document have been completed. I acknowledge Unisoft's post-transfer obligations including data deletion within 30 days. |

---

*Document prepared by Unisoft Solutions Ltd. and TwinMOS Digital Transformation Team | Confidential — Internal Use Only*
