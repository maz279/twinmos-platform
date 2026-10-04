# Cookie Audit

| Document Attribute | Value |
|---|---|
| **Document ID** | TWN-COMP-2026-004 |
| **Version** | 1.0.0 |
| **Status** | Draft |
| **Author** | Unisoft Technologies Privacy Team |
| **Owner** | Data Protection Officer (DPO) |
| **Review Date** | 2026-08-01 |
| **Classification** | Internal Use |
| **Related Documents** | TWN-COMP-2026-001 (DPIA), TWN-COMP-2026-003 (Data Classification), TWN-SEC-2026-005 (CSP Spec), TWN-SEC-2026-006 (HTTP Headers) |
| **Compliance Mapping** | GDPR Art. 5(3), ePrivacy Directive 2002/58/EC, UAE PDPL Art. 4, India DPDP Act 2023 S.6, KSA PDPL Art. 4, PECR (UK), CCPA/CPRA (California) |

---

## 1. Executive Summary

This Cookie Audit documents all cookies, local storage items, session storage items, and similar tracking technologies used by the TwinMOS corporate website. The audit categorizes each technology by purpose, maps it to the consent framework, and ensures compliance with applicable privacy regulations.

**Audit Scope**: All first-party and third-party cookies, localStorage, sessionStorage, IndexedDB, and similar storage mechanisms deployed on twinmos.com and subdomains.

**Audit Date**: 2026-05-01
**Next Audit**: 2026-08-01 (or upon any cookie change)

---

## 2. Regulatory Context

### 2.1 Consent Requirements by Jurisdiction

| Jurisdiction | Requirement | Standard |
|---|---|---|
| **EU (GDPR + ePrivacy)** | Prior consent required for non-essential cookies | Opt-in, granular, withdrawable |
| **UK (PECR + UK GDPR)** | Prior consent required for non-essential cookies | Opt-in, granular, withdrawable |
| **UAE (PDPL)** | Consent required for processing; cookie-specific guidance pending | Opt-in recommended |
| **India (DPDP 2023)** | Consent required for processing personal data | Opt-in |
| **KSA (PDPL)** | Consent required for processing | Opt-in |
| **California (CCPA/CPRA)** | Opt-out for sale/sharing; opt-in for minors | Opt-out for analytics, opt-in for sale |
| **Singapore (PDPA)** | Consent required; deemed consent for necessary cookies | Opt-in for non-essential |

### 2.2 Cookie Categories

| Category | Definition | Consent Required | Legal Basis |
|---|---|---|---|
| **Strictly Necessary** | Essential for website operation; cannot be disabled | No | Legitimate interest / Contract |
| **Functional** | Enhance user experience; remember preferences | Yes | Consent |
| **Analytics** | Measure website usage and performance | Yes | Consent |
| **Marketing** | Track users across sites for advertising | Yes | Consent |
| **Social Media** | Enable social sharing and embedding | Yes | Consent |

---

## 3. Cookie Inventory

### 3.1 Strictly Necessary Cookies (No Consent Required)

| Cookie Name | Provider | Type | Duration | Purpose | Data Sent to Third Parties? |
|---|---|---|---|---|---|
| `__Host-session` | TwinMOS (First-party) | HTTPOnly, Secure, SameSite=Lax | Session | Maintain user session state | No |
| `__Host-csrf` | TwinMOS (First-party) | Secure, SameSite=Strict | Session | CSRF token validation | No |
| `__Host-consent` | TwinMOS (First-party) | Secure, SameSite=Strict | 13 months | Store consent preferences | No |
| `cf_clearance` | Cloudflare | HTTPOnly, Secure | 1 year | Cloudflare bot management clearance | Cloudflare only |
| `__cf_bm` | Cloudflare | HTTPOnly, Secure | 30 minutes | Cloudflare bot management | Cloudflare only |
| `__cfduid` (deprecated) | Cloudflare | HTTPOnly | Session | Legacy Cloudflare identifier | Cloudflare only |
| `turnstile_token` | Cloudflare | Secure, SameSite=Strict | 5 minutes | Turnstile CAPTCHA verification | Cloudflare only |
| `cart_session` (Phase 3) | TwinMOS (First-party) | HTTPOnly, Secure, SameSite=Lax | Session | E-commerce cart persistence | No |
| `checkout_state` (Phase 3) | TwinMOS (First-party) | HTTPOnly, Secure, SameSite=Strict | 1 hour | Multi-step checkout state | No |

