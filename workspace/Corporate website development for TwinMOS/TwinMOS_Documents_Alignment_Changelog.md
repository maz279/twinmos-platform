# TwinMOS Document Suite — Alignment Changelog

**Reference:** TWN-CHANGELOG-2026-001
**Date:** 30 April 2026 (v2.0 → v3.0 update appended)
**Author:** TwinMOS Digital Transformation Team
**Scope:** Cross-document alignment cycle log (v1.0 → v2.0 → v3.0)

---

## 1. Purpose

This changelog documents the comprehensive review, revision, and alignment of the TwinMOS Corporate Website document suite (RFP, BRD, URD). The objective was to:

1. Resolve all factual inconsistencies between the three documents
2. Eliminate cross-reference errors and dangling pointers
3. Standardize phased roadmap, certifications, warranty rules, and identifiers
4. Add missing enterprise-grade procurement, security, and governance content
5. Ensure 100% alignment with the **Company Profile** (canonical source of truth) and the **Forensic Audit** (current-state evidence)

---

## 2. Documents Affected

| Document | Previous Version | New Version |
|----------|------------------|-------------|
| TwinMOS Company Profile (`TwinMOS_Company_Profile_Comprehensive.md`) | 2.0 | 2.0 (heritage statement aligned) |
| TwinMOS Website Forensic Audit (`TwinMOS_Website_Forensic_Audit.md`) | 1.0 | 1.0 (no changes — historical evidence) |
| TwinMOS Website RFP (`TwinMOS_Website_RFP.md`) | 1.0 | **2.0 (Aligned Edition)** |
| TwinMOS Website BRD (`TwinMOS_Website_BRD.md`) | 1.0 | **2.0 (Aligned Edition)** |
| TwinMOS Website URD (`TwinMOS_Website_URD.md`) | 1.0 | **2.0 (Aligned Edition)** |

---

## 3. Discrepancies Identified & Resolved

### 3.1 Factual Discrepancies (Now Resolved)

| # | Item | Before | After (Standardized) |
|---|------|--------|----------------------|
| F-1 | Heritage years | Profile: "25+ years"; RFP/BRD/URD: "27+ years" | **All docs: "27+ years (since 1998)"** |
| F-2 | ISO standard | RFP: "ISO 9001:2000 (TUV SUD)" — outdated | **All docs: "ISO 9001 (manufacturing partners)"** |
| F-3 | Manufacturing footprint | RFP: "Hsinchu, Taiwan; Dongguan and Xinjiang, China"; Profile: "Taiwan" | **All docs: "Taiwan-based manufacturing with regional partner facilities"** (politically neutral, factually safe) |
| F-4 | Warranty rules | BRD: hard-coded Lifetime/5y/3y; Profile: "3 years standard" | **BRD BR-6.1 reframed:** CMS-driven per-product configuration with reference standard (Limited Lifetime DRAM, 5y NVMe, 3y SATA), plus BR-6.5 enforcing CMS-driven display |
| F-5 | UAE Superbrand 2022 | BRD/URD displayed unconditionally; Profile/Audit: not mentioned | **All docs:** Conditional display per BR-5.5 (must have certificate evidence in CMS) |
| F-6 | Certifications list | RFP/BRD/URD: inconsistent subsets | **All docs (single source):** ISO 9001, FCC, CE, UKCA, EAC, RoHS, REACH, JEDEC (DRAM); BIS for India added in Phase 2 |

### 3.2 Phased Roadmap Inconsistency (Now Resolved)

| Document | Before | After |
|----------|--------|-------|
| RFP §12.1 | "Phase 2 (Month 3)" — implied single month | **Phase 2 (Months 6–9)** — full localization & partner enablement window |
| BRD §6.1 | "Phase 2 — Months 6–9" | (Unchanged; this was the correct view) |
| URD §1.2 | "Phase 2 (Months 3–6)" — incorrect | **Phase 2 (Months 6–9)** — aligned with BRD |

A new authoritative roadmap has been added as **RFP §4.4** and replicated in **BRD §6.1** and **URD §1.2** to lock the four-phase timeline:
- Phase 1 (Months 1–5): Core website, English only — public launch
- Phase 2 (Months 6–9): Multi-language (AR, BN, HI), partner portal, live chat, anti-counterfeit lookup
- Phase 3 (Months 10–15): E-commerce evaluation/MVP, RU/ZH/FR languages, advanced analytics
- Phase 4 (Months 16+): ES/PT/DE languages, ongoing SEO/CRO

### 3.3 Cross-Reference Errors (Now Resolved)

| # | Issue | Resolution |
|---|-------|------------|
| X-2 | URD §16.3 misreferenced `BR-9.1` (claimed it was RTL; actually `BR-9.2`) | URD §16.3 now correctly maps BR-9.1 (English source of truth), BR-9.2 (RTL), BR-9.3 (currency informational), BR-9.4 (unique URLs) |
| X-3 | URD §34.4 contained foreign-language artifact `响应时间承诺` | Replaced with "Response-Time Commitment" |
| X-4 | URD Use Case Diagrams missing UC-26, UC-27, UC-28, UC-31 | Added §19.5 Cross-Cutting Use Case Diagram covering all of these |
| X-5 | URD diagram §19.4 used invalid identifier "UC-7.2" | Renamed to **UC-32 (Download Marketing Assets)**, with full UC-32 entry added in §18 |
| X-6 | BRD §26 listed `/api/products` but §26.3 specified versioning `/api/v1/...` | All endpoints in §26.1 and §26.2 now use `/api/v1/...` consistently |

### 3.4 Procurement & Governance Gaps in RFP (Now Filled)

