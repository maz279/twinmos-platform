# Privacy by Design Checklist

| Document Attribute | Value |
|---|---|
| **Document ID** | TWN-COMP-2026-006 |
| **Version** | 1.0.0 |
| **Status** | Draft |
| **Author** | Unisoft Technologies Privacy Team |
| **Owner** | Data Protection Officer (DPO) / Security Architect |
| **Review Date** | 2026-08-01 |
| **Classification** | Internal Use |
| **Related Documents** | TWN-COMP-2026-001 (DPIA), TWN-COMP-2026-005 (DSAR Workflow), TWN-SEC-2026-001 (Security Architecture) |
| **Compliance Mapping** | GDPR Art. 25, UAE PDPL Art. 7, India DPDP Act 2023 S.6, KSA PDPL Art. 5, ISO/IEC 27701:2019 Clause 7.2, OECD Privacy Guidelines |

---

## 1. Executive Summary

This Privacy by Design (PbD) Checklist operationalizes the seven Foundational Principles of Privacy by Design (Ann Cavoukian) for the TwinMOS corporate website. It serves as a mandatory review gate at each phase of the Software Development Life Cycle (SDLC), ensuring privacy is embedded into the design specifications, architecture, and business practices.

**Seven Foundational Principles**:
1. Proactive not Reactive; Preventative not Remedial
2. Privacy as the Default Setting
3. Privacy Embedded into Design
4. Full Functionality: Positive-Sum, not Zero-Sum
5. End-to-End Security: Full Lifecycle Protection
6. Visibility and Transparency: Keep it Open
7. Respect for User Privacy: Keep it User-Centric

---

## 2. SDLC Privacy Review Gates

### 2.1 Gate Placement

| SDLC Phase | Privacy Gate | Checkpoint | Mandatory? |
|---|---|---|---|
| **Requirements** | Gate P1: Privacy Requirements | Privacy requirements defined, DPIA trigger assessed | Yes |
| **Design** | Gate P2: Privacy Architecture | Data flows modeled, minimization designed, consent flows mapped | Yes |
| **Development** | Gate P3: Privacy Implementation | Code review for privacy, encryption implemented, logging configured | Yes |
| **Testing** | Gate P4: Privacy Verification | Privacy tests executed, consent flows tested, DSAR paths validated | Yes |
| **Deployment** | Gate P5: Privacy Validation | Production configuration verified, monitoring active, incident response ready | Yes |
| **Operations** | Gate P6: Privacy Monitoring | Ongoing privacy metrics, audit trails reviewed, user rights honored | Yes |
| **Decommissioning** | Gate P7: Privacy Disposal | Data deletion verified, backups purged, retention compliance confirmed | Yes |

### 2.2 Gate Approval Authority

| Gate | Approver | Escalation |
|---|---|---|
| P1 | Product Owner + DPO | CISO if high-risk |
| P2 | Security Architect + DPO | CTO if architecture changes |
| P3 | Development Lead + Security Engineer | CISO if implementation gaps |
| P4 | QA Lead + DPO | Full team if test failures |
| P5 | DevOps Lead + CISO | Management if blockers |
| P6 | DPO | CISO for incidents |
| P7 | Data Governance + DPO | Legal for legal holds |

---

## 3. Principle 1: Proactive not Reactive

### 3.1 Checklist: Anticipate and Prevent

| ID | Checklist Item | Phase | Evidence | Status |
|---|---|---|---|---|
| P1-01 | Privacy risks identified during requirements gathering | P1 | Risk register entry | Required |
| P1-02 | DPIA conducted for high-risk processing | P1 | DPIA document (TWN-COMP-2026-001) | Required |
| P1-03 | Threat model includes privacy threats (not just security) | P2 | STRIDE-Privacy extension | Required |
| P1-04 | Privacy impact considered for third-party integrations | P2 | Integration privacy assessment | Required |
| P1-05 | Automated privacy testing in CI/CD pipeline | P3-P4 | Test suite configuration | Required |
| P1-06 | Privacy incident response plan documented | P5 | Incident response plan | Required |
| P1-07 | Regular privacy audits scheduled | P6 | Audit calendar | Required |
| P1-08 | Privacy training for all development staff | P3 | Training records | Required |

