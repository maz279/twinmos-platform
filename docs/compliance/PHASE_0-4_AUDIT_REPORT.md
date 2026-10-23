# Phase 0–4 comprehensive audit report (last verified 2026-10-23)

**Milestones:** Phase 01 (R0) through Phase 04 (MS4.1–MS4.8, Gate C/VC-C)  
**Repository:** `twinmso_codebase` (working tree; no commits were created)  
**Companion:** [`PHASE_0-4_MATRIX.md`](PHASE_0-4_MATRIX.md) — task-by-task status.

## Executive summary

The previous `docs/STATUS.md` declared Phases 01–04 “COMPLETE (100%)”. The audit could not reproduce that claim. The code contains many genuine implementations, but the verification layer was partly static/self-referential, the Compose and CI pipelines could not run as written, several security and data defects were open, and most Phase 04 tasks were partial.

This remediation fixed the critical code, security, data and verification defects and rebuilt the evidence. It did **not** silently mark the remaining partial tasks as done: the matrix records every one, and the external blockers are listed below.

## Critical findings (all fixed in code)

1. **CI was unusable.** Job-wide `NODE_ENV=production`, root `npx vitest run` bypassing the API vitest config with a Postgres URL set, Gate B without started services, an echo-only PostgreSQL job, and `verify.yml` calling non-existent workspace scripts.
2. **Compose could not boot.** Missing fatal API env (`INTERNAL_WEB_URL`, mail vars), edge proxying to `127.0.0.1` inside its own container, wrong PG18 volume path, missing healthchecks, and assets not reachable through the edge.
3. **Deploy config was invalid.** `twinmos.conf` had an unquoted `{8,}` regex; `nginx -t` failed. The legacy redirect map was missing entirely.
4. **Security:** `/health/deep` accepted the literal `internal-dev-check` in every environment; invited partners never got a verification link; password reset did not clear the durable lockout.
5. **Sitemap was wrong:** `.html`, `/product.html?id=`, `/articles/*.html`, `/news/*.html`, and a locale list that did not match the app.
6. **Phase 4 was mostly partial:** menu editor wrote `settings.menus` while the chrome read `nav_menu`; forms were broken on clean URLs; localisation 301’d every non-English path; data-bound blocks were literal; several entity editors and the page tree were missing; the truth register was self-signed text.
7. **Verification integrity:** `walk-public` passed against the prototype fallback, axe could scan 404 pages, `verify-ms48` only checked file existence, and several Phase 01–03 checks were simulated.

## The five iterations

### Iteration 1 — security, sitemap, CI, Compose
- Removed the hardcoded deep-health bypass; deep health now accepts only the configured `REVALIDATE_SECRET` (with a non-production dev fallback).
- Password reset clears `failed_login_count`/`locked_until` via Better Auth’s `onPasswordReset`.
- Partner invites send a real Better Auth verification email.
- Sitemap emits clean `/products/<slug>`, `/learn/<slug>`, `/news/<slug>`, `/about` paths; 404/redirect utility pages excluded.
- CI: test env for vitest, `npm test --workspace @twinmos/api`, real image builds, PG18 integration job, API+web started before Gate B, edge `nginx -t` with host aliases.
- Compose: fatal env supplied, service-name upstreams, asset fallback to web, PG18 volume path, API/web healthchecks; `docker compose config` passes.
- Added the versioned `deploy/nginx/twinmos-redirects.map` (103 mappings) and verified redirects in the built edge image over HTTPS. Fixed the nginx regex.
- `verify.yml` fixed (Node 24, correct migrate/seed scripts, API+web startup).

### Iteration 2 — Phase 4 functional gaps
- **Menu editor**: rebuilt on the real `nav_menu` API (`apps/admin/src/modules/menu-editor.tsx`): per-locale load/save, tree, keyboard moves, drag/drop, target validation, outbox; live-verified (100 header items).
- **Forms**: clean-URL detection in `forms.js`, `data-form-type`, consent enforcement, `#qProduct` prefill; quote submission verified end-to-end (`QT-2026-…`).
- **Localisation**: middleware now serves a published locale variant and 301s only when none exists; `[locale]/[...slug].astro` renders translated pages; Arabic `lang="ar" dir="rtl"` verified with a published `ar` page.
- **Data-bound blocks**: `productShowcase`, `whereToBuy`, `downloadDatasheet`, `qvlCompatibility`, `articleList`/`glossaryIndex` read delivery entities; `widgets-init.js` mounts advisor/speed/flagship islands from typed config.
- Removed the baked category-tile fallback and fixed contrast/autocomplete violations.

