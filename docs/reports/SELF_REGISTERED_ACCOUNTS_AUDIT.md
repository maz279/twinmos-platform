# Self-Registered Accounts Audit Report

**Phase:** Phase 02 · Stop-ship close-out: accounts, security, edge, data, evidence  
**Milestone:** MS2.4 · Staff sign-in and account security  
**Task ID:** T2.4.3 (Source A1, Closes Z-03, Z-30)  
**Date:** 2026-10-17  
**Auditor:** TwinMOS Platform Engineering & Security Ops  
**Status:** COMPLETE / CLOSED

---

## 1. Executive Summary

As part of Milestone MS2.4 (Staff sign-in and account security), an audit of all user accounts within the TwinMOS database was conducted to detect any uninvited, self-registered, or legacy unauthorized accounts. Prior to MS2.4, self-registration via the Better Auth `/api/v1/auth/sign-up/email` route was not fully restricted in non-production tiers, creating potential risk if exposed.

This audit:
1. Enumerates all user accounts present across active database instances.
2. Cross-references all accounts against authorized administrative bootstrap credentials and invited partner organizations.
3. Formally records the lockdown status of public self-registration (`disableSignUp: true`, `disabledPaths: ['/sign-up/email']`).
4. Establishes the remediation runbook for removing any stray non-whitelisted accounts prior to production deployment.

---

## 2. Methodology & Inspection Criteria

Each user account in the PostgreSQL `user` table is audited against the following compliance criteria:
- **Authorized Identity:** Matches known authorized personnel (Seed Administrator, Verified QA Personas, Whitelisted Partner Orgs).
- **Invitation Provenance:** User was provisioned via either the Super Admin staff invite route (`POST /api/v1/admin/users/invite`) or Partner Admin route (`POST /api/v1/admin/partner-orgs/:id/members`), and carries an audit trail entry in `audit_log`.
- **Credential Hygiene:** Invited accounts must have `must_change_password: true` until first sign-in rotation, with no default passwords retained.
- **Verification Status:** Unverified self-registrations cannot authenticate (`requireEmailVerification: true` in production).

---

## 3. Account Inventory & Classification

| Account ID | Email Address | Assigned Role | Verification Status | Provenance / Purpose | Audit Finding |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `usr-seed-superadmin` | `admin@twinmos.dev` | `super_admin` | Verified | Seed Super Administrator (controlled via `SEED_ADMIN_PASSWORD` in vault). | **AUTHORIZED** (Retained for deployment bootstrap) |
| `usr-qa-editor` | `editor@twinmos.dev` | `editor` | Verified | Authorized Staff Content Editor (E2E regression persona). | **AUTHORIZED** (Dev/Test fixture) |
| `usr-qa-author` | `author@twinmos.dev` | `author` | Verified | Authorized Staff Author (E2E regression persona). | **AUTHORIZED** (Dev/Test fixture) |
| `usr-qa-viewer` | `viewer@twinmos.dev` | `viewer` | Verified | Authorized Staff Viewer (E2E regression persona). | **AUTHORIZED** (Dev/Test fixture) |
| `usr-partner-lead` | `partner@distributor-me.com` | `member` | Pending Verification | Invited B2B Distribution Partner Member. | **AUTHORIZED** (Partner portal user) |

### 3.1 Non-Whitelisted Account Findings
- **Self-Registered Accounts Found:** 0 unauthorized self-registered accounts detected.
- **Dangling / Unassigned Accounts:** 0 orphan user rows found in the database.
- **Legacy Test Accounts:** Ephemeral test runs generate isolated temporary PGlite instances (`/tmp/twinmos-*`) that are purged upon test suite termination (`afterAll`).

---

## 4. Enforcement & Prevention Mechanisms (MS2.4 Hardening)

To guarantee that no self-registered accounts can ever be created in production environments:
1. **Disabled Public Sign-Up:** Better Auth is explicitly configured with `emailAndPassword.disableSignUp: true` and `disabledPaths: ['/sign-up/email']` in `apps/api/src/auth.ts`.
2. **Boot Guard Verification:** Production boot fails if dev auto-login or registration bypass switches are detected.
3. **Email Verification Enforcement:** Unverified accounts receive HTTP 403 `EMAIL_NOT_VERIFIED` upon sign-in attempt.
4. **Staff Invite Only:** All new accounts must be explicitly created by an authenticated `super_admin` via `POST /api/v1/admin/users/invite` with cryptographically secure temporary passwords and mandatory password rotation on first login.

---

## 5. Ongoing Account Review Runbook

1. **Pre-Deployment Query:** Execute the IAM audit query before production release:
   ```sql
   SELECT id, email, role, email_verified, must_change_password, created_at
   FROM "user"
   WHERE role = 'super_admin' OR email_verified = true
   ORDER BY created_at ASC;
   ```
2. **Review Cadence:** Run bi-weekly access reviews using the IAM analytics dashboard at `/admin/users/analytics` to monitor role distribution, MFA coverage, and active sessions.
3. **Immediate Revocation:** Any unrecognized account can be immediately suspended via `POST /api/v1/admin/users/:id/ban` and have all active sessions revoked via `POST /api/v1/admin/users/:id/revoke-sessions`.
