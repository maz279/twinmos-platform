# TwinMOS Website — CMS Admin Guide

**Document Reference:** TWN-OPS-2026-014  
**Version:** 1.0  
**Status:** FINAL  
**Date:** 1 May 2026  
**Prepared by:** TwinMOS Digital Transformation Team / Unisoft Engineering  
**Owner:** Unisoft Senior Developer / TwinMOS Marketing Director  
**Audience:** CMS Administrators, TwinMOS IT Staff, Marketing Leadership  
**Classification:** CONFIDENTIAL — Internal Use Only  
**Synchronized With:** BRD v3.0 §17, §21.2, Tech Stack v1.1 §5, §9.2, URD §17.2

---

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 1 May 2026 | TwinMOS Digital Transformation Team | Initial release |

---

## 1. Purpose

This guide provides comprehensive administration instructions for the TwinMOS website's Strapi v5 Content Management System. It covers user management, role configuration, system settings, plugin management, audit log review, and security administration.

---

## 2. Accessing the CMS

### 2.1 CMS Admin URL

| Environment | URL |
|-------------|-----|
| Production | `https://admin.twinmos.com` |
| Staging | `https://admin.staging.twinmos.com` |
| Development | `https://admin.dev.twinmos.com` |

### 2.2 Login Requirements

- Valid CMS account (created by Admin or Super Admin only per BR-10.1)
- MFA (TOTP) required for Admin and Super Admin roles (BRD §21.2)
- Password policy: minimum 12 characters, mixed case, number, symbol
- Account lockout: 5 failed attempts = 30-minute cooldown
- Session timeout: 30 minutes idle; 8 hours absolute

### 2.3 First Login

1. Navigate to `https://admin.twinmos.com`
2. Enter email and temporary password (provided by Admin)
3. Enroll MFA (scan QR code with authenticator app: Google Authenticator, Authy, or Microsoft Authenticator)
4. Save recovery codes in a secure location
5. Change temporary password to a strong personal password

---

## 3. User Roles & Permissions

### 3.1 Role Definitions (BRD §21.2, Tech Stack §5.3)

| Role | Permissions | MFA Required | Typical Users |
|------|-------------|--------------|---------------|
| **Super Admin** | Full system access: create users, edit roles, modify schema, all content | Yes | Unisoft Team Lead, TwinMOS IT Lead |
| **Admin** | Full content + product + form access; user management; cannot modify schema | Yes | TwinMOS Marketing Director, Senior Content Manager |
| **Editor** | Content + product editing; can publish; cannot modify users or schema | Recommended | Content managers, product marketing |
| **Author** | Create and edit own content; cannot publish without Editor approval | No | Junior content writers, interns |
| **Viewer** | Read-only access to all content | No | Executives, auditors, legal review |
| **Partner Marketing** (P2) | Read-only access to partner asset library | Yes | Distributor marketing contacts |
| **Partner Procurement** (P2) | Access to gated price-list (watermarked PDF) | Yes | Distributor procurement contacts |

### 3.2 Creating a New User (Admin/Super Admin Only)

1. Navigate to **Settings → Users & Permissions Plugin → Users**
2. Click **"Add New User"**
3. Enter:
   - Email address (corporate email required)
   - First Name, Last Name
   - Role (select from dropdown)
   - Locale preference
4. Click **"Save"**
5. System sends invitation email with temporary password
6. New user must complete MFA enrollment on first login (if role requires it)

### 3.3 Modifying User Permissions

1. Navigate to **Settings → Users & Permissions Plugin → Roles**
2. Select the role to modify
3. Adjust permissions per content type:
   - **Create** — can add new entries
   - **Read** — can view entries
   - **Update** — can edit existing entries
   - **Delete** — can remove entries (triggers soft-delete per BR-10.4)
   - **Publish** — can change draft → published
4. Click **"Save"**

### 3.4 Disabling / Removing Users

1. Navigate to **Settings → Users & Permissions Plugin → Users**
2. Find the user and click **"Edit"**
3. To disable: toggle **"Active"** to OFF
4. To delete: click **"Delete"** (this performs a soft-delete; user can be restored within 30 days)
5. All user changes are logged in the audit trail

---

## 4. Content Type Overview

### 4.1 Core Content Types

