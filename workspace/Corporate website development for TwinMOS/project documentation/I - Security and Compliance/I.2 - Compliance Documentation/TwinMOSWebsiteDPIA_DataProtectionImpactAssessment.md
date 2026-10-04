# Data Protection Impact Assessment (DPIA)

| Document Attribute | Value |
|---|---|
| **Document ID** | TWN-COMP-2026-001 |
| **Version** | 1.0.0 |
| **Status** | Draft |
| **Author** | Unisoft Technologies Privacy Team |
| **Owner** | Data Protection Officer (DPO) |
| **Review Date** | 2026-08-01 |
| **Classification** | Confidential |
| **Related Documents** | TWN-SEC-2026-001 (Security Architecture), TWN-SEC-2026-004 (Auth Spec), TWN-SEC-2026-007 (Encryption), TWN-COMP-2026-002 (Records of Processing), TWN-COMP-2026-006 (Privacy by Design) |
| **Compliance Mapping** | GDPR Art. 35, UAE PDPL Art. 19-20, India DPDP Act 2023 S.11, KSA PDPL Art. 21, ISO/IEC 27701:2019 |

---

## 1. Executive Summary

This Data Protection Impact Assessment (DPIA) evaluates the privacy risks associated with the TwinMOS corporate website's processing of personal data. The assessment follows the GDPR Article 35 methodology, adapted for multi-jurisdictional compliance (EU, UAE, India, KSA).

**DPIA Trigger**: This DPIA is required because the processing involves:
- Large-scale processing of personal data (global customer base)
- Systematic monitoring of user behavior (analytics, cookies)
- Processing of special categories of data (location data for regional sites)
- Use of new technologies (AI-powered search, behavioral analytics)
- Automated decision-making (product recommendations, fraud detection)

**Assessment Outcome**: After implementing the recommended measures, the residual risk is assessed as **LOW** for all processing activities. The project is approved to proceed subject to the conditions in Section 8.

---

## 2. DPIA Scope and Context

### 2.1 Project Description

The TwinMOS corporate website is a multi-phase project delivering:
- **Phase 1 (Launch)**: Corporate presence, product catalog, support, regional information
- **Phase 2**: Partner portal, localization (12 languages), advanced search
- **Phase 3**: E-commerce, customer accounts, warranty management

### 2.2 Data Processing Context

| Aspect | Description |
|---|---|
| **Data Controller** | TwinMOS Technologies Co., Ltd. |
| **Data Processor** | Unisoft Technologies (development, hosting management) |
| **Sub-processors** | Cloudflare (CDN/WAF), Hetzner (hosting), Backblaze B2 (backups), MeiliSearch (search), Strapi (CMS) |
| **Processing Locations** | Primary: Germany (Hetzner); Edge: Cloudflare global network; Backups: EU (Backblaze) |
| **Data Subjects** | Website visitors, registered customers, partner distributors, product owners, newsletter subscribers, job applicants |
| **Estimated Volume** | Phase 1: 50,000 monthly visitors; Phase 3: 500,000 registered users |
| **Geographic Scope** | Global, with emphasis on EU, UAE, India, KSA, Africa, Southeast Asia |

### 2.3 Jurisdictional Requirements

| Jurisdiction | Legal Basis Requirement | DPIA Requirement | DPO Requirement |
|---|---|---|---|
| **EU (GDPR)** | Art. 6 lawful basis; Art. 9 special categories | Art. 35 - mandatory for high-risk processing | Mandatory |
| **UAE (PDPL)** | Art. 4 lawful basis; explicit consent for sensitive data | Art. 19 - mandatory for high-risk | Recommended |
| **India (DPDP 2023)** | S.6 consent; S.7 legitimate uses | S.11 - mandatory for significant data fiduciaries | Significant fiduciaries only |
| **KSA (PDPL)** | Art. 4 legal basis; Art. 5 consent | Art. 21 - mandatory for high-risk | Mandatory |

---

## 3. Data Flow Mapping

### 3.1 Personal Data Inventory

