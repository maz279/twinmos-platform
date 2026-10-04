# TwinMOS Website — CDN Caching Strategy

**Document ID:** H.3-007  
**Version:** 1.0  
**Status:** Active  
**Owner:** Tech Lead  
**Last Updated:** 2026-05-01  
**Related:** TwinMOSWebsiteCloudflareConfigurationGuide.md · TwinMOSWebsiteHostingArchitectureSpec.md · TwinMOSWebsiteSLISLODefinitions.md

---

## 1. CDN Architecture Overview

The TwinMOS website uses **Cloudflare Pro** as its primary CDN — a globally distributed network with 300+ Points of Presence (PoPs) in 100+ countries.

```
Cache hierarchy:
  User browser (Browser Cache)
      ↓ cache miss
  Cloudflare edge PoP (Edge Cache)
      ↓ cache miss
  Cloudflare Pages origin (for Astro static files)
      or
  Hetzner CX32 origin (for Strapi API / Coolify services)
```

**CDN goals:**
- Cache hit ratio ≥ 85% overall; ≥ 95% for static assets
- LCP < 1.8 s for global users (MENA, Africa, South Asia, EU)
- TTFB < 150 ms served from Cloudflare edge
- Zero stale content after CMS publishes

---

## 2. Cache Rules by Content Type

| Content Type | Path Pattern | Edge Cache TTL | Browser Cache TTL | Cache Level | Notes |
|---|---|---|---|---|---|
| HTML pages | `/`, `/*.html` (implied by Astro) | 1 hour | no-store | Standard | ISR-style: edge caches; browser always revalidates |
| Astro hashed assets (JS/CSS) | `/assets/*.js`, `/assets/*.css` | 1 year | 1 year | Aggressive | Astro fingerprints filenames; safe to cache forever |
| Web fonts | `/fonts/*` | 30 days | 7 days | Aggressive | Self-hosted Noto Sans; subset files |
| Product images (ImgProxy) | `imgproxy.twinmos.com/*` | 7 days | 1 day | Standard | Resized on-the-fly; cache result at edge |
| Strapi media (B2) | `*.backblazeb2.com/*` | 7 days | 1 day | (Cloudflare CDN in B2 region) | Served directly from B2 (Cloudflare free egress) |
| API responses | `api.twinmos.com/*` | Bypass | no-store | Bypass | Never cache authenticated API responses |
| Admin panel | `admin.twinmos.com/*` | Bypass | no-store | Bypass | CMS admin must never be cached |
| XML sitemap | `/sitemap*.xml` | 24 hours | 4 hours | Standard | Changes only on content publish |
| robots.txt | `/robots.txt` | 24 hours | 24 hours | Standard | |
| favicons/manifest | `/favicon.*`, `/site.webmanifest` | 7 days | 7 days | Standard | |
| Open Graph images | `/og/*` | 7 days | 7 days | Standard | Pre-generated OG images per page |
| PDF datasheets | `/downloads/*.pdf` | 7 days | 1 day | Standard | Trigger purge on update |
| Search endpoint | `search.twinmos.com/*` | Bypass | no-store | Bypass | MeiliSearch — real-time results |
| Analytics | `analytics.twinmos.com/*` | Bypass | no-store | Bypass | Plausible — real-time |

---

## 3. Cache-Control Headers

Astro sets these headers on built assets. Cloudflare respects them.

### 3.1 Static assets (Astro output)

```
/assets/_astro/product-card.BtRxRgY2.js:
  Cache-Control: public, max-age=31536000, immutable

/assets/_astro/global.BkY7pX3.css:
  Cache-Control: public, max-age=31536000, immutable
```

Astro appends a content hash to every asset filename. When content changes, the URL changes, so caches never serve stale assets.

### 3.2 HTML pages (set via Cloudflare Transform Rules)

```
Content-Type: text/html
Cache-Control: no-store
CDN-Cache-Control: max-age=3600 (1 hour — instructs Cloudflare edge only)
Cloudflare-CDN-Cache-Control: max-age=3600
Surrogate-Control: max-age=3600
```

This "ISR" pattern caches HTML at the edge for 1 hour but forces browsers to always revalidate — so users never see stale content, but origin is only hit once per hour per PoP.

### 3.3 API responses (Strapi)

```
Cache-Control: no-store, no-cache
Vary: Accept, Authorization
```

