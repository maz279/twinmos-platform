# TwinMOS Corporate Website — User Acceptance Test (UAT) Plan

**Document Reference:** TWN-QA-UAT-2026-001  
**Document Version:** 1.0  
**Status:** FINAL  
**Date:** 1 May 2026  
**Owner:** QA Lead  
**Priority:** P2  
**Synchronized With:** BRD §32.2, Tech Stack §21.3, Implementation Strategy §12

---

## 1. Purpose

This document defines the User Acceptance Testing (UAT) strategy for the TwinMOS corporate website. UAT validates that the system meets business requirements from the perspective of real users and stakeholders before each phase launch.

---

## 2. UAT Cycles

### 2.1 Phase 1 UAT Schedule (Tech Stack §21.3)

| UAT Round | Audience | Window | Sign-Off Required | Week |
|-----------|----------|--------|-------------------|------|
| **Alpha UAT** | Tech Lead + Dev B | 1 week | Tech Lead | 17 |
| **Beta UAT** | Marketing + Sales + Product Directors | 1 week | Marketing Director, Sales Director | 18 |
| **Stakeholder UAT** | Chairman + GM Dubai | 3 days | Chairman (or delegate) | 19 |
| **Soft Launch** | TwinMOS staff + key distributors (Smart Tech BD, Achiever) | 1 week | Project Manager | 19–20 |
| **Public Launch** | Full traffic | — | — | 20 |

### 2.2 Phase 2 & 3 UAT Schedule

| Phase | Alpha | Beta | Stakeholder | Soft Launch |
|-------|-------|------|-------------|-------------|
| Phase 2 | Month 8, Week 1 | Month 8, Week 2 | Month 9, 3 days | Month 9, 1 week |
| Phase 3 | Month 14, Week 1 | Month 14, Week 2 | Month 15, 3 days | Month 15, 1 week |

---

## 3. UAT Participants

### 3.1 Participant Roles & Responsibilities

| Role | Name | UAT Rounds | Responsibility |
|------|------|------------|---------------|
| QA Lead | (TBC) | All | Facilitate, track defects, report |
| Unisoft Team Lead | (TBC) | Alpha, Beta | Technical support, defect triage |
| Unisoft Senior Developer | (TBC) | Alpha, Beta | Backend support, data fixes |
| TwinMOS Marketing Director | (TBC) | Beta, Stakeholder | Content accuracy, brand alignment |
| TwinMOS Sales Director | (TBC) | Beta, Stakeholder | Lead flow, distributor experience |
| TwinMOS IT/Technical Lead | (TBC) | Alpha, Stakeholder | Infrastructure, security review |
| TwinMOS Chairman | Mohd Mazharul Islam | Stakeholder | Final go/no-go |
| TwinMOS GM Dubai | Robiul Islam | Stakeholder | Operational approval |
| Key Distributors | Smart Tech BD, Achiever | Soft Launch | Partner portal, pricing |

### 3.2 UAT Environment Access

| Round | Environment | Data |
|-------|-------------|------|
| Alpha | Staging | Synthetic / seeded |
| Beta | Staging | Representative real content |
| Stakeholder | Staging | Production-like |
| Soft Launch | Production (limited DNS) | Real |

---

## 4. UAT Scope by Round

### 4.1 Alpha UAT (Internal Technical)

**Focus:** Functional correctness, data integrity, integration health.

| Area | Checklist |
|------|-----------|
| All 287 content pages render without 404/500 | ✅ |
| All 100+ SKU pages display correct specs | ✅ |
| All 15 form types submit successfully | ✅ |
| All API endpoints return expected data | ✅ |
| Search (MeiliSearch) returns relevant results | ✅ |
| CMS admin functions (CRUD) work correctly | ✅ |
| i18n routing (/en/, /ar/, etc.) resolves | ✅ |
| SEO meta tags and structured data validate | ✅ |
| Analytics events fire correctly | ✅ |
| Email auto-routing triggers | ✅ |

### 4.2 Beta UAT (Business Validation)

**Focus:** Business requirements, content accuracy, user experience.

| Area | Checklist |
|------|-----------|
| Product catalog matches current portfolio | ✅ |
| Pricing and specifications are accurate | ✅ |
| Distributor list is current and complete | ✅ |
| Legal pages reflect latest policies | ✅ |
| News/events content is accurate | ✅ |
| Lead routing reaches correct departments | ✅ |
| Brand voice and tone are consistent | ✅ |
| Images meet quality standards | ✅ |
| Mobile experience is satisfactory | ✅ |
| Cookie consent flows meet legal requirements | ✅ |

### 4.3 Stakeholder UAT (Executive Approval)

**Focus:** Strategic alignment, brand positioning, go/no-go decision.

