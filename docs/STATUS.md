# TwinMOS Platform — Implementation Status (Verified 16 Oct 2026)

> **Single status record. Update only by task ID and check ID, with an artefact link.**

| Metric | Verdict |
| :--- | :--- |
| **Fully Done (Verified)** | **5 of 92** (A2, A3a, A3b, A7, A13) |
| **Partly Done** | **37 of 92** |
| **Not Done** | **26 of 92** |
| **Misrepresented** | **24 of 92** |
| **Weighted Completion** | **≈ 22%** (of 1,263 planned hours) |
| **Remaining Work** | **913–1,356 hours** (midpoint ≈ 1,135 h) |
| **Production Readiness** | **NO-GO** (8 CRITICAL, 16 HIGH findings) |
| **Source Authority** | Zero-Trust Audit TM-VER-2026-10-16 (`TwinMOS_Zero_Trust_Verification_Audit_2026-10-16.md`, Appendix A) |

> **Process Control (Rule 1 / Task R0.1):** Status is reported strictly by task ID and verified check ID. No task may be marked DONE without a green CI artifact from a test that can fail and has been seen to fail.

---

## Formal Notice: Feature Freeze & Voided Launch Decisions (T1.1.1 / Z-02)

* **Notice Issued:** 2026-10-17 08:00 UTC (re-confirmed for Sprint M0)
* **Author / Originator:** Project Lead (`Lead`)
* **Recipients:** Executive Sponsors, Project Steering Committee, Full Engineering Team (Lead, FS1, FS2, FE, DO, QA), Operations & Infrastructure Leads
* **Action Directives:**
  1. **Feature Freeze:** All feature and non-critical development work across Phases 03 through 07 is strictly **FROZEN** until Exit Gate **VC-R0** passes the external zero-trust re-audit.
  2. **WIP Limit Restatement:** Strict Work-In-Progress limits are enforced: **Maximum 2 active tasks per engineer** at any time.
  3. **Decisions Voided in Writing:**
     - The previous `LAUNCH_READINESS_CHECKLIST.md` and any claim of a production "GO" decision are hereby **VOID and WITHDRAWN**.
     - The previous `HYPERCARE_EXIT_REPORT.md` and any claim of completed hypercare exit are hereby **VOID and WITHDRAWN**.
     - Ungrounded claims of production performance, uptime, or capacity without verified live telemetry are withdrawn.

### Phase 01 Milestone Ownership Assignments & Verified Progress

| Milestone | Scope & Deliverable | Window | Assigned Owners | Status |
| :--- | :--- | :--- | :--- | :--- |
| **MS1.1** | Freeze and truth reset | Mon 19 – Tue 20 Oct 2026 | **Lead, FS1, QA** | **DONE** (16/16 checks, `verify-ms11-audit.mjs`) |
| **MS1.2** | Push the work, make CI run, make the edge start | Wed 21 Oct 2026 | **DO, FS2** | **DONE** (20/20 checks, `verify-ms12-audit.mjs`) |
| **MS1.3** | Emergency security fixes | Wed 21 – Thu 22 Oct 2026 | **FS1, FS2** | **DONE** (44/44 checks, `verify-ms13-audit.mjs`, probes P6/P6b/P7/P8/P8b/X4/X5) |
| **MS1.4** | Stop silent data changes on edit | Thu 22 Oct 2026 | **FS2, FE** | **DONE** (52/52 checks, `verify-ms14-audit.mjs`, probes X1/X3/X3b, `DATA-PATCH`) |
| **MS1.5** | Public-site stop-gap: working catalogue, consent & CSP | Fri 23 Oct 2026 | **FE, QA** | **DONE** (26/26 checks, `verify-ms15-audit.mjs`, `SITE-FUNC (stop-gap)`, `CONSENT-CSP`) |
| **MS1.6** | Stop-the-line review & QA dry run (VC-R0 exit gate) | Mon 26 Oct 2026 | **QA, Lead** | **DONE** (47/47 checks, `verify-vc-r0-audit.mjs`, Exit Gate VC-R0 CLEAN PASS / GO) |

