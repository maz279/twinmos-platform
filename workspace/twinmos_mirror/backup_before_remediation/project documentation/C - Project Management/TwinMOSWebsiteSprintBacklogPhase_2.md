# TwinMOS Corporate Website — Sprint Backlog: Phase 2 (Localization & Partner Enablement)

**Document Reference:** TWN-PM-SPRINT-P2-2026-001  
**Version:** 1.0  
**Date:** 1 May 2026  
**Classification:** CONFIDENTIAL — Internal Use Only  
**Sprint Duration:** 2 weeks per sprint  
**Total Sprints:** 8 sprints (16 weeks)  
**Team Capacity:** 2 developers x 80 hours/sprint = 160 hours/sprint

---

## Sprint Overview

| Sprint | Theme | Weeks | Start | End | Capacity |
|--------|-------|-------|-------|-----|----------|
| Sprint 10 | Translation Foundation & Partner Portal Auth | 21–22 | 4 Jan 2027 | 17 Jan 2027 | 160h |
| Sprint 11 | Partner Portal Features & Anti-Counterfeit | 23–24 | 18 Jan 2027 | 31 Jan 2027 | 160h |
| Sprint 12 | RMA Portal & Compatibility Finder Full | 25–26 | 1 Feb 2027 | 14 Feb 2027 | 160h |
| Sprint 13 | ERP Integration & Firmware Center | 27–28 | 15 Feb 2027 | 28 Feb 2027 | 160h |
| Sprint 14 | Live Chat & Gaming Interactive | 29–30 | 1 Mar 2027 | 14 Mar 2027 | 160h |
| Sprint 15 | Marketing Automation & Whitepaper Gating | 31–32 | 15 Mar 2027 | 28 Mar 2027 | 160h |
| Sprint 16 | Localization Launch & QA | 33–34 | 29 Mar 2027 | 11 Apr 2027 | 160h |
| Sprint 17 | Stabilization, UAT & Phase 2 Launch | 35–36 | 12 Apr 2027 | 25 Apr 2027 | 160h |

---

## Sprint 10: Translation Foundation & Partner Portal Auth (Weeks 21–22)

**Sprint Goal:** Translation vendor engaged and delivering; Partner Portal authentication framework fully wired with Better Auth and Strapi roles.

**Capacity:** 160 hours

| ID | User Story / Task | Priority | Effort (h) | Owner | Acceptance Criteria |
|----|-------------------|----------|------------|-------|---------------------|
| P2-S10-001 | As a PM, I have translation vendor contracts signed for AR / BN / HI with delivery schedule | P0 | 8 | TwinMOS PM | Contracts signed; delivery milestones agreed; payment terms set |
| P2-S10-002 | As a partner, I can register and log in to the Partner Portal using Better Auth | P0 | 24 | Senior Dev | Registration form validates; email confirmation sent; login works; session persists |
| P2-S10-003 | As an admin, I can assign Strapi roles (Distributor / OEM-ODM / System Builder / Reseller / Admin) | P0 | 16 | Senior Dev | Role assignment UI works; permissions enforced per role |
| P2-S10-004 | As a partner, I see a personalized dashboard after login showing my program and assets | P0 | 20 | Senior Dev | Dashboard renders program-specific content; navigation reflects role |
| P2-S10-005 | As a developer, I have translation workflow configured in Strapi i18n for AR / BN / HI | P0 | 16 | Team Lead | Locales configured; translation keys exportable; import pipeline ready |
| P2-S10-006 | As a developer, I have RTL CSS framework verified for Arabic (direction, mirroring, fonts) | P0 | 16 | Team Lead | Arabic text renders; layouts mirror correctly; Noto Sans Arabic loads |
| P2-S10-007 | As a PM, I have glossary of TwinMOS technical terms provided to translation vendor | P1 | 8 | TwinMOS PM | Glossary document shared; 200+ terms defined |
| P2-S10-008 | As a developer, I have translation memory seed file prepared from Phase 1 EN content | P1 | 12 | Team Lead | TM file generated; reusable strings identified; vendor can import |

**Sprint 10 Definition of Done:**
- [ ] Partner Portal auth functional (register, login, roles, dashboard)
- [ ] Translation vendor engaged with delivery plan
- [ ] RTL framework verified
- [ ] Strapi i18n ready for AR/BN/HI
- [ ] Demo to TwinMOS: Partner Portal login + RTL preview

