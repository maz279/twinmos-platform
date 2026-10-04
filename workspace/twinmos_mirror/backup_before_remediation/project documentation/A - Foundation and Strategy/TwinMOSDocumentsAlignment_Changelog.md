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
| F-2 | ISO standard | RFP: "ISO 9001:2000 (TUV SUD)" — outdated | **All docs: "ISO 9001:2015 (manufacturing partners)"** |
| F-3 | Manufacturing footprint | RFP: "Hsinchu, Taiwan; Dongguan and Xinjiang, China"; Profile: "Taiwan" | **All docs: "Taiwan-based manufacturing with regional partner facilities"** (politically neutral, factually safe) |
| F-4 | Warranty rules | BRD: hard-coded Lifetime/5y/3y; Profile: "3 years standard" | **BRD BR-6.1 reframed:** CMS-driven per-product configuration with reference standard (Limited Lifetime DRAM, 5y NVMe, 3y SATA), plus BR-6.5 enforcing CMS-driven display |
| F-5 | UAE Superbrand 2022 | BRD/URD displayed unconditionally; Profile/Audit: not mentioned | **All docs:** Conditional display per BR-5.5 (must have certificate evidence in CMS) |
| F-6 | Certifications list | RFP/BRD/URD: inconsistent subsets | **All docs (single source):** ISO 9001:2015, FCC, CE, UKCA, EAC, RoHS, REACH, JEDEC (DRAM); BIS for India added in Phase 2 |
| F-7 | Distributor partnership status | Mixed "active" vs "proposed" wording | **All docs:** Supertron described as "proposed exclusive partnership; activation pending agreement" |

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
| X-1 | BRD referenced nonexistent `TwinMOS_Supertron_Business_Proposal.md` | BRD §34 marks it as "*Pending — to be authored under separate cover*" |
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
| ISO standard upgraded to 9001:2015 across all three docs | ✅ Pass |
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
| Supertron partnership uniformly described as "proposed/pending" | ✅ Pass |
| `/api/v1/` consistent — no orphan unversioned endpoints in BRD §26 | ✅ Pass |

---

## 6. Outstanding Items (Not Blocking Document Suite)

These items remain outside the document suite and are flagged for executive attention:

| # | Item | Owner | Notes |
|---|------|-------|-------|
| O-1 | TwinMOS–Supertron Business Proposal document | Business Development | Referenced in BRD §34 but pending separate authorship |
| O-2 | UAE Superbrand 2022 verification | Marketing Director | If certificate exists, attach to CMS award entry; if not, omit per BR-5.5 |
| O-3 | Final warranty terms confirmation per product line | Product Manager | Required before Phase 1 launch (BR-6.1) |
| O-4 | KPI baseline re-measurement | Marketing | First 30 days post-launch via GA4 (BRD §28.2) |
| O-5 | Vendor selection and award | Procurement | Target: 17 July 2026 (RFP §16.1) |

---

## 7. Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Project Sponsor (Chairman) | Mohd Mazharul Islam | ____________ | ___________ |
| Operational Sponsor (GM Dubai) | Robiul Islam | ____________ | ___________ |
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
| TwinMOS–Supertron Business Proposal | Business Development | Still pending |
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
