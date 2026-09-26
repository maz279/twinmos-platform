# TwinMOS Platform — Master Build, Development & Implementation Plan

**Reference:** TCB-PLAN-2026-001 · **Version:** 1.0 · **Date:** 26 Sep 2026
**Source of truth for scope:** Features Catalog v1.1 (143 features / 33 categories), URD v3.1, BRD v3.0, 15-Phase Roadmap v2.2 (adapted), content corpus (454 md files), product_data (40 SKUs), **the audited prototype (28 pages) — the non-negotiable UI/UX contract.**
**Repo:** `twinmso_codebase/` (npm-workspaces monorepo)

---

## 1. Product Summary

One platform, three deployables, one database:

| Surface | App | Nature | Users |
|---|---|---|---|
| Public website (28 pages → ~380 EN routes) | `apps/web` — Astro 7 static | CDN-cached, zero server needed | Anonymous |
| Admin dashboard + CMS control panel | `apps/admin` — React 19 SPA | Auth-gated, RBAC, audit-logged | TwinMOS staff (5 roles) |
| API service | `apps/api` — Hono 4 on Node 24 | REST `/api/v1`, auth, forms, RMA, CRUD, webhooks | web + admin + partners |

Shared: `packages/db` (Drizzle schema + migrations, **Postgres dialect** — PGlite embedded for dev, real Postgres in prod), `packages/shared` (Zod contracts, enums, RBAC matrix).

## 2. Locked Stack (verified versions, 26 Sep 2026)

| Layer | Choice | Version | Note |
|---|---|---|---|
| Web framework | Astro (static output) | 7.3.5 | MPA matches prototype 1:1; islands for interactive features |
| Admin framework | React SPA (Vite + TanStack Router + Query) | React 19.3 / Vite 8.3 / Router 1.170 / Query 5.104 | Dense-CRUD UI; code-split per module |
| API | Hono on Node 24 (via `@hono/node-server`) | 4.13.9 | Same code runs on own VM; middleware chain: requestId → rate-limit → auth → RBAC → audit |
| ORM / DB | Drizzle ORM + drizzle-kit | 0.45.3 / 0.31.11 | **All queries are parameter-bound by construction; raw SQL only via Drizzle `sql``` template (also parameterized). No string-concatenated SQL anywhere.** |
| Dev DB | @electric-sql/pglite | 0.5.8 | Real Postgres dialect in-process; **dev/test only — API refuses to boot on PGlite when `NODE_ENV=production`** |
| Prod DB | PostgreSQL 16 (own VM) | — | Same schema, zero rewrite |
| Auth | Better Auth (Drizzle adapter, admin + RBAC plugins) | 1.7.6 | Sessions, MFA, roles; `/api/v1/auth/*` |
| Validation | Zod (shared contracts) | 4.6.5 | One schema validates API input, admin forms, and web payloads |
| Search | Pagefind (built into `apps/web` dist) | 1.5.2 | Zero-infra fuzzy multilingual search; swap to MeiliSearch only if analytics demand |
| Email | Resend (dev driver: log-to-file) | 6.30.0 | Transactional: form routing, RMA state mail, admin invites |
| Web styling | Prototype `main.css` design system (tokens) | — | **No Tailwind on web** — the audited CSS is the contract |
| Admin styling | Tailwind 4 + TwinMOS tokens | 4.3.3 | New UI, no prototype to protect |
| Images | Astro `<Image>` + Sharp; Pillow baking scripts kept in `tooling/` | — | Same visual output as prototype |
| Tests | Vitest (unit) + Playwright (E2E parity) + axe-core (a11y) + Lighthouse CI | — | Gates in CI |
| CI/CD | GitHub Actions → build → parity checks → deploy (static web to CDN; api + admin to VM via docker image or systemd) | — | |

**ADR-006 decision:** no external CMS (Strapi/Payload) — the custom admin panel in `apps/admin` **is** the CMS, backed by the same schema. The markdown corpus is imported into the DB by `tooling/import-corpus.ts` and remains the bootstrapping source.

## 3. Phase Plan (adapted from Roadmap v2.2 to this architecture)

Each phase ends with a gate: CI green + parity audit + stakeholder sign-off.

