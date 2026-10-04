# ADR-016: Live Chat and Helpdesk — Chatwoot vs Alternatives

| Field | Value |
|-------|-------|
| **ADR Number** | ADR-016 |
| **Date** | 2026-04-15 |
| **Status** | Accepted — Deferred to Phase 2 |
| **Deciders** | Engineering Lead, Project Owner |
| **Source** | Tech Stack §16 |

---

## 1. Context

TwinMOS serves customers across 93+ countries in hardware purchase decisions, warranty claims, and technical support. Phase 2 introduces a live chat and helpdesk capability to:
- Handle pre-sales enquiries (product selection, compatibility questions)
- Route support tickets to the correct regional team (MEA vs South Asia vs APAC)
- Provide an inbox for post-purchase support (warranty, RMA follow-up)
- Eventually integrate with the RMA workflow (Phase 3: RMA status updates posted to support conversation)

### Requirements

| Requirement | Detail |
|------------|--------|
| Widget | Embeddable JavaScript widget in Astro frontend |
| Inboxes | Multiple (by language/region or product line) |
| Agents | Multiple agents assignable to inboxes |
| Canned responses | Pre-written replies for common questions |
| Labels | Ticket categorisation (warranty, pre-sales, technical, RMA) |
| CSAT | Customer satisfaction surveys post-resolution |
| API | Programmatic conversation/ticket creation from Strapi (RMA submissions) |
| Self-hosted | Strongly preferred (data residency, cost) |
| Cost | <$30/month (Phase 2 budget) |

---

## 2. Decision

**We will use Chatwoot (self-hosted, Community Edition) deployed on the existing Hetzner CX32 VPS via Coolify.**

| Component | Detail |
|-----------|--------|
| Deployment | Docker container on Hetzner CX32, managed by Coolify |
| Domain | `https://chat.twinmos.com` |
| Version | Latest stable (4.x as of 2026) |
| Database | PostgreSQL + Redis (Chatwoot requires Redis for ActionCable WebSockets) |
| Phase | P2 basic widget; P3 full CRM and RMA integration |

---

## 3. Rationale

### Cost: Open Source Self-Hosted Wins

| Platform | Monthly Cost | Self-Hosted | Notes |
|----------|-------------|------------|-------|
| **Chatwoot (self-hosted)** | **$0** | ✅ | MIT license |
| Chatwoot Cloud | $19/mo (Starter, 2 agents) | ❌ | Cheaper than Intercom |
| Intercom | $74/mo (Starter, 1 seat) | ❌ | Industry leader; expensive |
| Crisp | $25/mo (Mini, 4 agents) | ❌ | Good UX; no self-host |
| Tawk.to | $0 (ad-funded) or $19/mo (remove ads) | ❌ | Limited API; data not controlled |
| Zendesk Chat | $55/mo (Suite Team) | ❌ | Enterprise; overkill |
| LiveChat | $20/mo (Starter) | ❌ | Chat-only; no helpdesk |
| Freshdesk Messaging | $15/mo (Growth) | ❌ | Mixed support |

Chatwoot self-hosted is the only option that provides full helpdesk functionality at $0/month. It deploys on the existing Hetzner VPS with no additional compute cost.

### Feature Completeness

Chatwoot CE provides all required features:
- **Multi-inbox:** Create separate inboxes for website widget, email, WhatsApp (Phase 3)
- **Agent management:** Assign agents to inboxes; set online/offline status
- **Labels:** Customisable labels for ticket routing
- **Canned responses:** Pre-written responses for common questions
- **CSAT:** Built-in satisfaction surveys
- **API:** REST API for programmatic conversation creation (`POST /api/v1/accounts/{id}/conversations`)
- **Webhook outbound:** Chatwoot can webhook on conversation events (for Strapi sync)
- **Multilingual:** Interface in EN/AR/ZH/RU/FR among others

### Data Residency

Self-hosting on Hetzner Falkenstein (Germany) means all chat conversation data stays in the EU — consistent with GDPR compliance strategy and matching Strapi/PostgreSQL data residency.

SaaS alternatives (Intercom, Crisp) store conversation data in US data centres by default, requiring Data Processing Agreements and potentially conflicting with UAE PDPL requirements for regional customer data.

### RMA Integration (Phase 3)

When a customer submits an RMA request via the website, a Chatwoot conversation can be automatically created:
```
Customer submits RMA → Strapi saves rma_request → afterCreate lifecycle hook 
  → POST /api/v1/accounts/{id}/conversations (Chatwoot API)
  → Conversation created with customer email, RMA reference, product details
  → Agent notified in Chatwoot inbox
```

This creates a natural helpdesk thread for RMA case management, visible to support agents without access to Strapi admin.

---

## 4. Alternatives Considered

