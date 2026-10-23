# ADR Registry & Architecture Decisions Index

| Decision ID | Title | Status | Date | Source Document |
| :--- | :--- | :--- | :--- | :--- |
| **D-1** | Extend the existing custom CMS (Hono, React Admin, Better Auth, Postgres) | Accepted | 2026-10-12 | [`ADR-001-to-012.md`](ADR-001-to-012.md#d-1-extend-the-existing-custom-cms) |
| **D-2** | Docker Compose single VM with container parity (dev, CI, prod) | Accepted | 2026-10-12 | [`ADR-001-to-012.md`](ADR-001-to-012.md#d-2-docker-compose-on-a-single-vm) |
| **D-3** | Server-side rendering on request with Astro 7 & multi-layer caching | Accepted, not implemented | 2026-10-12 | [`ADR-001-to-012.md`](ADR-001-to-012.md#d-3-server-side-rendering-on-request-with-astro-7--multi-layer-caching) |
| **D-4** | Read-only Delivery API inside existing Hono app | Accepted | 2026-10-12 | [`ADR-001-to-012.md`](ADR-001-to-012.md#d-4-read-only-delivery-api-inside-existing-hono-app) |
| **D-5** | Clean canonical URLs with 1:1 301 redirects | Accepted | 2026-10-12 | [`ADR-001-to-012.md`](ADR-001-to-012.md#d-5-clean-canonical-urls-with-11-301-redirects) |
| **D-6** | Content model: unified page entity composed of 25 block types | Accepted | 2026-10-12 | [`ADR-001-to-012.md`](ADR-001-to-012.md#d-6-content-model-page-entity-composed-of-25-block-types--6-core-entities) |
| **D-7** | Search via PostgreSQL native full-text search (retiring Pagefind) | Accepted, not implemented | 2026-10-12 | [`ADR-001-to-012.md`](ADR-001-to-012.md#d-7-search-via-postgresql-full-text-search) |
| **D-8** | Localisation model: variants linked by translation group; 301 on missing translation | Accepted | 2026-10-12 | [`ADR-001-to-012.md`](ADR-001-to-012.md#d-8-localisation-model--clean-route-fallbacks) |
| **D-9** | Comprehensive security baseline (invitation-only, least privilege, edge real IP) | Accepted | 2026-10-12 | [`ADR-001-to-012.md`](ADR-001-to-012.md#d-9-comprehensive-security-baseline) |
| **D-9a** | Personal data protection: `editor` role barrier on submissions, RMA, and job apps | Accepted | 2026-10-12 | [`ADR-001-to-012.md`](ADR-001-to-012.md#d-9a-lead--personal-data-protection-editor-barrier) |
| **D-10** | Pin PostgreSQL 18 in every environment with per-file migration runner | Accepted | 2026-10-12 | [`ADR-001-to-012.md`](ADR-001-to-012.md#d-10-pin-postgresql-18-in-every-environment) |
| **D-11** | Edge security: Cloudflare Origin CA, Authenticated Origin Pulls, host firewall | Accepted, not implemented | 2026-10-12 | [`ADR-001-to-012.md`](ADR-001-to-012.md#d-11-edge-security--host-firewall) |
| **D-12** | Production observability stack (Pino JSON stdout, Sentry, Prometheus) | Accepted, not implemented | 2026-10-12 | [`ADR-001-to-012.md`](ADR-001-to-012.md#d-12-production-observability-stack) |
| **ADR-009** | P6 Commerce: harden quote/lead flow; defer Medusa/Stripe | Accepted | 2026-09-27 | [`ADR-009-commerce-quote-vs-medusa.md`](ADR-009-commerce-quote-vs-medusa.md) |
| **ADR-007** | Repository history decision & `workspace/` exclusion (T3.6.3 / REPO-01) | Accepted | 2026-10-20 | [`ADR-007-repository-history-decision.md`](ADR-007-repository-history-decision.md) |

