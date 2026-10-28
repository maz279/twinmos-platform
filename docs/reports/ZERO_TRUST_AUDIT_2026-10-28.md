# TwinMOS platform — zero-trust production audit (2026-10-28 → 2026-10-29)

**Branch:** `audit/zero-trust-2026-10-28` (commits `bdfb569`, `ea175dc`, `9a22e5b` and the report commit on top) — **not pushed** (see ZT-005).
**Evidence:** `evidence/zt-2026-10-28/` — every number below comes from a run in that folder; nothing is carried over from earlier reports.
**Findings ledger:** `evidence/zt-2026-10-28/findings.jsonl` (as found) → `findings-final.json` (reconciled; regenerate with `python tooling/audit-zt/reconcile.py`).

## Verdict

**NOT READY FOR PRODUCTION DEPLOYMENT.** The code is at **release-candidate** quality on the checks this audit can run: it builds from a clean clone, every automated check is green on a production-mode lab, and all CRITICAL/HIGH code defects found here are fixed and verified. Go-live is blocked by items that need people, accounts or infrastructure this audit cannot produce — and producing them on paper is exactly what the withdrawn records did:

| # | Blocker | Owner |
|---|---|---|
| ZT-055 | No legally approved policy texts: Terms (105 chars) and Warranty (124 chars) are one-sentence stubs; the "legal approval" on them was invented and has been cleared, so delivery withholds them. | Client legal counsel |
| ZT-091 | Warranty registration — and therefore every RMA (BR-6.2) — needs the factory serial registry, which no deploy step loads. Until the CSV is imported, no customer can register or open an RMA. | Client operations (cutover gate) |
| ZT-005 | Nothing since 12 Oct is on GitHub; CI has never run on any of this work. This host has no GitHub credentials (push failed non-interactively). | Repo owner: `git push -u origin audit/zero-trust-2026-10-28`, then watch CI |
| ZT-044 | Localisation not delivered: 8 locales inactive (the header now shows only active locales). | Client / translation vendor |
| ZT-036/041 | Content truth sign-off: 36 unsupported claims were removed; 73 figures in `apps/api/content/CLAIMS_REVIEW.md` and every page's provenance (`approver` is empty — CMS-07a proves republish is refused until a real approver is recorded) need the content owner. | Content owner |
| ZT-083 | Edge trusts Cloudflare's *shared* origin-pull CA; needs a zone-level custom Authenticated Origin Pulls certificate. | Cloudflare account admin |
| ZT-079 | RPO is 24 h (nightly `deploy/backup.sh`); the planned 15-min WAL archiving is not set up. | Ops |
| ZT-066 | Serial squatting: first verified claimant becomes owner; disputes now alert support. Requiring proof of purchase before activation is a business decision. | Client |
| — | No staging or production environment exists; Cloudflare, monitoring/alerting, load test against staging, external port scan, named UAT testers and a second-engineer re-run (roadmap VC-F) have not happened. | Client + delivery team |

Roadmap v3.1 places the go/no-go on 26 March 2027 (go-live the week after); today is 29 October 2026. None of the above can honestly be marked done before those events.

## What was audited, and how

* **Production-mode lab** (`tooling/audit-zt/lab/`): the repo's own `docker-compose.yml` + `docker-compose.prod.yml` (PostgreSQL 18, migrate, bootstrap seed, content load, API with `NODE_ENV=production`, Astro SSR, nginx edge with the real `deploy/nginx/twinmos.conf` and `ssl_verify_client on` against a lab CA standing in for Cloudflare's origin-pull CA). Only test doubles: Cloudflare's published Turnstile test keys and a mail mock (both must be explicitly acknowledged — the boot guard refuses them otherwise, ZT-080).
* **Clean clone** builds in `node:24` containers (the host has Node 22): `npm ci`, typecheck, admin + web builds, API suite, `npm audit --omit=dev`.
* **Harness** (`tooling/audit-zt/`, re-runnable with `tooling/audit-zt/sweep.sh <dir>`): every probe goes through the edge with the client certificate.
  * `tools-api.mjs` — business flows: contact/quote forms, idempotency, warranty registration + lookup, serial check, RMA intake/tracking (BR-6.2), compatibility, search, newsletter double opt-in, helpful votes, ops endpoints, preview tokens.
  * `routes-authz.mjs` — the live route table (325 routes) × anonymous / viewer / partner sessions.
  * `cms-reflect.mjs` — editor edits a seeded page → visible to visitors within 5 s (G-REFLECT); unpublish; author cannot publish; provenance rule; audit rows.
  * `media-persist.mjs` — an upload survives an API container restart.
  * `crawl.mjs` — real Chromium over every reachable page (251), console/JS/network errors, broken links, screenshots at 390/768/1440.
  * `deploy/backup.sh` + `deploy/restore.sh --drill` against the lab stack.
