# TwinMOS Corporate Website — Change Request Process

**Document Reference:** TWN-PM-CR-2026-001  
**Version:** 1.0  
**Date:** 1 May 2026  
**Classification:** CONFIDENTIAL — Internal Use Only  
**Prepared by:** TwinMOS Digital Transformation Team  
**Owner:** TwinMOS PM  
**Audience:** All project stakeholders

---

## 1. Change Request Overview

This document defines the process for managing changes to the TwinMOS corporate website project scope, timeline, budget, or quality criteria. All changes must follow this process to maintain project control and stakeholder alignment.

**Change Types Covered:**
- Scope changes (new features, removed features, modified requirements)
- Timeline changes (phase delays, milestone shifts, deadline changes)
- Budget changes (cost increases, reallocation, new expenses)
- Quality criteria changes (performance targets, accessibility level, compliance scope)
- Resource changes (team composition, vendor changes, availability)

---

## 2. Change Request Thresholds

| Change Size | Effort | Budget | Approval Required | Timeline |
|-------------|--------|--------|-------------------|----------|
| **Minor** | < 8 hours | < $500 | Unisoft Team Lead + TwinMOS PM | Same sprint |
| **Moderate** | 8–40 hours | $500–$5,000 | Operational Sponsor | Next sprint |
| **Major** | > 40 hours | > $5,000 | Project Sponsor | Phase re-plan |
| **Strategic** | New epic or phase | > $10,000 | Project Sponsor + Board if > $50K | Contract amendment |

---

## 3. Change Request Process Flow

```
[Identify Need]
     |
     v
[Submit Change Request Form]
     |
     v
[PM Triage — Category & Priority]
     |
     +---> Minor ----> Team Lead + PM Approval ----> Implement
     |
     +---> Moderate -> Operational Sponsor Review -> Approve/Reject/Defer
     |                                          |
     |                                          v
     |                                    [If Approved] -> Update Plan -> Implement
     |
     +---> Major ----> Project Sponsor Review -----> Approve/Reject/Defer
     |                                          |
     |                                          v
     |                                    [If Approved] -> Contract Amendment -> Update Plan -> Implement
     |
     +---> Strategic -> Board Review (if > $50K) -> Approve/Reject/Defer
                                                |
                                                v
                                          [If Approved] -> Contract Amendment -> Update Plan -> Implement
```

---

## 4. Change Request Form

### 4.1 Required Information

```
CHANGE REQUEST FORM
===================

CR ID: [Auto-generated: CR-YYYY-NNN]
Date Submitted: [Date]
Submitted By: [Name, Role]

1. CHANGE DESCRIPTION
   [Clear description of what is being requested]

2. REASON FOR CHANGE
   [Why is this change needed? Business justification]

3. CATEGORY
   [ ] Scope    [ ] Timeline    [ ] Budget    [ ] Quality    [ ] Resource

4. CURRENT STATE
   [What exists now]

5. PROPOSED STATE
   [What will exist after change]

6. IMPACT ASSESSMENT
   a. Scope Impact: [Add/Remove/Modify — describe]
   b. Timeline Impact: [Days/weeks added or saved]
   c. Budget Impact: [Cost increase or decrease]
   d. Quality Impact: [Effect on performance, accessibility, security]
   e. Resource Impact: [Additional people or skills needed]
   f. Risk Impact: [New risks introduced or existing risks changed]

7. ALTERNATIVES CONSIDERED
   [Other ways to address the need]

8. RECOMMENDATION
   [Submitter's recommendation]

9. APPROVALS
   Team Lead Review: [Date, Signature]
   PM Review: [Date, Signature]
   Operational Sponsor: [Date, Signature]
   Project Sponsor: [Date, Signature]

10. DECISION
    [ ] Approved    [ ] Rejected    [ ] Deferred    [ ] Needs More Info
    Decision Date: [Date]
    Decision Maker: [Name]
    Rationale: [Why this decision was made]

11. IMPLEMENTATION
    Assigned To: [Name]
    Target Date: [Date]
    Actual Date: [Date]
    Status: [ ] Not Started  [ ] In Progress  [ ] Complete
```

