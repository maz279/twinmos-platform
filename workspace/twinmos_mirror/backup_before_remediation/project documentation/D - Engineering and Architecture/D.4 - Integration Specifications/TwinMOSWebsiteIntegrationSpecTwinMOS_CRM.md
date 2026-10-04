# TwinMOS Website — Integration Specification: CRM (HubSpot)

| Field | Value |
|-------|-------|
| **Document ID** | TWN-INT-CRM-001 |
| **Version** | 1.0 |
| **Status** | Accepted |
| **Phase** | P1 (contact create); P2 (pipeline, lead scoring) |
| **Date** | 2026-05-01 |
| **Owner** | Engineering Lead |
| **Source** | Tech Stack §14.4; BRD §25.1 |

---

## 1. Overview

The TwinMOS Website integrates with **HubSpot CRM** to capture leads from website forms and distribute them to the sales team. All public forms (contact, distributor application, newsletter, support enquiry) create or update HubSpot contacts automatically.

### 1.1 CRM Selection

| Platform | Decision |
|----------|---------|
| **HubSpot** | **Selected** — Free tier generous (1M contacts), strong API, GDPR consent fields, established partner ecosystem |
| Zoho CRM | Rejected — more complex API, less ecosystem |
| Salesforce | Rejected — enterprise cost, overkill for Phase 1 |
| Pipedrive | Rejected — sales-only, no marketing automation |

See: ADR-012 CRM Selection.

### 1.2 HubSpot Plan

| Phase | Plan | Cost |
|-------|------|------|
| Phase 1 | Free | $0/mo |
| Phase 2+ | Starter | $20/mo (if Marketing Hub needed) |

---

## 2. Integration Architecture

```
User submits form on TwinMOS website
             │
             ▼
  Astro (React island form)
             │  POST
             ▼
  Strapi API /api/form-submissions
             │
     ┌───────┴───────────┐
     │                   │
     ▼                   ▼
Save to DB          FormSubmission.afterCreate
(Strapi)            Lifecycle Hook
                         │
                    Validate Turnstile
                    Build HubSpot payload
                         │
                    POST HubSpot Contacts API
                    (async, non-blocking)
                         │
                ┌────────┴────────┐
                │                 │
          Success             Failure
                │                 │
        Log to audit         Retry (3x)
                               → Dead letter
```

### 2.1 Data Flow

| Direction | System | Event |
|-----------|--------|-------|
| Outbound | Strapi → HubSpot | New form submission creates/updates contact |
| Inbound | HubSpot → Strapi | Partner status sync (Phase 2, read-only) |

---

## 3. HubSpot Contact Object Mapping

### 3.1 TwinMOS Form → HubSpot Contact Field Mapping

| TwinMOS Form Field | HubSpot Property | Notes |
|-------------------|-----------------|-------|
| `name` | `firstname` + `lastname` | Split on first space |
| `email` | `email` | Required; de-duplicates contacts |
| `phone` | `phone` | |
| `company` | `company` | |
| `country` | `country` | ISO country name |
| `message` | `message` (custom) | First 500 chars |
| `formType` | `hs_lead_status` | Maps to HubSpot lead status |
| `marketingConsent` | `hs_email_optout` | `true` = opted in (reversed) |
| `consentTimestamp` | `twinmos_consent_timestamp` | Custom property |
| `consentIp` | `twinmos_consent_ip` | Custom property (GDPR) |
| `locale` | `twinmos_locale` | Website locale at submission |
| `submittedAt` | `twinmos_form_submitted_at` | ISO timestamp |
| Strapi form submission ID | `twinmos_form_submission_id` | For back-reference |

### 3.2 Form Type to HubSpot Lead Status Mapping

| TwinMOS `formType` | HubSpot `hs_lead_status` | HubSpot Pipeline |
|-------------------|--------------------------|-----------------|
| `contact` | `NEW` | General Enquiries |
| `distributor_application` | `IN_PROGRESS` | Distributor Pipeline |
| `newsletter` | `SUBSCRIBED` | Marketing (no pipeline) |
| `support` | `NEW` | Support Tickets |
| `careers` | `NEW` | HR (no pipeline) |
| `feedback` | `OTHER` | No pipeline |

---

## 4. API Integration

### 4.1 Authentication

| Parameter | Value |
|-----------|-------|
| Method | HubSpot Private App token |
| Header | `Authorization: Bearer {HUBSPOT_API_TOKEN}` |
| Environment variable | `HUBSPOT_API_TOKEN` (Strapi `.env`) |
| Scope required | `crm.objects.contacts.write`, `crm.objects.contacts.read` |

### 4.2 Contact Create/Update Endpoint

```
POST https://api.hubapi.com/crm/v3/objects/contacts
```

Or upsert (create or update by email):
```
POST https://api.hubapi.com/crm/v3/objects/contacts/batch/upsert
```