### 3.2 Functional Cookies (Consent Required)

| Cookie Name | Provider | Type | Duration | Purpose | Data Sent to Third Parties? |
|---|---|---|---|---|---|
| `language` | TwinMOS (First-party) | Secure, SameSite=Lax | 1 year | Remember language preference | No |
| `region` | TwinMOS (First-party) | Secure, SameSite=Lax | 1 year | Remember regional preference | No |
| `theme` | TwinMOS (First-party) | Secure, SameSite=Lax | 1 year | Remember dark/light mode preference | No |
| `product_view_mode` | TwinMOS (First-party) | Secure, SameSite=Lax | Session | Grid/list view preference | No |
| `recently_viewed` | TwinMOS (First-party) | Secure, SameSite=Lax | 30 days | Recently viewed products | No |
| `saved_products` | TwinMOS (First-party) | Secure, SameSite=Lax | 90 days | Saved/wishlist products | No |

### 3.3 Analytics Cookies (Consent Required)

| Cookie/Technology Name | Provider | Type | Duration | Purpose | Data Sent to Third Parties? |
|---|---|---|---|---|---|
| `_plausible` | Plausible Analytics (Self-hosted) | First-party | Session | Anonymous page view tracking | No (self-hosted) |
| `plausible_user_id` | Plausible Analytics (Self-hosted) | First-party | 24 hours | Daily session identification | No (self-hosted) |
| `_ga` | Google Analytics 4 (Optional) | Third-party | 2 years | User identification for GA4 | Google |
| `_ga_*` | Google Analytics 4 (Optional) | Third-party | 2 years | Session identification for GA4 | Google |
| `_gid` | Google Analytics 4 (Optional) | Third-party | 24 hours | Daily user identification | Google |
| `_gat` | Google Analytics 4 (Optional) | Third-party | 1 minute | Rate limiting | Google |
| `AMP_TOKEN` | Google Analytics 4 (Optional) | Third-party | 1 year | AMP client ID service | Google |
| `cf_analytics` | Cloudflare Web Analytics | First-party | 7 days | Basic performance metrics | Cloudflare (anonymized) |

**Note**: Google Analytics 4 is **optional** and only loaded if user explicitly consents to Analytics cookies. Plausible Analytics (self-hosted, cookieless) is the primary analytics tool and operates without cookies.

### 3.4 Marketing Cookies (Consent Required)

| Cookie/Technology Name | Provider | Type | Duration | Purpose | Data Sent to Third Parties? |
|---|---|---|---|---|---|
| `_fbp` | Meta (Facebook) Pixel | Third-party | 3 months | Facebook advertising identification | Meta |
| `fr` | Meta (Facebook) | Third-party | 3 months | Facebook ad delivery | Meta |
| `_gcl_au` | Google Ads | Third-party | 3 months | Google Ads conversion tracking | Google |
| `IDE` | Google DoubleClick | Third-party | 1 year | Google ad personalization | Google |
| `NID` | Google | Third-party | 6 months | Google user preferences | Google |
| `test_cookie` | Google DoubleClick | Third-party | 15 minutes | Ad delivery testing | Google |
| `li_sugr` | LinkedIn | Third-party | 3 months | LinkedIn user identification | LinkedIn |
| `li_at` | LinkedIn | Third-party | 1 year | LinkedIn ad delivery | LinkedIn |
| `UserMatchHistory` | LinkedIn | Third-party | 30 days | LinkedIn ad matching | LinkedIn |
| `bcookie` | LinkedIn | Third-party | 1 year | LinkedIn browser ID | LinkedIn |
| `bscookie` | LinkedIn | Third-party | 1 year | LinkedIn secure browser ID | LinkedIn |
| `lidc` | LinkedIn | Third-party | 24 hours | LinkedIn routing | LinkedIn |
| `_ttp` | TikTok Pixel | Third-party | 1 year | TikTok advertising | TikTok |
| `_tt_enable_cookie` | TikTok Pixel | Third-party | 1 year | TikTok cookie enablement | TikTok |

