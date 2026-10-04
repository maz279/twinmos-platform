# TwinMOS Website — GitHub Actions Workflows Specification

| | |
|:---|:---|
| **Reference** | H.2-002 |
| **Priority** | P0 |
| **Status** | [M] Must-have |
| **Author** | DevOps Lead |
| **Version** | 1.0 |
| **Date** | 2026-05-01 |
| **Review Cycle** | Quarterly or on stack change |

---

## 1. Purpose

This document defines every GitHub Actions workflow used in the TwinMOS website monorepo. It specifies triggers, job matrices, secrets consumption, artifact handling, concurrency controls, and environment targeting. All workflows are designed for a 2-developer team with minimal maintenance overhead.

---

## 2. Repository Structure

```
twinmos-website/
├── .github/
│   ├── workflows/
│   │   ├── ci-frontend.yml          # Astro build, test, Lighthouse
│   │   ├── ci-backend.yml           # Strapi build, test, DB migration check
│   │   ├── ci-security.yml          # Snyk, Trivy, GitGuardian, ZAP baseline
│   │   ├── cd-frontend-staging.yml  # Deploy Astro to Cloudflare Pages (staging)
│   │   ├── cd-frontend-prod.yml     # Deploy Astro to Cloudflare Pages (production)
│   │   ├── cd-backend-staging.yml   # Deploy Strapi to Coolify staging
│   │   ├── cd-backend-prod.yml      # Deploy Strapi to Coolify production
│   │   ├── release.yml              # Version bump, changelog, Git tag
│   │   ├── cleanup-artifacts.yml    # Nightly artifact pruning
│   │   └── dependabot-auto-merge.yml # Auto-merge patch updates
│   ├── actions/
│   │   ├── setup-node-pnpm/         # Composite: setup Node + pnpm + cache
│   │   └── setup-docker/            # Composite: setup Docker Buildx + cache
│   └── dependabot.yml
├── apps/
│   ├── frontend/                    # Astro 5.x
│   └── backend/                     # Strapi 5.x
├── packages/
│   ├── shared-config/               # ESLint, Prettier, TS configs
│   └── shared-types/                # Common TypeScript types
├── docker/
│   ├── frontend.Dockerfile
│   └── backend.Dockerfile
├── docker-compose.yml
├── package.json
└── pnpm-workspace.yaml
```

---

## 3. Workflow Inventory

| Workflow File | Trigger | Purpose | Environment |
|:---|:---|:---|:---|
| `ci-frontend.yml` | PR, push to `main`, manual | Build, lint, type-check, unit tests, Lighthouse CI | — |
| `ci-backend.yml` | PR, push to `main`, manual | Build, lint, DB migration dry-run, API test | — |
| `ci-security.yml` | PR, nightly (02:00 UTC), manual | SCA, SAST, container scan, secret scan | — |
| `cd-frontend-staging.yml` | Push to `main`, manual | Build & deploy Astro to Cloudflare Pages (staging) | Staging |
| `cd-frontend-prod.yml` | Release published, manual | Build & deploy Astro to Cloudflare Pages (production) | Production |
| `cd-backend-staging.yml` | Push to `main`, manual | Build Docker image, deploy to Coolify staging | Staging |
| `cd-backend-prod.yml` | Release published, manual | Build Docker image, deploy to Coolify production | Production |
| `release.yml` | Manual (workflow_dispatch) | Bump version, generate changelog, create Git tag + release | — |
| `cleanup-artifacts.yml` | Nightly (03:00 UTC) | Delete artifacts older than 7 days | — |
| `dependabot-auto-merge.yml` | PR opened by dependabot | Auto-merge patch-level dependency updates | — |

---

## 4. Shared Composite Actions

### 4.1 `setup-node-pnpm`

**File**: `.github/actions/setup-node-pnpm/action.yml`

```yaml
name: 'Setup Node + pnpm'
description: 'Install Node.js, pnpm, and restore dependency cache'
inputs:
  node-version:
    description: 'Node.js version'
    required: false
    default: '22'
runs:
  using: composite
  steps:
    - name: Install pnpm
      uses: pnpm/action-setup@v4
      with:
        version: 9

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ inputs.node-version }}
        cache: 'pnpm'

    - name: Install dependencies
      shell: bash
      run: pnpm install --frozen-lockfile
```

