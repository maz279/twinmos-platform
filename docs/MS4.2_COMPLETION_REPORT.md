# MS4.2 — Site settings and navigation: completion report

**Date:** 2026-10-21  
**Milestone:** MS4.2 · Site settings and navigation (T4.2.1 – T4.2.4)  
**Gate:** GREF-C (settings groups and menus at API level) — **CLEARED**  
**Repo:** `twinmso_codebase` (working tree; no commits were made in this session)

---

## 1. Was MS4.2 already implemented?

Yes — substantially, but uncommitted and incomplete against its own "done when" criteria. The earlier working tree already contained:

- the eight typed settings schemas (`packages/shared/src/settings.ts`),
- delivery endpoints and the admin settings editor,
- migration `0025_nav_menu_locale_code.sql` (per-locale menu codes),
- the 179-link prototype importer and the drawer drift report,
- an MS4.2 evidence file that reported 12/12 checks.

The gaps that made the milestone not actually done were closed in this session (section 2).

---

## 2. What was implemented

### T4.2.1 — Typed settings groups

- `SETTINGS_GROUP_DEFAULTS` and `normalizeSettingsGroup()` added to the shared package; `site.whatsapp` now has defaults so every group parses from `{}`.
- PUT `/admin/settings` stores the **normalised** group, so a partial payload no longer erases unset fields.
- GET `/admin/settings/:key` returns defaults for every group without throwing (the old `site.whatsapp` 500 is gone).
- Delivery uses the shared defaults and `resolveComputedFigures` only; the duplicated manual computation and special cases were removed.
- `npm run db:seed` now idempotently inserts missing setting defaults.
- Chrome consumption:
  - Header: product count (fixes the literal **45**), countries and `Since {foundingYear}`.
  - Footer: brand name/logo/tagline, contact address/email/phone, social links, figures, WhatsApp link.
  - Cookie banner: title/description/policy URL from `site.cookie`.
  - Layout: brand favicon, `og:site_name`, SEO default OG image/robots/description, Organization JSON-LD address/phone/email, Turnstile site key and analytics meta.
  - Analytics: consent-gated `analytics-init.js`; CSP hosts added; the switch is inert while disabled.
  - Page titles/descriptions authored against the baseline (`since 1998`, `93+ countries`) follow the live figures.
- HTML route-cache entries are tagged `site`, `nav` and `menus`, so a settings/menu save purges every page. The live G-REFLECT check confirms a save reaches an anonymous page within 5 s and the restore does too.
- Integration secrets are redacted from `audit_log.diff`.

### T4.2.2 — Settings editor

- All eight group editors use `SETTINGS_GROUP_DEFAULTS` (no third copy of defaults).
- Save failures show the field-level 422 detail.
- Write access is gated on `super_admin` in the UI, matching the API; `admin` sees a read-only notice.
- Added the contact `country` and SEO `defaultRobots` fields.

### T4.2.3 — Menus per locale

- Migration `0025_nav_menu_locale_code.sql` + schema unique index on `(code, locale)`; duplicate code in one locale returns 409.
- Delivery supports `?locale=` with English fallback; `/delivery/navigation` is locale-filtered; unknown code returns 404.
- Real trees: header mega columns/links/feature panels/"all" rows, drawer groups, footer columns + legal bar.
- Targets are validated at write time: no whitespace/control characters, no `javascript:`/`data:`/`vbscript:`/`file:`, no protocol-relative URLs, internal paths must start `/`, no `..` traversal.
- Typed references (`product`, `article`, `category`, `page`) require a real entity and resolve to canonical URLs at delivery.
- Numeric product counts in labels are stored as `{{products}}` and resolved from `site.figures.productCount`.
- A title-only PATCH no longer re-validates an untouched legacy target (preserves `data-patch` behaviour).

### T4.2.4 — Import the real 179 links

- The importer resolves the tracked `prototype/index.html` repo-relative (portable), declares `jsdom`, and is available as `npm run db:import:menus`.
- It imports exactly the 179 prototype anchors:
  - header: 84 hrefs + 16 column group nodes;
  - drawer: 56 rows = 50 hrefs + 6 `href="#"` toggles stored as group nodes;
  - footer: 39 hrefs + 6 group nodes (Social, Products, Company, Support, Contact, Legal).
- It seeds the four referenced Knowledge Hub articles (`what-is-xmp`, `what-is-amd-expo`, `best-ram-for-gaming`, `directstorage-gen5-gaming`) from the tracked prototype content, so every target resolves.
- Re-import deletes previous `header`/`drawer`/`footer`/`legal` rows, so the invented legacy `legal` menu cannot survive.
- `docs/DRAWER_DRIFT_REPORT.md` records the tree model and the 13-missing/9-relabelled decision request.

### Supporting fixes found during testing

