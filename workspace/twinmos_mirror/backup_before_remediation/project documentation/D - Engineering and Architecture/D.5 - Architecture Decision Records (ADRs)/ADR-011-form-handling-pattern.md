# ADR-011: Form Handling Pattern

| Field | Value |
|-------|-------|
| **ADR Number** | ADR-011 |
| **Date** | 2026-04-15 |
| **Status** | Accepted |
| **Deciders** | Engineering Lead |
| **Source** | Tech Stack §10, BRD §12 |

---

## 1. Context

TwinMOS has 6 public-facing forms across the website:

| Form | Collection | Phase |
|------|-----------|-------|
| Contact / General Enquiry | `form_submission` | P1 |
| Distributor Application | `form_submission` (type: distributor) | P1 |
| Newsletter Subscription | `newsletter_subscriber` | P1 |
| Warranty Registration | `warranty_registration` | P1 |
| RMA (Return Merchandise Authorisation) Request | `rma_request` | P2 |
| Partner Portal Signup | `partner_user` | P3 |

Each form requires:
- Client-side validation with real-time feedback before submission
- Bot protection (spam prevention for public forms)
- Server-side validation and sanitisation
- Persistence to Strapi database
- Downstream actions: email confirmation (Resend), CRM contact creation (HubSpot), optional webhook to build pipeline

The question is: **what pattern handles all 6 forms consistently with minimal duplication**?

---

## 2. Decision

**We will use a standardised form pattern:**

1. **React Hook Form** (`react-hook-form` v7) + **Zod** (`zod` v3) for client-side form state and validation — in Astro React islands
2. **Cloudflare Turnstile** embedded in every public form for bot protection
3. **Strapi REST API** (`POST /api/{collection}`) as the single backend endpoint for all submissions
4. **Strapi lifecycle hooks** (`afterCreate`) to trigger downstream actions (Resend, HubSpot, webhooks)
5. **RFC 9457 Problem Details** for all error responses (consistent with ADR-005)

---

## 3. Rationale

### Why React Hook Form + Zod

**React Hook Form** (RHF) is the de facto standard for React form management:
- Uncontrolled components by default — no re-render per keystroke (performance)
- `register()` API is minimal boilerplate; `handleSubmit()` wraps async submission
- Built-in integration with Zod via `@hookform/resolvers/zod`

**Zod** provides:
- Schema-first validation that is reusable across client and server (TypeScript inference)
- Precise error messages per field
- `z.object()` schemas for forms are co-located with the form component for maintainability

The combination provides:
- Real-time validation feedback (`mode: 'onChange'` or `'onBlur'`)
- Full TypeScript type safety for form data
- Single schema definition validates both client and server (same Zod schema imported by Strapi controller)

**Alternative: native HTML5 validation** — provides no custom messages, no cross-field validation, no server-error merging. Rejected for poor UX.

**Alternative: Formik** — heavier API, slower re-renders vs RHF, no native Zod adapter. Rejected.

### Why Cloudflare Turnstile (not reCAPTCHA)

| | Cloudflare Turnstile | Google reCAPTCHA v3 |
|--|---------------------|---------------------|
| Privacy | No tracking cookies | Google tracking |
| GDPR | Compliant | Requires consent |
| UX | Invisible / auto-managed | Score-based (invisible) |
| Free | Yes (unlimited) | Yes |
| Integration | Cloudflare ecosystem (same control plane) | Third-party |

Turnstile is already required by Cloudflare Pages/WAF integration; using it for forms creates a single control plane. reCAPTCHA would require a GDPR consent step before displaying forms — a conversion-rate impact.

### Why Strapi REST API (not a dedicated form handler)

Forms are backed by Strapi collections. Using Strapi's built-in REST endpoints (`POST /api/form-submissions`) means:
- No custom backend code for CRUD — Strapi handles persistence, validation, RBAC
- Downstream actions via Strapi `afterCreate` lifecycle hooks — co-located with the model
- Admin review of submissions in Strapi admin panel (no separate dashboard needed)
- Consistent error format (RFC 9457 via custom error middleware)

**Alternative: Netlify Forms / Formspree** — vendor lock-in; no control over where data is stored; no Strapi admin integration. Rejected.

**Alternative: Custom Next.js API routes** — project uses Astro SSG (no API routes at runtime). Rejected.

### Separation of Concerns: Client vs Server Validation

```
Client (Zod): fast feedback, good UX, never trusted
Server (Strapi controller + Zod): authoritative, security boundary
```

