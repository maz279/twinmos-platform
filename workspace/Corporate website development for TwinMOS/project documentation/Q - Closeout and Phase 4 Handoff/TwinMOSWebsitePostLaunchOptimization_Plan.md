# TwinMOS Corporate Website — Post-Launch Optimization Plan

**Document Reference:** TWN-Q-OPTPLAN-2026-001  
**Version:** 1.0  
**Date:** October 2027 (Phase 4 Planning — at Phase 3 Closeout)  
**Prepared by:** TwinMOS Digital Transformation Team  
**Reviewed by:** Unisoft Solutions Ltd. — Team Lead  
**Classification:** CONFIDENTIAL — Internal Use Only  
**Distribution:** Executive Leadership, TwinMOS PM, Marketing Director, TwinMOS IT Lead, Unisoft (if Phase 4 retained)  
**Parent Documents:** TWN-Q-P4BACKLOG-2026-001, TWN-Q-P4RETAINER-2026-001, TWN-PM-CHARTER-2026-001  

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | September 2027 | TwinMOS PM + Marketing Director | Initial draft |
| 1.0 | October 2027 | TwinMOS Digital Transformation Team | Final approved plan |

---

## Executive Summary

TwinMOS's corporate website (twinmos.com) has been rebuilt, optimized across three phases, and is now live as a fully operational, enterprise-grade digital platform. Phase 3 concluded in October 2027 with Lighthouse scores of 96/97/98/99 (Performance/Accessibility/Best Practices/SEO), $67,400 monthly e-commerce revenue, and 7 active locales.

This Post-Launch Optimization Plan defines **how TwinMOS will grow the platform from its current state into a best-in-class digital asset** during Phase 4 (Month 16 onwards). It translates the Phase 4 Backlog into a **time-phased, measurable optimization roadmap** aligned to TwinMOS's strategic business objectives.

**Phase 4 Optimization Objective:** Grow organic traffic from the current +1,340% baseline (Phase 3 vs. original broken site) to a sustained +2,500% growth trajectory by end of Phase 4 Year 1 (October 2028), while expanding e-commerce revenue to $150K/month and extending locale coverage to 10 active languages.

---

## 1. Phase 4 Optimization Framework

### 1.1 Strategic Pillars

| Pillar | Definition | Primary Metric |
|--------|-----------|----------------|
| **Reach** | Expand the audience through new locales, SEO content, and organic discovery | Monthly organic sessions |
| **Convert** | Turn visitors into leads, applications, and customers through CRO | Lead conversion rate; e-commerce CVR |
| **Retain** | Keep customers and partners engaged through loyalty, portal, and automation | Loyalty programme retention rate |
| **Trust** | Strengthen brand credibility through content, social proof, and compliance | Brand search volume; return visit rate |
| **Platform Health** | Keep the technical platform secure, performant, and up-to-date | Lighthouse scores; uptime; CVE backlog |

### 1.2 Phase 4 Success KPIs

| KPI | Phase 3 Achieved | Phase 4 Year 1 Target (Oct 2028) | Phase 4 Year 2 Target (Oct 2029) |
|-----|-----------------|----------------------------------|----------------------------------|
| Lighthouse Performance | 96 | 95+ (maintained) | 95+ (maintained) |
| Lighthouse Accessibility | 97 | WCAG 2.2 AA compliant | WCAG 2.2 AA maintained |
| Monthly Organic Sessions | +1,340% vs. baseline | +2,500% vs. original baseline | +4,000% |
| Monthly Leads Generated | 218 | 350+ | 500+ |
| Monthly Distributor Applications | 31 | 50+ | 75+ |
| Monthly E-Commerce Revenue | $67,400 | $150,000+ | $300,000+ |
| Active Loyalty Members | 1,240 | 5,000+ | 15,000+ |
| Active Partner Portal Users | 47 partners | 80+ partners | 120+ partners |
| Active Languages | 7 (EN, AR, BN, HI, RU, ZH, FR) | 10 (+ ES, PT, DE) | 10 (maintained) |
| Uptime | 99.97% | 99.97%+ | 99.99% |
| Monthly SN-Check Verifications | 4,120 | 7,000+ | 12,000+ |

---

## 2. Quarter-by-Quarter Optimization Roadmap

### 2.1 Q1 Phase 4 — Foundation Hardening (Nov 2027 – Jan 2028)

