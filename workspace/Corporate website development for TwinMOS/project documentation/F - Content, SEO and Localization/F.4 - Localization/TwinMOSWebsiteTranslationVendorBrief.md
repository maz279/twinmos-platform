# TwinMOS Website — Translation Vendor Brief

**Document Reference:** TWN-F4-VENDOR-2026-001
**Version:** 1.0
**Status:** Approved for Vendor Distribution
**Owner:** Localization Lead / Marketing Director
**Last Updated:** 1 May 2026
**Related Documents:** TWN-F4-L10N-2026-001 (Localization Strategy), TWN-F4-GLOSSARY-2026-001 (Translation Memory & Glossary), TWN-BRD-2026-001 §22

---

## Table of Contents

1. [Company Background](#1-company-background)
2. [Project Overview](#2-project-overview)
3. [Scope of Work](#3-scope-of-work)
4. [Language Pairs and Phases](#4-language-pairs-and-phases)
5. [Content Types and Volumes](#5-content-types-and-volumes)
6. [Do-Not-Translate List](#6-do-not-translate-list)
7. [Technical Terms Handling](#7-technical-terms-handling)
8. [File Formats and Delivery](#8-file-formats-and-delivery)
9. [Glossary and Translation Memory](#9-glossary-and-translation-memory)
10. [Quality Assurance Requirements](#10-quality-assurance-requirements)
11. [Turnaround Times and Batch Sizing](#11-turnaround-times-and-batch-sizing)
12. [Deliverables and Handoff](#12-deliverables-and-handoff)
13. [Vendor Responsibilities](#13-vendor-responsibilities)
14. [TwinMOS Responsibilities](#14-twinmos-responsibilities)
15. [Confidentiality and Legal Requirements](#15-confidentiality-and-legal-requirements)
16. [Vendor Evaluation Criteria](#16-vendor-evaluation-criteria)
17. [Commercial Terms and Contact](#17-commercial-terms-and-contact)

---

## 1. Company Background

**TwinMOS Technologies** is a global hardware manufacturer specialising in computer memory (DRAM), solid-state storage (SSD, NVMe), and portable USB storage devices. Founded in 1998 and headquartered in Taipei (Taiwan), with its international office at Dubai Airport Free Zone (DAFZA), UAE, and offices in Cologne (Germany) and San Jose (USA), TwinMOS distributes to 93+ countries through a global network of authorized distribution partners.

TwinMOS's product sub-brands include:
- **VOLTX** — High-performance DDR5 gaming memory
- **CoreX Pro** — NVMe PCIe Gen 5 solid-state drives
- **TornadoX7, Thunder GX, Xtreme, Alpha Pro** — Memory and storage product lines

The company holds certifications including ISO 9001, CE, FCC, RoHS, REACH, EAC, JEDEC, and BIS.

---

## 2. Project Overview

TwinMOS is launching a new corporate website (`twinmos.com`) built on the Astro 5 framework with Strapi v5 as the content management system. The website covers approximately 287 distinct content pages across 16 sections, covering product catalogue, learn hub (buying guides, explainers), support knowledge base, company information, news, events, careers, and regional pages.

**Project timeline:**
- **Phase 1 (P1):** English (EN) site — launched May 2026
- **Phase 2 (P2):** Arabic (AR), Hindi (HI) — Months 6–9 (June–September 2026)
- **Phase 3 (P3):** Russian (RU), Chinese Simplified (ZH-CN), French (FR) — Months 10–15 (October 2026–March 2027)
- **Phase 4 (P4):** Spanish (ES), Portuguese (PT), German (DE) — Month 16+ (April 2027+; out of current engagement scope)

This brief covers **Phase 2 and Phase 3** requirements. Vendors are invited to quote for all phases; phased contracting is also acceptable.

---

## 3. Scope of Work

The selected translation vendor will be responsible for:

1. **Translation** of source content from English into target languages (see §4)
2. **Post-editing of AI pre-translations** where applicable (see §9.3)
3. **Native-speaker review and quality assurance** of all translated content
4. **Maintenance and growth of TwinMOS-specific Translation Memory (TM)** across all project phases
5. **Glossary compliance** — adherence to the TwinMOS Terminology Glossary (TWN-F4-GLOSSARY-2026-001) and updating it with approved new terms
6. **Delivery of translated XLIFF files** ready for import into Strapi v5 CMS

The vendor is NOT responsible for:
- CMS import/publishing of translated content (handled by TwinMOS technical team)
- Locale QA testing on the live website (handled by TwinMOS QA team)
- Legal review of translated legal pages (legal counsel review is TwinMOS's responsibility)

---

## 4. Language Pairs and Phases

### Phase 2 (Required: June–September 2026)

| # | Source | Target | Script | Direction | Region |
|---|---|---|---|---|---|
| 1 | English (EN) | Arabic (AR) | Arabic | RTL | UAE, KSA, Kuwait, Bahrain, Qatar, Oman, Egypt |
| 3 | English (EN) | Hindi (HI) | Devanagari | LTR | India |

### Phase 3 (Required: October 2026–March 2027)

| # | Source | Target | Script | Direction | Region |
|---|---|---|---|---|---|
| 4 | English (EN) | Russian (RU) | Cyrillic | LTR | Russia, Kazakhstan, Uzbekistan |
| 5 | English (EN) | Chinese Simplified (ZH-CN) | Han (Simplified) | LTR | China (Mainland), Singapore |
| 6 | English (EN) | French (FR) | Latin | LTR | France, Francophone Africa, Belgium |

### Phase 4 (Optional: April 2027+)

| # | Source | Target | Script |
|---|---|---|---|
| 7 | English (EN) | Spanish — Latin American (ES) | Latin |
| 8 | English (EN) | Portuguese — Brazilian (PT) | Latin |
| 9 | English (EN) | German (DE) | Latin |

**Important notes:**
- For Arabic, TwinMOS requires **Modern Standard Arabic (MSA)** for all web content. Gulf dialect should be avoided except in informal social media content (not covered by this brief).
- For Chinese, TwinMOS requires **Simplified Chinese (ZH-CN)** only. Traditional Chinese (ZH-TW) is not in scope.
- For French, the target register should be **standard international French** comprehensible to both European and Francophone African audiences. Avoid Canadianisms.
- For Spanish (P4), use **Latin American Spanish** rather than Castilian.
- For Portuguese (P4), use **Brazilian Portuguese** rather than European Portuguese.

---

## 5. Content Types and Volumes

### 5.1 Content Type Breakdown

| Content Type | Description | Approx. Source Words (EN) | Complexity |
|---|---|---|---|
| Product descriptions | Marketing copy for ~287 product pages | ~86,000 | Medium — brand voice critical |
| Product technical specifications | Spec tables, key features | ~28,000 | Low — formulaic; heavy TM leverage |
| Buying guides and explainers | Learn Hub long-form articles | ~120,000 | High — expertise and brand voice |
| Support KB articles | How-to and troubleshooting articles | ~60,000 | Medium — accuracy critical |
| Homepage and category pages | High-impact marketing copy | ~5,000 | High — top priority |
| Navigation and UI strings | Button labels, menu items, form labels | ~3,000 | Low — short strings; context important |
| Legal pages (Privacy Policy, T&Cs, Warranty) | Legal / compliance documents | ~8,000 | High — legal accuracy; requires counsel review |
| About, Team, Company pages | Corporate narrative | ~6,000 | Medium |
| News and press releases | Newsroom items | ~20,000 | Medium |
| Regional pages | Market-specific landing pages | ~10,000 | High — culturally adapted |
| **Total source words (per locale)** | | **~346,000** | |

### 5.2 Phase-by-Phase Volume Estimate

For Phase 2, not all content will be translated simultaneously. Translation will begin with P0 priority content:

| Priority Tier | Content | Approx. Words |
|---|---|---|
| **P0** (must be live at phase launch) | Homepage, product pages, legal pages, where-to-buy, contact | ~100,000 |
| **P1** (within 8 weeks of phase launch) | Top 20 buying guides, top 10 KB articles, solutions pages, about | ~80,000 |
| **P2** (within 16 weeks) | Remaining Learn Hub, remaining KB, news, regional pages | ~166,000 |

The vendor should be prepared to process batches of 10,000–30,000 words with 5-business-day turnaround for P0 content.

---

## 6. Do-Not-Translate List

The following terms must appear **exactly as shown** (in the original English/Latin characters) in all target language translations, regardless of language or script:

### Brand and Sub-Brand Names (Never Translate or Transliterate)

| Term | Notes |
|---|---|
| TwinMOS | Company name — always in Latin script |
| VOLTX | Sub-brand — all caps |
| CoreX Pro | Sub-brand — capitalise as shown |
| TornadoX7 | Sub-brand — capitalise as shown |
| Thunder GX | Sub-brand — capitalise as shown |
| Xtreme | Sub-brand — capitalise as shown |
| Alpha Pro | Sub-brand — capitalise as shown |
| XPERT | Sub-brand — all caps |
| StarPro | Sub-brand — capitalise as shown |

### Product SKU Codes (Never Translate)

All product SKU codes (e.g., `MDD564GB6000HC30ABRGB`, `SNM2PCIEG5512CBPRO`) remain in Latin characters in all languages. SKUs appear verbatim in product pages, spec tables, and support articles.

### Technology Standard Names (Never Translate)

| Term | Category |
|---|---|
| DDR5, DDR4, DDR3, LPDDR5, LPDDR4 | Memory standards |
| NVMe, SATA, PCIe, M.2 | Storage interface standards |
| PCIe Gen 5.0, Gen 4.0 | Interface generation |
| XMP 3.0, XMP 2.0 | Intel memory profile |
| AMD EXPO | AMD memory profile |
| JEDEC | Standards body |
| ECC | Error correction standard |
| RGB | Lighting technology |
| USB 3.2, USB 3.1, USB-C, USB-A | Interface standards |
| UHS-I, UHS-II | SD card speed class |

### Legal and Certification Marks

| Term | Notes |
|---|---|
| ISO 9001 | Do not translate certification standard numbers |
| CE, FCC, RoHS, REACH | Certification abbreviations stay in EN |
| EAC | Eurasian Conformity mark — keep abbreviation |
| BIS | Bureau of Indian Standards — keep abbreviation |
| GDPR, PDPL, DPDP | Legal framework abbreviations |
| RMA | Return Merchandise Authorisation — keep abbreviation |

### Website and Technical Terms

| Term | Notes |
|---|---|
| twinmos.com | Domain name — never translate |
| All URLs (`/products/`, `/learn/`, etc.) | URL paths remain in Latin characters |
| Email addresses | Never translate |
| Model numbers and part numbers | Always in Latin characters |

---

## 7. Technical Terms Handling

For the following technical terms, vendors should follow these guidelines:

### 7.1 Transliterate, Do Not Translate

Some technical terms are borrowed into the target language through transliteration (phonetic adaptation to the target script) rather than semantic translation:

| Term | Arabic (AR) | Hindi (HI) | Russian (RU) | Notes |
|---|---|---|---|---|
| RAM |  |  |  | Use transliteration in consumer content; abbreviation in technical context |
| SSD | إس إس دي | एसएसडी | এসএসডি | ТТН (or SSD) | Use EN abbreviation in technical tables |
| Firmware | فيرمور | फ़र्मवेयर | ফার্মওয়্যার | Прошивка (native word exists) | Russian has native term; use it |
| Heatspreader | هيتسبريدر | हीटस्प्रेडर | হিটস্প্রেডার | Радиатор (native word) | Russian has native term; use it |
| Overclocking | أوفركلوكينج | ओवरक्लॉकिंग | ওভারক্লকিং | Разгон (native word) | Russian has native term; use it |

The full glossary with approved translations is in **TWN-F4-GLOSSARY-2026-001**. Vendors must follow the glossary and flag any gaps for TwinMOS's Localization Lead to resolve.

### 7.2 Units of Measurement

Units of measurement follow the style guide (TWN-F2-STYLE-2026-001):
- Keep Arabic numerals (Western digits) for all product specifications in all locales.
- Example: "32 GB" (not "٣٢ جيجابايت" — do not substitute Arabic-Indic numerals in product specs).
- Exception: Arabic-Indic numerals may be used in Arabic flowing prose if contextually appropriate, but Western numerals are mandatory in spec tables and product identifiers.
- Currency: translate the currency code/symbol per locale (AED for UAE, INR for India, RUB for Russia, CNY for China, EUR for France).

---

## 8. File Formats and Delivery

### 8.1 Source Format

TwinMOS will deliver source content in **XLIFF 1.2 format** exported from Strapi v5. Each XLIFF file covers one content entry in one source-target language pair:

```
product-mdd564gb6000hc30abrgb-en-ar-2026-06-01.xliff
```

Naming convention: `{content-type}-{documentId}-{source}-{target}-{YYYY-MM-DD}.xliff`

XLIFF files will be delivered via secure transfer to a designated folder on **Backblaze B2** (access credentials provided upon contract execution).

### 8.2 Accepted Return Formats

| Format | Use Case |
|---|---|
| **XLIFF 1.2** (preferred) | All web content translations — for direct Strapi import |
| **XLIFF 2.0** | Acceptable if vendor CAT tool generates 2.0 natively |
| **TMX** | Translation Memory export (used for TM hand-off only) |
| **TBX** | Terminology Base exchange format (for glossary updates) |
| **CSV** | UI strings only (when XLIFF is disproportionate for short-string batches) |

**Do NOT deliver:**
- Microsoft Word (.docx) — not importable into Strapi
- PDF — not importable
- Plain text files without structure

### 8.3 Quality Check Before Delivery

Before delivering XLIFF files, the vendor must verify:

- [ ] All `<source>` elements are present and unmodified
- [ ] All `<target>` elements contain translated content (no untranslated strings)
- [ ] Do-not-translate terms appear exactly as in source (verified against §6)
- [ ] HTML tags within XLIFF `<source>` elements are preserved exactly in `<target>` (no broken tags)
- [ ] No placeholder text (e.g., "TODO", "[TRANSLATE]", "XXX") remains in final delivery
- [ ] XLIFF is well-formed XML (validate with xmllint or equivalent)

---

## 9. Glossary and Translation Memory

### 9.1 TwinMOS Translation Memory

TwinMOS maintains a project-wide Translation Memory covering all previously translated segments. The TM is the primary resource for achieving consistency across content types and phases.

- The TM will be provided to the selected vendor at project kick-off.
- Format: TMX (Translation Memory eXchange)
- The vendor must apply the TM to all new content, using fuzzy matches ≥75% as pre-translation candidates (subject to human review).
- Leverage discounts apply to TM matches (see §17 commercial terms).

### 9.2 TwinMOS Terminology Glossary

The master Terminology Glossary (TWN-F4-GLOSSARY-2026-001) contains:
- ~600 approved terms in English with translations for AR, BN, HI, RU, ZH-CN, FR
- Do-not-translate list
- Preferred transliterations for technical terms
- UI string translations
- Legal terminology

The vendor must import the glossary into their CAT tool (memoQ, SDL Trados, Phrase TMS) and enforce glossary compliance during translation and QA.

### 9.3 AI Pre-Translation Policy

TwinMOS permits the vendor to use AI pre-translation (e.g., DeepL API, Google Cloud Translation API) as a first pass to increase efficiency. **However:**

- AI output must be post-edited by a human translator — raw AI output cannot be delivered as final.
- The vendor must disclose AI tool usage in the project methodology submission.
- AI pre-translation costs must be reflected in reduced per-word rates (see §17 commercial terms).
- Do-not-translate terms must be protected in the AI tool's settings (glossary lock / term protection).

### 9.4 Glossary Update Process

If the vendor identifies a term missing from the glossary during translation:
1. Flag the term in a weekly "Terminology Query" log (CSV format: Source Term | Proposed Translation | Context | Rationale).
2. TwinMOS Localization Lead reviews and approves/rejects within 3 business days.
3. Approved terms are added to the master glossary and shared with the vendor.
4. The vendor backfills the approved term in already-translated content if material.

---

## 10. Quality Assurance Requirements

### 10.1 QA Framework

TwinMOS requires translation quality conforming to the **LISA QA Model** (or equivalent framework agreed with vendor). Target quality score: **≥4.5 / 5.0** across all language pairs.

### 10.2 QA Process

The vendor's QA process must include:

**Step 1 — Translator Self-Review**
- Translator reviews own work against source for accuracy, completeness, and do-not-translate compliance before handoff to reviewer.

**Step 2 — Independent Native-Speaker Review**
- A second native speaker (different from the translator) reviews the translation for:
  - Linguistic accuracy and natural flow
  - Brand voice consistency (refer to TWN-F2-TOV-2026-001 Tone of Voice Guide)
  - Terminology consistency against the glossary
  - Cultural appropriateness (refer to TWN-F4-CULTURE-2026-001)
  - Do-not-translate compliance
  - HTML/XLIFF tag integrity

**Step 3 — QA Tool Check**
- Run automated QA checks in the CAT tool (memoQ QA, Xbench, or equivalent) for:
  - Untranslated segments
  - Tag mismatches
  - Inconsistent terminology
  - Number/date format inconsistencies
  - Spelling and grammar errors

**Step 4 — Error Log and Correction**
- Document all errors found in a QA report (Error | Category | Severity | Resolution)
- Correct all errors before final delivery

### 10.3 QA Error Categories and Severity

| Category | Examples | Severity |
|---|---|---|
| Accuracy | Mistranslation, omission, addition | Blocker |
| Terminology | Brand name mistranslated; wrong term for "firmware" | Blocker |
| Do-Not-Translate violation | "VOLTX" translated or transliterated | Blocker |
| Tag / XLIFF error | Broken HTML tag in `<target>` | Blocker |
| Fluency | Unnatural phrasing; word order issues | High |
| Style / tone | Too formal/informal for page type | High |
| Consistency | Same concept translated differently across segments | Medium |
| Formatting | Wrong number format; wrong date format | Medium |
| Punctuation | Wrong punctuation for target locale | Low |
| Spelling/typo | Minor spelling error | Low |

All Blocker-severity issues must be resolved before delivery. High-severity issues should be resolved; if not, must be clearly flagged.

### 10.4 TwinMOS Quality Review

After the vendor delivers translated XLIFF files, TwinMOS's regional contact (e.g., UAE Regional Manager for Arabic) performs a spot-check review (10–20% of content) before accepting the batch. TwinMOS reserves the right to return batches with unacceptable quality scores.

---

## 11. Turnaround Times and Batch Sizing

### 11.1 Standard Turnaround Times

| Batch Size (Source Words) | Translation + QA Turnaround |
|---|---|
| Up to 2,000 words | 2 business days |
| 2,001–5,000 words | 5 business days |
| 5,001–10,000 words | 7 business days |
| 10,001–20,000 words | 10 business days |
| 20,001–30,000 words | 12 business days |

### 11.2 Rush Turnaround (50% premium applies)

| Batch Size | Rush Turnaround |
|---|---|
| Up to 5,000 words | Next business day (end of day) |
| 5,001–10,000 words | 3 business days |

Rush turnaround must be agreed in writing (email) at the time of order.

### 11.3 Batch Scheduling

- TwinMOS will provide a 2-week advance forecast of upcoming translation batches at the start of each month.
- P0 batches (Phase 2 launch content) will be provided with maximum 4 weeks advance notice.
- The vendor must confirm capacity within 24 hours of receiving a batch order.

---

## 12. Deliverables and Handoff

### 12.1 Per-Batch Deliverables

For each translation batch, the vendor must deliver:

| # | Deliverable | Format |
|---|---|---|
| 1 | Translated XLIFF files | XLIFF 1.2 or 2.0 |
| 2 | Updated Translation Memory | TMX |
| 3 | QA report | CSV or Excel |
| 4 | Terminology queries log (if any) | CSV |

### 12.2 Delivery Location

All deliverables are uploaded to: `Backblaze B2: twinmos-translations/completed/{locale}/{batch-id}/`

Access credentials and bucket details provided upon contract execution.

### 12.3 Project Kick-Off Deliverables (One-Time)

At project start, the vendor must deliver:

| # | Deliverable | Deadline |
|---|---|---|
| 1 | Project methodology document (tools, team, AI policy) | Within 1 week of contract signing |
| 2 | Translator CVs for each language pair | Within 1 week |
| 3 | Completed TM import confirmation | Within 1 week |
| 4 | Glossary import confirmation in CAT tool | Within 1 week |
| 5 | Test translation (500 words EN→AR; 500 words EN→HI) | Within 2 weeks — for quality assessment |

### 12.4 Project Completion Deliverables (Per Phase)

At end of each phase, the vendor delivers:

| # | Deliverable | Format |
|---|---|---|
| 1 | Final consolidated Translation Memory | TMX |
| 2 | Final approved Glossary additions | TBX or CSV |
| 3 | Phase completion quality report | PDF |

---

## 13. Vendor Responsibilities

The selected vendor is responsible for:

1. **Providing qualified translators** — Native speakers with 3+ years of experience in technology/B2B translation for each language pair.
2. **CAT tool proficiency** — Must use a professional CAT tool (memoQ, SDL Trados Studio, or Phrase TMS) compatible with XLIFF and TMX.
3. **Glossary compliance** — All translations must adhere to the TwinMOS Terminology Glossary; no unapproved deviations.
4. **Tag integrity** — All HTML tags within XLIFF source elements must be preserved exactly in the translated target elements.
5. **Confidentiality** — All TwinMOS content (translated and source) is confidential under the NDA (see §15).
6. **Communication** — Designated Project Manager at the vendor side; response within 4 business hours during business days.
7. **TM maintenance** — Keep the Translation Memory updated with every batch; deliver updated TMX with each batch.
8. **Issue escalation** — Escalate unresolvable terminology queries or ambiguities to TwinMOS within 24 hours rather than making assumptions.

---

## 14. TwinMOS Responsibilities

TwinMOS is responsible for:

1. **Providing source XLIFF files** in clean, well-formed format.
2. **Providing the Translation Memory and Glossary** at project kick-off and as updated.
3. **Clarifying ambiguous source content** within 24 hours of a vendor query.
4. **Providing regional review contacts** (UAE regional manager, Taipei HQ contact, etc.) for native-speaker review where required.
5. **Reviewing and accepting/rejecting batches** within 5 business days of delivery.
6. **Providing timely feedback** on test translations and quality issues.
7. **Managing legal review** of legal page translations — the vendor's responsibility ends at translation delivery; TwinMOS handles legal counsel review.
8. **CMS import and publication** — the vendor delivers XLIFF; TwinMOS handles Strapi import and website deployment.

---

## 15. Confidentiality and Legal Requirements

### 15.1 Non-Disclosure Agreement

The selected vendor must sign the **TwinMOS Technologies Non-Disclosure Agreement (NDA)** before receiving any project files. The NDA covers:

- All source and translated content
- Product specifications not yet publicly announced
- Website architecture and technical documentation
- Business strategy, pricing, and partner information

NDA term: 5 years from project completion.

### 15.2 Data Processing Agreement (DPA)

If the vendor processes any personal data (e.g., team member bios, customer-facing legal documents referencing personal data categories), a Data Processing Agreement (DPA) compliant with GDPR must be signed. Vendors based outside the EU/EEA must ensure adequate data transfer mechanisms are in place (EU Standard Contractual Clauses or equivalent).

### 15.3 Translator Confidentiality

The vendor must ensure all individual translators and reviewers working on TwinMOS content have signed confidentiality agreements binding them to the same confidentiality obligations.

### 15.4 Data Security

- All files must be transferred via the designated Backblaze B2 bucket with TLS encryption in transit.
- Do NOT use personal email, Google Drive, Dropbox, or WeTransfer to transfer TwinMOS content.
- Upon project completion or contract termination, the vendor must certify in writing that all TwinMOS source files and translated content have been deleted from vendor systems.

---

## 16. Vendor Evaluation Criteria

Vendors responding to this brief will be evaluated on the following criteria:

| Criterion | Weight | Description |
|---|---|---|
| **Language expertise and team quality** | 25% | Native-speaker translators with technology sector experience for all required language pairs; translator CVs reviewed |
| **Technology and toolchain** | 20% | CAT tool (memoQ, Trados, or Phrase TMS); XLIFF 1.2/2.0 support; TM and glossary management capability; AI pre-translation methodology |
| **Domain experience** | 20% | Proven experience translating B2B technology or consumer electronics content; preference for memory/storage or hardware industry experience |
| **Quality assurance process** | 15% | Documented multi-step QA process; QA framework used; error tracking capability |
| **Turnaround capability** | 10% | Ability to meet SLAs for P0 batches; capacity across 6 language pairs simultaneously |
| **References and portfolio** | 5% | At least 2 comparable technology brand references; sample translations in target languages |
| **Commercial competitiveness** | 5% | Per-word rates for translation, post-editing, and TM leverage tiers |

### 16.1 Mandatory Requirements (Disqualifying if Not Met)

- [ ] Must support XLIFF 1.2 or 2.0 natively in their CAT tool
- [ ] Must provide native-speaker translators (not bilingual-only) for each language pair
- [ ] Must have signed NDA before receiving any content
- [ ] Must support TMX Translation Memory import/export
- [ ] Must have documented QA process with independent review step

---

## 17. Commercial Terms and Contact

### 17.1 Pricing Structure

Vendors must quote on a **per-word basis** for the following rate categories:

| Rate Category | Description |
|---|---|
| **New content** | Source segments with 0–74% TM match |
| **Fuzzy match (75–84%)** | Source segments with 75–84% TM match |
| **Fuzzy match (85–94%)** | Source segments with 85–94% TM match |
| **High fuzzy match (95–99%)** | Source segments with 95–99% TM match |
| **Exact match (100%)** | Identical to existing TM segment — verification only |
| **Repetitions** | Identical within the same file |
| **AI post-editing** | Human post-editing of AI pre-translated segments |
| **Rush surcharge** | % premium on standard rate for rush delivery |

### 17.2 Invoicing and Payment

- Invoicing is per batch on delivery acceptance.
- Payment terms: Net 30 days from invoice date.
- Currency: USD (preferred), GBP, or EUR acceptable.
- Invoices submitted to: `finance@twinmos.com`

### 17.3 Contact for Submissions and Queries

**Localization Lead — TwinMOS Technologies**
Email: `localization@twinmos.com`
Subject line: `[VENDOR BRIEF RESPONSE] — [Vendor Company Name] — [Language Pairs]`

Vendor submissions should include:
1. Company profile (1 page)
2. Team CVs for each language pair (1 page per language pair)
3. CAT tool and AI pre-translation methodology (1 page)
4. QA process description (1 page)
5. Client references (at least 2 technology clients)
6. Rate card (per-word rates for all categories in §17.1)
7. Test translation (500 words EN→AR + 500 words EN→HI, translated from the provided sample)

**Response deadline:** 15 business days from receipt of this brief.

---

*Document End — TWN-F4-VENDOR-2026-001 v1.0*
