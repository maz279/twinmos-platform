# TwinMOS Corporate Website — Decision Log

**Document Reference:** TWN-PM-DECISION-2026-001  
**Version:** 1.0  
**Date:** 1 May 2026  
**Classification:** CONFIDENTIAL — Internal Use Only  
**Prepared by:** TwinMOS Digital Transformation Team  
**Owner:** TwinMOS PM  
**Audience:** All project stakeholders

---

## 1. Decision Log Overview

This document records all significant decisions made during the TwinMOS corporate website redevelopment project. Each decision includes the context, options considered, the decision made, rationale, and any implications or follow-up actions.

**Decision thresholds requiring logging:**
- Technology or architecture changes
- Scope additions or removals
- Budget changes > $1,000
- Timeline changes > 1 week
- Vendor selection or changes
- Design direction changes
- Process or workflow changes

---

## 2. Decision Log Template

| Field | Description |
|-------|-------------|
| **ID** | Unique decision identifier (DEC-YYYY-NNN) |
| **Date** | Date decision was made |
| **Decision** | Clear statement of what was decided |
| **Context** | Background and why the decision was needed |
| **Options Considered** | Alternatives evaluated |
| **Decision Maker** | Person with authority to make the decision |
| **Rationale** | Why this option was chosen |
| **Implications** | Impact on scope, timeline, budget, quality |
| **Follow-up Actions** | Tasks resulting from this decision |
| **Status** | Proposed / Approved / Rejected / Deferred / Superseded |

---

## 3. Pre-Project Decisions (Logged at Kickoff)

### DEC-2026-001: Technology Stack Selection

| Field | Detail |
|-------|--------|
| **Date** | 30 April 2026 |
| **Decision** | Adopt **Strapi v5 + Astro 5** as the technology stack for Phases 1–3 |
| **Context** | BRD and Implementation Strategy evaluated six options across two categories |
| **Options Considered** | 1A: Strapi v5 + Astro 5 (selected); 1B: Payload v3 + Next.js 15; 1C: Directus + Nuxt 3; 2A: Next.js + Hono + Drizzle; 2B: Astro + FastAPI + SQLAlchemy; 2C: Laravel + Livewire |
| **Rationale** | Astro reads 351 existing markdown files directly (saves 4–8 weeks); Lighthouse 95+ by default; Strapi v5 has largest plugin ecosystem; two-repo split fits 2-developer team; marketing-friendly editor |
| **Implications** | Two repositories to maintain; Astro islands need React decision; build time may require paid tier at Phase 2 |
| **Follow-up Actions** | ADR-001 committed; React selected for islands; build monitoring configured |
| **Status** | Approved |

---

### DEC-2026-002: Engagement Scope — 2 Developers / 15 Months / Phases 1–3

| Field | Detail |
|-------|--------|
| **Date** | 30 April 2026 |
| **Decision** | Commit to full 15-month engagement covering Phases 1–3 with 2 full-time developers |
| **Context** | Implementation Strategy v1.0 proposed 5-month Phase 1 only; v2.0 proposed 3-month solo developer; v3.0 proposes full scope |
| **Options Considered** | 5-month Phase 1 only (trimmed); 3-month solo dev (high risk); 15-month 2-dev full scope (selected) |
| **Rationale** | 120 person-weeks capacity matches 110–175 person-weeks effort; 80–90% probability of success; no crunch required; full competitive parity achievable |
| **Implications** | Budget commitment of $175K–$341K for engineering; 15-month timeline to December 2027 |
| **Follow-up Actions** | Contract amendment; payment schedule updated; resource allocation confirmed |
| **Status** | Approved |

---

### DEC-2026-003: Hosting Strategy — Hybrid Self-Hosted + CDN

| Field | Detail |
|-------|--------|
| **Date** | 30 April 2026 |
| **Decision** | Self-hosted backend on Hetzner CX32 via Coolify; frontend on Cloudflare Pages; Backblaze B2 for object storage |
| **Context** | Need cost-effective, scalable hosting with data residency compliance |
| **Options Considered** | All-Vercel (higher cost); all-Hetzner (more ops); hybrid (selected) |
| **Decision Maker** | Unisoft Team Lead + TwinMOS IT Lead |
| **Rationale** | Hybrid minimizes cost ($15–25/mo backend); Cloudflare Pages gives global CDN; Coolify simplifies self-hosting; data residency in EU (Falkenstein) |
| **Implications** | Two hosting platforms to monitor; Coolify learning curve; VPS upgrade needed for Phase 3 e-commerce |
| **Follow-up Actions** | Hetzner account provisioned; Coolify installed; Cloudflare Pages configured |
| **Status** | Approved |

