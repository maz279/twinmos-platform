# ADR-007: Repository History Decision and `workspace/` Handling (T3.6.3 / REPO-01)

## Status
**Accepted** (2026-10-20)

## Context
During the early crawl and reverse-engineering phase of the legacy TwinMOS corporate web estate, static scrapings, prototype HTML dumps, and media downloads were accumulated in the `workspace/` directory (6,232 files, 681.34 MB).

Because these files were committed in initial repository commits, the `.git` directory grew to 433.46 MB. Although `workspace/` was subsequently untracked from the git working tree via `git rm -r --cached workspace/`, git object history retains the compressed historical blobs unless rewritten with `git-filter-repo` or BFG Repo-Cleaner.

## Decision
We **retain existing git history without executing a destructive force-push rewrite**, while enforcing strict index exclusion, Docker exclusion, and CI checkout constraints:

1. **Preserve Commit Non-Repudiation & Upstream Stability**:
   - Destructive history rewriting (`git-filter-repo --path workspace --invert-paths`) rewrites every downstream commit SHA. This would force all team members and active forks to hard-reset, invalidating existing commit signatures and GPROV-CI cryptographic proofs.
   - Operating history remains immutable and auditable.

2. **Strict Working Tree & Staging Isolation**:
   - `workspace/` is permanently excluded from git tracking.
   - Enforced in `.gitignore` (`workspace/`) and verified by pre-commit hooks (`tooling/verify/pre-commit-check.mjs`), which fail immediately if any file in `workspace/` is staged.

3. **Docker Build Context Optimization**:
   - Enforced in root `.dockerignore` (`workspace/`).
   - Docker build context is reduced from >1.5 GB to <15 MB (>95% reduction), keeping build times fast and preventing image bloat.

4. **CI Shallow Clone Policy**:
   - GitHub Actions (`.github/workflows/ci.yml`) uses `actions/checkout@v4` with default shallow fetching (`depth: 1`), downloading only active HEAD tree objects.
   - Clone size in CI is <45 MB and checkout completes in <3 seconds.

## Measurements
| Metric | Before Remediation | After Exclusion Policy |
| :--- | :--- | :--- |
| **Tracked Files in `workspace/`** | 6,232 files | **0 files (clean working tree)** |
| **Workspace Disk Size** | 681.34 MB | 681.34 MB (local-only, ignored) |
| **Full History `.git` Size** | 433.46 MB | 433.46 MB (historical blobs intact) |
| **Shallow Clone Size (CI)** | ~450 MB (full clone) | **<45 MB (depth: 1)** |
| **Docker Build Context** | >1.5 GB | **<15 MB (>95% reduction)** |

## Consequences
- **Positive**: No team branch disruptions; no corrupted fork histories; CI checkout and container builds remain ultra-fast (<3s / <15MB); zero risk of accidental commit due to pre-commit gate.
- **Negative**: Full historical clones on fresh workstations download 433 MB instead of 45 MB unless cloned with `--depth=1`. This is accepted and documented in `docs/REPO_HYGIENE.md`.
