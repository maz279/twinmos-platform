# TwinMOS Website Iconography Specification

**Document Reference:** TWN-ICON-2026-001  
**Version:** 1.0  
**Status:** FINAL  
**Date:** 1 May 2026  
**Prepared by:** TwinMOS Digital Transformation Team  
**Owner:** UX Lead / Design Team  
**Classification:** CONFIDENTIAL — Internal Use Only  
**Synchronized With:** Design System §4.5, URD §20, Tech Stack §4.1

---

## 1. Purpose

This document defines the iconography system for the TwinMOS corporate website, including icon library selection, sizing, styling, usage patterns, and implementation guidelines.

---

## 2. Icon Library

### 2.1 Primary Icon Set: Lucide

| Property | Value |
|----------|-------|
| **Library** | Lucide Icons |
| **License** | ISC License (open source) |
| **Style** | Clean, minimal, consistent stroke weight |
| **Format** | SVG |
| **Total Icons** | 1000+ |
| **Website** | https://lucide.dev |

**Rationale:**
- Consistent design language across all icons
- Lightweight SVG format
- Active maintenance and growing library
- Excellent React/Vue/Angular integration
- No attribution required

### 2.2 Secondary Icon Sources

| Source | Usage | License |
|--------|-------|---------|
| Custom SVG | TwinMOS-specific icons (logo mark, product category icons) | Proprietary |
| Country Flags | Language selector, regional pages | MIT (flag-icon-css) |
| Payment Icons | Checkout (Phase 3) | Various |

---

## 3. Icon Sizes

### 3.1 Size Scale

| Token | Size | Usage |
|-------|------|-------|
| `--icon-xs` | 12px | Inline text icons, badge indicators |
| `--icon-sm` | 16px | Buttons (small), form inputs, inline |
| `--icon-md` | 20px | Buttons (medium), navigation items |
| `--icon-lg` | 24px | Buttons (large), cards, standalone |
| `--icon-xl` | 32px | Feature icons, category icons |
| `--icon-2xl` | 48px | Hero feature icons, large CTAs |
| `--icon-3xl` | 64px | Empty states, major illustrations |

### 3.2 Size by Context

| Context | Size | Example |
|---------|------|---------|
| Button with icon (small) | 16px | Filter button, close button |
| Button with icon (medium) | 20px | Primary CTA, form submit |
| Button with icon (large) | 24px | Hero CTA, major action |
| Navigation item | 20px | Menu items with icons |
| Form input icon | 20px | Search field, select dropdown |
| Card feature icon | 32px | Product feature cards |
| Category icon | 48px | Homepage category grid |
| Empty state icon | 64px | No results, error states |
| Social media icon | 24px | Footer social links |
| Toast notification | 20px | Success/error/warning toasts |

---

## 4. Icon Styling

### 4.1 Stroke Properties

| Size | Stroke Width | Stroke Linecap | Stroke Linejoin |
|------|-------------|----------------|-----------------|
| 12–16px | 1.5px | round | round |
| 20–24px | 2px | round | round |
| 32–48px | 2px | round | round |
| 64px+ | 2.5px | round | round |

### 4.2 Color Usage

| Context | Color | Example |
|---------|-------|---------|
| Default | Inherit from parent text color | Navigation, body text |
| Primary | `--color-primary` | Active navigation, emphasized |
| Accent | `--color-accent` | Interactive icons, links |
| Muted | `--color-text-muted` | Inactive, disabled |
| Success | `--color-success` | Success states, confirmations |
| Warning | `--color-warning` | Warning states, cautions |
| Error | `--color-error` | Error states, deletions |
| On primary bg | `#FFFFFF` | Icons on buttons, dark backgrounds |
| Gaming accent | `--color-gaming-accent` | Gaming hub icons |

### 4.3 Container Styling

| Container Type | Size | Background | Border Radius | Icon Size |
|---------------|------|-----------|---------------|-----------|
| Small circle | 32px | `--color-surface` | 50% | 16px |
| Medium circle | 40px | `--color-surface` | 50% | 20px |
| Large circle | 48px | `--color-surface` | 50% | 24px |
| Small square | 32px | `--color-surface` | 8px | 16px |
| Feature square | 56px | `--color-primary` | 12px | 24px |
| Gaming circle | 48px | `--color-gaming-surface` | 50% | 24px |

---

## 5. Icon Categories

### 5.1 Navigation Icons

