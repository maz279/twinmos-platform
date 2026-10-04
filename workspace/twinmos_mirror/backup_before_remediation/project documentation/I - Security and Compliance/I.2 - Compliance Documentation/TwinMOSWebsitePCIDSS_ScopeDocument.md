# PCI DSS Scope Document

| Document Attribute | Value |
|---|---|
| **Document ID** | TWN-COMP-2026-007 |
| **Version** | 1.0.0 |
| **Status** | Draft |
| **Author** | Unisoft Technologies Security Team |
| **Owner** | CISO / PCI Compliance Manager |
| **Review Date** | 2026-11-01 |
| **Classification** | Confidential |
| **Related Documents** | TWN-SEC-2026-007 (Encryption Strategy), TWN-SEC-2026-008 (Key Management), TWN-COMP-2026-003 (Data Classification) |
| **Compliance Mapping** | PCI DSS 4.0, PCI SAQ A, PCI SAQ A-EP, PA-DSS (where applicable) |

---

## 1. Executive Summary

This document defines the Payment Card Industry Data Security Standard (PCI DSS) 4.0 scope for the TwinMOS corporate website's e-commerce functionality (Phase 3). The scope determination follows PCI SSC guidance for scoping and segmentation, with the objective of minimizing the Cardholder Data Environment (CDE) through implementation of a fully outsourced payment model.

**Scope Determination**: TwinMOS will implement a **PCI SAQ A** eligible architecture by using a fully hosted, iframe-based or redirect-based payment page from a PCI DSS Level 1 Service Provider (Stripe or Adyen). No cardholder data (CHD) will enter TwinMOS systems.

**Target Compliance Level**: PCI DSS 4.0 SAQ A (Self-Assessment Questionnaire A)

---

## 2. PCI DSS 4.0 Overview

### 2.1 PCI DSS 4.0 Requirements

| Requirement Domain | Requirement Numbers | Description |
|---|---|---|
| **Build and Maintain a Secure Network** | 1.0 - 1.5 | Firewalls, network security controls |
| **Apply Strong Cryptography** | 2.0 - 2.5 | System hardening, encryption, authentication |
| **Maintain a Vulnerability Management Program** | 3.0 - 3.7 | Data protection, storage, disposal |
| **Implement Strong Access Control Measures** | 4.0 - 4.5 | Access control, authentication, monitoring |
| **Regularly Monitor and Test Networks** | 5.0 - 5.6 | Logging, monitoring, vulnerability management |
| **Maintain an Information Security Policy** | 6.0 - 6.6 | Security policies, risk assessment, training |
| **Additional Requirements** | 7.0 - 12.0 | Service providers, multi-factor authentication, scripting |

### 2.2 SAQ A Eligibility Criteria

| Criterion | TwinMOS Implementation | Eligible? |
|---|---|---|
| All cardholder data functions fully outsourced | Yes - Stripe/Adyen hosted payment page | Yes |
| No electronic storage of cardholder data | Yes - no CHD enters TwinMOS systems | Yes |
| No software that stores, processes, or transmits CHD | Yes - payment handled entirely by provider | Yes |
| Third-party provider is PCI DSS compliant | Yes - Stripe/Adyen Level 1 Service Provider | Yes |
| No impact on security of payment page | Yes - iframe/redirect, no TwinMOS scripts on payment page | Yes |
| Confirmation of provider responsibility | Yes - documented in agreement | Yes |

---

## 3. Cardholder Data Environment (CDE) Definition

### 3.1 CDE Boundary

