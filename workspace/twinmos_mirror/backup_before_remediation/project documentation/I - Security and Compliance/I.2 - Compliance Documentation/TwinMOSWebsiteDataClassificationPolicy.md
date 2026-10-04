# Data Classification Policy

| Document Attribute | Value |
|---|---|
| **Document ID** | TWN-COMP-2026-003 |
| **Version** | 1.0.0 |
| **Status** | Draft |
| **Author** | Unisoft Technologies Security and Privacy Team |
| **Owner** | CISO / Data Protection Officer |
| **Review Date** | 2026-11-01 |
| **Classification** | Internal Use |
| **Related Documents** | TWN-SEC-2026-007 (Encryption Strategy), TWN-SEC-2026-008 (Key Management), TWN-COMP-2026-001 (DPIA), TWN-COMP-2026-002 (Records of Processing) |
| **Compliance Mapping** | ISO/IEC 27001:2022 A.5.9, A.5.10, A.5.12, A.8.1, GDPR Art. 32, UAE PDPL Art. 4, India DPDP Act 2023 S.6, KSA PDPL Art. 4 |

---

## 1. Executive Summary

This Data Classification Policy establishes the framework for classifying data processed by the TwinMOS corporate website based on its sensitivity, value, and regulatory requirements. The policy defines four classification levels, handling requirements for each level, and responsibilities for data stewardship.

**Policy Scope**: All data collected, processed, stored, or transmitted by the TwinMOS website, including customer data, partner data, operational data, and system data.

**Policy Objective**: Ensure that data receives an appropriate level of protection proportional to its sensitivity and regulatory requirements, while enabling efficient business operations.

---

## 2. Classification Framework

### 2.1 Classification Levels

| Level | Name | Color Code | Definition | Breach Impact |
|---|---|---|---|---|
| **L1** | Public | Green | Information intended for public disclosure; no restrictions on distribution | None |
| **L2** | Internal | Yellow | Information for internal use only; disclosure would cause minor business impact | Low reputational damage |
| **L3** | Confidential | Orange | Sensitive information; unauthorized disclosure would cause significant harm | Regulatory fines, significant reputational damage, financial loss |
| **L4** | Restricted | Red | Highly sensitive information; unauthorized disclosure would cause severe harm | Severe regulatory penalties, critical reputational damage, major financial loss, legal liability |

### 2.2 Classification Criteria Matrix

| Criterion | Weight | Assessment Method |
|---|---|---|
| Regulatory sensitivity | 30% | Applicable regulations (GDPR, PCI DSS, etc.) |
| Business impact of disclosure | 25% | Financial, competitive, operational impact |
| Data subject sensitivity | 20% | Special categories, minors, vulnerability |
| Volume of data | 15% | Number of records affected |
| Cross-border implications | 10% | Transfer restrictions, jurisdictional complexity |

---

## 3. Data Classification Catalog

### 3.1 Public (L1) Data

| Data Type | Examples | Storage | Transmission | Access |
|---|---|---|---|---|
| Marketing content | Product descriptions, images, videos, press releases | Unencrypted | Unencrypted (HTTPS) | Public |
| Company information | Office addresses, general contact details, public filings | Unencrypted | Unencrypted (HTTPS) | Public |
| Product specifications | Technical specs, compatibility lists, datasheets | Unencrypted | Unencrypted (HTTPS) | Public |
| Job postings | Open positions, role descriptions (excluding application data) | Unencrypted | Unencrypted (HTTPS) | Public |
| Website structure | Navigation, sitemap, public API documentation | Unencrypted | Unencrypted (HTTPS) | Public |

**Handling Requirements**:
- No encryption required at rest
- HTTPS for transmission
- No access restrictions
- No retention limits beyond business need

### 3.2 Internal (L2) Data

