# TwinMOS Corporate Website — Sprint Backlog: Phase 3 (Commerce & Advanced Features)

**Document Reference:** TWN-PM-SPRINT-P3-2026-001
**Version:** 1.0
**Date:** 1 May 2026
**Classification:** CONFIDENTIAL — Internal Use Only
**Sprint Duration:** 2 weeks per sprint
**Total Sprints:** 12 sprints (24 weeks)
**Team Capacity:** 2 developers x 80 hours/sprint = 160 hours/sprint

---

## Sprint Overview

| Sprint | Theme | Weeks | Start | End | Capacity |
|--------|-------|-------|-------|-----|----------|
| Sprint 18 | E-Commerce Foundation & Stack Decision | 37–38 | 26 Apr 2027 | 9 May 2027 | 160h |
| Sprint 19 | E-Commerce Schema & Cart | 39–40 | 10 May 2027 | 23 May 2027 | 160h |
| Sprint 20 | Checkout Flow & Customer Accounts | 41–42 | 24 May 2027 | 6 Jun 2027 | 160h |
| Sprint 21 | E-Commerce Hardening & Security | 43–44 | 7 Jun 2027 | 20 Jun 2027 | 160h |
| Sprint 22 | RU / ZH / FR Translation & Import | 45–46 | 21 Jun 2027 | 4 Jul 2027 | 160h |
| Sprint 23 | Advanced Analytics & PostHog | 47–48 | 5 Jul 2027 | 18 Jul 2027 | 160h |
| Sprint 24 | Marketing Automation & CRM | 49–50 | 19 Jul 2027 | 1 Aug 2027 | 160h |
| Sprint 25 | Loyalty Program | 51–52 | 2 Aug 2027 | 15 Aug 2027 | 160h |
| Sprint 26 | Referral & MDF Programs | 53–54 | 16 Aug 2027 | 29 Aug 2027 | 160h |
| Sprint 27 | Localization Launch (RU/ZH/FR) | 55–56 | 30 Aug 2027 | 12 Sep 2027 | 160h |
| Sprint 28 | Stabilization, UAT & Pre-Launch | 57–58 | 13 Sep 2027 | 26 Sep 2027 | 160h |
| Sprint 29 | Phase 3 Launch & Engagement Closeout | 59–60 | 27 Sep 2027 | 10 Oct 2027 | 160h |

---

## Sprint 18: E-Commerce Foundation & Stack Decision (Weeks 37–38)

**Sprint Goal:** E-commerce architecture decision locked; Strapi commerce collections modeled; Medusa.js or Stripe Checkout scaffolded and building.

**Capacity:** 160 hours

| ID | User Story / Task | Priority | Effort (h) | Owner | Acceptance Criteria |
|----|-------------------|----------|------------|-------|---------------------|
| P3-S18-001 | As a team, we have ADR-007 (e-commerce stack) signed off | P0 | 8 | Team Lead | ADR committed; both devs reviewed; TwinMOS PM acknowledged |
| P3-S18-002 | As a developer, I have e-commerce collections modeled in Strapi | P0 | 32 | Senior Dev | Collections created; relationships wired; test data populated |
| P3-S18-003 | As a developer, I have Medusa.js core installed OR Stripe Checkout scaffolded | P0 | 40 | Senior Dev | Medusa server boots OR Stripe SDK integrated; health checks pass |
| P3-S18-004 | As a developer, I have product catalog wired to e-commerce | P0 | 24 | Team Lead | SKU pages show Add to Cart CTA; price syncs from Strapi |
| P3-S18-005 | As a developer, I have local e-commerce stack running in Docker Compose | P0 | 16 | Team Lead | docker-compose up includes commerce service; all services healthy |
| P3-S18-006 | As a PM, I have translation vendor contracts signed for RU / ZH / FR | P1 | 8 | TwinMOS PM | Contracts signed; delivery milestones aligned to Sprint 22 |
| P3-S18-007 | As a team lead, I have e-commerce security checklist drafted | P1 | 8 | Team Lead | Checklist covers PCI-DSS SAQ-A, Stripe fraud rules, rate limiting |
| P3-S18-008 | As a developer, I have Hetzner VPS upgraded to CX42 for e-commerce load | P1 | 8 | Team Lead | CX42 provisioned; services migrated; performance baseline recorded |

