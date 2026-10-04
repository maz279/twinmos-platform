# OWASP Top 10 Coverage Matrix

| Document Attribute | Value |
|---|---|
| **Document ID** | TWN-SEC-2026-009 |
| **Version** | 1.0.0 |
| **Status** | Draft |
| **Author** | Unisoft Technologies Security Team |
| **Owner** | CISO / Security Architect |
| **Review Date** | 2026-08-01 |
| **Classification** | Internal Use |
| **Related Documents** | TWN-SEC-2026-001 (Security Architecture), TWN-SEC-2026-003 (Controls Catalog), TWN-SEC-2026-004 (Auth Spec), TWN-SEC-2026-005 (CSP Spec), TWN-SEC-2026-006 (HTTP Headers), TWN-SEC-2026-007 (Encryption), TWN-SEC-2026-008 (Key Management) |
| **Compliance Mapping** | OWASP Top 10:2021, OWASP ASVS 4.0.3, ISO/IEC 27001:2022 A.8.1, A.8.5, A.8.8, A.8.9, A.8.10, A.8.11, A.8.15, A.8.24, A.8.25, A.8.26 |

---

## 1. Executive Summary

This document maps each of the OWASP Top 10:2021 categories to the specific security controls, architectural decisions, and verification methods implemented for the TwinMOS corporate website. It serves as the primary evidence artifact for OWASP compliance, penetration test scoping, and security audit preparation.

**Coverage Philosophy**: Every OWASP Top 10 risk category is addressed through a defense-in-depth strategy combining preventive controls (architecture), detective controls (monitoring), and corrective controls (incident response). No category is addressed by a single control alone.

---

## 2. OWASP Top 10:2021 Coverage Overview

| Rank | OWASP Category | Risk Severity | Coverage Status | Primary Control Document |
|---|---|---|---|---|
| A01 | Broken Access Control | Critical | Full | TWN-SEC-2026-004 |
| A02 | Cryptographic Failures | Critical | Full | TWN-SEC-2026-007 |
| A03 | Injection | Critical | Full | TWN-SEC-2026-003, TWN-SEC-2026-007 |
| A04 | Insecure Design | High | Full | TWN-SEC-2026-001, TWN-SEC-2026-006 |
| A05 | Security Misconfiguration | High | Full | TWN-SEC-2026-003, TWN-SEC-2026-006 |
| A06 | Vulnerable and Outdated Components | High | Full | TWN-SEC-2026-003, TWN-SEC-2026-TBD (Dependency Scanning) |
| A07 | Identification and Authentication Failures | Critical | Full | TWN-SEC-2026-004 |
| A08 | Software and Data Integrity Failures | High | Full | TWN-SEC-2026-003, TWN-SEC-2026-008 |
| A09 | Security Logging and Monitoring Failures | High | Full | TWN-SEC-2026-001, TWN-SEC-2026-TBD (Incident Response) |
| A10 | Server-Side Request Forgery (SSRF) | Medium | Full | TWN-SEC-2026-003, TWN-SEC-2026-006 |

---

## 3. Detailed Coverage by Category

### A01:2021 - Broken Access Control

**Description**: Access control enforces policy such that users cannot act outside of their intended permissions. Failures typically lead to unauthorized information disclosure, modification, or destruction of all data or performing a business function outside the user's limits.

**TwinMOS Attack Surface**:
- CMS admin panel (Strapi) with role-based content management
- Partner Portal with distributor-specific data access
- E-commerce order history and warranty claims
- Product owner admin for SKU management
- API endpoints exposing internal data

| Control ID | Control Name | Implementation | Verification Method | Maturity |
|---|---|---|---|---|
| AC-001 | Deny by Default | All API endpoints and UI routes default to deny unless explicitly permitted | Penetration test, code review | L3 |
| AC-002 | RBAC Enforcement | Role-based access control with 13 distinct roles across 3 identity domains | Automated RBAC testing, audit logs | L3 |
| AC-003 | URL Parameter Tampering Protection | Server-side authorization checks on every request; no client-side trust | SAST, DAST, manual testing | L3 |
| AC-004 | CORS Strict Policy | CORS whitelist with explicit origin validation; no wildcard in production | Configuration audit, HTTP header scan | L3 |
| AC-005 | Directory Traversal Prevention | Path normalization, chroot-like restrictions on file uploads | Penetration test, SAST | L3 |
| AC-006 | JWT Scope Validation | JWT claims include `scope` and `permissions`; validated on every API call | Unit tests, integration tests | L3 |
| AC-007 | Admin Interface Segmentation | Strapi admin at `/admin` behind IP allowlist + VPN in production | Network scan, configuration audit | L3 |
| AC-008 | API Rate Limiting by Role | Tiered rate limits: Anonymous (30/min), Authenticated (120/min), Admin (300/min) | Load testing, WAF log review | L3 |

