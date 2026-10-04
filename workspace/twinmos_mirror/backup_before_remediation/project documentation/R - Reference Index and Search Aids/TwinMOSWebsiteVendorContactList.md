# TwinMOS Corporate Website — Vendor Contact List

**Document Reference:** TWN-REF-VENDORS-2026-001
**Version:** 1.0
**Date:** 1 May 2026
**Classification:** CONFIDENTIAL — Project Management Team Only
**Prepared by:** TwinMOS Digital Transformation Team
**Audience:** TwinMOS IT Lead, General Manager, Project Sponsors, Unisoft Team Lead

---

## Purpose

This document lists all technology vendors, platform providers, and service suppliers for the TwinMOS corporate website project. It covers both:

1. **Delivery Vendors** — organisations contracted to build/deliver the project
2. **Technology & Platform Vendors** — SaaS, PaaS, and open-source platform providers whose services the website relies on

For each vendor, the document records account ownership, support contacts, contract references, billing information, and key access credentials locations.

---

> **Security Note:** Credentials (API keys, passwords, tokens) are NEVER stored in this document. All credentials are managed in the secrets vault documented in [TwinMOSWebsiteKeyManagementPlan.md](../../I%20-%20Security%20and%20Compliance/I.1%20-%20Security%20Architecture/TwinMOSWebsiteKeyManagementPlan.md). This document records only account identifiers, support contacts, and plan tiers.

---

## Vendor Summary Table

| # | Vendor | Category | Tier / Plan | Account Owner | Contract Status |
|---|--------|----------|-------------|---------------|----------------|
| V-01 | Unisoft | Web Development Firm | MSA + SOW | TwinMOS GM | Executed |
| V-02 | Translation Vendor (TBC) | Translation Services | TBC | Marketing Director | Pending selection |
| V-03 | Pen-Test Vendor (TBC) | Security Testing | Per engagement | IT/Technical Lead | Pending selection |
| V-04 | Hetzner Online GmbH | Cloud Hosting (VPS) | CX31 or higher | IT/Technical Lead | Active |
| V-05 | Cloudflare Inc. | CDN, DNS, DDoS, Pages | Pro/Business | IT/Technical Lead | Active |
| V-06 | Backblaze Inc. | Object Storage (B2) | Pay-as-you-go | IT/Technical Lead | Active |
| V-07 | GitHub (Microsoft) | Source Control, CI/CD | Team | IT/Technical Lead | Active |
| V-08 | Resend | Transactional Email | Free/Pro | IT/Technical Lead | Pending setup |
| V-09 | Google | Analytics (GA4), Search Console | Free | Marketing Director | Pending setup |
| V-10 | Plausible Analytics | Privacy-Friendly Analytics | Business | IT/Technical Lead | Pending setup |
| V-11 | Sentry | Error Monitoring | Team | IT/Technical Lead | Pending setup |
| V-12 | Cloudflare Turnstile | CAPTCHA / Bot Protection | Free | IT/Technical Lead | Included in Cloudflare |
| V-13 | Stripe Inc. | Payment Processing | Standard | TBC (Phase 3) | Phase 3 only |
| V-14 | UptimeRobot | Uptime Monitoring | Pro | IT/Technical Lead | Pending setup |
| V-15 | Figma (Autodesk) | Design Collaboration | Professional | Marketing Director | Active/Pending |

---

## Section 1: Delivery Vendors

---

### V-01: Unisoft

| Field | Detail |
|-------|--------|
| **Vendor Name** | Unisoft |
| **Vendor ID** | V-01 |
| **Category** | Web Development — Primary Implementation Partner |
| **Service Description** | 15-month, 2-developer engagement to design, build, test, and launch the TwinMOS corporate website (Phases 1–3). Stack: Astro (frontend) + Strapi (CMS) + Hetzner hosting. |
| **Team Size** | 2 full-time developers (Team Lead + Senior Developer) |
| **Engagement Duration** | 15 months (Phases 1–3) |
| **Primary Contact** | TBC — Unisoft Team Lead (ST-11) |
| **Secondary Contact** | TBC — Unisoft Senior Developer (ST-12) |
| **Primary Contact Email** | *(To be confirmed — Unisoft to provide)* |
| **Preferred Communication** | Slack (shared workspace); GitHub for code review; video calls for demos |
| **Billing Contact** | *(To be confirmed)* |
| **Office Location** | *(To be confirmed — Unisoft HQ address)* |
| **Office Phone** | *(To be confirmed)* |
| **Website** | *(To be confirmed)* |
| **Contract Documents** | TwinMOSUnisoftMasterServiceAgreement.md · TwinMOSUnisoftStatementofWork.md · TwinMOSUnisoftNDA.md · TwinMOSUnisoftDataProcessingAgreement.md · TwinMOSUnisoftIPOwnershipTransfer_Agreement.md |
| **SLA Document** | TwinMOSUnisoftServiceLevelAgreement.md (P1 — to be created) |
| **Payment Schedule** | Per milestones defined in SOW |
| **IP Assignment** | All code, designs, and content vest in TwinMOS upon payment per IP Transfer Agreement |
| **Escalation** | TwinMOS GM (ST-02) → Chairman (ST-01) for unresolved vendor disputes |
| **Notes** | Unisoft team must sign NDA and DPA before accessing any project materials. |

