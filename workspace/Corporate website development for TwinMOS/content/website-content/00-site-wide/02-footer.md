---
title: "Footer"
slug: "footer"
url: "/components/footer"
template: "component"
description: "Comprehensive four-column footer with product navigation, company links, support resources, contact details, social media, newsletter signup, and legal compliance for TwinMOS corporate website."
keywords: ["footer", "links", "contact", "TwinMOS", "sitemap", "newsletter", "social media"]
persona: ["visitor", "buyer", "distributor", "press"]
phase: P1
priority: P0
owner: "web-team"
status: draft
last_reviewed: "2026-04-29"
locale: en
hreflang: []
schema: ""
ctas: ["newsletter-signup", "contact", "find-distributor"]
cross_links: ["/products", "/about", "/support", "/contact", "/where-to-buy", "/careers"]
sources: ["CP", "BRD"]
---

# Footer Content

## Overview
The footer is the primary navigation anchor for users who have scrolled through a page. It provides structured access to all major sections of the TwinMOS website, reinforces brand credibility, and offers multiple conversion paths including newsletter signup, distributor inquiry, and direct contact.

## Design Specifications
- **Layout**: Four-column grid on desktop (25% each), two-column on tablet, single-column accordion on mobile
- **Background**: Deep charcoal (#1A1A2E) or brand dark blue
- **Text Color**: Light gray (#E0E0E0) for body, white (#FFFFFF) for headings
- **Link Hover**: Brand accent color with underline animation
- **Top Border**: 4px solid brand primary color
- **Padding**: 64px vertical on desktop, 40px on mobile

---

## Column 1: Products
**Heading**: Our Products

Primary product category links with descriptive hover text:

- **[DRAM Memory Modules](/products/memory)** — DDR5, DDR4, DDR3 for desktop, laptop, and server
- **[SSD & NVMe Storage](/products/ssd)** — PCIe Gen5, Gen4, Gen3, and SATA III solid-state drives
- **[Portable Storage](/products/portable)** — ELITE Drive Pro and ProDrive Ultra external drives
- **[USB Solutions](/products/usb-flash)** — Mobile Disk X3 flash drives and USB hubs
- **[Gaming & eSports](/gaming)** — VOLTX RGB DDR5 and Xtreme NVMe for gamers
- **[View All Products](/products)** — Complete product catalog with comparison tool
- **[Product Comparison Tool](/products/compare)** — Side-by-side spec comparison

**Column Footer**: [Download Product Catalog](/downloads/catalog) (PDF, 4.2MB)

---

## Column 2: Company
**Heading**: About TwinMOS

Corporate and brand information links:

- **[About TwinMOS](/about)** — Company overview, heritage, and mission
- **[Our History](/about/history)** — 27+ years of innovation since 1998
- **[Leadership Team](/about/leadership)** — Executive profiles and governance
- **[Manufacturing](/about/manufacturing)** — Taiwan-based production with rigorous testing
- **[Quality Assurance](/about/quality-assurance)** — ISO 9001 and multi-certification standards
- **[Certifications](/about/certifications)** — CE, FCC, UKCA, RoHS, REACH, EAC, JEDEC
- **[Sustainability & ESG](/about/sustainability)** — Environmental and social responsibility
- **[Careers](/careers)** — Join our team across 93+ countries
- **[Press Room](/about/press-room)** — News, media kit, and press contacts

---

## Column 3: Support
**Heading**: Support Center

Customer and partner support resources:

- **[Warranty Information](/support/warranty)** — Lifetime on memory modules, 5-year on NVMe SSDs/flash/USB, 3-year on SATA SSDn standard SSDs
- **[Warranty Registration](/support/warranty-registration)** — Register your product online
- **[RMA Process](/support/rma)** — Return merchandise authorization guide
- **[Technical Support](/support)** — KB articles, installation guides, and troubleshooting
- **[Downloads](/support/downloads)** — Drivers, firmware, datasheets, and manuals
- **[Compatibility Finder](/products/finder)** — Find compatible memory and SSD for your system
- **[FAQ](/support/faq)** — Frequently asked questions
- **[Contact Us](/contact)** — General inquiries and support tickets
- **[Find a Distributor](/where-to-buy)** — Authorized distributors in 93+ countries

---

## Column 4: Contact & Newsletter
**Heading**: Get in Touch

### Company Address
**TwinMOS Technologies Middle East FZE**  
Dubai Airport Free Zone (DAFZA)  
C-9, P.O. Box 54278  
Dubai, United Arab Emirates

**Phone**: [+971-4-2996421](tel:+97142996421) / [+971-4-2996422](tel:+97142996422)  
**Email**: [info@twinmos.com](mailto:info@twinmos.com)  
**Hours**: Sunday – Thursday, 9:00 AM – 6:00 PM GST

### Regional Offices
- **[Taipei](/contact/taipei)** — R&D and manufacturing headquarters

### Newsletter Signup
**Headline**: Stay Ahead with TwinMOS  
**Subheadline**: Get product launches, tech insights, and exclusive distributor updates.

- Email input field with placeholder: "Enter your email address"
- **Subscribe** button (primary CTA)
- Privacy note: "We respect your inbox. No spam, ever."
- Link to [Privacy Policy](/privacy-policy)

---

## Social Media Links
**Heading**: Follow TwinMOS

- **[LinkedIn](https://www.linkedin.com/company/twinmos-technologies/)** — Corporate updates and industry insights
- **[Facebook](https://www.facebook.com/twinmos.tech.tech)** — Product showcases and community engagement
- **[X (Twitter)](https://twitter.com/twinmos)** — Real-time news and tech discussions
- **[YouTube](https://www.youtube.com/@twinmos)** — Product demos, unboxings, and tutorials
- **[Instagram](https://instagram.com/twinmos.tech)** — Visual storytelling and behind-the-scenes content

**Social Icon Style**: Circular buttons, 40px, monochrome on dark background, brand color on hover

---

## Bottom Bar (Legal Strip)
**Background**: Slightly darker shade than main footer (#12122A)
**Height**: 48px desktop, auto on mobile
**Font Size**: 12px

### Left Side
- **© 2026 TwinMOS Technologies Middle East FZE. All rights reserved.**
- TwinMOS, VOLTX, CoreX, TornadoX7, Thunder GX, and ELITE Drive are trademarks of TwinMOS Technologies.

### Center (Optional on wider screens)
- [Privacy Policy](/privacy-policy)
- [Terms of Use](/terms-of-use)
- [Cookie Policy](/cookie-policy)
- [Cookie Settings](#cookie-settings) — Opens preference center
- [Accessibility Statement](/accessibility)
- [Sitemap](/sitemap)

### Right Side
- **USB-IF Vendor ID**: 4719
- **IEEE OUI**: 000B9D

---

## Mobile Footer Behavior
- Columns collapse to accordion panels (expandable/collapsible)
- Newsletter signup remains fully visible (non-collapsed)
- Social icons center-align in a single row
- Bottom bar stacks vertically: copyright → legal links → identifiers
- Phone number becomes tap-to-call link

---

## SEO & Accessibility
- Footer links use descriptive anchor text (not "click here")
- All links have visible focus indicators
- Social links include `aria-label` with platform name
- Newsletter form has proper label associations
- No broken or placeholder links
- Schema.org Organization markup embedded in footer contact section
