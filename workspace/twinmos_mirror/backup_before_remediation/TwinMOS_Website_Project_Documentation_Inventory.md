# TwinMOS Website — Project Documentation Inventory

**Document Reference:** TWN-DOCS-INVENTORY-2026-001
**Document Version:** 3.0 (Solo-Developer Edition — Forensic Audit v3.0 Applied)
**Status:** FINAL — Pre-Engagement Checklist for TwinMOS Solo-Developer Engagement
**Date:** 1 May 2026 (v1.0); 2 May 2026 (v2.0 content-folder reconciliation); 2 May 2026 (v3.0 — solo-developer re-issue per Decisions 1A/2B/3A/4A/5A/6A/7A)
**Prepared by:** TwinMOS Digital Transformation Team
**Audience:** TwinMOS Sponsor / IT Lead / Solo Full-Stack Developer / Project oversight
**Purpose:** Comprehensive list of every document required for the solo-developer × 18–24-month × 15-phase engagement (Roadmap v2.2). Includes Phase 1 (Roadmap Phases 1–8 ending Feb–Mar 2027), Phase 2 (Roadmap Phases 9–12 ending Jun 2027), Phase 3 (Roadmap Phases 13–14 ending Jan 2028), and Phase 15 (Roadmap Phase 15 from Jan 2028 — includes ES/PT/DE full launch per Decision 5A).

> **v3.0 Revision Note:** v3.0 reflects sponsor decisions captured in Forensic Alignment Audit v3.0 §11 (2 May 2026):
> - **Team:** 1 solo full-stack developer × ~18–24 months (was: 2 devs × 15 months in v2.0)
> - **Hosting:** TwinMOS own cloud server origin + Cloudflare DNS/WAF/CDN edge front (was: Cloudflare Pages + Hetzner Coolify)
> - **Repos:** Two-repo (twinmos-website-frontend + twinmos-website-backend, retained from Roadmap T-1.1.02)
> - **Phase 1 launch:** Feb–Mar 2027 (Roadmap Phase 8 Weeks 29–32; was: Month 5 in BRD §6.1)
> - **Locales:** 10 active by end of engagement (EN + AR/BN/HI + RU/ZH-CN/FR + ES/PT/DE per Decision 5A; was: 7 active in v2.0)
> - **Accessibility:** WCAG 2.2 AA (was: WCAG 2.1 AA)
> - **Node.js:** Migrate from Node.js 22 LTS to Node.js 24 LTS in Phase 13 per ADR-008 (Node 22 EOL April 30, 2027)
> - **RFP supersession:** Issued [TwinMOS_Website_SOW_v4.md](TwinMOS_Website_SOW_v4.md) v4.0 superseding RFP v3.0 §1/§14/§15/§16
> - **Roadmap added to §A** (was missing from v2.0; F-INV-001 critical)
> - **Document Version Matrix added** (§A.0 below; F-INV-005)
> - **Source-of-Truth Hierarchy section added** (§A.1 below; F-INV-008)
> - **Risk Register, Milestone Schedule, QA Strategy** classifications updated (§A.2; F-INV-002/003/004)

---

## Status Legend

- **[E]** **EXISTS** — File is already in the project folder and ready to use
- **[P]** **PARTIAL** — Public-facing content exists in `content/website-content/`; a developer-facing technical companion document still needs to be created
- **[M]** **MISSING** — File must be created (no equivalent exists)

## Priority Legend

- **(P0)** Must exist at handover (Sprint 0 — Day 1)
- **(P1)** Must exist by end of Sprint 0 (Week 2)
- **(P2)** Must exist by end of Phase 1 (Month 5)
- **(P3)** Created during phase as needed

---

## A. Foundation & Strategy Documents

| Status | File | Version | Date |
|--------|------|---------|------|
| [E] | TwinMOS_Company_Profile_Comprehensive.md | 2.0 | April 2026 |
| [E] | TwinMOS_Website_RFP.md | 3.0 (superseded by SOW v4.0) | 30 April 2026 |
| [E] | TwinMOS_Website_SOW_v4.md (NEW v3.0 cycle) | 4.0 | 2 May 2026 |
| [E] | TwinMOS_Website_BRD.md | 3.0 (v3.2 patches applied) | 30 April 2026 / 2 May 2026 |
| [E] | TwinMOS_Website_URD.md | 3.1 | 2 May 2026 |
| [E] | TwinMOS_Website_Implementation_Strategy.md | 4.0 | 2 May 2026 |
| [E] | TwinMOS_Website_Technology_Stack.md | 1.2 | 2 May 2026 |
| [E] | TwinMOS_Website_Implementation_Roadmap_15_Phase.md | 2.2 | 2 May 2026 |
| [E] | TwinMOS_Website_Forensic_Audit.md | 1.0 | April 2026 |
| [E] | TwinMOS_Documents_Forensic_Alignment_Audit_v2.md | 2.0 | 30 April 2026 |
| [E] | TwinMOS_Documents_Forensic_Alignment_Audit_v3.md (NEW v3.0 cycle) | 3.0 | 2 May 2026 |
| [E] | TwinMOS_Documents_Alignment_Changelog.md | 2.1 | 2 May 2026 |
| [E] | TwinMOS_Website_Project_Documentation_Inventory.md (this file) | 3.0 | 2 May 2026 |
| [E] | content/TwinMOS_Website_Content_Map.md | 1.0 (v1.1 pending propagation) | 29 April 2026 |
| [E] | content/website-content/_master-sku-reference.md | (versioned per Roadmap) | April 2026 |

### A.0 Document Version Matrix (canonical reference)

| Document | Current Version | Authoritative For |
|----------|-----------------|-------------------|
| Company Profile | 2.0 | Facts about TwinMOS |
| Content Map | 1.0 (v1.1 pending) | Content scope, IA, per-page ownership/phasing |
| `_master-sku-reference.md` | (rolling) | Canonical SKU registry |
| Implementation Roadmap (15-Phase) | 2.2 | Execution schedule, milestone definitions, task IDs |
| Technology Stack | 1.2 | Technical-decision lockdowns |
| BRD | 3.0 (v3.2 patches applied) | Business rules, scope |
| URD | 3.1 | User-facing interaction details |
| RFP | 3.0 (superseded) | Historical procurement scope |
| SOW | 4.0 | Solo-developer engagement scope (replaces RFP for procurement) |
| Implementation Strategy | 4.0 | Stack-options analysis + delivery plan (solo-dev edition) |
| Forensic Alignment Audit | 3.0 | v3 → v3.1 / v3.2 alignment driver |
| Alignment Changelog | 2.1 | Cross-document alignment history |
| Project Documentation Inventory | 3.0 | This document |

### A.1 Source-of-Truth Hierarchy (v3.2 — ratified per Decision 1A)

When resolving any ambiguity, the order of precedence is:

1. **Company Profile** — facts about TwinMOS
2. **Content Map** — content scope and IA
3. **`_master-sku-reference.md`** — SKU registry
4. **Implementation Roadmap (15-Phase) v2.2** — execution schedule, milestone definitions, task IDs
5. **Technology Stack v1.2** — technical-decision lockdowns
6. **BRD** — business rules and project scope
7. **URD** — user-facing interaction details
8. **SOW v4.0** — engagement scope (RFP v3.0 retained for historical context only)
9. **Forensic Alignment Audit v3.0** — alignment cycle driver (active until next audit)

### A.2 Standalone Documents Pending Decision 8

The Roadmap v2.2 cites three documents in its sync header. Per Forensic Alignment Audit v3.0 F-INV-002/003/004:

| Document | Current Status | Decision Required |
|----------|---------------|-------------------|
| TwinMOS_Website_Milestone_Schedule.md (v1.0) | [P] Embedded in Roadmap §§1–15 (150 milestones) | Author standalone or annotate as embedded |
| TwinMOS_Website_QA_Strategy.md (v1.0) | [P] Embedded across Roadmap Phase 7 + Tech Stack §21 | Author standalone or annotate as embedded |
| TwinMOS_Website_Risk_Register_Consolidated.md (v1.0) | [M] Three partial registers exist (Roadmap App D R-01..10, Strategy App B RISK-1..18, BRD §29 R-01..10 v3.2-patched) | Create standalone consolidating all three |

---

## B. Contractual & Legal (Vendor Agreements)

