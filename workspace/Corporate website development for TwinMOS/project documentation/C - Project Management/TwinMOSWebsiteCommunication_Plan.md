# TwinMOS Corporate Website — Communication Plan

**Document Reference:** TWN-PM-COMM-2026-001  
**Version:** 1.0  
**Date:** 1 May 2026  
**Classification:** CONFIDENTIAL — Internal Use Only  
**Prepared by:** TwinMOS Digital Transformation Team  
**Audience:** All project stakeholders

---

## 1. Communication Objectives

1. Ensure timely, accurate, and relevant information flows to all stakeholders
2. Enable rapid issue escalation and decision-making
3. Maintain transparency on project progress, risks, and changes
4. Support effective collaboration between TwinMOS and Unisoft teams
5. Document decisions and maintain organizational memory

---

## 2. Communication Principles

| Principle | Description |
|-----------|-------------|
| **Transparency** | Share progress openly; bad news early; no surprises at phase gates |
| **Brevity** | Respect stakeholders' time; structured formats; bullet points over prose |
| **Actionability** | Every communication specifies who does what by when |
| **Accessibility** | Use channels accessible to all parties; account for time zones (Taipei, Dubai, remote) |
| **Documentation** | Decisions in writing; verbal agreements confirmed via email |

---

## 3. Communication Channels

| Channel | Purpose | Response Time | Tools |
|---------|---------|---------------|-------|
| **Slack / Async Messaging** | Quick questions, blockers, daily coordination | 4 hours (business hours) | Slack, Microsoft Teams, or agreed platform |
| **Email** | Formal communications, decisions, documentation | 24 hours | Resend / corporate email |
| **Video Calls** | Sprint reviews, milestone reviews, retrospectives | Scheduled | Google Meet, Zoom, or Teams |
| **GitHub** | Code review, ADRs, technical documentation | 24 hours | GitHub Issues, PRs, Discussions |
| **Strapi / CMS** | Content review, publishing workflow | 48 hours | Strapi admin |
| **Phone** | Urgent escalations only | Immediate | Mobile / landline |

---

## 4. Regular Communication Cadence

### 4.1 Daily

| Meeting | Duration | Participants | Purpose | Owner |
|---------|----------|--------------|---------|-------|
| Daily Standup | 15 min | Both Unisoft developers | Blockers, progress, coordination | Unisoft Team Lead |

**Format:** Async-friendly. Each developer posts:
- What I completed yesterday
- What I'm working on today
- Any blockers

**Time:** 9:00 AM Dubai time (flexible for async)

---

### 4.2 Bi-Weekly (Every 2 Weeks)

| Meeting | Duration | Participants | Purpose | Owner |
|---------|----------|--------------|---------|-------|
| Sprint Planning | 90 min | Both devs + TwinMOS PM | Task assignment, estimation, commitment | TwinMOS PM |
| Sprint Review / Demo | 60 min | Both devs + TwinMOS PM + stakeholders | Demo shipped features; gather feedback; acceptance | Unisoft Team Lead |
| Status Report | — | All stakeholders | Written status update | TwinMOS PM |

**Sprint Planning Format:**
1. Review previous sprint (15 min)
2. Backlog grooming (30 min)
3. Task assignment and estimation (30 min)
4. Sprint commitment and risk review (15 min)

**Sprint Review Format:**
1. Demo of completed P0 stories (30 min)
2. Feedback and questions (15 min)
3. Acceptance decisions (10 min)
4. Next sprint preview (5 min)

**Status Report Format:** See [TwinMOSWebsiteStatusReportTemplate.md](TwinMOSWebsiteStatusReportTemplate.md)

---

### 4.3 Monthly

| Meeting | Duration | Participants | Purpose | Owner |
|---------|----------|--------------|---------|-------|
| Steering Committee | 60 min | Sponsor + Operational Sponsor + PM | Budget, risks, strategic alignment | TwinMOS PM |
| Executive Summary | — | Sponsor + Operational Sponsor | Written executive summary | TwinMOS PM |

