# TwinMOS Website — Caching Strategy

**Document Reference:** TWN-CACHE-STRAT-2026-001  
**Document Version:** 1.0  
**Status:** DRAFT — Pending Engineering Review  
**Date:** 1 May 2026  
**Prepared by:** TwinMOS Digital Transformation Team / Unisoft Engineering  
**Owner:** IT/Technical Lead (Implementation) / DevOps Lead  
**Audience:** DevOps engineers, backend developers, frontend developers  
**Classification:** CONFIDENTIAL — TwinMOS + Unisoft Internal Use  
**Synchronized With:** Tech Stack §19.5 (CDN), §22.2 (API Performance), BRD §20.2, BRD §23.3 (Disaster Recovery)

---

## 1. Executive Summary

Caching is the single most effective technique for achieving the TwinMOS performance targets (LCP < 1.8s, TTFB < 150ms). This document defines a **multi-layer caching strategy** spanning browser, CDN, edge, application, and database layers.

The strategy is designed around the Astro 5 + Strapi v5 architecture:
- **Static content** (287 pages) is cached aggressively at the CDN edge
- **Dynamic content** (news, events, products) uses Incremental Static Regeneration (ISR) with short revalidation
- **API responses** are cached via Redis in Phase 2
- **Assets** (images, fonts, CSS, JS) are immutable and cached for 1 year

---

## 2. Caching Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  BROWSER CACHE                                              │
│  • Immutable assets (1 year)                                │
│  • HTML (revalidate based on page type)                     │
│  • Service Worker (P2) for offline pages                    │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────┐
│  CLOUDFLARE EDGE CACHE (CDN)                                │
│  • Static HTML (hours to days)                              │
│  • Images (24 hours)                                        │
│  • Fonts (1 year)                                           │
│  • API responses (configurable)                             │
│  • OSM map tiles (24 hours)                                 │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────┐
│  CLOUDFLARE WORKERS / EDGE FUNCTIONS                        │
│  • Geo-redirect logic                                       │
│  • A/B testing (P3)                                         │
│  • ISR revalidation triggers                                │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────┐
│  ASTRO / STRAPI APPLICATION CACHE                           │
│  • Astro build cache (incremental)                          │
│  • Strapi REST API cache (P2 Redis)                         │
│  • Strapi entityService cache                               │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────┐
│  DATABASE & SEARCH CACHE                                    │
│  • PostgreSQL query cache (shared_buffers)                  │
│  • Redis query result cache (P2)                            │
│  • MeiliSearch index (in-memory)                            │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────┐
│  OBJECT STORAGE CACHE                                       │
│  • Backblaze B2 (origin for ImgProxy)                       │
│  • Versioned assets (immutable URLs)                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Browser Caching Strategy

### 3.1 Cache-Control Headers by Asset Type

| Asset Type | `Cache-Control` | `ETag` | `Last-Modified` | Reasoning |
|-----------|----------------|--------|-----------------|-----------|
| **HTML (static pages)** | `public, max-age=0, must-revalidate` | Yes | No | Always revalidate; CDN serves stale while revalidating |
| **HTML (ISR pages)** | `public, max-age=60, stale-while-revalidate=3600` | Yes | No | 1 min fresh; serve stale for 1 hour while revalidating |
| **CSS / JS (hashed filenames)** | `public, max-age=31536000, immutable` | Yes | No | Filenames include content hash; cache forever |
| **Images (build-time)** | `public, max-age=31536000, immutable` | Yes | No | Hashed URLs; cache forever |
| **Images (runtime / ImgProxy)** | `public, max-age=86400` | Yes | No | 24 hours; ImgProxy handles format changes |
| **Fonts** | `public, max-age=31536000, immutable` | Yes | No | Self-hosted, versioned; cache forever |
| **API responses (read-only)** | `public, max-age=300` | Yes | No | 5 min cache for product lists, retailers |
| **API responses (user-specific)** | `private, no-store` | No | No | Never cache authenticated data |

### 3.2 Cloudflare Cache Rules

```
# Cloudflare Page Rules (configured via dashboard or API)

Rule 1: Static Assets
  URL: *twinmos.com/_astro/*
  Cache Level: Cache Everything
  Edge Cache TTL: 1 year
  Browser Cache TTL: 1 year

Rule 2: ImgProxy Images
  URL: *imgproxy.twinmos.com/*
  Cache Level: Cache Everything
  Edge Cache TTL: 24 hours
  Browser Cache TTL: 24 hours

Rule 3: API Routes
  URL: *api.twinmos.com/api/*
  Cache Level: Bypass
  # API caching handled by Strapi/Redis, not Cloudflare

Rule 4: Admin Routes
  URL: *admin.twinmos.com/*
  Cache Level: Bypass
  # Never cache admin panel

Rule 5: HTML Pages
  URL: *twinmos.com/*
  Cache Level: Cache Everything
  Edge Cache TTL: 1 hour
  Browser Cache TTL: 0
  # Stale-while-revalidate handled by origin
```

