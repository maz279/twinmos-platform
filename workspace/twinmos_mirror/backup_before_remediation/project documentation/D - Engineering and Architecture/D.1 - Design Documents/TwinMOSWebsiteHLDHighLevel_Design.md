# TwinMOS Corporate Website — High-Level Design (HLD)

**Document Reference:** TWN-HLD-2026-001
**Document Version:** 1.0
**Status:** DRAFT — for Engineering Review
**Date:** 1 May 2026
**Prepared by:** TwinMOS Digital Transformation Team
**Owner:** IT/Technical Lead (Implementation)
**Audience:** Unisoft engineering team, TwinMOS leadership, DevOps, Security
**Classification:** CONFIDENTIAL — Unisoft + TwinMOS Internal Use
**Synchronized With:** Tech Stack v1.1, BRD v3.0, URD v3.0, RFP v3.0, Implementation Strategy v3.0

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Design Goals and Principles](#2-design-goals-and-principles)
3. [System Context and Boundaries](#3-system-context-and-boundaries)
4. [Layered Architecture Overview](#4-layered-architecture-overview)
5. [Component Decomposition](#5-component-decomposition)
6. [Data Flow Architecture](#6-data-flow-architecture)
7. [Security Architecture](#7-security-architecture)
8. [Scalability and Performance Strategy](#8-scalability-and-performance-strategy)
9. [Disaster Recovery and High Availability](#9-disaster-recovery-and-high-availability)
10. [Technology Mapping](#10-technology-mapping)
11. [Phase-by-Phase Architecture Evolution](#11-phase-by-phase-architecture-evolution)
12. [Appendix A: Glossary](#appendix-a-glossary)
13. [Appendix B: Reference Documents](#appendix-b-reference-documents)

---

## 1. Executive Summary

This High-Level Design (HLD) document defines the architectural blueprint for the TwinMOS corporate website redevelopment project. The architecture is built on a **headless CMS + static-site-generator** pattern, selected as Option 1A (Strapi v5 + Astro 5) per the Implementation Strategy v3.0.

### 1.1 Architecture at a Glance

| Layer | Primary Technology | Responsibility |
|-------|-------------------|----------------|
| **Edge / CDN** | Cloudflare | TLS termination, DDoS mitigation, WAF, bot management, global caching |
| **Frontend** | Astro 5 + React 19 islands | SSG/ISR/Server Islands, content rendering, user interaction |
| **Headless CMS** | Strapi v5 (Community Edition) | Content management, API layer, admin panel, user permissions |
| **Search Engine** | MeiliSearch 1.13.x | Faceted multilingual search, instant typeahead |
| **Database** | PostgreSQL 16 | Relational data persistence, ACID compliance |
| **Cache** | Redis (Phase 2+) | Session store, API response cache, rate limit counters |
| **Object Storage** | Backblaze B2 | Media assets, backups, static file storage |
| **Image Pipeline** | ImgProxy (self-hosted) | On-demand WebP/AVIF transforms, resize/crop |
| **Backend Hosting** | Hetzner CX32 → CX42 via Coolify | Single VPS orchestrating all backend services |
| **Frontend Hosting** | Cloudflare Pages | Edge-deployed static site with ISR |

### 1.2 Scale Parameters

| Metric | Value | Phase |
|--------|-------|-------|
| Content entries | 287 distinct entries | P1 |
| SKU detail pages | 100+ | P1 |
| Regional landing pages | 28 country pages | P1 |
| Legal/compliance pages | 34 | P1 |
| Supported locales | 9 (EN, AR, BN, HI, RU, ZH-CN, FR, ES, PT, DE) | P1–P4 |
| Active locales at launch | 1 (EN) | P1 |
| Build routes (full localization) | ~3,500 | P3 |
| Target Lighthouse Performance | >= 90 | P1 |
| Target LCP | <= 1.8 s | P1 |
| Target TTFB | <= 150 ms | P1 |
| Uptime SLA | >= 99.9% | P1 |
| RTO | <= 4 hours | P1 |
| RPO | <= 15 minutes | P1 |

---

## 2. Design Goals and Principles

### 2.1 Design Goals

| ID | Goal | Priority | Success Criteria |
|----|------|----------|------------------|
| DG-01 | Performance-first delivery | P0 | Lighthouse >= 90 on every page; LCP <= 1.8 s |
| DG-02 | Security by design | P0 | OWASP Top 10 mitigated; TLS 1.3; zero critical CVEs at launch |
| DG-03 | Scalable content operations | P0 | Marketing can publish without developer involvement |
| DG-04 | Multi-market readiness | P0 | 9-locale infrastructure ready; RTL support |
| DG-05 | Competitive feature parity | P0 | 14/14 standard tier-1 brand features implemented |
| DG-06 | Cost efficiency | P1 | Backend stack <$25/mo at Phase 1; <$80/mo at Phase 3 |
| DG-07 | Developer experience | P1 | 2-developer team can operate without DevOps specialist |
| DG-08 | Future-proof extensibility | P1 | E-commerce (P3), loyalty (P3), additional locales (P4) plug in cleanly |

### 2.2 Architectural Principles

1. **Static-First, Dynamic-When-Needed**: Default to SSG for all content pages. Use ISR for news/events. Use Server Islands only for personalized content (cart, partner portal).

2. **API-First Content**: All dynamic data flows through Strapi REST/GraphQL APIs. No direct database access from frontend.

3. **Edge-Optimized**: Leverage Cloudflare's global edge network for caching, security, and low-latency delivery.

4. **Self-Hosted Core, Managed Edge**: Keep data and business logic on owned infrastructure (Hetzner). Use managed edge services (Cloudflare) for delivery.

5. **Plugin-First, Custom-Second**: Prefer Strapi community plugins over custom code. Custom development only where no plugin meets requirements.

6. **Compliance by Design**: GDPR/UAE PDPL/India DPDP/KSA PDPL controls embedded in architecture, not bolted on.

---

## 3. System Context and Boundaries

### 3.1 Context Diagram

```
+------------------+     +------------------+     +------------------+
|   End Users      |     |   CMS Admins     |     |  Partner Users   |
| (Public visitors)|     | (Marketing/Editor)|    | (Distributors)   |
+------------------+     +------------------+     +------------------+
         |                        |                        |
         | HTTPS/TLS 1.3          | HTTPS/TLS 1.3          | HTTPS/TLS 1.3
         v                        v                        v
+-------------------------------------------------------------------+
|                      CLOUDFLARE GLOBAL EDGE                        |
|  (CDN + WAF + DDoS + Bot Management + HSTS + Cache + GPC)         |
+-------------------------------------------------------------------+
         |                        |                        |
         v                        v                        v
+------------------+     +------------------+     +------------------+
|  Public Website  |     |  Strapi Admin    |     | Partner Portal   |
|  (Astro 5 SSG)   |     |  (admin.twinmos) |     | (P2, Astro SSR)  |
+------------------+     +------------------+     +------------------+
         |                        |                        |
         |                        |                        |
         v                        v                        v
+-------------------------------------------------------------------+
|                    HETZNER BACKEND STACK (Coolify)                 |
|  +----------+  +----------+  +----------+  +----------+           |
|  | Strapi v5|  |PostgreSQL|  |MeiliSearch|  |  Redis   |           |
|  |   CMS    |  |   16     |  |  1.13.x  |  |  (P2+)   |           |
|  +----------+  +----------+  +----------+  +----------+           |
|  +----------+  +----------+  +----------+  +----------+           |
|  | ImgProxy |  | Plausible|  | Chatwoot |  | Medusa   |           |
|  |  3.x     |  |Analytics |  |  (P2)    |  |  (P3)    |           |
|  +----------+  +----------+  +----------+  +----------+           |
+-------------------------------------------------------------------+
         |                        |
         v                        v
+------------------+     +------------------+
| Backblaze B2     |     | External Services |
| (S3-compatible)  |     | (Resend, Stripe,  |
|                  |     | Sentry, GA4, etc) |
+------------------+     +------------------+
```

### 3.2 System Boundaries

| Boundary | Inside | Outside |
|----------|--------|---------|
| **TwinMOS Website System** | Astro frontend, Strapi backend, PostgreSQL, MeiliSearch, Redis, ImgProxy, Plausible | Cloudflare (edge service), Backblaze B2 (storage), external APIs |
| **TwinMOS Development Team** | GitHub repos, CI/CD pipelines, Coolify management | Cloudflare dashboard, Hetzner console, Backblaze console |
| **TwinMOS Content Operations** | Strapi admin panel, markdown files in `content/` | Translation vendor, design agency |
| **TwinMOS Commerce (P3)** | Medusa.js, Stripe Checkout integration | Stripe dashboard, payment processors |

### 3.3 External Interfaces

| Interface | Protocol | Direction | Data |
|-----------|----------|-----------|------|
| Cloudflare Pages deploy | HTTPS/Git | Outbound | Built static assets |
| Strapi API | REST/JSON | Inbound | Content, forms, search |
| MeiliSearch API | REST/JSON | Internal | Search indexes |
| PostgreSQL | TCP/5432 | Internal | Relational data |
| Backblaze B2 | S3 API/HTTPS | Outbound | Media uploads, backups |
| Resend API | REST/JSON | Outbound | Transactional emails |
| Stripe API | REST/JSON | Outbound | Payment processing (P3) |
| Sentry SDK | HTTPS | Outbound | Error/performance events |
| GA4/GTM | HTTPS | Outbound | Analytics events (consent-gated) |
| OpenStreetMap | HTTPS | Outbound | Map tiles |
| CRM Webhook | HTTPS | Outbound | Lead data |

---

## 4. Layered Architecture Overview

### 4.1 Four-Layer Architecture

```
+-------------------------------------------------------------+
|  LAYER 1: PRESENTATION (Edge + Browser)                     |
|  Cloudflare CDN → Cloudflare Pages → Astro 5 → React Islands|
|  Responsibilities: Rendering, hydration, client state, UX   |
+-------------------------------------------------------------+
                              |
                              | REST/JSON API
                              v
+-------------------------------------------------------------+
|  LAYER 2: APPLICATION (API + CMS)                           |
|  Strapi v5 Controllers → Services → Plugins → Middleware    |
|  Responsibilities: Business logic, auth, validation, hooks  |
+-------------------------------------------------------------+
                              |
                              | SQL / REST
                              v
+-------------------------------------------------------------+
|  LAYER 3: DATA (Persistence + Search)                       |
|  PostgreSQL 16 + MeiliSearch 1.13.x + Redis (P2)            |
|  Responsibilities: ACID persistence, full-text search, cache|
+-------------------------------------------------------------+
                              |
                              | S3 API / HTTPS
                              v
+-------------------------------------------------------------+
|  LAYER 4: INFRASTRUCTURE (Hosting + Storage + Edge)         |
|  Hetzner VPS + Coolify + Backblaze B2 + Cloudflare          |
|  Responsibilities: Compute, storage, networking, security   |
+-------------------------------------------------------------+
```

### 4.2 Layer 1: Presentation Layer

**Technology:** Astro 5 + React 19 islands + Tailwind CSS 4

**Responsibilities:**
- Static site generation (SSG) for 287+ content pages
- Incremental Static Regeneration (ISR) for news/events/SKU pages
- Server Islands for personalized content (cart badge, partner nav)
- Client-side hydration of interactive components (search, filters, forms)
- Multi-locale routing (`/`, `/ar/`, `/bn/`, `/hi/`, etc.)
- RTL layout support for Arabic
- Image optimization via Astro Sharp + ImgProxy

**Deployment:** Cloudflare Pages (edge-deployed, global CDN)

### 4.3 Layer 2: Application Layer

**Technology:** Strapi v5 (Community Edition) + Node.js 20 LTS

**Responsibilities:**
- Content management API (REST + GraphQL)
- Admin panel for marketing/content editors
- Authentication and authorization (JWT + MFA)
- Form submission handling and routing
- Webhook dispatch to CRM, email, analytics
- Lifecycle hooks for search indexing, cache invalidation
- Plugin ecosystem management

**Deployment:** Hetzner CX32/CX42 via Coolify (Docker containers)

### 4.4 Layer 3: Data Layer

**Technology:** PostgreSQL 16 + MeiliSearch 1.13.x + Redis (Phase 2+)

**Responsibilities:**
- PostgreSQL: Relational data persistence (products, forms, users, content)
- MeiliSearch: Full-text and faceted search with multilingual tokenization
- Redis: Session store, API response cache, rate limit counters (Phase 2+)

**Deployment:** Same Hetzner VPS, managed by Coolify

### 4.5 Layer 4: Infrastructure Layer

**Technology:** Hetzner Cloud + Coolify + Cloudflare + Backblaze B2

**Responsibilities:**
- Hetzner: Compute resources (VPS, volumes)
- Coolify: Container orchestration, environment management, deployment
- Cloudflare: DNS, CDN, WAF, DDoS protection, Pages hosting
- Backblaze B2: Object storage, backups, media assets

---

## 5. Component Decomposition

### 5.1 Frontend Repository (`twinmos-website-frontend`)

```
twinmos-website-frontend/
├── src/
│   ├── layouts/              # Astro layout templates
│   │   ├── LayoutHero.astro       # ~70 pages (homepage, brand, solutions)
│   │   ├── LayoutContent.astro    # ~150 pages (about, learn, news)
│   │   ├── LayoutProductDetail.astro  # 100+ SKU pages
│   │   ├── LayoutLegal.astro      # 34 legal pages
│   │   ├── LayoutForm.astro       # 16+ form pages
│   │   ├── LayoutLocator.astro    # Where-to-buy + offices
│   │   ├── LayoutCatalog.astro    # Category browsing
│   │   └── LayoutComparison.astro # SKU comparison
│   ├── pages/                # Astro file-based routing
│   │   ├── index.astro
│   │   ├── [locale]/
│   │   │   ├── index.astro
│   │   │   ├── products/
│   │   │   ├── about/
│   │   │   ├── support/
│   │   │   └── ...
│   │   └── api/              # Astro API routes (form actions)
│   ├── components/           # Astro components (server-rendered)
│   │   ├── ui/               # Primitive UI components
│   │   ├── sections/         # Page section components
│   │   └── shared/           # Shared layout components
│   ├── islands/              # React islands (client-hydrated)
│   │   ├── HeaderNavigation.tsx
│   │   ├── SearchBar.tsx
│   │   ├── ProductFilter.tsx
│   │   ├── CompatibilityFinder.tsx
│   │   ├── WhereToBuyLocator.tsx
│   │   ├── ContactForm.tsx
│   │   ├── CookieBanner.tsx
│   │   └── ...
│   ├── content/              # Astro Content Layer
│   │   └── website-content/  # 454 markdown files
│   ├── lib/                  # Utility functions
│   ├── stores/               # Nanostores (client state)
│   ├── styles/               # Global styles, Tailwind config
│   └── types/                # TypeScript type definitions
├── public/                   # Static assets
├── astro.config.ts
├── tailwind.config.ts
├── package.json
└── ...
```

### 5.2 Backend Repository (`twinmos-website-backend`)

```
twinmos-website-backend/
├── src/
│   ├── api/                  # Strapi API extensions
│   │   ├── product/
│   │   ├── category/
│   │   ├── form-submission/
│   │   ├── compatibility/
│   │   ├── distributor/
│   │   ├── retailer/
│   │   ├── news/
│   │   ├── rma/
│   │   ├── warranty/
│   │   └── ...
│   ├── extensions/           # Custom plugins
│   │   ├── audit-log/
│   │   └── ...
│   ├── middlewares/          # Custom middleware
│   │   ├── jwt-refresh.js
│   │   ├── rate-limiter.js
│   │   └── error-handler.js
│   ├── config/               # Strapi configuration
│   ├── database/             # Migrations
│   └── index.js
├── config/
├── database/
├── public/uploads/           # Strapi uploads (synced to B2)
├── package.json
└── ...
```

### 5.3 Shared Services

| Service | Technology | Purpose |
|---------|-----------|---------|
| **ImgProxy** | Self-hosted (Go) | On-demand image transforms (WebP/AVIF) |
| **Plausible** | Self-hosted (Elixir) | Privacy-first analytics |
| **Chatwoot** | Self-hosted (Ruby) | Live chat + helpdesk (P2) |
| **Medusa.js** | Self-hosted (Node.js) | E-commerce engine (P3) |
| **Redis** | Self-hosted | Cache + sessions (P2) |

---

## 6. Data Flow Architecture

### 6.1 Read Path: Static Content Pages

```
Markdown Files (content/website-content/)
         |
         | Astro Content Layer API (build-time)
         v
Astro Build (SSG)
         |
         | Static HTML + CSS + JS
         v
Cloudflare Pages (Edge Cache)
         |
         | HTTPS/TLS 1.3
         v
End-User Browser
```

**Characteristics:**
- Zero runtime database queries
- Maximum cacheability (Cloudflare edge + browser)
- Lighthouse 95+ achievable
- Build-time validation via Zod schemas

### 6.2 Read Path: Dynamic Content (News, SKU Details)

```
End-User Browser
         |
         | HTTPS
         v
Cloudflare Edge (cached HTML)
         |
         | Cache MISS
         v
Astro ISR (60s revalidation)
         |
         | REST API
         v
Strapi v5
         |
         | SQL Query
         v
PostgreSQL 16
```

**Characteristics:**
- ISR cache revalidation triggered by Strapi webhooks on publish
- 60-second stale-while-revalidate window
- API responses cached at Cloudflare edge

### 6.3 Read Path: Search

```
End-User Browser
         |
         | Typeahead query
         v
Astro React Island (<SearchBar />)
         |
         | REST API
         v
MeiliSearch
         |
         | Indexed data
         v
Strapi (lifecycle hooks maintain index)
```

**Characteristics:**
- Sub-50ms search response time
- Multilingual tokenization (Arabic, CJK, Latin)
- Faceted filtering (category, brand, specs)

### 6.4 Write Path: Form Submission

```
End-User Browser
         |
         | POST /api/form-submissions
         v
Astro API Route (server action)
         |
         | Validation (Zod)
         v
Strapi FormSubmission Collection
         |
         | Lifecycle Hook
         +-----> Resend API (confirmation email)
         +-----> CRM Webhook (lead creation)
         +-----> Slack Notification (internal alert)
```

### 6.5 Write Path: CMS Content Publish

```
CMS Admin (Strapi Admin Panel)
         |
         | Click "Publish"
         v
Strapi Content Manager
         |
         | Lifecycle Hook
         +-----> MeiliSearch Re-index
         +-----> Webhook to Cloudflare (cache purge)
         +-----> Audit Log Entry
```

---

## 7. Security Architecture

### 7.1 Defense in Depth

```
Layer 1: Edge Security (Cloudflare)
├── DDoS Protection (Layer 3/4/7)
├── WAF (OWASP Top 10 ruleset)
├── Bot Management
├── Rate Limiting
├── TLS 1.3 + HSTS preload
└── GPC (Global Privacy Control) support

Layer 2: Application Security (Strapi)
├── JWT Authentication (RS256, 1h access + rotating refresh)
├── Role-Based Access Control (RBAC)
├── MFA (TOTP) for admin roles
├── Input validation (Zod on frontend, Strapi validators on backend)
├── SQL injection prevention (parameterized queries via Knex)
├── XSS protection (output encoding, CSP headers)
└── Audit logging (all CMS actions)

Layer 3: Data Security
├── PostgreSQL LUKS encryption at rest
├── TLS for all internal service communication
├── Backblaze B2 encrypted backups
├── PII minimization (only collect necessary data)
└── Data retention policies (GDPR/UAE PDPL/India DPDP/KSA PDPL compliant)

Layer 4: Infrastructure Security
├── Hetzner firewall (port restrictions)
├── Coolify container isolation
├── Regular OS patching
├── SSH key-only access
└── Fail2ban for brute-force protection
```

### 7.2 Authentication Flows

**Public Website (Read-Only):**
- No authentication required
- Cloudflare Turnstile on forms (bot protection)

**CMS Admin:**
- Username/password + TOTP MFA
- JWT token (1-hour TTL)
- Session managed via httpOnly cookie
- Role-based permissions (Super Admin, Admin, Editor, Author, Viewer)

**Partner Portal (Phase 2):**
- Better Auth (OAuth + MFA)
- JWT tokens
- Role-based gated content access

### 7.3 Content Security Policy (CSP)

```
default-src 'self';
script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com;
style-src 'self' 'unsafe-inline';
img-src 'self' data: https://*.twinmos.com https://*.backblazeb2.com;
font-src 'self';
connect-src 'self' https://api.twinmos.com https://sentry.io;
frame-src 'none';
object-src 'none';
base-uri 'self';
form-action 'self';
```

---

## 8. Scalability and Performance Strategy

### 8.1 Horizontal Scaling Path

| Current State | Scaling Trigger | Next State |
|---------------|----------------|------------|
| Single Hetzner CX32 | CPU > 70% sustained | Upgrade to CX42 |
| Single CX42 | CPU > 70% sustained | Split: Strapi on CX42, DB on dedicated CX32 |
| Single DB server | Query latency > 100ms | Add read replica |
| MeiliSearch single node | Index size > 10GB | MeiliSearch Enterprise (sharding) |
| Cloudflare Pages | Build time > 5 min | Cloudflare Pages Pro (parallel builds) |

### 8.2 Caching Strategy

| Cache Layer | Technology | TTL | Invalidation |
|-------------|-----------|-----|--------------|
| Browser | Cache-Control headers | 1 year (static assets) | Filename hashing |
| Cloudflare Edge | CDN cache | 1 hour (HTML) | Webhook purge on publish |
| Cloudflare Edge | API cache | 5 minutes (API responses) | Cache-tag purge |
| Redis (P2) | API response cache | 10 minutes | Key-based invalidation |
| Redis (P2) | Session store | 24 hours | On logout |
| Astro Build | ISR cache | 60 seconds | Webhook revalidation |

### 8.3 Performance Budgets

| Metric | Target | Maximum | Measurement |
|--------|--------|---------|-------------|
| LCP | <= 1.8 s | <= 2.5 s | Lighthouse CI |
| CLS | <= 0.05 | <= 0.1 | Lighthouse CI |
| INP | <= 150 ms | <= 200 ms | Lighthouse CI |
| TTFB | <= 150 ms | <= 300 ms | WebPageTest |
| TBT | <= 150 ms | <= 200 ms | Lighthouse CI |
| JS bundle (islands) | <= 100 KB | <= 150 KB | Bundle analyzer |
| Total page weight | <= 1.5 MB | <= 2.5 MB | Lighthouse |

---

## 9. Disaster Recovery and High Availability

### 9.1 Backup Strategy

| Data | Frequency | Method | Retention | Location |
|------|-----------|--------|-----------|----------|
| PostgreSQL | Daily | pg_dump | 30 days | Backblaze B2 |
| PostgreSQL WAL | Every 15 min | WAL streaming | 7 days | Backblaze B2 |
| Strapi uploads | Real-time | Sync to B2 | 30 days | Backblaze B2 |
| Full system | Weekly | Coolify backup | 4 weeks | Backblaze B2 |
| Markdown content | Continuous | Git | Infinite | GitHub |

### 9.2 Recovery Procedures

| Scenario | RTO | RPO | Recovery Action |
|----------|-----|-----|----------------|
| Database corruption | 4 hours | 15 minutes | Restore from latest pg_dump + replay WAL |
| VPS failure | 4 hours | 15 minutes | Provision new Hetzner instance, restore from Coolify backup |
| Accidental data deletion | 1 hour | 15 minutes | Restore from soft-delete (30-day window) |
| CMS admin error | 30 minutes | 0 | Revert to previous version (Strapi version history) |
| Cloudflare outage | 5 minutes | 0 | DNS failover to backup CDN (configured but not active) |

### 9.3 High Availability Measures

- Cloudflare anycast provides automatic failover across 300+ edge locations
- Daily DR drills scheduled before each phase launch
- Backup restoration tested monthly
- Runbook documented in H.4 Operations Runbooks

---

## 10. Technology Mapping

### 10.1 Complete Technology Inventory

| Category | Technology | Version | Purpose | Phase |
|----------|-----------|---------|---------|-------|
| **Frontend Framework** | Astro | >= 5.6.0 | SSG/ISR/Server Islands | P1 |
| **UI Framework** | React | 19.x | Interactive islands | P1 |
| **Styling** | Tailwind CSS | 4.x | Utility-first CSS | P1 |
| **CMS** | Strapi | >= 5.31.0 | Headless CMS | P1 |
| **Database** | PostgreSQL | 16.x | Relational data | P1 |
| **Search** | MeiliSearch | 1.13.x | Full-text search | P1 |
| **Cache** | Redis | 7.x | Session/cache | P2 |
| **Image Pipeline** | Astro Sharp | 0.34.x | Build-time transforms | P1 |
| **Image Pipeline** | ImgProxy | 3.x | Runtime transforms | P1 |
| **Auth (CMS)** | Strapi Users-Permissions | Bundled | Admin auth | P1 |
| **Auth (Portal)** | Better Auth | ^1.x | Partner auth | P2 |
| **E-Commerce** | Medusa.js | 2.x | Commerce engine | P3 |
| **Payments** | Stripe | Current | Payment processing | P3 |
| **Email** | Resend | API stable | Transactional email | P1 |
| **Live Chat** | Chatwoot | 3.x | Customer support | P2 |
| **Analytics (Privacy)** | Plausible | 2.1.x | Cookieless analytics | P1 |
| **Analytics (Marketing)** | GA4 + GTM | Current | Marketing analytics | P1 |
| **Monitoring** | Sentry | 9.x | Error/performance | P1 |
| **Uptime** | UptimeRobot | Free tier | Availability monitoring | P1 |
| **Bot Protection** | Cloudflare Turnstile | Current | Form protection | P1 |
| **Maps** | Leaflet | 1.9.x | Basic maps | P1 |
| **Maps** | MapLibre GL JS | 4.x | Vector maps | P2 |
| **Object Storage** | Backblaze B2 | S3-compatible | Media + backups | P1 |
| **Frontend Hosting** | Cloudflare Pages | Edge | Static site hosting | P1 |
| **Backend Hosting** | Hetzner CX32/42 | VPS | Backend stack | P1 |
| **Orchestration** | Coolify | v4/v5 | Container management | P1 |
| **CI/CD** | GitHub Actions | Current | Build/deploy pipelines | P1 |
| **Pre-commit** | Husky + lint-staged | Current | Git hooks | P1 |
| **Forms** | React Hook Form | 7.x | Form handling | P1 |
| **Validation** | Zod | 3.x | Schema validation | P1 |
| **State** | Nanostores | 0.10+ | Client state | P1 |
| **Date/Time** | Day.js | Current | i18n dates | P1 |
| **Markdown** | Remark/Rehype | Current | MD processing | P1 |
| **Testing (Unit)** | Vitest | Current | Unit tests | P1 |
| **Testing (E2E)** | Playwright | Current | E2E tests | P1 |
| **API Client** | Bruno | Current | API testing | P1 |

---

## 11. Phase-by-Phase Architecture Evolution

### 11.1 Phase 1 (Months 1–5): Core Website

**Architecture Characteristics:**
- English-only content
- SSG for all pages
- ISR for news/events (60s revalidation)
- Basic search via MeiliSearch
- 15+ form types
- Product catalog with faceted filtering
- Compatibility finder MVP
- Where-to-buy locator (Leaflet)
- 34 legal pages
- Gaming hub (static)

**Services Active:** Astro, Strapi, PostgreSQL, MeiliSearch, ImgProxy, Plausible, Cloudflare, Backblaze B2, Resend, Sentry, UptimeRobot, Turnstile

### 11.2 Phase 2 (Months 6–9): Localization & Partner Enablement

**Architecture Additions:**
- Redis cache layer added
- Arabic (RTL), Bengali, Hindi locales activated
- Partner portal with Better Auth
- Live chat (Chatwoot)
- Anti-counterfeit serial lookup
- RMA portal with status tracking
- Firmware download center
- RGB visualizer
- Build gallery moderation
- Full compatibility finder with QVL data

**Services Added:** Redis, Chatwoot, Better Auth

### 11.3 Phase 3 (Months 10–15): Commerce & Advanced Features

**Architecture Additions:**
- Russian, Chinese-Simplified, French locales
- Medusa.js e-commerce engine
- Stripe Checkout integration
- Cart and checkout flow
- Order management
- Advanced analytics (PostHog session replay)
- Loyalty program
- Referral program
- MDF program for distributors

**Services Added:** Medusa.js, Stripe, PostHog

### 11.4 Phase 4 (Months 16+): Ongoing Optimization

**Architecture Additions:**
- Spanish, Portuguese, German locales
- Continuous SEO/CRO
- Additional performance optimizations
- Feature expansion based on analytics insights

---

## Appendix A: Glossary

| Term | Definition |
|------|-----------|
| **ADR** | Architecture Decision Record |
| **CSP** | Content Security Policy |
| **ISR** | Incremental Static Regeneration |
| **LCP** | Largest Contentful Paint |
| **MFA** | Multi-Factor Authentication |
| **RTO** | Recovery Time Objective |
| **RPO** | Recovery Point Objective |
| **RTL** | Right-to-Left (text direction) |
| **SSG** | Static Site Generation |
| **SSR** | Server-Side Rendering |
| **TOTP** | Time-based One-Time Password |
| **WAF** | Web Application Firewall |

---

## Appendix B: Reference Documents

| Document | Version | Location |
|----------|---------|----------|
| TwinMOS Website Technology Stack | v1.1 | `TwinMOS_Website_Technology_Stack.md` |
| TwinMOS Website BRD | v3.0 | `TwinMOS_Website_BRD.md` |
| TwinMOS Website URD | v3.0 | `TwinMOS_Website_URD.md` |
| TwinMOS Website RFP | v3.0 | `TwinMOS_Website_RFP.md` |
| TwinMOS Website Implementation Strategy | v3.0 | `TwinMOS_Website_Implementation_Strategy.md` |
| TwinMOS Website Content Map | v1.0 | `content/TwinMOS_Website_Content_Map.md` |
| TwinMOS Master SKU Reference | v1.0 | `content/website-content/_master-sku-reference.md` |

---

## Document Sign-Off

| Role | Name | Sign-Off | Date |
|------|------|----------|------|
| IT/Technical Lead | (TBC) | _______________ | _________ |
| Unisoft Team Lead | (TBC) | _______________ | _________ |
| Unisoft Senior Developer | (TBC) | _______________ | _________ |
| Project Sponsor | Mohd Mazharul Islam | _______________ | _________ |
