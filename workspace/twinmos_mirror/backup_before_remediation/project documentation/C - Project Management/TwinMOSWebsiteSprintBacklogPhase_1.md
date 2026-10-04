# TwinMOS Corporate Website — Sprint Backlog: Phase 1 (Core Website)

**Document Reference:** TWN-PM-SPRINT-P1-2026-001  
**Version:** 1.0  
**Date:** 1 May 2026  
**Classification:** CONFIDENTIAL — Internal Use Only  
**Sprint Duration:** 2 weeks per sprint  
**Total Sprints:** 10 sprints (20 weeks)  
**Team Capacity:** 2 developers x 80 hours/sprint = 160 hours/sprint

---

## Sprint Overview

| Sprint | Theme | Weeks | Start | End | Capacity |
|--------|-------|-------|-------|-----|----------|
| Sprint 0 | Foundation & Setup | 1–2 | 27 Jul 2026 | 9 Aug 2026 | 160h |
| Sprint 1 | Content Modeling | 3–4 | 10 Aug 2026 | 23 Aug 2026 | 160h |
| Sprint 2 | Content Production — Part 1 | 5–6 | 24 Aug 2026 | 6 Sep 2026 | 160h |
| Sprint 3 | Content Production — Part 2 | 7–8 | 7 Sep 2026 | 20 Sep 2026 | 160h |
| Sprint 4 | Application Surfaces — Part 1 | 9–10 | 21 Sep 2026 | 4 Oct 2026 | 160h |
| Sprint 5 | Application Surfaces — Part 2 | 11–12 | 5 Oct 2026 | 18 Oct 2026 | 160h |
| Sprint 6 | Application Surfaces — Part 3 | 13–14 | 19 Oct 2026 | 1 Nov 2026 | 160h |
| Sprint 7 | Quality Gates | 15–16 | 2 Nov 2026 | 15 Nov 2026 | 160h |
| Sprint 8 | Pre-Launch & UAT | 17–18 | 16 Nov 2026 | 29 Nov 2026 | 160h |
| Sprint 9 | Launch & Hypercare | 19–20 | 30 Nov 2026 | 13 Dec 2026 | 160h |

---

## Sprint 0: Foundation & Setup (Weeks 1–2)

**Sprint Goal:** Development environment ready, repos scaffolded, CI/CD baseline running, first demo environment live.

**Capacity:** 160 hours (2 devs x 80h)

| ID | User Story / Task | Priority | Effort (h) | Owner | Acceptance Criteria |
|----|-------------------|----------|------------|-------|---------------------|
| P1-S0-001 | As a developer, I have the technology stack selected and locked so that development can begin | P0 | 4 | Team Lead | ADR-001 signed; stack decision documented |
| P1-S0-002 | As a developer, I have GitHub private repos provisioned for Astro frontend and Strapi backend | P0 | 4 | Team Lead | Both repos created; both devs have access; branch protection configured |
| P1-S0-003 | As a developer, I have a Hetzner VPS provisioned with Coolify for backend hosting | P0 | 8 | Team Lead | CX32 running; Coolify accessible; SSH keys configured |
| P1-S0-004 | As a developer, I have Cloudflare Pages configured for frontend hosting | P0 | 4 | Team Lead | Account created; preview deploys enabled |
| P1-S0-005 | As a developer, I have Backblaze B2 bucket created for object storage | P0 | 2 | Team Lead | Bucket created; S3-compatible keys generated |
| P1-S0-006 | As a developer, I have all SaaS accounts provisioned (Sentry, UptimeRobot, Resend, Plausible) | P0 | 4 | Senior Dev | All accounts active; credentials in Coolify secrets |
| P1-S0-007 | As a developer, I have a Linux workstation with Docker, Node.js 22 LTS, pnpm, VSCode + extensions | P0 | 8 | Both | Both workstations identical; docker --version confirms |
| P1-S0-008 | As a developer, I can run the full local stack via Docker Compose (Astro + Strapi + Postgres + MeiliSearch + ImgProxy) | P0 | 16 | Both | docker-compose up brings all services online; health checks pass |
| P1-S0-009 | As a team, we have ADR-001, ADR-002, and ADR-003 committed to the repo | P0 | 8 | Team Lead | Three ADRs in /docs/adr/; reviewed by both devs |
| P1-S0-010 | As a team, we have CI/CD baseline running (lint + test + build + deploy preview on every PR) | P0 | 12 | Team Lead | GitHub Actions green on main; PR preview deploys to Cloudflare |
| P1-S0-011 | As a PM, I have reviewed the Content Map and assigned phase flags to all 287 entries | P0 | 8 | TwinMOS PM | Spreadsheet with P1/P2/P3/P4 flags; shared with team |
| P1-S0-012 | As a PM, I have confirmed bi-weekly demo schedule and 24-hour decision turnaround commitment | P0 | 2 | TwinMOS PM | Calendar invites sent; commitment acknowledged |
| P1-S0-013 | As a team lead, I have identified a backup developer from Unisoft bench | P0 | 2 | Team Lead | Name and contact documented; briefed on project |
| P1-S0-014 | As a developer, I have Sentry connected and first preview deployment live | P1 | 4 | Team Lead | Sentry receives first error events; staging URL accessible |
| P1-S0-015 | As a developer, I have Lighthouse CI integrated with baseline scores recorded | P1 | 4 | Team Lead | Lighthouse CI runs on every PR; baseline JSON committed |

