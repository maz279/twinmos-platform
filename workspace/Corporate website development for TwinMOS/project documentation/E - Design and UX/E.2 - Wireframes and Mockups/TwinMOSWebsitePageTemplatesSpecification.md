# TwinMOS Website - Page Templates Specification

Document ID: E.2.4 | Version: 1.0 | Date: 30 April 2026 | Status: FINAL

## 1. Overview

This document specifies all page templates for the TwinMOS website. Templates define the structural layout, required components, and content areas for each page type.

## 2. Template Inventory

| Template ID | Template Name | Pages Using | Priority |
|-------------|---------------|-------------|----------|
| TPL-01 | Homepage | / | P0 |
| TPL-02 | Product Category | /products/[category]/ | P0 |
| TPL-03 | Product Detail | /products/[category]/[slug]/ | P0 |
| TPL-04 | Product Comparison | /compare/ | P1 |
| TPL-05 | Compatibility Finder | /compatibility-finder/ | P0 |
| TPL-06 | Where to Buy | /where-to-buy/ | P0 |
| TPL-07 | Support Center | /support/ | P1 |
| TPL-08 | Support Article | /support/[article]/ | P1 |
| TPL-09 | Contact | /contact/ | P0 |
| TPL-10 | About Us | /about/ | P1 |
| TPL-11 | News Listing | /news/ | P1 |
| TPL-12 | News Article | /news/[slug]/ | P1 |
| TPL-13 | Gaming Hub | /gaming/ | P1 |
| TPL-14 | Regional Landing | /[country]/ | P1 |
| TPL-15 | Legal Page | /legal/[page]/ | P0 |
| TPL-16 | 404 Error | /404 | P0 |
| TPL-17 | 500 Error | /500 | P0 |
| TPL-18 | Maintenance | /maintenance | P0 |
| TPL-19 | CMS Page Builder | /[custom]/ | P0 |
| TPL-20 | Partner Portal | /partners/ | P2 |

## 3. Template Structure Definitions

### TPL-01: Homepage

```
Header
---
Hero Carousel (max 3 slides)
---
Trust Bar
---
Product Categories (5 cards)
---
Featured Products (4 cards)
---
Brand Trust (stats + badges)
---
News Teaser (3 cards)
---
Gaming Hub CTA (dark)
---
Footer
```

### TPL-02: Product Category

```
Header
---
Breadcrumb
---
Page Title + Product Count + Sort
---
Filter Sidebar | Product Grid (3-col)
---
Pagination / Load More
---
Footer
```

### TPL-03: Product Detail

```
Header
---
Breadcrumb
---
Image Gallery (50%) | Product Info (50%)
---
Tab Navigation (Specs/Features/Compatible/Downloads)
---
Tab Content
---
Related Products (horizontal)
---
Footer
```

### TPL-05: Compatibility Finder

```
Header
---
Breadcrumb
---
Search Interface (brand + model)
---
Tab Switcher (Laptop/Desktop vs Motherboard)
---
Device Info Card (if found)
---
Compatible Products by Category
---
Footer
```

### TPL-06: Where to Buy

```
Header
---
Country Selector + Detect Location
---
View Toggle (Map vs List) + Filter
---
Map (60%) | Retailer List (40%)
---
Footer
```

### TPL-09: Contact

```
Header
---
Page Title
---
Contact Form (50%) | Contact Info (50%)
---
Footer
```

### TPL-13: Gaming Hub

```
Header (dark)
---
Hero (dark + RGB)
---
Product Showcase (dark cards)
---
RGB Showcase (interactive)
---
Build Gallery
---
Footer (dark)
```

### TPL-16: 404 Error

```
Header
---
Illustration (404-disconnected)
---
Friendly Message
---
Search Bar
---
Quick Links (Products, Support, Contact, Home)
---
Footer
```

## 4. CMS Page Builder Templates

Tech Stack section 4.4 lists 5 page-builder blocks:

| Block | Description | Use Case |
|-------|-------------|----------|
| Hero | Full-width image/video + text overlay | Landing pages |
| Text+Image | Two-column content section | About, solutions |
| Feature Grid | Icon cards in grid layout | Product features |
| Testimonials | Quote cards with avatars | Social proof |
| CTA | Banner with text + button | Conversion points |
| FAQ | Accordion Q&A list | Support content |

## 5. Template Metadata

Each template requires:
- Meta title (SEO)
- Meta description (SEO)
- Open Graph image
- Canonical URL
- Hreflang tags (for localized versions)
- Structured data (JSON-LD where applicable)

## 6. Template Responsiveness

All templates must adapt across 4 breakpoints:
- Mobile: 320-767px
- Tablet: 768-1023px
- Desktop: 1024-1439px
- Wide: 1440px+

## 7. Template Performance Budget

| Metric | Target |
|--------|--------|
| LCP | < 1.8s |
| FCP | < 1.0s |
| CLS | < 0.05 |
| TBT | < 150ms |

---

Document Owner: UX Lead | Review: Per sprint
