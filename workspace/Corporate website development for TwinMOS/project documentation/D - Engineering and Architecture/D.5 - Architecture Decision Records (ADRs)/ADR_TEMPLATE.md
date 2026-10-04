# ADR-XXX: [Short Descriptive Title]

| Field | Value |
|-------|-------|
| **ADR Number** | ADR-XXX |
| **Date** | YYYY-MM-DD |
| **Status** | Proposed \| Accepted \| Deprecated \| Superseded by ADR-YYY |
| **Deciders** | [Names / roles] |
| **Source** | [Reference to Tech Stack §, BRD §, or discussion] |

---

## 1. Context

*What is the issue that we're seeing that is motivating this decision or change?*

*Describe the forces at play: technical, business, team, project constraints. Include any relevant background from the project Tech Stack doc, BRD, or forensic audit findings.*

*Be specific about why a decision needs to be made NOW rather than later.*

---

## 2. Decision

*What is the change that we're proposing and/or doing?*

*State the decision as a complete sentence: "We will use X for Y because Z."*

---

## 3. Rationale

*Why is this the best option? What evidence or reasoning supports the decision?*

*Reference concrete criteria from project constraints:*
- *Performance requirements (Lighthouse ≥90, LCP ≤1.8s)*
- *Cost constraints (<$25/mo Phase 1, <$80/mo Phase 3)*
- *Team constraints (2-dev team, no dedicated DevOps)*
- *Market requirements (9 locales, Arabic RTL support)*
- *Timeline (Phase 1 launch by month 5)*

---

## 4. Alternatives Considered

*What other options were evaluated? Why were they not chosen?*

| Option | Reason Not Chosen |
|--------|------------------|
| Option A | [Specific reason — cost, complexity, missing feature] |
| Option B | [Specific reason] |
| Option C | [Specific reason] |

---

## 5. Consequences

### Positive
- *What becomes easier or more possible because of this decision?*

### Negative / Trade-offs
- *What becomes harder or more costly?*
- *What new risks does this introduce?*
- *What future flexibility is reduced?*

### Neutral
- *What changes but is neither good nor bad?*

---

## 6. Implementation Notes

*Optional. Any key implementation constraints, migration steps, or gotchas the team should know about.*

---

## 7. Related ADRs & Documents

- ADR-XXX: [Related decision]
- [Document name](../path/to/document.md)

---

## Status Values Reference

| Status | Meaning |
|--------|---------|
| **Proposed** | Decision is under discussion; not yet confirmed |
| **Accepted** | Decision is confirmed and in effect |
| **Deprecated** | Decision was accepted but is no longer recommended |
| **Superseded by ADR-YYY** | A newer ADR replaces this one |

---

*Instructions for completing this template:*
1. *Replace `ADR-XXX` with the next sequential ADR number*
2. *Fill in all sections — "N/A" is acceptable for optional sections*
3. *Delete this instruction block before committing*
4. *Add a link to the new ADR from this project's ADR index (MEMORY.md or README)*
