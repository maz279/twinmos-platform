# TwinMOS Corporate Website — Sequence Diagrams

**Document Reference:** TWN-SEQ-DIAGRAM-2026-001
**Document Version:** 1.0
**Status:** DRAFT
**Date:** 1 May 2026
**Synchronized With:** URD v3.0, LLD v1.0, Tech Stack v1.1

---

## Table of Contents

1. [User Browses Product Catalog (UC-1.1)](#1-user-browses-product-catalog-uc-11)
2. [Compatibility Finder Search (UC-2.1)](#2-compatibility-finder-search-uc-21)
3. [Form Submission (UC-4.1)](#3-form-submission-uc-41)
4. [CMS Content Publish to ISR Invalidate](#4-cms-content-publish-to-isr-invalidate)
5. [User Login (Partner Portal P2)](#5-user-login-partner-portal-p2)
6. [E-Commerce Checkout (P3)](#6-e-commerce-checkout-p3)
7. [Anti-Counterfeit Serial Check (P2)](#7-anti-counterfeit-serial-check-p2)
8. [Search Indexing Lifecycle](#8-search-indexing-lifecycle)
9. [RMA Workflow (P2)](#9-rma-workflow-p2)

---

## 1. User Browses Product Catalog (UC-1.1)

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant CF as Cloudflare Edge
    participant Astro as Astro 5 (Pages)
    participant Strapi as Strapi v5 API
    participant Meili as MeiliSearch
    participant PG as PostgreSQL

    User->>Browser: Navigate to /products
    Browser->>CF: GET /products (HTTPS)
    
    alt Cache HIT
        CF-->>Browser: Cached HTML
    else Cache MISS
        CF->>Astro: Forward request
        Astro->>Strapi: GET /api/categories
        Strapi->>PG: SELECT categories
        PG-->>Strapi: Category list
        Strapi-->>Astro: JSON response
        
        Astro->>Strapi: GET /api/products?populate=*
        Strapi->>PG: SELECT products with relations
        PG-->>Strapi: Product list
        Strapi-->>Astro: JSON response
        
        Astro->>Astro: Render HTML with data
        Astro-->>CF: Static HTML
        CF-->>Browser: HTML + Cache headers
    end
    
    Browser->>Browser: Hydrate ProductFilter island
    
    User->>Browser: Apply filter (DDR5, 32GB)
    Browser->>Meili: Search query with filters
    Meili-->>Browser: Filtered results
    Browser->>Browser: Update product grid
    
    User->>Browser: Click product
    Browser->>CF: GET /products/voltx-ddr5-32gb
    
    alt Cache HIT
        CF-->>Browser: Cached HTML
    else Cache MISS
        CF->>Astro: Forward request
        Astro->>Strapi: GET /api/products/voltx-ddr5-32gb
        Strapi->>PG: SELECT product + relations
        PG-->>Strapi: Product detail
        Strapi-->>Astro: JSON response
        Astro->>Astro: Render product page
        Astro-->>CF: HTML
        CF-->>Browser: HTML
    end
```

---

## 2. Compatibility Finder Search (UC-2.1)

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant Island as CompatibilityFinder Island
    participant Strapi as Strapi v5
    participant Meili as MeiliSearch
    participant PG as PostgreSQL

    User->>Browser: Navigate to /support/compatibility
    Browser->>Browser: Load CompatibilityFinder island
    
    User->>Island: Type "ASUS ROG Strix"
    Island->>Meili: Search motherboards (typeahead)
    Meili-->>Island: Matching motherboards
    Island->>Browser: Display suggestions
    
    User->>Island: Select "ASUS ROG Strix Z790-E"
    Island->>Strapi: GET /api/compatibility?motherboard=asus-rog-strix-z790-e
    Strapi->>PG: SELECT compatibility entries
    PG-->>Strapi: Compatible products + QVL data
    Strapi-->>Island: Compatibility results
    
    Island->>Browser: Display compatible RAM/SSD
    Note over Island,Browser: Shows: Product name, SKU, Speed, Capacity, QVL Status
    
    User->>Island: Filter by DDR5 + 32GB
    Island->>Island: Client-side filter results
    Island->>Browser: Update display
    
    User->>Island: Click "View Product"
    Island->>Browser: Navigate to product page
```

---

## 3. Form Submission (UC-4.1)

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant Island as ContactForm Island
    participant Turnstile as Cloudflare Turnstile
    participant Astro as Astro API Route
    participant Strapi as Strapi v5
    participant PG as PostgreSQL
    participant Resend as Resend API
    participant CRM as HubSpot CRM
    participant Slack as Slack Webhook

    User->>Browser: Navigate to /contact
    Browser->>Browser: Load ContactForm island
    
    User->>Island: Fill form (name, email, subject, message)
    Island->>Island: Client validation (Zod)
    
    User->>Island: Submit form
    Island->>Turnstile: Request token
    Turnstile-->>Island: Turnstile token
    
    Island->>Astro: POST /api/form-submissions
    Astro->>Astro: Server validation (Zod)
    Astro->>Turnstile: Verify token
    Turnstile-->>Astro: Token valid
    
    Astro->>Strapi: POST /api/form-submissions
    Strapi->>PG: INSERT form submission
    PG-->>Strapi: Confirmation (ID: 12345)
    
    Strapi->>Strapi: Trigger lifecycle hooks
    
    par Async Processing
        Strapi->>Resend: Send confirmation email
        Resend-->>Strapi: Email queued
        Resend->>User: Confirmation email
    and
        Strapi->>CRM: POST /crm/v1/leads
        CRM-->>Strapi: Lead created (ID: CRM-789)
    and
        Strapi->>Slack: POST #form-submissions
        Slack-->>Strapi: Message delivered
    end
    
    Strapi-->>Astro: Success response
    Astro-->>Island: 200 OK
    Island->>Browser: Show success message
    Browser-->>User: "Thank you! We will get back to you soon."
```

---

## 4. CMS Content Publish to ISR Invalidate

```mermaid
sequenceDiagram
    actor Editor
    participant Admin as Strapi Admin
    participant Strapi as Strapi v5
    participant PG as PostgreSQL
    participant Meili as MeiliSearch
    participant CF as Cloudflare API
    participant Astro as Astro Build
    participant Browser

    Editor->>Admin: Edit news article
    Admin->>Strapi: Save draft
    Strapi->>PG: UPDATE article (draft)
    PG-->>Strapi: Saved
    
    Editor->>Admin: Click "Publish"
    Admin->>Strapi: Publish article
    Strapi->>PG: UPDATE article (published)
    PG-->>Strapi: Published
    
    Strapi->>Strapi: Trigger afterUpdate lifecycle
    
    par Parallel Processing
        Strapi->>Meili: Re-index article
        Meili-->>Strapi: Index updated
    and
        Strapi->>CF: Purge cache tag "news:article-123"
        CF-->>Strapi: Cache purged
    and
        Strapi->>CF: Purge cache tag "news:list"
        CF-->>Strapi: Cache purged
    and
        Strapi->>PG: INSERT audit log entry
        PG-->>Strapi: Logged
    end
    
    Note over Browser: User visits /news/new-article
    Browser->>CF: GET /news/new-article
    CF->>CF: Cache MISS (purged)
    CF->>Astro: Forward request
    Astro->>Strapi: GET /api/news/new-article
    Strapi->>PG: SELECT article
    PG-->>Strapi: Article data
    Strapi-->>Astro: JSON response
    Astro->>Astro: Render page
    Astro-->>CF: Fresh HTML
    CF-->>Browser: HTML (cached for 60s)
```

---

## 5. User Login (Partner Portal P2)

```mermaid
sequenceDiagram
    actor Partner
    participant Browser
    participant Portal as Partner Portal (Astro SSR)
    participant BetterAuth as Better Auth
    participant Strapi as Strapi v5
    participant PG as PostgreSQL
    participant Redis as Redis Cache

    Partner->>Browser: Navigate to /partners/login
    Browser->>Portal: GET /partners/login
    Portal-->>Browser: Login page
    
    Partner->>Browser: Enter credentials
    Browser->>BetterAuth: POST /api/auth/sign-in
    BetterAuth->>PG: SELECT user + verify password
    PG-->>BetterAuth: User valid
    
    BetterAuth->>BetterAuth: Generate JWT (access + refresh)
    BetterAuth->>Redis: Store session
    Redis-->>BetterAuth: Session stored
    
    BetterAuth-->>Browser: JWT tokens (httpOnly cookies)
    Browser->>Portal: GET /partners/dashboard
    Portal->>BetterAuth: Validate JWT
    BetterAuth->>Redis: Check session
    Redis-->>BetterAuth: Session valid
    BetterAuth-->>Portal: User authenticated
    
    Portal->>Strapi: GET /api/partner-content (with JWT)
    Strapi->>Strapi: Verify JWT + check permissions
    Strapi->>PG: SELECT gated content
    PG-->>Strapi: Content data
    Strapi-->>Portal: JSON response
    
    Portal->>Portal: Render dashboard
    Portal-->>Browser: Partner dashboard
    Browser-->>Partner: Display partner content
    
    Note over Partner,Redis: Token Refresh (every 1 hour)
    Browser->>BetterAuth: POST /api/auth/refresh
    BetterAuth->>Redis: Validate refresh token
    Redis-->>BetterAuth: Valid
    BetterAuth->>BetterAuth: Generate new access token
    BetterAuth-->>Browser: New JWT
```

---

## 6. E-Commerce Checkout (P3)

```mermaid
sequenceDiagram
    actor Customer
    participant Browser
    participant Island as CheckoutFlow Island
    participant Medusa as Medusa.js API
    participant Stripe as Stripe API
    participant Strapi as Strapi v5
    participant PG as PostgreSQL

    Customer->>Browser: Add items to cart
    Browser->>Island: Update cart
    Island->>Medusa: POST /store/carts (create)
    Medusa->>PG: INSERT cart
    PG-->>Medusa: Cart created
    Medusa-->>Island: Cart ID + items
    Island->>Browser: Update cart UI
    
    Customer->>Browser: Proceed to checkout
    Browser->>Island: Initiate checkout
    Island->>Medusa: GET /store/carts/{id}
    Medusa->>PG: SELECT cart + items
    PG-->>Medusa: Cart data
    Medusa-->>Island: Cart details
    
    Customer->>Island: Enter shipping info
    Island->>Medusa: POST /store/carts/{id}/shipping-methods
    Medusa->>PG: UPDATE cart shipping
    PG-->>Medusa: Updated
    Medusa-->>Island: Shipping options
    
    Customer->>Island: Select payment method
    Island->>Stripe: POST /v1/checkout/sessions
    Stripe-->>Island: Checkout session URL
    
    Island->>Browser: Redirect to Stripe
    Browser->>Stripe: Complete payment
    Stripe->>Stripe: Process payment
    Stripe-->>Browser: Payment success
    Browser->>Island: Return to success page
    
    Stripe->>Medusa: Webhook: payment_intent.succeeded
    Medusa->>PG: UPDATE order status (paid)
    Medusa->>PG: INSERT order
    PG-->>Medusa: Order created
    
    Medusa->>Strapi: Webhook: order.created
    Strapi->>PG: INSERT order record
    Strapi->>Resend: Send order confirmation
    
    Island->>Browser: Display order confirmation
    Browser-->>Customer: "Order confirmed!"
```

---

## 7. Anti-Counterfeit Serial Check (P2)

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant Island as SerialNumberCheck Island
    participant Strapi as Strapi v5
    participant PG as PostgreSQL
    participant Manuf as Manufacturing System

    User->>Browser: Navigate to /support/verify
    Browser->>Browser: Load SerialNumberCheck island
    
    User->>Island: Enter serial number
    Island->>Island: Client validation (format check)
    
    User->>Island: Click "Verify"
    Island->>Strapi: POST /api/serial-check
    Strapi->>PG: SELECT serial_number WHERE serial = ?
    
    alt Serial Found
        PG-->>Strapi: Serial record
        Strapi-->>Island: { valid: true, product: "...", date: "..." }
        Island->>Browser: Display "Authentic Product"
        Browser-->>User: Green checkmark + product info
    else Serial Not Found
        PG-->>Strapi: No record
        Strapi-->>Island: { valid: false }
        Island->>Browser: Display "Potential Counterfeit"
        Browser-->>User: Red warning + contact support
    end
    
    Note over Manuf: Daily Batch Job
    Manuf->>Strapi: POST /api/serial-numbers/bulk
    Strapi->>PG: INSERT/UPDATE serial numbers
    PG-->>Strapi: Batch complete
```

---

## 8. Search Indexing Lifecycle

```mermaid
sequenceDiagram
    participant Editor
    participant Strapi as Strapi v5
    participant MeiliPlugin as strapi-plugin-meilisearch
    participant Meili as MeiliSearch
    participant Astro as Astro Frontend
    participant Browser

    Note over Editor,Browser: Content Creation Flow
    Editor->>Strapi: Create/Update content
    Strapi->>Strapi: afterCreate/afterUpdate lifecycle
    Strapi->>MeiliPlugin: Trigger index update
    MeiliPlugin->>Meili: POST /indexes/{name}/documents
    Meili->>Meili: Process + tokenize
    Meili-->>MeiliPlugin: Index updated
    
    Note over Editor,Browser: Search Query Flow
    Browser->>Astro: User types search query
    Astro->>Meili: GET /indexes/{name}/search?q=...
    Meili->>Meili: Search + rank + highlight
    Meili-->>Astro: Search results
    Astro-->>Browser: Display results
    
    Note over Editor,Browser: Content Deletion Flow
    Editor->>Strapi: Delete content
    Strapi->>Strapi: afterDelete lifecycle
    Strapi->>MeiliPlugin: Trigger index removal
    MeiliPlugin->>Meili: DELETE /indexes/{name}/documents/{id}
    Meili-->>MeiliPlugin: Document removed
```

---

## 9. RMA Workflow (P2)

```mermaid
sequenceDiagram
    actor Customer
    participant Browser
    participant Island as RMARequest Island
    participant Strapi as Strapi v5
    participant PG as PostgreSQL
    participant Resend as Resend API
    participant Agent as Support Agent

    Customer->>Browser: Navigate to /support/rma
    Browser->>Browser: Load RMARequest island
    
    Customer->>Island: Fill RMA form
    Note over Island: Product SKU, Serial, Issue Description, Contact Info
    Island->>Island: Client validation
    
    Customer->>Island: Submit RMA
    Island->>Strapi: POST /api/rma
    Strapi->>PG: INSERT RMA request (status: pending)
    PG-->>Strapi: RMA created (ID: RMA-2026-001)
    
    Strapi->>Resend: Send confirmation email
    Resend->>Customer: "RMA request received"
    
    Strapi->>Strapi: Trigger workflow
    Strapi-->>Island: Success response
    Island->>Browser: Show RMA number + status
    
    Note over Agent: Support Agent Review
    Agent->>Strapi: Review RMA in admin
    Strapi->>PG: SELECT RMA details
    PG-->>Strapi: RMA data
    
    Agent->>Strapi: Approve RMA
    Strapi->>PG: UPDATE status (approved)
    Strapi->>Resend: Send approval email
    Resend->>Customer: "RMA approved - shipping instructions"
    
    Customer->>Strapi: Update tracking (when shipped)
    Strapi->>PG: UPDATE tracking info
    
    Agent->>Strapi: Mark received
    Strapi->>PG: UPDATE status (received)
    
    Agent->>Strapi: Complete repair/replace
    Strapi->>PG: UPDATE status (resolved)
    Strapi->>Resend: Send completion email
    Resend->>Customer: "RMA resolved - return shipping"
    
    Customer->>Browser: Check RMA status
    Browser->>Island: Load status
    Island->>Strapi: GET /api/rma/RMA-2026-001
    Strapi->>PG: SELECT RMA
    PG-->>Strapi: Current status
    Strapi-->>Island: Status data
    Island->>Browser: Display status timeline
```
