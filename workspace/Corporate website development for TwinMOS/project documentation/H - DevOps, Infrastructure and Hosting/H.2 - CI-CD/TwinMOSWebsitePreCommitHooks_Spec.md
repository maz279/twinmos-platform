# TwinMOS Website — Pre-Commit Hooks Specification

| | |
|:---|:---|
| **Reference** | H.2-003 |
| **Priority** | P0 |
| **Status** | [P] Planned |
| **Author** | DevOps Lead |
| **Version** | 1.0 |
| **Date** | 2026-05-01 |
| **Review Cycle** | Quarterly |

---

## 1. Purpose

This document defines the pre-commit hook toolchain for the TwinMOS website monorepo. The goal is to catch code quality issues, security leaks, and formatting problems before they enter the commit history — reducing CI cycle time and maintaining a clean Git history for the 2-developer team.

---

## 2. Tool Stack

| Tool | Version | Purpose | Phase |
|:---|:---|:---|:---|
| **Husky** | 9.x | Git hook manager | P1 |
| **lint-staged** | 15.x | Run linters only on staged files | P1 |
| **Commitlint** | 19.x | Enforce Conventional Commits format | P1 |
| **@commitlint/config-conventional** | 19.x | Angular-style commit convention | P1 |
| **prettier** | 3.x | Code formatting | P1 |
| **ESLint** | 9.x | JavaScript/TypeScript linting | P1 |
| **secretlint** | 8.x | Prevent secret leakage in commits | P1 |
| **@secretlint/secretlint-rule-preset-recommend** | 8.x | Recommended secret detection rules | P1 |

---

## 3. Architecture

```
Git commit
    |
    v
+-----------+
|   Husky   |  <-- .husky/pre-commit
+-----------+
    |
    v
+---------------+
|  lint-staged  |  <-- .lintstagedrc.json
+---------------+
    |
    +---> ESLint (staged .js/.ts/.astro)
    +---> Prettier (staged all code files)
    +---> secretlint (staged all files)
    |
    v
+---------------+
|  Commitlint   |  <-- .husky/commit-msg
+---------------+
    |
    v
  Commit created
```

---

## 4. Installation & Setup

### 4.1 Package Installation

```bash
# Core toolchain
pnpm add -D husky lint-staged @commitlint/cli @commitlint/config-conventional

# Secret scanning
pnpm add -D secretlint @secretlint/secretlint-rule-preset-recommend

# Ensure ESLint and Prettier are already in workspace root
```

### 4.2 Husky Initialization

```bash
# Initialize Husky (run once after install)
npx husky init

# Create hook files
echo 'npx lint-staged' > .husky/pre-commit
echo 'npx --no -- commitlint --edit ${1}' > .husky/commit-msg
```

### 4.3 Enable Hooks

```bash
# Ensure hooks are executable
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg

# Verify hook installation
git config core.hooksPath .husky
```

---

## 5. Configuration Files

### 5.1 `.lintstagedrc.json` (Root)

```json
{
  "*.{js,ts,jsx,tsx,mjs,cjs}": [
    "eslint --fix --max-warnings=0",
    "prettier --write"
  ],
  "*.{astro}": [
    "eslint --fix --max-warnings=0",
    "prettier --write"
  ],
  "*.{json,md,mdx,yml,yaml,css,scss}": [
    "prettier --write"
  ],
  "*": [
    "secretlint"
  ]
}
```

