# Data Subject Access Request (DSAR) Processing Workflow

| Document Attribute | Value |
|---|---|
| **Document ID** | TWN-COMP-2026-005 |
| **Version** | 1.0.0 |
| **Status** | Draft |
| **Author** | Unisoft Technologies Privacy Team |
| **Owner** | Data Protection Officer (DPO) |
| **Review Date** | 2026-11-01 |
| **Classification** | Internal Use |
| **Related Documents** | TWN-COMP-2026-001 (DPIA), TWN-COMP-2026-002 (Records of Processing), TWN-COMP-2026-003 (Data Classification) |
| **Compliance Mapping** | GDPR Art. 12-22, UAE PDPL Art. 14-18, India DPDP Act 2023 S.12-14, KSA PDPL Art. 17-20, ISO/IEC 27701:2019 Clause 7.3 |

---

## 1. Executive Summary

This document defines the end-to-end workflow for receiving, validating, processing, and responding to Data Subject Access Requests (DSARs) under GDPR, UAE PDPL, India DPDP Act 2023, and KSA PDPL. The workflow ensures compliance with statutory timeframes, maintains audit trails, and protects both data subject rights and organizational interests.

**Statutory Timeframes**:
- GDPR: 30 calendar days (extendable to 60 for complex requests)
- UAE PDPL: 30 calendar days
- India DPDP: 30 days
- KSA PDPL: 30 days

**Target Response Time**: 25 days (95th percentile) to allow buffer for complex cases.

---

## 2. DSAR Types and Scope

### 2.1 Request Types

| Right | Article Reference | Description | Fee |
|---|---|---|---|
| **Access** | GDPR Art. 15 | Obtain copy of personal data and processing information | Free |
| **Rectification** | GDPR Art. 16 | Correct inaccurate or incomplete personal data | Free |
| **Erasure (Right to be Forgotten)** | GDPR Art. 17 | Delete personal data under specific conditions | Free |
| **Restriction** | GDPR Art. 18 | Limit processing under specific conditions | Free |
| **Data Portability** | GDPR Art. 20 | Receive data in structured, machine-readable format | Free |
| **Objection** | GDPR Art. 21 | Object to processing based on legitimate interest | Free |
| **Automated Decision-Making** | GDPR Art. 22 | Contest decisions made solely by automated means | Free |
| **Withdraw Consent** | GDPR Art. 7(3) | Withdraw previously given consent | Free |

### 2.2 Scope by Data Subject Category

| Category | Accessible Data | Exclusions | Verification Level |
|---|---|---|---|
| **Registered Customer** | Account data, order history, support tickets, preferences | Payment card data (tokenized), fraud investigation data | Standard (login) |
| **Website Visitor** | Analytics data (pseudonymized), cookie consent records | Aggregated analytics, other users' data | Enhanced (ID proof) |
| **Partner Representative** | Profile data, sales data, commission records, contracts | Other partners' data, TwinMOS internal strategy | Standard (login) |
| **Newsletter Subscriber** | Email, subscription history, engagement metrics | Marketing campaign data, other subscribers | Standard (email + OTP) |
| **Job Applicant** | Application data, interview notes, assessment results | Other candidates' data, hiring committee deliberations | Enhanced (ID proof) |
| **Product Owner** | Registration data, warranty claims, product preferences | Other owners' data, product development data | Standard (login) |

---

## 3. Request Intake

### 3.1 Submission Channels

| Channel | URL/Address | Availability | Target Acknowledgment |
|---|---|---|---|
| **Online Portal** | https://twinmos.com/privacy/dsar | 24/7 | Immediate (automated) |
| **Email** | privacy@twinmos.com | 24/7 | Within 24 hours |
| **Postal Mail** | TwinMOS Technologies, Attn: DPO, [Address] | Business hours | Within 48 hours of receipt |
| **Phone** | +[Country Code] [Phone] | Business hours | Immediate (if during hours) |
| **In-Person** | TwinMOS office (by appointment) | Business hours | Immediate |

### 3.2 Intake Form Requirements

| Field | Required | Purpose |
|---|---|---|
| Full name | Yes | Identity verification |
| Email address | Yes | Primary communication channel |
| Phone number | No | Secondary verification |
| Request type | Yes | Route to correct workflow |
| Specific data description | Recommended | Narrow scope, faster response |
| Date range | Recommended | Limit search scope |
| Proof of identity | Yes (for enhanced) | Prevent unauthorized access |
| Preferred format | No | JSON, PDF, CSV for portability |

### 3.3 Automated Intake Processing

