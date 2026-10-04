# TwinMOS Website — CI/CD Pipeline Specification

**Document ID:** H.2-001  
**Version:** 1.0  
**Status:** Active  
**Owner:** Tech Lead  
**Last Updated:** 2026-05-01  
**Related:** TwinMOSWebsiteGitHubActionsWorkflows_Spec.md · TwinMOSWebsiteBranchProtectionRules.md · TwinMOSWebsitePreCommitHooks_Spec.md · TwinMOSWebsiteHostingArchitectureSpec.md

---

## 1. Overview

The TwinMOS website uses a **trunk-based development** model with GitHub as the source control platform. The CI/CD system automates linting, testing, security scanning, building, and deployment across all four environment tiers.

**Key design decisions:**
- Frontend (Astro) deploys continuously to Cloudflare Pages on every `main` merge
- Backend (Strapi) deploys to Coolify with a **manual approval gate** after staging validation
- All deployments require green CI (zero lint errors, zero TS errors, test coverage ≥70%)
- Security scanning runs on a weekly schedule and on every `main` push

---

## 2. Repository Structure

```
GitHub Organisation: twinmos (private)
├── twinmos-frontend/        ← Astro 5 site
│   └── .github/workflows/
│       ├── frontend-ci.yml
│       ├── deploy-frontend-staging.yml
│       ├── deploy-frontend-prod.yml
│       └── security.yml
│
└── twinmos-backend/         ← Strapi 5 CMS + services
    └── .github/workflows/
        ├── backend-ci.yml
        ├── deploy-backend-staging.yml
        ├── deploy-backend-prod.yml
        ├── release.yml
        ├── artifact-cleanup.yml
        └── dependabot-automerge.yml
```

---

## 3. Pipeline Inventory

| # | Workflow File | Trigger | Repo | Purpose |
|---|--------------|---------|------|---------|
| 1 | `frontend-ci.yml` | PR, push to any branch | Frontend | Lint → type-check → test → build → preview deploy |
| 2 | `deploy-frontend-staging.yml` | Push to `staging` branch | Frontend | Deploy to staging.twinmos.com (Cloudflare Pages) |
| 3 | `deploy-frontend-prod.yml` | Push to `main` | Frontend | Deploy to twinmos.com (Cloudflare Pages) |
| 4 | `backend-ci.yml` | PR, push to any branch | Backend | Lint → test → schema diff → Docker build → Trivy scan |
| 5 | `deploy-backend-staging.yml` | Push to `staging` branch | Backend | Deploy to staging Coolify via webhook |
| 6 | `deploy-backend-prod.yml` | Push to `main` + manual approval | Backend | Deploy to prod Coolify via webhook |
| 7 | `security.yml` | Schedule (Mon 02:00 UTC) + push `main` | Both | Snyk + OWASP ZAP + GitGuardian |
| 8 | `release.yml` | Push tag `v*.*.*` | Backend | Create GitHub release + CHANGELOG |
| 9 | `artifact-cleanup.yml` | Schedule (daily) | Both | Delete old workflow artifacts |
| 10 | `dependabot-automerge.yml` | Dependabot PR | Both | Auto-merge patch updates |

---

## 4. Pipeline Flow Diagram