### 4.2 `setup-docker`

**File**: `.github/actions/setup-docker/action.yml`

```yaml
name: 'Setup Docker Buildx'
description: 'Setup Docker Buildx with layer caching'
runs:
  using: composite
  steps:
    - name: Set up QEMU
      uses: docker/setup-qemu-action@v3

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3

    - name: Cache Docker layers
      uses: actions/cache@v4
      with:
        path: /tmp/.buildx-cache
        key: ${{ runner.os }}-buildx-${{ github.sha }}
        restore-keys: |
          ${{ runner.os }}-buildx-
```

---

## 5. CI Workflows

### 5.1 Frontend CI (`ci-frontend.yml`)

```yaml
name: CI — Frontend

on:
  pull_request:
    paths:
      - 'apps/frontend/**'
      - 'packages/**'
      - '.github/workflows/ci-frontend.yml'
  push:
    branches: [main]
    paths:
      - 'apps/frontend/**'
      - 'packages/**'
      - '.github/workflows/ci-frontend.yml'
  workflow_dispatch:

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint-and-typecheck:
    name: Lint & Type Check
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup-node-pnpm
      - name: Lint
        run: pnpm --filter frontend lint
      - name: Type check
        run: pnpm --filter frontend typecheck

  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup-node-pnpm
      - name: Run tests
        run: pnpm --filter frontend test:unit --coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./apps/frontend/coverage/lcov.info
          flags: frontend
          token: ${{ secrets.CODECOV_TOKEN }}

  build:
    name: Production Build
    runs-on: ubuntu-24.04
    needs: [lint-and-typecheck]
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup-node-pnpm
      - name: Build
        run: pnpm --filter frontend build
        env:
          STRAPI_API_URL: ${{ secrets.STRAPI_API_URL_STAGING }}
          PUBLIC_SENTRY_DSN: ${{ secrets.SENTRY_DSN_FRONTEND }}
      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: frontend-build
          path: apps/frontend/dist/
          retention-days: 7

  lighthouse-ci:
    name: Lighthouse CI
    runs-on: ubuntu-24.04
    needs: [build]
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup-node-pnpm
      - name: Download build artifact
        uses: actions/download-artifact@v4
        with:
          name: frontend-build
          path: apps/frontend/dist/
      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli@0.14.x
          lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

**Lighthouse CI Config** (`.github/lighthouserc.json`):

```json
{
  "ci": {
    "collect": {
      "staticDistDir": "./apps/frontend/dist",
      "url": ["/", "/about", "/products"],
      "numberOfRuns": 3
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["warn", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.95}],
        "categories:best-practices": ["warn", {"minScore": 0.9}],
        "categories:seo": ["warn", {"minScore": 0.9}],
        "largest-contentful-paint": ["warn", {"maxNumericValue": 1800}],
        "total-blocking-time": ["warn", {"maxNumericValue": 200}],
        "cumulative-layout-shift": ["warn", {"maxNumericValue": 0.1}]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

### 5.2 Backend CI (`ci-backend.yml`)

```yaml
name: CI — Backend

on:
  pull_request:
    paths:
      - 'apps/backend/**'
      - 'packages/**'
      - 'docker/backend.Dockerfile'
      - '.github/workflows/ci-backend.yml'
  push:
    branches: [main]
    paths:
      - 'apps/backend/**'
      - 'packages/**'
      - 'docker/backend.Dockerfile'
      - '.github/workflows/ci-backend.yml'
  workflow_dispatch:

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint-and-typecheck:
    name: Lint & Type Check
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup-node-pnpm
      - name: Lint
        run: pnpm --filter backend lint
      - name: Type check
        run: pnpm --filter backend typecheck

  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-24.04
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: strapi_test
          POSTGRES_PASSWORD: strapi_test
          POSTGRES_DB: strapi_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup-node-pnpm
      - name: Run tests
        run: pnpm --filter backend test:unit
        env:
          DATABASE_CLIENT: postgres
          DATABASE_HOST: localhost
          DATABASE_PORT: 5432
          DATABASE_NAME: strapi_test
          DATABASE_USERNAME: strapi_test
          DATABASE_PASSWORD: strapi_test
          JWT_SECRET: test-jwt-secret
          ADMIN_JWT_SECRET: test-admin-jwt-secret
          APP_KEYS: test-app-key-1,test-app-key-2
          API_TOKEN_SALT: test-api-token-salt
          TRANSFER_TOKEN_SALT: test-transfer-token-salt

  migration-check:
    name: DB Migration Dry-Run
    runs-on: ubuntu-24.04
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: strapi_test
          POSTGRES_PASSWORD: strapi_test
          POSTGRES_DB: strapi_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup-node-pnpm
      - name: Build Strapi
        run: pnpm --filter backend build
      - name: Run migrations (dry-run)
        run: pnpm --filter backend db:migrate:dry
        env:
          DATABASE_CLIENT: postgres
          DATABASE_HOST: localhost
          DATABASE_PORT: 5432
          DATABASE_NAME: strapi_test
          DATABASE_USERNAME: strapi_test
          DATABASE_PASSWORD: strapi_test

  docker-build:
    name: Docker Build Test
    runs-on: ubuntu-24.04
    needs: [lint-and-typecheck]
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup-docker
      - name: Build image
        uses: docker/build-push-action@v6
        with:
          context: .
          file: ./docker/backend.Dockerfile
          push: false
          load: true
          tags: twinmos-backend:test
          cache-from: type=local,src=/tmp/.buildx-cache
          cache-to: type=local,dest=/tmp/.buildx-cache-new,mode=max
      - name: Run Trivy vulnerability scan
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: twinmos-backend:test
          format: sarif
          output: trivy-results.sarif
      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: trivy-results.sarif
```

### 5.3 Security CI (`ci-security.yml`)

```yaml
name: CI — Security Scan

on:
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 2 * * *'
  workflow_dispatch:

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  snyk-sca:
    name: Snyk SCA Scan
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup-node-pnpm
      - name: Run Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high --sarif-file-output=snyk.sarif
      - name: Upload SARIF
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: snyk.sarif
        if: always()

  gitguardian:
    name: GitGuardian Secret Scan
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: GitGuardian scan
        uses: GitGuardian/ggshield/actions/secret@v1.32.0
        env:
          GITHUB_PUSH_BEFORE_SHA: ${{ github.event.before }}
          GITHUB_PUSH_BASE_SHA: ${{ github.event.base }}
          GITHUB_PULL_BASE_SHA: ${{ github.event.pull_request.base.sha }}
          GITHUB_DEFAULT_BRANCH: ${{ github.event.repository.default_branch }}
          GITGUARDIAN_API_KEY: ${{ secrets.GITGUARDIAN_API_KEY }}

  codeql:
    name: CodeQL Analysis
    runs-on: ubuntu-24.04
    permissions:
      actions: read
      contents: read
      security-events: write
    steps:
      - uses: actions/checkout@v4
      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: javascript-typescript
          queries: security-extended,security-and-quality
      - uses: ./.github/actions/setup-node-pnpm
      - name: Build
        run: pnpm build
      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3

  zap-baseline:
    name: OWASP ZAP Baseline Scan
    runs-on: ubuntu-24.04
    needs: [snyk-sca, gitguardian]
    if: github.event_name == 'schedule'
    steps:
      - uses: actions/checkout@v4
      - name: ZAP Baseline Scan
        uses: zaproxy/action-baseline@v0.14.0
        with:
          target: ${{ secrets.ZAP_TARGET_URL_STAGING }}
          rules_file_name: '.zap/rules.tsv'
          cmd_options: '-a'
```

---

## 6. CD Workflows

### 6.1 Frontend Staging Deploy (`cd-frontend-staging.yml`)

```yaml
name: CD — Frontend Staging

on:
  push:
    branches: [main]
    paths:
      - 'apps/frontend/**'
      - 'packages/**'
      - '.github/workflows/cd-frontend-staging.yml'
  workflow_dispatch:

concurrency:
  group: cd-frontend-staging
  cancel-in-progress: false

jobs:
  deploy:
    name: Deploy to Cloudflare Pages (Staging)
    runs-on: ubuntu-24.04
    environment:
      name: staging
      url: https://staging.twinmos.com
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup-node-pnpm

      - name: Build for staging
        run: pnpm --filter frontend build
        env:
          NODE_ENV: staging
          STRAPI_API_URL: ${{ secrets.STRAPI_API_URL_STAGING }}
          PUBLIC_SENTRY_DSN: ${{ secrets.SENTRY_DSN_FRONTEND }}
          PUBLIC_PLAUSIBLE_DOMAIN: staging.twinmos.com
          SITE_URL: https://staging.twinmos.com

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy apps/frontend/dist --project-name=twinmos-website-staging --branch=main

      - name: Purge Cloudflare cache
        run: |
          curl -X POST "https://api.cloudflare.com/client/v4/zones/${{ secrets.CLOUDFLARE_ZONE_ID }}/purge_cache" \
            -H "Authorization: Bearer ${{ secrets.CLOUDFLARE_API_TOKEN }}" \
            -H "Content-Type: application/json" \
            --data '{"purge_everything":true}'

      - name: Notify Slack
        if: always()
        uses: slackapi/slack-github-action@v1.26.0
        with:
          payload: |
            {
              "text": "Frontend staging deploy ${{ job.status }}: ${{ github.event.head_commit.message }}"
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### 6.2 Frontend Production Deploy (`cd-frontend-prod.yml`)

```yaml
name: CD — Frontend Production

on:
  release:
    types: [published]
  workflow_dispatch:
    inputs:
      release_tag:
        description: 'Release tag to deploy'
        required: true

concurrency:
  group: cd-frontend-prod
  cancel-in-progress: false

jobs:
  deploy:
    name: Deploy to Cloudflare Pages (Production)
    runs-on: ubuntu-24.04
    environment:
      name: production
      url: https://www.twinmos.com
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.release.tag_name || github.event.inputs.release_tag }}
      - uses: ./.github/actions/setup-node-pnpm

      - name: Build for production
        run: pnpm --filter frontend build
        env:
          NODE_ENV: production
          STRAPI_API_URL: ${{ secrets.STRAPI_API_URL_PRODUCTION }}
          PUBLIC_SENTRY_DSN: ${{ secrets.SENTRY_DSN_FRONTEND }}
          PUBLIC_PLAUSIBLE_DOMAIN: twinmos.com
          SITE_URL: https://www.twinmos.com

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy apps/frontend/dist --project-name=twinmos-website-prod --branch=main

      - name: Purge Cloudflare cache
        run: |
          curl -X POST "https://api.cloudflare.com/client/v4/zones/${{ secrets.CLOUDFLARE_ZONE_ID }}/purge_cache" \
            -H "Authorization: Bearer ${{ secrets.CLOUDFLARE_API_TOKEN }}" \
            -H "Content-Type: application/json" \
            --data '{"purge_everything":true}'

      - name: Notify Slack
        if: always()
        uses: slackapi/slack-github-action@v1.26.0
        with:
          payload: |
            {
              "text": "Frontend PRODUCTION deploy ${{ job.status }}: ${{ github.event.release.tag_name || github.event.inputs.release_tag }}"
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}

      - name: Create Sentry release
        uses: getsentry/action-release@v1
        env:
          SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
          SENTRY_ORG: twinmos
          SENTRY_PROJECT: website-frontend
        with:
          environment: production
          version: ${{ github.event.release.tag_name || github.event.inputs.release_tag }}
          sourcemaps: apps/frontend/dist
