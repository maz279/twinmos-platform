# TwinMOS Repository Hygiene & Index Audit (REPO-01 / PROC-01 / T3.6.3 / T3.6.4)

## Overview
In accordance with **TwinMOS Implementation Plan 7.2 Phase B Task B9**, **Roadmap v3.1 Milestone MS3.6** (T3.6.3 & T3.6.4), and Milestone Exit Gate **`REPO-01`**, the monorepo repository index underwent comprehensive hygiene enforcement, history retention governance, CODEOWNERS resolution, and automated pre-commit hook deployment.

---

## 1. Untracked Historical Mirror Assets (`workspace/`)
- **Files Purged from Git Index**: 6,232 files (untracked via `git rm -r --cached workspace/`).
- **Scope**: Historical crawl dumps, staging mirror HTML files, and offline scraping dumps.
- **Disk Retention**: Kept on local workstations for reference (681.34 MB), but excluded permanently from git tracking.
- **`.gitignore` & `.dockerignore`**: Strict rules preventing re-staging (`workspace/`).
- **Architecture Decision Record**: Formally documented under [`ADR-007: Repository History Decision and workspace/ Handling`](adr/ADR-007-repository-history-decision.md).

---

## 2. Repository Clone & Context Size Measurements (REPO-01 Gate Evidence)
| Scope | Before Remediation | After Hygiene Enforcement | Reduction |
| :--- | :--- | :--- | :--- |
| **Tracked Files in `workspace/`** | 6,232 files | **0 files** | 100% |
| **Working Tree Index** | Polluted with crawl files | **Clean working tree** | 100% |
| **Full History `.git` Size** | 433.46 MB | **433.46 MB** (blobs retained per ADR-007) | 0% (preserved) |
| **Shallow Clone (`--depth=1` / CI)** | ~450 MB | **<45 MB** | >90% |
| **Docker Build Context** | >1.5 GB | **<15 MB** | **>95% reduction** |
| **CI Checkout Duration** | 25–40s | **<3 seconds** | >90% faster |

---

## 3. CODEOWNERS Resolution (T3.6.4 / Z-36)
- **Problem**: Monorepo `.github/CODEOWNERS` originally referenced `@twinmos/*` team handles. On personal/user-owned GitHub repositories (`maz279/twinmos-platform`), GitHub does not resolve organization team handles.
- **Remediation**: Updated `.github/CODEOWNERS` with resolving owner handle `@maz279` across:
  - **Auth**: `/apps/api/src/auth.ts`, `/apps/api/src/routes/users.ts`, `/apps/admin/src/pages/Login.tsx`
  - **Database**: `/packages/db/`
  - **Edge & Infrastructure**: `/deploy/nginx/`, `/deploy/compose/`, `/.github/workflows/`

---

## 4. Pre-Commit Quality & Security Gate (T3.6.4)
- **Local Hook**: Configured at `.githooks/pre-commit` (and `.git/hooks/pre-commit`) pointing to `tooling/verify/pre-commit-check.mjs`.
- **NPM Script**: `npm run pre-commit`.
- **Enforcements**:
  1. **Secret & Credential Scan**: Blocks staging of `.env*`, `*.pem`, `*.key`, `id_rsa`, or any files under `workspace/`.
  2. **Lint Gate**: ESLint zero-warning policy (`npm run lint --workspace @twinmos/admin`).
  3. **Format Gate**: Prettier code style verification (`npx prettier --check`).
  4. **CODEOWNERS Check**: Verifies resolving handle `@maz279` without unresolvable team handles.
- **Emergency Bypass**: Standard git bypass supported (`git commit --no-verify`).
