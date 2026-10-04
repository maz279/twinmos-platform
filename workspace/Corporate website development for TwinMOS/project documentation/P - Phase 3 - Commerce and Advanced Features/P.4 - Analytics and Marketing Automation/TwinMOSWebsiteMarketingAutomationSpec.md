# TwinMOS Technologies — Marketing Automation Specification

| Field | Value |
|---|---|
| Document Reference | TWN-P3-MKTAUTO-2026-001 |
| Version | 1.0 |
| Phase | Phase 3 — Commerce and Advanced Features |
| Status | Draft for Review |
| Author | TwinMOS Web Development Team |
| Date | 2026-05-01 |
| Confidentiality | Internal — TwinMOS Technologies |

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Marketing Automation Stack](#2-marketing-automation-stack)
3. [System Architecture and Data Flow](#3-system-architecture-and-data-flow)
4. [Automation Workflows](#4-automation-workflows)
   - [Workflow 1: Abandoned Cart Recovery](#workflow-1-abandoned-cart-recovery)
   - [Workflow 2: Welcome Series](#workflow-2-welcome-series-new-customer)
   - [Workflow 3: Post-Purchase Sequence](#workflow-3-post-purchase-sequence)
   - [Workflow 4: Loyalty Tier Upgrade](#workflow-4-loyalty-tier-upgrade)
   - [Workflow 5: Loyalty Points Expiry Warning](#workflow-5-loyalty-points-expiry-warning)
   - [Workflow 6: Re-engagement Campaign](#workflow-6-re-engagement-campaign)
   - [Workflow 7: Distributor Lead Nurture](#workflow-7-distributor-lead-nurture-b2b)
   - [Workflow 8: Cross-Sell Recommendation Engine](#workflow-8-cross-sell-recommendation-engine)
   - [Workflow 9: Exit Intent Popup](#workflow-9-exit-intent-popup)
   - [Workflow 10: Referral Success Notification](#workflow-10-referral-success-notification)
5. [HubSpot CRM Configuration](#5-hubspot-crm-configuration)
6. [Resend Transactional Email Configuration](#6-resend-transactional-email-configuration)
7. [GDPR and Consent Compliance](#7-gdpr-and-consent-compliance)
8. [Performance Targets and KPIs](#8-performance-targets-and-kpis)
9. [Analytics and Reporting](#9-analytics-and-reporting)
10. [Business Rules](#10-business-rules)
11. [Acceptance Criteria](#11-acceptance-criteria)

---

## 1. Introduction

### 1.1 Purpose

This specification defines the complete marketing automation system for TwinMOS Technologies' Phase 3 website. It covers all automated email workflows, behavioral triggers, CRM configuration, transactional email setup, and regulatory compliance controls.

Marketing automation serves three business objectives in Phase 3:

1. **Revenue recovery:** Convert abandoned carts and re-engage dormant customers
2. **Customer lifecycle management:** Guide new customers from first purchase to loyalty program engagement
3. **B2B pipeline acceleration:** Nurture distributor leads from enquiry to partnership agreement

### 1.2 Scope

This document covers:
- 10 core automation workflows
- HubSpot CRM configuration (contact properties, deal pipelines, lists, email templates)
- Resend transactional email setup (React Email templates, sender configuration)
- PostHog behavioral trigger integration
- Medusa.js webhook event integration
- GDPR/PDPL consent compliance
- Performance targets and analytics

This document does NOT cover:
- One-time marketing campaigns (managed in HubSpot independently)
- Social media advertising automation (out of Phase 3 scope)
- SMS/WhatsApp automation (considered for Phase 4)

---

## 2. Marketing Automation Stack

### 2.1 Stack Components

| Tool | Role | Key capabilities used |
|---|---|---|
| **HubSpot CRM** (Marketing Hub Starter) | Contact management, deal tracking, marketing email campaigns, workflow automation, email templates | Workflows, contact lists, email campaigns, deal pipeline, form integrations |
| **Resend** | Transactional emails (order lifecycle, account, support) | React Email templates, API delivery, bounce/complaint tracking, DKIM/SPF |
| **PostHog OSS** | Behavioral analytics, trigger source for cart abandonment, session events | Event streaming, webhook actions, cohort identification |
| **Medusa.js v2** | E-commerce order lifecycle events | Order webhooks: `order.completed`, `order.placed`, `order.cancelled`, `order.refunded` |
| **Better Auth** | Authentication events | `user.created` (registration), `user.deleted` |
| **Astro (frontend)** | Form submissions, popup interactions | Contact form submission, newsletter signup, exit intent popup |

### 2.2 Tool Responsibilities Matrix

| Automation capability | HubSpot | Resend | PostHog | Medusa |
|---|---|---|---|---|
| Marketing email campaigns | Primary | — | Trigger source | — |
| Transactional emails (order) | — | Primary | — | Trigger source |
| Behavioral trigger detection | Receives data | — | Primary | — |
| Contact database | Primary | — | Person profiles | Customer records |
| Segmentation/lists | Primary | — | Cohorts | — |
| A/B testing (email) | Yes (built-in) | — | — | — |
| Unsubscribe management | Primary | Handles hard bounces | — | — |
| Analytics/reporting | Primary (email) | Delivery stats | Behavioral | Order data |

---

## 3. System Architecture and Data Flow

### 3.1 Event Flow Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                         EVENT SOURCES                                  │
│                                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │  Astro 5     │  │  Medusa.js   │  │  Better Auth │  │  Strapi   │ │
│  │  Frontend    │  │  v2          │  │              │  │  CMS      │ │
│  │  Events      │  │  Webhooks    │  │  Events      │  │  Content  │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └─────┬─────┘ │
│         │                │                  │                 │        │
└─────────┼────────────────┼──────────────────┼─────────────────┼────────┘
          │                │                  │                 │
          ▼                ▼                  ▼                 │
┌─────────────────────────────────────────────────────────┐    │
│                    PostHog OSS                          │    │
│                 (analytics.twinmos.com)                 │    │
│                                                         │    │
│  Captures and processes all behavioral events           │    │
│  Person properties enriched with every event           │    │
│  Cohorts updated in real-time                          │    │
│  Webhook actions trigger HubSpot contact updates       │    │
└──────────────────────┬──────────────────────────────────┘    │
                       │                                        │
                       ▼                                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         HubSpot CRM                                 │
│                                                                     │
│  Contacts synced from PostHog events + Medusa customers             │
│  Contact properties updated by webhook integrations                 │
│  Workflow automation engine evaluates trigger conditions            │
│  Workflows trigger: HubSpot marketing emails OR                     │
│    → Resend API call (transactional) OR → Slack internal alert      │
│                                                                     │
│  ┌───────────────┐  ┌───────────────┐  ┌──────────────────────┐    │
│  │ Workflow 1    │  │ Workflow 2    │  │ Workflow 7 (B2B)     │    │
│  │ Abandoned Cart│  │ Welcome Series│  │ Distributor Nurture  │    │
│  └───────────────┘  └───────────────┘  └──────────────────────┘    │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
              ┌────────┴────────┐
              ▼                 ▼
┌─────────────────┐   ┌──────────────────────┐
│  HubSpot Email  │   │     Resend            │
│  (marketing     │   │  (transactional)      │
│   workflows)    │   │  - Order confirmation │
│                 │   │  - Warranty emails    │
│  - Cart recovery│   │  - RMA notifications  │
│  - Welcome      │   │  - Points expiry      │
│  - Re-engage    │   │  - Referral success   │
└─────────────────┘   └──────────────────────┘
```

### 3.2 Integration Points

**PostHog → HubSpot Sync**

PostHog webhook actions send contact property updates to HubSpot via the HubSpot Contacts API when key events occur:

| PostHog event | HubSpot action |
|---|---|
| `account_registered` | Create contact; set `registration_date`, `locale`, `country` |
| `checkout_completed` | Update `last_order_date`, `total_orders`, `lifetime_value_aed`, `product_categories_purchased` |
| `loyalty_tier_upgraded` | Update `loyalty_tier` contact property |
| `checkout_abandoned` | Set `cart_abandoned_at` timestamp; trigger Workflow 1 |
| Any activity after 6-month gap | Update `last_activity_date`; remove from dormant workflow |

**Medusa.js → Resend (Direct)**

Transactional emails (order confirmation, shipping updates) are sent directly from Medusa's webhook handler to Resend. They do not go through HubSpot to keep transactional and marketing systems cleanly separated.

```typescript
// src/medusa/subscribers/order-completed.ts
// Medusa subscriber: fires when order.completed event is emitted

import { Resend } from 'resend';
import { OrderConfirmationEmail } from '@/emails/OrderConfirmation';

export async function handleOrderCompleted(
  { order }: { order: Order },
  { container }: MedusaContainer
) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  // Send order confirmation immediately
  await resend.emails.send({
    from: 'TwinMOS Orders <noreply@twinmos.com>',
    to: order.email,
    subject: `Order Confirmed — #${order.display_id}`,
    react: OrderConfirmationEmail({ order }),
  });

  // Notify HubSpot for post-purchase sequence trigger
  await hubspotClient.crm.contacts.basicApi.update(
    order.customer_id,
    {
      properties: {
        last_order_date: new Date().toISOString(),
        total_orders: String(order.customer.orders.length),
        lifetime_value_aed: String(order.customer.lifetimeValueAed),
        last_order_id: order.id,
      },
    }
  );
}
```

---

## 4. Automation Workflows

### Workflow 1: Abandoned Cart Recovery

**Reference:** WF-MKTAUTO-001
**Tool:** HubSpot Workflow (marketing email) + PostHog trigger
**Business rule:** BR-MKTAUTO-001

#### 4.1.1 Trigger Conditions

| Condition | Value |
|---|---|
| Event | `checkout_abandoned` (PostHog) OR cart has items + no checkout completion after 60 minutes |
| User has email | True (either registered account OR email entered in checkout Step 1) |
| `marketing_consent` | True |
| Purchase completed in last 60 minutes | False (suppress if user bought something else) |

**Technical trigger mechanism:**
PostHog detects `checkout_abandoned` event (fired when browser leaves checkout URL after completing Step 1 without completing Step 4). PostHog webhook action calls HubSpot API to enroll contact in the Abandoned Cart workflow.

#### 4.1.2 Email Sequence

**Email 1 — "Did you forget something?"**

| Field | Value |
|---|---|
| Send time | 1 hour after abandonment |
| Subject line | "You left something in your cart, {{first_name}}" |
| Preview text | "Your {{product_name}} is waiting for you" |
| Content | Cart summary with product image, name, quantity, price; single prominent "Return to Cart" button (deep link with cart ID); social proof: product rating; urgency: "Cart expires in 48 hours" |
| CTA | "Complete My Order" → direct deep link to cart |
| Personalization | First name, product name, cart total, currency |

**Email 2 — "Your cart is waiting"**

| Field | Value |
|---|---|
| Send time | 24 hours after abandonment (if no purchase) |
| Subject line | "Still thinking? Here's what others say about {{product_name}}" |
| Preview text | "4.8 stars across 2,000+ reviews" |
| Content | Cart summary; featured customer review for the abandoned product; "Why choose TwinMOS" trust block (warranty, quality certification); "Return to Cart" CTA |
| CTA | "Complete Purchase" |

**Email 3 — "Last chance"**

| Field | Value |
|---|---|
| Send time | 72 hours after abandonment (if no purchase) |
| Subject line | "Last chance — your cart expires soon [5% off inside]" |
| Preview text | "Use code COMEBACK5 at checkout" |
| Content | Cart summary; 5% discount code (generated via Medusa promotion API, unique per contact); explicit cart expiry warning; strong CTA |
| CTA | "Use My Discount" → cart URL with auto-applied discount |

#### 4.1.3 Stop Conditions

- Purchase completed (any order) → immediately remove from workflow
- Contact unsubscribes → immediately remove
- Cart manually cleared by user → remove after Email 1 if cart is empty

#### 4.1.4 Performance Targets

| Metric | Target |
|---|---|
| Cart recovery rate (abandoned carts → purchase) | ≥ 5% |
| Email 1 open rate | ≥ 35% |
| Email 2 open rate | ≥ 25% |
| Email 3 open rate | ≥ 20% |

---

### Workflow 2: Welcome Series (New Customer)

**Reference:** WF-MKTAUTO-002
**Tool:** HubSpot Workflow
**Business rule:** BR-MKTAUTO-002

#### 4.2.1 Trigger Conditions

| Condition | Value |
|---|---|
| Event | `account_registered` |
| `marketing_consent` | True |

#### 4.2.2 Email Sequence

**Email 1 — Welcome (Immediate)**

| Field | Value |
|---|---|
| Send time | Immediately on registration |
| Subject | "Welcome to TwinMOS, {{first_name}}! Here's how to get started" |
| Goal | Drive first product page view |

**Email 2 — Explore TwinMOS (Day 3)**

| Field | Value |
|---|---|
| Send time | Day 3 after registration |
| Condition | Only send if no purchase made yet |
| Subject | "{{first_name}}, meet our bestsellers in [country]" |
| Content | 3 featured products curated by country (UAE: VOLTX RGB DDR5; India: Xtreme Gen4 NVMe; Bangladesh: Elite Drive SATA SSD); brief spec highlights; "Shop Now" CTAs |
| Personalization | Country-based product curation (simple lookup table, not ML) |

**Email 3 — Compatibility Finder Education (Day 7)**

| Field | Value |
|---|---|
| Send time | Day 7 after registration |
| Condition | Only send if no purchase made yet |
| Subject | "Not sure which TwinMOS product fits your system? We'll tell you." |
| Content | Explanation of compatibility finder; step-by-step guide with screenshot; CTA to use finder; link to customer testimonials |

**Email 4 — Welcome Discount (Day 14)**

| Field | Value |
|---|---|
| Send time | Day 14 after registration |
| Condition | Only send if still no purchase |
| Subject | "{{first_name}}, your 10% welcome discount expires soon" |
| Content | 10% discount code (unique, generated via Medusa, expires in 7 days); urgency messaging; top 3 products for their country; support link |

#### 4.2.3 Stop Conditions

- Purchase completed → stop immediately; enrolled in Post-Purchase Sequence instead
- Contact unsubscribes

---

### Workflow 3: Post-Purchase Sequence

**Reference:** WF-MKTAUTO-003
**Tool:** HubSpot Workflow (sequences) + Resend (order confirmation)
**Business rule:** BR-MKTAUTO-003

#### 4.3.1 Trigger

Medusa `order.completed` webhook → Resend sends order confirmation → HubSpot enrollment via Medusa subscriber.

#### 4.3.2 Email Sequence

**Email 1 — Order Confirmation (Immediate, via Resend — TRANSACTIONAL)**

| Field | Value |
|---|---|
| Send time | Immediate on `order.completed` |
| Tool | Resend (NOT HubSpot — transactional) |
| Subject | "Order Confirmed — TwinMOS #{{order_id}}" |
| Content | Full order summary (items, quantities, prices, total); shipping address; estimated delivery; order tracking link; TwinMOS support contact; VAT/GST invoice attached (PDF) |
| Required | Yes — sent regardless of `marketing_consent` (legitimate interest, contractual) |

**Email 2 — Delivery Follow-Up + Warranty CTA (Day 3 after delivery)**

| Field | Value |
|---|---|
| Send time | 3 days after shipping carrier marks as delivered |
| Condition | `marketing_consent = true` |
| Tool | HubSpot |
| Subject | "How's your new TwinMOS {{product_name}}?" |
| Content | Product satisfaction check; prominent "Register Your Warranty" CTA with pre-filled product details; TwinMOS support resources link; loyalty points balance reminder |

**Email 3 — Review Request + Loyalty Points Reminder (Day 7 post-delivery)**

| Field | Value |
|---|---|
| Send time | 7 days after delivery |
| Condition | `marketing_consent = true` AND no warranty registration yet (check Strapi) |
| Tool | HubSpot |
| Subject | "{{first_name}}, share your experience + earn 50 bonus points" |
| Content | Review request with star rating CTA (link to product page review section); bonus points offer for leaving a review; loyalty points balance; tier progress |

**Email 4 — Cross-Sell Recommendation (Day 30 post-purchase)**

| Field | Value |
|---|---|
| Send time | 30 days after order |
| Condition | `marketing_consent = true` |
| Tool | HubSpot |
| Subject | "Complete your build — {{recommended_product}} pairs perfectly with your {{purchased_product}}" |
| Content | Product purchased; recommended complementary product (rule-based, see Workflow 8); technical compatibility note; "Add to Cart" CTA; loyalty points reminder |

---

### Workflow 4: Loyalty Tier Upgrade

**Reference:** WF-MKTAUTO-004
**Tool:** Resend (immediate notification) + HubSpot (in-app notification trigger)
**Business rule:** BR-MKTAUTO-004

#### 4.4.1 Trigger

`loyalty_tier_upgraded` event (PostHog) OR `LoyaltyAccount.tier` change (Medusa loyalty extension webhook) → HubSpot contact property `loyalty_tier` updated → Workflow triggered.

#### 4.4.2 Notification Sequence

**Email 1 — Tier Upgrade Congratulations (Immediate, via Resend)**

| Field | Value |
|---|---|
| Send time | Immediate |
| Tool | Resend |
| Subject | "Congratulations! You've reached {{new_tier}} status, {{first_name}} 🎉" |
| Content | Tier upgrade announcement with tier badge/graphic; new benefits specific to tier (Silver: free shipping on orders over AED 200; Gold: priority support + exclusive products); current points balance; what to expect next; "Shop with your new benefits" CTA |

**In-App Notification (Next login)**

Display a celebratory banner on the account dashboard on the user's next login (handled by Astro frontend checking a `tier_notification_pending` flag in the database).

---

### Workflow 5: Loyalty Points Expiry Warning

**Reference:** WF-MKTAUTO-005
**Tool:** Resend
**Business rule:** BR-MKTAUTO-005

#### 4.5.1 Trigger

Scheduled job (daily, run via Medusa scheduled job): query all `LoyaltyTransaction` records where `expires_at` is within 30 days AND points have not been redeemed.

#### 4.5.2 Email Sequence

**Email 1 — 30-Day Expiry Warning**

| Field | Value |
|---|---|
| Send time | When 30 days remain until expiry |
| Tool | Resend |
| Subject | "{{first_name}}, your {{points_expiring}} TwinMOS points expire in 30 days" |
| Content | Points expiry date; points value in AED equivalent; "Shop Now" CTA to use points; top products they can partially pay with points |

**Email 2 — 7-Day Final Warning**

| Field | Value |
|---|---|
| Send time | When 7 days remain |
| Condition | Points still not redeemed |
| Tool | Resend |
| Subject | "LAST CHANCE: Your {{points_expiring}} points expire in 7 days" |
| Content | Urgent messaging; exact expiry date and time; direct CTA to account loyalty page to see balance and shop; phone/email support offer |

---

### Workflow 6: Re-Engagement Campaign

**Reference:** WF-MKTAUTO-006
**Tool:** HubSpot Workflow
**Business rule:** BR-MKTAUTO-006

#### 4.6.1 Trigger Conditions

| Condition | Value |
|---|---|
| `last_activity_date` (PostHog last event) | More than 180 days ago |
| `last_order_date` | More than 180 days ago |
| `is_unsubscribed` | False |
| `marketing_consent` | True |

**Evaluation:** Daily scheduled trigger in HubSpot workflow.

#### 4.6.2 Email Sequence

**Email 1 — "We miss you"**

| Field | Value |
|---|---|
| Send time | On trigger (180 days inactivity) |
| Subject | "{{first_name}}, it's been a while — see what's new at TwinMOS" |
| Content | New product announcements since their last visit; "What's new" highlights (VOLTX RGB DDR5, Gen5 NVMe); loyalty points balance (if any) with prompt to use them; "Come back" CTA |

**Email 2 — Exclusive Re-Engagement Offer (2 weeks after Email 1)**

| Field | Value |
|---|---|
| Send time | 14 days after Email 1, if no website visit and no purchase |
| Subject | "{{first_name}}, an exclusive offer — just for you" |
| Content | 10% discount code (unique, 14-day expiry); best-selling products in their region; reminder of loyalty balance; personalized product recommendation based on purchase history |

**Email 3 — Final Communication (2 weeks after Email 2)**

| Field | Value |
|---|---|
| Send time | 14 days after Email 2, if still no activity |
| Subject | "This is our last email — stay or go?" |
| Content | Direct, respectful tone: "We respect your inbox. If you'd like to stay updated, click below. Otherwise, we'll remove you from marketing emails."; two CTAs: "Yes, keep me updated" (updates `marketing_consent` timestamp); "Unsubscribe me" (processes immediately) |

#### 4.6.3 Stop Conditions

- Any website visit (PostHog event received → HubSpot property updated → workflow exits)
- Any purchase
- Unsubscribe (Email 3 unsubscribe CTA)
- Manual removal by TwinMOS Marketing team

---

### Workflow 7: Distributor Lead Nurture (B2B)

**Reference:** WF-MKTAUTO-007
**Tool:** HubSpot Workflow + HubSpot Deal pipeline + Slack notification
**Business rule:** BR-MKTAUTO-007

#### 4.7.1 Trigger Conditions

| Condition | Value |
|---|---|
| Event | `contact_form_submitted` with `form_type = distributors` OR `distributor_application_started` followed by form submission |
| Contact type | Company (B2B contact; check `company_name` field is populated) |

#### 4.7.2 Workflow Actions

**Immediate — Application Received Email (via HubSpot)**

| Field | Value |
|---|---|
| Send time | Immediate |
| Subject | "TwinMOS Distributor Application Received — {{company_name}}" |
| Content | Confirmation of application receipt; what to expect next (review within 3 business days; personal call from TwinMOS team); interim resources (product catalog download, partner program overview page); TwinMOS regional contact details |

**Immediate — HubSpot Deal Created**

Automatically create a HubSpot Deal:
- Pipeline: "Distributor Partner Pipeline"
- Stage: "Lead Received"
- Deal name: "{{company_name}} — Distributor Application"
- Associated contact: the form submitter
- Owner: TwinMOS Sales (region-specific assignment based on `country` field)

**Day 2 — Partner Program Overview Email**

| Field | Value |
|---|---|
| Send time | 2 days after application |
| Subject | "TwinMOS Partner Program — Benefits, Margins, and Support" |
| Content | Distributor margin overview (generic, tiered by volume); marketing support (MDF program); co-marketing opportunities; dedicated account manager promise; link to partner resources page; "Schedule a call" Calendly link |

**Day 5 — Internal Escalation (if no TwinMOS Sales response)**

| Field | Value |
|---|---|
| Trigger | 5 days elapsed + deal still in "Lead Received" stage (no sales activity recorded in HubSpot) |
| Action | Slack message to `#sales-alerts` channel: "@here — Distributor lead from {{company_name}} ({{country}}) has not been contacted after 5 days. HubSpot deal: [link]" |
| Also | Move HubSpot deal to "Needs Attention" sub-stage |

#### 4.7.3 Deal Pipeline Stages

| Stage | Definition | Expected duration |
|---|---|---|
| Lead Received | Application submitted; awaiting review | 0–3 days |
| Qualified | Reviewed; meets TwinMOS partner criteria; intro call scheduled | 3–7 days |
| Needs Attention | Stalled; escalated | Variable |
| Negotiating | Commercial terms under discussion | 7–30 days |
| Partner Agreement Signed | Contract executed | — |
| Active Partner | MDF portal access granted; first order placed | Ongoing |
| Lost/Declined | Not a fit; closed | — |

---

### Workflow 8: Cross-Sell Recommendation Engine

**Reference:** WF-MKTAUTO-008
**Tool:** HubSpot Workflow (personalized email)
**Business rule:** BR-MKTAUTO-008

#### 4.8.1 Cross-Sell Rules (Phase 3 — Rule-Based)

| Purchased category | Recommended category | Specific recommendation |
|---|---|---|
| DDR5 RAM | Gen5 NVMe SSD | CoreX Pro Gen5 NVMe SSD |
| DDR4 RAM | Gen4 NVMe SSD | Xtreme Gen4 NVMe SSD |
| Gen5 NVMe SSD | DDR5 RAM | VOLTX DDR5 or VOLTX RGB DDR5 |
| Gen4 NVMe SSD | DDR4 RAM | TornadoX7 DDR4 or Thunder GX DDR4 |
| SATA SSD | Portable SSD | TwinMOS portable SSD (USB-C) |
| Portable SSD | USB Flash Drive | TwinMOS USB Flash Drive (backup) |
| USB Flash Drive | SATA SSD | Elite Drive SATA SSD (upgrade path) |

> Note: In Phase 3, cross-sell recommendations are rule-based (lookup table). Machine learning-based recommendations are planned for Phase 4.

#### 4.8.2 Email Trigger

| Field | Value |
|---|---|
| Trigger | Order completed containing RAM OR SSD (any category) |
| Send time | Day 14 after order delivery |
| Condition | `marketing_consent = true` AND cross-sell category not already purchased |
| Subject | "Complete your build — {{recommended_product}} pairs perfectly with your {{purchased_product}}" |
| Content | Purchased product photo + recommended product photo; compatibility confirmation ("Your {{purchased_product}} is certified compatible with {{recommended_product}}"); specs comparison; "Add to Cart" CTA with 5% bundle incentive |

---

### Workflow 9: Exit Intent Popup

**Reference:** WF-MKTAUTO-009
**Tool:** Astro frontend (custom JS) + Resend (discount email)
**Business rule:** BR-MKTAUTO-009

#### 4.9.1 Trigger Conditions (Client-Side)

The exit intent popup is triggered by the Astro frontend, not HubSpot. Detection logic:

```typescript
// src/components/marketing/ExitIntentPopup.tsx
// Detects exit intent via mouseleave event toward browser chrome

import { useEffect, useState } from 'react';
import { capture } from '@/lib/analytics/posthog';

const EXIT_INTENT_COOKIE = 'twinmos_exit_intent_shown';
const RATE_LIMIT_DAYS = 7;

function hasSeenPopupRecently(): boolean {
  const cookie = document.cookie
    .split('; ')
    .find(row => row.startsWith(`${EXIT_INTENT_COOKIE}=`));
  if (!cookie) return false;
  const timestamp = parseInt(cookie.split('=')[1]);
  const daysSince = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
  return daysSince < RATE_LIMIT_DAYS;
}

export function useExitIntent(
  isProductPage: boolean,
  isInCheckout: boolean,
  isSubscribed: boolean
) {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Only show on product pages, not in checkout, not to already-subscribed users
    if (!isProductPage || isInCheckout || isSubscribed || hasSeenPopupRecently()) {
      return;
    }

    const handleMouseLeave = (e: MouseEvent) => {
      // Detect movement toward browser top chrome (exit intent)
      if (e.clientY <= 10) {
        setShowPopup(true);
        capture('exit_intent_popup_shown', { page_url: window.location.href });

        // Set rate limit cookie
        document.cookie = `${EXIT_INTENT_COOKIE}=${Date.now()}; max-age=${7 * 24 * 60 * 60}; path=/; SameSite=Lax`;

        document.removeEventListener('mouseleave', handleMouseLeave);
      }
    };

    // Delay activation: don't show popup in first 15 seconds
    const timer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 15000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isProductPage, isInCheckout, isSubscribed]);

  return { showPopup, setShowPopup };
}
```

#### 4.9.2 Popup Content

| Element | Content |
|---|---|
| Headline | "Wait — before you go" |
| Sub-headline | "Get 10% off your first TwinMOS order" |
| Body | "Enter your email and we'll send you an exclusive 10% discount code instantly." |
| Input | Email address field |
| CTA button | "Get My 10% Discount" |
| Dismiss | "No thanks, I'll pay full price" (small text link) |
| Trust signals | "No spam. Unsubscribe anytime." |

#### 4.9.3 On Submission

1. Validate email
2. Call Medusa promotion API to generate unique 10% discount code (single-use, 30-day expiry)
3. Create/update HubSpot contact with `marketing_consent = true`
4. Send discount code via Resend immediately
5. Capture `newsletter_subscribed` event in PostHog with `source: exit_intent_popup`

---

### Workflow 10: Referral Success Notification

**Reference:** WF-MKTAUTO-010
**Tool:** Resend
**Business rule:** BR-MKTAUTO-010

#### 4.10.1 Trigger

`ReferralEvent.status` changes to `converted` (referee's first order confirmed by Medusa webhook).

#### 4.10.2 Email to Referrer

| Field | Value |
|---|---|
| Recipient | Referrer (the customer who shared the referral link) |
| Send time | Immediate on referee's order confirmation |
| Tool | Resend |
| Subject | "Your friend just ordered from TwinMOS — 200 points added!" |
| Content | Celebration message; referee's name (first name only) who placed the order; 200 loyalty points added confirmation; updated points balance; "Shop with your points" CTA; "Share with more friends" CTA with referral link |

---

## 5. HubSpot CRM Configuration

### 5.1 Custom Contact Properties

The following custom properties must be created in HubSpot (Contacts → Property Settings):

| Property name (HubSpot) | Type | Source | Description |
|---|---|---|---|
| `loyalty_tier` | Enumeration | Medusa loyalty extension | bronze / silver / gold / null |
| `last_order_date` | Date | Medusa webhook | Date of last completed order |
| `lifetime_value_aed` | Number | Medusa webhook | Total order value in AED |
| `total_orders` | Number | Medusa webhook | Count of completed orders |
| `product_categories_purchased` | Multi-select | Medusa webhook | e.g., DDR5, Gen4 NVMe |
| `last_order_id` | String | Medusa webhook | Most recent Medusa order ID |
| `country` | Enumeration | PostHog (Cloudflare header) | ISO 3166-1 alpha-2 |
| `preferred_currency` | Enumeration | User preference | AED / INR / BDT / SAR / USD |
| `registration_date` | Date | Better Auth | Account creation date |
| `cart_abandoned_at` | DateTime | PostHog webhook | Timestamp of last cart abandonment |
| `last_activity_date` | DateTime | PostHog webhook | Timestamp of last PostHog event |
| `referral_code` | String | TwinMOS referral system | User's referral code |
| `referrals_made` | Number | TwinMOS referral system | Count of successful referrals |
| `marketing_consent` | Boolean | Cookie banner / registration | GDPR/PDPL consent flag |
| `marketing_consent_date` | DateTime | Cookie banner / registration | When consent was granted |
| `distributor_application_status` | Enumeration | HubSpot deal pipeline | lead / qualified / partner / declined |

### 5.2 Contact Lists

| List name | Membership criteria | Purpose |
|---|---|---|
| Active Customers | `last_order_date` within last 180 days | General marketing campaigns |
| Dormant Customers | `last_order_date` > 180 days ago AND `total_orders` ≥ 1 | Re-engagement workflow |
| New Registrations (No Purchase) | `registration_date` within 14 days AND `total_orders = 0` | Welcome series |
| Loyalty Bronze | `loyalty_tier = bronze` | Tier-specific campaigns |
| Loyalty Silver | `loyalty_tier = silver` | Tier-specific campaigns |
| Loyalty Gold | `loyalty_tier = gold` | VIP campaigns, early access |
| Distributors | `distributor_application_status = partner` | Partner communications |
| Distributor Leads | `distributor_application_status = lead or qualified` | Nurture workflow |
| UAE Customers | `country = AE` | Regional campaigns |
| India Customers | `country = IN` | Regional campaigns |
| Bangladesh Customers | `country = BD` | Regional campaigns |
| KSA Customers | `country = SA` | Regional campaigns |
| High-Value Buyers | `total_orders ≥ 3` AND `lifetime_value_aed ≥ 1000` | Premium campaigns |
| Abandoned Cart (Last 7 Days) | `cart_abandoned_at` within last 7 days AND no recent order | Cart recovery |

### 5.3 Email Templates

TwinMOS requires 10 HubSpot marketing email templates. All templates must be:
- Responsive (mobile-first)
- Branded with TwinMOS color scheme (primary: #1A1A2E, accent: #E63946)
- Available in: English, Arabic, Russian, Chinese (Simplified), French
- Accessible (WCAG 2.1 AA)

| Template ID | Name | Used by workflow |
|---|---|---|
| TPL-001 | Welcome Email | WF-MKTAUTO-002 Email 1 |
| TPL-002 | Explore Products (Country-Personalized) | WF-MKTAUTO-002 Email 2 |
| TPL-003 | Compatibility Finder Education | WF-MKTAUTO-002 Email 3 |
| TPL-004 | Welcome Discount | WF-MKTAUTO-002 Email 4 |
| TPL-005 | Abandoned Cart (Email 1) | WF-MKTAUTO-001 Email 1 |
| TPL-006 | Abandoned Cart with Social Proof | WF-MKTAUTO-001 Email 2 |
| TPL-007 | Abandoned Cart Final + Discount | WF-MKTAUTO-001 Email 3 |
| TPL-008 | Distributor Application Confirmation | WF-MKTAUTO-007 Email 1 |
| TPL-009 | Partner Program Overview | WF-MKTAUTO-007 Email 2 |
| TPL-010 | Re-Engagement + Offer | WF-MKTAUTO-006 Email 2 |

### 5.4 Deal Pipeline: Distributor Partner Pipeline

| Stage | HubSpot stage name | Win probability | Required CRM action |
|---|---|---|---|
| 1 | Lead Received | 10% | Auto-created by Workflow 7 |
| 2 | Qualified | 25% | Sales rep marks qualified after intro call |
| 3 | Needs Attention | 0% | Auto-set by workflow escalation |
| 4 | Negotiating | 50% | Sales rep updates with commercial terms |
| 5 | Partner Agreement Signed | 90% | Legal uploads signed contract as attachment |
| 6 | Active Partner | 100% (Closed Won) | MDF portal access granted; onboarding task created |
| 7 | Lost / Declined | 0% (Closed Lost) | Reason required; feedback logged |

---

## 6. Resend Transactional Email Configuration

### 6.1 Sender Configuration

| Field | Value |
|---|---|
| From address | `noreply@twinmos.com` |
| From name | `TwinMOS Technologies` |
| Reply-to | `support@twinmos.com` |
| Domain verification | DKIM + SPF + DMARC configured for `twinmos.com` in Cloudflare DNS |
| Resend verified domain | `twinmos.com` |

### 6.2 DNS Records Required (Cloudflare)

| Type | Name | Value |
|---|---|---|
| TXT | `@` | `v=spf1 include:amazonses.com include:_spf.resend.com ~all` |
| TXT | `resend._domainkey` | `p=MIGfMA0G...` (provided by Resend) |
| TXT | `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:dmarc@twinmos.com` |

### 6.3 Transactional Email Templates (React Email)

All transactional emails are built with React Email (https://react.email). Templates are stored in `src/emails/` in the TwinMOS repository and rendered server-side by Medusa subscribers.

| Template file | Email type | Trigger |
|---|---|---|
| `OrderConfirmation.tsx` | Order confirmation with VAT invoice | `order.completed` |
| `ShippingUpdate.tsx` | Shipping dispatched + tracking number | Medusa fulfillment webhook |
| `OrderDelivered.tsx` | Order delivered notification | Carrier webhook (Day 0 delivery) |
| `LoyaltyTierUpgrade.tsx` | Tier upgrade notification | `loyalty_tier_upgraded` event |
| `LoyaltyPointsExpiry30.tsx` | 30-day points expiry warning | Scheduled job |
| `LoyaltyPointsExpiry7.tsx` | 7-day points expiry warning | Scheduled job |
| `ReferralConverted.tsx` | Referral success notification | `ReferralEvent.status = converted` |
| `ExitIntentDiscount.tsx` | Exit intent discount code delivery | Exit intent popup submission |
| `WarrantyConfirmation.tsx` | Warranty registration confirmation | `warranty_registered` event |
| `RMAConfirmation.tsx` | RMA request acknowledgment | `rma_submitted` event |

### 6.4 React Email Template Example

```typescript
// src/emails/OrderConfirmation.tsx
import {
  Body, Button, Column, Container, Head, Hr, Html,
  Img, Preview, Row, Section, Text
} from '@react-email/components';
import * as React from 'react';

interface OrderConfirmationEmailProps {
  order: {
    display_id: string;
    customer: { first_name: string; email: string };
    items: Array<{ title: string; quantity: number; unit_price: number }>;
    total: number;
    currency_code: string;
    shipping_address: { address_1: string; city: string; country: string };
    tax_total: number;
    tax_label: string; // e.g., "VAT" or "GST"
  };
}

export const OrderConfirmationEmail = ({ order }: OrderConfirmationEmailProps) => {
  const currency = order.currency_code.toUpperCase();

  return (
    <Html>
      <Head />
      <Preview>Order #{order.display_id} confirmed — Thank you for your TwinMOS order!</Preview>
      <Body style={{ backgroundColor: '#f5f5f5', fontFamily: 'Arial, sans-serif' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff' }}>
          {/* Header */}
          <Section style={{ backgroundColor: '#1A1A2E', padding: '24px' }}>
            <Img src="https://www.twinmos.com/images/logo-white.png" alt="TwinMOS" width="150" />
          </Section>

          {/* Order confirmation */}
          <Section style={{ padding: '32px 24px' }}>
            <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#1A1A2E' }}>
              Order Confirmed!
            </Text>
            <Text>Hi {order.customer.first_name},</Text>
            <Text>
              Thank you for your order. Your TwinMOS products are being prepared for dispatch.
            </Text>
            <Text style={{ fontWeight: 'bold' }}>Order #{order.display_id}</Text>

            {/* Order items */}
            {order.items.map((item, index) => (
              <Row key={index} style={{ borderBottom: '1px solid #eee', padding: '8px 0' }}>
                <Column style={{ width: '70%' }}>
                  <Text>{item.title} × {item.quantity}</Text>
                </Column>
                <Column style={{ width: '30%', textAlign: 'right' }}>
                  <Text>{currency} {(item.unit_price * item.quantity / 100).toFixed(2)}</Text>
                </Column>
              </Row>
            ))}

            <Hr />
            <Row>
              <Column style={{ width: '70%' }}><Text>Subtotal</Text></Column>
              <Column style={{ width: '30%', textAlign: 'right' }}>
                <Text>{currency} {((order.total - order.tax_total) / 100).toFixed(2)}</Text>
              </Column>
            </Row>
            <Row>
              <Column style={{ width: '70%' }}><Text>{order.tax_label}</Text></Column>
              <Column style={{ width: '30%', textAlign: 'right' }}>
                <Text>{currency} {(order.tax_total / 100).toFixed(2)}</Text>
              </Column>
            </Row>
            <Row>
              <Column style={{ width: '70%' }}>
                <Text style={{ fontWeight: 'bold' }}>Total</Text>
              </Column>
              <Column style={{ width: '30%', textAlign: 'right' }}>
                <Text style={{ fontWeight: 'bold' }}>
                  {currency} {(order.total / 100).toFixed(2)}
                </Text>
              </Column>
            </Row>

            <Button
              href={`https://www.twinmos.com/account/orders/${order.display_id}`}
              style={{
                backgroundColor: '#E63946',
                color: '#ffffff',
                padding: '12px 24px',
                borderRadius: '4px',
                display: 'block',
                textAlign: 'center',
                marginTop: '24px',
              }}
            >
              Track My Order
            </Button>
          </Section>

          {/* Footer */}
          <Section style={{ backgroundColor: '#1A1A2E', padding: '16px 24px', textAlign: 'center' }}>
            <Text style={{ color: '#ffffff', fontSize: '12px' }}>
              TwinMOS Technologies FZCO | Dubai Airport Free Zone (DAFZA), UAE
            </Text>
            <Text style={{ color: '#aaaaaa', fontSize: '11px' }}>
              This is a transactional email. You cannot unsubscribe from order confirmations.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default OrderConfirmationEmail;
```

---

## 7. GDPR and Consent Compliance

### 7.1 Consent Architecture

| Email category | Legal basis | Consent requirement | Opt-out mechanism |
|---|---|---|---|
| Transactional (order confirmation, shipping, warranty) | Contract performance / Legitimate interest | Not required — cannot opt out | N/A |
| Marketing automation (cart recovery, welcome series, cross-sell, re-engagement) | Consent | `marketing_consent = true` required | One-click unsubscribe in every email |
| B2B lead nurture (distributor) | Legitimate interest (B2B) | Consent not required under GDPR B2B exception | Opt-out in every email |

### 7.2 Consent Capture Points

| Touchpoint | Consent mechanism |
|---|---|
| Account registration | Checkbox: "I'd like to receive product news and offers from TwinMOS. You can unsubscribe at any time." (unchecked by default) |
| Newsletter signup (footer, exit popup) | Email submission = implicit consent; confirmed via double opt-in email |
| Checkout (guest) | Optional checkbox at Step 1 (not pre-checked) |

### 7.3 Double Opt-In (Newsletter)

1. User enters email in newsletter form
2. Resend sends confirmation email: "Please confirm your TwinMOS newsletter subscription"
3. User clicks confirm link
4. HubSpot contact created with `marketing_consent = true` and `marketing_consent_date` timestamped
5. Welcome Email 1 (TPL-001) sent immediately

### 7.4 Unsubscribe Processing

- HubSpot automatically adds unsubscribe link to all marketing emails
- Unsubscribe is processed immediately (HubSpot marks contact as unsubscribed)
- Unsubscribed contacts will never receive HubSpot marketing emails again
- Resend transactional emails continue (legitimate interest / contract)
- Unsubscribe is recorded in HubSpot audit log
- Re-subscribe: only possible if user actively opts back in through website consent form

### 7.5 Data Retention for Marketing Data

| Data type | Retention |
|---|---|
| HubSpot contact records | Until deletion request (DSAR) OR 3 years after last activity |
| Email engagement data (opens, clicks) | 24 months |
| Unsubscribe records | Permanently (to prevent re-enrollment) |
| Resend email logs | 30 days (Resend standard) |

---

## 8. Performance Targets and KPIs

### 8.1 Email Deliverability Targets

| Metric | Target | Measurement |
|---|---|---|
| Deliverability rate | ≥ 98% | Resend deliverability dashboard |
| Bounce rate (hard) | < 0.5% | Resend bounce tracking |
| Spam complaint rate | < 0.08% | Resend complaint tracking |
| DMARC pass rate | 100% | DMARC Analyzer |

### 8.2 Workflow Performance Targets

| Workflow | Primary KPI | Target |
|---|---|---|
| WF-001 Abandoned Cart | Recovered orders / Abandoned carts | ≥ 5% recovery rate |
| WF-002 Welcome Series | First purchase within 14 days | ≥ 15% |
| WF-003 Post-Purchase | Warranty registration rate | ≥ 25% of orders |
| WF-004 Tier Upgrade | Open rate | ≥ 60% |
| WF-005 Points Expiry | Points redeemed before expiry | ≥ 40% of warned contacts |
| WF-006 Re-engagement | Re-activated users / Dormant users | ≥ 10% |
| WF-007 Distributor Nurture | Lead to qualified rate | ≥ 30% |
| WF-008 Cross-sell | Cross-sell conversion rate | ≥ 3% |
| WF-009 Exit Intent | Email capture rate (visitors who see popup) | ≥ 15% |
| WF-010 Referral Notification | Post-notification referral share rate | ≥ 25% |

### 8.3 Email Engagement Targets (Marketing Emails)

| Metric | Target |
|---|---|
| Open rate | ≥ 20% |
| Click-to-open rate (CTOR) | ≥ 15% |
| Unsubscribe rate per email | < 0.2% |

---

## 9. Analytics and Reporting

### 9.1 HubSpot Email Reports

HubSpot Marketing Hub provides built-in email performance reports. Monthly review of:
- Open rates by workflow and email step
- Click rates
- Unsubscribe rates
- Workflow enrollment and completion rates

### 9.2 PostHog Funnel: Post-Email Website Behavior

Track the behavior of contacts who clicked through from emails using UTM parameters on all email links:

```
UTM parameters for email links:
?utm_source=hubspot&utm_medium=email&utm_campaign=wf-001-cart-recovery&utm_content=email1-cta
```

PostHog captures these UTM parameters as person properties, enabling:
- Funnel: Email click → Product page → Add to Cart → Checkout → Purchase
- Comparison: Email-attributed conversion rate vs direct traffic conversion rate

### 9.3 Marketing Automation Dashboard (PostHog)

Add the following to the PostHog "Marketing Performance" dashboard:
- Email click-through traffic (`$pageview` filtered by `utm_medium = email`)
- Email-attributed purchases (`checkout_completed` filtered by `utm_source = hubspot`)
- Email-attributed AOV vs overall AOV

---

## 10. Business Rules

| Rule ID | Rule |
|---|---|
| BR-MKTAUTO-001 | Abandoned cart sequence only sends to contacts with `marketing_consent = true`. Guest contacts without consent receive no emails. |
| BR-MKTAUTO-002 | Welcome series stops immediately if contact completes a purchase at any step. |
| BR-MKTAUTO-003 | Order confirmation email (Email 1) is transactional and sends regardless of marketing consent. All post-purchase marketing emails (Emails 2-4) require `marketing_consent = true`. |
| BR-MKTAUTO-004 | Loyalty tier upgrade emails send via Resend (transactional — legitimate interest as they directly relate to the loyalty account), not subject to `marketing_consent`. |
| BR-MKTAUTO-005 | Points expiry warnings send via Resend (legitimate interest — transactional nature). |
| BR-MKTAUTO-006 | Re-engagement campaign runs a maximum of 3 emails per contact per 6-month inactivity period. Contacts who have previously received and completed a re-engagement cycle are not re-enrolled for 12 months. |
| BR-MKTAUTO-007 | Distributor nurture emails are classified as B2B legitimate interest under GDPR Article 6(1)(f). All emails include an opt-out link. |
| BR-MKTAUTO-008 | Cross-sell recommendations must not suggest a product the contact has already purchased. |
| BR-MKTAUTO-009 | Exit intent popup shows maximum once per user per 7 days (cookie-rate-limited). Not shown to already-subscribed users. Not shown to users in checkout flow. |
| BR-MKTAUTO-010 | Referral success notification sends only on the referee's first order confirmation. Subsequent orders by the same referee do not trigger additional notifications. |
| BR-MKTAUTO-011 | All discount codes generated for marketing automation (cart recovery, welcome discount, re-engagement, exit intent) are single-use, contact-specific, and have a defined expiry. Codes are generated via Medusa Promotions API with `usage_limit = 1`. |
| BR-MKTAUTO-012 | No contact shall receive more than 3 marketing emails (HubSpot workflows combined) per week, enforced via HubSpot's "Email frequency cap" setting. Transactional emails (Resend) are exempt from this cap. |
| BR-MKTAUTO-013 | All HubSpot marketing email templates must have a working unsubscribe link tested before activation. |
| BR-MKTAUTO-014 | Unsubscribe requests from HubSpot must be synchronized to the TwinMOS account database (Medusa customer record `marketing_opt_out = true`) within 24 hours via HubSpot webhook. |
| BR-MKTAUTO-015 | VAT/GST invoice PDF must be generated and attached to the order confirmation email (Email 1, WF-003) for all orders in UAE (UAE TRN visible), India (GSTIN visible), and KSA (VAT number visible). |

---

## 11. Acceptance Criteria

| ID | Criterion | Verified by |
|---|---|---|
| AC-MKTAUTO-001 | HubSpot account configured with all 15 custom contact properties (Section 5.1) | Dev A |
| AC-MKTAUTO-002 | All 14 HubSpot contact lists created and populating correctly with test data | Dev A + TwinMOS Marketing |
| AC-MKTAUTO-003 | WF-001 (Abandoned Cart): end-to-end test with real email — all 3 emails received in correct sequence with correct timing | Dev B + TwinMOS PM |
| AC-MKTAUTO-004 | WF-002 (Welcome Series): all 4 emails triggered correctly on test registration | Dev B |
| AC-MKTAUTO-005 | WF-003 (Post-Purchase): order confirmation received within 5 minutes of order placement via Resend | Dev A |
| AC-MKTAUTO-006 | WF-003: VAT/GST invoice PDF correctly generated and attached for UAE, India, KSA test orders | Dev A + TwinMOS Finance |
| AC-MKTAUTO-007 | WF-004 (Tier Upgrade): email received immediately on test tier upgrade | Dev B |
| AC-MKTAUTO-008 | WF-006 (Re-engagement): workflow correctly identifies dormant test contacts (manually set `last_activity_date` 181 days ago) | Dev B |
| AC-MKTAUTO-009 | WF-007 (Distributor Nurture): HubSpot deal automatically created on distributor form submission | Dev A |
| AC-MKTAUTO-010 | WF-009 (Exit Intent): popup does not appear when user is in checkout; rate limit cookie prevents re-show for 7 days | Dev B + QA |
| AC-MKTAUTO-011 | All HubSpot marketing email templates tested in Gmail, Outlook 2019, Apple Mail on mobile and desktop | TwinMOS Marketing |
| AC-MKTAUTO-012 | DKIM, SPF, and DMARC records verified in Resend dashboard (all green) | Dev A |
| AC-MKTAUTO-013 | Unsubscribe link working in all HubSpot marketing email templates; unsubscribe reflected in HubSpot within 5 minutes | Dev B + TwinMOS Marketing |
| AC-MKTAUTO-014 | `marketing_consent` flag enforced: attempt to enroll contact without consent into WF-001 fails (HubSpot workflow condition blocks) | Dev A |
| AC-MKTAUTO-015 | Resend deliverability test: send 100 test emails to Gmail/Outlook/Yahoo — deliverability ≥ 98%, no spam folder issues | Dev A + TwinMOS Marketing |

---

*Document reference: TWN-P3-MKTAUTO-2026-001 | Version 1.0 | TwinMOS Technologies*
*This document is confidential and intended for internal use only.*