| Status | File | Pri |
|--------|------|-----|
| [M] | TwinMOS_Unisoft_Master_Service_Agreement.md | P0 |
| [M] | TwinMOS_Unisoft_Statement_of_Work.md | P0 |
| [M] | TwinMOS_Unisoft_NDA.md | P0 |
| [M] | TwinMOS_Unisoft_Data_Processing_Agreement.md | P0 |
| [M] | TwinMOS_Unisoft_IP_Ownership_Transfer_Agreement.md | P0 |
| [M] | TwinMOS_Unisoft_Service_Level_Agreement.md | P1 |
| [M] | TwinMOS_Unisoft_AI_Tooling_Usage_Addendum.md | P1 |
| [M] | TwinMOS_Translation_Vendor_Master_Agreement.md | P2 |
| [M] | TwinMOS_Penetration_Test_Vendor_Agreement.md | P2 |

---

## C. Project Management

| Status | File | Pri |
|--------|------|-----|
| [M] | TwinMOS_Website_Project_Charter.md | P0 |
| [M] | TwinMOS_Website_Project_Plan_Phases_1-3.md | P0 |
| [M] | TwinMOS_Website_Sprint_Backlog_Phase_1.md | P0 |
| [M] | TwinMOS_Website_Sprint_Backlog_Phase_2.md | P3 |
| [M] | TwinMOS_Website_Sprint_Backlog_Phase_3.md | P3 |
| [M] | TwinMOS_Website_Milestone_Schedule.md | P0 |
| [M] | TwinMOS_Website_RACI_Matrix.md | P0 |
| [M] | TwinMOS_Website_Stakeholder_Register.md | P0 |
| [M] | TwinMOS_Website_Communication_Plan.md | P1 |
| [M] | TwinMOS_Website_Decision_Log.md | P1 |
| [M] | TwinMOS_Website_Risk_Register_Consolidated.md | P1 |
| [M] | TwinMOS_Website_Issue_Log.md | P1 |
| [M] | TwinMOS_Website_Change_Request_Process.md | P1 |
| [M] | TwinMOS_Website_Status_Report_Template.md | P1 |
| [M] | TwinMOS_Website_Phase_Gate_Review_Template.md | P1 |

---

## D. Engineering & Architecture

### D.1 Design Documents

| Status | File | Pri |
|--------|------|-----|
| [P] | TwinMOS_Website_HLD_High_Level_Design.md (partial coverage in Tech Stack §3 Architecture; standalone HLD still required) | P0 |
| [M] | TwinMOS_Website_LLD_Low_Level_Design.md | P1 |
| [P] | TwinMOS_Website_System_Architecture_Diagram.md (ASCII diagram in Tech Stack §3.1; formal diagram still required) | P0 |
| [M] | TwinMOS_Website_Component_Architecture.md | P1 |
| [M] | TwinMOS_Website_Sequence_Diagrams.md | P1 |
| [M] | TwinMOS_Website_Data_Flow_Diagrams.md | P1 |
| [M] | TwinMOS_Website_Network_Topology_Diagram.md | P1 |
| [M] | TwinMOS_Website_Deployment_Diagram.md | P1 |

### D.2 Data Layer

| Status | File | Pri |
|--------|------|-----|
| [P] | TwinMOS_Website_Database_ERD.md (entity list in Tech Stack §25.2 + BRD §19; visual ERD still required) | P0 |
| [M] | TwinMOS_Website_Data_Dictionary.md | P1 |
| [E] | TwinMOS_Website_Data_Model_Strapi_Collections.md (covered in Tech Stack §25.2 — 30+ collections fully specified) | P0 |
| [E] | TwinMOS_Website_Data_Model_Astro_Collections.md (covered in Tech Stack §25.1 — Zod schema fully specified) | P0 |
| [P] | TwinMOS_Website_Data_Migration_Plan.md (Tech Stack §24 outlines strategy; runbook still required) | P0 |
| [M] | TwinMOS_Website_Database_Indexing_Strategy.md | P1 |
| [M] | TwinMOS_Website_Data_Retention_Policy.md | P1 |

### D.3 API Specifications

| Status | File | Pri |
|--------|------|-----|
| [M] | TwinMOS_Website_API_Specification_OpenAPI.yaml | P0 |
| [M] | TwinMOS_Website_API_Versioning_Strategy.md | P1 |
| [E] | TwinMOS_Website_API_Authentication_JWT_Spec.md (covered in Tech Stack §5.6, §9.2) | P0 |
| [E] | TwinMOS_Website_API_Rate_Limiting_Spec.md (covered in Tech Stack §18.1, §22.2) | P1 |
| [E] | TwinMOS_Website_API_Error_Handling_RFC9457.md (covered in Tech Stack §1.2, BRD §26.3) | P1 |
| [M] | TwinMOS_Website_GraphQL_Schema_Spec.md | P3 |
| [M] | TwinMOS_Website_Webhook_Specification.md | P1 |

### D.4 Integration Specifications

| Status | File | Pri |
|--------|------|-----|
| [P] | TwinMOS_Website_Integration_Spec_TwinMOS_CRM.md (Tech Stack §14.4 outlines; full spec still required) | P1 |
| [P] | TwinMOS_Website_Integration_Spec_TwinMOS_ERP.md (Tech Stack §14.5 outlines; full spec still required) | P3 |
| [M] | TwinMOS_Website_Integration_Spec_Manufacturing_Serial_Ingest.md | P3 |
| [M] | TwinMOS_Website_Integration_Spec_Resend_Email.md | P1 |
| [M] | TwinMOS_Website_Integration_Spec_Stripe_Payment.md | P3 |
| [M] | TwinMOS_Website_Integration_Spec_Medusa_Commerce.md | P3 |
| [M] | TwinMOS_Website_Integration_Spec_Chatwoot_LiveChat.md | P3 |
| [M] | TwinMOS_Website_Integration_Spec_Cloudflare_Turnstile.md | P1 |
| [M] | TwinMOS_Website_Integration_Spec_GA4_Analytics.md | P1 |
| [M] | TwinMOS_Website_Integration_Spec_Sentry_Monitoring.md | P1 |
| [M] | TwinMOS_Website_Integration_Spec_Backblaze_B2.md | P1 |
| [M] | TwinMOS_Website_Integration_Spec_OpenStreetMap.md | P1 |
| [M] | TwinMOS_Website_Integration_Spec_Better_Auth.md | P3 |

### D.5 Architecture Decision Records (ADRs)

| Status | File | Pri |
|--------|------|-----|
| [P] | docs/adr/ADR-001-stack-selection-strapi-astro.md (decision rationale in Tech Stack §2; formal ADR still required) | P0 |
| [M] | docs/adr/ADR-002-architecture-patterns.md | P0 |
| [M] | docs/adr/ADR-003-folder-structure.md | P0 |
| [P] | docs/adr/ADR-004-react-as-island-framework.md (decision in Tech Stack §4.1) | P0 |
| [P] | docs/adr/ADR-005-meilisearch-vs-typesense.md (rationale in Tech Stack §7.1) | P0 |
| [P] | docs/adr/ADR-006-cloudflare-pages-vs-vercel.md (rationale in Tech Stack §2.4, §19.1) | P0 |
| [P] | docs/adr/ADR-007-hetzner-vs-aws.md (rationale in Tech Stack §19) | P0 |
| [P] | docs/adr/ADR-008-monorepo-vs-multirepo.md (rationale in Tech Stack §3.2) | P0 |
| [P] | docs/adr/ADR-009-i18n-strapi-vs-astro.md (covered in Tech Stack §11) | P1 |
| [P] | docs/adr/ADR-010-imgproxy-vs-cloudinary.md (covered in Tech Stack §8) | P1 |
| [M] | docs/adr/ADR-011-form-handling-pattern.md | P1 |
| [M] | docs/adr/ADR-012-CRM-selection-hubspot-zoho.md | P1 |
| [M] | docs/adr/ADR-013-ERP-integration-mode.md | P3 |
| [M] | docs/adr/ADR-014-ecommerce-medusa-vs-stripe-only.md | P3 |
| [M] | docs/adr/ADR-015-better-auth-vs-lucia.md | P3 |
| [M] | docs/adr/ADR-016-chat-tool-selection.md | P3 |
| [M] | docs/adr/ADR-017-translation-vendor-selection.md | P3 |
| [M] | docs/adr/ADR-018-loyalty-program-engine.md | P3 |
| [M] | docs/adr/ADR_TEMPLATE.md | P0 |

---

## E. Design & UX

### E.1 Design System