**Note**: All marketing cookies are **blocked by default** and only load after explicit user consent. No marketing cookies are loaded in Phase 1.

### 3.5 Social Media Cookies (Consent Required)

| Cookie/Technology Name | Provider | Type | Duration | Purpose | Data Sent to Third Parties? |
|---|---|---|---|---|---|
| `c_user` | Facebook (embedded content) | Third-party | 1 year | Facebook login state | Meta |
| `datr` | Facebook (embedded content) | Third-party | 2 years | Facebook browser security | Meta |
| `sb` | Facebook (embedded content) | Third-party | 2 years | Facebook friend suggestions | Meta |
| `twid` | Twitter/X (embedded content) | Third-party | 1 year | Twitter user identification | X Corp |
| `ct0` | Twitter/X (embedded content) | Third-party | Session | Twitter CSRF protection | X Corp |
| `guest_id` | Twitter/X (embedded content) | Third-party | 1 year | Twitter guest identification | X Corp |
| ` personalization_id` | Twitter/X | Third-party | 1 year | Twitter personalization | X Corp |
| `YSC` | YouTube (embedded content) | Third-party | Session | YouTube session | Google |
| `VISITOR_INFO1_LIVE` | YouTube (embedded content) | Third-party | 6 months | YouTube bandwidth estimation | Google |
| `CONSENT` | YouTube (embedded content) | Third-party | 2 years | YouTube consent state | Google |

**Note**: Social media embeds use privacy-enhanced mode (youtube-nocookie.com for YouTube) where possible. Social sharing buttons are static links (not scripts) to prevent automatic cookie setting.

---

## 4. Local Storage and Session Storage

### 4.1 localStorage Items

| Key | Provider | Duration | Purpose | Consent Category |
|---|---|---|---|---|
| `twinmos_consent` | TwinMOS | Persistent | Consent state storage | Necessary (stores consent) |
| `twinmos_preferences` | TwinMOS | Persistent | User preferences (UI, filters) | Functional |
| `twinmos_cart` (Phase 3) | TwinMOS | Persistent | Shopping cart contents | Necessary (if checked out) |
| `twinmos_search_history` | TwinMOS | Persistent | Recent search queries | Functional |
| `twinmos_product_comparison` | TwinMOS | Persistent | Product comparison list | Functional |
| `twinmos_notification_dismissed` | TwinMOS | Persistent | Dismissed notification tracking | Necessary |

### 4.2 sessionStorage Items

| Key | Provider | Duration | Purpose | Consent Category |
|---|---|---|---|---|
| `twinmos_form_draft` | TwinMOS | Session | Form draft auto-save | Functional |
| `twinmos_filter_state` | TwinMOS | Session | Active product filters | Functional |
| `twinmos_modal_state` | TwinMOS | Session | Modal/dialog state | Necessary |
| `twinmos_csrf_token` | TwinMOS | Session | CSRF token (mirror of cookie) | Necessary |

### 4.3 IndexedDB

| Database | Provider | Purpose | Consent Category |
|---|---|---|---|
| `twinmos_offline` | TwinMOS | Offline content cache (PWA) | Necessary |
| `twinmos_search_index` | TwinMOS | Local search index for instant search | Functional |

---

## 5. Consent Management Implementation

### 5.1 Consent Banner Design

