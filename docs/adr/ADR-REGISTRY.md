# ADR Registry (compact)

- **ADR-001 — Monorepo, npm workspaces.** One repo; shared schema/contracts; npm 11 already on the workstation.
- **ADR-002 — Astro 7 static for the public site.** MPA matches the prototype 1:1; islands keep the JS budget tiny; static output = CDN + Lighthouse by construction. Rejected: Next.js (forces a React rewrite of every page), keeping the Python pipeline (no ecosystem, no islands, no hiring pool).
- **ADR-003 — Custom admin SPA instead of Strapi/Payload.** TwinMOS owns the whole product; one schema; no second system to operate; RBAC + audit exactly per spec. Cost: we build the editors ourselves (bounded, Phase 3).
- **ADR-004 — Hono API service.** One auth/forms/CRUD surface for web + admin + partners; runs on Node on the target VM; clean middleware chain (requestId → rate-limit → auth → RBAC → audit).
- **ADR-005 — Postgres dialect via Drizzle; PGlite in dev.** Zero-install Windows development with true Postgres semantics; production guard refuses PGlite when NODE_ENV=production. Parameter-bound queries only (security mandate).
- **ADR-006 — Pagefind over MeiliSearch at launch.** Static index, zero ops; revisit if query analytics demand more.
- **ADR-007 — Prototype CSS is the web design system (no Tailwind on web).** Tailwind 4 used in the admin app only (new UI, no prototype to protect).
- **ADR-008 — Email via Resend with a dev log driver.** No external dependency for local dev; provider swapped by env var.
