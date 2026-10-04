# TwinMOS Technologies — Phase 3 Launch Readiness Checklist

| Field | Value |
|---|---|
| Document Reference | TWN-P3-LAUNCH-2026-001 |
| Version | 1.0 |
| Phase | Phase 3 — Commerce and Advanced Features |
| Status | Pre-Launch — Active |
| Author | TwinMOS Web Development Team |
| Date | 2026-05-01 |
| Confidentiality | Internal — TwinMOS Technologies |
| Target Launch Date | Month 15 (per project schedule) |

---

## Purpose

This checklist is the **Go/No-Go decision gate** for Phase 3 launch. It must be completed by the designated owner for each item before the launch meeting.

**Completion rules:**
- `[ ]` = Not yet verified — must be resolved before launch
- `[✅]` = PASS — item verified and meets criteria
- `[⚠️]` = WAIVED — item cannot be completed for valid reason; document the reason inline; PM and Project Sponsor must sign off on any waiver
- `[❌]` = FAIL — item has failed verification; **any single [❌] FAIL item blocks launch**

**Waiver format:** `[⚠️ WAIVED: reason — approved by: name, date]`

---

## Sign-Off Table

This sign-off table must be completed before the Go/No-Go call. All signatories must physically or digitally sign before launch is authorized.

| Role | Name | Signature | Date |
|---|---|---|---|
| Project Sponsor | Mohd Mazharul Islam (Chairman, TwinMOS) | ___________________ | __________ |
| Operational Sponsor | TwinMOS Operations Director | ___________________ | __________ |
| IT Lead | Lead Developer (Dev A) | ___________________ | __________ |
| Marketing Director | TwinMOS Marketing Director | ___________________ | __________ |
| Legal / Compliance | TwinMOS Legal Counsel | ___________________ | __________ |

---

## Owner Legend

| Code | Role |
|---|---|
| Dev A | Senior Developer / Infrastructure Lead |
| Dev B | Frontend Developer / QA Lead |
| TW-PM | TwinMOS Project Manager |
| TW-MKT | TwinMOS Marketing Director |
| TW-FIN | TwinMOS Finance Director |
| TW-LEG | TwinMOS Legal Counsel |
| TW-OPS | TwinMOS Operations Manager |

---

## Section 1: E-Commerce Functional Verification

> Owner: Dev A + Dev B | Reviewed by: TW-PM + TW-FIN

### 1.1 Product Catalog

- [ ] Product catalog synced from Strapi to Medusa — all active SKUs present (verify count matches between Strapi and Medusa admin) | **Owner: Dev A**
- [ ] Prices correct in all 5 currencies (AED, INR, BDT, SAR, USD) — Finance team verifies at least 10 products per currency against approved price list | **Owner: TW-FIN**
- [ ] Product images loading correctly for all SKUs (no broken images in Medusa-generated product pages) | **Owner: Dev B**
- [ ] Product stock levels displaying correctly (in stock / low stock / out of stock) | **Owner: Dev A**
- [ ] Product categories and filters working correctly on collection pages | **Owner: Dev B**

### 1.2 Cart Functionality

- [ ] Add to cart working for all product types: DDR5 RAM modules, DDR4 RAM modules, Gen5 NVMe SSD, Gen4 NVMe SSD, SATA SSD, portable SSD, USB flash drives | **Owner: Dev B**
- [ ] Cart quantity increment/decrement working correctly | **Owner: Dev B**
- [ ] Cart item removal working | **Owner: Dev B**
- [ ] Cart persistence: items remain in cart after browser tab close and reopen | **Owner: Dev B**
- [ ] Cart merge on login: guest cart merges with account cart correctly (items from both retained) | **Owner: Dev A**
- [ ] Cart badge (Astro Server Island) updating in real-time without full page reload | **Owner: Dev A**
- [ ] Cart badge load time ≤ 500ms (measured via browser DevTools Network tab) | **Owner: Dev A**
- [ ] Cart page displaying correct item subtotals and total in user's selected currency | **Owner: Dev B**
- [ ] Empty cart state displays correctly with "Continue Shopping" CTA | **Owner: Dev B**

### 1.3 Checkout Flow

- [ ] Guest checkout flow functional end-to-end: Step 1 (Contact) → Step 2 (Shipping) → Step 3 (Payment) → Step 4 (Confirmation) | **Owner: Dev B**
- [ ] Registered user checkout: pre-filled email and saved address populating correctly | **Owner: Dev B**
- [ ] Shipping options displaying correctly per region:
  - [ ] UAE: standard and express options with correct fees | **Owner: Dev A**
  - [ ] India: shipping options with INR pricing | **Owner: Dev A**
  - [ ] Bangladesh: shipping options with BDT pricing | **Owner: Dev A**
  - [ ] KSA: shipping options with SAR pricing | **Owner: Dev A**
  - [ ] International: DHL/FedEx international options | **Owner: Dev A**
- [ ] Free shipping threshold calculation correct (threshold varies by region and currency) | **Owner: Dev A + TW-FIN**
- [ ] Shipping address validation working (postal code format validation by country) | **Owner: Dev B**
- [ ] Order review step showing correct summary before payment | **Owner: Dev B**

### 1.4 Discounts and Promotions

- [ ] Coupon/discount code application working at checkout Step 3 | **Owner: Dev B**
- [ ] 5 test codes verified: (a) percentage discount, (b) fixed amount discount, (c) free shipping, (d) expired code rejected, (e) already-used single-use code rejected | **Owner: Dev B + TW-PM**
- [ ] Discount displayed correctly in cart and order total | **Owner: Dev B**
- [ ] Loyalty points redemption working at checkout: points balance shown, partial and full redemption options | **Owner: Dev A**
- [ ] Loyalty points + discount code can be combined correctly (verify order of application in Medusa) | **Owner: Dev A**

### 1.5 Payment Processing