The RFP previously had a vague placeholder submission deadline, no procurement contact, no NDA clause, and no vendor Q&A protocol. **§16 has been comprehensively rewritten** to include:

- **§16.1 Procurement Timeline** with concrete dates from RFP issuance (29 April 2026) to project kickoff (24 July 2026)
- **§16.2 Confidentiality and NDA** — required execution before sharing supporting documents
- **§16.3 Required Documents** — expanded from 9 to 12 items (added compliance statements, security posture, sub-contractor disclosure)
- **§16.4 Submission Format** — concrete email addresses (`procurement@twinmos.com`, `rfp-queries@twinmos.com`)
- **§16.5 Evaluation Process** — six-step process with reference checks and award notification protocol
- **§16.6 Vendor Eligibility & Disqualification Criteria** — clear, objective rules

### 3.5 Other Enterprise-Grade Improvements

| # | Improvement | Document(s) |
|---|-------------|-------------|
| E-1 | Added CI/CD pipeline requirements (lint, a11y scan, security scan, Lighthouse, automated rollback) | RFP §6.3 |
| E-2 | Added observability requirements (Sentry/RUM/synthetic checks) | RFP §6.3 |
| E-3 | Added data residency clause (UAE/EU/India compliance) | RFP §6.3, §11 |
| E-4 | Added explicit DR objectives (RTO ≤ 4h, RPO ≤ 15 min) reflected in vendor scope | RFP §6.3 (BRD §23 already had detail) |
| E-5 | Added anti-counterfeit serialization as a Phase-2 driver and feature | RFP §3.2, §4.3, §4.4 |
| E-6 | Source-of-truth hierarchy clause introduced | BRD §1, RFP Appendix D, URD §36 / Document Suite Index |
| E-7 | KPI baseline disclaimer added (estimates require GA4 re-measurement) | BRD §28.2 |
| E-8 | Award publication rule added (BR-5.5: certificate evidence required) | BRD §12.4, §22.4; URD §UR-5.3.3 |
| E-9 | Brand & product-line architecture expanded with all product lines from Profile (TornadoX7, Concord CL16 RGB, DDR4 SO-DIMM, DDR3, M.2 SATA, USB Hub, etc.) | RFP §2 |
| E-10 | RFP-FR-X.Y identifier convention introduced and adopted in URD traceability matrix | RFP §8; URD §35.2 |
| E-11 | URD added UC-32 (Download Marketing Assets) and §19.5 Cross-Cutting Diagram | URD §18, §19.5 |
| E-12 | Document Control tables enhanced with version, owner, distribution, and synchronization metadata | All three docs |

---

## 4. Source-of-Truth Hierarchy (Authoritative)

To prevent future drift, the document suite now operates under an explicit precedence rule:

1. **Company Profile** (`TwinMOS_Company_Profile_Comprehensive.md`) — for facts about TwinMOS (heritage, leadership, products, certifications)
2. **BRD** (`TwinMOS_Website_BRD.md`) — for business rules and project scope
3. **URD** (`TwinMOS_Website_URD.md`) — for user-facing interaction details
4. **RFP** (`TwinMOS_Website_RFP.md`) — for procurement and contractual scope

Any conflict that cannot be resolved by this hierarchy must be raised in writing during the Vendor Q&A period (RFP §16.1) or via a Change Request (URD §36).

---

## 5. Verification — 100% Alignment Checks

The following checks were run during the alignment exercise; all passed at the time of v2.0 issuance:

| Check | Status |
|-------|--------|
| Heritage years consistent across all three docs ("27+ years (since 1998)") | ✅ Pass |
| ISO claim corrected to the published TÜV SÜD ISO 9001:2000 (2002) certification across all three docs | ✅ Pass |
| Phase 2 timing aligned (Months 6–9) across all three docs | ✅ Pass |
| Phase 3 timing aligned (Months 10–15) across all three docs | ✅ Pass |
| Phase 4 timing aligned (Months 16+) across all three docs | ✅ Pass |
| Warranty rules driven by CMS configuration (no hard-coded values) | ✅ Pass |
| API endpoints uniformly versioned (`/api/v1/...`) | ✅ Pass |
| All RFP-FR-X.Y identifiers cross-referenced in URD | ✅ Pass |
| Foreign-language artifacts removed from URD | ✅ Pass |
| Use Case identifiers consistent (UC-1 through UC-32, no gaps) | ✅ Pass |
| Document Control tables present and current in all three docs | ✅ Pass |
| Each doc declares its synchronization counterparts in the header | ✅ Pass |
| Award/UAE-Superbrand display now conditional on verification (BR-5.5) | ✅ Pass |
| Manufacturing description politically/factually neutral | ✅ Pass |
| `/api/v1/` consistent — no orphan unversioned endpoints in BRD §26 | ✅ Pass |

---

## 6. Outstanding Items (Not Blocking Document Suite)

These items remain outside the document suite and are flagged for executive attention:

| # | Item | Owner | Notes |
|---|------|-------|-------|
| O-2 | UAE Superbrand 2022 verification | Marketing Director | If certificate exists, attach to CMS award entry; if not, omit per BR-5.5 |
| O-3 | Final warranty terms confirmation per product line | Product Manager | Required before Phase 1 launch (BR-6.1) |
| O-4 | KPI baseline re-measurement | Marketing | First 30 days post-launch via GA4 (BRD §28.2) |
| O-5 | Vendor selection and award | Procurement | Target: 17 July 2026 (RFP §16.1) |

---

## 7. Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Marketing Director | (TBC) | ____________ | ___________ |
| IT/Technical Lead | (TBC) | ____________ | ___________ |
| Legal/Compliance | (TBC) | ____________ | ___________ |

---

