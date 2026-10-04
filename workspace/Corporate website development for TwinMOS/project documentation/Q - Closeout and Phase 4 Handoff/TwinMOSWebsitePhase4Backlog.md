# TwinMOS Corporate Website — Phase 4 Backlog

**Document Reference:** TWN-Q-P4BACKLOG-2026-001  
**Version:** 1.0  
**Date:** October 2027 (Compiled at Phase 3 Closeout)  
**Prepared by:** TwinMOS Digital Transformation Team  
**Reviewed by:** Unisoft Solutions Ltd. — Team Lead  
**Classification:** CONFIDENTIAL — Internal Use Only  
**Distribution:** Executive Leadership, TwinMOS PM, Unisoft (if Phase 4 engaged), Marketing Director  
**Parent Documents:** TWN-BRD-2026-001 §3.2, TWN-PM-CHARTER-2026-001 §3.2, TWN-IMPL-STRAT-2026-001 §1 (Phase 4 definition)  

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | September 2027 | TwinMOS PM | Draft compiled from BRD, Charter, and phase retro notes |
| 1.0 | October 2027 | TwinMOS Digital Transformation Team | Final approved backlog |

---

## Purpose

This document constitutes the **authoritative backlog** for Phase 4 (Month 16+) of the TwinMOS corporate website programme. Phase 4 was explicitly defined as outside the 15-month Phases 1–3 engagement (per BRD v3.0 §6.1 and Implementation Strategy v3.0 §1) and remains available as an ongoing optimization retainer or a separately contracted engagement.

All items in this backlog have been formally reviewed, assessed for effort and priority, and represent the **full body of deferred, enhancement, and optimization work** identified across the Phase 1–3 engagement lifecycle.

---

## Backlog Summary

| Category | Total Items | High Priority | Medium Priority | Low Priority |
|----------|-------------|---------------|-----------------|--------------|
| Localization | 3 | 2 | 1 | 0 |
| SEO & CRO | 8 | 4 | 3 | 1 |
| Commerce & E-Commerce | 6 | 2 | 3 | 1 |
| Content & Editorial | 7 | 2 | 3 | 2 |
| Technology & Platform | 9 | 3 | 4 | 2 |
| Analytics & Data | 5 | 2 | 2 | 1 |
| Mobile & Native Apps | 3 | 0 | 1 | 2 |
| B2B / Enterprise | 4 | 1 | 2 | 1 |
| Accessibility & Compliance | 3 | 2 | 1 | 0 |
| Marketing & Campaigns | 5 | 1 | 3 | 1 |
| **Total** | **53** | **19** | **23** | **11** |

---

## Backlog Registry

### BL-01 — Localization

#### BL-01-001: Spanish (ES) Translation — Full 287+ Pages
**Priority:** High  
**Category:** Localization  
**Effort Estimate:** 4–6 weeks (translation vendor + engineering import + QA)  
**Origin:** BRD v3.0 §3.2 Out-of-Scope, Implementation Strategy v3.0 §1 Phase 4 scope, Technology Stack §11 (ES deferred)  
**Description:** Full Spanish translation covering all published content pages, product catalog, legal pages, and support articles. ES locale is pre-configured in the Astro i18n routing and Strapi i18n schema as a stub. Engineering activation is estimated at 3–5 days once translation strings are delivered. Target markets: Spain, Latin America, US Hispanic demographic.  
**Dependencies:** Translation vendor engaged; current content corpus locked before translation brief issued  
**Acceptance Criteria:** All 287+ pages have ES locale routes returning 200; hreflang `es` tags correct; Screaming Frog crawl passes; native-speaker quality review approved

---

#### BL-01-002: Portuguese (PT) Translation — Full 287+ Pages
**Priority:** High  
**Category:** Localization  
**Effort Estimate:** 4–6 weeks (translation vendor + engineering import + QA)  
**Origin:** BRD v3.0 §3.2 Out-of-Scope, Implementation Strategy v3.0 §1 Phase 4 scope  
**Description:** Full Portuguese translation covering all published content. High strategic value for Angola, Mozambique, and Brazil markets — Angola is an existing priority market per the Africa expansion strategy. PT locale is pre-configured as a stub.  
**Dependencies:** Translation vendor engaged; ES translation may be batched with PT for vendor efficiency  
**Acceptance Criteria:** All pages have PT routes returning 200; hreflang `pt` and `pt-BR` (if applicable) correct; native-speaker QA in both PT-PT and PT-BR dialects

---

#### BL-01-003: German (DE) Translation — Full 287+ Pages
**Priority:** Medium  
**Category:** Localization  
**Effort Estimate:** 4–6 weeks (translation vendor + engineering import + QA)  
**Origin:** BRD v3.0 §3.2 Out-of-Scope, Implementation Strategy v3.0 §1 Phase 4 scope  
**Description:** Full German translation covering all published content. Strategic value for Germany, Austria, Switzerland (DACH) — growing enterprise and gaming markets for TwinMOS. Requires IMPRINT page compliance for German-language users (DSGVO / GDPR German compliance). DE locale pre-configured as stub.  
**Dependencies:** German legal counsel review of DSGVO-specific disclosures; translation vendor  
**Acceptance Criteria:** All pages have DE routes; DSGVO-compliant privacy and imprint pages; hreflang `de` correct; native-speaker QA

---

### BL-02 — SEO & Conversion Rate Optimization (CRO)

#### BL-02-001: Continuous Technical SEO Monitoring & Remediation
**Priority:** High  
**Category:** SEO & CRO  
**Effort Estimate:** Ongoing retainer — 4–8 hours/month recommended  
**Origin:** BRD v3.0 §28, Phase 1–3 Lessons Learned  
**Description:** Ongoing monitoring of Core Web Vitals, crawl errors, structured data validity, broken links, and SERP ranking trajectories. Monthly Screaming Frog crawl + Google Search Console audit + actionable remediation. Includes structured data validation for all product and article pages as new content is added.  
**Dependencies:** Access to Google Search Console, Plausible, PostHog  
**Acceptance Criteria:** Monthly SEO health report delivered; no new critical crawl errors introduced; CWV scores maintained at Phase 3 targets

---