**ASVS Mappings**: V1.1, V1.4, V4.1, V4.2, V4.3, V13.1

**Penetration Test Scenarios**:
1. Horizontal privilege escalation: Access another user's order history
2. Vertical privilege escalation: Promote anonymous user to admin
3. IDOR: Access partner documents belonging to other distributors
4. Path traversal: Access `/admin` without authentication
5. CORS bypass: Origin spoofing to extract JWT tokens

---

### A02:2021 - Cryptographic Failures

**Description**: Failures related to cryptography (or lack thereof) that often lead to exposure of sensitive data. This includes data at rest, in transit, and in use.

**TwinMOS Attack Surface**:
- Customer PII in PostgreSQL database
- Partner commercial data (pricing, margins)
- Payment card data (Phase 3 e-commerce)
- JWT tokens and session cookies
- Backup archives on Backblaze B2

| Control ID | Control Name | Implementation | Verification Method | Maturity |
|---|---|---|---|---|
| CR-001 | TLS 1.3 Enforcement | Minimum TLS 1.3; HSTS preload; no downgrade allowed | SSL Labs scan, testssl.sh | L3 |
| CR-002 | AES-256-GCM at Rest | Database-level encryption via LUKS; application-level AES-256-GCM for sensitive fields | Encryption audit, key extraction test | L3 |
| CR-003 | bcrypt Password Hashing | Cost factor 12; unique salt per user; pepper for admin accounts | Hash extraction test, timing analysis | L3 |
| CR-004 | JWT RS256 with Key Rotation | Asymmetric signing; 90-day key rotation; JWKS endpoint for validation | Token analysis, key rotation drill | L3 |
| CR-005 | Secure Cookie Flags | `__Host-` prefix, `Secure`, `HttpOnly`, `SameSite=Lax` | Cookie analysis, browser dev tools | L3 |
| CR-006 | GPG Backup Encryption | RSA-4096 GPG key; passphrase-protected; offline key storage | Backup restoration test, key escrow test | L3 |
| CR-007 | Certificate Pinning (Mobile) | Public key pinning for future mobile apps (Phase 3) | SSL pinning test | L2 |
| CR-008 | Forward Secrecy | ECDHE key exchange; ephemeral session keys | SSL Labs scan, packet capture analysis | L3 |

**ASVS Mappings**: V2.1, V2.2, V2.3, V2.4, V2.5, V2.6, V2.7, V2.8, V2.9, V2.10, V6.1, V6.2, V6.3, V6.4

**Penetration Test Scenarios**:
1. Downgrade attack: Force TLS 1.2 or lower
2. Weak cipher negotiation: Attempt NULL or EXPORT ciphers
3. Cookie theft: Extract session cookie without HttpOnly/Secure
4. Hash cracking: Extract and crack password hashes
5. Backup interception: Decrypt intercepted backup without GPG key

---

### A03:2021 - Injection

**Description**: Injection flaws, such as SQL, NoSQL, OS command, and LDAP injection, occur when untrusted data is sent to an interpreter as part of a command or query.

**TwinMOS Attack Surface**:
- Strapi GraphQL and REST APIs
- MeiliSearch query interface
- PostgreSQL database queries
- Server-side rendering in Astro
- File upload processing (image metadata, CSV imports)

| Control ID | Control Name | Implementation | Verification Method | Maturity |
|---|---|---|---|---|
| IN-001 | Parameterized Queries | All database queries via Strapi ORM (Knex.js) with parameterized statements | SAST, code review | L3 |
| IN-002 | Input Validation | Whitelist validation on all inputs; type coercion; length limits | Fuzz testing, SAST | L3 |
| IN-003 | GraphQL Query Depth Limiting | Maximum query depth: 10; complexity scoring; timeout: 5s | GraphQL introspection test | L3 |
| IN-004 | NoSQL Injection Prevention | MeiliSearch queries sanitized; no raw query passthrough | DAST, manual injection test | L3 |
| IN-005 | OS Command Injection Prevention | No shell execution; all file processing via safe libraries (Sharp, PapaParse) | SAST, code review | L3 |
| IN-006 | SSRF Prevention | URL validation with allowlist; no internal IP resolution; DNS rebinding protection | SSRF payload testing | L3 |
| IN-007 | Template Injection Prevention | Astro templates compile-time only; no user input in templates | SAST, template analysis | L3 |
| IN-008 | File Upload Validation | MIME type verification, magic bytes check, size limits, virus scanning (ClamAV) | Malicious file upload test | L3 |