* **Independent reviews:** one fresh reviewer per iteration, given the code, not my conclusions — API (iter 2), web + admin (iter 3), edge/deploy and the new warranty/RMA code (iter 4), and the audit's own diff for regressions (iter 5). Every reported item was checked against the code before being accepted (several were, others were narrowed, e.g. the "shipped .env" is an untracked local file).
* **Checks can fail:** iteration 0 ran the probes against the pre-fix code (tools 15/38 failed, authz plant run); MEDIA-01 failed on the pre-fix lab (`iter-3-plant/`), NL-10's leak was reproduced on the `ea175dc` lab (`iter-4-plant-nl10.txt`); the migration-0035 guard was exercised with real duplicates on PG18.

## Results by iteration

| Iter | What ran | Result |
|---|---|---|
| 0 | Baseline: clean clone + lab on the claimed-complete code | Clean clone did not typecheck or build; API 18 failed/700; edge could not start under the prod overlay; tools 15/38 failed; 0 products/pages after a runbook deploy; fabricated launch records found |
| 1 | Fixes ZT-001…044; content rebuild; warranty/BR-6.2 built | tools 48/48, authz 676/677 (partner session), crawl clean of broken links |
| 2 | Independent API review → ZT-045…051 | tools 54/57 + authz 2 fails — all three traced to harness errors (ZT-064), product correct |
| 3 | Independent web/admin review → ZT-052…059; clean-clone CI | tools 56/57 (lab predates warranty change), authz 680/680, CMS 7/8 (provenance rule — correct, harness extended), crawl: `/partners` 401 console noise (fixed) |
| 4 | Independent edge/deploy + warranty reviews → ZT-060…085 incl. CRITICAL ZT-077 | clean clone: typecheck 0, builds OK, API **659/659**; lab: tools **57/57**, authz **680/680**, CMS **9/9**, media persistence **PASS**, backup + DR drill **PASS**, crawl 251 pages, 0 link issues, only error page `/404` |
| 5 | Independent regression review of the audit diff → ZT-086…091 | clean clone: typecheck 0, builds OK, API **659/659**; lab (rebuilt from `9a22e5b`): tools **58/58** (incl. NL-10), authz **680/680**, CMS **9/9**, media persistence **PASS**, backup + DR drill **PASS** (user=6, product=39 equal to live); crawl 251 pages, 0 link issues, errors only on `/404` and one transient asset failure not reproduced in 15 reloads (`iter-5/recheck.txt`). Visual review of the screenshots → ZT-092 (content), fixed, applied to the lab with `load-content --update-pages` (28/28) and re-crawled (`iter-5b/`): removed claims absent from the live pages; 251 pages, 0 link issues; errors only `/404`, Cloudflare's own Turnstile challenge requests aborted on navigation (third-party), and one page whose asset requests never reached nginx (absent from the edge access log; 15/15 clean isolated reloads) — a crawler connection artefact |

API suite: 659 passed, 15 skipped — the skips are the MS6.2 live-locale suites, which need a running web server (`TEST_WEB_ORIGIN`) and fail honestly against the lab because localisation is not delivered (ZT-044). `npm audit --omit=dev`: 4 moderate advisories (esbuild dev server via drizzle-kit, a devDependency that npm workspaces still count); verified absent from the API image.

