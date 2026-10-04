---
title: "Cookie Consent Banner & Preference Center"
slug: "cookie-banner"
url: "/components/cookie-banner"
template: "component"
description: "GDPR, CCPA, and UAE data law-compliant cookie consent banner with granular preference center, categorized cookie declarations, and persistent settings management."
keywords: ["cookie", "GDPR", "CCPA", "privacy", "consent", "banner", "preference center", "tracking", "compliance"]
persona: ["visitor"]
phase: P1
priority: P0
owner: "web-team"
status: draft
last_reviewed: "2026-04-29"
locale: en
hreflang: []
schema: ""
ctas: ["privacy-policy", "cookie-policy"]
cross_links: ["/privacy-policy", "/cookie-policy", "/terms-of-use"]
sources: ["BRD", "RFP"]
---

# Cookie Consent Banner & Preference Center

## Overview
The cookie consent system ensures compliance with GDPR (EU/UK), CCPA (California), UAE Personal Data Protection Law, and other global privacy regulations. It provides transparent disclosure of all tracking technologies, granular user control, and persistent preference storage.

**Legal Basis**: Consent (GDPR Article 6(1)(a)), Legitimate Interest (essential functions only)

---

## Banner Design

### Position
- **Desktop**: Bottom of viewport, full-width bar
- **Mobile**: Bottom of viewport, stacked layout
- **Z-Index**: 9999 (above all other content)
- **Backdrop**: None (content remains fully visible)

