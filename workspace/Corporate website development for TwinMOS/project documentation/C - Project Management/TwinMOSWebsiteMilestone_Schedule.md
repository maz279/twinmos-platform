# TwinMOS Corporate Website — Milestone Schedule

**Document Reference:** TWN-PM-MILESTONE-2026-001  
**Version:** 1.0  
**Date:** 1 May 2026  
**Classification:** CONFIDENTIAL — Internal Use Only  
**Prepared by:** TwinMOS Digital Transformation Team  
**Audience:** Project Sponsor, Operational Sponsor, TwinMOS PM, Unisoft Engineering Team

---

## 1. Milestone Overview

This document defines the key milestones for the TwinMOS corporate website redevelopment project across Phases 1–3. Each milestone represents a significant checkpoint with defined entry/exit criteria, required deliverables, and formal sign-off requirements.

**Total Duration:** 15 months (60 weeks)  
**Total Milestones:** 15 (5 per phase)  
**Milestone Types:** Design Approval, Beta Delivery, UAT Complete, Public Launch, Phase Complete

---

## 2. Phase 1 — Core Website Milestones (Months 1–5)

### Milestone P1-M1: Design Approval (Week 7)

| Attribute | Detail |
|-----------|--------|
| **Target Date** | 11 September 2026 |
| **Type** | Design / Creative Gate |
| **Owner** | Unisoft Team Lead |
| **Approver** | TwinMOS Marketing Director |

**Entry Criteria:**
- Figma design files created for all 16 content sections
- Design system documented (colors, typography, spacing, components)
- Mobile and desktop breakpoints defined
- Accessibility review complete (color contrast, focus states, touch targets)

**Exit Criteria / Deliverables:**
- [ ] Figma files signed off by Marketing Director
- [ ] Design system documented in `/docs/design-system/`
- [ ] Component library spec complete
- [ ] Responsive breakpoint strategy approved
- [ ] Accessibility review passed (WCAG 2.1 AA at design level)
- [ ] Design Approval Checklist signed

**Risks if Missed:**
- Development blocked pending design decisions
- Rework if designs change after development begins
- Schedule slip of 1–2 weeks

---

### Milestone P1-M2: Beta Delivery (Week 14)

| Attribute | Detail |
|-----------|--------|
| **Target Date** | 30 October 2026 |
| **Type** | Technical Gate |
| **Owner** | Unisoft Team Lead |
| **Approver** | TwinMOS IT Lead + Operational Sponsor |

**Entry Criteria:**
- All 287 content pages routed and styled
- All 100+ SKU detail pages functional
- All 15 form types operational
- Application surfaces (catalog, finder, locator) functional
- CMS admin ready for content management

**Exit Criteria / Deliverables:**
- [ ] All core features functional on staging environment
- [ ] CMS admin accessible and editable
- [ ] Content populated (minimum 80% of 287 entries)
- [ ] Internal QA complete (0 critical bugs, < 10 high bugs)
- [ ] Lighthouse scores >= 90 performance, >= 95 accessibility
- [ ] Beta Acceptance Checklist signed
- [ ] Deployment runbook complete

**Risks if Missed:**
- UAT delayed
- Launch date at risk
- Content authoring may not complete in time

---

### Milestone P1-M3: UAT Complete (Week 16)

| Attribute | Detail |
|-----------|--------|
| **Target Date** | 13 November 2026 |
| **Type** | Acceptance Gate |
| **Owner** | TwinMOS PM |
| **Approver** | Operational Sponsor |

**Entry Criteria:**
- Beta Delivery milestone achieved
- UAT test scripts prepared and shared
- TwinMOS stakeholders available for testing
- Staging environment stable

**Exit Criteria / Deliverables:**
- [ ] UAT test scripts executed by TwinMOS stakeholders
- [ ] All critical bugs resolved
- [ ] All high-priority bugs resolved or risk-accepted
- [ ] Stakeholder sign-off obtained
- [ ] Soft launch to limited audience successful
- [ ] UAT Sign-Off Form complete

**Risks if Missed:**
- Public launch delayed
- Unresolved issues discovered post-launch
- Stakeholder confidence eroded

---

### Milestone P1-M4: Public Launch (Week 18)

| Attribute | Detail |
|-----------|--------|
| **Target Date** | 27 November 2026 |
| **Type** | Launch Gate |
| **Owner** | Unisoft Team Lead |
| **Approver** | Operational Sponsor + Unisoft Team Lead |