| Element | Implementation |
|---|---|
| **Timing** | Display on first visit before any non-essential cookies are set |
| **Position** | Bottom of viewport, non-intrusive, accessible |
| **Content** | Plain language explanation of cookie purposes; link to full Cookie Policy |
| **Buttons** | "Accept All", "Reject All", "Customize" (equal prominence) |
| **Granularity** | Toggle per category: Necessary (locked on), Functional, Analytics, Marketing |
| **Withdrawal** | "Cookie Settings" link in footer; accessible at all times |
| **Accessibility** | WCAG 2.1 AA compliant; keyboard navigable; screen reader compatible |

### 5.2 Consent State Machine

```
[First Visit] --> [Show Banner]
    |
    +-- [Accept All] --> [Set All Consents: True] --> [Load All Cookies]
    |
    +-- [Reject All] --> [Set All Consents: False] --> [Load Necessary Only]
    |
    +-- [Customize] --> [Show Granular Options] --> [Apply Selected]
    |
    +-- [Ignore/Dismiss] --> [Set All Consents: False] --> [Load Necessary Only]

[Return Visit] --> [Read Consent State] --> [Apply Stored Preferences]
```

### 5.3 Consent Persistence

| Aspect | Implementation |
|---|---|
| **Storage** | `__Host-consent` cookie (Secure, SameSite=Strict, 13 months) |
| **Format** | JSON-encoded consent object with version timestamp |
| **Versioning** | Consent version tracked; banner re-shown on policy update |
| **Geolocation** | Banner shown to all visitors; strict mode for EU/UK/EEA |
| **Audit Trail** | Consent decisions logged with timestamp, IP hash, user agent hash |

### 5.4 Third-Party Script Loading

| Category | Loading Mechanism | Fallback |
|---|---|---|
| Necessary | Inline in HTML | N/A |
| Functional | Dynamically injected after consent check | Graceful degradation |
| Analytics | Dynamically injected after consent check | No tracking |
| Marketing | Dynamically injected after consent check | No tracking |
| Social Media | Privacy-enhanced embeds; no scripts until interaction | Static links |

---

## 6. Compliance Verification

### 6.1 Automated Testing

| Test | Tool | Frequency | Pass Criteria |
|---|---|---|---|
| Cookie scan on page load | Cookiebot / custom scanner | Daily | Only necessary cookies without consent |
| Third-party script blocking | Puppeteer / Playwright | Per deployment | Marketing scripts blocked until consent |
| Consent banner display | Visual regression | Per deployment | Banner visible on first visit |
| Consent persistence | Automated test | Per deployment | Preferences retained across sessions |
| Withdrawal mechanism | Automated test | Per deployment | All non-essential cookies removed on withdrawal |

### 6.2 Manual Verification

| Check | Method | Frequency | Owner |
|---|---|---|---|
| Cookie inventory accuracy | Browser dev tools audit | Monthly | DPO |
| Third-party script review | Network tab analysis | Per deployment | Security Engineer |
| Consent flow walkthrough | Manual testing | Per deployment | QA Team |
| Privacy policy alignment | Document review | Quarterly | Legal |
| Cross-browser compatibility | Browser testing | Quarterly | QA Team |
| Mobile experience | Device testing | Quarterly | QA Team |

### 6.3 Cookie Policy Requirements

| Requirement | Status | Evidence |
|---|---|---|
| List all cookies by purpose | Implemented | This document |
| Explain consent mechanism | Implemented | Section 5 |
| Describe withdrawal process | Implemented | Section 5.1 |
| Third-party data sharing disclosure | Implemented | Section 3 |
| Data retention periods | Implemented | Section 3 |
| Contact information for queries | Implemented | Privacy Policy |
| Last updated date | Implemented | Document header |

---

