# TwinMOS Website — Integration Specification: Resend Email

| Field | Value |
|-------|-------|
| **Document ID** | TWN-INT-EMAIL-001 |
| **Version** | 1.0 |
| **Status** | Accepted |
| **Phase** | P1 |
| **Date** | 2026-05-01 |
| **Owner** | Engineering Lead |
| **Source** | Tech Stack §15; BRD §24.2 |

---

## 1. Overview

**Resend** is the transactional email provider for the TwinMOS Website. It handles all automated customer-facing emails — form confirmations, warranty notifications, RMA updates, newsletter welcomes, and partner credentials.

### 1.1 Why Resend

| Criterion | Assessment |
|-----------|-----------|
| Developer experience | Excellent — native TypeScript SDK, React Email integration |
| Reliability | High deliverability, SPF/DKIM/DMARC support |
| Cost | Free tier: 100 emails/day, 3,000/month; Pro $20/mo: 50,000/mo |
| Templates | React Email components → HTML (no separate template service needed) |
| Webhooks | Built-in delivery event webhooks |

---

## 2. Architecture

```
Strapi emailService
       │
       │  @resend/node SDK
       ▼
   Resend API
  (api.resend.com)
       │
       ├──► Customer inbox
       └──► Delivery webhooks → Strapi (bounce/complaint handling)
```

### 2.1 Sender Domain

| Property | Value |
|----------|-------|
| From address | `noreply@twinmos.com` |
| Reply-To | `support@twinmos.com` (support emails) or `sales@twinmos.com` (distributor) |
| Sender name | `TwinMOS Technologies` |

**Required DNS records** (in Cloudflare DNS):
```
TXT  @      v=spf1 include:_spf.resend.com ~all
CNAME rm._domainkey  rm._domainkey.resend.com  (DKIM)
TXT  _dmarc  v=DMARC1; p=quarantine; rua=mailto:dmarc@twinmos.com
```

---

## 3. Email Templates

All templates are built with **React Email** components and compiled to HTML by the Resend SDK.

### 3.1 Template Inventory

| Template ID | Trigger | Subject |
|------------|---------|---------|
| `contact-confirmation` | Contact form submitted | "We received your message — TwinMOS" |
| `distributor-application` | Distributor application submitted | "Your distributor application — TwinMOS" |
| `newsletter-welcome` | Newsletter signup confirmed | "Welcome to TwinMOS updates" |
| `warranty-registered` | Warranty registration confirmed | "Warranty registered — {Product Name}" |
| `rma-created` | RMA request submitted (P2) | "RMA Request #{rmaNumber} received" |
| `rma-status-update` | RMA status changes (P2) | "Your RMA #{rmaNumber} status update" |
| `partner-invite` | Partner portal account created (P3) | "Your TwinMOS Partner Portal access" |
| `order-confirmation` | Order placed (P3) | "Order #{orderNumber} confirmed — TwinMOS" |

### 3.2 Template Structure (React Email)

**File location:** `backend/src/emails/templates/`

```tsx
// contact-confirmation.tsx
import {
  Html, Head, Body, Container, Heading, Text, Button, Hr, Img
} from '@react-email/components';

interface ContactConfirmationProps {
  recipientName: string;
  message: string;
  submissionId: string;
  locale: string;
}

export default function ContactConfirmation({
  recipientName,
  message,
  submissionId,
}: ContactConfirmationProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f5f5f5' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff' }}>
          <Img
            src="https://media.twinmos.com/email/twinmos-logo.png"
            alt="TwinMOS Technologies"
            width={160}
            height={40}
          />
          <Heading style={{ color: '#003087' }}>
            Thanks, {recipientName}!
          </Heading>
          <Text>
            We received your message and will get back to you within 1–2 business days.
          </Text>
          <Text style={{ color: '#666', fontSize: '14px' }}>
            Reference: #{submissionId}
          </Text>
          <Hr />
          <Text style={{ fontSize: '12px', color: '#999' }}>
            TwinMOS Technologies · C-9, Dubai Airport Free Zone, Dubai, UAE
            · support@twinmos.com
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
```

---

## 4. SDK Integration

### 4.1 Installation

```bash
npm install @resend/node @react-email/components
npm install react react-dom  # Required by React Email
```

### 4.2 Strapi Email Service

**File:** `src/services/emailService.ts`