*This changelog is a control document for the v1.0 → v2.0 transition. Future revisions of any single document must be logged in that document's own Document Control table; cross-document alignment changes must additionally be logged in this changelog.*

**Changelog Version (v2.0 cycle):** 1.0
**Issued:** 29 April 2026

---

## 8. v2.0 → v3.0 Alignment Cycle (NEW)

**Date:** 30 April 2026
**Driving Audit:** `TwinMOS_Documents_Forensic_Alignment_Audit_v2.md`
**Scope:** Align RFP, BRD, URD with the canonical content blueprint (`content/TwinMOS_Website_Content_Map.md` v1.0, 287 entries) and the on-disk content corpus (`content/website-content/`, 351 markdown files).

### 8.1 Documents Affected

| Document | v2.0 → v3.0 |
|----------|-------------|
| TwinMOS Website RFP | 2.0 → **3.0 (Content-Aligned Edition)** |
| TwinMOS Website BRD | 2.0 → **3.0 (Content-Aligned Edition)** |
| TwinMOS Website URD | 2.0 → **3.0 (Content-Aligned Edition)** |
| TwinMOS Forensic Alignment Audit | (NEW) **2.0** — net-new diagnostic document |
| TwinMOS Company Profile | unchanged 2.0 |
| TwinMOS Website Forensic Audit (live site) | unchanged 1.0 |

### 8.2 Discrepancies Resolved (48 Findings from Audit v2.0)

| Domain | Findings | Resolution |
|--------|----------|-----------|
| Information Architecture | 11 critical | Replaced RFP Appendix B with 16-section IA tree mirroring Content Map. Added Brands Hub as a discoverability axis. Site-wide components fully scoped. |
| Functional Epic Coverage | 7 critical | Added 8 new BRD epics (11–18): Solutions, Technology/R&D, Learn Hub, Careers, Marketing Programs, Compliance Hub, Anti-Counterfeit, Channel Programs. Mirrored in URD as UR-Epics 11–18. |
| Persona Coverage | 4 high | Added 6 new personas: Faisal (Embedded), Ms. Tan (Government), Mr. Rahman (Education IT), Mr. Wong (OEM/ODM), Lina (Media), Sara (Job Applicant). |
| Phased Roadmap & Content Scope | 6 high | Added Reserved/Conditional Scope appendix listing 18 reserved pages with phase triggers. Updated content quantity from 50→287. Updated SKU count from 50→100+. Added 9-locale reconciliation. |
| Compliance & Legal Coverage | 9 high | Expanded BRD §22 with 22-item legal page inventory. Added pages for Trademark, Accessibility, Imprint EU, Modern Slavery, Conflict Minerals, Vendor Code of Conduct, Data Deletion Request, Job Applicant Privacy, Security Disclosure, Vulnerability Program, Counterfeit Policy (legal pair), WEEE, EPEAT. |
| Content Quantity & Ownership | 5 medium | Updated BRD §9.2 content table to mirror Content Map sections. Added owner-cross-reference annotations. |
| Cross-Reference & Traceability | 6 medium | Added Content Map and SKU Reference to source-of-truth hierarchy. Added rows in URD §35 traceability matrix for all new epics. Allocated new RFP-FR-9 through RFP-FR-18 ID ranges. |

### 8.3 New Source-of-Truth Hierarchy

1. Company Profile — facts about TwinMOS
2. **Content Map** — content scope and IA (NEW IN v3.0)
3. **`_master-sku-reference.md`** — SKU registry (NEW IN v3.0)
4. BRD — business rules and project scope
5. URD — user-facing interaction details
6. RFP — procurement and contractual scope

### 8.4 New Use Cases Added in URD (UC-33 through UC-50)

| UC | Title |
|----|-------|
| UC-33 | Browse Solutions Hub by Vertical |
| UC-34 | Read Case Study |
| UC-35 | Read Technology / R&D Article |
| UC-36 | Download Technology Whitepaper |
| UC-37 | Read Buying Guide |
| UC-38 | Read "Explained" Article |
| UC-39 | View Performance Benchmark |
| UC-40 | Submit Job Application |
| UC-41 | Newsletter Lifecycle (Subscribe / Confirm / Unsubscribe) |
| UC-42 | View Promotion or Launch Campaign |
| UC-43 | Read Privacy / Compliance / ESG Disclosure |
| UC-44 | Manage Cookie Preferences |
| UC-45 | Verify Product Authenticity (SN-Check) |
| UC-46 | Report Counterfeit |
| UC-47 | Apply to Channel Program (OEM/ODM, System Builder, Reseller) |
| UC-48 | Visit Regional Distributor Hub |
| UC-49 | Press Room — Download Media Kit |
| UC-50 | Browse Country / Regional Landing Page |

### 8.5 New RFP Feature ID Ranges

| ID Range | Scope |
|----------|-------|
| RFP-FR-8.8 | Brand Hub Architecture (NEW) |
| RFP-FR-9 | Solutions / Vertical Use Cases (NEW) |
| RFP-FR-10 | Technology / R&D Hub (NEW) |
| RFP-FR-11 | Learn / Knowledge Hub (NEW) |
| RFP-FR-12 | Multi-Region & Localization (Expanded) |
| RFP-FR-13 | Careers (NEW) |
| RFP-FR-14 | Marketing Programs & Campaigns (NEW) |
| RFP-FR-15 | Compliance, Trust & Legal Hub (NEW) |
| RFP-FR-16 | Anti-Counterfeit / Product Authentication (NEW) |
| RFP-FR-17 | Channel Programs — OEM/ODM, System Builder, MDF, Regional Hubs (NEW) |
| RFP-FR-18 | Press Room & Investor Relations (NEW) |

### 8.6 Budget Update

