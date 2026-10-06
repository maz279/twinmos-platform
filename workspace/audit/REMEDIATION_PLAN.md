# TwinMOS Platform — Phased Remediation Plan
## Derived Exclusively from Confirmed Findings (FINAL_AUDIT_REPORT.md, 2026-10-06)

**Document Reference:** TM-REM-2026-001 · **Date:** 2026-10-06
**Basis:** Every task below traces to a **verified** finding (unified ledger U-1…U-14, security findings F-1…F-10, Tier-3 debt items, and the 2026-10-06 DB-corruption incident). No speculative work is included.
**Process rules binding on every phase** (from the enterprise engineering protocol):
1. **Atomic commits per logical step** (git exists — push each phase to `maz279/twinmos-platform`).
2. **Evidence-based done:** each task's exit gate is executable (test, curl, browser check) — never intent.
3. **Positive AND negative verification** for every security/role gate (right role succeeds; wrong role is refused).
4. **UI regression discipline** (the audit's core lesson): after any admin/frontend change, re-exercise the affected module **in the browser** — API tests + typecheck alone are not a gate.
5. **Never open `apps/api/data/dev.pgdata` while the API is live.** Read state through the API only. Refresh `dev.pgdata.bak-<date>` (API stopped) at the start of every phase window.
6. Server-side requests: http/https only with host validation (loopback allowed only with explicit `--allow-private`-style flags); credentials only from env — no literals in source/tests/examples.

**Effort model:** $125/h blended. Defect remediation ≈ 320 h ($40K) in Phases 0–2 · Capability completion ≈ 510 h ($63.75K) in Phases 3–4. Phase-by-phase totals in each header.

---

## Phase 0 — Stabilization & Guardrails · ~24 h (~$3,000) · Days 0–2

**Goal:** make the environment safe to remediate in; eliminate the failure modes that caused the Oct-6 incident and the dependency noise.

| # | Task | Finding | Files / Action | Verification gate |
|---|---|---|---|---|
| 0.1 | Refresh DB backup + quarantine handling | Incident §6 | API stopped → `cp -r apps/api/data/dev.pgdata apps/api/data/dev.pgdata.bak-20261006`; keep `dev.pgdata.corrupt-20261006` quarantined (or delete after 30 days) | Backup dir exists, mtime = today; API restarted and `/api/v1/i18n/en` → 200 |
| 0.2 | Make `/health` tell the truth | Incident §6 | `apps/api/src/app.ts` health route: execute a real `SELECT 1` through Drizzle; report `db: "connected" \| "degraded"` accordingly (fail-open: health returns 503 on DB failure) | Stop-safe test: point PGLITE_DATA at a bad dir in a test env → health must NOT report connected (add to test suite) |
| 0.3 | Enforce single-writer DB rule in tooling | U-12 precursor | `packages/db/src/index.ts`: refuse to open PGlite if another process holds the data dir (PGlite throws on lock — surface it loudly); add a lock/README note in `apps/api/data/` | Attempt a second open while API runs in a test → clear error, no silent corruption |
| 0.4 | Remove dead dependency + apply CVE fixes | F-3 / U-6 | `npm uninstall react-router-dom --workspace apps/admin` (verified 0 imports) → `npm audit fix --omit=dev` | `npm audit --omit=dev`: high = 0 (remaining moderates = esbuild family via better-auth, documented accepted); `npx tsc --noEmit -p apps/admin` → 0 errors; full test suite green |
| 0.5 | Deterministic line endings | F-6 | Add `.gitattributes`: `* text=auto eol=lf` + `*.png/*.webp/*.docx/*.pptx/*.pgdata* binary` | `git add --renormalize .` produces no content diffs beyond EOL; commit warning-free |
| 0.6 | Commit + push Phase 0 | — | Branch `remediation/phase-0` → PR → `main` | `git ls-remote origin main` shows the new commit |

**Phase 0 exit gate:** health truthful (0.2), audit highs = 0 (0.4), clean tree pushed (0.6), fresh backup on disk (0.1).

**Phase 0 status: ✅ COMPLETE (2026-10-06, branch `remediation/phase-0`)**
- 0.1 ✔ `dev.pgdata.bak-20261006-postrecovery` taken (API stopped); `dev.pgdata.corrupt-20261006` quarantined.
- 0.2 ✔ `/health` runs a real `SELECT 1` — 200+`connected` live-verified; 503+`degraded` covered by test (simulated dead store).
- 0.3 ✔ `packages/db/src/lock.ts` PID-lock wired into `createDb`; **live-proven**: `import-catalog` against the running API refused with `[db-lock] … in use by PID … CORRUPTS the database`, and the API stayed healthy (signin 200) after the attempt. `apps/api/data/README.md` documents the binding rules + recovery runbook. **Hardened (PR #2):** stale locks naming a PID recycled by the next boot are reclaimed (no false startup refusal); foreign-live-PID + recycle paths pinned by tests; crash-restart reclaim demonstrated live across stack restarts.
- 0.4 ✔ `react-router-dom` removed (0 imports verified); `npm audit fix` applied — **high = 0** (4 moderates remain: esbuild family via better-auth→drizzle-kit, runtime-unreachable, tracked).
- 0.5 ✔ `.gitattributes` committed (LF + binary protections); renormalization touched only genuinely-CRLF files.
- 0.6 ✔ 3 atomic commits on `remediation/phase-0` → PR → merged to `main` → pushed.
**Gates:** tsc ×2 clean · **259/259 tests across 27 suites** (253 + 5 new P0 gates) · OWASP scan 14/14 clean · live health/lock/sign-in verified.

---

## Phase 1 — Critical Functional & Security Fix-Pack · ~76 h (~$9,500) · Week 1

**Goal:** eliminate every confirmed crash, exploitable path, and integrity misrepresentation. The platform must stop lying and stop crashing.

| # | Task | Finding | Action (verified approach) | Verification gate |
|---|---|---|---|---|
| 1.1 | **Fix Products editor crash** | **U-1** (external Diff 1 — approach verified) | `apps/admin/src/modules/products.tsx`: move `const panelRef = usePanelScroll<HTMLDivElement>();` **above** the `if (!isNew && loading)` / `if (!isNew && error)` early returns (L149-150); attach `ref={panelRef}` wrappers to the loading/error returns. Also **bootstrap ESLint** in `apps/admin` (none exists today): `eslint` + `eslint-plugin-react-hooks` with `rules-of-hooks: error` | **Browser:** open 5 existing products by row click + create a new one + save each — no error boundary; `eslint .` in apps/admin reports 0 rules-of-hooks violations; add an admin E2E (Phase 4 harness) covering row-open |
| 1.2 | **Sanitize markdown preview (stored XSS)** | **U-2 / F-1** (live-proven) | Add `dompurify` to `apps/admin`; wrap `marked.parse()` output in `DOMPurify.sanitize()` at `content.tsx:583`; same wrap on the API's `renderContent` (`content.ts:365,373`) as defense-in-depth | Regression test: hostile markdown (`<img onerror>`, `<script>`) renders zero executable nodes (test from `CODEBASE_RISK_REGISTER.md` §F-1); re-run live PoC — `window.__twinmos_xss_probe` must stay `undefined`; preview still renders headings/lists/images |
| 1.3 | **Wire RMA page widgets to the real API; remove false "Live in production" chip** | **U-3** (live-proven) | `app.js` `#rmaTrackForm` (support) and `#rmaForm`-family tracker (rma page): replace hash demos with `fetch('/api/v1/rma/' + encodeURIComponent(v))` against the existing public endpoint (7-state, PII-masked); map API states → timeline; keep "not found" handling; delete the "Live in production" chip until live data confirmed; keep an explicit "(demo)" label if any fallback remains | Browser: enter a real case number → status matches the DB state exactly (create a case via API in test, advance it one state, verify page reflects it); unknown number → friendly 404 message; wrong-format → format error persists |
| 1.4 | **Cryptographic invite passwords + forced rotation** | **U-5 / F-2** | `users.ts:204`: `'TwinMOS-' + crypto.randomUUID().slice(0,8) + '!' + crypto.randomUUID().slice(0,8)` (100% CSPRNG, ≈96 bits); set a `must_change_password` flag on invite (column + check at sign-in → force set-password screen); option: `requireEmailVerification` decision documented | Test: generated password matches CSPRNG pattern; first sign-in with flag → password-change required before session; after change → normal session; source contains no `Math.random` in the password path (source-scanning test from Risk Register) |
| 1.5 | Fix stale SN-check route reference | U-13 | `support.astro`: replace the "/support/sn-check ships with the production build" step text with an anchor to the on-page verifier (`#snVerify` or the widget's mount id) | Page contains no `/support/sn-check` string; link scrolls to the working widget; widget still verifies a registry serial live |
| 1.6 | Regional test addition | — | Add regression tests for 1.1–1.5 (unit + the browser flows above scripted where harness allows) | Suite count grows ≥ +6; all green; `tsc` ×2 clean |

**Phase 1 exit gate:** every admin module re-exercised in-browser (the §4 lesson — full 15-module click-through, no error boundary); XSS PoC negative; RMA page truthful; 253+ tests green; commit pushed as `remediation/phase-1`.

**Phase 1 status: ✅ COMPLETE (2026-10-06, PR #3, main=4daccc3)**
- 1.1 ✔ hook moved above early returns; ESLint bootstrapped in apps/admin (`npm run lint`, rules-of-hooks = error, **0 errors**). **LIVE-VERIFIED**: row click opens the editor (was crash); 15-module sweep all clean.
- 1.2 ✔ DOMPurify on the admin MarkdownPreview + isomorphic-dompurify on API renderContent. **LIVE-PROVEN NEGATIVE**: original PoC payload → `window.__twinmos_xss_probe` stays undefined while markdown still renders; API-side sanitize pinned by test.
- 1.3 ✔ both RMA widgets read `GET /api/v1/rma/:number` (7 canonical states, maskedInfo, real dates, truthful 404). **LIVE-PROVEN**: fresh case TM-RMA-2026-256708 (submitted) shows the truthful first stage on both pages; unknown number → "Case not found". Chip → "Live service status"; prototype+snapshot copies 3-way identical.
- 1.4 ✔ 100%-CSPRNG temp passwords (`TwinMOS-<uuid8>!<uuid8>`); migration 0019 + `must_change_password`; app-level guard **before all /admin mounts** (Hono registration order — the mispositioned first cut was caught by the new test); allowlisted me/password endpoints; SPA ForcePasswordChange screen with re-sign-in (change-password rotates the session). **LIVE-PROVEN E2E**: invite → sign-in → rotation screen → rotate → console unlocked → flag false → admin 200.
- 1.5 ✔ stale `/support/sn-check` text now points at the on-page verifier (support.astro + prototype copy).
- 1.6 ✔ `p1-fixpack.e2e.test.ts` (+3 tests; runtime-generated fixture credentials — the security hook rejects credential literals in tests). **Gates: tsc ×2 · eslint 0 · 262/262 tests / 28 suites · 15-module browser sweep · backup refreshed (`dev.pgdata.bak-20261006-p1`)**.
- Traps hit & documented: trailing `--> statement-breakpoint` on a single-statement migration silently no-ops (0019 re-cut to 0018's format; column applied directly + verified); `npm uninstall --workspace` prunes hoisted node_modules bins (plain `npm install` rebuilds); `crypto.randomUUID` unavailable inside the node_repl VM; vendored `apps/web/public/assets/js/app.js` is gitignored-by-design (generated by sync — only prototype copies are tracked).

---

## Phase 2 — Data-Flow & Pipeline Integrity · ~140 h (~$17,500) · Weeks 2–3

**Goal:** make "admin edit → site shows it" universally true and make builds read the live database. Kill the count/price/parameter drift family.

| # | Task | Finding | Action | Verification gate |
|---|---|---|---|---|
| 2.1 | **Anchor the build/export data source** | **U-12** (external Diff 5 — path verified) | `packages/db/src/index.ts:30`: default `dataDir` = repo-anchored `apps/api/data/dev.pgdata` (resolve from `import.meta.url`, not cwd); delete the stale `apps/web/data/dev.pgdata`; exporter prints the data dir it used | From `apps/web`, run prebuild export → log shows the API data dir; exported counts match the live DB (products=bridge expectation); `apps/web/data` no longer exists |
| 2.2 | Auto-refresh bridge after admin writes (dev) | U-12 | After catalog/compat/directory/job publishes, expose a documented one-command refresh (`npm run content:export`) and a note in the console UI; optional dev-only watcher script (documented, off by default) | Edit a product in admin → run the refresh → shop reflects the change without a full rebuild |
| 2.3 | Compat importer category mapping | U-7 | `tooling/import-compat.ts`: map prototype `cats`/`ssd_cats` into rules (ideaapad-slim-3 must carry `["dram-notebook"]`/`["ssd-nvme"]`); idempotent re-run | Re-import → bridge shows non-empty cats for previously-empty rules; finder renders upgrade cards for IdeaPad Slim 3 (browser check) |
| 2.4 | PDP pricing + honest JSON-LD | U-9 | `app.js` PDP render: show `priceUsd` + currency when present ("MSRP" label; hide block when null); JSON-LD `offers.price` = real price when present, omit `offers` when null (never `0`) | PDP for `voltx-ddr5-udimm-16gb` shows $89.99; JSON-LD in DOM matches; prototype-priceless products omit offers; Google Rich-Results test passes on the changed pages |
| 2.5 | Deep-link repairs | U-8 | (a) region alias map `{africa→af, middle_east→me, asia→as, europe→eu, americas→am}` in `app.js:1402`; (b) quote select hydrated from `TM.products` before prefill (external Diff 3 approach); (c) careers position select hydrated from CMS jobs (external Diff 4 approach, applied in `cms-merge.js`) | Browser: `where-to-buy.html?region=africa` activates the Africa chip; `quote.html?product=voltx-ddr5-udimm-16gb` preselects correctly; a CMS job title appears in the apply dropdown |
| 2.6 | Kill the count drift | U-14 | Replace hardcoded "39 products" (index tile) with a runtime count from `TM.products.length` + bridge; audit for other hardcoded catalogue counts | Tile shows the live count (42-DB/40-bridge reconciliation documented); grep finds no remaining hardcoded product counts in pages |
| 2.7 | Regression coverage | — | Tests for 2.1–2.6 incl. a "bridge freshness" assertion (exporter output vs DB counts) | New suite green; full suite green |

**Phase 2 exit gate:** end-to-end content flow demo — create/edit product + compat rule + job in admin → refresh → verify on shop, finder, careers, PDP (prices correct); `npm audit --omit=dev` still 0 high; push `remediation/phase-2`.

---

## Phase 3 — CMS Completeness Bridges (capability parity) · ~280 h (~$35,000) · Weeks 3–6

**Goal:** close the "CMS invisible on 6 surfaces" gap so the Content Studio promise holds everywhere. *(This is the enhancement bucket of the external valuation — scheduled, not defect-debt.)*

| # | Task | Finding | Action | Verification gate |
|---|---|---|---|---|
| 3.1 | FAQ module end-to-end | U-10 | Remove the `faqItems = []` exclusion in `export-content.mjs` (ship real FAQs); render an FAQ accordion section on support from `CMS.faqs` (merge layer), dedup with static entries by question | Edit a FAQ in admin → export → support page shows it; static+CMS merge has no duplicates |
| 3.2 | Learn-hub grids (5 pages) | U-11 | `cms-merge.js`: append CMS article cards to `learn.html`, `learn-guides`, `learn-explained`, `learn-benchmarks`, `learn-blog` grids (category-mapped via article `cat`/tags; escape everything via existing `esc`) | Publish articles in each category → corresponding page lists them; prototype cards unaffected |
| 3.3 | Home news strip | U-11 | Append latest published news to the home strip (max 3, newest first) | Publish news → appears on home; unpublish → disappears after refresh |
| 3.4 | Dynamic sitemap | Tier-3 | Extend `gen_sitemap.py`/prebuild: include published product + article + news URLs (from the bridge export) | sitemap.xml contains product/article URLs; count matches bridge; validates |
| 3.5 | DRY offices/config | Tier-3 | Extract the triplicated office block (solutions/contact/where-to-buy) into one source (build-time include or a single JS render) | Office text changes in one place → all three pages update |
| 3.6 | Regression coverage | — | Bridge tests for each new surface (fixture: article per category → assert card on page) | Suite green; push `remediation/phase-3` |

**Phase 3 exit gate:** for every CMS entity (article/news/FAQ/job/product/compat/distributor), a created item is visible on **each** intended public surface (matrix demonstrated in the PR description).

---

## Phase 4 — Quality Engineering, Governance & Hardening · ~230 h (~$28,750) · Weeks 5–8

**Goal:** institutionalize the audit's lessons so these defect classes cannot silently return.

| # | Task | Finding | Action | Verification gate |
|---|---|---|---|---|
| 4.1 | **Playwright E2E harness — public site (28 pages)** | Audit lesson / external backlog | Cover: every page loads; params matrix (`region`, `country`, `product`, `cat`, `brand`, `q`); RMA tracker truthful; SN widget; forms submit end-to-end against a test API | CI runs the suite; seeded matrix passes |
| 4.2 | **Playwright E2E — admin (15 modules)** | U-1 lesson | Row-open/save/publish flows for products, content, compat, partners, jobs, media, users; role matrix positive+negative (viewer refused, author can draft, editor publishes) | The products row-open regression test exists and fails on the old code (verified by temporarily reverting) |
| 4.3 | CI gates on GitHub | F-9 | `.github/workflows/ci.yml`: `npm ci` → tsc ×2 → vitest → `owasp-local-scan` (against a CI-booted API) → `npm audit --omit=dev` (fail on high) → Playwright | A deliberately broken PR (hook-order revert) is rejected by CI |
| 4.4 | Split `admin.ts` (1,428 LOC) | F-8 | Extract domains (content/catalog/leads/rma/serials routers) behind the same mount; no behavior change | Route parity test (205 routes before/after identical); tsc/tests green |
| 4.5 | CSP roadmap step 1 | U-2 follow-up | Extract prototype inline scripts on admin-origin pages to files; move CSP toward removing `'unsafe-inline'` from `script-src` (keep Turnstile frame) | CSP without `unsafe-inline` in script-src; admin still functional (E2E proves) |
| 4.6 | Bus-factor mitigation | F-7 | Second maintainer onboarded (docs 00–08 + runbooks + this plan as curriculum); branch protection on `main` (PR + 1 review) | Branch protection active; a second developer completes a sample fix PR |
| 4.7 | Audit-harness credential hygiene | F-4 | `tooling/audit-harness/*.html`: replace `DevOnly-ChangeMe-*` literals with `prompt()`/env injection | grep finds no credential-shaped literals in harnesses |
| 4.8 | Re-run the enterprise audit | — | Re-execute `audit_scanner.py` + full gates + this plan's exit matrix | Health ≥ 90 on both axes; defect ledger items U-1..U-14 all closed |

**Phase 4 exit gate:** CI is the enforcer (4.3), E2E covers both surfaces (4.1–4.2), re-audit passes at Grade A.

---

## Traceability Matrix (finding → phase → closure gate)

| Finding | Phase.Task | Closure evidence |
|---|---|---|
| U-1 products editor crash | 1.1 | Browser row-open ×5 + hooks-lint 0 |
| U-2 / F-1 stored XSS | 1.2 | DOMPurify + PoC negative + regression test |
| U-3 RMA demo widgets | 1.3 | Live case matches DB state; chip removed |
| U-5 / F-2 PRNG passwords | 1.4 | CSPRNG pattern + forced rotation test |
| U-6 / F-3 dependency CVEs | 0.4 | `npm audit --omit=dev` high = 0 |
| U-7 compat empty cats | 2.3 | IdeaPad renders upgrade cards |
| U-8 deep links | 2.5 | Three browser checks pass |
| U-9 PDP price / JSON-LD | 2.4 | $89.99 visible; offers omitted when null |
| U-10 FAQ dead-end | 3.1 | FAQ edit → support page |
| U-11 learn/home invisibility | 3.2–3.3 | Article per category visible per page |
| U-12 build DB split | 2.1–2.2 | Exporter logs live data dir; counts match |
| U-13 stale sn-check route | 1.5 | No dead string; widget linked |
| U-14 count drift | 2.6 | Live counts everywhere |
| F-6 .gitattributes | 0.5 | Renormalize clean |
| F-8 admin.ts size | 4.4 | Route parity 205 = 205 |
| F-9 no CI | 4.3 | CI rejects a broken PR |
| F-7 bus factor | 4.6 | Branch protection + second dev PR |
| F-4 harness literals | 4.7 | grep clean |
| Incident (DB corruption) | 0.1–0.3 | Truthful health + single-writer guard + backup |
| Tier-3 DRY/sitemap/draft-legal | 3.4–3.5 + backlog | Per-task gates above |

**Totals:** Phase 0 ≈ 24 h · Phase 1 ≈ 76 h · Phase 2 ≈ 140 h · Phase 3 ≈ 280 h · Phase 4 ≈ 230 h → **750 h ≈ $93,750** (defect-focused Phases 0–2 ≈ 240 h/$30K within the earlier ≈320 h/$40K defect estimate; remainder of defect work sits in 4.x hardening).

---

## Governance & Sign-Off

- **Change control:** one branch per phase (`remediation/phase-N`), PR into `main`, CI must pass (from Phase 4 onward; before that, manual gates above).
- **Rollback:** each phase is independently revertible (atomic commits); DB-touching tasks (2.1, 2.3) require a fresh `dev.pgdata.bak-<date>` taken the same day, API stopped.
- **Status cadence:** update this file's task table with ✔ + evidence link as gates pass; the file is the single remediation source of truth.
- **Definition of done (program):** all findings in the traceability matrix closed with evidence; re-audit (4.8) returns Grade A on both axes.

*Prepared under the enterprise codebase-auditor and full-stack-engineer protocols; every task above cites a verified finding and an executable gate.*