```
Developer workstation
        │
        │  git commit (pre-commit hooks: lint, format, typecheck, secret scan)
        ▼
Feature branch (e.g. feat/product-filter)
        │
        │  git push → GitHub
        ▼
Pull Request opened
        │
        ├──► Frontend CI (frontend-ci.yml)
        │         1. Setup: Node 22, pnpm 9
        │         2. ESLint + Prettier + Stylelint  ──── FAIL → block PR
        │         3. TypeScript strict check         ──── FAIL → block PR
        │         4. Vitest unit tests (coverage ≥70%) ─ FAIL → block PR
        │         5. Astro build
        │         6. Cloudflare Pages preview deploy
        │         7. Playwright E2E on preview URL
        │         8. axe-core accessibility (0 critical)
        │         9. Lighthouse CI (≥90 Perf, ≥95 A11y/BP/SEO)
        │         10. Post results as PR comment
        │
        ├──► Backend CI (backend-ci.yml)
        │         1. Setup: Node 22, pnpm 9, Docker
        │         2. ESLint
        │         3. TypeScript check
        │         4. Vitest unit + Supertest integration (Postgres service container)
        │         5. strapi config-sync diff (detect schema drift)
        │         6. Docker multi-stage build
        │         7. Trivy vulnerability scan (0 high/critical)
        │
        └──► 1 reviewer approval required (CODEOWNERS)
                │
                ▼
        Squash merge to `main`
                │
                ├──► Frontend auto-deploy
                │         deploy-frontend-prod.yml
                │         → Cloudflare Pages deploys immediately
                │         → Slack #deployments notification
                │
                └──► Backend gated deploy
                          deploy-backend-prod.yml
                          → Waits for manual approval in GitHub Environments
                          → Tech Lead approves in GitHub UI
                          → Coolify webhook triggers rolling restart
                          → Health check verification
                          → Slack #deployments notification
```

---

## 5. Stage Details

### 5.1 Frontend CI Stages

| Stage | Tool | Pass Criteria | Est. Duration | On Failure |
|-------|------|--------------|---------------|------------|
| lint | ESLint 9 + Prettier 3 + Stylelint | 0 errors | ~1 min | Block PR merge |
| typecheck | tsc --noEmit --strict | 0 errors | ~1 min | Block PR merge |
| unit-test | Vitest 2 | ≥70% coverage, 0 failures | ~2 min | Block PR merge |
| build | astro build | Successful build, <80 KB JS bundle | ~2 min | Block PR merge |
| preview-deploy | Cloudflare Pages (preview) | Deploy successful | ~2 min | Block PR merge |
| e2e | Playwright 1.49 | All scenarios pass | ~5 min | Block PR merge |
| accessibility | axe-playwright | 0 critical/serious | ~3 min | Block PR merge |
| lighthouse | Lighthouse CI 12 | Perf ≥90, A11y ≥95, BP ≥95, SEO ≥95 | ~4 min | Block PR merge |
| **Total** | | | **~20 min** | |

### 5.2 Backend CI Stages

| Stage | Tool | Pass Criteria | Est. Duration | On Failure |
|-------|------|--------------|---------------|------------|
| lint | ESLint 9 | 0 errors | ~1 min | Block PR merge |
| typecheck | tsc | 0 errors | ~1 min | Block PR merge |
| unit-test | Vitest + Supertest | 0 failures, ≥70% coverage | ~3 min | Block PR merge |
| integration | Postgres service container | All passing | ~3 min | Block PR merge |
| schema-diff | strapi config-sync diff | No unexpected schema drift | ~1 min | Warn + require review |
| docker-build | Docker multi-stage | Successful build | ~4 min | Block PR merge |
| trivy-scan | Trivy | 0 HIGH/CRITICAL CVEs | ~3 min | Block PR merge |
| **Total** | | | **~16 min** | |

### 5.3 Security Pipeline Stages

| Stage | Tool | Frequency | On Finding |
|-------|------|-----------|-----------|
| dependency-scan | Snyk | Weekly Mon 02:00 UTC + main push | GitHub issue + Slack #security |
| secret-scan | GitGuardian | Every push | Immediate alert + emergency rotation |
| dast-scan | OWASP ZAP | Weekly against staging | GitHub issue (0 high/critical threshold) |
| container-scan | Trivy | Every backend build | Block deployment if HIGH/CRITICAL |

---

## 6. Quality Gates Summary

All gates must pass for deployment. No exceptions without documented exception approval.

