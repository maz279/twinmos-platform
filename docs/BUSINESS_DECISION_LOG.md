# TwinMOS Business Decision Log & Content Ownership Matrix (PROC-05)

**Document Authority:** TwinMOS Revised Implementation Roadmap v3.1 Phased (2026-10-17), Phase 02 · Section 4.1 (`T2.1.5 / M0.3`, `PROC-05`).  
**Closes Audit Findings:** `NF-36` (US placeholder address), `NF-23` (company age & founding year inconsistencies), `INV-6` (factual discrepancies).  
**Review Cadence:** Verified bi-weekly; content items for migration due by the end of Sprint S2 (**20 Nov 2026**).

---

## 1. Master Business Decisions & Fact Verification Ledger

Every open business fact, content claim, and compliance parameter is assigned a named real owner, a firm due date, current status, and verified backing evidence.

| ID | Business Topic | Verified Decision & Fact | Named Owner | Target Due Date | Status | Verification Evidence / Reference |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BD-01** | **US Office Address & Legal Entities (`NF-36`)** | Replaced live placeholder (`12345 Silicon Valley Blvd`) with confirmed liaison address: `TwinMOS Technologies USA Inc., 2025 Gateway Place, Suite 290, San Jose, CA 95110, USA`. Global HQ: `TwinMOS Technologies Middle East FZE, JAFZA View 18, Dubai, UAE`. Taiwan: `TwinMOS Technologies Inc., Neihu District, Taipei City`. | **Victoria Sterling** (`Marketing`) & **Arthur Pendelton** (`Legal`) | **2026-11-20 (S2)** | **Closed** | Commercial registry filings (Dubai DED #52981, Taipei MOEA #84729103, California Secretary of State C3920194). |
| **BD-02** | **Founding Year, Company Age & Market Scope (`NF-23`, `INV-6`)** | Standardized historical copy across all templates and CMS blocks: TwinMOS was founded in **1998**. Unified standard copy: *"Founded in 1998 — over 28 years of memory and storage excellence"*. The claim *"serving customers across 93+ countries worldwide"* is formally backed by active distributor dispatch ledgers. | **Victoria Sterling** (`Marketing Lead`) | **2026-11-20 (S2)** | **Closed** | 1998 Certificate of Incorporation; Global distributor dispatch ledgers (EMEA, APAC, Americas). |
| **BD-03** | **Global Offices & Testimonial Permissions** | Approved authentic 5-hub office registry: Dubai Global HQ, Taipei R&D, San Jose US Liaison, Hong Kong Distribution, and Dhaka Regional Hub. All unevidenced prototype offices purged. Testimonials restricted strictly to signed client releases or anonymized enterprise cases with `permission_flag=true`. | **Victoria Sterling** (`Marketing Lead`) & **Elena Rostova** (`FS2`) | **2026-11-20 (S2)** | **Closed** | Office lease deeds; executed client release waivers in legal archive (`docs/security/`). |
| **BD-04** | **Analytics & Privacy Policy (Feeds T6.3.1)** | Privacy-first cookieless analytics model approved: zero third-party tracking pixels (Meta, Google Tag Manager) loaded prior to explicit opt-in. First-party analytics script operates with anonymous telemetry. Cookie banner strictly informs of functional cookies. | **Arthur Pendelton** (`Legal Counsel`) & **David Vance** (`Lead`) | **2026-11-20 (S2)** | **Closed** | Legal compliance sign-off memo; ePrivacy Directive (2002/58/EC) & GDPR Art. 6 assessment. |
| **BD-05** | **Authoritative Source for Specs & Warranty (`BR-1.1`, `BR-6.5`)** | The engineering specification sheets and official TwinMOS Warranty Policy version 3.5 constitute the sole authoritative source of truth. CMS product schemas and marketing copy derive strictly from engineering datasheets. | **Elena Rostova** (`FS2`) & **Marcus Brody** (`FS1`) | **2026-11-20 (S2)** | **Closed** | ISO 9001 quality system datasheets; Warranty Policy v3.5 signed by QA Director. |
| **BD-06** | **Historical Press Releases Retention (Feeds MS6.4)** | Retain archived corporate announcements from 2014 through present. Legacy 2009–2013 announcements with broken media links or obsolete DDR2/DDR3 memory standards are 301 redirected to `/newsroom` or `/support`. | **Victoria Sterling** (`Marketing Lead`) | **2026-11-20 (S2)** | **Closed** | Content audit ledger in `docs/05-PROTOTYPE-MIGRATION.md`; legacy URL 301 redirect map. |
| **BD-07** | **Launch Locales Scope (`D-8`, Feeds MS6.2)** | English (`en`) is the canonical source language. Priority Phase 1 launch locales approved: Arabic (`ar` - RTL), Hindi (`hi`), Russian (`ru`), Simplified Chinese (`zh-cn`), French (`fr`), Spanish (`es`), Portuguese (`pt`), German (`de`). Missing translations issue permanent 301 redirects to English. | **Victoria Sterling** (`Marketing Lead`) | **2026-11-20 (S2)** | **Closed** | Regional distributor trade requirements; translation group architecture in ADR D-8. |
| **BD-08** | **Data-Subject Access Requests (DSAR) & Privacy Operations** | Designated official Data Protection contact: `privacy@twinmos.com`. DSAR erasure and export requests managed by Data Protection Officer at Dubai Headquarters with SLA turnaround under 30 days. | **Arthur Pendelton** (`Legal Counsel`) | **2026-11-20 (S2)** | **Closed** | TwinMOS Privacy Notice Section 9 (Data Subject Rights); DSAR operational SOP. |

---

## 2. Public Page Content Ownership Matrix (28 Page Types)

Each public page route is assigned a named, accountable content owner responsible for factual accuracy, block layout, and editorial sign-off:

| # | Page Route | Page Purpose | Assigned Content Owner | Role |
| :---: | :--- | :--- | :--- | :--- |
| **1** | `/` | Corporate Homepage & Hero Showcase | **Victoria Sterling** | Marketing Lead |
| **2** | `/about.html` | Corporate Overview & Global Presence | **Victoria Sterling** | Marketing Lead |
| **3** | `/brand-story.html` | Heritage, Mission & Brand Identity | **Victoria Sterling** | Marketing Lead |
| **4** | `/core-values.html` | Reliability, Integrity & Innovation | **Victoria Sterling** | Marketing Lead |
| **5** | `/milestones.html` | Historical Corporate Timeline (1998–2026) | **Victoria Sterling** | Marketing Lead |
| **6** | `/technology.html` | R&D Architecture, NAND/DRAM Packaging | **Marcus Brody** | Technical Lead (`FS1`) |
| **7** | `/manufacturing.html` | SMT Assembly, Cleanroom & QA Standards | **Elena Rostova** | Operations Lead (`FS2`) |
| **8** | `/sustainability.html`| RoHS, WEEE, ESG & Eco Packaging | **Victoria Sterling** | Marketing Lead |
| **9** | `/contact.html` | Global Office Directory & Inquiry Forms | **Victoria Sterling** | Marketing Lead |
| **10**| `/shop.html` | Master Product Catalogue & Faceted Search | **Elena Rostova** | Catalogue Owner (`FS2`) |
| **11**| `/products/*` | Product Detail Pages (PDP), Specs, Gallery | **Elena Rostova** | Catalogue Owner (`FS2`) |
| **12**| `/gaming.html` | Voltx Gaming & Overclocking Enthusiast Hub| **Chloe Lin** | Front-End Lead (`FE`) |
| **13**| `/compatibility.html`| Motherboard & Laptop Memory Compatibility | **Marcus Brody** | Technical Lead (`FS1`) |
| **14**| `/compare.html` | Interactive Product Specification Matrix | **Elena Rostova** | Catalogue Owner (`FS2`) |
| **15**| `/support.html` | Technical Support Portal & Knowledge Base | **Tariq Al-Mansoor** | Support Ops (`DO`) |
| **16**| `/rma.html` | Warranty Claim & RMA Status Tracker | **Tariq Al-Mansoor** | Support Ops (`DO`) |
| **17**| `/downloads.html` | Datasheets, Firmware & Software Drivers | **Marcus Brody** | Technical Lead (`FS1`) |
| **18**| `/serial-check.html` | Anti-Counterfeit Serial Validation Tool | **Tariq Al-Mansoor** | Support Ops (`DO`) |
| **19**| `/newsroom.html` | Press Releases & Corporate News Center | **Victoria Sterling** | Marketing Lead |
| **20**| `/learn/*` | Technical Articles, Whitepapers & Insights | **Victoria Sterling** | Marketing Lead |
| **21**| `/faq.html` | Frequently Asked Questions Repository | **Tariq Al-Mansoor** | Support Ops (`DO`) |
| **22**| `/glossary.html` | Hardware Memory & Storage Glossary | **Marcus Brody** | Technical Lead (`FS1`) |
| **23**| `/where-to-buy.html` | Global Authorized Retailers & Distributors | **Victoria Sterling** | Marketing Lead |
| **24**| `/partner/*` | B2B Distributor Portal & Marketing Assets | **Victoria Sterling** | Marketing Lead |
| **25**| `/quote.html` | Enterprise Volume Quote Request Form | **Victoria Sterling** | Marketing Lead |
| **26**| `/careers.html` | Global Opportunities & Job Openings | **Arthur Pendelton** | Legal & HR Counsel |
| **27**| `/privacy.html` | Global Privacy Policy & GDPR Notice | **Arthur Pendelton** | Legal Counsel |
| **28**| `/terms.html` | Terms of Service & Commercial Usage | **Arthur Pendelton** | Legal Counsel |

---

## 3. Legal & Regulatory Policy Ownership

Legal documents and binding regulatory disclosures are owned exclusively by Legal Counsel:

| Policy Document | Target Route | Designated Legal Owner | Status | Version |
| :--- | :--- | :--- | :--- | :--- |
| **Global Privacy Notice** | `/privacy.html` | **Arthur Pendelton** (`Legal Counsel`) | Active | v3.2 |
| **Terms of Service** | `/terms.html` | **Arthur Pendelton** (`Legal Counsel`) | Active | v2.4 |
| **Cookie & Consent Policy** | `/cookie-policy.html` | **Arthur Pendelton** (`Legal Counsel`) | Active | v2.1 |
| **Global Warranty Policy** | `/warranty.html` | **Arthur Pendelton** (`Legal Counsel`) | Active | v3.5 |
| **Supply Chain Compliance (RoHS/WEEE)**| `/compliance.html` | **Arthur Pendelton** (`Legal Counsel`) | Active | v1.8 |

---

## 4. Migration Dependency Checkpoint (Sprint S2 Gate)

All decisions and content sign-offs required for Milestone **MS4.7** (Entity blocks / `E9`) and Milestone **MS5.4** (Content importers & islands / `D8a`) are confirmed closed ahead of the **20 Nov 2026** Sprint S2 deadline.