### 3.2 Privacy Threat Modeling

| Threat Category | Description | Mitigation |
|---|---|---|
| **Identification** | Unnecessary collection of identifying information | Data minimization, pseudonymization |
| **Surveillance** | Excessive monitoring of user behavior | Purpose limitation, consent, transparency |
| **Aggregation** | Combining data to reveal more than intended | Separation of data stores, access controls |
| **Secondary Use** | Using data for purposes beyond original collection | Purpose specification, consent refresh |
| **Exclusion** | Failing to inform users about data collection | Transparency notices, layered privacy policy |
| **Insecurity** | Insufficient protection of personal data | Encryption, access controls, security architecture |
| **Exposure** | Revealing data to unauthorized parties | Access controls, encryption, audit logging |
| **Distortion** | Allowing inaccurate data to persist | Rectification mechanisms, data quality checks |
| **Intrusion** | Disrupting user privacy expectations | Granular controls, opt-out mechanisms |

---

## 4. Principle 2: Privacy as the Default Setting

### 4.1 Checklist: Default Privacy

| ID | Checklist Item | Phase | Evidence | Status |
|---|---|---|---|---|
| P2-01 | Maximum privacy settings are the default for all users | P2-P3 | Configuration baseline | Required |
| P2-02 | No non-essential cookies set without explicit consent | P3 | Cookie audit (TWN-COMP-2026-004) | Required |
| P2-03 | Analytics tracking disabled by default | P3 | Code review, network inspection | Required |
| P2-04 | Marketing communications opt-out by default | P3 | Registration form review | Required |
| P2-05 | Profile data sharing disabled by default | P3 | Privacy settings review | Required |
| P2-06 | Location services disabled by default | P3 | Permission prompt review | Required |
| P2-07 | Data retention set to minimum necessary period | P2 | Retention schedule | Required |
| P2-08 | Public visibility of user data disabled by default | P3 | Profile settings review | Required |
| P2-09 | Automated decision-making disabled by default | P3 | Feature flags, settings | Required |
| P2-10 | Third-party data sharing disabled by default | P3 | Integration configuration | Required |

### 4.2 Default Settings Matrix

| Feature | Default Setting | User Override | Phase |
|---|---|---|---|
| Cookie consent | Reject all non-essential | Granular opt-in | 1 |
| Analytics tracking | Off | Opt-in per category | 1 |
| Marketing emails | Off | Double opt-in | 1 |
| Profile visibility | Private | User can make public | 3 |
| Location access | Denied | Prompt on first use | 2 |
| Push notifications | Off | Opt-in | 3 |
| Social sharing | Off | Opt-in per share | 1 |
| Personalized recommendations | Off | Opt-in | 3 |
| Data portability | Available | Always available | 1 |
| Account deletion | Available | Always available | 1 |

---

## 5. Principle 3: Privacy Embedded into Design

### 5.1 Checklist: Architectural Integration

| ID | Checklist Item | Phase | Evidence | Status |
|---|---|---|---|---|
| P3-01 | Privacy requirements in functional specifications | P1 | Requirements document | Required |
| P3-02 | Data minimization designed into data models | P2 | ER diagrams, schema design | Required |
| P3-03 | Pseudonymization designed into data flows | P2 | Data flow diagrams | Required |
| P3-04 | Consent management integrated into user flows | P2 | UX wireframes, flow diagrams | Required |
| P3-05 | Encryption designed into storage architecture | P2 | Architecture diagrams | Required |
| P3-06 | Access controls designed into API architecture | P2 | API specifications | Required |
| P3-07 | Audit logging designed into all data operations | P2 | Logging architecture | Required |
| P3-08 | Data retention automation designed into systems | P2 | Retention architecture | Required |
| P3-09 | DSAR capabilities designed into data architecture | P2 | Data export architecture | Required |
| P3-10 | Privacy patterns used (Privacy-Enhancing Technologies) | P2-P3 | PETs inventory | Recommended |

### 5.2 Privacy-Enhancing Technologies (PETs)

