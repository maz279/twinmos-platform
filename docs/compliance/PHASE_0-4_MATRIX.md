# Phase 0–4 compliance matrix (audited 2026-10-22)

**Scope:** roadmap v3.1, Phases 01–04 (R0 through Gate C/VC-C), 25 Phase 04 tasks and the Phase 01–03 gates.  
**Method:** task-by-task source audit, all milestone audits, full API/E2E suites, live API/web checks, Docker/nginx checks.  
**Status key:** DONE = done-when met with executable evidence; PARTIAL = implementation exists but an explicit requirement/done-when is unmet; MISSING = no material implementation; EXTERNAL = needs infrastructure/authority outside the repository.

> `docs/STATUS.md` previously claimed Phases 01–04 were 100% complete. That claim was not reproducible; this matrix is the current truth. Do not treat a milestone audit alone as evidence when the audit is static or self-referential.

## Phase 01 — stop the line

| Milestone | Status | Evidence / remaining gap |
|---|---|---|
| MS1.1 Truth reset | PARTIAL | Freeze/ADR/status docs exist; duplicate screenshots remain; exit report is dated before the phase window; `STATUS.md` chronology was inconsistent. |
| MS1.2 Push work, CI, edge | PARTIAL | CI workflows exist and were repaired in this audit (test env, workspace vitest, image builds, edge `nginx -t`); the working tree is still uncommitted (239 changed paths), branch protection is EXTERNAL, and the PG18 integration job is new/not yet run in GitHub. |
| MS1.3 Security fixes | DONE (code) | Preview HMAC/TTL, delivery allow-list, lockout, newsletter double opt-in verified; `internal-dev-check` bypass removed; MS1.3 audit **43/43**. |
| MS1.4 Silent data changes | PARTIAL | `data-patch` 18/18 on PGlite; PostgreSQL 18 execution is covered by the new CI job but has not been observed in this environment. |
| MS1.5 Public-site stop-gap | PARTIAL | CSP/consent/SW fixed; `walk-public` and the static axe audit still have a prototype/`dist` fallback path and need to run against the live SSR server. |
| MS1.6 VC-R0 | PARTIAL | VC-R0 audit self-runs; no independent audit artifact; branch/uncommitted criteria unsatisfied. |

## Phase 02 — stop-ship close-out

| Milestone | Status | Evidence / remaining gap |
|---|---|---|
| MS2.1 Programme controls | PARTIAL | DoD/ADRs/access matrix exist; branch-protection evidence and CI artefact links are EXTERNAL. |
| MS2.2 Verification kit | PARTIAL | `verify.yml` repaired (Node 24, correct db/seed scripts, API+web start); several MUT checks are still synthetic and `walk-public` still has a prototype fallback. |
| MS2.3 Database/data hygiene | PARTIAL | Journal/advisory lock real; only 4 drizzle snapshots exist for 30 migrations; PG16/17/18 fresh-migrate matrix not executed here; AXE checks are static. |
| MS2.4 Account security | PARTIAL | MFA/lockout/reset verified; invited partners now receive a real verification link; reset clears the durable lock; production sign-in PG18 test not run here. |
| MS2.5 Edge/real IP/limits | PARTIAL | `clientIp`, Cloudflare ranges and tiers are real; through-edge body-limit proof and Compose runtime are EXTERNAL (Docker Hub auth failed here). |
| MS2.6 Security pack/VC-A | PARTIAL | Security pack 21/21 on PGlite; not through nginx/PG18; VC-A report chronology was wrong. |

## Phase 03 — platform foundation

| Milestone | Status | Evidence / remaining gap |
|---|---|---|
| MS3.1 Delivery API | DONE (code) | Published-only query layer, cache tags, contract/leak tests green; staging p95 is EXTERNAL. |
| MS3.2 Server rendering | PARTIAL | SSR/clean URLs/route cache real; no full SSR-01 A1–A18/F1–F6 scenario artifact; edge may duplicate CSP on SSR responses. |
| MS3.3 Reproducible content | PARTIAL | CONTENT-REPRO runs on PGlite; G-PROV/G-NOHARDCODE are source-level heuristics, not the roadmap's rendered-sentinel/AST methods. |
| MS3.4 Containers/CI | PARTIAL | Dockerfiles/compose configs repaired (env, upstreams, PG18 volume, healthchecks, `nginx -t`); image build/up is EXTERNAL because Docker Hub auth fails in this environment. |
| MS3.5 Publish ≤5s | PARTIAL | Revalidation/outbox/redirect map real; sitemap clean-URL defect fixed; preview cache bypass header mismatch remains; nginx preview wiring not proven. |
| MS3.6 Reflection/parity | PARTIAL | G-REFLECT fixture exists; it hardcodes dev credentials and G-PARITY baselines are current-build screenshots, not prototype baselines. |
| MS3.7 Staging/deploy | MISSING (EXTERNAL) | No staging VM; deploy/rollback scripts run on the CI runner and are simulations; quality jobs lack a started stack. |