---

## Sprint 11: Partner Portal Features & Anti-Counterfeit (Weeks 23–24)

**Sprint Goal:** Partner asset library, price lists, and anti-counterfeit SN-check fully operational.

**Capacity:** 160 hours

| ID | User Story / Task | Priority | Effort (h) | Owner | Acceptance Criteria |
|----|-------------------|----------|------------|-------|---------------------|
| P2-S11-001 | As a partner, I can download co-branded marketing assets (banners, logos, datasheets, POS) | P0 | 20 | Senior Dev | Asset library lists files by category; download works; assets are current |
| P2-S11-002 | As a partner, I can view and export watermarked price lists (PDF/Excel) | P0 | 24 | Senior Dev | Price list gated by role; watermark includes partner name + date; export works |
| P2-S11-003 | As a partner, I can see my tier status, points, and program benefits | P1 | 12 | Senior Dev | Tier info accurate; points calculated; benefits listed |
| P2-S11-004 | As a customer, I can verify product authenticity via serial number check | P0 | 24 | Senior Dev | SN validates against Strapi valid_serials collection; result shows genuine/counterfeit |
| P2-S11-005 | As an admin, I can bulk-import valid serial numbers from manufacturing | P0 | 16 | Senior Dev | CSV import works; duplicates handled; validation rules enforced |
| P2-S11-006 | As a visitor, I can read the public anti-counterfeit policy and reporting process | P1 | 8 | Team Lead | Policy page renders; reporting form functional; links from support and legal |
| P2-S11-007 | As a partner, I can submit MDF (Marketing Development Funds) pre-claim | P1 | 16 | Senior Dev | MDF form captures campaign details; submission stored; approval workflow placeholder |
| P2-S11-008 | As a developer, I have partner activity audit logging implemented | P1 | 12 | Senior Dev | All partner actions logged; admin can view audit trail; retention policy set |

**Sprint 11 Definition of Done:**
- [ ] Partner asset library functional
- [ ] Watermarked price lists operational
- [ ] Anti-counterfeit SN-check validates serials
- [ ] Manufacturing serial import pipeline ready
- [ ] Demo to TwinMOS: partner journey + SN-check demo

---

## Sprint 12: RMA Portal & Compatibility Finder Full (Weeks 25–26)

**Sprint Goal:** Full RMA workflow with 7-state tracker; Compatibility Finder expanded to 500 motherboards.

**Capacity:** 160 hours

| ID | User Story / Task | Priority | Effort (h) | Owner | Acceptance Criteria |
|----|-------------------|----------|------------|-------|---------------------|
| P2-S12-001 | As a customer, I can submit an RMA request with serial validation and issue description | P0 | 20 | Senior Dev | Form validates serial; captures issue; generates RMA number |
| P2-S12-002 | As a customer, I can track my RMA status through 7 states (Submitted → Under Review → Approved → In Repair → Shipped → Delivered → Closed) | P0 | 24 | Senior Dev | Tracker shows current state; history visible; email notifications at each transition |
| P2-S12-003 | As a support agent, I can update RMA status and add internal notes | P0 | 16 | Senior Dev | Status updates reflect on customer tracker; internal notes hidden from customer |
| P2-S12-004 | As a customer, I receive email notifications at every RMA state change | P0 | 12 | Senior Dev | Emails sent via Resend; templates branded; delivery confirmed |
| P2-S12-005 | As a shopper, I can search compatibility by 500+ motherboards/laptops/desktops | P0 | 24 | Senior Dev | QVL data ingested; search returns accurate results; filter by brand/model |
| P2-S12-006 | As a shopper, I can see compatibility confidence score and notes per result | P1 | 12 | Senior Dev | Confidence % shown; notes explain exceptions; linked to SKU page |
| P2-S12-007 | As an admin, I can import QVL data via CSV batch upload | P1 | 12 | Senior Dev | CSV template provided; validation errors reported; successful imports logged |
| P2-S12-008 | As a developer, I have RMA and compatibility data backed up daily | P1 | 8 | Senior Dev | Backup job configured; restore tested; retention 30 days |