```
+-----------------------------------------------------------+
|                    TWINMOS WEBSITE                         |
|  (Astro + React, Cloudflare Pages, Hetzner)               |
|                                                           |
|  +------------------+      +---------------------------+  |
|  |  Product Pages   |      |  Checkout Flow            |  |
|  |  (L1-L2 Data)    |      |  (No CHD - redirect)      |  |
|  +------------------+      +---------------------------+  |
|           |                           |                   |
|           v                           v                   |
|  +------------------+      +---------------------------+  |
|  |  Strapi CMS      |      |  Stripe/Adyen             |  |
|  |  (No CHD)        |      |  (PCI DSS Level 1)        |  |
|  +------------------+      |  Hosted Payment Page      |  |
|                            |  (Full CHD Handling)      |  |
|                            +---------------------------+  |
|                                                           |
+-----------------------------------------------------------+
```

### 3.2 Systems in Scope

| System | Role | CHD Exposure | PCI Scope |
|---|---|---|---|
| **E-commerce frontend (Astro)** | Product display, cart management, order confirmation | None - no CHD input fields | Out of scope (with SAQ A) |
| **Strapi CMS** | Content management, order records | None - stores token references only | Out of scope (with SAQ A) |
| **PostgreSQL** | Order database, customer records | None - stores payment token ID only | Out of scope (with SAQ A) |
| **Cloudflare CDN/WAF** | Content delivery, security | None - does not process CHD | Out of scope (with SAQ A) |
| **Stripe/Adyen** | Payment processing, CHD handling | Full CHD - hosted payment page | In scope (Service Provider) |
| **Hetzner servers** | Application hosting | None - no CHD stored or processed | Out of scope (with SAQ A) |

### 3.3 Data Elements and Scope

| Data Element | Type | Stored by TwinMOS? | Scope |
|---|---|---|---|
| Primary Account Number (PAN) | CHD | No | Out of scope |
| Cardholder Name | CHD | No | Out of scope |
| Expiration Date | CHD | No | Out of scope |
| Service Code | CHD | No | Out of scope |
| CVV/CVC | Sensitive Authentication Data (SAD) | No | Out of scope |
| PIN | SAD | No | Out of scope |
| Magnetic Stripe Data | SAD | No | Out of scope |
| Chip Data | SAD | No | Out of scope |
| Payment Token | Tokenized reference | Yes (token ID only) | Out of scope (token is not CHD) |
| Last 4 digits of PAN | Truncated | Yes (for display) | Out of scope (truncated per PCI) |
| Card brand | Metadata | Yes | Out of scope |
| Payment method type | Metadata | Yes | Out of scope |
| Transaction ID | Reference | Yes | Out of scope |
| Authorization code | Reference | Yes | Out of scope |

---

## 4. Payment Architecture

### 4.1 Payment Flow (SAQ A - Redirect Model)

```
[Customer] --> [TwinMOS Cart] --> [TwinMOS Checkout Summary]
                                        |
                                        v
                              [Redirect to Stripe/Adyen]
                                        |
                                        v
                              [Hosted Payment Page]
                              (Customer enters card data)
                                        |
                                        v
                              [Stripe/Adyen processes payment]
                                        |
                                        v
                              [Redirect back to TwinMOS]
                                        |
                                        v
                              [Order Confirmation]
                              (Token + last 4 digits only)
```

### 4.2 Payment Flow (SAQ A - iFrame Model)

```
[Customer] --> [TwinMOS Checkout Page]
                    |
                    +-- [iFrame: Stripe Elements]
                    |       (Customer enters card data)
                    |       (Data sent directly to Stripe)
                    |
                    +-- [TwinMOS: Order summary, shipping]
                    |
                    v
            [Stripe returns token]
                    |
                    v
            [TwinMOS confirms order with token]
```

### 4.3 Architecture Decision

| Approach | SAQ Eligibility | User Experience | Security | Recommendation |
|---|---|---|---|---|
| **Redirect** | SAQ A | Slight context switch | Highest | Preferred for simplicity |
| **iFrame** | SAQ A | Seamless | High | Preferred for UX |
| **Direct API** | SAQ A-EP / Full | Fully integrated | Lower (more scope) | Not recommended |
| **Self-hosted** | Full PCI DSS | Fully integrated | Lowest (full CDE) | Rejected |