```

### 6.3 Backend Staging Deploy (`cd-backend-staging.yml`)

```yaml
name: CD — Backend Staging

on:
  push:
    branches: [main]
    paths:
      - 'apps/backend/**'
      - 'packages/**'
      - 'docker/backend.Dockerfile'
      - '.github/workflows/cd-backend-staging.yml'
  workflow_dispatch:

concurrency:
  group: cd-backend-staging
  cancel-in-progress: false

jobs:
  build-and-push:
    name: Build & Push Image
    runs-on: ubuntu-24.04
    outputs:
      image_tag: ${{ steps.meta.outputs.tags }}
      image_digest: ${{ steps.build.outputs.digest }}
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup-docker

      - name: Docker meta
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/${{ github.repository }}/backend
          tags: |
            type=sha,prefix=staging-,suffix=,format=short
            type=raw,value=staging-latest

      - name: Login to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push
        id: build
        uses: docker/build-push-action@v6
        with:
          context: .
          file: ./docker/backend.Dockerfile
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    name: Deploy to Coolify Staging
    runs-on: ubuntu-24.04
    needs: [build-and-push]
    environment:
      name: staging
      url: https://api-staging.twinmos.com
    steps:
      - name: Trigger Coolify deployment
        run: |
          curl -X POST "${{ secrets.COOLIFY_WEBHOOK_STAGING }}" \
            -H "Authorization: Bearer ${{ secrets.COOLIFY_API_TOKEN }}" \
            -H "Content-Type: application/json" \
            -d '{
              "docker_image": "ghcr.io/${{ github.repository }}/backend:staging-${{ github.sha }}",
              "commit_sha": "${{ github.sha }}"
            }'

      - name: Wait for health check
        run: |
          for i in {1..30}; do
            STATUS=$(curl -s -o /dev/null -w "%{http_code}" ${{ secrets.HEALTH_CHECK_URL_STAGING }})
            if [ "$STATUS" = "200" ]; then
              echo "Health check passed"
              exit 0
            fi
            echo "Attempt $i: status $STATUS"
            sleep 10
          done
          echo "Health check failed after 300s"
          exit 1

      - name: Notify Slack
        if: always()
        uses: slackapi/slack-github-action@v1.26.0
        with:
          payload: |
            {
              "text": "Backend staging deploy ${{ job.status }}: ${{ github.event.head_commit.message }}"
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### 6.4 Backend Production Deploy (`cd-backend-prod.yml`)

```yaml
name: CD — Backend Production

on:
  release:
    types: [published]
  workflow_dispatch:
    inputs:
      release_tag:
        description: 'Release tag to deploy'
        required: true

concurrency:
  group: cd-backend-prod
  cancel-in-progress: false

jobs:
  build-and-push:
    name: Build & Push Image
    runs-on: ubuntu-24.04
    outputs:
      image_tag: ${{ steps.meta.outputs.tags }}
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.release.tag_name || github.event.inputs.release_tag }}
      - uses: ./.github/actions/setup-docker

      - name: Docker meta
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/${{ github.repository }}/backend
          tags: |
            type=semver,pattern={{version}},value=${{ github.event.release.tag_name || github.event.inputs.release_tag }}
            type=raw,value=latest

      - name: Login to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v6
        with:
          context: .
          file: ./docker/backend.Dockerfile
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    name: Deploy to Coolify Production
    runs-on: ubuntu-24.04
    needs: [build-and-push]
    environment:
      name: production
      url: https://api.twinmos.com
    steps:
      - name: Trigger Coolify deployment
        run: |
          curl -X POST "${{ secrets.COOLIFY_WEBHOOK_PRODUCTION }}" \
            -H "Authorization: Bearer ${{ secrets.COOLIFY_API_TOKEN }}" \
            -H "Content-Type: application/json" \
            -d '{
              "docker_image": "ghcr.io/${{ github.repository }}/backend:${{ github.event.release.tag_name || github.event.inputs.release_tag }}",
              "commit_sha": "${{ github.sha }}"
            }'

      - name: Wait for health check
        run: |
          for i in {1..30}; do
            STATUS=$(curl -s -o /dev/null -w "%{http_code}" ${{ secrets.HEALTH_CHECK_URL_PRODUCTION }})
            if [ "$STATUS" = "200" ]; then
              echo "Health check passed"
              exit 0
            fi
            echo "Attempt $i: status $STATUS"
            sleep 10
          done
          echo "Health check failed after 300s"
          exit 1

      - name: Create Sentry release
        uses: getsentry/action-release@v1
        env:
          SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
          SENTRY_ORG: twinmos
          SENTRY_PROJECT: website-backend
        with:
          environment: production
          version: ${{ github.event.release.tag_name || github.event.inputs.release_tag }}

      - name: Notify Slack
        if: always()
        uses: slackapi/slack-github-action@v1.26.0
        with:
          payload: |
            {
              "text": "Backend PRODUCTION deploy ${{ job.status }}: ${{ github.event.release.tag_name || github.event.inputs.release_tag }}"
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

---

## 7. Release Workflow (`release.yml`)

```yaml
name: Release

on:
  workflow_dispatch:
    inputs:
      version_bump:
        description: 'Version bump type'
        required: true
        default: 'patch'
        type: choice
        options:
          - patch
          - minor
          - major

jobs:
  release:
    name: Create Release
    runs-on: ubuntu-24.04
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}

      - uses: ./.github/actions/setup-node-pnpm

      - name: Configure Git
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"

      - name: Bump version
        run: |
          pnpm version ${{ github.event.inputs.version_bump }} --no-git-tag-version
          NEW_VERSION=$(node -p "require('./package.json').version")
          echo "VERSION=$NEW_VERSION" >> $GITHUB_ENV

      - name: Generate changelog
        run: |
          pnpm exec conventional-changelog -p angular -i CHANGELOG.md -s

      - name: Commit version bump
        run: |
          git add package.json CHANGELOG.md pnpm-lock.yaml
          git commit -m "chore(release): v${{ env.VERSION }}"
          git tag -a "v${{ env.VERSION }}" -m "Release v${{ env.VERSION }}"
          git push origin main --follow-tags

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          tag_name: v${{ env.VERSION }}
          name: Release v${{ env.VERSION }}
          body_path: CHANGELOG.md
          draft: false
          prerelease: false