- [ ] Stripe Checkout redirect working in all supported regions (test from UAE, India, Bangladesh, KSA, International IP) | **Owner: Dev A**
- [ ] Payment with test cards successful:
  - [ ] Visa test card (4242 4242 4242 4242) | **Owner: Dev B**
  - [ ] Mastercard test card (5555 5555 5555 4444) | **Owner: Dev B**
  - [ ] Apple Pay (test environment) | **Owner: Dev B**
  - [ ] 3D Secure test card (4000 0025 0000 3155) — correct 3DS challenge flow | **Owner: Dev B**
- [ ] Payment failure handling: declined card (4000 0000 0000 9995) → correct error message → retry option | **Owner: Dev B**
- [ ] Insufficient funds error handled gracefully | **Owner: Dev B**
- [ ] Stripe webhook receiving events from Stripe and processing correctly | **Owner: Dev A**
- [ ] Stripe is switched to **live mode** (not test mode) for production launch | **Owner: Dev A + TW-FIN**

### 1.6 Order Processing

- [ ] Order confirmation email received within 5 minutes of order placement (via Resend) | **Owner: Dev A**
- [ ] Order confirmation contains: order number, itemized list, totals, shipping address, VAT/GST invoice attachment | **Owner: Dev A**
- [ ] Tax calculation verified for all regions:
  - [ ] UAE: 5% VAT applied correctly | **Owner: TW-FIN**
  - [ ] India: 18% GST applied correctly (or rate per product category) | **Owner: TW-FIN**
  - [ ] KSA: 15% VAT applied correctly | **Owner: TW-FIN**
  - [ ] Bangladesh: applicable tax rate | **Owner: TW-FIN**
  - [ ] International: correct handling (0% or destination-based as configured) | **Owner: TW-FIN**
- [ ] Tax displayed correctly (inclusive vs exclusive per region, as configured in Medusa) | **Owner: TW-FIN + Dev A**
- [ ] VAT/GST invoice generated with correct tax registration numbers:
  - [ ] UAE TRN number correct | **Owner: TW-FIN**
  - [ ] India GSTIN correct | **Owner: TW-FIN**
  - [ ] KSA VAT registration number correct | **Owner: TW-FIN**
- [ ] Order tracking page accessible at `/account/orders/[id]` (for logged-in users) | **Owner: Dev B**
- [ ] Guest order tracking accessible at `/orders/track` (with order ID + email) | **Owner: Dev B**
- [ ] Order status updates (placed → fulfilled → delivered) triggering correct emails | **Owner: Dev A**
- [ ] Refund/cancellation process working in Medusa admin (test with one order) | **Owner: Dev A + TW-OPS**

---

## Section 2: Customer Account Verification

> Owner: Dev A + Dev B | Reviewed by: TW-PM + TW-LEG

### 2.1 Registration and Authentication

- [ ] Registration flow complete: form validates correctly, email verification link sent via Resend | **Owner: Dev B**
- [ ] Email verification link works and activates account | **Owner: Dev B**
- [ ] Registration with existing email shows appropriate error (no account enumeration attack) | **Owner: Dev B**
- [ ] Login with correct credentials works | **Owner: Dev B**
- [ ] Login with incorrect credentials: appropriate error message (no specific "email not found" vs "wrong password" distinction) | **Owner: Dev B**
- [ ] Logout clears session cookie and redirects to homepage | **Owner: Dev B**
- [ ] Password reset via email: reset link sent within 5 minutes, link expires after 1 hour | **Owner: Dev B**
- [ ] Password reset link is single-use (second click fails) | **Owner: Dev A**

### 2.2 Profile Management

- [ ] Profile editing (name, phone, preferred currency) saves correctly | **Owner: Dev B**
- [ ] Profile updates reflected immediately in UI without page reload | **Owner: Dev B**
- [ ] Address book: add new address working | **Owner: Dev B**
- [ ] Address book: edit existing address working | **Owner: Dev B**
- [ ] Address book: delete address working (cannot delete address on active order) | **Owner: Dev B**
- [ ] Set default address working (reflected at checkout) | **Owner: Dev B**
- [ ] Multiple saved addresses displayed correctly (max 10 per account) | **Owner: Dev B**

### 2.3 Account History

- [ ] Order history visible at `/account/orders` and accurate (all orders for this account shown) | **Owner: Dev B**
- [ ] Order detail page `/account/orders/[id]` showing correct line items, status, tracking | **Owner: Dev B**
- [ ] Order invoice download working (PDF download link on order detail page) | **Owner: Dev A**

### 2.4 GDPR Compliance Features

- [ ] Data download (GDPR Art. 20): "Download my data" produces correct JSON export containing account data, order history, loyalty balance | **Owner: Dev A**
- [ ] Data export available within 30 minutes of request (automated) | **Owner: Dev A**
- [ ] Account deletion (GDPR Art. 17): "Delete my account" flow anonymizes: name, email, phone, address replaced with anonymized values; order records retained with anonymized customer for legal/tax purposes | **Owner: Dev A + TW-LEG**
- [ ] Deleted account cannot be logged into | **Owner: Dev A**
- [ ] HubSpot contact deleted/anonymized within 24 hours of account deletion (automated webhook) | **Owner: Dev A**

### 2.5 Session Security

- [ ] Session timeout after 30 minutes of idle (user prompted to re-authenticate) | **Owner: Dev A**
- [ ] Session cookie flags: `HttpOnly=true`, `Secure=true`, `SameSite=Strict` (verify in browser DevTools → Application → Cookies) | **Owner: Dev A**
- [ ] Concurrent sessions handled correctly (login from new device does not invalidate existing sessions unless explicitly signed out) | **Owner: Dev A**
- [ ] "Sign out of all devices" feature working | **Owner: Dev A**

---

## Section 3: Loyalty Program Verification

> Owner: Dev A | Reviewed by: TW-MKT + TW-PM

