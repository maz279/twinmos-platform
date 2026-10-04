# ADR-015: Partner Portal Authentication — Better Auth vs Lucia Auth

| Field | Value |
|-------|-------|
| **ADR Number** | ADR-015 |
| **Date** | 2026-04-15 |
| **Status** | Accepted — Deferred to Phase 3 |
| **Deciders** | Engineering Lead |
| **Source** | Tech Stack §9.3 |

---

## 1. Context

TwinMOS Phase 3 introduces a **Partner Portal** for distributors and resellers:
- View distributor pricing and MDF (Market Development Fund) agreements
- Access marketing assets (logos, product images, brochures)
- Order history and invoice download
- Apply to become an authorised distributor/reseller
- Manage account settings and addresses

This portal requires a **session-based authentication system** that is distinct from Strapi's built-in JWT authentication (which is for CMS admin users and API consumers).

### Requirements

| Requirement | Detail |
|------------|--------|
| Authentication method | Email + password (required); Google OAuth (optional, Phase 4) |
| Session model | Server-side sessions (not JWT cookies) — secure HTTP-only cookie |
| MFA | TOTP (app-based 2FA) for partner accounts |
| Role model | `partner`, `distributor`, `admin` |
| Integration | Astro server-side route guards; `getSession()` for gated pages |
| Database | PostgreSQL (same cluster as Strapi) |
| TypeScript | Full TypeScript types for session, user, role |

---

## 2. Decision

**We will use Better Auth (TypeScript-first auth library) for the partner portal authentication.**