| Gate | Threshold | Enforced By |
|------|-----------|-------------|
| ESLint errors | 0 | Pre-commit + CI |
| Prettier formatting | Compliant | Pre-commit + CI |
| TypeScript errors (strict mode) | 0 | CI |
| Unit test failures | 0 | CI |
| Test coverage (overall) | ≥ 70% | CI |
| Test coverage (business logic) | 100% | CI |
| Lighthouse Performance | ≥ 90 per page | CI |
| Lighthouse Accessibility | ≥ 95 per page | CI |
| Lighthouse Best Practices | ≥ 95 per page | CI |
| Lighthouse SEO | ≥ 95 per page | CI |
| axe-core critical/serious | 0 | CI |
| Snyk HIGH/CRITICAL CVEs | 0 | Weekly scan |
| Trivy HIGH/CRITICAL CVEs | 0 | Every image build |
| OWASP ZAP HIGH/CRITICAL | 0 | Weekly scan |
| JS bundle size (shell route) | < 80 KB | CI custom check |
| PR review approvals | ≥ 1 (CODEOWNERS) | GitHub branch protection |

---

## 7. Deployment Windows

Deployments are restricted to reduce risk during high-traffic periods.

| Environment | Frontend Deploy Window | Backend Deploy Window | Notes |
|-------------|----------------------|----------------------|-------|
| Development | Any time | Any time | Automated, no gate |
| Staging | Any time | Any time | Automated on `staging` branch push |
| Production (Frontend) | Any time | — | Cloudflare Pages deploys instantly |
| Production (Backend) | Tue/Thu only | 10:00–14:00 UTC | Avoids MENA peak (15:00–22:00 GST) |

> **Emergency hotfixes** bypass the deployment window restriction. Tech Lead documents the override in Slack #ops.

---

## 8. Rollback Triggers

Automated and manual rollback can be triggered by:

| Trigger | Threshold | Action |
|---------|-----------|--------|
| Sentry error rate spike | >10 new errors/min in 5-min window | Immediate manual rollback (Tech Lead) |
| Lighthouse score drop | >5 points below baseline | Investigate; rollback if regression confirmed |
| API 5xx rate | >1% over 5 min (Cloudflare Analytics) | Immediate rollback |
| UptimeRobot alert | Site down >5 min | Incident declared; rollback initiated |
| Manual detection | Any user-reported regression | Tech Lead decision |

See `TwinMOSWebsiteRollback_Runbook.md` for rollback procedures.

---

## 9. GitHub Actions Secrets

### 9.1 Repository-Level Secrets

| Secret Name | Purpose | Used By |
|-------------|---------|---------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare Pages deploy | frontend-ci, deploy-frontend-* |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Pages project ID | deploy-frontend-* |
| `SNYK_TOKEN` | Snyk dependency scanning | security.yml |
| `GITGUARDIAN_API_KEY` | Secret detection | security.yml |
| `SENTRY_AUTH_TOKEN` | Source map upload | frontend-ci, backend-ci |
| `SENTRY_ORG` | Sentry organisation slug | frontend-ci, backend-ci |
| `LHCI_GITHUB_APP_TOKEN` | Lighthouse CI assertions | frontend-ci |
| `SLACK_WEBHOOK_DEPLOYMENTS` | Deploy notifications | deploy-* |
| `SLACK_WEBHOOK_SECURITY` | Security alerts | security.yml |

### 9.2 Environment-Scoped Secrets (Staging)

| Secret Name | Purpose |
|-------------|---------|
| `COOLIFY_WEBHOOK_URL` | Trigger backend deploy on staging Coolify |
| `B2_APPLICATION_KEY_ID` | Upload build artifacts to B2 |
| `B2_APPLICATION_KEY` | Upload build artifacts to B2 |

### 9.3 Environment-Scoped Secrets (Production)

| Secret Name | Purpose |
|-------------|---------|
| `COOLIFY_WEBHOOK_URL` | Trigger backend deploy on production Coolify |
| `B2_APPLICATION_KEY_ID` | Upload build artifacts to B2 |
| `B2_APPLICATION_KEY` | Upload build artifacts to B2 |

### 9.4 GitHub Environments Configuration

