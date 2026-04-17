# Sprint 19 — Accessibility, UX Polish & Guest Conversion

**Duration:** 2026-03-17 → 2026-03-31
**Capacity:** 18 story points

## Sprint Goal

Resolve the long-standing review-screen highlight→report scroll TODO, add live word-count to the editor status bar, fix the remaining svelte-ignore a11y suppressions in ReviewText, and implement the two missing guest API endpoints (`/api/guest/status` and `/api/guest/convert`) specified in the architecture.

## Stories

| ID | Epic | Title | Points | Priority |
|---|---|---|---|---|
| S19-01 | UX | Word count in EditorPanel status bar | 2 | Must |
| S19-02 | UX | Highlight → report item scroll in ReviewScreen | 3 | Must |
| S19-03 | A11y | Remove a11y svelte-ignore suppressions in ReviewText | 2 | Must |
| S19-04 | Guest | GET /api/guest/status endpoint | 2 | Should |
| S19-05 | Guest | POST /api/guest/convert endpoint | 3 | Should |
| S19-06 | QA | Unit tests for S19-01 → S19-05 | 4 | Must |

**Total:** 16 points

## Definition of Done

- [ ] EditorPanel shows live word & character count in the status bar
- [ ] Clicking a highlight in ReviewText scrolls the corresponding report item into view
- [ ] No svelte-ignore a11y suppressions in ReviewText
- [ ] GET /api/guest/status returns `{ guestId, canConvert }` for guest sessions
- [ ] POST /api/guest/convert validates payload and stubs conversion logic
- [ ] Unit tests cover all new behaviour

## Implementation Notes

- S19-02: wire `reportEl` ref into `ReviewReport` via `scrollToItem(id)` exposed function; `ReviewScreen` calls it from `handleHighlightClick`
- S19-03: `<mark role="button">` already has `onkeydown`; remove ignores and add `Space` key support alongside `Enter`
- S19-04/05: cookie-only MVP per spec — no DB writes, `ALLOW_GUESTS` flag check