- [ ] Loyalty account created automatically upon user registration (verify in Medusa loyalty admin) | **Owner: Dev A**
- [ ] Points earned correctly on order completion — formula verified:
  - [ ] Bronze tier: 1 point per AED 1 spent | **Owner: Dev A + TW-MKT**
  - [ ] Silver tier: 1.25 points per AED 1 spent | **Owner: Dev A + TW-MKT**
  - [ ] Gold tier: 1.5 points per AED 1 spent | **Owner: Dev A + TW-MKT**
- [ ] Points balance updated within 5 minutes of order completion (not waiting for manual approval) | **Owner: Dev A**
- [ ] Tier calculation correct upon order completion:
  - [ ] Bronze → Silver threshold (e.g., 2,000 points): correctly triggers upgrade | **Owner: Dev A + TW-MKT**
  - [ ] Silver → Gold threshold (e.g., 5,000 points): correctly triggers upgrade | **Owner: Dev A + TW-MKT**
- [ ] Tier upgrade email sent via Resend immediately when tier changes (test end-to-end) | **Owner: Dev A**
- [ ] Points redemption at checkout:
  - [ ] Points balance displayed correctly at checkout Step 3 | **Owner: Dev B**
  - [ ] User can select how many points to redeem (partial redemption) | **Owner: Dev B**
  - [ ] Points value deducted from order total correctly (100 points = AED 1, or as defined) | **Owner: Dev A + TW-MKT**
  - [ ] Order confirmation shows points redeemed | **Owner: Dev B**
  - [ ] Points balance reduced after order confirmation (not after checkout start) | **Owner: Dev A**
- [ ] Points history accurate on `/account/loyalty` (all earning and redemption events listed with dates and amounts) | **Owner: Dev B**
- [ ] Admin: manual points adjustment working in Medusa admin (add/deduct) with audit log entry | **Owner: Dev A + TW-OPS**
- [ ] Points expiry configured: points expire 12 months after earning date | **Owner: Dev A**
- [ ] Points expiry warning emails configured in Resend and tested (30-day and 7-day warnings) | **Owner: Dev A**
- [ ] Loyalty program page `/account/loyalty` displaying: current tier, points balance, tier progress bar, points history, available rewards | **Owner: Dev B**

---

## Section 4: Referral Program Verification

> Owner: Dev A + Dev B | Reviewed by: TW-MKT + TW-PM

- [ ] Unique referral link generated for each registered user at `/account/referrals` | **Owner: Dev A**
- [ ] Referral code format: 8-character alphanumeric, unique per user (verified no collisions in test data) | **Owner: Dev A**
- [ ] Referral attribution cookie set when visitor arrives via referral link: cookie name `twinmos_ref`, 30-day expiry, `SameSite=Lax` | **Owner: Dev A**
- [ ] Referral attribution survives: page navigation, cart actions, registration (cookie persists through registration flow) | **Owner: Dev B**
- [ ] Referee discount (10%) applied automatically at first checkout when referral cookie is present | **Owner: Dev A**
- [ ] Referee discount displayed clearly in cart and checkout | **Owner: Dev B**
- [ ] Referrer 200 points credited to referrer's account after referee's **first** order is confirmed | **Owner: Dev A**
- [ ] Referrer receives notification email via Resend immediately on referee's first order | **Owner: Dev A**
- [ ] Self-referral detection working: user using their own referral code receives error message; no discount applied; no points credited | **Owner: Dev A**
- [ ] Referral stats visible on `/account/referrals`: links shared, registrations, conversions, points earned via referrals | **Owner: Dev B**
- [ ] Social sharing buttons working:
  - [ ] WhatsApp share button opens correct WhatsApp URL with pre-filled message | **Owner: Dev B**
  - [ ] Email share button opens email client with pre-filled subject and body | **Owner: Dev B**
  - [ ] Twitter/X share button opens correct Twitter intent URL | **Owner: Dev B**
- [ ] Copy referral link button copies correct URL to clipboard | **Owner: Dev B**
- [ ] Referral link contains UTM parameters for PostHog tracking (`utm_source=referral&utm_medium=user&utm_campaign=refer-earn`) | **Owner: Dev A**

---

## Section 5: MDF Program Verification (Partner Portal)

> Owner: Dev A + Dev B | Reviewed by: TW-MKT + TW-PM

- [ ] MDF portal accessible at `/partner/mdf` for authenticated partner accounts only (non-partner redirect to `/partner/apply`) | **Owner: Dev A**
- [ ] Non-authenticated access to `/partner/mdf` redirects to login page | **Owner: Dev A**
- [ ] Partner account type flag (`is_partner = true`) enforced via middleware | **Owner: Dev A**
- [ ] Budget overview showing correct MDF allocation per partner (pulled from Strapi MDF data) | **Owner: Dev B + TW-MKT**
- [ ] Pre-approval form:
  - [ ] Form fields: campaign name, description, budget requested, campaign dates, target market, expected reach | **Owner: Dev B**
  - [ ] Form submission saves to Strapi and sends email notification to TwinMOS Marketing | **Owner: Dev A**
  - [ ] Confirmation shown to partner after submission | **Owner: Dev B**
- [ ] Document upload working: PDF and image uploads (max 10MB per file) to Backblaze B2 | **Owner: Dev A**
- [ ] Uploaded documents accessible only to the submitting partner and TwinMOS admin | **Owner: Dev A**
- [ ] TwinMOS admin (TW-MKT) receives email notification within 10 minutes of new MDF claim submission | **Owner: Dev A**
- [ ] Approval workflow:
  - [ ] TwinMOS admin can approve/reject claims in Strapi | **Owner: Dev A + TW-MKT**
  - [ ] Partner receives email notification of approval or rejection with reason | **Owner: Dev A**
- [ ] Post-claim submission: partner can submit proof of execution (documents, receipts) after campaign completion | **Owner: Dev B**
- [ ] Claim history and status tracking accurate in partner portal (`/partner/mdf/claims`) | **Owner: Dev B**

