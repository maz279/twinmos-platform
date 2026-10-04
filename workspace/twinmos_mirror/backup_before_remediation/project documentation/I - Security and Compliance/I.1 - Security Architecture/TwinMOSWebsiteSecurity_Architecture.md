# TwinMOS Website — Security Architecture Document

**Document Reference:** TWN-SEC-2026-001  
**Document Version:** 1.0  
**Status:** FINAL — for Unisoft Engineering Sign-Off  
**Date:** 2 May 2026  
**Prepared by:** TwinMOS Digital Transformation Team  
**Owner:** IT/Technical Lead (Implementation) / Legal Counsel (Compliance)  
**Audience:** Unisoft engineering team, TwinMOS leadership, Security auditors, Compliance officers  
**Classification:** CONFIDENTIAL — TwinMOS + Unisoft Internal Use  
**Synchronized With:** RFP v3.0, BRD v3.0, URD v3.0, Tech Stack v1.1, Content Map v1.0, Implementation Strategy v3.0

---

## Change Log

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | 2 May 2026 | Initial release — standalone security architecture derived from Tech Stack §18, §9, §19 and BRD §21 |

---

## Document Governance

| Role | Name | Sign-Off | Date |
|------|------|----------|------|
| Project Sponsor (Chairman) | Mohd Mazharul Islam | _______________ | _________ |
| Operational Sponsor (GM Dubai) | Robiul Islam | _______________ | _________ |
| IT/Technical Lead | (TBC) | _______________ | _________ |
| Legal Counsel | (TBC) | _______________ | _________ |
| Unisoft Team Lead | (TBC) | _______________ | _________ |
| Unisoft Senior Developer | (TBC) | _______________ | _________ |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Security Architecture Overview](#2-security-architecture-overview)
3. [Trust Boundaries & Zones](#3-trust-boundaries--zones)
4. [Network & Edge Security](#4-network--edge-security)
5. [Application Security](#5-application-security)
6. [Authentication, Authorization & Identity](#6-authentication-authorization--identity)
7. [Data Protection & Encryption](#7-data-protection--encryption)
8. [Infrastructure Security](#8-infrastructure-security)
9. [Secrets Management](#9-secrets-management)
10. [Monitoring, Logging & Audit](#10-monitoring-logging--audit)
11. [Third-Party Security](#11-third-party-security)
12. [Security Testing & Validation](#12-security-testing--validation)
13. [Incident Response Integration](#13-incident-response-integration)
14. [Compliance Mapping](#14-compliance-mapping)
15. [Appendix A — Security Architecture Diagrams](#appendix-a--security-architecture-diagrams)
16. [Appendix B — Requirements Traceability](#appendix-b--requirements-traceability)

---

## 1. Executive Summary

This document defines the **comprehensive security architecture** for the TwinMOS corporate website (`twinmos.com` and all official subdomains). The architecture is designed to satisfy 100% of the security requirements stated in BRD §21, RFP §11, and URD §34, while supporting the phased delivery model (Phases 1–3) defined in the Implementation Strategy v3.0.

### 1.1 Security Posture Statement

TwinMOS adopts a **defense-in-depth** security model with multiple overlapping control layers:

| Layer | Technology | Responsibility |
|-------|-----------|----------------|
| Edge / CDN | Cloudflare (WAF, DDoS, Bot Management, TLS) | Platform |
| Application | Astro 5 + Strapi v5 + React islands | Development |
| API Security | JWT (RS256), Rate Limiting, CORS | Development |
| Data | PostgreSQL 16 + Backblaze B2 (encrypted) | Operations |
| Identity | Strapi Users-Permissions (P1) + Better Auth (P2) | Development |
| Secrets | Coolify env vars + Doppler (optional) | Operations |
| Monitoring | Sentry + UptimeRobot + Plausible | Operations |

### 1.2 Key Security Commitments

| Commitment | Standard | Verification |
|------------|----------|------------|
| TLS 1.3 everywhere | BRD §21.1 | SSL Labs A+ rating |
| OWASP Top 10 protection | BRD §21, RFP §11.1 | Cloudflare WAF + ZAP weekly scans |
| MFA for admin & partner accounts | BRD §21.2 | Enforced in auth middleware |
| Quarterly penetration testing | BRD §21.3 | CREST/OSCP-certified vendor |
| 72-hour breach notification (GDPR/UAE) | BRD §22.1 | Incident response playbook |
| Zero high/critical vulnerabilities in production | BRD §32.1 | CI gates + weekly scans |

---

## 2. Security Architecture Overview

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              INTERNET                                         │
│  (Anonymous Visitors, Search Engines, Bots, Attackers)                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │     CLOUDFLARE EDGE NETWORK     │
                    │  • TLS 1.3 termination          │
                    │  • WAF (OWASP CRS)              │
                    │  • DDoS mitigation (unmetered)  │
                    │  • Bot Fight Mode               │
                    │  • Rate limiting                │
                    │  • Geo-blocking (admin routes)  │
                    └───────────────┬───────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │      ASTRO 5 (Cloudflare Pages) │
                    │  • Static-first rendering       │
                    │  • React islands (hydrated)     │
                    │  • CSP enforcement              │
                    │  • Security headers             │
                    └───────────────┬───────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │     STRAPI v5 API (Hetzner)     │
                    │  • JWT authentication           │
                    │  • RBAC authorization           │
                    │  • Input validation (Zod)       │
                    │  • Rate limiting middleware     │
                    │  • Audit logging                │
                    └───────────────┬───────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │      DATA LAYER                 │
                    │  • PostgreSQL 16 (encrypted)    │
                    │  • MeiliSearch (read-only key)  │
                    │  • Backblaze B2 (S3-compatible) │
                    │  • ImgProxy (image transforms)  │
                    └─────────────────────────────────┘
```

### 2.2 Identity Domains

The site has **five distinct identity domains**, each with different security requirements:

| Domain | Volume | Auth Mechanism | Phase | Security Level |
|--------|--------|----------------|-------|----------------|
| **Anonymous Visitors** (~85–90% traffic) | Bulk | None | P1 | Standard (TLS, CSP, WAF) |
| **CMS Editorial Users** | 5–20 | Strapi Users-Permissions + MFA (TOTP) | P1 | High (MFA, session timeout, audit log) |
| **Registered Product Owners** | ~5–8% traffic | Light email-based (warranty/RMA lookup) | P1 | Medium (magic links, rate limiting) |
| **Partner Portal — Distributors / OEM** | < 1% | Better Auth + MFA + watermarked PDF outputs | P2 | Very High (MFA, RBAC, geo-fencing) |
| **E-commerce Customers (P3)** | n/a (Phase 3) | Better Auth (single account model with Partner) | P3 | Very High (PCI-aligned, MFA optional) |

---

## 3. Trust Boundaries & Zones

### 3.1 Trust Zone Model

| Zone | Description | Trust Level | Network Segment |
|------|-------------|-------------|-----------------|
| **Zone 0: Internet** | Untrusted public internet | Untrusted | N/A |
| **Zone 1: Cloudflare Edge** | CDN, WAF, DDoS protection | Semi-trusted | Cloudflare anycast |
| **Zone 2: Public Frontend** | Astro static pages, public API | Trusted (read-only) | Cloudflare Pages |
| **Zone 3: Application Backend** | Strapi CMS, business logic | Trusted | Hetzner CX32/CX42 |
| **Zone 4: Data Layer** | PostgreSQL, MeiliSearch, B2 | Highly Trusted | Hetzner + Backblaze |
| **Zone 5: Admin Interface** | Strapi admin, partner portal | Restricted | Hetzner + geo-block |
| **Zone 6: CI/CD Pipeline** | GitHub Actions, Coolify | Highly Trusted | GitHub + Hetzner |

### 3.2 Trust Boundary Rules

1. **Zone 0 → Zone 1:** All traffic must pass through Cloudflare WAF; no direct origin access except from Cloudflare IPs
2. **Zone 1 → Zone 2:** Static assets only; no server-side execution; CSP enforced
3. **Zone 2 → Zone 3:** API calls only via `api.twinmos.com`; JWT or anonymous; rate limited
4. **Zone 3 → Zone 4:** Database connections over TLS; credentials from env vars; least-privilege DB users
5. **Zone 5 → Zone 3:** Admin actions require authenticated session + MFA + appropriate RBAC role
6. **Zone 6 → Zone 3/4:** Deployment via Coolify webhooks; secrets injected at runtime; no hardcoded credentials

---

## 4. Network & Edge Security

### 4.1 TLS Configuration

| Aspect | Specification | Source |
|--------|---------------|--------|
| Protocol | TLS 1.3 (TLS 1.2 minimum for legacy clients) | BRD §21.1 |
| Certificate | Cloudflare-managed; auto-renewal | Tech Stack §18.1 |
| HSTS | `max-age=31536000; includeSubDomains; preload` | BRD §21.1 |
| Cipher suites | Cloudflare default (modern, no weak ciphers) | Tech Stack §18.1 |
| Forward secrecy | Enabled (ECDHE key exchange) | Cloudflare default |
| Certificate pinning | Not required (Cloudflare-managed PKI) | — |

### 4.2 Web Application Firewall (WAF)

| Rule Set | Purpose | Action |
|----------|---------|--------|
| OWASP Core Rule Set (CRS) | Top 10 protection | Block + log |
| Cloudflare Managed Rules | Known attack patterns | Block + log |
| Custom rule: Admin geo-block | Allow only TwinMOS office IPs + VPN on `admin.*` | Challenge/block |
| Custom rule: Rate limiting | 100 req/min public; 1000 req/min authenticated | Block |
| Custom rule: Bot Fight Mode | Block known bad bots | Block |
| Custom rule: Turnstile gate | Challenge suspicious traffic | Managed challenge |

### 4.3 DDoS Protection

| Layer | Protection | Source |
|-------|------------|--------|
| L3/4 | Cloudflare unmetered DDoS (network layer) | Cloudflare Pro |
| L7 | Rate limiting + WAF + Bot Fight Mode | Cloudflare Pro |
| Origin protection | Cloudflare IPs only; Hetzner firewall | Operations |
| Alerting | UptimeRobot + Sentry + Cloudflare analytics | Tech Stack §17 |

### 4.4 Rate Limiting

| Endpoint Type | Limit | Window | Action |
|---------------|-------|--------|--------|
| Public API (anonymous) | 100 requests | 1 minute | Block + log |
| Public API (authenticated) | 1,000 requests | 1 minute | Block + log |
| Form submissions | 10 submissions | 10 minutes | Block + log |
| Serial number lookups | 5 lookups | 1 minute | Turnstile challenge after 3 |
| CMS admin login | 5 failed attempts | 30 minutes | Account lockout |
| Partner portal login | 5 failed attempts | 30 minutes | Account lockout + alert |

---

## 5. Application Security

### 5.1 Input Validation & Output Encoding

| Layer | Tool | Coverage |
|-------|------|----------|
| Client-side | React Hook Form + Zod | Form fields |
| Server-side | Zod schema (mirror) on Strapi controller | All API inputs |
| Database | Strapi ORM parameterized queries | All DB interactions |
| Output | React/Astro auto-escaping | All rendered content |
| File upload | Type whitelist + size limit + ClamAV scan | Upload endpoints |

### 5.2 Cross-Site Scripting (XSS) Prevention

| Control | Implementation |
|---------|----------------|
| Framework escaping | React/Astro automatic HTML escaping |
| CSP | `script-src 'self'` (strict; see CSP Spec) |
| Inline scripts | Prohibited; external scripts only |
| Event handlers | No inline `onclick`; use React event binding |
| DOM manipulation | Sanitize any user-generated HTML (DOMPurify if needed) |
| Reflected XSS | Input validation + output encoding on all parameters |

### 5.3 Cross-Site Request Forgery (CSRF) Prevention

| Control | Implementation |
|---------|----------------|
| SameSite cookies | `SameSite=Strict` on all session cookies |
| Double-submit cookie | For state-changing Astro form actions |
| CSRF token | Strapi built-in for admin panel |
| Origin validation | Reject requests from unauthorized origins |

### 5.4 SQL Injection Prevention

| Control | Implementation |
|---------|----------------|
| ORM usage | Strapi ORM (Bookshelf/Knex) — parameterized queries only |
| Raw SQL | Prohibited in application code |
| Database user | Least-privilege (no DDL permissions for app user) |

### 5.5 Clickjacking Prevention

| Control | Implementation |
|---------|----------------|
| X-Frame-Options | `DENY` on all pages |
| CSP frame-ancestors | `frame-ancestors 'none'` |

### 5.6 Open Redirect Prevention

| Control | Implementation |
|---------|----------------|
| Whitelist | Redirect targets validated against whitelist in Strapi |
| Relative URLs | Prefer relative redirects; validate absolute URLs |

### 5.7 File Upload Security

| Control | Specification |
|---------|---------------|
| Type whitelist | `.pdf`, `.doc`, `.docx`, `.png`, `.jpg` |
| Size limit | 10 MB maximum |
| Malware scan | ClamAV scan in CI pipeline |
| Storage | Backblaze B2 with randomized filenames |
| Execution | Uploaded files never executable; served as static assets only |

---

## 6. Authentication, Authorization & Identity

### 6.1 CMS Authentication (Strapi Users-Permissions) — Phase 1

| Aspect | Specification | Source |
|--------|---------------|--------|
| Protocol | JWT (RS256, asymmetric signing) | Tech Stack §5.6 |
| Access token TTL | 1 hour | BRD §21.2 |
| Refresh token | Rotating; each refresh issues new token + invalidates old | BRD §21.2 |
| Refresh reuse detection | Triggers session revocation | Tech Stack §9.2 |
| MFA | TOTP mandatory for Super Admin and Admin roles | BRD §21.2 |
| MFA recovery codes | Generated at enrollment; stored hashed | Tech Stack §9.2 |
| Password policy | Min 12 chars, mixed case + number + symbol | BRD §21.2 |
| Password rotation | 90 days for admin roles | BRD §21.2 |
| Account lockout | 5 failed attempts → 30-min cooldown | BRD §21.2 |
| Session idle timeout | 30 minutes | BRD §21.1, URD §34.1 |
| Session absolute timeout | 8 hours | BRD §21.1 |
| Session warning | 25-minute countdown before idle expiry | URD §34.1 |

### 6.2 Partner Portal Authentication (Better Auth) — Phase 2

| Aspect | Specification | Source |
|--------|---------------|--------|
| Library | Better Auth `^1.x` | Tech Stack §9.3 |
| Storage | PostgreSQL (same Hetzner instance) | Tech Stack §9.3 |
| Session | Database sessions with rotating cookies | Tech Stack §9.3 |
| Cookie flags | `HttpOnly`, `Secure`, `SameSite=Strict` | Tech Stack §9.3 |
| Session cookie name | `__Host-twinmos-session` | Tech Stack §9.3 |
| Session TTL | 8 hours absolute / 30 minutes idle | Tech Stack §9.3 |
| MFA | TOTP mandatory for distributors; optional WebAuthn passkeys | BRD §21.2 |
| OAuth providers | Google, Microsoft (optional, for OEM convenience) | Tech Stack §9.3 |
| Magic links | Email-based passwordless login as fallback | Tech Stack §9.3 |
| Bot protection | Cloudflare Turnstile gate on login | Tech Stack §9.3 |

### 6.3 Role-Based Access Control (RBAC)

#### CMS Roles (Strapi)

| Role | Permissions | MFA Required |
|------|-------------|--------------|
| Super Admin | Full system access | Yes |
| Admin | User management, content CRUD, settings | Yes |
| Editor | Content CRUD, publish workflow gate | No (recommended) |
| Author | Content create/edit (own content only); cannot publish | No |
| Viewer | Read-only access to content | No |

#### Partner Portal Roles (Better Auth)

| Role | Permissions | MFA Required |
|------|-------------|--------------|
| Distributor Admin | Full portal access, team management, price lists | Yes |
| Distributor Marketing | Marketing assets, banners, co-brand materials | Yes |
| Distributor Procurement | Price lists, order history, inventory | Yes |
| OEM Partner | Product specs, firmware, technical docs | Yes |
| System Builder | Product catalog, compatibility data, basic pricing | Yes |

### 6.4 API Authentication

| Endpoint Type | Auth Method | Rate Limit |
|---------------|-------------|------------|
| Public read-only (products, news, retailers) | None | 100 req/min |
| Public write (forms, warranty registration) | None + Turnstile | 10 req/10 min |
| Authenticated (partner portal API) | Session cookie (Better Auth) | 1,000 req/min |
| CMS Admin API | JWT (Strapi) | 1,000 req/min |
| Internal service-to-service | API key + IP whitelist | Unlimited (internal) |

---

## 7. Data Protection & Encryption

### 7.1 Data in Transit

| Layer | Encryption | Configuration |
|-------|------------|---------------|
| Browser → Cloudflare | TLS 1.3 | Cloudflare-managed certificate |
| Cloudflare → Origin | TLS 1.3 | Cloudflare Origin CA certificate |
| Origin → PostgreSQL | TLS 1.3 | PostgreSQL `sslmode=require` |
| Origin → MeiliSearch | TLS 1.3 | MeiliSearch built-in TLS |
| Origin → Backblaze B2 | TLS 1.3 | HTTPS API |
| Service → Service | TLS 1.3 | Internal Docker network + mTLS (optional P2) |

### 7.2 Data at Rest

| Asset | Encryption Method | Key Management |
|-------|-------------------|----------------|
| PostgreSQL database | AES-256 (Hetzner disk encryption) | Hetzner-managed |
| Backblaze B2 objects | AES-256 (server-side encryption) | Backblaze-managed |
| Backup files (pg_dump) | AES-256 (GPG-encrypted before upload) | Coolify env var |
| Uploaded files (CVs, evidence) | AES-256 (B2 server-side) | Backblaze-managed |
| Session tokens (database) | Hashed (bcrypt/Argon2) | N/A |
| Passwords | Hashed (bcrypt, cost factor 12+) | N/A |
| API keys | Hashed in database; plaintext only in env vars | Coolify env var |

### 7.3 Data Residency

| User Region | Primary Data Location | Backup Location |
|-------------|----------------------|-----------------|
| EU/EEA | Hetzner Falkenstein (DE) | Backblaze B2 (EU region) |
| MEA / Africa | Hetzner Falkenstein (DE) | Backblaze B2 (EU region) |
| Asia (India / BD / Pakistan / SEA) | Hetzner Helsinki (FI) | Backblaze B2 (US-West) |
| US / North America | Hetzner Ashburn (US) | Backblaze B2 (US-West) |
| KSA / sensitive data | Cloudflare Riyadh edge cache; primary host EU | Backblaze B2 (EU region) |

### 7.4 Data Retention

| Data Type | Retention Period | Disposal Method |
|-----------|-----------------|-----------------|
| Form submissions | 24 months after last activity | Soft delete → hard delete after 30 days |
| Analytics data (Plausible) | 12 months | Automatic purge |
| CMS audit logs | 12 months | Archive to B2 → delete |
| Session tokens | 8 hours absolute | Automatic expiry |
| Refresh tokens | 7 days (rotating) | Automatic expiry + reuse detection |
| Backup files | 30 days daily; 12 months monthly | Automatic deletion |
| Financial records (P3) | 7 years (UAE VAT compliance) | Archive to B2 Glacier Deep Archive |
| Job applications | 24 months | Anonymization after rejection |
| Newsletter subscriber data | Until unsubscribe + 30 days | Hard delete |

---

## 8. Infrastructure Security

### 8.1 Hosting Security

| Layer | Security Measure |
|-------|-----------------|
| Cloudflare Pages | No server-side execution; static-only; edge-deployed |
| Hetzner CX32/CX42 | Firewall: allow only Cloudflare IPs + VPN + monitoring |
| Coolify | Container isolation; health checks; auto-restart; zero-downtime deploys |
| Docker | Non-root containers; read-only filesystems where possible; resource limits |
| SSH | Key-based only; disable password auth; fail2ban |
| OS | Ubuntu 24.04 LTS; automatic security updates; minimal installed packages |

### 8.2 Container Security

| Control | Implementation |
|---------|----------------|
| Image scanning | Trivy scan on every Docker image build (CI gate) |
| Base images | Official images only (postgres:16, redis:7-alpine, etc.) |
| Non-root execution | All application containers run as non-root user |
| Read-only rootfs | Where feasible; writable volumes for tmp/cache only |
| Secret injection | Secrets via Coolify env vars; never in image layers |
| Network segmentation | Docker internal network; no external exposure except proxy |

### 8.3 Database Security

| Control | Implementation |
|---------|----------------|
| Network access | Localhost only; no external exposure |
| Authentication | Strong password; PostgreSQL SCRAM-SHA-256 |
| Authorization | Least-privilege roles (app user, admin user, backup user) |
| Encryption at rest | Hetzner disk encryption |
| Encryption in transit | TLS 1.3 required |
| Backup encryption | AES-256 GPG encryption before B2 upload |
| Audit logging | PostgreSQL `log_statement = 'mod'` for DDL/DML |
| Connection pooling | PgBouncer (Phase 2) with max connection limits |

---

## 9. Secrets Management

### 9.1 Secret Categories

| Category | Examples | Storage |
|----------|----------|---------|
| Database credentials | Postgres user/password | Coolify env vars |
| JWT signing keys | RS256 private key | Coolify env vars |
| API keys | Resend, Sentry, Backblaze, Cloudflare | Coolify env vars |
| OAuth credentials | Google, Microsoft client secrets | Coolify env vars |
| Session secrets | Cookie signing secrets | Coolify env vars |
| Backup encryption | GPG passphrase | Coolify env vars |
| Third-party tokens | Stripe secret key (P3) | Coolify env vars |

### 9.2 Secret Lifecycle

| Phase | Process |
|-------|---------|
| Generation | Cryptographically random (OpenSSL `/dev/urandom`); min 256-bit entropy |
| Storage | Coolify environment variables; encrypted at rest by Coolify |
| Distribution | Manual entry by DevOps; never transmitted via email/chat |
| Rotation | Scheduled: JWT keys annually; API keys quarterly; emergency: immediate on compromise suspicion |
| Revocation | Immediate via Coolify console; application restart required |
| Destruction | Overwrite env var; remove from backup rotation; verify no references in code |

### 9.3 Development Environment

| Rule | Enforcement |
|------|-------------|
| `.env.local` | In `.gitignore`; never committed |
| `.env.example` | Committed with placeholder values only |
| Hardcoded secrets | Prohibited; detected by GitGuardian in CI |
| Local secrets | Use Docker Compose env file; share via secure channel (1Password/Doppler) |
| Production secrets | Never used in development or staging |

---

## 10. Monitoring, Logging & Audit

### 10.1 Security Monitoring Stack

| Tool | Purpose | Coverage |
|------|---------|----------|
| Sentry | Error monitoring + RUM + session replay | Frontend + Backend |
| UptimeRobot | Uptime monitoring (5-min checks, 3+ regions) | All public endpoints |
| Cloudflare Analytics | WAF events, bot traffic, DDoS metrics | Edge layer |
| Plausible | Privacy-first analytics (cookieless) | User behavior |
| `strapi-plugin-audit-log` | CMS action audit log | All CMS CRUD operations |

### 10.2 Audit Log Requirements

| Event | Logged Fields | Retention |
|-------|--------------|-----------|
| CMS login | User, timestamp, IP, user agent, success/failure | 12 months |
| CMS content change | User, action, item ID, item type, timestamp, before/after diff | 12 months |
| API authentication | Token ID, endpoint, timestamp, IP, rate limit status | 12 months |
| Form submission | Form type, timestamp, IP, Turnstile score (no PII in logs) | 24 months |
| Partner portal access | User, action, resource, timestamp, IP | 12 months |
| Admin user creation | Creator, new user, role, timestamp | 12 months |
| Failed login attempts | Username, timestamp, IP, failure reason | 12 months |
| Security alerts | Alert type, severity, timestamp, affected component | 12 months |

### 10.3 Log Protection

| Control | Implementation |
|---------|----------------|
| Tamper-evident | Logs written to append-only storage; checksum verification |
| Access control | Log access restricted to Security Lead and DevOps |
| Retention | 12 months hot storage; archive to B2 after expiry |
| Correlation | Centralized timestamp (UTC); request ID propagation |

---

## 11. Third-Party Security

### 11.1 Third-Party Service Security Assessment

| Service | Data Shared | Security Measures | Risk Level |
|---------|-------------|-------------------|------------|
| Cloudflare | All traffic metadata | TLS 1.3, WAF, DDoS, SOC 2 Type II | Low |
| Hetzner | All application data | ISO 27001, GDPR-compliant, EU data centers | Low |
| Backblaze B2 | File uploads, backups | AES-256, SOC 2 Type II | Low |
| Resend | Email addresses, message content | TLS, SOC 2 Type II | Low |
| Sentry | Error data, stack traces | TLS, SOC 2 Type II, data scrubbing | Low |
| Stripe (P3) | Payment card data | PCI DSS Level 1, tokenization | Low |
| Google Analytics 4 | Anonymized behavioral data | Consent-gated, IP anonymization | Medium |
| Meta Pixel | Anonymized behavioral data | Consent-gated | Medium |
| LinkedIn Insight Tag | Anonymized behavioral data | Consent-gated | Medium |

### 11.2 Third-Party Risk Management

| Activity | Frequency | Owner |
|----------|-----------|-------|
| Security questionnaire review | Annual | Legal / Security |
| SOC 2 / ISO certificate verification | Annual | Legal / Security |
| Data processing agreement review | On contract + annual | Legal |
| Subprocessor notification | On change | Legal |
| Incident notification SLA | Contractual | Legal |

---

## 12. Security Testing & Validation

### 12.1 Security Testing Program

| Test Type | Tool / Method | Frequency | Owner |
|-----------|--------------|-----------|-------|
| Automated DAST | OWASP ZAP (GitHub Actions) | Weekly | Development |
| Dependency scanning | Snyk + Dependabot | Continuous (Dependabot); Weekly (Snyk) | Development |
| Container scanning | Trivy | Per build | Development |
| Secret scanning | GitGuardian | Per push | Development |
| SAST | Snyk Code (optional) | Weekly | Development |
| Penetration testing | Third-party (CREST/OSCP) | Pre-launch + quarterly + annual | Security Lead |
| WAF rule testing | Cloudflare simulation | Monthly | DevOps |
| DR security test | Full restore + verification | Quarterly | DevOps |

### 12.2 Security Quality Gates

| Gate | Threshold | Where Enforced |
|------|-----------|----------------|
| OWASP ZAP | Zero high/critical findings | Weekly scheduled |
| Snyk | Zero high/critical CVE | CI |
| Trivy | Zero high/critical CVE in image | CI |
| GitGuardian | Zero secret leaks | Per push |
| Penetration test | Zero critical; all high remediated within 30 days | Pre-launch / quarterly |
| Lighthouse Best Practices | >= 95 | CI per page |

---

## 13. Incident Response Integration

### 13.1 Incident Severity Classification

| Severity | Definition | SLA | Response |
|----------|------------|-----|----------|
| Sev 1 (Critical) | Full outage or active data breach | 15 min ack, 1 h fix attempt | Page on-call dev; Slack #incident; executive notification |
| Sev 2 (High) | Degraded service or suspected breach | 30 min ack, 4 h fix | Slack #ops; runbook execution |
| Sev 3 (Medium) | Single feature broken or security finding | 4 h ack, 24 h fix | Issue tracker + scheduled fix |
| Sev 4 (Low) | Cosmetic or informational | Best effort | Backlog |

### 13.2 Breach Notification Requirements

| Jurisdiction | Timeline | Trigger | Recipient |
|--------------|----------|---------|-----------|
| GDPR (EU) | 72 hours | Personal data breach likely to result in risk | Lead SA (Ireland DPC) |
| UAE PDPL | 72 hours | Data breach affecting personal data | UAE DPA |
| India DPDP Act 2023 | 6 hours (CERT-In) + 72 hours (DPB) | Personal data breach | CERT-In + Data Protection Board |
| KSA PDPL | 72 hours | Data breach | SDAIA |
| South Africa POPIA | "As soon as reasonably possible" | Data breach | Information Regulator |

---

## 14. Compliance Mapping

### 14.1 Regulatory Compliance Matrix

| Regulation | Jurisdiction | Security Requirements | TwinMOS Control |
|------------|-------------|----------------------|-----------------|
| GDPR | EU/EEA | Art. 32 (Security of processing), Art. 33 (Breach notification) | TLS 1.3, encryption, access controls, audit logs, 72h notification |
| UAE PDPL | UAE | Lawful processing, security, breach notification | Same as GDPR + DPO contact |
| India DPDP Act 2023 | India | Consent-based processing, security, 6h CERT-In notification | Explicit consent, encryption, 6h notification |
| KSA PDPL | KSA | Cross-border transfer restrictions, sensitive data localization | Transfer impact assessment, EU primary host |
| WCAG 2.1 AA | Global | Security of accessibility features | Secure auth flows, protected content |
| ePrivacy / UK PECR | EU/UK | Cookie consent, tracking transparency | Custom CMP, granular consent |

### 14.2 Industry Standard Alignment

| Standard | Alignment | Evidence |
|----------|-----------|----------|
| OWASP ASVS Level 2 | Target | All Level 2 requirements mapped to controls |
| NIST CSF | Reference | Controls organized by Identify/Protect/Detect/Respond/Recover |
| ISO 27001:2013 | Reference | Control mapping available on request |
| SOC 2 Type II | Inherited (vendors) | Cloudflare, Backblaze, Hetzner, Resend, Sentry, Stripe |

---

## Appendix A — Security Architecture Diagrams

### A.1 Authentication Flow Diagram (Phase 1 — CMS)

```
Admin User → Browser
    → POST /admin/auth/local (username + password)
    → Strapi Users-Permissions
    → Validate credentials
    → IF MFA enabled → TOTP challenge
    → Issue JWT (RS256, 1h TTL) + Refresh Token
    → Set HttpOnly cookie
    → Redirect to /admin
```

### A.2 Authentication Flow Diagram (Phase 2 — Partner Portal)

```
Partner User → Astro frontend (/partner/login)
    → React island posts to /api/auth/login
    → Better Auth (on Strapi or sidecar Node service)
    → Verify password → MFA challenge (TOTP)
    → Session DB entry created
    → Set-Cookie __Host-twinmos-session (HttpOnly, Secure, SameSite=Strict)
    → Redirect to /partner/dashboard
    → Astro Server Island queries Strapi with session
    → Strapi returns role-scoped content
```

### A.3 Data Flow Diagram (Anonymous Visitor)

```
[Visitor] → [Cloudflare Edge] → [Cloudflare Pages (Astro)]
                                              │
                    ┌──────────────────────────┼──────────────────────────┐
                    │                          │                          │
                [Static HTML]          [API: api.twinmos.com]      [Search: search.twinmos.com]
                    │                          │                          │
                [Browser]              [Strapi (Hetzner)]         [MeiliSearch (Hetzner)]
                                              │
                                    [PostgreSQL (Hetzner)]
                                    [Backblaze B2 (Object Storage)]
```

---

## Appendix B — Requirements Traceability

| BRD Requirement | Tech Stack Section | This Document Section | Status |
|-----------------|-------------------|----------------------|--------|
| BRD §21.1 (HTTPS, HSTS, CSP) | §18.1, §18.3 | §4, §5, §7 | Covered |
| BRD §21.2 (Auth, MFA, JWT) | §5.6, §9.2, §9.3 | §6 | Covered |
| BRD §21.3 (DDoS, WAF, pen-test) | §18.1, §18.4 | §4, §12 | Covered |
| BRD §22.1 (GDPR, PDPL, DPDP) | §18.6 | §14 | Covered |
| BRD §22.2 (WCAG 2.1 AA) | §18.6.1 | §14 | Covered |
| BRD §23.3 (DR, RTO/RPO) | §23 | §8, §13 | Covered |
| BRD §26.3 (API rate limiting) | §18.1 | §4, §6 | Covered |
| BRD §32.1 (Zero high/critical) | §20.3, §21.1 | §12 | Covered |
| URD §34 (Security & Privacy UX) | §18.7 | §6, §10 | Covered |
| RFP §11 (Security requirements) | §18 | All sections | Covered |

---

**Document Version:** 1.0  
**Last Updated:** 2 May 2026  
**Next Review:** Upon Sprint 0 close (Week 2) and at every phase boundary (Months 5, 9, 15)  
**Synchronized With:** RFP v3.0, BRD v3.0, URD v3.0, Tech Stack v1.1, Content Map v1.0, Implementation Strategy v3.0  
**Canonical Location:** `C:\software_project\TwinMOS\Corporate website development for TwinMOS\project documentation\I - Security and Compliance\I.1 - Security Architecture\TwinMOSWebsiteSecurity_Architecture.md`
