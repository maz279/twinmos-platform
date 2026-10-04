# Penetration Testing Plan

| Document Attribute | Value |
|---|---|
| **Document ID** | TWN-OPS-2026-001 |
| **Version** | 1.0.0 |
| **Status** | Draft |
| **Author** | Unisoft Technologies Security Team |
| **Owner** | CISO / Security Architect |
| **Review Date** | 2026-11-01 |
| **Classification** | Confidential |
| **Related Documents** | TWN-SEC-2026-009 (OWASP Coverage), TWN-COMP-2026-007 (PCI DSS Scope), TWN-OPS-2026-002 (Vulnerability Management) |
| **Compliance Mapping** | PCI DSS 4.0 Req 11.4, ISO/IEC 27001:2022 A.8.15, GDPR Art. 32, OWASP Testing Guide v4.2, NIST SP 800-115 |

---

## 1. Executive Summary

This Penetration Testing Plan defines the scope, methodology, frequency, and governance for security testing of the TwinMOS corporate website. The plan ensures systematic identification of security vulnerabilities through authorized simulated attacks, with clear remediation pathways and validation procedures.

**Testing Philosophy**: Penetration testing complements automated vulnerability scanning by providing human-driven, context-aware security assessment that identifies business logic flaws, chained vulnerabilities, and real-world exploitability.

---

## 2. Testing Scope

### 2.1 In-Scope Assets

| Asset Category | Specific Assets | Environment |
|---|---|---|
| **Web Application** | twinmos.com (Astro frontend) | Production, Staging |
| **API Endpoints** | Strapi REST API, GraphQL API | Production, Staging |
| **Admin Interfaces** | Strapi /admin, Partner Portal (Phase 2) | Production, Staging |
| **Authentication Systems** | JWT authentication, OAuth flows, MFA | Production, Staging |
| **E-Commerce Platform** | Checkout flow, payment integration (Phase 3) | Staging |
| **Mobile Applications** | iOS/Android apps (Phase 3) | Production |
| **Infrastructure** | Hetzner servers, Cloudflare configuration | Production |
| **Third-Party Integrations** | Payment providers, search, CDN | Production |

### 2.2 Out-of-Scope Assets

| Asset | Reason |
|---|---|
| TwinMOS corporate network (internal) | Separate scope, internal pentest |
| Partner/distributor systems | External to TwinMOS control |
| Physical security | Separate physical security assessment |
| Social engineering (without specific approval) | Requires separate authorization |
| Denial of Service testing | Prohibited without explicit written approval |
| Production data exfiltration | Testing must not access real customer data |

### 2.3 Testing Environments

| Environment | Purpose | Data Sensitivity | Testing Type |
|---|---|---|---|
| **Production** | Live website | High | Limited, read-only, non-disruptive |
| **Staging** | Pre-release testing | Synthetic data | Full testing allowed |
| **Development** | Feature development | Mock data | Developer security testing |
| **Isolated Test** | Dedicated pentest environment | Synthetic data | Full exploitation allowed |

---

## 3. Testing Types and Frequency

### 3.1 Testing Calendar

| Test Type | Frequency | Scope | Environment | Provider | Duration |
|---|---|---|---|---|---|
| **Web Application Pen Test** | Annual | Full web app + API | Staging + Production | External vendor | 2-3 weeks |
| **API Security Assessment** | Annual | All API endpoints | Staging + Production | External vendor | 1-2 weeks |
| **Mobile App Pen Test** | Phase 3 launch + annual | iOS and Android | Staging | External vendor | 2 weeks |
| **Infrastructure Pen Test** | Annual | Servers, network, Cloudflare | Production | External vendor | 1-2 weeks |
| **Red Team Exercise** | Bi-annual | Full infrastructure + social engineering | Production | External specialist | 2-4 weeks |
| **Bug Bounty** | Continuous | Production environment | Production | HackerOne/Bugcrowd | Ongoing |
| **Targeted Retest** | Post-remediation | Specific findings | Staging | External vendor | 3-5 days |
| **PCI DSS Pen Test** | Annual | Cardholder data environment | Staging | PCI-approved vendor | 1-2 weeks |

### 3.2 Testing Triggers (Ad-hoc)

| Trigger | Test Type | Timeline |
|---|---|---|
| Major release (new features) | Web app focused | Before launch |
| Security architecture change | Full scope | Before deployment |
| New third-party integration | Integration-focused | Before launch |
| Significant vulnerability disclosed | Targeted | Within 2 weeks |
| Post-incident validation | Full scope | After incident closure |
| Compliance requirement | Per standard | Per calendar |
| Management request | As specified | As requested |