**ASVS Mappings**: V5.1, V5.2, V5.3, V5.4, V5.5, V12.1, V12.3, V12.4, V12.5

**Penetration Test Scenarios**:
1. SQL injection in product search filter
2. GraphQL introspection to extract schema
3. NoSQL injection in MeiliSearch query
4. Command injection in image processing pipeline
5. SSRF via webhook URL configuration

---

### A04:2021 - Insecure Design

**Description**: Insecure design is a broad category representing different weaknesses, expressed as "missing or ineffective control design." It focuses on risks related to design flaws.

**TwinMOS Attack Surface**:
- Business logic flaws in e-commerce (price manipulation, cart abuse)
- Race conditions in inventory management
- Missing authorization in multi-step workflows
- Insecure direct object references in document downloads

| Control ID | Control Name | Implementation | Verification Method | Maturity |
|---|---|---|---|---|
| ID-001 | Threat Modeling | STRIDE threat model for all major features; threat model review gate | Threat model review, architecture review | L3 |
| ID-002 | Secure Design Patterns | Defense in depth, least privilege, separation of duties, fail-safe defaults | Design review, code review | L3 |
| ID-003 | Business Logic Validation | Server-side price validation, inventory checks, order total verification | Business logic testing | L3 |
| ID-004 | Race Condition Prevention | Atomic database operations, optimistic locking, idempotency keys | Concurrency testing | L3 |
| ID-005 | Multi-Step Workflow Integrity | State machine validation; signed state tokens between steps | Workflow manipulation test | L3 |
| ID-006 | Rate Limiting by Business Function | Stricter limits on sensitive operations (checkout, password reset) | Load testing, abuse simulation | L3 |
| ID-007 | Anti-Automation | Turnstile CAPTCHA on registration, login, password reset, checkout | Bot simulation test | L3 |
| ID-008 | Secure Defaults | All features default to most restrictive setting; opt-in for less secure | Configuration audit | L3 |

**ASVS Mappings**: V1.1, V1.2, V1.3, V1.4, V1.5, V1.6, V1.7, V1.8, V1.9, V1.10, V1.11, V1.12, V1.14

**Penetration Test Scenarios**:
1. Price manipulation: Modify cart total via client-side JavaScript
2. Inventory race: Purchase last item simultaneously from two sessions
3. Workflow bypass: Skip payment step and complete order
4. Abuse: Create 10,000 accounts to exhaust email quota
5. Logic flaw: Apply expired or unauthorized discount code

---

### A05:2021 - Security Misconfiguration

**Description**: The application might be vulnerable if it is improperly configured, including default configurations, incomplete configurations, open cloud storage, misconfigured HTTP headers, or verbose error messages.

**TwinMOS Attack Surface**:
- Cloudflare WAF and Page Rules
- Strapi configuration and plugins
- Coolify deployment settings
- Hetzner server hardening
- Backblaze B2 bucket permissions

| Control ID | Control Name | Implementation | Verification Method | Maturity |
|---|---|---|---|---|
| SM-001 | Hardened Base Images | Minimal OS images; no unnecessary services; automated hardening via Ansible | CIS benchmark scan | L3 |
| SM-002 | Default Credentials Elimination | All default passwords changed; no default admin accounts | Credential scan, configuration audit | L3 |
| SM-003 | Unnecessary Features Disabled | Unused Strapi plugins removed; GraphQL disabled if unused; debug mode off | Configuration audit, port scan | L3 |
| SM-004 | Security Headers | Comprehensive HTTP security headers (see TWN-SEC-2026-006) | Security Headers scan, Observatory | L3 |
| SM-005 | Error Handling | Generic error pages in production; no stack traces leaked; structured logging | Error injection test | L3 |
| SM-006 | Cloud Storage Permissions | Backblaze B2 private buckets; signed URLs with expiry; no public access | Cloud configuration audit | L3 |
| SM-007 | WAF Configuration | OWASP CRS rules; custom rules for TwinMOS; anomaly scoring mode | WAF rule test, bypass attempt | L3 |
| SM-008 | Container Security | Non-root containers; read-only filesystems; resource limits; seccomp profiles | Container scan, runtime analysis | L3 |

