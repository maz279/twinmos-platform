---
title: "Microcopy Glossary"
slug: "microcopy-glossary"
url: "/components/microcopy-glossary"
template: "component"
description: "Comprehensive reusable microcopy, button labels, link text, form validation messages, error states, and UI text standards for consistency across the TwinMOS corporate website."
keywords: ["microcopy", "labels", "buttons", "UI text", "glossary", "CTA", "error messages", "form validation"]
persona: ["visitor", "buyer", "distributor", "press"]
phase: P1
priority: P1
owner: "web-team"
status: draft
last_reviewed: "2026-04-29"
locale: en
hreflang: []
schema: ""
ctas: []
cross_links: []
sources: ["BRD", "URD"]
---

# Microcopy Glossary

## Purpose
This document serves as the single source of truth for all user-facing text strings across the TwinMOS website. Consistent microcopy reduces cognitive load, builds brand trust, and ensures a cohesive user experience across all touchpoints.

**Voice Guidelines**: Professional yet approachable. Technical when necessary but never jargon-heavy. Action-oriented. Confident without being arrogant.

---

## Primary Actions (CTAs)

| Label | Context | Usage Notes |
|-------|---------|-------------|
| **Buy Now** | Product pages, hero slides | Links to distributor locator or e-commerce (Phase 3) |
| **Find a Distributor** | Global CTA, product pages | Primary conversion path for B2B and B2C |
| **View Product** | Product cards, category listings | Navigational — leads to product detail page |
| **Compare** | Product listing pages | Opens side-by-side comparison modal |
| **Add to Compare** | Product cards | Adds item to comparison list (max 4 items) |
| **Remove from Compare** | Comparison list | Removes selected item |
| **Download Spec Sheet** | Product detail pages | PDF datasheet download — tracked event |
| **Download Datasheet** | Alternative label for above | Use consistently per product category |
| **Contact Sales** | B2B pages, enterprise section | Opens sales inquiry form |
| **Request a Quote** | Distributor/OEM pages | B2B pricing inquiry form |
| **Where to Buy** | Global persistent CTA | Sticky bar or floating pill on mobile |
| **Explore Products** | Homepage, category hubs | Discovery-oriented CTA |
| **Shop Now** | Gaming hub, promotional banners | Consumer-focused purchase intent |
| **Learn More** | Feature teasers, technology pages | Informational navigation |
| **Get Started** | Partner portal, distributor signup | Onboarding CTA |
| **Pre-Order** | New product launches | When product is announced but not yet available |
| **Notify Me** | Out-of-stock or upcoming products | Email alert signup for availability |

---

## Form Actions

| Label | Context | Usage Notes |
|-------|---------|-------------|
| **Submit** | Generic forms | Use only when no more specific label applies |
| **Send Message** | Contact form | Replaces generic "Submit" on contact pages |
| **Register Warranty** | Warranty registration | Primary action on warranty reg page |
| **Subscribe** | Newsletter signup | Newsletter and alert subscriptions |
| **Apply Now** | Jobs, distributor applications | Partner and career applications |
| **Sign In** | Partner portal, account login | Authentication |
| **Create Account** | Partner portal registration | New user registration |
| **Reset Password** | Password recovery | Account security flow |
| **Save Changes** | Profile/settings forms | CMS and user profile edits |
| **Cancel** | All forms | Secondary action — never primary styling |
| **Continue** | Multi-step forms | Wizard-style progression |
| **Back** | Multi-step forms | Return to previous step |
| **Upload** | File upload fields | Marketing asset uploads, RMA attachments |
| **Search** | Search forms | Site search and compatibility finder |
| **Filter** | Product listings | Apply selected filters |
| **Clear All** | Filter panels | Reset all active filters |

---

## Navigation & Wayfinding

