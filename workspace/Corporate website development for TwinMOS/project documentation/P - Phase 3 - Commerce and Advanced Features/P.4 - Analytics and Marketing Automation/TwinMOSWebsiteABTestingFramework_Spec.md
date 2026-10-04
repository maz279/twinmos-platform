# TwinMOS Technologies — A/B Testing Framework Specification

| Field | Value |
|---|---|
| Document Reference | TWN-P3-ABTEST-2026-001 |
| Version | 1.0 |
| Phase | Phase 3 — Commerce and Advanced Features |
| Status | Draft for Review |
| Author | TwinMOS Web Development Team |
| Date | 2026-05-01 |
| Confidentiality | Internal — TwinMOS Technologies |

---

## Table of Contents

1. [Introduction and Testing Philosophy](#1-introduction-and-testing-philosophy)
2. [Testing Tool: PostHog Experiments](#2-testing-tool-posthog-experiments)
3. [End-to-End A/B Testing Process](#3-end-to-end-ab-testing-process)
4. [Hypothesis Template](#4-hypothesis-template)
5. [Statistical Framework](#5-statistical-framework)
6. [Phase 3 Experiment Backlog](#6-phase-3-experiment-backlog)
7. [Technical Implementation Guide](#7-technical-implementation-guide)
8. [Experiment Targeting](#8-experiment-targeting)
9. [Guardrail Metrics](#9-guardrail-metrics)
10. [Experiment Log Template](#10-experiment-log-template)
11. [Results Communication](#11-results-communication)
12. [Multi-Variate Testing (MVT)](#12-multi-variate-testing-mvt)
13. [Sample Ratio Mismatch Detection](#13-sample-ratio-mismatch-detection)
14. [Interaction Effects and Overlapping Experiments](#14-interaction-effects-and-overlapping-experiments)
15. [Acceptance Criteria](#15-acceptance-criteria)

---

## 1. Introduction and Testing Philosophy

### 1.1 Purpose of This Document

This specification defines the A/B testing framework for TwinMOS Technologies' Phase 3 website. It covers the end-to-end process from hypothesis formulation through statistical analysis, technical implementation in Astro, and decision-making protocols. This document is the authoritative reference for all experiments conducted during and after Phase 3.

### 1.2 Testing Philosophy

**Data-Driven Optimization**

TwinMOS's website will serve customers across 93+ countries in 7+ languages, across multiple device types and purchasing contexts. Intuition about what "works" is unreliable at this scale. Every significant UX change to conversion-critical pages (product pages, cart, checkout, account) must be validated through experimentation before permanent deployment.

**Minimum Viable Experiment**

Not every question requires a full A/B test. Before setting up an experiment, ask:

1. Can this be answered by analyzing existing PostHog data (funnels, session replays)?
2. Is the expected impact large enough to be detectable with available traffic?
3. Is the change reversible if the test goes wrong?

If existing data answers the question, run the analysis first. Only run an A/B test when data is ambiguous or the question requires counterfactual evidence.

**Statistical Rigor**

The testing framework enforces:
- Minimum 14-day run time regardless of how fast significance is reached
- No early stopping based on positive trends (peeking is forbidden)
- Pre-registered hypotheses and primary metrics before test launch
- Statistical significance threshold of 95% confidence

**Culture of Learning**

A failed experiment (no significant improvement) is as valuable as a winning experiment. Failed tests tell the team what does not work, preventing wasted future investment. All experiment results — positive, negative, and null — are logged in the experiment log.

### 1.3 What We Are Optimizing For

TwinMOS Phase 3 experiments are ultimately aimed at improving:

| North Star Metric | Definition |
|---|---|
| E-Commerce Conversion Rate | Orders / Unique product page visitors |
| Average Order Value (AED) | Total revenue / Number of orders |
| Loyalty Program Enrollment | Loyalty accounts created / Registered users |
| Customer Lifetime Value | Predicted 12-month revenue per customer |

Individual experiments will target specific sub-metrics that are believed to be causally linked to the North Star metrics.

---

## 2. Testing Tool: PostHog Experiments

### 2.1 Why PostHog Experiments?

PostHog Experiments is built directly on top of PostHog's feature flags infrastructure. Since TwinMOS has already chosen PostHog OSS for analytics (see TWN-P3-POSTHOG-2026-001), using PostHog Experiments means:

- **Zero additional cost:** No separate A/B testing vendor (Optimizely, VWO, etc.) required. PostHog OSS includes experiments at no charge.
- **Unified data:** Experiment exposure and conversion events live in the same PostHog database. No cross-tool data stitching needed.
- **Bayesian and frequentist analysis:** PostHog provides both statistical approaches; TwinMOS will use frequentist with 95% significance threshold (see Section 5).
- **Self-hosted:** Experiment data never leaves Hetzner infrastructure.

### 2.2 PostHog Experiments vs Alternatives

| Platform | Monthly cost (est.) | Self-hosted | Integrated analytics | Phase 3 fit |
|---|---|---|---|---|
| PostHog Experiments | EUR 0 (included in PostHog) | Yes | Yes (same DB) | Excellent |
| Optimizely Feature Experimentation | USD 2,000–6,000/mo | No | No | Poor (cost) |
| VWO (Visual Website Optimizer) | USD 400–1,200/mo | No | No | Poor (cost) |
| LaunchDarkly Experimentation | USD 300–800/mo | No | No | Poor (cost) |
| Google Optimize | Discontinued (2023) | N/A | Limited | N/A |
| AB Tasty | USD 1,000+/mo | No | No | Poor (cost) |

PostHog Experiments is the clear choice for TwinMOS's budget and architecture constraints.

### 2.3 PostHog Experiments Capabilities

- Maximum variants per experiment: 5 (control + 4 variants)
- Traffic split: custom percentage allocation per variant
- Targeting: by feature flag conditions (country, device type, user properties, cohort)
- Statistical analysis: frequentist significance test, Bayesian probability, trend graphs
- Secondary metrics: track multiple metrics per experiment simultaneously
- Guardrail metrics: flag if experiments harm critical metrics

---

## 3. End-to-End A/B Testing Process

### Step 1: Hypothesis Formulation

**Who:** Product team + developer + data analyst
**When:** Sprint planning or backlog grooming
**Output:** Written hypothesis (see Section 4 for template)

Before writing code, the team must document:
- The problem observed in PostHog data (funnel drop-off, low engagement, etc.)
- The proposed change (what is being tested)
- The user segment being targeted
- The primary success metric
- The minimum detectable effect (MDE)

The hypothesis must be submitted as a Notion/Strapi experiment card and reviewed by the PM before any implementation begins. This prevents "test first, hypothesize later" which leads to HARKing (Hypothesizing After Results are Known).

### Step 2: Experiment Design

**Who:** Developer + PM
**Output:** Experiment design document (in experiment log)

Design decisions to make before implementation:

| Decision | Options | Notes |
|---|---|---|
| Control definition | Current live experience | Always use current production as control |
| Number of variants | 1 (simple A/B) or 2–4 (MVT) | Prefer simple A/B for most tests |
| Traffic split | 50/50 (A/B) or custom | Equal splits have maximum power |
| Targeting criteria | All users, new users, mobile, by country, etc. | Narrowing targeting reduces sample size |
| Minimum run time | 14 days minimum | Always run at least 2 full weeks |
| Primary metric | One metric only | Resist testing with multiple primary metrics |
| Secondary metrics | Up to 3 | Informational; do not use for go/no-go decision |
| Guardrail metrics | LCP, checkout error rate, Lighthouse | Automatically fail test if harmed |

### Step 3: Technical Implementation

**Who:** Developer
**Output:** Code changes in feature branch + PostHog experiment created

1. Create PostHog feature flag for the experiment (naming convention: `{feature}-{variant}-p3`)
2. Implement variant rendering in Astro (see Section 7 for code examples)
3. Verify flag evaluation is working in staging (QA team uses PostHog override to force each variant)
4. Confirm primary metric event is firing correctly in all variants
5. Create PostHog Experiment: link the feature flag, select primary metric, set significance threshold

### Step 4: Launch

**Who:** Developer (merges to main) + PM (confirms live)
**Output:** Experiment running in production

Launch protocol:
1. Merge feature flag implementation to main (behind the feature flag — no user-visible change yet)
2. In PostHog, activate the experiment at **5%** traffic
3. Monitor for 24 hours: check for JavaScript errors, metric data appearing correctly, no SRM (Sample Ratio Mismatch)
4. If no issues at 5%: expand to **20%**
5. Continue monitoring. If primary metric shows no degradation: expand to **50%**
6. After 14 days minimum at 50%+: analyze results

> Exception: if a bug or serious UX issue is discovered in a variant at any rollout stage, immediately set that variant to 0% traffic in PostHog (do not wait for sprint).

### Step 5: Monitor

**Who:** Developer (daily check) + PM (weekly review)
**Frequency:** Daily check of live experiment dashboard

Daily monitoring checklist during experiment run:

- [ ] Sample ratio mismatch check: is traffic split within 5% of expected?
- [ ] Primary metric trending (not for decision-making, but for data quality check)
- [ ] JavaScript error rate: no new errors introduced by variant
- [ ] Guardrail metrics: LCP, checkout error rate stable
- [ ] Session recordings: watch 5 variant sessions for obvious UX issues

### Step 6: Analysis

**Who:** Developer + PM
**When:** After minimum 14-day run AND after reaching minimum sample size
**Output:** Analysis report in experiment log

Analysis process:
1. Open PostHog Experiment results page
2. Check whether statistical significance threshold (p < 0.05) has been reached
3. Check 95% confidence interval for the effect size
4. Check all secondary metrics and guardrail metrics
5. Cross-validate primary metric in PostHog raw funnel analysis (separate from the experiment UI)
6. Document findings in the experiment log (regardless of outcome)

### Step 7: Decision

**Who:** PM (final decision authority)
**Options:**

| Outcome | Criteria | Action |
|---|---|---|
| **Ship winner** | p < 0.05, positive effect, no guardrail violations | Set winning variant to 100% → clean up flag in code in next sprint |
| **Iterate** | Directional positive effect but not significant; experiment reveals new hypothesis | Design follow-up experiment |
| **Abandon** | Null result after sufficient sample size; or negative effect | Keep control at 100% → log learnings → move on |
| **Invalidated** | SRM detected, data quality issue, bug in variant | Fix issue and restart experiment |

### Step 8: Documentation

**Who:** Developer
**When:** Within 5 business days of decision
**Output:** Completed experiment log entry (see Section 10)

All experiments must be logged regardless of outcome. The experiment log is the institutional memory of what has been learned about TwinMOS's customers.

---

## 4. Hypothesis Template

All experiments must have a pre-registered hypothesis in this format before implementation begins:

---

**Hypothesis Statement:**

> "We believe that **[changing X]** for **[user segment]** will **[improve / reduce]** **[primary metric]** because **[rationale based on data or research]**. We will know this is true when **[primary metric]** changes by at least **[minimum detectable effect]** with **95% statistical confidence** over a minimum of **14 days**."

---

**Example — Checkout Flow Experiment:**

> "We believe that **a one-page checkout flow** for **all checkout users** will **improve** **checkout completion rate** because **research shows that reducing page transitions decreases dropout in e-commerce checkout**. We will know this is true when **checkout completion rate** changes by at least **5 percentage points** with 95% statistical confidence over a minimum of 14 days."

**Example — Referral Banner Experiment:**

> "We believe that **placing the referral program banner in the header (persistent)** for **authenticated users who have not yet shared a referral link** will **improve** **referral link share rate** because **persistent visibility increases program awareness more than a sidebar that may be scrolled past**. We will know this is true when **referral_link_shared events per session** changes by at least **20%** with 95% statistical confidence over a minimum of 14 days."

---

**Hypothesis Checklist (PM sign-off required before implementation):**

- [ ] Problem is supported by existing PostHog data (include screenshot/link)
- [ ] Only one primary metric defined
- [ ] MDE is realistic given expected traffic and base rate
- [ ] User segment is clearly defined
- [ ] Rationale is based on evidence, not just intuition
- [ ] No HARKing — this hypothesis was written before seeing any test data

---

## 5. Statistical Framework

### 5.1 Core Parameters

| Parameter | Value | Rationale |
|---|---|---|
| Significance level (α) | 0.05 (5%) | Industry standard; 95% confidence |
| Statistical power (1-β) | 0.80 (80%) | Industry standard; 80% chance of detecting real effect |
| Minimum run time | 14 days | Accounts for day-of-week seasonality (minimum 2 full weeks) |
| Tails | Two-tailed | Tests for both improvement and degradation |
| Test type | Frequentist (z-test for proportions, t-test for continuous metrics) | PostHog Experiments default |

### 5.2 Sample Size Calculation

Before launching an experiment, calculate the required sample size per variant:

**Formula for proportion metrics (e.g., conversion rate):**

```
n = (Z_α/2 + Z_β)² × (p₁(1-p₁) + p₂(1-p₂)) / (p₁ - p₂)²

Where:
  Z_α/2 = 1.96  (for α = 0.05, two-tailed)
  Z_β   = 0.84  (for 1-β = 0.80)
  p₁    = base conversion rate (current, from PostHog)
  p₂    = expected conversion rate with variant = p₁ + MDE
  MDE   = minimum detectable effect (absolute percentage points)
```

**Simplified table for common base rates and MDE values:**

| Base rate | MDE (+absolute %) | Sample size per variant |
|---|---|---|
| 2% (product → purchase) | 0.5 pp | ~11,000 |
| 2% (product → purchase) | 1.0 pp | ~3,100 |
| 8% (view → add to cart) | 1.0 pp | ~7,000 |
| 8% (view → add to cart) | 2.0 pp | ~1,900 |
| 40% (cart → checkout start) | 5.0 pp | ~1,500 |
| 60% (checkout start → complete) | 5.0 pp | ~1,200 |

**Sample size calculator (JavaScript, for internal use):**

```javascript
/**
 * Calculate required sample size per variant for a proportion A/B test.
 * @param {number} baseRate - Current conversion rate (0-1, e.g. 0.08 for 8%)
 * @param {number} mde - Minimum detectable effect as absolute proportion (e.g. 0.02 for 2pp)
 * @param {number} alpha - Significance level (default 0.05)
 * @param {number} power - Statistical power (default 0.80)
 * @returns {number} - Required sample size per variant
 */
function calculateSampleSize(
  baseRate,
  mde,
  alpha = 0.05,
  power = 0.80
) {
  const z_alpha = 1.96;  // Z score for alpha=0.05, two-tailed
  const z_beta = 0.84;   // Z score for power=0.80
  const p1 = baseRate;
  const p2 = baseRate + mde;
  const n = Math.ceil(
    Math.pow(z_alpha + z_beta, 2) *
    (p1 * (1 - p1) + p2 * (1 - p2)) /
    Math.pow(p2 - p1, 2)
  );
  return n;
}

// Usage examples:
console.log(calculateSampleSize(0.08, 0.02));  // 8% base rate, 2pp MDE → ~1,900 per variant
console.log(calculateSampleSize(0.02, 0.005)); // 2% base rate, 0.5pp MDE → ~11,000 per variant
```

**Time-to-significance estimate:**

```
Days needed = Required sample size per variant / (Daily unique visitors / Number of variants)

Example:
  - Required: 1,900 per variant
  - Daily unique visitors to checkout: 200
  - Variants: 2 (control + 1)
  - Days needed: 1,900 / (200/2) = 19 days
  → Run for 21 days (round up to full weeks)
```

### 5.3 Minimum Run Time Policy

**14-day minimum is non-negotiable, even if:**
- Statistical significance is reached on Day 3
- The winning trend appears obvious
- The PM is eager to ship

**Why?** Weekly seasonality means that data collected over less than 14 days may reflect only weekday or only weekend behavior, not the full user population. Monday shoppers behave differently from Saturday shoppers. A test reaching significance on Day 3 likely has insufficient sample diversity.

**No Peeking Rule**

Do not make go/no-go decisions by looking at experiment results mid-run. If you check results daily and stop when you see a significant positive result, the false positive rate rises dramatically above 5% (it can reach 25–40% with frequent peeking). The correct procedure is:

1. Set the analysis date when the experiment launches (launch date + 14 days minimum, or when MDE sample size is reached, whichever is later)
2. Do not look at p-values before the analysis date
3. Exception: monitor guardrail metrics only (to catch harmful regressions)

### 5.4 Effect Size and Practical Significance

Statistical significance alone is insufficient. A result can be statistically significant but practically meaningless. Always check:

1. **Effect size:** Is the absolute improvement meaningful? A 0.1 percentage point improvement in conversion rate may be statistically significant but operationally irrelevant.
2. **Confidence interval width:** A wide CI (e.g., effect could be +1% to +20%) indicates imprecise estimate; may need more data.
3. **Business impact:** Estimate the revenue or enrollment impact of the effect size. Is it worth the complexity of the new variant?

---

## 6. Phase 3 Experiment Backlog

The following 10 experiments are planned for Phase 3. They are listed in priority order (highest business impact first). Not all 10 will run simultaneously — see Section 14 for overlap policy.

---

### Experiment 1: Checkout Flow (One-Page vs Multi-Step)

| Field | Detail |
|---|---|
| Experiment ID | EXP-P3-001 |
| Name | Checkout Flow Architecture |
| Priority | P0 — Critical |
| Flag key | `ecommerce-checkout-flow-p3` |
| Status | Ready for implementation |
| **Hypothesis** | One-page checkout will improve checkout completion rate by at least 5 percentage points because reducing page transitions eliminates load-time friction and progress anxiety. |
| **Primary metric** | Checkout completion rate (`checkout_completed` / `checkout_started`) |
| Secondary metrics | Time from checkout start to completion; checkout abandonment rate; AOV |
| **Control** | Multi-step checkout (4 pages: Contact → Shipping → Payment → Review) |
| **Variant A** | One-page checkout (all steps on a single scrollable page with accordion sections) |
| Traffic split | 50% control / 50% variant A |
| Targeting | All users entering checkout |
| Estimated base rate | 60% completion |
| MDE | 5 percentage points |
| Required sample size | ~1,200 per variant |
| Estimated run time | 14 days (at 90 checkout starts/day) |
| Guardrail metrics | Checkout error rate ≤ 1%, LCP ≤ 2.5s |

**Implementation notes:** Both checkout flows must be fully functional (not wireframes). The one-page variant uses accordion/stepper sections. Progress indicator must be present in both variants.

---

### Experiment 2: Cart Page CTA Copy

| Field | Detail |
|---|---|
| Experiment ID | EXP-P3-002 |
| Name | Cart CTA Button Copy |
| Priority | P1 — High |
| Flag key | `cart-cta-copy-p3` |
| Status | Ready for implementation |
| **Hypothesis** | "Buy Now" button text will improve checkout start rate by at least 3 percentage points vs "Proceed to Checkout" because action-oriented, concise copy reduces hesitation. |
| **Primary metric** | Checkout start rate (`checkout_started` / `$pageview` on `/cart`) |
| Secondary metrics | Cart abandonment rate, time to checkout start |
| **Control** | "Proceed to Checkout" |
| **Variant A** | "Buy Now — Secure Checkout" |
| Traffic split | 50/50 |
| Targeting | All users viewing cart page with ≥ 1 item |
| Estimated base rate | 40% |
| MDE | 3 percentage points |
| Required sample size | ~2,600 per variant |
| Estimated run time | 18 days |

---

### Experiment 3: Product Page Price Position

| Field | Detail |
|---|---|
| Experiment ID | EXP-P3-003 |
| Name | Price Position on Product Detail Page |
| Priority | P1 — High |
| Flag key | `product-price-position-p3` |
| Status | Planned |
| **Hypothesis** | Displaying the price at the top of the product detail page (above the spec table) will improve add-to-cart rate by 1 percentage point because price-sensitive buyers (majority in BD, IN markets) want to see price before reading specs. |
| **Primary metric** | Add-to-cart rate (`product_added_to_cart` / `product_viewed`) |
| Secondary metrics | Time on product page, scroll depth |
| **Control** | Price displayed below product specifications table |
| **Variant A** | Price displayed immediately below product title and hero image, above specs |
| Traffic split | 50/50 |
| Targeting | All users viewing product detail pages |
| Estimated base rate | 8% |
| MDE | 1 percentage point |
| Required sample size | ~7,000 per variant |
| Estimated run time | 21 days |

---

### Experiment 4: Loyalty Program Enrollment Banner

| Field | Detail |
|---|---|
| Experiment ID | EXP-P3-004 |
| Name | Loyalty Program Awareness Banner Format |
| Priority | P1 — High |
| Flag key | `loyalty-banner-format-p3` |
| Status | Planned |
| **Hypothesis** | A persistent header badge showing "Earn X points on this order" will improve loyalty program enrollment rate by 20% relative vs a dismissible popup because persistent in-context information reduces the cognitive gap between action and reward. |
| **Primary metric** | Loyalty enrollment rate (`loyalty_points_earned` first event / `account_registered`) |
| Secondary metrics | Popup dismissal rate (for popup variant), header badge click-through rate |
| **Control** | Dismissible popup on first product page visit (post-login) |
| **Variant A** | Persistent header badge visible on all product and cart pages |
| Traffic split | 50/50 |
| Targeting | Authenticated users not yet enrolled in loyalty program |
| Estimated base rate | 30% enrollment within first session post-registration |
| MDE | 20% relative uplift (~6 pp absolute) |
| Required sample size | ~1,000 per variant |
| Estimated run time | 14 days |

---

### Experiment 5: Referral Program Placement

| Field | Detail |
|---|---|
| Experiment ID | EXP-P3-005 |
| Name | Referral Program CTA Placement |
| Priority | P2 — Medium |
| Flag key | `referral-placement-p3` |
| Status | Planned |
| **Hypothesis** | Placing the referral program CTA on the order confirmation page will generate more referral link shares per order than placing it only in the account dashboard because the post-purchase moment is a peak satisfaction moment for sharing. |
| **Primary metric** | Referral link shares per completed order (`referral_link_shared` / `checkout_completed`) |
| Secondary metrics | Referral link copies |
| **Control** | Referral program visible only in /account/referrals dashboard |
| **Variant A** | Referral CTA prominently displayed on /checkout/confirmation page + /account/referrals |
| Traffic split | 50/50 |
| Targeting | All users completing an order |
| Estimated base rate | 2% referral share per order |
| MDE | 1 percentage point absolute |
| Required sample size | ~5,800 per variant |
| Estimated run time | 28 days (lower volume metric) |

---

### Experiment 6: Homepage Hero Design

| Field | Detail |
|---|---|
| Experiment ID | EXP-P3-006 |
| Name | Homepage Hero Creative Strategy |
| Priority | P2 — Medium |
| Flag key | `homepage-hero-strategy-p3` |
| Status | Planned |
| **Hypothesis** | A product-focused hero (featuring specific product with specs and CTA) will generate more product page clicks than a brand-story hero because TwinMOS's target audience is technically informed and motivated by product details. |
| **Primary metric** | Product page clicks from homepage (`product_viewed` events originating from `/` referrer) |
| Secondary metrics | Bounce rate on homepage, scroll depth |
| **Control** | Brand-story hero ("Powering Performance Worldwide") with general brand imagery |
| **Variant A** | Product-focused hero featuring VOLTX DDR5 with spec highlights and "Shop Now" CTA |
| Traffic split | 50/50 |
| Targeting | All homepage visitors |

---

### Experiment 7: Navigation: Mega Menu vs Simple Dropdown

| Field | Detail |
|---|---|
| Experiment ID | EXP-P3-007 |
| Name | Navigation Design Complexity |
| Priority | P2 — Medium |
| Flag key | `nav-megamenu-p3` |
| Status | Planned |
| **Hypothesis** | A mega menu showing product categories with thumbnails will increase product discovery depth (pages per session) compared to a simple dropdown because visual product thumbnails aid navigation for users unfamiliar with the product range. |
| **Primary metric** | Product discovery depth: average product pages viewed per session |
| Secondary metrics | Navigation click-through rate, session duration |
| **Control** | Simple dropdown navigation (text-only, 2 levels) |
| **Variant A** | Mega menu with product category images, featured product thumbnails, and quick links |
| Traffic split | 50/50 |
| Targeting | All users (desktop only — mobile navigation unchanged) |

---

### Experiment 8: Product Comparison Layout

| Field | Detail |
|---|---|
| Experiment ID | EXP-P3-008 |
| Name | Product Comparison Table Layout |
| Priority | P3 — Low |
| Flag key | `comparison-layout-p3` |
| Status | Backlog |
| **Hypothesis** | A side-by-side comparison layout will increase comparison tool usage (completion rate) compared to a vertical stack because side-by-side enables easier direct attribute comparison with less scrolling. |
| **Primary metric** | Comparison tool completion rate (`product_compared` with ≥ 2 products / `product_compared` initiated) |
| Secondary metrics | Time in comparison tool, add-to-cart from comparison page |
| **Control** | Vertical stack layout (products displayed one below the other) |
| **Variant A** | Side-by-side layout (products displayed in columns) |
| Traffic split | 50/50 |
| Targeting | Users who initiate product comparison |

---

### Experiment 9: Compatibility Finder Input Type

| Field | Detail |
|---|---|
| Experiment ID | EXP-P3-009 |
| Name | Compatibility Finder Input Method |
| Priority | P3 — Low |
| Flag key | `compat-finder-input-p3` |
| Status | Backlog |
| **Hypothesis** | A typeahead (autocomplete) input for the compatibility finder will increase finder completion rate compared to a cascading dropdown because typeahead reduces the number of interactions required to find a system model. |
| **Primary metric** | Compatibility finder completion rate (`compatibility_finder_used` / finder opened) |
| Secondary metrics | Finder abandonment rate, time to completion |
| **Control** | Cascading dropdown selectors (Brand → Product Line → Model) |
| **Variant A** | Single typeahead search input with autocomplete suggestions |
| Traffic split | 50/50 |
| Targeting | Users who open the compatibility finder |

---

### Experiment 10: Email Subject Line Strategy (Marketing Emails)

| Field | Detail |
|---|---|
| Experiment ID | EXP-P3-010 |
| Name | Marketing Email Subject Line Strategy |
| Priority | P2 — Medium |
| Flag key | Implemented via HubSpot A/B (not PostHog) |
| Status | Planned |
| **Hypothesis** | Benefit-focused subject lines ("Never run out of memory again") will achieve a higher open rate than technical-spec-focused subject lines ("TwinMOS VOLTX DDR5-6000 — 32GB Now Available") because emotional benefit language appeals to a broader audience including non-technical buyers. |
| **Primary metric** | Email open rate |
| Secondary metrics | Click-through rate from email to product page |
| **Control** | Technical spec subject lines |
| **Variant A** | Benefit-focused subject lines |
| Tool | HubSpot built-in A/B email testing (separate from PostHog) |
| Sample size | 5,000 contacts per variant |

> Note: EXP-P3-010 is implemented via HubSpot's A/B email feature rather than PostHog, as it tests email rather than website behavior. Results are reported alongside PostHog experiments in the sprint review.

---

### 6.1 Experiment Priority Matrix

| Experiment | Business impact | Traffic volume | Implementation effort | Priority |
|---|---|---|---|---|
| EXP-P3-001 Checkout flow | Very High | Medium | High | P0 |
| EXP-P3-002 Cart CTA | High | Medium | Low | P1 |
| EXP-P3-003 Price position | High | High | Low | P1 |
| EXP-P3-004 Loyalty banner | High | Low (auth only) | Medium | P1 |
| EXP-P3-005 Referral placement | Medium | Low (post-purchase) | Low | P2 |
| EXP-P3-006 Homepage hero | Medium | High | High | P2 |
| EXP-P3-007 Navigation | Medium | High | High | P2 |
| EXP-P3-010 Email subjects | Medium | Medium (email list) | Low | P2 |
| EXP-P3-008 Comparison layout | Low | Very Low | Medium | P3 |
| EXP-P3-009 Compat finder | Low | Very Low | Medium | P3 |

**Phase 3 launch target:** EXP-P3-001 and EXP-P3-002 live at launch. EXP-P3-003 and EXP-P3-004 in Month 16. Remaining experiments in Month 17+.

---

## 7. Technical Implementation Guide

### 7.1 Creating a PostHog Experiment

In PostHog UI:
1. Navigate to **Experiments** → **New Experiment**
2. Enter experiment name and description
3. Select or create the feature flag for this experiment
4. Define variants (control + variant A, etc.)
5. Set traffic allocation per variant
6. Select primary goal metric from PostHog events
7. Set secondary metrics (optional, up to 3)
8. Set experiment start and expected end date
9. Save and activate

### 7.2 Astro React Island: Client-Side Flag Evaluation

For experiments on interactive components (cart, product page), use PostHog in a React island:

```typescript
// src/components/checkout/CheckoutController.tsx
// Reads the ecommerce-checkout-flow-p3 flag and renders appropriate variant

import { useEffect, useState } from 'react';
import posthog from 'posthog-js';
import MultiStepCheckout from './MultiStepCheckout';
import OnePageCheckout from './OnePageCheckout';

export default function CheckoutController() {
  const [variant, setVariant] = useState<string | null>(null);
  const [flagsLoaded, setFlagsLoaded] = useState(false);

  useEffect(() => {
    posthog.onFeatureFlags(() => {
      const flagValue = posthog.getFeatureFlag('ecommerce-checkout-flow-p3');
      setVariant(typeof flagValue === 'string' ? flagValue : 'multi-step');
      setFlagsLoaded(true);
    });

    // Timeout fallback: if flags don't load in 2s, use control
    const timeout = setTimeout(() => {
      if (!flagsLoaded) {
        setVariant('multi-step');
        setFlagsLoaded(true);
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  // Prevent layout shift: show skeleton while flags load
  if (!flagsLoaded) {
    return <CheckoutSkeleton />;
  }

  return variant === 'one-page' ? <OnePageCheckout /> : <MultiStepCheckout />;
}
```

**Usage in Astro page:**

```astro
---
// src/pages/checkout/index.astro
import CheckoutController from '@/components/checkout/CheckoutController';
---

<CheckoutController client:load />
```

### 7.3 Server-Side Flag Evaluation (Astro SSR)

For server-rendered pages where experiment variant must be known at render time (reduces layout shift, better for SEO):

```typescript
// src/pages/product/[slug].astro
---
import { PostHog } from 'posthog-node';

const posthogClient = new PostHog(import.meta.env.POSTHOG_KEY, {
  host: import.meta.env.POSTHOG_HOST,
  // Disable event sending from server-side evaluation (events go through client SDK)
  flushAt: 1,
  flushInterval: 0,
});

const userId = Astro.locals.session?.userId ?? posthog.distinctId ?? 'anonymous';

// Evaluate flag server-side
const pricePosition = await posthogClient.getFeatureFlag(
  'product-price-position-p3',
  userId
);

await posthogClient.shutdownAsync();

const showPriceAtTop = pricePosition === 'top';
---

<ProductDetail showPriceAtTop={showPriceAtTop} />
```

> **Note on SSR + client hydration:** When using server-side flag evaluation, pass the resolved variant as a prop to the client component. Do not evaluate the flag again on the client — this avoids the variant flickering between server and client renders.

### 7.4 Ensuring Correct Event Attribution

For PostHog Experiments to correctly attribute conversion events to experiment variants, the user must be assigned to the variant before the conversion event fires. Ensure:

1. Feature flag is evaluated (and PostHog records the "experiment exposure" event) before any tracked interaction
2. User identity (`posthog.identify()`) is called before flag evaluation for authenticated users — this ensures consistent variant assignment across sessions
3. Server-side flag evaluation uses the same `distinct_id` as the client-side PostHog instance

### 7.5 QA Testing of A/B Variants

To test specific variants in staging without affecting the traffic split:

**Method 1: PostHog user override**
In PostHog → Feature Flags → `ecommerce-checkout-flow-p3` → Override → Add your distinct_id → Force variant: `one-page`

**Method 2: URL parameter (development only)**
Add `?ph-feature-ecommerce-checkout-flow-p3=one-page` to force a variant locally. Implement this URL parsing in `posthog.ts` for development environment only.

---

## 8. Experiment Targeting

### 8.1 Targeting Options Available in PostHog

| Target segment | PostHog condition | Notes |
|---|---|---|
| All users | No conditions | Default; maximizes traffic and statistical power |
| New users only | `$initial_referring_domain` is not `twinmos.com` AND `total_orders = 0` | Tests acquisition experience |
| Authenticated users only | `is_authenticated = true` (person property) | Required for loyalty/referral tests |
| By country | `country = AE` / `country = IN` / etc. | For region-specific tests; reduces sample size |
| By device type | `$device_type = mobile` or `desktop` | For layout tests where mobile/desktop differ significantly |
| By loyalty tier | `customer_tier = gold` / `silver` / `bronze` | For loyalty program tests |
| High-value buyers | `total_orders >= 3` | For upsell/cross-sell tests |

### 8.2 Targeting Trade-offs

Narrowing targeting reduces sample size, which increases time-to-significance. Before applying targeting:

1. Calculate sample size with and without targeting
2. Determine if the test is still feasible within Phase 3 timeline with narrow targeting
3. If not feasible: consider broader targeting or dropping the experiment from Phase 3 scope

### 8.3 Geographic Targeting Considerations

TwinMOS operates in 93+ countries with significant market variation. Conversion rates differ substantially by market:

| Market | Typical characteristics |
|---|---|
| UAE | Higher AOV, lower price sensitivity, high mobile usage |
| India | Higher price sensitivity, UPI payment preference, high mobile usage |
| Bangladesh | Very high price sensitivity, mobile-first |
| KSA | Conservative checkout behavior, installment payment preference |

Experiments targeting all markets simultaneously may produce "average" results that mask opposite effects in different markets. For experiments with expected market-specific effects (e.g., price position), consider segmenting analysis by country in secondary metrics even if the test runs across all markets.

---

## 9. Guardrail Metrics

Guardrail metrics are critical performance and experience indicators that experiments must not harm. Unlike primary metrics (where we aim for improvement), guardrail metrics have fixed thresholds — violating them triggers immediate experiment pause.

| Guardrail metric | Threshold | Measurement method | Action if violated |
|---|---|---|---|
| **Page load time (LCP)** | ≤ 2.5 seconds | PostHog `$web_vitals` events + Lighthouse CI | Pause experiment immediately; investigate variant for render-blocking code |
| **Checkout error rate** | ≤ 1% of checkout attempts | `payment_failed` / `payment_initiated` ratio | Pause experiment; investigate payment integration in variant |
| **JavaScript error rate** | ≤ 0.5% of sessions | Browser error tracking (Sentry or PostHog `$exception` events) | Pause experiment; fix bug in variant |
| **Lighthouse Accessibility Score** | ≥ 95 | Lighthouse CI on variant pages | Do not ship variant; fix accessibility issues |
| **Mobile conversion rate** | Not degraded by >2 pp vs control | Segment checkout_completed by device_type=mobile | Flag for review; do not ship variant without mobile fix |

### 9.1 Guardrail Monitoring

Guardrail metrics are monitored daily during experiment runs (unlike primary metrics, which are reviewed only at analysis date). The daily monitoring checklist (Section 3, Step 5) includes guardrail checks.

### 9.2 Automatic Guardrail Alerts

Configure PostHog secondary metrics for guardrail metrics so they appear alongside primary metric in the experiment results page. This provides a single view of all metrics during the experiment run.

---

## 10. Experiment Log Template

Maintain the experiment log in Notion (or Strapi CMS as a collection type). Each experiment has one entry.

---

**Experiment Log Entry Template:**

| Field | Value |
|---|---|
| **Experiment ID** | EXP-P3-XXX |
| **Experiment name** | Human-readable name |
| **PostHog flag key** | `feature-flag-key-p3` |
| **Hypothesis** | Full hypothesis statement (from Section 4 template) |
| **Problem statement** | What PostHog data indicated the problem |
| **Start date** | YYYY-MM-DD |
| **Analysis date** | YYYY-MM-DD (pre-set at launch) |
| **Actual end date** | YYYY-MM-DD |
| **Control** | Description of control variant |
| **Variant A** | Description of variant A |
| **Variant B** (if MVT) | Description of variant B |
| **Targeting criteria** | Who was included in the experiment |
| **Traffic split** | e.g., 50/50 |
| **Primary metric** | Metric name and definition |
| **Secondary metrics** | Up to 3 |
| **Guardrail metrics** | Thresholds monitored |
| **Control baseline** | Measured control value during experiment |
| **Variant A result** | Measured variant A value |
| **Relative change** | % change from control to best variant |
| **p-value** | Statistical significance |
| **95% CI** | Confidence interval for effect size |
| **Statistical power achieved** | Was minimum sample size reached? |
| **SRM detected?** | Yes/No; if Yes, describe resolution |
| **Guardrail violations?** | Yes/No; if Yes, describe |
| **Decision** | Ship / Iterate / Abandon / Invalidated |
| **Decision rationale** | Why was this decision made |
| **Winner implementation** | PR link if shipped |
| **Learnings** | What did we learn regardless of outcome? |
| **Follow-up experiments** | Any new experiments triggered by these findings? |
| **Implemented by** | Developer name(s) |
| **PM sign-off** | PM name + date |

---

## 11. Results Communication

### 11.1 Bi-Weekly Experiment Readout

At every second sprint review (bi-weekly), the PM presents a 10-minute experiment readout covering:

1. **Active experiments:** Status, days running, any issues observed
2. **Completed experiments since last readout:** Results, decision, next steps
3. **Upcoming experiments:** Preview of next experiments entering implementation
4. **Cumulative learnings:** Running summary of what has been learned about TwinMOS customers

### 11.2 Readout Format

**For completed experiments:**

> "**EXP-P3-001 (Checkout Flow)** ran for 21 days with 2,400 users in each variant. The one-page checkout achieved 67% completion vs 61% in the multi-step control — a 6 percentage point improvement with 97% statistical confidence (p=0.028). No guardrail violations. **Decision: Ship one-page checkout.** Implementation PR merged in Sprint 18."

**For null results:**

> "**EXP-P3-003 (Price Position)** ran for 21 days. No significant difference in add-to-cart rate (8.1% control vs 8.3% variant, p=0.41). **Decision: Keep current layout (control).** Learning: Price position may not be a major driver in our market mix; other factors (product photos, spec clarity) likely matter more."

### 11.3 Stakeholder Reporting

| Stakeholder | Report frequency | Content |
|---|---|---|
| TwinMOS PM | Bi-weekly (sprint review) | Full experiment readout |
| TwinMOS Marketing | Monthly | Experiments affecting marketing surfaces |
| TwinMOS Leadership | Quarterly | Cumulative A/B testing impact on conversion rate |

---

## 12. Multi-Variate Testing (MVT)

### 12.1 When to Use MVT vs Simple A/B

| Scenario | Recommendation |
|---|---|
| Testing one change at a time | Simple A/B (2 variants) |
| Testing multiple independent variables simultaneously | MVT (up to 5 variants) |
| Testing combinations of changes | Full-factorial MVT (only if very high traffic) |
| Limited traffic (< 500 users/day in target segment) | Simple A/B only |

### 12.2 MVT Considerations

**Sample size multiplies with variants:** A 3-variant test (control + 2 variants) requires ~2x the sample size of a simple A/B test. For TwinMOS's traffic levels, MVT should be used sparingly.

**PostHog supports up to 5 variants** per experiment. For Phase 3, no experiment in the backlog requires more than 3 variants.

**Example MVT use case:** Testing referral banner position with 3 variants:
- Control: Banner in sidebar
- Variant A: Banner in header (persistent)
- Variant B: Dismissible popup on first visit

This is appropriate as all 3 are meaningfully different placements — not just minor variations of the same concept.

### 12.3 Interaction Effects in MVT

If running separate A/B tests on the same page simultaneously (e.g., testing both the hero and the navigation on the homepage), there is a risk of interaction effects — where the combination of variants affects the metric differently than each variant alone.

Policy: **Do not run overlapping MVT experiments on the same page or user flow simultaneously.** See Section 14.

---

## 13. Sample Ratio Mismatch Detection

### 13.1 What is Sample Ratio Mismatch (SRM)?

SRM occurs when the actual traffic split in an experiment significantly deviates from the intended split. For example:
- Intended split: 50% control / 50% variant A
- Actual split after 7 days: 48% control / 52% variant A

SRM indicates a technical problem in the experiment implementation — users are being assigned to variants unevenly, which invalidates all statistical conclusions.

### 13.2 SRM Check Protocol

**Frequency:** Check on Day 1, Day 3, Day 7, and at analysis date.

**Method:**

```python
# SRM chi-square test
# expected_control: expected number of users in control (50% of total)
# actual_control: actual number of users in control
# actual_variant: actual number of users in variant A

import scipy.stats as stats

total = actual_control + actual_variant
expected_control = total * 0.5
expected_variant = total * 0.5

chi2, p_value = stats.chisquare(
  f_obs=[actual_control, actual_variant],
  f_exp=[expected_control, expected_variant]
)

srm_detected = p_value < 0.01  # SRM if p < 0.01
deviation_pct = abs(actual_control - expected_control) / expected_control * 100
```

**Thresholds:**

| Deviation from expected | Action |
|---|---|
| < 2% | Acceptable; likely random variation |
| 2–5% | Flag for investigation; continue experiment |
| > 5% | SRM detected; pause experiment; investigate implementation |
| p-value < 0.01 | SRM detected regardless of percentage |

### 13.3 Common SRM Causes and Fixes

| Cause | Symptoms | Fix |
|---|---|---|
| Caching: control served from CDN cache, variant bypasses cache | Variant gets more traffic than expected | Ensure cache-busting for experiment pages; or run experiment with Cloudflare cache disabled for flag-dependent pages |
| Bot traffic hitting one variant more | Traffic spikes for one variant | Exclude bots via PostHog bot detection or filter by `$device_type = bot` |
| Flag evaluation bug: some users always get control | Control always gets more traffic | Debug feature flag evaluation logic |
| Targeting condition bug | Wrong users included | Audit flag conditions in PostHog |

---

## 14. Interaction Effects and Overlapping Experiments

### 14.1 Overlap Policy

**Default policy: no two experiments should run on the same page or user flow simultaneously.**

Overlapping experiments create interaction effects that make it impossible to attribute a metric change to one experiment vs the other. For example, if EXP-P3-001 (checkout flow) and EXP-P3-002 (cart CTA) run simultaneously, a user in "one-page checkout + Buy Now" is exposed to two changes at once.

### 14.2 Exceptions to No-Overlap Policy

Overlap is permissible only when **segments are mutually exclusive**:

- EXP-P3-001 targets checkout users → EXP-P3-006 targets homepage users: these are different pages, low overlap risk
- An experiment targeting only mobile users and another targeting only desktop users: mutually exclusive segments

**Approval required:** Any exception to the no-overlap policy must be approved by the PM and logged in the experiment log.

### 14.3 Experiment Queue Management

Maximum simultaneous active experiments: **3** (to limit interaction risk).

Priority queue: P0 experiments block lower-priority experiments from launching. EXP-P3-001 must complete before EXP-P3-002 launches on the checkout flow.

---

## 15. Acceptance Criteria

| ID | Criterion | Verified by |
|---|---|---|
| AC-ABTEST-001 | PostHog Experiments feature accessible in PostHog admin at `analytics.twinmos.com` | Dev A |
| AC-ABTEST-002 | EXP-P3-001 (checkout flow) feature flag created, both variants rendering correctly in staging | Dev A + QA |
| AC-ABTEST-003 | EXP-P3-001 flag override working: QA team members can force either variant via PostHog UI | Dev A |
| AC-ABTEST-004 | Primary metric `checkout_completed` firing correctly in both checkout flow variants | Dev B |
| AC-ABTEST-005 | Guardrail metric LCP is tracked via `$web_vitals` PostHog event on checkout pages | Dev B |
| AC-ABTEST-006 | Sample size calculator reviewed and validated against at least one planned experiment | PM |
| AC-ABTEST-007 | Experiment log template created in Notion/Strapi with at least EXP-P3-001 entry populated | PM |
| AC-ABTEST-008 | 14-day minimum run time policy communicated to TwinMOS PM and documented in this spec | PM |
| AC-ABTEST-009 | SRM check process documented and first SRM check scheduled for Day 1 after EXP-P3-001 launch | Dev A |
| AC-ABTEST-010 | Bi-weekly experiment readout format agreed with TwinMOS PM | PM |

---

*Document reference: TWN-P3-ABTEST-2026-001 | Version 1.0 | TwinMOS Technologies*
*This document is confidential and intended for internal use only.*
