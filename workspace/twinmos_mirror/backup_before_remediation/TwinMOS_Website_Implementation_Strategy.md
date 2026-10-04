# TwinMOS Website — Implementation Strategy & Technology Stack Options

**Document Reference:** TWN-IMPL-STRAT-2026-001
**Document Version:** 4.0 (Solo-Developer / 18–24 Months / 15-Phase / Full-Scope incl. ES/PT/DE Launch / Enterprise-Quality / Phases 1–3 + 15 Edition)
**Status:** FINAL — for TwinMOS Solo-Developer Engagement
**Date:** 2 May 2026
**Prepared by:** TwinMOS Digital Transformation Team
**Owner:** IT/Technical Lead (Implementation) / Project Sponsor (Approval)
**Audience:** Solo full-stack developer; TwinMOS leadership; project oversight
**Classification:** CONFIDENTIAL — TwinMOS Internal Use
**Synchronized With:** SOW v4.0, BRD v3.0 (v3.2 patches applied), URD v3.1, Tech Stack v1.2, Implementation Roadmap v2.2 (15-Phase), Content Map v1.0 (v1.1 pending), `_master-sku-reference.md`, Forensic Alignment Audit v3.0

---

## CHANGE LOG

| Version | Date | Constraints Modeled | Verdict |
|---------|------|---------------------|---------|
| 1.0 | 30 Apr 2026 | 2 devs / 5 months / Phase 1 only / scope trim recommended | Phase 1 trimmed delivery |
| 2.0 | 30 Apr 2026 | 1 solo dev / 3 months / full Phase 1 scope / enterprise quality | Probability of success ~20–25% |
| 3.0 | 30 Apr 2026 | 2 devs / 15 months / full RFP+BRD+URD scope / enterprise quality / Phases 1–3 | Probability of success ~80–90% (constraints proven incompatible with Roadmap v2.0) |
| **4.0 (current)** | **2 May 2026** | **1 solo dev / 18–24 months / 15-phase Roadmap / full Phases 1–3 + Phase 15 (Loyalty/Referral/MDF/ES/PT/DE launch) / enterprise quality / WCAG 2.2 AA / TwinMOS own cloud server origin + Cloudflare DNS-WAF-CDN front / two-repo / Node.js 24 LTS migration in Phase 13 per ADR-008** | **Probability of success ~75–85%** (solo-dev capacity tight at upper bound; AI-assisted productivity multiplier + scope-trim list mitigate) |

### Why v4.0 supersedes v3.0

The 2-developer / 15-month assumption in v3.0 was **structurally incompatible** with the Implementation Roadmap v2.2 (authored 2 May 2026), which decomposed the project into 15 sequential phases delivered by **a single solo full-stack developer over 18–24 months**. Forensic Alignment Audit v3.0 §7 documented 23 findings against Strategy v3.0 — 8 critical, all converging on the team-size/timeline/capacity mismatch.

Sponsor Decisions (2 May 2026, captured in Forensic Alignment Audit v3.0 §11):
- **1A** Solo full-stack developer model (Roadmap canonical)
- **2B** TwinMOS own cloud server origin + Cloudflare DNS/WAF/CDN edge front
- **3A** Two-repo (Roadmap T-1.1.02 retained)
- **4A** Phase 1 launch Feb–Mar 2027 (Roadmap Phase 8 binding)
- **5A** ES/PT/DE full launch in-scope at Roadmap Phase 15 (10 active locales total)
- **6A** WCAG 2.2 AA target (upgrade from 2.1)
- **7A** Node.js 24 LTS migration in Phase 13 (ADR-008)

**Capacity math (v4.0):** 1 dev × 40 h/week × 80–95 weeks (Phases 1–14) = **3,200–3,800 person-hours = 80–95 person-weeks**. Phase 15 open-ended adds ES/PT/DE launch + Loyalty/Referral/MDF/Handover (~10–15 additional person-weeks). Full scope at solo-dev capacity is **tight at the upper bound** but achievable with: AI-assisted development (Copilot/Claude as productivity multiplier), bi-weekly demos with 24h decision turnaround, scope-trim list maintained, phased go-live de-risking.

