# 08 — Admin Console Professionalization Plan

Gap source: `docs/04-ADMIN-CMS-SPEC.md` (target UX) vs current `apps/admin` (flat sidebar, single-view
workspace, no search, no tabs, basic dashboard). Backend surface already covers content CRUD +
workflow + revisions + preview, media, submissions/RMA/jobs/products, partners, translations,
settings/redirects/locales, stats, audit — the console must expose it professionally.

## Research findings

**API endpoints available** (role-guarded): content/:entity (CRUD, transition, revisions, revert,
preview), media (list/upload/patch/delete), settings (get/put, redirects CRUD, locales patch),
partner-orgs/members/assets, translations (get/put/import), submissions (filters, detail, notes,
CSV), RMA (board + transitions + idempotency), job-applications, products CRUD, audit, stats,
sn-checks, public forms intake.

**Current console gaps**: flat 11-item list (no grouping/icons/badges); one module on screen at a
time; no global search; no breadcrumbs; no cross-links between related records; dashboard = 5 KPI
numbers + 2 plain lists (no trends/charts/activity); no mega menu / multi-point navigation;
Users & Roles module absent (spec §Modules — needs API support too).

## Phases

### P1 — Navigation shell (registry, sidebar, multi-tab workspace, mega menu, cross-nav)
- `nav.ts`: single module registry — id, group, label, icon, description, minRole, badge key,
  crossNav targets. Groups: Overview · Content Studio · Catalog · Support & Leads · Channel &
  Partners · Careers · Media Library · Localization · Administration.
- Sidebar: grouped sections, collapsible groups (persisted), icons, live badges (new leads, open
  RMA, pending apps), active state, collapse-to-rail mode, role-filtered, glass-chip logo header.
- Multi-tab workspace (right pane): tab bar with open/close, per-tab context (e.g. a selected
  lead), overflow scrolling, middle-click close, "open in new tab" everywhere (Shift+click nav),
  session-persisted tab set; closing last tab shows Dashboard.
- Top bar: breadcrumbs (Group / Module / Context), global-search trigger (⌘K), mega-menu button
  ("All modules" grid — grouped cards with descriptions + role filter + open/open-in-tab), user
  chip (role badge, MFA state, sign-out).
- Cross-navigation API: `nav.open(moduleId, ctx)` passed to modules — audit row → entity, lead →
  assignee/content, RMA → its submission, product → site page, content row → preview.

### P2 — Global search (⌘K command palette + unified API)
- `GET /api/v1/admin/search?q=` — role-guarded unified ilike search across articles/news/pages/
  FAQ, products (SKU/name), submissions (ref/email), RMA (number/email), job applications,
  media (filename/alt), job postings; grouped, capped (≤5/group), audited as read.
- Command palette component: ⌘K/Ctrl+K opens, fuzzy module navigation + entity results, keyboard
  driven (↑↓ Enter Esc), recent items (localStorage), grouped result sections with type badges,
  Enter opens result in new tab (cross-nav).

### P3 — Dashboard info visuals
- Extend `GET /admin/stats`: 14-day submissions/rma time-series, SLA risk list (due_soon +
  overdue w/ refs), content published counts by entity, audit activity feed (last 8), top
  viewed/most-recent content, jobs pending, media alt-compliance %.
- Dashboard UI: KPI cards w/ 7-day delta chips + sparklines (inline SVG, no chart lib), leads
  by-type bar chart, RMA pipeline funnel, SLA risk table (click → open lead tab), activity feed,
  quick actions row (New article, New product, Add redirect, Export CSV).

### P4 — Content & media depth + cross-nav links
- Content: status filter chips, type tabs, scheduled-publish indicator, revision history drawer
  (diff summary + revert), preview button (opens preview URL in new tab), per-row cross-nav
  (edit / revisions / preview).
- Media: grid/table toggle, alt-text compliance column + inline fix, usage refs display, type /
  folder filters, copy-URL action, upload with progress.
- Products/Partners/Jobs/RMA/Submissions: adopt `ctx` deep-linking (row click opens record in
  tab context) and "open in tab" actions.

### P5 — Verification & gates
- API e2e: search endpoint (grouping, caps, RBAC, no-leak across roles), stats extension shapes.
- Browser walkthrough (IAB): every group/module/tab/search/breadcrumb/cross-nav path; multi-tab
  persistence across reload; role-filtered nav for a viewer account.