| Data Type | Examples | Storage | Transmission | Access |
|---|---|---|---|---|
| Website analytics (aggregated) | Page view counts, conversion rates, traffic sources | Unencrypted | TLS 1.3 | Internal teams |
| System logs (non-security) | Application performance logs, error logs (sanitized) | Unencrypted | TLS 1.3 | DevOps, Development |
| Content management metadata | Draft content, editorial calendars, publishing schedules | Encrypted at rest | TLS 1.3 | Editorial, Marketing |
| Internal documentation | Runbooks, architecture diagrams (non-sensitive) | Encrypted at rest | TLS 1.3 | Relevant teams |
| Employee directory | Names, titles, departments (business contact only) | Encrypted at rest | TLS 1.3 | All employees |

**Handling Requirements**:
- Encryption at rest recommended
- TLS 1.3 for transmission
- Role-based access control
- Retention per business policy
- Approved sharing within organization only

### 3.3 Confidential (L3) Data

| Data Type | Examples | Storage | Transmission | Access |
|---|---|---|---|---|
| Customer PII | Names, emails, phone numbers, addresses | AES-256-GCM | TLS 1.3 | Authorized staff only |
| Partner commercial data | Pricing, margins, contract terms, sales forecasts | AES-256-GCM | TLS 1.3 | Partner management, Finance |
| Authentication credentials | Password hashes, MFA secrets, JWT tokens | bcrypt + AES-256 | TLS 1.3 | Security team (hashes), Individual (secrets) |
| Support tickets | Customer issues, troubleshooting data, correspondence | AES-256-GCM | TLS 1.3 | Support team |
| Order history | Purchase records, shipping details, payment references | AES-256-GCM | TLS 1.3 | E-commerce, Finance |
| Website analytics (raw) | Individual user journeys, clickstreams, session data | AES-256-GCM | TLS 1.3 | Analytics team |
| Consent records | Consent choices, timestamps, withdrawal requests | AES-256-GCM | TLS 1.3 | Privacy team |
| Job applications | CVs, cover letters, interview notes | AES-256-GCM | TLS 1.3 | HR, Hiring managers |

**Handling Requirements**:
- Mandatory encryption at rest (AES-256-GCM)
- TLS 1.3 for transmission
- Strict RBAC with least privilege
- Audit logging for all access
- Need-to-know sharing only
- Retention per legal/business schedule
- Secure disposal (cryptographic erasure)

### 3.4 Restricted (L4) Data

| Data Type | Examples | Storage | Transmission | Access |
|---|---|---|---|---|
| Payment card data | PAN (Primary Account Number), CVV, track data | **NOT STORED** (tokenized) | TLS 1.3 + tokenization | None (processor only) |
| Cryptographic keys | Private keys, master secrets, API keys | HSM or encrypted vault | Never transmitted in plaintext | Security team (2-person rule) |
| Security incident data | Breach details, forensic evidence, attacker indicators | AES-256-GCM + air-gap | TLS 1.3 + encrypted container | CISO, Security team |
| DPIA and legal assessments | Full DPIA, attorney-client privileged material | AES-256-GCM | TLS 1.3 + encrypted email | Legal, DPO, CISO |
| Backups (full database) | Complete database backups containing all data tiers | AES-256-GCM + GPG | TLS 1.3 | Backup admin only |
| Audit and compliance evidence | Penetration test reports, audit findings, remediation plans | AES-256-GCM | TLS 1.3 + secure file transfer | CISO, External auditors |
| Shamir shares | Key recovery shares, split secrets | Physical media + encryption | Hand delivery only | Key custodians |

**Handling Requirements**:
- Mandatory encryption at rest (AES-256-GCM minimum)
- TLS 1.3 for transmission
- Multi-factor authentication for access
- Two-person rule for critical operations
- Comprehensive audit logging
- No external sharing without CISO approval
- Secure disposal with verification
- Air-gapped backup for highest sensitivity

---

## 4. Classification Lifecycle

### 4.1 Data Creation and Classification

