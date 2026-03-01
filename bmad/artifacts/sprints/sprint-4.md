# Sprint 4 — Versioning (Harden)

**Duration:** 2026-04-01 → 2026-04-15
**Capacity:** ~20 story points

## Sprint Goal

Deliver the Harden versioning UI: a named-snapshot modal triggered from the toolbar, a visual timeline of all versions in the History tab, and a side-by-side diff view between any two Hardens.

## Stories

| ID | Epic | Title | Points | Priority |
|---|---|---|---:|---|
| S4-01 | Versioning | HardenModal component + toolbar button | 5 | Must |
| S4-02 | Versioning | Harden data types & stub store | 2 | Must |
| S4-03 | Versioning | HardenTimeline component | 3 | Must |
| S4-04 | Versioning | HardenDiff component | 3 | Must |
| S4-05 | Versioning | Wire History tab in AIPanel | 2 | Must |
| S4-06 | Testing | Unit tests — HardenModal + HardenTimeline | 2 | Should |
| S4-07 | Testing | E2E — Harden flow | 2 | Should |

**Total:** 19 points

## Dependencies

- S4-03 depends on S4-02 (needs HardenSnapshot type)
- S4-04 depends on S4-02 (needs stub data for selectors)
- S4-05 depends on S4-03 + S4-04 (wires both into AIPanel)
- S4-06 depends on S4-01 + S4-03 (components must exist)
- S4-07 depends on S4-05 (full flow must be wired)

## Definition of Done

- [ ] `💾 New version` button in main toolbar opens HardenModal
- [ ] HardenModal: label + message fields, confirm creates a stub Harden entry
- [ ] History tab in AIPanel shows HardenTimeline with stub versions
- [ ] Diff controls allow selecting two versions and viewing a stub diff
- [ ] Vitest unit tests pass for HardenModal + HardenTimeline
- [ ] Playwright E2E tests pass for the full Harden flow

## Risks

- File system persistence (`.harden/` folder) is **out of scope** — all data is stub/in-memory for this sprint.
- Actual AI-generated commit messages are deferred to Sprint 5+ (AI integration).
