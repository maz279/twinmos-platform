# TwinMOS Corporate Website — RACI Matrix

**Document Reference:** TWN-PM-RACI-2026-001  
**Version:** 1.0  
**Date:** 1 May 2026  
**Classification:** CONFIDENTIAL — Internal Use Only  
**Prepared by:** TwinMOS Digital Transformation Team  
**Audience:** All project stakeholders

---

## 1. RACI Legend

| Code | Meaning | Definition |
|------|---------|------------|
| **R** | Responsible | Does the work to complete the task |
| **A** | Accountable | Ultimately answerable for the task; has yes/no/veto authority |
| **C** | Consulted | Provides input; two-way communication |
| **I** | Informed | Kept updated on progress; one-way communication |

---

## 2. Project Governance RACI

| Activity | Project Sponsor | Operational Sponsor | TwinMOS PM | Unisoft Team Lead | Unisoft Senior Dev |
|----------|-----------------|---------------------|------------|-------------------|-------------------|
| Strategic direction & vision | A/R | C | C | I | I |
| Budget approval > $10K | A/R | C | I | I | I |
| Vendor selection (Unisoft) | A | R | C | I | I |
| Contract signing & SOW amendments | A | R | C | I | I |
| Phase gate go/no-go decisions | A | R | C | C | C |
| Escalation resolution | A | R | C | C | C |
| Monthly steering committee | A/R | R | R | I | I |
| Bi-weekly status meetings | I | A | R | R | I |
| Daily standups | I | I | C | A/R | R |
| Sprint planning | I | I | A/R | R | R |
| Sprint review / demo | I | C | A/R | R | R |
| Sprint retrospective | I | I | I | A/R | R |

---

## 3. Phase 1 — Core Website RACI

### 3.1 Foundation & Setup (Weeks 1–4)

| Activity | TwinMOS PM | Unisoft Team Lead | Unisoft Senior Dev | TwinMOS IT Lead | TwinMOS Marketing |
|----------|------------|-------------------|-------------------|-----------------|-------------------|
| Technology stack selection | C | A/R | C | C | I |
| GitHub repo provisioning | I | A/R | C | I | I |
| Hetzner VPS provisioning | I | A/R | C | C | I |
| Cloudflare Pages setup | I | A/R | C | C | I |
| SaaS account provisioning | I | C | A/R | I | I |
| Developer workstation setup | I | A/R | R | I | I |
| Docker Compose local stack | I | R | A/R | I | I |
| ADR documentation | I | A/R | C | I | I |
| CI/CD pipeline setup | I | A/R | C | I | I |
| Content Map phase flagging | A/R | C | I | I | C |
| Backup developer identification | I | A/R | I | I | I |

### 3.2 Content Modeling (Weeks 3–4)

| Activity | TwinMOS PM | Unisoft Team Lead | Unisoft Senior Dev | TwinMOS Marketing | TwinMOS Product |
|----------|------------|-------------------|-------------------|-------------------|-----------------|
| Strapi collections modeling | C | C | A/R | C | C |
| Astro Content Collections schema | I | A/R | C | I | I |
| Migration script development | I | A/R | C | I | I |
| Page-template prototypes | I | A/R | C | C | I |
| Tailwind + design tokens | I | A/R | I | C | I |
| Site-wide components | I | A/R | R | C | I |
| First demo to TwinMOS | A | R | R | C | I |

### 3.3 Content Production (Weeks 5–8)

| Activity | TwinMOS PM | Unisoft Team Lead | Unisoft Senior Dev | TwinMOS Marketing | TwinMOS Product |
|----------|------------|-------------------|-------------------|-------------------|-----------------|
| About pages | I | A/R | I | C | I |
| Gaming Hub pages | I | A/R | I | C | I |
| Technology / R&D pages | I | A/R | I | C | C |
| Learn Hub pages | I | A/R | I | C | I |
| Solutions pages | I | A/R | I | C | C |
| Marketing pages | I | A/R | I | A/R | I |
| Careers pages | I | A/R | I | C | I |
| Contact pages | I | A/R | R | C | I |
| News & Events pages | I | C | A/R | C | I |
| Regional landing pages | I | A/R | I | C | I |
| Brand pages | I | A/R | I | C | I |
| SKU detail pages | C | I | A/R | I | C |
| Legal & Compliance pages | I | A/R | I | C | C |
| Content accuracy review | A | I | I | R | C |

### 3.4 Application Surfaces (Weeks 9–12)

