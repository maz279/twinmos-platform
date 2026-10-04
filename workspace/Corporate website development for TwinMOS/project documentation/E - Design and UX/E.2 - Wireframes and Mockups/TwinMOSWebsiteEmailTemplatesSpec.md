# TwinMOS Website — Email Templates Design Specification

**Document ID:** E.2.6
**Version:** 1.0
**Status:** Final
**Date:** 2026-05-01

## 1. Purpose & Scope

This document defines visual design, layout structure, and content specifications for all transactional and marketing email templates used across the TwinMOS website ecosystem. All templates support 9 locales and RTL (Arabic) layouts.

**Cross-references:**
- URD Section 4.6 (Newsletter & Email Communications)
- Tech Stack: Strapi v5 Email Plugin, React Email / MJML

## 2. Email Template Inventory

| ID | Name | Type | Trigger |
|----|------|------|---------|
| EML-01 | Welcome Email | Transactional | Account registration |
| EML-02 | Order Confirmation | Transactional | E-commerce checkout |
| EML-03 | Shipping Notification | Transactional | Order dispatch |
| EML-04 | Password Reset | Transactional | User request |
| EML-05 | Newsletter Subscription | Transactional | Sign-up confirmation |
| EML-06 | Monthly Newsletter | Marketing | Scheduled campaign |
| EML-07 | Product Launch | Marketing | Product release |
| EML-08 | Promotional Campaign | Marketing | Seasonal sale |
| EML-09 | Abandoned Cart | Marketing | Cart timeout |
| EML-10 | Support Ticket Confirm | Transactional | Ticket creation |
| EML-11 | Distributor Inquiry | Transactional | Form submission |
| EML-12 | Event Invitation | Marketing | Webinar/trade show |

## 3. Design System for Email

### 3.1 Color Palette (Email-Safe)

| Token | Hex | Usage |
|-------|-----|-------|
| `--email-primary` | `#0A2540` | Header bg, primary text, buttons |
| `--email-accent` | `#00A3E0` | Links, CTA buttons, highlights |
| `--email-background` | `#F6F9FC` | Body background |
| `--email-surface` | `#FFFFFF` | Content cards |
| `--email-text` | `#1A1A2E` | Body text |
| `--email-muted` | `#6B7280` | Secondary text |
| `--email-border` | `#E5E7EB` | Dividers, borders |
| `--email-gaming` | `#00F0FF` | VOLTX campaign accent |

> All colors use web-safe hex. Avoid CSS variables in email HTML; use inline styles only.

### 3.2 Typography

| Element | Font | Size | Weight | Line Height | Color |
|---------|------|------|--------|-------------|-------|
| Headline | Inter, Arial | 28px | 700 | 1.2 | `#0A2540` |
| Subheadline | Inter, Arial | 22px | 600 | 1.3 | `#0A2540` |
| Body | Inter, Arial | 16px | 400 | 1.6 | `#1A1A2E` |
| Caption | Inter, Arial | 14px | 400 | 1.5 | `#6B7280` |
| Button | Inter, Arial | 16px | 600 | 1.0 | `#FFFFFF` |

> RTL: For Arabic emails, fallback to `Tahoma, Arial, sans-serif`.

### 3.3 Layout Grid

- **Max width:** 600px
- **Side padding:** 24px desktop, 16px mobile
- **Section spacing:** 32px
- **Card padding:** 24px internal

## 4. Master Template Structure

```
┌─────────────────────────────────────┐
│ [HEADER] Logo + Tagline             │
├─────────────────────────────────────┤
│ [HERO IMAGE] 600 x 300px            │
├─────────────────────────────────────┤
│ [HEADLINE] Inter 28px Bold          │
├─────────────────────────────────────┤
│ [BODY] Inter 16px Regular           │
├─────────────────────────────────────┤
│ [CTA BUTTON] #00A3E0 bg             │
├─────────────────────────────────────┤
│ [SECONDARY] Optional 2-col cards    │
├─────────────────────────────────────┤
│ [FOOTER] Social, unsubscribe, legal │
└─────────────────────────────────────┘
```

## 5. Component Specifications

### 5.1 Header

| Property | Value |
|----------|-------|
| Background | `#0A2540` |
| Height | 80px |
| Logo | 140 x 40px, white variant |
| Tagline | Optional: "Reliable Memory Solutions Since 1998" |

### 5.2 Hero Image

| Property | Value |
|----------|-------|
| Dimensions | 600 x 300px (2:1) |
| Format | JPEG, max 100KB |
| Alt text | Required, descriptive |
| Gaming variant | Dark bg with `#00F0FF` accent elements |

### 5.3 CTA Button

| Property | Value |
|----------|-------|
| Background | `#00A3E0` |
| Text | `#FFFFFF`, 16px SemiBold |
| Padding | 14px 32px |
| Border-radius | 6px |
| Hover (web) | `#0077A8` |
| Min touch | 44 x 44px |

### 5.4 Product Card (2-Column)

| Property | Value |
|----------|-------|
| Width | 268px each (2-col with 24px gap) |
| Image | 268 x 180px |
| Title | 16px SemiBold, `#0A2540` |
| Price | 18px Bold, `#00A3E0` |
| CTA | Text link, `#00A3E0` |

### 5.5 Footer

| Property | Value |
|----------|-------|
| Background | `#F6F9FC` |
| Padding | 32px 24px |
| Social icons | 24 x 24px, `#6B7280` |
| Legal text | 12px, `#6B7280` |
| Unsubscribe | Underlined link, `#00A3E0` |
| Address | TwinMOS Technologies, Dubai, UAE |

