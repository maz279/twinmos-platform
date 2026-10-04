# ADR-002: Core Architecture Patterns — SSG + Islands + API-First

| Field | Value |
|-------|-------|
| **ADR Number** | ADR-002 |
| **Date** | 2026-04-01 |
| **Status** | Accepted |
| **Deciders** | Engineering Lead |
| **Source** | Tech Stack §3, §3.3; HLD §2 |

---

## 1. Context

Having selected Strapi v5 + Astro 5 (ADR-001), the team needs to define the **architectural patterns** for how content is fetched, rendered, and delivered to end users. Three fundamental patterns must be decided:

1. **When is content rendered?** (Build time vs. request time vs. client side)
2. **How much JavaScript reaches the browser?** (Full SPA vs. selective hydration)
3. **How does the frontend communicate with the CMS?** (Coupled vs. headless)

The project has hard requirements:
- Lighthouse score ≥90 (high performance mandate)
- LCP ≤1.8s (fast content paint)
- Marketing team can publish without developer intervention (ISR needed)
- 287+ content entries, 100+ product pages (large content graph)
- Budget: No runtime server for frontend (Cloudflare Pages static hosting)

---

## 2. Decision

**We will use three complementary architectural patterns:**

1. **Static-First (SSG):** All pages are pre-rendered at build time as static HTML. No runtime server for the Astro frontend.
2. **Astro Islands:** Interactive components are React islands hydrated selectively in the browser. Default is zero JavaScript — islands opt-in with `client:*` directives.
3. **API-First Headless CMS:** Astro fetches data from Strapi REST API at build time (SSG) or via Strapi ISR webhooks. No direct database access from frontend.

Incremental Static Regeneration (ISR):
- News articles, events: 60-second revalidation
- Product SKU pages: webhook-triggered revalidation on publish
- All other pages: full rebuild on major structural changes

---

## 3. Rationale

### Why SSG over SSR

| Concern | SSG Approach | SSR Approach |
|---------|-------------|-------------|
| Performance | Pre-built HTML served from CDN edge — **fastest possible TTFB (<50ms)** | Server compute on every request — TTFB 200-500ms |
| Scalability | CDN handles any traffic spike (no origin overwhelm) | Server must scale with traffic |
| Cost | Cloudflare Pages free (unlimited bandwidth) | Requires server runtime ($$) |
| SEO | Full HTML available for crawlers immediately | Dependent on SSR implementation |
| Cache invalidation | Webhook-triggered rebuild of changed pages | Cache headers + purge |
| Downtime during Strapi maintenance | **Site stays up** (static files serve from CDN) | Site fails if origin down |

**Conclusion:** SSG is the correct pattern for TwinMOS's primarily-static content (products, about, technology, legal, regional pages). The site is a marketing/product information site — not a real-time application.

### Why Astro Islands over Full SPA

The page weight budget is strict (total JS ≤1.5 MB, islands ≤150 KB). A full React SPA would ship ~200+ KB of framework JS on every page regardless of whether any interactive feature is used. Astro's island architecture means:

- Static product listing page: **0 KB JS**
- Product detail page with compatibility finder island: **~20 KB JS** (just the island)
- Homepage with header navigation island: **~15 KB JS** (just navigation)

Total interactive islands: 18 components (SearchBar, ProductFilter, CompatibilityFinder, WhereToBuyLocator, ContactForm, WarrantyRegistration, RMARequest, RGBVisualizer, etc.)

### Why API-First / Headless

- Content and presentation are decoupled → marketing team can update content in Strapi CMS without any code changes or deployments
- Strapi API can serve multiple consumers: Astro frontend, mobile apps (future), partner integrations
- No database credentials in frontend code
- Strapi's built-in content preview, draft/publish workflow, and version history available via admin panel

---

## 4. Alternatives Considered

| Option | Reason Not Chosen |
|--------|------------------|
| **Server-Side Rendering (SSR)** | Requires always-on Node.js server; increases cost; reduces performance vs edge-cached SSG; overkill for marketing content |
| **Full React SPA (CSR)** | Poor SEO; poor initial load performance; crawlers struggle with client-rendered content; >200KB framework JS overhead |
| **Mixed SSR/SSG (Next.js ISR)** | Requires Vercel or custom server runtime; adds cost; SSG + webhook revalidation achieves same freshness at lower cost |
| **Fully static (no CMS)** | Marketing team cannot update content; requires developer for every text change; unacceptable for business operations |
| **Tightly-coupled CMS** (WordPress) | Frontend and backend share same process; no API; hard to scale independently; performance constraints |

---

## 5. Consequences

### Positive
- Cloudflare Pages edge delivery: ~50ms TTFB globally for static assets
- Lighthouse ≥90 achievable without aggressive optimisation
- Site remains available during CMS maintenance/downtime
- Marketing can publish content changes without engineering involvement
- No server runtime = no server vulnerabilities in frontend
- CDN caches handle traffic spikes automatically

### Negative / Trade-offs
- Build time: ~8-12 minutes for full 3,500-route build (Phase 3). Mitigated by:
  - Incremental builds (only changed pages rebuilt)
  - ISR for frequently-changing pages (news, events)
  - Cloudflare Pages preview deployments for testing
- Personalised content (user-specific pricing, logged-in state): handled via **Astro Server Islands** (`server:defer`) — fetched after initial page load
- Build must be triggered when content changes — webhook automation required

### Neutral
- Build-time data fetching means all content is "as of last build" — maximum 60s stale for ISR pages, same-day for others

---

## 6. Implementation Notes

**SSG Configuration (`astro.config.ts`):**
```typescript
export default defineConfig({
  output: 'static',
  adapter: cloudflare(),
});
```

**ISR pages (60s revalidation):**
```typescript
// src/pages/news/[slug].astro
export const prerender = false;  // Not pre-rendered
export const revalidate = 60;    // Revalidate every 60 seconds
```

**Island hydration strategies:**
- `client:load` — HeaderNavigation (needed immediately)
- `client:idle` — ChatwootWidget (non-critical)
- `client:visible` — WhereToBuyLocator, ProductFilter (only when scrolled into view)
- `client:media="(max-width: 768px)"` — Mobile-specific islands

---

## 7. Related ADRs & Documents

- ADR-001: Stack Selection — Strapi v5 + Astro 5
- ADR-004: React as Island Framework
- ADR-006: Cloudflare Pages vs Vercel
- [TwinMOSWebsiteHLDHighLevel_Design.md](../D.1 - Design Documents/TwinMOSWebsiteHLDHighLevel_Design.md)
- [TwinMOSWebsiteComponent_Architecture.md](../D.1 - Design Documents/TwinMOSWebsiteComponent_Architecture.md)
