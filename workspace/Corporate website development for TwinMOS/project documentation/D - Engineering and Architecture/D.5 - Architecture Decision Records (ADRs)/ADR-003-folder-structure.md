# ADR-003: Folder Structure — Astro Frontend + Strapi Backend Layout

| Field | Value |
|-------|-------|
| **ADR Number** | ADR-003 |
| **Date** | 2026-04-01 |
| **Status** | Accepted |
| **Deciders** | Engineering Lead |
| **Source** | Tech Stack §3.2; LLD §3 |

---

## 1. Context

The project has two repositories: `twinmos-website-frontend` (Astro) and `twinmos-website-backend` (Strapi). Each repo needs an internal folder structure that supports the project's scale (287 content entries, 100+ products, 9 locales, 18 interactive islands) while remaining maintainable by a 2-developer team.

---

## 2. Decision

**We will use the following folder structures for each repository.**

### Frontend (`twinmos-website-frontend`)

```
twinmos-website-frontend/
├── public/                    # Static assets (favicon, robots.txt, fonts)
│   ├── fonts/
│   └── images/site-wide/
├── src/
│   ├── components/
│   │   ├── islands/           # React island components (18 interactive components)
│   │   │   ├── HeaderNavigation.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── ProductFilter.tsx
│   │   │   ├── CompatibilityFinder.tsx
│   │   │   ├── WhereToBuyLocator.tsx
│   │   │   ├── ContactForm.tsx
│   │   │   ├── WarrantyRegistration.tsx
│   │   │   ├── RMARequest.tsx
│   │   │   ├── RGBVisualizer.tsx
│   │   │   └── ...
│   │   ├── ui/               # Pure Astro UI components (no JS)
│   │   │   ├── Button.astro
│   │   │   ├── Card.astro
│   │   │   ├── ProductCard.astro
│   │   │   └── ...
│   │   └── shared/           # Components used across multiple layouts
│   ├── layouts/
│   │   ├── LayoutBase.astro       # HTML shell, meta, scripts
│   │   ├── LayoutHero.astro       # Pages with hero image
│   │   ├── LayoutContent.astro    # Standard content pages
│   │   ├── LayoutProductDetail.astro  # 100+ SKU pages
│   │   ├── LayoutLegal.astro      # 34 legal pages
│   │   ├── LayoutForm.astro       # 16+ form pages
│   │   ├── LayoutLocator.astro    # Where-to-buy, offices
│   │   ├── LayoutCatalog.astro    # Category browsing
│   │   └── LayoutComparison.astro # Product comparison
│   ├── pages/
│   │   ├── index.astro            # Homepage
│   │   ├── about/
│   │   ├── products/
│   │   │   ├── index.astro
│   │   │   ├── memory/
│   │   │   ├── ssd/
│   │   │   └── [slug].astro       # Dynamic SKU pages
│   │   ├── solutions/
│   │   ├── support/
│   │   ├── where-to-buy/
│   │   ├── news/
│   │   ├── contact/
│   │   ├── legal/
│   │   ├── [lang]/                # Locale-prefixed routes (ar, bn, hi, etc.)
│   │   └── api/                   # Astro API routes (minimal)
│   ├── content/
│   │   └── collections/           # Astro Content Layer collections (local Markdown)
│   │       └── config.ts          # Zod schemas for local content
│   ├── lib/
│   │   ├── strapi.ts              # Strapi API client
│   │   ├── analytics.ts           # Plausible + GA4 helpers
│   │   ├── auth.ts                # Better Auth client (Phase 3)
│   │   └── utils.ts               # Shared utilities
│   ├── styles/
│   │   ├── global.css             # Tailwind base + custom properties
│   │   └── rtl.css                # RTL overrides for Arabic
│   └── i18n/
│       ├── en.json                # Translation strings (UI labels)
│       ├── ar.json
│       └── ...
├── astro.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── sentry.client.config.ts
├── sentry.server.config.ts
└── package.json
```