**Sprint 0 Definition of Done:**
- [ ] All P0 tasks complete
- [ ] Both developers can run full local stack
- [ ] First preview deployment live on Cloudflare Pages
- [ ] CI/CD pipeline green
- [ ] Demo to TwinMOS: staging URL + stack walkthrough

---

## Sprint 1: Content Modeling (Weeks 3–4)

**Sprint Goal:** Strapi content types modeled, Astro Content Collections schema defined, site-wide components skeleton complete.

**Capacity:** 160 hours

| ID | User Story / Task | Priority | Effort (h) | Owner | Acceptance Criteria |
|----|-------------------|----------|------------|-------|---------------------|
| P1-S1-001 | As a CMS admin, I have Strapi collections modeled for Product, SKU, Brand, Category, Subcategory, Retailer, Distributor | P0 | 24 | Senior Dev | All collections in Strapi admin; relationships wired; test data populated |
| P1-S1-002 | As a CMS admin, I have Strapi collections for NewsArticle, Event, KBArticle, Page, MenuItem, FormSubmission | P0 | 16 | Senior Dev | Collections created; field types match BRD §19 |
| P1-S1-003 | As a developer, I have Astro Content Collections schema (Zod) defined for all 16 content sections | P0 | 24 | Team Lead | src/content/config.ts validates all frontmatter; type-check passes |
| P1-S1-004 | As a developer, I have a migration script mapping 351 markdown files to Astro Content Collections | P0 | 24 | Team Lead | Script runs without errors; all files produce valid frontmatter |
| P1-S1-005 | As a developer, I have page-template prototypes for Hero+Body+CTA, Spec+Gallery, Article, Form, and Locator layouts | P0 | 20 | Team Lead | Five templates render without errors; responsive at all breakpoints |
| P1-S1-006 | As a developer, I have Tailwind configured with TwinMOS design tokens (colors, typography, spacing) | P0 | 12 | Team Lead | tailwind.config.ts contains all tokens; preview page demonstrates usage |
| P1-S1-007 | As a user, I see a site-wide header with navigation, language selector, and search | P0 | 16 | Both | Header renders on all pages; mobile hamburger works; search icon visible |
| P1-S1-008 | As a user, I see a site-wide footer with essential links, social media, and newsletter signup | P0 | 12 | Both | Footer renders on all pages; links functional; newsletter form present |
| P1-S1-009 | As a user, I see a cookie banner on first visit with accept/reject/customize options | P0 | 8 | Team Lead | Banner appears; preference stored; scripts load conditionally |
| P1-S1-010 | As a user, I see proper 404 and 500 error pages with helpful navigation | P0 | 4 | Team Lead | 404 page has search + quick links; 500 page has contact info |