**Sprint 18 Definition of Done:**
- [ ] ADR-007 signed and committed
- [ ] Strapi commerce collections modeled and testable
- [ ] Medusa or Stripe scaffolded and building locally
- [ ] SKU pages show Add to Cart CTA
- [ ] Demo to TwinMOS: e-commerce architecture walkthrough + local checkout flow

---

## Sprint 19: E-Commerce Schema & Cart (Weeks 39–40)

**Sprint Goal:** Shopping cart fully functional with add/remove/update; cart persists across sessions; cart UI responsive and accessible.

**Capacity:** 160 hours

| ID | User Story / Task | Priority | Effort (h) | Owner | Acceptance Criteria |
|----|-------------------|----------|------------|-------|---------------------|
| P3-S19-001 | As a shopper, I can add products to cart from SKU detail pages | P0 | 20 | Team Lead | Add to Cart button functional; quantity selector works; toast confirmation |
| P3-S19-002 | As a shopper, I can view my cart with item images, names, quantities, and prices | P0 | 20 | Team Lead | Cart page renders; subtotal calculated; mobile responsive |
| P3-S19-003 | As a shopper, I can update quantities and remove items from cart | P0 | 16 | Team Lead | Quantity +/- works; remove button works; totals recalculate |
| P3-S19-004 | As a shopper, my cart persists when I close and reopen the browser | P0 | 16 | Senior Dev | Cart stored in localStorage + synced to backend if logged in |
| P3-S19-005 | As a shopper, I see cart summary in header with item count badge | P0 | 12 | Team Lead | Badge updates on add/remove; click opens mini-cart drawer |
| P3-S19-006 | As a developer, I have cart state managed with proper hydration | P0 | 16 | Senior Dev | No hydration errors; cart renders correctly on refresh |
| P3-S19-007 | As a shopper, I can apply a promo code at cart level | P1 | 16 | Senior Dev | Promo code validates; discount applied; invalid code shows error |
| P3-S19-008 | As a developer, I have cart abandonment data captured for marketing automation | P1 | 12 | Senior Dev | Abandoned cart events sent to PostHog; retrievable for email campaigns |
| P3-S19-009 | As a shopper, I see estimated shipping cost in cart based on my region | P1 | 12 | Senior Dev | Shipping estimate API called; cost displayed; supports UAE/IN/KSA/BD |

**Sprint 19 Definition of Done:**
- [ ] Add to Cart functional on all SKU pages
- [ ] Cart page with full CRUD operations
- [ ] Cart persists across sessions
- [ ] Header cart badge with mini-cart drawer
- [ ] Demo to TwinMOS: cart journey from product page to cart review

---

## Sprint 20: Checkout Flow & Customer Accounts (Weeks 41–42)

**Sprint Goal:** Complete checkout flow from cart to order confirmation; customer accounts with order history; tax and shipping rules per region.

**Capacity:** 160 hours