| Data Category | Data Elements | Source | Purpose | Legal Basis | Retention |
|---|---|---|---|---|---|
| **Identity Data** | Name, email, phone, address | User input, partner onboarding | Account management, communication | Contract / Consent | Account lifetime + 2 years |
| **Authentication Data** | Password hash, MFA secrets, JWT tokens | User registration, login | Authentication, security | Legitimate interest | Token lifetime / Until revocation |
| **Behavioral Data** | Page views, clicks, search queries, session duration | Analytics (Plausible), cookies | Website improvement, personalization | Consent | 26 months (analytics) |
| **Transactional Data** | Order history, warranty claims, payment records | E-commerce transactions | Order fulfillment, warranty service | Contract | 7 years (tax) |
| **Communication Data** | Support tickets, chat logs, email correspondence | Contact forms, support portal | Customer support | Contract / Consent | 3 years |
| **Technical Data** | IP address, user agent, device info, location (approximate) | Server logs, WAF, CDN | Security, fraud prevention, performance | Legitimate interest | 90 days (logs) |
| **Professional Data** | Company name, VAT number, distributor tier | Partner registration | Partner management, commission calculation | Contract | Contract duration + 5 years |
| **Special Category Data** | Location (precise GPS - Phase 3 only), health data (warranty claims) | User device, support forms | Store finder, warranty validation | Explicit consent | Specific to purpose |

### 3.2 Data Flow Diagrams

#### 3.2.1 Website Visitor Flow

```
[User Browser] --> [Cloudflare CDN/WAF] --> [Cloudflare Pages (Astro)]
                                          |
                                          v
                              [Strapi API (Hetzner)]
                                          |
                                          v
                              [PostgreSQL (Hetzner)]
                                          |
                                          v
                              [Backblaze B2 (Backups)]
```

#### 3.2.2 Partner Portal Flow (Phase 2)

```
[Partner Browser] --> [Cloudflare CDN/WAF] --> [Partner Portal (Astro)]
                                              |
                                              v
                                  [Strapi API + Better Auth]
                                              |
                                              v
                                  [PostgreSQL (Encrypted)]
                                              |
                                              v
                                  [MeiliSearch (Partner Docs)]
```

#### 3.2.3 E-Commerce Flow (Phase 3)

```
[Customer Browser] --> [Cloudflare CDN/WAF] --> [E-Commerce (Astro)]
                                               |
                                               v
                                   [Strapi API + Payment Gateway]
                                               |
                          +-------------------+-------------------+
                          |                   |                   |
                          v                   v                   v
                  [PostgreSQL]      [Payment Provider]     [MeiliSearch]
                          |           (Stripe/Adyen)            |
                          v                                       v
                  [Backblaze B2]                          [Analytics]
```

### 3.3 Cross-Border Data Transfers

| Transfer Route | Mechanism | Safeguards | Status |
|---|---|---|---|
| EU -> Germany (Hetzner) | Adequacy (EU member) | N/A | Permitted |
| EU -> USA (Cloudflare) | SCCs (Standard Contractual Clauses) | Art. 46 GDPR; Cloudflare DPA | In place |
| EU -> USA (Backblaze) | SCCs | Art. 46 GDPR; Backblaze DPA | In place |
| UAE -> Germany | Bilateral agreement | Adequacy assessment | Under review |
| India -> Germany | SCCs | DPDP Act S.16; contractual safeguards | Planned |
| KSA -> Germany | SCCs | PDPL Art. 29; regulatory approval | Planned |
| Africa -> Germany | SCCs | Case-by-case assessment | Planned |

---

## 4. Necessity and Proportionality Analysis

### 4.1 Necessity Assessment

| Processing Activity | Is it necessary? | Less intrusive alternative? | Justification |
|---|---|---|---|
| IP address logging | Yes | No | Required for security (DDoS, abuse detection) and legal compliance |
| Cookie-based analytics | No | Yes | Plausible Analytics (cookieless) is the primary tool; optional cookies require consent |
| Email marketing | No | Yes | Only with explicit opt-in consent; unsubscribe always available |
| Partner location data | Yes | Partial | Required for regional distributor assignment; precise GPS is optional |
| Behavioral profiling | No | Yes | Only with consent; can be disabled without affecting core functionality |
| Payment card storage | No | Yes | Tokenized by payment provider; TwinMOS never stores card data |

### 4.2 Proportionality Assessment

| Processing Activity | Data Minimized? | Retention Limited? | Purpose Narrow? | Proportionate? |
|---|---|---|---|---|
| Account registration | Yes (only required fields) | Yes (2 years post-deletion) | Yes (account management only) | Yes |
| Analytics | Yes (aggregated, pseudonymized) | Yes (26 months max) | Yes (website improvement) | Yes |
| Support tickets | Yes (relevant to issue only) | Yes (3 years) | Yes (support resolution) | Yes |
| Partner data | Yes (business necessary only) | Yes (contract + 5 years) | Yes (partner management) | Yes |
| Security logs | Yes (IP + timestamp only) | Yes (90 days) | Yes (security only) | Yes |
| Marketing | Yes (email only) | Yes (until unsubscribe) | Yes (marketing only) | Yes |