**Sprint 1 Definition of Done:**
- [ ] All Strapi collections modeled and testable
- [ ] Astro Content Collections validate all markdown
- [ ] Site-wide components render on every page
- [ ] Design tokens applied consistently
- [ ] Demo to TwinMOS: content model walkthrough + component preview

---

## Sprint 2: Content Production — Part 1 (Weeks 5–6)

**Sprint Goal:** About, Gaming, Technology, and Learn Hub content pages fully routed and styled.

**Capacity:** 160 hours

| ID | User Story / Task | Priority | Effort (h) | Owner | Acceptance Criteria |
|----|-------------------|----------|------------|-------|---------------------|
| P1-S2-001 | As a visitor, I can browse all 17 About pages (overview, history, leadership, manufacturing, QA, certifications, awards, sustainability, CSR, global presence, entities, why-choose-us, mission-vision, press, fact-sheet) | P0 | 20 | Team Lead | All 17 pages render; navigation works; images load |
| P1-S2-002 | As a visitor, I can browse all 14 Gaming Hub static pages (brand story, products, RGB showcase placeholder, sync compatibility, overclocking, build gallery placeholder, build submit, esports, wallpapers, news feed, ambassador reserved, RGB software reserved) | P0 | 16 | Team Lead | All pages render; VOLTX branding consistent |
| P1-S2-003 | As a visitor, I can browse all 14 Technology / R&D pages (philosophy, DRAM, NAND, controller, thermal, power, security, integrity, PCIe Gen5, JEDEC, patents, roadmap reserved, whitepapers) | P0 | 16 | Team Lead | All pages render; technical content accurate |
| P1-S2-004 | As a visitor, I can browse all 64 Learn Hub pages (buying guides, explained articles, benchmarks, glossary, stories, blog) | P0 | 40 | Team Lead | All pages render; internal linking works; glossary searchable |
| P1-S2-005 | As a visitor, I can browse all 11 Solutions pages (gaming, content creation, system builders, enterprise, education, embedded, telco, data center reserved, case studies) | P0 | 12 | Team Lead | All pages render; vertical use cases clear |
| P1-S2-006 | As a visitor, I can browse all 11 Marketing pages (newsletter, promotions, campaigns, cross-sell, exit-intent) | P0 | 12 | Team Lead | All pages render; CTA buttons functional |
| P1-S2-007 | As a visitor, I can browse all 10 Careers pages (hub, life-at, benefits, locations, departments, internships, job listing template, application form, applicant privacy, FAQ) | P0 | 12 | Team Lead | All pages render; application form fields present |
| P1-S2-008 | As a visitor, I can browse all 16 Contact pages (general, sales, technical, distributor, OEM/ODM, quote, media, warranty, feedback, office locations) | P0 | 12 | Team Lead | All pages render; forms have correct routing |
| P1-S2-009 | As a developer, I have breadcrumb navigation working across all content pages | P1 | 8 | Team Lead | Breadcrumbs show correct hierarchy; Schema.org BreadcrumbList valid |
| P1-S2-010 | As a developer, I have skip links implemented for accessibility | P1 | 4 | Team Lead | "Skip to main content" link is first focusable element on all pages |

**Sprint 2 Definition of Done:**
- [ ] All content pages in About, Gaming, Technology, Learn, Solutions, Marketing, Careers, Contact render correctly
- [ ] Breadcrumbs and skip links functional
- [ ] All images have alt text
- [ ] Mobile responsive on all pages
- [ ] Demo to TwinMOS: content section walkthrough

---

## Sprint 3: Content Production — Part 2 (Weeks 7–8)

**Sprint Goal:** News & Events, Regional, Brand, SKU, and Legal pages complete; Design Approval milestone achieved.

**Capacity:** 160 hours