| Technology | Application | Phase | Status |
|---|---|---|---|
| **Differential Privacy** | Analytics aggregation | 2 | Planned |
| **Homomorphic Encryption** | Encrypted search (future) | 3 | Research |
| **Secure Multi-Party Computation** | Partner data sharing | 3 | Research |
| **Zero-Knowledge Proofs** | Age verification | 2 | Planned |
| **Pseudonymization** | All user identifiers | 1 | Implemented |
| **K-Anonymity** | Analytics exports | 2 | Planned |
| **Local Differential Privacy** | Client-side analytics | 1 | Implemented (Plausible) |
| **Federated Learning** | Recommendation models (future) | 3 | Research |

---

## 6. Principle 4: Full Functionality

### 6.1 Checklist: Positive-Sum Outcomes

| ID | Checklist Item | Phase | Evidence | Status |
|---|---|---|---|---|
| P4-01 | Core functionality available without personal data collection | P2 | Feature matrix | Required |
| P4-02 | Enhanced features available with consent, not required | P2 | Feature matrix | Required |
| P4-03 | Users can browse products without account creation | P2 | UX flow | Required |
| P4-04 | Search works without tracking | P2 | Search architecture | Required |
| P4-05 | Support available without data sharing beyond necessity | P2 | Support flow | Required |
| P4-06 | Personalization is optional value-add, not requirement | P2 | Feature design | Required |
| P4-07 | Graceful degradation when privacy features are enabled | P3 | Test cases | Required |
| P4-08 | No artificial limitations to pressure data sharing | P2 | Business rules review | Required |

### 6.2 Functionality vs. Privacy Matrix

| Feature | Without Account | With Account (Minimal) | With Account (Full) | Privacy Impact |
|---|---|---|---|---|
| Browse products | Yes | Yes | Yes | None |
| Search products | Yes | Yes | Yes | None |
| View product details | Yes | Yes | Yes | None |
| Compare products | Yes (session) | Yes (saved) | Yes (saved) | Low |
| Download datasheets | Yes | Yes | Yes | None |
| Contact support | Yes (email) | Yes (ticket history) | Yes (priority) | Low |
| Newsletter | No | Yes (opt-in) | Yes (opt-in) | Low |
| Product registration | No | Yes | Yes | Medium |
| Warranty claim | No | Yes | Yes | Medium |
| Partner portal | No | No | Yes (verified) | Medium |
| E-commerce | No | Yes | Yes | Medium |
| Personalized recommendations | No | No | Yes (opt-in) | Medium |
| Loyalty program | No | No | Yes (opt-in) | Medium |

---

## 7. Principle 5: End-to-End Security

### 7.1 Checklist: Lifecycle Protection

| ID | Checklist Item | Phase | Evidence | Status |
|---|---|---|---|---|
| P5-01 | Data encrypted in transit (TLS 1.3) | P3 | SSL Labs report | Required |
| P5-02 | Data encrypted at rest (AES-256-GCM) | P3 | Encryption audit | Required |
| P5-03 | Secure key management implemented | P3 | Key management plan (TWN-SEC-2026-008) | Required |
| P5-04 | Access controls enforce least privilege | P3 | RBAC configuration | Required |
| P5-05 | Authentication requires strong credentials + MFA | P3 | Auth spec (TWN-SEC-2026-004) | Required |
| P5-06 | Audit logs capture all data access | P3 | Logging configuration | Required |
| P5-07 | Backup encryption and secure storage | P3 | Backup configuration | Required |
| P5-08 | Secure data deletion with verification | P7 | Deletion procedures | Required |
| P5-09 | Data retention automatically enforced | P3-P6 | Retention automation | Required |
| P5-10 | Incident response covers privacy breaches | P5 | Incident response plan | Required |

### 7.2 Data Lifecycle Security

| Stage | Security Measure | Verification |
|---|---|---|
| **Collection** | HTTPS only, input validation, consent verification | Network scan, code review |
| **Processing** | Memory encryption, secure coding, access logging | Runtime analysis |
| **Storage** | LUKS encryption, database encryption, key rotation | Encryption audit |
| **Transmission** | TLS 1.3, certificate pinning, HSTS | SSL Labs scan |
| **Archival** | Encrypted archives, access restrictions, integrity checks | Archive audit |
| **Deletion** | Cryptographic erasure, cascade delete, verification | Deletion test |
| **Backup** | GPG encryption, geographic separation, rotation | Backup restoration test |

