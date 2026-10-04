# TwinMOS Website — Form Lead Routing Guide

| | |
|:---|:---|
| **Document Reference** | TWN-OPS-2026-042 |
| **Version** | 1.0 |
| **Date** | 2026-05-01 |
| **Document Owner** | TwinMOS Marketing / Sales Operations |
| **Audience** | Marketing Team, Sales Teams, Partner Managers, IT Operations, Web Administrators |
| **Classification** | Internal Use — Confidential |
| **Related Documents** | TWN-BRD-2025-001 (BRD §8), TWN-URD-2025-002 (URD §6), TWN-OPS-2026-034 (Partner Portal Admin Guide) |
| **Synchronization Statement** | This document is synchronized with BRD v3.0, URD v3.0, and Tech Stack v1.1. |

---

## Change Log

| Version | Date | Author | Changes |
|:---|:---|:---|:---|
| 1.0 | 2026-05-01 | TwinMOS Operations Team | Initial release. |

---

## 1. Purpose and Scope

This guide defines the operational procedures for managing, routing, and processing leads generated through forms on the TwinMOS website. It covers:

- Form inventory and purpose
- Lead capture and validation
- Routing rules and logic
- Lead qualification and scoring
- Assignment and handoff to sales/partners
- Follow-up procedures and SLAs
- Reporting and optimization

**Scope:** All website forms that generate business leads, including contact forms, partner applications, quote requests, demo requests, and event registrations.

---

## 2. Form Inventory

### 2.1 Active Forms

| Form Name | Location | Purpose | Destination |
|:---|:---|:---|:---|
| **General Contact** | `/contact` | General inquiries | Chatwoot → Support queue |
| **Partner Application** | `/partners/apply` | Become a distributor/reseller | Partner Management queue |
| **Quote Request** | `/products/quote` | Bulk/enterprise pricing | Sales queue |
| **Demo Request** | `/solutions/demo` | Product demonstration | Sales queue |
| **Event Registration** | `/events/register` | Webinar/event signup | Marketing automation |
| **Newsletter Signup** | Site-wide footer | Email list subscription | Marketing automation |
| **Support Ticket** | `/support/ticket` | Technical support | Chatwoot → Support queue |
| **RMA Request** | `/support/rma` | Return authorization | RMA queue |
| **Counterfeit Report** | `/support/report-counterfeit` | Counterfeit reporting | Brand Protection queue |
| **Career Application** | `/careers/apply` | Job applications | HR system |
| **Media Inquiry** | `/press/contact` | Press and media | PR/Communications |
| **Investor Relations** | `/investors/contact` | Investor inquiries | IR team |

### 2.2 Form Field Standards

All lead-generating forms must include:

| Field | Required | Purpose |
|:---|:---|:---|
| Name | Yes | Personalization and CRM record |
| Email | Yes | Primary communication channel |
| Phone | No | Secondary contact, sales follow-up |
| Company | Conditional | Required for B2B forms |
| Country/Region | Yes | Routing and territory assignment |
| Inquiry Type | Yes | Categorization and routing |
| Message/Details | Yes | Context for response |
| Consent checkbox | Yes | GDPR/marketing consent |
| reCAPTCHA | Yes | Spam prevention |

---

## 3. Lead Capture and Validation

### 3.1 Submission Flow

```
User submits form → Client-side validation → Server validation →
Spam check (reCAPTCHA + heuristic) → Create lead record →
Route to destination → Auto-acknowledgment → Queue for action
```

### 3.2 Validation Rules

| Check | Action on Failure |
|:---|:---|
| Required fields present | Reject, highlight missing fields |
| Email format valid | Reject with format guidance |
| Email domain not disposable | Reject or flag for review |
| Phone format valid (if provided) | Reject with format guidance |
| reCAPTCHA passed | Reject, prompt retry |
| Rate limit (max 3 submissions/hour/IP) | Block, show rate limit message |
| Heuristic spam detection | Quarantine for manual review |

### 3.3 Spam and Bot Prevention

| Layer | Method |
|:---|:---|
| Primary | Google reCAPTCHA v3 (invisible) |
| Secondary | Honeypot field (hidden, bots fill it) |
| Tertiary | Submission rate limiting per IP |
| Quaternary | Heuristic pattern detection (keywords, timing) |
| Manual | Daily review of quarantined submissions |

