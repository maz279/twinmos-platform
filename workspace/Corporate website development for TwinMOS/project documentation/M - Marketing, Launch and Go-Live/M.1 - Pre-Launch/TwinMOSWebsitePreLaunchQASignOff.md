# TwinMOS Corporate Website — Pre-Launch QA Sign-Off

**Document Reference:** TWN-QA-SIGNOFF-2026-001  
**Document Version:** 1.0  
**Status:** FINAL  
**Date:** 30 April 2026  
**Prepared by:** QA Lead  
**Owner:** QA Lead (Independent Authority to Block Release)  
**Audience:** Executive Leadership, Development Team, Marketing, IT  
**Classification:** CONFIDENTIAL — Internal Use Only  
**Synchronized With:** BRD v3.0, RFP v3.0, Tech Stack v1.1, QA Strategy v1.0, UAT Plan v1.0, Launch Plan v1.0

---

## 1. Purpose

This document certifies that the rebuilt TwinMOS.com has passed all quality assurance gates required for launch. It is a **prerequisite** for the Go/No-Go decision (`TwinMOSWebsiteGoNoGo_Checklist.md`).

The QA Lead has **independent authority to block release** regardless of schedule pressure if any mandatory gate is not satisfied.

---

## 2. QA Philosophy

> *"Quality is not an afterthought — it is engineered into every product from the earliest design phase through final shipment."*
>
> — TwinMOS Product Quality Culture

This philosophy extends from hardware manufacturing to our digital platform. The website must reflect the same "Innovation, Perfection, and Quality" standard as our DRAM and SSD products.

---

## 3. Sign-Off Domains

### Domain A: Functional Testing

**Scope:** All 287 content pages, 100+ SKU pages, 15+ form types, search, compatibility finder, where-to-buy locator, CMS admin.

| # | Test Area | Method | Sample Size | Result | Evidence |
|---|-----------|--------|-------------|--------|----------|
| A.1 | Content page rendering (no 404/500) | Automated crawl + manual spot-check | All 287 pages | ☐ PASS ☐ FAIL | Crawl report |
| A.2 | SKU detail page accuracy | Manual verification against `_master-sku-reference.md` | 20 random SKUs | ☐ PASS ☐ FAIL | Verification sheet |
| A.3 | Product filtering & sorting | Manual + automated | All category pages | ☐ PASS ☐ FAIL | Test log |
| A.4 | Product comparison (up to 4 SKUs) | Manual | 5 comparison scenarios | ☐ PASS ☐ FAIL | Test log |
| A.5 | Compatibility finder MVP | Manual with real device models | 10 laptop + 10 motherboard queries | ☐ PASS ☐ FAIL | Test log |
| A.6 | Where-to-buy locator | Manual | 5 country searches + map interaction | ☐ PASS ☐ FAIL | Test log |
| A.7 | Search (MeiliSearch) | Manual + automated | 50 queries across categories | ☐ PASS ☐ FAIL | Test log |
| A.8 | Contact forms (all 9 types) | Submission + inbox verification | Each form type × 2 | ☐ PASS ☐ FAIL | Inbox screenshots |
| A.9 | Newsletter signup + double opt-in | End-to-end | 3 signups | ☐ PASS ☐ FAIL | Inbox screenshots |
| A.10 | Warranty registration form | End-to-end | 3 registrations | ☐ PASS ☐ FAIL | DB + inbox verification |
| A.11 | CMS admin CRUD operations | Manual | All content types | ☐ PASS ☐ FAIL | Admin walkthrough log |
| A.12 | Language selector routing | Manual | EN + AR/BN/HI stubs | ☐ PASS ☐ FAIL | Navigation test |
| A.13 | Cookie consent flow | Manual | Accept / Reject / Customize | ☐ PASS ☐ FAIL | Consent state verification |
| A.14 | 404 / 500 error pages | Forced error | Both page types | ☐ PASS ☐ FAIL | Screenshot |
| A.15 | Redirects (legacy → new URLs) | Automated + manual | All mapped redirects | ☐ PASS ☐ FAIL | Redirect test report |

**Domain A Status:** ☐ SIGNED OFF ☐ BLOCKED  
**Notes:**