---

### V-02: Translation Vendor (TBC)

| Field | Detail |
|-------|--------|
| **Vendor Name** | *(To Be Selected — See ADR-017)* |
| **Vendor ID** | V-02 |
| **Category** | Professional Translation Services |
| **Service Description** | Human translation of TwinMOS website content for Phase 2 (AR/BN/HI) and Phase 3 (RU/ZH-CN/FR) locales. Must include technical terminology glossary management and native speaker QA. |
| **Language Pairs** | English → Arabic (AR-AE), Bengali (BN-BD), Hindi (HI-IN), Russian (RU-RU), Simplified Chinese (ZH-CN), French (FR-FR) |
| **Selection Timeline** | ADR-017 decision by end of Month 4 (Phase 1) |
| **Required Certifications** | ISO 17100 (Translation services) preferred; proven tech/electronics translation experience |
| **Contract Document** | TwinMOSTranslationVendorMasterAgreement.md |
| **Engagement Start** | Phase 2 (Month 6+) |
| **Key Requirements** | XLIFF 2.0 or JSON format delivery; Translation Memory (TM) handover; TwinMOS terminology glossary compliance |
| **Action Required** | Issue RFP to 3+ qualified vendors; select by Month 4 |

---

### V-03: Penetration Test Vendor (TBC)

| Field | Detail |
|-------|--------|
| **Vendor Name** | *(To Be Selected)* |
| **Vendor ID** | V-03 |
| **Category** | Security Testing — Penetration Testing |
| **Service Description** | OWASP-methodology web application penetration testing. Three engagements: pre-launch (Phase 1), post-Phase 2 launch, post-Phase 3 launch. |
| **Required Certifications** | CREST Certified Web Application Tester (CCWAT) or OSCP or equivalent |
| **Scope per Engagement** | OWASP Top 10 testing; API security testing; authentication bypass testing; infrastructure review |
| **Deliverables** | Written vulnerability report; CVSS-scored findings; remediation recommendations; executive summary |
| **Contract Document** | TwinMOSPenetrationTestVendorAgreement.md (to be created) |
| **Engagement 1** | Month 4–5 (pre-launch) |
| **Engagement 2** | Month 8–9 (post-Phase 2) |
| **Engagement 3** | Month 14–15 (post-Phase 3) |
| **Action Required** | Issue RFP by Month 3; select and execute agreement by Month 4 |

---

## Section 2: Infrastructure & Hosting Vendors

---

### V-04: Hetzner Online GmbH

| Field | Detail |
|-------|--------|
| **Vendor Name** | Hetzner Online GmbH |
| **Vendor ID** | V-04 |
| **Category** | Cloud Hosting — VPS Provider |
| **Website** | https://www.hetzner.com |
| **Support Portal** | https://console.hetzner.cloud |
| **Support Email** | support@hetzner.com |
| **Support Phone** | +49 9831 505-0 |
| **Support Hours** | 24/7 |
| **Service Used** | Cloud VPS — hosting Strapi CMS, Meilisearch, imgproxy, Coolify (managed via Coolify) |
| **Server Type** | CX31 minimum (4 vCPU, 8 GB RAM, 160 GB SSD) or higher based on load |
| **Data Centre Region** | EU (Germany or Finland preferred for GDPR compliance) |
| **Account Owner** | TwinMOS IT/Technical Lead (ST-07) |
| **Account Email** | *(To be registered — TwinMOS IT email)* |
| **Billing** | Monthly, credit card or SEPA direct debit |
| **Documentation** | https://docs.hetzner.com |
| **Provisioning Guide** | [TwinMOSWebsiteHetznerVPS_Provisioning.md](../../H%20-%20DevOps%2C%20Infrastructure%20and%20Hosting/H.3%20-%20Hosting%20and%20Infrastructure/TwinMOSWebsiteHetznerVPS_Provisioning.md) |
| **Notes** | Hetzner selected for cost-efficiency (10–20× cheaper than AWS for equivalent spec) and European data residency for GDPR compliance. |