| Stage | Action | Responsible |
|---|---|---|
| **Creation** | Data creator assesses sensitivity using classification criteria | Data Creator |
| **Initial Classification** | Assign provisional classification level | Data Creator |
| **Review** | Data owner validates classification within 5 business days | Data Owner |
| **Approval** | Classification recorded in data inventory | DPO / Data Governance |
| **Labeling** | Apply classification label to data and metadata | System (automated) or Data Creator |

### 4.2 Classification Review and Reclassification

| Trigger | Action | Timeline |
|---|---|---|
| New regulatory requirement | Review all affected data classes | 30 days |
| Business process change | Review data used in changed process | Before change |
| Security incident | Review classification of compromised data | Within incident response |
| Annual review | Comprehensive classification audit | Annually |
| Data aggregation | Reclassify if aggregation increases sensitivity | Upon aggregation |
| Data aging | Reclassify if sensitivity decreases over time | Per retention review |

### 4.3 Data Declassification

| From | To | Conditions | Approval |
|---|---|---|---|
| L4 Restricted | L3 Confidential | Key rotation complete, incident resolved | CISO |
| L3 Confidential | L2 Internal | Retention period expired, legal hold lifted | Data Owner |
| L2 Internal | L1 Public | Information published, no business sensitivity | Data Owner |
| Any | Destroyed | Retention expired, no legal hold, disposal verified | Data Owner + DPO |

---

## 5. Handling Requirements by Classification

### 5.1 Storage Requirements

| Requirement | L1 Public | L2 Internal | L3 Confidential | L4 Restricted |
|---|---|---|---|---|
| Encryption at rest | Optional | Recommended | Mandatory (AES-256-GCM) | Mandatory (AES-256-GCM) |
| Key management | N/A | Standard | Dedicated key | HSM / Shamir |
| Storage location | Any | Approved systems | Approved + segmented | Air-gapped / encrypted |
| Backup encryption | Optional | Recommended | Mandatory | Mandatory + GPG |
| Physical security | Standard | Standard | Restricted access | Vault / safe |

### 5.2 Transmission Requirements

| Requirement | L1 Public | L2 Internal | L3 Confidential | L4 Restricted |
|---|---|---|---|---|
| Minimum TLS | 1.2 | 1.3 | 1.3 | 1.3 |
| Certificate validation | Standard | Standard | Strict | Pinning |
| Email encryption | None | TLS | TLS + S/MIME | Encrypted container |
| File transfer | HTTPS | HTTPS + auth | SFTP + encryption | Secure courier |
| API authentication | None | API key | OAuth 2.0 + scope | mTLS + OAuth 2.0 |

### 5.3 Access Control Requirements

| Requirement | L1 Public | L2 Internal | L3 Confidential | L4 Restricted |
|---|---|---|---|---|
| Authentication | None | Username/password | Username/password + MFA | MFA + hardware token |
| Authorization | None | RBAC | RBAC + need-to-know | RBAC + need-to-know + 2-person |
| Audit logging | None | Standard | Comprehensive | Comprehensive + real-time |
| Session timeout | N/A | 8 hours | 1 hour | 15 minutes |
| Password policy | N/A | Standard | Strong + rotation | Strong + rotation + hardware |

### 5.4 Retention and Disposal

| Requirement | L1 Public | L2 Internal | L3 Confidential | L4 Restricted |
|---|---|---|---|---|
| Retention schedule | Business need | Business + legal | Legal + regulatory | Regulatory + legal hold |
| Disposal method | Delete | Secure delete | Cryptographic erasure | Physical destruction + verification |
| Disposal approval | None | Data Owner | Data Owner + DPO | CISO + DPO |
| Disposal log | None | Recommended | Mandatory | Mandatory + witness |

---

## 6. Roles and Responsibilities

### 6.1 Data Roles

