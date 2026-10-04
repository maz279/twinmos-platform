# TwinMOS Website — Versioning Strategy

| | |
|:---|:---|
| **Reference** | H.2-006 |
| **Priority** | P1 |
| **Status** | [M] Must-have |
| **Author** | DevOps Lead |
| **Version** | 1.0 |
| **Date** | 2026-05-01 |
| **Review Cycle** | Quarterly |

---

## 1. Purpose

This document defines the versioning strategy for the TwinMOS website monorepo, including semantic versioning rules, Git tagging conventions, changelog generation, Docker image tagging, and environment-to-version mapping. A single unified version is maintained across frontend, backend, and infrastructure components.

---

## 2. Versioning Philosophy

Given the 2-developer team and 15-month engagement, the project uses a **simplified monorepo versioning** approach:

- **One version number** for the entire repository
- **Simultaneous deployment** of frontend and backend
- **Conventional Commits** drive automated version bumping
- **Git tags** serve as the source of truth for releases

This avoids the complexity of independent versioning (like Lerna or Changesets) while maintaining clear traceability.

---

## 3. Semantic Versioning

### 3.1 SemVer 2.0.0 Rules

```
VERSION ::= MAJOR "." MINOR "." PATCH

Example: 1.4.2
```

| Component | Bump Condition | TwinMOS Examples |
|:---|:---|:---|
| **MAJOR** (`X.0.0`) | Breaking public API change; incompatible DB schema; infrastructure architecture change | Adding Medusa.js commerce (Phase 3); Removing a supported locale; Switching from REST to GraphQL exclusively |
| **MINOR** (`x.Y.0`) | New feature added; new content type; new locale added; non-breaking enhancement | Adding product comparison widget; Adding Bengali locale; New CMS plugin |
| **PATCH** (`x.y.Z`) | Bug fix; security patch; performance fix; dependency update; documentation fix | Fixing Arabic RTL layout bug; Patching CVE; Optimizing image loading |

### 3.2 Pre-Release Versions

For release candidates and beta testing:

```
1.5.0-rc.1   # Release candidate 1
1.5.0-rc.2   # Release candidate 2
1.5.0-beta.1 # Beta for stakeholder preview
```

**Pre-release tagging** (manual):

```bash
# Create RC tag
git tag -a v1.5.0-rc.1 -m "Release candidate 1.5.0-rc.1"
git push origin v1.5.0-rc.1

# Deploy RC to staging manually via workflow_dispatch
```

---

## 4. Git Tagging Convention

### 4.1 Tag Format

| Type | Format | Example |
|:---|:---|:---|
| Production release | `v{MAJOR}.{MINOR}.{PATCH}` | `v1.4.2` |
| Release candidate | `v{MAJOR}.{MINOR}.{PATCH}-rc.{N}` | `v1.5.0-rc.1` |
| Hotfix | `v{MAJOR}.{MINOR}.{PATCH}-hotfix` | `v1.4.2-hotfix` |

### 4.2 Tagging Rules

- Tags are **annotated** (`git tag -a`) with release notes
- Tags are **immutable** — never delete or move
- Tags are **signed** by the release automation (GitHub Actions)
- Lightweight tags are **not used** for releases

### 4.3 Tag Message Template

```
Release v1.4.2

## Changes
- fix(frontend): resolve mobile menu z-index issue
- perf(backend): add product query caching layer
- security(deps): patch axios CVE-2026-xxxx

## Deployment
- Frontend: Cloudflare Pages (twinmos-website-prod)
- Backend: Coolify on Hetzner CX32
- Database: PostgreSQL 16 (no migration)

## Verification
- Lighthouse: 94/98/100/100
- Sentry: No new errors (1h window)
```

---

## 5. Version Bump Automation

### 5.1 Conventional Commit to Version Mapping