---

### V-05: Cloudflare Inc.

| Field | Detail |
|-------|--------|
| **Vendor Name** | Cloudflare, Inc. |
| **Vendor ID** | V-05 |
| **Category** | CDN, DNS, DDoS Protection, Frontend Hosting |
| **Website** | https://www.cloudflare.com |
| **Dashboard** | https://dash.cloudflare.com |
| **Support Portal** | https://support.cloudflare.com |
| **Support Tier** | Pro (for WAF + higher rate limits) or Business (for custom WAF rules) |
| **Services Used** | DNS management; CDN for static assets; DDoS protection; Cloudflare Pages (frontend hosting); Cloudflare Turnstile (CAPTCHA); WAF |
| **Domain** | twinmos.com (to be transferred to Cloudflare DNS) |
| **Account Owner** | TwinMOS IT/Technical Lead (ST-07) |
| **Account Email** | *(To be registered — TwinMOS IT email)* |
| **Billing** | Monthly (Pro plan ~$20/month; Business ~$200/month) |
| **Documentation** | https://developers.cloudflare.com |
| **Configuration Guide** | [TwinMOSWebsiteCloudflarePages_Configuration.md](../../H%20-%20DevOps%2C%20Infrastructure%20and%20Hosting/H.3%20-%20Hosting%20and%20Infrastructure/TwinMOSWebsiteCloudflarePages_Configuration.md) |
| **Notes** | Cloudflare Pages serves the Astro-built static frontend globally. Pages is free tier for unlimited sites and requests. |

---

### V-06: Backblaze Inc.

| Field | Detail |
|-------|--------|
| **Vendor Name** | Backblaze, Inc. |
| **Vendor ID** | V-06 |
| **Category** | Object Storage (S3-compatible) |
| **Website** | https://www.backblaze.com |
| **Dashboard** | https://secure.backblaze.com/b2_buckets.htm |
| **Support Email** | support@backblaze.com |
| **Services Used** | Backblaze B2 Cloud Storage — product images, datasheets, marketing assets, CMS media |
| **S3 Compatibility** | Yes — Backblaze B2 is S3-compatible; imgproxy connects via S3 API |
| **Bucket Structure** | `twinmos-media` (images), `twinmos-docs` (datasheets/PDFs) |
| **Account Owner** | TwinMOS IT/Technical Lead (ST-07) |
| **Billing** | Pay-as-you-go: $6/TB/month storage; $0.01/GB egress (first 1 GB/day free via Cloudflare) |
| **Cloudflare Partnership** | Backblaze B2 + Cloudflare CDN egress is free via Bandwidth Alliance |
| **Documentation** | https://www.backblaze.com/b2/docs/ |
| **Notes** | Significantly cheaper than AWS S3 for media storage. Cloudflare Bandwidth Alliance means no egress fees when served via Cloudflare CDN. |

---

### V-07: GitHub (Microsoft Corporation)

| Field | Detail |
|-------|--------|
| **Vendor Name** | GitHub, Inc. (a Microsoft subsidiary) |
| **Vendor ID** | V-07 |
| **Category** | Source Control, CI/CD, Project Management |
| **Website** | https://github.com |
| **Dashboard** | https://github.com/[twinmos-org] *(organisation to be created)* |
| **Support** | https://support.github.com |
| **Plan** | GitHub Team (for private repos, required review protections, and branch rules) |
| **Services Used** | Git repository hosting; GitHub Actions (CI/CD); GitHub Issues (bug tracking); Branch Protection Rules; Dependabot |
| **Organisation Name** | *(To be set up — e.g., `twinmos-web`)* |
| **Account Owner** | TwinMOS IT/Technical Lead (ST-07) |
| **Billing** | $4/user/month (Team plan) |
| **Branch Protection** | [TwinMOSWebsiteBranchProtectionRules.md](../../H%20-%20DevOps%2C%20Infrastructure%20and%20Hosting/H.2%20-%20CI-CD/TwinMOSWebsiteBranchProtectionRules.md) |
| **CI/CD Spec** | [TwinMOSWebsiteGitHubActionsWorkflows_Spec.md](../../H%20-%20DevOps%2C%20Infrastructure%20and%20Hosting/H.2%20-%20CI-CD/TwinMOSWebsiteGitHubActionsWorkflows_Spec.md) |