**Entry Criteria:**
- UAT Complete milestone achieved
- Penetration test findings remediated
- Load test passed (5,000 concurrent users)
- DNS and SSL configured
- Monitoring and alerting active
- Rollback plan documented and tested

**Exit Criteria / Deliverables:**
- [ ] DNS cutover executed
- [ ] twinmos.com serves new site globally
- [ ] Monitoring alerts active (Sentry, UptimeRobot, Plausible)
- [ ] 24-hour smoke test passed
- [ ] Launch Checklist complete
- [ ] Go/No-Go decision documented
- [ ] Public Launch milestone signed

**Risks if Missed:**
- Brand damage from broken launch
- SEO impact from DNS issues
- Distributor/partner confidence affected

---

### Milestone P1-M5: Phase 1 Complete (Week 20)

| Attribute | Detail |
|-----------|--------|
| **Target Date** | 11 December 2026 |
| **Type** | Phase Gate |
| **Owner** | TwinMOS PM |
| **Approver** | Project Sponsor (Chairman) |

**Entry Criteria:**
- Public Launch milestone achieved
- 14-day hypercare period complete
- Critical post-launch bugs resolved
- CMS training delivered
- Runbooks complete and tested
- Phase 1 retro conducted

**Exit Criteria / Deliverables:**
- [ ] All Phase 1 deliverables accepted
- [ ] Documentation complete (runbooks, guides, ADRs)
- [ ] Budget reconciliation complete
- [ ] Risk register updated
- [ ] Phase 1 retro document saved
- [ ] Phase 2 plan locked and approved
- [ ] Phase Gate Review Template complete
- [ ] Sponsor sign-off obtained

**Risks if Missed:**
- Phase 2 start delayed
- Contract/payment milestones affected
- Team morale impacted

---

## 3. Phase 2 — Localization & Partner Enablement Milestones (Months 6–9)

### Milestone P2-M1: Partner Portal Ready (Week 22)

| Attribute | Detail |
|-----------|--------|
| **Target Date** | 8 January 2027 |
| **Type** | Technical Gate |
| **Owner** | Unisoft Senior Developer |
| **Approver** | TwinMOS Sales Director |

**Entry Criteria:**
- Phase 1 Complete milestone achieved
- Better Auth integrated with Strapi roles
- Partner registration workflow functional

**Exit Criteria / Deliverables:**
- [ ] Partner Portal auth functional (register, login, roles)
- [ ] Partner dashboard renders program-specific content
- [ ] Asset library lists downloadable files
- [ ] Price list module gated and watermarked
- [ ] Partner Portal Acceptance Checklist signed

---

### Milestone P2-M2: RMA & Anti-Counterfeit Live (Week 26)

| Attribute | Detail |
|-----------|--------|
| **Target Date** | 5 February 2027 |
| **Type** | Technical Gate |
| **Owner** | Unisoft Senior Developer |
| **Approver** | TwinMOS Product Manager + Operational Sponsor |

**Entry Criteria:**
- Partner Portal Ready milestone achieved
- Serial number database populated
- RMA workflow implemented

**Exit Criteria / Deliverables:**
- [ ] RMA submission and tracking functional
- [ ] Anti-counterfeit SN-check validates against database
- [ ] Email notifications at each RMA state change
- [ ] Manufacturing serial import pipeline tested
- [ ] RMA & Anti-Counterfeit Acceptance Checklist signed

---

### Milestone P2-M3: Localization Ready (Week 32)

| Attribute | Detail |
|-----------|--------|
| **Target Date** | 19 March 2027 |
| **Type** | Technical Gate |
| **Owner** | Unisoft Team Lead |
| **Approver** | TwinMOS Marketing Director |

**Entry Criteria:**
- RMA & Anti-Counterfeit Live milestone achieved
- AR / BN / HI translations imported
- RTL framework verified

**Exit Criteria / Deliverables:**
- [ ] All AR / BN / HI translations imported and verified
- [ ] RTL layout passes QA across all pages
- [ ] Accessibility verified in Arabic (NVDA/VoiceOver)
- [ ] Cross-browser QA complete for all 3 locales
- [ ] SEO locale tags (hreflang, sitemap) correct
- [ ] Localization Acceptance Checklist signed

---

### Milestone P2-M4: Phase 2 Launch (Week 34)

| Attribute | Detail |
|-----------|--------|
| **Target Date** | 2 April 2027 |
| **Type** | Launch Gate |
| **Owner** | Unisoft Team Lead |
| **Approver** | Operational Sponsor |

**Entry Criteria:**
- Localization Ready milestone achieved
- Penetration test (delta) findings remediated
- UAT complete for Phase 2 features
- DR drill passed

