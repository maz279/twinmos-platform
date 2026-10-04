# TwinMOS Website — Operations Runbook Master

**Document Reference:** TWN-OPS-2026-001  
**Version:** 1.0  
**Status:** FINAL  
**Date:** 1 May 2026  
**Prepared by:** TwinMOS Digital Transformation Team / Unisoft Engineering  
**Owner:** IT/Technical Lead (TwinMOS) / Unisoft Team Lead  
**Audience:** DevOps, System Administrators, TwinMOS IT Staff, Unisoft Engineering  
**Classification:** CONFIDENTIAL — Internal Use Only  
**Synchronized With:** BRD v3.0, URD v3.0, Tech Stack v1.1, Implementation Strategy v3.0, Project Plan Phases 1–3

---

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 1 May 2026 | TwinMOS Digital Transformation Team | Initial release — master index for all operational runbooks |

---

## 1. Purpose

This document serves as the **canonical master index** for all operational runbooks governing the TwinMOS corporate website (twinmos.com). It defines the runbook hierarchy, document ownership, revision cadence, and emergency response framework. Every operational procedure for the production environment must be documented in a subordinate runbook and cross-referenced from this master.

---

## 2. Runbook Hierarchy

### 2.1 Document Tree

```
TWN-OPS-2026-001  Operations Runbook Master (this document)
├── TWN-OPS-2026-002  On-Call Procedure
├── TWN-OPS-2026-003  Escalation Matrix
├── TWN-OPS-2026-004  Maintenance Window Procedure
├── TWN-OPS-2026-005  Capacity Planning Guide
│
├── H.4 Operations Runbooks (cross-referenced)
│   ├── TWN-OPS-2026-006  Deployment Runbook
│   ├── TWN-OPS-2026-007  Rollback Runbook
│   ├── TWN-OPS-2026-008  Backup & Restore Runbook
│   ├── TWN-OPS-2026-009  Disaster Recovery Plan
│   ├── TWN-OPS-2026-010  DR Drill Procedure
│   ├── TWN-OPS-2026-011  DNS Cutover Plan
│   ├── TWN-OPS-2026-012  Database Migration Runbook
│   └── TWN-OPS-2026-013  SSL Certificate Renewal Runbook
│
├── J.2 CMS & Content Operations
│   ├── TWN-OPS-2026-014  CMS Admin Guide
│   ├── TWN-OPS-2026-015  CMS Editor Quick Reference
│   ├── TWN-OPS-2026-016  Content Publishing Workflow
│   ├── TWN-OPS-2026-017  Live Preview Guide
│   ├── TWN-OPS-2026-018  Bulk Import/Export Guide
│   └── TWN-OPS-2026-019  Media Library Guide
│
└── J.3 Business Operations Guides
    ├── TWN-OPS-2026-020  RMA Operations Guide
    ├── TWN-OPS-2026-021  Warranty Registration Operations
    ├── TWN-OPS-2026-022  Anti-Counterfeit Operations Guide
    ├── TWN-OPS-2026-023  Counterfeit Report Triage Process
    ├── TWN-OPS-2026-024  Partner Portal Admin Guide
    ├── TWN-OPS-2026-025  Build Gallery Moderation Guide
    ├── TWN-OPS-2026-026  Live Chat Agent Guide
    ├── TWN-OPS-2026-027  E-Commerce Admin Guide
    ├── TWN-OPS-2026-028  Order Fulfillment Process
    ├── TWN-OPS-2026-029  Refund & Cancellation Process
    ├── TWN-OPS-2026-030  Loyalty Program Operations
    ├── TWN-OPS-2026-031  Customer Support Playbook
    └── TWN-OPS-2026-032  Form Lead Routing Guide
```

### 2.2 Runbook Categories

