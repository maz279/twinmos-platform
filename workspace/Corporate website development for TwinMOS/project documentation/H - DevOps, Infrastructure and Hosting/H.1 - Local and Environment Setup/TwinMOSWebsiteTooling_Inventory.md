# TwinMOS Website — Tooling Inventory

**Document ID:** H.1-006  
**Version:** 1.0  
**Status:** Active  
**Owner:** Tech Lead  
**Last Updated:** 2026-05-01  
**Related:** TwinMOSWebsiteLocalDevSetup_Guide.md · TwinMOSWebsiteTechnology_Stack.md (Appendix A)

---

## 1. Overview

This document is the authoritative inventory of every tool used in the TwinMOS website project. It covers runtime environments, frameworks, databases, testing tools, CI/CD components, security scanners, infrastructure providers, monitoring tools, and developer utilities. Each entry includes the pinned version, purpose, license, and where configuration lives.

**Team size:** 2 developers (Tech Lead + Developer B) + Unisoft agency oversight  
**Project duration:** 15 months (Phase 1–3)  
**Primary runtime:** Node.js 22 LTS + pnpm 9.x

---

## 2. Runtime & Package Management

| Tool | Version | Purpose | License | Config File | Notes |
|------|---------|---------|---------|-------------|-------|
| Node.js | 22 LTS | JavaScript runtime for all services | MIT | `.nvmrc` or `engines` in `package.json` | Required by Strapi v5 |
| pnpm | 9.x | Fast, deterministic package manager | MIT | `pnpm-workspace.yaml`, `.npmrc` | Monorepo-friendly; replaces npm/yarn |
| nvm | Latest | Node version manager (local dev) | MIT | `~/.nvm` | Allows switching Node versions easily |

### Installation Commands
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Install and use Node 22 LTS
nvm install 22
nvm use 22
nvm alias default 22