**Decision**: Implement **Stripe Elements (iFrame)** for optimal user experience while maintaining SAQ A eligibility. Fallback to redirect if technical constraints arise.

---

## 5. Segmentation and Network Controls

### 5.1 Network Segmentation

Although SAQ A minimizes scope, the following segmentation is implemented as defense-in-depth:

| Zone | Systems | Access Controls |
|---|---|---|
| **Public Zone** | Cloudflare CDN, WAF | Public access |
| **Application Zone** | Astro frontend, Strapi API | HTTPS only, API keys |
| **Data Zone** | PostgreSQL, MeiliSearch | Private network, no public IPs |
| **Payment Zone** | Stripe/Adyen (external) | iFrame isolation, CSP restrictions |
| **Management Zone** | Coolify, monitoring | VPN + MFA required |

### 5.2 Firewall Rules

| Source | Destination | Port | Purpose | Action |
|---|---|---|---|---|
| Any | Cloudflare | 443 | Public website | Allow |
| Cloudflare | Hetzner (Astro) | 443 | Origin pull | Allow |
| Hetzner (Astro) | Hetzner (Strapi) | 443 | API calls | Allow |
| Hetzner (Strapi) | Hetzner (PostgreSQL) | 5432 | Database | Allow |
| Hetzner (any) | Stripe API | 443 | Payment token operations | Allow |
| Any | Hetzner (direct) | Any | Direct access | Deny |

---

## 6. Security Controls for In-Scope Elements

### 6.1 Controls Applicable to TwinMOS (SAQ A)

| PCI Requirement | Control | Implementation | Evidence |
|---|---|---|---|
| 1.2.1 | Network security controls | Cloudflare WAF, Hetzner firewall | Configuration docs |
| 2.1.1 | System hardening | CIS benchmarks, minimal services | Hardening scripts |
| 2.2.1 | Vendor default passwords changed | All default credentials changed | Audit checklist |
| 2.3.1 | Strong cryptography for transmission | TLS 1.3, HSTS | SSL Labs report |
| 5.2.1 | Anti-malware | ClamAV on file uploads, server scanning | Scan reports |
| 5.3.1 | Anti-malware kept current | Automated updates | Update logs |
| 6.3.1 | Security patches | Automated patching within 30 days | Patch management logs |
| 8.2.1 | Strong authentication | MFA for admin, strong passwords | Auth configuration |
| 8.3.1 | MFA for CDE access | MFA for all admin access | MFA enrollment |
| 9.1.1 | Physical security | Hetzner data center security | Provider certification |
| 10.2.1 | Audit logging | Comprehensive logging to Loki | Logging configuration |
| 11.3.1 | Vulnerability scanning | Quarterly external scans | Scan reports |
| 12.1.1 | Security policy | Information security policy | Policy document |
| 12.3.1 | Risk assessment | Annual risk assessment | Risk register |
| 12.4.1 | Security roles | Defined security responsibilities | RACI matrix |
| 12.5.1 | Security monitoring | 24/7 monitoring, alerting | Monitoring dashboard |
| 12.6.1 | Security awareness training | Annual training for all staff | Training records |
| 12.7.1 | Background checks | Background checks for new hires | HR records |
| 12.8.1 | Third-party management | Service provider agreements | DPAs, contracts |
| 12.9.1 | Incident response | Documented incident response plan | IR plan |
| 12.10.1 | Disaster recovery | Backup and recovery procedures | DR plan |

### 6.2 Controls Delegated to Payment Provider

| PCI Requirement | Responsibility | Provider Evidence |
|---|---|---|
| 3.1 - 3.7 | Data protection and storage | Stripe/Adyen AOC |
| 4.1 - 4.5 | CHD transmission security | Stripe/Adyen AOC |
| 6.5 - 6.7 | Secure software development | Stripe/Adyen AOC |
| 8.1 - 8.8 | Access control for CHD | Stripe/Adyen AOC |
| 10.1 - 10.7 | CHD access logging | Stripe/Adyen AOC |
| 11.1 - 11.2 | CHD environment scanning | Stripe/Adyen AOC |
| 11.4.1 - 11.4.7 | Intrusion detection | Stripe/Adyen AOC |

