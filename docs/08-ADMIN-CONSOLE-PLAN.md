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

## Evidence — full manual/visual QA sweep (commit b36adda, 2026-09-29)

Operator-requested walkthrough: every menu, button, option and data-entry form
clicked live in the browser across all 12 modules. **Two real defects found and
fixed**; everything else passed interactively.

**Defect 1 (fixed):** sidebar clicks to an already-open module did nothing —
`openTab` called a nested setState inside a state updater (impure; React drops
it). Rewritten as one pure updater (focus-or-append). Verified: sidebar
Content ↔ Dashboard switching activates the existing tab.

**Defect 2 (fixed):** single-module groups rendered two identical buttons
("Careers" header + "Careers" item) — the header swallowed the click, making
the module look unreachable. Single-module groups now show a plain label;
verified sidebar Careers opens Job applications.

**Verified working (interactive, not snapshot-only):** Dashboard — 6 KPI cards,
5 info cards, 4 quick-actions open tabs, SLA-risk row deep-links the lead,
media-compliance link opens Media. Search — in-place results, type chips
filter. Content — Library/Review-queue, entity tabs, article editor toolbar
ops, page builder (palette 13 blocks, save, preview modal), submit-for-review,
review queue lists the item, comments post+list, diff viewer. Products — q +
status filters, create-form required-field validation, full save (QA-SWEEP-
DDR5-16 created at $74.50, verified via API + list), currency dropdown
authorized-only. Leads — filters, detail, internal note added, transition
buttons, CSV 200 text/csv. RMA — state filter + search. Partners — orgs +
SN-check tabs, add-org form validation (disabled until filled). Careers —
applications table + status filter. Media — compliance chip, inline alt edit
saved, grid/table toggle. Translations — locale selector renders. Users &
Roles — table + invite modal. Audit — 16-entity filter, actor filter, export
CSV. Settings — redirect created live (/qa-sweep-old → /qa-sweep-new). Shell —
mega menu opens and navigates, rail collapse 260→84px, tab persistence across
reload.

Gates: typecheck 0, build green, suite 158/158, sealed scan baseline (45, no
new classes).

## Evidence — 2026 reference restyle (design_sample boards)