```

---

## 8. Maintenance Workflows

### 8.1 Artifact Cleanup (`cleanup-artifacts.yml`)

```yaml
name: Cleanup Old Artifacts

on:
  schedule:
    - cron: '0 3 * * *'
  workflow_dispatch:

jobs:
  cleanup:
    name: Delete Old Artifacts
    runs-on: ubuntu-24.04
    steps:
      - name: Delete artifacts older than 7 days
        uses: geekyeggo/delete-artifact@v5
        with:
          name: '*'
          failOnError: false
```

### 8.2 Dependabot Auto-Merge (`dependabot-auto-merge.yml`)

```yaml
name: Dependabot Auto-Merge

on:
  pull_request:
    types: [opened, synchronize]

permissions:
  contents: write
  pull-requests: write

jobs:
  auto-merge:
    name: Auto-Merge Dependabot PRs
    runs-on: ubuntu-24.04
    if: github.actor == 'dependabot[bot]'
    steps:
      - name: Fetch Dependabot metadata
        id: metadata
        uses: dependabot/fetch-metadata@v2
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}

      - name: Auto-merge patch updates
        if: steps.metadata.outputs.update-type == 'version-update:semver-patch'
        run: |
          gh pr merge --auto --squash "$PR_URL"
        env:
          PR_URL: ${{ github.event.pull_request.html_url }}
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## 9. Concurrency & Cancellation Rules