| Phase | v2.0 Budget | v3.0 Budget | Delta |
|-------|-------------|-------------|-------|
| Phase 1 | $105K – $201K | $179K – $333K | +70%~+66% (reflects 16-section scope vs 9-section v2.0 scope) |
| Phase 2 | $30K – $60K | $55K – $95K | +83% / +58% |
| Phase 3 | (not separately scoped in v2.0) | $60K – $120K | NEW |

### 8.7 Verification — 100% Alignment Checks (v3.0)

| Check | Status |
|-------|--------|
| Content Map referenced in BRD §1 source-of-truth hierarchy | ✅ Pass |
| `_master-sku-reference.md` referenced in BRD §1 source-of-truth hierarchy | ✅ Pass |
| All 16 Content Map sections covered in RFP §17 IA tree | ✅ Pass |
| All 11 personas (5 + 6 new) documented in BRD §7 and URD §5 | ✅ Pass |
| All 8 new epics (11–18) documented in BRD and mirrored in URD | ✅ Pass |
| All 22 legal/trust pages enumerated in BRD §22.5 | ✅ Pass |
| All 18 reserved pages catalogued in BRD §35A appendix | ✅ Pass |
| All 28 country/regional pages cited in RFP §8.12 and URD UR-9 | ✅ Pass |
| All 9 active locales reconciled in URD UR-9.1 | ✅ Pass |
| New use cases UC-33–UC-50 added to URD §18 | ✅ Pass |
| Updated traceability matrix in URD §35.1 | ✅ Pass |
| Updated budget reflects expanded scope in RFP §15 | ✅ Pass |
| Document version-alignment table updated to 3.0 in URD §36.3 | ✅ Pass |
| All v3.0 docs cite the Forensic Alignment Audit v2.0 | ✅ Pass |

### 8.8 Outstanding Items (Carryover from v2.0 + new for v3.0)

| Item | Owner | Notes |
|------|-------|-------|
| UAE Superbrand 2022 verification | Marketing Director | Still pending |
| Final warranty terms confirmation per product line | Product Manager | Still pending |
| KPI baseline re-measurement | Marketing | First 30 days post-launch |
| Vendor selection and award | Procurement | Target: 17 July 2026 |
| Localization vendor selection (9 locales) | Marketing + Procurement | Required before Phase 2 launch |
| ATS integration decision (Careers Phase 1) | HR + IT | Decide before Careers epic kickoff |
| Brand Protection team SLA finalization (Anti-Counterfeit Epic 17) | Operations + Legal | Required before Phase 2 |
| OEM/ODM commercial framework | Sales + Legal | Required before Channel Programs Phase 1 launch |

---

**Changelog Version:** 2.0
**Last Updated:** 30 April 2026
**Driving Audit:** Forensic Alignment Audit v2.0
**Cycle Output:** RFP v3.0, BRD v3.0, URD v3.0

---

## 9. v3.0 → v3.1 Alignment Cycle (NEW — 2 May 2026)

**Date:** 2 May 2026
**Driving Audit:** [`TwinMOS_Documents_Forensic_Alignment_Audit_v3.md`](TwinMOS_Documents_Forensic_Alignment_Audit_v3.md) (208+ findings, ~285 with Tech Stack/Strategy/Inventory)
**Trigger:** Introduction of two new authoritative artifacts on 1–2 May 2026 — **TwinMOS_Website_Technology_Stack.md v1.1** (Strapi v5 + Astro 5 + PostgreSQL 16 + MeiliSearch + own cloud server) and **TwinMOS_Website_Implementation_Roadmap_15_Phase.md v2.0** (solo full-stack developer × 18–24 months × 15 phases) — both of which lock the project into a new operational and technical reality that the v3.0 documents had not absorbed.

### 9.1 Documents Affected

| Document | v3.0 → v3.1 patch applied 2 May 2026 |
|----------|--------------------------------------|
| TwinMOS Website Implementation Roadmap (15-Phase) | 2.0 → **2.1 (Forensic-Audit Patch)** |
| TwinMOS Website BRD | 3.0 → **3.0 (v3.1 patches applied: BR-22.3 dangling fix, RMA states aligned with Roadmap, brand_line enum expanded to 11 explicit values, sync header updated)** |
| TwinMOS Website URD | 3.0 → **3.1 (Forensic-Audit Patch: footer/Document Suite Index v3.0 metadata corrected, ASCII diagram v3.0 reference, Synchronized-With list updated)** |
| TwinMOS Website RFP | 3.0 → **3.0 (v3.1 review pending: 63 findings flagged; v4.0 SOW supersession contemplated)** |
| TwinMOS Website Technology Stack | 1.1 → **1.1 (v1.2 review pending: 50 findings flagged; sponsor decisions required on hosting origin and team model)** |
| TwinMOS Website Implementation Strategy | 3.0 → **3.0 (v4.0 re-issue pending solo-dev re-scoping; 23 findings flagged)** |
| TwinMOS Website Project Documentation Inventory | 2.0 → **2.0 (v3.0 re-issue pending: Roadmap missing from §A; Risk Register / Milestone Schedule / QA Strategy classifications need review)** |
| **TwinMOS Documents Forensic Alignment Audit** | **(NEW) v3.0** — comprehensive 208+ finding audit driving v3.1 cycle |
| TwinMOS Documents Alignment Changelog | 2.0 → **2.1 (this update)** |
| TwinMOS Company Profile | 2.0 (unchanged — verified accurate) |
| TwinMOS Website Content Map | 1.0 → **(v1.1 issue pending: stale tech mentions Next.js/Algolia/Contentful/Mailchimp; persona list 5 vs 11; sync header v2.0 vs v3.0)** |

### 9.2 Key Discrepancies Resolved (v3.1 patches applied)