---

## Section 6: Analytics and Tracking Verification

> Owner: Dev A + Dev B | Reviewed by: TW-MKT + TW-PM

### 6.1 PostHog

- [ ] PostHog initialized correctly and accessible at `https://analytics.twinmos.com` | **Owner: Dev A**
- [ ] PostHog health check endpoint `/_health` returns `{"status": "ok"}` | **Owner: Dev A**
- [ ] PostHog does **not** initialize before analytics consent is granted by cookie banner (verify: open browser in private mode, no PostHog network requests until consent click) | **Owner: Dev B**
- [ ] All 25+ custom events firing correctly — verified in PostHog Live Events dashboard:
  - [ ] `product_viewed` | **Owner: Dev B**
  - [ ] `product_added_to_cart` | **Owner: Dev B**
  - [ ] `checkout_started` | **Owner: Dev B**
  - [ ] `checkout_step_completed` (all 4 steps) | **Owner: Dev B**
  - [ ] `checkout_completed` | **Owner: Dev A**
  - [ ] `checkout_abandoned` | **Owner: Dev A**
  - [ ] `payment_succeeded` | **Owner: Dev A**
  - [ ] `account_registered` | **Owner: Dev B**
  - [ ] `loyalty_points_earned` | **Owner: Dev A**
  - [ ] `loyalty_tier_upgraded` | **Owner: Dev A**
  - [ ] `referral_link_copied` | **Owner: Dev B**
  - [ ] `warranty_registered` | **Owner: Dev B**
  - [ ] `newsletter_subscribed` | **Owner: Dev B**
  - [ ] `contact_form_submitted` | **Owner: Dev B**
- [ ] Session replay running for sample authenticated sessions — verify 3 recordings visible in PostHog Recordings tab | **Owner: Dev A**
- [ ] No PII visible in session replays: input fields masked, checkout fields not captured | **Owner: Dev B + TW-LEG**
- [ ] PostHog funnel analysis configured: e-commerce funnel (product_viewed → checkout_completed) showing data from test sessions | **Owner: Dev A**
- [ ] A/B test framework (PostHog Experiments): smoke test experiment EXP-P3-001 created and feature flag evaluating correctly | **Owner: Dev A**
- [ ] UptimeRobot monitoring alert active for PostHog health endpoint | **Owner: Dev A**

### 6.2 Google Analytics 4

- [ ] GA4 events matching PostHog for key e-commerce events — cross-validate with test purchase:
  - [ ] `add_to_cart` event in GA4 | **Owner: Dev B**
  - [ ] `begin_checkout` event in GA4 | **Owner: Dev B**
  - [ ] `purchase` event in GA4 with correct revenue value | **Owner: Dev A**
- [ ] GA4 event data appearing in GA4 Realtime report within 30 seconds of action | **Owner: TW-MKT**
- [ ] Google Tag Manager container published with Phase 3 tags | **Owner: Dev A + TW-MKT**
- [ ] E-commerce tracking configured in GA4 (purchase event with item-level data) | **Owner: Dev A**

### 6.3 HubSpot Tracking

- [ ] HubSpot contacts created for all test form submissions (contact form, newsletter, distributor enquiry) | **Owner: Dev A**
- [ ] HubSpot tracking pixel (or API integration) creating contacts correctly | **Owner: Dev A**
- [ ] Abandoned cart workflow triggering after 1-hour inactivity — test with real email address: cart items + leave checkout at Step 1 + wait 65 minutes | **Owner: Dev B + TW-MKT**
- [ ] Welcome email series triggered correctly on registration (test with new account) | **Owner: Dev B**
- [ ] All Resend transactional email templates rendering correctly tested in:
  - [ ] Gmail (web) | **Owner: TW-MKT**
  - [ ] Outlook 2019+ | **Owner: TW-MKT**
  - [ ] Apple Mail (macOS) | **Owner: TW-MKT**
  - [ ] Gmail (Android) | **Owner: TW-MKT**
  - [ ] Apple Mail (iOS) | **Owner: TW-MKT**

---

## Section 7: New Locales (RU / ZH-CN / FR) Verification

> Owner: Dev B | Reviewed by: TW-MKT + TW-PM

- [ ] Russian locale (`/ru/`) accessible — homepage, navigation, and at least 5 representative pages loading with Russian text | **Owner: Dev B**
- [ ] Russian Cyrillic script rendering correctly (no character encoding issues, correct font rendering) | **Owner: Dev B**
- [ ] Chinese Simplified locale (`/zh-CN/`) pages accessible — Han script rendering correctly | **Owner: Dev B**
- [ ] French locale (`/fr/`) pages accessible — accent characters rendering correctly | **Owner: Dev B**
- [ ] `hreflang` tags updated in sitemap.xml for all 7 locales (en, ar, ru, zh-CN, fr, plus existing locales) | **Owner: Dev A**
- [ ] `hreflang` tags verified using Google Search Console or Screaming Frog (no errors) | **Owner: Dev A + TW-MKT**
- [ ] Language selector showing RU, ZH-CN, FR as selectable active options | **Owner: Dev B**
- [ ] Language switch from any locale to RU/ZH-CN/FR working correctly (URL changes, content switches) | **Owner: Dev B**
- [ ] Product pages for all active SKUs have translations in all 3 new locales (verify in Strapi) | **Owner: TW-MKT**
- [ ] E-commerce checkout available in new locales — all form labels, error messages, and CTA buttons translated:
  - [ ] Russian checkout | **Owner: Dev B + TW-MKT**
  - [ ] Chinese Simplified checkout | **Owner: Dev B + TW-MKT**
  - [ ] French checkout | **Owner: Dev B + TW-MKT**
- [ ] Order confirmation email in correct locale when order placed from RU/ZH-CN/FR session | **Owner: Dev A**
- [ ] RTL layout unaffected by new locale additions (Arabic RTL still correct) | **Owner: Dev B**

