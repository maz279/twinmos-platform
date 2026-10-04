# TwinMOS Corporate Website - Authentication & Authorization Specification

**Document Reference:** TWN-SEC-2026-004
**Document Version:** 1.0
**Status:** FINAL
**Date:** 2 May 2026
**Prepared by:** TwinMOS Digital Transformation Team
**Owner:** IT/Technical Lead / Legal Counsel
**Classification:** CONFIDENTIAL - Internal Use
**Synchronized With:** Tech Stack v1.1, BRD v3.0, URD v3.0

---

## Change Log

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | 2 May 2026 | Initial release |

---

## Document Governance

| Role | Name | Sign-Off | Date |
|------|------|----------|------|
| Project Sponsor | Mohd Mazharul Islam | _______________ | _________ |
| IT/Technical Lead | (TBC) | _______________ | _________ |
| Unisoft Security Lead | (TBC) | _______________ | _________ |

---

## Table of Contents

1. Executive Summary
2. Identity Domains Overview
3. CMS Editorial Auth
4. Partner Portal Auth
5. E-Commerce Customer Auth
6. Anonymous Visitor Identity
7. Registered Product Owner Auth
8. Password Policy
9. Multi-Factor Authentication
10. Session Management
11. Account Lockout
12. RBAC Matrix
13. API Authentication
14. OAuth 2.0 / OIDC
15. Token Lifecycle
16. Audit Logging
17. Compliance Mapping
18. Implementation Checklist

---

## 1. Executive Summary

This document specifies the complete authentication and authorization architecture for the TwinMOS corporate website. The system supports five distinct identity domains across three project phases:

| Domain | Auth Mechanism | Phase | Users |
|--------|----------------|-------|-------|
| CMS Editorial Users | Strapi Users-Permissions + JWT + MFA | P1 | 5-20 internal staff |
| Partner Portal (Distributors/OEM) | Better Auth + MFA + RBAC | P2 | < 1% traffic; invited only |
| E-Commerce Customers | Better Auth (single account model) | P3 | Scale with commerce |
| Registered Product Owners | Light email-based (magic links) | P1 | 5-8% traffic |
| Anonymous Visitors | None (rate-limited) | P1 | 85-90% traffic |

Key Security Principles:
- Defense in depth: MFA enforced for all privileged accounts
- Least privilege: RBAC with 7+ granular roles
- Zero trust: All API calls authenticated and authorized
- Privacy by design: Minimal PII collection; consent-gated

---

## 2. Identity Domains Overview

### 2.1 Identity Domain Matrix

| Attribute | CMS Users | Partner Portal | E-Commerce | Product Owners | Anonymous |
|-----------|-----------|----------------|------------|----------------|-----------|
| Authentication | JWT (RS256) + TOTP MFA | Better Auth + TOTP MFA | Better Auth (optional MFA) | Email magic link | None |
| Authorization | Strapi RBAC | Better Auth RBAC + Strapi gated content | Medusa RBAC | None (read-own-data only) | Rate limiting |
| Session TTL | 8h absolute / 30min idle | 8h absolute / 30min idle | 30 days (remember me) | 24h magic link | n/a |
| Password Required | Yes (>=12 chars) | Yes (>=12 chars) | Yes (>=8 chars) | No | n/a |
| Account Creation | Admin-only (BR-10.1) | Invitation-only (BR-7.1) | Self-registration | Self-service | n/a |
| Data Residency | EU (Hetzner DE) | EU (Hetzner DE) | EU (Hetzner DE) | EU (Hetzner DE) | Edge (Cloudflare) |

### 2.2 Trust Boundaries