**Theme:** Security, compliance, and infrastructure hygiene. Establish Phase 4 operational cadence. Prepare locale expansion.

#### Sprint Focus Areas

**Week 1–2: Security & Dependency Hardening**

| Task | Priority | Owner | Effort |
|------|----------|-------|--------|
| Configure Dependabot automated vulnerability scanning (BL-05-009) | Critical | TwinMOS IT Lead / Phase 4 vendor | 8 hrs |
| npm audit automation in CI pipeline (fail build on high CVEs) | Critical | Phase 4 vendor | 4 hrs |
| PostgreSQL LTS upgrade (16 → 17) (BL-05-003) | High | Phase 4 vendor | 8 hrs |
| Rotate all production credentials (post-handover 7-day requirement) | Critical | TwinMOS IT Lead | 2 hrs |
| Review and close any open Dependabot PRs from handover period | High | TwinMOS IT Lead | 2 hrs |

**Week 3–6: WCAG 2.2 & Annual Penetration Test**

| Task | Priority | Owner | Effort |
|------|----------|-------|--------|
| Commission annual penetration test (BL-09-002) | High | TwinMOS IT Lead | 16 hrs (coordination + remediation) |
| WCAG 2.2 AA assessment against new success criteria (BL-09-001) | High | Phase 4 vendor | 24–40 hrs |
| Remediate WCAG 2.2 failures identified (Focus Not Obscured, Target Size Minimum, etc.) | High | Phase 4 vendor | As needed |
| Update accessibility statement to WCAG 2.2 AA | High | TwinMOS IT Lead + Legal | 2 hrs |
| Annual cookie consent compliance review (BL-09-003) | Medium | TwinMOS Legal | 2 weeks |

**Week 5–12: Spanish & Portuguese Locale Preparation**

| Task | Priority | Owner | Effort |
|------|----------|-------|--------|
| Brief translation vendor for ES + PT (batch together for efficiency) | High | TwinMOS PM | 8 hrs |
| Translation vendor contract addendum — per-batch delivery milestones | High | TwinMOS Legal | 4 hrs |
| Activate ES locale routing in Astro + Strapi (stub was pre-configured) | High | Phase 4 vendor | 8 hrs |
| Activate PT locale routing in Astro + Strapi | High | Phase 4 vendor | 8 hrs |
| Translation import pipeline pre-testing (ES + PT) | High | Phase 4 vendor | 8 hrs |

**Analytics & Reporting Setup**

| Task | Priority | Owner | Effort |
|------|----------|-------|--------|
| Configure PostHog advanced cohort analysis (BL-06-001) | High | Phase 4 vendor | 24 hrs |
| Deploy Metabase BI dashboard on Hetzner (BL-06-002) | High | Phase 4 vendor | 32–40 hrs |
| Configure Chairman/GM read-only Metabase accounts | High | TwinMOS IT Lead | 2 hrs |
| SEO monitoring dashboard setup — Google Search Console + Screaming Frog baseline | High | Phase 4 vendor / Marketing | 8 hrs |

**Q1 Target Outcomes:**
- Zero unaddressed high/critical CVEs in CI pipeline
- Annual pen test completed and all critical/high findings remediated
- WCAG 2.2 AA compliant
- ES + PT translation in progress with vendor; expected Q2 delivery
- PostHog advanced dashboards live
- Metabase BI dashboard live for Chairman + GM

---

### 2.2 Q2 Phase 4 — Locale Launch & CRO Programme (Feb 2028 – Apr 2028)

**Theme:** Spanish + Portuguese locale launches. CRO experiments begin driving conversion improvement.

#### Sprint Focus Areas

**Spanish Launch (ES)**

| Task | Owner | Effort | KPI Impact |
|------|-------|--------|-----------|
| ES translation import into Strapi CMS (all 287+ pages) | Phase 4 vendor | 24 hrs engineering | Unlocks Spain + LATAM traffic |
| ES locale QA — all pages, forms, legal documents | Phase 4 vendor + TwinMOS Marketing | 24 hrs | |
| hreflang audit — ES locale tags (BL-02-005) | Phase 4 vendor | 8 hrs | |
| Google Search Console — ES locale sitemaps submitted | TwinMOS IT Lead | 2 hrs | |
| ES launch campaign infrastructure (BL-10-001) | Phase 4 vendor + Marketing | 16 hrs | Lead capture from ES market |
| Press release — ES/LATAM market entry | TwinMOS Marketing | Marketing scope | |