---

### Domain B: Performance Testing

**Scope:** All 5 page templates (Hero, Content, Product Detail, Legal, Form), plus homepage under load.

| # | Metric | Target | Tool | Result | Evidence |
|---|--------|--------|------|--------|----------|
| B.1 | Lighthouse Performance (desktop) | ≥ 90 | Lighthouse CI | ☐ PASS ☐ FAIL | Report |
| B.2 | Lighthouse Performance (mobile) | ≥ 90 | Lighthouse CI | ☐ PASS ☐ FAIL | Report |
| B.3 | Largest Contentful Paint (LCP) | ≤ 2.0s (target ≤ 1.8s) | Lighthouse / WebPageTest | ☐ PASS ☐ FAIL | Report |
| B.4 | First Input Delay (FID) | ≤ 100ms | CrUX / DevTools | ☐ PASS ☐ FAIL | Report |
| B.5 | Interaction to Next Paint (INP) | ≤ 200ms | CrUX / DevTools | ☐ PASS ☐ FAIL | Report |
| B.6 | Cumulative Layout Shift (CLS) | ≤ 0.1 | Lighthouse | ☐ PASS ☐ FAIL | Report |
| B.7 | Time to First Byte (TTFB) | ≤ 200ms (target ≤ 150ms) | WebPageTest | ☐ PASS ☐ FAIL | Report |
| B.8 | Total Blocking Time (TBT) | ≤ 200ms | Lighthouse | ☐ PASS ☐ FAIL | Report |
| B.9 | Speed Index | ≤ 3.0s | Lighthouse | ☐ PASS ☐ FAIL | Report |
| B.10 | First Contentful Paint (FCP) | ≤ 1.2s | Lighthouse | ☐ PASS ☐ FAIL | Report |
| B.11 | Load test: 5,000 concurrent users | 0 errors; p95 < 3s | k6 | ☐ PASS ☐ FAIL | Report |
| B.12 | Load test: sustained 1,000 users / 10 min | CPU < 70%; memory stable | k6 + Coolify metrics | ☐ PASS ☐ FAIL | Report |
| B.13 | CDN cache hit ratio | ≥ 80% | Cloudflare analytics | ☐ PASS ☐ FAIL | Screenshot |
| B.14 | Image optimization | WebP/AVIF serving; lazy loading active | DevTools Network | ☐ PASS ☐ FAIL | Screenshot |
| B.15 | Font subsetting | Only required glyphs loaded | DevTools Network | ☐ PASS ☐ FAIL | Screenshot |

**Domain B Status:** ☐ SIGNED OFF ☐ BLOCKED  
**Notes:**

---

### Domain C: Accessibility Testing

**Scope:** WCAG 2.1 AA + EN 301 549 compliance across all page templates and interactive islands.

| # | Test Area | Method | Target | Result | Evidence |
|---|-----------|--------|--------|--------|----------|
| C.1 | axe-core automated scan (all templates) | axe-playwright | Zero violations | ☐ PASS ☐ FAIL | Report |
| C.2 | Keyboard navigation | Manual (Tab, Enter, Escape, Arrow keys) | 100% functional | ☐ PASS ☐ FAIL | Test log |
| C.3 | Screen reader: NVDA (Windows) | Manual on top 10 pages | Logical reading order | ☐ PASS ☐ FAIL | Test log |
| C.4 | Screen reader: VoiceOver (macOS) | Manual on top 10 pages | Logical reading order | ☐ PASS ☐ FAIL | Test log |
| C.5 | Screen reader: VoiceOver (iOS) | Manual on homepage, product page | Touch exploration works | ☐ PASS ☐ FAIL | Test log |
| C.6 | Screen reader: TalkBack (Android) | Manual on homepage, product page | Touch exploration works | ☐ PASS ☐ FAIL | Test log |
| C.7 | Color contrast | axe-core + manual | ≥ 4.5:1 text; ≥ 3:1 UI components | ☐ PASS ☐ FAIL | Report |
| C.8 | Focus indicators | Manual | Visible 2px outline on all interactive elements | ☐ PASS ☐ FAIL | Screenshot |
| C.9 | Skip links | Manual | "Skip to main content" visible on focus | ☐ PASS ☐ FAIL | Screenshot |
| C.10 | Form labels & error announcements | Manual + axe | All inputs labeled; errors announced | ☐ PASS ☐ FAIL | Test log |
| C.11 | Alt text on images | Automated audit + manual | All informative images have alt; decorative have alt="" | ☐ PASS ☐ FAIL | Audit report |
| C.12 | Reduced motion preference | Manual | Animations respect prefers-reduced-motion | ☐ PASS ☐ FAIL | Test log |
| C.13 | Zoom up to 200% | Manual | No horizontal scroll; content readable | ☐ PASS ☐ FAIL | Screenshot |
| C.14 | Touch target size | Manual / inspector | ≥ 44×44px | ☐ PASS ☐ FAIL | Audit |