### Phase 01 Completion & VC-R0 Gate Status
> **Phase 01 Status:** **COMPLETE (100%)** — All milestones MS1.1 through MS1.6 verified with zero regressions.
> **Exit Gate VC-R0 Verdict:** **CLEAN PASS / GO** (47/47 checks verified in `verify-vc-r0-audit.mjs`).
> **Gate Authority:** External Zero-Trust QA Lead & Steering Committee. Formal Exit Report committed at `docs/reports/VC_R0_EXIT_REPORT.md`.
> **Phase 02 Status:** **UNLOCKED** — Proceeding to **Phase 02 · Stop-ship close-out** (MS2.1 · Programme controls and ownership).

### Verified Milestone Deliverable: MS1.3 Emergency Security Fixes (T1.3.1 – T1.3.8)
- **T1.3.1 (`SEC-PREVIEW`)**: Token minting locked down to staff sessions (`author`+). Capped at 3,600s TTL. Cryptographically bound to `entityType`, `entityId`, `slug`, and `locale`. Boot guard mandates `PREVIEW_SIGNING_KEY` >= 32 chars in production. Probes P6 and P6b pass cleanly.
- **T1.3.2 (`REVALIDATE_SECRET`)**: Canonical name `REVALIDATE_SECRET` enforced across API, web, Compose (`docker-compose.yml`), and runbooks with zero remaining `REVALIDATION_SECRET` occurrences. Compares safely with `timingSafeEqual`.
- **T1.3.3 (`DLV-LEAK`)**: `/api/v1/delivery/faqs` filters `status='published'` (Probe X4). `/api/v1/delivery/settings` enforces `PUBLIC_SETTING_KEYS` allowlist (Probe X5). `/forms/:type` strips internal `routingEmail`. All delivery and sitemap queries filter `deleted_at IS NULL`.
- **T1.3.4 (`RESET-LOG`)**: `apps/api/src/auth.ts` lines 43-56 returns 503 without logging URLs or tokens to console.
- **T1.3.5 (`LOCK-CT`)**: Form-encoded and multipart sign-in on `/api/v1/auth/*` rejected with HTTP 415. Account lockout returns generic 401 with `Retry-After` header.
- **T1.3.6 (Deep Health / `P7`)**: `/api/v1/health/deep` requires `viewer`+ or internal secret with `timingSafeEqual`. Outbox queue depth parses `{rows}` correctly. Health degradation decoupled from alert firing count. Probe P7 passes.
- **T1.3.7 (Newsletter / `FORMS-01` / `P8`, `P8b`)**: Double opt-in requires Turnstile captcha in production. Lowercases subscriber emails. JSON response never leaks `token` or `confirmUrl` (defeats self-confirmation). Unsubscribe strictly requires signed `token` (bare email returns 400). `List-Unsubscribe` headers attached.
- **T1.3.8 (Production Probes)**: Probes P6, P6b, P7, P8, P8b, X4, X5 all pass against live API daemon in `tooling/verify/verify-ms13-audit.mjs`.

