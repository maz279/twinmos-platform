# ADR-012: CRM Selection — HubSpot vs Zoho CRM

| Field | Value |
|-------|-------|
| **ADR Number** | ADR-012 |
| **Date** | 2026-04-15 |
| **Status** | Accepted |
| **Deciders** | Engineering Lead, Project Owner |
| **Source** | Tech Stack §14.4 |

---

## 1. Context

TwinMOS requires a CRM (Customer Relationship Management) platform to:
- Capture leads from all website forms (contact, distributor application, partner enquiry)
- Track GDPR/PDPL consent timestamps and IP addresses per contact
- Route leads to the appropriate regional sales team (MEA, South Asia, APAC, etc.)
- Support marketing email campaigns (Phase 2+)
- Provide visibility for the small (2-person) sales/operations team
- Integrate cleanly with Strapi via webhook/API (no manual data entry)

### Budget Constraint

- Phase 1: Free or <$30/month for CRM
- Phase 3: <$50/month for CRM at full contact volume

---

## 2. Decision

**We will use HubSpot CRM (Free tier for Phase 1, upgrade to Starter $20/month as lead volume requires).**

---

## 3. Rationale

### HubSpot Free Tier is Exceptional for Phase 1

HubSpot's free CRM tier includes:

| Feature | HubSpot Free | Zoho CRM Free |
|---------|-------------|--------------|
| Contacts | **Unlimited** | 1 user (3 users max) |
| Deals | Unlimited | Limited |
| Users | Unlimited | 3 max |
| Email tracking | Yes (200 notif/mo) | No |
| Forms | Yes | No (paid add-on) |
| Pipeline views | 1 | 1 |
| API access | Yes | Yes |
| Data storage | 1M records | 1 GB |

HubSpot Free provides unlimited contacts and full API access — the only meaningful free-tier limitations are email send volume (not relevant for Phase 1) and advanced automation (adequate in Starter).

### API Quality and Ecosystem Maturity

**HubSpot API v3** is a well-documented, stable REST API:
- `POST /crm/v3/objects/contacts/batch/upsert` — idempotent contact creation with deduplication by email
- `POST /crm/v3/objects/deals` — deal creation with association to contact
- Strong TypeScript SDK (`@hubspot/api-client`)
- Webhooks for two-way sync (HubSpot → Strapi for partner status updates)

Zoho CRM's API is functional but less widely adopted, has a steeper learning curve, and historically has more breaking changes between API versions.

### GDPR/PDPL Consent Tracking

HubSpot has built-in GDPR consent tracking:
- Per-contact `legal_basis` property
- Consent timestamp storage
- Data subject request handling (right to erasure) through HubSpot's GDPR tools

This is critical for TwinMOS operating under GDPR (EU customers) and UAE PDPL (regional operations). Implementing equivalent consent tracking manually in Zoho would require custom field setup and process design.

### Industry Standard for B2B

HubSpot is the industry-standard CRM for B2B technology companies of TwinMOS's size:
- Integration with LinkedIn Sales Navigator (Phase 2)
- Meeting scheduler (Phase 2: distributor onboarding calls)
- Sequence automation for distributor follow-up
- Marketing Hub integration for email campaigns (Phase 3)

The TwinMOS sales/operations team is likely to find HubSpot familiar if they have prior B2B experience.

### Total Cost of Ownership

| Phase | HubSpot | Zoho CRM |
|-------|---------|---------|
| Phase 1 | **$0/month** | $0/month (3-user max) |
| Phase 2 | **$20/month (Starter, 2 seats)** | $14/month (Standard, 2 seats) |
| Phase 3 | **$20/month** | $14/month |

The $6/month difference (Phase 2+) does not justify migration risk or inferior GDPR tooling.

---

## 4. Alternatives Considered