```
ZONE 0 - Internet (Untrusted)
  Anonymous visitors, bots, attackers
ZONE 1 - Cloudflare Edge (Partial Trust)
  TLS termination, WAF, bot filtering, rate limiting
ZONE 2 - Public Frontend (Low Trust)
  Astro SSG/ISR pages, public API read endpoints
ZONE 3 - Application Backend (Medium Trust)
  Strapi CMS, Better Auth service, Medusa (P3)
ZONE 4 - Data Layer (High Trust)
  PostgreSQL, MeiliSearch, Redis cache
ZONE 5 - Admin / Partner Portal (High Trust)
  CMS admin UI, partner dashboard, privileged APIs
```

---

## 3. CMS Editorial Auth

### 3.1 Authentication Mechanism

| Aspect | Specification |
|--------|---------------|
| Plugin | @strapi/plugin-users-permissions (bundled with Strapi v5) |
| Protocol | JWT (JSON Web Token) |
| Algorithm | RS256 (asymmetric - RSA with SHA-256) |
| Access Token TTL | 1 hour (3,600 seconds) |
| Refresh Token | Rotating - single-use; new refresh issued on each access-token refresh |
| Key Storage | Private key in Coolify secrets; public key at /.well-known/jwks.json |
| Token Storage (Browser) | Access token: memory (JS variable); Refresh token: HttpOnly + Secure + SameSite=Strict cookie |

### 3.2 RS256 Key Management

```
Key Pair Generation (Sprint 0):
  - openssl genrsa -out strapi-jwt-private.pem 2048
  - openssl rsa -in strapi-jwt-private.pem -pubout -out strapi-jwt-public.pem

Deployment:
  - Private key -> Coolify environment variable (STRAPI_JWT_PRIVATE_KEY)
  - Public key -> Served at https://api.twinmos.com/.well-known/jwks.json
  - Key rotation: Annual, with 7-day overlap period
```

### 3.3 JWT Token Structure

Header:
  alg: RS256
  typ: JWT
  kid: twinmos-2026-primary

Payload (Claims):
  sub: user-uuid-from-strapi
  email: editor@twinmos.com
  role: editor
  iat: 1714646400
  exp: 1714650000
  jti: unique-token-id-for-revocation
  iss: https://api.twinmos.com
  aud: twinmos-cms-admin

### 3.4 Login Flow

1. User navigates to https://admin.twinmos.com
2. Enters email + password
3. Strapi validates credentials against PostgreSQL (bcrypt hash)
4. If MFA enabled -> TOTP challenge presented
5. User enters 6-digit TOTP code
6. Strapi issues access token (RS256 JWT, 1h TTL) and refresh token (HttpOnly cookie)
7. Frontend stores access token in memory
8. All subsequent API calls include: Authorization: Bearer <access_token>

### 3.5 Token Refresh Flow

1. Access token expires (1 hour)
2. Frontend detects 401 Unauthorized
3. Frontend calls POST /api/auth/refresh with HttpOnly refresh cookie
4. Server validates refresh token against database
5. Server issues NEW access token + NEW refresh token
6. OLD refresh token invalidated (single-use enforcement)
7. If OLD refresh token presented again -> session revoked (theft detection)

### 3.6 Token Revocation Triggers

| Trigger | Action | Logged |
|---------|--------|--------|
| User logout | Blacklist both tokens | Yes |
| Password change | Revoke all sessions | Yes |
| Role change | Revoke all sessions | Yes |
| Suspected compromise | Admin-triggered revocation | Yes |
| Refresh token reuse | Immediate session revocation | Yes + Alert |
| 8-hour absolute timeout | Automatic expiration | Yes |

---

## 4. Partner Portal Auth

### 4.1 Better Auth Configuration

| Aspect | Specification |
|--------|---------------|
| Library | Better Auth ^1.x |
| Storage | PostgreSQL (same Hetzner instance, sessions_* schema) |
| Session Type | Database sessions with rotating session cookies |
| Cookie Name | __Host-twinmos-session |
| Cookie Flags | HttpOnly, Secure, SameSite=Strict, __Host- prefix |
| Session TTL | 8 hours absolute / 30 minutes idle |
| MFA | TOTP mandatory for all distributor accounts; WebAuthn passkeys optional |
| OAuth Providers | Google, Microsoft (for OEM/system-builder convenience) |
| Magic Links | Email-based passwordless as fallback |
| Multi-Tenancy | Built-in teams/roles (Marketing vs Procurement per UC-32) |
| API Keys | For programmatic distributor access to product feeds |
| Bot Protection | Cloudflare Turnstile gate on login page |