## Severity summary (92 findings)

| | Found | Fixed & verified | Open / partly / decision |
|---|---|---|---|
| CRITICAL | 16 | 14 | ZT-005 (push/CI), ZT-055 (legal texts) |
| HIGH | 35 | 31 | ZT-038 (news empty), ZT-044 (localisation), ZT-079 (RPO 24 h), ZT-091 (serial registry) |
| MEDIUM | 27 | 25 | ZT-066 (business decision), ZT-083 (Cloudflare AOP cert) |
| LOW | 14 | 13 | ZT-085 (accepted) |

The open items are all outside code: they need counsel, client data, a Cloudflare account, credentials, or real infrastructure.

## The findings that mattered most

* **Fabricated completion (ZT-006).** Go-live, hypercare, UAT, DR and VC-F records were dated months before the events, signed by six names that exist nowhere, and produced by scripts whose results were constants. Withdrawn to `docs/reports/withdrawn/2026-10-28/`; `report-lint` now fails on invented sign-offs and premature events. A fake DR drill line in `docs/runbooks/DR.md` was struck and replaced with the real lab drill.
* **The stack could not be deployed (ZT-001/002/003/007/009/011/004).** Clean clone did not build, nginx config failed `nginx -t`, the prod overlay edge could not start, the admin console was not deployed, and a runbook deploy produced an empty site. All fixed and exercised in every sweep since iteration 1.
* **Customer data exposure (ZT-025/026, ZT-086).** The public RMA tracker returned the customer's e-mail and staff notes for any RMA number; later, a regression of the newsletter fix served one visitor's confirmation token to the next through the route cache (found by the iteration-5 reviewer, reproduced live, fixed, NL-10 added).
* **Data loss on restart (ZT-077, CRITICAL).** Uploaded media and partner files lived on tmpfs in production; reproduced live (served before `docker restart`, 404 after), fixed with a named volume, verified by MEDIA-01.
* **Backups that could not restore (ZT-078/079).** The backup wrote an *empty* file archive and reported success, shipped plaintext off-site, and restore failed half-way; the backup key was a committed literal. Rewritten for the compose stack; the drill now restores into a throwaway database with counts equal to the live lab.
* **Business rules (ZT-027, ZT-068).** BR-6.2 (no RMA without an in-warranty registration) did not exist; warranty registration/lookup were missing. Built, e-mail-verified, and the "one open RMA per serial" rule is now held by the database.
* **Untrue content (ZT-017…023, 036, 041).** Wrong offices (incl. a prohibited contamination), invented testimonials, prices, distributors, approvers and awards. Corrected to `twinmos_mirror/authoritative_facts.md`; every change is listed in `apps/api/content/CORRECTIONS.md`, removed claims in `CLAIMS_REVIEW.md`.

## Pre-go-live checklist (in addition to the blockers)

1. Push the branch, get CI green on GitHub, review and merge.
2. Provision staging; run `tooling/audit-zt/sweep.sh` against it (adapt `lab.vars`), then the roadmap VC-F items: load test, external port scan, ZAP, named UAT, second-engineer re-run.
3. Production env: real Turnstile and Resend keys, `MAIL_FROM` on a verified domain, secrets ≥ 32 chars, **no** `TWINMOS_LAB_TEST_INTEGRATIONS`, `RESEND_BASE_URL`, `API_ALLOW_NO_TURNSTILE`; delete the local untracked `deploy/compose/.env` (it holds staging/test values).
4. Import the factory serial registry (ZT-091); record real provenance approvers and publish approved legal texts.
5. Configure off-site backups (`BACKUP_ENCRYPTION_KEY`, B2/S3) and run `deploy/restore.sh --drill` on the production host; record it in `docs/runbooks/DR.md`.
6. If an existing database is upgraded: migration 0035 stops on duplicate open RMAs for one serial and prints the query to find them — resolve them in the RMA board, then re-run.

## Appendix — every finding, final status and how it was verified