---

## 8. Principle 6: Visibility and Transparency

### 8.1 Checklist: Openness

| ID | Checklist Item | Phase | Evidence | Status |
|---|---|---|---|---|
| P6-01 | Privacy Policy published and accessible | P1 | Published policy | Required |
| P6-02 | Cookie Policy published and accessible | P1 | Published policy | Required |
| P6-03 | Data Processing Agreements available | P1 | DPA documents | Required |
| P6-04 | Sub-processor list published | P1 | Published list | Required |
| P6-05 | Consent mechanisms transparent and understandable | P2 | UX review | Required |
| P6-06 | Users informed of data breaches within 72 hours | P5 | Breach notification procedure | Required |
| P6-07 | Privacy settings easily accessible and understandable | P2 | UX review | Required |
| P6-08 | Algorithmic transparency for automated decisions | P2 | Transparency documentation | Required |
| P6-09 | Regular privacy reports published (transparency reports) | P6 | Annual transparency report | Recommended |
| P6-10 | Open source components disclosed | P3 | SBOM, license inventory | Required |

### 8.2 Transparency Documentation

| Document | Location | Update Frequency | Audience |
|---|---|---|---|
| Privacy Policy | /privacy | Per change + annual review | All users |
| Cookie Policy | /cookies | Per cookie change | All users |
| Terms of Service | /terms | Per change + annual review | All users |
| DPA Summary | /privacy/dpa | Per sub-processor change | Business partners |
| Sub-processor List | /privacy/subprocessors | Quarterly | All users |
| Security Whitepaper | /security | Annual | Enterprise customers |
| Transparency Report | /transparency | Annual | Public |
| Data Retention Schedule | Internal | Quarterly | Internal |

---

## 9. Principle 7: Respect for User Privacy

### 9.1 Checklist: User-Centric Design

| ID | Checklist Item | Phase | Evidence | Status |
|---|---|---|---|---|
| P7-01 | Granular consent options (not all-or-nothing) | P2 | Consent UI design | Required |
| P7-02 | Easy consent withdrawal mechanism | P2 | UX flow, footer link | Required |
| P7-03 | Clear explanation of data use in plain language | P2 | Copy review | Required |
| P7-04 | User-friendly privacy settings dashboard | P2 | UX design | Required |
| P7-05 | DSAR submission accessible and simple | P2 | DSAR portal design | Required |
| P7-06 | Data portability in common formats | P2 | Export functionality | Required |
| P7-07 | Account deletion available and straightforward | P2 | Deletion flow | Required |
| P7-08 | No dark patterns in consent flows | P2 | UX ethics review | Required |
| P7-09 | Accessibility compliance (WCAG 2.1 AA) for all privacy features | P2 | Accessibility audit | Required |
| P7-10 | Multi-language support for privacy notices | P2 | Localization plan | Required |
| P7-11 | Age-appropriate privacy notices for minors | P2 | Content review | Required |
| P7-12 | Human support available for privacy questions | P6 | Support routing | Required |

### 9.2 Dark Pattern Prohibition

| Dark Pattern | Description | Prohibition | Verification |
|---|---|---|---|
| **Confirmshaming** | Guilt-inducing language to discourage opt-out | Prohibited | Copy review |
| **Preselection** | Pre-ticked boxes for data sharing | Prohibited | UI audit |
| **Obstruction** | Making privacy settings hard to find | Prohibited | UX testing |
| **Sneaking** | Hidden data collection in terms | Prohibited | Legal review |
| **Forced continuity** | Difficult subscription cancellation | Prohibited | Flow testing |
| **Interface interference** | Manipulative design to steer choices | Prohibited | UX ethics review |
| **Bait and switch** | Different outcome than expected | Prohibited | Flow testing |
| **Privacy zuckering** | Tricking users into sharing more data | Prohibited | UX review |

---

