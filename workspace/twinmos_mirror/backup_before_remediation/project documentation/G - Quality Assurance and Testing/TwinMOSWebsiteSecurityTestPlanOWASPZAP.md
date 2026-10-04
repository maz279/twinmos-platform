# TwinMOS Website - Security Test Plan (OWASP ZAP)

| | |
|:---|:---|
| **Document ID** | TWINMOS-QA-SEC-001 |
| **Version** | 1.0 |
| **Date** | 2026-05-01 |
| **Author** | QA Lead |
| **Status** | Draft |
| **Phase** | P1 - Core Website |

## 1. Purpose and Scope

### 1.1 Purpose
This document defines the security testing strategy, tools, and procedures for the TwinMOS corporate website. It covers automated Dynamic Application Security Testing (DAST) with OWASP ZAP, dependency vulnerability scanning with Snyk, manual penetration testing protocols, and security-focused code review checklists.

### 1.2 Scope
| In Scope | Out of Scope |
|:---|:---|
| OWASP ZAP automated DAST scans | Physical security of servers |
| Snyk dependency vulnerability scanning | Social engineering testing |
| JWT authentication security testing | Insider threat assessment |
| Input validation and injection testing | Network infrastructure penetration |
| CSP and security headers validation | Third-party vendor security audits |
| Strapi API security testing | Employee background checks |
| Cloudflare WAF rule validation | |

### 1.3 References
- I - Security and Compliance
- TwinMOS Website BRD
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- OWASP ZAP Documentation: https://www.zaproxy.org/docs/
- Snyk Documentation: https://docs.snyk.io/

---

## 2. Security Testing Strategy

### 2.1 Defense in Depth

`
Layer 1: Cloudflare WAF + DDoS Protection
    |
Layer 2: TLS 1.3 + Security Headers (CSP, HSTS, etc.)
    |
Layer 3: Application Input Validation + Output Encoding
    |
Layer 4: Authentication (JWT) + Authorization (RBAC)
    |
Layer 5: Strapi Security Middleware + Database ACLs
    |
Layer 6: Infrastructure Hardening (Coolify + Hetzner)
    |
Layer 7: Logging + Monitoring + Incident Response
`

### 2.2 Testing Layers

| Layer | Test Type | Tool | Frequency |
|:---|:---|:---|:---|
| 1 | WAF rule effectiveness | Manual + ZAP | Monthly |
| 2 | Header validation | Mozilla Observatory, ZAP | Every deployment |
| 3 | Injection testing | OWASP ZAP, Manual | Weekly |
| 4 | Auth bypass, session mgmt | OWASP ZAP, Burp Suite | Bi-weekly |
| 5 | API authorization | Bruno + custom scripts | Every deployment |
| 6 | Infrastructure scan | Lynis, OpenSCAP | Monthly |
| 7 | Log review, SIEM alerts | Custom dashboards | Continuous |

---

## 3. OWASP ZAP Configuration

### 3.1 ZAP Automation Framework

The ZAP automation framework configuration defines the scanning context, authentication, spidering, passive and active scanning, and reporting for the TwinMOS staging environment.

Key configuration elements:
- **Context**: TwinMOS-Staging with URL inclusions/exclusions
- **Authentication**: JSON-based login for Strapi JWT tokens
- **Spider**: Traditional + AJAX spider for JavaScript-rendered content
- **Passive Scan**: Configuration and wait for completion
- **Active Scan**: Custom TwinMOS-Policy with tuned rule strengths
- **Report**: Modern HTML report generation
- **Alert Filters**: False positive suppression for known-safe patterns

### 3.2 Custom ZAP Policy

The TwinMOS-Policy configures ZAP rule strengths and thresholds:

**Injection Rules (HIGH strength, MEDIUM threshold):**
- SQL Injection (all variants: Oracle, MySQL, PostgreSQL, SQLite, MsSQL)
- Server Side Code Injection
- Remote OS Command Injection

**XSS Rules (HIGH strength, LOW threshold):**
- Cross Site Scripting (Reflected, Persistent, DOM Based)
- Cross Domain Script Inclusion (MEDIUM strength, HIGH threshold)

**Authentication Rules (MEDIUM strength, MEDIUM threshold):**
- Weak Authentication
- Modern Web Application detection
- Log4Shell

**Session Management (MEDIUM strength, MEDIUM threshold):**
- Cookie No HttpOnly Flag
- Cookie Without Secure Flag
- Cookie Without SameSite Attribute

**Information Disclosure (LOW-MEDIUM strength, MEDIUM-HIGH threshold):**
- Debug Error Messages
- Suspicious Comments
- Timestamp Disclosure

**CSRF (MEDIUM strength, MEDIUM threshold):**
- Absence of Anti-CSRF Tokens

**Security Headers (MEDIUM strength, MEDIUM threshold):**
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security
- Content Security Policy
- Permissions Policy

**SSRF (HIGH strength, MEDIUM threshold):**
- Server Side Request Forgery
