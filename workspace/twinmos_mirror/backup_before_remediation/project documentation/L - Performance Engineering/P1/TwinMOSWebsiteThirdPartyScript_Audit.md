# TwinMOS Website — Third-Party Script Audit

**Document Reference:** TWN-3P-AUDIT-2026-001  
**Document Version:** 1.0  
**Status:** DRAFT — Pending Engineering Review  
**Date:** 1 May 2026  
**Prepared by:** TwinMOS Digital Transformation Team / Unisoft Engineering  
**Owner:** IT/Technical Lead (Implementation) / Marketing Director (Script Approval)  
**Audience:** Frontend developers, security team, marketing team, compliance  
**Classification:** CONFIDENTIAL — TwinMOS + Unisoft Internal Use  
**Synchronized With:** Tech Stack §17.3–17.4, §18.3 (CSP), BRD §21, BRD §22.1, RFP §6.1, URD §34.2

---

## 1. Executive Summary

Third-party scripts are the single greatest risk to website performance, security, and privacy compliance. This document provides a **comprehensive audit of all third-party scripts** planned for the TwinMOS website, assessing each on:

- **Performance impact** (download size, parse time, main thread blocking)
- **Privacy compliance** (GDPR, UAE PDPL, India DPDP, KSA PDPL)
- **Security risk** (CSP compatibility, supply chain attack surface)
- **Business necessity** (is the script essential?)

> **Goal:** Minimize third-party JavaScript to ≤ 60 KB gzipped per page (except checkout), load all scripts non-blocking, and maintain full consent-gated control.

---

## 2. Third-Party Inventory

### 2.1 Phase 1 Scripts

| # | Service | Provider | Size (gz) | Category | Loading Strategy | Consent Required | Business Owner |
|---|---------|----------|-----------|----------|-----------------|------------------|----------------|
| 1 | **Plausible Analytics** | Plausible (self-hosted) | ~1 KB | Analytics | Inline | No | Marketing |
| 2 | **Google Analytics 4** | Google | ~45 KB | Analytics | Partytown / `defer` | Yes (Marketing) | Marketing |
| 3 | **Google Tag Manager** | Google | Included in GA4 | Tag Management | Partytown / `defer` | Yes (Marketing) | Marketing |
| 4 | **Meta Pixel** | Meta | ~25 KB | Marketing | `defer` via GTM | Yes (Marketing) | Marketing |
| 5 | **LinkedIn Insight Tag** | LinkedIn | ~15 KB | Marketing | `defer` via GTM | Yes (Marketing) | Marketing |
| 6 | **Sentry SDK** | Sentry | ~25 KB | Error Monitoring | `defer` | No | Engineering |
| 7 | **Cloudflare Turnstile** | Cloudflare | ~30 KB | Bot Protection | `defer` | No | Engineering |
| 8 | **Google Search Console** | Google | 0 KB (meta tag) | SEO | Meta tag only | N/A | Marketing |

### 2.2 Phase 2 Scripts

| # | Service | Provider | Size (gz) | Category | Loading Strategy | Consent Required | Business Owner |
|---|---------|----------|-----------|----------|-----------------|------------------|----------------|
| 9 | **Chatwoot Widget** | Chatwoot (self-hosted) | ~50 KB | Live Chat | `client:visible` | No | Support |
| 10 | **HubSpot CRM** | HubSpot | ~40 KB | CRM | `defer` | Yes (Functional) | Sales |

### 2.3 Phase 3 Scripts

| # | Service | Provider | Size (gz) | Category | Loading Strategy | Consent Required | Business Owner |
|---|---------|----------|-----------|----------|-----------------|------------------|----------------|
| 11 | **PostHog OSS** | PostHog (self-hosted) | ~40 KB | Product Analytics | `defer` | Yes (Marketing) | Marketing |
| 12 | **Stripe.js** | Stripe | ~80 KB | Payments | Dynamic import | No (PCI) | Engineering |
| 13 | **TikTok Pixel** | TikTok | ~25 KB | Marketing | `defer` via GTM | Yes (Marketing) | Marketing |

