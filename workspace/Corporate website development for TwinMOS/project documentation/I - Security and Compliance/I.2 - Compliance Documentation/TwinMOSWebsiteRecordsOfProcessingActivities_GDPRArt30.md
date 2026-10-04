# Records of Processing Activities (GDPR Article 30)

| Document Attribute | Value |
|---|---|
| **Document ID** | TWN-COMP-2026-002 |
| **Version** | 1.0.0 |
| **Status** | Draft |
| **Author** | Unisoft Technologies Privacy Team |
| **Owner** | Data Protection Officer (DPO) |
| **Review Date** | 2026-11-01 |
| **Classification** | Confidential |
| **Related Documents** | TWN-COMP-2026-001 (DPIA), TWN-COMP-2026-003 (Data Classification), TWN-COMP-2026-005 (DSAR Workflow) |
| **Compliance Mapping** | GDPR Art. 30, UAE PDPL Art. 10, India DPDP Act 2023 S.8, KSA PDPL Art. 16, ISO/IEC 27701:2019 Clause 7.2.2 |

---

## 1. Executive Summary

This document constitutes the formal Records of Processing Activities (ROPA) for TwinMOS Technologies Co., Ltd. in relation to the corporate website. It satisfies the obligations under GDPR Article 30 and equivalent requirements in UAE PDPL, India DPDP Act 2023, and KSA PDPL.

The record covers all processing activities conducted by TwinMOS as a data controller and documents processing conducted on behalf of TwinMOS by data processors.

**Last Updated**: 2026-05-01
**Next Audit**: 2026-11-01

---

## 2. Controller's Processing Activities

### 2.1 Processing Activity Register

#### Activity 1: Website Analytics and Performance Monitoring

| Field | Details |
|---|---|
| **Activity ID** | CTRL-001 |
| **Activity Name** | Website Analytics and Performance Monitoring |
| **Purpose** | Understand website usage patterns, improve user experience, measure marketing effectiveness, detect technical issues |
| **Legal Basis** | Art. 6(1)(f) - Legitimate interest (website optimization); Art. 6(1)(a) - Consent (marketing analytics) |
| **Categories of Data Subjects** | All website visitors |
| **Categories of Personal Data** | IP address (anonymized), browser type, device type, operating system, referral source, pages visited, time on site, click patterns, approximate location (country/city level) |
| **Special Category Data** | None |
| **Recipients** | Internal: Marketing team, Product team, Development team; External: Cloudflare (CDN analytics) |
| **Transfers to Third Countries** | Cloudflare (USA) - SCCs Module 2 |
| **Retention Period** | Raw logs: 90 days; Aggregated analytics: 26 months; Marketing attribution: 13 months |
| **Security Measures** | IP anonymization (last octet), pseudonymized user IDs, TLS 1.3, access logs restricted |
| **DPIA Reference** | TWN-COMP-2026-001, Risk R-012 |

#### Activity 2: Customer Account Management

| Field | Details |
|---|---|
| **Activity ID** | CTRL-002 |
| **Activity Name** | Customer Account Management |
| **Purpose** | Provide registered users with personalized experience, order history, warranty tracking, saved preferences |
| **Legal Basis** | Art. 6(1)(b) - Contract performance; Art. 6(1)(f) - Legitimate interest (fraud prevention) |
| **Categories of Data Subjects** | Registered customers (Phase 3) |
| **Categories of Personal Data** | Name, email address, phone number, shipping address, billing address, order history, warranty claims, product preferences, account settings |
| **Special Category Data** | None |
| **Recipients** | Internal: Customer service, Finance, Logistics; External: Payment processor (Stripe/Adyen), Shipping providers |
| **Transfers to Third Countries** | Payment processor (varies by region) - SCCs; Shipping providers (regional) - contract clauses |
| **Retention Period** | Active account: duration of account; Deleted account: 2 years (legal obligation); Order data: 7 years (tax) |
| **Security Measures** | AES-256-GCM encryption for sensitive fields, bcrypt password hashing, MFA, RBAC, audit logging |
| **DPIA Reference** | TWN-COMP-2026-001, Risk R-001 |