| Role | Definition | Responsibilities |
|---|---|---|
| **Data Creator** | Person or system that generates data | Initial classification, proper handling, reporting misclassification |
| **Data Owner** | Business unit head responsible for data domain | Classification approval, access authorization, retention decisions |
| **Data Steward** | Operational manager for data quality | Day-to-day data management, compliance monitoring |
| **Data Custodian** | Technical team managing data infrastructure | Secure storage, backup, recovery, technical controls |
| **Data User** | Person accessing data for business purposes | Adherence to handling requirements, reporting incidents |

### 6.2 Organizational Responsibilities

| Role | Classification Responsibilities |
|---|---|
| **CISO** | Overall policy ownership, L4 approval, incident response, audit |
| **DPO** | Regulatory compliance, privacy classification, DSAR handling, DPIA |
| **CTO** | Technical implementation, encryption standards, access control systems |
| **Data Governance Lead** | Classification inventory, metadata management, quality assurance |
| **Legal Counsel** | Legal hold management, regulatory interpretation, contract terms |
| **Department Heads** | Data ownership within their domain, access approvals, retention decisions |
| **All Employees** | Adherence to policy, proper handling, incident reporting |

---

## 7. Technical Implementation

### 7.1 Automated Classification

| System | Classification Method | Coverage |
|---|---|---|
| **Strapi CMS** | Field-level classification tags | Content metadata, user data |
| **PostgreSQL** | Column-level encryption + labeling | Database fields |
| **File Storage** | Directory-level classification + filename prefixes | Uploaded files, documents |
| **API Gateway** | Request/response classification headers | API traffic |
| **Email Gateway** | DLP rules based on content analysis | Outbound email |
| **Backup System** | Backup job classification tags | Backup archives |

### 7.2 Classification Labels

| Label Format | Example | Application |
|---|---|---|
| Filename prefix | `[L3-CONFIDENTIAL]_partner_pricing_2026.xlsx` | Documents, files |
| Database tag | `classification='L3-CONFIDENTIAL'` | Database records |
| Email header | `X-Data-Classification: L3-CONFIDENTIAL` | Email |
| API header | `X-Data-Class: L3` | API responses |
| Log tag | `class=L3` | Log entries |
| Backup tag | `backup-class=L4-RESTRICTED` | Backup metadata |

### 7.3 Data Loss Prevention (DLP) Rules

| Rule | Trigger | Action | Classification |
|---|---|---|---|
| PII detection | Email containing 5+ email addresses | Block + alert | L3 |
| Credit card detection | Any PAN pattern | Block + alert + incident | L4 |
| Partner data exfiltration | Bulk download of partner records (>100) | Block + alert | L3 |
| Key material detection | Private key patterns in outbound traffic | Block + alert + incident | L4 |
| Unencrypted transmission | L3/L4 data over HTTP | Block + alert | L3/L4 |

---

## 8. Compliance Mapping

### 8.1 Regulatory Requirements by Classification

| Regulation | L1 | L2 | L3 | L4 |
|---|---|---|---|---|
| GDPR Art. 32 (Security) | N/A | Basic | Enhanced | Maximum |
| GDPR Art. 33 (Breach notification) | N/A | 72 hours | 72 hours | 72 hours + immediate |
| PCI DSS | N/A | N/A | Relevant | Full compliance |
| UAE PDPL Art. 4 | N/A | Basic | Enhanced | Maximum |
| India DPDP Act S.6 | N/A | Basic | Enhanced | Maximum |
| KSA PDPL Art. 4 | N/A | Basic | Enhanced | Maximum |
| ISO 27001 A.8.1 | N/A | Yes | Yes | Yes |

### 8.2 Audit Evidence

| Audit Type | Evidence Required | Classification Focus |
|---|---|---|
| GDPR compliance audit | Classification inventory, handling records, breach logs | L3, L4 |
| PCI DSS audit | Cardholder data classification, access logs, encryption proof | L4 |
| ISO 27001 audit | Classification policy, implementation records, training | All levels |
| Internal security audit | Access reviews, DLP logs, disposal records | L3, L4 |
| Penetration test | Classification of tested data, impact assessment | L3, L4 |

---

## 9. Training and Awareness