| ID | User Story / Task | Priority | Effort (h) | Owner | Acceptance Criteria |
|----|-------------------|----------|------------|-------|---------------------|
| P3-S20-001 | As a shopper, I can enter shipping address with autocomplete and validation | P0 | 20 | Team Lead | Address form validates; autocomplete via geo API; supports all target countries |
| P3-S20-002 | As a shopper, I can select shipping method with cost and ETA | P0 | 16 | Team Lead | Shipping options displayed; selection updates total; ETA shown |
| P3-S20-003 | As a shopper, I can pay via Stripe Checkout with card, Apple Pay, Google Pay | P0 | 32 | Senior Dev | Stripe Checkout session created; payment succeeds; webhook received |
| P3-S20-004 | As a shopper, I see order confirmation page with order number and summary | P0 | 12 | Team Lead | Confirmation page renders; order number prominent; summary accurate |
| P3-S20-005 | As a customer, I can create an account and log in using Better Auth | P0 | 20 | Senior Dev | Registration works; login works; password reset works |
| P3-S20-006 | As a customer, I can view my order history and track current orders | P0 | 16 | Senior Dev | Order history lists all orders; status shown; click for detail |
| P3-S20-007 | As a shopper, tax is calculated correctly per region | P0 | 16 | Senior Dev | Tax rules configured; tax displayed at checkout; calculation accurate |
| P3-S20-008 | As a developer, I have order confirmation and receipt emails sent via Resend | P1 | 12 | Senior Dev | Email template branded; order details included; delivery confirmed |
| P3-S20-009 | As an admin, I can view orders in Strapi admin with status filter and export | P1 | 16 | Senior Dev | Order list in Strapi; filters work; CSV export functional |

**Sprint 20 Definition of Done:**
- [ ] End-to-end checkout flow: cart to address to shipping to payment to confirmation
- [ ] Customer accounts with registration, login, order history
- [ ] Tax and shipping rules active for all target markets
- [ ] Order confirmation emails sent
- [ ] Demo to TwinMOS: complete purchase journey + admin order view

---

## Sprint 21: E-Commerce Hardening & Security (Weeks 43–44)

**Sprint Goal:** E-commerce security pass complete; PCI considerations addressed; fraud rules active; performance optimized for checkout.

**Capacity:** 160 hours

| ID | User Story / Task | Priority | Effort (h) | Owner | Acceptance Criteria |
|----|-------------------|----------|------------|-------|---------------------|
| P3-S21-001 | As a developer, I have implemented rate limiting on all checkout endpoints | P0 | 12 | Senior Dev | Rate limits configured; abuse blocked; legitimate users unaffected |
| P3-S21-002 | As a developer, I have Stripe fraud rules configured | P0 | 16 | Senior Dev | 3DS triggered for suspicious cards; Radar rules active; fraud score logged |
| P3-S21-003 | As a developer, I have PCI scope minimized | P0 | 8 | Team Lead | No card data touches our servers; Stripe Elements handle all card input |
| P3-S21-004 | As a developer, I have checkout performance audited and optimized | P0 | 20 | Team Lead | Lighthouse checkout LCP <= 2.0s; no render-blocking resources |
| P3-S21-005 | As a developer, I have order idempotency keys implemented | P0 | 12 | Senior Dev | Same idempotency key = same order; no duplicate charges in testing |
| P3-S21-006 | As a developer, I have webhook signature verification and retry logic | P0 | 12 | Senior Dev | Stripe webhooks verified; retries handled; failed webhooks alerted |
| P3-S21-007 | As a developer, I have e-commerce error handling and rollback logic | P0 | 16 | Senior Dev | Payment failure rolls back order gracefully; user sees helpful message |
| P3-S21-008 | As a developer, I have checkout flow E2E tests with Playwright | P0 | 20 | Team Lead | 5+ E2E scenarios pass; covers success, decline, timeout, retry |
| P3-S21-009 | As a developer, I have inventory reservation logic | P1 | 16 | Senior Dev | Stock reserved on checkout start; released on timeout or cancel |
| P3-S21-010 | As a developer, I have order lifecycle email templates | P1 | 12 | Senior Dev | Templates in Resend; triggered by status changes; branded |

**Sprint 21 Definition of Done:**
- [ ] Security pass complete: rate limits, fraud rules, PCI scope verified
- [ ] Checkout LCP <= 2.0s
- [ ] E2E tests cover all critical checkout paths
- [ ] Webhook handling robust with verification and retries
- [ ] Demo to TwinMOS: security walkthrough + checkout performance audit

---

## Sprint 22: RU / ZH / FR Translation & Import (Weeks 45–46)