### 5.2 `commitlint.config.js` (Root)

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'build',
        'chore',
        'ci',
        'docs',
        'feat',
        'fix',
        'perf',
        'refactor',
        'revert',
        'style',
        'test',
        'i18n',
        'security'
      ]
    ],
    'scope-enum': [
      2,
      'always',
      [
        'frontend',
        'backend',
        'api',
        'cms',
        'db',
        'search',
        'auth',
        'i18n',
        'infra',
        'ci',
        'deps',
        'config',
        'docs',
        'test',
        'security'
      ]
    ],
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 72],
    'body-max-line-length': [2, 'always', 100],
    'footer-max-line-length': [2, 'always', 100]
  }
};
```

### 5.3 `.secretlintrc.json` (Root)

```json
{
  "rules": [
    {
      "id": "@secretlint/secretlint-rule-preset-recommend",
      "rules": [
        {
          "id": "@secretlint/secretlint-rule-aws",
          "options": { "allows": [] }
        },
        {
          "id": "@secretlint/secretlint-rule-gcp",
          "options": { "allows": [] }
        },
        {
          "id": "@secretlint/secretlint-rule-privatekey",
          "options": { "allows": [] }
        },
        {
          "id": "@secretlint/secretlint-rule-slack",
          "options": { "allows": [] }
        },
        {
          "id": "@secretlint/secretlint-rule-basicauth",
          "options": { "allows": [] }
        },
        {
          "id": "@secretlint/secretlint-rule-sendgrid",
          "options": { "allows": [] }
        }
      ]
    }
  ]
}
```

### 5.4 `.prettierignore` (Root)

```
# Build outputs
dist/
build/
.out/

# Dependencies
node_modules/

# Lock files (managed by pnpm)
pnpm-lock.yaml

# Generated files
*.generated.ts
src/graphql/generated/

# Coverage
coverage/

# Docker volumes
postgres_data/
meilisearch_data/
```

---

## 6. Commit Message Convention

### 6.1 Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 6.2 Type Definitions

| Type | Description | Example |
|:---|:---|:---|
| `feat` | New feature | `feat(frontend): add Arabic RTL layout support` |
| `fix` | Bug fix | `fix(backend): resolve GraphQL N+1 query` |
| `docs` | Documentation only | `docs(readme): update deployment instructions` |
| `style` | Formatting, no code change | `style(frontend): fix indentation in Header.astro` |
| `refactor` | Code restructuring | `refactor(api): extract product service layer` |
| `perf` | Performance improvement | `perf(search): add MeiliSearch index caching` |
| `test` | Adding or updating tests | `test(backend): add auth middleware unit tests` |
| `build` | Build system changes | `build(ci): optimize Docker layer caching` |
| `ci` | CI/CD changes | `ci(github): add Lighthouse CI workflow` |
| `chore` | Maintenance tasks | `chore(deps): upgrade Astro to 5.2` |
| `revert` | Revert previous commit | `revert(feat): remove experimental image CDN` |
| `i18n` | Localization changes | `i18n(cms): add Hindi locale strings` |
| `security` | Security-related fix | `security(auth): rotate JWT signing keys` |

### 6.3 Scope Definitions

| Scope | Applies To |
|:---|:---|
| `frontend` | Astro components, pages, layouts, client scripts |
| `backend` | Strapi controllers, services, middleware, plugins |
| `api` | GraphQL schemas, REST controllers, DTOs |
| `cms` | Strapi admin customizations, content types |
| `db` | Database migrations, schemas, seeds |
| `search` | MeiliSearch configuration, index definitions |
| `auth` | Authentication, authorization, session management |
| `i18n` | Localization, translation files, RTL handling |
| `infra` | Docker, hosting, networking, Terraform |
| `ci` | GitHub Actions, workflows, deployment scripts |
| `deps` | Dependency updates, lock file changes |
| `config` | ESLint, Prettier, TS config, environment files |
| `docs` | Markdown documentation, ADRs, specifications |
| `test` | Test utilities, fixtures, mock data |
| `security` | Security configs, scans, hardening |

### 6.4 Examples

```
feat(frontend): implement product comparison widget

Add side-by-side product comparison with spec tables.
Supports up to 4 products with shareable comparison URLs.

Closes #142
```

```
fix(backend): correct i18n slug generation for Arabic content

Arabic slugs were being double-encoded causing 404s.
Updated slugify to use locale-aware transliteration.

Fixes #189
```

```
security(auth): enforce rate limiting on password reset