| Label | Context | Usage Notes |
|-------|---------|-------------|
| **Read More** | Article teasers, blog cards | Expands or navigates to full article |
| **Learn More** | Feature highlights, technology | Educational content navigation |
| **View All** | Category sections | "View All Products", "View All News" |
| **See All {Category}** | Product category teasers | Contextual — e.g., "See All DDR5 Memory" |
| **Back to Top** | Long pages | Smooth scroll to page top |
| **Previous** / **Next** | Pagination, carousels | Standard pagination pattern |
| **Show More** | Expandable content | Loads additional items inline |
| **Show Less** | Collapsible content | Collapses expanded section |
| **Jump to Section** | Long-form content | Anchor link navigation |
| **Breadcrumb Home** | Breadcrumb trail | "Home" as first breadcrumb item |
| **Menu** | Mobile navigation | Hamburger menu label |
| **Close** | Modals, drawers, banners | Dismiss overlay |
| **Skip to Main Content** | Accessibility | First focusable element on every page |

---

## Product-Specific Actions

| Label | Context | Usage Notes |
|-------|---------|-------------|
| **Add to Cart** | E-commerce (Phase 3) | Shopping cart functionality |
| **Check Compatibility** | Product pages | Links to compatibility finder |
| **View Gallery** | Product detail pages | Opens image/lightbox gallery |
| **Watch Video** | Product pages with video | Opens video modal or player |
| **View 360°** | Product detail pages | 360-degree product view |
| **Share** | Product pages, articles | Social sharing dropdown |
| **Print** | Spec sheets, datasheets | Print-optimized page version |
| **Bookmark** | Saved items (Phase 3+) | User-saved products |

---

## Feedback, Status & Confirmation

| Label | Context | Usage Notes |
|-------|---------|-------------|
| **Loading…** | Async operations | Spinner + text for API calls |
| **Saving…** | Form auto-save | Indicates background save in progress |
| **Saved** | Confirmation | Brief toast notification |
| **Copied** | Clipboard operations | Confirmation after copy-to-clipboard |
| **Thank You** | Post-submission | Form submission success pages |
| **Success** | Toast notifications | Generic positive confirmation |
| **Required** | Form fields | Mandatory field indicator (red asterisk) |
| **Optional** | Form fields | Non-mandatory field label |
| **Recommended** | Form fields | Suggested but not required |
| **Verified** | Warranty, serial check | Positive validation status |
| **Invalid** | Form validation | Negative validation status |
| **In Progress** | RMA, orders | Status indicator for pending items |
| **Completed** | RMA, orders | Status indicator for finished items |

---

## Error Messages

### Generic Errors
- **"Something went wrong. Please try again."** — Catch-all server error
- **"We're experiencing technical difficulties. Please try again shortly."** — Service unavailable
- **"Your session has expired. Please sign in again."** — Authentication timeout
- **"You don't have permission to access this page."** — Authorization error

### Form Validation Errors
- **"This field is required."** — Empty mandatory field
- **"Please enter a valid email address."** — Invalid email format
- **"Password must be at least 8 characters with one uppercase letter and one number."** — Password policy
- **"Passwords do not match."** — Confirm password mismatch
- **"Please enter a valid phone number."** — Phone format validation
- **"Please select an option."** — Empty dropdown/radio
- **"File must be under 5MB."** — File size limit
- **"Only PDF, JPG, and PNG files are accepted."** — File type restriction
- **"This email is already registered."** — Duplicate email
- **"Serial number not found. Please check and try again."** — Warranty lookup failure
- **"You must agree to the terms before continuing."** — Unchecked required checkbox

### Search & Filter Errors
- **"No results found for '{query}'."** — Empty search results
- **"Try different keywords or browse our categories."** — Search suggestion
- **"Please enter a search term."** — Empty search submission

### Commerce Errors (Phase 3)
- **"This item is out of stock."** — Inventory unavailability
- **"Please select a capacity/speed option."** — Missing product variant
- **"Maximum quantity exceeded."** — Cart quantity limit

---

## Accessibility Labels (ARIA)