**Sprint Goal:** Russian, Chinese (Simplified), and French translations delivered by vendor and imported into Strapi; locale-specific QA begun.

**Capacity:** 160 hours

| ID | User Story / Task | Priority | Effort (h) | Owner | Acceptance Criteria |
|----|-------------------|----------|------------|-------|---------------------|
| P3-S22-001 | As a PM, I have received first draft translations for RU / ZH / FR from vendor | P0 | 8 | TwinMOS PM | All three locales delivered in XLIFF/JSON format; glossary compliance checked |
| P3-S22-002 | As a developer, I have RU translations imported into Strapi with Cyrillic font support | P0 | 24 | Team Lead | RU content imported; Noto Sans Cyrillic loads; no encoding issues |
| P3-S22-003 | As a developer, I have ZH-CN translations imported into Strapi with CJK font support | P0 | 24 | Team Lead | ZH content imported; Noto Sans SC loads; character rendering correct |
| P3-S22-004 | As a developer, I have FR translations imported into Strapi | P0 | 20 | Team Lead | FR content imported; accents render; locale-specific formatting correct |
| P3-S22-005 | As a developer, I have Astro i18n routing extended to /ru/, /zh-CN/, /fr/ | P0 | 16 | Team Lead | Routes work; language switcher includes new locales; fallback to EN |
| P3-S22-006 | As a developer, I have hreflang tags updated for all 6 live locales | P0 | 8 | Team Lead | All language variants linked correctly; sitemap includes new locales |
| P3-S22-007 | As a developer, I have translation QA checklist for RU / ZH / FR | P1 | 12 | Team Lead | Checklist covers UI truncation, date formats, currency, cultural appropriateness |
| P3-S22-008 | As a PM, I have engaged native-speaker reviewers for RU / ZH / FR | P1 | 8 | TwinMOS PM | Reviewers contracted; review schedule aligned to Sprint 27 |
| P3-S22-009 | As a developer, I have translation memory updated with Phase 3 reusable strings | P1 | 12 | Team Lead | TM file updated; reusable strings identified; vendor can import |

**Sprint 22 Definition of Done:**
- [ ] RU / ZH / FR translations imported and rendering
- [ ] Astro routing extended to all 6 locales
- [ ] hreflang and sitemap updated
- [ ] Native-speaker reviewers engaged
- [ ] Demo to TwinMOS: tri-language preview + routing walkthrough

---

## Sprint 23: Advanced Analytics & PostHog (Weeks 47–48)

**Sprint Goal:** PostHog OSS self-hosted for session replay, feature flags, and A/B testing; advanced analytics dashboards live for Marketing team.

**Capacity:** 160 hours

| ID | User Story / Task | Priority | Effort (h) | Owner | Acceptance Criteria |
|----|-------------------|----------|------------|-------|---------------------|
| P3-S23-001 | As a developer, I have PostHog OSS self-hosted on Hetzner | P0 | 24 | Senior Dev | PostHog accessible; event ingestion working; no data loss |
| P3-S23-002 | As a marketer, I can view session replays of real user journeys | P0 | 16 | Senior Dev | Session replay enabled; replays accessible; privacy masking configured |
| P3-S23-003 | As a marketer, I can create feature flags and target segments | P0 | 16 | Senior Dev | Feature flag UI works; targeting by locale, user type, URL pattern |
| P3-S23-004 | As a marketer, I can run A/B tests on page variants | P0 | 20 | Senior Dev | A/B test configured; variant assignment random; results dashboard visible |
| P3-S23-005 | As a marketer, I have a real-time dashboard showing traffic, conversions, and top pages | P0 | 20 | Team Lead | Dashboard renders; data refreshes; filters by locale and date range |
| P3-S23-006 | As a marketer, I can track e-commerce funnel | P0 | 20 | Senior Dev | Funnel events fire correctly; drop-off rates visible; conversion % accurate |
| P3-S23-007 | As a developer, I have Plausible and PostHog running side-by-side | P1 | 12 | Senior Dev | Both analytics fire; no duplicate events; performance impact minimal |
| P3-S23-008 | As a marketer, I receive automated weekly analytics summary email | P1 | 12 | Team Lead | Email template created; scheduled job running; metrics accurate |