**Sprint 12 Definition of Done:**
- [ ] RMA workflow end-to-end functional (submit → track → notify)
- [ ] Compatibility Finder covers 500+ devices
- [ ] QVL data importable via CSV
- [ ] Email notifications working
- [ ] Demo to TwinMOS: RMA submission + tracker + compatibility search

---

## Sprint 13: ERP Integration & Firmware Center (Weeks 27–28)

**Sprint Goal:** ERP read-only sync operational; Firmware Download Center with serial validation live.

**Capacity:** 160 hours

| ID | User Story / Task | Priority | Effort (h) | Owner | Acceptance Criteria |
|----|-------------------|----------|------------|-------|---------------------|
| P2-S13-001 | As a system, I can sync product master data from TwinMOS ERP (read-only) | P0 | 24 | Senior Dev | ERP API connected; SKU data syncs daily; sync logs visible |
| P2-S13-002 | As a system, I can sync pricing data from ERP for partner price lists | P0 | 16 | Senior Dev | Pricing syncs daily; discrepancies flagged; audit trail maintained |
| P2-S13-003 | As a customer, I can download firmware from the Firmware Download Center | P0 | 16 | Senior Dev | Firmware list renders; download links work; checksums displayed |
| P2-S13-004 | As a customer, my serial number is validated before firmware download | P0 | 12 | Senior Dev | Invalid serial blocked; valid serial permitted; download logged |
| P2-S13-005 | As an admin, I can upload new firmware versions with release notes | P0 | 12 | Senior Dev | Upload form validates file type; release notes stored; version history visible |
| P2-S13-006 | As a developer, I have ERP sync error handling and retry logic | P1 | 12 | Senior Dev | Failed syncs retry 3x; alerts sent after 3 failures; manual retry available |
| P2-S13-007 | As a developer, I have ERP API credentials securely stored in Coolify secrets | P1 | 4 | Senior Dev | Credentials not in repo; rotation procedure documented |
| P2-S13-008 | As a customer, I can see firmware compatibility list per device/SKU | P1 | 12 | Senior Dev | Compatibility matrix renders; links to product pages; filterable |

**Sprint 13 Definition of Done:**
- [ ] ERP product master sync operational
- [ ] Firmware Download Center live with serial validation
- [ ] Firmware upload admin functional
- [ ] Error handling and retry logic tested
- [ ] Demo to TwinMOS: ERP sync dashboard + firmware download flow

---

## Sprint 14: Live Chat & Gaming Interactive (Weeks 29–30)

**Sprint Goal:** Chatwoot live chat operational; Gaming Hub interactive features (RGB visualizer, build gallery) live.

**Capacity:** 160 hours

| ID | User Story / Task | Priority | Effort (h) | Owner | Acceptance Criteria |
|----|-------------------|----------|------------|-------|---------------------|
| P2-S14-001 | As a visitor, I can initiate live chat with a TwinMOS support agent | P0 | 24 | Senior Dev | Chatwoot widget renders; agent routing works; queue displayed if busy |
| P2-S14-002 | As a visitor, I can leave an offline message when no agents are available | P0 | 12 | Senior Dev | Offline form captures email + issue; ticket created; auto-reply sent |
| P2-S14-003 | As a support agent, I can view visitor context (page, country, history) | P1 | 12 | Senior Dev | Agent dashboard shows context; helps personalize response |
| P2-S14-004 | As a gamer, I can use the interactive RGB visualizer with lighting presets | P0 | 24 | Team Lead | Visualizer renders product; presets switch colors; sync badges shown |
| P2-S14-005 | As a gamer, I can submit my build to the Build Gallery with moderation queue | P0 | 20 | Team Lead | Submission form captures images + specs; moderation queue in Strapi |
| P2-S14-006 | As a moderator, I can approve/reject build submissions | P0 | 12 | Team Lead | Moderation UI in Strapi; approved builds appear on site; rejected notified |
| P2-S14-007 | As a gamer, I can see sync compatibility badges (Aura Sync, RGB Fusion, Mystic Light, Polychrome) | P1 | 8 | Team Lead | Badges render per product; tooltip explains compatibility |
| P2-S14-008 | As a developer, I have Chatwoot self-hosted on Hetzner with backup | P1 | 8 | Senior Dev | Chatwoot runs on Hetzner; daily backup configured; restore tested |

