# TwinMOS Website — Escalation Matrix

**Document Reference:** TWN-OPS-2026-003  
**Version:** 1.0  
**Status:** FINAL  
**Date:** 1 May 2026  
**Prepared by:** TwinMOS Digital Transformation Team / Unisoft Engineering  
**Owner:** Unisoft Team Lead / TwinMOS IT Lead  
**Audience:** All operational staff, project stakeholders, vendor contacts  
**Classification:** CONFIDENTIAL — Internal Use Only  
**Synchronized With:** BRD v3.0 §29, MSA §201, Project Charter §9

---

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 1 May 2026 | TwinMOS Digital Transformation Team | Initial release |

---

## 1. Purpose

This document defines the complete escalation matrix for the TwinMOS corporate website, covering technical incidents, business-critical issues, vendor problems, security events, and contractual disputes. It ensures every issue reaches the right decision-maker within the appropriate timeframe.

---

## 2. Escalation Tiers

### 2.1 Tier 1 — Engineering (Technical Resolution)

| Role | Contact Method | Response SLA | Scope |
|------|---------------|--------------|-------|
| **Primary On-Call Engineer** | Slack DM / PagerDuty | 15 min (Sev 1) / 30 min (Sev 2) | Initial triage, known runbook execution, standard fixes |
| **Backup On-Call Engineer** | Slack DM / SMS | 15 min after primary miss | Coverage when primary unavailable |
| **Unisoft Team Lead** | Slack / Mobile | 45 min (Sev 1) / 1 hour (Sev 2) | Complex technical decisions, architecture changes, rollback approval |
| **Unisoft Senior Developer** | Slack / Mobile | 1 hour | Backend/database issues, Strapi schema, API problems |

### 2.2 Tier 2 — TwinMOS IT & Operations (Infrastructure & Business)

| Role | Contact Method | Response SLA | Scope |
|------|---------------|--------------|-------|
| **TwinMOS IT/Technical Lead** | Email / Mobile | 2 hours | Infrastructure access (DNS, domain, SSL), security decisions, vendor coordination |
| **TwinMOS Product Manager** | Email / Slack | 4 hours (business hours) | Product data issues, SKU accuracy, compatibility data |
| **TwinMOS Marketing Director** | Email / Slack | 4 hours (business hours) | Content emergencies, brand issues, campaign-related incidents |
| **TwinMOS Sales Director** | Email / Slack | 4 hours (business hours) | Partner portal issues, distributor inquiries, pricing errors |

### 2.3 Tier 3 — Management (Strategic & Contractual)

| Role | Contact Method | Response SLA | Scope |
|------|---------------|--------------|-------|
| **Operational Sponsor (GM Dubai)** | Email / Mobile | 4 hours | Budget decisions >$5K, timeline shifts >2 weeks, vendor disputes, scope changes |
| **Project Sponsor (Chairman)** | Email / Mobile | 24 hours | Budget >$50K, contractual disputes, strategic decisions, termination |
| **TwinMOS Legal Counsel** | Email | 24 hours | Data breach notifications, regulatory compliance, legal disputes |

---

## 3. Escalation Paths by Incident Type

### 3.1 Technical Incident (Sev 1 — Full Outage)

```
T+0 min    Primary On-Call → begins triage
T+15 min   If no ack → Backup On-Call paged
T+30 min   If unresolved → Unisoft Team Lead engaged
T+45 min   If still unresolved → TwinMOS IT/Technical Lead
T+1h       War room opened (Slack huddle + Zoom)
T+2h       If business impact severe → Operational Sponsor (GM Dubai)
T+4h       If still unresolved → Project Sponsor (Chairman)
```

### 3.2 Technical Incident (Sev 2 — Degraded)

```
T+0 min    Primary On-Call → begins investigation
T+30 min   If no ack → Backup On-Call
T+1h       If unresolved → Unisoft Team Lead
T+2h       If business impact → TwinMOS IT/Technical Lead
T+4h       If still unresolved → Operational Sponsor
```

### 3.3 Security Incident (Data Breach / Unauthorized Access)

```
T+0 min    Primary On-Call + Unisoft Team Lead (immediate)
T+15 min   TwinMOS IT/Technical Lead
T+30 min   TwinMOS Legal Counsel (for breach notification assessment)
T+1h       Operational Sponsor
T+2h       Project Sponsor (if regulatory notification required)
```

**Note:** GDPR Art. 33 requires breach notification to supervisory authority within 72 hours. India DPDP Act requires 6-hour CERT-In notification + 72-hour Data Protection Board notification.

### 3.4 Vendor Service Outage

