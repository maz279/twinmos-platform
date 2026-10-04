# ADR-008: Repository Structure — Multi-Repo (Two Repositories)

| Field | Value |
|-------|-------|
| **ADR Number** | ADR-008 |
| **Date** | 2026-04-01 |
| **Status** | Accepted |
| **Deciders** | Engineering Lead |
| **Source** | Tech Stack §3.2 |

---

## 1. Context

The TwinMOS website consists of two distinct applications:
1. **Frontend:** Astro 5 static site → deployed to Cloudflare Pages
2. **Backend:** Strapi v5 CMS/API → deployed to Hetzner VPS via Coolify

These are fundamentally different applications with different:
- Runtime environments (Cloudflare edge vs. Node.js on Linux VPS)
- Deployment pipelines (GitHub Actions → Cloudflare Pages vs. GitHub Actions → Coolify)
- Deployment frequencies (frontend: per content change; backend: per API/CMS update)
- CI requirements (frontend: lint + type check + Astro build + Lighthouse; backend: lint + type check + Strapi build + migrations)

The question is whether these should live in **one monorepo** or **two separate repositories**.

---

## 2. Decision

**We will use two separate repositories:**
- `twinmos-website-frontend` — Astro 5 frontend
- `twinmos-website-backend` — Strapi v5 backend

---

## 3. Rationale

### Why Separate Repos Over Monorepo

**1. Deployment coupling is the main driver:**

With a monorepo, every commit (even a CSS tweak on the frontend) would trigger CI/CD for both applications unless carefully configured. With separate repos:
- A frontend CSS change → only frontend CI runs (2-3 min)
- A Strapi schema change → only backend CI runs (5-8 min)
- Never wait for both pipelines when only one changed

**2. Different deployment targets:**

Frontend and backend deploy to entirely different hosting platforms (Cloudflare Pages vs. Hetzner Coolify). Cloudflare Pages has its own GitHub App integration that expects a repository containing the frontend — not a monorepo root with multiple apps.

**3. Secrets isolation:**

Frontend secrets (Cloudflare API token, Turnstile site key) and backend secrets (database URL, JWT secrets, B2 keys) have no overlap. Keeping repos separate reduces the blast radius of accidental secret exposure.

**4. Team clarity for a 2-developer team:**

Each developer tends to focus on one domain at a time (frontend sprint vs. backend sprint). Separate repos make it clear what changed and where. Git history is cleaner and more focused.

**5. Independent versioning:**

Frontend can be at v1.3.0 while backend is at v2.1.0. No version lockstep required. Backend can be updated for a Strapi security patch without triggering a frontend release.

### Why Not Monorepo

| Monorepo Benefit | Assessment |
|-----------------|-----------|
| Shared TypeScript types | Types shared via `npm link` or copy — manageable for 2-dev team |
| Atomic commits (FE + BE together) | Full-stack changes rare; most changes are FE-only or BE-only |
| Single `npm install` | Two `npm install` commands is not a meaningful overhead |
| Turborepo/pnpm workspaces DX | Adds tooling complexity for minimal benefit at this team size |

For a 2-developer team (not a large engineering organisation with dozens of packages), a Turborepo monorepo adds overhead without commensurate benefit.

---

## 4. Alternatives Considered

| Option | Reason Not Chosen |
|--------|------------------|
| **Turborepo monorepo** | Turborepo overhead (configuration, versioning, selective builds) not justified for 2 apps + 2 developers; deployment target mismatch (Cloudflare vs Hetzner) makes monorepo awkward |
| **pnpm workspaces monorepo** | Same as Turborepo — unnecessary complexity |
| **Single repo, single package** | Mixing Astro + Strapi in one npm package is technically problematic; two different Node.js setups |

---

## 5. Consequences

### Positive
- Independent CI/CD pipelines — no wasted build minutes
- Clear ownership: frontend team works in frontend repo, backend team in backend repo
- Deployment target alignment (Cloudflare Pages GitHub App expects frontend repo root)
- Smaller git history per repo — faster clones, easier bisect
- Separate secret management per repo

### Negative / Trade-offs
- Shared TypeScript types (API response types) must be duplicated or managed via a shared package. **Decision:** Duplicate for now (small surface area — ~10 interface types); evaluate shared package if surface area grows
- Cross-cutting changes require two PRs and two deployments — accepted trade-off

---

## 6. Related ADRs

- ADR-003: Folder Structure
- ADR-001: Stack Selection
- ADR-006: Cloudflare Pages vs Vercel
- ADR-007: Hetzner vs AWS