| Commit Type | Version Impact | Example |
|:---|:---|:---|
| `feat:` | MINOR | `feat(frontend): add comparison widget` -> `1.4.2` -> `1.5.0` |
| `fix:` | PATCH | `fix(backend): correct slug encoding` -> `1.4.2` -> `1.4.3` |
| `perf:` | PATCH | `perf(search): cache index results` -> `1.4.2` -> `1.4.3` |
| `security:` | PATCH | `security(auth): rotate keys` -> `1.4.2` -> `1.4.3` |
| `refactor:` | PATCH | `refactor(api): extract service` -> `1.4.2` -> `1.4.3` |
| `docs:` | None | `docs(readme): update setup` -> no version change |
| `test:` | None | `test(backend): add unit tests` -> no version change |
| `chore:` | None | `chore(deps): update lint-staged` -> no version change |
| `ci:` | None | `ci(github): add workflow` -> no version change |
| `BREAKING CHANGE:` in footer | MAJOR | Any commit with `BREAKING CHANGE:` -> major bump |

### 5.2 Manual Override

The release workflow supports manual version selection:

```bash
# Force patch release (even if no commits warrant it)
workflow_dispatch -> version_bump: patch

# Force minor release
workflow_dispatch -> version_bump: minor

# Force major release
workflow_dispatch -> version_bump: major
```

---

## 6. Docker Image Tagging

### 6.1 Backend Image Tags (GHCR)

| Tag | When Applied | Example |
|:---|:---|:---|
| `latest` | Every production release | `ghcr.io/twinmos/website/backend:latest` |
| `{semver}` | Every production release | `ghcr.io/twinmos/website/backend:v1.4.2` |
| `staging-{short-sha}` | Every staging deploy | `ghcr.io/twinmos/website/backend:staging-a1b2c3d` |
| `staging-latest` | Every staging deploy (rolling) | `ghcr.io/twinmos/website/backend:staging-latest` |

### 6.2 Tagging Command

```bash
# Production
docker build -t ghcr.io/twinmos/website/backend:v1.4.2 .
docker tag ghcr.io/twinmos/website/backend:v1.4.2 ghcr.io/twinmos/website/backend:latest
docker push ghcr.io/twinmos/website/backend:v1.4.2
docker push ghcr.io/twinmos/website/backend:latest

# Staging
docker build -t ghcr.io/twinmos/website/backend:staging-a1b2c3d .
docker tag ghcr.io/twinmos/website/backend:staging-a1b2c3d ghcr.io/twinmos/website/backend:staging-latest
docker push ghcr.io/twinmos/website/backend:staging-a1b2c3d
docker push ghcr.io/twinmos/website/backend:staging-latest
```

### 6.3 Image Retention Policy

| Tag Pattern | Retention | Cleanup |
|:---|:---|:---|
| `latest`, `v*` | Forever | Manual only |
| `staging-*` | 30 days | GitHub Actions scheduled cleanup |
| Untagged / dangling | 7 days | Automatic GHCR cleanup |

---

## 7. Changelog Generation

### 7.1 Tool: `conventional-changelog-cli`

```bash
pnpm add -D conventional-changelog-cli
```

### 7.2 Changelog Format

```markdown
# Changelog

All notable changes to this project will be documented in this file.

## [1.4.2] - 2026-06-15

### Bug Fixes
- **frontend**: resolve mobile menu z-index overlap (#[189])
- **backend**: correct i18n slug generation for Arabic content (#[192])

### Performance Improvements
- **search**: add MeiliSearch query result caching (#[195])

### Security
- **deps**: patch axios vulnerability CVE-2026-xxxx (#[198])

## [1.4.1] - 2026-06-01

### Bug Fixes
- **api**: fix GraphQL N+1 query on product list (#[185])
```

### 7.3 Changelog Sections

| Section | Commit Types |
|:---|:---|
| Features | `feat` |
| Bug Fixes | `fix` |
| Performance Improvements | `perf` |
| Security | `security` |
| Documentation | `docs` |
| Code Refactoring | `refactor` |
| Tests | `test` |
| Build System | `build`, `ci` |
| Maintenance | `chore` |
| Reverts | `revert` |

---

## 8. Environment-to-Version Mapping

