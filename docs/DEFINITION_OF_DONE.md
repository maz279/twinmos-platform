# Definition of Done & Evidence Standard (PROC-02)

**Standard:** ISO/IEC 25010 / NIST SSDF SP 800-218  
**Applicability:** All Pull Requests, Sprints, and Verification Checkpoints (VC-A through VC-F)

---

## 1. Definition of Done (DoD) Criteria

A task is considered **DONE** if and only if all of the following criteria are satisfied:

1. **Implementation Completeness**:
   - The code satisfies 100% of the acceptance criteria defined in the task card.
   - All code is strictly parameter-bound (no SQL concatenation).
   - Zero hardcoded secrets, test credentials, or localhost URLs are present in code or documentation.

2. **Automated Testing & Gates**:
   - All unit and integration test suites pass (`npm test` green, 100% pass rate).
   - TypeScript compilation passes with zero errors (`npm run typecheck`).
   - ESLint passes with zero errors and zero warnings (`--max-warnings 0`).
   - All relevant end-to-end specs pass in Playwright (`npm run test:e2e` / `playwright test`).

3. **Security & RBAC Enforcement**:
   - Role barriers (`member`, `viewer`, `author`, `editor`, `admin`, `super_admin`) are strictly enforced.
   - Endpoints exposing personal data enforce `editor` role or higher.
   - All mutations generate an immutable audit log record.
   - Body limits and rate limits are tested and verified.

4. **Accessibility (WCAG 2.2 AA)**:
   - axe-core automated scans on affected pages yield 0 violations under both standard and reduced motion settings.
   - Color contrast meets or exceeds 4.5:1 for standard body text and 3:1 for large text.
   - Interactive elements have accessible names and visible focus states.

5. **Evidence Standard**:
   - Every task claiming **DONE** must reference verifiable CI/automated test evidence: test output logs, JSON report files, or screenshots.
   - Verbal claims or commit message descriptions without reproducible evidence are considered **FAIL / PARTIAL**.

---

## 2. Evidence Storage & Traceability

- Automated test reports are stored under `tooling/verify/reports/` or CI artifact storage.
- Audit evidence is indexed by task ID (e.g. `A1`, `A4a`, `A10`, `E8`) and checkpoint ID (e.g. `VC-A`).