Better Auth runs as part of the Astro frontend application (using Astro's server-side rendering capability for auth routes) with PostgreSQL as the session store.

---

## 3. Rationale

### Lucia Auth Entered Maintenance Mode in 2025

The original architecture consideration was **Lucia Auth** — the TypeScript auth library that was widely adopted in the Astro/SvelteKit ecosystem from 2022–2024.

**In 2025, Lucia Auth's author (pilcrowonpaper) announced that Lucia v4 would enter maintenance mode.** The author's recommendation for new projects was to switch to **Better Auth**, which the same author co-created as Lucia's spiritual successor with a broader scope.

Key differences:
| | Lucia Auth v3 | Better Auth |
|--|--------------|------------|
| Status (2026) | **Maintenance mode** | **Active development** |
| Author | pilcrowonpaper | pilcrowonpaper + team |
| Session model | Core primitive (manual implementation) | Full-stack solution (database schema + API routes) |
| MFA / TOTP | Manual (third-party) | **Built-in plugin** |
| Organisation management | Not included | **Built-in plugin** |
| OAuth providers | Manual adapters | **20+ providers built-in** |
| Framework adapters | Astro, SvelteKit, Next.js | Astro, SvelteKit, Next.js, Hono, etc. |
| Database adapters | Drizzle, Prisma, Mongoose | Drizzle, Prisma, Kysely, raw SQL |
| Type safety | Full TypeScript | Full TypeScript |
| Security defaults | Strong | Strong |

Lucia Auth in maintenance mode means no new features, potential security patch delays, and a declining community. Using it for a feature being built in 2026 would immediately incur technical debt.

### Better Auth is the Ecosystem's Chosen Successor

The Astro documentation and community migrated to recommending Better Auth after Lucia's maintenance announcement. `@better-auth/astro` provides first-class Astro integration:
- `auth.handler()` for API route (`/api/auth/[...all]`)
- `auth.api.getSession()` for server-side session checks in `.astro` files
- Cookie session with CSRF protection out-of-the-box

### Why Session Cookies (Not JWT) for Partner Portal

| | HTTP-only session cookies | JWT cookies |
|--|--------------------------|------------|
| Revocation | **Immediate** (delete DB record) | Delayed (token TTL) |
| Storage | Server-side PostgreSQL | Stateless (client-side) |
| XSS exposure | **Minimal** (HTTP-only cookie) | Moderate (localStorage) |
| Scalability | DB lookup per request | No DB lookup |
| GDPR right to erasure | **Delete session row** | Must wait for expiry |

For a partner portal with sensitive distributor pricing and MDF information, **session revocability is critical**. If a partner employee leaves or an account is compromised, the session can be invalidated instantly. JWT-based auth would require waiting for token expiry.

The session DB lookup overhead is trivial at partner portal scale (hundreds of authenticated users, not millions).

### Why TOTP MFA

Partner portal contains commercially sensitive pricing data and marketing fund balances. MFA significantly reduces account compromise risk. Better Auth's TOTP plugin (compatible with Google Authenticator, Authy, 1Password) is built-in — no additional library or custom implementation needed.

---

## 4. Alternatives Considered

| Option | Reason Not Chosen |
|--------|------------------|
| **Lucia Auth v3** | Maintenance mode since 2025; declining community; no built-in MFA; would require migration to Better Auth later anyway |
| **NextAuth.js / Auth.js** | Primarily designed for Next.js; Astro integration is second-class; JWT-by-default for sessions |
| **Strapi Users-Permissions plugin** | Designed for API access (JWT-based); not suitable for session-based web portal; blurs CMS admin vs portal user roles |
| **Custom session implementation** | Security risks in custom auth; significant dev time; reinventing what Better Auth provides |
| **Clerk** | SaaS auth — $25+/mo for production; vendor lock-in; contact data leaves TwinMOS infrastructure |
| **Auth0 / Okta** | Enterprise SaaS pricing ($23+/mo); overkill for partner portal scale; vendor lock-in |
| **Firebase Authentication** | Google vendor lock-in; not aligned with self-hosted infrastructure strategy; session management requires Cloud Functions |

---

## 5. Consequences

### Positive
- Active, maintained library with clear upgrade path (no immediate technical debt)
- TOTP MFA built-in — partner account security without custom implementation
- Session revocation works immediately (critical for distributor account management)
- `@better-auth/astro` provides idiomatic Astro integration
- PostgreSQL session store shares existing database infrastructure (no new service)
- TypeScript types for session/user objects are generated from Better Auth schema

### Negative / Trade-offs
- **Phase 3 only:** Auth system adds complexity to Astro app (requires partial SSR mode for auth routes). **Mitigation:** Astro's `output: 'hybrid'` allows SSG for most pages with SSR for auth-protected routes only
- **Database schema owned by Better Auth:** Better Auth generates its own schema (`users`, `sessions`, `accounts` tables) separate from Strapi's schema. Two PostgreSQL schemas in the same database. **Decision:** Acceptable; Strapi has its own schema isolation; Better Auth schema is additive
- **Session cookie domain:** Partner portal routes (`/portal/*`) need consistent domain for cookie auth. **Decision:** All portal routes under `twinmos.com/portal/` — no subdomain complexity needed

### Phase 3 Architecture

```
Astro (hybrid mode)
  └─ /portal/* routes → SSR (server-side)
       ↓
  Better Auth handler (/api/auth/[...all])
       ↓
  PostgreSQL (sessions + users)
       ↓
  Strapi API (partner_user collection for role/permission data)
```

---

## 6. Implementation Notes

**Better Auth configuration (Phase 3):**
```typescript
// src/lib/auth.ts
import { betterAuth } from 'better-auth';
import { totp } from 'better-auth/plugins';
import { Pool } from 'pg';

export const auth = betterAuth({
  database: new Pool({ connectionString: process.env.DATABASE_URL }),
  emailAndPassword: { enabled: true, requireEmailVerification: true },
  plugins: [
    totp({
      issuer: 'TwinMOS Partner Portal',
      digits: 6,
      period: 30,
    }),
  ],
  session: {
    expiresIn:        60 * 60 * 24 * 30, // 30 days
    updateAge:        60 * 60 * 24,       // Extend on activity
    cookieCache:      { enabled: true, maxAge: 5 * 60 },
  },
  trustedOrigins: ['https://twinmos.com'],
});
```

**Astro route guard:**
```astro
---
// src/pages/portal/index.astro
import { auth } from '@/lib/auth';

const session = await auth.api.getSession({
  headers: Astro.request.headers,
});

if (!session) {
  return Astro.redirect('/portal/login');
}
---
<PortalLayout user={session.user}>
  <!-- gated partner portal content -->
</PortalLayout>
```

**Astro API route handler:**
```typescript
// src/pages/api/auth/[...all].ts
import { auth } from '@/lib/auth';
import type { APIRoute } from 'astro';

export const ALL: APIRoute = ({ request }) => auth.handler(request);
```

---

## 7. Related ADRs

- ADR-001: Stack Selection
- ADR-002: Architecture Patterns (SSG + selective SSR for auth)
- ADR-014: Ecommerce (customer accounts linked via Better Auth session)
- Integration Spec: Better Auth Partner Portal