```
[Request Received]
    |
    +-- [Online Portal] --> [Auto-acknowledge] --> [Create Ticket] --> [Assign DSAR ID]
    |
    +-- [Email] --> [Auto-reply] --> [Manual ticket creation] --> [Assign DSAR ID]
    |
    +-- [Mail/Phone/In-Person] --> [Manual intake] --> [Create Ticket] --> [Assign DSAR ID]
```

---

## 4. Identity Verification

### 4.1 Verification Tiers

| Tier | Method | Use Case | Data Sensitivity |
|---|---|---|---|
| **Tier 1: Standard** | Account login + email confirmation | Registered users requesting own data | L2-L3 |
| **Tier 2: Enhanced** | Government-issued ID + selfie + address verification | Non-registered users, sensitive data requests | L3-L4 |
| **Tier 3: Legal Representative** | Power of attorney + representative ID + subject ID | Requests by guardians, attorneys, executors | All |
| **Tier 4: Minor/Guardian** | Guardian ID + birth certificate + relationship proof | Requests concerning children's data | All |

### 4.2 Verification Process

#### Tier 1 (Standard)

| Step | Action | Timeline | Owner |
|---|---|---|---|
| 1 | User logs into account | Day 0 | Data Subject |
| 2 | Submits DSAR through authenticated portal | Day 0 | Data Subject |
| 3 | System sends confirmation email with OTP | Day 0 | Automated |
| 4 | User confirms via OTP | Day 0-1 | Data Subject |
| 5 | Identity verified; request proceeds to processing | Day 1 | System |

#### Tier 2 (Enhanced)

| Step | Action | Timeline | Owner |
|---|---|---|---|
| 1 | Request submitted via email/portal without login | Day 0 | Data Subject |
| 2 | DPO sends identity verification request | Day 1 | DPO |
| 3 | Data subject submits: government ID + selfie holding ID + recent utility bill | Day 1-5 | Data Subject |
| 4 | DPO reviews documents; redacts and stores securely | Day 5-7 | DPO |
| 5 | Identity verified; request proceeds to processing | Day 7 | DPO |
| 6 | If verification fails, request clarification | Day 7 | DPO |

### 4.3 Verification Failure Handling

| Scenario | Action | Timeline |
|---|---|---|
| No response to verification request | Send reminder; close request after 14 days | Day 7, Day 14 |
| Insufficient proof | Request additional documentation | Day 7 |
| Suspected fraudulent request | Escalate to CISO; preserve evidence | Immediate |
| Identity cannot be verified | Decline request with explanation | Day 14 |
| Request concerns another person | Request authorization or redirect | Day 3 |

---

## 5. Request Processing

### 5.1 Processing Workflow

```
[Identity Verified]
    |
    v
[Scope Definition] --> [Data Discovery] --> [Data Collection] --> [Review & Redaction]
    |                      |                    |                      |
    |                      |                    |                      v
    |                      |                    |              [Third-Party Data Check]
    |                      |                    |                      |
    |                      |                    v                      v
    |                      |            [Legal Hold Check] <--- [Other Subjects' Data]
    |                      |                    |
    |                      v                    v
    |              [Data Extraction] <--- [Exemption Assessment]
    |                      |
    v                      v
[Format & Package] --> [Quality Review] --> [Approval] --> [Delivery]
```

### 5.2 Processing Steps Detail

#### Step 1: Scope Definition (Day 1-2)

| Activity | Description | Owner |
|---|---|---|
| Clarify request | If ambiguous, seek clarification from data subject | DPO |
| Define search parameters | Identify systems, date ranges, data types | Data Governance |
| Estimate complexity | Simple (< 1 day), Standard (1-3 days), Complex (3-10 days) | DPO |
| Set internal deadline | Based on complexity and statutory deadline | DPO |

#### Step 2: Data Discovery (Day 2-5)

| System | Data Types | Search Method | Owner |
|---|---|---|---|
| PostgreSQL (Strapi) | User profiles, content interactions | SQL queries | DBA |
| PostgreSQL (E-commerce) | Orders, addresses, payments | SQL queries | DBA |
| MeiliSearch | Search history | API queries | Backend Team |
| Support Ticket System | Tickets, chat logs, emails | System search | Support Lead |
| Analytics (Plausible) | Page views, sessions | Self-hosted query | Analytics Team |
| Email Platform | Marketing emails, correspondence | Email search | Marketing |
| File Storage | Documents, uploads, attachments | File system search | DevOps |
| Backup Archives | Historical data | Backup restoration (if needed) | DevOps |
| Log Storage | Access logs, security logs | Log query (Loki) | DevOps |