| ID | Document | Issue | Resolution |
|----|----------|-------|-----------|
| F-RM-001 | Roadmap | Phase 14 weeks 57–72 overlap Phase 13 (Weeks 49–64); Phase 15 weeks 65+ overlap Phase 14 | Renumbered to Phase 14 = Weeks 65–79; Phase 15 = Weeks 80+ |
| F-RM-002 | Roadmap | Phase Map "8 weeks" duration column inconsistent with 16-week phase content | Phase 13 = 16 weeks; Phase 14 = 15 weeks; Phase 15 = open-ended |
| F-RM-005 | Roadmap | Line 624 missing leading dash (T-9.6.01) breaking checklist rendering | Added `- ` prefix |
| F-RM-006 | Roadmap | Total Timeline lower bound 72 weeks unachievable for sequential 15-phase + Phase 15 open | Updated to 80–95+ weeks for Phases 1–14; Phase 15 open-ended |
| F-BRD-038 | BRD | §16.2 acceptance criterion cited non-existent BR-22.3 | Replaced with BR-16.4 |
| F-BRD-006 | BRD | RMA workflow state names diverge from Roadmap (§13.3 US-6.4) | Adopted Roadmap M11.1.01 customer-friendly states: Submitted → Under Review → Approved → In Repair → Shipped → Delivered → Closed |
| F-BRD-039 | BRD | brand_line enum has 6 values + "etc." (database constraint impossible) | Expanded to 11 explicit values per Roadmap M2.1.01 / M4.3 |
| F-BRD-050 | BRD | Synchronized-With list missing Roadmap and other v3.1 docs | Added Roadmap v2.1, Tech Stack v1.1, Strategy v3.0, Audit v3.0 |
| F-URD-001 | URD | Footer Document Version still says v2.0 (header §0.1 said v3.0); Document Suite Index regressed to v2.0 | Updated to v3.1; full Document Suite Index refreshed with Roadmap, Tech Stack, Strategy, Audit v3.0; Document Precedence updated to 8-tier v3.1 hierarchy |
| F-URD-003 | URD | §2.1 ASCII diagram still showed "URD v2.0 ←── Synchronized With ──► BRD v2.0 & RFP v2.0" | Updated to v3.1 / v3.0 / v3.0 |

### 9.3 Discrepancies Flagged (Pending Sponsor Decision Before v3.1 Closure)

The following findings require executive decisions before v3.1 patches can be applied:

| ID | Document | Issue | Decision Required |
|----|----------|-------|-------------------|
| F-XDOC-002 | RFP, BRD, URD, Strategy, Tech Stack | Vendor procurement model vs solo-developer model | **Sponsor:** Confirm solo-developer model (recommended) — RFP §16 deletion, §15 cost-model rewrite, BRD R-01 reframe, Strategy v4.0 re-issue |
| F-TECH-001 | Tech Stack, Roadmap | Cloudflare Pages + Hetzner Coolify vs TwinMOS own cloud server | **Sponsor:** Confirm TwinMOS-owned cloud server (per Roadmap T-1.2.02) — Cloudflare retained as DNS+WAF only or fully removed |
| F-IS-005 | Strategy, Roadmap | Two-repo (T-1.1.02) vs single-repo (Strategy Option 1B for solo-dev) | **Tech Lead:** Confirm two-repo (Roadmap committed) or revise to single-repo Payload + Next.js (Strategy Option 1B at solo-dev size) |
| F-XDOC-003 | BRD, URD, RFP, Roadmap | Phase 1 launch month: 5 (BRD/URD) vs 8 (Roadmap) | **PM:** Confirm Roadmap's Month 8 (Feb 2027) launch is the binding date — flow to BRD §6.1 and URD §1.2 |
| F-URD-011 | URD, Roadmap | 9 active locales (URD UR-9.1) vs 7 active by Phase 14 (Roadmap commits ES/PT/DE only at "preparation" level in Phase 15) | **Marketing/Sponsor:** Confirm whether Phase 15 commits ES/PT/DE *launch* (URD position) or only *preparation* (Roadmap position) |
| F-URD-044 | URD, Roadmap | URD has zero UR-Epic for E-Commerce (Phase 13) | **Tech Lead/Marketing:** Approve UR-Epic 19 (E-Commerce) addition with UR-19.1–19.9 covering cart/checkout/payment/accounts/order management |
| F-RM-010 | All | WCAG 2.1 AA target (current docs) vs WCAG 2.2 AA (W3C standard since Oct 2023; ISO/IEC 40500:2025) | **Compliance/QA:** Approve upgrade to WCAG 2.2 AA (9 new success criteria; backward-compatible with 2.1) |
| F-RM-012 | Roadmap | Node.js 22 LTS reaches EOL April 30, 2027 — before Roadmap project completion | **Tech Lead:** Approve ADR-008 Node.js 24 LTS migration plan in Phase 13 or Phase 14 |

### 9.4 New Source-of-Truth Hierarchy (v3.1)

When resolving any ambiguity, the order of precedence becomes:

1. **Company Profile** — facts about TwinMOS
2. **Content Map** — content scope and IA
3. **`_master-sku-reference.md`** — SKU registry
4. **Implementation Roadmap (15-Phase) v2.1** — execution schedule, milestone definitions, task IDs (NEW IN v3.1)
5. **Technology Stack v1.1** — technical-decision lockdowns (NEW IN v3.1)
6. **BRD** — business rules and project scope
7. **URD** — user-facing interaction details
8. **RFP** — procurement and contractual scope (de-emphasized in solo-dev model)

### 9.5 Verification — Status of v3.1 Patch Cycle

