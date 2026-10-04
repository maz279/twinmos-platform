# Bug Triage Process

**Document Reference:** TWN-QA-TRIAGE-2026-001
**Document Version:** 1.0
**Status:** FINAL
**Date:** 2 May 2026
**Priority:** P1
**Prepared by:** QA Lead — TwinMOS Digital Transformation Team
**Owner:** QA Lead
**Distribution:** QA Team, Developers, Project Manager, Tech Lead, Product Manager
**Synchronized With:** QA Strategy v1.0, Bug Severity Definitions, Sprint Backlog

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2 May 2026 | QA Lead | Initial release with triage workflow, roles, SLAs, and tool configuration |

---

## Table of Contents

1. [Purpose & Scope](#1-purpose--scope)
2. [Triage Workflow Overview](#2-triage-workflow-overview)
3. [Triage Roles & Responsibilities](#3-triage-roles--responsibilities)
4. [Triage Meeting Schedule](#4-triage-meeting-schedule)
5. [Bug Lifecycle](#5-bug-lifecycle)
6. [Triage Decision Matrix](#6-triage-decision-matrix)
7. [Severity Assignment](#7-severity-assignment)
8. [Priority Assignment](#8-priority-assignment)
9. [SLA Definitions](#9-sla-definitions)
10. [Tool Configuration](#10-tool-configuration)
11. [Metrics & Reporting](#11-metrics--reporting)
12. [Appendix A: Triage Checklist](#appendix-a-triage-checklist)

---

## 1. Purpose & Scope

### 1.1 Purpose

This document defines the **bug triage process** for the TwinMOS corporate website project. Triage is the systematic review, prioritization, and assignment of defects to ensure that critical issues are addressed promptly and resources are allocated effectively. This process ensures no defect falls through the cracks and that stakeholder expectations are managed transparently.

### 1.2 Scope

**In scope:**
- All defects found during testing (unit, integration, E2E, UAT, production)
- All defects reported by users, stakeholders, or monitoring systems
- Security vulnerabilities (coordinated with Security Test Plan)
- Performance regressions (coordinated with Performance Test Plan)
- Accessibility violations (coordinated with Accessibility Test Plan)

**Out of scope:**
- Feature requests (routed to Product Backlog)
- Technical debt items (routed to Engineering Backlog)
- Infrastructure incidents (handled by DevOps Runbooks)

---

## 2. Triage Workflow Overview

### 2.1 High-Level Flow

```
Defect Reported
      |
      v
Initial Review (within 4 hours)
      |
      +-- Duplicate? --> Close as duplicate, link to original
      |
      +-- Not a defect? --> Close with explanation
      |
      +-- Needs more info? --> Request info, set status "Need Info"
      |
      +-- Valid defect? --> Proceed to triage
      |
      v
Triage Meeting (daily)
      |
      +-- Assign severity (Critical/High/Medium/Low)
      |
      +-- Assign priority (P0/P1/P2/P3)
      |
      +-- Assign to developer
      |
      +-- Set target sprint/milestone
      |
      v
Development & Fix
      |
      v
Fix Verification (QA)
      |
      +-- Pass? --> Close defect
      |
      +-- Fail? --> Reopen, return to developer
```

### 2.2 Triage Stages

| Stage | Timeframe | Activity | Owner |
|-------|-----------|----------|-------|
| **Intake** | Immediate | Log defect with all required fields | Reporter |
| **Initial Review** | Within 4 hours | Validate, reproduce, categorize | QA Lead |
| **Triage Meeting** | Daily 10:00 AM | Assign severity, priority, owner | QA Lead + Tech Lead |
| **Assignment** | Within 24 hours | Developer accepts and estimates | Assigned Developer |
| **Fix** | Per SLA | Code fix and unit tests | Assigned Developer |
| **Verification** | Within 24 hours of fix | QA validates fix | QA Lead |
| **Closure** | After verification | Close with resolution notes | QA Lead |

---

## 3. Triage Roles & Responsibilities

### 3.1 Role Definitions

| Role | Responsibilities | Authority |
|------|------------------|-----------|
| **QA Lead** | Triage meeting chair, severity assignment, verification | Can assign severity, priority, close defects |
| **Tech Lead** | Technical assessment, effort estimation, resource allocation | Can reassign, escalate, change priority |
| **Developer** | Fix defects, write tests, update status | Can change status to "In Progress", "Resolved" |
| **Product Manager** | Business impact assessment, scope decisions | Can approve "Won't Fix", change priority |
| **Project Manager** | SLA tracking, reporting, escalation | Can escalate, generate reports |
| **Reporter** | File defect with clear reproduction steps | Can add comments, attach evidence |

### 3.2 RACI Matrix for Triage Activities

| Activity | QA Lead | Tech Lead | Developer | Product Manager | Project Manager |
|----------|:-------:|:---------:|:---------:|:---------------:|:---------------:|
| Log defect | C | I | I | I | I |
| Initial review | R | C | I | I | I |
| Reproduce defect | R | C | I | I | I |
| Assign severity | R | A | C | C | I |
| Assign priority | R | A | C | A | I |
| Assign developer | C | R | I | I | I |
| Estimate effort | I | C | R | I | I |
| Fix defect | I | I | R | I | I |
| Verify fix | R | C | I | I | I |
| Close defect | R | I | I | I | I |
| Approve "Won't Fix" | C | C | I | A | I |
| Escalate | C | R | I | C | R |

**Legend:** R = Responsible, A = Accountable, C = Consulted, I = Informed

---

## 4. Triage Meeting Schedule

### 4.1 Daily Triage Meeting

| Attribute | Detail |
|-----------|--------|
| **Frequency** | Daily, Monday–Friday |
| **Time** | 10:00 AM (30 minutes) |
| **Duration** | 30 minutes (hard stop) |
| **Attendees** | QA Lead (chair), Tech Lead, Product Manager |
| **Optional** | Developers with assigned defects |
| **Location** | Video call / Slack huddle |

### 4.2 Meeting Agenda

1. **New defects (0–10 min)**
   - Review defects reported since last triage
   - Assign severity and priority
   - Assign to developer or request more info

2. **In-progress defects (10–20 min)**
   - Review defects in "In Progress" status
   - Check for blockers or delays
   - Reassign if needed

3. **Resolved defects awaiting verification (20–25 min)**
   - Review defects marked "Resolved"
   - Assign QA verification
   - Identify any verification blockers

4. **Escalations and blockers (25–30 min)**
   - Review any SLA breaches
   - Discuss critical defects needing attention
   - Plan for upcoming releases

### 4.3 Triage Meeting Rules

- Start and end on time
- No laptops (except note-taker)
- Each defect gets max 2 minutes of discussion
- If more discussion needed, schedule separate meeting
- Decisions are final during the meeting (no revisiting)
- Meeting notes posted to Slack #qa-triage within 1 hour

---

## 5. Bug Lifecycle

### 5.1 Status Workflow

```
[New] --> [Under Review] --> [Triaged]
                              |
              +---------------+---------------+
              |               |               |
              v               v               v
         [Need Info]    [Assigned]      [Won't Fix]
              |               |               |
              v               v               v
         [Under Review]  [In Progress]    [Closed]
                              |
                              v
                         [Resolved]
                              |
                              v
                    [Under Verification]
                              |
              +---------------+---------------+
              |                               |
              v                               v
         [Closed]                        [Reopened]
                                              |
                                              v
                                         [Assigned]
```

### 5.2 Status Definitions

| Status | Definition | Who Can Set |
|--------|------------|-------------|
| **New** | Defect just reported, not yet reviewed | Reporter, automated systems |
| **Under Review** | QA Lead is validating and reproducing | QA Lead |
| **Need Info** | More information needed from reporter | QA Lead |
| **Triaged** | Severity and priority assigned, awaiting assignment | QA Lead |
| **Assigned** | Assigned to developer, awaiting work | QA Lead, Tech Lead |
| **In Progress** | Developer is actively working on fix | Developer |
| **Resolved** | Developer believes fix is complete | Developer |
| **Under Verification** | QA is testing the fix | QA Lead |
| **Closed** | Fix verified, defect resolved | QA Lead |
| **Reopened** | Fix failed verification, returned to developer | QA Lead |
| **Won't Fix** | Conscious decision not to fix (documented reason) | Product Manager |
| **Duplicate** | Same as existing defect, linked and closed | QA Lead |
| **Cannot Reproduce** | Unable to reproduce after 3 attempts | QA Lead |

---

## 6. Triage Decision Matrix

### 6.1 Initial Triage Questions

For each new defect, the QA Lead asks:

1. **Can I reproduce this?**
   - Yes -> Proceed to severity assignment
   - No -> Mark "Cannot Reproduce", request more info
   - Intermittent -> Mark "Intermittent", assign High severity

2. **Is this a duplicate?**
   - Yes -> Close as duplicate, link to original
   - No -> Continue

3. **Is this actually a defect?**
   - Yes -> Continue
   - No -> Close with explanation
   - Unclear -> Mark "Need Info"

4. **What is the business impact?**
   - Revenue-impacting -> Critical/High
   - User experience-impacting -> High/Medium
   - Cosmetic -> Medium/Low

5. **Which component is affected?**
   - Assign to component owner

### 6.2 Triage Decision Tree

```
New defect reported
      |
      v
Can reproduce?
|-- NO --> Cannot Reproduce / Need Info
|
|-- YES
      |
      v
Duplicate?
|-- YES --> Close as duplicate
|
|-- NO
      |
      v
Actually a defect?
|-- NO --> Close with explanation
|
|-- YES
      |
      v
Business impact?
|-- Revenue / Security / Data loss --> Critical
|-- Major feature broken --> High
|-- Minor feature issue --> Medium
|-- Cosmetic / Edge case --> Low
```

---

## 7. Severity Assignment

### 7.1 Severity Levels

See [Bug Severity Definitions](TwinMOSWebsiteBugSeverityDefinitions.md) for detailed definitions.

| Severity | Criteria | Examples |
|----------|----------|----------|
| **Critical** | System unusable, data loss, security breach | Checkout fails, database corruption, XSS vulnerability |
| **High** | Major feature broken, workaround difficult | Search broken, form submissions fail, mobile nav unusable |
| **Medium** | Feature partially broken, workaround exists | Filter not working, image not loading, typo in content |
| **Low** | Cosmetic, edge case, minimal user impact | Slight color mismatch, animation glitch, rare browser issue |

### 7.2 Severity Assignment Guidelines

| Question | Critical | High | Medium | Low |
|----------|----------|------|--------|-----|
| Can users complete primary tasks? | No | With difficulty | Yes | Yes |
| Is there a workaround? | No | Difficult | Yes | N/A |
| Affected user percentage | > 50% | 10-50% | < 10% | < 1% |
| Data integrity risk? | Yes | Possible | No | No |
| Security impact? | Yes | Possible | No | No |
| Performance impact? | Site unusable | Slow > 5s | Minor delay | None |

---

## 8. Priority Assignment

### 8.1 Priority Levels

| Priority | Definition | When Used |
|----------|------------|-----------|
| **P0 (Blocker)** | Fix immediately, drop everything | Critical severity + affects release |
| **P1 (High)** | Fix in current sprint | High severity or critical path |
| **P2 (Medium)** | Fix in next 1-2 sprints | Medium severity |
| **P3 (Low)** | Fix when capacity allows | Low severity or nice-to-have |

### 8.2 Priority vs. Severity Matrix

| Severity / Urgency | Release Blocker | Sprint Goal | Backlog | Future |
|--------------------|-----------------|-------------|---------|--------|
| **Critical** | P0 | P0 | P1 | P1 |
| **High** | P0 | P1 | P1 | P2 |
| **Medium** | P1 | P2 | P2 | P3 |
| **Low** | P2 | P3 | P3 | P3 |

### 8.3 Priority Override Rules

Priority can be overridden by:

| Override | Authority | Example |
|----------|-----------|---------|
| Chairman/GM request | Product Manager | "Fix this before demo" |
| Customer-impacting production issue | Tech Lead | Distributor portal down |
| Compliance deadline | Project Manager | GDPR fix before audit |
| Security vulnerability | Security Lead | OWASP critical finding |

---

## 9. SLA Definitions

### 9.1 Response SLAs

| Severity | Initial Response | Triage Complete | Fix Target | Verification |
|----------|-----------------|-----------------|------------|--------------|
| **Critical** | 1 hour | 4 hours | 24 hours | 4 hours |
| **High** | 4 hours | 24 hours | 72 hours (3 days) | 24 hours |
| **Medium** | 24 hours | 48 hours | 5 days | 24 hours |
| **Low** | 48 hours | 1 week | 2 weeks | 24 hours |

### 9.2 SLA Clock

- **Business hours:** Sunday–Thursday, 9:00 AM – 6:00 PM GST (UAE time)
- **Weekends:** Friday–Saturday (SLA clock paused)
- **Holidays:** SLA clock paused (UAE public holidays)
- **Production incidents:** 24/7 SLA for Critical severity

### 9.3 SLA Breach Escalation

| Breach | Action | Escalation To |
|--------|--------|---------------|
| Critical > 4 hours without response | Immediate | Tech Lead + Project Manager |
| Critical > 24 hours without fix | Emergency | Chairman + GM Dubai |
| High > 24 hours without triage | Urgent | Tech Lead |
| High > 72 hours without fix | Escalated | Project Manager |
| Medium > 48 hours without triage | Warning | QA Lead |
| Any defect > 2 weeks old | Review | Tech Lead + Product Manager |

---

## 10. Tool Configuration

### 10.1 GitHub Issues Setup

```yaml
# .github/ISSUE_TEMPLATE/bug_report.yml
name: Bug Report
description: Report a defect in the TwinMOS website
title: "[BUG] "
labels: ["bug", "needs-triage"]
body:
  - type: dropdown
    id: severity
    attributes:
      label: Severity
      options:
        - Critical
        - High
        - Medium
        - Low
  - type: textarea
    id: description
    attributes:
      label: Description
      description: Clear description of the defect
  - type: textarea
    id: reproduction
    attributes:
      label: Steps to Reproduce
      placeholder: |
        1. Go to '...'
        2. Click on '...'
        3. See error
  - type: input
    id: environment
    attributes:
      label: Environment
      placeholder: "Chrome 136, Windows 11, 1920x1080"
  - type: textarea
    id: expected
    attributes:
      label: Expected Behavior
  - type: textarea
    id: actual
    attributes:
      label: Actual Behavior
  - type: textarea
    id: evidence
    attributes:
      label: Screenshots / Videos
```

### 10.2 Issue Labels

| Label | Color | Purpose |
|-------|-------|---------|
| `bug` | Red | Defect classification |
| `needs-triage` | Yellow | Awaiting triage |
| `triaged` | Green | Triage complete |
| `critical` | Dark red | Critical severity |
| `high` | Orange | High severity |
| `medium` | Blue | Medium severity |
| `low` | Gray | Low severity |
| `in-progress` | Purple | Developer working |
| `resolved` | Light green | Fix submitted |
| `needs-verification` | Yellow | Awaiting QA verification |
| `duplicate` | Gray | Duplicate defect |
| `wont-fix` | Gray | Conscious decision not to fix |
| `cannot-reproduce` | Gray | Unable to reproduce |
| `frontend` | Blue | Front-end issue |
| `backend` | Green | Back-end issue |
| `cms` | Purple | CMS issue |
| `api` | Orange | API issue |
| `performance` | Red | Performance issue |
| `security` | Dark red | Security issue |
| `accessibility` | Blue | Accessibility issue |
| `mobile` | Teal | Mobile-specific issue |
| `cross-browser` | Pink | Browser-specific issue |
| `phase-1` | Blue | Phase 1 feature |
| `phase-2` | Purple | Phase 2 feature |
| `phase-3` | Orange | Phase 3 feature |

### 10.3 GitHub Projects Board

```
Columns:
1. New (auto-populated from issues)
2. Under Review (QA Lead reviewing)
3. Need Info (awaiting reporter response)
4. Triaged (ready for assignment)
5. Assigned (developer assigned)
6. In Progress (developer working)
7. Resolved (fix submitted)
8. Under Verification (QA testing)
9. Closed (verified and closed)
10. Won't Fix (documented decision)
```

---

## 11. Metrics & Reporting

### 11.1 Key Metrics

| Metric | Target | Frequency |
|--------|--------|-----------|
| Average time to triage | < 24 hours | Weekly |
| Critical defects open | 0 | Daily |
| High defects open | < 5 | Weekly |
| Defect escape rate | < 2% | Per release |
| Defect reopen rate | < 5% | Weekly |
| Average time to fix (Critical) | < 24 hours | Weekly |
| Average time to fix (High) | < 72 hours | Weekly |
| Triage meeting attendance | 100% | Weekly |
| SLA compliance | > 95% | Weekly |

### 11.2 Weekly Defect Report

```markdown
# Defect Report — Week of [Date]

## Summary
| Metric | This Week | Last Week | Trend |
|--------|-----------|-----------|-------|
| New defects | 12 | 8 | Up |
| Closed defects | 10 | 12 | Down |
| Open defects | 15 | 13 | Up |
| Critical open | 0 | 0 | Stable |
| High open | 3 | 2 | Up |
| SLA breaches | 1 | 0 | Up |

## New Defects by Severity
| Severity | Count | % |
|----------|-------|---|
| Critical | 0 | 0% |
| High | 3 | 25% |
| Medium | 7 | 58% |
| Low | 2 | 17% |

## Defects by Component
| Component | New | Open |
|-----------|-----|------|
| Homepage | 2 | 3 |
| Product Catalog | 3 | 4 |
| Compatibility | 1 | 2 |
| Where to Buy | 2 | 2 |
| Forms | 2 | 2 |
| CMS | 2 | 2 |

## Aging Defects (> 1 week)
| ID | Title | Severity | Days Open | Assigned |
|----|-------|----------|-----------|----------|
| BUG-45 | Search pagination broken | Medium | 8 | Dev A |
| BUG-38 | Map pin offset on mobile | Medium | 10 | Dev B |

## Action Items
- [ ] Review aging defects in triage meeting
- [ ] Assign resources to Compatibility module
```

---

## Appendix A: Triage Checklist

### For QA Lead (Initial Review)

- [ ] Defect has clear title and description
- [ ] Reproduction steps are complete and clear
- [ ] Environment details provided (browser, OS, device)
- [ ] Screenshots or videos attached
- [ ] Expected vs. actual behavior documented
- [ ] Defect is reproducible (attempted at least twice)
- [ ] Not a duplicate (searched existing defects)
- [ ] Severity assigned per definitions
- [ ] Component labeled correctly
- [ ] Phase labeled correctly (if applicable)

### For Triage Meeting

- [ ] All new defects reviewed
- [ ] Severity confirmed
- [ ] Priority assigned
- [ ] Developer assigned
- [ ] Sprint/milestone set
- [ ] Blockers identified and escalated
- [ ] SLA targets reviewed
- [ ] Aging defects discussed
- [ ] Meeting notes posted to Slack

### For Developer (When Assigned)

- [ ] Defect understood and reproduced
- [ ] Effort estimated
- [ ] Fix approach documented (if complex)
- [ ] Fix implemented with unit tests
- [ ] Fix tested locally
- [ ] Status updated to "Resolved"
- [ ] Notes added on what was fixed

### For QA Lead (Verification)

- [ ] Fix deployed to test environment
- [ ] Original reproduction steps re-executed
- [ ] Related areas regression tested
- [ ] No new defects introduced
- [ ] Status updated to "Closed"
- [ ] Resolution notes added

---

**End of Document**