---

## Section 8: Performance Verification

> Owner: Dev A + Dev B | Reviewed by: TW-PM

- [ ] Lighthouse Performance score ≥ 90 on all Phase 3 pages:
  - [ ] Product detail page (desktop and mobile) | **Owner: Dev B**
  - [ ] Cart page (desktop and mobile) | **Owner: Dev B**
  - [ ] Checkout page (desktop and mobile) | **Owner: Dev B**
  - [ ] Account dashboard (desktop and mobile) | **Owner: Dev B**
  - [ ] Loyalty page (desktop and mobile) | **Owner: Dev B**
- [ ] Checkout page LCP ≤ 2.5 seconds measured on real network (not throttled) — use WebPageTest from UAE, India locations | **Owner: Dev A**
- [ ] PostHog script not blocking page load (loaded async/deferred — verify in Lighthouse "Remove render-blocking resources" check) | **Owner: Dev B**
- [ ] Cart badge (Astro Server Island) load time ≤ 500ms (median across 10 requests, measured in browser DevTools) | **Owner: Dev A**
- [ ] No JavaScript errors in browser console on key flows (test in Chrome, Firefox, Safari):
  - [ ] Product browse → add to cart → checkout | **Owner: Dev B**
  - [ ] Account registration → login → profile edit | **Owner: Dev B**
  - [ ] Loyalty points redemption at checkout | **Owner: Dev B**
- [ ] k6 load test: 1,000 concurrent users simulating checkout flow — error rate < 1%, p95 response time < 3 seconds | **Owner: Dev A**

```bash
# k6 load test command (run from local or Hetzner)
k6 run --vus 1000 --duration 5m scripts/k6-checkout-load-test.js
```

- [ ] k6 results documented and shared with TW-PM | **Owner: Dev A**
- [ ] Core Web Vitals (LCP, INP, CLS) all "Good" (green) on Google Search Console for Phase 3 URL patterns | **Owner: Dev A + TW-MKT**

---

## Section 9: Security Verification

> Owner: Dev A | Reviewed by: TW-PM + TW-LEG

- [ ] Phase 3 penetration test completed (scope: e-commerce checkout, payment flow, account management, loyalty program, MDF portal) | **Owner: Dev A + external pen tester**
- [ ] Pen test report received and reviewed by Dev A + TW-PM | **Owner: Dev A + TW-PM**
- [ ] All pen test **critical** severity findings remediated and verified | **Owner: Dev A**
- [ ] All pen test **high** severity findings remediated and verified | **Owner: Dev A**
- [ ] Medium and low severity findings documented with remediation timeline | **Owner: Dev A**
- [ ] OWASP ZAP automated scan clean on checkout and account endpoints (no critical/high alerts) | **Owner: Dev A**

**Payment Security:**
- [ ] Stripe webhook signature verification (`stripe-signature` header) implemented and tested (replay attack rejected) | **Owner: Dev A**
- [ ] Stripe is in **live mode** with live API keys loaded from environment variables (not hardcoded) | **Owner: Dev A**
- [ ] Stripe account approved by Stripe for live payments (verification complete, not pending) | **Owner: TW-FIN**

**Rate Limiting:**
- [ ] Rate limiting active on checkout initiation endpoint: maximum 5 checkout starts per IP per minute | **Owner: Dev A**
- [ ] Rate limiting active on authentication endpoints: maximum 5 login attempts per IP per 15 minutes | **Owner: Dev A**
- [ ] Rate limiting active on contact form: maximum 3 submissions per IP per hour | **Owner: Dev A**

**Sensitive Data:**
- [ ] No sensitive data (card numbers, passwords, full PII) in application logs (audit Medusa and Strapi logs) | **Owner: Dev A**
- [ ] PostHog session replays: confirm no card numbers or passwords visible (test using actual checkout flow) | **Owner: Dev B + TW-LEG**
- [ ] Environment variables for Stripe, PostHog, HubSpot, Resend stored in Cloudflare Pages secrets (not in repository) | **Owner: Dev A**

**PCI DSS:**
- [ ] PCI DSS SAQ A self-assessment completed (TwinMOS uses Stripe Checkout — SAQ A applicability confirmed) | **Owner: TW-FIN**
- [ ] SAQ A signed by TwinMOS Finance Director | **Owner: TW-FIN**

**Cloudflare:**
- [ ] Cloudflare WAF rules reviewed and updated for e-commerce endpoints (checkout, account, payment) | **Owner: Dev A**
- [ ] Cloudflare Bot Management configured to block malicious bots on checkout endpoints | **Owner: Dev A**
- [ ] Cloudflare DDoS protection active (enabled by default; confirm zone settings) | **Owner: Dev A**

---

## Section 10: Legal and Compliance Verification

> Owner: TW-LEG + TW-FIN | Reviewed by: TW-PM

### 10.1 Legal Pages

- [ ] Terms of Sale page live at `/legal/terms-of-sale` and linked from:
  - [ ] Checkout Step 4 (Review) — user must acknowledge before placing order | **Owner: Dev B + TW-LEG**
  - [ ] Footer navigation | **Owner: Dev B**
- [ ] Privacy Policy updated to include: e-commerce data processing (Medusa), PostHog analytics, HubSpot CRM, Resend email, Stripe payment processing | **Owner: TW-LEG**
- [ ] Cookie Policy updated to include: PostHog analytics cookie, HubSpot tracking, marketing automation cookies | **Owner: TW-LEG**
- [ ] Loyalty Program Terms and Conditions page live at `/legal/loyalty-terms` and linked from loyalty program UI | **Owner: TW-LEG + Dev B**
- [ ] Referral Program Terms page live at `/legal/referral-terms` and linked from referral program UI | **Owner: TW-LEG + Dev B**
- [ ] All legal pages reviewed and approved by TW-LEG | **Owner: TW-LEG**

### 10.2 Consent and GDPR

