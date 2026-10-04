# TwinMOS Website — Counterfeit Report Triage Process

| | |
|:---|:---|
| **Document Reference** | TWN-OPS-2026-033 |
| **Version** | 1.0 |
| **Date** | 2026-05-01 |
| **Document Owner** | TwinMOS Brand Protection Team |
| **Audience** | Customer Support Agents, Brand Protection Analysts, Legal Team, Supervisors |
| **Classification** | Internal Use — Confidential |
| **Related Documents** | TWN-BRD-2025-001 (BRD §7.4), TWN-OPS-2026-032 (Anti-Counterfeit Operations Guide) |
| **Synchronization Statement** | This document is synchronized with BRD v3.0, URD v3.0, and Tech Stack v1.1. |

---

## Change Log

| Version | Date | Author | Changes |
|:---|:---|:---|:---|
| 1.0 | 2026-05-01 | TwinMOS Operations Team | Initial release. |

---

## 1. Purpose and Scope

This document defines the step-by-step triage process for handling counterfeit product reports submitted through the TwinMOS website. It ensures consistent, timely, and effective response to every report.

**Scope:** All counterfeit reports received via web form, email, phone, partner notification, or internal detection.

---

## 2. Report Intake Channels

| Channel | Tool | Auto-Action |
|:---|:---|:---|
| Website Report Form | Strapi form → Chatwoot | Auto-creates high-priority ticket |
| Email (counterfeit@twinmos.com) | Chatwoot inbox | Auto-creates ticket, applies label |
| Phone | Agent manual entry | Agent creates ticket with "Counterfeit" label |
| Partner Notification | Partner portal → internal queue | Creates ticket + notifies Brand Protection |
| Internal Detection (RMA, Verification) | System auto-creation | Creates incident directly in Strapi |
| Marketplace Monitoring | External tool → Chatwoot | Creates ticket with source metadata |

---

## 3. Triage Severity Matrix

Reports are classified by severity within 4 hours of intake.

| Severity | Criteria | Response SLA | Escalation |
|:---|:---|:---|:---|
| **Critical** | Large volume (>100 units), organized operation, safety risk, authorized partner involved | 1 hour | Immediate to Brand Protection Lead + Legal |
| **High** | Confirmed counterfeit with evidence, multiple reports same source, significant commercial impact | 4 hours | Same-day to Brand Protection Lead |
| **Medium** | Suspected counterfeit, single unit, limited evidence | 24 hours | Daily batch review |
| **Low** | Inquiry about authenticity, no clear counterfeit evidence, general question | 48 hours | Weekly summary |

---

## 4. Triage Workflow

### Step 1: Acknowledge (Immediate)

- Auto-acknowledgment sent for web/email reports
- Include: Report ID, expected response time, what to expect next
- Do not make determinations or promises in acknowledgment

### Step 2: Initial Review (Within SLA)

**Agent Checklist:**
- [ ] Verify reporter contact information
- [ ] Review all submitted evidence (photos, documents, descriptions)
- [ ] Check serial number against database (if provided)
- [ ] Assess completeness of information
- [ ] Classify severity using Triage Matrix
- [ ] Determine if additional information needed

### Step 3: Information Gathering (If Needed)

Request from reporter:
- Clear photos of product (front, back, packaging, labels)
- Purchase receipt or invoice
- Seller information (name, website, physical address)
- Date and location of purchase
- Product model and capacity
- Any additional serial numbers or batch codes

**Template Message:**
> "Thank you for reporting a suspected counterfeit TwinMOS product. To help us investigate thoroughly, please provide the following additional information: [list]. Your report ID is CF-YYYY-XXXXXX."

### Step 4: Serial Number Verification