## 10. Feature-Specific Privacy Checklists

### 10.1 User Registration

| Check | Requirement | Status |
|---|---|---|
| Only necessary fields required | Email, password | Required |
| Optional fields clearly marked | Name, phone, address | Required |
| Marketing consent separate from registration | Unchecked by default | Required |
| Terms acceptance separate from marketing | Distinct checkboxes | Required |
| Password strength indicator | Real-time feedback | Required |
| Age verification if required | Date of birth or age gate | Required |
| Email verification required | Double opt-in | Required |

### 10.2 E-Commerce (Phase 3)

| Check | Requirement | Status |
|---|---|---|
| Guest checkout available | No account required | Required |
| Payment data never stored | Tokenization only | Required |
| Shipping address separate from billing | User choice | Required |
| Save payment method is opt-in | Unchecked by default | Required |
| Order history retention transparent | Stated at purchase | Required |
| Return process doesn't require excessive data | Minimal necessary | Required |

### 10.3 Partner Portal (Phase 2)

| Check | Requirement | Status |
|---|---|---|
| Partner data segregated from customer data | Separate database schema | Required |
| Partner can view data held about them | Self-service portal | Required |
| Commission data transparent | Detailed breakdown | Required |
| Contract documents accessible | Download available | Required |
| Partner can request data export | DSAR for partners | Required |

### 10.4 Newsletter and Marketing

| Check | Requirement | Status |
|---|---|---|
| Double opt-in for subscriptions | Confirmation email | Required |
| Granular topic selection | Choose interests | Required |
| One-click unsubscribe | Link in every email | Required |
| Unsubscribe honored within 24 hours | Automated | Required |
| Preference center accessible | Account and email link | Required |
| Re-engagement only with consent | No automatic re-add | Required |

---

## 11. Compliance Verification

### 11.1 Automated Privacy Tests

| Test | Tool | Frequency | Gate |
|---|---|---|---|
| Cookie compliance scan | Custom scanner | Daily | P4 |
| Privacy policy link validation | Link checker | Weekly | P4 |
| Consent flow automation | Playwright | Per deployment | P4 |
| DSAR endpoint availability | Uptime monitor | Continuous | P6 |
| Encryption validation | SSL Labs | Weekly | P4 |
| Access control validation | Automated RBAC tests | Per deployment | P4 |
| PII detection in logs | Log scanner | Daily | P6 |

### 11.2 Manual Privacy Reviews

| Review | Frequency | Participants | Gate |
|---|---|---|---|
| Privacy design review | Per feature | DPO, Security Architect, Product Owner | P2 |
| Privacy code review | Per PR (privacy-related) | Security Engineer, Developer | P3 |
| Privacy UX review | Per feature | UX Designer, DPO | P2 |
| Privacy penetration test | Annual | External auditor | P4 |
| Privacy audit | Annual | External DPO / auditor | P6 |

---

## 12. Governance

### 12.1 Privacy Review Board

| Role | Responsibility | Meeting Frequency |
|---|---|---|
| DPO (Chair) | Overall privacy governance, regulatory liaison | Monthly |
| Security Architect | Technical privacy implementation | Monthly |
| Product Owner | Product privacy requirements | Monthly |
| Legal Counsel | Regulatory interpretation, contracts | Quarterly |
| CTO | Technical feasibility, resource allocation | Quarterly |
| External Privacy Advisor | Independent assessment | Quarterly |

### 12.2 Privacy Metrics Dashboard

| Metric | Target | Measurement |
|---|---|---|
| Privacy gate pass rate | 100% | Per feature |
| Consent collection rate | Track trend | Monthly |
| Consent withdrawal rate | < 5% | Monthly |
| DSAR volume | Track trend | Monthly |
| Privacy incident count | 0 | Monthly |
| Privacy training completion | 100% | Quarterly |
| Privacy audit findings | 0 critical | Annual |
| Dark pattern reports | 0 | Continuous |

---

## 13. Document Change Log

| Version | Date | Author | Change Description |
|---|---|---|---|
| 1.0.0 | 2026-05-01 | Privacy Team | Initial Privacy by Design checklist with 7 principles and SDLC gates |