| Option | Reason Not Chosen |
|--------|------------------|
| **Intercom** | $74+/mo — 74x the self-hosted cost for equivalent features; vendor lock-in; US data storage |
| **Crisp** | $25/mo; no self-host option; data in Crisp's EU servers (acceptable) but cost not justified vs $0 Chatwoot |
| **Tawk.to** | Free but ad-funded; limited API; user data monetised; no self-host; Tawk's terms include data usage |
| **Zendesk Chat** | Enterprise pricing ($55+/mo); overkill; migration complexity if outgrown |
| **Freshdesk** | SaaS; Indian company (data residency varies); free tier very limited (1 agent) |
| **HubSpot Live Chat** | Included in HubSpot (Phase 2+) but basic; requires HubSpot Starter to be useful; less feature-complete than Chatwoot |
| **Custom-built widget** | WebSocket chat from scratch is 200+ dev hours; reinventing a solved problem |

---

## 5. Consequences

### Positive
- $0 recurring cost (shares Hetzner VPS)
- Full data ownership and EU data residency
- MIT license — no vendor risk
- Ruby on Rails + PostgreSQL + Redis stack is well-understood and reliable
- API enables RMA integration and programmatic ticket creation
- Multilingual interface for TwinMOS's international support team

### Negative / Trade-offs
- **Resource consumption:** Chatwoot (Ruby on Rails) adds ~500 MB RAM to the Hetzner VPS. CX32 has 8 GB RAM; all services use approximately:
  - Strapi: ~400 MB
  - PostgreSQL: ~300 MB
  - MeiliSearch: ~200 MB
  - ImgProxy: ~100 MB
  - Chatwoot: ~500 MB + Redis ~50 MB
  - Remaining: ~6.4 GB — adequate headroom
- **Redis dependency:** Chatwoot requires Redis for ActionCable (WebSocket pub/sub). Phase 2 already plans a Redis deployment for Strapi caching — shared Redis instance is acceptable
- **No iOS/Android apps on Community Edition:** Chatwoot Cloud has mobile apps; CE requires web-only access for agents. **Acceptable:** TwinMOS support team will use desktop browser
- **Maintenance:** Self-hosted means TwinMOS team manages Chatwoot updates. **Mitigation:** Coolify handles Docker image updates with one-click deploy; Coolify automated backup covers Chatwoot database

### Widget Resource Impact

Chatwoot widget is loaded as a `client:idle` script in the Astro `LayoutBase`:
```astro
<script
  defer
  src="https://chat.twinmos.com/packs/js/sdk.js"
  is:inline
></script>
```

Loading deferred via `defer` attribute means it does not impact initial page load / Lighthouse score. Widget bundle is approximately 80 KB gzipped — loaded after all critical content renders.

---

## 6. Implementation Notes

**Coolify deployment configuration:**
```yaml
# Chatwoot requires Coolify's Docker Compose support
services:
  chatwoot:
    image: chatwoot/chatwoot:latest
    environment:
      SECRET_KEY_BASE: ${CHATWOOT_SECRET_KEY_BASE}
      FRONTEND_URL: https://chat.twinmos.com
      DEFAULT_LOCALE: en
      POSTGRES_DATABASE: chatwoot_production
      POSTGRES_USERNAME: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASS}
      POSTGRES_HOST: postgres
      REDIS_URL: redis://redis:6379
      SMTP_ADDRESS: smtp.resend.com
      SMTP_USERNAME: resend
      SMTP_PASSWORD: ${RESEND_API_KEY}
      SMTP_PORT: "587"
```

**Astro widget integration (`src/layouts/LayoutBase.astro`):**
```astro
<script is:inline>
(function(d,t) {
  var BASE_URL="https://chat.twinmos.com";
  var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
  g.src=BASE_URL+"/packs/js/sdk.js";
  g.defer=true;
  s.parentNode.insertBefore(g,s);
  g.onload=function(){
    window.chatwootSDK.run({
      websiteToken: 'TWINMOS_WIDGET_TOKEN',
      baseUrl: BASE_URL,
      locale: document.documentElement.lang || 'en',
      customColor: '#003087',
    });
  };
})(document,"script");
</script>
```

**Programmatic conversation creation (Strapi, Phase 3):**
```typescript
// src/services/chatwootService.ts
export async function createRMAConversation(rma: RMARequest): Promise<void> {
  await fetch(`${process.env.CHATWOOT_URL}/api/v1/accounts/${process.env.CHATWOOT_ACCOUNT_ID}/conversations`, {
    method: 'POST',
    headers: {
      'api_access_token': process.env.CHATWOOT_API_TOKEN!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inbox_id:     process.env.CHATWOOT_SUPPORT_INBOX_ID,
      contact_id:   await getOrCreateChatwootContact(rma.email),
      initial_message: `RMA Request #${rma.rmaNumber}: ${rma.productName} — ${rma.issueDescription}`,
      label_ids:    [CHATWOOT_LABEL_RMA_ID],
    }),
  });
}
```

---

## 7. Related ADRs

- ADR-001: Stack Selection
- ADR-007: Hetzner vs AWS (Chatwoot deployment target)
- ADR-012: CRM Selection (Chatwoot complements HubSpot; different focus)
- Integration Spec: Chatwoot Live Chat
