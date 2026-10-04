# TwinMOS Website — Low-Fidelity Wireframes

**Document ID:** E.2.1 | **Version:** 1.0 | **Date:** 30 April 2026 | **Status:** FINAL

**Cross-References:** URD §21, §23 | Tech Stack §4.4 | Component Library | Spacing Grid

---

## 1. Overview

Low-fidelity wireframes for all major page types on the TwinMOS corporate website. Focus on layout structure, content hierarchy, and functional placement.

**Conventions:** Boxes = content blocks, X's = images, [ ] = interactive elements, lines = text.

---

## 2. Global Elements

### Header (All Pages)
```
┌─────────────────────────────────────────────────────────────────────┐
│ [LOGO]  Products▼  Solutions  Support  About  Gaming    [Q][🌐][Contact] │
└─────────────────────────────────────────────────────────────────────┘
```
Mobile: `[☰] [LOGO] [Q][🌐]`

### Footer (All Pages)
```
┌─────────────────────────────────────────────────────────────────────┐
│ [LOGO]                                                              │
│ Products  Support  Company  Connect                                 │
│ Memory    Warranty About Us Newsletter                              │
│ SSD       RMA      Careers  [Email____][Subscribe]                  │
│ Portable  Contact  Partners Social Icons                            │
│ © 2026 TwinMOS  Privacy  Terms  Cookies  Sitemap                    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Homepage Wireframe

### Desktop
```
┌─────────────────────────────────────────────────────────────────────┐
│ HEADER                                                              │
├─────────────────────────────────────────────────────────────────────┤
│ HERO                                                                │
│  Headline: Performance You Can Trust                                │
│  Subheadline: Premium memory and storage solutions                  │
│  [Explore Products] [Learn More]                                    │
│  [XXXXXXXXXXXX HERO IMAGE XXXXXXXXXXXX]                             │
│                              ● ○ ○                                  │
├─────────────────────────────────────────────────────────────────────┤
│ TRUST BAR: Trusted in 93+ countries  [P1] [P2] [P3] [P4] [P5]      │
├─────────────────────────────────────────────────────────────────────┤
│ PRODUCT CATEGORIES                                                  │
│  [X Memory] [X SSD] [X Portable] [X USB] [X Gaming]                 │
├─────────────────────────────────────────────────────────────────────┤
│ FEATURED PRODUCTS                                                   │
│  [X Product 1] [X Product 2] [X Product 3] [X Product 4]            │
│  Name/Specs/CTA for each                                            │
│                                          [View All Products →]      │
├─────────────────────────────────────────────────────────────────────┤
│ BRAND TRUST: 25+ Years • 93+ Countries • 100+ Products              │
├─────────────────────────────────────────────────────────────────────┤
│ NEWS TEASER                                                         │
│  [X News 1] [X News 2] [X News 3]                                   │
├─────────────────────────────────────────────────────────────────────┤
│ GAMING CTA (Dark bg): VOLTX Gaming Memory  [Explore VOLTX →]        │
├─────────────────────────────────────────────────────────────────────┤
│ FOOTER                                                              │
└─────────────────────────────────────────────────────────────────────┘
```

### Mobile
```
┌─────────────────────────────┐
│ HEADER (hamburger)          │
├─────────────────────────────┤
│ HERO: Headline              │
│ [Explore]                   │
│ [XXXX HERO IMAGE XXXX]      │
│ ● ○ ○                       │
├─────────────────────────────┤
│ TRUST BAR (scroll)          │
├─────────────────────────────┤
│ CATEGORIES (2-col grid)     │
│ [Memory] [SSD]              │
│ [Portable] [USB]            │
│ [Gaming]                    │
├─────────────────────────────┤
│ FEATURED (vertical scroll)  │
│ [X Product 1]               │
│ [X Product 2]               │
├─────────────────────────────┤
│ GAMING CTA                  │
├─────────────────────────────┤
│ FOOTER (stacked)            │
└─────────────────────────────┘
```

---

## 4. Product Category Page

### Desktop
```
┌─────────────────────────────────────────────────────────────────────┐
│ HEADER                                                              │
├─────────────────────────────────────────────────────────────────────┤
│ Breadcrumb: Home > Products > Memory > DDR5 Desktop                 │
├─────────────────────────────────────────────────────────────────────┤
│ DDR5 Desktop Memory (12 products)                        [Sort ▼]   │
├──────────────────┬──────────────────────────────────────────────────┤
│ FILTER SIDEBAR   │  PRODUCT GRID (3-col)                            │
│ Capacity         │  [X Product] [X Product] [X Product]             │
│  [ ] 8GB         │  [X Product] [X Product] [X Product]             │
│  [✓] 16GB        │                                                  │
│  [✓] 32GB        │  [Load More]                                     │
│ Speed            │                                                  │
│  [✓] 5600MHz     │                                                  │
│  [✓] 6000MHz     │                                                  │
│ [Clear All]      │                                                  │
├──────────────────┴──────────────────────────────────────────────────┤
│ FOOTER                                                              │
└─────────────────────────────────────────────────────────────────────┘
```

### Mobile
```
┌─────────────────────────────┐
│ HEADER                      │
├─────────────────────────────┤
│ Breadcrumb                  │
│ DDR5 Desktop (12)           │
│ [Filters] [Sort ▼]          │
│ Active: [16GB ✕][32GB ✕]    │
│ [Clear All]                 │
├─────────────────────────────┤
│ [X Product 1]               │
│ [X Product 2]               │
│ ...                         │
│ [Load More]                 │
├─────────────────────────────┤
│ FOOTER                      │
└─────────────────────────────┘
```

---

## 5. Product Detail Page

### Desktop
```
┌─────────────────────────────────────────────────────────────────────┐
│ HEADER                                                              │
├─────────────────────────────────────────────────────────────────────┤
│ Breadcrumb: Home > Products > Memory > DDR5 > VOLTX RGB DDR5-6000   │
├──────────────────────────────┬──────────────────────────────────────┤
│  IMAGE GALLERY (50%)         │  PRODUCT INFO (50%)                  │
│  [XXXXXXXXXXXXXXXXXXXX]      │  [New] [Featured]                    │
│  [XXXX MAIN IMAGE XXXX]      │  VOLTX RGB DDR5-6000 32GB            │
│  [XXXXXXXXXXXXXXXXXXXX]      │  SKU: TMV532G6000RGB                 │
│  [X1][X2][X3][X4]            │  • 32GB • DDR5-6000 • RGB • XMP 3.0 │
│                              │  Warranty: Limited Lifetime          │
│                              │  [Where to Buy] [Add to Compare]     │
│                              │  [Download Datasheet]                │
├──────────────────────────────┴──────────────────────────────────────┤
│  [Specifications] [Features] [Compatible] [Downloads]               │
├─────────────────────────────────────────────────────────────────────┤
│  TAB CONTENT (specs table, features, etc.)                          │
├─────────────────────────────────────────────────────────────────────┤
│  RELATED PRODUCTS (4 cards horizontal)                              │
├─────────────────────────────────────────────────────────────────────┤
│ FOOTER                                                              │
└─────────────────────────────────────────────────────────────────────┘
```

### Mobile
```
┌─────────────────────────────┐
│ HEADER                      │
├─────────────────────────────┤
│ Breadcrumb                  │
│ [New]                       │
│ Product Name                │
│ SKU                         │
├─────────────────────────────┤
│ [XXXXXXXX MAIN IMAGE XXXX]  │
│ [X1][X2][X3][X4]            │
├─────────────────────────────┤
│ • Spec 1 • Spec 2 • Spec 3  │
├─────────────────────────────┤
│ [Where to Buy] (sticky)     │
├─────────────────────────────┤
│ [Specs][Features][Compat]   │
│ Tab content...              │
├─────────────────────────────┤
│ RELATED (horizontal scroll) │
├─────────────────────────────┤
│ FOOTER                      │
└─────────────────────────────┘
```

---

## 6. Compatibility Finder

```
┌─────────────────────────────────────────────────────────────────────┐
│ HEADER                                                              │
├─────────────────────────────────────────────────────────────────────┤
│ Breadcrumb: Home > Compatibility Finder                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│         Find Compatible Memory for Your System                      │
│                                                                     │
│    [By Laptop/Desktop]  [By Motherboard]                            │
│                                                                     │
│    Brand: [Select Brand ▼]                                          │
│    Model: [Type model name...    ] [Search]                         │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  RESULTS                                                            │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  Device: Dell Inspiron 15 3520                              │    │
│  │  Max RAM: 16GB • DDR4-3200 • SO-DIMM                        │    │
│  └─────────────────────────────────────────────────────────────┘    │
│  Compatible Products                                                │
│  RAM: [X Product Verified] [X Product Tested] [X Product Verified]  │
│  SSD: [X Product] [X Product]                                       │
├─────────────────────────────────────────────────────────────────────┤
│ FOOTER                                                              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 7. Where to Buy