## Phase 04 — CMS content model and editors

| Task | Status | Evidence / remaining gap |
|---|---|---|
| T4.1.1 Page constraints | DONE | Migration 0024 + compound path index; audit 17/17. |
| T4.1.2 One block definition | DONE | 30-types shared schema, strict validation, migrations; API rejects invalid blocks with 422. |
| T4.1.3 Admin uses shared schemas | DONE | Admin block definitions import shared; 30/30 defaults validate. |
| T4.1.4 Safe renderer | DONE | DOMPurify allow-list; no raw CMS `set:html` on typed fields. |
| T4.1.5 Complete block list | DONE | `anchorNav`/`specComparison` present in shared + admin. |
| T4.1.6 Contract tests | DONE | `blocks-contract.test.ts` + MS4.1 audit 17/17. |
| T4.2.1 Typed settings | DONE | 8 groups, delivery + `site` tag, defaults merge, chrome consumption, live G-REFLECT. |
| T4.2.2 Settings editor | DONE | 8 group editors, shared defaults, super_admin gate, field-level 422. |
| T4.2.3 Menus per locale | DONE | `(code, locale)` unique, trees, validated URLs/references, computed labels. |
| T4.2.4 Import 179 links | DONE | 179 anchors imported, portable path, article seeding, all targets resolve. |
| T4.3.1 113 glossary terms | DONE | Importer hard-fails unless 113; delivery/filtering tests green. |
| T4.3.2 Unpublish invented terms | DONE | 113 published, invented rows removed. |
| T4.3.3 Policy version table | PARTIAL | Version rows/retrieval/legal gate exist; no version-compare UI/endpoint and no policy admin editor; a hard-coded fallback date remains in `BlockDispatcher`. |
| T4.3.4 Legal approval gate | PARTIAL | Publish requires `legalApproved`; the flag is self-asserted by an editor and there is no legal-owner sign-off artifact (EXTERNAL). |
| T4.4.1 Core blocks | PARTIAL | Schemas/renderers/tests exist; G-REFLECT is one combined page, not per-block rendered reflection. |
| T4.4.2 Parity | PARTIAL | G-PARITY compares against current-build baselines, not prototype renders. |
| T4.4.3 Secondary blocks | PARTIAL | Renderers exist; category-tiles fallback counts were removed, but there is no per-type G-REFLECT. |
| T4.5.1 Mandatory alt | DONE | Upload + publish gate + tests. |
| T4.5.2 Responsive delivery | DONE | Sharp variants + `ResponsiveImage`; block images still use plain `<img>`. |
| T4.5.3 Upload safety | PARTIAL | Magic-byte/SVG/10MB checks real; original bytes are stored unchanged (only derivatives re-encoded). |
| T4.5.4 Catalogue extensions | PARTIAL | Tables/API exist; spec dictionary/template are empty and have no admin UI; product editor lacks featured/launch/coming-soon/warranty-tier controls. |
| T4.5.5 Articles/news/FAQ | PARTIAL | Delivery/SEO/related exist; FAQ has no `label`; article admin cannot set hero/SEO/category/tags. |
| T4.5.6 Directory/compat/jobs | PARTIAL | API/delivery exist; distributor/marketplace admin fields incomplete; no G-REFLECT per entity. |
| T4.6.1 Status transitions | PARTIAL | Content entities enforced; products still accept direct status PATCH. |
| T4.6.2 Scheduling | PARTIAL | In-process 60s poll, not “on time”; test calls the sweep manually. |
| T4.6.3 Concurrency | DONE | If-Match, stale-save 409, restore verified. |
| T4.6.4 Pages module | PARTIAL | Locale/SEO/preview exist; page parent selector added, but no full tree reorder UI. |
| T4.6.5 Settings/menus/pages G-REFLECT | DONE | `c11a-reflection.test.ts` 8 groups/3 menu kinds/7 templates. |
| T4.7.1 Unpublish invented records | PARTIAL | Roadmap-named Dubai JAFZA/Hong Kong/2025 Gateway offices are now draft; distributors draft; compatibility marked unverified. Broader invented-copy audit remains content-owner work. |
| T4.7.2 Source/approver | PARTIAL | Publish gate added for offices/testimonials; pages/products/articles/glossary/policies still lack source/approver columns. |
| T4.7.3 Offices/testimonials | PARTIAL | API + delivery + permission flags; no admin editor; contact/about/careers still hard-code different office lists. |
| T4.7.4 Form definitions | PARTIAL | 7 definitions, every CMS form (contact/quote/RMA/careers/partners) renders and posts to the real `/api/v1/forms/:type` endpoint; consent and product prefill enforced. No admin form-definition editor yet. |
| T4.7.5 Localisation | PARTIAL | D-8 resolution serves published locale variants and 301s otherwise; all 8 locale landings render (RTL blank-page bug fixed), hreflang and sitemap use clean `/{locale}` URLs. `translation_group` for products/articles/menus and the required-set activation gate remain. |
| T4.7.6 Menu tree editor | DONE (code) | Rebuilt on `nav_menu`: per-locale load/save, tree, keyboard moves, drag/drop, target validation, outbox; verified live. |
| T4.7.7 Entity-bound blocks | PARTIAL | FAQ/testimonial bound; productShowcase/whereToBuy/downloadDatasheet/qvl now read delivery data; admin block editor still lacks groupKey/pickers. |
| T4.7.8 Truth register | PARTIAL | Regenerated from CMS rows with per-row hashes + HMAC signature; only truth-bearing entities with source/approver are covered. |
| T4.8.1 Data-bound blocks | PARTIAL | articleList/glossaryIndex/policyTabs/form/officeCards + product/download/whereToBuy/qvl now bound; articleList lacks manual selection/grouping/learning paths. |
| T4.8.2 appEmbed islands | PARTIAL | `widgets-init.js` mounts advisor/speed/flagship; every widget type (compare, compat-finder, RMA tracker, RGB lab, advisor, speed visualizer, locator, listing, search, glossary, category chips) now has a renderer. Stored configs are not typed/canonical and several use prototype-equivalent defaults. |
| T4.8.3 Translation Studio | PARTIAL | Entity tab/XLIFF/encoding checks exist; translations live in a shadow table and are not applied to entity delivery. |
| T4.8.4 XLIFF round-trip | PARTIAL | Strings round-trip; entity rows are not restored. |
| T4.8.5 Full reflection | PARTIAL | 56 reflection tests green; missing specComparison/anchorNav/articleList/glossaryIndex/appEmbed and several entity lifecycles. |
| T4.8.6 Gate C audit | DONE (new) | `verify-vc-c-audit.mjs` executes MS4.1–MS4.8 + the Phase 04 suites; `verify:vc-c`. |