---

## 3. Performance Impact Assessment

### 3.1 Script Impact Matrix

| Script | Parse Time* | Execution Time* | Blocking? | Network Priority | INP Impact | LCP Impact |
|--------|------------|----------------|-----------|-----------------|------------|------------|
| Plausible | < 1 ms | < 1 ms | No | Low | None | None |
| GA4 + GTM | ~50 ms | ~80 ms | Yes (if not deferred) | High (if preloaded) | Medium | Low |
| Meta Pixel | ~20 ms | ~30 ms | Yes (if not deferred) | Medium | Low | Low |
| LinkedIn Insight | ~10 ms | ~15 ms | Yes (if not deferred) | Medium | Low | Low |
| Sentry | ~25 ms | ~40 ms | Yes (if not deferred) | Medium | Low | None |
| Cloudflare Turnstile | ~30 ms | ~50 ms | Yes (if not deferred) | Medium | Medium | Low |
| Chatwoot | ~40 ms | ~60 ms | Yes | Medium | Medium | Low |
| HubSpot | ~30 ms | ~50 ms | Yes | Medium | Medium | Low |
| PostHog | ~35 ms | ~50 ms | Yes | Medium | Medium | Low |
| Stripe.js | ~60 ms | ~100 ms | Yes | High | High (on checkout) | None |

\* Estimated on Moto G4 (mid-range device) throttled to 4x CPU slowdown.

### 3.2 Total Impact by Phase

| Phase | Total Third-Party JS | TBT Impact | Mitigation |
|-------|---------------------|------------|------------|
| **Phase 1** | ~145 KB | ~200 ms | Partytown + defer + consent gating |
| **Phase 2** | ~235 KB | ~310 ms | Lazy-load Chatwoot; defer HubSpot |
| **Phase 3** | ~300 KB | ~460 ms | Route-restrict Stripe; sample PostHog |

> **Note:** Not all scripts load on every page. Actual per-page impact is typically 60–120 KB.

---

## 4. Privacy & Compliance Assessment

### 4.1 GDPR / UAE PDPL / India DPDP / KSA PDPL Requirements

| Requirement | Implementation |
|------------|----------------|
| **Consent before loading** | All analytics/marketing scripts load only after granular consent |
| **Granular categories** | Strictly Necessary, Functional, Analytics, Marketing |
| **Withdrawal mechanism** | Cookie preferences page allows opt-out at any time |
| **Data minimization** | Plausible is cookieless; GA4 has IP anonymization |
| **No pre-loading** | Scripts are not fetched before consent is given |
| **Documentation** | Consent timestamp + IP logged for audit trail |

### 4.2 Consent Category Mapping

| Script | Category | Default (EU) | Default (UAE) | Default (India) | Default (Other) |
|--------|----------|-------------|--------------|----------------|----------------|
| Plausible | Analytics | Off | On | On | On |
| GA4 | Analytics | Off | Off | Off | Off |
| GTM | Functional | Off | On | On | On |
| Meta Pixel | Marketing | Off | Off | Off | Off |
| LinkedIn Insight | Marketing | Off | Off | Off | Off |
| Sentry | Strictly Necessary | On | On | On | On |
| Turnstile | Strictly Necessary | On | On | On | On |
| Chatwoot | Functional | On | On | On | On |
| HubSpot | Functional | Off | Off | Off | Off |
| PostHog | Marketing | Off | Off | Off | Off |
| Stripe | Strictly Necessary | On | On | On | On |

### 4.3 Data Flow Audit