**Sprint 14 Definition of Done:**
- [ ] Live chat widget functional (online + offline)
- [ ] RGB visualizer interactive
- [ ] Build Gallery with moderation operational
- [ ] Chatwoot self-hosted and backed up
- [ ] Demo to TwinMOS: live chat + gaming hub walkthrough

---

## Sprint 15: Marketing Automation & Whitepaper Gating (Weeks 31–32)

**Sprint Goal:** Marketing CRM integration; whitepaper gating for lead capture; advanced reporting.

**Capacity:** 160 hours

| ID | User Story / Task | Priority | Effort (h) | Owner | Acceptance Criteria |
|----|-------------------|----------|------------|-------|---------------------|
| P2-S15-001 | As a marketer, I can gate whitepapers behind email capture forms | P0 | 16 | Senior Dev | Whitepaper pages require email; download link sent via email; lead logged in CRM |
| P2-S15-002 | As a marketer, I can view lead capture dashboard with source attribution | P0 | 20 | Senior Dev | Dashboard shows leads by source, form, date; exportable CSV |
| P2-S15-003 | As a system, form submissions sync to HubSpot CRM | P0 | 20 | Senior Dev | HubSpot API connected; submissions create contacts; duplicate handling |
| P2-S15-004 | As a marketer, I can create and manage promotional campaigns in Strapi | P1 | 16 | Senior Dev | Campaign collection in Strapi; start/end dates; banner management |
| P2-S15-005 | As a visitor, I see personalized content based on my country/locale | P1 | 12 | Team Lead | Geo-detected content; manual override respected; caching handles variants |
| P2-S15-006 | As a developer, I have HubSpot API credentials securely stored | P1 | 4 | Senior Dev | Credentials in Coolify secrets; rotation documented |
| P2-S15-007 | As a marketer, I can A/B test homepage hero banners | P1 | 16 | Team Lead | A/B test framework configured; 2 variants serve; conversion tracked |
| P2-S15-008 | As a team, we have marketing analytics dashboard with Plausible + HubSpot data | P1 | 20 | Team Lead | Dashboard aggregates data; weekly email report; trends visible |

**Sprint 15 Definition of Done:**
- [ ] Whitepaper gating operational
- [ ] HubSpot CRM sync working
- [ ] Lead capture dashboard live
- [ ] Marketing campaigns manageable in Strapi
- [ ] Demo to TwinMOS: marketing automation walkthrough

---

## Sprint 16: Localization Launch & QA (Weeks 33–34)

**Sprint Goal:** AR / BN / HI translations imported, verified, and live; full localization QA complete.

**Capacity:** 160 hours

| ID | User Story / Task | Priority | Effort (h) | Owner | Acceptance Criteria |
|----|-------------------|----------|------------|-------|---------------------|
| P2-S16-001 | As a developer, I have AR / BN / HI translations imported into Strapi | P0 | 16 | Team Lead | All translations imported; fields populated; no missing keys |
| P2-S16-002 | As a developer, I have RTL layout verified across all 287 pages for Arabic | P0 | 24 | Team Lead | Arabic renders correctly; layouts mirror; no overflow or clipping |
| P2-S16-003 | As a tester, I have completed native-speaker review for BN and HI content | P0 | 16 | Both | Native speakers review; corrections applied; sign-off obtained |
| P2-S16-004 | As a tester, I have verified accessibility in Arabic (NVDA/VoiceOver RTL) | P0 | 16 | Both | Screen reader navigates RTL correctly; focus order logical |
| P2-S16-005 | As a developer, I have locale-specific SEO (hreflang, canonical, sitemap) | P0 | 12 | Team Lead | hreflang tags correct; sitemap includes all locales; canonicals set |
| P2-S16-006 | As a tester, I have completed cross-browser QA for all 3 new locales | P0 | 16 | Both | Chrome, Safari, Firefox, Edge tested; no locale-specific bugs |
| P2-S16-007 | As a tester, I have completed mobile QA for RTL and BN/HI | P0 | 12 | Both | iOS and Android tested; touch targets adequate; fonts render |
| P2-S16-008 | As a developer, I have fallback to English when translation is missing | P1 | 8 | Team Lead | Missing keys fall back gracefully; no blank UI elements |

