# TwinMOS Corporate Website Redevelopment — Project Charter

**Document Reference:** TWN-PM-CHARTER-2026-001  
**Version:** 1.0  
**Date:** 1 May 2026  
**Classification:** CONFIDENTIAL — Internal Use Only  
**Prepared by:** TwinMOS Digital Transformation Team  
**Approved by:** Mohd Mazharul Islam, Chairman & Managing Director  

---

## 1. Project Overview

### 1.1 Project Title
TwinMOS Corporate Website Redevelopment — Phases 1–3 (Core Website, Localization & Partner Enablement, Commerce & Advanced Features)

### 1.2 Project Description
This project delivers a complete rebuild of the TwinMOS corporate website (twinmos.com) to replace the current functionally broken, content-deficient, and strategically counterproductive digital presence with a modern, enterprise-grade, multi-language, performance-optimized website that supports TwinMOS's global expansion objectives across 93+ countries.

### 1.3 Business Case
The current TwinMOS website (as documented in the Forensic Audit v1.0) suffers from:
- **51 critical issues** across technical infrastructure, UX/UI, content, SEO, and strategic dimensions
- **Zero competitive feature parity** against Kingston, Corsair, ADATA, Crucial, and TEAMGROUP
- **Active brand credibility damage** — factual errors (Taipei HQ misstated), broken pages, missing legal compliance
- **100% lead generation failure** — no forms, no CTAs, no analytics, no conversion paths
- **Complete e-commerce absence** — no direct sales, no "Where to Buy" locator, no distributor showcase

The rebuilt website will establish TwinMOS as a tier-1 memory and SSD manufacturer with digital presence matching or exceeding all major competitors.

### 1.4 Strategic Alignment

| Strategic Objective | How This Project Delivers |
|---------------------|--------------------------|
| Support Supertron India partnership launch | India-specific microsite, INR pricing, BIS certification badges |
| Expand into Africa, CIS, and Southeast Asia | 28 regional landing pages, multi-language support (9 locales) |
| Establish B2B enterprise credibility | Solutions hub, case studies, OEM/ODM program pages, partner portal |
| Build gaming community engagement | VOLTX Gaming Hub with RGB showcase, build gallery, esports content |
| Drive direct revenue growth | Phase 3 e-commerce with Stripe Checkout, multi-currency support |
| Attract global talent | Careers hub with job listings, benefits, application workflow |
| Ensure regulatory compliance | 34 legal pages covering GDPR, UAE PDPL, India DPDP, KSA PDPL, WCAG 2.1 AA |

---

## 2. Project Objectives

### 2.1 Primary Objectives

1. **Launch a fully functional, enterprise-quality corporate website** (Phase 1, Month 5) with all 16 content sections, 287 content pages, 100+ SKU detail pages, 28 regional pages, and 34 legal pages in English
2. **Enable multi-language operations** (Phase 2, Month 9) with Arabic (RTL), Bengali, and Hindi translations, full partner portal activation, RMA workflow, anti-counterfeit SN-check, and live chat
3. **Launch e-commerce and advanced features** (Phase 3, Month 15) with Medusa.js + Stripe Checkout, Russian/Chinese/French translations, loyalty/referral programs, and marketing automation

### 2.2 Success Criteria (KPIs)

| KPI | Baseline (Current) | Phase 1 Target | Phase 2 Target | Phase 3 Target |
|-----|-------------------|----------------|----------------|----------------|
| Lighthouse Performance Score | N/A (site broken) | >= 90 | >= 92 | >= 95 |
| Lighthouse Accessibility Score | N/A | >= 95 | >= 95 | >= 95 |
| Page Load (LCP) | N/A | <= 2.0s | <= 1.8s | <= 1.5s |
| Uptime | Intermittent | >= 99.9% | >= 99.9% | >= 99.95% |
| Organic Traffic (monthly) | Minimal | +200% | +500% | +1000% |
| Lead Capture (monthly) | 0 | 50+ inquiries | 100+ inquiries | 200+ inquiries |
| Distributor Applications | 0 | 10+ / month | 20+ / month | 30+ / month |
| Warranty Registrations | 0 | 100+ / month | 250+ / month | 500+ / month |
| E-commerce Revenue | $0 | N/A | N/A | $50K+ / month |
| WCAG Compliance | None | 2.1 AA | 2.1 AA | 2.1 AA + EN 301 549 |

---

## 3. Project Scope

### 3.1 In-Scope (Phases 1–3)

