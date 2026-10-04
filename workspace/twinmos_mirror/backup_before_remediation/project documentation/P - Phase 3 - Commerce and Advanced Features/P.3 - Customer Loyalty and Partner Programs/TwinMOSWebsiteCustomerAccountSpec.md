# TwinMOS Technologies — Customer Account Specification

| Field            | Value                                     |
|------------------|-------------------------------------------|
| Document Ref     | TWN-P3-CUST-2026-001                      |
| Version          | 1.0                                       |
| Status           | Draft — Pending Engineering Review        |
| Phase            | Phase 3 — Commerce and Advanced Features  |
| Author           | TwinMOS Digital Product Team              |
| Date             | 2026-05-01                                |
| Reviewed By      | TBD                                       |
| Approved By      | TBD                                       |

---

## Table of Contents

1. [Document Purpose and Scope](#1-document-purpose-and-scope)
2. [System Architecture Overview](#2-system-architecture-overview)
3. [Account Types and Roles](#3-account-types-and-roles)
4. [Registration Flow](#4-registration-flow)
5. [Login Flow](#5-login-flow)
6. [Account Dashboard](#6-account-dashboard)
7. [Profile Management](#7-profile-management)
8. [Address Book](#8-address-book)
9. [Order History](#9-order-history)
10. [Wishlist](#10-wishlist)
11. [Security Settings](#11-security-settings)
12. [Data and Privacy](#12-data-and-privacy)
13. [Loyalty Points Summary](#13-loyalty-points-summary)
14. [Referral Program Summary](#14-referral-program-summary)
15. [Account Security Policies](#15-account-security-policies)
16. [Business Rules](#16-business-rules)
17. [API Endpoints](#17-api-endpoints)
18. [Compliance Requirements](#18-compliance-requirements)
19. [Acceptance Criteria](#19-acceptance-criteria)
20. [Appendix](#20-appendix)

---

## 1. Document Purpose and Scope

### 1.1 Purpose

This specification defines the complete functional requirements for the TwinMOS Technologies customer account system, covering all aspects of the consumer-facing account experience on the TwinMOS corporate website. The customer account system is a foundational component of the Phase 3 commerce platform, enabling customers to manage their identity, orders, addresses, loyalty rewards, and data privacy preferences in a single unified interface.

This document is intended for:

- **Front-end engineers** implementing the Astro 5 account UI components
- **Back-end engineers** integrating Better Auth, Medusa.js v2, and Strapi v5
- **QA engineers** writing test cases against acceptance criteria
- **Security and compliance reviewers** evaluating GDPR, UAE PDPL, and India DPDP conformance
- **Product managers** tracking feature scope and delivery

### 1.2 Scope

This specification covers:

- Consumer account registration and authentication
- Account dashboard and navigation
- Profile, address, order, wishlist management
- Security settings and session management
- Data portability and erasure (GDPR/PDPL/DPDP)
- Loyalty points display (detail owned by TWN-P3-LOYAL-2026-001)
- Referral program display (detail owned by TWN-P3-REFER-2026-001)
- Business rules and API contracts
- Compliance requirements for personal data handling

### 1.3 Out of Scope

- Partner portal account management (covered in Phase 2 Partner Portal Spec)
- Admin CMS account management (internal tooling, Strapi admin)
- Payment method storage (handled by Stripe; TwinMOS does not store card data)
- MDF program interface (covered in TWN-P3-MDF-2026-001)
- Phase 4 features explicitly labeled as such

### 1.4 Related Documents

| Document Reference       | Title                                            |
|--------------------------|--------------------------------------------------|
| TWN-P2-PARTNER-2025-001  | Partner Portal Specification (Phase 2)           |
| TWN-P3-LOYAL-2026-001    | Loyalty Program Functional Specification         |
| TWN-P3-REFER-2026-001    | Referral Program Functional Specification        |
| TWN-P3-MDF-2026-001      | MDF Program Functional Specification             |
| TWN-P3-ECOM-2026-001     | E-Commerce Core Specification                    |
| TWN-SEC-2025-001         | Security Policy and Standards                    |
| TWN-BRAND-2025-001       | Brand Guidelines v1.0                           |

---

## 2. System Architecture Overview

### 2.1 Technology Stack

The TwinMOS customer account system is built on a shared authentication layer integrated with the e-commerce platform:

```
┌─────────────────────────────────────────────────────────────┐
│                      Astro 5 (Frontend)                     │
│         /account/* pages — SSR with Astro server islands    │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP/REST + server-side fetch
          ┌───────────┴───────────────────┐
          │                               │
┌─────────▼──────────┐        ┌──────────▼──────────┐
│   Better Auth       │        │   Medusa.js v2       │
│   (Authentication)  │        │   (Customer Module)  │
│                     │        │                      │
│ - Session mgmt      │        │ - Customer entity    │
│ - OAuth providers   │        │ - Order history      │
│ - Email verification│        │ - Address book       │
│ - Password reset    │        │ - Cart + Checkout    │
│ - 2FA (TOTP)        │        │ - Wishlist           │
└─────────┬──────────┘        └──────────┬───────────┘
          │                               │
          └───────────┬───────────────────┘
                      │
          ┌───────────▼───────────┐
          │   PostgreSQL 16       │
          │   (Primary Database)  │
          │                       │
          │ - auth_users          │
          │ - auth_sessions       │
          │ - medusa_customer     │
          │ - loyalty_account     │
          │ - referral_code       │
          └───────────┬───────────┘
                      │
          ┌───────────▼───────────┐
          │   Strapi v5 CMS       │
          │   (Content + Admin)   │
          │                       │
          │ - Loyalty engine      │
          │ - Referral engine     │
          │ - Customer metadata   │
          └───────────────────────┘
```

### 2.2 Authentication Architecture

TwinMOS uses **Better Auth** as the unified authentication layer. This library was adopted in Phase 2 for the partner portal and is extended in Phase 3 to serve consumer accounts on the same installation.

Key design decisions:

1. **Single Better Auth instance**: Both consumer and partner accounts authenticate through the same Better Auth service. Account type is determined by the `role` field on the user record.
2. **Medusa customer linkage**: When a consumer registers, Better Auth creates the `auth_user` record and Medusa creates a linked `customer` record using the same email. A `better_auth_user_id` foreign key is stored on the Medusa customer record for bidirectional lookup.
3. **Session storage**: Sessions are stored server-side in PostgreSQL via Better Auth's session adapter. JWT is not used for user-facing sessions (stateful sessions only).
4. **Cloudflare Pages compatibility**: The Astro 5 SSR adapter runs on Cloudflare Pages Workers. Better Auth sessions are validated on each request via middleware.

### 2.3 Data Flow: Request Authentication

```
Browser Request (/account/*)
          │
          ▼
Cloudflare Pages (Edge)
          │
          ▼
Astro Middleware (auth.ts)
  ├── Extract session cookie
  ├── Validate via Better Auth API
  │     ├── Valid session → attach user context → continue
  │     └── Invalid/missing → redirect to /login?next=/account/*
          │
          ▼
Astro Page Component (SSR)
  ├── Fetch customer data from Medusa API
  ├── Fetch loyalty data from Strapi API
  └── Render page with hydrated islands
```

### 2.4 Multi-Region Support

The account system operates across all five TwinMOS markets. The customer's preferred currency and locale are stored on their profile and applied across the account experience:

| Market      | Locale  | Currency | Currency Symbol |
|-------------|---------|----------|-----------------|
| UAE         | en-AE   | AED      | AED             |
| India       | en-IN   | INR      | ₹               |
| Bangladesh  | en-BD   | BDT      | ৳               |
| KSA         | en-SA   | SAR      | SAR             |
| International | en-US | USD      | $               |

---

## 3. Account Types and Roles

### 3.1 Role Matrix

| Role      | Description                         | Portal Access         | E-Commerce | Partner Portal | Admin Panel |
|-----------|-------------------------------------|-----------------------|------------|----------------|-------------|
| `consumer`  | End-user buyer                    | /account/*            | Yes        | No             | No          |
| `partner`   | Authorized distributor/reseller   | /partner/* + /account/* | Yes (B2B) | Yes            | No          |
| `admin`     | TwinMOS internal staff            | /admin/*              | Read-only  | Yes (manage)   | Yes         |
| `superadmin`| TwinMOS IT/DevOps                 | All                   | Full       | Full           | Full        |

### 3.2 Consumer Account

A consumer account is created when a visitor registers on the TwinMOS website to make a purchase or access loyalty features. Consumer accounts are linked to a Medusa customer entity and a loyalty account in Strapi.

**Consumer capabilities:**
- Browse and purchase products in their regional store
- Track orders and download invoices
- Manage delivery addresses (up to 5)
- Earn and redeem loyalty points
- Refer friends and earn referral rewards
- Manage communication preferences
- Exercise GDPR/PDPL data rights

### 3.3 Partner Account

Partner accounts are provisioned by TwinMOS staff through the partner portal (Phase 2). A partner account holder may also act as a consumer buyer. The `partner` role is additive — it grants access to partner features without removing consumer access.

**Note:** Partner account registration is NOT self-serve on the consumer registration page. Partners must be onboarded by TwinMOS staff via the partner portal admin interface.

### 3.4 Admin Account

Admin accounts are internal TwinMOS staff accounts created directly in the Strapi admin panel and/or Better Auth admin API. Admin accounts cannot be created via the public registration flow.

---

## 4. Registration Flow

### 4.1 Registration Page (/register)

The registration page is publicly accessible and optimized for conversion. It uses a single-page form with progressive disclosure.

#### 4.1.1 Form Fields

| Field             | Type          | Required | Validation                                           |
|-------------------|---------------|----------|------------------------------------------------------|
| Full Name         | Text          | Yes      | 2–100 characters, no special characters except hyphen/apostrophe |
| Email Address     | Email         | Yes      | Valid email format; checked for existing account     |
| Password          | Password      | Yes      | Min 8 chars, 1 uppercase, 1 number, 1 special char  |
| Confirm Password  | Password      | Yes      | Must match Password field                            |
| Country           | Select        | Yes      | Drives default currency/locale; pre-populated by IP geolocation |
| GDPR/Privacy Consent | Checkbox  | Yes      | Must be checked; cannot proceed without              |
| Marketing Emails  | Checkbox      | No       | Opt-in; unchecked by default                        |

#### 4.1.2 Registration Form — UI Specification

```
┌─────────────────────────────────────────────────────┐
│          Create your TwinMOS account                │
├─────────────────────────────────────────────────────┤
│  Full Name *                                        │
│  ┌─────────────────────────────────────────────┐   │
│  │ e.g. Ahmed Al-Rashidi                       │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  Email Address *                                    │
│  ┌─────────────────────────────────────────────┐   │
│  │ you@example.com                             │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  Password *                                         │
│  ┌─────────────────────────────────────────────┐   │
│  │ ••••••••••••••                        [eye] │   │
│  └─────────────────────────────────────────────┘   │
│  [password strength indicator]                      │
│                                                     │
│  Confirm Password *                                 │
│  ┌─────────────────────────────────────────────┐   │
│  │ ••••••••••••••                        [eye] │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  Country *                                          │
│  ┌─────────────────────────────────────────────┐   │
│  │ United Arab Emirates                      ▼ │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  [x] I agree to the Terms of Service and           │
│      Privacy Policy. I understand my data will     │
│      be processed as described in the Privacy      │
│      Policy. *                                     │
│                                                     │
│  [ ] I would like to receive marketing emails,     │
│      product news, and exclusive offers.           │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │           CREATE ACCOUNT                    │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  Already have an account? Sign in                  │
└─────────────────────────────────────────────────────┘
```

#### 4.1.3 Registration Flow — Process

```
User submits registration form
          │
          ▼
Client-side validation
  ├── All required fields present?
  ├── Email format valid?
  ├── Password meets policy?
  ├── Passwords match?
  └── GDPR consent checked?
          │ (all pass)
          ▼
POST /api/auth/register
          │
          ▼
Server-side validation
  ├── Email already registered?
  │     └── YES → Return error: "An account with this email already exists. Sign in?"
  ├── Password policy check
  └── Rate limit check (max 5 registration attempts per IP per hour)
          │ (all pass)
          ▼
Better Auth: Create auth_user record
  - id (UUID)
  - email
  - password_hash (bcrypt, cost factor 12)
  - role: 'consumer'
  - email_verified: false
  - gdpr_consent: true
  - gdpr_consent_at: timestamp
  - marketing_consent: true/false
  - marketing_consent_at: timestamp
  - created_at: timestamp
          │
          ▼
Medusa.js: Create customer record
  - id (Medusa UUID)
  - email
  - first_name / last_name (parsed from Full Name)
  - better_auth_user_id: (linked)
  - has_account: true
          │
          ▼
Strapi: Create LoyaltyAccount record
  - customer_id: (Medusa customer ID)
  - total_points: 0
  - lifetime_points: 0
  - tier: 'bronze'
          │
          ▼
Strapi: Create ReferralCode record
  - user_id: (Better Auth user ID)
  - code: (generate unique 6-char alphanumeric)
          │
          ▼
Resend: Send verification email
  - Template: EMAIL_VERIFY_V1
  - Contains: magic link with JWT token (24-hour expiry)
          │
          ▼
Redirect to /register/verify-email
  - Page shows: "Check your inbox! We've sent a verification link to {email}"
  - Option to resend (max 3 resends per hour)
```

### 4.2 Email Verification

Customers must verify their email address before completing their first purchase. They may browse the site and add items to cart without verification.

#### 4.2.1 Verification Email Content

```
Subject: Verify your TwinMOS account

Hi {First Name},

Welcome to TwinMOS! Please verify your email address to complete
your account setup and start earning rewards.

[VERIFY EMAIL ADDRESS]  ← button links to /verify?token=<JWT>

This link expires in 24 hours.

If you didn't create a TwinMOS account, you can safely ignore
this email.

— The TwinMOS Team
```

#### 4.2.2 Verification Token Handling

- Token: signed JWT containing `user_id`, `email`, `purpose: "email_verification"`, `exp`
- On click: validate JWT signature + expiry, set `email_verified: true` on auth_user, award 25 profile completion points (see Loyalty spec)
- Expired token: show error with "Resend verification email" button
- Already verified: redirect to /account with toast "Your email is already verified"

### 4.3 Social Login (Phase 4)

Google OAuth and Apple Sign-In are deferred to Phase 4. The registration page should include placeholder UI (greyed-out buttons) with a "Coming soon" tooltip to set expectations.

```
──── or continue with ────

[G  Continue with Google]  (disabled — Phase 4)
[   Continue with Apple ]  (disabled — Phase 4)
```

### 4.4 Consent Capture

TwinMOS must capture and store consent records for all applicable regulations:

| Regulation    | Jurisdiction  | Requirement                                            | Implementation                                      |
|---------------|---------------|--------------------------------------------------------|-----------------------------------------------------|
| GDPR          | EU/global     | Lawful basis for processing; explicit consent for marketing | Consent checkbox + timestamp stored on auth_user   |
| UAE PDPL      | UAE           | Data subject consent for personal data collection      | Same consent mechanism; UAE-specific privacy notice |
| India DPDP    | India         | Consent for data processing; purpose limitation        | Same mechanism; India-specific privacy notice       |

Consent records stored on `auth_user`:

```sql
-- Consent fields on auth_user table
gdpr_consent          BOOLEAN NOT NULL DEFAULT FALSE,
gdpr_consent_at       TIMESTAMP WITH TIME ZONE,
gdpr_consent_version  VARCHAR(10),   -- e.g. 'PP-v2.1'
marketing_consent     BOOLEAN NOT NULL DEFAULT FALSE,
marketing_consent_at  TIMESTAMP WITH TIME ZONE,
ip_at_registration    INET,          -- for evidence of consent location
```

---

## 5. Login Flow

### 5.1 Login Page (/login)

```
┌─────────────────────────────────────────────────────┐
│              Sign in to TwinMOS                     │
├─────────────────────────────────────────────────────┤
│  Email Address                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │ you@example.com                             │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  Password                                           │
│  ┌─────────────────────────────────────────────┐   │
│  │ ••••••••••••••                        [eye] │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  [x] Remember me for 30 days     Forgot password?  │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │                 SIGN IN                     │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  Don't have an account? Create one                 │
└─────────────────────────────────────────────────────┘
```

### 5.2 Login Flow — Process

```
User submits login form
          │
          ▼
POST /api/auth/login
  { email, password, rememberMe }
          │
          ▼
Better Auth validation
  ├── Look up auth_user by email
  │     └── Not found → generic error "Invalid email or password"
  │           (do NOT disclose whether email exists — enumeration attack prevention)
  ├── Check account_locked_until
  │     └── Locked → "Your account is temporarily locked. Try again at {time}"
  ├── Verify password_hash (bcrypt.compare)
  │     └── Mismatch → increment failed_login_count
  │           ├── count < 5 → generic error
  │           └── count >= 5 → set account_locked_until = now + 15 minutes
  │                            send lockout notification email
  ├── Check email_verified
  │     └── Not verified → "Please verify your email before signing in.
  │                         [Resend verification email]"
  └── All checks pass → create session
          │
          ▼
Session creation (Better Auth)
  - session_id: UUID
  - user_id: auth_user.id
  - expires_at:
      rememberMe=true  → now + 30 days
      rememberMe=false → now + 8 hours
  - idle_timeout: 30 minutes (rolling)
  - ip_address: client IP
  - user_agent: browser user agent
  - device_fingerprint: (optional, from browser)
          │
          ▼
Set session cookie
  - Name: __twinmos_session
  - HttpOnly: true
  - Secure: true (HTTPS only)
  - SameSite: Strict
  - Path: /
  - Max-Age: 30 days (if rememberMe) or session (if not)
          │
          ▼
Record login event (LoginHistory)
  - user_id, timestamp, ip_address, user_agent, success: true
          │
          ▼
Redirect to:
  - ?next= parameter if present (validated against allowlist)
  - /account (default)
```

### 5.3 Forgot Password Flow

```
User clicks "Forgot password?"
          │
          ▼
/forgot-password page
  ┌─────────────────────────────────────────────┐
  │  Enter your email to reset your password   │
  │  ┌───────────────────────────────────────┐ │
  │  │ you@example.com                       │ │
  │  └───────────────────────────────────────┘ │
  │  [SEND RESET LINK]                         │
  └─────────────────────────────────────────────┘
          │
          ▼
POST /api/auth/forgot-password
  ├── Always respond with: "If this email is registered, you'll receive a reset link"
  │   (prevent email enumeration)
  ├── If email found: generate reset token (JWT, 1-hour expiry, purpose: "password_reset")
  └── Send email via Resend (template: EMAIL_RESET_V1)
          │
          ▼
User clicks link in email → /reset-password?token=<JWT>
          │
          ▼
Validate token (not expired, not already used)
          │
          ▼
Show new password form
  - New Password (policy enforced)
  - Confirm New Password
          │
          ▼
POST /api/auth/reset-password
  - Update password_hash
  - Invalidate all existing sessions (security: force re-login on all devices)
  - Mark reset token as used (one-time use)
  - Send confirmation email: "Your password was changed"
```

---

## 6. Account Dashboard

### 6.1 Route

`GET /account` — requires authentication; redirects unauthenticated users to `/login?next=/account`

### 6.2 Dashboard Layout

```
┌──────────────────────────────────────────────────────────────┐
│ TwinMOS [logo]      Search      Cart (2)    [Ahmed ▼]        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Welcome back, Ahmed!                    [Bronze] 425 pts   │
│  Member since: March 2025                                    │
│                                                              │
├─────────────┬────────────┬─────────────┬────────────────────┤
│  [Orders]   │ [Addresses]│  [Profile]  │  [Security]        │
│     icon    │    icon    │    icon     │    icon            │
├─────────────┴────────────┴─────────────┴────────────────────┤
│                                                              │
│  Recent Orders                              [View all →]     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ #TW-20250412-0047  |  12 Apr 2025  |  AED 349.00    │   │
│  │ VOLTX DDR5 16GB x1          Status: Delivered        │   │
│  │ [View Order]  [Reorder]                              │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ #TW-20250328-0031  |  28 Mar 2025  |  AED 199.00    │   │
│  │ Elite Drive SATA SSD 512GB x1  Status: Delivered     │   │
│  │ [View Order]  [Reorder]                              │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Your Loyalty Status                                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  BRONZE  ══════════════════░░░░░░░░░  SILVER        │   │
│  │  425 / 1,000 points to Silver tier                   │   │
│  │  [View Loyalty Details →]                            │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 6.3 Dashboard Data Requirements

| Data Element           | Source             | Freshness         |
|------------------------|--------------------|-------------------|
| Customer name          | Medusa customer    | Real-time         |
| Member since date      | Better Auth user.created_at | Cached   |
| Loyalty points balance | Strapi LoyaltyAccount | 5-min cache  |
| Current tier           | Strapi LoyaltyAccount | 5-min cache  |
| Recent orders (last 3) | Medusa orders API  | Real-time         |
| Order statuses         | Medusa + fulfillment | Real-time       |
| Tier progress          | Strapi LoyaltyAccount | 5-min cache  |

### 6.4 Account Navigation

The `/account` namespace uses a consistent left-side navigation (desktop) or bottom tab bar (mobile):

| Nav Item        | Route                  | Icon            |
|-----------------|------------------------|-----------------|
| Dashboard       | /account               | home            |
| My Orders       | /account/orders        | package         |
| Wishlist        | /account/wishlist      | heart           |
| Addresses       | /account/addresses     | map-pin         |
| Profile         | /account/profile       | user            |
| Loyalty Rewards | /account/loyalty       | star            |
| Referrals       | /account/referrals     | share-2         |
| Security        | /account/security      | shield          |
| Privacy & Data  | /account/privacy       | lock            |
| Sign Out        | POST /api/auth/signout | log-out         |

---

## 7. Profile Management

### 7.1 Route

`GET /account/profile` — authenticated consumer

### 7.2 Profile Fields

| Field                 | Type      | Required | Notes                                              |
|-----------------------|-----------|----------|----------------------------------------------------|
| First Name            | Text      | Yes      | Parsed from Full Name at registration; editable    |
| Last Name             | Text      | Yes      | Parsed from Full Name at registration; editable    |
| Email Address         | Email     | Yes      | Display only; email change requires re-verification |
| Phone Number          | Tel       | No       | E.164 format; country code prefix via selector    |
| Date of Birth         | Date      | No       | For birthday reward; stored encrypted at rest     |
| Profile Photo         | Image     | No       | Max 2MB; JPEG/PNG/WebP; cropped to 1:1           |
| Company Name          | Text      | No       | Optional; for B2B buyers; displayed on invoices   |
| Language Preference   | Select    | No       | en-AE, en-IN, en-BD, en-SA, en-US                |

### 7.3 Communication Preferences

| Preference                | Default at Registration | Description                                   |
|---------------------------|-------------------------|-----------------------------------------------|
| Marketing emails          | Opt-in (if checked)     | Promotional campaigns, sale announcements     |
| Product update emails     | On                      | New product launches, firmware updates        |
| Order transactional emails | On (mandatory)         | Cannot be disabled; required for commerce     |
| Loyalty program emails    | On                      | Points earned, tier changes, expiry warnings  |
| Newsletter                | Off                     | Monthly TwinMOS newsletter                    |
| WhatsApp notifications    | Off                     | Phase 4 feature; display as disabled          |

### 7.4 Email Change Flow

Changing an email address requires re-verification:

```
1. Customer enters new email address in profile
2. POST /api/account/change-email { newEmail }
3. System:
   a. Check new email not already registered
   b. Send verification email to NEW email address
   c. Email change is PENDING until verified
4. User clicks link in new email
5. System updates email on auth_user + Medusa customer
6. Send confirmation email to OLD email: "Your email was changed"
```

### 7.5 Profile Photo Upload

- Accepted formats: JPEG, PNG, WebP
- Maximum size: 2 MB
- Processing: resized to 400x400 px, converted to WebP, stored in Cloudflare R2
- CDN URL: `https://assets.twinmos.com/profile/{user_id}/avatar.webp`
- Default avatar: initials-based SVG generated from first + last name initial

### 7.6 Profile API

```
GET    /api/account/profile          Get customer profile
PATCH  /api/account/profile          Update profile fields
POST   /api/account/profile/photo    Upload profile photo
POST   /api/account/change-email     Initiate email change
DELETE /api/account/profile/photo    Remove profile photo
```

---

## 8. Address Book

### 8.1 Route

`GET /account/addresses` — authenticated consumer

### 8.2 Address Fields

| Field           | Type   | Required | Notes                                               |
|-----------------|--------|----------|-----------------------------------------------------|
| Address Label   | Text   | No       | e.g. "Home", "Office"; default: auto-generated      |
| Full Name       | Text   | Yes      | Recipient name                                      |
| Phone Number    | Tel    | Yes      | For delivery contact                                |
| Address Line 1  | Text   | Yes      | Street address, building number                     |
| Address Line 2  | Text   | No       | Apartment, floor, suite                             |
| City            | Text   | Yes      |                                                     |
| State/Emirate   | Text   | Cond.    | Required for India; optional for UAE                |
| Postal Code     | Text   | Cond.    | Required for India, Bangladesh; optional for UAE    |
| Country         | Select | Yes      | Limited to supported shipping countries             |
| Default Shipping | Boolean | No    | Only one address can be default shipping            |
| Default Billing | Boolean | No     | Only one address can be default billing; can match shipping |

### 8.3 Address Limits

- Maximum **5 saved addresses** per customer
- At least one address must be designated as default shipping when more than one address exists
- Attempting to add a 6th address returns error: "You can save up to 5 addresses. Please remove one before adding a new one."

### 8.4 Address Validation

- **Phase 3:** Server-side format validation only (regex for postal code format by country)
- **Phase 4:** Google Maps Places API autocomplete for address entry + geocoding validation

### 8.5 Address Book UI

```
┌──────────────────────────────────────────────────────────────┐
│  My Addresses                                [+ Add Address]  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────┐  ┌──────────────────────┐ │
│  │ HOME                         │  │ OFFICE               │ │
│  │ [Default Shipping]           │  │                      │ │
│  │ [Default Billing]            │  │                      │ │
│  │                              │  │                      │ │
│  │ Ahmed Al-Rashidi             │  │ Ahmed Al-Rashidi     │ │
│  │ +971 50 123 4567             │  │ +971 4 567 8901      │ │
│  │ Villa 12, Al Barsha 1        │  │ Office 402, Bldg 7   │ │
│  │ Dubai, UAE                   │  │ DAFZA, Dubai, UAE    │ │
│  │                              │  │                      │ │
│  │ [Edit]  [Delete]             │  │ [Edit]  [Delete]     │ │
│  │ [Set as Default Billing]     │  │ [Set as Default]     │ │
│  └──────────────────────────────┘  └──────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 8.6 Address API

```
GET    /api/account/addresses              List all addresses
POST   /api/account/addresses              Add new address
PUT    /api/account/addresses/:id          Update address
DELETE /api/account/addresses/:id          Delete address
PATCH  /api/account/addresses/:id/default  Set default shipping/billing
```

---

## 9. Order History

### 9.1 Route

`GET /account/orders` — authenticated consumer

### 9.2 Order List View

The order list is paginated at **10 orders per page** with infinite scroll or "Load more" button on mobile.

#### 9.2.1 Order List Fields

| Field           | Source                    | Notes                                        |
|-----------------|---------------------------|----------------------------------------------|
| Order Reference | Medusa order.display_id   | Format: TW-YYYYMMDD-NNNN                    |
| Order Date      | Medusa order.created_at   | Formatted per locale                         |
| Order Total     | Medusa order.total        | In customer's preferred currency             |
| Order Status    | Medusa order.status       | See status definitions below                 |
| Item Count      | Count of Medusa line items|                                              |
| Item Thumbnails | Product images (up to 3)  | 48x48 px thumbnails                          |
| Fulfillment Status | Medusa fulfillment.status | Separate from order status                 |
| Points Earned   | Strapi LoyaltyTransaction | Points earned on this order                  |

#### 9.2.2 Order Status Definitions

| Medusa Status    | Display Label      | Description                                   |
|------------------|--------------------|-----------------------------------------------|
| `pending`        | Order Placed       | Payment pending confirmation                  |
| `requires_action`| Action Required    | Customer action needed (e.g. 3DS auth)        |
| `processing`     | Processing         | Payment confirmed; being prepared             |
| `fulfilled`      | Shipped            | Items dispatched to carrier                   |
| `partially_fulfilled` | Partially Shipped | Some items dispatched                    |
| `delivered`      | Delivered          | Carrier confirms delivery                     |
| `returned`       | Returned           | Customer return processed                     |
| `canceled`       | Cancelled          | Order cancelled                               |

### 9.3 Order Detail View

`GET /account/orders/:orderId`

#### 9.3.1 Order Detail Sections

1. **Order Summary** — reference, date, status, points earned
2. **Items Ordered** — product image, name, variant, quantity, unit price, subtotal
3. **Shipping Address** — delivery address used for this order
4. **Payment Method** — last 4 digits of card, payment type (display only; no raw card data stored)
5. **Order Totals** — subtotal, shipping, discounts, loyalty discount, taxes, total
6. **Fulfillment Tracking** — carrier name, tracking number (links to carrier tracking page), tracking events timeline
7. **Actions** — Reorder, Download Invoice PDF, Request Return (if eligible)

#### 9.3.2 Invoice PDF

Invoices are generated server-side using a PDF generation library (Puppeteer or similar). Invoice content:

- TwinMOS logo and company details (registered address: DAFZA, Dubai)
- Invoice number, date, customer details
- Line items with product names, quantities, unit prices
- Tax breakdown (VAT 5% for UAE; GST rates for India; applicable for each region)
- Total with payment method
- "Thank you" footer

Invoice PDF is generated on-demand and cached for 24 hours in Cloudflare R2.

### 9.4 Reorder Functionality

The "Reorder" button adds all items from a previous order to the current cart:

```
User clicks "Reorder" on order #TW-20250412-0047
          │
          ▼
POST /api/account/orders/:orderId/reorder
          │
          ▼
System checks each item:
  ├── Product still active? → add to cart
  ├── Same variant still in stock? → add with availability warning if low stock
  ├── Product discontinued? → skip + show notification
  └── Price may differ → inform customer via toast
          │
          ▼
Redirect to /cart with success toast:
  "2 items added to your cart. 1 item is no longer available."
```

### 9.5 Return Request Flow (Phase 3 — Basic)

```
Customer clicks "Request Return" on delivered order
  → Eligibility check: within 14 days of delivery + product in returnable category
  → Show return reason dropdown:
      - Defective/damaged
      - Wrong item received
      - Changed my mind
      - Other
  → Customer submits reason + optional photos
  → POST /api/account/orders/:orderId/return-request
  → TwinMOS ops team reviews in Medusa admin
  → Email sent with return instructions or rejection reason
```

---

## 10. Wishlist

### 10.1 Route

`GET /account/wishlist` — authenticated consumer

### 10.2 Wishlist Features

| Feature              | Phase | Description                                             |
|----------------------|-------|---------------------------------------------------------|
| Add to wishlist      | 3     | Heart icon on product cards and product detail pages    |
| Remove from wishlist | 3     | Remove from wishlist page                               |
| Move to cart         | 3     | Add wishlist item to cart                               |
| Share wishlist       | 3     | Public shareable link                                   |
| Price change tracking| 4     | Email alert when wishlist item price drops              |
| Stock alert          | 4     | Email alert when out-of-stock item restocks             |

### 10.3 Wishlist Data Model

Wishlist is stored in Medusa (via customer wishlist custom module):

```
Wishlist {
  id: string (UUID)
  customer_id: string (Medusa customer ID)
  is_public: boolean (for sharing)
  share_token: string (UUID, generated on first share)
  created_at: timestamp
  updated_at: timestamp
}

WishlistItem {
  id: string
  wishlist_id: string
  product_id: string
  variant_id: string (nullable — wishlisted at product level if no variant selected)
  added_at: timestamp
  price_at_addition: number (snapshot for price comparison in Phase 4)
}
```

### 10.4 Wishlist Limits

- Maximum **50 items** per wishlist
- Attempting to add a 51st item returns: "Your wishlist is full. Remove some items to add more."

### 10.5 Shared Wishlist

When a customer shares their wishlist:

1. `is_public` set to `true`; `share_token` generated if not already set
2. Shareable URL: `twinmos.com/wishlist/{share_token}`
3. Public page shows product names, images, prices; no customer name or personal data
4. Visitors can add shared wishlist items to their own cart
5. Customer can revoke sharing: `is_public = false`; old share links return 404

---

## 11. Security Settings

### 11.1 Route

`GET /account/security` — authenticated consumer

### 11.2 Password Change

```
┌──────────────────────────────────────────────────────┐
│  Change Password                                     │
├──────────────────────────────────────────────────────┤
│  Current Password                                    │
│  ┌──────────────────────────────────────────────┐   │
│  │ ••••••••••••                           [eye] │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  New Password                                        │
│  ┌──────────────────────────────────────────────┐   │
│  │ ••••••••••••                           [eye] │   │
│  └──────────────────────────────────────────────┘   │
│  [strength indicator]                               │
│                                                      │
│  Confirm New Password                                │
│  ┌──────────────────────────────────────────────┐   │
│  │ ••••••••••••                           [eye] │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  [UPDATE PASSWORD]                                   │
└──────────────────────────────────────────────────────┘
```

**Password change rules:**
- Must verify current password before change is allowed
- New password must meet password policy (see Section 15.1)
- New password cannot be the same as current password
- On success: all other sessions invalidated; current session remains active
- Email notification sent: "Your TwinMOS password was changed"

### 11.3 Active Sessions

Displays all currently active sessions for the customer's account:

```
┌──────────────────────────────────────────────────────────────┐
│  Active Sessions                                             │
├──────────────────────────────────────────────────────────────┤
│  Chrome on Windows — Dubai, UAE         [CURRENT SESSION]   │
│  Last active: Just now                                       │
│                                                              │
│  Safari on iPhone — Dubai, UAE          [Terminate]          │
│  Last active: 2 hours ago                                    │
│                                                              │
│  Firefox on MacOS — London, UK          [Terminate]          │
│  Last active: 3 days ago                                     │
│                                                              │
│  [Terminate All Other Sessions]                              │
└──────────────────────────────────────────────────────────────┘
```

Data displayed per session:
- Browser and OS (parsed from user agent)
- Location (city, country — from IP geolocation on login)
- Last active timestamp
- "Current session" badge for the session making the request

### 11.4 Two-Factor Authentication (2FA)

| Customer Type | 2FA Status        | Notes                                             |
|---------------|-------------------|---------------------------------------------------|
| Consumer      | Optional          | Customer can enable TOTP for extra security       |
| Partner       | Mandatory         | Enforced at partner portal login                  |

**TOTP Setup Flow (for consumers who opt in):**

```
1. Customer clicks "Enable Two-Factor Authentication"
2. System generates TOTP secret (Base32)
3. Display QR code for authenticator app (Google Authenticator, Authy)
4. Customer scans QR code
5. Customer enters 6-digit code to verify
6. On success: 2FA enabled; display 8 backup codes (single-use, store hashed)
7. Warn customer to save backup codes
8. 2FA enforced on next login
```

**Login with 2FA enabled:**

```
Email/password correct
          │
          ▼
2FA challenge page
  ┌─────────────────────────────────┐
  │  Enter the 6-digit code from   │
  │  your authenticator app        │
  │  ┌───────────────────────────┐ │
  │  │  _ _ _ - _ _ _            │ │
  │  └───────────────────────────┘ │
  │  [VERIFY]                      │
  │  Use a backup code instead     │
  └─────────────────────────────────┘
```

### 11.5 Login History

Displays the last **10 successful logins** (failed attempts not shown to user to prevent reconnaissance):

| Column     | Description                                |
|------------|--------------------------------------------|
| Date/Time  | Formatted per locale                       |
| Device     | Browser + OS (parsed from user agent)      |
| Location   | City, Country (IP geolocation)            |
| IP Address | Masked: first 3 octets (e.g. 192.168.1.x) |
| Status     | Success / Suspicious (anomaly detected)    |

---

## 12. Data and Privacy

### 12.1 Route

`GET /account/privacy` — authenticated consumer

### 12.2 Data Download (GDPR Art. 20 — Data Portability)

```
┌──────────────────────────────────────────────────────────────┐
│  Download My Data                                            │
├──────────────────────────────────────────────────────────────┤
│  You can download a copy of all personal data TwinMOS holds │
│  about you, including your profile, orders, and activity.   │
│                                                              │
│  The export will be prepared and emailed to you within      │
│  30 days. You will receive a download link via email.       │
│                                                              │
│  Last export requested: Never                               │
│                                                              │
│  [REQUEST DATA EXPORT]                                       │
└──────────────────────────────────────────────────────────────┘
```

**Data export contents (JSON format):**
- Profile information (name, email, phone, DOB, preferences)
- Registered addresses
- Order history (all orders, line items, totals)
- Loyalty account (balance, tier, full transaction history)
- Referral activity
- Consent records (with timestamps)
- Login history (last 12 months)
- Communication preferences

**Export process:**
1. Customer submits request → request logged with timestamp
2. Rate limit: 1 request per 30 days (to prevent abuse)
3. System generates export asynchronously (background job)
4. Export file (JSON, zipped) uploaded to Cloudflare R2 with 7-day expiry
5. Secure download link emailed to customer within 72 hours (target; max 30 days per GDPR)
6. Download link is single-use + time-limited

### 12.3 Account Deletion (GDPR Art. 17 — Right to Erasure)

```
┌──────────────────────────────────────────────────────────────┐
│  Delete My Account                                           │
├──────────────────────────────────────────────────────────────┤
│  WARNING: This action cannot be undone.                      │
│                                                              │
│  Deleting your account will:                                │
│  - Remove your personal information permanently             │
│  - Cancel any pending loyalty points                        │
│  - Remove your referral code                                │
│                                                              │
│  Your order records will be retained for 7 years as        │
│  required by UAE commercial law (VAT records).              │
│  These records will be anonymized (your personal            │
│  details removed).                                          │
│                                                              │
│  To confirm, type DELETE in the box below:                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  [PERMANENTLY DELETE MY ACCOUNT]                            │
└──────────────────────────────────────────────────────────────┘
```

**Erasure process:**

```
Customer confirms deletion
          │
          ▼
Validation:
  - No open orders (pending/processing/shipped)
  - If open orders: "You have active orders. Account deletion
    will be available once all orders are completed."
          │
          ▼
Anonymization (NOT hard delete):
  - auth_user: email → deleted_{uuid}@twinmos.invalid
  - auth_user: password_hash → NULL
  - auth_user: name → "Deleted User"
  - Medusa customer: first_name → "Deleted", last_name → "User"
  - Medusa customer: email → same as auth_user
  - Medusa customer: phone → NULL
  - LoyaltyAccount: points → 0 (forfeited)
  - ReferralCode: is_active → false
  - Sessions: all terminated
  - Profile photo: deleted from R2

Retained (anonymized):
  - Order records (for VAT/legal compliance)
  - Transaction records (financial audit)
  - Consent records (for compliance evidence; no personal data)

          │
          ▼
Audit log entry: account_deleted, timestamp, reason: "user_request"
          │
          ▼
Confirmation email sent to customer's email (before anonymization)
```

**Legal retention periods:**

| Record Type         | Retention Period | Legal Basis                           |
|---------------------|------------------|---------------------------------------|
| Order/Invoice data  | 7 years          | UAE VAT Law; India GST Law            |
| Payment records     | 7 years          | AML/CFT regulations                   |
| Consent records     | 3 years post-deletion | GDPR accountability principle   |
| Login history       | Delete immediately | No legal basis for retention        |
| Marketing data      | Delete immediately | Consent withdrawn                   |

### 12.4 Consent Management

```
┌──────────────────────────────────────────────────────────────┐
│  Manage My Preferences                                       │
├──────────────────────────────────────────────────────────────┤
│  Marketing Communications                                    │
│  [ ] Email marketing & promotions          [Update]          │
│  [ ] Product launches & updates            [Update]          │
│  [ ] Monthly newsletter                    [Update]          │
│                                                              │
│  Data Processing                                             │
│  [x] Analytics (anonymized site usage)     [Update]          │
│                                                              │
│  Privacy Policy: v2.1 (accepted 12 Apr 2025)                │
│  Terms of Service: v1.3 (accepted 12 Apr 2025)              │
│                                                              │
│  [View Cookie Preferences]                                   │
└──────────────────────────────────────────────────────────────┘
```

---

## 13. Loyalty Points Summary

### 13.1 Route

`GET /account/loyalty` — authenticated consumer

The loyalty section within the account provides the customer-facing view of their rewards status. Full program logic is documented in TWN-P3-LOYAL-2026-001.

### 13.2 Loyalty Dashboard Widgets

```
┌──────────────────────────────────────────────────────────────┐
│  TwinMOS Rewards                                             │
├──────────────────────────────────────────────────────────────┤
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐  │
│  │  Current Tier  │  │  Your Points   │  │  Lifetime Pts │  │
│  │                │  │                │  │               │  │
│  │    BRONZE      │  │     425        │  │     1,240     │  │
│  └────────────────┘  └────────────────┘  └───────────────┘  │
│                                                              │
│  Progress to Silver                                          │
│  ████████████████░░░░░░░░░░░░░░  425 / 1,000 pts           │
│  Earn 575 more points to reach Silver tier!                  │
│                                                              │
│  Points History                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Date        Event                     Points  Balance│   │
│  │ 12 Apr 2025 Purchase TW-20250412-0047  +349   425   │   │
│  │ 15 Mar 2025 Profile completion bonus   +25     76   │   │
│  │ 15 Mar 2025 First purchase bonus       +100    51   │   │
│  │ 15 Mar 2025 Purchase TW-20250315-0002  -49     -49  │   │
│  │ 01 Mar 2025 Welcome bonus              +100   100   │   │  
│  │                          [Load more]                 │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  How to earn more points                   [Learn more →]   │
└──────────────────────────────────────────────────────────────┘
```

---

## 14. Referral Program Summary

### 14.1 Route

`GET /account/referrals` — authenticated consumer

### 14.2 Referral Dashboard

The referral section provides the customer's personal referral link and tracking stats. Full program logic is documented in TWN-P3-REFER-2026-001.

```
┌──────────────────────────────────────────────────────────────┐
│  Refer & Earn                                                │
├──────────────────────────────────────────────────────────────┤
│  Share TwinMOS with friends and earn rewards when they buy!  │
│                                                              │
│  Your referral link:                                         │
│  ┌─────────────────────────────────────────┐ [Copy Link]    │
│  │ twinmos.com/join?ref=AHM123             │                │
│  └─────────────────────────────────────────┘                │
│                                                              │
│  Share via: [WhatsApp] [Email] [Twitter/X]                   │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Referrals   │  │ Conversions  │  │ Points Earned│      │
│  │   Sent: 5    │  │  Success: 2  │  │   400 pts    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  [View Full Referral Details →]                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 15. Account Security Policies

### 15.1 Password Policy

| Requirement               | Rule                                             |
|---------------------------|--------------------------------------------------|
| Minimum length            | 8 characters                                     |
| Maximum length            | 128 characters                                   |
| Required character types  | At least 1 uppercase letter                      |
|                           | At least 1 lowercase letter                      |
|                           | At least 1 digit                                 |
|                           | At least 1 special character (!@#$%^&*...)       |
| Password history          | Cannot reuse last 5 passwords (Phase 4)          |
| Breach check              | Check against HaveIBeenPwned API (Phase 4)       |
| Hashing algorithm         | bcrypt, cost factor 12                           |

**Password strength indicator levels:**

| Level | Criteria                                        | UI Color    |
|-------|-------------------------------------------------|-------------|
| Weak  | Meets minimum policy only                       | Red         |
| Fair  | +12 chars OR mix of 3 char types               | Orange      |
| Strong | +16 chars AND all character types              | Green       |

### 15.2 Account Lockout Policy

| Parameter              | Value                                               |
|------------------------|-----------------------------------------------------|
| Max failed attempts    | 5                                                   |
| Lockout duration       | 15 minutes                                          |
| Counter reset          | On successful login OR after lockout expires        |
| Lockout notification   | Email sent to registered address on lockout         |
| Admin unlock           | Strapi admin can manually unlock account            |

### 15.3 Session Policy

| Parameter             | Value                                                |
|-----------------------|------------------------------------------------------|
| Session type          | Server-side (stateful); session ID in cookie         |
| Idle timeout          | 30 minutes (rolling; extended on activity)           |
| Absolute timeout      | 8 hours (without "Remember me")                      |
| Remember me duration  | 30 days                                              |
| Session invalidation  | Password change invalidates all other sessions       |
|                       | Email change invalidates all sessions                |
|                       | Account deletion terminates all sessions immediately |
| Concurrent sessions   | Unlimited (visible in session manager)               |

### 15.4 Session Cookie Specification

```
Set-Cookie: __twinmos_session=<session_id>;
  HttpOnly;
  Secure;
  SameSite=Strict;
  Path=/;
  Max-Age=2592000; (30 days if rememberMe, else omit Max-Age for session cookie)
```

### 15.5 Rate Limiting

| Endpoint                    | Limit                           | Window    |
|-----------------------------|---------------------------------|-----------|
| POST /api/auth/login         | 10 attempts per IP              | 15 min    |
| POST /api/auth/register      | 5 attempts per IP               | 1 hour    |
| POST /api/auth/forgot-password | 3 attempts per email          | 1 hour    |
| POST /api/account/change-email | 3 attempts per user           | 1 hour    |
| POST /api/account/data-export  | 1 per 30 days per user        | 30 days   |

---

## 16. Business Rules

### BR-CUST-001 — Email Uniqueness

Each email address may be associated with only one TwinMOS account. Attempting to register with an already-registered email must return a generic error that does not confirm or deny email existence (anti-enumeration).

### BR-CUST-002 — GDPR Consent is Mandatory

Registration cannot proceed without explicit GDPR/privacy consent. The consent checkbox must be actively checked by the user; it cannot be pre-checked. Consent version and timestamp must be stored.

### BR-CUST-003 — Email Verification Before Purchase

An unverified consumer account may browse the website and add items to the cart but cannot complete checkout. On checkout, unverified accounts are prompted to verify their email before proceeding.

### BR-CUST-004 — Address Limit

A consumer account may have a maximum of 5 saved addresses. Attempting to add a 6th address must return a validation error with instructions to remove an existing address.

### BR-CUST-005 — Reorder Availability Check

When a customer initiates a Reorder, each item must be checked for current availability. Items no longer available must be silently skipped and the customer notified. Items with changed prices must be added at the current price; the customer must be informed of price differences.

### BR-CUST-006 — Password Change Session Behavior

Changing a password must immediately invalidate all sessions other than the current active session. The customer remains logged in on the device where the password was changed.

### BR-CUST-007 — Email Change Verification

An email address change does not take effect until the new email is verified. During the pending verification period, the original email remains active for login. Verification links expire after 24 hours.

### BR-CUST-008 — Account Deletion with Active Orders

Account deletion requests must be rejected if the customer has any orders in status: pending, requires_action, processing, or fulfilled (in-transit). The customer must wait until all active orders reach a terminal state (delivered, returned, or canceled).

### BR-CUST-009 — Data Retention Post-Deletion

Order and invoice records must be retained for 7 years after the order date, in accordance with UAE Federal Decree-Law No. 8 of 2017 (VAT) and equivalent regulations in other markets. Retained records must be anonymized: personal identifiers (name, email, phone, address) replaced with anonymized tokens.

### BR-CUST-010 — Data Export Rate Limiting

A customer may request a data export at most once per 30-day rolling period. Subsequent requests within the 30-day window must be rejected with information on when the next request is permitted.

### BR-CUST-011 — Profile Photo Requirements

Profile photos must be validated server-side. Only JPEG, PNG, and WebP formats are accepted. Maximum file size is 2 MB. Files exceeding limits or in unsupported formats must be rejected with a clear error message.

### BR-CUST-012 — Mandatory Transactional Emails

Order confirmation, shipping notification, delivery confirmation, and return confirmation emails are transactional communications and cannot be unsubscribed from. These emails are sent regardless of the customer's marketing communication preferences.

### BR-CUST-013 — 2FA Backup Codes

When a customer enables TOTP 2FA, exactly 8 backup codes must be generated and displayed once. Backup codes must be stored as hashed values (bcrypt). Each backup code is single-use and must be invalidated after first use. A customer who has exhausted all backup codes and lost their authenticator device must contact customer support for account recovery.

### BR-CUST-014 — Session Location Data

IP geolocation for session location display is best-effort. If geolocation fails (private IP, VPN, geolocation service unavailable), the location should display as "Unknown location" rather than an error.

### BR-CUST-015 — Wishlist Sharing Privacy

Shared wishlists must not expose any personally identifiable information of the sharing customer. The public wishlist page shows product listings only (names, images, prices, add-to-cart). The customer's name, email, or any other personal data must not appear on the shared page.

---

## 17. API Endpoints

### 17.1 Authentication Endpoints (Better Auth)

| Method | Endpoint                        | Auth Required | Description                         |
|--------|---------------------------------|---------------|-------------------------------------|
| POST   | /api/auth/register              | No            | Create new consumer account         |
| POST   | /api/auth/login                 | No            | Authenticate and create session     |
| POST   | /api/auth/logout                | Yes           | Terminate current session           |
| POST   | /api/auth/forgot-password       | No            | Initiate password reset             |
| POST   | /api/auth/reset-password        | No (token)    | Complete password reset             |
| GET    | /api/auth/verify-email          | No (token)    | Verify email address                |
| POST   | /api/auth/resend-verification   | No            | Resend verification email           |
| GET    | /api/auth/session               | Yes           | Get current session info            |

### 17.2 Account Management Endpoints

| Method | Endpoint                              | Description                                  |
|--------|---------------------------------------|----------------------------------------------|
| GET    | /api/account/profile                  | Get customer profile                         |
| PATCH  | /api/account/profile                  | Update profile fields                        |
| POST   | /api/account/profile/photo            | Upload/replace profile photo                 |
| DELETE | /api/account/profile/photo            | Remove profile photo                         |
| POST   | /api/account/change-email             | Initiate email change                        |
| POST   | /api/account/change-password          | Change password                              |
| GET    | /api/account/addresses                | List saved addresses                         |
| POST   | /api/account/addresses                | Add new address                              |
| PUT    | /api/account/addresses/:id            | Update address                               |
| DELETE | /api/account/addresses/:id            | Delete address                               |
| PATCH  | /api/account/addresses/:id/default    | Set as default shipping/billing              |
| GET    | /api/account/orders                   | List orders (paginated)                      |
| GET    | /api/account/orders/:id               | Get order detail                             |
| POST   | /api/account/orders/:id/reorder       | Add order items to cart                      |
| GET    | /api/account/orders/:id/invoice       | Download invoice PDF                         |
| POST   | /api/account/orders/:id/return        | Submit return request                        |
| GET    | /api/account/wishlist                 | Get wishlist                                 |
| POST   | /api/account/wishlist/items           | Add item to wishlist                         |
| DELETE | /api/account/wishlist/items/:id       | Remove item from wishlist                    |
| POST   | /api/account/wishlist/share           | Enable wishlist sharing                      |
| DELETE | /api/account/wishlist/share           | Disable wishlist sharing                     |
| GET    | /api/account/sessions                 | List active sessions                         |
| DELETE | /api/account/sessions/:id             | Terminate a session                          |
| DELETE | /api/account/sessions                 | Terminate all other sessions                 |
| GET    | /api/account/login-history            | Get login history (last 10)                  |
| POST   | /api/account/2fa/enable               | Begin TOTP 2FA setup                         |
| POST   | /api/account/2fa/verify               | Complete TOTP 2FA setup                      |
| DELETE | /api/account/2fa                      | Disable TOTP 2FA                             |
| GET    | /api/account/privacy/export-status    | Check data export status                     |
| POST   | /api/account/privacy/request-export   | Request data export                          |
| POST   | /api/account/privacy/delete-account   | Initiate account deletion                    |
| GET    | /api/account/preferences              | Get communication preferences                |
| PATCH  | /api/account/preferences              | Update communication preferences             |

### 17.3 API Response Standards

All API responses follow a consistent envelope format:

```json
// Success
{
  "success": true,
  "data": { ... },
  "meta": {
    "pagination": {         // for list endpoints
      "page": 1,
      "limit": 10,
      "total": 47,
      "totalPages": 5
    }
  }
}

// Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable error message",
    "fields": {             // for validation errors
      "email": "Email is already registered",
      "password": "Password must be at least 8 characters"
    }
  }
}
```

### 17.4 Standard Error Codes

| Code                    | HTTP Status | Description                                |
|-------------------------|-------------|--------------------------------------------|
| UNAUTHORIZED            | 401         | No valid session                           |
| FORBIDDEN               | 403         | Authenticated but insufficient permissions |
| NOT_FOUND               | 404         | Resource not found                         |
| VALIDATION_ERROR        | 422         | Input validation failed                    |
| RATE_LIMIT_EXCEEDED     | 429         | Too many requests                          |
| EMAIL_NOT_VERIFIED      | 403         | Email not verified; action requires verification |
| ACCOUNT_LOCKED          | 403         | Account temporarily locked                 |
| DUPLICATE_EMAIL         | 409         | Email already registered                   |
| INVALID_TOKEN           | 401         | Verification/reset token invalid or expired |

---

## 18. Compliance Requirements

### 18.1 GDPR (EU General Data Protection Regulation)

TwinMOS serves customers in the EU and processes their data. GDPR compliance is required:

| Article          | Requirement                    | Implementation                                    |
|------------------|--------------------------------|---------------------------------------------------|
| Art. 6           | Lawful basis for processing    | Consent (marketing); Contractual necessity (orders) |
| Art. 7           | Conditions for consent         | Explicit checkbox; timestamp + version stored     |
| Art. 12–14       | Transparency (privacy notice)  | Privacy Policy linked at registration             |
| Art. 15          | Right of access                | Data export feature (/account/privacy)            |
| Art. 16          | Right to rectification         | Profile edit (/account/profile)                   |
| Art. 17          | Right to erasure               | Account deletion (/account/privacy)               |
| Art. 18          | Right to restriction           | Customer service process (Phase 4)                |
| Art. 20          | Right to data portability      | JSON data export                                  |
| Art. 25          | Privacy by design              | Data minimization; encryption at rest             |
| Art. 32          | Security of processing         | bcrypt, HTTPS, HttpOnly cookies, session management |

### 18.2 UAE Personal Data Protection Law (PDPL)

Federal Decree-Law No. 45 of 2021:

| Requirement                        | Implementation                                       |
|------------------------------------|------------------------------------------------------|
| Consent for personal data          | Registration consent checkbox                        |
| Purpose limitation                 | Privacy policy specifies purpose; data not reused    |
| Data minimization                  | Only necessary fields collected                      |
| Data subject rights                | Access, rectification, deletion features in account  |
| Cross-border transfer restrictions | Data stored on Hetzner EU; EU adequacy considered    |
| Data breach notification           | Incident response plan (separate document)           |

### 18.3 India Digital Personal Data Protection Act (DPDP) 2023

| Requirement                        | Implementation                                       |
|------------------------------------|------------------------------------------------------|
| Consent for data processing        | Explicit consent at registration                     |
| Purpose-specific consent           | Separate consent for marketing vs. transactional     |
| Data principal rights              | Access, correction, erasure features                 |
| Grievance officer                  | Contact details in privacy policy                    |
| Children's data (under 18)         | DOB field; if under 18 detected, restrict account (Phase 4) |

### 18.4 Data Storage and Encryption

| Data Category          | Storage                      | Encryption                              |
|------------------------|------------------------------|-----------------------------------------|
| Passwords              | PostgreSQL                   | bcrypt hash (not reversible)            |
| Date of Birth          | PostgreSQL                   | AES-256 encrypted column                |
| Session tokens         | PostgreSQL (Better Auth)     | Random UUID (not decodable)             |
| Profile photos         | Cloudflare R2                | At-rest encryption by Cloudflare        |
| IP addresses           | PostgreSQL                   | Stored in plain text; masked in UI      |
| Payment methods        | Stripe (not stored by us)    | Stripe PCI-DSS compliance               |

---

## 19. Acceptance Criteria

### 19.1 Registration

- [x] AC-CUST-001: A visitor can register with a valid email, password meeting policy, and GDPR consent checked
- [x] AC-CUST-002: Attempting to register with an already-used email returns an error without confirming the email exists
- [x] AC-CUST-003: A verification email is sent within 60 seconds of registration
- [x] AC-CUST-004: Clicking the verification link sets email_verified = true and redirects to /account
- [x] AC-CUST-005: An expired verification link shows an error with a resend option
- [x] AC-CUST-006: A Medusa customer record is created linked to the Better Auth user record
- [x] AC-CUST-007: A LoyaltyAccount record is created with 0 points on registration
- [x] AC-CUST-008: A ReferralCode is generated for the new customer on registration

### 19.2 Login

- [x] AC-CUST-009: A verified user can log in with correct email and password
- [x] AC-CUST-010: An incorrect password increments the failed_login_count
- [x] AC-CUST-011: After 5 failed attempts, the account is locked for 15 minutes and a notification email is sent
- [x] AC-CUST-012: "Remember me" creates a 30-day session; without it, the session expires after 8 hours
- [x] AC-CUST-013: Forgot password sends an email with a reset link valid for 1 hour
- [x] AC-CUST-014: A used or expired reset link returns an error

### 19.3 Profile and Addresses

- [x] AC-CUST-015: Customer can update name, phone, DOB, and company name from /account/profile
- [x] AC-CUST-016: Email change requires verification at the new email before taking effect
- [x] AC-CUST-017: Profile photo upload rejects files over 2 MB and non-image formats
- [x] AC-CUST-018: Customer can add up to 5 addresses; the 6th is rejected with an error
- [x] AC-CUST-019: Deleting the default shipping address requires setting another as default first

### 19.4 Orders and Wishlist

- [x] AC-CUST-020: Order history is paginated at 10 per page in reverse chronological order
- [x] AC-CUST-021: Reorder adds available items to cart and skips unavailable items with notification
- [x] AC-CUST-022: Invoice PDF downloads correctly and contains all required fields
- [x] AC-CUST-023: Wishlist accepts up to 50 items; the 51st is rejected
- [x] AC-CUST-024: Shared wishlist URL is publicly accessible and shows no personal data

### 19.5 Security

- [x] AC-CUST-025: Active sessions list shows all active sessions with device/location information
- [x] AC-CUST-026: Terminating a session from the sessions list invalidates that session immediately
- [x] AC-CUST-027: Changing password invalidates all sessions except the current one
- [x] AC-CUST-028: TOTP 2FA can be enabled; subsequent logins require the 6-digit code
- [x] AC-CUST-029: Backup codes work as an alternative to TOTP; each code is single-use

### 19.6 Privacy and Compliance

- [x] AC-CUST-030: Data export request is rate-limited to 1 per 30 days
- [x] AC-CUST-031: Data export JSON contains all personal data categories defined in this spec
- [x] AC-CUST-032: Account deletion is blocked if open orders exist
- [x] AC-CUST-033: Account deletion anonymizes personal data while retaining order records
- [x] AC-CUST-034: Consent records (type, timestamp, version) are stored on the auth_user record
- [x] AC-CUST-035: Unsubscribing from marketing emails does not affect order transactional emails

---

## 20. Appendix

### 20.1 Glossary

| Term                | Definition                                                        |
|---------------------|-------------------------------------------------------------------|
| Better Auth         | Open-source authentication library used for session management    |
| Medusa.js v2        | Open-source commerce engine providing customer + order modules    |
| Strapi v5           | Headless CMS used for loyalty, referral, and MDF program data     |
| TOTP                | Time-based One-Time Password (RFC 6238); used for 2FA             |
| GDPR                | General Data Protection Regulation (EU, 2018)                     |
| UAE PDPL            | UAE Personal Data Protection Law (Federal Decree-Law 45/2021)     |
| India DPDP          | India Digital Personal Data Protection Act (2023)                 |
| AED                 | UAE Dirham                                                        |
| INR                 | Indian Rupee                                                      |
| BDT                 | Bangladeshi Taka                                                  |
| SAR                 | Saudi Riyal                                                       |
| bcrypt              | Password hashing algorithm with cost factor                       |
| R2                  | Cloudflare R2 object storage                                      |
| Resend              | Transactional email API provider                                  |

### 20.2 Revision History

| Version | Date       | Author                   | Changes                          |
|---------|------------|--------------------------|----------------------------------|
| 1.0     | 2026-05-01 | TwinMOS Digital Product  | Initial draft                    |

### 20.3 Open Questions

| ID  | Question                                                                     | Owner            | Due Date   |
|-----|------------------------------------------------------------------------------|------------------|------------|
| OQ-001 | Confirm retention period for UAE VAT records (7 years vs 5 years?)        | Legal / Finance  | 2026-05-15 |
| OQ-002 | Is Apple Sign-In required in Phase 4 or optional?                         | Product Manager  | 2026-05-15 |
| OQ-003 | Should India accounts detect under-18 users via DOB and restrict features? | Legal / Product  | 2026-05-30 |
| OQ-004 | Confirm which IP geolocation provider to use (MaxMind, ipinfo.io, etc.)   | Engineering      | 2026-05-15 |
| OQ-005 | Confirm PDF generation library (Puppeteer, PDFKit, react-pdf)             | Engineering      | 2026-05-15 |

---

*Document Reference: TWN-P3-CUST-2026-001 | Version 1.0 | TwinMOS Technologies*
