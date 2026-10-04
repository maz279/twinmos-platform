# TwinMOS Website — Integration Specification: GA4 Analytics

| Field | Value |
|-------|-------|
| **Document ID** | TWN-INT-GA4-001 |
| **Version** | 1.0 |
| **Status** | Accepted |
| **Phase** | P1 (Plausible primary); P2 (GA4 secondary) |
| **Date** | 2026-05-01 |
| **Owner** | Engineering Lead |
| **Source** | Tech Stack §16.1, §16.2; BRD §23 |

---

## 1. Overview

The TwinMOS Website uses a **two-tier analytics strategy**:

| Tier | Tool | Phase | Role |
|------|------|-------|------|
| **Primary** | Plausible Analytics | P1 | Privacy-first, cookieless, GDPR-compliant. Powers day-to-day dashboard. |
| **Secondary** | Google Analytics 4 (GA4) | P2 | Advanced funnel analysis, audience segmentation, Google Ads integration. Requires cookie consent. |

This document covers both integrations.

---

## 2. Tier 1 — Plausible Analytics (Phase 1)

### 2.1 Why Plausible First

- **No cookie consent required** — cookieless tracking, GDPR/UAE PDPL compliant out of the box
- **Lightweight** — 1 KB script vs GA4's ~100 KB
- **Self-hosted option** — On Hetzner VPS via Coolify (€0 incremental cost)
- **Simple, actionable dashboard** — No data sampling, no complex setup

### 2.2 Deployment Options

| Option | Cost | Data Residency |
|--------|------|---------------|
| Plausible Cloud | $9/mo (up to 10k pageviews) | EU servers |
| Self-hosted (Hetzner) | €0 incremental | Hetzner DE (EU) |

**Decision:** Self-hosted in Phase 1 to minimise cost. Migrate to Plausible Cloud if operational overhead outweighs savings.

### 2.3 Script Integration

**In `LayoutBase.astro`:**
```html
<!-- Plausible — lightweight, no consent needed -->
<script
  defer
  data-domain="twinmos.com"
  src="https://plausible.twinmos.com/js/script.tagged-events.js"
></script>
```

### 2.4 Custom Events (Plausible)

```javascript
// Product page view
window.plausible('Product View', {
  props: { product_name: 'VOLTX DDR5 16GB', category: 'DDR5 Memory', brand: 'VOLTX' }
});

// Form submission
window.plausible('Form Submit', {
  props: { form_type: 'contact', locale: 'en' }
});

// Search performed
window.plausible('Search', {
  props: { query: 'DDR5 gaming', results_count: 12 }
});
```

---

## 3. Tier 2 — Google Analytics 4 (Phase 2+)

### 3.1 GA4 Property Configuration

| Property | Value |
|----------|-------|
| Measurement ID | `G-XXXXXXXXXX` (configured per environment) |
| Data stream | Web stream for `twinmos.com` |
| Enhanced measurement | Enabled (scroll depth, outbound clicks, file downloads, video) |
| Data retention | 14 months (maximum) |
| Signals | Enabled for remarketing |

### 3.2 Cookie Consent Gate

GA4 is only activated after the user accepts analytics cookies via the TwinMOS cookie consent banner:

```typescript
// Cookie consent handler
function onConsentAccepted(categories: string[]) {
  if (categories.includes('analytics')) {
    loadGA4Script();
    window.gtag('consent', 'update', {
      analytics_storage: 'granted',
    });
  }
}
```

**Default consent state (before user decision):**
```html
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    wait_for_update: 500,
  });
</script>
```

### 3.3 Script Loading

```html
<!-- Only load after consent granted — injected by consent handler -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX', {
    anonymize_ip: true,
    cookie_flags: 'SameSite=None;Secure',
  });
</script>
```

---

## 4. Custom Events

### 4.1 Event Inventory

| Event Name | Trigger | Parameters |
|-----------|---------|-----------|
| `product_view` | Product detail page viewed | `product_name`, `product_category`, `product_brand`, `product_sku` |
| `compatibility_search` | Compatibility finder query submitted | `motherboard_make`, `motherboard_model`, `product_slug` |
| `form_submit` | Any form successfully submitted | `form_type`, `country`, `locale` |
| `distributor_locate` | Where-to-buy map searched | `country`, `region` |
| `search_query` | Site search performed | `search_term`, `results_count` |
| `rma_started` | RMA form opened (P2) | `product_name`, `issue_type` |
| `warranty_registered` | Warranty form submitted | `product_name`, `country` |
| `download_clicked` | Firmware/manual download clicked | `file_name`, `product_name` |
| `outbound_link` | Link to distributor/retailer clicked | `destination_url`, `link_text` |
| `video_play` | Product video played (P2) | `video_title`, `product_name` |

