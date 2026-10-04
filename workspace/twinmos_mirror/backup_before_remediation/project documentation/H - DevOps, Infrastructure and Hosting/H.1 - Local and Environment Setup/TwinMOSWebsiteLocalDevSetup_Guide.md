# TwinMOS Website — Local Development Environment Setup Guide

**Document Reference:** TWN-DEVOPS-H1-001
**Document Version:** 1.0
**Status:** DRAFT — for Unisoft Engineering Review
**Date:** 2 May 2026
**Prepared by:** TwinMOS Digital Transformation Team
**Owner:** IT/Technical Lead (Implementation)
**Audience:** Unisoft engineering team (Dev A, Dev B), future onboarding developers
**Classification:** CONFIDENTIAL — Unisoft + TwinMOS Internal Use
**Synchronized With:** Technology Stack v1.1, Implementation Strategy v3.0, BRD v3.0

---

## Change Log

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | 2 May 2026 | Initial release — local dev environment setup for Strapi v5 + Astro 5 stack |

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Workstation Specification](#2-workstation-specification)
3. [Repository Setup](#3-repository-setup)
4. [Docker Compose Local Stack](#4-docker-compose-local-stack)
5. [IDE Configuration](#5-ide-configuration)
6. [Environment Variables](#6-environment-variables)
7. [Running the Stack Locally](#7-running-the-stack-locally)
8. [Verification Checklist](#8-verification-checklist)
9. [Troubleshooting](#9-troubleshooting)
10. [Onboarding New Developers](#10-onboarding-new-developers)

---

## 1. Prerequisites

### 1.1 Hardware Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 4 cores | 6+ cores |
| RAM | 16 GB | 32 GB |
| Storage (SSD) | 50 GB free | 100 GB free |
| Internet | Broadband | Fiber (for Docker image pulls) |

### 1.2 Software Prerequisites

| Tool | Version | Purpose | Install Link |
|------|---------|---------|--------------|
| Git | 2.40+ | Source control | [git-scm.com](https://git-scm.com) |
| Node.js | 22 LTS | Runtime (Strapi v5 requirement) | [nodejs.org](https://nodejs.org) |
| pnpm | 9.x | Package manager (monorepo-friendly) | [pnpm.io](https://pnpm.io) |
| Docker Desktop | 4.30+ | Local containers | [docker.com](https://docker.com) |
| Docker Compose | 2.25+ | Multi-container orchestration | Bundled with Docker Desktop |
| VSCode | 1.90+ | IDE | [code.visualstudio.com](https://code.visualstudio.com) |
| DBeaver (optional) | 24.x | Database GUI | [dbeaver.io](https://dbeaver.io) |
| Bruno (optional) | 1.x | REST API client | [usebruno.com](https://www.usebruno.com) |

### 1.3 OS Compatibility

| OS | Status | Notes |
|----|--------|-------|
| Ubuntu 24.04 LTS | Primary | Recommended for native Linux development |
| Fedora 41 | Supported | Tested; occasional SELinux adjustments needed |
| Debian 13 | Supported | Stable; slightly older package versions |
| macOS Sonoma+ | Supported | Docker Desktop required; Apple Silicon OK |
| Windows 11 + WSL2 | Supported | Use WSL2 Ubuntu 24.04; Docker Desktop WSL2 backend |

---

## 2. Workstation Specification

### 2.1 Per-Developer Setup (Implementation Strategy v3.0 §3.2)

Each developer maintains an identical local environment to minimize "works on my machine" issues.

```
Developer Workstation
├── OS: Linux (Ubuntu 24.04 LTS recommended)
├── IDE: VSCode + extensions (see §5)
├── AI Assistant: GitHub Copilot ($10/mo) + optional Cursor IDE Pro ($20/mo for Lead)
├── Local Stack (Docker Compose):
│   ├── Astro 5 frontend (localhost:4321)
│   ├── Strapi v5 backend (localhost:1337)
│   ├── PostgreSQL 16 (localhost:5432)
│   ├── MeiliSearch 1.13 (localhost:7700)
│   ├── ImgProxy 3.x (localhost:8080)
│   └── Redis 7 (localhost:6379) — Phase 2+
├── Browsers:
│   ├── Chrome (primary — DevTools + Lighthouse CI)
│   ├── Firefox (parity check)
│   └── iOS Safari (via BrowserStack or physical device)
└── Tools:
    ├── Git + GitHub CLI
    ├── pnpm 9.x
    ├── Node.js 22 LTS
    └── Docker + Docker Compose
```

### 2.2 Git Configuration

```bash
# Set identity (use TwinMOS/Unisoft email)
git config --global user.name "Your Name"
git config --global user.email "your.name@unisoft.com"

# Enable GPG signing for release tags (optional but recommended)
git config --global commit.gpgsign true

# Set default branch name
git config --global init.defaultBranch main

# Configure line endings for cross-platform teams
git config --global core.autocrlf input
```

---

## 3. Repository Setup

### 3.1 Clone the Repositories

```bash
# Create workspace directory
mkdir -p ~/workspace/twinmos
cd ~/workspace/twinmos

# Clone frontend repository (Astro 5)
git clone git@github.com:TwinMOS/twinmos-website-frontend.git frontend
cd frontend
pnpm install

# Clone backend repository (Strapi v5)
cd ..
git clone git@github.com:TwinMOS/twinmos-website-backend.git backend
cd backend
pnpm install
```

### 3.2 Repository Structure

```
twinmos-website-frontend/
├── src/
│   ├── content/              # Astro Content Collections (454 markdown files)
│   ├── components/           # React islands + Astro components
│   ├── layouts/              # Page templates (5 core layouts)
│   ├── pages/                # Astro routes
│   └── styles/               # Tailwind + design tokens
├── public/                   # Static assets
├── astro.config.ts           # Astro configuration
├── tailwind.config.ts        # Design tokens
├── package.json
└── .env.local                # Local env vars (gitignored)

twinmos-website-backend/
├── src/
│   ├── api/                  # Strapi content types
│   ├── extensions/           # Custom controllers, middleware, plugins
│   └── policies/             # Custom auth policies
├── config/                   # Strapi configuration
├── database/                 # Migrations
├── package.json
└── .env                      # Local env vars (gitignored)
```

---

## 4. Docker Compose Local Stack

### 4.1 One-Command Local Stack

A single `docker-compose.yml` boots the entire local development environment.

**File:** `twinmos-website-backend/docker-compose.dev.yml`

```yaml
version: "3.9"

services:
  # ─── PostgreSQL 16 ───
  postgres:
    image: postgres:16-alpine
    container_name: twinmos-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: twinmos_dev
      POSTGRES_USER: twinmos
      POSTGRES_PASSWORD: twinmos_dev_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./docker/postgres/init:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U twinmos -d twinmos_dev"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ─── MeiliSearch 1.13 ───
  meilisearch:
    image: getmeili/meilisearch:v1.13
    container_name: twinmos-meilisearch
    restart: unless-stopped
    environment:
      MEILI_MASTER_KEY: dev_meili_master_key_change_in_prod
      MEILI_ENV: development
    ports:
      - "7700:7700"
    volumes:
      - meilisearch_data:/meili_data
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:7700/health"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ─── ImgProxy 3.x ───
  imgproxy:
    image: darthsim/imgproxy:v3
    container_name: twinmos-imgproxy
    restart: unless-stopped
    environment:
      IMGPROXY_KEY: dev_key_change_in_prod
      IMGPROXY_SALT: dev_salt_change_in_prod
      IMGPROXY_BIND: ":8080"
      IMGPROXY_USE_ETAG: "true"
      IMGPROXY_AUTO_WEBP: "true"
      IMGPROXY_AUTO_AVIF: "true"
    ports:
      - "8080:8080"
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:8080/health"]
      interval: 10s
      timeout: 5s
      retries: 3

  # ─── Redis 7 (Phase 2+) ───
  redis:
    image: redis:7-alpine
    container_name: twinmos-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3
    profiles:
      - phase2

  # ─── Plausible Analytics (self-hosted, optional) ───
  plausible:
    image: plausible/community-edition:v2.1
    container_name: twinmos-plausible
    restart: unless-stopped
    ports:
      - "8000:8000"
    environment:
      BASE_URL: http://localhost:8000
      SECRET_KEY_BASE: dev_secret_change_in_prod_32_chars_min
      DATABASE_URL: postgres://twinmos:twinmos_dev_password@postgres:5432/plausible_dev
    depends_on:
      - postgres
    profiles:
      - analytics

volumes:
  postgres_data:
  meilisearch_data:
  redis_data:
```

### 4.2 Starting the Local Stack

```bash
# Navigate to backend repo (contains docker-compose.dev.yml)
cd ~/workspace/twinmos/backend

# Start core services (Postgres + MeiliSearch + ImgProxy)
docker compose -f docker-compose.dev.yml up -d

# Verify all services are healthy
docker compose -f docker-compose.dev.yml ps

# View logs
docker compose -f docker-compose.dev.yml logs -f

# Start with Redis (Phase 2+)
docker compose -f docker-compose.dev.yml --profile phase2 up -d

# Start with Plausible analytics
docker compose -f docker-compose.dev.yml --profile analytics up -d
```

### 4.3 Stopping the Local Stack

```bash
# Stop all services
docker compose -f docker-compose.dev.yml down

# Stop and remove volumes (WARNING: deletes all local data)
docker compose -f docker-compose.dev.yml down -v

# Stop specific service
docker compose -f docker-compose.dev.yml stop meilisearch
```

---

## 5. IDE Configuration

### 5.1 Required VSCode Extensions

Install these extensions for consistent development experience:

| Extension | Publisher | Purpose |
|-----------|-----------|---------|
| ESLint | Microsoft | Linting (JS/TS) |
| Prettier | Prettier | Code formatting |
| GitLens | GitKraken | Git history and blame |
| Tailwind CSS IntelliSense | Tailwind Labs | Autocomplete for Tailwind classes |
| Astro | Astro | Astro language support |
| React/JSX Snippets | xsburg | React component snippets |
| Docker | Microsoft | Dockerfile and compose support |
| Bruno (REST Client) | helloanoop | API testing (open-source Postman alternative) |
| Error Lens | Alexander | Inline error display |
| Code Spell Checker | Street Side Software | Typos in code and docs |
| i18n Ally | Lokalise | Translation key management |
| Auto Rename Tag | Jun Han | HTML/JSX tag auto-rename |
| Path Intellisense | Christian Kohler | File path autocomplete |
| axe DevTools | Deque | Accessibility testing |
| Lighthouse | Google | Performance auditing |
| GitHub Actions | GitHub | Workflow editing |
| GitHub Pull Requests | GitHub | PR review in IDE |
| Conventional Commits | vivaxy | Commit message linting |

### 5.2 VSCode Settings

**File:** `.vscode/settings.json` (commit to repo)

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "files.associations": {
    "*.astro": "astro"
  },
  "eslint.validate": [
    "javascript",
    "typescript",
    "astro"
  ],
  "tailwindCSS.includeLanguages": {
    "astro": "html"
  }
}
```

### 5.3 VSCode Launch Configuration

**File:** `.vscode/launch.json`

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Astro Frontend",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["dev"],
      "cwd": "${workspaceFolder}/frontend",
      "console": "integratedTerminal"
    },
    {
      "name": "Debug Strapi Backend",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["develop"],
      "cwd": "${workspaceFolder}/backend",
      "console": "integratedTerminal"
    }
  ]
}
```

---

## 6. Environment Variables

### 6.1 Frontend Environment File

**File:** `frontend/.env.local` (gitignored — never commit)

```bash
# ─── Astro ───
ASTRO_SITE_URL=http://localhost:4321
PUBLIC_API_URL=http://localhost:1337/api
PUBLIC_SEARCH_URL=http://localhost:7700
PUBLIC_IMGPROXY_URL=http://localhost:8080

# ─── Analytics (local development) ───
PUBLIC_PLAUSIBLE_DOMAIN=localhost
PUBLIC_PLAUSIBLE_SCRIPT_URL=

# ─── Sentry (optional in dev) ───
PUBLIC_SENTRY_DSN=

# ─── Cloudflare Turnstile (use test keys in dev) ───
PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
```

### 6.2 Backend Environment File

**File:** `backend/.env` (gitignored — never commit)

```bash
# ─── Strapi ───
HOST=0.0.0.0
PORT=1337
APP_KEYS=dev_key_1,dev_key_2,dev_key_3,dev_key_4
API_TOKEN_SALT=dev_api_token_salt
ADMIN_JWT_SECRET=dev_admin_jwt_secret
TRANSFER_TOKEN_SALT=dev_transfer_token_salt
JWT_SECRET=dev_jwt_secret

# ─── Database ───
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=twinmos_dev
DATABASE_USERNAME=twinmos
DATABASE_PASSWORD=twinmos_dev_password
DATABASE_SSL=false

# ─── MeiliSearch ───
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_API_KEY=dev_meili_master_key_change_in_prod

# ─── Email (Resend) ───
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ─── Upload (Backblaze B2 — use local storage in dev) ───
UPLOAD_PROVIDER=local

# ─── ImgProxy ───
IMGPROXY_KEY=dev_key_change_in_prod
IMGPROXY_SALT=dev_salt_change_in_prod

# ─── Redis (Phase 2+) ───
REDIS_URL=redis://localhost:6379
```

### 6.3 Environment Variable Validation

Both repos include Zod schemas that validate required environment variables at startup. Missing or invalid values throw descriptive errors.

---

## 7. Running the Stack Locally

### 7.1 Start the Backend (Strapi v5)

```bash
cd ~/workspace/twinmos/backend

# Install dependencies (first time or after package.json changes)
pnpm install

# Start Strapi in development mode
pnpm develop

# Strapi admin UI available at: http://localhost:1337/admin
# Default admin credentials (first run): Create via Strapi CLI
```

### 7.2 Start the Frontend (Astro 5)

```bash
cd ~/workspace/twinmos/frontend

# Install dependencies (first time or after package.json changes)
pnpm install

# Start Astro dev server with HMR
pnpm dev

# Astro dev server available at: http://localhost:4321
```

### 7.3 Start Both (Terminal Multiplexer)

Using `tmux` or terminal tabs:

```bash
# Terminal 1 — Backend
cd ~/workspace/twinmos/backend && pnpm develop

# Terminal 2 — Frontend
cd ~/workspace/twinmos/frontend && pnpm dev

# Terminal 3 — Docker services
cd ~/workspace/twinmos/backend && docker compose -f docker-compose.dev.yml logs -f
```

### 7.4 Local Development URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| Astro Frontend | http://localhost:4321 | N/A |
| Strapi Admin | http://localhost:1337/admin | Create on first run |
| Strapi API | http://localhost:1337/api | Public (read-only) |
| PostgreSQL | localhost:5432 | twinmos / twinmos_dev_password |
| MeiliSearch | http://localhost:7700 | dev_meili_master_key_change_in_prod |
| ImgProxy | http://localhost:8080 | N/A |
| Redis | localhost:6379 | N/A (Phase 2+) |
| Plausible | http://localhost:8000 | N/A (optional) |

---

## 8. Verification Checklist

After completing setup, verify each component:

| # | Check | Command / URL | Expected Result |
|---|-------|---------------|-----------------|
| 1 | Docker running | `docker ps` | Containers listed |
| 2 | Postgres healthy | `docker compose -f docker-compose.dev.yml ps` | Status: `healthy` |
| 3 | MeiliSearch healthy | `curl http://localhost:7700/health` | `{"status":"available"}` |
| 4 | ImgProxy healthy | `curl -I http://localhost:8080/health` | HTTP 200 |
| 5 | Backend starts | `pnpm develop` in backend | Strapi admin loads at :1337 |
| 6 | Frontend starts | `pnpm dev` in frontend | Astro loads at :4321 |
| 7 | Frontend fetches API | Visit http://localhost:4321 | Content renders from Strapi |
| 8 | Search works | Visit http://localhost:7700 | MeiliSearch dashboard loads |
| 9 | Git configured | `git config --list` | User name and email set |
| 10 | Pre-commit hooks | `git commit --allow-empty -m "test"` | Husky + lint-staged run |

---

## 9. Troubleshooting

### 9.1 Common Issues

| Issue | Cause | Resolution |
|-------|-------|------------|
| `EACCES: permission denied` on Docker | Docker daemon not running | Start Docker Desktop or `sudo systemctl start docker` |
| Port 5432 already in use | Another Postgres running | Stop local Postgres: `sudo service postgresql stop` |
| Port 1337 already in use | Strapi already running | `kill $(lsof -t -i:1337)` or use different port |
| `MODULE_NOT_FOUND` | Dependencies not installed | Run `pnpm install` in affected repo |
| MeiliSearch unhealthy | Data corruption | `docker compose down -v` and restart (loses data) |
| Strapi admin blank | Build not complete | Wait for `Building admin UI` to finish |
| Astro build fails | TypeScript errors | Run `pnpm typecheck` to identify issues |

### 9.2 Reset Local Environment

```bash
# Nuclear reset — deletes all local data
cd ~/workspace/twinmos/backend
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up -d

# Reinstall dependencies
cd ~/workspace/twinmos/frontend && rm -rf node_modules && pnpm install
cd ~/workspace/twinmos/backend && rm -rf node_modules && pnpm install

# Rebuild Strapi admin
pnpm build
```

---

## 10. Onboarding New Developers

### 10.1 Day-1 Checklist

1. [ ] Receive GitHub organization invite for `TwinMOS` org
2. [ ] Install prerequisites (§1.2)
3. [ ] Clone both repositories (§3.1)
4. [ ] Configure Git identity (§2.2)
5. [ ] Install VSCode extensions (§5.1)
6. [ ] Start Docker Compose stack (§4.2)
7. [ ] Create `.env.local` and `.env` files (§6)
8. [ ] Start backend and verify Strapi admin loads
9. [ ] Start frontend and verify Astro loads
10. [ ] Run verification checklist (§8)
11. [ ] Attend pair-programming session with Team Lead

### 10.2 Expected Time to Productive

| Task | Estimated Time |
|------|----------------|
| Prerequisites installation | 30–60 minutes |
| Repository clone + setup | 15–20 minutes |
| Docker Compose first start | 10–15 minutes (image downloads) |
| IDE configuration | 10–15 minutes |
| Environment files + verification | 15–20 minutes |
| **Total to first local build** | **~90–150 minutes** |

---

## Document Governance

| Role | Name | Sign-Off | Date |
|------|------|----------|------|
| IT/Technical Lead | (TBC) | _______________ | _________ |
| Unisoft Team Lead | (TBC) | _______________ | _________ |
| Unisoft Senior Developer | (TBC) | _______________ | _________ |

---

**Document Version:** 1.0
**Issued:** 2 May 2026
**Next Review:** Upon Sprint 0 close (Week 2) and at each phase boundary
**Canonical Location:** `H.1 - Local and Environment Setup/TwinMOSWebsiteLocalDevSetup_Guide.md`