| Script | Data Sent To | PII? | Encryption | Data Residency |
|--------|-------------|------|------------|----------------|
| Plausible | Self-hosted (Hetzner EU) | No | TLS 1.3 | EU |
| GA4 | Google (US) | Anonymized IP | TLS 1.3 | US |
| Meta Pixel | Meta (US) | Hashed | TLS 1.3 | US |
| LinkedIn Insight | LinkedIn (US) | Hashed | TLS 1.3 | US |
| Sentry | Sentry.io (US) | No PII by config | TLS 1.3 | US |
| Turnstile | Cloudflare (US/EU) | No | TLS 1.3 | US/EU |
| Chatwoot | Self-hosted (Hetzner EU) | Yes (chat content) | TLS 1.3 | EU |
| HubSpot | HubSpot (US) | Yes (form data) | TLS 1.3 | US |
| PostHog | Self-hosted (Hetzner EU) | Yes (session replay) | TLS 1.3 | EU |
| Stripe | Stripe (US) | Yes (payment data) | TLS 1.3 | US |

---

## 5. Security Assessment

### 5.1 CSP (Content Security Policy) Compatibility

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'wasm-unsafe-eval' 
    https://challenges.cloudflare.com      /* Turnstile */
    https://js.stripe.com                  /* Stripe (P3) */
    https://*.google-analytics.com         /* GA4 */
    https://*.googletagmanager.com         /* GTM */
    https://connect.facebook.net           /* Meta Pixel */
    https://snap.licdn.com                 /* LinkedIn */
    https://browser.sentry-cdn.com         /* Sentry */
    https://plausible.twinmos.com;         /* Plausible self-hosted */
  style-src 'self' 'unsafe-inline';        /* Tailwind requires inline */
  img-src 'self' data: https://*.backblazeb2.com https://imgproxy.twinmos.com https://*.googleusercontent.com https://*.facebook.com https://*.linkedin.com;
  connect-src 'self' https://api.twinmos.com https://search.twinmos.com https://sentry.io https://*.google-analytics.com https://*.googletagmanager.com;
  frame-src https://challenges.cloudflare.com https://js.stripe.com;
  font-src 'self' data:;
```

### 5.2 Subresource Integrity (SRI)

For any third-party script loaded from CDN, SRI hashes must be enforced:

```html
<!-- Example: Sentry with SRI -->
<script 
  src="https://browser.sentry-cdn.com/9.0.0/bundle.min.js"
  integrity="sha384-..."
  crossorigin="anonymous"
  defer
></script>
```

**Scripts requiring SRI:**
- Sentry CDN bundle
- Stripe.js (if loaded from stripe.com)

**Self-hosted scripts (Plausible, Chatwoot, PostHog):** SRI optional but recommended.

### 5.3 Supply Chain Risk

| Risk | Mitigation |
|------|-----------|
| **Script compromise at vendor** | SRI hashes lock to known-good versions |
| **Vendor shutdown / price change** | Self-hosted alternatives (Plausible, PostHog, Chatwoot) |
| **Data breach at vendor** | Minimal data sent; anonymization where possible |
| **Malicious injection via GTM** | GTM container review process; limited container permissions |

---

## 6. Business Necessity Justification

### 6.1 Must-Have Scripts (Cannot Remove)

| Script | Justification | If Removed |
|--------|--------------|------------|
| **Sentry** | Error monitoring is essential for production stability | Blind to bugs; SLA breaches |
| **Turnstile** | Bot protection required for all public forms | Spam floods; security risk |
| **Plausible** | Privacy-first analytics required for performance baselines | No traffic visibility |
| **Stripe.js (P3)** | PCI compliance requires loading from Stripe domain | Cannot process payments |

### 6.2 Should-Have Scripts (Strong Business Case)

| Script | Justification | If Removed |
|--------|--------------|------------|
| **GA4 + GTM** | Marketing team requires familiar analytics; RFP §6.1 P0 | Reduced marketing insight |
| **Chatwoot (P2)** | Support SLA requires live chat; BRD §11.3 | Support ticket increase |
| **HubSpot (P2)** | CRM integration for lead routing; BRD §25.1 | Manual lead processing |

### 6.3 Nice-to-Have Scripts (Deferrable)

| Script | Justification | Deferral Impact |
|--------|--------------|-----------------|
| **Meta Pixel** | Retargeting for gaming audience | Slight ad efficiency reduction |
| **LinkedIn Insight** | B2B distributor campaign tracking | Reduced LinkedIn attribution |
| **PostHog (P3)** | Session replay and feature flags | Reduced product insight |
| **TikTok Pixel (P3)** | Gaming community retargeting | No TikTok attribution |

---

## 7. Loading Optimization Strategy

### 7.1 Partytown for Analytics

Partytown runs scripts in a Web Worker, offloading them from the main thread:

```ts
// astro.config.ts
import partytown from '@astrojs/partytown';