**Portuguese Launch (PT)**

| Task | Owner | Effort | KPI Impact |
|------|-------|--------|-----------|
| PT translation import into Strapi CMS | Phase 4 vendor | 24 hrs engineering | Unlocks Angola, Mozambique, Brazil |
| PT locale QA (both PT-PT and PT-BR variants reviewed) | Phase 4 vendor + in-market reviewers | 24 hrs | |
| hreflang audit — PT + PT-BR variant tags | Phase 4 vendor | 6 hrs | |
| Google Search Console — PT sitemaps submitted | TwinMOS IT Lead | 2 hrs | |
| Angola-specific content review | Africa Sales Lead | Content scope | |

**CRO Programme Launch (BL-02-002)**

| Task | Owner | Effort | KPI Impact |
|------|-------|--------|-----------|
| PostHog experimentation module configuration | Phase 4 vendor | 8 hrs | Enables A/B tests |
| CRO programme charter — first 3 experiments defined | TwinMOS PM + Marketing | 4 hrs | |
| **Experiment 1:** Hero CTA button copy + placement | Phase 4 vendor | 12 hrs | +lead capture CVR |
| **Experiment 2:** Product detail page "Where to Buy" CTA prominence | Phase 4 vendor | 12 hrs | +distributor inquiries |
| **Experiment 3:** Compatibility Finder results page UX | Phase 4 vendor | 16 hrs | -bounce rate |
| CRO experiment dashboard in PostHog | Phase 4 vendor | 4 hrs | |

**SEO Content Programme (BL-02-003)**

| Task | Owner | Effort |
|------|-------|--------|
| SEO keyword research — identify 20 high-value long-tail targets | TwinMOS Marketing + SEO consultant | 16 hrs |
| Content calendar approved by Marketing Director | TwinMOS Marketing | 4 hrs |
| First 5 long-tail articles published (CMS authored by Marketing) | TwinMOS Marketing (content) | Marketing scope |
| Internal linking strategy from existing 287 pages to new articles | Phase 4 vendor | 8 hrs |

**Q2 Target Outcomes:**
- Spanish locale live and indexed (target: 15,000+ monthly ES organic sessions within 90 days)
- Portuguese locale live and indexed (target: 8,000+ monthly PT sessions within 90 days)
- 3 active CRO experiments running
- 5 long-tail SEO articles published
- First CRO experiment results report delivered to Marketing Director

---

### 2.3 Q3 Phase 4 — Commerce Expansion & Loyalty Deepening (May 2028 – Jul 2028)

**Theme:** E-commerce market expansion. Loyalty tier upgrade. German locale.

#### Sprint Focus Areas

**German Locale Launch (BL-01-003)**

| Task | Owner | Effort |
|------|-------|--------|
| Brief translation vendor for DE | TwinMOS PM | 4 hrs |
| DSGVO-specific legal review (German privacy law compliance) | TwinMOS Legal | 2 weeks |
| DE translation import + QA | Phase 4 vendor + German reviewer | 40–60 hrs engineering + review |
| DE locale live — target European DACH market | Phase 4 vendor | 8 hrs |

**Advanced Loyalty Tiers — Bronze/Silver/Gold (BL-03-002)**

| Task | Owner | Effort | KPI Impact |
|------|-------|--------|-----------|
| Define tier thresholds and benefits (TwinMOS Marketing) | TwinMOS Marketing | 8 hrs | |
| Implement 3-tier state machine in loyalty engine | Phase 4 vendor | 40 hrs | Customer LTV increase |
| Tier upgrade/downgrade automated logic | Phase 4 vendor | 16 hrs | |
| Points redemption marketplace (discount codes, accessories) | Phase 4 vendor | 24 hrs | |
| Loyalty dashboard upgrade in customer account portal | Phase 4 vendor | 16 hrs | |
| Email drip for tier upgrades (Resend automation) | Phase 4 vendor | 8 hrs | |
| Loyalty tier launch campaign | TwinMOS Marketing | Marketing scope | |

**E-Commerce Market Expansion — Egypt (BL-03-001)**

