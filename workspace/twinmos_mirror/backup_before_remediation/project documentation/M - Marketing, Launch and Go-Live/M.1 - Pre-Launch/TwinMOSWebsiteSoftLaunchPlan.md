# TwinMOS Corporate Website — Soft Launch Plan

**Document Reference:** TWN-MKT-SOFT-2026-001  
**Document Version:** 1.0  
**Status:** FINAL  
**Date:** 30 April 2026  
**Prepared by:** TwinMOS Digital Transformation Team  
**Owner:** Marketing Director  
**Audience:** TwinMOS staff, key distributors, project team  
**Classification:** CONFIDENTIAL — Internal Use Only  
**Synchronized With:** BRD v3.0, RFP v3.0, URD v3.0, Tech Stack v1.1, Launch Plan v1.0

---

## 1. Purpose

The Soft Launch is a **controlled, limited-audience release** of the rebuilt TwinMOS.com designed to validate production stability, gather real-world feedback, and identify last-mile defects before exposing the site to global public traffic.

The current TwinMOS website has **51 critical issues** and **23 high-priority issues** (Forensic Audit v1.0). The soft launch ensures we do not replace a broken site with another broken site.

---

## 2. Soft Launch Principles

1. **Limited Exposure:** Only invited stakeholders have access; no public announcement.
2. **Real Data, Real Usage:** Forms, analytics, and monitoring are fully active.
3. **Feedback-Driven:** Structured feedback collection with 24-hour turnaround on critical issues.
4. **Safe Rollback:** DNS remains pointed to legacy; soft launch uses a temporary subdomain or IP-restricted access.
5. **No Marketing:** Zero social media, press releases, or paid campaigns during soft launch.

---

## 3. Soft Launch Audience

| Group | Approx. Size | Rationale | Access Method |
|-------|-------------|-----------|---------------|
| **TwinMOS HQ Staff** (Dubai) | 15–25 | Daily users; content accuracy verification | IP whitelist + login |
| **TwinMOS India Team** (New Delhi) | 5–10 | Regional content verification | IP whitelist + login |
| **Smart Technologies (BD) Ltd.** | 3–5 | Key distributor; Bangladesh market validation | Unique preview link + password |
| **Achiever Computers (ACL)** — UAE | 2–3 | Key distributor; MEA market validation | Unique preview link + password |
| **Tech Valley Distribution** — BD | 2–3 | Distributor partner | Unique preview link + password |
| **Ryans IT / Star Tech** — BD | 2–3 | Retail partner feedback | Unique preview link + password |
| **Supertron Electronics** — India | 2–3 | Proposed India exclusive distributor | Unique preview link + password |
| **Project Team** (Unisoft + TwinMOS PM) | 4–6 | Technical observation | Direct access |
| **Legal/Compliance Reviewer** | 1–2 | Legal page accuracy | Direct access |
| **Total Estimated Audience** | **40–60 people** | | |

---

## 4. Access Methods

### Method A: Staging Domain (Primary)

- **URL:** `https://preview.twinmos.com` (subdomain on Cloudflare)
- **Protection:** HTTP Basic Auth (shared credentials rotated post-launch)
- **Purpose:** Full-site browsing without DNS changes

### Method B: IP Whitelist (Internal Staff)

- **Scope:** Dubai HQ static IP + India office static IP
- **Purpose:** Unrestricted access for staff working from offices

### Method C: Password-Protected Preview Links (External Partners)

- **Format:** `https://preview.twinmos.com/?token=UUID`
- **Expiry:** 7 days from issue; renewable
- **Tracking:** Per-token analytics to understand which partner viewed what

---

## 5. Soft Launch Duration