### Backend (`twinmos-website-backend`)

```
twinmos-website-backend/
├── config/
│   ├── database.ts            # PostgreSQL connection
│   ├── plugins.ts             # Strapi plugin config (i18n, upload, users-permissions)
│   ├── middlewares.ts         # Middleware stack
│   └── cron.ts                # Scheduled jobs (ERP sync)
├── src/
│   ├── api/                   # Strapi content types (auto-generated + custom)
│   │   ├── product/
│   │   │   ├── content-types/product/schema.json
│   │   │   ├── controllers/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   └── lifecycles.ts  # afterCreate, afterUpdate hooks
│   │   ├── category/
│   │   ├── brand/
│   │   ├── form-submission/
│   │   ├── warranty-registration/
│   │   ├── rma-request/
│   │   ├── serial-number/
│   │   ├── distributor/
│   │   ├── retailer/
│   │   ├── news-article/
│   │   ├── content-page/
│   │   └── regional-page/
│   ├── services/              # Business logic services
│   │   ├── emailService.ts    # Resend integration
│   │   ├── crmService.ts      # HubSpot integration
│   │   ├── searchService.ts   # MeiliSearch integration
│   │   ├── analyticsService.ts # GA4 Measurement Protocol
│   │   └── erpSyncService.ts  # ERP sync (Phase 2)
│   ├── middlewares/           # Custom Koa middleware
│   │   ├── apiVersioning.ts
│   │   ├── rateLimiter.ts
│   │   ├── errorHandler.ts    # RFC 9457 error format
│   │   └── verifyTurnstile.ts
│   ├── emails/
│   │   └── templates/         # React Email templates
│   │       ├── contact-confirmation.tsx
│   │       ├── warranty-registered.tsx
│   │       └── ...
│   └── index.ts               # Strapi register/bootstrap hooks (Sentry init)
├── database/
│   └── migrations/            # Knex SQL migrations
├── public/
└── package.json
```

---

## 3. Rationale

### Key Structural Decisions

1. **`src/components/islands/` separate from `src/components/ui/`:** Island components carry client-side React code and hydration directives. Separating them makes the JS budget visible — any file in `islands/` contributes to client bundle size.

2. **`src/lib/strapi.ts` centralises all API calls:** A typed Strapi client prevents API endpoint strings from being scattered across 287 pages. All fetch logic, caching headers, and error handling is in one place.

3. **`src/pages/[lang]/` for locale prefixes:** Astro's i18n routing generates `/ar/`, `/bn/`, etc. as subdirectories. Default locale (EN) has no prefix (`/` not `/en/`).

4. **`src/services/` in Strapi backend:** Business logic (email sending, CRM push, search indexing) lives in the service layer, not in lifecycle hooks or controllers, for testability and reuse.

5. **`src/emails/templates/` in Strapi:** React Email templates are co-located with the email service that uses them — not in a separate package.

---

## 4. Alternatives Considered

| Option | Reason Not Chosen |
|--------|------------------|
| Flat `src/components/` (no islands/ subfolder) | Makes JS budget invisible; harder to audit what gets shipped to browser |
| Separate `packages/` monorepo for shared types | Premature — 2-dev team; shared TypeScript types managed via import instead |
| `pages/[locale]/[...rest]` for all routes | Makes default locale (EN) require `/en/` prefix — bad for SEO and existing URL assumptions |

---

## 5. Consequences

### Positive
- Clear separation of interactive (islands) vs static (ui) components
- Centralised API client — one place to add caching, error handling, type changes
- Service layer in Strapi makes integration code testable in isolation

### Negative / Trade-offs
- More directories to navigate vs. flat structure — mitigated by IDE file search

---

## 6. Related ADRs

- ADR-001: Stack Selection
- ADR-008: Monorepo vs Multi-repo
- [TwinMOSWebsiteLLDLowLevel_Design.md](../D.1 - Design Documents/TwinMOSWebsiteLLDLowLevel_Design.md)