| ID | User Story / Task | Priority | Effort (h) | Owner | Acceptance Criteria |
|----|-------------------|----------|------------|-------|---------------------|
| P1-S3-001 | As a visitor, I can browse all 19+ News & Events pages plus article templates | P0 | 16 | Senior Dev | News hub, article template, press release template, event template all render |
| P1-S3-002 | As a visitor, I can browse all 28 Regional landing pages with country-specific content | P0 | 20 | Team Lead | All regional pages render; country auto-detect works; locale stubs ready |
| P1-S3-003 | As a visitor, I can browse all 11 Brand pages (brand hub + individual brand pages for VOLTX, TornadoX7, Thunder GX, Concord, CoreX Pro, Xtreme, Alpha Pro, Hyper H2 Ultra, ELITE Drive Pro, ProDrive Ultra, Mobile Disk X3) | P0 | 16 | Team Lead | All brand pages render; consistent brand storytelling |
| P1-S3-004 | As a visitor, I can view 100+ SKU detail pages with specifications, images, and datasheets | P0 | 32 | Senior Dev | All SKUs from _master-sku-reference render; spec tables complete; images load |
| P1-S3-005 | As a visitor, I can browse all 34 Legal & Compliance pages | P0 | 20 | Team Lead | All legal pages render; footer links correct; cookie policy accessible |
| P1-S3-006 | As a stakeholder, I can review and approve the complete design system in Figma | P0 | 8 | Team Lead | Figma files shared; feedback incorporated; sign-off obtained |
| P1-S3-007 | As a developer, I have the trust bar component showing certifications, country count, and heritage | P1 | 4 | Team Lead | Trust bar renders on homepage; data accurate per Company Profile |
| P1-S3-008 | As a developer, I have the search bar with auto-suggest functional | P1 | 16 | Senior Dev | Search returns results from MeiliSearch; auto-suggest < 100ms |
| P1-S3-009 | As a developer, I have the maintenance page ready for deployment | P1 | 4 | Team Lead | Maintenance page renders; 503 redirect configured |
| P1-S3-010 | As a team, we have completed the Design Approval milestone | P0 | 4 | TwinMOS PM | Signed-off Figma files; Design Approval Checklist complete |

**Sprint 3 Definition of Done:**
- [ ] All content pages complete (287 entries)
- [ ] All SKU pages render with correct specifications
- [ ] Design Approval milestone signed off
- [ ] Search functional with MeiliSearch integration
- [ ] Demo to TwinMOS: full site walkthrough

---

## Sprint 4: Application Surfaces — Part 1 (Weeks 9–10)

**Sprint Goal:** Product catalog with dual-axis navigation, filtering, sorting, and product detail pages complete.

**Capacity:** 160 hours

| ID | User Story / Task | Priority | Effort (h) | Owner | Acceptance Criteria |
|----|-------------------|----------|------------|-------|---------------------|
| P1-S4-001 | As a shopper, I can browse the product catalog with dual-axis navigation (by category AND by brand line) | P0 | 24 | Team Lead | Category pages list products; brand pages list products; cross-links work |
| P1-S4-002 | As a shopper, I can filter and sort products by capacity, speed, form factor, RGB | P0 | 20 | Senior Dev | Filters apply via MeiliSearch faceting; URL updates; shareable |
| P1-S4-003 | As a shopper, I can view a product detail page with specs, gallery, datasheet PDF, "Where to Buy" CTA, and related products | P0 | 24 | Team Lead | PDP renders all fields; image gallery navigable; datasheet link works |
| P1-S4-004 | As a shopper, I can compare up to 4 products side-by-side with highlighted differences | P0 | 16 | Team Lead | Comparison table renders; differences highlighted; URL shareable |
| P1-S4-005 | As a shopper, I can use the Where-to-Buy Locator with map and retailer cards | P0 | 24 | Senior Dev | Leaflet map renders; retailer pins show info; country filter works |
| P1-S4-006 | As a shopper, I can see my country auto-detected with manual override option | P1 | 8 | Senior Dev | Geo-detection works; manual country selector functional |
| P1-S4-007 | As a developer, I have product images optimized (WebP/AVIF) with responsive srcset | P1 | 12 | Team Lead | Images serve WebP; srcset present; Lighthouse image audit green |
| P1-S4-008 | As a developer, I have Schema.org Product structured data on all PDPs | P1 | 8 | Team Lead | JSON-LD valid per Schema.org Validator; rich snippets testable |

