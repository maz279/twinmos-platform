# TwinMOS Technologies — PostHog Configuration Guide

| Field | Value |
|---|---|
| Document Reference | TWN-P3-POSTHOG-2026-001 |
| Version | 1.0 |
| Phase | Phase 3 — Commerce and Advanced Features |
| Status | Draft for Review |
| Author | TwinMOS Web Development Team |
| Date | 2026-05-01 |
| Confidentiality | Internal — TwinMOS Technologies |

---

## Table of Contents

1. [Introduction and Rationale](#1-introduction-and-rationale)
2. [PostHog vs Alternatives Comparison](#2-posthog-vs-alternatives-comparison)
3. [System Architecture](#3-system-architecture)
4. [Infrastructure and Installation](#4-infrastructure-and-installation)
5. [Astro Frontend Integration](#5-astro-frontend-integration)
6. [Event Taxonomy](#6-event-taxonomy)
7. [Person Properties](#7-person-properties)
8. [Session Replay Configuration](#8-session-replay-configuration)
9. [Feature Flags Setup](#9-feature-flags-setup)
10. [Funnels Configuration](#10-funnels-configuration)
11. [Cohorts](#11-cohorts)
12. [Dashboard Setup](#12-dashboard-setup)
13. [Data Retention Policy](#13-data-retention-policy)
14. [Privacy and Regulatory Compliance](#14-privacy-and-regulatory-compliance)
15. [Cost Considerations](#15-cost-considerations)
16. [Monitoring and Health Checks](#16-monitoring-and-health-checks)
17. [Acceptance Criteria](#17-acceptance-criteria)

---

## 1. Introduction and Rationale

### 1.1 Purpose of This Document

This guide defines the complete PostHog analytics configuration for TwinMOS Technologies' corporate website Phase 3. It covers installation, frontend integration, event taxonomy, session replay, feature flags, A/B testing, funnels, cohort analysis, and regulatory compliance.

This document is the authoritative reference for the analytics engineering work in Phase 3. All developers, QA engineers, and marketing stakeholders should use this document to understand what is being tracked, why, and how.

### 1.2 Why PostHog?

TwinMOS Technologies evaluated five analytics platforms before selecting PostHog OSS (Open Source). The decision was driven by the following requirements:

**Privacy and Compliance First**

TwinMOS operates in 93+ countries, including the EU (GDPR), UAE (PDPL), India (DPDP Act), and Saudi Arabia (PDPL). Sending customer behavioral data to US-based SaaS analytics providers introduces significant cross-border data transfer risk. PostHog self-hosted keeps all data on Hetzner infrastructure in Germany (EU jurisdiction), eliminating this risk entirely.

**All Capabilities in One Platform**

Phase 3 requires:
- Product analytics (event tracking, funnels, retention)
- Session replay (visual debugging, UX research)
- Feature flags (controlled rollouts, A/B testing)
- A/B experiment analysis
- Cohort analysis
- Custom dashboards

PostHog provides all of these in a single deployment. Assembling equivalent functionality from separate vendors (e.g., Mixpanel + FullStory + LaunchDarkly + Optimizely) would cost USD 3,000–8,000/month and create fragmented data. PostHog self-hosted is free beyond infrastructure cost.

**Open Source**

The PostHog codebase is publicly auditable. There are no black-box data pipelines, no undisclosed data sharing, and no vendor lock-in. TwinMOS can fork, extend, or migrate at any time.

**Single Source of Behavioral Truth**

By routing all behavioral events through PostHog, the team has one place to query user behavior, one event taxonomy to maintain, and one tooling stack to learn.

---

## 2. PostHog vs Alternatives Comparison

| Criterion | PostHog OSS (Self-Hosted) | Mixpanel | Amplitude | Heap | FullStory |
|---|---|---|---|---|---|
| **Pricing model** | Free (infra cost only ~$35/mo) | $28/mo–$833/mo (event volume) | $49/mo–$995/mo (MTU-based) | $3,600+/yr (MTU-based) | $14,400+/yr |
| **Data residency** | Hetzner DE — fully controlled | US servers (EU add-on extra) | US servers (EU add-on extra) | US servers | US servers |
| **GDPR compliance** | Full (data never leaves EU infra) | SCCs required, DPA needed | SCCs required, DPA needed | SCCs required, DPA needed | SCCs required, DPA needed |
| **Session replay** | Yes (built-in) | No | No | Yes (auto-capture) | Yes (core product) |
| **Feature flags** | Yes (built-in) | No | No | No | No |
| **A/B testing** | Yes (built-in experiments) | No | Yes (paid tiers) | No | No |
| **Funnel analysis** | Yes | Yes | Yes | Yes | Yes |
| **Cohort analysis** | Yes | Yes | Yes | Yes | Limited |
| **Self-hosted option** | Yes (primary model) | No | No | No | No |
| **Open source** | Yes (MIT/EE hybrid) | No | No | No | No |
| **SQL access** | Yes (ClickHouse) | No | No | No | No |
| **Event autocapture** | Yes (opt-in) | No | Yes | Yes (default) | Yes |
| **Integration with Astro** | Official posthog-js SDK | posthog-js works | Amplitude SDK | Heap snippet | FullStory snippet |
| **Vendor lock-in risk** | Low (OSS, data owned) | High | High | High | High |
| **Phase 3 fit** | Excellent | Poor (no flags/replay) | Moderate (costly) | Moderate (no flags) | Poor (no flags/analytics) |

**Decision: PostHog OSS self-hosted on Hetzner via Coolify.**

---

## 3. System Architecture

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Cloudflare Pages                             │
│                    (TwinMOS Astro 5 Frontend)                       │
│                                                                     │
│  posthog-js SDK                                                     │
│  ├── Consent-gated initialization                                   │
│  ├── Event capture (custom + autocapture)                           │
│  ├── Session replay                                                 │
│  └── Feature flag evaluation                                        │
└─────────────────────┬───────────────────────────────────────────────┘
                      │  HTTPS  (api_host: analytics.twinmos.com)
                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   Hetzner CX52 (Coolify)                            │
│                   PostHog OSS Instance                              │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  PostHog     │  │  ClickHouse  │  │  Redis (session/cache)   │  │
│  │  Application │  │  (analytics  │  │                          │  │
│  │  (Django)    │  │   storage)   │  │                          │  │
│  └──────┬───────┘  └──────────────┘  └──────────────────────────┘  │
│         │                                                           │
│  ┌──────▼───────┐  ┌──────────────┐                                │
│  │  PostgreSQL  │  │  Kafka       │                                │
│  │  (PostHog    │  │  (event      │                                │
│  │   metadata)  │  │   pipeline)  │                                │
│  └──────────────┘  └──────────────┘                                │
└─────────────────────────────────────────────────────────────────────┘
                      │
                      │  Archive (monthly)
                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│              Backblaze B2 (Long-term Archive)                       │
│         Exported ClickHouse data (Parquet format)                  │
│                  Retention: 7 years                                 │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 Separation from Main Stack

PostHog runs on a **separate Hetzner server** (CX52) from the main TwinMOS stack (CX42). This separation is deliberate:

- PostHog's internal services (ClickHouse, Kafka, Redis, PostgreSQL) are resource-intensive; co-locating with Strapi + MeiliSearch + Medusa would cause resource contention.
- Security isolation: a compromise of the analytics instance cannot directly affect the e-commerce database.
- Independent scaling: PostHog can be scaled up without touching the main application server.

### 3.3 Network Topology

| Service | Server | Internal Address | Public Endpoint |
|---|---|---|---|
| PostHog application | Hetzner CX52 | 10.0.1.20 | analytics.twinmos.com |
| ClickHouse | Hetzner CX52 (same) | 10.0.1.20:9000 | Not exposed publicly |
| Kafka | Hetzner CX52 (same) | 10.0.1.20:9092 | Not exposed publicly |
| Redis (PostHog) | Hetzner CX52 (same) | 10.0.1.20:6379 | Not exposed publicly |
| PostgreSQL (PostHog) | Hetzner CX52 (same) | 10.0.1.20:5432 | Not exposed publicly |
| Main app (Strapi/Medusa) | Hetzner CX42 | 10.0.1.10 | api.twinmos.com |

All internal communication stays within Hetzner's private network. PostHog is only publicly accessible via `analytics.twinmos.com` (Cloudflare proxied).

---

## 4. Infrastructure and Installation

### 4.1 Server Specifications

**PostHog Dedicated Server: Hetzner CX52**

| Resource | Specification |
|---|---|
| CPU | 8 vCPU (AMD EPYC) |
| RAM | 16 GB |
| Storage | 240 GB NVMe SSD |
| Location | Nuremberg, Germany (EU) |
| OS | Ubuntu 22.04 LTS |
| Monthly cost | ~EUR 35/month |
| Managed via | Coolify |

> **Note:** The Hetzner CX42 (8 vCPU, 16 GB RAM) that hosts the main TwinMOS stack (Strapi, MeiliSearch, Medusa, PostgreSQL) is **not** used for PostHog. PostHog requires its own server due to its internal service stack (ClickHouse is particularly memory-intensive). The CX52 specification meets PostHog's minimum recommended production requirements.

### 4.2 PostHog Internal Stack Components

PostHog OSS requires the following internal services, all managed via Docker Compose through Coolify:

| Component | Purpose | Minimum RAM |
|---|---|---|
| PostHog App (Django) | Web application, API, feature flags | 512 MB |
| ClickHouse | Analytics data warehouse (events storage) | 4 GB |
| Kafka | Asynchronous event ingestion pipeline | 512 MB |
| Zookeeper | Kafka coordination (bundled with Kafka) | 256 MB |
| Redis | Session caching, celery task queue | 256 MB |
| PostgreSQL | PostHog metadata, feature flags, config | 512 MB |
| Caddy / Nginx | Reverse proxy within Coolify | 64 MB |
| **Total** | | **~6 GB working set** |

This is why 16 GB RAM (CX52) is recommended — ClickHouse alone will consume 4–8 GB under moderate load.

### 4.3 Coolify Deployment Configuration

PostHog is deployed via Coolify using the official PostHog Docker Compose configuration.

**Step 1: Prepare the server**

```bash
# On Hetzner CX52, via Coolify SSH
# Coolify installs Docker and Docker Compose automatically

# Confirm Docker version
docker --version   # Should be 24.x or later
docker compose version  # Should be 2.x
```

**Step 2: Clone PostHog Docker deploy repository**

```bash
git clone https://github.com/PostHog/posthog.git /opt/posthog
cd /opt/posthog
```

**Step 3: Configure environment variables**

Create `/opt/posthog/.env` with the following content (adjust values as appropriate):

```env
# PostHog Core
POSTHOG_SECRET=<generated_secret_min_32_chars>
ENCRYPTION_SALT_KEYS=<generated_salt_key>

# Database
DATABASE_URL=postgres://posthog:posthog_password@postgres:5432/posthog

# Redis
REDIS_URL=redis://redis:6379/

# ClickHouse
CLICKHOUSE_HOST=clickhouse
CLICKHOUSE_DATABASE=posthog
CLICKHOUSE_CLUSTER=posthog
CLICKHOUSE_USER=default
CLICKHOUSE_PASSWORD=<clickhouse_password>
CLICKHOUSE_SECURE=false
CLICKHOUSE_VERIFY=false
CLICKHOUSE_CA=

# Kafka
KAFKA_HOSTS=kafka:9092

# Application
SITE_URL=https://analytics.twinmos.com
JS_URL=https://analytics.twinmos.com
CORS_TRUSTED_ORIGINS=https://www.twinmos.com,https://twinmos.com

# Email (via Resend SMTP)
EMAIL_HOST=smtp.resend.com
EMAIL_PORT=587
EMAIL_HOST_USER=resend
EMAIL_HOST_PASSWORD=<resend_api_key>
EMAIL_USE_TLS=true
DEFAULT_FROM_EMAIL=analytics-noreply@twinmos.com

# Features
DISABLE_PAID_FEATURES=false
MULTI_TENANCY=false

# Storage (optional — for exports to S3-compatible)
OBJECT_STORAGE_ENABLED=true
OBJECT_STORAGE_ENDPOINT=https://s3.us-west-002.backblazeb2.com
OBJECT_STORAGE_REGION=us-west-002
OBJECT_STORAGE_ACCESS_KEY_ID=<backblaze_key_id>
OBJECT_STORAGE_SECRET_ACCESS_KEY=<backblaze_app_key>
OBJECT_STORAGE_BUCKET=twinmos-posthog-exports
```

> **Security note:** Never commit this `.env` file to version control. Store secrets in Coolify's environment variable management UI (encrypted at rest).

**Step 4: Deploy via Coolify**

In Coolify UI:
1. Add new service → Docker Compose
2. Point to `/opt/posthog/docker-compose.yml`
3. Set environment variables from the `.env` above in Coolify's secret manager
4. Set domain: `analytics.twinmos.com`
5. Enable SSL (Let's Encrypt via Coolify)
6. Deploy

**Step 5: Create initial superuser**

```bash
docker compose exec posthog python manage.py createsuperuser
```

**Step 6: Verify deployment**

```bash
# Health check
curl https://analytics.twinmos.com/_health

# Expected response
{"status": "ok"}
```

### 4.4 Cloudflare DNS Configuration

| Record type | Name | Target | Proxy | TTL |
|---|---|---|---|---|
| CNAME | analytics | hetzner-cx52-ip.hetzner.com | Proxied (orange cloud) | Auto |

> **Important:** Cloudflare proxying analytics.twinmos.com means Cloudflare is in the path of PostHog's ingestion endpoint. Ensure Cloudflare Page Rules do not cache POST requests to `/e/`, `/decide/`, `/engage/`, or `/batch/`. Add a Cache Rule: `analytics.twinmos.com/e/*` → Cache Level: Bypass.

---

## 5. Astro Frontend Integration

### 5.1 Installation

```bash
npm install posthog-js
```

PostHog version pinning: use the version available at Phase 3 launch. Lock in `package-lock.json`. Do not use `"posthog-js": "latest"` in production.

### 5.2 Consent-Gated Initialization

TwinMOS uses a cookie consent banner (Phase 2 implementation). PostHog must not initialize until the user grants analytics consent. This is both a GDPR requirement and a PostHog best practice.

The consent state is stored in a cookie named `twinmos_consent` with value `{"analytics": true|false, "marketing": true|false}`.

### 5.3 PostHog Analytics Module

Create the file `src/lib/analytics/posthog.ts`:

```typescript
// src/lib/analytics/posthog.ts
// PostHog analytics wrapper for TwinMOS website
// GDPR-compliant: does not initialize until analytics consent is granted

import posthog from 'posthog-js';

const POSTHOG_KEY = import.meta.env.PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.PUBLIC_POSTHOG_HOST || 'https://analytics.twinmos.com';

let initialized = false;
let consentGranted = false;

/**
 * Parse the TwinMOS consent cookie.
 * Returns analytics consent boolean.
 */
function getAnalyticsConsent(): boolean {
  if (typeof document === 'undefined') return false;
  const cookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith('twinmos_consent='));
  if (!cookie) return false;
  try {
    const value = JSON.parse(decodeURIComponent(cookie.split('=')[1]));
    return value?.analytics === true;
  } catch {
    return false;
  }
}

/**
 * Initialize PostHog with GDPR-compliant settings.
 * Call this only after analytics consent is confirmed.
 */
export function initPostHog(): void {
  if (initialized) return;
  if (!POSTHOG_KEY) {
    console.warn('[PostHog] PUBLIC_POSTHOG_KEY not set — analytics disabled');
    return;
  }

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,

    // Persistence: use localStorage only after consent; memory before consent
    persistence: consentGranted ? 'localStorage+cookie' : 'memory',

    // Autocapture: capture clicks, form submissions, page views automatically
    autocapture: true,

    // Session recording: enabled for sampled sessions (see Section 8)
    session_recording: {
      maskAllInputs: true,          // Mask all input fields by default
      maskInputOptions: {
        password: true,
        creditCard: true,
        color: false,
        date: false,
        email: true,                // Mask email addresses
        number: false,
        range: false,
        search: false,
        tel: true,                  // Mask phone numbers
        text: false,                // Unmask general text (name fields, etc. are masked by data attribute)
        time: false,
        url: false,
      },
    },

    // Disable capturing for elements with data-ph-no-capture attribute
    respect_dnt: false,             // Handled via our own consent mechanism

    // Feature flags: evaluate on initialization
    bootstrap: {},

    // IP anonymization: strip last octet of IP address server-side (PostHog config)
    ip: false,                      // Do not send IP; PostHog OSS config also strips it

    // Cross-domain linking: disabled (single domain)
    cross_subdomain_cookie: false,

    // Loaded callback
    loaded: (ph) => {
      // Opt out by default; opt in happens after consent confirmation
      if (!consentGranted) {
        ph.opt_out_capturing();
      }
      console.debug('[PostHog] Initialized');
    },
  });

  initialized = true;
}

/**
 * Call when the user grants analytics consent (from cookie banner).
 * Upgrades persistence from memory to localStorage.
 */
export function grantAnalyticsConsent(): void {
  consentGranted = true;
  if (!initialized) {
    initPostHog();
  } else {
    posthog.opt_in_capturing();
    // Upgrade persistence
    posthog.set_config({ persistence: 'localStorage+cookie' });
  }
}

/**
 * Call when the user revokes analytics consent.
 */
export function revokeAnalyticsConsent(): void {
  consentGranted = false;
  if (initialized) {
    posthog.opt_out_capturing();
    posthog.clear_opt_in_out_capturing();
  }
}

/**
 * Capture a custom event with properties.
 * Silently no-ops if PostHog is not initialized or consent not granted.
 */
export function capture(event: string, properties?: Record<string, unknown>): void {
  if (!initialized || !consentGranted) return;
  posthog.capture(event, properties);
}

/**
 * Identify an authenticated user.
 * Call after login/registration.
 */
export function identify(
  userId: string,
  properties?: Record<string, unknown>
): void {
  if (!initialized || !consentGranted) return;
  posthog.identify(userId, properties);
}

/**
 * Reset the PostHog identity (call on logout).
 */
export function reset(): void {
  if (!initialized) return;
  posthog.reset();
}

/**
 * Get a feature flag value.
 * Returns undefined if PostHog is not initialized.
 */
export function getFeatureFlag(flag: string): string | boolean | undefined {
  if (!initialized) return undefined;
  return posthog.getFeatureFlag(flag);
}

/**
 * Check if PostHog is ready (initialized and consent granted).
 */
export function isReady(): boolean {
  return initialized && consentGranted;
}

// Auto-initialize if consent was previously granted (returning user)
if (typeof window !== 'undefined') {
  if (getAnalyticsConsent()) {
    consentGranted = true;
    initPostHog();
  }

  // Listen for consent changes dispatched from the cookie banner component
  window.addEventListener('twinmos:consent:granted', () => grantAnalyticsConsent());
  window.addEventListener('twinmos:consent:revoked', () => revokeAnalyticsConsent());
}

export default posthog;
```

### 5.4 Astro Layout Integration

In `src/layouts/BaseLayout.astro`, add the PostHog initialization script:

```astro
---
// src/layouts/BaseLayout.astro
// ... existing imports ...
---

<html lang={locale}>
  <head>
    <!-- ... existing head content ... -->

    <!-- PostHog: loaded async, does not block page render -->
    <!-- Actual initialization is consent-gated in posthog.ts -->
  </head>
  <body>
    <!-- ... existing body content ... -->

    <!-- PostHog initialization: deferred, consent-gated -->
    <script>
      // Dynamic import to avoid blocking page load
      import('/src/lib/analytics/posthog.ts').then((module) => {
        // Module self-initializes if consent cookie is present
        // Otherwise waits for twinmos:consent:granted event
      });
    </script>
  </body>
</html>
```

### 5.5 Environment Variables

Add to `.env.production`:

```env
PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PUBLIC_POSTHOG_HOST=https://analytics.twinmos.com
```

Add to `.env.development`:

```env
PUBLIC_POSTHOG_KEY=phc_dev_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PUBLIC_POSTHOG_HOST=http://localhost:8000
```

> The `PUBLIC_` prefix is required by Astro to expose environment variables to client-side code. Never use a `SECRET_` or unprefixed variable for PostHog key as it will not be available in the browser bundle.

### 5.6 Verifying Integration

After deployment, open PostHog dashboard → Live Events. Browse the TwinMOS website (after granting consent). Events should appear within 5 seconds. If no events appear after 30 seconds, check:

1. Browser console for PostHog initialization errors
2. Network tab for requests to `analytics.twinmos.com`
3. That cookie banner consent was granted

---

## 6. Event Taxonomy

### 6.1 Naming Convention

All custom events follow snake_case naming. Events are grouped by domain prefix. All events include standard properties automatically injected by PostHog (`$current_url`, `$host`, `$pathname`, `$referrer`, `$device_type`, `$browser`, `$os`).

### 6.2 Complete Event Table

#### 6.2.1 Page Events (Auto-Captured by PostHog)

| Event name | Trigger | Key properties |
|---|---|---|
| `$pageview` | Every page navigation | `$current_url`, `$pathname`, locale |
| `$pageleave` | Page exit | `$current_url`, time_on_page |
| `$autocapture` | Clicks on tagged elements | `$el_text`, `$el_attr__data-ph-event` |

#### 6.2.2 Product Events

| Event name | Trigger | Key custom properties |
|---|---|---|
| `product_viewed` | Product detail page loaded | `product_id`, `product_name`, `product_category`, `product_sku`, `price`, `currency`, `locale` |
| `product_added_to_cart` | "Add to Cart" clicked | `product_id`, `product_name`, `product_sku`, `quantity`, `price`, `currency`, `cart_total_items` |
| `product_removed_from_cart` | Item removed from cart | `product_id`, `product_name`, `product_sku`, `quantity`, `removal_method` (x button / qty to 0) |
| `product_compared` | Product added to comparison | `product_ids` (array), `comparison_count` |
| `product_wishlisted` | Product saved to wishlist | `product_id`, `product_name`, `product_sku` |

#### 6.2.3 Search Events

| Event name | Trigger | Key custom properties |
|---|---|---|
| `search_performed` | User submits search query | `query`, `result_count`, `search_type` (site / product / kb) |
| `search_result_clicked` | User clicks a search result | `query`, `result_position`, `result_type`, `result_id` |
| `compatibility_finder_used` | Compatibility finder form submitted | `component_type` (RAM/SSD), `system_brand`, `system_model`, `result_count` |

#### 6.2.4 Checkout Events

| Event name | Trigger | Key custom properties |
|---|---|---|
| `checkout_started` | User enters checkout flow | `cart_value`, `currency`, `item_count`, `coupon_applied` |
| `checkout_step_completed` | User completes a checkout step | `step` (1/2/3/4), `step_name` (contact/shipping/payment/review), `time_on_step_seconds` |
| `checkout_completed` | Order confirmed | `order_id`, `order_value`, `currency`, `item_count`, `payment_method`, `coupon_applied`, `loyalty_points_used` |
| `checkout_abandoned` | User leaves checkout with items | `cart_value`, `currency`, `item_count`, `last_completed_step`, `minutes_since_start` |

#### 6.2.5 Payment Events

| Event name | Trigger | Key custom properties |
|---|---|---|
| `payment_initiated` | User redirected to Stripe Checkout | `order_id`, `amount`, `currency`, `payment_method` |
| `payment_succeeded` | Stripe webhook received (order confirmed) | `order_id`, `amount`, `currency`, `payment_method` |
| `payment_failed` | Stripe payment failure | `order_id`, `amount`, `currency`, `failure_code`, `failure_message` |

> Note: `payment_succeeded` is captured server-side from the Medusa webhook handler to ensure accuracy regardless of browser closure.

#### 6.2.6 Account Events

| Event name | Trigger | Key custom properties |
|---|---|---|
| `account_registered` | User completes registration | `registration_method` (email/google/github), `locale`, `country` |
| `account_logged_in` | User logs in successfully | `login_method`, `session_count` |
| `account_updated` | User saves profile changes | `fields_changed` (array) |

#### 6.2.7 Loyalty Program Events

| Event name | Trigger | Key custom properties |
|---|---|---|
| `loyalty_points_earned` | Points credited to account | `points_earned`, `points_balance`, `trigger` (purchase/referral/bonus), `order_id` |
| `loyalty_points_redeemed` | Points used in checkout | `points_redeemed`, `points_value_aed`, `points_balance_after`, `order_id` |
| `loyalty_tier_upgraded` | Account tier changes | `previous_tier`, `new_tier`, `points_balance` |

#### 6.2.8 Referral Events

| Event name | Trigger | Key custom properties |
|---|---|---|
| `referral_link_copied` | User copies referral link | `referral_code`, `copy_method` (button/manual) |
| `referral_link_shared` | User uses share button | `referral_code`, `share_channel` (whatsapp/email/twitter) |
| `referral_converted` | Referred user completes first order | `referral_code`, `referee_order_id`, `referee_order_value` |

#### 6.2.9 Support Events

| Event name | Trigger | Key custom properties |
|---|---|---|
| `warranty_registered` | Warranty registration form submitted | `product_id`, `product_sku`, `purchase_date`, `registration_country` |
| `rma_submitted` | RMA request form submitted | `order_id`, `product_sku`, `rma_reason`, `country` |
| `kb_article_viewed` | Knowledge base article page loaded | `article_id`, `article_title`, `article_category`, `time_on_page` |
| `chat_initiated` | Live chat widget opened | `page_url`, `trigger` (button/proactive) |

#### 6.2.10 Engagement Events

| Event name | Trigger | Key custom properties |
|---|---|---|
| `newsletter_subscribed` | Newsletter sign-up form submitted | `source_page`, `locale`, `country` |
| `contact_form_submitted` | Contact form sent | `form_type` (general/sales/support/distributors), `country` |
| `distributor_application_started` | Distributor application form opened | `country`, `company_type` |

### 6.3 Event Implementation Pattern

All custom events should be captured using the wrapper function from `posthog.ts`:

```typescript
// Example: product_added_to_cart
import { capture } from '@/lib/analytics/posthog';

function handleAddToCart(product: Product, quantity: number) {
  // ... cart logic ...

  capture('product_added_to_cart', {
    product_id: product.id,
    product_name: product.name,
    product_sku: product.sku,
    product_category: product.category,
    quantity,
    price: product.price,
    currency: activeCurrency,
    cart_total_items: cartStore.getState().totalItems,
  });
}
```

---

## 7. Person Properties

Person properties are set via `posthog.identify()` and `posthog.setPersonProperties()`. They persist on the person profile and can be used for cohort definitions and targeting.

### 7.1 Standard Person Properties

| Property name | Type | Source | Description |
|---|---|---|---|
| `locale` | string | Astro i18n | User's current locale (en, ar, ru, zh-CN, fr, etc.) |
| `country` | string | Cloudflare `CF-IPCountry` header | User's country (ISO 3166-1 alpha-2) |
| `device_type` | string | posthog-js auto | `desktop`, `mobile`, `tablet` |
| `customer_tier` | string | LoyaltyAccount.tier | `bronze`, `silver`, `gold`, or `null` if not in loyalty program |
| `is_authenticated` | boolean | Session state | Whether user is logged in |
| `lifetime_value_aed` | number | Medusa order history | Total order value in AED across all orders |
| `total_orders` | number | Medusa order history | Total number of completed orders |
| `last_order_date` | ISO date string | Medusa order history | Date of most recent order |
| `preferred_currency` | string | User preference | User's selected currency (AED/INR/BDT/SAR/USD) |
| `registration_date` | ISO date string | Better Auth | Account creation date |

### 7.2 Setting Person Properties

```typescript
// On login (src/lib/analytics/auth-events.ts)
import { identify } from '@/lib/analytics/posthog';

async function onUserLogin(user: AuthUser, loyaltyAccount: LoyaltyAccount | null) {
  identify(user.id, {
    email: user.email,  // PostHog stores this but it is masked in session replays
    locale: getCurrentLocale(),
    country: user.country || getCountryFromCloudflare(),
    is_authenticated: true,
    customer_tier: loyaltyAccount?.tier ?? null,
    lifetime_value_aed: user.lifetimeValueAed,
    total_orders: user.totalOrders,
    last_order_date: user.lastOrderDate,
    preferred_currency: user.preferredCurrency,
    registration_date: user.createdAt,
  });
}
```

---

## 8. Session Replay Configuration

### 8.1 Policy

Session replay is a powerful UX research and debugging tool. TwinMOS's session replay policy balances utility against user privacy:

- **Enabled for:** Authenticated users only (consent already granted at registration)
- **Disabled for:** Guest users who have not explicitly opted into session replay
- **Sampling rate:** 20% of eligible sessions (reduces storage and processing costs)
- **Retention:** 30 days in PostHog (then deleted)

### 8.2 Privacy Controls

All input fields are masked by default using PostHog's `maskAllInputs: true` configuration (set in Section 5.3). Additional privacy controls:

**CSS class masking:** Any element with class `ph-no-capture` is excluded from recording.

**Data attribute masking:** Any element with `data-ph-no-capture` attribute is excluded.

**Automatically masked:**
- `<input type="password">`
- `<input type="email">` (configured in maskInputOptions)
- `<input type="tel">` (phone numbers)
- Elements with class `ph-no-capture` or `data-ph-no-capture`

**Applied to checkout:** All checkout form fields (card name, billing address, phone number) must have `data-ph-no-capture` attribute in addition to the global masking.

```html
<!-- Checkout form: billing address example -->
<input
  type="text"
  name="billing_name"
  placeholder="Full name on card"
  data-ph-no-capture
  class="form-input"
/>
```

### 8.3 Sampling Implementation

```typescript
// src/lib/analytics/posthog.ts — session recording configuration

// Only enable session recording for authenticated users at 20% sampling
function shouldRecordSession(isAuthenticated: boolean): boolean {
  if (!isAuthenticated) return false;
  return Math.random() < 0.20;  // 20% sampling
}

// In initPostHog(), after identifying the user:
if (shouldRecordSession(isAuthenticated)) {
  posthog.startSessionRecording();
}
```

### 8.4 Retention

Configure in PostHog Admin → Project Settings → Session Recording:
- Retention period: **30 days**
- After 30 days: recordings are automatically deleted by PostHog

---

## 9. Feature Flags Setup

### 9.1 Naming Convention

All feature flags follow the pattern: `{feature}-{variant-description}-{phase}`

Examples:
- `checkout-one-page-p3` — boolean flag controlling one-page checkout (Phase 3)
- `loyalty-program-visibility-p3` — boolean flag controlling loyalty program UI visibility
- `referral-banner-position-p3` — multi-variant flag: `header` | `sidebar` | `footer`

### 9.2 Flag Types

| Type | Use case | Example |
|---|---|---|
| Boolean | Feature on/off, gradual rollout | `ecommerce-checkout-flow-p3` |
| Multi-variant (string) | A/B/C testing | `referral-banner-position-p3` |

### 9.3 Phase 3 Feature Flags

| Flag key | Type | Variants | Purpose | Default |
|---|---|---|---|---|
| `ecommerce-checkout-flow-p3` | Multi-variant | `one-page`, `multi-step` | A/B test checkout flow | `multi-step` |
| `loyalty-program-visibility-p3` | Boolean | on/off | Show/hide loyalty program UI | `true` |
| `referral-banner-position-p3` | Multi-variant | `header`, `sidebar`, `dismissible-popup` | A/B test referral banner position | `sidebar` |
| `mdf-portal-enabled-p3` | Boolean | on/off | MDF partner portal visibility | `false` (partners only) |
| `exit-intent-popup-p3` | Boolean | on/off | Exit intent popup feature | `true` |
| `compatibility-finder-v2-p3` | Boolean | on/off | New compatibility finder UI | `false` (staged rollout) |

### 9.4 Rollout Strategy

**Percentage-based rollout pattern (for high-risk features):**

| Rollout phase | % of users | Duration | Success criteria before next phase |
|---|---|---|---|
| Internal | 5% | 2 days | No errors, core metrics stable |
| Alpha | 20% | 3 days | Conversion rate not degraded |
| Beta | 50% | 5 days | Conversion rate ≥ control |
| Full | 100% | — | Ship or iterate |

**Override for specific users:** PostHog allows flagging specific distinct IDs (user IDs) to always receive a flag variant. Use this for QA team members to test new features in production.

### 9.5 Evaluating Feature Flags in Astro

```typescript
// In an Astro React island component (client:load)
import { getFeatureFlag } from '@/lib/analytics/posthog';
import { useEffect, useState } from 'react';
import posthog from 'posthog-js';

function CheckoutFlow() {
  const [checkoutVariant, setCheckoutVariant] = useState<string>('multi-step');

  useEffect(() => {
    // Use PostHog's onFeatureFlags callback to ensure flags are loaded
    posthog.onFeatureFlags(() => {
      const variant = posthog.getFeatureFlag('ecommerce-checkout-flow-p3');
      if (variant === 'one-page' || variant === 'multi-step') {
        setCheckoutVariant(variant);
      }
    });
  }, []);

  return checkoutVariant === 'one-page'
    ? <OnePageCheckout />
    : <MultiStepCheckout />;
}
```

### 9.6 Server-Side Flag Evaluation (Astro SSR)

For server-rendered pages, use the PostHog Node.js SDK:

```typescript
// src/pages/checkout/index.astro (SSR)
---
import { PostHog } from 'posthog-node';

const client = new PostHog(import.meta.env.POSTHOG_KEY, {
  host: import.meta.env.POSTHOG_HOST,
});

const userId = Astro.locals.user?.id ?? 'anonymous';
const checkoutVariant = await client.getFeatureFlag(
  'ecommerce-checkout-flow-p3',
  userId
);
await client.shutdownAsync();
---

{checkoutVariant === 'one-page'
  ? <OnePageCheckout />
  : <MultiStepCheckout />
}
```

---

## 10. Funnels Configuration

### 10.1 E-Commerce Conversion Funnel

| Step | Event | Description |
|---|---|---|
| 1 | `product_viewed` | User views any product page |
| 2 | `product_added_to_cart` | User adds product to cart |
| 3 | `checkout_started` | User enters checkout |
| 4 | `checkout_step_completed` (step=3) | User reaches payment step |
| 5 | `checkout_completed` | Order confirmed |

**Conversion rate targets:**
- Step 1 → 2: ≥ 8% (product view to add-to-cart)
- Step 2 → 3: ≥ 40% (add-to-cart to checkout start)
- Step 3 → 5: ≥ 60% (checkout start to completion)
- Overall: ≥ 2% (product view to purchase)

**Funnel window:** 7 days (user can take up to 7 days from product view to purchase and still be counted in the funnel).

### 10.2 Support Funnel (Self-Service to Registration)

| Step | Event | Description |
|---|---|---|
| 1 | `kb_article_viewed` | User reads knowledge base article |
| 2 | `warranty_registered` | User registers product warranty |

**Target:** ≥ 15% of KB viewers proceed to warranty registration.

### 10.3 Lead Generation Funnel (B2B)

| Step | Event | Description |
|---|---|---|
| 1 | `product_viewed` | User views product (any) |
| 2 | `contact_form_submitted` | User submits contact/distributor enquiry |

**Target:** ≥ 1% of product viewers submit a contact form (B2B segment, tracked by country/company type).

### 10.4 Configuring Funnels in PostHog

1. PostHog Dashboard → Funnels → New Funnel
2. Add steps using the events listed above
3. Set funnel window (e.g., 7 days for e-commerce)
4. Apply filters (e.g., `is_authenticated = true` for loyalty-specific funnels)
5. Save to the appropriate dashboard

---

## 11. Cohorts

### 11.1 Defined Cohorts

| Cohort name | Definition | Use case |
|---|---|---|
| **High-Value Buyers** | `total_orders >= 3` AND `lifetime_value_aed >= 1000` | Personalized campaigns, loyalty Gold targeting |
| **First-Time Visitors** | Person property: no previous `$pageview` before today | Acquisition funnel, welcome offer targeting |
| **Loyalty Gold Tier** | `customer_tier = gold` | Exclusive promotions, early access A/B tests |
| **Abandoned Cart Users** | `checkout_started` in last 7 days AND no `checkout_completed` | Cart recovery campaigns |
| **Dormant Customers** | `last_order_date` more than 180 days ago | Re-engagement campaigns |
| **B2B / Distributor Leads** | `contact_form_submitted` with `form_type = distributors` | HubSpot B2B workflow trigger |
| **Mobile Shoppers** | `device_type = mobile` AND `checkout_started` | Mobile checkout UX optimization |

### 11.2 Cohort Implementation in PostHog

Cohorts are defined in PostHog UI → People → Cohorts → New Cohort. They update dynamically as new events arrive.

Cohorts can be used:
- As targeting criteria for feature flags (e.g., show experimental feature only to Loyalty Gold tier)
- As filters in funnels (e.g., compare conversion rates between cohorts)
- As segments for A/B tests (e.g., experiment only on mobile shoppers)

---

## 12. Dashboard Setup

### 12.1 E-Commerce KPI Dashboard

**Dashboard name:** `Phase 3 — E-Commerce KPIs`

| Widget | Type | Event/Query |
|---|---|---|
| Daily Revenue (AED) | Trend | `checkout_completed` → sum of `order_value` |
| Conversion Rate | Trend | E-commerce funnel step 1→5 percentage |
| Average Order Value | Number | `checkout_completed` → average of `order_value` |
| Revenue by Country | Bar chart | `checkout_completed` grouped by `country` |
| Top 10 Products (Add to Cart) | Table | `product_added_to_cart` grouped by `product_name` |
| Cart Abandonment Rate | Number | `checkout_abandoned` / `checkout_started` |
| Loyalty Points Redeemed | Trend | `loyalty_points_redeemed` → sum of `points_redeemed` |
| New Customer Registrations | Trend | `account_registered` |

### 12.2 Marketing Dashboard

**Dashboard name:** `Phase 3 — Marketing Performance`

| Widget | Type | Event/Query |
|---|---|---|
| Traffic by Source | Pie | `$pageview` grouped by `$referrer` domain |
| Landing Page Performance | Table | `$pageview` by `$pathname`, with bounce rate |
| Newsletter Sign-Ups | Trend | `newsletter_subscribed` |
| Contact Form Submissions | Bar | `contact_form_submitted` grouped by `form_type` |
| Compatibility Finder Usage | Trend | `compatibility_finder_used` |
| Distributor Applications | Number | `distributor_application_started` |
| Exit Intent Popup Conversions | Funnel | Popup shown → `newsletter_subscribed` |

### 12.3 Support Dashboard

**Dashboard name:** `Phase 3 — Support and Self-Service`

| Widget | Type | Event/Query |
|---|---|---|
| KB Article Views | Trend | `kb_article_viewed` |
| Top KB Articles | Table | `kb_article_viewed` grouped by `article_title` |
| Warranty Registrations | Trend | `warranty_registered` |
| RMA Submissions | Trend | `rma_submitted` grouped by `rma_reason` |
| Chat Initiations | Number | `chat_initiated` |
| Support Funnel | Funnel | `kb_article_viewed` → `warranty_registered` |

---

## 13. Data Retention Policy

| Data type | Retention period | Action after retention period |
|---|---|---|
| PostHog events (ClickHouse) | 12 months | Export to Backblaze B2 as Parquet, delete from ClickHouse |
| Session recordings | 30 days | Auto-deleted by PostHog |
| Person profiles | Until user deletion request | Delete via PostHog API on DSAR |
| Feature flag decision logs | 12 months | Archived |
| PostHog PostgreSQL metadata | 12 months | Archived |

**Archive process (monthly, automated):**
1. PostHog exports ClickHouse data to S3-compatible storage (Backblaze B2) using PostHog's built-in data pipeline
2. Exported data is stored in bucket `twinmos-posthog-archive` in Parquet format
3. Archive retention: 7 years (legal requirement for order-related events; 3 years for non-transactional events)
4. Archive access: requires explicit authorization from TwinMOS data controller

---

## 14. Privacy and Regulatory Compliance

### 14.1 GDPR (EU)

| Requirement | Implementation |
|---|---|
| Lawful basis | Legitimate interest for analytics; consent for session replay and marketing |
| Data minimization | Only capturing events listed in Section 6; no PII in event properties except pseudonymous user ID |
| Data residency | All PostHog data on Hetzner Germany — no transfer outside EEA |
| Consent mechanism | Cookie banner (Phase 2); PostHog not initialized until `analytics: true` consent granted |
| Right to erasure (Art. 17) | Delete person via PostHog API: `DELETE /api/person/{id}/?delete_events=true` |
| Right to access (Art. 20) | Export person data via PostHog API: `GET /api/person/{id}/` |
| DSAR SLA | Response within 30 days |
| DPA (Data Processing Agreement) | Not required (self-hosted; TwinMOS is both controller and processor) |

**Opt-out by default:**

```typescript
// PostHog opts out by default until consent is granted
posthog.opt_out_capturing();

// Called from grantAnalyticsConsent() in posthog.ts
posthog.opt_in_capturing();
```

### 14.2 UAE PDPL (Personal Data Protection Law)

The UAE PDPL (Federal Decree-Law No. 45 of 2021) requires:
- Consent for processing personal data for non-essential purposes ✅ (handled via cookie banner)
- Data security measures ✅ (PostHog on encrypted Hetzner storage, HTTPS in transit)
- Data subject rights (access, correction, deletion) ✅ (PostHog API + 30-day SLA)

Since PostHog data is stored in Germany (EU) rather than UAE servers, TwinMOS's privacy policy must disclose this cross-border transfer to users in UAE. This is permissible under UAE PDPL with appropriate disclosure.

### 14.3 India DPDP Act (Digital Personal Data Protection Act, 2023)

| Requirement | Implementation |
|---|---|
| Consent | Explicit consent via cookie banner before analytics initialization |
| Purpose limitation | Analytics consent covers behavioral analytics only; marketing consent is separate |
| Data principal rights | Export and deletion via PostHog API within 30-day SLA |
| Data fiduciary obligations | TwinMOS acts as data fiduciary; Hetzner as data processor (EU) |

Note: India's DPDP rules on cross-border data transfer are still being finalized (pending government notification). Monitor regulatory updates. Current approach (consent + disclosure) is aligned with expected requirements.

### 14.4 IP Anonymization

PostHog configuration to enable IP anonymization:

In PostHog Admin → Project Settings → Privacy:
- Enable: "Anonymize IP addresses" ✅

This removes the last octet of IPv4 addresses (e.g., `192.168.1.100` → `192.168.1.0`) server-side before storage.

Additionally, the `posthog-js` client is initialized with `ip: false` to avoid sending the IP address explicitly (PostHog still captures it from the HTTP request header, but server-side anonymization then applies).

### 14.5 Honoring Deletion Requests (DSAR)

**Process:**

1. DSAR received (email to privacy@twinmos.com or form on website)
2. TwinMOS verifies identity of data subject (email match + account verification)
3. Developer executes PostHog deletion API:

```bash
# Delete person and all associated events from PostHog
curl -X DELETE \
  "https://analytics.twinmos.com/api/person/{distinct_id}/?delete_events=true" \
  -H "Authorization: Bearer <POSTHOG_PERSONAL_API_KEY>"
```

4. Also delete from HubSpot, Medusa (order data anonymized), and Resend contact list
5. Confirm deletion to data subject within 30 days of request

---

## 15. Cost Considerations

### 15.1 PostHog Self-Hosted Cost

PostHog OSS is free software. The only costs are infrastructure.

| Cost item | Detail | Monthly cost (est.) |
|---|---|---|
| Hetzner CX52 server | 8 vCPU, 16 GB RAM, 240 GB NVMe | ~EUR 35 |
| Hetzner traffic | First 20 TB included; unlikely to exceed for analytics | EUR 0 |
| Backblaze B2 storage | ~10 GB/month archive growth; $0.006/GB/mo | < USD 1 |
| Cloudflare (analytics subdomain) | Proxied on Cloudflare Free plan | USD 0 |
| **Total** | | **~EUR 36/month** |

### 15.2 Equivalent SaaS Cost Comparison

| Alternative | Estimated monthly cost at TwinMOS traffic (50K sessions/mo) |
|---|---|
| Mixpanel Growth | USD 400–800 |
| Amplitude Growth | USD 500–1,000 |
| Heap | USD 300–600 |
| FullStory + Mixpanel | USD 1,400+ |
| **PostHog self-hosted** | **~EUR 36 (infrastructure only)** |

**Annual savings vs next cheapest alternative: ~USD 3,500–5,000/year.**

---

## 16. Monitoring and Health Checks

### 16.1 PostHog Health Check Endpoint

```bash
# Returns {"status": "ok"} if PostHog is healthy
GET https://analytics.twinmos.com/_health
```

### 16.2 UptimeRobot Monitoring

Configure UptimeRobot (or Coolify's built-in health check) to monitor:

| Monitor | URL | Check interval | Alert channel |
|---|---|---|---|
| PostHog HTTP health | `https://analytics.twinmos.com/_health` | 5 minutes | Slack #alerts + TwinMOS PM email |
| PostHog event ingestion | `https://analytics.twinmos.com/e/` (POST) | 15 minutes | Slack #alerts |

### 16.3 Coolify Health Check Configuration

In Coolify → PostHog application → Health Check:
- Health check URL: `/_health`
- Expected HTTP status: `200`
- Interval: 30 seconds
- Restart on failure: Yes (after 3 consecutive failures)

### 16.4 Disk Usage Monitoring

ClickHouse data grows significantly with event volume. Monitor disk usage:

```bash
# Run on Hetzner CX52 via Coolify SSH
df -h /var/lib/docker/volumes/
```

Alert threshold: 80% disk usage → expand volume or archive data to Backblaze B2 immediately.

### 16.5 ClickHouse Performance Monitoring

```sql
-- Check ClickHouse query performance
SELECT
  query_duration_ms,
  read_rows,
  read_bytes,
  query
FROM system.query_log
WHERE event_date = today()
  AND query_duration_ms > 1000
ORDER BY query_duration_ms DESC
LIMIT 20;
```

---

## 17. Acceptance Criteria

The PostHog configuration is considered complete and ready for Phase 3 launch when all of the following criteria are met:

| ID | Criterion | Verified by |
|---|---|---|
| AC-PHOG-001 | PostHog OSS deployed on Hetzner CX52 via Coolify and accessible at `https://analytics.twinmos.com` | Dev A |
| AC-PHOG-002 | `/_health` endpoint returns `{"status": "ok"}` | Dev A |
| AC-PHOG-003 | PostHog does NOT initialize before analytics consent is granted (verify via browser console + network tab) | Dev B |
| AC-PHOG-004 | All 25+ custom events from Section 6 firing correctly (verify in PostHog Live Events) | Dev B |
| AC-PHOG-005 | Session replay enabled and recordings visible for authenticated test user sessions | Dev A |
| AC-PHOG-006 | No PII visible in session replays (input fields masked, data-ph-no-capture applied to checkout) | Dev B + TwinMOS PM |
| AC-PHOG-007 | All 6 Phase 3 feature flags created and evaluating correctly in staging | Dev A |
| AC-PHOG-008 | E-commerce funnel configured and showing data from test purchase flow | Dev B |
| AC-PHOG-009 | All 3 dashboards created and populated with test data | Dev A |
| AC-PHOG-010 | UptimeRobot monitor active for `analytics.twinmos.com` | Dev A |
| AC-PHOG-011 | Data deletion (DSAR) test completed: test person deleted via API and confirmed absent from PostHog | Dev B |
| AC-PHOG-012 | Backblaze B2 bucket created and PostHog export pipeline tested | Dev A |
| AC-PHOG-013 | PostHog `PUBLIC_POSTHOG_KEY` and `PUBLIC_POSTHOG_HOST` set in Cloudflare Pages environment variables | Dev A |
| AC-PHOG-014 | Google Analytics 4 key events cross-validated against PostHog (add_to_cart, purchase match within 5%) | TwinMOS Marketing |
| AC-PHOG-015 | Sampling rate for session replay confirmed at 20% (verified over 100 test sessions) | Dev B |

---

*Document reference: TWN-P3-POSTHOG-2026-001 | Version 1.0 | TwinMOS Technologies*
*This document is confidential and intended for internal use only.*