**Domain C Status:** ☐ SIGNED OFF ☐ BLOCKED  
**Notes:**

---

### Domain D: Security Testing

**Scope:** OWASP Top 10, infrastructure hardening, data protection compliance.

| # | Test Area | Method | Target | Result | Evidence |
|---|-----------|--------|--------|--------|----------|
| D.1 | OWASP ZAP baseline scan | ZAP baseline | Zero high/critical | ☐ PASS ☐ FAIL | Report |
| D.2 | Third-party penetration test | External vendor | No critical; highs remediated | ☐ PASS ☐ FAIL | Report + remediation log |
| D.3 | TLS 1.3 + certificate validity | SSL Labs | Grade A+ | ☐ PASS ☐ FAIL | SSL Labs report |
| D.4 | HSTS preload headers | Header inspection | max-age=31536000; includeSubDomains; preload | ☐ PASS ☐ FAIL | Header check |
| D.5 | Content Security Policy | CSP evaluator | No unsafe-inline; no unsafe-eval | ☐ PASS ☐ FAIL | Evaluator report |
| D.6 | SQL injection | ZAP + manual | No vulnerabilities | ☐ PASS ☐ FAIL | Report |
| D.7 | XSS (reflected + stored) | ZAP + manual | No vulnerabilities | ☐ PASS ☐ FAIL | Report |
| D.8 | CSRF protection | Manual test | All state-changing requests tokenized | ☐ PASS ☐ FAIL | Test log |
| D.9 | Rate limiting | Automated | 100 req/min anonymous enforced | ☐ PASS ☐ FAIL | Test log |
| D.10 | Dependency vulnerabilities | Snyk + Dependabot | Zero high/critical open | ☐ PASS ☐ FAIL | Dashboard screenshot |
| D.11 | Secret scanning | Git secret scan | No secrets in repository | ☐ PASS ☐ FAIL | Scan report |
| D.12 | File upload security | Manual | Type whitelist + size limit + ClamAV | ☐ PASS ☐ FAIL | Test log |
| D.13 | Cookie security flags | Inspector | HttpOnly, Secure, SameSite=Strict | ☐ PASS ☐ FAIL | Screenshot |
| D.14 | API authentication (JWT) | Automated | 1h expiry; refresh rotation; RS256 | ☐ PASS ☐ FAIL | Test log |

**Domain D Status:** ☐ SIGNED OFF ☐ BLOCKED  
**Notes:**

---

### Domain E: Cross-Browser & Cross-Device Testing

**Scope:** Latest 2 versions of each browser; real iOS and Android devices.

| # | Browser / Device | Version | OS | Result | Evidence |
|---|------------------|---------|----|--------|----------|
| E.1 | Chrome | Latest | Windows 11 | ☐ PASS ☐ FAIL | BrowserStack |
| E.2 | Chrome | Latest | macOS | ☐ PASS ☐ FAIL | BrowserStack |
| E.3 | Firefox | Latest | Windows 11 | ☐ PASS ☐ FAIL | BrowserStack |
| E.4 | Firefox | Latest | macOS | ☐ PASS ☐ FAIL | BrowserStack |
| E.5 | Safari | Latest | macOS | ☐ PASS ☐ FAIL | BrowserStack |
| E.6 | Safari | Latest | iOS (iPhone 15) | ☐ PASS ☐ FAIL | Real device |
| E.7 | Safari | Latest | iPadOS | ☐ PASS ☐ FAIL | Real device |
| E.8 | Edge | Latest | Windows 11 | ☐ PASS ☐ FAIL | BrowserStack |
| E.9 | Samsung Internet | Latest | Android (Galaxy S24) | ☐ PASS ☐ FAIL | Real device |
| E.10 | Chrome | Latest | Android (Pixel 8) | ☐ PASS ☐ FAIL | Real device |
| E.11 | Responsive breakpoints | 320px / 768px / 1024px / 1440px | All | ☐ PASS ☐ FAIL | Screenshot matrix |