#### Activity 3: Newsletter and Marketing Communications

| Field | Details |
|---|---|
| **Activity ID** | CTRL-003 |
| **Activity Name** | Newsletter and Marketing Communications |
| **Purpose** | Send product updates, promotional offers, company news, event invitations to subscribers |
| **Legal Basis** | Art. 6(1)(a) - Consent (explicit opt-in) |
| **Categories of Data Subjects** | Newsletter subscribers, opted-in customers |
| **Categories of Personal Data** | Email address, name (optional), language preference, subscription date, IP address at signup, engagement metrics (opens, clicks) |
| **Special Category Data** | None |
| **Recipients** | Internal: Marketing team; External: Email service provider (to be selected) |
| **Transfers to Third Countries** | TBD based on ESP selection |
| **Retention Period** | Active subscription: until unsubscribe; Unsubscribed: 2 years (consent record); Suppression list: indefinitely |
| **Security Measures** | Double opt-in, unsubscribe in every email, consent timestamp logging, encrypted storage |
| **DPIA Reference** | TWN-COMP-2026-001, Risk R-004 |

#### Activity 4: Partner and Distributor Management

| Field | Details |
|---|---|
| **Activity ID** | CTRL-004 |
| **Activity Name** | Partner and Distributor Management |
| **Purpose** | Manage partner relationships, process distributor applications, track sales performance, calculate commissions |
| **Legal Basis** | Art. 6(1)(b) - Contract performance; Art. 6(1)(f) - Legitimate interest (business relationship management) |
| **Categories of Data Subjects** | Partner company representatives, distributor contacts |
| **Categories of Personal Data** | Name, email, phone, company name, job title, business address, VAT/tax ID, distributor tier, sales data, commission records, contract documents |
| **Special Category Data** | None |
| **Recipients** | Internal: Partner management team, Sales, Finance; External: None (internal processing only) |
| **Transfers to Third Countries** | None (data remains in EU) |
| **Retention Period** | Active partner: duration of contract; Terminated partner: 5 years post-termination (legal obligation) |
| **Security Measures** | Role-based access, encryption at rest, audit logs, NDAs with all partner contacts |
| **DPIA Reference** | TWN-COMP-2026-001, Risk R-006 |

#### Activity 5: Customer Support and Ticketing

| Field | Details |
|---|---|
| **Activity ID** | CTRL-005 |
| **Activity Name** | Customer Support and Ticketing |
| **Purpose** | Handle customer inquiries, technical support requests, warranty claims, product returns |
| **Legal Basis** | Art. 6(1)(b) - Contract performance; Art. 6(1)(f) - Legitimate interest (service improvement) |
| **Categories of Data Subjects** | Customers seeking support, warranty claimants |
| **Categories of Personal Data** | Name, email, phone, address, product serial numbers, purchase date, issue description, chat transcripts, email correspondence, attachment metadata |
| **Special Category Data** | Health data (only if warranty claim involves injury - rare) |
| **Recipients** | Internal: Support team, Technical team, Quality assurance; External: None |
| **Transfers to Third Countries** | None |
| **Retention Period** | Resolved tickets: 3 years; Warranty claims: 7 years; Escalated issues: 5 years |
| **Security Measures** | Ticket encryption, access restricted to support team, redaction of sensitive data in logs |
| **DPIA Reference** | TWN-COMP-2026-001, Risk R-001 |

#### Activity 6: Job Applications and Recruitment