| Phase | Duration | Activities |
|-------|----------|------------|
| **Day 1–2: Orientation** | 48 hours | Welcome emails sent; guided tour video shared; stakeholders explore independently |
| **Day 3–5: Structured Testing** | 72 hours | Feedback forms distributed; focus on assigned sections per stakeholder role |
| **Day 6: Feedback Triage** | 24 hours | QA Lead collates feedback; defects prioritized; fix plan created |
| **Day 7: Fix & Re-test** | 24 hours | Critical fixes deployed; stakeholders re-verify |

**Total soft launch window:** 7 calendar days (Week 19)

---

## 6. Stakeholder Testing Assignments

### Marketing Team (Dubai + India)

| Section | Focus Areas | Acceptance Criteria |
|---------|-------------|---------------------|
| Homepage | Hero messaging, trust band, category grid | Brand voice consistent; no typos |
| About | History, leadership bios, manufacturing | Facts accurate per Company Profile v2.0 |
| News/Events | Article layout, event templates | Publish workflow smooth |
| Product Catalog | SKU accuracy, spec tables, images | All 100+ SKUs verified against master list |
| Legal/Compliance | Privacy policy, terms, cookie banner | Legal sign-off |

### Sales Team

| Section | Focus Areas | Acceptance Criteria |
|---------|-------------|---------------------|
| Where to Buy | Distributor list accuracy, map pins, contact info | All authorized distributors listed correctly |
| Contact Forms | Quote request, distributor inquiry | Forms route to correct emails; auto-reply works |
| Partner Portal (placeholder) | Login skeleton, asset library preview | Navigation intuitive |
| Regional Pages | India, Bangladesh, UAE-GCC, Africa | Local distributor info accurate |

### Distributor Partners

| Partner | Assigned Focus | Specific Checks |
|---------|---------------|-----------------|
| Smart Tech BD | Bangladesh page, product availability | Local pricing references, contact details |
| Achiever Computers | UAE-GCC page, MEA distributor list | Map accuracy, retailer types |
| Supertron Electronics | India page, BIS certification display | India-specific content prominence |
| Ryans IT / Star Tech | Product pages, where-to-buy | Deep links to retailer sites |

### Technical Team (Unisoft + TwinMOS IT)

| Area | Focus | Tools |
|------|-------|-------|
| Performance | Page load on real devices (3G/4G) | Lighthouse, WebPageTest |
| Forms | All 15 form types, submission flow, email delivery | Manual + Sentry |
| Search | MeiliSearch relevance, auto-suggest | Direct queries |
| Compatibility Finder | MVP accuracy, mobile usability | Test with real device models |
| Analytics | GA4 events, Plausible pageviews, Sentry errors | Dashboard verification |
| CMS | Content editing, publishing, media upload | Strapi admin walkthrough |

---

## 7. Feedback Collection

### 7.1 Feedback Channels

| Channel | Purpose | Response SLA |
|---------|---------|--------------|
| **Structured Google Form** | Standardized feedback (rating + comments) | N/A |
| **Slack #soft-launch-feedback** | Real-time questions, screenshots, quick issues | 4 hours |
| **Email softlaunch@twinmos.com** | Detailed feedback, attachments | 12 hours |
| **Weekly Feedback Call** | Group discussion with distributors (optional) | N/A |

### 7.2 Feedback Form Structure

```
1. Your name, company, role
2. Section tested (dropdown: Homepage / Products / Support / etc.)
3. Device used (Mobile / Tablet / Desktop)
4. Browser used
5. Rating (1–5): Overall experience
6. Rating (1–5): Ease of finding information
7. Rating (1–5): Visual design / brand alignment
8. Issues found (free text + screenshot upload)
9. Suggestions for improvement
10. Would you recommend this site to a customer? (Yes / No / With reservations)
```

### 7.3 Issue Severity Classification