API responses must not be cached by Cloudflare (private user data, real-time stock/pricing in P3).

---

## 4. Locale-Aware Caching

The TwinMOS website supports 9 locales (en, ar, hi, bn, ru, fr, es, de, zh). Each locale may have different cached content.

```
Vary: Accept-Language header strategy:

Option A (Cloudflare Pages — recommended):
  Each locale served at its own URL path:
    /en/products/voltx-ddr5/
    /ar/products/voltx-ddr5/
    /hi/products/voltx-ddr5/
  → No Vary header needed; each URL caches independently

Option B (Geo-redirect — P3 only):
  Cloudflare Worker detects cf-ipcountry
  Redirects to appropriate locale URL
  Cache remains per-URL (no Vary complications)
```

TwinMOS uses **Option A** (locale in URL path) via Astro i18n routing. This is the simplest and most cache-efficient approach.

---

## 5. Cache Purge Strategy

### 5.1 Automatic Cache Purge on CMS Publish

When a content editor publishes content in Strapi, a lifecycle hook triggers a Cloudflare Cache Purge API call. This ensures the updated content is served within seconds.

**Cache tags used by Astro pages:**

```javascript
// In Astro page components, set cache tags in response headers
// src/pages/products/[slug].astro
Astro.response.headers.set('Cache-Tag', `product-${Astro.params.slug},products`);
```

```javascript
// src/pages/index.astro
Astro.response.headers.set('Cache-Tag', 'home,global');
```

**Strapi lifecycle hooks:**

```javascript
// config/lifecycles/product.ts
export default {
  async afterCreate(event) {
    await cloudflare.purge(['products', 'home']);
  },
  async afterUpdate(event) {
    await cloudflare.purge([`product-${event.result.slug}`, 'products']);
  },
  async afterDelete(event) {
    await cloudflare.purge([`product-${event.result.slug}`, 'products', 'home']);
  },
};

// Reusable purge utility
async function cloudflare.purge(tags: string[]) {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tags }),
    }
  );
  if (!res.ok) {
    console.error('Cloudflare cache purge failed:', await res.text());
    // Don't throw — non-critical; cache will expire naturally
  }
}
```

### 5.2 Manual Cache Purge (Cloudflare Dashboard)

For emergency content fixes:

```
Cloudflare Dashboard → twinmos.com → Caching → Cache Purge
  Option 1: Purge Everything (use sparingly — increases origin load)
  Option 2: Custom Purge by URL (e.g. https://twinmos.com/products/voltx-ddr5/)
  Option 3: Purge by Cache Tag (e.g. tag: products)
```

### 5.3 GitHub Actions Cache Purge Workflow

```yaml
# .github/workflows/purge-cache.yml
name: Purge Cloudflare Cache

on:
  workflow_dispatch:
    inputs:
      tags:
        description: 'Cache tags to purge (comma-separated)'
        required: false
        default: 'global'
      purge_all:
        description: 'Purge everything (true/false)'
        required: false
        default: 'false'

jobs:
  purge:
    runs-on: ubuntu-latest
    steps:
      - name: Purge by tags
        if: inputs.purge_all != 'true'
        run: |
          curl -X POST \
            "https://api.cloudflare.com/client/v4/zones/${{ secrets.CLOUDFLARE_ZONE_ID }}/purge_cache" \
            -H "Authorization: Bearer ${{ secrets.CLOUDFLARE_API_TOKEN }}" \
            -H "Content-Type: application/json" \
            -d "{\"tags\":[\"${{ inputs.tags }}\"]}"

      - name: Purge everything
        if: inputs.purge_all == 'true'
        run: |
          curl -X POST \
            "https://api.cloudflare.com/client/v4/zones/${{ secrets.CLOUDFLARE_ZONE_ID }}/purge_cache" \
            -H "Authorization: Bearer ${{ secrets.CLOUDFLARE_API_TOKEN }}" \
            -H "Content-Type: application/json" \
            -d '{"purge_everything":true}'
```

---

## 6. Staging Cache Configuration

Staging uses shorter TTLs to ensure editors always see fresh content:

| Content Type | Staging Edge TTL | Staging Browser TTL |
|---|---|---|
| HTML pages | 5 minutes | no-store |
| Static assets | 1 hour | 1 hour |
| API responses | Bypass | no-store |