| Field | Details |
|---|---|
| **Activity ID** | CTRL-006 |
| **Activity Name** | Job Applications and Recruitment |
| **Purpose** | Process job applications, conduct interviews, evaluate candidates, maintain talent pool |
| **Legal Basis** | Art. 6(1)(a) - Consent (application); Art. 6(1)(b) - Contract preparation (pre-employment) |
| **Categories of Data Subjects** | Job applicants, passive candidates |
| **Categories of Personal Data** | Name, email, phone, address, CV/resume, cover letter, employment history, education, references, interview notes, assessment results |
| **Special Category Data** | None collected proactively; if voluntarily provided (e.g., disability accommodation), handled under Art. 9(2)(a) consent |
| **Recipients** | Internal: HR team, Hiring managers, Interview panel; External: Background check provider (if applicable) |
| **Transfers to Third Countries** | None |
| **Retention Period** | Successful candidate: transferred to employee file; Unsuccessful: 1 year (with consent for talent pool: 2 years) |
| **Security Measures** | Encrypted storage, access limited to HR and hiring team, automatic deletion after retention period |
| **DPIA Reference** | TWN-COMP-2026-001 |

#### Activity 7: E-Commerce Transactions (Phase 3)

| Field | Details |
|---|---|
| **Activity ID** | CTRL-007 |
| **Activity Name** | E-Commerce Transactions |
| **Purpose** | Process online orders, handle payments, fulfill shipments, manage returns and refunds |
| **Legal Basis** | Art. 6(1)(b) - Contract performance; Art. 6(1)(c) - Legal obligation (tax); Art. 6(1)(f) - Fraud prevention |
| **Categories of Data Subjects** | Online purchasers |
| **Categories of Personal Data** | Name, email, phone, shipping address, billing address, payment method (tokenized), order details, transaction history, refund records |
| **Special Category Data** | None |
| **Recipients** | Internal: E-commerce team, Finance, Logistics; External: Payment processor, Shipping carriers, Tax authorities |
| **Transfers to Third Countries** | Payment processor (region-dependent) - SCCs |
| **Retention Period** | Transaction data: 7 years (tax); Account data: 2 years post-deletion |
| **Security Measures** | PCI DSS compliant payment flow (tokenization), TLS 1.3, fraud detection rules, audit logging |
| **DPIA Reference** | TWN-COMP-2026-001, Risk R-001, R-002 |

#### Activity 8: Security and Fraud Prevention

| Field | Details |
|---|---|
| **Activity ID** | CTRL-008 |
| **Activity Name** | Security and Fraud Prevention |
| **Purpose** | Protect website and users from malicious activity, detect fraud, prevent abuse, ensure service availability |
| **Legal Basis** | Art. 6(1)(f) - Legitimate interest (security); Art. 6(1)(c) - Legal obligation (security standards) |
| **Categories of Data Subjects** | All website visitors (including potential attackers) |
| **Categories of Personal Data** | IP address, user agent, request patterns, login attempts, MFA events, device fingerprint, geolocation (approximate), threat intelligence indicators |
| **Special Category Data** | None |
| **Recipients** | Internal: Security team, DevOps; External: Cloudflare (WAF logs), Threat intelligence providers |
| **Transfers to Third Countries** | Cloudflare (USA) - SCCs |
| **Retention Period** | Security logs: 90 days; Fraud investigation data: 1 year; Attack patterns: 2 years |
| **Security Measures** | Automated log analysis, anomaly detection, WAF rules, rate limiting, encrypted storage |
| **DPIA Reference** | TWN-COMP-2026-001, Risk R-002 |

#### Activity 9: Product Registration and Warranty

| Field | Details |
|---|---|
| **Activity ID** | CTRL-009 |
| **Activity Name** | Product Registration and Warranty Management |
| **Purpose** | Enable customers to register products, validate warranties, process warranty claims, provide product support |
| **Legal Basis** | Art. 6(1)(b) - Contract performance; Art. 6(1)(f) - Legitimate interest (product improvement) |
| **Categories of Data Subjects** | Product owners, warranty claimants |
| **Categories of Personal Data** | Name, email, phone, address, product serial number, purchase date, retailer, warranty status, claim history, replacement records |
| **Special Category Data** | None |
| **Recipients** | Internal: Warranty team, Product team, Quality assurance; External: Retailers (for validation only) |
| **Transfers to Third Countries** | None |
| **Retention Period** | Warranty period + 2 years; Product lifecycle data: 5 years |
| **Security Measures** | Serial number validation, encrypted storage, access control, audit trail |
| **DPIA Reference** | TWN-COMP-2026-001 |

