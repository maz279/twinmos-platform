# TwinMOS Website Documentation — Forensic Audit & Remediation Report

**Audit date:** 23 September 2026 (Iteration 1) · 24 September 2026 (Iteration 2 — full fabrication sweep)
**Scope:** all files under `Corporate website development for TwinMOS/` (785 documentation files at audit start; full recursion, all folder levels)
**Baseline authority:** live crawl of https://www.twinmos.com/ — 69 pages + `llms.txt` + 1,199 image assets (mirror: `../twinmos_mirror/`; fact base: `../twinmos_mirror/authoritative_facts.md`)
**Backup:** complete pre-remediation snapshot at `../twinmos_mirror/backup_before_remediation/` (821 files)
**Change log:** `../twinmos_mirror/remediation_log.txt` plus per-file edits documented below

---

## 1. Executive Summary

The corpus was contaminated with **another company's corporate data**. Source material compiled for the website included business decks belonging to **STBL / Smart Technologies (BD) Ltd — an ICT distributor and HPE partner in Bangladesh** (the Content Map's own source-notes flagged these decks as "NOT TwinMOS-branded"). Data from those decks — leadership names, a Bangladesh/India channel network, a Dhaka office, Bengali localization priorities, BDT pricing — leaked into TwinMOS requirements, content specs, and legal drafts as if they were TwinMOS's own facts.

**TwinMOS Technologies is an independent company.** It is not owned by Smart Technologies or any other Bangladesh-based company, and no parent/holding company exists. The live twinmos.com publishes no founder, no named executives, no Bangladesh office, no India subsidiary, and no featured distributors.

**Result: 180 of 785 files (23%) were contaminated; all have been remediated.** 10 fabricated files were deleted, ~120 files edited, and the core company-profile documents rewritten against the verified live-site fact base. A final verification sweep confirms zero remaining occurrences of any contamination marker (surviving "Bangladesh" mentions are the deliberate independence statements and forensic source-notes only).

---

## 2. Root Cause

Per `content/TwinMOS_Website_Content_Map.md` §Source Notes:

> the "twinmos 2024 business plan.pptx" / "Enterprise Solution (HPE) Presentation" decks are **STBL (Smart Technologies BD Ltd) documents** — an HPE Platinum Partner in Bangladesh — "for reference only, not TwinMOS-branded enterprise content."

STBL's corporate data was subsequently treated as TwinMOS fact throughout the drafting chain (Company Profile → BRD/RFP/URD → content specs → test data → marketing copy).

---

## 3. Fabricated Data Removed (vs. twinmos.com ground truth)

| Fabricated claim | Files | Disposition |
|---|---|---|
| Founder "William Chen" | 22 | Removed — live site publishes no founder |
| Dubai FZE "Chairman Mohd Mazharul Islam" (with personal Gmail), "GM Robiul Islam", "President SM Mohibul Hasan" | 69 / 58 / 24 | Removed — STBL personnel, not TwinMOS executives; twinmos.com publishes no executive names |
| "TwinMOS Technologies (India) Pvt. Ltd." + directors Mohammad Zahirul Islam / Mohammed Abdul Mannan | 16 / 15 | Removed — entity not published on twinmos.com |
| Smart Technologies (BD) Ltd. as TwinMOS distributor "since 1998/2008"; Tech Valley, Ryans IT, Star Tech, EERNA retailer network | 39 | Removed |
| Supertron Electronics exclusive India distribution + MOU + India launch campaign | 51 | Removed — unverified, not on live site |
| Bangladesh office "156 Mirpur Road, Dhaka-1205"; Dhaka liaison/careers/warranty/warehousing; BCS Computer City showcase | 40 | Removed |
| Bangladesh regional page, Smart Tech microsite, office-bangladesh page, Bangladesh Distributor Summit article | — | Files deleted |
| Bengali (bn) as Phase-2 launch locale; `/bn/` mirrors, bn sitemaps, Bengali fonts/QA/CI rules | 60 | Removed — Phase 2 locales are Arabic (RTL) + Hindi |
| BDT pricing/currency support | 19 | Removed — currency set is AED/INR/SAR/USD/EUR/RUB |
| Dubai as "Headquarters" / "Primary International HQ" | many | Corrected — Taipei is global HQ & R&D; Dubai DAFZA is the international office |
| "Achiever Computers (ACL)" as featured distributor | 21 | Genericized — live site names no partners |

