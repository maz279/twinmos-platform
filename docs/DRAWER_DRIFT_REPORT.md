# Mobile Drawer Navigation Drift Report (Roadmap MS4.2 · T4.2.4 / INV-1)

**Date:** 2026-10-21  
**Author:** FS2 / Engineering  
**Subject:** Mobile Drawer Drift vs Desktop Mega-Menu (179 Authentic Links)  
**Status:** Documented for Content Owner Decision

---

## Executive Summary

During the implementation of Milestone MS4.2 (Site Settings and Navigation), an exhaustive audit of all navigation links across the tracked prototype was conducted. The baseline inventory comprises exactly **179 authentic links**:
- **84 links** in Desktop Mega-Menu (`header .nav a`)
- **56 links** in Mobile Drawer (`#drawer a`)
- **39 links** in Footer (`footer a`)

A structural drift exists between the Desktop Mega-Menu and the Mobile Drawer:
- **13 mega-menu links are missing from the mobile drawer**
- **9 links share the same destination URL (`href`) but have different labels**

---

## Section 1: The 13 Missing Links in Drawer

The following 13 destination targets are accessible via the desktop mega-menu but are omitted from the mobile drawer hierarchy:

| # | Destination Target (`href`) | Desktop Mega-Menu Label(s) | Category |
|---|---|---|---|
| 1 | `product.html?id=corex-pro-m2-pcie-gen-5-0-nvme-ssd` | "View the flagship SSD" | Products (Feature Panel) |
| 2 | `compatibility.html` | "Compatibility finder" | Products / Support |
| 3 | `gaming.html#sync` | "RGB sync ecosystems" | Gaming |
| 4 | `article.html?id=what-is-xmp` | "What is XMP?" | Gaming (Deep Explainer) |
| 5 | `article.html?id=what-is-amd-expo` | "What is AMD EXPO?" | Gaming (Deep Explainer) |
| 6 | `gaming.html#downloads` | "Wallpapers" | Gaming |
| 7 | `article.html?id=best-ram-for-gaming` | "Best RAM for gaming" | Gaming (Editorial) |
| 8 | `article.html?id=directstorage-gen5-gaming` | "DirectStorage & Gen 5" | Gaming (Editorial) |
| 9 | `solutions.html#workloads` | "Solutions by workload" | Solutions |
| 10 | `solutions.html#process` | "How we work — 4 steps" | Solutions |
| 11 | `solutions.html#footprint` | "Where we operate" | Solutions |
| 12 | `where-to-buy.html#trust` | "Buy with confidence" | Where to Buy |
| 13 | `legal.html#warranty` | "Warranty policy" | Support |

---

## Section 2: The 9 Relabelled Links (Drawer vs Mega-Menu)

The following 9 links point to identical destination URLs but use divergent labels between the desktop mega-menu and the mobile drawer:

| # | Destination (`href`) | Mobile Drawer Label | Desktop Mega-Menu Label | Root Cause / Note |
|---|---|---|---|---|
| 1 | `shop.html` | "All products" | "Products" / "All products →" / "Browse the full catalog — 39 products →" | Drawer uses concise label; mega uses directional arrow / count. |
| 2 | `gaming.html` | "Gaming home" | "Gaming" / "Gaming home — VOLTX" / "Enter the gaming hub →" | Drawer shortens brand sub-title. |
| 3 | `gaming.html#builds` | "Rigs & wallpapers" | "Rigs from the scene" | Drawer combines rigs and wallpapers into one item. |
| 4 | `where-to-buy.html#marketplaces` | "Online marketplaces" | "Verified marketplaces" | Synonymous descriptor change ("Online" vs "Verified"). |
| 5 | `where-to-buy.html#offices` | "Offices & hubs" | "TwinMOS offices & hubs" | Drawer drops "TwinMOS" prefix to conserve horizontal viewport space. |
| 6 | `support.html#downloads` | "Downloads" | "Firmware & manuals" | Drawer uses general terminology; mega uses technical detail. |
| 7 | `learn.html` | "Knowledge Hub" | "Learn home" / "Open the Knowledge Hub" | Standardized hub reference. |
| 8 | `compare.html` | "Compare tray 0" | "Compare products" | Drawer embeds dynamic tray badge counter in label. |
| 9 | `quote.html` | "Get a quote" | "Request a quote" / "Start an OEM quote" / "Volume & OEM supply" | Mega varies CTA by column context; drawer uses single global CTA. |

---

## Section 3: Recommended Action & Architectural Option

1. **Option A (Preserve Dual Menus):** Retain `header` (84 links) and `drawer` (56 links) as distinct `nav_menu` entities in the database. Content editors maintain both independently.
2. **Option B (Derive Drawer from Header in Chrome - Recommended for MS5.1):** When rendering mobile navigation, automatically adapt the `header` menu tree by collapsing mega-columns and adopting concise mobile labels.

Both menu definitions are now imported cleanly into the CMS database under `header`, `drawer`, and `footer` without inventing any links. All 179 links are preserved as authoritatively verified in the prototype.

---

## Addendum — Imported tree model (2026-10-21)

The importer now stores the prototype as real trees, not flat rows:

| Menu | Rows | Link targets | Group nodes | Shape |
|---|---|---|---|---|
| `header` | 100 | 84 | 16 | 6 top-level items → mega columns → links, plus 6 feature panels and 7 "all" rows |
| `drawer` | 56 | 50 | 6 | Home, 6 expandable groups (their prototype `href="#"` toggles), 47 submenu links, Compare, Quote |
| `footer` | 45 | 39 | 6 | Social (6), Products (11), Company (7), Support (11), Contact (1), Legal bar (3) |

- **179 prototype anchors accounted for:** 173 real destinations + the 6 drawer `href="#"` toggles. The toggles are stored as group nodes (`metadata.kind = "drawer_group"`, no `targetUrl`), because an empty `#` is not a resolvable target.
- Internal hrefs are normalised to absolute site paths (`shop.html` → `/shop.html`). Product, article and category hrefs become typed references (`targetType` + `targetId`) when the entity exists; delivery resolves them to `/products/<slug>`, `/learn/<slug>` and `/shop.html?cat=<slug>`.
- The Products "all" row stores its label as `Browse the full catalog — {{products}} products →`; delivery substitutes `site.figures.productCount` so the 45-vs-39 defect cannot recur.
- Re-importing deletes the previous `header`/`drawer`/`footer`/`legal` rows for `en` first, so the invented legacy `legal` menu cannot survive.

The 13 missing / 9 relabelled drawer items above still need a content-owner decision (Option A or B); no renames were invented by the importer.