| Status | File | Pri |
|--------|------|-----|
| [P] | TwinMOS_Website_Design_System.md (URD §20 design tokens partially cover; full system still required) | P0 |
| [M] | TwinMOS_Website_Brand_Guideline.md | P0 |
| [M] | TwinMOS_Website_Logo_Usage_Guide.md | P0 |
| [P] | TwinMOS_Website_Color_Palette.md (URD §20 partially covers) | P0 |
| [P] | TwinMOS_Website_Typography_Spec.md (Tech Stack §11.1 lists Noto Sans variants; full spec still required) | P0 |
| [M] | TwinMOS_Website_Iconography_Spec.md | P0 |
| [P] | TwinMOS_Website_Spacing_Grid_System.md (Tech Stack §4.6 lists 8-pt grid + breakpoints) | P0 |
| [M] | TwinMOS_Website_Component_Library_Spec.md | P0 |
| [M] | TwinMOS_Website_Motion_Animation_Spec.md | P1 |
| [M] | TwinMOS_Website_Imagery_Photography_Guide.md | P1 |
| [M] | TwinMOS_Website_Illustration_Style_Guide.md | P1 |

### E.2 Wireframes & Mockups

| Status | File | Pri |
|--------|------|-----|
| [M] | TwinMOS_Website_Wireframes_Low_Fidelity.md | P0 |
| [M] | TwinMOS_Website_Mockups_High_Fidelity.md | P0 |
| [M] | TwinMOS_Website_Figma_Design_Files_Index.md | P0 |
| [P] | TwinMOS_Website_Page_Templates_Specification.md (Tech Stack §4.4 lists 5 templates; full Figma still required) | P0 |
| [E] | content/website-content/01-homepage/02-hero-slide-voltx-ddr5.md (hero slide spec) |  |
| [E] | content/website-content/01-homepage/03-hero-slide-corex-pro.md |  |
| [E] | content/website-content/01-homepage/04-hero-slide-elite-drive.md |  |
| [E] | content/website-content/01-homepage/05-hero-slide-distributor.md |  |
| [M] | TwinMOS_Website_Hero_Banners_Spec.md (visual specs still required) | P0 |
| [M] | TwinMOS_Website_Email_Templates_Spec.md | P1 |

### E.3 Responsive & Accessibility Design

| Status | File | Pri |
|--------|------|-----|
| [P] | TwinMOS_Website_Responsive_Breakpoints_Spec.md (Tech Stack §4.6 lists breakpoints) | P0 |
| [M] | TwinMOS_Website_Mobile_First_Design_Guide.md | P0 |
| [E] | content/website-content/14-legal/08-accessibility-statement.md (public-facing WCAG 2.1 AA statement) |  |
| [P] | TwinMOS_Website_Accessibility_Design_Spec_WCAG_2.1_AA.md (URD §33 + accessibility statement; developer-facing implementation guide still required) | P0 |
| [P] | TwinMOS_Website_RTL_Design_Spec.md (Tech Stack §11.4 covers; visual mockups still required) | P3 |
| [M] | TwinMOS_Website_Dark_Mode_Spec.md | P3 |

### E.4 Interaction Design

| Status | File | Pri |
|--------|------|-----|
| [M] | TwinMOS_Website_User_Flows.md | P0 |
| [M] | TwinMOS_Website_Interaction_Patterns.md | P1 |
| [E] | content/website-content/00-site-wide/04-newsletter-signup.md (newsletter form spec) |  |
| [M] | TwinMOS_Website_Form_Design_Guidelines.md (general form design pattern still required) | P1 |
| [E] | content/website-content/00-site-wide/10-404-page.md (error state) |  |
| [E] | content/website-content/00-site-wide/11-500-error-page.md |  |
| [E] | content/website-content/00-site-wide/12-maintenance-page.md |  |
| [P] | TwinMOS_Website_Error_State_Design.md (content above; visual mockups still required) | P1 |
| [M] | TwinMOS_Website_Empty_State_Design.md | P1 |
| [M] | TwinMOS_Website_Loading_State_Design.md | P1 |

---

## F. Content, SEO & Localization

### F.1 Content (Existing — comprehensive)

| Status | File |
|--------|------|
| [E] | content/TwinMOS_Website_Content_Map.md |
| [E] | content/website-content/_master-sku-reference.md |
| [E] | content/website-content/00-site-wide/ (14 files — header, footer, search, breadcrumb, banner, error pages, etc.) |
| [E] | content/website-content/01-homepage/ (9 files) |
| [E] | content/website-content/02-about/ (17 files — incl. quality assurance, certifications, sustainability, media kit) |
| [E] | content/website-content/03-products/ (86 files — full catalog: memory, SSD, portable, USB, accessories, brands, finder, datasheets) |
| [E] | content/website-content/04-solutions/ (11 files) |
| [E] | content/website-content/05-gaming/ (14 files) |
| [E] | content/website-content/06-technology/ (14 files — incl. JEDEC compliance, security, integrity, patents) |
| [E] | content/website-content/07-support/ (69 files — incl. 33+ KB articles, install guides, RMA, warranty, FAQ) |
| [E] | content/website-content/08-learn/ (64 files — buying guides, explainers, benchmarks, glossary) |
| [E] | content/website-content/09-partners/ (21 files — distributor onboarding, OEM/ODM, regional hubs) |
| [E] | content/website-content/09-where-to-buy/ (4 files) |
| [E] | content/website-content/10-news-events/ (29 files) |
| [E] | content/website-content/11-regional/ (29 files including locale subfolders for ar/bn/de/es/fr/hi/pt/ru/zh-CN) |
| [E] | content/website-content/12-careers/ (10 files — incl. application form, applicant privacy) |
| [E] | content/website-content/13-contact/ (16 files) |
| [E] | content/website-content/14-legal/ (34 files — full legal/compliance/trust hub) |
| [E] | content/website-content/15-marketing/ (12 files — newsletter, promotions, campaigns, popups) |

### F.2 Editorial Standards

| Status | File | Pri |
|--------|------|-----|
| [M] | TwinMOS_Website_Editorial_Style_Guide.md | P0 |
| [M] | TwinMOS_Website_Tone_of_Voice_Guide.md | P0 |
| [M] | TwinMOS_Website_Content_Authoring_Guide_for_Marketing.md | P2 |
| [M] | TwinMOS_Website_Image_Asset_Naming_Convention.md | P0 |
| [E] | content/website-content/00-site-wide/15-microcopy-glossary.md (microcopy library — fulfills this requirement) |  |

### F.3 SEO

| Status | File | Pri |
|--------|------|-----|
| [P] | TwinMOS_Website_SEO_Strategy.md (BRD §22 + Tech Stack §12 outline; full strategy still required) | P0 |
| [M] | TwinMOS_Website_Keyword_Research.md | P0 |
| [P] | TwinMOS_Website_URL_Structure_Spec.md (Tech Stack §12.4 covers) | P0 |
| [M] | TwinMOS_Website_Legacy_URL_to_New_URL_Mapping.md | P0 |
| [M] | TwinMOS_Website_301_Redirect_Plan.md | P0 |
| [P] | TwinMOS_Website_Schema_Org_JSON_LD_Templates.md (Tech Stack §12.1 lists schema types per page; templates still required) | P1 |
| [P] | TwinMOS_Website_Meta_Tag_Templates.md (Tech Stack §12.2 covers) | P1 |
| [P] | TwinMOS_Website_XML_Sitemap_Strategy.md (Tech Stack §12.3 covers) | P1 |
| [P] | TwinMOS_Website_Hreflang_Implementation.md (Tech Stack §11.6 covers) | P1 |
| [M] | TwinMOS_Website_Internal_Linking_Strategy.md | P1 |
| [E] | content/website-content/14-legal/33-sitemap.md (human-readable sitemap) |  |
| [M] | TwinMOS_Website_Search_Console_Setup_Guide.md | P2 |

### F.4 Localization

| Status | File | Pri |
|--------|------|-----|
| [P] | TwinMOS_Website_Localization_Strategy.md (Tech Stack §11 + URD §16 cover; consolidated strategy doc still required) | P0 |
| [E] | content/website-content/11-regional/_locales/ (locale directory structure for ar/bn/de/es/fr/hi/pt/ru/zh-CN) |  |
| [M] | TwinMOS_Website_Translation_Vendor_Brief.md | P2 |
| [M] | TwinMOS_Website_Translation_Memory_Glossary.md | P2 |
| [P] | TwinMOS_Website_RTL_Implementation_Guide.md (Tech Stack §11.4 covers RTL approach; full guide still required) | P3 |
| [M] | TwinMOS_Website_Cultural_Adaptation_Guide_per_Region.md | P3 |
| [M] | TwinMOS_Website_Locale_QA_Checklist.md | P3 |