| Content Type | Description | Owner | Phase |
|--------------|-------------|-------|-------|
| **Product** | SKU details, specifications, images, pricing | Product Manager | P1 |
| **Category** | Product categories and subcategories | Product Manager | P1 |
| **BrandLine** | TwinMOS brand lines (VOLTX, TornadoX7, CoreX Pro, etc.) | Marketing | P1 |
| **NewsArticle** | News, press releases, blog posts | Marketing | P1 |
| **Event** | Trade shows, webinars, product launches | Marketing | P1 |
| **KBArticle** | Knowledge base articles and FAQs | Support | P1 |
| **Solution** | Industry vertical solutions | Marketing | P1 |
| **CaseStudy** | Customer success stories | Marketing | P1 |
| **Retailer** | Where-to-buy retailer/distributor data | Sales | P1 |
| **Distributor** | Extended retailer with partner tier info | Sales | P2 |
| **Inquiry / FormSubmission** | Form submissions from website | Sales/Support | P1 |
| **WarrantyRegistration** | Product warranty registrations | Support | P1 |
| **RMARequest** | Return merchandise authorization | Support | P2 |
| **JobPosting** | Career openings | HR | P1 |
| **NewsletterSubscriber** | Email subscribers | Marketing | P1 |
| **Promotion** | Campaigns and offers | Marketing | P1 |
| **PartnerAccount** (P2) | Partner portal user accounts | Sales | P2 |
| **PriceList** (P2) | Distributor price lists | Sales | P2 |
| **MarketingAsset** (P2) | Co-branded materials for partners | Marketing | P2 |
| **ValidSerial** (P2) | Authentic serial numbers | Operations | P2 |
| **CounterfeitReport** (P2) | Counterfeit product reports | Legal | P2 |
| **BuildSubmission** (P2) | Gaming build gallery submissions | Marketing | P2 |
| **Award** | Industry awards and certifications | Marketing | P1 |
| **Certification** | Compliance certifications | Compliance | P1 |
| **CookieCategory** | CMP cookie categories | Legal/Tech | P1 |
| **DataDeletionRequest** | GDPR/DSAR requests | Legal | P1 |

### 4.2 Content Type Fields

Each content type has standardized fields:

- **Title / Name** — display title
- **Slug** — URL-friendly identifier (auto-generated from title)
- **Status** — draft / published / archived
- **Locale** — language variant (EN, AR, BN, HI, RU, ZH-CN, FR)
- **SEO Title / Description** — meta tags
- **Created / Updated timestamps** — automatic
- **Author / Last Editor** — automatic (from CMS user)

---

## 5. System Settings

### 5.1 Internationalization (i18n)

1. Navigate to **Settings → Internationalization**
2. Active locales:
   - English (EN) — default, Phase 1
   - Arabic (AR) — RTL, Phase 2
   - Bengali (BN) — Phase 2
   - Hindi (HI) — Phase 2
   - Russian (RU) — Phase 3
   - Chinese Simplified (ZH-CN) — Phase 3
   - French (FR) — Phase 3
3. To add a locale (Phase 4+): click **"Add Locale"**, select language, set as default if needed

### 5.2 Media Library Settings