| Activity | TwinMOS PM | Unisoft Team Lead | Unisoft Senior Dev | TwinMOS Sales | TwinMOS Product |
|----------|------------|-------------------|-------------------|---------------|-----------------|
| Product catalog & navigation | I | A/R | C | C | C |
| Filtering & sorting | I | C | A/R | C | C |
| Product detail pages | I | A/R | C | I | C |
| Product comparison | I | A/R | I | I | I |
| Where-to-Buy Locator | I | C | A/R | C | I |
| Contact forms (all types) | C | I | A/R | C | I |
| Newsletter signup | I | I | A/R | I | I |
| Warranty Registration | C | I | A/R | I | C |
| Compatibility Finder MVP | I | C | A/R | I | C |
| Knowledge Base | I | C | A/R | I | I |
| Partner Portal skeleton | I | C | A/R | C | I |

### 3.5 Quality Gates (Weeks 13–16)

| Activity | TwinMOS PM | Unisoft Team Lead | Unisoft Senior Dev | TwinMOS IT | External Vendor |
|----------|------------|-------------------|-------------------|------------|-----------------|
| Performance optimization | I | A/R | R | C | I |
| Accessibility audit | I | R | A/R | C | I |
| Security audit (ZAP scan) | I | C | A/R | C | I |
| Cross-browser QA | I | A/R | R | I | I |
| Mobile device QA | I | A/R | R | I | I |
| Third-party penetration test | A | C | C | C | R |
| Pen-test findings remediation | I | C | A/R | C | C |

### 3.6 Launch (Weeks 17–20)

| Activity | TwinMOS PM | Unisoft Team Lead | Unisoft Senior Dev | TwinMOS IT | TwinMOS Marketing |
|----------|------------|-------------------|-------------------|------------|-------------------|
| CMS training delivery | A | I | R | I | C |
| Runbook completion | I | A/R | C | C | I |
| DR drill execution | I | A/R | C | C | I |
| Load testing | I | C | A/R | C | I |
| UAT coordination | A/R | R | R | C | C |
| Soft launch | I | A/R | R | C | I |
| DNS cutover | I | A/R | C | C | I |
| Public launch | I | A/R | R | C | I |
| Post-launch monitoring | I | A/R | R | I | I |
| Phase 1 retro | A/R | R | R | I | I |

---

## 4. Phase 2 — Localization & Partner Enablement RACI

| Activity | TwinMOS PM | Unisoft Team Lead | Unisoft Senior Dev | TwinMOS Sales | Translation Vendor |
|----------|------------|-------------------|-------------------|---------------|-------------------|
| Translation vendor engagement | A/R | I | I | I | C |
| Partner Portal auth (Better Auth) | I | C | A/R | C | I |
| Distributor program pages | I | C | A/R | C | I |
| Partner asset library | I | C | A/R | C | I |
| Watermarked price lists | I | C | A/R | C | I |
| Anti-counterfeit SN-check | I | C | A/R | C | I |
| RMA full workflow | C | C | A/R | C | I |
| Compatibility Finder full | I | C | A/R | C | C |
| ERP integration | C | C | A/R | C | I |
| Firmware Download Center | I | C | A/R | I | I |
| Live chat (Chatwoot) | I | C | A/R | C | I |
| Gaming interactive features | I | A/R | C | I | I |
| AR / BN / HI translations | C | A/R | C | I | R |
| RTL layout verification | I | A/R | R | I | C |
| Phase 2 UAT | A/R | R | R | C | I |
| Phase 2 launch | I | A/R | R | C | I |

---

## 5. Phase 3 — Commerce & Advanced Features RACI

| Activity | TwinMOS PM | Unisoft Team Lead | Unisoft Senior Dev | TwinMOS Sales | TwinMOS Marketing |
|----------|------------|-------------------|-------------------|---------------|-------------------|
| E-commerce stack ADR | C | A/R | C | C | I |
| E-commerce schema modeling | I | C | A/R | C | I |
| Stripe integration | I | C | A/R | C | I |
| Cart & checkout UI | I | A/R | C | I | I |
| Customer accounts | I | C | A/R | I | I |
| Multi-currency | I | A/R | C | I | I |
| Tax & shipping rules | I | C | A/R | C | I |
| RU / ZH / FR translations | C | A/R | C | I | R |
| PostHog analytics | I | C | A/R | I | C |
| Marketing automation | I | A/R | C | I | A/R |
| Loyalty program | I | C | A/R | I | C |
| Referral program | I | C | A/R | I | C |
| MDF program | C | C | A/R | A/R | I |
| Executive dashboards | I | A/R | C | I | C |
| Phase 3 UAT | A/R | R | R | C | C |
| Phase 3 launch | I | A/R | R | C | I |
| Engagement closeout | A/R | R | R | I | I |