# Install pnpm globally
npm install -g pnpm@9
```

---

## 3. Frontend Framework & Libraries

### 3.1 Core Framework

| Tool | Version | Purpose | License | Config File |
|------|---------|---------|---------|-------------|
| Astro | 5.6.x | Static-first web framework | MIT | `astro.config.mjs` |
| @astrojs/cloudflare | 11.0.x | Cloudflare Pages adapter | MIT | `astro.config.mjs` |
| @astrojs/react | 4.0.x | React island integration | MIT | `astro.config.mjs` |
| @astrojs/sitemap | 3.2.x | XML sitemap generation | MIT | `astro.config.mjs` |
| @astrojs/mdx | 3.1.x | MDX content support | MIT | `astro.config.mjs` |
| @astrojs/partytown | 2.1.x | Third-party script isolation | MIT | `astro.config.mjs` |

### 3.2 UI & Styling

| Tool | Version | Purpose | License | Config File |
|------|---------|---------|---------|-------------|
| React | 19.0.x | UI component library (Astro islands) | MIT | — |
| Tailwind CSS | 4.0.x | Utility-first CSS framework | MIT | `tailwind.config.mjs` |
| @tailwindcss/forms | 0.5.x | Form element styling | MIT | `tailwind.config.mjs` |
| @tailwindcss/typography | 0.5.x | Prose content styling | MIT | `tailwind.config.mjs` |
| framer-motion | 11.x | Animation library | MIT | Per-component |
| astro-icon | 1.1.x | SVG icon system | MIT | `astro.config.mjs` |

### 3.3 State & Data Fetching

| Tool | Version | Purpose | License | Config File |
|------|---------|---------|---------|-------------|
| nanostores | 0.10.x | Lightweight global state | MIT | `src/stores/` |
| @tanstack/react-query | 5.x | Server state management | MIT | `src/lib/query.ts` |
| zod | 3.x | Runtime schema validation | MIT | `src/schemas/` |
| react-hook-form | 7.x | Form state management | MIT | Per-component |

### 3.4 Maps & Utilities

| Tool | Version | Purpose | License | Config File |
|------|---------|---------|---------|-------------|
| leaflet | 1.9.x | Interactive maps (Where-to-Buy) | BSD-2 | Per-component |
| react-leaflet | 4.x | Leaflet React bindings | BSD-2 | Per-component |
| dayjs | 1.11.x | Date formatting utility | MIT | — |

---

## 4. Backend Framework & Services

### 4.1 CMS & API

| Tool | Version | Purpose | License | Config File |
|------|---------|---------|---------|-------------|
| Strapi | 5.31.x | Headless CMS + REST/GraphQL API | MIT/EE | `config/` directory |
| @strapi/plugin-users-permissions | 5.31.x | JWT auth + RBAC | MIT | Strapi admin panel |
| @strapi/plugin-i18n | 5.31.x | Multi-language content | MIT | Strapi admin panel |
| @strapi/plugin-graphql | 5.31.x | GraphQL endpoint | MIT | `config/plugins.ts` |
| @strapi/plugin-seo | 5.x | SEO field management | MIT | `config/plugins.ts` |
| strapi-plugin-config-sync | 3.x | Config/permissions sync across envs | MIT | `config/plugins.ts` |
| strapi-plugin-meilisearch | 0.13.x | Auto-sync collections to search index | MIT | `config/plugins.ts` |
| strapi-plugin-publisher | 2.x | Scheduled content publishing | MIT | `config/plugins.ts` |
| strapi-plugin-import-export-entries | 1.x | Bulk CSV import/export | MIT | `config/plugins.ts` |
| strapi-plugin-redirect | 1.x | 301/302 redirect management | MIT | `config/plugins.ts` |
| strapi-plugin-sitemap | 3.x | Dynamic XML sitemap | MIT | `config/plugins.ts` |
| strapi-plugin-protected-populate | 2.x | Field-level API access control | MIT | `config/plugins.ts` |

### 4.2 Database & Cache

| Tool | Version | Purpose | License | Config File |
|------|---------|---------|---------|-------------|
| PostgreSQL | 16 | Primary relational database | PostgreSQL | Coolify managed; `config/database.ts` |
| pg | 8.x | Node.js PostgreSQL client | MIT | Strapi config |
| Redis | 7-alpine | Session cache + API response cache (P2) | BSD-3 | Coolify managed |
| ioredis | 5.x | Redis Node.js client | MIT | `config/redis.ts` (P2) |

### 4.3 Search

| Tool | Version | Purpose | License | Config File |
|------|---------|---------|---------|-------------|
| MeiliSearch | 1.13.x | Full-text search engine | MIT (self-hosted) | Coolify managed; `config/plugins.ts` |
| meilisearch (client) | 0.45.x | MeiliSearch Node.js SDK | MIT | `src/lib/search.ts` |

### 4.4 Image Processing

| Tool | Version | Purpose | License | Config File |
|------|---------|---------|---------|-------------|
| ImgProxy | 3.x | On-the-fly image resizing (runtime) | MIT | Coolify managed |
| Sharp | Built into Astro | Build-time image optimization | Apache-2.0 | Astro built-in |

### 4.5 Authentication (Phase 2+)

| Tool | Version | Purpose | License | Config File |
|------|---------|---------|---------|-------------|
| better-auth | 1.x | Partner portal authentication | MIT | `config/auth.ts` |

### 4.6 Email

| Tool | Version | Purpose | License | Config File |
|------|---------|---------|---------|-------------|
| Resend | API (no SDK version lock) | Transactional email delivery | MIT SDK | `config/email.ts` |
| @strapi/provider-email-resend | 1.x | Strapi email provider | MIT | `config/plugins.ts` |

---

## 5. Testing Tools

### 5.1 Unit & Integration

| Tool | Version | Purpose | License | Config File |
|------|---------|---------|---------|-------------|
| Vitest | 2.x | Unit + integration test runner | MIT | `vitest.config.ts` |
| @testing-library/react | 16.x | React component testing | MIT | `vitest.setup.ts` |
| Supertest | 6.x | HTTP API integration testing | MIT | Strapi test utils |

### 5.2 End-to-End & Accessibility

| Tool | Version | Purpose | License | Config File |
|------|---------|---------|---------|-------------|
| Playwright | 1.49.x | Browser E2E testing | Apache-2.0 | `playwright.config.ts` |
| @axe-core/playwright | 4.10.x | Automated accessibility testing | MPL-2.0 | `playwright.config.ts` |
| axe-core | 4.x | Accessibility rules engine | MPL-2.0 | Bundled with above |

### 5.3 Performance

| Tool | Version | Purpose | License | Config File |
|------|---------|---------|---------|-------------|
| lighthouse-ci | 12.x | Lighthouse score CI integration | Apache-2.0 | `.lighthouserc.json` |
| rollup-plugin-visualizer | 5.x | Bundle size analysis | MIT | `astro.config.mjs` (dev only) |

### 5.4 Load Testing

| Tool | Version | Purpose | License | Config File |
|------|---------|---------|---------|-------------|
| k6 | Latest | Load + stress testing | AGPL-3.0 | `k6/` directory |

### 5.5 API Testing

| Tool | Version | Purpose | License | Config File |
|------|---------|---------|---------|-------------|
| Bruno | Latest | REST API collection testing | MIT | `bruno/` directory |
| Newman | 6.x | Bruno/Postman CI runner | Apache-2.0 | `.github/workflows/` |

### 5.6 Cross-Browser Testing

| Tool | Version | Purpose | License | Config File |
|------|---------|---------|---------|-------------|
| BrowserStack | SaaS | Cross-browser + real device testing | Commercial | GitHub Actions secret |

---

## 6. CI/CD & Code Quality

### 6.1 Pre-commit Hooks

| Tool | Version | Purpose | License | Config File |
|------|---------|---------|---------|-------------|
| Husky | 9.x | Git hooks manager | MIT | `.husky/` directory |
| lint-staged | 15.x | Run linters on staged files only | MIT | `.lintstagedrc.json` |
| commitlint | 19.x | Conventional commit enforcement | MIT | `commitlint.config.js` |
| secretlint | Latest | Secret pattern detection in commits | MIT | `.secretlintrc.json` |

### 6.2 Linting & Formatting

| Tool | Version | Purpose | License | Config File |
|------|---------|---------|---------|-------------|
| ESLint | 9.x | JavaScript/TypeScript linting | MIT | `eslint.config.mjs` |
| Prettier | 3.x | Code formatting | MIT | `.prettierrc` |
| Stylelint | 16.x | CSS/Tailwind linting | MIT | `.stylelintrc.json` |
| TypeScript | 5.x | Static type checking | Apache-2.0 | `tsconfig.json` |

### 6.3 CI/CD Platform

| Tool | Version | Purpose | License | Config File |
|------|---------|---------|---------|-------------|
| GitHub Actions | SaaS | CI/CD pipeline execution | GitHub TOS | `.github/workflows/` |
| Wrangler CLI | 3.x | Cloudflare Pages deployment | MIT | `wrangler.toml` |

### 6.4 Changelog & Release

| Tool | Version | Purpose | License | Config File |
|------|---------|---------|---------|-------------|
| conventional-changelog-cli | 5.x | Auto-generate CHANGELOG.md | MIT | `package.json scripts` |
| @changesets/cli | 2.x | Version management (optional) | MIT | `.changeset/` |

---

## 7. Security Scanning

| Tool | Version | Purpose | License | Config File |
|------|---------|---------|---------|-------------|
| Snyk | SaaS | Dependency vulnerability scanning | Commercial (free tier) | `.snyk` |
| Dependabot | GitHub native | Automated dependency updates | GitHub TOS | `.github/dependabot.yml` |
| Trivy | Latest | Docker image vulnerability scan | Apache-2.0 | `.github/workflows/security.yml` |
| OWASP ZAP | 2.14.x | Dynamic application security testing | Apache-2.0 | `.github/workflows/security.yml` |
| GitGuardian | SaaS | Secret detection in git history | Commercial (free tier) | GitHub integration |

---

## 8. Infrastructure & Hosting

| Tool/Service | Version/Tier | Purpose | Cost | Config Location |
|------|---------|---------|------|----------------|
| Hetzner Cloud | CX32 (P1–P2) / CX42 (P3) | VPS hosting for backend services | €13.10–€25.20/mo | Hetzner Cloud Console |
| Coolify | v4.x (beta, production-grade) | Self-hosted PaaS (Docker orchestration) | Free (open-source) | Coolify dashboard |
| Cloudflare Pages | Pro ($20/mo) | Frontend CDN + edge deployment | $20/mo | Cloudflare dashboard |
| Cloudflare DNS | Included in Pro | DNS management | Included | Cloudflare dashboard |
| Cloudflare WAF | Included in Pro | Web Application Firewall | Included | Cloudflare dashboard |
| Backblaze B2 | Pay-as-you-go | Object storage (media + backups) | ~$0.005/GB | B2 console |
| Docker | 26.x | Container runtime on Hetzner | Free | Coolify managed |
| Traefik | 3.x | Reverse proxy (managed by Coolify) | Free | Coolify managed |

---

## 9. Monitoring & Observability

| Tool | Version/Tier | Purpose | Cost | Config File |
|------|---------|---------|------|-------------|
| Sentry | 9.x (Team plan P2) | Error monitoring + RUM + performance | Free / $26/mo | `sentry.client.config.ts`, `sentry.server.config.ts` |
| UptimeRobot | Pro | Uptime monitoring (5-min intervals) | ~$7/mo | UptimeRobot dashboard |
| Plausible Analytics | 2.1.x self-hosted | Privacy-first web analytics | Hosting cost only | Coolify managed |
| Lighthouse CI | 12.x | Performance budget enforcement in CI | Free | `.lighthouserc.json` |
| Cloudflare Analytics | Included in Pro | CDN + WAF analytics | Included | Cloudflare dashboard |
| Coolify built-in | v4 | Container resource monitoring | Free | Coolify dashboard |

---

## 10. Phase 2+ Tools (Not Active in P1)

| Tool | Version | Purpose | Phase | Notes |
|------|---------|---------|-------|-------|
| Chatwoot | 3.x | Live chat + support ticketing | P2 | Self-hosted via Coolify |
| PostHog | OSS 1.x | Session replay + A/B testing + funnels | P3 | Separate Hetzner instance |
| Medusa | 2.x | Headless e-commerce engine | P3 | Additional Strapi modules |
| Stripe | API (latest) | Payment processing | P3 | PCI-DSS compliant |
| Google Tag Manager | SaaS | Marketing pixel management | P1 | Consent-gated via CMP |
| Google Analytics 4 | SaaS | Marketing analytics (consent-gated) | P1 | Via GTM |
| HubSpot | SaaS | CRM lead routing | P1 | Strapi webhook integration |

---

## 11. Developer Tools (Local)

### 11.1 Recommended IDE

**Visual Studio Code** (primary) — [download](https://code.visualstudio.com/)

### 11.2 Required VS Code Extensions

| Extension | Extension ID | Purpose |
|-----------|-------------|---------|
| Astro | astro-build.astro-vscode | Astro syntax + IntelliSense |
| Tailwind CSS IntelliSense | bradlc.vscode-tailwindcss | Tailwind class autocomplete |
| ESLint | dbaeumer.vscode-eslint | Inline lint errors |
| Prettier | esbenp.prettier-vscode | Auto-format on save |
| Docker | ms-azuretools.vscode-docker | Container management UI |
| GitLens | eamodio.gitlens | Enhanced Git history |
| Thunder Client | rangav.vscode-thunder-client | REST API testing (lightweight) |
| Error Lens | usernamehako.vscode-error-lens | Inline error highlighting |
| i18n Ally | lokalise.i18n-ally | Multi-language string management |
| Spell Checker | streetsidesoftware.code-spell-checker | Content typo detection |

### 11.3 Recommended VS Code Settings (`.vscode/settings.json`)

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.includeLanguages": {
    "astro": "html"
  },
  "files.associations": {
    "*.astro": "astro"
  },
  "emmet.includeLanguages": {
    "astro": "html"
  }
}
```