## 4. Files Deleted (10)

1. `content/website-content/09-partners/17-bangladesh-smart-tech.md`
2. `content/website-content/09-partners/16-india-supertron-microsite.md`
3. `content/website-content/13-contact/14-office-bangladesh.md`
4. `content/website-content/13-contact/13-office-india.md`
5. `content/website-content/11-regional/03-bangladesh.md`
6. `content/website-content/10-news-events/articles/2026-q3-bangladesh-distributor-summit.md`
7. `content/website-content/10-news-events/articles/2026-q1-supertron-india-mou.md`
8. `content/website-content/15-marketing/09-india-launch-campaign.md`
9. `content/website-content/00-site-wide/trz77887e1a-….tmp` (orphaned editor artifact)
10. `content/website-content/09-where-to-buy/trzef60df4b-….tmp` (orphaned editor artifact)

## 5. Structural Rewrites

- **TwinMOS_Company_Profile_Comprehensive.md** (+ synced duplicate in `A - Foundation and Strategy/`): exec summary, history, corporate structure, market presence, contact sections rebuilt on live-site facts with explicit **Independence Statement**; personnel table replaced with a no-named-executives governance note; five verified offices table.
- **02-about/03-leadership.md**: retitled "Leadership & Governance" — governance structure only; verified-profile placeholder templates; `Person` schema replaced with `Organization` schema guidance.
- **02-about/11-corporate-entities.md**: entity tree corrected to the five published offices; India Pvt. Ltd./ME LLC removed; invoicing guide re-mapped.
- **02-about/10-global-presence.md, 16-corporate-fact-sheet.md, 17-investor-relations.md, 01-overview.md, 12-why-choose-twinmos.md, 09-csr-community.md**: office lists, entity tables, schema places corrected.
- **12-careers/03-locations.md**: five real offices; Dhaka liaison and New Delhi office sections removed.
- **11-regional/02-india.md**: rewritten neutral (authorized-distribution model, Dubai coordination) with editorial note barring reintroduction of subsidiary claims.
- **09-partners/15-distributor-success-stories.md**: fabricated ST/India-subsidiary/BD stories removed; remaining story anonymized as illustrative with BR-14.2 governance note.
- **01-homepage/09-testimonials-block.md**: Dhaka/ST testimonial replaced with placeholder-attribution guidance.
- **F.3 SEO SchemaOrg templates**: fabricated chairman `Person` schema replaced with placeholder-token template + editorial constraint.

## 6. Corrected Facts Now Enforced (authoritative base)

- Founded **1998, Taipei City, Taiwan**; global HQ & R&D Center at 5F.-5, No. 29, Sec. 1, Minsheng E. Rd., Zhongshan Dist., Taipei 104619
- International office **C-9, DAFZA, Dubai** (P.O. Box 54278; +971-4-2996421/22)
- Manufacturing **Hsinchu (Taiwan), Dongguan (China)**; marketing branches in USA, Germany, Netherlands, ME, SEA, Singapore, HK, Japan, South Korea, Taiwan, China
- **TwinMOS Europe GmbH** (Cologne) · **TwinMOS America Inc.** (San Jose)
- TÜV SÜD **ISO 9001:2000** (2002); RoHS, CE, FCC, EPEAT; JEDEC
- **93+ countries, 5 continents, 100+ products**; brand + OEM; sales@twinmos.com; +886 970-368-077
- 38-SKU authoritative product catalogue (per llms.txt)
- Phase 2 locales: **Arabic (RTL) + Hindi**; regional landing pages: 27 (Bangladesh removed)

## 7. Verification

Full-corpus grep sweep (documentation only) after remediation:

`Smart Tech*`, `Supertron`, `William Chen`, `Mazharul/Robiul/Mohibul/Zahirul/Mannan`, `Tech Valley`, `Ryans`, `Star Tech`, `EERNA`, `Achiever`, `Mirpur`, `BCS Computer`, `Dhaka`, `Bengali`, `BDT`, `Sylhet/Khulna/Chattogram`, `New Delhi`, `India Pvt` → **0 occurrences each**.