### 3.3 Service Worker (Phase 2)

Workbox-based service worker for offline-friendly experience:

```typescript
// src/sw.ts
import { precacheAndRoute } from 'workbox-precaching';
import { StaleWhileRevalidate } from 'workbox-strategies';
import { registerRoute } from 'workbox-routing';

// Precache critical pages (homepage, support, contact)
precacheAndRoute(self.__WB_MANIFEST);

// Cache images with stale-while-revalidate
registerRoute(
  ({ request }) => request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: 'images',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// Cache fonts
registerRoute(
  ({ request }) => request.destination === 'font',
  new CacheFirst({
    cacheName: 'fonts',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
      }),
    ],
  })
);
```

---

## 4. CDN / Edge Caching Strategy

### 4.1 Cloudflare Edge Cache

Cloudflare Pages (frontend) + Cloudflare CDN (assets) provides caching at 300+ global PoPs.

| Content Type | Edge TTL | Browser TTL | Purge Strategy |
|-------------|----------|-------------|----------------|
| **Static HTML** (about, legal, learn) | 24 hours | 0 | Manual purge on deploy |
| **ISR HTML** (news, events, products) | 1 hour | 60 seconds | Webhook purge on content update |
| **Assets** (CSS, JS, fonts, images) | 1 year | 1 year | Never; use versioned URLs |
| **ImgProxy images** | 24 hours | 24 hours | Automatic on source change |
| **OSM tiles** | 24 hours | 24 hours | N/A |

### 4.2 ISR (Incremental Static Regeneration)

For dynamic content that changes frequently but doesn't need real-time updates:

```ts
// astro.config.ts
export default defineConfig({
  output: 'static',
  // ISR via Cloudflare Workers + Strapi webhooks
});
```

```ts
// pages/news/[slug].astro
export const prerender = true;

// Revalidation triggered by Strapi webhook
// Cloudflare Worker handles cache invalidation
```

**ISR Revalidation Flow:**

```
1. Content editor publishes article in Strapi
2. Strapi webhook fires to Cloudflare Worker
3. Worker purges cache for /news/article-slug/ and /news/
4. Next request triggers Astro rebuild (or serves stale briefly)
5. Fresh HTML served from edge within seconds
```

### 4.3 Cache Invalidation

| Trigger | Action | Tool |
|---------|--------|------|
| **New deployment** | Purge all HTML + API cache | GitHub Action → Cloudflare API |
| **Content publish** | Purge specific URL + parent listing | Strapi webhook → Cloudflare Worker |
| **Product update** | Purge PDP + category pages | Strapi lifecycle hook |
| **Price list update (P2)** | Purge partner portal pages | Manual admin action |
| **Emergency fix** | Full purge | Cloudflare dashboard |

---

## 5. Application-Level Caching

### 5.1 Astro Build Cache

Astro 5 incremental builds cache the Content Layer parsing:

```ts
// astro.config.ts
export default defineConfig({
  vite: {
    build: {
      // Enable incremental build caching
      emptyOutDir: false,
    },
  },
});
```

**Build cache behavior:**
- Markdown files are hashed; only changed files trigger rebuild
- Unchanged pages reuse previous output
- Build time target: < 5 minutes for full 287-page build

### 5.2 Strapi REST API Caching (Phase 2 — Redis)

```ts
// config/middlewares.ts
export default [
  // ...
  {
    name: 'strapi::caching',
    config: {
      enabled: true,
      type: 'redis',
      redis: {
        host: 'localhost',
        port: 6379,
      },
      maxAge: 300, // 5 minutes default
      models: {
        'api::product.product': { maxAge: 600 },      // 10 min
        'api::retailer.retailer': { maxAge: 3600 },   // 1 hour
        'api::news-article.news-article': { maxAge: 300 }, // 5 min
        'api::compatibility.compatibility': { maxAge: 3600 }, // 1 hour
      },
    },
  },
];
```

### 5.3 Strapi Query Optimization

Even without Redis (Phase 1), Strapi benefits from:

| Optimization | Implementation | Impact |
|-------------|---------------|--------|
| **Selective fields** | `?fields=name,slug,price` | Smaller response payload |
| **Population depth limit** | `?populate[category][fields][0]=name` | Avoids deep nested queries |
| **Pagination** | `?pagination[pageSize]=25` | Bounded result sets |
| **Database indexes** | Index on `slug`, `sku`, `locale` | Faster lookups |

---

## 6. Database Caching

### 6.1 PostgreSQL Configuration