**Sprint 4 Definition of Done:**
- [ ] Catalog navigation works (category x brand)
- [ ] Filtering and sorting functional
- [ ] Product detail pages complete
- [ ] Product comparison works
- [ ] Where-to-Buy locator functional
- [ ] Demo to TwinMOS: shopping journey walkthrough

---

## Sprint 5: Application Surfaces — Part 2 (Weeks 11–12)

**Sprint Goal:** All forms, warranty registration, compatibility finder MVP, and knowledge base complete.

**Capacity:** 160 hours

| ID | User Story / Task | Priority | Effort (h) | Owner | Acceptance Criteria |
|----|-------------------|----------|------------|-------|---------------------|
| P1-S5-001 | As a visitor, I can submit a general contact form with auto-routing to appropriate team | P0 | 12 | Senior Dev | Form validates; submission stored in Strapi; auto-reply sent within 5 min |
| P1-S5-002 | As a visitor, I can request a quote with product, quantity, and target price | P0 | 8 | Senior Dev | Form validates; routes to sales@; CRM webhook fires |
| P1-S5-003 | As a distributor, I can apply to become a TwinMOS partner via multi-field form | P0 | 12 | Senior Dev | All required fields present; submission routes to partners@; 48h SLA alert |
| P1-S5-004 | As a customer, I can register my product warranty with serial number validation | P0 | 16 | Senior Dev | Serial validates against format; confirmation email sent; certificate generated |
| P1-S5-005 | As a customer, I can submit an RMA request (data capture; full tracker in Phase 2) | P0 | 8 | Senior Dev | Form captures all fields; RMA number generated; status page placeholder |
| P1-S5-006 | As a visitor, I can sign up for the newsletter with double opt-in | P0 | 8 | Senior Dev | Email captured; confirmation email sent; opt-in confirmed; unsubscribe works |
| P1-S5-007 | As a visitor, I can use the Compatibility Finder MVP (search by laptop/desktop brand+model) | P0 | 20 | Senior Dev | Search returns results; placeholder QVL data for top 100 motherboards |
| P1-S5-008 | As a visitor, I can browse the Knowledge Base with search and "Was this helpful?" rating | P0 | 16 | Senior Dev | KB articles searchable; rating buttons functional; related articles shown |
| P1-S5-009 | As a visitor, I can browse FAQ accordions by category | P1 | 8 | Senior Dev | Accordion expands/collapses; categories filter correctly |
| P1-S5-010 | As a visitor, I can view install guides with step-by-step instructions | P1 | 8 | Senior Dev | Install guides render; images load; print stylesheet available |
| P1-S5-011 | As a developer, I have form spam protection (Cloudflare Turnstile) on all public forms | P1 | 8 | Senior Dev | Turnstile renders; bot submissions blocked |
| P1-S5-012 | As a developer, I have form validation with Zod on client and server | P1 | 8 | Senior Dev | All forms validate; error messages clear; cross-field rules work |

**Sprint 5 Definition of Done:**
- [ ] All 15 form types functional
- [ ] Warranty registration works end-to-end
- [ ] Compatibility Finder MVP returns results
- [ ] Knowledge Base searchable and rateable
- [ ] All forms have spam protection and validation
- [ ] Demo to TwinMOS: form submission walkthrough

---

## Sprint 6: Application Surfaces — Part 3 (Weeks 13–14)

**Sprint Goal:** CMS Admin Ready milestone; partner portal skeleton; firmware downloads; all application surfaces complete.

**Capacity:** 160 hours