export default defineConfig({
  integrations: [
    partytown({
      config: {
        forward: [
          'dataLayer.push',
          'gtag',
          'fbq',
          'lintrk',
          'plausible',
        ],
      },
    }),
  ],
});
```

**Scripts in Partytown:** GA4, GTM, Meta Pixel, LinkedIn Insight

**Scripts NOT in Partytown:** Sentry (needs main thread), Turnstile (needs DOM), Stripe (needs DOM), Chatwoot (needs DOM)

### 7.2 Consent-Gated Loading Flow

```
1. Page loads with only Strictly Necessary scripts (Sentry, Turnstile, Plausible)
2. Cookie banner appears (if no prior consent stored)
3. User selects consent preferences
4. Consent stored in localStorage + cookie
5. GTM container fires tags based on consent categories
6. Analytics/Marketing scripts load only if consented
7. Scripts respect Global Privacy Control (GPC) browser signal
```

### 7.3 Per-Page Script Loading

| Page | Scripts Loaded | Deferred |
|------|---------------|----------|
| **All pages** | Plausible, Sentry, GTM container (empty until consent) | GA4, Meta, LinkedIn |
| **Form pages** | + Turnstile | — |
| **Where to buy** | + Leaflet/MapLibre (dynamic) | — |
| **Gaming hub** | + Framer Motion (dynamic) | — |
| **Checkout (P3)** | + Stripe.js (dynamic) | — |
| **Partner portal (P2)** | + Better Auth (inline) | — |

---

## 8. Monitoring & Enforcement

### 8.1 Third-Script Monitoring

| Metric | Tool | Alert |
|--------|------|-------|
| Third-party JS weight | Lighthouse CI | > 60 KB per page |
| Third-party execution time | Chrome DevTools Performance | > 100 ms blocking |
| Failed script loads | Sentry | Any 4xx/5xx for script URLs |
| CSP violations | Sentry + Cloudflare | Any blocked resource |
| Consent bypass | Custom audit | Script loaded before consent |

### 8.2 Quarterly Script Review

Every quarter, the engineering + marketing teams conduct a script review:

1. **Inventory check:** Is every script still needed?
2. **Size check:** Have any scripts grown significantly?
3. **Performance check:** Are scripts impacting CWV?
4. **Security check:** Are SRI hashes up to date?
5. **Compliance check:** Are consent flows still correct?

### 8.3 New Script Approval Process

```
1. Requestor fills out Third-Party Script Request Form
   - Business justification
   - Estimated size
   - Privacy category
   - CSP requirements
   
2. Engineering reviews performance impact
   - Bundle budget check
   - CWV impact assessment
   - Security review
   
3. Legal reviews compliance impact
   - Data residency
   - GDPR/PDPL/DPDP compatibility
   
4. Marketing Director approves business need

5. Technical Lead approves technical implementation

6. Script added to GTM or code with documented fallback
```

---

## 9. Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 1 May 2026 | TwinMOS Digital Transformation Team | Initial audit |
| 1.0 | 1 May 2026 | TwinMOS Digital Transformation Team | Final audit with mitigation strategies |

---

## 10. References

- Tech Stack §17.3 — Google Analytics 4 (Consent-gated)
- Tech Stack §17.4 — Marketing Pixels (Consent-gated)
- Tech Stack §18.3 — Content Security Policy
- BRD §21 — Security Requirements
- BRD §22.1 — Data Protection Regulations
- RFP §6.1 — Technology Stack Preferences
- URD §34.2 — Privacy Controls Users Have
- `TwinMOSWebsitePerformance_Budget.md`
- `TwinMOSWebsiteBundleSizeBudget.md`