Add 5-attempt-per-hour limit on /auth/forgot-password.
Uses existing Redis connection for distributed rate store.

Refs: SEC-2026-004
```

---

## 7. Hook Execution Flow

### 7.1 `pre-commit` Hook

```bash
#!/bin/sh
# .husky/pre-commit

# 1. lint-staged executes on all staged files
npx lint-staged

# Exit code propagation:
# - 0: all checks passed, commit proceeds
# - non-zero: at least one check failed, commit aborted
```

**Execution order per file type:**

1. **JavaScript/TypeScript files**: ESLint --fix -> Prettier --write -> secretlint
2. **Astro files**: ESLint --fix -> Prettier --write -> secretlint
3. **Config/markdown files**: Prettier --write -> secretlint
4. **All other files**: secretlint only

### 7.2 `commit-msg` Hook

```bash
#!/bin/sh
# .husky/commit-msg

# Validate commit message against Conventional Commits
npx --no -- commitlint --edit ${1}
```

**Validation rules:**
- Type must be from allowed enum
- Scope must be from allowed enum (optional but recommended)
- Subject must be lowercase, no trailing period, max 72 chars
- Body lines max 100 chars
- Footer lines max 100 chars

---

## 8. Bypassing Hooks (Emergency)

| Command | Use Case | Audit Trail |
|:---|:---|:---|
| `git commit --no-verify` | Critical hotfix, hooks failing due to known issue | Commit message should reference incident |
| `git commit --no-verify -m "hotfix: ..."` | Production emergency | Must be followed by post-incident review |
| `HUSKY=0 git commit` | Temporary disable for bulk operation | Avoid in normal workflow |

**Policy**: Bypassing hooks requires:
1. Immediate Slack notification to Tech Lead
2. Post-incident commit to fix underlying hook issue
3. Documentation in incident log

---

## 9. Performance Optimization

| Strategy | Implementation | Impact |
|:---|:---|:---|
| Staged-files only | lint-staged filters to git staged files | ~80% faster than full-project lint |
| ESLint cache | `--cache` flag in lint-staged config | Incremental linting, ~60% faster |
| Prettier cache | `--cache` flag (Prettier 3.x) | Incremental formatting |
| Parallel execution | lint-staged runs file-type groups in parallel | Max 3 concurrent processes |
| Skip on CI | `HUSKY=0` in GitHub Actions | No double-linting in CI |

**ESLint cache config** (`.eslintrc.cjs`):

```javascript
module.exports = {
  // ... other config
  cache: true,
  cacheLocation: '.eslintcache'
};
```

---

## 10. Troubleshooting

| Symptom | Cause | Fix |
|:---|:---|:---|
| `husky - command not found` | Hooks not initialized | Run `npx husky init` |
| `lint-staged` hangs | Large number of staged files | Commit in smaller batches |
| Secretlint false positive | Test fixture contains fake key | Add to `.secretlintignore` or use `secretlint-disable` comment |
| Commitlint rejects valid message | Custom type not in enum | Update `commitlint.config.js` type-enum |
| Prettier reformats entire file | File not previously formatted | Run `pnpm format` once to baseline |
| ESLint fix introduces errors | Conflicting rules | Check ESLint/Prettier integration config |

---

## 11. CI Integration

GitHub Actions runs the same checks as pre-commit hooks but on the full codebase:

```yaml
# In ci-frontend.yml and ci-backend.yml
- name: Lint
  run: pnpm lint

- name: Format check
  run: pnpm format:check

- name: Secret scan
  run: pnpm secretlint "**/*"
```

**Package.json scripts:**

```json
{
  "scripts": {
    "lint": "eslint . --ext .js,.ts,.jsx,.tsx,.astro",
    "lint:fix": "eslint . --ext .js,.ts,.jsx,.tsx,.astro --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "secretlint": "secretlint \"**/*\"",
    "prepare": "husky"
  }
}
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
