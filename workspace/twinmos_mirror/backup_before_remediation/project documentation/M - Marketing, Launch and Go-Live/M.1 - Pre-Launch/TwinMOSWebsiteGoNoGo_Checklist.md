# TwinMOS Corporate Website — Go / No-Go Checklist

**Document Reference:** TWN-MKT-GNG-2026-001  
**Document Version:** 1.0  
**Status:** FINAL  
**Date:** 30 April 2026  
**Prepared by:** TwinMOS Digital Transformation Team  
**Owner:** Chairman (Mohd Mazharul Islam) — Final Authority  
**Audience:** Executive Leadership, Project Management, Development Team, QA, Marketing, Sales, Legal  
**Classification:** CONFIDENTIAL — Internal Use Only  
**Synchronized With:** BRD v3.0, RFP v3.0, URD v3.0, Tech Stack v1.1, QA Strategy v1.0, UAT Plan v1.0, Launch Plan v1.0

---

## 1. Purpose

This document defines the **objective, criteria-based decision framework** for approving or deferring the public launch of the rebuilt TwinMOS.com. No launch proceeds without formal sign-off against every mandatory gate.

The current TwinMOS website actively damages brand credibility (51 critical issues per Forensic Audit v1.0). The Go/No-Go process ensures the replacement site is demonstrably better in every dimension before public exposure.

---

## 2. Decision Authority

| Role | Name | Decision |
|------|------|----------|
| **Final Authority** | Mohd Mazharul Islam (Chairman) | Go / No-Go / Go with Conditions |
| **Technical Advisor** | Robiul Islam (GM Dubai) | Input on operational readiness |
| **Quality Gatekeeper** | QA Lead | QA sign-off (mandatory prerequisite) |
| **Marketing Gatekeeper** | Marketing Director | Content and brand readiness |
| **IT Gatekeeper** | IT/Technical Lead | Infrastructure and security readiness |
| **Sales Advisor** | Sales Director | Distributor and lead-flow readiness |

---

## 3. Go / No-Go Meeting Schedule

| Meeting | Timing | Duration | Attendees |
|---------|--------|----------|-----------|
| **Pre-Soft-Launch Go/No-Go** | Week 18, Day 2 | 60 min | Chairman, GM Dubai, Marketing Director, Sales Director, IT Lead, QA Lead, Unisoft Team Lead |
| **Pre-Public-Launch Go/No-Go** | Week 20, Day 1 | 60 min | Chairman (or delegate), GM Dubai, Marketing Director, IT Lead, QA Lead |

---

## 4. Mandatory Gates (ALL Must Pass)

### Gate 1: Quality Assurance — QA Lead Sign-Off

**Authority to block launch:** Yes — independent of schedule pressure.

| # | Criterion | Threshold | Evidence Required | Status |
|---|-----------|-----------|-------------------|--------|
| 1.1 | Zero S1 (critical) defects open | 0 | Defect tracker export | ☐ PASS / ☐ FAIL |
| 1.2 | S2 (high) defects open | ≤ 3 (with written waivers) | Defect tracker + waiver docs | ☐ PASS / ☐ FAIL |
| 1.3 | UAT pass rate | ≥ 95% | UAT test execution report | ☐ PASS / ☐ FAIL |
| 1.4 | Automated test suite | 100% green on latest build | CI/CD pipeline screenshot | ☐ PASS / ☐ FAIL |
| 1.5 | Accessibility (automated) | axe-core zero violations on all page templates | axe-core report | ☐ PASS / ☐ FAIL |
| 1.6 | Accessibility (manual) | NVDA/VoiceOver pass on top 30 pages | Manual test log | ☐ PASS / ☐ FAIL |
| 1.7 | Cross-browser validation | Chrome, Safari, Firefox, Edge, Samsung Internet — all green | BrowserStack report | ☐ PASS / ☐ FAIL |
| 1.8 | Mobile device validation | iOS Safari + Android Chrome real devices | Device test log | ☐ PASS / ☐ FAIL |

**QA Lead Signature:** _________________________ Date: ___________

---

### Gate 2: Performance — Dev A / IT Lead Sign-Off

