# User Requirements Document (URD)
# TwinMOS Technologies — Corporate Website Development Project

**Document Reference:** TWN-URD-2026-001  
**Document Version:** 3.0 (Content-Aligned Edition)  
**Status:** FINAL  
**Date:** 30 April 2026  
**Prepared by:** TwinMOS Technologies — Digital Transformation Team  
**Owner:** UX Lead (Functional) / Product Manager (Implementation)  
**Classification:** CONFIDENTIAL — Internal Use Only  
**Distribution:** UX Design Team, Development Team, QA, Product Management, Project Management  
**Synchronized With:** RFP v3.0, BRD v3.0, Content Map v1.0, `_master-sku-reference.md`, Forensic Audit v1.0, Documents Forensic Alignment Audit v2.0, Company Profile v2.0  

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | April 2026 | TwinMOS Digital Transformation Team | Initial draft synchronized with BRD v1.0 and RFP v1.0 |
| 1.0 | April 2026 | TwinMOS Digital Transformation Team | Final URD with complete use cases, interaction flows, UI requirements, and traceability matrix |
| 2.0 | 29 April 2026 | TwinMOS Digital Transformation Team | Comprehensive alignment revision: corrected business-rule cross-references; removed foreign-language artifacts; resolved Phase-2 timing inconsistency to match RFP/BRD; expanded Use Case Diagrams to cover UC-26, UC-27, UC-28, UC-31; standardized terminology with BRD/RFP; added missing UR-IDs and traceability rows |
| 3.0 | 30 April 2026 | TwinMOS Digital Transformation Team | Content-Aligned Edition: full alignment with `TwinMOS_Website_Content_Map.md` (287 entries) and the on-disk content corpus (351 markdown files across 16 sections). Added 8 new UR-Epics (UR-Epic 11: Solutions, UR-Epic 12: Technology, UR-Epic 13: Learn Hub, UR-Epic 14: Careers, UR-Epic 15: Marketing Programs, UR-Epic 16: Compliance Hub, UR-Epic 17: Anti-Counterfeit, UR-Epic 18: Channel Programs). Added 6 new personas (Faisal/Embedded, Ms. Tan/Government, Mr. Rahman/Education IT, Mr. Wong/OEM-ODM, Lina/Media, Sara/Job Applicant). Updated regional landings from 3→28 country pages. Updated locale support from 6→9 active locales. Added new use cases UC-33 through UC-50. Updated source-of-truth hierarchy. |

---

## Table of Contents

