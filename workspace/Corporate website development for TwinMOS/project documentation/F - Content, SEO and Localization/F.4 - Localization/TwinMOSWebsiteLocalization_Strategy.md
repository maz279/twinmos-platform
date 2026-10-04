# TwinMOS Website — Localization Strategy

**Document Reference:** TWN-F4-L10N-2026-001
**Version:** 1.0
**Status:** Approved
**Owner:** Localization Lead / Marketing Director
**Last Updated:** 1 May 2026
**Related Documents:** TWN-BRD-2026-001 (BRD §11, §22), TWN-TECHSTACK-2026-001 (§11, §12), TWN-F3-HREFLANG-2026-001, TWN-F4-RTL-2026-001, TWN-F4-VENDOR-2026-001

---

## Table of Contents

1. [Business Rationale](#1-business-rationale)
2. [Locale Portfolio and Phase Plan](#2-locale-portfolio-and-phase-plan)
3. [Localization vs. Translation: Scope Definition](#3-localization-vs-translation-scope-definition)
4. [Content Architecture for Localization](#4-content-architecture-for-localization)
5. [Astro i18n Routing and URL Strategy](#5-astro-i18n-routing-and-url-strategy)
6. [Strapi v5 Unified Document System](#6-strapi-v5-unified-document-system)
7. [Translation Pipeline](#7-translation-pipeline)
8. [AI-Assisted Pre-Translation Policy](#8-ai-assisted-pre-translation-policy)
9. [Content Prioritisation for Translation](#9-content-prioritisation-for-translation)
10. [RTL (Arabic) Strategy Summary](#10-rtl-arabic-strategy-summary)
11. [Locale Governance and Ownership](#11-locale-governance-and-ownership)
12. [Phase Content Scope and Route Counts](#12-phase-content-scope-and-route-counts)
13. [Budget and Timeline Estimates](#13-budget-and-timeline-estimates)
14. [Vendor Selection Criteria](#14-vendor-selection-criteria)
15. [Compliance and Legal Localisation](#15-compliance-and-legal-localisation)
16. [KPIs and Measurement](#16-kpis-and-measurement)

---

## 1. Business Rationale

TwinMOS Technologies distributes to **93+ countries** across the Middle East & Africa, South Asia, South East Asia, Central Asia, Europe, and the Americas. The majority of TwinMOS's revenue and growth opportunity is concentrated in markets where English is not the primary language of commerce or consumer search:

| Region | Key Markets | Primary Language Need | Phase |
|---|---|---|---|
| Gulf Cooperation Council (GCC) | UAE, Saudi Arabia, Kuwait, Bahrain, Oman, Qatar | Arabic (AR) | P2 |
| South Asia — India | India | Hindi (HI) | P2 |
| Commonwealth of Independent States | Russia, Kazakhstan, Uzbekistan | Russian (RU) | P3 |
| China / East Asia | China (Mainland) | Simplified Chinese (ZH-CN) | P3 |
| Francophone Africa / Europe | Morocco, Tunisia, West Africa, France, Belgium | French (FR) | P3 |
| Latin America | Mexico, Brazil, Argentina, Colombia | Spanish (ES), Portuguese (PT) | P4 |
| Germany / DACH | Germany, Austria, Switzerland | German (DE) | P4 |

**Strategic objectives for localisation:**

1. **Organic search parity** — rank in local-language Google / Bing / Yandex / Baidu search results for product category keywords in each target locale.
2. **Conversion improvement** — research consistently shows 72% of consumers prefer to buy in their own language; localised product pages increase conversion rates 1.5–3×.
4. **Compliance** — UAE PDPL, India DPDP Act 2023, and KSA PDPL require privacy notices in a language "clearly understood" by the data subject (BRD §22).
5. **Brand consistency** — consistent tone and terminology across all markets reinforces TwinMOS's positioning as a premium, globally trusted technology brand.

---

## 2. Locale Portfolio and Phase Plan

### 2.1 Phase Definitions

| Phase | Locales | Target Live Date | Notes |
|---|---|---|---|
| **P1** | `en` (English — default) | Month 5 (May 2026) | Site launch; all EN content |
| **P2** | `ar` (Arabic), `hi` (Hindi) | Months 6–9 (Jun–Sep 2026) | RTL support required for AR |
| **P3** | `ru` (Russian), `zh-CN` (Chinese Simplified), `fr` (French) | Months 10–15 (Oct 2026–Mar 2027) | CJK font support required for ZH-CN |
| **P4** | `es` (Spanish), `pt` (Portuguese), `de` (German) | Month 16+ (Apr 2027+) | Out of current engagement scope |

### 2.2 Locale Codes and Region Mapping

| Locale Code | Language | Script | Direction | Primary Regions |
|---|---|---|---|---|
| `en` | English | Latin | LTR | Global default, USA, UK, Australia, SEA |
| `ar` | Arabic | Arabic | **RTL** | UAE, Saudi Arabia, Kuwait, Bahrain, Oman, Qatar, Egypt |
| `hi` | Hindi | Devanagari | LTR | India |
| `ru` | Russian | Cyrillic | LTR | Russia, Kazakhstan, Uzbekistan, Belarus |
| `zh-CN` | Chinese Simplified | Han (Simplified) | LTR | China (Mainland), Singapore |
| `fr` | French | Latin | LTR | France, Morocco, Tunisia, Senegal, Côte d'Ivoire |
| `es` | Spanish (LATAM) | Latin | LTR | Mexico, Colombia, Argentina, Chile, Peru |
| `pt` | Portuguese (BR) | Latin | LTR | Brazil, Portugal |
| `de` | German | Latin | LTR | Germany, Austria, Switzerland |

### 2.3 URL Scheme

- **EN (default):** No prefix. `https://www.twinmos.com/products/memory/ddr5/voltx-32gb/`
- **All other locales:** Locale prefix. `https://www.twinmos.com/ar/products/memory/ddr5/voltx-32gb/`

The `x-default` hreflang always points to the EN (no-prefix) URL.

---

## 3. Localization vs. Translation: Scope Definition

**Translation** = converting words from English into another language while preserving meaning.

**Localisation** = adapting the entire user experience — text, imagery, currency, date formats, legal notices, cultural references, and tone — to feel native to the target market.

TwinMOS requires localisation (not merely translation) for all P2+ markets. The distinction matters for:

| Dimension | Translation Only | Localisation Required |
|---|---|---|
| Product names | Keep EN ("VOLTX") | Keep EN (do-not-translate list) |
| Product descriptions | Translate marketing copy | Adapt for regional pricing, distributor name, compliance marks |
| Dates | Translate month names | Use regional date format (DD/MM/YYYY for GCC; DD-MM-YYYY for India) |
| Currency | No change | Show local currency (AED, INR, RUB) |
| Legal notices | Translate | Reference regional law (UAE PDPL, India DPDP, KSA PDPL) |
| Imagery | No change | Review for cultural appropriateness (see Cultural Adaptation Guide) |
| CTA copy | Translate | Adapt register (formal for AR, casual for gaming/VOLTX) |
| Support contact | No change | Show regional contact number / email where available |
| Certifications | Translate label | Show region-specific marks (BIS for India, EAC for RU, CE for EU) |

---

## 4. Content Architecture for Localization

### 4.1 Strapi v5 Content Types Subject to Localisation

All Strapi content types are configured with the `i18n` plugin enabled, allowing per-field locale variants:

| Content Type | Localised Fields | Non-Localised Fields |
|---|---|---|
| `Product` | `name` (title only if regional branding differs), `description`, `features`, `metaTitle`, `metaDescription`, `slug` (locale prefix handled by routing) | `sku`, `price`, `specs` (technical), `images`, `certifications` array |
| `Article` (Learn Hub) | `title`, `excerpt`, `body`, `metaTitle`, `metaDescription` | `publishedAt`, `author`, `category`, `heroImage` |
| `KbArticle` (Support) | `title`, `body`, `metaTitle`, `metaDescription` | `productRelations`, `publishedAt` |
| `NewsItem` | `headline`, `body`, `metaTitle`, `metaDescription` | `publishedAt`, `pressContactEmail` |
| `TeamMember` | `bio` | `name`, `jobTitle`, `photo`, `linkedIn` |
| `LegalPage` | `body`, `metaTitle`, `metaDescription` | `effectiveDate`, `documentVersion` |
| `RegionalPage` | ALL fields | None — fully locale-specific |
| `NavigationItem` | `label` | `href`, `order` |
| `UIString` | `value` | `key` (lookup key) |
| `FAQItem` | `question`, `answer` | `category` |
| `JobPosting` | `title`, `description`, `requirements` | `location`, `department`, `publishedAt` |

### 4.2 Non-Localised Content (EN Only)

The following content is served in English regardless of the active locale:

- Partner portal pages (`/partners/*`)
- Admin and API routes
- CI/CD status pages
- Product SKU codes (always in EN; not translatable)
- Technical specification tables (spec names and values remain in EN per industry standard)

### 4.3 Shared vs. Locale-Specific Assets

| Asset Type | Shared Across Locales | Locale-Specific Version |
|---|---|---|
| Product renders (photographic) | ✅ Yes | Only if regional packaging differs |
| Hero images (lifestyle) | ✅ Yes | ⚠️ Review for cultural appropriateness (see Cultural Adaptation Guide) |
| Certification badges (BIS, CE, EAC) | ❌ No | Each certification badge is locale-specific |
| Banner text overlays | ❌ No | Locale-specific WebP with translated text |
| OG (social preview) images | ❌ No | Locale-specific OG images with translated headline |
| Video content | ✅ Yes (with subtitles) | Subtitles in target locale |

---

## 5. Astro i18n Routing and URL Strategy

### 5.1 Astro Configuration

```typescript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'hybrid',
  adapter: cloudflare(),
  i18n: {
    defaultLocale: 'en',
    locales: [
      'en',
      'ar',
      'bn',
      'hi',
      'ru',
      'zh-CN',
      'fr',
      // P4 locales added when phase begins:
      // 'es', 'pt', 'de'
    ],
    routing: {
      prefixDefaultLocale: false,   // EN at root: /products/ not /en/products/
      redirectToDefaultLocale: false // No auto-redirect; canonical EN URL is definitive
    },
    fallback: {
      // If a locale page doesn't exist yet, fall back to EN
      ar: 'en',
      bn: 'en',
      hi: 'en',
      ru: 'en',
      'zh-CN': 'en',
      fr: 'en'
    }
  }
});
```

### 5.2 File Routing Convention

Locale-aware pages live under `src/pages/[locale]/` with EN pages at `src/pages/`:

```
src/pages/
├── index.astro                     → /
├── products/
│   └── [...slug].astro             → /products/[...slug]/
├── learn/
│   └── [...slug].astro             → /learn/[...slug]/
├── [locale]/                       → /ar/, /bn/, /hi/, /ru/, /zh-CN/, /fr/
│   ├── index.astro                 → /ar/
│   ├── products/
│   │   └── [...slug].astro         → /ar/products/[...slug]/
│   └── learn/
│       └── [...slug].astro         → /ar/learn/[...slug]/
```

### 5.3 Locale Detection Hierarchy

When a user visits `twinmos.com` without a locale prefix:

1. Check `Accept-Language` header (browser preference)
2. Check `twinmos_locale` cookie (if user has previously selected a locale)
3. Default to EN if no match or locale not yet live

A locale selector widget in the header allows manual override, setting the `twinmos_locale` cookie.

> **Important:** Do NOT use automatic geo-redirect. Users in Saudi Arabia who prefer English should receive EN. Locale detection offers a suggestion; the cookie stores the user's explicit choice.

### 5.4 Locale Selector Component

```astro
---
// src/components/LocaleSelector.astro
const { currentPath } = Astro.props;
const activeLocales = import.meta.env.ACTIVE_LOCALES?.split(',') || ['en'];

const localeNames = {
  en: 'English',
  ar: 'العربية',
  bn: 'বাংলা',
  hi: 'हिन्दी',
  ru: 'Русский',
  'zh-CN': '中文',
  fr: 'Français'
};
---
<nav aria-label="Language selector">
  {activeLocales.map(locale => (
    <a href={locale === 'en' ? currentPath : `/${locale}${currentPath}`}
       lang={locale}
       aria-current={Astro.currentLocale === locale ? 'true' : undefined}>
      {localeNames[locale]}
    </a>
  ))}
</nav>
```

---

## 6. Strapi v5 Unified Document System

### 6.1 Locale Field Architecture

Strapi v5 uses the **Unified Document System** which stores all locale variants of a document under a single document ID. This replaces Strapi v4's separate per-locale draft/publish cycles.

Key behaviours:
- A product entry with `documentId: "abc123"` can have locale variants: `abc123/en`, `abc123/ar`, `abc123/hi`, etc.
- Publishing the EN variant does NOT auto-publish other locale variants.
- Each locale variant has its own draft/published state.
- Non-localised fields (SKU, specs, images) are shared and updated once.

### 6.2 Translation Status Tracking

Strapi's i18n plugin provides a **"Locales" panel** in the content editor showing which locales have been filled in:

| Status Indicator | Meaning |
|---|---|
| ✅ Published | This locale is live on the website |
| 🟡 Draft | Translation exists but not published |
| ⬜ Missing | No translation exists yet; EN fallback is served |

The SEO Lead and Localization Lead should review the "Missing" list monthly to track translation coverage.

### 6.3 XLIFF Export/Import Workflow

Strapi v5 supports XLIFF 1.2 export of localised field content for translation:

```bash
# Export EN content for translation to Arabic
strapi export --locale en --format xliff --output ./xliff/export/en-to-ar/

# Import translated Arabic content
strapi import --locale ar --format xliff --input ./xliff/import/ar/
```

See the Translation Pipeline section (§7) for the full workflow.

---

## 7. Translation Pipeline

### 7.1 Pipeline Stages

```
EN SOURCE → XLIFF EXPORT → VENDOR PRE-TRANSLATION (AI) → HUMAN TRANSLATION
  → NATIVE-SPEAKER REVIEW → TM/GLOSSARY UPDATE → XLIFF IMPORT → STAGING QA
  → LOCALE QA CHECKLIST → APPROVAL → PUBLISH
```

### 7.2 Stage Details

**Stage 1 — Content Freeze and XLIFF Export**
- SEO Lead confirms the EN page is finalised and published.
- Technical Writer exports XLIFF via Strapi admin or CLI.
- XLIFF file is named: `{content-type}-{documentId}-{source-locale}-{target-locale}-{YYYY-MM-DD}.xliff`
  - Example: `product-abc123-en-ar-2026-06-01.xliff`
- Files are uploaded to the shared translation folder: `Backblaze B2: twinmos-translations/in-progress/{locale}/`

**Stage 2 — Vendor Pre-Translation (AI Assist)**
- Translation vendor applies AI pre-translation (see §8) using the TwinMOS Translation Memory and Glossary.
- AI pre-translation typically handles 60–70% of strings with high confidence.
- Vendor marks remaining strings for full human translation.

**Stage 3 — Human Translation**
- Professional translator works through XLIFF in a CAT tool (memoQ, Phrase TMS, or SDL Trados).
- All strings are reviewed even if AI pre-translated — no string ships without human eyes.
- Translator follows: TWN-F4-GLOSSARY-2026-001 (Translation Memory & Glossary) and TWN-F4-CULTURE-2026-001 (Cultural Adaptation Guide).
- Deadline: 5 business days for up to 5,000 source words; 10 business days up to 15,000 words.

**Stage 4 — Native-Speaker Review**
- A second native speaker (ideally the regional TwinMOS office contact) reviews the translated XLIFF.
- Checks: brand consistency, tone, regional appropriateness, do-not-translate compliance.
- Approves or returns for revision.

**Stage 5 — TM and Glossary Update**
- Vendor submits updated Translation Memory segments and any new glossary terms.
- Localization Lead reviews and approves additions to the master Glossary (TWN-F4-GLOSSARY-2026-001).

**Stage 6 — XLIFF Import to Strapi**
- Technical Writer imports the approved XLIFF via Strapi admin.
- Content is placed in "Draft" state — NOT auto-published.
- Full review on staging environment before publishing.

**Stage 7 — Staging QA**
- QA team runs the Locale QA Checklist (TWN-F4-LQAC-2026-001) on the staging environment.
- All blocker and high-severity issues resolved before proceeding.

**Stage 8 — Publish**
- Marketing Director or designated Locale Owner approves the publish.
- Strapi content published; Cloudflare Pages rebuild triggered.
- Sitemap updated; GSC notified via ping.

### 7.3 Pipeline SLAs

| Stage | SLA |
|---|---|
| XLIFF export to vendor delivery | 1 business day |
| AI pre-translation | 4 hours |
| Human translation (up to 5K words) | 5 business days |
| Native-speaker review | 2 business days |
| XLIFF import + staging QA | 2 business days |
| Total pipeline (typical page) | 10–12 business days |

---

## 8. AI-Assisted Pre-Translation Policy

### 8.1 Rationale

AI-assisted pre-translation (using large language models such as DeepL, Google Translate API v3, or Claude API) can reduce translation effort by 5–10× for repetitive or formulaic content. However, raw AI output is never acceptable for publication without human review.

### 8.2 Permitted AI Pre-Translation Use Cases

| Content Type | AI Pre-Translation | Human Review Required |
|---|---|---|
| Product technical specifications | ✅ Permitted | ✅ Mandatory — spec accuracy critical |
| Product marketing descriptions | ✅ Permitted | ✅ Mandatory — tone/brand consistency |
| Support KB articles | ✅ Permitted | ✅ Mandatory — accuracy critical |
| Legal pages (privacy policy, T&Cs) | ✅ Permitted | ✅ Mandatory + Legal Counsel review |
| News / press releases | ✅ Permitted | ✅ Mandatory — brand voice |
| UI strings (buttons, labels) | ✅ Permitted | ✅ Mandatory — UX impact |
| Glossary / TM base entries | ✅ Permitted | ✅ Mandatory — sets foundation |

### 8.3 Prohibited AI-Only (No Human Review) Use Cases

- **Publishing any locale content without human review** — no exceptions.
- **Do-not-translate terms** (brand names, SKUs, technical standards): AI must be instructed to leave these unchanged; verify in review.
- **RTL layout strings** for Arabic: AI may generate technically correct Arabic but miss RTL layout implications.

### 8.4 AI Tool Recommendations by Language Pair

| Language Pair | Recommended Tool | Quality Notes |
|---|---|---|
| EN → AR | DeepL (high quality for formal Arabic), GPT-4o | Strong for MSA; weaker for Gulf dialect — always review |
| EN → HI | DeepL, Google Translate | Hindi quality is good; review for technical terms |
| EN → RU | DeepL | Excellent Russian quality; lowest review effort |
| EN → ZH-CN | DeepL, Baidu Translate | Good for Simplified Chinese; review technical terms |
| EN → FR | DeepL | Excellent quality; lowest review effort |

---

## 9. Content Prioritisation for Translation

All content must be translated in priority order within each phase. P0 content must be translated and live within 4 weeks of phase start; P1 within 8 weeks; P2 within 16 weeks.

### 9.1 P0 — Translate First (Revenue-Critical)

- Homepage (`/`)
- Product category hubs (`/products/memory/`, `/products/storage/`, `/products/usb/`)
- All individual product detail pages (287 product entries)
- Where to Buy (`/where-to-buy/`)
- Contact page (`/contact/`)
- Privacy Policy and Cookie Policy (compliance mandatory)

### 9.2 P1 — Translate Second (Conversion Support)

- Top 20 Learn Hub buying guides
- Top 10 Support KB articles (most-viewed in GSC)
- Solutions pages (`/solutions/gaming/`, `/solutions/enterprise/`, `/solutions/creator/`)
- About page and Company History
- Certifications and Compliance page

### 9.3 P2 — Translate Third (SEO and Completeness)

- Remaining Learn Hub articles (buying guides, explainers)
- Remaining Support KB articles
- Regional pages (e.g., `/regional/uae/`, `/regional/india/`)
- News and press releases (only items with regional relevance)
- Careers page

### 9.4 Never Translate (Serve EN)

- Admin and partner portal
- API documentation (developer audience; EN standard)
- Product SKU specification tables (technical data; EN international standard)
- Git commit messages, code comments

---

## 10. RTL (Arabic) Strategy Summary

The Arabic locale requires Right-to-Left (RTL) layout support throughout the entire site. This is a significant engineering effort and must be planned at component level.

**Key RTL implementation requirements:**

- `<html dir="rtl" lang="ar">` on all Arabic pages
- Tailwind CSS `rtl:` modifier for directional utilities
- CSS Logical Properties replacing physical direction properties
- Noto Sans Arabic font (loaded only for Arabic pages)
- Icon mirroring for directional icons (chevrons, arrows)
- LTR islands for product SKUs, URLs, emails, and Latin brand names

Full implementation details are in **TWN-F4-RTL-2026-001 — RTL Implementation Guide**.

RTL implementation should begin in Month 4 (one month before P2 launch target) to allow adequate development and QA time.

---

## 11. Locale Governance and Ownership

### 11.1 Locale Owner Table

Each locale has a designated Locale Owner responsible for translation quality, content review, and publish approval.

| Locale | Locale Owner | Regional Contact | Review Cadence |
|---|---|---|---|
| `en` | Marketing Director | Content Team | Continuous |
| `ar` | Marketing Director + UAE Office | UAE Regional Manager | Monthly content audit |
| `ru` | Localization Lead | CIS Distributor Contact | Quarterly |
| `zh-CN` | Localization Lead | China Distributor Contact | Quarterly |
| `fr` | Localization Lead | French Market Distributor | Quarterly |

### 11.2 Content Update SLAs

When EN content is updated (product description change, legal update, feature addition), the following applies:

| EN Content Change Type | Locale Update Required Within | Blocking? |
|---|---|---|
| Legal page update (privacy policy, T&Cs) | 5 business days | ✅ Yes — serve updated EN until translated |
| Price change | 2 business days | ✅ Yes — remove locale price if stale |
| Product launch | 10 business days | No — locale launch can follow EN |
| Blog article | 20 business days | No — EN version serves until translated |
| Support KB update | 10 business days | No |
| UI string change | 5 business days | ✅ Yes — functional content |
| Navigation label change | 3 business days | ✅ Yes — navigation is UI |

### 11.3 Localisation Review Calendar

| Event | Timing | Action |
|---|---|---|
| Monthly locale audit | 1st Monday of each month | Locale Owner reviews GSC international performance; identifies new content for translation |
| Quarterly full review | Every 3 months | Full content freshness check; retire outdated locale content |
| Pre-phase review | 6 weeks before each phase launch | All P0 content confirmed translated; RTL QA complete; legal pages approved |
| Annual glossary review | January | Review and update Translation Memory and Glossary |

---

## 12. Phase Content Scope and Route Counts

### 12.1 Phase 1 — English Only

| Content Type | Pages |
|---|---|
| Homepage | 1 |
| Product category hubs | ~8 |
| Product detail pages | ~287 |
| Learn Hub articles | ~40 |
| Support KB articles | ~30 |
| Solutions pages | ~8 |
| Corporate pages (About, News, Careers, Legal) | ~25 |
| Regional pages | ~15 |
| **Total P1 routes** | **~414** |

### 12.2 Phase 2 — +3 Locales (AR, BN, HI)

Each locale adds an approximate copy of the P0/P1 priority pages:

| Locale | Estimated Routes | Priority |
|---|---|---|
| `ar` (Arabic) | ~350 (P0+P1 subset) | P0: homepage, products, legal |
| `hi` (Hindi) | ~350 | P0: homepage, products, regional/india |
| **P2 additional routes** | **~1,000** | |
| **Total P2 cumulative** | **~1,414** | |

### 12.3 Phase 3 — +3 Locales (RU, ZH-CN, FR)

| Locale | Estimated Routes |
|---|---|
| `ru` (Russian) | ~300 |
| `zh-CN` (Chinese Simplified) | ~300 |
| `fr` (French) | ~300 |
| **P3 additional routes** | **~900** |
| **Total P3 cumulative** | **~2,314** | |

### 12.4 Phase 4 — +3 Locales (ES, PT, DE) — Out of Scope

| Locale | Estimated Routes |
|---|---|
| `es` (Spanish) | ~300 |
| `pt` (Portuguese) | ~300 |
| `de` (German) | ~300 |
| **P4 additional routes** | **~900** |
| **Total P4 cumulative** | **~3,214** | |

---

## 13. Budget and Timeline Estimates

### 13.1 Translation Cost Estimates

Translation costs vary by language pair, word volume, and quality tier. The estimates below are indicative for planning purposes.

| Phase | Language Pairs | Estimated Word Volume | Cost Estimate (USD) |
|---|---|---|---|
| P2 | EN→AR, EN→BN, EN→HI | ~180,000 words (×3) | $15,000–$25,000 |
| P3 | EN→RU, EN→ZH-CN, EN→FR | ~180,000 words (×3) | $12,000–$20,000 |
| P4 | EN→ES, EN→PT, EN→DE | ~180,000 words (×3) | $10,000–$16,000 |

Notes:
- AI pre-translation reduces human effort by 50–70%, lowering costs significantly.
- TM leverage (reuse of previously translated segments) reduces cost by 20–40% over time.
- Ongoing content updates (new products, articles) add 5,000–10,000 words/month across active locales.

### 13.2 Engineering Effort Estimates

| Task | Estimate |
|---|---|
| RTL CSS implementation (AR) | 3–5 developer-days |
| Astro i18n routing setup | 1–2 developer-days |
| Strapi i18n content type configuration | 1 developer-day |
| XLIFF export/import tooling | 1–2 developer-days |
| Locale selector UI component | 0.5 developer-days |
| Hreflang implementation (see TWN-F3-HREFLANG-2026-001) | 1 developer-day |
| Sitemap per-locale generation | 0.5 developer-days |
| CJK font loading (ZH-CN) | 0.5 developer-days |
| **Total engineering estimate** | **~9–13 developer-days** |

---

## 14. Vendor Selection Criteria

Translation work for P2 and P3 locales will be outsourced to a professional translation vendor. Selection criteria:

| Criterion | Weight | Requirement |
|---|---|---|
| Language expertise | 25% | Must have native-speaker translators for AR, BN, HI (P2) and RU, ZH-CN, FR (P3) |
| Technology / XLIFF support | 20% | Must support XLIFF 1.2/2.0 and integrate with memoQ, Phrase TMS, or SDL Trados |
| Domain expertise | 20% | Preference for vendors with B2B technology / consumer electronics experience |
| TM and Glossary management | 15% | Must build and maintain TwinMOS-specific Translation Memory |
| Turnaround time | 10% | Must meet SLAs: 5 business days for 5K words |
| References | 5% | At least 2 comparable technology brand references |
| NDA and data security | 5% | Must sign TwinMOS NDA; ISO 27001 preferred |

Full vendor brief: **TWN-F4-VENDOR-2026-001 — Translation Vendor Brief**

---

## 15. Compliance and Legal Localisation

Per BRD §22, the following legal documents must be localised for each market:

| Document | Required Locales | Legal Requirement |
|---|---|---|
| Privacy Policy | AR, HI (P2); RU, ZH-CN, FR (P3) | UAE PDPL (AR), India DPDP 2023 (HI), GDPR (FR); RU Federal Law 152-FZ (RU) |
| Cookie Policy | All active locales | GDPR requires language of the data subject |
| Terms of Service | AR, HI (P2+) | Consumer protection laws |
| Warranty Policy | AR, HI, BN (P2+) | Consumer protection; BIS requirements (HI) |
| Compliance Certifications page | All active locales | Regulatory transparency |

**Legal review requirement:** All localised legal pages must be reviewed by TwinMOS legal counsel (or a qualified local legal advisor for each jurisdiction) before publishing. Translation alone is not sufficient.

**Data Processing Addendum (DPA):** Any translation vendor processing TwinMOS content data must sign a DPA compliant with GDPR (for European-based vendors) and, where applicable, UAE PDPL requirements.

---

## 16. KPIs and Measurement

### 16.1 Localization KPIs

| KPI | Target | Measurement Tool | Review Cadence |
|---|---|---|---|
| Locale organic traffic | +200% YoY per locale | Google Search Console, Plausible | Monthly |
| Locale content coverage | 100% P0 pages translated within 4 weeks of phase launch | Strapi locale status dashboard | Weekly during phase |
| Translation accuracy score | ≥4.5/5 on LISA QA framework | Vendor quality report | Per batch |
| Locale bounce rate vs. EN | Within 15% of EN baseline | Plausible | Monthly |
| Locale conversion rate | Within 20% of EN baseline | Plausible Goals | Monthly |
| Hreflang error count | 0 errors | Google Search Console International Targeting | Weekly |
| Core Web Vitals — locale pages | LCP ≤2.5s (per locale, including font load) | GSC + PageSpeed Insights | Monthly |
| Translation pipeline SLA compliance | ≥90% of batches on time | Vendor tracking | Per batch |

### 16.2 Locale Performance Dashboard

A monthly locale performance report will be compiled using:
- **Google Search Console** — International Targeting, Performance per locale
- **Plausible** — Traffic, bounce rate, goal completions per locale
- **Strapi** — Translation coverage percentage per content type
- **Vendor reports** — TM leverage, QA scores, delivery SLA compliance

Report owner: Localization Lead. Distributed to: Marketing Director, CEO, Regional Managers.

---

*Document End — TWN-F4-L10N-2026-001 v1.0*
