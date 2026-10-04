# TwinMOS Corporate Website — System Architecture Diagram

**Document Reference:** TWN-ARCH-DIAGRAM-2026-001
**Document Version:** 1.0
**Status:** DRAFT
**Date:** 1 May 2026
**Synchronized With:** HLD v1.0, Tech Stack v1.1

---

## 1. Top-Level System Architecture

```mermaid
graph TB
    subgraph "End-User Layer"
        BROWSER[Browser<br/>Chrome/Safari/Firefox/Edge]
    end

    subgraph "Edge Layer (Cloudflare)"
        CF[Cloudflare Global Edge<br/>CDN + WAF + DDoS + Bot Mgmt]
        CFPAGES[Cloudflare Pages<br/>Astro 5 Static Site]
    end

    subgraph "Backend Stack (Hetzner CX32/42 via Coolify)"
        STRAPI[Strapi v5 CMS<br/>REST/GraphQL API]
        POSTGRES[(PostgreSQL 16<br/>Relational Data)]
        MEILI[MeiliSearch 1.13.x<br/>Full-Text Search]
        REDIS[(Redis 7<br/>Cache + Sessions P2)]
        IMGPROXY[ImgProxy 3.x<br/>Image Transforms]
        PLAUSIBLE[Plausible 2.1.x<br/>Privacy Analytics]
        CHATWOOT[Chatwoot 3.x<br/>Live Chat P2]
        MEDUSA[Medusa.js 2.x<br/>E-Commerce P3]
    end

    subgraph "Storage Layer"
        B2[Backblaze B2<br/>S3-Compatible Object Storage]
    end

    subgraph "External Services"
        RESEND[Resend<br/>Transactional Email]
        STRIPE[Stripe<br/>Payments P3]
        SENTRY[Sentry 9.x<br/>Error Monitoring]
        GA4[GA4 + GTM<br/>Marketing Analytics]
        OSM[OpenStreetMap<br/>Map Tiles]
        CRM[HubSpot/Zoho CRM<br/>Lead Management]
    end

    BROWSER -->|TLS 1.3| CF
    CF --> CFPAGES
    CF -->|API Calls| STRAPI
    CF -->|Image Requests| IMGPROXY

    STRAPI --> POSTGRES
    STRAPI --> MEILI
    STRAPI -->|Lifecycle Hooks| REDIS
    STRAPI --> B2
    STRAPI -->|Webhooks| RESEND
    STRAPI -->|Webhooks| CRM

    CFPAGES -->|Search Queries| MEILI
    CFPAGES -->|Form Submissions| STRAPI

    IMGPROXY --> B2

    PLAUSIBLE --> BROWSER
    CHATWOOT --> BROWSER
    MEDUSA --> STRIPE
    MEDUSA --> POSTGRES

    SENTRY --> BROWSER
    SENTRY --> STRAPI
    GA4 --> BROWSER
    OSM --> BROWSER
```

---

## 2. Component Interaction Diagram

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant CF as Cloudflare Edge
    participant Astro as Astro 5 (Pages)
    participant Strapi as Strapi v5
    participant Meili as MeiliSearch
    participant Postgres as PostgreSQL
    participant B2 as Backblaze B2

    User->>Browser: Navigate to twinmos.com
    Browser->>CF: GET / (HTTPS)
    CF->>Astro: Cache MISS → Forward
    Astro-->>CF: Static HTML (SSG)
    CF-->>Browser: HTML + Cache Headers

    User->>Browser: Search "DDR5 32GB"
    Browser->>CF: GET /api/search?q=DDR5+32GB
    CF->>Astro: API Route
    Astro->>Meili: Search query
    Meili-->>Astro: Search results
    Astro-->>CF: JSON response
    CF-->>Browser: Results (cached 5min)

    User->>Browser: Click product
    Browser->>CF: GET /products/voltx-ddr5-32gb
    CF->>Astro: ISR request
    Astro->>Strapi: GET /api/products/voltx-ddr5-32gb
    Strapi->>Postgres: SELECT product data
    Postgres-->>Strapi: Product record
    Strapi-->>Astro: JSON response
    Astro-->>CF: Rendered HTML
    CF-->>Browser: Product page

    User->>Browser: Submit contact form
    Browser->>CF: POST /api/form-submissions
    CF->>Astro: Form action
    Astro->>Strapi: POST /api/form-submissions
    Strapi->>Postgres: INSERT form data
    Postgres-->>Strapi: Confirmation
    Strapi->>Strapi: Lifecycle hook triggered
    Strapi->>Strapi: Send email via Resend
    Strapi->>Strapi: Post to CRM webhook
    Strapi-->>Astro: Success response
    Astro-->>Browser: Confirmation message
