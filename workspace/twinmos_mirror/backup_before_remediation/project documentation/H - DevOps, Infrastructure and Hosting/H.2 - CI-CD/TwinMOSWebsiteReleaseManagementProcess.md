# TwinMOS Website — Release Management Process

| | |
|:---|:---|
| **Reference** | H.2-005 |
| **Priority** | P1 |
| **Status** | [M] Must-have |
| **Author** | DevOps Lead |
| **Version** | 1.0 |
| **Date** | 2026-05-01 |
| **Review Cycle** | Per release |

---

## 1. Purpose

This document defines the release management process for the TwinMOS website. It covers release cadence, versioning, pre-release checklists, deployment orchestration, rollback procedures, and post-release verification for both frontend (Astro/Cloudflare Pages) and backend (Strapi/Coolify) components.

---

## 2. Release Types

| Type | Frequency | Trigger | Approval |
|:---|:---|:---|:---|
| **Scheduled Release** | Bi-weekly (Sprint end) | Sprint completion | Tech Lead |
| **Hotfix Release** | As needed | Production incident | Tech Lead (expedited) |
| **Security Release** | As needed | CVE patch | Tech Lead + Security |
| **Dependency Update** | Monthly | Dependabot batch | Dev team |

---

## 3. Versioning Strategy

The project follows **Semantic Versioning 2.0.0**:

```
MAJOR.MINOR.PATCH

Example: 1.4.2
```

| Component | Bump Rule | Example |
|:---|:---|:---|
| **MAJOR** | Breaking change to public API, database schema migration requiring data transform, infrastructure architecture change | `1.x.x` -> `2.0.0` |
| **MINOR** | New feature, new content type, new locale, non-breaking API addition | `x.4.x` -> `x.5.0` |
| **PATCH** | Bug fix, performance improvement, security patch, dependency update | `x.x.2` -> `x.x.3` |

**Monorepo versioning**: Single version for entire repository. Both frontend and backend deploy together under the same version tag.

---

## 4. Release Cadence

### 4.1 Standard Sprint Release

```
Week 1-2: Sprint execution
    |
    v
Day 10 (Fri): Feature freeze — no new features merged
    |
    v
Day 11-12 (Mon-Tue): Stabilization — bug fixes only
    |
    v
Day 12 (Tue PM): Release candidate created
    |
    v
Day 13 (Wed): QA validation on staging
    |
    v
Day 13 (Wed PM): Production deploy (if QA passes)
    |
    v
Day 14 (Thu): Post-release monitoring
```

### 4.2 Hotfix Release

```
Incident detected
    |
    v
Immediate: Hotfix branch from latest production tag
    |
    v
Within 1 hour: Fix developed and tested locally
    |
    v
Within 2 hours: PR opened, expedited review
    |
    v
Within 3 hours: Merged and deployed to production
    |
    v
Within 24 hours: Post-incident review scheduled
```

---

## 5. Pre-Release Checklist

### 5.1 Technical Checklist

- [ ] All sprint issues closed or moved to next sprint
- [ ] `main` branch CI passes (all required checks green)
- [ ] Lighthouse CI scores: Performance >= 90, Accessibility >= 95
- [ ] Security scan passes (Snyk: no high/critical, GitGuardian: clean)
- [ ] Database migration dry-run successful (backend)
- [ ] Staging environment deployed and smoke-tested
- [ ] Sentry release created with source maps
- [ ] CHANGELOG.md updated with all changes

### 5.2 Content Checklist

- [ ] CMS content published on staging matches production intent
- [ ] All new locales have content populated (if applicable)
- [ ] SEO metadata verified on staging
- [ ] Redirect rules tested (if any URL changes)

### 5.3 Business Checklist

- [ ] PM approves release content
- [ ] Marketing notified of go-live time
- [ ] Customer support briefed on new features
- [ ] Rollback plan documented and communicated

---

## 6. Release Execution

### 6.1 Automated Release (Standard)

```bash
# 1. Navigate to GitHub Actions -> Release workflow
# 2. Click "Run workflow"
# 3. Select version bump type: patch | minor | major
# 4. Click "Run workflow"
```

**What the workflow does:**
1. Bumps version in `package.json`
2. Generates changelog from conventional commits
3. Commits version bump and changelog
4. Creates Git tag (`v{version}`)
5. Creates GitHub Release with changelog
6. Triggers CD workflows for production deployment

### 6.2 Manual Release (Emergency)

```bash
# 1. Ensure main is clean and CI passes
git checkout main
git pull origin main

# 2. Bump version
pnpm version patch  # or minor, or major

# 3. Generate changelog
pnpm exec conventional-changelog -p angular -i CHANGELOG.md -s

# 4. Commit and tag
git add package.json CHANGELOG.md pnpm-lock.yaml
git commit -m "chore(release): v$(node -p "require('./package.json').version")"
git tag -a "v$(node -p "require('./package.json').version")" -m "Release v$(node -p "require('./package.json').version")"

# 5. Push
git push origin main --follow-tags

# 6. Create GitHub Release manually with changelog
```

---

## 7. Deployment Orchestration

### 7.1 Deployment Order

```
Step 1: Backend (Strapi)
    |
    v
Step 2: Database migrations (if any)
    |
    v
Step 3: Verify backend health (5 min)
    |
    v
Step 4: Frontend (Astro)
    |
    v
Step 5: Purge CDN cache
    |
    v
Step 6: Smoke tests
    |
    v
Step 7: Monitor for 30 min
```

