# TwinMOS Corporate Website — Working Prototype

A 100% static, dependency-free prototype of the TwinMOS corporate website
(www.twinmos.com rebuild). 28 HTML pages, 39 real products with real product
photography, full navigation/menu/hyperlink flows, working client-side
features, and a responsive layout audited from 320px to 1920px.

---

## Run it

**Option A — just open it**

Double-click `index.html` (works from `file://` — all data is embedded,
no fetch calls, no build step needed to view).

**Option B — local server (enables the PWA service worker)**

```bash
cd "<this folder>"
python -m http.server 8123
# open http://127.0.0.1:8123/
```

The service worker + installable manifest register automatically on any
`http://` origin and are safely skipped on `file://`.

## What's inside

| Path | Purpose |
|---|---|
| `*.html` (28 pages) | Home, Shop, Product (39 PDPs via `?id=`), Compare, Compatibility finder, Gaming (VOLTX), Solutions, Where to Buy, Support, RMA, **Knowledge hub (learn.html + 5 sub-hubs: guides / explainers / benchmarks / glossary A–Z / blog)**, News, Articles (98), About, Careers, Contact, RFQ/Quote, Legal (warranty/terms/privacy/EOL), Partners, Search, 404, Sitemap |
| `assets/css/main.css` | Full design system: corporate light theme + VOLTX dark gaming theme, RTL rules, fluid type, 480/640/768/1024/1280/1600 breakpoints, print styles |
| `assets/js/app.js` | Header/drawer/mega menu, search overlay, 9-locale selector (AR → live RTL), compare tray (localStorage, max 4), shop filters (category/generation/capacity/keyword/sort), PDP gallery + variants + spec tables + knowledge-guide band, compatibility finder, RMA tracker demo, article renderer (TOC · reading time · prev/next · cross-link related articles · topic products), glossary live filter, form validation, toasts, cookie consent |
| `assets/js/data.js` | All catalog data: 39 products (real SKUs, specs, images), 11 categories, 98 articles (with corpus cross-links, personas, reading time), 113 glossary terms, compatibility DB |
| `assets/img/` | Curated real TwinMOS photography + generated PWA icons (Pillow-optimized WebP) |
| `manifest.webmanifest`, `sw.js` | PWA installability + offline cache (http:// only) |
| `build.py`, `pb_*.py`, `site_content.py` | Rebuild pipeline (pure Python + Pillow). Run `python build.py` after editing any `pb_*.py` / `site_content.py`. Includes a link/asset QA pass. |
| `_shots/` | Render evidence: true-390px mobile renders + 834/1440px captures |

## Interactive flows to try

1. **Home hero slider** — 4 slides (brand / CoreX Pro Gen5 / VOLTX DDR5 / Portable SSD) with autoplay, dots, arrows, swipe, keyboard ←/→, pause-on-hover, reduced-motion + RTL support. The gaming hub runs its own 3-slide dark carousel.
2. **Home → mega menu → Shop** — filter by category/generation/capacity, search "ddr5", sort.
3. **Product page** (`shop → any card`) — multi-image gallery with thumbnails, capacity variants, spec table, warranty block, related rail, "Add to compare".
4. **Compare** — add 2–4 products, open the tray (bottom-right) → side-by-side spec table with differences highlighted.
5. **Compatibility finder** — Device → Brand → Model cascading selects → matching products.
6. **Gaming (VOLTX)** — dedicated dark theme, neon hero slider, gaming rail.
7. **Support → RMA** — validated form + live tracker demo (try `TM-RMA-2026-0142`); FAQ tabs on Support, deep-linkable legal tabs (`legal.html#terms|#privacy|#eol`).
8. **Language selector** — choose **AR (RTL)**: the entire layout flips to right-to-left live.
9. **Where to Buy** — verified marketplaces only (Amazon.ae, Newegg) + 5 real office addresses.
10. **Search overlay** — header 🔍 → type → Search button or Enter → results page (products + articles).

## Fact base (enforced)

Founded 1998, Taipei · 5 global offices · 93+ countries · warranty tiers
(Lifetime = memory modules; 5yr = NVMe/flash cards/USB; 3yr = SATA SSD;
1yr = accessories) · ISO 9001:2000 (TÜV SÜD, since 2002) · JEDEC/CE/FCC/
RoHS · CoreX Pro Gen5 flagship (14,000 MB/s, 1,400 TBW @2TB).
Content containing Smart Technologies (BD) data is intentionally absent.

## Knowledge Hub: 08-learn corpus fully surfaced (2026-09-26)

New page **`learn.html`** (page #23) — the corpus 08-learn folder (64 files,
all read) now has a dedicated hub instead of being buried in the newsroom mix:

- **Hero + stats band** (18 guides · 29 explainers · 4 benchmarks · 3 blog
  posts — counts computed from SC.ARTICLES at build time).
- **"The essentials"** band: featured "How to Choose RAM" guide + A–Z
  glossary card (`article.html?id=glossary`) + 4 curated hot picks
  (DDR4 vs DDR5 / What is DDR5 / NVMe vs SATA / Gen3-4-5).
- **Full library**: all 54 article cards server-rendered (no-JS safe) with
  `data-lcat` filter chips (reuse the `.lchip` pattern) + `?cat=guide|
  explainer|benchmark|blog` deep links; closing CTA band routes to the
  Compatibility finder / Where to buy.
- **Support dropdown (mega)**: `Support ▾` now opens a 3-column menu —
  Self-service / Knowledge hub (5 deep links) / Get help — plus a feature
  band with a dynamic article count. Mobile drawer gained a `dsub-support`
  submenu (8 links). Footer "Support" column links the hub + buying guides.
- **Cross-links**: support.html promo band ("Knowledge hub — 54 guides…")
  + FAQ head links; news.html library head → hub; learn-category articles
  show an "↑ Knowledge hub" chip on article.html (news/KB articles don't);
  sitemap lists the hub; SW precache includes learn.html.
- Evidence: `_shots/learn_hero_1440.png`, `learn_support_mega_1440.png`,
  `learn_library_mobile_390.png`. Verified: chips + deep links driven live,
  drawer submenu toggle, 0 overflow 320–1920 px, contrast audit clean,
  build QA passes (23 pages, all links resolve).

## Home: certification band fix + corpus trust-bar (2026-09-26)

The homepage certification strip was "misaligned completely" — root cause: the
where-to-buy pass had appended a `.trust-band{display:grid;repeat(4,1fr)}`
rule late in main.css, which silently overrode the ORIGINAL flex `.trust-band`
used on index.html and solutions.html (their single `.wrap` child got shoved
into one 341px grid column, stacking 5 items into a 552px column). Fix: the
where-to-buy band was renamed `.wtb-trust` (CSS + builder), restoring the
original band everywhere.

The homepage band was then rebuilt to the corpus trust-bar spec
(00-site-wide/09-trust-bar.md + 01-homepage §2): a proper
**"Certified quality & compliance" section** — headline "Trusted worldwide for
28 years" + ISO 9001/TÜV SÜD 2002 subline, five stat cells (28 Years of
excellence · 93+ Countries served · 5 Global offices · USB-IF Vendor ID 4719
→ usb.org · IEEE OUI 000B9D → regauth.standards.ieee.org, with title
tooltips, count-up on 28/93/5). VID 4719 and OUI 000B9D are externally
verified (Linux usb.ids / macvendors registry); the unverifiable
"301–500 employees" corpus stat was deliberately NOT used., and a badge row: ISO 9001 · JEDEC · CE · UKCA ·
FCC · RoHS · REACH · EAC + the verified 🏆 Best SSD Manufacturer 2023 award
chip. Evidence: `_shots/home_certband_1440.png`, `home_certband_mobile_390.png`.
Verified: 5 stats in one row (229px each), solutions.html band back to flex
(78px, 4 items), 0 overflow 320–1920 px on index, contrast audit clean.

## Where-to-buy: country distributor locator (2026-09-25)

`where-to-buy.html` now carries a **country-by-country distributor locator**
built from the corpus regional pages (11-regional) and partner hubs:

- **35 market cards** across 6 regions (Middle East & GCC 6 · Africa 15 ·
  Asia-Pacific 8 · Europe 3 · Russia & CIS 2 · Americas 1), each with a
  status chip (Authorized distribution / Expanding coverage / Seeking
  distributors / TwinMOS hub), key cities, coverage note and CTAs
  (connect via `sales@twinmos.com`, or "Become a distributor" for
  seeking markets). Named partner companies are intentionally **not**
  published — post-remediation rule: only country-level coverage status
  is verified corpus fact.
- **Controls:** live search (country + city, e.g. "Dubai" → UAE),
  region chips with counts, channel-status dropdown, results counter,
  no-results state; deep links `?region=africa` / `?country=IN`; and a
  timezone-based geo-detect bar ("Detected: … — Show my channel") with
  no network calls — suggestion only, never auto-filtering.
- Cards are **static HTML** (works without JS; SEO-crawlable) — JS only
  filters. Marketplaces section gained the corpus "also listed on" strip
  (Noon / Daraz / regional Amazons — pending quarterly re-verification);
  page closes with a trust band (Authorized only · Quarterly review ·
  Serial verification · Partner with us).
- Data flows from `pb_content.import_distributors(SC)` →
  `SC.DISTRIB_COUNTRIES` — extend the table there, never hand-edit HTML.
- Evidence: `_shots/wtb_hero_1440.png`, `wtb_locator_1440.png`,
  `wtb_locator_mobile_390.png`, `wtb_locator_cards_mobile_390.png`.
  Verified: filters/search/geo/deep-links live-driven; 0 horizontal
  overflow 320–1920 px; contrast audit clean on all new elements.

## QA evidence (2026-09-24, iteration 2 — live-browser audit)

- **Live click-through:** every page, menu, mega menu, drawer, chip, filter,
  tab, form, tracker and slider driven in a real browser (in-app browser +
  local HTTP server) — issues found were fixed and re-verified in the same
  session:
  - search overlay gained a visible **Search** button (implicit Enter-submit
    is unreliable in embedded webviews) and the dialog now sits above its
    click-veil (`z-index` fix — the veil previously blocked clicks);
  - **Portable SSD** category had 0 products (two portable SSDs were mapped
    into NVMe by category-order) — fixed; counts now 2 / NVMe 5;
  - Support FAQ + Legal **tabs had no click handler** — generic tab
    component added, plus deep links (`legal.html#terms|#privacy|#eol`,
    also on same-page hash changes);
  - **product galleries** enriched — every PDP now has multiple thumbnails
    (own images + same-category shots); thumb click swaps the main image;
  - **articles** now carry a real hero photograph (13/13);
  - asset URLs are **content-hash versioned** (`?v=…`) and the service
    worker cache is keyed per build, so rebuilds never strand stale CSS/JS.
- **Links/assets:** build-time checker — every internal link, image and
  script resolves (0 broken).
- **JS errors:** 0 `window.onerror` hits across all probes.
- **Catalog:** all 39 PDPs render; rails verified.
- **Responsive:** DOM-level overflow probe, **21 pages × 11 widths
  (320–1920) = 231 combos → 0 horizontal overflow** (re-run in a real
  browser after the slider landed; slider hides arrows ≤640px and keeps
  dots/swipe).
- **Slider behavior verified live:** autoplay advance, dot/arrows/swipe/
  keyboard control, LTR + RTL direction handling, no-JS fallback shows
  slide 1.

## Rebuild

```bash
python build.py   # regenerates all 28 pages + data.js + sw + manifest, runs link QA
```

Assets are fingerprinted automatically — no manual cache-busting needed.

## Knowledge hub architecture (2026-09-26)

The `08-learn` corpus (64 md files) is realized as a topic-first knowledge
base — every article ≤3 clicks from the hub home:

```
learn.html            hub home — search, stats, 6 destination tiles,
                      4 persona learning paths, essentials
├─ learn-guides.html      18 buying guides in 4 corpus groups (RAM / SSD /
│                          builds / enterprise) with best-for lines
├─ learn-explained.html   29 explainers in 3 majors × 9 sub-groups
├─ learn-benchmarks.html  methodology + 4 benchmark runs + test rig + caveats
├─ learn-glossary.html    113 terms, A–Z letter index + live filter,
│                          18 term→explainer links
└─ learn-blog.html        3 posts + coming-soon pipeline + categories
article.html?id=…     article anatomy: hub breadcrumb, reading time,
                      sticky TOC, prev/next in category, related articles
                      from corpus cross_links, topic-matched products,
                      copy-link; PDPs cross-link topic guides back
```

Inbound navigation: Support mega menu + mobile drawer + footer (6 links),
sitemap, support promo, newsroom, and PDP "Learn before you buy" bands.
Grouping metadata, glossary terms, cross-links, personas and reading time
are all parsed from the corpus at build time (`pb_content.py` →
`SC.LEARN_HUBS` / `SC.GLOSSARY`) — never hand-copied.

**QA (2026-09-26):** 0 JS errors on 10 URL probes; overflow probe
8 pages × 11 widths (320–1920) → 0 horizontal overflow (after removing
`white-space:nowrap` from hub-band links at 320px); glossary filter/empty
state, letter jump, prev/next, cross-link chips, PDP guide band and the
full click-through flow verified live; WCAG-style contrast audit clean
(the only flags are the known gradient-background CTA false positives).

**Post-delivery audit (2026-09-26, second pass):** corpus-coverage diff
(55/55 articles imported AND linked from a hub, 113/113 glossary terms,
full A–Z) found and fixed 4 defects — (1) 10 articles carried dead
cross-links (corpus drops the `benchmark-` id prefix; links are now
resolved at build time via `_resolve`, 166 live / 0 dead, benchmark
articles cross-link each other); (2) `article.html?id=glossary` was an
orphaned duplicate — it now redirects to `learn-glossary.html`; (3) site
search gained a **Glossary terms** section (letter-chip cards deep-linking
`learn-glossary.html#gL…`) and no longer offers the glossary as a flat
article; (4) KB articles now show "↑ Support center" instead of the
wrong "↑ Newsroom" chip. Polish: contextual learning-path footers,
typographic quotes restored on the careers motto + hub lede, 5-cell stat
band spans full width in its 2-column breakpoint, dead `initLearnHub`
removed. Known pre-existing (not a regression): `dir=rtl` shows a 9999px
document scrollWidth on ALL pages including index/support.