#### Activity 10: Cookie and Consent Management

| Field | Details |
|---|---|
| **Activity ID** | CTRL-010 |
| **Activity Name** | Cookie and Consent Management |
| **Purpose** | Manage user consent for cookies and tracking, record consent decisions, honor withdrawal requests |
| **Legal Basis** | Art. 6(1)(c) - Legal obligation (ePrivacy Directive); Art. 6(1)(f) - Legitimate interest (consent record integrity) |
| **Categories of Data Subjects** | All website visitors |
| **Categories of Personal Data** | Consent choices, consent timestamp, IP address (hashed), browser identifier, consent version |
| **Special Category Data** | None |
| **Recipients** | Internal: Privacy team, Legal; External: None |
| **Transfers to Third Countries** | None |
| **Retention Period** | Active consent: 13 months; Withdrawn consent: 2 years (audit trail) |
| **Security Measures** | Tamper-evident consent records, cryptographic hashing of identifiers, encrypted storage |
| **DPIA Reference** | TWN-COMP-2026-001, Risk R-004 |

---

## 3. Processor's Processing Activities

### 3.1 Processor Register

#### Processor 1: Unisoft Technologies (Development and Hosting Management)

| Field | Details |
|---|---|
| **Processing ID** | PROC-001 |
| **Processor Name** | Unisoft Technologies |
| **Processor Role** | Primary development partner and hosting management |
| **Processing Activities** | Website development, deployment, server management, database administration, security monitoring, backup management |
| **Categories of Data Subjects** | All website users |
| **Categories of Personal Data** | All personal data processed by the website (full access for technical management) |
| **Security Measures** | ISO 27001 aligned, encrypted communications, access logging, staff NDAs, background checks |
| **Sub-processors Used** | Hetzner, Cloudflare, Backblaze B2, MeiliSearch |
| **DPA Status** | Signed - TWN-DPA-2026-001 |
| **Audit Rights** | Annual audit, penetration test participation |

#### Processor 2: Cloudflare, Inc.

| Field | Details |
|---|---|
| **Processing ID** | PROC-002 |
| **Processor Name** | Cloudflare, Inc. |
| **Processor Role** | CDN, WAF, DDoS protection, DNS, edge computing |
| **Processing Activities** | Content delivery, security filtering, traffic analytics, bot management, SSL termination |
| **Categories of Data Subjects** | All website visitors |
| **Categories of Personal Data** | IP address, user agent, request URL, request headers, TLS fingerprint, approximate geolocation |
| **Security Measures** | SOC 2 Type II, ISO 27001, encrypted transit and storage, data minimization at edge |
| **Sub-processors Used** | None (direct services) |
| **DPA Status** | Signed - Cloudflare DPA (Standard) |
| **Audit Rights** | SOC 2 report available, annual security questionnaire |

#### Processor 3: Hetzner Online GmbH

| Field | Details |
|---|---|
| **Processing ID** | PROC-003 |
| **Processor Name** | Hetzner Online GmbH |
| **Processor Role** | Infrastructure hosting |
| **Processing Activities** | Virtual server hosting, network connectivity, hardware maintenance |
| **Categories of Data Subjects** | All website users |
| **Categories of Personal Data** | All data stored on hosted servers (indirect access only for maintenance) |
| **Security Measures** | ISO 27001 certified data centers, physical security, encrypted storage, access controls |
| **Sub-processors Used** | None |
| **DPA Status** | Signed - Hetzner DPA |
| **Audit Rights** | ISO 27001 certificate, data center audit by appointment |

#### Processor 4: Backblaze, Inc.

| Field | Details |
|---|---|
| **Processing ID** | PROC-004 |
| **Processor Name** | Backblaze, Inc. |
| **Processor Role** | Backup storage |
| **Processing Activities** | Encrypted backup storage, backup retrieval, disaster recovery |
| **Categories of Data Subjects** | All website users |
| **Categories of Personal Data** | All data included in backups (full database backups, file backups) |
| **Security Measures** | SOC 2 Type II, encryption at rest (AES-256), encryption in transit (TLS 1.2+), access logging |
| **Sub-processors Used** | None |
| **DPA Status** | Signed - Backblaze DPA |
| **Audit Rights** | SOC 2 report available |

