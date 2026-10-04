# TwinMOS Website — Branch Protection Rules

| | |
|:---|:---|
| **Reference** | H.2-004 |
| **Priority** | P0 |
| **Status** | [P] Planned |
| **Author** | DevOps Lead |
| **Version** | 1.0 |
| **Date** | 2026-05-01 |
| **Review Cycle** | Quarterly |

---

## 1. Purpose

This document defines branch protection rules, merge policies, and repository governance for the TwinMOS website monorepo. These rules enforce code review, prevent force-pushes, and ensure all changes pass automated checks before reaching protected branches.

---

## 2. Branch Strategy

### 2.1 Branch Model: GitHub Flow (Simplified)

Given the 2-developer team size, a simplified GitHub Flow model is used instead of full GitFlow:

```
main (protected)  <-- always deployable
  |
  +-- feature/189-arabic-rtl
  +-- fix/ graphql-nplus1
  +-- hotfix/security-patch
  +-- dependabot/npm-astro-5.2.0
```

### 2.2 Branch Naming Convention

| Prefix | Purpose | Example |
|:---|:---|:---|
| `feature/` | New functionality | `feature/142-product-comparison` |
| `fix/` | Bug fixes | `fix/189-arabic-slug-encoding` |
| `hotfix/` | Production emergency fixes | `hotfix/reset-jwt-keys` |
| `docs/` | Documentation updates | `docs/deployment-runbook` |
| `refactor/` | Code restructuring | `refactor/extract-auth-service` |
| `deps/` | Dependency updates | `deps/upgrade-strapi-5-3` |
| `i18n/` | Localization work | `i18n/add-bengali-locale` |
| `security/` | Security patches | `security/patch-cve-2026-xxxx` |

**Naming rules:**
- Lowercase only
- Use kebab-case
- Include issue/ticket number when applicable
- Max 50 characters

---

## 3. Protected Branches

### 3.1 `main` Branch Protection

| Rule | Setting | Rationale |
|:---|:---|:---|
| **Require pull request before merging** | Enabled | All changes peer-reviewed |
| **Required approvals** | 1 | Minimum viable for 2-person team |
| **Dismiss stale reviews** | Enabled | New commits invalidate prior approval |
| **Require review from code owners** | Disabled | Team too small for CODEOWNERS overhead |
| **Require status checks to pass** | Enabled | CI must be green |
| **Required checks** | `ci-frontend`, `ci-backend`, `ci-security` | Full quality gate |
| **Require branches to be up to date** | Enabled | Prevents merge conflicts in main |
| **Require signed commits** | Disabled | GPG overhead not justified for team size |
| **Require linear history** | Enabled | Clean history, easier bisect |
| **Include administrators** | Enabled | Rules apply to everyone |
| **Allow force pushes** | Disabled | Prevent history rewrite |
| **Allow deletions** | Disabled | Prevent accidental branch deletion |
| **Require conversation resolution** | Enabled | All review comments addressed |

### 3.2 `release/*` Branch Protection (Optional)

For major releases with extended stabilization:

| Rule | Setting |
|:---|:---|
| Require pull request | Enabled |
| Required approvals | 2 (Tech Lead + PM) |
| Required checks | All CI + manual QA sign-off |
| Allow force pushes | Disabled |
| Allow deletions | Disabled |

---

## 4. Status Check Requirements

### 4.1 Required Checks for `main`

| Check | Source Workflow | Timeout | Blocking |
|:---|:---|:---|:---|
| `lint-and-typecheck (frontend)` | `ci-frontend.yml` | 5 min | Yes |
| `unit-tests (frontend)` | `ci-frontend.yml` | 10 min | Yes |
| `build (frontend)` | `ci-frontend.yml` | 10 min | Yes |
| `lighthouse-ci` | `ci-frontend.yml` | 15 min | No (warn only) |
| `lint-and-typecheck (backend)` | `ci-backend.yml` | 5 min | Yes |
| `unit-tests (backend)` | `ci-backend.yml` | 10 min | Yes |
| `migration-check` | `ci-backend.yml` | 10 min | Yes |
| `docker-build` | `ci-backend.yml` | 15 min | Yes |
| `snyk-sca` | `ci-security.yml` | 10 min | Yes |
| `gitguardian` | `ci-security.yml` | 5 min | Yes |
| `codeql` | `ci-security.yml` | 20 min | No (warn only) |

### 4.2 Check Behavior

```
Pull Request opened
    |
    v
All required checks MUST pass
    |
    v
Branch must be up-to-date with main
    |
    v
At least 1 approval required
    |
    v
All review conversations resolved
    |
    v
Merge button enabled (squash only)
```

---

## 5. Merge Strategy

### 5.1 Allowed Methods

| Method | Allowed | Use Case |
|:---|:---|:---|
| **Squash and merge** | Yes (default) | All feature/fix PRs — clean linear history |
| **Rebase and merge** | No | Avoids merge commits but loses PR metadata |
| **Create a merge commit** | No | Preserves branch history but clutters log |

### 5.2 Squash Merge Commit Message

Default to PR title + description. Format:

