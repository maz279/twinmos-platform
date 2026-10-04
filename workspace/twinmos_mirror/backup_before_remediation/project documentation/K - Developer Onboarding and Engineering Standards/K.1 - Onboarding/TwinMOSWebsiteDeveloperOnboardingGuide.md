# TwinMOS Website Developer Onboarding Guide

**Document Reference:** TWN-DEV-ONB-2026-001  
**Version:** 1.0  
**Status:** FINAL  
**Date:** 1 May 2026  
**Prepared by:** TwinMOS Digital Transformation Team / Unisoft Engineering  
**Owner:** IT/Technical Lead (Implementation)  
**Audience:** All new developers joining the TwinMOS website project  
**Classification:** CONFIDENTIAL — Unisoft + TwinMOS Internal Use  
**Synchronized With:** Tech Stack v1.1, Implementation Strategy v3.0, BRD v3.0, URD v3.0

---

## 1. Welcome

Welcome to the TwinMOS Corporate Website redevelopment project. This guide will take you from zero to productive contributor within your first week. The project is a 15-month, 2-developer engagement building a world-class corporate website for TwinMOS Technologies — a 27+ year heritage memory and storage brand operating across 93+ countries.

**Project Mission:** Build a digital platform that matches or exceeds the capabilities of Kingston, Corsair, G.Skill, and ADATA while supporting TwinMOS's strategic expansion into India and other growth markets.

---

## 2. Project Overview

### 2.1 Stack at a Glance

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend Framework | Astro 5 with React 19 islands | Astro >= 5.6, React 19.x |
| Headless CMS | Strapi v5 (Community Edition) | Strapi >= 5.31 |
| Database | PostgreSQL | 16.x LTS |
| Search Engine | MeiliSearch | 1.13.x |
| Styling | Tailwind CSS 4 | ^4.0.0 |
| TypeScript | Strict mode | ^5.5.0 |
| Package Manager | pnpm | 9.x |
| Node.js Runtime | LTS | 22.x |

### 2.2 Repository Topology

Two private repositories under the TwinMOS GitHub Organization:

| Repo | Tech | Deploys To | Lead Owner |
|------|------|-----------|------------|
| `twinmos-website-frontend` | Astro 5 + React + Tailwind + Vite | Cloudflare Pages | Dev A (Frontend Lead) |
| `twinmos-website-backend` | Strapi v5 + Postgres + plugins + workers | Hetzner via Coolify | Dev B (Backend Lead) |

A third optional repo `twinmos-shared-types` may be added in Phase 2 if shared TypeScript types grow large enough.

### 2.3 Phased Roadmap

| Phase | Months | Scope |
|-------|--------|-------|
| **Phase 1 — Core Website** | 1–5 | Full rebuild; 287 content pages; 100+ SKUs; 28 regional landings; EN only; all 34 legal pages; catalog; forms; CMS |
| **Phase 2 — Localization & Partner** | 6–9 | AR/BN/HI translations; partner portal; live chat; anti-counterfeit; RMA portal |
| **Phase 3 — Commerce & Advanced** | 10–15 | E-commerce MVP; RU/ZH/FR; loyalty/referral; advanced analytics |
| Phase 4 — Ongoing | 16+ | **Out of scope** — separate retainer |

---

## 3. Pre-Requisites (Before Day 1)

### 3.1 Hardware

- Modern development workstation (16 GB RAM minimum; 32 GB recommended)
- Stable internet connection (minimum 10 Mbps)
- Admin access to install software

### 3.2 Accounts & Access

Ensure your manager has provisioned:

- [ ] GitHub access to `TwinMOS` organization (both repos)
- [ ] TwinMOS Slack workspace invite
- [ ] Sentry project access
- [ ] Cloudflare Pages dashboard access (read-only for devs)
- [ ] Hetzner/Coolify access (Team Lead only; read-only for Dev B)
- [ ] Backblaze B2 bucket credentials (Team Lead)
- [ ] GitHub Copilot license (if applicable)

### 3.3 Required Reading

Before your first day, read:

1. [TwinMOS Website BRD v3.0](../../TwinMOS_Website_BRD.md) — Business context and requirements
2. [TwinMOS Website URD v3.0](../../TwinMOS_Website_URD.md) — User-facing interaction specs
3. [TwinMOS Website Technology Stack v1.1](../../TwinMOS_Website_Technology_Stack.md) — Complete stack specification
4. [TwinMOS Website Implementation Strategy v3.0](../../TwinMOS_Website_Implementation_Strategy.md) — Delivery plan and non-negotiables
5. This onboarding guide

---

## 4. Day 1: Environment Setup

Follow the [Day 1 Setup Checklist](TwinMOSWebsiteDay1Setup_Checklist.md) for the complete step-by-step installation process. High-level steps:

