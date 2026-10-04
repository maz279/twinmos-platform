# ADR-009: Internationalisation — Hybrid Strapi i18n + Astro i18n Routing

| Field | Value |
|-------|-------|
| **ADR Number** | ADR-009 |
| **Date** | 2026-04-15 |
| **Status** | Accepted |
| **Deciders** | Engineering Lead |
| **Source** | Tech Stack §11 |

---

## 1. Context

TwinMOS serves 93+ countries and requires multilingual support:

| Phase | Locales | Launch Window |
|-------|---------|--------------|
| Phase 1 | EN (English) | Months 1–5 |
| Phase 2 | + AR (Arabic RTL), BN (Bengali), HI (Hindi) | Months 6–9 |
| Phase 3 | + RU (Russian), ZH-CN (Simplified Chinese), FR (French) | Months 10–15 |
| Phase 4 | + ES (Spanish), PT (Portuguese), DE (German) | Month 16+ |

**9 total locales.** At Phase 3: ~3,500 pre-rendered routes (287 pages × 9 locales + some locale-specific pages × remaining locales).

The question is: **where does internationalisation live** — in Strapi (content layer), in Astro (routing layer), or both?

---

## 2. Decision

**We will use a hybrid i18n strategy:**

1. **Strapi v5 built-in i18n plugin** — manages translated content (text, titles, descriptions, SEO metadata) per locale. Single entity with multiple locale versions.
2. **Astro i18n routing** — manages URL structure, locale detection, `hreflang` sitemap generation, and locale-specific layout adjustments (RTL for Arabic).

These two layers are complementary and each handles what it does best.

---

## 3. Rationale

### Why Strapi for Content Translation

Strapi v5's Unified Document System was redesigned specifically to handle multilingual content:

- **One entity, multiple locale versions:** A product has one Strapi document with EN, AR, BN versions — not three separate products
- **Per-locale draft/publish:** Arabic content can be reviewed and published independently of EN
- **Version history per locale:** Strapi tracks content changes per locale
- **Marketing team workflow:** Translators use Strapi's admin panel (or export CSV for translation vendor)
- **Fallback locale:** If AR translation missing, Strapi returns EN fallback

Putting translation strings in Astro (JSON files) for CMS content would mean duplicating all Strapi content in the frontend repo — a maintenance nightmare with 287+ entries.

### Why Astro for URL Routing

Astro's i18n routing handles:
- **URL structure:** `/` (EN default, no prefix), `/ar/`, `/bn/`, `/hi/`, etc.
- **`hreflang` tag generation:** Automatically generates correct `<link rel="alternate" hreflang="ar" href="/ar/...">` in `<head>`
- **Sitemap generation:** `@astrojs/sitemap` with `i18n` config generates proper multilingual sitemap
- **RTL detection:** Astro knows current locale → layout applies `dir="rtl"` for AR
- **UI strings:** Navigation labels, button text, form placeholders (not CMS content) — these live in JSON translation files in the frontend repo

### Separation of Concerns

| Content Type | Managed By | Reason |
|-------------|-----------|--------|
| Product names, descriptions, specs | Strapi i18n | CMS content |
| News articles, legal pages, about pages | Strapi i18n | CMS content |
| Navigation labels ("Products", "Support") | Astro i18n JSON | UI string, not CMS content |
| Form field labels, validation messages | Astro i18n JSON | UI string |
| URL routes | Astro i18n | Frontend routing concern |
| `hreflang` sitemap | Astro | Build-time SEO output |

---

## 4. Alternatives Considered

| Option | Reason Not Chosen |
|--------|------------------|
| **Strapi-only i18n (flat JSON per locale in Strapi)** | Would require Strapi to serve UI strings (navigation labels, form placeholders) — not CMS content. Blurs separation of concerns. |
| **Astro-only i18n (translate everything in JSON files)** | Would require copying all Strapi content into frontend JSON files — impossible to maintain at 287+ entries; marketing team can't edit JSON |
| **Separate Strapi instances per locale** | Extreme complexity; no content reuse; 9x operational overhead |
| **i18n routing library (react-i18next)** | Would work for SPA but TwinMOS is SSG — Astro's built-in i18n is simpler and better integrated |

---

## 5. Consequences

### Positive
- Marketing team translates CMS content (products, pages) via Strapi admin
- Developers manage UI strings (navigation, labels) in frontend JSON files
- Astro automatically generates correct `hreflang` tags and multilingual sitemaps
- Arabic RTL rendering handled at build time by Astro layout (`dir="rtl"`)
- Each locale can be published independently — no "publish all locales at once" requirement

### Negative / Trade-offs
- Two systems to understand (Strapi i18n + Astro i18n) — **mitigated** by clear documentation of which layer handles which concern
- Phase 2 Arabic RTL requires CSS audit of all components — Tailwind's `rtl:` variant handles most cases
- Build time at full localization (~3,500 routes Phase 3): ~8-12 minutes — acceptable with CI/CD incremental builds

---

## 6. Implementation Notes

**Astro i18n config (`astro.config.ts`):**
```typescript
export default defineConfig({
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ar', 'bn', 'hi', 'ru', 'zh-cn', 'fr', 'es', 'pt', 'de'],
    routing: {
      prefixDefaultLocale: false,  // /products (not /en/products)
      fallback: {
        ar: 'en',
        bn: 'en',
        hi: 'en',
        ru: 'en',
        'zh-cn': 'en',
        fr: 'en',
      },
    },
  },
});
```

**Strapi API call with locale:**
```typescript
const product = await fetch(
  `${STRAPI_URL}/api/products/${slug}?locale=${currentLocale}&populate=...`
);
```

**Arabic RTL layout:**
```astro
---
const isRTL = Astro.currentLocale === 'ar';
---
<html lang={Astro.currentLocale} dir={isRTL ? 'rtl' : 'ltr'}>
```

---

## 7. Related ADRs

- ADR-001: Stack Selection
- ADR-002: Architecture Patterns
- ADR-005: MeiliSearch (multilingual search support)