| Task | Owner | Effort | Prerequisites |
|------|-------|--------|--------------|
| Egypt tax compliance brief (EGP + VAT) | External Egypt tax consultant | 1 week | Finance approval |
| EGP currency + local payment method (Stripe Egypt or local gateway) | Phase 4 vendor | 16 hrs | Payment gateway contract |
| Egypt regional content verification (existing Arabic locale covers Egypt) | Marketing | 4 hrs | |
| Egypt e-commerce launch | Phase 4 vendor + Finance | 8 hrs | |

**Customer Review System (BL-03-003)**

| Task | Owner | Effort | KPI Impact |
|------|-------|--------|-----------|
| Review collection type in Strapi | Phase 4 vendor | 8 hrs | |
| Review submission form (verified purchaser gate) | Phase 4 vendor | 12 hrs | Social proof improvement |
| Moderation queue in Strapi CMS | Phase 4 vendor | 8 hrs | |
| Review display on product pages (star rating + text) | Phase 4 vendor | 12 hrs | |
| Schema.org AggregateRating auto-generation | Phase 4 vendor | 6 hrs | Rich search results |
| 14-day post-purchase review request email | Phase 4 vendor | 4 hrs | |

**Astro 6 Upgrade (BL-05-002)**

| Task | Owner | Effort |
|------|-------|--------|
| Astro 6 migration guide review | Phase 4 vendor | 4 hrs |
| Staging upgrade + regression test | Phase 4 vendor | 12 hrs |
| Production upgrade (maintenance window) | Phase 4 vendor | 4 hrs |

**Q3 Target Outcomes:**
- German locale live (target: 10,000+ monthly DE sessions within 90 days)
- Loyalty tier system live — target 3,000 active tiered members by end of Q3
- Customer reviews on product pages — target 50+ reviews across top 20 products
- Egypt e-commerce active
- Astro 6 on production

---

### 2.4 Q4 Phase 4 — Platform Maturity & B2B Deepening (Aug 2028 – Oct 2028)

**Theme:** Platform resilience. B2B and enterprise features. Advanced analytics. Second annual review.

#### Sprint Focus Areas

**Strapi v6 Upgrade (BL-05-001) — if v6 is stable**

| Task | Owner | Effort |
|------|-------|--------|
| Strapi v6 migration guide review and plugin compatibility audit | Phase 4 vendor | 16 hrs |
| Staging upgrade with full regression test suite | Phase 4 vendor | 24 hrs |
| Production upgrade in scheduled maintenance window | Phase 4 vendor | 8 hrs |
| Post-upgrade monitoring — 2-week close watch | Phase 4 vendor | 8 hrs |

**Enterprise B2B Portal MVP (BL-08-001)**

| Task | Owner | Effort |
|------|-------|--------|
| Enterprise account tier in Better Auth | Phase 4 vendor | 8 hrs |
| Enterprise-specific product catalog (server ECC, industrial) | Phase 4 vendor | 16 hrs |
| RFQ workflow implementation | Phase 4 vendor | 24 hrs |
| Bulk quote tool (CSV BOM upload) | Phase 4 vendor | 16 hrs |
| Procurement documentation download hub | Phase 4 vendor | 8 hrs |
| Enterprise contact routing | Phase 4 vendor | 4 hrs |

**Whitepaper & Lead Generation Content (BL-04-004)**

| Task | Owner | Effort | KPI Impact |
|------|-------|--------|-----------|
| Lead-capture gating (already built in Phase 2) — enable for 4 whitepapers | Phase 4 vendor | 8 hrs | |
| Whitepaper PDFs produced (technical writers — TwinMOS scope) | TwinMOS Marketing | Marketing scope | |
| HubSpot CRM lead routing from whitepaper downloads | Phase 4 vendor | 8 hrs | B2B lead generation |
| GDPR-compliant consent recording | Phase 4 vendor | 4 hrs | |

**Annual Phase 4 Review & Renewal Decision**

| Task | Owner | Effort |
|------|-------|--------|
| Phase 4 Year 1 ROI Report produced | TwinMOS PM | 2 days |
| Updated Phase 4 Backlog — reprioritise for Year 2 | TwinMOS PM + Marketing | 4 hrs |
| Phase 4 retainer renewal decision | Chairman / GM | Meeting |
| Annual penetration test (Year 2) commissioned | TwinMOS IT Lead | 16 hrs |