#### Processor 5: MeiliSearch (Self-Hosted)

| Field | Details |
|---|---|
| **Processing ID** | PROC-005 |
| **Processor Name** | MeiliSearch (Open Source, Self-Hosted) |
| **Processor Role** | Search engine |
| **Processing Activities** | Indexing website content, processing search queries, returning search results |
| **Categories of Data Subjects** | Website visitors using search |
| **Categories of Personal Data** | Search queries (may contain personal data if user searches for own information) |
| **Security Measures** | Self-hosted on Hetzner, no external data sharing, access controlled via API |
| **Sub-processors Used** | None |
| **DPA Status** | N/A (self-hosted, no external service) |
| **Audit Rights** | Full internal audit capability |

---

## 4. Cross-Border Data Transfer Register

| Transfer ID | Data Exporter | Data Importer | Countries | Transfer Mechanism | Data Categories | Status |
|---|---|---|---|---|---|---|
| XFR-001 | TwinMOS (EU operations) | Cloudflare | Germany -> USA | SCCs Module 2 + TIA | Web traffic, security logs, analytics | Active |
| XFR-002 | TwinMOS (EU operations) | Backblaze | Germany -> USA | SCCs Module 2 + TIA | Backup data (encrypted) | Active |
| XFR-003 | TwinMOS (UAE operations) | Cloudflare | UAE -> USA | SCCs Module 2 + TIA | Web traffic, security logs | Planned |
| XFR-004 | TwinMOS (India operations) | Cloudflare | India -> USA | SCCs Module 2 + TIA | Web traffic, security logs | Planned |
| XFR-005 | TwinMOS (KSA operations) | Cloudflare | KSA -> USA | SCCs Module 2 + TIA | Web traffic, security logs | Planned |
| XFR-006 | TwinMOS (Africa operations) | Cloudflare | Various -> USA | SCCs Module 2 + TIA | Web traffic, security logs | Planned |
| XFR-007 | TwinMOS (EU) | Payment Processor | Germany -> Various | SCCs + regional agreements | Payment tokens, transaction data | Phase 3 |
| XFR-008 | TwinMOS (EU) | Shipping Provider | Germany -> Various | Contractual clauses | Shipping addresses | Phase 3 |

---

## 5. Data Subject Rights Management

### 5.1 Rights Request Tracking

| Right | Request Method | Verification Required | Response Time | Escalation Path |
|---|---|---|---|---|
| **Access (Art. 15)** | Online portal, email (privacy@twinmos.com) | Identity verification (email + phone OTP) | 30 days | DPO review if complex |
| **Rectification (Art. 16)** | Online portal, email | Authentication to account | 30 days | DPO if disputed |
| **Erasure (Art. 17)** | Online portal, email | Strong identity verification | 30 days | Legal review if legal obligation conflicts |
| **Restriction (Art. 18)** | Email only | Identity verification | 30 days | DPO review |
| **Portability (Art. 20)** | Online portal | Authentication | 30 days | Technical team for format conversion |
| **Objection (Art. 21)** | Online portal, email | Authentication | Immediate for marketing; 30 days for legitimate interest | DPO review |
| **Automated Decision-Making (Art. 22)** | Email only | Identity verification | 30 days | Human review mandatory |

### 5.2 Request Volume Estimates

| Phase | Expected Monthly Requests | Staffing Required | System Load |
|---|---|---|---|
| Phase 1 | 5-10 | 0.2 FTE (part-time DPO) | Low |
| Phase 2 | 15-25 | 0.5 FTE | Medium |
| Phase 3 | 50-100 | 1.0 FTE + automation | High |

---

## 6. Retention Schedule

