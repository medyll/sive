# Sprint 6 — Coherence Tab UI

**Duration:** 2026-04-16 → 2026-04-30
**Capacity:** 12 story points

## Sprint Goal

Deliver the Coherence tab with a stub "Run coherence check" flow surfacing 5 alert cards (entity, discrepancy type, confidence Low/Medium/High, note).

## Stories

| ID | Epic | Title | Points | Priority |
|---|---|---:|---|---|
| S6-01 | Coherence | CoherenceAlert component | 2 | Must |
| S6-02 | Coherence | coherenceStore — stub alerts | 2 | Must |
| S6-03 | Coherence | Wire Coherence tab in AIPanel | 3 | Must |
| S6-04 | Testing | Unit tests — CoherenceAlert | 2 | Should |
| S6-05 | Testing | E2E — Coherence tab flow | 3 | Should |

**Total:** 12 points

## Definition of Done — ✅ All Met

- [x] Coherence tab shows "Run coherence check" button
- [x] 5 stub alerts appear after 1.5s (High/Medium/Low coverage)
- [x] CoherenceAlert: entity, discrepancy_type, confidence badge (grey/orange/red), note
- [x] 5 Vitest unit tests pass for CoherenceAlert
- [x] 7 Playwright E2E tests pass for Coherence tab flow