| ID | User Story / Task | Priority | Effort (h) | Owner | Acceptance Criteria |
|----|-------------------|----------|------------|-------|---------------------|
| P1-S6-001 | As a CMS admin, I can add/edit products, news articles, events, and KB articles | P0 | 24 | Senior Dev | Strapi admin functional; all collections editable; media upload works |
| P1-S6-002 | As a CMS admin, I can manage distributors and retailers | P0 | 12 | Senior Dev | Retailer/Distributor collections editable; CSV import works |
| P1-S6-003 | As a CMS admin, I can view and route form submissions | P0 | 8 | Senior Dev | FormSubmission collection lists all submissions; status updates work |
| P1-S6-004 | As a CMS admin, I can manage menu items and site navigation | P1 | 8 | Senior Dev | MenuItem collection editable; changes reflect on frontend |
| P1-S6-005 | As a partner, I can see a Partner Portal login page (skeleton for Phase 2) | P0 | 12 | Senior Dev | Login page renders; placeholder dashboard accessible after auth |
| P1-S6-006 | As a visitor, I can download firmware from the Firmware Download Center | P0 | 8 | Senior Dev | Firmware list renders; download links work; checksums displayed |
| P1-S6-007 | As a visitor, I can see an anti-counterfeit SN-check placeholder page | P1 | 4 | Team Lead | Page explains Phase 2 feature; email capture for notifications |
| P1-S6-008 | As a visitor, I can see an RGB visualizer placeholder on the Gaming Hub | P1 | 4 | Team Lead | Placeholder shows product images; explains interactive feature coming |
| P1-S6-009 | As a developer, I have the 9-locale framework configured with EN populated and others as empty stubs | P0 | 16 | Team Lead | /en/ works; /ar/, /bn/, /hi/ return 404 or placeholder; i18n routing configured |
| P1-S6-010 | As a developer, I have hreflang tags and XML sitemap auto-generation | P0 | 8 | Team Lead | Sitemap-index.xml valid; hreflang tags present on all pages |
| P1-S6-011 | As a developer, I have Schema.org structured data per page type | P1 | 12 | Team Lead | Product, Article, Organization, BreadcrumbList, FAQ, Event schemas present |
| P1-S6-012 | As a team, we have achieved the CMS Admin Ready milestone | P0 | 4 | TwinMOS PM | TwinMOS Marketing can add/edit content; milestone checklist signed |

**Sprint 6 Definition of Done:**
- [ ] CMS Admin Ready milestone achieved
- [ ] All application surfaces functional
- [ ] Locale framework configured
- [ ] SEO structured data implemented
- [ ] Demo to TwinMOS: CMS admin walkthrough + full application demo

---

## Sprint 7: Quality Gates (Weeks 15–16)

**Sprint Goal:** All quality gates pass — performance, accessibility, security, cross-browser, mobile.

**Capacity:** 160 hours

| ID | User Story / Task | Priority | Effort (h) | Owner | Acceptance Criteria |
|----|-------------------|----------|------------|-------|---------------------|
| P1-S7-001 | As a developer, I have completed a performance pass: image budgets, font subsetting, third-party script audit, route-level code splitting | P0 | 20 | Team Lead | Every page hits Lighthouse >= 90; LCP <= 2.0s; CLS <= 0.1 |
| P1-S7-002 | As a developer, I have completed an accessibility pass: axe-core review, manual NVDA/VoiceOver on top 30 pages | P0 | 20 | Both | 0 critical/serious axe findings; keyboard navigation works; screen reader correct |
| P1-S7-003 | As a developer, I have completed a security pass: ZAP scan, dependency audit, CSP tightening, rate limits | P0 | 20 | Senior Dev | ZAP scan 0 high/critical; Snyk 0 high CVE; CSP strict; rate limits active |
| P1-S7-004 | As a developer, I have completed cross-browser QA: Chrome, Safari (iOS + macOS), Samsung Internet, Firefox, Edge | P0 | 16 | Both | All browsers render correctly; no console errors; forms work |
| P1-S7-005 | As a developer, I have completed mobile device QA on real devices | P0 | 12 | Both | iOS Safari and Android Chrome tested; touch interactions work; no layout breaks |
| P1-S7-006 | As a developer, I have RTL framework verified for Arabic (CSS direction, mirrored layouts, Noto Sans Arabic font) | P0 | 12 | Team Lead | Arabic text renders correctly; layout mirrors; font loads |
| P1-S7-007 | As a developer, I have load testing completed at 5,000 concurrent users | P1 | 12 | Senior Dev | k6 test passes; response times acceptable; no errors |
| P1-S7-008 | As a team, we have scheduled and initiated the third-party penetration test | P0 | 8 | TwinMOS PM | Pen-test vendor engaged; scope defined; test dates confirmed |
| P1-S7-009 | As a developer, I have all pre-commit hooks and CI gates enforcing quality | P1 | 8 | Team Lead | Husky + lint-staged active; CI fails on red Lighthouse or axe |
| P1-S7-010 | As a developer, I have error handling and graceful degradation verified | P1 | 8 | Both | 404/500 pages tested; network failure handled; fallback images work |

