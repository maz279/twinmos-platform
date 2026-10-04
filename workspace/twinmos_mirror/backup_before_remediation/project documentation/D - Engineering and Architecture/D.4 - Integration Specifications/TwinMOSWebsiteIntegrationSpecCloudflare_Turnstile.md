# TwinMOS Website — Integration Specification: Cloudflare Turnstile

| Field | Value |
|-------|-------|
| **Document ID** | TWN-INT-TURNSTILE-001 |
| **Version** | 1.0 |
| **Status** | Accepted |
| **Phase** | P1 |
| **Date** | 2026-05-01 |
| **Owner** | Engineering Lead |
| **Source** | Tech Stack §18.2; BRD §22.1 |

---

## 1. Overview

**Cloudflare Turnstile** provides CAPTCHA-free bot protection for all public-facing forms on the TwinMOS website. It replaces traditional CAPTCHAs (Google reCAPTCHA, hCAPTCHA) with a privacy-preserving challenge mechanism that is invisible or minimally disruptive to real users.

### 1.1 Why Turnstile

| Criterion | Assessment |
|-----------|-----------|
| User experience | Non-intrusive — managed widget auto-solves for most users |
| Privacy | No Google dependency; GDPR-compliant; no cross-site tracking |
| Cost | Free for all use cases |
| Integration | Simple HTML widget + server-side token verification |
| Cloudflare ecosystem | Natively integrated with Cloudflare WAF and Pages |

---

## 2. Widget Types

Turnstile offers three widget modes:

| Mode | Behaviour | Use Case |
|------|-----------|---------|
| `managed` | Cloudflare decides: invisible or interactive challenge | Default for all TwinMOS forms |
| `non-interactive` | Always invisible to user | Low-risk forms (newsletter signup) |
| `invisible` | Completely invisible, no UI element | Embedded silently in page |

**TwinMOS default:** `managed` for all forms (balance of security and UX).

---

## 3. Implementation

### 3.1 Site Configuration

| Property | Value |
|----------|-------|
| Site key | `TURNSTILE_SITE_KEY` (Astro env var — public, safe in client code) |
| Secret key | `TURNSTILE_SECRET_KEY` (Strapi env var — **server-side only, never in client**) |
| Widget action | Descriptive string per form (e.g., `contact`, `warranty`, `distributor`) |
| Token expiry | 300 seconds (5 minutes) — single-use |

### 3.2 Frontend — React Island Form Component

All form islands include the Turnstile widget:

**Script loading (in `LayoutBase.astro`):**
```html
<!-- Loaded once for all pages; deferred -->
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
```

**React form component (`ContactForm.tsx`):**
```tsx
import { useState, useRef, useEffect } from 'react';

export default function ContactForm() {
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Render Turnstile widget after component mounts
    if (window.turnstile && turnstileRef.current) {
      window.turnstile.render(turnstileRef.current, {
        sitekey: import.meta.env.PUBLIC_TURNSTILE_SITE_KEY,
        action: 'contact',
        callback: (token: string) => setTurnstileToken(token),
        'expired-callback': () => setTurnstileToken(null),
        'error-callback': () => setTurnstileToken(null),
        theme: 'light',
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turnstileToken) {
      setError('Please wait for the security check to complete.');
      return;
    }
    // Include turnstileToken in form payload
    await submitForm({ ...formData, turnstileToken });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <div ref={turnstileRef} />  {/* Turnstile widget renders here */}
      <button type="submit" disabled={!turnstileToken}>Send Message</button>
    </form>
  );
}
```

### 3.3 Hidden Field Fallback (Non-React Forms)

For simple forms without React:
```html
<form action="/api/form-submissions" method="POST">
  <!-- form fields -->
  <div class="cf-turnstile"
       data-sitekey="TURNSTILE_SITE_KEY"
       data-action="warranty">
  </div>
  <!-- Token auto-injected as cf-turnstile-response hidden field -->
  <button type="submit">Register Warranty</button>
</form>
```

---

## 4. Server-Side Token Verification

Turnstile tokens must be verified on the **server side** before processing any form submission.

### 4.1 Verification Endpoint

```
POST https://challenges.cloudflare.com/turnstile/v0/siteverify
Content-Type: application/json

{
  "secret": "{TURNSTILE_SECRET_KEY}",
  "response": "{TOKEN_FROM_WIDGET}",
  "remoteip": "{USER_IP}"  // Optional but recommended
}
```