**Q4 Target Outcomes:**
- Strapi v6 live (if stable at this point)
- Enterprise B2B portal MVP live — target 10+ enterprise accounts within 60 days
- 4 whitepapers published with lead-capture gating — target 150 new B2B leads
- Phase 4 Year 1 ROI Report approved by Chairman
- Phase 4 Year 2 plan defined

---

## 3. SEO & Content Marketing Optimization Plan

### 3.1 Keyword Strategy Framework

**Priority Tier 1 — High Commercial Intent:**

| Target Keyword Type | Examples | Pages to Optimize |
|--------------------|-----------|--------------------|
| Product comparison | "DDR5 vs DDR4 gaming performance", "NVMe Gen5 vs Gen4" | Learn Hub comparison pages |
| Best-for | "best RAM for gaming 2028", "best portable SSD for PS5" | Learn Hub buying guides |
| Brand + model | "TwinMOS VoltX DDR5 review", "CoreX Pro Gen5 benchmark" | Product detail pages |
| Problem-solving | "why is my RAM not detected", "how to enable XMP" | Support KB articles |

**Priority Tier 2 — High Informational Intent (Brand Building):**

| Target Keyword Type | Examples | Pages to Target |
|--------------------|-----------|--------------------|
| Education | "what is DDR5 on-die ECC", "PCIe Gen5 explained" | Technology Hub |
| Historical | "history of DDR memory", "NVMe evolution" | Learn Hub Explained section |
| Country/market-specific | "best SSD India 2028", "RAM upgrade UAE" | Regional pages |

**Priority Tier 3 — B2B/Partner Intent:**

| Target Keyword Type | Examples | Pages to Target |
|--------------------|-----------|--------------------|
| Distribution | "memory distributor UAE", "SSD supplier Africa" | Partners section |
| OEM/ODM | "custom RAM manufacturer", "flash drive ODM supplier" | OEM/ODM pages |
| Enterprise | "server ECC memory supplier", "enterprise SSD vendor" | Solutions Hub |

### 3.2 Content Velocity Target

| Period | New Articles | Article Type | Author |
|--------|-------------|--------------|--------|
| Q1 Phase 4 | 5 articles | SEO long-tail — buying guides | TwinMOS Marketing |
| Q2 Phase 4 | 8 articles | Product comparisons + regional | TwinMOS Marketing |
| Q3 Phase 4 | 8 articles | Technical explanations + benchmarks | TwinMOS Marketing + Technical writers |
| Q4 Phase 4 | 6 articles | Case studies + whitepaper content | TwinMOS Marketing |
| **Year 1 Total** | **27 new articles** | Mixed | TwinMOS Marketing |

### 3.3 Technical SEO Monthly Actions

| Action | Tool | Frequency |
|--------|------|-----------|
| Crawl audit for broken links / 404s | Screaming Frog | Monthly |
| Google Search Console — index coverage errors | GSC | Monthly |
| Core Web Vitals CrUX data review | PageSpeed Insights | Monthly |
| Structured data validation | Google Rich Results Test (sample 10 pages) | Monthly |
| Backlink profile audit — toxic links disavow | Ahrefs or Semrush | Quarterly |
| hreflang validation | hreflang.org validator or Screaming Frog | Monthly (after any locale change) |
| Competitor SERP position tracking (top 50 keywords) | Ahrefs / Semrush | Monthly |

### 3.4 Link Building Strategy

**Phase 4 Target: +200 high-quality editorial backlinks in Year 1**