### 7.2 Deployment Windows

| Environment | Window | Duration |
|:---|:---|:---|
| Staging | Any time | No restriction |
| Production | Tuesday-Thursday, 08:00-12:00 UTC | 4-hour window |
| Hotfix | Any time | Immediate |

**No production deploys on:**
- Fridays (weekend risk)
- Major marketing campaign days
- Known high-traffic periods (product launches)

---

## 8. Rollback Procedures

### 8.1 Frontend Rollback (Cloudflare Pages)

```bash
# Method 1: Re-deploy previous version via GitHub Actions
# Go to Actions -> CD Frontend Production -> Run workflow
# Enter previous release tag (e.g., v1.3.2)

# Method 2: Cloudflare Dashboard
# 1. Log in to Cloudflare Dashboard
# 2. Navigate to Pages -> twinmos-website-prod
# 3. Go to "Deployments" tab
# 4. Find previous successful deployment
# 5. Click "Rollback to this deployment"
# 6. Confirm

# Rollback time: < 2 minutes
```

### 8.2 Backend Rollback (Coolify)

```bash
# Method 1: Coolify auto-rollback
# Coolify automatically rolls back to previous healthy
# image if health checks fail after deploy

# Method 2: Manual rollback via Coolify UI
# 1. Log in to Coolify dashboard
# 2. Navigate to the Strapi application
# 3. Go to "Deployments" tab
# 4. Select previous deployment
# 5. Click "Rollback"

# Method 3: Manual via CLI
ssh root@<hetzner-ip>
cd /data/coolify/applications/<app-id>
docker compose down
docker compose up -d --no-deps --build strapi

# Rollback time: < 5 minutes
```

### 8.3 Database Rollback

```bash
# WARNING: Database rollback is destructive.
# Only use for failed migrations.

# 1. Restore from pre-release backup
# See H.4-003 Database Backup and Restore Runbook

# 2. Or manually revert migrations (if reversible)
cd apps/backend
pnpm strapi db:migrate:down

# Always have backup before production deploy with migrations
```

### 8.4 Rollback Decision Matrix

| Scenario | Action | Time |
|:---|:---|:---|
| Frontend broken (404, 500) | Rollback frontend immediately | < 2 min |
| Backend API errors | Rollback backend, keep frontend | < 5 min |
| Database migration failed | Restore DB + rollback backend | < 30 min |
| Performance degradation | Scale up resources first, then investigate | < 10 min |
| Security incident | Full rollback + incident response | < 15 min |

---

## 9. Post-Release Verification

### 9.1 Automated Verification (5 minutes)

- [ ] Health check endpoints return 200
- [ ] Sentry shows no new errors (compared to baseline)
- [ ] UptimeRobot shows all green
- [ ] Cloudflare analytics show normal traffic
- [ ] Plausible analytics receiving data

### 9.2 Manual Verification (15 minutes)

- [ ] Homepage loads correctly (all locales)
- [ ] Key user journeys work (product browse, search, contact)
- [ ] CMS admin accessible and functional
- [ ] Mobile responsiveness verified
- [ ] RTL layout correct (Arabic)

### 9.3 Monitoring Window (30 minutes)

Watch the following dashboards:
- Sentry Issues (new errors)
- Cloudflare Analytics (traffic anomalies)
- Coolify Resource Usage (CPU, memory)
- UptimeRobot (availability)

---

## 10. Release Communication

### 10.1 Internal Communication

| Timing | Channel | Audience | Content |
|:---|:---|:---|:---|
| 24h before | Slack #releases | Dev team, PM | Release schedule, expected changes |
| At deploy | Slack #deployments | Dev team, PM | Deploy started, version |
| Post-deploy | Slack #deployments | Dev team, PM | Deploy completed, status |
| If rollback | Slack #deployments + call | All stakeholders | Rollback reason, next steps |

### 10.2 External Communication

| Scenario | Channel | Timing |
|:---|:---|:---|
| New feature launch | Marketing team | Coordinated with marketing calendar |
| Downtime > 5 min | Status page | Immediate |
| Security patch | Customer email | Within 24h if customer-impacting |

---

## 11. Release History Template

Each release is documented in the repository:

```markdown
## Release v1.4.0 — 2026-06-15

### Changes
- feat(frontend): add product comparison widget
- feat(backend): support bulk product import
- fix(search): resolve Arabic tokenization edge case
- perf(frontend): optimize image loading with fetchpriority

### Deployment
- Deployed by: GitHub Actions
- Deploy time: 2026-06-15 09:30 UTC
- Duration: 4 minutes

### Verification
- Health checks: PASS
- Lighthouse: 94/98/100/100
- Sentry: No new errors (30 min window)

### Rollback Plan
- Previous version: v1.3.2
- Rollback command: Re-run CD with tag v1.3.2
```

---

## 12. Change Log

| Version | Date | Author | Changes |
|:---|:---|:---|:---|
| 1.0 | 2026-05-01 | DevOps Lead | Initial release |

---

## 13. Sign-off

| Role | Name | Date | Signature |
|:---|:---|:---|:---|
| DevOps Lead | | | |
| Tech Lead | | | |
| Project Manager | | | |
