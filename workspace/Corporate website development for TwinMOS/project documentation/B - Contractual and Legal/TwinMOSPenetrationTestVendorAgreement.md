# TwinMOS Technologies Middle East FZE — [Penetration Testing Vendor]

# Penetration Test Vendor Agreement

**Document Reference:** TWN-LEGAL-PENTEST-2026-001  
**Version:** 1.0  
**Effective Date:** [DATE UPON EXECUTION]  
**Governing Law:** Laws of the United Arab Emirates (Dubai International Financial Centre — DIFC, where applicable)

> **Note:** The vendor party name, registered address, and point-of-contact details are to be completed upon selection of the penetration testing vendor following TwinMOS's security vendor selection process. All other terms, scope definitions, and obligations are pre-agreed and binding upon execution.

---

## Table of Contents

1. [Preamble and Parties](#1-preamble-and-parties)
2. [Definitions](#2-definitions)
3. [Scope of Testing](#3-scope-of-testing)
4. [Rules of Engagement](#4-rules-of-engagement)
5. [Testing Windows and Schedule](#5-testing-windows-and-schedule)
6. [Authorization and Legal Safe Harbor](#6-authorization-and-legal-safe-harbor)
7. [Coordination with Unisoft](#7-coordination-with-unisoft)
8. [Communication and Escalation](#8-communication-and-escalation)
9. [Emergency Stop Procedures](#9-emergency-stop-procedures)
10. [Deliverables and Report Format](#10-deliverables-and-report-format)
11. [Remediation Process](#11-remediation-process)
12. [Confidentiality of Findings](#12-confidentiality-of-findings)
13. [Data Handling During Testing](#13-data-handling-during-testing)
14. [Insurance Requirements](#14-insurance-requirements)
15. [Limitation of Liability and Indemnification](#15-limitation-of-liability-and-indemnification)
16. [Subcontractor Authorization](#16-subcontractor-authorization)
17. [Dispute Resolution](#17-dispute-resolution)
18. [General Provisions](#18-general-provisions)
19. [Signatures](#19-signatures)

---

## 1. Preamble and Parties

### 1.1 Parties

This Penetration Test Vendor Agreement ("**Agreement**") is entered into between:

**TwinMOS Technologies Middle East FZE**  
C-9, Dubai Airport Free Zone (DAFZA)  
Dubai, United Arab Emirates  
P.O. Box 293693  
("**Client**" or "**TwinMOS**")

and

**[Penetration Testing Vendor — Full Legal Name to be completed]**  
[Registered Address to be completed]  
Trade License / Registration No.: [To be completed]  
("**Vendor**" or "**Testing Provider**")

Collectively referred to as the "**Parties**" and individually as a "**Party**".

### 1.2 Purpose

This Agreement governs the engagement of the Vendor to perform controlled security assessment and penetration testing services against TwinMOS's corporate website infrastructure (twinmos.com) and associated systems. The engagement is authorized by TwinMOS to identify security vulnerabilities before and after public launch, enabling TwinMOS and its development partner, Unisoft Solutions Ltd., to remediate findings and strengthen the security posture of the website.

### 1.3 Relationship to Other Agreements

(a) This Agreement is referenced in the TwinMOS–Unisoft Master Service Agreement (TWN-LEGAL-MSA-2026-001), Section 3.3 (excluded from Unisoft's scope) and Section 9.3 (Unisoft cooperation obligations during penetration testing).

(b) Unisoft Solutions Ltd. is TwinMOS's development vendor for twinmos.com and is not a party to this Agreement. Unisoft's obligations to cooperate with penetration testing are governed by the MSA. This Agreement does not create any obligations for Unisoft directly.

(c) This Agreement is a standalone vendor services agreement and is not an annex to the MSA.

---

## 2. Definitions

### 2.1 Key Terms

| Term | Definition |
|------|------------|
| **"Authorized Testing"** | All testing activities explicitly permitted under the In-Scope Assets (Section 3.1) and conducted in accordance with the Rules of Engagement (Section 4). |
| **"CVSS"** | Common Vulnerability Scoring System (version 3.1), the industry-standard scoring framework used to assess the severity of security vulnerabilities. |
| **"Emergency Stop"** | An immediate suspension of all Authorized Testing activities, invocable by designated TwinMOS personnel under Section 9. |
| **"Engagement"** | The specific penetration testing assignment described in this Agreement and the applicable Statement of Work (Exhibit A). |
| **"Findings"** | All vulnerabilities, weaknesses, misconfigurations, and security observations identified by the Vendor during Authorized Testing. |
| **"In-Scope Assets"** | The specific systems, domains, applications, and infrastructure explicitly authorized for testing under Section 3.1. |
| **"Out-of-Scope Assets"** | Systems, infrastructure, and data categories explicitly excluded from testing under Section 3.2. Any ambiguity is resolved in favor of Out-of-Scope. |
| **"Production Environment"** | The live, publicly accessible twinmos.com website and its backend services, serving real end users. |
| **"Report"** | The comprehensive written deliverable produced by the Vendor at the conclusion of each testing phase, as specified in Section 10. |
| **"Rules of Engagement (RoE)"** | The specific constraints, permitted techniques, prohibited techniques, and procedural requirements governing the conduct of Authorized Testing, defined in Section 4. |
| **"Safe Harbor"** | The legal protection granted to the Vendor for activities conducted within the scope of Authorized Testing and in compliance with this Agreement and the Rules of Engagement. |
| **"Staging Environment"** | A non-production replica of the twinmos.com website used for testing purposes, mirroring production configuration without live customer data. |
| **"Testing Window"** | The specific dates, times, and systems during which Authorized Testing may be conducted, as defined in Section 5. |
| **"Unisoft"** | Unisoft Solutions Ltd., TwinMOS's development vendor for twinmos.com, whose cooperation obligations during testing are governed by the MSA (TWN-LEGAL-MSA-2026-001). |

---

## 3. Scope of Testing

### 3.1 In-Scope Assets

The following assets are authorized for penetration testing under this Agreement:

#### 3.1.1 Web Application and Frontend

| Asset | Description | Testing Type |
|-------|-------------|--------------|
| **twinmos.com** (production) | Public-facing corporate website (Astro 5 / React 19 frontend, Cloudflare Pages) | Black-box reconnaissance; OWASP Top 10 testing; XSS, CSRF, clickjacking |
| **staging.twinmos.com** (or equivalent) | Non-production staging environment | Full gray-box testing; all techniques permitted within RoE |
| **All subdomains of twinmos.com** in active use | Including www., cdn., support., partner., api. | As appropriate per subdomain function |
| **Contact forms, partner registration, warranty registration, newsletter signup** | All user-facing form endpoints | Input validation, injection, CSRF |

#### 3.1.2 Backend and API

| Asset | Description | Testing Type |
|-------|-------------|--------------|
| **Strapi v5 CMS Admin Portal** | Content management system admin interface ([URL to be provided]) | Authentication bypass, privilege escalation, API security |
| **Strapi REST and GraphQL API endpoints** | All published API endpoints serving website content | Authorization, injection, mass assignment, rate limiting |
| **MeiliSearch API** | Search engine API endpoints | Access control, injection, information disclosure |
| **Authentication and session management** | Login flows, JWT implementation, session tokens, password reset | Brute force controls, token security, session fixation |
| **Partner Portal** | Distributor/partner login and access area | Authentication, authorization, data access controls |

#### 3.1.3 Infrastructure (Limited Scope)

| Asset | Description | Testing Type | Restriction |
|-------|-------------|--------------|-------------|
| **Cloudflare WAF and DDoS configuration** | Web Application Firewall rules and bypass testing | WAF bypass attempts; firewall rule analysis | Configuration review only; no DDoS simulation |
| **Hetzner VPS / Coolify hosting** (Strapi backend) | Server configuration, exposed ports, services | Port scanning, service enumeration, server-side vulnerabilities | Staging environment only; production access requires explicit approval per test |
| **SSL/TLS configuration** | Certificate chain, protocol versions, cipher suites | SSL Labs-style analysis; downgrade attack testing | Passive analysis + active handshake testing only |

#### 3.1.4 Testing Categories Authorized

- OWASP Top 10 Web Application Security Risks (2021 edition)
- OWASP API Security Top 10 (2023 edition)
- Authentication and Authorization testing (IDOR, broken access control)
- Injection vulnerabilities (SQL injection, NoSQL injection, command injection, template injection)
- Cross-Site Scripting (XSS) — reflected, stored, DOM-based
- Cross-Site Request Forgery (CSRF)
- Security misconfigurations (HTTP headers, CORS policy, exposed admin interfaces)
- Sensitive data exposure (information leakage, error messages, path traversal)
- Broken Object Level Authorization (BOLA/IDOR) on API endpoints
- Server-Side Request Forgery (SSRF)
- Business logic vulnerabilities
- Third-party component vulnerability assessment (Astro, React, Strapi, MeiliSearch known CVEs)

### 3.2 Out-of-Scope Assets

The following are explicitly excluded from testing. The Vendor must not test, probe, or access Out-of-Scope Assets under any circumstances:

| Asset / Category | Reason for Exclusion |
|-----------------|---------------------|
| **TwinMOS Taiwan internal systems** (twinmos.com.tw, internal ERP) | Not part of this engagement |
| **TwinMOS India office systems** | Not part of this engagement |
| **Regional distributor systems** | Not part of this engagement |
| **Cloudflare core infrastructure** | Third-party platform; not TwinMOS-owned |
| **GitHub platform** (github.com itself) | Third-party platform; not TwinMOS-owned |
| **Sentry, Resend, Backblaze, HubSpot core platforms** | Third-party SaaS; not TwinMOS-owned |
| **Production PostgreSQL database — data exfiltration** | Proof-of-concept access demonstration only; no bulk download of any data |
| **Production customer data, form submissions, user records** | May not be accessed, read, extracted, or copied beyond confirming access as proof-of-concept |
| **Stripe or Medusa.js payment systems in production** | Financial systems; staging environment testing only, with explicit re-authorization |
| **Email systems (MX records, email server)** | Not in scope for this engagement |
| **Social engineering of TwinMOS or Unisoft personnel** | Excluded unless explicitly authorized by separate written addendum |
| **Physical security testing** | Excluded unless explicitly authorized by separate written addendum |
| **Any system not explicitly listed in Section 3.1** | Default exclusion — ambiguity resolves to Out-of-Scope |

### 3.3 Scope Clarification Protocol

(a) If the Vendor encounters a system or asset during testing whose scope status is unclear, the Vendor shall immediately **stop testing that system** and contact the TwinMOS Emergency Contact (Section 8.2) for scope clarification before proceeding.

(b) Proceeding with testing of an ambiguous or unlisted system without prior TwinMOS authorization is a material breach of this Agreement and voids Safe Harbor protections for activities related to that system.

---

## 4. Rules of Engagement

### 4.1 Testing Methodology

The primary testing methodology is **gray-box** (hybrid): the Vendor will be provided with limited system documentation (architecture overview, Strapi API schema, non-production credentials for the staging environment) while conducting testing that simulates both external attackers and insider threats with limited access.

For production environment testing (where authorized), the methodology is **black-box** by default, unless otherwise agreed for specific test cases.

### 4.2 Permitted Techniques

The following techniques are permitted during Authorized Testing within the designated Testing Windows:

(a) **Passive Reconnaissance:** OSINT, DNS enumeration, certificate transparency log analysis, search engine dorking for public twinmos.com information

(b) **Active Scanning:** Port scanning (Nmap), service enumeration, web application fingerprinting, directory and file enumeration, API endpoint discovery

(c) **Vulnerability Assessment:** Automated scanning (Burp Suite Pro, OWASP ZAP, Nuclei) and manual verification of findings

(d) **Exploitation:** Exploitation of discovered vulnerabilities to confirm exploitability and assess impact — using the minimum access necessary to prove the finding. Exploitation must stop upon achieving proof of vulnerability without further lateral movement unless lateral movement is explicitly in scope.

(e) **Privilege Escalation:** Attempting to escalate privileges from an unprivileged authenticated user to administrative access, within the staging environment

(f) **Lateral Movement:** Within the staging environment only, and only to the extent necessary to demonstrate the impact of a confirmed vulnerability

(g) **Authentication Testing:** Brute-force testing against rate-limited test accounts (not production accounts), credential stuffing simulation, token analysis, session testing

(h) **API Testing:** Testing all published API endpoints for authorization flaws, injection, and data exposure, using provided test credentials in the staging environment

### 4.3 Prohibited Techniques

The following techniques are **absolutely prohibited** under this Agreement:

(a) **Denial of Service (DoS) or Distributed DoS (DDoS) attacks** of any kind against any in-scope or out-of-scope system

(b) **Destruction or modification of production data**, including any modification of product listings, CMS content, user records, or website configuration in the production environment

(c) **Bulk exfiltration of production data**, including database dumps, bulk API scraping of product data, or download of media/file assets — access demonstration only (screenshot or log entry confirming access)

(d) **Creation of persistent backdoors, malware, or unauthorized user accounts** that remain after the Engagement

(e) **Deletion of logs** or any attempt to obscure evidence of the testing activity

(f) **Social engineering** of TwinMOS, Unisoft, or any third-party personnel without explicit written authorization from TwinMOS

(g) **Testing of Out-of-Scope Assets** (Section 3.2)

(h) **Testing outside of designated Testing Windows** (Section 5) without explicit written authorization

(i) **Exploitation of vulnerabilities beyond proof-of-concept** in the production environment (e.g., using access to deface the website, send unauthorized emails, or exfiltrate data)

(j) **Physical access** to TwinMOS, Unisoft, or Hetzner facilities

(k) **Any technique that cannot be immediately suspended** upon Emergency Stop invocation (Section 9)

### 4.4 Production vs. Staging Environment Restrictions

| Action | Staging Environment | Production Environment |
|--------|--------------------|-----------------------|
| Automated vulnerability scanning | Permitted | Permitted with 24h advance notice; off-hours only |
| Manual exploitation of vulnerabilities | Permitted (full RoE) | Proof-of-concept only; no data modification |
| Brute force authentication | Permitted (test accounts) | Prohibited (risk of account lockouts affecting real users) |
| Database query injection (SQLi) | Permitted | Proof-of-concept only; no data extraction |
| File upload exploitation | Permitted | Strictly controlled; no executable payloads |
| Privilege escalation | Permitted | Proof-of-concept only; immediate cease upon gaining access |

### 4.5 Mandatory Testing Practices

(a) All testing activities must be logged with timestamps, tools used, and actions taken, for inclusion in the Report.

(b) The Vendor shall use a dedicated, isolated testing laptop or VM with no production credentials or sensitive TwinMOS data stored on the device beyond what is necessary for the engagement.

(c) All test credentials (staging environment usernames, passwords, API keys) provided by TwinMOS are to be treated as Confidential Information (Section 12) and destroyed within 5 Business Days of engagement completion.

---

## 5. Testing Windows and Schedule

### 5.1 Pre-Launch Security Assessment (Primary Engagement)

The primary penetration test should be conducted on the staging environment **before go-live** of twinmos.com, as follows:

| Phase | Activity | Environment | Timing |
|-------|----------|-------------|--------|
| **Phase 1 — Reconnaissance & Scanning** | Passive OSINT; active scanning and enumeration | Staging | Pre-launch (dates TBD per SOW) |
| **Phase 2 — Vulnerability Assessment** | Automated + manual vulnerability testing | Staging | Pre-launch |
| **Phase 3 — Exploitation & Privilege Escalation** | Gray-box exploitation; authorization bypass | Staging | Pre-launch |
| **Phase 4 — Production Spot-Check** | Limited black-box scan of live production (post-launch) | Production | 7–14 days after go-live |
| **Phase 5 — Report Delivery and Debrief** | Final report, read-out meeting | N/A | Within 10 Business Days of Phase 4 completion |

### 5.2 Permitted Testing Hours

| Environment | Permitted Testing Hours | Notes |
|-------------|------------------------|-------|
| **Staging Environment** | Any time (24/7) | Staging downtime does not affect real users |
| **Production Environment (Scanning)** | Friday–Saturday 02:00–06:00 GST, or other off-peak hours agreed in writing | Minimizes impact on real user traffic |

### 5.3 Advance Notice Requirements

(a) **Staging testing phases:** Vendor shall notify TwinMOS's designated contact **48 hours** in advance of commencing each testing phase on staging.

(b) **Production scanning:** Vendor shall notify TwinMOS at least **72 hours** in advance of any production environment scanning.

(c) **Unscheduled or extended testing:** Any extension of testing beyond the agreed schedule requires written approval from TwinMOS.

### 5.4 Blackout Periods

Testing is prohibited during the following periods without explicit written approval:

(a) The 72 hours before and after the official public go-live of twinmos.com  
(b) Major product launch campaigns (to be communicated by TwinMOS with at least 14 days' notice)  
(c) COMPUTEX trade show and similar major events where TwinMOS requires full website availability  
(d) Any period where TwinMOS's IT or development team is unavailable to respond to emergency stop requests (e.g., public holiday periods in Dubai)

### 5.5 Annual or Periodic Re-Testing

TwinMOS may commission subsequent penetration test Engagements (e.g., annual re-test, post-major-release test) under this Agreement or a separate Statement of Work. Each such Engagement shall specify its own Testing Windows and scope, subject to the terms of this Agreement.

---

## 6. Authorization and Legal Safe Harbor

### 6.1 Explicit Written Authorization

TwinMOS hereby explicitly authorizes the Vendor and its personnel to conduct Authorized Testing as defined in this Agreement, for the limited purpose of identifying security vulnerabilities in the In-Scope Assets. This authorization is granted by:

TwinMOS Technologies Middle East FZE  
C-9, Dubai Airport Free Zone (DAFZA), Dubai, UAE

This Agreement constitutes written proof of authorization and serves as the primary legal safe harbor document for the Engagement.

### 6.2 Safe Harbor Scope

(a) The Safe Harbor granted under Section 6.1 is limited strictly to:
- Activities conducted within the In-Scope Assets (Section 3.1)
- Activities conducted within designated Testing Windows (Section 5)
- Activities complying with the Rules of Engagement (Section 4)
- Activities conducted by personnel listed in the Vendor Personnel Schedule (Exhibit B)

(b) Activities outside any of the above parameters are NOT covered by Safe Harbor and are conducted entirely at the Vendor's own legal risk.

### 6.3 Third-Party Authorization Obligations

Before commencing any testing, TwinMOS shall obtain (or confirm existing) written authorization from the following third-party infrastructure providers:

| Provider | Authorization Required | TwinMOS Action |
|----------|----------------------|----------------|
| **Cloudflare** | Notification that security testing is authorized for twinmos.com | TwinMOS to notify via Cloudflare dashboard/support; avoid triggering account suspension |
| **Hetzner** | Notification/approval for testing of hosted VPS within TwinMOS's contracted hosting environment | TwinMOS to notify Hetzner per their penetration testing policy |
| **GitHub** | No external authorization required for testing of TwinMOS-hosted code repositories accessed via twinmos.com | N/A — application-layer only |

TwinMOS shall provide written confirmation to the Vendor that all required third-party authorizations have been obtained before the Vendor commences any production environment testing.

### 6.4 Vendor Personnel Authorization

(a) Only personnel listed in the **Vendor Personnel Schedule (Exhibit B)** are authorized to conduct testing under this Agreement.

(b) The Vendor shall notify TwinMOS in writing at least **5 Business Days** in advance of any change to testing personnel, and obtain written approval before the new personnel commences testing.

(c) The Vendor warrants that all testing personnel hold current, relevant security certifications (e.g., CEH, OSCP, OSCE, CREST CRT, or equivalent) appropriate for the scope of testing undertaken.

---

## 7. Coordination with Unisoft

### 7.1 Pre-Engagement Coordination

(a) TwinMOS shall notify Unisoft Solutions Ltd. of the testing schedule at least **10 Business Days** before the Engagement commences, consistent with MSA Section 9.3.

(b) TwinMOS, with the Vendor's assistance, shall prepare a testing brief for Unisoft including: testing dates, environments to be tested, and any access or documentation Unisoft must provide.

(c) Unisoft shall provide to TwinMOS (for onward sharing with the Vendor) the following prior to testing:
- Staging environment URL and access credentials (test accounts only)
- Strapi API documentation and schema (non-production)
- Architecture diagram of the twinmos.com deployment
- List of third-party dependencies and versions
- Current WAF rule configuration (summary)

### 7.2 Unisoft's Role During Testing

(a) Unisoft is not a party to this Agreement and has no direct obligations to the Vendor. Unisoft's obligations to support penetration testing are governed by MSA Section 9.3.

(b) The Vendor shall not contact Unisoft directly unless explicitly authorized by TwinMOS in writing. All coordination with Unisoft shall be through TwinMOS's designated Project Manager.

(c) Unisoft shall not interfere with Authorized Testing. If Unisoft's automated security tools (e.g., fail2ban, WAF rules) trigger during Authorized Testing, TwinMOS and Unisoft shall whitelist the Vendor's testing IP addresses in advance (to be provided by the Vendor at least 48 hours before testing).

### 7.3 Remediation by Unisoft

(a) Upon receipt of Findings from the Vendor, TwinMOS shall share the relevant findings with Unisoft for remediation, consistent with MSA Section 9.3 timelines:

| Severity (CVSS) | Remediation Deadline (per MSA §9.3) |
|----------------|-------------------------------------|
| Critical (CVSS 9.0–10.0) | 14 calendar days from finding delivery |
| High (CVSS 7.0–8.9) | 14 calendar days from finding delivery |
| Medium (CVSS 4.0–6.9) | 30 calendar days from finding delivery |
| Low (CVSS 0.1–3.9) | Next planned release cycle (best effort) |
| Informational | At TwinMOS's discretion |

(b) The Vendor shall be available for up to **2 rounds of re-testing** per finding (within 30 days of initial Report delivery) at no additional charge, to confirm that remediations are effective.

---

## 8. Communication and Escalation

### 8.1 Primary Designated Contacts

| Role | TwinMOS | Vendor |
|------|---------|--------|
| **Primary Project Contact** | [TwinMOS Project Manager — to be named] | [Vendor Project Lead — to be named] |

Contact details (direct mobile numbers, email addresses) for all roles shall be exchanged and confirmed in writing at the project kick-off meeting.

### 8.2 Status Communication

(a) **Daily status update** (email) from Vendor to TwinMOS Project Manager during active testing phases, covering:
- Testing activities conducted in the past 24 hours
- Significant findings identified (summary only; not full details until Report)
- Any scope clarification requests or issues encountered
- Planned activities for the next 24 hours

(b) **Critical finding notification:** Any finding of CVSS 7.0 or above shall be communicated to TwinMOS's Project Manager **within 2 hours** of discovery, not held for the final Report. The notification shall include:
- Nature of the vulnerability
- Affected system/component
- Preliminary CVSS assessment
- Recommended immediate interim mitigation (if applicable)

(c) **Weekly summary meeting** during multi-week engagements, to review progress, discuss findings to date, and address any scope or RoE questions.

### 8.3 Escalation Path

| Trigger | Escalation Action |
|---------|-------------------|
| Scope ambiguity requiring immediate clarification | Vendor contacts TwinMOS Project Manager immediately by phone |
| Discovery of active third-party compromise (Section 9.3) | Vendor suspends testing and contacts Emergency Stop Authority immediately |
| System instability caused by testing | Vendor invokes Emergency Stop (Section 9); contacts Emergency Stop Authority by phone |
| P1 finding (unauthenticated critical access) | Vendor notifies TwinMOS Emergency Contact within 1 hour |
| Disagreement on scope interpretation | Written escalation to Technical Escalation contacts; resolution within 2 Business Days |

---

## 9. Emergency Stop Procedures

### 9.1 Emergency Stop Authority

The following TwinMOS personnel are authorized to invoke an Emergency Stop of all testing at any time, without any justification required:

**Primary Emergency Stop Authority:**  
Mobile: [To be completed at project kick-off]  
WhatsApp: [To be completed at project kick-off]

**Secondary Emergency Stop Authority (if primary is unreachable):**  
**[TwinMOS Project Manager — to be named]**  
Mobile: [To be completed at project kick-off]

### 9.2 Emergency Stop Protocol

Upon receiving an Emergency Stop instruction from an authorized TwinMOS contact:

(a) **All Authorized Testing activities must cease within 15 minutes** of receiving the Emergency Stop instruction, without exception.

(b) The Vendor shall immediately log the time of the Emergency Stop instruction and confirm cessation in writing (email or WhatsApp message) to the TwinMOS contact who issued the instruction.

(c) No testing shall resume until TwinMOS provides explicit written authorization to resume, after joint assessment of the cause.

(d) The Vendor shall preserve all logs, evidence, and documentation from the testing session, which may be relevant to the cause of the Emergency Stop.

### 9.3 Emergency Stop Triggers

Emergency Stop may be invoked by TwinMOS for any reason, including but not limited to:

(a) Unexpected system instability, outage, or performance degradation that may be related to testing activity  
(b) Discovery of an active third-party breach or compromise of TwinMOS systems unrelated to the authorized testing  
(c) A production incident requiring full IT and development team attention  
(d) Executive decision to pause testing for any reason  
(e) Evidence that testing activity is affecting real end users or third-party systems  
(f) A security incident elsewhere in TwinMOS's infrastructure requiring containment

### 9.4 Vendor-Initiated Pause

If the Vendor discovers:

(a) Evidence that a system is in an unstable state and continued testing poses risk of data loss or extended outage; or  
(b) Evidence of an **active third-party compromise** or unauthorized access to TwinMOS systems not related to the Vendor's own testing;

The Vendor shall **immediately suspend all testing** and notify TwinMOS's Emergency Stop Authority by phone. The Vendor shall document all evidence of the active compromise found and share it confidentially with TwinMOS's authorized contacts only.

### 9.5 Post-Emergency Stop Review

(a) Within **24 hours** of an Emergency Stop, TwinMOS and the Vendor shall hold a debrief call to assess the cause.

(b) A decision to resume, modify scope, or terminate the Engagement shall be made jointly within 48 hours of the debrief.

(c) If the Emergency Stop was caused by Vendor activity outside the Rules of Engagement, TwinMOS reserves all rights under Section 15 and the Agreement.

---

## 10. Deliverables and Report Format

### 10.1 Deliverables

The Vendor shall deliver the following for each Engagement:

| Deliverable | Format | Delivery Deadline |
|-------------|--------|-------------------|
| **Preliminary Findings Brief** | PDF or encrypted email | Within 48 hours of completing exploitation phase |
| **Full Penetration Test Report** | PDF (encrypted) + .docx (for annotation) | Within 10 Business Days of completing all testing phases |
| **Executive Summary** (standalone) | PDF | Delivered with Full Report |
| **Re-Test Confirmation Reports** | PDF | Within 5 Business Days of each re-test |
| **Raw Tool Output** (optional, upon request) | Bundled .zip (password-protected) | With Full Report, upon request |

### 10.2 Report Structure

Each Full Penetration Test Report shall contain the following sections:

#### 10.2.1 Executive Summary

- Overall risk posture assessment (Critical / High / Medium / Low / Minimal)
- Total findings by severity (summary table)
- Top 3–5 priority findings with business impact summary
- Remediation investment estimate (effort categorization: Low/Medium/High)

#### 10.2.2 Scope and Methodology

- Engagement objectives and scope (referencing Section 3)
- Testing methodology used (gray-box / black-box, tools, frameworks)
- Testing dates and environments covered
- Personnel conducting the test (consistent with Exhibit B)
- Limitations encountered (any systems that couldn't be fully tested)

#### 10.2.3 Findings Summary

A risk matrix table presenting all Findings:

| Finding ID | Title | Affected Asset | CVSS Score | Severity | Status |
|------------|-------|----------------|------------|----------|--------|
| TWMP-001 | [Finding Name] | [Asset] | [Score] | Critical/High/Medium/Low | Open |

#### 10.2.4 Detailed Technical Findings

For each Finding, a structured entry containing:

| Field | Content |
|-------|---------|
| **Finding ID** | Unique identifier (e.g., TWMP-001) |
| **Title** | Concise vulnerability title |
| **Severity** | Critical / High / Medium / Low / Informational |
| **CVSS v3.1 Score** | Numerical score and vector string |
| **Affected Asset(s)** | Specific URL, endpoint, component, or system |
| **Description** | Technical explanation of the vulnerability |
| **Evidence** | Screenshots, HTTP request/response pairs, proof-of-concept code |
| **Reproduction Steps** | Step-by-step instructions to reproduce the finding |
| **Business Impact** | Potential consequence if exploited (data exposure, site defacement, unauthorized access, etc.) |
| **Remediation Recommendation** | Specific, actionable fix with references (OWASP, CVE, CWE) |
| **Remediation Effort** | Low / Medium / High |
| **References** | CVE, CWE, OWASP link, vendor advisory (where applicable) |

#### 10.2.5 Risk Matrix and Prioritization

Visual risk matrix mapping findings by likelihood and impact, with recommended remediation priority order.

#### 10.2.6 Positive Security Observations

Acknowledgment of security controls found to be well-implemented (e.g., effective CSP headers, strong TLS configuration, correctly implemented rate limiting). Encourages security team and recognizes positive work.

#### 10.2.7 Appendices

- Full tool output (Nmap, Nikto, Burp Suite scan results) — on request
- Testing log (timestamps, activities, IP addresses used)
- Retest results (once remediation re-tests are conducted)
- Tester qualifications and certifications (consistent with Exhibit B)

### 10.3 Report Delivery and Security

(a) The Report shall be delivered as a **password-protected PDF**, with the password communicated via a separate channel (e.g., phone or encrypted message, not the same email).

(b) The Report shall be delivered only to the authorized TwinMOS contacts listed in Section 8.1.

(c) The Vendor shall retain a copy of the Report for **24 months** after delivery, after which it shall be securely deleted and the Vendor shall certify deletion in writing.

### 10.4 Debrief Meeting

Within **5 Business Days** of Report delivery, the Vendor shall conduct a live debrief meeting with TwinMOS (and Unisoft, if TwinMOS elects) to walk through findings, answer questions, and discuss remediation priorities. The meeting shall be recorded (with all Parties' consent) for TwinMOS's internal reference.

---

## 11. Remediation Process

### 11.1 Remediation Responsibility

(a) Remediation of Findings is the responsibility of TwinMOS and its development vendor, Unisoft, and is not the responsibility of the Vendor.

(b) The Vendor shall provide remediation guidance within each Finding (Section 10.2.4) and shall be available for up to **4 hours** of remediation consultation at no additional charge per Engagement.

### 11.2 Re-Testing

(a) The Vendor shall conduct up to **two rounds of re-testing** per Engagement at no additional charge, to confirm that critical and high-severity Findings have been effectively remediated.

(b) Re-testing shall be conducted within the agreed Testing Windows and in accordance with the Rules of Engagement.

(c) Additional re-testing beyond two rounds may be commissioned at the Vendor's then-current day rate, subject to mutual agreement.

### 11.3 Re-Test Scope

Re-testing shall be limited to the specific Findings identified in the original Report that have been submitted for re-test. Re-testing does not include discovery of new vulnerabilities unless a new Engagement is commissioned.

---

## 12. Confidentiality of Findings

### 12.1 Mutual Confidentiality

All information exchanged during the Engagement — including TwinMOS's infrastructure details, credentials, architecture documents, and the Findings and Report — shall be treated as strictly confidential by both Parties.

### 12.2 Report Confidentiality

(a) The Report and all preliminary findings are **strictly confidential** and must not be shared outside of TwinMOS's authorized personnel (named in Section 8.1, plus those designated by TwinMOS in writing).

(b) TwinMOS controls all distribution of the Report. The Vendor must not share the Report with any third party (including Unisoft) without TwinMOS's explicit written consent.

(c) The Vendor must not reference TwinMOS, the Engagement, or any Findings in marketing materials, case studies, conference presentations, or public communications without TwinMOS's prior written consent.

### 12.3 Vendor Confidentiality Obligations

(a) The Vendor and all testing personnel must treat all TwinMOS information encountered during the Engagement — including system architecture, source code, API structures, content, and business information — as Confidential Information.

(b) All testing personnel must sign individual confidentiality agreements before commencing work, copies of which shall be provided to TwinMOS on request.

(c) Confidentiality obligations survive the termination of this Agreement for a period of **five (5) years**.

### 12.4 Exceptions to Confidentiality

The obligations in Section 12 shall not apply to information that:

(a) Was already publicly known at the time of disclosure through no breach of this Agreement  
(b) Is required to be disclosed by applicable law, court order, or government authority — provided TwinMOS receives prompt written notice and the Vendor discloses only the minimum required

---

## 13. Data Handling During Testing

### 13.1 Prohibition on Production Data Retention

(a) The Vendor shall not retain, copy, download, or exfiltrate any production data accessed during testing, beyond what is strictly necessary to demonstrate proof-of-concept (e.g., a single screenshot showing access to a record).

(b) Any Personal Data (as defined under GDPR, UAE PDPL) encountered during testing must be immediately flagged to TwinMOS's contact and must not be retained, used, or included in the Report in identifiable form. Anonymized or masked examples may be used in the Report.

(c) Any data accessed during testing is subject to the same confidentiality obligations as other Confidential Information under Section 12.

### 13.2 Credential and Access Token Handling

(a) All credentials, API keys, session tokens, and access credentials provided by TwinMOS for testing purposes must be:
- Stored only on the designated, isolated testing device (not in personal accounts or general-purpose credential managers)
- Revoked by TwinMOS immediately upon Engagement conclusion
- Confirmed destroyed by the Vendor in writing within **5 Business Days** of Engagement conclusion

(b) Any credentials discovered during testing (e.g., exposed API keys found in source code or error messages) must be reported to TwinMOS immediately and must not be used to access systems beyond demonstrating the exposure as a proof-of-concept.

### 13.3 Testing Data Retention and Deletion

(a) The Vendor shall retain the Report and associated testing evidence (screenshots, logs, tool output) for **24 months** after Report delivery, for quality assurance and potential legal purposes.

(b) After the 24-month retention period, all testing evidence shall be securely deleted (DoD 5220.22-M or equivalent standard), and the Vendor shall provide TwinMOS with written certification of deletion within **30 days** of the retention period expiry.

(c) Backup copies of testing evidence stored in automated backup systems shall be subject to the same retention and deletion schedule.

---

## 14. Insurance Requirements

### 14.1 Mandatory Coverage

The Vendor must maintain the following insurance coverage throughout the Engagement and for a period of **24 months** after Engagement completion:

| Insurance Type | Minimum Coverage | Notes |
|----------------|-----------------|-------|
| **Professional Liability (Errors and Omissions)** | USD 1,000,000 per occurrence / USD 2,000,000 aggregate | Must cover security consulting and penetration testing services |
| **Cyber Liability Insurance** | USD 1,000,000 per occurrence | Must cover data breach, unauthorized access, and security incident response |
| **General Liability** | USD 1,000,000 per occurrence | Standard commercial general liability |

### 14.2 Evidence of Insurance

(a) The Vendor shall provide TwinMOS with a Certificate of Insurance (COI) for all required coverages **at least 10 Business Days before the Engagement commences**.

(b) TwinMOS shall be named as an additional insured on the Professional Liability and Cyber Liability policies for the duration of the Engagement.

(c) The Vendor shall notify TwinMOS within **10 Business Days** of any material change to its insurance coverage, including cancellation, material reduction, or non-renewal.

---

## 15. Limitation of Liability and Indemnification

### 15.1 Vendor Indemnification of TwinMOS

The Vendor shall indemnify, defend, and hold harmless TwinMOS from and against any third-party claims, losses, damages, liabilities, costs, and expenses (including reasonable legal fees) arising from:

(a) **Out-of-Scope Testing:** The Vendor's testing of systems, assets, or data outside the In-Scope Assets (Section 3.1) without prior TwinMOS authorization

(b) **Rules of Engagement Violation:** The Vendor's use of a technique prohibited under Section 4.3

(c) **Unauthorized Data Access:** The Vendor's access to, copying, or retention of data beyond what is authorized as proof-of-concept under Section 13.1

(d) **Confidentiality Breach:** The Vendor's unauthorized disclosure of TwinMOS Confidential Information, the Report, or Findings to any third party

(e) **Gross Negligence or Willful Misconduct:** Any damage to TwinMOS's systems, data, or operations arising from the Vendor's gross negligence or willful misconduct during the Engagement

### 15.2 TwinMOS Indemnification of Vendor

TwinMOS shall indemnify, defend, and hold harmless the Vendor from and against third-party claims arising from:

(a) **Third-Party Authorization Failure:** TwinMOS's failure to obtain required third-party authorizations (Cloudflare, Hetzner) before testing commences, resulting in legal action against the Vendor

(b) **Misuse of Findings:** TwinMOS's unauthorized disclosure or misuse of the Report or Findings in a manner that causes harm to a third party

(c) **TwinMOS Material Breach:** TwinMOS's material breach of this Agreement that directly causes loss to the Vendor

### 15.3 Limitation of Vendor Liability

(a) Except for indemnification obligations in Section 15.1 and liability arising from fraud or willful misconduct:

(b) The Vendor's **total aggregate liability** for all claims under or related to this Agreement shall not exceed the **total fees paid by TwinMOS to the Vendor** under the applicable Statement of Work for the Engagement giving rise to the claim.

(c) **Neither Party shall be liable** for indirect, incidental, consequential, special, exemplary, or punitive damages, including lost profits, loss of data, or business interruption, regardless of the theory of liability.

### 15.4 Authorized Testing Shield

TwinMOS acknowledges that Authorized Testing conducted in strict compliance with the In-Scope Assets (Section 3.1), Rules of Engagement (Section 4), and Testing Windows (Section 5) is authorized under this Agreement and does not give rise to liability claims against the Vendor for the discovery of vulnerabilities or controlled exploitation to prove-of-concept, even where such testing temporarily affects service performance.

---

## 16. Subcontractor Authorization

### 16.1 Subcontractor Restrictions

(a) The Vendor may not subcontract any testing activities under this Agreement without TwinMOS's prior written consent.

(b) Any approved subcontractor shall be:
- Listed in the Vendor Personnel Schedule (Exhibit B) before commencing testing
- Bound by confidentiality obligations no less protective than Section 12 of this Agreement
- Bound by the same Rules of Engagement (Section 4)
- Covered by the Vendor's insurance policies (Section 14)

(c) The Vendor remains **fully liable** for all acts and omissions of any approved subcontractor as if they were the Vendor's own acts.

### 16.2 Personnel Changes

Any change to the testing personnel listed in Exhibit B after commencement of the Engagement requires:

(a) Written notice to TwinMOS at least **5 Business Days** in advance  
(b) Written approval from TwinMOS's Project Manager  
(c) Provision of qualifications and certifications for the new personnel  
(d) Execution of a confidentiality agreement by the new personnel (Section 12.3)

---

## 17. Dispute Resolution

### 17.1 Good Faith Negotiation

The Parties shall attempt in good faith to resolve any dispute arising under this Agreement through direct discussion between their designated contacts. If unresolved within **14 days** of written notice, the dispute shall be escalated to executive level.

### 17.2 Mediation

If the dispute remains unresolved after **14 days** of executive-level discussion, either Party may initiate mediation under the rules of the Dubai International Arbitration Centre (DIAC). Mediation shall be conducted in English in Dubai, UAE.

### 17.3 Arbitration

If mediation fails to resolve the dispute within **60 days** of initiation, either Party may refer the dispute to binding arbitration under DIAC Arbitration Rules. Arbitration shall be conducted in English, in Dubai, UAE, by a single arbitrator appointed in accordance with DIAC rules. The arbitrator's decision shall be final and binding.

### 17.4 Governing Law

This Agreement shall be governed by and construed in accordance with the laws of the United Arab Emirates. Where applicable and by agreement of the Parties, the laws and procedures of the Dubai International Financial Centre (DIFC) courts shall apply to matters of interpretation and enforcement.

### 17.5 Injunctive Relief

Notwithstanding the above, either Party may seek injunctive or other equitable relief from a court of competent jurisdiction to prevent irreparable harm, including unauthorized disclosure of Confidential Information or breach of Safe Harbor obligations.

---

## 18. General Provisions

### 18.1 Entire Agreement

This Agreement, together with all Exhibits, constitutes the entire agreement between the Parties concerning penetration testing services and supersedes all prior discussions, proposals, and understandings on the subject.

### 18.2 Amendments

No amendment or modification of this Agreement shall be valid unless in writing and signed by authorized representatives of both Parties.

### 18.3 Severability

If any provision is held invalid or unenforceable by a competent court, the remaining provisions shall continue in full force and effect.

### 18.4 Waiver

No waiver of any provision shall be effective unless in writing. Failure to enforce any provision shall not constitute a waiver of the right to enforce it in the future.

### 18.5 Assignment

Neither Party may assign this Agreement without the prior written consent of the other Party, except that TwinMOS may assign to an affiliate or in connection with a merger, acquisition, or sale of substantially all assets.

### 18.6 Notices

All formal notices under this Agreement shall be in writing and delivered by email (with read receipt requested) and confirmed copy by courier or registered mail to:

**TwinMOS Technologies Middle East FZE:**  
Attn: General Manager / Legal  
C-9, Dubai Airport Free Zone (DAFZA), Dubai, UAE  
Email: legal@twinmos.com

**[Penetration Testing Vendor]:**  
Attn: [To be completed]  
[Address to be completed]  
Email: [To be completed]

### 18.7 Independent Contractor

The Vendor is an independent contractor. Nothing in this Agreement shall be construed to create an employment, partnership, joint venture, or agency relationship between the Parties.

### 18.8 Counterparts

This Agreement may be executed in counterparts, each of which shall be deemed an original, and all of which together shall constitute one and the same instrument. Electronic signatures (including DocuSign or equivalent) shall be accepted as valid.

### 18.9 Language

This Agreement is drafted in English. In the event of conflict with any translation, the English version shall prevail.

---

## 19. Signatures

IN WITNESS WHEREOF, the Parties have executed this Penetration Test Vendor Agreement as of the Effective Date first written above.

**TwinMOS Technologies Middle East FZE**

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Witness | | _______________ | _________ |

**[Penetration Testing Vendor — Name to be completed]**

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Authorized Signatory | | _______________ | _________ |
| Witness | | _______________ | _________ |

---

## Exhibits

### Exhibit A — Statement of Work (Engagement-Specific)

*[To be completed for each Engagement, specifying: engagement dates, phases, specific in-scope assets for this engagement, fees, payment terms, and any engagement-specific deviations from the Agreement terms agreed in writing by both Parties.]*

| Field | Details |
|-------|---------|
| **Engagement Name** | TwinMOS Website Security Assessment — [Phase / Year] |
| **Engagement Period** | [Start Date] to [End Date] |
| **Primary Environment** | Staging / Production (as specified per phase) |
| **Total Fee (USD)** | [To be completed] |
| **Payment Terms** | 50% on engagement commencement; 50% on Report delivery |
| **Specific Scope Notes** | [Any additions or restrictions beyond Section 3] |

---

### Exhibit B — Vendor Personnel Schedule

*[To be completed by Vendor before Engagement commencement and updated upon any change.]*

| Name | Role | Certifications | Authorized Activities |
|------|------|---------------|----------------------|
| [Full Name] | Lead Penetration Tester | OSCP, CREST CRT | All in-scope testing |
| [Full Name] | Web Application Tester | CEH, eWPT | Web application and API testing |
| [Full Name] | Report Author | [Relevant certs] | Report writing; no active testing |

---

**Document Control**

| Version | Date | Author | Changes | Approved By |
|---------|------|--------|---------|-------------|
| 0.1 | 1 May 2026 | TwinMOS Legal (Draft) | Initial draft | — |
| 1.0 | [DATE] | — | Final version for execution — vendor details to be completed upon vendor selection | — |

**Next Review:** Upon vendor selection (to complete party details); then annually or per new Engagement Statement of Work