---

## 4. Routing Rules

### 4.1 Routing Logic

Leads are routed based on a priority-ordered rule set:

**Rule Priority:**
1. **Form type** (primary determinant)
2. **Geographic region** (territory assignment)
3. **Inquiry category/subtype** (specialization)
4. **Company size/type** (B2B tier)
5. **Language** (agent language capability)
6. **Load balancing** (round-robin within queue)

### 4.2 Routing Matrix

| Form | Region | Route To | SLA |
|:---|:---|:---|:---|
| Partner Application | Any | Partner Management team | 3 business days |
| Quote Request | EU/UK | EU Sales Director | 1 business day |
| Quote Request | Americas | Americas Sales Director | 1 business day |
| Quote Request | APAC | APAC Sales Director | 1 business day |
| Quote Request | Africa/Middle East | Regional Sales Manager | 1 business day |
| Demo Request | Any | Inside Sales team | 4 hours |
| General Contact | Any | Support queue (Tier 1) | 24 hours |
| Media Inquiry | Any | PR/Communications | 4 hours |
| Investor Relations | Any | IR team | 1 business day |
| Career Application | Any | HR system | 5 business days |
| Event Registration | Any | Marketing automation | Immediate |
| Newsletter Signup | Any | Marketing automation | Immediate |

### 4.3 Geographic Routing

| Region Code | Countries/Territories | Primary Team |
|:---|:---|:---|
| EU-WEST | UK, Ireland, France, Germany, Benelux, Nordics | EU Sales West |
| EU-EAST | Poland, Czech, Hungary, Baltics, Balkans | EU Sales East |
| APAC-NORTH | China, Japan, Korea, Taiwan | APAC North |
| APAC-SOUTH | India, SE Asia, Australia, NZ | APAC South |
| AMERICAS-NORTH | USA, Canada | Americas North |
| AMERICAS-LATAM | Mexico, Brazil, rest of Latin America | Americas LATAM |
| MEA | Middle East, Africa | MEA Regional |
| SA | Bangladesh, India, Pakistan, Sri Lanka, Nepal | South Asia |

---

## 5. Lead Qualification and Scoring

### 5.1 Qualification Criteria (BANT)

| Criterion | Question | Weight |
|:---|:---|:---|
| **Budget** | Does the inquiry indicate purchase intent or budget? | 25% |
| **Authority** | Is the contact a decision-maker or influencer? | 25% |
| **Need** | Is there a clear, stated business need? | 25% |
| **Timeline** | Is there an indicated timeframe for decision? | 25% |

### 5.2 Lead Scoring Model

| Attribute | Points | Condition |
|:---|:---|:---|
| Company email domain | +10 | Not free email (Gmail, Yahoo, etc.) |
| Company size (employees) | +5 to +20 | 50+ = +5, 500+ = +10, 5000+ = +20 |
| Inquiry mentions specific product | +15 | — |
| Inquiry mentions timeline | +10 | "Within 3 months" or sooner |
| Inquiry mentions budget | +15 | Any budget indication |
| Previous engagement | +5 to +20 | Website visits, content downloads |
| Partner referral | +10 | Referred by existing partner |
| Event attendee | +5 | Attended TwinMOS event |
| Free email domain | -10 | Gmail, Yahoo, etc. |
| Vague inquiry | -5 | No specific need stated |
| Competitor mention | -5 | Considering competitors |

**Score Interpretation:**

| Score | Classification | Action |
|:---|:---|:---|
| 70+ | Hot lead | Immediate sales follow-up (< 4 hours) |
| 40–69 | Warm lead | Sales follow-up within 24 hours |
| 20–39 | Cool lead | Marketing nurture sequence |
| < 20 | Cold lead | Long-term nurture or archive |

---

## 6. Assignment and Handoff

### 6.1 Sales Assignment

| Step | Action | System |
|:---|:---|:---|
| 1 | Lead scored and qualified | CRM / Lead scoring engine |
| 2 | Territory determined by country/region | Routing rules |
| 3 | Lead assigned to sales rep | CRM round-robin or manual |
| 4 | Rep notified (email + CRM task) | CRM automation |
| 5 | Rep accepts or reassigns | CRM |
| 6 | Follow-up tracked in CRM | CRM activity log |