| Result | Action |
|:---|:---|
| Serial valid and registered | Likely false positive; request more evidence or close |
| Serial valid but unregistered | Possible genuine unregistered product; prompt registration |
| Serial not in database | Proceed with investigation; flag for deeper analysis |
| Serial on blocked list | Confirmed counterfeit; proceed to enforcement |
| Serial fails checksum | Confirmed counterfeit pattern; escalate immediately |

### Step 5: Evidence Assessment

**Photo Analysis Checklist:**
- [ ] Packaging quality (print quality, colors, materials)
- [ ] Label accuracy (model, capacity, serial format)
- [ ] Holographic seal presence and quality
- [ ] Product markings and finish
- [ ] PCB color and component layout (if visible)
- [ ] Compare against genuine product reference images

### Step 6: Classification & Routing

| Classification | Route To | Action |
|:---|:---|:---|
| Confirmed counterfeit | Brand Protection Lead | Full investigation + enforcement |
| Suspected counterfeit | Brand Protection Analyst | Investigation opened |
| False positive | Agent | Close with explanation and education |
| Insufficient evidence | Agent | Request more info or close with guidance |
| Authorized partner issue | Partner Management + Brand Protection | Partner review process |
| Safety concern | Brand Protection Lead + Legal + Product Safety | Immediate assessment |

---

## 5. Communication Templates

### 5.1 Acknowledgment

> Subject: TwinMOS Counterfeit Report Received — [Report ID]
>
> Thank you for taking the time to report a suspected counterfeit TwinMOS product. Your report has been received and assigned ID: [CF-YYYY-XXXXXX].
>
> Our Brand Protection team will review your submission and may contact you for additional information. Typical response time is [X hours/days].
>
> If you have immediate concerns about product safety, please discontinue use and contact our support team.

### 5.2 Additional Information Request

> Subject: Additional Information Needed — Counterfeit Report [Report ID]
>
> To proceed with our investigation of your counterfeit report, we need the following additional information:
> - [Specific items]
>
> Please reply to this email with the requested details.

### 5.3 Confirmed Counterfeit — Reporter

> Subject: Counterfeit Investigation Update — [Report ID]
>
> Our investigation has confirmed that the product you reported is counterfeit. We appreciate your vigilance in helping protect the TwinMOS brand and our customers.
>
> [If applicable: Guidance on obtaining genuine replacement]
> [If applicable: Information about retailer refund process]
>
> This case has been forwarded to our legal team for appropriate action.

### 5.4 False Positive — Reporter

> Subject: Product Authenticity Verification — [Report ID]
>
> Thank you for your report. After investigation, we have verified that your product is a genuine TwinMOS product.
>
> [If unregistered: We recommend registering your product for full warranty coverage at [URL].]
>
> If you have any other concerns, please contact our support team.

---

## 6. Escalation Triggers

Escalate immediately (regardless of severity) when:

- Product poses safety risk (overheating, electrical hazard)
- Authorized TwinMOS partner implicated
- Report from law enforcement or regulatory body
- Media inquiry related to counterfeit products
- Pattern of 5+ reports from same geographic area in 7 days
- Report involves government or institutional purchase
- Suspected organized criminal operation

---

## 7. Quality Assurance

| Check | Frequency | Owner |
|:---|:---|:---|
| Triage accuracy audit | Weekly (10% sample) | Brand Protection Lead |
| SLA compliance | Weekly | Operations Manager |
| Reporter satisfaction | Monthly (survey) | Customer Support Lead |
| False positive rate | Monthly | Brand Protection Lead |
| Case closure time | Monthly | Brand Protection Lead |

---

## 8. Document Sign-Off

| Role | Name | Signature | Date |
|:---|:---|:---|:---|
| Document Owner | | | |
| Brand Protection Lead | | | |
| Customer Support Lead | | | |
| Legal Counsel | | | |

---

**Canonical Location:**
`Corporate website development for TwinMOS/project documentation/J - Operations, Maintenance and End-User Guides/J.3 - Business Operations Guides/TwinMOSWebsiteCounterfeitReportTriage_Process.md`