| Data Category | Retention Period | Legal Basis for Retention | Deletion Method |
|---|---|---|---|
| Website access logs | 90 days | Legitimate interest (security) | Automated purge |
| Analytics data (raw) | 26 months | Consent | Automated anonymization |
| Analytics data (aggregated) | Indefinite | Legitimate interest | N/A (anonymized) |
| Customer account data | Account lifetime + 2 years | Contract | Manual + automated cascade |
| Order/transaction data | 7 years | Tax obligation | Soft delete + archive purge |
| Support tickets | 3 years | Contract / Legitimate interest | Automated purge |
| Newsletter subscriptions | Until unsubscribe + 2 years | Consent record | Automated purge |
| Partner data | Contract + 5 years | Legal obligation | Manual review + purge |
| Job applications (unsuccessful) | 1 year (2 years with consent) | Consent | Automated purge |
| Security incident data | 2 years | Legal obligation | Manual review |
| Consent records | 2 years post-withdrawal | Legal obligation | Automated purge |
| Backup data | 30 days (rolling) | Disaster recovery | Automated rotation |
| Audit logs | 1 year | Legal obligation | Automated purge |

---

## 7. Governance and Maintenance

### 7.1 Update Triggers

| Trigger | Action | Owner | Timeline |
|---|---|---|---|
| New processing activity | Add to register, conduct mini-DPIA | DPO | Before launch |
| New processor | Add to processor register, sign DPA | DPO / Procurement | Before engagement |
| New sub-processor | Update processor record, assess risk | DPO | Before engagement |
| Processing change | Update activity details, re-assess risk | DPO | Before change |
| Retention period change | Update schedule, verify compliance | Data Governance | Before change |
| Quarterly review | Validate accuracy, update contacts | DPO | Quarterly |
| Annual audit | Full register review, external validation | DPO / External auditor | Annually |

### 7.2 Version Control

| Version | Date | Changes | Author |
|---|---|---|---|
| 1.0.0 | 2026-05-01 | Initial register covering Phase 1-3 | Privacy Team |

### 7.3 Access Control

| Role | Access Level | Justification |
|---|---|---|
| DPO | Full read/write | Regulatory obligation |
| CISO | Full read, limited write (security activities) | Security oversight |
| Legal Counsel | Full read | Legal compliance |
| CTO | Read (technical activities) | Technical oversight |
| External Auditor | Read (with NDA) | Audit requirement |
| Supervisory Authority | Read (on request) | Regulatory inspection |

---

## 8. Appendices

### Appendix A: Legal Basis Reference

| Legal Basis (GDPR Art. 6) | Applicable Activities | Documentation Required |
|---|---|---|
| Art. 6(1)(a) - Consent | Marketing, analytics (optional), job applications | Consent records, opt-in timestamps, withdrawal logs |
| Art. 6(1)(b) - Contract | Account management, e-commerce, support, warranty, partners | Contract terms, service descriptions |
| Art. 6(1)(c) - Legal Obligation | Tax records, security logs, consent records | Legal references, retention schedules |
| Art. 6(1)(f) - Legitimate Interest | Security, fraud prevention, analytics (essential), service improvement | Legitimate interest assessment (LIA) |

### Appendix B: Data Subject Categories

| Category | Count (Est.) | Primary Jurisdictions | Sensitive Data? |
|---|---|---|---|
| Anonymous visitors | 500,000/month | Global | No |
| Registered customers | 50,000 (Phase 3) | EU, UAE, India, KSA, Africa, SE Asia | No |
| Partner representatives | 500 | Global | No (commercial) |
| Newsletter subscribers | 10,000 | Global | No |
| Job applicants | 200/year | Global | Potential (if disability disclosed) |
| Product owners (registered) | 100,000 (Phase 3) | Global | No |

### Appendix C: Processing Location Map

| Location | Role | Data Types | Legal Basis for Location |
|---|---|---|---|
| Germany (Hetzner) | Primary hosting | All production data | EU data center for GDPR compliance |
| USA (Cloudflare) | CDN/Edge | Cached content, security logs | SCCs + TIA |
| USA (Backblaze) | Backups | Encrypted backups | SCCs + TIA |
| France (MeiliSearch) | Search index | Search index data | EU data center |
| Various (regional) | Payment processing | Payment tokens | Regional payment provider |
