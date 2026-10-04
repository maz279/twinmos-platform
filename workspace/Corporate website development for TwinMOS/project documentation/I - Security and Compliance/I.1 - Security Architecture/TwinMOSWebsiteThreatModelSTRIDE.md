# TwinMOS Website — STRIDE Threat Model

| Document Attribute | Value |
|---|---|
| **Document ID** | TWN-SEC-2026-010 |
| **Version** | 1.0.0 |
| **Status** | Draft |
| **Author** | Unisoft Technologies Security Team |
| **Owner** | CISO / Security Architect |
| **Review Date** | 2026-11-01 |
| **Classification** | Confidential |
| **Related Documents** | TWN-SEC-2026-001 (Security Architecture), TWN-SEC-2026-011 (Security Controls Catalog), TWN-SEC-2026-009 (OWASP Top 10 Coverage), TWN-OPS-2026-001 (Penetration Testing Plan), TWN-OPS-2026-002 (Vulnerability Management) |
| **Compliance Mapping** | ISO/IEC 27001:2022 A.8.25, A.8.26, GDPR Art. 32, NIST SP 800-30 Rev. 1, OWASP Threat Modeling Cheat Sheet |
| **Synchronized With** | BRD v3.0, Tech Stack v1.1, URD v3.0, Implementation Strategy v3.0 |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Description & Scope](#2-system-description--scope)
3. [Architecture Overview & Data Flow Diagram](#3-architecture-overview--data-flow-diagram)
4. [Trust Boundaries](#4-trust-boundaries)
5. [STRIDE Methodology](#5-stride-methodology)
6. [Threat Analysis — Public Website & CDN Layer](#6-threat-analysis--public-website--cdn-layer)
7. [Threat Analysis — Authentication & Session Management](#7-threat-analysis--authentication--session-management)
8. [Threat Analysis — CMS & Content Management](#8-threat-analysis--cms--content-management)
9. [Threat Analysis — Contact Forms & Lead Generation](#9-threat-analysis--contact-forms--lead-generation)
10. [Threat Analysis — Partner Portal & API (Phase 2)](#10-threat-analysis--partner-portal--api-phase-2)
11. [Threat Analysis — E-Commerce & Checkout (Phase 3)](#11-threat-analysis--e-commerce--checkout-phase-3)
12. [Residual Risk Register](#12-residual-risk-register)
13. [Mitigation Coverage Summary](#13-mitigation-coverage-summary)
14. [Governance & Review](#14-governance--review)
15. [Appendix A — STRIDE Quick Reference](#appendix-a--stride-quick-reference)
16. [Appendix B — Requirements Traceability](#appendix-b--requirements-traceability)

---

## 1. Executive Summary

This document presents the **STRIDE-based threat model** for the TwinMOS corporate website (`twinmos.com` and all official subdomains). Threat modeling is performed as a proactive security activity that identifies threats before they can be exploited, enabling targeted control implementation during system design and development.

### 1.1 Threat Modeling Approach

TwinMOS adopts the **STRIDE-per-Component** methodology, applied to each architectural element identified in the system Data Flow Diagram (DFD). Threats are assessed using a **DREAD-variant risk rating** combining Likelihood × Impact scores. Mitigations are mapped directly to controls in TWN-SEC-2026-001 (Security Architecture) and TWN-SEC-2026-011 (Security Controls Catalog).

### 1.2 System Risk Profile

| Risk Dimension | Assessment |
|---|---|
| **Data Sensitivity** | High — personal data of EU/UAE data subjects; partner commercial data |
| **Attack Surface** | Medium-High — public-facing web application, CDN-exposed APIs, admin interfaces |
| **Threat Actor Landscape** | Opportunistic attackers, competitor intelligence, hacktivists, credential stuffers |
| **Regulatory Stakes** | High — GDPR Art. 32, UAE PDPL, PCI DSS 4.0 (Phase 3) |
| **Business Impact of Breach** | High — brand reputation, 27-year customer trust, potential regulatory fines |

### 1.3 Key Findings Summary

| Severity | Count | Status |
|---|---|---|
| **Critical** | 4 | Mitigated by existing controls |
| **High** | 12 | Mitigated / Planned |
| **Medium** | 18 | Accepted with controls |
| **Low** | 9 | Accepted |
| **Total Threats Identified** | **43** | |

---

## 2. System Description & Scope

### 2.1 System Overview

The TwinMOS website is a **multi-phase corporate web platform** serving the following functions:

| Phase | Function | Status |
|---|---|---|
| **P1 (Current)** | Corporate branding, product catalog, contact forms, distributor locator, support content | Live / In Development |
| **P2 (Planned)** | Partner/distributor portal, authenticated product ordering, warranty registration | Planned Q3 2026 |
| **P3 (Planned)** | Direct e-commerce, payment processing, mobile applications | Planned Q1 2027 |

### 2.2 Technology Stack

| Layer | Technology | Notes |
|---|---|---|
| **Frontend** | Astro 5 (static + React islands) | SSG with selective hydration |
| **CMS** | Strapi v5 (headless) | Content API + Admin UI |
| **Authentication P1** | Strapi Users-Permissions (JWT RS256) | CMS admin only |
| **Authentication P2** | Better Auth | Partner portal, warranty, contact auth |
| **Database** | PostgreSQL 16 | Hosted on Hetzner |
| **File Storage** | Backblaze B2 | Product images, assets, datasheets |
| **CDN / Edge** | Cloudflare (WAF, DDoS, Bot Management, TLS) | Termination at edge |
| **Hosting** | Hetzner Cloud (VPS) | Coolify deployment platform |
| **Email** | Postmark (transactional) | Contact form, order confirmations |
| **Search** | Meilisearch | Site-wide search (P2) |
| **Analytics** | Plausible Analytics (privacy-first) | No personal data collection |
| **Monitoring** | Sentry (errors), UptimeRobot (availability) | Alerting pipeline |
| **Payments (P3)** | Stripe (PCI DSS SAQ A) | Redirect/iFrame model |

### 2.3 In-Scope Assets

| Asset | Sensitivity | Phase |
|---|---|---|
| `twinmos.com` public pages | Low (public content) | P1 |
| Contact / inquiry forms | Medium (personal data) | P1 |
| Strapi CMS admin (`/admin`) | High (content integrity, access) | P1 |
| Strapi REST / GraphQL API | Medium-High (data exposure) | P1 |
| Partner Portal (`/partner/*`) | High (commercial confidential) | P2 |
| Warranty Registration system | Medium (personal + product data) | P2 |
| Distributor locator API | Low | P1 |
| E-commerce checkout | Critical (payment data) | P3 |
| Mobile applications (iOS/Android) | High | P3 |
| Backblaze B2 storage | Medium (asset integrity) | P1 |
| PostgreSQL database | Critical (all data) | P1 |

### 2.4 Out-of-Scope

- TwinMOS internal corporate network and ERP systems
- Partner and distributor internal systems
- Taiwan manufacturing facility systems
- Physical security controls

---

## 3. Architecture Overview & Data Flow Diagram

### 3.1 DFD Elements

#### External Entities (EE)
| ID | Entity | Description |
|---|---|---|
| EE-01 | Public User / Visitor | Anonymous web visitor (any geography) |
| EE-02 | Authenticated Partner | Registered distributor/reseller user (P2) |
| EE-03 | CMS Administrator | TwinMOS content editor / admin |
| EE-04 | E-Commerce Customer | Registered buyer (P3) |
| EE-05 | Cloudflare Edge | CDN / WAF termination point |
| EE-06 | Stripe Payment Gateway | External payment processor (P3) |
| EE-07 | Postmark | Transactional email provider |

#### Processes (P)
| ID | Process | Description |
|---|---|---|
| P-01 | Web Frontend (Astro) | Serves static pages and React islands |
| P-02 | Strapi CMS API | Content REST/GraphQL API |
| P-03 | Strapi Admin UI | Content management interface |
| P-04 | Better Auth Service | Session management, OAuth (P2) |
| P-05 | Meilisearch Engine | Site search indexing/querying (P2) |
| P-06 | Contact Form Handler | Form validation, submission, email relay |

#### Data Stores (DS)
| ID | Store | Data Held | Classification |
|---|---|---|---|
| DS-01 | PostgreSQL Database | All CMS content, user accounts, form submissions | Confidential |
| DS-02 | Backblaze B2 | Product images, datasheets, static assets | Internal |
| DS-03 | Cloudflare Cache | Static page/asset cache | Public |
| DS-04 | Server Logs | Access logs, error logs | Internal |
| DS-05 | Sentry (cloud) | Error traces, limited session data | Confidential |

#### Data Flows (DF)
| ID | From | To | Data | Protocol |
|---|---|---|---|---|
| DF-01 | EE-01 (Visitor) | EE-05 (Cloudflare) | HTTP requests | HTTPS/TLS 1.3 |
| DF-02 | EE-05 (Cloudflare) | P-01 (Astro) | Proxied HTTP | HTTPS internal |
| DF-03 | P-01 (Astro) | P-02 (Strapi API) | API requests | HTTPS/JWT |
| DF-04 | EE-03 (Admin) | P-03 (Strapi Admin) | Admin UI requests | HTTPS/JWT/MFA |
| DF-05 | P-02 (Strapi) | DS-01 (PostgreSQL) | SQL queries | TLS (mutual) |
| DF-06 | P-02 (Strapi) | DS-02 (Backblaze B2) | Asset reads/writes | HTTPS |
| DF-07 | P-06 (Form Handler) | EE-07 (Postmark) | Email submission | HTTPS/SMTP TLS |
| DF-08 | EE-02 (Partner) | P-04 (Better Auth) | Auth tokens | HTTPS/OAuth 2.0 |
| DF-09 | P-01 (Astro) | P-05 (Meilisearch) | Search queries | HTTPS |
| DF-10 | P-02 (Strapi) | EE-06 (Stripe) | Payment intent | HTTPS (P3) |
| DF-11 | Any Process | DS-04 (Logs) | Log events | Internal/TLS |

### 3.2 DFD Narrative

```
[ Internet / Public User ]
        │ HTTPS (DF-01)
        ▼
[ Cloudflare Edge — WAF, DDoS, TLS termination ]  ←── TB-1 (Internet ↔ Edge)
        │ Origin HTTPS (DF-02)
        ▼
[ Astro Frontend (Hetzner VPS) ]  ←── TB-2 (Edge ↔ App)
        │                    │
   API calls (DF-03)    Static from B2 (DF-06)
        │                    │
        ▼                    ▼
[ Strapi CMS API ]     [ Backblaze B2 ]  ←── TB-3 (App ↔ Storage)
        │
   SQL (DF-05)
        │
        ▼
[ PostgreSQL 16 ]  ←── TB-4 (App ↔ Database)

[ Admin User ] ──── HTTPS + MFA (DF-04) ──→ [ Strapi Admin UI ]  ←── TB-5 (Admin trust boundary)

[ Partner User ] ─ OAuth (DF-08) ──→ [ Better Auth Service ]  ←── TB-6 (Partner portal)

[ Stripe ] ←── Payment intent (DF-10) (P3)  ←── TB-7 (External payment)
```

---

## 4. Trust Boundaries

| ID | Boundary | Description | Security Relevance |
|---|---|---|---|
| **TB-1** | Internet ↔ Cloudflare Edge | All untrusted external traffic enters here | WAF, DDoS, TLS, bot filtering; highest-exposure boundary |
| **TB-2** | Cloudflare Edge ↔ Application Server | Cloudflare proxies to Hetzner origin | Origin IP concealment, mutual auth (authenticated origin pull) |
| **TB-3** | Application Server ↔ Backblaze B2 | API-authenticated access to object storage | Access key management, signed URL controls |
| **TB-4** | Application Server ↔ PostgreSQL | Backend-to-database communication | Encrypted connection, least-privilege DB user, no direct external access |
| **TB-5** | Admin User ↔ Strapi Admin | Privileged content management access | MFA required, IP allowlist, short session timeout, audit log |
| **TB-6** | Partner User ↔ Better Auth | Authenticated distributor/reseller access | OAuth 2.0, RBAC, session management, rate limiting |
| **TB-7** | Application ↔ Stripe | External payment processor (P3) | PCI DSS SAQ A boundary; redirect/iFrame model isolates CHD |

---

## 5. STRIDE Methodology

### 5.1 STRIDE Categories

| Letter | Category | Violated Property | Definition |
|---|---|---|---|
| **S** | Spoofing | Authentication | An attacker impersonates a legitimate user, system, or entity |
| **T** | Tampering | Integrity | Data or code is modified without authorization |
| **R** | Repudiation | Non-Repudiation | A party denies performing an action; no evidence to contradict |
| **I** | Information Disclosure | Confidentiality | Data is exposed to unauthorized parties |
| **D** | Denial of Service | Availability | Service is made unavailable to legitimate users |
| **E** | Elevation of Privilege | Authorization | A user gains capabilities beyond their intended permissions |

### 5.2 Risk Rating Methodology

Threats are rated using **Likelihood × Impact**:

| Score | Likelihood | Description |
|---|---|---|
| 1 | Very Low | Requires nation-state resources or physical access |
| 2 | Low | Skilled attacker, specific knowledge required |
| 3 | Medium | Common attack, publicly available tooling |
| 4 | High | Automated attack, trivial to execute |
| 5 | Very High | Exploitable by script kiddie with no skill |

| Score | Impact | Description |
|---|---|---|
| 1 | Negligible | No real business impact |
| 2 | Minor | Localized, recoverable, no data exposure |
| 3 | Moderate | Limited data exposure or service disruption |
| 4 | Major | Significant data breach or extended outage |
| 5 | Critical | Full system compromise, regulatory sanction, reputational destruction |

**Risk = Likelihood × Impact** → Ratings: Critical (16–25), High (9–15), Medium (4–8), Low (1–3)

---

## 6. Threat Analysis — Public Website & CDN Layer

Components: EE-01, EE-05, P-01, DS-03, DF-01, DF-02 | Trust Boundary: TB-1, TB-2

| Threat ID | STRIDE | Threat Description | Component | L | I | Risk | Mitigations |
|---|---|---|---|---|---|---|---|
| T-PUB-01 | **S** | Attacker spoofs Cloudflare and connects directly to origin IP, bypassing WAF/DDoS protection | TB-2 (Cloudflare↔Hetzner) | 3 | 4 | **High (12)** | Cloudflare Authenticated Origin Pulls (client cert verification); restrict Hetzner firewall to Cloudflare IP ranges only; origin IP never published in DNS |
| T-PUB-02 | **T** | CDN cache poisoning — attacker manipulates cached responses served to all users | DS-03 (Cloudflare Cache) | 2 | 4 | **High (8)** | Cache-Control and Vary headers; cache key normalization; Cloudflare Cache Rules with strict path/query matching; purge-on-deploy pipeline |
| T-PUB-03 | **T** | Supply chain attack — malicious JavaScript injected via compromised third-party CDN script | P-01 (Astro Frontend) | 2 | 5 | **High (10)** | Strict Content Security Policy (TWN-SEC-2026-005); Subresource Integrity (SRI) for all external scripts; minimize third-party JS dependencies |
| T-PUB-04 | **I** | Information disclosure via verbose error responses exposing stack traces, versions, or paths | P-01, P-02 | 4 | 3 | **High (12)** | Generic error pages in production; `X-Powered-By` header removed; Sentry captures errors server-side only; no stack traces in API responses |
| T-PUB-05 | **D** | Volumetric DDoS attack overwhelms origin server via direct IP targeting or Cloudflare bypass | EE-05, P-01 | 3 | 4 | **High (12)** | Cloudflare DDoS protection (unmetered); origin IP concealment; WAF rate limiting; see TWN-OPS-2026-006 (DDoS Mitigation Plan) |
| T-PUB-06 | **D** | Application-layer (L7) DDoS targeting search endpoint or heavy API queries | P-05 (Meilisearch) | 3 | 3 | **Medium (9)** | Rate limiting per IP on search API; Cloudflare WAF challenge for anomalous traffic; query complexity limits on Meilisearch |
| T-PUB-07 | **I** | Sensitive data exposed in client-side JavaScript bundles (API keys, internal paths) | P-01 (Astro) | 3 | 3 | **Medium (9)** | Server-side environment variable handling (`NEXT_PUBLIC_` / Astro private env distinction); bundle analysis in CI; secret scanning in pre-commit hooks |
| T-PUB-08 | **R** | Attacker denies submitting contact form or inquiry; no audit trail | P-06 (Form Handler) | 2 | 2 | **Low (4)** | Server-side form submission log with IP, timestamp, form data hash; Postmark delivery receipts retained |

---

## 7. Threat Analysis — Authentication & Session Management

Components: EE-03, P-03, P-04, DS-01, DF-04, DF-08 | Trust Boundary: TB-5, TB-6

| Threat ID | STRIDE | Threat Description | Component | L | I | Risk | Mitigations |
|---|---|---|---|---|---|---|---|
| T-AUTH-01 | **S** | Credential stuffing — attacker uses leaked credential databases to gain CMS admin access | P-03 (Strapi Admin) | 4 | 5 | **Critical (20)** | MFA enforced for all admin accounts (TOTP/passkey); breached password detection (HaveIBeenPwned API); progressive account lockout after 5 failures; admin IP allowlist (TWN-SEC-2026-002) |
| T-AUTH-02 | **S** | JWT token forging — attacker forges JWT using weak secret or `none` algorithm | DF-03, DF-08 | 2 | 5 | **High (10)** | RS256 asymmetric signing (private key server-side only); `alg` field validated; token expiry enforced (15 min access, 7 day refresh); see TWN-SEC-2026-002 §5 |
| T-AUTH-03 | **T** | JWT token replay after logout — attacker uses captured valid token post-revocation | DS-01 (token store) | 3 | 4 | **High (12)** | Token blocklist (Redis/DB) for revoked tokens; short access token lifetime (15 min); refresh token rotation on each use |
| T-AUTH-04 | **I** | Session token theft via XSS — attacker steals session cookie through injected script | P-01, P-03 | 3 | 5 | **Critical (15)** | `HttpOnly; Secure; SameSite=Strict` cookies; strict CSP blocking inline scripts (TWN-SEC-2026-005); XSS protection via output encoding; DOM sanitization |
| T-AUTH-05 | **I** | OAuth authorization code interception (Partner Portal) — attacker intercepts code in redirect | P-04 (Better Auth) | 2 | 4 | **High (8)** | PKCE (Proof Key for Code Exchange) enforced on all OAuth flows; state parameter validated; short code expiry (60 seconds) |
| T-AUTH-06 | **E** | Privilege escalation — low-privilege CMS user accesses admin-only endpoints via IDOR or missing RBAC check | P-02, P-03 | 3 | 5 | **Critical (15)** | Role-based access control (RBAC) enforced at API middleware level; endpoint-level permission checks; automated RBAC regression tests; see TWN-SEC-2026-002 §8 |
| T-AUTH-07 | **R** | Admin denies making configuration change; no audit trail | P-03 (Strapi Admin) | 2 | 3 | **Medium (6)** | Strapi audit log capturing all admin actions (user, action, resource, timestamp, IP); logs shipped to append-only store; 90-day retention |
| T-AUTH-08 | **D** | Account enumeration via login endpoint — attacker determines valid usernames from response timing/message | P-03, P-04 | 4 | 2 | **Medium (8)** | Uniform error messages for invalid credentials; constant-time comparison; same response time regardless of user existence |
| T-AUTH-09 | **S** | Phishing attack targeting CMS admin — attacker creates lookalike domain and harvests credentials | EE-03 | 3 | 4 | **High (12)** | FIDO2/WebAuthn passkey authentication (phishing-resistant); MFA; security awareness training; DMARC/SPF/DKIM on twinmos.com email domain |
| T-AUTH-10 | **E** | Partner portal user accesses another partner's data via IDOR (Insecure Direct Object Reference) | P-04, DS-01 | 3 | 4 | **High (12)** | Tenant isolation at database query level; all queries scoped by `partner_id`; IDOR automated testing in pentest plan (TWN-OPS-2026-001) |

---

## 8. Threat Analysis — CMS & Content Management

Components: EE-03, P-02, P-03, DS-01, DS-02, DF-04, DF-05, DF-06 | Trust Boundary: TB-4, TB-5

| Threat ID | STRIDE | Threat Description | Component | L | I | Risk | Mitigations |
|---|---|---|---|---|---|---|---|
| T-CMS-01 | **T** | Unauthorized content modification — attacker with stolen admin credentials deffaces website | P-03, DS-01 | 2 | 5 | **High (10)** | MFA on all admin accounts; content change audit log; staging environment review before publish; Cloudflare page rules cache purge on deploy |
| T-CMS-02 | **I** | Strapi API exposes draft/unpublished content to unauthenticated API consumers | P-02 | 3 | 3 | **Medium (9)** | Published-only flag enforced in all public API queries; unpublished content requires Bearer token; API endpoint testing in CI |
| T-CMS-03 | **T** | SQL injection via Strapi API filters — attacker manipulates ORM queries via crafted filter parameters | P-02, DS-01 | 2 | 5 | **High (10)** | Strapi v5 uses parameterized queries (Knex.js); ORM-layer input validation; WAF SQL injection ruleset (Cloudflare + ModSecurity CRS); see TWN-OPS-2026-005 |
| T-CMS-04 | **I** | Insecure Direct Object Reference — attacker accesses restricted content via predictable IDs | P-02 | 3 | 3 | **Medium (9)** | UUID-based resource IDs (non-sequential); authorization check before every resource return; IDOR testing in pentest scope |
| T-CMS-05 | **T** | Malicious file upload via CMS media manager — attacker uploads executable/malicious content | P-02, DS-02 | 2 | 4 | **High (8)** | File type allowlist (jpg, png, webp, pdf, svg only); MIME type validation server-side; file size limits; storage to Backblaze B2 (not executable); virus scan on upload (ClamAV or cloud equivalent) |
| T-CMS-06 | **D** | GraphQL introspection abuse / deeply nested query DoS | P-02 | 3 | 3 | **Medium (9)** | GraphQL introspection disabled in production; query depth limit (max 7 levels); query complexity scoring; per-IP rate limiting on /graphql |
| T-CMS-07 | **E** | Strapi plugin vulnerability — attacker exploits unpatched 3rd-party Strapi plugin for RCE | P-02, P-03 | 2 | 5 | **High (10)** | Dependency security scanning (TWN-OPS-2026-004); automated vulnerability alerts (Dependabot + Snyk); plugin allowlist — only vetted plugins installed; weekly automated patching |
| T-CMS-08 | **R** | Content deletion without audit trail — administrator purges product records; no recovery path | DS-01 | 2 | 4 | **High (8)** | Soft-delete (is_deleted flag) rather than hard delete; full audit log of deletions with actor, timestamp; daily database backup (TWN-SEC-2026-007); point-in-time recovery (PITR) |

---

## 9. Threat Analysis — Contact Forms & Lead Generation

Components: EE-01, P-06, EE-07, DS-01, DF-07 | Trust Boundary: TB-1

| Threat ID | STRIDE | Threat Description | Component | L | I | Risk | Mitigations |
|---|---|---|---|---|---|---|---|
| T-FORM-01 | **T** | Spam / bot form submission — automated bots flood contact forms with garbage data | P-06 | 5 | 2 | **Medium (10)** | hCaptcha / Cloudflare Turnstile (privacy-respecting CAPTCHA); honeypot fields; rate limiting per IP (5 submissions / 10 min); Cloudflare Bot Management |
| T-FORM-02 | **I** | Contact form data intercepted in transit | DF-07 (to Postmark) | 1 | 4 | **Low (4)** | TLS 1.3 on all connections; Postmark uses TLS for SMTP relay; end-to-end transit encryption |
| T-FORM-03 | **T** | XSS payload injected via form fields — stored and reflected to admin who reviews submissions | P-06, P-03 | 3 | 3 | **Medium (9)** | Server-side HTML entity encoding of all form input; CSP blocks script execution in admin UI; DOMPurify sanitization if input is rendered in browser |
| T-FORM-04 | **I** | Excessive data collection — forms request more personal data than necessary, violating GDPR minimization | P-06 | 2 | 3 | **Medium (6)** | Privacy by Design checklist (TWN-COMP-2026-006) applied to all forms; data minimization review before launch; required vs. optional fields documented |
| T-FORM-05 | **D** | Email bombing — attacker uses form to flood internal mailbox with thousands of submissions | P-06, EE-07 | 4 | 2 | **Medium (8)** | Rate limiting; CAPTCHA; Cloudflare WAF custom rule blocking high-frequency form POSTs from single IP range |

---

## 10. Threat Analysis — Partner Portal & API (Phase 2)

Components: EE-02, P-04, P-02, DS-01, DF-08 | Trust Boundary: TB-6

| Threat ID | STRIDE | Threat Description | Component | L | I | Risk | Mitigations |
|---|---|---|---|---|---|---|---|
| T-PART-01 | **S** | Attacker impersonates a legitimate distributor to access partner pricing and inventory data | P-04, DS-01 | 3 | 4 | **High (12)** | Invitation-only registration; email domain verification; manual partner approval workflow; MFA enforced for all partner accounts |
| T-PART-02 | **I** | API over-fetching — partner API response includes data fields belonging to other partners | P-02 | 2 | 4 | **High (8)** | Response field filtering per RBAC role; automated schema conformance tests; penetration testing of API (TWN-OPS-2026-001) |
| T-PART-03 | **E** | Horizontal privilege escalation — partner A modifies URL/API parameter to access partner B's resources | P-04, DS-01 | 3 | 4 | **High (12)** | All API queries include `WHERE partner_id = :current_partner` at ORM level; IDOR testing in CI via automated security scan |
| T-PART-04 | **D** | Partner API abuse — high-frequency automated API calls to scrape pricing data | P-02 (API) | 3 | 3 | **Medium (9)** | API rate limiting (100 req/min per authenticated partner); anomaly detection alerts for burst traffic; API key rotation on abuse detection |
| T-PART-05 | **T** | Attacker tampers with order/quote data in transit to manipulate pricing | DF-08, P-04 | 2 | 4 | **High (8)** | TLS 1.3 for all API communications; HMAC request signing for sensitive partner API actions; server-side price calculation (never trust client-side) |
| T-PART-06 | **R** | Partner denies placing order or requesting quote; dispute with TwinMOS over terms | DS-01 | 2 | 3 | **Medium (6)** | Immutable order audit log with timestamp, partner ID, session token hash; PDF order confirmation emails via Postmark with request ID |

---

## 11. Threat Analysis — E-Commerce & Checkout (Phase 3)

Components: EE-04, P-02, EE-06 (Stripe), DS-01, DF-10 | Trust Boundary: TB-7

| Threat ID | STRIDE | Threat Description | Component | L | I | Risk | Mitigations |
|---|---|---|---|---|---|---|---|
| T-ECOM-01 | **S** | Stolen payment card testing — attackers use checkout to validate stolen card numbers at low amounts | P-02, EE-06 | 4 | 4 | **Critical (16)** | Stripe Radar fraud scoring; CAPTCHA on checkout initiation; velocity checks (max 3 card attempts per IP per hour); Cloudflare Bot Management |
| T-ECOM-02 | **T** | Price manipulation — attacker intercepts/modifies cart total in client-server communication | P-02 | 3 | 4 | **High (12)** | Server-side price calculation only; cart total re-validated at checkout submission; signed cart tokens |
| T-ECOM-03 | **I** | Payment data exposure — cardholder data leaked via logs, error messages, or API responses | DS-04 (Logs), P-02 | 2 | 5 | **High (10)** | PCI DSS SAQ A scope: Stripe handles all CHD via redirect/iFrame; no PAN ever touches TwinMOS servers; log scrubbing rules prevent card data in logs |
| T-ECOM-04 | **D** | Inventory lock attack — attacker repeatedly adds all stock to cart without purchasing, blocking legitimate buyers | P-02, DS-01 | 3 | 3 | **Medium (9)** | Cart reservation timeout (15 min); authenticated-only checkout for high-demand products; stock released on timeout |
| T-ECOM-05 | **E** | Coupon/discount abuse — attacker programmatically applies multiple single-use discount codes | P-02, DS-01 | 3 | 3 | **Medium (9)** | Server-side coupon validation; one-use tracking in database; rate limiting on coupon application endpoint; CAPTCHA for suspicious usage patterns |
| T-ECOM-06 | **R** | Customer disputes purchase; no audit trail linking order to session | DS-01 | 2 | 4 | **High (8)** | Immutable order records with Stripe payment intent ID, customer email, timestamp, IP (hashed); order confirmation email with full details; 7-year retention for financial records |

---

## 12. Residual Risk Register

Threats where residual risk remains after mitigations are applied:

| Threat ID | Description | Residual Risk | Acceptance Rationale | Owner | Review Date |
|---|---|---|---|---|---|
| T-PUB-03 | Supply chain JS injection via third-party CDN | **Medium** | SRI + CSP provide strong mitigation; zero third-party CDN scripts in P1 | Dev Lead | Q3 2026 |
| T-AUTH-09 | Phishing targeting CMS admin | **Low** | Passkey (phishing-resistant) mitigates near-completely; residual risk from social engineering | Security Lead | Q2 2026 |
| T-CMS-07 | Strapi plugin RCE via unpatched dependency | **Low** | Automated scanning + plugin allowlist; patching SLA of 24h for Critical | DevOps | Ongoing |
| T-ECOM-01 | Card testing at checkout (P3) | **Medium** | Stripe Radar + CAPTCHA significantly reduces; some automated attacks inevitable; Stripe fraud liability shift | Legal / Finance | Pre-P3 launch |
| T-PART-01 | Partner impersonation | **Low** | Invitation-only + email verification + MFA; residual risk from credential phishing | Security Lead | Q3 2026 |

---

## 13. Mitigation Coverage Summary

| STRIDE Category | Total Threats | Critical | High | Medium | Low | Primary Mitigation Layer |
|---|---|---|---|---|---|---|
| Spoofing (S) | 8 | 2 | 5 | 1 | 0 | MFA, JWT RS256, PKCE, IP allowlist |
| Tampering (T) | 11 | 1 | 6 | 3 | 1 | Input validation, WAF, CSP, SRI, server-side calculation |
| Repudiation (R) | 5 | 0 | 2 | 2 | 1 | Audit logging, immutable records, Postmark receipts |
| Information Disclosure (I) | 10 | 1 | 5 | 4 | 0 | TLS, RBAC, output encoding, PCI SAQ A scope |
| Denial of Service (D) | 6 | 0 | 2 | 4 | 0 | Cloudflare DDoS, rate limiting, WAF rules |
| Elevation of Privilege (E) | 3 | 1 | 2 | 0 | 0 | RBAC, tenant isolation, IDOR testing |
| **Total** | **43** | **5** | **22** | **14** | **2** | |

### 13.1 Control Coverage Map

| Control Category | Threats Addressed | Reference Document |
|---|---|---|
| Cloudflare WAF & DDoS | T-PUB-01,02,05,06; T-FORM-01,05; T-PART-04 | TWN-OPS-2026-005 (WAF Config) |
| Authentication & MFA | T-AUTH-01,02,03,04,09; T-PART-01 | TWN-SEC-2026-002 (Auth Spec) |
| CSP & Security Headers | T-PUB-03,07; T-AUTH-04; T-FORM-03 | TWN-SEC-2026-005 (CSP), TWN-SEC-2026-006 (Headers) |
| RBAC & Authorization | T-AUTH-06,10; T-PART-02,03; T-CMS-02,04 | TWN-SEC-2026-002 §8 |
| Input Validation & Encoding | T-CMS-03,05; T-FORM-03 | OWASP Top 10 Coverage (TWN-SEC-2026-009) |
| Audit Logging | T-AUTH-07,08; T-CMS-08; T-PART-06; T-ECOM-06 | Security Architecture §10 |
| Dependency Scanning | T-CMS-07 | TWN-OPS-2026-004 (Dependency Scanning) |
| DDoS Mitigation | T-PUB-05,06; T-PART-04 | TWN-OPS-2026-006 (DDoS Plan) |
| PCI DSS Controls | T-ECOM-01,02,03,06 | TWN-COMP-2026-007 (PCI DSS Scope) |

---

## 14. Governance & Review

### 14.1 Threat Model Lifecycle

| Activity | Frequency | Trigger | Owner |
|---|---|---|---|
| Threat model review | Annual | Calendar | Security Architect |
| Threat model update | On-demand | Major architecture change, new feature, new phase launch | Dev Lead + Security |
| New feature threat assessment | Per feature | Sprint planning for security-sensitive features | Dev Lead |
| Post-incident threat model update | Post-incident | Any P0 or P1 security incident | CISO |
| External validation | Annual | Tied to penetration testing cycle (TWN-OPS-2026-001) | External Security Firm |

### 14.2 Roles & Responsibilities

| Role | Responsibility |
|---|---|
| **Security Architect / CISO** | Threat model ownership, final risk acceptance decisions |
| **Development Lead** | Implementing mitigations in code; flagging new threats during development |
| **DevOps Engineer** | Infrastructure-level mitigations (WAF rules, network policy, secrets management) |
| **Legal Counsel** | Regulatory risk acceptance; GDPR/PDPL implications of residual risks |
| **Product Owner** | Business risk acceptance; feature-level trade-offs |
| **External Pen Tester** | Validates mitigation effectiveness (TWN-OPS-2026-001) |

### 14.3 Threat Model Update Triggers

The following events **must** trigger an immediate threat model review:

1. Addition of a new user authentication flow
2. New external API integration (third-party service)
3. Change in data storage (new data types, new store)
4. Launch of a new major phase (P2 Partner Portal, P3 E-Commerce)
5. Discovery of a Critical or High severity vulnerability in production
6. Change in regulatory requirements (new market, new data protection law)
7. Major technology stack change (framework upgrade, platform migration)

---

## Appendix A — STRIDE Quick Reference

### A.1 STRIDE Threat Examples by Component Type

| Component Type | S | T | R | I | D | E |
|---|---|---|---|---|---|---|
| **Web Server** | DNS spoofing | File tampering | Log deletion | Directory traversal | Flooding | Privilege files |
| **Database** | DB impersonation | SQL injection | Log tampering | Query result disclosure | Connection exhaustion | DB user escalation |
| **API Endpoint** | Token forging | Request replay | Action denial | Response over-fetching | Rate abuse | Role bypass |
| **Authentication** | Credential stuffing | Password reset abuse | Auth log deletion | Credential exposure | Login DoS | MFA bypass |
| **Third-Party Service** | Provider impersonation | Response tampering | Webhook replay | Data sharing | Provider outage | Scope creep |

### A.2 STRIDE-to-OWASP Mapping

| STRIDE Category | OWASP Top 10 Equivalent |
|---|---|
| Spoofing | A07:2021 Identification & Authentication Failures |
| Tampering | A03:2021 Injection; A08:2021 Software & Data Integrity Failures |
| Repudiation | A09:2021 Security Logging & Monitoring Failures |
| Information Disclosure | A02:2021 Cryptographic Failures; A05:2021 Security Misconfiguration |
| Denial of Service | A06:2021 Vulnerable Components; Rate limiting gaps |
| Elevation of Privilege | A01:2021 Broken Access Control; A04:2021 Insecure Design |

---

## Appendix B — Requirements Traceability

| Threat ID | BRD Requirement | URD Requirement | Implementation Phase |
|---|---|---|---|
| T-AUTH-01,02 | BRD §21.3 | URD §34.2 | P1 |
| T-AUTH-06,10 | BRD §21.4 | URD §34.5 | P1 / P2 |
| T-PUB-05 | BRD §21.1 | URD §34.1 | P1 |
| T-CMS-03,05 | BRD §21.2 | URD §34.3 | P1 |
| T-PART-01,02,03 | BRD §21.5 | URD §34.6 | P2 |
| T-ECOM-01,02,03 | BRD §21.6 | URD §34.7 | P3 |

---

*Document ID: TWN-SEC-2026-010 | Version 1.0.0 | Classification: Confidential | © 2026 TwinMOS Technologies. All rights reserved.*