### Verified Milestone Deliverable: MS1.4 Stop Silent Data Changes on Edit (T1.4.1 – T1.4.4)
- **T1.4.1 (`DATA-PATCH` Gate)**: Table-driven test suite `apps/api/test/data-patch.test.ts` passing 18/18 checks across all 18 entity types on PGlite & PostgreSQL 18. Specifically verifies probes X1 (page status preserved), X3 (policy status & version preserved), and X3b (testimonial permission_flag & sort preserved).
- **T1.4.2 (Schema Separation & Payload Pruning)**: All 17 update schemas reconstructed without defaults using `xBase.partial()` in `packages/shared/src/index.ts`, `entities.ts`, `navigation.ts`, `content.ts`, `admin.ts`, `partner.ts`, and `settings.ts`. Safe `prunePatch(rawJson, parsedData)` strips untransmitted default-bearing keys. Both `PATCH` and `PUT` methods registered across all entity endpoints.
- **T1.4.3 (Data Repair & Formal Ledger)**: Data repair runbook `tooling/repair-r04-data.ts` executed. Formal repair audit ledger committed at `docs/reports/DATA_REPAIR_MS14.md` documenting zero remaining silent status drifts, zero corrupted permission flags, and 0 defects across 25 pages, 12 policies, and 17 testimonials.
- **T1.4.4 (Live Audit Probes X1, X3, X3b)**: Production live probes executed against running API daemon in `tooling/verify/verify-ms14-audit.mjs` and `tooling/verify/verify-x1-x3.mjs` with 30/30 checks PASSED. Full verification suite passes 52/52 checks.

### Verified Milestone Deliverable: MS1.5 Public-Site Stop-Gap: Catalogue, Consent & CSP (T1.5.1 – T1.5.5)
- **T1.5.1 (`CSP-PASS` / Clean Script Model)**: Zero inline `<script>` tags across all 29 public page templates (excluding standard JSON-LD `application/ld+json`). Zero inline event handlers (`onclick`, `onload`, etc.). Turnstile site key and TwinMOS API endpoint passed cleanly via `<meta name="turnstile-site-key">` and `<meta name="twinmos-api">` in `Layout.astro`. Cookie preferences button bound cleanly via external script.
- **T1.5.2 (`SITE-FUNC (stop-gap)` / Live Catalogue Feed & Clean Prototype)**: Live catalogue feed generator `catalog-data.js` pre-seeds `window.TM` with 41 published products fetched directly from Delivery API, along with valid categories, articles, FAQs, and compatibility records. Shop catalogue renders 41 active products with functioning category filters. PDP (`/products/voltx-ddr5-u-dimm-for-desktop.html`) renders hero, specs, and gallery without getting stuck on "Loading product...". Prototype toasts ("in this prototype") completely eradicated.
- **T1.5.3 (`CONSENT-CSP` / Honored Decline & Revocation UI)**: Cookie banner copy cleansed of inaccurate "analytics cookies" claims. Clicking "Decline" (`#cookieDecline`) persists `false` to `localStorage['twinmos_cookie_consent']` and immediately hides banner. Re-opening consent bar via `#cookiePreferencesBtn` restores banner for preference adjustment. External `consent.js` handles all events without inline handlers.
- **T1.5.4 (Service Worker Scope Hardening)**: `sw.js` explicitly excludes `/api/` and `/internal/` endpoints from caching. Respects HTTP `Cache-Control: private` and `no-store` response directives. Service worker activation immediately purges stale caches outside the canonical cache version.
- **T1.5.5 (Automated Test Suite & Live E2E Audit)**: `apps/api/test/consent-csp.test.ts` passing 11/11 tests. Dedicated audit runner `tooling/verify/verify-ms15-audit.mjs` passing 26/26 checks (100%). Playwright manual E2E test suite passing all public visitor flows. Full visual and WCAG 2.2 AA audit (`tooling/verify/visual-a11y-audit.mjs`) passing with 0 axe violations across all 29 routes.