### 9.1 Training Requirements

| Role | Training Content | Frequency | Format |
|---|---|---|---|
| All staff | Classification basics, handling requirements, reporting | Annual | Online module |
| Data creators | Classification criteria, labeling, common mistakes | Annual | Workshop |
| Data owners | Ownership responsibilities, approval processes, legal implications | Annual | Workshop |
| Technical staff | Technical controls, encryption, DLP, secure disposal | Annual + updates | Technical training |
| Security team | Advanced classification, incident response, forensics | Quarterly | Advanced training |

### 9.2 Awareness Metrics

| Metric | Target | Measurement |
|---|---|---|
| Training completion rate | 100% | Quarterly |
| Classification accuracy | > 95% | Spot checks |
| Incident reporting rate | > 90% of incidents reported within 1 hour | Per incident |
| Policy acknowledgment | 100% | Annual |

---

## 10. Policy Governance

### 10.1 Policy Maintenance

| Aspect | Frequency | Owner |
|---|---|---|
| Full policy review | Annual | CISO |
| Classification catalog update | Quarterly | Data Governance |
| Technical control review | Quarterly | Security Engineer |
| Training material update | Annual | HR / Security |
| Exception review | Per exception | CISO |

### 10.2 Exceptions

| Exception Type | Approval | Conditions | Review |
|---|---|---|---|
| Temporary downgrade | Data Owner + CISO | Time-limited, documented risk acceptance | 30 days |
| Emergency access | CISO on-call | Incident response, full audit trail | Post-incident |
| Legacy system | CISO + CTO | Migration plan, compensating controls | Quarterly |
| Third-party sharing | DPO + Legal | DPA in place, equivalent protection | Per contract |

---

## 11. Document Change Log

| Version | Date | Author | Change Description |
|---|---|---|---|
| 1.0.0 | 2026-05-01 | Security and Privacy Team | Initial policy with 4-tier classification framework |

---

## 12. Appendices

### Appendix A: Classification Decision Tree

```
START
|
+-- Is the data intended for public disclosure?
|   +-- YES --> L1 PUBLIC
|   +-- NO
|       +-- Is the data regulated (GDPR, PCI DSS, etc.)?
|           +-- YES
|               +-- Is it payment card data or cryptographic keys?
|                   +-- YES --> L4 RESTRICTED
|                   +-- NO --> L3 CONFIDENTIAL
|           +-- NO
|               +-- Would disclosure cause significant business harm?
|                   +-- YES --> L3 CONFIDENTIAL
|                   +-- NO --> L2 INTERNAL
```

### Appendix B: Quick Reference Card

| Do | Don't |
|---|---|
| Classify data at creation | Assume all data is L1 |
| Label files and emails clearly | Remove classification labels |
| Use encryption for L3/L4 | Email L3/L4 data without encryption |
| Report classification errors | Ignore suspected misclassification |
| Follow retention schedules | Keep data longer than necessary |
| Securely dispose of data | Delete L3/L4 data without verification |
| Verify recipient authorization | Share L3/L4 with unauthorized persons |

### Appendix C: Data Classification Inventory Template

| Asset ID | Asset Name | Data Types | Classification | Owner | Location | Encryption | Last Review |
|---|---|---|---|---|---|---|---|
| DB-001 | PostgreSQL Production | Customer PII, orders | L3 | CTO | Hetzner DE | LUKS + AES-256 | 2026-05-01 |
| ST-001 | Strapi CMS | Content, user data | L3 | CTO | Hetzner DE | LUKS | 2026-05-01 |
| BK-001 | Backup Archive | All data tiers | L4 | CISO | Backblaze B2 | GPG + AES-256 | 2026-05-01 |
| API-001 | REST API | Mixed (L1-L3) | Mixed | CTO | Hetzner DE | TLS 1.3 | 2026-05-01 |
| DOC-001 | Partner Contracts | Commercial terms | L3 | Legal | Encrypted storage | AES-256 | 2026-05-01 |
