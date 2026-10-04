# TwinMOS Corporate Website — RMA Workflow Specification

**Document Reference:** TWN-P2-RMA-2027-001  
**Document Version:** 1.0  
**Status:** APPROVED — For development implementation  
**Phase:** Phase 2 — Localization & Partner Enablement  
**Feature:** RMA (Return Merchandise Authorization) Workflow  
**Planned Delivery:** Phase 2, Sprint 7 (March 2027)  
**Prepared by:** TwinMOS Digital Transformation Team / Unisoft Engineering  
**Owner:** Support Operations Lead + IT Technical Lead  
**Audience:** Unisoft Dev B (Backend), Dev A (Frontend), TwinMOS Support Ops, Legal  
**Classification:** CONFIDENTIAL — TwinMOS + Unisoft Internal Use  
**Source References:**  
- Tech Stack v1.1 §10.4 (RMA Workflow outline), §10.1 (Form inventory), §5.4 (Lifecycle hooks)  
- BRD v3.0 §17 (Support & RMA Epic), §21 (Security), §26.3 (API)  
- URD v3.0 UC-28 (Submit RMA Claim), UC-29 (Check RMA Status)  
- Content Map: `content/website-content/07-support/` (RMA hub, submit, status, policy)

---

## Table of Contents

1. [Overview & Business Context](#1-overview--business-context)
2. [RMA State Machine](#2-rma-state-machine)
3. [State Definitions & Transition Rules](#3-state-definitions--transition-rules)
4. [RMA Reference Number Format](#4-rma-reference-number-format)
5. [Customer-Facing RMA Submission Form](#5-customer-facing-rma-submission-form)
6. [Customer RMA Status Page](#6-customer-rma-status-page)
7. [Internal Admin Workflow (Strapi)](#7-internal-admin-workflow-strapi)
8. [Email Notification Templates](#8-email-notification-templates)
9. [Slack Notifications](#9-slack-notifications)
10. [Strapi Data Model](#10-strapi-data-model)
11. [API Endpoints](#11-api-endpoints)
12. [SLA Targets](#12-sla-targets)
13. [Edge Cases & Business Rules](#13-edge-cases--business-rules)
14. [Reporting & Analytics](#14-reporting--analytics)
15. [Acceptance Criteria](#15-acceptance-criteria)

---

## 1. Overview & Business Context

### 1.1 Purpose

The TwinMOS RMA Workflow provides a **structured, trackable process** for customers to return defective products and receive replacements or refunds. It replaces the current ad hoc email-based return process with:

- A **structured submission form** on the website
- A **7-state machine** implemented in Strapi that enforces process discipline
- **Automated email notifications** at every state transition
- **Customer self-service status tracking** via the website
- **Support team admin tools** in Strapi for managing the full pipeline
- **Audit trail** for every state change (GDPR + internal accountability)

### 1.2 Scope

This specification covers:
- End-user consumer RMA (warranty returns, DOA products)
- Distributor bulk RMA (defective units from distributor stock)

It does **not** cover:
- In-warranty advance replacement (Phase 3 commercial capability)
- Cross-border return logistics (handled by regional support teams, linked from RMA instructions)
- Fraudulent return detection (flagged manually by support team; no automated system in Phase 2)

### 1.3 Key Performance Indicators

| Metric | Target |
|--------|--------|
| RMA submission → first acknowledgment | ≤ 24 hours (BRD §18.1 support SLA) |
| Approved → Replacement Shipped | ≤ 5 business days |
| Time to Closed (full cycle) | ≤ 14 business days |
| Online RMA submission rate (vs email) | ≥ 50% by end of Phase 2 |
| Customer satisfaction with RMA process | ≥ 4.0/5.0 (Chatwoot CSAT) |

---

## 2. RMA State Machine

### 2.1 State Diagram

```
                          ┌─────────────────────┐
                          │      SUBMITTED       │  ← Customer submits RMA form
                          └──────────┬──────────┘
                                     │
                          ┌──────────▼──────────┐
                          │   UNDER REVIEW       │  ← Support team opens ticket
                          └──┬───────────────┬──┘
                             │               │
              ┌──────────────▼──┐    ┌───────▼─────────────┐
              │    APPROVED     │    │      REJECTED        │  ← End state
              └───────┬─────────┘    └──────────────────────┘
                      │
              ┌───────▼─────────┐
              │ SHIP TO TWINMOS │  ← Customer ships product
              └───────┬─────────┘
                      │
              ┌───────▼─────────┐
              │    RECEIVED      │  ← TwinMOS receives product
              └───────┬─────────┘
                      │
              ┌───────▼─────────┐
              │    TESTING       │  ← Engineering / QA validates defect
              └──┬──────────────┘
                 │
     ┌───────────▼──────────┐
     │ REPLACEMENT SHIPPED  │  ← Replacement or refund dispatched
     └───────────┬──────────┘
                 │
         ┌───────▼────────┐
         │     CLOSED     │  ← End state; customer confirms receipt
         └────────────────┘
```

### 2.2 State Summary

| # | State | Owner | Customer-Visible Label |
|---|-------|-------|----------------------|
| 1 | `SUBMITTED` | System (automatic) | "RMA Submitted — Awaiting Review" |
| 2 | `UNDER_REVIEW` | Support Team | "Under Review" |
| 3 | `APPROVED` | Support Team | "RMA Approved — Please Ship Product" |
| 4 | `REJECTED` | Support Team | "RMA Not Approved" |
| 5 | `SHIP_TO_TWINMOS` | Support Team (manual after physical receipt confirmed) | "Awaiting Your Shipment" |
| 6 | `RECEIVED` | Support Team | "Product Received — Testing in Progress" |
| 7 | `TESTING` | Support / Engineering | "Quality Testing in Progress" |
| 8 | `REPLACEMENT_SHIPPED` | Logistics / Support | "Replacement Dispatched" |
| 9 | `CLOSED` | Automated (on confirmation) or manual | "RMA Closed — Completed" |

---

## 3. State Definitions & Transition Rules

### 3.1 SUBMITTED

**Trigger:** Customer submits RMA form via `/support/rma/submit`

**Entry actions:**
- Generate unique RMA reference number (see §4)
- Store `RMARequest` record in Strapi with `status = SUBMITTED`
- Send auto-acknowledgment email to customer (template RMA-01; see §8)
- Send Slack notification to `#support-rma` (see §9)
- Add to support queue in Strapi admin

**Allowed next states:** `UNDER_REVIEW` (any support agent opens the ticket)

**Time limit:** Support must move to `UNDER_REVIEW` within 24 hours (SLA; automated alert if not)

### 3.2 UNDER_REVIEW

**Trigger:** Support agent opens the RMA request in Strapi admin

**Entry actions:**
- Assign support agent (`assigned_to` field set)
- Send notification email to customer (template RMA-02)
- Send Slack update to `#support-rma`

**Validation performed by support team:**
- [ ] Product is within warranty period (verify purchase date + warranty lookup)
- [ ] Serial number exists in `valid_serials` collection
- [ ] Defect description is plausible and not user damage
- [ ] Customer's region has TwinMOS warranty coverage
- [ ] Distributor purchase (if applicable) validated against distributor records

**Allowed next states:** 
- `APPROVED` — defect confirmed, warranty valid
- `REJECTED` — outside warranty, user damage, missing proof of purchase, no distribution coverage

**Time limit:** Decision within 48 hours of moving to `UNDER_REVIEW` (SLA)

### 3.3 APPROVED

**Trigger:** Support agent selects "Approve" in Strapi admin, fills in:
- Shipping instructions (return address, courier recommendation, reference label)
- RMA approval notes (internal)
- Shipping deadline for customer (default: 14 days from approval date)

**Entry actions:**
- Send approval email to customer (template RMA-03) with shipping instructions and PDF shipping label link
- Send Slack update to `#support-rma`

**Allowed next states:** `SHIP_TO_TWINMOS` (support manually advances when shipping tracking received from customer)

**Business rule:** If customer does not ship within 14 days, send reminder email (automated cron). If no shipping after 21 days, move to `REJECTED` with reason "Customer did not ship within deadline."

### 3.4 REJECTED

**Trigger:** Support agent selects "Reject" in Strapi admin, fills in:
- Rejection reason (required, from enum: `outside_warranty` | `user_damage` | `missing_proof_of_purchase` | `not_covered_region` | `other`)
- Rejection notes (optional; customer-visible if `share_notes = true`)
- Resubmission guidance (optional)

**Entry actions:**
- Send rejection email to customer (template RMA-04) with reason and appeal instructions
- Send Slack update to `#support-rma`

**This is a terminal state.** Customer may appeal by contacting support; agent can reopen and set status back to `UNDER_REVIEW`.

### 3.5 SHIP_TO_TWINMOS

**Trigger:** Support agent marks "Customer Shipped" after receiving shipping confirmation from customer

**Entry actions:**
- Store customer's tracking number in `customer_tracking_number` field
- Send email confirmation (template RMA-05) acknowledging shipment
- Send Slack update to `#support-rma`

**Allowed next states:** `RECEIVED` (when physical product arrives at TwinMOS facility)

### 3.6 RECEIVED

**Trigger:** TwinMOS receiving team confirms physical product received; support agent marks "Product Received" in Strapi

**Entry actions:**
- Store internal receipt reference number
- Send email to customer (template RMA-06) confirming receipt
- Send Slack update to `#support-rma`
- Assign to Engineering / QA queue for testing

**Allowed next states:** `TESTING`

### 3.7 TESTING

**Trigger:** Engineering / QA team begins testing the returned product; agent marks "Testing Started"

**Entry actions:**
- Send email to customer (template RMA-07) — "Your product is being tested"
- Log test start timestamp

**Testing outcomes (support agent fills after QA):**
- `defect_confirmed` → proceed to `REPLACEMENT_SHIPPED`
- `no_defect_found` → support contacts customer; if confirmed no defect, move to `CLOSED` with refusal note
- `physical_damage_confirmed` → move to `REJECTED` (post-receipt rejection, rare edge case)

**Allowed next states:** `REPLACEMENT_SHIPPED`, `REJECTED`

### 3.8 REPLACEMENT_SHIPPED

**Trigger:** Logistics team ships replacement product; support agent marks "Replacement Dispatched"

**Entry actions:**
- Store replacement product details (`replacement_sku`, `replacement_serial`, `replacement_tracking`)
- Send email to customer (template RMA-08) with tracking number
- Send Slack update to `#support-rma`

**Allowed next states:** `CLOSED`

**Auto-close trigger:** If no further action after 14 days of replacement shipping, system automatically moves to `CLOSED`.

### 3.9 CLOSED

**Trigger:** 
- Manual: Support agent marks "Closed" after confirming customer received replacement
- Automatic: 14 days after `REPLACEMENT_SHIPPED` with no escalation

**Entry actions:**
- Send closure email to customer (template RMA-09) with CSAT survey link (Chatwoot or custom)
- Log closure timestamp and closure method (manual vs automatic)
- Audit log entry

**This is a terminal state.**

---

## 4. RMA Reference Number Format

### 4.1 Format Specification

```
TWN-RMA-{YEAR}-{SEQUENCE}
```

| Component | Format | Example |
|-----------|--------|---------|
| Prefix | `TWN-RMA` | Fixed |
| Year | 4-digit year | `2027` |
| Sequence | 6-digit zero-padded sequential integer (per year) | `000001` |

**Examples:**
- `TWN-RMA-2027-000001` (first RMA of 2027)
- `TWN-RMA-2027-000523`
- `TWN-RMA-2028-000001` (resets each year)

### 4.2 Generation Logic

```ts
// Strapi lifecycle hook: RMARequest.beforeCreate
async function generateRMAReference(): Promise<string> {
  const year = new Date().getFullYear();
  const lastRMA = await strapi.db.query('api::rma-request.rma-request').findOne({
    where: { rma_year: year },
    orderBy: { sequence: 'desc' },
  });
  const sequence = lastRMA ? lastRMA.sequence + 1 : 1;
  return `TWN-RMA-${year}-${sequence.toString().padStart(6, '0')}`;
}
```

---

## 5. Customer-Facing RMA Submission Form

### 5.1 URL

`/support/rma/submit`

### 5.2 Form Fields

**Step 1 — Product Information**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Product Model | Dropdown (from Strapi `Product` collection) | Yes | Must match known SKU |
| Serial Number | Text | Yes | Must be 8–20 alphanumeric chars; checked against `valid_serials` (warning if not found, not blocked) |
| Purchase Date | Date picker | Yes | Must be ≤ today; must be within warranty period (auto-validated against product warranty term) |
| Proof of Purchase | File upload (PDF/JPG/PNG, ≤10MB) | Yes | File type whitelist; ClamAV scan |
| Retailer / Distributor | Text | Yes | Where product was purchased |

**Step 2 — Issue Description**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Issue Category | Dropdown | Yes | `Not Detected by System` / `Physical Damage` / `Performance Below Spec` / `Overheating` / `Other` |
| Issue Description | Textarea (min 50 chars) | Yes | Customer describes the defect |
| Troubleshooting Steps Taken | Textarea | No | Optional; helps support team |
| Photos of Issue | File upload (up to 3 images, JPG/PNG, ≤5MB each) | No | Visible defects, bent pins, etc. |

**Step 3 — Contact & Shipping**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Full Name | Text | Yes | |
| Email Address | Email | Yes | Used for all RMA communications |
| Phone Number | Tel | Yes | For logistics coordination |
| Country / Region | Dropdown | Yes | Determines applicable warranty policy and shipping instructions |
| Return Shipping Address | Multi-line text | Yes | Where TwinMOS should ship the replacement |

**Step 4 — Review & Submit**

- Summary of all entered data
- Terms acceptance: "I confirm this product is defective and was purchased from an authorized TwinMOS reseller."
- GDPR/PDPL consent for data processing (required per BRD §22.1)
- Submit button triggers Cloudflare Turnstile challenge

### 5.3 Validation Rules

- Warranty check: `purchase_date + warranty_term_years × 365 ≥ today` (uses product's `warranty_years` field from Strapi)
- File upload: type whitelist + size limit + ClamAV scan (async; submission blocked until scan complete for uploads ≤5MB; async for larger)
- Rate limiting: max 3 RMA submissions per email address per 30 days (prevents abuse)
- Serial number: checked against `valid_serials` MeiliSearch index; if NOT_FOUND, show warning: "Serial number not found in our database. This will not prevent your submission but may delay processing."

### 5.4 Post-Submission Page

```
✓ RMA Submitted Successfully

Your RMA reference number is: TWN-RMA-2027-000123

A confirmation email has been sent to [customer email].
Our support team will review your request within 24 hours.

[Track Your RMA Status]  [Contact Support]  [Return to Homepage]
```

---

## 6. Customer RMA Status Page

### 6.1 URL

`/support/rma/status`

### 6.2 Lookup Method

Customer enters RMA reference number + email address to retrieve status (no account login required):

```
[RMA Reference Number ________________]
[Email Address          ________________]
[Check Status]
```

**Cloudflare Turnstile** required on this form to prevent enumeration attacks.

### 6.3 Status Display

| State | Customer-Visible Information |
|-------|------------------------------|
| SUBMITTED | Reference number, submitted date, "awaiting review" message |
| UNDER_REVIEW | Reference number, "under review by our team", assigned support agent first name only |
| APPROVED | Approval date, shipping instructions, deadline for customer to ship |
| REJECTED | Rejection reason (if `share_notes=true`), appeal instructions |
| SHIP_TO_TWINMOS | Customer's tracking number (echoed back), "awaiting arrival at TwinMOS" |
| RECEIVED | Receipt date, "testing will begin shortly" |
| TESTING | Test start date, estimated turnaround message |
| REPLACEMENT_SHIPPED | Replacement tracking number, carrier, estimated delivery |
| CLOSED | Closure date, confirmation message, CSAT survey link |

### 6.4 Data Leakage Prevention

The status endpoint must **not** expose:
- Internal support agent names (full name)
- Internal notes or rejection details not marked `share_notes=true`
- Serial number of replacement unit (only model name)
- Internal RMA sequence numbers beyond the customer's own

---

## 7. Internal Admin Workflow (Strapi)

### 7.1 RMA Admin List View

Strapi admin panel (for Support Ops role) shows:
- Filterable by: `status`, `date_submitted`, `assigned_to`, `country`, `product_model`
- Sortable by: `date_submitted`, `status`, `days_in_current_state`
- Color-coded urgency indicators:
  - Red: SLA breach (days_in_current_state > threshold)
  - Amber: SLA warning (within 24 hours of threshold)
  - Green: Within SLA

### 7.2 RMA Detail View

Support agent sees full RMA data plus:
- **Warranty validation result** (computed from purchase date + product warranty term)
- **Serial number validation result** (from `valid_serials` lookup)
- **SLA countdown** for current state
- **State transition buttons** (context-aware; only valid next states shown)
- **Internal notes** (support team only; not customer-visible unless explicitly shared)
- **Customer-visible notes** toggle (for rejection reason, shipping notes, etc.)
- **File attachments** (proof of purchase, issue photos)
- **Timeline** (all state transitions with timestamp, agent, and notes)
- **Related warranty record** (if found via serial number)

### 7.3 Bulk Actions

| Bulk Action | Available For |
|-------------|--------------|
| Assign to agent | SUBMITTED, UNDER_REVIEW |
| Export to CSV | All states |
| Mark as Received (batch) | SHIP_TO_TWINMOS (for batch receiving) |
| Auto-reject expired items | APPROVED (deadline passed — support confirms before applying) |

---

## 8. Email Notification Templates

All emails sent via Resend transactional API. Templates stored in Strapi `EmailTemplate` collection for easy content updates.

### RMA-01: Submission Confirmation

```
Subject: RMA Request Received — {{rma_reference}} | TwinMOS Support

Dear {{customer_name}},

Thank you for contacting TwinMOS Support. We have received your RMA request.

RMA Reference: {{rma_reference}}
Product: {{product_name}}
Submitted: {{submission_date}}

Our support team will review your request within 24 hours (business days, 
Sunday–Thursday, 9 AM–6 PM GST).

Track your RMA status at any time: {{status_url}}

If you need immediate assistance, please reply to this email or contact 
your regional support team.

TwinMOS Technologies Support Team
support@twinmos.com
```

### RMA-02: Under Review

```
Subject: Your RMA {{rma_reference}} Is Under Review | TwinMOS Support

Dear {{customer_name}},

Good news — a member of our support team has picked up your RMA request 
and is currently reviewing it.

RMA Reference: {{rma_reference}}
Assigned Support Agent: {{agent_first_name}}
Review started: {{review_date}}

We aim to complete our review within 48 hours. You will receive an email 
with our decision (approval or rejection with full explanation).

Track status: {{status_url}}
```

### RMA-03: Approved — Shipping Instructions

```
Subject: RMA APPROVED — Please Ship Your Product | {{rma_reference}}

Dear {{customer_name}},

Your RMA request has been approved. Please ship your defective product 
to us using the instructions below.

RMA Reference: {{rma_reference}}
Approval Date: {{approval_date}}
Ship By: {{shipping_deadline}} (14 days from approval)

SHIPPING INSTRUCTIONS:
{{shipping_address_block}}

Please include:
• A printed copy of this email (or write {{rma_reference}} on the package)
• Original accessories where possible

IMPORTANT:
• Use a tracked shipping service
• TwinMOS does not cover return shipping costs (unless stated in your 
  regional warranty terms)
• Email your tracking number to: rma@twinmos.com

Once we receive your product, we will begin testing and ship your 
replacement within 5 business days.

Track status: {{status_url}}
```

### RMA-04: Rejected

```
Subject: Update on Your RMA Request — {{rma_reference}}

Dear {{customer_name}},

After reviewing your RMA request, we are unable to proceed with a replacement 
under the current submission for the following reason:

Reason: {{rejection_reason_text}}
{{rejection_notes}}  {# Only if share_notes = true #}

APPEAL OR RESUBMIT:
If you believe this decision was made in error, or if you have additional 
documentation (e.g., proof of purchase), please reply to this email within 
14 days.

We apologize for any inconvenience. Our support team is happy to help 
clarify our warranty policy or explore alternative options.

Track status: {{status_url}}
Contact us: support@twinmos.com
```

### RMA-05 through RMA-09

Similar structured templates for:
- RMA-05: Shipping confirmed by support
- RMA-06: Product received at TwinMOS
- RMA-07: Testing in progress
- RMA-08: Replacement dispatched (with tracking number)
- RMA-09: Case closed (with CSAT survey link)

---

## 9. Slack Notifications

All RMA state transitions send a Slack message to `#support-rma`:

```
[RMA STATE CHANGE]
🆕 SUBMITTED | TWN-RMA-2027-000123
Product: VOLTX DDR5 RGB 32GB 6000MHz
Customer: Ahmed Al-Rashidi (UAE)
Submitted: 2027-03-07 14:32 UTC
→ https://admin.twinmos.com/content-manager/rma/123
```

```
✅ APPROVED | TWN-RMA-2027-000123
Approved by: Sarah (support)
Ship By: 2027-03-21
```

```
🚨 SLA WARNING | TWN-RMA-2027-000098
State: UNDER_REVIEW for 40 hours (SLA: 48h)
Assigned to: Unassigned
→ Needs immediate assignment
```

---

## 10. Strapi Data Model

### 10.1 `RMARequest` Collection Schema

```ts
interface RMARequest {
  // Identity
  rma_reference: string;          // TWN-RMA-YYYY-NNNNNN (unique)
  rma_year: number;               // for sequence reset per year
  sequence: number;               // monotonic per year

  // Status
  status: RMAStatus;
  status_history: RMAStatusEntry[];  // full audit trail

  // Product
  product: Relation<Product>;     // Strapi relation
  serial_number: string;
  purchase_date: Date;
  proof_of_purchase_url: string;  // Backblaze B2
  retailer: string;

  // Issue
  issue_category: IssueCategory;
  issue_description: string;
  troubleshooting_steps: string;
  issue_photos: string[];         // up to 3 Backblaze B2 URLs

  // Customer
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_country: string;
  return_shipping_address: string;

  // Internal
  assigned_to: Relation<StrapiUser>;
  internal_notes: string;
  customer_visible_notes: string;
  share_notes: boolean;

  // Rejection
  rejection_reason?: RejectionReason;

  // Shipping (customer → TwinMOS)
  customer_tracking_number?: string;
  customer_carrier?: string;

  // Replacement (TwinMOS → customer)
  replacement_sku?: string;
  replacement_serial?: string;
  replacement_tracking?: string;
  replacement_carrier?: string;
  replacement_shipped_at?: Date;

  // Timestamps
  submitted_at: Date;
  reviewed_at?: Date;
  approved_at?: Date;
  received_at?: Date;
  testing_started_at?: Date;
  replacement_shipped_at?: Date;
  closed_at?: Date;
  closure_method?: 'manual' | 'automatic';
  
  // Consent
  gdpr_consent: boolean;
  gdpr_consent_timestamp: Date;
  consent_ip: string;
}

type RMAStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'SHIP_TO_TWINMOS'
  | 'RECEIVED'
  | 'TESTING'
  | 'REPLACEMENT_SHIPPED'
  | 'CLOSED';

interface RMAStatusEntry {
  status: RMAStatus;
  changed_at: Date;
  changed_by: string;            // agent email or 'system'
  notes: string;
}

type IssueCategory =
  | 'not_detected'
  | 'physical_damage'
  | 'performance_below_spec'
  | 'overheating'
  | 'other';

type RejectionReason =
  | 'outside_warranty'
  | 'user_damage'
  | 'missing_proof_of_purchase'
  | 'not_covered_region'
  | 'no_defect_found'
  | 'customer_did_not_ship'
  | 'other';
```

### 10.2 Lifecycle Hooks

```ts
// Strapi lifecycle hooks for RMARequest
{
  afterCreate: [generateRMAReference, sendAcknowledgmentEmail, notifySlack],
  afterUpdate: [
    checkStatusChange,        // only fires if status changed
    sendStatusChangeEmail,    // sends correct template based on new status
    notifySlack,
    logAuditEntry,
  ],
}
```

### 10.3 SLA Monitoring Cron Job

```ts
// Runs every hour: check for SLA breaches
async function checkRMASLAs() {
  const slaThresholds: Record<RMAStatus, number> = {
    SUBMITTED: 24,           // hours until UNDER_REVIEW
    UNDER_REVIEW: 48,        // hours until APPROVED or REJECTED
    APPROVED: 14 * 24,       // hours until customer ships (14 days)
    SHIP_TO_TWINMOS: 10 * 24, // hours until RECEIVED (transit time allowance)
    RECEIVED: 24,            // hours until TESTING
    TESTING: 5 * 24,         // hours until REPLACEMENT_SHIPPED
    REPLACEMENT_SHIPPED: 14 * 24, // hours until CLOSED (delivery allowance)
  };
  
  for (const [status, hours] of Object.entries(slaThresholds)) {
    const breached = await strapi.db.query('api::rma-request.rma-request').findMany({
      where: {
        status,
        status_changed_at: { $lt: new Date(Date.now() - hours * 0.9 * 3600000) }, // 90% warning
      },
    });
    for (const rma of breached) {
      await notifySlackSLAWarning(rma);
    }
  }
}
```

---

## 11. API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/rma/submit` | Turnstile | Customer submits RMA request |
| GET | `/api/v1/rma/status` | Turnstile + rma_ref + email | Customer checks RMA status |
| POST | `/api/v1/rma/status/verify` | Turnstile | Validate lookup credentials |
| GET | `/api/v1/rma/:id` | CMS Admin JWT | Full RMA detail (admin) |
| PATCH | `/api/v1/rma/:id/status` | CMS Admin JWT | Agent transitions RMA state |
| PATCH | `/api/v1/rma/:id/assign` | CMS Admin JWT | Assign to agent |
| GET | `/api/v1/rma` | CMS Admin JWT | Paginated list (admin) |
| POST | `/api/v1/rma/:id/note` | CMS Admin JWT | Add internal note |

### 11.1 Submit Endpoint Request Body

```json
{
  "product_model": "TM-D5-VOLT-32G-6000",
  "serial_number": "TW2025K01234567",
  "purchase_date": "2025-09-15",
  "retailer": "Amazon UAE",
  "issue_category": "not_detected",
  "issue_description": "Module not recognized by motherboard after installation...",
  "customer_name": "Ahmed Al-Rashidi",
  "customer_email": "ahmed@example.com",
  "customer_phone": "+971501234567",
  "customer_country": "AE",
  "return_shipping_address": "Villa 12, Al Barsha, Dubai, UAE",
  "gdpr_consent": true,
  "turnstile_token": "<cloudflare-token>"
}
```

### 11.2 Status Endpoint Response

```json
{
  "rma_reference": "TWN-RMA-2027-000123",
  "status": "APPROVED",
  "status_label": "RMA Approved — Please Ship Product",
  "product_name": "VOLTX DDR5 RGB 32GB 6000MHz",
  "submitted_at": "2027-03-07T14:32:00Z",
  "current_state_since": "2027-03-08T10:15:00Z",
  "shipping_deadline": "2027-03-22",
  "shipping_instructions": {
    "address": "TwinMOS Service Center, Dubai, UAE (full address redacted from spec)",
    "reference": "TWN-RMA-2027-000123",
    "notes": "Use tracked shipping service. Email tracking to rma@twinmos.com."
  }
}
```

---

## 12. SLA Targets

| Stage | SLA Target | Breach Alert Trigger | Escalation |
|-------|-----------|---------------------|------------|
| SUBMITTED → UNDER_REVIEW | 24 hours | 21 hours (90%) | Slack `#support-rma` + Support Lead email |
| UNDER_REVIEW → decision | 48 hours | 43 hours (90%) | Slack + Support Manager |
| APPROVED → customer ships | 14 days (customer side) | Day 12 reminder email | Day 14 auto-rejection warning |
| RECEIVED → TESTING | 24 hours | 21 hours | Slack engineering queue |
| TESTING → REPLACEMENT_SHIPPED | 5 business days | Day 4 | Slack + Logistics Lead |
| REPLACEMENT_SHIPPED → CLOSED | 14 days | — | Auto-close on day 14 |

---

## 13. Edge Cases & Business Rules

| Scenario | Handling |
|----------|---------|
| Customer submits duplicate RMA for same serial number within 90 days | System flags duplicate; support reviews manually before approving |
| Customer reports wrong serial number | Support agent can edit serial number in admin before validation |
| Product no longer manufactured (legacy) | Support handles with equivalent replacement; noted in RMA comments |
| No replacement stock available | Support contacts customer with timeline; state stays at REPLACEMENT_SHIPPED pending stock |
| Distributor submits bulk RMA (10+ units) | Standard form limited to 1 unit; bulk RMA handled via `rma@twinmos.com` email with CSV template |
| Customer in country with no TwinMOS service center | Rejection reason `not_covered_region`; redirect to global support with alternative |
| Customer requests refund instead of replacement | Noted in RMA; handled outside the system (finance/PayPal); RMA closed after refund confirmed |
| RMA submitted in non-English language | Support team handles; Phase 2 adds AR/BN/HI email templates |
| Warranty not in `valid_serials` (product from before serial tracking) | Support manually validates from purchase proof; can override warranty check |
| Physical damage found during testing (post-approval) | State moves to REJECTED; RMA-04 variant sent explaining post-receipt rejection |

---

## 14. Reporting & Analytics

### 14.1 Support Team Reports (Strapi Admin)

| Report | Metrics | Cadence |
|--------|---------|---------|
| RMA Volume by Status | Count per state | Daily |
| Average Resolution Time | Mean days from SUBMITTED to CLOSED | Weekly |
| SLA Compliance Rate | % of RMAs meeting each SLA target | Weekly |
| Rejection Rate by Reason | Count per rejection_reason | Monthly |
| RMA Volume by Product | Most-returned SKUs | Monthly |
| RMA Volume by Country | Geographic distribution | Monthly |
| RMA Volume by Agent | Throughput per support agent | Monthly |

### 14.2 Plausible Analytics Tracking

Public-facing RMA pages tracked with Plausible custom events:
- `rma_form_start`
- `rma_form_step_{1..4}_complete`
- `rma_form_submit`
- `rma_form_error_{field_name}`
- `rma_status_lookup`

---

## 15. Acceptance Criteria

### 15.1 Submission

- [ ] Form submits successfully with all required fields
- [ ] RMA reference number generated in correct format (`TWN-RMA-2027-XXXXXX`)
- [ ] Confirmation email (RMA-01) received within 5 minutes
- [ ] Duplicate serial submission within 90 days flagged in Strapi admin
- [ ] File upload rejects non-PDF/JPG/PNG files
- [ ] Warranty check correctly identifies out-of-warranty submission (shows warning)

### 15.2 State Machine

- [ ] All 9 state transitions work in Strapi admin
- [ ] Each transition sends correct email template
- [ ] Each transition sends Slack notification
- [ ] Rejected state is terminal; only manual reopen allowed
- [ ] Auto-close fires 14 days after REPLACEMENT_SHIPPED

### 15.3 Status Tracking

- [ ] Status page returns correct state for valid RMA ref + email
- [ ] Status page returns 404/error for invalid combination
- [ ] Status page does not expose internal notes or agent full name
- [ ] Turnstile required on status lookup

### 15.4 Admin

- [ ] SLA warning appears at 90% of threshold in Strapi admin
- [ ] SLA breach Slack notification fires correctly
- [ ] Audit trail shows full state history with timestamps and agent names
- [ ] Bulk export to CSV works for all RMA records

---

*RMA Workflow Specification v1.0 | TwinMOS Technologies | Phase 2*  
*Synchronized with: Tech Stack v1.1 §10.4 · BRD v3.0 §17 · URD v3.0 UC-28/29*