| ID | Sev | Finding | Final status | Verified by |
|---|---|---|---|---|
| ZT-001 | CRITICAL | Clean clone cannot typecheck or build: .gitignore 'data/' hides apps/web/src/data/{locator.json,cookieRegistry.ts} | fixed | clean-clone typecheck/build green (iter 4, 5) |
| ZT-002 | CRITICAL | Web build fails without a running API (build-catalog-data exit 1); Docker web build skips prebuild and ships untracked local app.js/catalog-data.js | fixed | clean-clone web build without API (iter 4, 5) |
| ZT-003 | CRITICAL | Repo nginx config fails nginx -t: redirect map entries up to 171 chars exceed map_hash_bucket_size 128 — production edge cannot start | fixed | nginx -t + edge running in lab (iter 1-5) |
| ZT-004 | CRITICAL | No content pipeline: a deploy per docs/runbooks/DEPLOY.md yields a DB with 0 products/pages/articles/menus; the prior 'staging stack live' DB also … | fixed | compose content job loads the reviewed snapshot (lab iter 1-5) |
| ZT-005 | CRITICAL | main is 60 commits ahead of origin; CI never ran on any claimed milestone (MS1.1–MS7.6) | OPEN | no GitHub credentials on this host: branch not pushed, CI never ran on GitHub |
| ZT-006 | CRITICAL | Fabricated launch/hypercare/UAT/DR/VC-F records with invented sign-offs; verifiers hard-code results (CWV constants, port scan cannot FAIL, 5-itera… | fixed | records withdrawn; report-lint fails on invented sign-offs / premature events |
| ZT-007 | CRITICAL | Prod overlay edge (read_only, cap_drop ALL) cannot start: root nginx lacks DAC_OVERRIDE to mkdir temp dirs in nginx-owned /var/cache/nginx volume | fixed | prod overlay edge starts in lab (iter 1-5) |
| ZT-008 | HIGH | Prod overlay mounts /etc/letsencrypt over /etc/nginx/certs, hiding cloudflare-origin-pull-ca.pem and the expected twinmos.pem/.key names — nginx ca… | fixed | per-file cert mounts, lab edge (iter 1-5) |
| ZT-009 | CRITICAL | Prod overlay edge (read_only rootfs) cannot start: access_log /var/log/nginx/access.json.log is not writable | fixed | prod overlay edge starts in lab (iter 1-5) |
| ZT-010 | MEDIUM | GET /api/v1/metrics is public through the edge (Prometheus counters, DB status, uptime) | fixed | tools OPS-01 |
| ZT-011 | HIGH | Admin console is not deployed by the compose stack: /admin/ → 403 (empty /var/www/twinmos/admin) | fixed | admin SPA served by the edge; provision + CMS checks drive it (iter 1-5) |
| ZT-012 | MEDIUM | Edge HEALTHCHECK can never pass: wget sends no client cert while ssl_verify_client on → 400; container permanently unhealthy | fixed | loopback healthz; container healthy |
| ZT-013 | HIGH | Partner onboarding broken in production: verification link callbackURL defaults to http://localhost:5173 (ADMIN_PUBLIC_URL unset, not boot-checked)… | fixed | provision: partner invite, verify, set-password (iter 1-5) |
| ZT-014 | MEDIUM | Staff/partner invites put a temporary password in plain-text email and in the invite JSON response | fixed | p1-fixpack / p1-security-governance / security-pack tests |
| ZT-015 | HIGH | Clean-clone API suite: 18 failed / 700 passed / 13 skipped of 731 (HEAD commit claims 731/731); suites need a live web server on :4321 and untracke… | fixed | API 659/659 in a clean clone (iter 4, 5) |
| ZT-016 | HIGH | npm audit --omit=dev: 11 vulnerabilities (1 critical: @better-auth/drizzle-adapter rate-limit bypass on PostgreSQL; 1 high: zod memory exhaustion; … | fixed | 4 moderate advisories are dev-only (drizzle-kit/esbuild) and absent from the API image |
| ZT-017 | CRITICAL | Published offices contradict the fact base: Dhaka (explicitly prohibited STBL contamination), Hong Kong (not an office), wrong Dubai/Taipei/San Jos… | fixed | snapshot corrections (apps/api/content/CORRECTIONS.md) |
| ZT-018 | HIGH | Three invented customer testimonials published (Ahmed Al-Mansoori, Vikram Mehta, Marcus Weber) | fixed | testimonials unpublished |
| ZT-019 | HIGH | Three job postings with salary bands published with no source on the live site | fixed | job postings unpublished |
| ZT-020 | HIGH | Invented prices (VOLTX ×3 at USD 89.99, absent from twinmos.com) and test residue 'E2E warranty probe' as a published product warranty | fixed | prices + test residue removed; catalog-data.js regenerated |
| ZT-021 | HIGH | Wrong public contact data: phone +886 2 2659 0880 / WhatsApp 886226590880 / info@ (fact base: +886 970-368-077, WhatsApp +886970368077, sales@twinm… | fixed | contact data = fact base |
| ZT-022 | HIGH | Content provenance approvers are invented personas on every row (an invented persona, an invented persona, an invented persona, an invented persona… | fixed | persona approvers cleared; republish needs a real approver (CMS-07a) |
| ZT-023 | HIGH | Seven named companies published as 'authorized' distributors (incl. Supertron, which the fact base flags as unverified) and four marketplace store … | fixed | named distributors removed |
| ZT-024 | CRITICAL | Every redeploy re-runs the bootstrap seed, which sets two_factor_enabled=false and resets the super_admin password (seed.ts:71-75): MFA silently re… | fixed | seed re-run leaves MFA/password (iter-0 before/after; seed.ts) |
| ZT-025 | CRITICAL | Public RMA tracking needs only the RMA number and returns the customer's e-mail, staff reply text and internal technician notes in the timeline | fixed | tools RMA checks (POST /rma/track, public timeline only) |
| ZT-026 | HIGH | RMA lookup alias /api/v1/forms/rma/:n is not rate-limited (14+/min accepted) — enables sweeping the ~1M/yr RMA keyspace | fixed | tools RMA rate-limit check |
| ZT-027 | HIGH | BR-6.2 not implemented: RMA accepted for a serial absent from the factory registry with no warranty registration; client-supplied warrantyTier stor… | fixed | tools RMA-02/02b + warranty.e2e |
| ZT-028 | MEDIUM | Anti-spam form token is optional: submissions without it are accepted; HMAC key falls back to a hard-coded literal | fixed | tools FORM checks; API tests |
| ZT-029 | MEDIUM | Idempotency-Key cache is global: replaying another visitor's key returns their submission reference | fixed | tools FORM-06; p2 test |
| ZT-030 | MEDIUM | SN check has no SUSPECTED COUNTERFEIT outcome and no warranty status (URD UR-17.1.5); anomaly-flagged serials still answer 'valid' | fixed | tools SN checks |
| ZT-031 | MEDIUM | Compatibility finder does not escape LIKE wildcards: brand=% returns the whole table | fixed | tools compatibility check |
| ZT-032 | HIGH | Search has no query length/token cap: one anonymous 2,800-char query takes 8.5 s (ILIKE per token over article bodies) — trivial DoS | fixed | tools search cap check |
| ZT-033 | MEDIUM | Newsletter: one token both confirms and unsubscribes and never expires; confirm link shows raw JSON to the subscriber; 'a@' accepted as an e-mail | fixed | tools NL checks; phase-d tests |
| ZT-034 | MEDIUM | 'Was this helpful?' widget is dead UI: buttons have no handler, the API answers recorded:true but stores nothing, and the edge 403s the path | fixed | tools ART checks |
| ZT-035 | HIGH | Header 'Compare' and 'Get a quote' (and Compare tray) use relative compare.html/quote.html → 404 on every /products/* and /learn/* page | fixed | crawl: 0 link issues (iter 2-5) |
| ZT-036 | CRITICAL | Page content is missing: 225 of 230 CMS page blocks (28 pages) carry no content (html '' and no typed fields). Pages render as heading shells; Bloc… | fixed (content sign-off open) | rebuilt 175/230 blocks from the approved prototype; the rest are data-bound widgets |
| ZT-037 | HIGH | Home page: 'Featured Flagship Hardware' rail lists legacy DDR3 parts with a 'Part No.' placeholder spec and no images; empty CTA banner blocks; emp… | fixed | snapshot |
| ZT-038 | HIGH | News section is not CMS-driven: news_post is empty and news.astro / news/[slug].astro serve hard-coded fallback posts, incl. an announcement of a w… | partly: news empty until authored | fallback news removed; news_post is empty |
| ZT-039 | CRITICAL | Seeded pages cannot be edited in the CMS: the page builder only knows the 30 camelCase contract types, the 57 stored kebab types have no editor, an… | fixed | CMS-02 seeded page saves |
| ZT-040 | HIGH | Renderer defects: tabbed-faq missing from needsFaqs (support FAQ and careers FAQ render heading only); breadcrumb/json-ld/pdp/article-reader blocks… | fixed | renderer + crawl |
| ZT-041 | HIGH | Hard-coded factual claims in renderer fallbacks and widgets with no source in the fact base: 'Best SSD Manufacturer 2023' award, hero slides, speed… | fixed (sign-off open) | claims removed; 73 figures listed in CLAIMS_REVIEW.md for the content owner |
| ZT-042 | HIGH | Serial check has no form on the site: the RMA page 'Serial check' card (labelled 'Phase 2') has no input; a JS-injected chip with demo serials (TM-… | fixed | serial check form + tools SN |
| ZT-043 | HIGH | Product and article routes serve hard-coded fixture records when the CMS has none (CoreX Pro, microSDXC, what-is-xmp, portable-ssd-vs-external-hdd)… | fixed | fixtures removed |
| ZT-044 | HIGH | Localisation not delivered: 8 non-English locales are inactive with 8 translation strings in total, yet the header offered 9 languages and /ar … /d… | OPEN | localisation not delivered (8 locales inactive); live ms62 suites fail honestly |
| ZT-045 | HIGH | Public SN-check returned warranty status/expiry for any serial (registration + purchase-date oracle) | fixed | tools SN-04 |
| ZT-046 | HIGH | Warranty registration activated without e-mail ownership proof: serials could be squatted (locking the real owner out of RMA) or back-dated to exte… | fixed | tools WTY-01/02; warranty.e2e |
| ZT-047 | MEDIUM | SN-check poisoning: six checks from different IPs made a genuine serial unregistrable for 24 h | fixed | trusted client IP + registration flow |
| ZT-048 | MEDIUM | Newsletter: no form token, subscription-status oracle, token rotation kills pending links, GET confirm/unsubscribe triggered by mail link scanners,… | fixed | tools NL checks |
| ZT-049 | MEDIUM | Block URL filter bypassable (java	script:, control chars) — stored javascript: href possible (CSP mitigates) | fixed | block contract (node check) |
| ZT-050 | MEDIUM | Viewers could read every warranty registrant's e-mail/name/country | fixed | editor+ only |
| ZT-051 | LOW | Edge-case defects: invalid calendar dates → 500; '1.5 Years' parsed as 5 years; Feb-29 rollover; client can override RMA SKU; RMA double-submit rac… | fixed | tools WTY-03b; shared helpers |
| ZT-052 | CRITICAL | All CMS form blocks lacked formType: the RMA, careers and partners pages submitted as 'contact' — no RMA case/number was ever created from /rma, no… | fixed | formType per page; RMA through the site form path |
| ZT-053 | HIGH | Partner portal sign-in unreachable: /partners rendered a lead form; portal.js required the prototype's 'Demo sign-in' password form | fixed | partner sign-in form |
| ZT-054 | HIGH | Legal page tabs showed blank panels (inline display:none beat .on) and ?tab= links ignored; duplicate privacy/warranty policies published | fixed | legal tabs + ?tab= |
| ZT-055 | CRITICAL | Policies carry a fabricated legal approval ('H. Lin, Legal Counsel', from the withdrawn claims register); Terms of Service and Warranty Policy bodi… | OPEN | no legally approved policy texts (Terms/Warranty are stubs): needs counsel |
| ZT-056 | HIGH | Article/news bodies rendered with set:html without sanitising; JSON-LD built with JSON.stringify without escaping '<' (</script> breakout) | fixed | sanitised bodies; jsonForScript |
| ZT-057 | HIGH | Admin form-type picker offered types the API rejects (support/partner/careers/custom) → every submission 422 | fixed | FORM_BLOCK_TYPES |
| ZT-058 | MEDIUM | Front-end defects: double CSP (nginx+middleware) blocks analytics/https images and /assets locations drop security headers; forms submit as GET (PI… | fixed | single CSP; POST forms; Turnstile reset |
| ZT-059 | MEDIUM | Page-builder inferred editor turns empty arrays into string lists (save → 422); invite UI reports success even when the set-password e-mail failed | fixed | inferFields; invite warning |
| ZT-060 | MEDIUM | Public sn-check stored the client IP from raw x-real-ip/cf-connecting-ip request headers while its limiter used clientIp(); a forged header could i… | fixed | p5/p13 tests on clientIp |
| ZT-061 | MEDIUM | Rebuilt careers page carried a FAQPage JSON-LD block (roadmap Z-24 forbids FAQ schema); caught by ms65 in the clean-clone run | fixed | ms65 test |
| ZT-062 | LOW | ms64 URL-migration suite read its inputs from outside the repository, so it failed in every clean clone (and CI) | fixed | ms64 runs in a clean clone |
| ZT-063 | LOW | ms62 localisation suites need a running web server and failed with ECONNREFUSED in every unit run; now run only with TEST_WEB_ORIGIN (and then fail… | fixed | gated on TEST_WEB_ORIGIN |
| ZT-064 | LOW | iter-2 sweep false failures traced to the audit harness itself (squatter purchase date before manufacture; warranty limiter tripped; partner hittin… | fixed | harness corrected |
| ZT-065 | MEDIUM | Warranty registration oracle via e-mail: a taken serial produced an 'already registered' mail instead of the confirmation mail, to a mailbox the re… | fixed | tools WTY-02; warranty.e2e |
| ZT-066 | MEDIUM | Serial squatting: serials are printed on retail packaging and first-to-confirm becomes owner; the real buyer is then refused RMA (BR-6.2). Mitigate… | mitigated: business decision open | disputes alert support; proof-of-purchase approval is the client's call |
| ZT-067 | MEDIUM | Admin warranty list returned registrants' confirmation tokens to every editor (could activate someone else's pending claim) and labelled pending ro… | fixed | warranty.e2e |
| ZT-068 | HIGH | 'One open RMA per serial' was check-then-insert without a DB constraint; concurrent submissions opened duplicate cases | fixed | partial unique index; warranty.e2e |
| ZT-069 | LOW | Pending newsletter subscribers from before 0032 had NULL token expiry and could never confirm | fixed | migration 0035 |
| ZT-070 | LOW | RMA intake wrote the case and mailed the customer before the submission record; a failed insert left an orphan case and blocked retries with RMA_OPEN | fixed | one transaction |
| ZT-071 | LOW | Newsletter timing oracle: provider mail calls were awaited only for new/pending addresses | fixed | mail sent after the answer |
| ZT-072 | LOW | One form token allowed unlimited 'helpful' votes for 30 minutes; /warranty/lookup has no form token (accepted: owner-only answer, rate-limited) | fixed | single-use vote token |
| ZT-073 | LOW | Analytics page_location carried ?confirm= / ?unsubscribe= tokens; warranty page had no no-referrer policy; second registration on one page failed c… | fixed | analytics / referrer / Turnstile reset |
| ZT-074 | LOW | Public SN check counted the current IP but not the current country, flagging the 6th country one request late; forms.ts used raw cf-connecting-ip/x… | fixed | warranty.e2e SN country |
| ZT-075 | LOW | Serial delete advised 'void first' but voided and pending rows still blocked it forever; unconfirmed claims could pin any serial | fixed | serial delete |
| ZT-076 | MEDIUM | DSAR export and erasure skipped product_registration (registrant name/e-mail) | fixed | DSAR covers registrations |
| ZT-077 | CRITICAL | Uploaded CMS media and partner files were stored on a 128 MB tmpfs in the production overlay (no volume in base compose): every restart/redeploy de… | fixed | MEDIA-01 failed on the pre-fix lab (iter-3-plant), passes iter 4-5 |
| ZT-078 | HIGH | backup.sh could not back up the compose stack (globals dump without connection args, files from a non-existent path archived as an EMPTY tarball wi… | fixed | backup + restore --drill on the PG18 lab: PASS (iter 4, 5) |
| ZT-079 | HIGH | pgBackRest repo encryption key committed as a literal (pgBackRest does not expand ${...:-default}); pgBackRest/WAL archiving is not wired into the … | partly: RPO 24 h | literal key removed; WAL archiving not configured |
| ZT-080 | HIGH | Boot guard accepted Cloudflare's always-pass Turnstile test secret, a mail-redirecting RESEND_BASE_URL and localhost auth URLs in production (a cop… | fixed | security-pack S-13 |
| ZT-081 | MEDIUM | Bootstrap seed required SEED_ADMIN_PASSWORD on every run even when the admin exists; removing it from the env after first deploy stopped the whole … | fixed | seed logic |
| ZT-082 | MEDIUM | deploy.yml claimed staging + production deployment but ran on ephemeral GitHub runners (deployed nothing), carried fallback credentials, ignored it… | fixed: unverified until pushed | workflow rewritten; it only runs on GitHub |
| ZT-083 | MEDIUM | Origin trusts Cloudflare's SHARED origin-pull CA: any Cloudflare zone pointed at the origin passes the client-cert check (zone WAF/rate limits bypa… | OPEN | needs a zone-level custom AOP certificate in Cloudflare |
| ZT-084 | LOW | nginx preview-bypass keyed on cookie twinmos_preview while the web app sets tm_preview (editors served the public micro-cache); X-Frame-Options/X-C… | fixed | nginx -t |
| ZT-085 | LOW | Edge image bakes a self-signed key used by the base compose file (prod overlay mounts the real certificate); with cap_drop ALL a 0600 non-root-owne… | accepted | base compose only |
| ZT-086 | HIGH | Regression from the newsletter fix: middleware rewrote the page's no-store to public and stored it in the 60 s route cache, whose key drops ?confir… | fixed | NL-10 leaked on the ea175dc lab (iter-4-plant-nl10.txt); passes iter 5 |
| ZT-087 | HIGH | Migration 0035 unique index would abort on existing duplicate open RMAs (free-text serials before BR-6.2) and stop the whole stack (migrate gates e… | fixed | PG18 migration test |
| ZT-088 | MEDIUM | Page-builder dropped nested FAQ items: '+ Add group' saved groups without items and the FAQ renderer crashed SSR on /support and /careers; existing… | fixed | renderer guard + nested editor |
| ZT-089 | MEDIUM | load-content validated the snapshot before the --if-empty skip: a stale snapshot would fail the content job on every redeploy and keep web from sta… | fixed | load-content |
| ZT-090 | LOW | Block URL filter rejected prose starting with 'Data:' (editor 422) while camelCase URL keys (headLink, ctaUrl, imageUrl) escaped the strict scheme … | fixed | node validator check |
| ZT-091 | HIGH | Warranty registration and therefore every RMA depend on the factory serial registry, which no deploy step loads: until staff import the factory CSV… | OPEN | cutover gate: import the factory serial registry |
| ZT-092 | MEDIUM | Visual review: three pages stated blanket warranty terms (DRAM lifetime / NVMe & flash 5 y / SATA 3 y) that contradict the per-product terms (X3 Ul… | fixed (sign-off open) | claim filter rules; snapshot re-applied to the lab and re-crawled (iter-5b); owner confirms per-product terms |