- Gates: typecheck, admin build, full suite, parity untouched, sealed scan, commits per phase,
  evidence section appended to this doc.

## Deferred (documented, out of scope this pass)
- Users & Roles module (needs new Better Auth admin endpoints — separate security review).
- Menus management + feature flags UI (site nav is build-time; redirects exist already).
- Optimistic locking / dirty-state guard framework (per-record tab contexts land first).

## Evidence — implemented & verified (commit ef82c14, 2026-09-28)

**P1 shell** — sidebar renders 9 groups / 11 modules with SVG icons and live badges
(Leads 5 · RMA 1 · Careers 1 on the dev corpus); groups collapse and persist; rail
mode 236→84px and back. Multi-tab verified in the in-app browser: module click opens
a tab, Shift+click opens a *separate* tab, × and middle-click close (closing the last
tab falls back to Dashboard), and the full tab set **survives a page reload**
(sessionStorage restore, role-validated). Mega menu opens from the top bar with
grouped description cards; breadcrumbs show `Group / Module / Context` (e.g.
`Support & Leads / Leads & quotes / QT-2026-ab3571fb`).

**P2 search** — `GET /admin/search` (ilike, parameter-bound, soft-delete-aware,
≤5/group) + ⌘K palette. Browser-verified: query `VOLTX` → two PRODUCTS hits
(`VLT-DDR5-16G · published`, `VLT-DDR5-32G · draft`); Enter deep-links into a focused
tab whose ctx auto-opens the record (lead detail with workflow + notes confirmed for
`QT-2026-ab3571fb`). Module-jump results, ↑↓/Enter/Shift+Enter/Esc and recents wired.
(IAB harness note: its synthetic `press()`/role-click events don't always reach React
handlers — verified with native dispatches and page-script clicks; real trusted
events are unaffected.)

**P3 dashboard** — `/admin/stats` extended (backward compatible; 14-day series,
SLA risk queue, content/media health, activity tail, jobsNew). UI shows KPI cards
with sparklines (area-filled so zero-series stay visible) + 7-day deltas, leads
bars, RMA funnel w/ cross-nav, SLA risk table that opens the lead, media
alt-compliance, activity feed, quick actions. All sections confirmed rendered live.

**P4** — submissions consumes tab ctx (heading `Leads & quotes — <ref>`, detail
auto-opened); media gains compliance chip + missing-alt filter.

**Gates** — typecheck clean (4 projects), admin build green (479 kB), suite
**121/121** (9 new: p8-console.e2e.test.ts). Sealed scan
`scan-2026-09-28T21-52-40.583Z-bce0f6d32534`: 47 findings vs 46 baseline — the +1 is
the same authenticated-read heuristic on the new `/admin/search` (authed()-gated,
401 anonymous tested; identical pattern to `/admin/stats`/`/admin/submissions`
reads allowed for viewer per docs/04 RBAC). No findings in the new UI code.

**Dev-env note** — the stale API process served pre-P8 code and lacked the CORS env;
restarted with the documented dev env (ALLOWED_ORIGIN ×3 origins, TRUST_PROXY=1,
turnstile bypass). taskkill-without-SIGTERM gotcha from p2-evidence did NOT corrupt
the dev PGlite (health + data intact).

## Evidence — iteration 2 (user-feedback gap sweep, commit dbb4c26, 2026-09-29)

**Search works IN a search window** — new Search workspace (Overview group): type
in place → grouped results inline with per-type filter chips; verified live:
`DDR5` → 8 results (single Content chip after the server-side merge fix — the API
had been emitting FOUR groups all labeled "Content", duplicating chips and
no-oping the filter), `VLT` via the ⌘K palette's "Open full search ↗" hands the
query to a labeled Search tab.

**Product management is now a real CMS surface** (was a 31-line list):
migration 0007 (description, price_usd numeric(10,2), currency); editor with
brand/category (new `GET /admin/taxonomy`), description, price + currency,
key/value specifications editor, badges, datasheet rows (URL-validated), hero
image + 12-slot gallery chosen through a thumbnail media-picker modal, Publish
shortcut. Browser-verified end-to-end: opened VLT-DDR5-16G, set $89.99 + "New,
Gaming" badges + Latency CL30 spec + hero image (curl-uploaded probe asset),
saved → list shows price, badges, thumbnail.