### Iteration 3 — truth, editors, content
- Roadmap-named invented offices (Dubai JAFZA, Hong Kong, 2025 Gateway) unpublished; unverified distributors unpublished; compatibility rules marked `unverified`.
- Publish gate added for offices/testimonials (source + approver), with a non-blocking title-only edit path.
- Page parent selector added to the content editor.
- Generated, HMAC-signed `docs/ENTITY_TRUTH.md` from CMS rows (118 rows) instead of self-asserted signers.
- Corrected milestone audits that contradicted the truth policy or live data (MS4.3 draft notice, MS4.4 category counts, MS4.5 distributor count, MS4.7 truth/editor checks).
- Added `verify-vc-c-audit.mjs` (`npm run verify:vc-c`), which executes MS4.1–MS4.8 and the Phase 04 suites.

### Iteration 4 — verification integrity
- `walk-public` now walks the live SSR server and no longer falls back to the prototype.
- Fixed nested-route asset paths in `layout-init.js` (`/assets/js/...`, `/sw.js`).
- `verify-ms48` now executes the XLIFF and full-reflection suites; `verify-ms47` validates the generated register and the new editor.
- Fixed the API preview route to verify HMAC tokens (it previously only looked in a never-populated map), and updated preview tests to the signed-token contract.
- Fixed the revision-count expectation (every transition snapshots), the illegal-transition probe, the data-patch policy fixture, and the sitemap test expectations.

### Iteration 5 — full re-audit
- Typecheck: 0 errors/warnings/hints.
- Full Playwright E2E: **68/68 passed** (including the new locale/RTL suite).
- Axe: 29 routes, **0 violations** (AXE-01/02).
- Walk: **29/29 clean**, 0 JS/CSP errors against the live SSR server.
- Manual suite: passed.
- MS4.1–MS4.8 milestone audits: green (with the corrected expectations).
- Full API suite (final): **54/54 files, 588/588 tests passed, 0 skipped** (`evidence/ms42/api_suite_final4.log`).
- VC-C (MS4.1–MS4.8 + Phase 04 suites + GREF-C): **10/10 CLEARED** (`evidence/ms48/vc-c_final.log`, `gate-c-audit.json`).
- MS1.1–MS3.7 milestone audits: all green after correcting stale checks (MS1.1 16/16, MS1.2 20/20, MS1.3 43/43, MS1.4 52/52, MS1.5 26/26, MS1.6/VC-R0 47/47, MS2.3 18/18, MS2.4 13/13, MS2.5 13/13, MS2.6/VC-A 35/35, MS3.3 15/15, MS3.4 7/7, MS3.5 9/9, MS3.6 11/11, MS3.7 12/12, Gate B 18/18).

### Iteration 5 (continued) — issues found by the second full pass

The first pass left several defects that only surfaced when every gate was re-run against the fixed site. All are fixed:

1. **RTL pages rendered blank.** `.skip-link{left:-9999px}` shifted the initial viewport off-content under `dir="rtl"`, so every Arabic page painted white. Replaced with a vertical off-screen technique (`top:-64px; inset-inline-start:16px`); `e2e/locale.spec.ts` now asserts that `/ar` actually paints pixels.
2. **Every CMS navigation link was a 301.** The importer stored prototype `.html` hrefs (158 occurrences in the header alone). `cleanInternalUrl()` now strips `.html` aliases and rewrites `/shop.html?cat=` to `/shop?cat=`; the 179 anchors were re-imported and all resolve directly.
3. **Locale/SEO URLs disagreed with the site.** hreflang alternates still pointed at `/ar.html`; the sitemap omitted all eight locale landings and per-locale sitemaps returned English URLs. Alternates now use `/{locale}`, the sitemap includes the landings and localised CMS pages, and per-locale sitemaps are locale-only.
4. **Nine CMS widget types rendered nothing.** `widget:compare`, `compat-finder`, `rma-tracker+serial`, `rgb-lab`, `upgrade-advisor` and `speed-visualizer` had no dispatcher cases (the compare page had no comparison tool; the RMA form was absent). All are rendered from CMS headings now, and `promo-card` has a renderer.
5. **Four composite forms were empty.** `form+tracker`, `form+steps`, `form+contact-cards` and `form-pair` were not handled, and their blocks carried no HTML. The Phase D seeder maps them to the generic form dispatcher with the page's registry type; existing rows were patched. Form actions now target the real `/api/v1/forms/:type` endpoint instead of a non-existent `/delivery/.../submissions` path.
6. **Published testimonials could lack written permission.** The API enforced source/approver but not permission evidence. Publishing now requires `permissionFlag=true` and non-empty `permissionEvidence`; probe-created leftovers were removed and the probe cleans up after itself.
7. **Two verification scripts were invalid.** The G-PARITY baselines had been captured with the main content missing (home desktop showed only header/footer) and the RMA route pointed at a 404 (`/support/rma`). Baselines were regenerated from the verified SSR pages with animations frozen, and the route corrected to `/rma`.
8. **CI built the client catalogue before the API was up**, silently baking the 39-product prototype snapshot. CI/verify workflows now start the API first; `build-catalog-data` refuses a prototype-only catalogue under CI.
9. **The p95 delivery test was a one-spike max.** It now uses 50 samples after 5 warm-ups, and the Gate B timeout in MS3.7 was raised from 3 to 10 minutes (the gate legitimately takes longer).