---

## 5. Risk Assessment

### 5.1 Risk Methodology

**Risk Score = Likelihood x Impact**

| Likelihood | Score | Impact | Score |
|---|---|---|---|
| Very Low | 1 | Negligible | 1 |
| Low | 2 | Limited | 2 |
| Medium | 3 | Significant | 3 |
| High | 4 | Severe | 4 |
| Very High | 5 | Catastrophic | 5 |

**Risk Matrix**:
- 1-4: Low (Acceptable)
- 5-9: Medium (Mitigation required)
- 10-16: High (Immediate action required)
- 17-25: Critical (Project halt / fundamental redesign)

### 5.2 Identified Risks

| Risk ID | Risk Description | Likelihood | Impact | Initial Score | Risk Owner |
|---|---|---|---|---|---|
| R-001 | Unauthorized access to customer PII via compromised credentials | 3 | 4 | 12 (High) | CISO |
| R-002 | Data breach via SQL injection or API exploitation | 2 | 5 | 10 (High) | Security Architect |
| R-003 | Cross-border transfer violation (Schrems II) | 2 | 4 | 8 (Medium) | DPO |
| R-004 | Insufficient consent records for marketing | 3 | 3 | 9 (Medium) | DPO |
| R-005 | Retention period violation leading to excessive data storage | 2 | 3 | 6 (Medium) | Data Governance Lead |
| R-006 | Partner commercial data exposure to competitors | 2 | 4 | 8 (Medium) | CISO |
| R-007 | Children's data collected without parental consent | 2 | 4 | 8 (Medium) | DPO |
| R-008 | Automated decision-making without transparency | 2 | 3 | 6 (Medium) | DPO |
| R-009 | Sub-processor security failure (supply chain) | 2 | 4 | 8 (Medium) | Security Architect |
| R-010 | DSAR (Data Subject Access Request) non-compliance | 3 | 3 | 9 (Medium) | DPO |
| R-011 | Data subject rights (deletion) not fully propagated | 2 | 3 | 6 (Medium) | Data Governance Lead |
| R-012 | Analytics data re-identification from pseudonymized data | 2 | 2 | 4 (Low) | DPO |

### 5.3 Risk Treatment

| Risk ID | Mitigation Measure | Residual Likelihood | Residual Impact | Residual Score | Status |
|---|---|---|---|---|---|
| R-001 | MFA enforcement (TOTP), RBAC, JWT RS256, account lockout | 1 | 3 | 3 (Low) | Implemented |
| R-002 | Parameterized queries, WAF (OWASP CRS), input validation, encryption | 1 | 3 | 3 (Low) | Implemented |
| R-003 | SCCs with Cloudflare/Backblaze, TIA (Transfer Impact Assessment), encryption in transit | 1 | 3 | 3 (Low) | In Progress |
| R-004 | Granular consent management, consent audit trail, double opt-in | 1 | 2 | 2 (Low) | Implemented |
| R-005 | Automated retention policies, data lifecycle management, quarterly audits | 1 | 2 | 2 (Low) | Implemented |
| R-006 | Partner data encryption, strict RBAC, audit logging, NDAs | 1 | 3 | 3 (Low) | Implemented |
| R-007 | Age verification gate, parental consent workflow, COPPA/GDPR-K compliance | 1 | 2 | 2 (Low) | Planned |
| R-008 | Algorithm transparency documentation, human review option, opt-out | 1 | 2 | 2 (Low) | Planned |
| R-009 | Sub-processor security assessments, DPA with security clauses, audit rights | 1 | 3 | 3 (Low) | In Progress |
| R-010 | Automated DSAR workflow, 30-day SLA, subject rights portal | 1 | 2 | 2 (Low) | Planned |
| R-011 | Cascading deletion architecture, deletion verification, backup purge | 1 | 2 | 2 (Low) | Planned |
| R-012 | Differential privacy techniques, k-anonymity (k>=5), data aggregation | 1 | 1 | 1 (Low) | Planned |

---

## 6. Measures to Address Risks

### 6.1 Technical Measures

