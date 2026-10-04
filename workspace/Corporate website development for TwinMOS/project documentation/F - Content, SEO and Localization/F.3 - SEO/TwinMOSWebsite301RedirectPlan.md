# TwinMOS Website — 301 Redirect Plan

**Document Reference:** TWN-F3-301-2026-001
**Version:** 1.0
**Status:** APPROVED
**Date:** 2026-05-01
**Owner:** Front-End Lead / DevOps Lead
**Relates To:** TwinMOSWebsiteLegacyURLtoNewURL_Mapping.md; Tech Stack §12.4; H - DevOps/CI-CD

---

## Table of Contents

1. [Implementation Architecture](#1-implementation-architecture)
2. [Cloudflare Pages `_redirects` File](#2-cloudflare-pages-_redirects-file)
3. [Strapi Redirect Plugin](#3-strapi-redirect-plugin)
4. [Complete Redirect Rule Set](#4-complete-redirect-rule-set)
5. [Redirect Chain Detection and Flattening](#5-redirect-chain-detection-and-flattening)
6. [302 Temporary Redirect Policy](#6-302-temporary-redirect-policy)
7. [410 Gone Implementation](#7-410-gone-implementation)
8. [Pre-Launch Testing Checklist](#8-pre-launch-testing-checklist)
9. [Post-Launch Monitoring](#9-post-launch-monitoring)
10. [Redirect Removal Schedule](#10-redirect-removal-schedule)

---

## 1. Implementation Architecture

Redirects are managed at two layers:

| Layer | Tool | Use Case |
|-------|------|---------|
| **Layer 1 — Cloudflare Edge** | Cloudflare Pages `_redirects` file | All 301/302/410 rules; evaluated before the Astro build is hit |
| **Layer 2 — CMS** | `strapi-plugin-redirect` | Dynamically managed redirects for editors (e.g., when a product page URL changes); synced at build time |

### Why Two Layers?

- `_redirects` is evaluated at the Cloudflare CDN edge — zero latency, no origin hit. Use for all known legacy-to-new URL mappings that do not change.
- `strapi-plugin-redirect` gives Marketing/SEO team the ability to add or modify redirects through the Strapi admin UI without a deployment. Strapi exports redirects to a JSON file that Astro reads at build time and appends to `_redirects`.

**Priority:** `_redirects` rules are evaluated first. Strapi plugin redirects are appended at the end of `_redirects` — earlier rules in the file take precedence.

---

## 2. Cloudflare Pages `_redirects` File

### 2.1 File Location

```
/public/_redirects
```

This file is automatically deployed to Cloudflare Pages with every build. Cloudflare applies the rules at the CDN edge.

### 2.2 File Syntax

```
# Cloudflare Pages _redirects syntax
# {source URL}   {destination URL}   {HTTP status code}

/old-path/       /new-path/           301
/another/old     /another/new/        301
/shop/           /products/           301
/expired-promo/  /products/           410
```

Rules:
- One rule per line.
- Source path is always a path (no domain, no protocol).
- Destination can be a path or full URL (for redirects to external domains).
- HTTP status code: 301 (permanent), 302 (temporary), 410 (gone).
- Wildcards: `*` matches any path segment. Use `:splat` to preserve the matched portion.
- Comments: lines starting with `#`.
- Cloudflare Pages supports up to 2,000 redirect rules per `_redirects` file.

### 2.3 Wildcard Pattern Examples

```
# Redirect all old WooCommerce product category URLs
/product-category/*     /products/            301

# Redirect old blog paths (preserve slug via :splat)
/blog/:splat            /news/articles/:splat/ 301

# Redirect old tag pages
/tag/*                  /products/             301
```

### 2.4 Domain-Level Rules (Cloudflare Rules, Not `_redirects`)

Domain-level redirects (www removal, HTTP → HTTPS) are configured in Cloudflare Dashboard → Rules → Redirect Rules, not in `_redirects`:

```
Rule 1: http://twinmos.com/*   →  https://twinmos.com/$1   (301)
Rule 2: http://www.twinmos.com/*  →  https://twinmos.com/$1   (301)
Rule 3: https://www.twinmos.com/*  →  https://twinmos.com/$1   (301)
```

---

## 3. Strapi Redirect Plugin

### 3.1 Plugin

**Package:** `strapi-plugin-redirect`
**Admin path:** `cms.twinmos.com/admin/redirect`

### 3.2 When to Use the Strapi Plugin (vs `_redirects`)

| Use Strapi Plugin | Use `_redirects` |
|-----------------|-----------------|
| Redirects created after initial launch | All pre-launch, known legacy redirects |
| Redirects added by Marketing/SEO without deploying | Static, permanent structural redirects |
| Product URL changes (e.g., product renamed) | Domain-level and wildcard redirects |
| Campaign landing page retirements | WooCommerce path patterns |

### 3.3 Adding a Redirect via Strapi Admin

1. Log in to Strapi Admin → **Redirect** (left sidebar).
2. Click **"+ New redirect"**.
3. Enter:
   - **Source URL** (relative path, no domain): `/old-product-page/`
   - **Target URL** (relative or absolute): `/products/memory/new-name/`
   - **Status Code**: 301 (Permanent) or 302 (Temporary)
4. Save. The plugin will append this rule to the next Astro build's `_redirects`.

### 3.4 Strapi Plugin Export at Build Time

The Astro build script reads from Strapi's redirect API at build time:
```
GET https://cms.twinmos.com/api/redirects?pagination[pageSize]=1000
```
The response is parsed and appended to `/public/_redirects` before the Cloudflare Pages deployment.

---

## 4. Complete Redirect Rule Set

The full `_redirects` file contents for the Phase 1 launch. This file is maintained in the Git repository at `/public/_redirects`.

```
# ============================================================
# TwinMOS Website — _redirects
# Generated: 2026-05-01
# See: F.3 - SEO/TwinMOSWebsite301RedirectPlan.md
# ============================================================

# -----------------------------------------------
# DOMAIN NORMALIZATION (handled in Cloudflare Rules, listed here for reference)
# -----------------------------------------------
# http://twinmos.com → https://twinmos.com  [Cloudflare Rule]
# www.twinmos.com → twinmos.com  [Cloudflare Rule]

# -----------------------------------------------
# PRODUCTS — CATEGORY PAGES
# -----------------------------------------------
/shop/                                    /products/                                      301
/product-category/                        /products/                                      301
/product-category/dram-module/            /products/memory/                               301
/product-category/dram-module/ddr5/       /products/memory/ddr5/                          301
/product-category/dram-module/ddr4/       /products/memory/ddr4/                          301
/product-category/dram-module/ddr3/       /products/memory/ddr3/                          301
/product-category/solid-state-drive/      /products/ssd/                                  301
/product-category/solid-state-drive/nvme/ /products/ssd/nvme/                             301
/product-category/solid-state-drive/sata/ /products/ssd/sata/                             301
/product-category/portable-drive/         /products/portable/                             301
/product-category/usb-flash-drive/        /products/usb/                                  301

# -----------------------------------------------
# PRODUCTS — INDIVIDUAL PRODUCT PAGES (DDR5)
# -----------------------------------------------
/product/twinmos-voltx-ddr5-u-dimm-for-desktop/        /products/memory/ddr5/                          301
/product/twinmos-voltx-ddr5-so-dimm-for-laptop/        /products/memory/voltx-ddr5-so-dimm/            301
/product/twinmos-voltx-rgb-ddr5-u-dimm-for-desktop/    /products/memory/voltx-rgb-ddr5-u-dimm/         301
/product/voltx-ddr5-6000mhz/                           /products/memory/voltx-ddr5-6000mhz-32gb/       301
/product/voltx-ddr5-5600mhz/                           /products/memory/voltx-ddr5-u-dimm/             301
/product/voltx-ddr5-4800mhz/                           /products/memory/voltx-ddr5-u-dimm/             301

# -----------------------------------------------
# PRODUCTS — INDIVIDUAL PRODUCT PAGES (DDR4)
# -----------------------------------------------
/product/twinmos-tornadox7-pro-ddr4-3200mhz-cl16-u-dimm-for-desktop/  /products/memory/tornadox7-pro-ddr4/    301
/product/twinmos-thunder-gx-ddr4-u-dimm-for-desktop/                   /products/memory/thunder-gx-ddr4/       301
/product/tornadox7-ddr4/                               /products/memory/tornadox7-ddr4/                301
/product/concord-rgb-ddr4/                             /products/memory/concord-cl16-rgb-ddr4/         301
/product/ddr4-so-dimm/                                 /products/memory/ddr4-so-dimm/                  301
/product/ddr3-module/                                  /products/memory/ddr3/                          301

# -----------------------------------------------
# PRODUCTS — INDIVIDUAL PRODUCT PAGES (SSD)
# -----------------------------------------------
/product/twinmos-corex-m-2-pcie-gen-4-0-nvme-ssd/     /products/ssd/nvme/corex-gen4/                  301
/product/twinmos-alphapro-nvme-m-2-2280-new-ssd/       /products/ssd/nvme/alpha-pro-gen3/              301
/product/corex-pro-gen5/                               /products/ssd/nvme/corex-pro-gen5/              301
/product/xtreme-gen4/                                  /products/ssd/nvme/xtreme-gen4/                 301
/product/xtreme-pro-gen4/                              /products/ssd/nvme/xtreme-pro-gen4/             301
/product/tw300-gen3/                                   /products/ssd/nvme/tw300-gen3/                  301
/product/hyper-h2-ultra-sata/                          /products/ssd/sata/hyper-h2-ultra/              301
/product/m2-sata/                                      /products/ssd/sata/m2-sata/                     301

# -----------------------------------------------
# PRODUCTS — PORTABLE AND USB
# -----------------------------------------------
/product/elite-drive-pro/                              /products/portable/elite-drive-pro/             301
/product/prodrive-ultra/                               /products/portable/prodrive-ultra/              301
/product/mobile-disk-x3/                               /products/usb/mobile-disk-x3/                  301

# -----------------------------------------------
# WooCommerce WILDCARD CATCH-ALL (after specific rules)
# -----------------------------------------------
/product/*                                             /products/                                      301
/shop/*                                                /products/                                      301

# -----------------------------------------------
# SUPPORT
# -----------------------------------------------
/warranty/                                             /support/warranty/                              301
/rma/                                                  /support/rma/                                   301
/rma-form/                                             /support/rma/submit/                            301
/downloads/                                            /support/downloads/                             301
/firmware/                                             /support/firmware/                              301
/manuals/                                              /support/manuals/                               301
/faq/                                                  /support/faq/                                   301
/technical-support/                                    /support/contact/                               301
/knowledgebase/                                        /support/kb/                                    301
/kb/                                                   /support/kb/                                    301
/compatibility/                                        /support/compatibility-finder/                  301
/serial-number/                                        /support/serial-number-checker/                 301
/counterfeit/                                          /support/counterfeit-detection/                 301
/driver/                                               /support/downloads/                             301

# -----------------------------------------------
# ABOUT
# -----------------------------------------------
/about-us/                                             /about/                                         301
/company/                                              /about/company/                                 301
/history/                                              /about/history/                                 301
/leadership/                                           /about/leadership/                              301
/team/                                                 /about/leadership/                              301
/manufacturing/                                        /about/manufacturing/                           301
/quality/                                              /about/quality/                                 301
/certifications/                                       /about/certifications/                          301
/awards/                                               /about/awards/                                  301
/sustainability/                                       /about/sustainability/                          301
/csr/                                                  /about/csr/                                     301
/press-room/                                           /about/press-room/                              301
/media-kit/                                            /about/media-kit/                               301
/investor-relations/                                   /about/investor-relations/                      301

# -----------------------------------------------
# CONTACT AND PARTNERS
# -----------------------------------------------
/contact-us/                                           /contact/                                       301
/distributors/                                         /partners/distributors/                         301
/become-a-partner/                                     /partners/become-a-partner/                     301
/dealer-locator/                                       /where-to-buy/                                  301
/resellers/                                            /where-to-buy/retailers/                        301
/oem/                                                  /partners/oem-odm/                              301
/offices/                                              /contact/offices/                               301

# -----------------------------------------------
# NEWS AND BLOG
# -----------------------------------------------
/news/                                                 /news/articles/                                 301
/blog/                                                 /news/articles/                                 301
/press-releases/                                       /news/press-releases/                           301
/events/                                               /news/events/                                   301

# -----------------------------------------------
# LEGAL
# -----------------------------------------------
/privacy-policy/                                       /legal/privacy-policy/                          301
/terms-of-use/                                         /legal/terms-of-use/                            301
/terms-and-conditions/                                 /legal/terms-of-service/                        301
/cookie-policy/                                        /legal/cookie-policy/                           301
/warranty-terms/                                       /legal/warranty-policy/                         301
/gdpr/                                                 /legal/gdpr/                                    301
/rohs/                                                 /legal/rohs/                                    301
/compliance/                                           /legal/                                         301
/sitemap/                                              /legal/sitemap/                                 301

# -----------------------------------------------
# WORDPRESS CATCH-ALLS (after specific rules)
# -----------------------------------------------
/tag/*                                                 /products/                                      301
/?post_type=product                                    /products/                                      301

# -----------------------------------------------
# RETIRED PAGES — 410 GONE
# -----------------------------------------------
/sample-page/                                          /                                               410
/hello-world/                                          /                                               410
/cart/                                                 /                                               410
/checkout/                                             /                                               410
/my-account/                                           /                                               410
/wishlist/                                             /                                               410
/compare/                                              /products/compare/                              410

# ============================================================
# END OF STATIC REDIRECTS
# Strapi-managed redirects are appended below at build time
# ============================================================
```

---

## 5. Redirect Chain Detection and Flattening

### 5.1 Rule

No redirect URL in the `_redirects` file may itself be the source of another redirect. Maximum one hop from old URL to final destination.

**Prohibited example (chain — do not do this):**
```
/old-page/          /intermediate/         301
/intermediate/      /new-page/             301
```

**Correct (flattened):**
```
/old-page/          /new-page/             301
```

### 5.2 Validation Script

Before each deployment, run the chain-detection script:

```bash
# Check for redirect chains in _redirects file
node scripts/check-redirect-chains.js public/_redirects
```

This script:
1. Parses all source→destination pairs.
2. Checks if any destination is also a source in another rule.
3. Reports chains and suggests the flattened rule.

### 5.3 Redirect Loop Detection

A redirect loop occurs when URL A → URL B → URL A. The same script detects loops. Any loop causes the deployment to fail (enforced via pre-commit hook and CI check).

---

## 6. 302 Temporary Redirect Policy

Use 302 (Temporary) redirect sparingly. Valid use cases:

| Use Case | Duration | Convert to 301 After |
|---------|---------|---------------------|
| Campaign landing pages (seasonal) | Campaign duration | Remove after campaign; do not convert |
| A/B test traffic split | Test duration | Remove after test concludes |
| Under-construction placeholder | Until page is ready | Convert to 301 when destination is finalised |
| Content migrating between URLs | < 2 weeks | Convert to 301 once migration confirmed |

**Important:** Search engines do not pass full PageRank through 302 redirects. If you intend a permanent redirect, use 301. Leaving a 302 in place for >30 days will be treated as a 301 by Googlebot anyway, but do not rely on this behaviour — be explicit.

302 redirects in the Strapi plugin have a mandatory expiry date field. Expired 302s are flagged in the admin UI for review.

---

## 7. 410 Gone Implementation

Pages that are permanently removed with no redirect equivalent should return HTTP 410 (Gone) rather than 404 (Not Found). 410 tells search engines to deindex the URL faster than 404.

In `_redirects`:
```
/retired-page/     /      410
```

When the destination is `/`, Cloudflare returns the 410 status code without redirecting. Note: Cloudflare Pages `_redirects` implements 410 by serving the 404 page with a 410 status code.

**Review retired 410 URLs quarterly** — if any start receiving significant backlink traffic or organic clicks (visible in Search Console), consider whether a 301 to a relevant page is more appropriate.

---

## 8. Pre-Launch Testing Checklist

### 8.1 Automated Testing (CI)

All tests run in GitHub Actions on every push to `main` before deployment:

- [ ] `scripts/check-redirect-chains.js` — detects chains and loops.
- [ ] `scripts/validate-redirects.js` — validates `_redirects` syntax.
- [ ] Playwright test suite — crawls a sample of 50 high-priority legacy URLs against staging, asserts each returns 301 with correct destination.

### 8.2 Manual Testing (Pre-Launch)

Before DNS cutover:

1. Deploy the full build to the Cloudflare Pages preview URL.
2. Use Screaming Frog SEO Spider:
   - Set **Mode: Spider** → **Configuration → Redirects → Always Follow Redirects: OFF**.
   - Crawl the list of 207 legacy URLs from a text file.
   - Export results; verify all P0 and P1 URLs return 301 with the correct destination.
3. Test all 410 URLs return 410 status.
4. Verify no redirect chain (no 301 → 301 → 200 chains).
5. Verify no redirect loop (no 301 → 301 → original URL).
6. Test the 5 highest-traffic legacy URLs in a browser — confirm correct destination loads.

### 8.3 DNS Cutover Testing

Immediately after DNS cutover to the new server:

1. Check `https://twinmos.com/` loads (200 OK).
2. Check `https://www.twinmos.com/` redirects to `https://twinmos.com/` (301).
3. Check `http://twinmos.com/` redirects to `https://twinmos.com/` (301).
4. Spot-check 10 redirected product URLs.
5. Verify Google Search Console sitemap submission returns no errors.

---

## 9. Post-Launch Monitoring

### 9.1 Week 1 (Daily Checks)

- Google Search Console → Coverage → Pages with "Not found (404)" — spike indicates missing redirect.
- GA4 → Behaviour → Error pages — monitor for 404 traffic.
- Cloudflare Analytics → Error responses — monitor for unexpected 4xx/5xx volumes.

### 9.2 Month 1 (Weekly Checks)

- Search Console Coverage report — verify indexed pages count is growing (not dropping).
- Ahrefs / Semrush → Site Audit → Broken pages — identify any 404 URLs with backlinks.
- Add missed redirects to `_redirects` or Strapi plugin within 24 hours of discovery.

### 9.3 Months 2–6 (Monthly Checks)

- Screaming Frog crawl — full crawl of twinmos.com to identify new 404s.
- Search Console → Performance → compare organic clicks from legacy URLs (should be zero; traffic should be on new URLs).
- Verify redirect rules are still resolving correctly (destination URLs still exist — no 301 → 404 situations).

---

## 10. Redirect Removal Schedule

### 10.1 Policy

Redirect rules are **permanent by default** — do not remove them. The only reason to remove a redirect is if the source URL has received zero traffic for 12 consecutive months and has zero external backlinks.

Removing a redirect too early risks a traffic drop if an external site is still linking to the old URL.

### 10.2 Quarterly Review

Quarterly, review all redirect rules in the Strapi plugin:
1. Check source URL traffic in Google Analytics / Search Console.
2. Check external backlinks to source URL in Ahrefs.
3. If both are zero for 12 months: archive the redirect rule (do not delete — keep for audit trail).
4. Annual purge: delete archived redirects that have been zero-traffic for 24 months.

### 10.3 `_redirects` File Management

The `_redirects` static file is version-controlled in Git. To remove a rule:
1. Delete the line from `/public/_redirects`.
2. Commit with a message: `chore: remove redirect /old-url - no traffic in 12 months`.
3. The PR must include Search Console evidence (zero clicks/impressions for past 12 months) as a comment.

---

*Related: [Legacy URL Mapping](TwinMOSWebsiteLegacyURLtoNewURL_Mapping.md) | [URL Structure Spec](TwinMOSWebsiteURLStructureSpec.md) | [SEO Strategy](TwinMOSWebsiteSEO_Strategy.md)*
