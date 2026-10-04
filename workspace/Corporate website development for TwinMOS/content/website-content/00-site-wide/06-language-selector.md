---
title: "Language Selector"
slug: "language-selector"
url: "/components/language-selector"
template: "component"
description: "Multi-language selector component supporting Phase 1 (English) through Phase 4 (9+ languages) with RTL support, regional variants, and accessibility compliance."
keywords: ["language", "locale", "selector", "translation", "multilingual", "RTL", "Arabic", "Hindi"]
persona: ["visitor", "buyer", "distributor"]
phase: P1
priority: P1
owner: "web-team"
status: draft
last_reviewed: "2026-04-29"
locale: en
hreflang: ["en", "ar", "bn", "hi", "ru", "zh", "fr", "es", "pt", "de"]
schema: ""
ctas: []
cross_links: []
sources: ["BRD", "URD", "RFP"]
---

# Language Selector

## Overview
The language selector enables users to switch between available language versions of the TwinMOS website. It supports both the current Phase 1 English deployment and future phased rollouts across 9+ languages, including right-to-left (RTL) scripts.

## Component Design
- **Trigger**: Globe icon + current language label (e.g., "EN") in the utility navigation bar
- **Dropdown**: Full-language-name list with status indicators
- **Mobile**: Bottom sheet or full-screen modal
- **Position**: Top-right of header, adjacent to search icon

---

## Current Language Display
**Desktop**: "English" (full name)  
**Mobile**: "EN" (two-letter code)  
**Icon**: Globe / Earth icon (Font Awesome or custom SVG)

---

## Dropdown Trigger Label
"Select Language" (aria-label for screen readers)

---

## Phase 1 Languages (Active — Month 1–5)

### English
- **Display Label**: English
- **Locale Code**: en
- **URL Prefix**: / (default, no prefix)
- **Status**: Active
- **Direction**: LTR
- **Coverage**: 100% of all pages
- **Source of Truth**: All content authored in English first

---

## Phase 2 Languages (Months 6–9)

### Arabic
- **Display Label**: العربية
- **Locale Code**: ar
- **URL Prefix**: /ar/
- **Status**: Planned — Phase 2
- **Direction**: RTL (right-to-left)
- **Coverage Target**: Homepage, product hubs, support FAQ, contact, Where to Buy
- **Regional Focus**: Middle East, North Africa (MENA)
- **Font Consideration**: Noto Sans Arabic or similar web-safe Arabic font
- **Layout Impact**: Full RTL mirroring of navigation, grids, and component layouts
- **Special Notes**: 
  - Numbers remain LTR within Arabic text
  - Product model names (VOLTX, CoreX) remain in Latin script
  - Contact phone numbers use Western Arabic numerals

### Hindi
- **Display Label**: हिन्दी
- **Locale Code**: hi
- **URL Prefix**: /hi/
- **Status**: Planned — Phase 2
- **Direction**: LTR
- **Regional Focus**: India
- **Font Consideration**: Noto Sans Devanagari

---

## Phase 3 Languages (Months 10–15)

### Russian
- **Display Label**: Русский
- **Locale Code**: ru
- **URL Prefix**: /ru/
- **Status**: Planned — Phase 3
- **Direction**: LTR
- **Regional Focus**: CIS countries (Russia, Kazakhstan, Belarus, etc.)

### Chinese (Simplified)
- **Display Label**: 简体中文
- **Locale Code**: zh
- **URL Prefix**: /zh/
- **Status**: Planned — Phase 3
- **Direction**: LTR
- **Regional Focus**: China, Southeast Asia Chinese-speaking markets
- **Special Notes**: Simplified Chinese characters (not Traditional)

### French
- **Display Label**: Français
- **Locale Code**: fr
- **URL Prefix**: /fr/
- **Status**: Planned — Phase 3
- **Direction**: LTR
- **Regional Focus**: North Africa (Algeria, Morocco, Tunisia), France, Canada

---

## Phase 4 Languages (Months 16+)

### Spanish
- **Display Label**: Español
- **Locale Code**: es
- **URL Prefix**: /es/
- **Status**: Planned — Phase 4
- **Direction**: LTR

### Portuguese
- **Display Label**: Português
- **Locale Code**: pt
- **URL Prefix**: /pt/
- **Status**: Planned — Phase 4
- **Direction**: LTR

### German
- **Display Label**: Deutsch
- **Locale Code**: de
- **URL Prefix**: /de/
- **Status**: Planned — Phase 4
- **Direction**: LTR

---

## Accessibility Labels
- **Trigger**: "Change language — currently English"
- **Dropdown Open**: "Language selection menu"
- **Option Selected**: "{Language} selected"
- **Option Disabled**: "{Language} — coming soon"
- **Close Dropdown**: "Close language menu"

## Keyboard Navigation
- `Tab`: Focus through language options
- `Enter` / `Space`: Select language
- `Escape`: Close dropdown without selection
- `Arrow Up` / `Arrow Down`: Navigate between options

---

## Incomplete Translation Notice
**Display Condition**: When user selects a language with <100% page coverage

> "Some content on this page is only available in English. We are continuously expanding our multilingual content. [Learn more about our localization roadmap](/about/localization)"

---

## Region-Specific Disclaimer
**Display Location**: Below language selector, on product and Where to Buy pages

> "Product availability, pricing, and warranty terms may vary by region. Selecting a language does not change your shipping region or local distributor. [Find your local distributor](/where-to-buy)"

---

## Technical Implementation Notes
- Hreflang tags: `<link rel="alternate" hreflang="{code}" href="{url}" />` for all language variants
- Canonical URL: Points to the user's currently selected language version
- Cookie Storage: `twinmos_locale={code}` — 1-year expiry
- URL Strategy: Subdirectory-based (`/ar/`, `/bn/`, `/hi/`) preferred over subdomain for SEO
- Fallback Chain: User selection → Browser `Accept-Language` header → English (default)
- RTL CSS: Use `dir="rtl"` on `<html>` element; CSS logical properties (`margin-inline-start`, etc.) recommended