```
┌─────────────────────────────────────────────────────────────────────┐
│ HEADER                                                              │
├─────────────────────────────────────────────────────────────────────┤
│  Find TwinMOS Products Near You                                     │
│  Country: [UAE ▼]  [Detect Location]                                │
│  [Map View] [List View]  Filter: [All ▼]                            │
├──────────────────────────────┬──────────────────────────────────────┤
│      [MAP VIEW]              │  RETAILER LIST                       │
│      (Interactive map        │  ┌──────────────────────────────┐   │
│       with pins)             │  │ [Logo] Retailer Name         │   │
│                              │  │ 📍 Address  📞 Phone         │   │
│                              │  │ 🌐 Website [Get Directions]  │   │
│                              │  └──────────────────────────────┘   │
│                              │  ┌──────────────────────────────┐   │
│                              │  │ [Logo] Retailer Name         │   │
│                              │  │ 📍 Address  📞 Phone         │   │
│                              │  └──────────────────────────────┘   │
├──────────────────────────────┴──────────────────────────────────────┤
│ FOOTER                                                              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 8. Support Center

```
┌─────────────────────────────────────────────────────────────────────┐
│ HEADER                                                              │
├─────────────────────────────────────────────────────────────────────┤
│  How Can We Help?                                                   │
│  [Search help articles...                          ]                │
├─────────────────────────────────────────────────────────────────────┤
│  CATEGORY CARDS (3-4 col)                                           │
│  [X Warranty] [X RMA] [X Firmware] [X Knowledge Base]               │
│  [X Installation] [X Contact]                                       │
├─────────────────────────────────────────────────────────────────────┤
│  QUICK LINKS                                                        │
│  Most Viewed: How to register warranty | DDR5 installation guide    │
│  Popular FAQs: What is XMP? | Compatibility check | Warranty coverage│
├─────────────────────────────────────────────────────────────────────┤
│  Can't find what you need? [Contact Us]                             │
├─────────────────────────────────────────────────────────────────────┤
│ FOOTER                                                              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 9. Gaming Hub