**Success response:**
```json
{
  "success": true,
  "challenge_ts": "2026-05-01T10:30:00.000Z",
  "hostname": "twinmos.com",
  "action": "contact",
  "cdata": ""
}
```

**Failure response:**
```json
{
  "success": false,
  "error-codes": ["invalid-input-response"]
}
```

### 4.2 Strapi Verification Middleware

**File:** `src/middlewares/verifyTurnstile.ts`

```typescript
const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function verifyTurnstileToken(
  token: string,
  remoteIp: string
): Promise<boolean> {
  if (!token) return false;

  const response = await fetch(VERIFY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: token,
      remoteip: remoteIp,
    }),
    signal: AbortSignal.timeout(5000), // 5s timeout
  });

  const data = await response.json();
  return data.success === true;
}
```

**Usage in form-submission controller:**
```typescript
async create(ctx) {
  const { turnstileToken, ...formData } = ctx.request.body.data;
  const remoteIp = ctx.request.ip;

  const valid = await verifyTurnstileToken(turnstileToken, remoteIp);
  if (!valid) {
    return ctx.forbidden({
      type: 'https://api.twinmos.com/errors/captcha-failed',
      title: 'CAPTCHA Verification Failed',
      status: 403,
      detail: 'Security challenge failed. Please refresh the page and try again.',
    });
  }

  // Proceed with form processing
  return super.create(ctx);
}
```

---

## 5. Forms Protected by Turnstile

| Form | Route | Action String |
|------|-------|--------------|
| Contact form | `/contact` | `contact` |
| Distributor application | `/partners/apply` | `distributor_application` |
| Warranty registration | `/support/warranty` | `warranty` |
| RMA request | `/support/rma` | `rma_request` |
| Newsletter signup | Site-wide footer | `newsletter` |
| Careers application | `/careers/{job}` | `careers` |

---

## 6. Testing & Development

### 6.1 Test Keys (Cloudflare-Provided)

Cloudflare provides dummy keys that bypass the challenge for CI and development:

| Key Type | Value | Behaviour |
|----------|-------|----------|
| Site key (always passes) | `1x00000000000000000000AA` | Token always valid |
| Site key (always blocks) | `2x00000000000000000000AB` | Token always invalid |
| Site key (forces interaction) | `3x00000000000000000000FF` | Shows visible challenge |
| Secret key (test) | `1x0000000000000000000000000000000AA` | Validates any test token |

**`.env.development`:**
```
PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

**`.env.production`:**
```
PUBLIC_TURNSTILE_SITE_KEY={real site key from Cloudflare dashboard}
TURNSTILE_SECRET_KEY={real secret key from Cloudflare dashboard}
```

### 6.2 Automated Testing

In Playwright E2E tests, the `managed` widget auto-passes with test keys. No mocking required when using Cloudflare test site keys.

---

## 7. Error Handling

| Scenario | Behaviour |
|----------|----------|
| Widget fails to load (JS blocked) | Form submit button remains disabled; user sees "Security check loading..." |
| Token expired (user took >5 min) | `expired-callback` fires; token reset; user must re-interact |
| Verification API timeout | Server returns 503; form shows "Service temporarily unavailable" |
| Invalid token | Server returns 403 `captcha-failed`; form shows "Security check failed, please try again" |
| Network error during verification | Fail open or fail closed based on risk level (contact form: fail open with logging; RMA: fail closed) |

---

## 8. Privacy Compliance

Cloudflare Turnstile characteristics:
- Does **not** set persistent cookies
- Does **not** fingerprint users cross-site
- Does **not** share data with Google
- GDPR-compliant by design — no consent required for Turnstile widget
- Data processed by Cloudflare under their DPA (EU Standard Contractual Clauses)

---

## 9. Environment Variables

| Variable | Location | Description |
|----------|----------|-------------|
| `PUBLIC_TURNSTILE_SITE_KEY` | Astro (`import.meta.env`) | Public site key — safe in client code |
| `TURNSTILE_SECRET_KEY` | Strapi (`.env`) | Private secret key — server-side only |

---

## 10. Related Documents

- [TwinMOSWebsiteAPIRateLimiting_Spec.md](../D.3 - API Specifications/TwinMOSWebsiteAPIRateLimiting_Spec.md)
- [TwinMOSWebsiteAPIErrorHandling_RFC9457.md](../D.3 - API Specifications/TwinMOSWebsiteAPIErrorHandling_RFC9457.md)
- [TwinMOSWebsiteIntegrationSpecTwinMOS_CRM.md](TwinMOSWebsiteIntegrationSpecTwinMOS_CRM.md)
