# ADR-018: Loyalty Program Engine

| Field | Value |
|-------|-------|
| **ADR Number** | ADR-018 |
| **Date** | 2026-04-15 |
| **Status** | Proposed — Deferred to Phase 3 Design Sprint |
| **Deciders** | Engineering Lead, Project Owner |
| **Source** | Tech Stack §17 (Phase 3 roadmap) |

---

## 1. Context

TwinMOS Phase 3 introduces direct-to-consumer (DTC) e-commerce for the VOLTX gaming segment. A loyalty program could support:
- Consumer retention for repeat VOLTX RAM and SSD purchases
- Referral incentives (gaming community word-of-mouth)
- Engagement with the VOLTX brand ecosystem (gaming peripherals, community events)
- Potentially, a tiered distributor rewards programme (separate from consumer loyalty)

### Market Context

TwinMOS's primary sales model is **B2B distribution** (manufacturer → distributor → retailer → consumer). A DTC loyalty programme applies only to the subset of consumers buying directly from twinmos.com (Phase 3 e-commerce scope), initially UAE and India.

**Consumer loyalty makes most sense for:**
- VOLTX gaming memory (impulse/enthusiast purchase, community-driven)
- Repeat SSD/flash purchasers
- Early adopters of new product lines

**Consumer loyalty is less applicable for:**
- Enterprise/business DRAM purchasers (B2B account management handles retention)
- Distributor/reseller relationships (handled via MDF/co-op programmes separately)

### Open Questions (to be resolved at Phase 3 planning)

1. What is the DTC purchase volume target? (Loyalty only makes sense at >500 customers/month)
2. Is the program points-based, tier-based, or referral-only?
3. Does TwinMOS have the operational capacity to manage a loyalty program at launch?
4. What markets are in scope? (UAE/India have different consumer loyalty expectations)

These questions are not answerable before Phase 2 (DTC is not yet live). **This ADR documents the decision to defer and records the candidate options evaluated.**

---

## 2. Decision

**Decision is deferred to Phase 3 Design Sprint.**

At the Phase 3 planning sprint, the team will evaluate:
1. DTC launch metrics from Phase 2 (is there sufficient volume to warrant loyalty?)
2. Select from the options below based on those metrics

**Provisional preference (pending Phase 3 review):** Custom-built lightweight points system on Strapi + Medusa.js, if volume warrants it — to avoid SaaS vendor lock-in at small scale.

---

## 3. Candidate Options

### Option A: Custom-Built on Strapi + Medusa

**Build a lightweight loyalty system using existing infrastructure:**

```
Strapi collections:
  loyalty_account: { customerId, points, tier, lifetimePoints }
  loyalty_transaction: { accountId, points, reason, orderId, createdAt }
  loyalty_reward: { name, pointsCost, type, value }

Medusa.js:
  Order completion → Strapi lifecycle hook → award points
  Checkout → apply reward code → Medusa discount
```

| Pros | Cons |
|------|------|
| $0 platform cost | 40–80 dev hours to build |
| Full data ownership | No out-of-box analytics/dashboards |
| Tight Medusa integration | Must build points redemption UX |
| No vendor dependency | Risk of bugs in custom finance logic |

**Appropriate if:** DTC volume >1,000 orders/month, team has capacity, TwinMOS wants full control.

### Option B: Smile.io (SaaS Loyalty Platform)

**Industry-standard loyalty SaaS used by Shopify merchants:**

- Points programme, referral programme, VIP tiers
- Medusa.js integration via API
- Branded loyalty widget
- Cost: **$49/mo (Starter)** — 500 reward members; **$199/mo (Growth)** — 2,500 members

| Pros | Cons |
|------|------|
| No development required | $49–$199+/mo |
| Proven reliability | Vendor lock-in |
| Dashboard + analytics | Data leaves TwinMOS infrastructure |
| Referral programme included | Overpowered for early-stage DTC |

**Appropriate if:** Team wants a fast Phase 3 launch without loyalty development time; DTC expected to scale quickly.

### Option C: Stamp.me (SaaS, Simpler Tier)

**Simpler, lower-cost digital stamp card loyalty:**

- Digital stamp cards (buy 10 products, get 1 free equivalent)
- QR code-based in-store scanning (for retail partners)
- REST API
- Cost: **$29/mo** (up to 500 cards/month)