### 4.2 Partner Portal Login Flow

User -> https://partner.twinmos.com/login
     -> React island posts credentials to /api/auth/login
     -> Better Auth validates against PostgreSQL
     -> If TOTP enrolled -> MFA challenge screen
     -> User enters TOTP code
     -> Better Auth creates database session
     -> Set-Cookie: __Host-twinmos-session=<session_id>
     -> Redirect to /partner/dashboard

User -> /partner/dashboard
     -> Astro Server Island reads session cookie
     -> Validates session with Better Auth
     -> Queries Strapi with role-scoped permissions
     -> Returns gated content (price lists, assets, marketing materials)

### 4.3 Partner RBAC

| Role | Permissions |
|------|-------------|
| Partner Admin | Full portal access; manage team members; view all assets and price lists |
| Partner Marketing | Read-only access to partner asset library; download marketing materials |
| Partner Procurement | Access to gated price-list (watermarked PDF); view MOQ and volume tiers |
| OEM Partner | Access to NDA-protected engineering datasheets; co-branding assets |
| System Builder | Access to system-builder program resources; bulk pricing |

### 4.4 Price List Security

| Control | Implementation |
|---------|----------------|
| Access Control | Only Partner Procurement and Partner Admin roles |
| Watermarking | PDF generated with distributor name + date + download ID |
| Download Tracking | Each download logged with user ID, timestamp, IP address |
| Expiry | Price lists valid for 30 days; auto-expire after revision |
| No Print/Copy | PDF DRM flags (best-effort) |

---

## 5. E-Commerce Customer Auth

### 5.1 Authentication Model

| Aspect | Specification |
|--------|---------------|
| Library | Better Auth (same instance as Partner Portal) |
| Account Model | Single account - Partner Portal and E-Commerce share auth backend |
| Self-Registration | Allowed with email verification |
| Password Policy | >= 8 characters, mixed case + number |
| MFA | Optional TOTP for customer accounts |
| Social Login | Google, Apple Pay (for checkout convenience) |
| Session TTL | 30 days with "Remember Me"; 8 hours without |

### 5.2 Checkout Authentication

| Scenario | Behavior |
|----------|----------|
| Guest checkout | Allowed; no account required; email collected for order confirmation |
| Registered user | Pre-filled shipping/billing; order history accessible |
| Partner account | B2B pricing applied automatically; volume discounts visible |

---

## 6. Anonymous Visitor Identity

### 6.1 Characteristics

- No authentication required
- Rate-limited: 100 requests/minute per IP (Cloudflare + Strapi middleware)
- Cookie consent banner may set functional cookies (localStorage preference)
- No PII collected without explicit consent

### 6.2 Anti-Abuse Controls

| Control | Implementation |
|---------|----------------|
| Rate limiting | Cloudflare: 100 req/min; Strapi: 100 req/min |
| Bot detection | Cloudflare Bot Fight Mode + Turnstile on forms |
| Geo-blocking | Admin routes blocked to non-office IPs |
| DDoS protection | Cloudflare unmetered L3/4/7 mitigation |

---

## 7. Registered Product Owner Auth

### 7.1 Use Cases

- Warranty registration lookup
- RMA status tracking
- Firmware download (serial number validation)

### 7.2 Authentication Method

| Aspect | Specification |
|--------|---------------|
| Mechanism | Email-based magic link (passwordless) |
| Flow | User enters email -> receives timed magic link -> clicks to access |
| Magic Link TTL | 15 minutes |
| Single-Use | Yes - link invalidated after first use or expiry |
| Data Access | Read-only access to own warranty registrations and RMAs |

