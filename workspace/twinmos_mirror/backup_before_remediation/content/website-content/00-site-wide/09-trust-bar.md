---
title: "Trust Bar"
slug: "trust-bar"
url: "/components/trust-bar"
template: "component"
description: "Credibility-building trust strip featuring certifications, compliance badges, company statistics, and quality assurance markers displayed strategically across the TwinMOS website."
keywords: ["trust", "certification", "ISO 9001", "compliance", "quality assurance", "JEDEC", "CE", "FCC", "RoHS"]
persona: ["visitor", "buyer", "distributor", "press"]
phase: P1
priority: P0
owner: "web-team"
status: draft
last_reviewed: "2026-04-29"
locale: en
hreflang: []
schema: ""
ctas: ["certifications", "about"]
cross_links: ["/about/certifications", "/about/quality-assurance", "/about"]
sources: ["CP", "BRD"]
---

# Trust Bar

## Overview
The Trust Bar is a critical credibility component that addresses one of the key findings from the Forensic Audit: the current website displays no trust badges or certification logos, missing a key opportunity to build confidence with security-conscious buyers. This component visually reinforces TwinMOS's 27+ year heritage, global compliance, and technical credentials.

**Business Impact**: Per the Forensic Audit §7.4, missing trust signals create purchase hesitation. This component directly addresses that gap.

---

## Design Specifications

### Layout Variants