**Domain E Status:** ☐ SIGNED OFF ☐ BLOCKED  
**Notes:**

---

### Domain F: Content Accuracy Testing

**Scope:** Facts, legal compliance, brand consistency across all published content.

| # | Test Area | Method | Target | Result | Evidence |
|---|-----------|--------|--------|--------|----------|
| F.1 | HQ location accuracy | Manual | Dubai DAFZA displayed; no Taipei as HQ | ☐ PASS ☐ FAIL | Screenshot |
| F.2 | Leadership bios accuracy | Manual vs Company Profile v2.0 | Names, titles, roles correct | ☐ PASS ☐ FAIL | Verification sheet |
| F.3 | Product specifications accuracy | Spot-check 20 SKUs | Match master SKU reference | ☐ PASS ☐ FAIL | Verification sheet |
| F.4 | Warranty terms accuracy | Manual | Per BR-6.1: DRAM Limited Lifetime; NVMe 5yr; SATA 3yr | ☐ PASS ☐ FAIL | Page audit |
| F.5 | Certification badges | Manual | ISO 9001, CE, FCC, RoHS, REACH, UKCA, EAC, JEDEC | ☐ PASS ☐ FAIL | Screenshot |
| F.6 | Distributor information | Sales verification | All authorized partners correct | ☐ PASS ☐ FAIL | Sales sign-off |
| F.7 | Legal pages | Legal review | Privacy, terms, cookie policy, compliance hub accurate | ☐ PASS ☐ FAIL | Legal sign-off |
| F.8 | Copyright year | Automated | "© 2026 TwinMOS Technologies ME FZE" | ☐ PASS ☐ FAIL | Screenshot |
| F.9 | Email addresses | Link test | All mailto: links valid | ☐ PASS ☐ FAIL | Link checker |
| F.10 | Phone numbers | Manual | Dubai HQ +971-4-2996421/22 correct | ☐ PASS ☐ FAIL | Verification |

**Domain F Status:** ☐ SIGNED OFF ☐ BLOCKED  
**Notes:**

---

## 4. Defect Summary

| Severity | Count | Open | Closed | Blocking Launch? |
|----------|-------|------|--------|------------------|
| S1 — Critical | | | | Must be 0 |
| S2 — High | | | | Must be ≤ 3 |
| S3 — Medium | | | | Track in hypercare |
| S4 — Low | | | | Backlog |

### Open S1/S2 Defects (if any)

| ID | Title | Severity | Owner | ETA | Waiver Approved? |
|----|-------|----------|-------|-----|------------------|
| | | | | | |
| | | | | | |

---

## 5. QA Sign-Off Declaration

I, the undersigned QA Lead, certify that:

1. All tests documented in this sign-off have been executed.
2. The results are accurate and reflect the state of the system at the time of testing.
3. I have independent authority to block release and have exercised this authority objectively.
4. Any waivers or conditions are documented with assigned owners and due dates.

**Overall Recommendation:** ☐ READY FOR LAUNCH ☐ NOT READY FOR LAUNCH

**Conditions (if any):**

---

**QA Lead Signature:** _________________________  
**Date:** ___________  
**Time:** ___________

---

## 6. Escalation Path

If QA blocks launch and stakeholders disagree:

1. QA Lead presents evidence to Chairman within 4 hours.
2. Chairman decides: (a) accept block, (b) accept with documented risk, (c) override with written justification.
3. Override requires written sign-off from Chairman and Legal acknowledging risk acceptance.

---

*This sign-off is valid for 7 days from date of signature. If launch is delayed beyond 7 days, re-validation of critical paths is required.*
