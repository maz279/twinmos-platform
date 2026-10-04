# ADR-001: Stack Selection — Strapi v5 + Astro 5

| Field | Value |
|-------|-------|
| **ADR Number** | ADR-001 |
| **Date** | 2026-04-01 |
| **Status** | Accepted |
| **Source** | Tech Stack §2; Tech Stack §2.2 (RFP Divergence); Forensic Audit findings |

---

## 1. Context

The TwinMOS website forensic audit (April 2026) found the existing site critically broken: 404 errors on most pages, server failures, broken product images, no mobile optimisation, zero of 14 standard tier-1 features (comparison tools, warranty portal, distributor locator, etc.). A **complete rebuild** is required — incremental fixes are not viable.

The project RFP §6.1 suggested a "conceptual" stack of **Next.js + Contentful CMS** as a starting point. Before committing to this, the engineering team evaluated the full requirements:

- 287 distinct content entries at launch (expandable)
- 100+ product SKU pages
- 9 supported locales (Phase 3)
- ~3,500 static build routes at full localisation
- Performance target: Lighthouse ≥90, LCP ≤1.8s
- Cost target: <$25/month Phase 1 backend infrastructure
- Team: 2 developers, no dedicated DevOps
- Content management: Marketing team must publish without developer involvement

The RFP was a conceptual starting point, not a binding specification. Per §6.1, "the vendor may propose alternative approaches if technically superior."

---

## 2. Decision

**We will use Strapi v5 Community Edition (headless CMS) for the backend and Astro 5 (static site generator with React islands) for the frontend**, deployed as two separate repositories on Cloudflare Pages (frontend) and Hetzner VPS + Coolify (backend).

This replaces the RFP's conceptual suggestion of Next.js + Contentful.

---

## 3. Rationale

### Why Astro 5 over Next.js

| Criterion | Astro 5 | Next.js 15 |
|-----------|---------|-----------|
| Default output | **SSG (static)** | SSR/SSG hybrid |
| JS shipped to client | **~0 KB (zero-JS default)** | Significant React runtime |
| Island architecture | **Built-in (`client:*` directives)** | Manual with React Server Components |
| Lighthouse score potential | **Excellent** (no framework JS overhead) | Good but requires more optimisation |
| Multi-framework islands | Yes (React, Svelte, Vue, Solid) | React only |
| Build time (3,500 routes) | ~8-12 minutes | ~15-25 minutes |
| Learning curve | Moderate | Low (team knows React) |
| Cost of hosting static output | **$0 on Cloudflare Pages** | Next.js ISR requires Vercel or custom server |

### Why Strapi v5 CE over Contentful

| Criterion | Strapi v5 CE | Contentful |
|-----------|-------------|-----------|
| Licensing | **$0 (open source MIT)** | $300-900+/month at scale |
| Self-hosted | **Yes — full data sovereignty** | No (SaaS only) |
| Custom content types | **Unlimited** | Limited on free; expensive on paid |
| API | REST + GraphQL (optional) | REST + GraphQL |
| i18n | **Built-in** (Unified Document System) | Built-in but expensive |
| Roles & permissions | **Granular RBAC** | Basic on free tier |
| Vendor lock-in | **None** — data in own PostgreSQL | High |
| Operational cost (Phase 1) | **~$14/mo** (Hetzner CX32) | $300+/mo for comparable features |

### Why the RFP Stack Was Rejected

The RFP §6.1 Conceptual stack (Next.js + Contentful) would have cost:
- Contentful: $300+/month (for 9 locales + custom content types needed)
- Vercel for Next.js: $20/seat/month + ISR costs
- **Total: ~$350+/month vs $14-27/month** for chosen stack

At 10x the cost with no material quality advantage for this use case, the RFP conceptual stack does not serve TwinMOS's interests.

---

## 4. Alternatives Considered

| Option | Reason Not Chosen |
|--------|------------------|
| **Next.js + Contentful** (RFP) | 10x cost difference; Contentful vendor lock-in; Next.js ships unnecessary JS for primarily-static content |
| **Next.js + Strapi** | Next.js SSR requires server hosting ($); Astro SSG + Cloudflare Pages is free for frontend; no compelling reason for Next.js over Astro for this content type |
| **WordPress** | Poor developer experience; PHP ecosystem; security maintenance burden; lacks modern API-first approach; performance requires significant effort |
| **Sanity + Next.js** | Sanity $250+/month for 9 locales + large media; similar cost issues to Contentful |
| **Hugo + Forestry** | Hugo fast but no React support; limited interactive island capability; limited partner for the development team |
| **Webflow** | No-code tool insufficient for custom Strapi integration, compatibility finder, RMA portal |

---

## 5. Consequences

### Positive
- Phase 1 backend cost: **<$15/month** (Hetzner CX32 + Cloudflare Pages free tier)
- Phase 3 backend cost: **<$27/month** (Hetzner CX42 upgrade)
- Zero vendor lock-in: all data in own PostgreSQL, code in own git repos
- Marketing team can publish content via Strapi admin without developer involvement
- Lighthouse ≥90 target is achievable with SSG + zero-JS-default approach
- Arabic RTL support: Astro generates RTL-correct HTML; Strapi stores per-locale content

### Negative / Trade-offs
- Two-repository architecture (frontend + backend) adds complexity vs. a monorepo
- Strapi at >100k API requests/day without Redis caching may become slow (mitigated: Redis added in Phase 2)
- Astro build time grows with content (~8-12 min at 3,500 routes Phase 3) — acceptable with CI/CD caching
- Team must learn Astro (new framework) — mitigated by Astro's excellent documentation and React compatibility

### Neutral
- Strapi v5 "Unified Document System" is a breaking change from v4 — no migration from existing Strapi data needed (fresh project)

---

## 6. Implementation Notes

- Strapi v5 requires Node.js ≥18. Deploy on Hetzner CX32 using Coolify (Docker-based PaaS).
- Astro 5 Content Layer must be used for type-safe content schemas (`defineCollection` + Zod).
- Strapi's built-in i18n plugin must be enabled from day one (Phase 1 EN only, but schema must support multi-locale from the start).
- Frontend repo: `twinmos-website-frontend`; Backend repo: `twinmos-website-backend`

---

## 7. Related ADRs & Documents

- ADR-002: Architecture Patterns (SSG + Islands)
- ADR-003: Folder Structure (two-repo)
- ADR-008: Monorepo vs Multi-repo
- [TwinMOSWebsiteHLDHighLevel_Design.md](../D.1 - Design Documents/TwinMOSWebsiteHLDHighLevel_Design.md)
- Tech Stack §2 — Full evaluation matrix
