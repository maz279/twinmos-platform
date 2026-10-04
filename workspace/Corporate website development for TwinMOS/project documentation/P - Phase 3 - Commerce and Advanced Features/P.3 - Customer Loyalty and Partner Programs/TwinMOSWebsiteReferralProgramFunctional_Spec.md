# TwinMOS Technologies — Referral Program Functional Specification

| Field            | Value                                     |
|------------------|-------------------------------------------|
| Document Ref     | TWN-P3-REFER-2026-001                     |
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
2. [Program Overview](#2-program-overview)
3. [Referral Mechanics](#3-referral-mechanics)
4. [Referral Flow — End to End](#4-referral-flow-end-to-end)
5. [Reward Structure](#5-reward-structure)
6. [Data Model](#6-data-model)
7. [Attribution Tracking](#7-attribution-tracking)
8. [Fraud Prevention](#8-fraud-prevention)
9. [Admin Features](#9-admin-features)
10. [Customer-Facing UI](#10-customer-facing-ui)
11. [Email Communications](#11-email-communications)
12. [Program Terms and Conditions](#12-program-terms-and-conditions)
13. [Business Rules](#13-business-rules)
14. [Analytics and Reporting](#14-analytics-and-reporting)
15. [Acceptance Criteria](#15-acceptance-criteria)
16. [Phase 4 Expansion](#16-phase-4-expansion)
17. [Appendix](#17-appendix)

---

## 1. Document Purpose and Scope

### 1.1 Purpose

This specification defines the complete functional requirements for the TwinMOS "Refer & Earn" program. The referral program enables existing TwinMOS customers to share their personal referral link with friends and earn loyalty points when referred friends make their first purchase. The program aims to acquire new customers cost-effectively through authentic word-of-mouth recommendations, with a double-sided reward structure that benefits both the referrer and the new customer.

This document is intended for:

- **Back-end engineers** implementing referral tracking, attribution, and reward logic in Strapi v5 and Medusa.js v2
- **Front-end engineers** building the referral UI in Astro 5 (/account/referrals and checkout)
- **QA engineers** writing test cases against acceptance criteria
- **Marketing team** for program launch, copy review, and share template content
- **Legal and compliance** reviewing program terms and fraud controls

### 1.2 Scope

This specification covers:

- Referral link and code generation
- End-to-end referral attribution flow (click → registration → first purchase → reward)
- Double-sided reward mechanics (referrer points + referee discount)
- Referral data model in Strapi v5
- Attribution tracking (cookie + UTM)
- Fraud prevention rules
- Admin management interface
- Customer-facing referral dashboard (/account/referrals)
- Referral email templates via Resend
- Business rules, analytics, and acceptance criteria

### 1.3 Out of Scope

- Loyalty points program mechanics (covered in TWN-P3-LOYAL-2026-001)
- Customer account management (covered in TWN-P3-CUST-2026-001)
- Partner/distributor referrals (partners are governed by MDF program)
- Affiliate marketing program (separate business initiative, not Phase 3)
- Referral leaderboard and tiered bonuses (Phase 4)

### 1.4 Related Documents

| Document Reference       | Title                                              |
|--------------------------|----------------------------------------------------|
| TWN-P3-CUST-2026-001     | Customer Account Specification                     |
| TWN-P3-LOYAL-2026-001    | Loyalty Program Functional Specification           |
| TWN-P3-ECOM-2026-001     | E-Commerce Core Specification                      |
| TWN-P3-MDF-2026-001      | MDF Program Functional Specification               |

---

## 2. Program Overview

### 2.1 Program Name

**TwinMOS Refer & Earn**

*Note: Subject to Marketing Director approval before launch. Alternative proposed: "TwinMOS Share & Earn."*

### 2.2 Program Tagline (Proposed)

*"Share TwinMOS. Your friend saves. You earn."*

### 2.3 Program Goal

| Goal                          | Target                                    | Measurement                             |
|-------------------------------|-------------------------------------------|-----------------------------------------|
| New customer acquisition      | 15% of new registrations from referrals   | Registration source tracking (PostHog)  |
| Customer acquisition cost     | 50% lower CAC vs. paid ads (referral channel) | Finance report                      |
| Referral conversion rate      | > 25% of shares convert to registration   | Referral click-to-register ratio        |
| Purchase conversion rate      | > 40% of referred registrants make first purchase | Referral registration-to-purchase |
| Referrer engagement           | Referral program used by > 20% of Bronze+ members | Strapi referral code usage count |

### 2.4 Value Proposition

**For the Referrer (existing customer):**
- Earn 200 loyalty points per successful referral (= AED 2 / USD 2 redemption value)
- Gold tier members earn an additional 100 points per successful referral
- Satisfaction of helping friends get the best performance hardware at a discount

**For the Referee (new customer):**
- 10% off their first TwinMOS order — automatically applied, no code required
- Introduced to TwinMOS through a trusted personal recommendation
- Immediately enrolled in TwinMOS Rewards on registration

### 2.5 Program Positioning vs. Alternatives

| Channel         | Est. CAC     | Quality      | Referral Program Advantage            |
|-----------------|--------------|--------------|---------------------------------------|
| Paid Search     | USD 25–40    | Medium       | Referral: warm lead, higher trust     |
| Social Media Ads| USD 20–35    | Medium-Low   | Referral: personal recommendation     |
| Influencer      | USD 15–30    | Medium       | Referral: peer-to-peer (higher trust) |
| Referral Program| USD 5–10*   | High         | Lowest CAC; authentic advocacy        |

*Estimated referral CAC = discount cost (10% of first order) + referrer reward (200 pts ≈ USD 2 equivalent)

---

## 3. Referral Mechanics

### 3.1 Program Participants

| Role     | Definition                                                         | Requirements                                |
|----------|--------------------------------------------------------------------|---------------------------------------------|
| Referrer | An existing registered TwinMOS customer who shares their referral link | Must have at least 1 completed order; account in good standing |
| Referee  | A new person who clicks a referral link and makes their first purchase | Must be a new customer (no prior account); must not be the referrer |

### 3.2 Referral Link Format

Each registered customer has a unique referral link:

```
https://twinmos.com/join?ref=ABC123
```

Where `ABC123` is a **6-character alphanumeric referral code** unique to the customer:
- Characters: A-Z and 0-9 (uppercase, case-insensitive)
- Format: 6 characters, e.g. `AHM123`, `TW9X47`, `MEM5Q2`
- Generated at account creation (alongside the LoyaltyAccount setup)
- Permanent — does not change unless flagged for fraud

**Short link alternative** (Phase 4): `twinmos.com/r/AHM123` via Cloudflare redirect rules.

### 3.3 Referral Code

The 6-character referral code (`AHM123`) can also be entered manually:

- On the registration page: optional "Referral code (optional)" field
- At checkout for first-time users: "Do you have a referral code?" field (before account creation)
- The code is case-insensitive (`ahm123` = `AHM123`)

### 3.4 Referral Attribution Window

- **Cookie-based attribution:** When a referee clicks a referral link, a first-party cookie is set:
  - Name: `_twinmos_ref`
  - Value: referral code (`AHM123`)
  - Expiry: 30 days
  - HttpOnly: false (readable by Astro SSR; not sensitive data)
  - Secure: true
  - SameSite: Lax (allows cross-site navigation from shared link)

- **30-day attribution window:** The referee must register and complete a first purchase within 30 days of clicking the referral link for the referrer to receive a reward.

- **Last-click attribution:** If a referee clicks multiple referral links, the most recent referral code within the 30-day window is attributed. Only one referrer can be credited per referee.

### 3.5 Minimum Order Value for Conversion

The referee's first purchase must meet a minimum order value to qualify as a successful referral conversion and trigger the referrer reward:

| Region         | Currency | Minimum Order Value |
|----------------|----------|---------------------|
| UAE            | AED      | AED 50              |
| India          | INR      | INR 500             |
| Bangladesh     | BDT      | BDT 500             |
| KSA            | SAR      | SAR 50              |
| International  | USD      | USD 15              |

Orders below the minimum value do not trigger the referrer reward. The referee still receives their 10% discount as this was already applied at checkout.

---

## 4. Referral Flow — End to End

### 4.1 Complete Flow Diagram

```
REFERRER SIDE                              REFEREE SIDE
─────────────────                          ──────────────────────────────────────

[1] Referrer logs into                     
    /account/referrals                     
          │                                
          ▼                                
[2] Copies referral link                   
    twinmos.com/join?ref=AHM123            
          │                                
          │  shares via WhatsApp /         
          │  email / social media          
          │                                
          └────────────────────────────────► [3] Referee clicks link
                                                    │
                                                    ▼
                                           [4] Landing: /join?ref=AHM123
                                               ├── Cookie set: _twinmos_ref=AHM123
                                               ├── Banner: "Your friend shared a 10%
                                               │   off offer for your first order!"
                                               └── Redirect to homepage or
                                                   registration page
                                                    │
                                                    ▼
                                           [5] Referee registers
                                               ├── Registration page shows:
                                               │   "Referral code: AHM123 applied"
                                               ├── ReferralEvent created:
                                               │   status: 'pending_purchase'
                                               └── Referee account linked to referrer
                                                    │
                                                    ▼
                                           [6] Referee browses and adds to cart
                                                    │
                                                    ▼
                                           [7] Referee at checkout
                                               ├── 10% first-order discount
                                               │   applied automatically
                                               ├── Banner: "Your referral discount
                                               │   (10%) is applied"
                                               └── Referee completes purchase
                                                   (min order value met)
                                                    │
                                                    ▼
                                           [8] order.completed event
                                               ├── ReferralEvent status → 'pending_reward'
                                               │   (14-day hold starts)
                                               └── Returns/fraud check window open

[9] 14 days pass without refund/return
          │
          ▼
[10] Referral reward confirmed
     ├── 200 pts awarded to referrer
     │   (or 300 pts if referrer is Gold tier)
     ├── ReferralEvent status → 'completed'
     ├── ReferralReward created
     └── Email sent to referrer:
         "Your friend made their first purchase!
          200 points added to your account."
```

### 4.2 Registration with Referral

When a referee registers via referral link:

```
GET /join?ref=AHM123
          │
          ▼
Astro SSR middleware:
  ├── Read ref parameter from URL
  ├── Validate ref code: look up ReferralCode in Strapi
  │     ├── Valid and active → proceed
  │     └── Invalid/inactive → silently ignore (don't show error; continue to homepage)
  ├── Set cookie: _twinmos_ref=AHM123 (30-day expiry)
  └── Show welcome banner on homepage/registration page

Registration page:
  ├── Read cookie: _twinmos_ref
  ├── Pre-fill referral code field (read-only display)
  └── Show banner: "Your 10% first-order discount is ready when you sign up!"

POST /api/auth/register (with ref code from cookie)
  ├── Create auth_user + Medusa customer + LoyaltyAccount
  ├── Validate ref code:
  │     ├── Check referrer account has completed order (referrer eligibility)
  │     ├── Check referee email not already associated with referrer
  │     └── Self-referral check
  ├── Create ReferralEvent:
  │     status: 'pending_purchase'
  │     referrer_id: (from ReferralCode.user_id)
  │     referee_id: (new customer ID)
  └── Clear _twinmos_ref cookie
```

### 4.3 First Purchase with Referral Discount

The 10% referee discount is applied as a Medusa Promotion:

```typescript
// Create referee first-order discount on registration

async function createRefereeDiscount(refereeCustomerId: string): Promise<void> {
  const promoCode = `REF10_${generateSecureToken(8).toUpperCase()}`;

  await medusaClient.promotions.create({
    code: promoCode,
    type: 'percentage',
    application_method: {
      type: 'percentage',
      value: 10,   // 10% off
    },
    customer_eligibility: {
      customer_ids: [refereeCustomerId],   // Single customer only
    },
    usage_limit: 1,                         // One-time use
    is_automatic: true,                     // Applied automatically at checkout
    metadata: {
      source: 'referral',
      referee_customer_id: refereeCustomerId,
    }
  });

  // Store promo code on ReferralEvent for audit trail
  await strapiClient.updateReferralEvent(eventId, {
    referee_discount_code: promoCode,
    referee_discount_expires_at: addDays(new Date(), 30),
  });
}
```

### 4.4 Reward Hold Period

After the referee's first order is confirmed:

1. `ReferralEvent.status` → `'pending_reward'`
2. A 14-day hold period begins
3. The hold is to account for:
   - Return window (TwinMOS return policy: 14 days for change of mind)
   - Fraud detection (time to flag suspicious orders)
4. At end of hold period: check if order has been returned/refunded
   - Not returned → reward confirmed → award 200 pts to referrer
   - Returned → reward cancelled → no points awarded

### 4.5 Reward Confirmation Job

```typescript
// Scheduled job: confirm-referral-rewards
// CRON: '0 9 * * *' (9am UTC daily)

export async function confirmReferralRewards() {
  const pendingRewards = await strapi.entityService.findMany(
    'api::referral-event.referral-event',
    {
      filters: {
        status: 'pending_reward',
        referee_order_confirmed_at: { $lte: subDays(new Date(), 14) },
      }
    }
  );

  for (const event of pendingRewards) {
    // Check if order was returned/refunded
    const order = await medusaClient.orders.retrieve(event.referee_order_id);

    if (['returned', 'canceled'].includes(order.status)) {
      await strapi.entityService.update(
        'api::referral-event.referral-event',
        event.id,
        { data: { status: 'cancelled', cancellation_reason: 'order_returned' } }
      );
      continue;
    }

    // Confirm reward
    const referrer = await loyaltyService.getAccountByUserId(event.referrer_id);
    const bonusPoints = referrer.tier === 'gold' ? 300 : 200;

    await loyaltyService.awardPoints(referrer.id, {
      transaction_type: 'referral',
      points_delta: bonusPoints,
      source_type: 'referral',
      source_id: event.id,
      description: `Referral reward — friend made their first purchase`,
    });

    await strapi.entityService.update(
      'api::referral-event.referral-event',
      event.id,
      {
        data: {
          status: 'completed',
          reward_issued_at: new Date(),
        }
      }
    );

    // Send reward email to referrer
    await emailService.sendReferralRewardEarned({
      referrerUserId: event.referrer_id,
      pointsEarned: bonusPoints,
    });

    // Update ReferralCode stats
    await strapi.entityService.update(
      'api::referral-code.referral-code',
      referrer.referral_code_id,
      { data: { total_conversions: { $increment: 1 } } }
    );
  }
}
```

---

## 5. Reward Structure

### 5.1 Referrer Reward

| Referrer Tier | Points Awarded per Successful Referral | Redemption Value        |
|---------------|----------------------------------------|-------------------------|
| Bronze        | 200 points                             | AED 2 / USD 2           |
| Silver        | 200 points                             | AED 2 / USD 2           |
| Gold          | 300 points (+100 Gold bonus)           | AED 3 / USD 3           |

**Timing:** Referrer rewards are credited **14 days after the referee's first order** is confirmed (hold period for returns).

**Credit mechanism:** Points are added to the referrer's `LoyaltyAccount.total_points` via a `LoyaltyTransaction` with `transaction_type: 'referral'`.

**Do referral points count toward tier?** No. Referral points count toward the `total_points` balance (redeemable) but NOT toward the rolling 12-month tier qualification metric. See BR-LOYAL-016 in TWN-P3-LOYAL-2026-001.

### 5.2 Referee Reward

| Reward Type    | Value           | Mechanism                        | Expiry       |
|----------------|-----------------|----------------------------------|--------------|
| First-order discount | 10% off entire order | Medusa Promotion (automatic) | 30 days from registration |

**Application:** The discount is applied automatically at checkout for the referee's first order. No code entry required. The checkout displays a banner: "Referral discount (10%) applied automatically."

**Stacking constraints:**
- The 10% referral discount cannot be stacked with other promotional discount codes
- The 10% referral discount CAN be combined with loyalty points redemption
- The 10% discount applies to the order subtotal before loyalty redemption

**Expiry:** If the referee does not make a purchase within 30 days of registration, the 10% discount Medusa promotion expires and is no longer available. The referee can still make a purchase but without the discount; the referrer receives no reward from this latent purchase.

### 5.3 Reward Summary Table

| Scenario                                      | Referrer Gets           | Referee Gets         |
|-----------------------------------------------|-------------------------|----------------------|
| Referee registers + purchases (min value met) | 200 pts (Bronze/Silver) | 10% off first order  |
| Same, but referrer is Gold tier               | 300 pts                 | 10% off first order  |
| Referee registers but doesn't purchase        | 0 pts                   | 10% off (30-day expiry) |
| Referee registers + purchases below min value | 0 pts                   | 10% off (already used) |
| Referee purchases and then returns the order  | 0 pts (reward cancelled)| Discount not reversed |
| Self-referral detected                        | 0 pts (blocked)         | No discount applied  |

---

## 6. Data Model

### 6.1 Strapi v5 Collection: ReferralCode

```javascript
// Strapi v5 Collection Type

module.exports = {
  kind: 'collectionType',
  collectionName: 'referral_codes',
  info: {
    singularName: 'referral-code',
    pluralName: 'referral-codes',
    displayName: 'Referral Code',
  },
  attributes: {
    // Linked to customer
    user_id: {
      type: 'string',
      required: true,
      unique: true,
      description: 'Better Auth user UUID of the code owner (referrer)',
    },
    customer_id: {
      type: 'string',
      required: true,
      unique: true,
      description: 'Medusa customer ID',
    },

    // Code
    code: {
      type: 'string',
      required: true,
      unique: true,
      maxLength: 6,
      description: '6-character alphanumeric referral code (uppercase)',
    },

    // Status
    is_active: {
      type: 'boolean',
      required: true,
      default: true,
      description: 'Code can be deactivated by admin (fraud, abuse)',
    },
    deactivated_at: {
      type: 'datetime',
    },
    deactivation_reason: {
      type: 'string',
    },

    // Stats (denormalized for performance)
    total_clicks: {
      type: 'integer',
      default: 0,
      description: 'Total link clicks (from landing page)',
    },
    total_registrations: {
      type: 'integer',
      default: 0,
      description: 'Total registrations attributed to this code',
    },
    total_conversions: {
      type: 'integer',
      default: 0,
      description: 'Total successful referrals (purchase + reward issued)',
    },

    // Relationships
    referral_events: {
      type: 'relation',
      relation: 'oneToMany',
      target: 'api::referral-event.referral-event',
      mappedBy: 'referral_code',
    },
  },
};
```

### 6.2 Strapi v5 Collection: ReferralEvent

```javascript
module.exports = {
  kind: 'collectionType',
  collectionName: 'referral_events',
  info: {
    singularName: 'referral-event',
    pluralName: 'referral-events',
    displayName: 'Referral Event',
  },
  attributes: {
    // Participants
    referrer_id: {
      type: 'string',
      required: true,
      description: 'Better Auth user ID of referrer',
    },
    referee_id: {
      type: 'string',
      required: true,
      description: 'Better Auth user ID of referee (new customer)',
    },
    referral_code: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'api::referral-code.referral-code',
      inversedBy: 'referral_events',
    },

    // Attribution
    click_ip: {
      type: 'string',
      description: 'IP address when referral link was clicked',
    },
    click_at: {
      type: 'datetime',
      description: 'When the referral link was clicked',
    },
    registration_at: {
      type: 'datetime',
      description: 'When the referee registered',
    },
    utm_source: {
      type: 'string',
      description: 'UTM source from referral link click',
    },
    utm_medium: {
      type: 'string',
    },
    utm_campaign: {
      type: 'string',
    },
    referral_channel: {
      type: 'enumeration',
      enum: ['link', 'code_manual', 'whatsapp', 'email', 'twitter', 'other'],
      description: 'How the referral was shared',
    },

    // Discount
    referee_discount_code: {
      type: 'string',
      description: 'Medusa promotion code issued to referee',
    },
    referee_discount_expires_at: {
      type: 'datetime',
    },
    referee_discount_used: {
      type: 'boolean',
      default: false,
    },

    // Purchase tracking
    referee_order_id: {
      type: 'string',
      description: 'Medusa order ID of referee first purchase',
    },
    referee_order_total: {
      type: 'decimal',
      description: 'Order total at time of purchase',
    },
    referee_order_currency: {
      type: 'string',
    },
    referee_order_confirmed_at: {
      type: 'datetime',
    },
    meets_minimum_order_value: {
      type: 'boolean',
      description: 'Does the order meet the minimum value for reward trigger?',
    },

    // Reward
    status: {
      type: 'enumeration',
      enum: [
        'pending_purchase',    // Referee registered, not yet purchased
        'pending_reward',      // Referee purchased, in 14-day hold
        'completed',           // Reward issued to referrer
        'cancelled',           // Order returned/fraud/below minimum
        'expired',             // Attribution window expired without purchase
        'fraud_flagged',       // Flagged for review
      ],
      required: true,
      default: 'pending_purchase',
    },
    reward_issued_at: {
      type: 'datetime',
    },
    cancellation_reason: {
      type: 'string',
      description: 'If cancelled: reason code (order_returned, fraud, below_minimum, expired)',
    },

    // Admin
    admin_notes: {
      type: 'text',
    },
    fraud_flag_reason: {
      type: 'string',
    },
    manually_approved_by: {
      type: 'string',
      description: 'Admin user ID if reward manually approved despite flag',
    },
  },
};
```

### 6.3 Strapi v5 Collection: ReferralReward

```javascript
module.exports = {
  kind: 'collectionType',
  collectionName: 'referral_rewards',
  info: {
    singularName: 'referral-reward',
    pluralName: 'referral-rewards',
    displayName: 'Referral Reward',
  },
  attributes: {
    referral_event: {
      type: 'relation',
      relation: 'oneToOne',
      target: 'api::referral-event.referral-event',
    },
    reward_type: {
      type: 'enumeration',
      enum: ['points', 'discount'],
      required: true,
    },
    recipient_type: {
      type: 'enumeration',
      enum: ['referrer', 'referee'],
      required: true,
    },
    recipient_user_id: {
      type: 'string',
    },
    amount: {
      type: 'decimal',
      description: 'Points amount or discount percentage',
    },
    currency: {
      type: 'string',
      description: 'For discount rewards: currency of the discount',
    },
    loyalty_transaction_id: {
      type: 'string',
      description: 'Linked LoyaltyTransaction ID (for points rewards)',
    },
    issued_at: {
      type: 'datetime',
    },
    expires_at: {
      type: 'datetime',
      description: 'For discount rewards: expiry date',
    },
    is_reversed: {
      type: 'boolean',
      default: false,
    },
    reversed_at: {
      type: 'datetime',
    },
    reversal_reason: {
      type: 'string',
    },
  },
};
```

### 6.4 Database Indexes

```sql
-- Referral code lookups
CREATE UNIQUE INDEX idx_referral_code_code ON referral_codes(code);
CREATE INDEX idx_referral_code_user ON referral_codes(user_id);
CREATE INDEX idx_referral_code_customer ON referral_codes(customer_id);

-- Referral event lookups
CREATE INDEX idx_referral_event_referrer ON referral_events(referrer_id);
CREATE INDEX idx_referral_event_referee ON referral_events(referee_id);
CREATE INDEX idx_referral_event_status ON referral_events(status);
CREATE INDEX idx_referral_event_order ON referral_events(referee_order_id);
CREATE INDEX idx_referral_event_hold ON referral_events(referee_order_confirmed_at)
  WHERE status = 'pending_reward';
```

---

## 7. Attribution Tracking

### 7.1 Cookie Attribution

When a referee clicks a referral link (`/join?ref=AHM123`):

```typescript
// Astro middleware: referral-tracking.ts

export async function onRequest(context: APIContext, next: MiddlewareNext) {
  const url = new URL(context.request.url);
  const refCode = url.searchParams.get('ref');

  if (refCode && context.url.pathname === '/join') {
    // Validate the referral code
    const isValid = await validateReferralCode(refCode);

    if (isValid) {
      // Set first-party cookie
      context.cookies.set('_twinmos_ref', refCode.toUpperCase(), {
        maxAge: 60 * 60 * 24 * 30,  // 30 days
        secure: true,
        sameSite: 'lax',
        path: '/',
      });

      // Track click in Strapi (async, non-blocking)
      trackReferralClick(refCode, context.clientAddress, url.toString());
    }
  }

  return next();
}
```

### 7.2 Click Tracking

Each click on a referral link increments `ReferralCode.total_clicks`. Click tracking is fire-and-forget (non-blocking) to avoid adding latency to the landing page load:

```typescript
async function trackReferralClick(
  code: string,
  ipAddress: string,
  fullUrl: string
): Promise<void> {
  // Non-blocking: don't await
  strapiClient.referralCodes.incrementClicks(code, {
    ip: ipAddress,
    url: fullUrl,
    clicked_at: new Date(),
  }).catch(err => logger.warn('Referral click tracking failed', err));
}
```

### 7.3 UTM Parameters

To enable referral channel analysis, the referral page and sharing buttons append UTM parameters:

| Share Channel | UTM Parameters                                          |
|---------------|---------------------------------------------------------|
| WhatsApp      | `?ref=AHM123&utm_source=whatsapp&utm_medium=referral&utm_campaign=refer_earn` |
| Email         | `?ref=AHM123&utm_source=email&utm_medium=referral&utm_campaign=refer_earn`    |
| Twitter/X     | `?ref=AHM123&utm_source=twitter&utm_medium=referral&utm_campaign=refer_earn`  |
| Copied link   | `?ref=AHM123&utm_source=direct&utm_medium=referral&utm_campaign=refer_earn`   |

UTM parameters are stored on the `ReferralEvent` record when created (at referee registration), enabling channel-level attribution reporting.

### 7.4 Attribution Priority

If a referee arrives via a referral link AND has also been exposed to paid advertising (e.g., Google Ads):

- **For referral reward purposes:** Last-click referral cookie attribution applies (referral gets credit if cookie is present)
- **For general marketing attribution:** Marketing team uses PostHog + UTM data for multi-touch analysis; referral is one signal among many
- **Conflict rule:** If both a promo code (from Google Ads landing page) and a referral cookie exist, the referral cookie takes precedence for reward attribution

---

## 8. Fraud Prevention

### 8.1 Fraud Detection Rules

| Fraud Vector               | Detection Rule                                         | Action                            |
|----------------------------|--------------------------------------------------------|-----------------------------------|
| Self-referral by email     | Referrer email == referee email                        | Block at registration; error shown |
| Self-referral by IP        | Same IP for referrer account + referee registration    | Flag ReferralEvent; hold reward   |
| Self-referral by device    | Same device fingerprint (browser fingerprint)         | Flag for manual review            |
| Account age requirement    | Referrer must have completed at least 1 order         | Block code sharing until eligible  |
| Referral farming (many accounts) | Referee email domain pattern (e.g., all +tag variations) | Flag account; pause code         |
| Annual cap                 | Max 50 successful referrals per referrer per calendar year | Block reward above cap          |
| Reward hold period         | 14-day hold allows return window to pass              | Reward deferred                   |
| Minimum order value        | Order must meet regional minimum                       | Reward not triggered if below     |
| Disposable email detection | Flag referee registrations from known disposable email providers | Require email verification; hold reward |

### 8.2 Self-Referral Detection Flow

```
Referee attempts to register using referral code
          │
          ▼
Self-referral checks:
  1. Email match: referee email == referrer email?
     └── YES → Block: "You cannot use your own referral code"
  
  2. IP match: referee registration IP == referrer last login IP?
     └── SAME → Flag ReferralEvent as 'fraud_flagged'
               Hold reward for manual review
               DO NOT block registration (too aggressive; VPN/home network)
  
  3. Device fingerprint match (Phase 4):
     └── SAME → Flag for manual review
  
  4. Account age: referrer has 0 completed orders?
     └── TRUE → Do not allow referral link to work
               Show: "You'll be able to share your referral link after
                      making your first purchase!"
```

### 8.3 Annual Cap on Referrals

A referrer can earn a maximum of **50 successful referral rewards per calendar year** (January 1 – December 31). This prevents referral farming operations where accounts are created purely to generate referral income.

```
Check at reward confirmation time:
  successful_referrals_this_year = COUNT(
    ReferralEvent WHERE referrer_id = X
    AND status = 'completed'
    AND reward_issued_at >= '2026-01-01'
  )

  IF successful_referrals_this_year >= 50:
    → Do not issue reward
    → Set ReferralEvent.status = 'cancelled'
    → Set cancellation_reason = 'annual_cap_exceeded'
    → Email referrer: "You've reached the maximum of 50 referral 
       rewards for this year. Your limit resets on 1 January 2027."
```

### 8.4 Reward Hold Period Security

The 14-day hold period after referee's first purchase serves as the primary defense against buy-and-return referral fraud:

```
Order completed → status: 'pending_reward' → 14-day hold
          │
          ├── If order returned within 14 days:
          │   Fulfillment event detected → status: 'cancelled'
          │   Reason: 'order_returned'
          │   No reward issued
          │
          └── If 14 days pass without return:
              Daily job confirms reward
              status: 'completed'
              Points awarded
```

### 8.5 Disposable Email Detection

Referee registrations using known disposable email services (Mailinator, Guerrilla Mail, temp-mail.org, etc.) are flagged:

- **Database:** Maintained list of disposable email domains (open-source blocklist, updated monthly)
- **Action:** Registration allowed but email verification is strictly required before discount is applied
- **Reward:** Held for 14 days post-purchase (standard hold); manually reviewed if suspicious

### 8.6 Code Deactivation by Admin

Admin can deactivate a referral code for any account. Use cases:
- Account suspected of referral fraud
- Customer requested account deletion (code automatically deactivated)
- Partner account (partners do not participate in consumer referral program)

Deactivated codes:
- No longer work for new referrals
- Existing `ReferralEvent` records in `pending_purchase` status are moved to `cancelled`
- `pending_reward` events are held for manual review (reward was earned; admin decides)

---

## 9. Admin Features

### 9.1 Referral Program Dashboard (Strapi Admin)

```
TwinMOS Refer & Earn — Admin Dashboard
─────────────────────────────────────────────────────────────
Program Status: [ACTIVE]                    [Pause Program]

This Month:
  Total referral links shared:    847
  Referee registrations:          312  (36.8% of clicks)
  Successful conversions:         127  (40.7% of registrations)
  Conversion rate:                15.0%  (clicks to purchase)
  Rewards issued:                 127 × 200 pts = 25,400 pts
  Revenue from referral orders:   AED 47,329

All Time:
  Total successful referrals:     1,247
  Total rewards issued:           249,400 pts
  Total referral revenue:         AED 421,003
─────────────────────────────────────────────────────────────
```

### 9.2 Referral Event List View

Strapi admin table of all referral events with filters:

| Filter                | Options                                    |
|-----------------------|--------------------------------------------|
| Status                | pending_purchase, pending_reward, completed, cancelled, fraud_flagged |
| Date range            | Created, reward issued                     |
| Referrer customer ID  | Lookup by customer                         |
| Referee customer ID   | Lookup by customer                         |

Columns displayed:
- Referral code
- Referrer name / email
- Referee name / email
- Click date, Registration date, Purchase date
- Order value
- Reward amount (pts)
- Status
- Actions: [View] [Approve Reward] [Cancel] [Flag Fraud]

### 9.3 Individual Customer Referral View

From any customer record in Strapi:

```
Customer: Ahmed Al-Rashidi
─────────────────────────────────────────
Referral Code: AHM123          [Deactivate]
Code Status:   Active
Total Clicks:  47
Registrations: 12
Conversions:   5   (successful referrals)
Points Earned: 1,000 pts from referrals
─────────────────────────────────────────
Referral Events:
  [Paginated table of ReferralEvents for this referrer]
```

### 9.4 Manual Reward Override

Admin can manually approve or cancel a reward for a flagged or edge-case referral event:

| Action              | Condition                                | Audit Requirement                    |
|---------------------|------------------------------------------|--------------------------------------|
| Approve reward      | fraud_flagged → completed (manual)       | Admin user ID + justification text   |
| Cancel reward       | pending_reward → cancelled               | Admin user ID + cancellation reason  |
| Restore reward      | cancelled → pending review → completed   | Superadmin approval                  |

### 9.5 Program Pause / Resume

The referral program can be paused by an admin (e.g., for system maintenance, investigation, or seasonal change):

- **Paused:** New referral links continue to track clicks, but no new `ReferralEvent` records are created. Existing pending events continue to process normally.
- **Resume:** New referrals resume being tracked
- **Pause/resume is logged** with admin user ID and timestamp

### 9.6 Fraud Flagging

Admin can manually flag a referral event as `fraud_flagged`. This:
- Moves status to `fraud_flagged`
- Pauses reward processing
- Sends internal alert email to customer service team
- Does NOT automatically reverse referee's discount (already applied at checkout)
- Requires superadmin action to either confirm fraud (cancel reward) or clear flag (approve reward)

---

## 10. Customer-Facing UI

### 10.1 Route

`GET /account/referrals` — authenticated consumer (requires at least 1 completed order to share link)

### 10.2 Referral Dashboard — Full View

```
┌──────────────────────────────────────────────────────────────┐
│  Refer & Earn                                                │
├──────────────────────────────────────────────────────────────┤
│  Invite your friends to TwinMOS!                            │
│  They get 10% off their first order.                        │
│  You earn 200 points for each friend who buys.              │
│                                                              │
│  Your referral link:                                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  https://twinmos.com/join?ref=AHM123           [Copy] │  │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Share via:                                                  │
│  [WhatsApp]  [Email]  [Twitter/X]  [Copy Link]              │
│                                                              │
│  ──────────────────────────────────────────────────────     │
│                                                              │
│  Your Referral Stats                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Links Shared│  │  Friends Who │  │  Points Earned   │  │
│  │              │  │  Joined      │  │  From Referrals  │  │
│  │     47       │  │     12       │  │    1,000 pts     │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│                                                              │
│  Referral History                                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Friend      │ Joined     │ Purchased │ Status        │  │
│  │  Sana R.     │ 1 Apr 2026 │ Yes       │ Reward Earned │  │
│  │  Omar K.     │ 15 Mar 2026│ Yes       │ Reward Earned │  │
│  │  Priya M.    │ 1 Mar 2026 │ Pending   │ Awaiting purchase│  │
│  │  [Load more]                                          │  │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ──────────────────────────────────────────────────────     │
│  How it works                                               │
│  1. Share your unique link with friends                     │
│  2. Your friend signs up and gets 10% off their first order │
│  3. When they buy, you earn 200 points!                     │
│  ──────────────────────────────────────────────────────     │
│  [View full terms →]      twinmos.com/legal/referral-terms  │
└──────────────────────────────────────────────────────────────┘
```

### 10.3 Pre-Eligibility State (No Completed Orders)

A newly registered customer with no completed orders sees a modified referral page:

```
┌──────────────────────────────────────────────────────────────┐
│  Refer & Earn                                                │
├──────────────────────────────────────────────────────────────┤
│  Your referral link will be unlocked after your             │
│  first purchase!                                            │
│                                                              │
│  Make your first order to start sharing and earning.        │
│                                                              │
│  [SHOP NOW]                                                  │
└──────────────────────────────────────────────────────────────┘
```

### 10.4 Referral Landing Page (/join?ref=AHM123)

When a referee clicks the referral link, they land on:

```
┌──────────────────────────────────────────────────────────────┐
│  [TwinMOS Logo]                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Your friend invited you to TwinMOS!                        │
│                                                              │
│  Sign up and get 10% off your first order.                  │
│  The discount is applied automatically at checkout.         │
│                                                              │
│  [CREATE ACCOUNT AND CLAIM DISCOUNT]                         │
│                                                              │
│  Already have an account? Sign in                           │
│  (Existing customers are not eligible for the discount)     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 10.5 Social Sharing Templates

#### WhatsApp Share Template

```
Hey! I've been using TwinMOS for my RAM and SSD upgrades — 
great quality and fast shipping.

Use my link to sign up and get 10% off your first order:
https://twinmos.com/join?ref=AHM123&utm_source=whatsapp&utm_medium=referral&utm_campaign=refer_earn
```

#### Email Share Template

**Subject:** `Get 10% off your first TwinMOS order — my personal invite`

```
Hi [Friend's name],

I've been buying my RAM and SSDs from TwinMOS and thought you'd
love it too.

They have great products like DDR5 RAM and NVMe SSDs, and I've
always had a smooth experience.

Use my personal link to sign up and get 10% off your first order:
https://twinmos.com/join?ref=AHM123&utm_source=email&utm_medium=referral&utm_campaign=refer_earn

The discount is applied automatically — no code needed!

[Your name]
```

#### Twitter/X Share Template

```
Just upgraded my PC with @TwinMOS RAM and it's been a game changer!
Sign up with my link and get 10% off your first order:
https://twinmos.com/join?ref=AHM123&utm_source=twitter&utm_medium=referral&utm_campaign=refer_earn
#TwinMOS #PCUpgrade #DDR5
```

### 10.6 Checkout Referral Discount Banner (Referee)

When the referee (new customer) is at checkout with their 10% discount active:

```
┌─────────────────────────────────────────────────────────┐
│  Referral discount (10%) applied automatically          │
│  You were referred by a TwinMOS member.                 │
└─────────────────────────────────────────────────────────┘
```

This banner appears on the Cart and Checkout pages only for the referee's first order.

---

## 11. Email Communications

### 11.1 Email Templates

All referral emails use Resend transactional templates with responsive HTML.

#### 11.1.1 REFER_REWARD_EARNED_V1 — Referral Reward Earned

**Trigger:** ReferralEvent status changes to 'completed' (after 14-day hold)
**Recipient:** Referrer
**Subject:** `Your friend made their first purchase! 200 points added`

```
Hi {First Name},

Great news! Your friend {referee_first_name} just made their
first TwinMOS purchase, and we've added your referral reward!

  Referral reward:    +{points_earned} pts
  New balance:        {new_balance} pts

  Keep sharing! Every friend who buys earns you {standard_points} points.

  [VIEW YOUR POINTS]

  Share your link:
  {referral_link}

  [WhatsApp] [Email] [Copy]
```

#### 11.1.2 REFER_MONTHLY_SUMMARY_V1 — Monthly Referral Summary

**Trigger:** 1st of each month; sent only to referrers with at least 1 referral activity in the past 30 days
**Recipient:** Active referrers
**Subject:** `Your TwinMOS Refer & Earn update for {month}`

```
Hi {First Name},

Here's your referral activity for {month}:

  Links shared:         {clicks_this_month}
  Friends who signed up:{registrations_this_month}
  Successful referrals: {conversions_this_month}
  Points earned:        {points_earned_this_month} pts

  Total all time:
  Successful referrals: {total_conversions}
  Total points earned:  {total_points_earned} pts

  Your referral link:   {referral_link}

  [SHARE AND EARN MORE]
```

#### 11.1.3 REFER_FRIEND_DISCOUNT_V1 — Referee Welcome (with Discount)

**Trigger:** New account registered via referral link
**Recipient:** Referee
**Subject:** `Welcome to TwinMOS — your 10% discount is ready`

```
Hi {First Name},

Welcome to TwinMOS! Your friend {referrer_first_name} invited
you, so we've got a special welcome offer ready for you.

  Your first-order discount:  10% off everything
  Applied automatically at checkout — no code needed!
  Expires: {discount_expires_at}

  [START SHOPPING]

  Already enrolled in TwinMOS Rewards!
  You've been added to our rewards program — earn points on
  every purchase.

  [LEARN ABOUT REWARDS]
```

#### 11.1.4 REFER_ANNUAL_CAP_V1 — Annual Cap Reached

**Trigger:** 50th successful referral in calendar year
**Recipient:** Referrer
**Subject:** `You've reached the referral reward limit for 2026`

```
Hi {First Name},

Amazing work! You've reached the maximum of 50 referral rewards
for 2026. Your limit resets on 1 January 2027.

  Total referrals this year: 50
  Total points earned:       10,000+ pts

  Your referral link still works — friends can still sign up
  and get their discount, but rewards will resume in 2027.

  [VIEW YOUR ACCOUNT]
```

### 11.2 Email Opt-Out Rules

| Template                     | Can Opt Out? | Category          |
|------------------------------|--------------|-------------------|
| REFER_REWARD_EARNED_V1       | No           | Transactional     |
| REFER_MONTHLY_SUMMARY_V1     | Yes (loyalty_emails preference) | Informational |
| REFER_FRIEND_DISCOUNT_V1     | No           | Transactional     |
| REFER_ANNUAL_CAP_V1          | No           | Transactional     |

---

## 12. Program Terms and Conditions

Full terms are published at `/legal/referral-terms`. Key terms to be reflected in the legal document:

### 12.1 Key Program Rules (Summary for Legal Team)

1. **Eligibility:** Only registered TwinMOS customers who have completed at least one purchase may share referral links. TwinMOS employees and partner account holders are excluded.

2. **New customer requirement:** Referral discounts and referrer rewards apply only when the referred person is a genuinely new customer with no prior purchase history on TwinMOS.

3. **Self-referral prohibition:** Creating multiple accounts or using your own referral link is strictly prohibited and will result in forfeiture of all rewards and possible account suspension.

4. **Reward timing:** Referrer rewards are credited 14 days after the referee's first confirmed order, subject to return/cancellation window.

5. **Annual cap:** A maximum of 50 referral rewards per account per calendar year.

6. **Minimum order value:** Referee's first order must meet the regional minimum value for the referrer reward to be triggered.

7. **Points are non-transferable and have no cash value.**

8. **TwinMOS reserves the right to modify, suspend, or terminate the program with 30 days' notice.**

9. **Fraudulent referrals will result in reward forfeiture and may result in account suspension.**

10. **The referee's 10% discount expires 30 days after registration if not used.**

---

## 13. Business Rules

### BR-REFER-001 — Referrer Eligibility Requires Completed Order

A customer's referral code and link are not shareable (the /account/referrals page shows a locked state) until they have at least 1 completed order on their account. This prevents zero-cost referral account creation just to earn referral income.

### BR-REFER-002 — Referee Must Be a Genuinely New Customer

A referral is valid only if the referee has never previously registered on TwinMOS or made a purchase. If an existing customer attempts to register again via a referral link (e.g., different email address), self-referral and duplicate account checks must be applied.

### BR-REFER-003 — Self-Referral is Prohibited

A customer cannot use their own referral code or link. The system must check at registration time that the referee's email does not match the referrer's email. IP and device checks provide secondary detection (flagging, not outright blocking).

### BR-REFER-004 — 30-Day Attribution Window

The referral attribution window is 30 days from the date of the referee's link click (stored in the `_twinmos_ref` cookie). Purchases made more than 30 days after the last referral link click do not qualify for the referrer reward.

### BR-REFER-005 — Last-Click Attribution

If a referee clicks multiple referral links within the 30-day window, the most recent valid referral code is attributed. Only one referrer can receive a reward per referee.

### BR-REFER-006 — Minimum Order Value is Required for Referrer Reward

The referee's first order must meet or exceed the regional minimum order value (AED 50 / INR 500 / BDT 500 / SAR 50 / USD 15). If the order is below the minimum, the referrer receives no reward. The referee's 10% discount was already applied at checkout and is not reversed.

### BR-REFER-007 — 14-Day Reward Hold Period

Referrer rewards are held for 14 days after the referee's order is confirmed. If the referee returns the order within 14 days, the reward is cancelled and not issued. After 14 days without a return, the reward is confirmed automatically by the daily job.

### BR-REFER-008 — Referee Discount is One-Time and Non-Transferable

The 10% referee discount applies to the first order only and is automatically attached to the referee's account (not a generic code). It cannot be transferred to another account or shared. It expires 30 days from the referee's registration date if unused.

### BR-REFER-009 — Referee Discount Cannot Stack with Promo Codes

The 10% referral discount cannot be combined with a promotional discount code. Both can exist in the cart independently, but only one can be applied at checkout. The referral discount takes precedence if both are present; the customer is informed and can choose to use a different promo code instead (which removes the referral discount).

### BR-REFER-010 — Referee Discount CAN Combine with Loyalty Redemption

The 10% referral discount and loyalty points redemption are compatible and can both be applied on the same checkout. This is an intentional benefit for loyal customers who are also referred friends.

### BR-REFER-011 — Annual Cap of 50 Successful Referrals

A referrer can earn at most 50 referral rewards per calendar year (January 1 – December 31). Referral events after the 50th are cancelled at reward confirmation time. The annual cap resets on January 1.

### BR-REFER-012 — Referral Points Are Not Tier-Qualifying

Loyalty points earned from referrals count toward the redeemable `total_points` balance but do not contribute to the 12-month tier qualification metric. Tier is based on purchase activity only.

### BR-REFER-013 — Gold Tier Bonus

Gold tier customers receive 300 points per successful referral (instead of the standard 200). The tier at the time of reward confirmation (not at the time of referral link share) determines the bonus.

### BR-REFER-014 — Program Modification Notice

TwinMOS may modify referral reward amounts, attribution windows, or program terms at any time. Changes are communicated with 30 days' notice via email to all active participants and via notice on the referral program page.

### BR-REFER-015 — Fraud Results in Forfeiture

If TwinMOS determines through automated or manual review that a referral was fraudulent (self-referral, fake accounts, coordinated abuse), all associated referral rewards will be forfeited and the referrer's account may be suspended. TwinMOS's decision is final.

---

## 14. Analytics and Reporting

### 14.1 PostHog Events

| Event Name                    | Properties                                          |
|-------------------------------|-----------------------------------------------------|
| `referral_link_clicked`       | referral_code, ip, user_agent, utm_source           |
| `referral_registration`       | referee_id, referral_code, referral_channel         |
| `referral_discount_applied`   | referee_id, order_id, discount_value                |
| `referral_reward_issued`      | referrer_id, referee_id, points_awarded, tier       |
| `referral_reward_cancelled`   | referrer_id, cancellation_reason                    |
| `referral_page_view`          | customer_id, tier, total_conversions                |
| `referral_link_copied`        | customer_id                                         |
| `referral_share_whatsapp`     | customer_id                                         |
| `referral_share_email`        | customer_id                                         |
| `referral_share_twitter`      | customer_id                                         |
| `referral_annual_cap_reached` | referrer_id                                         |

### 14.2 Key Metrics

| Metric                          | Formula                                              | Target         |
|---------------------------------|------------------------------------------------------|----------------|
| Click-to-Registration rate      | Registrations / Link clicks                          | > 30%          |
| Registration-to-Purchase rate   | Purchases / Registrations (from referral)            | > 40%          |
| Overall referral conversion rate| Successful referrals / Total link clicks             | > 15%          |
| Referral revenue contribution   | Revenue from referred first orders / Total revenue   | > 10%          |
| Cost per referred acquisition   | Total reward cost / Successful referrals             | < AED 10 / USD 3 |
| Active referrer rate            | Customers who shared link in past 90 days            | > 20% of eligible |
| Top referrers                   | Customers ranked by total_conversions                | Tracked        |
| Channel breakdown               | Conversions by utm_source (WhatsApp, email, Twitter) | Tracked        |
| Average order value (referred)  | AOV of referred first orders                         | ≥ baseline AOV |
| Fraudulent referral rate        | fraud_flagged events / total events                  | < 1%           |

### 14.3 Finance Report

Monthly referral program cost report for Finance:

```
Referral Program Cost — April 2026
────────────────────────────────────────────────────────
Successful referrals:              127
Referrer rewards issued:           25,400 pts
  Redemption value:                AED 254.00

Referee discounts applied:         127 orders
  Avg order value (referred):      AED 348.20
  Total discount at 10%:           AED 4,421.54

Total program cost:                AED 4,675.54
  vs. referral revenue:            AED 47,329.40
  Program cost / revenue ratio:    9.88%

Estimated CAC (referral):          AED 36.82 / customer
  vs. paid search CAC (estimated): AED 180.00 / customer
  CAC savings vs. paid search:     AED 143.18 / customer
────────────────────────────────────────────────────────
```

### 14.4 Top Referrers Report

Monthly report of the top 20 referrers by successful conversions, for potential recognition / VIP treatment:

| Rank | Customer | Tier | Clicks | Conversions | Points Earned |
|------|----------|------|--------|-------------|---------------|
| 1    | Ahmed A. | Gold | 84     | 15          | 4,500 pts     |
| 2    | Priya M. | Silver | 62   | 11          | 2,200 pts     |
| ...  | ...      | ...  | ...    | ...         | ...           |

---

## 15. Acceptance Criteria

### 15.1 Referral Code Generation

- [x] AC-REFER-001: A unique 6-character alphanumeric referral code is generated for each new customer at registration
- [x] AC-REFER-002: The referral link format is correctly constructed as `twinmos.com/join?ref={code}`
- [x] AC-REFER-003: Codes are case-insensitive (AHM123 = ahm123 = Ahm123)
- [x] AC-REFER-004: Referral link is only shareable (page shows code) after customer has 1 completed order

### 15.2 Attribution and Cookie

- [x] AC-REFER-005: Clicking a referral link sets the `_twinmos_ref` cookie with 30-day expiry
- [x] AC-REFER-006: An invalid referral code in the URL is silently ignored (no error shown)
- [x] AC-REFER-007: The cookie's referral code is read at registration and linked to the new account
- [x] AC-REFER-008: If a referee clicks multiple referral links, the most recent code is attributed
- [x] AC-REFER-009: `ReferralCode.total_clicks` is incremented on each unique link click

### 15.3 Registration Flow

- [x] AC-REFER-010: The registration page shows a banner confirming the referral discount when a referral cookie is present
- [x] AC-REFER-011: A `ReferralEvent` with status `pending_purchase` is created on referee registration
- [x] AC-REFER-012: A 10% first-order discount (Medusa promotion) is created and attached to the referee's account
- [x] AC-REFER-013: The referee discount expires 30 days after registration if unused

### 15.4 Fraud Prevention

- [x] AC-REFER-014: A self-referral (same email for referrer and referee) is blocked at registration with an error message
- [x] AC-REFER-015: A same-IP registration flags the ReferralEvent as fraud_flagged (does not block registration)
- [x] AC-REFER-016: A referrer with 0 completed orders cannot share their referral code (page shows locked state)
- [x] AC-REFER-017: A referrer who has reached 50 conversions in the calendar year receives no further rewards

### 15.5 Reward Mechanics

- [x] AC-REFER-018: The 14-day hold period prevents reward from being issued before the return window closes
- [x] AC-REFER-019: If the referee returns their order within 14 days, the referrer reward is cancelled
- [x] AC-REFER-020: After 14 days, the daily job confirms the reward and awards 200 pts to the referrer
- [x] AC-REFER-021: Gold tier referrers receive 300 pts (200 + 100 Gold bonus)
- [x] AC-REFER-022: Orders below the minimum value do not trigger the referrer reward
- [x] AC-REFER-023: Referral points are added to the referrer's total_points but NOT to tier-qualifying points
- [x] AC-REFER-024: A "reward earned" email is sent to the referrer when points are confirmed

### 15.6 Discount Application

- [x] AC-REFER-025: The 10% discount is applied automatically at checkout for the referee's first order
- [x] AC-REFER-026: The discount does not apply to the referee's second or subsequent orders
- [x] AC-REFER-027: The referral discount cannot be stacked with a promotional discount code
- [x] AC-REFER-028: The referral discount CAN be used alongside loyalty points redemption
- [x] AC-REFER-029: Checkout shows a banner confirming the referral discount is applied

### 15.7 Admin and UI

- [x] AC-REFER-030: Admin can view all referral events and filter by status, date, referrer, or referee
- [x] AC-REFER-031: Admin can manually approve or cancel a pending reward with a required justification
- [x] AC-REFER-032: Admin can pause/resume the program and the status change is immediately effective
- [x] AC-REFER-033: /account/referrals shows the customer's referral link, stats, and history
- [x] AC-REFER-034: Social sharing buttons generate correct UTM-tagged links per platform

---

## 16. Phase 4 Expansion

### 16.1 Referral Leaderboard

A public or semi-public leaderboard ranking top referrers by conversions, reset monthly or quarterly:

- Incentives: Monthly top referrer receives a special prize (product bundle or extra points)
- Privacy: Leaderboard shows first name + last initial only (e.g., "Ahmed A.")
- Opt-in: Customers must opt in to appear on leaderboard

### 16.2 Tiered Referral Bonuses

Instead of a flat 200-point reward, introduce scaled bonuses:

| Referrals This Year | Reward per Additional Referral |
|---------------------|-------------------------------|
| 1–5                 | 200 pts                       |
| 6–15                | 250 pts (+25%)                |
| 16–30               | 300 pts (+50%)                |
| 31–50               | 400 pts (+100%)               |

### 16.3 Referral Short Links

Implement short referral links for cleaner social sharing:

```
twinmos.com/r/AHM123
```

Via Cloudflare Pages redirect rules or a URL shortener service.

### 16.4 WhatsApp Business API Integration

Direct WhatsApp Business API integration to allow:

- Sending pre-drafted referral messages directly from the TwinMOS website
- Tracking WhatsApp-attributed conversions via deep links

### 16.5 Influencer / Ambassador Program

An elevated tier of the referral program for high-conversion referrers:

- Custom referral landing pages (e.g., `/join/ahmed`)
- Higher reward rates (e.g., 5% commission instead of fixed points)
- Product seeding / sample program
- Co-branded content collaboration

---

## 17. Appendix

### 17.1 Referral Code Generation Algorithm

```typescript
// Referral code generation

const REFERRAL_CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const REFERRAL_CODE_LENGTH = 6;

function generateReferralCode(): string {
  let code = '';
  const array = new Uint8Array(REFERRAL_CODE_LENGTH);
  crypto.getRandomValues(array);
  for (let i = 0; i < REFERRAL_CODE_LENGTH; i++) {
    code += REFERRAL_CODE_CHARS[array[i] % REFERRAL_CODE_CHARS.length];
  }
  return code;
}

async function generateUniqueReferralCode(): Promise<string> {
  let code: string;
  let attempts = 0;
  do {
    code = generateReferralCode();
    attempts++;
    if (attempts > 10) throw new Error('Failed to generate unique referral code');
  } while (await strapiClient.referralCodes.exists({ code }));
  return code;
}
```

### 17.2 Minimum Order Value by Region

| Region          | Currency | Minimum | Reasoning                                |
|-----------------|----------|---------|------------------------------------------|
| UAE             | AED      | AED 50  | Low enough to be accessible; above impulse level |
| India           | INR      | INR 500 | Equivalent ~USD 6; covers basic USB drive purchase |
| Bangladesh      | BDT      | BDT 500 | Equivalent ~USD 4.50                    |
| KSA             | SAR      | SAR 50  | Equivalent ~USD 13.30                   |
| International   | USD      | USD 15  | Covers baseline product tier            |

### 17.3 Revision History

| Version | Date       | Author                   | Changes                          |
|---------|------------|--------------------------|----------------------------------|
| 1.0     | 2026-05-01 | TwinMOS Digital Product  | Initial draft                    |

### 17.4 Open Questions

| ID     | Question                                                                         | Owner            | Due         |
|--------|----------------------------------------------------------------------------------|------------------|-------------|
| OQ-001 | Marketing: Confirm "Refer & Earn" as final program name                         | Marketing Dir    | 2026-05-15  |
| OQ-002 | Legal: Confirm whether the referee welcome email (with discount) is transactional or marketing | Legal  | 2026-05-15  |
| OQ-003 | Engineering: Confirm Medusa v2 supports single-customer-scoped promotions natively | Eng Lead       | 2026-05-15  |
| OQ-004 | Product: Should same-IP registrations be blocked outright or flagged only?       | Product Manager  | 2026-05-15  |
| OQ-005 | Marketing: Should the referee discount apply to all product categories, or exclude already-discounted/clearance items? | Marketing | 2026-05-30 |
| OQ-006 | Finance: Is AED 50 minimum order value appropriate? Some distributor markets have higher average orders | Finance  | 2026-05-15 |

---

*Document Reference: TWN-P3-REFER-2026-001 | Version 1.0 | TwinMOS Technologies*