- `apps/web/src/pages/learn/[slug].astro` now reads `body`/`deck`/`publishAt` from CMS articles (previously only fixture-shaped `content`/`excerpt`), so imported articles render.
- Removed the legacy client patch that rewrote "39 products" to the local catalog length; the CMS count is now authoritative.
- Footer logo images are decorative (`alt=""`) where adjacent text names the brand.
- Test infrastructure: `p2`/`p5`/`p6`/`p13` now send `x-real-ip` (the trusted proxy header) alongside the Cloudflare headers; the `data-patch` nav test remains valid; `S-07` builds an MFA-enforcing app instead of relying on the suite-wide `ENFORCE_MFA=0`.
- E2E: the five deep-link tests whose widgets are not yet mounted by the converted CMS pages are marked `test.fixme` with the MS5.2 reason (see section 5).

---

## 3. Verification evidence

| Gate | Command | Result |
|---|---|---|
| Typecheck | `npm run typecheck` | 0 errors (API, admin, db, shared, Astro 40 files) |
| MS4.2 API tests | `npx vitest run test/settings-navigation.test.ts` | **18/18 passed** |
| Full API suite | `npm test --workspace @twinmos/api` | **467 passed, 5 skipped, 0 failed** (all previous failures resolved) |
| E2E | `npx playwright test` | **51 passed, 5 skipped (MS5.2), 0 failed** |
| Axe visual/a11y | `npm run verify:visual` | 29 routes, **0 violations** (both scans) |
| Public walk | `node tooling/verify/walk-public.mjs` | **29/29 routes clean**, 0 JS errors, 0 CSP violations |
| Manual suite | `npm run verify:manual` | All scenarios completed successfully |
| MS4.2 live audit | `npm run verify:ms42` | **18/18 checks passed**, GREF-C CLEARED |
| Live nav targets | `node tooling/verify/nav-targets.mjs` | **173 targets, 63 unique internal, 0 problems** |
| Visual inspector | `node tooling/verify/inspect-ms42-visual.mjs` | Public + admin axe: **0 critical/serious**; screenshots 01–04 |
| Browser walk | In-app browser | Home, mega-menu, footer, cookie banner, admin 8 groups, WhatsApp group; desktop + mobile screenshots |

Evidence files:

- `tooling/verify/evidence/ms42/master_audit.json` — 18/18, `GREF-C: CLEARED`
- `tooling/verify/evidence/ms42/inspection_summary.json` and `01..04*.png`
- `tooling/verify/evidence/ms42/nav_targets.json`
- `tooling/verify/evidence/walk_public/walk_public.json`

---

## 4. Files changed (high level)

- Shared/settings: `packages/shared/src/settings.ts`
- API: `apps/api/src/routes/settings.ts`, `apps/api/src/routes/navigation.ts`, `apps/api/src/routes/delivery/query.ts`, `apps/api/scripts/seed.ts`, `apps/api/scripts/import-prototype-menus.ts`, `apps/api/scripts/prototype-articles.ts`, `apps/api/scripts/seed-phase-c.ts`
- Admin: `apps/admin/src/modules/settings.tsx`
- Web: `apps/web/src/layouts/Layout.astro`, `components/chrome/{Header,Footer,CookieBanner}.astro`, `src/pages/learn/[slug].astro`, `src/middleware.ts`, `public/assets/js/analytics-init.js`, `prototype/assets/js/app.js`
- Tests/tooling: `apps/api/test/settings-navigation.test.ts`, `e2e/ms42-{public,admin}.spec.ts`, `e2e/public.spec.ts`, `tooling/verify/{verify-ms42-audit,inspect-ms42-visual,nav-targets}.mjs`
- Docs: `docs/STATUS.md`, `docs/DRAWER_DRIFT_REPORT.md`, this report

---

## 5. Remaining issues — resolved on 2026-10-21

The issues listed here in the first version of this report were implemented in the follow-up remediation:

- **5 deploy-related API tests**: added the versioned legacy redirect map (103 authentic mappings), the CI `test-edge-config` job, and corrected the MS3.5 zero-cwd-write check. `edge-config`, `hypercare`, `phase-e` and the MS3.5 audit pass.
- **2 p10 API tests**: the block fixture now follows the shared 30-block schema.
- **5 E2E deep-link tests**: shop grid/chips, quote `#qProduct`, the 35-market locator and server-rendered search now render on the CMS pages; all five run and pass.
- **Hard-coded chrome**: Header mega-menu, Drawer and Footer columns/legal bar now render from the CMS menus (MS5.1 T5.1.1/T5.1.3), with settings-driven brand/contact/figures.

Full details and evidence are in [MS5.1_MS5.2_REMAINING_ISSUES_REPORT.md](MS5.1_MS5.2_REMAINING_ISSUES_REPORT.md).

Broader page-body conversion remains incomplete (some CMS sections still render headings without their original body content); that is wider MS5.2 work, not part of the issues above.

No commits were created. The working tree was not reset.