**ASVS Mappings**: V1.1, V1.2, V1.3, V1.4, V1.5, V1.6, V1.7, V1.8, V1.9, V1.10, V1.11, V1.12, V1.14, V14.1, V14.2, V14.3, V14.4, V14.5

**Penetration Test Scenarios**:
1. Default Strapi credentials: Attempt login with `admin@strapi.io` / default password
2. Debug mode: Access `/graphql` with introspection in production
3. Stack trace: Trigger 500 error and extract file paths
4. Open S3: Access Backblaze bucket without authentication
5. WAF bypass: Craft payload that evades CRS rules

---

### A06:2021 - Vulnerable and Outdated Components

**Description**: Components, such as libraries, frameworks, and other software modules, run with the same privileges as the application. If a vulnerable component is exploited, such an attack can facilitate serious data loss or server takeover.

**TwinMOS Attack Surface**:
- Astro framework and React islands
- Strapi CMS and plugins
- PostgreSQL database
- MeiliSearch engine
- Node.js runtime and npm packages
- Coolify platform

| Control ID | Control Name | Implementation | Verification Method | Maturity |
|---|---|---|---|---|
| VC-001 | Software Bill of Materials (SBOM) | Automated SBOM generation for every build; CycloneDX format | SBOM audit, dependency review | L3 |
| VC-002 | Dependency Scanning | Snyk + npm audit on every PR; fail build on critical/high vulnerabilities | CI/CD pipeline verification | L3 |
| VC-003 | Automated Updates | Dependabot for automated PRs; security patches within 72 hours | Update log review, SLA tracking | L3 |
| VC-004 | Vulnerability Database Integration | OSV, NVD, Snyk vulnerability database monitoring | Vulnerability report review | L3 |
| VC-005 | License Compliance | FOSSA license scanning; approved license whitelist | License audit | L2 |
| VC-006 | Component Retirement Plan | End-of-life tracking; migration plan for deprecated components | Architecture review | L2 |
| VC-007 | Container Image Scanning | Trivy scan on every container build; no critical vulnerabilities in production | Container scan report | L3 |
| VC-008 | Runtime Protection | Node.js security policies; restricted module loading | Runtime analysis | L2 |

**ASVS Mappings**: V14.1, V14.2

**Penetration Test Scenarios**:
1. Known CVE exploitation: Attempt exploitation of known vulnerability in Strapi
2. Supply chain: Inject malicious package via typosquatting
3. EOL component: Identify and exploit EOL dependency
4. Container escape: Exploit vulnerable base image to escape container

---

### A07:2021 - Identification and Authentication Failures

**Description**: Confirmation of the user's identity, authentication, and session management is critical to protect against authentication-related attacks.

**TwinMOS Attack Surface**:
- Strapi JWT authentication
- Partner Portal (Better Auth in Phase 2)
- E-commerce customer accounts
- Admin authentication with MFA
- API key authentication for integrations

| Control ID | Control Name | Implementation | Verification Method | Maturity |
|---|---|---|---|---|
| IA-001 | Multi-Factor Authentication | TOTP MFA enforced for admin, editor, partner roles; WebAuthn optional | MFA bypass test, brute force test | L3 |
| IA-002 | Brute Force Protection | Account lockout after 5 failed attempts; exponential backoff; IP-based rate limiting | Brute force simulation | L3 |
| IA-003 | Secure Session Management | Rotating refresh tokens; 1-hour access token TTL; secure cookie storage | Session hijacking test | L3 |
| IA-004 | Password Policy | Strong password requirements; breach database check (Have I Been Pwned); no common passwords | Password policy test | L3 |
| IA-005 | Secure Password Recovery | Time-limited tokens (15 min); single-use; sent to verified email only | Password reset flow test | L3 |
| IA-006 | Credential Stuffing Protection | Turnstile on login; anomaly detection for impossible travel; device fingerprinting | Credential stuffing simulation | L3 |
| IA-007 | Session Invalidation | Immediate logout invalidates all sessions; password change revokes all tokens | Session revocation test | L3 |
| IA-008 | API Key Security | `twpk_live_` prefix; 48-character random; scoped permissions; rotation on compromise | API key extraction test | L3 |

**ASVS Mappings**: V2.1, V2.2, V2.3, V2.4, V2.5, V2.6, V2.7, V2.8, V2.9, V2.10, V4.3, V9.1, V9.2, V9.3, V9.4