### 7.3 Serial Number Check (Anti-Counterfeit)

- Anonymous access
- Rate-limited: 5 lookups/IP/minute
- Turnstile gate after 3 lookups
- No authentication required

---

## 8. Password Policy

### 8.1 Password Requirements

| Role | Min Length | Complexity | Rotation | History |
|------|-----------|------------|----------|---------|
| Super Admin | 16 chars | Upper + lower + number + symbol + no dictionary | 60 days | Last 12 |
| Admin | 14 chars | Upper + lower + number + symbol | 90 days | Last 10 |
| Editor | 12 chars | Upper + lower + number + symbol | 90 days | Last 8 |
| Author | 12 chars | Upper + lower + number + symbol | 90 days | Last 8 |
| Partner Admin | 14 chars | Upper + lower + number + symbol | 90 days | Last 10 |
| Partner User | 12 chars | Upper + lower + number + symbol | 90 days | Last 8 |
| E-Commerce Customer | 8 chars | Upper + lower + number | Optional | Last 5 |

### 8.2 Password Storage

| Aspect | Implementation |
|--------|----------------|
| Hashing Algorithm | bcrypt with cost factor 12 (adaptive) |
| Salt | Per-user random 16-byte salt |
| Pepper | Optional - global secret added to hash (stored in Coolify secrets) |
| Migration | If upgrading from older hash, re-hash on next login |

### 8.3 Password Reset Flow

1. User clicks "Forgot Password"
2. Enters registered email address
3. System sends reset link (valid 1 hour) to email
4. User clicks link -> password reset form
5. New password validated against policy
6. All existing sessions revoked
7. Audit log entry created

### 8.4 Breached Password Detection

- Integration with Have I Been Pwned API (k-anonymity model)
- Checked at registration and password change
- If breached -> block use + force different password

---

## 9. Multi-Factor Authentication

### 9.1 MFA Enforcement Matrix

| Identity Domain | MFA Required | Method | Enrollment |
|-----------------|--------------|--------|------------|
| Super Admin | Mandatory | TOTP | First login |
| Admin | Mandatory | TOTP | First login |
| Editor | Recommended | TOTP | Optional (admin-enrollable) |
| Author | Optional | TOTP | Self-service |
| Partner Admin | Mandatory | TOTP | Account creation |
| Partner User | Mandatory | TOTP | Account creation |
| E-Commerce Customer | Optional | TOTP / WebAuthn | Self-service |

### 9.2 TOTP Configuration

| Aspect | Specification |
|--------|---------------|
| Algorithm | TOTP (RFC 6238) |
| Digits | 6 |
| Period | 30 seconds |
| Hash | SHA-1 (default) / SHA-256 (preferred) |
| Issuer | "TwinMOS" |
| Account Name | user email address |
| QR Code | Displayed once at enrollment; never stored |
| Backup Codes | 10 single-use recovery codes generated at enrollment |

### 9.3 MFA Recovery

| Scenario | Process |
|----------|---------|
| Lost authenticator | Use recovery code -> re-enroll new device |
| Lost recovery codes | Admin verification required -> identity proofing -> reset MFA |
| Account lockout | Admin unlock + optional MFA reset |

### 9.4 WebAuthn / Passkeys (Phase 2+)

| Aspect | Specification |
|--------|---------------|
| Standard | WebAuthn Level 2 |
| Usage | Optional for Partner Portal and E-Commerce |
| Platform | Windows Hello, Touch ID, Face ID, Android biometric |
| Security Key | YubiKey, Titan Security Key supported |
| Backup | TOTP remains as fallback |

---

## 10. Session Management

### 10.1 Session Parameters