| Vendor | First Contact | Escalation Path |
|--------|--------------|-----------------|
| **Hetzner** | Hetzner console support ticket | Unisoft Team Lead → TwinMOS IT Lead → Operational Sponsor (if >4h) |
| **Cloudflare** | Cloudflare support portal / status page | Unisoft Team Lead → TwinMOS IT Lead |
| **Backblaze B2** | Backblaze support portal | Unisoft Team Lead → TwinMOS IT Lead |
| **Resend** | Resend support / status page | Unisoft Senior Dev → Unisoft Team Lead |
| **Stripe** | Stripe support dashboard (P3) | Unisoft Team Lead → TwinMOS Sales Director |
| **Sentry** | Sentry support / status page | Unisoft Team Lead |
| **UptimeRobot** | UptimeRobot dashboard | Unisoft Team Lead |

### 3.5 Content / Business Emergency

| Issue | First Contact | Escalation Path |
|-------|--------------|-----------------|
| Incorrect pricing on product page | TwinMOS Marketing Director | TwinMOS Product Manager → Operational Sponsor |
| Legal page content error | TwinMOS Legal Counsel | Operational Sponsor |
| Distributor data breach (partner portal) | TwinMOS Sales Director + IT Lead | Operational Sponsor → Legal Counsel |
| Counterfeit report requiring immediate legal action | TwinMOS Legal Counsel | Operational Sponsor |
| Negative PR / social media crisis | TwinMOS Marketing Director | Operational Sponsor → Project Sponsor |

### 3.6 Contractual / Commercial Dispute

Per MSA §201 and §525:

```
Issue raised → Project Managers (48h resolution)
    ↓
If unresolved → Operational Sponsors (72h resolution)
    ↓
If unresolved → Executive Sponsors (1 week)
    ↓
If still unresolved → Mediation (DIAC, Dubai, English)
```

---

## 4. Escalation Triggers

### 4.1 Automatic Triggers

| Condition | Auto-Escalation To | Timeframe |
|-----------|-------------------|-----------|
| Sev 1 alert unacknowledged | Backup On-Call | 15 minutes |
| Sev 1 unresolved | Unisoft Team Lead | 30 minutes |
| Sev 1 still unresolved | TwinMOS IT Lead | 45 minutes |
| Error rate >10% for >5 minutes | Unisoft Team Lead | Immediate |
| Database connection pool exhausted | Unisoft Senior Dev + Team Lead | Immediate |
| Cloudflare WAF blocking legitimate traffic | Unisoft Team Lead | Immediate |
| Backup failure (2 consecutive) | Unisoft Team Lead + TwinMOS IT Lead | 1 hour |

### 4.2 Manual Triggers

Any engineer may manually escalate when:
- The issue is beyond their technical expertise
- The fix requires approval (budget, architecture, vendor contact)
- The SLA is at risk of breach
- Customer/business impact is greater than initially assessed
- A security concern is suspected

---

## 5. Communication Protocols

### 5.1 During Active Incidents

| Audience | Channel | Frequency | Content |
|----------|---------|-----------|---------|
| Engineering team | Slack #incident | Real-time | Technical details, actions, blockers |
| TwinMOS stakeholders | Slack #ops | Every 30 min (Sev 1) / 1 hour (Sev 2) | Status, ETA, business impact |
| Executive | Direct message / phone | Every 2 hours (Sev 1) | High-level summary, no technical jargon |
| Customers | Status page (if applicable) | After initial assessment | "We are investigating an issue affecting..." |

### 5.2 Post-Incident Communication

| Audience | Channel | Timing | Content |
|----------|---------|--------|---------|
| Engineering | Slack #incident + wiki | 24h (Sev 1) / 48h (Sev 2) | Post-incident review document |
| Stakeholders | Email | 24h | Summary, root cause, preventive actions |
| Executive | Email | 48h | Business impact, corrective actions, follow-up |

---

## 6. Vendor Escalation Contacts

| Vendor | Level 1 Support | Level 2 / Escalation | Emergency |
|--------|----------------|---------------------|-----------|
| Hetzner | support@hetzner.com | Account manager (if assigned) | — |
| Cloudflare | Support portal | Enterprise support (if Pro/Business) | — |
| Backblaze B2 | help@backblaze.com | — | — |
| Resend | support@resend.com | — | — |
| Stripe | support.stripe.com | Account manager (P3) | — |
| Sentry | support@sentry.io | — | — |

---

## 7. Document Sign-Off

| Role | Name | Sign-Off | Date |
|------|------|----------|------|
| IT/Technical Lead | (TBC) | _______________ | _________ |
| Unisoft Team Lead | (TBC) | _______________ | _________ |

---

**Document Version:** 1.0  
**Issued:** 1 May 2026  
**Next Review:** Upon Phase 1 launch (Month 5) and quarterly thereafter  
**Canonical Location:** `J - Operations, Maintenance and End-User Guides/J.1 - Operations Runbooks/TwinMOSWebsiteEscalation_Matrix.md`
