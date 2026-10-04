---
title: "Security & Responsible Disclosure Policy"
slug: "legal/security-disclosure"
url: "/legal/security-disclosure/"
template: "page-legal"
description: "TwinMOS responsible vulnerability disclosure policy aligned with ISO/IEC 29147, including scope, reporting process, and safe harbor commitments."
keywords: ["security", "vulnerability", "responsible disclosure", "cybersecurity", "report", "ISO 29147", "CVD", "coordinated vulnerability disclosure", "safe harbor"]
persona: ["Security Researcher", "Visitor"]
phase: P1
priority: P0
owner: "legal"
status: published
last_reviewed: "2026-04-30"
locale: en
schema: "Article"
ctas: []
cross_links: ["/legal/vulnerability-program/"]
sources: []
---

# Security & Responsible Disclosure Policy

> **Version 2.0 — Last Reviewed 2026-04-30**

TwinMOS Technologies takes the security of our products, websites, infrastructure, and customer data seriously. We recognize that security researchers and the broader security community play a vital role in helping organizations identify and remediate vulnerabilities before they can be exploited.

This Responsible Disclosure Policy ("Policy") is aligned with **ISO/IEC 29147:2018** (Vulnerability Disclosure) and international **Coordinated Vulnerability Disclosure (CVD)** best practices. It provides a clear framework for security researchers to report potential vulnerabilities to TwinMOS in good faith.

## 1. Our Security Commitment

TwinMOS is committed to:
- Protecting our customers' data and the integrity of our products
- Maintaining transparent communication with security researchers
- Responding promptly to credible vulnerability reports
- Recognizing the contributions of researchers who help us improve security
- Not taking legal action against researchers who act in good faith within this policy

## 2. Scope

### In Scope

The following TwinMOS assets are within the scope of this disclosure policy:

| Asset Type | Examples |
|---|---|
| Official TwinMOS websites | twinmos.com and all official subdomains (support.twinmos.com, partner.twinmos.com, etc.) |
| Customer-facing portals | Product registration portal, support ticket system, partner portal |
| APIs | Officially documented TwinMOS APIs serving external users |
| Product firmware | Firmware update mechanisms for TwinMOS SSDs and other products with updatable firmware |
| Software tools | TwinMOS-published diagnostic and management software utilities |
| Email infrastructure | TwinMOS email systems where security vulnerabilities may expose customer data |

### Out of Scope

The following are **not** in scope for this policy:

- Social engineering attacks against TwinMOS employees, contractors, or service providers (e.g., phishing, vishing)
- Denial-of-service (DoS or DDoS) attacks or testing that degrades or disrupts live services
- Physical security testing of TwinMOS offices, warehouses, or data centers
- Third-party services, platforms, or infrastructure not controlled by TwinMOS (e.g., cloud providers, ISPs)
- Issues in products or software sold by TwinMOS but developed by third parties, unless TwinMOS is the primary responsible party
- Vulnerabilities in products that have reached official end of support and are no longer receiving security updates
- Issues that require physical access to the target device to exploit

## 3. How to Report a Vulnerability

### Reporting Channel

Submit vulnerability reports to:

- **Email:** security@twinmos.com
- **Subject Line:** "Security Disclosure — [Brief Description of Vulnerability]"
- **PGP Encryption:** Available upon request for sensitive disclosures

### Required Information

Please include as much of the following as possible:

1. **Description:** A clear description of the vulnerability, including the affected system, component, or product
2. **Steps to Reproduce:** Detailed, repeatable steps to reproduce the vulnerability
3. **Proof of Concept (PoC):** Code, screenshots, network captures, or other evidence demonstrating the vulnerability (please do not include live exploit code that could cause harm if intercepted)
4. **Impact Assessment:** Your assessment of the potential impact (data exposure, unauthorized access, service disruption, etc.) and the users or systems affected
5. **Affected Versions:** Product versions, firmware versions, or URL paths affected
6. **Suggested Remediation:** If you have a proposed fix or mitigation, please share it (optional but welcome)
7. **Disclosure Timeline Preference:** Your preferred timeline for public disclosure (see Coordinated Disclosure section)

### What Not to Do

When testing and reporting, please:
- Do **not** access, modify, or delete data belonging to TwinMOS users or customers
- Do **not** perform actions that could degrade the performance or availability of our services
- Do **not** use automated scanning tools in a way that generates excessive server load
- Do **not** publicly disclose the vulnerability before TwinMOS has had the opportunity to assess and remediate it

## 4. Our Response Commitments

| Milestone | Timeline |
|---|---|
| Acknowledgment of receipt | Within **2 business days** |
| Initial assessment and triage | Within **10 business days** |
| Status update (if investigation ongoing) | Within **30 days** of acknowledgment |
| Remediation (target for critical/high vulnerabilities) | Within **90 days** where technically feasible |
| Notification of patch/fix availability | Upon release |

We will maintain communication with you throughout the investigation process. If we require additional information, we will contact you promptly.

## 5. Coordinated Vulnerability Disclosure

TwinMOS follows the **Coordinated Vulnerability Disclosure (CVD)** model as recommended by ISO/IEC 29147. Under CVD:

1. **Reporter submits** the vulnerability to TwinMOS privately
2. **TwinMOS investigates** and develops a fix within a reasonable timeframe
3. **Reporter and TwinMOS agree** on a disclosure timeline (typically 90 days from initial report, unless an extension is mutually agreed)
4. **Vulnerability is disclosed** publicly after a fix has been released or after the disclosure deadline, whichever comes first
5. **Reporter may request CVE assignment** through a CVE Numbering Authority (CNA); TwinMOS will cooperate with CVE coordination

If we cannot remediate a vulnerability within the agreed timeframe, we will communicate proactively and negotiate an extension. We will not unilaterally extend the disclosure deadline without the reporter's agreement.

## 6. Safe Harbor

TwinMOS will not pursue civil or criminal legal action against security researchers who:
- Act in good faith, with genuine intent to help improve security
- Comply with this Policy, including the in-scope/out-of-scope definitions
- Do not cause unauthorized harm to TwinMOS systems or data
- Do not access, retain, or disclose data beyond what is necessary to demonstrate the vulnerability
- Do not exploit the vulnerability for personal gain or share it with third parties
- Report the vulnerability promptly and cooperate with our response process

This safe harbor applies only to conduct covered by this Policy. Conduct that falls outside this Policy, including unauthorized access to systems out of scope, may not be protected.

## 7. Recognition

TwinMOS sincerely appreciates the contributions of security researchers who help us protect our customers. Researchers who submit valid in-scope vulnerability reports may be recognized in our [Bug Bounty & Vulnerability Program](/legal/vulnerability-program/), including eligibility for rewards and acknowledgment in our Security Hall of Fame (with permission).

## 8. Contact

**TwinMOS Security Team**
- Email: security@twinmos.com
- General legal inquiries: legal@twinmos.com
- Address: TwinMOS Technologies Middle East FZE, C-9, Dubai Airport Freezone (DAFZA), P.O. Box 54278, Dubai, UAE