### Visual Style
- **Background**: White (#FFFFFF) with subtle top shadow
- **Border**: 1px solid #E0E0E0 on top edge
- **Padding**: 24px horizontal, 20px vertical
- **Max Width**: Content constrained to site max-width (1280px)
- **Animation**: Slide up from bottom, 300ms ease-out

---

## Main Banner Content

### Headline (Optional, mobile only)
"Your Privacy Matters"

### Body Text
"We use cookies and similar technologies to enhance your browsing experience, analyze site traffic, and personalize content. By clicking \"Accept All,\" you consent to our use of cookies. You can manage your preferences or learn more in our [Cookie Policy](/cookie-policy)."

**Character Limit**: 280 characters (mobile-friendly)

### Legal Links (Inline)
- [Privacy Policy](/privacy-policy)
- [Cookie Policy](/cookie-policy)
- [Terms of Use](/terms-of-use)

---

## Banner Action Buttons

### Primary: Accept All
- **Label**: "Accept All"
- **Style**: Primary button (filled, brand color)
- **Action**: Accepts all cookie categories, closes banner, stores consent
- **Tracking**: Fire all enabled tags (GA4, Meta Pixel, etc.)

### Secondary: Reject Non-Essential
- **Label**: "Reject Non-Essential"
- **Style**: Secondary button (outlined)
- **Action**: Enables only Essential cookies, disables all others
- **Tracking**: Fire only essential/anonymous tags

### Tertiary: Manage Preferences
- **Label**: "Manage Preferences"
- **Style**: Text link (underlined)
- **Action**: Opens full Preference Center modal

---

## Preference Center (Modal)

### Modal Design
- **Width**: 600px desktop, 100% mobile (bottom sheet)
- **Height**: Auto, max 80vh
- **Scroll**: Internal scroll for long content
- **Close**: X button top-right, Escape key, click outside

### Modal Header
**Title**: "Manage Cookie Preferences"  
**Subtitle**: "You can customize which cookies we use. Essential cookies are always active."

### Cookie Categories

#### 1. Essential Cookies
- **Status**: Always On (locked toggle)
- **Icon**: Lock icon
- **Description**: "These cookies are necessary for the website to function and cannot be switched off. They enable core features like security, network management, and accessibility. You can set your browser to block these, but some parts of the site will not work."
- **Examples**:
  - Session management (PHPSESSID, session cookies)
  - CSRF protection tokens
  - Cookie consent state storage
  - Load balancing and CDN cookies
  - Accessibility preference storage
- **Duration**: Session to 1 year
- **Third Parties**: None (first-party only)

#### 2. Analytics Cookies
- **Status**: Off by default (user-toggleable)
- **Icon**: Chart icon
- **Description**: "These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. We use this data to improve site performance, content relevance, and user experience."
- **Examples**:
  - Google Analytics 4 (_ga, _gid, _gat)
  - Microsoft Clarity (session recordings)
  - Hotjar (heatmaps and feedback)
  - Internal analytics (page views, click tracking)
- **Duration**: 1 day to 2 years
- **Third Parties**: Google, Microsoft, Hotjar
- **Data Processing**: Aggregated and anonymized where possible

#### 3. Marketing Cookies
- **Status**: Off by default (user-toggleable)
- **Icon**: Target/bullseye icon
- **Description**: "These cookies are used to deliver relevant advertisements and track the effectiveness of our marketing campaigns. They may be set by us or our advertising partners to build a profile of your interests and show you relevant ads on other sites."
- **Examples**:
  - Meta/Facebook Pixel (_fbp)
  - Google Ads conversion tracking
  - LinkedIn Insight Tag
  - Twitter/X Pixel
  - Retargeting and remarketing cookies
- **Duration**: 1 day to 1 year
- **Third Parties**: Meta, Google, LinkedIn, Twitter/X
- **Data Processing**: Personal data may be shared with advertising platforms

#### 4. Functional Cookies
- **Status**: Off by default (user-toggleable)
- **Icon**: Gear/settings icon
- **Description**: "These cookies enable enhanced functionality and personalization, such as remembering your preferences, region selection, language choice, and recently viewed products. They may be set by us or third-party providers whose services we use."
- **Examples**:
  - Language preference (twinmos_locale)
  - Region/country selection
  - Recently viewed products
  - Wishlist/saved items (Phase 3)
  - Live chat state (Phase 2)
  - Video player preferences
- **Duration**: 1 month to 1 year
- **Third Parties**: Zendesk (live chat), Vimeo/YouTube (video)

#### 5. Social Media Cookies (Optional Category)
- **Status**: Off by default (user-toggleable)
- **Icon**: Share icon
- **Description**: "These cookies are set by social media services to enable you to share our content with your friends and networks. They can track your browser across other sites and build a profile of your interests."
- **Examples**:
  - Facebook Connect
  - Twitter/X widgets
  - LinkedIn share buttons
  - YouTube embeds
- **Duration**: Session to 2 years
- **Third Parties**: Meta, Twitter/X, LinkedIn, Google

---

## Preference Center Footer

### Save Button
- **Label**: "Save Preferences"
- **Style**: Primary button
- **Action**: Applies selected preferences, closes modal, updates consent state

### Cancel Button
- **Label**: "Cancel"
- **Style**: Text link
- **Action**: Closes modal without saving changes

### Additional Links
- "[Read our full Cookie Policy](/cookie-policy) for detailed information about each cookie we use."
- "[Contact our Data Protection Officer](/contact/dpo) with privacy-related questions."

---

## Dismissed / Minimized State

### Floating Cookie Settings Button
- **Position**: Bottom-left corner, fixed
- **Size**: 48px circular button
- **Icon**: Cookie or gear icon
- **Label**: "Cookie Settings" (aria-label)
- **Visibility**: Always visible after initial dismissal
- **Z-Index**: 9998
- **Action**: Reopens Preference Center modal

### Tooltip on Hover
"Manage your cookie preferences"

---

## Consent State Management

### Storage
- **Method**: First-party cookie + localStorage fallback
- **Cookie Name**: `twinmos_consent`
- **Duration**: 180 days (renewed on each visit)
- **Value Format**: JSON-encoded consent object

### Consent Object Structure
```json
{
  "version": "1.0",
  "timestamp": "2026-04-29T12:00:00Z",
  "essential": true,
  "analytics": false,
  "marketing": false,
  "functional": false,
  "social": false
}
```

### Behavior Rules
1. **First Visit**: Banner appears immediately on page load
2. **Accept All**: All categories enabled, banner hidden for 180 days
3. **Reject Non-Essential**: Only Essential enabled, banner hidden for 180 days
4. **Custom Preferences**: User-selected categories enabled, banner hidden for 180 days
5. **Return Visit**: If consent cookie exists and is valid, banner does not show
6. **Expired Consent**: Banner reappears when 180 days elapsed
7. **Policy Update**: If cookie policy version changes, banner reappears

---

## Tag Manager Integration

### Google Tag Manager (GTM) Triggers
- **Essential Only**: Fire on all pages (consent not required)
- **Analytics**: Fire only when `analytics = true`
- **Marketing**: Fire only when `marketing = true`
- **Functional**: Fire only when `functional = true`

### Consent Mode (Google)
```javascript
gtag('consent', 'default', {
  'ad_storage': 'denied',
  'analytics_storage': 'denied',
  'functionality_storage': 'denied',
  'personalization_storage': 'denied',
  'security_storage': 'granted'
});
```

---

## Regional Compliance

### GDPR (EU/UK)
- Explicit opt-in required for all non-essential cookies
- Granular consent per category
- Easy withdrawal mechanism (Preference Center always accessible)
- Prior consent before any tracking

### CCPA/CPRA (California)
- "Do Not Sell My Personal Information" link required
- Opt-out option for marketing cookies
- Clear disclosure of data selling/sharing

### UAE PDPL
- Consent required for processing personal data
- Transparent disclosure of processing purposes
- Right to withdraw consent

### LGPD (Brazil) — Phase 3
- Similar to GDPR requirements
- Clear purpose specification

### PIPEDA (Canada) — Phase 3
- Implied consent for essential functions
- Express consent for marketing/tracking

---

## Accessibility

- Banner is the first focusable element on first visit (after skip link)
- All toggles have visible focus indicators
- Toggle states announced via ARIA live regions
- Modal traps focus while open
- Escape key closes modal
- Color contrast meets WCAG 2.1 AA for all text
- Toggle switches have clear on/off visual states

---

## Analytics & Monitoring

Track the following events in analytics (respecting consent):
- Banner displayed
- "Accept All" clicked
- "Reject Non-Essential" clicked
- "Manage Preferences" clicked
- Preference Center: individual category toggled
- Preference Center: "Save Preferences" clicked
- Floating settings button clicked

---

## Translation Keys

| English | Arabic | Bengali | Hindi |
|---------|--------|---------|-------|
| Accept All | قبول الكل | সব গ্রহণ করুন | सभी स्वीकार करें |
| Reject Non-Essential | رفض غير الضروري | অপ্রয়োজনীয় প্রত্যাখ্যান করুন | गैर-आवश्यक अस्वीकार करें |
| Manage Preferences | إدارة التفضيلات | পছন্দগুলি পরিচালনা করুন | प्राथमिकताएं प्रबंधित करें |
| Essential | ضروري | অপরিহার্য | आवश्यक |
| Analytics | التحليلات | বিশ্লেষণ | विश्लेषण |
| Marketing | التسويق | বিপণন | विपणन |
| Functional | وظيفي | কার্যকরী | कार्यात्मक |