- [ ] GDPR consent for marketing email: required and enforced — no marketing emails sent without `marketing_consent = true` (test with unconsenting test contact) | **Owner: Dev A + TW-LEG**
- [ ] Cookie consent banner compliant with:
  - [ ] GDPR (EU) — consent before analytics cookies set | **Owner: Dev B + TW-LEG**
  - [ ] UAE PDPL — equivalent consent mechanism | **Owner: TW-LEG**
  - [ ] India DPDP — consent captured and logged | **Owner: TW-LEG**
- [ ] Cookie banner correctly categorizes cookies: necessary / analytics / marketing | **Owner: Dev B**
- [ ] "Reject All" option available and functional in cookie banner | **Owner: Dev B**

### 10.3 Tax and Financial Compliance

- [ ] VAT registration number displayed on invoices: UAE TRN number correct and formatted correctly | **Owner: TW-FIN**
- [ ] India GSTIN correct and formatted correctly on invoices | **Owner: TW-FIN**
- [ ] KSA VAT number correct | **Owner: TW-FIN**
- [ ] 7-year order data retention policy configured (Medusa data not deleted before 7 years) | **Owner: Dev A + TW-FIN**
- [ ] Tax-inclusive vs tax-exclusive display verified per region (UAE: inclusive is common practice; India: exclusive) | **Owner: TW-FIN + Dev B**

### 10.4 Data Subject Rights

- [ ] Right to erasure tested: complete test with dummy account — account deleted, PII anonymized in Medusa, contact deleted in HubSpot, person deleted in PostHog | **Owner: Dev A + TW-LEG**
- [ ] Deletion process documented in operations runbook | **Owner: Dev A**
- [ ] Privacy contact email (privacy@twinmos.com) active and monitored | **Owner: TW-OPS**

---

## Section 11: Operations Verification

> Owner: TW-OPS + TW-MKT | Reviewed by: TW-PM

### 11.1 Admin Access and Training

- [ ] Medusa admin panel accessible to TwinMOS Operations team — user accounts created with appropriate roles | **Owner: Dev A + TW-OPS**
- [ ] Strapi admin accessible to TwinMOS content team — user accounts and permissions configured | **Owner: Dev A + TW-OPS**
- [ ] HubSpot user access configured for TwinMOS Marketing team (appropriate license roles) | **Owner: TW-MKT**
- [ ] PostHog admin access configured for Dev team and TW-PM | **Owner: Dev A**

### 11.2 Training Completion

- [ ] Order management training completed: TwinMOS Operations team can process, fulfill, and cancel orders in Medusa admin | **Owner: TW-OPS (sign-off)**
- [ ] Customer service training: team can find customer orders, check loyalty balance, process refunds | **Owner: TW-OPS (sign-off)**
- [ ] MDF admin training completed: TwinMOS Marketing can review, approve, and reject MDF claims in Strapi | **Owner: TW-MKT (sign-off)**
- [ ] Loyalty admin training: TwinMOS Marketing can make manual point adjustments in Medusa admin with audit log | **Owner: TW-MKT (sign-off)**
- [ ] HubSpot CRM training: Marketing team can manage contacts, lists, and review workflow performance | **Owner: TW-MKT (sign-off)**

### 11.3 Operational Runbooks

All runbooks must be documented and reviewed by the responsible team before launch:

- [ ] Runbook: Order fulfillment process (receive order in Medusa → fulfill → print shipping label → mark shipped → tracking number entry) | **Owner: TW-OPS (reviewed)**
- [ ] Runbook: Refund and cancellation process (full and partial refunds in Medusa, Stripe refund flow) | **Owner: TW-OPS (reviewed)**
- [ ] Runbook: MDF claim review process (review submission → verify documents → approve/reject in Strapi) | **Owner: TW-MKT (reviewed)**
- [ ] Runbook: Customer loyalty manual adjustment (when and how to add/deduct points with audit trail) | **Owner: TW-OPS (reviewed)**
- [ ] Runbook: GDPR/DSAR response process (how to export customer data, how to delete account) | **Owner: TW-OPS (reviewed)**
- [ ] Runbook: Payment dispute / chargeback handling (Stripe dashboard + evidence submission) | **Owner: TW-FIN (reviewed)**
- [ ] Runbook: Escalation path for critical production incidents (who to contact, in what order) | **Owner: Dev A (reviewed)**

### 11.4 Backup and Disaster Recovery

- [ ] Strapi database (PostgreSQL on CX42): automated daily backup configured in Coolify; last backup successful | **Owner: Dev A**
- [ ] Medusa database: automated daily backup configured; last backup successful | **Owner: Dev A**
- [ ] PostHog backup: ClickHouse data export to Backblaze B2 configured and tested | **Owner: Dev A**
- [ ] Backblaze B2 backup verified: manually downloaded and verified integrity of last backup file | **Owner: Dev A**
- [ ] DR drill completed: simulated database restore from backup on staging environment | **Owner: Dev A**
- [ ] DR drill results documented (RTO achieved, any issues noted) | **Owner: Dev A**
- [ ] Coolify auto-restart configured for all services (restart policy: `unless-stopped`) | **Owner: Dev A**

### 11.5 Monitoring

- [ ] UptimeRobot monitoring active for:
  - [ ] `https://www.twinmos.com` (main site) | **Owner: Dev A**
  - [ ] `https://api.twinmos.com` (Strapi API) | **Owner: Dev A**
  - [ ] `https://analytics.twinmos.com/_health` (PostHog) | **Owner: Dev A**
  - [ ] Checkout flow (synthetic transaction monitor) | **Owner: Dev A**
- [ ] Alert notifications configured: Slack `#monitoring-alerts` + TW-PM email + Dev A email | **Owner: Dev A**
- [ ] Hetzner server disk usage monitoring configured (alert at 80%) | **Owner: Dev A**
- [ ] Hetzner server CPU/RAM monitoring configured (alert at 90%) | **Owner: Dev A**
- [ ] Stripe payment monitoring: Stripe Dashboard webhooks all showing successful deliveries | **Owner: Dev A**

