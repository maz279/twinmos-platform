---
title: "Header Navigation"
slug: "header-navigation"
url: "/components/header-navigation"
template: "component"
description: "Primary site header with responsive navigation, mega-menu dropdowns for product discovery, utility navigation, search, language selector, and persistent Where to Buy CTA."
keywords: ["navigation", "menu", "header", "mega-menu", "primary nav", "TwinMOS"]
persona: ["visitor", "buyer", "distributor", "press"]
phase: P1
priority: P0
owner: "web-team"
status: draft
last_reviewed: "2026-04-29"
locale: en
hreflang: []
schema: ""
ctas: ["where-to-buy", "search", "contact"]
cross_links: ["/products", "/solutions", "/where-to-buy", "/support", "/about", "/news", "/contact"]
sources: ["BRD", "URD", "RFP"]
---

# Header Navigation

## Overview
The header navigation is the primary wayfinding system for the TwinMOS website. It provides immediate access to all major sections, features a mega-menu for product discovery, and includes utility functions (search, language, CTA) that persist across all pages. The navigation is designed to support both consumer browsing and B2B distributor workflows.

**Key Design Principle**: The header must load and be interactive within 1 second (BRD §20 Performance Requirements).

---

## Header Structure

### Top Bar (Optional — Announcements)
- **Height**: 36px
- **Background**: Brand dark (#1A1A2E) or accent color
- **Content**: Time-sensitive announcements, promotions, or alerts
- **Dismissible**: X button to close, persists per session
- **Example**: "COMPUTEX 2025: Visit us at Booth I1431 — [Learn More](/news/computex-2025)"

### Main Header
- **Height**: 72px desktop, 64px mobile
- **Background**: White (#FFFFFF) with bottom shadow on scroll
- **Position**: Sticky (fixed after scroll)
- **Z-Index**: 1000
- **Max Width**: 1440px, centered
- **Padding**: 0 24px

### Header Layout (Desktop)
```
[Logo]  [Primary Nav]                    [Utility Nav]
         Products | Solutions | Where to Buy | Support | About | News | Contact    [Search] [EN ▼] [Where to Buy]
```

---

## Logo

### TwinMOS Logo
- **Position**: Left-aligned
- **Size**: 140px width, auto height
- **Link**: [/](/)
- **Alt Text**: "TwinMOS Technologies — Home"
- **Versions**: 
  - Default: Full color logo
  0: Monochrome white (for dark header variant)

### Logo Behavior
- Click returns to homepage
- Focusable via keyboard
- Hover: subtle opacity change (0.8)

---

## Primary Navigation

### Navigation Items (Left to Right)

#### 1. Products
**Label**: "Products"  
**Type**: Mega-menu dropdown  
**Trigger**: Hover (desktop) / Tap (mobile)  
**Icon**: Chevron down (▼) indicating dropdown

**Mega-Menu Layout** (3-column grid):

**Column 1: DRAM Memory Modules**
- [VOLTX DDR5](/products/memory/voltx-ddr5) — "Next-gen DDR5 for enthusiasts"
- [VOLTX RGB DDR5](/products/memory/voltx-rgb-ddr5) — "Gaming memory with RGB lighting"
- [VOLTX DDR5 SO-DIMM](/products/memory/voltx-ddr5-sodimm) — "Laptop DDR5 memory"
- [TornadoX7 Pro DDR4](/products/memory/tornadox7-pro) — "Performance DDR4 CL16"
- [TornadoX7 DDR4](/products/memory/tornadox7) — "Reliable DDR4 CL22"
- [Thunder GX DDR4](/products/memory/thunder-gx) — "Gaming DDR4"
- [Concord RGB DDR4](/products/memory/concord-rgb) — "RGB gaming memory"
- [DDR4 SO-DIMM](/products/memory/ddr4-sodimm) — "Laptop upgrade memory"
- [DDR3 Legacy](/products/memory/ddr3) — "Legacy system support"

**Column 2: Solid State Drives**
- [CoreX Pro Gen5 NVMe](/products/ssd/corex-pro-gen5) — "Up to 14,000 MB/s read"
- [CoreX Gen4 NVMe](/products/ssd/corex-gen4) — "High-performance Gen4"
- [Xtreme Gen4 NVMe](/products/ssd/xtreme-gen4) — "Gaming & content creation"
- [Xtreme Pro Gen4](/products/ssd/xtreme-pro-gen4) — "Pro-grade Gen4 SSD"
- [Alpha Pro Gen3](/products/ssd/alpha-pro-gen3) — "Budget-friendly NVMe"
- [TW300 Gen3](/products/ssd/tw300-gen3) — "Entry-level NVMe"
- [Hyper H2 Ultra SATA](/products/ssd/hyper-h2-ultra) — "2.5" SATA III SSD"
- [M.2 2280 SATA](/products/ssd/m2-sata) — "M.2 form factor SATA"

**Column 3: Portable Storage & More**
- [ELITE Drive Pro](/products/portable/elite-drive-pro) — "USB Type-C portable SSD"
- [ProDrive Ultra](/products/portable/prodrive-ultra) — "Portable HDD"
- [Mobile Disk X3](/products/usb-flash/mobile-disk-x3) — "USB 3.2 flash drive"
- [USB Hub 4-Port](/products/accessories/usb-hub) — "4-port USB 3.0 hub"
- **Featured Promo Card**:
  - "New: VOLTX RGB DDR5 6000MHz"
  - [Explore →](/products/memory/voltx-rgb-ddr5)

**Mega-Menu Footer**:
- [View All Products](/products) — "Complete product catalog"
- [Product Comparison](/products/compare) — "Compare specifications side by side"
- [Compatibility Finder](/products/finder) — "Find memory for your system"

---

#### 2. Solutions
**Label**: "Solutions"  
**Type**: Standard dropdown  
**Trigger**: Hover (desktop) / Tap (mobile)

**Dropdown Items**:
- [Gaming & eSports](/solutions/gaming) — "Build the ultimate gaming rig"
- [Content Creation](/solutions/content-creation) — "Memory and storage for creators"
- [System Builders](/solutions/system-builders) — "Reliable components for SI/OEM"
- [Enterprise & SMB](/solutions/enterprise) — "Business storage solutions"
- [Education](/solutions/education) — "Affordable upgrades for institutions"
- [Embedded & Industrial](/solutions/embedded-industrial) — "Rugged, reliable storage"

---

#### 3. Where to Buy
**Label**: "Where to Buy"  
**Type**: Standard dropdown  
**Trigger**: Hover (desktop) / Tap (mobile)

**Dropdown Items**:
- [Find a Distributor](/where-to-buy) — "Authorized distributors worldwide"
- [Online Stores](/where-to-buy/online) — "Buy from trusted e-tailers"
- [Regional Offices](/contact) — "Local sales and support contacts"
- **Quick Contact**:
  - "Middle East: [+971-4-2996421](tel:+97142996421)"

---

#### 4. Support
**Label**: "Support"  
**Type**: Standard dropdown  
**Trigger**: Hover (desktop) / Tap (mobile)

**Dropdown Items**:
- [Support Hub](/support) — "All support resources"
- [Warranty Registration](/support/warranty-registration) — "Register your product"
- [Warranty Lookup](/support/warranty-lookup) — "Check your warranty status"
- [RMA & Returns](/support/rma) — "Return merchandise authorization"
- [Technical Support](/support/technical) — "KB articles and guides"
- [Downloads & Drivers](/support/downloads) — "Firmware, drivers, manuals"
- [Compatibility Finder](/products/finder) — "Will it work with my system?"
- [FAQ](/support/faq) — "Frequently asked questions"

---

#### 5. About TwinMOS
**Label**: "About"  
**Type**: Standard dropdown  
**Trigger**: Hover (desktop) / Tap (mobile)

**Dropdown Items**:
- [Company Overview](/about) — "Who we are"
- [History & Heritage](/about/history) — "27+ years of innovation"
- [Leadership Team](/about/leadership) — "Meet our executives"
- [Manufacturing](/about/manufacturing) — "How we build quality"
- [Quality Assurance](/about/quality-assurance) — "Testing and certification"
- [Certifications](/about/certifications) — "ISO, CE, FCC, and more"
- [Global Presence](/about/global-presence) — "93+ countries served"
- [Sustainability](/about/sustainability) — "ESG commitments"
- [Careers](/careers) — "Join our team"

---

#### 6. News & Events
**Label**: "News"  
**Type**: Standard dropdown  
**Trigger**: Hover (desktop) / Tap (mobile)

**Dropdown Items**:
- [News Hub](/news) — "Latest updates"
- [Press Releases](/news/press-releases) — "Official announcements"
- [Events & Tradeshows](/news/events) — "Where to find us"
- [Awards](/about/awards) — "Industry recognition"
- [Media Kit](/about/media-kit) — "Press resources"

---

#### 7. Contact
**Label**: "Contact"  
**Type**: Direct link (no dropdown)  
**Link**: [/contact](/contact)

---

## Utility Navigation (Right Side)

### Search Icon
- **Icon**: Magnifying glass (🔍)
- **Label**: "Search" (aria-label)
- **Action**: Expands search input overlay
- **Keyboard Shortcut**: `/` focuses search

### Language Selector
- **Icon**: Globe (🌐)
- **Label**: "EN" (current language code)
- **Action**: Opens language dropdown
- **Options**: English | العربية (Planned) | 简体中文 (Planned)
- **Link**: [Language Selector Component](/components/language-selector)

### Where to Buy CTA Button
- **Label**: "Where to Buy"
- **Style**: Primary button (filled, brand color)
- **Link**: [/where-to-buy](/where-to-buy)
- **Icon**: Map pin (optional)
- **Tracking**: `header_cta_click`

---

## Scroll Behavior

### Default State (Top of Page)
- Header has no shadow
- Background is solid white
- All elements at full opacity

### Scrolled State (After 100px scroll)
- Header gains subtle bottom shadow: `0 2px 8px rgba(0,0,0,0.08)`
- Background remains white
- Optional: Slight height reduction (72px → 64px)
- Transition: 200ms ease

---

## Mobile Navigation

### Hamburger Menu
- **Icon**: Three horizontal lines (☰)
- **Position**: Right side, replaces utility nav
- **Action**: Opens full-screen navigation overlay
- **Animation**: Slide in from right, 300ms

### Mobile Menu Structure
```
[Close X]                    [Logo]

Products ▼
  DRAM Memory ▶
    VOLTX DDR5
    TornadoX7 Pro
    ...
  SSD & NVMe ▶
    CoreX Pro Gen5
    Xtreme Gen4
    ...
  Portable Storage ▶
  USB Solutions ▶

Solutions ▼
  Gaming & eSports
  Enterprise
  ...

Where to Buy ▼
  Find a Distributor
  Online Stores
  Regional Offices

Support ▼
  ...

About ▼
  ...

News ▼
  ...

[Contact]

---
[Search] [Language: EN ▼]

[Where to Buy] — Full-width primary button

[Phone: +971-4-2996421] — Tap to call
```

### Mobile Accordion Behavior
- Parent items expand/collapse on tap
- Chevron rotates 180° when expanded
- Only one section expanded at a time (optional)
- Sub-menus slide in from right (nested navigation)

### Mobile Menu Footer
- **Phone**: [+971-4-2996421](tel:+97142996421) (tap-to-call)
- **Email**: [info@twinmos.com](mailto:info@twinmos.com)
- **Social Icons**: LinkedIn, Facebook, X, YouTube

---

## Tablet Navigation (768–1023px)
- Primary nav items may collapse to hamburger at ~900px depending on content
- Utility nav compresses to icons only (no labels)
- Mega-menu becomes full-width dropdown

---

## Accessibility

### Keyboard Navigation
- `Tab`: Navigate through all header elements
- `Enter` / `Space`: Activate links and dropdowns
- `Escape`: Close open dropdowns or mobile menu
- `↑` / `↓`: Navigate dropdown items
- `→` / `←`: Navigate between top-level items

### ARIA Attributes
- **Nav Container**: `<nav aria-label="Main navigation">`
- **Dropdown Trigger**: `aria-expanded="true/false"`, `aria-haspopup="true"`
- **Dropdown Menu**: `role="menu"`
- **Menu Items**: `role="menuitem"`
- **Current Page**: `aria-current="page"` on active nav item

### Focus Management
- Focus trap within mobile menu when open
- Focus returns to trigger when menu closes
- Visible focus indicators on all interactive elements

### Screen Reader
- Announces "Main navigation, navigation landmark"
- Dropdowns announced as "{Item} menu, collapsed/expanded"
- Current page announced as "{Page}, current page"

---

## Performance

### Lazy Loading
- Mega-menu content loaded on hover (not on page load)
- Product images in mega-menu lazy-loaded
- Mobile menu content rendered only when opened

### Caching
- Header markup cached at CDN edge
- Navigation structure cached for 1 hour
- Product data in mega-menu cached for 15 minutes

---

## Analytics

### Track Events
| Event | Trigger | Parameters |
|-------|---------|------------|
| `nav_click` | Any nav item clicked | `item`, `level`, `destination` |
| `mega_menu_open` | Mega-menu expanded | `category` |
| `search_open` | Search icon clicked | `source: header` |
| `lang_selector_open` | Language icon clicked | `current_lang` |
| `mobile_menu_open` | Hamburger clicked | — |
| `cta_click` | Where to Buy clicked | `location: header` |

---

## Edge Cases

### Long Dropdowns
If dropdown content exceeds viewport height:
- Enable internal scrolling
- Show scroll indicator
- Keep header fixed while dropdown scrolls

### No-JavaScript Fallback
- Dropdowns work as hover-only (CSS `:hover`)
- Mobile menu displays as static list
- Search links to dedicated search page

### Right-to-Left (RTL) — Phase 2
- Logo right-aligned
- Navigation items right-to-left
- Dropdowns align to right edge of trigger
- Utility nav on left side
