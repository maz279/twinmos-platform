# TwinMOS Technologies Middle East FZE — Unisoft Solutions Ltd.

# Service Level Agreement (SLA)

**Document Reference:** TWN-LEGAL-SLA-2026-001  
**Version:** 1.0  
**Effective Date:** [DATE UPON EXECUTION]  
**Governing Law:** Laws of the United Arab Emirates (Dubai International Financial Centre — DIFC, where applicable)

---

## Table of Contents

1. [Preamble and Parties](#1-preamble-and-parties)
2. [Definitions](#2-definitions)
3. [Service Scope](#3-service-scope)
4. [Availability Targets](#4-availability-targets)
5. [Performance Metrics](#5-performance-metrics)
6. [Incident Classification and Response Times](#6-incident-classification-and-response-times)
7. [Service Credits](#7-service-credits)
8. [Maintenance Windows](#8-maintenance-windows)
9. [Support Hours and Channels](#9-support-hours-and-channels)
10. [Monitoring and Reporting](#10-monitoring-and-reporting)
11. [Disaster Recovery and Business Continuity](#11-disaster-recovery-and-business-continuity)
12. [Exclusions](#12-exclusions)
13. [Escalation Procedures](#13-escalation-procedures)
14. [Review and Amendments](#14-review-and-amendments)
15. [Limitation of Liability](#15-limitation-of-liability)
16. [Signatures](#16-signatures)

---

## 1. Preamble and Parties

### 1.1 Parties

This Service Level Agreement ("**SLA**" or "**Agreement**") is entered into between:

**TwinMOS Technologies Middle East FZE**  
C-9, Dubai Airport Free Zone (DAFZA)  
Dubai, United Arab Emirates  
P.O. Box 293693  
("**Client**" or "**TwinMOS**")

and

**Unisoft Solutions Ltd.**  
[Registered Address to be completed]  
("**Service Provider**" or "**Unisoft**")

Collectively referred to as the "**Parties**" and individually as a "**Party**".

### 1.2 Purpose

This SLA establishes measurable service standards, performance commitments, incident response obligations, and associated remedies governing Unisoft's provision of post-launch support, maintenance, and hosting management services for the TwinMOS corporate website (twinmos.com) under the Master Service Agreement (TWN-LEGAL-MSA-2026-001).

### 1.3 Relationship to MSA

This SLA is incorporated by reference as **Annex E** to the TwinMOS–Unisoft Master Service Agreement (TWN-LEGAL-MSA-2026-001). In the event of any conflict between this SLA and the MSA, the MSA shall prevail, except where this SLA establishes more specific standards for service performance and incident response, in which case this SLA shall govern those specific matters.

### 1.4 Commencement

This SLA takes effect upon the go-live date of the TwinMOS website (twinmos.com) and remains in force for the duration of the engagement under the MSA, including the 90-day warranty period and any subsequent support arrangements executed as a Statement of Work (SOW).

---

## 2. Definitions

### 2.1 Key Terms

| Term | Definition |
|------|------------|
| **"Availability"** | The percentage of time in a given calendar month during which the website is accessible to end users and performing within defined Performance Metrics, excluding Planned Maintenance Windows and Excluded Events. |
| **"Business Day"** | Any day other than Friday, Saturday, or a public holiday in Dubai, United Arab Emirates. |
| **"Business Hours"** | Monday through Thursday, 09:00–18:00 GST (UTC+4), on Business Days. |
| **"Critical Defect"** | A defect causing complete unavailability of the website, data loss or corruption, active security breach, or complete failure of a core business function. |
| **"Downtime"** | Any period during which the website is unavailable or failing to respond within acceptable performance thresholds, excluding Planned Maintenance Windows and Excluded Events. |
| **"Excluded Events"** | Events outside Unisoft's reasonable control that are excluded from Availability calculations, as defined in Section 12. |
| **"Incident"** | Any unplanned interruption, degradation, or reduction in the quality of a Service covered under this SLA. |
| **"Maintenance Window"** | A pre-scheduled period during which Unisoft may perform maintenance activities that may affect Availability, as defined in Section 8. |
| **"Monthly Uptime Percentage"** | The percentage of total minutes in a calendar month during which the website was Available. Calculated as: ((Total Minutes − Downtime Minutes) ÷ Total Minutes) × 100. |
| **"Priority Level"** | Classification of an Incident based on its business impact, as defined in Section 6. |
| **"Recovery Point Objective (RPO)"** | The maximum acceptable amount of data loss, measured in time, from which recovery must be possible. |
| **"Recovery Time Objective (RTO)"** | The maximum acceptable elapsed time from incident occurrence to restoration of service within normal operating parameters. |
| **"Response Time"** | The time elapsed from Incident notification to Unisoft's first substantive acknowledgment, impact assessment, and initiation of investigation. |
| **"Resolution Time"** | The time elapsed from Incident notification to confirmed service restoration within acceptable performance thresholds. |
| **"Service Credits"** | Credits applied as discounts against future invoices as the sole remedy for SLA breaches, as defined in Section 7. |
| **"Support Ticket"** | A formal record of an Incident or service request submitted through the agreed ticketing platform. |

---

## 3. Service Scope

### 3.1 Covered Services

This SLA governs the following services provided by Unisoft under the MSA and applicable SOWs:

| Service | Description | SLA Period |
|---------|-------------|------------|
| **Website Availability** | Ensuring twinmos.com is accessible and responsive to end users globally | From go-live |
| **Application Performance** | Maintaining Core Web Vitals and Lighthouse scores within defined thresholds | From go-live |
| **CMS Availability** | Ensuring Strapi v5 admin portal is accessible for TwinMOS content editors | From go-live |
| **API Availability** | Ensuring all published Strapi API endpoints respond within defined thresholds | From go-live |
| **Bug Fixes and Defect Resolution** | Identifying and resolving defects in Unisoft-developed code | 90-day warranty + ongoing per SOW |
| **Security Patch Management** | Applying critical security patches to Unisoft-maintained application components | From go-live |
| **Backup Management** | Ensuring automated backups execute successfully and are retrievable on demand | From go-live |
| **Monitoring** | Active monitoring of website availability, performance, and error rates | From go-live |
| **Incident Response** | Responding to and resolving Incidents within the timeframes defined in Section 6 | From go-live |

### 3.2 Excluded Services

Unless explicitly included in a signed SOW, this SLA does not cover:

(a) Hosting infrastructure and its provider-level SLAs (governed by Cloudflare, Hetzner, and Backblaze provider agreements)  
(b) Third-party SaaS platform availability (Resend, Sentry, HubSpot, MeiliSearch cloud edition)  
(c) Translation and localization services (governed by the TwinMOS Translation Vendor Master Agreement)  
(d) Penetration testing and security auditing (governed by the TwinMOS Penetration Test Vendor Agreement)  
(e) New feature development beyond the originally delivered scope (governed by subsequent SOWs)  
(f) Content creation, product photography, videography, or marketing services  
(g) Issues caused directly by TwinMOS's own actions, configuration changes, or TwinMOS-managed infrastructure  
(h) ERP, CRM, or third-party integration service levels beyond what Unisoft directly controls

---

## 4. Availability Targets

### 4.1 Uptime Guarantee

Unisoft commits to the following Monthly Uptime Percentages for covered services:

| Service | Target Uptime | Minimum Acceptable | Maximum Monthly Downtime |
|---------|--------------|-------------------|--------------------------|
| **twinmos.com — Public Website** | 99.9% | 99.5% | 43 minutes 12 seconds |
| **Strapi v5 CMS Admin Portal** | 99.5% | 99.0% | 3 hours 36 minutes |
| **Strapi API Endpoints** | 99.9% | 99.5% | 43 minutes 12 seconds |
| **MeiliSearch (Site Search)** | 99.5% | 99.0% | 3 hours 36 minutes |

### 4.2 Availability Measurement

(a) Availability is measured from the perspective of an external end user via an independent third-party monitoring service (UptimeRobot, Pingdom, or equivalent), checking from multiple geographic locations (minimum: Dubai, London, Singapore) at intervals of **60 seconds** or less.

(b) Downtime is counted only when the monitoring service confirms the site or service is unreachable or returning HTTP 5xx error responses from **two or more** monitoring locations simultaneously.

(c) Single-location probe failures lasting fewer than **5 consecutive minutes** shall not be counted as Downtime.

(d) Availability is calculated on a **calendar month** basis. Partial months at the start of the engagement are calculated on a pro-rata basis.

### 4.3 Availability Reporting

(a) A client-accessible status page shall be maintained and updated within **15 minutes** of any confirmed Downtime event.

(b) Monthly Availability reports shall be provided to TwinMOS within **5 Business Days** of the end of each calendar month, including time-stamped incident logs.

---

## 5. Performance Metrics

### 5.1 Core Web Vitals and Performance Standards

Unisoft warrants that the website shall achieve the following performance metrics, measured using Google PageSpeed Insights (field data) and Lighthouse (lab data) against representative pages: homepage, product listing page, product detail page, and support/knowledge base pages:

| Metric | Target | Maximum Acceptable | Measurement Condition |
|--------|--------|-------------------|-----------------------|
| **First Contentful Paint (FCP)** | < 1.0 second | 1.5 seconds | Mobile, simulated Fast 3G |
| **Largest Contentful Paint (LCP)** | < 1.8 seconds | 2.5 seconds | Mobile, simulated Fast 3G |
| **Interaction to Next Paint (INP)** | < 150 milliseconds | 200 milliseconds | Mobile |
| **Cumulative Layout Shift (CLS)** | < 0.05 | 0.1 | Mobile and desktop |
| **Time to First Byte (TTFB)** | < 150 milliseconds | 300 milliseconds | Desktop, no throttling |
| **Lighthouse Performance Score** | ≥ 90 / 100 | 85 / 100 | Desktop and mobile |
| **Lighthouse Accessibility Score** | ≥ 90 / 100 | 85 / 100 | Desktop and mobile |

### 5.2 Performance Measurement Methodology

(a) Performance metrics are assessed on a **weekly basis** via automated Lighthouse CI runs integrated into the CI/CD pipeline, with results logged and included in monthly reports.

(b) Google PageSpeed Insights API shall be used as a secondary verification source for real-user (field data) performance where available.

(c) If any metric falls below the **Maximum Acceptable** threshold for **two consecutive weekly assessments**, it constitutes a **P2 High** Incident under Section 6, triggering resolution obligations.

### 5.3 Performance Baselines

(a) Baseline performance measurements shall be formally recorded at go-live and documented in the monthly report for Month 1.

(b) Performance degradation exceeding **20% below the established baseline** on any metric triggers a performance review within 5 Business Days and a remediation plan within 10 Business Days.

---

## 6. Incident Classification and Response Times

### 6.1 Priority Level Definitions

| Priority | Name | Business Impact | Examples |
|----------|------|-----------------|----------|
| **P1** | Critical | Complete service unavailability; active security breach; data loss or corruption; total failure of mission-critical functionality | Site returning HTTP 5xx errors site-wide; database corruption or data loss; confirmed unauthorized access to admin portal; complete CMS unavailability; SSL certificate expired causing browser security warnings |
| **P2** | High | Major section or feature unavailable; significant performance degradation; partial security incident; content publishing fully blocked | Product catalog not loading; site search completely non-functional; Lighthouse Performance Score below 70; CMS editor unable to publish or save content; contact forms returning errors; performance degradation affecting >25% of pages |
| **P3** | Medium | Minor feature malfunction; moderate performance degradation; non-critical UI issues affecting user experience | Single product page broken; image gallery not loading on specific pages; form validation errors on non-critical forms; performance Lighthouse score between 70–84; broken navigation link on secondary page |
| **P4** | Low | Cosmetic issues; minor UI inconsistencies; documentation errors; non-urgent requests | Minor CSS misalignment on a low-traffic page; typographic error in tertiary content; broken internal link with low traffic; documentation update request; feature enhancement inquiry |

### 6.2 Response and Resolution Time Commitments

| Priority | Initial Acknowledgement | Resolution Target | Maximum Resolution Time | Coverage |
|----------|------------------------|-------------------|------------------------|----------|
| **P1 Critical** | 15 minutes | 4 hours | 8 hours | 24/7/365 |
| **P2 High** | 1 hour | 8 hours | 24 hours | 24/7/365 |
| **P3 Medium** | 4 hours | 2 Business Days | 5 Business Days | Business Hours |
| **P4 Low** | 1 Business Day | 5 Business Days | 10 Business Days | Business Hours |

**Important Notes:**

(a) **"Initial Acknowledgement"** means a substantive response confirming: receipt of the Incident report, initial impact assessment, assigned engineer, and commencement of investigation. Automated ticket confirmation does not constitute Initial Acknowledgement.

(b) **"Resolution"** means the service has been restored to within acceptable performance thresholds, root cause has been identified, and TwinMOS has confirmed restoration.

(c) P1 and P2 times are absolute and apply at all hours, including weekends and public holidays.

(d) P3 and P4 times are calculated in Business Hours only.

### 6.3 Incident Lifecycle

Each Incident shall progress through the following stages:

| Stage | Description | Owner |
|-------|-------------|-------|
| **Detection** | Incident identified via automated monitoring or TwinMOS report | Unisoft monitoring / TwinMOS |
| **Notification** | Support Ticket raised; for P1/P2, auto-ticket generated by monitoring | TwinMOS / Unisoft |
| **Acknowledgement** | Unisoft confirms receipt, provides impact assessment and assigned engineer | Unisoft |
| **Investigation** | Root cause identified; interim mitigation applied if possible | Unisoft |
| **Remediation** | Fix applied; service restored to within acceptable thresholds | Unisoft |
| **Verification** | TwinMOS confirms resolution is satisfactory | TwinMOS |
| **Closure** | Support Ticket closed with root cause and remediation documented | Unisoft |
| **Post-Incident Review** | Written PIR provided for all P1 and P2 Incidents | Unisoft |

**Post-Incident Review Timelines:**

- P1 Critical: Written PIR delivered within **48 hours** of closure
- P2 High: Written PIR delivered within **5 Business Days** of closure

**PIR content shall include:** timeline of events, root cause analysis, remediation actions taken, preventive measures implemented, and any SLA credit calculation.

### 6.4 Incident Auto-Escalation

If Resolution Time targets are at risk of being missed, the following escalation shall occur automatically:

| Elapsed Time | Escalation Action |
|-------------|-------------------|
| 50% of Resolution Target | Unisoft Project Manager notified internally |
| 75% of Resolution Target | Unisoft Operational Sponsor notified; TwinMOS GM (Robiul Islam) notified by email |
| Resolution Target exceeded | Unisoft Executive Sponsor and TwinMOS Chairman (Mohd Mazharul Islam) notified; status updates every 2 hours until resolved |

---

## 7. Service Credits

### 7.1 Availability Credit Schedule

In the event that Unisoft fails to meet the Monthly Uptime Percentage targets for twinmos.com (Section 4.1), TwinMOS is entitled to Service Credits calculated as a percentage of the applicable monthly support and maintenance fees under the active SOW:

| Monthly Uptime — twinmos.com | Service Credit |
|------------------------------|----------------|
| 99.9% – 100.0% | 0% (no credit; within target) |
| 99.0% – 99.89% | 10% of monthly support fee |
| 97.0% – 98.99% | 20% of monthly support fee |
| 95.0% – 96.99% | 30% of monthly support fee |
| 90.0% – 94.99% | 40% of monthly support fee |
| Below 90.0% | 50% of monthly support fee |

### 7.2 Response and Resolution Time Credit Schedule

In the event Unisoft fails to meet P1 or P2 response/resolution commitments in Section 6.2, TwinMOS is entitled to the following additional credits:

| Failure | Service Credit |
|---------|----------------|
| P1 Initial Acknowledgement time exceeded | 5% per occurrence |
| P1 Maximum Resolution Time exceeded (per 4-hour block beyond 8h) | 5% per 4-hour block, maximum 25% |
| P2 Maximum Resolution Time exceeded | 5% per occurrence, maximum 15% |
| Three or more P1 Incidents in a single calendar month | 10% additional credit that month |

### 7.3 Credit Conditions and Limitations

(a) Service Credits are cumulative but **capped at 50%** of the applicable monthly support fee in any single calendar month.

(b) Credits are applied as a **discount on the next monthly or milestone invoice**. Credits are not redeemable for cash.

(c) Service Credits are the **sole and exclusive remedy** for Availability and Response Time failures, except where failure constitutes a material breach of the MSA under Section 12.2 of the MSA, or arises from fraud, willful misconduct, or gross negligence.

(d) TwinMOS must submit a credit claim in writing within **30 calendar days** of the end of the month in which the SLA breach occurred. Unisoft shall review the claim and respond within **10 Business Days**.

(e) Credits are not available if TwinMOS is in arrears on any undisputed invoice by more than **60 days**.

(f) Credits are not available for Downtime resulting from Excluded Events defined in Section 12.

### 7.4 Credit Calculation Example

If twinmos.com experiences 2 hours and 15 minutes of unplanned Downtime in a calendar month (Monthly Uptime: ~99.69%), and the monthly support fee is USD 5,000, TwinMOS would be entitled to a 10% Service Credit of USD 500 applied to the next invoice.

---

## 8. Maintenance Windows

### 8.1 Scheduled Maintenance Windows

Unisoft may perform routine maintenance, updates, deployments, and infrastructure work during the following pre-approved windows:

| Window Type | Schedule | Maximum Duration | Notice Required |
|-------------|----------|-----------------|-----------------|
| **Standard Maintenance** | Friday or Saturday, 02:00–06:00 GST | 4 hours | 72 hours in advance |
| **Emergency Security Patch** | Any time, with maximum feasible notice | 2 hours | 4 hours in advance (minimum) |
| **Major Version Upgrades** | Pre-agreed date/time, outside peak hours | 6 hours | 7 days in advance |

### 8.2 Maintenance Window Conditions

(a) Downtime occurring during pre-notified and TwinMOS-acknowledged Scheduled Maintenance Windows is **excluded from Availability calculations** under Section 4.

(b) Total Scheduled Maintenance downtime shall not exceed **4 hours per calendar month** without TwinMOS's prior written approval, except for emergency security patches addressing CVSS scores of 9.0 or above.

(c) Unisoft shall use blue-green deployment, rolling updates, or zero-downtime deployment strategies wherever technically feasible to minimize or eliminate user-visible downtime during maintenance.

### 8.3 Advance Notice and Approval

(a) **Standard maintenance:** TwinMOS must be notified via email and status page at least **72 hours** in advance.

(b) **Emergency security patches:** TwinMOS must be notified as soon as practicable, with a minimum of **4 hours' notice**. TwinMOS written approval is required unless immediate action is necessary to prevent active exploitation of a critical vulnerability. Post-hoc documentation shall be provided within 24 hours in such cases.

(c) **Major upgrades:** TwinMOS must provide written sign-off at least **7 days** in advance.

### 8.4 Maintenance Obligations

During any maintenance window:

(a) Unisoft shall display a branded maintenance page to website visitors informing them the site is temporarily unavailable.

(b) Unisoft shall notify TwinMOS within **30 minutes** of maintenance completion and service restoration.

(c) If maintenance extends beyond the notified window, Unisoft shall notify TwinMOS immediately and provide an updated expected completion time.

(d) If maintenance extends beyond the window by more than **60 minutes**, TwinMOS may count the excess downtime against the Monthly Uptime Percentage.

---

## 9. Support Hours and Channels

### 9.1 Support Coverage

| Support Tier | Coverage Hours | Available Channels |
|--------------|---------------|--------------------|
| **Standard Support (P3/P4)** | Mon–Thu, 09:00–18:00 GST | Email, ticketing platform |
| **Elevated Support (P2)** | 24 hours/day, 7 days/week | Email, ticketing platform, emergency phone |
| **Emergency Support (P1)** | 24 hours/day, 365 days/year | Emergency phone, WhatsApp, email |

### 9.2 Ticketing System

(a) TwinMOS shall submit all Support Tickets via the agreed ticketing platform (Jira, Linear, or equivalent to be specified in the applicable SOW).

(b) Each ticket must include: description of the issue, observed vs. expected behavior, steps to reproduce, screenshots or error logs where available, and TwinMOS's suggested Priority Level.

(c) Unisoft may reclassify ticket priority with written justification provided within the ticket response.

(d) For P1 Incidents, a Support Ticket must be raised in the ticketing system in addition to phone/WhatsApp contact, to maintain an auditable record.

### 9.3 Emergency Contact Protocol

(a) For P1 Incidents at any time, TwinMOS shall:

1. Submit a Support Ticket marked **"[P1 CRITICAL] — [Brief Description]"**
2. Immediately call the Unisoft emergency phone number
3. If no answer within 5 minutes, send a WhatsApp message to the emergency contact

(b) Unisoft shall provide TwinMOS's designated operational contacts (**Robiul Islam, General Manager, Dubai** and the appointed TwinMOS Project Manager) with emergency contact details — including mobile number and WhatsApp — at project kick-off. These details must be updated within **24 hours** of any change.

(c) The emergency contact must be a technically qualified engineer capable of directly investigating and resolving P1 Incidents, not a first-line support dispatcher.

### 9.4 Communication Protocols

All routine incident communications, status updates, and monthly reports shall be directed to:

**TwinMOS (Client):**  
Email: [TwinMOS Project Manager email — to be confirmed]  
CC: robiul.islam@twinmos.com; legal@twinmos.com (for P1 incidents)

**Unisoft (Service Provider):**  
Email: [Unisoft Project Manager email — to be completed]  
Emergency: [To be completed at project kick-off]

---

## 10. Monitoring and Reporting

### 10.1 Monitoring Infrastructure

Unisoft shall maintain the following monitoring tools and processes:

| Monitoring Type | Tool / Method | Frequency | Coverage |
|-----------------|---------------|-----------|----------|
| **Uptime Monitoring** | UptimeRobot, Pingdom, or equivalent (third-party) | Every 60 seconds | Homepage, 5 critical pages, API health endpoint, CMS health endpoint |
| **Performance Monitoring** | Lighthouse CI + Google PageSpeed Insights API | Weekly automated runs | Homepage, product listing, product detail, support |
| **Application Error Tracking** | Sentry (per DPA TWN-LEGAL-DPA-2026-001) | Real-time | All application-layer errors and exceptions |
| **Server and Infrastructure Metrics** | Coolify / Hetzner dashboards | Real-time | CPU utilization, memory, disk I/O, network throughput |
| **SSL Certificate Monitoring** | Automated (via Cloudflare) | Daily | twinmos.com and all active subdomains |
| **Backup Verification** | Automated restore test scripts | Monthly | All backup repositories (Backblaze B2) |
| **Security Scanning** | Automated DAST / dependency vulnerability scanning | Weekly | All exposed endpoints and third-party dependencies |

### 10.2 Client Status Page

(a) Unisoft shall maintain a client-accessible status page (URL to be agreed at project kick-off) displaying:

- Real-time status of all covered services
- Active Incident notices with status and estimated resolution time
- Scheduled maintenance notices (minimum 72 hours in advance)
- Incident history for the preceding 90 days
- Monthly uptime statistics per service

(b) The status page must be updated within **15 minutes** of any confirmed Downtime or significant service degradation event.

### 10.3 Monthly SLA Report

Unisoft shall deliver a Monthly SLA Report within **5 Business Days** of each calendar month-end, containing:

| Report Component | Details |
|------------------|---------|
| **Monthly Uptime Summary** | Uptime % per service vs. target; total Downtime minutes |
| **Incident Log** | All P1–P4 Incidents: date, time, duration, priority, root cause, resolution, credit impact |
| **Performance Metrics** | Weekly Lighthouse scores and Core Web Vitals trends vs. targets |
| **Maintenance Activity** | Windows used, duration, services affected, outcome |
| **Backup Status** | Backup success rate; results of monthly restore test |
| **Security Events** | Summary of security scanning results and any actions taken |
| **Credit Calculation** | Calculation of any Service Credits owed for the month |
| **Open Items and Action Plan** | Unresolved items, preventive measures, upcoming scheduled work |

### 10.4 Quarterly SLA Health Review

(a) A joint Quarterly SLA Health Review meeting shall be held within **10 Business Days** of each quarter-end, attended by:

- TwinMOS: General Manager (Robiul Islam) and Project Manager
- Unisoft: Project Manager and Technical Lead

(b) Agenda shall include: performance trend analysis, recurring issue patterns, infrastructure health, preview of upcoming changes, and proposed SLA adjustments.

(c) Meeting minutes and any agreed action items shall be shared within **3 Business Days** of the meeting.

---

## 11. Disaster Recovery and Business Continuity

### 11.1 Recovery Objectives

| Objective | Target | Scope |
|-----------|--------|-------|
| **Recovery Time Objective (RTO)** | 4 hours | Full website service restoration from point of confirmed infrastructure failure |
| **Recovery Point Objective (RPO)** | 1 hour | Maximum data loss; database backups run at minimum every 60 minutes |

### 11.2 Backup Schedule and Retention

| Backup Type | Frequency | Retention Period | Storage Location |
|-------------|-----------|-----------------|------------------|
| **Full Database Backup (PostgreSQL)** | Daily (02:00 GST) | 30 days | Backblaze B2 (per DPA TWN-LEGAL-DPA-2026-001) |
| **Incremental Database Backup** | Hourly | 7 days | Backblaze B2 |
| **File System / Media Assets** | Daily | 14 days | Backblaze B2 |
| **Strapi CMS Content and Config** | Daily | 30 days | Git repository (GitHub) + Backblaze B2 |
| **Application Configuration and Infrastructure-as-Code** | On every change | 90 days (Git history) | GitHub repository |
| **Cloudflare Configuration** | On every change | 30 days | Git repository (Terraform/Wrangler config) |

### 11.3 Backup Verification

(a) Unisoft shall perform and document **monthly test restores** from backup to a staging environment to verify integrity and recoverability. Results must confirm that the restored environment is functional and data is consistent.

(b) Test restore results shall be included in the Monthly SLA Report.

(c) TwinMOS may request an ad-hoc restore test with **10 Business Days' notice**, not more than once per quarter at no additional charge. Additional restore tests may be charged at Unisoft's then-current day rate.

### 11.4 Disaster Recovery Plan

(a) Unisoft shall provide TwinMOS with a documented Disaster Recovery Plan (DRP) within **30 days** of go-live, covering failure scenarios for all covered services, recovery procedures, and responsible personnel.

(b) The DRP shall be reviewed and updated annually, and within **14 days** of any material infrastructure change.

(c) Unisoft shall conduct an annual DRP simulation exercise and provide a written summary of results to TwinMOS within **10 Business Days** of the exercise.

---

## 12. Exclusions

### 12.1 Excluded Events

The following events are excluded from Availability calculations and do not give rise to Service Credit obligations:

(a) **Planned Maintenance:** Downtime during pre-notified Scheduled Maintenance Windows per Section 8.

(b) **Force Majeure Events:** Events beyond Unisoft's reasonable control, including but not limited to: acts of God, floods, earthquakes, hurricanes; war, terrorism, riot or civil unrest; pandemic or epidemic declared by a national or international authority; government-mandated restrictions; power failures not attributable to Unisoft's data center.

(c) **Third-Party Infrastructure Failures:**

| Provider | Covered Exclusion |
|----------|-------------------|
| Cloudflare | Core CDN, DNS, DDoS protection, and Workers infrastructure outages |
| Hetzner | Data center hardware failures or network outages at Hetzner's facility level |
| GitHub | Platform outages affecting CI/CD pipeline execution |
| Backblaze B2 | Storage service outages |
| Resend | Email delivery service outages |
| Any IANA root DNS provider | DNS resolution failures at the root level |

(d) **Client-Caused Incidents:** Downtime or degradation resulting from:
- TwinMOS actions or omissions (e.g., unauthorized DNS changes, accidental deletion of critical content or records, failure to approve recommended security patches)
- TwinMOS-initiated changes made without Unisoft involvement
- Credential misuse by TwinMOS employees or contractors
- Failure to renew domain registration or third-party subscriptions under TwinMOS's control

(e) **Volumetric DDoS Attacks:** Distributed denial-of-service attacks exceeding the mitigation capacity of the contracted Cloudflare service tier, for the duration of the attack.

(f) **Zero-Day Exploits:** Active exploitation of security vulnerabilities for which no public patch or mitigation guidance was available at the time of exploitation, provided Unisoft demonstrates it applied all available security best practices.

(g) **Non-Payment Suspension:** Service suspension initiated by Unisoft following non-payment of undisputed invoices per MSA Section 6.4, after proper notice.

### 12.2 Force Majeure Notification

Upon becoming aware of any Excluded Event affecting service availability, Unisoft shall notify TwinMOS in writing within **4 hours**, including:

(a) Nature and estimated cause of the event  
(b) Services affected and estimated impact duration  
(c) Mitigation steps being taken  
(d) Expected restoration timeline (to be updated as information becomes available)

---

## 13. Escalation Procedures

### 13.1 SLA Escalation Matrix

| Level | Trigger | TwinMOS Contact | Unisoft Contact | Expected Response |
|-------|---------|-----------------|-----------------|-------------------|
| **Level 1 — Operational** | Incident not acknowledged within agreed timeframe | TwinMOS Project Manager | Unisoft Project Manager | Within 4 hours |
| **Level 2 — Management** | Incident unresolved at 150% of Resolution Target; or 2 × P1 in a 30-day period | Robiul Islam, GM Dubai | Unisoft Operational Sponsor | Within 8 hours |
| **Level 3 — Executive** | Incident unresolved at 200% of Resolution Target; or 3 × P1 in a calendar month | Mohd Mazharul Islam, Chairman | Unisoft Executive Sponsor | Within 24 hours |
| **Level 4 — Contractual** | Three or more SLA breach months in a rolling 6-month period; or material breach | TwinMOS Legal | Unisoft Legal | Per MSA Section 13 (Dispute Resolution) |

### 13.2 Emergency SLA Review Meeting

(a) Either Party may call an emergency SLA review meeting upon the occurrence of two or more P1 Incidents within any 30-day period.

(b) The review meeting must take place within **3 Business Days** of the written request.

(c) The meeting must produce a written action plan with assigned owners and timelines, to be distributed within **2 Business Days** of the meeting.

(d) The action plan shall be tracked in the following Monthly SLA Report.

---

## 14. Review and Amendments

### 14.1 Scheduled Reviews

This SLA shall be formally reviewed as follows:

| Review Type | Frequency | Participants | Output |
|-------------|-----------|--------------|--------|
| **Quarterly Health Review** | End of each quarter | Project Managers, Technical Leads | Performance analysis, action items |
| **Annual SLA Review** | Annually from go-live | Executive Sponsors, Project Managers | SLA metrics adjustment, credit schedule review |
| **Ad-hoc Emergency Review** | On trigger event (see Section 13.2) | As per Section 13 | Action plan |

### 14.2 SLA Adjustment Process

(a) Either Party may propose SLA metric adjustments at the annual review, based on:
- Actual performance trends
- Changes to TwinMOS's infrastructure or traffic volumes
- Industry benchmark changes
- Adoption of new technology (CDN upgrades, infrastructure scaling)

(b) Proposed adjustments must be submitted in writing at least **30 days** before the annual review meeting.

(c) Amendments to this SLA require a written amendment signed by authorized representatives of both Parties and become effective on the date specified in the amendment.

### 14.3 Emergency Amendment

Either Party may request an emergency SLA amendment within **10 Business Days** of:

(a) A material change to the website infrastructure or technology stack  
(b) A confirmed security incident affecting twinmos.com  
(c) A significant expansion of TwinMOS's digital operations (e.g., e-commerce launch, new regional sites)  
(d) A sustained shift in traffic volumes exceeding **200% of baseline**

---

## 15. Limitation of Liability

### 15.1 Service Credits as Exclusive Remedy

Service Credits under Section 7 are TwinMOS's **sole and exclusive remedy** for Unisoft's failure to meet Availability and Response/Resolution Time commitments under this SLA. No additional damages shall be available for SLA metric failures unless such failure independently constitutes a material breach of the MSA, fraud, willful misconduct, or gross negligence.

### 15.2 Cap on SLA-Related Liability

Unisoft's total aggregate liability for SLA-related failures in any calendar month shall not exceed the lesser of:

(a) The total Service Credits calculated under Section 7 for that month; or  
(b) The total monthly support fees paid by TwinMOS under the applicable SOW for that month.

### 15.3 No Expansion of MSA Liability

This SLA does not expand, modify, or replace the limitation of liability provisions in MSA Section 11. The caps and exclusions in MSA Section 11 apply to all claims under or relating to this SLA.

### 15.4 No Waiver of MSA Rights

TwinMOS's acceptance of Service Credits does not constitute a waiver of any rights under the MSA, including the right to terminate for material breach under MSA Section 12.2, where the same facts constitute a material breach of the MSA independent of this SLA.

---

## 16. Signatures

IN WITNESS WHEREOF, the Parties have executed this Service Level Agreement as of the Effective Date first written above.

**TwinMOS Technologies Middle East FZE**

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Authorized Signatory | Mohd Mazharul Islam, Chairman | _______________ | _________ |
| Witness | | _______________ | _________ |

**Unisoft Solutions Ltd.**

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Authorized Signatory | | _______________ | _________ |
| Witness | | _______________ | _________ |

---

**Document Control**

| Version | Date | Author | Changes | Approved By |
|---------|------|--------|---------|-------------|
| 0.1 | 1 May 2026 | TwinMOS Legal (Draft) | Initial draft | — |
| 1.0 | [DATE] | — | Final version for execution | — |

**Next Review:** Quarterly from go-live date; annual review at 12 months; emergency review on material change or trigger event per Section 13.2