**Phase 4 retainer (post-Phase 15)** remains available for ongoing CRO/SEO/security updates per BRD §6.1.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Capacity Analysis — The Math Now Works](#2-capacity-analysis--the-math-now-works)
3. [Implementation Constraints & Environment](#3-implementation-constraints--environment)
4. [Team Composition & Operating Model](#4-team-composition--operating-model)
5. [Decision Framework](#5-decision-framework)
6. [CATEGORY 1 — Open-Source-First Stacks (3 Options)](#6-category-1--open-source-first-stacks)
   - [Option 1A: Strapi v5 + Astro 5 (TOP PICK)](#option-1a-strapi-v5--astro-5-top-pick)
   - [Option 1B: Payload v3 + Next.js 15 (STRONG RUNNER-UP)](#option-1b-payload-v3--nextjs-15-strong-runner-up)
   - [Option 1C: Directus + Nuxt 3 (CONDITIONAL)](#option-1c-directus--nuxt-3-conditional)
7. [CATEGORY 2 — Full Custom Development (3 Options, Now Feasible)](#7-category-2--full-custom-development-now-feasible)
8. [AI-Assisted Development as a Productivity Multiplier (Recommended)](#8-ai-assisted-development-as-a-productivity-multiplier-recommended)
9. [Cross-Option Comparison Matrix](#9-cross-option-comparison-matrix)
10. [Hosting & Total Cost of Ownership (15 Months)](#10-hosting--total-cost-of-ownership-15-months)
11. [Enterprise-Quality Non-Negotiables](#11-enterprise-quality-non-negotiables)
12. [15-Month Multi-Phase Delivery Plan (Phases 1–3)](#12-15-month-multi-phase-delivery-plan-phases-13)
13. [Final Recommendation](#13-final-recommendation)
14. [Implementation Kickoff Checklist](#14-implementation-kickoff-checklist)
15. [Appendix A — Tooling Inventory by Layer](#15-appendix-a--tooling-inventory-by-layer)
16. [Appendix B — Risk Register (15-Month Engagement)](#16-appendix-b--risk-register-15-month-engagement)
17. [Appendix C — Sources & References](#17-appendix-c--sources--references)

---

## 1. Executive Summary

This v3.0 document presents the implementation strategy for the TwinMOS corporate website redevelopment project under the project sponsor's committed engagement: **2 full-stack developers from Unisoft, 15 months total, full RFP v3.0 / BRD v3.0 / URD v3.0 / Content Map v1.0 scope, enterprise quality, covering Phases 1–3 of BRD §6.1**.

The 15-month timeline aligns precisely with the BRD §6.1 phased roadmap:

| Phase | Months | Scope (per BRD §6.1, RFP §4.4, URD §1.2) |
|-------|--------|------------------------------------------|
| **Phase 1 — Core Website** | 1–5 | Full website rebuild; 287 content entries; 100+ SKU detail pages; 28 regional landings; 9 locales as configuration with EN populated; catalog with dual-axis (category × brand); compatibility finder MVP; where-to-buy; news/events; support center; gaming hub static; CMS; basic forms; 34 legal pages; site-wide components; SEO + accessibility + performance gates met |
| **Phase 2 — Localization & Partner Enablement** | 6–9 | Multi-language launch (Arabic RTL, Bengali, Hindi); partner / distributor portal full activation; live-chat with agent routing; serial-number anti-counterfeit lookup; RMA portal full workflow with status tracking; firmware download center with serial validation; gaming hub interactive features (RGB visualizer, build gallery moderation); compatibility finder full algorithm with QVL data |
| **Phase 3 — Commerce & Advanced Features** | 10–15 | E-commerce evaluation/MVP; SSD management software / firmware utilities; additional languages (Russian, Chinese-Simplified, French); advanced analytics & marketing automation; Loyalty program; Referral program; MDF program for distributors; Investor Relations activation (if applicable) |
| Phase 4 — Ongoing Optimization | 16+ | **OUTSIDE THIS ENGAGEMENT** — separate retainer for Spanish, Portuguese, German; continuous SEO; CRO |

**Recommendation:** **Option 1A — Strapi v5 + Astro 5** as the top-pick stack. The decisive factors are: (a) Astro Content Collections read the existing 351 markdown files in `content/website-content/` directly, saving 4–8 weeks of content migration; (b) Astro hits Lighthouse 95–100 by default, making the BRD performance bar a routine outcome rather than an engineering project; (c) Strapi v5 has the largest plugin ecosystem in the headless CMS space (~500 plugins) and core i18n in v5; (d) the 2-developer team can comfortably operate the two-repo architecture, with one developer leading frontend and the other leading CMS/backend.

**Strong runner-up:** **Option 1B — Payload v3 + Next.js 15** if the team strongly prefers single-repo / single-language / single-deploy and is willing to accept the Lighthouse-tuning effort to reach 90+.

The 15-month plan is presented in §12 with explicit week-by-week milestones across all three phases. The probability of full-scope, on-time, enterprise-quality delivery is **~80–90%** under this plan — a realistic, well-resourced engagement.

---

## 2. Capacity Analysis — The Math Now Works

### 2.1 Person-Week Math

| Item | Estimate |
|------|---------|
| Phase 1 build (raw engineering, content, QA) | 40–60 person-weeks |
| Phase 2 build (multi-language, partner portal, anti-counterfeit, RMA, finder, gaming interactive) | 30–45 person-weeks |
| Phase 3 build (e-commerce MVP, additional languages, advanced analytics, loyalty/referral) | 40–70 person-weeks |
| **Total Phase 1+2+3 effort (industry baseline)** | **110–175 person-weeks** |
| 2 developers × 15 months × 4 weeks | **120 person-weeks** |
| **Capacity match** | **Favorable — within range; see §2.2 for headroom strategy** |

### 2.2 Headroom Strategy

The baseline range (110–175 person-weeks) sits roughly at the team's 120 person-week capacity. To ensure the project lands at the favorable end of the range:

| Strategy | Effort Saved |
|----------|--------------|
| **Astro Content Collections read 351 existing markdown files directly** (Option 1A advantage) | 4–8 weeks |
| **Aggressive content templating** (3–5 page-templates cover the 287 pages) | 4–8 weeks |
| **AI-assisted development** (Cursor / Claude Code / Copilot) — see §8 | 8–12 weeks across the 15 months |
| **Use Strapi plugins instead of custom code** wherever a plugin meets the requirement | 4–6 weeks |
| **Total realistic optimization** | **20–34 weeks effective output** |

Combined optimistic ceiling: **~140–155 person-weeks of effective output across 120 calendar person-weeks** — comfortably within the high end of the 110–175 baseline. Phase 1+2+3 full scope is deliverable with normal working hours, proper testing time, and no crunch.

### 2.3 Industry Benchmarks at This Scope

- **Klépierre** (similar JAMstack rebuild) shipped in 3 months with a larger team for Phase 1 content scope alone.
- **Mambu** redesign on Sanity + Gatsby was a 6–9 month effort with 3–5 contributors covering content + commerce.
- A 287-page content-heavy corporate site with 7+ application surfaces, 9 locales, and Phase 3 e-commerce MVP typically maps to **3–5 full-time engineers over 12–18 months** in published case studies.
- A 2-developer team over 15 months is at the lower end of staffing for this scope and at the longer end of timeline — a sensible, conservative resourcing decision that prioritizes quality over speed.

### 2.4 Probability Profile

| Outcome | Probability |
|---------|-------------|
| **Phase 1 launch on Month 5 at full scope, enterprise quality** | **80–88%** |
| **Phase 1+2 complete on Month 9 at full scope, enterprise quality** | **78–85%** |
| **Phase 1+2+3 complete on Month 15 at full scope, enterprise quality** | **80–90%** |
| Slip of 1–2 months on any single phase | ~12–18% |
| Slip of 3+ months across phases | ~3–8% |

This is a **healthy, professional-grade engagement profile**. No 60-hour weeks required. Standard industry practices for testing, code review, accessibility audits, security scans, documentation, and stakeholder communication all fit comfortably within the schedule.

---

## 3. Implementation Constraints & Environment

### 3.1 Team

| Role | Headcount | Allocation |
|------|-----------|-----------|
| Team Lead / Senior Full-Stack Developer (Unisoft) | 1 | 100% — Phases 1–3 |
| Full-Stack Developer (Unisoft) | 1 | 100% — Phases 1–3 |
| TwinMOS PM / Marketing / Product / Legal | (per BRD §3) | Content authoring, UAT, sign-offs |
| Translation vendor (external) | 1 | Phase 2 (AR / BN / HI) + Phase 3 (RU / ZH / FR) |
| Third-party penetration test vendor | 1 | Pre-Phase 1 launch + annual recurring |
| Designer (optional, external) | 0–1 | Visual polish for Gaming Hub + launch campaigns; can be deferred to Marketing's existing agency |

### 3.2 Developer Workstations (Per BRD/URD/RFP-aligned setup)

| Layer | Specification |
|-------|---------------|
| OS | Linux (Ubuntu 24.04 LTS / Fedora 41 / Debian 13) |
| IDE | VSCode with extensions: ESLint, Prettier, GitLens, Tailwind IntelliSense, Astro/React/Vue extensions, Docker, Bruno (REST client), Error Lens, Code Spell Checker, i18n Ally, Auto Rename Tag, Path Intellisense, axe DevTools, Lighthouse, GitHub Actions, GitHub PRs, Conventional Commits |
| AI assistant (recommended) | GitHub Copilot OR Cursor IDE OR Claude Code CLI — see §8 |
| Local DB | PostgreSQL 16 (Docker container) + DBeaver / pgAdmin |
| Local Dev Server | Vite (HMR) for Astro / Next.js Turbopack `dev` for Next.js |
| Local Build Server | Astro `build` / Next.js `build` — sub-30 s incremental rebuilds |
| Error monitoring (local) | Error Lens; browser DevTools Console + Network panel; Sentry CLI for replay |
| Browser | Chrome (DevTools + Lighthouse CI), Firefox (parity check), iOS Safari (real device for Apple ecosystem QA) |
| Browser Preview | Chrome DevTools Device Mode + viewport presets; BrowserStack / LambdaTest free tier |
| Container | Docker + Docker Compose (one local stack: app + Postgres + Redis + search) |
| Versioning | Git + GitHub (private repo); Conventional Commits; Husky + lint-staged pre-commit hooks |
| API Client | Bruno (open-source Postman alternative) |
| Performance | Lighthouse CI (in pipeline), Chrome DevTools Performance tab, WebPageTest |

### 3.3 CI/CD & Hosting (Production)

| Layer | Recommendation |
|-------|----------------|
| Source control | GitHub (private repo, branch protection on `main`) |
| CI/CD | GitHub Actions |
| Build & deploy | Stack-dependent (see options in §6) |
| Preview deploys | Automatic per pull request — Vercel / Netlify / Cloudflare Pages built-in feature |
| Production hosting | Stack-dependent — recommended hybrid: managed frontend (Vercel/Netlify) + self-hosted backend on Hetzner via Coolify |
| Database hosting | Neon Postgres OR self-hosted PostgreSQL on Hetzner (with daily backups to Backblaze B2) |
| Object / asset storage | Cloudflare R2 or Backblaze B2 (S3-compatible) |
| Image transforms | Cloudinary free tier OR self-hosted ImgProxy on the same Hetzner box |
| Email | Resend (3,000 emails/month free; $20/mo for 50,000) — covers Phase 1; Phase 2+ may scale |
| Analytics | Plausible self-hosted OR Plausible Cloud ($9/mo) — Phase 2+ may add PostHog for session replay |
| Monitoring | Sentry free tier (5,000 events/mo) → Team tier ($26/mo) at Phase 2 |
| Uptime | UptimeRobot free tier (50 monitors, 5-minute checks) |
| Secrets | Vercel/Netlify environment variables OR Doppler (free tier) |

### 3.4 Non-Negotiables (Inherited from BRD/URD/RFP)

These are enterprise-quality requirements that apply across all three phases:

- **Performance:** Lighthouse Performance ≥ 90; LCP ≤ 2.0 s; CLS ≤ 0.1; INP ≤ 200 ms; TTFB ≤ 200 ms.
- **Accessibility:** WCAG 2.1 AA. Validated by `axe-core` in CI on every PR + monthly manual NVDA / VoiceOver test.
- **Compliance:** GDPR, UAE DPL, India DPDP, KSA PDPL — cookie consent, granular preferences, data deletion request, right-to-erasure flows.
- **Security:** TLS 1.3, HSTS, CSP, OWASP Top 10 protection via WAF, OWASP ZAP scan in CI weekly, quarterly third-party penetration test.
- **Localization:** 9 locales (EN at Phase 1; AR/BN/HI at Phase 2; RU/ZH/FR at Phase 3; ES/PT/DE deferred to Phase 4).
- **SEO:** Schema.org structured data per page-type; hreflang for all language variants; XML sitemap auto-generation; canonical URLs.
- **Observability:** Centralized error monitoring (Sentry); real-user monitoring (RUM); synthetic uptime checks from at least 3 target regions; CMS audit log.
- **Testing:** Unit tests (Vitest) for business logic; integration tests for API routes; E2E tests (Playwright) for critical user paths. Coverage target: critical-path 100%, overall ≥ 70% by end of Phase 1.
- **Documentation:** Architecture overview, runbooks, content-publishing guide, RMA workflow guide, deployment guide, developer onboarding guide.
- **Disaster Recovery:** RTO ≤ 4 hours, RPO ≤ 15 minutes; DR drill before each phase launch.

---

## 4. Team Composition & Operating Model

### 4.1 Role Split Between the Two Developers

| Responsibility | Team Lead (Dev A) | Developer (Dev B) |
|----------------|-------------------|-------------------|
| Architecture & technology decisions | Primary | Reviewer |
| Front-end framework & components | 50% | 50% |
| CMS (Strapi/Payload/Directus) configuration & extensions | 60% | 40% |
| Backend API & business logic | 50% | 50% |
| Database schema design | Primary | Reviewer |
| DevOps, CI/CD, infrastructure | Primary | Secondary |
| Performance optimization | 50% | 50% |
| Accessibility (WCAG 2.1 AA) | 40% | 60% |
| Testing (Vitest, Playwright) | 50% | 50% |
| Security (OWASP, CSP, audits) | Primary | Reviewer |
| Documentation | 40% | 60% |
| Stakeholder communication | Primary | Secondary |
| Code review | Both review every PR | Both review every PR |

**Pair-programming sessions:** at least 1 hour per day for the most complex tasks (compatibility finder algorithm, RMA workflow, partner portal auth, e-commerce integration). This deliberately shares context so neither developer becomes a single point of failure.

### 4.2 Sprint Cadence

- **2-week sprints** (industry-standard for full-stack content-heavy projects)
- **Daily 15-minute standup** (async via Slack/text where possible to preserve focus blocks)
- **Sprint planning** (90 minutes, every 2 weeks)
- **Sprint review with TwinMOS PM** (60 minutes, every 2 weeks — demo only, not status meeting)
- **Sprint retrospective** (45 minutes, every 2 weeks — internal Unisoft only)
- **Phase-end review** with TwinMOS sponsor (Months 5, 9, 15)

### 4.3 Communication Cadence with TwinMOS

| Channel | Frequency | Purpose |
|---------|-----------|---------|
| Slack / async messaging | Daily | Quick questions, blockers |
| Bi-weekly demo | Every 2 weeks | Show what shipped; gather feedback |
| Monthly written status | End of month | Metrics, risks, decisions needed |
| Phase-end review | Months 5, 9, 15 | Formal sign-off; next-phase kickoff |
| Ad-hoc decision meetings | As needed (≤ 24 h response from TwinMOS) | Unblock decisions |

**Decision SLA:** TwinMOS PM commits to a 24-hour decision turnaround on blockers. Anything longer becomes a project risk that delays the schedule proportionally.

### 4.4 Knowledge Sharing & Continuity

- **Architecture Decision Records (ADRs)** committed to `/docs/adr/` for every significant decision
- **Both developers commit code daily** to ensure both know every part of the codebase
- **One pair-programming session per day** ensures shared context on complex work
- **Vacation coverage plan** ensures the project does not stall on either developer being away for up to 2 weeks
- **Backup developer** (Unisoft bench) identified and given read access at project start, even if not actively contributing — enables rapid escalation if RISK-3 (extended absence) materializes

---

## 5. Decision Framework

When choosing among the six options below, weigh these factors **in this order**:

1. **Time-to-launch and total delivery within 15 months** — non-negotiable.
2. **Existing content reuse** — the 351 markdown files in `content/website-content/` are an asset; stacks that read them directly save 4–8 weeks.
3. **Enterprise quality enablement** — Lighthouse 90+, WCAG 2.1 AA, security, observability must be achievable without engineering heroics.
4. **Editor experience** — TwinMOS marketing/content team must comfortably author and publish without dev help by end of Phase 1.
5. **Long-term maintainability** — Phases 2/3 (and the post-engagement Phase 4 retainer) must be tractable.
6. **Team familiarity** — all else equal, pick what the team already knows.
7. **Total Cost of Ownership** — secondary to the above; engineering hours dominate.
8. **AI-tooling fit** — secondary but meaningful for productivity.

---

## 6. CATEGORY 1 — Open-Source-First Stacks

> **What "Open-Source-First" means here:** The headless CMS, frontend framework, database, search, image pipeline, map, and ancillary tooling are all permissively-licensed open-source software. License cost = $0. Custom development is reserved for business-logic surfaces (compatibility finder, comparison tool, RMA workflow, partner portal logic, anti-counterfeit lookup, e-commerce integration). Hosting cost = $30–80/month for Phase 1, scaling to $80–200/month by end of Phase 3 with traffic growth.

### Option 1A: Strapi v5 + Astro 5 (TOP PICK)

**One-line summary:** *Treat the existing 351 markdown files as the content source via Astro Content Collections; use Strapi v5 only for editor-managed dynamic data (warranty, RMA, news, distributors, e-commerce). Maximum Lighthouse, minimum re-keying, largest plugin ecosystem.*

#### Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Frontend framework** | **Astro 5** with islands (React for interactivity) | Astro consistently hits Lighthouse 95–100 on content sites; ships near-zero JS by default. The 351 existing markdown files become routes immediately via Content Collections. |
| **Headless CMS** | **Strapi v5.1+** | Largest plugin ecosystem (~500 plugins), strong content-block editor UX for marketing team, core i18n in v5, accessibility plugin available, 70k+ GitHub stars, mature commercial support if escalation needed. |
| **Database** | PostgreSQL 16 (Strapi backend) | Runs in Docker locally; self-hosted on Hetzner OR Neon Postgres in production. |
| **Search engine** | **MeiliSearch** (self-hosted) | Better Arabic / multilingual support than Typesense out of the box; ~512 MB RAM; instant search with typo tolerance; faceted search for the dual-axis catalog. Phase 1 starts on MeiliSearch; Phase 3 e-commerce may scale to Typesense or Algolia if scale demands. |
| **Map** | **Leaflet + OpenStreetMap raster tiles** for Phase 1; **MapLibre + OSM vector tiles** if upgraded in Phase 2 | 42 KB bundle vs MapLibre's 290 KB; sufficient for ~28 regional locator pages; zero recurring map cost; no Mapbox/Google billing surprises. |
| **Image pipeline** | Astro built-in Sharp (build-time) + **ImgProxy self-hosted** for runtime CMS-uploaded image transforms | Astro handles markdown image optimization; ImgProxy adds runtime resizing for Strapi-uploaded images. Backblaze B2 for object storage (~$0.005/GB). |
| **Forms** | React Hook Form + Zod (validation) → Strapi collection or Resend → email auto-routing | Strapi's collection API stores submissions; Strapi Email plugin or Resend handles auto-routing. |
| **i18n** | Strapi v5 core i18n + Astro i18n routing (full RTL support) | Strapi stores 9 locales per field; Astro routes `/en/`, `/ar/`, `/bn/`, `/hi/`, `/ru/`, `/zh-CN/`, `/fr/` (Phase 3). |
| **Auth (admin)** | Strapi built-in roles & permissions | Granular per-collection field-level permissions for Editor / Admin / Author / Viewer. |
| **Auth (partner portal — Phase 2)** | **Better Auth** OR **Keycloak** (self-hosted) | Better Auth is the modern Auth.js / Lucia successor (March 2025+); Keycloak is overkill but ironclad for DPL compliance. |
| **E-commerce (Phase 3)** | **Medusa.js** (self-hosted, OSS, headless) OR **Stripe Checkout** (managed) | Medusa.js is the leading OSS Node.js commerce platform; integrates cleanly with Strapi via API. Stripe Checkout for simpler Phase 3 MVP. |
| **Live chat (Phase 2)** | **Chatwoot** (self-hosted, OSS) OR Crisp.chat (free tier) | Chatwoot supports agent routing; integrates with Strapi for ticket history. |
| **Analytics** | **Plausible** (self-hosted) OR **Umami** (self-hosted) | Lighter than PostHog; cookieless and GDPR-clean by default. Phase 3 may add PostHog OSS for session replay + feature flags. |
| **Hosting (frontend)** | **Netlify** or **Cloudflare Pages** (free tier comfortably covers Phase 1; Pro for Phases 2–3) | Preview deploys per PR. |
| **Hosting (backend stack)** | **Hetzner CX32** (~$10–15/mo) running Strapi + Postgres + MeiliSearch + Plausible + ImgProxy via **Coolify** | Coolify gives a Vercel-like UX on a self-managed VPS; one machine hosts the whole backend stack. Phase 3 may upgrade to CX42 (~$25/mo) for e-commerce load. |
| **Monitoring** | Sentry + UptimeRobot + Coolify built-in dashboards | Errors + uptime + container health. |
| **Dev environment** | VSCode + Astro extension + Strapi devtools + Docker Compose | One `docker-compose.yml` boots Postgres + MeiliSearch + Strapi locally. |

#### Why this fits a 2-developer / 15-month engagement

1. **The 351 markdown files become routes on day one.** Astro Content Collections read them directly with frontmatter validation via Zod schemas. **This single advantage saves 4–8 weeks** versus a CMS-only architecture and drops Phase 1 effort right into the favorable end of the capacity range.
2. **Astro hits Lighthouse 95+ effortlessly.** LCP ≤ 2.0 s is a near-default outcome. The BRD's performance bar becomes routine rather than an engineering project that consumes weeks of optimization time.
3. **Strapi v5 i18n is in core.** Adding 9 locales is configuration. RTL handling in Astro is a CSS direction setting plus locale-aware routing.
4. **Two-repo ownership splits cleanly between two developers.** Dev A leads the Astro frontend + visual layer; Dev B leads the Strapi backend + content modeling + integrations. Pair-programming sessions ensure shared context. Two repos is **not a problem at 2-developer team size**, only at solo-developer size.
5. **Marketing-team friendly editor.** Strapi's content-block editor and media library are familiar to the team that authored the 351 markdown files.
6. **Single backend VPS hosts everything.** $15/month Hetzner instance running Strapi + Postgres + MeiliSearch + Plausible + ImgProxy via Coolify; backups automated via Coolify scheduler to Backblaze B2.
7. **Phase 3 e-commerce path is well-trodden.** Medusa.js is the leading OSS Node.js e-commerce engine; it integrates with Strapi via API. Many published case studies of Astro + Medusa + Strapi commerce sites.
8. **AI-tooling fit is strong.** Astro and Strapi have growing AI-tool training data; React islands are well-supported by Cursor / Copilot / Claude.

#### Trade-offs / risks

- **Two repositories, two deploys.** ~5–10% ops overhead vs Payload's single-repo model. At 2-dev team size this is a fair trade for the Lighthouse + markdown-reuse advantages.
- **Astro islands need a UI framework decision.** React is recommended (broadest ecosystem, best AI-tooling fit). Decision locked in week 1.
- **Astro build for 287 × 9 locales = up to 2,583 routes** can take 2–5 minutes on Netlify free tier. Acceptable; monitor build minutes; upgrade to paid tier ($19/mo) at Phase 2 if needed.
- **Strapi performance at 100k+ entries** benefits from a Redis caching layer. 30 minutes to add via Coolify; standard practice; in scope for Phase 2.
- **Phase 3 e-commerce** introduces Medusa.js as a third backend service — deliberate decision; one VPS upgrade absorbs it.

#### Effort estimate

| Phase | Realistic Effort | Team Capacity | Margin |
|-------|------------------|---------------|--------|
| Phase 1 (Months 1–5) | 30–40 person-weeks (with markdown reuse + templating) | 40 person-weeks | Comfortable |
| Phase 2 (Months 6–9) | 25–35 person-weeks | 32 person-weeks | Comfortable |
| Phase 3 (Months 10–15) | 35–55 person-weeks (e-commerce dominates) | 48 person-weeks | Adequate (light Phase 3 buffer at upper estimate) |
| **Total** | **90–130 person-weeks** | **120 person-weeks** | **Favorable** |

#### Phase 2/3/4 fit

- **Phase 2 partner portal:** Better Auth + Strapi roles → 3–5 weeks
- **Phase 2 anti-counterfeit:** Strapi collection of valid serials + Astro page calling Strapi REST API → 1–2 weeks
- **Phase 2 RMA portal:** Strapi workflow plugin + Astro status-tracker UI → 3–4 weeks
- **Phase 2 multi-language launch:** Translation vendor delivery + Strapi locale population → 4–6 weeks
- **Phase 2 live chat:** Chatwoot self-host + Astro widget integration → 2–3 weeks
- **Phase 3 e-commerce MVP:** Medusa.js + Astro storefront + Stripe → 8–12 weeks
- **Phase 3 additional locales:** Translation vendor delivery → 4–6 weeks
- **Phase 3 loyalty / referral programs:** Custom Strapi collections + Astro pages → 4–6 weeks
- **Phase 4 (out of scope for this engagement):** ES / PT / DE locales + ongoing CRO/SEO → handled by retainer

### Option 1B: Payload v3 + Next.js 15 (STRONG RUNNER-UP)

**One-line summary:** *Single Next.js monorepo containing both the website and the CMS — Payload installs directly into the Next.js app. One repo, one deployment, one TypeScript type system shared from database to UI.*

#### Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Framework** | **Next.js 15 App Router** with React Server Components + ISR | Industry-standard React framework; ISR fits the 287 content pages; RSC reduces client JS for catalog and detail pages; largest ecosystem and AI-tool training data. |
| **CMS** | **Payload CMS v3.81+** (installed *into* the same Next.js app) | Single codebase; Payload's Local API skips HTTP for SSR (sub-second LCP); per-field localization for 9 locales; backed by Figma acquisition (April 2024). |
| **Starter** | **Payload Website Template** (official) | Pre-built homepage, posts, pages, projects, search, redirects, SEO, draft/preview — saves 1–2 weeks of foundation work. |
| **Database** | **Neon Postgres** (serverless) OR self-hosted PostgreSQL | Free tier covers Phase 1 traffic; $19/mo Pro tier provides production guarantees; Vercel-native integration. |
| **Search** | **Typesense** (self-hosted) | Faceted search shines for dual-axis catalog (category × brand); slightly leaner than MeiliSearch on small data. |
| **Map** | **MapLibre GL JS** + free OpenStreetMap vector tiles via OpenMapTiles | Vector tiles render crisper at all zooms; 290 KB bundle is acceptable for a feature-rich locator. |
| **Image pipeline** | Payload's built-in Sharp pipeline + Next.js `<Image>` component | Payload uploads → Sharp resize on save → Next/Image serves WebP/AVIF. |
| **Forms** | React Hook Form + Zod → Payload collection writes; Resend for email auto-routing | Payload Hooks intercept form submissions to trigger email + ticketing workflow. |
| **i18n** | Payload localization (per-field) + **next-intl** on the frontend | Per-field localization avoids Strapi v4's "duplicate-collection" pattern; cleaner data model. |
| **Auth (admin)** | Payload's built-in auth | Robust by default; supports MFA via plugin. |
| **Auth (partner portal — Phase 2)** | **Better Auth** | Modern Auth.js successor; first-class Next.js 15 support. |
| **E-commerce (Phase 3)** | Stripe Checkout OR Medusa.js OR Payload's emerging e-commerce plugin | Stripe Checkout for simplicity; Medusa.js for full headless commerce. |
| **Analytics** | **Plausible** (self-hosted or Cloud) | Cookieless, GDPR-clean. |
| **Hosting** | **Vercel Pro** ($20/mo) for the Next.js app + a $20–40/mo Hetzner CX22 for Postgres + Typesense + Plausible | Vercel optimizes Next.js perfectly; backend services on Hetzner via Coolify. |
| **Monitoring** | Sentry + Vercel built-in observability | Already integrated with Next.js. |

#### Why this fits a 2-developer / 15-month engagement

1. **One repository, one deploy.** Operationally simpler than any other option. The team operates a single CI/CD pipeline.
2. **End-to-end TypeScript type safety.** Payload generates TypeScript types from collection definitions; the same types flow into RSC and tRPC routes. Refactoring is fearless. AI tooling operates with full project context.
3. **Payload Local API.** When Next.js renders a page server-side, it calls Payload's Local API directly — measurably faster than Strapi/Directus REST round-trips.
4. **Best-in-class admin UX for editors.** Payload's content-block editor (Lexical-based) is widely considered the best in the open-source space.
5. **Best-in-class AI-tooling fit.** TypeScript + Next.js + clear conventions = Cursor / Claude / Copilot generate accurate, idiomatic code.

#### Trade-offs / risks

- **Astro Lighthouse advantage forfeited.** Next.js 15 RSC is fast, but typically lands Lighthouse 80–90 without aggressive tuning. Hitting Lighthouse 90+ on every page requires deliberate work — image budgets, font subsetting, third-party script audit, route-level code splitting. Allocate 2–3 weeks of Phase 1 time for performance optimization.
- **Markdown migration step required.** Payload doesn't read MDX files natively; the 351 existing files must be imported into Payload collections. ~3–5 days of scripting + QA.
- **Younger ecosystem than Strapi** (~150 plugins vs 500+). Most TwinMOS needs are covered by official plugins, but exotic Phase 3 e-commerce requirements may need custom work.
- **Vercel cost at scale.** Free tier is generous; high-traffic months can cost $50–150 with paid tier. Hetzner self-host is an option but loses some Next.js optimizations.

#### Effort estimate

| Phase | Realistic Effort | Team Capacity | Margin |
|-------|------------------|---------------|--------|
| Phase 1 (Months 1–5) | 35–45 person-weeks (no markdown reuse advantage) | 40 person-weeks | Tight at upper estimate |
| Phase 2 (Months 6–9) | 25–35 person-weeks | 32 person-weeks | Comfortable |
| Phase 3 (Months 10–15) | 35–55 person-weeks | 48 person-weeks | Adequate |
| **Total** | **95–135 person-weeks** | **120 person-weeks** | **Favorable** |

#### Phase 2/3/4 fit

- **Phase 2 partner portal:** Better Auth + Payload role-based access → 3–5 weeks
- **Phase 2 anti-counterfeit:** Payload collection + Next.js API route → 1–2 weeks
- **Phase 2 RMA portal:** Payload workflow + Next.js status-tracker → 3–4 weeks
- **Phase 3 e-commerce:** Stripe Checkout + Payload e-commerce plugin OR Medusa.js → 8–12 weeks

### Option 1C: Directus + Nuxt 3 (CONDITIONAL)

**One-line summary:** *Database-first architecture — design the product/SKU/brand/compatibility schema as real PostgreSQL tables, then let Directus auto-generate an admin UI on top. Best fit if the catalog's relational complexity is the project's hardest problem and the team is Vue-strong.*

#### Stack

| Layer | Choice |
|-------|--------|
| **Frontend framework** | **Nuxt 3** (Vue 3 ecosystem) |
| **CMS** | **Directus v10** — wraps the PostgreSQL schema |
| **Database** | PostgreSQL 16 (modeled directly with proper foreign keys) |
| **Search** | Typesense |
| **Map** | MapLibre GL JS + OpenStreetMap |
| **Image pipeline** | Directus's built-in asset transforms (Sharp) |
| **Forms** | Directus collections + **Directus Flows** for no-code workflow automation |
| **i18n** | Directus translations module + vue-i18n |
| **Auth (admin & partner portal)** | Directus's built-in roles & permissions (granular field-level) |
| **E-commerce (Phase 3)** | Medusa.js + Nuxt storefront, OR Directus + Stripe |
| **Analytics** | PostHog (self-hosted) |
| **Hosting** | Hetzner CX32 (~$10–15/mo) running Directus + Postgres + Typesense + PostHog via Coolify; Nuxt on Cloudflare Pages |

#### Why this fits a 2-developer / 15-month engagement

1. **Real relational schema.** TwinMOS's catalog has rich relationships (a SKU belongs to a Product, a Product belongs to a Brand and a Category, a SKU has many Compatible Motherboards). Modeling this in Directus directly with proper foreign keys beats document-store approaches for the **compatibility finder** in particular.
2. **Directus Flows replace backend code.** "RMA submission → status email → Slack notification → record in CRM" is configured visually rather than coded. Saves 1–2 weeks across Phase 1 + Phase 2.
3. **Field-level permissions.** Phase 2 partner portal: distributor users see distributor pricing field; consumer users do not. No custom permission logic required.
4. **Single backend host runs everything.** $15/month Hetzner box.

#### Trade-offs / risks

- **Editor UX skews "database table" rather than "content blocks."** Marketing team may prefer Strapi's or Payload's content-first editor. Verify with TwinMOS Marketing Director before committing.
- **Smaller plugin ecosystem** than Strapi.
- **Schema-first discipline required.** Week 1 is slower (designing the schema), but weeks 5–60 are faster.
- **Markdown migration step required.** Same as Payload — need a script to import the 351 markdown files.
- **Vue vs React for AI-tooling.** Cursor / Copilot / Claude work fine with Vue but with less depth than React.

#### Effort estimate

| Phase | Realistic Effort | Team Capacity | Margin |
|-------|------------------|---------------|--------|
| Phase 1 | 35–45 person-weeks | 40 weeks | Tight at upper estimate |
| Phase 2 | 22–30 person-weeks (Directus Flows save time) | 32 weeks | Comfortable |
| Phase 3 | 35–55 person-weeks | 48 weeks | Adequate |
| **Total** | **92–130 person-weeks** | **120 person-weeks** | **Favorable** |

### Side-by-side: Category 1 options

| Dimension | Option 1A (Strapi + Astro) | Option 1B (Payload + Next.js) | Option 1C (Directus + Nuxt) |
|-----------|---------------------------|-------------------------------|----------------------------|
| Reads existing 351 .md files | ✅ Direct | ❌ Migration | ❌ Migration |
| Lighthouse default | **95–100** | 80–90 | 85–92 |
| Single repo / single deploy | ❌ (2 repos) | ✅ | ❌ (2 repos) |
| Editor UX for marketing | Excellent | **Best-in-class** | Good (database-table feel) |
| Catalog relational power | Good | Good | **Excellent (real SQL)** |
| Plugin ecosystem | **Largest (~500)** | Growing (~150) | Growing (~200) |
| TypeScript end-to-end | Yes | **Best** | Via SDK |
| 9-locale i18n | Configuration | Configuration | Configuration |
| Phase 2 partner portal | Better Auth + Strapi roles | Better Auth + Payload roles | **Directus permissions (zero code)** |
| Phase 3 e-commerce path | Medusa.js (mature) | Stripe / Medusa / Payload plugin | Medusa.js / Stripe |
| AI-tooling fit | Strong | **Best** | Strong (Vue limits depth slightly) |
| Hetzner backend cost | $10–15/mo | $20–40/mo (Vercel adds cost) | $10–15/mo |
| Total effort estimate (Phases 1+2+3) | **90–130 weeks** | 95–135 weeks | 92–130 weeks |
| Best for | Content-heavy, max Lighthouse, reuse markdown | Single-repo simplicity, TS-first team | Catalog complexity, no-code workflows |

---

## 7. CATEGORY 2 — Full Custom Development (Now Feasible)

> **What "Full Custom" means here:** No CMS — the team builds the admin UI, content models, role-based access, image pipeline, and editorial workflow from scratch using only frameworks and libraries (no boxed CMS product). License cost = $0. Engineering cost = +20–35 person-weeks vs Category 1 across the 15-month engagement.

**Honest framing:** Full custom **is feasible** at 2 developers × 15 months, but it remains the more expensive and slower path. Category 2 should be chosen only if there are explicit constraints that disqualify open-source CMSes (IP, regulatory, air-gap, very unusual content modeling).

### Option 2A: Next.js 15 + Hono + Drizzle (TypeScript-Native Custom)

**One-line summary:** *Single-language TypeScript stack. Build a compact admin SPA using shadcn/ui + TanStack Table; tRPC for internal API; Drizzle ORM for type-safe SQL; Better Auth for auth.*

#### Stack

| Layer | Choice |
|-------|--------|
| Frontend (public + admin) | Next.js 15 App Router |
| Backend API | **Hono** on Node.js or Bun (~62K req/s, 15 KB bundle) |
| Database | PostgreSQL 16 |
| ORM | **Drizzle ORM** (90% smaller bundle than Prisma; sub-500 ms cold starts) |
| Custom CMS | Build a small admin app: Next.js admin route + shadcn/ui + TanStack Table + react-hook-form |
| API style | tRPC (admin → frontend) + REST (distributors and external API) |
| Auth | Better Auth + RBAC (Editor/Admin/Author/Viewer/Partner) |
| Search | MeiliSearch or Typesense |
| Map | MapLibre + OSM |
| Image pipeline | Custom: Sharp library + S3-compatible storage |
| Forms | React Hook Form + Zod |
| i18n | next-intl + database-stored translations |
| E-commerce (Phase 3) | Stripe Checkout custom integration OR Medusa.js |
| DevOps | GitHub Actions + Docker + Coolify on Hetzner |
| Testing | Vitest (unit) + Playwright (E2E) + Storybook |

#### When this makes sense

- Unisoft team has very strong React + TypeScript expertise and prefers writing application code over learning a CMS.
- TwinMOS has unusual content-modeling needs that none of the boxed CMSes accommodate well.
- IP / regulatory constraints disqualify CMS dependencies.

#### Effort estimate

| Phase | Realistic Effort | Team Capacity | Margin |
|-------|------------------|---------------|--------|
| Phase 1 | 50–65 person-weeks (custom admin UI is the dominant cost) | 40 weeks | **Tight — Phase 1 likely slips by 2–3 months** |
| Phase 2 | 25–35 person-weeks | 32 weeks | Comfortable |
| Phase 3 | 40–60 person-weeks | 48 weeks | Adequate |
| **Total** | **115–160 person-weeks** | **120 person-weeks** | **Tight — recommend Category 1** |

### Option 2B: Astro + FastAPI + SQLAlchemy (Python-Strong Team)

**One-line summary:** *Static-first frontend (Astro) with a Python (FastAPI) backend handling API + admin via SQLAdmin or Starlette-Admin scaffold.*

#### Stack

| Layer | Choice |
|-------|--------|
| Frontend (public site) | Astro 5 (static-first; React/Svelte islands) |
| Backend (API + admin) | **FastAPI** (Python 3.13) |
| Database | PostgreSQL 16 |
| ORM | SQLAlchemy 2.x (async) |
| Admin UI | **SQLAdmin** or **Starlette-Admin** — auto-generated CMS-lite admin |
| API style | REST (OpenAPI auto-generated) + optional GraphQL via Strawberry |
| Auth | FastAPI Users (RBAC + JWT + OAuth2) |
| Search | MeiliSearch or Typesense |
| Map | Leaflet or MapLibre |
| Image pipeline | Pillow / pyvips + S3-compatible storage |
| Forms | Astro islands (React Hook Form) → FastAPI endpoints |
| i18n | Astro i18n routing + database-stored translations |
| E-commerce (Phase 3) | Saleor (Python OSS commerce) OR Stripe + custom |
| DevOps | GitHub Actions + Docker + Coolify on Hetzner |
| Testing | Pytest + Playwright |

#### When this makes sense

- Unisoft team has Python background and prefers Python for backend work.
- Phase 2/3 plans lean on Python ML/data tooling (e.g., anti-counterfeit fraud detection, data analytics).
- ETL / data-pipeline requirements outside the website itself.

#### Effort estimate

| Phase | Realistic Effort | Team Capacity | Margin |
|-------|------------------|---------------|--------|
| Phase 1 | 45–60 person-weeks | 40 weeks | Tight |
| Phase 2 | 22–32 person-weeks | 32 weeks | Comfortable |
| Phase 3 | 35–55 person-weeks (Saleor accelerates commerce) | 48 weeks | Adequate |
| **Total** | **102–147 person-weeks** | **120 person-weeks** | **Adequate** |

### Option 2C: SvelteKit + Go + sqlc (Maximum Performance, Maximum Cost)

**One-line summary:** *SvelteKit on the frontend (smallest runtime in the modern framework set) plus a Go backend (single static binary, sub-10 ms p99 latency). Operating cost in the $10–20/month range for production. Highest performance ceiling, highest custom code volume.*

#### Stack

| Layer | Choice |
|-------|--------|
| Frontend | SvelteKit 2 |
| Backend (API) | **Go** with Gin or Fiber |
| Database | PostgreSQL 16 |
| Data access | **sqlc** (generates type-safe Go code from SQL) |
| Admin UI | **Refine.dev** or **AdminJS** panel pointed at the Go API; OR a separate SvelteKit admin |
| API style | REST + OpenAPI; **Connect-RPC** for typesafe end-to-end |
| Auth | Custom JWT + RBAC, or Keycloak |
| Search | Typesense or MeiliSearch |
| Map | MapLibre or Leaflet |
| Image pipeline | Custom Go service using libvips + S3-compatible storage |
| E-commerce (Phase 3) | Custom Go service or Medusa.js as a separate Node service |
| DevOps | GitHub Actions; deploy Go binary on a $5/mo VPS |
| Testing | Vitest + Playwright (front) + Go testing + testcontainers (back) |

#### When this makes sense

- Unisoft team has Go expertise.
- TwinMOS expects very high traffic (millions of monthly visitors) and wants operating costs in the $20/month range.
- Long-term vision treats the website as one of many Go-backed services.

#### Effort estimate

| Phase | Realistic Effort | Team Capacity | Margin |
|-------|------------------|---------------|--------|
| Phase 1 | 55–70 person-weeks | 40 weeks | **Tight — Phase 1 likely slips** |
| Phase 2 | 25–35 person-weeks | 32 weeks | Comfortable |
| Phase 3 | 40–60 person-weeks | 48 weeks | Adequate |
| **Total** | **120–165 person-weeks** | **120 person-weeks** | **Borderline** |

### Side-by-side: Category 2 options

| Dimension | 2A Next + Hono + Drizzle | 2B Astro + FastAPI | 2C SvelteKit + Go |
|-----------|--------------------------|---------------------|---------------------|
| Languages | TypeScript only | Python + TypeScript | Go + TypeScript |
| Performance ceiling | High | Very high | **Highest** |
| Custom code volume | High | Medium-high | **Highest** |
| Editor experience | Custom-built | Auto-scaffolded (SQLAdmin) | Refine.dev or custom |
| AI-tooling fit | **Strong** | Strong | Weakest |
| Hosting cost | $20–40/mo | $15–30/mo | **$5–15/mo** |
| Total effort estimate | 115–160 weeks | 102–147 weeks | 120–165 weeks |
| Best for | TS-only purists | Python-strong teams | Maximum perf + min cost |
| **Recommended for TwinMOS** | **No** (Category 1 is faster) | **No** (Category 1 is faster) | **No** (Category 1 is faster) |

---

## 8. AI-Assisted Development as a Productivity Multiplier (Recommended)

A 2-developer team over 15 months **does not require** AI-assisted development to ship the project — but adopting it is strongly recommended because it directly extends the team's effective output and improves code quality at marginal cost.

### 8.1 Tooling Choice

| Tool | Strength | Recommended for TwinMOS? |
|------|----------|-------------------------|
| **GitHub Copilot** ($10/user/month) | Mature inline completion; Copilot Chat integrated into VSCode; low friction | ✅ **Default recommendation** for both developers |
| **Cursor IDE Pro** ($20/user/month) | AI-native fork of VSCode; multi-file refactors; agent mode | ✅ Optional supplementary tool for Team Lead |
| **Claude Code CLI** (paid via Anthropic API) | Most powerful agent loop; runs in terminal; cross-language | ✅ Optional for complex multi-file tasks |
| JetBrains AI Assistant | Excellent if team uses WebStorm | Optional |

**Recommendation:** Both developers run GitHub Copilot ($20/month total) as the baseline. Team Lead optionally adds Cursor IDE Pro for the more complex architecture and refactoring sessions.

### 8.2 Where AI Multiplies Productivity Most

| Task | AI multiplier | Notes |
|------|--------------|-------|
| Generating CMS collection / schema definitions from a spec | 3–5× | Feed the BRD §19 entity model; AI generates type-safe config |
| React component boilerplate (cards, tables, forms) | 2–3× | shadcn/ui + Tailwind = highly templatable |
| Page templates from Markdown frontmatter | 3–4× | 287 pages share 3–5 layouts |
| Vitest unit tests | 2–3× | Tests are highly templated |
| Playwright E2E tests | 2× | AI gets structure right; needs human review |
| Schema.org JSON-LD per page-type | 3–4× | Highly structured |
| Documentation (architecture, runbooks, content guides) | 3–5× | Drafts review faster than writing from blank |
| Refactoring across files | 2–3× | Cursor / Claude Code agents excel here |
| API client SDK generation from OpenAPI | 3–5× | OpenAPI → typed client |
| Translation prompt drafting (Phase 2) | 5–10× (with native-speaker review) | Pre-translation drafts then human review |

### 8.3 Where AI Underperforms (Watch For)

| Task | AI risk | Mitigation |
|------|---------|-----------|
| Architecture decisions | Generates plausible-but-wrong choices | Architecture decisions made by Team Lead, not AI |
| Security-sensitive code (auth, payments, secrets) | Subtle vulnerabilities | Both developers review security code; cite OWASP cheatsheets |
| Novel business logic (compatibility finder algorithm) | Doesn't understand TwinMOS-specific rules | Team specifies rules; AI implements |
| Performance optimization | Generic suggestions | Profile-driven; AI helps remediate specific findings |
| Accessibility nuance (focus order, ARIA live regions) | Often gets it wrong | axe-core in CI catches; manual NVDA testing confirms |
| Localization (Arabic RTL specifics) | Misses RTL edge cases | Native-speaker review mandatory in Phase 2 |

### 8.4 Daily AI Workflow Pattern (Per Developer)

| Time block | Activity | AI mode |
|------------|----------|---------|
| Morning standup (15 min) | Plan day's tasks; review yesterday's blockers | n/a |
| Block 1 (90 min) | High-cognitive-load task | AI as pair-programmer |
| Block 2 (90 min) | Boilerplate / templated work | AI agent autonomous |
| Lunch (45 min) | Off keyboard | n/a |
| Block 3 (90 min) | Code review, refactoring, tests | AI for diff review |
| Pair programming (60 min) | One developer drives, other reviews | AI assists driver |
| Block 4 (90 min) | Content authoring, documentation, deployment | AI as drafting partner |

This is ~7.5 hours of focused work per day, ~37.5 hours/week — well within a normal 40-hour work week. No crunch required.

### 8.5 Anti-Patterns to Avoid

- **Vibe-coding without tests** — AI-generated code without tests passes linting but breaks production. Tests in CI from week 1.
- **Accepting AI-generated security code without review** — auth, secrets, sanitization, CSP all require human review.
- **Using AI for novel architecture decisions** — Team Lead owns architecture; AI does not.
- **Skipping context-setting** — feed AI the BRD/URD excerpts, schema definitions, and conventions for accurate output.
- **Not running AI's output before commit** — always run, test, lint, type-check.

---

## 9. Cross-Option Comparison Matrix

| Criterion | 1A Strapi+Astro | 1B Payload+Next | 1C Directus+Nuxt | 2A Next+Hono+Drizzle | 2B Astro+FastAPI | 2C SvelteKit+Go |
|-----------|----------------|-----------------|-------------------|----------------------|------------------|------------------|
| **License cost** | $0 | $0 | $0 | $0 | $0 | $0 |
| **Phase 1 hosting** | $15–30/mo | $40–80/mo | $15–30/mo | $20–40/mo | $15–30/mo | $5–15/mo |
| **Phase 3 hosting (with e-commerce)** | $40–80/mo | $80–200/mo | $40–80/mo | $60–120/mo | $40–80/mo | $20–50/mo |
| **Reads existing 351 .md files** | ✅ Direct | ❌ Migration | ❌ Migration | ❌ Custom | ❌ Custom | ❌ Custom |
| **Lighthouse default** | **95–100** | 80–90 | 85–92 | 80–90 | 95–100 | 95–100 |
| **9-locale i18n** | Configuration | Configuration | Configuration | Custom DB | Custom DB | Custom DB |
| **Editor UX for marketing** | Excellent | **Best-in-class** | Good | Custom | Auto-scaffold | Custom |
| **Catalog relational fit** | Good | Good | **Excellent** | Excellent | Excellent | Excellent |
| **Plugin ecosystem** | **Largest** | Growing | Growing | n/a | n/a | n/a |
| **Single repo** | No | **Yes** | No | **Yes** | No | No |
| **TS end-to-end** | Yes | **Best** | Via SDK | **Best** | No | No |
| **Phase 2 partner portal** | Tractable | Tractable | **Easiest** | Custom | Custom | Custom |
| **Phase 3 e-commerce path** | Medusa.js mature | Multiple options | Medusa.js / Stripe | Custom or Medusa | Saleor mature | Custom or Medusa |
| **AI-tooling fit** | Strong | **Best** | Strong | **Best** | Strong | Weakest |
| **Effort (Phases 1+2+3)** | **90–130 weeks** | 95–135 weeks | 92–130 weeks | 115–160 weeks | 102–147 weeks | 120–165 weeks |
| **Team capacity (2 devs × 15 mo)** | 120 weeks | 120 weeks | 120 weeks | 120 weeks | 120 weeks | 120 weeks |
| **Margin** | **Comfortable** | Comfortable | Comfortable | **Tight** | Adequate | **Borderline** |
| **Probability of full delivery** | **~85–90%** | ~80–87% | ~78–85% | ~55–65% | ~60–70% | ~50–60% |
| **Recommended for TwinMOS** | ✅ **TOP PICK** | ✅ Strong runner-up | ✅ Conditional (Vue/data-first) | ❌ | ❌ | ❌ |

---

## 10. Hosting & Total Cost of Ownership (15 Months)

### 10.1 Recommended SaaS Stack (Option 1A — Strapi + Astro)

| Service | Plan | Monthly cost | Justification |
|---------|------|--------------|---------------|
| Hetzner CX32 VPS | Self-hosted backend (Strapi + Postgres + MeiliSearch + Plausible + ImgProxy via Coolify) | $13/mo | One VPS hosts the whole backend stack |
| Cloudflare Pages or Netlify | Free tier (Pro at Phase 2) | $0 → $19/mo | Frontend hosting + preview deploys |
| Backblaze B2 | Object storage for media + backups | $1–5/mo | ~$0.005/GB |
| GitHub | Team plan | $4/user × 2 = $8/mo | Private repo, Actions minutes, CODEOWNERS |
| Sentry | Developer (free) → Team ($26/mo at Phase 2) | $0 → $26/mo | Error monitoring |
| UptimeRobot | Free | $0 | 50 monitors |
| GitHub Copilot | Per developer | $10 × 2 = $20/mo | Recommended productivity multiplier |
| Domain + DNS | (existing) | n/a | TwinMOS.com retained |
| Resend | Free tier (Phase 1) → Pro $20/mo (Phase 2) | $0 → $20/mo | Transactional email |
| Translation vendor (Phase 2 + Phase 3) | One-time per language | ~$3,000–8,000 per locale | AR/BN/HI in Phase 2; RU/ZH/FR in Phase 3 |
| Penetration test (annual) | One-time per year | ~$3,000–8,000 | Pre-launch + recurring |
| **Phase 1 monthly total** | | **~$45–60/mo** | |
| **Phase 2 monthly total** | | **~$90–120/mo** | |
| **Phase 3 monthly total** | | **~$130–200/mo** (e-commerce traffic + features) | |

### 10.2 15-Month TCO

| Item | Estimated 15-Month Cost |
|------|-------------------------|
| Infrastructure / SaaS / hosting | ~$1,500–2,500 |
| AI-tooling subscriptions (GitHub Copilot, Cursor for Lead) | ~$450–750 |
| Translation vendor (AR + BN + HI in Phase 2; RU + ZH + FR in Phase 3) | ~$18,000–48,000 |
| Penetration test (pre-Phase-1 + annual recurring) | ~$3,000–8,000 |
| **Total non-engineering cost (15 months)** | **~$23,000–60,000** |
| **Unisoft engineering cost (2 devs × 15 months)** | Per commercial agreement |

The infrastructure/SaaS/AI-tooling line is a small fraction of the engineering investment — the recommendation across all six stack options is to prioritize developer time over infrastructure thrift.

### 10.3 Self-Hosted vs Managed Trade-Off

For this 2-developer team across 15 months, the **hybrid approach is recommended**:

- **Frontend:** managed platform (Netlify / Cloudflare Pages / Vercel) — preview deploys, edge network, no ops
- **Backend stack:** self-hosted on Hetzner via Coolify — one VPS, full control, lowest cost, modest ops burden (~5–10 hours/month at this team size)

This gives the team control where it matters (database, search, CMS, analytics) and offloads platform-toil where it doesn't (CDN, SSL, build pipelines).

---

## 11. Enterprise-Quality Non-Negotiables

Each item below must be in place by Phase 1 launch and maintained through Phases 2 and 3.

### 11.1 Performance

| Requirement | How the team delivers it |
|-------------|--------------------------|
| Lighthouse Performance ≥ 90 (every page) | Lighthouse CI in pipeline; fail PR if score < 90 |
| LCP ≤ 2.0 s | Hero images preloaded; font subsetting; ISR / static generation |
| CLS ≤ 0.1 | All images and videos have explicit width/height; reserved layout space |
| INP ≤ 200 ms | Avoid heavy JS on critical path; defer non-essential third-party scripts |
| TTFB ≤ 200 ms | Edge network; ISR / static generation for content pages |

### 11.2 Accessibility (WCAG 2.1 AA)

| Requirement | How the team delivers it |
|-------------|--------------------------|
| Keyboard navigation | Tested on every PR; no mouse-only interactions |
| Screen-reader correctness | axe-core in CI on every PR + monthly NVDA / VoiceOver pass |
| Color contrast 4.5:1 | Tailwind tokens enforce in design system; manual review on hero / CTA components |
| Focus indicators | Visible 2 px outline on all interactive elements |
| Skip links | Implemented in week 2 (header component) |
| Form errors | aria-live regions; inline errors with aria-describedby |

### 11.3 Security

| Requirement | How the team delivers it |
|-------------|--------------------------|
| TLS 1.3 + HSTS | Platform default; HSTS preload header configured |
| Content Security Policy | Strict CSP from week 1; tightened weekly |
| Secrets management | Environment variables; never committed; rotation runbook |
| OWASP Top 10 | Dependabot + Snyk free for dependencies; OWASP ZAP scan in CI weekly |
| Form spam protection | reCAPTCHA v3 / Cloudflare Turnstile on all public forms |
| Rate limiting | Cloudflare or Upstash Ratelimit on API routes |
| Authentication | Better Auth / Strapi auth with MFA-ready foundation; Phase 2 enables MFA for partner portal |
| Input validation | Zod schemas on every form/API route |
| Output encoding | React/Vue/Astro auto-escaping; CSP enforces additional layer |
| Penetration test | Pre-Phase-1 launch + annual recurring + after major Phase 3 e-commerce go-live |

### 11.4 Compliance

| Requirement | How the team delivers it |
|-------------|--------------------------|
| GDPR consent | Cookie banner from day 1; granular consent UI; consent stored per user |
| UAE / India / KSA DPL | Same flows; jurisdiction-specific policy text |
| Data deletion request | Form in `/legal/data-deletion-request/`; processed via email → Legal team |
| Right to erasure (Art. 17) | Workflow documented; manual processing in Phase 1; semi-automated in Phase 3 |
| Cookie consent persistence | localStorage + cookie fallback; respected by analytics scripts |
| ESG disclosures | Modern Slavery, Conflict Minerals, Vendor Code of Conduct, Supply Chain Disclosure all published with Last Updated dates and annual refresh |

### 11.5 Observability

| Requirement | How the team delivers it |
|-------------|--------------------------|
| Error monitoring | Sentry from week 1; alerts to email + Slack |
| Real-user monitoring | Platform-built RUM + Plausible page-load metrics |
| Uptime checks | UptimeRobot 5-minute checks from 3 regions |
| CMS audit log | Strapi/Payload built-in audit logs; reviewed weekly |
| Synthetic monitoring | Lighthouse CI in pipeline + scheduled weekly Lighthouse runs in production |

### 11.6 Testing

| Requirement | How the team delivers it |
|-------------|--------------------------|
| Unit tests | Vitest; all business logic; AI-assisted scaffolds, human-reviewed assertions |
| API integration tests | Playwright API testing or supertest |
| E2E tests | Playwright; cover compatibility-finder, where-to-buy, contact-form, warranty-registration, RMA submission, partner-portal login, e-commerce checkout (Phase 3) |
| Cross-browser | BrowserStack regular weekly bursts; Chrome / Safari / Samsung Internet / Firefox / Edge |
| Coverage target | Critical path 100%; overall ≥ 70% by Phase 1 launch; ≥ 80% by Phase 3 launch |
| Pre-commit hooks | Husky + lint-staged: lint, type-check, related tests |

### 11.7 Documentation

| Document | Owner | Delivered by |
|----------|-------|--------------|
| Architecture overview (ADRs) | Team Lead | Continuous (per decision) |
| Deployment runbook | Team Lead | Phase 1 Week 14 |
| Content publishing guide for marketing | Dev B | Phase 1 Week 16 |
| RMA workflow guide | Dev B | Phase 2 (when activated) |
| Incident response runbook | Team Lead | Phase 1 Week 17 |
| Backup / restore runbook | Team Lead | Phase 1 Week 17 |
| Developer onboarding | Both | Phase 1 Week 18 |
| Partner portal admin guide | Dev B | Phase 2 |
| E-commerce admin guide | Dev B | Phase 3 |

### 11.8 Disaster Recovery

| Requirement | How the team delivers it |
|-------------|--------------------------|
| RTO ≤ 4 hours | Documented restore procedure; daily DB backups to Backblaze B2; runbook tested |
| RPO ≤ 15 minutes | WAL streaming or Neon point-in-time recovery |
| DR drill | Run before each phase launch (Months 5, 9, 15); document outcome |

---

## 12. 15-Month Multi-Phase Delivery Plan (Phases 1–3)

### Overview

| Phase | Months | Goal |
|-------|--------|------|
| **Phase 1 — Core Website** | **1–5** | Public launch with all 16 sections, 287 content pages, 100+ SKUs, 28 regional pages, EN locale, all 34 legal pages, catalog with dual-axis, where-to-buy, forms, KB, gaming hub static, full SEO + accessibility + performance + security + observability |
| **Phase 2 — Localization & Partner Enablement** | **6–9** | AR/BN/HI translation launch, partner portal full activation, RMA portal full workflow, anti-counterfeit SN-Check, live chat, gaming hub interactive features, compatibility finder full algorithm |
| **Phase 3 — Commerce & Advanced Features** | **10–15** | E-commerce MVP, RU/ZH/FR translation launch, advanced analytics & marketing automation, loyalty/referral programs, MDF program, SSD management software placeholder |

### 12.1 PHASE 1 — Months 1–5 (Core Website)

#### Month 1 — Foundation

**Weeks 1–2: Setup & Architecture**
- Stack selected and locked (Option 1A recommended)
- Repos scaffolded; CI/CD baseline running
- Docker Compose local stack: Astro + Strapi + Postgres + MeiliSearch + ImgProxy
- Hetzner VPS provisioned with Coolify
- Tailwind + design tokens per URD §20
- Site-wide components skeleton: header, footer, cookie banner, language selector, breadcrumb, search, 404, 500, maintenance, skip links
- ADR-001 (stack), ADR-002 (architecture), ADR-003 (folder structure) committed
- Sentry + Plausible + UptimeRobot wired

**Weeks 3–4: Content Modeling**
- Strapi collections modeled per BRD §19 (Product, SKU, Brand, Category, Subcategory, Retailer, Distributor, NewsArticle, Event, KBArticle, Page, MenuItem, FormSubmission, ContentBlock variants, Asset, Country/Region)
- Astro Content Collections schema (Zod) defined for: blog posts, KB articles, technology articles, learn-hub content, regional landings, legal pages, brand pages, solutions pages
- Migration script: 351 markdown files mapped to Astro Content Collections
- Page-template prototypes for the 5 layouts (Hero+Body+CTA, Spec+Gallery, Article, Form, Locator)

#### Month 2 — Content Production

**Weeks 5–8: Content & Templates**
- All 287 content pages routed via Astro Content Collections + Strapi-driven dynamic content
- All 17 About pages
- All 14 Gaming Hub static pages
- All 14 Technology / R&D pages
- All 64 Learn Hub pages (buying guides, explained, benchmarks, glossary, stories, blog)
- All 11 Solutions pages
- All 11 Marketing pages
- All 10 Careers pages
- All 16 Contact pages
- All 19+ News & Events pages (with templates for ongoing content)
- All 28 Regional landing pages (EN content; locale stubs)
- 11 Brand pages (already authored — link to existing content from `06-brands/`)
- 100+ SKU detail pages from `_master-sku-reference.md`
- All 34 Legal & Compliance pages

#### Month 3 — Application Surfaces

**Weeks 9–12: Custom Logic**
- Catalog with dual-axis navigation (category × brand)
- Filtering and sorting on category pages (MeiliSearch faceting)
- Product Detail Pages with dynamic specs, gallery, datasheet PDF link, "Where to Buy" CTA, related products
- Product Comparison tool (up to 4 products, highlighted differences, shareable URL)
- Where-to-Buy Locator with Leaflet + retailer cards; country auto-detect; manual override; filter by retailer type
- All multi-type contact forms with auto-routing (general, sales, technical support, distributor, OEM/ODM, quote, media, warranty, feedback, newsletter)
- Newsletter signup with double opt-in (Resend)
- Warranty Registration form with serial validation + Strapi storage + auto-confirmation email
- Compatibility Finder MVP (search by laptop/desktop brand+model OR motherboard; results page with placeholder QVL data for top 100 motherboards; full QVL algorithm deferred to Phase 2)
- Knowledge Base with MeiliSearch + "Was this helpful?" rating + FAQ accordion + install guides
- Gaming Hub static pages (interactive RGB visualizer placeholder for Phase 2)
- Anti-Counterfeit SN-Check page placeholder ("Coming Soon — Phase 2" with email capture)
- RMA Request form placeholder (data capture; full status tracker deferred to Phase 2)
- Firmware Download List page (no serial validation yet — Phase 2)
- Distributor Application form
- Partner Portal login skeleton (placeholder — full activation in Phase 2)

#### Month 4 — Localization, Polish, Quality Gates

**Weeks 13–16: Quality Pass**
- 9-locale framework configured (Strapi i18n + Astro i18n routing); EN populated; AR/BN/HI/RU/ZH/FR/ES/PT/DE empty stubs ready for translation
- RTL framework verified for Arabic (CSS direction, mirrored layouts, Noto Sans Arabic font)
- All hreflang tags + XML sitemap auto-generation
- Schema.org structured data per page-type (Product, Article, Organization, BreadcrumbList, FAQ, Event)
- Performance pass: image budgets, font subsetting, third-party script audit, route-level code splitting — every page hits Lighthouse ≥ 90
- Accessibility pass: full axe-core review, manual NVDA/VoiceOver test on top 30 pages, fix all WCAG 2.1 AA violations
- Security pass: ZAP scan green, dependency vulnerabilities resolved, CSP tightened, rate limits applied, third-party penetration test scheduled
- Cross-browser QA: Chrome, Safari (iOS + macOS), Samsung Internet, Firefox, Edge — all green
- Mobile device QA on real devices

#### Month 5 — Stabilization & Launch

**Weeks 17–18: Pre-Launch**
- CMS training session for TwinMOS Marketing (recorded video + written guide)
- Runbooks completed: deployment, incident response, RMA workflow placeholder, content publishing, backup/restore, developer onboarding
- DR drill executed; RTO ≤ 4 h verified
- Load test (k6 free tier) at 5,000 concurrent users; bottlenecks resolved
- Third-party penetration test executed; findings remediated
- UAT with TwinMOS stakeholders (3-day window + 3 days for fixes)
- Soft launch to limited audience (TwinMOS staff, key distributors)

**Weeks 19–20: Public Launch + Phase 1 Hypercare**
- DNS cutover; production live
- Monitoring alerts active
- Daily metrics review for first 14 days
- Phase 1 retro with TwinMOS sponsor
- Phase 2 sprint plan locked

### 12.2 PHASE 2 — Months 6–9 (Localization & Partner Enablement)

#### Month 6 — Translation Foundation & Partner Portal

- Translation vendor engaged for AR / BN / HI; delivery plan agreed
- Partner Portal: Better Auth + Strapi roles fully wired; Distributor / OEM-ODM / System Builder / Reseller programs published
- Partner asset library (co-branded banners, datasheets, logos, POS materials)
- Partner price list module (gated, watermarked PDF/Excel export)
- Anti-counterfeit SN-Check fully activated: Strapi `valid_serials` collection populated from manufacturing daily ingest; lookup tool live
- Public-facing counterfeit policy paired across `/support/counterfeit-policy/` and `/legal/counterfeit-policy/`

#### Month 7 — RMA Portal & Compatibility Finder

- RMA Portal full workflow: form → warranty check → RMA number → status tracker (Submitted → Approved → Ship → Received → Testing → Replacement Shipped → Closed) → email notifications at each stage
- Compatibility Finder full algorithm: QVL data ingested for top 500 motherboards / laptop models / desktop models; "by laptop/desktop", "by motherboard", "from product page" all wired
- Firmware Download Center with serial validation gate + checksum display + warning banner

#### Month 8 — Live Chat & Gaming Interactive

- Live Chat: Chatwoot self-hosted on Hetzner; Astro widget integration; agent routing; offline-mode email capture; chat-transcript email
- Gaming Hub interactive: RGB visualizer (interactive lighting presets); Build Gallery + Submission form with moderation queue; sync compatibility badges (Aura Sync / RGB Fusion / Mystic Light / Polychrome)

#### Month 9 — Localization Launch & Phase 2 Stabilization

- AR / BN / HI translations imported into Strapi
- RTL layout verified across all 287 pages
- Locale-specific testing (NVDA/VoiceOver in Arabic; native-speaker review in BN and HI)
- Phase 2 DR drill
- Phase 2 penetration test (delta from Phase 1)
- UAT with TwinMOS stakeholders
- Phase 2 launch (multi-language go-live)
- Phase 2 retro; Phase 3 sprint plan locked

### 12.3 PHASE 3 — Months 10–15 (Commerce & Advanced Features)

#### Months 10–11 — E-Commerce Foundation

- E-commerce stack decision (Stripe Checkout vs Medusa.js) finalized in ADR
- E-commerce schema modeled in Strapi (orders, customers, payments, shipping, tax)
- Stripe / Medusa integration wired
- Cart UI, checkout flow, order confirmation, payment success/failure pages
- Customer accounts (using Better Auth foundation from Phase 2)
- Tax/shipping rules per region (UAE, India, KSA, Bangladesh as initial markets)
- Terms of Sale legal page activated

#### Month 12 — E-Commerce Hardening + RU/ZH/FR Translation

- E-commerce security pass (PCI considerations, fraud rules, rate limits on checkout)
- E-commerce performance pass (cart performance, checkout LCP)
- Order management admin UI (Strapi)
- Email templates for order lifecycle (Resend)
- Translation vendor engaged for RU / ZH / FR; delivery in Month 12

#### Month 13 — Advanced Analytics & Marketing Automation

- PostHog OSS self-hosted (session replay, feature flags, A/B testing)
- Marketing automation: cross-sell banners, exit-intent popup, abandoned cart email, post-purchase email
- Customer Data Platform integration (if TwinMOS uses one — e.g., HubSpot)
- Advanced reporting dashboards for Marketing team

#### Month 14 — Loyalty / Referral / MDF Programs

- Loyalty program: points-per-purchase, tier system, redemption flow
- Referral program: invite-a-friend with discount codes
- MDF (Marketing Development Funds) program for distributors: claim form, approval workflow, fund allocation tracking
- Distributor success stories published as case studies

#### Month 15 — Phase 3 Launch + Engagement Wrap

- RU / ZH / FR translations imported
- Phase 3 DR drill
- Phase 3 penetration test
- UAT with TwinMOS stakeholders
- Phase 3 launch (e-commerce go-live + 3 new locales + advanced features)
- Phase 4 handoff package: open documentation, Phase 4 backlog (ES/PT/DE locales, ongoing CRO/SEO), retainer-engagement scope
- Final retro with TwinMOS sponsor
- Engagement closeout

### 12.4 What Slips First (Pre-Mortem)

If the schedule binds on any phase, the order in which work is cut to preserve enterprise quality on the remainder is:

| Cut order | Phase | Item | Risk if cut |
|-----------|-------|------|-------------|
| 1st | Phase 3 | MDF program (defer to Phase 4 retainer) | Low — recoverable |
| 2nd | Phase 3 | Loyalty / Referral programs | Low — recoverable |
| 3rd | Phase 3 | RU/ZH/FR translation launch (slip 1–2 months) | Medium |
| 4th | Phase 2 | Gaming Hub full RGB visualizer (ship CSS-only fallback) | Low |
| 5th | Phase 2 | Live chat full agent routing (ship offline-mode email-only) | Medium |
| 6th | Phase 1 | Compatibility Finder full algorithm at launch (ship MVP per plan; full in Phase 2) | Already planned |

This pre-mortem is recorded so that when the schedule binds, decisions happen in priority order rather than ad hoc.

---

## 13. Final Recommendation

### Stack: Option 1A — Strapi v5 + Astro 5

**Reasoning:**

1. **The 351 existing markdown files become routes immediately** via Astro Content Collections. Saves 4–8 weeks of content migration work — drops Phase 1 effort straight into the favorable end of the capacity range.
2. **Lighthouse 95+ default** — the BRD performance bar is met without engineering heroics, freeing Phase 1 time for application surfaces and Phase 2/3 features.
3. **Largest plugin ecosystem** in headless CMS (~500 plugins). Many TwinMOS needs are plugin-installs, not custom code.
4. **Strapi v5 i18n in core** + Astro i18n routing handles 9 locales (EN at Phase 1; AR/BN/HI at Phase 2; RU/ZH/FR at Phase 3) as configuration.
5. **Phase 3 e-commerce path is well-trodden** — Medusa.js + Astro storefront is a proven combination.
6. **Two-repo architecture splits cleanly between two developers** — Dev A leads Astro frontend, Dev B leads Strapi backend. Pair-programming sessions ensure shared context.
7. **Self-hosted backend on a single Hetzner VPS** ($13/month) hosts the entire backend stack; modest ops burden at this team size.
8. **Total estimated effort 90–130 person-weeks across 15 months** vs 120 person-weeks team capacity — favorable margin with reasonable working hours.

### Probability Profile

| Outcome | Probability |
|---------|-------------|
| Phase 1 launch on Month 5 at full scope, enterprise quality | **80–88%** |
| Phase 1+2 complete on Month 9 at full scope, enterprise quality | **78–85%** |
| **Phase 1+2+3 complete on Month 15 at full scope, enterprise quality** | **80–90%** |
| Slip of 1–2 months on any single phase | ~12–18% |
| Slip of 3+ months across phases | ~3–8% |

This is a healthy, professional-grade engagement profile. The plan does not require crunch, weekend work, or shortcut decisions on quality.

### Strong Runner-Up: Option 1B — Payload v3 + Next.js 15

**Pick this over 1A if:** the team strongly prefers React + TypeScript end-to-end; values single-repo / single-deploy operational simplicity over Astro's Lighthouse advantage and existing-markdown reuse. Probability profile is similar (~80–87%).

### Conditional: Option 1C — Directus + Nuxt 3

**Pick this only if:** the team is Vue-strong AND TwinMOS's catalog/compatibility relational complexity is the project's hardest problem AND the marketing team is comfortable with a database-table editor UX.

### Do NOT pick Category 2 unless

- TwinMOS imposes IP / regulatory constraints disqualifying open-source CMSes
- The team has very specific reasons (Python-strong, Go-strong, etc.)

Category 2 options are now feasible at 2-dev × 15 months, but Category 1 ships in less time with less risk.

---

## 14. Implementation Kickoff Checklist

### Week 0 (Pre-Kickoff — 3–5 days)

- [ ] Both Unisoft developers read RFP v3.0, BRD v3.0, URD v3.0, Content Map v1.0, this document
- [ ] Stack selected: Option 1A (Strapi + Astro) recommended — sign off this document
- [ ] GitHub private repos provisioned (one for Astro frontend, one for Strapi backend); both devs have access
- [ ] Hetzner VPS provisioned with Coolify
- [ ] Netlify / Cloudflare Pages account provisioned for frontend
- [ ] Backblaze B2 bucket created for object storage
- [ ] Domain DNS access confirmed
- [ ] All SaaS accounts: Sentry, UptimeRobot, GitHub Copilot (optional Cursor for Lead), Plausible (self-hosted decision)
- [ ] Linux workstations imaged with VSCode + extensions + Docker + Node.js LTS / pnpm / Bun
- [ ] PostgreSQL 16 local instance running (Docker Compose)
- [ ] Decision recorded: React for Astro islands
- [ ] CI/CD baseline: GitHub Actions skeleton (lint + test + build + deploy preview)
- [ ] Content Map reviewed; 287 entries assigned phase flags (P1 / P2 / P3 / P4) per BRD §28.1
- [ ] TwinMOS PM commits to bi-weekly demos and 24-hour decision turnaround on blockers
- [ ] Backup developer (Unisoft bench) identified for vacation/illness coverage

### Sprint 0 — Foundation (Weeks 1–2)

- [ ] Astro repo scaffolded; Strapi repo scaffolded
- [ ] Docker Compose stack: Astro + Strapi + Postgres + MeiliSearch + ImgProxy running locally on both workstations
- [ ] Strapi content types modeled (Product, SKU, Brand, Category, Subcategory, Retailer, Distributor, NewsArticle, Event, KBArticle, Page, MenuItem, FormSubmission, etc.)
- [ ] Astro Content Collections schema (Zod) defined
- [ ] Site-wide components skeleton: header, footer, cookie banner, language selector, breadcrumb, search, 404, 500, maintenance, skip links
- [ ] Tailwind configured with TwinMOS design tokens (per URD §20)
- [ ] CI: lint + test + build pipeline green on `main` for both repos
- [ ] Lighthouse CI integrated; baseline scores recorded
- [ ] Sentry connected; first preview deployment live
- [ ] First demo to TwinMOS at end of Sprint 0: deployed staging URL + Strapi admin walkthrough

### Throughout the Project

- [ ] Daily 15-minute standup (async-friendly)
- [ ] Bi-weekly sprint planning (90 min) and review (60 min)
- [ ] CI must remain green; no merging on red
- [ ] Lighthouse CI threshold ≥ 90 enforced from Month 4
- [ ] axe-core threshold "no critical/serious findings" enforced from Sprint 0
- [ ] ZAP scan threshold "no high/critical" enforced from Month 3
- [ ] Pre-mortem cuts per §12.4 triggered ONLY by missed milestones, not panic
- [ ] All ADRs committed to `/docs/adr/`
- [ ] Phase-end reviews with sponsor at Months 5, 9, 15

---

## 15. Appendix A — Tooling Inventory by Layer

### Recommended Stack (Option 1A — 2 Devs / 15 Months)

| Layer | Tool | Role |
|-------|------|------|
| IDE | VSCode + GitHub Copilot (both devs) + Cursor IDE Pro (optional, Team Lead) | AI-assisted development environment |
| Frontend | Astro 5 with React islands | Static-first; Lighthouse 95+ default |
| CMS | Strapi v5.1+ | Largest plugin ecosystem |
| Database | PostgreSQL 16 (self-hosted on Hetzner) | Strapi backend |
| Search | MeiliSearch (self-hosted on Hetzner) | Multilingual + Arabic-friendly |
| Map | Leaflet + OpenStreetMap raster (Phase 1) → MapLibre + vector tiles (Phase 2 if upgraded) | Locator |
| Image pipeline | ImgProxy (self-hosted) + Astro Sharp | Transforms + delivery |
| Object storage | Backblaze B2 | Media + backups |
| Forms | React Hook Form + Zod + Strapi collections + Resend | End-to-end form workflow |
| i18n | Strapi v5 i18n + Astro i18n routing | 9 locales |
| Auth (admin) | Strapi built-in | Admin / editor / author / viewer |
| Auth (partner portal Phase 2) | Better Auth | Modern OSS auth |
| Spam protection | Cloudflare Turnstile | Public form gate |
| Live chat (Phase 2) | Chatwoot (self-hosted) | Agent routing |
| E-commerce (Phase 3) | Medusa.js (self-hosted) + Stripe | OSS commerce platform |
| Analytics | Plausible (self-hosted) → PostHog (Phase 3 for session replay + flags) | Cookieless RUM + product analytics |
| Monitoring | Sentry + Vercel/Netlify Analytics + UptimeRobot | Errors + RUM + uptime |
| CI/CD | GitHub Actions + Netlify/Cloudflare Pages auto-deploy | Full pipeline |
| Hosting (frontend) | Netlify or Cloudflare Pages | Edge network |
| Hosting (backend stack) | Hetzner VPS via Coolify | Self-hosted Strapi + Postgres + MeiliSearch + ImgProxy + Plausible + Chatwoot + Medusa.js |
| Quality gates | Lighthouse CI + axe-core + Playwright + Vitest + ZAP + Snyk + Dependabot | Automated in pipeline |
| Pre-commit | Husky + lint-staged + Conventional Commits | Local gate |
| Documentation | TypeDoc + Markdown ADRs + Storybook (optional) | Architecture + runbooks |

---

## 16. Appendix B — Risk Register (15-Month Engagement)

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|-----------|--------|-----------|
| RISK-1 | Phase 1 effort hits the upper estimate (40 weeks); team capacity strained | Medium | Medium | Markdown reuse + content templating + AI assistance keep effort at lower end; pre-mortem cuts available |
| RISK-2 | One developer absent ≥ 2 weeks (illness, family emergency) | Medium | Medium | Both devs commit code daily; ADRs ensure continuity; Unisoft backup developer identified at start |
| RISK-3 | Lighthouse score < 90 on certain pages | Low | Medium | Astro default is 95+; Lighthouse CI enforces in pipeline |
| RISK-4 | WCAG 2.1 AA findings discovered late | Low | High | axe-core in CI from Sprint 0; not deferred |
| RISK-5 | Marketing team rejects Strapi editor UX | Low | High | Demo Strapi to Marketing Director Week 0; Payload (Option 1B) is fallback |
| RISK-6 | Translation vendor delivers late (Phase 2 / 3) | Medium | Medium | Engage vendor by Phase 1 Week 12; staged delivery; English fallback |
| RISK-7 | Compatibility Finder QVL data not ready in Phase 2 | Medium | Medium | Begin QVL data collection in Phase 1; Product team owner assigned |
| RISK-8 | Strapi performance degrades with 100k+ entries | Low | Medium | Add Redis caching layer (Phase 2); standard practice |
| RISK-9 | Hetzner outage | Very Low | Medium | Daily backups to Backblaze B2; documented restore; RTO ≤ 4 h verified by drill |
| RISK-10 | Open-source CMS abandoned | Very Low | High | Strapi has active corporate backing as of April 2026 |
| RISK-11 | TwinMOS PM unable to provide 24-h decision turnaround | Medium | Medium | Make turnaround a contract precondition; queue decisions weekly if it slips |
| RISK-12 | Content authoring (TwinMOS marketing team) lags developer pace | Medium | Medium | Front-load content templates; CMS training Week 16; marketing team self-serves from Phase 1 launch onward |
| RISK-13 | Phase 3 e-commerce introduces unforeseen scope (PCI, fraud, tax) | Medium | High | Stripe Checkout shifts most PCI burden; Medusa handles fraud rules; tax via TaxJar / Stripe Tax |
| RISK-14 | Penetration test reveals critical vulnerabilities late | Low | High | Weekly OWASP ZAP from Month 3; pen-test pre-Phase-1 launch; remediation buffer in schedule |
| RISK-15 | RU/ZH/FR translation quality issues | Medium | Medium | Native-speaker review mandatory; staged QA |
| RISK-16 | Phase 3 traffic exceeds Hetzner CX32 capacity | Low | Medium | Upgrade to CX42 at Phase 3 (~$25/mo); horizontal scale via Coolify if needed |
| RISK-17 | Vendor lock-in on Strapi or Astro | Very Low | Low | Open-source; data export available; migration paths documented |
| RISK-18 | AI-tooling output introduces subtle bugs | Low | Medium | Test coverage policy; both devs review AI code before commit; security-sensitive code receives extra review |

---

## 17. Appendix C — Sources & References

- [Headless CMS Showdown: Strapi vs Payload vs Directus in 2026 — DSRPT](https://www.dsrpt.com.au/think-tank/headless-cms-showdown-strapi-vs-payload-vs-directus-in-2026)
- [Payload vs Strapi vs Directus: Best Headless CMS (2026) — BuildPilot](https://trybuildpilot.com/665-payload-vs-strapi-vs-directus-2026)
- [Headless CMS Comparison 2026: Strapi vs Directus vs Payload — dasroot.net](https://dasroot.net/posts/2026/01/headless-cms-comparison-strapi-directus-payload/)
- [Strapi vs Directus vs Payload: Headless CMS Showdown — Glukhov](https://www.glukhov.org/post/2025/11/headless-cms-comparison-strapi-directus-payload/)
- [Why Payload Is the Best Headless CMS for Next.js 2026 — Build with Matija](https://www.buildwithmatija.com/blog/best-headless-cms-nextjs-payload-2026)
- [Payload CMS 3.81.0: What Changed — Brad Farleigh](https://www.bradfarleigh.com/2026/04/payload-cms-3-81-0-whats-new-nextjs/)
- [Payload CMS GitHub](https://github.com/payloadcms/payload)
- [Payload Website Template — GitHub](https://github.com/payloadcms/payload/tree/main/templates/website)
- [Payload Localization Docs](https://payloadcms.com/docs/configuration/localization)
- [Strapi 5 i18n Guide](https://strapi.io/blog/strapi-5-i18n-complete-guide)
- [Directus Security & Compliance](https://directus.io/security)
- [Nuxt vs Next.js vs Astro vs SvelteKit: 2026 Frontend Showdown](https://www.nunuqs.com/blog/nuxt-vs-next-js-vs-astro-vs-sveltekit-2026-frontend-framework-showdown)
- [Astro vs Next.js: When to Use Which 2026 — PkgPulse](https://www.pkgpulse.com/guides/astro-vs-nextjs-2026)
- [Web Frameworks Guide 2026 — Astro vs Next.js vs Nuxt vs Remix](https://www.luckymedia.dev/insights/web-frameworks)
- [Strapi vs Directus | Headless CMS Platforms 2026 — SelectHub](https://www.selecthub.com/headless-cms-platforms/strapi-vs-directus/)
- [next-intl Tutorial 2026 — IntlPull](https://intlpull.com/blog/next-intl-complete-guide-2026)
- [Astro Internationalization (i18n) in 2026 — Mavik Labs](https://www.maviklabs.com/blog/internationalization-astro-2026/)
- [Meilisearch vs Typesense vs Elasticsearch 2026 — OSSAlt](https://ossalt.com/blog/meilisearch-vs-typesense-vs-elasticsearch-search-2026)
- [Mapbox vs Leaflet vs MapLibre 2026 — PkgPulse Guides](https://www.pkgpulse.com/guides/mapbox-vs-leaflet-vs-maplibre-interactive-maps-2026)
- [MapLibre GL JS vs. Leaflet — Jawg Blog](https://blog.jawg.io/maplibre-gl-vs-leaflet-choosing-the-right-tool-for-your-interactive-map/)
- [Vercel vs Self-Hosted Coolify Cost Comparison — MassiveGRID](https://massivegrid.com/blog/vercel-vs-self-hosted-coolify-cost-comparison/)
- [Coolify vs Vercel: The Self-Hosting Tax — Autonoma](https://getautonoma.com/blog/coolify-vs-vercel)
- [Dokploy vs Coolify — srvrlss](https://www.srvrlss.io/blog/coolify-v-dokploy-v-digitalocean/)
- [Coolify vs Dokploy: Self-Hosted PaaS Compared 2026 — NextGrowth](https://nextgrowth.ai/coolify-vs-dokploy/)
- [Drizzle vs Prisma ORM in 2026 — MakerKit](https://makerkit.dev/blog/tutorials/drizzle-vs-prisma)
- [Hono vs Express vs Fastify vs Elysia 2026 — PkgPulse](https://www.pkgpulse.com/blog/hono-vs-express-vs-fastify-vs-elysia-2026)
- [Top 5 NextAuth alternatives 2026 — WorkOS](https://workos.com/blog/top-nextauth-alternatives-secure-authentication-2026)
- [better-auth vs Lucia vs NextAuth 2026 — PkgPulse](https://www.pkgpulse.com/blog/better-auth-vs-lucia-vs-nextauth-2026)
- [Best Next.js Auth Solutions 2026 — PkgPulse](https://www.pkgpulse.com/blog/best-nextjs-auth-solutions-2026)
- [Self-Hosted Web Analytics 2026 — OpenPanel](https://openpanel.dev/articles/self-hosted-web-analytics)
- [Setting Up Self-Hosted Analytics — Coders Stop](https://medium.com/@coders.stop/setting-up-self-hosted-analytics-posthog-plausible-umami-comparison-ac4e7e826486)
- [Drupal 11 vs WordPress: Enterprise CMS 2026 — Digital Pixel](https://www.digitalpixelweb.com/blog/drupal-11-vs-wordpress-enterprise-cms-2026)
- [Headless CMS Trends in 2026 — Waredock](https://www.waredock.com/magazine/headless-cms-trends-2026/)
- [Headless CMS & Jamstack ROI — Numen Technology](https://www.numentechnology.co.uk/blog/headless-cms-roi-jamstack-2025)
- [Comparing JS frameworks for content-heavy sites — DatoCMS](https://www.datocms.com/blog/comparing-js-frameworks-for-content-heavy-sites)
- [Case Study: Klépierre's Journey to the Jamstack — Netlify](https://www.netlify.com/blog/2020/12/11/case-study-kl%C3%A9pierres-journey-to-the-jamstack/)
- [Medusa.js Documentation](https://docs.medusajs.com/)
- [Saleor Documentation](https://docs.saleor.io/)
- [Chatwoot Documentation](https://www.chatwoot.com/docs/)
- [Stripe Checkout Documentation](https://docs.stripe.com/checkout)
- [GitHub Copilot Pricing 2026](https://github.com/features/copilot)
- [Cursor IDE Documentation](https://cursor.sh/)
- [Web Content Accessibility Guidelines (WCAG) 2.1 AA](https://www.w3.org/WAI/WCAG21/quickref/?currentsidebar=%23col_overview&levels=aa)
- [OWASP Top 10 2025](https://owasp.org/www-project-top-ten/)
- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)
- [axe-core Accessibility Testing](https://github.com/dequelabs/axe-core)
- [GDPR Cookie Consent Best Practices 2026](https://gdpr.eu/cookies/)

---

## Document Governance

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Project Sponsor (Chairman) | Mohd Mazharul Islam | ____________ | ___________ |
| Operational Sponsor (GM Dubai) | Robiul Islam | ____________ | ___________ |
| Marketing Director | (TBC) | ____________ | ___________ |
| IT/Technical Lead | (TBC) | ____________ | ___________ |
| Unisoft Team Lead | (TBC) | ____________ | ___________ |
| Unisoft Senior Developer | (TBC) | ____________ | ___________ |

---

**Document Version:** 3.0 (2-Developer / 15-Month / Full-Scope / Enterprise-Quality / Phases 1–3 Edition)
**Issued:** 30 April 2026
**Next Review:** Upon stack selection sign-off (target: 7 May 2026) and Phase 1 sprint plan sign-off (target: 14 May 2026); subsequent reviews at each phase boundary (Months 5, 9, 15)
**Synchronized With:** RFP v3.0, BRD v3.0, URD v3.0, Content Map v1.0, `_master-sku-reference.md`, Forensic Alignment Audit v2.0, Company Profile v2.0