| Severity | Definition | Example | Response |
|----------|------------|---------|----------|
| **S1 — Critical** | Blocks core function; brand-damaging | Product page 404, form not submitting, incorrect HQ address | Fix within 24 hours |
| **S2 — High** | Significant UX degradation | Broken image, missing spec table, wrong distributor phone | Fix within 48 hours |
| **S3 — Medium** | Minor UX issue; cosmetic | Typography inconsistency, slow image load, awkward phrasing | Fix within 1 week (hypercare) |
| **S4 — Low** | Nice-to-have enhancement | Additional filter option, different color preference | Backlog for Phase 2 |

---

## 8. Soft Launch Success Criteria

| Criterion | Threshold | Measurement |
|-----------|-----------|-------------|
| Zero S1 defects reported | Must pass | Issue tracker |
| S2 defects ≤ 5 | Must pass | Issue tracker |
| Stakeholder satisfaction rating ≥ 4.0 / 5.0 | Must pass | Feedback form average |
| All 15 form types submit successfully | Must pass | Functional test |
| Analytics events fire correctly | Must pass | GA4 / Plausible debug |
| Zero security incidents | Must pass | Security monitoring |
| Uptime during soft launch ≥ 99.9% | Must pass | UptimeRobot |
| CMS admin accessible and functional for Marketing | Must pass | Admin walkthrough |

**If all criteria pass:** Proceed to Public Launch (Week 20).  
**If criteria fail:** Extend soft launch or delay public launch per Go/No-Go decision.

---

## 9. Communication Templates

### 9.1 Soft Launch Invitation Email

**Subject:** Exclusive Preview: The New TwinMOS.com — Your Feedback Needed

```
Dear [Name],

We are excited to invite you to an exclusive preview of the completely rebuilt TwinMOS.com.

As a valued [partner/colleague], your feedback is critical to ensuring the new site serves our global customers and partners effectively.

PREVIEW DETAILS:
- URL: https://preview.twinmos.com
- Access Code: [UUID or credentials]
- Preview Window: [Date] through [Date]
- Feedback Deadline: [Date]

WHAT TO EXPECT:
- New product catalog with 100+ SKUs
- "Where to Buy" locator with map
- Compatibility finder for RAM and SSD upgrades
- Fresh news and events center
- Streamlined contact and distributor inquiry forms

YOUR FOCUS:
[Assigned section from §6]

Please submit feedback via: [Google Form link]
For urgent issues, email: softlaunch@twinmos.com

Thank you for helping us launch with confidence.

Best regards,
[Marketing Director]
TwinMOS Technologies
```

### 9.2 Soft Launch Daily Update (Internal)

**Subject:** Soft Launch Day [N] — Status Update

```
Soft Launch Progress — Day [N]

Feedback Received: [X] responses
Issues Logged: [Y] total ([A] S1, [B] S2, [C] S3)
Fixed Today: [Z]
Top Issues:
1. [Issue summary] — Owner — ETA
2. [Issue summary] — Owner — ETA

Tomorrow's Focus: [Activity]
```

---

## 10. Rollback & Safety

| Scenario | Action | Owner |
|----------|--------|-------|
| Multiple S1 defects found | Extend soft launch by 3–5 days; fix and re-test | Marketing Director |
| Security vulnerability discovered | Immediately restrict access; fix before re-opening | IT Lead |
| Major stakeholder dissatisfaction | Schedule emergency call; address concerns; decide go/no-go | Chairman |
| Preview site goes down | Investigate; restore from snapshot; communicate downtime | Dev A |

---

## 11. Soft Launch to Public Launch Transition

```
Soft Launch End (Day 7)
    ↓
Feedback Triage & Fix (Day 7–8)
    ↓
Go/No-Go Meeting (Day 8)
    ↓
[GO] → Public Launch Prep (Day 9)
    ↓
DNS Cutover (Day 10 = Week 20)
    ↓
Public Launch + Hypercare

[NO-GO] → Extended Soft Launch or Delay
    ↓
Re-plan with revised timeline
```

---

*This plan is a sub-document of the Master Launch Plan (`TwinMOSWebsiteLaunch_Plan.md`). All decisions during soft launch are logged in the project issue tracker.*
