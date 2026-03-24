# Sprint 7 — Suggestions Tab UI

**Sprint Duration:** 2026-05-01 → 2026-05-14
**Status:** ✅ Done
**Goal:** Deliver the Suggestions tab with a stub "Get suggestions" flow surfacing 5 improvement cards (category, severity, suggestion text, apply/dismiss actions).

---

## Stories

| ID | Epic | Title | Points | Priority |
|---|---|---:|---|---|
| S7-01 | Suggestions | SuggestionCard component | 2 | Must |
| S7-02 | Suggestions | suggestionStore — stub suggestions | 2 | Must |
| S7-03 | Suggestions | Wire Suggestions tab in AIPanel | 3 | Must |
| S7-04 | Suggestions | Apply/dismiss actions on SuggestionCard | 2 | Must |
| S7-05 | Testing | Unit tests — SuggestionCard | 2 | Should |
| S7-06 | Testing | E2E — Suggestions tab flow | 3 | Should |

**Total:** 14 points

---

## Acceptance Criteria
- [x] Suggestions tab shows "Get suggestions" button
- [x] 5 stub suggestion cards appear after 1.5s
- [x] SuggestionCard: category badge, severity indicator, suggestion text, apply/dismiss buttons
- [x] Dismissed cards are removed from the list; applied cards update editor content
- [x] 5 Vitest unit tests pass for SuggestionCard
- [x] 6 Playwright E2E tests pass for Suggestions tab flow