#### Step 3: Data Collection (Day 3-10)

| Activity | Description | Owner |
|---|---|---|
| Extract data | Run queries, export records, collect files | Technical Team |
| Preserve integrity | Maintain chain of custody, checksums | Technical Team |
| Document sources | Record which systems contributed data | Data Governance |
| Estimate volume | Page count, file size, record count | Technical Team |

#### Step 4: Review and Redaction (Day 5-15)

| Review Type | Description | Owner |
|---|---|---|
| **Other subjects' data** | Redact information about other individuals | DPO |
| **Trade secrets** | Redact proprietary business information | Legal |
| **Legal privilege** | Redact attorney-client communications | Legal |
| **Security information** | Redact security controls, vulnerabilities | CISO |
| **Ongoing investigation** | Withhold data subject to active investigation | CISO |
| **Third-party intellectual property** | Redact third-party copyrighted material | Legal |

#### Step 5: Exemption Assessment

| Exemption | Legal Basis | Application | Documentation |
|---|---|---|---|
| Manifestly unfounded | Art. 12(5) | Repeated identical requests, harassment | Request history |
| Excessive | Art. 12(5) | Disproportionate effort, volume | Effort estimate |
| Other subjects' rights | Art. 15(4) | Would disclose another person's data | Redaction log |
| Legal obligation | Art. 17(3)(b) | Required by law to retain | Legal reference |
| Legal claims | Art. 17(3)(e) | Necessary for legal proceedings | Legal hold notice |
| Public interest | Art. 17(3)(b) | Public health, scientific research | Public interest assessment |

#### Step 6: Format and Package (Day 10-20)

| Format | Use Case | Structure |
|---|---|---|
| **JSON** | Machine-readable (portability requests) | Structured export with metadata |
| **PDF** | Human-readable (access requests) | Formatted report with table of contents |
| **CSV** | Tabular data (order history, analytics) | Spreadsheet with headers |
| **ZIP** | Multiple files (documents, images) | Organized folder structure |
| **Secure Link** | Large files | Time-limited, password-protected download |

#### Step 7: Quality Review (Day 20-25)

| Check | Description | Owner |
|---|---|---|
| Completeness | All requested data included | DPO |
| Accuracy | Data is current and correct | Data Steward |
| Redaction quality | No unintended disclosures | DPO |
| Format correctness | Deliverable matches request | Technical Team |
| Security | Package encrypted, access controlled | Security Engineer |

#### Step 8: Approval (Day 25-27)

| Approver | Scope | Authority |
|---|---|---|
| DPO | Standard requests (L1-L3 data) | Final approval |
| CISO | Requests involving security data | Co-approval |
| Legal Counsel | Requests with legal exemptions | Co-approval |
| CTO | Technical complexity or volume | Consultation |

#### Step 9: Delivery (Day 27-30)

| Method | Security | Confirmation |
|---|---|---|
| Secure portal download | TLS 1.3 + authenticated access | Download notification |
| Encrypted email (S/MIME) | End-to-end encryption | Read receipt |
| Physical media (USB) | Encrypted + password | Hand delivery receipt |
| Postal mail (registered) | Tamper-evident packaging | Delivery confirmation |

---

## 6. Special Request Handling

### 6.1 Erasure (Right to be Forgotten)

| Phase | Action | Verification | Exceptions |
|---|---|---|---|
| **Assessment** | Identify all data locations | Standard/Enhanced | Legal holds, ongoing contracts |
| **Propagation** | Delete from all systems | Cascade deletion | Backup rotation period |
| **Verification** | Confirm deletion across systems | Audit query | 30-day backup retention |
| **Notification** | Confirm erasure to data subject | Email | Include exceptions |
| **Third-party** | Notify processors of deletion | DPA clause | Document responses |

### 6.2 Data Portability

| Aspect | Implementation |
|---|---|
| **Format** | JSON (primary), CSV (tabular data) |
| **Schema** | Standardized schema with field definitions |
| **Machine-readable** | Yes; structured, labeled, documented |
| **Interoperable** | Common formats; no proprietary encoding |
| **Direct transfer** | Available upon request to another controller |
| **Scope** | Data provided by data subject + observed data |
| **Exclusions** | Derived data, inferred data, anonymized data |

### 6.3 Objection to Processing