#### BL-02-002: Conversion Rate Optimization (CRO) Programme
**Priority:** High  
**Category:** SEO & CRO  
**Effort Estimate:** 3–4 months (initial programme setup + first round experiments)  
**Origin:** Phase 3 retro — PostHog data shows significant drop-off on product detail pages; exit rate on compatibility finder is 42%  
**Description:** Structured A/B testing programme using PostHog's feature flag and experimentation framework. Initial focus areas: (a) hero CTA button copy and placement; (b) product detail page "Where to Buy" CTA prominence; (c) compatibility finder results UX; (d) distributor application form length reduction. Minimum 2-week test durations per experiment, statistical significance threshold at 95%.  
**Dependencies:** PostHog experimentation module configured; TwinMOS Marketing sign-off on test hypotheses; sufficient traffic volume for statistical significance (>1,500 sessions/page/week minimum)  
**Acceptance Criteria:** CRO programme charter approved; first 3 A/B tests live; monthly experiment readout dashboard operational

---

#### BL-02-003: Long-Tail Keyword Content Strategy Execution
**Priority:** High  
**Category:** SEO & CRO  
**Effort Estimate:** 2–3 months (strategy + 20 articles) + ongoing  
**Origin:** Marketing Director request in Phase 3 retro; current organic traffic concentrated in branded search terms  
**Description:** Develop and publish 20+ long-tail keyword articles targeting high-intent informational queries ("best DDR5 RAM for AMD Ryzen 7000", "how to upgrade laptop RAM", "NVMe SSD for PS5 compatible 2027", etc.). Articles to follow existing `08-learn/` content templates in the CMS. SEO brief per article required before copywriting begins.  
**Dependencies:** SEO keyword research brief; Marketing sign-off on content calendar; CMS Editor access for TwinMOS Marketing team  
**Acceptance Criteria:** 20 articles published and indexed; target keywords tracked in Search Console; no thin content penalties

---