```

---

## 3. Data Flow Diagram — Read Paths

```mermaid
graph LR
    subgraph "Build-Time Data Flow"
        MD[Markdown Files<br/>454 files]
        CL[Astro Content Layer<br/>Zod Validation]
        BUILD[Astro Build<br/>SSG]
        STATIC[Static HTML/CSS/JS]

        MD --> CL --> BUILD --> STATIC
    end

    subgraph "Runtime API Data Flow"
        BROWSER[Browser]
        ISR[Astro ISR<br/>60s Revalidation]
        STRAPI[Strapi API]
        PG[(PostgreSQL)]

        BROWSER --> ISR --> STRAPI --> PG
    end

    subgraph "Search Data Flow"
        SB[SearchBar Island]
        MEILI[MeiliSearch]
        IDX[Strapi Lifecycle<br/>Auto-Index]

        SB --> MEILI
        IDX --> MEILI
    end
```

---

## 4. Data Flow Diagram — Write Paths

```mermaid
graph LR
    subgraph "Form Submission Flow"
        FORM[Contact Form]
        ACTION[Astro API Action]
        ZOD[Zod Validation]
        STRAPI[Strapi FormSubmission]
        HOOK[Lifecycle Hooks]
        RESEND[Resend Email]
        CRM[CRM Webhook]
        SLACK[Slack Alert]

        FORM --> ACTION --> ZOD --> STRAPI --> HOOK
        HOOK --> RESEND
        HOOK --> CRM
        HOOK --> SLACK
    end

    subgraph "CMS Publish Flow"
        ADMIN[CMS Admin]
        PUBLISH[Publish Action]
        MEILI_REINDEX[MeiliSearch Re-index]
        CACHE_PURGE[Cloudflare Cache Purge]
        AUDIT[Audit Log]

        ADMIN --> PUBLISH --> MEILI_REINDEX
        PUBLISH --> CACHE_PURGE
        PUBLISH --> AUDIT
    end
```

---

## 5. Deployment Topology Diagram

```mermaid
graph TB
    subgraph "Development Environment"
        DEV_GH[GitHub<br/>Feature Branches]
        DEV_CF[Cloudflare Pages<br/>Preview Deploys]
        DEV_HETZ[Coolify Dev<br/>Local Docker]
    end

    subgraph "Staging Environment"
        STAGE_GH[GitHub<br/>develop branch]
        STAGE_CF[Cloudflare Pages<br/>Staging Site]
        STAGE_HETZ[Hetzner Staging<br/>Coolify Staging]
    end

    subgraph "Production Environment"
        PROD_GH[GitHub<br/>main branch]
        PROD_CF[Cloudflare Pages<br/>Production]
        PROD_HETZ[Hetzner CX32/42<br/>Coolify Production]
    end

    DEV_GH -->|PR| STAGE_GH
    STAGE_GH -->|Merge| PROD_GH

    DEV_GH -->|Auto-deploy| DEV_CF
    STAGE_GH -->|Auto-deploy| STAGE_CF
    PROD_GH -->|Auto-deploy| PROD_CF

    DEV_HETZ -->|Manual sync| STAGE_HETZ
    STAGE_HETZ -->|Approved deploy| PROD_HETZ
```

---

## 6. Network Segmentation Diagram

```mermaid
graph TB
    subgraph "Public Network (Internet)"
        USERS[End Users]
        EXTERNAL[External Services<br/>Resend, Stripe, Sentry, GA4]
    end

    subgraph "Cloudflare Edge Network"
        CF_DNS[Cloudflare DNS]
        CF_CDN[Cloudflare CDN/WAF]
        CF_PAGES[Cloudflare Pages]
        CF_WORKERS[Cloudflare Workers<br/>ISR Cache Purge]
    end

    subgraph "Hetzner VPS (Private)"
        direction TB
        DOCKER[Docker Network<br/>172.18.0.0/16]

        subgraph "Application Tier"
            STRAPI[Strapi v5<br/>:1337]
            MEDUSA[Medusa.js P3<br/>:9000]
            CHATWOOT[Chatwoot P2<br/>:3000]
        end

        subgraph "Data Tier"
            POSTGRES[PostgreSQL<br/>:5432]
            MEILI[MeiliSearch<br/>:7700]
            REDIS[Redis P2<br/>:6379]
        end

        subgraph "Utility Tier"
            IMGPROXY[ImgProxy<br/>:8080]
            PLAUSIBLE[Plausible<br/>:8000]
        end
    end

    subgraph "Object Storage"
        B2[Backblaze B2<br/>S3 API]
    end

    USERS --> CF_DNS
    CF_DNS --> CF_CDN
    CF_CDN --> CF_PAGES
    CF_CDN --> CF_WORKERS
    CF_PAGES -->|API| STRAPI
    CF_CDN -->|Images| IMGPROXY

    STRAPI --> POSTGRES
    STRAPI --> MEILI
    STRAPI --> REDIS
    STRAPI --> B2

    IMGPROXY --> B2
    MEDUSA --> POSTGRES
    MEDUSA --> STRIPE

    STRAPI -->|Webhooks| EXTERNAL