1. **OS:** Install Ubuntu 24.04 LTS (recommended) or your preferred Linux distribution
2. **IDE:** Install VSCode with required extensions
3. **Runtime:** Install Node.js 22 LTS + pnpm 9.x
4. **Containers:** Install Docker + Docker Compose
5. **Clone:** Clone both repositories
6. **Local Stack:** Run `docker-compose up` to boot Postgres + MeiliSearch + ImgProxy
7. **Install:** Run `pnpm install` in both repos
8. **Verify:** Start dev servers and confirm both repos run locally

---

## 5. Week 1 Learning Path

### Day 1 — Environment & First Run
- Complete Day 1 Setup Checklist
- Run both repos locally
- Verify dev servers respond
- Review project glossary

### Day 2 — Codebase Orientation
- Read [Repository Map](TwinMOSWebsiteRepository_Map.md)
- Walk through frontend folder structure
- Walk through backend folder structure
- Identify key configuration files

### Day 3 — Standards & Conventions
- Read all K.2 Coding Standards documents
- Read K.3 Git & Collaboration documents
- Configure your IDE with project settings
- Run linting and tests locally

### Day 4 — First Contribution
- Pick a "good first issue" from the backlog
- Create a feature branch following naming conventions
- Make your first commit using Conventional Commits
- Open your first pull request
- Request code review from your teammate

### Day 5 — Deep Dive
- Attend pair-programming session with your teammate
- Review an open PR together
- Understand the CI/CD pipeline
- Complete Week 1 retro with Team Lead

---

## 6. Key Contacts

| Role | Name | Contact | Responsibility |
|------|------|---------|---------------|
| Project Sponsor (Chairman) | Mohd Mazharul Islam | — | Executive decisions |
| Operational Sponsor (GM Dubai) | Robiul Islam | — | Operational decisions |
| IT/Technical Lead | (TBC) | — | Architecture, security, code review |
| Team Lead (Unisoft) | Dev A | Slack | Frontend lead, DevOps |
| Senior Developer (Unisoft) | Dev B | Slack | Backend lead, CMS |
| Marketing Director | (TBC) | — | Content decisions |

---

## 7. Communication Channels

| Channel | Purpose | Frequency |
|---------|---------|-----------|
| Slack #general | Team announcements | As needed |
| Slack #dev-frontend | Frontend discussions | Daily |
| Slack #dev-backend | Backend / CMS discussions | Daily |
| Slack #deployments | Deployment notifications | Per deploy |
| Slack #incidents | Production incidents | As needed |
| Bi-weekly demo | Show shipped work | Every 2 weeks |
| Sprint planning | Task assignment | Every 2 weeks |
| Sprint retro | Process improvement | Every 2 weeks |

---

## 8. Documentation Index

### Project Documents (read-only for devs)
- BRD v3.0 — Business Requirements
- URD v3.0 — User Requirements
- RFP v3.0 — Request for Proposal
- Tech Stack v1.1 — Technology specification
- Implementation Strategy v3.0 — Delivery plan
- Content Map v1.0 — 287 content entries
- Company Profile v2.0 — TwinMOS corporate facts

### Engineering Standards (this folder)
- K.1 Onboarding — This guide + checklist + glossary + repo map
- K.2 Coding Standards — TypeScript, Astro, React, Strapi, CSS/Tailwind, ESLint/Prettier, file naming
- K.3 Git & Collaboration — Branching, commits, PRs, code review, pair programming, issue templates
- K.4 Repository Files — README, CONTRIBUTING, CODEOWNERS, .gitignore, .editorconfig, .nvmrc, LICENSE, CHANGELOG, SECURITY
- K.5 AI-Assisted Development — Guidelines, AGENTS.md, .cursorrules, copilot-instructions, anti-patterns

### Architecture
- ADRs in `/docs/adr/` (committed per significant decision)
- Traceability matrix in `/docs/traceability/`

---

## 9. Quality Gates

Every PR must pass:

| Gate | Tool | Threshold |
|------|------|-----------|
| Lint | ESLint | Zero errors |
| Format | Prettier | Clean |
| Type check | TypeScript | Zero errors (strict mode) |
| Unit tests | Vitest | Critical path 100%; overall >= 70% |
| E2E tests | Playwright | Critical paths green |
| Accessibility | axe-core | No critical/serious findings |
| Lighthouse | Lighthouse CI | Performance >= 90 |
| Security | OWASP ZAP | No high/critical findings |

---

## 10. Escalation Path

| Issue Type | First Contact | Escalation |
|-----------|--------------|------------|
| Technical blocker | Teammate (pair programming) | Team Lead |
| Architecture decision | Team Lead | TwinMOS IT/Technical Lead |
| Scope change | Team Lead | TwinMOS PM + Sponsor |
| Security concern | Team Lead | TwinMOS IT/Technical Lead + Legal |
| Access/permissions | Team Lead | TwinMOS IT/Technical Lead |

---

**Document Version:** 1.0  
**Issued:** 1 May 2026  
**Next Review:** Upon new developer onboarding or at phase boundaries (Months 5, 9, 15)  
**Canonical Location:** `K - Developer Onboarding and Engineering Standards/K.1 - Onboarding/TwinMOSWebsiteDeveloperOnboardingGuide.md`