---

## 5. Change Request Review Criteria

### 5.1 Approval Criteria

| Criterion | Questions to Ask |
|-----------|-----------------|
| **Business Value** | Does this change deliver measurable business benefit? |
| **Strategic Alignment** | Does this align with project objectives and TwinMOS strategy? |
| **Feasibility** | Can this be delivered with available resources and timeline? |
| **Impact** | Is the impact on other deliverables acceptable? |
| **Risk** | Are new risks manageable? |
| **Budget** | Is the cost justified by the benefit? |
| **Dependencies** | Are dependencies identified and manageable? |

### 5.2 Rejection Criteria

A change request may be rejected if:
- It does not align with project objectives
- The business case is insufficient
- The impact on timeline/budget is unacceptable
- It introduces unmanaged risks
- It can be deferred to Phase 4 without significant harm
- A simpler alternative exists

### 5.3 Deferral Criteria

A change request may be deferred if:
- It is valuable but not critical for current phase
- Resources are not available in current phase
- It depends on other changes not yet implemented
- It can be addressed in Phase 4 retainer

---

## 6. Change Request Workflow

### 6.1 Submission

1. Any stakeholder can submit a change request
2. Complete Change Request Form
3. Submit to TwinMOS PM via email or project management tool
4. PM acknowledges receipt within 24 hours

### 6.2 Triage

1. PM reviews for completeness
2. PM assigns preliminary category (Minor/Moderate/Major/Strategic)
3. PM assigns to relevant reviewer(s)
4. PM communicates timeline for decision

### 6.3 Impact Analysis

1. Unisoft Team Lead assesses technical impact
2. TwinMOS PM assesses schedule and resource impact
3. Operational Sponsor assesses business impact
4. Impact analysis documented in CR form

### 6.4 Decision

1. Decision maker reviews impact analysis
2. Decision made within:
   - Minor: 2 business days
   - Moderate: 5 business days
   - Major: 10 business days
   - Strategic: 15 business days
3. Decision communicated to all stakeholders
4. Decision logged in Decision Log

### 6.5 Implementation

1. If approved: update project plan, budget, and schedule
2. Assign implementation owner
3. Track in sprint backlog
4. Verify completion
5. Close change request

---

## 7. Emergency Change Process

### 7.1 Emergency Definition

An emergency change is required when:
- Critical security vulnerability must be patched
- Production outage requires immediate fix
- Legal/compliance issue requires immediate action
- Data breach or privacy incident

### 7.2 Emergency Process

1. **Immediate Action:** Unisoft Team Lead can execute fix without full CR process
2. **Notification:** Inform TwinMOS PM and Operational Sponsor within 2 hours
3. **Documentation:** Log change retroactively within 24 hours
4. **Review:** Post-incident review within 48 hours
5. **Approval:** Retroactive approval by appropriate authority

---

## 8. Change Request Tracking

### 8.1 Change Request Register

| CR ID | Date | Submitted By | Category | Priority | Description | Status | Decision |
|-------|------|--------------|----------|----------|-------------|--------|----------|
| CR-2026-001 | TBD | TBD | TBD | TBD | TBD | TBD | TBD |

### 8.2 Change Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| CR response time (Minor) | < 2 days | Average time from submit to decision |
| CR response time (Moderate) | < 5 days | Average time from submit to decision |
| CR response time (Major) | < 10 days | Average time from submit to decision |
| CR approval rate | 60–80% | % of CRs approved |
| CR rework rate | < 10% | % of CRs requiring resubmission |
| Scope creep | < 15% | % of original scope added via CRs |

---

## 9. Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 1 May 2026 | TwinMOS Digital Transformation Team | Initial process |

**Next Review:** Upon first change request and quarterly thereafter

**Related Documents:**
- TwinMOSWebsiteProject_Charter.md
- TwinMOSWebsiteDecision_Log.md
- TwinMOSWebsiteProjectPlanPhases_1-3.md

---

*This Change Request Process is binding on all stakeholders. Emergency changes are the only exception.*