---

### DEC-2026-004: AI-Assisted Development — Cursor + Copilot

| Field | Detail |
|-------|--------|
| **Date** | 30 April 2026 |
| **Decision** | Adopt Cursor IDE + GitHub Copilot as AI-assisted development tooling |
| **Context** | 2-developer team needs productivity multiplier to deliver full scope within capacity |
| **Options Considered** | Cursor only; Copilot only; both (selected); Claude Code CLI only; none |
| **Decision Maker** | Unisoft Team Lead |
| **Rationale** | Cursor for rapid prototyping and refactoring; Copilot for inline suggestions; combined estimated 8–12 weeks saved across 15 months |
| **Implications** | ~$700 tooling cost over 15 months; learning curve for AI-assisted workflows; code review still required |
| **Follow-up Actions** | Licenses procured; team trained; AI usage guidelines documented |
| **Status** | Approved |

---

### DEC-2026-005: Search Engine — MeiliSearch

| Field | Detail |
|-------|--------|
| **Date** | 30 April 2026 |
| **Decision** | Use MeiliSearch (self-hosted) for site search and catalog faceting |
| **Context** | Need multilingual search with typo tolerance and faceted filtering |
| **Options Considered** | MeiliSearch (selected); Typesense; Algolia (paid); Elasticsearch (overkill) |
| **Decision Maker** | Unisoft Team Lead + Unisoft Senior Dev |
| **Rationale** | Best Arabic/multilingual support out of the box; ~512 MB RAM; instant search; faceted search for dual-axis catalog; free and open-source |
| **Implications** | Self-hosted resource usage; may need Typesense/Algolia at Phase 3 if e-commerce scale demands |
| **Follow-up Actions** | MeiliSearch Docker container configured; index schema defined |
| **Status** | Approved |

---

### DEC-2026-006: Authentication — Better Auth for Partner Portal

| Field | Detail |
|-------|--------|
| **Date** | 30 April 2026 |
| **Decision** | Use Better Auth for Partner Portal authentication (Phase 2) |
| **Context** | Need modern, secure auth for partner portal with role-based access |
| **Options Considered** | Better Auth (selected); Keycloak; Auth.js; Strapi built-in auth only |
| **Decision Maker** | Unisoft Team Lead + TwinMOS IT Lead |
| **Rationale** | Modern Auth.js/Lucia successor; first-class framework support; simpler than Keycloak; more flexible than Strapi built-in |
| **Implications** | New library (March 2025+); documentation maturing; migration path if needed |
| **Follow-up Actions** | Better Auth evaluated in Sprint 0; ADR committed; integration tested |
| **Status** | Approved |

---

### DEC-2026-007: E-Commerce Platform — Stripe Checkout (Phase 3 MVP)

| Field | Detail |
|-------|--------|
| **Date** | 30 April 2026 |
| **Decision** | Use Stripe Checkout for Phase 3 e-commerce MVP; evaluate Medusa.js for future expansion |
| **Context** | Need e-commerce capability with minimal PCI burden and fast time-to-market |
| **Options Considered** | Stripe Checkout (selected); Medusa.js full; Payload e-commerce plugin; custom build |
| **Decision Maker** | Operational Sponsor + Unisoft Team Lead |
| **Rationale** | Stripe Checkout shifts PCI burden to Stripe; fastest implementation; Medusa.js can replace later if needed; matches 2-dev capacity |
| **Implications** | Less customization than Medusa; Stripe fees; redirect to Stripe for payment |
| **Follow-up Actions** | Stripe account provisioned; ADR committed; integration architecture designed |
| **Status** | Approved (with Phase 3 re-evaluation clause) |

---

### DEC-2026-008: Analytics — Plausible (Phase 1–2), PostHog (Phase 3)

| Field | Detail |
|-------|--------|
| **Date** | 30 April 2026 |
| **Decision** | Use Plausible self-hosted for Phases 1–2; add PostHog OSS in Phase 3 for session replay and advanced analytics |
| **Context** | Need GDPR-compliant analytics with progressive capability expansion |
| **Options Considered** | Plausible only; PostHog only; Google Analytics (rejected for privacy); Umami |
| **Decision Maker** | TwinMOS Marketing Director + Unisoft Team Lead |
| **Rationale** | Plausible is cookieless and GDPR-clean by default; lighter weight; PostHog adds session replay and feature flags for Phase 3 marketing automation |
| **Implications** | Two analytics platforms to maintain; data migration not needed (different use cases) |
| **Follow-up Actions** | Plausible deployed in Phase 1; PostHog evaluation in Phase 3 Sprint 23 |
| **Status** | Approved |