Set via Cloudflare Page Rule for staging subdomain:
```
Rule: hostname eq staging.twinmos.com
  → Override Cache Level: Bypass for all HTML
  → Override Edge TTL: 5 minutes
```

---

## 7. Cache Analytics & Targets

### 7.1 Key Metrics (via Cloudflare Analytics → Caching)

| Metric | Target | Monitoring |
|--------|--------|-----------|
| Cache hit ratio (overall) | ≥ 85% | Cloudflare Analytics (daily check) |
| Cache hit ratio (static assets) | ≥ 95% | Cloudflare Analytics |
| Cache hit ratio (HTML pages) | ≥ 70% | Cloudflare Analytics |
| TTFB (edge cached) | < 50 ms | Cloudflare Analytics → Speed |
| TTFB (origin) | < 300 ms | Cloudflare Analytics → Speed |

### 7.2 CF-Cache-Status Header Values

Useful for debugging cache behavior:

| Value | Meaning | Action |
|-------|---------|--------|
| `HIT` | Served from Cloudflare edge cache | ✓ Good |
| `MISS` | Not in cache; fetched from origin | Expected on first request |
| `EXPIRED` | Was cached; now expired; refetched | Normal after TTL expiry |
| `BYPASS` | Cache rule says bypass | Check if rule is correct |
| `DYNAMIC` | Dynamic content (no cache) | Normal for API |
| `REVALIDATED` | Stale cache revalidated with origin | Normal with stale-while-revalidate |

```bash
# Test cache status for a page
curl -I https://twinmos.com/products/voltx-ddr5/ | grep -i "cf-cache-status"
# Expected: cf-cache-status: HIT (on 2nd+ request)
```

---

## 8. Cache Warm-Up Procedure

Before major events (COMPUTEX, GITEX, new product launches), warm the CDN cache:

```bash
#!/usr/bin/env bash
# scripts/warm-cache.sh
# Pre-warms top 50 pages across key Cloudflare PoPs

PAGES=(
  "https://twinmos.com/"
  "https://twinmos.com/products/"
  "https://twinmos.com/products/memory/"
  "https://twinmos.com/products/ssd/"
  "https://twinmos.com/products/voltx-ddr5/"
  "https://twinmos.com/products/voltx-ddr5/4800mhz-16gb/"
  "https://twinmos.com/products/corex-pro-gen5/"
  "https://twinmos.com/where-to-buy/"
  "https://twinmos.com/about/"
  "https://twinmos.com/support/"
  # Arabic locale pages
  "https://twinmos.com/ar/"
  "https://twinmos.com/ar/products/"
  # Add all 50 key pages...
)

for page in "${PAGES[@]}"; do
  echo "Warming: ${page}"
  curl -s -o /dev/null -w "%{http_code} %{time_total}s — ${page}\n" "${page}"
  sleep 0.1  # Gentle — don't overwhelm origin
done

echo "Cache warm-up complete"
```

---

## 9. Troubleshooting

### Problem: Cache hit ratio below target

```bash
# Check which URLs are missing cache
# Cloudflare Analytics → Caching → Top Non-Cached Requests

# Common causes:
# 1. Cache-Control: no-store set incorrectly on static assets
# 2. Cookie-based cache bypass (logged-in users bypass cache)
# 3. Query parameters preventing cache hits (?utm_source= etc.)

# Fix 3: Add cache rule to ignore query strings for static pages
# Cloudflare → Cache → Cache Rules → Ignore Query String: ON for /products/*
```

### Problem: Stale content after publish

```bash
# Verify Strapi lifecycle hook is running
# Check Strapi logs: docker logs twinmos-strapi-1 | grep "purge"

# Manual emergency purge
curl -X POST \
  "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/purge_cache" \
  -H "Authorization: Bearer ${CF_TOKEN}" \
  -d '{"purge_everything":true}'
```

### Problem: High origin load despite caching

```bash
# Check cache hit ratio breakdown
# If HTML pages have low cache hit:
# → Increase Edge Cache TTL from 1h to 4h (only for pages without personalisation)
# → Ensure Cache-Control headers are set correctly

# If static assets have low cache hit:
# → Verify Astro build is fingerprinting files correctly
# → Check file names include content hash: /assets/index.ABCDEF12.js
```

---

*Approved by: Chairman · Tech Lead*  
*Synchronized With: Technology Stack v1.1 §19.5*