| Pros | Cons |
|------|------|
| Lower cost than Smile.io | Less sophisticated than points system |
| Quick setup | Limited e-commerce integration |
| QR code for retail | Less flexible tier/referral features |

**Appropriate if:** Loyalty scope is limited to a simple punch-card equivalent; Phase 3 DTC is small-scale.

### Option D: Referral Programme Only (No Points System)

**Simplest approach: referral links with discount rewards:**

- Medusa.js discount code generation for referrer
- Referral tracking: `?ref=AFFILIATE_CODE` UTM parameter → Medusa discount
- No dedicated loyalty platform needed
- Cost: **$0** (custom code using Medusa discounts)

| Pros | Cons |
|------|------|
| $0 cost | No retention mechanism beyond referral |
| Medusa-native (discount codes) | Limited engagement for gaming community |
| Low development time (1 day) | No tier/points system |

**Appropriate if:** Phase 3 DTC volume is low (<500 orders/month); loyalty is low-priority vs. other Phase 3 features.

---

## 4. Decision Framework for Phase 3

At the Phase 3 Design Sprint, the team should answer:

| Question | Threshold for Custom Build | Threshold for SaaS |
|---------|--------------------------|-------------------|
| Monthly DTC order volume | >1,000/mo | <500/mo |
| Engineering capacity | Available bandwidth | No bandwidth |
| Customer retention rate | <40% (loyalty needed) | >60% (loyalty less critical) |
| Phase 3 timeline pressure | Relaxed | Tight |

**If Phase 3 DTC launches and loyalty is deferred further:** Implement Option D (referral-only) as Phase 3 placeholder; full loyalty for Phase 4.

---

## 5. Consequences

### Why Defer

- Premature loyalty programme implementation without user data is waste
- Phase 2 has no DTC sales — there are no loyalty programme metrics to design against
- Loyalty programme scope and features should be driven by real customer behaviour
- Deferring keeps Phase 3 scope focused on core commerce capability (cart, checkout, orders)

### What Must Be Decided at Phase 3

1. Loyalty programme scope (points, tiers, referral, or combination)
2. Customer segments (VOLTX gaming consumers only, or all DTC)
3. Build vs buy (based on DTC volume metrics)
4. Integration with Better Auth partner portal (if B2B rewards are in scope)

### Related Phase 3 Decisions

This ADR interacts with:
- **ADR-014 (Medusa.js):** Order completion triggers loyalty event
- **ADR-015 (Better Auth):** Partner loyalty account linked to session
- **ADR-012 (HubSpot CRM):** Loyalty tier may be synced to HubSpot contact property

---

## 6. Implementation Notes (Placeholder for Phase 3)

**Custom-build schema (if Option A chosen):**
```typescript
// Strapi collection: loyalty-account
{
  customerId:      { type: 'relation', relation: 'oneToOne', target: 'plugin::users-permissions.user' },
  points:          { type: 'integer', default: 0, min: 0 },
  lifetimePoints:  { type: 'integer', default: 0 },
  tier:            { type: 'enumeration', enum: ['bronze', 'silver', 'gold', 'platinum'], default: 'bronze' },
  expiresAt:       { type: 'datetime' },
}

// Strapi collection: loyalty-transaction
{
  account:   { type: 'relation', relation: 'manyToOne', target: 'api::loyalty-account.loyalty-account' },
  points:    { type: 'integer' },           // positive = earn, negative = redeem
  reason:    { type: 'enumeration', enum: ['purchase', 'referral', 'signup', 'review', 'redemption'] },
  orderId:   { type: 'string' },
  expiresAt: { type: 'datetime' },
}
```

**Tier thresholds (provisional):**
| Tier | Lifetime Points | Earning Rate | Discount |
|------|----------------|-------------|---------|
| Bronze | 0–999 | 1 pt/$1 | — |
| Silver | 1,000–4,999 | 1.5 pts/$1 | 2% off |
| Gold | 5,000–14,999 | 2 pts/$1 | 5% off |
| Platinum | 15,000+ | 3 pts/$1 | 8% off + free shipping |

These thresholds are provisional and must be validated against Phase 3 average order value and purchase frequency data.

---

## 7. Related ADRs

- ADR-014: Ecommerce (Medusa.js — order completion triggers loyalty)
- ADR-015: Better Auth (session/account model for loyalty accounts)
- ADR-012: CRM Selection (loyalty tier may sync to HubSpot)
