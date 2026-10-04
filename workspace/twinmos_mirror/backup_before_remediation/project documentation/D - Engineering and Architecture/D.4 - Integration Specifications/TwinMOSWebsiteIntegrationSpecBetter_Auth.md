# TwinMOS Website — Integration Specification: Better Auth (Partner Portal)

| Field | Value |
|-------|-------|
| **Document ID** | TWN-INT-AUTH-001 |
| **Version** | 0.1 (Draft) |
| **Status** | Draft |
| **Phase** | P3 |
| **Priority** | P3 |
| **Date** | 2026-05-01 |
| **Owner** | Engineering Lead |
| **Source** | Tech Stack §9; BRD §16 |

---

## 1. Status Notice

> **Better Auth is a Phase 3 feature** for the TwinMOS partner/distributor portal. The main website (Phase 1/2) uses Strapi JWT auth only. This document describes the planned Phase 3 authentication architecture.

---

## 2. Overview

**Better Auth** is a TypeScript-first authentication library used for the TwinMOS **Partner Portal** — a gated section of the website for distributors, retailers, and authorised partners. It provides session-based authentication with database-backed sessions, MFA, and role management.

### 2.1 Why Better Auth Over Lucia Auth

| Criterion | Better Auth | Lucia Auth |
|-----------|-----------|-----------|
| Status (2025) | **Active development** | Maintenance mode (author deprecated it in favour of Better Auth) |
| MFA support | **Built-in TOTP, passkeys** | Manual implementation required |
| Organisation/role management | **Built-in** | Manual |
| TypeScript DX | **Excellent — auto-generates schema** | Good |
| Session storage | Database-backed | Database-backed |
| Cookie type | HTTP-only (secure) | HTTP-only (secure) |

See: ADR-015 Better Auth vs Lucia.

---

## 3. Partner Portal Scope

| Feature | Description | Phase |
|---------|-------------|-------|
| Partner login | Email + password | P3 |
| TOTP MFA | Two-factor authentication | P3 |
| Organisation accounts | Multiple users per distributor | P3 |
| Order history | View Medusa orders | P3 |
| MDF portal | Market Development Fund applications | P3 |
| Price list downloads | Distributor pricing PDFs | P3 |
| RMA tracking | View open RMA requests | P3 |
| Sales materials | Logos, datasheets, marketing assets | P3 |
| Google OAuth | Optional SSO | P4 |
| SAML SSO | Enterprise distributors | P4 |

---

## 4. Architecture

```
Browser (Astro Partner Portal)
        │
        │  HTTPS (session cookie)
        ▼
Astro Server (Cloudflare Pages)
        │
        │  Better Auth server-side session check
        ▼
Better Auth (Node.js — Hetzner or Cloudflare Worker)
        │
        ├── PostgreSQL (sessions, users, organisations)
        └── Email verification → Resend
```

### 4.1 Session Flow

Better Auth uses **HTTP-only session cookies** (not JWT for browser clients):

```
Browser                          Server
   │                               │
   │  POST /api/auth/sign-in       │
   │  { email, password }          │
   │ ─────────────────────────────►│
   │                               │ Verify credentials
   │                               │ Create session in DB
   │  Set-Cookie: session=...      │
   │  (HTTP-only, Secure, SameSite=Lax)
   │ ◄─────────────────────────────│
   │                               │
   │  GET /partner/dashboard       │
   │  Cookie: session=...          │
   │ ─────────────────────────────►│
   │                               │ getSession() → user object
   │  200 OK (partner dashboard)   │
   │ ◄─────────────────────────────│
```

---

## 5. Installation & Setup

```bash
npm install better-auth
npm install @better-auth/cli  # Schema generation
```

**`auth.ts`:**
```typescript
import { betterAuth } from 'better-auth';
import { twoFactor, organization } from 'better-auth/plugins';
import { Pool } from 'pg';

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  plugins: [
    twoFactor({
      issuer: 'TwinMOS Partner Portal',
    }),
    organization({
      allowUserToCreateOrganization: false, // Only admins create orgs
    }),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7,    // 7 days
    updateAge: 60 * 60 * 24,          // Refresh on each request (24h rolling)
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,  // 5 min cache to reduce DB reads
    },
  },
  trustedOrigins: ['https://twinmos.com', 'https://partners.twinmos.com'],
  sendEmail: async (params) => {
    // Use Resend for email verification and password reset
    await sendResendEmail(params);
  },
});
```

### 5.1 Schema Generation

```bash
npx @better-auth/cli generate
# Generates SQL migration for: users, sessions, accounts, verifications, twoFactors, organizations
npx @better-auth/cli migrate
```

---

## 6. Role Model

| Role | Description | Access |
|------|-------------|--------|
| `partner` | Approved distributor/retailer | Order history, downloads, RMA tracking |
| `distributor` | Tier 1 distribution partner | Full portal + MDF applications |
| `admin` | TwinMOS operations staff | Full admin access |

Roles stored in Better Auth's user metadata (or organisation member roles).

---

## 7. Astro Integration

**Server-side page protection:**
```typescript
// src/pages/partner/dashboard.astro
---
import { auth } from '../../lib/auth';

const session = await auth.api.getSession({
  headers: Astro.request.headers,
});

if (!session) {
  return Astro.redirect('/partner/login');
}
---

<PartnerDashboard user={session.user} />
```

**API routes:**
```typescript
// src/pages/api/auth/[...all].ts
import { auth } from '../../../lib/auth';

export const ALL = (context) => auth.handler(context.request);
```

---

## 8. Relation to Strapi

Better Auth manages authentication; Strapi manages partner data:

| Data | System | Notes |
|------|--------|-------|
| Login credentials, sessions | Better Auth (PostgreSQL) | Auth-only |
| Partner company profile | Strapi `partner_company` collection | CMS-managed |
| Partner tier, territory | Strapi `partner_user` collection | Linked by Better Auth user ID |
| Product access permissions | Strapi RBAC | Cross-referenced at login |
| RMA requests | Strapi `rma_request` collection | Filtered by partner |

On login, Astro server fetches the partner's Strapi profile using the Better Auth user ID to determine portal features available.

---

## 9. MFA (TOTP)

Better Auth's two-factor plugin provides TOTP:

1. Partner enables MFA in portal settings
2. QR code shown for authenticator app setup (Google Authenticator, Authy, 1Password)
3. Future logins require 6-digit TOTP after password
4. 8 single-use backup codes provided at setup

---

## 10. Environment Variables

| Variable | Description |
|----------|-------------|
| `BETTER_AUTH_SECRET` | Session encryption secret (min 32 chars) |
| `BETTER_AUTH_URL` | Base URL (`https://twinmos.com`) |
| `DATABASE_URL` | PostgreSQL connection string (shared with Strapi) |

---

## 11. Related Documents

- [TwinMOSWebsiteAPIAuthenticationJWT_Spec.md](../D.3 - API Specifications/TwinMOSWebsiteAPIAuthenticationJWT_Spec.md) — Strapi JWT for main API
- [TwinMOSWebsiteIntegrationSpecResend_Email.md](TwinMOSWebsiteIntegrationSpecResend_Email.md) — Email for verification
- ADR-015: Better Auth vs Lucia
