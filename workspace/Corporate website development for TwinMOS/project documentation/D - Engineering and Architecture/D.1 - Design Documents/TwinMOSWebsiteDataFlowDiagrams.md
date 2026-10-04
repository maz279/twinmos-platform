# TwinMOS Corporate Website — Data Flow Diagrams

**Document Reference:** TWN-DFD-2026-001
**Document Version:** 1.0
**Status:** DRAFT
**Date:** 1 May 2026
**Synchronized With:** Tech Stack v1.1, HLD v1.0, LLD v1.0

---

## Table of Contents

1. [Document Scope and Notation](#1-document-scope-and-notation)
2. [Context-Level Data Flow (DFD Level 0)](#2-context-level-data-flow-dfd-level-0)
3. [Build-Time Content Flow (DFD Level 1)](#3-build-time-content-flow-dfd-level-1)
4. [Runtime API Data Flow (DFD Level 1)](#4-runtime-api-data-flow-dfd-level-1)
5. [Search Indexing Flow](#5-search-indexing-flow)
6. [Form Submission Flow](#6-form-submission-flow)
7. [Analytics and Observability Flow](#7-analytics-and-observability-flow)
8. [Image Pipeline Flow](#8-image-pipeline-flow)
9. [Backup and Disaster Recovery Flow](#9-backup-and-disaster-recovery-flow)
10. [E-Commerce Flow (Phase 3)](#10-e-commerce-flow-phase-3)
11. [Partner Portal Flow (Phase 2)](#11-partner-portal-flow-phase-2)
12. [Data Flow Security Boundaries](#12-data-flow-security-boundaries)

---

## 1. Document Scope and Notation

### 1.1 Scope

This document defines the data flows for the TwinMOS corporate website across all operational modes: build-time static generation, runtime API requests, background processing, and cross-system integrations.

### 1.2 Notation (Yourdon/DeMarco DFD)

| Symbol | Meaning |
|--------|---------|
| Circle / Bubble | Process (transforms data) |
| Rectangle | External Entity (source/sink) |
| Open Rectangle | Data Store |
| Arrow | Data Flow (labeled with data content) |

---

## 2. Context-Level Data Flow (DFD Level 0)

### 2.1 Major Data Flows Summary

| Flow ID | From | To | Data | Frequency | Volume |
|---------|------|-----|------|-----------|--------|
| DF-01 | Visitor | Cloudflare Edge | HTTPS request (page, asset, API) | Real-time | 50K-500K/mo |
| DF-02 | Cloudflare Edge | Astro SSG/ISR | Cached static HTML or API proxy | Real-time | 50K-500K/mo |
| DF-03 | Astro Build | Strapi API | Content fetch (products, news, retailers) | Build-time / 60s ISR | ~3,500 pages |
| DF-04 | Marketing | Strapi Admin | Content CRUD (draft -> publish) | Daily | 287 entries |
| DF-05 | Strapi | MeiliSearch | Index updates (lifecycle hooks) | On change | ~50K entries/yr |
| DF-06 | Visitor | MeiliSearch | Search queries (proxied via Strapi) | Real-time | ~10K/mo |
| DF-07 | Astro Forms | Strapi | Form submissions (15 types) | Real-time | ~10K/yr |
| DF-08 | Strapi | Resend | Transactional emails | On event | ~50K/yr |
| DF-09 | Strapi | HubSpot CRM | Lead/deal creation | On form submit | ~5K/yr |
| DF-10 | Strapi | Backblaze B2 | Media uploads, backups | Continuous | ~100GB/yr |
| DF-11 | Manufacturing | Strapi | Serial number ingest (CSV) | Daily (P2) | ~1M records |
| DF-12 | ERP System | Strapi | Product master sync | Daily batch (P2) | ~100 SKUs |

---

## 3. Build-Time Content Flow (DFD Level 1)

### 3.1 Static Site Generation Flow

```
Git Repository (GitHub)
  - Markdown
  - Components
  - Config
         |
         | git checkout
         v
  GitHub Actions CI/CD Pipeline
         |
         v
  Astro Build (SSG + ISR)
         |
    +----+----+----+
    |         |         |
    v         v         v
 Content   Strapi   MeiliSearch
 Layer     REST API  Search API
 (MD/MDX)  (Dynamic) (Faceted)
    |         |         |
    +----+----+----+
         |
         v
  Static HTML Output
  - 287 content pages
  - 100+ SKU pages
  - 28 regional pages
  - 34 legal pages
         |
         v
  Cloudflare Pages Deploy
```

### 3.2 Build-Time Data Sources

| Source | Type | Data | Build Integration |
|--------|------|------|-------------------|
| content/website-content/**/*.md | Markdown | 454 files -> 287 content entries | Astro Content Layer API with Zod validation |
| Strapi /api/products | REST API | 100+ SKU records | getStaticPaths() + fetch() at build |
| Strapi /api/news-articles | REST API | News, events, press releases | ISR with 60s revalidation |
| Strapi /api/retailers | REST API | 200+ retailer records | Static generation at build |
| Strapi /api/regional-pages | REST API | 28 country landing pages | Static generation at build |

### 3.3 ISR Revalidation Flow

Marketing publishes content in Strapi Admin
    -> Strapi webhook triggered
    -> POST to Cloudflare Pages Deploy Hook
    -> Cloudflare invalidates cache tag
    -> Next request -> Astro rebuilds affected page
    -> Fresh HTML served from edge

---

## 4. Runtime API Data Flow (DFD Level 1)

### 4.1 Read Path (Visitor -> Content)

Visitor Browser -> Cloudflare Edge/CDN -> Astro SSR/ISR -> Strapi REST API
                                              ^              |
                                              | cache hit    |
                                              +--------------+
                                                             |
                                                    +--------+--------+
                                                    |                 |
                                                    v                 v
                                              PostgreSQL      MeiliSearch
                                              (Strapi DB)     (Search Idx)

### 4.2 Write Path (Form Submission)

Visitor Browser -> Astro Form Action -> Strapi Controller -> PostgreSQL (persist)
                                              |
                    +-------------------------+-------------------------+
                    |                         |                         |
                    v                         v                         v
                Resend (email)         HubSpot CRM (webhook)      Slack (#ops)

### 4.3 API Endpoint Categories

| Category | Endpoints | Auth | Rate Limit |
|----------|-----------|------|------------|
| Public Read | /api/products, /api/news-articles, /api/retailers | None | 100 req/min |
| Public Search | /api/search (MeiliSearch proxy) | None | 100 req/min |
| Form Submit | /api/form-submissions | Turnstile token | 10/10min/IP |
| Partner Read | /api/partner/*, /api/price-lists | JWT (Better Auth) | 1,000 req/min |
| Admin | /admin/*, /api/admin/* | JWT + MFA | 1,000 req/min |
| Serial Check | /api/v1/serial/check | Turnstile | 5/min/IP |

---

## 5. Search Indexing Flow

### 5.1 MeiliSearch Index Lifecycle

Strapi Lifecycle Hooks (afterCreate/afterUpdate/afterDelete/afterPublish)
    |
    v
strapi-plugin-meilisearch
    - Transform Strapi entity -> MeiliSearch document
    - Apply per-locale ranking rules
    - Update searchableAttributes / displayedAttributes
    |
    v
MeiliSearch Indexes: products, articles, kb_items, retailers, compatibility
    |
    v
Search API Responses
    - Typo-tolerant matching
    - Faceted filtering (category, brand, capacity, speed, RGB)
    - Multi-language tokenization (Arabic, CJK, Latin)
    - Response < 100 ms target

### 5.2 Index Configuration per Content Type

| Index | Primary Key | Searchable Attributes | Facets | Sortable |
|-------|-------------|----------------------|--------|----------|
| products | sku | name, description, keywords | category, brand_line, capacity, speed, form_factor, rgb | price, release_date |
| articles | slug | title, excerpt, body | category, author, tags | publish_date |
| kb_items | slug | title, body, tags | category | helpful_count |
| retailers | id | company_name, city, country | country, type, is_authorized | -- |
| compatibility | id | device_brand, device_model | device_type, qvl_status | -- |
| valid_serials (P2) | serial_number | serial_number | status | manufactured_at |

---

## 6. Form Submission Flow

### 6.1 Generic Form Processing Pipeline

1. RENDER: Astro Page -> React Hook Form -> Zod Validation
2. SUBMIT: Turnstile Token -> Astro Form Action -> Strapi Controller
3. PROCESS: PostgreSQL (persist) -> Lifecycle Hook -> Resend (email)
                                               -> Webhook Router -> HubSpot CRM
                                               -> Slack (#ops)

### 6.2 Form-Specific Routing

| Form Type | Strapi Collection | Email To | CRM Action | Slack Channel |
|-----------|-------------------|----------|------------|---------------|
| General contact | form_submission | sales@ (regional) | Create contact | #sales |
| Sales inquiry | form_submission | sales@ + CRM | Create deal | #sales |
| Distributor application | form_submission | partners@ | Create partner lead | #partners |
| Technical support | form_submission | support@ | Create ticket | #support |
| Warranty registration | warranty_registration | warranty@ | -- | #support |
| RMA request (P2) | rma_request | support@ | -- | #support |
| Counterfeit report (P2) | counterfeit_report | legal@ | -- | #legal |
| Job application | job_application | hr@ | -- | #hr |
| Newsletter signup | newsletter_subscriber | -- | Update consent | -- |
| Build submission (P2) | build_submission | -- | -- | #community |

---

## 7. Analytics and Observability Flow

### 7.1 Privacy-First Analytics (Plausible)

Visitor Browser (page view) -> Astro Middleware -> Plausible (self-hosted) -> PostgreSQL (analytics DB)

Consent-gated: Only loads after cookie banner "Analytics" accepted
No cookies, no personal data, GDPR/UAE PDPL/India DPDP clean by default

### 7.2 Error Monitoring (Sentry)

Astro (Browser + Node) -> Sentry SDK -> Sentry Dashboard
Strapi (Node) -> Sentry SDK -> Slack #alerts

Coverage: Errors, Performance (RUM), Web Vitals, Session Replay (opt-in)

### 7.3 Custom Event Tracking

| Event | Source | Destination | Trigger |
|-------|--------|-------------|---------|
| page_view | Astro middleware | Plausible | Every page load |
| cta_click | React island | Plausible | Button/link click |
| form_submit | Form action | Plausible + Sentry | Successful submission |
| search_query | Search island | Plausible | Search executed |
| compatibility_lookup | Compatibility island | Plausible | Device selected |
| where_to_buy_click | Locator island | Plausible | Retailer link clicked |
| product_compare | Compare island | Plausible | SKU added to comparison |
| cart_add (P3) | Cart island | Plausible + PostHog | Item added |
| checkout_complete (P3) | Stripe webhook | Plausible + PostHog | Payment confirmed |

---

## 8. Image Pipeline Flow

### 8.1 Build-Time Image Processing

Source Images (PNG/JPG in repo or CMS)
    |
    v
Astro Sharp (build-time) -> Transform (WebP/AVIF, resize, srcset) -> Output (static files, srcset, Cloudflare edge cache)

### 8.2 Runtime Image Processing (ImgProxy)

Visitor Browser -> Cloudflare Edge/CDN -> ImgProxy (Hetzner) -> Backblaze B2 (origin)
    ^                                        |
    | cache miss                             |
    +----------------------------------------+
         (transformed image: WebP/AVIF + resized)

ImgProxy operations: resize, crop, format conversion, quality adjustment
Signed URLs prevent unauthorized transformations

---

## 9. Backup and Disaster Recovery Flow

### 9.1 Backup Pipeline

Hetzner VPS:
  - STRAPI uploads/
  - POSTGRESQL data
  - MEILISEARCH indexes
  - IMGPROXY cache
         |
         v
Backup Schedule:
  - pg_dump (daily 02:00 UTC)
  - WAL stream (every 15 min)
  - Strapi uploads (mirror on write)
  - Coolify config (weekly)
         |
         v
Backblaze B2 (Encrypted):
  - 30-day daily backups
  - 12-month monthly archives
  - 7-year compliance archive (P3 invoices/orders)
  - AES-256 encryption
  - S3-compatible API

### 9.2 Recovery Procedures

| Scenario | RTO | Recovery Method |
|----------|-----|-----------------|
| Database corruption | < 1 h | Restore latest pg_dump + replay WAL |
| Full VPS loss | < 4 h | Provision new CX32 -> restore from B2 -> update DNS |
| Strapi config loss | < 30 min | Restore from config-sync JSON |
| Media loss | < 4 h | Restore from B2 versioning |
| Frontend corruption | < 30 min | Re-deploy from Git -> Cloudflare Pages |

---

## 10. E-Commerce Flow (Phase 3)

### 10.1 Checkout Data Flow

Customer Browser -> Astro Cart/PDP -> Medusa Store API -> Stripe Checkout
    ^                                              |              |
    |                                              v              v
    |                                       PostgreSQL      Stripe Webhook
    |                                       (medusa DB)     |
    |                                                       |
    +-------------------------------------------------------+
              (order confirmation email via Resend)

### 10.2 Medusa-Strapi Sync Flow

Strapi (Product master) <-> medusa-plugin-strapi <-> Medusa (Commerce engine)

Strapi -> Medusa: SKU, name, description, images, SEO metadata
Medusa -> Strapi: price, inventory, order status, promotions

---

## 11. Partner Portal Flow (Phase 2)

### 11.1 Authentication and Content Access

Partner Browser -> Astro /partner/* -> Better Auth (session) -> PostgreSQL (sessions)
    ^                                    |
    |                                    v
    |                              Strapi (gated content)
    |                                    |
    |                                    v
    +----------------------------- Watermark Service (PDF gen)
              (watermarked price-list PDF)

---

## 12. Data Flow Security Boundaries

### 12.1 Trust Zones

| Zone | Classification | Data Types | Controls |
|------|---------------|------------|----------|
| Public Internet | Untrusted | HTTP requests, search queries | TLS 1.3, WAF, rate limiting |
| Cloudflare Edge | Semi-trusted | Cached HTML, API responses | DDoS mitigation, bot management |
| Astro Frontend | Trusted (read-only) | Static content, public API data | CSP, HSTS, no secrets |
| Strapi API | Trusted | All CMS data, form submissions | JWT auth, RBAC, audit logs |
| Strapi Admin | Highly trusted | User management, schema changes | MFA, IP whitelist, audit logs |
| Hetzner VPS | Highly trusted | Database, search indexes, sessions | LUKS encryption, firewall, no public DB ports |
| Backblaze B2 | Trusted | Backups, media assets | AES-256, signed URLs |

### 12.2 Data Classification in Transit

| Classification | Examples | Transit Protection |
|---------------|----------|-------------------|
| Public | Product specs, news articles, retailer locations | TLS 1.3 |
| Internal | Form submissions (non-PII), analytics events | TLS 1.3 + API auth |
| Confidential | PII (names, emails, phone), partner pricing | TLS 1.3 + JWT + field-level RBAC |
| Restricted | Serial numbers, CRM data, financial records | TLS 1.3 + JWT + MFA + audit logging |

---

**Document End**