**Sprint 23 Definition of Done:**
- [ ] PostHog OSS live with session replay, feature flags, A/B testing
- [ ] Marketing dashboard with traffic, conversions, funnel
- [ ] E-commerce funnel tracking accurate
- [ ] Plausible + PostHog coexisting without conflict
- [ ] Demo to TwinMOS: analytics dashboard + session replay walkthrough

---

## Sprint 24: Marketing Automation & CRM (Weeks 49–50)

**Sprint Goal:** Marketing automation active: cross-sell banners, exit-intent popup, abandoned cart email, post-purchase automation; HubSpot CRM integration live.

**Capacity:** 160 hours

| ID | User Story / Task | Priority | Effort (h) | Owner | Acceptance Criteria |
|----|-------------------|----------|------------|-------|---------------------|
| P3-S24-001 | As a marketer, I can configure cross-sell banners on product and cart pages | P0 | 20 | Team Lead | Banner CMS-driven; rules by category/brand; impressions tracked |
| P3-S24-002 | As a marketer, I have exit-intent popup capturing emails with offer | P0 | 16 | Team Lead | Popup triggers on exit intent; email captured; offer code delivered |
| P3-S24-003 | As a marketer, abandoned cart emails are sent automatically after 1 hour and 24 hours | P0 | 24 | Senior Dev | Email sequence configured; cart contents included; unsubscribe works |
| P3-S24-004 | As a marketer, post-purchase emails send automatically | P0 | 20 | Senior Dev | Triggered 7 days post-delivery; review link included; products relevant |
| P3-S24-005 | As a sales team member, I have HubSpot CRM integration syncing leads and customers | P0 | 24 | Senior Dev | HubSpot API connected; contacts sync bidirectionally; deal pipeline visible |
| P3-S24-006 | As a marketer, I have advanced reporting dashboards | P0 | 20 | Team Lead | Dashboards render; cohorts accurate; LTV calculated from order history |
| P3-S24-007 | As a marketer, I can segment users by behavior | P1 | 16 | Senior Dev | Segments auto-update; exportable for campaigns; API accessible |
| P3-S24-008 | As a developer, I have marketing automation event pipeline tested and monitored | P1 | 12 | Senior Dev | Events fire correctly; failures alerted; retry logic works |

**Sprint 24 Definition of Done:**
- [ ] Cross-sell banners and exit-intent popup live
- [ ] Abandoned cart email sequence active
- [ ] Post-purchase automation running
- [ ] HubSpot CRM sync operational
- [ ] Advanced reporting dashboards accessible
- [ ] Demo to TwinMOS: marketing automation journey + CRM sync

---

## Sprint 25: Loyalty Program (Weeks 51–52)

**Sprint Goal:** Loyalty program fully operational: points per purchase, tier system, redemption flow; customer-facing dashboard and admin controls.

**Capacity:** 160 hours