---

## 6. Cross-Cutting Activities RACI

| Activity | Project Sponsor | Operational Sponsor | TwinMOS PM | Unisoft Team Lead | Unisoft Senior Dev | TwinMOS IT | TwinMOS Marketing | TwinMOS Sales | TwinMOS Legal |
|----------|-----------------|---------------------|------------|-------------------|-------------------|------------|-------------------|---------------|---------------|
| Architecture decisions | I | C | C | A/R | C | C | I | I | I |
| Technology stack changes | A | C | C | R | C | C | I | I | I |
| Security policy | I | C | C | C | A/R | C | I | I | C |
| Data protection / GDPR | I | C | C | C | A/R | C | I | I | A/R |
| Accessibility compliance | I | C | C | R | A/R | I | C | I | I |
| SEO strategy | I | I | C | C | I | I | A/R | I | I |
| Content approval | I | C | A/R | I | I | I | R | I | C |
| Legal page content | I | C | C | I | I | I | C | I | A/R |
| Budget tracking | I | A/R | R | C | I | I | I | I | I |
| Risk management | C | A/R | R | C | C | I | I | I | I |
| Issue resolution | I | C | A/R | R | R | C | I | I | I |
| Change request review | A | C | R | C | C | I | I | I | I |
| Status reporting | I | A/R | R | C | I | I | I | I | I |
| Stakeholder communication | I | A/R | R | C | I | I | I | I | I |
| Team performance review | I | A | C | R | R | I | I | I | I |

---

## 7. Decision Authority Matrix

| Decision Type | Accountable | Consulted | Informed |
|---------------|-------------|-----------|----------|
| Budget > $10K change | Project Sponsor | Operational Sponsor, TwinMOS PM | All |
| Scope change (new epic) | Operational Sponsor | Unisoft Team Lead, TwinMOS PM | All |
| Timeline shift > 2 weeks | Operational Sponsor | TwinMOS PM, Unisoft Team Lead | All |
| Technology stack change | Unisoft Team Lead + TwinMOS IT | Operational Sponsor | All |
| Design direction | TwinMOS Marketing Director | Unisoft Team Lead | All |
| Content approval | TwinMOS Marketing Director | TwinMOS PM, TwinMOS Legal | All |
| Vendor selection | Operational Sponsor | TwinMOS PM, TwinMOS IT | All |
| Release go/no-go | Operational Sponsor + Unisoft Team Lead | TwinMOS PM | All |
| HR/careers content | TwinMOS HR Director | TwinMOS Marketing | All |
| Legal/compliance content | TwinMOS Legal Counsel | TwinMOS Marketing | All |
| Hiring/firing team members | Operational Sponsor | Project Sponsor | All |
| Contract termination | Project Sponsor | Operational Sponsor, Legal | All |

---

## 8. RACI Exceptions and Overrides

### 8.1 Emergency Overrides

In case of critical production incidents:
- **Unisoft Team Lead** has authority to execute emergency fixes without full RACI consultation
- Must inform TwinMOS PM and Operational Sponsor within 2 hours
- Post-incident review required within 48 hours

### 8.2 Vacation Coverage

When a stakeholder with "A" or "R" is unavailable:
- TwinMOS PM delegates to Marketing Director (for content decisions)
- Unisoft Team Lead covers for Senior Developer
- Operational Sponsor covers for Project Sponsor on tactical decisions

### 8.3 Dispute Resolution

If RACI conflicts arise:
1. Discuss at daily standup or bi-weekly status meeting
2. Escalate to Operational Sponsor if unresolved within 24 hours
3. Escalate to Project Sponsor if unresolved within 48 hours

---

## 9. Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 1 May 2026 | TwinMOS Digital Transformation Team | Initial RACI |

**Next Review:** Upon team composition changes and at each phase boundary

**Related Documents:**
- TwinMOSWebsiteProject_Charter.md
- TwinMOSWebsiteStakeholder_Register.md
- TwinMOSWebsiteCommunication_Plan.md

---

*This RACI Matrix is a living document. Changes require agreement from the Operational Sponsor and must be communicated to all stakeholders.*