| Document | v3.1 Patch Status |
|----------|-------------------|
| Roadmap v2.1 | ✅ Applied (week numbering, dash, sync header, total timeline) |
| BRD v3.1 patches | ✅ Applied (BR-22.3 → BR-16.4, RMA states, brand_line enum, sync header) |
| URD v3.1 | ✅ Applied (footer v3.0, sync header, ASCII diagram, Document Suite Index) |
| Tech Stack v1.1 sync header | ✅ Applied (Roadmap v2.1 added; v1.2 review note added) |
| RFP v3.0 sync header + supersession notice | ✅ Applied (v4.0 review note added) |
| Forensic Alignment Audit v3.0 | ✅ Created |
| Alignment Changelog | ✅ Updated (this entry) |
| Strategy v4.0 re-issue | ⚠️ Pending sponsor decision on solo-dev model |
| Inventory v3.0 re-issue | ⚠️ Pending sponsor decision + Risk Register / Milestone Schedule / QA Strategy classification |
| Content Map v1.1 issue | ⚠️ Pending tech-stack lockdown propagation |
| Risk Register Consolidated v1.0 | ⚠️ Pending Strategy R-01..18 → R-01..R-18 merger with Roadmap |
| Milestone Schedule v1.0 standalone | ⚠️ Pending decision (currently embedded in Roadmap §§1–15) |
| QA Strategy v1.0 standalone | ⚠️ Pending decision (currently embedded in Roadmap Phase 7 + Tech Stack §21) |

### 9.6 Outstanding Items (Cumulative)

| Item | Owner | Notes |
|------|-------|-------|
| Solo-dev vs vendor procurement decision | Project Sponsor | Most-blocking decision; F-XDOC-002 |
| Hosting origin: Cloudflare vs own cloud server | Project Sponsor + IT Lead | F-TECH-001 |
| Two-repo vs single-repo for solo dev | Tech Lead | F-IS-005 |
| Phase 1 launch date binding (Month 5 vs Month 8) | PM + Marketing | F-XDOC-003 |
| ES/PT/DE Phase 4 commitment level | Marketing + Sponsor | F-URD-011 |
| WCAG 2.2 AA upgrade | Compliance + QA | F-RM-010 |
| Node.js 24 LTS migration plan | Tech Lead | F-RM-012 |
| UAE Superbrand 2022 verification | Marketing Director | Carried from v2.0 |
| Final warranty terms confirmation per product line | Product Manager | Carried from v2.0 |
| KPI baseline re-measurement | Marketing | Carried from v2.0 |
| Localization vendor selection (9 locales) | Marketing + Procurement | Carried from v3.0 |
| ATS integration decision (Careers Phase 1) | HR + IT | Carried from v3.0 |
| Brand Protection team SLA finalization | Operations + Legal | Carried from v3.0 |
| OEM/ODM commercial framework | Sales + Legal | Carried from v3.0 |

---

**Changelog Version:** 2.1
**Last Updated:** 2 May 2026
**Driving Audit:** Forensic Alignment Audit v3.0
**Cycle Output (v3.1):** Roadmap v2.1, BRD v3.0 (v3.1 patches applied), URD v3.1, Tech Stack v1.1 (sync update), RFP v3.0 (v4.0 review pending)

---

## 10. v3.1 → v3.2 Alignment Cycle Executed (2 May 2026 — Sponsor Decisions Applied)

**Date:** 2 May 2026 (same day as v3.1, sponsor decisions captured immediately after audit publication)
**Driving Audit:** [`TwinMOS_Documents_Forensic_Alignment_Audit_v3.md`](TwinMOS_Documents_Forensic_Alignment_Audit_v3.md) §11 Recommendations Priority Matrix

### 10.1 Decisions Captured

| # | Decision | Choice | Cascading Patches Applied |
|---|----------|--------|---------------------------|
| 1 | Team model | **A — Solo full-stack developer × 18–24 months × 15-phase Roadmap** | RFP v3.0 §1/§14/§15/§16 superseded by SOW v4.0; Strategy v3.0 → v4.0 (solo-dev edition); BRD §29 R-01/R-02 reframed; BRD §30.1 A-05 + §30.2 C-01 updated; Inventory v3.0 audience and team-size language updated |
| 2 | Hosting origin | **B — TwinMOS own cloud server origin + Cloudflare DNS/WAF/CDN edge front** | Roadmap T-1.1.01 ADR-001 updated; Roadmap T-1.2.04 added Cloudflare DNS/WAF provisioning; BRD §27.1 service table rewritten (TwinMOS VM origin + Cloudflare edge + full Tech Stack v1.2 lockdown); Tech Stack §1.1/§3.1/§19/§26 hosting model updated; SOW §4 hosting & infrastructure section authored |
| 3 | Repo topology | **A — Two-repo (twinmos-website-frontend + twinmos-website-backend)** | Roadmap T-1.1.02 retained; SOW §3.2 confirms two-repo; Strategy v4.0 retains Option 1A (Strapi+Astro) |
| 4 | Phase 1 launch date | **A — Feb–Mar 2027 (Roadmap Phase 8 Weeks 29–32)** | BRD §6.1 Phase 1 timeline updated to Months 1–8; BRD §30.2 C-01 changed from "5 months" to "8 months Phase 1"; URD §1.2 phasing block rewritten with Roadmap-synced 4-phase + Roadmap-phase mapping; SOW §2.1 confirms Feb–Mar 2027 launch |
| 5 | ES/PT/DE locales | **A — Phase 15 commits ES/PT/DE full launch in-scope (10 active locales total)** | Roadmap M15.5 expanded from "Translation Preparation" (4 tasks) to "Translation, Native QA & Launch" (11 tasks T-15.5.01 through T-15.5.11); Roadmap Phase 15 header objective updated; Phase Map row 15 updated; URD §1.2 Phase 3+/Phase 15 entry updated; Content Map v1.1 frontmatter `locale` enum expanded to all 10 |
| 6 | WCAG version | **A — Upgrade to WCAG 2.2 AA across all docs** | Roadmap, BRD, URD, RFP, Tech Stack: all "WCAG 2.1 AA" → "WCAG 2.2 AA" (replace_all); BRD §29 R-10 explicitly cites WCAG 2.2 AA |
| 7 | Node.js LTS migration | **A — ADR-008 Node.js 24 LTS migration in Phase 13** | Roadmap T-1.1.08 added (sign ADR-008); Roadmap T-13.1.05 added (execute migration); Tech Stack ADR registry updated (ADR-005 HubSpot, ADR-006 Cookie Consent Manager, ADR-008 Node migration — closing prior gap of unassigned ADR-005/006); SOW §3.1 mentions Node 22 → 24 LTS migration |
| 8 | Standalone Risk Register / Milestone Schedule / QA Strategy | **(not specified — held for future cycle)** | Inventory §A.2 documents current embedded status and decision pending; full v3.2 cycle output retained for follow-up |