| Category | Scope | Primary Owner |
|----------|-------|---------------|
| **Infrastructure & Platform** | Servers, networks, hosting, DNS, SSL | Unisoft Team Lead |
| **Application & CMS** | Strapi, Astro, database, search | Unisoft Senior Developer |
| **Content & Editorial** | Publishing workflows, media, translations | TwinMOS Marketing Director |
| **Business Operations** | RMA, warranty, partner portal, e-commerce | TwinMOS Operations / Sales |
| **Security & Compliance** | Incidents, pen-tests, compliance audits | TwinMOS IT/Technical Lead |
| **Customer Support** | Support tickets, live chat, KB maintenance | TwinMOS Support Lead |

---

## 3. Severity Definitions

All operational incidents are classified using the following severity scale (aligned with BRD §23.4 and Tech Stack §23.4):

| Severity | Name | Definition | Ack SLA | Resolution SLA | Notification |
|----------|------|------------|---------|----------------|--------------|
| **Sev 1** | Critical — Full Outage | Complete website unavailability; all users affected; revenue impact | 15 min | 1 hour (fix attempt) | Page on-call dev; Slack #incident; SMS to leads |
| **Sev 2** | High — Degraded | Major feature broken (checkout, partner portal, CMS); significant user impact | 30 min | 4 hours | Slack #ops; email to stakeholders |
| **Sev 3** | Medium — Partial | Single feature or page broken; limited user impact; workaround exists | 4 hours | 24 hours | Issue tracker; scheduled fix |
| **Sev 4** | Low — Cosmetic | Minor UI issue, typo, non-critical display problem | Best effort | Next sprint | Backlog item |

---

## 4. Emergency Contact Matrix

### 4.1 Internal Contacts

| Role | Name | Primary Contact | After-Hours | Escalation Order |
|------|------|-----------------|-------------|------------------|
| Unisoft Team Lead | TBC | Slack DM / email | Mobile | 1st — technical |
| Unisoft Senior Developer | TBC | Slack DM / email | Mobile | 2nd — technical |
| Unisoft Backup Developer | TBC | Slack DM / email | Mobile | 3rd — technical |
| TwinMOS IT/Technical Lead | TBC | Slack / email | Mobile | 4th — infrastructure |

### 4.2 Vendor Contacts

| Vendor | Service | Support URL / Email | Emergency Phone | Account ID |
|--------|---------|---------------------|-----------------|------------|
| Hetzner | VPS Hosting | https://console.hetzner.cloud | — | TBC |
| Cloudflare | CDN / DNS / WAF | https://dash.cloudflare.com | — | TBC |
| Backblaze B2 | Object Storage | https://backblaze.com | — | TBC |
| Resend | Transactional Email | https://resend.com | — | TBC |
| Sentry | Error Monitoring | https://sentry.io | — | TBC |
| Stripe | Payments (P3) | https://stripe.com/support | — | TBC |

---

## 5. Revision & Review Schedule

| Action | Frequency | Owner | Evidence |
|--------|-----------|-------|----------|
| Runbook review | Quarterly | Unisoft Team Lead | Review log in this document |
| Post-incident update | Within 48h of Sev 1/2 | Incident commander | Updated runbook + incident report |
| Phase-gate validation | Per phase (Months 5, 9, 15) | TwinMOS IT Lead | Sign-off in Phase Gate Review |
| Annual audit | Annually | TwinMOS Legal/Compliance | Audit report |

---

## 6. Document Sign-Off

| Role | Name | Sign-Off | Date |
|------|------|----------|------|
| IT/Technical Lead | (TBC) | _______________ | _________ |
| Unisoft Team Lead | (TBC) | _______________ | _________ |

---

**Document Version:** 1.0  
**Issued:** 1 May 2026  
**Next Review:** Upon Phase 1 launch (Month 5) and quarterly thereafter  
**Canonical Location:** `J - Operations, Maintenance and End-User Guides/J.1 - Operations Runbooks/TwinMOSWebsiteOperationsRunbookMaster.md`