| # | Criterion | Threshold | Evidence Required | Status |
|---|-----------|-----------|-------------------|--------|
| 2.1 | Lighthouse Performance Score | ≥ 90 on all 5 page templates | Lighthouse CI report | ☐ PASS / ☐ FAIL |
| 2.2 | Largest Contentful Paint (LCP) | ≤ 2.0 seconds (target ≤ 1.8s) | WebPageTest / Lighthouse | ☐ PASS / ☐ FAIL |
| 2.3 | First Input Delay (FID) / INP | ≤ 100 ms / ≤ 200 ms | Chrome DevTools / CrUX | ☐ PASS / ☐ FAIL |
| 2.4 | Cumulative Layout Shift (CLS) | ≤ 0.1 | Lighthouse | ☐ PASS / ☐ FAIL |
| 2.5 | Time to First Byte (TTFB) | ≤ 200 ms (target ≤ 150 ms) | WebPageTest | ☐ PASS / ☐ FAIL |
| 2.6 | Load test at 5,000 concurrent users | No errors; response time < 3s | k6 report | ☐ PASS / ☐ FAIL |
| 2.7 | CDN cache hit ratio | ≥ 80% | Cloudflare analytics | ☐ PASS / ☐ FAIL |
| 2.8 | Core Web Vitals (field data if available) | All "Good" | CrUX / real-user monitoring | ☐ PASS / ☐ FAIL |

**Dev A Signature:** _________________________ Date: ___________  
**IT Lead Signature:** _________________________ Date: ___________

---

### Gate 3: Security — IT Lead / Dev B Sign-Off

| # | Criterion | Threshold | Evidence Required | Status |
|---|-----------|-----------|-------------------|--------|
| 3.1 | OWASP ZAP baseline scan | Zero high/critical findings | ZAP report | ☐ PASS / ☐ FAIL |
| 3.2 | Third-party penetration test | No critical findings; highs remediated | Pen-test report + remediation log | ☐ PASS / ☐ FAIL |
| 3.3 | TLS configuration | TLS 1.3 only; HSTS preload ready | SSL Labs A+ | ☐ PASS / ☐ FAIL |
| 3.4 | Content Security Policy (CSP) | Enforced; no unsafe-inline | CSP evaluator | ☐ PASS / ☐ FAIL |
| 3.5 | Dependency vulnerability scan | Zero high/critical (Snyk/Dependabot) | Snyk dashboard | ☐ PASS / ☐ FAIL |
| 3.6 | Form bot protection | Cloudflare Turnstile active on all public forms | Form test | ☐ PASS / ☐ FAIL |
| 3.7 | Rate limiting | API rate limits active; no bypass | API test | ☐ PASS / ☐ FAIL |
| 3.8 | Secrets management | No secrets in repo; env vars only | Git secret scan | ☐ PASS / ☐ FAIL |

**IT Lead Signature:** _________________________ Date: ___________  
**Dev B Signature:** _________________________ Date: ___________

---

### Gate 4: Content & Brand — Marketing Director Sign-Off

| # | Criterion | Threshold | Evidence Required | Status |
|---|-----------|-----------|-------------------|--------|
| 4.1 | All 287 content entries published | 100% populated | Content Map audit | ☐ PASS / ☐ FAIL |
| 4.2 | All 100+ SKU pages accurate | Specs match master SKU reference | SKU spot-check (20 random) | ☐ PASS / ☐ FAIL |
| 4.3 | Legal pages reviewed by Legal | Written sign-off from Legal | Legal approval email | ☐ PASS / ☐ FAIL |
| 4.4 | Homepage hero messaging approved | Matches brand positioning | Approved creative | ☐ PASS / ☐ FAIL |
| 4.5 | Dubai HQ correctly displayed | No reference to Taipei as HQ | Manual check | ☐ PASS / ☐ FAIL |
| 4.6 | Awards section | Only verified awards with certificate images | CMS audit | ☐ PASS / ☐ FAIL |
| 4.7 | Distributor list current | All authorized partners listed accurately | Sales verification | ☐ PASS / ☐ FAIL |
| 4.8 | Product images quality | ≥ 1200×1200px; transparent PNG where applicable | Image audit | ☐ PASS / ☐ FAIL |
| 4.9 | News content | Minimum 3 published articles | CMS count | ☐ PASS / ☐ FAIL |
| 4.10 | Brand voice consistency | No grammar errors; tone appropriate | Editorial review | ☐ PASS / ☐ FAIL |

**Marketing Director Signature:** _________________________ Date: ___________

---

### Gate 5: SEO & Discoverability — Marketing Director / Dev A Sign-Off