| Icon | Lucide Name | Usage |
|------|-------------|-------|
| Menu | `Menu` | Mobile hamburger menu |
| Close | `X` | Close modal, dismiss banner |
| Chevron Down | `ChevronDown` | Dropdown indicator |
| Chevron Right | `ChevronRight` | Link arrow, breadcrumb |
| Chevron Left | `ChevronLeft` | Back navigation |
| Arrow Right | `ArrowRight` | CTA arrow, external link |
| Arrow Left | `ArrowLeft` | Back button |
| Arrow Up Right | `ArrowUpRight` | External link indicator |
| Search | `Search` | Search trigger |
| Home | `Home` | Breadcrumb home, dashboard |
| User | `User` | Account, profile |
| Log In | `LogIn` | Login action |
| Log Out | `LogOut` | Logout action |
| Globe | `Globe` | Language selector |
| Map Pin | `MapPin` | Location, where to buy |

### 5.2 Product Icons

| Icon | Lucide Name | Usage |
|------|-------------|-------|
| Memory Stick | `MemoryStick` | DRAM category |
| Hard Drive | `HardDrive` | SSD category |
| Usb | `Usb` | USB/Flash category |
| Smartphone | `Smartphone` | Mobile/portable category |
| Cpu | `Cpu` | Processor/compatibility |
| Zap | `Zap` | Speed/performance |
| Thermometer | `Thermometer` | Thermal management |
| Shield | `Shield` | Security, warranty |
| Award | `Award` | Certifications, awards |
| BarChart3 | `BarChart3` | Benchmarks, performance |
| Layers | `Layers` | 3D NAND, technology |
| Circuit Board | `CircuitBoard` | Motherboard compatibility |

### 5.3 Action Icons

| Icon | Lucide Name | Usage |
|------|-------------|-------|
| Download | `Download` | Download datasheet, firmware |
| Upload | `Upload` | File upload, build submission |
| Copy | `Copy` | Copy SKU, copy link |
| Share2 | `Share2` | Social sharing |
| Heart | `Heart` | Wishlist, favorite |
| Compare | `GitCompare` | Product comparison |
| Filter | `Filter` | Filter panel toggle |
| Sort Asc | `ArrowUpDown` | Sort dropdown |
| Grid | `LayoutGrid` | Grid view toggle |
| List | `List` | List view toggle |
| Eye | `Eye` | Quick view, preview |
| Eye Off | `EyeOff` | Hide password |
| Edit | `Pencil` | Edit action |
| Trash | `Trash2` | Delete action |
| Refresh | `RefreshCw` | Retry, refresh |
| Check | `Check` | Success, selected |
| Plus | `Plus` | Add, expand |
| Minus | `Minus` | Remove, collapse |

### 5.4 Communication Icons

| Icon | Lucide Name | Usage |
|------|-------------|-------|
| Mail | `Mail` | Email, newsletter |
| Phone | `Phone` | Phone number |
| Message Circle | `MessageCircle` | Chat, support |
| Help Circle | `HelpCircle` | Help, FAQ |
| Info | `Info` | Information tooltip |
| Alert Triangle | `AlertTriangle` | Warning |
| Alert Circle | `AlertCircle` | Error, alert |
| Check Circle | `CheckCircle` | Success confirmation |
| Bell | `Bell` | Notifications |
| Calendar | `Calendar` | Events, dates |
| Clock | `Clock` | Time, history |

### 5.5 Social Media Icons

| Platform | Icon Source | Usage |
|----------|-------------|-------|
| Facebook | Custom/Brand | Footer, sharing |
| Twitter/X | Custom/Brand | Footer, sharing |
| Instagram | Custom/Brand | Footer |
| LinkedIn | Custom/Brand | Footer, B2B |
| YouTube | Custom/Brand | Footer, video content |
| WhatsApp | Custom/Brand | Sharing (mobile) |
| Telegram | Custom/Brand | Sharing (select regions) |

### 5.6 Gaming Hub Icons

| Icon | Lucide Name | Usage |
|------|-------------|-------|
| Gamepad2 | `Gamepad2` | Gaming section |
| Sparkles | `Sparkles` | RGB effects |
| Palette | `Palette` | Color customization |
| Trophy | `Trophy` | Esports, achievements |
| Users | `Users` | Community, builds |
| Image | `Image` | Build gallery |
| Play | `Play` | Video content |
| Monitor | `Monitor` | Display, setup |
| Headphones | `Headphones` | Audio, gaming gear |
| Keyboard | `Keyboard` | Peripherals |
| Mouse | `Mouse` | Peripherals |

