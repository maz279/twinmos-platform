## Pull Request Summary
<!-- Provide a clear, concise summary of the changes and the architectural goal -->

**Task ID:** `T<Phase>.<Milestone>.<Task>`  
**Source ID:** `M0.x / Ax / Bx / Cx / Dx / Ex / Fx`  
**Owner:** `FS1 / FS2 / FE / DO / QA`  
**Closes Findings:** <!-- e.g., Z-04, NF-35, etc. -->

---

## Definition of Done (DoD) Checklist
> **Mandatory Reference:** All contributions must strictly comply with the [TwinMOS Definition of Done & Engineering Standards](docs/DEFINITION_OF_DONE.md) (PROC-02 / Roadmap v3.1 §2.1).

- [ ] **1. Branch Protection & Review**: This PR targets `main` from a dedicated task branch; direct pushes to `main` are disabled.
- [ ] **2. Production-Parity CI Suite**:
  - `build-and-verify`: TypeScript compilation (`npm run typecheck`), ESLint (`--max-warnings 0`), and unit/integration tests pass with 0 failures.
  - `test-postgres-integration`: A10 migration runner executes cleanly on `postgres:18-alpine` with zero errors.
  - `test-edge-config`: Standalone edge Nginx container builds cleanly and passes `nginx -t` syntax validation.
- [ ] **3. Verifiable CI Artefacts & Negative Tests**:
  - Each acceptance condition and check ID has a verifiable CI artefact (terminal log, JSON report, or high-resolution screenshot).
  - Check scripts can fail and have a recorded negative run (MUT-01 / planted defect verification).
  - Verbal claims, commit logs, and synthetic simulations are **not** accepted as evidence.
- [ ] **4. Second-Engineer Re-run**:
  - A peer engineer has independently executed the verification runner and verified clean pass.
- [ ] **5. Status Record Updated**:
  - Task status updated in [`docs/STATUS.md`](docs/STATUS.md) referencing the specific task ID, check ID, and artefact link.

---

## Verification Checks Verified
<!-- List all specific check IDs and probes tested in this PR, e.g.:
- [x] PROC-01 (ADR set D-1...D-12 and D-9a indexed)
- [x] PROC-02 (DoD and evidence standard in repo)
- [x] S-04 / RESET-LOG (Password reset token out of auth logs)
- [x] DATA-PATCH (Table-driven PATCH/PUT schema separation)
-->

---

## Related ADRs & Specifications
<!-- e.g., ADR D-9a (Personal Data Protection), ADR D-10 (PostgreSQL 18), ADR D-4 (Delivery API) -->