### 11.4 Other Developer Utilities

| Tool | Purpose | Install |
|------|---------|---------|
| Docker Desktop | Local container runtime | [docker.com](https://docker.com) |
| Git 2.40+ | Version control | OS package manager |
| Bruno | API collection testing | [usebruno.com](https://usebruno.com) |
| Bitwarden Desktop | Password / secret manager | [bitwarden.com](https://bitwarden.com) |
| TablePlus | Database GUI | [tableplus.com](https://tableplus.com) |

---

## 12. Version Lock & Update Policy

### 12.1 Version pinning strategy

| Category | Pinning | Rationale |
|----------|---------|-----------|
| Strapi | Exact minor (`5.31.x`) | Breaking changes between minors possible |
| Astro | Caret (`^5.6.0`) | Stable within major |
| PostgreSQL | Major-pinned (`postgres:16`) | Schema-sensitive; migrate deliberately |
| MeiliSearch | Exact minor (`v1.13`) | Index format may change between minors |
| Redis | Major (`redis:7-alpine`) | Stable within major |
| Node.js | LTS major (`22`) | LTS security support |
| Testing tools | Caret | Update freely with test coverage |

### 12.2 Update cadence

| Type | Frequency | Process |
|------|-----------|---------|
| Security patches | Immediately on Snyk/Dependabot alert | PR review + merge within 48h |
| Minor updates (non-breaking) | Monthly | Dependabot auto-PR; Tech Lead reviews |
| Major updates | Per-phase boundary | Full regression test; documented ADR |
| OS/Docker base image | Monthly via Coolify | Coolify auto-pull latest minor patch |

---

## Appendix A — Tool Compatibility Matrix

All tools verified working together on:
- **OS:** Ubuntu 24.04 LTS (production) / macOS 14+ (development) / Windows 11 + WSL2 (development)
- **CPU:** x86_64 + ARM64 (Apple Silicon — Docker multi-arch images used)
- **Node.js:** 22 LTS
- **Docker Engine:** 26.x
- **pnpm:** 9.x

---

## Appendix B — Licence Summary

All tools used are either:
- **Open-source (MIT/Apache/BSD):** Free to use commercially without restriction
- **Commercial SaaS (Cloudflare, UptimeRobot, Sentry, BrowserStack):** Covered by project budget
- **Self-hosted open-source (Plausible, Chatwoot, MeiliSearch, Coolify):** Zero licensing cost; hosting cost only

No tools with GPL or AGPL licences are embedded in the final website build (k6 is a dev-only load test tool, not shipped to production).

---

*Document maintained by Tech Lead. Update whenever a new tool is added or a version is bumped.*  
*Last full review: 2026-05-01*