| Workflow | Concurrency Group | Cancel-in-Progress | Rationale |
|:---|:---|:---|:---|
| CI workflows | `{{workflow}}-{{ref}}` | `true` | Cancel redundant runs on new pushes to same branch |
| CD workflows | `cd-{{app}}-{{env}}` | `false` | Never interrupt an in-flight deployment |
| Release | `release` | `false` | Prevent duplicate releases |

---

## 10. Required Secrets & Variables

### 10.1 Repository Secrets

| Secret | Used By | Description |
|:---|:---|:---|
| `CLOUDFLARE_API_TOKEN` | CD frontend | Cloudflare API token with Pages + Zone:Edit |
| `CLOUDFLARE_ACCOUNT_ID` | CD frontend | Cloudflare account identifier |
| `CLOUDFLARE_ZONE_ID` | CD frontend | Zone ID for cache purge |
| `COOLIFY_API_TOKEN` | CD backend | Coolify API authentication token |
| `COOLIFY_WEBHOOK_STAGING` | CD backend | Staging deployment webhook URL |
| `COOLIFY_WEBHOOK_PRODUCTION` | CD backend | Production deployment webhook URL |
| `SENTRY_AUTH_TOKEN` | CD frontend/backend | Sentry internal integration token |
| `SENTRY_DSN_FRONTEND` | CI/CD frontend | Sentry DSN for frontend error tracking |
| `SNYK_TOKEN` | CI security | Snyk API token |
| `GITGUARDIAN_API_KEY` | CI security | GitGuardian API key |
| `LHCI_GITHUB_APP_TOKEN` | CI frontend | Lighthouse CI GitHub app token |
| `CODECOV_TOKEN` | CI frontend/backend | Codecov upload token |
| `SLACK_WEBHOOK_URL` | All CD | Slack incoming webhook for deploy notifications |
| `STRAPI_API_URL_STAGING` | CI/CD frontend | Staging Strapi GraphQL/REST endpoint |
| `STRAPI_API_URL_PRODUCTION` | CI/CD frontend | Production Strapi GraphQL/REST endpoint |
| `HEALTH_CHECK_URL_STAGING` | CD backend | Staging health check endpoint |
| `HEALTH_CHECK_URL_PRODUCTION` | CD backend | Production health check endpoint |
| `ZAP_TARGET_URL_STAGING` | CI security | Target URL for ZAP baseline scan |

