# TwinMOS Website — Plausible Analytics Configuration

**Document ID:** H.5-006  
**Version:** 1.0  
**Status:** Active  
**Owner:** Tech Lead  
**Last Updated:** 2026-05-01  
**Related:** TwinMOSWebsiteMonitoring_Specification.md · TwinMOSWebsiteCoolifyConfigurationGuide.md · TwinMOSWebsiteEnvironmentVariablesReference.md · TwinMOSWebsiteCloudflareConfigurationGuide.md

---

## 1. Plausible Overview

Plausible Analytics is a lightweight, privacy-first, GDPR-compliant web analytics platform.

**Why Plausible for TwinMOS:**
- **Cookie-free:** No consent banner required for most jurisdictions
- **GDPR compliant:** No personal data collected, no cross-site tracking
- **Lightweight:** <1KB script (Google Analytics = 73KB+)
- **Self-hosted:** Data stays on TwinMOS infrastructure (MENA data sovereignty)
- **Simple:** Clean dashboard; no complex configuration for marketing team

**What Plausible does NOT provide:**
- Individual user tracking
- Heatmaps (use Microsoft Clarity or Hotjar if needed)
- A/B testing (use dedicated tool)
- Session recording (use Sentry Replays for debugging)

---

## 2. Deployment Configuration

### 2.1 Plausible Docker Compose (via Coolify)

