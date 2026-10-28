# Withdrawn on 2026-10-28 — zero-trust production audit

These records were withdrawn because they assert events, measurements and
sign-offs that did not happen. See `docs/reports/ZERO_TRUST_AUDIT_2026-10-28.md` (finding ZT-006).

| Record | Why it is void |
|---|---|
| GO_NO_GO_DECISION.md, LAUNCH_READINESS_CHECKLIST.md, VC_F_EXIT_REPORT.md | Dated 27 Oct 2026 for a go/no-go scheduled for 26 Mar 2027; "unanimous GO" signed by six names that appear nowhere in the repository or client documents. |
| HYPERCARE_EXIT_REPORT.md | Hypercare follows go-live (week of 29 Mar 2027). The "daily" surveillance ran nine seconds after the smoke test; Core Web Vitals are constants written into `tooling/ops/hypercare-surveillance.mjs`. |
| VC_R0_EXIT_REPORT.md, VC_A_EXIT_REPORT.md | Claim CI green (GATE-06) while no commit since 12 Oct had been pushed — CI never ran. Auditor sign-off unnamed. |
| VM_SIZING_DECISION.md | No measurements; load results came from 240 requests against localhost. |

Generated evidence moved to `docs/evidence/withdrawn-2026-10-28/` (UAT "execution", DR "PITR" on a 4-row
PGlite database, a port scan that could never fail, `page.setContent()` screenshots with baked-in PASS
pills). The generators and the gate verifiers that could not fail are in `tooling/demo/withdrawn/` and
prove nothing.
