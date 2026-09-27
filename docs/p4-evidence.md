# P4 Evidence — Localization

**Date:** 2026-09-27 · **Scope (master plan §3 P4):** locale routing (EN launch; AR/HI/RU/ZH-CN/FR/ES/PT/DE), RTL verified, translation workflow (string export/import), hreflang.
**Exit criteria:** *RTL Arabic parity audit passes* (Arabic landing renders RTL with CMS-driven translated strings — §3) · *9-locale build < 5 min* (**4 s**, §3).

---

## 1. What shipped

| Layer | Deliverable |
|---|---|
| Schema (migration 0003) | `translation` table — (locale, ns, key) unique, `updatedBy` FK, audited writes |
| Seed | All **9 locales** seeded (EN+AR+HI+RU+ZH-CN+FR+ES+PT+DE — BN removed per the post-remediation fact base), AR flagged `dir=rtl` |
| Contracts (`packages/shared`) | `LOCALES` const, `localeDir()`, upsert/import/delete Zod schemas (locale enum-locked — `xx` rejected; key charset validated) |
| API `routes/translations.ts` | **Translation workflow:** `GET /admin/translations` (list = export source) · `PUT /admin/translations` (single upsert) · `POST /translations/import` (bulk, ≤5000 strings — the import leg) · `DELETE` (single) — writes **super_admin-only** (Settings family RBAC), reads for any admin; every mutation audited · **public** `GET /api/v1/i18n/:locale` — namespaced bundle `{common:{key:value}}` with cache header |
| Admin SPA | **Translations module**: locale picker (9 codes, EN marked source), namespace filter, inline grid editor with RTL-aware input direction, JSON **export** (downloads `twinmos-{locale}-{ns}.json`), JSON **import** (validated client+server), read-only badge for non-super_admin |
| Web routing | `astro.config.mjs` i18n → all 9 locales; **8 locale landings** at `/{locale}.html` (build.format 'file' scheme, consistent with the site's /page.html URLs): full homepage shell with `lang`/`dir` flipped, locale banner, links back to EN catalog |
| hreflang | EN pages: `en` + `x-default` → self · **landings: the full 9-locale grid** + `x-default` → EN root (verified per-locale `hreflang` codes and that EN/landings differ) |
| RTL | port-only `rtl.css` — direction mirroring scoped to `[dir=rtl]` (never LTR pages): grids, text-align, breadcrumbs, arrows flipped (`→`→`←`), form alignment, slider track kept LTR for visual order |
| i18n runtime | port-only `i18n.js` — detects `/{locale}.html`, sets `lang`/`dir` on `<html>`, fetches the public bundle (or build-time `I18N_BUNDLE`), flattens namespaces, swaps every `[data-i18n]` / placeholder / aria-label; no-ops on EN |

## 2. Test evidence — `apps/api/test/p4-i18n.e2e.test.ts` (10 tests; suite total **65/65**)

- Upsert is idempotent (repeat = update, not duplicate); value round-trips
- **RBAC:** admin/editor 403 on writes, admin 200 on reads (export); locale activation stays super_admin-gated
- Bulk import (4 Arabic strings) upserts; list reflects it
- Contract rejections: unknown locale `xx` → 422; illegal key chars → 422
- **Public bundle:** merges namespaces, serves translated values, unknown locale 404
- Delete removes one string; audit rows present for upsert/import/delete
- **Built-site assertions:** all 8 landings exist with correct `lang`/`dir` (+`rtl.css` linked on ar); full 9-locale hreflang grid on landings with `x-default` → EN root; EN pages keep plain `en`+`x-default` (no grid on prototype URLs — zero parity impact)

## 3. The exit-criterion loop (RTL Arabic, live)

1. Seeded Arabic through the real translation import (UTF-8 file → `POST /translations/import`) — bundle verified with real Arabic codepoints (0x630…).
2. Browser harness (`tooling/audit-harness/ar-e2e.html`) loads `/ar.html`, waits past the deferred boot + bundle fetch:
   **`AR_OK dir=rtl h1len=22 cta=استكشف المنتجات lang=ar`** — the hero and CTA render in Arabic, direction RTL, lang correct.
3. **9-locale build: 4 s** (36 pages incl. 8 landings) — gate is < 5 min.

Two real bugs caught and fixed by this loop: the locale-path regex matched `/ar/` but not the `format:'file'` `/ar.html` landings; and `t()` walked the bundle dotted (`I18N.hero.title`) while the flattened map stores literal `'hero.title'` keys — both now flat-first + dotted-fallback. A third was environmental: console-seeded Arabic was mangled to literal `?` before reaching the API (fixed by seeding via UTF-8 file — a Windows-console pitfall now noted).

## 4. Regression guards

EN parity spot @390 after P4: index 99.29 / learn 96.87 (the documented AA-recolor deltas unchanged; i18n.js no-ops on EN). Full suite 65/65 (P2 29 + P3 26 + P4 10). 4-project typecheck clean.

## 5. Running it

```bash
npm run db:migrate -w @twinmos/api      # applies 0003_translations
# seed Arabic: POST /api/v1/admin/translations/import with tooling/seed-ar.json (super_admin cookie)
npm run build -w @twinmos/web           # 36 pages, ~4s
# visit /ar.html — RTL + Arabic from the CMS; check hreflang grid in view-source
```

Deferred to later phases (per the phased plan): per-locale product catalog URLs (P4 shipped the routing, translation workflow, and landing surfaces; the corpus itself remains EN), Plausible-style locale analytics, RTL parity audit of the full 28-page set once translated content exists beyond the landing shells.

## 6. Deep-audit iteration (2026-09-27, doc v3)

Three surfaces audited beyond the earlier passes — two real gaps found and closed:

1. **The header language selector was dead UI.** Every page ships the prototype's 9-option `<select id="langSel">`, but the prototype wires no handler — nothing linked it to the P4 landings. The port-only `i18n.js` now wires it on **every page** (value change navigates to `/{locale}.html`; EN returns to `/`; BCP-47 casing like `zh-CN` normalized to the lower-case landing file), and syncs the selector to the current page on landings. Browser-proven: `NAV_URL=/ar.html dir=rtl lang=ar` after a simulated change on the EN homepage (`tooling/audit-harness/langsel-e2e.html`).
2. **The admin Translations module had never been browser-tested** (typecheck + build only). New harness drives the real SPA: sign in → Translations nav item → JSON import through the actual textarea/button → string appears in the grid — **`I18N_ADMIN_OK … imported=true keyInGrid=true`** (`tooling/audit-harness/i18n-admin-e2e.html`).
3. **Landing breadth + RTL audit re-run live:** all 8 landings serve 200; `ar.html` renders with `lang="ar" dir="rtl"`, `rtl.css` linked, `i18n.js` in the boot chain, and `data-i18n` keys on the hero. (The landings intentionally omit the full site header — they carry their own "Continue in English" link — so `langSel` absence there is by design; the sync code guards on it.)

Post-fix gates: **65/65** tests · 4-project typecheck clean · sealed scan 0 findings.

## 7. Audit iteration 2 (2026-09-27, doc v4)

Follow-up pass over the deep-audit surfaces, plus what they touch:

1. **Locale landings were missing from sitemap.xml** — the generator only walked `src/pages/*.astro`, and landings come from the `[locale]` dynamic route. `gen_sitemap.py` now appends all 8 (priority 0.6, weekly); sitemap is 27 → **35 URLs**, verified in `dist`. A new built-site test asserts all 8 codes appear (suite 65 → **66**).
2. **Multi-locale selector flows verified live** (beyond the ar-only proof): `hi → /hi.html dir=ltr`, **`zh-CN → /zh-cn.html`** (BCP-47 option value correctly normalized to the lower-case landing file), `en → /index.html` — all through the real selector on the EN homepage.
3. **rtl.css scoping re-audited:** linked on the ar landing only — **zero** LTR pages reference it — and the landings' root-relative asset paths (`assets/css/...`) resolve correctly since landings sit at the dist root alongside the EN pages.

Post-fix gates: **66/66** tests · 4-project typecheck clean · sealed scan 0 findings.