### Part 1: Introduction & Context
1. [Purpose & Scope](#1-purpose--scope)
2. [Document Relationship & Traceability](#2-document-relationship--traceability)
3. [Definitions & Acronyms](#3-definitions--acronyms)
4. [Reference Documents](#4-reference-documents)

### Part 2: User Environment
5. [User Profiles & Personas](#5-user-profiles--personas)
6. [User Classification & Roles](#6-user-classification--roles)
7. [User Environment & Device Matrix](#7-user-environment--device-matrix)

### Part 3: User Requirements by Epic
8. [UR-Epic 1: Product Discovery & Catalog](#8-ur-epic-1-product-discovery--catalog)
9. [UR-Epic 2: System Compatibility Finder](#9-ur-epic-2-system-compatibility-finder)
10. [UR-Epic 3: Where to Buy / Distributor Locator](#10-ur-epic-3-where-to-buy--distributor-locator)
11. [UR-Epic 4: Lead Generation & Contact Management](#11-ur-epic-4-lead-generation--contact-management)
12. [UR-Epic 5: Content Management](#12-ur-epic-5-content-management)
13. [UR-Epic 6: Support & Self-Service](#13-ur-epic-6-support--self-service)
14. [UR-Epic 7: Partner / Distributor Portal](#14-ur-epic-7-partner--distributor-portal)
15. [UR-Epic 8: Gaming Hub — VOLTX Brand](#15-ur-epic-8-gaming-hub--voltx-brand)
16. [UR-Epic 9: Multi-Language & Regionalization](#16-ur-epic-9-multi-language--regionalization)
17. [UR-Epic 10: Admin & CMS](#17-ur-epic-10-admin--cms)

### Part 4: Detailed Use Cases
18. [Use Case Catalog](#18-use-case-catalog)
19. [Use Case Diagrams](#19-use-case-diagrams)

### Part 5: User Interface Requirements
20. [UI Standards & Design System](#20-ui-standards--design-system)
21. [Page-Level UI Requirements](#21-page-level-ui-requirements)
22. [Component-Level UI Requirements](#22-component-level-ui-requirements)
23. [Responsive Behavior Matrix](#23-responsive-behavior-matrix)
24. [Animation & Interaction Requirements](#24-animation--interaction-requirements)

### Part 6: User Interaction Flows
25. [Critical Path Flows](#25-critical-path-flows)
26. [Decision Trees & Branching Logic](#26-decision-trees--branching-logic)
27. [Error Handling from User Perspective](#27-error-handling-from-user-perspective)
28. [Feedback & Confirmation Patterns](#28-feedback--confirmation-patterns)

### Part 7: Data & State Requirements
29. [User-Visible Data Requirements](#29-user-visible-data-requirements)
30. [Form Validation Rules from User Perspective](#30-form-validation-rules-from-user-perspective)
31. [State Management Requirements](#31-state-management-requirements)

### Part 8: Non-Functional User Requirements
32. [Performance from User Perspective](#32-performance-from-user-perspective)
33. [Accessibility from User Perspective](#33-accessibility-from-user-perspective)
34. [Security & Privacy from User Perspective](#34-security--privacy-from-user-perspective)

### Part 9: Traceability & Synchronization
35. [Requirements Traceability Matrix](#35-requirements-traceability-matrix)
36. [Change Control & Version Sync Protocol](#36-change-control--version-sync-protocol)

### Part 10: Appendices
37. [Appendix A: User Interview Questions](#37-appendix-a-user-interview-questions)
38. [Appendix B: Usability Test Scenarios](#38-appendix-b-usability-test-scenarios)
39. [Appendix C: Accessibility Checklist (User-Facing)](#39-appendix-c-accessibility-checklist-user-facing)
40. [Appendix D: Synchronization Log](#40-appendix-d-synchronization-log)

---

## 1. Purpose & Scope

### 1.1 Purpose

The User Requirements Document (URD) captures **what the user needs, expects, and experiences** when interacting with the new TwinMOS corporate website. It translates the business-focused requirements of the BRD and the procurement-focused specifications of the RFP into **user-centric functional specifications** that guide UX design, interaction design, front-end development, and quality assurance.

**Primary audiences for this document:**
- UX/UI Designers — interaction patterns, component behavior, responsive rules
- Front-End Developers — state management, form handling, animation specs
- QA Engineers — test scenarios, edge cases, user-facing acceptance criteria
- Product Managers — user experience validation and feature completeness

### 1.2 Scope

This document covers all user-facing functionality planned for the TwinMOS website redevelopment across the authoritative phased roadmap defined in RFP §4.4 and BRD §6.1:

- **Phase 1 (Months 1–5, public launch in Month 5):** Core website, product catalog, compatibility finder, where-to-buy, contact forms, support center, news, gaming hub, CMS — English only
- **Phase 2 (Months 6–9, post-launch):** Multi-language (Arabic, Hindi), partner/distributor portal, live chat with agent routing, serial-number anti-counterfeit lookup
- **Phase 3 (Months 10–15):** E-commerce evaluation/MVP, additional languages (Russian, Chinese-Simplified, French), advanced analytics & marketing automation
- **Phase 4 (Months 16+):** Spanish, Portuguese, German; continuous SEO/CRO optimization

**Out of scope for this URD:**
- Backend architecture and database schema (see BRD §19, §26)
- Vendor evaluation criteria (see RFP §14)
- Detailed API specifications (see BRD §26)
- Infrastructure and DevOps requirements (see BRD §25, RFP §6.3)

### 1.3 Document Philosophy

> "Every requirement in this document answers the question: *What must the user be able to do, see, or feel?*"

If a requirement cannot be experienced by a user, it belongs in the BRD or technical specification, not here.

---

## 2. Document Relationship & Traceability

### 2.1 Document Quartet

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DOCUMENT SUITE RELATIONSHIPS                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   Company Profile ──► Forensic Audit ──► RFP ──► BRD ──► URD      │
│      (Context)        (Problems)      (Procure)  (Business) (User) │
│                                                                      │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │  URD v2.0 ←── Synchronized With ──► BRD v2.0 & RFP v2.0    │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│   NEXT DOCUMENT IN CHAIN: System Requirements Specification (SRS)   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Synchronization Guarantee

| Element | BRD Reference | RFP Reference | URD Section |
|---------|--------------|---------------|-------------|
| 5 User Personas | Section 7 | Section 5 | Section 5 |
| 10 Epics | Sections 8–17 | Section 8 | Sections 8–17 |
| 25+ User Stories | Sections 8.3–17.3 | Section 8 | Sections 8–17 (reframed as user requirements) |
| Business Rules | Sections 8.4–18.1 | — | Sections 8–17, 29–30 |
| Data Entities | Section 19 | — | Section 29 |
| Performance Targets | Section 20 | Section 10 | Section 32 |
| Security/Compliance | Sections 21–22 | Section 11 | Section 34 |
| Project Timeline | Section 28 | Section 13 | Section 35 |

### 2.3 Traceability Convention

Every user requirement in this document is tagged with:
- **UR-ID:** Unique identifier (e.g., UR-1.1, UR-2.3)
- **BRD Ref:** Linked user story (e.g., US-1.1)
- **RFP Ref:** Linked feature requirement (e.g., RFP-FR-8.1)
- **Priority:** P0 (Critical), P1 (High), P2 (Medium), P3 (Low)

---

## 3. Definitions & Acronyms

| Term | Definition |
|------|-----------|
| **Actor** | A user or external system that interacts with the website |
| **Critical Path** | The shortest sequence of user actions to complete a primary goal |
| **Edge Case** | An unusual or extreme user scenario that must be handled gracefully |
| **End-to-End Flow** | A complete user journey from entry to goal completion |
| **Happy Path** | The ideal, error-free sequence of user actions |
| **Information Scent** | Visual cues that help users find what they need |
| **Interaction Pattern** | A reusable solution to a common user interaction problem |
| **Micro-Interaction** | Small, functional animations that provide feedback |
| **Primary Actor** | The main user who initiates a use case |
| **Secondary Actor** | A user or system that supports the primary actor |
| **User Journey** | A visualization of the process a user goes through to achieve a goal |
| **Wireframe** | A low-fidelity visual guide representing page structure |

**Acronyms** (see BRD Appendix A for full technical glossary)

---

## 4. Reference Documents

| Document | Version | Location | Relationship |
|----------|---------|----------|--------------|
| TwinMOS Website BRD | 3.0 | `TwinMOS_Website_BRD.md` | Parent document — source of user stories and business rules |
| TwinMOS Website RFP | 3.0 | `TwinMOS_Website_RFP.md` | Procurement document — source of feature scope |
| **TwinMOS Website Content Map** | **1.0** | **`content/TwinMOS_Website_Content_Map.md`** | **Canonical content blueprint — 287 entries across 16 sections (NEW IN v3.0)** |
| **TwinMOS Master SKU Reference** | **1.0** | **`content/website-content/_master-sku-reference.md`** | **Canonical product registry (NEW IN v3.0)** |
| TwinMOS Forensic Audit (live site) | 1.0 | `TwinMOS_Website_Forensic_Audit.md` | Current-state problems driving user requirement priorities |
| TwinMOS Documents Forensic Alignment Audit | 2.0 | `TwinMOS_Documents_Forensic_Alignment_Audit_v2.md` | v2.0→v3.0 alignment findings (NEW IN v3.0) |
| TwinMOS Company Profile | 2.0 | `TwinMOS_Company_Profile_Comprehensive.md` | Corporate context for accurate content requirements |

### Source-Material Cross-Reference Key (from Content Map §0)

| Code | Source |
|------|--------|
| **CP** | TwinMOS Company Profile |
| **WC** | TwinMos Technologies Website Content (legacy draft) |
| **DDR** | A GUIDE BOOK ON ddr MEMORY |
| **AFR** | Africa expansion guides |
| **CTRY** | Country-wise distributor research |
| **EGY** | Egypt distributor target list |
| **MAR** | Morocco customer list |
| **AF2** | Africa region 2 customer list |
| **HPE** | STBL Bangladesh HPE-partner deck (reference only — NOT TwinMOS-branded) |
| **AUDIT** | Live-site Forensic Audit |
| **RFP** | TwinMOS Website RFP |
| **BRD** | TwinMOS Website BRD |
| **URD** | This document |
| **MAP** | Content Map (NEW IN v3.0) |
| **SKU** | Master SKU Reference (NEW IN v3.0) |

---

## 5. User Profiles & Personas

> **Synchronized with:** BRD Section 7, RFP Section 5

The following personas represent the primary user groups whose needs drive every requirement in this document. Each persona is tagged with the user stories they directly influence.

### 5.1 Persona 1: Enthusiast Gamer — "Rahul"

| Attribute | Detail |
|-----------|--------|
| **Demographics** | 22–30 years old, India, UAE, Saudi Arabia |
| **Technical Level** | High — builds own PCs, understands RAM timings, XMP/EXPO |
| **Primary Goals** | (G1) Find high-performance DDR5 RGB RAM; (G2) Verify motherboard compatibility; (G3) Find local retailer with stock |
| **Frustration Tolerance** | Medium — will tolerate complexity for depth, but expects speed |
| **Device Mix** | Mobile 60% (discovery), Desktop 40% (research/comparison) |
| **Peak Usage** | Evenings (7 PM–12 AM local), weekends |

**User Stories Directly Influenced:** US-1.1, US-1.2, US-1.3, US-1.4, US-2.2, US-2.3, US-3.1, US-3.2, US-8.1, US-8.2

**Critical Needs from User Perspective:**
- ⚡ **Speed:** Product pages must load in < 2 seconds — gamers abandon slow sites
- 🎨 **Visual Richness:** High-res product images, RGB showcase, build gallery
- 🔍 **Precision:** Exact specs (timings, voltage, XMP profiles) without digging
- 🛒 **Purchase Path:** Clear "Where to Buy" with India/local retailer info

### 5.2 Persona 2: System Integrator — "Kumar"

| Attribute | Detail |
|-----------|--------|
| **Demographics** | 35–50 years old, India, runs local PC assembly shop |
| **Technical Level** | High — understands QVL, bulk pricing, warranty terms |
| **Primary Goals** | (G1) Source reliable RAM/SSD in volume; (G2) Verify compatibility across motherboards; (G3) Request bulk pricing; (G4) Become authorized dealer |
| **Frustration Tolerance** | High — business-focused, willing to navigate complexity |
| **Device Mix** | Desktop 80%, Mobile 20% |
| **Peak Usage** | Business hours (10 AM–6 PM), weekdays |

**User Stories Directly Influenced:** US-1.3, US-1.5, US-2.2, US-3.3, US-4.2, US-7.1, US-7.2, US-7.3

**Critical Needs from User Perspective:**
- 📊 **Data Density:** Needs to see many specs at once — prefers tables over marketing copy
- 💰 **Pricing Visibility:** Bulk pricing and MOQ must be accessible (partner portal)
- 📄 **Documentation:** Datasheets, warranty terms, certification documents downloadable
- 🤝 **Partnership Path:** Clear "Become a Distributor" form with business-relevant fields

### 5.3 Persona 3: Enterprise Procurement — "Sarah"

| Attribute | Detail |
|-----------|--------|
| **Demographics** | 40–55 years old, UAE, Saudi Arabia, IT procurement manager |
| **Technical Level** | Medium — understands enterprise IT, less interested in gaming specs |
| **Primary Goals** | (G1) Evaluate company credibility; (G2) Find enterprise-grade products; (G3) Request volume quote; (G4) Verify certifications |
| **Frustration Tolerance** | Low — time-constrained, needs efficiency |
| **Device Mix** | Desktop 70%, Tablet 30% |
| **Peak Usage** | Business hours, often multi-tasking |

**User Stories Directly Influenced:** US-1.3, US-1.5, US-4.1, US-4.2, US-5.3, US-6.3

**Critical Needs from User Perspective:**
- 🏢 **Credibility Signals:** Accurate About Us, leadership info, Dubai HQ, certifications prominently displayed
- 📋 **Enterprise Filter:** Ability to filter for enterprise/IT products (non-gaming)
- ⏱️ **Efficiency:** Quick quote request form, minimal back-and-forth
- 📑 **Compliance:** Easy access to ISO, CE, RoHS documentation

### 5.4 Persona 4: Potential Distributor — "Mr. Patel"

| Attribute | Detail |
|-----------|--------|
| **Demographics** | 45–60 years old, India, Africa, CIS, distribution company owner |
| **Technical Level** | Medium — business-focused, evaluates brands holistically |
| **Primary Goals** | (G1) Assess brand strength; (G2) Review product portfolio depth; (G3) Apply for distributorship; (G4) Access partner resources |
| **Frustration Tolerance** | Low — first impression is everything; broken site = broken brand |
| **Device Mix** | Desktop 90%, Mobile 10% |
| **Peak Usage** | Business hours, often during trade show follow-up |

**User Stories Directly Influenced:** US-3.3, US-4.1, US-5.3, US-7.1, US-7.2, US-7.3

**Critical Needs from User Perspective:**
- 🏆 **Brand Proof:** Awards, certifications, global presence (93+ countries), leadership credibility
- 📦 **Portfolio Depth:** Complete product catalog demonstrating market coverage
- 📞 **Human Connection:** Easy contact with regional managers, not just forms
- 🔐 **Exclusive Access:** Partner portal with confidential pricing and co-branded assets

### 5.6–5.11 New Personas Added in v3.0

These six personas address content domains the v2.0 URD did not formally scope: Solutions verticals, Careers, Press Room, OEM/ODM partnerships.

#### 5.6 Persona 6: Embedded / Industrial Engineer — "Faisal"

| Attribute | Detail |
|-----------|--------|
| **Demographics** | 30–55, Middle East / India / SEA, light-industry / IoT / industrial-automation firms |
| **Technical Level** | High — designs embedded systems |
| **Primary Goals** | (G1) Source memory & storage with wide-temp operation; (G2) Long-term supply commitments; (G3) JEDEC and certification documentation |
| **Frustration Tolerance** | Low — already burned by tier-1 brands deprecating industrial SKUs |
| **Device Mix** | Desktop 90%, Mobile 10% |
| **Critical Needs:** Industrial SKU pages, MTBF data, wide-temperature specs, supply commitment statements, JEDEC compliance evidence |
| **Drives Section:** `/solutions/embedded-industrial/` |

#### 5.7 Persona 7: Government / Regulated Enterprise IT — "Ms. Tan"

| Attribute | Detail |
|-----------|--------|
| **Demographics** | 40–55, Telco / BFSI / Government IT in MEA, India, SEA |
| **Technical Level** | Medium — focused on procurement and compliance |
| **Primary Goals** | (G1) Verify all required compliance certifications; (G2) Review ESG disclosures; (G3) Confirm data-protection posture |
| **Frustration Tolerance** | Low — bureaucratic process; needs certificates upfront |
| **Device Mix** | Desktop 80%, Tablet 20% |
| **Critical Needs:** Compliance Hub, downloadable certificate PDFs, Modern Slavery / Conflict Minerals / Vendor Code of Conduct disclosures, Data Security & Data Integrity technology pages |
| **Drives Section:** `/solutions/telco-bfsi-government/` |

#### 5.8 Persona 8: Education IT Administrator — "Mr. Rahman"

| Attribute | Detail |
|-----------|--------|
| **Demographics** | 35–55, education-sector IT (universities, technical institutes, K-12 districts) |
| **Technical Level** | Medium — IT generalist with budget authority |
| **Primary Goals** | (G1) Bulk-upgrade student / lab / staff devices; (G2) Multi-year warranty for school assets; (G3) Educational pricing |
| **Frustration Tolerance** | Medium — patient with bureaucracy but needs clear path |
| **Device Mix** | Desktop 75%, Tablet 25% |
| **Critical Needs:** Education Solution page, bulk-quote workflow, Compatibility Finder for legacy school devices, warranty terms |
| **Drives Section:** `/solutions/education/` |

#### 5.9 Persona 9: OEM/ODM Partner — "Mr. Wong"

| Attribute | Detail |
|-----------|--------|
| **Demographics** | 40–60, OEM / ODM device manufacturer in Taiwan, China, India, SEA |
| **Technical Level** | High — engineering-led procurement |
| **Primary Goals** | (G1) Co-engineer or co-brand TwinMOS modules; (G2) Negotiate MOQ and supply terms; (G3) Access OEM-specific datasheets |
| **Frustration Tolerance** | Low — high-stakes business |
| **Device Mix** | Desktop 95%, Mobile 5% |
| **Critical Needs:** OEM/ODM Program page, NDA-protected commercial path, engineering-support contact, custom-spec capability disclosure |
| **Drives Section:** `/partners/oem-odm-program/` |

#### 5.10 Persona 10: Media / Industry Analyst — "Lina"

| Attribute | Detail |
|-----------|--------|
| **Demographics** | 28–45, technology journalist, industry analyst, reviewer, influencer |
| **Technical Level** | High — covers memory/storage industry |
| **Primary Goals** | (G1) Find latest press releases; (G2) Download brand assets; (G3) Reach executive contacts for interviews |
| **Frustration Tolerance** | Very Low — works on deadline |
| **Device Mix** | Desktop 70%, Mobile 30% |
| **Critical Needs:** Press Room with up-to-date press releases, Media Kit (logos, brand guidelines, executive headshots), Newsletter Archive, Media Coverage hub, dedicated press@twinmos.com contact |
| **Drives Section:** `/about/press/` |

#### 5.11 Persona 11: Job Applicant — "Sara"

| Attribute | Detail |
|-----------|--------|
| **Demographics** | 22–45, varied geography, varied technical backgrounds |
| **Technical Level** | Varies — generalist to senior engineer |
| **Primary Goals** | (G1) Browse open roles; (G2) Understand culture and benefits; (G3) Apply with minimal friction |
| **Frustration Tolerance** | Low — will abandon long, broken application forms |
| **Device Mix** | Mobile 60%, Desktop 40% |
| **Critical Needs:** Careers Hub, Life at TwinMOS, Benefits, Locations, Departments, Internships, role listings, simple application form, Job Applicant Privacy Notice, Careers FAQ |
| **Drives Section:** `/careers/` |

---

### 5.5 Persona 5: Laptop Upgrader — "Aisha"

| Attribute | Detail |
|-----------|--------|
| **Demographics** | 25–40 years old, Middle East, South Asia, non-technical consumer |
| **Technical Level** | Low — knows laptop is slow, doesn't understand DDR vs DDR4 |
| **Primary Goals** | (G1) Find compatible RAM/SSD for laptop; (G2) Understand installation; (G3) Buy from local store; (G4) Get help if needed |
| **Frustration Tolerance** | Very Low — easily confused by jargon, will abandon if overwhelmed |
| **Device Mix** | Mobile 80%, Desktop 20% |
| **Peak Usage** | Evenings, weekends, often after seeing an ad or recommendation |

**User Stories Directly Influenced:** US-1.1, US-2.1, US-3.1, US-3.2, US-4.1, US-6.3

**Critical Needs from User Perspective:**
- 🎯 **Simplicity:** "Enter your laptop model, we show you what works" — no jargon
- 📱 **Mobile-First:** Everything must work flawlessly on a 6-inch screen
- 🎥 **Guidance:** Video or simple step-by-step installation guides
- 🛡️ **Reassurance:** Clear warranty info, easy support contact, money-back confidence

---

## 6. User Classification & Roles

### 6.1 Anonymous Visitor (Unauthenticated)

| Attribute | Detail |
|-----------|--------|
| **Access Level** | Public — no login required |
| **Permissions** | Browse products, use compatibility finder, view where-to-buy, submit contact forms, read news, view gaming hub |
| **Primary Goal Patterns** | Product discovery, compatibility checking, finding retailers, general research |
| **Estimated Share of Traffic** | 85–90% |

### 6.2 Registered Product Owner

| Attribute | Detail |
|-----------|--------|
| **Access Level** | Light authentication — email-based |
| **Permissions** | All anonymous capabilities + warranty registration, RMA submission, firmware downloads, registered product dashboard |
| **Primary Goal Patterns** | Post-purchase support, warranty management, product updates |
| **Estimated Share of Traffic** | 5–8% |

### 6.3 Authorized Distributor (Partner Portal)

| Attribute | Detail |
|-----------|--------|
| **Access Level** | Secure authentication — invitation-only accounts |
| **Permissions** | All anonymous capabilities + partner portal access (price lists, marketing assets, co-branded materials) |
| **Primary Goal Patterns** | Download assets, check pricing, plan inventory, co-branding |
| **Estimated Share of Traffic** | < 1% |

### 6.4 CMS User (Internal)

| Attribute | Detail |
|-----------|--------|
| **Access Level** | Admin authentication — role-based |
| **Permissions** | Content management, product management, inquiry management, user management, analytics access |
| **Roles** | Admin, Editor, Author, Viewer |
| **Primary Goal Patterns** | Publish content, manage products, respond to inquiries, generate reports |

---

## 7. User Environment & Device Matrix

### 7.1 Device Breakdown by Persona

| Persona | Mobile | Tablet | Desktop | Primary Use Case |
|---------|--------|--------|---------|------------------|
| Rahul (Gamer) | 60% | 5% | 35% | Discovery → Research → Compare |
| Kumar (System Integrator) | 20% | 5% | 75% | Bulk research → Quote request |
| Sarah (Enterprise) | 15% | 30% | 55% | Credibility check → Quote request |
| Mr. Patel (Distributor) | 10% | 5% | 85% | Brand evaluation → Partnership |
| Aisha (Laptop Upgrader) | 80% | 10% | 10% | Simple search → Local purchase |

### 7.2 Browser & OS Distribution (Target Markets)

| Browser | Share | Priority |
|---------|-------|----------|
| Chrome (Desktop + Mobile) | 65% | P0 — primary test target |
| Safari (iOS + macOS) | 18% | P0 — critical for mobile |
| Samsung Internet | 8% | P1 — significant in MEA/Asia |
| Firefox | 5% | P1 |
| Edge | 3% | P2 |
| Opera/UC Browser | 1% | P2 — notable in some regions |

| Operating System | Share | Priority |
|-----------------|-------|----------|
| Android | 55% | P0 |
| Windows | 25% | P0 |
| iOS | 15% | P0 |
| macOS | 4% | P1 |
| Linux | 1% | P2 |

### 7.3 Network Conditions by Region

| Region | Typical Connection | Latency to Nearest CDN | Design Implication |
|--------|-------------------|------------------------|-------------------|
| UAE / GCC | 4G/5G, Fiber | < 30ms | Full experience, rich media |
| India (Tier 1) | 4G, Fiber | < 50ms | Full experience, compressed images |
| India (Tier 2/3) | 4G, DSL | 50–120ms | Aggressive lazy loading, image optimization |
| Africa | 3G/4G, variable | 100–250ms | Lightweight pages, minimal JS, fast LCP |
| CIS / Eastern Europe | Broadband, 4G | 50–100ms | Standard optimization |

### 7.4 Accessibility Context

| Consideration | Requirement |
|--------------|-------------|
| **Screen Readers** | NVDA, JAWS, VoiceOver, TalkBack |
| **Keyboard-Only Users** | Full site navigable without mouse |
| **Color Blindness** | Information never conveyed by color alone |
| **Motor Impairments** | Large touch targets (min 44×44px), generous spacing |
| **Cognitive Load** | Clear language, consistent patterns, error prevention |
| **Low Vision** | Text resizable to 200% without horizontal scroll |

---


## 8. UR-Epic 1: Product Discovery & Catalog

> **BRD Ref:** Epic 1 (Section 8) — US-1.1 through US-1.5  
> **RFP Ref:** Section 8.1 (Product Catalog & Discovery)  
> **Primary Actors:** Rahul (Gamer), Kumar (System Integrator), Sarah (Enterprise), Aisha (Laptop Upgrader)  
> **Priority:** P0

### 8.1 User Goal Statement

> **As a website visitor, I want to discover, explore, compare, and evaluate TwinMOS products so that I can make an informed purchase or procurement decision.**

### 8.2 User Requirements

#### UR-1.1: Browse Product Categories

| Attribute | Detail |
|-----------|--------|
| **UR-ID** | UR-1.1 |
| **BRD Ref** | US-1.1 |
| **RFP Ref** | RFP-FR-8.1 (Product Listing with Filters) |
| **Priority** | P0 |
| **Primary Actor** | All personas |
| **User Goal** | Quickly navigate to the product type I'm looking for |

**User Scenario:**
Aisha's laptop is running slowly. She opens twinmos.com on her phone and wants to find laptop RAM. She expects to see clear categories like "Memory," "SSD," and "Portable Storage" right away.

**User Requirements:**
- [ ] **UR-1.1.1** — Category navigation must be visible in the main header menu on every page
- [ ] **UR-1.1.2** — Homepage must display category cards/icons linking to major categories
- [ ] **UR-1.1.3** — Category names must use plain language: "Memory (RAM)," "Solid State Drives (SSD)," "Portable Storage," "USB Flash Drives"
- [ ] **UR-1.1.4** — Hover/tap on "Memory" must reveal sub-menu: DDR5 Desktop, DDR5 Laptop, DDR4 Desktop, DDR4 Laptop, DDR3
- [ ] **UR-1.1.5** — Category pages must load in < 1.5 seconds (perceived instant on fast connections)
- [ ] **UR-1.1.6** — Each category page must show a breadcrumb: Home > Products > Memory > DDR5 Desktop
- [ ] **UR-1.1.7** — Empty categories must not be shown; if DDR3 has no active products, hide it

**User Acceptance Criteria (from BRD, verbatim):**
- [ ] Category navigation is visible in main menu and homepage
- [ ] Categories include: Memory (DDR3/DDR4/DDR5, Desktop/Laptop), SSD (NVMe Gen 3/4/5, SATA), Portable Storage, USB Flash, Accessories
- [ ] Each category page shows sub-categories as clickable cards
- [ ] Category pages load in < 1.5 seconds
- [ ] Category pages are SEO-optimized with unique titles and meta descriptions

---

#### UR-1.2: Filter and Sort Products

| Attribute | Detail |
|-----------|--------|
| **UR-ID** | UR-1.2 |
| **BRD Ref** | US-1.2 |
| **RFP Ref** | RFP-FR-8.1 (Product Listing with Filters) |
| **Priority** | P0 |
| **Primary Actor** | Rahul (Gamer), Kumar (System Integrator) |
| **User Goal** | Narrow down products to match my exact needs |

**User Scenario:**
Rahul is looking for DDR5 RAM for his gaming PC. He needs 32GB, RGB lighting, and speeds of 5600MHz+. He expects to click checkboxes and see results update instantly without waiting for page reloads.

**User Requirements:**
- [ ] **UR-1.2.1** — Filter panel must be visible on the left on desktop, collapsible drawer on mobile
- [ ] **UR-1.2.2** — Filters must update product grid instantly (AJAX) with smooth transition animation
- [ ] **UR-1.2.3** — Active filters must be shown as removable pills/tags at the top of results
- [ ] **UR-1.2.4** — "Clear All" button must be one tap/click away
- [ ] **UR-1.2.5** — URL must update to reflect active filters so users can share or bookmark filtered views
- [ ] **UR-1.2.6** — Product count must update in real time (e.g., "Showing 12 of 47 products")
- [ ] **UR-1.2.7** — Memory filter options must include: Type (DDR3/DDR4/DDR5), Capacity (4GB–64GB), Speed (1333MHz–6000MHz), Form Factor (UDIMM/SODIMM), RGB (Yes/No)
- [ ] **UR-1.2.8** — SSD filter options must include: Interface (SATA/NVMe), Generation (Gen 3/4/5), Capacity (128GB–4TB), Form Factor (2.5"/M.2 2280)
- [ ] **UR-1.2.9** — Sort options must include: Relevance, Name (A–Z), Price (Low–High), Capacity (Low–High), Speed (High–Low)
- [ ] **UR-1.2.10** — On mobile, filter panel must open as bottom sheet (not new page) to preserve context

**User Acceptance Criteria (from BRD, verbatim):**
- [ ] Filter sidebar/panel available on all category pages
- [ ] Memory filters: Type (DDR3/DDR4/DDR5), Capacity (4GB–64GB), Speed (1333MHz–6000MHz), Form Factor (UDIMM/SODIMM), RGB (Yes/No)
- [ ] SSD filters: Interface (SATA/NVMe), Generation (Gen 3/4/5), Capacity (128GB–4TB), Form Factor (2.5"/M.2 2280)
- [ ] Filters update results instantly (AJAX) without full page reload
- [ ] Active filters are shown as removable tags
- [ ] Sort options: Relevance, Price (Low–High), Capacity (Low–High), Speed (High–Low)
- [ ] Filter state is reflected in URL for shareability

---

#### UR-1.3: View Product Detail Page

| Attribute | Detail |
|-----------|--------|
| **UR-ID** | UR-1.3 |
| **BRD Ref** | US-1.3 |
| **RFP Ref** | RFP-FR-8.1 (Product Detail Page template) |
| **Priority** | P0 |
| **Primary Actor** | All personas |
| **User Goal** | Understand everything about a product to evaluate if it meets my needs |

**User Scenario:**
Kumar is evaluating the VOLTX RGB DDR5-6000 for a customer build. He needs to see: full specs, warranty, whether it's in stock locally, and a datasheet he can send to his customer. He expects all of this on one page without scrolling endlessly.

**User Requirements:**
- [ ] **UR-1.3.1** — Above the fold (first viewport) must show: product name, hero image, key specs summary, "Where to Buy" CTA, warranty badge
- [ ] **UR-1.3.2** — Image gallery must support: swipe on mobile, click-to-zoom on desktop, thumbnail navigation
- [ ] **UR-1.3.3** — Minimum 3 product images per product: hero shot, angle shot, detail/feature shot
- [ ] **UR-1.3.4** — Spec table must be organized by category: General, Performance, Physical, Compatibility, Warranty
- [ ] **UR-1.3.5** — "Key Features" must be displayed as scannable bullet points, not paragraphs
- [ ] **UR-1.3.6** — Warranty information must be prominent (badge/icon with duration)
- [ ] **UR-1.3.7** — "Where to Buy" button must be visible without scrolling on desktop; sticky on mobile
- [ ] **UR-1.3.8** — Related products must show 3–4 items from same category with similar specs
- [ ] **UR-1.3.9** — Social sharing must allow one-click share to WhatsApp, Twitter/X, Facebook, email
- [ ] **UR-1.3.10** — Page must load in < 2.0 seconds; above-the-fold content in < 1.0 second

**User Acceptance Criteria (from BRD, verbatim):**
- [ ] Product detail page includes: Hero image, product name, model number, short description, full spec table
- [ ] Spec table includes all relevant fields (see business rules)
- [ ] Image gallery with zoom capability; minimum 3 images per product
- [ ] Key features listed as bullet points
- [ ] Warranty information displayed prominently
- [ ] "Where to Buy" CTA visible above the fold
- [ ] Related products section (same category, similar specs)
- [ ] Social sharing buttons
- [ ] Page loads in < 2.0 seconds

---

#### UR-1.4: Compare Products

| Attribute | Detail |
|-----------|--------|
| **UR-ID** | UR-1.4 |
| **BRD Ref** | US-1.4 |
| **RFP Ref** | RFP-FR-8.1 (Product Comparison Tool) |
| **Priority** | P1 |
| **Primary Actor** | Rahul (Gamer), Kumar (System Integrator) |
| **User Goal** | See differences between products at a glance |

**User Scenario:**
Rahul is deciding between VOLTX RGB DDR5-5600 and DDR5-6000. He wants to add both to a comparison and see exactly which specs differ, highlighted in color.

**User Requirements:**
- [ ] **UR-1.4.1** — "Add to Compare" checkbox must be visible on category grid and product detail page
- [ ] **UR-1.4.2** — User must be able to compare up to 4 products simultaneously
- [ ] **UR-1.4.3** — Comparison table must show products in columns, specs in rows
- [ ] **UR-1.4.4** — Differing values must be highlighted (color or bold) for instant recognition
- [ ] **UR-1.4.5** — Empty/dash cells must be clearly distinguishable from zero values
- [ ] **UR-1.4.6** — Compare list must persist across session (localStorage) and across page navigation
- [ ] **UR-1.4.7** — User must be able to remove individual products or clear all
- [ ] **UR-1.4.8** — Comparison page must be printable with clean formatting
- [ ] **UR-1.4.9** — Comparison must be shareable via URL (deep link with product IDs)

**User Acceptance Criteria (from BRD, verbatim):**
- [ ] "Add to Compare" checkbox/button on category and product pages
- [ ] Comparison page shows products in columns with specs in rows
- [ ] Highlighted differences (cells with different values highlighted)
- [ ] Ability to remove products from comparison
- [ ] "Add to Compare" persists across session (localStorage)
- [ ] Comparison page is printable
- [ ] Comparison page is shareable via URL

---

#### UR-1.5: Download Product Datasheet

| Attribute | Detail |
|-----------|--------|
| **UR-ID** | UR-1.5 |
| **BRD Ref** | US-1.5 |
| **RFP Ref** | — |
| **Priority** | P1 |
| **Primary Actor** | Kumar (System Integrator), Sarah (Enterprise) |
| **User Goal** | Obtain a professional document I can share with clients or include in procurement |

**User Requirements:**
- [ ] **UR-1.5.1** — "Download Datasheet" button must be prominent on every product detail page
- [ ] **UR-1.5.2** — PDF must open in a new tab or download directly based on browser preference
- [ ] **UR-1.5.3** — File size must be < 2MB for fast download on slower connections
- [ ] **UR-1.5.4** — PDF must include: Product image, full specifications, features list, warranty info, certifications, part number/SKU
- [ ] **UR-1.5.5** — PDF must be professionally designed with TwinMOS branding
- [ ] **UR-1.5.6** — Download must work on mobile (saves to device or cloud storage)

---

### 8.3 User-Facing Business Rules

| Rule ID | User Impact |
|---------|------------|
| BR-1.1 (Unique SKU) | Users see consistent, unambiguous product identifiers |
| BR-1.4 (Discontinued) | Users see "Discontinued" badge; product is findable but clearly marked |
| BR-1.5 (New Badge) | Users see "New" badge on recently launched products for 90 days |
| BR-GLOBAL-4 (WebP Images) | Users get fast-loading, high-quality images with JPEG fallback |
| BR-GLOBAL-8 (New Badge Auto) | Users automatically see "New" without manual CMS action |

---

## 9. UR-Epic 2: System Compatibility Finder

> **BRD Ref:** Epic 2 (Section 9) — US-2.1 through US-2.3  
> **RFP Ref:** Section 8.2 (System Compatibility Finder)  
> **Primary Actors:** Aisha (Laptop Upgrader), Rahul (Gamer), Kumar (System Integrator)  
> **Priority:** P0 — Critical Competitive Gap

### 9.1 User Goal Statement

> **As a computer owner or PC builder, I want to find TwinMOS products that are guaranteed to work with my specific device or motherboard so that I can buy with confidence and avoid returns.**

### 9.2 User Requirements

#### UR-2.1: Search by Laptop/Desktop Model

| Attribute | Detail |
|-----------|--------|
| **UR-ID** | UR-2.1 |
| **BRD Ref** | US-2.1 |
| **RFP Ref** | RFP-FR-8.2 (RAM Compatibility by Device) |
| **Priority** | P0 |
| **Primary Actor** | Aisha (Laptop Upgrader), general consumers |
| **User Goal** | Enter my computer model and see compatible upgrades |

**User Scenario:**
Aisha has a Dell Inspiron 15 3520. She types "Dell" in the brand dropdown, then starts typing "Inspiron" and sees suggestions appear. She selects her model and sees: "Your laptop supports up to 16GB DDR4-3200 SO-DIMM." Below that, she sees 2 compatible TwinMOS products with images, prices (if available), and "View Product" buttons.

**User Requirements:**
- [ ] **UR-2.1.1** — Search interface must be the most prominent element on the `/compatibility-finder/` page
- [ ] **UR-2.1.2** — Brand must be a dropdown (Dell, HP, Lenovo, ASUS, Acer, Apple, MSI, etc.) — no free-text brand entry
- [ ] **UR-2.1.3** — Model input must show auto-suggestions after 2 characters with Algolia/Elasticsearch
- [ ] **UR-2.1.4** — Results must appear without full page reload (smooth transition)
- [ ] **UR-2.1.5** — Results must group products by category: "Compatible RAM" and "Compatible SSD"
- [ ] **UR-2.1.6** — Each result must show: product image, name, key specs, "View Product" link
- [ ] **UR-2.1.7** — Results must display maximum supported capacity and speed for the device
- [ ] **UR-2.1.8** — If no compatible products exist, show: "We don't have compatible products listed yet. Contact support for assistance." + link to contact form
- [ ] **UR-2.1.9** — Mobile experience must use native-friendly inputs (large tap targets, numeric keypad for model numbers if applicable)
- [ ] **UR-2.1.10** — Search must be SEO-optimized for queries like "[model] RAM upgrade"

**User Acceptance Criteria (from BRD, verbatim):**
- [ ] Search interface accepts: Brand dropdown + Model text input
- [ ] Auto-suggest model names as user types (powered by Algolia/Elasticsearch)
- [ ] Results page shows compatible products grouped by category (RAM, SSD)
- [ ] Each result shows: Product image, name, key specs, "View Product" link
- [ ] Results include maximum supported capacity and speed for the device
- [ ] Search works on mobile with native-friendly inputs
- [ ] Search page is SEO-optimized for "[model] RAM upgrade" queries

---

#### UR-2.2: Search by Motherboard Model

| Attribute | Detail |
|-----------|--------|
| **UR-ID** | UR-2.2 |
| **BRD Ref** | US-2.2 |
| **RFP Ref** | RFP-FR-8.2 (Motherboard QVL Integration) |
| **Priority** | P0 |
| **Primary Actor** | Rahul (Gamer), Kumar (System Integrator) |
| **User Goal** | Verify that a specific RAM kit works with my motherboard and supports XMP/EXPO |

**User Scenario:**
Rahul has an ASUS ROG STRIX Z790-E motherboard. He types it into the motherboard search field. He sees: "QVL Verified" badge next to VOLTX RGB DDR5-6000. He also sees the tested speed (6000MHz) and a note that XMP 3.0 is supported.

**User Requirements:**
- [ ] **UR-2.2.1** — Search must accept motherboard brand + model free-text input with auto-suggest
- [ ] **UR-2.2.2** — Results must show explicit QVL status: "QVL Verified," "Tested by TwinMOS," or "Not Verified"
- [ ] **UR-2.2.3** — Results must indicate supported speeds and max capacity for the motherboard
- [ ] **UR-2.2.4** — XMP/EXPO profile compatibility must be displayed as badges
- [ ] **UR-2.2.5** — Link to motherboard manufacturer's QVL page must be provided where available
- [ ] **UR-2.2.6** — "Not Verified" must not mean "Incompatible" — messaging must be reassuring, not alarming

**User Acceptance Criteria (from BRD, verbatim):**
- [ ] Search accepts motherboard brand + model (e.g., "ASUS ROG STRIX Z790-E")
- [ ] Results show RAM products with explicit QVL (Qualified Vendor List) status
- [ ] Results indicate supported speeds and capacities for the motherboard
- [ ] XMP/EXPO profile compatibility is displayed
- [ ] Link to motherboard manufacturer's QVL page provided where available

---

#### UR-2.3: Browse Compatible Systems from Product Page

| Attribute | Detail |
|-----------|--------|
| **UR-ID** | UR-2.3 |
| **BRD Ref** | US-2.3 |
| **RFP Ref** | — |
| **Priority** | P1 |
| **Primary Actor** | Rahul (Gamer) |
| **User Goal** | Confirm a specific product works with my setup before buying |

**User Requirements:**
- [ ] **UR-2.3.1** — Product detail page must include a "Compatible Systems" tab/section
- [ ] **UR-2.3.2** — List must show motherboard brand, model, and verified speed
- [ ] **UR-2.3.3** — Long lists (50+ items) must be paginated or virtual-scrolled
- [ ] **UR-2.3.4** — User must be able to search within the compatible systems list
- [ ] **UR-2.3.5** — Last verified date must be shown to indicate data freshness

---

### 9.3 User-Facing Business Rules

| Rule ID | User Impact |
|---------|------------|
| BR-2.1 (Lab Verification) | Users see only verified compatibility data, building trust |
| BR-2.2 (Not Verified ≠ Incompatible) | Users are not misled into thinking a product won't work |
| BR-2.4 (Search Performance) | Users get results in < 2 seconds — fast enough to maintain engagement |

---

## 10. UR-Epic 3: Where to Buy / Distributor Locator

> **BRD Ref:** Epic 3 (Section 10) — US-3.1 through US-3.3  
> **RFP Ref:** Section 8.3 (Where to Buy / Distributor Locator)  
> **Primary Actors:** Aisha (Laptop Upgrader), Rahul (Gamer), Mr. Patel (Distributor)  
> **Priority:** P0

### 10.1 User Goal Statement

> **As a potential buyer, I want to find authorized TwinMOS retailers or distributors near me so that I can purchase products with confidence and local support.**

### 10.2 User Requirements

#### UR-3.1: Find Local Retailers by Country

| Attribute | Detail |
|-----------|--------|
| **UR-ID** | UR-3.1 |
| **BRD Ref** | US-3.1 |
| **RFP Ref** | RFP-FR-8.3 (Map-Based Locator, Country Selector) |
| **Priority** | P0 |
| **Primary Actor** | Aisha (Laptop Upgrader), Rahul (Gamer) |
| **User Goal** | See stores in my country on a map or in a list |

**User Scenario:**

**User Requirements:**
- [ ] **UR-3.1.1** — Page must auto-detect user's country via IP geolocation with a visible "Detected: India — Not correct? Change" option
- [ ] **UR-3.1.2** — Interactive map (Google Maps or Mapbox) must show retailer pins with clustering for dense areas
- [ ] **UR-3.1.3** — Clicking a map pin must show a card with: store name, address, phone, website link, distance
- [ ] **UR-3.1.4** — List view must be sortable by distance (if location permission granted) or alphabetically
- [ ] **UR-3.1.5** — Filter by retailer type must be available: Online Store, Physical Store, Distributor, System Builder
- [ ] **UR-3.1.8** — Each retailer must show which product categories they carry (icons or tags)
- [ ] **UR-3.1.9** — "No retailers in your country" must show: "Contact us to find a distributor" with link to distributor inquiry form
- [ ] **UR-3.1.10** — Map must be usable on mobile (gesture-friendly, not too dense)

**User Acceptance Criteria (from BRD, verbatim):**
- [ ] Page auto-detects user's country via IP geolocation (with manual override)
- [ ] Results shown on interactive map and list view
- [ ] List view shows: Store name, address, phone, website link, distance
- [ ] Filter by retailer type: Online Store, Physical Store, Distributor, System Builder
- [ ] Each retailer shows which product categories they carry

---

#### UR-3.2: Find Online Purchase Links

| Attribute | Detail |
|-----------|--------|
| **UR-ID** | UR-3.2 |
| **BRD Ref** | US-3.2 |
| **RFP Ref** | RFP-FR-8.3 (Online Store Deep Links) |
| **Priority** | P1 |
| **Primary Actor** | Aisha (Laptop Upgrader), Rahul (Gamer) |
| **User Goal** | Click directly to product pages on my preferred e-commerce site |

**User Requirements:**
- [ ] **UR-3.2.1** — "Buy Online" section must be visible on every product detail page
- [ ] **UR-3.2.2** — Retailer logos must be displayed (Amazon, Flipkart, local e-commerce)
- [ ] **UR-3.2.3** — Deep links must go directly to the product page on the partner site, not just the homepage
- [ ] **UR-3.2.4** — Links must open in a new tab so the user doesn't lose their place on twinmos.com
- [ ] **UR-3.2.5** — Section must be country-aware: Indian users see Flipkart/Amazon.in; UAE users see local retailers
- [ ] **UR-3.2.6** — "Out of stock" or "Not available online in your country" must be clearly communicated

**User Acceptance Criteria (from BRD, verbatim):**
- [ ] Product detail page includes "Buy Online" section with retailer logos
- [ ] Deep links to specific product pages on partner sites where available
- [ ] Links open in new tab
- [ ] Affiliate tracking parameters included where applicable (Phase 2)
- [ ] "Buy Online" section is country-aware (shows relevant retailers)

---

#### UR-3.3: Become a Distributor Inquiry

| Attribute | Detail |
|-----------|--------|
| **UR-ID** | UR-3.3 |
| **BRD Ref** | US-3.3 |
| **RFP Ref** | — |
| **Priority** | P0 |
| **Primary Actor** | Mr. Patel (Potential Distributor), Kumar (System Integrator) |
| **User Goal** | Submit a professional inquiry to explore partnership opportunities |

**User Scenario:**
Mr. Patel runs a distribution company in Kenya. He visits the Partners page and clicks "Become a Distributor." He fills in his company details and expects a professional confirmation email within minutes, with a clear timeline for next steps.

**User Requirements:**
- [ ] **UR-3.3.1** — "Become a Distributor" link must be accessible from: footer, `/partners/` page, `/where-to-buy/` page
- [ ] **UR-3.3.2** — Form must include: Company Name, Country, Contact Name, Email, Phone, Website (optional), Years in Business, Current Brands Distributed, Estimated Monthly Volume, Message
- [ ] **UR-3.3.3** — Form must validate email format in real time (green checkmark or red error before submission)
- [ ] **UR-3.3.4** — Submit button must be disabled until all required fields are valid
- [ ] **UR-3.3.5** — After submission, user must see a success page with: "Thank you. We'll respond within 48 hours."
- [ ] **UR-3.3.6** — Auto-reply email must include: confirmation of submission, expected response time (48 hours), contact email for follow-up
- [ ] **UR-3.3.7** — Form must be protected by reCAPTCHA (invisible to user unless triggered)

**User Acceptance Criteria (from BRD, verbatim):**
- [ ] "Become a Distributor" form accessible from footer, partner page, and Where to Buy page
- [ ] Form fields: Company name, country, contact name, email, phone, website, years in business, current brands distributed, estimated monthly volume, message
- [ ] Form validates email format and required fields
- [ ] Submission sends notification to sales@twinmos.com and regional manager
- [ ] Auto-reply confirmation email to submitter with expected response time (48 hours)
- [ ] Submissions stored in CMS/database with status tracking (New, Contacted, Qualified, Rejected)

---

### 10.3 User-Facing Business Rules

| Rule ID | User Impact |
|---------|------------|
| BR-3.1 (Authorized Only) | Users see only verified, legitimate retailers |
| BR-3.4 (No Grey Market) | Users are protected from counterfeit or unauthorized sellers |

---

## 11. UR-Epic 4: Lead Generation & Contact Management

> **BRD Ref:** Epic 4 (Section 11) — US-4.1 through US-4.4  
> **RFP Ref:** Section 8.4 (Support & Self-Service — Contact forms)  
> **Primary Actors:** All personas (especially Sarah, Mr. Patel, Kumar)  
> **Priority:** P0

### 11.1 User Goal Statement

> **As a website visitor with a question, need, or opportunity, I want to reach TwinMOS easily and receive a timely, professional response so that I feel valued and heard.**

### 11.2 User Requirements

#### UR-4.1: Submit General Inquiry

| Attribute | Detail |
|-----------|--------|
| **UR-ID** | UR-4.1 |
| **BRD Ref** | US-4.1 |
| **RFP Ref** | RFP-FR-8.4 (Contact Support Form) |
| **Priority** | P0 |
| **Primary Actor** | All personas |
| **User Goal** | Ask a question and get a response |

**User Scenario:**
Aisha has a question about warranty coverage. She clicks "Contact" in the header, selects "Technical Support" from the subject dropdown, types her question, and submits. Within 5 minutes, she receives an email confirming her inquiry with a ticket number.

**User Requirements:**
- [ ] **UR-4.1.1** — "Contact" or "Support" must be in the main navigation on every page
- [ ] **UR-4.1.2** — Form must include: Name, Email, Country, Subject (dropdown), Message, reCAPTCHA
- [ ] **UR-4.1.3** — Subject dropdown must include: General Inquiry, Product Question, Technical Support, Sales, Partnership, Media
- [ ] **UR-4.1.4** — Subject selection must optionally reveal contextual help (e.g., selecting "Technical Support" shows a link to the Knowledge Base)
- [ ] **UR-4.1.5** — Form must validate in real time (inline error messages, not just on submit)
- [ ] **UR-4.1.6** — Submit button must show loading state during submission
- [ ] **UR-4.1.7** — Success state must show: ticket number, confirmation message, expected response time
- [ ] **UR-4.1.8** — Auto-reply email must arrive within 5 minutes with ticket number and expected response time

**User Acceptance Criteria (from BRD, verbatim):**
- [ ] Contact form accessible from main navigation and footer
- [ ] Fields: Name, Email, Country, Subject (dropdown), Message, reCAPTCHA
- [ ] Subject options: General Inquiry, Product Question, Technical Support, Sales, Partnership, Media
- [ ] Form routes to appropriate email based on subject selection
- [ ] Auto-reply confirmation within 5 minutes
- [ ] Submission stored in database with ticket number

---

#### UR-4.2: Request Bulk/Enterprise Quote

| Attribute | Detail |
|-----------|--------|
| **UR-ID** | UR-4.2 |
| **BRD Ref** | US-4.2 |
| **RFP Ref** | — |
| **Priority** | P0 |
| **Primary Actor** | Sarah (Enterprise), Kumar (System Integrator) |
| **User Goal** | Request volume pricing with minimal friction |

**User Requirements:**
- [ ] **UR-4.2.1** — "Request a Quote" must be accessible from: product pages (bulk pricing CTA), footer, contact page
- [ ] **UR-4.2.2** — Form must include: Company, Contact Name, Email, Phone, Country, Product Interest, Quantity, Target Price (optional), Delivery Timeline, Message
- [ ] **UR-4.2.3** — File upload must accept RFP/RFQ documents (optional, max 10MB, PDF/DOC/XLS)
- [ ] **UR-4.2.4** — Form must clearly indicate which fields are required vs. optional
- [ ] **UR-4.2.5** — Success message must emphasize priority handling: "Your quote request has been flagged for priority response."
- [ ] **UR-4.2.6** — Auto-reply must state: "We respond to quote requests within 24 business hours."

**User Acceptance Criteria (from BRD, verbatim):**
- [ ] "Request a Quote" form with fields: Company, Contact Name, Email, Phone, Country, Product Interest, Quantity, Target Price (optional), Delivery Timeline, Message
- [ ] File upload for RFP documents (optional, max 10MB)
- [ ] Routes to sales@twinmos.com with high-priority flag
- [ ] Auto-reply with expected response time (24 hours for quotes)

---

#### UR-4.3: Subscribe to Newsletter

| Attribute | Detail |
|-----------|--------|
| **UR-ID** | UR-4.3 |
| **BRD Ref** | US-4.3 |
| **RFP Ref** | — |
| **Priority** | P1 |
| **Primary Actor** | Rahul (Gamer), general visitors |
| **User Goal** | Stay informed about new products and promotions |

**User Requirements:**
- [ ] **UR-4.3.1** — Newsletter signup must be in footer on every page
- [ ] **UR-4.3.2** — Signup must require minimal friction: Email + optional Country + optional Product Interests checkboxes
- [ ] **UR-4.3.3** — Double opt-in: confirmation email with "Verify Subscription" link must be sent
- [ ] **UR-4.3.4** — Success message must confirm: "Check your email to confirm subscription"
- [ ] **UR-4.3.5** — Every newsletter must include one-click unsubscribe link
- [ ] **UR-4.3.6** — GDPR: EU users must see consent checkbox before signup

**User Acceptance Criteria (from BRD, verbatim):**
- [ ] Newsletter signup form in footer and on news pages
- [ ] Fields: Email, Country (optional), Product Interests (checkboxes)
- [ ] Double opt-in confirmation email
- [ ] GDPR-compliant unsubscribe link in every email
- [ ] Integration with email marketing platform (Mailchimp/SendGrid)

---

#### UR-4.4: Live Chat Support

| Attribute | Detail |
|-----------|--------|
| **UR-ID** | UR-4.4 |
| **BRD Ref** | US-4.4 |
| **RFP Ref** | RFP-FR-8.4 (Live Chat) |
| **Priority** | P2 |
| **Primary Actor** | All personas |
| **User Goal** | Get immediate help for a quick question |

**User Requirements:**
- [ ] **UR-4.4.1** — Chat widget must be visible bottom-right on all pages
- [ ] **UR-4.4.2** — Widget must show current status: "Online — We're here to help" or "Offline — Leave a message"
- [ ] **UR-4.4.3** — Business hours must be displayed (Dubai timezone: Sun–Thu, 9 AM–6 PM GST)
- [ ] **UR-4.4.4** — Offline mode must capture: Name, Email, Message with promise of email response
- [ ] **UR-4.4.5** — Chat transcript must be emailed to visitor after session ends
- [ ] **UR-4.4.6** — Widget must be dismissible without blocking content
- [ ] **UR-4.4.7** — Widget must not auto-open or play sounds without user interaction (accessibility)

**User Acceptance Criteria (from BRD, verbatim):**
- [ ] Chat widget visible on all pages (bottom-right)
- [ ] Business hours display (based on Dubai timezone)
- [ ] Offline mode captures email for follow-up
- [ ] Chat transcripts emailed to visitor
- [ ] Integration with support ticket system

---

### 11.3 User-Facing Business Rules

| Rule ID | User Impact |
|---------|------------|
| BR-4.1 (5-Min Auto-Reply) | Users receive immediate confirmation, reducing anxiety |
| BR-4.2–BR-4.4 (SLA) | Users have clear expectations for response times |
| BR-4.5 (Double Opt-In) | Users only receive emails they explicitly requested |
| BR-4.6 (GDPR/UAE/India) | Users see transparent consent management |
| BR-GLOBAL-5 (EU Consent) | EU users see explicit consent checkbox on all forms |
| BR-GLOBAL-10 (Unsubscribe) | Users can always unsubscribe from communications |

---

## 12. UR-Epic 5: Content Management

> **BRD Ref:** Epic 5 (Section 12) — US-5.1 through US-5.3  
> **RFP Ref:** Section 8.5 (News, Events & Content)  
> **Primary Actors:** All personas (content consumers)  
> **Priority:** P0

### 12.1 User Goal Statement

> **As a website visitor, I want to read news, learn about events, and see awards so that I can trust TwinMOS as an active, credible, and accomplished brand.**

### 12.2 User Requirements

#### UR-5.1: Read News Articles

| Attribute | Detail |
|-----------|--------|
| **UR-ID** | UR-5.1 |
| **BRD Ref** | US-5.1 (reframed for reader perspective) |
| **RFP Ref** | RFP-FR-8.5 (News & Press Releases) |
| **Priority** | P0 |
| **Primary Actor** | All personas, especially distributors evaluating brand activity |
| **User Goal** | Stay informed about TwinMOS products, events, and partnerships |

**User Scenario:**
Mr. Patel is evaluating TwinMOS as a distribution partner. He visits the News page to see how active the company is. He expects to see a chronological feed with clear categories, professional images, and readable articles.

**User Requirements:**
- [ ] **UR-5.1.1** — News page must show articles in reverse chronological order (newest first)
- [ ] **UR-5.1.2** — Category filters must be visible: Product Launch, Event, Award, Partnership, Press Release, Company News
- [ ] **UR-5.1.3** — Each article card must show: featured image, title, excerpt (2 lines), date, category tag
- [ ] **UR-5.1.4** — Clicking an article must navigate to a clean, readable article page
- [ ] **UR-5.1.5** — Article page must include: title, author, publish date, category, featured image, body text, social sharing, related articles
- [ ] **UR-5.1.6** — Images within articles must be zoomable (lightbox) on click
- [ ] **UR-5.1.7** — Videos must be embeddable (YouTube/Vimeo) with responsive sizing
- [ ] **UR-5.1.8** — Article page must load in < 2 seconds

---

#### UR-5.2: View Event Pages

| Attribute | Detail |
|-----------|--------|
| **UR-ID** | UR-5.2 |
| **BRD Ref** | US-5.2 |
| **RFP Ref** | RFP-FR-8.5 (Event Showcase) |
| **Priority** | P1 |
| **Primary Actor** | Rahul (Gamer), distributors, press |
| **User Goal** | Learn about TwinMOS presence at trade shows and events |

**User Requirements:**
- [ ] **UR-5.2.1** — Event page must show: event name, date, location, booth number, description
- [ ] **UR-5.2.2** — Photo gallery must support lightbox viewing with prev/next navigation
- [ ] **UR-5.2.3** — Video embeds must be responsive and not auto-play
- [ ] **UR-5.2.4** — Product showcase section must link to featured products
- [ ] **UR-5.2.5** — Past events must be archived and browsable by year
- [ ] **UR-5.2.6** — "Contact us at the event" CTA must be visible for upcoming events

---

#### UR-5.3: View Awards & Certifications

| Attribute | Detail |
|-----------|--------|
| **UR-ID** | UR-5.3 |
| **BRD Ref** | US-5.3 |
| **RFP Ref** | RFP-FR-8.5 (Awards & Recognition) |
| **Priority** | P1 |
| **Primary Actor** | Sarah (Enterprise), Mr. Patel (Distributor) |
| **User Goal** | Verify TwinMOS credibility through awards and certifications |

**User Requirements:**
- [ ] **UR-5.3.1** — Awards page must show: award name, awarding body, year, category, description, image
- [ ] **UR-5.3.2** — Filter by year and category must be available
- [ ] **UR-5.3.3** — UAE Superbrand 2022 (and any other industry awards) must be featured prominently *only after verification* per BR-5.5; awards without an attached certificate image and verified date/awarding-body must not be published
- [ ] **UR-5.3.4** — Certification badges (ISO 9001, CE, UKCA, FCC, RoHS, REACH; JEDEC for DRAM products) must be visible on relevant product pages
- [ ] **UR-5.3.5** — Clicking a certification badge must show verification details or certificate image

---

### 12.3 User-Facing Business Rules

| Rule ID | User Impact |
|---------|------------|
| BR-5.1 (Two-Person Review) | Users see only reviewed, accurate content |
| BR-5.3 (WebP Images) | Users get fast-loading article images |

---

## 13. UR-Epic 6: Support & Self-Service

> **BRD Ref:** Epic 6 (Section 13) — US-6.1 through US-6.4  
> **RFP Ref:** Section 8.4 (Support & Self-Service)  
> **Primary Actors:** Registered Product Owners, Aisha (Laptop Upgrader)  
> **Priority:** P1

### 13.1 User Goal Statement

> **As a TwinMOS product owner, I want to self-serve for warranty, firmware, and troubleshooting so that I can resolve issues quickly without waiting for support staff.**

### 13.2 User Requirements

#### UR-6.1: Register Product Warranty

| Attribute | Detail |
|-----------|--------|
| **UR-ID** | UR-6.1 |
| **BRD Ref** | US-6.1 |
| **RFP Ref** | RFP-FR-8.4 (Warranty Registration) |
| **Priority** | P1 |
| **Primary Actor** | Registered Product Owners |
| **User Goal** | Register my purchase to activate warranty |

**User Scenario:**
Rahul bought a VOLTX RGB kit. He wants to register it for warranty. He finds the warranty page, selects his product from a dropdown, enters his serial number and purchase date, and uploads his receipt. He receives an email confirming his warranty is active until April 2029.

**User Requirements:**
- [ ] **UR-6.1.1** — Warranty registration must be accessible from: Support menu, product detail page, footer
- [ ] **UR-6.1.2** — Form must include: Product (dropdown/search), Serial Number, Purchase Date, Retailer (dropdown), Upload Receipt (optional, image/PDF)
- [ ] **UR-6.1.3** — Serial number format must be validated in real time (length, character set)
- [ ] **UR-6.1.4** — Purchase date must not allow future dates or dates more than 2 years in the past
- [ ] **UR-6.1.5** — Auto-confirmation email must include: registration details, warranty expiration date, link to registration lookup
- [ ] **UR-6.1.6** — User must be able to look up existing registrations by email + serial number
- [ ] **UR-6.1.7** — Dashboard (if logged in) must show all registered products with warranty status (Active / Expired / Expiring Soon)

**User Acceptance Criteria (from BRD, verbatim):**
- [ ] Warranty registration form: Product (dropdown), Serial Number, Purchase Date, Retailer, Upload Receipt (optional)
- [ ] Auto-confirmation email with registration details and warranty expiration
- [ ] Registration lookup by email + serial number
- [ ] Dashboard showing registered products and warranty status

---

#### UR-6.2: Download Firmware & Software

| Attribute | Detail |
|-----------|--------|
| **UR-ID** | UR-6.2 |
| **BRD Ref** | US-6.2 |
| **RFP Ref** | RFP-FR-8.4 (Firmware Download Center) |
| **Priority** | P1 |
| **Primary Actor** | Rahul (Gamer), Kumar (System Integrator) |
| **User Goal** | Download the latest firmware and management software for my SSD |

**User Requirements:**
- [ ] **UR-6.2.1** — Download center must be organized by: Product Category → Product Line → Model
- [ ] **UR-6.2.2** — Each download must show: Version number, Release date, File size, Changelog, Compatibility list
- [ ] **UR-6.2.3** — Download must require serial number validation (input field before download begins)
- [ ] **UR-6.2.4** — Checksum (MD5/SHA256) must be copyable for verification
- [ ] **UR-6.2.5** — Warning banner must appear: "Back up your data before updating firmware. TwinMOS is not responsible for data loss."
- [ ] **UR-6.2.6** — Download progress must be visible; large files must support resumable download

**User Acceptance Criteria (from BRD, verbatim):**
- [ ] Firmware download center organized by product category and model
- [ ] Each download shows: Version, release date, file size, changelog, compatibility
- [ ] Download requires serial number validation (anti-piracy)
- [ ] Checksum (MD5/SHA256) provided for verification
- [ ] Warning/disclaimer about backup before firmware update

---

#### UR-6.3: Browse Knowledge Base

| Attribute | Detail |
|-----------|--------|
| **UR-ID** | UR-6.3 |
| **BRD Ref** | US-6.3 |
| **RFP Ref** | RFP-FR-8.4 (Knowledge Base / FAQ) |
| **Priority** | P1 |
| **Primary Actor** | Aisha (Laptop Upgrader), general users |
| **User Goal** | Find answers to common questions without contacting support |

**User Requirements:**
- [ ] **UR-6.3.1** — KB must be searchable from the support page with prominent search bar
- [ ] **UR-6.3.2** — Categories must be visible: Installation, Troubleshooting, Compatibility, Warranty, General
- [ ] **UR-6.3.3** — Article page must show: title, last updated date, body, related articles, "Was this helpful?" rating
- [ ] **UR-6.3.4** — FAQ page must use accordion (expand/collapse) pattern for scannability
- [ ] **UR-6.3.5** — Video tutorials must be embedded with captions/subtitles where available
- [ ] **UR-6.3.6** — "Still need help?" CTA must appear at bottom of every article linking to contact form

**User Acceptance Criteria (from BRD, verbatim):**
- [ ] Searchable KB with categories: Installation, Troubleshooting, Compatibility, Warranty, General
- [ ] Article ratings ("Was this helpful?") for feedback
- [ ] Related articles at bottom of each page
- [ ] Video tutorials embedded where available
- [ ] FAQ page with accordion-style Q&A

---

#### UR-6.4: Submit RMA Request

| Attribute | Detail |
|-----------|--------|
| **UR-ID** | UR-6.4 |
| **BRD Ref** | US-6.4 |
| **RFP Ref** | RFP-FR-8.4 (RMA Request Portal) |
| **Priority** | P1 |
| **Primary Actor** | Registered Product Owners |
| **User Goal** | Return a defective product and track the replacement process |

**User Requirements:**
- [ ] **UR-6.4.1** — RMA form must be accessible from: Support menu, product detail page, warranty dashboard
- [ ] **UR-6.4.2** — Form must include: Product (dropdown), Serial Number, Purchase Date, Issue Description, Upload Photo/Video (optional)
- [ ] **UR-6.4.3** — System must auto-check warranty status based on serial number and show result immediately
- [ ] **UR-6.4.4** — If out of warranty, user must see clear messaging with alternative options (paid repair, replacement purchase)
- [ ] **UR-6.4.5** — RMA number must be generated and displayed immediately upon submission
- [ ] **UR-6.4.6** — Status tracking page must show: Submitted → Approved → Ship Product → Received → Testing → Replacement Shipped → Closed
- [ ] **UR-6.4.7** — Each status change must trigger an email notification
- [ ] **UR-6.4.8** — Shipping instructions must be provided after "Approved" status

**User Acceptance Criteria (from BRD, verbatim):**
- [ ] RMA form: Product, Serial Number, Purchase Date, Issue Description, Upload Photo/Video (optional)
- [ ] Auto-check of warranty status based on registration data
- [ ] RMA number generated upon submission
- [ ] Status tracking page: Submitted → Approved → Ship Product → Received → Testing → Replacement Shipped → Closed
- [ ] Email notifications at each status change

---

### 13.3 User-Facing Business Rules

| Rule ID | User Impact |
|---------|------------|
| BR-6.1 (Warranty Periods) | Users see warranty duration as configured in the CMS for each product line. Current standard reference: Limited Lifetime (DRAM), 5 years (NVMe SSD), 3 years (SATA SSD and portable storage). Subject to final TwinMOS sign-off. |
| BR-6.2 (RMA Warranty Check) | Users cannot submit RMA for out-of-warranty products |
| BR-6.3 (Serial Validation) | Users must have a valid product to download firmware |

---

## 14. UR-Epic 7: Partner / Distributor Portal

> **BRD Ref:** Epic 7 (Section 14) — US-7.1 through US-7.3  
> **RFP Ref:** Section 8.6 (Partner & Distributor Portal)  
> **Primary Actors:** Authorized Distributors  
> **Priority:** P2 (Phase 2)

### 14.1 User Goal Statement

> **As an authorized TwinMOS distributor, I want to access confidential pricing, marketing assets, and partner resources in a secure portal so that I can effectively sell and promote TwinMOS products.**

### 14.2 User Requirements

#### UR-7.1: Access Partner Portal

| Attribute | Detail |
|-----------|--------|
| **UR-ID** | UR-7.1 |
| **BRD Ref** | US-7.1 |
| **RFP Ref** | RFP-FR-8.6 (Partner Login Area) |
| **Priority** | P2 |
| **Primary Actor** | Authorized Distributors |
| **User Goal** | Log in securely to access partner-only content |

**User Requirements:**
- [ ] **UR-7.1.1** — Login page must be at `/partners/login/` with clean, professional design
- [ ] **UR-7.1.2** — Login must require: Email + Password
- [ ] **UR-7.1.3** — "Forgot Password" must send reset email within 2 minutes
- [ ] **UR-7.1.4** — Session timeout warning must appear at 25 minutes (5 min before timeout)
- [ ] **UR-7.1.5** — After 5 failed attempts, account must be locked for 30 minutes with clear messaging
- [ ] **UR-7.1.6** — Portal must be visually distinct from public site (subtle watermark, different header color) to remind users they are in a secure area

**User Acceptance Criteria (from BRD, verbatim):**
- [ ] Login page with email + password
- [ ] Password reset via email
- [ ] Two-factor authentication (optional, P2)
- [ ] Session timeout after 30 minutes of inactivity
- [ ] Account lockout after 5 failed attempts

---

#### UR-7.2: Download Marketing Assets

| Attribute | Detail |
|-----------|--------|
| **UR-ID** | UR-7.2 |
| **BRD Ref** | US-7.2 |
| **RFP Ref** | RFP-FR-8.6 (Co-Branded Asset Library) |
| **Priority** | P2 |
| **Primary Actor** | Distributor Marketing Managers |
| **User Goal** | Download banners, images, and materials for local campaigns |

**User Requirements:**
- [ ] **UR-7.2.1** — Asset library must be organized by: Product Images, Banners (Web/Print), Datasheets, Videos, POS Materials, Logos
- [ ] **UR-7.2.2** — Filter by product, language, format must be available
- [ ] **UR-7.2.3** — Preview must be available before download (thumbnail or low-res preview)
- [ ] **UR-7.2.4** — Bulk download as ZIP must be available for selected assets
- [ ] **UR-7.2.5** — Download history must be logged per user (for audit/security)

**User Acceptance Criteria (from BRD, verbatim):**
- [ ] Asset library organized by: Product Images, Banners (web/print), Datasheets, Videos, POS Materials, Logos
- [ ] Filter by product, language, format
- [ ] Bulk download as ZIP
- [ ] Preview before download

---

#### UR-7.3: Access Price Lists

| Attribute | Detail |
|-----------|--------|
| **UR-ID** | UR-7.3 |
| **BRD Ref** | US-7.3 |
| **RFP Ref** | RFP-FR-8.6 (Price Lists) |
| **Priority** | P2 |
| **Primary Actor** | Distributor Procurement Managers |
| **User Goal** | View current distributor pricing and MOQ to plan inventory |

**User Requirements:**
- [ ] **UR-7.3.1** — Price list must be viewable only when logged in as authorized distributor
- [ ] **UR-7.3.2** — List must show: SKU, Description, Unit Price, MOQ, Volume Tier Pricing
- [ ] **UR-7.3.3** — Currency must match distributor's registered region
- [ ] **UR-7.3.4** — Effective date and revision history must be visible
- [ ] **UR-7.3.5** — Download as Excel/PDF must be available
- [ ] **UR-7.3.6** — PDF must be watermarked with distributor name and date (confidentiality protection)

**User Acceptance Criteria (from BRD, verbatim):**
- [ ] Price list viewable only to logged-in authorized distributors
- [ ] Organized by product category with SKU, description, unit price, MOQ, volume tiers
- [ ] Currency display based on distributor region
- [ ] Effective date and revision history visible
- [ ] Download as Excel/PDF

---

### 14.3 User-Facing Business Rules

| Rule ID | User Impact |
|---------|------------|
| BR-7.1 (Invitation Only) | Users cannot self-register; access is controlled by TwinMOS admin |
| BR-7.2 (PDF Watermark) | Users see their name on price lists, deterring unauthorized sharing |

---

## 15. UR-Epic 8: Gaming Hub — VOLTX Brand

> **BRD Ref:** Epic 8 (Section 15) — US-8.1 through US-8.3  
> **RFP Ref:** Section 8.7 (Gaming Hub — VOLTX Brand Experience)  
> **Primary Actors:** Rahul (Gamer)  
> **Priority:** P1

### 15.1 User Goal Statement

> **As a PC gaming enthusiast, I want to explore the VOLTX brand in an immersive, visually stunning environment so that I can get excited about TwinMOS gaming products and imagine them in my build.**

### 15.2 User Requirements

#### UR-8.1: Explore VOLTX Brand Page

| Attribute | Detail |
|-----------|--------|
| **UR-ID** | UR-8.1 |
| **BRD Ref** | US-8.1 |
| **RFP Ref** | RFP-FR-8.7 (Dedicated Gaming Landing Page) |
| **Priority** | P1 |
| **Primary Actor** | Rahul (Gamer) |
| **User Goal** | Experience the VOLTX brand and see products in a gaming context |

**User Scenario:**
Rahul clicks "Gaming" in the main navigation. The page loads with a dark theme, bold typography, and a looping video of VOLTX RGB memory pulsing in a gaming PC. He scrolls down and sees product cards, an RGB showcase, and build gallery previews. He feels like this is a brand that understands gamers.

**User Requirements:**
- [ ] **UR-8.1.1** — Gaming hub must use a dark theme distinct from the corporate light theme
- [ ] **UR-8.1.2** — Hero section must feature VOLTX product video or high-quality animation
- [ ] **UR-8.1.3** — Product grid must show VOLTX and VOLTX RGB lines with hover effects
- [ ] **UR-8.1.4** — Navigation from gaming hub to product detail pages must be seamless
- [ ] **UR-8.1.5** — "Build Your RGB Setup" visualizer (P2) must allow users to preview RAM in different lighting scenarios
- [ ] **UR-8.1.6** — Page must load performance-optimized assets; hero video must not block page interactivity

**User Acceptance Criteria (from BRD, verbatim):**
- [ ] Dark-themed landing page with bold typography, RGB accents, animated elements
- [ ] Hero section with VOLTX product showcase video or animation
- [ ] Product grid showing VOLTX and VOLTX RGB lines
- [ ] "Build Your RGB Setup" visualizer (P2)
- [ ] Link to gaming news and community content

---

#### UR-8.2: View RGB Lighting Showcase

| Attribute | Detail |
|-----------|--------|
| **UR-ID** | UR-8.2 |
| **BRD Ref** | US-8.2 |
| **RFP Ref** | RFP-FR-8.7 (RGB Showcase) |
| **Priority** | P2 |
| **Primary Actor** | Rahul (Gamer) |
| **User Goal** | See how VOLTX RGB looks with different motherboard RGB software |

**User Requirements:**
- [ ] **UR-8.2.1** — Interactive showcase must show memory modules with different lighting presets (static, breathing, rainbow, etc.)
- [ ] **UR-8.2.2** — Sync compatibility badges must be visible: ASUS Aura Sync, Gigabyte RGB Fusion, MSI Mystic Light, ASRock Polychrome
- [ ] **UR-8.2.3** — Video demonstrations of RGB effects in real builds must be embeddable
- [ ] **UR-8.2.4** — On mobile, simplified static showcase is acceptable (full interactivity P2)

**User Acceptance Criteria (from BRD, verbatim):**
- [ ] Interactive RGB showcase showing memory modules with different lighting presets
- [ ] Sync compatibility badges: ASUS Aura Sync, Gigabyte RGB Fusion, MSI Mystic Light, ASRock Polychrome
- [ ] Video demonstrations of RGB effects in real builds

---

#### UR-8.3: Submit Build Gallery Entry

| Attribute | Detail |
|-----------|--------|
| **UR-ID** | UR-8.3 |
| **BRD Ref** | US-8.3 |
| **RFP Ref** | RFP-FR-8.7 (Build Gallery) |
| **Priority** | P3 |
| **Primary Actor** | Rahul (Gamer), community members |
| **User Goal** | Share my build and potentially be featured |

**User Requirements:**
- [ ] **UR-8.3.1** — Submission form must include: Name, Location, Build Specs (text), Photo Upload (max 5 images, 5MB each)
- [ ] **UR-8.3.2** — Gallery page must show approved builds in a responsive grid
- [ ] **UR-8.3.3** — Individual builds must be shareable via social media
- [ ] **UR-8.3.4** — Users must see a "Pending Moderation" message after submission

**User Acceptance Criteria (from BRD, verbatim):**
- [ ] Submission form: Name, Location, Build Specs, Photo Upload (max 5 images)
- [ ] Admin moderation before publication
- [ ] Gallery page with filterable grid
- [ ] Social sharing for individual builds

---

### 15.3 User-Facing Business Rules

| Rule ID | User Impact |
|---------|------------|
| BR-8.1 (Performance Budget) | Gaming hub loads quickly despite rich media |
| BR-8.3 (Mobile RGB) | Mobile users get a simplified but functional RGB showcase |

---

## 16. UR-Epic 9: Multi-Language & Regionalization

> **BRD Ref:** Epic 9 (Section 16) — US-9.1 through US-9.2  
> **RFP Ref:** Section 12 (Multi-Region & Localization)  
> **Primary Actors:** All non-English speaking personas  
> **Priority:** P1 (Phase 2)

### 16.1 User Goal Statement

> **As a non-English speaker, I want to view the TwinMOS website in my native language with region-relevant content so that I can fully understand products and make informed decisions.**

### 16.2 User Requirements

#### UR-9.1: Switch Website Language

| Attribute | Detail |
|-----------|--------|
| **UR-ID** | UR-9.1 |
| **BRD Ref** | US-9.1 |
| **RFP Ref** | RFP Section 12.1 (Language Support) |
| **Priority** | P1 |
| **Primary Actor** | All non-English personas |
| **User Goal** | Change the website to my preferred language |

**User Scenario:**
An Arabic-speaking user in Dubai visits twinmos.com. They see "العربية" in the header. They click it and the entire site flips to RTL layout with Arabic text. Their preference is remembered when they return next week.

**User Requirements:**
- [ ] **UR-9.1.1** — Language selector must be in the header on every page (dropdown or flags + text). On the language toggle, both the language name in English and in the native script must be shown (e.g., "Arabic — العربية")
- [ ] **UR-9.1.2** — Supported language at Phase 1 launch (Months 1–5): **English** (default and source of truth)
- [ ] **UR-9.1.3** — Phase 2 languages (Months 6–9): **Arabic** (RTL), **Hindi**
- [ ] **UR-9.1.4** — Phase 3 languages (Months 10–15): Russian, Chinese (Simplified), French
- [ ] **UR-9.1.5** — Phase 4 languages (Months 16+): Spanish, Portuguese, German
- [ ] **UR-9.1.6** — Language preference must persist across sessions (localStorage + cookie fallback for SSR locale negotiation)
- [ ] **UR-9.1.7** — Arabic must use RTL (right-to-left) layout: navigation flips, text aligns right, images and icons mirror where appropriate
- [ ] **UR-9.1.8** — Switching language must not lose the user's current page context (stay on same page, just translated)
- [ ] **UR-9.1.9** — Untranslated content must show English as fallback with a small "Translation pending" indicator

**User Acceptance Criteria (from BRD, verbatim):**
- [ ] Language selector in header (dropdown or flags)
- [ ] Languages: English (default), Arabic, Hindi, Russian, Chinese (Simplified)
- [ ] Language preference persists across sessions (localStorage/cookie)
- [ ] URL structure: `/en/products/`, `/ar/products/`, `/hi/products/`
- [ ] Hreflang tags implemented for all language variants

---

#### UR-9.2: View Region-Specific Content

| Attribute | Detail |
|-----------|--------|
| **UR-ID** | UR-9.2 |
| **BRD Ref** | US-9.2 |
| **RFP Ref** | RFP Section 12.2 (Regional Requirements) |
| **Priority** | P1 |
| **Primary Actor** | All personas, region-specific |
| **User Goal** | See content relevant to my country and market |

**User Requirements:**
- [ ] **UR-9.2.1** — Website must auto-detect country and show regional content by default
- [ ] **UR-9.2.3** — Regional landing-page visitors must see: verified local distributor and pricing information
- [ ] **UR-9.2.4** — Middle East users must see: Arabic content option, local distributor list, AED pricing references
- [ ] **UR-9.2.5** — Manual country override must be available via dropdown in header or footer
- [ ] **UR-9.2.6** — Currency must be informational only (Phase 1) with disclaimer: "Prices are indicative. Contact local retailers for actual pricing."

**User Acceptance Criteria (from BRD, verbatim):**
- [ ] Auto-detect country and show regional content
- [ ] Regional landing pages: verified local distributor and pricing information
- [ ] Middle East page: Arabic content, local distributor list
- [ ] Manual country override available

---

### 16.3 User-Facing Business Rules

| Rule ID | Rule | User Impact |
|---------|------|-------------|
| BR-9.1 | English is the source of truth for all content; translations are reviewed by native speakers | Translated pages match the meaning and intent of the English original |
| BR-9.2 | RTL (right-to-left) layout is required for Arabic | Arabic users see a fully mirrored, culturally appropriate layout |
| BR-9.3 | Currency is informational only in Phases 1–2; transactional currency requires Phase 3 e-commerce | Users understand that displayed prices are indicative, not final |
| BR-9.4 | All language variants must have unique URLs and canonical tags | Search engines index each language variant correctly |

---

## 17. UR-Epic 10: Admin & CMS

> **BRD Ref:** Epic 10 (Section 17) — US-10.1 through US-10.3  
> **RFP Ref:** Section 9.3 (Content Management Requirements)  
> **Primary Actors:** CMS Users (Internal)  
> **Priority:** P0

### 17.1 User Goal Statement

> **As a TwinMOS staff member, I want to manage products, content, and users through an intuitive interface so that I can keep the website accurate and up-to-date without needing a developer.**

### 17.2 User Requirements

#### UR-10.1: Manage Products (CMS)

| Attribute | Detail |
|-----------|--------|
| **UR-ID** | UR-10.1 |
| **BRD Ref** | US-10.1 |
| **RFP Ref** | RFP Section 9.3 (CMS Requirements) |
| **Priority** | P0 |
| **Primary Actor** | Product Manager, Marketing Manager |
| **User Goal** | Add, edit, and remove products efficiently |

**User Requirements:**
- [ ] **UR-10.1.1** — Product creation form must be a single-page or well-organized multi-step form
- [ ] **UR-10.1.2** — Image upload must support drag-and-drop with automatic resize (thumbnail, gallery, hero)
- [ ] **UR-10.1.3** — Rich text editor must be available for descriptions (bold, lists, links, no code required)
- [ ] **UR-10.1.4** — Specification input must use structured fields (not free text) to ensure consistency
- [ ] **UR-10.1.5** — Bulk import via CSV/Excel must be available for adding multiple products
- [ ] **UR-10.1.6** — Product status must be clearly visible: Draft, Scheduled, Published, Discontinued
- [ ] **UR-10.1.7** — Preview mode must show exactly how the product will appear on the public site

**User Acceptance Criteria (from BRD, verbatim):**
- [ ] Product creation form with all required fields (see Epic 1 data model)
- [ ] Image upload with automatic resize (thumbnail, gallery, hero)
- [ ] Rich text editor for descriptions
- [ ] JSON editor for structured specifications
- [ ] Bulk import/export via CSV/Excel
- [ ] Product status: Draft, Scheduled, Published, Discontinued

---

#### UR-10.2: Manage Content Pages (CMS)

| Attribute | Detail |
|-----------|--------|
| **UR-ID** | UR-10.2 |
| **BRD Ref** | US-10.2 |
| **RFP Ref** | RFP Section 9.3 (CMS Requirements) |
| **Priority** | P0 |
| **Primary Actor** | Marketing Manager |
| **User Goal** | Create and edit pages without coding |

**User Requirements:**
- [ ] **UR-10.2.1** — Page builder must use pre-built components: Hero, Text+Image, Feature Grid, Testimonials, CTA, FAQ
- [ ] **UR-10.2.2** — Components must be drag-and-drop or add-by-click
- [ ] **UR-10.2.3** — SEO metadata fields must be available for every page: Meta Title, Meta Description, Open Graph Image
- [ ] **UR-10.2.4** — Preview must show desktop and mobile views
- [ ] **UR-10.2.5** — Revision history must show previous versions with ability to revert
- [ ] **UR-10.2.6** — Scheduling must allow: Publish Now or Future Date/Time

**User Acceptance Criteria (from BRD, verbatim):**
- [ ] Visual page builder or structured content editor
- [ ] Pre-built component library: Hero, Text+Image, Feature Grid, Testimonials, CTA, FAQ
- [ ] SEO metadata fields for every page
- [ ] Preview before publish
- [ ] Revision history with ability to revert
- [ ] Scheduling: Publish now or future date

---

#### UR-10.3: Manage User Accounts (CMS)

| Attribute | Detail |
|-----------|--------|
| **UR-ID** | UR-10.3 |
| **BRD Ref** | US-10.3 |
| **RFP Ref** | — |
| **Priority** | P1 |
| **Primary Actor** | Admin |
| **User Goal** | Control who can access and modify the CMS |

**User Requirements:**
- [ ] **UR-10.3.1** — User list must show: Name, Email, Role, Last Login, Status
- [ ] **UR-10.3.2** — Roles must be: Admin (full access), Editor (content + products), Author (content only), Viewer (read-only)
- [ ] **UR-10.3.3** — Activity log must show: User, Action, Item, Timestamp
- [ ] **UR-10.3.4** — Password policy must be enforced: min 12 chars, mixed case, number, symbol

**User Acceptance Criteria (from BRD, verbatim):**
- [ ] Roles: Admin, Editor, Author, Viewer
- [ ] Permission matrix: Products, Content, Forms, Users, Settings, Analytics
- [ ] Activity log showing who changed what and when
- [ ] Password policy enforcement

---

### 17.3 User-Facing Business Rules

| Rule ID | User Impact |
|---------|------------|
| BR-10.1 (Admin Only) | Only trusted staff can create accounts |
| BR-10.2 (Spec Approval) | Product spec changes are reviewed before going live |
| BR-10.3 (Draft First) | Content cannot be accidentally published |
| BR-10.4 (Soft Delete) | Accidentally deleted content can be recovered within 30 days |

---


## 17A. New UR-Epics Added in v3.0 (UR-Epic 11–18)

> The eight UR-Epics below mirror BRD §11–18 (added in v3.0). Each block follows the same structure as UR-Epic 1–10: User Goal Statement → User Requirements (UR-X.Y) → User-Facing Business Rules → linked use cases.

---

## 17.1 UR-Epic 11: Solutions / Vertical Use Cases

> **BRD Ref:** Epic 11 (BRD §11) — US-11.1, US-11.2
> **RFP Ref:** RFP-FR-9
> **Content Map:** §5 (`04-solutions/`)
> **Primary Personas:** Sarah (Enterprise), Mr. Patel (Distributor), Faisal (Embedded), Ms. Tan (Government), Mr. Rahman (Education IT)
> **Priority:** P1

### User Goal Statement
> **As a vertical-specific buyer or partner, I want to see TwinMOS products and bundles tailored to my industry so that I can shortcut discovery and evaluation.**

### User Requirements

#### UR-11.1: Browse Solutions Hub
- [ ] **UR-11.1.1** — Solutions Hub at `/solutions/` with vertical-tile navigation
- [ ] **UR-11.1.2** — Each tile shows industry icon, name, one-line value proposition
- [ ] **UR-11.1.3** — Verticals: Gaming Enthusiast, Content Creation, System Builders, Enterprise SMB, Education, Embedded/Industrial, Telco/BFSI/Government
- [ ] **UR-11.1.4** — Hub page must load < 1.5s

#### UR-11.2: View Vertical Solution Page
- [ ] **UR-11.2.1** — Each vertical page includes: industry context, recommended product bundles, certification highlights, case-study links, contact CTA
- [ ] **UR-11.2.2** — Recommended bundles cross-link to actual SKU detail pages (no orphan recommendations)
- [ ] **UR-11.2.3** — Certifications relevant to the vertical are highlighted (e.g., FCC/RoHS/EAC for telco; BIS for India; JEDEC for embedded)

#### UR-11.3: Browse Case Studies
- [ ] **UR-11.3.1** — Case Studies Hub at `/solutions/case-studies/`
- [ ] **UR-11.3.2** — Filter by vertical, region, product family
- [ ] **UR-11.3.3** — Each case study: customer profile, challenge, TwinMOS solution, products deployed, metrics, customer quote, downloadable PDF
- [ ] **UR-11.3.4** — Customer-approval indicator on each case study

### User-Facing Business Rules
| Rule | User Impact |
|------|-------------|
| BR-11.1 (3+ SKUs per Solutions page) | Users see actionable product recommendations |
| BR-11.2 (Customer release required) | Users see only verified, approved case studies |
| BR-11.3 (Reserved Solutions hidden) | Users do not see broken navigation links |

---

## 17.2 UR-Epic 12: Technology, R&D & Innovation

> **BRD Ref:** Epic 12 (BRD §12) — US-12.1, US-12.2, US-12.3
> **RFP Ref:** RFP-FR-10
> **Content Map:** §7 (`06-technology/`)
> **Primary Personas:** Mr. Patel (Distributor), Sarah (Enterprise), Kumar (System Integrator), Faisal (Embedded)
> **Priority:** P1

### User Goal Statement
> **As a technically-inclined visitor or B2B evaluator, I want to understand TwinMOS R&D depth and technology architecture so that I can assess the brand's technical maturity.**

### User Requirements

#### UR-12.1: Read Technology Article
- [ ] **UR-12.1.1** — Technology Hub at `/technology/`
- [ ] **UR-12.1.2** — Sub-pages support rich content (diagrams, code blocks, benchmark tables, embedded videos)
- [ ] **UR-12.1.3** — Each article cross-links to relevant products and to Learn Hub explained articles
- [ ] **UR-12.1.4** — SEO-optimized for technical search queries

#### UR-12.2: Download Whitepaper
- [ ] **UR-12.2.1** — Whitepapers Hub at `/technology/whitepapers/`
- [ ] **UR-12.2.2** — Each whitepaper: title, abstract, author, publish date, PDF download
- [ ] **UR-12.2.3** — Optional gating (email + company) for premium whitepapers (Phase 2)
- [ ] **UR-12.2.4** — Download events tracked in analytics

#### UR-12.3: View Patents
- [ ] **UR-12.3.1** — Patents page lists patent number, title, jurisdiction, status, filing date
- [ ] **UR-12.3.2** — Optional links to USPTO / EPO / CNIPA records

### User-Facing Business Rules
| Rule | User Impact |
|------|-------------|
| BR-12.1 (Engineering-reviewed content) | Users see technically accurate claims |
| BR-12.2 (Legal-reviewed whitepapers) | Forward-looking statements have disclaimers |
| BR-12.3 (Quarterly patent updates) | Users see current IP portfolio |
| BR-12.4 (Roadmap reserved) | Users do not see broken links to unreleased roadmap |

---

## 17.3 UR-Epic 13: Learn / Knowledge Hub

> **BRD Ref:** Epic 13 (BRD §13) — US-13.1 through US-13.4
> **RFP Ref:** RFP-FR-11
> **Content Map:** §9 (`08-learn/`, 64 entries)
> **Primary Personas:** All — especially Aisha and Rahul for SEO traffic
> **Priority:** P1

### User Goal Statement
> **As a researcher or buyer doing top-of-funnel evaluation, I want to read buying guides, explained articles, benchmarks, and a glossary so that I can make informed product decisions without contacting a salesperson.**

### User Requirements

#### UR-13.1: Read Buying Guide
- [ ] **UR-13.1.1** — Buying Guide Hub at `/learn/buying-guide/`
- [ ] **UR-13.1.2** — Articles: How to Choose RAM, How to Choose an SSD, NVMe vs SATA, PCIe Gen 3 vs 4 vs 5, SO-DIMM vs UDIMM, Portable SSD vs External HDD, RGB RAM Buyer's Guide, Best RAM/SSD for Gaming/Content/Laptops, Build Guides (Budget / Mid-Range / Flagship), System Builder Procurement Guide, Enterprise Fleet Upgrade Guide, DDR4 vs DDR5
- [ ] **UR-13.1.3** — Each guide cross-links to relevant TwinMOS products via a sidebar CTA

#### UR-13.2: Read "Explained" Article
- [ ] **UR-13.2.1** — Explained Hub at `/learn/explained/`
- [ ] **UR-13.2.2** — Articles use plain language with optional "deep dive" expandable sections
- [ ] **UR-13.2.3** — Glossary terms link bidirectionally to Glossary page

#### UR-13.3: View Benchmarks
- [ ] **UR-13.3.1** — Benchmarks Hub at `/learn/benchmarks/`
- [ ] **UR-13.3.2** — Each benchmark must disclose methodology, test rig, test runs, results table, charts, conclusion
- [ ] **UR-13.3.3** — Comparisons: CoreX Pro vs Competitors, VOLTX RGB vs Competitors, Real-World Gaming, Content Creation

#### UR-13.4: Read Stories / Blog
- [ ] **UR-13.4.1** — Stories Hub at `/learn/stories/`; Blog at `/learn/blog/`
- [ ] **UR-13.4.2** — Blog has consistent publishing cadence; categories for Launch Posts, Event Recaps, Industry Analysis
- [ ] **UR-13.4.3** — Author byline and publish date on every post

#### UR-13.5: Browse Glossary
- [ ] **UR-13.5.1** — Glossary at `/learn/glossary/` with alphabetical navigation
- [ ] **UR-13.5.2** — Each term links to detailed Explained article where applicable

### User-Facing Business Rules
| Rule | User Impact |
|------|-------------|
| BR-13.1 (PM technical review) | Users see technically accurate content |
| BR-13.2 (Quarterly buying-guide updates) | Recommendations stay current |
| BR-13.3 (Benchmark methodology disclosure) | Users can evaluate benchmark validity |
| BR-13.4 (Glossary consistency) | Users see consistent terminology across site |
| BR-13.5 (Author byline) | Editorial accountability |

---

## 17.4 UR-Epic 14: Careers

> **BRD Ref:** Epic 14 (BRD §14) — US-14.1, US-14.2, US-14.3
> **RFP Ref:** RFP-FR-13
> **Content Map:** §13 (`12-careers/`)
> **Primary Persona:** Sara (Job Applicant)
> **Priority:** P1

### User Goal Statement
> **As a job seeker, I want to explore TwinMOS as an employer and apply to open roles with minimal friction so that I can join the company.**

### User Requirements

#### UR-14.1: Browse Open Roles
- [ ] **UR-14.1.1** — Careers Hub at `/careers/`
- [ ] **UR-14.1.2** — Job listings page with filters by location, department, level
- [ ] **UR-14.1.3** — Each role: title, location, department, summary, full description, requirements, apply CTA
- [ ] **UR-14.1.4** — Listings auto-archive when filled

#### UR-14.2: Submit Application
- [ ] **UR-14.2.1** — Multi-step application form
- [ ] **UR-14.2.2** — CV upload (PDF/DOC, max 10MB)
- [ ] **UR-14.2.3** — Pre-submission GDPR consent checkbox + link to Job Applicant Privacy Notice
- [ ] **UR-14.2.4** — Auto-confirmation email with reference number
- [ ] **UR-14.2.5** — Optional "subscribe to job alerts" checkbox

#### UR-14.3: Read Life at TwinMOS / Benefits / Internships
- [ ] **UR-14.3.1** — Life at TwinMOS page with culture story, photos, employee testimonials
- [ ] **UR-14.3.2** — Benefits page: healthcare, retirement, time-off, learning programs
- [ ] **UR-14.3.3** — Internships page with student-pathway content
- [ ] **UR-14.3.4** — Locations page with Taipei HQ, Dubai, Cologne, San Jose maps and summaries
- [ ] **UR-14.3.5** — Departments page with Engineering, Marketing, Sales, Operations, etc.
- [ ] **UR-14.3.6** — Careers FAQ page

### User-Facing Business Rules
| Rule | User Impact |
|------|-------------|
| BR-14.1 (Equal-opportunity statement) | Users see consistent hiring statement |
| BR-14.2 (Signed testimonial release) | Quotes are verified |
| BR-14.3 (24-month application retention) | Users know data lifecycle |
| BR-14.4 (EU consent) | EU applicants see explicit consent before submitting |

---

## 17.5 UR-Epic 15: Marketing Programs & Campaigns

> **BRD Ref:** Epic 15 (BRD §15) — US-15.1 through US-15.4
> **RFP Ref:** RFP-FR-14
> **Content Map:** §16 (`15-marketing/`)
> **Primary Personas:** All — campaign-specific
> **Priority:** P1 for newsletter/promotions; P3 for Loyalty/Referral

### User Goal Statement
> **As a website visitor, I want to manage my marketing engagement (newsletter, promotions, campaigns) so that I receive only the content I want.**

### User Requirements

#### UR-15.1: Newsletter Lifecycle
- [ ] **UR-15.1.1** — Newsletter Signup landing page (beyond footer signup)
- [ ] **UR-15.1.2** — Newsletter Confirm page (double opt-in)
- [ ] **UR-15.1.3** — Newsletter Unsubscribe page (one-click, no login required)
- [ ] **UR-15.1.4** — All flows comply with GDPR/CAN-SPAM/UAE/India

#### UR-15.2: Browse Promotions
- [ ] **UR-15.2.1** — Promotions Hub at `/promotions/`
- [ ] **UR-15.2.2** — Each promotion: title, eligible products, terms, start/end date, CTA
- [ ] **UR-15.2.3** — Geographic targeting per promotion

#### UR-15.3: View Launch Campaign
- [ ] **UR-15.3.1** — Launch campaign microsites: CoreX Pro, VOLTX RGB, India Launch
- [ ] **UR-15.3.2** — Each: hero, story, product showcase, technical highlights, where-to-buy, social sharing

#### UR-15.4: Cross-Sell & Exit-Intent
- [ ] **UR-15.4.1** — Cross-sell banners as CMS-managed components (configurable per page-type)
- [ ] **UR-15.4.2** — Exit-intent popup with newsletter capture or featured-promotion CTA
- [ ] **UR-15.4.3** — Exit-intent dismissal cookied for 24+ hours

### User-Facing Business Rules
| Rule | User Impact |
|------|-------------|
| BR-15.1 (Auto-archive expired promos) | Users do not see stale offers |
| BR-15.2 (24h dismissal cookie) | Users not pestered repeatedly |
| BR-15.3 (Loyalty/Referral reserved) | Users do not see broken program links |
| BR-15.4 (Anti-spam compliance) | Users not subjected to unwanted email |

---

## 17.6 UR-Epic 16: Compliance, Trust & Legal Hub

> **BRD Ref:** Epic 16 (BRD §16) — US-16.1 through US-16.5
> **RFP Ref:** RFP-FR-15
> **Content Map:** §15 (`14-legal/`)
> **Primary Personas:** Sarah (Enterprise), Mr. Patel (Distributor), Ms. Tan (Government), all visitors for Privacy/Cookies
> **Priority:** P0

### User Goal Statement
> **As a privacy-conscious visitor or compliance-driven buyer, I want to read TwinMOS's legal disclosures, compliance certifications, and ESG statements so that I can verify the brand meets my regulatory and ethical requirements.**

### User Requirements

#### UR-16.1: Read Privacy / Cookie / Terms Pages
- [ ] **UR-16.1.1** — Privacy Policy compliant with GDPR, UAE DPL, India DPDP, KSA PDPL
- [ ] **UR-16.1.2** — Cookie Policy + Cookie Preferences with granular consent
- [ ] **UR-16.1.3** — Terms of Use (current); Terms of Sale (Phase 3 e-commerce)
- [ ] **UR-16.1.4** — Acceptable Use, Trademark Policy, Accessibility Statement
- [ ] **UR-16.1.5** — Data Deletion Request form (GDPR Art. 17)

#### UR-16.2: Verify Compliance Certifications
- [ ] **UR-16.2.1** — Compliance Hub at `/legal/compliance/`
- [ ] **UR-16.2.2** — Sub-pages for: RoHS, REACH, CE, UKCA, FCC, EAC, ISO 9001, JEDEC, BIS India, WEEE, EPEAT
- [ ] **UR-16.2.3** — Certificate evidence (PDF) downloadable where available
- [ ] **UR-16.2.4** — "Last Verified" date on each compliance page

#### UR-16.3: Read ESG / Sustainability Disclosures
- [ ] **UR-16.3.1** — Supply Chain Disclosure
- [ ] **UR-16.3.2** — Modern Slavery Statement
- [ ] **UR-16.3.3** — Conflict Minerals Disclosure
- [ ] **UR-16.3.4** — Vendor Code of Conduct
- [ ] **UR-16.3.5** — Imprint EU
- [ ] **UR-16.3.6** — Annual update cadence visible

#### UR-16.4: Read Security & Vulnerability Disclosures
- [ ] **UR-16.4.1** — Security Disclosure with security@twinmos.com (and PGP key if available)
- [ ] **UR-16.4.2** — Vulnerability Program with scope, response SLAs, recognition policy

#### UR-16.5: View Product Recalls
- [ ] **UR-16.5.1** — Product Recalls page lists active and historical recalls
- [ ] **UR-16.5.2** — Each recall: affected SKUs/serial-number ranges, issue, remediation, contact

### User-Facing Business Rules
| Rule | User Impact |
|------|-------------|
| BR-16.1 (Last Updated) | Users know currency of legal content |
| BR-16.2 (30-day notification) | Users informed of policy changes |
| BR-16.3 (Annual disclosure update) | ESG content stays current |
| BR-16.4 (Quarterly cert verification) | Compliance pages reflect current status |
| BR-16.5 (90-day disclosure) | Security researchers know expected timeline |

---

## 17.7 UR-Epic 17: Anti-Counterfeit / Product Authentication (Phase 2)

> **BRD Ref:** Epic 17 (BRD §17) — US-17.1, US-17.2, US-17.3
> **RFP Ref:** RFP-FR-16
> **Content Map:** §8 (`07-support/34-sn-check.md`, `35-counterfeit-policy.md`); §15 (`14-legal/14-counterfeit-policy.md`)
> **Primary Personas:** Aisha (suspect counterfeit), Kumar (System Integrator), Mr. Patel (Distributor)
> **Priority:** P2 (Phase 2)

### User Goal Statement
> **As a TwinMOS product purchaser, I want to verify my product's authenticity and report suspected counterfeits so that I can be confident in my purchase and contribute to brand protection.**

### User Requirements

#### UR-17.1: Verify Serial Number (SN-Check)
- [ ] **UR-17.1.1** — SN-Check page at `/support/sn-check/`
- [ ] **UR-17.1.2** — Single input: serial number (with optional product family selector)
- [ ] **UR-17.1.3** — Result categories: VERIFIED GENUINE / SERIAL NOT FOUND / SUSPECTED COUNTERFEIT
- [ ] **UR-17.1.4** — Suspected-counterfeit result includes link to reporting form
- [ ] **UR-17.1.5** — Verified-genuine result optionally includes warranty status lookup

#### UR-17.2: Report Counterfeit
- [ ] **UR-17.2.1** — Reporting form: contact info, serial number, retailer, photos, description
- [ ] **UR-17.2.2** — Brand-protection team notified immediately
- [ ] **UR-17.2.3** — Auto-reply with reporting reference number

#### UR-17.3: Read Counterfeit Policy
- [ ] **UR-17.3.1** — Counterfeit Policy in both Support (`/support/counterfeit-policy/`) and Legal (`/legal/counterfeit-policy/`)
- [ ] **UR-17.3.2** — Linked from product detail pages and footer

### User-Facing Business Rules
| Rule | User Impact |
|------|-------------|
| BR-17.1 (Rate limiting) | Prevents enumeration; legitimate users unaffected |
| BR-17.2 (5-day SLA) | Users get timely response on reports |
| BR-17.3 (Content paired) | Users see consistent policy regardless of entry point |

---

## 17.8 UR-Epic 18: Channel Programs (OEM/ODM, System Builder, MDF, Regional Hubs)

> **BRD Ref:** Epic 18 (BRD §18) — US-18.1 through US-18.4
> **RFP Ref:** RFP-FR-17
> **Content Map:** §10 (`09-partners/`)
> **Primary Personas:** Mr. Patel (Distributor), Kumar (System Integrator), Mr. Wong (OEM/ODM Partner)
> **Priority:** P0 for distributor/reseller/OEM/ODM/System-Builder; P2 for MDF (reserved)

### User Goal Statement
> **As a prospective channel partner, I want to learn about and apply to the right TwinMOS channel program so that I can join the distribution network in the appropriate role.**

### User Requirements

#### UR-18.1: Apply to a Channel Program
- [ ] **UR-18.1.1** — Become a Distributor (existing UR-3.3)
- [ ] **UR-18.1.2** — Become a Reseller (smaller-scale resellers)
- [ ] **UR-18.1.3** — OEM/ODM Program (B2B integration partners)
- [ ] **UR-18.1.4** — System Builder Program (independent system builders)
- [ ] **UR-18.1.5** — Each program has its own application form with relevant fields

#### UR-18.2: Browse Distributor Benefits / Onboarding / Responsibilities
- [ ] **UR-18.2.1** — Distributor Benefits page
- [ ] **UR-18.2.2** — Distributor Onboarding Process page
- [ ] **UR-18.2.3** — Distributor Responsibilities page
- [ ] **UR-18.2.4** — Distributor Success Stories
- [ ] **UR-18.2.5** — Partner Events Calendar
- [ ] **UR-18.2.6** — Partner Training Resources

#### UR-18.3: Visit Regional Distributor Hubs
- [ ] **UR-18.3.3** — MEA / Africa / CIS Distributor Hubs

#### UR-18.4: MDF Program (Reserved — Phase 3+)
- [ ] **UR-18.4.1** — MDF page reserved with placeholder copy until activated

### User-Facing Business Rules
| Rule | User Impact |
|------|-------------|
| BR-18.1 (48h response) | Partners receive timely follow-up |
| BR-18.2 (Status-flag activation) | Users do not see broken regional links |
| BR-18.4 (Phase 3 gate) | MDF page does not promise unfinished features |

---

## 18. Use Case Catalog

> **Purpose:** This section provides detailed use case specifications for the 30+ most critical user-system interactions. Each use case follows the standard format: Actor, Preconditions, Basic Flow, Alternative Flows, Postconditions, and Business Rules.

### Use Case Template

```
UC-[ID]: [Title]
├── Actor: [Primary Actor]
├── Preconditions: [What must be true before the use case starts]
├── Basic Flow:
│   1. [Step]
│   2. [Step]
├── Alternative Flows:
│   AF-1: [Scenario] → [Steps]
├── Postconditions: [What is true after successful completion]
├── Business Rules: [Applicable BR IDs]
└── BRD Ref: [Linked US]
```

---

### UC-1: Browse Product Catalog

| Attribute | Detail |
|-----------|--------|
| **UC-ID** | UC-1 |
| **Title** | Browse Product Catalog |
| **Actor** | Anonymous Visitor (All Personas) |
| **Preconditions** | User has navigated to twinmos.com |
| **BRD Ref** | US-1.1 |
| **Priority** | P0 |

**Basic Flow:**
1. User lands on homepage or clicks "Products" in main navigation
2. System displays product category cards: Memory, SSD, Portable Storage, USB Flash, Accessories
3. User clicks a category card (e.g., "Memory")
4. System loads category page showing sub-categories (DDR5 Desktop, DDR5 Laptop, DDR4 Desktop, etc.)
5. User clicks a sub-category (e.g., "DDR5 Desktop")
6. System displays product grid with filter panel and sort options
7. User scrolls through products, viewing product cards with image, name, key specs, and CTA

**Alternative Flows:**
- **AF-1: Direct URL access** → User enters `/products/memory/ddr5/desktop/` directly. System loads filtered product grid.
- **AF-2: Category with no products** → System shows empty state: "No products in this category. Check out [DDR4 Desktop] instead."
- **AF-3: Mobile navigation** → On mobile, category menu opens as full-screen overlay with back button

**Postconditions:**
- User has viewed a product category page with available products
- Page view tracked in analytics

**Business Rules:** BR-1.1, BR-1.4, BR-1.5, BR-GLOBAL-4

---

### UC-2: Filter Products by Specifications

| Attribute | Detail |
|-----------|--------|
| **UC-ID** | UC-2 |
| **Title** | Filter Products by Specifications |
| **Actor** | Rahul (Gamer), Kumar (System Integrator) |
| **Preconditions** | User is on a product category page |
| **BRD Ref** | US-1.2 |
| **Priority** | P0 |

**Basic Flow:**
1. User views product category page (e.g., DDR5 Desktop Memory)
2. System displays filter panel on left (desktop) or behind "Filters" button (mobile)
3. User selects filters: Type=DDR5, Capacity=32GB, RGB=Yes
4. System updates product grid instantly with matching products
5. System displays active filter tags at top of grid
6. System updates URL to reflect filters: `/products/memory/ddr5/desktop/?capacity=32gb&rgb=yes`
7. User views filtered results (e.g., 4 products match)

**Alternative Flows:**
- **AF-1: No products match filters** → System shows: "No products match these filters. Try removing: [Capacity: 32GB]"
- **AF-2: Clear all filters** → User clicks "Clear All." System resets grid and removes filter tags
- **AF-3: Mobile filter drawer** → User taps "Filters." Bottom sheet opens. User selects filters, taps "Apply." Sheet closes, grid updates

**Postconditions:**
- User sees only products matching selected criteria
- Filter state is shareable via URL

**Business Rules:** BR-1.4, BR-1.5

---

### UC-3: View Product Details

| Attribute | Detail |
|-----------|--------|
| **UC-ID** | UC-3 |
| **Title** | View Product Details |
| **Actor** | Anonymous Visitor (All Personas) |
| **Preconditions** | User has clicked a product from category page or search result |
| **BRD Ref** | US-1.3 |
| **Priority** | P0 |

**Basic Flow:**
1. User clicks a product card
2. System navigates to product detail page
3. System displays: hero image, product name, SKU, short description, spec summary, warranty badge, "Where to Buy" CTA
4. User scrolls to view full spec table organized by category
5. User clicks image gallery thumbnails to view additional angles
6. User clicks "Where to Buy" CTA
7. System scrolls to or opens "Where to Buy" section

**Alternative Flows:**
- **AF-1: Product not found** → System shows 404 page with: "Product not found. Browse similar products." + category links
- **AF-2: Discontinued product** → System shows "Discontinued" badge prominently. Suggests replacement products
- **AF-3: Mobile image zoom** → User taps image. Full-screen lightbox opens with swipe navigation

**Postconditions:**
- User has viewed complete product information
- Product page view tracked in analytics

**Business Rules:** BR-1.1, BR-1.2, BR-1.3, BR-1.4, BR-1.5, BR-1.6

---

### UC-4: Compare Products

| Attribute | Detail |
|-----------|--------|
| **UC-ID** | UC-4 |
| **Title** | Compare Products Side-by-Side |
| **Actor** | Rahul (Gamer), Kumar (System Integrator) |
| **Preconditions** | User is on category page or product detail page |
| **BRD Ref** | US-1.4 |
| **Priority** | P1 |

**Basic Flow:**
1. User clicks "Add to Compare" checkbox on a product card
2. System adds product to compare bar (sticky bottom bar showing count)
3. User adds 2–3 more products to compare
4. User clicks "Compare" in compare bar
5. System navigates to comparison page showing products in columns, specs in rows
6. System highlights cells where values differ
7. User reviews differences and clicks "View Product" on preferred option

**Alternative Flows:**
- **AF-1: Compare bar full** → User tries to add 5th product. System shows: "Maximum 4 products. Remove one to add another."
- **AF-2: Remove from comparison** → User clicks "X" on a product column. System removes it and realigns table
- **AF-3: Print comparison** → User clicks "Print." System opens print dialog with clean, formatted table

**Postconditions:**
- User has viewed side-by-side comparison
- Comparison list persists in localStorage

**Business Rules:** BR-1.1, BR-1.3

---

### UC-5: Download Product Datasheet

| Attribute | Detail |
|-----------|--------|
| **UC-ID** | UC-5 |
| **Title** | Download Product Datasheet |
| **Actor** | Kumar (System Integrator), Sarah (Enterprise) |
| **Preconditions** | User is on product detail page |
| **BRD Ref** | US-1.5 |
| **Priority** | P1 |

**Basic Flow:**
1. User clicks "Download Datasheet" button on product detail page
2. System initiates PDF download
3. System tracks download event in analytics
4. User receives PDF file with product specifications, features, and branding

**Alternative Flows:**
- **AF-1: PDF unavailable** → System shows: "Datasheet coming soon. Contact us for details." + contact link
- **AF-2: Mobile download** → File saves to device or prompts cloud storage selection

**Postconditions:**
- User has PDF datasheet saved to device

**Business Rules:** BR-1.1, BR-1.2

---

### UC-6: Search Compatibility by Device Model

| Attribute | Detail |
|-----------|--------|
| **UC-ID** | UC-6 |
| **Title** | Search Compatibility by Device Model |
| **Actor** | Aisha (Laptop Upgrader), general consumers |
| **Preconditions** | User has navigated to `/compatibility-finder/` |
| **BRD Ref** | US-2.1 |
| **Priority** | P0 |

**Basic Flow:**
1. User lands on Compatibility Finder page
2. System shows search interface: Brand dropdown + Model text input
3. User selects brand "Dell" from dropdown
4. User types "Inspiron" in model field
5. System shows auto-suggestions: "Inspiron 15 3520," "Inspiron 14 5420," etc.
6. User selects "Inspiron 15 3520"
7. System displays results page with compatible products grouped by category
8. System shows device specs: Max RAM 16GB, DDR4-3200, 2 SO-DIMM slots
9. User clicks "View Product" on a compatible RAM module

**Alternative Flows:**
- **AF-1: Model not found** → System shows: "Model not found. Try a similar model or contact support." + manual inquiry form
- **AF-2: No compatible products** → System shows: "No compatible TwinMOS products listed for this model. Contact support for assistance."
- **AF-3: Mobile search** → User taps brand dropdown (native picker), types model (auto-suggest list)

**Postconditions:**
- User has identified compatible products for their device
- Search query tracked in analytics

**Business Rules:** BR-2.1, BR-2.2, BR-2.3, BR-2.4

---

### UC-7: Search Compatibility by Motherboard

| Attribute | Detail |
|-----------|--------|
| **UC-ID** | UC-7 |
| **Title** | Search Compatibility by Motherboard Model |
| **Actor** | Rahul (Gamer), Kumar (System Integrator) |
| **Preconditions** | User has navigated to `/compatibility-finder/` and selected "Motherboard" tab |
| **BRD Ref** | US-2.2 |
| **Priority** | P0 |

**Basic Flow:**
1. User clicks "Motherboard" tab on Compatibility Finder page
2. System shows motherboard search: Brand + Model inputs
3. User types "ASUS ROG STRIX Z790-E"
4. System shows auto-suggestion; user selects it
5. System displays compatible RAM products with QVL status badges
6. System shows XMP 3.0 and EXPO compatibility indicators
7. User reviews results and clicks "View Product"

**Alternative Flows:**
- **AF-1: QVL not verified** → System shows "Not Verified" with note: "This product has not been specifically tested with this motherboard, but may be compatible based on specifications."
- **AF-2: Link to manufacturer QVL** → User clicks QVL badge. System opens motherboard manufacturer's QVL page in new tab

**Postconditions:**
- User has verified motherboard compatibility for selected RAM

**Business Rules:** BR-2.1, BR-2.2, BR-2.4

---

### UC-8: Find Local Retailers

| Attribute | Detail |
|-----------|--------|
| **UC-ID** | UC-8 |
| **Title** | Find Local Retailers |
| **Actor** | Aisha (Laptop Upgrader), Rahul (Gamer) |
| **Preconditions** | User has navigated to `/where-to-buy/` |
| **BRD Ref** | US-3.1 |
| **Priority** | P0 |

**Basic Flow:**
1. User lands on Where to Buy page
2. System auto-detects country via IP (e.g., India)
3. System displays interactive map with retailer pins and list view sidebar
5. User clicks a map pin
6. System shows retailer card: Name, Address, Phone, Website, Distance
7. User clicks "Get Directions" to open Google Maps

**Alternative Flows:**
- **AF-1: Country detection wrong** → User clicks "Change Country" and selects correct country from dropdown
- **AF-2: No retailers in country** → System shows: "No authorized retailers in [Country]. Become a distributor or contact us."
- **AF-3: Filter by type** → User selects "Physical Store" filter. Map updates to show only physical stores

**Postconditions:**
- User has identified local purchase options

**Business Rules:** BR-3.1, BR-3.3, BR-3.4

---

### UC-9: Submit Distributor Inquiry

| Attribute | Detail |
|-----------|--------|
| **UC-ID** | UC-9 |
| **Title** | Submit Distributor Inquiry |
| **Actor** | Mr. Patel (Potential Distributor) |
| **Preconditions** | User has navigated to distributor inquiry form |
| **BRD Ref** | US-3.3 |
| **Priority** | P0 |

**Basic Flow:**
1. User clicks "Become a Distributor" from footer or partners page
2. System displays multi-field form
3. User fills all required fields
4. User clicks "Submit"
5. System validates fields, shows loading spinner
6. System displays success page: "Thank you. We'll respond within 48 hours."
7. System sends auto-reply email to user with confirmation and ticket reference

**Alternative Flows:**
- **AF-1: Validation error** → System highlights invalid fields in red with specific error messages
- **AF-2: reCAPTCHA triggered** → User must complete challenge before submission proceeds
- **AF-3: Submission failure** → System shows: "Something went wrong. Please try again or email sales@twinmos.com."

**Postconditions:**
- Inquiry stored in database with "New" status
- Sales team notified via email

**Business Rules:** BR-3.1, BR-4.1, BR-4.4

---

### UC-10: Submit General Contact Inquiry

| Attribute | Detail |
|-----------|--------|
| **UC-ID** | UC-10 |
| **Title** | Submit General Contact Inquiry |
| **Actor** | All personas |
| **Preconditions** | User has navigated to contact form |
| **BRD Ref** | US-4.1 |
| **Priority** | P0 |

**Basic Flow:**
1. User clicks "Contact" in header
2. System displays contact form with subject dropdown
3. User selects "Technical Support" from dropdown
4. User fills Name, Email, Country, Message
5. User clicks "Submit"
6. System validates and submits
7. System shows success with ticket number
8. System sends auto-reply within 5 minutes

**Alternative Flows:**
- **AF-1: Contextual help** → Selecting "Technical Support" reveals: "Before contacting support, check our Knowledge Base" with link
- **AF-2: Form timeout** → If user takes > 10 minutes, system warns: "Your session may expire. Submit soon."

**Postconditions:**
- Inquiry stored with ticket number
- Auto-reply sent to user

**Business Rules:** BR-4.1, BR-4.3, BR-4.6, BR-GLOBAL-5

---

### UC-11: Request Bulk Quote

| Attribute | Detail |
|-----------|--------|
| **UC-ID** | UC-11 |
| **Title** | Request Bulk/Enterprise Quote |
| **Actor** | Sarah (Enterprise), Kumar (System Integrator) |
| **Preconditions** | User has clicked "Request a Quote" CTA |
| **BRD Ref** | US-4.2 |
| **Priority** | P0 |

**Basic Flow:**
1. User clicks "Request a Quote" on product page or contact page
2. System displays detailed quote form
3. User fills company details, product interest, quantity, timeline
4. User optionally uploads RFP document
5. User clicks "Submit"
6. System validates and submits with high-priority flag
7. System shows success: "Your quote request is being reviewed by our sales team."
8. System sends auto-reply: "We respond to quote requests within 24 business hours."

**Alternative Flows:**
- **AF-1: File too large** → System rejects upload: "Maximum file size is 10MB. Please compress or send via email."
- **AF-2: Invalid file type** → System rejects: "Please upload PDF, Word, or Excel files only."

**Postconditions:**
- Quote request routed to sales@twinmos.com with high priority

**Business Rules:** BR-4.1, BR-4.2

---

### UC-12: Subscribe to Newsletter

| Attribute | Detail |
|-----------|--------|
| **UC-ID** | UC-12 |
| **Title** | Subscribe to Newsletter |
| **Actor** | Rahul (Gamer), general visitors |
| **Preconditions** | User is on any page (footer signup) or news page |
| **BRD Ref** | US-4.3 |
| **Priority** | P1 |

**Basic Flow:**
1. User enters email in footer signup field
2. User optionally selects product interests
3. User clicks "Subscribe"
4. System validates email format
5. System sends double opt-in email
6. System shows: "Check your email to confirm your subscription."
7. User clicks confirmation link in email
8. System confirms subscription and shows welcome message

**Alternative Flows:**
- **AF-1: Already subscribed** → System shows: "You're already subscribed!"
- **AF-2: Invalid email** → System shows inline error: "Please enter a valid email address."
- **AF-3: EU user** → System shows GDPR consent checkbox before allowing submission

**Postconditions:**
- User added to newsletter list (after double opt-in)

**Business Rules:** BR-4.5, BR-4.6, BR-GLOBAL-5, BR-GLOBAL-10

---

### UC-13: Register Product Warranty

| Attribute | Detail |
|-----------|--------|
| **UC-ID** | UC-13 |
| **Title** | Register Product Warranty |
| **Actor** | Registered Product Owner |
| **Preconditions** | User has purchased a TwinMOS product and has serial number |
| **BRD Ref** | US-6.1 |
| **Priority** | P1 |

**Basic Flow:**
1. User navigates to Warranty Registration page
2. User selects product from dropdown
3. User enters serial number (validated in real time)
4. User selects purchase date from date picker
5. User selects retailer from dropdown
6. User optionally uploads receipt image
7. User clicks "Register"
8. System validates and stores registration
9. System sends confirmation email with warranty details and expiration date

**Alternative Flows:**
- **AF-1: Invalid serial number** → System shows: "Serial number not recognized. Please check and try again."
- **AF-2: Already registered** → System shows: "This product is already registered. [View Registration]"
- **AF-3: Missing receipt** → System allows registration without receipt but notes: "Upload receipt within 30 days for full warranty coverage."

**Postconditions:**
- Product registered in warranty database
- User receives confirmation with expiration date

**Business Rules:** BR-6.1, BR-6.3

---

### UC-14: Submit RMA Request

| Attribute | Detail |
|-----------|--------|
| **UC-ID** | UC-14 |
| **Title** | Submit RMA Request |
| **Actor** | Registered Product Owner |
| **Preconditions** | User has a defective product and knows serial number |
| **BRD Ref** | US-6.4 |
| **Priority** | P1 |

**Basic Flow:**
1. User navigates to RMA page
2. User enters serial number
3. System auto-checks warranty status and shows: "Warranty Active — Expires [Date]"
4. User selects issue from dropdown or describes in text
5. User optionally uploads photo/video of defect
6. User clicks "Submit RMA"
7. System generates RMA number and displays it prominently
8. System shows status tracker: Submitted → Approved → Ship Product → ...
9. System sends email confirmation with RMA number and instructions

**Alternative Flows:**
- **AF-1: Out of warranty** → System shows: "This product is out of warranty. Contact support for paid repair options."
- **AF-2: Not registered** → System prompts: "Please register your product first" with link to warranty registration

**Postconditions:**
- RMA created with unique number
- Status tracking page available

**Business Rules:** BR-6.1, BR-6.2

---

### UC-15: Browse Knowledge Base

| Attribute | Detail |
|-----------|--------|
| **UC-ID** | UC-15 |
| **Title** | Browse Knowledge Base |
| **Actor** | Aisha (Laptop Upgrader), general users |
| **Preconditions** | User has navigated to `/support/knowledge-base/` |
| **BRD Ref** | US-6.3 |
| **Priority** | P1 |

**Basic Flow:**
1. User lands on Knowledge Base page
2. System shows search bar and category cards: Installation, Troubleshooting, Compatibility, Warranty, General
3. User types "install RAM laptop" in search
4. System shows search results with relevance ranking
5. User clicks an article
6. System displays article with headings, images, embedded video
7. User reads article and clicks "Yes" on "Was this helpful?"
8. System shows related articles at bottom

**Alternative Flows:**
- **AF-1: No search results** → System shows: "No articles found. Try different keywords or contact support."
- **AF-2: FAQ accordion** → User visits FAQ page. Clicks a question. Answer expands. Clicks again. Answer collapses.

**Postconditions:**
- User has found (or not found) answer to their question
- Article rating recorded for analytics

**Business Rules:** BR-6.4

---

### UC-16: Access Partner Portal

| Attribute | Detail |
|-----------|--------|
| **UC-ID** | UC-16 |
| **Title** | Access Partner Portal |
| **Actor** | Authorized Distributor |
| **Preconditions** | User has been invited and has login credentials |
| **BRD Ref** | US-7.1 |
| **Priority** | P2 |

**Basic Flow:**
1. User navigates to `/partners/login/`
2. User enters email and password
3. System validates credentials
4. System redirects to partner portal dashboard
5. User sees available sections: Marketing Assets, Price Lists, Account Settings
6. User clicks "Marketing Assets"
7. System displays asset library with filters

**Alternative Flows:**
- **AF-1: Forgot password** → User clicks "Forgot Password." System sends reset email. User resets and logs in.
- **AF-2: Account locked** → After 5 failed attempts, system shows: "Account locked for 30 minutes. Contact admin."
- **AF-3: Session timeout** → After 30 min idle, system shows: "Session expired. Please log in again."

**Postconditions:**
- User is authenticated and viewing partner-only content

**Business Rules:** BR-7.1

---

### UC-17: Download Price List (Partner Portal)

| Attribute | Detail |
|-----------|--------|
| **UC-ID** | UC-17 |
| **Title** | Download Price List |
| **Actor** | Distributor Procurement Manager |
| **Preconditions** | User is logged into partner portal |
| **BRD Ref** | US-7.3 |
| **Priority** | P2 |

**Basic Flow:**
1. User navigates to "Price Lists" section
2. System shows current price list with effective date
3. User reviews pricing table: SKU, Description, Unit Price, MOQ, Volume Tiers
4. User clicks "Download PDF" or "Download Excel"
5. System generates file with distributor name watermark
6. File downloads to user's device

**Alternative Flows:**
- **AF-1: Price list expired** → System shows: "New price list effective [Date]. Contact your account manager."
- **AF-2: No access** → If user role lacks price list permission, system shows: "You don't have access to this section. Contact admin."

**Postconditions:**
- User has downloaded current price list
- Download logged for audit

**Business Rules:** BR-7.2

---

### UC-18: Explore VOLTX Gaming Hub

| Attribute | Detail |
|-----------|--------|
| **UC-ID** | UC-18 |
| **Title** | Explore VOLTX Gaming Hub |
| **Actor** | Rahul (Gamer) |
| **Preconditions** | User has clicked "Gaming" in main navigation |
| **BRD Ref** | US-8.1 |
| **Priority** | P1 |

**Basic Flow:**
1. User clicks "Gaming" in header
2. System loads `/gaming/` with dark theme
3. Hero section shows VOLTX product video/animation
4. User scrolls to product grid showing VOLTX and VOLTX RGB
5. User clicks a product to view detail
6. System navigates to product page (maintaining dark theme if applicable)

**Alternative Flows:**
- **AF-1: Slow connection** → Hero video does not auto-play. Static hero image shown with "Play Video" button
- **AF-2: Mobile** → Simplified layout with stacked sections, video replaced with animated GIF or static image

**Postconditions:**
- User has experienced VOLTX brand presentation

**Business Rules:** BR-8.1

---

### UC-19: Switch Website Language

| Attribute | Detail |
|-----------|--------|
| **UC-ID** | UC-19 |
| **Title** | Switch Website Language |
| **Actor** | Non-English speaking visitor |
| **Preconditions** | User is on any page of the website |
| **BRD Ref** | US-9.1 |
| **Priority** | P1 |

**Basic Flow:**
1. User clicks language selector in header
2. System shows dropdown: English, العربية, বাংলা, हिन्दी
3. User selects "العربية" (Arabic)
4. System reloads page with Arabic content
5. Layout flips to RTL
6. System stores preference in localStorage

**Alternative Flows:**
- **AF-1: Untranslated content** → System shows English content with small "Translation pending" badge
- **AF-2: Direct URL** → User enters `/ar/products/`. System loads Arabic version directly

**Postconditions:**
- User is viewing site in preferred language
- Preference persisted for future visits

**Business Rules:** BR-9.1, BR-9.2

---

### UC-20: CMS — Publish News Article

| Attribute | Detail |
|-----------|--------|
| **UC-ID** | UC-20 |
| **Title** | CMS: Publish News Article |
| **Actor** | Marketing Manager (CMS User) |
| **Preconditions** | User is logged into CMS with Editor or Admin role |
| **BRD Ref** | US-5.1, US-10.2 |
| **Priority** | P0 |

**Basic Flow:**
1. User logs into CMS
2. User clicks "Content" → "News"
3. User clicks "Create New Article"
4. User fills title, excerpt, selects category, uploads featured image
5. User writes article body in rich text editor
6. User fills SEO fields: Meta Title, Meta Description
7. User clicks "Preview" — sees exactly how article will appear
8. User clicks "Submit for Review"
9. System notifies reviewer

**Alternative Flows:**
- **AF-1: Schedule for later** → User sets publish date to future. System queues article for automatic publication
- **AF-2: Save draft** → User clicks "Save Draft." Article saved but not published
- **AF-3: Revert** → User clicks revision history, selects previous version, clicks "Restore"

**Postconditions:**
- Article in "Pending Review" status or published/scheduled

**Business Rules:** BR-5.1, BR-5.2, BR-5.3, BR-5.4, BR-10.2, BR-10.3

---

### UC-21: CMS — Add New Product

| Attribute | Detail |
|-----------|--------|
| **UC-ID** | UC-21 |
| **Title** | CMS: Add New Product |
| **Actor** | Product Manager (CMS User) |
| **Preconditions** | User is logged into CMS with Editor or Admin role |
| **BRD Ref** | US-10.1 |
| **Priority** | P0 |

**Basic Flow:**
1. User logs into CMS
2. User clicks "Products" → "Add Product"
3. User fills: Name, SKU, Category, Brand Line, Description
4. User uploads hero image and gallery images
5. User fills specification fields using structured form
6. User sets warranty period and status
7. User clicks "Preview"
8. User clicks "Submit for Review"

**Alternative Flows:**
- **AF-1: Bulk import** → User uploads CSV. System validates and shows preview of imported products
- **AF-2: Duplicate product** → User clones existing product and edits. System creates new with "Copy of" prefix

**Postconditions:**
- Product in "Pending Review" status

**Business Rules:** BR-1.1, BR-1.2, BR-1.3, BR-1.6, BR-10.2

---

### UC-22: View Build Gallery

| Attribute | Detail |
|-----------|--------|
| **UC-ID** | UC-22 |
| **Title** | View Build Gallery |
| **Actor** | Rahul (Gamer) |
| **Preconditions** | User is on `/gaming/build-gallery/` |
| **BRD Ref** | US-8.3 |
| **Priority** | P3 |

**Basic Flow:**
1. User navigates to Build Gallery
2. System displays grid of approved build submissions
3. User hovers over a build to see builder name and location
4. User clicks a build
5. System opens detail view: large images, build specs, social sharing

**Alternative Flows:**
- **AF-1: Filter by product** → User selects "VOLTX RGB." Grid filters to builds featuring that product
- **AF-2: Submit build** → User clicks "Submit Your Build." System shows submission form

**Postconditions:**
- User has viewed community builds

**Business Rules:** BR-8.2

---

### UC-23: View RGB Lighting Showcase

| Attribute | Detail |
|-----------|--------|
| **UC-ID** | UC-23 |
| **Title** | View RGB Lighting Showcase |
| **Actor** | Rahul (Gamer) |
| **Preconditions** | User is on gaming hub or product page with RGB product |
| **BRD Ref** | US-8.2 |
| **Priority** | P2 |

**Basic Flow:**
1. User clicks "RGB Showcase" on gaming hub
2. System displays interactive memory module visualization
3. User clicks lighting presets: Static, Breathing, Rainbow, Wave
4. System updates visualization to show selected effect
5. User sees sync compatibility badges for major motherboard brands
6. User clicks "View Product" to see VOLTX RGB details

**Alternative Flows:**
- **AF-1: Mobile** → System shows static image carousel of different lighting effects instead of interactive visualizer

**Postconditions:**
- User has seen RGB capabilities of VOLTX products

**Business Rules:** BR-8.3

---

### UC-24: View Region-Specific Content

| Attribute | Detail |
|-----------|--------|
| **UC-ID** | UC-24 |
| **Title** | View Region-Specific Content |
| **Actor** | All personas |
| **Preconditions** | User visits website from specific country |
| **BRD Ref** | US-9.2 |
| **Priority** | P1 |

**Basic Flow:**
1. User visits twinmos.com from India
2. System detects country via IP geolocation
4. "Where to Buy" page auto-filters to India retailers
5. Product pages show INR pricing references (informational)
6. BIS certification badges displayed on relevant products

**Alternative Flows:**
- **AF-1: VPN/incognito** → Detection may be inaccurate. User manually selects country from dropdown
- **AF-2: Unsupported country** → System shows global content with message: "Find a distributor in your region."

**Postconditions:**
- User sees content relevant to their market

**Business Rules:** BR-9.3, BR-9.4

---

### UC-25: Use Live Chat

| Attribute | Detail |
|-----------|--------|
| **UC-ID** | UC-25 |
| **Title** | Use Live Chat Support |
| **Actor** | All personas |
| **Preconditions** | User is on any page during business hours |
| **BRD Ref** | US-4.4 |
| **Priority** | P2 |

**Basic Flow:**
1. User sees chat widget: "Online — We're here to help"
2. User clicks widget
3. Chat window opens with welcome message
4. User types question
5. Support agent responds
6. User and agent chat. Agent may share links to product pages or KB articles
7. User closes chat
8. System emails transcript to user

**Alternative Flows:**
- **AF-1: Offline** → Widget shows: "Offline — Leave a message. We'll respond via email." Form captures email + message
- **AF-2: No agents available** → Queue message: "All agents are busy. Expected wait: 5 minutes."

**Postconditions:**
- Chat session completed or offline message captured

---

### UC-26: Navigate with Accessibility Tools

| Attribute | Detail |
|-----------|--------|
| **UC-ID** | UC-26 |
| **Title** | Navigate with Accessibility Tools |
| **Actor** | Visually impaired user, keyboard-only user |
| **Preconditions** | User is using screen reader or keyboard only |
| **BRD Ref** | US-9.1 (accessibility considerations across all stories) |
| **Priority** | P1 |

**Basic Flow:**
1. User opens twinmos.com with screen reader (e.g., NVDA)
2. User hears: "TwinMOS Technologies — Memory and Storage Solutions. Main navigation."
3. User presses Tab to navigate through skip links, then menu items
4. User presses Enter on "Products"
5. Screen reader announces: "Products menu expanded. Memory, SSD, Portable Storage."
6. User navigates to product page
7. Screen reader reads product name, specs table (with proper headers), and CTA buttons

**Alternative Flows:**
- **AF-1: High contrast mode** → User has OS high contrast enabled. Website respects contrast settings
- **AF-2: Zoom 200%** → User zooms to 200%. Layout reflows without horizontal scroll

**Postconditions:**
- User has successfully navigated and accessed content using assistive technology

**Business Rules:** BR-9.2 (RTL), WCAG 2.1 AA guidelines

---

### UC-27: Download Firmware

| Attribute | Detail |
|-----------|--------|
| **UC-ID** | UC-27 |
| **Title** | Download SSD Firmware |
| **Actor** | Rahul (Gamer), Kumar (System Integrator) |
| **Preconditions** | User owns a TwinMOS SSD and has serial number |
| **BRD Ref** | US-6.2 |
| **Priority** | P1 |

**Basic Flow:**
1. User navigates to `/support/firmware/`
2. User selects SSD category → product line → model
3. System shows available firmware: version, date, changelog
4. User clicks "Download"
5. System prompts for serial number
6. User enters serial number
7. System validates and initiates download
8. System displays checksum for verification

**Alternative Flows:**
- **AF-1: Invalid serial** → System shows: "Serial number not recognized. Please check your product label."
- **AF-2: No updates available** → System shows: "Your firmware is up to date (v1.2.3)."

**Postconditions:**
- User has downloaded firmware file
- Download logged for support tracking

**Business Rules:** BR-6.3

---

### UC-28: View Product Comparison from URL

| Attribute | Detail |
|-----------|--------|
| **UC-ID** | UC-28 |
| **Title** | View Product Comparison from Shared URL |
| **Actor** | Any visitor |
| **Preconditions** | User has received a comparison URL (e.g., from Rahul sharing with a friend) |
| **BRD Ref** | US-1.4 |
| **Priority** | P1 |

**Basic Flow:**
1. User clicks shared comparison link: `/compare/?products=voltx-16gb-5600,voltx-16gb-6000`
2. System loads comparison page with specified products
3. User views side-by-side specs
4. User can add/remove products or share their own link

**Alternative Flows:**
- **AF-1: Product discontinued** → System shows product with "Discontinued" badge and suggests alternatives
- **AF-2: Invalid product IDs** → System shows: "Some products in this comparison are no longer available."

**Postconditions:**
- User has viewed shared comparison

---

### UC-29: CMS — Review and Approve Content

| Attribute | Detail |
|-----------|--------|
| **UC-ID** | UC-29 |
| **Title** | CMS: Review and Approve Content |
| **Actor** | Marketing Director (CMS Admin/Editor) |
| **Preconditions** | User is logged into CMS with review permissions |
| **BRD Ref** | US-5.1, US-10.1, US-10.2 |
| **Priority** | P0 |

**Basic Flow:**
1. User receives email notification: "New article pending review: 'TwinMOS at COMPUTEX 2026'"
2. User logs into CMS
3. User navigates to "Review Queue"
4. User clicks article to review
5. User reads article, checks SEO fields, clicks preview
6. User clicks "Approve and Publish" or "Request Changes"
7. If approved, article goes live immediately (or at scheduled time)

**Alternative Flows:**
- **AF-1: Request changes** → User adds comments, clicks "Request Changes." Author receives notification with feedback
- **AF-2: Emergency publish** → Admin can override workflow and publish directly

**Postconditions:**
- Content published or returned for revision

**Business Rules:** BR-5.1, BR-10.2, BR-10.3

---

### UC-30: Submit Build Gallery Entry

| Attribute | Detail |
|-----------|--------|
| **UC-ID** | UC-30 |
| **Title** | Submit Build Gallery Entry |
| **Actor** | Rahul (Gamer), VOLTX product owner |
| **Preconditions** | User has photos of their PC build featuring TwinMOS products |
| **BRD Ref** | US-8.3 |
| **Priority** | P3 |

**Basic Flow:**
1. User navigates to Build Gallery and clicks "Submit Your Build"
2. System shows form: Name, Location, Build Specs (text area), Photo Upload (max 5)
3. User fills form and uploads photos
4. User clicks "Submit"
5. System validates and shows: "Thank you! Your build is pending moderation."
6. Admin reviews and approves build
7. Build appears in gallery

**Alternative Flows:**
- **AF-1: Photo too large** → System rejects: "Each photo must be under 5MB."
- **AF-2: Rejection** → Admin rejects with reason. User receives email with feedback

**Postconditions:**
- Build submitted for moderation

**Business Rules:** BR-8.2

---

### UC-31: Reset Password (Partner Portal)

| Attribute | Detail |
|-----------|--------|
| **UC-ID** | UC-31 |
| **Title** | Reset Partner Portal Password |
| **Actor** | Authorized Distributor |
| **Preconditions** | User has forgotten password |
| **BRD Ref** | US-7.1 |
| **Priority** | P2 |

**Basic Flow:**
1. User clicks "Forgot Password" on partner login page
2. User enters registered email
3. System sends password reset link (valid 24 hours)
4. User clicks link in email
5. User enters new password (meeting complexity requirements)
6. System confirms: "Password updated. Please log in."

**Alternative Flows:**
- **AF-1: Email not found** → System shows generic message (security): "If an account exists, a reset email has been sent."
- **AF-2: Link expired** → System shows: "This link has expired. Request a new reset link."

**Postconditions:**
- User password updated

**Business Rules:** BR-7.1

---

### UC-32: Download Marketing Assets (Partner Portal)

| Attribute | Detail |
|-----------|--------|
| **UC-ID** | UC-32 |
| **Title** | Download Co-Branded Marketing Assets |
| **Actor** | Distributor Marketing Manager (Authorized Distributor) |
| **Preconditions** | User is logged into Partner Portal with Marketing/Procurement role |
| **BRD Ref** | US-7.2 |
| **URD Ref** | UR-7.2 |
| **Priority** | P2 |

**Basic Flow:**
1. User navigates to "Marketing Assets" within the Partner Portal
2. System displays asset library, organized by Product Images / Banners / Datasheets / Videos / POS Materials / Logos
3. User filters by product, language, or format
4. User previews asset(s) before download
5. User selects one or many assets and clicks "Download" (or "Download Selected as ZIP")
6. System logs the download (auditable per BR-7.x) and serves the file(s)

**Alternative Flows:**
- **AF-1: Asset not yet localized** → System shows: "This asset is not yet available in your selected language. Showing English version."
- **AF-2: Bulk ZIP exceeds size limit** → System advises user to split selection: "Selection too large. Please reduce to under 500MB."

**Postconditions:**
- User has obtained the requested marketing asset(s)
- Download event logged for audit and partner-engagement analytics

**Business Rules:** BR-7.1, BR-7.3

---

### UC-33: Browse Solutions Hub

| Attribute | Detail |
|-----------|--------|
| **UC-ID** | UC-33 |
| **Title** | Browse Solutions Hub by Vertical |
| **Actor** | Sarah, Faisal, Ms. Tan, Mr. Rahman |
| **Preconditions** | User has navigated to `/solutions/` |
| **BRD Ref** | US-11.1 |
| **Priority** | P1 |

**Basic Flow:**
1. User clicks "Solutions" in main navigation
2. System loads Solutions Hub with vertical-tile navigation
3. User clicks vertical (e.g., "Telco/BFSI/Government")
4. System loads vertical solution page with industry context, recommended bundles, certifications, case studies, contact CTA
5. User clicks a recommended SKU bundle
6. System navigates to product detail page

**Alternative Flows:**
- AF-1: Reserved Solution (Data Center) → System hides tile until activated
- AF-2: Mobile → Tile grid stacks single-column

**Postconditions:** User has identified a vertical-relevant product bundle.

**Business Rules:** BR-11.1, BR-11.2, BR-11.3

---

### UC-34: Read Case Study

| Attribute | Detail |
|-----------|--------|
| **UC-ID** | UC-34 |
| **Title** | Read Case Study |
| **Actor** | Sarah, Mr. Patel |
| **Preconditions** | User on Solutions or Case Studies hub |
| **BRD Ref** | US-11.2 |
| **Priority** | P1 |

**Basic Flow:**
1. User clicks "Case Studies"
2. System shows filterable list (vertical, region, product)
3. User filters and clicks a case study
4. System shows case-study template: customer profile, challenge, solution, products deployed, metrics, quote, downloadable PDF
5. User clicks "Download PDF"

**Postconditions:** User has the PDF case study.

**Business Rules:** BR-11.2

---

### UC-35: Read Technology Article

| Attribute | Detail |
|-----------|--------|
| **UC-ID** | UC-35 |
| **Title** | Read Technology / R&D Article |
| **Actor** | Mr. Patel, Sarah, Kumar, Faisal |
| **Preconditions** | User on `/technology/` or arrives via search |
| **BRD Ref** | US-12.1 |
| **Priority** | P1 |

**Basic Flow:**
1. User clicks "Technology" in main navigation
2. System loads Technology Hub with tile navigation
3. User clicks "PCIe Gen 5 Deep Dive"
4. System loads article with diagrams, benchmark tables, embedded video
5. User scrolls and engages with rich media
6. User clicks cross-link to CoreX Pro product family

**Business Rules:** BR-12.1, BR-12.4

---

### UC-36: Download Whitepaper

| Attribute | Detail |
|-----------|--------|
| **UC-ID** | UC-36 |
| **Title** | Download Technology Whitepaper |
| **Actor** | Sarah, Mr. Patel, Faisal |
| **Preconditions** | User on `/technology/whitepapers/` |
| **BRD Ref** | US-12.2 |
| **Priority** | P1 |

**Basic Flow:**
1. User browses whitepaper library
2. User clicks "Download"
3. System (Phase 2) prompts for email + company (gating)
4. User submits, receives PDF
5. Download tracked in analytics

**Alternative Flows:**
- AF-1: Phase 1 → No gating, direct download

**Business Rules:** BR-12.2

---

### UC-37: Read Buying Guide

| Attribute | Detail |
|-----------|--------|
| **UC-ID** | UC-37 |
| **Title** | Read Buying Guide |
| **Actor** | All — especially Aisha, Rahul |
| **Preconditions** | User on `/learn/buying-guide/` or arrives via search |
| **BRD Ref** | US-13.1 |
| **Priority** | P1 |

**Basic Flow:**
1. User searches "DDR4 vs DDR5" on Google, lands on `/learn/buying-guide/ddr4-vs-ddr5/`
2. System loads guide with structured sections, comparison table, "Recommended TwinMOS Products" sidebar
3. User scrolls and reads
4. User clicks recommended product CTA

**Business Rules:** BR-13.1, BR-13.2

---

### UC-38: Read Explained Article

| Attribute | Detail |
|-----------|--------|
| **UC-ID** | UC-38 |
| **Title** | Read "Explained" Article |
| **Actor** | All — especially new buyers |
| **Preconditions** | User on `/learn/explained/` or arrives via Glossary or search |
| **BRD Ref** | US-13.2 |
| **Priority** | P1 |

**Basic Flow:**
1. User searches "what is HMB SSD" on Google, lands on `/learn/explained/what-is-hmb/`
2. System loads article with plain-language summary plus optional "deep dive" expansion
3. User clicks linked glossary term
4. System opens glossary entry inline or navigates

**Business Rules:** BR-13.4

---

### UC-39: View Benchmark

| Attribute | Detail |
|-----------|--------|
| **UC-ID** | UC-39 |
| **Title** | View Performance Benchmark |
| **Actor** | Rahul, Kumar |
| **Preconditions** | User on `/learn/benchmarks/` |
| **BRD Ref** | US-13.3 |
| **Priority** | P1 |

**Basic Flow:**
1. User clicks "Benchmarks" in Learn navigation
2. User selects "CoreX Pro vs Competitors"
3. System shows benchmark with methodology, test rig, results table, charts, conclusion
4. User examines methodology disclosure
5. User clicks linked product page

**Business Rules:** BR-13.3

---

### UC-40: Submit Job Application

| Attribute | Detail |
|-----------|--------|
| **UC-ID** | UC-40 |
| **Title** | Submit Job Application |
| **Actor** | Sara (Job Applicant) |
| **Preconditions** | User on a job listing page |
| **BRD Ref** | US-14.2 |
| **Priority** | P1 |

**Basic Flow:**
1. Sara browses `/careers/`, clicks open role
2. System loads role page; Sara clicks "Apply"
3. System shows multi-step application form
4. Sara fills personal info, uploads CV (PDF), checks GDPR consent (linked to Job Applicant Privacy Notice)
5. Sara clicks Submit
6. System shows success page with reference number; auto-reply sent to email

**Alternative Flows:**
- AF-1: CV too large (> 10MB) → System rejects: "Maximum CV size is 10MB."
- AF-2: EU applicant without GDPR consent → Submit button disabled
- AF-3: Job filled mid-application → System shows: "This role has been filled. Browse other open roles."

**Business Rules:** BR-14.2, BR-14.3, BR-14.4

---

### UC-41: Newsletter Subscribe / Confirm / Unsubscribe

| Attribute | Detail |
|-----------|--------|
| **UC-ID** | UC-41 |
| **Title** | Newsletter Lifecycle |
| **Actor** | All visitors |
| **Preconditions** | User on any page (footer signup) or marketing campaign |
| **BRD Ref** | US-15.1 |
| **Priority** | P1 |

**Basic Flow (Subscribe):**
1. User enters email + optional country/interests in signup form
2. System sends double opt-in email
3. User clicks confirm link → Newsletter Confirm page → Subscription activated

**Basic Flow (Unsubscribe):**
1. User clicks "unsubscribe" link in any newsletter email
2. System loads Newsletter Unsubscribe page
3. One-click confirms unsubscription
4. System shows: "You've been unsubscribed."

**Business Rules:** BR-4.5, BR-15.4

---

### UC-42: View Promotion / Launch Campaign

| Attribute | Detail |
|-----------|--------|
| **UC-ID** | UC-42 |
| **Title** | View Promotion or Launch Campaign |
| **Actor** | All visitors |
| **Preconditions** | User on `/promotions/` or arrives via campaign URL |
| **BRD Ref** | US-15.2, US-15.3 |
| **Priority** | P1 |

**Basic Flow:**
1. User clicks "Promotions" in footer or marketing email
2. System shows active promotions filtered by user country
3. User clicks promo for VOLTX RGB launch
4. System loads campaign microsite with hero, story, products, where-to-buy CTA

**Alternative Flows:**
- AF-1: Promo expired → Auto-archived; user does not see expired promos
- AF-2: Geo-targeted promo → User's country must match

**Business Rules:** BR-15.1

---

### UC-43: Read Privacy / Compliance / ESG Page

| Attribute | Detail |
|-----------|--------|
| **UC-ID** | UC-43 |
| **Title** | Read Privacy, Compliance, or ESG Disclosure |
| **Actor** | Sarah, Ms. Tan, all visitors |
| **Preconditions** | User on `/legal/` |
| **BRD Ref** | US-16.1 through US-16.5 |
| **Priority** | P0 |

**Basic Flow:**
1. User clicks footer link (e.g., "Privacy Policy")
2. System loads Privacy Policy with Last Updated date, table of contents
3. User reads relevant section
4. (Compliance variant) User clicks compliance certification → certificate PDF download
5. (Data deletion variant) User clicks "Request Data Deletion" → form

**Business Rules:** BR-16.1, BR-16.2, BR-16.4

---

### UC-44: Manage Cookie Preferences

| Attribute | Detail |
|-----------|--------|
| **UC-ID** | UC-44 |
| **Title** | Manage Cookie Preferences |
| **Actor** | All visitors |
| **Preconditions** | User has dismissed cookie banner or visits `/legal/cookie-preferences/` |
| **BRD Ref** | US-16.1 |
| **Priority** | P0 |

**Basic Flow:**
1. User clicks "Cookie Preferences" in footer
2. System shows granular consent UI: Strictly Necessary, Analytics, Marketing, Personalization
3. User toggles preferences and clicks Save
4. System persists consent and updates analytics/marketing scripts accordingly

**Business Rules:** BR-GLOBAL-5

---

### UC-45: Verify Serial Number (SN-Check)

| Attribute | Detail |
|-----------|--------|
| **UC-ID** | UC-45 |
| **Title** | Verify Product Authenticity (SN-Check) |
| **Actor** | Aisha, Kumar, Mr. Patel |
| **Preconditions** | User has purchased a TwinMOS product and has serial number |
| **BRD Ref** | US-17.1 |
| **Priority** | P2 |

**Basic Flow:**
1. User navigates to `/support/sn-check/`
2. User enters serial number, optionally selects product family
3. User clicks Verify
4. System returns: VERIFIED GENUINE (with warranty info) / SERIAL NOT FOUND / SUSPECTED COUNTERFEIT (with reporting CTA)

**Alternative Flows:**
- AF-1: Rate-limited → "Too many lookups. Please wait."
- AF-2: Suspected counterfeit → User clicks "Report Counterfeit" → UC-46

**Business Rules:** BR-17.1

---

### UC-46: Report Counterfeit Product

| Attribute | Detail |
|-----------|--------|
| **UC-ID** | UC-46 |
| **Title** | Report Counterfeit |
| **Actor** | User who suspects counterfeit |
| **Preconditions** | User on counterfeit reporting form |
| **BRD Ref** | US-17.2 |
| **Priority** | P2 |

**Basic Flow:**
1. User fills reporting form: contact info, serial number, retailer, photos, description
2. User submits
3. System sends to Brand Protection team; user receives auto-reply with reference number

**Business Rules:** BR-17.2

---

### UC-47: Apply to OEM/ODM or System Builder Program

| Attribute | Detail |
|-----------|--------|
| **UC-ID** | UC-47 |
| **Title** | Apply to Channel Program (OEM/ODM, System Builder, Reseller) |
| **Actor** | Mr. Wong (OEM/ODM), Kumar (System Builder), small reseller |
| **Preconditions** | User on the program's pitch page |
| **BRD Ref** | US-18.1 |
| **Priority** | P0 |

**Basic Flow:**
1. User browses `/partners/oem-odm-program/` (or system-builder, reseller)
2. User clicks "Apply"
3. System shows program-specific application form
4. User fills, submits
5. System routes to Sales with high-priority flag; auto-reply within 5 minutes

**Business Rules:** BR-18.1

---

### UC-48: Visit Regional Distributor Hub

| Attribute | Detail |
|-----------|--------|
| **UC-ID** | UC-48 |
| **Actor** | Mr. Patel, regional buyers |
| **Preconditions** | User in target region or directly accessing hub URL |
| **BRD Ref** | US-18.3 |
| **Priority** | P1 |

**Basic Flow:**
2. System loads regional hub with featured distributor info, product availability, contact
3. User browses local promotions or contacts the regional manager

**Alternative Flows:**
- AF-1: Partnership not yet active → System shows generic "India distribution" placeholder

**Business Rules:** BR-18.2, BR-18.3

---

### UC-49: Press Room — Download Media Kit

| Attribute | Detail |
|-----------|--------|
| **UC-ID** | UC-49 |
| **Title** | Download Media Kit |
| **Actor** | Lina (Media / Industry Analyst) |
| **Preconditions** | User on `/about/press/` |
| **BRD Ref** | US-19.1 (Press Room) |
| **Priority** | P1 |

**Basic Flow:**
1. Lina visits Press Room
2. Clicks "Media Kit"
3. System shows asset library: logos (PNG/SVG/EPS), brand guidelines, executive headshots, product imagery
4. Lina clicks "Download all as ZIP"
5. System serves ZIP

**Postconditions:** Lina has brand assets for editorial use.

---

### UC-50: Browse Country Landing Page

| Attribute | Detail |
|-----------|--------|
| **UC-ID** | UC-50 |
| **Title** | Browse Country / Regional Landing Page |
| **Actor** | All — region-specific |
| **Preconditions** | User in country or directly accessing country URL |
| **BRD Ref** | US-9.2 (expanded) |
| **Priority** | P1 |

**Basic Flow:**
1. System auto-detects user's country (e.g., Nigeria) and shows banner: "Welcome — Nigeria. View regional content?"
2. User accepts; System navigates to `/nigeria/` (or equivalent)
3. Country landing shows: regional distributor list, local certifications (e.g., NCC for Nigeria), local news/events, regional contact

**Alternative Flows:**
- AF-1: Country not in 28-list → System shows generic "Find a distributor" with link to inquiry form
- AF-2: VPN/incognito misdetection → User manually selects country

**Business Rules:** BR-3.1, BR-9.3, BR-9.4

---

## 19. Use Case Diagrams

### 19.1 Product Discovery Use Case Diagram

```
                    ┌─────────────────────────────────────────┐
                    │         Anonymous Visitor               │
                    │    (Rahul, Aisha, Kumar, Sarah)         │
                    └─────────────────────────────────────────┘
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        │                             │                             │
        ▼                             ▼                             ▼
┌───────────────┐           ┌───────────────┐           ┌───────────────┐
│ UC-1: Browse  │           │ UC-2: Filter  │           │ UC-3: View    │
│   Catalog     │           │   Products    │           │   Product     │
│               │           │               │           │   Details     │
└───────────────┘           └───────────────┘           └───────────────┘
        │                             │                             │
        └─────────────────────────────┼─────────────────────────────┘
                                      │
                                      ▼
                    ┌─────────────────────────────────────────┐
                    │         UC-4: Compare Products          │
                    │         UC-5: Download Datasheet        │
                    └─────────────────────────────────────────┘
```

### 19.2 Compatibility & Purchase Use Case Diagram

```
                    ┌─────────────────────────────────────────┐
                    │         Anonymous Visitor               │
                    │         (Aisha, Rahul, Kumar)           │
                    └─────────────────────────────────────────┘
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        │                             │                             │
        ▼                             ▼                             ▼
┌───────────────┐           ┌───────────────┐           ┌───────────────┐
│ UC-6: Search  │           │ UC-7: Search  │           │ UC-8: Find    │
│ by Device     │           │ by Motherboard│           │ Local Retailer│
└───────────────┘           └───────────────┘           └───────────────┘
        │                             │                             │
        │                             │                             │
        ▼                             ▼                             ▼
┌───────────────┐           ┌───────────────┐           ┌───────────────┐
│ View Product  │           │ View Product  │           │ Get Directions│
│   Details     │           │   Details     │           │   / Contact   │
└───────────────┘           └───────────────┘           └───────────────┘
```

### 19.3 Support & Self-Service Use Case Diagram

```
                    ┌─────────────────────────────────────────┐
                    │      Registered Product Owner           │
                    │              (All)                      │
                    └─────────────────────────────────────────┘
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        │                             │                             │
        ▼                             ▼                             ▼
┌───────────────┐           ┌───────────────┐           ┌───────────────┐
│ UC-13:        │           │ UC-14:        │           │ UC-15:        │
│ Register      │           │ Submit        │           │ Browse        │
│ Warranty      │           │ RMA           │           │ Knowledge Base│
└───────────────┘           └───────────────┘           └───────────────┘
        │                             │                             │
        ▼                             ▼                             ▼
┌───────────────┐           ┌───────────────┐           ┌───────────────┐
│ Receive       │           │ Track Status  │           │ Rate Article  │
│ Confirmation  │           │ & Get Updates │           │ Or Contact    │
└───────────────┘           └───────────────┘           └───────────────┘
```

### 19.4 Partner Portal Use Case Diagram

```
                    ┌─────────────────────────────────────────┐
                    │      Authorized Distributor             │
                    │   (Procurement, Marketing Managers)     │
                    └─────────────────────────────────────────┘
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        │                             │                             │
        ▼                             ▼                             ▼
┌───────────────┐           ┌───────────────┐           ┌───────────────┐
│ UC-16: Access │           │ UC-17:        │           │ UC-32:        │
│ Partner       │           │ Download      │           │ Download      │
│ Portal        │           │ Price List    │           │ Marketing     │
└───────────────┘           └───────────────┘           │ Assets        │
                                      │                 └───────────────┘
                                      ▼
                    ┌─────────────────────────────────────────┐
                    │         UC-31: Reset Password           │
                    │         (Self-Service Account Mgmt)     │
                    └─────────────────────────────────────────┘
```

> Note: UC-32 (Download Marketing Assets) is referenced from UR-7.2 and is documented in the Use Case Catalog (§18) under the Partner Portal cluster. Earlier drafts mistakenly used the placeholder ID "UC-7.2"; the correct identifier is **UC-32**.

### 19.5 Cross-Cutting Use Case Diagram (Accessibility, Sharing, Localization, Firmware)

```
                    ┌─────────────────────────────────────────┐
                    │   Anonymous / Registered Users          │
                    └─────────────────────────────────────────┘
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        │                             │                             │
        ▼                             ▼                             ▼
┌───────────────┐           ┌───────────────┐           ┌───────────────┐
│ UC-19: Switch │           │ UC-24: View   │           │ UC-25: Use    │
│ Language      │           │ Region Content│           │ Live Chat     │
└───────────────┘           └───────────────┘           └───────────────┘

                    ┌─────────────────────────────────────────┐
                    │       Specialized Users                 │
                    └─────────────────────────────────────────┘
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        │                             │                             │
        ▼                             ▼                             ▼
┌───────────────┐           ┌───────────────┐           ┌───────────────┐
│ UC-26: Use    │           │ UC-27: Download│          │ UC-28: View   │
│ Accessibility │           │ Firmware      │           │ Shared        │
│ Tools         │           │               │           │ Comparison URL│
└───────────────┘           └───────────────┘           └───────────────┘
```

---


## 20. UI Standards & Design System

> **Purpose:** Define the visual and interaction standards that ensure a consistent, professional, and on-brand user experience across all pages and components.

### 20.1 Design Philosophy

The TwinMOS website must serve **two distinct visual modes** while maintaining underlying consistency:

| Mode | Audience | Visual Character |
|------|----------|-----------------|
| **Corporate** | Enterprise buyers, distributors, general consumers | Clean, professional, trustworthy, light-mode preferred |
| **Gaming** | PC enthusiasts, gamers, RGB enthusiasts | Bold, dynamic, immersive, dark-mode |

**Core Principles:**
1. **Clarity over decoration** — Every element serves a user goal
2. **Performance is a feature** — Animations and visuals never compromise load times
3. **Mobile-first, desktop-refined** — Design for the smallest screen first, enhance for larger
4. **Accessibility by default** — WCAG 2.1 AA is the baseline, not an afterthought

### 20.2 Color Palette

#### Corporate Mode (Light)

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-primary` | `#0A2540` | Headers, primary buttons, footer background |
| `--color-primary-hover` | `#143D5C` | Button hover states |
| `--color-accent` | `#00A3E0` | Links, CTAs, highlights, active states |
| `--color-accent-hover` | `#0088BD` | Link hover, CTA hover |
| `--color-background` | `#FFFFFF` | Page background |
| `--color-surface` | `#F6F9FC` | Cards, panels, alternate sections |
| `--color-border` | `#E3E8EE` | Dividers, input borders |
| `--color-text-primary` | `#1A1A2E` | Headings, primary text |
| `--color-text-secondary` | `#5A6578` | Body text, descriptions |
| `--color-text-muted` | `#8B95A5` | Captions, metadata |
| `--color-success` | `#00C853` | Success states, confirmations |
| `--color-warning` | `#FFB300` | Warnings, cautions |
| `--color-error` | `#FF1744` | Errors, validation failures |

#### Gaming Mode (Dark)

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-gaming-bg` | `#0D0D0D` | Page background |
| `--color-gaming-surface` | `#1A1A1A` | Cards, panels |
| `--color-gaming-accent` | `#00F0FF` | Neon cyan for RGB accent |
| `--color-gaming-accent-2` | `#FF0055` | Neon magenta for RGB accent |
| `--color-gaming-text` | `#FFFFFF` | Primary text |
| `--color-gaming-text-secondary` | `#A0A0A0` | Secondary text |

#### RGB Gradient (Gaming Hub Only)

```css
/* Animated RGB accent for gaming hub hero */
--gradient-rgb: linear-gradient(90deg, #FF0000, #FF7F00, #FFFF00, #00FF00, #0000FF, #4B0082, #9400D3);
```

### 20.3 Typography

| Element | Font Family | Size (Desktop) | Size (Mobile) | Weight | Line Height |
|---------|-------------|----------------|---------------|--------|-------------|
| H1 (Hero) | Inter | 48px | 32px | 700 | 1.1 |
| H2 (Section) | Inter | 36px | 28px | 600 | 1.2 |
| H3 (Card Title) | Inter | 24px | 20px | 600 | 1.3 |
| H4 (Subsection) | Inter | 20px | 18px | 500 | 1.4 |
| Body | Inter | 16px | 16px | 400 | 1.6 |
| Body Small | Inter | 14px | 14px | 400 | 1.5 |
| Caption | Inter | 12px | 12px | 400 | 1.4 |
| Button | Inter | 14px | 14px | 600 | 1.0 |
| Nav Link | Inter | 14px | 14px | 500 | 1.0 |
| Gaming Display | Inter (or display font) | 64px | 40px | 800 | 1.0 |

**Font Stack:**
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

**Arabic Font Stack (RTL):**
```css
font-family: 'Noto Sans Arabic', 'Inter', sans-serif;
```

### 20.4 Spacing System

Based on 8px grid:

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight internal spacing |
| `--space-2` | 8px | Icon + text, inline elements |
| `--space-3` | 12px | Button padding (vertical) |
| `--space-4` | 16px | Card padding, standard gap |
| `--space-5` | 24px | Section internal padding |
| `--space-6` | 32px | Component margins |
| `--space-7` | 48px | Section margins |
| `--space-8` | 64px | Large section spacing |
| `--space-9` | 96px | Hero section padding |
| `--space-10` | 128px | Major section breaks |

### 20.5 Shadow & Elevation

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Cards at rest |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.05)` | Hover states, dropdowns |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.08), 0 4px 6px rgba(0,0,0,0.04)` | Modals, popovers |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)` | Sticky headers, floating elements |

### 20.6 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Buttons, tags, small elements |
| `--radius-md` | 8px | Cards, inputs, images |
| `--radius-lg` | 12px | Large cards, modals |
| `--radius-xl` | 16px | Feature sections, hero containers |
| `--radius-full` | 9999px | Pills, avatars, circular buttons |

### 20.7 Z-Index Scale

| Layer | Z-Index | Elements |
|-------|---------|----------|
| Background | 0 | Page content |
| Elevated Content | 10 | Cards, sticky elements |
| Navigation | 100 | Header, mobile menu |
| Overlays | 200 | Backdrops, dimmers |
| Modals | 300 | Dialogs, lightboxes |
| Toasts / Notifications | 400 | Success/error messages |
| Loading Spinners | 500 | Full-screen loaders |
| Tooltip | 600 | Hover tooltips |

---

## 21. Page-Level UI Requirements

### 21.1 Homepage

**User Goal:** Understand who TwinMOS is, what they offer, and why they matter — within 5 seconds.

| Element | Requirement | Priority |
|---------|-------------|----------|
| **Header** | Sticky on scroll, collapses logo on mobile, language selector visible | P0 |
| **Hero Section** | Full-width carousel (max 3 slides), auto-advances every 6 seconds, manual controls, pause on hover | P0 |
| **Product Categories** | 5 category cards with icon + label, hover lift effect, click to category | P0 |
| **Featured Products** | 4 product cards, horizontal scroll on mobile, "View All" link | P0 |
| **Brand Trust** | "Trusted in 93+ countries" with partner/distributor count, certification badges | P1 |
| **News Teaser** | 3 latest news cards with image, title, date | P1 |
| **Gaming Hub CTA** | Dark-themed card linking to VOLTX hub with bold imagery | P1 |
| **Footer** | 4-column layout: Products, Support, Company, Connect + newsletter signup + legal links | P0 |

**Performance:** LCP target < 1.8s (hero image optimized, preloaded)

---

### 21.2 Product Category Page

**User Goal:** Browse products in a category and narrow down to relevant options.

| Element | Requirement | Priority |
|---------|-------------|----------|
| **Breadcrumb** | Home > Products > Memory > DDR5 Desktop | P0 |
| **Page Title** | H1 with product count: "DDR5 Desktop Memory (12 products)" | P0 |
| **Filter Panel** | Left sidebar (desktop), bottom sheet (mobile), collapsible sections | P0 |
| **Product Grid** | 3 columns desktop, 2 tablet, 1 mobile, 24px gap | P0 |
| **Product Card** | Image, name, SKU, key specs (capacity, speed), "New" badge if applicable, "View" CTA | P0 |
| **Sort Dropdown** | Top-right of grid: Relevance, Name, Price, Capacity, Speed | P0 |
| **Pagination / Load More** | Infinite scroll preferred with "Load More" fallback | P1 |
| **Active Filters** | Pill tags at top of grid with "Clear All" | P0 |
| **Empty State** | Illustration + "No products match" + suggested categories | P1 |

---

### 21.3 Product Detail Page

**User Goal:** Evaluate a specific product comprehensively.

| Element | Requirement | Priority |
|---------|-------------|----------|
| **Above the Fold** | Hero image (left 50%), product info (right 50%): name, SKU, short description, key specs summary, warranty badge, "Where to Buy" CTA | P0 |
| **Image Gallery** | Thumbnail strip below hero, click to zoom/lightbox, swipe on mobile | P0 |
| **Tab Navigation** | Specifications, Features, Compatible Systems, Downloads, Reviews (if applicable) | P0 |
| **Spec Table** | Structured rows: Parameter / Value, grouped by category | P0 |
| **Features List** | Icon + text for each key feature, scannable | P0 |
| **Related Products** | 4 products in horizontal scroll below main content | P1 |
| **Social Sharing** | WhatsApp, Twitter/X, Facebook, Email, Copy Link | P1 |
| **Breadcrumb** | Home > Products > Memory > DDR5 > [Product Name] | P0 |

**Mobile Layout:** Stacked single column. Image gallery full-width. CTA sticky at bottom.

---

### 21.4 Product Comparison Page

**User Goal:** See differences between products at a glance.

| Element | Requirement | Priority |
|---------|-------------|----------|
| **Comparison Table** | Products as columns, specs as rows, max 4 products | P1 |
| **Highlight Differences** | Different values in bold or colored background | P1 |
| **Remove Product** | "X" on each column header | P1 |
| **Add Product** | "Add Product" button opens category selector | P2 |
| **Print Button** | Clean print stylesheet, hides navigation | P1 |
| **Share Button** | Generates shareable URL | P1 |
| **Empty Specs** | Dash (—) for missing values, never blank cells | P1 |

---

### 21.5 System Compatibility Finder Page

**User Goal:** Find products compatible with my device.

| Element | Requirement | Priority |
|---------|-------------|----------|
| **Search Interface** | Centered, prominent, brand dropdown + model input with auto-suggest | P0 |
| **Tab Switcher** | "By Laptop/Desktop" / "By Motherboard" | P0 |
| **Results Page** | Grouped by category (RAM, SSD), product cards with compatibility badge | P0 |
| **Device Info Card** | Shows detected device specs: max RAM, slots, supported types | P0 |
| **No Results State** | Friendly message + contact support CTA | P0 |
| **SEO Content** | Explanatory text below fold for search engines | P1 |

---

### 21.6 Where to Buy Page

**User Goal:** Find local or online retailers.

| Element | Requirement | Priority |
|---------|-------------|----------|
| **Country Detection** | Auto-detect with manual override dropdown | P0 |
| **Map View** | Interactive map with clustered pins, click for detail card | P0 |
| **List View** | Toggle between map and list; list shows name, address, phone, distance | P0 |
| **Retailer Card** | Logo (if available), name, address, phone, website link, product categories carried | P0 |
| **Filter** | Online Store, Physical Store, Distributor, System Builder | P1 |
| **Featured Distributor** | verified regional distributors highlighted | P0 |
| **Directions Button** | Opens Google Maps with destination pre-filled | P1 |

---

### 21.7 Gaming Hub / VOLTX Brand Page

**User Goal:** Experience the VOLTX brand immersively.

| Element | Requirement | Priority |
|---------|-------------|----------|
| **Hero** | Full-width video or animated hero, dark theme, bold headline | P1 |
| **Product Showcase** | Grid of VOLTX products with hover effects (glow, scale) | P1 |
| **RGB Showcase** | Interactive or animated lighting demo | P2 |
| **Build Gallery Teaser** | 6 featured builds linking to full gallery | P3 |
| **Specs Comparison** | VOLTX vs competitors table (performance-focused) | P2 |
| **Social Proof** | Review quotes, awards, influencer mentions | P2 |
| **CTA** | "Explore Products" linking to VOLTX category | P1 |

---

### 21.8 Support Center

**User Goal:** Find help, register warranty, or contact support.

| Element | Requirement | Priority |
|---------|-------------|----------|
| **Search Bar** | Prominent, placeholder: "Search help articles..." | P1 |
| **Category Cards** | Warranty, RMA, Firmware, Knowledge Base, Installation Guides, Contact | P1 |
| **Quick Links** | Most viewed articles, popular FAQs | P1 |
| **Contact CTA** | "Can't find what you need? Contact us" with form link | P0 |

---

### 21.9 Contact / Inquiry Forms

**User Goal:** Reach TwinMOS with a specific need.

| Element | Requirement | Priority |
|---------|-------------|----------|
| **Form Layout** | Single column, labels above inputs, generous spacing | P0 |
| **Field Types** | Text, email (with validation), dropdown, textarea, file upload, reCAPTCHA | P0 |
| **Real-Time Validation** | Inline errors appear on blur, not just on submit | P0 |
| **Submit Button** | Full-width on mobile, prominent color, loading state | P0 |
| **Success State** | Clear confirmation, ticket number, next steps | P0 |
| **Error State** | Specific error per field, scroll to first error | P0 |

---

### 21.10 Partner Portal Login

**User Goal:** Access secure distributor resources.

| Element | Requirement | Priority |
|---------|-------------|----------|
| **Login Form** | Email, password, "Remember me," "Forgot password" | P2 |
| **Branding** | Subtle TwinMOS logo, professional but not marketing-heavy | P2 |
| **Security Notice** | "This area is restricted to authorized distributors" | P2 |
| **Error Messaging** | Generic on failure: "Invalid credentials. Please try again." | P2 |

---

### 21.11 News & Events Pages

**User Goal:** Read company news and event coverage.

| Element | Requirement | Priority |
|---------|-------------|----------|
| **News Listing** | Card grid, filter by category, search | P0 |
| **Article Page** | Featured image, title, author, date, body, social sharing, related articles | P0 |
| **Event Page** | Hero image, date/location, description, photo gallery, video embeds | P1 |
| **Archive** | Year-based pagination for past events | P1 |

---

### 21.12 About Us / Company Pages

**User Goal:** Verify company credibility and learn about TwinMOS.

| Element | Requirement | Priority |
|---------|-------------|----------|
| **Company Story** | Timeline of milestones (1998–present), professional copy | P1 |
| **Leadership** | Photos, names, titles, brief bios | P1 |
| **Global Presence** | Map showing 93+ countries, key office locations | P1 |
| **Certifications** | Badge grid with ISO 9001 (mfg partners), CE, UKCA, FCC, RoHS, REACH, EAC; JEDEC for DRAM | P1 |
| **Awards** | Filterable gallery of awards with images and descriptions | P1 |
| **Manufacturing** | Photos/video of facilities (if available) | P2 |

---

### 21.13 Legal Pages

**User Goal:** Read terms, privacy policy, and warranty terms.

| Element | Requirement | Priority |
|---------|-------------|----------|
| **Clear Structure** | Table of contents sidebar, heading hierarchy | P0 |
| **Last Updated Date** | Visible at top of each legal page | P0 |
| **Print-Friendly** | Clean print stylesheet | P1 |
| **Contact for Questions** | "Questions? Contact legal@twinmos.com" | P1 |

---

### 21.14 404 / Error Pages

**User Goal:** Recover gracefully when a page is not found.

| Element | Requirement | Priority |
|---------|-------------|----------|
| **Friendly Message** | "Page not found. Let's get you back on track." | P0 |
| **Search Bar** | "Search for what you need" with prominent input | P0 |
| **Quick Links** | Products, Support, Contact, Home | P0 |
| **Illustration** | On-brand, not generic — perhaps a "disconnected memory module" visual | P1 |
| **No Technical Jargon** | "404" can be small; user-friendly message is primary | P0 |

---

## 22. Component-Level UI Requirements

### 22.1 Buttons

| Variant | Background | Text | Border | Hover | Active | Disabled |
|---------|-----------|------|--------|-------|--------|----------|
| **Primary** | `#0A2540` | `#FFFFFF` | none | `#143D5C` + lift | `#0A2540` darken | `#E3E8EE` bg, `#8B95A5` text |
| **Secondary** | transparent | `#0A2540` | `1px #0A2540` | `#0A2540` bg, `#FFFFFF` text | same | `#E3E8EE` border, `#8B95A5` text |
| **Accent** | `#00A3E0` | `#FFFFFF` | none | `#0088BD` + lift | `#0077A8` | `#E3E8EE` bg, `#8B95A5` text |
| **Ghost** | transparent | `#00A3E0` | none | `#00A3E0` at 10% bg | same | `#8B95A5` text |
| **Gaming** | `#00F0FF` | `#0D0D0D` | none | `#FFFFFF` + glow | `#00D0DD` | `#333333` bg, `#666666` text |

**Sizing:**
- Small: height 32px, padding 8px 16px, font 12px
- Medium: height 40px, padding 12px 24px, font 14px
- Large: height 48px, padding 16px 32px, font 16px

**Icon Buttons:** Icon + text preferred; icon-only only for universally understood actions (search, close, menu)

### 22.2 Cards

**Product Card:**
- Aspect ratio: 3:4 (portrait) or 4:3 (landscape) depending on category
- Image: Top 60%, content: Bottom 40%
- Hover: Lift 4px (`shadow-md`), image scale 1.05
- Focus: 2px `#00A3E0` outline

**News Card:**
- Image: Top, 16:9 aspect ratio
- Content: Title (2 lines max), excerpt (2 lines max), date, category tag
- Hover: Image scale 1.03, title color change to accent

**Retailer Card:**
- Logo (if available) or initial letter in circle
- Name, address, phone, website link
- "Get Directions" button

### 22.3 Forms

**Input Fields:**
- Height: 48px (touch-friendly)
- Border: 1px `#E3E8EE`, radius 8px
- Focus: Border `#00A3E0`, subtle shadow
- Error: Border `#FF1744`, error text below
- Label: Above input, 14px, `#5A6578`
- Placeholder: `#8B95A5`

**Dropdowns:**
- Same styling as inputs
- Options panel: `shadow-lg`, radius 8px, max-height 240px with scroll

**Textareas:**
- Min-height: 120px
- Auto-resize optional (max 400px)

**Checkboxes & Radios:**
- Custom styled, 20×20px touch target
- Checked state: `#00A3E0` fill with white checkmark

**File Upload:**
- Drag-and-drop zone with visual feedback
- Progress indicator during upload
- File name + remove button after upload

### 22.4 Tables

**Spec Tables:**
- Alternating row backgrounds (subtle `#F6F9FC` / `#FFFFFF`)
- Header: `#0A2540` background, `#FFFFFF` text
- Parameter column: left-aligned, 40% width
- Value column: left-aligned, 60% width
- Responsive: Cards on mobile (parameter as label, value as content)

**Comparison Tables:**
- Sticky first column (spec names)
- Highlighted differences: `#E6F7FF` background
- Horizontal scroll on mobile with swipe hint

### 22.5 Modals & Overlays

**Lightbox (Image Gallery):**
- Dark backdrop (`rgba(0,0,0,0.9)`)
- Image centered, max 90vw / 90vh
- Close button top-right, ESC key closes
- Prev/Next arrows, swipe on mobile
- Keyboard navigation: ← → arrows

**Confirmation Modal:**
- Centered, max-width 480px
- Title, message, primary + secondary actions
- Backdrop click does NOT close (prevents accidental dismissal)
- Focus trap inside modal

**Mobile Bottom Sheet:**
- Slides up from bottom, max-height 85vh
- Drag handle at top for dismiss
- Backdrop tap dismisses
- Scrollable content area

### 22.6 Navigation

**Main Header:**
- Height: 64px desktop, 56px mobile
- Background: `#FFFFFF` with `shadow-sm` on scroll
- Logo: Left, links to homepage
- Navigation: Center (desktop), hamburger menu (mobile)
- Right: Search icon, language selector, "Contact" CTA

**Mobile Menu:**
- Full-screen overlay, slides from right
- Category sections with accordion
- Close button top-right, swipe right to close
- Focus trap while open

**Breadcrumbs:**
- Home icon + chevron separators
- Current page not clickable
- Truncated with "..." on mobile if too long

**Footer:**
- Background: `#0A2540`, text: `#FFFFFF` / `#8B95A5`
- 4 columns desktop, 2 columns tablet, stacked mobile
- Newsletter signup: email input + button inline
- Social icons: horizontal row
- Legal links: bottom row, smaller text

### 22.7 Loading & Empty States

**Skeleton Loaders:**
- Animated pulse (`#E3E8EE` to `#F6F9FC`)
- Match layout of expected content
- Used for: product grids, news cards, search results

**Spinner:**
- Circular, `#00A3E0`, 24px default
- Centered in container or overlay

**Empty States:**
- Illustration (not generic, on-brand)
- Clear message: "No products match your filters"
- Action: "Clear filters" or "Browse all products"

**Error States:**
- Illustration + friendly message
- Retry button where applicable
- Contact support link for persistent errors

---

## 23. Responsive Behavior Matrix

### 23.1 Breakpoints

| Name | Range | Target Devices |
|------|-------|---------------|
| **Mobile** | 320px – 767px | Smartphones, small tablets |
| **Tablet** | 768px – 1023px | iPads, large tablets |
| **Desktop** | 1024px – 1439px | Laptops, small desktops |
| **Wide** | 1440px+ | Large monitors, 4K displays |

### 23.2 Page Layout Adaptations

| Page | Mobile | Tablet | Desktop | Wide |
|------|--------|--------|---------|------|
| **Homepage** | Stacked single column, hero carousel swipe, category grid 2-col | Category grid 3-col, hero 2/3 width | Full layout, 4-col category grid, side-by-side sections | Max-width 1440px centered, enhanced spacing |
| **Category** | Filter bottom sheet, product grid 1-col, sort dropdown | Filter collapsible sidebar, grid 2-col | Filter fixed sidebar, grid 3-col | Grid 4-col, larger cards |
| **Product Detail** | Stacked, image gallery swipe, sticky CTA bottom | Two-column (image/info), tabs | Two-column with related sidebar | Max-width 1200px, larger images |
| **Comparison** | Horizontal scroll table, 2 products max | 3 products, sticky spec column | 4 products, full table | Same, centered max-width |
| **Where to Buy** | Map half-screen, list half, toggle view | Map 60%, list 40% side by side | Map 70%, list 30% | Same, larger map |
| **Compatibility** | Stacked search + results, single column | Same, wider inputs | Search centered, results 2-col | Same, max-width 1000px |
| **Support** | Accordion categories, stacked cards | 2-col category cards | 3-col cards + sidebar quick links | Same, centered |

### 23.3 Navigation Behavior

| Breakpoint | Header | Navigation | Search |
|------------|--------|-----------|--------|
| Mobile | Hamburger menu, logo centered | Full-screen overlay, accordion categories | Expandable search bar in header |
| Tablet | Hamburger menu, logo left | Full-screen overlay | Expandable search |
| Desktop | Horizontal nav, logo left | Dropdown menus for categories | Persistent search input in header |
| Wide | Same as desktop | Same, possibly mega-menu for Products | Same |

### 23.4 Touch Target Sizes

| Element | Minimum Size | Padding |
|---------|-------------|---------|
| Buttons | 44×44px | 12px min |
| Form inputs | 48px height | 12px horizontal |
| Navigation links | 44px height | 16px horizontal |
| Checkbox/radio | 20×20px visual, 44×44px tap target | — |
| Cards (tap) | Full card clickable | — |
| Map pins | 32×32px | — |

### 23.5 Typography Scaling

| Element | Mobile | Tablet | Desktop | Wide |
|---------|--------|--------|---------|------|
| H1 | 32px | 40px | 48px | 56px |
| H2 | 28px | 32px | 36px | 40px |
| H3 | 20px | 22px | 24px | 28px |
| Body | 16px | 16px | 16px | 18px |
| Caption | 12px | 12px | 12px | 14px |

---

## 24. Animation & Interaction Requirements

### 24.1 Performance Budget for Animations

| Metric | Target | Maximum |
|--------|--------|---------|
| Animation frame rate | 60fps | 30fps minimum |
| Animation duration (micro) | 150–200ms | 300ms |
| Animation duration (macro) | 300–400ms | 500ms |
| GPU layers | Use `transform` and `opacity` only | Avoid animating `width`, `height`, `top`, `left` |
| Reduced motion | Respect `prefers-reduced-motion` | Disable non-essential animations |

### 24.2 Micro-Interactions

| Interaction | Trigger | Animation | Duration | Easing |
|-------------|---------|-----------|----------|--------|
| **Button hover** | Mouse enter | Background darken, translateY(-1px) | 150ms | ease-out |
| **Button click** | Mouse down | translateY(0), scale(0.98) | 100ms | ease-in-out |
| **Card hover** | Mouse enter | translateY(-4px), shadow increase | 200ms | cubic-bezier(0.4, 0, 0.2, 1) |
| **Link hover** | Mouse enter | Color change, optional underline slide-in | 150ms | ease-out |
| **Input focus** | Focus | Border color change, subtle shadow | 150ms | ease-out |
| **Checkbox check** | Click | Scale bounce (1 → 1.2 → 1) | 200ms | ease-out |
| **Tab switch** | Click | Content fade-in (opacity 0→1) | 200ms | ease-out |
| **Dropdown open** | Click | Opacity 0→1, translateY(-8px→0) | 150ms | ease-out |
| **Toast appear** | Trigger | translateY(20px→0), opacity 0→1 | 300ms | ease-out |
| **Toast dismiss** | Auto/click | translateX(0→100%), opacity 1→0 | 200ms | ease-in |

### 24.3 Page Transitions

| Transition | Trigger | Animation | Duration |
|------------|---------|-----------|----------|
| **Page load** | Navigation | Fade in content (opacity 0→1) | 200ms |
| **Hero carousel** | Auto/manual | Slide horizontal with fade | 500ms |
| **Modal open** | Trigger | Backdrop fade, content scale(0.95→1) + fade | 200ms |
| **Modal close** | Close action | Content scale(1→0.95) + fade, backdrop fade | 150ms |
| **Mobile menu** | Hamburger click | Slide from right (translateX(100%→0)) | 300ms |
| **Filter panel (mobile)** | Filter button | Slide from bottom (translateY(100%→0)) | 250ms |
| **Image lightbox** | Image click | Backdrop fade, image scale(0.9→1) | 200ms |

### 24.4 Scroll-Triggered Animations

| Element | Trigger | Animation |
|---------|---------|-----------|
| **Section headings** | Scroll into viewport (20% visible) | translateY(20px→0), opacity 0→1 |
| **Product cards** | Stagger as scrolled into view | Same as above, 50ms stagger between cards |
| **Stats/counters** | Scroll into view | Number count-up animation |
| **Images** | Scroll into view | Subtle scale(1.02→1) + opacity |

**Constraints:**
- Scroll animations must not cause layout shift (use `transform` only)
- Must be disabled for `prefers-reduced-motion: reduce`
- Must not delay content availability — animations are enhancement, not requirement

### 24.5 Gaming Hub Animations

| Element | Animation | Notes |
|---------|-----------|-------|
| **Hero RGB glow** | Pulsing box-shadow in RGB colors | Subtle, 4s cycle, CSS-only preferred |
| **Product hover** | Scale 1.05 + RGB border glow | 200ms, GPU-optimized |
| **Build gallery** | Staggered fade-in on scroll | 100ms stagger |
| **RGB showcase** | Lighting preset transitions | Cross-fade between presets, 300ms |

**Gaming Animation Rules:**
- No flashing > 3Hz (seizure safety)
- Respect `prefers-reduced-motion` — show static states
- Videos must not auto-play with sound
- Heavy animations pause when tab is not visible (`visibilitychange` API)

---


## 25. Critical Path Flows

> **Purpose:** Document the 8 most important end-to-end user journeys, showing every step, decision point, and system response from the user's perspective.

### 25.1 Critical Path 1: Product Discovery → Purchase Intent

**Primary Actor:** Rahul (Gamer)  
**Goal:** Find a DDR5 RAM kit and identify where to buy it locally  
**BRD Ref:** US-1.1, US-1.2, US-1.3, US-3.1, US-3.2

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 1: ENTRY                                                              │
│  ├─ Actor: Rahul searches "TwinMOS DDR5 RAM" on Google                     │
│  ├─ System: Organic search result for /products/memory/ddr5/desktop/       │
│  └─ User Action: Clicks search result                                       │
│                                                                              │
│  STEP 2: CATEGORY BROWSING (UC-1)                                          │
│  ├─ System: Loads category page with product grid, filters, sort           │
│  ├─ User Action: Scrolls through products                                  │
│  └─ System: Lazy-loads images as user scrolls                              │
│                                                                              │
│  STEP 3: FILTERING (UC-2)                                                  │
│  ├─ User Action: Clicks "Filters" → selects Capacity: 32GB, RGB: Yes       │
│  ├─ System: Updates grid instantly (AJAX), shows active filter pills       │
│  ├─ User Action: Sorts by "Speed (High–Low)"                               │
│  └─ System: Reorders products: VOLTX RGB 6000MHz, 5600MHz...               │
│                                                                              │
│  STEP 4: PRODUCT EVALUATION (UC-3)                                         │
│  ├─ User Action: Clicks VOLTX RGB DDR5-6000 32GB                           │
│  ├─ System: Loads product detail page (< 2s)                               │
│  ├─ User Action: Swipes through image gallery                              │
│  ├─ User Action: Reads spec table, notes XMP 3.0 support                   │
│  └─ User Action: Clicks "Compatible Systems" tab                           │
│                                                                              │
│  STEP 5: COMPATIBILITY VERIFICATION (UC-7)                                 │
│  ├─ System: Shows list of verified motherboards                            │
│  ├─ User Action: Searches within list for "ASUS ROG"                       │
│  ├─ System: Filters compatible systems list                                │
│  └─ User Action: Confirms QVL status for his motherboard                   │
│                                                                              │
│  STEP 6: PURCHASE PATH (UC-8)                                              │
│  ├─ User Action: Clicks "Where to Buy" CTA                                 │
│  ├─ System: Scrolls to / opens "Where to Buy" section                      │
│  ├─ User Action: Clicks "Flipkart" link                                    │
│  └─ System: Opens Flipkart product page in new tab                         │
│                                                                              │
│  OUTCOME: Rahul has identified the right product, verified compatibility,  │
│  and reached a purchase channel. Conversion path complete.                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 25.2 Critical Path 2: Laptop Upgrade — Simple Compatibility

**Primary Actor:** Aisha (Laptop Upgrader)  
**Goal:** Find compatible RAM for my laptop and buy it locally  
**BRD Ref:** US-2.1, US-3.1, US-3.2

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 1: ENTRY                                                              │
│  ├─ Actor: Aisha searches "Dell Inspiron RAM upgrade" on mobile            │
│  ├─ System: Search result for /compatibility-finder/                       │
│  └─ User Action: Clicks result                                              │
│                                                                              │
│  STEP 2: COMPATIBILITY SEARCH (UC-6)                                       │
│  ├─ System: Shows compatibility finder with brand dropdown                 │
│  ├─ User Action: Selects "Dell" from brand dropdown                        │
│  ├─ User Action: Types "Inspiron" → selects "Inspiron 15 3520"             │
│  ├─ System: Shows compatible products grouped by RAM/SSD                   │
│  └─ System: Shows device info: Max 16GB, DDR4-3200, SO-DIMM                │
│                                                                              │
│  STEP 3: PRODUCT SELECTION                                                 │
│  ├─ User Action: Clicks "TwinMOS DDR4-3200 16GB SO-DIMM"                   │
│  ├─ System: Loads product detail page                                       │
│  ├─ User Action: Reads specs, sees warranty badge (e.g., "Limited Lifetime"  │
│     for DRAM, per CMS configuration)                                        │
│  └─ User Action: Clicks "Where to Buy"                                     │
│                                                                              │
│  STEP 4: FIND RETAILER (UC-8)                                              │
│  ├─ System: Auto-detects UAE, shows local retailers on map                 │
│  ├─ User Action: Toggles to list view                                      │
│  ├─ User Action: Clicks nearest store name                                 │
│  ├─ System: Shows store card with phone number                             │
│  └─ User Action: Taps phone number to call store                           │
│                                                                              │
│  OUTCOME: Aisha knows exactly what to buy and where to find it.            │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 25.3 Critical Path 3: Distributor Partnership Application

**Primary Actor:** Mr. Patel (Potential Distributor)  
**Goal:** Evaluate TwinMOS and submit a partnership inquiry  
**BRD Ref:** US-3.3, US-5.3, US-4.1

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 1: BRAND EVALUATION                                                  │
│  ├─ Actor: Mr. Patel visits twinmos.com directly                           │
│  ├─ System: Loads homepage                                                  │
│  ├─ User Action: Scrolls through homepage, sees product categories         │
│  ├─ User Action: Clicks "About Us"                                         │
│  └─ System: Shows company story, leadership, 93+ countries                 │
│                                                                              │
│  STEP 2: CREDIBILITY VERIFICATION                                          │
│  ├─ User Action: Clicks "Awards & Certifications"                          │
│  ├─ System: Shows ISO 9001, CE, UKCA, FCC, RoHS (and any verified    │
│     industry awards e.g., UAE Superbrand if confirmed per BR-5.5)         │
│  ├─ User Action: Clicks "Products" to review portfolio depth               │
│  └─ System: Shows complete catalog: DRAM, SSD, Portable, USB               │
│                                                                              │
│  STEP 3: PARTNERSHIP INQUIRY (UC-9)                                        │
│  ├─ User Action: Clicks "Partners" → "Become a Distributor"                │
│  ├─ System: Shows comprehensive inquiry form                               │
│  ├─ User Action: Fills all required fields                                 │
│  ├─ User Action: Clicks "Submit"                                           │
│  ├─ System: Validates, shows success page with timeline                    │
│  └─ System: Sends auto-reply email within 5 minutes                        │
│                                                                              │
│  OUTCOME: Mr. Patel has verified credibility and submitted an inquiry.     │
│  TwinMOS sales team notified.                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 25.4 Critical Path 4: Enterprise Quote Request

**Primary Actor:** Sarah (Enterprise Procurement)  
**Goal:** Request volume pricing for a corporate fleet upgrade  
**BRD Ref:** US-4.2, US-1.3, US-1.5

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 1: CREDIBILITY CHECK                                                 │
│  ├─ Actor: Sarah visits twinmos.com from vendor evaluation list            │
│  ├─ System: Loads homepage                                                  │
│  ├─ User Action: Checks "About Us" for company legitimacy                  │
│  └─ System: Shows Dubai HQ, leadership, global presence, certifications    │
│                                                                              │
│  STEP 2: PRODUCT EVALUATION                                                │
│  ├─ User Action: Navigates to SSD category                                 │
│  ├─ User Action: Filters for enterprise products (non-gaming)              │
│  ├─ User Action: Views CoreX Pro PCIe Gen 5 SSD                            │
│  └─ User Action: Downloads datasheet PDF                                   │
│                                                                              │
│  STEP 3: QUOTE REQUEST (UC-11)                                             │
│  ├─ User Action: Clicks "Request a Quote"                                  │
│  ├─ System: Shows detailed quote form                                      │
│  ├─ User Action: Fills: Company, Quantity (500 units), Timeline           │
│  ├─ User Action: Uploads internal RFP document                             │
│  ├─ User Action: Submits form                                              │
│  ├─ System: Shows success, ticket number, 24-hour SLA                      │
│  └─ System: Routes to sales@twinmos.com with high priority                 │
│                                                                              │
│  OUTCOME: Sarah has verified credibility, evaluated products, and          │
│  submitted a formal quote request.                                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 25.5 Critical Path 5: Warranty Registration & RMA

**Primary Actor:** Registered Product Owner  
**Goal:** Register a product and submit an RMA for a defective unit  
**BRD Ref:** US-6.1, US-6.4

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 1: WARRANTY REGISTRATION (UC-13)                                     │
│  ├─ Actor: User buys TwinMOS SSD, visits /support/warranty/                │
│  ├─ System: Shows warranty registration form                               │
│  ├─ User Action: Selects product, enters serial number                     │
│  ├─ System: Validates serial in real time                                  │
│  ├─ User Action: Enters purchase date, selects retailer                    │
│  ├─ User Action: Uploads receipt photo                                     │
│  ├─ User Action: Clicks "Register"                                         │
│  ├─ System: Confirms registration, shows warranty expiration               │
│  └─ System: Sends confirmation email                                       │
│                                                                              │
│  STEP 2: ISSUE DISCOVERY (Weeks later)                                     │
│  ├─ Actor: SSD fails, user returns to support page                         │
│  ├─ User Action: Navigates to /support/rma/                                │
│  └─ System: Shows RMA submission form                                      │
│                                                                              │
│  STEP 3: RMA SUBMISSION (UC-14)                                            │
│  ├─ User Action: Enters serial number                                      │
│  ├─ System: Auto-checks warranty: "Active — expires [Date]"               │
│  ├─ User Action: Describes issue, uploads photo of error                   │
│  ├─ User Action: Clicks "Submit RMA"                                       │
│  ├─ System: Generates RMA number: "RMA-2026-001234"                        │
│  ├─ System: Shows status tracker                                           │
│  └─ System: Sends email with RMA number and shipping instructions          │
│                                                                              │
│  STEP 4: STATUS TRACKING                                                   │
│  ├─ Actor: User checks status 3 days later                                 │
│  ├─ User Action: Clicks link from email or visits /support/rma/status/     │
│  ├─ System: Shows current status: "Testing"                                │
│  └─ System: Email notification sent when status changes to "Replacement    │
│     Shipped"                                                               │
│                                                                              │
│  OUTCOME: User has registered warranty, submitted RMA, and is tracking     │
│  replacement. Zero support staff interaction required so far.              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 25.6 Critical Path 6: Gaming Hub Engagement

**Primary Actor:** Rahul (Gamer)  
**Goal:** Explore VOLTX brand, see RGB effects, and get inspired  
**BRD Ref:** US-8.1, US-8.2, US-8.3

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 1: ENTRY                                                              │
│  ├─ Actor: Rahul clicks "Gaming" in main navigation                        │
│  ├─ System: Loads /gaming/ with dark theme, RGB hero animation             │
│  └─ User Action: Watches hero video, scrolls down                          │
│                                                                              │
│  STEP 2: PRODUCT EXPLORATION (UC-18)                                       │
│  ├─ System: Shows VOLTX and VOLTX RGB product grid                         │
│  ├─ User Action: Hovers over VOLTX RGB card, sees glow effect              │
│  ├─ User Action: Clicks VOLTX RGB to view product details                  │
│  └─ System: Loads product page (maintains dark theme elements)             │
│                                                                              │
│  STEP 3: RGB SHOWCASE (UC-23)                                              │
│  ├─ User Action: Returns to Gaming Hub, clicks "RGB Showcase"              │
│  ├─ System: Shows interactive lighting presets                             │
│  ├─ User Action: Clicks through presets: Rainbow, Breathing, Static        │
│  └─ System: Updates visualization for each preset                          │
│                                                                              │
│  STEP 4: BUILD GALLERY (UC-22)                                             │
│  ├─ User Action: Clicks "Build Gallery"                                    │
│  ├─ System: Shows grid of community builds                                 │
│  ├─ User Action: Clicks a build, sees full specs and photos                │
│  └─ User Action: Clicks "Share" to send to friend                          │
│                                                                              │
│  OUTCOME: Rahul is inspired by the brand presentation and community.       │
│  Brand affinity increased. Likely to return for purchase.                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 25.7 Critical Path 7: Language Switch & Regional Content

**Primary Actor:** Arabic-speaking user in UAE  
**Goal:** View website in Arabic with local retailer info  
**BRD Ref:** US-9.1, US-9.2

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 1: LANGUAGE SWITCH (UC-19)                                           │
│  ├─ Actor: User visits twinmos.com from Dubai                              │
│  ├─ System: Loads English version, auto-detects UAE                        │
│  ├─ User Action: Clicks language selector in header                        │
│  ├─ System: Shows dropdown: English, العربية, বাংলা, हिन्दी                │
│  ├─ User Action: Selects "العربية"                                         │
│  ├─ System: Reloads page in Arabic, flips layout to RTL                    │
│  └─ System: Stores preference in localStorage                              │
│                                                                              │
│  STEP 2: REGIONAL CONTENT (UC-24)                                          │
│  ├─ System: Shows UAE banner with local distributor info                   │
│  ├─ User Action: Navigates to "Where to Buy"                               │
│  ├─ System: Shows UAE retailers, AED pricing references                    │
│  ├─ User Action: Views product page                                        │
│  └─ System: Shows Arabic product description (if available)                │
│                                                                              │
│  OUTCOME: User experiences localized content in preferred language.        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 25.8 Critical Path 8: CMS Content Publishing

**Primary Actor:** Marketing Manager  
**Goal:** Publish a news article about COMPUTEX 2026  
**BRD Ref:** US-5.1, US-10.2, US-10.3

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 1: CONTENT CREATION (UC-20)                                          │
│  ├─ Actor: Marketing Manager logs into CMS                                 │
│  ├─ System: Shows CMS dashboard                                            │
│  ├─ User Action: Clicks "Content" → "News" → "Create New"                 │
│  └─ System: Opens article editor                                           │
│                                                                              │
│  STEP 2: DRAFTING                                                          │
│  ├─ User Action: Enters title, writes body in rich text editor             │
│  ├─ User Action: Uploads event photos                                      │
│  ├─ User Action: Selects category: "Event"                                 │
│  ├─ User Action: Fills SEO metadata                                        │
│  └─ User Action: Clicks "Preview"                                          │
│                                                                              │
│  STEP 3: REVIEW                                                            │
│  ├─ System: Shows preview of article on desktop and mobile                 │
│  ├─ User Action: Clicks "Submit for Review"                                │
│  ├─ System: Notifies Marketing Director                                    │
│  └─ System: Article status: "Pending Review"                               │
│                                                                              │
│  STEP 4: APPROVAL (UC-29)                                                  │
│  ├─ Actor: Marketing Director receives notification, reviews               │
│  ├─ User Action: Clicks "Approve and Publish"                              │
│  ├─ System: Article goes live on /news/computex-2026/                      │
│  └─ System: Appears in news listing and homepage teaser                    │
│                                                                              │
│  OUTCOME: Article published without developer involvement.                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 26. Decision Trees & Branching Logic

### 26.1 Compatibility Finder Decision Tree

```
User lands on /compatibility-finder/
│
├─ User selects search type:
│   ├─ "By Laptop/Desktop" ──► Brand dropdown + Model input
│   │   ├─ Model found in database?
│   │   │   ├─ YES ──► Show compatible products + device specs
│   │   │   │   ├─ Compatible products exist?
│   │   │   │   │   ├─ YES ──► Display product cards with "View Product"
│   │   │   │   │   └─ NO  ──► "No compatible products listed. Contact support."
│   │   │   └─ NO  ──► "Model not found. Try similar model or contact support."
│   │   └─ User clicks "View Product" ──► Product detail page
│   │
│   └─ "By Motherboard" ──► Brand + Model input
│       ├─ Motherboard found?
│       │   ├─ YES ──► Show compatible RAM with QVL status
│       │   │   ├─ QVL Verified? ──► "QVL Verified" badge
│       │   │   ├─ Tested?      ──► "Tested by TwinMOS" badge
│       │   │   └─ Not Tested?  ──► "Not Verified" (not incompatible)
│       │   └─ NO  ──► "Motherboard not found. Check spelling or contact support."
│       └─ User clicks QVL badge ──► Opens manufacturer QVL page (new tab)
│
└─ User clicks "Contact Support" at any point ──► Contact form
```

### 26.2 Form Submission Decision Tree

```
User fills and submits a form
│
├─ reCAPTCHA triggered?
│   ├─ YES ──► User completes challenge ──► Continue
│   └─ NO  ──► Continue
│
├─ Server validates fields:
│   ├─ ALL VALID ──► Process submission
│   │   ├─ Form type = Distributor Inquiry?
│   │   │   ├─ YES ──► Notify sales@twinmos.com + regional manager
│   │   │   └─ NO  ──► Route to appropriate team based on subject
│   │   ├─ Send auto-reply to user (within 5 min)
│   │   ├─ Store in database
│   │   └─ Show success page with ticket number
│   │
│   └─ VALIDATION ERRORS ──► Return to form
│       ├─ Highlight invalid fields in red
│       ├─ Show specific error messages per field
│       ├─ Scroll to first error
│       └─ Preserve all valid user input
│
└─ Server error (500)?
    ├─ YES ──► Show friendly error: "Something went wrong. Please try again
    │           or email us directly at [address]."
    └─ NO  ──► Success flow complete
```

### 26.3 Partner Portal Access Decision Tree

```
User attempts to access /partners/
│
├─ User authenticated?
│   ├─ YES ──► Check role permissions
│   │   ├─ Has access to requested resource?
│   │   │   ├─ YES ──► Show content
│   │   │   └─ NO  ──► "Access denied. Contact your administrator."
│   │   └─ Session expired (> 30 min idle)?
│   │       ├─ YES ──► "Session expired. Please log in again."
│   │       └─ NO  ──► Continue
│   │
│   └─ NO ──► Redirect to /partners/login/
│       ├─ User enters credentials
│       ├─ Valid?
│       │   ├─ YES ──► Create session, redirect to requested page
│       │   └─ NO  ──► Increment failed attempts
│       │       ├─ Failed attempts >= 5?
│       │       │   ├─ YES ──► Lock account 30 min, notify admin
│       │       │   └─ NO  ──► "Invalid credentials. Please try again."
│       │
│       └─ User clicks "Forgot Password"
           ├─ Enter email
           ├─ Email exists?
           │   ├─ YES ──► Send reset link (24h expiry)
           │   └─ NO  ──► Generic message (security): "If account exists,
           │               email sent."
           └─ User clicks reset link ──► Set new password ──► Login
```

### 26.4 Product Status Display Decision Tree

```
Product page loads
│
├─ Product status = "Active"?
│   ├─ YES ──► Normal display
│   │   ├─ Release date < 90 days ago?
│   │   │   ├─ YES ──► Show "New" badge
│   │   │   └─ NO  ──► No badge
│   │   └─ is_featured = true?
│   │       ├─ YES ──► Show "Featured" badge
│   │       └─ NO  ──► No featured badge
│   │
│   ├─ Product status = "Discontinued"?
│   │   └─ YES ──► Show "Discontinued" badge prominently
│   │       ├─ Show replacement product suggestions
│   │       └─ Hide "Where to Buy" CTA
│   │
│   └─ Product status = "Coming Soon"?
│       └─ YES ──► Show "Coming Soon" badge
│           ├─ Hide "Where to Buy" CTA
│           ├─ Show "Notify Me" email signup
│           └─ Display all specs
│
└─ Product not found?
    └─ YES ──► 404 page with suggested products
```

---

## 27. Error Handling from User Perspective

### 27.1 Error Categories & User Messages

| Error Type | System State | User Message | User Action Available |
|------------|-------------|--------------|----------------------|
| **404 — Page Not Found** | URL doesn't match any route | "Page not found. Let's get you back on track." + search bar + quick links | Search, browse categories, go home |
| **Product Not Found** | Product slug invalid or removed | "This product is no longer available." + suggested alternatives | Browse alternatives, search |
| **Form Validation Error** | Missing/invalid fields | Inline errors per field: "Please enter a valid email address." | Correct field, resubmit |
| **Server Error (500)** | Unexpected backend failure | "Something went wrong on our end. Please try again in a moment." | Retry, contact via email |
| **Network Error** | Client can't reach server | "Connection issue. Please check your internet and try again." | Retry, check connection |
| **Rate Limited** | Too many requests | "Please slow down. Try again in [X] seconds." | Wait, then retry |
| **File Upload Too Large** | Exceeds size limit | "File too large. Maximum size is [X]MB." | Compress file, select smaller |
| **Invalid File Type** | Unsupported format | "Please upload [allowed types] only." | Select correct file type |
| **Session Expired** | Auth token invalid/expired | "Your session has expired. Please log in again." | Log in |
| **Account Locked** | Too many failed login attempts | "Account temporarily locked. Try again in 30 minutes or contact admin." | Wait, contact admin |
| **Out of Warranty** | RMA submitted for expired product | "This product is out of warranty. Contact support for repair options." | Contact support, explore paid repair |
| **No Search Results** | Query returns empty | "No results found. Try different keywords or [browse all]." | Modify search, browse categories |
| **No Compatible Products** | Device found but no matching products | "No compatible TwinMOS products listed. Contact support for assistance." | Contact support, browse similar |
| **Retailer Not Found** | No retailers in user's country | "No authorized retailers in [Country]. Contact us to find a distributor." | Submit distributor inquiry |
| **CMS Permission Denied** | User lacks role for action | "You don't have permission to perform this action. Contact your administrator." | Contact admin |

### 27.2 Error Presentation Patterns

**Inline Validation (Forms):**
- Error appears immediately below the field (on blur)
- Field border turns red (`#FF1744`)
- Error text: 12px, red, with error icon
- Success state: Green checkmark for valid fields (optional, on submit)

**Toast Notifications:**
- Position: Top-right desktop, bottom-center mobile
- Auto-dismiss: 5 seconds
- Types: Success (green), Error (red), Warning (orange), Info (blue)
- Action: Manual close (X) + swipe dismiss on mobile

**Page-Level Errors (404, 500):**
- Full page with illustration
- Friendly, non-technical language
- Clear next steps (search, browse, contact)
- No stack traces or technical details exposed

**Modal Errors:**
- For critical errors that block user flow
- Title: "Something went wrong"
- Message: Clear explanation
- Actions: "Retry" + "Cancel" or "Contact Support"

### 27.3 Graceful Degradation

| Feature | Ideal State | Degraded State | Fallback |
|---------|------------|----------------|----------|
| Image gallery | High-res zoom | Standard resolution | Alt text description |
| Interactive map | Google Maps/Mapbox | Static map image | List view only |
| Auto-suggest search | Algolia instant | Server-side search | Static dropdown |
| Live chat | Real-time agent | Offline message form | Email contact |
| RGB showcase | Interactive WebGL | Animated GIF/video | Static images |
| Video embed | HD streaming | Standard quality | Thumbnail + link to YouTube |
| Product comparison | Side-by-side table | Vertical stacked comparison | Product detail pages |

---

## 28. Feedback & Confirmation Patterns

### 28.1 Success Confirmations

| Action | Confirmation Type | Message | Duration |
|--------|-------------------|---------|----------|
| Form submission | Success page + toast | "Thank you! Your inquiry has been received. Ticket: #12345" | Persistent (page) |
| Newsletter signup | Inline + email | "Check your email to confirm your subscription." | Persistent |
| Warranty registration | Success page + email | "Warranty registered! Expires: April 2029." | Persistent |
| RMA submission | Success page + email | "RMA submitted! Your reference: RMA-2026-001234." | Persistent |
| Product added to compare | Toast | "VOLTX RGB added to comparison." | 3 seconds |
| Product removed from compare | Toast | "Product removed." | 2 seconds |
| Language switched | Toast | "Language changed to العربية" | 2 seconds |
| Download started | Toast | "Downloading VOLTX_Datasheet.pdf" | 3 seconds |
| CMS publish | Toast | "Article published successfully." | 3 seconds |
| Password reset sent | Inline | "If an account exists, a reset email has been sent." | Persistent |

### 28.2 Loading States

| Action | Loading Indicator | Duration Expectation |
|--------|-------------------|---------------------|
| Page navigation | Skeleton loader for content area | < 1.5s |
| Filter products | Spinner in filter panel + skeleton grid | < 500ms |
| Search compatibility | Spinner in search area | < 2s |
| Form submission | Button loading state (spinner + "Submitting...") | < 3s |
| Image upload | Progress bar (0–100%) | Varies by file size |
| File download | Toast with progress | Varies by file size |
| Map load | Spinner on map canvas | < 3s |
| CMS save | Button loading + "Saving..." | < 2s |

### 28.3 Progressive Disclosure

| Element | Default State | Expanded State | Trigger |
|---------|--------------|----------------|---------|
| FAQ items | Question only | Question + answer | Click/tap |
| Spec table (mobile) | Key specs only | Full table | "View all specs" button |
| Filter panel (mobile) | Hidden | Full bottom sheet | "Filters" button |
| Mobile menu | Hidden | Full-screen overlay | Hamburger icon |
| Product description | First 3 lines | Full text | "Read more" link |
| Retailer list (map view) | Collapsed sidebar | Expanded list | List toggle button |
| Build gallery filters | Hidden | Filter panel | "Filter" button |
| KB article TOC | Hidden | Sidebar navigation | "Contents" button (mobile) |

### 28.4 Undo Patterns

| Action | Undo Available | Method |
|--------|---------------|--------|
| Remove from compare | Yes | Toast with "Undo" button |
| Clear all filters | Yes | "Undo" link in confirmation |
| Newsletter unsubscribe | No | Re-subscription requires new opt-in |
| CMS delete | Yes | "Undo" within 10 seconds (soft delete) |

---


## 29. User-Visible Data Requirements

> **Purpose:** Define what data users see, how it is presented, and what accuracy/completeness they expect. Synchronized with BRD Section 19 (Data Requirements & Entity Model).

### 29.1 Data Completeness Expectations by Page

| Page | Data Elements | Completeness Requirement | User Impact if Missing |
|------|--------------|-------------------------|----------------------|
| **Product Category** | Product name, image, SKU, key specs, status | 100% of active products must have all fields | Empty cards, broken grid layout |
| **Product Detail** | Name, SKU, description, specs, images, warranty, features | 100% required; datasheet optional but expected | User cannot evaluate product |
| **Compatibility Results** | Product name, image, key specs, compatibility badge | 100% required | User cannot identify compatible products |
| **Where to Buy** | Retailer name, address, phone, type, coordinates | 100% for authorized retailers | User cannot find purchase location |
| **News Article** | Title, body, date, category, featured image | Title and body mandatory; image highly recommended | Unprofessional appearance |
| **Event Page** | Name, date, location, description | 100% required | User cannot attend or learn about event |
| **Support Article** | Title, body, category, last updated | 100% required | User cannot self-serve |
| **Distributor Inquiry** | Form fields stored and routed | 100% capture | Lead lost |

### 29.2 Data Freshness Requirements (User Perspective)

| Data Type | User Expectation | Max Age | Refresh Trigger |
|-----------|-----------------|---------|-----------------|
| Product catalog | Current and accurate | Real-time | CMS publish/update |
| Product pricing (indicative) | Reasonably current | 30 days | Monthly CMS update |
| Compatibility database | Comprehensive and verified | Quarterly | Quarterly data import + CMS update |
| Retailer/distributor list | Accurate and current | 90 days | Quarterly review + CMS update |
| News articles | Published promptly | N/A | On publish |
| Firmware versions | Latest available | Real-time | CMS upload |
| Price lists (partner portal) | Current effective version | As of effective date | Finance approval + CMS update |

### 29.3 Data Presentation Standards

| Data Element | Display Format | Example |
|--------------|---------------|---------|
| **Capacity** | Number + unit, no decimals | "32GB", "1TB" |
| **Speed** | Number + MHz, comma for thousands | "3,200MHz", "6,000MHz" |
| **Dimensions** | Number + mm, L × W × H | "133.35 × 31.25 × 6.1mm" |
| **Weight** | Number + g or kg | "45g" |
| **Warranty** | Duration in words + months in parens | "Limited Lifetime (DRAM)", "5 Years (60 months) — NVMe SSD", "3 Years (36 months) — SATA SSD" |
| **Price (indicative)** | Currency symbol + number, rounded | "₹3,499", "$89" |
| **Date** | Locale-aware format | "April 29, 2026" (EN), "٢٩ أبريل ٢٠٢٦" (AR) |
| **SKU/Part Number** | Monospace font, copy button | `TMV532G6000RGB` |

### 29.4 Empty Data Handling

| Field Missing | User-Facing Display |
|---------------|-------------------|
| Product image | Placeholder with product name initials + "Image coming soon" |
| Product description | "Detailed description coming soon. Contact us for more information." |
| Specification value | "—" (em dash) in table |
| Datasheet | Button disabled with tooltip: "Datasheet coming soon" |
| Warranty info | "Contact support for warranty information" |
| Retailer phone | Hide phone row; show "Visit website" if URL exists |
| Retailer website | Hide website row |
| Compatibility data | "Not yet verified. Contact support for compatibility confirmation." |
| Price (indicative) | "Contact retailer for pricing" |

---

## 30. Form Validation Rules from User Perspective

> **Purpose:** Define how forms behave when users input data — what they see, when they see it, and how they recover from errors.

### 30.1 Validation Timing

| Trigger | When Applied | Example |
|---------|-------------|---------|
| **On Blur** | When user leaves a field | Email format check, required field check |
| **On Input** | As user types | Character count, password strength |
| **On Submit** | When user clicks submit | Cross-field validation, reCAPTCHA |
| **On File Select** | When user selects file | File size, file type check |

### 30.2 Validation Rules by Field Type

| Field | Required | Format Rules | Error Message |
|-------|----------|-------------|---------------|
| **Name** | Yes | Min 2 characters, max 100 | "Please enter your name." |
| **Email** | Yes | Valid email format (RFC 5322) | "Please enter a valid email address." |
| **Phone** | Conditional | E.164 format or local format per country | "Please enter a valid phone number." |
| **Country** | Yes | Must select from dropdown | "Please select a country." |
| **Subject** | Yes | Must select from dropdown | "Please select a subject." |
| **Message** | Yes | Min 10, max 5000 characters | "Please enter a message (10–5000 characters)." |
| **Serial Number** | Yes | Alphanumeric, length per product format | "Invalid serial number. Please check your product label." |
| **Purchase Date** | Yes | Not in future, not > 2 years past | "Please enter a valid purchase date within the last 2 years." |
| **Quantity** | Conditional | Positive integer, max 1,000,000 | "Please enter a valid quantity." |
| **File Upload** | Conditional | Max 10MB, PDF/DOC/XLS/PNG/JPG only | "File too large" or "Invalid file type" |
| **Password** | Yes (portal) | Min 12 chars, upper, lower, number, symbol | "Password must be at least 12 characters with mixed case, number, and symbol." |

### 30.3 Password Strength Indicator

| Strength | Criteria | Visual |
|----------|---------|--------|
| **Weak** | < 12 chars or missing character types | Red bar + "Weak — Add more characters and variety" |
| **Fair** | 12+ chars, 3 of 4 types | Yellow bar + "Fair — Could be stronger" |
| **Good** | 12+ chars, all 4 types | Light green bar + "Good password" |
| **Strong** | 16+ chars, all 4 types | Green bar + "Strong password" |

### 30.4 Cross-Field Validation

| Scenario | Fields | Validation Rule | Error Message |
|----------|--------|----------------|---------------|
| **RMA out of warranty** | Serial Number + Purchase Date | Purchase date + warranty period < today | "This product is out of warranty." |
| **Password mismatch** | Password + Confirm Password | Must match exactly | "Passwords do not match." |
| **Future purchase date** | Purchase Date | Must be ≤ today | "Purchase date cannot be in the future." |
| **File size exceeded** | File Upload | ≤ 10MB per file | "File must be under 10MB." |

### 30.5 Accessibility in Forms

| Requirement | Implementation |
|-------------|---------------|
| **Label association** | Every input has `<label>` with `for` attribute |
| **Error announcement** | Errors announced via `aria-live="polite"` |
| **Required indication** | Required fields marked with "*" and `aria-required="true"` |
| **Field descriptions** | Helper text linked via `aria-describedby` |
| **Focus management** | On error, focus moves to first invalid field |
| **Keyboard navigation** | Tab order follows visual order |

---

## 31. State Management Requirements

### 31.1 Client-Side State (User-Facing)

| State | Persistence | Scope | User Impact |
|-------|------------|-------|-------------|
| **Language preference** | localStorage + cookie | Global | Remembered across sessions |
| **Country/region** | localStorage | Global | Remembered across sessions |
| **Compare list** | localStorage | Global | Persisted across page navigation |
| **Cart/wishlist** | localStorage (Phase 1) | Global | Persisted across sessions |
| **Form drafts** | sessionStorage | Per form | Survives page refresh, lost on tab close |
| **Filter state** | URL query params | Per page | Shareable, bookmarkable |
| **Modal/open panels** | React/Vue state | Per page | Lost on refresh (acceptable) |
| **Carousel slide** | React/Vue state | Per component | Resets on refresh (acceptable) |
| **Accordion open state** | React/Vue state | Per component | Resets on refresh (acceptable) |

### 31.2 Server-Side State (User-Facing)

| State | Persistence | User Impact |
|-------|------------|-------------|
| **Authentication session** | HTTP-only cookie (JWT) | Secure login state |
| **CMS draft content** | Database | Survives logout, available to co-authors |
| **Inquiry/ticket status** | Database | Trackable via email link |
| **Warranty registration** | Database | Looked up by email + serial |
| **RMA status** | Database | Trackable via RMA number |
| **Partner portal access** | Database + session | Secure resource access |

### 31.3 State Synchronization Requirements

| Scenario | Requirement |
|----------|-------------|
| **User adds to compare on mobile, views on desktop** | Compare list synced via localStorage (same browser) or account (if logged in, Phase 2) |
| **User changes language** | All content reloads in selected language; preference saved |
| **User submits form, goes back** | Form should be cleared (not pre-filled) to prevent double submission |
| **User partially fills form, navigates away** | Optional: "You have unsaved changes. Leave anyway?" for long forms (quote request, distributor inquiry) |
| **CMS user edits product, another user edits same product** | Optimistic locking: warn if product was modified since page load |

---

## 32. Performance from User Perspective

> **Synchronized with:** BRD Section 20 (Performance Requirements), RFP Section 6.2 / 10.2

### 32.1 Perceived Performance Targets

| Metric | Target | Maximum Acceptable | User Experience Impact |
|--------|--------|-------------------|----------------------|
| **First Contentful Paint (FCP)** | < 1.0s | 1.5s | User sees content quickly; feels fast |
| **Largest Contentful Paint (LCP)** | < 1.8s | 2.5s | Main content visible; primary metric for perceived speed |
| **First Input Delay (FID)** | < 50ms | 100ms | Page feels responsive to first interaction |
| **Interaction to Next Paint (INP)** | < 150ms | 200ms | All interactions feel smooth |
| **Cumulative Layout Shift (CLS)** | < 0.05 | 0.1 | No jarring content jumps; stable reading experience |
| **Time to First Byte (TTFB)** | < 150ms | 300ms | Server responds quickly |
| **Total Blocking Time (TBT)** | < 150ms | 300ms | Main thread not blocked; scrolling smooth |

### 32.2 Feature-Specific Performance Expectations

| Feature | User Expectation | Technical Target |
|---------|-----------------|------------------|
| **Category page load** | Instant feel | < 1.5s for full page, < 500ms for above-fold |
| **Filter application** | Immediate update | < 200ms for AJAX refresh |
| **Product detail load** | Fast | < 2.0s full page, < 1.0s above-fold |
| **Image gallery navigation** | No perceptible delay | < 100ms for next image |
| **Compatibility search** | Quick results | < 2.0s for results page |
| **Auto-suggest** | Typing speed response | < 100ms per keystroke |
| **Where to Buy map** | Interactive quickly | < 3.0s for map + pins |
| **Form submission** | Responsive | < 3.0s for server response |
| **CMS admin load** | Usable | < 1.0s for dashboard |
| **Search (Algolia)** | Instant feel | < 100ms for results |

### 32.3 Loading Strategies from User Perspective

| Strategy | User Experience | Use Case |
|----------|----------------|----------|
| **Skeleton screens** | User sees content structure forming; less jarring than blank page | Product grids, news listings, category pages |
| **Progressive image loading** | Blurry placeholder → sharp image | All product and article images |
| **Lazy loading (below fold)** | User doesn't wait for off-screen content | Images, videos, iframes below viewport |
| **Priority loading (above fold)** | Hero content loads first | Homepage hero, product detail above-fold |
| **Prefetch on hover** | Next page feels instant | Product cards, navigation links |
| **Infinite scroll** | Seamless browsing without pagination clicks | Product grids, news listings |
| **Pagination fallback** | Clear control over large lists | Alternative to infinite scroll for accessibility |

### 32.4 Network Resilience

| Scenario | User Experience |
|----------|----------------|
| **Slow 3G** | Core content loads first; images progressively enhance; non-critical JS deferred |
| **Connection drops during form submission** | Form data preserved; user can retry without re-entering |
| **CDN edge failure** | Fallback to origin server; slightly slower but functional |
| **Third-party service down (maps, chat)** | Graceful fallback: static map image, offline message form |

---

## 33. Accessibility from User Perspective

> **Synchronized with:** BRD Section 24 (Accessibility Requirements), RFP Section 6.3 / 11.2

### 33.1 Keyboard Navigation Requirements

| Element | Keyboard Behavior |
|---------|------------------|
| **Main navigation** | Tab through links; Enter to open dropdown; Escape to close; Arrow keys within dropdown |
| **Mobile menu** | Tab trapped within menu while open; Escape or close button to dismiss |
| **Product grid** | Tab through product cards; Enter to open product; Arrow keys optional for grid navigation |
| **Filter panel** | Tab through checkboxes; Space to toggle; Enter to apply; Escape to close (mobile) |
| **Modal/lightbox** | Tab trapped within modal; Escape to close; Enter for primary action |
| **Carousel** | Left/Right arrows to navigate; Enter to click CTA; Pause on focus |
| **Accordion/FAQ** | Enter/Space to toggle; Tab to next item |
| **Tabs** | Left/Right arrows to switch tabs; Enter to activate |
| **Forms** | Tab through fields in logical order; Enter to submit from last field |
| **Skip link** | First focusable element: "Skip to main content" link |

### 33.2 Screen Reader Requirements

| Element | Requirement |
|---------|-------------|
| **Images** | All images have descriptive alt text; decorative images have empty alt |
| **Icons** | Icon-only buttons have `aria-label` (e.g., "Search", "Close menu") |
| **Live regions** | Search results, filter updates, form errors announced via `aria-live` |
| **Page titles** | Unique, descriptive `<title>` on every page |
| **Headings** | Logical hierarchy (H1 → H2 → H3), no skipped levels |
| **Landmarks** | Proper use of `<header>`, `<nav>`, `<main>`, `<footer>`, `<aside>` |
| **Tables** | Data tables have `<th>` with scope; complex tables have headers/id |
| **Forms** | All inputs have associated `<label>`; errors announced via `aria-describedby` |
| **Status messages** | "Added to compare," "Form submitted" announced without moving focus |
| **Dialogs** | `role="dialog"`, `aria-modal="true"`, focus trapped, title announced |

### 33.3 Visual Accessibility

| Requirement | Implementation |
|-------------|---------------|
| **Color contrast** | Minimum 4.5:1 for normal text, 3:1 for large text (18px+ bold) |
| **Focus indicators** | Visible 2px outline (`#00A3E0`) on all interactive elements |
| **Text resizing** | Site functional at 200% zoom without horizontal scroll |
| **Color independence** | Information never conveyed by color alone (icons + text + patterns) |
| **Motion sensitivity** | Respect `prefers-reduced-motion`; disable auto-play animations |
| **Flashing content** | No content flashes > 3 times per second |

### 33.4 Cognitive Accessibility

| Requirement | Implementation |
|-------------|---------------|
| **Consistent navigation** | Same menu structure on every page |
| **Predictable behavior** | Buttons look like buttons; links look like links |
| **Error prevention** | Confirm destructive actions; clear validation messages |
| **Simple language** | Avoid jargon where possible; explain technical terms |
| **Progress indicators** | Multi-step forms show "Step 2 of 4" |
| **Time limits** | No auto-timeout for reading content; extendable session warnings |

---

## 34. Security & Privacy from User Perspective

> **Synchronized with:** BRD Sections 21–22 (Security & Compliance), RFP Section 11

### 34.1 Security Indicators Users See

| Element | User-Facing Indicator |
|---------|----------------------|
| **HTTPS** | Padlock icon in browser; no mixed-content warnings |
| **Secure forms** | "Your information is transmitted securely" text near submit |
| **Password field** | Masked input with show/hide toggle |
| **reCAPTCHA** | Invisible to most users; challenge only if bot behavior detected |
| **Account lockout** | "Account temporarily locked" message after 5 failed attempts |
| **Session timeout** | Warning banner at 25 minutes: "Your session will expire in 5 minutes" |
| **Password reset** | "If an account exists, a reset email has been sent" (generic for security) |

### 34.2 Privacy Controls Users Have

| Control | Location | User Action |
|---------|----------|-------------|
| **Cookie consent** | Banner on first visit | Accept all, reject non-essential, or customize |
| **Marketing consent** | Newsletter signup, forms | Opt-in checkbox (unchecked by default for EU) |
| **Data deletion request** | Privacy policy page | Email legal@twinmos.com or use form |
| **Unsubscribe** | Every marketing email | One-click unsubscribe link |
| **Analytics opt-out** | Cookie settings | Disable GA4, Meta Pixel, LinkedIn tracking |
| **Location permission** | Where to Buy page | Allow or deny browser geolocation |

### 34.3 Data Minimization from User View

| Form | Required Fields | Optional Fields |
|------|----------------|----------------|
| **General Contact** | Name, Email, Country, Subject, Message | Phone |
| **Quote Request** | Company, Name, Email, Phone, Country, Product, Quantity | Target Price, Timeline, File |
| **Distributor Inquiry** | Company, Country, Name, Email, Phone, Years in Business, Brands, Volume | Website, Message |
| **Warranty Registration** | Product, Serial, Purchase Date, Retailer | Receipt Upload |
| **RMA Request** | Product, Serial, Issue Description | Photo/Video |
| **Newsletter** | Email | Country, Interests |
| **Live Chat (offline)** | Name, Email, Message | — |

### 34.4 User Trust Signals

| Signal | Location | Purpose |
|--------|----------|---------|
| **SSL certificate** | Browser chrome | Secure connection |
| **Privacy policy link** | Footer, forms | Transparency |
| **Terms of use** | Footer, partner portal | Legal clarity |
| **Cookie policy** | Footer, cookie banner | Transparency |
| **Certification badges** | Footer, product pages, About | Credibility (ISO, CE, FCC, RoHS) |
| **Industry Awards (verified)** — e.g., UAE Superbrand 2022 (subject to verification per BR-5.5) | About, Awards | Brand recognition; only published with certificate evidence |
| **Dubai HQ address** | About, Contact | Physical presence verification |
| **Response-Time Commitment** | Form success pages | Service expectation (5-min auto-reply, 24h sales SLA, 48h support SLA) |

---

## 35. Requirements Traceability Matrix

> **Purpose:** Ensure 100% synchronization between URD, BRD, and RFP. Every user requirement maps to a business requirement and procurement requirement.

### 35.1 Epic-Level Traceability

| URD Epic | BRD Epic | BRD Section | RFP Section | RFP Feature ID | Priority |
|----------|----------|-------------|-------------|----------------|----------|
| UR-Epic 1: Product Discovery & Catalog | Epic 1 | Section 8 | Section 8.1 | RFP-FR-8.1 | P0 |
| UR-Epic 2: System Compatibility Finder | Epic 2 | Section 9 | Section 8.2 | RFP-FR-8.2 | P0 |
| UR-Epic 3: Where to Buy / Distributor Locator | Epic 3 | Section 10 | Section 8.3 | RFP-FR-8.3 | P0 |
| UR-Epic 4: Lead Generation & Contact Management | Epic 4 | Section 11 | Section 8.4 | RFP-FR-8.4 | P0 |
| UR-Epic 5: Content Management | Epic 5 | Section 12 | Section 8.5 | RFP-FR-8.5 | P0 |
| UR-Epic 6: Support & Self-Service | Epic 6 | Section 13 | Section 8.4 | RFP-FR-8.4 | P1 |
| UR-Epic 7: Partner / Distributor Portal | Epic 7 | Section 14 | Section 8.6 | RFP-FR-8.6 | P2 |
| UR-Epic 8: Gaming Hub — VOLTX Brand | Epic 8 | Section 15 | Section 8.7 | RFP-FR-8.7 | P1 |
| UR-Epic 9: Multi-Language & Regionalization | Epic 9 | Section 16 | Section 12 | RFP-FR-12 | P1 |
| UR-Epic 10: Admin & CMS | Epic 10 | Section 17 | Section 9.3 | RFP-FR-9.3 | P0 |
| UR-Epic 11: Solutions / Vertical Use Cases | Epic 11 | BRD §11 | RFP §8.9 | RFP-FR-9 | P1 |
| UR-Epic 12: Technology, R&D & Innovation | Epic 12 | BRD §12 | RFP §8.10 | RFP-FR-10 | P1 |
| UR-Epic 13: Learn / Knowledge Hub | Epic 13 | BRD §13 | RFP §8.11 | RFP-FR-11 | P1 |
| UR-Epic 14: Careers | Epic 14 | BRD §14 | RFP §8.13 | RFP-FR-13 | P1 |
| UR-Epic 15: Marketing Programs & Campaigns | Epic 15 | BRD §15 | RFP §8.14 | RFP-FR-14 | P1 |
| UR-Epic 16: Compliance, Trust & Legal Hub | Epic 16 | BRD §16 | RFP §8.15 | RFP-FR-15 | P0 |
| UR-Epic 17: Anti-Counterfeit / Product Authentication | Epic 17 | BRD §17 | RFP §8.16 | RFP-FR-16 | P2 |
| UR-Epic 18: Channel Programs (OEM/ODM, System Builder, MDF) | Epic 18 | BRD §18 | RFP §8.17 | RFP-FR-17 | P0 |

### 35.2 User Story-Level Traceability

| URD Requirement | BRD User Story | RFP Reference | Use Case | Page Template |
|-----------------|----------------|---------------|----------|---------------|
| UR-1.1 | US-1.1 | RFP-FR-8.1.1 | UC-1 | Category Page |
| UR-1.2 | US-1.2 | RFP-FR-8.1.1 | UC-2 | Category Page |
| UR-1.3 | US-1.3 | RFP-FR-8.1 (PDP) | UC-3 | Product Detail Page |
| UR-1.4 | US-1.4 | RFP-FR-8.1.2 | UC-4, UC-28 | Comparison Page |
| UR-1.5 | US-1.5 | RFP-FR-8.1.6 | UC-5 | Product Detail Page |
| UR-2.1 | US-2.1 | RFP-FR-8.2.1 | UC-6 | Compatibility Finder |
| UR-2.2 | US-2.2 | RFP-FR-8.2.3 | UC-7 | Compatibility Finder |
| UR-2.3 | US-2.3 | RFP-FR-8.2 | UC-7 | Product Detail Page |
| UR-3.1 | US-3.1 | RFP-FR-8.3.1 | UC-8 | Where to Buy Page |
| UR-3.2 | US-3.2 | RFP-FR-8.3.4 | UC-8 | Product Detail Page |
| UR-3.3 | US-3.3 | RFP-FR-8.3.6 | UC-9 | Contact / Partners Page |
| UR-4.1 | US-4.1 | RFP-FR-8.4.6 | UC-10 | Contact Page |
| UR-4.2 | US-4.2 | RFP-FR-8.4.6 | UC-11 | Contact / Product Page |
| UR-4.3 | US-4.3 | RFP-FR-8.5 | UC-12 | Footer / News Page |
| UR-4.4 | US-4.4 | RFP-FR-8.4.7 | UC-25 | All Pages (widget) |
| UR-5.1 | US-5.1 | RFP-FR-8.5.1 | UC-20 | News Listing / Article |
| UR-5.2 | US-5.2 | RFP-FR-8.5.2 | UC-20 (event variant) | Event Page |
| UR-5.3 | US-5.3 | RFP-FR-8.5.3 | UC-20 (awards variant) | Awards Page |
| UR-6.1 | US-6.1 | RFP-FR-8.4.1 | UC-13 | Support / Warranty Page |
| UR-6.2 | US-6.2 | RFP-FR-8.4.3 | UC-27 | Support / Firmware Page |
| UR-6.3 | US-6.3 | RFP-FR-8.4.4 | UC-15 | Support / KB Page |
| UR-6.4 | US-6.4 | RFP-FR-8.4.2 | UC-14 | Support / RMA Page |
| UR-7.1 | US-7.1 | RFP-FR-8.6.1 | UC-16, UC-31 | Partner Portal Login |
| UR-7.2 | US-7.2 | RFP-FR-8.6.2 | UC-32 | Partner Portal |
| UR-7.3 | US-7.3 | RFP-FR-8.6.3 | UC-17 | Partner Portal |
| UR-8.1 | US-8.1 | RFP-FR-8.7.1 | UC-18 | Gaming Hub Page |
| UR-8.2 | US-8.2 | RFP-FR-8.7.2 | UC-23 | Gaming Hub Page |
| UR-8.3 | US-8.3 | RFP-FR-8.7.3 | UC-22, UC-30 | Gaming Hub / Gallery |
| UR-9.1 | US-9.1 | RFP §12.1 | UC-19 | All Pages |
| UR-9.2 | US-9.2 | RFP §12.2 | UC-24 | All Pages |
| UR-10.1 | US-10.1 | RFP §9.3 | UC-21 | CMS Admin |
| UR-10.2 | US-10.2 | RFP §9.3 | UC-20 | CMS Admin |
| UR-10.3 | US-10.3 | RFP §9.3 | UC-29 | CMS Admin |
| (Cross-cutting) | — | RFP §11.2 | UC-26 | Accessibility (all pages) |

### 35.3 Business Rule Traceability

| URD Section | Business Rules Referenced | BRD Rule IDs |
|-------------|--------------------------|--------------|
| UR-Epic 1 (Product Catalog) | SKU uniqueness, image standards, spec completeness, discontinued handling, new badge, URL structure | BR-1.1–BR-1.6, BR-GLOBAL-1, BR-GLOBAL-4, BR-GLOBAL-8 |
| UR-Epic 2 (Compatibility) | Lab verification, not verified messaging, device spec sourcing, performance | BR-2.1–BR-2.4 |
| UR-Epic 4 (Lead Gen) | Auto-reply SLA, response SLAs, double opt-in, GDPR compliance | BR-4.1–BR-4.6, BR-GLOBAL-5, BR-GLOBAL-10 |
| UR-Epic 5 (Content) | Two-person review, 48h publication, WebP images, press release template | BR-5.1–BR-5.4 |
| UR-Epic 6 (Support) | Warranty periods, RMA warranty check, serial validation, KB review | BR-6.1–BR-6.4 |
| UR-Epic 7 (Portal) | Invitation only, watermarking, terms acceptance | BR-7.1–BR-7.3 |
| UR-Epic 8 (Gaming) | Performance budget, moderation, mobile responsive | BR-8.1–BR-8.3 |
| UR-Epic 9 (Multi-Language) | English source of truth, RTL, informational currency, unique URLs | BR-9.1–BR-9.4 |
| UR-Epic 10 (CMS) | Admin-only creation, spec approval, draft first, soft delete | BR-10.1–BR-10.4 |

### 35.4 Non-Functional Requirement Traceability

| URD Section | BRD Section | RFP Section | Topic |
|-------------|-------------|-------------|-------|
| Section 32 (Performance) | Section 20 | Sections 6.2, 10.2 | Page load, API response, capacity |
| Section 33 (Accessibility) | Section 24 | Sections 6.3, 11.2 | WCAG 2.1 AA, keyboard, screen readers |
| Section 34 (Security/Privacy) | Sections 21–22 | Section 11 | TLS, CSP, GDPR, UAE, India compliance |

---

## 36. Change Control & Version Sync Protocol

### 36.1 Document Change Workflow

```
Change Requested (any document)
│
├─ Identify affected documents
│   ├─ BRD change ──► Update URD traceability + user requirements
│   ├─ RFP change ──► Update URD scope + traceability
│   └─ URD change ──► Verify BRD/RFP alignment or flag discrepancy
│
├─ Assess user impact
│   ├─ UI change? ──► Update Sections 20–24
│   ├─ Flow change? ──► Update Sections 25–28
│   ├─ New use case? ──► Update Sections 18–19
│   └─ Scope change? ──► Update traceability matrix
│
├─ Update all affected documents
│   ├─ Increment version number
│   ├─ Update Document Control table
│   └─ Log in Appendix D (Synchronization Log)
│
└─ Review and approve
    ├─ Technical Lead review
    ├─ Product Manager review
    └─ Stakeholder sign-off
```

### 36.2 Synchronization Rules

| Rule | Description |
|------|-------------|
| **Rule 1: BRD is Source of Truth for Scope** | If BRD and URD conflict, BRD prevails for business logic; URD prevails for user experience |
| **Rule 2: User Story ID Immutability** | Once a US-ID is assigned (e.g., US-1.1), it never changes. New stories get new IDs |
| **Rule 3: Traceability Required** | Every URD requirement must have at least one BRD reference and one RFP reference (where applicable) |
| **Rule 4: Version Lock at Milestones** | Documents are version-locked at: Design Approval, Beta Delivery, UAT Start, Launch |
| **Rule 5: Weekly Sync Check** | During active development, PM reviews all three documents weekly for drift |

### 36.3 Document Version Alignment

| Milestone | BRD Version | RFP Version | URD Version | Status |
|-----------|-------------|-------------|-------------|--------|
| Initial Release | 1.0 | 1.0 | 1.0 | ✅ Superseded |
| Aligned Edition | 2.0 | 2.0 | 2.0 | ✅ Superseded — 29 Apr 2026 |
| **Content-Aligned Edition (Current)** | **3.0** | **3.0** | **3.0** | ✅ **Synchronized — 30 Apr 2026** |
| Design Approval | 3.1 | 3.0 | 3.1 | Pending |
| Beta Delivery | 3.2 | 3.0 | 3.2 | Pending |
| UAT Start | 3.3 | 3.0 | 3.3 | Pending |
| Public Launch | 3.4 | 3.0 | 3.4 | Pending |

---

## 37. Appendix A: User Interview Questions

> **Purpose:** Template questions for gathering user feedback during discovery, design, and post-launch phases.

### 37.1 Discovery Phase Questions

**For Gamers (Rahul):**
1. When researching RAM for a new build, what's the first thing you look for on a brand's website?
2. How important is seeing RGB lighting effects before purchase?
3. What would make you trust a memory brand you've never bought from before?
4. How do you currently verify compatibility with your motherboard?
5. What's the most frustrating thing about hardware brand websites?

**For System Integrators (Kumar):**
1. How do you currently source memory and SSDs for your builds?
2. What information do you need to see before recommending a brand to a customer?
3. How do you prefer to request bulk pricing?
4. What would make you consider becoming an authorized distributor?
5. How important are downloadable datasheets and certification documents?

**For Enterprise Buyers (Sarah):**
1. What signals do you look for to verify a vendor's credibility?
2. How do you typically request volume quotes from hardware vendors?
3. What documentation do you need for procurement approvals?
4. How important is multi-language support for your region?

**For Laptop Upgraders (Aisha):**
1. How did you figure out what RAM your laptop needs?
2. What would make you feel confident buying from a brand online?
3. Would a simple "enter your laptop model" tool be helpful?
4. What concerns do you have about installing RAM yourself?

### 37.2 Usability Testing Questions (Post-Design)

1. Can you find DDR5 RAM for gaming? (Task: Navigate to product)
2. Can you check if this RAM works with your motherboard? (Task: Use compatibility finder)
3. Where would you buy this product in your city? (Task: Use where to buy)
4. How would you contact TwinMOS for a bulk order? (Task: Find quote form)
5. Can you find the warranty terms? (Task: Navigate to support)

### 37.3 Post-Launch Feedback Questions

1. How easy was it to find the product you were looking for? (1–5 scale)
2. Did the compatibility finder help you make a decision? (Yes/No/Somewhat)
3. How likely are you to recommend TwinMOS to a friend? (NPS 0–10)
4. What feature did you use most? (Open-ended)
5. What feature is missing that you expected? (Open-ended)

---

## 38. Appendix B: Usability Test Scenarios

### 38.1 Test Scenario 1: Product Discovery

**Task:** Find a 32GB DDR5 RGB RAM kit and check if it works with an ASUS ROG STRIX Z790-E motherboard.

**Success Criteria:**
- User navigates to Memory category within 10 seconds
- User applies filters for DDR5, 32GB, RGB within 20 seconds
- User views product detail page within 30 seconds
- User finds and uses compatibility checker within 45 seconds
- User confirms QVL status within 60 seconds

**Metrics:**
- Time on task
- Error rate (wrong category, wrong filters)
- Subjective difficulty rating (1–5)

### 38.2 Test Scenario 2: Laptop Upgrade

**Task:** You have a Dell Inspiron 15 3520. Find compatible RAM and identify a store in Mumbai that sells it.

**Success Criteria:**
- User finds compatibility finder within 15 seconds
- User selects correct brand and model within 30 seconds
- User views compatible products within 45 seconds
- User navigates to Where to Buy within 60 seconds
- User identifies Mumbai retailer within 90 seconds

### 38.3 Test Scenario 3: Distributor Inquiry

**Task:** You run a PC distribution company in Kenya. Apply to become a TwinMOS distributor.

**Success Criteria:**
- User finds distributor inquiry form within 20 seconds
- User completes all required fields correctly
- User receives confirmation message
- User understands next steps (48-hour response)

### 38.4 Test Scenario 4: Warranty Registration

**Task:** Register a new TwinMOS SSD purchase and check warranty status.

**Success Criteria:**
- User finds warranty registration page within 15 seconds
- User completes form with serial number
- User receives confirmation with expiration date
- User can look up registration by email + serial

### 38.5 Test Scenario 5: Language Switch

**Task:** Switch the website to Arabic and find local retailers in Dubai.

**Success Criteria:**
- User finds language selector within 10 seconds
- User switches to Arabic successfully
- User confirms RTL layout is correct
- User finds UAE retailer information

### 38.6 Accessibility Test Scenario

**Task:** Navigate the website using only keyboard and screen reader.

**Success Criteria:**
- All interactive elements reachable via Tab
- All form fields properly labeled
- All images have alt text
- All errors announced by screen reader
- No keyboard traps

---

## 39. Appendix C: Accessibility Checklist (User-Facing)

### 39.1 Per-Page Checklist

| # | Check | Pass Criteria |
|---|-------|--------------|
| 1 | Page has unique, descriptive `<title>` | Yes / No |
| 2 | Page has logical heading hierarchy (H1→H2→H3) | Yes / No |
| 3 | All images have alt text | Yes / No |
| 4 | All links have descriptive text (not "click here") | Yes / No |
| 5 | Color contrast ≥ 4.5:1 for body text | Yes / No |
| 6 | All interactive elements have visible focus indicator | Yes / No |
| 7 | Form fields have associated labels | Yes / No |
| 8 | Error messages are clear and specific | Yes / No |
| 9 | Video content has captions or transcript | Yes / No |
| 10 | Page is navigable via keyboard only | Yes / No |
| 11 | No auto-playing audio/video | Yes / No |
| 12 | No content flashes > 3Hz | Yes / No |
| 13 | Text resizes to 200% without horizontal scroll | Yes / No |
| 14 | Skip link present for main content | Yes / No |
| 15 | Language attribute set on `<html>` | Yes / No |

### 39.2 Screen Reader Testing Checklist

| # | Check | NVDA | JAWS | VoiceOver | TalkBack |
|---|-------|------|------|-----------|----------|
| 1 | Main navigation readable | Pass/Fail | Pass/Fail | Pass/Fail | Pass/Fail |
| 2 | Product cards announced with name + price | Pass/Fail | Pass/Fail | Pass/Fail | Pass/Fail |
| 3 | Form errors announced | Pass/Fail | Pass/Fail | Pass/Fail | Pass/Fail |
| 4 | Filter updates announced | Pass/Fail | Pass/Fail | Pass/Fail | Pass/Fail |
| 5 | Modal title announced on open | Pass/Fail | Pass/Fail | Pass/Fail | Pass/Fail |
| 6 | Table headers read with data cells | Pass/Fail | Pass/Fail | Pass/Fail | Pass/Fail |
| 7 | Carousel controls accessible | Pass/Fail | Pass/Fail | Pass/Fail | Pass/Fail |
| 8 | Language switch announced | Pass/Fail | Pass/Fail | Pass/Fail | Pass/Fail |

---

## 40. Appendix D: Synchronization Log

| Date | Document | Version | Change Description | URD Impact | BRD Impact | RFP Impact |
|------|----------|---------|-------------------|------------|------------|------------|
| April 2026 | URD | 1.0 | Initial release synchronized with BRD v1.0 and RFP v1.0 | — | — | — |
| 29 Apr 2026 | RFP | 2.0 | Comprehensive alignment: reverted ISO claim to the published TÜV SÜD ISO 9001:2000 (2002) certification; aligned heritage to "27+ years (since 1998)"; clarified manufacturing footprint; added procurement timeline, NDA, vendor Q&A, anti-counterfeit, data-residency, CI/CD; introduced RFP-FR-X.Y identifiers | URD §1.2 phasing aligned; URD traceability uses new identifiers | BRD §6.1 phasing aligned; BRD §22.3 cert standard updated | — |
| 29 Apr 2026 | BRD | 2.0 | Comprehensive alignment: standardized heritage; corrected ISO; clarified warranty rules (BR-6.1, BR-6.5); fixed API versioning (`/api/v1/...`); updated Reference Documents; added BR-5.5 (award verification); marked KPI baselines as estimates | URD §29 data presentation kept consistent; UR-5.3 awards conditional on verification | — | RFP §16.3 kept consistent |
| 29 Apr 2026 | URD | 2.0 | Comprehensive alignment: removed foreign-language artifact in §34.4; corrected BR-9.x cross-references in §16.3; added UC-32 (Marketing Assets); expanded §19.5 cross-cutting use-case diagram; updated traceability matrix to use RFP-FR-X.Y; clarified phased roadmap | — | BRD US-9.1/9.2 kept consistent | RFP-FR-X.Y identifiers adopted |

**Change Request Template:**

```
CR-ID: CR-001
Date: [YYYY-MM-DD]
Requested By: [Name/Role]
Document(s) Affected: [BRD / RFP / URD]
Change Description: [What is changing and why]
User Impact: [How does this affect the user experience]
BRD Updates Required: [Yes/No — specify]
RFP Updates Required: [Yes/No — specify]
URD Updates Required: [Yes/No — specify]
Approval: [Name / Date]
```

---

*This User Requirements Document is a living document. All changes must be logged in the Document Control table and Appendix D. For questions or clarifications, contact the Product Manager, UX Lead, or Technical Lead.*

**Document Version:** 2.0 (Aligned Edition)  
**Last Updated:** 29 April 2026  
**Next Review:** Upon vendor selection and design-phase kickoff (target: 24 July 2026)  
**Synchronized With:** RFP v2.0, BRD v2.0, Forensic Audit v1.0, Company Profile v2.0

---

## Document Suite Index

| Document | Version | Purpose | Location |
|----------|---------|---------|----------|
| TwinMOS Company Profile | 2.0 | Corporate intelligence and authoritative source for facts about TwinMOS | `TwinMOS_Company_Profile_Comprehensive.md` |
| TwinMOS Forensic Audit | 1.0 | Current-state problems and gap analysis | `TwinMOS_Website_Forensic_Audit.md` |
| TwinMOS Website RFP | 2.0 | Procurement document for vendors | `TwinMOS_Website_RFP.md` |
| TwinMOS Website BRD | 2.0 | Internal business requirements specification | `TwinMOS_Website_BRD.md` |
| **TwinMOS Website URD** | **2.0** | **User-centric functional specifications (this document)** | `TwinMOS_Website_URD.md` |

**Document Precedence (Conflict Resolution):**
1. Company Profile — for facts about TwinMOS
2. BRD — for business rules and scope
3. URD — for user-facing interaction details
4. RFP — for procurement and contractual scope

**Next Document in Chain:** System Requirements Specification (SRS) / Software Design Specification (SDS)

---

*© 2026 TwinMOS Technologies Middle East FZE. All rights reserved. This document contains confidential and proprietary information.*