| # | Criterion | Threshold | Evidence Required | Status |
|---|-----------|-----------|-------------------|--------|
| 5.1 | XML sitemap submitted to Google Search Console | Confirmed indexing | GSC screenshot | ☐ PASS / ☐ FAIL |
| 5.2 | XML sitemap submitted to Bing Webmaster Tools | Confirmed | BWT screenshot | ☐ PASS / ☐ FAIL |
| 5.3 | robots.txt valid and crawlable | No disallow on critical pages | robots.txt test | ☐ PASS / ☐ FAIL |
| 5.4 | Canonical URLs on all pages | Zero duplicate content | Spot-check (20 pages) | ☐ PASS / ☐ FAIL |
| 5.5 | Schema.org structured data valid | Rich Results Test passing | Google Rich Results Test | ☐ PASS / ☐ FAIL |
| 5.6 | Hreflang tags on regional pages | 28 countries × EN variant | Source code spot-check | ☐ PASS / ☐ FAIL |
| 5.7 | Meta titles unique and ≤ 60 chars | 100% unique | Screaming Frog / custom audit | ☐ PASS / ☐ FAIL |
| 5.8 | Meta descriptions unique and ≤ 160 chars | 100% unique | Screaming Frog / custom audit | ☐ PASS / ☐ FAIL |
| 5.9 | 301 redirects from legacy URLs | All legacy URLs mapped | Redirect mapping sheet | ☐ PASS / ☐ FAIL |
| 5.10 | Open Graph / Twitter Cards | Present on all page templates | Social sharing debugger | ☐ PASS / ☐ FAIL |

**Marketing Director Signature:** _________________________ Date: ___________  
**Dev A Signature:** _________________________ Date: ___________

---

### Gate 6: Infrastructure & Operations — IT Lead Sign-Off

| # | Criterion | Threshold | Evidence Required | Status |
|---|-----------|-----------|-------------------|--------|
| 6.1 | Production environment stable | 7 days uptime ≥ 99.9% | UptimeRobot report | ☐ PASS / ☐ FAIL |
| 6.2 | Database backup verified | Restore test successful; RPO ≤ 15 min | DR drill report | ☐ PASS / ☐ FAIL |
| 6.3 | Database snapshot at cutover | Snapshot created and ID logged | Snapshot ID | ☐ PASS / ☐ FAIL |
| 6.4 | DNS TTL reduced to 300s | Confirmed in DNS dashboard | DNS screenshot | ☐ PASS / ☐ FAIL |
| 6.5 | Monitoring alerts tested | All alert channels verified (email, Slack) | Alert test log | ☐ PASS / ☐ FAIL |
| 6.6 | Email delivery verified | SPF, DKIM, DMARC passing; inbox delivery | Mail tester | ☐ PASS / ☐ FAIL |
| 6.7 | CDN configuration | Cloudflare WAF + caching active | Cloudflare dashboard | ☐ PASS / ☐ FAIL |
| 6.8 | Staging environment preserved | Hot-standby for rollback | Environment check | ☐ PASS / ☐ FAIL |

**IT Lead Signature:** _________________________ Date: ___________

---

### Gate 7: Forms & Lead Flow — Sales Director / Dev B Sign-Off

| # | Criterion | Threshold | Evidence Required | Status |
|---|-----------|-----------|-------------------|--------|
| 7.1 | General contact form | Submits + auto-reply + routes to sales@ | Inbox test | ☐ PASS / ☐ FAIL |
| 7.2 | Sales/quote request form | Submits + routes to sales@ + CRM | Inbox + CRM test | ☐ PASS / ☐ FAIL |
| 7.3 | Distributor application form | Submits + routes to partners@ + Slack | Inbox + Slack test | ☐ PASS / ☐ FAIL |
| 7.4 | Technical support form | Submits + routes to support@ | Inbox test | ☐ PASS / ☐ FAIL |
| 7.5 | Warranty registration form | Submits + DB record + confirmation email | DB + inbox test | ☐ PASS / ☐ FAIL |
| 7.6 | Newsletter signup | Double opt-in email delivered | Inbox test | ☐ PASS / ☐ FAIL |
| 7.7 | Job application form | Submits + routes to hr@ + CV upload | Inbox + storage test | ☐ PASS / ☐ FAIL |
| 7.8 | Media inquiry form | Submits + routes to press@ | Inbox test | ☐ PASS / ☐ FAIL |
| 7.9 | Feedback form | Submits + routes to feedback@ | Inbox test | ☐ PASS / ☐ FAIL |
| 7.10 | All forms have Cloudflare Turnstile | Bot protection active | Visual inspection | ☐ PASS / ☐ FAIL |

**Sales Director Signature:** _________________________ Date: ___________  
**Dev B Signature:** _________________________ Date: ___________

---

### Gate 8: Analytics & Tracking — Marketing Director / Dev A Sign-Off

| # | Criterion | Threshold | Evidence Required | Status |
|---|-----------|-----------|-------------------|--------|
| 8.1 | GA4 property receiving data | Real-time events visible | GA4 debug view | ☐ PASS / ☐ FAIL |
| 8.2 | GTM container published | Tags firing correctly | GTM preview mode | ☐ PASS / ☐ FAIL |
| 8.3 | Plausible self-hosted receiving data | Pageviews visible | Plausible dashboard | ☐ PASS / ☐ FAIL |
| 8.4 | Sentry error monitoring active | Events received from production | Sentry dashboard | ☐ PASS / ☐ FAIL |
| 8.5 | UptimeRobot monitors active | All endpoints green | UptimeRobot dashboard | ☐ PASS / ☐ FAIL |
| 8.6 | Conversion events tracked | Form submissions, newsletter signups, where-to-buy clicks | GA4 events report | ☐ PASS / ☐ FAIL |
| 8.7 | Cookie consent banner functional | Granular consent + storage + script gating | Manual test | ☐ PASS / ☐ FAIL |