## Verification snapshot

| Check | Result |
|---|---|
| Typecheck | 0 errors, 0 warnings, 0 hints |
| MS4.2 live audit | 18/18, GREF-C cleared |
| MS4.7 live audit | 12/12 |
| MS4.3 / MS4.4 / MS4.5 / MS4.6 / MS4.8 | 12/12 each |
| MS3.5 | 9/9 |
| Playwright E2E | 68 passed |
| axe (29 routes) | 0 violations |
| WALK-PUB (live SSR) | 29/29 |
| Manual suite | passed |
| Edge `nginx -t` | syntax ok |
| `docker compose config` | valid |
| Full API suite | 54 files, 588 tests passed, 0 skipped (`evidence/ms42/api_suite_final4.log`) |
| Gate A | 11/12 — the only failure is BUILD-01 provenance, which requires a committed (clean) tree; see external blocker 3 |
| Gate B | 18/18 |
| VC-C / Gate C | 10/10 CLEARED |

## Remaining partial work (not falsely marked done)

The full task-level list is in the matrix. The material items are:

- **T4.3.3/T4.3.4:** policy version compare UI/endpoint and a legal-owner approval workflow are missing; the legal flag remains self-asserted.
- **T4.5.4:** empty spec dictionary/template and missing admin controls for featured/launch/coming-soon/warranty tier.
- **T4.5.5/T4.5.6:** FAQ labels/hubs and some distributor/marketplace admin fields are missing.
- **T4.6.2:** the scheduler is a 60 s in-process poll; “on time” is not proven.
- **T4.6.4:** page parent selection exists, but a full drag-reorder page tree does not.
- **T4.7.1/T4.7.2:** truth is enforced for offices/testimonials; products/articles/pages/policies still lack source/approver columns, and the broader invented-copy audit is content-owner work.
- **T4.7.3/T4.7.4:** no admin editors for offices/testimonials/form definitions. The public forms now render from CMS blocks through the generic dispatcher and post to the real `/api/v1/forms/:type` endpoint; publishing testimonials requires permission evidence.
- **T4.7.5:** `translation_group` for products/articles/menus and the locale activation completeness gate are missing; only page-level resolution is implemented.
- **T4.7.7/T4.8.1/T4.8.3/T4.8.4:** block editors still lack entity pickers; articles list lacks manual selection/learning paths; Translation Studio stores shadow translations and does not apply them to entity delivery.
- **T4.8.2:** every widget type now has a renderer, but the stored widget configs are not typed/canonical; several renderers fall back to prototype-equivalent defaults rather than CMS-authored options.
- **T4.8.5:** 56 reflection tests are green but do not cover every block/entity lifecycle.

## External blockers

1. **Docker Hub auth failed in this environment**, so `docker compose up` and image builds could not be executed; configs are validated and edge `nginx -t` passes.
2. **No staging VM, branch protection, DNS/Cloudflare authority, or legal sign-off** — these are outside the repository.
3. **272 uncommitted paths** remain; no “pushed main” gate can be proven until the owner commits.
4. **Content-owner decisions** remain for drawer labels (13 missing/9 relabelled), the authentic office list, distributor evidence and policy texts.

No commits were created.