```
Environments:
  staging:
    - No approval required
    - Secrets: COOLIFY_WEBHOOK_URL (staging), B2_* (staging)

  production:
    - Required reviewers: [Tech Lead] (1 reviewer)
    - Wait timer: 0 min (no automatic delay)
    - Deployment branch rule: main only
    - Secrets: COOLIFY_WEBHOOK_URL (prod), B2_* (prod)
```

---

## 10. Concurrency Rules

```yaml
# PR workflows — cancel superseded runs
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

# Production deployments — queue, never cancel
concurrency:
  group: production-deploy
  cancel-in-progress: false
```

---

## 11. Notification Matrix

| Event | Channel | Notification |
|-------|---------|-------------|
| CI pass on PR | GitHub PR comment | Lighthouse scores + test summary |
| CI fail on PR | GitHub PR comment | Failed step + logs link |
| Staging deploy success | Slack #deployments | "Staging deployed: v1.2.3 at 14:32 UTC" |
| Production deploy success | Slack #deployments | "Production deployed: v1.2.3 at 10:15 UTC" |
| Production deploy fail | Slack #ops (+ page) | "PROD DEPLOY FAILED: v1.2.3 — immediate action" |
| Security finding (HIGH/CRITICAL) | Slack #security | Issue details + CVE ID + remediation link |
| Rollback triggered | Slack #ops | "ROLLBACK: v1.2.3 → v1.2.2 — reason: [text]" |

---

## 12. Shared Composite Actions

Reusable actions defined in `.github/actions/`:

### `setup-node-pnpm`
```yaml
# .github/actions/setup-node-pnpm/action.yml
name: Setup Node + pnpm
runs:
  using: composite
  steps:
    - uses: actions/setup-node@v4
      with:
        node-version: '22'
    - uses: pnpm/action-setup@v3
      with:
        version: 9
    - run: pnpm install --frozen-lockfile
      shell: bash
```

### `setup-docker`
```yaml
# .github/actions/setup-docker/action.yml
name: Setup Docker Buildx
runs:
  using: composite
  steps:
    - uses: docker/setup-buildx-action@v3
    - uses: docker/login-action@v3
      with:
        registry: ghcr.io
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
```

---

## 13. Artifact Retention Policy

| Artifact Type | Retention |
|---------------|-----------|
| Workflow run logs | 30 days (GitHub default) |
| Build artifacts (JS bundles) | 7 days |
| Docker images (ghcr.io) | Latest 5 tags retained; older pruned |
| Lighthouse reports | 14 days |
| Test coverage reports | 14 days |

---

## 14. Emergency CI Bypass

**Under no circumstances** should `--no-verify` be used to bypass pre-commit hooks or CI gates without documented approval.

Emergency bypass procedure:
1. Tech Lead documents the reason in Slack #ops
2. Creates a GitHub issue labelling it `emergency-bypass`
3. Uses GitHub break-glass environment to bypass approval (see `TwinMOSWebsiteBranchProtectionRules.md` §7)
4. Follow-up hotfix PR restores all quality gates within 24h

---

## 15. Phase Activation

| Pipeline Feature | P1 | P2 | P3 |
|-----------------|-----|-----|-----|
| Frontend CI (lint, test, build) | ✓ | ✓ | ✓ |
| Backend CI (lint, test, Docker) | ✓ | ✓ | ✓ |
| Playwright E2E | ✓ | ✓ | ✓ |
| axe-core accessibility | ✓ | ✓ | ✓ |
| Lighthouse CI | ✓ | ✓ | ✓ |
| Weekly Snyk/ZAP security scan | ✓ | ✓ | ✓ |
| BrowserStack cross-browser | ✗ | ✓ | ✓ |
| PostHog feature flag gates | ✗ | ✗ | ✓ |
| Load test (k6) pre-release | ✓ | ✓ | ✓ |
| Visual regression (Playwright snapshots) | ✗ | ✓ | ✓ |

---

*Approved by: Chairman · Tech Lead*  
*Review cycle: Per phase launch + annually*