---

## Section 12: Go / No-Go Decision

### 12.1 Blocker Criteria (Any Single Item = NO GO)

The following items are absolute blockers. If any of these are not resolved, the launch is postponed regardless of all other checklist items passing.

| # | Blocker | Status |
|---|---|---|
| B-001 | Any payment flow not working end-to-end (Stripe test cards failing) | [ ] RESOLVED |
| B-002 | Stripe account still in test mode (live keys not loaded) | [ ] RESOLVED |
| B-003 | Pen test critical findings not remediated and verified | [ ] RESOLVED |
| B-004 | Tax calculation incorrect for any supported region (UAE, India, KSA, BD) | [ ] RESOLVED |
| B-005 | Order confirmation email not sending (Resend misconfigured) | [ ] RESOLVED |
| B-006 | PCI DSS SAQ A not signed by TwinMOS Finance Director | [ ] RESOLVED |
| B-007 | Session cookie security flags (HttpOnly, Secure, SameSite=Strict) not set | [ ] RESOLVED |
| B-008 | Privacy Policy not updated for Phase 3 data processing | [ ] RESOLVED |
| B-009 | Terms of Sale not linked from checkout | [ ] RESOLVED |
| B-010 | Stripe webhook signature verification not implemented | [ ] RESOLVED |

### 12.2 Warning Criteria (Document Risk, Proceed With Caution)

The following items are warnings, not blockers. The Project Sponsor may authorize launch with documented warnings and a mitigation plan.

| # | Warning | Mitigation |
|---|---|---|
| W-001 | One or more new locale (RU/ZH-CN/FR) partially translated (≤ 10 untranslated product pages) | Publish with machine translation fallback; complete translations within 2 weeks post-launch |
| W-002 | PostHog session replay volume at < 10% of expected (PostHog health but low recording count) | Monitor; investigate ClickHouse disk space; increase sampling rate temporarily |
| W-003 | A/B testing framework smoke test experiment not fully configured | Defer EXP-P3-001 launch by 1 week; launch manually after hypercare period |
| W-004 | k6 load test shows p99 response time > 3s at 1,000 VUs (but error rate still < 1%) | Scale Hetzner CX42 to CX52 within 24 hours if load test metrics worsen in production |
| W-005 | One pen test high severity finding remediated but not yet re-verified by pen tester | Proceed if Dev A confirms fix is correct; schedule re-verification within 5 business days |

### 12.3 Final Go/No-Go Decision Record

| Field | Value |
|---|---|
| Decision meeting date | ___________________ |
| Decision | ☐ GO — authorized to launch | ☐ NO GO — launch postponed |
| Blockers outstanding (if NO GO) | ___________________ |
| Warnings documented (if GO with warnings) | ___________________ |
| Project Sponsor authorization | ___________________ |
| IT Lead authorization | ___________________ |
| Go/No-Go decision time | ___________________ |

---

## Section 13: Launch Execution Plan

### 13.1 Pre-Launch (T-24 hours)

| Time | Action | Owner |
|---|---|---|
| T-24h | Final checklist review meeting with all stakeholders | TW-PM |
| T-24h | Confirm Hetzner server health: disk space, CPU, RAM on CX42 and CX52 | Dev A |
| T-24h | Confirm Backblaze B2 backup completed successfully | Dev A |
| T-24h | All team members confirmed available on launch day | TW-PM |
| T-24h | Slack `#phase3-launch` channel created; all stakeholders invited | TW-PM |
| T-12h | Final staging environment smoke test (checkout end-to-end with real email) | Dev B |
| T-12h | Stripe live keys ready (not yet deployed to production) | Dev A |
| T-4h | Code freeze: no new deployments to main branch | Dev A (enforce) |

### 13.2 Launch Day (T=0)

> Target launch time: 09:00 UAE time (GULF Standard Time, UTC+4) on a Tuesday or Wednesday (avoid Monday for fresh-start issues; avoid Friday for UAE weekend)

| Step | Time | Action | Owner | Rollback trigger |
|---|---|---|---|---|
| 1 | T=0 | Deploy final production build to Cloudflare Pages | Dev A | Any deployment failure |
| 2 | T+5min | Rotate Stripe API keys: replace test keys with live keys in Cloudflare Pages environment | Dev A | Stripe key validation failure |
| 3 | T+10min | Verify Stripe live mode: place test transaction with actual card (immediately refund) | Dev A + TW-FIN | Transaction failure |
| 4 | T+15min | Verify PostHog events flowing in live environment (PostHog Live Events dashboard) | Dev A | No events after 5 minutes |
| 5 | T+20min | Verify Resend: trigger test order confirmation email from production | Dev A | Email not received |
| 6 | T+25min | Verify HubSpot: submit contact form on production site; confirm contact created in HubSpot | Dev B | Contact not created |
| 7 | T+30min | Full end-to-end smoke test on production (real order, small amount, immediately cancel/refund) | Dev B + TW-PM | Any step fails |
| 8 | T+45min | DNS/CDN verification: confirm `www.twinmos.com` resolving correctly globally (use DNSChecker.org) | Dev A | DNS not propagated |
| 9 | T+60min | Announce launch internally (Slack) | TW-PM | — |
| 10 | T+90min | Announce launch externally (HubSpot marketing email to customer list) | TW-MKT | Marketing email delivery issues |
| 11 | T+120min | First monitoring check: UptimeRobot green, PostHog events flowing, no errors in Cloudflare logs | Dev A | Any red alert |

### 13.3 Critical DNS and Infrastructure Changes

