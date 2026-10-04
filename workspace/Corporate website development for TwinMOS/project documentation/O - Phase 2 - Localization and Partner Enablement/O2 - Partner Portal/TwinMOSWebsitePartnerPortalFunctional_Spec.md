# TwinMOS Corporate Website — Partner Portal Functional Specification

**Document Reference:** TWN-P2-PARTNER-2027-001  
**Document Version:** 1.0  
**Status:** APPROVED — For development implementation  
**Phase:** Phase 2 — Localization & Partner Enablement  
**Feature:** Partner Portal (Better Auth + Strapi RBAC)  
**Planned Delivery:** Phase 2, Sprints 6A–6B (January–February 2027)  
**Prepared by:** TwinMOS Digital Transformation Team / Unisoft Engineering  
**Owner:** IT/Technical Lead + Marketing Director  
**Audience:** Unisoft Dev A (Frontend), Unisoft Dev B (Backend), TwinMOS Marketing, Legal  
**Classification:** CONFIDENTIAL — TwinMOS + Unisoft Internal Use  
**Source References:**  
- Tech Stack v1.1 §9.3 (Better Auth), §9.4 (Auth Flow), §5.3 (CMS Roles)  
- BRD v3.0 §17 (Partner Portal Epic), §21.2 (Auth Requirements), §26.2 (API Auth)  
- URD v3.0 UC-32 (Partner Portal Access), URD §17 (CMS Role Requirements)  
- Content Map: `content/website-content/09-partners/` (21 files)

---

## Table of Contents

