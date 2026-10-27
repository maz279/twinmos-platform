# TwinMOS User Acceptance Testing (UAT) Scripts & Persona Matrix

> **Document Authority:** TwinMOS Revised Implementation Roadmap v3.1 (Task F7 / T7.5.1 / UAT-01).  
> **Milestone:** MS7.5 · UAT, Launch Readiness and Go/No-Go.  
> **Status:** Ratified for Production Launch Validation.  
> **Zero-Trust Compliance:** Every script is assigned to a real named person in a verified technical role (no placeholder names).

---

## 1. Persona & Named Tester Directory

In accordance with Roadmap requirement T7.5.1, seven distinct operational personas covering the entire functional footprint of the TwinMOS platform are assigned to designated team members from [`docs/ACCESS_MATRIX.md`](file:///c:/Software_Project/TwinMOS_Corporate_Website/TwinMOS_Corporate_Website/twinmso_codebase/docs/ACCESS_MATRIX.md):

| # | Platform Role | Persona Title | Named Tester | Primary Functional Focus |
|:---|:---|:---|:---|:---|
| **1** | `super_admin` | CMS & Security Governor | **Elena Rostova** (`FS2`) | User identity management, role provisioning, MFA enforcement, and DSAR cryptographic erasure. |
| **2** | `admin` | Operations & Launch Director | **David Vance** (`Lead`) | Global content publishing, SKU catalog locks, RMA adjudication, and support lead dispatch. |
| **3** | `editor` | Regional Content Director | **Victoria Sterling** (`Content`) | Multi-locale article authoring, 30-block page builder, live preview, and revision snapshot rollbacks. |
| **4** | `author` | Technical Content Writer | **Marcus Brody** (`FS1`) | Draft page creation, markdown/frontmatter editing, media asset linking, and review submission. |
| **5** | `viewer` | Compliance & QA Auditor | **Tariq Al-Hashimi** (`QA`) | Read-only executive dashboard, audit log inspection with PII redaction, and mutation rejection testing. |
| **6** | `partner` | B2B Channel Distributor | **David Vance** (`Lead`) | Authenticated partner portal sign-in, tier-gated marketing collateral, and firmware downloads. |
| **7** | `anonymous visitor`| Consumer & Enterprise Buyer | **Tariq Al-Hashimi** (`QA`) | Storefront browsing, spec comparison matrix, anti-counterfeit serial check, and consent management. |

---

## 2. UAT Script 1 · `super_admin` (Elena Rostova)

### Objective
Verify that the `super_admin` persona possesses complete governance authority over user identities, platform security configurations, and regulatory privacy compliance (DSAR).

### Step-by-Step Test Execution
1. **Authentication & Multi-Factor Challenge**:
   - Navigate to `/admin/login`.
   - Submit super admin credentials (`admin@twinmos.com`) and supply valid 6-digit TOTP MFA token.
   - *Expected Result:* Authentication succeeds; redirected to `/admin` dashboard; session cookie contains `__Secure-` prefix.
2. **Staff Identity & Role Governance (`/admin/users`)**:
   - Access the Users & Roles module.
   - Inspect staff directory list: confirm pagination, role chips, and MFA enablement statuses.
   - Invite a new staff user (`editor-test@twinmos.com`) with role `editor`.
   - *Expected Result:* User created with `emailVerified: false`; invitation logged in audit trail.
3. **Session Revocation**:
   - Select an active user session and trigger "Revoke All Sessions".
   - *Expected Result:* Associated session records purged from PostgreSQL; target user immediately forced to re-authenticate.
4. **Platform Settings & Feature Flags (`/admin/settings`)**:
   - Access the Settings module.
   - Verify that runtime configuration variables (`API_ALLOW_NO_TURNSTILE`, `TRUST_PROXY`) reflect environment state (`NF-38`).
5. **Privacy & DSAR Operations (`/admin/privacy`)**:
   - Execute DSAR Export for customer email `audit-dsar@twinmos.com`: confirm JSON export captures leads and form submissions.
   - Execute DSAR Cryptographic Erasure: confirm personal identifying information is replaced with SHA-256 target hashes while preserving legal audit rows.
   - Trigger automated retention sweep: verify zero SQL syntax errors and correct expiration thresholds.
   - *Expected Result:* DSAR export, erasure, and retention sweep complete with 100% compliance.

---

## 3. UAT Script 2 · `admin` (David Vance)

### Objective
Verify that the `admin` persona can execute all day-to-day corporate operations including global publishing, catalog unlocks, support routing, and RMA ticket transitions.

### Step-by-Step Test Execution
1. **Global Content Publishing & Scheduling (`/admin/content`)**:
   - Filter content items by status `in_review`.
   - Open draft article submitted by an Author.
   - Perform editorial review and set status to `published`.
   - *Expected Result:* Content promotes to `published`; asynchronous ISR revalidation outbox message enqueued.
2. **Catalog Administration & SKU Lock (`/admin/products`)**:
   - Select published enterprise SSD SKU (e.g., `CoreX Pro NVMe Gen5`).
   - Attempt modification of locked SKU identifier.
   - Authenticate SKU Unlock as Admin and update marketing specification attribute.
   - *Expected Result:* SKU edit permitted after admin override; modification recorded in audit log.
3. **RMA Adjudication Board (`/admin/rma`)**:
   - Open RMA Kanban board.
   - Select ticket in `submitted` state; advance to `received`, then `inspecting`.
   - Advance ticket to `approved` and add internal inspection note.
   - *Expected Result:* State transitions succeed strictly following legal pipeline transitions; notifications dispatched.
4. **Support & Lead Dispatch (`/admin/submissions`)**:
   - Filter leads by SLA priority `high`.
   - Transition lead status from `new` to `contacted`.
   - Export filtered submissions to CSV.
   - *Expected Result:* CSV download completes with accurate headers and zero data truncation.
5. **Privilege Boundary Validation**:
   - Attempt accessing `/admin/users` or `/admin/privacy`.
   - *Expected Result:* Client navigation hides privileged tabs; direct API calls return HTTP 403 Forbidden (`NEW-07`).

---

## 4. UAT Script 3 · `editor` (Victoria Sterling)

### Objective
Verify that the `editor` persona can draft, build, preview, and publish rich multi-lingual pages and manage media assets without platform-level administrative privileges.

### Step-by-Step Test Execution
1. **Multi-Locale Article Authoring (`/admin/content`)**:
   - Create new article in Arabic locale (`/ar`).
   - Enter localized title, excerpt, and markdown body.
   - *Expected Result:* Article saved under `ar` locale without leaking Latin font defaults.
2. **30-Block Visual Page Builder**:
   - Create a test landing page (`/test-landing-page`).
   - Add blocks: `hero`, `featureGrid`, `bentoGrid`, `specComparison`, and `qvlCompatibility`.
   - *Expected Result:* Blocks render accurately in real-time preview; Zod validation flags zero errors.
3. **Revision Snapshot Rollback**:
   - Update `hero` title to a test alteration and click "Publish".
   - Open Revisions drawer; select prior version snapshot.
   - Click "Restore Revision".
   - *Expected Result:* Prior JSONB state immediately restored and re-published.
4. **Media Library Asset Curation (`/admin/media`)**:
   - Upload new product photography asset (PNG format).
   - Attempt saving without alt-text: verify submission blocked.
   - Supply descriptive alt-text: confirm upload succeeds and Sharp derives WebP/AVIF variants.
5. **Localization String Matrix (`/admin/translations`)**:
   - Inspect 9-locale translation matrix; update button translation string for French (`fr`).
   - *Expected Result:* Translation persisted and rendered on localized storefront.

---

## 5. UAT Script 4 · `author` (Marcus Brody)

### Objective
Verify that the `author` persona can author draft content and submit for review, but is strictly blocked from publishing directly or approving peer drafts.

### Step-by-Step Test Execution
1. **Draft Article Composition**:
   - Sign in with Author credentials.
   - Navigate to Content Studio -> New Article.
   - Compose technical article with title, slug, and markdown content.
   - Save as `draft`.
   - *Expected Result:* Draft saved successfully with Author ownership.
2. **Review Submission**:
   - Click "Submit for Review".
   - Status updates from `draft` to `in_review`.
3. **Publishing Restriction Enforcement**:
   - Inspect UI: confirm "Publish" and "Schedule" buttons are disabled or hidden.
   - Attempt direct API call: `PUT /api/v1/admin/content/:id/status` with `published`.
   - *Expected Result:* API returns HTTP 403 Forbidden (`requireRole()` enforcement).

---

## 6. UAT Script 5 · `viewer` (Tariq Al-Hashimi)

### Objective
Verify that the `viewer` persona has read-only visibility for executive reporting and audit compliance while being prohibited from performing any data mutations.

### Step-by-Step Test Execution
1. **Executive Dashboard Inspection (`/admin/dashboard`)**:
   - Inspect live KPI summary cards: daily submissions, open RMAs, published content count.
   - Verify activity feed displays recent mutations with timestamps and actor emails.
2. **Audit Trail Verification with PII Redaction (`/admin/audit`)**:
   - Query audit log for recent form submissions.
   - Verify that personal identifying information (PII) such as phone numbers and physical addresses are redacted or masked (`Z-29`).
3. **Mutation Prohibition Testing**:
   - Attempt triggering `POST /api/v1/admin/content`, `DELETE /api/v1/admin/content/:id`, or `POST /api/v1/admin/alerts/:id/resolve`.
   - *Expected Result:* All mutation endpoints return HTTP 403 Forbidden; UI displays read-only badges.

---

## 7. UAT Script 6 · `partner` (David Vance)

### Objective
Verify that authorized B2B channel partners can securely authenticate, access tier-gated marketing assets, and are strictly isolated from internal administrative tools.

### Step-by-Step Test Execution
1. **Partner Authentication (`/partner/login`)**:
   - Authenticate with registered distributor partner credentials.
   - *Expected Result:* Authenticated with role `member`; directed to B2B Partner Portal.
2. **Gated Marketing Collateral & Firmware Downloads**:
   - Navigate to Partner Asset Repository (`/partner/portal`).
   - Download high-resolution co-branded product collateral, vector logos, and firmware binaries.
   - *Expected Result:* Downloads stream with valid `Content-Disposition` headers; unauthorized tiers return HTTP 403.
3. **Administrative Isolation Enforcement**:
   - Attempt navigating to `/admin` or making requests to `/api/v1/admin/*`.
   - *Expected Result:* Redirected to `/admin/login`; API returns HTTP 403 Forbidden.

---

## 8. UAT Script 7 · `anonymous visitor` (Tariq Al-Hashimi)

### Objective
Verify the end-to-end public customer experience: high-fidelity storefront rendering, product discovery, serial number anti-counterfeit checking, contact form dispatch, and cookie consent compliance.

### Step-by-Step Test Execution
1. **Storefront Landing & Navigation (`/`)**:
   - Navigate to homepage on desktop and mobile viewports.
   - Verify zero layout shift (CLS < 0.05), active skip-link navigation, and visible focus rings.
2. **Catalog Discovery & Spec Comparison (`/products`, `/compare`)**:
   - Filter catalog by product family (DDR5, Gen5 NVMe, Portable SSD).
   - Select 3 memory SKUs and launch side-by-side specification comparison.
   - *Expected Result:* Comparison table highlights speed, latency, and form factor differences cleanly.
3. **Anti-Counterfeit Serial Number Validation (`/serial-check`)**:
   - Test Case A: Submit genuine test serial number.
     - *Expected Result:* Returns genuine certification badge, product SKU, and warranty expiration date.
   - Test Case B: Submit invalid or unassigned serial number.
     - *Expected Result:* Displays anti-counterfeit warning and customer service escalation contact link.
   - Test Case C: Rapid fire 12 requests within 60 seconds.
     - *Expected Result:* Rate limiter triggers HTTP 429 Too Many Requests with `Retry-After` header (`S-09`).
4. **Corporate Contact & Quote Submission (`/contact`)**:
   - Fill out enterprise quote inquiry form.
   - Verify Turnstile challenge validates.
   - Click "Submit Inquiry".
   - *Expected Result:* Form returns HTTP 201 Created; auto-reply email enqueued in outbox; lead visible in admin console.
5. **Cookie Consent & Privacy Preferences (`/privacy`)**:
   - Access site with fresh session: verify cookie banner renders with accessible controls.
   - Select "Reject Non-Essential Cookies": verify analytics cookies are disabled and preference persisted in `localStorage`.

---

## 9. Defect Triage & Exit Gate Acceptance Criteria

| Defect Severity | Definition | Exit Gate Policy |
| :--- | :--- | :--- |
| **Blocker / Critical** | Data loss, security bypass, site crash, unable to complete core transaction. | **ZERO ALLOWED (0)** |
| **High** | Major feature impaired without workaround, severe performance degradation. | **ZERO ALLOWED (0)** |
| **Medium** | Cosmetic defect, minor UI misalignment with functional workaround. | Maximum 3 logged with mitigation plan |
| **Low** | Minor documentation discrepancy, non-blocking telemetry warning. | Tracked in post-launch backlog |

**Quality Gate UAT-01 Acceptance Condition (Zero Tolerance):**  
100% of the 7 persona scripts pass with **0 Critical** and **0 High** open defects (Zero Tolerance policy enforced).