| Change | Action | Owner | Rollback |
|---|---|---|---|
| Cloudflare Pages deployment | New build deployed | Dev A | Roll back to previous Cloudflare Pages deployment (one-click in Cloudflare dashboard) |
| Stripe live keys | Update in Cloudflare Pages environment variables | Dev A | Revert to test keys (stops payments but protects customers) |
| PostHog `PUBLIC_POSTHOG_KEY` | Already set for production PostHog instance | Dev A | Disable PostHog in env (set empty key) |

---

## Section 14: Post-Launch Monitoring Plan

### 14.1 First 48 Hours: Hourly Checks

Every hour for the first 48 hours after launch, Dev A or Dev B performs:

- [ ] UptimeRobot status: all monitors green
- [ ] Cloudflare Pages: no errors in Functions logs
- [ ] Stripe Dashboard: payment success rate ≥ 95% of attempts
- [ ] PostHog Live Events: events flowing for current sessions
- [ ] Hetzner CX42 CPU: < 80% average over last 15 minutes
- [ ] Hetzner CX52 (PostHog): CPU < 80%, disk < 70%
- [ ] No escalation reports from TwinMOS Operations (customer complaints)

Document each hourly check result in `#phase3-launch` Slack channel.

### 14.2 First Week: Daily Checks

Each day during the first week:

| Metric | Target | Where to check |
|---|---|---|
| Orders placed | ≥ 1 per day initially | Medusa admin |
| Payment success rate | ≥ 95% | Stripe Dashboard |
| Order confirmation emails delivered | 100% of orders | Resend Dashboard |
| PostHog events (daily unique) | Consistent with pre-launch staging trends | PostHog dashboard |
| Abandoned cart recovery emails | Workflow triggering and sending | HubSpot Workflow history |
| Server health (CPU/RAM/Disk) | CPU < 70%, Disk < 70% | Coolify dashboard |
| Customer support tickets | Baseline measurement | TwinMOS Operations |
| Lighthouse score on checkout | ≥ 90 | Run Lighthouse on production URL |

### 14.3 Key Dashboards During Post-Launch

| Dashboard | URL | Owner | Check frequency |
|---|---|---|---|
| PostHog E-Commerce KPIs | analytics.twinmos.com | TW-PM + Dev A | Daily |
| Stripe Dashboard | dashboard.stripe.com | Dev A + TW-FIN | Hourly (first 48h), daily (first week) |
| HubSpot Email Performance | app.hubspot.com | TW-MKT | Daily |
| Cloudflare Pages Analytics | dash.cloudflare.com | Dev A | Daily |
| Resend Deliverability | resend.com/emails | Dev A | Daily |
| Coolify Server Health | coolify.twinmos.com | Dev A | Twice daily |

---

## Section 15: Hypercare Period

**Duration:** 2 weeks post-launch (Weeks 1 and 2)

**Hypercare team:** TW-PM + Dev A + Dev B

**Commitments during hypercare:**
- Both developers available within 2 hours for critical issues (P1/P2 severity)
- TW-PM on standby for customer escalations
- Daily 15-minute standup at 09:00 UAE time: status update + open issues
- All production deployments during hypercare require TW-PM approval before deployment

### 15.1 Incident Severity Levels During Hypercare

| Severity | Definition | Response time | Resolution target |
|---|---|---|---|
| **P1 — Critical** | Payment not processing, site completely down, orders not being created | 30 minutes | 4 hours |
| **P2 — High** | Order emails not sending, login/registration broken, cart broken | 2 hours | 8 hours |
| **P3 — Medium** | Loyalty program UI error, MDF portal issue, translation missing | Next business day | 3 business days |
| **P4 — Low** | Minor UI issue, non-critical typo, analytics event mismatch | Next sprint | Sprint cycle |

### 15.2 Escalation Path

```
Issue detected (Dev A / Dev B / TW-OPS)
    ↓
Post in #phase3-launch with severity tag
    ↓
P1/P2: Call TW-PM immediately (phone)
P3/P4: Slack message, tag TW-PM
    ↓
P1: Engage rollback plan if not resolved in 1 hour
P2: Fix and hotfix deploy (TW-PM approval required)
```

---

## Section 16: Rollback Plan

**Trigger:** A critical issue (P1) is detected within the first 24 hours of launch that cannot be resolved within 4 hours.

**Rollback decision authority:** TW-PM (or Project Sponsor if TW-PM unavailable) in consultation with Dev A.

### 16.1 Rollback Procedure

| Step | Action | Owner | Time estimate |
|---|---|---|---|
| 1 | TW-PM declares rollback decision | TW-PM | Immediate |
| 2 | Dev A reverts Cloudflare Pages to previous production deployment (one-click rollback in Cloudflare Pages dashboard) | Dev A | 5 minutes |
| 3 | Dev A reverts Stripe from live keys to test keys (stops new payments gracefully) | Dev A | 5 minutes |
| 4 | TW-PM posts internal announcement: "Phase 3 temporarily reverted; Phase 2 site is live; investigating issue" | TW-PM | 10 minutes |
| 5 | Verify Phase 2 site is fully operational (manual smoke test) | Dev B | 15 minutes |
| 6 | Process any pending orders that came in during Phase 3 window manually (TW-OPS) | TW-OPS | Variable |
| 7 | Root cause analysis begins | Dev A + Dev B | Same day |
| 8 | Fix implemented, re-tested, and new launch scheduled | TW-PM | Next available window |

**Total estimated rollback time: < 30 minutes from decision to Phase 2 live.**

### 16.2 Orders Placed During Phase 3 Window (Pre-Rollback)

If orders were placed during the Phase 3 window before rollback:
- Orders visible in Medusa admin
- TW-OPS processes fulfillment manually if Medusa still accessible
- Stripe payments charged — if issue was payment-related, TW-FIN initiates refunds via Stripe Dashboard
- Customers emailed personally by TW-OPS with apology and status update

---

*Document reference: TWN-P3-LAUNCH-2026-001 | Version 1.0 | TwinMOS Technologies*
*This document is confidential and intended for internal use only.*
*All checklist items must be completed and signed off before Go/No-Go meeting.*