| Measure | Implementation | Responsible | Deadline | Cost |
|---|---|---|---|---|
| **Encryption at Rest** | LUKS for PostgreSQL; AES-256-GCM for sensitive fields | Security Engineer | Phase 1 | $0 (open source) |
| **Encryption in Transit** | TLS 1.3 mandatory; HSTS preload; certificate pinning | Security Engineer | Phase 1 | $0 |
| **Access Control** | RBAC with 13 roles; JWT RS256; MFA (TOTP); API key scoping | Security Engineer | Phase 1 | $0 |
| **Input Validation** | Whitelist validation; parameterized queries; GraphQL depth limiting | Development Team | Phase 1 | $0 |
| **Pseudonymization** | Analytics IDs hashed; PII separated from behavioral data | Data Engineer | Phase 1 | $0 |
| **Consent Management** | Cookie consent banner; granular consent categories; consent ID | Frontend Team | Phase 1 | $0 |
| **Automated Deletion** | TTL indexes for logs; scheduled purge jobs; cascade deletes | Backend Team | Phase 2 | $0 |
| **Anonymization** | Statistical anonymization for analytics exports; k-anonymity | Data Engineer | Phase 2 | $2,000 |

### 6.2 Organizational Measures

| Measure | Implementation | Responsible | Deadline | Cost |
|---|---|---|---|---|
| **Privacy Policy** | Multi-jurisdictional privacy policy; plain language; layered notice | Legal / DPO | Phase 1 | $5,000 |
| **Data Processing Agreements** | DPAs with all sub-processors; SCCs for cross-border transfers | DPO | Phase 1 | $0 |
| **Staff Training** | GDPR/privacy training for all staff; role-specific modules | HR / DPO | Phase 1 | $3,000 |
| **Incident Response Plan** | 72-hour breach notification procedure; regulatory contact list | CISO | Phase 1 | $0 |
| **DSAR Procedure** | Automated portal; 30-day SLA; identity verification workflow | DPO | Phase 2 | $5,000 |
| **Data Retention Schedule** | Documented retention periods; automated enforcement; quarterly review | Data Governance | Phase 1 | $0 |
| **Privacy by Design Review** | Privacy review gate in SDLC; DPIA for new features | Security Architect | Ongoing | $0 |
| **Regular Audits** | Annual privacy audit; quarterly self-assessment; penetration testing | DPO / CISO | Ongoing | $15,000/year |

### 6.3 Contractual Measures

| Measure | Counterparty | Status |
|---|---|---|
| Data Processing Agreement (DPA) | Cloudflare | Signed |
| Data Processing Agreement (DPA) | Hetzner | Signed |
| Data Processing Agreement (DPA) | Backblaze | Signed |
| Data Processing Agreement (DPA) | MeiliSearch | Signed |
| Data Processing Agreement (DPA) | Strapi (self-hosted) | N/A (self-hosted) |
| Standard Contractual Clauses (SCCs) | Cloudflare | Module 2 (Controller-Processor) |
| Standard Contractual Clauses (SCCs) | Backblaze | Module 2 (Controller-Processor) |
| Transfer Impact Assessment (TIA) | Cloudflare | In Progress |
| Transfer Impact Assessment (TIA) | Backblaze | In Progress |

---

## 7. Stakeholder Consultation

### 7.1 Internal Consultation

| Stakeholder | Role | Input Provided | Date |
|---|---|---|---|
| CISO | Security leadership | Risk assessment, control recommendations | 2026-04-15 |
| DPO | Privacy compliance | Regulatory requirements, consent framework | 2026-04-15 |
| Legal Counsel | Legal advice | Contract terms, jurisdictional analysis | 2026-04-16 |
| CTO | Technical leadership | Architecture review, feasibility assessment | 2026-04-17 |
| Product Owner | Product management | Feature requirements, data usage justification | 2026-04-18 |
| Development Lead | Engineering | Implementation feasibility, technical constraints | 2026-04-18 |
| QA Lead | Quality assurance | Testing approach, verification methods | 2026-04-19 |
| Marketing Director | Marketing | Consent requirements, analytics needs | 2026-04-20 |
| HR Director | Human resources | Employee data, training requirements | 2026-04-21 |

### 7.2 External Consultation

| Stakeholder | Role | Input Provided | Date |
|---|---|---|---|
| External Privacy Counsel | GDPR specialist | Jurisdictional compliance advice | 2026-04-22 |
| Penetration Testing Vendor | Security testing | Attack surface assessment | 2026-04-23 |
| Cloudflare Privacy Team | Sub-processor | Data transfer mechanisms, security measures | 2026-04-24 |
| Hetzner Compliance | Hosting provider | Data center certifications, audit reports | 2026-04-25 |
| Representative Sample (10 users) | Data subjects | Usability of consent mechanism, transparency | 2026-04-26 |

---

## 8. DPIA Approval and Conditions

### 8.1 Approval Decision