```ini
# postgresql.conf (Hetzner CX32)
shared_buffers = 2GB                    # 25% of RAM
effective_cache_size = 6GB              # 75% of RAM
work_mem = 16MB                         # Per-operation
maintenance_work_mem = 256MB            # VACUUM, CREATE INDEX
random_page_cost = 1.1                  # SSD-optimized
```

### 6.2 Query Result Caching (Redis Phase 2)

Hot queries cached in Redis:

| Query | Cache Key | TTL | Hit Rate |
|-------|----------|-----|----------|
| Product list (default sort) | `products:list:default` | 10 min | ~85% |
| Product detail by slug | `products:detail:{slug}` | 10 min | ~90% |
| Retailer list by country | `retailers:country:{code}` | 1 hour | ~95% |
| Compatibility by motherboard | `compat:mb:{model}` | 1 hour | ~80% |
| Category tree | `categories:tree` | 1 hour | ~99% |

### 6.3 Cache Warming

On deployment or cache purge, pre-populate hot caches:

```bash
# scripts/warm-cache.sh
# Fetch top 20 products, all categories, all countries

curl -s "https://api.twinmos.com/api/products?pagination[pageSize]=20" > /dev/null
curl -s "https://api.twinmos.com/api/categories" > /dev/null
curl -s "https://api.twinmos.com/api/retailers" > /dev/null
```

---

## 7. Image & Asset Caching

### 7.1 ImgProxy Caching

| Layer | TTL | Notes |
|-------|-----|-------|
| **ImgProxy processed cache** | 1 year | On-disk; keyed by URL + processing params |
| **ImgProxy source cache** | 1 year | Original from B2 |
| **Cloudflare edge** | 24 hours | For processed images |
| **Browser** | 24 hours | `Cache-Control: max-age=86400` |

### 7.2 Asset Versioning

All build-time assets use content hashing:

```
/_astro/hero.abc123.webp       # Hash changes on content change
/_astro/main.def456.css        # Hash changes on CSS change
/_astro/island.ghi789.js       # Hash changes on JS change
```

When content changes, the filename changes, forcing browsers and CDNs to fetch the new version. Old versions remain cached but are no longer referenced.

---

## 8. Cache Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| **CDN cache hit ratio** | > 95% | Cloudflare Analytics |
| **HTML edge TTFB** | < 50 ms | WebPageTest |
| **Asset edge TTFB** | < 20 ms | WebPageTest |
| **API cache hit ratio (P2)** | > 80% | Redis INFO stats |
| **Browser cache reuse** | > 90% | Chrome DevTools Network |
| **ISR revalidation time** | < 5 seconds | Synthetic monitoring |

---

## 9. Monitoring & Alerting

### 9.1 Cache Metrics Dashboard

| Metric | Source | Alert |
|--------|--------|-------|
| Cache hit ratio | Cloudflare Analytics | < 90% |
| Edge response time | Cloudflare Analytics | > 100 ms (95th percentile) |
| Origin requests | Cloudflare Analytics | Spike > 200% baseline |
| Redis memory usage | Coolify / Redis CLI | > 80% |
| Cache purges | Cloudflare API logs | Failed purge |

### 9.2 Debugging Cache Issues

```bash
# Check Cloudflare cache status for a URL
curl -I -H "CF-Cache-Status: HIT" https://twinmos.com/

# Check browser cache headers
curl -I https://twinmos.com/_astro/hero.abc123.webp

# Force bypass cache
curl -H "Cache-Control: no-cache" https://twinmos.com/

# Check Redis cache (Phase 2)
redis-cli KEYS "products:*" | wc -l
```

---

## 10. Disaster Recovery & Cache Implications

| Scenario | Cache Impact | Recovery Action |
|----------|-------------|----------------|
| **CDN failure** | All edge cache lost | Origin serves directly; TTFB increases but site remains up |
| **Origin failure** | Stale content served | Cloudflare serves cached HTML/images for TTL duration |
| **Cache poisoning** | Bad data in cache | Full purge + verify origin data |
| **Redis failure (P2)** | API cache lost | Strapi serves from DB; slower but functional |
| **Deployment rollback** | Old assets referenced | Rollback includes reverting to previous hashed assets |

---

## 11. Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 1 May 2026 | TwinMOS Digital Transformation Team | Initial draft |
| 1.0 | 1 May 2026 | TwinMOS Digital Transformation Team | Final strategy with Cloudflare config |

---

## 12. References

- Tech Stack §19.5 — CDN (Cloudflare)
- Tech Stack §22.2 — API Performance Targets
- BRD §20.2 — API Performance
- BRD §23.3 — Disaster Recovery (RTO/RPO)
- Implementation Strategy v3.0 §11.1 — Performance gates
- `TwinMOSWebsitePerformance_Budget.md`
- `TwinMOSWebsiteImageOptimizationSpec.md`
