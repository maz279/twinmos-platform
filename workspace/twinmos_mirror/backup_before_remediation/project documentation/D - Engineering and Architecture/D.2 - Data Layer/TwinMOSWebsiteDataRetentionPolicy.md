# TwinMOS Corporate Website — Data Retention Policy

**Document Reference:** TWN-RETENTION-2026-001
**Document Version:** 1.0
**Status:** DRAFT
**Date:** 1 May 2026
**Synchronized With:** Tech Stack v1.1, BRD v3.0 (Compliance §22)

---

## Table of Contents

1. [Policy Scope and Authority](#1-policy-scope-and-authority)
2. [Regulatory Framework](#2-regulatory-framework)
3. [Data Classification](#3-data-classification)
4. [Retention Schedules](#4-retention-schedules)
5. [Data Deletion Procedures](#5-data-deletion-procedures)
6. [Backup Retention](#6-backup-retention)
7. [Audit Log Retention](#7-audit-log-retention)
8. [DSAR and Erasure](#8-dsar-and-erasure)
9. [Cross-Border Data Transfer](#9-cross-border-data-transfer)
10. [Compliance Monitoring](#10-compliance-monitoring)

---

## 1. Policy Scope and Authority

### 1.1 Scope

This policy applies to all data collected, processed, and stored by the TwinMOS corporate website and associated systems, including:
- Strapi CMS database (PostgreSQL)
- MeiliSearch indexes
- Backblaze B2 object storage
- Astro Content Collections (Git repository)
- Analytics data (Plausible, GA4)
- Form submissions
- User account data
- Audit logs

### 1.2 Authority

| Regulation | Jurisdiction | Authority |
|------------|-------------|-----------|
| GDPR | EU/EEA | Ireland DPC (Lead SA) |
| UAE PDPL | UAE | UAE Data Protection Office |
| India DPDP Act 2023 | India | Data Protection Board of India |
| KSA PDPL | Saudi Arabia | Saudi Data and AI Authority (SDAIA) |

---

## 2. Regulatory Framework

### 2.1 GDPR (EU/EEA)

| Requirement | Implementation |
|-------------|--------------|
| Art. 5(1)(e) — Storage limitation | Defined retention periods per data type |
| Art. 17 — Right to erasure | DSAR endpoint + automated deletion |
| Art. 30 — Records of processing | Audit log retention 12+ months |
| Art. 33 — Breach notification | 72-hour notification process |

### 2.2 UAE Federal PDPL

| Requirement | Implementation |
|-------------|--------------|
| Data retention limits | Per schedule below |
| DSAR response | 30-day SLA |
| Breach notification | 72 hours to regulator |

### 2.3 India DPDP Act 2023

| Requirement | Implementation |
|-------------|--------------|
| Grievance Officer | in-privacy@twinmos.com |
| Consent management | Explicit consent for India users |
| Data retention | Minimal necessary period |
| Breach notification | 6h to CERT-In, 72h to DPB |

### 2.4 KSA PDPL

| Requirement | Implementation |
|-------------|--------------|
| Sensitive data localization | KSA user data stored in EU (documented TIA) |
| DSAR response | 30-day SLA |
| Cross-border transfer | Transfer Impact Assessment documented |

---

## 3. Data Classification

### 3.1 Classification Matrix

| Class | Examples | Protection |
|-------|----------|------------|
| Public | Product specs, news articles, retailer locations | Standard |
| Internal | Form submissions (non-PII), analytics aggregates | Protected |
| Confidential | PII (names, emails, phones), partner pricing | Restricted |
| Restricted | Serial numbers, financial records, CRM data | Highly restricted |

### 3.2 PII Inventory

| Data Element | Source | Classification | Retention |
|-------------|--------|---------------|-----------|
| Name | Forms | Confidential | Per form type |
| Email | Forms, newsletter | Confidential | Per form type / consent |
| Phone | Forms | Confidential | Per form type |
| Address | Warranty registration | Confidential | Warranty period + 2yr |
| IP Address | Analytics, logs | Internal | 26 months (GA4) / 12 mo (Plausible) |
| Cookie consent | CMP | Internal | 12 months |
| CV/Resume | Job applications | Confidential | 6 months (unless hired) |

---

## 4. Retention Schedules

### 4.1 Product and Catalog Data

| Data Type | Retention Period | Rationale | Disposal |
|-----------|-----------------|-----------|----------|
| Product records | Permanent | Business continuity | Archive only |
| Product images | Permanent | Brand asset | Archive only |
| Category definitions | Permanent | Taxonomy | Archive only |
| Compatibility QVL | 7 years | Product liability | Archive after 7yr |

### 4.2 Customer and Support Data

| Data Type | Retention Period | Rationale | Disposal |
|-----------|-----------------|-----------|----------|
| Form submissions | 2 years | Customer service | Anonymize after 2yr |
| Warranty registrations | Warranty period + 2 years | Legal obligation | Anonymize after period |
| RMA requests | 7 years | Product liability | Archive after 7yr |
| Serial number lookups | 1 year | Fraud prevention | Anonymize after 1yr |
| Counterfeit reports | 7 years | Legal evidence | Archive after 7yr |

### 4.3 Marketing and Communication Data

| Data Type | Retention Period | Rationale | Disposal |
|-----------|-----------------|-----------|----------|
| Newsletter subscribers | Until unsubscribe + 30 days | Consent-based | Delete on unsubscribe |
| Email campaign logs | 1 year | Analytics | Delete after 1yr |
| Marketing consent records | 3 years | Regulatory evidence | Delete after 3yr |
| Press/media contacts | Until relationship ends | Business need | Delete on request |

### 4.4 Partner and Commerce Data

| Data Type | Retention Period | Rationale | Disposal |
|-----------|-----------------|-----------|----------|
| Partner accounts | Until account closure + 2 years | Contract | Anonymize after period |
| Price lists | 3 years | Pricing history | Archive after 3yr |
| Orders (P3) | 7 years | Tax/VAT compliance | Archive after 7yr |
| Invoices (P3) | 7 years | UAE VAT compliance | Archive after 7yr |
| Payment records (P3) | 7 years | PCI/financial | Archive after 7yr |

### 4.5 System and Security Data

| Data Type | Retention Period | Rationale | Disposal |
|-----------|-----------------|-----------|----------|
| Audit logs | 12 months online + 24 months archive | Compliance evidence | Delete after 36mo |
| Access logs | 12 months | Security analysis | Delete after 12mo |
| Error logs | 6 months | Debugging | Delete after 6mo |
| Session data | 30 days (idle) / 8 hours (absolute) | Security | Delete on expiry |
| Backup logs | 12 months | DR verification | Delete after 12mo |

### 4.6 Content and Editorial Data

| Data Type | Retention Period | Rationale | Disposal |
|-----------|-----------------|-----------|----------|
| Published content | Permanent | Public record | Archive only |
| Draft content | 2 years | Editorial workflow | Delete after 2yr inactive |
| Soft-deleted content | 30 days | Recovery window | Hard delete after 30d |
| Media assets | Permanent | Brand asset | Archive only |

---

## 5. Data Deletion Procedures

### 5.1 Automated Deletion

| Schedule | Action | System |
|----------|--------|--------|
| Daily 03:00 UTC | Hard delete soft-deleted records > 30 days | PostgreSQL cron |
| Daily 03:00 UTC | Purge expired sessions | Better Auth / Redis |
| Weekly | Delete error logs > 6 months | Log rotation |
| Monthly | Anonymize old form submissions | Strapi cron |
| Monthly | Delete unsubscribed newsletter contacts | Strapi cron |
| Quarterly | Archive audit logs > 12 months | Backblaze B2 |
| Annually | Review and purge stale drafts | Manual review |

### 5.2 Manual Deletion

| Trigger | Process | SLA |
|---------|---------|-----|
| DSAR erasure request | Verify identity -> Queue deletion -> Confirm | 30 days |
| User account closure | Anonymize -> Retain order history (P3) | 30 days |
| Partner termination | Anonymize -> Retain contract records | 60 days |
| Legal hold | Suspend deletion -> Legal review | Until hold lifted |

### 5.3 Anonymization Standards

| Data Type | Anonymization Method |
|-----------|---------------------|
| Name | Replace with hash |
| Email | Replace with hash + domain |
| Phone | Truncate last 4 digits |
| Address | Remove street-level detail |
| IP Address | Truncate last octet |

---

## 6. Backup Retention

### 6.1 Backup Schedule

| Backup Type | Frequency | Retention | Location | Encryption |
|-------------|-----------|-----------|----------|------------|
| PostgreSQL pg_dump | Daily 02:00 UTC | 30 days daily | Backblaze B2 | AES-256 |
| PostgreSQL WAL | Continuous | 7 days | Backblaze B2 | AES-256 |
| Strapi uploads | On write | Versioned | Backblaze B2 | AES-256 |
| MeiliSearch dump | Daily | 7 days | Backblaze B2 | AES-256 |
| Coolify config | Weekly | 90 days | Backblaze B2 | AES-256 |
| Compliance archive | Quarterly | 7 years | B2 + Glacier Deep Archive | AES-256 |

### 6.2 Backup Recovery

| Scenario | Recovery Point | Method |
|----------|---------------|--------|
| Database corruption | Latest pg_dump + WAL replay | Restore + replay |
| Accidental deletion | Latest daily backup | Full restore |
| Point-in-time | Any 15-minute interval | WAL replay |
| Long-term archive | Quarterly snapshot | Glacier retrieval |

---

## 7. Audit Log Retention

### 7.1 Audit Log Schema

```typescript
interface AuditLogEntry {
  id: string;
  timestamp: ISO8601;
  user_id: string;
  user_email: string;
  action: AuditAction;
  resource_type: string;
  resource_id: string;
  changes: JsonDiff | null;
  ip_address: string;
  user_agent: string;
  request_id: string;
}
```

### 7.2 Audit Log Retention

| Period | Storage | Access |
|--------|---------|--------|
| 0-12 months | PostgreSQL (online) | Real-time query |
| 12-36 months | Backblaze B2 (archive) | REST API retrieval |
| > 36 months | Glacier Deep Archive | 24-48h retrieval |

### 7.3 Audit Actions Tracked

| Category | Actions |
|----------|---------|
| Authentication | admin_login, admin_logout, admin_login_failed |
| Content | content_create, content_update, content_delete, content_restore, content_publish, content_unpublish |
| User Management | user_create, user_update, user_disable, user_password_reset |
| Role Management | role_create, role_update, role_delete |
| Bulk Operations | bulk_import, bulk_export |
| System | webhook_trigger, plugin_install |

---

## 8. DSAR and Erasure

### 8.1 DSAR Endpoint

```
POST /legal/data-deletion-request/
Body: {
  email: string,
  country: string,
  request_type: "erasure" | "portability",
  verification_method: "email_otp"
}
```

### 8.2 DSAR Processing Workflow

```
1. Receive DSAR form submission
2. Send verification email (OTP)
3. User confirms identity
4. Queue data extraction / deletion
5. Execute within 30-day SLA
6. Send confirmation email
7. Log to audit trail
```

### 8.3 Data Portability

| Format | Delivery | Timeline |
|--------|----------|----------|
| JSON | Secure download link | 30 days |
| CSV | Secure download link | 30 days |
| Machine-readable | API endpoint | 30 days |

---

## 9. Cross-Border Data Transfer

### 9.1 Data Residency

| User Region | Primary Storage | CDN Edge |
|-------------|---------------|----------|
| EU/EEA | Hetzner Falkenstein (DE) | EU POPs |
| MEA/Africa | Hetzner Falkenstein (DE) | MEA POPs |
| Asia (India/BD) | Hetzner Helsinki (FI) | Asia POPs |
| US/North America | Hetzner Ashburn (US) | US POPs |
| KSA | Hetzner Falkenstein (DE) | Riyadh POP |

### 9.2 Transfer Impact Assessment

For KSA and other sensitive jurisdictions:
- Documented lawful basis for transfer
- Adequate protection measures (AES-256, TLS 1.3)
- Data minimization (only necessary fields)
- User notification in privacy policy

---

## 10. Compliance Monitoring

### 10.1 Quarterly Compliance Review

| Check | Owner | Method |
|-------|-------|--------|
| Retention schedule adherence | Legal | Automated report |
| DSAR response times | DPO | Ticket review |
| Backup integrity | DevOps | Restore test |
| Audit log completeness | Security | Log analysis |
| Consent record accuracy | Marketing | Database audit |

### 10.2 Annual Compliance Audit

- External auditor review (if required by jurisdiction)
- Penetration test focused on data protection
- Policy update for new regulations
- Staff training refresh

---

**Document End**