## Cross-cutting fixes in this audit

- Removed the hardcoded `internal-dev-check` health bypass; aligned tooling to `REVALIDATE_SECRET`.
- Password reset clears the durable lockout; partner invitations send a real Better Auth verification link.
- Sitemap now emits clean product/article/page routes only (no `.html`, `/product.html?id=`, `/articles/*.html`), with the correct locale index.
- CI: workspace vitest, test env, API+web startup before Gate B, real image builds, PG18 integration job, `nginx -t` host aliases.
- Compose: required API env, PG18 volume path, service-name upstreams, asset fallback to web, healthchecks; `docker compose config` passes.
- `twinmos.conf`: fixed the unquoted regex that broke `nginx -t`.
- Menu editor rebuilt on `nav_menu`; forms fixed for clean URLs; locale resolution + Arabic RTL verified; data-bound blocks wired; truth rows unpublished; signed register generated.
- MS4.3/4.4/4.5/4.7/4.8 audit expectations corrected where they contradicted the truth policy or live data.

## External blockers (cannot be closed from this working tree)

1. Docker Hub authentication failed here, so `docker compose up` and image builds could not be executed; config is validated.
2. A real staging VM, branch protection, DNS/Cloudflare changes and legal sign-off are outside the repository.
3. The working tree remains uncommitted (239 paths); no CI run can prove “pushed main” until the owner commits.
4. Content-owner decisions remain for drawer labels (13 missing/9 relabelled), the full authentic office list, distributor evidence, and policy texts.