| Element | ARIA Label | Notes |
|---------|-----------|-------|
| Mobile menu button | "Open main navigation menu" | Hamburger icon |
| Mobile menu close | "Close navigation menu" | X icon inside drawer |
| Search trigger | "Open site search" | Magnifying glass icon |
| Search input | "Search products, support, and more" | Site search field |
| Search submit | "Submit search" | Search button |
| Language selector | "Change language — currently English" | Globe icon + label |
| External link | "Opens in a new tab" | Auto-appended to external links |
| PDF download | "Download PDF document" | File type indicator |
| Carousel previous | "Previous slide" | Hero carousel navigation |
| Carousel next | "Next slide" | Hero carousel navigation |
| Carousel indicators | "Go to slide {n}" | Dot/pagination indicators |
| Modal close | "Close dialog" | X button in modal header |
| Dropdown toggle | "Toggle {section} menu" | Expandable navigation items |
| Back to top | "Scroll back to top of page" | Floating scroll button |
| Cookie banner accept | "Accept all cookies" | Primary cookie action |
| Cookie banner reject | "Reject non-essential cookies" | Secondary cookie action |
| Cookie settings | "Manage cookie preferences" | Tertiary cookie action |
| Social share | "Share on {platform}" | Platform-specific sharing |
| Copy link | "Copy link to clipboard" | URL copy button |
| Print page | "Print this page" | Print trigger |
| Live chat | "Open live chat support" | Chat widget trigger |
| Notification dismiss | "Dismiss notification" | Toast close button |

---

## Distributor & B2B Microcopy

| Label | Context | Usage Notes |
|-------|---------|-------------|
| **Become a Distributor** | Partner program landing | Primary CTA for distributor recruitment |
| **Partner Portal Login** | Distributor access | Existing partner authentication |
| **Stock Check** | Partner portal | Real-time inventory lookup |
| **Request Marketing Assets** | Partner portal | Co-branded material downloads |
| **Submit MDF Claim** | Partner portal | Marketing development funds |
| **View Price List** | Authenticated partner | B2B pricing (login required) |
| **Place Order** | Partner portal | B2B order entry |
| **Track Shipment** | Partner portal | Logistics tracking |
| **Download Invoice** | Partner portal | Billing document access |
| **Account Manager** | Partner dashboard | Assigned rep contact info |

---

## Empty States

| Context | Headline | Body | CTA |
|---------|----------|------|-----|
| Empty cart | "Your cart is empty" | "Browse our products to find the perfect memory or storage upgrade." | "Explore Products" |
| No search results | "No results found" | "Try different keywords, check your spelling, or browse categories." | "Browse Products" |
| No compare items | "Nothing to compare" | "Add up to 4 products to compare specifications side by side." | "View Products" |
| No warranty records | "No products registered" | "Register your TwinMOS products to activate warranty coverage." | "Register Warranty" |
| No downloads | "No downloads available" | "Select a product category to find drivers, firmware, and manuals." | "Browse Products" |
| No orders (B2B) | "No orders yet" | "Your order history will appear here once you place your first order." | "Browse Catalog" |

---

## Loading States

| Context | Message | Duration Estimate |
|---------|---------|-------------------|
| Page load | "Loading TwinMOS…" | N/A |
| Search | "Searching…" | < 500ms |
| Filter apply | "Updating results…" | < 300ms |
| Form submit | "Submitting…" | < 2s |
| File upload | "Uploading {filename}…" | Varies |
| Compatibility check | "Checking compatibility…" | < 1s |
| Warranty lookup | "Verifying serial number…" | < 1s |
| Distributor search | "Finding distributors near you…" | < 1s |
| PDF generation | "Generating datasheet…" | < 3s |

---

## Tone & Voice Guidelines

### Do
- Use active voice: "We will process your request" not "Your request will be processed"
- Be specific: "Enter your email address" not "Enter required information"
- Be concise: Every word should earn its place
- Use sentence case for buttons and labels (except proper nouns)
- Lead with the benefit: "Get faster performance" not "Click here for faster performance"

### Don't
- Use all caps for emphasis (use bold or color instead)
- Use exclamation marks excessively (max one per page)
- Use jargon without explanation
- Blame the user: "Invalid input" → "Please enter a valid email address"
- Use "Click here" — use descriptive link text instead
- Use "Submit" when a more specific action label is available

---

## Localization Notes

When translating microcopy:
- **CTA buttons**: Keep concise — some languages expand 30-50% in length
- **Error messages**: Maintain helpful, non-blaming tone across cultures
- **Date formats**: Use locale-appropriate formats (DD/MM/YYYY vs MM/DD/YYYY)
- **Currency**: Display local currency with ISO code (e.g., "USD $49.99", "AED 183.00")
- **Phone numbers**: Include country code and use local formatting
- **Units**: Use metric globally; provide imperial conversions where relevant (US market)