| Option | Monthly Cost | Reason Not Chosen |
|--------|-------------|------------------|
| **Zoho CRM** | $0–$14 | 3-user cap on free tier; weaker API ecosystem; less GDPR tooling; lower industry adoption → harder to hire for |
| **Salesforce (Essentials)** | $25/seat | Enterprise complexity for 2-person team; expensive; over-engineered for Phase 1 scope |
| **Pipedrive** | $14/seat | Sales pipeline focus, not marketing hub; no free tier; weaker contact form integration |
| **ActiveCampaign** | $29/mo | Marketing automation-first, CRM is secondary; better suited to ecommerce than B2B hardware |
| **Custom CRM (Strapi collections only)** | $0 | No email marketing, no pipeline views, no reporting, no sales team adoption — rejected for poor operations fit |
| **Notion / Airtable as CRM** | $0–$20 | No pipeline automation, no email sequences, no API suitable for real-time webhook push |

---

## 5. Consequences

### Positive
- Phase 1: $0 cost, full API access, unlimited contacts
- GDPR consent tracking built-in — no custom implementation needed
- Strapi integration via `FormSubmission.afterCreate` lifecycle hook → HubSpot Contacts API (non-blocking async)
- Sales team has visual pipeline and reporting from day one
- HubSpot Starter ($20/mo) is a well-understood upgrade trigger when automation is needed

### Negative / Trade-offs
- Vendor dependency: contact data lives in HubSpot SaaS. **Mitigated:** HubSpot provides full data export at any time; GDPR requires data portability; Strapi retains `form_submission` records as canonical source
- HubSpot API rate limits: 100 req/10s (standard). **Mitigated:** Form submissions at TwinMOS volume will be well under 10/min; batch upsert used when bulk import needed
- `emailreplyparser` and custom sequence logic require HubSpot Starter ($20/mo). **Mitigated:** Phase 1 uses free tier; Starter upgrade is a business decision when lead volume justifies it

### Integration Architecture

```
Browser → Astro form island → POST /api/form-submissions (Strapi)
  → Strapi saves to form_submission collection
  → afterCreate lifecycle hook fires (async, non-blocking)
    → HubSpot Contacts API: upsert contact (dedup by email)
    → HubSpot Deals API: create deal (if distributor application)
    → Resend: send confirmation email to submitter
```

The form save to Strapi is never blocked by the HubSpot API call. If HubSpot is unreachable:
1. Strapi logs the failure to `audit_log` collection
2. Retry up to 3 times with exponential backoff (5s → 30s → 120s)
3. Dead letter: `audit_log` entry flagged `crm_sync: failed` for manual review

---

## 6. Implementation Notes

**Strapi CRM service (Phase 1):**
```typescript
// src/services/crmService.ts
import { Client } from '@hubspot/api-client';

const hubspot = new Client({ accessToken: process.env.HUBSPOT_API_TOKEN });

export async function pushContactToHubSpot(submission: FormSubmission): Promise<void> {
  await hubspot.crm.contacts.batchApi.upsert({
    inputs: [{
      idProperty: 'email',
      id: submission.email,
      properties: {
        email:          submission.email,
        firstname:      submission.name.split(' ')[0],
        lastname:       submission.name.split(' ').slice(1).join(' '),
        phone:          submission.phone ?? '',
        country:        submission.country,
        company:        submission.company ?? '',
        hs_lead_status: 'NEW',
        twinmos_form_type:          submission.formType,
        twinmos_marketing_consent:  String(submission.marketingConsent),
        twinmos_consent_timestamp:  submission.consentTimestamp?.toISOString() ?? '',
        twinmos_consent_ip:         submission.consentIp ?? '',
        twinmos_locale:             submission.locale,
      },
    }],
  });
}
```

**HubSpot custom properties to create (one-time setup):**
- `twinmos_form_type` (enumeration)
- `twinmos_marketing_consent` (boolean)
- `twinmos_consent_timestamp` (datetime)
- `twinmos_consent_ip` (single-line text)
- `twinmos_locale` (single-line text)

---

## 7. Related ADRs

- ADR-001: Stack Selection
- ADR-011: Form Handling Pattern (forms that feed CRM)
- Integration Spec: TwinMOS CRM (HubSpot) — full integration specification
