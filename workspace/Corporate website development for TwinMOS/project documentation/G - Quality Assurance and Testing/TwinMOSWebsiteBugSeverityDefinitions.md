# Bug Severity Definitions

**Document Reference:** TWN-QA-SEVERITY-2026-001
**Document Version:** 1.0
**Status:** FINAL
**Date:** 2 May 2026
**Priority:** P1
**Prepared by:** QA Lead — TwinMOS Digital Transformation Team
**Owner:** QA Lead
**Distribution:** QA Team, Developers, Project Manager, Tech Lead, Product Manager
**Synchronized With:** Bug Triage Process, QA Strategy v1.0, BRD v3.0 §32

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2 May 2026 | QA Lead | Initial release with severity levels, assignment criteria, and examples for all project modules |

---

## Table of Contents

1. [Purpose & Scope](#1-purpose--scope)
2. [Severity Level Overview](#2-severity-level-overview)
3. [Critical Severity](#3-critical-severity)
4. [High Severity](#4-high-severity)
5. [Medium Severity](#5-medium-severity)
6. [Low Severity](#6-low-severity)
7. [Severity by Module](#7-severity-by-module)
8. [Severity Escalation & De-escalation](#8-severity-escalation--de-escalation)
9. [Severity vs. Priority](#9-severity-vs-priority)
10. [Appendix A: Severity Decision Tree](#appendix-a-severity-decision-tree)

---

## 1. Purpose & Scope

### 1.1 Purpose

This document provides **clear, unambiguous definitions** for each bug severity level used in the TwinMOS corporate website project. It ensures consistent severity assignment across all team members, enables accurate SLA tracking, and supports data-driven quality decisions.

### 1.2 Scope

**In scope:**
- Severity definitions for all defect types
- Severity assignment criteria and examples
- Module-specific severity guidance
- Escalation and de-escalation rules
- Relationship between severity and priority

**Out of scope:**
- Priority definitions (see Bug Triage Process)
- Bug reporting templates (see Bug Triage Process)
- SLA calculations (see Bug Triage Process)

---

## 2. Severity Level Overview

### 2.1 Severity Matrix

| Severity | Impact | User Impact | Business Impact | Fix SLA | Color Code |
|----------|--------|-------------|-----------------|---------|------------|
| **Critical** | System unusable | Cannot complete primary tasks | Revenue loss, legal risk, data loss | 24 hours | Red |
| **High** | Major feature broken | Workaround difficult or unclear | Significant UX degradation | 72 hours | Orange |
| **Medium** | Feature partially broken | Workaround exists | Minor UX impact | 5 days | Blue |
| **Low** | Cosmetic / edge case | Minimal or no impact | Negligible impact | 2 weeks | Gray |

### 2.2 Severity Assignment Principles

1. **Severity is objective** — based on impact, not effort to fix
2. **Severity is user-centric** — based on user impact, not code complexity
3. **Severity is consistent** — same criteria applied regardless of who reports
4. **Severity can change** — may be escalated or de-escalated based on new information
5. **Severity != Priority** — severity is impact; priority is when to fix

---

## 3. Critical Severity

### 3.1 Definition

> **Critical:** A defect that makes the system completely unusable for one or more primary user personas, causes data loss or corruption, exposes a security vulnerability, or violates legal/compliance requirements. No workaround exists.

### 3.2 Assignment Criteria

A defect is Critical if ANY of the following are true:

| Criterion | Description |
|-----------|-------------|
| **System down** | Website returns 500 errors or does not load |
| **Data loss** | User data is lost, corrupted, or incorrectly persisted |
| **Security breach** | Authentication bypass, SQL injection, XSS, CSRF |
| **Compliance violation** | GDPR, UAE PDPL, or other legal requirement broken |
| **Revenue block** | E-commerce checkout completely broken (P3) |
| **Primary task blocked** | > 50% of users cannot complete their main goal |
| **Production data risk** | Defect could corrupt production database |

### 3.3 Critical Examples

| Module | Example | Reason |
|--------|---------|--------|
| Homepage | Homepage returns 500 error for all users | System unusable |
| Product Catalog | All product images return 404 | Cannot evaluate products |
| Search | MeiliSearch down, search returns no results | Primary discovery path broken |
| Forms | Contact form deletes submissions instead of saving | Data loss |
| Auth | Partner portal authentication bypass | Security breach |
| E-commerce | Stripe checkout charges but order not created | Revenue + data loss |
| CMS | CMS delete operation wipes all products | Production data risk |
| Security | XSS vulnerability in product review | Security breach |
| Compliance | Cookie consent not recorded, violates GDPR | Compliance violation |

### 3.4 Critical Response

| Action | Timeframe | Owner |
|--------|-----------|-------|
| Notification | Immediate | Automated (PagerDuty/Slack) |
| Acknowledgment | 1 hour | Tech Lead |
| Fix in progress | 4 hours | Assigned Developer |
| Fix deployed | 24 hours | DevOps |
| Verification | 4 hours after deploy | QA Lead |

---

## 4. High Severity

### 4.1 Definition

> **High:** A defect that significantly impairs a major feature or user journey, making it difficult for users to complete primary tasks. A workaround may exist but is non-obvious, cumbersome, or unacceptable for the target user persona.

### 4.2 Assignment Criteria

A defect is High if ANY of the following are true:

| Criterion | Description |
|-----------|-------------|
| **Major feature broken** | Core feature does not work as designed |
| **Primary journey blocked** | Critical path has significant friction |
| **Workaround difficult** | Workaround exists but is not user-friendly |
| **Mobile unusable** | Feature broken on mobile (55-80% of users) |
| **Accessibility blocker** | Screen reader users cannot complete task |
| **Performance degradation** | Page load > 5 seconds on standard connection |
| **Cross-browser failure** | Feature broken on Tier 1 browser |
| **Data inconsistency** | Displayed data is incorrect but not lost |

### 4.3 High Examples

| Module | Example | Reason |
|--------|---------|--------|
| Homepage | Hero carousel does not auto-play | Major feature broken |
| Product Catalog | Filter by price shows incorrect results | Data inconsistency |
| Product Detail | "Add to Compare" button does nothing | Primary journey blocked |
| Compatibility | Search by motherboard returns no results | Major feature broken |
| Where to Buy | Map does not load on mobile | Mobile unusable |
| Forms | Email validation rejects valid emails | Primary journey blocked |
| Partner Portal | Price list PDF generates but is blank | Major feature broken |
| E-commerce | Cart shows incorrect total | Data inconsistency |
| Accessibility | Keyboard users cannot access main navigation | Accessibility blocker |
| Mobile | Hamburger menu unresponsive on iOS | Mobile unusable |

### 4.4 High Response

| Action | Timeframe | Owner |
|--------|-----------|-------|
| Triage | 24 hours | QA Lead |
| Assignment | 24 hours | Tech Lead |
| Fix | 72 hours (3 days) | Assigned Developer |
| Verification | 24 hours after fix | QA Lead |

---

## 5. Medium Severity

### 5.1 Definition

> **Medium:** A defect that partially impairs a feature or causes a suboptimal user experience. A clear workaround exists, or the issue affects a non-critical feature. Users can complete their tasks with minor inconvenience.

### 5.2 Assignment Criteria

A defect is Medium if ANY of the following are true:

| Criterion | Description |
|-----------|-------------|
| **Feature partially works** | Feature functions but with limitations |
| **Workaround exists** | Clear, user-friendly workaround available |
| **Non-critical feature** | Feature not on critical path |
| **Visual inconsistency** | UI does not match design but is functional |
| **Minor data issue** | Display formatting incorrect, data is accurate |
| **Edge case** | Occurs only under specific, uncommon conditions |
| **Tier 2 browser issue** | Feature broken on Samsung Internet or Firefox |
| **Performance minor** | Slight delay, not impacting task completion |

### 5.3 Medium Examples

| Module | Example | Reason |
|--------|---------|--------|
| Homepage | Trust bar logos slightly misaligned | Visual inconsistency |
| Product Catalog | Sort by "Newest" shows oldest first | Feature partially works |
| Product Detail | Image gallery shows 4 of 5 images | Feature partially works |
| Compatibility | Results show compatible products but no specs | Feature partially works |
| Where to Buy | Retailer phone number formatting inconsistent | Minor data issue |
| Forms | Success message disappears too quickly | Non-critical feature |
| CMS | Bulk import accepts CSV but ignores one column | Feature partially works |
| Search | Typo tolerance does not catch "DDR%" | Edge case |
| Mobile | Pull-to-refresh triggers on product list | Edge case |
| Cross-browser | Button hover effect missing on Firefox | Tier 2 browser issue |

### 5.4 Medium Response

| Action | Timeframe | Owner |
|--------|-----------|-------|
| Triage | 48 hours | QA Lead |
| Assignment | 48 hours | Tech Lead |
| Fix | 5 days | Assigned Developer |
| Verification | 24 hours after fix | QA Lead |

---

## 6. Low Severity

### 6.1 Definition

> **Low:** A cosmetic defect, minor inconsistency, or edge case that has negligible impact on user experience or business outcomes. Users may not notice the issue, or it occurs only in rare circumstances.

### 6.2 Assignment Criteria

A defect is Low if ALL of the following are true:

| Criterion | Description |
|-----------|-------------|
| **Cosmetic only** | Does not affect functionality |
| **No user impact** | Users can complete all tasks normally |
| **Rare occurrence** | Occurs in < 1% of sessions |
| **Tier 3 browser** | Issue on Edge, Opera, or UC Browser |
| **Design nitpick** | Pixel-level difference from Figma |
| **Content typo** | Minor spelling or grammar error |
| **Deprecated feature** | Issue on feature planned for removal |

### 6.3 Low Examples

| Module | Example | Reason |
|--------|---------|--------|
| Homepage | Hero slide transition is 50ms slower than spec | Cosmetic only |
| Product Catalog | Category card shadow is 1px off on hover | Design nitpick |
| Product Detail | Spec table header font weight is 500 not 600 | Design nitpick |
| Forms | Placeholder text has extra space | Content typo |
| Footer | Copyright year says 2025 not 2026 | Content typo |
| Mobile | Status bar color does not match header on Android | Tier 3 cosmetic |
| Cross-browser | Scrollbar styling missing on Edge | Tier 3 browser |
| Accessibility | Focus ring color is #0056D6 not #0056D8 | Cosmetic only |
| Performance | Unused CSS adds 2KB to bundle | No user impact |
| CMS | Admin UI button has inconsistent border radius | No user impact |

### 6.4 Low Response

| Action | Timeframe | Owner |
|--------|-----------|-------|
| Triage | 1 week | QA Lead |
| Assignment | Next available sprint | Tech Lead |
| Fix | 2 weeks | Assigned Developer |
| Verification | 24 hours after fix | QA Lead |

---

## 7. Severity by Module

### 7.1 Homepage

| Severity | Examples |
|----------|----------|
| Critical | 500 error, complete blank page, security vulnerability |
| High | Hero carousel broken, navigation unresponsive, CTA buttons dead |
| Medium | Trust bar missing one logo, news section not updating |
| Low | Animation timing slightly off, pixel-level spacing issue |

### 7.2 Product Catalog

| Severity | Examples |
|----------|----------|
| Critical | All products 404, database corruption, checkout data loss |
| High | Filter completely broken, sort not working, images missing |
| Medium | One filter option missing, pagination off by one, slow load |
| Low | Card shadow incorrect, hover effect missing, minor spacing |

### 7.3 Product Detail

| Severity | Examples |
|----------|----------|
| Critical | Page 500 error, XSS in product description, data corruption |
| High | Datasheet download fails, specs missing, gallery broken |
| Medium | One spec incorrect, related products not showing, zoom glitch |
| Low | Image caption typo, spacing issue, minor color mismatch |

### 7.4 Compatibility Finder

| Severity | Examples |
|----------|----------|
| Critical | Database query exposes sensitive data, complete failure |
| High | Search returns no results, incompatible products shown |
| Medium | Results missing capacity info, search slow, UI glitch |
| Low | Suggestion dropdown styling off, minor text alignment |

### 7.5 Where to Buy

| Severity | Examples |
|----------|----------|
| Critical | Map API key exposed, distributor data leaked |
| High | Map does not load, retailers missing, filter broken |
| Medium | Pin location slightly off, one retailer missing phone |
| Low | Map zoom controls styled differently, minor UI issue |

### 7.6 Forms

| Severity | Examples |
|----------|----------|
| Critical | Form submission causes data loss, injection vulnerability |
| High | Form does not submit, validation broken, emails not sent |
| Medium | One validation rule too strict, success message unclear |
| Low | Field label spacing, placeholder text color, minor typo |

### 7.7 Partner Portal (Phase 2)

| Severity | Examples |
|----------|----------|
| Critical | Auth bypass, price list data exposed, session hijacking |
| High | Login fails, dashboard empty, PDF generation broken |
| Medium | One report missing data, notification delayed, UI glitch |
| Low | Chart color mismatch, minor spacing in table |

### 7.8 E-commerce (Phase 3)

| Severity | Examples |
|----------|----------|
| Critical | Payment processed but order not created, PCI violation |
| High | Cart empty on refresh, checkout flow broken, tax wrong |
| Medium | Coupon code not applying, shipping estimate off |
| Low | Order confirmation email formatting, minor UI issue |

---

## 8. Severity Escalation & De-escalation

### 8.1 Escalation Rules

A severity may be escalated when:

| Condition | From | To | Authority |
|-----------|------|-----|-----------|
| Affects more users than initially estimated | Medium/High | High/Critical | QA Lead |
| Discovered in production (not caught in testing) | Any | +1 level | QA Lead |
| Security impact discovered after initial triage | Any | Critical | Security Lead |
| Compliance deadline approaching | Any | +1 level | Project Manager |
| Customer-impacting (reported by distributor) | Any | +1 level | Product Manager |

### 8.2 De-escalation Rules

A severity may be de-escalated when:

| Condition | From | To | Authority |
|-----------|------|-----|-----------|
| Workaround discovered that is user-friendly | High | Medium | QA Lead |
| Affects fewer users than initially estimated | High/Medium | Medium/Low | QA Lead |
| Fix reveals root cause is less severe | Any | -1 level | Tech Lead |
| Feature is deprecated and will be removed | Any | Low | Product Manager |

### 8.3 Escalation Process

```
New information received
      |
      v
Does it change impact assessment?
|-- NO --> Maintain current severity
|
|-- YES
      |
      v
Propose severity change
      |
      v
Notify stakeholders (Slack #qa-triage)
      |
      v
Update issue label and SLA
      |
      v
Log reason for change in issue comments
```

---

## 9. Severity vs. Priority

### 9.1 Key Differences

| Aspect | Severity | Priority |
|--------|----------|----------|
| **Definition** | Impact of the defect | Order in which to fix |
| **Driven by** | User impact, business risk | Sprint goals, capacity, dependencies |
| **Who sets** | QA Lead | Tech Lead + Product Manager |
| **Can change** | Yes, based on new impact info | Yes, based on sprint planning |
| **Relationship** | Severity informs priority | Priority determines schedule |

### 9.2 Common Combinations

| Severity | Priority | Scenario |
|----------|----------|----------|
| Critical | P0 | Production outage, security breach |
| Critical | P1 | Critical bug found in development |
| High | P0 | Release blocker, major feature broken |
| High | P1 | High bug in current sprint |
| Medium | P1 | Medium bug on critical path |
| Medium | P2 | Medium bug, workaround exists |
| Low | P2 | Low bug affecting sprint goal |
| Low | P3 | Cosmetic issue, fix when free |

### 9.3 When Severity and Priority Diverge

| Scenario | Severity | Priority | Reason |
|----------|----------|----------|--------|
| Critical bug in deprecated feature | Critical | P2 | Feature being removed |
| Low bug on landing page for campaign | Low | P1 | Business deadline |
| High bug with complex fix | High | P2 | Capacity constraint |
| Medium bug blocking another fix | Medium | P0 | Dependency chain |

---

## Appendix A: Severity Decision Tree

```
Defect Reported
      |
      v
Does it prevent users from completing primary tasks?
|-- YES
      |
      v
Is there a workaround?
|-- NO --> CRITICAL
|-- YES --> HIGH
|
|-- NO
      |
      v
Does it significantly impair a major feature?
|-- YES
      |
      v
Is the workaround obvious and easy?
|-- NO --> HIGH
|-- YES --> MEDIUM
|
|-- NO
      |
      v
Does it partially impair a feature or have a workaround?
|-- YES --> MEDIUM
|-- NO --> LOW
```

### Quick Severity Checklist

- [ ] Does the system crash or become unusable? -> Critical
- [ ] Is user data lost or corrupted? -> Critical
- [ ] Is there a security vulnerability? -> Critical
- [ ] Is a major feature completely broken? -> High
- [ ] Is the primary user journey blocked? -> High
- [ ] Is the workaround difficult or unclear? -> High
- [ ] Does the feature work but with limitations? -> Medium
- [ ] Is there a clear, easy workaround? -> Medium
- [ ] Is this a cosmetic or visual issue only? -> Low
- [ ] Does this affect < 1% of users? -> Low
- [ ] Is this on a Tier 3 browser only? -> Low

---

**End of Document**