| Processing Basis | Objection Grounds | Outcome |
|---|---|---|
| Legitimate interest | Direct marketing, profiling | Stop processing immediately |
| Legitimate interest | Non-marketing | Balance test; may continue if overriding grounds |
| Public interest | Scientific/historical research | Assess research value vs. rights |
| Consent | Withdrawal | Stop processing; proceed as erasure if appropriate |

### 6.4 Automated Decision-Making

| Aspect | Implementation |
|---|---|
| **Decisions covered** | Product recommendations, fraud scoring, credit checks (Phase 3) |
| **Human intervention** | Available upon request; 5-business-day review |
| **Explanation** | Logic of decision, significance, consequences |
| **Contest** | Right to contest; human re-evaluation |
| **Opt-out** | Disable automated profiling in account settings |

---

## 7. Response Templates

### 7.1 Access Request Response

```
Subject: Your Data Subject Access Request - DSAR-[ID]

Dear [Name],

We have completed your access request (reference: DSAR-[ID]).

SUMMARY OF DATA HELD:
- Account information: [Yes/No]
- Order history: [X records]
- Support interactions: [X tickets]
- Marketing preferences: [Yes/No]
- Analytics data: [Summary]

DATA FORMAT: [PDF/JSON/CSV]
DOWNLOAD LINK: [Secure link, expires in 30 days]

PROCESSING INFORMATION:
- Purposes: [List]
- Categories of recipients: [List]
- Retention periods: [List]
- Data sources: [List]
- Automated decision-making: [Yes/No - details]

If you have questions, contact privacy@twinmos.com.

Regards,
TwinMOS Data Protection Officer
```

### 7.2 Erasure Confirmation

```
Subject: Data Erasure Confirmation - DSAR-[ID]

Dear [Name],

We have completed the erasure of your personal data (reference: DSAR-[ID]).

DATA DELETED:
- Account profile: Deleted
- Order history: Deleted
- Support tickets: Deleted
- Marketing records: Deleted

EXCEPTIONS (data retained as required by law):
- Tax records: Retained for 7 years (legal obligation)
- Fraud investigation: Retained per legal hold

BACKUP NOTE: Data will be purged from backup systems within 30 days.

Regards,
TwinMOS Data Protection Officer
```

### 7.3 Extension Notice

```
Subject: DSAR Extension Notice - DSAR-[ID]

Dear [Name],

Your request (DSAR-[ID]) is complex and requires additional time.

REASON FOR EXTENSION: [Complexity / Volume / Third-party consultation]
NEW DEADLINE: [Date - within 60 days of original request]

We apologize for the delay and will provide updates every 10 days.

Regards,
TwinMOS Data Protection Officer
```

---

## 8. Metrics and Reporting

### 8.1 Key Performance Indicators

| KPI | Target | Measurement | Owner |
|---|---|---|---|
| Average response time | < 25 days | Per request | DPO |
| On-time completion rate | > 95% | Within statutory deadline | DPO |
| First-contact resolution | > 80% | No clarification needed | DPO |
| Identity verification success | > 90% | First attempt | DPO |
| Data subject satisfaction | > 4.0/5.0 | Post-response survey | DPO |
| Request volume | Track trend | Monthly | DPO |
| Cost per request | < $500 | Average | Finance |

### 8.2 Monthly Reporting

| Metric | Reported To | Frequency |
|---|---|---|
| Request volume by type | DPO, CISO | Monthly |
| Average response time | DPO, CTO | Monthly |
| Exemption applications | DPO, Legal | Monthly |
| Escalations | CISO | Monthly |
| Trends and patterns | DPO, Management | Quarterly |

---

## 9. Governance

### 9.1 Roles and Responsibilities

| Role | Responsibilities |
|---|---|
| **DPO** | Overall DSAR program, complex requests, exemption decisions, regulatory liaison |
| **DSAR Coordinator** | Day-to-day management, intake, tracking, communication |
| **Technical Team** | Data extraction, system queries, format conversion |
| **Data Stewards** | Data accuracy review, business context |
| **Legal Counsel** | Exemption assessment, legal hold review |
| **CISO** | Security data review, incident-related requests |

### 9.2 Training

| Role | Training Content | Frequency |
|---|---|---|
| DSAR Coordinator | Workflow, tools, communication, escalation | Quarterly |
| Technical Team | Data extraction, privacy requirements, secure handling | Quarterly |
| Data Stewards | Data subject rights, redaction, accuracy | Annual |
| All staff | Recognizing DSARs, routing, urgency | Annual |

---

## 10. Document Change Log

| Version | Date | Author | Change Description |
|---|---|---|---|
| 1.0.0 | 2026-05-01 | Privacy Team | Initial DSAR workflow covering all request types |