## 6. Template-Specific Designs

### 6.1 Welcome Email (EML-01)

```
Subject: Welcome to TwinMOS — Your Memory Solutions Partner

Sections:
1. Header (logo + tagline)
2. Hero: "Welcome to the TwinMOS Family"
3. Body: Thank you message + brand intro
4. CTA: "Explore Products" → /products
5. Features: 3-column icons (Quality, Support, Global)
6. Footer

Personalization tokens:
- {{firstName}}
- {{signupDate}}
- {{locale}}
```

### 6.2 Password Reset (EML-04)

```
Subject: Reset Your TwinMOS Account Password

Sections:
1. Header
2. Headline: "Password Reset Request"
3. Body: Security notice + instructions
4. CTA: "Reset Password" (primary, expires in 24h)
5. Fallback: Text link for copy-paste
6. Footer: "Did not request? Contact support"

Security requirements:
- Token expires in 24 hours
- Single-use token
- HTTPS only
- No password in email
```

### 6.3 Monthly Newsletter (EML-06)

```
Subject: TwinMOS Monthly — {{month}} {{year}}

Sections:
1. Header
2. Editor's Note / Featured Story
3. New Product Spotlight (1-2 items)
4. Tech Tip / How-To
5. Upcoming Events / Trade Shows
6. Social proof / Testimonial
7. CTA: "Visit Blog" → /learn
8. Footer

Content requirements:
- Max 5 sections
- 1 hero image max 150KB
- 2-3 product thumbnails max 80KB each
- All images with alt text
- Unsubscribe link mandatory
```

### 6.4 Support Ticket Confirmation (EML-10)

```
Subject: Support Ticket #{{ticketId}} Received

Sections:
1. Header
2. Headline: "We've Received Your Request"
3. Ticket summary card:
   - Ticket ID: #{{ticketId}}
   - Category: {{category}}
   - Priority: {{priority}}
   - Submitted: {{date}}
4. Expected response time
5. CTA: "View Ticket Status" → /support/tickets
6. Footer: Support contact info

Auto-response SLA:
- Acknowledgment: Immediate
- First response: 4 business hours
- Resolution target: Per priority level
```

## 7. RTL Email Specifications

| Element | LTR | RTL |
|---------|-----|-----|
| Text align | left | right |
| Logo position | left | right |
| Button align | left | center |
| Social icons | left-to-right | right-to-left |
| Number format | 1,234.56 | 1.234,56 (Arabic) |
| Date format | MM/DD/YYYY | DD/MM/YYYY |

## 8. Responsive Behavior

| Breakpoint | Width | Padding | Font Scaling |
|------------|-------|---------|--------------|
| Desktop | > 600px | 24px | 100% |
| Mobile | < 600px | 16px | 95% |

Mobile adaptations:
- 2-column grids stack to 1 column
- Hero image scales to 100% width
- CTA button becomes full-width
- Social icons center-aligned

## 9. Accessibility Requirements

- All images require descriptive alt text
- Color contrast minimum 4.5:1 for body text
- Link text must be descriptive (no "click here")
- Semantic HTML structure (headings hierarchy)
- Plain text alternative for all templates
- `prefers-reduced-motion` respected for animations

## 10. Technical Implementation

### 10.1 MJML Structure (Recommended)

```xml
<mjml>
  <mj-head>
    <mj-attributes>
      <mj-text font-family="Inter, Arial, sans-serif" color="#1A1A2E" />
      <mj-button background-color="#00A3E0" color="#FFFFFF" />
    </mj-attributes>
  </mj-head>
  <mj-body background-color="#F6F9FC">
    <mj-section background-color="#0A2540" padding="20px">
      <mj-column>
        <mj-image src="logo-white.png" width="140px" alt="TwinMOS" />
      </mj-column>
    </mj-section>
    <mj-section padding="32px 24px">
      <mj-column>
        <mj-text font-size="28px" font-weight="700" color="#0A2540">
          Welcome to TwinMOS
        </mj-text>
        <mj-text font-size="16px" line-height="1.6">
          {{bodyContent}}
        </mj-text>
        <mj-button href="{{ctaUrl}}" padding="24px 0">
          {{ctaText}}
        </mj-button>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
```

### 10.2 Strapi Email Plugin Configuration

```javascript
// config/plugins.js
module.exports = {
  email: {
    config: {
      provider: "sendgrid",
      providerOptions: {
        apiKey: env("SENDGRID_API_KEY"),
      },
      settings: {
        defaultFrom: "noreply@twinmos.com",
        defaultReplyTo: "support@twinmos.com",
      },
    },
  },
};
```

### 10.3 Localization Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `{{locale}}` | Language code | en, ar, bn, zh-CN |
| `{{direction}}` | Text direction | ltr, rtl |
| `{{dateFormat}}` | Regional date format | MM/DD/YYYY |
| `{{currency}}` | Currency symbol | USD, EUR |

## 11. Testing Requirements

| Test | Tool | Frequency |
|------|------|-----------|
| Render test | Litmus / Email on Acid | Per template |
| Spam score | Mail-Tester | Per campaign |
| Link validation | Broken link checker | Per send |
| Accessibility | WAVE (web version) | Per template |
| RTL validation | Manual + BrowserStack | Per locale |

## 12. Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-04-15 | Initial draft | Design Team |
| 0.5 | 2026-04-22 | Added gaming variants | Design Team |
| 1.0 | 2026-05-01 | Final specification | Design Team |