---

## Section 3: Application & SaaS Vendors

---

### V-08: Resend

| Field | Detail |
|-------|--------|
| **Vendor Name** | Resend |
| **Vendor ID** | V-08 |
| **Category** | Transactional Email Service |
| **Website** | https://resend.com |
| **Dashboard** | https://resend.com/overview |
| **Support** | support@resend.com; https://resend.com/docs |
| **Plan** | Free (3,000 emails/month) or Pro ($20/month for 50,000 emails) |
| **Services Used** | Sending transactional emails: RMA confirmations, warranty registration, contact form receipts, newsletter signups, distributor inquiries |
| **API Type** | REST API with official JavaScript SDK |
| **Account Owner** | TwinMOS IT/Technical Lead (ST-07) |
| **From Domain** | notifications@twinmos.com *(to be configured with DNS verification)* |
| **Integration Spec** | TwinMOSWebsiteIntegrationSpec_Resend_Email.md (to be created) |
| **Notes** | Developer-friendly transactional email. React Email compatible for HTML template design. Selected over SendGrid for simplicity and pricing. |

---

### V-09: Google LLC (Analytics & Search Console)

| Field | Detail |
|-------|--------|
| **Vendor Name** | Google LLC |
| **Vendor ID** | V-09 |
| **Category** | Analytics, Search Intelligence |
| **Services Used** | Google Analytics 4 (GA4) — website traffic analytics; Google Search Console — SEO performance monitoring |
| **GA4 Property ID** | *(To be created — record ID here once set up)* |
| **Search Console Property** | https://twinmos.com *(to be verified)* |
| **Dashboard (GA4)** | https://analytics.google.com |
| **Dashboard (GSC)** | https://search.google.com/search-console |
| **Account Owner** | Marketing Director (ST-04) |
| **Admin Access** | IT/Technical Lead (ST-07); Unisoft Team Lead (ST-11) |
| **Cost** | Free |
| **Data Region** | EU (set during GA4 property creation for GDPR compliance) |
| **GDPR Note** | GA4 implementation must include cookie consent gate (no tracking before consent). GA4 data processing addendum required. |
| **Setup Guide** | TwinMOSWebsiteGA4_Dashboard_Setup.md (to be created) |

---

### V-10: Plausible Analytics

| Field | Detail |
|-------|--------|
| **Vendor Name** | Plausible Analytics OÜ |
| **Vendor ID** | V-10 |
| **Category** | Privacy-Friendly Web Analytics |
| **Website** | https://plausible.io |
| **Dashboard** | https://plausible.io/twinmos.com *(once configured)* |
| **Support** | hello@plausible.io |
| **Plan** | Business (~$19/month for up to 100K pageviews/month) |
| **Services Used** | Cookieless, GDPR-compliant basic traffic analytics. Complements GA4. |
| **Account Owner** | TwinMOS IT/Technical Lead (ST-07) |
| **Data Storage** | EU servers only |
| **GDPR Note** | Cookieless by design — no consent banner required for Plausible tracking. |
| **Setup Guide** | TwinMOSWebsitePlausible_Configuration.md (to be created) |

---

### V-11: Sentry (Functional Software, Inc.)

| Field | Detail |
|-------|--------|
| **Vendor Name** | Functional Software, Inc. (trading as Sentry) |
| **Vendor ID** | V-11 |
| **Category** | Application Error Monitoring & Performance Tracing |
| **Website** | https://sentry.io |
| **Dashboard** | https://sentry.io/organizations/twinmos/ *(once configured)* |
| **Support** | support@sentry.io |
| **Plan** | Team ($26/month) or Business ($80/month) |
| **Services Used** | Frontend error tracking (Astro/React); Strapi backend error monitoring; performance tracing |
| **Account Owner** | TwinMOS IT/Technical Lead (ST-07) |
| **Integrations** | GitHub (for release tracking and issue links); Slack (for error alerts) |
| **GDPR Note** | Data Processing Agreement available; set data region to EU. |
| **Setup Guide** | TwinMOSWebsiteSentry_Configuration_Guide.md (to be created) |

---

### V-12: Cloudflare Turnstile