---

## 4. Testing Methodology

### 4.1 OWASP Testing Guide Alignment

| Phase | OWASP Phase | Activities | Duration |
|---|---|---|---|
| **Pre-engagement** | Phase 1 | Scoping, rules of engagement, legal agreements | 1 week |
| **Intelligence Gathering** | Phase 2 | Reconnaissance, footprinting, technology identification | 2-3 days |
| **Threat Modeling** | Phase 3 | STRIDE analysis, attack surface mapping | 2-3 days |
| **Vulnerability Analysis** | Phase 4 | Automated scanning, manual testing, configuration review | 3-5 days |
| **Exploitation** | Phase 5 | Proof-of-concept exploitation, privilege escalation | 3-5 days |
| **Post-Exploitation** | Phase 6 | Lateral movement, data access simulation, persistence | 2-3 days |
| **Reporting** | Phase 7 | Findings documentation, risk scoring, recommendations | 3-5 days |

### 4.2 Testing Techniques

| Technique | Description | Tools | Findings |
|---|---|---|---|
| **Black Box** | No prior knowledge of system | Burp Suite, OWASP ZAP, Nmap | External attack surface |
| **Grey Box** | Limited credentials and documentation | Burp Suite, custom scripts | Authenticated vulnerabilities |
| **White Box** | Full source code and architecture access | Semgrep, SonarQube, code review | Logic flaws, insecure code |
| **Authenticated Testing** | Testing with valid user accounts | Burp Suite, Postman, custom tools | Authorization flaws |
| **Unauthenticated Testing** | Testing without credentials | Nmap, Nikto, Gobuster | Exposure, misconfiguration |
| **API Testing** | REST/GraphQL specific testing | Postman, GraphQL introspection, custom scripts | API vulnerabilities |
| **Business Logic Testing** | Workflow and logic manipulation | Manual testing, custom scripts | Logic flaws |

### 4.3 Specific Test Scenarios

#### Authentication and Session Management

| Test ID | Scenario | Expected Control |
|---|---|---|
| AUTH-01 | Brute force login attempts | Account lockout after 5 attempts |
| AUTH-02 | Credential stuffing with known passwords | Rate limiting, Turnstile CAPTCHA |
| AUTH-03 | Session fixation attack | Session ID rotation after login |
| AUTH-04 | JWT token manipulation (alg:none, key confusion) | RS256 validation, strict header checking |
| AUTH-05 | Password reset token prediction/guessing | Cryptographically random tokens, expiry |
| AUTH-06 | MFA bypass attempts | TOTP validation, no bypass mechanisms |
| AUTH-07 | OAuth flow manipulation (state parameter, redirect) | State validation, redirect URI whitelist |

#### Authorization and Access Control

| Test ID | Scenario | Expected Control |
|---|---|---|
| AUTHZ-01 | Horizontal privilege escalation (IDOR) | Server-side authorization checks |
| AUTHZ-02 | Vertical privilege escalation | Role validation on every request |
| AUTHZ-03 | Admin interface access without authentication | IP allowlist + VPN + authentication |
| AUTHZ-04 | API endpoint access without proper scope | JWT scope validation |
| AUTHZ-05 | File download access control bypass | Authorization check before file serve |
| AUTHZ-06 | CORS misconfiguration exploitation | Strict origin whitelist |

#### Input Validation and Injection

| Test ID | Scenario | Expected Control |
|---|---|---|
| INJ-01 | SQL injection in search and filters | Parameterized queries |
| INJ-02 | NoSQL injection in MeiliSearch queries | Input sanitization |
| INJ-03 | GraphQL injection and introspection abuse | Depth limiting, complexity scoring |
| INJ-04 | XSS (stored, reflected, DOM) | Output encoding, CSP |
| INJ-05 | Command injection in file processing | No shell execution |
| INJ-06 | SSRF via webhook and image fetching | URL allowlist, DNS validation |
| INJ-07 | XML/XXE injection | XML parser hardening |
| INJ-08 | Template injection in Astro | Compile-time templates only |

#### Cryptography