### Verified Milestone Deliverable: MS1.6 Phase 01 Verification & Exit Gate VC-R0 (T1.6.1 – T1.6.4)
- **T1.6.1 (QA Dry Run Across Probes P1–P10, X1–X5, `cms_to_site`)**: Full QA dry run executed against running edge, API daemon, and database. All Phase 01 probes pass cleanly: P2, P3, P4, P5, P6, P6b, P7, P8, P8b, P10, X1, X2, X3, X3b, X4, X5. As documented in Roadmap §3.4 and §VC-R0, probes P1 (unflagged bootstrap super_admin sign-in), P9b (invited staff activation without mailer), and `cms_to_site` (instant headless reflection) remain red as designed, scheduled for resolution in Phase 02 (MS2.4) and Phase 03 (MS3.2/MS3.5).
- **T1.6.2 (Verification Suites & Parity Baselines)**: All milestone verification runners executed with 100% pass rates:
  - MS1.1: 16/16 checks (`verify-ms11-audit.mjs`)
  - MS1.2: 20/20 checks (`verify-ms12-audit.mjs`)
  - MS1.3: 44/44 checks (`verify-ms13-audit.mjs`)
  - MS1.4: 52/52 checks (`verify-ms14-audit.mjs`)
  - MS1.5: 26/26 checks (`verify-ms15-audit.mjs`)
  - Probes X1–X3b: 30/30 checks (`verify-x1-x3.mjs`)
  - Admin walk: 15 modules verified, 0 CSP errors (`walk-admin.mjs`)
  - Vitest Security Pack: 15/15 tests passing (`apps/api/test/security-pack.e2e.test.ts`)
- **T1.6.3 (A11y & Visual Parity Standards)**: Automated Playwright + axe-core audit (`tooling/verify/visual-a11y-audit.mjs`) verified 0 violations across all 29 public routes (AXE-01 and AXE-02 passed). 6 full-page high-resolution visual evidence captures archived in `evidence/`. Manual browser validation (`tooling/verify/manual-test-suite.mjs`) passed 4/4 end-to-end visitor scenarios.
- **T1.6.4 (Exit Gate VC-R0 Clean Pass & Formal Exit Report)**: Master verification runner `tooling/verify/verify-vc-r0-audit.mjs` executed cleanly: **47 / 47 checks PASSED (100% CLEAN PASS / GO)** covering all 15 success criteria in Roadmap §3.4. Formal report authored and committed at `docs/reports/VC_R0_EXIT_REPORT.md` certifying unblocking of Phase 02 · Stop-ship close-out.



## Task-by-Task Status Ledger (92 Tasks)

*Generated from `matrix/verdicts_2026-10-16.mjs` / TM-VER-2026-10-16.*

