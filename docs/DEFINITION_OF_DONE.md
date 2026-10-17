# Definition of Done & Engineering Standards (PROC-02)

**Authority:** TwinMOS Revised Implementation Roadmap v3.1 Phased (2026-10-17), Section 2 (§2.1–§2.3)  
**Standard:** ISO/IEC 25010 / NIST SSDF SP 800-218  
**Applicability:** All Tasks, Pull Requests, Sprints, and Verification Gates (VC-R0 through VC-F)

---

## 2.1 Definition of Done

A task is **DONE** only when **all four** conditions hold:

1. **Merged to `main` on GitHub through a pull request**:
   - Direct pushes to `main` are strictly prohibited by repository branch protection.
   - Every merge must pass code review and required CI status checks.
2. **CI is green on that merge**:
   - `build-and-verify` pipeline passes with 0 lint warnings, 0 type errors, and clean builds.
   - `test-postgres-integration` passes all test suites against PostgreSQL 18.
   - `test-edge-config` passes Docker edge builds and `nginx -t` validation.
3. **CI Artefact for each acceptance condition & check**:
   - Each acceptance condition and check ID has a verifiable CI artefact (terminal log, JSON report, or high-resolution screenshot).
   - The artefact comes from a check script that **can fail** and has been verified to fail (negative test / MUT-01).
   - Commit messages, documents, and synthetic simulations are **not** evidence.
4. **Second-engineer re-run**:
   - A second engineer has re-run the check independently and confirmed the result.

---

## 2.2 Standard Task Workflow

Every task in the TwinMOS engineering programme follows these eight sequential steps:

1. **Claim**:
   - Set the task status to *In progress* in [`docs/STATUS.md`](STATUS.md).
   - Strict WIP limit: at most **2 active tasks per engineer** at any given time.
2. **Branch from `main`**:
   - Create a dedicated feature/task branch.
   - Keep pull requests small and atomic: one task, or one coherent step of a task.
3. **Check first (Test-Driven Verification)**:
   - Write or extend the check script named in *Done when* (in `tooling/verify/` or the test suites).
   - Run the check against the existing codebase or against a planted defect to record a verifiable **red run** (negative test).
4. **Implement**:
   - Execute the code, schema, configuration, or documentation changes defined in the task card.
5. **Verify in production mode**:
   - Security, authentication, edge, and data checks run in the production-mode lab stack:
     - API running with `NODE_ENV=production` on PostgreSQL 18.
     - Reverse proxy running Nginx with the canonical repository configuration ([`deploy/nginx/twinmos.conf`](../deploy/nginx/twinmos.conf)).
     - Mock mail outbox and Turnstile captcha validation active.
   - In-process tests in test mode serve as regression guards, not exit-gate evidence.
6. **Pull request**:
   - Title follows canonical format: `T<Phase>.<Milestone>.<Task> (<Source>): <description>`.
   - PR body lists the exact check IDs verified and links to the CI build/artefacts.
   - Code owners review per [`.github/CODEOWNERS`](../.github/CODEOWNERS).
   - Merge only when all status checks are green.
7. **Second-engineer re-run**:
   - Another engineer verifies the CI artefacts or re-runs the verification kit on a clean checkout.
8. **Close & Push Daily**:
   - Mark the task **DONE** in [`docs/STATUS.md`](STATUS.md) with the verifiable artefact link.
   - **Push every day**: uncommitted work older than one day is classified as a process defect.

---

## 2.3 Programme Rules

These nine rules govern all development and close findings Z-02, Z-16, Z-17, and Z-18:

1. **One plan of record (`PROC-03`)**:
   - [`TwinMOS_Revised_Implementation_Roadmap_v3.1_Phased_2026-10-17.md`](../audit/Audit_report/audit_finding_Implementation/TwinMOS_Revised_Implementation_Roadmap_v3.1_Phased_2026-10-17.md) is the sole authoritative plan.
   - `workspace/audit/REMEDIATION_PLAN.md` (TM-REM-2026-001) is formally superseded.
   - Platform status is reported strictly by task ID and check ID.
2. **No report without artefacts (`EVID-01`)**:
   - No document under `docs/reports/` may assert a metric, event, or sign-off without linking the CI run or artefact that produced it.
   - Every sign-off must name a real person in a real role (placeholder names like "P. Lead" or "S. Auditor" are prohibited).
   - Future-dated records are strictly prohibited.
3. **Checks must be able to fail**:
   - Every check script under `tooling/verify/` must have a verified negative test (a planted defect that turns the check red).
   - Simple keyword greps over source code or documents are classified as lint only, never as a named verification check.
4. **Simulations are labelled and never counted**:
   - Scripts generating synthetic telemetry or data are quarantined in `tooling/demo/` with a mandatory Rule 4 disclaimer header stating that they prove nothing about actual production operations.
5. **Push daily; merge through pull requests**:
   - Branch protection on `main` mandates green CI and at least one code review approval.
   - Local-only "gate complete" commits without merged PRs are prohibited.
6. **Production-mode verification**:
   - Verification suites must execute against the production container stack on PostgreSQL 18 before milestone sign-off.
7. **Audit what was built**:
   - Builds embed the exact commit SHA and dirty flag.
   - The verification kit refuses dirty or mismatched builds.
8. **Truthful content**:
   - Zero invented organizations, placeholder offices, fabricated testimonials, artificial pricing, or fabricated policy versions.
   - Unverified placeholder content must be marked draft in the CMS and never published to the public site.
9. **Strict WIP limit**:
   - Maximum 2 active tasks per engineer. At an exit gate, in-flight work must be closed before starting new tasks.
