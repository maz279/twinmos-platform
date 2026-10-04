# TwinMOS Website — Integration Specification: Chatwoot Live Chat

| Field | Value |
|-------|-------|
| **Document ID** | TWN-INT-CHAT-001 |
| **Version** | 1.0 |
| **Status** | Accepted |
| **Phase** | P2 (basic widget); P3 (CRM bridge) |
| **Priority** | P3 |
| **Date** | 2026-05-01 |
| **Owner** | Engineering Lead |
| **Source** | Tech Stack §6; BRD §18 |

---

## 1. Overview

**Chatwoot** is a self-hosted open-source live chat and helpdesk platform that provides real-time customer support for the TwinMOS website. It combines live chat, email support, and agent management in a single platform.

### 1.1 Why Chatwoot

| Criterion | Assessment |
|-----------|-----------|
| Cost | Open source (MIT) — $0 licensing; hosted on existing Hetzner VPS |
| Helpdesk features | Agents, inboxes, labels, CSAT, canned responses, team assignment |
| API | Full REST API for ticket creation and CRM bridge |
| Self-hosted | Data sovereignty; GDPR-compliant |
| Alternatives | Intercom ($$$), Crisp (SaaS only), Tawk.to (limited API), Zendesk (expensive) |

---

## 2. Infrastructure

### 2.1 Self-Hosted Deployment

Chatwoot is deployed on the **Hetzner CX32 VPS** (Phase 2) alongside Strapi, upgraded to **CX42** if resource contention occurs.

**Docker Compose via Coolify:**
```yaml
services:
  chatwoot-app:
    image: chatwoot/chatwoot:latest
    environment:
      RAILS_ENV: production
      SECRET_KEY_BASE: ${CHATWOOT_SECRET_KEY}
      POSTGRES_DATABASE: chatwoot_production
      POSTGRES_HOST: postgres
      REDIS_URL: redis://redis:6379
      FRONTEND_URL: https://chat.twinmos.com
      DEFAULT_LOCALE: en
      ACTIVE_STORAGE_SERVICE: amazon  # Points to Backblaze B2
      STORAGE_BUCKET_NAME: twinmos-uploads
      AWS_ACCESS_KEY_ID: ${B2_KEY_ID}
      AWS_SECRET_ACCESS_KEY: ${B2_APPLICATION_KEY}
      AWS_REGION: eu-central-003
      AWS_ENDPOINT: https://s3.eu-central-003.backblazeb2.com
    ports:
      - "3000:3000"
```

**Chatwoot URL:** `https://chat.twinmos.com`

### 2.2 Resource Requirements

| Resource | Phase 2 (CX32) | Phase 3 (CX42) |
|----------|---------------|---------------|
| RAM | ~512 MB for Chatwoot | Same |
| Storage (attachments → B2) | Minimal (B2 used) | Same |
| CPU | Minimal impact | Same |

---

## 3. Website Widget Integration

### 3.1 Widget Setup in Chatwoot Dashboard

1. Go to Chatwoot Admin → Settings → Inboxes → Add Inbox
2. Select **Website** inbox type
3. Name: "TwinMOS Website — English"
4. Configure: welcome title, greeting message, operating hours, business name
5. Copy the generated embed code

### 3.2 Widget Embed in Astro

The Chatwoot widget is embedded in `LayoutBase.astro` with lazy loading to avoid blocking page load:

```astro
<!-- LayoutBase.astro — Chatwoot widget (loaded after page becomes idle) -->
{import.meta.env.PUBLIC_CHATWOOT_ENABLED === 'true' && (
  <script
    define:vars={{
      chatwootToken: import.meta.env.PUBLIC_CHATWOOT_TOKEN,
      chatwootUrl: import.meta.env.PUBLIC_CHATWOOT_URL,
    }}
  >
    (function(d, t) {
      var BASE_URL = chatwootUrl;
      var g = d.createElement(t), s = d.getElementsByTagName(t)[0];
      g.src = BASE_URL + '/packs/js/sdk.js';
      g.defer = true;
      g.async = true;
      s.parentNode.insertBefore(g, s);
      g.onload = function() {
        window.chatwootSDK.run({
          websiteToken: chatwootToken,
          baseUrl: BASE_URL
        });
      };
    })(document, 'script');
  </script>
)}
```

### 3.3 Widget Customisation

In Chatwoot admin (or via `window.$chatwoot` API):

