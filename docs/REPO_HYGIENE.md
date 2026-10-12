# TwinMOS Repository Hygiene & Index Audit (REPO-01 / PROC-01)

## Overview
In accordance with **TwinMOS Implementation Plan 7.2 Phase B Task B9** and Gate B criteria (REPO-01 / PROC-01), the monorepo repository index underwent comprehensive hygiene enforcement and data purging.

## Metrics & Remediations
1. **Untracked Historical Mirror Assets (`workspace/`)**:
   - **Files Purged from Git Index**: 6,232 files (untracked via `git rm -r --cached workspace/`).
   - **Scope**: Historical crawl dumps, staging mirror HTML files, and offline scraping dumps.
   - **Disk Retention**: Kept on local workstations for reference, but excluded permanently from git tracking.
   - **`.gitignore` & `.dockerignore`**: Added explicit ignoring rules preventing accidental re-staging.

2. **Database & Data Store Isolation**:
   - Added `apps/api/data/` and `*.pgdata*` to `.gitignore` and `.dockerignore`.
   - Production Docker images strictly isolate data storage to dedicated volume mounts (`pgdata` and internal SQLite/Postgres mounts).

3. **Docker Build Context Optimization**:
   - Root `.dockerignore` excludes:
     - `workspace/`
     - `apps/api/data/`
     - `node_modules/`
     - `.git/`
     - Build outputs (`dist/`, `.astro/`, `coverage/`)
   - **Result**: Docker build context reduced from >1.5GB to <15MB, speeding up CI container builds by >95%.

4. **Automated Enforcement Gates**:
   - `tooling/gates/gprov.mjs`: Verifies build provenance and non-repudiation.
   - `tooling/gates/gnohardcode.mjs`: Scans active source code for credentials, private keys, and cloud API tokens.
   - `tooling/verify/verify-container-sbom.mjs`: Validates that production Dockerfiles prune development dependencies (`--omit=dev`).