| Aspect | Decision |
|---|---|
| **DPIA Outcome** | Approved with conditions |
| **Residual Risk Level** | LOW for all identified risks |
| **Approval Date** | 2026-05-01 |
| **Next Review** | 2026-08-01 or upon significant change |

### 8.2 Conditions for Approval

1. **Consent Management**: The granular consent mechanism must be fully operational before any non-essential cookies or tracking is deployed.

2. **Cross-Border Transfers**: Transfer Impact Assessments for Cloudflare and Backblaze must be completed and documented before launch.

3. **DSAR Automation**: The automated Data Subject Access Request portal must be operational within 60 days of Phase 1 launch.

4. **Age Verification**: Age verification and parental consent mechanisms must be implemented before any data collection from users under 16.

5. **Sub-processor Audits**: Annual security audits of all sub-processors must be conducted with results reviewed by the DPO.

6. **Privacy Training**: All staff with access to personal data must complete privacy training before handling any production data.

7. **Breach Notification**: The 72-hour breach notification procedure must be tested with a tabletop exercise within 30 days of launch.

8. **Regular Review**: This DPIA must be reviewed every 6 months during the first year, then annually, or upon any significant change to processing.

### 8.3 Approval Signatures

| Role | Name | Signature | Date |
|---|---|---|---|
| Data Protection Officer | [To be appointed] | _________________ | _______ |
| CISO | [To be appointed] | _________________ | _______ |
| CTO | [To be appointed] | _________________ | _______ |
| Legal Counsel | [To be appointed] | _________________ | _______ |

---

## 9. Monitoring and Review

### 9.1 Key Performance Indicators

| KPI | Target | Measurement Frequency | Owner |
|---|---|---|---|
| Consent withdrawal rate | < 5% | Monthly | DPO |
| DSAR response time | < 25 days (95th percentile) | Per request | DPO |
| Data breach detection time | < 4 hours | Per incident | CISO |
| Privacy training completion | 100% | Quarterly | HR |
| Sub-processor audit completion | 100% | Annual | DPO |
| DPIA completion for new features | 100% | Per feature | Security Architect |
| Data retention compliance | 100% | Quarterly | Data Governance |
| Cross-border transfer documentation | 100% | Annual | DPO |

### 9.2 Review Triggers

| Trigger | Action | Timeline |
|---|---|---|
| New processing activity | Conduct mini-DPIA | Before launch |
| New sub-processor | Update DPAs, assess risk | Before engagement |
| New jurisdiction | Assess local requirements | Before launch |
| Data breach | Emergency DPIA review | Within 72 hours |
| Regulatory change | Assess impact, update controls | Within 30 days |
| Technology change | Re-assess technical measures | Before deployment |
| Annual review | Full DPIA refresh | Annually |

---

## 10. Document Change Log

| Version | Date | Author | Change Description |
|---|---|---|---|
| 1.0.0 | 2026-05-01 | Unisoft Technologies Privacy Team | Initial DPIA covering Phase 1-3 processing activities |

---

## 11. Appendices

### Appendix A: Glossary

| Term | Definition |
|---|---|
| **DPIA** | Data Protection Impact Assessment |
| **DPO** | Data Protection Officer |
| **DSAR** | Data Subject Access Request |
| **DPA** | Data Processing Agreement |
| **SCCs** | Standard Contractual Clauses |
| **TIA** | Transfer Impact Assessment |
| **PII** | Personally Identifiable Information |
| **RBAC** | Role-Based Access Control |
| **MFA** | Multi-Factor Authentication |
| **TTL** | Time To Live |

### Appendix B: Regulatory Contact Information

| Authority | Jurisdiction | Contact | Notification Method |
|---|---|---|---|
| Lead Supervisory Authority | EU (Germany - BfDI) | [To be determined based on main establishment] | Online portal |
| UAE Data Protection Authority | UAE | [To be established] | Email / Portal |
| Data Protection Board of India | India | [To be established] | Online portal |
| Saudi Data and AI Authority (SDAIA) | KSA | [To be established] | Email / Portal |

### Appendix C: Sub-processor Security Certifications

| Sub-processor | ISO 27001 | SOC 2 Type II | GDPR Compliance | Location |
|---|---|---|---|---|
| Cloudflare | Yes | Yes | Yes | USA |
| Hetzner | Yes | No | Yes | Germany |
| Backblaze | Yes | Yes | Yes | USA |
| MeiliSearch | No | No | Self-assessment | France |
| Strapi (self-hosted) | N/A | N/A | Self-assessment | Self-hosted |