**Exit Criteria / Deliverables:**
- [ ] /ar/, /bn/, /hi/ routes live
- [ ] Partner Portal active
- [ ] Live chat operational
- [ ] RMA and anti-counterfeit functional
- [ ] 24-hour smoke test passed
- [ ] Launch Checklist complete
- [ ] Go/No-Go decision documented

---

### Milestone P2-M5: Phase 2 Complete (Week 36)

| Attribute | Detail |
|-----------|--------|
| **Target Date** | 16 April 2027 |
| **Type** | Phase Gate |
| **Owner** | TwinMOS PM |
| **Approver** | Project Sponsor (Chairman) |

**Entry Criteria:**
- Phase 2 Launch milestone achieved
- 14-day hypercare period complete
- Phase 2 retro conducted
- Phase 3 plan locked

**Exit Criteria / Deliverables:**
- [ ] All Phase 2 deliverables accepted
- [ ] Documentation updated for Phase 2 features
- [ ] Budget reconciliation complete
- [ ] Risk register updated
- [ ] Phase 2 retro document saved
- [ ] Phase 3 plan approved
- [ ] Phase Gate Review Template complete
- [ ] Sponsor sign-off obtained

---

## 4. Phase 3 — Commerce & Advanced Features Milestones (Months 10–15)

### Milestone P3-M1: E-Commerce MVP Ready (Week 42)

| Attribute | Detail |
|-----------|--------|
| **Target Date** | 28 May 2027 |
| **Type** | Technical Gate |
| **Owner** | Unisoft Team Lead |
| **Approver** | TwinMOS Sales Director + Operational Sponsor |

**Entry Criteria:**
- Phase 2 Complete milestone achieved
- E-commerce ADR approved
- Stripe/Medusa integration complete
- Product catalog extended with e-commerce fields

**Exit Criteria / Deliverables:**
- [ ] Cart, checkout, and payment functional
- [ ] Order management admin operational
- [ ] Customer accounts functional
- [ ] Multi-currency display correct
- [ ] Tax and shipping rules apply correctly
- [ ] E-Commerce MVP Acceptance Checklist signed

---

### Milestone P3-M2: Advanced Features Ready (Week 50)

| Attribute | Detail |
|-----------|--------|
| **Target Date** | 23 July 2027 |
| **Type** | Technical Gate |
| **Owner** | Unisoft Senior Developer |
| **Approver** | TwinMOS Marketing Director |

**Entry Criteria:**
- E-Commerce MVP Ready milestone achieved
- PostHog analytics operational
- Marketing automation configured
- Loyalty and referral programs implemented

**Exit Criteria / Deliverables:**
- [ ] PostHog session replay and funnels functional
- [ ] Marketing automation (cross-sell, exit-intent, abandoned cart) active
- [ ] Loyalty and referral programs operational
- [ ] MDF program workflow functional
- [ ] Advanced Features Acceptance Checklist signed

---

### Milestone P3-M3: All Locales Live (Week 52)

| Attribute | Detail |
|-----------|--------|
| **Target Date** | 6 August 2027 |
| **Type** | Technical Gate |
| **Owner** | Unisoft Team Lead |
| **Approver** | TwinMOS Marketing Director |

**Entry Criteria:**
- Advanced Features Ready milestone achieved
- RU / ZH / FR translations imported
- Native speaker review complete

**Exit Criteria / Deliverables:**
- [ ] All 6 locales (EN, AR, BN, HI, RU, ZH, FR) live
- [ ] CJK and Cyrillic rendering verified
- [ ] Cross-browser QA complete for all locales
- [ ] SEO hreflang and sitemap correct
- [ ] All Locales Acceptance Checklist signed

---

### Milestone P3-M4: Phase 3 Launch (Week 58)

| Attribute | Detail |
|-----------|--------|
| **Target Date** | 17 September 2027 |
| **Type** | Launch Gate |
| **Owner** | Unisoft Team Lead |
| **Approver** | Operational Sponsor + Project Sponsor |

**Entry Criteria:**
- All Locales Live milestone achieved
- E-commerce security QA complete
- Penetration test (e-commerce focused) findings remediated
- UAT complete for Phase 3
- DR drill passed

**Exit Criteria / Deliverables:**
- [ ] E-commerce live with Stripe processing
- [ ] All 6 locales active
- [ ] Advanced analytics and marketing automation active
- [ ] Loyalty and referral programs live
- [ ] 24-hour smoke test passed
- [ ] Launch Checklist complete
- [ ] Go/No-Go decision documented