```

---

## 7. Security Boundary Diagram

```mermaid
graph TB
    subgraph "Untrusted Zone"
        INTERNET[Internet]
        BOTS[Malicious Bots]
    end

    subgraph "Edge Security (Cloudflare)"
        DDOS[DDoS Protection]
        WAF[WAF / OWASP Rules]
        BOT[Bot Management]
        TLS[TLS 1.3 Termination]
    end

    subgraph "Application Security"
        AUTH[JWT Auth]
        RBAC[Role-Based Access]
        VALIDATE[Input Validation]
        RATE[Rate Limiting]
    end

    subgraph "Data Security"
        ENCRYPT[LUKS Encryption]
        BACKUP[Encrypted Backups]
        AUDIT[Audit Logging]
    end

    INTERNET --> TLS
    BOTS --> DDOS
    DDOS --> WAF --> BOT
    TLS --> AUTH --> RBAC
    RBAC --> VALIDATE --> RATE
    RATE --> ENCRYPT
    ENCRYPT --> BACKUP
    ENCRYPT --> AUDIT
```

---

## 8. Repository Topology

```mermaid
graph LR
    subgraph "GitHub Organization: twinmos-tech"
        REPO1[twinmos-website-frontend<br/>Astro 5 + React]
        REPO2[twinmos-website-backend<br/>Strapi v5 + Postgres]
        REPO3[twinmos-shared-types<br/>TypeScript P2]
    end

    subgraph "CI/CD (GitHub Actions)"
        CI1[Lint + Test + Build]
        CI2[Deploy to Cloudflare Pages]
        CI3[Deploy to Coolify/Hetzner]
    end

    REPO1 --> CI1 --> CI2
    REPO2 --> CI1 --> CI3
    REPO3 -.->|Optional| REPO1
    REPO3 -.->|Optional| REPO2
```

---

## 9. Service Dependency Map

```mermaid
graph TB
    subgraph "Core Services (P1)"
        A[Astro 5]
        S[Strapi v5]
        P[(PostgreSQL)]
        M[MeiliSearch]
        I[ImgProxy]
    end

    subgraph "Supporting Services (P1)"
        PL[Plausible]
        SE[Sentry]
        RE[Resend]
        T[Turnstile]
    end

    subgraph "Phase 2 Additions"
        R[(Redis)]
        C[Chatwoot]
        B[Better Auth]
    end

    subgraph "Phase 3 Additions"
        ME[Medusa.js]
        ST[Stripe]
        PO[PostHog]
    end

    A --> S
    A --> M
    S --> P
    S --> M
    S --> I
    S --> RE
    I --> B2[Backblaze B2]

    A -.-> PL
    A -.-> SE
    A -.-> T
    S -.-> SE

    S -.-> R
    C -.-> S
    B -.-> S

    ME -.-> S
    ME -.-> P
    ME -.-> ST
    A -.-> ME
```

---

## 10. Phase Evolution Diagram

```mermaid
gantt
    title TwinMOS Architecture Phase Evolution
    dateFormat YYYY-MM
    section Phase 1 (P1)
    Core Website           :2026-05, 5M
    English Only           :2026-05, 5M
    SSG + ISR              :2026-05, 5M
    Product Catalog        :2026-05, 5M
    section Phase 2 (P2)
    Arabic/Bengali/Hindi   :2026-10, 4M
    Partner Portal         :2026-10, 4M
    Live Chat              :2026-10, 4M
    Anti-Counterfeit       :2026-10, 4M
    section Phase 3 (P3)
    Russian/Chinese/French :2027-02, 6M
    E-Commerce             :2027-02, 6M
    Loyalty Program        :2027-05, 3M
```