| Field | Detail |
|-------|--------|
| **Vendor Name** | Cloudflare, Inc. |
| **Vendor ID** | V-12 |
| **Category** | CAPTCHA / Bot Protection |
| **Website** | https://www.cloudflare.com/products/turnstile/ |
| **Documentation** | https://developers.cloudflare.com/turnstile/ |
| **Plan** | Free (1M challenges/month) |
| **Services Used** | Human verification on all TwinMOS website forms: Contact, RMA, Warranty Registration, Distributor Application, Newsletter Signup |
| **Account** | Included in Cloudflare account (V-05) |
| **Integration Spec** | TwinMOSWebsiteIntegrationSpec_Cloudflare_Turnstile.md (to be created) |
| **Notes** | Privacy-preserving alternative to Google reCAPTCHA. Requires no cookie consent. |

---

### V-13: Stripe Inc. (Phase 3)

| Field | Detail |
|-------|--------|
| **Vendor Name** | Stripe, Inc. |
| **Vendor ID** | V-13 |
| **Category** | Payment Processing |
| **Website** | https://stripe.com |
| **Dashboard** | https://dashboard.stripe.com |
| **Support** | https://support.stripe.com |
| **Plan** | Standard (2.9% + $0.30 per transaction) |
| **Engagement** | Phase 3 only (e-commerce enablement) |
| **Services Used** | Online payment processing for TwinMOS direct sales portal (Medusa Commerce integration) |
| **Account Owner** | TBC (Sales Director or Finance) |
| **Required Regions** | UAE (Stripe Atlas or Stripe Connect); India (Stripe India or local PSP); Global |
| **Integration Spec** | TwinMOSWebsiteIntegrationSpec_Stripe_Payment.md (to be created, Phase 3) |
| **Notes** | Stripe availability in UAE requires Stripe Atlas or a UAE-registered business entity. Verify feasibility before Phase 3 planning. Alternative: Telr (UAE-native payment gateway). |

---

### V-14: UptimeRobot

| Field | Detail |
|-------|--------|
| **Vendor Name** | UptimeRobot |
| **Vendor ID** | V-14 |
| **Category** | Uptime Monitoring |
| **Website** | https://uptimerobot.com |
| **Dashboard** | https://dashboard.uptimerobot.com |
| **Plan** | Pro ($7/month) — 1-minute check intervals, 50 monitors, SMS alerts |
| **Services Used** | HTTP/HTTPS uptime monitoring for twinmos.com, Strapi API, and all microservices |
| **Monitored Endpoints** | twinmos.com, api.twinmos.com (Strapi), search.twinmos.com (Meilisearch), cdn assets |
| **Account Owner** | TwinMOS IT/Technical Lead (ST-07) |
| **Alert Recipients** | IT Lead + Unisoft Team Lead |
| **Status Page** | Public status page at status.twinmos.com (optional — configure in Phase 1) |
| **Notes** | Simple, reliable uptime monitoring. Complements Sentry for availability tracking vs error tracking. |

---

### V-15: Figma (Autodesk, Inc.)

| Field | Detail |
|-------|--------|
| **Vendor Name** | Figma, Inc. (acquired by Autodesk 2024) |
| **Vendor ID** | V-15 |
| **Category** | Design Collaboration Platform |
| **Website** | https://www.figma.com |
| **Dashboard** | https://www.figma.com/files *(TwinMOS team)* |
| **Plan** | Professional ($12/editor/month) or Organisation ($45/editor/month) |
| **Services Used** | UI/UX design; wireframing; high-fidelity mockups; design system (component library, tokens); developer handoff |
| **Account Owner** | Marketing Director (ST-04) |
| **Design Access** | Unisoft developers (view-only or Dev Mode access) |
| **Design Files Index** | [TwinMOSWebsiteFigmaDesignFiles_Index.md](../../E%20-%20Design%20and%20UX/E.2%20-%20Wireframes%20and%20Mockups/TwinMOSWebsiteFigmaDesignFiles_Index.md) |
| **Notes** | Design tokens from Figma feed directly into Tailwind CSS and Astro component styles via Figma Tokens plugin or Style Dictionary. |

---

## Section 4: Open-Source Platforms (Self-Hosted)

These are not paid vendors but open-source platforms self-hosted on Hetzner VPS (V-04) via Coolify. Support is community-based unless commercial support is purchased.