---

## G. Quality Assurance & Testing

| Status | File | Pri |
|--------|------|-----|
| [P] | TwinMOS_Website_QA_Strategy.md (Tech Stack §21 outlines; full strategy still required) | P0 |
| [M] | TwinMOS_Website_Test_Plan_Master.md | P0 |
| [M] | TwinMOS_Website_Unit_Test_Plan.md | P1 |
| [M] | TwinMOS_Website_Integration_Test_Plan.md | P1 |
| [P] | TwinMOS_Website_E2E_Test_Scenarios_Playwright.md (Tech Stack §21.2 lists 10 critical-path scenarios; full Playwright suite still required) | P1 |
| [M] | TwinMOS_Website_API_Test_Plan_Bruno.md | P1 |
| [M] | TwinMOS_Website_UAT_Plan.md | P2 |
| [M] | TwinMOS_Website_UAT_Test_Scripts.md | P2 |
| [M] | TwinMOS_Website_UAT_Sign_Off_Form.md | P2 |
| [P] | TwinMOS_Website_Accessibility_Test_Plan_axe_NVDA.md (Tech Stack §21.1 + §22 cover; full plan still required) | P1 |
| [P] | TwinMOS_Website_Performance_Test_Plan_k6.md (Tech Stack §22.4 outlines concurrency targets) | P1 |
| [M] | TwinMOS_Website_Lighthouse_CI_Configuration.md | P1 |
| [P] | TwinMOS_Website_Security_Test_Plan_OWASP_ZAP.md (Tech Stack §18.5 outlines) | P1 |
| [P] | TwinMOS_Website_Cross_Browser_Compatibility_Matrix.md (URD §7.2 + Tech Stack §21.1 cover; standalone matrix still required) | P1 |
| [M] | TwinMOS_Website_Mobile_Device_Test_Matrix.md | P1 |
| [M] | TwinMOS_Website_Regression_Test_Plan.md | P2 |
| [M] | TwinMOS_Website_Smoke_Test_Plan.md | P1 |
| [M] | TwinMOS_Website_Bug_Triage_Process.md | P1 |
| [M] | TwinMOS_Website_Bug_Severity_Definitions.md | P1 |
| [M] | TwinMOS_Website_Test_Data_Strategy.md | P1 |
| [M] | TwinMOS_Website_Visual_Regression_Test_Plan.md | P3 |
| [E] | content/website-content/02-about/05-quality-assurance.md (TwinMOS QA philosophy — input to test strategy) |  |

---

## H. DevOps, Infrastructure & Hosting

### H.1 Local & Environment Setup

| Status | File | Pri |
|--------|------|-----|
| [M] | TwinMOS_Website_Local_Dev_Setup_Guide.md | P0 |
| [P] | TwinMOS_Website_Docker_Compose_Spec.md (Tech Stack §19.4 + §3.3 outline services; full compose file still required) | P0 |
| [P] | TwinMOS_Website_Environment_Configuration_Spec.md (Tech Stack §19.2 covers env tiers) | P0 |
| [M] | TwinMOS_Website_Environment_Variables_Reference.md | P0 |
| [P] | TwinMOS_Website_Secrets_Management_Plan.md (Tech Stack §18.2 mentions Coolify; full plan still required) | P0 |
| [P] | TwinMOS_Website_Tooling_Inventory.md (Tech Stack Appendix A covers; standalone doc still required) | P0 |

### H.2 CI/CD

| Status | File | Pri |
|--------|------|-----|
| [P] | TwinMOS_Website_CI_CD_Pipeline_Spec.md (Tech Stack §20.2 outlines pipelines; full YAML still required) | P0 |
| [M] | TwinMOS_Website_GitHub_Actions_Workflows_Spec.md | P0 |
| [P] | TwinMOS_Website_Pre_Commit_Hooks_Spec.md (Tech Stack §20.4 covers Husky + lint-staged) | P0 |
| [P] | TwinMOS_Website_Branch_Protection_Rules.md (Tech Stack §20.1 covers) | P0 |
| [M] | TwinMOS_Website_Release_Management_Process.md | P1 |
| [M] | TwinMOS_Website_Versioning_Strategy.md | P1 |

### H.3 Hosting & Infrastructure

| Status | File | Pri |
|--------|------|-----|
| [P] | TwinMOS_Website_Hosting_Architecture_Spec.md (Tech Stack §19 covers; standalone doc still required) | P0 |
| [P] | TwinMOS_Website_Coolify_Configuration_Guide.md (Tech Stack §19.4 outlines; full guide still required) | P0 |
| [M] | TwinMOS_Website_Hetzner_Provisioning_Guide.md | P0 |
| [P] | TwinMOS_Website_Cloudflare_Configuration_Guide.md (Tech Stack §19.5 covers; full guide still required) | P0 |
| [P] | TwinMOS_Website_DNS_Records_Specification.md (Tech Stack §19.6 lists subdomains) | P0 |
| [M] | TwinMOS_Website_Backblaze_B2_Bucket_Spec.md | P0 |
| [P] | TwinMOS_Website_CDN_Caching_Strategy.md (Tech Stack §19.5 outlines) | P1 |
| [P] | TwinMOS_Website_Pre_Event_Scaling_Runbook.md (Tech Stack §19.4 mentions; full runbook still required) | P1 |

### H.4 Operations Runbooks

| Status | File | Pri |
|--------|------|-----|
| [M] | TwinMOS_Website_Deployment_Runbook.md | P1 |
| [M] | TwinMOS_Website_Rollback_Runbook.md | P1 |
| [P] | TwinMOS_Website_Backup_Restore_Runbook.md (Tech Stack §23 outlines) | P1 |
| [P] | TwinMOS_Website_Disaster_Recovery_Plan.md (Tech Stack §23 covers; full plan still required) | P1 |
| [P] | TwinMOS_Website_DR_Drill_Procedure.md (Tech Stack §23.3 outlines steps) | P1 |
| [M] | TwinMOS_Website_DNS_Cutover_Plan.md | P2 |
| [M] | TwinMOS_Website_Database_Migration_Runbook.md | P2 |
| [M] | TwinMOS_Website_SSL_Certificate_Renewal_Runbook.md | P1 |

### H.5 Monitoring & Observability

| Status | File | Pri |
|--------|------|-----|
| [P] | TwinMOS_Website_Monitoring_Specification.md (Tech Stack §17 outlines; standalone doc still required) | P1 |
| [M] | TwinMOS_Website_Alerting_Rules.md | P1 |
| [M] | TwinMOS_Website_Logging_Strategy.md | P1 |
| [M] | TwinMOS_Website_Sentry_Configuration_Guide.md | P1 |
| [M] | TwinMOS_Website_UptimeRobot_Setup.md | P1 |
| [M] | TwinMOS_Website_Plausible_Configuration.md | P1 |
| [P] | TwinMOS_Website_Synthetic_Monitoring_Spec.md (Tech Stack §17.7 outlines) | P1 |
| [M] | TwinMOS_Website_SLI_SLO_Definitions.md | P1 |

---

## I. Security & Compliance

### I.1 Security Architecture

| Status | File | Pri |
|--------|------|-----|
| [P] | TwinMOS_Website_Security_Architecture.md (Tech Stack §18 covers; standalone doc still required) | P0 |
| [M] | TwinMOS_Website_Threat_Model_STRIDE.md | P1 |
| [M] | TwinMOS_Website_Security_Controls_Catalog.md | P1 |
| [E] | TwinMOS_Website_Authentication_Authorization_Spec.md (covered in Tech Stack §5.6, §9; ready) | P0 |
| [E] | TwinMOS_Website_Content_Security_Policy_Spec.md (covered in Tech Stack §18.3) | P0 |
| [E] | TwinMOS_Website_HTTP_Security_Headers_Spec.md (covered in Tech Stack §18.2, §18.3) | P0 |
| [M] | TwinMOS_Website_Encryption_Strategy.md | P1 |
| [M] | TwinMOS_Website_Key_Management_Plan.md | P1 |
| [P] | TwinMOS_Website_OWASP_Top_10_Coverage_Matrix.md (Tech Stack §18 partial coverage) | P1 |

### I.2 Compliance Documentation