**Phase 1 — Core Website (Months 1–5):**
- Complete website rebuild on Strapi v5 + Astro 5 stack
- 16 top-level content sections with 287 content entries
- 100+ SKU detail pages with specifications, galleries, datasheets
- 28 regional landing pages (English content)
- 34 legal/compliance pages
- Product catalog with dual-axis navigation (category x brand)
- Compatibility Finder MVP (top 100 motherboards)
- Where-to-Buy Locator with Leaflet + OpenStreetMap
- 15 form types (contact, quote, distributor, warranty, RMA, newsletter, etc.)
- Knowledge Base with 30+ articles
- Gaming Hub static pages
- Full SEO foundation (Schema.org, hreflang, XML sitemap)
- WCAG 2.1 AA accessibility compliance
- Cookie consent management (GDPR/UAE/India/KSA compliant)
- CMS training for TwinMOS Marketing team

**Phase 2 — Localization & Partner Enablement (Months 6–9):**
- Arabic (RTL), Bengali, Hindi translations
- Partner Portal with Better Auth (asset library, watermarked price lists)
- Full RMA workflow (7-state machine)
- Anti-counterfeit serial-number check
- Live chat (Chatwoot self-hosted)
- Compatibility Finder full algorithm (500 motherboards)
- Gaming Hub interactive features (RGB visualizer, build gallery)
- ERP integration (read-only product master sync)

**Phase 3 — Commerce & Advanced Features (Months 10–15):**
- E-commerce MVP (Medusa.js + Stripe Checkout)
- Russian, Chinese (Simplified), French translations
- Customer accounts and order management
- Multi-currency (AED, INR, BDT, SAR, USD, EUR, RUB)
- Marketing automation (cross-sell, exit-intent, abandoned cart)
- Loyalty and referral programs
- MDF (Marketing Development Funds) program
- Advanced analytics (PostHog OSS)

### 3.2 Out-of-Scope (Phase 4+ / Separate Engagements)

- Spanish, Portuguese, German translations
- Continuous SEO/CRO retainer
- Investor Relations activation
- AI-driven product recommendations
- Advanced loyalty mechanics
- Mobile native apps

### 3.3 Key Deliverables

| Deliverable | Phase | Owner |
|-------------|-------|-------|
| Design System + Figma files | 1 | Unisoft Team Lead |
| Strapi CMS backend (production-ready) | 1 | Unisoft Senior Developer |
| Astro frontend (production-ready) | 1 | Unisoft Team Lead |
| Content migration (287 entries) | 1 | TwinMOS Marketing + Unisoft |
| QA test suite (Playwright + Vitest) | 1 | Both developers |
| CMS Training materials + session | 1 | Unisoft Senior Developer |
| Deployment + incident response runbooks | 1 | Unisoft Team Lead |
| Arabic/Bengali/Hindi translations | 2 | Translation vendor + TwinMOS |
| Partner Portal (full activation) | 2 | Unisoft Senior Developer |
| RMA + Anti-counterfeit workflows | 2 | Unisoft Senior Developer |
| E-commerce storefront | 3 | Both developers |
| Russian/Chinese/French translations | 3 | Translation vendor + TwinMOS |
| Phase 4 handoff package | 3 | Both developers |

---

## 4. Project Organization

### 4.1 Project Governance Structure

```
                    ┌─────────────────────────────┐
                    │   Project Sponsor           │
                    │   Mohd Mazharul Islam       │
                    │   (Chairman & MD)           │
                    └─────────────┬───────────────┘
                                  │
                    ┌─────────────▼───────────────┐
                    │   Operational Sponsor       │
                    │   Robiul Islam              │
                    │   (GM, Dubai HQ)            │
                    └─────────────┬───────────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
┌───────▼────────┐      ┌────────▼────────┐      ┌────────▼────────┐
│  TwinMOS PM    │      │  Unisoft Team   │      │  TwinMOS Legal  │
│  (TBC)         │◄────►│  Lead (TBC)     │      │  Counsel (TBC)  │
└───────┬────────┘      └────────┬────────┘      └─────────────────┘
        │                        │
        │         ┌──────────────▼──────────────┐
        │         │  Unisoft Senior Developer   │
        │         │  (TBC)                      │
        │         └─────────────────────────────┘
        │
┌───────▼──────────────────────────────────────────────┐
│  TwinMOS Stakeholders:                               │
│  - Marketing Director                                │
│  - IT/Technical Lead                                 │
│  - Product Manager                                   │
│  - Sales Director                                    │
│  - HR Director                                       │
│  - Legal/Compliance Officer                          │
└──────────────────────────────────────────────────────┘
```

### 4.2 Roles and Responsibilities