| Platform | Role | Version Target | Documentation | Support Channel |
|----------|------|---------------|---------------|-----------------|
| **Strapi** | Headless CMS | v5.x LTS | https://docs.strapi.io | https://forum.strapi.io |
| **Meilisearch** | Product & KB Search | v1.x | https://www.meilisearch.com/docs | GitHub Issues |
| **imgproxy** | Image Processing | v3.x | https://docs.imgproxy.net | GitHub Issues |
| **Coolify** | Self-Hosted PaaS | v4.x | https://coolify.io/docs | https://discord.gg/coolify |
| **PostgreSQL** | Database (Strapi) | v15+ | https://www.postgresql.org/docs | Community |
| **Redis** | Cache / Sessions | v7.x | https://redis.io/docs | Community |
| **Medusa** | Headless Commerce | v2.x | https://docs.medusajs.com | Discord (Phase 3) |
| **Chatwoot** | Live Chat | Latest | https://www.chatwoot.com/docs | GitHub (Phase 3) |

---

## Section 5: Domain & DNS Registrar

| Field | Detail |
|-------|--------|
| **Domain** | twinmos.com |
| **Current Registrar** | *(To be confirmed — check existing registrar before DNS migration)* |
| **Target DNS Management** | Cloudflare (V-05) — transfer nameservers to Cloudflare |
| **Domain Expiry** | *(To be confirmed — verify domain renewal date before go-live)* |
| **Account Owner** | TwinMOS IT/Technical Lead (ST-07) |
| **Renewal Responsibility** | TwinMOS IT Lead — set calendar reminder 60 days before expiry |
| **DNS Migration Plan** | [TwinMOSWebsiteDNSMigrationPlan.md](../../M%20-%20Marketing%2C%20Launch%20and%20Go-Live/M.1%20-%20Pre-Launch/TwinMOSWebsiteDNSMigrationPlan.md) |
| **Key Subdomains** | twinmos.com, www.twinmos.com, api.twinmos.com, cdn.twinmos.com, status.twinmos.com |

---

## Section 6: CRM Vendor (Decision Pending)

| Field | Detail |
|-------|--------|
| **Status** | Pending — ADR-012 (CRM Selection) must be resolved by Month 2 |
| **Options Under Evaluation** | HubSpot (Free/Starter CRM); Zoho CRM (Standard) |
| **HubSpot Website** | https://www.hubspot.com |
| **Zoho CRM Website** | https://www.zoho.com/crm |
| **Purpose** | Lead capture from website forms (contact, distributor application, RMA enquiry); pipeline management |
| **Integration Spec** | TwinMOSWebsiteIntegrationSpec_TwinMOS_CRM.md (to be created after ADR-012) |
| **Decision Owner** | Sales Director (ST-05) with input from IT Lead (ST-07) |
| **Decision Deadline** | End of Sprint 1 (Week 2) |

---

## Vendor Account Credentials Policy

1. All vendor accounts **must** be registered under a **TwinMOS business email** (not personal email or Unisoft email).
2. All API keys, tokens, and passwords are stored exclusively in the **Coolify secrets manager** or a designated password vault. Never in code repositories.
3. MFA (Multi-Factor Authentication) must be enabled on all vendor accounts where available.
4. Upon Unisoft engagement end, all shared credentials must be rotated within 5 business days.
5. See [TwinMOSWebsiteKeyManagementPlan.md](../../I%20-%20Security%20and%20Compliance/I.1%20-%20Security%20Architecture/TwinMOSWebsiteKeyManagementPlan.md) for full secrets management policy.

---

## Vendor Review Schedule

| Vendor | Review Frequency | Next Review | Owner |
|--------|-----------------|-------------|-------|
| Unisoft | Bi-weekly (active delivery) | Sprint 2 | GM (ST-02) |
| Hetzner | Quarterly (billing/capacity review) | Month 3 | IT Lead |
| Cloudflare | Quarterly (security/performance review) | Month 3 | IT Lead |
| GitHub | Annually (plan review) | Month 12 | IT Lead |
| Sentry, Plausible, UptimeRobot | Annually | Month 12 | IT Lead |
| Translation Vendor | Per phase deliverable | Phase 2 completion | Marketing Director |
| Pen-Test Vendor | Per engagement | Pre-launch (Month 5) | IT Lead |
| Stripe | Phase 3 kickoff | Month 10 | Sales Director |

---

*Document Reference: TWN-REF-VENDORS-2026-001 | Version 1.0 | 1 May 2026 | Classification: CONFIDENTIAL — Project Management Team Only*

*Update this document whenever a vendor account is created, a contract is executed, or a platform decision changes.*