**Request body:**
```json
{
  "properties": {
    "email": "ahmed@example.com",
    "firstname": "Ahmed",
    "lastname": "Al-Rashidi",
    "phone": "+971501234567",
    "company": "Tech Solutions LLC",
    "country": "United Arab Emirates",
    "hs_lead_status": "NEW",
    "twinmos_form_type": "contact",
    "twinmos_consent_timestamp": "2026-05-01T10:30:00Z",
    "twinmos_consent_ip": "192.0.2.1",
    "twinmos_locale": "en",
    "twinmos_form_submission_id": "42"
  }
}
```

**Upsert logic:** If a contact with the same email already exists, update it. If not, create it.

### 4.3 Strapi Implementation

**File:** `src/services/crmService.ts`

```typescript
import axios from 'axios';

const HUBSPOT_API = 'https://api.hubapi.com/crm/v3/objects/contacts';

export async function pushContactToHubSpot(submission: FormSubmission): Promise<void> {
  const [firstname, ...rest] = submission.name.trim().split(' ');
  const lastname = rest.join(' ') || '';

  const properties = {
    email: submission.email,
    firstname,
    lastname,
    phone: submission.phone ?? '',
    company: submission.company ?? '',
    country: submission.country ?? '',
    hs_lead_status: mapFormTypeToLeadStatus(submission.formType),
    twinmos_form_type: submission.formType,
    twinmos_consent_timestamp: submission.marketingConsent
      ? submission.submittedAt.toISOString()
      : '',
    twinmos_consent_ip: submission.ipAddress ?? '',
    twinmos_locale: submission.locale ?? 'en',
    twinmos_form_submission_id: String(submission.id),
  };

  try {
    await axios.post(
      `${HUBSPOT_API}/batch/upsert`,
      {
        inputs: [{ id: submission.email, idProperty: 'email', properties }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUBSPOT_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        timeout: 8000,
      }
    );
  } catch (error) {
    strapi.log.error('[CRM] HubSpot push failed:', error);
    // Re-throw for retry handler
    throw error;
  }
}
```

**Lifecycle hook:** `src/api/form-submission/content-types/form-submission/lifecycles.ts`

```typescript
import { pushContactToHubSpot } from '../../../../services/crmService';

export default {
  async afterCreate({ result }) {
    // Non-blocking CRM push
    pushContactToHubSpot(result).catch((err) => {
      strapi.log.error('[CRM] Failed after all retries:', err);
      // Log to audit_log collection
    });
  },
};
```

---

## 5. Rate Limits & Error Handling

### 5.1 HubSpot Rate Limits

| Limit Type | Value |
|-----------|-------|
| Daily API calls (Free) | 250,000 |
| Requests per 10 seconds | 100 |
| Burst (Free) | 40 req/10s |

For Phase 1 volume (<500 form submissions/day), HubSpot Free limits are not a concern.

### 5.2 Error Handling & Retry

| Error | Handling |
|-------|---------|
| Network timeout | Retry after 5s, 30s, 120s (3 attempts) |
| 400 Bad Request | Log validation error to audit_log; do not retry |
| 401 Unauthorized | Alert via Sentry; invalidate cached token |
| 429 Rate Limited | Back off per HubSpot `Retry-After` header |
| 5xx Server Error | Retry 3x; dead letter to audit_log |

All CRM failures are **non-blocking** — the website form submission succeeds regardless of CRM outcome.

---

## 6. Lead Routing (HubSpot Workflows)

Configured within HubSpot (no Strapi involvement):

| Condition | Routing Action |
|-----------|---------------|
| `country = Bangladesh` | Assign to South Asia team |
| `country = United Arab Emirates` | Assign to MEA team |
| `formType = distributor_application` | Assign to Distributor pipeline + notify distribution manager |
| `formType = newsletter` | Enroll in newsletter welcome sequence |
| `marketingConsent = true` | Enroll in product launch email series |

---

## 7. Phase 2 Enhancements

| Feature | Description |
|---------|-------------|
| Deal pipeline | Distributor applications auto-create HubSpot deals |
| Lead scoring | Score based on country tier, company size, product interest |
| Partner status sync | HubSpot → Strapi reads partner tier for portal access control |
| CRM webhook inbound | HubSpot notifies Strapi when partner status changes |

---

## 8. GDPR / Privacy Compliance

- Marketing consent (`marketingConsent: true`) required before adding to email sequences
- Consent timestamp and IP stored in HubSpot custom properties
- UAE PDPL, GDPR, Bangladesh Data Protection compliance: consent stored in Strapi `form_submission` and mirrored to HubSpot
- HubSpot GDPR Compliance features enabled in account settings
- Contact deletion: `DELETE /api/crm/v3/objects/contacts/{id}` when user requests data deletion (right to erasure)

---

## 9. Environment Variables

| Variable | Description |
|----------|-------------|
| `HUBSPOT_API_TOKEN` | HubSpot Private App access token |
| `HUBSPOT_PORTAL_ID` | HubSpot account portal ID |

---

## 10. Related Documents

- [TwinMOSWebsiteWebhook_Specification.md](../D.3 - API Specifications/TwinMOSWebsiteWebhook_Specification.md)
- [TwinMOSWebsiteIntegrationSpecResend_Email.md](TwinMOSWebsiteIntegrationSpecResend_Email.md)
- ADR-012: CRM Selection — HubSpot vs Zoho