### 10.2 Repository Variables

| Variable | Value | Description |
|:---|:---|:---|
| `NODE_VERSION` | `22` | Default Node.js version |
| `PNPM_VERSION` | `9` | pnpm version for all workflows |

---

## 11. Environment Protection Rules

| Environment | Required Reviewers | Wait Timer | Protected Branches |
|:---|:---|:---|:---|
| `staging` | 0 | 0 min | `main` |
| `production` | 1 (Tech Lead) | 5 min | Release tags only |

---

## 12. Artifact Retention

| Artifact | Produced By | Retention | Purpose |
|:---|:---|:---|:---|
| `frontend-build` | CI frontend | 7 days | Reuse in Lighthouse CI, manual inspection |
| `trivy-results.sarif` | CI backend | 30 days | Vulnerability tracking |
| `snyk.sarif` | CI security | 30 days | Dependency vulnerability tracking |
| `coverage-report` | CI frontend/backend | 7 days | Code coverage history |

---

## 13. Notification Matrix

| Event | Channel | Recipient | Content |
|:---|:---|:---|:---|
| CI failure | Slack #dev-alerts | Dev team | Workflow name, commit, failed job |
| Staging deploy | Slack #deployments | Dev team | App, environment, commit SHA, status |
| Production deploy | Slack #deployments + Email | Tech Lead + PM | App, version, changelog summary, status |
| Security scan failure | Slack #security-alerts | Tech Lead + Security | Severity, CVE IDs, affected packages |
| Health check failure | Slack #ops-alerts + PagerDuty | On-call engineer | Endpoint, error details, runbook link |

---

## 14. Disaster Recovery

| Scenario | Recovery Action |
|:---|:---|
| Failed production deploy | Coolify auto-rollback to previous healthy image; manual trigger via `workflow_dispatch` with previous tag |
| Corrupted build artifact | Re-run workflow; artifacts rebuilt from source |
| Secrets compromise | Rotate via GitHub UI; all workflows automatically pick up new values on next run |
| GitHub Actions outage | Manual deployment via local wrangler + docker push + Coolify CLI |

---

## 15. Change Log

| Version | Date | Author | Changes |
|:---|:---|:---|:---|
| 1.0 | 2026-05-01 | DevOps Lead | Initial release |

---

## 16. Sign-off

| Role | Name | Date | Signature |
|:---|:---|:---|:---|
| DevOps Lead | | | |
| Tech Lead | | | |
| Project Manager | | | |