Plausible requires three containers: the app, PostgreSQL (separate from Strapi's), and ClickHouse.

```yaml
# docker-compose.plausible.yml (or configure via Coolify services)
version: '3.8'

services:
  plausible:
    image: plausible/community-edition:v2.1
    restart: unless-stopped
    command: sh -c "sleep 10 && /entrypoint.sh db createdb && /entrypoint.sh db migrate && /entrypoint.sh run"
    depends_on:
      - plausible-db
      - plausible-clickhouse
    ports:
      - "127.0.0.1:8000:8000"
    environment:
      BASE_URL: https://analytics.twinmos.com
      SECRET_KEY_BASE: ${PLAUSIBLE_SECRET_KEY_BASE}
      DATABASE_URL: postgresql://plausible:${PLAUSIBLE_DB_PASSWORD}@plausible-db:5432/plausible
      CLICKHOUSE_DATABASE_URL: http://plausible-clickhouse:8123/plausible
      DISABLE_REGISTRATION: "true"
      LOG_FAILED_LOGIN_ATTEMPTS: "true"
      TOTP_VAULT_KEY: ${PLAUSIBLE_TOTP_VAULT_KEY}
      # Email (optional — for account notifications)
      MAILER_EMAIL: noreply@twinmos.com
      SMTP_HOST_ADDR: smtp.resend.com
      SMTP_HOST_PORT: "465"
      SMTP_USER_NAME: resend
      SMTP_USER_PWD: ${RESEND_API_KEY}
      SMTP_HOST_SSL_ENABLED: "true"
    networks:
      - plausible-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.plausible.rule=Host(`analytics.twinmos.com`)"
      - "traefik.http.routers.plausible.tls=true"
      - "traefik.http.routers.plausible.tls.certresolver=letsencrypt"
    deploy:
      resources:
        limits:
          memory: 512m
          cpus: '0.5'

  plausible-db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: plausible
      POSTGRES_PASSWORD: ${PLAUSIBLE_DB_PASSWORD}
      POSTGRES_DB: plausible
    volumes:
      - plausible-postgres-data:/var/lib/postgresql/data
    networks:
      - plausible-network
    deploy:
      resources:
        limits:
          memory: 256m

  plausible-clickhouse:
    image: clickhouse/clickhouse-server:23-alpine
    restart: unless-stopped
    volumes:
      - plausible-clickhouse-data:/var/lib/clickhouse
      - ./plausible-clickhouse-config.xml:/etc/clickhouse-server/config.d/logging.xml:ro
      - ./plausible-clickhouse-user-config.xml:/etc/clickhouse-server/users.d/logging.xml:ro
    ulimits:
      nofile:
        soft: 262144
        hard: 262144
    networks:
      - plausible-network
    deploy:
      resources:
        limits:
          memory: 512m

volumes:
  plausible-postgres-data:
  plausible-clickhouse-data:

networks:
  plausible-network:
    driver: bridge
```

### 2.2 ClickHouse Configuration Files

```xml
<!-- plausible-clickhouse-config.xml -->
<clickhouse>
  <logger>
    <level>warning</level>
    <console>true</console>
  </logger>
  <query_thread_log remove="remove"/>
  <query_log remove="remove"/>
  <text_log remove="remove"/>
  <trace_log remove="remove"/>
  <metric_log remove="remove"/>
  <asynchronous_metric_log remove="remove"/>
  <session_log remove="remove"/>
  <part_log remove="remove"/>
</clickhouse>
```

```xml
<!-- plausible-clickhouse-user-config.xml -->
<clickhouse>
  <profiles>
    <default>
      <log_queries>0</log_queries>
      <log_query_threads>0</log_query_threads>
    </default>
  </profiles>
</clickhouse>
```

---

## 3. Astro Frontend Integration

### 3.1 Script Injection

Plausible script is injected in the Astro layout component:

```astro
---
// src/layouts/BaseLayout.astro
const plausibleDomain = import.meta.env.PUBLIC_PLAUSIBLE_DOMAIN; // "twinmos.com"
const plausibleUrl = import.meta.env.PUBLIC_PLAUSIBLE_URL;       // "https://analytics.twinmos.com"
const isProduction = import.meta.env.PUBLIC_ENV === 'production';
---

<html lang={Astro.currentLocale ?? 'en'} dir={Astro.currentLocale === 'ar' ? 'rtl' : 'ltr'}>
  <head>
    <!-- Other head content -->

    {isProduction && (
      <script
        defer
        data-domain={plausibleDomain}
        src={`${plausibleUrl}/js/script.tagged-events.js`}
      />
    )}
  </head>
  <!-- ... -->
</html>
```

**Script variants:**
```
script.js               — Basic pageview tracking
script.tagged-events.js — + custom event support (needed for goals)
script.outbound-links.js — + auto-track outbound link clicks
script.file-downloads.js — + auto-track file downloads (PDF datasheets)

Recommended for TwinMOS P1:
script.tagged-events.outbound-links.file-downloads.js
(combine multiple via Plausible dashboard → Script Extensions)
```

### 3.2 Custom Event Tracking

```typescript
// src/utils/analytics.ts
// Type-safe Plausible event wrapper

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string | number | boolean> }) => void;
  }
}

export function trackEvent(
  event: string,
  props?: Record<string, string | number | boolean>
) {
  if (typeof window !== 'undefined' && window.plausible) {
    window.plausible(event, { props });
  }
}

// Typed event helpers
export const analytics = {
  ctaClick: (button: string, product?: string) =>
    trackEvent('CTA Click', { button, ...(product && { product }) }),

  productView: (slug: string, category: string) =>
    trackEvent('Product View', { slug, category }),

  datasheetDownload: (product: string, format: 'PDF' | 'TDS') =>
    trackEvent('Datasheet Download', { product, format }),

  searchQuery: (query: string, resultCount: number, locale: string) =>
    trackEvent('Search', { query: query.substring(0, 50), results: resultCount, locale }),

  compatibilityCheck: (type: 'laptop' | 'desktop' | 'server', brand?: string) =>
    trackEvent('Compatibility Check', { type, ...(brand && { brand }) }),

  retailerClick: (country: string, retailer: string) =>
    trackEvent('Retailer Click', { country, retailer }),

  contactFormSubmit: (subject: string) =>
    trackEvent('Contact Form Submit', { subject }),

  warrantyRegistration: (product: string, region: string) =>
    trackEvent('Warranty Registration', { product, region }),
};
```

### 3.3 Usage in Astro Components

```astro
---
// src/components/ProductCard.astro
import { analytics } from '@/utils/analytics';
---

<article class="product-card">
  <h2>{product.name}</h2>
  
  <!-- Datasheet download button -->
  <a
    href={product.datasheetUrl}
    onclick={`window.plausible && window.plausible('Datasheet Download', {props: {product: '${product.name}'}})`}
    class="btn-secondary"
  >
    Download Datasheet
  </a>
  
  <!-- CTA button -->
  <button
    data-analytics-event="CTA Click"
    data-analytics-props={JSON.stringify({ button: 'Where to Buy', product: product.name })}
    class="btn-primary"
  >
    Where to Buy
  </button>
</article>

<script>
  // Plausible tagged events via data attributes
  document.querySelectorAll('[data-analytics-event]').forEach(el => {
    el.addEventListener('click', () => {
      const event = el.getAttribute('data-analytics-event');
      const props = JSON.parse(el.getAttribute('data-analytics-props') || '{}');
      window.plausible?.(event, { props });
    });
  });
</script>
```

---

## 4. Goals and Funnels

### 4.1 Configure Goals

In Plausible Dashboard → Goals → Add Goal:

```
Goal 1: Datasheet Download
  Event Name: Datasheet Download
  (Appears in Goals: shows total downloads + props breakdown by product)

Goal 2: Contact Form Submit
  Event Name: Contact Form Submit
  
Goal 3: Retailer Click
  Event Name: Retailer Click
  (Shows which countries/retailers drive clicks)

Goal 4: Warranty Registration
  Event Name: Warranty Registration

Goal 5: Product Page visit (URL-based)
  Goal Type: Visit a specific page
  URL contains: /products/
  (Tracks product category engagement)

Goal 6: Where-to-Buy page
  Goal Type: Visit a specific page
  URL equals: /where-to-buy/
```

### 4.2 Configure Funnels

In Plausible Dashboard → Funnels → Create Funnel:

```
Funnel 1: Product Engagement Funnel
  Step 1: Page URL contains /products/
  Step 2: Custom Event = Product View
  Step 3: Custom Event = Datasheet Download
  Step 4: Page URL contains /where-to-buy/

Funnel 2: Support Funnel
  Step 1: Page URL contains /support/
  Step 2: Custom Event = Contact Form Submit

Funnel 3: Search-to-Product
  Step 1: Custom Event = Search (query entered)
  Step 2: Custom Event = Product View (clicked result)
```

---

## 5. Dashboard Configuration

### 5.1 Plausible Site Configuration

```
Plausible Dashboard → [site: twinmos.com] → Settings → General

Site Name: TwinMOS Technologies
Domain: twinmos.com
Timezone: Asia/Dubai (GMT+4) — reflects primary audience timezone
Weekly Reports: Enabled (sent to devops@twinmos.com Monday morning)
```

### 5.2 Shared Dashboard Links

For Marketing team read-only access (no login required):

```
Plausible → Settings → Visibility → Make stats public
  OR
Plausible → Settings → Shared links → Create new shared link
  Password protected: Yes (optional)
  Label: Marketing Team Access

Share URL: https://analytics.twinmos.com/share/twinmos.com?auth=<token>
```

### 5.3 Key Dashboard Sections

| Section | What to Review | Frequency |
|---------|---------------|-----------|
| Top pages | Which products get most views | Weekly |
| Traffic sources | Referrers, UTM campaigns | Weekly |
| Geography | Country breakdown | Monthly |
| Goals | Conversion rates per goal | Weekly |
| Funnels | Drop-off analysis | Monthly |
| Devices | Mobile vs desktop split | Monthly |
| Browsers | Chrome/Safari/Firefox/Samsung split | Quarterly |

---

## 6. UTM Campaign Tracking

Plausible automatically parses UTM parameters. Use for all marketing campaigns:

```
Standard UTM parameters:
  utm_source:   [distributor name, social platform, email, etc.]
  utm_medium:   [email, social, cpc, referral, organic]
  utm_campaign: [computex-2026, gitex-2026, product-launch-voltx]
  utm_content:  [banner-top, sidebar-cta, email-button]

Example URLs for COMPUTEX campaign:
  https://twinmos.com/?utm_source=computex&utm_medium=event&utm_campaign=computex-2026
  https://twinmos.com/products/voltx-ddr5/?utm_source=distributor-email&utm_medium=email&utm_campaign=voltx-launch

Plausible shows these in:
  Dashboard → Channels (utm_medium breakdown)
  Dashboard → Campaigns (utm_campaign breakdown)
```

---

## 7. Privacy and Consent Strategy

### 7.1 No Cookie — No Consent Required (Most Jurisdictions)

Plausible does not use cookies or local storage. It does not track users across sessions or across sites. For most regions, no consent banner is required.

**Affected regions (explicit consent NOT required for Plausible):**
- UAE, Saudi Arabia, India, Bangladesh, Pakistan — local laws do not require consent for non-cookie analytics
- Russia — minimal analytics regulation
- China — Plausible doesn't track individual users; consult legal if needed
- USA — No federal requirement (CCPA only applies to personal data)

**Affected regions (GDPR — EU/UK):**
- EU visitors: Plausible is designed to be GDPR-compliant without consent banner per Plausible's published legal analysis
- Their argument: Plausible doesn't process personal data (no IP storage, no fingerprinting)
- **Consult DPO (dpo@twinmos.com) for final determination before EU launch**

### 7.2 What Plausible Does NOT Collect

- IP addresses (hashed and discarded after session detection)
- User identifiers, cookies, device fingerprints
- Cross-site behaviour
- Personal data (name, email, phone)

---

## 8. Plausible API Integration

### 8.1 Stats API for Custom Reporting

```typescript
// Example: Fetch weekly product page stats for internal dashboard
const PLAUSIBLE_API_KEY = process.env.PLAUSIBLE_API_KEY;
const PLAUSIBLE_SITE_ID = 'twinmos.com';
const BASE_URL = 'https://analytics.twinmos.com';

async function getTopProductPages(period: 'day' | '7d' | '30d' = '7d') {
  const response = await fetch(
    `${BASE_URL}/api/v1/stats/breakdown?` + new URLSearchParams({
      site_id: PLAUSIBLE_SITE_ID,
      period,
      property: 'event:page',
      filters: 'event:page==/products/**',
      metrics: 'visitors,pageviews,bounce_rate',
      limit: '20',
    }),
    {
      headers: { Authorization: `Bearer ${PLAUSIBLE_API_KEY}` },
    }
  );
  const { results } = await response.json();
  return results;
}

// Usage in Strapi (admin dashboard widget, P2)
const topProducts = await getTopProductPages('30d');
console.log(topProducts);
// [{ page: '/products/voltx-ddr5/', visitors: 1243, pageviews: 1891, bounce_rate: 34.2 }]
```

### 8.2 Weekly Report Automation

```bash
#!/usr/bin/env bash
# weekly-analytics-report.sh — generates weekly analytics CSV for marketing

PLAUSIBLE_KEY="${PLAUSIBLE_API_KEY}"
SITE="twinmos.com"
PLAUSIBLE_URL="https://analytics.twinmos.com"

# Top 10 pages this week
curl -s "${PLAUSIBLE_URL}/api/v1/stats/breakdown?site_id=${SITE}&period=7d&property=event:page&metrics=visitors,pageviews&limit=10" \
  -H "Authorization: Bearer ${PLAUSIBLE_KEY}" \
  | jq -r '.results[] | [.page, .visitors, .pageviews] | @csv' \
  > /tmp/top-pages.csv

# Goal completions this week
curl -s "${PLAUSIBLE_URL}/api/v1/stats/breakdown?site_id=${SITE}&period=7d&property=event:goal&metrics=visitors,events" \
  -H "Authorization: Bearer ${PLAUSIBLE_KEY}" \
  | jq -r '.results[] | [.goal, .visitors, .events] | @csv' \
  >> /tmp/top-pages.csv

echo "Weekly analytics report generated: /tmp/top-pages.csv"
# Email to marketing team via Resend (or Slack)
```

---

## 9. Phase 3 — Revenue Tracking

For Phase 3 (Medusa commerce), add revenue tracking to Plausible:

```javascript
// In Medusa order confirmation page
function trackPurchase(order) {
  window.plausible?.('Purchase', {
    props: {
      revenue: order.total / 100,  // Convert cents to dollars
      currency: order.currency_code.toUpperCase(),
      item_count: order.items.length,
      product_category: order.items[0]?.variant?.product?.category?.name,
    }
  });
}
```

---

## 10. Environment Variables

```bash
# Required in Coolify (Plausible service)
PLAUSIBLE_SECRET_KEY_BASE=<64-char random hex string>
PLAUSIBLE_DB_PASSWORD=<strong password — separate from Strapi DB>
PLAUSIBLE_TOTP_VAULT_KEY=<32-byte base64 key>

# Astro frontend (Cloudflare Pages)
PUBLIC_PLAUSIBLE_DOMAIN=twinmos.com
PUBLIC_PLAUSIBLE_URL=https://analytics.twinmos.com

# Plausible admin API (for automated reports)
PLAUSIBLE_API_KEY=<generated in Plausible Settings → API Keys>
```

---

*Approved by: Chairman · Tech Lead*  
*Synchronized With: Technology Stack v1.1 §20.6*