**Penetration Test Scenarios**:
1. Credential stuffing: Attempt 10,000 common password combinations
2. Session fixation: Fixate session ID and verify rotation after login
3. JWT manipulation: Modify algorithm to `none` or swap RS256 to HS256
4. MFA bypass: Attempt SIM swap or TOTP replay
5. Password reset: Intercept reset token or brute force token space

---

### A08:2021 - Software and Data Integrity Failures

**Description**: Software and data integrity failures relate to code and infrastructure that does not protect against integrity violations. This includes insecure deserialization, unsigned updates, and CI/CD pipeline compromises.

**TwinMOS Attack Surface**:
- CI/CD pipeline (GitHub Actions)
- Container image registry
- Strapi plugin installation
- Astro build artifacts
- Database migrations

| Control ID | Control Name | Implementation | Verification Method | Maturity |
|---|---|---|---|---|
| SI-001 | CI/CD Pipeline Security | Branch protection rules; required reviews; signed commits; no secrets in logs | Pipeline audit, secret scan | L3 |
| SI-002 | Artifact Signing | Container images signed with Cosign; SBOM attestation | Signature verification test | L3 |
| SI-003 | Dependency Integrity | npm lockfile integrity checks; checksum verification; private registry proxy | Lockfile tampering test | L3 |
| SI-004 | Secure Deserialization | No native deserialization; JSON parsing with schema validation; no `eval()` | Deserialization attack test | L3 |
| SI-005 | Database Migration Integrity | Migrations signed; rollback tested; immutable migration history | Migration audit | L3 |
| SI-006 | Plugin Vetting | Strapi plugins audited before installation; no unvetted community plugins | Plugin audit | L3 |
| SI-007 | Build Reproducibility | Reproducible builds with locked dependencies; build environment isolation | Rebuild verification | L2 |
| SI-008 | Supply Chain Monitoring | Dependency confusion protection; namespace reservation; private registry | Dependency confusion test | L3 |

**ASVS Mappings**: V1.1, V1.2, V10.1, V10.2, V10.3

**Penetration Test Scenarios**:
1. CI/CD compromise: Attempt unauthorized pipeline execution
2. Dependency confusion: Publish malicious package to public registry
3. Deserialization: Submit crafted payload to trigger RCE
4. Plugin backdoor: Install plugin with hidden malicious code
5. Build tampering: Modify artifact after build but before deployment

---

### A09:2021 - Security Logging and Monitoring Failures

**Description**: Without logging and monitoring, breaches cannot be detected. This category covers insufficient logging, unclear log formats, missing monitoring, and ineffective incident response.

**TwinMOS Attack Surface**:
- Authentication events (success, failure, MFA)
- Authorization failures
- Data access and modification
- Administrative actions
- Security control failures

| Control ID | Control Name | Implementation | Verification Method | Maturity |
|---|---|---|---|---|
| LM-001 | Comprehensive Audit Logging | All authentication, authorization, data access, and admin actions logged | Log completeness audit | L3 |
| LM-002 | Structured Log Format | JSON logs with correlation IDs; centralized in Grafana Loki; 90-day retention | Log parsing test | L3 |
| LM-003 | Real-Time Alerting | PagerDuty integration; severity-based escalation; on-call rotation | Alert response drill | L3 |
| LM-004 | Failed Login Monitoring | Alert on brute force patterns; impossible travel detection; anomaly scoring | Simulated attack test | L3 |
| LM-005 | Data Exfiltration Detection | Unusual download volumes; off-hours access; bulk export monitoring | DLP simulation test | L3 |
| LM-006 | Log Integrity | Tamper-evident logs; write-once storage; hash chain verification | Log tampering test | L3 |
| LM-007 | SIEM Integration | Centralized SIEM with correlation rules; threat intelligence feed integration | SIEM rule test | L3 |
| LM-008 | Incident Response Integration | Automated incident creation from alerts; runbook attachment; escalation matrix | Incident response drill | L3 |

**ASVS Mappings**: V7.1, V7.2, V7.3, V7.4, V8.1, V8.2, V8.3

**Penetration Test Scenarios**:
1. Log deletion: Attempt to delete or modify security logs
2. Alert evasion: Perform attack slowly to avoid threshold-based alerts
3. False positive: Generate noise to mask real attack
4. Log injection: Inject false entries to confuse investigators
5. Blind spot: Identify unmonitored attack vectors

---

### A10:2021 - Server-Side Request Forgery (SSRF)

**Description**: SSRF flaws occur whenever a web application is fetching a remote resource without validating the user-supplied URL. It allows an attacker to coerce the application to send a crafted request to an unexpected destination.