| Status | File | Pri |
|--------|------|-----|
| [E] | content/website-content/14-legal/00-legal-hub.md |  |
| [E] | content/website-content/14-legal/01-privacy-policy.md (privacy policy) |  |
| [E] | content/website-content/14-legal/02-cookie-policy.md |  |
| [E] | content/website-content/14-legal/03-terms-of-use.md |  |
| [E] | content/website-content/14-legal/04-terms-of-sale.md |  |
| [E] | content/website-content/14-legal/05-warranty-policy.md |  |
| [E] | content/website-content/14-legal/06-acceptable-use.md |  |
| [E] | content/website-content/14-legal/07-trademark-policy.md |  |
| [E] | content/website-content/14-legal/08-accessibility-statement.md |  |
| [E] | content/website-content/14-legal/09-imprint-eu.md |  |
| [E] | content/website-content/14-legal/10-supply-chain-disclosure.md |  |
| [E] | content/website-content/14-legal/11-modern-slavery-statement.md |  |
| [E] | content/website-content/14-legal/12-conflict-minerals.md |  |
| [E] | content/website-content/14-legal/13-product-recalls.md |  |
| [E] | content/website-content/14-legal/14-counterfeit-policy.md |  |
| [E] | content/website-content/14-legal/15-job-applicant-privacy.md (GDPR Art. 13 disclosure) |  |
| [E] | content/website-content/14-legal/16-vendor-code-of-conduct.md |  |
| [E] | content/website-content/14-legal/17-data-deletion-request.md (DSAR — fulfills DSAR Processing Workflow public-facing portion) |  |
| [E] | content/website-content/14-legal/18-cookie-preferences.md (Cookie Audit and CMP UI — public-facing) |  |
| [E] | content/website-content/14-legal/19-compliance-hub.md (compliance hub — fulfills part of Compliance Audit Calendar) |  |
| [E] | content/website-content/14-legal/20-rohs.md through 30-epeat.md (product-compliance certifications) |  |
| [E] | content/website-content/14-legal/31-security-disclosure.md (fulfills Security Disclosure Process public portion) |  |
| [E] | content/website-content/14-legal/32-vulnerability-program.md (fulfills Bug Bounty Program Specification public portion) |  |
| [E] | content/website-content/14-legal/33-sitemap.md |  |
| [E] | content/website-content/02-about/06-certifications.md (ISO 9001, CE, FCC, RoHS, REACH list) |  |
| [E] | content/website-content/12-careers/08-applicant-privacy.md (GDPR Art. 13 for recruitment) |  |
| [P] | TwinMOS_Website_DPIA_Data_Protection_Impact_Assessment.md (privacy policy pages cover; formal DPIA still required) | P1 |
| [P] | TwinMOS_Website_Records_of_Processing_Activities_GDPR_Art_30.md (privacy + cookie policy + applicant privacy partially cover; formal RoPA register still required) | P1 |
| [M] | TwinMOS_Website_Data_Classification_Policy.md | P1 |
| [P] | TwinMOS_Website_Cookie_Audit.md (cookie-policy + cookie-preferences pages cover; technical audit table still required) | P1 |
| [P] | TwinMOS_Website_DSAR_Processing_Workflow.md (data-deletion-request page covers public side; internal Legal-team workflow still required) | P1 |
| [M] | TwinMOS_Website_Privacy_by_Design_Checklist.md | P1 |
| [M] | TwinMOS_Website_PCI_DSS_Scope_Document.md | P3 |
| [P] | TwinMOS_Website_Compliance_Audit_Calendar.md (compliance-hub page lists certifications; calendar still required) | P1 |

### I.3 Security Operations

| Status | File | Pri |
|--------|------|-----|
| [M] | TwinMOS_Website_Penetration_Testing_Plan.md | P1 |
| [M] | TwinMOS_Website_Vulnerability_Management_Plan.md | P1 |
| [P] | TwinMOS_Website_Security_Incident_Response_Plan.md (Tech Stack §23.4 outlines; full plan still required) | P1 |
| [E] | TwinMOS_Website_Security_Disclosure_Process.md (covered in content/website-content/14-legal/31-security-disclosure.md — public-facing version is authoritative) | P1 |
| [E] | TwinMOS_Website_Bug_Bounty_Program_Specification.md (covered in content/website-content/14-legal/32-vulnerability-program.md) | P3 |
| [M] | TwinMOS_Website_Dependency_Security_Scanning_Spec.md | P1 |
| [M] | TwinMOS_Website_WAF_Rule_Configuration.md | P1 |
| [M] | TwinMOS_Website_DDoS_Mitigation_Plan.md | P1 |

---

## J. Operations, Maintenance & End-User Guides

### J.1 Operations Runbooks

| Status | File | Pri |
|--------|------|-----|
| [M] | TwinMOS_Website_Operations_Runbook_Master.md | P2 |
| [M] | TwinMOS_Website_On_Call_Procedure.md | P2 |
| [M] | TwinMOS_Website_Escalation_Matrix.md | P2 |
| [M] | TwinMOS_Website_Maintenance_Window_Procedure.md | P2 |
| [M] | TwinMOS_Website_Capacity_Planning_Guide.md | P2 |

### J.2 CMS & Content Operations

| Status | File | Pri |
|--------|------|-----|
| [M] | TwinMOS_Website_CMS_Admin_Guide.md | P2 |
| [M] | TwinMOS_Website_CMS_Editor_Quick_Reference.md | P2 |
| [P] | TwinMOS_Website_Content_Publishing_Workflow.md (BR-10.3 + Tech Stack §5 outline; full workflow doc still required) | P2 |
| [M] | TwinMOS_Website_Live_Preview_Guide.md | P2 |
| [M] | TwinMOS_Website_Bulk_Import_Export_Guide.md | P2 |
| [M] | TwinMOS_Website_Media_Library_Guide.md | P2 |

### J.3 Business Operations Guides

| Status | File | Pri |
|--------|------|-----|
| [E] | content/website-content/07-support/06-rma-hub.md (RMA hub) |  |
| [E] | content/website-content/07-support/07-rma-submit.md |  |
| [E] | content/website-content/07-support/08-rma-status.md |  |
| [E] | content/website-content/07-support/09-rma-policy.md |  |
| [P] | TwinMOS_Website_RMA_Operations_Guide.md (public-facing pages above; internal admin operations still required) | P3 |
| [E] | content/website-content/07-support/02-warranty-registration.md |  |
| [E] | content/website-content/07-support/03-warranty-lookup.md |  |
| [E] | content/website-content/07-support/04-warranty-by-region.md |  |
| [E] | content/website-content/07-support/05-warranty-faq.md |  |
| [P] | TwinMOS_Website_Warranty_Registration_Operations.md (public pages above; internal admin operations still required) | P2 |
| [E] | content/website-content/07-support/34-sn-check.md (anti-counterfeit serial check) |  |
| [E] | content/website-content/07-support/35-counterfeit-policy.md |  |
| [E] | content/website-content/14-legal/14-counterfeit-policy.md |  |
| [P] | TwinMOS_Website_Anti_Counterfeit_Operations_Guide.md (public pages above; internal Brand Protection ops still required) | P3 |
| [P] | TwinMOS_Website_Counterfeit_Report_Triage_Process.md (BR-17.2 5-day SLA + counterfeit-policy page; internal triage runbook still required) | P3 |
| [E] | content/website-content/09-partners/00-partners-hub.md |  |
| [E] | content/website-content/09-partners/08-partner-portal-login.md |  |
| [E] | content/website-content/09-partners/09-partner-portal-dashboard.md |  |
| [E] | content/website-content/09-partners/10-partner-marketing-assets.md |  |
| [E] | content/website-content/09-partners/11-partner-price-lists.md |  |
| [E] | content/website-content/09-partners/12-partner-training-resources.md |  |
| [P] | TwinMOS_Website_Partner_Portal_Admin_Guide.md (public pages above; admin guide still required) | P3 |
| [E] | content/website-content/09-partners/06-distributor-onboarding-process.md (fulfills Distributor Onboarding Process) |  |
| [E] | content/website-content/05-gaming/06-build-gallery.md |  |
| [E] | content/website-content/05-gaming/07-build-submit-form.md |  |
| [P] | TwinMOS_Website_Build_Gallery_Moderation_Guide.md (public pages above; moderation runbook still required) | P3 |
| [E] | content/website-content/07-support/37-live-chat-widget.md |  |
| [P] | TwinMOS_Website_Live_Chat_Agent_Guide.md (public spec above; internal agent ops guide still required) | P3 |
| [M] | TwinMOS_Website_E_Commerce_Admin_Guide.md | P3 |
| [M] | TwinMOS_Website_Order_Fulfillment_Process.md | P3 |
| [M] | TwinMOS_Website_Refund_Cancellation_Process.md | P3 |
| [E] | content/website-content/15-marketing/05-loyalty-program-reserved.md |  |
| [E] | content/website-content/15-marketing/06-referral-program-reserved.md |  |
| [E] | content/website-content/09-partners/14-mdf-program-reserved.md |  |
| [P] | TwinMOS_Website_Loyalty_Program_Operations.md (reserved page above; full ops doc still required) | P3 |
| [M] | TwinMOS_Website_Customer_Support_Playbook.md | P2 |
| [E] | content/website-content/07-support/38-support-sla.md (support SLA — public-facing) |  |
| [E] | content/website-content/07-support/36-contact-support.md |  |
| [P] | TwinMOS_Website_Form_Lead_Routing_Guide.md (Tech Stack §10.1 + §14.4 outline routing; admin runbook still required) | P2 |

