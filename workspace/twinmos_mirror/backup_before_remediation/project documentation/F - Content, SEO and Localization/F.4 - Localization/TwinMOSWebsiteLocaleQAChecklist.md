# TwinMOS Website — Locale QA Checklist

**Document Reference:** TWN-F4-LQAC-2026-001
**Version:** 1.0
**Status:** Approved
**Owner:** QA Lead / Localization Lead
**Last Updated:** 1 May 2026
**Related Documents:** TWN-F4-L10N-2026-001 (Localization Strategy), TWN-F4-RTL-2026-001 (RTL Implementation Guide), TWN-F3-HREFLANG-2026-001 (Hreflang), TWN-F4-CULTURE-2026-001 (Cultural Adaptation Guide)

---

## Table of Contents

1. [Overview and Process](#1-overview-and-process)
2. [Issue Severity Definitions](#2-issue-severity-definitions)
3. [Sign-Off Matrix](#3-sign-off-matrix)
4. [Section A — Linguistic Quality](#4-section-a--linguistic-quality)
5. [Section B — Layout and Typography](#5-section-b--layout-and-typography)
6. [Section C — RTL Layout (Arabic Only)](#6-section-c--rtl-layout-arabic-only)
7. [Section D — Formatting (Dates, Numbers, Currency)](#7-section-d--formatting-dates-numbers-currency)
8. [Section E — Links, Navigation, and URLs](#8-section-e--links-navigation-and-urls)
9. [Section F — SEO and Metadata](#9-section-f--seo-and-metadata)
10. [Section G — Accessibility](#10-section-g--accessibility)
11. [Section H — Legal and Compliance](#11-section-h--legal-and-compliance)
12. [Section I — Forms and Validation](#12-section-i--forms-and-validation)
13. [Section J — Search Functionality](#13-section-j--search-functionality)
14. [Section K — Performance](#14-section-k--performance)
15. [Defect Tracking Template](#15-defect-tracking-template)
16. [Pre-Launch Final Sign-Off Checklist](#16-pre-launch-final-sign-off-checklist)

---

## 1. Overview and Process

This checklist is used to validate each new locale deployment before publishing. It covers linguistic, layout, technical, SEO, accessibility, legal, and performance dimensions.

### 1.1 When to Use This Checklist

- **Pre-launch:** Complete all sections before a locale goes live for the first time.
- **Major content update:** Re-run Sections A, D, F, H for any significant content update.
- **Post-deployment smoke test:** Run the "Quick Post-Deploy Check" subset (marked **[QUICK]**) after every Cloudflare Pages deployment.
- **Quarterly audit:** Re-run the full checklist quarterly to catch regressions.

### 1.2 Checklist Execution

1. The **QA Engineer** runs Sections B, C, D, E, F, I, J, K on the staging server before locale is published.
2. The **Translator / Native-Speaker Reviewer** runs Section A concurrently.
3. The **Accessibility Specialist** runs Section G.
4. The **Legal contact** reviews Section H (legal page accuracy).
5. The **Localization Lead** consolidates all findings, tracks blockers, and approves progression to sign-off.
6. After all Blockers and Highs are resolved, the **Locale Owner** (see Localization Strategy §11) provides final sign-off.

### 1.3 Environments

| Environment | URL Pattern | Used For |
|---|---|---|
| Local dev | `http://localhost:3000/{locale}/` | Developer testing |
| Staging | `https://staging.twinmos.com/{locale}/` | QA and sign-off |
| Production | `https://www.twinmos.com/{locale}/` | Post-deploy smoke test |

### 1.4 Scope per Phase

| Locale | Phase | Full QA Required By |
|---|---|---|
| `ar` | P2 | 2 weeks before Phase 2 launch |
| `bn` | P2 | 2 weeks before Phase 2 launch |
| `hi` | P2 | 2 weeks before Phase 2 launch |
| `ru` | P3 | 2 weeks before Phase 3 launch |
| `zh-CN` | P3 | 2 weeks before Phase 3 launch |
| `fr` | P3 | 2 weeks before Phase 3 launch |

---

## 2. Issue Severity Definitions

| Severity | Definition | Examples | Resolution Requirement |
|---|---|---|---|
| **Blocker** | Prevents launch; legal or functional showstopper | Untranslated P0 page live; broken form submission; incorrect legal page; privacy policy missing | Must be fixed before any publish |
| **High** | Significantly impacts user experience or brand; no workaround | RTL layout broken on product page; currency showing wrong; hreflang error on all pages; major mistranslation on homepage | Must be fixed before launch |
| **Medium** | Noticeable quality issue; workaround exists | Minor translation inconsistency; date format slightly off; tooltip misaligned | Should be fixed before launch; may be deferred to next sprint with Locale Owner approval |
| **Low** | Minor cosmetic or textual issue | Spacing slightly off; punctuation in translated text inconsistent | Deferred to next maintenance sprint |

---

## 3. Sign-Off Matrix

| Reviewer | Responsible Sections | Sign-Off Action |
|---|---|---|
| Translator / Native-Speaker | A (Linguistic) | Email approval to Localization Lead |
| QA Engineer | B, C, D, E, I, J, K | Complete checklist; log issues in Defect Tracker |
| Accessibility Specialist | G | Accessibility report; confirm pass |
| Legal Contact | H | Signed approval for legal pages |
| SEO Lead | F | Review metadata report; confirm pass |
| Locale Owner | All — final | Written approval in Defect Tracker; trigger publish |
| Localization Lead | All — consolidation | Confirms all Blockers/Highs resolved; passes to Locale Owner |

---

## 4. Section A — Linguistic Quality

**Reviewer:** Translator / Native-Speaker Reviewer
**Tool:** Staging site + source XLIFF files

### A.1 Translation Accuracy and Completeness

- [ ] **[Blocker]** All P0 pages are fully translated — no untranslated EN segments visible in the {locale} version
- [ ] **[Blocker]** No placeholder text ("TODO", "[TRANSLATE]", "PLACEHOLDER") visible anywhere on the locale site
- [ ] **[High]** Homepage marketing copy accurately conveys TwinMOS brand positioning in the target language
- [ ] **[High]** Product descriptions accurately represent product capabilities — no factual errors introduced in translation
- [ ] **[High]** Support KB articles accurately reflect the correct technical steps — no technical errors introduced
- [ ] **[Medium]** Article headings are translated and reflect the content of the section
- [ ] **[Medium]** CTA (call-to-action) copy is action-oriented and natural in the target language
- [ ] **[Medium]** No machine-translation artifacts (unnatural phrasing, word salad) in any published content

### A.2 Terminology Consistency

- [ ] **[Blocker]** All do-not-translate terms (TwinMOS, VOLTX, CoreX Pro, etc.) appear exactly in Latin characters — none translated or transliterated
- [ ] **[Blocker]** All product SKU codes appear exactly as in EN — no modification
- [ ] **[High]** Technology standard abbreviations (DDR5, NVMe, PCIe, USB 3.2, etc.) appear in EN form — not translated
- [ ] **[High]** Technical terms follow the approved glossary (TWN-F4-GLOSSARY-2026-001) — spot-check 20 terms
- [ ] **[Medium]** Same concept is translated consistently throughout the site (no two different words for "warranty" across pages)
- [ ] **[Medium]** Navigation labels match between header, footer, breadcrumbs, and sitemap

### A.3 Brand Voice and Cultural Appropriateness

- [ ] **[High]** Marketing copy tone matches the approved register for this locale (see TWN-F4-CULTURE-2026-001)
- [ ] **[High]** No culturally inappropriate content for this locale (check imagery, idioms, references — see Cultural Adaptation Guide)
- [ ] **[Medium]** Support content tone is empathetic and solution-focused, not blaming or robotic
- [ ] **[Medium]** Legal pages read as professionally drafted, not obviously machine-translated
- [ ] **[Low]** Punctuation conventions follow the target language norms (e.g., guillemets « » for French, no space before punctuation in Arabic)

### A.4 Grammar and Spelling

- [ ] **[High]** No obvious grammar errors on homepage, product category pages, and all P0 pages
- [ ] **[Medium]** Spell-check passed for target language (use CAT tool QA result as evidence)
- [ ] **[Medium]** Verb agreement, gender agreement (where applicable), and number agreement are correct
- [ ] **[Low]** Hyphenation and line-break conventions are appropriate for the language

---

## 5. Section B — Layout and Typography

**Reviewer:** QA Engineer
**Tool:** Chrome DevTools, staging site, BrowserStack (for cross-browser)

### B.1 Text Overflow and Truncation

- [ ] **[High]** No text overflow out of buttons on homepage, product cards, and navigation
- [ ] **[High]** No text truncated with ellipsis where full text is needed (check product names, headings, CTA labels)
- [ ] **[High]** No text overflowing its container on mobile (320px–375px viewport width) — check German, Arabic, Bengali (these languages expand text the most)
- [ ] **[Medium]** Dropdown menu items are fully readable — no clipping
- [ ] **[Medium]** Footer columns are properly wrapped — no overflow
- [ ] **[Low]** Page titles in browser tab are fully readable (not truncated to 2 words)

### B.2 Line Height and Text Rendering

- [ ] **[High]** Arabic text has sufficient line height (1.8 minimum) — no line overlap with diacritics
- [ ] **[Medium]** Noto Sans Arabic font loads correctly on Arabic pages (check Network tab — font file request present)
- [ ] **[Medium]** Bengali / Devanagari / Cyrillic / Chinese characters render correctly — no tofu (□□□ boxes)
- [ ] **[Medium]** Fallback fonts activate correctly if primary font fails to load
- [ ] **[Low]** Font weight matches the design (headings in 600/700; body in 400)

### B.3 Component Visual Integrity

- [ ] **[High]** Hero section layout is intact — image and text not overlapping, CTA button visible
- [ ] **[High]** Product card layout is intact — image, name, spec summary, and CTA all visible
- [ ] **[Medium]** Breadcrumb component renders correctly — all levels visible, separators shown
- [ ] **[Medium]** Accordion / FAQ items open and close correctly with translated content
- [ ] **[Medium]** Modal dialogs render correctly with translated content (no overflow)
- [ ] **[Low]** Carousel / slider navigation (arrows) are visible and not clipped

---

## 6. Section C — RTL Layout (Arabic Only)

**Reviewer:** QA Engineer (layout) + Native Arabic Speaker (reading comfort)
**Applicable Locale:** `ar` only

### C.1 HTML Direction

- [ ] **[Blocker]** `<html dir="rtl" lang="ar">` is set on ALL Arabic locale pages
- [ ] **[Blocker]** Body text reads right-to-left throughout
- [ ] **[High]** No components remain in LTR layout where RTL is expected

### C.2 Structural Layout

- [ ] **[High]** Navigation logo is at the top-right (start edge)
- [ ] **[High]** Hamburger menu / mobile nav toggle is at the top-left (end edge)
- [ ] **[High]** Navigation links flow right-to-left in the correct reading order
- [ ] **[High]** Mega-menu / dropdown opens from the correct edge
- [ ] **[High]** Hero section: text block on the right, image on the left (start/end swap confirmed)
- [ ] **[High]** Product card: image at start edge, text and CTA at end
- [ ] **[High]** Footer columns flow right-to-left
- [ ] **[High]** Mobile sidebar drawer slides in from the right

### C.3 Spacing and Alignment

- [ ] **[High]** No `margin-left` or `padding-left` in physical CSS applying incorrectly in RTL (spot-check 5 components)
- [ ] **[Medium]** List item bullets or numbers appear on the right side of list items
- [ ] **[Medium]** `text-align: start` (right in RTL) applied to all body text
- [ ] **[Medium]** Form labels appear to the right of their inputs
- [ ] **[Low]** Progress indicators fill from the right

### C.4 Icons and SVGs

- [ ] **[High]** Breadcrumb separator chevrons are mirrored (pointing left → right in RTL)
- [ ] **[High]** Back/Previous buttons have arrows pointing right in RTL
- [ ] **[High]** Next/Forward buttons have arrows pointing left in RTL
- [ ] **[Medium]** Carousel "Previous" arrow is on the right; "Next" arrow is on the left in RTL
- [ ] **[Medium]** Accordion expand chevrons mirror correctly
- [ ] **[Medium]** Search icon is at the correct end of the search field
- [ ] **[Low]** All symmetric icons (home, user, cart, settings) are NOT mirrored (confirm no unintended flips)

### C.5 LTR Islands

- [ ] **[High]** Product SKU codes appear in LTR direction (within `<span dir="ltr">`)
- [ ] **[High]** Email addresses appear in LTR direction
- [ ] **[High]** URLs and domain names appear in LTR direction
- [ ] **[Medium]** Phone numbers appear in LTR direction
- [ ] **[Medium]** Technical spec values (e.g., "6000 MT/s") appear in Western digit order
- [ ] **[Low]** Code snippets (if any on support pages) are in LTR direction

### C.6 Typography (RTL-specific)

- [ ] **[High]** Noto Sans Arabic font is loading (no system fallback for Arabic text)
- [ ] **[High]** Arabic text font size is appropriately adjusted (no overflow from Arabic rendering slightly larger)
- [ ] **[Medium]** Line height for Arabic body text is ≥1.8
- [ ] **[Low]** Latin brand names within Arabic sentences (TwinMOS, VOLTX) display correctly using BiDi algorithm

---

## 7. Section D — Formatting (Dates, Numbers, Currency)

**Reviewer:** QA Engineer
**Tool:** Staging site, page inspection

### D.1 Date Formatting

| Locale | Expected Format | Example |
|---|---|---|
| `ar` | D MMMM YYYY in Arabic | ١ مايو ٢٠٢٦ |
| `bn` | DD/MM/YYYY | ০১/০৫/২০২৬ |
| `hi` | DD/MM/YYYY | 01/05/2026 |
| `ru` | DD.MM.YYYY | 01.05.2026 |
| `zh-CN` | YYYY年MM月DD日 | 2026年05月01日 |
| `fr` | DD/MM/YYYY | 01/05/2026 |

- [ ] **[High]** Publication dates on articles and news items display in the correct locale format
- [ ] **[Medium]** Warranty period dates on product pages display correctly
- [ ] **[Medium]** Event dates on events pages display in locale format
- [ ] **[Low]** `<time datetime="...">` element values are in ISO 8601 format (YYYY-MM-DD) regardless of display format

### D.2 Number and Unit Formatting

| Locale | Thousands Separator | Decimal Separator |
|---|---|---|
| `ar` | , (or Arabic comma) | . |
| `bn` | , | . |
| `hi` | , | . |
| `ru` | space ( ) or . | , |
| `zh-CN` | , | . |
| `fr` | space ( ) | , |

- [ ] **[High]** Product specification numbers use Western (ASCII) digits in all locales — no Arabic-Indic digit substitution in spec tables
- [ ] **[Medium]** Large numbers in body copy (if any) use the correct thousands separator for the locale
- [ ] **[Medium]** Price figures (if displayed) use the correct decimal and thousands separators
- [ ] **[Low]** Percentage values in content display correctly (e.g., "30%" — no space issue)

### D.3 Currency

- [ ] **[Blocker]** No locale is displaying an incorrect currency for its target market (e.g., USD shown on Arabic locale product pages without AED)
- [ ] **[High]** Currency symbols or codes are correct for the locale's target market
- [ ] **[Medium]** Currency formatting matches locale conventions (symbol position, space between symbol and number)

---

## 8. Section E — Links, Navigation, and URLs

**Reviewer:** QA Engineer
**Tool:** Screaming Frog, browser navigation, staging site

### E.1 Locale URL Integrity

- [ ] **[Blocker]** All internal links on locale pages use the correct locale prefix (`/ar/`, `/bn/`, `/hi/`, `/ru/`, `/zh-CN/`, `/fr/`) — no locale-crossing links
- [ ] **[Blocker]** The locale homepage resolves correctly: `https://staging.twinmos.com/{locale}/`
- [ ] **[Blocker]** No 404 errors on any P0 locale page
- [ ] **[High]** No 404 errors on any P1 locale page
- [ ] **[High]** Locale product pages resolve: `https://staging.twinmos.com/{locale}/products/`
- [ ] **[Medium]** Learn Hub locale pages resolve: `https://staging.twinmos.com/{locale}/learn/`
- [ ] **[Medium]** Support KB locale pages resolve: `https://staging.twinmos.com/{locale}/support/kb/`

### E.2 Navigation Correctness

- [ ] **[Blocker]** All primary navigation links from the locale homepage lead to correct locale pages
- [ ] **[High]** Breadcrumbs on all product pages show the correct locale path (e.g., الصفحة الرئيسية → المنتجات → الذاكرة → VOLTX DDR5)
- [ ] **[High]** Footer links resolve correctly to locale pages
- [ ] **[Medium]** Locale selector widget shows all live locales; selecting a different locale correctly navigates to the equivalent page in that locale
- [ ] **[Medium]** "Back to homepage" link in error pages leads to the locale homepage (not EN homepage)
- [ ] **[Low]** External links (partner sites, social media) open in a new tab

### E.3 Hreflang Correctness

- [ ] **[Blocker]** `<link rel="alternate" hreflang="{locale}" href="...">` is present in `<head>` of all locale pages
- [ ] **[Blocker]** `<link rel="alternate" hreflang="x-default" href="...">` is present and points to the EN URL
- [ ] **[High]** Hreflang tags are bidirectional — the AR page references the EN page AND the EN page references the AR page
- [ ] **[High]** Hreflang language codes are correct BCP 47 codes: `ar`, `bn`, `hi`, `ru`, `zh-CN`, `fr`
- [ ] **[Medium]** Hreflang URLs use the canonical form (with trailing slash if applicable, matching the canonical URL)
- [ ] **[Medium]** No hreflang references to locale pages that are not yet published (e.g., no `hreflang="ru"` on P2 pages if RU is not live)

Validate using: Aleyda Solis Hreflang Tags Testing Tool (`aleydasolis.com/tools/hreflang-tags-generator/`)

---

## 9. Section F — SEO and Metadata

**Reviewer:** SEO Lead / QA Engineer
**Tool:** Chrome DevTools → View Page Source, SEO browser extension, GSC

### F.1 Title Tags

- [ ] **[Blocker]** Every locale page has a unique `<title>` tag — no EN title tag on locale pages
- [ ] **[High]** Title tags are in the target language — not English
- [ ] **[High]** Title tags follow the template from TWN-F3-META-2026-001 (e.g., `{ProductName} {Spec} | TwinMOS Memory`)
- [ ] **[High]** Title tags are ≤60 characters (spot-check 10 pages across page types)
- [ ] **[Medium]** Title tags contain the primary keyword for the page in the target language

### F.2 Meta Descriptions

- [ ] **[Blocker]** Every P0 locale page has a meta description — no page missing meta description
- [ ] **[High]** Meta descriptions are in the target language — not English
- [ ] **[High]** Meta descriptions are ≤160 characters
- [ ] **[Medium]** Meta descriptions include a CTA phrase in the target language
- [ ] **[Low]** Meta descriptions accurately summarise the page content

### F.3 Canonical URL

- [ ] **[Blocker]** Every locale page has a `<link rel="canonical">` tag pointing to the correct locale URL (not the EN URL)
- [ ] **[High]** Canonical URL matches the page's actual URL exactly

### F.4 Open Graph Tags

- [ ] **[High]** `og:title` is in the target language on all locale pages
- [ ] **[High]** `og:description` is in the target language
- [ ] **[High]** `og:locale` matches the locale (e.g., `ar_AE`, `hi_IN`, `fr_FR` — see Meta Tag Templates doc)
- [ ] **[Medium]** `og:image` points to a locale-specific OG image (or the default EN image as fallback) — image URL is accessible
- [ ] **[Low]** `og:locale:alternate` lists all other live locale codes

### F.5 Robots Meta

- [ ] **[Blocker]** No `<meta name="robots" content="noindex">` on P0 locale pages (unless intentional)
- [ ] **[High]** Staging server uses `noindex` to prevent staging content from appearing in search (Cloudflare Pages Preview URLs)
- [ ] **[Medium]** Locale pages correctly inherit the robots directive from their EN counterparts (noindex on EN → noindex on locale)

### F.6 Structured Data

- [ ] **[High]** JSON-LD `BreadcrumbList` schema on locale product pages contains locale-appropriate `name` values (translated breadcrumb labels)
- [ ] **[Medium]** `Product` schema on locale product pages has `name` in the target language
- [ ] **[Medium]** `Article` schema on locale Learn Hub pages has `headline` in the target language
- [ ] **[Low]** Validate one product page and one article page per locale at `search.google.com/test/rich-results` — confirm no errors

---

## 10. Section G — Accessibility

**Reviewer:** Accessibility Specialist / QA Engineer
**Tool:** axe DevTools, NVDA (Windows), VoiceOver (Mac/iOS)

### G.1 Language Declaration

- [ ] **[Blocker]** `<html lang="{locale}">` is set correctly on all locale pages (e.g., `lang="ar"`, `lang="hi"`, `lang="fr"`)
- [ ] **[High]** Inline LTR islands (`<span dir="ltr">`) on Arabic pages do not confuse screen readers — test with NVDA

### G.2 Screen Reader Testing

- [ ] **[High]** NVDA (Windows) + Arabic language pack: Navigate homepage in Arabic — content reads in correct order (right-to-left); interactive elements are announced correctly
- [ ] **[High]** VoiceOver (iOS): Navigate product page in Arabic — product name, price, and CTA are announced
- [ ] **[Medium]** Screen reader announces locale-switched content correctly when user changes locale via the locale selector
- [ ] **[Medium]** Form error messages in the target language are announced by screen reader when validation fails

### G.3 Focus Management

- [ ] **[Medium]** Keyboard focus order is logical in RTL layout (focus moves right-to-left in Arabic)
- [ ] **[Medium]** Skip-to-content link is visible on focus in Arabic layout
- [ ] **[Low]** Focus indicator is visible on all interactive elements in the locale

### G.4 Alt Text

- [ ] **[High]** Product images have `alt` text in the target language (or are marked `alt=""` if decorative)
- [ ] **[Medium]** Hero images have descriptive `alt` text in the target language
- [ ] **[Low]** OG images have `alt` text (if rendered on page)

### G.5 Colour Contrast

- [ ] **[High]** Text-to-background colour contrast meets WCAG AA (≥4.5:1 for normal text) — run axe check on homepage
- [ ] **[Medium]** Any locale-specific text colour changes (e.g., for locale-specific badge colours) maintain contrast

---

## 11. Section H — Legal and Compliance

**Reviewer:** Legal Contact + Localization Lead
**Tool:** Staging site, manual review

### H.1 Privacy Policy

- [ ] **[Blocker]** Privacy Policy page exists in the target locale (`/{locale}/legal/privacy-policy/`)
- [ ] **[Blocker]** Privacy Policy is in the target language — not English
- [ ] **[Blocker]** Privacy Policy references the applicable regional data protection law:
  - `ar`: References UAE PDPL (Federal Decree-Law No. 45 of 2021)
  - `hi`/`bn`: References India DPDP Act 2023 (or applicable law for Bangladesh)
  - `ru`: References Federal Law 152-FZ on Personal Data
  - `zh-CN`: References China PIPL (Personal Information Protection Law)
  - `fr`: References RGPD (EU GDPR) and CNIL
- [ ] **[Blocker]** Legal review by TwinMOS Legal Counsel or a qualified local advisor has been completed (document the approval)
- [ ] **[High]** Privacy Policy effective date is current and accurate
- [ ] **[High]** Privacy Policy identifies TwinMOS Technologies as the data controller with correct contact information

### H.2 Cookie Policy and Cookie Banner

- [ ] **[Blocker]** Cookie consent banner appears in the target language on first visit — not in English
- [ ] **[High]** Cookie Policy page exists in the target locale
- [ ] **[High]** Cookie categories (functional, analytics, marketing) are labelled in the target language
- [ ] **[High]** Cookie banner "Accept" / "Decline" / "Manage" buttons are in the target language
- [ ] **[Medium]** Cookie consent preference is remembered on subsequent visits (cookie set correctly regardless of locale)

### H.3 Terms of Service

- [ ] **[High]** Terms of Service page exists in the target locale (if ToS is a required page for this locale)
- [ ] **[Medium]** ToS is in the target language
- [ ] **[Medium]** ToS effective date is current

### H.4 Product Compliance Marks

- [ ] **[High]** Region-specific certification marks are displayed on product pages for the relevant locale:
  - `ar`: CE, RoHS are relevant; ISO 9001:2015
  - `hi`: BIS certification mark is visible and prominent
  - `ru`: EAC mark is visible and prominent
  - `zh-CN`: CCC mark if applicable; GB compliance referenced
  - `fr`: CE, RGPD compliance references on relevant pages
- [ ] **[Medium]** Warranty information on product pages is accurate for the locale's region (warranty coverage and service process may differ)

---

## 12. Section I — Forms and Validation

**Reviewer:** QA Engineer
**Tool:** Staging site, manual form testing

### I.1 Contact Form

- [ ] **[Blocker]** Contact form submits successfully on the locale page — confirm successful submission toast/redirect in target language
- [ ] **[High]** All form labels are in the target language
- [ ] **[High]** Placeholder text in form fields is in the target language
- [ ] **[High]** Validation error messages appear in the target language when a field is invalid
- [ ] **[Medium]** Success confirmation message is in the target language
- [ ] **[Medium]** Required field indicators (*) are visible
- [ ] **[Medium]** In Arabic (RTL): form labels are right-aligned; input text direction is correct for Arabic input; numeric inputs (phone, etc.) are LTR

### I.2 Newsletter Subscription Form

- [ ] **[High]** Form labels and CTA button are in the target language
- [ ] **[High]** Confirmation/error messages are in the target language
- [ ] **[Medium]** GDPR/privacy opt-in checkbox label is in the target language and links to the locale Privacy Policy

### I.3 RMA / Support Request Form

- [ ] **[High]** All form fields and labels translated
- [ ] **[High]** Product model dropdown / input shows English product names (do not translate SKUs)
- [ ] **[Medium]** Instructions and help text translated
- [ ] **[Low]** Form layout is correct in RTL (Arabic only)

### I.4 Search Form

- [ ] **[High]** Search placeholder text is in the target language
- [ ] **[High]** Search results page title is in the target language ("نتائج البحث عن: [query]")
- [ ] **[Medium]** "No results found" message is in the target language
- [ ] **[Medium]** Search suggestions (if autocomplete is enabled) include target-language terms

---

## 13. Section J — Search Functionality

**Reviewer:** QA Engineer
**Tool:** Staging site, MeiliSearch admin

### J.1 MeiliSearch Locale Index

- [ ] **[Blocker]** MeiliSearch index for the target locale exists and is populated with translated content
- [ ] **[High]** Search query in the target language returns relevant results (test with 5 product name queries)
- [ ] **[High]** Arabic search: test with both right-to-left Arabic queries and queries including Latin brand names (e.g., search "VOLTX" in the Arabic locale — should return Arabic product page results)
- [ ] **[High]** Bengali/Hindi/Russian/Chinese search: Confirm queries in target script return results (test tokenisation)
- [ ] **[Medium]** Searching in EN on a non-EN locale returns mixed EN/locale results or locale-only results (confirm intended behaviour with Product Owner)
- [ ] **[Low]** Search result snippets display in the target language (not EN)

### J.2 MeiliSearch Configuration

- [ ] **[High]** Arabic locale index uses MeiliSearch's Arabic tokeniser (confirm in MeiliSearch admin: `tokenizer: "Arabic"`)
- [ ] **[High]** Chinese Simplified locale index uses CJK tokenisation (confirm: `tokenizer: "CJK"`)
- [ ] **[Medium]** Other locales use the default tokeniser with `stopWords` configured for target language

---

## 14. Section K — Performance

**Reviewer:** QA Engineer / DevOps
**Tool:** Google PageSpeed Insights, WebPageTest, Chrome DevTools Network tab

### K.1 Core Web Vitals — Locale-Specific

- [ ] **[High]** LCP (Largest Contentful Paint) ≤2.5s on mobile for locale homepage (verify via PageSpeed Insights)
- [ ] **[High]** CLS (Cumulative Layout Shift) ≤0.1 on locale product pages — check for layout shift caused by font loading (especially Arabic / CJK)
- [ ] **[Medium]** FID (First Input Delay) / INP (Interaction to Next Paint) ≤200ms on locale pages
- [ ] **[Medium]** TTFB (Time to First Byte) ≤600ms for locale pages (Cloudflare CDN should cache static assets)

### K.2 Font Loading Performance

- [ ] **[High]** Arabic locale: Noto Sans Arabic font loads with `font-display: swap` — no invisible text (FOIT)
- [ ] **[High]** Chinese locale: Noto Sans SC (or equivalent CJK font) loads without causing >500ms render delay
- [ ] **[Medium]** Font files are served from the CDN (`cdn.twinmos.com`) — not from Google Fonts directly (verify Network tab: no `fonts.googleapis.com` requests if self-hosted)
- [ ] **[Medium]** Font files are preloaded in `<head>` for the critical locale font

### K.3 Image Performance

- [ ] **[Medium]** Locale-specific OG images (if created) are ≤200KB
- [ ] **[Medium]** Locale-specific banner images with text overlays are in WebP format
- [ ] **[Low]** Product images (shared across locales) continue to load correctly on locale pages

---

## 15. Defect Tracking Template

Use this template to log all QA findings. Track in the project's issue tracker (Jira / Linear / GitHub Issues — TBD per team preference) or in a shared spreadsheet.

```
Defect ID:    [AUTO-INCREMENT]
Date Found:   [YYYY-MM-DD]
Found By:     [QA Engineer / Translator / Accessibility Specialist]
Locale:       [ar / bn / hi / ru / zh-CN / fr]
Section:      [A / B / C / D / E / F / G / H / I / J / K]
Checklist Item: [e.g., C.2 — Hero section layout]
Severity:     [Blocker / High / Medium / Low]

Description:
[Clear description of the issue. What is wrong? What did you expect?]

Steps to Reproduce:
1. Navigate to: [URL on staging]
2. [Action]
3. [Observed result]

Expected Result:
[What should happen]

Screenshot/Evidence:
[Attach screenshot or link]

Assigned To:   [Developer / Translator / Legal]
Status:        [Open / In Progress / Fixed / Verified / Closed / Deferred]
Resolution:    [Description of fix applied]
Verified By:   [Name]
Verified Date: [YYYY-MM-DD]
```

---

## 16. Pre-Launch Final Sign-Off Checklist

This is the condensed go/no-go checklist completed immediately before enabling a locale for public access. All items must be **Confirmed** by the responsible party.

| # | Item | Responsible | Status |
|---|---|---|---|
| 1 | All Blocker-severity defects resolved and verified | QA Lead | ☐ Confirmed |
| 2 | All High-severity defects resolved or formally deferred with Locale Owner approval | QA Lead + Locale Owner | ☐ Confirmed |
| 3 | Section A — Linguistic QA complete; Translator/Reviewer signed off | Translator | ☐ Confirmed |
| 4 | Section C — RTL QA complete (Arabic only); Native Arabic speaker reviewed | QA + Arabic Speaker | ☐ Confirmed |
| 5 | Section G — Accessibility test complete; no Blocker accessibility issues | Accessibility Specialist | ☐ Confirmed |
| 6 | Section H — Legal review complete; Privacy Policy approved by Legal Counsel | Legal Contact | ☐ Confirmed |
| 7 | Section F — SEO metadata verified; hreflang validator shows 0 errors | SEO Lead | ☐ Confirmed |
| 8 | Section J — MeiliSearch locale index populated and tested | DevOps | ☐ Confirmed |
| 9 | Section K — LCP ≤2.5s confirmed on locale homepage (mobile) | QA / DevOps | ☐ Confirmed |
| 10 | Sitemap updated to include new locale; submitted to Google Search Console and Bing Webmaster Tools | SEO Lead | ☐ Confirmed |
| 11 | hreflang annotations updated on all existing EN and live locale pages to reference new locale | Developer | ☐ Confirmed |
| 12 | Cookie consent banner appears in target language and functions correctly | QA | ☐ Confirmed |
| 13 | Contact form and key user-facing forms submit successfully in the locale | QA | ☐ Confirmed |
| 14 | Locale selector in header/footer shows new locale and routes correctly | QA | ☐ Confirmed |
| 15 | **Locale Owner final approval** — confirms locale is fit for public access | Locale Owner | ☐ **APPROVED** |

**Launch Approved By:**
Name: ___________________________
Role: ___________________________
Date: ___________________________
Signature: ___________________________

---

*Document End — TWN-F4-LQAC-2026-001 v1.0*