**Security fix found during the pass**: `GET /admin/products` and
`/admin/products/:id` had NO session guard (any anonymous caller could read the
catalog); both now authed() — regression-tested (401 anonymous).

**Media library**: thumbnail grid view (images load from the file endpoint —
naturalWidth verified), alt state per card, inline alt edit, copy-URL, delete;
table view retained behind a toggle.

**Shell fix**: the module renderer is keyed per tab — two tabs of the same
module previously shared component state (a Search tab on "VLT" kept the earlier
"DDR5" query); verified isolated after the fix, and all 6 tabs survive reload.

**Gates** — typecheck clean, admin build green, suite **128/128** (7 new:
p8b-products auth-regression/taxonomy/rich-CRUD/negative-cases). Sealed scan
`scan-2026-09-28T22-27-39.492Z-113ac818a536`: **42 findings, down from 47** —
the product auth guards removed five missing-role-check heuristics.

**Dev-env notes** — the stale dev API process (pre-P8 code, missing CORS env)
was replaced; force-killing it corrupted the PGlite datadir (documented trap) →
`tooling/devdb-rebuild.mjs` rebuilt it (devdb-rebuild now pins `PGLITE_DATA` and
removes the stray cwd-relative repo-root datadir — the corpus importer had been
writing to a second, orphaned database). Consequence for the operator: the dev
DB was rebuilt, so the browser session and the previously enrolled dev MFA
secret were wiped — sign in with `admin@twinmos.dev` and re-enable MFA from the
top bar if wanted (the old QR is dead).

## Evidence — iteration 3: dev auto-login (commit 6d551f9, 2026-09-29)

Operator convenience while the console is being enhanced: skip the manual
user-id/password (+MFA) entry on every reload.

- `POST /api/v1/dev/session` replays the REAL Better Auth sign-in for the seed
  admin (cookies/sessions/audit identical to a manual login). Triple-guarded:
  `API_DEV_AUTOLOGIN=1` required; **403 under `NODE_ENV=production` regardless
  of the flag**; password only from `SEED_ADMIN_PASSWORD` (env — no credential
  literal in source; 404 if unset). Wrong password → normal 401.
- Admin bundle attempts it once on load **only in dev builds**
  (`import.meta.env.DEV` is false in production bundles); the skippable MFA
  enrollment offer is suppressed in dev; any failure falls through to the
  regular login form.
- 5 tests (p8c-devsession): default-off 404, no-env-password 404, production
  403, enabled 200 + working session + admin reads, wrong-password 401.
- Browser-verified: fresh load of `localhost:5174` lands **directly in the
  console** (no login form, no MFA nag), all 6 workspace tabs restored, live
  dashboard stats load.
- `.env.production.example` documents both dev-only flags as NEVER-in-production
  (and is now actually tracked — `.gitignore` whitelisted it after being
  silently ignored since P7).
- Gates: typecheck clean, build green, suite **153/153**; sealed scan
  `scan-2026-09-29T12-26-46.815Z` shows zero new rule classes vs baseline.

## Evidence — Phase 1 (Security, User Governance & RBAC) COMPLETE
Plan source: `admin_panel/plan/TwinMOS_Admin_Panel_and_CMS_Comprehensive_Audit_and_Improvement_Plan.md`
(TWN-ADMIN-CMS-AUDIT-PLAN-2026-001), Part 3 §Phase 1 — implemented in commit
399e3ae (with wiring landing across 6d551f9/399e3ae), verified 2026-09-29.

**1.1 Users & Roles + Better Auth admin() plugin** — DONE.
`auth.ts` configures `admin()` with an access-control role map; `routes/users.ts`
(super_admin-guarded, every mutation audited): `GET /users` paginated list with
role/emailVerified/twoFactorEnabled/banned state + `lastActiveAt` (session
subquery), `POST /users/invite` (mailer), `PATCH /users/:id/role`
(mutex-serialized, last-active-super_admin protected), `POST /:id/revoke-sessions`,
`/:id/ban` (with banExpires) & `/:id/unban`. UI module under Administration,
minRole super_admin. Tests: 10 (incl. 3 concurrency-race cases).
Browser: module renders with invite/search/role filter; admin row visible.