**TwinMOS Attack Surface**:
- Webhook configuration in Strapi
- Image proxy/fetching for external URLs
- OAuth callback URLs
- PDF generation from external sources
- Server-side API calls to third-party services

| Control ID | Control Name | Implementation | Verification Method | Maturity |
|---|---|---|---|---|
| SR-001 | URL Validation | Strict URL parsing with allowlist; reject private IP ranges; DNS resolution validation | SSRF payload test | L3 |
| SR-002 | Network Segmentation | Application servers in DMZ; no direct access to internal services; proxy required | Network scan, segmentation test | L3 |
| SR-003 | Request Redirection Prevention | Disable following redirects; validate final destination after any redirect | Redirect chain test | L3 |
| SR-004 | DNS Rebinding Protection | Cache DNS resolution; validate IP after resolution; TTL enforcement | DNS rebinding test | L3 |
| SR-005 | Protocol Restriction | Allow only HTTP/HTTPS; block file://, gopher://, ftp://, etc. | Protocol fuzzing | L3 |
| SR-006 | Response Handling | Do not return full response to user; limit response size; sanitize content | Response leakage test | L3 |
| SR-007 | Internal Service Authentication | Internal APIs require authentication; no implicit trust based on source IP | Authentication bypass test | L3 |
| SR-008 | Monitoring and Alerting | Alert on requests to internal IPs or metadata endpoints; anomaly detection | SSRF detection test | L3 |

**ASVS Mappings**: V5.1, V5.2, V12.1, V12.2, V12.3, V12.4, V12.5, V13.1, V13.2, V13.3, V13.4, V13.5

**Penetration Test Scenarios**:
1. Metadata access: Access cloud metadata endpoint (169.254.169.254)
2. Internal port scan: Use SSRF to scan internal network
3. Localhost access: Access services bound to localhost
4. Protocol smuggling: Use gopher:// to send arbitrary TCP data
5. Redirect abuse: Use open redirect to bypass URL validation

---

## 4. Verification and Testing Matrix

### 4.1 Testing Methodology by Category

| OWASP Category | SAST | DAST | IAST | Pen Test | Fuzzing | Code Review |
|---|---|---|---|---|---|---|
| A01 Broken Access Control | Medium | High | High | Critical | Low | High |
| A02 Cryptographic Failures | Low | High | Medium | High | Medium | High |
| A03 Injection | High | High | High | Critical | Critical | High |
| A04 Insecure Design | Low | Medium | Medium | High | Low | Critical |
| A05 Security Misconfiguration | Low | High | Medium | High | Medium | Medium |
| A06 Vulnerable Components | High | Low | Low | Medium | Low | High |
| A07 Auth Failures | Medium | High | High | Critical | Medium | High |
| A08 Integrity Failures | Medium | Low | Medium | High | Low | Critical |
| A09 Logging Failures | Low | Low | Low | Medium | Low | Medium |
| A10 SSRF | Medium | High | High | High | High | Medium |

### 4.2 Testing Tools and Coverage

| Tool | Type | A01 | A02 | A03 | A04 | A05 | A06 | A07 | A08 | A09 | A10 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Semgrep | SAST | X | - | X | X | X | X | X | X | - | X |
| SonarQube | SAST | X | - | X | X | X | X | X | X | - | X |
| OWASP ZAP | DAST | X | X | X | - | X | - | X | - | - | X |
| Burp Suite | DAST/Pen | X | X | X | X | X | - | X | X | - | X |
| Snyk | SCA | - | - | - | - | - | X | - | X | - | - |
| Trivy | Container | - | - | - | - | X | X | - | X | - | - |
| sqlmap | Injection | - | - | X | - | - | - | - | - | - | - |
| testssl.sh | Crypto | - | X | - | - | X | - | - | - | - | - |
| nuclei | DAST | X | X | X | X | X | X | X | X | - | X |

---

## 5. Risk Heat Map

### 5.1 Likelihood vs Impact Matrix

```
                    IMPACT
              Low    Medium    High    Critical
         +---------+---------+---------+---------+
    High |  A09    |  A05    |  A06    |  A03    |
         |         |         |         |         |
L   Med  |  A10    |  A04    |  A08    |  A07    |
I        |         |         |         |         |
K   Low  |  ---    |  A10    |  A02    |  A01    |
E        |         |         |         |         |
L   Very |  ---    |  ---    |  A09    |  A02    |
I   Low  |         |         |         |         |
H        +---------+---------+---------+---------+
```

### 5.2 Risk Scoring