---

### DEC-2026-009: Live Chat — Chatwoot Self-Hosted

| Field | Detail |
|-------|--------|
| **Date** | 30 April 2026 |
| **Decision** | Use Chatwoot self-hosted on Hetzner for live chat (Phase 2) |
| **Context** | Need live chat with agent routing, offline capture, and ticket history |
| **Options Considered** | Chatwoot (selected); Crisp.chat; Intercom (paid); Zendesk (paid) |
| **Decision Maker** | TwinMOS Sales Director + Unisoft Senior Dev |
| **Rationale** | Open-source; self-hosted (no per-agent fees); agent routing; integrates with Strapi; offline email capture |
| **Implications** | Self-hosted maintenance; ~1 GB RAM; backup responsibility |
| **Follow-up Actions** | Chatwoot deployed in Phase 2 Sprint 14; agent training scheduled |
| **Status** | Approved |

---

### DEC-2026-010: Content Strategy — Astro Content Collections + Strapi Hybrid

| Field | Detail |
|-------|--------|
| **Date** | 30 April 2026 |
| **Decision** | Use Astro Content Collections for static content (351 markdown files); Strapi for dynamic/editor-managed content |
| **Context** | 351 markdown files exist; need both developer-managed and editor-managed content |
| **Options Considered** | All Strapi (migration effort); all markdown (no CMS); hybrid (selected) |
| **Decision Maker** | Unisoft Team Lead + TwinMOS Marketing Director |
| **Rationale** | Markdown files become routes immediately; no migration needed; Strapi handles dynamic data (products, forms, news); best of both worlds |
| **Implications** | Two content sources to manage; clear ownership needed (dev vs. marketing); build process reads both |
| **Follow-up Actions** | Content ownership matrix defined; migration script for future Strapi-only migration if needed |
| **Status** | Approved |

---

## 4. Decision Log (Active Project — To Be Updated)

| ID | Date | Decision | Decision Maker | Status |
|----|------|----------|----------------|--------|
| DEC-2026-011 | TBD | [To be added during project execution] | | Proposed |
| DEC-2026-012 | TBD | [To be added during project execution] | | Proposed |
| DEC-2026-013 | TBD | [To be added during project execution] | | Proposed |

---

## 5. Decision Making Process

### 5.1 Decision Types and Authority

| Decision Type | Authority | Consultation Required | Documentation |
|---------------|-----------|----------------------|---------------|
| Strategic (budget > $10K, scope change) | Project Sponsor | Operational Sponsor, PM, Team Lead | Decision Log + Charter update |
| Tactical (technology, design, timeline) | Operational Sponsor | PM, Team Lead, relevant stakeholders | Decision Log |
| Technical (architecture, stack, tools) | Unisoft Team Lead + TwinMOS IT | Senior Dev, PM | ADR + Decision Log |
| Content (copy, imagery, SEO) | TwinMOS Marketing Director | PM, Legal | Decision Log |
| Process (workflow, cadence, tools) | TwinMOS PM | Team Lead | Decision Log |

### 5.2 Decision Workflow

1. **Identify need** — Any stakeholder can raise a decision need
2. **Document context** — Use Decision Request template (see Communication Plan)
3. **Evaluate options** — Minimum 2 options with pros/cons
4. **Consult stakeholders** — Per RACI matrix
5. **Make decision** — Authority holder decides
6. **Log decision** — Add to this Decision Log within 24 hours
7. **Communicate** — Announce to all informed parties
8. **Track follow-up** — Action items in sprint backlog or issue tracker

### 5.3 Reversing a Decision

Decisions may be revisited if:
- New information materially changes the context
- The decision is proving unworkable in practice
- A superseding requirement emerges

**Process:**
1. Request reversal with justification
2. Original decision maker reviews
3. If approved, mark original as "Superseded" and log new decision
4. Communicate change to all stakeholders

---

## 6. Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 1 May 2026 | TwinMOS Digital Transformation Team | Initial log with pre-project decisions |

**Next Review:** Updated continuously as decisions are made

**Related Documents:**
- TwinMOSWebsiteProject_Charter.md
- TwinMOSWebsiteCommunication_Plan.md
- TwinMOSWebsiteChangeRequestProcess.md
- ADR documents in GitHub `/docs/adr/`

---

*This Decision Log is a living document. All significant decisions must be logged within 24 hours of being made.*