| ID | User Story / Task | Priority | Effort (h) | Owner | Acceptance Criteria |
|----|-------------------|----------|------------|-------|---------------------|
| P3-S25-001 | As a customer, I earn points on every purchase | P0 | 20 | Senior Dev | Points calculated at checkout; credited on payment success; visible in account |
| P3-S25-002 | As a customer, I can see my points balance and tier status in my account dashboard | P0 | 16 | Senior Dev | Dashboard shows balance, tier, progress to next tier; updates in real time |
| P3-S25-003 | As a customer, I can redeem points for discounts at checkout | P0 | 24 | Senior Dev | Redemption UI at checkout; discount applied; points deducted correctly |
| P3-S25-004 | As a customer, I receive tier benefits | P0 | 20 | Senior Dev | Tier rules configured; benefits listed; tier changes trigger notification |
| P3-S25-005 | As an admin, I can configure point values, tier thresholds, and benefits in Strapi | P0 | 16 | Senior Dev | Admin UI for loyalty config; changes reflect immediately; audit log |
| P3-S25-006 | As a customer, I receive birthday bonus points | P1 | 12 | Senior Dev | Birthday detected; bonus credited; email notification sent |
| P3-S25-007 | As a marketer, I can run double-points promotions | P1 | 16 | Senior Dev | Promotion rules configurable; multiplier applied; reporting accurate |
| P3-S25-008 | As a developer, I have loyalty program data backed up and integrity checked | P1 | 8 | Senior Dev | Daily backup; integrity constraints; no negative balances possible |

**Sprint 25 Definition of Done:**
- [ ] Points earned on every purchase
- [ ] Customer dashboard shows balance and tier
- [ ] Redemption at checkout functional
- [ ] Tier system with benefits operational
- [ ] Admin controls for program configuration
- [ ] Demo to TwinMOS: loyalty journey from purchase to redemption

---

## Sprint 26: Referral & MDF Programs (Weeks 53–54)

**Sprint Goal:** Referral program with invite-a-friend and discount codes; MDF program for distributors with claim form and approval workflow.

**Capacity:** 160 hours

| ID | User Story / Task | Priority | Effort (h) | Owner | Acceptance Criteria |
|----|-------------------|----------|------------|-------|---------------------|
| P3-S26-001 | As a customer, I can generate a referral link to share with friends | P0 | 16 | Senior Dev | Link generated; unique per customer; shareable via social/copy |
| P3-S26-002 | As a referred friend, I receive a discount code for first purchase | P0 | 16 | Senior Dev | Code generated on signup; validates at checkout; one-time use |
| P3-S26-003 | As a referrer, I receive points credit when my friend makes first purchase | P0 | 16 | Senior Dev | Credit triggered on friend first order; points added to balance |
| P3-S26-004 | As a distributor, I can submit an MDF claim with campaign details and receipts | P0 | 24 | Senior Dev | MDF form captures details; receipt upload; submission stored |
| P3-S26-005 | As an admin, I can review MDF claims and approve/reject with notes | P0 | 20 | Senior Dev | Claim list in Strapi; approve/reject actions; status visible to distributor |
| P3-S26-006 | As a distributor, I receive email notification when my MDF claim is approved/rejected | P0 | 12 | Senior Dev | Email sent on status change; includes admin notes; branded template |
| P3-S26-007 | As a developer, I have referral fraud detection | P1 | 16 | Senior Dev | Self-referrals blocked; duplicate signups detected; fraud log maintained |
| P3-S26-008 | As a PM, I have distributor success stories published as case studies | P1 | 16 | TwinMOS PM | 3+ case studies published; linked from partner portal; approved by distributors |
| P3-S26-009 | As a developer, I have MDF program reporting dashboard | P1 | 12 | Senior Dev | Dashboard shows metrics; filterable by distributor and date; exportable |

**Sprint 26 Definition of Done:**
- [ ] Referral link generation and sharing functional
- [ ] Friend discount and referrer credit working
- [ ] MDF claim submission and approval workflow operational
- [ ] Fraud detection for referrals active
- [ ] Demo to TwinMOS: referral flow + MDF claim journey

---

## Sprint 27: Localization Launch (RU/ZH/FR) (Weeks 55–56)

**Sprint Goal:** Russian, Chinese, and French locales fully live; native-speaker review complete; locale-specific QA passed.

**Capacity:** 160 hours