```
┌─────────────────────────────────────────────────────────────────────┐
│ HEADER (dark)                                                       │
├─────────────────────────────────────────────────────────────────────┤
│  DARK BACKGROUND                                                    │
│  VOLTX                                                              │
│  UNLEASH THE POWER                                                  │
│  Premium gaming memory with RGB lighting                            │
│  [Explore Products]                                                 │
│  [XXXX HERO VIDEO/ANIMATION XXXX]                                   │
├─────────────────────────────────────────────────────────────────────┤
│  PRODUCT SHOWCASE (Dark bg)                                         │
│  [X VOLTX RGB] [X VOLTX Pro] [X VOLTX RGB] [X VOLTX Pro]            │
├─────────────────────────────────────────────────────────────────────┤
│  RGB SHOWCASE                                                       │
│  [Rainbow] [Breathing] [Static] [Wave]                              │
│  [XXXX RGB PREVIEW XXXX]                                            │
├─────────────────────────────────────────────────────────────────────┤
│  BUILD GALLERY                                                      │
│  [X Build 1] [X Build 2] [X Build 3] [X Build 4] [X Build 5]        │
│  [Submit Your Build]                                                │
├─────────────────────────────────────────────────────────────────────┤
│ FOOTER (dark)                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 10. Contact Page

```
┌─────────────────────────────────────────────────────────────────────┐
│ HEADER                                                              │
├─────────────────────────────────────────────────────────────────────┤
│  Contact TwinMOS                                                    │
├──────────────────────────────┬──────────────────────────────────────┤
│  CONTACT FORM                │  CONTACT INFO                        │
│  Name * [________]           │  📍 Dubai HQ                         │
│  Email * [________]          │  TwinMOS Technologies FZ-LLC         │
│  Country * [Select ▼]        │  Dubai Silicon Oasis, UAE            │
│  Subject * [Select ▼]        │                                      │
│  Message * [            ]    │  📞 +971 4 xxx xxxx                  │
│  [Submit]                    │  ✉️ info@twinmos.com                 │
│                              │  🕐 Sun–Thu 9AM–6PM GST              │
│                              │  [View on Map]                       │
├──────────────────────────────┴──────────────────────────────────────┤
│ FOOTER                                                              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 11. Annotation Standards

| Symbol | Meaning |
|--------|---------|
| [Text] | Button |
| [Text ▼] | Dropdown |
| [____] | Input |
| (X) | Image |
| [✓] | Checked |
| [ ] | Unchecked |
| ● ○ ○ | Pagination |

---

*Document Owner: UX Lead | Review: Per sprint*