---

## K. Developer Onboarding & Engineering Standards

### K.1 Onboarding

| Status | File | Pri |
|--------|------|-----|
| [M] | TwinMOS_Website_Developer_Onboarding_Guide.md | P0 |
| [M] | TwinMOS_Website_Day_1_Setup_Checklist.md | P0 |
| [M] | TwinMOS_Website_Project_Glossary.md | P0 |
| [M] | TwinMOS_Website_Repository_Map.md | P0 |

### K.2 Coding Standards

| Status | File | Pri |
|--------|------|-----|
| [M] | TwinMOS_Website_Coding_Standards_TypeScript.md | P0 |
| [M] | TwinMOS_Website_Coding_Standards_Astro.md | P0 |
| [M] | TwinMOS_Website_Coding_Standards_React.md | P0 |
| [M] | TwinMOS_Website_Coding_Standards_Strapi.md | P0 |
| [M] | TwinMOS_Website_Coding_Standards_CSS_Tailwind.md | P0 |
| [M] | TwinMOS_Website_ESLint_Prettier_Configuration.md | P0 |
| [M] | TwinMOS_Website_File_Naming_Conventions.md | P0 |

### K.3 Git & Collaboration

| Status | File | Pri |
|--------|------|-----|
| [P] | TwinMOS_Website_Git_Branching_Strategy.md (Tech Stack §20.1 covers trunk-based + branch protection) | P0 |
| [P] | TwinMOS_Website_Conventional_Commits_Guide.md (Tech Stack §1.1 + §20.1 reference Commitlint) | P0 |
| [M] | TwinMOS_Website_Pull_Request_Template.md | P0 |
| [P] | TwinMOS_Website_Code_Review_Guidelines.md (Tech Stack §20.1 outlines) | P0 |
| [M] | TwinMOS_Website_Pair_Programming_Guidelines.md | P0 |
| [M] | TwinMOS_Website_Issue_Template_Bug.md | P0 |
| [M] | TwinMOS_Website_Issue_Template_Feature.md | P0 |

### K.4 Repository Files (in repos themselves)

| Status | File | Pri |
|--------|------|-----|
| [M] | frontend-repo/README.md | P0 |
| [M] | frontend-repo/CONTRIBUTING.md | P0 |
| [M] | frontend-repo/CODEOWNERS | P0 |
| [M] | frontend-repo/.gitignore | P0 |
| [M] | frontend-repo/.editorconfig | P0 |
| [M] | frontend-repo/.nvmrc | P0 |
| [M] | frontend-repo/LICENSE | P0 |
| [M] | frontend-repo/CHANGELOG.md | P0 |
| [M] | frontend-repo/SECURITY.md | P0 |
| [M] | backend-repo/README.md | P0 |
| [M] | backend-repo/CONTRIBUTING.md | P0 |
| [M] | backend-repo/CODEOWNERS | P0 |
| [M] | backend-repo/.gitignore | P0 |
| [M] | backend-repo/.editorconfig | P0 |
| [M] | backend-repo/.nvmrc | P0 |
| [M] | backend-repo/LICENSE | P0 |
| [M] | backend-repo/CHANGELOG.md | P0 |
| [M] | backend-repo/SECURITY.md | P0 |
| [M] | docs/adr/README.md | P0 |

### K.5 AI-Assisted Development

| Status | File | Pri |
|--------|------|-----|
| [P] | TwinMOS_Website_AI_Assisted_Dev_Guidelines.md (Tech Stack §8 in Implementation Strategy v3.0 covers; standalone guidelines still required) | P0 |
| [M] | frontend-repo/AGENTS.md | P0 |
| [M] | frontend-repo/.cursorrules | P0 |
| [M] | frontend-repo/.github/copilot-instructions.md | P0 |
| [M] | backend-repo/AGENTS.md | P0 |
| [M] | backend-repo/.cursorrules | P0 |
| [M] | backend-repo/.github/copilot-instructions.md | P0 |
| [P] | TwinMOS_Website_AI_Anti_Patterns.md (Implementation Strategy §8.5 lists anti-patterns; standalone doc still required) | P0 |

---

## L. Performance Engineering

| Status | File | Pri |
|--------|------|-----|
| [P] | TwinMOS_Website_Performance_Budget.md (BRD §20 + Tech Stack §22 cover targets; standalone budget doc still required) | P0 |
| [P] | TwinMOS_Website_Core_Web_Vitals_Strategy.md (Tech Stack §22.1 covers) | P0 |
| [P] | TwinMOS_Website_Bundle_Size_Budget.md (Tech Stack §20.3 mentions threshold) | P1 |
| [P] | TwinMOS_Website_Image_Optimization_Spec.md (Tech Stack §8 covers) | P1 |
| [P] | TwinMOS_Website_Font_Loading_Strategy.md (Tech Stack §22.3 mentions subsetting) | P1 |
| [P] | TwinMOS_Website_Caching_Strategy.md (Tech Stack §19.5 + §22.3 cover) | P1 |
| [P] | TwinMOS_Website_Lazy_Loading_Spec.md (Tech Stack §8.2 + §22.3 cover) | P1 |
| [P] | TwinMOS_Website_Critical_CSS_Strategy.md (Tech Stack §22.3 mentions) | P1 |
| [M] | TwinMOS_Website_Third_Party_Script_Audit.md | P1 |

---

## M. Marketing, Launch & Go-Live

### M.1 Pre-Launch

| Status | File | Pri |
|--------|------|-----|
| [M] | TwinMOS_Website_Launch_Plan.md | P2 |
| [M] | TwinMOS_Website_Soft_Launch_Plan.md | P2 |
| [M] | TwinMOS_Website_Go_No_Go_Checklist.md | P2 |
| [M] | TwinMOS_Website_Pre_Launch_QA_Sign_Off.md | P2 |
| [M] | TwinMOS_Website_DNS_Migration_Plan.md | P2 |
| [M] | TwinMOS_Website_SEO_Migration_Plan.md | P2 |
| [M] | TwinMOS_Website_Hypercare_Plan.md | P2 |

### M.2 Marketing & PR

| Status | File | Pri |
|--------|------|-----|
| [E] | content/website-content/02-about/14-press-room.md (press room) |  |
| [E] | content/website-content/02-about/15-media-kit.md (media kit content) |  |
| [M] | TwinMOS_Website_PR_Press_Plan.md | P2 |
| [M] | TwinMOS_Website_Press_Release_Templates.md | P2 |
| [M] | TwinMOS_Website_Social_Media_Asset_Plan.md | P2 |
| [M] | TwinMOS_Website_Distributor_Communication_Plan.md | P2 |
| [E] | content/website-content/15-marketing/00-newsletter-signup-page.md |  |
| [E] | content/website-content/15-marketing/03-promotions-hub.md |  |
| [E] | content/website-content/15-marketing/07-launch-campaign-corex-pro.md |  |
| [E] | content/website-content/15-marketing/08-launch-campaign-voltx-rgb.md |  |
| [E] | content/website-content/15-marketing/09-india-launch-campaign.md |  |
| [P] | TwinMOS_Website_Email_Campaign_Plan.md (newsletter pages above; campaign plan still required) | P2 |

### M.3 Analytics & KPI

