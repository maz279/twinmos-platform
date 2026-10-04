# TwinMOS Technologies — Loyalty Program Functional Specification

| Field            | Value                                     |
|------------------|-------------------------------------------|
| Document Ref     | TWN-P3-LOYAL-2026-001                     |
| Version          | 1.0                                       |
| Status           | Draft — Pending Marketing Approval        |
| Phase            | Phase 3 — Commerce and Advanced Features  |
| Author           | TwinMOS Digital Product Team              |
| Date             | 2026-05-01                                |
| Reviewed By      | TBD                                       |
| Approved By      | TBD                                       |

---

## Table of Contents

1. [Document Purpose and Scope](#1-document-purpose-and-scope)
2. [Program Overview and Philosophy](#2-program-overview-and-philosophy)
3. [System Architecture](#3-system-architecture)
4. [Tier Structure](#4-tier-structure)
5. [Points Earning Rules](#5-points-earning-rules)
6. [Points Redemption Rules](#6-points-redemption-rules)
7. [Points Expiry Policy](#7-points-expiry-policy)
8. [Data Model](#8-data-model)
9. [Lifecycle Hooks and Event Handling](#9-lifecycle-hooks-and-event-handling)
10. [Admin Features](#10-admin-features)
11. [Customer-Facing UI](#11-customer-facing-ui)
12. [Email Communications](#12-email-communications)
13. [Fraud Prevention](#13-fraud-prevention)
14. [Analytics and Reporting](#14-analytics-and-reporting)
15. [Business Rules](#15-business-rules)
16. [Acceptance Criteria](#16-acceptance-criteria)
17. [Phase 4 Considerations](#17-phase-4-considerations)
18. [Appendix](#18-appendix)

---

## 1. Document Purpose and Scope

### 1.1 Purpose

This specification defines the complete functional requirements for the TwinMOS Rewards loyalty program. The loyalty program is designed to reward repeat buyers, drive higher average order values (AOV), and build long-term brand advocacy among TwinMOS customers across all five regional markets: UAE, India, Bangladesh, KSA, and International (USD).

This document is the authoritative reference for:

- **Back-end engineers** implementing the loyalty engine in Strapi v5 and Medusa.js v2
- **Front-end engineers** implementing loyalty UI components in Astro 5
- **QA engineers** writing test scenarios against the business rules and acceptance criteria
- **Marketing team** understanding the program structure for campaign planning
- **Finance team** understanding the points liability and redemption cost model
- **Customer support** understanding customer-facing program rules

### 1.2 Scope

This specification covers:

- The "TwinMOS Rewards" program name and positioning
- Tier structure (Bronze, Silver, Gold)
- All points-earning events and calculation rules
- Redemption mechanics and constraints
- Points expiry and tier evaluation policies
- The Strapi v5 data model for loyalty data
- Medusa.js v2 lifecycle hooks for automatic points award and deduction
- Admin management interface via Strapi admin panel
- Customer-facing UI across product pages, checkout, and the /account/loyalty section
- Email communication templates for loyalty events
- Fraud prevention mechanisms
- Analytics and reporting requirements
- Phase 4 considerations for program expansion

### 1.3 Out of Scope

- Partner/distributor loyalty programs (partners are governed by the MDF program — TWN-P3-MDF-2026-001)
- Referral program mechanics (covered in TWN-P3-REFER-2026-001)
- Customer account management (covered in TWN-P3-CUST-2026-001)
- Third-party loyalty SaaS platform integration (Phase 4 evaluation)
- Physical loyalty cards or printed vouchers

### 1.4 Related Documents

| Document Reference       | Title                                              |
|--------------------------|----------------------------------------------------|
| TWN-P3-CUST-2026-001     | Customer Account Specification                     |
| TWN-P3-REFER-2026-001    | Referral Program Functional Specification          |
| TWN-P3-ECOM-2026-001     | E-Commerce Core Specification                      |
| TWN-P3-MDF-2026-001      | MDF Program Functional Specification               |
| TWN-FIN-2026-001         | Financial Reporting Requirements                   |

### 1.5 Definitions

| Term             | Definition                                                              |
|------------------|-------------------------------------------------------------------------|
| Points           | Non-monetary reward units earned and redeemed by TwinMOS customers      |
| Tier             | Membership level (Bronze/Silver/Gold) based on rolling 12-month spend   |
| AOV              | Average Order Value                                                     |
| Lifetime Points  | Cumulative total of all points ever earned (never decremented)          |
| Active Points    | Current redeemable points balance (can be decremented)                  |
| Points Liability | Financial liability to TwinMOS for outstanding unredeemed points        |
| Earn Rate        | Points awarded per unit of currency spent                               |
| Burn Rate        | Points required per unit of discount obtained                           |

---

## 2. Program Overview and Philosophy

### 2.1 Program Name

**TwinMOS Rewards**

*Note: This name is proposed. Final approval required from TwinMOS Marketing Director before public launch. Alternative names evaluated: "TwinMOS Circle," "TwinMOS Club," "TwinMOS Points." Marketing should validate via brief consumer survey if time permits.*

### 2.2 Program Tagline (Proposed)

*"Buy smarter. Earn more. Unlock more."*

### 2.3 Philosophy

The TwinMOS Rewards program is built on three core principles:

1. **Reward genuine engagement**: Points are awarded for meaningful interactions — purchases, product registrations, referrals — not vanity actions that do not correlate with customer value.

2. **Incentivize higher spend without being extractive**: The tier system creates aspirational targets that motivate customers to consolidate their memory and storage purchases at TwinMOS, while offering proportionally greater rewards to higher-spending customers.

3. **Simplicity**: Customers should be able to understand the program without reading fine print. "Spend AED 10, earn 10 points. 100 points = AED 1 off" is the core promise.

### 2.4 Business Goals

| Goal                          | Target Metric                          | Measurement                      |
|-------------------------------|----------------------------------------|----------------------------------|
| Increase repeat purchase rate | 30% of enrolled members make 2+ purchases per year | PostHog cohort analysis |
| Increase AOV                  | 15% higher AOV for enrolled vs. non-enrolled customers | Medusa analytics |
| Drive program enrollment      | 60% of registered customers enrolled in loyalty | Strapi LoyaltyAccount count |
| Reduce churn                  | Loyalty members have 20% lower 12-month churn vs. non-members | CRM cohort |

### 2.5 Program Launch Strategy

- Phase 3 launch: Soft launch with core earn/redeem mechanics
- All existing customer accounts (registered before loyalty launch) receive a welcome bonus of 100 points on first login after program launch
- Program announcement via email to all registered customers (requires marketing consent or transactional notification, to be confirmed with Legal)

---

## 3. System Architecture

### 3.1 Loyalty Engine Architecture

The loyalty engine in Phase 3 is a custom implementation, not a third-party SaaS. It is built within Strapi v5 (data storage, admin, manual adjustments) with integration hooks into Medusa.js v2 (event triggers).

```
┌────────────────────────────────────────────────────────────────┐
│                    Customer Action                             │
│  (Purchase / Profile / Register Product / Referral / Birthday) │
└─────────────────────────┬──────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Medusa.js v2 Event Bus                        │
│                                                                 │
│  order.completed  →  LoyaltyService.awardPurchasePoints()      │
│  order.refunded   →  LoyaltyService.deductRefundPoints()       │
│  customer.created →  LoyaltyService.initializeAccount()        │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                  LoyaltyService (Medusa Module)                  │
│                                                                 │
│  - Calculates points based on tier + earn rate + bonuses       │
│  - Writes LoyaltyTransaction to Strapi via REST API            │
│  - Updates LoyaltyAccount (balance, tier)                      │
│  - Triggers email via Resend                                   │
└─────────────────────────┬───────────────────────────────────────┘
                          │
              ┌───────────┴───────────┐
              │                       │
┌─────────────▼────────┐  ┌──────────▼──────────────┐
│  Strapi v5 CMS       │  │  Resend (Email)          │
│                      │  │                          │
│  LoyaltyAccount      │  │  Points earned email     │
│  LoyaltyTransaction  │  │  Tier upgrade email      │
│  Admin UI            │  │  Expiry warning email    │
└──────────────────────┘  └──────────────────────────┘
```

### 3.2 Checkout Integration

```
Customer reaches Checkout — Order Review step
          │
          ▼
LoyaltyService.getRedemptionOptions(customerId, orderSubtotal)
  → Returns: availablePoints, maxRedemptionValue, minimumPoints, toggle active/inactive
          │
          ▼
Customer toggles "Use my points"
  ├── Enable: Apply Medusa promotion (loyalty_discount type) to cart
  └── Disable: Remove loyalty promotion from cart
          │
          ▼
Order confirmed (order.completed event)
          │
          ▼
LoyaltyService.awardPurchasePoints(order)
  ├── Calculate earned points on post-redemption subtotal
  │   (points earned on amount paid, not including points discount)
  ├── Apply tier multiplier
  ├── Apply category bonus (if Silver/Gold + gaming product)
  └── Write LoyaltyTransaction
```

### 3.3 Points Calculation Engine

```typescript
// Pseudocode for LoyaltyService.awardPurchasePoints()

interface PointsCalculationResult {
  basePoints: number;
  bonusPoints: number;
  totalPoints: number;
  breakdown: PointsBreakdownItem[];
}

function calculatePurchasePoints(
  order: MedusaOrder,
  loyaltyAccount: LoyaltyAccount
): PointsCalculationResult {
  const tier = loyaltyAccount.tier; // 'bronze' | 'silver' | 'gold'
  const currency = order.currency_code;
  const earnRate = EARN_RATES[currency]; // points per unit currency
  const tierMultiplier = TIER_MULTIPLIERS[tier]; // 1.0 | 1.5 | 2.0

  let basePoints = 0;
  let bonusPoints = 0;

  for (const lineItem of order.items) {
    // Calculate base points for this item
    const itemSubtotal = lineItem.unit_price * lineItem.quantity;
    const itemPoints = Math.floor(itemSubtotal / earnRate.unitCurrency * earnRate.pointsPerUnit);
    const itemPointsWithTier = Math.floor(itemPoints * tierMultiplier);
    basePoints += itemPointsWithTier;

    // Apply category bonus for Silver+ on gaming products
    if (tier === 'silver' && isGamingProduct(lineItem.product_id)) {
      bonusPoints += Math.floor(itemPointsWithTier * 0.05);
    }
    if (tier === 'gold' && isGamingProduct(lineItem.product_id)) {
      bonusPoints += Math.floor(itemPointsWithTier * 0.10);
    }
  }

  return {
    basePoints,
    bonusPoints,
    totalPoints: basePoints + bonusPoints,
    breakdown: [] // per-item breakdown
  };
}

const EARN_RATES: Record<string, { unitCurrency: number; pointsPerUnit: number }> = {
  AED: { unitCurrency: 10, pointsPerUnit: 10 },   // 10 pts per AED 10
  INR: { unitCurrency: 100, pointsPerUnit: 10 },   // 10 pts per INR 100
  BDT: { unitCurrency: 100, pointsPerUnit: 10 },   // 10 pts per BDT 100
  SAR: { unitCurrency: 10, pointsPerUnit: 10 },    // 10 pts per SAR 10
  USD: { unitCurrency: 1, pointsPerUnit: 10 },     // 10 pts per USD 1
};

const TIER_MULTIPLIERS: Record<string, number> = {
  bronze: 1.0,
  silver: 1.5,
  gold:   2.0,
};
```

---

## 4. Tier Structure

### 4.1 Tier Overview

| Tier   | Points Range        | Earn Rate          | Gaming Bonus | Free Shipping | Tier Evaluation        |
|--------|---------------------|--------------------|--------------|---------------|------------------------|
| Bronze | 0 – 999 pts         | 1x (baseline)      | None         | No            | Rolling 12-month spend |
| Silver | 1,000 – 4,999 pts   | 1.5x               | +5% points   | No            | Rolling 12-month spend |
| Gold   | 5,000+ pts          | 2x                 | +10% points  | Yes (all orders) | Rolling 12-month spend |

*Note: The points ranges shown reflect points that determine tier qualification, based on lifetime points earned from purchases in the rolling 12-month window. Non-purchase points (profile completion, birthday, etc.) do not count toward tier qualification.*

### 4.2 Tier Qualification Metric

Tier is determined by **purchase-sourced points earned in the past 12 months (rolling)**. Non-purchase events (profile completion, birthday, referral rewards) do not contribute to tier qualification. This prevents gaming the tier system through non-purchase activities.

```
Tier Evaluation Formula:
  qualify_points_12m = SUM(
    LoyaltyTransaction.points_delta
    WHERE transaction_type IN ('purchase', 'purchase_bonus')
    AND created_at >= NOW() - INTERVAL '12 months'
    AND account_id = customer_account_id
  )

  if qualify_points_12m >= 5000 → Gold
  elif qualify_points_12m >= 1000 → Silver
  else → Bronze
```

### 4.3 Tier Evaluation Schedule

- Tier is evaluated **once per month** on the 1st of each month via a scheduled Strapi job
- Tier can only be **upgraded immediately** when a qualifying transaction pushes the customer into a new tier
- Tier **downgrade** happens only at the monthly evaluation, not in real-time (grace period protects Silver/Gold customers from instant downgrade on a single large return)
- When a tier is downgraded, a courteous email is sent explaining the change and how to re-qualify

### 4.4 Tier Benefits Summary

#### Bronze (Default)

- Earn 1 point for every AED 10 / INR 100 / BDT 100 / SAR 10 / USD 1 spent
- Access to members-only promotions
- Birthday bonus: 50 points in birthday month

#### Silver (1,000 qualifying points in 12 months)

- All Bronze benefits
- 1.5x earn rate on all purchases
- +5% bonus points on gaming product categories (DDR5/DDR4 RAM, NVMe SSDs)
- Exclusive Silver-tier early access to new product launches
- Priority customer support (Phase 4)

#### Gold (5,000 qualifying points in 12 months)

- All Silver benefits
- 2x earn rate on all purchases
- +10% bonus points on gaming products
- Free standard shipping on all orders (no minimum order value)
- Dedicated account manager introduction (Phase 4)
- Quarterly exclusive offers

### 4.5 Tier Upgrade / Downgrade Communication

| Event                | Email Template         | Trigger                                        |
|----------------------|------------------------|------------------------------------------------|
| Tier upgrade         | LOYAL_UPGRADE_V1       | Points calculation results in new tier         |
| Tier downgrade       | LOYAL_DOWNGRADE_V1     | Monthly evaluation; tier drops                 |
| Approaching tier     | LOYAL_APPROACHING_V1   | Customer within 100 points of tier threshold   |

---

## 5. Points Earning Rules

### 5.1 Earning Event Summary

| Event                      | Points Awarded                       | Limits               | Applies to Tier Qual? |
|----------------------------|--------------------------------------|----------------------|-----------------------|
| Purchase                   | 10 pts per AED 10 / INR 100 / etc.  | No limit             | Yes                   |
| Purchase (Silver 1.5x)     | 15 pts per AED 10 / INR 100 / etc.  | Silver tier only     | Yes                   |
| Purchase (Gold 2x)         | 20 pts per AED 10 / INR 100 / etc.  | Gold tier only       | Yes                   |
| Gaming product bonus (Silver) | +5% of purchase points           | Silver tier only     | Yes (as purchase_bonus) |
| Gaming product bonus (Gold)  | +10% of purchase points            | Gold tier only       | Yes (as purchase_bonus) |
| Product registration       | 50 pts per product                   | 1 per serial number  | No                    |
| Profile completion bonus   | 25 pts                               | One-time             | No                    |
| First purchase bonus       | 100 pts                              | One-time             | No                    |
| Birthday bonus             | 50 pts                               | Once per year        | No                    |
| Referral reward            | 200 pts per successful referral      | 50/year max          | No                    |
| Review submission          | 30 pts per review (Phase 4)          | 1 per product        | No                    |
| Program launch welcome     | 100 pts (existing customers only)    | One-time             | No                    |

### 5.2 Purchase Points Calculation — Detailed Rules

#### 5.2.1 Base Points Calculation by Currency

Points are calculated on the **order subtotal after any non-loyalty discounts**, rounded down to the nearest whole point:

| Currency | Earn Rate         | Example                         |
|----------|-------------------|---------------------------------|
| AED      | 10 pts / AED 10   | AED 349 order = 349 pts (Bronze) |
| INR      | 10 pts / INR 100  | INR 2,999 order = 299 pts (Bronze) |
| BDT      | 10 pts / BDT 100  | BDT 2,500 order = 250 pts (Bronze) |
| SAR      | 10 pts / SAR 10   | SAR 180 order = 180 pts (Bronze) |
| USD      | 10 pts / USD 1    | USD 45 order = 450 pts (Bronze)  |

#### 5.2.2 Tier Multiplier Application

```
Final purchase points = FLOOR(base_points × tier_multiplier)

Bronze: FLOOR(349 × 1.0) = 349 pts
Silver: FLOOR(349 × 1.5) = 523 pts
Gold:   FLOOR(349 × 2.0) = 698 pts
```

#### 5.2.3 Gaming Category Bonus

Gaming products are identified by their Medusa product category tag. Categories eligible for gaming bonus:

- `ddr5-ram` (VOLTX DDR5, VOLTX RGB DDR5)
- `ddr4-ram` (TornadoX7 DDR4, Thunder GX DDR4)
- `nvme-ssd` (CoreX Pro Gen5, Xtreme Gen4)

```
Gaming bonus = FLOOR(gaming_item_points × category_bonus_rate)

Silver gaming bonus rate: 0.05
Gold gaming bonus rate: 0.10

Example (Silver, VOLTX DDR5 16GB at AED 399):
  Base item points = FLOOR(399 × 1.5) = 598
  Gaming bonus = FLOOR(598 × 0.05) = 29
  Total for item = 627 pts
```

#### 5.2.4 Points on Loyalty-Discounted Orders

Points are earned on the **net amount paid after loyalty discount**, not the full subtotal:

```
Order subtotal: AED 349
Loyalty discount applied: AED 50 (500 points redeemed)
Net paid: AED 299

Points earned on: AED 299
Bronze: FLOOR(299) = 299 pts
```

This prevents a points laundering loop where customers could continuously earn points on points.

### 5.3 Profile Completion Bonus

The profile completion bonus (25 points) is awarded once when a customer completes all optional profile fields:

| Required to trigger bonus |
|---------------------------|
| First name + last name (required at registration) |
| Phone number |
| Date of birth |
| Communication preferences reviewed |

**Implementation:** A `profile_complete` flag on `LoyaltyAccount` prevents duplicate awards. The flag is set to `true` permanently once the bonus is awarded.

### 5.4 First Purchase Bonus

100 points awarded on the first ever completed order for a customer account. Determined by checking if the customer has any prior `LoyaltyTransaction` records with `transaction_type = 'purchase'`.

### 5.5 Birthday Bonus

50 points awarded automatically on the first day of the customer's birthday month:

- Customer must have a Date of Birth set on their profile
- Points are awarded by a scheduled job running on the 1st of each month
- Awarded once per calendar year
- `birthday_awarded_year` field on `LoyaltyAccount` prevents double-award
- Birthday email sent alongside points award

### 5.6 Product Registration Points

50 bonus points per registered product (Phase 3 basic implementation):

- Customer navigates to /products/register (standalone product registration form)
- Enters product serial number + proof of purchase date
- System validates serial number format against product catalog
- Awards 50 points per unique serial number (each serial can only be registered once)
- Points are held for 72 hours before confirming (fraud check window)

### 5.7 Referral Points

200 points credited to the referrer when a referred friend's first order is confirmed. Full referral mechanics are documented in TWN-P3-REFER-2026-001.

---

## 6. Points Redemption Rules

### 6.1 Redemption Rate

| Currency | Redemption Rate             | Example                                 |
|----------|-----------------------------|-----------------------------------------|
| AED      | 100 points = AED 1          | 500 points = AED 5 off                  |
| INR      | 100 points = INR 10         | 500 points = INR 50 off                 |
| BDT      | 100 points = BDT 10         | 500 points = BDT 50 off                 |
| SAR      | 100 points = SAR 1          | 500 points = SAR 5 off                  |
| USD      | 100 points = USD 1          | 500 points = USD 5 off                  |

### 6.2 Redemption Constraints

| Parameter                       | Value                                              |
|---------------------------------|----------------------------------------------------|
| Minimum redemption              | 500 points (= AED 5 / INR 50 / USD 5 equivalent)  |
| Maximum redemption per order    | 50% of order subtotal (before shipping and taxes)  |
| Points increments               | Must be redeemed in multiples of 100 points        |
| Points on discounted items      | Cannot redeem points on items already discounted by a promotion code |
| Points + promo code             | Cannot stack loyalty redemption with promotional discount codes |
| Stacking with Gold free shipping | Allowed; shipping is free separately, points apply to subtotal |

### 6.3 Redemption UI — Checkout

```
Order Review Step — Checkout

┌──────────────────────────────────────────────────────────────┐
│  Order Summary                                               │
│  ─────────────────────────────────────────────────────────  │
│  VOLTX DDR5 16GB                           AED 349.00        │
│  Elite Drive SATA SSD 512GB                AED 199.00        │
│  ─────────────────────────────────────────────────────────  │
│  Subtotal                                  AED 548.00        │
│  Shipping                                  AED 25.00         │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Your Points: 850 pts                                  │ │
│  │  ○ Use 500 points = AED 5 off   [ Toggle ON/OFF ]     │ │
│  │  Maximum for this order: 2,740 pts = AED 27 off        │ │
│  │  (50% of AED 548 subtotal)                            │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Loyalty Discount                          - AED 5.00        │
│  ─────────────────────────────────────────────────────────  │
│  Total                                     AED 568.00        │
│  ─────────────────────────────────────────────────────────  │
│  After this order you will earn: 543 pts                    │
└──────────────────────────────────────────────────────────────┘
```

### 6.4 Redemption Technical Implementation

Loyalty point redemption is implemented as a Medusa **Promotion** of type `loyalty_discount`:

```typescript
// Medusa promotion created when customer toggles redemption ON

const loyaltyPromotion = {
  code: `LOYAL_${customerId}_${orderId}`,
  type: 'loyalty_discount',
  application_method: {
    type: 'fixed',
    value: redemptionValue,        // AED 5, INR 50, etc.
    currency_code: order.currency_code,
  },
  is_automatic: false,             // applied only when customer opts in
  usage_limit: 1,                  // single use
  metadata: {
    loyalty_points_used: 500,
    customer_id: customerId,
  }
};
```

On order confirmation (`order.completed` event):
1. Deduct points from `LoyaltyAccount.total_points`
2. Write `LoyaltyTransaction` with `transaction_type: 'redemption'` and negative `points_delta`
3. Delete/invalidate the single-use promotion code

On order cancellation before points deduction:
1. No deduction occurs (points never spent)

On order cancellation after points deduction:
1. Restore points via `LoyaltyTransaction` with `transaction_type: 'redemption_reversal'`

---

## 7. Points Expiry Policy

### 7.1 Inactivity-Based Expiry

Points expire after **12 consecutive months of account inactivity**. Inactivity is defined as: no completed order, no product registration, no login recorded in the `LoginHistory`.

```
Points Expiry Check (run monthly on 1st):

For each LoyaltyAccount:
  last_activity = MAX(
    last_order_completed_at,
    last_product_registered_at,
    last_login_at
  )

  if last_activity < NOW() - INTERVAL '12 months':
    → Points about to expire
    if last_activity < NOW() - INTERVAL '11 months':
      → Send 30-day warning email (if not already sent)
    if last_activity < NOW() - INTERVAL '12 months':
      → Write LoyaltyTransaction: type='expiry', points_delta = -total_points
      → Set total_points = 0
      → Keep lifetime_points unchanged
```

### 7.2 Points Expiry Warning Email

A 30-day warning email (LOYAL_EXPIRY_WARNING_V1) is sent when an account is approaching the 12-month inactivity threshold:

- **Trigger:** last_activity = 11 months ago (30 days before expiry)
- **Content:** Points balance, expiry date, call to action ("Make a purchase to keep your points")
- **One-time per expiry cycle:** Only one warning per 12-month cycle to avoid email fatigue

### 7.3 Tier Expiry

Tier status is re-evaluated monthly. A customer whose qualifying purchase points in the rolling 12-month window drops below their current tier threshold will be downgraded at the next monthly evaluation.

| Scenario                                | Result                                 |
|-----------------------------------------|----------------------------------------|
| Gold customer; purchase points drop below 5,000 | Downgraded to Silver at next monthly eval |
| Silver customer; purchase points drop below 1,000 | Downgraded to Bronze at next monthly eval |
| Downgraded customer makes new purchases | Can re-qualify in the same evaluation cycle |

### 7.4 Points Lifespan Summary

```
Points timeline for a typical customer:
  
  Jan 2025: Register → 0 pts
  Feb 2025: First purchase (AED 350) → +350 pts + 100 first_purchase_bonus = 450 pts
  Mar 2025: Profile complete → +25 pts = 475 pts
  Apr 2025: Referral success → +200 pts = 675 pts
  Birthday (Jun): → +50 pts = 725 pts
  Jul 2025: Purchase (AED 275) → +275 pts = 1,000 pts → TIER UPGRADE to Silver
  Aug 2025 → Dec 2025: No activity
  Jan 2026: 30-day expiry warning sent
  Feb 2026: Points expire (12 months inactivity) → total_points = 0
              tier re-evaluated → back to Bronze (no qualifying purchases in 12m)
```

---

## 8. Data Model

### 8.1 Strapi v5 Collection: LoyaltyAccount

```javascript
// Strapi v5 Collection Type Definition

module.exports = {
  kind: 'collectionType',
  collectionName: 'loyalty_accounts',
  info: {
    singularName: 'loyalty-account',
    pluralName: 'loyalty-accounts',
    displayName: 'Loyalty Account',
  },
  attributes: {
    // Linked identities
    customer_id: {
      type: 'string',
      required: true,
      unique: true,
      description: 'Medusa customer ID (cus_xxxxx)',
    },
    better_auth_user_id: {
      type: 'string',
      required: true,
      unique: true,
      description: 'Better Auth user UUID',
    },

    // Points balances
    total_points: {
      type: 'integer',
      required: true,
      default: 0,
      description: 'Current redeemable points balance',
    },
    lifetime_points: {
      type: 'integer',
      required: true,
      default: 0,
      description: 'Total points ever earned (never decremented, for tier history)',
    },
    pending_points: {
      type: 'integer',
      required: true,
      default: 0,
      description: 'Points earned but not yet confirmed (e.g. product registration hold)',
    },

    // Tier
    tier: {
      type: 'enumeration',
      enum: ['bronze', 'silver', 'gold'],
      required: true,
      default: 'bronze',
    },
    tier_override: {
      type: 'enumeration',
      enum: ['none', 'bronze', 'silver', 'gold'],
      default: 'none',
      description: 'Manual tier override by admin (overrides calculated tier)',
    },
    tier_override_expires_at: {
      type: 'datetime',
      description: 'Expiry of manual tier override',
    },
    tier_evaluated_at: {
      type: 'datetime',
      description: 'Last tier evaluation timestamp',
    },

    // Bonus tracking
    profile_complete: {
      type: 'boolean',
      default: false,
      description: 'Has profile completion bonus been awarded?',
    },
    first_purchase_bonus_awarded: {
      type: 'boolean',
      default: false,
    },
    birthday_awarded_year: {
      type: 'integer',
      description: 'Calendar year of last birthday bonus award (prevents double-award)',
    },

    // Activity tracking (for expiry)
    last_purchase_at: {
      type: 'datetime',
    },
    last_login_at: {
      type: 'datetime',
    },
    last_activity_at: {
      type: 'datetime',
      description: 'MAX of all activity timestamps; updated on any earning event',
    },

    // Expiry management
    expiry_warning_sent_at: {
      type: 'datetime',
      description: 'When the 30-day expiry warning was last sent',
    },
    points_expire_at: {
      type: 'datetime',
      description: 'Calculated expiry date (last_activity_at + 12 months)',
    },

    // Referral link
    referral_code: {
      type: 'string',
      unique: true,
      description: '6-char alphanumeric referral code',
    },
  },
};
```

### 8.2 Strapi v5 Collection: LoyaltyTransaction

```javascript
module.exports = {
  kind: 'collectionType',
  collectionName: 'loyalty_transactions',
  info: {
    singularName: 'loyalty-transaction',
    pluralName: 'loyalty-transactions',
    displayName: 'Loyalty Transaction',
  },
  attributes: {
    // Relationship
    loyalty_account: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'api::loyalty-account.loyalty-account',
      inversedBy: 'transactions',
    },

    // Source reference
    source_type: {
      type: 'enumeration',
      enum: [
        'order',
        'product_registration',
        'referral',
        'admin_adjustment',
        'campaign',
      ],
      description: 'Type of source entity',
    },
    source_id: {
      type: 'string',
      description: 'ID of the source entity (order ID, registration ID, etc.)',
    },

    // Transaction type
    transaction_type: {
      type: 'enumeration',
      enum: [
        'purchase',           // Points from order spend
        'purchase_bonus',     // Tier or category bonus
        'redemption',         // Points spent at checkout
        'redemption_reversal',// Points restored on cancellation/return
        'profile_complete',   // One-time profile bonus
        'first_purchase',     // First purchase bonus
        'birthday',           // Birthday bonus
        'referral',           // Referral reward
        'product_registration',// Warranty registration bonus
        'expiry',             // Points expired
        'admin_adjustment',   // Manual admin adjustment
        'campaign',           // Bulk campaign award
        'launch_welcome',     // Program launch welcome bonus
      ],
      required: true,
    },

    // Points
    points_delta: {
      type: 'integer',
      required: true,
      description: 'Positive for earn, negative for redeem/expire',
    },
    balance_after: {
      type: 'integer',
      required: true,
      description: 'Account total_points after this transaction',
    },

    // Metadata
    description: {
      type: 'string',
      description: 'Human-readable description for customer history view',
    },
    admin_note: {
      type: 'text',
      description: 'Internal admin note (not shown to customer)',
    },
    adjusted_by: {
      type: 'string',
      description: 'Admin user ID who made manual adjustment',
    },

    // Status
    status: {
      type: 'enumeration',
      enum: ['pending', 'confirmed', 'reversed'],
      default: 'confirmed',
    },
    confirmed_at: {
      type: 'datetime',
    },
  },
};
```

### 8.3 Supporting Database Indexes

```sql
-- Performance indexes for loyalty queries

-- Fast lookup by customer
CREATE INDEX idx_loyalty_account_customer_id ON loyalty_accounts(customer_id);
CREATE INDEX idx_loyalty_account_referral_code ON loyalty_accounts(referral_code);

-- Fast transaction history retrieval
CREATE INDEX idx_loyalty_tx_account_created ON loyalty_transactions(loyalty_account_id, created_at DESC);
CREATE INDEX idx_loyalty_tx_type ON loyalty_transactions(transaction_type);
CREATE INDEX idx_loyalty_tx_source ON loyalty_transactions(source_type, source_id);

-- Tier evaluation queries
CREATE INDEX idx_loyalty_account_tier ON loyalty_accounts(tier);
CREATE INDEX idx_loyalty_account_activity ON loyalty_accounts(last_activity_at);
```

---

## 9. Lifecycle Hooks and Event Handling

### 9.1 Medusa.js v2 Event: order.completed

```typescript
// Medusa subscriber: order.completed

export default class OrderCompletedSubscriber {
  static identifier = 'loyalty-order-completed';

  static events = ['order.completed'];

  async handleEvent({ data }: { data: { id: string } }) {
    const order = await this.orderService.retrieve(data.id, {
      relations: ['items', 'items.variant', 'items.variant.product'],
    });

    const loyaltyAccount = await this.loyaltyService
      .getAccountByCustomerId(order.customer_id);

    if (!loyaltyAccount) return; // Guest checkout — no loyalty

    // 1. Calculate points
    const result = await this.loyaltyService.calculatePurchasePoints(
      order, loyaltyAccount
    );

    // 2. Award base purchase points
    await this.loyaltyService.awardPoints(loyaltyAccount.id, {
      transaction_type: 'purchase',
      points_delta: result.basePoints,
      source_type: 'order',
      source_id: order.id,
      description: `Points from order #${order.display_id}`,
    });

    // 3. Award bonus points (if any)
    if (result.bonusPoints > 0) {
      await this.loyaltyService.awardPoints(loyaltyAccount.id, {
        transaction_type: 'purchase_bonus',
        points_delta: result.bonusPoints,
        source_type: 'order',
        source_id: order.id,
        description: `${loyaltyAccount.tier} tier bonus on order #${order.display_id}`,
      });
    }

    // 4. Check and award first purchase bonus
    if (!loyaltyAccount.first_purchase_bonus_awarded) {
      await this.loyaltyService.awardPoints(loyaltyAccount.id, {
        transaction_type: 'first_purchase',
        points_delta: 100,
        source_type: 'order',
        source_id: order.id,
        description: 'First purchase bonus',
      });
      await this.loyaltyService.setFirstPurchaseBonusAwarded(loyaltyAccount.id);
    }

    // 5. Evaluate tier upgrade
    await this.loyaltyService.evaluateTierUpgrade(loyaltyAccount.id);

    // 6. Update last_activity_at, last_purchase_at
    await this.loyaltyService.updateActivity(loyaltyAccount.id, {
      last_purchase_at: order.created_at,
      last_activity_at: new Date(),
    });

    // 7. Send points earned email
    await this.emailService.sendLoyaltyPointsEarned({
      customer: order.customer,
      order,
      pointsEarned: result.totalPoints,
      newBalance: loyaltyAccount.total_points + result.totalPoints,
    });
  }
}
```

### 9.2 Medusa.js v2 Event: order.refunded

```typescript
// Medusa subscriber: order.refunded (full or partial)

export default class OrderRefundedSubscriber {
  static identifier = 'loyalty-order-refunded';
  static events = ['order.refunded'];

  async handleEvent({ data }: { data: { id: string; refund_amount: number } }) {
    const order = await this.orderService.retrieve(data.id);
    const loyaltyAccount = await this.loyaltyService
      .getAccountByCustomerId(order.customer_id);

    if (!loyaltyAccount) return;

    // Find original purchase transactions for this order
    const purchaseTxs = await this.loyaltyService.getTransactionsBySource(
      loyaltyAccount.id, 'order', order.id,
      ['purchase', 'purchase_bonus']
    );

    if (purchaseTxs.length === 0) return; // No points to deduct

    const totalAwarded = purchaseTxs.reduce((sum, tx) => sum + tx.points_delta, 0);
    const orderTotal = order.total;
    const refundRatio = Math.min(data.refund_amount / orderTotal, 1.0);
    const pointsToDeduct = Math.floor(totalAwarded * refundRatio);

    if (pointsToDeduct <= 0) return;

    // Deduct proportionally (cannot go below 0)
    const deductAmount = Math.min(pointsToDeduct, loyaltyAccount.total_points);

    await this.loyaltyService.deductPoints(loyaltyAccount.id, {
      transaction_type: 'redemption_reversal',
      points_delta: -deductAmount,
      source_type: 'order',
      source_id: order.id,
      description: `Points adjusted for refund on order #${order.display_id}`,
    });
  }
}
```

### 9.3 Scheduled Jobs

```typescript
// Monthly tier evaluation and birthday/expiry jobs

// job: monthly-loyalty-maintenance
// Schedule: CRON '0 6 1 * *' (6am UTC on 1st of every month)

export async function monthlyLoyaltyMaintenance() {
  // 1. Evaluate all tiers
  const allAccounts = await loyaltyService.getAllAccounts();
  for (const account of allAccounts) {
    await loyaltyService.evaluateTierMonthly(account.id);
  }

  // 2. Award birthday bonuses for this month
  const currentMonth = new Date().getMonth() + 1;
  const birthdayCustomers = await loyaltyService
    .getCustomersByBirthdayMonth(currentMonth);

  for (const account of birthdayCustomers) {
    if (!loyaltyService.hasBirthdayBeenAwardedThisYear(account)) {
      await loyaltyService.awardPoints(account.id, {
        transaction_type: 'birthday',
        points_delta: 50,
        description: 'Birthday bonus',
      });
    }
  }

  // 3. Check points expiry
  const expiryWarningThreshold = new Date();
  expiryWarningThreshold.setMonth(expiryWarningThreshold.getMonth() - 11);

  const warningCandidates = await loyaltyService
    .getAccountsInactiveFor(11, 'months');
  for (const account of warningCandidates) {
    if (!loyaltyService.hasExpirySentThisCycle(account)) {
      await emailService.sendExpiryWarning(account);
      await loyaltyService.setExpirySent(account.id);
    }
  }

  // 4. Expire points for accounts inactive 12+ months
  const expiryCandidates = await loyaltyService
    .getAccountsInactiveFor(12, 'months');
  for (const account of expiryCandidates) {
    await loyaltyService.expirePoints(account.id);
  }
}
```

---

## 10. Admin Features

### 10.1 Strapi Admin — Loyalty Dashboard

The Strapi admin panel provides a loyalty management section with the following views:

#### 10.1.1 Program Overview Dashboard

```
TwinMOS Rewards — Admin Dashboard
─────────────────────────────────────────────────────────────
Total enrolled members:        12,847
Bronze:    9,201 (71.6%)
Silver:    2,847 (22.2%)
Gold:         799  (6.2%)

Points issued this month:      2,847,392 pts
Points redeemed this month:      342,100 pts
Redemption rate:                    12.0%
Outstanding points liability:  28,473,920 pts (≈ AED 284,739)

Average points per member:        2,216 pts
─────────────────────────────────────────────────────────────
```

#### 10.1.2 Customer Loyalty Account View

From any customer record in Strapi admin, staff can view the linked LoyaltyAccount:

| Field                 | Display                             |
|-----------------------|-------------------------------------|
| Current Tier          | Bronze / Silver / Gold (badge)      |
| Total Points          | 1,247 pts                           |
| Lifetime Points       | 4,892 pts                           |
| Pending Points        | 50 pts (product registration hold)  |
| Last Activity         | 12 Apr 2026                         |
| Points Expire At      | 12 Apr 2027                         |
| Tier Override         | None                                |
| Transaction History   | Table of all LoyaltyTransactions    |

### 10.2 Manual Points Adjustment

Admin staff can manually add or deduct points for customer service recovery, correction of missed points, or campaign awards. All manual adjustments require:

1. **Amount** (positive = add, negative = deduct)
2. **Reason** (free text, required) — stored in `admin_note`
3. **Adjusted by** — automatically set to logged-in admin user ID
4. **Expiry** (optional) — for campaign points that should expire on a specific date

```
Manual Adjustment Form (Strapi admin)

Customer: Ahmed Al-Rashidi (cus_01234)
Current Balance: 1,247 pts

Adjustment Amount: [+] [ 150 ] pts
Reason: Customer contacted support — points missing from order TW-20260301-0099
        (system glitch during transition; manually verified via order data)

[APPLY ADJUSTMENT]

→ Creates LoyaltyTransaction:
   type: admin_adjustment
   points_delta: +150
   admin_note: "Customer contacted support — ..."
   adjusted_by: admin_user_id
```

**Deduction constraint:** Admin cannot manually deduct more points than the customer's current balance. Balance cannot go below 0 via manual adjustment.

### 10.3 Tier Override

Admin can manually override a customer's tier for a specified period (e.g., as a goodwill gesture, promotional campaign, or influencer partnership):

| Field              | Description                                              |
|--------------------|----------------------------------------------------------|
| Override Tier      | Bronze / Silver / Gold                                   |
| Override Reason    | Required text field                                      |
| Override Expires At | Date; after this date, calculated tier is restored      |

Override is stored in `tier_override` and `tier_override_expires_at` on `LoyaltyAccount`. The effective tier display logic:

```
effective_tier =
  IF tier_override != 'none' AND tier_override_expires_at > NOW()
    THEN tier_override
  ELSE calculated_tier (from 12-month qualifying points)
```

### 10.4 Bulk Points Award

For promotional campaigns, TwinMOS marketing can award points in bulk to a segment of customers:

- **Source:** CSV upload (customer_id, points_amount, reason) or Strapi filter (e.g., all Gold tier customers)
- **Processing:** Background job to process bulk awards without blocking the admin UI
- **Audit:** Each award creates an individual `LoyaltyTransaction` with `transaction_type: 'campaign'`
- **Cap:** Maximum bulk award: 5,000 points per customer per campaign (requires superadmin approval for higher)

### 10.5 Reports Available to Admin

| Report Name                | Description                                  | Format   | Frequency     |
|----------------------------|----------------------------------------------|----------|---------------|
| Monthly Loyalty Summary    | Tier distribution, points issued/redeemed    | Excel    | Monthly       |
| Points Liability Report    | Outstanding redeemable points ($ equivalent) | Excel    | Monthly       |
| Top Earners                | Customers by lifetime points                 | Excel    | Quarterly     |
| Redemption Rate by Region  | Redemption events by market                  | Excel    | Monthly       |
| Expiry Report              | Points about to expire / expired             | Excel    | Monthly       |

---

## 11. Customer-Facing UI

### 11.1 Points Balance in Header

Authenticated users see their points balance in the site header navigation:

```
[TwinMOS Logo]   [Search...]   [BRONZE 425 pts]   [Cart (2)]   [Ahmed ▼]
```

- Balance is updated on page load from a 5-minute cached API response
- Clicking the balance chip navigates to /account/loyalty
- For Gold tier, the chip displays with a gold accent color

### 11.2 Points Callout on Product Pages

Each product detail page shows the potential points earn for purchasing:

```
VOLTX DDR5 16GB — AED 349.00

★★★★☆ (47 reviews)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Earn 349 points with this purchase!     [Bronze]
  Silver members earn 523 points          [Upgrade →]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[ADD TO CART]
```

Logic:
- If customer is not logged in: show "Log in to earn points on this purchase"
- If logged in Bronze: show their actual earn amount
- If logged in Silver/Gold: show their tier earn amount with tier badge
- Gaming product callout shows applicable gaming bonus if Silver/Gold

### 11.3 Checkout Points Summary

On the Order Review step, the customer sees a points summary before placing the order:

```
After this order, you will earn:
  ┌─────────────────────────────────────────┐
  │ Base purchase points:        +349 pts   │
  │ [BRONZE] First purchase bonus: +100 pts │
  │ ─────────────────────────────────────── │
  │ Total earned this order:     +449 pts   │
  │ New balance after order:   1,116 pts    │
  └─────────────────────────────────────────┘
  
  You're 884 points away from Silver tier!
```

### 11.4 Account Loyalty Page (/account/loyalty)

Full loyalty dashboard as described in Section 13 of TWN-P3-CUST-2026-001. Key UI elements:

```
┌──────────────────────────────────────────────────────────────┐
│  TwinMOS Rewards                                             │
├──────────────────────────────────────────────────────────────┤
│  Tier Status                                                 │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  BRONZE ✓  │  │  SILVER    │  │   GOLD     │            │
│  │  Current   │  │  1,000 pts │  │  5,000 pts │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│                                                              │
│  ████████████░░░░░░░░░░░░░░░░░  425 / 1,000 pts to Silver  │
│                                                              │
│  Your Benefits                                               │
│  [x] 1 point per AED 10 spent                               │
│  [x] Birthday bonus points                                   │
│  [ ] 1.5x earn rate (Silver only)                           │
│  [ ] Free shipping on all orders (Gold only)                │
│                                                              │
│  Points Balance: 425 pts                                    │
│  ≈ AED 4.25 redemption value                                │
│  Minimum to redeem: 500 pts                                 │
│                                                              │
│  Points History                              [Export CSV]   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Date          Event                    +/-   Balance│   │
│  │  12 Apr 2026   Purchase TW-...-0047    +349    425  │   │
│  │  12 Mar 2026   Profile complete bonus   +25      76  │   │
│  │  01 Mar 2026   First purchase bonus    +100      51  │   │
│  │  01 Mar 2026   Purchase TW-...-0002    -49      -49  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                  [Load more]                 │
└──────────────────────────────────────────────────────────────┘
```

---

## 12. Email Communications

### 12.1 Email Templates

All loyalty emails are sent via Resend using pre-designed transactional email templates. Templates are HTML/CSS (responsive) with plain-text fallback.

#### 12.1.1 LOYAL_POINTS_EARNED_V1 — Points Earned on Purchase

**Trigger:** `order.completed` with points awarded
**Subject:** `You earned {points} points on your TwinMOS order!`

```
Hi {First Name},

Great news! Your order #{order_display_id} has been confirmed
and you've earned points!

  Points earned this order:  {points_earned} pts
  Current balance:           {new_balance} pts
  Your tier:                 {tier}

{IF approaching tier threshold}
  You're just {points_to_next_tier} points away from {next_tier}!
  Reach {next_tier} and enjoy {next_tier_benefit}.
  [SHOP NOW TO EARN MORE]

Order summary:
  {product_list}

  Thank you for choosing TwinMOS!
```

#### 12.1.2 LOYAL_UPGRADE_V1 — Tier Upgrade

**Trigger:** Tier upgrade detected during points calculation
**Subject:** `Congratulations! You've reached {new_tier} tier on TwinMOS Rewards!`

```
Hi {First Name},

You've done it! You've reached {NEW_TIER} tier on TwinMOS Rewards!

  [GOLD BADGE GRAPHIC]

  Your new benefits include:
  [benefit_list for new tier]

  Your current points: {total_points}

  [EXPLORE YOUR BENEFITS]
```

#### 12.1.3 LOYAL_DOWNGRADE_V1 — Tier Downgrade

**Trigger:** Monthly evaluation results in tier drop
**Subject:** `Your TwinMOS Rewards tier has been updated`

```
Hi {First Name},

Your TwinMOS Rewards tier has been updated to {new_tier}.

Your tier is evaluated based on your purchase activity over
the past 12 months. To re-qualify for {previous_tier}, 
you'll need to earn {qualifying_points_needed} points from
purchases in the next 12 months.

Your current balance: {total_points} pts

  [SHOP NOW TO RE-QUALIFY]
```

#### 12.1.4 LOYAL_EXPIRY_WARNING_V1 — Points Expiry Warning

**Trigger:** 30-day warning before points expiry
**Subject:** `Your {points} TwinMOS Rewards points are expiring soon!`

```
Hi {First Name},

Your {points} TwinMOS Rewards points are scheduled to expire
on {expiry_date} — that's in 30 days.

Don't let your points go to waste! Make a purchase before
{expiry_date} to keep your points active.

Your points are worth: {redemption_value}
Expiry date:          {expiry_date}

  [SHOP NOW AND KEEP YOUR POINTS]
```

#### 12.1.5 LOYAL_MONTHLY_STATEMENT_V1 — Monthly Statement (Opt-In)

**Trigger:** 1st of each month; sent only to customers with `newsletter` preference = On
**Subject:** `Your TwinMOS Rewards summary for {month}`

Contains:
- Points earned during the month
- Points redeemed during the month
- Current balance
- Tier status and progress
- Product recommendations (Phase 4: personalized)

### 12.2 Email Sending Rules

| Template                  | Opt-Out Possible? | Category     |
|---------------------------|-------------------|--------------|
| LOYAL_POINTS_EARNED_V1    | No                | Transactional|
| LOYAL_UPGRADE_V1          | No                | Transactional|
| LOYAL_DOWNGRADE_V1        | No                | Transactional|
| LOYAL_EXPIRY_WARNING_V1   | Yes (loyalty_emails preference) | Transactional |
| LOYAL_MONTHLY_STATEMENT_V1| Yes (newsletter preference) | Marketing    |

---

## 13. Fraud Prevention

### 13.1 Points Earning Cap

| Abuse Vector               | Prevention Mechanism                                     |
|----------------------------|----------------------------------------------------------|
| Multiple accounts, same IP | Max 3 new accounts per IP per 24 hours; flagged for review |
| Duplicate email variations | Detect `user+tag@gmail.com` → normalize to `user@gmail.com` for duplicate check |
| Self-referral              | See TWN-P3-REFER-2026-001; referrer and referee must not share IP/device |
| Return fraud (buy for points, return goods) | Points on refunded items are deducted proportionally |
| Fake product registrations | Serial number validation against product catalog; 72-hour hold on registration points |
| Points resale              | Points are non-transferable and have no cash value outside redemption |

### 13.2 Account-Level Fraud Controls

```
Points Earning Anomaly Detection (Phase 3 — Basic):

Flag account for manual review if:
  - More than 10 product registrations within 7 days
  - Purchase points earned > 50,000 pts in a single month
  - Admin adjustment total > 5,000 pts in 30 days

Flagged accounts:
  - Pending points held; not confirmed until manual review
  - Email alert to TwinMOS customer service team
  - Admin sees 'FLAGGED' badge on loyalty account in Strapi
```

### 13.3 Redemption Fraud Controls

| Control                        | Rule                                                  |
|--------------------------------|-------------------------------------------------------|
| Minimum redemption             | 500 points (prevents micro-redemptions to probe balance) |
| Maximum per order              | 50% of subtotal                                       |
| Redemption + promotion stacking | Not allowed (prevents double discount abuse)         |
| Redemption on guest checkout   | Not allowed (redemption requires logged-in account)   |

### 13.4 Points Transferability

Points are explicitly non-transferable between accounts. There is no mechanism to transfer points, gift points to another account, or combine accounts. Any customer request to transfer points must be declined.

---

## 14. Analytics and Reporting

### 14.1 PostHog Events

The following custom events are tracked in PostHog for loyalty program analytics:

| Event Name                   | Properties                                          |
|------------------------------|-----------------------------------------------------|
| `loyalty_points_earned`      | customer_id, amount, transaction_type, tier, order_id |
| `loyalty_points_redeemed`    | customer_id, amount, order_id, order_subtotal       |
| `loyalty_tier_upgraded`      | customer_id, from_tier, to_tier                     |
| `loyalty_tier_downgraded`    | customer_id, from_tier, to_tier                     |
| `loyalty_checkout_toggle_on` | customer_id, points_available, points_applied       |
| `loyalty_checkout_toggle_off`| customer_id                                         |
| `loyalty_account_page_view`  | customer_id, tier, balance                          |
| `loyalty_product_page_callout_view` | customer_id, product_id, points_to_earn      |

### 14.2 Key Metrics and KPIs

| Metric                    | Formula                                          | Target          |
|---------------------------|--------------------------------------------------|-----------------|
| Program enrollment rate   | Enrolled members / Total registered customers    | > 60%           |
| Active member rate        | Members with activity in 90 days / Total enrolled | > 40%         |
| Redemption rate           | Orders with points redeemed / Total enrolled orders | > 15%        |
| Points earned / order     | Total points issued / Total orders (enrolled)    | Tracked         |
| Points liability          | total_points × redemption_rate (per currency)    | < 2% of revenue |
| Tier distribution         | % Bronze / Silver / Gold                         | Tracked         |
| Tier upgrade rate         | Tier upgrades / Month                            | Tracked         |
| Revenue from enrolled vs. non-enrolled | AOV comparison                   | +15% AOV enrolled |
| Churn rate comparison     | 12-month repurchase rate: enrolled vs. not       | +20% enrolled   |

### 14.3 Finance — Points Liability Tracking

The Finance team requires a monthly points liability report. This represents the financial obligation TwinMOS has to honor outstanding points:

```
Points Liability Calculation (monthly):

For each currency region:
  outstanding_points = SUM(LoyaltyAccount.total_points)
    WHERE customer.preferred_currency = {currency}
  
  liability_value = outstanding_points / 100 × redemption_unit_value
  
  Example (AED):
    outstanding_points_AED_customers = 2,847,392 pts
    liability = 2,847,392 / 100 × AED 1 = AED 28,473.92

Reported in Finance monthly report with:
  - Total liability by currency
  - USD equivalent at current exchange rates
  - Month-over-month change
  - Redemption expense (points redeemed × redemption value)
```

---

## 15. Business Rules

### BR-LOYAL-001 — Points are Non-Monetary

TwinMOS Rewards points have no cash value and cannot be exchanged for cash, transferred between accounts, or sold. Points are a discount mechanism only.

### BR-LOYAL-002 — Rounding Policy

All points calculations are rounded **down** (floor) to the nearest whole point. Fractional points are never credited.

### BR-LOYAL-003 — Redemption Requires Sufficient Balance

A customer cannot redeem more points than their current `total_points` balance. The checkout UI must display the maximum redeemable amount and prevent over-redemption at both client and server level.

### BR-LOYAL-004 — Points Earned on Net Amount Paid

Points are calculated on the order subtotal after any non-loyalty discounts are applied and after any loyalty redemption discount. Shipping costs and taxes do not earn points.

### BR-LOYAL-005 — First Purchase Bonus is One-Time

The 100-point first purchase bonus is awarded exactly once per account, regardless of returns or cancellations of the qualifying order. If the first order is cancelled, the bonus is still awarded if the points were already credited. If the order is returned after points are awarded, a proportional deduction is applied to purchase points only; the first purchase bonus is not reversed.

### BR-LOYAL-006 — Profile Completion Bonus is One-Time

The 25-point profile completion bonus is awarded exactly once and is not reversed if the customer subsequently removes profile data (e.g., deletes their phone number).

### BR-LOYAL-007 — Birthday Bonus Requires Date of Birth

The birthday bonus (50 points) is awarded only to accounts with a Date of Birth recorded in their profile. Customers who add their DOB after the birthday month for the current year receive the bonus in the following year's birthday month.

### BR-LOYAL-008 — Tier Upgrade is Immediate

When a purchase pushes a customer's qualifying purchase points in the rolling 12-month window above a tier threshold, the tier upgrade takes effect immediately (within the same transaction event). The upgraded tier multiplier does NOT apply retroactively to the qualifying order itself; it applies to subsequent orders.

### BR-LOYAL-009 — Tier Downgrade is Monthly

Tier downgrades are evaluated and applied only on the monthly scheduled job (1st of the month). A customer whose qualifying points drop below their tier threshold intra-month is not downgraded immediately. This prevents punitive real-time downgrades due to a single large return.

### BR-LOYAL-010 — Points Cannot Reduce Below Zero

The `total_points` balance on a `LoyaltyAccount` cannot go below 0. If a refund or admin deduction would result in a negative balance, the deduction is capped at the available balance. The deducted amount is the minimum of (calculated_deduction, current_balance).

### BR-LOYAL-011 — Manual Adjustment Audit Trail

Every manual points adjustment by an admin must be recorded in `LoyaltyTransaction` with `transaction_type: 'admin_adjustment'`, the admin's user ID in `adjusted_by`, and a non-empty `admin_note`. Adjustments without a reason must be rejected by the Strapi admin form.

### BR-LOYAL-012 — Redemption Cannot Stack with Promotion Codes

A single order cannot have both a promotional discount code and a loyalty points redemption applied simultaneously. The checkout must enforce this constraint: activating the loyalty toggle deactivates any applied promotion code and vice versa. The customer is informed of this constraint via a tooltip.

### BR-LOYAL-013 — Product Registration Points Hold Period

Points awarded for product registration are held in `pending_points` for **72 hours** before being confirmed to `total_points`. During this hold, a fraud check runs (serial number validity, account age check). If fraud is detected, pending points are reversed and not confirmed.

### BR-LOYAL-014 — Points Expiry Is Inactivity-Based, Not Rolling

Points do not expire on a rolling per-transaction basis. All points in an account expire together if the account is inactive for 12 consecutive months. A single login or purchase event resets the inactivity clock for all outstanding points.

### BR-LOYAL-015 — Gaming Category Bonus Applies Per Line Item

The gaming category bonus for Silver and Gold members is calculated per eligible line item, not on the total order. Non-gaming items in the same order do not receive the category bonus.

### BR-LOYAL-016 — Referral Points Are Purchase-Independent

Points earned from referrals are credited to `total_points` but do **not** count toward tier qualification. Tier qualification is based solely on purchase and purchase_bonus transaction types.

### BR-LOYAL-017 — Program Terms Govern Disputes

All loyalty points disputes, missing points claims, and program eligibility questions are governed by the TwinMOS Rewards Terms and Conditions (link: /legal/rewards-terms). Customer support may make manual adjustments within their authorization level (max 500 pts per case without manager approval).

### BR-LOYAL-018 — Partner Accounts Earn Points as Consumers

Partner account holders (distributors) who purchase products through the consumer store (not B2B portal) earn loyalty points as consumers. B2B bulk orders through the partner portal are excluded from the loyalty program (they are governed by the MDF program).

### BR-LOYAL-019 — Points on Cancelled Orders Are Reversed

If an order is cancelled before fulfillment, any points credited for that order (purchase, purchase_bonus, first_purchase) are reversed. A `LoyaltyTransaction` with negative `points_delta` and `transaction_type: 'redemption_reversal'` is written. If the customer redeemed points on the cancelled order, the redeemed points are also restored.

### BR-LOYAL-020 — Program Modification Rights

TwinMOS reserves the right to modify earn rates, redemption rates, tier thresholds, and program terms with 30 days' notice to enrolled members via email and notice on the /account/loyalty page. Existing points balances are honored at their applicable redemption rate at the time of redemption.

---

## 16. Acceptance Criteria

### 16.1 Points Earning

- [x] AC-LOYAL-001: A completed order awards the correct number of points based on the order subtotal and customer tier
- [x] AC-LOYAL-002: The first purchase bonus of 100 points is awarded exactly once per account
- [x] AC-LOYAL-003: The profile completion bonus of 25 points is awarded exactly once when all required profile fields are filled
- [x] AC-LOYAL-004: Birthday bonus of 50 points is awarded on the 1st of the customer's birthday month (if DOB set)
- [x] AC-LOYAL-005: Silver tier customers earn 1.5x purchase points; Gold tier earns 2x
- [x] AC-LOYAL-006: Silver tier customers earn an additional 5% bonus on gaming product line items
- [x] AC-LOYAL-007: Gold tier customers earn an additional 10% bonus on gaming product line items
- [x] AC-LOYAL-008: Product registration awards 50 pending points; confirmed after 72-hour hold
- [x] AC-LOYAL-009: Referral reward of 200 points is credited when referred friend's first order completes
- [x] AC-LOYAL-010: A full order refund deducts all purchase points awarded on the order

### 16.2 Points Redemption

- [x] AC-LOYAL-011: Customer cannot redeem fewer than 500 points
- [x] AC-LOYAL-012: Customer cannot redeem more than 50% of order subtotal value
- [x] AC-LOYAL-013: Loyalty points toggle and promotional discount codes cannot both be active on the same order
- [x] AC-LOYAL-014: Points used in redemption are deducted from balance on order confirmation, not order placement
- [x] AC-LOYAL-015: A cancelled order after points redemption restores the redeemed points

### 16.3 Tier Management

- [x] AC-LOYAL-016: A Bronze customer whose qualifying purchase points reach 1,000 is upgraded to Silver immediately
- [x] AC-LOYAL-017: Tier downgrade does not occur in real-time; it is applied on the monthly evaluation job only
- [x] AC-LOYAL-018: Gold tier customers receive free standard shipping automatically at checkout
- [x] AC-LOYAL-019: A manual tier override is applied and shown to the customer; it expires on the set date

### 16.4 Expiry and Maintenance

- [x] AC-LOYAL-020: An account inactive for 11 months receives a 30-day expiry warning email
- [x] AC-LOYAL-021: An account inactive for 12 months has all points expired (total_points set to 0)
- [x] AC-LOYAL-022: A purchase or login resets the inactivity clock and prevents expiry
- [x] AC-LOYAL-023: Lifetime points are never decremented (not affected by redemptions or expiry)

### 16.5 Admin

- [x] AC-LOYAL-024: Admin can manually adjust (add or deduct) points with a required reason
- [x] AC-LOYAL-025: Manual adjustment creates a LoyaltyTransaction audit record
- [x] AC-LOYAL-026: Points balance cannot be reduced below zero by manual adjustment
- [x] AC-LOYAL-027: Bulk points award from CSV creates individual transaction records per customer

### 16.6 UI

- [x] AC-LOYAL-028: Authenticated users see their points balance in the site header
- [x] AC-LOYAL-029: Product pages display potential points earn for the logged-in customer's tier
- [x] AC-LOYAL-030: Checkout order review shows an accurate points-earned preview before order placement
- [x] AC-LOYAL-031: /account/loyalty shows full points history with pagination

---

## 17. Phase 4 Considerations

### 17.1 Third-Party Loyalty Platform Evaluation

In Phase 4, TwinMOS will evaluate whether the custom loyalty engine should be replaced or supplemented by a third-party loyalty SaaS platform. Evaluation criteria:

| Criterion                     | Notes                                             |
|-------------------------------|---------------------------------------------------|
| Multi-market support          | Must support AED, INR, BDT, SAR, USD natively    |
| API-first integration         | Must integrate with Medusa.js v2 via webhooks/API |
| White-label UI                | Prefer platforms with embeddable UI components    |
| Cost                          | Compare total cost of ownership vs. custom build  |
| Candidate platforms           | Yotpo, LoyaltyLion, Smile.io, Annex Cloud        |

Decision point: If enrolled members exceed 50,000 OR if program complexity exceeds Phase 3 scope, trigger Phase 4 evaluation.

### 17.2 Additional Phase 4 Features

| Feature                        | Description                                          |
|--------------------------------|------------------------------------------------------|
| Product review points          | 30 pts per verified review submission                |
| Social sharing bonus           | Points for sharing products on social media          |
| Gamification                   | Badges, challenges, streaks                          |
| Partner loyalty (B2B)          | Separate loyalty program for distributor staff       |
| Loyalty coalition              | Partnership with regional loyalty networks           |
| Personalized offers            | AI-driven offers based on purchase history           |
| HaveIBeenPwned integration     | Flag accounts using breached passwords              |
| Points gifting                 | Transfer points to family member accounts (optional) |

---

## 18. Appendix

### 18.1 Points Value Reference Table

| Currency | Points per Unit | Redemption: 100 pts = | Min Redemption (500 pts) | Max/Order (2,740 pts on AED 548 order) |
|----------|-----------------|-----------------------|---------------------------|----------------------------------------|
| AED      | 10 per AED 10   | AED 1                 | AED 5                     | AED 27.40                              |
| INR      | 10 per INR 100  | INR 10                | INR 50                    | INR 274                                |
| BDT      | 10 per BDT 100  | BDT 10                | BDT 50                    | BDT 274                                |
| SAR      | 10 per SAR 10   | SAR 1                 | SAR 5                     | SAR 27.40                              |
| USD      | 10 per USD 1    | USD 1                 | USD 5                     | USD 27.40                              |

### 18.2 Tier Qualification Reference

| Tier   | Qualifying Points (12-month rolling) | Approx. Spend (AED) | Approx. Spend (USD) |
|--------|--------------------------------------|---------------------|---------------------|
| Bronze | 0 – 999                              | AED 0 – 999         | USD 0 – 99.9        |
| Silver | 1,000 – 4,999                        | AED 1,000 – 4,999   | USD 100 – 499       |
| Gold   | 5,000+                               | AED 5,000+          | USD 500+            |

### 18.3 Revision History

| Version | Date       | Author                   | Changes                          |
|---------|------------|--------------------------|----------------------------------|
| 1.0     | 2026-05-01 | TwinMOS Digital Product  | Initial draft                    |

### 18.4 Open Questions

| ID     | Question                                                                        | Owner           | Due         |
|--------|---------------------------------------------------------------------------------|-----------------|-------------|
| OQ-001 | Marketing: Confirm "TwinMOS Rewards" as final program name                     | Marketing Dir   | 2026-05-15  |
| OQ-002 | Finance: Confirm acceptable points liability ceiling as % of monthly revenue    | CFO / Finance   | 2026-05-15  |
| OQ-003 | Legal: Confirm that existing customers can be emailed about program launch (transactional vs. marketing?) | Legal | 2026-05-30 |
| OQ-004 | Engineering: Confirm Strapi v5 can handle scheduled cron jobs natively or needs external scheduler | Eng Lead | 2026-05-15 |
| OQ-005 | Product: Should Gold free shipping apply to all shipping methods or standard only? | Product Mgr   | 2026-05-15  |

---

*Document Reference: TWN-P3-LOYAL-2026-001 | Version 1.0 | TwinMOS Technologies*
