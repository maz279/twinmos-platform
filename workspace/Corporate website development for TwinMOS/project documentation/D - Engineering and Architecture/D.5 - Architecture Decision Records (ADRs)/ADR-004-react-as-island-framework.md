# ADR-004: React 19 as the Astro Island Framework

| Field | Value |
|-------|-------|
| **ADR Number** | ADR-004 |
| **Date** | 2026-04-01 |
| **Status** | Accepted |
| **Deciders** | Engineering Lead |
| **Source** | Tech Stack §4.1, §4.5 |

---

## 1. Context

Astro supports multiple UI frameworks for interactive islands: React, Preact, Vue, Svelte, Solid.js, Lit. The project requires 18 interactive island components (SearchBar, ProductFilter, CompatibilityFinder, WhereToBuyLocator, ContactForm, WarrantyRegistration, RMARequest, RGBVisualizer, ChatwootWidget, etc.).

We need to choose a single UI framework for all islands (mixing frameworks increases JS bundle size unnecessarily and creates split team expertise).

---

## 2. Decision

**We will use React 19 as the UI framework for all 18 Astro islands.**

---

## 3. Rationale

### Primary Reasons

1. **Team familiarity:** The 2-developer team has existing React experience. Using React eliminates the need to learn a new framework alongside learning Astro.

2. **Ecosystem — library availability:** Several required libraries have first-class React support:
   - MeiliSearch: `react-instantsearch` — React bindings for search UI
   - Maps: `react-leaflet` — React bindings for Leaflet/OpenStreetMap
   - Forms: `react-hook-form` — React form management with Zod resolver
   - Turnstile: Available as React component wrappers
   - Sentry: `@sentry/react` for component error boundaries

3. **React 19 features:** Concurrent rendering, Server Components (future), improved hydration performance — all beneficial for island architecture.

4. **Long-term maintainability:** React is the most widely used frontend framework. Future team members are more likely to know React than Svelte or Solid.js.

5. **Medusa.js (Phase 3):** Medusa's Storefront UI is React-based. Using React for all islands ensures consistency when the checkout flow (a React island) is added in Phase 3.

---

## 4. Alternatives Considered

| Framework | Bundle Size | Reason Not Chosen |
|-----------|-------------|------------------|
| **Svelte** | ~7 KB (tiny!) | Team would need to learn Svelte; fewer library options (no react-leaflet, no react-instantsearch) |
| **Preact** | ~3 KB (React subset) | react-hook-form, react-leaflet have occasional compatibility issues with Preact; small savings not worth incompatibility risk |
| **Solid.js** | ~7 KB | Excellent performance but smaller community; react-leaflet not available; team learning cost |
| **Vue 3** | ~34 KB | Team knows React, not Vue; duplicate learning; fewer cross-compatible libraries |
| **Lit** | ~5 KB | Web Components approach good for simple widgets but not for complex form/map islands; poor TypeScript DX for this team |

**React trade-off acknowledged:** React's base bundle (~45 KB) is larger than Svelte or Solid.js. However:
- Islands are lazy-loaded by default (not blocking page render)
- React is only loaded for pages that include islands
- Product listing pages (no islands) ship zero JS
- The ~45 KB is shared across all islands on a given page (loaded once)

With 18 islands across many page types, the amortised per-page cost of React is acceptable.

---

## 5. Consequences

### Positive
- No framework learning curve for the team
- Largest ecosystem of React-specific libraries available
- Consistent DX across Astro islands and Medusa.js storefront (Phase 3)
- `@sentry/react` ErrorBoundary available for island error catching

### Negative / Trade-offs
- React 45 KB base bundle vs Svelte ~7 KB — **mitigated** by lazy loading islands
- React 19 concurrent features add some complexity (use with caution)
- `client:only="react"` required for some browser-only components (Leaflet, Chatwoot)

---

## 6. Implementation Notes

**Astro React integration:**
```bash
npx astro add react
```

This installs `@astrojs/react` and adds React 19 + `react-dom` to dependencies.

**Island syntax:**
```astro
---
import SearchBar from '../components/islands/SearchBar';
---
<!-- Hydrate when idle (non-critical) -->
<SearchBar client:idle />

<!-- Hydrate when visible (below fold) -->
<WhereToBuyLocator client:visible />

<!-- Hydrate immediately (above fold, critical) -->
<HeaderNavigation client:load />

<!-- Browser only (uses window/document) -->
<WhereToBuyLocator client:only="react" />
```

---

## 7. Related ADRs

- ADR-002: Architecture Patterns (SSG + Islands)
- ADR-003: Folder Structure (`components/islands/`)
- ADR-001: Stack Selection