### 6.2 Handoff Requirements

When routing a lead to sales, include:
- Complete form submission data
- Lead score and qualification notes
- Source URL and referral data
- Any previous interactions (chat, email, visits)
- Recommended next steps

### 6.3 Partner Lead Distribution

Partner-sourced leads (via partner portal or referral):
1. Tagged with referring partner ID
2. Routed to appropriate sales team
3. Partner notified of lead acceptance
4. Deal registration encouraged
5. Commission tracking activated upon closure

---

## 7. Follow-Up Procedures

### 7.1 Sales Follow-Up SLA

| Lead Type | First Contact | Follow-Up Cadence |
|:---|:---|:---|
| Hot lead (70+) | Within 4 hours | Day 1, Day 3, Day 7, Day 14 |
| Warm lead (40–69) | Within 24 hours | Day 1, Day 3, Day 7, Day 14, Day 30 |
| Cool lead (20–39) | Within 72 hours | Day 3, Day 7, Day 14, Day 30, Day 60 |
| Partner application | Within 3 business days | Day 3, Day 7, Day 14 |

### 7.2 Follow-Up Actions

| Touch | Channel | Purpose |
|:---|:---|:---|
| 1st | Phone or email | Introduce, understand need, qualify |
| 2nd | Email | Share relevant content, case studies |
| 3rd | Phone | Advance conversation, address objections |
| 4th | Email | Proposal or quote if qualified |
| 5th | Phone | Close or re-qualify |
| Ongoing | Email nurture | Newsletter, product updates, events |

### 7.3 Lead Status Tracking

| Status | Definition |
|:---|:---|
| **New** | Just received, not yet contacted |
| **Contacted** | Initial outreach made |
| **Engaged** | Two-way communication established |
| **Qualified** | BANT criteria met |
| **Proposal** | Quote or proposal sent |
| **Negotiation** | Terms under discussion |
| **Closed-Won** | Deal signed |
| **Closed-Lost** | Deal lost (reason captured) |
| **Nurture** | Not ready, long-term follow-up |
| **Disqualified** | Does not meet criteria |

---

## 8. System Configuration

### 8.1 Strapi Configuration

| Collection | Purpose |
|:---|:---|
| `lead` | Master lead record |
| `lead-source` | Tracking source URLs and campaigns |
| `lead-routing-rule` | Active routing rules |
| `sales-territory` | Geographic territory definitions |
| `sales-rep` | Sales team assignments |

### 8.2 Chatwoot Integration

- Forms create Chatwoot conversations with appropriate labels
- Auto-assignment based on routing rules
- Custom attributes: Lead Score, Territory, Source, Company Size

### 8.3 CRM Integration (Future)

- Leads sync to CRM (HubSpot / Salesforce) for sales pipeline
- Bidirectional sync of status updates
- Activity logging from all touchpoints

---

## 9. Reporting and Optimization

| Report | Frequency | Owner | Key Metrics |
|:---|:---|:---|:---|
| Lead volume by source | Weekly | Marketing | Form submissions by page/channel |
| Lead quality | Monthly | Marketing + Sales | Score distribution, conversion rate |
| Response time compliance | Weekly | Sales Ops | % leads contacted within SLA |
| Conversion funnel | Monthly | Sales | Lead → Qualified → Proposal → Closed |
| Form abandonment | Monthly | Web Team | Drop-off rates by field/step |
| Routing accuracy | Monthly | Operations | Misrouted leads, reassignments |
| Source attribution | Monthly | Marketing | Revenue by lead source |

---

## 10. Document Sign-Off

| Role | Name | Signature | Date |
|:---|:---|:---|:---|
| Document Owner | | | |
| Marketing Manager | | | |
| Sales Operations | | | |
| Partner Management | | | |
| IT Operations | | | |

---

**Canonical Location:**
`Corporate website development for TwinMOS/project documentation/J - Operations, Maintenance and End-User Guides/J.3 - Business Operations Guides/TwinMOSWebsiteFormLeadRouting_Guide.md`