## 7. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Non-essential cookie set before consent | Low | High | Automated testing, CSP blocking |
| Third-party script loads despite rejection | Low | High | Script loader validation, network monitoring |
| Consent record lost/corrupted | Low | Medium | Server-side backup, re-prompt on corruption |
| Marketing pixel fires on every page | Low | High | Pixel manager with consent gating |
| Social embed sets cookies automatically | Medium | Medium | Privacy-enhanced mode, static links |
| User unable to withdraw consent | Low | High | Footer link, accessible UI, automated testing |
| Cookie policy out of date | Medium | Medium | Quarterly review, change detection |
| Cross-domain cookie leakage | Low | High | SameSite=Strict, domain scoping |

---

## 8. Governance

### 8.1 Cookie Change Process

| Step | Action | Owner | Approval |
|---|---|---|---|
| 1 | Document proposed cookie in this audit | Requester | N/A |
| 2 | Privacy impact assessment | DPO | DPO |
| 3 | Security review | Security Engineer | CISO |
| 4 | Consent framework update | Frontend Team | DPO |
| 5 | Cookie policy update | Legal | Legal |
| 6 | Deployment | DevOps | CTO |
| 7 | Post-deployment verification | QA Team | QA Lead |

### 8.2 Review Schedule

| Review Type | Frequency | Scope | Owner |
|---|---|---|---|
| Automated scan | Daily | All cookies on production | Automated |
| Inventory update | Per deployment | New/modified cookies | Security Engineer |
| Full audit | Quarterly | Complete inventory review | DPO |
| External audit | Annual | Independent verification | External auditor |
| Policy alignment | Quarterly | Cookie Policy vs. actual cookies | Legal |

---

## 9. Document Change Log

| Version | Date | Author | Change Description |
|---|---|---|---|
| 1.0.0 | 2026-05-01 | Privacy Team | Initial cookie audit for Phase 1 launch |

---

## 10. Appendices

### Appendix A: Cookie Testing Checklist

| Test Case | Expected Result | Test Method |
|---|---|---|
| First visit from EU IP | Consent banner displayed | VPN + fresh browser |
| Accept all cookies | All categories enabled | Click "Accept All" |
| Reject all cookies | Only necessary cookies set | Click "Reject All" |
| Customize - Analytics only | Only necessary + analytics | Toggle analytics on, others off |
| Withdraw consent | All non-essential removed | Click "Cookie Settings" -> reject all |
| Return visit | Previous preferences applied | Close browser, reopen |
| Policy update | Banner re-shown | Update consent version |
| Third-party scripts | Blocked until consent | Network tab inspection |
| Marketing pixels | Not loaded without consent | Facebook Pixel Helper |
| Google Analytics | Not loaded without consent | GA Debugger |

### Appendix B: Cookie Banner Text Templates

**English (Default)**:
> We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies. Read our [Cookie Policy](#) for more information.

**Arabic**:
> نستخدم ملفات تعريف الارتباط لتحسين تجربة التصفح الخاصة بك وتقديم محتوى مخصص وتحليل حركة المرور لدينا. بالنقر على "قبول الكل"، فإنك توافق على استخدامنا لملفات تعريف الارتباط.

**Hindi**:
> हम आपके ब्राउज़िंग अनुभव को बेहतर बनाने, व्यक्तिगत सामग्री प्रदान करने और हमारे ट्रैफ़िक का विश्लेषण करने के लिए कुकीज़ का उपयोग करते हैं।

### Appendix C: Third-Party Privacy Policies

| Provider | Privacy Policy URL | Data Processing Agreement |
|---|---|---|
| Cloudflare | https://www.cloudflare.com/privacypolicy/ | Signed |
| Google (Analytics/Ads) | https://policies.google.com/privacy | Signed (if used) |
| Meta (Facebook) | https://www.facebook.com/privacy/policy | Signed (if used) |
| LinkedIn | https://www.linkedin.com/legal/privacy-policy | Signed (if used) |
| TikTok | https://www.tiktok.com/legal/privacy-policy | Signed (if used) |
| Plausible Analytics | https://plausible.io/data-policy | Self-hosted (no external sharing) |
