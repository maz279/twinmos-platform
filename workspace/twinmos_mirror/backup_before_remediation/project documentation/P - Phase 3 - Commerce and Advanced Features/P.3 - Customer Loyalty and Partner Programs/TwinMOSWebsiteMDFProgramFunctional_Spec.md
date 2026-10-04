# TwinMOS Technologies — MDF Program Functional Specification

| Field            | Value                                     |
|------------------|-------------------------------------------|
| Document Ref     | TWN-P3-MDF-2026-001                       |
| Version          | 1.0                                       |
| Status           | Draft — Pending Marketing and Finance Approval |
| Phase            | Phase 3 — Commerce and Advanced Features  |
| Author           | TwinMOS Digital Product Team              |
| Date             | 2026-05-01                                |
| Reviewed By      | TBD                                       |
| Approved By      | TBD                                       |

---

## Table of Contents

1. [Document Purpose and Scope](#1-document-purpose-and-scope)
2. [Program Overview](#2-program-overview)
3. [Partner Eligibility and Tiers](#3-partner-eligibility-and-tiers)
4. [MDF Budget Allocation](#4-mdf-budget-allocation)
5. [Eligible MDF Activities](#5-eligible-mdf-activities)
6. [MDF Claim Workflow](#6-mdf-claim-workflow)
7. [Data Model](#7-data-model)
8. [MDF Portal Interface](#8-mdf-portal-interface)
9. [Claim Form Specification](#9-claim-form-specification)
10. [Post-Activity Claim Form](#10-post-activity-claim-form)
11. [Admin Portal Features](#11-admin-portal-features)
12. [Email Notifications](#12-email-notifications)
13. [Compliance and Brand Guidelines](#13-compliance-and-brand-guidelines)
14. [Analytics and ROI Tracking](#14-analytics-and-roi-tracking)
15. [Business Rules](#15-business-rules)
16. [Acceptance Criteria](#16-acceptance-criteria)
17. [Appendix](#17-appendix)

---

## 1. Document Purpose and Scope

### 1.1 Purpose

This specification defines the complete functional requirements for the TwinMOS Marketing Development Funds (MDF) program portal, which is a dedicated section within the Phase 2 partner portal. The MDF program enables TwinMOS to co-fund authorized distributors and resellers in executing local marketing activities that promote TwinMOS products in their markets, increasing brand visibility and driving sell-through.

This document is intended for:

- **Back-end engineers** implementing MDF data models, workflow logic, and API endpoints in Strapi v5 and Medusa.js v2
- **Front-end engineers** building the MDF portal UI within the existing Astro 5 partner portal
- **QA engineers** writing test cases against acceptance criteria and workflow states
- **Finance team** for budget control, payment processing, and audit trail requirements
- **Sales and marketing team** administering MDF claims and approvals
- **Partners (distributors and resellers)** who will use the portal to submit and manage MDF claims

### 1.2 Scope

This specification covers:

- MDF program overview and eligibility
- Budget structure: global pool, regional allocation, per-partner allocation
- Eligible activity categories and their documentation requirements
- End-to-end MDF claim workflow (pre-approval through payment)
- Strapi v5 data models for MDF entities
- Partner portal interface for claim submission and tracking
- Admin portal for claim review, approval, and budget management
- Email notification templates for all workflow events
- Compliance requirements (brand guidelines, audit trail)
- Analytics and ROI tracking framework
- Business rules and acceptance criteria

### 1.3 Out of Scope

- Consumer loyalty program (covered in TWN-P3-LOYAL-2026-001)
- Consumer referral program (covered in TWN-P3-REFER-2026-001)
- Partner onboarding and portal registration (Phase 2 partner portal spec)
- Stripe payment processing for MDF disbursements (MDF payments are bank transfer or invoice credit — not Stripe)
- Physical marketing material production and shipping (handled by TwinMOS marketing team directly)
- TwinMOS internal marketing budget and spend management

### 1.4 Related Documents

| Document Reference       | Title                                              |
|--------------------------|----------------------------------------------------|
| TWN-P2-PARTNER-2025-001  | Partner Portal Specification (Phase 2)             |
| TWN-P3-CUST-2026-001     | Customer Account Specification                     |
| TWN-FIN-2026-001         | Financial Reporting Requirements                   |
| TWN-BRAND-2025-001       | Brand Guidelines v1.0                             |
| TWN-SEC-2025-001         | Security Policy and Standards                      |

### 1.5 Definitions

| Term                 | Definition                                                            |
|----------------------|-----------------------------------------------------------------------|
| MDF                  | Marketing Development Funds — co-marketing budget from TwinMOS       |
| Claim                | A formal request by a partner to use or be reimbursed for MDF        |
| Pre-Approval         | TwinMOS approval of planned marketing activity before execution       |
| Post-Activity Claim  | Partner's submission of actual spend and execution proof              |
| Partner              | Authorized distributor or reseller with active partner portal account |
| Distributor          | Tier 1 partner buying directly from TwinMOS                          |
| Reseller             | Tier 2 partner buying from distributor                                |
| Allocation           | The MDF budget amount assigned to a specific partner for the period   |
| POP                  | Proof of Performance — evidence that the activity was executed        |
| SOW                  | Statement of Work / campaign plan submitted in pre-approval           |

---

## 2. Program Overview

### 2.1 Program Description

The TwinMOS MDF Program is a co-marketing investment initiative designed to:

1. **Increase TwinMOS brand visibility** in markets where TwinMOS does not have direct marketing presence
2. **Drive sell-through** of TwinMOS products at the distributor and reseller level
3. **Build partner capability** in local marketing and demand generation
4. **Reward high-performing partners** with proportionally larger marketing co-investment

TwinMOS provides co-funding for approved marketing activities executed by its authorized partners. Partners plan the activity, receive pre-approval, execute the campaign, and submit proof for reimbursement (or invoice credit).

### 2.2 Program Structure Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    TwinMOS Annual MDF Budget                    │
│                    (Set by Marketing Director)                  │
└─────────────────────────┬───────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┬──────────────┐
          │               │               │              │
          ▼               ▼               ▼              ▼
    MEA Region      South Asia      CIS Region       Other
      (40%)           (30%)           (15%)          (15%)
          │               │
          ▼               ▼
   Per-Partner         Per-Partner
   Allocation          Allocation
   (based on tier)     (based on tier)
          │
          ▼
   ┌─────────────────────────────────────────────┐
   │        Partner MDF Budget                  │
   │  Gold:   up to $5,000/quarter              │
   │  Silver: up to $2,000/quarter              │
   │  Bronze: up to $500/quarter                │
   └─────────────────────────────────────────────┘
          │
          ▼
   Partner submits MDF Claim
   (Pre-Approval → Execute → Post-Claim → Payment)
```

### 2.3 Program Fiscal Year

- MDF programs run on a **calendar year basis** (January 1 – December 31)
- Quarterly allocations: Q1 (Jan–Mar), Q2 (Apr–Jun), Q3 (Jul–Sep), Q4 (Oct–Dec)
- Unused quarterly allocation does NOT roll over to the next quarter (use-it-or-lose-it per quarter)
- Annual program is set up by TwinMOS Marketing Director in the admin portal

### 2.4 Key Stakeholders

| Stakeholder                  | Role in MDF Program                                        |
|------------------------------|------------------------------------------------------------|
| Partner (Distributor/Reseller) | Submits pre-approval and post-activity claims             |
| TwinMOS Regional Sales Manager| Primary reviewer and approver for partner's region        |
| TwinMOS Marketing Director   | Sets annual program budget; approves override cases       |
| TwinMOS Finance Team         | Processes payment; tracks budget utilization              |
| TwinMOS Channel Manager      | Ongoing partner relationship; assists with claim quality  |
| TwinMOS IT/DevOps            | Portal infrastructure and support                         |

---

## 3. Partner Eligibility and Tiers

### 3.1 Eligibility Requirements

To participate in the MDF program, a partner must:

1. Hold an active **Authorized Partner** status with TwinMOS (not Pending or Suspended)
2. Have an active **Partner Portal account** (Phase 2 onboarding complete)
3. Meet the **minimum quarterly purchase volume** for their tier
4. Be in good standing: no overdue invoices, no unresolved compliance issues
5. Submit pre-approval requests **before** starting the marketing activity
6. Be listed on the TwinMOS authorized partner page (or agreed equivalent)

### 3.2 Partner Tier Definitions

| Tier   | Quarterly Purchase Volume | MDF Allocation per Quarter | Approval SLA |
|--------|---------------------------|---------------------------|--------------|
| Bronze | < USD 50,000              | Up to USD 500             | 5 business days |
| Silver | USD 50,000 – USD 200,000  | Up to USD 2,000           | 5 business days |
| Gold   | USD 200,000+              | Up to USD 5,000           | 5 business days |

*Quarterly purchase volume is calculated based on the prior quarter's confirmed purchase orders on the TwinMOS partner portal.*

*Amounts shown in USD. Regional equivalents: AED 1,835 / INR 41,500 / BDT 55,000 / SAR 1,875 for Bronze cap of USD 500. Adjust proportionally for Silver and Gold.*

### 3.3 Partner Tier Evaluation

- Tier is evaluated at the start of each quarter based on the prior quarter's purchase volume
- A partner who drops below their tier threshold is downgraded at the start of the following quarter
- A partner who exceeds a tier threshold mid-quarter becomes eligible for the higher tier at the start of the following quarter
- Tier changes affect future MDF allocations; they do not retroactively change current quarter allocation

### 3.4 Tier Allocation Proration

Partners who join the program mid-quarter receive a prorated allocation:

```
Prorated Allocation = (Full Tier Allocation / 3) × Remaining Months in Quarter

Example: Gold partner joins on 15 May 2026 (mid-Q2, 1.5 months remaining)
  Prorated = ($5,000 / 3) × 1.5 = $2,500 for Q2
```

### 3.5 Partners Excluded from MDF

| Partner Type                       | Reason for Exclusion                              |
|------------------------------------|---------------------------------------------------|
| Resellers buying only from distributors (not direct from TwinMOS) | Only direct-purchase partners qualify |
| Online marketplace sellers (eBay, Amazon third-party) | Outside MDF program scope |
| Employees or related parties       | Conflict of interest                              |
| Partners under investigation       | Compliance hold                                   |

---

## 4. MDF Budget Allocation

### 4.1 Annual Program Setup

Each year, TwinMOS Marketing Director creates a new MDF program record in the admin portal:

```
MDF Program: 2026
──────────────────────────────────────────────────────────
Fiscal Year:         2026
Total Global Budget: USD 500,000
Start Date:          1 January 2026
End Date:            31 December 2026

Regional Allocation:
  MEA (UAE, KSA, Bahrain, Oman, Jordan, Egypt, etc.):   40% → USD 200,000
  South Asia (India, Bangladesh, Sri Lanka, Pakistan):    30% → USD 150,000
  CIS (Russia, Kazakhstan, Ukraine, Azerbaijan):          15% → USD 75,000
  Other (All other markets):                             15% → USD 75,000

Status: Active
──────────────────────────────────────────────────────────
```

### 4.2 Per-Partner Allocation Assignment

Within each region, TwinMOS Regional Sales Manager assigns per-partner quarterly allocations:

```
Partner: Smart Technologies BD (Bangladesh)
Region: South Asia
Tier: Silver
──────────────────────────────────────────────────────────
Q1 2026 Allocation:   USD 2,000
Q2 2026 Allocation:   USD 2,000
Q3 2026 Allocation:   USD 2,000
Q4 2026 Allocation:   USD 2,000
Annual Total:         USD 8,000

Q1 2026 Status:
  Allocated:          USD 2,000
  Approved (claimed): USD 1,200
  Pending review:     USD    500
  Available:          USD    300
──────────────────────────────────────────────────────────
```

### 4.3 Budget Utilization Tracking

Budget utilization is tracked at three levels:

```
Global Level:
  Total Budget:      USD 500,000
  Total Approved:    USD 187,500  (37.5% utilized)
  Total Pending:     USD  42,000
  Total Available:   USD 270,500

Regional Level (MEA):
  Allocated:         USD 200,000
  Approved:          USD  87,000
  Pending:           USD  22,000
  Available:         USD  91,000

Partner Level (Smart Technologies BD, Q1):
  Allocated:         USD   2,000
  Approved:          USD   1,200
  Pending:           USD     500
  Available:         USD     300
```

### 4.4 Budget Rules

- Partners cannot submit a claim that exceeds their remaining available allocation for the quarter
- If a claim is partially approved (approved for less than requested), the difference is returned to available
- Allocations expire at the end of the quarter; unused funds return to the regional pool
- Regional pool excess at year-end returns to TwinMOS corporate budget
- No partner can access another partner's allocation

---

## 5. Eligible MDF Activities

### 5.1 Activity Categories

| Category Code | Activity Type                     | Max % of Quarter Allocation | Documentation Required              |
|---------------|-----------------------------------|-----------------------------|-------------------------------------|
| DIG-001       | Digital advertising               | 80%                         | Ad screenshots, campaign reports, invoices |
| EVT-001       | Trade show / exhibition           | 100%                        | Booth photos, attendance records, invoices |
| INS-001       | In-store displays / POS materials | 60%                         | Store photos showing TwinMOS branding, invoices |
| EML-001       | Co-branded email campaigns        | 30%                         | Email screenshot, distribution report, list size |
| DEM-001       | Product demonstration events      | 70%                         | Event agenda, photos, attendance list |
| TRN-001       | Sales staff training events       | 50%                         | Training agenda, attendee list, trainer invoice |
| PR-001        | Local PR and media activities     | 40%                         | Press clippings, media coverage links, invoices |
| SOC-001       | Social media campaigns (paid)     | 50%                         | Post screenshots, ad manager reports, invoices |

### 5.2 Activity Category Detailed Requirements

#### 5.2.1 Digital Advertising (DIG-001)

Eligible platforms: Google Ads (Search, Display, Shopping), Meta Ads (Facebook, Instagram), Snapchat Ads, TikTok Ads, regional platforms (Baidu, Yandex, local news portal advertising).

**Required in pre-approval:**
- Platform(s) to be used
- Target keywords or audience segments
- Ad creative previews / mockups
- Geographic targeting
- Flight dates (start and end)
- Budget breakdown per platform

**Required in post-activity claim:**
- Campaign performance reports (impressions, clicks, CTR, conversions)
- Ad screenshots showing TwinMOS brand/product featured
- Invoices from ad platform (Google invoice, Meta invoice, agency invoice)

**Ineligible:** Generic brand advertising not featuring TwinMOS products; boosts to non-TwinMOS content.

#### 5.2.2 Trade Show / Exhibition (EVT-001)

**Required in pre-approval:**
- Event name, organizer, location, dates
- Expected attendance (visitors)
- Booth size and location details
- Planned TwinMOS product demonstrations
- Promotional materials to be displayed
- Registration/booth cost breakdown

**Required in post-activity claim:**
- Photos of booth with TwinMOS branding visible
- Event attendance summary (official data from organizer)
- List of TwinMOS products demonstrated
- Invoices: booth rental, materials, shipping

#### 5.2.3 In-Store Displays and POS Materials (INS-001)

**Required in pre-approval:**
- Store name and location
- Display type (shelf talker, banner, product tester setup, etc.)
- Number of stores (multi-store rollout requires all store list)
- Mockup of display/materials
- Duration of display

**Required in post-activity claim:**
- In-store photos showing TwinMOS-branded display
- Store confirmation (e-mail or signed letter from store manager)
- Print/production invoices for materials

#### 5.2.4 Co-Branded Email Campaigns (EML-001)

**Required in pre-approval:**
- Email list size (approximate)
- Target audience description
- Email mockup (HTML or design draft)
- Subject line and preview text
- Send date and frequency

**Required in post-activity claim:**
- Screenshot of sent email (full design)
- Email performance report (sent, open rate, click rate)
- Screenshot of unsubscribe mechanism (compliance)
- Confirmation from email platform (Mailchimp, Brevo, etc.)

#### 5.2.5 Sales Staff Training Events (TRN-001)

**Required in pre-approval:**
- Training provider (internal or external)
- Number of staff to be trained
- Training topics and curriculum outline
- Location (in-person or virtual)
- Training dates

**Required in post-activity claim:**
- Signed attendance list
- Training agenda / completion certificate
- Photos (if in-person)
- Invoice from training provider (if external)

### 5.3 Ineligible Activities

The following activities are explicitly **not eligible** for MDF:

| Activity                                   | Reason                                        |
|--------------------------------------------|-----------------------------------------------|
| General business operating expenses        | Not marketing-specific                        |
| Salary and headcount costs                 | Not covered; MDF is for campaign spend        |
| Competitor product promotion               | Must be TwinMOS-focused                       |
| Activities already completed before pre-approval | Pre-approval is mandatory               |
| Cash rebates or price reductions to end customers | Not an MDF activity                  |
| Entertainment or hospitality costs         | Not a marketing deliverable                   |
| Non-TwinMOS-branded activities             | Must prominently feature TwinMOS branding     |
| Activities in non-authorized territories   | Must be in partner's authorized sales territory |

---

## 6. MDF Claim Workflow

### 6.1 Workflow Overview

```
Partner                           TwinMOS (Regional Sales Mgr / Finance)
────────────────────────────────────────────────────────────────────────

STEP 1: Pre-Approval Request
  Partner creates pre-approval:
  ├── Activity details
  ├── Budget request
  └── Campaign plan docs

                  ─────────────────────►  STEP 2: TwinMOS Review
                                          (5 business day SLA)
                                          ├── Review by Regional Sales Mgr
                                          ├── Check against:
                                          │   ├── Available budget
                                          │   ├── Eligible activity type
                                          │   ├── Brand guideline compliance
                                          │   └── Strategic fit
                                          └── Decision:
                                              ├── Approved (with approved amount)
                                              ├── Rejected (with reason)
                                              └── More info needed

  STEP 3: Partner receives decision
  ├── Approved → Execute campaign
  │   (within approved dates)
  ├── Rejected → May submit new
  │   request with modifications
  └── More info → Provide additional
      information and resubmit

  [Partner executes campaign]

  STEP 4: Post-Activity Claim (within 30 days of activity end)
  ├── Actual spend amount
  ├── Proof of execution (POP):
  │   ├── Photos / screenshots
  │   ├── Performance reports
  │   └── Invoices / receipts
  └── Payment preference:
      ├── Bank transfer
      └── Invoice credit

                  ─────────────────────►  STEP 5: TwinMOS Verification
                                          (10 business day SLA)
                                          ├── Verify POP against pre-approval
                                          ├── Verify invoices match claimed amount
                                          ├── Verify brand guidelines followed
                                          └── Decision:
                                              ├── Approved (full or partial)
                                              ├── Rejected (with reason)
                                              └── More info needed

  STEP 6: Payment
  ├── Approved → Finance processes payment
  │   (within 30 days of approval)
  ├── Bank transfer: to partner's registered bank
  └── Invoice credit: applied to next purchase order

  Partner receives:
  ├── Payment confirmation notification
  └── Claim approval letter PDF
```

### 6.2 Claim Status Lifecycle

```
                          ┌────────────────┐
                          │    DRAFT        │
                          │ (Partner saving │
                          │  form progress) │
                          └───────┬────────┘
                                  │  Partner submits
                                  ▼
                          ┌────────────────┐
                          │   SUBMITTED     │
                          │ (Pre-Approval   │
                          │  in review)     │
                          └──┬──────────┬──┘
                             │          │
              TwinMOS decides │          │ TwinMOS needs more info
                             │          ▼
                 ┌───────────┴─┐  ┌─────────────────────┐
                 │             │  │  MORE_INFO_REQUESTED  │
           ┌────▼───┐   ┌─────▼─┐ │  (Partner provides   │
           │APPROVED│   │REJECTED│ │   additional docs)   │
           └────┬───┘   └───────┘ └────────┬────────────┘
                │                           │
                │ Partner executes activity  │ Partner resubmits
                │                           │
                ▼                           ▼
        ┌───────────────┐            ┌─────────────┐
        │  CLAIM_PENDING │◄───────── │ (back to review) │
        │ (Post-activity │            └─────────────┘
        │ claim submitted)│
        └───────┬────────┘
                │
                │ TwinMOS verifies POP
                │
        ┌───────┴──────────────────────────┐
        │                                  │
  ┌─────▼─────┐                     ┌─────▼─────────┐
  │ CLAIM_    │                     │ CLAIM_PARTIAL │
  │ APPROVED  │                     │ (partial amt  │
  └─────┬─────┘                     │ approved)     │
        │                           └───────┬───────┘
        └──────────────┬────────────────────┘
                       │
                       ▼
               ┌───────────────┐
               │  PAYMENT_     │
               │  PROCESSING   │
               └───────┬───────┘
                       │
                       ▼
               ┌───────────────┐
               │    PAID       │
               │  (Terminal)   │
               └───────────────┘
```

| Status                  | Description                                                          |
|-------------------------|----------------------------------------------------------------------|
| DRAFT                   | Partner is composing the claim; not yet submitted                    |
| SUBMITTED               | Pre-approval submitted; awaiting TwinMOS review                     |
| MORE_INFO_REQUESTED     | TwinMOS needs additional information from partner                    |
| APPROVED                | Pre-approval granted; partner may proceed with activity              |
| REJECTED                | Pre-approval denied; reason provided                                 |
| CLAIM_PENDING           | Post-activity claim submitted; awaiting TwinMOS verification         |
| CLAIM_APPROVED          | Post-activity claim approved in full                                 |
| CLAIM_PARTIAL           | Post-activity claim approved for a lesser amount; reason provided    |
| CLAIM_REJECTED          | Post-activity claim rejected; reason provided                        |
| PAYMENT_PROCESSING      | Finance team processing payment                                      |
| PAID                    | Payment completed (terminal state)                                   |
| EXPIRED                 | Post-activity claim not submitted within 30 days of activity end     |

### 6.3 SLA Tracking

| Step                        | SLA              | Alert Trigger                              |
|-----------------------------|------------------|--------------------------------------------|
| Pre-approval review         | 5 business days  | Alert to admin on day 4 if still pending   |
| More info response (partner)| 5 business days  | Alert to partner on day 3                  |
| Post-activity verification  | 10 business days | Alert to admin on day 8 if still pending   |
| Payment processing          | 30 calendar days | Alert to finance on day 20                 |

---

## 7. Data Model

### 7.1 Strapi v5 Collection: MDFProgram

```javascript
// Strapi v5 Collection Type: MDF Program (annual)

module.exports = {
  kind: 'collectionType',
  collectionName: 'mdf_programs',
  info: {
    singularName: 'mdf-program',
    pluralName: 'mdf-programs',
    displayName: 'MDF Program',
  },
  attributes: {
    fiscal_year: {
      type: 'integer',
      required: true,
      unique: true,
      description: 'e.g. 2026',
    },
    name: {
      type: 'string',
      required: true,
      description: 'e.g. TwinMOS MDF Program 2026',
    },
    global_budget_usd: {
      type: 'decimal',
      required: true,
      description: 'Total annual global budget in USD',
    },
    start_date: {
      type: 'date',
      required: true,
    },
    end_date: {
      type: 'date',
      required: true,
    },
    status: {
      type: 'enumeration',
      enum: ['draft', 'active', 'closed', 'archived'],
      required: true,
      default: 'draft',
    },

    // Regional allocations (stored as JSON for flexibility)
    regional_allocations: {
      type: 'json',
      description: 'JSON object: { MEA: 0.40, SouthAsia: 0.30, CIS: 0.15, Other: 0.15 }',
      // Example:
      // {
      //   "MEA": { "percentage": 40, "budget_usd": 200000, "regions": ["UAE","KSA","EG","JO",...] },
      //   "SouthAsia": { "percentage": 30, "budget_usd": 150000, "regions": ["IN","BD","LK","PK"] },
      //   "CIS": { "percentage": 15, "budget_usd": 75000, "regions": ["RU","KZ","UA","AZ"] },
      //   "Other": { "percentage": 15, "budget_usd": 75000, "regions": [] }
      // }
    },

    // Tier allocation caps per quarter (in USD)
    tier_caps_usd: {
      type: 'json',
      description: 'Per-tier quarterly allocation caps',
      // Example:
      // { "gold": 5000, "silver": 2000, "bronze": 500 }
    },

    // Admin metadata
    created_by_admin_id: {
      type: 'string',
    },
    approved_by_admin_id: {
      type: 'string',
    },
    notes: {
      type: 'text',
    },

    // Relationships
    partner_budgets: {
      type: 'relation',
      relation: 'oneToMany',
      target: 'api::mdf-partner-budget.mdf-partner-budget',
      mappedBy: 'mdf_program',
    },
  },
};
```

### 7.2 Strapi v5 Collection: MDFPartnerBudget

```javascript
// Per-partner quarterly allocation

module.exports = {
  kind: 'collectionType',
  collectionName: 'mdf_partner_budgets',
  info: {
    singularName: 'mdf-partner-budget',
    pluralName: 'mdf-partner-budgets',
    displayName: 'MDF Partner Budget',
  },
  attributes: {
    // Links
    mdf_program: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'api::mdf-program.mdf-program',
      inversedBy: 'partner_budgets',
    },
    partner_id: {
      type: 'string',
      required: true,
      description: 'Better Auth user ID of the partner account',
    },
    partner_company_name: {
      type: 'string',
      description: 'Denormalized for quick display without join',
    },
    partner_tier: {
      type: 'enumeration',
      enum: ['bronze', 'silver', 'gold'],
      required: true,
    },
    partner_region: {
      type: 'string',
      description: 'MEA, SouthAsia, CIS, Other',
    },

    // Quarter
    quarter: {
      type: 'enumeration',
      enum: ['Q1', 'Q2', 'Q3', 'Q4'],
      required: true,
    },
    year: {
      type: 'integer',
      required: true,
    },

    // Budget amounts (in USD)
    allocated_amount_usd: {
      type: 'decimal',
      required: true,
      description: 'Budget assigned to this partner for this quarter',
    },
    approved_amount_usd: {
      type: 'decimal',
      default: 0,
      description: 'Sum of all approved/partially approved claims this quarter',
    },
    pending_amount_usd: {
      type: 'decimal',
      default: 0,
      description: 'Sum of claims in SUBMITTED or CLAIM_PENDING status',
    },
    available_amount_usd: {
      type: 'decimal',
      description: 'Computed: allocated - approved - pending',
    },
    paid_amount_usd: {
      type: 'decimal',
      default: 0,
      description: 'Sum of claims in PAID status',
    },

    // Status
    is_prorated: {
      type: 'boolean',
      default: false,
    },
    allocation_notes: {
      type: 'text',
    },

    // Relationships
    claims: {
      type: 'relation',
      relation: 'oneToMany',
      target: 'api::mdf-claim.mdf-claim',
      mappedBy: 'partner_budget',
    },
  },
};
```

### 7.3 Strapi v5 Collection: MDFClaim

```javascript
module.exports = {
  kind: 'collectionType',
  collectionName: 'mdf_claims',
  info: {
    singularName: 'mdf-claim',
    pluralName: 'mdf-claims',
    displayName: 'MDF Claim',
  },
  attributes: {
    // Reference
    claim_reference: {
      type: 'string',
      unique: true,
      description: 'Human-readable claim reference: MDF-2026-Q2-AHM-001',
    },

    // Partner
    partner_budget: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'api::mdf-partner-budget.mdf-partner-budget',
      inversedBy: 'claims',
    },
    partner_id: {
      type: 'string',
      required: true,
    },
    submitted_by_user_id: {
      type: 'string',
      description: 'Portal user who submitted the claim (may differ from partner account)',
    },

    // Activity details
    activity_type: {
      type: 'enumeration',
      enum: ['digital_advertising', 'trade_show', 'in_store_display',
             'email_campaign', 'product_demo', 'staff_training', 'pr_media', 'social_media'],
      required: true,
    },
    activity_name: {
      type: 'string',
      required: true,
      description: 'Campaign / activity name',
    },
    activity_description: {
      type: 'text',
      required: true,
    },
    target_market: {
      type: 'string',
      required: true,
      description: 'Country/region where activity will be executed',
    },
    target_audience: {
      type: 'text',
      required: true,
    },

    // Dates (planned)
    planned_start_date: {
      type: 'date',
      required: true,
    },
    planned_end_date: {
      type: 'date',
      required: true,
    },

    // Dates (actual — filled in post-activity claim)
    actual_start_date: {
      type: 'date',
    },
    actual_end_date: {
      type: 'date',
    },

    // Budget
    planned_amount: {
      type: 'decimal',
      required: true,
    },
    planned_currency: {
      type: 'string',
      required: true,
      description: 'Partner preferred currency (AED, INR, BDT, SAR, USD)',
    },
    planned_amount_usd: {
      type: 'decimal',
      description: 'Converted to USD at time of submission (for budget tracking)',
    },
    actual_amount: {
      type: 'decimal',
      description: 'Actual spend — filled in post-activity claim',
    },
    actual_currency: {
      type: 'string',
    },
    actual_amount_usd: {
      type: 'decimal',
    },
    approved_amount: {
      type: 'decimal',
      description: 'Amount TwinMOS approved for reimbursement',
    },
    approved_amount_usd: {
      type: 'decimal',
    },

    // Expected outcomes (pre-approval)
    expected_reach: {
      type: 'integer',
      description: 'Expected impressions / people reached',
    },
    expected_outcomes: {
      type: 'text',
      description: 'KPIs and expected results',
    },

    // Actual outcomes (post-activity)
    actual_reach: {
      type: 'integer',
    },
    actual_outcomes: {
      type: 'text',
    },

    // Workflow
    status: {
      type: 'enumeration',
      enum: [
        'draft',
        'submitted',
        'more_info_requested',
        'approved',
        'rejected',
        'claim_pending',
        'claim_approved',
        'claim_partial',
        'claim_rejected',
        'payment_processing',
        'paid',
        'expired',
      ],
      required: true,
      default: 'draft',
    },
    submitted_at: {
      type: 'datetime',
    },
    pre_approval_reviewed_at: {
      type: 'datetime',
    },
    pre_approval_reviewer_id: {
      type: 'string',
    },
    pre_approval_notes: {
      type: 'text',
      description: 'Reviewer notes shown to partner',
    },
    claim_submitted_at: {
      type: 'datetime',
    },
    claim_reviewed_at: {
      type: 'datetime',
    },
    claim_reviewer_id: {
      type: 'string',
    },
    claim_reviewer_notes: {
      type: 'text',
    },

    // Payment
    payment_method: {
      type: 'enumeration',
      enum: ['bank_transfer', 'invoice_credit'],
    },
    bank_name: {
      type: 'string',
    },
    bank_account_number: {
      type: 'string',
      description: 'Stored encrypted; last 4 digits visible in UI',
    },
    bank_swift_code: {
      type: 'string',
    },
    bank_iban: {
      type: 'string',
    },
    payment_date: {
      type: 'date',
    },
    payment_reference: {
      type: 'string',
      description: 'Bank transfer reference or credit note number',
    },

    // Documents
    documents: {
      type: 'relation',
      relation: 'oneToMany',
      target: 'api::mdf-document.mdf-document',
      mappedBy: 'claim',
    },
  },
};
```

### 7.4 Strapi v5 Collection: MDFDocument

```javascript
module.exports = {
  kind: 'collectionType',
  collectionName: 'mdf_documents',
  info: {
    singularName: 'mdf-document',
    pluralName: 'mdf-documents',
    displayName: 'MDF Document',
  },
  attributes: {
    claim: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'api::mdf-claim.mdf-claim',
      inversedBy: 'documents',
    },
    document_type: {
      type: 'enumeration',
      enum: [
        'campaign_plan',       // Pre-approval: campaign plan document
        'creative_mockup',     // Pre-approval: ad/email/display creative mockup
        'proof_photo',         // Post-activity: photos of execution
        'proof_screenshot',    // Post-activity: digital screenshots
        'performance_report',  // Post-activity: campaign analytics report
        'attendance_list',     // Post-activity: event/training attendees
        'invoice',             // Post-activity: supplier/platform invoice
        'receipt',             // Post-activity: payment receipt
        'other',               // Any other supporting document
      ],
      required: true,
    },
    file_name: {
      type: 'string',
      required: true,
    },
    file_url: {
      type: 'string',
      required: true,
      description: 'Cloudflare R2 private URL (signed URL for access)',
    },
    file_size_bytes: {
      type: 'biginteger',
    },
    mime_type: {
      type: 'string',
    },
    uploaded_by_user_id: {
      type: 'string',
    },
    uploaded_at: {
      type: 'datetime',
    },
    admin_reviewed: {
      type: 'boolean',
      default: false,
    },
    admin_review_notes: {
      type: 'text',
    },
  },
};
```

### 7.5 Claim Reference Format

```
MDF-{YEAR}-{QUARTER}-{PARTNER_CODE}-{SEQUENCE}

Examples:
  MDF-2026-Q2-SMT-001   (Smart Technologies BD, Q2 2026, first claim)
  MDF-2026-Q1-ACH-003   (Achiever Computers UAE, Q1 2026, third claim)
  MDF-2026-Q3-SUP-007   (Supertron Electronics India, Q3 2026, seventh claim)

Partner code: 3-character alphanumeric abbreviation assigned at onboarding
```

### 7.6 Database Indexes

```sql
-- MDF performance indexes

CREATE INDEX idx_mdf_claim_partner ON mdf_claims(partner_id);
CREATE INDEX idx_mdf_claim_status ON mdf_claims(status);
CREATE INDEX idx_mdf_claim_budget ON mdf_claims(partner_budget_id);
CREATE INDEX idx_mdf_claim_reference ON mdf_claims(claim_reference);
CREATE INDEX idx_mdf_claim_dates ON mdf_claims(planned_start_date, planned_end_date);

CREATE INDEX idx_mdf_budget_partner ON mdf_partner_budgets(partner_id);
CREATE INDEX idx_mdf_budget_quarter ON mdf_partner_budgets(year, quarter);
CREATE INDEX idx_mdf_budget_program ON mdf_partner_budgets(mdf_program_id);

CREATE INDEX idx_mdf_document_claim ON mdf_documents(claim_id);
CREATE INDEX idx_mdf_document_type ON mdf_documents(document_type);
```

---

## 8. MDF Portal Interface

### 8.1 Access

The MDF portal is a section within the TwinMOS Partner Portal:

- **URL:** `/partner/mdf`
- **Authentication:** Partner portal login (Better Auth, partner role)
- **Access control:** Only active partner accounts with at least Bronze tier allocation for the current quarter can access MDF features
- **2FA:** Required for partner portal (mandatory per Partner Portal Spec)

### 8.2 MDF Dashboard (/partner/mdf)

```
┌──────────────────────────────────────────────────────────────────┐
│  Marketing Development Funds — Smart Technologies BD            │
│  Q2 2026 (April – June 2026)              Partner Tier: Silver  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Q2 2026 Budget Overview                                        │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐      │
│  │   Allocated    │ │    Approved    │ │   Available    │      │
│  │   USD 2,000    │ │   USD 1,200    │ │    USD 300     │      │
│  │                │ │   (60% used)   │ │                │      │
│  └────────────────┘ └────────────────┘ └────────────────┘      │
│                                                                  │
│  Budget utilization:  ████████████████████░░░░░░░  85%          │
│  (including pending)                                            │
│                                                                  │
│  [+ SUBMIT NEW CLAIM]                                           │
│                                                                  │
│  ────────────────────────────────────────────────────────────   │
│                                                                  │
│  Active Claims                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ MDF-2026-Q2-SMT-003  │ Google Ads - DDR5 Campaign         │ │
│  │ Status: CLAIM_PENDING │ Submitted: 28 Apr 2026            │ │
│  │ Claimed: USD 800      │ Approved: —                        │ │
│  │ [View Details]                                             │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │ MDF-2026-Q2-SMT-002  │ Dhaka Tech Expo 2026               │ │
│  │ Status: APPROVED      │ Activity: 15-18 May 2026          │ │
│  │ Planned: USD 500      │ Approved: USD 500                  │ │
│  │ [Submit Post-Claim]                                        │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │ MDF-2026-Q2-SMT-001  │ In-Store Display Rollout            │ │
│  │ Status: PAID          │ Payment: 10 Apr 2026              │ │
│  │ Approved: USD 400     │ Method: Invoice Credit             │ │
│  │ [View] [Download Approval Letter]                          │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  [View All Claims →]                                             │
└──────────────────────────────────────────────────────────────────┘
```

### 8.3 Claims List View (/partner/mdf/claims)

Full paginated claims history with filters:

| Filter          | Options                                                   |
|-----------------|-----------------------------------------------------------|
| Status          | All / Active / Pending Review / Approved / Paid / Rejected |
| Quarter         | Q1 2026 / Q2 2026 / Q3 2026 / Q4 2026 / All 2026       |
| Activity Type   | Dropdown of all activity categories                       |
| Date Range      | Submitted date range picker                              |

Columns:

| Column              | Description                              |
|---------------------|------------------------------------------|
| Claim Reference     | MDF-2026-Q2-SMT-003                      |
| Activity Name       | Google Ads - DDR5 Campaign               |
| Activity Type       | Digital Advertising                      |
| Submitted           | 1 Apr 2026                               |
| Planned Amount      | USD 800                                  |
| Approved Amount     | USD 750 (or — if pending)               |
| Status              | Status badge                             |
| Actions             | View / Submit Post-Claim / Download PDF  |

### 8.4 Claim Detail View (/partner/mdf/claims/:id)

Single claim view showing:

1. **Claim Header**: Reference, status, dates, activity type
2. **Pre-Approval Section**: All submitted campaign plan details
3. **Review Decision**: Approved/rejected with reason (if reviewed)
4. **Post-Activity Section**: Actual spend, dates, proof documents (if submitted)
5. **Post-Claim Decision**: Approved amount and reviewer notes (if reviewed)
6. **Payment Details**: Method, date, reference (if paid)
7. **Document Attachments**: Downloadable list of all uploaded documents
8. **Activity Log**: Full history of status changes with timestamps

### 8.5 Claim Approval Letter Download

When a claim reaches CLAIM_APPROVED or PAID status, the partner can download an approval letter PDF:

```
TwinMOS Technologies
Marketing Development Funds — Approval Letter

Date: [approval_date]
To: [partner_company_name]
Attn: [submitted_by_name]

Claim Reference: MDF-2026-Q2-SMT-001
Activity: In-Store Display Rollout
Activity Period: 1–31 March 2026
Claimed Amount: USD 400.00
Approved Amount: USD 400.00

This letter confirms that TwinMOS Technologies has approved the above 
MDF claim. Payment will be processed via [payment_method] within 30 
days of this letter.

[Payment reference / credit note number if applicable]

Authorized Signatory:
[Regional Sales Manager Name]
TwinMOS Technologies

[TwinMOS Logo + Registered Address]
```

PDF is generated server-side, stored in Cloudflare R2, and available for download via a signed URL.

---

## 9. Claim Form Specification

### 9.1 Pre-Approval Form (/partner/mdf/claims/new)

#### 9.1.1 Step 1 — Activity Details

| Field                  | Type         | Required | Validation / Notes                           |
|------------------------|--------------|----------|----------------------------------------------|
| Activity Type          | Select       | Yes      | Dropdown from eligible categories (Section 5)|
| Activity / Campaign Name | Text       | Yes      | Max 200 characters                           |
| Planned Start Date     | Date picker  | Yes      | Must be in the future (at least 5 business days from submission) |
| Planned End Date       | Date picker  | Yes      | Must be after start date; within current quarter |
| Target Market / Country| Select       | Yes      | Partner's authorized territories only        |
| Target Audience Description | Textarea | Yes    | Min 100 characters; description of who will be reached |
| Activity Description   | Textarea     | Yes      | Min 200 characters; what will be done        |
| Expected Reach / Impressions | Number  | Yes   | Estimated audience size                      |
| Expected KPIs / Outcomes | Textarea   | Yes      | What success looks like; measurable outcomes |

#### 9.1.2 Step 2 — Budget

| Field                  | Type         | Required | Validation / Notes                           |
|------------------------|--------------|----------|----------------------------------------------|
| Planned Budget Amount  | Number       | Yes      | Positive number; max 2 decimal places        |
| Currency               | Select       | Yes      | AED, INR, BDT, SAR, USD                      |
| Budget Breakdown       | Textarea     | Yes      | Line-item breakdown of how budget will be spent |
| USD Equivalent         | Calculated   | Display  | Auto-calculated using current exchange rate   |

**Budget validation:**
- Cannot exceed partner's available allocation for the quarter (server-side check)
- Cannot exceed the maximum % of quarterly allocation for the activity type (e.g., EML-001 max 30%)
- Cannot be below USD 50 (minimum claim amount)

#### 9.1.3 Step 3 — Supporting Documents

| Document Type        | Required? | Format Accepted                | Max Size |
|----------------------|-----------|--------------------------------|----------|
| Campaign Plan / SOW  | Yes       | PDF, DOCX                      | 10 MB    |
| Creative Mockups     | Yes (if applicable) | PDF, PNG, JPEG, AI, PSD | 20 MB per file |
| Budget Breakdown     | Yes (if not in form) | PDF, XLSX, DOCX           | 5 MB     |
| Other                | No        | Any                            | 10 MB    |

Maximum total upload: 50 MB per claim.
Documents are uploaded to Cloudflare R2 in a partner-specific private bucket.

#### 9.1.4 Step 4 — Review and Submit

Summary page showing all entered information before submission. Partner confirms:

- [x] I confirm all information provided is accurate
- [x] I confirm this activity has NOT yet been executed (pre-approval required before activity)
- [x] I confirm this activity complies with TwinMOS Brand Guidelines v1.0
- [x] I understand that execution before pre-approval may result in claim rejection

Submit button: [SUBMIT PRE-APPROVAL REQUEST]

### 9.2 Form Validation Summary

```
Client-side validation (real-time):
  ├── Required field checks
  ├── Date range validation (start < end, within quarter)
  ├── Budget: positive number, max 2 decimal places
  └── File type and size checks before upload

Server-side validation (on submit):
  ├── Partner session valid + active partner status
  ├── Available allocation check (budget - approved - pending >= requested amount)
  ├── Activity type allowed for partner's tier/region
  ├── Dates not in the past (planned_start >= today + 5 business days)
  ├── Document upload virus scan (ClamAV or equivalent)
  └── Duplicate claim check (same activity type, same dates)
```

---

## 10. Post-Activity Claim Form

After the approved activity is completed, the partner submits a post-activity claim to request payment. This is accessed from the claim detail view when status = APPROVED.

**Deadline:** Post-activity claim must be submitted within **30 days** of the activity's planned end date. Claims submitted after 30 days are rejected with status EXPIRED.

### 10.1 Post-Activity Additional Fields

| Field                        | Type        | Required | Notes                                              |
|------------------------------|-------------|----------|----------------------------------------------------|
| Actual Start Date            | Date picker | Yes      | Actual activity start (may differ from planned)    |
| Actual End Date              | Date picker | Yes      | Actual activity end date                           |
| Actual Spend Amount          | Number      | Yes      | Total actual expenditure                           |
| Actual Currency              | Select      | Yes      | AED, INR, BDT, SAR, USD                            |
| Actual Reach / Impressions   | Number      | Yes      | Actual audience reached                            |
| Actual Outcomes / Results    | Textarea    | Yes      | Results vs. expected KPIs; min 100 characters      |
| Additional Activity Notes    | Textarea    | No       | Any deviations from the pre-approved plan          |

### 10.2 Post-Activity Documents (Proof of Performance)

| Document Type               | Required? | Description                                     |
|-----------------------------|-----------|------------------------------------------------|
| Proof photos (in-person)    | Yes (for EVT, INS, DEM, TRN) | Photos showing TwinMOS branding at event/store |
| Screenshots (digital)       | Yes (for DIG, EML, SOC) | Ad screenshots, email screenshot, social posts |
| Performance report          | Yes (for DIG, EML, SOC) | Analytics export from Google Ads, Meta, etc.   |
| Attendance list             | Yes (for EVT, DEM, TRN) | List of attendees (names; count)                |
| Invoices                    | Yes       | All supplier / platform invoices matching spend |
| Receipts                    | Yes       | Payment receipts for all expenses               |

### 10.3 Payment Details Section

| Field                      | Shown When                  | Required |
|----------------------------|-----------------------------|----------|
| Payment Method             | Always                      | Yes      |
| Bank Name                  | Method = bank_transfer      | Yes      |
| Account Holder Name        | Method = bank_transfer      | Yes      |
| Account Number / IBAN      | Method = bank_transfer      | Yes      |
| SWIFT / BIC Code           | Method = bank_transfer      | Yes      |
| Branch Address             | Method = bank_transfer      | No       |
| Invoice Credit Note        | Method = invoice_credit     | Auto (TwinMOS generates) |

**Bank details security:**
- Account numbers stored encrypted (AES-256) in PostgreSQL
- Only last 4 characters visible in UI after submission
- Bank details change request requires re-verification (email confirmation from partner account holder)

### 10.4 Post-Activity Submission Confirmation

```
[Submit Post-Activity Claim]

Before submitting, please confirm:
  [x] The activity was completed as described
  [x] All invoices and receipts are included
  [x] TwinMOS branding was used in compliance with Brand Guidelines v1.0
  [x] The actual spend does not exceed the pre-approved amount
      (Note: If actual spend is higher, only the approved amount is reimbursable)
```

---

## 11. Admin Portal Features

### 11.1 Admin Access

MDF admin features are available within the Strapi v5 admin panel and are role-restricted:

| Admin Role              | Access Level                                               |
|-------------------------|------------------------------------------------------------|
| Regional Sales Manager  | View/approve claims for their region; cannot adjust budgets |
| Marketing Director      | Full access: budgets, all claims, program setup            |
| Finance Admin           | Payment processing; export reports; cannot approve claims  |
| Channel Manager         | View-only; can add notes; cannot approve/reject            |
| IT Admin (Superadmin)   | Full access including program configuration                |

### 11.2 Admin MDF Dashboard

```
TwinMOS MDF Admin — 2026 Program
──────────────────────────────────────────────────────────────────
Program Status: ACTIVE         Q2 2026 (Apr–Jun 2026)

Budget Overview (Global):
  Total Annual Budget:    USD 500,000
  Q2 Allocated:           USD 125,000  (25% of annual)
  Q2 Approved:            USD  87,000  (69.6% utilization)
  Q2 Pending Review:      USD  22,000
  Q2 Available:           USD  16,000

By Region (Q2):
  MEA:         USD 50,000 alloc  │  USD 38,200 approved  │  76.4%
  South Asia:  USD 37,500 alloc  │  USD 29,800 approved  │  79.5%
  CIS:         USD 18,750 alloc  │  USD 12,000 approved  │  64.0%
  Other:       USD 18,750 alloc  │   USD 7,000 approved  │  37.3%

Claims Awaiting Review:
  Pre-approval pending:   8 claims  (oldest: 3 days)
  Post-claim pending:     4 claims  (oldest: 6 days)

[VIEW PENDING CLAIMS]  [EXPORT REPORT]  [MANAGE PROGRAM]
──────────────────────────────────────────────────────────────────
```

### 11.3 Pre-Approval Review Interface

When reviewing a pre-approval request, the admin sees:

```
Claim: MDF-2026-Q2-SMT-003
Partner: Smart Technologies BD (Silver)
Submitted: 1 Apr 2026 (4 days ago — SLA: 1 day remaining)

Activity Details:
  Type: Digital Advertising (Google Ads)
  Name: DDR5 RAM Awareness Campaign — Bangladesh
  Target Market: Bangladesh
  Period: 15 Apr – 30 Jun 2026
  Target Audience: PC gamers and enthusiasts, 18–35, Bangladesh

Description:
  Google Search + Display campaign targeting DDR5 RAM keywords
  in Bangladesh. Campaign will feature VOLTX DDR5 product line
  with link to TwinMOS Bangladesh product page.

Budget Request: BDT 80,000 ≈ USD 729
  Breakdown:
    Google Ads spend:       BDT 65,000
    Campaign management:    BDT 10,000
    Creative production:    BDT  5,000

Documents: [campaign_plan.pdf] [creative_mockup.png] [budget_breakdown.xlsx]

Partner Available Budget (Q2): USD 300
Request USD: 729 ⚠️ EXCEEDS AVAILABLE BUDGET

Decision:
  [APPROVE — Full Amount]  [APPROVE — Partial Amount: ___]
  [REQUEST MORE INFORMATION: ___________________________]
  [REJECT: ______________________________________________]

Admin Notes (shown to partner if not approved):
  ________________________________________________________________
```

### 11.4 Post-Activity Verification Interface

```
Post-Activity Claim: MDF-2026-Q2-SMT-003
Pre-approval: APPROVED — USD 729 on 6 Apr 2026

Post-Activity Submission: 5 May 2026
Actual Period: 15 Apr – 30 Apr 2026
Actual Spend Claimed: BDT 75,000 ≈ USD 683

Performance Summary:
  Actual reach/impressions: 142,000
  Expected: 100,000 ✓ Exceeded target

Documents Checklist:
  [x] Invoice — Google Ads (BDT 62,000)      [reviewed] ✓
  [x] Invoice — Agency fee (BDT 8,500)       [reviewed] ✓
  [x] Google Ads performance report          [reviewed] ✓
  [x] Screenshots — ad creatives             [reviewed] ✓
  [ ] Receipt for creative production        ⚠️ MISSING

TwinMOS Logo / Brand Compliance:
  [x] All ad creatives use approved TwinMOS logo
  [x] Product names spelled correctly
  [x] No unauthorized comparison claims

Invoices verified: Yes
  Claimed: USD 683 / Invoiced: USD 638 → Use invoiced amount: USD 638

Decision:
  [APPROVE — USD 638 (invoiced amount)]
  [APPROVE — Custom Amount: ___]
  [REQUEST MORE INFO: _______________]
  [REJECT: __________________________]

Reviewer Notes (shown to partner):
  "Approved at invoiced amount USD 638. Creative production receipt
   was not submitted; please include for future claims."
```

### 11.5 Budget Adjustment

Admin can modify a partner's quarterly allocation:

| Action                    | Who Can Do It          | Audit Required |
|---------------------------|------------------------|----------------|
| Increase partner allocation| Marketing Director     | Yes — reason required |
| Decrease partner allocation| Marketing Director     | Yes — reason + partner notification |
| Transfer budget between partners | Marketing Director | Yes            |
| Add emergency budget      | Marketing Director + CFO approval | Yes    |

### 11.6 Annual Program Setup

At the start of each year, Marketing Director creates the new MDF Program record:

1. Define fiscal year, total global budget
2. Set regional allocation percentages
3. Set tier allocation caps per quarter
4. Activate program

The system then generates `MDFPartnerBudget` records for all active partners based on:
- Partner tier at program start date
- Regional allocation
- Tier cap

Budget assignments can be manually adjusted per partner after initial generation.

### 11.7 Export Capabilities

| Report                               | Format | Frequency    | Recipient          |
|--------------------------------------|--------|--------------|--------------------|
| All Claims Summary                   | Excel  | On-demand    | Admin              |
| Claims Awaiting Review               | Excel  | Daily (auto) | Regional Sales Mgr |
| Budget Utilization by Region         | Excel  | Monthly      | Marketing Director |
| Budget Utilization by Partner        | Excel  | Monthly      | Marketing Director |
| Finance Payment Report               | Excel  | Monthly      | Finance Team       |
| Approved Claims (for payment batch)  | Excel  | Weekly       | Finance Team       |
| Annual MDF ROI Summary               | Excel  | Annually     | Marketing Director + CFO |

---

## 12. Email Notifications

### 12.1 Email Templates Overview

All MDF emails are sent via Resend to the partner's registered email address (and CC to their TwinMOS Regional Sales Manager where noted).

| Template ID               | Trigger                                          | Recipient             | CC                   |
|---------------------------|--------------------------------------------------|-----------------------|----------------------|
| MDF_SUBMIT_CONFIRM_V1     | Partner submits pre-approval                     | Partner               | Regional Sales Mgr   |
| MDF_MORE_INFO_V1          | Admin requests more information                  | Partner               | —                    |
| MDF_PRE_APPROVED_V1       | Pre-approval approved                            | Partner               | Regional Sales Mgr   |
| MDF_PRE_REJECTED_V1       | Pre-approval rejected                            | Partner               | Regional Sales Mgr   |
| MDF_CLAIM_REMINDER_V1     | 14 days before post-claim deadline               | Partner               | Regional Sales Mgr   |
| MDF_CLAIM_CONFIRM_V1      | Partner submits post-activity claim              | Partner               | Regional Sales Mgr   |
| MDF_CLAIM_APPROVED_V1     | Post-activity claim approved                     | Partner               | Finance Admin        |
| MDF_CLAIM_PARTIAL_V1      | Post-activity claim partially approved           | Partner               | Finance Admin        |
| MDF_CLAIM_REJECTED_V1     | Post-activity claim rejected                     | Partner               | Regional Sales Mgr   |
| MDF_PAYMENT_CONFIRM_V1    | Payment processed                                | Partner               | Finance Admin        |
| MDF_BUDGET_WARNING_V1     | Partner's budget 80% utilized                    | Partner               | Regional Sales Mgr   |
| MDF_SLA_ALERT_V1          | Internal: claim approaching SLA deadline         | Regional Sales Mgr    | Marketing Director   |

### 12.2 Email Template Content

#### MDF_SUBMIT_CONFIRM_V1 — Submission Confirmation

**Subject:** `MDF Pre-Approval Submitted — {claim_reference}`

```
Dear {partner_contact_name},

Thank you for submitting your MDF pre-approval request.

Claim Reference:    {claim_reference}
Activity:           {activity_name}
Planned Period:     {planned_start_date} – {planned_end_date}
Requested Amount:   {planned_amount} {planned_currency}

What happens next:
Your request is under review by the TwinMOS regional team.
You will receive a decision within 5 business days.

You can track your claim status in the Partner Portal:
[VIEW CLAIM STATUS]

Important: Please do not begin the marketing activity until you
receive formal pre-approval.

Best regards,
TwinMOS Channel Marketing Team
```

#### MDF_PRE_APPROVED_V1 — Pre-Approval Granted

**Subject:** `MDF Pre-Approval APPROVED — {claim_reference}`

```
Dear {partner_contact_name},

Great news! Your MDF pre-approval request has been approved.

Claim Reference:    {claim_reference}
Activity:           {activity_name}
Approved Amount:    {approved_amount} {currency}
Approved Period:    {planned_start_date} – {planned_end_date}

Reviewer Notes:
{pre_approval_notes}

You may now proceed with executing the approved activity.

Important reminders:
  ✓ Execute only what was approved — changes require a new request
  ✓ Use TwinMOS branding per Brand Guidelines v1.0
  ✓ Collect all invoices and proof of execution
  ✓ Submit your post-activity claim within 30 days of the activity end date

Post-claim deadline: {claim_deadline}  ← {planned_end_date + 30 days}

[DOWNLOAD APPROVAL LETTER]  [VIEW PORTAL]
```

#### MDF_CLAIM_APPROVED_V1 — Post-Activity Claim Approved

**Subject:** `MDF Claim Approved — Payment Processing — {claim_reference}`

```
Dear {partner_contact_name},

Your post-activity MDF claim has been approved and payment 
is being processed.

Claim Reference:    {claim_reference}
Activity:           {activity_name}
Approved Amount:    {approved_amount} {currency}
Payment Method:     {payment_method}
Expected Payment:   Within 30 days (by {payment_deadline})

{IF payment_method == 'invoice_credit'}
  A credit note of {approved_amount} {currency} will be applied
  to your next TwinMOS purchase invoice.
{ENDIF}

{IF payment_method == 'bank_transfer'}
  Payment will be transferred to your registered bank account
  (ending in {bank_last_4}).
{ENDIF}

[DOWNLOAD APPROVAL LETTER]

Best regards,
TwinMOS Finance Team
```

#### MDF_BUDGET_WARNING_V1 — 80% Budget Warning

**Subject:** `Action Required — Your MDF budget is 80% utilized`

```
Dear {partner_contact_name},

This is a notification that your MDF budget for Q{quarter} {year}
is now 80% utilized.

Q{quarter} {year} Budget Summary:
  Allocated:         {allocated_amount} USD
  Approved/Used:     {approved_amount} USD
  Remaining:         {available_amount} USD

If you have planned marketing activities for the rest of the quarter,
please submit your pre-approval requests as soon as possible.

Remaining budget must be committed by {quarter_end_date}
and claims submitted by {claim_deadline}.

[SUBMIT NEW CLAIM]  [VIEW PORTAL]
```

#### MDF_SLA_ALERT_V1 — Internal SLA Alert (to Admin)

**Subject:** `[INTERNAL] MDF Claim SLA Alert — {claim_reference}`

```
This is an automated SLA alert.

Claim: {claim_reference}
Partner: {partner_company_name}
Type: {pre_approval OR post_claim} review
Submitted: {submitted_at}
SLA Deadline: {sla_deadline}
Days Overdue: {days_past_sla}

Please review this claim immediately.

[OPEN IN ADMIN PORTAL]
```

---

## 13. Compliance and Brand Guidelines

### 13.1 TwinMOS Brand Compliance Requirements

All MDF-funded marketing activities must comply with TwinMOS Brand Guidelines v1.0 (TWN-BRAND-2025-001). The following are key requirements partners must adhere to:

| Requirement                            | Detail                                                    |
|----------------------------------------|-----------------------------------------------------------|
| Logo usage                             | Only approved TwinMOS logo files; no distortion, recoloring, or cropping |
| Minimum logo clear space               | Per Brand Guidelines v1.0 (clear space = height of T in logo) |
| Color palette                          | TwinMOS brand colors only; no competitor color adjacency  |
| Product naming                         | Exact product names as per official product catalog (e.g., "VOLTX DDR5", not "VoltX DDR 5") |
| Taglines                               | Only approved taglines; no partner-created TwinMOS taglines without approval |
| Comparative claims                     | No comparative advertising ("faster than X") without Marketing Director approval |
| Endorsement claims                     | No "recommended by" or "fastest in class" without approved documentation |
| Language and translations              | All translated materials must be reviewed by TwinMOS regional marketing before use |
| Approved marketing materials           | TwinMOS provides a partner asset library; partners should use approved assets |

### 13.2 Brand Compliance Verification

During post-activity claim review:

- Admin reviews all submitted photos and screenshots for brand compliance
- Non-compliant materials result in partial or full claim rejection
- First offense: warning + claim partial approval (non-compliant portion rejected)
- Repeat offense: claim rejection + partner placed on MDF probation (next quarter allocation reduced 50%)

### 13.3 Audit Trail

All MDF claim actions are logged with:

- **Who:** Admin user ID or partner user ID
- **What:** Action taken (created, submitted, approved, rejected, payment_processed, etc.)
- **When:** Timestamp (UTC)
- **Details:** Previous status → new status + any notes

The audit log is immutable (append-only) and retained for 7 years per financial record requirements.

### 13.4 Financial Audit Requirements

For Finance audit compliance:

- Every approved claim must have corresponding invoices matching the approved amount
- If invoiced amount differs from claimed amount, the lesser is approved
- All payments require a purchase order or credit note reference
- Finance can export full claim records with documents for external audit
- Bank details are stored encrypted; access to decrypted bank details is logged and requires Finance Admin role

---

## 14. Analytics and ROI Tracking

### 14.1 Program-Level Analytics

| Metric                          | Formula                                             | Target          |
|---------------------------------|-----------------------------------------------------|-----------------|
| Budget utilization rate         | Total approved / Total allocated                    | 80–95%          |
| Claim approval rate             | Approved claims / Total claims submitted            | > 75%           |
| Average claims turnaround       | AVG(reviewed_at – submitted_at) in business days   | < 4 days        |
| Top activity types by spend     | SUM(approved_amount) grouped by activity_type       | Tracked         |
| Partner MDF utilization         | Partners who used > 50% of allocation / all partners | > 70%          |
| Claims per partner              | Claims per active MDF partner                       | Tracked         |
| Partial approval rate           | Partially approved / total approved                 | < 20%           |
| Average claim size              | AVG(approved_amount_usd)                            | Tracked         |

### 14.2 ROI Tracking Framework

MDF program ROI is evaluated by correlating partner marketing activity with their subsequent purchase volume. This is a lagging indicator tracked quarterly.

```
MDF ROI Measurement (Per Partner, Post-Campaign):

1. Baseline: Partner's purchase volume in the 3 months before the campaign
2. Campaign period: MDF activity dates
3. Post-campaign: Partner's purchase volume in the 3 months after the campaign

ROI Calculation:
  Sales Lift = Post_Campaign_Volume - Baseline_Volume
  MDF Investment = Total MDF approved amount for that partner's campaign
  ROI = (Sales Lift × TwinMOS Gross Margin) / MDF Investment

Example:
  Baseline (Q1): USD 120,000 partner purchases
  Campaign: Google Ads, USD 800 MDF, April 2026
  Post-campaign (Q2): USD 145,000 partner purchases
  Lift: USD 25,000
  GM (approx 30%): USD 7,500
  ROI: USD 7,500 / USD 800 = 9.4x
```

**Limitation:** Sales lift cannot be solely attributed to MDF activity (other factors affect partner sales). ROI tracking provides a directional signal, not causal proof. Tracked per-campaign for all activity types where correlation analysis is feasible.

### 14.3 PostHog Events (Internal Analytics)

| Event Name                    | Properties                                                 |
|-------------------------------|-------------------------------------------------------------|
| `mdf_claim_submitted`         | partner_id, claim_reference, activity_type, amount_usd, tier |
| `mdf_claim_approved`          | claim_reference, approved_amount_usd, reviewer_id          |
| `mdf_claim_rejected`          | claim_reference, rejection_reason, reviewer_id             |
| `mdf_claim_partial_approved`  | claim_reference, claimed_usd, approved_usd, reason          |
| `mdf_payment_processed`       | claim_reference, amount_usd, payment_method                |
| `mdf_budget_warning_sent`     | partner_id, utilization_pct, remaining_usd                 |
| `mdf_portal_page_view`        | partner_id, page, quarter                                   |

### 14.4 Finance Reporting

Monthly Finance report includes:

```
MDF Finance Summary — April 2026
─────────────────────────────────────────────────────────────────
Claims Approved This Month:        12 claims
Total Approved Amount (USD):       USD 18,400
  - Bank Transfer:                 USD 12,000  (8 claims)
  - Invoice Credit:                USD  6,400  (4 claims)

Payments Processed This Month:     10 claims
Total Paid (USD):                  USD 14,800

Outstanding Approved / Not Yet Paid: 2 claims = USD 3,600
Oldest outstanding (days):         8 days

Budget Utilization (Q2 2026):
  Global:      USD 87,000 / USD 125,000 alloc = 69.6%
  MEA:         USD 38,200 / USD 50,000 = 76.4%
  South Asia:  USD 29,800 / USD 37,500 = 79.5%
─────────────────────────────────────────────────────────────────
```

---

## 15. Business Rules

### BR-MDF-001 — Pre-Approval is Mandatory

Partners must receive formal pre-approval from TwinMOS before executing any MDF-funded activity. Activities executed before receiving a pre-approval decision are ineligible for reimbursement regardless of the subsequent outcome.

### BR-MDF-002 — Budget Availability Check at Submission

At the time of pre-approval submission, the system must verify that the requested amount does not exceed the partner's `available_amount_usd` for the current quarter. If insufficient budget exists, the submission is rejected with an informative message showing available balance.

### BR-MDF-003 — Quarterly Budget Expiry

MDF allocations are quarterly. Unused allocations at quarter-end expire and return to the regional pool. Partners are notified when 80% of their quarterly budget is utilized to encourage timely planning.

### BR-MDF-004 — Post-Activity Claim Deadline

Post-activity claims must be submitted within 30 calendar days of the activity's planned end date (as recorded in the pre-approval). Claims submitted after this window are automatically expired (status: EXPIRED) and not eligible for reimbursement.

### BR-MDF-005 — Actual Spend vs. Approved Amount

If a partner's actual spend exceeds the pre-approved amount, only the approved amount is reimbursable. Excess spend is the partner's responsibility. If actual spend is less than approved, the approved amount is adjusted to the actual spend (partners cannot claim more than they actually spent).

### BR-MDF-006 — Invoice Requirement for All Claims

Every post-activity claim must include invoices and/or receipts covering the total claimed amount. Claims without complete invoice documentation will be partially approved (only invoice-supported amounts) or rejected.

### BR-MDF-007 — Brand Guideline Compliance

All MDF-funded activities must comply with TwinMOS Brand Guidelines v1.0. Materials submitted as proof of execution that violate brand guidelines may result in partial or full claim rejection. Repeated violations may result in reduced future allocations.

### BR-MDF-008 — Single Reviewer Assignment

Each claim is assigned to a single reviewer (Regional Sales Manager for their region). Claims should not be reviewed by the partner's own account manager without a second reviewer sign-off (conflict of interest prevention for claims above USD 1,000).

### BR-MDF-009 — Pre-Approval Scope is Binding

The approved activity type, target market, and general campaign scope cannot be materially changed after pre-approval. If the partner needs to change the scope (e.g., different platforms, different market), a new pre-approval request is required. Minor date adjustments within the same quarter can be submitted as a change request via the portal.

### BR-MDF-010 — Minimum Claim Amount

The minimum MDF claim amount is USD 50 (or local currency equivalent). Claims below this threshold are rejected. This prevents administrative overhead from micro-claims.

### BR-MDF-011 — Payment Timeline

TwinMOS Finance must process approved payments within 30 calendar days of claim approval. The Finance team receives weekly export of approved claims to batch payments efficiently.

### BR-MDF-012 — Invoice Credit Priority

When a partner selects invoice credit as the payment method, the credit is applied to the partner's next purchase invoice as a line item deduction. If the credit exceeds the next invoice value, the excess is carried forward to subsequent invoices (not paid as cash).

### BR-MDF-013 — Bank Detail Security

Partner bank account details submitted for payment are encrypted at rest. Only Finance Admin role can view decrypted bank details. Any change to bank details requires email re-confirmation by the partner account holder. All bank detail access is audit-logged.

### BR-MDF-014 — Concurrent Claims Limit

A partner may have a maximum of 5 active (non-PAID, non-REJECTED, non-EXPIRED) claims at any one time. Attempting to submit a 6th concurrent claim returns an error. This prevents budget over-commitment and ensures quality of claim submissions.

### BR-MDF-015 — Employee Exclusion

TwinMOS employees, contractors, and their immediate family members are ineligible to act as partners in the MDF program. Any claim submitted by an employee-linked entity is automatically flagged for management review.

### BR-MDF-016 — Unauthorized Territory Restriction

MDF activities must be executed only within the partner's authorized sales territory as defined in their partner agreement. Claims for activities executed outside the authorized territory are rejected. Territory is validated at pre-approval submission.

### BR-MDF-017 — Partner Status Eligibility Check

At the time of pre-approval submission (not at time of claim payment), the partner must be in Active status. If a partner's status changes to Suspended or Terminated after pre-approval is granted but before payment, payment is withheld pending resolution of the status issue.

### BR-MDF-018 — SLA Escalation

If a pre-approval review exceeds 5 business days without a decision, the system automatically sends an SLA alert to the Regional Sales Manager's manager (Marketing Director). If a post-activity claim review exceeds 10 business days, a similar escalation is triggered.

### BR-MDF-019 — MDF Data Retention

All MDF claim records, documents, and audit logs must be retained for 7 years per financial audit requirements. Documents are stored in Cloudflare R2 with versioning enabled. Partners cannot delete their own submitted documents.

### BR-MDF-020 — Program Modification Notice

TwinMOS may modify MDF program rules, allocation amounts, or eligible activity categories at any time. Partners are notified of changes with 60 days' notice where possible, or 30 days' minimum notice for material changes affecting existing allocations.

---

## 16. Acceptance Criteria

### 16.1 Partner Portal — MDF Dashboard

- [x] AC-MDF-001: An active Silver partner in Q2 2026 sees a budget overview showing allocated, approved, and available amounts
- [x] AC-MDF-002: A partner with no allocation for the current quarter sees a message explaining eligibility requirements
- [x] AC-MDF-003: Budget utilization bar reflects allocated, approved, and pending amounts correctly
- [x] AC-MDF-004: Partners with 80%+ budget utilized see a utilization warning on the dashboard

### 16.2 Pre-Approval Submission

- [x] AC-MDF-005: Partner can submit a pre-approval request with all required fields
- [x] AC-MDF-006: Submitting a request exceeding available balance returns a validation error
- [x] AC-MDF-007: Planned start date cannot be less than 5 business days from submission date
- [x] AC-MDF-008: File upload rejects files above size limits and unsupported formats
- [x] AC-MDF-009: A submitted claim generates a unique claim reference in the format MDF-YYYY-QN-PPP-NNN
- [x] AC-MDF-010: Partner receives a submission confirmation email within 5 minutes of submission
- [x] AC-MDF-011: Pending claim amount is deducted from partner's available budget immediately on submission

### 16.3 Pre-Approval Review (Admin)

- [x] AC-MDF-012: Admin can view all claims in their region with status filter and date filter
- [x] AC-MDF-013: Admin can approve a claim in full with optional notes
- [x] AC-MDF-014: Admin can approve a claim for a partial (lesser) amount with mandatory reason
- [x] AC-MDF-015: Admin can request more information; partner receives a notification email
- [x] AC-MDF-016: Admin can reject a claim with a mandatory rejection reason
- [x] AC-MDF-017: SLA alert is triggered if claim is not reviewed within 4 business days (1 day before SLA)

### 16.4 Post-Activity Claim

- [x] AC-MDF-018: Partner with status APPROVED can submit a post-activity claim
- [x] AC-MDF-019: Post-activity claim submission is blocked if more than 30 days after planned end date
- [x] AC-MDF-020: Post-activity claim requires at least one proof document and one invoice document
- [x] AC-MDF-021: Partner can upload up to 50 MB total documents across all document types
- [x] AC-MDF-022: Partner receives a claim submission confirmation email
- [x] AC-MDF-023: A post-activity claim with actual amount > approved amount is automatically capped at approved amount

### 16.5 Post-Activity Claim Review (Admin)

- [x] AC-MDF-024: Admin can view all uploaded documents inline without downloading
- [x] AC-MDF-025: Admin can approve the full claimed amount or a lesser amount
- [x] AC-MDF-026: Admin can reject with mandatory reason
- [x] AC-MDF-027: Approval updates partner budget: approved_amount_usd and paid_amount_usd
- [x] AC-MDF-028: Partner receives approval/partial/rejection email within 5 minutes of decision

### 16.6 Payment

- [x] AC-MDF-029: Finance admin can export a weekly list of approved-but-unpaid claims to Excel
- [x] AC-MDF-030: Finance admin can mark a claim as PAID with payment date and reference
- [x] AC-MDF-031: Partner receives a payment confirmation email when status changes to PAID
- [x] AC-MDF-032: Partner can download the approval letter PDF when claim is CLAIM_APPROVED or PAID
- [x] AC-MDF-033: Bank account numbers are masked in UI (only last 4 characters visible)

### 16.7 Budget and Program Management

- [x] AC-MDF-034: Marketing Director can create a new annual MDF program with global budget and regional splits
- [x] AC-MDF-035: System auto-generates partner budget records for all active partners at program creation
- [x] AC-MDF-036: Admin can manually adjust a partner's quarterly allocation with a required reason
- [x] AC-MDF-037: A partner with > 5 active non-terminal claims cannot submit a new claim
- [x] AC-MDF-038: Admin can generate a monthly budget utilization report by region in Excel format
- [x] AC-MDF-039: Quarterly budget expiry job runs at quarter-end and returns unused amounts to regional pool

---

## 17. Appendix

### 17.1 Claim Reference Generation

```typescript
// Claim reference generation

async function generateClaimReference(
  partnerId: string,
  year: number,
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4'
): Promise<string> {
  // Get partner's 3-char code (assigned at onboarding, stored on partner record)
  const partner = await getPartnerById(partnerId);
  const partnerCode = partner.mdf_partner_code.toUpperCase(); // e.g. 'SMT'

  // Get next sequence number for this partner in this quarter
  const existingClaims = await strapi.entityService.count(
    'api::mdf-claim.mdf-claim',
    {
      filters: {
        partner_id: partnerId,
        claim_reference: { $startsWith: `MDF-${year}-${quarter}-${partnerCode}-` }
      }
    }
  );

  const sequence = String(existingClaims + 1).padStart(3, '0');
  return `MDF-${year}-${quarter}-${partnerCode}-${sequence}`;

  // e.g. MDF-2026-Q2-SMT-001
}
```

### 17.2 Currency Exchange Rate Handling

MDF claims can be submitted in local currency (AED, INR, BDT, SAR) but budgets are tracked in USD:

- Exchange rates are fetched from a currency API (e.g., Open Exchange Rates) at the time of claim submission
- The USD equivalent is stored on the claim at submission time and does not change if exchange rates fluctuate
- Finance approves and pays in the local currency at the agreed amount; USD tracking is for internal budget management only

```typescript
interface ExchangeRateSnapshot {
  base: 'USD';
  rates: Record<string, number>;
  fetched_at: Date;
}

// USD amounts stored for budget tracking
planned_amount_usd = planned_amount / exchange_rate_to_usd[planned_currency]
```

### 17.3 Partner Tier Mapping to MDF Allocation

| Partner MDF Tier | Purchase Volume (per quarter, USD) | Max MDF (per quarter, USD) |
|------------------|------------------------------------|---------------------------|
| Bronze           | < 50,000                           | 500                       |
| Silver           | 50,000 – 199,999                   | 2,000                     |
| Gold             | 200,000+                           | 5,000                     |

**Named Partners Reference:**

| Partner Name               | Country     | Tier   | Q2 2026 Allocation |
|----------------------------|-------------|--------|--------------------|
| Smart Technologies BD      | Bangladesh  | Silver | USD 2,000          |
| Achiever Computers UAE     | UAE         | Gold   | USD 5,000          |
| Supertron Electronics India| India       | Gold   | USD 5,000          |
| (MEA distributors — TBD)   | Various MEA | Varies | Per tier cap       |

### 17.4 MDF Document Storage Architecture

```
Cloudflare R2 Bucket: twinmos-mdf-documents (private)
│
├── 2026/
│   ├── Q1/
│   │   └── {partner_id}/
│   │       └── {claim_reference}/
│   │           ├── pre-approval/
│   │           │   ├── campaign_plan.pdf
│   │           │   └── creative_mockup.png
│   │           └── post-claim/
│   │               ├── invoice_google_ads.pdf
│   │               ├── performance_report.pdf
│   │               └── screenshot_ad_01.png
│   └── Q2/
│       └── ...

Access: Signed URLs with 1-hour expiry for partner download
Retention: 7 years (do not delete even if partner account closed)
Versioning: Enabled (immutable audit trail)
```

### 17.5 Revision History

| Version | Date       | Author                   | Changes                          |
|---------|------------|--------------------------|----------------------------------|
| 1.0     | 2026-05-01 | TwinMOS Digital Product  | Initial draft                    |

### 17.6 Open Questions

| ID     | Question                                                                            | Owner               | Due         |
|--------|-------------------------------------------------------------------------------------|---------------------|-------------|
| OQ-001 | Finance: Confirm the quarterly budget expiry rule — does unused budget fully expire or partially roll over? | CFO / Finance | 2026-05-15 |
| OQ-002 | Legal: Does the MDF approval letter need to be a legally signed document or is a digital approval confirmation sufficient? | Legal | 2026-05-15 |
| OQ-003 | Sales: Confirm partner code assignment process — who assigns the 3-char code and when? | Channel Manager | 2026-05-15 |
| OQ-004 | Engineering: Confirm whether Strapi can store and serve signed Cloudflare R2 URLs for document download | Eng Lead | 2026-05-15 |
| OQ-005 | Finance: Which currency API will be used for USD conversion rate? Who manages API keys? | Finance / IT | 2026-05-15 |
| OQ-006 | Sales: Should the post-activity claim deadline (30 days) be calendar days or business days? | Sales / Finance | 2026-05-30 |
| OQ-007 | Marketing: Should the MDF portal send WhatsApp notifications to partners in addition to email (relevant for BD and India markets)? | Marketing | 2026-05-30 |

---

*Document Reference: TWN-P3-MDF-2026-001 | Version 1.0 | TwinMOS Technologies*