### 10.2 Documents Updated in v3.2 Cycle

| Document | Pre-v3.2 | Post-v3.2 | Patches Applied |
|----------|----------|-----------|-----------------|
| Implementation Roadmap (15-Phase) | v2.1 | **v2.2** | ADR-008 + 5 new ADRs (ADR-004/005/006/007/008); WCAG 2.1→2.2 AA; M1.2.04 Cloudflare front provisioning; M13.1.05 Node 24 migration; M15.5 ES/PT/DE full launch (4→11 tasks); Phase 15 header + Phase Map row updated; T-2.3.02 markdown count 351→454 |
| BRD | v3.0 (v3.1 patches) | **v3.0 (v3.2 patches applied)** | §6.1 Phase 1 budget table rewritten for solo-dev cost model + Roadmap phase cross-walk; §29 Risk Register R-01..R-10 reframed for solo-dev model; §30.1 A-05 budget assumption updated; §30.2 C-01 timeline 5 mo → 8 mo; §27.1 service table rewritten with full Tech Stack v1.2 lockdown (Cloudflare front + own VM origin + Strapi/Astro/MeiliSearch/Resend/Better Auth/Plausible/Sentry/UptimeRobot/GA4/GTM/GSC/Backblaze B2/hCaptcha/Turnstile); §27.2 Phase-2+ services updated (Chatwoot/HubSpot/PostHog/Stripe/Medusa/Leaflet); WCAG 2.1→2.2 AA replace_all |
| URD | v3.1 | **v3.1 (v3.2 patches applied)** | §1.2 phasing block rewritten with Roadmap-synced 4-phase + Roadmap-phase mapping; ES/PT/DE Phase 15 launch noted; WCAG 2.1→2.2 AA replace_all |
| Tech Stack | v1.1 (sync update only) | **v1.2** | Header version + change log entry for v1.2 (sponsor decisions 1A/2B/3A/4A/5A/6A/7A applied); WCAG 2.1→2.2 AA replace_all; v1.2 issued patch note replaces v1.2-pending placeholder |
| RFP | v3.0 (v3.1 supersession notice) | **v3.0 (superseded by SOW v4.0)** | Notice already in place from v3.1; superseded for procurement purposes |
| SOW (NEW) | n/a | **v4.0** | New document — full solo-developer engagement specification superseding RFP §1/§14/§15/§16; documents the 4 RFP arithmetic patches + KSA PDPL inclusion + 11-persona consolidation + 15-form-types reference |
| Implementation Strategy | v3.0 | **v4.0** | Header version + change log v4.0 entry; "Why v4.0 supersedes v3.0" section rewritten with sponsor decisions cited; capacity math 2-dev/120-pw → solo-dev/80–95 pw; Phase 15 ES/PT/DE launch in-scope; Tech Stack v1.2 sync; Roadmap v2.2 sync |
| Project Documentation Inventory | v2.0 | **v3.0** | Header version + audience updated to "Solo Full-Stack Developer"; §A document table extended with Roadmap (was missing — F-INV-001 critical); §A.0 Document Version Matrix added; §A.1 Source-of-Truth Hierarchy added; §A.2 Standalone Documents Pending Decision 8 added |
| Content Map | v1.0 | **v1.1** | Header version + sync clause v3.x updated; v1.1 patch note documents F-CM-001..007 fixes; persona list 5 → 11; CMS reference Strapi v5; site-wide search MeiliSearch; frontmatter `template` Astro 5; frontmatter `locale` 10-locale enum |
| Forensic Alignment Audit | v2.0 | **v3.0** (created in v3.1 cycle) | Drives v3.1 + v3.2 patch cycles |
| Alignment Changelog | v2.0 | **v2.1** (this update) | §9 v3.1 cycle + §10 v3.2 cycle (this section) |

### 10.3 Verification — v3.2 Cycle Closure