**1.2 Forensic currency compliance** — DONE.
`AUTHORIZED_CURRENCIES = ['USD','EUR','AED','SAR','INR','RUB']` +
`currencySchema` enum in shared; product create/update validated against it;
editor dropdown renders exactly the six authorized codes (browser-verified —
no BDT/GBP). Corpus scan: 'BDT' appears only inside the test asserting its
rejection. Dev DB data: all products USD. Tests: 4 (BDT 422 on create+patch,
all six accepted, patch isolation).

**1.3 Audit deep filtering + CSV export** — DONE.
`GET /admin/audit` filters: actorId, entity, action (ilike), from/to (ISO or
date), cursor keyset pagination (≤200/pg); `GET /admin/audit/actors` distinct
actor directory for editor+ readers; `GET /admin/audit.csv` same filters,
formula-injection-neutralised cells, `attachment; filename="twinmos-audit-log.csv"`.
UI: filter bar (Entity 15 options / Actor / Action / From / To / Reset / Export
CSV). Browser: entity=product filter narrowed rows 2→1 (all product); CSV
verified live (200, text/csv, correct header, filtered rows).
Tests: 4 (multi-filter, CSV neutralisation, actors, RBAC editor/viewer).

**1.4 Media deletion physical cleanup** — DONE.
`DELETE /media/:id` resolves the target under MEDIA_DIR with a strict
containment check, unlinks the file (ENOENT-tolerant), then removes the DB row
+ audit row. Tests: 2 (file gone from disk; ENOENT graceful).

**Part 5 acceptance gates (current state):**
1. typecheck — 0 errors across all projects.
2. suite — **153/153** (11 files) incl. the 20 Phase-1 governance tests.
3. Forensic integrity — zero BDT outside the rejection test.
4. RBAC — anonymous 401 RFC 9457 on every new endpoint (tested); role matrix
   enforced (super_admin-only users module; editor+ audit read).
5. Audit guarantee — every governance mutation writes an audit row (tested).
6. Cross-browser/responsive — single-browser verification only; noted as a
   remaining manual gate (was already the case for prior phases).

## Evidence — Phase 2 (Visual Page Builder & CMS Authoring Studio) COMPLETE
Plan source: TWN-ADMIN-CMS-AUDIT-PLAN-2026-001 §Phase 2 — commit 65cf25f,
verified 2026-09-29.

**§2.1 Visual page builder** — DONE. All 13 block types from the plan ship in
`modules/page-builder/`: a registry (`blocks.ts`) drives both the generic
settings editor (`PageBuilder.tsx`: palette, drag-to-reorder + up/down/
duplicate/delete, collapsible cards, media fields through the shared picker) and
the visual renderer (`preview.tsx`) with a responsive PreviewModal
(desktop 1200 / tablet 768 / mobile 375). The raw blocks-JSON textarea is gone
(JSON remains as an explicit power-user escape hatch). Browser-verified: builder
mounts with all 13 palette entries; a Hero block was added, filled and saved
(page persisted as draft with the block intact); the preview modal rendered the
composed page at all three viewports. Tests: 13-block create/read round-trip +
PATCH-replaces-blocks.

**§2.2 Rich-text studio** — DONE. Formatting toolbar on article/news/FAQ bodies
with every operation from the plan (H1–H3, bold, italic, strikethrough,
bulleted + numbered lists, blockquote, code block, table generator) plus the 🖼
Image button that opens the media picker and inserts `![alt](url)` at the caret.
Browser-verified: all 12 buttons present by title; Bold functionally wrapped the
selected text (**…**, +4 chars).

**§2.3 Two-person review (BR-5.1)** — DONE. Migration 0009 (`content_comment`)
+ `GET/POST /admin/content/:entity/:id/comments` (read: any staff; post:
author+; 1–2000 chars; audited). Content studio gains Library | Review-queue
views (queue spans articles/news/pages with a live count badge), a prominent
"Submit for review" action, an in-review banner, a Comments tab, and a
"Diff vs draft" LCS visual diff (green/red, fold markers, +N/−N stats) on every
revision. Browser-verified end-to-end: page submitted for review → appears in
the Review queue → review comment posted and listed.
Tests: transition-to-queue, comments CRUD/RBAC (viewer 403 write)/validation/
audit-row.

**Gates** — typecheck 0 errors, admin build green, suite **158/158** (5 new).
Sealed scan `scan-2026-09-29T13-39-09.058Z`: 45 findings — identical count to
the accepted baseline, zero new rule classes. Migration 0009 applied to the
dev DB.