Zod schemas are defined once and imported on both sides. The server never trusts client-side validation results — it re-validates with the same schema in the Strapi controller.

---

## 4. Alternatives Considered

| Option | Reason Not Chosen |
|--------|------------------|
| **Native HTML forms (no JS validation)** | Poor UX — no real-time feedback, full page reload, generic browser error messages |
| **Formik + Yup** | Heavier than RHF; controlled components cause re-renders; Yup less ergonomic than Zod for TypeScript |
| **Server actions (Astro/Next.js)** | Astro SSG has no runtime server — server actions require SSR mode; not applicable for Phase 1/2 |
| **Netlify Forms** | Vendor lock-in to Netlify (project uses Cloudflare Pages); data exits project infrastructure |
| **Formspree** | External SaaS; data not in Strapi; no CRM hook; limited customisation |
| **reCAPTCHA v3** | Google tracking; GDPR consent required; friction when running in Cloudflare ecosystem |

---

## 5. Consequences

### Positive
- Single consistent pattern across all 6 forms — developer onboarding is straightforward
- Zod schema is source of truth for both frontend validation messages and backend sanitisation
- All submissions visible in Strapi admin — no separate form dashboard
- Lifecycle hooks decouple form persistence from downstream actions (Resend/HubSpot) — failure in email delivery does not block form save
- Turnstile integration is free, GDPR-compliant, and requires no user interaction for most visitors

### Negative / Trade-offs
- React island required for every form (~15–45 KB JS per form page) — acceptable given interactive validation UX requirement
- Strapi `afterCreate` hooks are synchronous within the request; heavy downstream actions (HubSpot API call) should be wrapped in `setImmediate()` / async fire-and-forget to not delay the HTTP response
- Zod schema must be kept in sync between frontend and Strapi backend (two repos). **Mitigation:** Shared schema package (npm workspace) to be evaluated if schema surface grows beyond 3 forms.

---

## 6. Implementation Notes

**Zod schema (shared between frontend island and Strapi controller):**
```typescript
// packages/schemas/src/contactForm.ts
import { z } from 'zod';

export const ContactFormSchema = z.object({
  name:    z.string().min(2).max(100),
  email:   z.string().email(),
  phone:   z.string().regex(/^\+?[\d\s\-()]{7,20}$/).optional(),
  country: z.string().length(2),    // ISO 3166-1 alpha-2
  subject: z.enum(['sales', 'support', 'media', 'partnership', 'other']),
  message: z.string().min(10).max(2000),
  turnstileToken: z.string().min(1),
  marketingConsent: z.boolean(),
});

export type ContactFormData = z.infer<typeof ContactFormSchema>;
```

**React island form component:**
```tsx
// src/components/islands/ContactForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ContactFormSchema, type ContactFormData } from '@twinmos/schemas/contactForm';

export default function ContactForm() {
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } =
    useForm<ContactFormData>({ resolver: zodResolver(ContactFormSchema) });

  async function onSubmit(data: ContactFormData) {
    // Turnstile token injected by widget before submit
    const res = await fetch('/api/form-submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json',
                 'Authorization': `Bearer ${import.meta.env.PUBLIC_STRAPI_TOKEN}` },
      body: JSON.stringify({ data }),
    });

    if (!res.ok) {
      const problem = await res.json(); // RFC 9457
      problem.errors?.forEach(({ field, message }: { field: string; message: string }) =>
        setError(field as keyof ContactFormData, { message })
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* fields */}
      <div className="cf-turnstile" data-sitekey={import.meta.env.PUBLIC_TURNSTILE_SITE_KEY} />
      <button type="submit" disabled={isSubmitting}>Send</button>
    </form>
  );
}
```

**Strapi lifecycle hook (downstream actions):**
```typescript
// src/api/form-submission/content-types/form-submission/lifecycles.ts
export default {
  async afterCreate({ result }) {
    setImmediate(async () => {
      await emailService.sendContactConfirmation(result);
      await crmService.pushContactToHubSpot(result);
    });
  },
};
```

---

## 7. Related ADRs

- ADR-004: React as Island Framework
- ADR-009: i18n (form labels in Astro i18n JSON files)
- ADR-012: CRM Selection (HubSpot integration triggered from form lifecycle hook)
- Integration Spec: Cloudflare Turnstile
- Integration Spec: Resend Email
- Integration Spec: HubSpot CRM