| Parameter | CMS Users | Partner Portal | E-Commerce |
|-----------|-----------|----------------|------------|
| Idle Timeout | 30 minutes | 30 minutes | 30 minutes (optional 7 days) |
| Absolute Timeout | 8 hours | 8 hours | 30 days (with Remember Me) |
| Concurrent Sessions | 2 per user | 1 per user | 3 per user |
| Warning Before Expiry | 25-minute countdown | 25-minute countdown | 5-minute countdown |
| Logout on Close | No (persistent cookie) | No (persistent cookie) | Optional |

### 10.2 Session Security

| Control | Implementation |
|---------|----------------|
| Cookie Prefix | __Host- (prevents subdomain cookie injection) |
| HttpOnly | Yes - prevents XSS theft |
| Secure | Yes - HTTPS only |
| SameSite | Strict - prevents CSRF |
| Domain | Exact match (no wildcard) |
| Path | / |

### 10.3 Concurrent Session Handling

| Scenario | Action |
|----------|--------|
| Exceed max concurrent sessions | Oldest session invalidated |
| Login from new device | Email notification to user |
| Suspicious location | Additional MFA challenge + email alert |

---

## 11. Account Lockout

### 11.1 Account Lockout Policy

| Trigger | Action | Duration | Notification |
|---------|--------|----------|--------------|
| 5 failed login attempts | Temporary lockout | 30 minutes | Email to user |
| 10 failed attempts | Extended lockout | 24 hours | Email + Slack #security alert |
| 20 failed attempts | Account disabled | Until admin review | Email + Slack #security alert + audit log |
| Failed MFA 5 times | Lockout | 30 minutes | Email to user |

### 11.2 IP-Based Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| /api/auth/local | 10 requests | 1 minute |
| /api/auth/refresh | 20 requests | 1 minute |
| /api/auth/forgot-password | 5 requests | 1 hour |
| /partner/login | 10 requests | 1 minute |
| /api/auth/register | 5 requests | 1 hour |

### 11.3 Anomaly Detection

| Anomaly | Detection | Response |
|---------|-----------|----------|
| Login from new country | GeoIP comparison | MFA challenge + email alert |
| Login at unusual time | Time-of-day baseline | Email notification |
| Multiple failed attempts across IPs | Distributed brute force | CAPTCHA challenge + rate limit |
| Credential stuffing pattern | Known breached credential list | Block + alert |

---

## 12. RBAC Matrix

### 12.1 CMS Roles & Permissions (Strapi)

| Permission | Super Admin | Admin | Editor | Author | Viewer |
|------------|-------------|-------|--------|--------|--------|
| Content Management |
| Create content | Yes | Yes | Yes | Yes (own only) | No |
| Edit any content | Yes | Yes | Yes | No | No |
| Edit own content | Yes | Yes | Yes | Yes | No |
| Publish content | Yes | Yes | Yes | No | No |
| Delete content | Yes | Yes | Yes | No | No |
| Product Management |
| Create products | Yes | Yes | Yes | No | No |
| Edit products | Yes | Yes | Yes | No | No |
| Edit product specs | Yes | Yes | Workflow gate | No | No |
| Publish products | Yes | Yes | Workflow gate | No | No |
| User Management |
| Create users | Yes | Yes | No | No | No |
| Edit users | Yes | Yes | No | No | No |
| Delete users | Yes | Not Super Admin | No | No | No |
| Manage roles | Yes | No | No | No | No |
| System |
| Modify schema | Yes | No | No | No | No |
| Install plugins | Yes | No | No | No | No |
| View audit logs | Yes | Yes | No | No | No |
| Manage webhooks | Yes | Yes | No | No | No |
| Forms |
| View submissions | Yes | Yes | Yes | No | Yes |
| Export submissions | Yes | Yes | Yes | No | No |
| Settings |
| Modify settings | Yes | Yes | No | No | No |

### 12.2 Partner Portal Roles (Better Auth + Strapi)