```javascript
window.addEventListener('chatwoot:ready', function () {
  window.$chatwoot.setCustomAttributes({
    locale: document.documentElement.lang,
    page: window.location.pathname,
  });
});
```

**Brand settings:**
- Primary color: `#003087` (TwinMOS blue)
- Launcher icon: TwinMOS logo
- Welcome title: "TwinMOS Support"
- Welcome message: "Hi! How can we help you today?"

---

## 4. Inbox Structure

| Inbox Name | Channel | Assigned Team | Language |
|-----------|---------|--------------|---------|
| Website — English | Website | Global support | EN |
| Website — Arabic (P2) | Website | MEA team | AR |
| Email — support@twinmos.com | Email | All agents | EN |
| Email — sales@twinmos.com | Email | Sales team | EN |

---

## 5. Agent Routing

| Trigger | Routing Rule |
|---------|-------------|
| Chat from UAE/GCC (by IP) | MEA team |
| Chat from Bangladesh/India | South Asia team (or fallback to MEA) |
| Chat with Arabic locale | Arabic-speaking agents |
| RMA-related keywords | Support specialists |
| "distributor" keyword | Sales team |
| Outside business hours | Bot response + email capture |

---

## 6. RMA / Support Integration (Phase 2)

When an RMA request is submitted via the website:
1. Strapi creates RMA record
2. Strapi service calls Chatwoot API to create a new conversation linked to the customer's email
3. RMA status updates are posted as conversation notes

```typescript
// After RMA creation in Strapi
async function createChatwootConversation(rma: RMARequest): Promise<void> {
  await fetch(`${CHATWOOT_URL}/api/v1/accounts/${CHATWOOT_ACCOUNT_ID}/conversations`, {
    method: 'POST',
    headers: {
      'api_access_token': process.env.CHATWOOT_API_TOKEN!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inbox_id: CHATWOOT_SUPPORT_INBOX_ID,
      contact_id: await findOrCreateContact(rma.customerEmail, rma.customerName),
      additional_attributes: {
        rma_number: rma.rmaNumber,
        product: rma.product?.name,
        issue_type: rma.issueType,
      },
      message: {
        content: `RMA request ${rma.rmaNumber} received.\n\nIssue: ${rma.issueType}\n${rma.issueDescription}`,
      },
    }),
  });
}
```

---

## 7. CRM Bridge (Phase 3)

Chatwoot → HubSpot bridge (Phase 3):
- New Chatwoot contact → HubSpot contact sync
- Conversation closed → HubSpot ticket closed
- CSAT rating → HubSpot customer satisfaction field

Implementation via Chatwoot webhook → Strapi → HubSpot.

---

## 8. Business Hours & Auto-Replies

**Operating hours (Chatwoot admin):**
- Sunday–Thursday: 09:00–18:00 GST (UTC+4)
- Friday–Saturday: Closed

**Outside hours:** Automated reply:
> "Thanks for reaching out to TwinMOS! Our team is currently offline (Sun–Thu, 9AM–6PM GST). We'll get back to you within the next business day. For urgent support, email support@twinmos.com"

---

## 9. GDPR / Privacy

- Chatwoot self-hosted: customer data stays within EU (Hetzner DE)
- Chat transcripts stored in Chatwoot database (Hetzner)
- Attachments stored in Backblaze B2 EU bucket
- Cookie: Chatwoot sets a `cw_d_` cookie for visitor identity — covered in TwinMOS cookie policy

---

## 10. Environment Variables

| Variable | Description |
|----------|-------------|
| `PUBLIC_CHATWOOT_TOKEN` | Chatwoot website inbox token (Astro env) |
| `PUBLIC_CHATWOOT_URL` | Chatwoot instance URL (`https://chat.twinmos.com`) |
| `PUBLIC_CHATWOOT_ENABLED` | Feature flag (`true` in Phase 2+) |
| `CHATWOOT_API_TOKEN` | Chatwoot agent API token (Strapi env) |
| `CHATWOOT_ACCOUNT_ID` | Chatwoot account ID (Strapi env) |
| `CHATWOOT_SECRET_KEY` | Rails secret key for Chatwoot instance |

---

## 11. Related Documents

- [TwinMOSWebsiteIntegrationSpecTwinMOS_CRM.md](TwinMOSWebsiteIntegrationSpecTwinMOS_CRM.md) — CRM bridge
- ADR-016: Chat Tool Selection