```typescript
import { Resend } from 'resend';
import { render } from '@react-email/render';
import ContactConfirmation from '../emails/templates/contact-confirmation';
import WarrantyRegistered from '../emails/templates/warranty-registered';
// ... other imports

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  idempotencyKey?: string;
}

async function sendEmail(options: SendEmailOptions): Promise<void> {
  const { data, error } = await resend.emails.send({
    from: 'TwinMOS Technologies <noreply@twinmos.com>',
    to: [options.to],
    subject: options.subject,
    html: options.html,
    reply_to: options.replyTo,
    headers: options.idempotencyKey
      ? { 'X-Resend-Idempotency-Key': options.idempotencyKey }
      : undefined,
  });

  if (error) {
    strapi.log.error('[Email] Resend error:', error);
    throw new Error(`Email send failed: ${error.message}`);
  }

  strapi.log.info('[Email] Sent:', data?.id);
}

export async function sendContactConfirmation(submission: FormSubmission): Promise<void> {
  const html = await render(
    ContactConfirmation({
      recipientName: submission.name,
      message: submission.message ?? '',
      submissionId: String(submission.id),
      locale: submission.locale ?? 'en',
    })
  );

  await sendEmail({
    to: submission.email,
    subject: 'We received your message — TwinMOS',
    html,
    replyTo: 'support@twinmos.com',
    idempotencyKey: `contact-confirmation-${submission.id}`,
  });
}

export async function sendWarrantyConfirmation(warranty: WarrantyRegistration): Promise<void> {
  const html = await render(
    WarrantyRegistered({
      recipientName: warranty.customerName,
      registrationNumber: warranty.registrationNumber,
      productName: warranty.product?.name ?? 'your product',
      purchaseDate: warranty.purchaseDate,
    })
  );

  await sendEmail({
    to: warranty.customerEmail,
    subject: `Warranty registered — ${warranty.product?.name}`,
    html,
    idempotencyKey: `warranty-registered-${warranty.id}`,
  });
}
```

---

## 5. Idempotency

Every email send includes an `X-Resend-Idempotency-Key` header derived from the entity ID:

| Template | Idempotency Key Pattern |
|----------|------------------------|
| Contact confirmation | `contact-confirmation-{submissionId}` |
| Warranty registered | `warranty-registered-{warrantyId}` |
| RMA created | `rma-created-{rmaId}` |
| RMA status | `rma-status-{rmaId}-{status}` |
| Newsletter welcome | `newsletter-welcome-{subscriberId}` |

Resend ignores duplicate sends with the same idempotency key within 24 hours, preventing duplicate emails on webhook retries.

---

## 6. Delivery Event Webhooks (Resend → Strapi)

Resend sends webhook events when email delivery status changes.

### 6.1 Webhook Endpoint

```
POST https://cms.twinmos.com/api/email-webhooks/resend
```

Secured with Resend webhook signing secret (`RESEND_WEBHOOK_SECRET`).

### 6.2 Handled Events

| Resend Event | Strapi Action |
|------------|--------------|
| `email.sent` | Log delivery in `audit_log` |
| `email.delivered` | Update subscriber `lastEmailDelivered` timestamp |
| `email.bounced` | Mark subscriber `email_status: bounced`; prevent future sends |
| `email.complained` | Mark subscriber `email_status: complained`; unsubscribe from marketing |
| `email.delivery_delayed` | Log warning; no action |
| `email.clicked` | Log in analytics (Phase 2) |
| `email.opened` | Log in analytics (Phase 2) |

### 6.3 Webhook Handler

```typescript
// src/api/email-webhooks/routes/resend.ts
export default {
  routes: [
    {
      method: 'POST',
      path: '/email-webhooks/resend',
      handler: 'emailWebhook.handleResend',
      config: { auth: false, policies: ['global::verifyResendWebhook'] },
    },
  ],
};
```

---

## 7. Rate Limits & Monitoring

### 7.1 Resend Rate Limits

| Plan | Monthly limit | Daily limit |
|------|-------------|------------|
| Free | 3,000 emails | 100 emails |
| Pro | 50,000 emails | No daily limit |

Phase 1 expected volume: <200 emails/day → Free tier sufficient. Upgrade to Pro when needed.

### 7.2 Monitoring

- All send attempts logged in Strapi `audit_log` with Resend email ID
- Bounce rate monitored via Resend dashboard (target: <2%)
- Complaint rate monitored (target: <0.1%) — HubSpot unsubscribes on complaint
- Sentry alert if >5 email send failures in 10 minutes

---

## 8. Localisation

Phase 1: English-only templates.

Phase 2+: Templates support locale parameter; Arabic, Bengali, Hindi variants created:
- RTL support in templates for Arabic (Resend supports HTML with `dir="rtl"`)
- Subject lines localised per `locale` field on the submission

---

## 9. Environment Variables

| Variable | Description |
|----------|-------------|
| `RESEND_API_KEY` | Resend API key (starts with `re_`) |
| `RESEND_WEBHOOK_SECRET` | Webhook signature verification secret |

---

## 10. Related Documents

- [TwinMOSWebsiteIntegrationSpecTwinMOS_CRM.md](TwinMOSWebsiteIntegrationSpecTwinMOS_CRM.md) — CRM receives form submissions alongside email
- [TwinMOSWebsiteWebhook_Specification.md](../D.3 - API Specifications/TwinMOSWebsiteWebhook_Specification.md)