| Permission | Partner Admin | Partner Marketing | Partner Procurement | OEM Partner | System Builder |
|------------|---------------|-------------------|---------------------|-------------|----------------|
| Asset Library |
| View marketing assets | Yes | Yes | Yes | Yes | Yes |
| Download marketing assets | Yes | Yes | Yes | Yes | Yes |
| View co-branding assets | Yes | Yes | No | Yes | No |
| Price Lists |
| View price list | Yes | No | Yes | Yes | Yes |
| Download price list | Yes | No | Yes | Yes | Yes |
| View volume tiers | Yes | No | Yes | Yes | Yes |
| Engineering |
| View datasheets | Yes | No | No | Yes | No |
| View NDA materials | Yes | No | No | Yes | No |
| Account |
| Manage team members | Yes | No | No | No | No |
| View own profile | Yes | Yes | Yes | Yes | Yes |
| Orders (P3) |
| Place orders | Yes | No | Yes | Yes | Yes |
| View order history | Yes | No | Yes | Yes | Yes |

### 12.3 E-Commerce Roles (Medusa.js - Phase 3)

| Permission | Guest | Registered Customer | B2B Customer (Partner) |
|------------|-------|---------------------|------------------------|
| Browse catalog | Yes | Yes | Yes |
| View pricing | Yes | Yes | Yes (B2B rates) |
| Add to cart | Yes | Yes | Yes |
| Checkout | Yes | Yes | Yes |
| View order history | No | Yes | Yes |
| Manage addresses | No | Yes | Yes |
| Save payment methods | No | Yes | Yes |
| View invoices | No | Yes | Yes |

---

## 13. API Authentication

### 13.1 API Endpoint Classification

| Classification | Authentication | Rate Limit | Examples |
|----------------|----------------|------------|----------|
| Public Read | None | 100 req/min | Product list, news, retailers |
| Public Write | None + Turnstile | 10 req/10min | Contact forms, warranty registration |
| Authenticated Read | JWT | 1,000 req/min | Partner price lists, user profile |
| Authenticated Write | JWT | 1,000 req/min | CMS content edits, partner orders |
| Admin | JWT + MFA | 1,000 req/min | User management, system settings |

### 13.2 API Key Authentication (Partner Portal)

| Aspect | Specification |
|--------|---------------|
| Use Case | Programmatic access to product feeds, price lists, inventory |
| Format | X-API-Key: twpk_live_xxxxxxxxxxxxxxxx |
| Prefix | twpk_live_ (production), twpk_test_ (sandbox) |
| Length | 48 characters (256-bit entropy) |
| Rotation | 90 days; 7-day overlap |
| Scope | Per-key configurable (read-products, read-prices, read-inventory) |
| IP Whitelist | Optional - restrict to distributor office IPs |
| Rate Limit | 10,000 req/hour per key |
| Audit | Every API call logged with key ID, endpoint, timestamp, IP |

### 13.3 API Authorization Headers

CMS Admin API:
  GET /api/admin/users
  Authorization: Bearer <jwt_access_token>
  X-Request-ID: <uuid>

Partner Portal API:
  GET /api/partner/price-list
  Cookie: __Host-twinmos-session=<session_id>
  X-Request-ID: <uuid>

Programmatic API:
  GET /api/v1/products
  X-API-Key: twpk_live_xxxxxxxxxxxxxxxx
  X-Request-ID: <uuid>

---

## 14. OAuth 2.0 / OIDC

### 14.1 Supported Flows

| Flow | Use Case | Supported |
|------|----------|-----------|
| Authorization Code + PKCE | Partner Portal web login | Yes |
| Client Credentials | Machine-to-machine (API keys preferred) | Deferred |
| Device Code | CLI tools | Not needed |
| Implicit | Legacy SPA | Deprecated |

### 14.2 OAuth Providers (Phase 2)

| Provider | Client ID Storage | Scopes Requested | User Data Retrieved |
|----------|-------------------|------------------|---------------------|
| Google | Coolify secrets | openid email profile | Email, name, picture |
| Microsoft | Coolify secrets | openid email profile | Email, name, organization |