1. [Overview & Purpose](#1-overview--purpose)
2. [Partner Types & Access Tiers](#2-partner-types--access-tiers)
3. [Authentication Architecture (Better Auth)](#3-authentication-architecture-better-auth)
4. [Session & Security Model](#4-session--security-model)
5. [Partner Registration & Onboarding Flow](#5-partner-registration--onboarding-flow)
6. [Portal Pages & Features](#6-portal-pages--features)
7. [Role-Based Access Control Matrix](#7-role-based-access-control-matrix)
8. [API Endpoints](#8-api-endpoints)
9. [Watermarked PDF Price List Delivery](#9-watermarked-pdf-price-list-delivery)
10. [Marketing Assets Library](#10-marketing-assets-library)
11. [Training & Certification Module](#11-training--certification-module)
12. [Order Management Integration](#12-order-management-integration)
13. [Notifications & Alerts](#13-notifications--alerts)
14. [Strapi Data Model](#14-strapi-data-model)
15. [Frontend Components Inventory](#15-frontend-components-inventory)
16. [Error States & Edge Cases](#16-error-states--edge-cases)
17. [Audit & Compliance](#17-audit--compliance)
18. [Acceptance Criteria](#18-acceptance-criteria)

---

## 1. Overview & Purpose

The TwinMOS Partner Portal is a **role-authenticated, feature-gated digital workspace** for authorized distributors, resellers, OEM/ODM partners, and system builders. It replaces the current ad hoc approach of emailing price lists and marketing assets to partners and instead provides:

- **Self-service access** to price lists, marketing assets, training materials, and order history
- **Secure, MFA-protected** login with session management per BRD §21.2
- **Watermarked PDF price lists** that deter unauthorized redistribution
- **Performance dashboard** showing sales metrics, certification status, and account alerts
- **Order placement and tracking** visibility (read-only in Phase 2; full order placement in Phase 3 via Medusa)
- **Certification tracking** for required annual recertification

The portal is implemented as a **set of Astro Server Islands** backed by **Better Auth** (session management) and **Strapi v5** (content + RBAC). No separate back-end service is built — all logic flows through the existing Strapi + Astro stack.

**URL namespace:** `/partner/` (distinct from public `/partners/` partner information pages)

---

## 2. Partner Types & Access Tiers

### 2.1 Partner Classification

| Partner Type | Description | Example Accounts |
|--------------|-------------|------------------|
| **Reseller** | Purchases from authorized distributor; sub-account created by distributor | Regional IT shops, online retailers |
| **OEM/ODM Partner** | Systems integrator or ODM requiring custom memory configurations | PC manufacturers, server builders |
| **System Builder** | Local assemblers with volume pricing; builds and sells custom PCs | Gaming PC shops, integrators |

### 2.2 Access Tier Definitions

| Tier | Assigned To | Features Unlocked |
|------|-------------|-------------------|
| **Elite** | Top-volume distributors (top 20% by annual revenue) | All features + product roadmap preview + advisory council access |
| **Certified** | Distributors with ≥1 certified staff + training complete | Price lists + marketing assets + training + order visibility |
| **Registered** | New distributors in onboarding; resellers and system builders | Limited: training access + product catalog + basic price visibility |

---

## 3. Authentication Architecture (Better Auth)

### 3.1 Technology Selection

**Selected:** Better Auth `^1.x` (Tech Stack §9.3; TRISK-8 GA tracking)  
**Rationale:** De facto standard for Astro/Next.js OSS auth in 2026; built-in MFA, OAuth, multi-tenancy, and Astro integration.  
**Fallback if Better Auth not GA by Jan 10, 2027:** Lucia Auth v3 (same session model; ~3-day swap effort).

### 3.2 Configuration

```ts
// better-auth.config.ts (illustrative)
import { betterAuth } from 'better-auth';
import { postgresql } from 'better-auth/adapters/postgres';
import { totp } from 'better-auth/plugins/totp';
import { organization } from 'better-auth/plugins/organization';

export const auth = betterAuth({
  database: postgresql({ connectionString: process.env.DATABASE_URL }),
  session: {
    cookieName: '__Host-twinmos-session',
    cookieOptions: {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    },
    expiresIn: 60 * 60 * 8,        // 8 hours absolute
    updateAge: 60 * 30,            // 30 min idle reset
  },
  plugins: [
    totp({
      issuer: 'TwinMOS Partner Portal',
      require: ['distributor', 'oem'],  // Mandatory for these roles
    }),
    organization({
      allowUserToCreateOrganization: false,  // Only TwinMOS admin creates orgs
    }),
  ],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 12,
    passwordPolicy: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{12,}$/,
  },
  rateLimit: {
    window: 60,
    max: 10,  // 10 login attempts per minute per IP
  },
  trustedOrigins: ['https://twinmos.com', 'https://staging.twinmos.com'],
});
```

### 3.3 Auth Flow (Per Tech Stack §9.4)

```
Step 1: User navigates to /partner/login
        → Astro page renders <PartnerLoginForm /> React island (client:load)

Step 2: User submits credentials
        → POST /api/auth/sign-in/email → Better Auth handler
        → Better Auth: verify email + password
        → If invalid: 400 + error message; increment rate-limit counter
        → If valid: check MFA enrollment

Step 3a: TOTP MFA (Distributors + OEM — mandatory)
        → POST /api/auth/totp/verify { code }
        → Better Auth validates TOTP code
        → If invalid: 401; max 5 attempts before 30-min lockout

Step 3b: No MFA (Reseller / System Builder — optional TOTP)
        → Skip MFA step

Step 4: Session created
        → Better Auth creates DB session in `sessions_*` schema
        → Set-Cookie: __Host-twinmos-session (HttpOnly, Secure, SameSite=Strict)
        → Redirect to /partner/dashboard

Step 5: Authenticated requests
        → Astro Server Islands read session from cookie via Better Auth middleware
        → Strapi called with partner_jwt (role-scoped token derived from session)
        → Strapi RBAC enforces content visibility per role
```

### 3.4 Password Reset Flow

```
User → /partner/forgot-password
    → POST /api/auth/forgot-password { email }
    → Better Auth: generate time-limited reset token (24-hour TTL)
    → Resend: send password reset email to registered business email
    → User clicks link → /partner/reset-password?token=<token>
    → POST /api/auth/reset-password { token, newPassword }
    → Better Auth: validate token + update password + invalidate all sessions
    → Redirect to /partner/login with success message
```

### 3.5 MFA Enrollment Flow (New Distributors)

```
After first login (no MFA enrolled yet):
    → Redirect to /partner/mfa-setup
    → GET /api/auth/totp/generate → returns QR code + secret
    → User scans with Authenticator app
    → POST /api/auth/totp/enroll { code } (validates 6-digit code)
    → MFA enrolled; recovery codes displayed (one-time view; download encouraged)
    → Redirect to /partner/dashboard
```

---

## 4. Session & Security Model

### 4.1 Session Specification

| Parameter | Value | Source |
|-----------|-------|--------|
| Absolute session expiry | 8 hours | BRD §21.1; URD §34.1 |
| Idle timeout | 30 minutes | BRD §21.1; URD §34.1 |
| Idle countdown warning | Shown at 25 minutes idle | URD §34.1 / UR-7.1.4 |
| Session cookie name | `__Host-twinmos-session` | Tech Stack §9.3 |
| Cookie attributes | `HttpOnly; Secure; SameSite=Strict` | BRD §21.2 |
| Concurrent sessions | 1 per device (logout from one device when new session starts on another) | Security best practice |
| Session DB | PostgreSQL `sessions_*` schema on Hetzner | Tech Stack §6.2 |

### 4.2 Account Lockout Policy

| Event | Action | Duration |
|-------|--------|---------|
| 5 failed login attempts (within 30 min) | Account locked | 30-minute auto-unlock |
| 5 failed TOTP attempts | Account locked | 30-minute; or partner-support@twinmos.com to unlock early |
| Suspicious activity detected (IP change mid-session) | Session invalidated | Immediate; re-auth required |
| Password reset triggered | All existing sessions invalidated | Immediate |

### 4.3 Bot Protection

Cloudflare Turnstile widget required on:
- `/partner/login`
- `/partner/forgot-password`
- `/partner/reset-password`

Turnstile challenge mode: `managed` (invisible for trusted IPs; interactive for suspected bots).

---

## 5. Partner Registration & Onboarding Flow

### 5.1 Registration Trigger

Partner Portal accounts are **not self-registered**. Account creation flow:

```
1. Distributor completes onboarding via /partners/become-distributor form
2. TwinMOS Marketing reviews application (Step 2 of onboarding process)
3. Agreement signed (Step 3)
4. Training completed (Step 4)
5. TwinMOS Admin creates Better Auth account in /partner/admin
6. Credentials sent via Resend (secure, one-time password email)
7. Partner logs in; forced MFA enrollment on first login
8. Partner configures profile + adds team members
```

### 5.2 Team Member Invites

- Distributors can invite team members up to their tier's limit (Registered: 3; Certified: 10; Elite: unlimited)
- Each team member assigned a sub-role: `Marketing` (asset downloads) or `Procurement` (price list access)
- Invitation flow: Distributor → `/partner/team/invite` → Resend email → member completes profile → MFA enrollment

---

## 6. Portal Pages & Features

### 6.1 Partner Portal URL Structure

| URL | Page | Auth Required | Tier |
|-----|------|---------------|------|
| `/partner/login` | Login | No | All |
| `/partner/forgot-password` | Forgot Password | No | All |
| `/partner/mfa-setup` | MFA Enrollment | Yes (no MFA) | All |
| `/partner/dashboard` | Dashboard Home | Yes | All |
| `/partner/assets` | Marketing Assets Library | Yes | Registered+ |
| `/partner/assets/[category]` | Asset Category | Yes | Registered+ |
| `/partner/price-lists` | Price Lists Index | Yes | Certified+ |
| `/partner/price-lists/[id]/download` | Watermarked PDF Download | Yes | Certified+ |
| `/partner/training` | Training Hub | Yes | Registered+ |
| `/partner/training/[module]` | Training Module | Yes | Registered+ |
| `/partner/orders` | Order History | Yes | Certified+ |
| `/partner/orders/[id]` | Order Detail | Yes | Certified+ |
| `/partner/support` | Support Ticket Submission | Yes | All |
| `/partner/account` | Account Settings | Yes | All |
| `/partner/team` | Team Management | Yes | Admin users only |
| `/partner/announcements` | Partner Announcements | Yes | All |

### 6.2 Dashboard Page (`/partner/dashboard`)

**Data displayed:** (Server Island; refreshes every 15 minutes)

| Widget | Data Source | Visibility |
|--------|-------------|------------|
| Welcome banner + partner name | Better Auth session | All |
| Account summary (tier, type, territory, AM name) | Strapi `Partner` collection | All |
| Notifications (up to 5 latest) | Strapi `PartnerNotification` | All |
| Performance metrics (YTD revenue, QTD units, inventory turn, MDF utilization) | ERP sync (Phase 2) | Certified+ |
| Certification status (certified count / required) | Strapi `Training` collection | Registered+ |
| Recent orders (last 3) | ERP or Strapi `OrderSummary` | Certified+ |
| Quick links | Static | All |
| Upcoming events | Strapi `Event` collection | All |
| Product updates (last 3 news items tagged `partner`) | Strapi `Article` | All |

### 6.3 Marketing Assets Library (`/partner/assets`)

**Purpose:** Centralized repository of co-branded and product marketing materials.

**Asset categories:**

| Category | File Types | Example Assets |
|----------|-----------|----------------|
| Product Images | PNG (1200×1200, transparent) | VOLTX DDR5 RGB, CoreX Pro Gen5, all SKUs |
| Banners (Web) | JPG / PNG / GIF (various sizes) | 728×90, 300×250, 1200×628 social |
| Brochures & Datasheets | PDF | Product brochures, technical datasheets |
| Brand Guidelines | PDF | Logos, color palette, typography guide |
| Presentation Decks | PPTX / PDF | Sales deck, product comparison deck |
| Video Assets | MP4 (low-res preview; full-res download) | Product demos, unboxing videos |
| Campaign Kits | ZIP | Pre-packaged sets per product launch |
| Point-of-Sale Materials | PDF / AI | Shelf talkers, posters |

**Features:**
- Search by product line, asset type, or keyword
- Download individual files or bundle as ZIP (max 500 MB per download)
- Preview thumbnails for images and PDF first page
- Version badge (e.g., "Updated Q2 2027")
- Download history per partner account (audit log)
- Strapi `Asset` collection with `allowed_tiers[]` field (RBAC-gated at API level)

### 6.4 Price Lists (`/partner/price-lists`)

**Purpose:** Access to current distributor, reseller, and system-builder pricing.

| Price List Type | Availability | Cadence |
|----------------|--------------|---------|
| Distributor Price List (full catalog) | Distributor tier only | Quarterly + on promotion |
| Reseller Price List (suggested) | Reseller tier | Quarterly |
| System Builder Price List | System Builder tier | Quarterly |
| Promotional / Bundle Pricing | All tiers (role-filtered) | Campaign-based |
| MAP (Minimum Advertised Price) Policy | All tiers | Annual + on update |

Each price list is delivered as a **watermarked PDF** (see §9 for full spec). Direct CSV downloads are not available to prevent bulk scraping.

---

## 7. Role-Based Access Control Matrix

### 7.1 Content Access Matrix

| Feature / Content | Registered | Certified | Elite | Procurement Sub-role | Marketing Sub-role |
|-------------------|------------|-----------|-------|---------------------|-------------------|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Product catalog (public) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Marketing Assets | ✅ | ✅ | ✅ | ❌ | ✅ |
| Brochures & Datasheets | ✅ | ✅ | ✅ | ✅ | ✅ |
| Training Modules | ✅ | ✅ | ✅ | ❌ | ✅ |
| Distributor Price List | ❌ | ✅ | ✅ | ✅ | ❌ |
| Reseller Price List | ❌ | ✅ | ✅ | ✅ | ❌ |
| Promotional Pricing | ❌ | ✅ | ✅ | ✅ | ❌ |
| MAP Policy PDF | ✅ | ✅ | ✅ | ✅ | ✅ |
| Order History | ❌ | ✅ | ✅ | ✅ | ❌ |
| Performance Metrics | ❌ | ✅ | ✅ | ✅ | ❌ |
| Product Roadmap Preview | ❌ | ❌ | ✅ | ❌ | ❌ |
| Advisory Council Access | ❌ | ❌ | ✅ | ❌ | ❌ |
| Team Management | ✅ (admin only) | ✅ (admin only) | ✅ (admin only) | ❌ | ❌ |
| Support Ticket Submission | ✅ | ✅ | ✅ | ✅ | ✅ |

### 7.2 Strapi Role Enforcement

Strapi `strapi-plugin-protected-populate` enforces field-level RBAC so that even if a partner crafts a direct API call, Strapi returns only data their role permits. Partner JWT is scoped to exactly the collections their role can read.

---

## 8. API Endpoints

### 8.1 Authentication Endpoints (Better Auth)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/sign-in/email` | No | Email + password login |
| POST | `/api/auth/sign-out` | Session | Logout; invalidate session |
| POST | `/api/auth/forgot-password` | No | Send reset link to email |
| POST | `/api/auth/reset-password` | Token | Reset password with token |
| GET | `/api/auth/totp/generate` | Session (no MFA) | Get TOTP QR code + secret |
| POST | `/api/auth/totp/enroll` | Session (no MFA) | Confirm TOTP enrollment |
| POST | `/api/auth/totp/verify` | Session (enrolled) | Verify TOTP code at login |
| GET | `/api/auth/session` | Session | Get current session data |

### 8.2 Partner Portal Data Endpoints (Strapi, JWT-gated)

| Method | Endpoint | Auth | RBAC | Description |
|--------|----------|------|------|-------------|
| GET | `/api/v1/partner/dashboard` | Session → JWT | Registered+ | Dashboard data aggregate |
| GET | `/api/v1/partner/assets` | Session → JWT | Registered+ | Marketing asset list |
| GET | `/api/v1/partner/assets/:id/download` | Session → JWT | Registered+ | Signed URL for asset download |
| GET | `/api/v1/partner/price-lists` | Session → JWT | Certified+ | Available price lists |
| POST | `/api/v1/partner/price-lists/:id/generate-pdf` | Session → JWT | Certified+ | Trigger watermarked PDF generation |
| GET | `/api/v1/partner/price-lists/:id/download` | Session → JWT | Certified+ | Download generated watermarked PDF |
| GET | `/api/v1/partner/training` | Session → JWT | Registered+ | Training module list |
| GET | `/api/v1/partner/training/:moduleId` | Session → JWT | Registered+ | Module content |
| POST | `/api/v1/partner/training/:moduleId/complete` | Session → JWT | Registered+ | Mark module complete |
| GET | `/api/v1/partner/orders` | Session → JWT | Certified+ | Order history (paginated) |
| GET | `/api/v1/partner/orders/:orderId` | Session → JWT | Certified+ | Order detail |
| GET | `/api/v1/partner/notifications` | Session → JWT | All | Partner-specific notifications |
| GET | `/api/v1/partner/announcements` | Session → JWT | All | Global partner announcements |
| POST | `/api/v1/partner/support/ticket` | Session → JWT | All | Submit support ticket |

### 8.3 Response Envelope (RFC 9457 standard)

All API errors follow RFC 9457 Problem Details format:

```json
{
  "type": "https://twinmos.com/errors/partner/insufficient-tier",
  "title": "Insufficient Partner Tier",
  "status": 403,
  "detail": "Price list access requires Certified or Elite tier. Your current tier is Registered.",
  "instance": "/api/v1/partner/price-lists"
}
```

---

## 9. Watermarked PDF Price List Delivery

### 9.1 Purpose

Price lists contain commercially sensitive distributor pricing. Watermarking deters unauthorized sharing and enables audit trails if pricing leaks to competitors.

### 9.2 Watermark Content

Each generated PDF embeds the following watermark:

```
CONFIDENTIAL — Authorized Distributor Use Only
Partner: {{Company Name}} | {{Partner ID}}
Downloaded by: {{User Email}} | {{Session ID (last 8 chars)}}
Generated: {{ISO 8601 Date and Time in UTC}}
Valid for: This pricing session only. Redistribution prohibited.
TwinMOS Technologies — partner-support@twinmos.com
```

Watermark placement:
- **Diagonal overlay** (45° angle) on every page, semi-transparent (opacity 15%)
- **Header band** on page 1 with partner name + download timestamp (opaque)
- **Footer** on every page: "CONFIDENTIAL — For {{Company Name}} use only"

### 9.3 PDF Generation Pipeline

```
POST /api/v1/partner/price-lists/:id/generate-pdf
    → Strapi controller validates session + tier
    → Retrieve price list data from Strapi `PriceList` collection
    → Pass to Puppeteer-based PDF generation service:
        * Render price list HTML template with dynamic data
        * Apply watermark layer (PDF-lib)
        * Generate PDF in memory
    → Store PDF temporarily in Backblaze B2 (TTL: 1 hour)
    → Return signed download URL (expires in 60 minutes)
    → Log: partner_id, user_email, price_list_id, generated_at in Strapi `PDFDownloadLog`

GET /api/v1/partner/price-lists/:id/download
    → Validate session + original generation request (within 60-min TTL)
    → Stream PDF from Backblaze B2
    → Content-Disposition: attachment; filename="TwinMOS-PriceList-{{PartnerID}}-{{Date}}.pdf"
```

### 9.4 Full PDF Specification

See dedicated document: `TwinMOSWebsiteWatermarkedPDFGeneration_Spec.md` (O6 folder).

---

## 10. Marketing Assets Library

### 10.1 Asset Metadata Schema (Strapi)

```ts
interface Asset {
  id: string;
  title: string;
  slug: string;
  category: AssetCategory;       // 'product-image' | 'banner' | 'brochure' | ...
  product_line: string[];        // ['voltx-ddr5', 'corex-pro', ...]
  file_url: string;              // Backblaze B2 signed URL
  thumbnail_url: string;         // imgproxy-generated 400×300 thumbnail
  file_type: string;             // 'pdf' | 'png' | 'jpg' | 'pptx' | 'zip' | 'mp4'
  file_size_bytes: number;
  allowed_tiers: Tier[];         // ['registered', 'certified', 'elite']
  version: string;               // e.g., 'Q2-2027'
  updated_at: ISO8601;
  dimensions?: string;           // for images: '1200x1200'
  resolution_dpi?: number;       // for print assets
  locale?: Locale[];             // ['en', 'ar', ...] for localized assets
  tags: string[];
}
```

### 10.2 Download Audit

Every asset download is logged in Strapi `AssetDownloadLog`:

```ts
interface AssetDownloadLog {
  partner_id: string;
  user_email: string;
  asset_id: string;
  downloaded_at: ISO8601;
  ip_address: string;
  session_id: string;
}
```

Logs retained for 12 months. Accessible to TwinMOS Marketing admin only.

---

## 11. Training & Certification Module

### 11.1 Training Modules Available at Phase 2 Launch

| Module | Format | Duration | Certification | Renewal |
|--------|--------|----------|---------------|---------|
| TwinMOS Brand & Portfolio Overview | Self-paced video + quiz | 2 hrs | Sales Certified | Annual |
| DRAM Technology Fundamentals | Self-paced video + quiz | 3 hrs | Sales Certified | Annual |
| SSD Technology & Interfaces | Self-paced video + quiz | 3 hrs | Sales Certified | Annual |
| PCIe Gen 5 Deep Dive | Self-paced video | 1.5 hrs | Optional | Annual |
| Competitive Positioning (DRAM) | Live webinar recording | 1.5 hrs | Optional | Annual |
| Technical Troubleshooting | Live webinar recording | 2 hrs | Tech Certified | Annual |
| Selling in Enterprise Environments | Live webinar recording | 1.5 hrs | Optional | Annual |

### 11.2 Training Progress Tracking (Strapi Schema)

```ts
interface TrainingProgress {
  partner_id: string;
  user_email: string;
  module_id: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'certified';
  completion_percentage: number;
  last_activity: ISO8601;
  completed_at?: ISO8601;
  quiz_score?: number;          // 0–100; pass threshold 80
  certification_issued_at?: ISO8601;
  certification_expires_at?: ISO8601;   // +12 months from issued
}
```

### 11.3 Certification Expiry Notifications

| Event | Trigger | Channel |
|-------|---------|---------|
| Certification due in 60 days | 60 days before expiry | Portal notification + email |
| Certification due in 30 days | 30 days before expiry | Portal notification + email (escalation) |
| Certification expired | Day of expiry | Portal notification + email; partner marked 'Renewal Pending' |
| Annual recertification reminder | Oct 1 each year (global sweep) | Email to all certified contacts |

---

## 12. Order Management Integration

### 12.1 Phase 2 Scope (Read-Only)

In Phase 2, order management is **read-only** — partners can see order history and status pulled from ERP, but cannot place new orders via the portal. Order placement is delivered in Phase 3 via Medusa.js integration.

### 12.2 Data Source

Order data flows: **ERP system → Strapi `OrderSummary` collection (daily sync)** → Partner Portal API.

Fields displayed per order:

| Field | Description |
|-------|-------------|
| Order Reference | TwinMOS order number (e.g., TWM-2027-001234) |
| Order Date | ISO date |
| Status | `In Production` / `Shipped` / `Delivered` / `Invoiced` / `On Hold` |
| Tracking | Carrier tracking link (if available) |
| Items | SKU list + quantities |
| Value | Total (currency per territory) |
| Invoice Link | PDF link (Phase 3) |

### 12.3 Phase 3 Full Order Placement

Phase 3 will add:
- Shopping cart with Medusa.js
- Checkout with Stripe (or regional payment gateway)
- Real-time inventory check from ERP
- Order confirmation + invoice via Resend

---

## 13. Notifications & Alerts

### 13.1 In-Portal Notification System

Notifications displayed in the dashboard notification panel (max 10; paginated):

| Notification Type | Trigger | Who Sees |
|-------------------|---------|---------|
| New product launch | Marketing publishes `partner` tag article | All |
| Price list updated | Strapi `PriceList` entry updated | Certified+; Procurement role |
| Certification expiry reminder | Automated (see §11.3) | Certified users nearing expiry |
| Contract renewal reminder | 90 days before contract_expiry | Account admin |
| Distributor summit invitation | TwinMOS manually publishes event | Distributors by region |
| New training module available | Training module published | All |
| RMA status update | RMA state transition | Partners with open RMAs |
| Product recall alert (if any) | Legal / Product publishes recall | All |

### 13.2 Email Notifications (Resend)

All notifications are also sent as email using Resend transactional API. Templates stored in Strapi `EmailTemplate` collection. Localized versions (AR/BN/HI) available for Phase 2 locales.

---

## 14. Strapi Data Model

### 14.1 New Collections for Partner Portal

| Collection | Key Fields | Phase |
|------------|-----------|-------|
| `Partner` | `company_name`, `partner_type`, `tier`, `territory`, `account_manager`, `contract_expiry`, `better_auth_org_id` | P2 |
| `PartnerUser` | `email`, `better_auth_user_id`, `partner_id` (relation), `role: 'admin' | 'marketing' | 'procurement'`, `mfa_enrolled` | P2 |
| `PriceList` | `title`, `type` (distributor/reseller/sysbuilder), `effective_date`, `expiry_date`, `source_data` (JSON), `allowed_tiers[]`, `locale` | P2 |
| `Asset` | See §10.1 schema | P2 |
| `AssetDownloadLog` | `partner_id`, `user_email`, `asset_id`, `downloaded_at`, `ip_address` | P2 |
| `PDFDownloadLog` | `partner_id`, `user_email`, `price_list_id`, `generated_at`, `download_url_expires_at` | P2 |
| `TrainingModule` | `title`, `description`, `video_url`, `duration_minutes`, `has_quiz`, `pass_threshold`, `is_certification`, `renewal_months` | P2 |
| `TrainingProgress` | See §11.2 schema | P2 |
| `PartnerNotification` | `partner_id`, `type`, `title`, `body`, `is_read`, `created_at`, `expires_at` | P2 |
| `OrderSummary` | `partner_id`, `erp_order_id`, `order_date`, `status`, `items` (JSON), `total_value`, `currency`, `tracking_url` | P2 (ERP sync) |

---

## 15. Frontend Components Inventory

| Component | File | Island Hydration | Phase |
|-----------|------|-----------------|-------|
| `<PartnerLoginForm />` | `src/islands/PartnerLoginForm.tsx` | `client:load` | P2 |
| `<PartnerMFASetup />` | `src/islands/PartnerMFASetup.tsx` | `client:load` | P2 |
| `<PartnerDashboard />` | `src/islands/PartnerDashboard.tsx` | Server Island | P2 |
| `<PartnerNotifications />` | `src/islands/PartnerNotifications.tsx` | Server Island | P2 |
| `<AssetLibrary />` | `src/islands/AssetLibrary.tsx` | `client:visible` | P2 |
| `<AssetDownloadButton />` | `src/islands/AssetDownloadButton.tsx` | `client:visible` | P2 |
| `<PriceListCard />` | `src/islands/PriceListCard.tsx` | `client:visible` | P2 |
| `<PriceListPDFDownload />` | `src/islands/PriceListPDFDownload.tsx` | `client:visible` | P2 |
| `<TrainingHub />` | `src/islands/TrainingHub.tsx` | `client:visible` | P2 |
| `<TrainingModulePlayer />` | `src/islands/TrainingModulePlayer.tsx` | `client:visible` | P2 |
| `<OrderHistory />` | `src/islands/OrderHistory.tsx` | Server Island | P2 |
| `<PartnerAccountSettings />` | `src/islands/PartnerAccountSettings.tsx` | `client:visible` | P2 |
| `<TeamManagement />` | `src/islands/TeamManagement.tsx` | `client:visible` | P2 |
| `<PartnerSupportTicket />` | `src/islands/PartnerSupportTicket.tsx` | `client:visible` | P2 |
| `<SessionTimeoutWarning />` | `src/islands/SessionTimeoutWarning.tsx` | `client:load` | P2 |

### 15.1 Session Timeout Warning

At 25 minutes of idle (per URD §34.1 / UR-7.1.4):

```
[Modal]:
"Your session will expire in 5 minutes due to inactivity.
[Stay Logged In] [Log Out Now]"
```

Clicking "Stay Logged In" calls `POST /api/auth/session/refresh` to reset the idle timer.

---

## 16. Error States & Edge Cases

| Scenario | System Behavior |
|----------|----------------|
| Login with unrecognized email | Generic error: "Email or password incorrect." (do not reveal if email exists) |
| Correct email + wrong password | Increment lockout counter; show attempt count after 3rd failure |
| Account locked | Show lockout message with unlock time; provide partner-support contact |
| MFA code expired (> 30 seconds old) | "Code expired. Please enter the current code from your authenticator app." |
| Session cookie missing / expired | Redirect to `/partner/login` with `?reason=session_expired` |
| Access denied (wrong tier) | RFC 9457 403 error with specific tier requirement; do not reveal what's behind the gate |
| PDF generation timeout (> 30 seconds) | Error message with option to retry; log failure in Sentry |
| Asset download link expired | Redirect to `/partner/assets/:id` to re-initiate download; show "Link expired" message |
| ERP sync missing order data | Show "Order history temporarily unavailable" with last sync timestamp |
| TOTP recovery code used | Confirm invalidation of used code; prompt to generate new set |
| Partner account deactivated | Clear all sessions; redirect to login; show "Your account has been deactivated. Contact partner-support@twinmos.com." |

---

## 17. Audit & Compliance

### 17.1 Audit Events Logged

All of the following events are logged in Better Auth session log + Strapi audit log:

| Event | Logged Fields |
|-------|--------------|
| Successful login | partner_id, user_email, ip, user_agent, timestamp, session_id |
| Failed login | user_email, ip, user_agent, timestamp, reason |
| MFA enrolled | partner_id, user_email, timestamp |
| Password changed | partner_id, user_email, timestamp, initiated_by |
| Session timeout | partner_id, session_id, timestamp |
| Session force-logout | partner_id, reason, timestamp |
| Asset downloaded | See §10.2 |
| Price list PDF generated + downloaded | See §9.3 |
| Team member invited | inviter_email, invitee_email, role, timestamp |
| Account deactivated | admin_email, partner_id, timestamp, reason |

### 17.2 Data Retention

| Log Type | Retention |
|----------|-----------|
| Session events | 12 months online; 24 months archive (Backblaze B2) |
| Asset download logs | 24 months |
| PDF download logs | 36 months (commercial evidence) |
| Failed login attempts | 90 days |

### 17.3 GDPR / UAE PDPL Compliance

- Partner portal users must accept updated Privacy Policy (including partner data processing) upon first login
- Data deletion requests handled via `privacy@twinmos.com` → Strapi soft-delete → Better Auth account deletion
- Partner data is classified as B2B business contact data; consent basis = contractual necessity (GDPR Art. 6(1)(b))
- Data transfer: sessions stored on Hetzner EU (Germany) → within EU EEA; compliant with GDPR Chapter V

---

## 18. Acceptance Criteria

### 18.1 Authentication

- [ ] Partner can log in with valid email + password
- [ ] Distributor account requires TOTP MFA; login fails without it
- [ ] Reseller account can optionally enroll MFA
- [ ] 5 failed logins trigger 30-minute lockout; correct message shown
- [ ] Password reset email delivers within 5 minutes
- [ ] Session expires after 8 hours absolute
- [ ] Idle warning appears at 25 minutes; "Stay Logged In" works
- [ ] Logout invalidates session; subsequent requests redirect to login

### 18.2 Access Control

- [ ] Registered partner cannot access price list; correct 403 shown
- [ ] Certified partner can access price list and download watermarked PDF
- [ ] Elite partner sees roadmap preview section; Certified does not
- [ ] Marketing sub-role cannot access price list; Procurement can
- [ ] Direct API call without valid session returns 401

### 18.3 Features

- [ ] Dashboard loads within 2 seconds (Server Island)
- [ ] Marketing asset download produces correct file with intact metadata
- [ ] Price list PDF contains visible watermark with partner name and timestamp
- [ ] Training module completion updates certification status in dashboard
- [ ] Order history shows correct orders for the partner's account only
- [ ] Notifications mark as read when viewed; unread count updates in header

### 18.4 Security

- [ ] OWASP ZAP scan on `/partner/*` routes shows no Critical or High findings
- [ ] Cloudflare Turnstile blocks automated login attempts (tested with headless browser)
- [ ] Session cookie cannot be read by JavaScript (HttpOnly verified)
- [ ] All portal API calls over HTTPS; no HTTP leakage
- [ ] Concurrent session test: logging in from Device B invalidates Device A session

---

*Partner Portal Functional Specification v1.0 | TwinMOS Technologies | Phase 2*  
*Synchronized with: Tech Stack v1.1 §9.3–9.4 · BRD v3.0 §17 · URD v3.0 UC-32*