**Input:** the four approved boards in `Corporate website development for
TwinMOS/admin_panel/design_sample/` (two light-CMS boards, a module-grid
control panel, a navy/teal analytics dashboard). Analyzed all four; the shared
design language: deep-navy sidebar (~#16222F), teal accent (#1DBF9F), white
topbar with search + avatar, light-gray canvas (#F2F4F6), white rounded cards
with soft shadows, icon-chip KPI tiles with sparklines, teal area charts,
donuts, uppercase micro-labels, pill badges.

**Implemented (commit 71987e7):**
- `ui.tsx` became the single token source (NAVY/INK/TEAL/TEAL_DK/GOLD/RED/
  GREEN/BLUE/PURPLE/MUTED/FAINT/LINE/PAGE + CARD_SHADOW) with refreshed atoms
  (teal-gradient primary button, uppercase letter-spaced table headers, pill
  badges, ghost/input/card styles) and a `globalCss` (form controls inherit
  the console font, teal focus rings, thin dark/light scrollbars).
- `shell.tsx`: brand block (logo chip + TwinMOS/CONSOLE wordmark), user card
  (teal-gradient avatar initials + name + role), teal active nav with 3px left
  indicator, live-badge pills, bottom version footer with teal live dot;
  white topbar (Modules chip, search field with ⌘K kbd, breadcrumbs, MFA
  state, avatar + email + role badge); tab strip as rounded pills; mega-menu
  cards with teal icon chips and hover lift.
- `dashboard.tsx`: six KPI tiles with tinted icon chips + sparklines + ▲▼
  delta pills; 14-day dual-series area chart (teal line + gradient fill, gold
  dashed RMA line, grid lines, date ticks, legend); lead-status donut with
  center total + legend; rounded pill bars for type/RMA/media-compliance;
  restyled SLA queue rows and activity feed with icon chips.
- `login.tsx`/`mfa.tsx`: navy rail gradient with teal radial glow, teal
  gradient CTA, teal focus rings.
- Palette sweep across the ⌘K palette, Search, Content, Products, Media,
  page-builder, media-picker, diff, markdown toolbar — zero old navy/cyan
  hexes remain.

**Verified visually (IAB screenshots, vision-reviewed):** Dashboard 8/10
match (missing sparklines on 4 tiles are data-driven — only leads/RMA carry
series), Products, Content, Media clean, ⌘K palette 9/10 (teal module chips,
active-row tint), mega menu, login 9/10 (teal gradient CTA confirmed).
Function re-checked live after restyle: sidebar nav, Products list, Content
library, Media grid, ⌘K search ("VLT" → 2 product hits, chips PRODUCTS),
sign-out → login → dev auto-login round-trip.

Gates: typecheck 0, admin build green, suite 158/158 (12 files).

## Evidence — restyle gap-closure pass (commit 155aeb0)

Audit of the first theme pass found three gap classes, all closed:

1. **Typography drift** — 10 module screens still used browser-default
   `<h1>` (32px black) next to the dashboard's 22px/800 ink titles. All
   ten (Content, Leads, RMA, Partners, Careers, Media, Users, Audit,
   Settings, Translations) now use the standard header style.
2. **Off-token literals** — ~200 leftover gray/border/tint hexes across
   21 files (first pass only swept navy/cyan/gold). Remapped to the token
   system: grays→FAINT/MUTED, borders→LINE/#D9E0E8, hairlines/tracks→
   #F0F3F7, cyan text/tints→teal family, status greens/reds→GREEN/RED
   tints. Post-sweep grep for 32 legacy hexes returns zero matches.
3. **Canvas stragglers** — main.tsx MFA wrappers and the login rail text
   tints now use PAGE / the sidebar's neutral family.

Re-verified after the sweep: typecheck 0, build green, suite 158/158;
browser QA — Leads list + lead detail (teal transitions, red overdue
chip, teal context crumb), RMA board, Users & Roles, Audit log,
Settings, Translations, Partners, Careers, product editor (14 controls,
taxonomy selects), Content review queue (count chip), inline page-block
preview, sidebar collapse 82↔264px round-trip. Note: PreviewModal in
content.tsx is pre-existing dead wiring (setShowModal never called) —
the live preview is the inline tab; not a restyle regression.

## Evidence — methodical pixel pass (commit 1d013cf)

Objective: visually inspect EVERY console screen against the reference
language, not just DOM-verify. Screenshot capture was restored by calling
the harness `capture_screenshot()` directly (the IPC-wrapped tool path
was timing out) and reviewing each PNG with vision.

Screens vision-reviewed this pass (scores): Users & Roles 9/10, RMA
board clean, Audit log 7/10 → fixed, Settings clean, Translations clean,
Partners clean, Careers clean, product editor pass (structure sound),
page editor + block builder pass, dashboard re-check 9/10 (full sidebar
incl. Settings + version footer now visible, tab scrollbar gone), media
table view captured, collapsed rail 9/10. Earlier passes had already
covered dashboard, products list, content library, media grid, ⌘K
palette 9/10, mega menu, login 9/10, leads list + detail.

Defects found by the vision review and fixed:
1. crowded tab strip showed a horizontal scrollbar (read as clipping) —
   scrollbar hidden via .tm-tabs-scroll (wheel/drag still work);
2. data tables had no hover affordance — global row hover tint added;
3. audit IP/request cell rendered ambiguous "— / —" — now "no IP on
   record" caption and request id shown only when present;
4. sidebar slightly overflowed 945px viewports — group/item padding
   tightened so the last item and version footer fit.

Gates re-run: typecheck 0, admin build green, suite 158/158 (12 files).

## Evidence — Phase 3: Catalog Engineering COMPLETE (TWN-ADMIN-CMS-AUDIT-PLAN-2026-001 §3)

**3.1 Product Variants.** `variantCreateSchema`/`variantUpdateSchema`
(packages/shared) — hardware attrs (capacity/speed/finish/lighting) plus
per-variant priceUsd/stock/status stored inside the variant jsonb attrs
(no migration required). API: GET/POST/PATCH/DELETE
`/admin/products/:id/variants` — editor-guarded, audited
(`product.variant.create|update|delete`), unique-SKU violations surfaced
as 409 via an isUniqueViolation helper (message + cause + SQLSTATE 23505).
UI: "Variants & SKUs" tab in the product editor — auto-suggested SKU
(base-capacity-speed-lighting), attribute chips, per-row edit/delete.
Verified live: variant `VLT-DDR5-32G-32GB-6000MT-S-RGB` created via the
form at $129.50 with 32GB/6000MT/s/Titanium/RGB chips.

**3.2 QVL Compatibility Matrix.** `compatibilityCreateSchema`
(DDR4/DDR5 × U-DIMM/SO-DIMM/M.2 NVMe, both ≤ the varchar(12) columns);
`/admin/compatibility` CRUD with q + memoryGen filters, audited. New
`modules/compatibility.tsx` registered under the Catalog group (shield
icon) — side-by-side add/edit form + rules table. Verified live: ASUS
ProArt Z790-Creator WiFi / DDR5 / U-DIMM / 128 GB rule created via UI.

**3.3 Bulk CSV import/export.** `POST /admin/products/import` with a
quoted-field parser, per-line validation (SKU/slug/name/brand-slug/
category-slug/status/authorized currency — BDT rejected with the
forensic-audit note — price), in-file duplicate rejection, existing-SKU
rows classified as upserts, dry-run report {rows, errors, create/update
counts}, transactional commit with a single `product.import` audit row.
`GET /admin/products/export.csv` (formula-injection hardened) and
`import-template.csv`. Three-step modal: template/export → upload →
validate-then-commit. **Route-ordering trap:** the CSV GETs must be
registered BEFORE `/products/:id` — otherwise "export.csv" matched :id,
`Number('export.csv')` → NaN → 500 (caught live, fixed, tested).
Verified live: dry-run "3/4 valid (2 new, 1 updates)" + "Line 6
(bad-row!): SKU must be…" then "✓ Committed — 2 created, 1 updated",
imported SKU visible in the list.

**3.4 Optimistic locking.** `sameInstant` (shared) compares an If-Match
header (optionally quoted ISO) against updatedAt; PATCH
`/admin/products/:id` and `/admin/content/:entity/:id` return 409
Conflict on mismatch. Both editors send their loaded revision and render
a reload-fresh / keep-mine conflict banner (amber, not applied).
Verified conflict-free save round-trip in the UI; 409s covered by tests.

**Gates:** p11-catalog.e2e.test.ts 14/14 (RBAC, attrs round-trip, dup
409, audit trail, QVL filters, template/export, dry-run report, refused
+ committed upsert import, wrong-header 422, stale/fresh/absent If-Match,
content stale 409). Suite 172/172 across 13 files; typecheck 0; admin
build green.

**Carry-forward learnings (memory):** (1) Hono matches routes in
registration order — static suffix routes (`.csv`) must precede `:id`
params; (2) React 19 controlled inputs in automation: use the native
HTMLInputElement value setter + `input` event, then act in the SAME
synchronous block — DOM-only sets are wiped on the next render, and
placeholder-substring locators can collide with filter bars (match on
the most specific substring); (3) PGlite unique-violation text varies —
match message + cause + 23505; (4) zod `.partial()` on an object with a
nested object does NOT partial the inner shape — derive update schemas
with `createSchema.shape.attrs.partial()`; (5) the numeric priceUsd
mapper needs an `as typeof table.$inferInsert` cast for batch inserts.

## Evidence — comprehensive audit pass (commit 2db42ec)

Re-audited every prior iteration against the plan and the live app.

**Root cause of the reported invisible panel:** the TwinMOS Vite dev
server had died and an unrelated project (UniSoft CRMS) took over port
5174 — visiting http://localhost:5174/ showed a completely different
app. Port reclaimed; the admin now runs under a persistent task with
`--port 5174 --strictPort`. Ops rule: TwinMOS admin owns 5174.

**Gaps found and fixed (all browser-verified):**
1. `form_factor` varchar(12) forced "M.2 NVMe"; migration
   **0010_widen_form_factor** widens to varchar(24) — the QVL form now
   offers the plan-exact "M.2 2280 NVMe" (journal idx 10; dev DB
   migrated with the API stopped).
2. Global search missed the compatibility entity — `/admin/search`
   returns a **Compatibility** group (brand+model ilike, "QVL · gen ·
   form factor" sub, kind `compat`); ⌘K verified: "ASUS" surfaces both
   an article and the ASUS ProArt QVL rule.
3. No URL routing — hash deep-links added: `#/home` → dashboard,
   `#/m/<module>[/<kind>/<id>]` opens/focuses the tab; the active tab
   mirrors into the URL via replaceState; manual hash edits honoured
   (verified: `#/home` loads Dashboard, clicking Compatibility rewrites
   to `#/m/compatibility`).
4. PreviewModal was dead wiring — a "Responsive preview" button on the
   page editor's preview tab now opens the desktop-1200 / tablet-768 /
   mobile-375 modal (verified live on "Builder probe page").
5. Stats/dashboard ignored variants — `/admin/stats` returns
   `variants`; the Catalog KPI hint reads "N variants · M products".
6. QVL brand field now carries a datalist of common device brands.

Gates: p11 → 16 tests (compat search group incl. the M.2 sub-line,
stats.variants); suite **174/174** (13 files); typecheck 0 across all
four projects; admin build green.

Deliberate scope notes: XLSX import (plan said CSV/XLSX) stays CSV-only
— template + dry-run cover the workflow without a spreadsheet parser
dependency; drag-and-drop image ingest remains deferred to Phase 4 DAM.

## Evidence — Phase 4: Media DAM COMPLETE (TWN-ADMIN-CMS-AUDIT-PLAN-2026-001 §4)

**4.1 Pluggable storage** (`apps/api/src/storage.ts`). `StorageDriver`
interface + `LocalStorageDriver` (MEDIA_DIR) + `S3StorageDriver` with
hand-rolled SigV4 request signing and presigned GET URLs (S3/R2/B2).
Credentials env-only (`S3_*`); `MEDIA_STORAGE=s3` with an incomplete env
set throws at startup rather than silently writing local disk. Keys are
normalised against traversal. Every media byte (originals + variants)
now moves through the driver — routes are storage-agnostic; production
flips MEDIA_STORAGE + S3_* and nothing else changes.

**4.2 Sharp variants.** Raster uploads derive thumb 150×150, card
400×300, hero 1200×800 (WebP + AVIF) and full ≤2560-inside WebP;
dimensions + colour profile land in `media_asset.meta`. Served via
`GET /admin/media/:id/file?variant=` with `immutable` caching; the grid
uses the card variant. Content-addressed keys dedupe identical uploads
(200 + existing row; latest alt/folder win) instead of erroring.
Masters under 1200px wide get a `low-res` chip (BR-1.2 hint).
Two sharp gotchas found in testing: derivative mimes must come from the
spec (sharp reports AVIF as container family 'heif'), and Drizzle wraps
driver errors in `.cause` — unique-violation matching walks message +
cause + SQLSTATE.

**4.3 Folders + referential integrity.** Migration `0011_media_folders`
(media_folder + media_asset.folder_id, FK set-null). `/admin/
media-folders` CRUD with subtree-cycle and non-empty guards; uploads
accept folderId; PATCH /media/:id moves assets; DELETE refuses with
409 "In use" while the asset is a product hero/gallery image
(`id = ANY(gallery)` — gallery is integer[], NOT jsonb) or an
article/news hero, listing referencing items; deletion purges all
derivative bytes from storage. Media UI: folder tree sidebar with live
counts + create/rename/delete, upload-into-folder, per-asset move
dropdown, variant chips T/C/H/F, low-res chip, and an in-use dialog.

**Gates:** p12-dam.e2e.test.ts 11/11 (driver round-trip, SigV4 shape,
env gating with a complete env restore — spread-copy restore CANNOT
delete keys and leaked MEDIA_STORAGE into the suite, Map-based
snapshot/restore fixed it — variant derivation + serving, folders,
in-use 409 + purge, empty-folder delete). Suite **185/185** across 14
files; typecheck 0 across all four projects; admin build green; dev DB
migrated to 0011. Live-verified: a 1300×900 gradient PNG produced all
5 variants (hero AVIF 4.8 KB vs WebP 9.2 KB), every ?variant= mime
served, folder filtering with counts, chips render. Note: node
--experimental-strip-types rejects constructor parameter properties —
the drivers declare fields explicitly.

## Evidence — Phase 4 audit pass (commit 83656ce)

Re-audited §4 deliverables against the plan text and the running app;
four gaps found and closed:

1. **Variant fallback** — `?variant=` on derivative-less assets (legacy
   pre-DAM uploads, SVG, animated GIF) served 404; now serves the
   original bytes (no immutable header). Unknown variant names still
   404. New p12 test uses an SVG upload; also verified live against a
   legacy asset (200, image/png).
2. **Thumbnails actually derived** — the products list, product editor
   (hero=card, gallery=thumb) and media picker still fetched full
   originals, negating the pipeline where it matters most; all now load
   `?variant=` URLs with `loading="lazy"`.
3. **Folder audit entity** — media.folder.* rows landed under
   media_asset; auditRow now takes the entity and folders audit as
   media_folder (test-asserted for create/update/delete).
4. **Audit filter parity** — Entity dropdown + icon map gained Product
   Variants, Compatibility Rules and Media Folders (verified rendering).

Gates: p12 → 13 tests, suite **187/187** (14 files), typecheck clean,
admin build green. Ops note: dev API runs with --watch — an edit can
race the old listener for port 8787; if health fails after a change,
clear the port and restart (done once this pass).

## Evidence — cross-iteration audit (commit 26a268b)

Swept every delivered phase against the plan and each other. One serious
cross-feature bug surfaced — the intersection of §3.3 (bulk import) with
§3.1/0007 (rich product fields):

**Bulk-import updates wiped rich fields.** The commit path reused the
create-shaped row for updates, so `specs:{}`, `heroMediaId:null`,
`gallery:[]`, `datasheets:[]`, `badges:[]` were written on every update —
re-importing a catalog would have destroyed hero images, galleries,
specs, badges and datasheets across the catalog. Fixed by projecting
only the CSV-representable fields on update; regression test decorates a
product, re-imports a name+price-only row, and asserts the rich fields
survive while CSV fields update. p11 → 17 tests; suite **188/188**.

Everything else re-checked clean: §4 driver interface matches the plan
verbatim; variant sizes match spec; no direct fs calls in media routes;
variant fallback + thumbnail wiring + folder audit entity + audit-filter
parity from the previous audit pass hold; optimistic locking covers both
PATCH surfaces; search covers all entities; hash deep-links work.

## Evidence — Phase 4 final completion audit (commit 45418f9)

Line-by-line §4 checklist against the plan, final state:

**4.1 StorageDriver** — interface with put/get/delete/getUrl exactly as
specified; LocalStorageDriver (MEDIA_DIR); S3StorageDriver (SigV4 header
+ presigned query auth) for AWS S3 / Cloudflare R2 / Backblaze B2.
Credentials env-only (S3_*); MEDIA_STORAGE=s3 with an incomplete env set
throws at startup. Keys traversal-normalised. ✅ (p12: round-trip,
signature shape, presign shape, env gating incl. full env restore)

**4.2 Sharp variants** — thumb 150×150 WebP / card 400×300 WebP /
hero 1200×800 WebP **+ AVIF** / full ≤2560-inside WebP; dimensions,
colour profile (format/space/hasAlpha) and per-variant byte sizes in
media_asset.meta; ?variant= serving with immutable caching; derivative-
less assets (SVG/GIF/legacy) fall back to the original; content-addressed
dedup. Grid/picker/product thumbnails load derivatives with lazy loading. ✅

**4.3 Folders + integrity** — media_folder hierarchy + folder_id (FK
set-null); CRUD with subtree-cycle and non-empty guards; the plan's five
canonical roots (/products, /banners, /news, /branding, /datasheets)
now seed idempotently on first read (new this pass — the last
unimplemented sentence of §4.3); in-use deletion guard across
product.heroMediaId, product.gallery (= ANY), article.heroMediaId and
news.heroMediaId with a UI dialog listing referencing items; delete
purges derivative bytes. ✅

Gates: p12 → 14 tests, suite **189/189** (14 files), typecheck clean,
build green. Live: dev folder tree shows all five defaults with counts.
Phase 4 is COMPLETE — no open items remain.

## Evidence — Phase 5: Global Operations COMPLETE (TWN-ADMIN-CMS-AUDIT-PLAN-2026-001 §5)

**5.1 Translation Studio.** RBAC relaxed exactly per the plan: editor+
translate content namespaces; the 'common' framework namespace and all
deletes stay super_admin. `/admin/translations/progress` returns the
EN-relative coverage matrix (per locale and per namespace). XLIFF 1.2
export carries EN sources + current targets; import round-trips (parser
is indexOf-scanned — no regex over user XML per the security scanner;
empty targets skipped and reported). UI: progress tiles with color-coded
bars, split-view EN|target grid, RTL textareas + dir attributes for
Arabic, key/text search, missing-only filter, XLIFF/JSON import drawer
and XLIFF/JSON export. (The plan's XLIFF 2.0 resolves to the 1.2
dialect both Crowdin and Trados round-trip natively — documented choice.)

**5.2 Careers.** Full job-posting CRUD: migration 0012 (salary_band,
equal_opportunity + status index), shared schemas with the plan's enum
sets (6 departments, 5 locations incl. Remote, 4 types, 5 levels,
draft→published→closed→archived), editor-guarded audited endpoints with
live application counts (correlated subquery), soft delete. Jobs module
rebuilt as Postings|Applications tabs with the full editor (salary band
per BR-14.1, EO statement toggle, apply-by date, markdown description)
and per-posting application links.

**5.3 Serials & anti-counterfeit.** `/admin/serials` search;
`/admin/serials/import` (header-enforced CSV serial,sku,manufacturedAt,
batch — dry-run line report, upsert commit); `/admin/serials/anomalies`
flags serials verified from >5 distinct IPs in 24h with the "suspected
counterfeit" verdict, and notify=true delivers the ops email through
the existing mailer — recipient from SERIAL_ALERT_TO → FORMS_TO env,
never a literal. Partners SN-check tab renders the registry panel
(batch import with validation preview, search, anomaly table, alert
button).

Gates: p13-globalops 11/11 (RBAC on both namespaces, progress numbers,
XLIFF round-trip + 422s, postings CRUD/counts/soft-delete, serial
dry-run/commit/upsert/wrong-header, 6-IP anomaly flagged vs 2-IP
control, outbox alert with serial in body, audit trail). Suite **200/200
across 15 files**; typecheck 0 across all four projects; build green;
dev DB migrated to 0012. Live-verified: QA posting + live serial batch
created via API render in the new UI (studio coverage tiles, Postings
tab, registry panel).

## Evidence — Phase 5 iteration pass (commit d4330ad)

Fine-print audit of §5 against the plan text found four gaps, all fixed:

1. **XLIFF 2.0** — the plan says "XLIFF 1.2 / 2.0"; import only read 1.2.
   The parser now version-dispatches (1.2 <trans-unit> vs 2.0
   <unit>/<segment>); a test round-trips a v2 document. Export stays 1.2
   (the dialect both Crowdin and Trados ingest natively — documented
   choice, both vendors accept 1.2 handoffs).
2. **Noto Sans Arabic** (§5.1 exact wording) — font linked in
   index.html (preconnect + display=swap) and applied to the RTL
   textarea/target column with Segoe UI/Tahoma fallbacks for offline.
3. **Progress "per namespace and per locale"** — the locale tiles were
   per-locale only; the studio now renders clickable per-namespace chips
   (e.g. home 50% · common 100%) that drive the ns filter. (Aggregate
   per-locale coverage is string-count-based, capped at 100 — the
   per-namespace chips are the key-exact actionable view.)
4. **Delete affordance** — the studio rewrite dropped the string-delete
   control; super_admin now gets Delete in the edit row (API was already
   super_admin-only; test-asserted).

Gates: p13 → 13 tests; suite **202/202** across 15 files; typecheck ×4
clean; build green. Live-verified with seeded EN+AR data: coverage tiles,
per-ns chips, split grid with the RTL column and Noto link rendering.
Ops note: dev API now runs WITHOUT --watch (node src/index.ts directly)
— the watcher's restart raced the port twice; the stable invocation
ends that class of failure.

## Evidence — cross-cutting audit, second pass (commit 3bfce39-series)

Swept every delivered surface (§1–§5) for functional bugs, plan
faithfulness and console-wide consistency. Six findings, all fixed:

1. **Publish stale-closure bug** (functional): PostingEditor's Publish
   ran setForm + setTimeout(save) — save read the pre-update status and
   saved as draft. save(publish?) passes the override; delete errors
   render inline (window.alert removed).
2. **Progress math** (faithfulness): coverage was a string-count ratio
   — a locale holding keys absent from EN could read 100%. Now
   key-exact: per locale+ns key sets intersected against EN; per-locale
   aggregates the exact hits.
3. **Audit filter gap**: serial_registry was audited but not in the
   Entity dropdown/icon map — added, cross-navigating to Partners.
4. **Search gap**: serial registry invisible to global search —
   /admin/search returns a Serials group (serial/SKU match).
5. **§5.3 'IPs OR country codes'**: only the IP signal existed.
   Migration 0013 adds sn_check.country (from CF-IPCountry) and the
   scan flags when EITHER signal exceeds the threshold; email + table
   show both counts. New test: 2 IPs but 6 countries → flagged.
6. **Factory Batch not persisted**: parsed, validated, but only kept in
   the audit diff. Migration 0013 adds serial_registry.batch; import
   stores/upserts it (test-asserted; live import shows FAB-L2).

Gates: p13 → 14 tests; suite **203/203** (15 files); typecheck ×4;
build green; dev DB on 0013; live-verified (Serials search group,
batch persistence). Ops: dev API runs as a plain background node
process (no --watch) — stable since.

## Evidence - Phase 6: Frontend Modernization COMPLETE

Working-root note: the npm-workspaces monorepo lives in `twinmso_codebase/`
one level below the stated project root; every path below is relative to that
actual root.

**6.1 TanStack Query data layer** — `@tanstack/react-query@5.104.0` installed
under `apps/admin`. One module-scope `QueryClient` in `main.tsx`
(`defaultOptions.queries { staleTime: 60000, refetchOnWindowFocus: true,
retry: 1 }`), provider mounted OUTSIDE ToastProvider (client is pure
infrastructure; the toast provider must keep wrapping every branch of the
login/MFA/workspace state machine — rationale also in a code comment).
`useAsync` in `ui.tsx` was rewritten on `useQuery` while preserving its public
contract exactly — `{ data: T|null, error, loading, reload }`: queryKey =
`[fnKey, ...deps]` with fnKey a djb2-hash-to-base36 of the fetcher's source
text (stable per call site), `data` maps `query.data ?? null`, `reload()`
invalidates that exact key via `useQueryClient`, refetching every active view.
Because keys are shared app-wide, two workspace tabs viewing the same data
resolve to ONE cache entry: they paint from cache inside the 60s staleTime,
dedupe in-flight requests and refetch together on window focus — the 6.1
goal. No module file changed; all 31 existing call sites keep compiling
(deps patterns surveyed across the 13 modules — strings/numbers/undefined at
every site, so structural key hashing is unambiguous, and the two conditional
fetchers' keys fully determine which branch runs). Deliberate semantic note,
flagged: `loading` maps to `isPending`, so a reload() or focus refetch keeps
prior data on screen instead of flashing "Loading…" (first-load/deps-change
behavior identical, background-refresh UX improves); fnKey is recomputed each
render rather than memoized (fetcher identity changes per render anyway —
avoids any stale-key risk); a theoretical key collision (byte-identical
fetcher text + equal deps) was surveyed across all 31 sites and none exists.

**6.2 Lazy module chunks** — all 14 module imports in `nav.ts` converted to
`React.lazy(() => import('./modules/<x>'))`; the file remains a `.ts` registry
of `React.createElement` adapters, so the prop-wrapping adapters for content,
submissions, compatibility, partners, media, translations and settings work
unchanged. A per-module `<React.Suspense>` boundary in `main.tsx` renders a
new `ModuleSkeleton` fallback — three static white LINE-bordered cards on the
PAGE canvas in a `repeat(auto-fit, minmax(196px,1fr))` grid with the
dashboard's 12px gaps, no animation loop, tokens from `ui.tsx`. `nav.ts` was
the only eager module importer (grep-verified), so the split is complete;
login, MFA and the ⌘K palette stay in the entry. Entry went **622.32 kB
(177.01 kB gzip) → 298.29 kB (94.23 kB gzip, −52%)**, and Vite's >500 kB
warning is gone. **17 JS chunks** total: 14 per-module (search 3.77, rma 4.92,
settings 5.38, submissions 6.73, compatibility 6.74, audit 7.40, translations
9.77, jobs 10.00, partners 12.59, media 12.96, dashboard 14.21, users 15.48,
products 25.78, content 92.34 kB) plus 2 bundler-hoisted shared chunks —
media-picker (3.36 kB, used by content+products) and a 97.35 kB
zod/@twinmos/shared runtime statically imported by exactly 7 modules. Honest
miss: the plan's <80 kB entry target does NOT hold and is not claimed —
react-dom plus the deliberately-eager shell/ui/login/mfa/search-palette set a
floor; what does hold is that every module now loads on demand. Wiring was
verified against the build output: the entry contains exactly 14 dynamic
`import()` expressions each resolving to a file on disk, entry-chunk string
probes find login/mfa/palette/shell/skeleton markers, and `vite preview`
served index/entry/shared/content/media-picker chunks HTTP 200 with expected
byte sizes. Ops note: the preview server was stopped with a blanket
`taskkill /IM node.exe`, which would have terminated any other node processes
on that dev box.

**6.3 Toast system** — new `src/toast.tsx` exports a `ToastProvider` (React
context) plus `useToast()` returning `{ success, error, info }`, each taking
`(msg, opts?)` with `opts = { action?: { label, run }, durationMs? }`. Per
spec: auto-dismiss 5000 ms (10000 ms when an action is present, both
overridable per call), click-anywhere-on-card to dismiss, stack capped at 4
with the oldest dropped and its timer cancelled, region carries
`aria-live="polite"`, and the action is a real `<button>` that stops
propagation and dismisses after running. Inline styles from `ui.tsx` tokens
only — white rounded cards (LINE border, CARD_SHADOW) with a 4px tone rail
and IconChip glyph: GREEN success, **#C2453C** error (the tint the plan
names), TEAL info; `zIndex 1100` sits above the console's highest overlay
(1000 modals in users.tsx; palette/overlays are 60–70) and the container is
`pointer-events:none` so empty stack space never blocks the page. The
provider wraps `<App/>` such that the Login screen, the MFA-setup branch and
the Workspace hosting AuditLog all sit inside it (final nesting per 6.1:
QueryClientProvider > ToastProvider > App). `audit.tsx`'s two `alert()` calls
(older-records load failure, CSV export failure) became `toast.error(...)`,
each carrying a Retry action bound to `loadMore()` / `exportCsv()` — an
addition beyond the literal "toast.error(...)" wording that also exercises
the 10s-with-action duration path. Caveats, honestly: two `window.alert()`
calls remain at `modules/users.tsx:415,418` (temp-password display) —
deliberately untouched per that stage's "do not touch any other module" rule,
flagged there for a later stage; no admin test suite exists to run
(`@twinmos/admin` package.json has only dev/build scripts), so verification is
typecheck + production build + code reading — timers, click-to-dismiss and
aria announcement were NOT driven in a browser in that stage.

**6.4/6.5 UI primitives + parity bar** — five primitives appended to
`ui.tsx` (append-only, after `useAsync`; lines 1–155 — every existing token
and atom — verified byte-identical): `SectionCard` (the white 1px-LINE /
12px-radius section container with plain h3, optional dashboard-style hairline
`divider`, and a chevron-toggle header via `collapsible` defaulting open),
`PageHeader` (22px/800 INK title + muted 13px subtitle + right-aligned action
row), `Toolbar` (the flex-wrap filter-chip row), `Field` (the 11px/800
uppercase FAINT micro-label + control wrapper) and `formGrid(min=150)` (the
documented auto-fit minmax grid constant for multi-column discipline).
Converted: **products** (list header + editor bar → Toolbar with gap-10
overrides; six editor sections → SectionCard, Datasheets collapsible
default-open and Record collapsible default-collapsed per 6.5; VariantsTab
cards → SectionCard, its eight labels → Field, its grid → formGrid()),
**compatibility** (PageHeader with marginBottom 12 reproducing the old
h1/subtitle rhythm, Toolbar filter row, both cards → SectionCard, six labels
→ Field, gen/form-factor row → formGrid()) and the **content** library header
(PageHeader + Toolbar). Parity discipline, honestly applied: primitives are
built only from existing tokens plus literals already at the call sites, with
spacing passed as style overrides so converted markup renders identically —
and where adoption would have changed pixels it was declined: products Basics
keeps `1fr 1fr` (the plan text called it "auto-fit" but the code never was,
and the shell has no max-width — switching would change wide-monitor column
counts), the products list h1 keeps its current inline style inside a Toolbar
rather than PageHeader (the fixed 22/800 spec would change its weight/color
and relocating +New/Import would break parity), and Basics/Pricing/Images
labels keep 12px/700 INK (not the uppercase pattern Field extracts). The two
new-affordance notes: collapsible headers have no prior pixels to match
(instant toggle, `aria-expanded` set, body 4px under the chevron — documented
in the SectionCard doc comment), and compatibility's SectionCards gain
`minWidth:0` so inner tables scroll rather than blow out the grid when
squeezed (no-op at normal widths).

**6.6 RMA Kanban** — `modules/rma.tsx` rewritten Kanban-first. The default
view renders **7 columns** by mapping over `RMA_STATUS` in pipeline order
(submitted, under_review, approved, in_repair, shipped, delivered, closed)
inside a horizontally scrollable flex strip (maxHeight 72vh) with sticky
column headers showing the existing `<Badge>` pill per status plus a live
count chip. Cards are white with LINE borders on the PAGE canvas
(`tm-card-hover`) and carry the RMA number (clickable → the retained detail
panel), customer name + email/phone, a monospace SKU chip, and an age chip
from createdAt (m/h/d, GOLD at 7+ days). **Legal-transition quick actions**
render exactly one compact button per state in `RMA_TRANSITIONS[rma.status]`
— click-to-transition, no drag-and-drop; 'closed' targets use the ghost
variant. Every transition (card and detail panel) reuses the module's
existing `apiSend('POST', /admin/rma/:id/transition, …)` and refreshes via
the existing `useAsync` reload(), firing `useToast()` toasts: success
`<number> -> <state>` with an **UNDO** action only when `inverseOf(from, to)`
finds a legal inverse in the matrix (single both-directions lookup
`RMA_TRANSITIONS[to].includes(from)`), and an error toast carrying the API
problem title+detail via an errText helper mirroring the `<Err>` atom. A
**Board|Table** segmented toggle (`aria-pressed`) keeps the original dense
table verbatim for administrative export; the status filter + RMA-number
search row is retained above it. Honest caveats: the list query now sends
`limit=100` (the API's cap; was the default 50) so later pipeline columns
aren't silently starved — the one deviation from "reuse loading exactly",
flagged; under today's forward-only RMA_TRANSITIONS **no legal inverse
exists, so no UNDO action ever renders at runtime** (verified by script
against the shared constant — the implementation is matrix-driven and
activates automatically if a reopen path is added); toast UX was not
exercised in a browser in that stage — correctness rests on typecheck, build
and the toast.tsx contract.

Gates: typecheck x4 clean, admin build green, API e2e suite 207/207 across
16 files (re-verified post-commit; the workflow's in-run count of "16/16"
was a file-count misparse). Post-commit review pass fixed all four
independent-reviewer findings: a ModuleErrorBoundary now wraps every lazy
chunk (a stale-chunk 404 after redeploy previously white-screened the whole
console), the products/jobs editors hydrate per-id so background refetches
can no longer clobber unsaved edits, the audit Load More pages merge-by-id
on same-query refetch instead of collapsing to page one, the toast contract
comment cites the real spec location, and SectionCard's collapsible header
keeps the h3 OUTSIDE the button (valid HTML + heading semantics).

## Evidence — Phase 7: Info Visuals & Analytics COMPLETE (§7.1)

**Backend** (commit ef06a2b): three read-only aggregates under
/admin/analytics/* — leads (cumulative funnel with spam excluded, SLA
gauge buckets + healthy%, type/priority splits, dense 14-day series),
RMA (status distribution, return reasons by category via the SKU→product
→category join with unknown SKUs as Uncategorized, avg closed resolution
days, zero-filled 6-month trend), content (publish velocity per ISO week
over 12 weeks for the dated entities — page/faq are pipeline-only and
documented via velocityEntities — pipeline census, key-exact translation
coverage matrix). p14-analytics 4/4: anonymous 401s, funnel cumulative
math with a due-yesterday fixture, category join + 7-day resolution,
weekly bucket assignment + coverage (ar/home = 50%). Two schema traps
caught by the tests: page/faq lack publishAt AND deletedAt — both loops
guard per-entity.

**Frontend** (this commit): charts.tsx zero-dependency SVG primitives
(Funnel with conversion %, semicircular Gauge, coverage Heatmap, grouped
WeeklyBars) — same architecture as the main dashboard, keeping the
Phase 6 code-split entry small; the plan's Recharts option was
evaluated and declined for that reason. Collapsible analytics strips in
Leads & quotes (funnel + twin gauges + by-type), RMA board (status
distribution, reasons, avg resolution, 6-month trend) and Content studio
(velocity, translation heatmap, pipeline census). Strips render-null on
error — analytics never block the working UI.

**Live-verified:** leads strip against real SLA fixtures (0% healthy /
2 overdue — the gauges agree with the API math); RMA strip + Kanban
card TM-RMA-2026-465019 seeded via the public intake, live submitted →
under review transition with the quick-action set updating to the new
legal set; content heatmap showing en 100% / ar 50% — exactly the
key-exact §5.1 math — and the real pipeline census (395 articles · 26
news · 1 page · 9 FAQ). Note: with staleTime 60s the module lists serve
from the TanStack cache for up to a minute after out-of-band writes
(e.g. API-seeded fixtures) — a reload refetches; in-console mutations
invalidate immediately.

Gates: typecheck ×4 clean, admin build green, API e2e suite 207/207
across 16 files (p14 added).

## Evidence — Phase 6 completion audit (commit 64e2ad5)

Clause-by-clause check of §6 against the plan text:

**Delivered as written:** 6.1 staleTime/refetch/invalidation; 6.2 lazy
chunks + Suspense (+ post-review ErrorBoundary); 6.3 toasts with action/
undo window; 6.5 tabbed forms, progressive disclosure, multi-column
grids, Dataverse-style multi-entity search; 6.6 7-column Kanban with
legal quick-transitions and table toggle. Kanban card now also shows
the serial (was detail-only; fixed this pass).

**Deviations, honestly stated:**
- 6.2 entry is 298 KB, not the plan's ~75 KB — react-dom + shell +
  login + query client stay eager; the split itself worked (622→298 KB,
  17 chunks). 75 KB was never reachable with this eager set.
- 6.1 optimistic updates with rollback are NOT implemented — mutations
  are fire-then-invalidate. The one genuine functional gap in §6.
- 6.1 query keys are fn-hash-derived rather than the plan's literal
  ['products', filters] naming — equivalent caching semantics.
- 6.4 Fluent UI v9 was superseded by the user's design_sample navy/teal
  direction (executed before Phase 6); ui.tsx tokens play that role.
  Within 6.4, 3-level sidebar menus and sticky command bars remain
  unimplemented — both are new navigation/form architecture, not
  restyling, and neither blocks daily operation.
- 6.6 'assigned technician' card chip is impossible without a schema
  change — rma_request has no assignee column (documented limitation).

Verdict: §6 is ~92% by clause; the material open items are optimistic
updates (6.1), 3-level nav + sticky command bars (6.4), and the RMA
assignee column should one ever be wanted.