### 14.3 OAuth Security

| Control | Implementation |
|---------|----------------|
| State Parameter | Cryptographically random, validated on callback |
| PKCE | Required for all authorization code flows |
| Redirect URI Whitelist | Exact match - no wildcards |
| Token Validation | ID token signature + exp + iss + aud verified |
| Account Linking | OAuth login linked to existing account by email |
| New Account | If email not found -> prompt for additional verification |

---

## 15. Token Lifecycle

### 15.1 Token States

Valid -> Issue -> Active -> Expire -> Expired
                  |
                  | Revoke
                  v
               Revoked

### 15.2 Revocation Checklist

| Event | Access Token | Refresh Token | Session | Action Required |
|-------|-------------|---------------|---------|-----------------|
| User logout | Blacklist | Delete | End | Immediate |
| Password change | Blacklist | Delete | End | Immediate |
| Role change | Blacklist | Delete | End | Immediate |
| Suspected compromise | Blacklist | Delete | End | Immediate + alert |
| 8h absolute timeout | Expire naturally | Expire naturally | End | Automatic |
| 30min idle timeout | Expire naturally | Expire naturally | End | Automatic |

### 15.3 Token Blacklist Implementation

Storage: Redis (Phase 2) or PostgreSQL (Phase 1)
Key: token_jti:<jti>
Value: revoked_at timestamp
TTL: Match token expiry (1h for access, 8h for session)

Check: On every authenticated request, verify token JTI not in blacklist
Performance: < 1ms lookup with Redis; < 5ms with PostgreSQL index

---

## 16. Audit Logging

### 16.1 Logged Auth Events

| Event | Fields Logged | Retention |
|-------|--------------|-----------|
| Login success | User ID, email, IP, user agent, timestamp, MFA used | 12 months |
| Login failure | Email attempted, IP, user agent, timestamp, failure reason | 12 months |
| Logout | User ID, IP, timestamp | 12 months |
| Password change | User ID, IP, timestamp | 12 months |
| Password reset requested | Email, IP, timestamp | 12 months |
| Password reset completed | User ID, IP, timestamp | 12 months |
| MFA enrollment | User ID, method, timestamp | 12 months |
| MFA challenge | User ID, success/failure, IP, timestamp | 12 months |
| Token refresh | User ID, old JTI, new JTI, IP, timestamp | 12 months |
| Token revocation | User ID, JTI, reason, admin ID (if applicable) | 12 months |
| Role change | User ID, old role, new role, admin ID, timestamp | 24 months |
| Account lockout | User ID/email, IP, attempt count, timestamp | 24 months |
| API key created | Key ID, owner ID, scopes, admin ID, timestamp | 24 months |
| API key revoked | Key ID, reason, admin ID, timestamp | 24 months |
| OAuth login | User ID, provider, email, IP, timestamp | 12 months |
| Session anomaly | User ID, anomaly type, IP, geo, timestamp | 24 months |

### 16.2 Audit Log Format

{
  "timestamp": "2026-05-02T10:30:00Z",
  "event": "login_success",
  "severity": "info",
  "user_id": "usr_abc123",
  "user_email": "editor@twinmos.com",
  "ip_address": "203.0.113.42",
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  "mfa_used": true,
  "mfa_method": "totp",
  "session_id": "sess_xyz789",
  "request_id": "req_123456",
  "geo": {
    "country": "AE",
    "city": "Dubai"
  }
}

---

## 17. Compliance Mapping

### 17.1 GDPR Article 32 - Security of Processing

| Requirement | Implementation |
|-------------|----------------|
| Pseudonymization | User IDs are UUIDs; email hashed in analytics |
| Encryption at rest | PostgreSQL LUKS encryption |
| Encryption in transit | TLS 1.3 for all auth traffic |
| Ongoing confidentiality | RBAC, least privilege |
| Ongoing integrity | Audit logs, optimistic locking |
| Ongoing availability | Backup, DR, session revocation |