| Environment | Version Source | Deploy Trigger |
|:---|:---|:---|
| **Local** | Any branch/commit | Developer discretion |
| **Dev** | `main` branch HEAD | Every push to `main` |
| **Staging** | `main` branch HEAD | Every push to `main` |
| **Production** | Git tag (`v*`) | Release published |

### 8.1 Version Visibility

| Location | What Shows | Purpose |
|:---|:---|:---|
| Website footer | `v{version}` | Public version indicator |
| API health endpoint | `{ version: "1.4.2", commit: "a1b2c3d" }` | Operational visibility |
| Sentry release | `v1.4.2` | Error tracking correlation |
| Docker image tag | `v1.4.2` | Deployment traceability |
| Cloudflare Pages deployment | Git commit SHA | CDN deployment tracking |

### 8.2 Frontend Version Display

```astro
<!-- apps/frontend/src/components/VersionFooter.astro -->
---
const version = import.meta.env.PUBLIC_APP_VERSION || 'dev';
---
<footer class="text-xs text-gray-500">
  TwinMOS Website v{version}
</footer>
```

**Build-time injection:**

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default defineConfig({
  vite: {
    define: {
      'import.meta.env.PUBLIC_APP_VERSION': JSON.stringify(pkg.version)
    }
  }
});
```

---

## 9. Version History

### 9.1 Version Registry

All versions are tracked in the repository:

| Version | Date | Type | Key Changes | Deployed By |
|:---|:---|:---|:---|:---|
| v0.1.0 | 2026-05-15 | Minor | Initial scaffolding, Astro + Strapi setup | Manual |
| v0.2.0 | 2026-05-30 | Minor | Homepage, basic CMS integration | Manual |
| v0.3.0 | 2026-06-15 | Minor | Product catalog, search integration | GitHub Actions |
| v1.0.0 | 2026-08-01 | Major | Production launch (Phase 1) | GitHub Actions |
| v1.1.0 | 2026-09-01 | Minor | Arabic RTL, i18n framework | GitHub Actions |
| v1.2.0 | 2026-10-01 | Minor | Partner portal (Phase 2) | GitHub Actions |
| v2.0.0 | 2027-02-01 | Major | Commerce integration (Phase 3) | GitHub Actions |

### 9.2 Deprecation Policy

| Version Status | Support Level | Action |
|:---|:---|:---|
| Latest (`v{N}.x.x`) | Full support | Active development |
| Previous (`v{N-1}.x.x`) | Security fixes only | 3 months after new major |
| Older (`v{N-2}.x.x`) | Unsupported | Migrate to latest |

---

## 10. Migration Between Major Versions

### 10.1 Major Version Checklist

When bumping MAJOR (e.g., 1.x.x -> 2.0.0):

- [ ] Breaking changes documented in MIGRATION.md
- [ ] Database migration script tested on copy of production data
- [ ] API deprecation notices added (if applicable)
- [ ] Frontend compatibility verified
- [ ] Rollback plan documented
- [ ] Stakeholder communication sent 2 weeks in advance
- [ ] Training scheduled for CMS users (if workflow changes)

### 10.2 Migration Document Template

```markdown
# Migration Guide: v1.x -> v2.0

## Breaking Changes
1. Product API response format changed (see #api-changes)
2. CMS content type "Product" has new required fields
3. Environment variable `OLD_VAR` renamed to `NEW_VAR`

## Migration Steps
1. Deploy v2.0 backend to staging
2. Run database migration: `pnpm strapi db:migrate`
3. Update frontend environment variables
4. Deploy v2.0 frontend
5. Verify all integrations

## Rollback
- Re-deploy v1.x images
- Restore database from pre-migration backup
```

---

## 11. Change Log

| Version | Date | Author | Changes |
|:---|:---|:---|:---|
| 1.0 | 2026-05-01 | DevOps Lead | Initial release |

---

## 12. Sign-off

| Role | Name | Date | Signature |
|:---|:---|:---|:---|
| DevOps Lead | | | |
| Tech Lead | | | |
| Project Manager | | | |