| ID | User Story / Task | Priority | Effort (h) | Owner | Acceptance Criteria |
|----|-------------------|----------|------------|-------|---------------------|
| P3-S27-001 | As a developer, I have all RU translations reviewed and corrections applied | P0 | 20 | Team Lead | Native reviewer feedback incorporated; no critical errors remain |
| P3-S27-002 | As a developer, I have all ZH translations reviewed and corrections applied | P0 | 20 | Team Lead | Native reviewer feedback incorporated; simplified Chinese verified |
| P3-S27-003 | As a developer, I have all FR translations reviewed and corrections applied | P0 | 16 | Team Lead | Native reviewer feedback incorporated; locale-specific terms correct |
| P3-S27-004 | As a developer, I have locale-specific testing complete | P0 | 24 | Both | All 6 locales tested; no UI truncation; dates/currency localized |
| P3-S27-005 | As a developer, I have SEO metadata localized for RU / ZH / FR | P0 | 16 | Team Lead | Meta tags translated; hreflang correct; social previews verified |
| P3-S27-006 | As a developer, I have sitemap and robots.txt updated for all 6 locales | P0 | 8 | Team Lead | XML sitemap includes all locales; robots.txt allows all; submitted to search engines |
| P3-S27-007 | As a team, we have completed accessibility review for RU / ZH / FR pages | P1 | 16 | Both | axe-core scan clean; screen reader test where applicable |
| P3-S27-008 | As a developer, I have performance verified across all 6 locales | P1 | 16 | Team Lead | Lighthouse run per locale; all >= 90; issues remediated |

**Sprint 27 Definition of Done:**
- [ ] RU / ZH / FR translations reviewed and corrected
- [ ] All 6 locales pass locale-specific QA
- [ ] SEO metadata localized
- [ ] Accessibility and performance gates met
- [ ] Demo to TwinMOS: 6-language site walkthrough

---

## Sprint 28: Stabilization, UAT & Pre-Launch (Weeks 57–58)

**Sprint Goal:** All Phase 3 features stable; UAT with TwinMOS stakeholders complete; pre-launch checklist cleared; go/no-go decision ready.

**Capacity:** 160 hours

| ID | User Story / Task | Priority | Effort (h) | Owner | Acceptance Criteria |
|----|-------------------|----------|------------|-------|---------------------|
| P3-S28-001 | As a developer, I have fixed all P0 and P1 bugs from internal QA | P0 | 32 | Both | Bug tracker shows zero P0/P1; P2 bugs have workaround or fix plan |
| P3-S28-002 | As a team, we have executed full regression test suite | P0 | 24 | Both | Regression test plan executed; all critical paths pass; report committed |
| P3-S28-003 | As a team, we have completed security pass | P0 | 20 | Senior Dev | ZAP scan clean; no critical dependencies; CSP tightened for e-commerce |
| P3-S28-004 | As a team, we have completed performance pass | P0 | 20 | Team Lead | k6 load test passed; response times < 500ms; no errors at target load |
| P3-S28-005 | As a team, we have completed DR drill with RTO <= 4h verified | P0 | 16 | Team Lead | DR plan executed; RTO measured; gaps documented and fixed |
| P3-S28-006 | As a team, we have completed UAT with TwinMOS stakeholders | P0 | 24 | TwinMOS PM + Both devs | UAT checklist complete; sign-offs obtained; critical issues fixed |
| P3-S28-007 | As a team, we have completed e-commerce penetration test | P0 | 16 | TwinMOS PM | Pen-test report received; critical findings fixed; re-test passed |
| P3-S28-008 | As a developer, I have completed runbooks for e-commerce operations | P1 | 16 | Team Lead | Runbooks in /docs/runbooks/; reviewed by both devs; TwinMOS PM acknowledged |

**Sprint 28 Definition of Done:**
- [ ] Zero P0/P1 bugs
- [ ] Full regression suite passed
- [ ] Security and performance gates met
- [ ] DR drill successful
- [ ] UAT complete with sign-offs
- [ ] Pen-test remediated
- [ ] Demo to TwinMOS: go/no-go presentation

---

## Sprint 29: Phase 3 Launch & Engagement Closeout (Weeks 59–60)