```
feat(frontend): add product comparison widget (#142)

- Side-by-side spec table comparison
- Shareable comparison URLs
- Mobile-responsive layout
- Max 4 products per comparison

Closes #142
```

**Commit message template** (`.github/pull_request_template.md`):

```markdown
## Summary
<!-- Brief description of changes -->

## Type
- [ ] feat
- [ ] fix
- [ ] docs
- [ ] refactor
- [ ] perf
- [ ] test
- [ ] security

## Scope
<!-- frontend, backend, api, cms, db, search, auth, i18n, infra, ci, deps -->

## Related Issues
<!-- Link to related issues: Fixes #123, Closes #456 -->

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Changes are documented
- [ ] Tests added/updated
- [ ] All CI checks pass
- [ ] No secrets committed
```

---

## 6. CODEOWNERS (Lightweight)

Given the 2-developer team, a minimal CODEOWNERS file provides automatic review assignment without overhead:

**`.github/CODEOWNERS`**:

```
# Global fallback — both developers review everything
* @developer-a @developer-b

# Infrastructure changes require Tech Lead
.github/workflows/ @tech-lead
.docker/ @tech-lead
docker-compose.yml @tech-lead

# Security-related files
.github/workflows/ci-security.yml @tech-lead
security/ @tech-lead

# Documentation
*.md @project-manager @tech-lead
```

---

## 7. Dependabot Configuration

### 7.1 `.github/dependabot.yml`

```yaml
version: 2
updates:
  # Frontend dependencies
  - package-ecosystem: npm
    directory: /apps/frontend
    schedule:
      interval: weekly
      day: monday
      time: "06:00"
      timezone: Asia/Dubai
    open-pull-requests-limit: 5
    labels:
      - dependencies
      - frontend
    commit-message:
      prefix: deps
      prefix-development: deps(dev)
      include: scope
    reviewers:
      - developer-a
    ignore:
      - dependency-name: "astro"
        update-types: ["version-update:semver-major"]
      - dependency-name: "@strapi/*"
        update-types: ["version-update:semver-major"]

  # Backend dependencies
  - package-ecosystem: npm
    directory: /apps/backend
    schedule:
      interval: weekly
      day: monday
      time: "06:00"
      timezone: Asia/Dubai
    open-pull-requests-limit: 5
    labels:
      - dependencies
      - backend
    commit-message:
      prefix: deps
      prefix-development: deps(dev)
      include: scope
    reviewers:
      - developer-b
    ignore:
      - dependency-name: "@strapi/*"
        update-types: ["version-update:semver-major"]

  # Root workspace dependencies
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
      day: monday
      time: "06:00"
      timezone: Asia/Dubai
    open-pull-requests-limit: 3
    labels:
      - dependencies
    commit-message:
      prefix: deps
      prefix-development: deps(dev)

  # GitHub Actions
  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: monthly
    labels:
      - dependencies
      - ci
    commit-message:
      prefix: ci
      include: scope
```

### 7.2 Auto-Merge Policy

| Update Type | Auto-Merge | Required Checks |
|:---|:---|:---|
| Patch (semver-patch) | Yes | CI passes |
| Minor (semver-minor) | No | Manual review required |
| Major (semver-major) | No | Tech Lead approval required |
| Security advisory | No | Immediate review + deploy |

---

## 8. Repository Settings

### 8.1 General Settings

| Setting | Value |
|:---|:---|
| Default branch | `main` |
| Delete head branches after merge | Enabled |
| Always suggest updating pull request branches | Enabled |
| Allow auto-merge | Disabled (manual merge only) |
| Automatically delete head branches | Enabled |

### 8.2 Security Settings

| Setting | Value |
|:---|:---|
| Dependency graph | Enabled |
| Dependabot alerts | Enabled |
| Dependabot security updates | Enabled |
| Code scanning (CodeQL) | Enabled |
| Secret scanning | Enabled |
| Push protection for secrets | Enabled |

---

## 9. Emergency Procedures

### 9.1 Hotfix Process

When production requires an immediate fix:

1. Create branch from `main`: `hotfix/description`
2. Make minimal fix, commit with `hotfix:` prefix
3. Open PR with `hotfix` label
4. Tech Lead approves with expedited review
5. Merge via squash
6. CD deploys automatically to production
7. Post-incident: create follow-up issue for proper long-term fix

### 9.2 Bypassing Protection (Break-Glass)

In extreme emergencies (e.g., active security incident):

1. Tech Lead temporarily disables branch protection
2. Apply fix directly to `main`
3. Re-enable protection immediately after
4. Document incident in security log
5. Retro within 48 hours

**Never bypass without:**
- Active incident declared
- Tech Lead authorization
- Post-incident documentation

---

## 10. Audit & Compliance

| Audit Item | Frequency | Responsible |
|:---|:---|:---|
| Review branch protection settings | Monthly | DevOps Lead |
| Verify required checks are current | Monthly | DevOps Lead |
| Audit merge history for anomalies | Quarterly | Tech Lead |
| Review CODEOWNERS accuracy | Quarterly | Tech Lead |
| Dependabot alert resolution time | Weekly | Dev team |

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