#### Variant A: Full Trust Bar (Homepage, Product Pages)
- **Structure**: Two rows — certification logos + statistics
- **Background**: Light gray (#F5F5F5) or subtle gradient
- **Padding**: 40px vertical
- **Border**: None or subtle top/bottom border (#E5E7EB)

#### Variant B: Compact Trust Bar (Interior Pages)
- **Structure**: Single row — statistics only
- **Background**: White
- **Padding**: 24px vertical
- **Border**: 1px solid #E5E7EB top and bottom

#### Variant C: Minimal Trust Bar (Checkout/Forms)
- **Structure**: 3 key stats only
- **Background**: Transparent
- **Padding**: 16px vertical

---

## Headline & Subheadline

### Default Headline
"Trusted Worldwide for 27+ Years"

### Alternative Headlines
- "Certified Quality, Global Standards"
- "Innovation You Can Trust"
- "27+ Years of Memory Excellence"

### Subheadline
"Certified quality. Global compliance. Uncompromising standards."

### Alternative Subheadlines
- "ISO 9001:2015 certified with full CE, FCC, RoHS, and JEDEC compliance"
- "Meeting the highest international standards for memory and storage"

---

## Certification Logos Section

### Display Rules
- Logos displayed in monochrome (grayscale) by default
- Color on hover (desktop only)
- Tooltip on hover showing full certification name
- All logos link to certification detail pages or external verification

### Certification List

#### ISO 9001:2015
- **Logo**: ISO 9001:2015 certification mark
- **Label**: "ISO 9001:2015"
- **Tooltip**: "International Quality Management System Certification"
- **Link**: [/about/certifications/iso-9001](/about/certifications/iso-9001)
- **Description**: "Our manufacturing partners maintain ISO 9001:2015 certification, ensuring consistent quality management across all production processes."

#### CE Marking
- **Logo**: CE symbol
- **Label**: "CE"
- **Tooltip**: "Conformité Européenne — European health, safety, and environmental protection"
- **Link**: [/about/certifications/ce](/about/certifications/ce)
- **Description**: "All TwinMOS products sold in the European Economic Area carry CE marking, confirming compliance with EU safety, health, and environmental requirements."

#### UKCA
- **Logo**: UKCA symbol
- **Label**: "UKCA"
- **Tooltip**: "UK Conformity Assessed — United Kingdom market compliance"
- **Link**: [/about/certifications/ukca](/about/certifications/ukca)
- **Description**: "Post-Brexit UK conformity marking for products placed on the Great Britain market."

#### FCC
- **Logo**: FCC ID symbol
- **Label**: "FCC"
- **Tooltip**: "Federal Communications Commission — United States regulatory compliance"
- **Link**: [/about/certifications/fcc](/about/certifications/fcc)
- **Description**: "Federal Communications Commission certification for electromagnetic interference compliance in the United States."

#### RoHS
- **Logo**: RoHS compliance mark
- **Label**: "RoHS"
- **Tooltip**: "Restriction of Hazardous Substances — environmentally safe manufacturing"
- **Link**: [/about/certifications/rohs](/about/certifications/rohs)
- **Description**: "Restriction of Hazardous Substances Directive compliance ensures our products are free from lead, mercury, cadmium, and other restricted materials."

#### REACH
- **Logo**: REACH symbol
- **Label**: "REACH"
- **Tooltip**: "Registration, Evaluation, Authorisation and Restriction of Chemicals — EU chemical safety"
- **Link**: [/about/certifications/reach](/about/certifications/reach)
- **Description**: "EU REACH regulation compliance for safe chemical use throughout the product lifecycle."

#### EAC
- **Logo**: EAC mark
- **Label**: "EAC"
- **Tooltip**: "Eurasian Conformity — Customs Union market access"
- **Link**: [/about/certifications/eac](/about/certifications/eac)
- **Description**: "Eurasian Conformity marking for access to Russia, Belarus, Kazakhstan, Armenia, and Kyrgyzstan markets."

#### JEDEC
- **Logo**: JEDEC member logo
- **Label**: "JEDEC"
- **Tooltip**: "Solid State Technology Association standards for DRAM and flash memory"
- **Link**: [/about/certifications/jedec](/about/certifications/jedec)
- **Description**: "JEDEC compliance ensures our DRAM modules meet industry-standard specifications for compatibility, reliability, and performance."

### Phase 2 Additions
- **BIS (India)**: Bureau of Indian Standards certification for India market
- **WEEE**: Waste Electrical and Electronic Equipment directive compliance

---

## Statistics Row

### Layout
Horizontal row of 5 statistics, evenly spaced. On mobile, wraps to 2 rows (3 + 2).

### Statistics

#### Stat 1: Heritage
- **Number**: "27+"
- **Label**: "Years of Excellence"
- **Icon**: Calendar/heritage icon
- **Tooltip**: "Founded in 1998 in Taipei, Taiwan"

#### Stat 2: Global Reach
- **Number**: "93+"
- **Label**: "Countries Served"
- **Icon**: Globe icon
- **Tooltip**: "Across 5 continents: Middle East, Africa, Asia, Europe, Americas"

#### Stat 3: Team Size
- **Number**: "301–500"
- **Label**: "Dedicated Employees"
- **Icon**: People/team icon
- **Tooltip**: "Global team across headquarters, regional offices, and partner networks"

#### Stat 4: USB-IF Vendor ID
- **Number**: "4719"
- **Label**: "USB-IF Vendor ID"
- **Icon**: USB icon
- **Tooltip**: "Registered USB Implementers Forum Vendor ID for TwinMOS Technologies ME FZE"
- **Link**: [Verify at USB.org](https://www.usb.org/vendor-id-search) (external)

#### Stat 5: IEEE OUI
- **Number**: "000B9D"
- **Label**: "IEEE OUI"
- **Icon**: Chip/network icon
- **Tooltip**: "Institute of Electrical and Electronics Engineers Organizationally Unique Identifier for TwinMOS Technologies Inc."
- **Link**: [Verify at IEEE](https://regauth.standards.ieee.org/standards-ra-web/pub/view.html#registries) (external)

### Number Animation (Optional)
- Numbers count up from 0 when component scrolls into view
- Duration: 1.5 seconds
- Easing: ease-out
- Respect `prefers-reduced-motion`

---

## Placement Rules

### Homepage
- **Position**: Below hero carousel, above featured products
- **Variant**: Full Trust Bar (logos + stats)
- **Background**: #F5F5F5

### Product Category Pages
- **Position**: Below category description, above product grid
- **Variant**: Compact (stats only)
- **Background**: White

### Product Detail Pages
- **Position**: Above footer, below product specifications
- **Variant**: Full Trust Bar
- **Background**: #F5F5F5

### About Pages
- **Position**: Below page header
- **Variant**: Full Trust Bar with headline
- **Background**: White

### Support Pages
- **Position**: Not displayed (clutter reduction)

### Checkout/Forms (Phase 3)
- **Position**: Above submit button
- **Variant**: Minimal (3 stats)
- **Purpose**: Reassurance at conversion point

---

## Visual Treatment

### Logo Display
- **Size**: 60px height, auto width
- **Spacing**: 32px between logos
- **Color**: Grayscale by default
- **Hover**: Full color + scale(1.05)
- **Alignment**: Center-aligned row

### Statistics Display
- **Number Font**: Bold, 36px, brand primary color
- **Label Font**: Regular, 14px, gray (#6B7280)
- **Dividers**: Thin vertical line (1px #E5E7EB) between stats
- **Mobile**: No dividers, 2-row grid

### Responsive Behavior
- **Desktop (≥1024px)**: Full horizontal layout
- **Tablet (768–1023px)**: Logos wrap to 2 rows, stats in single row
- **Mobile (<768px)**: Logos in scrollable horizontal strip, stats in 2x3 grid

---

## Interactive Elements

### Logo Hover States
- **Tooltip**: Full certification name appears above logo
- **Cursor**: Pointer
- **Link**: Navigates to certification detail page
- **External Links**: Open in new tab with external link indicator

### Stat Hover States
- **Tooltip**: Additional context about the statistic
- **Cursor**: Help (question mark)

---

## Accessibility

- All logos have descriptive `alt` text
- Tooltips are keyboard-accessible
- Color contrast meets WCAG AA for all text
- Statistics are readable at 200% zoom
- No information conveyed by color alone

---

## SEO Value

### Structured Data
Include Organization schema with sameAs links to certification bodies:
```json
{
  "@type": "Organization",
  "name": "TwinMOS Technologies",
  "hasCredential": [
    {
      "@type": "EducationalOccupationalCredential",
      "credentialCategory": "ISO 9001:2015",
      "recognizedBy": {
        "@type": "Organization",
        "name": "International Organization for Standardization"
      }
    }
  ]
}
```

### Link Strategy
- Internal links to certification pages improve site structure
- External links to verification databases build authority
- All external links use `rel="noopener noreferrer"`