| Area | Checklist |
|------|-----------|
| Homepage hero conveys TwinMOS value proposition | ✅ |
| About page accurately represents company | ✅ |
| Dubai HQ is prominently and correctly displayed | ✅ |
| Competitor benchmark parity achieved | ✅ |
| Performance feels fast on real devices | ✅ |
| Accessibility is acceptable for public site | ✅ |
| Security indicators are visible (HTTPS, padlock) | ✅ |
| Overall impression matches TwinMOS brand standards | ✅ |

### 4.4 Soft Launch (Real-World Validation)

**Focus:** Production stability, real user feedback, hypercare readiness.

| Area | Checklist |
|------|-----------|
| Site handles real traffic without errors | ✅ |
| Forms receive real submissions | ✅ |
| Analytics capture real user behavior | ✅ |
| No critical defects reported by staff/distributors | ✅ |
| CDN and edge caching perform correctly | ✅ |
| Monitoring alerts are functional | ✅ |

---

## 5. UAT Process

### 5.1 Pre-UAT Checklist

- [ ] UAT environment provisioned and stable.
- [ ] Test data prepared and representative.
- [ ] UAT test scripts written and reviewed (see TwinMOSWebsiteUATTestScripts.md).
- [ ] Defect tracking system configured (GitHub Issues / Jira).
- [ ] Communication channels established (Slack, email).
- [ ] Participants invited with calendar invites.
- [ ] Sign-off forms prepared (see TwinMOSWebsiteUATSignOff_Form.md).

### 5.2 UAT Execution Flow

```
Day 1:    Kickoff meeting (30 min) -> Environment walkthrough -> Independent testing
Day 2–4:  Independent testing + Slack Q&A
Day 5:    Defect review meeting -> Priority assignment -> Fix planning
Day 6–7:  Defect fixes -> Re-test -> Sign-off
```

### 5.3 Defect Handling During UAT

| Severity | Action | SLA |
|----------|--------|-----|
| S1 — Critical | Stop UAT, fix immediately, re-test | 4 h |
| S2 — High | Log, fix within UAT window, re-test | 24 h |
| S3 — Medium | Log, fix post-UAT if time permits | 72 h |
| S4 — Low | Log, backlog for next sprint | Next release |

---

## 6. Acceptance Criteria

### 6.1 Per-Feature Acceptance Criteria (BRD §32.1)

Every feature must meet the following before UAT sign-off:

1. **Functional:** Meets all acceptance criteria in the user story.
2. **Design:** Matches approved Figma/Adobe XD designs (pixel-perfect +/- 5%).
3. **Responsive:** Works correctly on mobile, tablet, and desktop breakpoints.
4. **Performance:** Meets performance targets defined in BRD §20.
5. **Accessibility:** Passes automated a11y tests (axe-core) and manual screen reader test.
6. **SEO:** Has unique meta title, description, canonical URL, and structured data where applicable.
7. **Security:** Passes OWASP ZAP scan with no high/critical findings.
8. **Cross-Browser:** Works on Chrome, Firefox, Safari, Edge (latest 2 versions).
9. **Content:** Populated with accurate, reviewed content.
10. **Analytics:** Tracking events implemented and verified in GA4 debug mode.

### 6.2 Go/No-Go Criteria

| Criterion | Threshold | Authority |
|-----------|-----------|-----------|
| Zero S1 defects | Must pass | QA Lead |
| S2 defects <= 3 | Must pass | QA Lead |
| UAT pass rate >= 95% | Must pass | QA Lead |
| Stakeholder satisfaction >= 4/5 | Must pass | Chairman |
| Performance targets met | Must pass | IT Lead |
| Security scan clean | Must pass | IT Lead |
| Content accuracy confirmed | Must pass | Marketing Director |

---

## 7. UAT Artifacts

| Artifact | Owner | Location |
|----------|-------|----------|
| UAT Test Scripts | QA Lead | TwinMOSWebsiteUATTestScripts.md |
| UAT Sign-Off Form | QA Lead | TwinMOSWebsiteUATSignOff_Form.md |
| Defect Log | QA Lead | GitHub Issues / Jira |
| UAT Report | QA Lead | Shared drive + email |
| Stakeholder Feedback | QA Lead | Shared drive |

---

## 8. Document Governance

| Role | Name | Sign-Off | Date |
|------|------|----------|------|
| QA Lead | (TBC) | _______________ | _________ |
| TwinMOS Marketing Director | (TBC) | _______________ | _________ |
| TwinMOS Chairman | Mohd Mazharul Islam | _______________ | _________ |

---

**Document Version:** 1.0  
**Issued:** 1 May 2026  
**Canonical Location:** `G - Quality Assurance and Testing/TwinMOSWebsiteUAT_Plan.md`