| Test ID | Scenario | Expected Control |
|---|---|---|
| CRPT-01 | TLS downgrade attack | TLS 1.3 minimum, HSTS |
| CRPT-02 | Weak cipher negotiation | Strong cipher suite only |
| CRPT-03 | Cookie security (HttpOnly, Secure, SameSite) | All flags set correctly |
| CRPT-04 | JWT signature bypass | Proper RS256 validation |
| CRPT-05 | Sensitive data in URL parameters | POST body only |
| CRPT-06 | Encryption key exposure | Key management plan adherence |

#### Business Logic

| Test ID | Scenario | Expected Control |
|---|---|---|
| LOGIC-01 | Price manipulation in cart | Server-side price validation |
| LOGIC-02 | Negative quantity or amount | Input validation |
| LOGIC-03 | Race condition in checkout | Atomic operations, inventory locking |
| LOGIC-04 | Workflow bypass (skip payment) | State machine validation |
| LOGIC-05 | Coupon/discount abuse | Single-use, expiry, validation |
| LOGIC-06 | Duplicate order submission | Idempotency keys |

---

## 5. Rules of Engagement

### 5.1 Authorized Testing Windows

| Environment | Testing Window | Approval Required |
|---|---|---|
| Production | Business hours only (09:00-17:00 UTC) | CISO + CTO |
| Staging | Any time | Security Architect |
| Isolated Test | Any time | Security Architect |

### 5.2 Prohibited Activities

| Activity | Status | Exception Process |
|---|---|---|
| Denial of Service attacks | Prohibited | Written CISO approval required |
| Social engineering (phishing) | Prohibited | Separate engagement scope |
| Physical security testing | Prohibited | Separate engagement scope |
| Data exfiltration (real data) | Prohibited | Synthetic data environment only |
| Malware deployment | Prohibited | No exceptions |
| Permanent system changes | Prohibited | No exceptions |
| Testing outside scope | Prohibited | Scope change request |
| Extortion or threat simulation | Prohibited | No exceptions |

### 5.3 Communication Protocol

| Channel | Purpose | Response Time |
|---|---|---|
| **Primary contact** | Daily updates, questions | 4 hours |
| **Emergency contact** | Critical finding, system impact | 1 hour |
| **Escalation path** | Scope issues, blockers | 4 hours |
| **Daily standup** | Progress, blockers, findings | Daily 09:00 UTC |
| **Weekly report** | Summary, risk overview | Weekly Friday |

### 5.4 Incident During Testing

| Scenario | Action | Notification |
|---|---|---|
| System becomes unavailable | Stop testing immediately | Security team + DevOps |
| Data corruption detected | Stop testing, preserve evidence | CISO + Legal |
| Critical vulnerability found | Immediate notification | CISO + Product Owner |
| Testing triggers alert | Coordinate with SOC | Security team |
| Scope ambiguity discovered | Pause, seek clarification | Security Architect |

---

## 6. Vendor Management

### 6.1 Vendor Selection Criteria

| Criterion | Weight | Evaluation |
|---|---|---|
| **Certifications** | 20% | OSCP, GWAPT, GXPN, CEH, CISSP |
| **Experience** | 20% | E-commerce, CMS, similar tech stack |
| **Methodology** | 15% | OWASP-aligned, comprehensive reporting |
| **References** | 15% | Client testimonials, case studies |
| **Reporting quality** | 15% | Sample report review |
| **Cost** | 10% | Value for money |
| **Timeline** | 5% | Availability, turnaround |

### 6.2 Vendor Engagement Process

| Step | Activity | Owner | Timeline |
|---|---|---|---|
| 1 | Requirement definition | Security Architect | 1 week |
| 2 | RFP issuance | Procurement | 2 weeks |
| 3 | Vendor evaluation | Security team | 2 weeks |
| 4 | Selection and negotiation | Procurement + CISO | 1 week |
| 5 | Contract and NDA | Legal | 1 week |
| 6 | Rules of engagement | Security Architect | 3 days |
| 7 | Testing execution | Vendor | Per plan |
| 8 | Report delivery and review | Security team | 1 week |
| 9 | Remediation planning | Development team | 1 week |
| 10 | Retest and closure | Vendor | 1 week |

### 6.3 Sample Vendor List

| Vendor | Specialization | Location | Certifications |
|---|---|---|---|
| [To be selected - Big 4] | Comprehensive enterprise | Global | Multiple |
| [To be selected - Boutique] | Web application specialist | EU | OSCP, GWAPT |
| [To be selected - Mobile] | Mobile application security | Global | GMOB, OSCP |
| [To be selected - Red Team] | Advanced adversary simulation | Global | OSEP, OSCE |