### 17.2 GDPR Article 33 - Breach Notification

| Trigger | Timeline | Action |
|---------|----------|--------|
| Auth database breach | 72 hours | Notify DPA + affected users |
| Session token compromise | 72 hours | Mass revocation + user notification |
| Credential breach (external) | 72 hours | Force password reset + notification |

### 17.3 UAE PDPL Compliance

| Requirement | Implementation |
|-------------|----------------|
| Lawful processing | Consent for marketing; legitimate interest for security |
| Data minimization | Only collect auth-required data |
| DPO contact | dpo@twinmos.com |
| Cross-border transfer | EU adequacy; transfer impact assessment documented |

### 17.4 India DPDP Act 2023

| Requirement | Implementation |
|-------------|----------------|
| Explicit consent | Consent checkbox for Indian users |
| Grievance Officer | in-privacy@twinmos.com |
| Data principal rights | DSAR endpoint for access/erasure |
| CERT-In reporting | 6-hour reporting for critical breaches |

### 17.5 KSA PDPL

| Requirement | Implementation |
|-------------|----------------|
| Sensitive data localization | Auth data stored in EU; KSA user data may require local copy |
| Cross-border transfer | Transfer impact assessment; adequacy decision |
| DSAR | 30-day response SLA |

---

## 18. Implementation Checklist

### 18.1 Phase 1 (CMS Auth)

- [ ] Generate RS256 key pair and configure in Coolify
- [ ] Configure Strapi Users-Permissions plugin
- [ ] Implement JWT access token (1h TTL) + rotating refresh token
- [ ] Configure HttpOnly Secure SameSite=Strict cookie for refresh token
- [ ] Implement password policy (>=12 chars, complexity)
- [ ] Configure bcrypt hashing (cost factor 12)
- [ ] Implement account lockout (5 attempts -> 30min)
- [ ] Implement session timeout (30min idle, 8h absolute)
- [ ] Configure TOTP MFA for Super Admin and Admin roles
- [ ] Generate recovery codes at MFA enrollment
- [ ] Implement audit logging for all auth events
- [ ] Configure rate limiting on auth endpoints
- [ ] Implement token blacklist on logout/password change
- [ ] Set up /.well-known/jwks.json endpoint
- [ ] Configure Cloudflare geo-blocking on admin routes
- [ ] Implement breached password detection (HIBP)

### 18.2 Phase 2 (Partner Portal)

- [ ] Deploy Better Auth service
- [ ] Configure database session storage
- [ ] Implement __Host-twinmos-session cookie
- [ ] Configure TOTP MFA (mandatory for all partner accounts)
- [ ] Implement WebAuthn passkey support (optional)
- [ ] Configure OAuth 2.0 (Google, Microsoft)
- [ ] Implement magic link fallback
- [ ] Configure partner RBAC (5 roles)
- [ ] Implement API key generation and management
- [ ] Configure API key scopes and IP whitelisting
- [ ] Implement price list watermarking
- [ ] Configure Cloudflare Turnstile on login
- [ ] Implement anomaly detection (geo, time)
- [ ] Deploy Redis for token blacklist and session cache

### 18.3 Phase 3 (E-Commerce)

- [ ] Extend Better Auth for customer accounts
- [ ] Implement self-registration with email verification
- [ ] Configure optional MFA for customers
- [ ] Implement social login (Google, Apple)
- [ ] Configure guest checkout flow
- [ ] Integrate with Medusa.js auth system
- [ ] Implement B2B pricing based on partner account linkage

---

**End of Document**

This document is part of the TwinMOS Security & Compliance documentation suite.
Related documents:
- TWN-SEC-2026-001: Security Architecture
- TWN-SEC-2026-002: STRIDE Threat Model
- TWN-SEC-2026-003: Security Controls Catalog
- TWN-SEC-2026-005: Content Security Policy Specification
