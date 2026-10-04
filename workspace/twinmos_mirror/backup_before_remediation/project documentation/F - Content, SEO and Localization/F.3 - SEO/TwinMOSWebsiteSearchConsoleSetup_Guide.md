# TwinMOS Website — Google Search Console & Bing Webmaster Tools Setup Guide

**Document Reference:** TWN-F3-GSC-2026-001
**Version:** 1.0
**Status:** Approved
**Owner:** SEO Lead / Technical Web Manager
**Last Updated:** 1 May 2026
**Related Documents:** TWN-F3-SEO-2026-001 (SEO Strategy), TWN-F3-SITEMAP-2026-001 (XML Sitemap Strategy), TWN-F3-HREFLANG-2026-001 (Hreflang Implementation)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Google Search Console — Property Setup](#2-google-search-console--property-setup)
3. [Domain Verification via Cloudflare DNS](#3-domain-verification-via-cloudflare-dns)
4. [URL Prefix Verification (Backup Method)](#4-url-prefix-verification-backup-method)
5. [Sitemap Submission](#5-sitemap-submission)
6. [International Targeting Configuration](#6-international-targeting-configuration)
7. [Linking Google Analytics 4 and Plausible](#7-linking-google-analytics-4-and-plausible)
8. [Email Alerts and Notifications](#8-email-alerts-and-notifications)
9. [Regular Monitoring Checklist](#9-regular-monitoring-checklist)
10. [Monthly Reporting Template](#10-monthly-reporting-template)
11. [Bing Webmaster Tools Setup](#11-bing-webmaster-tools-setup)
12. [Search Console API Integration](#12-search-console-api-integration)
13. [Access Management](#13-access-management)
14. [Troubleshooting Reference](#14-troubleshooting-reference)

---

## 1. Overview

Google Search Console (GSC) is the primary tool for monitoring TwinMOS.com's presence in Google Search. It provides crawl coverage data, performance metrics (impressions, clicks, CTR, average position), Core Web Vitals, and alerts for manual actions or security issues.

This guide covers:

- Initial property creation and DNS verification
- Sitemap submission for all phases
- International targeting settings
- Integration with Google Analytics 4 (GA4) and Plausible
- Ongoing monitoring cadence
- Parallel setup for Bing Webmaster Tools

**Google Search Console URL:** [https://search.google.com/search-console](https://search.google.com/search-console)
**Account:** Use the TwinMOS Google Workspace account (`webmaster@twinmos.com`), not a personal Gmail account.

---

## 2. Google Search Console — Property Setup

### 2.1 Create the Property

1. Sign in to Google Search Console at `search.google.com/search-console` using `webmaster@twinmos.com`.
2. Click **"Add property"** in the top-left property selector.
3. Select **"Domain"** property type (recommended — covers all subdomains, HTTP/HTTPS, and both www/non-www variants automatically).
4. Enter: `twinmos.com` (no protocol prefix — the Domain property type handles this).
5. Click **"Continue"** — GSC will display a DNS TXT record for verification.

### 2.2 Why Domain Property?

| Property Type | Covers | Verification Method |
|---|---|---|
| **Domain** (recommended) | `twinmos.com`, `www.twinmos.com`, `cdn.twinmos.com`, `http://`, `https://` | DNS TXT record only |
| URL Prefix | Single protocol + subdomain variant only | Multiple methods (DNS, HTML file, HTML tag, GA, GTM) |

A Domain property consolidates all data into one view and avoids fragmentation across `http://` vs. `https://` variants.

---

## 3. Domain Verification via Cloudflare DNS

### 3.1 Add the TXT Record

After clicking "Continue" in Step 2, GSC displays a TXT record in the format:

```
google-site-verification=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

1. Log in to the Cloudflare dashboard at `dash.cloudflare.com`.
2. Select the `twinmos.com` zone.
3. Navigate to **DNS** → **Records**.
4. Click **"Add record"**.
5. Configure as follows:

   | Field | Value |
   |---|---|
   | Type | `TXT` |
   | Name | `@` (represents the root domain) |
   | Content | `google-site-verification=XXXXXXXXXX` (paste the full value from GSC) |
   | TTL | Auto (or 300 seconds) |
   | Proxy status | DNS only (grey cloud — proxied TXT records may interfere) |

6. Click **"Save"**.

### 3.2 Trigger Verification

1. Return to Google Search Console.
2. Click **"Verify"**.
3. DNS propagation is usually instant via Cloudflare but can take up to 72 hours globally.
4. If verification fails immediately, wait 10 minutes and click "Verify" again.

### 3.3 Post-Verification

After successful verification, GSC displays: *"Ownership verified."*

- Save the TXT record permanently — removing it will cause the property to lose verification.
- Note: Multiple TXT records with `google-site-verification=` values are acceptable — add one per authorised team member if needed.

---

## 4. URL Prefix Verification (Backup Method)

If DNS verification is unavailable (e.g., awaiting Cloudflare access), use the URL Prefix method as a temporary backup:

1. In "Add property", select **"URL prefix"** instead of Domain.
2. Enter: `https://www.twinmos.com`
3. Verification options available:
   - **HTML file** (recommended): Download `googleXXXXXXXX.html`, upload to `/public/` in the Astro project, deploy to Cloudflare Pages, then click "Verify".
   - **HTML tag**: Add `<meta name="google-site-verification" content="XXXX">` to `<BaseHead />` component in `src/components/BaseHead.astro`, deploy, then verify.
   - **Google Analytics**: If GA4 is already on-site, GA verification is instant.

> **Important:** After DNS verification is complete, delete the URL Prefix property and retain only the Domain property to avoid split reporting.

---

## 5. Sitemap Submission

### 5.1 Submit the Sitemap Index

1. In Search Console, select the `twinmos.com` property.
2. Navigate to **Indexing** → **Sitemaps** in the left sidebar.
3. In the "Add a new sitemap" field, enter: `sitemap-index.xml`
4. Click **"Submit"**.

GSC will crawl the sitemap index and discover all child sitemaps. Expected sitemap structure:

```
https://www.twinmos.com/sitemap-index.xml
  └── https://www.twinmos.com/sitemap-en.xml          (P1 launch)
  └── https://www.twinmos.com/sitemap-ar.xml          (P2 — Arabic)
  └── https://www.twinmos.com/sitemap-bn.xml          (P2 — Bengali)
  └── https://www.twinmos.com/sitemap-hi.xml          (P2 — Hindi)
  └── https://www.twinmos.com/sitemap-ru.xml          (P3 — Russian)
  └── https://www.twinmos.com/sitemap-zh-CN.xml       (P3 — Chinese Simplified)
  └── https://www.twinmos.com/sitemap-fr.xml          (P3 — French)
  └── https://www.twinmos.com/sitemap-images.xml      (P1 — image sitemap)
  └── https://www.twinmos.com/sitemap-news.xml        (P2 — Google News)
```

### 5.2 Phase-by-Phase Submission Schedule

| Phase | Sitemaps to Submit | Timing |
|---|---|---|
| P1 Launch | `sitemap-en.xml`, `sitemap-images.xml` | Week of launch |
| P2 (Months 6–9) | `sitemap-ar.xml`, `sitemap-bn.xml`, `sitemap-hi.xml`, `sitemap-news.xml` | As each locale deploys |
| P3 (Months 10–15) | `sitemap-ru.xml`, `sitemap-zh-CN.xml`, `sitemap-fr.xml` | As each locale deploys |

### 5.3 Monitoring Sitemap Health

After submission, GSC shows sitemap status within 24–72 hours:

| Status | Meaning | Action |
|---|---|---|
| Success | Sitemap parsed; URLs submitted to index queue | None |
| Couldn't fetch | GSC cannot access the sitemap URL | Check Cloudflare firewall, `robots.txt` |
| Has errors | Sitemap contains malformed entries | Validate at xml-sitemap.com; redeploy |
| URLs submitted N / Indexed N | Shows indexing progress | Monitor weekly; gaps indicate crawl issues |

---

## 6. International Targeting Configuration

### 6.1 No Country-Level Targeting

TwinMOS operates a global domain (`twinmos.com`) targeting multiple countries simultaneously. **Do not** set a country target in Search Console's "International Targeting" tool — doing so would de-prioritise TwinMOS pages in all countries except the selected one.

Locale differentiation is handled exclusively through:
- **Hreflang `<link>` tags** in page `<head>` (see TWN-F3-HREFLANG-2026-001)
- **XML sitemap `<xhtml:link>` elements** linking alternate locale URLs
- **URL locale prefixes** (`/ar/`, `/bn/`, `/hi/`, `/ru/`, `/zh-CN/`, `/fr/`)

### 6.2 Verify International Targeting Report

1. In Search Console, navigate to **Search Traffic** → **International Targeting**.
2. Confirm "Language" tab shows the hreflang annotations GSC has detected.
3. The "Country" tab should show **"No location targeting"** — verify this is the case.
4. Any hreflang errors (e.g., "No return tag" or "Incorrect lang value") appear here and require immediate remediation.

### 6.3 Common Hreflang Errors in GSC

| Error | Cause | Fix |
|---|---|---|
| No return tag | Page A has hreflang pointing to Page B, but Page B doesn't reference Page A | Add bidirectional hreflang annotations |
| Unknown language code | Malformed language tag (e.g., `zh` instead of `zh-CN`) | Use correct BCP 47 codes: `zh-CN` for Simplified Chinese |
| Inaccessible return tag URL | Locale page returns 404 or is blocked by `robots.txt` | Fix URL or unblock in `robots.txt` |
| Missing x-default | No `x-default` hreflang annotation | Add `<link rel="alternate" hreflang="x-default" href="https://www.twinmos.com/path/">` |

---

## 7. Linking Google Analytics 4 and Plausible

### 7.1 Link GA4 to Search Console

Linking GA4 to GSC allows Search Console data to appear within GA4 reports under **Acquisition → Search Console**.

1. In Google Search Console, go to **Settings** → **Associations**.
2. Click **"Add association"** → **"Google Analytics"**.
3. Select the GA4 property: `TwinMOS Website — GA4` (measurement ID: `G-XXXXXXXXXX`).
4. Click **"Associate"** — confirm in the GA4 property if prompted.

Benefits after linking:
- Search Console queries appear as an Acquisition report in GA4
- Landing page performance (organic sessions, bounce rate, conversions) correlates with keyword data
- Import GA4 conversion goals into Search Console for conversion-weighted position data

### 7.2 Plausible Analytics Integration

Plausible is the privacy-first analytics tool used alongside GA4. It does not integrate directly with Search Console but receives UTM-tagged referral traffic:

- Organic traffic from Google appears as `Source: google / Medium: organic` in Plausible
- No action required in Search Console for Plausible; data flows automatically

Plausible dashboard URL: `plausible.io/twinmos.com` (requires team account login)

### 7.3 Google Tag Manager (GTM) — No Direct GSC Integration

GTM is used to deploy GA4 tags but has no direct relationship with Search Console. GSC verification via GTM (using the GA4 tag path) is a fallback only; use DNS TXT verification as the primary method.

---

## 8. Email Alerts and Notifications

### 8.1 Configure GSC Email Notifications

1. In Search Console, click the **settings gear icon** (top right) → **Search Console settings**.
2. Under **"Message preferences"**, enable notifications for:

   | Alert Type | Enable? | Rationale |
   |---|---|---|
   | Issues affecting search performance | ✅ Yes | Core Web Vitals drops, indexing issues |
   | Manual actions | ✅ Yes | Google penalty — requires immediate response |
   | Security issues | ✅ Yes | Malware/hacking detection — critical |
   | Property verification issues | ✅ Yes | If DNS TXT record is removed |
   | Crawl errors | ✅ Yes | Server errors during Googlebot crawl |
   | Sitemaps submitted or failed | ✅ Yes | Sitemap health monitoring |
   | Sitelinks changes | ⬜ Optional | Informational only |

3. Ensure alerts are delivered to `webmaster@twinmos.com` and `seo@twinmos.com`.

### 8.2 Critical Alert Response Protocol

| Alert | Response Time | Owner | Action |
|---|---|---|---|
| Manual action (penalty) | 4 hours | SEO Lead + Marketing Director | Review GSC message, identify affected URLs, remediate, submit reconsideration request |
| Security issue (malware) | 1 hour | DevOps + SEO Lead | Engage Cloudflare WAF, investigate server, remediate, submit security review request |
| Core Web Vitals degradation | 24 hours | Frontend Developer + SEO Lead | Identify degraded URLs, deploy fix, re-measure in PageSpeed Insights |
| Significant indexing drop (>10%) | 24 hours | SEO Lead | Check `robots.txt`, server status, recent deployments for accidental noindex |
| Crawl errors spike | 24 hours | DevOps + SEO Lead | Check server logs, Cloudflare Pages build status, DNS records |

---

## 9. Regular Monitoring Checklist

### 9.1 Daily (Automated Monitoring)

- [ ] Cloudflare Pages build status — confirm deployments succeed
- [ ] Server uptime monitoring (Coolify health checks) — no downtime
- [ ] Cloudflare security events — no unusual spike in blocked requests

### 9.2 Weekly Monitoring (Every Monday)

**Performance Report:**
- [ ] Open **Search Console → Performance → Search results**
- [ ] Set date range: last 7 days vs. previous 7 days
- [ ] Check: Total clicks, total impressions, average CTR, average position
- [ ] Filter by **Page** — identify any pages with significant position drops (>5 places)
- [ ] Filter by **Query** — check if primary keywords (from TWN-F3-KWR-2026-001) are maintaining positions

**Coverage Report:**
- [ ] Open **Indexing → Pages**
- [ ] Check counts: Valid, Valid with warnings, Excluded, Error
- [ ] Investigate any new "Error" URLs — common causes: soft 404, server error (5xx), redirect error
- [ ] Confirm "Submitted via sitemap" count increases as new content is published

**Core Web Vitals:**
- [ ] Open **Experience → Core Web Vitals**
- [ ] Confirm all pages in "Good" category for both Mobile and Desktop
- [ ] Flag any new "Poor" URLs to frontend developer

### 9.3 Monthly Review (First Monday of Each Month)

**Full Performance Analysis:**
- [ ] Set date range: last 28 days vs. previous 28 days
- [ ] Export performance data as CSV for the monthly report
- [ ] Review top 20 queries by impressions — are primary keywords improving?
- [ ] Review top 20 pages by clicks — are product pages performing?
- [ ] Identify pages with high impressions but low CTR (<2%) — update meta titles/descriptions
- [ ] Identify pages ranking positions 11–20 — target for content improvement

**Index Health:**
- [ ] Confirm total indexed pages count aligns with expected (use sitemap URL count as baseline)
- [ ] Review "Not indexed" reasons:
  - "Crawled — currently not indexed": May improve; monitor for 30 days before action
  - "Discovered — currently not indexed": Crawl budget issue; add internal links to these pages
  - "Blocked by robots.txt": Verify intentional
  - "Blocked by noindex": Verify intentional
  - "Excluded by 'noindex' tag": Check if unintentional (CMS bug)
  - "Soft 404": Fix content issue or add proper 301 redirect

**Sitemap Report:**
- [ ] Open **Indexing → Sitemaps**
- [ ] Confirm "Submitted URLs" count matches actual page count
- [ ] Re-submit sitemap index if errors present

**International Targeting (P2+ only):**
- [ ] Open **International Targeting → Language tab**
- [ ] Confirm no new hreflang errors
- [ ] Verify correct locale detection for each language segment

**Enhancements:**
- [ ] Open **Experience → Page Experience**
- [ ] Confirm HTTPS ✅, Core Web Vitals ✅, Mobile Usability ✅ for all pages
- [ ] Check **Rich Results** status (for pages with structured data)
  - Product rich results
  - Article rich results (FAQ, HowTo)
  - Breadcrumb rich results

**Security & Manual Actions:**
- [ ] Open **Security & Manual Actions → Manual actions**
- [ ] Confirm: "No issues detected"
- [ ] Open **Security & Manual Actions → Security issues**
- [ ] Confirm: "No issues detected"

---

## 10. Monthly Reporting Template

Use this template to compile monthly SEO performance reports for the Marketing Director and senior stakeholders.

```markdown
# TwinMOS.com — SEO Monthly Report
**Reporting Period:** [Month YYYY]
**Prepared by:** [SEO Lead name]
**Date:** [Report date]

## Executive Summary
[2–3 sentences: top win, top concern, key action taken]

## Performance Metrics (Last 28 Days vs. Previous 28 Days)
| Metric | This Period | Previous Period | Change |
|---|---|---|---|
| Total Clicks | | | |
| Total Impressions | | | |
| Average CTR | | | |
| Average Position | | | |

## Index Health
| Category | Count | Notes |
|---|---|---|
| Total indexed pages | | |
| Pages with errors | | |
| Pages excluded (intentional) | | |
| New pages indexed this month | | |

## Top 10 Queries (by Clicks)
[Table: Query | Clicks | Impressions | CTR | Position]

## Top 10 Pages (by Clicks)
[Table: Page | Clicks | Impressions | CTR | Position]

## Core Web Vitals
| Device | Good URLs | Needs Improvement | Poor |
|---|---|---|---|
| Mobile | | | |
| Desktop | | | |

## Rich Results Status
| Schema Type | Valid | Invalid | Warnings |
|---|---|---|---|
| Product | | | |
| Article / FAQ | | | |
| Breadcrumb | | | |

## Actions Completed This Month
- [ ] [Action 1]
- [ ] [Action 2]

## Actions Planned for Next Month
- [ ] [Action 1]
- [ ] [Action 2]

## Observations & Recommendations
[Bullet points]
```

---

## 11. Bing Webmaster Tools Setup

Bing Webmaster Tools provides parallel visibility into Microsoft Bing and DuckDuckGo (which uses Bing's index) performance.

### 11.1 Create the Account

1. Go to `bing.com/webmasters` — sign in with a Microsoft account (create `webmaster@twinmos.com` Microsoft account or use existing).
2. Click **"Get started"**.

### 11.2 Import from Google Search Console (Recommended)

1. On the Bing Webmaster Tools dashboard, select **"Import from Google Search Console"**.
2. Authorise access to the Google account that owns the GSC property.
3. Bing will import:
   - The `twinmos.com` property
   - All submitted sitemaps
   - Site verification (Bing re-verifies independently)
4. This is the fastest setup path — reduces manual configuration to near zero.

### 11.3 Manual Verification (Alternative)

If not importing from GSC, verify via XML file:

1. In Bing Webmaster Tools, add `https://www.twinmos.com` as a site.
2. Download the provided `BingSiteAuth.xml` file.
3. Upload it to `/public/` in the Astro project root (so it is accessible at `https://www.twinmos.com/BingSiteAuth.xml`).
4. Deploy to Cloudflare Pages.
5. Click "Verify" in Bing Webmaster Tools.

### 11.4 Submit Sitemaps to Bing

1. After verification, navigate to **Sitemaps** in the left menu.
2. Submit: `https://www.twinmos.com/sitemap-index.xml`
3. Bing accepts sitemap index files and processes child sitemaps automatically.

### 11.5 Bing Webmaster Tools Monitoring Checklist (Monthly)

- [ ] **Search Performance** → Review queries and pages (similar to GSC Performance)
- [ ] **Index Explorer** → Confirm index count and last crawl date
- [ ] **SEO Reports** → Run automated SEO audit; resolve any high-severity issues
- [ ] **Backlinks** → Review backlink profile (Bing has independent backlink data)
- [ ] **Crawl Information** → Check for crawl errors
- [ ] **Site Scan** → Run monthly site scan for broken links, missing meta tags, etc.

### 11.6 Bing IndexNow Protocol

TwinMOS should implement IndexNow to push instant URL update notifications to Bing (and other IndexNow-compatible engines):

1. Generate an IndexNow API key (UUID format) via Bing Webmaster Tools.
2. Host the key file at: `https://www.twinmos.com/{key}.txt`
3. Configure the Astro build or Cloudflare Pages webhook to call the IndexNow API on each deployment:

```bash
# Post-deployment IndexNow ping (Cloudflare Pages Deploy Hook → Worker)
curl -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json" \
  -d '{
    "host": "www.twinmos.com",
    "key": "YOUR_INDEXNOW_KEY",
    "keyLocation": "https://www.twinmos.com/YOUR_INDEXNOW_KEY.txt",
    "urlList": ["https://www.twinmos.com/"]
  }'
```

4. For bulk submissions after Strapi content updates, submit the full sitemap URL list (up to 10,000 URLs per request).

---

## 12. Search Console API Integration

### 12.1 Use Cases

Automated reporting using the Search Console API eliminates manual data exports and enables:
- Weekly performance snapshots pushed to a Google Sheet dashboard
- Automated alerts when keyword rankings drop beyond threshold
- Competitor tracking integration (with third-party tools)

### 12.2 Enable the API

1. Go to Google Cloud Console: `console.cloud.google.com`
2. Create project: "TwinMOS SEO Automation"
3. Enable **Google Search Console API**
4. Create a **Service Account** with read-only access to the GSC property
5. Download the JSON credentials file and store securely (not in the git repository)

### 12.3 Sample API Query (Python)

```python
# Fetch top 10 queries for the last 28 days
from google.oauth2 import service_account
from googleapiclient.discovery import build
import json

SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly']
SERVICE_ACCOUNT_FILE = 'path/to/credentials.json'
SITE_URL = 'sc-domain:twinmos.com'

credentials = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE, scopes=SCOPES
)
service = build('searchconsole', 'v1', credentials=credentials)

response = service.searchanalytics().query(
    siteUrl=SITE_URL,
    body={
        'startDate': '2026-04-01',
        'endDate': '2026-04-28',
        'dimensions': ['query'],
        'rowLimit': 10,
        'orderBy': [{'fieldName': 'clicks', 'sortOrder': 'DESCENDING'}]
    }
).execute()

print(json.dumps(response['rows'], indent=2))
```

### 12.4 Automated Monthly Report — Google Sheets Integration

1. Set up an Apps Script in a shared Google Sheet: "TwinMOS SEO Dashboard"
2. Schedule the script to run on the 1st of each month at 09:00 UAE time
3. Script pulls performance data (queries, pages, devices, countries) for the previous 28 days
4. Writes data to sheet tabs: "Queries", "Pages", "Countries", "Devices", "Core Web Vitals"
5. Share the sheet with: Marketing Director, SEO Lead, CEO (view-only for CEO)

---

## 13. Access Management

### 13.1 GSC User Roles

| Role | Permissions | Assigned To |
|---|---|---|
| Owner | Full access; can add/remove users | `webmaster@twinmos.com` |
| Full user | View + take actions (submit sitemaps, request indexing, etc.) | SEO Lead, Senior Developer |
| Restricted user | View reports only | Marketing Manager, Content Team Lead, Agency Partner |

To add a user:
1. Search Console → **Settings** → **Users and permissions** → **Add user**
2. Enter Google account email
3. Select permission level
4. Click **"Add"**

### 13.2 Revocation Protocol

- Remove access immediately when a team member or agency partner leaves
- Conduct quarterly access audit (list all users; confirm each is current)
- Remove service account keys if the automation project is deprecated

---

## 14. Troubleshooting Reference

### 14.1 Common Issues and Resolutions

| Issue | Likely Cause | Resolution |
|---|---|---|
| Property verification fails (DNS) | DNS propagation delay; proxied DNS record | Wait 10 minutes; ensure TXT record is "DNS only" in Cloudflare (grey cloud) |
| Sitemap returns "Couldn't fetch" | Sitemap blocked by `robots.txt`; Cloudflare firewall rule blocking Googlebot | Check `robots.txt`; verify Cloudflare doesn't block `Googlebot` UA |
| Pages stuck in "Discovered — not indexed" | Insufficient PageRank; low crawl budget | Add internal links from high-authority pages; fix crawl budget by reducing low-value pages |
| "Blocked by noindex" — unintentional | CMS published with SEO fields not filled in; Strapi default noIndex = true | Set Strapi content type default for `noIndex` field to `false`; review published pages |
| Hreflang errors in International Targeting | Missing return tags; unreleased locale pages referenced | Only add hreflang for live, indexable locale pages; use phase-gated utility function |
| Core Web Vitals "Poor" on mobile | Large hero images not optimised; render-blocking scripts; no `font-display: swap` | Use ImgProxy for resizing/WebP conversion; defer non-critical scripts; add font-display: swap |
| Rich results not appearing after 4 weeks | Schema validation errors; insufficient indexing | Test at `search.google.com/test/rich-results`; fix JSON-LD errors; re-request indexing |
| Organic traffic drop after deployment | Accidental `noindex` on pages; redirect chain added; sitemap not updated | Verify `robots.txt` and meta robots; check redirect status; redeploy sitemap |
| "Manual action" notice | Unnatural links; thin content; cloaking (unlikely for new site) | Read GSC notice carefully; address specific issue; submit reconsideration request |

### 14.2 Useful Diagnostic URLs

| Tool | URL |
|---|---|
| Google Search Console | `search.google.com/search-console` |
| Google Rich Results Test | `search.google.com/test/rich-results` |
| Google PageSpeed Insights | `pagespeed.web.dev` |
| Google Mobile-Friendly Test | `search.google.com/test/mobile-friendly` |
| Google URL Inspection (in GSC) | Property → URL Inspection → enter URL |
| Bing Webmaster Tools | `bing.com/webmasters` |
| Bing URL Inspection | Bing WMT → URL Inspection |
| Screaming Frog SEO Spider | `screaming frog.co.uk/seo-spider/` (desktop app) |
| Aleyda Solis Hreflang Tool | `aleydasolis.com/tools/hreflang-tags-generator/` |
| XML Sitemap Validator | `xml-sitemap.com/validate-xml-sitemap.html` |
| Schema.org Validator | `validator.schema.org` |

---

*Document End — TWN-F3-GSC-2026-001 v1.0*