**Sprint 7 Definition of Done:**
- [ ] Lighthouse >= 90 on all pages
- [ ] axe-core 0 critical/serious
- [ ] ZAP scan green
- [ ] Cross-browser QA complete
- [ ] Mobile QA complete
- [ ] RTL framework verified
- [ ] Load test passed
- [ ] Pen-test initiated
- [ ] Demo to TwinMOS: quality metrics dashboard

---

## Sprint 8: Pre-Launch & UAT (Weeks 17–18)

**Sprint Goal:** UAT complete, pen-test findings remediated, soft launch successful, all runbooks ready.

**Capacity:** 160 hours

| ID | User Story / Task | Priority | Effort (h) | Owner | Acceptance Criteria |
|----|-------------------|----------|------------|-------|---------------------|
| P1-S8-001 | As a marketing team member, I have received CMS training (recorded video + written guide) | P0 | 16 | Senior Dev | Training delivered; recording saved; guide published in CMS |
| P1-S8-002 | As an operations team member, I have deployment and incident response runbooks | P0 | 12 | Team Lead | Runbooks in /docs/runbooks/; tested on staging |
| P1-S8-003 | As an operations team member, I have backup/restore and DR runbooks | P0 | 8 | Team Lead | Runbooks tested; RTO <= 4h verified |
| P1-S8-004 | As a developer, I have completed DR drill with RTO verification | P0 | 12 | Team Lead | DR drill executed; time-to-recovery documented; < 4h confirmed |
| P1-S8-005 | As a developer, I have remediated all third-party penetration test findings | P0 | 24 | Senior Dev | All findings closed or accepted with risk sign-off |
| P1-S8-006 | As a stakeholder, I have completed UAT and signed off | P0 | 32 | TwinMOS PM + Both devs | UAT scripts executed; bugs logged and fixed; sign-off form complete |
| P1-S8-007 | As a team, we have completed soft launch to limited audience | P0 | 12 | Both devs | Soft launch checklist complete; monitoring active; no critical issues |
| P1-S8-008 | As a developer, I have developer onboarding documentation complete | P1 | 8 | Both devs | Onboarding guide in /docs/; new dev can set up in < 2 hours |
| P1-S8-009 | As a developer, I have content publishing workflow documented | P1 | 8 | Senior Dev | Workflow doc covers draft -> review -> publish -> ISR rebuild |
| P1-S8-010 | As a team, we have Beta Delivery milestone achieved | P0 | 4 | TwinMOS PM | Beta Acceptance Checklist signed |

**Sprint 8 Definition of Done:**
- [ ] CMS training delivered
- [ ] All runbooks complete and tested
- [ ] DR drill passed
- [ ] Pen-test findings remediated
- [ ] UAT signed off
- [ ] Soft launch successful
- [ ] Demo to TwinMOS: UAT results + soft launch metrics

---

## Sprint 9: Launch & Hypercare (Weeks 19–20)

**Sprint Goal:** Public launch successful, monitoring active, daily metrics review, Phase 1 retro, Phase 2 plan locked.

**Capacity:** 160 hours

