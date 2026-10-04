# TwinMOS Website — Day 1 Setup Checklist

**Document Reference:** TWN-DEV-ONB-2026-002
**Version:** 1.0
**Status:** FINAL
**Date:** 1 May 2026
**Owner:** Unisoft Team Lead

---

## Pre-Day 1 (Before You Start)

### Accounts & Access

- [ ] GitHub account created / confirmed (TwinMOS organization invite accepted)
- [ ] Slack/Teams workspace joined
- [ ] Figma view access granted
- [ ] Sentry project access granted
- [ ] 1Password/Doppler vault access for secrets
- [ ] Calendar invites accepted (standups, sprint planning, retrospectives)

### Hardware Check

- [ ] Development machine with 16 GB+ RAM
- [ ] Second monitor (recommended for pair-programming)
- [ ] Stable internet connection (video calls + large repo clones)

---

## Day 1 Morning (Environment Setup)

### 1.1 Install Core Tools

| Tool | Command / Source | Verify |
|------|------------------|--------|
| Node.js 22.x LTS | `nvm install 22` or [nodejs.org](https://nodejs.org) | `node --version` → v22.x.x |
| pnpm 9.x | `npm install -g pnpm@9` | `pnpm --version` → 9.x.x |
| Git 2.40+ | Usually pre-installed | `git --version` |
| Docker Desktop | [docker.com](https://docker.com) | `docker --version` |
| Docker Compose | Bundled with Docker Desktop | `docker compose version` |
| VSCode | [code.visualstudio.com](https://code.visualstudio.com) | Open, check updates |

### 1.2 Configure Git

```bash
git config --global user.name "Your Full Name"
git config --global user.email "your.email@unisoft.com"
git config --global init.defaultBranch main
git config --global core.editor "code --wait"
git config --global pull.rebase true
```

### 1.3 Configure pnpm

```bash
pnpm config set store-dir ~/.pnpm-store
pnpm config set strict-peer-dependencies true
```

### 1.4 Configure VSCode

- [ ] Install all required extensions (see Developer Onboarding Guide §2.4)
- [ ] Set VSCode as default editor for Git: `git config --global core.editor "code --wait"`
- [ ] Enable "Format on Save" in VSCode settings
- [ ] Set default formatter to Prettier for JS/TS/JSON/Markdown

---

## Day 1 Midday (Repository Setup)

### 2.1 Clone Frontend Repository

```bash
mkdir -p ~/projects/twinmos
cd ~/projects/twinmos
git clone git@github.com:TwinMOS/twinmos-website-frontend.git
cd twinmos-website-frontend
git checkout main
pnpm install
```

**Expected:** `pnpm install` completes without errors (~2–3 minutes).

### 2.2 Clone Backend Repository

```bash
cd ~/projects/twinmos
git clone git@github.com:TwinMOS/twinmos-website-backend.git
cd twinmos-website-backend
git checkout main
pnpm install
```

**Expected:** `pnpm install` completes without errors (~2–3 minutes).

### 2.3 Environment Configuration

**Frontend:**
```bash
cd ~/projects/twinmos/twinmos-website-frontend
cp .env.example .env
# Edit .env — request values from Team Lead or 1Password
```

**Backend:**
```bash
cd ~/projects/twinmos/twinmos-website-backend
cp .env.example .env
# Edit .env — generate secrets or request from Team Lead
```

**Generate backend secrets:**
```bash
openssl rand -base64 32  # JWT_SECRET
openssl rand -base64 32  # ADMIN_JWT_SECRET
openssl rand -base64 32  # API_TOKEN_SALT
openssl rand -base64 32  # TRANSFER_TOKEN_SALT
```

---

## Day 1 Afternoon (Local Stack Boot)

### 3.1 Start Backend Services

```bash
cd ~/projects/twinmos/twinmos-website-backend
docker-compose up -d
```

**Verify services are running:**
```bash
docker ps
# Expected: postgres:16, getmeili/meilisearch:1.13 containers running
```

### 3.2 Start Strapi Development Server

```bash
cd ~/projects/twinmos/twinmos-website-backend
pnpm develop
```

**Expected:**
- Strapi admin available at `http://localhost:1337/admin`
- First boot creates database tables (may take 1–2 minutes)
- Create your admin account when prompted

### 3.3 Start Astro Development Server

```bash
cd ~/projects/twinmos/twinmos-website-frontend
pnpm dev
```

**Expected:**
- Astro dev server at `http://localhost:4321`
- Homepage renders with content from local Strapi
- Hot Module Replacement (HMR) active

### 3.4 Verify End-to-End

| Check | URL | Expected Result |
|-------|-----|-----------------|
| Astro homepage | `http://localhost:4321` | Renders without errors |
| Strapi admin | `http://localhost:1337/admin` | Login page loads |
| Strapi API health | `http://localhost:1337/api/health` | Returns `{ "status": "ok" }` |
| MeiliSearch health | `http://localhost:7700/health` | Returns `{ "status": "available" }` |

---

## Day 1 End (First Commit)

### 4.1 Create a Test Branch

```bash
cd ~/projects/twinmos/twinmos-website-frontend
git checkout -b docs/onboarding-yourname
```

### 4.2 Make a Small Change

Add your name to the team roster in `README.md` or fix a typo in documentation.

### 4.3 Commit & Push

```bash
git add .
git commit -m "docs(readme): add [Your Name] to team roster"
git push -u origin docs/onboarding-yourname
```

### 4.4 Open a Pull Request

- [ ] Open PR on GitHub using the PR template
- [ ] Verify CI passes (lint, typecheck)
- [ ] Request review from the other developer
- [ ] Merge after approval

---

## Troubleshooting Common Issues

### Issue: `pnpm install` fails with peer dependency errors

**Fix:**
```bash
pnpm config set strict-peer-dependencies false
pnpm install
```

### Issue: Docker containers fail to start

**Fix:**
```bash
# Check Docker is running
docker info

# Check port conflicts
lsof -i :5432  # PostgreSQL
lsof -i :1337  # Strapi
lsof -i :7700  # MeiliSearch
lsof -i :4321  # Astro

# Reset if needed
docker-compose down -v
docker-compose up -d
```

### Issue: Strapi first-boot hangs

**Fix:**
```bash
# Delete node_modules and rebuild
rm -rf node_modules
pnpm install
pnpm develop
```

### Issue: Astro build fails with TypeScript errors

**Fix:**
```bash
# Check TypeScript version
pnpm tsc --version

# Run typecheck separately to see errors
pnpm typecheck
```

### Issue: GitHub SSH clone fails

**Fix:**
```bash
# Verify SSH key is added to GitHub
ssh -T git@github.com

# If not, generate and add:
ssh-keygen -t ed25519 -C "your.email@unisoft.com"
cat ~/.ssh/id_ed25519.pub  # Add this to GitHub → Settings → SSH Keys
```

---

## Sign-Off

I confirm that on Day 1 I have:

- [ ] Installed all required tools
- [ ] Cloned both repositories
- [ ] Configured environment variables
- [ ] Started local services successfully
- [ ] Verified all endpoints respond
- [ ] Made and merged my first PR

**Developer:** _________________________ **Date:** _______________

**Team Lead Verified:** _________________________ **Date:** _______________
