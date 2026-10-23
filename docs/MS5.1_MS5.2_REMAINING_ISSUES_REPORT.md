# Remaining-issues remediation report — deploy, page widgets, CMS chrome

**Date:** 2026-10-21  
**Scope:** the three categories left open by the MS4.2 completion report:
1. 7 red API tests (5 deploy artifacts + 2 outdated block fixtures),
2. 5 skipped E2E deep-link tests (CMS page widgets),
3. hard-coded header/drawer/footer markup (MS5.1 T5.1.1/T5.1.3).

All three are now implemented and verified.

---

## 1. Deploy artifacts and the 5 API tests

- Added `deploy/nginx/twinmos-redirects.map` with **103 authentic legacy mappings** taken from the archived twinmos.com crawl (`twinmos_website_offline`): the 16 WooCommerce category paths and their aliases, corporate/shop/legal pages, FAQ/compatibility pages, knowledge-hub hubs and pagination, technology explainers, buying guides and legacy product pages. This includes the exact paths asserted by the tests (`/product-category/solid-state-drive`, `/about-us`, `/career`, `/warranty`, `/product-category/dram-module/desktop-dram`, `/product-category/portable-drives/`).
- Added the `test-edge-config` CI job (`.github/workflows/ci.yml`) that builds `deploy/edge/Dockerfile`, runs `nginx -t`, and executes `tooling/verify/edge-ip-proof.mjs`.
- The real `nginx -t` run exposed a pre-existing config bug: the hashed-asset `location ~*` regex used `{8,}` unquoted, so nginx parsed `{` as a block delimiter (`pcre2_compile() failed`). Quoted the regex. The CI command also needs `--add-host=web:127.0.0.1 --add-host=api:127.0.0.1` so the upstream names resolve during the syntax-only run; `docker run ... nginx -t` now reports **syntax is ok / test is successful** locally.
- Verified the map end-to-end in the built edge image over HTTPS: `/about-us` → `/about.html`, `/warranty` → `/legal.html#warranty`, `/product-category/solid-state-drive` → `/shop.html?cat=ssd`, `/career` → `/careers.html`.
- Corrected the MS3.5 zero-cwd-write audit: it now requires the versioned map to exist with at least 72 rules and asserts that **no runtime code writes it**, instead of asserting the artifact is absent.
- Result: `edge-config` 14/14, `hypercare` 8/8, `phase-e` 9/9; `npm run verify:ms35` is **9/9**.

## 2. Block fixture and the 2 p10 API tests

`apps/api/test/p10-content-studio.e2e.test.ts` now uses the MS4.1 shared 30-block contract:
- `textMedia` uses `body`/`mediaPosition`;
- `featureGrid` uses numeric `columns` and `description`;
- `downloadDatasheet` uses `files[].title/fileKey`;
- `ctaBanner` uses `ctas[]`;
- `faqAccordion` uses `question/answer`;
- `statsCounter` uses `stats[]` (legacy `items` retained for the raw round-trip assertion);
- `timeline` uses `milestones[]`;
- `testimonial` uses top-level `quote/author`.
Result: p10 **5/5 passed** (including the PATCH replacement test).

## 3. CMS page widgets (the 5 E2E deep links)

`BlockDispatcher.astro` now renders the real widgets instead of empty block placeholders:

- **Shop**: `widget:category-chips` and `widget:product-listing` render the filter rail (live category facets), search/sort/clear controls, `#activeFilters`, `#resultCount` and a `#shopGrid` that `app.js` populates with `.pcard` cards. `?cat=` filtering works.
- **Quote**: the `form` block renders the quote fields with `#qProduct`; `app.js` hydrates the select from the catalog and prefills the `?product=` slug.
- **Where to buy**: extracted the authentic 35-market locator (7 region chips, 35 cards with country/region/status/cities/actions) from the prototype into `apps/web/src/data/locator.json`; `widget:locator-controls` renders the geo bar, search/status controls, chips, count and empty state; `distributor-locator` renders `#locGrid`. `?region=africa` and `?country=IN` deep links work through `app.js`.
- **Search**: `widget:search-results` renders `#searchQ` and `#searchMount`; `app.js` renders product/article results and glossary terms for `?q=`.

All five formerly `test.fixme` tests were re-enabled: **`?region=africa`, `?country=IN`, quote prefill, `?cat=dram-gaming`, `?q=DDR5` — 5/5 pass**.

## 4. CMS-driven chrome (MS5.1 T5.1.1/T5.1.3)

- `Layout.astro` fetches the settings and the three menus in parallel and passes `header`/`drawer`/`footer` trees to the chrome.
- `Header.astro` renders the mega-menu from the menu tree: 6 top-level items, 16 columns, 65 column links, 6 feature panels (with image, heading, description and link), 7 "all" rows. The active item is derived from the current path. Column emphasis ("All products") is preserved via importer metadata.
- `Drawer.astro` renders Home, the six expandable groups with their submenu links, the compare tray and the quote CTA from the drawer menu.
- `Footer.astro` renders the Products/Company/Support columns and the legal bar (Terms · Privacy · Cookie Preferences · Sitemap) from the footer menu; the contact block, social row, figures, WhatsApp link, logo and tagline come from settings.
- Delivery-time nav text resolution expands `{{products}}`, `{{countries}}`, `{{foundingYear}}` and baseline "since 1998"/"93+ countries" claims, so the header feature panels follow `site.figures` (the live G-REFLECT test passes).
- No hard-coded navigation links remain in Header/Drawer/Footer.

## 5. Verification

| Check | Result |
|---|---|
| Typecheck (`npm run typecheck`) | 0 errors, 0 warnings, 0 hints |
| MS4.2 API suite | 18/18 |
| Deploy-related API tests | 31/31 |
| Edge image `nginx -t` | syntax ok / test successful (with CI host aliases) |
| p10 content-studio | 5/5 |
| Full API suite | **588 passed, 0 skipped, 0 failed** (54/54 files) |
| Full Playwright E2E | **68 passed, 0 skipped, 0 failed** |
| MS4.2 live master audit | **18/18**, `GREF-C` CLEARED |
| MS3.5 audit | **9/9** |
| axe visual/a11y | 29 routes, 0 violations |
| Public walk | 29/29 clean, 0 JS/CSP errors |
| Manual suite | All scenarios passed |
| Live nav targets | 173 targets, 0 unresolved |
| Full API suite | see `tooling/verify/evidence/ms42/api_suite_after_remediation.log` |

Chrome screenshots: `tooling/verify/evidence/ms42/05_cms_header_megamenu.png`, `06_cms_drawer.png`.

## 6. Remaining known gaps (not in this scope)

- The CMS catalog currently exposes **1 published product** while the prototype catalog carries 40; the shop grid is functional but the CMS content set still needs the full catalog import.
- Other page bodies beyond these four widgets are still partially converted (MS5.2); some sections render headings without their original body content.
- Search overlay suggestions and the compare-tray data flow remain as previously implemented.

No commits were made.
