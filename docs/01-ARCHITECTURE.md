# 01 — System Architecture

```
                    ┌────────────────────────────────────────────┐
                    │            CLOUDFLARE EDGE                 │
                    │  DNS · WAF(OWASP) · CDN · Turnstile · TLS  │
                    └───────────────┬────────────────────────────┘
                                    │ same origin
              ┌─────────────────────┼──────────────────────────┐
              ▼                     ▼                          ▼
   /  (static)              /admin (static SPA)        /api/* (Node service)
   apps/web (Astro 7)       apps/admin (React 19)      apps/api (Hono 4)
   built from packages/db   talks only to /api/v1      ┌─────────────────────┐
   Pagefind search index    Better Auth cookie session │ Drizzle ORM         │
                                                      │  ├ dev: PGlite      │
                                                      │  └ prod: Postgres 16│
                                                      │ Better Auth (RBAC)  │
                                                      │ Resend (email)      │
                                                      │ Audit middleware    │
                                                      └─────────────────────┘
```

## Monorepo layout
```
twinmso_codebase/
├── apps/
│   ├── web/       Astro public site (static output)
│   ├── admin/     CMS/dashboard SPA (Vite build → served by api host at /admin)
│   └── api/       Hono REST service (also serves admin statics in prod)
├── packages/
│   ├── db/        Drizzle pg-schema, migrations, seed, client factory
│   └── shared/    Zod contracts, enums, RBAC matrix, locales
├── tooling/       corpus importer, image baking, parity scripts
└── docs/          this documentation set
```

## Key data flows
- **Web build**: Astro loaders read packages/db (dev: PGlite snapshot; CI/prod: Postgres) → static HTML. Content edits in admin → rebuild webhook (or scheduled rebuild) → new static bundle. Time-to-live of stale content = rebuild window (ISR-style via cache-tag purge later).
- **Public write path**: form submit → POST /api/v1/forms/:type → Zod validate → Turnstile verify → insert (parameterized) → Resend route → audit.
- **Admin path**: SPA → /api/v1/admin/* → session (Better Auth) → RBAC → Drizzle CRUD → audit row → response.
- **RMA public tracker**: GET /api/v1/rma/:number → read-only projection (no PII beyond masked fields).

## Why this shape (decisions, not defaults)
- **One origin for /, /admin, /api** → same-site cookies, no CORS, one TLS cert, one deploy unit on the VM.
- **Web stays 100% static** → the prototype's performance profile is preserved by construction; CDN caches everything.
- **Admin as SPA, not SSR** → dense CRUD screens, code-split per module; no SEO requirement behind auth.
- **DB shared package** → one schema compiled into web build AND api runtime; admin edits and web output can never drift.
- **PGlite in dev** → zero-install Postgres-dialect dev on Windows; prod guard refuses PGlite.

## Cross-cutting concerns
- Errors: RFC 9457 `application/problem+json` from every API route.
- Request IDs: `X-Request-Id` propagated; included in audit rows and logs.
- Rate limits: public forms 5/min/IP (Turnstile on top); admin 60/min/session.
- Audit: every mutating admin request logs {actor, action, entity, entityId, before/after diff, requestId, ip, ts}.