**Steering Committee Format:**
1. Phase progress summary (10 min)
2. Budget status (10 min)
3. Risk and issue review (15 min)
4. Strategic decisions needed (15 min)
5. Next month priorities (10 min)

---

### 4.4 Per Phase

| Meeting | Duration | Participants | Purpose | Owner |
|---------|----------|--------------|---------|-------|
| Phase Gate Review | 2 hours | All key stakeholders | Go/no-go decision; formal sign-off | TwinMOS PM |
| Phase Kickoff | 90 min | All stakeholders | Scope confirmation; plan review; team alignment | TwinMOS PM |

**Phase Gate Review Format:** See [TwinMOSWebsitePhaseGateReview_Template.md](TwinMOSWebsitePhaseGateReview_Template.md)

---

### 4.5 Ad-Hoc

| Trigger | Participants | Purpose | Owner |
|---------|--------------|---------|-------|
| Critical blocker > 4 hours | Relevant dev + TwinMOS PM | Unblock decision | TwinMOS PM |
| Budget change > $5K | Sponsor + Operational Sponsor + PM | Approval | TwinMOS PM |
| Scope change (new epic) | Operational Sponsor + Team Lead + PM | Evaluation | TwinMOS PM |
| Security incident | Team Lead + Senior Dev + IT Lead + PM | Response | Unisoft Team Lead |
| Production outage | All devs + IT Lead + PM | Resolution | Unisoft Team Lead |

---

## 5. Stakeholder Communication Matrix

| Stakeholder | Daily | Bi-Weekly | Monthly | Per Phase | Ad-Hoc |
|-------------|-------|-----------|---------|-----------|--------|
| Project Sponsor (Chairman) | — | Status Report | Steering Committee | Phase Gate | Budget/Scope |
| Operational Sponsor (GM) | — | Status Report | Steering Committee | Phase Gate | Escalation |
| TwinMOS PM | Standup | Sprint Planning, Review, Status | Steering Committee | Phase Gate/Kickoff | All |
| Unisoft Team Lead | Standup | Sprint Planning, Review, Status | — | Phase Gate/Kickoff | Technical |
| Unisoft Senior Dev | Standup | Sprint Planning, Review | — | Phase Gate | Technical |
| TwinMOS Marketing Director | — | Sprint Review | — | Phase Gate | Content |
| TwinMOS IT Lead | — | Status Report | — | Phase Gate | Infrastructure |
| TwinMOS Sales Director | — | Status Report | — | Phase Gate | Partner Portal |
| TwinMOS Product Manager | — | Sprint Review | — | Phase Gate | SKU Data |
| TwinMOS Legal/Compliance | — | Status Report | — | Phase Gate | Legal |
| TwinMOS QA Lead | — | Sprint Review | — | Phase Gate | QA |
| TwinMOS HR Director | — | Status Report | — | Phase Gate | Careers |

---

## 6. Communication Templates

### 6.1 Daily Standup Update (Async)

```
**[Name]** — [Date]

**Yesterday:**
- [Completed item]
- [Completed item]

**Today:**
- [Planned item]
- [Planned item]

**Blockers:**
- [None / Description + help needed]
```

### 6.2 Blocker Escalation

```
**BLOCKER:** [Short description]
**Reported by:** [Name]
**Date/Time:** [Timestamp]
**Impact:** [What is blocked and for how long]
**Help needed from:** [Person/role]
**Suggested resolution:** [If known]
**Urgency:** [P0 = blocks sprint goal / P1 = blocks task / P2 = inconvenience]
```

### 6.3 Decision Request

```
**DECISION NEEDED:** [Short description]
**Requested by:** [Name]
**Date needed by:** [Deadline]
**Context:** [Background information]
**Options:**
1. [Option A with pros/cons]
2. [Option B with pros/cons]
**Recommendation:** [If applicable]
**Decision maker:** [Name/role]
```

