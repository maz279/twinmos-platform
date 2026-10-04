# TwinMOS Website — Security Controls Catalog

| Document Attribute | Value |
|---|---|
| **Document ID** | TWN-SEC-2026-011 |
| **Version** | 1.0.0 |
| **Status** | Draft |
| **Author** | Unisoft Technologies Security Team |
| **Owner** | CISO / Security Architect |
| **Review Date** | 2026-11-01 |
| **Classification** | Confidential |
| **Related Documents** | TWN-SEC-2026-001 (Security Architecture), TWN-SEC-2026-010 (STRIDE Threat Model), TWN-SEC-2026-009 (OWASP Top 10 Coverage), TWN-OPS-2026-001 (Pen Testing), TWN-OPS-2026-002 (Vuln Management) |
| **Compliance Mapping** | NIST SP 800-53 Rev. 5, ISO/IEC 27001:2022 Annex A, CIS Controls v8.1, GDPR Art. 32, PCI DSS 4.0 |
| **Synchronized With** | BRD v3.0, Tech Stack v1.1, URD v3.0, Implementation Strategy v3.0 |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Catalog Structure & Methodology](#2-catalog-structure--methodology)
3. [Control Family AC — Access Control](#3-control-family-ac--access-control)
4. [Control Family AU — Audit and Accountability](#4-control-family-au--audit-and-accountability)
5. [Control Family CM — Configuration Management](#5-control-family-cm--configuration-management)
6. [Control Family IA — Identification and Authentication](#6-control-family-ia--identification-and-authentication)
7. [Control Family IR — Incident Response](#7-control-family-ir--incident-response)
8. [Control Family SC — System and Communications Protection](#8-control-family-sc--system-and-communications-protection)
9. [Control Family SI — System and Information Integrity](#9-control-family-si--system-and-information-integrity)
10. [Control Inheritance Matrix](#10-control-inheritance-matrix)
11. [Compliance Cross-Reference Summary](#11-compliance-cross-reference-summary)
12. [Implementation Roadmap by Phase](#12-implementation-roadmap-by-phase)
13. [Governance & Evidence Management](#13-governance--evidence-management)
14. [Appendix A — Control Status Summary](#appendix-a--control-status-summary)
15. [Appendix B — Acronyms & Definitions](#appendix-b--acronyms--definitions)

---

## 1. Executive Summary

This Security Controls Catalog is the authoritative register of security controls implemented and planned for the TwinMOS corporate website platform. It maps each control to the relevant NIST SP 800-53 Rev. 5 control family, ISO/IEC 27001:2022 Annex A clause, and CIS Controls v8.1 safeguard, providing a unified compliance view across all applicable frameworks.

### 1.1 Catalog Summary

| Control Family | Controls Defined | Implemented (P1) | Planned (P2) | Planned (P3) | Not Applicable |
|---|---|---|---|---|---|
| AC — Access Control | 10 | 7 | 2 | 1 | 0 |
| AU — Audit & Accountability | 7 | 5 | 2 | 0 | 0 |
| CM — Configuration Management | 8 | 6 | 2 | 0 | 0 |
| IA — Identification & Authentication | 9 | 7 | 2 | 0 | 0 |
| IR — Incident Response | 6 | 4 | 2 | 0 | 0 |
| SC — System & Comms Protection | 10 | 8 | 1 | 1 | 0 |
| SI — System & Information Integrity | 8 | 6 | 2 | 0 | 0 |
| **Total** | **58** | **43** | **13** | **2** | **0** |

### 1.2 Implementation Status Legend

| Status | Code | Description |
|---|---|---|
| ✅ Implemented | `IMP` | Control is live and verified in production |
| 🔄 Planned P2 | `P2` | Scheduled for Partner Portal phase |
| 🔄 Planned P3 | `P3` | Scheduled for E-Commerce phase |
| ⚠️ Partial | `PAR` | Partially implemented; gap identified |
| ❌ Not Applicable | `N/A` | Control does not apply to this system |

---

## 2. Catalog Structure & Methodology

### 2.1 Framework Alignment

This catalog aligns three major security frameworks:

| Framework | Version | Usage in Catalog |
|---|---|---|
| **NIST SP 800-53** | Rev. 5 (2020) | Primary control taxonomy and control IDs |
| **ISO/IEC 27001** | 2022 (Annex A) | Cross-reference for ISO certification readiness |
| **CIS Controls** | v8.1 (2024) | Implementation guidance and safeguard mapping |

### 2.2 Control Entry Format

Each control entry contains:
- **Control ID** — NIST SP 800-53 identifier
- **Control Name** — Descriptive name
- **TwinMOS Implementation** — Specific implementation for the TwinMOS platform
- **Evidence Artifact** — How compliance is demonstrated
- **ISO 27001:2022** — Corresponding Annex A clause
- **CIS v8.1** — Corresponding CIS safeguard
- **Status / Phase** — Implementation status

### 2.3 Shared Responsibility Model

| Layer | Responsibility | Controls Owner |
|---|---|---|
| **Cloudflare** | Edge security (WAF, DDoS, TLS termination, bot management) | Platform (Cloudflare) |
| **Hetzner** | Physical infrastructure, hypervisor security | Infrastructure (Hetzner) |
| **Coolify** | Container orchestration, deployment security | Operations (Unisoft/TwinMOS) |
| **Application** | Application-layer security, auth, business logic | Development (Unisoft) |
| **TwinMOS** | Governance, policy, access management, compliance | TwinMOS |

---

## 3. Control Family AC — Access Control

*Purpose: Limit system access to authorized users, processes, devices, and types of transactions.*

---

### AC-1 — Access Control Policy and Procedures

| Field | Detail |
|---|---|
| **Control ID** | AC-1 |
| **Control Name** | Access Control Policy and Procedures |
| **TwinMOS Implementation** | Formal access control policy documented in TWN-SEC-2026-001 (Security Architecture) §6. Procedures cover CMS admin provisioning, partner portal onboarding, and API access management. Policy reviewed annually or upon significant system change. |
| **Evidence Artifact** | Policy document (TWN-SEC-2026-001); access control training records; annual review sign-off |
| **ISO 27001:2022** | A.5.1 Policies for information security; A.5.15 Access control |
| **CIS v8.1** | CIS 6.1 — Establish an Access Granting Process |
| **Status / Phase** | ✅ IMP (P1) |

---

### AC-2 — Account Management

| Field | Detail |
|---|---|
| **Control ID** | AC-2 |
| **Control Name** | Account Management |
| **TwinMOS Implementation** | Strapi admin accounts provisioned only upon written request from TwinMOS Chairman or GM Dubai. Account types: Super Admin (TwinMOS IT Lead), Editor (content team), Viewer (read-only). Accounts disabled within 24 hours of employment termination. Quarterly access review conducted by IT Lead. Partner portal accounts (P2) managed via Better Auth with invitation-only registration and manual approval workflow. |
| **Evidence Artifact** | User provisioning/deprovisioning log in Strapi audit trail; quarterly access review records; HR offboarding checklist |
| **ISO 27001:2022** | A.5.15 Access control; A.5.16 Identity management; A.5.18 Access rights |
| **CIS v8.1** | CIS 5.1 — Establish and Maintain an Inventory of Accounts; CIS 5.3 — Disable Dormant Accounts |
| **Status / Phase** | ✅ IMP (P1) |

---

### AC-3 — Access Enforcement

| Field | Detail |
|---|---|
| **Control ID** | AC-3 |
| **Control Name** | Access Enforcement |
| **TwinMOS Implementation** | Role-Based Access Control (RBAC) enforced at three layers: (1) Strapi API middleware — every request validated against the authenticated user's role and permissions; (2) Cloudflare Access policies — restrict admin paths to IP allowlist; (3) Database — least-privilege PostgreSQL roles (read-only role for API queries, read-write role for admin operations, no DROP/TRUNCATE permissions). |
| **Evidence Artifact** | Strapi permissions configuration; Cloudflare Access policy export; PostgreSQL role definitions; RBAC regression test results |
| **ISO 27001:2022** | A.5.15 Access control; A.8.3 Information access restriction |
| **CIS v8.1** | CIS 6.4 — Require MFA for Administrative Access; CIS 6.8 — Define and Maintain Role-Based Access Control |
| **Status / Phase** | ✅ IMP (P1) |

---

### AC-4 — Information Flow Enforcement

| Field | Detail |
|---|---|
| **Control ID** | AC-4 |
| **Control Name** | Information Flow Enforcement |
| **TwinMOS Implementation** | Content Security Policy (CSP) controls information flow at the browser level, restricting which origins may load scripts, styles, images, and frames (TWN-SEC-2026-005). Cloudflare firewall rules enforce that internal admin paths (`/admin`, `/api`) are not accessible from public-facing CDN cache. API responses include `Access-Control-Allow-Origin` limited to `twinmos.com` and `staging.twinmos.com`. GraphQL API disabled in production (REST API only for public consumers). |
| **Evidence Artifact** | CSP policy documentation (TWN-SEC-2026-005); Cloudflare firewall rules export; CORS configuration in codebase; API schema documentation |
| **ISO 27001:2022** | A.8.20 Networks security; A.8.22 Segregation in networks |
| **CIS v8.1** | CIS 4.4 — Implement and Manage a Firewall on Servers; CIS 13.1 — Centralize Security Event Alerting |
| **Status / Phase** | ✅ IMP (P1) |

---

### AC-6 — Least Privilege

| Field | Detail |
|---|---|
| **Control ID** | AC-6 |
| **Control Name** | Least Privilege |
| **TwinMOS Implementation** | Principle of least privilege enforced at all layers: (1) Strapi content editors cannot publish without editor-level role; (2) API service account has read-only access to database; (3) Backblaze B2 API key scoped to specific bucket only; (4) Postmark API key scoped to send-only (no account management); (5) Coolify deployment user cannot access production database directly; (6) Cloudflare API tokens scoped to minimum required zone permissions. |
| **Evidence Artifact** | Role permission matrix in Strapi; API key scope documentation; Coolify user role configuration; quarterly privilege review log |
| **ISO 27001:2022** | A.5.15 Access control; A.5.18 Access rights; A.8.2 Privileged access rights |
| **CIS v8.1** | CIS 5.4 — Restrict Administrator Privileges to Dedicated Admin Accounts; CIS 6.8 — Define Role-Based Access Control |
| **Status / Phase** | ✅ IMP (P1) |

---

### AC-7 — Unsuccessful Logon Attempts

| Field | Detail |
|---|---|
| **Control ID** | AC-7 |
| **Control Name** | Unsuccessful Logon Attempts |
| **TwinMOS Implementation** | Progressive account lockout: 5 failed login attempts within 15 minutes triggers a 30-minute lockout; 10 cumulative failures in 24 hours triggers manual unlock by IT Lead. Cloudflare WAF rate-limiting rule blocks IPs attempting more than 20 login requests per minute. Lockout events generate real-time Sentry alert to IT Lead. |
| **Evidence Artifact** | Strapi auth configuration; Cloudflare WAF rule export; Sentry alert configuration; test validation records |
| **ISO 27001:2022** | A.8.5 Secure authentication |
| **CIS v8.1** | CIS 6.2 — Establish an Access Revoking Process |
| **Status / Phase** | ✅ IMP (P1) |

---

### AC-11 — Device Lock / Session Termination

| Field | Detail |
|---|---|
| **Control ID** | AC-11 |
| **Control Name** | Session Lock & Termination |
| **TwinMOS Implementation** | CMS admin sessions: 15-minute idle timeout with re-authentication prompt; absolute session limit of 8 hours. Partner portal sessions (P2): 30-minute idle timeout; 12-hour absolute limit. Refresh token rotation on each use prevents token reuse after logout. Explicit logout revokes refresh token from server-side blocklist immediately. |
| **Evidence Artifact** | Auth specification (TWN-SEC-2026-002) §6; session timeout configuration in Better Auth; token blocklist implementation |
| **ISO 27001:2022** | A.8.5 Secure authentication; A.5.15 Access control |
| **CIS v8.1** | CIS 4.3 — Configure Automatic Session Locking on Enterprise Assets |
| **Status / Phase** | ✅ IMP (P1) / 🔄 P2 (Partner Portal) |

---

### AC-14 — Permitted Actions Without Identification

| Field | Detail |
|---|---|
| **Control ID** | AC-14 |
| **Control Name** | Permitted Actions Without Identification or Authentication |
| **TwinMOS Implementation** | Public (unauthenticated) actions explicitly defined and limited to: viewing published product/content pages, submitting contact/inquiry forms (with CAPTCHA and rate limiting), using the distributor locator, performing site search, downloading public datasheets. All other actions require authentication. Strapi API public role has read-only access to published content types only — no write operations permitted without JWT. |
| **Evidence Artifact** | Strapi Public role permission configuration; API endpoint access matrix; penetration test validation |
| **ISO 27001:2022** | A.5.15 Access control |
| **CIS v8.1** | CIS 6.1 — Establish an Access Granting Process |
| **Status / Phase** | ✅ IMP (P1) |

---

### AC-17 — Remote Access

| Field | Detail |
|---|---|
| **Control ID** | AC-17 |
| **Control Name** | Remote Access |
| **TwinMOS Implementation** | Hetzner server SSH access: key-based authentication only (password auth disabled); SSH port changed from default (22); Cloudflare Tunnel or Hetzner private network for internal management traffic; SSH access restricted to Unisoft DevOps team static IPs via Hetzner firewall rules. CMS admin accessible over internet only via Cloudflare Access (identity-aware proxy) with MFA challenge. No VPN required for CMS admin (handled by Cloudflare Access). |
| **Evidence Artifact** | SSH configuration file (`/etc/ssh/sshd_config`); Hetzner firewall rule export; Cloudflare Access policy documentation |
| **ISO 27001:2022** | A.8.20 Networks security; A.6.7 Remote working |
| **CIS v8.1** | CIS 6.5 — Require MFA for Remote Network Access |
| **Status / Phase** | ✅ IMP (P1) |

---

### AC-22 — Publicly Accessible Content

| Field | Detail |
|---|---|
| **Control ID** | AC-22 |
| **Control Name** | Publicly Accessible Content |
| **TwinMOS Implementation** | All publicly accessible website content reviewed and approved by designated TwinMOS content owners (TwinMOS Marketing Lead) before publication. Strapi workflow enforces draft → review → publish states. Published content must not include: internal business processes, pricing strategies, personal data of employees without consent, or confidential partner information. Legal pages (14-legal/) reviewed by Legal Counsel before publication. |
| **Evidence Artifact** | Strapi content workflow configuration; editorial review checklist; publication log |
| **ISO 27001:2022** | A.5.32 Intellectual property rights; A.5.34 Privacy and protection of PII |
| **CIS v8.1** | CIS 3.3 — Configure Data Access Control Lists |
| **Status / Phase** | ✅ IMP (P1) |

---

## 4. Control Family AU — Audit and Accountability

*Purpose: Create, protect, and retain audit records; ensure actions can be traced to individuals.*

---

### AU-2 — Event Logging

| Field | Detail |
|---|---|
| **Control ID** | AU-2 |
| **Control Name** | Event Logging |
| **TwinMOS Implementation** | The following events are logged: (1) All CMS admin login/logout events with timestamp, IP, user ID; (2) All content creation, modification, and deletion actions; (3) All API authentication failures; (4) All form submissions (IP-hashed, timestamp, form type); (5) All 4xx/5xx HTTP errors; (6) All partner portal session events (P2); (7) All payment events and Stripe webhooks (P3). Log format: structured JSON. Log destination: Hetzner server logs + remote log aggregation (Grafana Loki or equivalent). |
| **Evidence Artifact** | Logging configuration in Strapi; Cloudflare log export settings; log sample output; log shipping configuration |
| **ISO 27001:2022** | A.8.15 Logging; A.8.16 Monitoring activities |
| **CIS v8.1** | CIS 8.2 — Collect Audit Logs; CIS 8.5 — Collect Detailed Audit Logs |
| **Status / Phase** | ✅ IMP (P1) |

---

### AU-3 — Content of Audit Records

| Field | Detail |
|---|---|
| **Control ID** | AU-3 |
| **Control Name** | Content of Audit Records |
| **TwinMOS Implementation** | Each audit record contains: timestamp (UTC, ISO 8601), event type, user identity (ID or hashed IP for anonymous), source IP address, resource accessed, action performed, outcome (success/failure), session token hash (for authenticated events), request ID (correlation). Personally identifiable information in log entries limited to hashed IP and user ID — raw PII not logged. |
| **Evidence Artifact** | Log schema documentation; sample log entries (sanitized); GDPR data minimization review of log fields |
| **ISO 27001:2022** | A.8.15 Logging |
| **CIS v8.1** | CIS 8.2 — Collect Audit Logs |
| **Status / Phase** | ✅ IMP (P1) |

---

### AU-6 — Audit Review, Analysis, and Reporting

| Field | Detail |
|---|---|
| **Control ID** | AU-6 |
| **Control Name** | Audit Review, Analysis, and Reporting |
| **TwinMOS Implementation** | Automated log analysis via Sentry (error and security event alerting) and Cloudflare Analytics (traffic anomalies). Manual weekly review of Cloudflare WAF blocked requests by DevOps. Monthly security review meeting including log analysis summary. Real-time alerts for: >5 admin login failures, any admin action outside business hours, any >100 API errors per minute. Automated anomaly detection for traffic patterns. |
| **Evidence Artifact** | Sentry alert configuration; Cloudflare analytics dashboard; monthly security review meeting minutes; alert runbook |
| **ISO 27001:2022** | A.8.16 Monitoring activities; A.5.25 Assessment and decision on information security events |
| **CIS v8.1** | CIS 8.11 — Conduct Audit Log Reviews |
| **Status / Phase** | ✅ IMP (P1) |

---

### AU-9 — Protection of Audit Information

| Field | Detail |
|---|---|
| **Control ID** | AU-9 |
| **Control Name** | Protection of Audit Information |
| **TwinMOS Implementation** | Audit logs stored in append-only log store (no delete capability for standard admin accounts). Log integrity protected via: (1) Separate log storage from application servers (prevents tampering by compromised application); (2) Log shipping to remote aggregator within 60 seconds of event generation; (3) Log access restricted to Security Lead and DevOps Lead — separate credentials from CMS admin. Cloudflare logs exported to separate S3/R2 bucket with read-only API key. |
| **Evidence Artifact** | Log storage architecture diagram; log access control configuration; log integrity verification procedure |
| **ISO 27001:2022** | A.8.15 Logging; A.8.16 Monitoring activities |
| **CIS v8.1** | CIS 8.3 — Ensure Adequate Audit Log Storage |
| **Status / Phase** | ✅ IMP (P1) |

---

### AU-11 — Audit Record Retention

| Field | Detail |
|---|---|
| **Control ID** | AU-11 |
| **Control Name** | Audit Record Retention |
| **TwinMOS Implementation** | Retention periods by log type: Security events (access, auth, admin actions) — 90 days hot storage, 1 year cold archive; Application error logs — 30 days; Cloudflare WAF/traffic logs — 7 days (Cloudflare platform limit) + export to long-term store for 90 days; Payment/financial audit records (P3) — 7 years (PCI DSS + financial regulation); GDPR-related processing records — duration of relationship + 3 years. |
| **Evidence Artifact** | Log retention policy document; storage configuration; automated deletion schedule; archive verification |
| **ISO 27001:2022** | A.5.33 Protection of records |
| **CIS v8.1** | CIS 8.3 — Ensure Adequate Audit Log Storage |
| **Status / Phase** | ✅ IMP (P1) |

---

### AU-12 — Audit Record Generation

| Field | Detail |
|---|---|
| **Control ID** | AU-12 |
| **Control Name** | Audit Record Generation |
| **TwinMOS Implementation** | Audit records generated at the source (Strapi CMS, Better Auth service, Cloudflare edge, Hetzner server). Each component responsible for generating its own structured logs, which are aggregated centrally. Audit generation cannot be disabled by standard admin accounts — requires DevOps-level access and generates its own alert. All new features include logging requirements in definition-of-done. |
| **Evidence Artifact** | Logging middleware implementation in codebase; definition-of-done checklist; audit of log generation per component |
| **ISO 27001:2022** | A.8.15 Logging |
| **CIS v8.1** | CIS 8.2 — Collect Audit Logs; CIS 8.5 — Collect Detailed Audit Logs |
| **Status / Phase** | ✅ IMP (P1) |

---

### AU-14 — Session Audit

| Field | Detail |
|---|---|
| **Control ID** | AU-14 |
| **Control Name** | Session Audit |
| **TwinMOS Implementation** | Partner portal (P2) sessions fully auditable: session start time, end time, actions performed, IP address, device fingerprint. Session replay capability for security investigation (anonymized view only — no personal data captured beyond session metadata). CMS admin sessions: full action log per session. Session audit records retained 90 days. |
| **Evidence Artifact** | Session audit log schema; session log query capability; Better Auth session logging configuration |
| **ISO 27001:2022** | A.8.15 Logging; A.8.16 Monitoring activities |
| **CIS v8.1** | CIS 8.5 — Collect Detailed Audit Logs |
| **Status / Phase** | 🔄 P2 (Partner Portal) |

---

## 5. Control Family CM — Configuration Management

*Purpose: Establish and maintain baseline configurations and inventories of systems.*

---

### CM-2 — Baseline Configuration

| Field | Detail |
|---|---|
| **Control ID** | CM-2 |
| **Control Name** | Baseline Configuration |
| **TwinMOS Implementation** | Infrastructure as Code (IaC) via Coolify defines the baseline configuration for all server components. Docker Compose files version-controlled in GitHub repository define: Strapi v5 (specific version tag), PostgreSQL 16 (specific minor version), Nginx reverse proxy (specific version), Meilisearch (specific version). Baseline configurations reviewed and approved before promotion to production. Deviations from baseline trigger automated alert. |
| **Evidence Artifact** | GitHub repository with IaC files; version tags in Docker Compose; Coolify deployment history; baseline review records |
| **ISO 27001:2022** | A.8.9 Configuration management |
| **CIS v8.1** | CIS 4.1 — Establish and Maintain a Secure Configuration Process |
| **Status / Phase** | ✅ IMP (P1) |

---

### CM-3 — Configuration Change Control

| Field | Detail |
|---|---|
| **Control ID** | CM-3 |
| **Control Name** | Configuration Change Control |
| **TwinMOS Implementation** | All production configuration changes require: (1) Pull Request (PR) in GitHub with description of change and security impact assessment; (2) Peer code review by at least one senior developer; (3) Successful CI pipeline including security scans (dependency check, SAST lint); (4) Staging deployment and smoke test; (5) Unisoft Tech Lead approval before production merge. Emergency changes: documented post-facto within 4 hours. Changes logged in GitHub commit history and Coolify deployment log. |
| **Evidence Artifact** | GitHub PR/merge history; CI pipeline run logs; code review approval records; deployment log |
| **ISO 27001:2022** | A.8.32 Change management |
| **CIS v8.1** | CIS 4.1 — Establish and Maintain a Secure Configuration Process |
| **Status / Phase** | ✅ IMP (P1) |

---

### CM-6 — Configuration Settings

| Field | Detail |
|---|---|
| **Control ID** | CM-6 |
| **Control Name** | Configuration Settings |
| **TwinMOS Implementation** | Security-relevant configuration settings hardened per CIS benchmarks: (1) Nginx — TLS 1.2/1.3 only, HSTS, security headers (TWN-SEC-2026-006), server_tokens off, limit_except GET POST; (2) PostgreSQL — `ssl=on`, `log_connections=on`, `password_encryption=scram-sha-256`, external connections disabled; (3) Strapi — `NODE_ENV=production`, debug mode disabled, API rate limits enabled; (4) Docker — non-root container user, read-only filesystem where possible, no privileged mode. All settings documented and version-controlled. |
| **Evidence Artifact** | Nginx configuration file; PostgreSQL configuration; Docker Compose security options; CIS benchmark scan results |
| **ISO 27001:2022** | A.8.9 Configuration management; A.8.8 Management of technical vulnerabilities |
| **CIS v8.1** | CIS 4.1 — Establish and Maintain a Secure Configuration Process; CIS 4.2 — Establish and Maintain a Secure Configuration Process for Network Infrastructure |
| **Status / Phase** | ✅ IMP (P1) |

---

### CM-7 — Least Functionality

| Field | Detail |
|---|---|
| **Control ID** | CM-7 |
| **Control Name** | Least Functionality |
| **TwinMOS Implementation** | All unnecessary services, ports, protocols, and features disabled: (1) Strapi GraphQL endpoint disabled in production (REST API only for public); (2) Strapi Users-Permissions plugin documentation endpoint disabled; (3) Nginx — unnecessary HTTP methods blocked (TRACE, OPTIONS blocked at edge); (4) PostgreSQL — no remote superuser access; `pg_hba.conf` restricts connections to application server only; (5) Docker — minimal base images (Alpine-based where available); (6) Cloudflare — only HTTPS (port 443/80) allowed; all other ports blocked. |
| **Evidence Artifact** | Service inventory with justification; disabled feature documentation; port scan results; Cloudflare firewall rules |
| **ISO 27001:2022** | A.8.9 Configuration management; A.8.22 Segregation in networks |
| **CIS v8.1** | CIS 4.8 — Uninstall or Disable Unnecessary Services |
| **Status / Phase** | ✅ IMP (P1) |

---

### CM-8 — System Component Inventory

| Field | Detail |
|---|---|
| **Control ID** | CM-8 |
| **Control Name** | System Component Inventory |
| **TwinMOS Implementation** | Software Bill of Materials (SBOM) generated automatically at each production build using CycloneDX for Node.js dependencies (TWN-OPS-2026-004). Infrastructure inventory maintained in Coolify and documented in Tech Stack v1.1. Inventory includes: all npm packages with versions, all Docker image tags, all Cloudflare services in use, all third-party API integrations with version/contract details. Inventory updated automatically on dependency change. |
| **Evidence Artifact** | CycloneDX SBOM file (generated per build); Coolify service inventory; Tech Stack v1.1 document; third-party integration register |
| **ISO 27001:2022** | A.8.8 Management of technical vulnerabilities; A.5.9 Inventory of information and other associated assets |
| **CIS v8.1** | CIS 2.1 — Establish and Maintain a Software Inventory |
| **Status / Phase** | ✅ IMP (P1) |

---

### CM-11 — User-Installed Software

| Field | Detail |
|---|---|
| **Control ID** | CM-11 |
| **Control Name** | User-Installed Software |
| **TwinMOS Implementation** | Production server: Docker-only deployment via Coolify; no direct software installation by users. All software changes must go through GitHub PR process (CM-3). Strapi plugins: allowlist-only policy — plugins must be reviewed and approved by Unisoft Security Lead before installation. npm package additions: require PR review; `npm audit` must pass with zero critical/high vulnerabilities before merge. |
| **Evidence Artifact** | Coolify deployment log (no unauthorized installs); Strapi plugin allowlist; CI npm audit results; PR review history |
| **ISO 27001:2022** | A.8.19 Installation of software on operational systems |
| **CIS v8.1** | CIS 2.7 — Allowlist Authorized Software |
| **Status / Phase** | ✅ IMP (P1) |

---

### CM-12 — Information Location

| Field | Detail |
|---|---|
| **Control ID** | CM-12 |
| **Control Name** | Information Location |
| **TwinMOS Implementation** | Data inventory and location documented in GDPR Art. 30 Records of Processing Activities (TWN-COMP-2026-004). Data stores: (1) PostgreSQL on Hetzner (Falkenstein, Germany) — all CMS content, user accounts, form submissions; (2) Backblaze B2 (US West region) — static assets, product images, datasheets; (3) Sentry (US, Sentry cloud) — error traces; (4) Cloudflare (distributed) — cached pages, WAF logs; (5) Postmark (US) — email delivery logs. Cross-border transfer mechanisms documented in RoPA. |
| **Evidence Artifact** | Data flow map (TWN-COMP-2026-001 — DPIA); RoPA (TWN-COMP-2026-004); data classification policy (TWN-COMP-2026-003) |
| **ISO 27001:2022** | A.5.9 Inventory of information and other associated assets; A.5.12 Classification of information |
| **CIS v8.1** | CIS 3.1 — Establish and Maintain a Data Management Process |
| **Status / Phase** | ✅ IMP (P1) |

---

### CM-14 — Signed Components

| Field | Detail |
|---|---|
| **Control ID** | CM-14 |
| **Control Name** | Signed Components |
| **TwinMOS Implementation** | Docker image integrity: images pulled from official Docker Hub repositories using digest pinning (`image@sha256:...`) rather than mutable tags. npm package integrity: `package-lock.json` committed and enforced — `npm ci` used in CI (not `npm install`). Subresource Integrity (SRI) hash attributes on all externally-served JavaScript and CSS resources. GitHub Actions workflows pin action versions by commit SHA. |
| **Evidence Artifact** | Docker Compose with digest pins; package-lock.json in repository; SRI implementation in HTML templates; GitHub Actions workflow SHA pins |
| **ISO 27001:2022** | A.8.26 Application security requirements; A.8.28 Secure coding |
| **CIS v8.1** | CIS 2.6 — Allowlist Authorized Libraries |
| **Status / Phase** | ✅ IMP (P1) |

---

## 6. Control Family IA — Identification and Authentication

*Purpose: Identify users, processes, and devices; authenticate them before granting access.*

---

### IA-2 — Identification and Authentication (Organizational Users)

| Field | Detail |
|---|---|
| **Control ID** | IA-2 |
| **Control Name** | Identification and Authentication (Organizational Users) |
| **TwinMOS Implementation** | All CMS administrators uniquely identified by email address. Authentication via Strapi JWT with RS256. Multi-factor authentication (TOTP via authenticator app or FIDO2 passkey) enforced for all admin accounts — cannot be disabled. Shared accounts prohibited. Service accounts use API keys (not human credentials). See TWN-SEC-2026-002 (Auth Spec) §3. |
| **Evidence Artifact** | Strapi user configuration; MFA enforcement policy; Auth Spec (TWN-SEC-2026-002); MFA enrollment audit |
| **ISO 27001:2022** | A.8.5 Secure authentication; A.5.16 Identity management |
| **CIS v8.1** | CIS 6.3 — Require MFA for Externally-Exposed Applications; CIS 6.4 — Require MFA for Administrative Access |
| **Status / Phase** | ✅ IMP (P1) |

---

### IA-3 — Device Identification and Authentication

| Field | Detail |
|---|---|
| **Control ID** | IA-3 |
| **Control Name** | Device Identification and Authentication |
| **TwinMOS Implementation** | Server-to-server authentication: (1) Strapi-to-PostgreSQL: TLS mutual authentication with client certificate; (2) Application-to-Backblaze B2: application key authentication (scoped API key); (3) Application-to-Postmark: server API token in Authorization header; (4) Cloudflare Authenticated Origin Pull: SSL client certificate verification proves request originates from Cloudflare, not attacker. |
| **Evidence Artifact** | Cloudflare Authenticated Origin Pull configuration; PostgreSQL TLS configuration; API key management documentation |
| **ISO 27001:2022** | A.8.5 Secure authentication; A.6.8 Information security event reporting |
| **CIS v8.1** | CIS 12.2 — Establish and Maintain a Secure Network Architecture |
| **Status / Phase** | ✅ IMP (P1) |

---

### IA-4 — Identifier Management

| Field | Detail |
|---|---|
| **Control ID** | IA-4 |
| **Control Name** | Identifier Management |
| **TwinMOS Implementation** | User identifiers: UUIDs for all database records (non-sequential, non-guessable). Admin account identifiers: email address (unique per account). Disabled accounts: identifier preserved but account status set to `inactive` — identifier not reused for 1 year after deactivation. API keys: randomly generated 32-byte hex strings; retired keys invalidated immediately. Partner identifiers (P2): UUID assigned on invitation; not reusable. |
| **Evidence Artifact** | Database schema (UUID primary keys); account lifecycle procedure; API key generation code; partner onboarding workflow |
| **ISO 27001:2022** | A.5.16 Identity management |
| **CIS v8.1** | CIS 5.1 — Establish and Maintain an Inventory of Accounts |
| **Status / Phase** | ✅ IMP (P1) |

---

### IA-5 — Authenticator Management

| Field | Detail |
|---|---|
| **Control ID** | IA-5 |
| **Control Name** | Authenticator Management |
| **TwinMOS Implementation** | Password policy (TWN-SEC-2026-002 §4.2): minimum 14 characters; at least 1 uppercase, 1 lowercase, 1 number, 1 symbol; breached password check against HaveIBeenPwned API on set; no dictionary words allowed; 90-day maximum password age for admin accounts; last 10 passwords remembered (no reuse). Passwords hashed using bcrypt (cost factor 12) or Argon2id. API keys: minimum 256-bit entropy; rotated every 90 days or on suspected compromise. MFA authenticator secrets: TOTP (RFC 6238) or FIDO2 passkey stored server-side encrypted at rest. |
| **Evidence Artifact** | Password policy configuration in Auth Spec (TWN-SEC-2026-002); password hashing implementation; API key rotation log; MFA enrollment records |
| **ISO 27001:2022** | A.8.5 Secure authentication; A.5.17 Authentication information |
| **CIS v8.1** | CIS 5.2 — Use Unique Passwords; CIS 5.5 — Establish and Maintain an Inventory of Service Accounts |
| **Status / Phase** | ✅ IMP (P1) |

---

### IA-6 — Authentication Feedback

| Field | Detail |
|---|---|
| **Control ID** | IA-6 |
| **Control Name** | Authentication Feedback |
| **TwinMOS Implementation** | Login error messages are generic: "Invalid email or password" — no indication of which field is incorrect (prevents account enumeration). Password field masked during entry. TOTP and passkey prompts shown only after valid email/password (does not confirm account existence on primary step failure). Lockout state indicated generically: "Account temporarily locked. Contact support." |
| **Evidence Artifact** | Login page UI code; error message string inventory; security testing verification of enumeration prevention |
| **ISO 27001:2022** | A.8.5 Secure authentication |
| **CIS v8.1** | CIS 6.2 — Establish an Access Revoking Process |
| **Status / Phase** | ✅ IMP (P1) |

---

### IA-8 — Identification and Authentication (Non-Organizational Users)

| Field | Detail |
|---|---|
| **Control ID** | IA-8 |
| **Control Name** | Identification and Authentication (Non-Organizational Users) |
| **TwinMOS Implementation** | Partner portal users (P2) authenticated via Better Auth with email/password + mandatory MFA (TOTP or passkey). Invitation-only registration — no self-signup. OAuth 2.0 with PKCE supported for partner integration (Google Workspace SSO option). E-commerce customers (P3): email/password or social login (Google, Apple) via Better Auth; guest checkout option with email collection only. All external user accounts subject to same RBAC and session controls as internal users. |
| **Evidence Artifact** | Better Auth configuration; partner invitation workflow; OAuth client registration; customer auth flow documentation |
| **ISO 27001:2022** | A.8.5 Secure authentication; A.5.15 Access control |
| **CIS v8.1** | CIS 6.3 — Require MFA for Externally-Exposed Applications |
| **Status / Phase** | 🔄 P2 (Partner) / 🔄 P3 (E-Commerce) |

---

### IA-11 — Re-Authentication

| Field | Detail |
|---|---|
| **Control ID** | IA-11 |
| **Control Name** | Re-Authentication |
| **TwinMOS Implementation** | Re-authentication required for high-risk actions: (1) Admin — password change, MFA device change, user account deletion; (2) Partner portal (P2) — order submission above threshold, pricing agreement acceptance; (3) E-Commerce (P3) — adding new payment method, changing delivery address after order placed. Re-authentication prompt requests full credential entry (not just password re-confirmation) for security-sensitive operations. |
| **Evidence Artifact** | Auth Spec (TWN-SEC-2026-002) §7; re-authentication implementation in code; security testing validation |
| **ISO 27001:2022** | A.8.5 Secure authentication |
| **CIS v8.1** | CIS 6.4 — Require MFA for Administrative Access |
| **Status / Phase** | ✅ IMP (P1) / 🔄 P2/P3 |

---

### IA-12 — Identity Proofing

| Field | Detail |
|---|---|
| **Control ID** | IA-12 |
| **Control Name** | Identity Proofing |
| **TwinMOS Implementation** | Partner portal (P2) identity proofing process: (1) Sales manager sends invitation to verified partner company email; (2) Partner provides company registration number, trade license, and authorized contact details; (3) TwinMOS sales team manually verifies against partner agreement and company documents; (4) Only then is portal account activated. E-commerce (P3): email verification link required before first order; address verification via payment provider (AVS). |
| **Evidence Artifact** | Partner onboarding workflow documentation; identity verification checklist; partner application form; approval records |
| **ISO 27001:2022** | A.5.16 Identity management |
| **CIS v8.1** | CIS 6.1 — Establish an Access Granting Process |
| **Status / Phase** | 🔄 P2 / 🔄 P3 |

---

## 7. Control Family IR — Incident Response

*Purpose: Establish incident response capabilities including detection, analysis, containment, and recovery.*

---

### IR-1 — Incident Response Policy

| Field | Detail |
|---|---|
| **Control ID** | IR-1 |
| **Control Name** | Incident Response Policy and Procedures |
| **TwinMOS Implementation** | Security Incident Response Plan documented in TWN-OPS-2026-003 (Security Incident Response Plan). Policy covers: incident classification (P0–P4 severity), roles and responsibilities, detection/reporting channels, escalation path, regulatory notification requirements (GDPR 72h, UAE PDPL, PCI DSS). Policy reviewed annually and after any P0 or P1 incident. |
| **Evidence Artifact** | Security Incident Response Plan (TWN-OPS-2026-003); annual review record; incident response training records |
| **ISO 27001:2022** | A.5.24 Information security incident management planning and preparation |
| **CIS v8.1** | CIS 17.1 — Designate Personnel to Manage Incident Handling |
| **Status / Phase** | ✅ IMP (P1) |

---

### IR-4 — Incident Handling

| Field | Detail |
|---|---|
| **Control ID** | IR-4 |
| **Control Name** | Incident Handling |
| **TwinMOS Implementation** | Six-phase NIST incident response lifecycle implemented per TWN-OPS-2026-003: (1) Preparation — response team trained, tools ready, runbooks maintained; (2) Detection and Analysis — Sentry alerts, UptimeRobot, Cloudflare security events; (3) Containment — short-term (block IP, disable account) and long-term (patch, reconfigure); (4) Eradication — root cause remediation, malware removal; (5) Recovery — service restoration with validation; (6) Post-Incident — lessons learned, threat model update (TWN-SEC-2026-010). |
| **Evidence Artifact** | Incident Response Plan (TWN-OPS-2026-003); incident log; containment runbooks; post-incident review templates |
| **ISO 27001:2022** | A.5.26 Response to information security incidents |
| **CIS v8.1** | CIS 17.4 — Establish and Maintain an Incident Response Process |
| **Status / Phase** | ✅ IMP (P1) |

---

### IR-5 — Incident Monitoring

| Field | Detail |
|---|---|
| **Control ID** | IR-5 |
| **Control Name** | Incident Monitoring |
| **TwinMOS Implementation** | Active incident tracking in security incident log (maintained by Security Lead). Each incident tracked with: incident ID, date/time detected, date/time reported, severity, type, affected systems, current status, responsible owner, timeline of actions taken, resolution date. Incident metrics reviewed monthly: mean time to detect (MTTD), mean time to respond (MTTR), incidents by category, open vs. closed incidents. |
| **Evidence Artifact** | Incident tracking log (spreadsheet or issue tracker); monthly security review with incident KPIs |
| **ISO 27001:2022** | A.5.25 Assessment and decision on information security events; A.5.26 Response to information security incidents |
| **CIS v8.1** | CIS 17.6 — Define Mechanisms for Communicating During Incident Response |
| **Status / Phase** | ✅ IMP (P1) |

---

### IR-6 — Incident Reporting

| Field | Detail |
|---|---|
| **Control ID** | IR-6 |
| **Control Name** | Incident Reporting |
| **TwinMOS Implementation** | Internal reporting: Security incident reported to Security Lead within 1 hour of detection; escalated to TwinMOS Chairman (Mohd Mazharul Islam) within 4 hours for P0/P1. External reporting: (1) GDPR — supervisory authority notification within 72 hours if personal data breach (TWN-OPS-2026-003 §7); (2) UAE PDPL — UAE Data Office notification within 72 hours; (3) PCI DSS (P3) — Stripe notified immediately; card brands within 24 hours. Public disclosure policy: coordinated via Legal Counsel; status page updated for service-impacting incidents. |
| **Evidence Artifact** | Incident Response Plan §7 (notification procedures); regulatory notification templates; supervisory authority contact list |
| **ISO 27001:2022** | A.5.24 Information security incident management planning; A.6.8 Information security event reporting |
| **CIS v8.1** | CIS 17.6 — Define Mechanisms for Communicating During Incident Response |
| **Status / Phase** | ✅ IMP (P1) |

---

### IR-8 — Incident Response Plan

| Field | Detail |
|---|---|
| **Control ID** | IR-8 |
| **Control Name** | Incident Response Plan |
| **TwinMOS Implementation** | Formal written Incident Response Plan (TWN-OPS-2026-003) distributed to all incident response team members. Plan includes: incident classification matrix (20+ incident categories), RACI matrix, communication tree, regulatory notification checklist, forensic evidence preservation guidance, media/PR statement templates, service restoration procedures. Plan tested via annual tabletop exercise (scenario-based). Last updated: 2 May 2026. |
| **Evidence Artifact** | Incident Response Plan document (TWN-OPS-2026-003); distribution list; tabletop exercise records; annual review sign-off |
| **ISO 27001:2022** | A.5.24 Information security incident management planning and preparation |
| **CIS v8.1** | CIS 17.4 — Establish and Maintain an Incident Response Process |
| **Status / Phase** | ✅ IMP (P1) |

---

### IR-10 — Integrated Information Security Analysis Team

| Field | Detail |
|---|---|
| **Control ID** | IR-10 |
| **Control Name** | Integrated Information Security Analysis Team |
| **TwinMOS Implementation** | Cross-functional incident response team: Security Lead (Unisoft), DevOps Engineer (Unisoft), TwinMOS IT Lead, TwinMOS Legal Counsel, TwinMOS GM Dubai (executive sponsor). External resources: retained external security firm for P0 incident forensics (TWN-OPS-2026-001 vendor relationship); Cloudflare support for DDoS incidents; Stripe support for payment incidents (P3). Team contact list and escalation matrix maintained in incident response plan (P3). |
| **Evidence Artifact** | Incident response team roster (TWN-OPS-2026-003); contact list; external vendor agreements |
| **ISO 27001:2022** | A.5.24 Information security incident management planning and preparation |
| **CIS v8.1** | CIS 17.1 — Designate Personnel to Manage Incident Handling |
| **Status / Phase** | 🔄 P2 (formal retainer) |

---

## 8. Control Family SC — System and Communications Protection

*Purpose: Protect system communications internally and with external systems.*

---

### SC-5 — Denial-of-Service Protection

| Field | Detail |
|---|---|
| **Control ID** | SC-5 |
| **Control Name** | Denial-of-Service Protection |
| **TwinMOS Implementation** | Multi-layer DDoS protection per TWN-OPS-2026-006 (DDoS Mitigation Plan): (1) Cloudflare — unmetered DDoS protection at network layer; L7 DDoS mitigation with adaptive rules; (2) Cloudflare WAF — rate limiting per IP and endpoint; (3) Application layer — server-side rate limiting via middleware; (4) CDN-based traffic absorption for volumetric attacks; (5) Hetzner — upstream ISP-level filtering for large volumetric attacks; (6) Architecture — static asset serving via CDN reduces origin server load. |
| **Evidence Artifact** | Cloudflare DDoS protection configuration; WAF rate-limiting rules; rate limiting middleware implementation; DDoS Mitigation Plan (TWN-OPS-2026-006) |
| **ISO 27001:2022** | A.8.20 Networks security; A.5.29 Information security during disruption |
| **CIS v8.1** | CIS 13.4 — Perform Traffic Filtering Between Network Segments |
| **Status / Phase** | ✅ IMP (P1) |

---

### SC-7 — Boundary Protection

| Field | Detail |
|---|---|
| **Control ID** | SC-7 |
| **Control Name** | Boundary Protection |
| **TwinMOS Implementation** | Network boundary protection at four layers: (1) Cloudflare edge — all internet traffic enters via Cloudflare; origin IP not exposed; (2) Hetzner firewall — inbound rules allow only Cloudflare IP ranges (HTTPS) and Unisoft DevOps IPs (SSH); all other inbound traffic blocked; (3) Docker network — containers communicate on internal Docker network only; PostgreSQL port not exposed to host; (4) PostgreSQL — `listen_addresses` set to `localhost` only; no external database access. |
| **Evidence Artifact** | Hetzner firewall rule export; Docker network configuration; PostgreSQL pg_hba.conf; Cloudflare IP list implementation |
| **ISO 27001:2022** | A.8.20 Networks security; A.8.22 Segregation in networks |
| **CIS v8.1** | CIS 12.2 — Establish and Maintain a Secure Network Architecture; CIS 4.4 — Implement and Manage a Firewall on Servers |
| **Status / Phase** | ✅ IMP (P1) |

---

### SC-8 — Transmission Confidentiality and Integrity

| Field | Detail |
|---|---|
| **Control ID** | SC-8 |
| **Control Name** | Transmission Confidentiality and Integrity |
| **TwinMOS Implementation** | All external communications use TLS 1.3 (TLS 1.2 as minimum fallback with secure cipher suites only). HSTS enforced with `max-age=31536000; includeSubDomains; preload`. All internal service-to-service communications over TLS. Cloudflare SSL mode: Full (Strict) — validates Hetzner origin certificate. Database connections: TLS enforced, `sslmode=verify-full`. Backblaze B2: HTTPS only. Postmark: TLS SMTP relay. Certificate transparency monitoring enabled via Cloudflare. SSL Labs rating target: A+. |
| **Evidence Artifact** | Cloudflare SSL/TLS configuration; HSTS header verification; nginx TLS configuration; SSL Labs scan result; certificate transparency log monitoring |
| **ISO 27001:2022** | A.8.24 Use of cryptography; A.8.20 Networks security |
| **CIS v8.1** | CIS 3.10 — Encrypt Sensitive Data in Transit |
| **Status / Phase** | ✅ IMP (P1) |

---

### SC-12 — Cryptographic Key Establishment and Management

| Field | Detail |
|---|---|
| **Control ID** | SC-12 |
| **Control Name** | Cryptographic Key Establishment and Management |
| **TwinMOS Implementation** | Key management per TWN-SEC-2026-008 (Key Management Plan): (1) JWT signing: RS256 asymmetric key pair; 4096-bit RSA; rotated every 180 days; (2) TLS: Cloudflare-managed certificates (auto-renewed via Let's Encrypt + Cloudflare CA); (3) Database encryption keys: managed by PostgreSQL with OS-level keyring; (4) API keys: 256-bit random; managed in Coolify secrets (encrypted at rest); (5) Backblaze B2 application keys: scoped, rotated every 90 days. Key compromise response: immediate rotation within 4 hours per TWN-SEC-2026-008 §6. |
| **Evidence Artifact** | Key Management Plan (TWN-SEC-2026-008); key rotation log; certificate renewal record; Coolify secrets configuration |
| **ISO 27001:2022** | A.8.24 Use of cryptography; A.8.25 Secure development lifecycle |
| **CIS v8.1** | CIS 3.11 — Encrypt Sensitive Data at Rest |
| **Status / Phase** | ✅ IMP (P1) |

---

### SC-13 — Cryptographic Protection

| Field | Detail |
|---|---|
| **Control ID** | SC-13 |
| **Control Name** | Cryptographic Protection |
| **TwinMOS Implementation** | Approved cryptographic algorithms per TWN-SEC-2026-007 (Encryption Strategy): TLS — TLS 1.3 (ChaCha20-Poly1305, AES-256-GCM); Symmetric encryption — AES-256-GCM; Asymmetric — RSA-4096 or ECDSA P-384; Hashing — SHA-256 / SHA-384; Password hashing — Argon2id (m=65536, t=3, p=4) or bcrypt (cost=12); HMAC — HMAC-SHA256. Weak algorithms prohibited: MD5, SHA-1, DES, RC4, RSA <2048 bits, TLS 1.0/1.1. FIPS 140-2 validated modules used where available via platform defaults. |
| **Evidence Artifact** | Encryption Strategy (TWN-SEC-2026-007); algorithm allowlist; TLS configuration validation; code review of cryptographic implementations |
| **ISO 27001:2022** | A.8.24 Use of cryptography |
| **CIS v8.1** | CIS 3.10 — Encrypt Sensitive Data in Transit; CIS 3.11 — Encrypt Sensitive Data at Rest |
| **Status / Phase** | ✅ IMP (P1) |

---

### SC-17 — Public Key Infrastructure Certificates

| Field | Detail |
|---|---|
| **Control ID** | SC-17 |
| **Control Name** | Public Key Infrastructure Certificates |
| **TwinMOS Implementation** | TLS certificates for `twinmos.com` and all subdomains issued by Cloudflare CA (backed by Let's Encrypt) with auto-renewal 30 days before expiry. Certificate monitoring: UptimeRobot certificate expiry alerts (30-day and 7-day warnings); Cloudflare certificate transparency monitoring alerts on any unauthorized certificate issuance for twinmos.com domains. CAA DNS record set to authorize only Cloudflare CA and Let's Encrypt. Certificate pinning not implemented (mobile HPKP deprecated). |
| **Evidence Artifact** | Cloudflare certificate configuration; CAA DNS record; UptimeRobot certificate monitoring; CT log monitoring configuration |
| **ISO 27001:2022** | A.8.24 Use of cryptography |
| **CIS v8.1** | CIS 12.2 — Establish and Maintain a Secure Network Architecture |
| **Status / Phase** | ✅ IMP (P1) |

---

### SC-28 — Protection of Information at Rest

| Field | Detail |
|---|---|
| **Control ID** | SC-28 |
| **Control Name** | Protection of Information at Rest |
| **TwinMOS Implementation** | Data at rest encryption per TWN-SEC-2026-007 (Encryption Strategy): (1) Hetzner VPS — LUKS full disk encryption on all persistent volumes; (2) PostgreSQL — Transparent Data Encryption (TDE) at tablespace level for sensitive tables (user credentials, form submissions); (3) Backblaze B2 — server-side AES-256 encryption at rest (B2 managed keys); (4) Backups — encrypted with AES-256 before off-site storage; (5) Application secrets — encrypted at rest in Coolify secrets vault. |
| **Evidence Artifact** | Encryption Strategy (TWN-SEC-2026-007); Hetzner disk encryption configuration; PostgreSQL TDE configuration; Backblaze encryption confirmation |
| **ISO 27001:2022** | A.8.24 Use of cryptography |
| **CIS v8.1** | CIS 3.11 — Encrypt Sensitive Data at Rest |
| **Status / Phase** | ✅ IMP (P1) |

---

### SC-39 — Process Isolation

| Field | Detail |
|---|---|
| **Control ID** | SC-39 |
| **Control Name** | Process Isolation |
| **TwinMOS Implementation** | Container isolation: each application component (Astro frontend, Strapi API, PostgreSQL, Meilisearch) runs in a separate Docker container with its own network namespace. Docker network segmentation: only defined service-to-service connections allowed; PostgreSQL container not exposed outside Docker internal network. Non-root container users: all containers run as non-root (UID 1000+). Read-only filesystems where applicable. Container resource limits (CPU, memory) prevent resource exhaustion from impacting sibling containers. |
| **Evidence Artifact** | Docker Compose configuration; Docker network policy; container resource limits; security scan of Docker configuration |
| **ISO 27001:2022** | A.8.22 Segregation in networks; A.8.31 Separation of development, test and production environments |
| **CIS v8.1** | CIS 4.6 — Securely Manage Enterprise Assets and Software |
| **Status / Phase** | ✅ IMP (P1) |

---

### SC-45 — System Time Synchronization

| Field | Detail |
|---|---|
| **Control ID** | SC-45 |
| **Control Name** | System Time Synchronization |
| **TwinMOS Implementation** | All Hetzner VPS instances synchronized to NTP (Network Time Protocol) servers. Hetzner provides NTP by default. All application logs use UTC timestamps (ISO 8601 format). Database `TIMESTAMP WITH TIME ZONE` data type used for all time-sensitive records. Time synchronization verified in system health checks. Accurate timestamps are critical for audit log integrity and GDPR breach notification timing. |
| **Evidence Artifact** | NTP configuration (`timedatectl`); application logging configuration (UTC enforcement); database schema (timestamp fields) |
| **ISO 27001:2022** | A.8.15 Logging |
| **CIS v8.1** | CIS 8.4 — Standardize Time Synchronization |
| **Status / Phase** | ✅ IMP (P1) |

---

## 9. Control Family SI — System and Information Integrity

*Purpose: Identify, report, and correct information system flaws; protect against malicious code.*

---

### SI-2 — Flaw Remediation

| Field | Detail |
|---|---|
| **Control ID** | SI-2 |
| **Control Name** | Flaw Remediation |
| **TwinMOS Implementation** | Vulnerability remediation per TWN-OPS-2026-002 (Vulnerability Management Plan) SLAs: Critical — patch within 24 hours; High — patch within 7 days; Medium — patch within 30 days; Low — patch within 90 days. Emergency patching process: staging deployment, smoke test, production deployment within maintenance window (or immediately for Critical). All patches tracked in vulnerability register. Patch verification: automated re-scan post-remediation. |
| **Evidence Artifact** | Vulnerability Management Plan (TWN-OPS-2026-002); vulnerability tracking register; patching log; post-patch scan results |
| **ISO 27001:2022** | A.8.8 Management of technical vulnerabilities |
| **CIS v8.1** | CIS 7.1 — Establish and Maintain a Vulnerability Management Process |
| **Status / Phase** | ✅ IMP (P1) |

---

### SI-3 — Malicious Code Protection

| Field | Detail |
|---|---|
| **Control ID** | SI-3 |
| **Control Name** | Malicious Code Protection |
| **TwinMOS Implementation** | Malicious code protection at multiple layers: (1) File uploads — MIME type validation, file extension allowlist, ClamAV scan on upload before storing to B2; (2) Dependencies — Snyk and npm audit scan for malicious/compromised packages in CI (TWN-OPS-2026-004); (3) Supply chain — SRI for external scripts, Docker image digest pinning; (4) WAF — Cloudflare blocks known malware delivery patterns; (5) Monitoring — Sentry detects anomalous application behavior; (6) Docker container isolation limits blast radius of any compromise. |
| **Evidence Artifact** | File upload validation code; ClamAV integration; Snyk CI scan results; SRI implementation; WAF malware ruleset configuration |
| **ISO 27001:2022** | A.8.7 Protection against malware |
| **CIS v8.1** | CIS 10.1 — Deploy and Maintain Anti-Malware Software |
| **Status / Phase** | ✅ IMP (P1) |

---

### SI-4 — System Monitoring

| Field | Detail |
|---|---|
| **Control ID** | SI-4 |
| **Control Name** | System Monitoring |
| **TwinMOS Implementation** | Multi-layer monitoring: (1) Availability — UptimeRobot (1-minute checks on twinmos.com, Strapi API health endpoint, Partner Portal health); (2) Error monitoring — Sentry (real-time error tracking, performance monitoring, security events); (3) Traffic/security — Cloudflare Analytics and WAF event log; (4) Infrastructure — Hetzner server metrics (CPU, memory, disk, network); (5) Log monitoring — automated alerting on security-relevant log patterns; (6) Uptime SLA: 99.9% target. Alerts route to DevOps on-call via PagerDuty or equivalent. |
| **Evidence Artifact** | UptimeRobot configuration; Sentry project setup; Cloudflare analytics; monitoring runbook; alert routing configuration |
| **ISO 27001:2022** | A.8.16 Monitoring activities |
| **CIS v8.1** | CIS 8.11 — Conduct Audit Log Reviews; CIS 13.1 — Centralize Security Event Alerting |
| **Status / Phase** | ✅ IMP (P1) |

---

### SI-5 — Security Alerts, Advisories, and Directives

| Field | Detail |
|---|---|
| **Control ID** | SI-5 |
| **Control Name** | Security Alerts, Advisories, and Directives |
| **TwinMOS Implementation** | Security intelligence sources monitored: (1) Dependabot and Snyk — CVE alerts for all npm dependencies (TWN-OPS-2026-004); (2) Strapi security advisories — subscribe to Strapi GitHub security advisories; (3) Node.js security release announcements — subscribed via Node.js official RSS/newsletter; (4) Cloudflare security blog — monitored for CDN/WAF updates; (5) CISA Known Exploited Vulnerabilities (KEV) catalog — weekly review; (6) NVD (National Vulnerability Database) — automated checks via Dependabot. Response: advisory received → assessed against TwinMOS inventory → remediation ticket created if applicable. |
| **Evidence Artifact** | Dependency scanning configuration (TWN-OPS-2026-004); Strapi security advisory subscription; CISA KEV review log; advisory response records |
| **ISO 27001:2022** | A.8.8 Management of technical vulnerabilities; A.5.7 Threat intelligence |
| **CIS v8.1** | CIS 7.1 — Establish and Maintain a Vulnerability Management Process |
| **Status / Phase** | ✅ IMP (P1) |

---

### SI-7 — Software, Firmware, and Information Integrity

| Field | Detail |
|---|---|
| **Control ID** | SI-7 |
| **Control Name** | Software, Firmware, and Information Integrity |
| **TwinMOS Implementation** | Software integrity verification: (1) npm `package-lock.json` locked and verified via `npm ci` in CI; (2) Docker image digest pinning (no mutable tags in production); (3) GitHub branch protection — direct push to `main` blocked; all changes require PR + review + CI pass; (4) Deployment integrity — Coolify deployment checksums verified before activation; (5) Static assets — build-time integrity manifest generated and verified at CDN cache load; (6) Database backup integrity — checksums generated and verified before restore. |
| **Evidence Artifact** | package-lock.json in repository; Docker Compose digest references; GitHub branch protection rules; Coolify deployment log; backup checksum records |
| **ISO 27001:2022** | A.8.8 Management of technical vulnerabilities; A.8.28 Secure coding |
| **CIS v8.1** | CIS 2.6 — Allowlist Authorized Libraries; CIS 2.7 — Allowlist Authorized Software |
| **Status / Phase** | ✅ IMP (P1) |

---

### SI-10 — Information Input Validation

| Field | Detail |
|---|---|
| **Control ID** | SI-10 |
| **Control Name** | Information Input Validation |
| **TwinMOS Implementation** | Input validation at three layers: (1) Client-side — HTML5 constraints + React form validation (UX only, not security control); (2) API middleware — Zod schema validation on all API inputs; all parameters type-checked, length-limited, and pattern-validated before processing; (3) Database — parameterized queries (Knex.js ORM) prevent SQL injection regardless of API-layer validation. Specific validations: email addresses (RFC 5322), phone numbers (international format), URLs (allow-listed schemes), file uploads (MIME + extension allowlist). Validation failures: 400 response with generic error message (no schema disclosure). |
| **Evidence Artifact** | Zod schema definitions in codebase; Knex.js query parameterization; input validation test cases; penetration test results |
| **ISO 27001:2022** | A.8.26 Application security requirements; A.8.28 Secure coding |
| **CIS v8.1** | CIS 16.1 — Establish and Maintain a Secure Application Development Process |
| **Status / Phase** | ✅ IMP (P1) |

---

### SI-12 — Information Management and Retention

| Field | Detail |
|---|---|
| **Control ID** | SI-12 |
| **Control Name** | Information Management and Retention |
| **TwinMOS Implementation** | Data retention per TWN-COMP-2026-003 (Data Classification Policy) and GDPR requirements: Contact form submissions — 3 years; User accounts — duration of relationship + 2 years; Order records (P3) — 7 years (financial regulation); Warranty records (P2) — warranty period + 2 years; Security logs — 90 days hot, 1 year archive; Marketing consents — retained until withdrawal + 3 years (proof of consent). Automated deletion schedule implemented for expired records. Data deletion request process documented in TWN-COMP-2026-005 (DSAR Processing Workflow). |
| **Evidence Artifact** | Data Classification Policy (TWN-COMP-2026-003); DSAR Workflow (TWN-COMP-2026-005); automated deletion schedule implementation; retention audit |
| **ISO 27001:2022** | A.5.33 Protection of records; A.5.34 Privacy and protection of PII |
| **CIS v8.1** | CIS 3.1 — Establish and Maintain a Data Management Process |
| **Status / Phase** | ✅ IMP (P1) |

---

### SI-16 — Memory Protection

| Field | Detail |
|---|---|
| **Control ID** | SI-16 |
| **Control Name** | Memory Protection |
| **TwinMOS Implementation** | Memory protection at infrastructure and application levels: (1) Node.js/V8 heap limits configured to prevent memory exhaustion (max-old-space-size set in container environment); (2) Docker container memory limits enforced (prevents one container consuming all host memory); (3) GraphQL query depth and complexity limits prevent deep recursion attacks; (4) Meilisearch index size limits prevent runaway indexing; (5) File upload size limits enforced at Nginx (50MB) and application level (10MB per file); (6) JSON payload size limits on Strapi API (1MB). |
| **Evidence Artifact** | Docker Compose resource limits; Node.js startup configuration; Nginx client_max_body_size; Strapi body parser configuration |
| **ISO 27001:2022** | A.8.26 Application security requirements |
| **CIS v8.1** | CIS 4.6 — Securely Manage Enterprise Assets and Software |
| **Status / Phase** | ✅ IMP (P1) |

---

## 10. Control Inheritance Matrix

Controls that apply across multiple system tiers:

| Control | Public Site | CMS Admin | Partner Portal (P2) | E-Commerce (P3) | Infrastructure |
|---|---|---|---|---|---|
| AC-3 (Access Enforcement) | ✅ | ✅ | ✅ | ✅ | ✅ |
| AU-2 (Event Logging) | ✅ | ✅ | ✅ | ✅ | ✅ |
| SC-8 (TLS) | ✅ | ✅ | ✅ | ✅ | ✅ |
| SC-5 (DDoS Protection) | ✅ | ✅ | ✅ | ✅ | ✅ |
| SI-2 (Flaw Remediation) | ✅ | ✅ | ✅ | ✅ | ✅ |
| SI-10 (Input Validation) | ✅ | ✅ | ✅ | ✅ | N/A |
| IA-2 (MFA) | N/A | ✅ | ✅ | Optional | N/A |
| SC-28 (Encryption at Rest) | N/A | ✅ | ✅ | ✅ | ✅ |
| CM-2 (Baseline Config) | N/A | N/A | N/A | N/A | ✅ |

---

## 11. Compliance Cross-Reference Summary

| NIST SP 800-53 Control | ISO 27001:2022 Annex A | CIS v8.1 Safeguard | PCI DSS 4.0 Req |
|---|---|---|---|
| AC-2 | A.5.15, A.5.16, A.5.18 | CIS 5.1, 5.3 | Req 7.1 |
| AC-3 | A.5.15, A.8.3 | CIS 6.4, 6.8 | Req 7.2 |
| AC-6 | A.5.15, A.5.18, A.8.2 | CIS 5.4, 6.8 | Req 7.1 |
| AU-2 | A.8.15, A.8.16 | CIS 8.2, 8.5 | Req 10.2 |
| AU-9 | A.8.15 | CIS 8.3 | Req 10.3 |
| AU-11 | A.5.33 | CIS 8.3 | Req 10.7 |
| CM-3 | A.8.32 | CIS 4.1 | Req 6.5 |
| CM-6 | A.8.9 | CIS 4.1, 4.2 | Req 2.2 |
| IA-2 | A.8.5, A.5.16 | CIS 6.3, 6.4 | Req 8.3 |
| IA-5 | A.8.5, A.5.17 | CIS 5.2, 5.5 | Req 8.3 |
| IR-4 | A.5.26 | CIS 17.4 | Req 12.10 |
| IR-6 | A.5.24, A.6.8 | CIS 17.6 | Req 12.10 |
| SC-5 | A.8.20, A.5.29 | CIS 13.4 | Req 6.4 |
| SC-7 | A.8.20, A.8.22 | CIS 12.2, 4.4 | Req 1.2 |
| SC-8 | A.8.24, A.8.20 | CIS 3.10 | Req 4.2 |
| SC-13 | A.8.24 | CIS 3.10, 3.11 | Req 4.2, 3.5 |
| SC-28 | A.8.24 | CIS 3.11 | Req 3.5 |
| SI-2 | A.8.8 | CIS 7.1 | Req 6.3 |
| SI-3 | A.8.7 | CIS 10.1 | Req 5.1 |
| SI-4 | A.8.16 | CIS 8.11, 13.1 | Req 10.6 |
| SI-10 | A.8.26, A.8.28 | CIS 16.1 | Req 6.2 |

---

## 12. Implementation Roadmap by Phase

### Phase 1 (Current) — Core Platform Security

| Priority | Control | Description |
|---|---|---|
| P0 | IA-2, AC-3, AC-6 | MFA + RBAC for CMS admin |
| P0 | SC-8, SC-13 | TLS 1.3 everywhere |
| P0 | SI-10 | Input validation (Zod + parameterized queries) |
| P0 | AU-2, AU-9 | Audit logging |
| P0 | SC-5, SC-7 | DDoS + boundary protection |
| P1 | CM-2, CM-3 | IaC + change control |
| P1 | SI-2, SI-3 | Vulnerability management + malware protection |
| P1 | IR-4, IR-6, IR-8 | Incident response capability |

### Phase 2 — Partner Portal

| Priority | Control | Description |
|---|---|---|
| P0 | IA-8, IA-12 | Partner identity proofing + authentication |
| P0 | AC-2, AC-3 | Partner account management + RBAC |
| P0 | AU-14 | Session audit for partner portal |
| P1 | IR-10 | Formalize external security retainer |

### Phase 3 — E-Commerce

| Priority | Control | Description |
|---|---|---|
| P0 | SC-13, SC-28 | PCI DSS-compliant cryptographic controls |
| P0 | IA-8 | Customer authentication |
| P0 | AU-11 | 7-year financial audit record retention |
| P0 | SI-12 | Order record retention compliance |

---

## 13. Governance & Evidence Management

### 13.1 Control Review Schedule

| Review Type | Frequency | Owner | Trigger |
|---|---|---|---|
| Full catalog review | Annual | CISO / Security Architect | Calendar |
| Compliance mapping update | Annual | Legal Counsel + Security | Regulatory change |
| Control effectiveness assessment | Semi-annual | Security Lead | Calendar |
| New control addition | On-demand | Development Lead | New technology, new threat |
| Post-incident review | Post-incident | CISO | Any P0/P1 security incident |

### 13.2 Evidence Collection

| Evidence Type | Collection Method | Storage | Retention |
|---|---|---|---|
| Configuration exports | Automated snapshot monthly | Secure file store | 1 year |
| Scan results (SAST, DAST, deps) | CI pipeline artifacts | GitHub Actions artifacts | 90 days |
| Penetration test reports | Annual external test | Encrypted document store | 3 years |
| Access review records | Quarterly manual review | Compliance folder | 3 years |
| Incident records | Per-incident documentation | Incident log | 5 years |
| Training records | Annual training platform export | HR system | Duration of employment + 2 years |

---

## Appendix A — Control Status Summary

| Control ID | Name | Status | Phase |
|---|---|---|---|
| AC-1 | Access Control Policy | ✅ IMP | P1 |
| AC-2 | Account Management | ✅ IMP | P1 |
| AC-3 | Access Enforcement | ✅ IMP | P1 |
| AC-4 | Information Flow Enforcement | ✅ IMP | P1 |
| AC-6 | Least Privilege | ✅ IMP | P1 |
| AC-7 | Unsuccessful Logon Attempts | ✅ IMP | P1 |
| AC-11 | Session Lock | ✅ IMP | P1 |
| AC-14 | Permitted Actions w/o Auth | ✅ IMP | P1 |
| AC-17 | Remote Access | ✅ IMP | P1 |
| AC-22 | Publicly Accessible Content | ✅ IMP | P1 |
| AU-2 | Event Logging | ✅ IMP | P1 |
| AU-3 | Content of Audit Records | ✅ IMP | P1 |
| AU-6 | Audit Review and Reporting | ✅ IMP | P1 |
| AU-9 | Protection of Audit Information | ✅ IMP | P1 |
| AU-11 | Audit Record Retention | ✅ IMP | P1 |
| AU-12 | Audit Record Generation | ✅ IMP | P1 |
| AU-14 | Session Audit | 🔄 P2 | P2 |
| CM-2 | Baseline Configuration | ✅ IMP | P1 |
| CM-3 | Configuration Change Control | ✅ IMP | P1 |
| CM-6 | Configuration Settings | ✅ IMP | P1 |
| CM-7 | Least Functionality | ✅ IMP | P1 |
| CM-8 | System Component Inventory | ✅ IMP | P1 |
| CM-11 | User-Installed Software | ✅ IMP | P1 |
| CM-12 | Information Location | ✅ IMP | P1 |
| CM-14 | Signed Components | ✅ IMP | P1 |
| IA-2 | Identification & Auth (Org) | ✅ IMP | P1 |
| IA-3 | Device Identification | ✅ IMP | P1 |
| IA-4 | Identifier Management | ✅ IMP | P1 |
| IA-5 | Authenticator Management | ✅ IMP | P1 |
| IA-6 | Authentication Feedback | ✅ IMP | P1 |
| IA-8 | Identification & Auth (Non-Org) | 🔄 P2/P3 | P2/P3 |
| IA-11 | Re-Authentication | ✅ IMP | P1 |
| IA-12 | Identity Proofing | 🔄 P2/P3 | P2/P3 |
| IR-1 | Incident Response Policy | ✅ IMP | P1 |
| IR-4 | Incident Handling | ✅ IMP | P1 |
| IR-5 | Incident Monitoring | ✅ IMP | P1 |
| IR-6 | Incident Reporting | ✅ IMP | P1 |
| IR-8 | Incident Response Plan | ✅ IMP | P1 |
| IR-10 | Security Analysis Team | 🔄 P2 | P2 |
| SC-5 | DoS Protection | ✅ IMP | P1 |
| SC-7 | Boundary Protection | ✅ IMP | P1 |
| SC-8 | Transmission Confidentiality | ✅ IMP | P1 |
| SC-12 | Cryptographic Key Management | ✅ IMP | P1 |
| SC-13 | Cryptographic Protection | ✅ IMP | P1 |
| SC-17 | PKI Certificates | ✅ IMP | P1 |
| SC-28 | Protection at Rest | ✅ IMP | P1 |
| SC-39 | Process Isolation | ✅ IMP | P1 |
| SC-45 | System Time Synchronization | ✅ IMP | P1 |
| SI-2 | Flaw Remediation | ✅ IMP | P1 |
| SI-3 | Malicious Code Protection | ✅ IMP | P1 |
| SI-4 | System Monitoring | ✅ IMP | P1 |
| SI-5 | Security Alerts & Advisories | ✅ IMP | P1 |
| SI-7 | Software Integrity | ✅ IMP | P1 |
| SI-10 | Information Input Validation | ✅ IMP | P1 |
| SI-12 | Information Management | ✅ IMP | P1 |
| SI-16 | Memory Protection | ✅ IMP | P1 |

---

## Appendix B — Acronyms & Definitions

| Term | Definition |
|---|---|
| **RBAC** | Role-Based Access Control |
| **MFA** | Multi-Factor Authentication |
| **TOTP** | Time-Based One-Time Password (RFC 6238) |
| **PKCE** | Proof Key for Code Exchange (OAuth 2.0 extension) |
| **SBOM** | Software Bill of Materials |
| **SRI** | Subresource Integrity |
| **IDOR** | Insecure Direct Object Reference |
| **LUKS** | Linux Unified Key Setup (disk encryption) |
| **TDE** | Transparent Data Encryption |
| **HSTS** | HTTP Strict Transport Security |
| **CSP** | Content Security Policy |
| **IaC** | Infrastructure as Code |
| **SAST** | Static Application Security Testing |
| **DAST** | Dynamic Application Security Testing |
| **CVE** | Common Vulnerabilities and Exposures |
| **NVD** | National Vulnerability Database |
| **KEV** | Known Exploited Vulnerabilities (CISA catalog) |
| **MTTR** | Mean Time to Respond |
| **MTTD** | Mean Time to Detect |
| **PITR** | Point-in-Time Recovery |
| **CHD** | Cardholder Data |
| **PAN** | Primary Account Number |

---

*Document ID: TWN-SEC-2026-011 | Version 1.0.0 | Classification: Confidential | © 2026 TwinMOS Technologies. All rights reserved.*
