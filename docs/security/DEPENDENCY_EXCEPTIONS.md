# Dependency Security Exception Registry (GATE-05 / A12)

**Standard:** ISO/IEC 5055, OWASP ASVS v4.0.3, Definition of Done §7.  
**Policy:** 0 high or critical vulnerabilities allowed in production or omitted-dev audits (`npm audit --omit=dev`). Any moderate severity item must have a dated, reviewed, and approved exception record documenting blast radius, mitigation, and removal milestone.

---

## Active Exception Records

### EXC-2026-001: drizzle-kit transitive dependency on esbuild (GHSA-67mh-4wv8-2f99)

- **Date Logged:** 2026-10-12
- **Advisory ID:** GHSA-67mh-4wv8-2f99
- **Severity:** Moderate
- **Packages Affected:**
  - `esbuild` <=0.24.2
  - `@esbuild-kit/core-utils`
  - `@esbuild-kit/esm-loader`
  - `drizzle-kit` 0.19.0 - 1.0.0-beta.1
- **Path in Dependency Tree:**
  `node_modules/drizzle-kit` -> `node_modules/@esbuild-kit/esm-loader` -> `node_modules/@esbuild-kit/core-utils` -> `node_modules/esbuild`
- **Blast Radius & Threat Analysis:**
  - `drizzle-kit` is a schema generation and migration authoring tool executed exclusively at build/development time.
  - No runtime code imports or executes `drizzle-kit` or `esbuild` in production serving path (`apps/api/src`, `apps/admin/src`, `apps/web/src`).
  - The vulnerability pertains to unauthorized HTTP requests against the esbuild development dev-server listener. No dev-server from esbuild is ever started or bound in any workflow.
- **Compensating Controls:**
  - `drizzle-kit` is strictly dev-time CLI tooling. Production runtime (`apps/api`) executes solely via `drizzle-orm` and `@twinmos/db` without `drizzle-kit` runtime presence.
  - No esbuild server listener is spawned in any environment.
  - High and Critical severity thresholds remain strictly at 0.
- **Expiry / Removal Checkpoint:** Upgrade `drizzle-kit` to >=0.24.3 when upstream resolves dependency chain.
- **Status:** APPROVED & ACTIVE.