| Category | Likelihood | Impact | Risk Score | Priority |
|---|---|---|---|---|
| A01 Broken Access Control | Low | Critical | 8 | P1 |
| A02 Cryptographic Failures | Very Low | Critical | 6 | P2 |
| A03 Injection | High | Critical | 12 | P0 |
| A04 Insecure Design | Medium | High | 8 | P1 |
| A05 Security Misconfiguration | High | Medium | 8 | P1 |
| A06 Vulnerable Components | High | High | 10 | P0 |
| A07 Auth Failures | Medium | Critical | 10 | P0 |
| A08 Integrity Failures | Medium | High | 8 | P1 |
| A09 Logging Failures | Very Low | Critical | 6 | P2 |
| A10 SSRF | Medium | High | 8 | P1 |

---

## 6. Remediation and Gap Tracking

### 6.1 Gap Register

| Gap ID | OWASP Category | Description | Severity | Target Closure | Owner |
|---|---|---|---|---|---|
| GAP-001 | A06 | Container runtime protection (Falco) not yet implemented | Medium | Phase 2 | DevSecOps Lead |
| GAP-002 | A04 | Formal business logic testing framework not yet established | Medium | Phase 2 | QA Lead |
| GAP-003 | A09 | SIEM correlation rules need tuning based on production traffic | Low | Post-Launch | SOC Lead |
| GAP-004 | A02 | HSM for key storage not yet procured | Low | Phase 3 | CISO |
| GAP-005 | A10 | Formal SSRF testing automation not yet in CI/CD | Medium | Phase 2 | Security Engineer |

### 6.2 Remediation SLA

| Severity | Detection to Triage | Triage to Fix | Fix to Deploy | Verification |
|---|---|---|---|---|
| Critical | 1 hour | 24 hours | 48 hours | 72 hours |
| High | 4 hours | 72 hours | 1 week | 2 weeks |
| Medium | 24 hours | 2 weeks | 1 month | 6 weeks |
| Low | 1 week | 1 month | 3 months | 4 months |

---

## 7. Compliance and Audit Evidence

### 7.1 Audit Artifact Mapping

| OWASP Category | Artifacts for Auditor | Location | Retention |
|---|---|---|---|
| A01 | RBAC test reports, penetration test results | Security Share /pentest | 7 years |
| A02 | SSL Labs reports, encryption configuration | Security Share /crypto | 7 years |
| A03 | SAST reports, injection test results | Security Share /sast | 7 years |
| A04 | Threat models, design review minutes | Security Share /threat-model | 7 years |
| A05 | Configuration baselines, hardening scripts | Security Share /config | 7 years |
| A06 | SBOMs, vulnerability scan reports | Security Share /sbom | 7 years |
| A07 | Authentication test reports, MFA audit | Security Share /auth | 7 years |
| A08 | CI/CD audit logs, artifact signatures | Security Share /cicd | 7 years |
| A09 | Log samples, alerting configuration | Security Share /logging | 7 years |
| A10 | SSRF test results, network diagrams | Security Share /network | 7 years |

### 7.2 Regulatory Mapping

| Regulation | Relevant OWASP Categories | Evidence Required |
|---|---|---|
| GDPR Art. 32 | A02, A03, A05, A07 | Technical measures documentation |
| UAE PDPL | A01, A02, A07, A09 | Access control and audit logs |
| India DPDP 2023 | A02, A03, A07 | Data protection safeguards |
| KSA PDPL | A01, A02, A07, A09 | Consent and access management |
| PCI DSS 4.0 | A02, A03, A05, A06, A07 | Full ASVS Level 2 equivalent |

---

## 8. Governance

### 8.1 Review and Maintenance

| Trigger | Action | Owner | Timeline |
|---|---|---|---|
| OWASP Top 10 update | Full matrix review and re-mapping | Security Architect | 30 days after release |
| New component addition | Category re-assessment for new attack surface | Security Engineer | Before deployment |
| Penetration test findings | Update coverage gaps and controls | Security Engineer | Within 1 week |
| Quarterly security review | Maturity level validation and gap analysis | CISO | Quarterly |
| Incident post-mortem | Category-specific control enhancement | Incident Lead | Within 2 weeks |

### 8.2 RACI Matrix

| Activity | CISO | Security Architect | Security Engineer | Dev Team | QA Team |
|---|---|---|---|---|---|
| Matrix maintenance | A | R | C | I | I |
| Control implementation | A | C | R | R | I |
| Testing execution | I | C | R | C | R |
| Gap remediation | A | C | R | R | I |
| Audit preparation | R | R | C | I | I |
| Tool selection | A | R | C | C | I |