**Marketing Director Signature:** _________________________ Date: ___________  
**Dev A Signature:** _________________________ Date: ___________

---

### Gate 9: Stakeholder UAT — Chairman Input

| # | Criterion | Threshold | Evidence Required | Status |
|---|-----------|-----------|-------------------|--------|
| 9.1 | Stakeholder UAT completion rate | 100% of invited stakeholders completed | UAT attendance log | ☐ PASS / ☐ FAIL |
| 9.2 | Stakeholder satisfaction score | ≥ 4.0 / 5.0 average | Feedback form aggregate | ☐ PASS / ☐ FAIL |
| 9.3 | Chairman/GM approval of homepage | Visual and messaging approved | Signed creative brief | ☐ PASS / ☐ FAIL |
| 9.4 | Competitor parity assessment | 14/14 standard features present | Feature matrix check | ☐ PASS / ☐ FAIL |
| 9.5 | India market readiness | India page with BIS, Supertron placeholder | Page review | ☐ PASS / ☐ FAIL |

**Chairman Signature:** _________________________ Date: ___________

---

## 5. Decision Matrix

### GO

All 9 gates pass (☑). Launch proceeds on schedule.

### GO WITH CONDITIONS

1–3 items marked CONDITIONAL (⚠) with:
- Written mitigation plan
- Assigned owner
- Due date within hypercare period
- No S1 or open S2 defects

Chairman may approve GO WITH CONDITIONS if risk is acceptable.

### NO-GO

Any of the following:
- Any Gate 1 item (QA) FAIL
- Any Gate 3 item (Security) FAIL
- Any Gate 6 item (Infrastructure) FAIL
- > 3 items FAIL across all gates
- Any S1 defect without fix plan

**Action on NO-GO:**
1. Document blockers with owners and ETAs.
2. Revise launch timeline.
3. Schedule follow-up Go/No-Go within 72 hours of blocker resolution.

---

## 6. Sign-Off Record

### Pre-Soft-Launch Go/No-Go (Week 18)

| Role | Name | Decision | Signature | Date |
|------|------|----------|-----------|------|
| Chairman | Mohd Mazharul Islam | ☐ GO ☐ GO WITH CONDITIONS ☐ NO-GO | | |
| GM Dubai | Robiul Islam | ☐ CONCUR ☐ NON-CONCUR | | |
| Marketing Director | | ☐ CONCUR ☐ NON-CONCUR | | |
| Sales Director | | ☐ CONCUR ☐ NON-CONCUR | | |
| IT/Technical Lead | | ☐ CONCUR ☐ NON-CONCUR | | |
| QA Lead | | ☐ CONCUR ☐ NON-CONCUR | | |
| Unisoft Team Lead | | ☐ CONCUR ☐ NON-CONCUR | | |

### Pre-Public-Launch Go/No-Go (Week 20)

| Role | Name | Decision | Signature | Date |
|------|------|----------|-----------|------|
| Chairman (or delegate) | | ☐ GO ☐ GO WITH CONDITIONS ☐ NO-GO | | |
| GM Dubai | Robiul Islam | ☐ CONCUR ☐ NON-CONCUR | | |
| Marketing Director | | ☐ CONCUR ☐ NON-CONCUR | | |
| IT/Technical Lead | | ☐ CONCUR ☐ NON-CONCUR | | |
| QA Lead | | ☐ CONCUR ☐ NON-CONCUR | | |

---

## 7. Post-Decision Actions

### If GO

1. IT Lead executes DNS cutover per `TwinMOSWebsiteDNSMigrationPlan.md`.
2. Marketing Director activates communication plan per `TwinMOSWebsiteLaunch_Plan.md`.
3. Dev A + Dev B begin hypercare per `TwinMOSWebsiteHypercare_Plan.md`.
4. QA Lead monitors for 48 hours; reports daily.

### If GO WITH CONDITIONS

1. Document conditions in project tracker with P0 priority.
2. Assign owners and due dates before end of hypercare.
3. Launch proceeds; conditions tracked in daily standup.

### If NO-GO

1. Chairman communicates decision to all stakeholders within 4 hours.
2. Project Manager publishes revised timeline within 24 hours.
3. Blockers assigned owners; daily checkpoint until resolved.
4. Next Go/No-Go scheduled automatically upon blocker resolution.

---

*This checklist is the single source of truth for launch authorization. No verbal approvals supersede this document.*