1. Navigate to **Settings → Media Library**
2. Provider: AWS S3-compatible (Backblaze B2)
3. Maximum upload size: 10 MB
4. Allowed formats: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.pdf`, `.doc`, `.docx`
5. Image transformations: handled by ImgProxy (auto WebP/AVIF)

### 5.3 Email Configuration

1. Navigate to **Settings → Email Plugin**
2. Provider: Resend
3. Default sender: `noreply@twinmos.com`
4. Test email delivery via **"Send Test Email"** button

### 5.4 API Tokens

1. Navigate to **Settings → API Tokens**
2. Create read-only tokens for external integrations
3. Rotate tokens quarterly (security best practice)
4. Revoke compromised tokens immediately

---

## 6. Plugin Management

### 6.1 Installed Plugins

| Plugin | Purpose | Phase |
|--------|---------|-------|
| Users & Permissions | Auth, roles, JWT | P1 |
| i18n | Multi-language content | P1 |
| SEO | Meta title/description/OG per entry | P1 |
| Color Picker | Design token management | P1 |
| Audit Log | Action tracking | P1 |
| Config Sync | Environment config migration | P1 |
| Publisher | Schedule publish/unpublish | P1 |
| MeiliSearch | Search index management | P1 |
| Import Export Entries | Bulk data operations | P1 |
| Redirect | 301/302 URL management | P1 |
| Sitemap | XML sitemap generation | P1 |
| GraphQL | Optional API endpoint | P2 |
| Protected Populate | Field-level RBAC | P2 |
| Comments | User comments / build gallery | P2 |

### 6.2 Plugin Updates

1. Review plugin changelog for breaking changes
2. Test update on staging environment first
3. Update via npm: `npm install [plugin]@latest`
4. Restart Strapi
5. Verify functionality
6. Document update in change log

---

## 7. Audit Log Review

### 7.1 Accessing Audit Logs

1. Navigate to **Plugins → Audit Log** (or equivalent menu)
2. Filter by:
   - Date range
   - User
   - Action type (create, update, delete, publish, login, etc.)
   - Content type
   - Resource ID

### 7.2 Audit Log Schema (Tech Stack §5.7)

Each log entry contains:
- Timestamp (ISO8601)
- User ID and email
- Action (enum: admin_login, content_create, content_update, content_delete, content_publish, role_change, user_create, etc.)
- Resource type and ID
- Before/after diff (for content updates)
- IP address and user agent
- Request ID (for tracing)

### 7.3 Retention

- Online retention: 12 months
- Archived retention: 24 months in Backblaze B2 (compliance evidence)
- Export: CSV or JSON format available

### 7.4 Suspicious Activity Review

Weekly review checklist:
- [ ] Failed login attempts >5 per user
- [ ] Role changes (who changed what, when)
- [ ] Bulk deletes or publishes
- [ ] User creations outside normal process
- [ ] API token creations/rotations
- [ ] Access from unusual IP addresses

---

## 8. Security Administration

### 8.1 MFA Management

1. Navigate to **Settings → Users & Permissions Plugin → Users**
2. Find user and click **"Edit"**
3. Under **"Security"**, view MFA status
4. To reset MFA (if user lost device): click **"Reset MFA"** → user must re-enroll on next login
5. Recovery codes can be regenerated if lost

### 8.2 Password Policy Enforcement

- Minimum length: 12 characters
- Complexity: uppercase, lowercase, number, symbol
- Rotation: 90 days for Admin/Super Admin roles
- History: prevent last 5 passwords

### 8.3 Session Management

- Idle timeout: 30 minutes (URD §34.1)
- Absolute timeout: 8 hours
- 25-minute countdown warning before idle expiry
- Users can view active sessions and log out remotely

### 8.4 API Security

- Rate limiting: 100 req/min public; 1,000 req/min authenticated (BRD §26.3)
- JWT access token expiry: 1 hour
- Refresh token rotation: single-use; new refresh on each access-token refresh
- Token revocation: on logout, password change, role change, suspected compromise

---

## 9. Backup & Maintenance

### 9.1 Scheduled Backups

| Backup Type | Frequency | Retention | Owner |
|-------------|-----------|-----------|-------|
| PostgreSQL pg_dump | Daily 02:00 UTC | 30 days daily; 12 months monthly | Coolify auto |
| WAL streaming | Every 15 min | 7 days | Coolify auto |
| Strapi uploads | On-write mirror | Versioned | Backblaze B2 |
| CMS config | Weekly | 90 days | Manual export |

### 9.2 Manual Backup

1. Navigate to **Settings → Backup** (or use Coolify console)
2. Click **"Create Backup"**
3. Verify backup completion
4. Download backup file for local storage (optional)

---

## 10. Document Sign-Off

| Role | Name | Sign-Off | Date |
|------|------|----------|------|
| Project Sponsor (Chairman) | Mohd Mazharul Islam | _______________ | _________ |
| Operational Sponsor (GM Dubai) | Robiul Islam | _______________ | _________ |
| Marketing Director | (TBC) | _______________ | _________ |
| IT/Technical Lead | (TBC) | _______________ | _________ |
| Unisoft Team Lead | (TBC) | _______________ | _________ |

---

**Document Version:** 1.0  
**Issued:** 1 May 2026  
**Next Review:** Upon Phase 1 launch (Month 5) and quarterly thereafter  
**Canonical Location:** `J - Operations, Maintenance and End-User Guides/J.2 - CMS and Content Operations/TwinMOSWebsiteCMSAdminGuide.md`