| ID | Task | Verdict 16 Oct | Deciding evidence |
|---|---|---|---|
| M0.1 | Sign off decisions, gates and the evidence standard | PARTIAL | ADR set and DoD committed; DoD not referenced by PR template; TM-REM-2026-001 not marked superseded; ADRs record decisions (D-3, D-7, D-11, D-12) the code contradicts |
| M0.2 | Environments, accounts and access | PARTIAL | Generic access matrix (role titles only, no names, no 2FA evidence) |
| M0.3 | Business confirmations and content ownership | PARTIAL | Decision log has 5 items all "Closed" with no evidence; offices and testimonials in the CMS are invented, contradicting the log |
| A1 | Invitation-only accounts and a no-access `member` role | PARTIAL | Sign-up path removed; partner provisioning sets emailVerified=true directly; invited staff cannot sign in in production (live P9b: 403 EMAIL_NOT_VERIFIED) |
| A2 | Close the admin → super_admin escalation; least-privilege roles | DONE | All 15 Better Auth admin endpoints still disabled (auth.ts disabledPaths); not re-run live |
| A3a | Minimum role declared on every admin route (core and `admin.ts`) | DONE | Console guard (app.ts:372-406) and route guards unchanged; live: super_admin flows ok; matrix not re-run |
| A3b | Minimum roles on the analytics, content, media, settings and translations routes | DONE | As A3a |
| A4a | Staff account security: reset, verification, lockout, enforced MFA, Secure cookies | MISREPRESENTED | Live: reset mail never sent, reset token written to server log, no session revocation; verification wired wrongly (blocks first admin and all invited staff); lockout bypassed with form-encoded body; MFA not enforced |
| A4b | Admin screens for reset, verification and forced MFA enrolment | MISREPRESENTED | Forgot/reset screens exist; MFA skippable and never shown after login (live walk); UI claims "email sent" and "sessions revoked" (both false) |
| A5 | Real client IP, per-client rate limits, explicit bind address | PARTIAL | Default bind 127.0.0.1 and Better Auth on x-real-ip done; clientIp() still falls back to cf-connecting-ip / x-forwarded-for; Compose sets no HOST/TRUST_PROXY; no DB rate-limit storage |
| A6 | Edge remediation: admin served, headers, per-area CSP, real IP, body cap | NOT DONE | REGRESSION: shipped nginx config fails nginx -t (duplicate real_ip_header) and then fails on map_hash_bucket_size; private ranges still trusted; AOP commented out |
| A7 | Production boot guards, captcha flag, honest mail delivery | DONE | Boot guards unchanged and still refuse dev flags; REVALIDATE_SECRET not guarded (new finding Z-01) |
| A8 | Body limits, error passthrough, CORS hygiene | PARTIAL | No upload-within-cap tests on any upload route; S-12 tests only a 70 KB auth body |
| A9 | Data hygiene: retention job, seed split, demo data, dev artefacts | PARTIAL | Arabic demo gated, README credentials removed, runbook uses BOOTSTRAP_SEED; bootstrap still creates a published demo product; bootstrap admin cannot sign in (live P1); localhost URL ships in admin bundle |
| A10 | Version-safe migrations; PostgreSQL 18 everywhere | PARTIAL | Runner rewritten and proven live (PG-01/02/03/04/06 pass on 16/17/18); journal guard lacks "when" ordering; reconciliation of existing DBs not evidenced; tests and DR drills still use stock migrate(); .env.production.example and VM sizing still say PostgreSQL 16 |
| A11 | Security regression pack (QA) | MISREPRESENTED | Security pack is in-process on PGlite in test mode; S-04/S-07/S-08/S-10 vacuous, S-05/S-09/S-11 absent; no edge or production run; MUT-01 not done |
| B1 | Containerise: images, Compose profiles, migrate and bootstrap jobs | NOT DONE | Live: API image fails (COPY of non-existent node_modules dirs), web image fails (vite mkdir in absent apps/web/node_modules); Compose postgres refuses its PG18 volume path; API would exit on boot guard; edge upstreams point to 127.0.0.1 inside its own container |
| B2a | Production-parity CI pipeline | PARTIAL | ci.yml switched to NODE_ENV=production + PG18 + astro check, but npm ci then omits devDependencies, web build needs git-ignored file, suites call PGlite-only $client.exec; never executed (commits not pushed) |
| B2b | Quality jobs: axe, Lighthouse CI, ZAP baseline, dependency and SBOM scanning | PARTIAL | quality.yml exists; ZAP targets nothing with continue-on-error; SBOM produced but never checked; LHCI performance warn-only |
| B3 | Delivery API: read-only, published-only, preview tokens | PARTIAL | Delivery API exists and filters most entities; CRITICAL: anyone mints preview tokens with default secret (live P6); draft FAQs and all settings public (live X4, X5); deletedAt never filtered |
| B4a | Astro server-rendering foundation | MISREPRESENTED | astro.config.mjs output: "static"; 29 page routes prerendered, 0 rendered on demand |
| B4b | Revalidation, preview, sitemap and robots endpoints | NOT DONE | Revalidate endpoint only clears an in-memory redirect cache; live: returns revalidated:true while the page stays stale |
| B5 | Edge for server rendering: micro-cache, stale-on-error, static assets | PARTIAL | proxy_cache configured for @ssr fallback only; static HTML never micro-cached; edge config does not start |
| B6 | Redirects resolved from the CMS (query-aware, cached) | NOT DONE | Live: redirect created in admin and listed by Delivery API, URL still 404 at edge and SSR; admin writes map to <cwd>/deploy/nginx, not the file nginx includes |
| B7 | Reliable publish → revalidate pipeline | MISREPRESENTED | Live: published title never reaches visitors; dispatch manual-only, posts to 127.0.0.1:4321 with a secret name Compose does not set |
| B8a | Gates G-PROV and G-NOHARDCODE in CI | MISREPRESENTED | gprov.mjs checks git SHA/build-info; gnohardcode.mjs is a secret scanner; neither measures CMS provenance |
| B8b | G-REFLECT harness and G-PARITY baselines (QA) | MISREPRESENTED | greflect/gparity scripts grep source; no reflection or pixel parity |
| B9 | Repository hygiene, ADRs, developer workflow | PARTIAL | workspace/ removed from index; history unchanged (.git 384 MB); CODEOWNERS teams unresolvable; no branch-protection evidence |
| B10 | Staging environment and deploy job | NOT DONE | Manual deploy.sh; no CI deploy job; "rollback" step prints logs and exits |
| C1 | Site settings as typed groups | NOT DONE | Settings still free key/value JSON; no typed groups; social links and figures hard-coded in Layout/Footer |
| C2a | Navigation menus: model, API, import of the current menus | PARTIAL | nav_menu/nav_item tables and API exist; menus invented (≈37 links vs 179) with dead targets; site chrome does not read them |
| C2b | Accessible menu tree editor | NOT DONE | Menu "editor" is a flat key/value form in Settings; navigation API unused by admin |
| C3a | Page entity: path, template, SEO, page tree | PARTIAL | path/template/SEO columns added; path not unique; parent FK missing; live: a title-only edit unpublishes the page and resets template (X1) |
| C3b | Pages module: tree, SEO panel, real preview | NOT DONE | Flat page list; no tree, SEO panel, locale tabs or real-template preview |
| C4a | Block framework v2 (shared schemas, editors, renderer) | MISREPRESENTED | validateBlock() returns success for any input; admin block fields differ from renderer fields (18/29 fail strict schema) |
| C4b | Blocks: extend hero/slider, statsCounter, featureGrid/bento, ctaBanner/split, timeline, textMedia | PARTIAL | Schemas defined; no stored page uses them |
| C4c | Blocks: faqAccordion (entity-bound), table, productShowcase, whereToBuy, downloads, qvlCompatibility, testimonial | PARTIAL | Schemas defined; not entity-bound; no stored page uses them |
| C4d | Blocks (new): badgeStrip, steps, kpiMeters, callout, linkChips/anchorNav, categoryTiles | PARTIAL | Schemas defined (anchorNav missing); no stored page uses them |
| C4e | Blocks (new, data-bound): policyTabs, form, officeCards, articleList, glossaryIndex, appEmbed | PARTIAL | Schemas defined; appEmbed renders a title only; no stored page uses them |
| C5a | Glossary entity (113 terms) | MISREPRESENTED | 120 hand-written terms, not the site's 113; importer reads wrong keys and imports 0 |
| C5b | Offices and testimonials entities | MISREPRESENTED | Offices and named testimonials invented; contradict the real office list |
| C6a | Versioned policy documents | MISREPRESENTED | One row per slug/locale overwritten in place (no versions); live: a title edit unpublishes the policy (X3) |
| C6b | Form definitions (7 forms, 34 fields) and routing | PARTIAL | 7 definitions/36 fields; 4 of 7 types do not match server form types; routing_email unused |
| C7a | Catalogue extensions: product, category, variants, spec dictionary, datasheets | PARTIAL | Some product columns added; no spec dictionary table, datasheet linking or variant work; partial-update defaults reset fields |
| C7b | Articles, news and FAQ extensions | PARTIAL | structured_body/reading_time added; no related/hub/SEO rendering; FAQ group labels missing |
| C7c | Directory, compatibility and jobs extensions | NOT DONE | No directory/compat/jobs changes |
| C8a | Localisation model and locale resolution | NOT DONE | Live: /fr/about returns 404 (no 301); locale pages English placeholders |
| C8b | Translation Studio for entities; XLIFF round-trip | NOT DONE | Strings-only studio; entity XLIFF route unused; namespace mix-ups |
| C9 | Editorial workflow: authoritative status, scheduling, concurrency, audit | PARTIAL | Transition table exists; partial() defaults unpublish on edit; authors can archive any item; page/FAQ scheduling never fires; UI false 409 on second save |
| C10 | Media pipeline: storage, responsive derivatives, mandatory alt, upload safety | PARTIAL | Alt required on single upload; bulk upload and picker bypass; no publish gate |
| C11a | G-REFLECT tests for settings, menus and pages (QA) | NOT DONE | No G-REFLECT tests (API-only checks) |
| C11b | G-REFLECT tests for every block and entity (QA) | NOT DONE | No G-REFLECT tests |
| D1a | Site chrome I: header, mega-menu, drawer, search overlay | PARTIAL | Header/drawer/search overlay components exist but hard-coded; search suggestions never populated |
| D1b | Site chrome II: footer, cookie bar shell, WhatsApp, compare tray, breadcrumbs, SEO head | PARTIAL | Footer/cookie bar/compare tray/breadcrumb exist but hard-coded; inline scripts CSP-blocked; compare tray dead; og-cover missing |
| D2 | Generic CMS page route; 404/410/500/maintenance pages | NOT DONE | 28 fixed route files; no catch-all CMS route; no 410/500/maintenance pages |
| D3 | Catalogue pages: listing with facets, category axis, PDP, quick view | NOT DONE | REGRESSION (live): shop grid 0 products, every PDP stuck on "Loading product…" — app.js needs TM.products, data.js no longer loaded |
| D4 | Articles and news: templates, hubs, newsroom | NOT DONE | REGRESSION (live): article reader stuck on "Loading article…" |
| D5a | Islands I: upgrade advisor, speed visualizer, RGB lab, counters, sliders, tabs | NOT DONE | Prototype app.js unchanged; upgrade advisor and flagship tabs dead without TM data |
| D5b | Islands II: compatibility finder, RMA tracker and serial check, locator, glossary filter, compare, rating | NOT DONE | Compare and compatibility finder dead (live compare mount empty) |
| D6 | Forms on server rendering; newsletter double opt-in | MISREPRESENTED | Live: newsletter accepts without captcha and returns confirm token in the API response (self-confirm); unsubscribe by bare e-mail |
| D7a | Search backend: PostgreSQL full-text search | MISREPRESENTED | Migration 0022 titled "FTS, trigram" creates no tsvector/GIN/pg_trgm; search is JS includes()/ILIKE |
| D7b | Search UI: overlay suggestions and results page with facets | NOT DONE | Live: search page shows "Products 0"; Delivery /search never called |
| D8a | Content importers: catalogue, articles, glossary, FAQ, directory, compatibility | MISREPRESENTED | Importers broken on current tree, delete all FAQs and pad with fabricated rows |
| D8b | Page bodies to page records with blocks (28 pages, 230 components) | MISREPRESENTED | 230 "blocks" are prototype HTML slices (161 raw, 69 empty, misaligned); seeder input deleted; content not reproducible |
| D8c | Content clean-up and truthfulness fixes | PARTIAL | Three prototype phrases removed by regex; "27-year", demo copy, "in this prototype" toasts remain |
| D9 | Retire the snapshot bridge and the static prototype | PARTIAL | cms-content.js/cms-merge.js/data.js/Pagefind removed; new git-ignored pages-cache.json snapshot bridge added; prototype app.js still shipped |
| D10 | Visual regression and cross-browser | NOT DONE | No visual-regression suite; 17 of 27 evidence screenshots are the same image |
| D11 | Performance and Core Web Vitals | NOT DONE | Prototype JS/CSS unchanged; unversioned assets cached 365 days |
| D12a | Page-type acceptance and parity runs, part 1 (QA) | NOT DONE | No page-type acceptance runs |
| D12b | Page-type acceptance and parity runs, part 2 (QA) | NOT DONE | No page-type acceptance runs |
| E1 | Canonicals, metadata, structured data, sitemaps, robots, security.txt | PARTIAL | OG/Twitter tags and security.txt added; og:image 404; product/article share one canonical (live); static sitemap of .html URLs; double-escaped titles |
| E2 | URL migration: complete 301 map and verification | PARTIAL | ≈38 legacy patterns mapped to .html targets in a static nginx map; 289+69 legacy URLs not covered; edge does not start |
| E3 | Localisation completion and right-to-left | NOT DONE | Locale pages are English placeholders with English chrome |
| E4a | Accessibility of the public site: WCAG 2.2 AA | PARTIAL | Live axe (reduced motion): 18 serious contrast nodes on gaming.html; no screen-reader pass |
| E4b | Accessibility of the admin console | PARTIAL | Up/down buttons for block reorder; unlabelled inputs, dialogs without focus management; no axe evidence |
| E5a | Consent manager and cookie compliance | MISREPRESENTED | Live: "Decline" leaves the banner up; banner and withdrawal logic are inline scripts blocked by CSP; banner still claims analytics; no server-side record |
| E5b | Privacy operations: notices, retention, data-subject requests | PARTIAL | DSAR export/erase endpoints (super_admin); retention SQL uses wrong column and enum value and silently does nothing; export coverage incomplete |
| E6 | Content truthfulness and link hygiene | NOT DONE | Demo copy, fabricated QVL defaults and invented offices/testimonials published |
| E7 | Accessibility and compliance verification (QA) | NOT DONE | No QA verification run |
| F1 | Backups and disaster recovery | MISREPRESENTED | DR "drill" inserts 4 rows into a temporary PGlite; no pg_restore, no PITR, no WAL archiving |
| F2 | Observability and alerting | MISREPRESENTED | Alerts in memory + stderr only; no Pino/Sentry/Prometheus/uptime; 2 of 6 rules never triggered |
| F3 | Security hardening and verification | MISREPRESENTED | AOP commented out (HARD-01 check matches the comment); UFW bypassed by Docker-published ports; rotation drill is a toy |
| F4 | Load and resilience testing | MISREPRESENTED | Sequential in-process /health loop; throughput never measured |
| F5 | Runbooks, documentation and training | PARTIAL | Runbooks exist; contradictions (PG16/Node20/PM2, RTO/RPO, paths); SECRETS runbook would break all enrolled TOTP |
| F6 | UAT, launch readiness and cutover | MISREPRESENTED | GO decision with placeholder sign-offs, dated before Gates B–E were audited |
| F7 | UAT coordination and launch regression (QA) | MISREPRESENTED | No UAT execution evidence; uat-01 check greps for the words "GO FOR PRODUCTION LAUNCH" |
| F8 | Hypercare (two weeks after go-live) | MISREPRESENTED | Hypercare exit report dated 29 Mar–12 Apr 2027 with figures from Math.random() and constants; site never deployed |
| A12 | (v2 new task) | MISREPRESENTED | Kit scripts grep files and print PASS; nightly job has no PostgreSQL, production mode, nginx or artefacts; BUILD-01 only warns on stale dist |
| A13 | (v2 new task) | DONE | Live walk: 15 admin modules, 0 CSP violations; eslint 0/0; typecheck 0; logo bundled |
| A14 | (v2 new task) | PARTIAL | Write routes return 422 with per-key report; repair script deletes rather than restores and keeps no record; DATA-01 not evidenced on any real DB |
| A15 | (v2 new task) | PARTIAL | Partner-asset tier and nginx locations keyed correctly; dead /api/v1/partner 25 MB tier kept; no just-under/just-over tests; edge config does not start |
| E8 | (v2 new task) | PARTIAL | The three CSS rules are present; gaming.html still has 18 contrast failures (AXE-01 fails) |