---

## 7. Findings and Remediation

### 7.1 Risk Rating Matrix

| Likelihood / Impact | Low (1) | Medium (2) | High (3) | Critical (4) |
|---|---|---|---|---|
| **Critical (4)** | Medium (4) | High (8) | Critical (12) | Critical (16) |
| **High (3)** | Medium (3) | High (6) | High (9) | Critical (12) |
| **Medium (2)** | Low (2) | Medium (4) | High (6) | High (8) |
| **Low (1)** | Low (1) | Low (2) | Medium (3) | Medium (4) |

### 7.2 Severity Definitions

| Severity | CVSS Range | Description | Example |
|---|---|---|---|
| **Critical** | 9.0-10.0 | Immediate exploitation possible; full system compromise | Remote code execution, SQL injection |
| **High** | 7.0-8.9 | Significant impact; likely exploitation | Authentication bypass, sensitive data exposure |
| **Medium** | 4.0-6.9 | Moderate impact; conditional exploitation | XSS, CSRF, information disclosure |
| **Low** | 0.1-3.9 | Minor impact; difficult exploitation | Missing security headers, verbose error messages |
| **Informational** | 0.0 | No direct security impact | Best practice recommendations |

### 7.3 Remediation SLAs

| Severity | Triage | Fix | Deploy | Verify |
|---|---|---|---|---|
| Critical | 1 hour | 24 hours | 48 hours | 72 hours |
| High | 4 hours | 72 hours | 1 week | 2 weeks |
| Medium | 24 hours | 2 weeks | 1 month | 6 weeks |
| Low | 1 week | 1 month | 3 months | 4 months |

### 7.4 Retest Requirements

| Finding Severity | Retest Required | Retest Scope |
|---|---|---|
| Critical | Mandatory | Full validation of fix + regression testing |
| High | Mandatory | Validation of fix + adjacent area testing |
| Medium | Recommended | Validation of fix |
| Low | Optional | Spot check |

---

## 8. Reporting

### 8.1 Report Types

| Report | Audience | Content | Timing |
|---|---|---|---|
| **Executive Summary** | C-Suite, Board | High-level findings, risk overview, business impact | Within 48 hours of test completion |
| **Technical Report** | Security team, Development | Detailed findings, reproduction steps, evidence | Within 1 week of test completion |
| **Remediation Plan** | Development, Project Management | Prioritized fix list, effort estimates, owners | Within 1 week of technical report |
| **Retest Report** | Security team, CISO | Validation of fixes, residual risk | Within 48 hours of retest |
| **Compliance Report** | Auditors, Regulators | Control testing, compliance mapping | Per audit requirement |

### 8.2 Report Contents

| Section | Description |
|---|---|
| **Scope and Methodology** | What was tested, how, and with what limitations |
| **Executive Summary** | Key findings, risk rating, high-level recommendations |
| **Findings Detail** | Each finding: description, evidence, risk, remediation |
| **Attack Narratives** | Story of successful attack paths |
| **Positive Findings** | Controls that withstood testing |
| **Risk Summary** | Charts, heat maps, trend analysis |
| **Remediation Roadmap** | Prioritized action plan with timelines |
| **Appendices** | Tools used, test accounts, raw evidence |

---

## 9. Governance

### 9.1 Roles and Responsibilities

| Role | Responsibility |
|---|---|
| **CISO** | Overall program, vendor selection, critical finding response |
| **Security Architect** | Scope definition, methodology, rules of engagement |
| **Security Engineer** | Coordination, environment preparation, tool support |
| **Development Lead** | Remediation planning, resource allocation |
| **DevOps Lead** | Environment access, monitoring, incident response |
| **Product Owner** | Risk acceptance decisions, prioritization |
| **Legal Counsel** | Contracts, liability, disclosure decisions |

### 9.2 Metrics

| Metric | Target | Frequency |
|---|---|---|
| Tests completed on schedule | 100% | Per test |
| Critical findings per test | < 2 | Per test |
| High findings per test | < 5 | Per test |
| Remediation SLA compliance | > 95% | Monthly |
| Retest pass rate | 100% | Per retest |
| Time to fix critical | < 48 hours | Per finding |
| Testing coverage | 100% of in-scope assets | Annual |

---

## 10. Document Change Log

| Version | Date | Author | Change Description |
|---|---|---|---|
| 1.0.0 | 2026-05-01 | Security Team | Initial penetration testing plan |