| Channel | Target | Approach |
|---------|--------|---------|
| Technology press (Tom's Hardware, AnandTech, TechRadar) | 15–20 editorial links | Benchmark publication outreach; product launch coverage |
| Regional tech media (India, UAE, Africa) | 40–60 editorial links | Product launch press releases; distributor announcements |
| Gaming / YouTuber partnerships | 10–15 review links | VoltX DDR5 product review samples |
| Industry / distributor websites | 50–80 partner links | Partner programme co-promotion |
| Whitepaper citations | 20–40 links | Technical whitepapers cited by industry publications |
| Event coverage (Computex, GITEX, CES) | 15–25 links | Post-event press coverage |

---

## 4. Conversion Rate Optimization (CRO) Programme

### 4.1 CRO Methodology

All CRO experiments follow the ICE scoring framework (Impact × Confidence × Ease) for prioritisation, and are executed using **PostHog's built-in A/B testing feature flags**.

**Standard Experiment Process:**
1. Hypothesis documented (e.g., "Changing CTA button from 'Learn More' to 'Get Pricing' will increase Distributor Inquiry form submissions by 20%")
2. Success metric defined (primary KPI + guardrail metrics)
3. Sample size calculator confirms required traffic volume for statistical significance (95%)
4. Experiment live for minimum 2 weeks
5. Results reviewed by Marketing Director
6. Winner implemented permanently; documentation updated

### 4.2 Year 1 CRO Experiment Pipeline

| Experiment | Page/Section | Hypothesis | Primary Metric |
|------------|-------------|------------|----------------|
| Hero CTA text | Homepage hero | "Get Pricing Now" vs "Explore Products" | Distributor inquiry CTR |
| Product CTA placement | All product detail pages | CTA in sticky sidebar vs. below specs | "Where to Buy" click rate |
| Compatibility Finder UX | Compatibility Finder | Step-by-step wizard vs. single form | Finder completion rate |
| Distributor form length | Distributor application | 5-field vs. 12-field form | Form submission rate |
| Loyalty programme visibility | Homepage trust band | Display loyalty member count | Loyalty sign-up rate |
| Pricing display (e-commerce) | Product pages | Show price in local currency by default vs. USD | Add to cart rate |
| Product comparison prompt | Category pages | Inline comparison CTA vs. floating sidebar | Comparison tool usage |
| Social proof positioning | Product pages | Customer review count above fold vs. below fold | Time on page + Add to cart |

### 4.3 CRO Success Targets (Year 1)

| Metric | Phase 3 Baseline | CRO Year 1 Target | Lift Required |
|--------|-----------------|-------------------|---------------|
| Homepage → Distributor inquiry conversion | [Phase 3 baseline from PostHog] | +25% | Achievable with Hero CTA + form experiments |
| Product page → Where to Buy click rate | [Phase 3 baseline] | +30% | Achievable with CTA placement experiment |
| Compatibility Finder completion rate | 58% | 72% | +24% — finder UX improvement |
| E-commerce Add to Cart rate | [Phase 3 baseline] | +20% | Pricing display + social proof experiments |

---

## 5. E-Commerce Growth Plan

### 5.1 Revenue Growth Roadmap

| Quarter | Target Monthly Revenue | Key Drivers |
|---------|----------------------|------------|
| Q1 Phase 4 (Nov–Jan) | $80,000+ | Phase 3 organic growth continuation; loyalty tier launch preparation |
| Q2 Phase 4 (Feb–Apr) | $100,000+ | ES + PT locale launch driving LATAM/Angola market; loyalty tier programme live |
| Q3 Phase 4 (May–Jul) | $120,000+ | Egypt market live; customer reviews driving social proof; German locale orders |
| Q4 Phase 4 (Aug–Oct) | $150,000+ | Full 10-locale coverage; enterprise B2B portal orders; whitepaper-driven B2B leads converting |

### 5.2 Average Order Value Improvement Strategies

| Strategy | Implementation | Expected AOV Impact |
|----------|---------------|---------------------|
| Product bundles (RAM + SSD kits) | Medusa.js bundle product type | +15–20% AOV |
| "Frequently Bought Together" (post-AI-recs MVP) | Manual curated recommendations | +10% AOV |
| Loyalty points incentive on premium products | Loyalty programme config | +5–8% AOV |
| Free shipping threshold messaging | Checkout UI enhancement | +12% AOV (reduced cart abandonment) |
| Installment/BNPL option (Tabby/Tamara in MENA) | BNPL integration (BL-03-004) | +10–15% CVR for high-value items |

### 5.3 Customer Retention (E-Commerce)

| Initiative | Mechanism | KPI |
|------------|-----------|-----|
| Post-purchase onboarding email series | Resend 3-email sequence | 30-day repeat purchase rate |
| Loyalty tier milestone notifications | Resend triggered by tier upgrade | Tier engagement rate |
| Win-back campaign (90+ days dormant) | Resend triggered by inactivity | Win-back rate |
| Birthday/anniversary discount | Resend + loyalty system | Anniversary campaign CVR |
| Product care guides post-purchase | Email D+7 after delivery | Return rate reduction |

---

## 6. Partner & Distributor Growth Plan

### 6.1 Partner Acquisition Target

| Quarter | New Partners Target | Cumulative Active Partners |
|---------|--------------------|-----------------------------|
| Q1 Phase 4 | +10 | 57+ |
| Q2 Phase 4 | +12 (ES + PT market expansion) | 69+ |
| Q3 Phase 4 | +10 (DE + Egypt expansion) | 79+ |
| Q4 Phase 4 | +8 | 87+ |

### 6.2 Partner Portal Enhancement Roadmap

| Enhancement | Quarter | Expected Impact |
|-------------|---------|----------------|
| Self-service partner tier upgrade request | Q2 | Reduce GM approval workload |
| Co-op advertising request module | Q2 | Enable distributor-led campaigns |
| Partner training library (video + quiz) | Q3 | Partner product knowledge improvement |
| Partner monthly newsletter via CMS | Q1 (immediate) | Portal engagement increase |
| Partner performance dashboard (their own sales data) | Q4 | Partner satisfaction increase |

---

## 7. Platform Health Continuous Improvement Plan

### 7.1 Performance Maintenance Targets

| Metric | Current (Phase 3 End) | Phase 4 Year 1 Minimum | Phase 4 Year 2 Aspirational |
|--------|----------------------|------------------------|------------------------------|
| Lighthouse Performance | 96 | 95+ | 97+ |
| LCP | 1.3s | < 1.5s | < 1.2s |
| CLS | 0.01 | < 0.05 | < 0.01 |
| INP | 72ms | < 100ms | < 72ms |
| Uptime | 99.97% | 99.97%+ | 99.99% |
| API response time (Strapi) | < 200ms p95 | < 200ms p95 | < 150ms p95 |

### 7.2 Quarterly Technical Health Checklist

| Area | Check | Tool |
|------|-------|------|
| Performance | Lighthouse CI scores; CrUX field data | GitHub Actions + PageSpeed Insights |
| Security | OWASP ZAP scan; Dependabot CVE status | ZAP + GitHub Dependabot |
| SEO | Screaming Frog crawl + Search Console errors | Screaming Frog + GSC |
| Database | Slow query analysis; index utilization | PostgreSQL EXPLAIN ANALYZE |
| Search | MeiliSearch document count vs. Strapi count | MeiliSearch API + Strapi |
| Backups | Restore test from latest backup | `scripts/restore.sh` on test env |
| Dependencies | npm audit result; Snyk report | npm + Snyk |
| Accessibility | axe-core automated scan (CI) | axe-core in GitHub Actions |

---

## 8. Investment and Resource Plan (Phase 4 Year 1)

### 8.1 Retainer Engineering Investment

| Quarter | Engineering Hours | Focus Allocation | Key Deliverables |
|---------|-----------------|-----------------|-----------------|
| Q1 | 240 hrs (80/mo × 3) | Security (20%), Analytics (30%), ES/PT prep (30%), Maintenance (20%) | Pen test remediation; WCAG 2.2; PostHog; Metabase |
| Q2 | 240 hrs | ES/PT launch (40%), CRO (25%), SEO infra (15%), Maintenance (20%) | ES + PT live; CRO experiments 1–3 |
| Q3 | 240 hrs | Loyalty tiers (25%), DE launch (25%), Egypt e-com (20%), Maintenance (30%) | Tiered loyalty; DE live; Egypt market |
| Q4 | 240 hrs | Enterprise B2B (35%), Strapi v6 (20%), Whitepapers (20%), Maintenance (25%) | Enterprise portal MVP; Strapi v6; whitepapers |
| **Year 1 Total** | **960 hrs** | | **10 active locales; loyalty tiers; enterprise portal; CRO programme** |

> Actual costs per TWN-Q-P4RETAINER-2026-001 §7 fee schedule. Specific fee amounts in Finance system.

### 8.2 Infrastructure Cost Projections (Phase 4 Year 1)

| Service | Current Monthly | Phase 4 Year 1 Projected | Notes |
|---------|----------------|--------------------------|-------|
| Hetzner VPS | ~€50 | ~€65–80 | Metabase + PostHog increased resource usage |
| Cloudflare Pages | ~$20 | ~$20 | No change |
| Backblaze B2 | ~$15 | ~$20 | More media assets from new locales |
| Resend | ~$20 | ~$40 | More automated email sequences |
| Stripe fees | Variable (~2.9% + $0.30/transaction) | Variable — increasing with revenue | Not a fixed infra cost |
| **Monthly Infra Total** | **~€50 + ~$55** | **~€65 + ~$80** | Modest growth |

### 8.3 Translation Investment (Year 1)

| Language | Estimated Word Count | Estimated Cost | Quarter |
|----------|---------------------|----------------|---------|
| Spanish (ES) | ~150,000 words | TBD per Translation Vendor MSA | Q1–Q2 |
| Portuguese (PT) | ~150,000 words | TBD per Translation Vendor MSA | Q1–Q2 |
| German (DE) | ~150,000 words | TBD per Translation Vendor MSA | Q2–Q3 |
| **Year 1 Total** | **~450,000 words** | **[Finance to estimate per Translation Vendor MSA rate]** | |

---

## 9. Governance and Review Cadence

### 9.1 Monthly Optimization Review Meeting

**Participants:** TwinMOS PM, Marketing Director, TwinMOS IT Lead, Phase 4 vendor Team Lead  
**Duration:** 60 minutes  
**Agenda:**
1. Previous month performance vs. KPI targets (10 min)
2. Current sprint progress and blockers (15 min)
3. Next sprint backlog prioritisation (20 min)
4. Marketing content calendar alignment (10 min)
5. Any escalations or decisions needed (5 min)

### 9.2 Quarterly Steering Committee Review

**Participants:** Chairman (or GM), TwinMOS PM, Marketing Director  
**Duration:** 90 minutes  
**Agenda:**
1. Quarterly KPI scorecard vs. Phase 4 targets (20 min)
2. Q1–Q4 roadmap progress vs. plan (20 min)
3. ROI measurement: organic traffic, leads, e-commerce revenue (20 min)
4. Next quarter priorities and budget confirmation (20 min)
5. Strategic direction — any new priorities from business (10 min)

### 9.3 Annual Phase 4 Programme Review

**Participants:** Chairman, GM, Marketing Director, TwinMOS PM, IT Lead  
**Duration:** Half-day  
**Output:**
- Phase 4 Year 1 ROI Report
- Phase 4 Year 2 revised backlog and priorities
- Retainer renewal decision and rate review
- 3-year digital roadmap update

---

## 10. Risk Register (Phase 4)

| Risk ID | Risk | Probability | Impact | Mitigation |
|---------|------|-------------|--------|------------|
| R4-01 | Translation quality issues for ES/PT delay locale launch | Medium | High | Per-batch delivery milestones; in-market native reviewer engaged |
| R4-02 | Strapi v6 breaks existing custom plugins | Medium | High | Don't upgrade until v6.1+ is stable; full regression test in staging |
| R4-03 | E-commerce payment failure in new markets (Egypt, Nigeria) | Low | High | Test with sandbox; have rollback plan; Tax consultant review |
| R4-04 | GDPR/PDPL enforcement action against new locale (ES/DE) | Low | Very High | Legal review of each locale before launch; cookie consent verified |
| R4-05 | PostHog self-hosted capacity growth (large events volume) | Medium | Medium | Monitor Hetzner disk usage; scale VPS if needed |
| R4-06 | Stripe account flagged for fraud in new market | Low | High | Stripe Radar rules configured; manual review for first 100 orders in new market |
| R4-07 | Key personnel change (TwinMOS IT Lead or Phase 4 vendor) | Medium | High | Succession plan; knowledge documented in handover docs; Phase 4 retainer continuity clause |
| R4-08 | SEO ranking loss due to Google algorithm update | Medium | Medium | Content quality focus; avoid thin content; Core Web Vitals maintained |
| R4-09 | Supply chain issues reduce SKU availability (website shows out-of-stock) | Medium | Medium | ERP sync ensures real-time stock status; grey-out vs. remove from catalog |
| R4-10 | Competitor site redesign narrows feature gap | Low | Medium | Quarterly competitive analysis (BL-02-008) keeps radar active |

---

## 11. Plan Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Marketing Director | [Name] | _______________ | _________ |
| TwinMOS PM | [Name] | _______________ | _________ |
| Unisoft Team Lead (if Phase 4 retained) | [Name] | _______________ | _________ |

---

*Document prepared by TwinMOS Digital Transformation Team | Confidential — Internal Use Only*