| Role | Name / Assignment | Key Responsibilities |
|------|-------------------|---------------------|
| **Project Sponsor** | Mohd Mazharul Islam | Strategic decisions, budget approval, escalation resolution, final sign-off at phase gates |
| **Operational Sponsor** | Robiul Islam | Day-to-day oversight, stakeholder coordination, vendor relationship, milestone approval |
| **Project Manager (TwinMOS)** | TBC / Marketing Director (interim) | Requirements clarification, content ownership, UAT coordination, status reporting |
| **Unisoft Team Lead** | TBC | Technical architecture, frontend development (Astro), DevOps, code review, team coordination |
| **Unisoft Senior Developer** | TBC | Backend development (Strapi), CMS configuration, integrations, database design |
| **TwinMOS Marketing Director** | TBC | Content strategy, brand consistency, SEO direction, campaign planning |
| **TwinMOS IT/Technical Lead** | TBC | Infrastructure oversight, security review, DNS/domain management, technical acceptance |
| **TwinMOS Product Manager** | TBC | SKU data, product specifications, compatibility data, datasheet accuracy |
| **TwinMOS Sales Director** | TBC | Distributor requirements, partner portal needs, CRM integration, pricing rules |
| **TwinMOS HR Director** | TBC | Careers content, job postings, applicant privacy compliance |
| **TwinMOS Legal/Compliance** | TBC | Legal page content, privacy policy, regulatory compliance, data protection |

---

## 5. Budget and Resources

### 5.1 Budget Summary

| Component | Phase 1 | Phase 2 | Phase 3 | Total |
|-----------|---------|---------|---------|-------|
| **Engineering (Unisoft)** | $105K–$201K | $30K–$60K | $40K–$80K | $175K–$341K |
| Infrastructure / SaaS / Hosting | ~$1,125–$1,500 | ~$1,920–$2,400 | ~$2,700–$3,450 | ~$5,745–$7,350 |
| AI Tooling (Copilot, Cursor) | ~$300 | ~$160 | ~$240 | ~$700 |
| Translation Vendors | — | ~$9K–$24K | ~$9K–$24K | ~$18K–$48K |
| Penetration Tests + Audits | ~$3K–$8K | ~$2K–$5K | ~$3K–$8K | ~$8K–$21K |
| BrowserStack / Testing Tools | ~$600 | ~$400 | ~$400 | ~$1,400 |
| Stock Imagery / Assets | ~$500–$1,500 | — | — | ~$500–$1,500 |
| **Total Non-Engineering** | **~$5,525–$11,700** | **~$13,480–$31,960** | **~$15,340–$36,090** | **~$34,345–$79,750** |
| **Grand Total (All-in)** | **~$110K–$213K** | **~$43K–$92K** | **~$55K–$116K** | **~$209K–$421K** |

### 5.2 Payment Schedule

| Milestone | Payment % | Estimated Amount | Target Date |
|-----------|-----------|-----------------|-------------|
| Contract Signing | 20% | $35K–$68K | 24 July 2026 |
| Design Approval | 20% | $35K–$68K | Week 7 (Sep 2026) |
| Beta Delivery | 20% | $35K–$68K | Week 14 (Nov 2026) |
| Public Launch (Phase 1) | 20% | $35K–$68K | Week 18 (Dec 2026) |
| Phase 1 Support Complete | 20% | $35K–$68K | Week 26 (Feb 2027) |

*Phases 2 and 3: Separate SOW amendments with equivalent milestone-based payment terms.*

### 5.3 Resource Allocation

| Resource | Count | Duration | Notes |
|----------|-------|----------|-------|
| Unisoft Team Lead (Full-Stack) | 1 | 15 months | Astro frontend lead, architecture, DevOps |
| Unisoft Senior Developer (Backend) | 1 | 15 months | Strapi backend, CMS, integrations |
| Unisoft Backup Developer | 1 (bench) | On-call | Vacation/illness coverage |
| TwinMOS PM / Marketing Lead | 1 | 15 months | Content ownership, requirements, UAT |
| TwinMOS Technical Liaison | 1 | Part-time | Infrastructure, security, DNS |
| Translation Vendor | 1–2 | Phase 2–3 | AR/BN/HI then RU/ZH/FR |
| Penetration Test Vendor | 1 | Per phase | CREST/OSCP-certified |

---

## 6. High-Level Timeline

| Phase | Duration | Start | End | Key Outcome |
|-------|----------|-------|-----|-------------|
| **Phase 1 — Core Website** | 5 months | July 2026 | December 2026 | Public launch, EN only, all 16 sections live |
| **Phase 2 — Localization & Partner** | 4 months | January 2027 | May 2027 | AR/BN/HI live, partner portal active |
| **Phase 3 — Commerce & Advanced** | 6 months | June 2027 | December 2027 | E-commerce live, RU/ZH/FR, loyalty programs |
| **Phase 4 — Ongoing Optimization** | Ongoing | January 2028+ | — | Retainer-based, ES/PT/DE, CRO/SEO |

**Critical Path:** Design Approval (Week 7) -> Beta Delivery (Week 14) -> UAT Complete (Week 16) -> Public Launch (Week 18)

---