**Sprint 16 Definition of Done:**
- [ ] All AR/BN/HI translations imported and verified
- [ ] RTL layout passes QA
- [ ] Accessibility verified in Arabic
- [ ] Cross-browser and mobile QA complete
- [ ] SEO locale tags correct
- [ ] Demo to TwinMOS: tri-lingual site walkthrough

---

## Sprint 17: Stabilization, UAT & Phase 2 Launch (Weeks 35–36)

**Sprint Goal:** Phase 2 DR drill, penetration test, UAT, launch, and retro complete.

**Capacity:** 160 hours

| ID | User Story / Task | Priority | Effort (h) | Owner | Acceptance Criteria |
|----|-------------------|----------|------------|-------|---------------------|
| P2-S17-001 | As a team, we have completed Phase 2 DR drill with RTO verification | P0 | 16 | Team Lead | DR drill executed; RTO <= 4h confirmed; documentation updated |
| P2-S17-002 | As a team, we have completed third-party penetration test (delta from Phase 1) | P0 | 24 | TwinMOS PM | Pen-test vendor engaged; scope defined; test executed |
| P2-S17-003 | As a developer, I have remediated all penetration test findings | P0 | 24 | Senior Dev | All findings closed or risk-accepted; evidence documented |
| P2-S17-004 | As a stakeholder, I have completed UAT for Phase 2 features | P0 | 24 | TwinMOS PM + Both | UAT scripts executed; bugs fixed; sign-off obtained |
| P2-S17-005 | As a team, we have executed Phase 2 launch (multi-language go-live) | P0 | 12 | Both | /ar/, /bn/, /hi/ routes live; partner portal active; redirects correct |
| P2-S17-006 | As a team, we monitor daily metrics for first 14 days post-launch | P0 | 16 | Both | Daily reviews documented; anomalies addressed; metrics stable |
| P2-S17-007 | As a team, we conduct Phase 2 retrospective | P0 | 4 | TwinMOS PM | Retro document saved; action items logged; lessons captured |
| P2-S17-008 | As a team, we lock Phase 3 sprint plan and backlog | P0 | 8 | Both + PM | Phase 3 backlog groomed; Sprint 18 planned; dependencies confirmed |
| P2-S17-009 | As a team, we have Phase Gate Review signed for Phase 2 | P0 | 4 | TwinMOS PM | Phase Gate Review Template complete; sponsor sign-off |
| P2-S17-010 | As a team, we update all runbooks for Phase 2 features | P1 | 8 | Team Lead | Partner portal, RMA, live chat, anti-counterfeit runbooks added |

**Sprint 17 Definition of Done:**
- [ ] DR drill passed
- [ ] Pen-test findings remediated
- [ ] UAT signed off
- [ ] Phase 2 launched
- [ ] 14-day monitoring complete
- [ ] Phase 2 retro complete
- [ ] Phase 3 plan locked
- [ ] Phase Gate Review signed
- [ ] Demo to TwinMOS: Phase 2 launch metrics + Phase 3 preview

---

## Sprint Metrics Summary

| Sprint | Planned Points | Velocity | Burndown | Demo Date |
|--------|---------------|----------|----------|-----------|
| Sprint 10 | 160h | TBD | TBD | Week 22 |
| Sprint 11 | 160h | TBD | TBD | Week 24 |
| Sprint 12 | 160h | TBD | TBD | Week 26 |
| Sprint 13 | 160h | TBD | TBD | Week 28 |
| Sprint 14 | 160h | TBD | TBD | Week 30 |
| Sprint 15 | 160h | TBD | TBD | Week 32 |
| Sprint 16 | 160h | TBD | TBD | Week 34 |
| Sprint 17 | 160h | TBD | TBD | Week 36 (Phase 2 Launch) |

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
- [ ] Translation strings reviewed by native speaker (where applicable)

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 1 May 2026 | TwinMOS Digital Transformation Team | Initial backlog |

**Next Review:** At Sprint 10 close (Week 22) and at each sprint boundary

**Related Documents:**
- TwinMOSWebsiteProjectPlanPhases_1-3.md
- TwinMOSWebsiteSprintBacklogPhase_1.md
- TwinMOSWebsiteSprintBacklogPhase_3.md
- TwinMOSWebsiteMilestone_Schedule.md
- TwinMOSWebsiteStatusReportTemplate.md

---

*This Sprint Backlog is a living document. Changes require sprint planning meeting agreement and must be logged in the Decision Log.*