| Check | Status |
|-------|--------|
| Roadmap Phase 14/15 week numbering corrected (65–79, 80+) | ✅ Pass |
| Roadmap line 624 missing dash fixed | ✅ Pass (v3.1) |
| Roadmap T-2.3.02 markdown count reconciled (351 → 454) | ✅ Pass |
| WCAG 2.1 AA → WCAG 2.2 AA across Roadmap, BRD, URD, Tech Stack, RFP | ✅ Pass |
| Solo-developer model represented in BRD §29 R-01/R-02, §30.1 A-05, §30.2 C-01 | ✅ Pass |
| Tech Stack v1.2 lockdown propagated to BRD §27.1, URD vendor-named sections | ✅ Pass (BRD); ⚠️ URD vendor-name replacement still requires individual Algolia/Mailchimp/Mapbox grep+replace |
| Phase 1 launch date reflects Feb–Mar 2027 in BRD/URD | ✅ Pass |
| ES/PT/DE Phase 15 full launch reflected in Roadmap M15.5 + Phase 15 header + Phase Map | ✅ Pass |
| Cloudflare DNS/WAF/CDN front + own cloud server origin documented in Roadmap M1.2 + Tech Stack + BRD §27.1 + SOW §4 | ✅ Pass |
| Node.js 24 LTS migration in Phase 13 documented (ADR-008) | ✅ Pass |
| ADR-005 (HubSpot) + ADR-006 (Cookie Consent Manager) added | ✅ Pass |
| Two-repo confirmed (Roadmap T-1.1.02 + SOW §3.2 + Strategy v4.0) | ✅ Pass |
| RFP v3.0 superseded by SOW v4.0 | ✅ Pass |
| Strategy v3.0 superseded by v4.0 | ✅ Pass |
| Inventory v3.0 has Roadmap, Document Version Matrix, Source-of-Truth Hierarchy, Standalone Doc decisions | ✅ Pass |
| Content Map v1.1 has Astro/MeiliSearch/Strapi/11 personas/10 locales | ✅ Pass |
| BRD §13.3 US-6.4 RMA states match Roadmap M11.1.01 | ✅ Pass (v3.1) |
| BRD `brand_line` enum expanded to 11 explicit values | ✅ Pass (v3.1) |
| BRD line 1512 BR-22.3 → BR-16.4 fix | ✅ Pass (v3.1) |

### 10.4 Outstanding for v3.3 (or beyond)

The following items remain open for future cycles. They are non-blocking for the 24 July 2026 project kickoff:

| # | Item | Driver | Owner |
|---|------|--------|-------|
| 1 | Decision 8 — Standalone Risk Register / Milestone Schedule / QA Strategy | F-INV-002/003/004 | Project Sponsor + Tech Lead |
| 2 | URD §17.X heading collision (UR-Epic 10 sub-sections vs UR-Epic 11) | F-URD-048/049/051 | URD Owner |
| 3 | URD UR-Epic 19 (E-Commerce) addition with UR-19.1–19.9 | F-URD-044 | URD + Tech Lead |
| 4 | URD §22.8–§22.16 site-wide component specs (Cookie/Trust/Lang/News/Search/Skip/Maint/Glossary/CTA) | F-URD-030/031/032 | URD Owner |
| 5 | URD §30.6 Master Form Catalog (15 forms) | F-URD-034 | URD Owner |
| 6 | URD UC-33–UC-50 template parity with UC-1–UC-32 | F-URD-018 | URD Owner |
| 7 | URD §35.2 / §35.3 traceability extended to UR-Epics 11–18 + UC-33–UC-50 | F-URD-053/054 | URD Owner |
| 8 | URD §5.5 Aisha persona ordering bug | F-URD-006 | URD Owner |
| 9 | URD vendor-name replacements (Algolia → MeiliSearch, Mailchimp → Resend, Mapbox → Leaflet, etc.) | F-URD-039 | URD Owner |
| 10 | BRD section number collision §11–§18 (Epic 4–10 + Epic 11–18 + Business Rules) | F-BRD-013 | BRD Owner |
| 11 | BRD §7.5 Aisha persona ordering bug | F-BRD-015 | BRD Owner |
| 12 | BRD pipe-character formatting bugs in §9.5 / §10.5 / §11.5 | F-BRD-040/041/042 | BRD Owner |
| 13 | BRD §22.3 add WEEE + EPEAT (currently lists 9 of 11 certifications) | F-BRD-032 | BRD Owner |
| 14 | BRD §20.1 remove FID metric (deprecated by INP) | F-BRD-046 | BRD Owner |
| 15 | RFP §5 backfill 6 missing personas | F-RFP-021 | RFP Owner (note: SOW v4.0 is now canonical for procurement) |
| 16 | RFP §2 brand-table consolidation (18 rows → 11 master brand-lines) | F-RFP-024 | RFP Owner |
| 17 | RFP §3.1 / Appendix C arithmetic (51 → 64 critical issues) | F-RFP-048 | RFP Owner |
| 18 | UAE Superbrand 2022 verification | Carried from v2.0 | Marketing Director |
| 20 | Final warranty terms confirmation per product line | Carried from v2.0 | Product Manager |
| 21 | Localization vendor selection (10 locales now per Decision 5A) | Carried from v3.0 | Marketing + Procurement |
| 22 | KPI baseline re-measurement (first 30 days post-launch) | Carried from v2.0 | Marketing |

---

**Changelog Version:** 2.2
**Last Updated:** 2 May 2026 (v3.2 cycle executed)
**Driving Audit:** Forensic Alignment Audit v3.0
**Cycle Output (v3.2 — EXECUTED):** Roadmap v2.2, BRD v3.0 (v3.2 patches), URD v3.1 (v3.2 patches), Tech Stack v1.2, SOW v4.0 (NEW), Strategy v4.0, Inventory v3.0, Content Map v1.1, Alignment Changelog v2.2
**Cycle Output (v3.3 pending — Decision 8 + URD §17.X + remaining outstanding items):** Risk Register Consolidated v1.0, Milestone Schedule v1.0 standalone, QA Strategy v1.0 standalone, URD v3.2 (full content patch with UR-Epic 19, §17.X collision fix, §30.6 form catalog, §22.8–22.16 site-wide components, UC-33–50 template parity), BRD v3.3 (section collision fix, persona reorder, formatting bugs, WEEE/EPEAT addition)