#### BL-02-004: Backlink Acquisition Programme
**Priority:** Medium  
**Category:** SEO & CRO  
**Effort Estimate:** Ongoing (typically 3–6 months for first results)  
**Origin:** Phase 1 SEO audit — domain authority significantly below Kingston/Corsair benchmarks  
**Description:** Structured outreach programme to acquire high-quality editorial backlinks from technology media (Tom's Hardware, Anandtech, Techradar), gaming influencers, and regional tech publications in India, UAE, and Africa. Not a paid link-building scheme — focus on genuine editorial coverage of product launches, white papers, and benchmark publications.  
**Dependencies:** Marketing Director coordination; PR agency relationship (if applicable); benchmark content published  
**Acceptance Criteria:** Monthly backlink acquisition report; domain authority improvement tracked in Ahrefs/Semrush; no toxic link penalties

---

#### BL-02-005: International SEO Deep Optimisation (hreflang Audit + Regional Sitemaps)
**Priority:** Medium  
**Category:** SEO & CRO  
**Effort Estimate:** 2–3 weeks  
**Origin:** Phase 2 hreflang implementation — spot issues found in Arabic locale during Phase 3 QA  
**Description:** Full audit of all hreflang annotations, `x-default` tags, and XML sitemap accuracy across all 7 active locales. Resolve any canonical URL conflicts between locale variants. Implement locale-specific sitemaps submitted individually to Google Search Console per regional property. Prepare sitemap architecture for ES/PT/DE locale launch.  
**Dependencies:** Google Search Console multi-region property access; all locales stable  
**Acceptance Criteria:** Zero hreflang errors in Google Search Console; all locale sitemaps indexed; crawl budget analysis shows efficient indexation

---

#### BL-02-006: Core Web Vitals Continuous Improvement
**Priority:** Medium  
**Category:** SEO & CRO  
**Effort Estimate:** Quarterly reviews, 1–2 days per review cycle  
**Origin:** Ongoing maintenance obligation  
**Description:** Quarterly performance audit using Lighthouse CI, PageSpeed Insights CrUX data, and WebPageTest. Address any regressions introduced by new features or third-party script changes (Stripe, Chatwoot, PostHog). Maintain Phase 3 achieved targets: LCP ≤ 1.3s, CLS < 0.01, INP < 72ms.  
**Dependencies:** Lighthouse CI integrated in GitHub Actions (already in place from Phase 1 CI/CD)  
**Acceptance Criteria:** CWV scores maintained at Phase 3 levels; no new Core Web Vitals "Needs Improvement" flags in Search Console

---

#### BL-02-007: Structured Data Expansion (Product Schema v2)
**Priority:** Medium  
**Category:** SEO & CRO  
**Effort Estimate:** 2 weeks  
**Origin:** Google's expanding Product schema support for e-commerce trust signals  
**Description:** Expand Schema.org Product markup on all 118 SKU pages to include: `AggregateRating` from warranty registration data, `Offer` with e-commerce pricing, `Review` schema for curated reviews, and `MerchantReturnPolicy`. Add `VideoObject` schema for any embedded product videos. Update `FAQPage` schema with current FAQ content.  
**Dependencies:** E-commerce pricing data available; review aggregation mechanism defined  
**Acceptance Criteria:** All SKU pages pass Google's Rich Results Test; no structured data errors in Search Console

---

#### BL-02-008: Competitor Gap Analysis — Quarterly Content Audit
**Priority:** Low  
**Category:** SEO & CRO  
**Effort Estimate:** 3–5 days per audit cycle  
**Origin:** BRD v3.0 Appendix C — Competitor Benchmark Summary  
**Description:** Quarterly structured comparison against Kingston, Corsair, G.Skill, ADATA, and TEAMGROUP for: (a) content coverage gaps, (b) feature capability gaps, (c) SERP position tracking on shared target keywords, (d) new product lines or campaigns the competition has launched that TwinMOS should match. Produces a quarterly gap report for Marketing and Product teams.  
**Dependencies:** Competitor tracking set up in SEO tooling  
**Acceptance Criteria:** Quarterly gap report delivered to Marketing Director; actionable items triaged into content/feature backlog

---

### BL-03 — Commerce & E-Commerce

#### BL-03-001: E-Commerce Expansion — Additional Markets
**Priority:** High  
**Category:** Commerce & E-Commerce  
**Effort Estimate:** 4–6 weeks per new market  
**Origin:** Phase 3 launched UAE, India, KSA; strategic plan targets additional markets  
**Description:** Expand direct e-commerce to additional strategic markets: (1) Egypt — EGP currency + Egyptian tax rules + Arabic checkout localization; (2) Nigeria — NGN + local payment methods (Paystack); (3) Malaysia/Singapore — MYR/SGD + local payment gateways; (4) UK — GBP + UK VAT + UKCA compliance statements. Each market requires: tax configuration, currency, local payment method integration, and regional legal compliance review.  
**Dependencies:** Finance team market-entry approval; legal review per jurisdiction; local payment gateway contracts  
**Acceptance Criteria:** Each new market passes end-to-end checkout test; local payment method confirmed; tax calculation audited by Finance

---

#### BL-03-002: Advanced Loyalty Mechanics — Tiered Membership
**Priority:** Medium  
**Category:** Commerce & E-Commerce  
**Effort Estimate:** 6–8 weeks  
**Origin:** Phase 3 loyalty program delivered basic points accumulation; Phase 4 planned to add tiers  
**Description:** Expand the Phase 3 loyalty programme to include: (a) three membership tiers (Bronze / Silver / Gold) based on cumulative purchase value; (b) tier-specific benefits (extended warranty, early access, exclusive discounts, dedicated support); (c) points redemption marketplace (discounts, branded accessories); (d) automated tier upgrade/downgrade logic; (e) loyalty widget in account dashboard. Requires Strapi schema expansion and Medusa.js loyalty plugin or custom implementation.  
**Dependencies:** Phase 3 loyalty programme stable; Medusa.js version compatibility confirmed  
**Acceptance Criteria:** All 3 tiers functional; automated tier transitions working; points redemption end-to-end tested; 100 enrolled loyalty members validated

---

#### BL-03-003: Customer Review & Rating System
**Priority:** Medium  
**Category:** Commerce & E-Commerce  
**Effort Estimate:** 3–4 weeks  
**Origin:** Identified in Phase 3 retro — product pages lack social proof; competitors (Kingston, Corsair) show customer reviews prominently  
**Description:** Implement a native customer review and star-rating system for product pages. Features: review submission (requires verified purchaser status from Medusa.js order history), moderation queue in Strapi CMS, 1–5 star ratings, review display with most-helpful sorting, Schema.org `AggregateRating` auto-generated from review data, and anti-spam validation. Email flow to request review 14 days post-delivery.  
**Dependencies:** E-commerce order data available (Phase 3 prerequisite met); Strapi review collection type defined  
**Acceptance Criteria:** Reviews display on product pages; verified-purchase gate working; moderation queue functional; Schema.org AggregateRating passing Rich Results Test

---

#### BL-03-004: Buy Now Pay Later (BNPL) Integration
**Priority:** Medium  
**Category:** Commerce & E-Commerce  
**Effort Estimate:** 2–3 weeks  
**Origin:** Market research — BNPL adoption high in UAE (Tabby/Tamara), India (Pay Later), and KSA  
**Description:** Integrate BNPL providers alongside Stripe Checkout: Tabby (UAE + KSA + Egypt), Tamara (UAE + KSA), Razorpay PayLater (India). Requires Medusa.js payment provider plugins or custom API integration per BNPL provider. Legal review of consumer credit implications per jurisdiction required.  
**Dependencies:** BNPL provider contracts executed by Finance; legal sign-off per jurisdiction  
**Acceptance Criteria:** BNPL displayed at checkout with eligibility check; end-to-end payment flow tested per provider; BNPL T&C displayed to customers

---

#### BL-03-005: Wholesale / B2B Pricing Portal
**Priority:** Medium  
**Category:** Commerce & E-Commerce  
**Effort Estimate:** 5–7 weeks  
**Origin:** Sales team request — distributors and resellers want to place orders directly via the portal  
**Description:** Extend the Phase 2 Partner Portal with B2B ordering capability: tiered wholesale pricing based on partner tier, minimum order quantities, purchase order upload support, net payment terms (Net 30/60), and invoice generation. Requires Medusa.js B2B plugin or custom order management extension.  
**Dependencies:** Partner Portal (Phase 2) stable; Sales team defines pricing tiers; Finance defines payment terms policy  
**Acceptance Criteria:** Authenticated B2B users see wholesale prices; MOQ enforcement working; PO upload functional; invoice email generated on order confirmation

---

#### BL-03-006: AI-Driven Product Recommendations
**Priority:** Low  
**Category:** Commerce & E-Commerce  
**Effort Estimate:** 6–10 weeks  
**Origin:** BRD v3.0 §3.2 Out-of-Scope  
**Description:** Implement ML-based product recommendation engine using collaborative filtering and content-based filtering. Surfaces: "Customers also bought", "Frequently bought together", "Compatible upgrades" on product detail pages. Options: (a) self-hosted recommendation engine (TensorFlow.js or Python microservice); (b) third-party service (Recombee, LimeSpot). PostHog behavioural data from Phase 3 provides the training dataset base.  
**Dependencies:** Sufficient transaction volume for collaborative filtering (minimum ~500 orders); PostHog event tracking verified  
**Acceptance Criteria:** Recommendation widgets appear on all SKU pages; click-through rate on recommendations > 5%; A/B test validates revenue uplift

---

### BL-04 — Content & Editorial

#### BL-04-001: Investor Relations Section Activation
**Priority:** Medium  
**Category:** Content & Editorial  
**Effort Estimate:** 2–3 weeks (infrastructure exists; content creation is primary effort)  
**Origin:** BRD v3.0 §3.2 Out-of-Scope  
**Description:** Activate the reserved Investor Relations section. Pages to include: company financial highlights, governance structure, key financial metrics, annual reports (PDF downloads), ESG statement, and investor contact form. The section skeleton is already defined in the content map (reserved status). Requires content from Finance/Legal and executive approval of all published figures.  
**Dependencies:** Finance sign-off on published metrics; Legal review of investor communication guidelines; Chairman approval  
**Acceptance Criteria:** All IR pages live; PDF downloads functional; investor inquiry form routed to correct contact; Financial figures approved by Finance Director

---

#### BL-04-002: Enhanced Case Studies Programme
**Priority:** Medium  
**Category:** Content & Editorial  
**Effort Estimate:** 2–4 weeks per case study (content creation effort)  
**Origin:** Solutions Hub case-study template exists; currently no published case studies  
**Dependencies:** Customer approvals for named case studies; Marketing Director content brief; photography/assets from customers  
**Acceptance Criteria:** 6 case studies published; Schema.org Article markup applied; internal cross-linking from relevant Solutions pages

---

#### BL-04-003: Video Content Integration
**Priority:** Medium  
**Category:** Content & Editorial  
**Effort Estimate:** 3–4 weeks (platform integration; video production is separate)  
**Origin:** Competitive gap analysis — Kingston and Corsair use embedded video heavily on product pages  
**Description:** Integrate YouTube/Vimeo video player (lazy-loaded, performance-safe) on: (a) product detail pages for installation videos and teardown reviews; (b) Technology Hub for R&D explainer videos; (c) Gaming Hub for RGB lighting showcase and build gallery videos; (d) Learn Hub for how-to guides. Video schema markup (`VideoObject`) applied to all embedded videos. TwinMOS Marketing to produce video assets (outside development scope).  
**Dependencies:** TwinMOS Marketing to produce/curate video library; YouTube channel ownership confirmed; production budget approved  
**Acceptance Criteria:** Video player loads lazy (no CLS impact); LCP not degraded by video integration; VideoObject schema valid

---

#### BL-04-004: Whitepaper & Research Report Hub
**Priority:** Medium  
**Category:** Content & Editorial  
**Effort Estimate:** 2 weeks (gating infrastructure exists from Phase 2)  
**Origin:** Phase 2 introduced whitepaper gating for lead capture; currently no whitepapers published  
**Description:** Publish 4–6 technical whitepapers/research reports behind a lead-capture gate (email + company name minimum). Topics: (1) DDR5 vs. DDR4 Enterprise Migration Guide; (2) NVMe Gen5 SSD Performance Benchmarks 2026; (3) TwinMOS Quality Assurance & Manufacturing Standards; (4) PCIe Gen5 Deep Dive for System Builders; (5) Africa Market IT Infrastructure Report. Each whitepaper drives B2B lead generation.  
**Dependencies:** Technical writers engaged; Marketing Director approves topics and tone; gating form connected to HubSpot CRM  
**Acceptance Criteria:** Gated download flow working; lead data flowing to HubSpot; PDF watermarking applied; GDPR-compliant consent recorded

---

#### BL-04-005: User-Generated Content (Build Showcase Expansion)
**Priority:** Medium  
**Category:** Content & Editorial  
**Effort Estimate:** 2–3 weeks  
**Origin:** Phase 2 Gaming Hub — Build Gallery launched with basic submission form; community engagement has been strong  
**Description:** Expand the Build Gallery from Gaming Hub to a site-wide "Powered by TwinMOS" showcase: (a) community build submissions moderated by Marketing; (b) monthly "Build of the Month" competition with prize; (c) Instagram/Reddit integration to pull tagged #TwinMOS posts (Astro island); (d) social sharing cards per build entry. Maintains existing Strapi moderation queue infrastructure.  
**Dependencies:** Marketing Director defines contest rules and prizes; social API keys (Instagram Basic Display API, Reddit API)  
**Acceptance Criteria:** UGC submission → moderation → publish flow working; social share cards generate correct OG tags; monthly contest mechanics functional

---

#### BL-04-006: Press Room Enhancement
**Priority:** Low  
**Category:** Content & Editorial  
**Effort Estimate:** 1–2 weeks  
**Origin:** Current press room is basic; TwinMOS has significant trade press opportunities  
**Description:** Enhance the Press Room (`02-about/14-press-room.md`) with: (a) filterable press release archive by year/category; (b) Media Kit download hub (logos, product images, photography guidelines, company fact sheet PDF); (c) press inquiry form with routing to Marketing Director; (d) badge display for UAE Superbrand, ISO 9001, and other awards. All assets behind easy-access download zone.  
**Dependencies:** Marketing Director approves Media Kit assets; Photography brief completed  
**Acceptance Criteria:** Press releases filterable; all Media Kit assets downloadable; press inquiry form tested

---

#### BL-04-007: Job Listing Dynamic Integration
**Priority:** Low  
**Category:** Content & Editorial  
**Effort Estimate:** 2–3 weeks  
**Origin:** Phase 1 Careers section uses static templates; TwinMOS recruiting grows with India/Africa expansion  
**Description:** Connect Careers Hub to a live ATS (Applicant Tracking System — options: Lever, Greenhouse, Ashby, or Workable) via API. Job listings pull dynamically from ATS rather than requiring CMS edits. Application form submits directly to ATS candidate pool. Job listing Schema.org `JobPosting` markup auto-generated from ATS data.  
**Dependencies:** ATS vendor selected and contracted by HR; API credentials provided  
**Acceptance Criteria:** Dynamic job listings update from ATS within 15 minutes; application submissions appear in ATS; JobPosting schema valid

---

### BL-05 — Technology & Platform

#### BL-05-001: Strapi v5 → v6 Upgrade Planning
**Priority:** High  
**Category:** Technology & Platform  
**Effort Estimate:** 3–5 weeks (upgrade + regression testing)  
**Origin:** Strapi v6 roadmap — expected GA Q1/Q2 2028 with breaking plugin API changes  
**Description:** Plan and execute the Strapi CMS upgrade from v5 to v6 once v6 reaches GA stability. Key tasks: (a) review Strapi v6 migration guide and breaking changes; (b) audit all custom plugins and middleware for compatibility; (c) upgrade in staging with full regression test suite; (d) schedule maintenance window for production upgrade; (e) verify all 25+ content collection types post-upgrade. Do NOT rush — wait for at least one minor release after v6 GA.  
**Dependencies:** Strapi v6 GA release; migration guide published; staging environment healthy  
**Acceptance Criteria:** Strapi running v6.x in production; all content types intact; admin UI functional; no regression in Phase 1–3 features

---

#### BL-05-002: Astro 5 → Astro 6 Upgrade
**Priority:** High  
**Category:** Technology & Platform  
**Effort Estimate:** 1–2 weeks  
**Origin:** Framework maintenance — Astro release cadence is approximately 6-month major cycles  
**Description:** Upgrade Astro frontend from v5 to v6 (when available). Astro upgrades have historically been well-managed with comprehensive migration guides. Key focus: (a) review Content Collections API changes; (b) verify all React 19 island components; (c) re-run Lighthouse CI post-upgrade; (d) verify SSR/hybrid rendering behavior unchanged; (e) validate all `<Image>` component optimizations.  
**Dependencies:** Astro 6 release; Astro migration guide; staging environment  
**Acceptance Criteria:** Build succeeds; all pages render correctly; Lighthouse scores maintained at Phase 3 levels

---

#### BL-05-003: PostgreSQL 16 → Latest LTS Upgrade
**Priority:** Medium  
**Category:** Technology & Platform  
**Effort Estimate:** 1 week (with Coolify managed upgrade path)  
**Origin:** Database maintenance — PostgreSQL 16 mainstream support ends November 2025; should be on 17 or LTS release  
**Description:** Upgrade PostgreSQL from 16 to the current LTS release. Coolify manages PostgreSQL containers — upgrade path via Coolify dashboard or manual pg_upgrade. Full database backup required pre-upgrade. Strapi v5 compatibility with new PostgreSQL version verified. Zero data loss mandatory.  
**Dependencies:** Full database backup verified; Strapi PostgreSQL driver compatibility confirmed; maintenance window agreed  
**Acceptance Criteria:** PostgreSQL running on new LTS version; all Strapi queries performing correctly; no data loss; backup/restore drill completed post-upgrade

---

#### BL-05-004: MeiliSearch → Typesense Migration Evaluation
**Priority:** Medium  
**Category:** Technology & Platform  
**Effort Estimate:** 2–3 weeks (evaluation + POC)  
**Origin:** Phase 3 lessons learned — MeiliSearch performance under high write-load showed occasional search index lag during product catalog bulk updates; Typesense has superior write throughput  
**Description:** Evaluate whether migrating search from MeiliSearch to Typesense provides material benefit at current traffic/data volumes. Produce a POC with Typesense Cloud or self-hosted Typesense, benchmark index write performance and query latency vs. current MeiliSearch implementation, and deliver a recommendation. Only proceed with migration if clear performance benefit is demonstrated.  
**Dependencies:** Current MeiliSearch performance baseline metrics from Phase 3; test data set available  
**Acceptance Criteria:** Technical evaluation report delivered; POC benchmarks documented; go/no-go recommendation made

---

#### BL-05-005: CDN Strategy Review — Cloudflare R2 Asset Migration
**Priority:** Medium  
**Category:** Technology & Platform  
**Effort Estimate:** 2 weeks  
**Origin:** Phase 1 infrastructure — product images stored on Backblaze B2; egress costs growing with traffic  
**Description:** Evaluate migrating product image assets from Backblaze B2 to Cloudflare R2 (zero egress fees) or Cloudflare Images (automatic resizing + WebP/AVIF conversion). Cloudflare R2 is already in the infrastructure stack (Pages + CDN). Migration would eliminate B2 egress costs and simplify the CDN chain. Impact: update ImgProxy backend or remove ImgProxy in favor of Cloudflare Images transform URLs.  
**Dependencies:** Current B2 egress cost analysis; image count and total storage size audit  
**Acceptance Criteria:** Cost analysis delivered; migration POC tested; production migration executed with zero broken image URLs; LCP maintained

---

#### BL-05-006: Headless CMS Multi-Tenant Evaluation
**Priority:** Medium  
**Category:** Technology & Platform  
**Effort Estimate:** 3–4 weeks (architecture evaluation only)  
**Origin:** ERP team and Marketing team both want CMS access for different purposes; content governance becoming complex  
**Description:** Evaluate Strapi's multi-tenant capabilities (Strapi Cloud or self-hosted multi-tenant deployment) to support: (a) TwinMOS Marketing (primary CMS users); (b) Regional offices editing region-specific pages; (c) ERP team with read-only product sync access; (d) External translation vendors with scoped write access per locale. Deliverable: architecture recommendation document.  
**Dependencies:** Current Strapi role configuration audit; user growth projections from Marketing  
**Acceptance Criteria:** Architecture recommendation document approved by TwinMOS IT Lead; implementation roadmap if proceeding

---

#### BL-05-007: Edge Functions for Dynamic Personalisation
**Priority:** Low  
**Category:** Technology & Platform  
**Effort Estimate:** 4–6 weeks  
**Origin:** Marketing Director request — show Indian visitors INR prices by default; show Arabic visitors RTL locale by default  
**Description:** Implement Cloudflare Workers edge functions for: (a) geo-IP-based locale detection and redirect (replace current client-side JS detection with server-side at edge); (b) currency selection persistence via Cloudflare KV; (c) A/B test variant assignment at edge (integrates with PostHog experimentation). Reduces client-side JS overhead and eliminates locale-flash for international visitors.  
**Dependencies:** Cloudflare Workers enabled on account; geo-IP detection strategy agreed with Privacy team (GDPR compliance for EU visitors)  
**Acceptance Criteria:** Geo-IP locale detection working with <5ms edge latency; no CLS from locale-flash; GDPR-compliant (no PII stored at edge)

---

#### BL-05-008: Progressive Web App (PWA) Enhancements
**Priority:** Low  
**Category:** Technology & Platform  
**Effort Estimate:** 2–3 weeks  
**Origin:** Mobile traffic now constitutes ~58% of all sessions (Phase 3 PostHog data)  
**Description:** Enhance the existing service worker and Web App Manifest to provide: (a) offline-capable product catalog browsing (stale-while-revalidate caching for product pages); (b) "Add to Home Screen" prompt for mobile; (c) push notification capability for loyalty program updates and promotional campaigns (with explicit user opt-in, GDPR-compliant); (d) background sync for warranty registration form submissions when offline.  
**Dependencies:** Service worker infrastructure (already deployed in Phase 1); push notification service (Cloudflare Web Push or OneSignal)  
**Acceptance Criteria:** PWA audit score >= 90; offline browsing of 50+ most popular pages; push notification opt-in rate tracked

---

#### BL-05-009: Dependency Vulnerability Monitoring Automation
**Priority:** High  
**Category:** Technology & Platform  
**Effort Estimate:** 1 week (automation setup)  
**Origin:** Phase 3 security pass — manual dependency audits were time-consuming; need automated alerting  
**Description:** Configure automated dependency vulnerability scanning: (a) Dependabot alerts enabled for both Astro frontend and Strapi backend GitHub repos; (b) `npm audit` and Snyk integration in CI/CD pipeline with build failure on high/critical CVEs; (c) weekly automated PR from Dependabot for patch-level updates; (d) monthly manual review of major version bumps. Ensures supply chain security without manual overhead.  
**Dependencies:** GitHub Admin access to enable Dependabot; Snyk account (free tier sufficient)  
**Acceptance Criteria:** Dependabot alerts enabled; CI build fails on new high/critical CVE; weekly patch PRs appearing; no unaddressed high/critical CVEs older than 14 days

---

### BL-06 — Analytics & Data

#### BL-06-001: PostHog Advanced Cohort Analysis
**Priority:** High  
**Category:** Analytics & Data  
**Effort Estimate:** 2–3 weeks (configuration + dashboard build)  
**Origin:** Phase 3 deployed PostHog OSS; basic event tracking only; Marketing requests retention and funnel analysis  
**Description:** Configure advanced PostHog analytics: (a) user cohort analysis by acquisition channel, locale, device type; (b) conversion funnel analysis for key flows (visitor → product view → form submit → distributor application); (c) retention analysis for e-commerce customers; (d) session recording sampling (5% of sessions, no PII captured) for UX research; (e) custom PostHog dashboard for Marketing Director with weekly automated report email.  
**Dependencies:** PostHog OSS v1.42+ running on Hetzner; GDPR-compliant event tracking confirmed (no PII in event properties)  
**Acceptance Criteria:** Key funnels configured; retention chart showing weekly/monthly cohorts; Marketing Director dashboard operational

---

#### BL-06-002: Business Intelligence Dashboard (Metabase)
**Priority:** High  
**Category:** Analytics & Data  
**Effort Estimate:** 3–4 weeks  
**Origin:** Management reporting request — Chairman and GM want a real-time sales and engagement dashboard without needing to log into PostHog/Plausible separately  
**Description:** Deploy Metabase (self-hosted on Hetzner alongside existing services) connected to the Strapi PostgreSQL database for: (a) e-commerce order volumes and revenue by region/product; (b) lead capture volumes and source attribution; (c) warranty registration trends; (d) partner portal activity; (e) anti-counterfeit SN-check volumes by region. Read-only Metabase user for Chairman and GM. Sensitive data masked per role.  
**Dependencies:** Strapi PostgreSQL read-replica or read-only user configured; Metabase server provisioned (can co-host on existing Hetzner VPS)  
**Acceptance Criteria:** Metabase dashboard live; key business metrics updating daily; Chairman and GM accounts provisioned; no write access to production DB

---

#### BL-06-003: Google Tag Manager Audit & Cleanup
**Priority:** Medium  
**Category:** Analytics & Data  
**Effort Estimate:** 1 week  
**Origin:** Phase 1 GTM setup; accumulated tags from Phase 2–3 campaigns; needs cleanup  
**Description:** Full GTM container audit: (a) remove unused/redundant tags from Phase 1–2 campaigns; (b) verify GA4 event tracking accuracy against PostHog event data; (c) document all active tags, triggers, and variables; (d) implement GTM tag firing rules to prevent duplicate analytics events; (e) server-side GTM evaluation for improved performance and privacy.  
**Dependencies:** GTM admin access; GA4 property access  
**Acceptance Criteria:** GTM container audit report delivered; unused tags removed; no duplicate events in GA4; GTM documentation updated

---

#### BL-06-004: Data Retention & GDPR Compliance Audit
**Priority:** Medium  
**Category:** Analytics & Data  
**Effort Estimate:** 2 weeks  
**Origin:** GDPR/UAE PDPL/India DPDP ongoing compliance obligation; Phase 1 data retention policy defined but not fully automated  
**Description:** Implement automated data retention enforcement: (a) Strapi scheduled job to anonymize/delete warranty registrations older than retention period (per Data Retention Policy `TwinMOSWebsiteDataRetentionPolicy.md`); (b) PostgreSQL data age partitioning for form submissions; (c) PostHog data anonymization for users who request deletion; (d) e-commerce order data retention per jurisdiction (UAE 7 years, EU 5 years, India 3 years). Annual audit of all personal data stores.  
**Dependencies:** Legal counsel confirms retention periods per jurisdiction; Strapi scheduled jobs functional; Data Deletion Request form live (Phase 1)  
**Acceptance Criteria:** Automated deletion jobs tested in staging; no personal data older than defined retention periods; annual audit checklist completed; data deletion requests processed within 30 days (GDPR/PDPL requirement)

---

#### BL-06-005: Search Analytics Deep Dive
**Priority:** Low  
**Category:** Analytics & Data  
**Effort Estimate:** 1–2 weeks  
**Origin:** MeiliSearch has analytics capability but not fully exploited during Phase 1–3  
**Description:** Activate and analyze MeiliSearch search analytics: (a) "no results" query tracking (reveals product naming gaps and missing content); (b) popular search terms feed into content calendar; (c) search refinement rates (indicates poor initial results); (d) search-to-conversion attribution in PostHog. Monthly search analytics report to Marketing Director.  
**Dependencies:** MeiliSearch analytics API enabled; PostHog event tracking for search interactions  
**Acceptance Criteria:** Monthly search analytics report delivered; top-10 "no results" queries actioned monthly; search conversion tracked

---

### BL-07 — Mobile & Native Apps

#### BL-07-001: Native Mobile App — Evaluation & MVP
**Priority:** Medium  
**Category:** Mobile & Native Apps  
**Effort Estimate:** 4–6 months (React Native or Flutter MVP)  
**Origin:** BRD v3.0 §3.2 Out-of-Scope; significant mobile traffic (58% of sessions)  
**Description:** Evaluate and potentially build a native mobile app (iOS + Android) using React Native (leverages existing React 19 component knowledge) or Flutter. MVP scope: product catalog browsing, compatibility finder, Where to Buy locator, warranty registration, and loyalty card. E-commerce capability as Phase 2 of the app. App store submission to Apple App Store and Google Play.  
**Dependencies:** Business case for app vs. PWA enhancement; React Native developer resource available; App Store developer accounts; UX/UI design for mobile-first experience  
**Acceptance Criteria:** iOS + Android MVP submitted to app stores; crash-free rate > 99.5%; App Store rating >= 4.0 stars; push notification delivery rate > 90%

---

#### BL-07-002: iOS App — Standalone Delivery
**Priority:** Low  
**Category:** Mobile & Native Apps  
**Effort Estimate:** 3–4 months (assuming React Native decision)  
**Origin:** BRD v3.0 §3.2 Out-of-Scope  
**Description:** Standalone iOS app delivery if platform-first strategy (iOS before Android) is chosen. See BL-07-001 for full context.  
**Dependencies:** BL-07-001 evaluation complete; Apple Developer Account active  
**Acceptance Criteria:** App live on App Store; TestFlight beta with 50+ testers

---

#### BL-07-003: Android App — Standalone Delivery
**Priority:** Low  
**Category:** Mobile & Native Apps  
**Effort Estimate:** 3–4 months (parallel to iOS or sequential)  
**Origin:** BRD v3.0 §3.2 Out-of-Scope  
**Description:** Standalone Android app delivery. Android-first may be preferred given market demographics in India and Africa. See BL-07-001.  
**Dependencies:** BL-07-001 evaluation complete; Google Play Console account active  
**Acceptance Criteria:** App live on Google Play; open beta testing with 100+ users

---

### BL-08 — B2B / Enterprise

#### BL-08-001: Enterprise / Data Centre Product Portal
**Priority:** Medium  
**Category:** B2B / Enterprise  
**Effort Estimate:** 6–8 weeks  
**Origin:** Solutions section `08-telco-bfsi-government.md` + `06-embedded-industrial.md` — enterprise customers need a dedicated procurement portal  
**Description:** Build a dedicated Enterprise Procurement Portal behind the existing Partner Portal authentication (Better Auth). Features: (a) enterprise-specific product catalog (server ECC memory, industrial embedded SKUs); (b) RFQ (Request for Quotation) workflow with SLA; (c) bulk quote tool (CSV upload of BOM quantities); (d) procurement documentation (ISO 9001 certificates, JEDEC compliance docs, ROHS/REACH compliance documents) downloadable; (e) dedicated enterprise contact routing.  
**Dependencies:** Enterprise product catalog content populated; Sales team defines RFQ workflow; B2B pricing structure confirmed  
**Acceptance Criteria:** Enterprise portal accessible to authenticated enterprise accounts; RFQ workflow end-to-end tested; bulk quote tool accepts 100-line CSV; procurement docs download confirmed

---

#### BL-08-002: OEM / ODM Partner Program Portal Enhancement
**Priority:** Medium  
**Category:** B2B / Enterprise  
**Effort Estimate:** 3–4 weeks  
**Origin:** Phase 2 Partner Portal launched; OEM/ODM program section exists but lacks interactive features  
**Description:** Enhance the OEM/ODM section of the Partner Portal with: (a) sample request form with automated fulfilment routing to Taiwan manufacturing team; (b) OEM spec sheet customization tool (interactive PDF with company logo, custom capacity/speed selections); (c) MOQ and lead time calculator; (d) NDA/OEM agreement digital signature workflow (DocuSign or similar); (e) OEM project tracker (status updates for open OEM projects).  
**Dependencies:** Taiwan manufacturing team API or manual process for sample fulfilment; DocuSign or equivalent e-signature service contract  
**Acceptance Criteria:** Sample request form routes to Taiwan team within 1 business day; OEM spec PDF generated correctly; lead time calculator accurate; e-signature workflow functional

---

#### BL-08-003: System Builder Procurement Toolkit
**Priority:** Low  
**Category:** B2B / Enterprise  
**Effort Estimate:** 3–4 weeks  
**Origin:** Solutions section `03-system-builders.md` — system builder segment identified as high-volume buyer  
**Description:** Build a dedicated System Builder toolkit within the existing portal infrastructure: (a) system builder account tier in Better Auth; (b) procurement guide PDF download (BOM optimization, TwinMOS product matrix for common platform configurations); (c) weekly pricing CSV feed for system builder price lists; (d) bulk RMA submission portal; (e) dedicated account manager assignment and contact routing.  
**Dependencies:** Sales team defines system builder eligibility criteria; weekly pricing feed from ERP available  
**Acceptance Criteria:** System builder accounts provisionable; pricing feed updated weekly; bulk RMA submission tested; dedicated contact routing functional

---

#### BL-08-004: TwinMOS ERP Integration — Write-Back (Phase 4 Extended)
**Priority:** Low  
**Category:** B2B / Enterprise  
**Effort Estimate:** 6–10 weeks  
**Origin:** Phase 2 ERP integration was read-only product sync; full bidirectional integration deferred  
**Description:** Extend the Phase 2 ERP read-only integration to include write-back capability: (a) warranty registrations → ERP warranty records; (b) e-commerce orders → ERP sales orders; (c) RMA requests → ERP return orders; (d) partner portal leads → ERP CRM module. Requires secure ERP API with write scope, idempotency handling, and rollback capability.  
**Dependencies:** ERP vendor provides write API scope and SLA; TwinMOS IT Lead approves ERP write access; data model alignment between Strapi and ERP validated  
**Acceptance Criteria:** All four write-back flows tested with sandbox ERP; no duplicate records created; rollback mechanism tested; TwinMOS IT Lead sign-off on integration security

---

### BL-09 — Accessibility & Compliance

#### BL-09-001: WCAG 2.2 AA Upgrade Assessment
**Priority:** High  
**Category:** Accessibility & Compliance  
**Effort Estimate:** 2–3 weeks (assessment + remediation)  
**Origin:** WCAG 2.2 published October 2023; currently compliant at 2.1 AA + EN 301 549; 2.2 adds new success criteria  
**Description:** Conduct a full WCAG 2.2 AA audit to identify gaps vs. the new success criteria (Focus Not Obscured, Dragging Movements, Target Size Minimum, Consistent Help, Redundant Entry, Accessible Authentication). Remediate all identified failures. Update accessibility statement to reflect 2.2 AA compliance. Update automated axe-core ruleset to WCAG 2.2 standard.  
**Dependencies:** axe-core 4.8+ (WCAG 2.2 support); NVDA/VoiceOver manual test scheduled  
**Acceptance Criteria:** Zero WCAG 2.2 AA failures on axe-core automated scan; manual audit of top 30 pages passes; accessibility statement updated

---

#### BL-09-002: Annual PEN Test & Security Audit
**Priority:** High  
**Category:** Accessibility & Compliance  
**Effort Estimate:** 2–3 weeks (external vendor engagement)  
**Origin:** Phase 3 penetration test concluded October 2027; annual test cycle needed  
**Description:** Commission an annual third-party penetration test covering: (a) frontend XSS, CSRF, CSP bypass; (b) Strapi API authentication and authorization; (c) Medusa.js e-commerce — payment flow injection, order manipulation; (d) Cloudflare WAF bypass attempts; (e) Dependency CVE status scan; (f) OWASP Top 10 2021 full checklist. Findings remediated per severity SLA.  
**Dependencies:** Security vendor engaged; test window agreed (minimum impact); credentials for authenticated testing prepared  
**Acceptance Criteria:** Pen test report delivered; zero critical findings unaddressed within 72 hours; zero high findings unaddressed within 2 weeks; test report archived in I.3 Security Operations

---

#### BL-09-003: Cookie Consent Management Platform Review
**Priority:** Medium  
**Category:** Accessibility & Compliance  
**Effort Estimate:** 1–2 weeks  
**Origin:** Phase 1 cookie consent implemented; ongoing regulatory changes (EU ePrivacy Regulation, UK PECR updates)  
**Description:** Annual review of cookie consent management: (a) audit all cookies and tracking scripts vs. declared categories in cookie policy; (b) verify consent signal passed correctly to Plausible, PostHog, GA4, GTM, and Stripe; (c) update cookie declaration for any new Phase 3 cookies (Medusa.js cart, loyalty programme); (d) verify India DPDP Act compliance for cookie consent (updated regulations); (e) verify KSA PDPL cookie requirements.  
**Dependencies:** Legal counsel review of current regulatory requirements; full cookie audit tool (CookieScan or Cookiebot)  
**Acceptance Criteria:** Cookie policy reflects all current cookies; consent signal correctly blocks analytics before opt-in; compliance verified for all active jurisdictions

---

### BL-10 — Marketing & Campaigns

#### BL-10-001: Launch Campaign — Spanish Markets
**Priority:** Medium  
**Category:** Marketing & Campaigns  
**Effort Estimate:** 2–3 weeks (campaign infrastructure; creative is Marketing's scope)  
**Origin:** BL-01-001 and BL-01-002 — when ES and PT locales launch, co-ordinated campaign needed  
**Description:** Build campaign landing pages and tracking for the Spanish and Portuguese locale launch: (a) dedicated launch landing page per locale; (b) UTM tracking parameters for all campaign links; (c) PostHog and GA4 campaign attribution configured; (d) email campaign via Resend to ES/PT segments in newsletter database; (e) Press release for Spanish and Lusophone media. Engineering scope is infrastructure; creative content is Marketing.  
**Dependencies:** ES/PT translations live; Marketing campaign brief  
**Acceptance Criteria:** Campaign landing pages live; UTM tracking verified; email campaign sent to correct segments; press release distributed

---

#### BL-10-002: India Market Deep Dive Campaign
**Priority:** Medium  
**Category:** Marketing & Campaigns  
**Effort Estimate:** 3–4 weeks  

---

#### BL-10-003: Social Proof & Trust Signal Enhancement
**Priority:** Medium  
**Category:** Marketing & Campaigns  
**Effort Estimate:** 2 weeks  
**Origin:** Phase 3 retro — customer surveys show "company credibility" as top purchase barrier for first-time buyers  
**Description:** Enhance trust signals across the site: (a) live partner/distributor count widget (e.g., "Trusted by 150+ distributors in 93+ countries"); (b) warranty registration counter widget; (c) UAE Superbrand badge prominently in homepage trust band; (d) ISO 9001 and other certification badges on About and Product pages; (e) press mention badges from Tom's Hardware, Anandtech, or local tech media; (f) testimonials carousel expansion with verified video testimonials.  
**Dependencies:** Partner count data from Strapi; press badges from Marketing; video testimonial production  
**Acceptance Criteria:** Trust widgets displaying correct live data; badge assets approved by Marketing; A/B test showing trust signal impact on conversion rate

---

#### BL-10-004: Email Marketing Automation Expansion
**Priority:** Medium  
**Category:** Marketing & Campaigns  
**Effort Estimate:** 3–4 weeks  
**Origin:** Phase 3 implemented basic marketing automation; Resend has advanced sequencing capability not yet used  
**Description:** Expand Resend-based email automation: (a) post-purchase onboarding series (3-email: registration reminder, care tips, accessory cross-sell); (b) loyalty programme engagement drip (points balance reminders, tier upgrade notifications); (c) win-back series for churned e-commerce customers (90+ days no purchase); (d) distributor application follow-up sequence; (e) re-engagement series for dormant newsletter subscribers.  
**Dependencies:** Resend Pro plan; customer segmentation data in Strapi; GDPR-compliant email consent records  
**Acceptance Criteria:** All email sequences active and tested; unsubscribe working per sequence; delivery rate > 98%; open rate benchmarked against Phase 3 baseline

---

#### BL-10-005: Trade Show & Event Digital Integration
**Priority:** Low  
**Category:** Marketing & Campaigns  
**Effort Estimate:** 2 weeks per event  
**Origin:** TwinMOS attends Computex 2026, GITEX Global 2025/2026, CES — events are significant business development moments  
**Description:** Build reusable event campaign infrastructure: (a) event landing page template with agenda, booth location, and meeting booking CTA; (b) digital badge / media kit download for event attendees; (c) post-event press release template with photo gallery support; (d) trade show lead capture form (scan-to-contact or QR code to a mobile-optimised form); (e) event-specific product showcase (highlight new products debuted at the event).  
**Dependencies:** Event calendar from Marketing; booth number/location per event; product announcement schedule  
**Acceptance Criteria:** Event page template reusable with 30-minute setup time; QR code form tested on mobile; media kit download confirmed; post-event gallery CMS workflow documented

---

## Backlog Prioritisation Guide for Phase 4 Retainer

When entering Phase 4, the following sequencing is recommended based on strategic impact and dependency order:

| Quarter | Focus Items | Rationale |
|---------|-------------|-----------|
| Q1 (Phase 4 start) | BL-01-001 (ES), BL-01-002 (PT), BL-02-001 (SEO monitoring), BL-05-009 (security automation), BL-09-001 (WCAG 2.2), BL-09-002 (annual pen test) | Locale launches are high-impact; security and compliance are non-deferrable |
| Q2 | BL-02-002 (CRO programme), BL-02-003 (SEO content), BL-06-001 (PostHog), BL-06-002 (Metabase), BL-03-002 (loyalty tiers) | Data-driven growth and commerce optimisation |
| Q3 | BL-01-003 (DE), BL-03-001 (e-commerce market expansion), BL-04-001 (Investor Relations), BL-05-001 (Strapi upgrade) | German locale + new e-commerce markets + platform maintenance |
| Q4 | BL-03-003 (reviews), BL-04-002 (case studies), BL-07-001 (mobile app evaluation), BL-08-001 (enterprise portal) | Long-cycle items that benefit from Q1–3 foundation |

---

*Document prepared by TwinMOS Digital Transformation Team | Confidential — Internal Use Only*