---

## 9. Document Change Log

| Version | Date | Author | Change Description |
|---|---|---|---|
| 1.0.0 | 2026-05-01 | Unisoft Technologies Security Team | Initial release covering OWASP Top 10:2021 with full control mapping |

---

## 10. Appendices

### Appendix A: OWASP ASVS Level Target

The TwinMOS website targets **ASVS Level 2 (Standard Applications)** for all categories, with **ASVS Level 3 (High-Value/High-Assurance)** for:
- Authentication and session management (V2, V3, V4)
- Cryptography (V6)
- API security (V13)
- Configuration (V14)

### Appendix B: Penetration Test Scope by OWASP Category

| Test Type | Frequency | Scope | Provider |
|---|---|---|---|
| Web Application Pen Test | Annual | All public-facing applications | External vendor (Big 4 or specialist) |
| API Pen Test | Annual | All API endpoints | External vendor |
| Mobile Pen Test | Phase 3 | iOS and Android apps | External vendor |
| Red Team Exercise | Bi-annual | Full infrastructure | External specialist |
| Bug Bounty | Continuous | Production environment | HackerOne or Bugcrowd |

### Appendix C: OWASP Top 10:2021 Quick Reference

| ID | Category | CWE Mapping |
|---|---|---|
| A01 | Broken Access Control | CWE-22, CWE-284, CWE-285, CWE-287, CWE-352, CWE-359, CWE-434, CWE-639, CWE-651, CWE-668, CWE-706, CWE-862, CWE-863, CWE-913, CWE-922, CWE-1275 |
| A02 | Cryptographic Failures | CWE-261, CWE-296, CWE-310, CWE-319, CWE-321, CWE-322, CWE-323, CWE-324, CWE-325, CWE-326, CWE-327, CWE-328, CWE-329, CWE-330, CWE-331, CWE-335, CWE-336, CWE-337, CWE-338, CWE-340, CWE-347, CWE-523, CWE-720, CWE-757, CWE-759, CWE-760, CWE-780, CWE-818, CWE-916 |
| A03 | Injection | CWE-20, CWE-74, CWE-75, CWE-77, CWE-78, CWE-79, CWE-80, CWE-83, CWE-87, CWE-88, CWE-89, CWE-90, CWE-91, CWE-93, CWE-94, CWE-95, CWE-96, CWE-97, CWE-98, CWE-99, CWE-100, CWE-113, CWE-116, CWE-138, CWE-184, CWE-470, CWE-471, CWE-564, CWE-610, CWE-643, CWE-644, CWE-652, CWE-917 |
| A04 | Insecure Design | CWE-73, CWE-183, CWE-209, CWE-213, CWE-235, CWE-256, CWE-257, CWE-266, CWE-269, CWE-280, CWE-311, CWE-312, CWE-313, CWE-316, CWE-419, CWE-430, CWE-434, CWE-444, CWE-451, CWE-472, CWE-501, CWE-522, CWE-525, CWE-539, CWE-579, CWE-598, CWE-602, CWE-642, CWE-668, CWE-706, CWE-721, CWE-778, CWE-807, CWE-840, CWE-841, CWE-927, CWE-1021, CWE-1173, CWE-1174, CWE-1175, CWE-1176, CWE-1177, CWE-1188 |
| A05 | Security Misconfiguration | CWE-2, CWE-11, CWE-13, CWE-15, CWE-16, CWE-260, CWE-315, CWE-520, CWE-526, CWE-537, CWE-541, CWE-547, CWE-611, CWE-614, CWE-756, CWE-776, CWE-942, CWE-1004, CWE-1032, CWE-1174 |
| A06 | Vulnerable and Outdated Components | CWE-937, CWE-1035, CWE-1104 |
| A07 | Identification and Authentication Failures | CWE-255, CWE-259, CWE-287, CWE-288, CWE-290, CWE-294, CWE-295, CWE-297, CWE-300, CWE-302, CWE-304, CWE-306, CWE-307, CWE-346, CWE-384, CWE-521, CWE-613, CWE-620, CWE-640, CWE-798, CWE-940, CWE-1216 |
| A08 | Software and Data Integrity Failures | CWE-345, CWE-353, CWE-426, CWE-494, CWE-502, CWE-565, CWE-784, CWE-829, CWE-830, CWE-915 |
| A09 | Security Logging and Monitoring Failures | CWE-117, CWE-223, CWE-532, CWE-778 |
| A10 | Server-Side Request Forgery (SSRF) | CWE-918 |
