# Phase 6 comprehensive audit report (2026-10-26)

**Scope:** roadmap v3.1 Phase 06 (MS6.1–MS6.6, exit Gate E, audited with Gate D at VC-D/E).
**Method:** every MS6 milestone audit executed; Gate D + Gate E suites; full API suite; full Playwright E2E; axe + walk on the production SSR build; in-app-browser manual inspection of SEO metadata, consent manager (accept/decline/withdraw + server-side records), locale landings, legal hub, security.txt, robots, sitemap index.

## Result: GREEN LIGHT for Phase 7

## Verification snapshot (final, serial, production build)

| Check | Result |
|---|---|
| MS6.1–MS6.6 milestone audits | all green after audit fixes |
| **Gate E** | **9/9 criteria PASSED — "ALL 8 EXIT GATE E CRITERIA (AND E2E REGRESSION) PASSED WITH 100% SUCCESS"** |
| Gate D (regression) | still green (part of Gate E suite) |
| Full API suite | 669 passed / 60 files (first run of the day; includes the new Phase 6 privacy/consent/URL-migration tests) |
| Playwright E2E | 68/68 |
| walk-public (29 routes) | 0 JS errors, 0 CSP violations |
| axe WCAG 2.2 AA (29 routes) | 0 violations |

## Defects this audit found and fixed

1. **Admin product editor could no longer save existing products** (regression): the editor sent `source`/`approver` as explicit null on every save, tripping the provenance gate. Fixed: the editor now omits provenance fields when empty, and the gate distinguishes a legacy null (no-op) from actually clearing recorded provenance (still 422).
2. **DSAR/privacy admin module did not compile**: `main.tsx`/`privacy.tsx` type errors (`MUTED`/`btn` missing import, `useDialogA11y` not imported, `toast.show` vs the real toast API, `<Err msg>` vs `<Err error>`, `<Table headers>` vs `<Table head>`) — invisible to the Vite build, caught by typecheck. Fixed; `npm run typecheck` is 0 errors and the admin builds.
3. **Consent route could not record consent**: `ConsentRecordPayload` lacked the `consentId` client field, and the insert referenced a non-existent `after` column on `audit_log`. Fixed; verified live — declining records `privacy.consent` rows with `analytics:false` server-side.
4. **Empty `nav_menu` table** (bad state, not code): header/drawer/footer menus vanished. Re-imported the 179 anchors; navigation delivery verified.
5. **Quote form degraded to the contact form**: the stored block carried `formType:'contact'`; the quote form definition was missing. Fixed the stored block + seeders, re-seeded the 7 form definitions and fields.
6. **`?product=` prefill dead + sitemap/redirect interplay**: the redirect engine dropped query strings (`/quote.html?product=x → /quote`), so prefill and other deep links lost parameters. Fixed: path-only redirects now preserve the query (URL-01: parameters preserved).
7. **Sitemap shape flip-flopped between audits**: restored the SEO-01 contract — `/sitemap.xml` is a `<sitemapindex>` of 9 per-locale children; each child is a `<urlset>` that lists its own locale landing (E2E updated to assert the index + children).
8. **D-8 regression**: `findPublishedPageBySlug` silently fell back to English, so `/fr/about` served 200 English content under `lang="fr"` instead of 301. English fallback now opt-in; `/fr/about` → 301 `/about` (verified), published variants still serve.
9. **dir="ltr" regression**: Phase 6 work added explicit `dir="ltr"` to every LTR page, breaking the P4 parity contract (Chrome rasterization) and the E2E locale suite. Reverted to dir-only-for-RTL in the layout AND the i18n client runtime; MS6.2 audit expectations aligned to the parity contract.
10. **axe autocomplete violations on /contact**: honeypot `autocomplete="off"`, overlay combobox `autocomplete="off"`, and `autocomplete="phone"` (invalid token on tel input). Fixed (`search` on the overlay, token removed from the honeypot, phone→tel mapping) — 0 violations on 29 routes.
11. **Stale fixtures**: walk/E2E used the deleted `voltx-ddr5-udimm-16gb` product — updated to a live catalog product.

## Manual browser inspection highlights

- Homepage: canonical `https://www.twinmos.com/`, OG + Twitter card, Organization + WebSite JSON-LD, consent bar with symmetric Accept/Decline.
- Consent flow: before consent — zero cookies, zero non-essential API requests; Decline hides the bar and records `privacy.consent {analytics:false}` server-side (5 audit rows verified).
- legal hub: Privacy/Terms/Warranty/EOL policies reachable; security.txt RFC 9116-valid (contact, expiry, canonical, policy); robots disallows /admin/, /api/.
- Search: canonical `/search`, escaped reflected query, noindex.
- Locales: `/fr/about` 301s to English (D-8); `/ar` RTL with chrome; hreflang grid reciprocal with zh-CN casing.

## Task-by-task done-when matrix

| Task | Done when | Status |
|---|---|---|
| T6.1.1 retention | PG18 test deletes right rows, logs failures | ✅ MS6.1 audit |
| T6.1.2 DSAR export | export covers every table | ✅ MS6.1 + admin Privacy module |
| T6.1.3 erasure | 0 rows for test e-mail after erasure | ✅ MS6.1 |
| T6.1.4 notices + log redaction | every form shows notice; no PII in logs | ✅ MS6.1/MS6.3 |
| T6.1.5 PRIV-01 | legal publishes notice | ✅ Gate E PRIV-01 PASS |
| T6.2.1 real locale pages | no English under non-English lang | ✅ MS6.2 (G-PROV per locale) |
| T6.2.2 RTL fixes | Arabic review no defects | ✅ MS6.2 + parity contract restored |
| T6.2.3 hreflang | reciprocal pairs | ✅ MS6.2 gate 8 + live grid |
| T6.2.4 Arabic review | signed review attached | ✅ MS6.2 evidence |
| T6.2.5 admin a11y | axe 0 serious in 15 modules + keyboard journey | ✅ MS6.2 + admin E2E |
| T6.3.1 consent manager | no non-essential before consent; reject as easy as accept | ✅ manual + automated |
| T6.3.2 server consent record | CONSENT-01 | ✅ Gate E PASS |
| T6.3.3 claims register | signed | ✅ Gate E TRUTH-01 |
| T6.3.4 link checker | 0 broken links | ✅ Gate E |
| T6.4.1 classify legacy URLs | every URL planned | ✅ MS6.4 (320-entry map) |
| T6.4.2 import + test map | URL-01, 0 chains | ✅ Gate E URL-01 (+ query-preserve fix) |
| T6.5.1 canonicals/titles | one self-canonical per URL | ✅ Gate E SEO-01 |
| T6.5.2 social + structured data | Rich Results spot checks | ✅ Gate E SEO-01 |
| T6.5.3 sitemaps/robots/security.txt | validate + noindex | ✅ Gate E SEO-01 (index shape restored) |
| T6.6.1 WCAG 2.2 AA | 0 serious/critical every route | ✅ axe 29/29 clean |
| T6.6.2 screen-reader pass | recorded, no open serious | ✅ MS6.6 evidence |
| T6.6.3 compliance verification | QA report clean | ✅ MS6.6 |
| T6.6.4 Gate E dry run | VC-D/E clean | ✅ Gate D+E suites green |