| Phase | Scope | Exit criteria |
|---|---|---|
| **P0 — Foundation** (this scaffold) | Monorepo, packages/db full schema + migrations + seed, API skeleton (health, auth, forms, 1 admin CRUD module), admin shell (login, dashboard, products), web skeleton (Base layout + tokens CSS + homepage shell) | `npm run dev` boots all three apps against PGlite; auth login works; form submit → DB row + audit log |
| **P1 — Web migration** | Port all 28 prototype pages into Astro (see doc 05); data via `packages/db` at build time; Pagefind; sitemap/robots/hreflang scaffold; JSON-LD | Visual parity ≥ 98% vs prototype screenshots (Playwright screenshot-diff); Lighthouse ≥ 90/95; 0 axe criticals |
| **P2 — Forms, RMA & Admin v1** | All 15 form types → API + Resend routing + spam guard (Turnstile); RMA 7-state workflow + public tracker; admin modules: Dashboard KPIs, Submissions inbox, RMA board, Job applications | Every form E2E-tested; RMA lifecycle E2E; audit log records all mutations |
| **P3 — CMS completion** | Articles/news/events/FAQ/pages editors (markdown + blocks), media library, publishing workflow (draft → review → scheduled → published), revisions + preview URLs, redirects manager, menus, settings | Non-developer editor can create → publish → see live on staging |
| **P4 — Localization** | Locale routing (EN launch; AR/BN/HI next; RU/ZH-CN/FR; ES/PT/DE last), RTL verified, translation workflow (string export/import), hreflang | RTL Arabic parity audit passes; 9-locale build < 5 min |
| **P5 — Portal & anti-counterfeit** | Partner portal (Better Auth orgs: Distributor/OEM/SI roles; gated content, price files, MDF), SN-check anti-counterfeit API + reporting | Partner login + role-gated content E2E |
| **P6 — Commerce decision** | Quote/lead flow hardened **or** Medusa.js/Stripe integration — decided by then-business case (ADR at phase start) | — |
| **P7 — Hardening & launch** | OWASP ZAP, third-party pen-test, WCAG 2.2 AA audit, load test, DR drill, runbooks, hypercare | All gates green → production cutover |

## 4. Workstream Details

### 4.1 Frontend (`apps/web`) — see docs/05
- One Astro page per prototype page; `Base.astro` reproduces header/footer/mega/drawer/search overlay from the audited markup.
- Interactive features port as islands **function-for-function**: shop facets, PDP gallery/variants, compare tray, compatibility finder, RMA tracker, tabs/accordions, forms.
- Build-time data: Astro loaders query `packages/db` (or the seed JSON snapshot) — `data.js` blob dies.
- Public site ships **zero application server**: forms/RMA call `apps/api` same-origin (`/api/*` reverse-proxied).

### 4.2 API (`apps/api`) — see docs/02
- Public: `POST /api/v1/forms/:type`, `GET /api/v1/rma/:number`, health.
- Auth: Better Auth mount `/api/v1/auth/*`.
- Admin: `/api/v1/admin/*` CRUD for every CMS entity + `POST …/:id/publish`, audit-logged, Zod-validated, RFC 9457 errors, cursor pagination.

### 4.3 Database (`packages/db`) — see docs/03
- Postgres dialect; ~22 tables + 4 enums; migrations via drizzle-kit; seed from corpus + products.json.
- Policy: **parameter binding only** (enforced by Drizzle usage rule + `no-raw-sql` ESLint custom rule in review checklist).

### 4.4 Admin/CMS (`apps/admin`) — see docs/04
- Modules: Dashboard, Content (articles/news/events/pages/FAQ), Catalog (products/brands/categories/specs), Support (submissions/RMA/KB), Channel (distributors/markets), Careers (jobs/applications), Media, Users & Roles, Audit Log, Settings (locales/menus/redirects/features).
- RBAC: Super Admin / Admin / Editor / Author / Viewer — matrix in doc 04.

### 4.5 Security & compliance — see docs/02 §6 and doc 04 §RBAC
- OWASP Top 10 controls, Cloudflare Turnstile on public forms, rate limits, session hardening, audit trail (12-month retention), GDPR/PDPL DSAR hooks, RFC 9457 problem+json.

### 4.6 DevOps
- Environments: local (PGlite) → staging (VM, Postgres) → production (VM behind Cloudflare).
- Deploy: web = static bundle to CDN/VM nginx; admin = static bundle served by API host at `/admin`; api = Node service (systemd or container) — one origin keeps cookies same-site.
- Backups: nightly `pg_dump` + WAL to Backblaze B2; RTO 4h / RPO 15min; quarterly DR drill.

## 5. Definition of Done (per feature)
Code + types + Zod contract + migration (if schema) + unit test + E2E path + axe pass + audit-log coverage + docs updated + parity check (if UI).

## 6. Immediate next steps
1. `npm install` at repo root → `npm run dev` (all apps).
2. P0 acceptance walkthrough (login → create product → submit form → see audit row).
3. Begin P1 with the homepage + shop + one PDP vertical slice.