| Status | File | Pri |
|--------|------|-----|
| [M] | TwinMOS_Website_KPI_Dashboard_Specification.md | P1 |
| [M] | TwinMOS_Website_Analytics_Event_Taxonomy.md | P1 |
| [M] | TwinMOS_Website_Conversion_Tracking_Plan.md | P1 |
| [M] | TwinMOS_Website_GA4_Configuration_Guide.md | P1 |
| [M] | TwinMOS_Website_GTM_Container_Specification.md | P1 |
| [M] | TwinMOS_Website_Marketing_Pixel_Configuration.md | P1 |

---

## N. Training & Knowledge Transfer

| Status | File | Pri |
|--------|------|-----|
| [M] | TwinMOS_Website_Training_Plan.md | P2 |
| [M] | TwinMOS_Website_CMS_Training_Curriculum.md | P2 |
| [M] | TwinMOS_Website_Marketing_Team_Training_Materials.md | P2 |
| [M] | TwinMOS_Website_Support_Team_Training_Materials.md | P2 |
| [M] | TwinMOS_Website_Sales_Team_Training_Materials.md | P2 |
| [M] | TwinMOS_Website_Knowledge_Transfer_Plan.md | P2 |
| [M] | TwinMOS_Website_Train_The_Trainer_Guide.md | P2 |
| [M] | TwinMOS_Website_Video_Walkthrough_Index.md | P2 |
| [M] | TwinMOS_Website_FAQ_Internal_Stakeholders.md | P2 |

---

## O. Phase 2 — Localization & Partner Enablement (Specs Created During Phase 2)

| Status | File | Pri |
|--------|------|-----|
| [M] | TwinMOS_Website_Phase_2_Kick_Off_Document.md | P3 |
| [P] | TwinMOS_Website_Partner_Portal_Functional_Spec.md (Tech Stack §9.3 + content/website-content/09-partners/ outline; full functional spec still required) | P3 |
| [P] | TwinMOS_Website_RMA_Workflow_Specification.md (Tech Stack §10.4 outlines 7-state machine; full spec still required) | P3 |
| [P] | TwinMOS_Website_Anti_Counterfeit_System_Spec.md (Tech Stack §10.3 outlines; full spec still required) | P3 |
| [P] | TwinMOS_Website_Compatibility_Finder_Algorithm_Spec.md (content/website-content/03-products/07-finder/ + Tech Stack §10.5; full algorithm spec still required) | P3 |
| [P] | TwinMOS_Website_QVL_Data_Ingest_Specification.md (Tech Stack §10.5 outlines pipeline) | P3 |
| [M] | TwinMOS_Website_Watermarked_PDF_Generation_Spec.md | P3 |
| [E] | content/website-content/05-gaming/03-rgb-showcase.md |  |
| [E] | content/website-content/05-gaming/04-rgb-sync-compatibility.md |  |
| [P] | TwinMOS_Website_RGB_Visualizer_Functional_Spec.md (content above outlines; technical functional spec still required) | P3 |
| [P] | TwinMOS_Website_Build_Submission_Moderation_Spec.md (build-gallery + build-submit-form pages outline; full moderation spec still required) | P3 |
| [M] | TwinMOS_Website_Phase_2_Launch_Readiness_Checklist.md | P3 |

---

## P. Phase 3 — Commerce & Advanced Features (Specs Created During Phase 3)

| Status | File | Pri |
|--------|------|-----|
| [M] | TwinMOS_Website_Phase_3_Kick_Off_Document.md | P3 |
| [M] | TwinMOS_Website_E_Commerce_Functional_Spec.md | P3 |
| [M] | TwinMOS_Website_Cart_Checkout_Flow_Spec.md | P3 |
| [M] | TwinMOS_Website_Payment_Processing_Spec.md | P3 |
| [M] | TwinMOS_Website_Tax_Calculation_Spec.md | P3 |
| [M] | TwinMOS_Website_Shipping_Configuration_Spec.md | P3 |
| [M] | TwinMOS_Website_Inventory_Management_Spec.md | P3 |
| [M] | TwinMOS_Website_Order_Lifecycle_Spec.md | P3 |
| [M] | TwinMOS_Website_Customer_Account_Spec.md | P3 |
| [M] | TwinMOS_Website_Loyalty_Program_Functional_Spec.md | P3 |
| [M] | TwinMOS_Website_Referral_Program_Functional_Spec.md | P3 |
| [M] | TwinMOS_Website_MDF_Program_Functional_Spec.md | P3 |
| [M] | TwinMOS_Website_PostHog_Configuration_Guide.md | P3 |
| [M] | TwinMOS_Website_AB_Testing_Framework_Spec.md | P3 |
| [M] | TwinMOS_Website_Marketing_Automation_Spec.md | P3 |
| [M] | TwinMOS_Website_Phase_3_Launch_Readiness_Checklist.md | P3 |

---

## Q. Closeout & Phase 4 Handoff

| Status | File | Pri |
|--------|------|-----|
| [M] | TwinMOS_Website_Engagement_Closeout_Report.md | P3 |
| [M] | TwinMOS_Website_Phase_4_Backlog.md | P3 |
| [M] | TwinMOS_Website_Phase_4_Retainer_Scope.md | P3 |
| [M] | TwinMOS_Website_Lessons_Learned_Document.md | P3 |
| [M] | TwinMOS_Website_Final_Acceptance_Document.md | P3 |
| [M] | TwinMOS_Website_Source_Code_Transfer_Receipt.md | P3 |
| [M] | TwinMOS_Website_Final_IP_Transfer_Confirmation.md | P3 |
| [M] | TwinMOS_Website_Maintenance_Handover_Document.md | P3 |
| [M] | TwinMOS_Website_Post_Launch_Optimization_Plan.md | P3 |

---

## R. Reference Index & Search Aids

| Status | File | Pri |
|--------|------|-----|
| [E] | TwinMOS_Website_Project_Documentation_Inventory.md (this file) |  |
| [M] | TwinMOS_Website_Document_Master_Index.md | P0 |
| [M] | TwinMOS_Website_Acronym_Glossary.md | P0 |
| [M] | TwinMOS_Website_Stakeholder_Contact_List.md | P0 |
| [M] | TwinMOS_Website_Vendor_Contact_List.md | P1 |
| [M] | TwinMOS_Website_External_Resources_Library.md | P1 |

---

## Reconciliation Summary (v1.0 → v2.0)

| Category | v1.0 Existing | v1.0 Missing | v2.0 Existing | v2.0 Partial | v2.0 Missing |
|----------|---------------|--------------|---------------|--------------|--------------|
| A. Foundation & Strategy | 9 | 0 | 10 | 0 | 0 |
| B. Contractual & Legal | 0 | 9 | 0 | 0 | 9 |
| C. Project Management | 0 | 14 | 0 | 0 | 14 |
| D.1 Engineering Design Docs | 0 | 8 | 0 | 2 | 6 |
| D.2 Data Layer | 0 | 7 | 2 | 2 | 3 |
| D.3 API Specifications | 0 | 7 | 3 | 0 | 4 |
| D.4 Integration Specs | 0 | 13 | 0 | 2 | 11 |
| D.5 ADRs | 0 | 19 | 0 | 9 | 10 |
| E.1 Design System | 0 | 11 | 0 | 4 | 7 |
| E.2 Wireframes & Mockups | 0 | 6 | 4 | 1 | 5 |
| E.3 Responsive & Accessibility | 0 | 5 | 1 | 3 | 2 |
| E.4 Interaction Design | 0 | 6 | 4 | 1 | 4 |
| F.1 Content (existing) | 3 | 0 | 19 (folder groups + maps) | 0 | 0 |
| F.2 Editorial Standards | 0 | 5 | 1 | 0 | 4 |
| F.3 SEO | 0 | 11 | 1 | 6 | 5 |
| F.4 Localization | 0 | 6 | 1 | 2 | 4 |
| G. QA & Testing | 0 | 21 | 1 | 5 | 16 |
| H.1 Local & Env Setup | 0 | 6 | 0 | 5 | 1 |
| H.2 CI/CD | 0 | 6 | 0 | 4 | 2 |
| H.3 Hosting & Infra | 0 | 8 | 0 | 6 | 2 |
| H.4 Ops Runbooks | 0 | 8 | 0 | 3 | 5 |
| H.5 Monitoring | 0 | 8 | 0 | 2 | 6 |
| I.1 Security Architecture | 0 | 9 | 3 | 3 | 3 |
| I.2 Compliance Documentation | 1 | 8 | 27 | 5 | 1 |
| I.3 Security Operations | 0 | 8 | 2 | 1 | 5 |
| J.1 Operations Runbooks | 0 | 5 | 0 | 0 | 5 |
| J.2 CMS & Content Operations | 0 | 6 | 0 | 1 | 5 |
| J.3 Business Operations Guides | 0 | 14 | 25 (content pages) | 9 | 4 |
| K.1 Onboarding | 0 | 4 | 0 | 0 | 4 |
| K.2 Coding Standards | 0 | 7 | 0 | 0 | 7 |
| K.3 Git & Collaboration | 0 | 7 | 0 | 3 | 4 |
| K.4 Repository Files | 0 | 19 | 0 | 0 | 19 |
| K.5 AI-Assisted Dev | 0 | 8 | 0 | 2 | 6 |
| L. Performance Engineering | 0 | 9 | 0 | 8 | 1 |
| M.1 Pre-Launch | 0 | 7 | 0 | 0 | 7 |
| M.2 Marketing & PR | 0 | 5 | 7 (content pages) | 1 | 4 |
| M.3 Analytics & KPI | 0 | 6 | 0 | 0 | 6 |
| N. Training & Knowledge Transfer | 0 | 9 | 0 | 0 | 9 |
| O. Phase 2 Specs | 0 | 10 | 2 (content pages) | 6 | 4 |
| P. Phase 3 Specs | 0 | 16 | 0 | 0 | 16 |
| Q. Closeout & Handoff | 0 | 9 | 0 | 0 | 9 |
| R. Reference Index | 1 | 5 | 1 | 0 | 5 |
| **TOTAL** | **14** | **325** | **~114** | **~95** | **~225** |