### 6.4 Announcement / Update

```
**ANNOUNCEMENT:** [Short title]
**Date:** [Date]
**Who needs to know:** [Audience]
**What changed:** [Description]
**Why:** [Reason]
**Impact:** [On who and what]
**Action required:** [If any, by when]
**Questions to:** [Contact]
```

---

## 7. Meeting Guidelines

### 7.1 All Meetings

- **Agenda sent 24 hours in advance**
- **Minutes within 24 hours after**
- **Action items with owner and due date**
- **Decision Log updated for all decisions**

### 7.2 Virtual Meeting Etiquette

- Camera on for sprint reviews and phase gates
- Mute when not speaking
- Use chat for questions during demos
- Record sprint reviews for absent stakeholders

### 7.3 Time Zone Considerations

| Location | Time Zone | Dubai 9 AM = |
|----------|-----------|--------------|
| Dubai, UAE | GST (UTC+4) | 9:00 AM |
| Taipei, Taiwan | CST (UTC+8) | 1:00 PM |
| India | IST (UTC+5:30) | 10:30 AM |
| Remote developers | Varies | TBD |

**Recommended meeting times:**
- Daily standup: 9:00 AM GST (flexible async)
- Sprint planning: 10:00 AM GST
- Sprint review: 10:00 AM GST

---

## 8. Escalation Path

```
Level 1: Developer → TwinMOS PM (within 4 hours of blocker)
    |
Level 2: TwinMOS PM → Operational Sponsor (within 24 hours if unresolved)
    |
Level 3: Operational Sponsor → Project Sponsor (within 48 hours if unresolved)
    |
Level 4: Project Sponsor → Board (budget > $50K or strategic impact)
```

**Escalation triggers:**
- Blocker unresolved > 24 hours
- Budget overrun > 10%
- Timeline slip > 2 weeks
- Scope change requiring new epic
- Team conflict affecting delivery
- Security or compliance incident

---

## 9. Document Storage and Access

| Document Type | Location | Access |
|---------------|----------|--------|
| Project management docs | `project documentation/C - Project Management/` | All stakeholders |
| Technical docs / ADRs | GitHub `/docs/` | Dev team + IT Lead |
| Design files | Figma (shared) | Marketing + Dev team |
| Content files | Strapi CMS | Marketing + Dev team |
| Runbooks | GitHub `/docs/runbooks/` | Dev team + IT Lead |
| Meeting minutes | Shared drive / Notion | All stakeholders |
| Decision Log | `project documentation/C - Project Management/` | All stakeholders |
| Issue Log | GitHub Issues | Dev team + PM |

---

## 10. Communication Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| TwinMOS PM slow to respond | Blocks development | 24h decision SLA in contract; escalation path defined |
| Unisoft devs unavailable (vacation/illness) | Schedule slip | Backup dev identified; daily commits; pair programming |
| Stakeholder misses sprint review | Feedback delayed | Recorded demos; async feedback window |
| Information overload | Stakeholders disengage | Tiered reporting; executive summaries; self-serve dashboards |
| Miscommunication across time zones | Delays, errors | Async-friendly standups; documented decisions; recorded meetings |
| Language barriers (EN/AR/BN/HI) | Misunderstanding | Simple English; visual demos; glossary of terms |

---

## 11. Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 1 May 2026 | TwinMOS Digital Transformation Team | Initial plan |

**Next Review:** Upon team composition changes and at each phase boundary

**Related Documents:**
- TwinMOSWebsiteStatusReportTemplate.md
- TwinMOSWebsitePhaseGateReview_Template.md
- TwinMOSWebsiteDecision_Log.md
- TwinMOSWebsiteStakeholder_Register.md

---

*This Communication Plan is a living document. Changes require agreement from the Operational Sponsor and TwinMOS PM.*