### 4.2 Implementation in React Islands

```typescript
// analytics.ts — shared utility
export function trackEvent(
  eventName: string,
  params: Record<string, string | number>
) {
  // Plausible (always active)
  if (window.plausible) {
    window.plausible(eventName, { props: params });
  }
  // GA4 (only if consent given and gtag loaded)
  if (window.gtag) {
    window.gtag('event', eventName, params);
  }
}

// Usage in ProductDetail component
trackEvent('product_view', {
  product_name: product.name,
  product_category: product.category.name,
  product_brand: product.brand.name,
  product_sku: product.partNumber,
});
```

---

## 5. Custom Dimensions

Registered in GA4 Admin → Custom Definitions:

| Dimension Name | Scope | Parameter | Description |
|---------------|-------|-----------|-------------|
| `product_category` | Event | `product_category` | Product line (DDR5, SSD Gen 5, etc.) |
| `product_brand` | Event | `product_brand` | Sub-brand (VOLTX, CoreX Pro, etc.) |
| `user_locale` | User | `user_locale` | Website locale at session start |
| `page_type` | Event | `page_type` | Template type (product, homepage, support, etc.) |
| `form_type` | Event | `form_type` | Which form was submitted |
| `distributor_country` | Event | `country` | Country of distribution lookup |

---

## 6. Server-Side Tracking (GA4 Measurement Protocol)

For critical events (form submissions), server-side tracking via GA4 Measurement Protocol provides attribution data even when the client doesn't load GA4 (consent denied, ad blockers).

### 6.1 Endpoint

```
POST https://www.google-analytics.com/mp/collect
  ?measurement_id=G-XXXXXXXXXX
  &api_secret={GA4_MEASUREMENT_PROTOCOL_SECRET}
```

### 6.2 Implementation in Strapi

**File:** `src/services/analyticsService.ts`

```typescript
async function trackServerEvent(
  clientId: string,
  eventName: string,
  params: Record<string, unknown>
): Promise<void> {
  const payload = {
    client_id: clientId,
    events: [{
      name: eventName,
      params: {
        ...params,
        engagement_time_msec: 100,
        session_id: Date.now().toString(),
      },
    }],
  };

  await fetch(
    `https://www.google-analytics.com/mp/collect?measurement_id=${process.env.GA4_MEASUREMENT_ID}&api_secret=${process.env.GA4_API_SECRET}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(3000),
    }
  );
}

// Called from form submission lifecycle hook
export async function trackFormSubmission(submission: FormSubmission): Promise<void> {
  await trackServerEvent(
    submission.ipAddress ?? 'unknown',
    'form_submit',
    {
      form_type: submission.formType,
      country: submission.country ?? 'unknown',
      locale: submission.locale ?? 'en',
    }
  );
}
```

**Custom dimensions note:** Custom dimensions must be registered in GA4 Admin UI first. Server-side events appear in GA4 reports within 24 hours.

---

## 7. Conversion Goals (GA4 Events as Conversions)

Marked as conversions in GA4 Admin:

| Event | Business Goal |
|-------|--------------|
| `form_submit` (type=distributor_application) | New distributor lead |
| `form_submit` (type=contact) | General sales lead |
| `warranty_registered` | Customer retention signal |
| `search_query` | Engagement intent signal |

---

## 8. Data Retention & Privacy

| Setting | Value |
|---------|-------|
| GA4 data retention | 14 months |
| IP anonymisation | Enabled (`anonymize_ip: true`) |
| User data deletion | Via GA4 User Deletion API on GDPR requests |
| Consent mode | v2 (Advanced) enabled |
| Data sharing with Google | Default settings; advertising features disabled in Phase 1 |

---

## 9. Environment Variables

| Variable | Location | Description |
|----------|----------|-------------|
| `PUBLIC_PLAUSIBLE_DOMAIN` | Astro env | Plausible tracked domain (`twinmos.com`) |
| `PUBLIC_PLAUSIBLE_API_HOST` | Astro env | Self-hosted Plausible URL |
| `PUBLIC_GA4_MEASUREMENT_ID` | Astro env | GA4 Measurement ID (`G-XXXXXXXXXX`) |
| `GA4_MEASUREMENT_ID` | Strapi env | Same ID for server-side |
| `GA4_API_SECRET` | Strapi env | Measurement Protocol API secret |

---

## 10. Related Documents

- [TwinMOSWebsiteIntegrationSpecSentry_Monitoring.md](TwinMOSWebsiteIntegrationSpecSentry_Monitoring.md)
- ADR-002: Architecture Patterns