## 7. Risk Summary (High-Level)

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Phase 1 effort at upper estimate (40 weeks); capacity strained | Medium | Medium | Markdown reuse + AI assistance; pre-mortem cuts defined |
| One developer absent >= 2 weeks | Medium | Medium | Daily commits, ADRs ensure continuity; backup dev identified |
| Marketing team content authoring lags developer pace | Medium | Medium | Front-load templates; CMS training Week 16; self-serve from launch |
| Translation vendor delivers late | Medium | Medium | Engage by Phase 1 Week 12; staged delivery; English fallback |
| Phase 3 e-commerce scope creep (PCI, fraud, tax) | Medium | High | Stripe Checkout shifts PCI burden; Medusa handles fraud; TaxJar for tax |
| Lighthouse score < 90 on certain pages | Low | Medium | Astro default 95+; Lighthouse CI enforces in pipeline |
| WCAG 2.1 AA findings discovered late | Low | High | axe-core in CI from Sprint 0; never deferred |

*Full Risk Register maintained separately in TwinMOSWebsiteRiskRegisterConsolidated.md*

---

## 8. Assumptions and Constraints

### 8.1 Key Assumptions

1. TwinMOS will provide all product data (SKUs, specifications, images, datasheets) within 2 weeks of Sprint 0 start
2. TwinMOS Marketing team will commit 10+ hours/week for content review and approval
3. TwinMOS IT will provide DNS access and domain management credentials within Week 1
4. Unisoft developers will have dedicated workstations with Linux, Docker, and required tooling by Week 0
5. Hetzner VPS provisioning and Coolify setup will complete within 3 days of kickoff
6. Third-party services (Resend, Cloudflare, Backblaze B2, Sentry) will be provisioned within Week 1
7. TwinMOS PM will provide 24-hour decision turnaround on blockers (contract precondition)

### 8.2 Constraints

1. **Budget ceiling:** Phase 1 engineering not to exceed $201K without sponsor approval
2. **Team size:** Maximum 2 full-time developers for Phases 1–3
3. **Technology stack:** Strapi v5 + Astro 5 (decision locked at kickoff)
4. **Hosting:** Self-hosted backend on Hetzner; frontend on Cloudflare Pages
5. **Compliance:** Must launch with GDPR, UAE PDPL, India DPDP, KSA PDPL coverage
6. **Accessibility:** WCAG 2.1 AA minimum; EN 301 549 for EU public sector
7. **Data residency:** EU/EEA data stored in Hetzner Falkenstein (DE)
8. **No crunch policy:** 40-hour work weeks; no weekend work; no shortcut decisions on quality

---

## 9. Project Authority and Decision Rights

| Decision Category | Decision Maker | Escalation Path |
|-------------------|---------------|-----------------|
| Budget > $10K change | Project Sponsor (Chairman) | Board approval if > $50K |
| Scope change (new epic) | Operational Sponsor (GM) + Unisoft Team Lead | Project Sponsor if > 2 sprints |
| Timeline shift > 2 weeks | Operational Sponsor | Project Sponsor |
| Technology stack change | Unisoft Team Lead + TwinMOS IT Lead | Operational Sponsor |
| Design direction | TwinMOS Marketing Director | Operational Sponsor |
| Content approval | TwinMOS Marketing Director | Operational Sponsor |
| Vendor selection (translation, pen-test) | Operational Sponsor | Project Sponsor |
| Release go/no-go | Operational Sponsor + Unisoft Team Lead | Project Sponsor |
| HR/careers content | TwinMOS HR Director | Operational Sponsor |
| Legal/compliance content | TwinMOS Legal Counsel | Project Sponsor |

---

## 10. Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Project Sponsor (Chairman) | Mohd Mazharul Islam | ____________ | ___________ |
| Operational Sponsor (GM Dubai) | Robiul Islam | ____________ | ___________ |
| TwinMOS Marketing Director | (TBC) | ____________ | ___________ |
| TwinMOS IT/Technical Lead | (TBC) | ____________ | ___________ |
| Unisoft Team Lead | (TBC) | ____________ | ___________ |
| Unisoft Senior Developer | (TBC) | ____________ | ___________ |

---

## 11. Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 1 May 2026 | TwinMOS Digital Transformation Team | Initial charter |

**Next Review:** Upon vendor selection and contract signing (target: 24 July 2026)

**Related Documents:**
- TwinMOS_Website_BRD.md v3.0
- TwinMOS_Website_RFP.md v3.0
- TwinMOS_Website_URD.md v3.0
- TwinMOS_Website_Implementation_Strategy.md v3.0
- TwinMOS_Website_Technology_Stack.md v1.1
- TwinMOS_Website_Forensic_Audit.md v1.0

---

*This Project Charter is a living document. Changes require written approval from the Project Sponsor and must be logged in the Decision Log.*