**Sprint Goal:** Phase 3 live: e-commerce + 6 locales + advanced features; engagement closeout complete; Phase 4 handoff package delivered.

**Capacity:** 160 hours

| ID | User Story / Task | Priority | Effort (h) | Owner | Acceptance Criteria |
|----|-------------------|----------|------------|-------|---------------------|
| P3-S29-001 | As a team, we have executed Phase 3 launch | P0 | 16 | Both | DNS/config updated; all features live; monitoring active |
| P3-S29-002 | As a team, we have monitored for 72 hours post-launch | P0 | 24 | Both | No critical alerts; metrics within expected range; issues logged and fixed |
| P3-S29-003 | As a team, we have delivered Phase 4 handoff package | P0 | 24 | Team Lead | Package includes: open documentation, Phase 4 backlog, retainer scope, knowledge transfer recording |
| P3-S29-004 | As a team, we have conducted final retrospective with TwinMOS sponsor | P0 | 8 | All | Retro conducted; lessons learned documented; action items assigned |
| P3-S29-005 | As a team, we have completed engagement closeout | P0 | 16 | TwinMOS PM + Team Lead | Invoice submitted; all assets transferred; temporary access revoked; ongoing access documented |
| P3-S29-006 | As a developer, I have archived project repository with final state tagged | P1 | 8 | Team Lead | Tag v1.0.0 created; release notes written; archive stored |
| P3-S29-007 | As a PM, I have received final project documentation index and search aid | P1 | 8 | TwinMOS PM | Document index complete; cross-references verified; search aid functional |
| P3-S29-008 | As a team, we have celebrated project completion | P1 | 4 | All | Team celebration held; recognition shared; relationships maintained |

**Sprint 29 Definition of Done:**
- [ ] Phase 3 live and stable
- [ ] 72-hour post-launch monitoring complete
- [ ] Phase 4 handoff package delivered
- [ ] Final retro conducted
- [ ] Engagement closeout complete
- [ ] Final sign-off from Project Sponsor

---

## Phase 3 Sprint Metrics Summary

| Metric | Target |
|--------|--------|
| Total Sprints | 12 |
| Total Weeks | 24 |
| Total Capacity | 1,920 hours |
| Average Sprint Velocity | 140-160 story points |
| P0 Tasks per Sprint | 6-8 |
| Demo Cadence | Every 2 weeks |
| UAT Windows | Sprint 28 (pre-launch) |
| Phase Gate Reviews | Phase 3 Launch (Sprint 29) |

---

## Phase 3 Risk Considerations

| Risk ID | Risk | Mitigation in Sprint Planning |
|---------|------|------------------------------|
| R-05 | E-commerce scope creep | Stripe Checkout minimizes PCI scope; TaxJar for tax; fraud rules in Sprint 21 |
| R-16 | Budget overrun from e-commerce complexity | ADR-007 locks scope; weekly budget check; change request process enforced |
| R-20 | Translation vendor delay for RU/ZH/FR | Contracts signed Sprint 18; staged delivery; English fallback always available |
| R-21 | PostHog self-hosting complexity | Cloud option as fallback; provisioned early (Sprint 23) with buffer |
| R-22 | Loyalty program complexity | Start simple (points + 4 tiers); defer gamification to Phase 4 |

---

## Dependencies from Previous Phases

| Dependency | Source | Impact if Missing |
|------------|--------|-------------------|
| Better Auth from Phase 2 | Sprint 10 | Customer accounts in Sprint 20 blocked |
| Partner Portal from Phase 2 | Sprint 10 | MDF program in Sprint 26 blocked |
| Strapi i18n from Phase 2 | Sprint 10 | RU/ZH/FR translations in Sprint 22 blocked |
| Stripe/Medusa decision | Sprint 18 | All e-commerce sprints blocked |
| Translation vendor delivery | Sprint 18 | Sprint 22 import blocked |

---

*This Sprint Backlog is a living document. Changes require written approval per the Change Request Process and must be logged in the Decision Log.*