---

## 7. Third-Party Service Providers

### 7.1 Service Provider Register

| Provider | Service | PCI Level | AOC Available | Contract Review |
|---|---|---|---|---|
| **Stripe** | Payment processing | Level 1 | Yes | Annual |
| **Adyen** | Payment processing (backup) | Level 1 | Yes | Annual |
| **Cloudflare** | CDN/WAF | N/A (not handling CHD) | SOC 2 | Annual |
| **Hetzner** | Hosting | N/A (not handling CHD) | ISO 27001 | Annual |

### 7.2 Service Provider Due Diligence

| Activity | Frequency | Owner | Evidence |
|---|---|---|---|
| AOC collection | Annual | Compliance Manager | AOC documents |
| Responsibility matrix review | Annual | Compliance Manager | RACI document |
| Security questionnaire | Annual | Compliance Manager | Completed questionnaire |
| Contract review | Annual | Legal | Contract amendments |
| Incident notification test | Annual | Compliance Manager | Test results |

---

## 8. Compliance Validation

### 8.1 SAQ A Completion

| Step | Activity | Timeline | Owner |
|---|---|---|---|
| 1 | Confirm SAQ A eligibility | Before launch | Compliance Manager |
| 2 | Complete SAQ A questionnaire | Within 30 days of launch | Compliance Manager |
| 3 | Gather evidence for all requirements | Concurrent with SAQ | Compliance Manager |
| 4 | Internal review of SAQ | Before submission | CISO |
| 5 | Submit SAQ to acquirer | Annual | Compliance Manager |
| 6 | Address any findings | Within 30 days | Compliance Manager |

### 8.2 Annual Compliance Calendar

| Month | Activity | Owner |
|---|---|---|
| January | Vulnerability scan (external) | Security Engineer |
| February | SAQ A review and update | Compliance Manager |
| March | Service provider AOC collection | Compliance Manager |
| April | Penetration test | External vendor |
| May | Policy review | CISO |
| June | Risk assessment update | Compliance Manager |
| July | Training completion verification | HR |
| August | Internal audit | Internal auditor |
| September | Vulnerability scan (external) | Security Engineer |
| October | SAQ A completion | Compliance Manager |
| November | Evidence compilation | Compliance Manager |
| December | Annual review and planning | CISO |

---

## 9. Incident Response for Payment Data

### 9.1 Incident Classification

| Level | Description | Response Time | Notification |
|---|---|---|---|
| **P0 - Critical** | Suspected CHD breach, unauthorized access to payment systems | Immediate | Acquirer within 24h, card brands |
| **P1 - High** | Payment system outage, fraud pattern detected | 1 hour | Acquirer within 48h |
| **P2 - Medium** | Payment provider issue, tokenization failure | 4 hours | Internal notification |
| **P3 - Low** | Minor payment UX issue, reporting discrepancy | 24 hours | Internal tracking |

### 9.2 Breach Notification Requirements

| Party | Timeline | Method | Content |
|---|---|---|---|
| **Payment provider** | Immediate | Phone + email | Incident details, scope |
| **Acquirer** | Within 24 hours | Formal notification | PCI incident form |
| **Card brands** | Per brand requirements | Designated portal | Forensic details |
| **Affected customers** | Without undue delay | Email + website notice | Breach scope, remediation |
| **Regulators** | Per GDPR/local laws | Formal notification | Full incident report |

---

## 10. Document Change Log

| Version | Date | Author | Change Description |
|---|---|---|---|
| 1.0.0 | 2026-05-01 | Security Team | Initial PCI DSS scope document for Phase 3 e-commerce |