---

## 6. Custom Icons

### 6.1 TwinMOS-Specific Icons

| Icon | Description | Usage |
|------|-------------|-------|
| TwinMOS Logo Mark | Stylized "T" / memory motif | Favicon, compact logo |
| VOLTX Badge | VOLTX wordmark icon | Gaming product badges |
| DDR5 Badge | DDR5 generation indicator | Product specifications |
| PCIe Gen5 Badge | Gen 5 indicator | SSD specifications |
| RGB Badge | RGB lighting indicator | Gaming product badges |
| XMP Badge | Intel XMP certified | DRAM specifications |
| Warranty Shield | Shield with checkmark | Warranty indicators |

### 6.2 Product Category Icons

Custom icons for the homepage category grid:

| Category | Icon Style |
|----------|-----------|
| Desktop DRAM | Memory module with desktop silhouette |
| Gaming DRAM | Memory module with RGB glow effect |
| Notebook DRAM | SO-DIMM module |
| NVMe SSD | M.2 module with speed lines |
| SATA SSD | 2.5" drive form factor |
| Portable SSD | External drive with USB-C |
| Portable HDD | External drive with capacity indicator |
| USB Flash Drive | USB stick with connector |
| MicroSD Card | SD card with speed class |
| USB Hub | Hub with multiple ports |
| Power Supply | PSU with fan grille |

---

## 7. Icon Implementation

### 7.1 SVG Sprite System

Using `astro-icon` with Lucide icons:

```astro
---
import { Icon } from 'astro-icon/components';
---

<!-- Basic usage -->
<Icon name="lucide:search" class="w-6 h-6" />

<!-- With color -->
<Icon name="lucide:check-circle" class="w-6 h-6 text-success" />

<!-- In button -->
<button class="btn btn-primary">
  <Icon name="lucide:download" class="w-5 h-5 mr-2" />
  Download Datasheet
</button>
```

### 7.2 React Island Usage

```tsx
import { Search, ChevronDown, Download } from 'lucide-react';

// Basic icon
<Search size={20} strokeWidth={2} />

// With color
<CheckCircle size={24} className="text-success" />

// In button
<button className="btn btn-primary">
  <Download size={20} className="mr-2" />
  Download
</button>
```

### 7.3 Custom SVG Icon

```tsx
// Custom TwinMOS icon component
export const TwinMOSIcon = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Custom path data */}
  </svg>
);
```

---

## 8. Accessibility

### 8.1 Icon Accessibility Rules

| Rule | Implementation |
|------|---------------|
| Decorative icons | `aria-hidden="true"` |
| Interactive icons (no text) | `aria-label` describing action |
| Icon + text button | Icon decorative, text provides label |
| Standalone status icon | `aria-label` describing status |
| Icon links | Text label visible or `aria-label` |

### 8.2 Examples

```html
<!-- Decorative icon (with text label) -->
<button>
  <Icon name="lucide:download" aria-hidden="true" />
  Download
</button>

<!-- Icon-only button (needs aria-label) -->
<button aria-label="Close dialog">
  <Icon name="lucide:x" aria-hidden="true" />
</button>

<!-- Status icon -->
<span class="text-success" aria-label="In stock">
  <Icon name="lucide:check-circle" aria-hidden="true" />
</span>

<!-- Social link -->
<a href="..." aria-label="Follow TwinMOS on Facebook">
  <Icon name="facebook" aria-hidden="true" />
</a>
```

---

## 9. Animation

### 9.1 Icon Animations

| Animation | Trigger | Duration | Usage |
|-----------|---------|----------|-------|
| Spin | Loading state | 1s linear infinite | Loading spinner |
| Bounce | Hover | 200ms | Interactive emphasis |
| Pulse | Notification | 2s ease infinite | New notification |
| Shake | Error | 300ms | Form validation error |
| Scale | Hover | 150ms | Button icon hover |
| Rotate | State change | 200ms | Expand/collapse |

### 9.2 Animation CSS

```css
/* Spin animation */
@keyframes spin {
  to { transform: rotate(360deg); }
}
.icon-spin {
  animation: spin 1s linear infinite;
}

/* Bounce animation */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
.icon-bounce:hover {
  animation: bounce 200ms ease;
}
```

---

## 10. Version Control

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 1 May 2026 | Complete iconography specification |

---

*This iconography specification ensures consistent, accessible, and performant icon usage across all TwinMOS website pages and components.*