> **Net change:** v1.0 reported 14 existing / 325 missing. v2.0 deep-inventory reveals **114 fully existing** documents (a **+100 difference** — 100 of v1.0's "missing" items already had public-facing content equivalents) and **95 partial** documents (text exists in BRD / URD / Tech Stack / content pages but a consolidated developer-facing document is still required). True missing count drops from 325 → **~225**.

---

## Critical-Path P0 Documents Re-Assessed

After reconciliation, the **P0 documents that are truly missing** (cannot be built from existing material in less than half a day) drop from 50 → **~38**. The biggest savings come from:

1. **Authentication / Authorization / CSP / Security Headers** — fully covered in Tech Stack §5.6, §9, §18 (no new doc needed)
2. **Data Models (Strapi + Astro)** — fully covered in Tech Stack §25 (no new doc needed)
3. **API Error Handling / Rate Limiting** — fully covered in Tech Stack §1.2, §18.1, §22.2
4. **27 Compliance documents** — fully covered by the 34 legal pages in `content/website-content/14-legal/` plus the Accessibility Statement and Job Applicant Privacy
5. **Security Disclosure & Bug Bounty Process** — fully covered by `14-legal/31-security-disclosure.md` and `14-legal/32-vulnerability-program.md`
6. **Distributor Onboarding Process** — fully covered by `09-partners/06-distributor-onboarding-process.md`
7. **Microcopy Library** — fully covered by `00-site-wide/15-microcopy-glossary.md`
8. **Most Phase 2/3 functional specs** — content templates already exist as reserved/active pages; functional/algorithmic spec still required

### Updated P0 List (Truly Missing — ~38 documents)

#### Contractual (5)
1. TwinMOS_Unisoft_Master_Service_Agreement.md
2. TwinMOS_Unisoft_Statement_of_Work.md
3. TwinMOS_Unisoft_NDA.md
4. TwinMOS_Unisoft_Data_Processing_Agreement.md
5. TwinMOS_Unisoft_IP_Ownership_Transfer_Agreement.md

#### Project Management (5)
6. TwinMOS_Website_Project_Charter.md
7. TwinMOS_Website_Project_Plan_Phases_1-3.md
8. TwinMOS_Website_Sprint_Backlog_Phase_1.md
9. TwinMOS_Website_Milestone_Schedule.md
10. TwinMOS_Website_RACI_Matrix.md
11. TwinMOS_Website_Stakeholder_Register.md

#### Engineering / Architecture (5)
12. TwinMOS_Website_HLD_High_Level_Design.md (consolidates Tech Stack §3 + visual diagrams)
13. TwinMOS_Website_Database_ERD.md (visual ERD)
14. TwinMOS_Website_API_Specification_OpenAPI.yaml
15. TwinMOS_Website_Data_Migration_Plan.md
16. ADR-001 through ADR-008 (8 ADRs, mostly write-ups of existing decisions — ~half a day each)

#### Design (8)
17. TwinMOS_Website_Design_System.md (consolidates URD §20 + new tokens)
18. TwinMOS_Website_Brand_Guideline.md
19. TwinMOS_Website_Logo_Usage_Guide.md
20. TwinMOS_Website_Iconography_Spec.md
21. TwinMOS_Website_Component_Library_Spec.md
22. TwinMOS_Website_Wireframes_Low_Fidelity.md
23. TwinMOS_Website_Mockups_High_Fidelity.md
24. TwinMOS_Website_Figma_Design_Files_Index.md
25. TwinMOS_Website_User_Flows.md

#### Content / SEO (3)
26. TwinMOS_Website_Editorial_Style_Guide.md
27. TwinMOS_Website_Tone_of_Voice_Guide.md
28. TwinMOS_Website_Legacy_URL_to_New_URL_Mapping.md + 301_Redirect_Plan.md
29. TwinMOS_Website_Image_Asset_Naming_Convention.md

#### DevOps (4)
30. TwinMOS_Website_Local_Dev_Setup_Guide.md
31. TwinMOS_Website_Environment_Variables_Reference.md
32. TwinMOS_Website_GitHub_Actions_Workflows_Spec.md (with actual YAML)
33. TwinMOS_Website_Hetzner_Provisioning_Guide.md

#### Developer Onboarding & Repos (8)
34. TwinMOS_Website_Developer_Onboarding_Guide.md
35. TwinMOS_Website_Coding_Standards (master) — single doc covering TS / Astro / React / Strapi / Tailwind
36. frontend-repo seed files (README, CONTRIBUTING, CODEOWNERS, .gitignore, .editorconfig, .nvmrc, AGENTS.md, .cursorrules) — ~8 files
37. backend-repo seed files (same set) — ~8 files
38. docs/adr/README.md + ADR_TEMPLATE.md

> Repository seed files (item 36, 37) are typically ~30-line files generated at repo init — count them as 1 effort-unit despite being many files.

---

## Recommendations

1. **Pre-Sprint-0 sprint (3–5 days):** TwinMOS sponsor + Unisoft Team Lead + 1 designer jointly produce the ~38 truly-missing P0 documents. The reduced count (vs 50 in v1.0) means a 1-week pre-engagement is now realistic for a 2-developer + sponsor + designer effort.

2. **High-leverage sequence:**
   - **Day 1:** Contracts (5) + Project Charter + RACI + Stakeholder Register
   - **Day 2:** HLD + ERD + OpenAPI spec stub + ADRs (write-ups of existing decisions in Tech Stack)
   - **Day 3:** Design system + Brand guideline + Wireframes (use Figma defaults + existing content as input)
   - **Day 4:** Local Dev Setup + Repo seed files + Onboarding guide
   - **Day 5:** Editorial style guide + URL mapping + Day-1 checklist

3. **The 95 [P] Partial documents** can be created ad hoc during their relevant Sprint; they are mostly consolidations of material already in BRD / URD / Tech Stack / content pages and require ~2–4 hours each.

4. **Document maintenance:** The `content/website-content/` folder (454 files) is now the single source of truth for compliance, operations, and public-facing content. The dev team should treat it as **input** — never duplicate this content into separate developer documents.

---

## Document Change Log

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | 2 May 2026 | Initial inventory based on existing project artifacts + research-driven gap analysis |
| **2.0** | **2 May 2026** | **Deep-inventory reconciliation: 100 items moved from [M] Missing → [E] Exists (mostly content/website-content/ pages that fulfill compliance / operations / business spec requirements). 95 items reclassified [P] Partial. True missing count drops 325 → ~225. Critical-path P0 missing drops 50 → 38.** |

---

**Canonical Location:** `C:\software_project\TwinMOS\Corporate website development for TwinMOS\TwinMOS_Website_Project_Documentation_Inventory.md`
**Owner:** TwinMOS IT/Technical Lead
**Next Review:** Upon Sprint 0 close (Week 2) and at every phase boundary