`Bangladesh` → 8 intentional occurrences only (independence statements in Company Profile / Leadership / Corporate Entities; STBL source-deck forensic notes in Content Map & URD; remediation note in Forensic Alignment Audit v2).

No dangling references to any deleted file or URL path (`/partners/bangladesh/`, `/partners/india/`, `/regions/bangladesh/`, `/contact/locations/bangladesh/`, `/campaigns/india-launch/` → 0).

**Exclusions:** `twinmos_website_offline/` (a mirror of the real site added during the session) was treated as ground-truth reference, not audited as documentation; its WooCommerce country/currency data is standard platform payload.

## 8. Iteration 2 — Extended Fabrication Sweep (24 Sep 2026)

A second full-corpus pass against the live-site ground truth removed every remaining class of fabricated data beyond the STBL cluster:

| Fabricated class | Scope | Disposition |
|---|---|---|
| Invented warranty tiers ("3-year Gen4/Gen3 NVMe") | 24 files | Corrected to the **live Warranty Policy**: Lifetime = memory modules; 5 years = NVMe SSD (all gens) / flash cards / USB drives; 3 years = SATA SSD; 1 year = computer accessories |
| ISO 9001:2015 claims | 78 files | Normalized to the published **TÜV SÜD ISO 9001:2000 (2002)** claim; changelog "upgrade" notes inverted |
| Invented award timeline (15 awards 2001–2023 + UAE Superbrand) | Awards page, awards category, history timeline, why-choose, news hub | Removed; only verifiable recognition retained: **Best SSD Manufacturer 2023** (twinmos.com announcement) + verified credentials. `2026-q4-uae-superbrand-confirmation.md` deleted |
| Regional distributor rosters (third-party companies' real addresses/phones/HP-partner profiles presented as TwinMOS's network) | all 28 regional pages + where-to-buy hub + Africa/MEA hubs + partnerships category + content map | Stripped and replaced with a standard verified-neutral Distribution/Contact section; named partners now require written TwinMOS confirmation |
| Invented TwinMOS entities (Nigeria Ltd., South Africa (Pty) Ltd., Singapore Pte Ltd., ABAG "exclusive European distributor") | privacy policy, modern-slavery statement, where-to-buy | Removed |
| Unverified channel/marketplace names (~40 companies) | corpus-wide | Genericized; where-to-buy marketplace table reduced to **live-verified** entries (Amazon.ae ✅, Newegg ✅ checked 2026-09; others marked "verify before publish") |
| Personal contacts (oladotun@ mobile "Africa Sales Desk", india@ office email) | where-to-buy/no-retailer/global-presence | Replaced with official sales@twinmos.com / Dubai office |
| Unverifiable stats & claims ("500+ distribution partners", "24/7 customer service", "100% product testing") | ~35 files | Replaced with verifiable equivalents (93+ countries; responsive Mon–Fri support per twinmos.com; "rigorous pre-delivery testing") |
| Wrong social URLs (facebook.com/twinmos, twitter.com/TwinMOS, etc.) | 18 files | Normalized to live-footer canonicals: facebook.com/twinmos.tech · instagram.com/twinmos.tech · linkedin.com/company/twinmos-technologies · x.com/twinmos · youtube.com/c/TwinMOStech · pinterest.com/twinmos |

**Iteration-2 verification:** full-corpus sweep of ~80 fabrication markers returns zero non-intentional hits (remaining mentions live only inside this report's documentation of the removed items and in editorial "removed as unverifiable" notes).



1. **Test data** (`G - QA`) still contains placeholder personas (Aisha Rahman etc.) — harmless, but regenerate from clean fixtures before UAT.
2. **Where-to-buy marketplace table**: only live-verified entries remain (Amazon.ae, Newegg — checked 2026-09); Noon/Daraz rows are marked ⏳ verify-before-publish. Named local distributors are fully genericized pending a partner list confirmed in writing by TwinMOS.
3. **Executive content**: leadership page and Person schema intentionally empty of names — populate only from TwinMOS-verified input with written individual approval (BR-5.5).
4. Financial figures (revenue $17.5–50M, headcount 301–500) are third-party estimates — labelled as such; confirm or remove before publication.
5. Historical narratives in `02-history.md` and the "27 regional pages" count should be re-validated against the final IA once the BD/India pages' removal is confirmed by the site owner.