| ID | User Story / Task | Priority | Effort (h) | Owner | Acceptance Criteria |
|----|-------------------|----------|------------|-------|---------------------|
| P1-S9-001 | As a team, we have executed DNS cutover and public launch | P0 | 8 | Team Lead | twinmos.com serves new site; DNS propagation verified globally |
| P1-S9-002 | As a team, we have monitoring alerts active (Sentry, UptimeRobot, Plausible) | P0 | 4 | Both devs | All monitors green; alerts configured for Slack + email |
| P1-S9-003 | As a team, we review daily metrics for the first 14 days post-launch | P0 | 20 | Both devs | Daily metrics review documented; anomalies flagged and addressed |
| P1-S9-004 | As a team, we fix any critical bugs discovered post-launch | P0 | 40 | Both devs | All P0/P1 bugs resolved within 24h of discovery |
| P1-S9-005 | As a team, we conduct Phase 1 retrospective with TwinMOS sponsor | P0 | 4 | TwinMOS PM | Retro document saved; action items logged |
| P1-S9-006 | As a team, we lock Phase 2 sprint plan and backlog | P0 | 8 | Both devs + PM | Phase 2 backlog groomed; Sprint 10 planned |
| P1-S9-007 | As a team, we complete Phase 1 closeout documentation | P1 | 12 | Both devs | Closeout report covers deliverables, budget, risks, lessons learned |
| P1-S9-008 | As a team, we transition to Phase 2 with knowledge transfer | P1 | 16 | Both devs | Phase 2 scope reviewed; dependencies confirmed; vendor contracts ready |
| P1-S9-009 | As a team, we have Public Launch milestone achieved | P0 | 4 | TwinMOS PM | Launch Checklist signed; Go/No-Go decision documented |
| P1-S9-010 | As a team, we have Phase 1 Complete milestone achieved | P0 | 4 | TwinMOS PM | Phase Gate Review Template complete; sponsor sign-off |

**Sprint 9 Definition of Done:**
- [ ] Public launch successful
- [ ] 14-day monitoring complete
- [ ] Critical bugs resolved
- [ ] Phase 1 retro complete
- [ ] Phase 2 plan locked
- [ ] Phase Gate Review signed
- [ ] Demo to TwinMOS: launch metrics + Phase 2 preview

---

## Sprint Metrics Summary

| Sprint | Planned Points | Velocity | Burndown | Demo Date |
|--------|---------------|----------|----------|-----------|
| Sprint 0 | 160h | TBD | TBD | Week 2 |
| Sprint 1 | 160h | TBD | TBD | Week 4 |
| Sprint 2 | 160h | TBD | TBD | Week 6 |
| Sprint 3 | 160h | TBD | TBD | Week 8 (Design Approval) |
| Sprint 4 | 160h | TBD | TBD | Week 10 |
| Sprint 5 | 160h | TBD | TBD | Week 12 |
| Sprint 6 | 160h | TBD | TBD | Week 14 (CMS Admin Ready) |
| Sprint 7 | 160h | TBD | TBD | Week 16 |
| Sprint 8 | 160h | TBD | TBD | Week 18 (Beta Delivery) |
| Sprint 9 | 160h | TBD | TBD | Week 20 (Public Launch) |

---

## Definition of Done (All Sprints)

- [ ] Code reviewed by other developer
- [ ] All tests pass (unit, integration, E2E where applicable)
- [ ] Lighthouse CI >= 90 performance, >= 95 accessibility
- [ ] axe-core 0 critical/serious findings
- [ ] TypeScript strict mode compiles without errors
- [ ] ESLint/Prettier passes
- [ ] Documentation updated (README, ADRs, runbooks as needed)
- [ ] Demo-ready on staging environment
- [ ] TwinMOS PM acceptance obtained for P0 stories

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 1 May 2026 | TwinMOS Digital Transformation Team | Initial backlog |

**Next Review:** At Sprint 0 close (Week 2) and at each sprint boundary

**Related Documents:**
- TwinMOSWebsiteProjectPlanPhases_1-3.md
- TwinMOSWebsiteMilestone_Schedule.md
- TwinMOSWebsiteStatusReportTemplate.md

---

*This Sprint Backlog is a living document. Changes require sprint planning meeting agreement and must be logged in the Decision Log.*