---

### Milestone P3-M5: Engagement Closeout (Week 60)

| Attribute | Detail |
|-----------|--------|
| **Target Date** | 1 October 2027 |
| **Type** | Closeout Gate |
| **Owner** | TwinMOS PM |
| **Approver** | Project Sponsor (Chairman) |

**Entry Criteria:**
- Phase 3 Launch milestone achieved
- 14-day hypercare period complete
- Final retro conducted
- Handoff package delivered
- Knowledge transfer complete

**Exit Criteria / Deliverables:**
- [ ] All Phase 3 deliverables accepted
- [ ] Phase 4 handoff package complete (documentation, backlog, retainer scope)
- [ ] Final budget reconciliation
- [ ] Final risk register
- [ ] Lessons learned document
- [ ] Knowledge transfer sessions completed
- [ ] Engagement closeout report signed
- [ ] Phase Gate Review Template complete
- [ ] Sponsor sign-off obtained
- [ ] Team celebration conducted

---

## 5. Consolidated Milestone Timeline

```
2026
Jul Aug Sep Oct Nov Dec
|----|----|----|----|----|----|
     P1-M1    P1-M2 P1-M3 P1-M4  P1-M5
     Design   Beta  UAT   Launch Complete
     Approval Delivery

2027
Jan Feb Mar Apr May Jun Jul Aug Sep Oct
|----|----|----|----|----|----|----|----|----|----|
P2-M1   P2-M2     P2-M3 P2-M4  P2-M5
Portal  RMA+AC    Local Launch Complete
Ready   Live

               P3-M1    P3-M2  P3-M3 P3-M4  P3-M5
               E-com    Adv    All   Launch Closeout
               MVP      Feat   Locales
```

---

## 6. Milestone Dependencies

| Milestone | Depends On | Hard/Soft |
|-----------|-----------|-----------|
| P1-M2 Beta Delivery | P1-M1 Design Approval | Hard |
| P1-M3 UAT Complete | P1-M2 Beta Delivery | Hard |
| P1-M4 Public Launch | P1-M3 UAT Complete | Hard |
| P1-M5 Phase 1 Complete | P1-M4 Public Launch | Hard |
| P2-M1 Partner Portal Ready | P1-M5 Phase 1 Complete | Hard |
| P2-M2 RMA & Anti-Counterfeit | P2-M1 Partner Portal Ready | Hard |
| P2-M3 Localization Ready | P2-M2 RMA & Anti-Counterfeit | Hard |
| P2-M4 Phase 2 Launch | P2-M3 Localization Ready | Hard |
| P2-M5 Phase 2 Complete | P2-M4 Phase 2 Launch | Hard |
| P3-M1 E-Commerce MVP | P2-M5 Phase 2 Complete | Hard |
| P3-M2 Advanced Features | P3-M1 E-Commerce MVP | Hard |
| P3-M3 All Locales Live | P3-M2 Advanced Features | Hard |
| P3-M4 Phase 3 Launch | P3-M3 All Locales Live | Hard |
| P3-M5 Engagement Closeout | P3-M4 Phase 3 Launch | Hard |

---

## 7. Milestone Review Process

### 7.1 Pre-Milestone Review (1 week before)

- Milestone owner confirms all entry criteria are met
- Risk register reviewed for milestone-specific risks
- Stakeholder availability confirmed
- Demo environment prepared

### 7.2 Milestone Review Meeting

- **Duration:** 2 hours
- **Attendees:** Milestone owner, approver, TwinMOS PM, Unisoft Team Lead
- **Agenda:**
  1. Demo of milestone deliverables (30 min)
  2. Review of exit criteria checklist (30 min)
  3. Review of open issues and risks (30 min)
  4. Go/No-Go decision (15 min)
  5. Next steps and action items (15 min)

### 7.3 Post-Milestone Actions

- Milestone sign-off documented
- Decision Log updated
- Status Report updated
- Next phase planning initiated (if applicable)

---

## 8. Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 1 May 2026 | TwinMOS Digital Transformation Team | Initial schedule |

**Next Review:** Upon milestone achievement and at each phase boundary

**Related Documents:**
- TwinMOSWebsiteProject_Charter.md
- TwinMOSWebsiteProjectPlanPhases_1-3.md
- TwinMOSWebsitePhaseGateReview_Template.md
- TwinMOSWebsiteStatusReportTemplate.md

---

*This Milestone Schedule is a living document. Changes require approval from the Operational Sponsor and must be logged in the Decision Log.*
