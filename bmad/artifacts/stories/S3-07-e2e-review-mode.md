# S3-07 — E2E Review Mode Tests

**Sprint:** 3 | **Epic:** QA | **Points:** 2 | **Priority:** Should
**Depends on:** S3-05

## Goal

Write Playwright E2E tests for the Review Mode flow: enter review mode, verify layout, scope selector, run analysis stub, back to writing.

## Acceptance Criteria

- [ ] Navigating to `/app` and clicking `Review` renders the review layout
- [ ] ReviewToolbar is visible with scope selector and action buttons
- [ ] ReviewText panel is visible (read-only, 55% area)
- [ ] ReviewReport panel is visible with all 7 section headings
- [ ] Scope selector can be changed to each of the 3 options
- [ ] Clicking `← Back to writing` returns to the normal writing workspace
- [ ] Review Mode button has `aria-pressed="true"` when active

## Test File Location

- `e2e/review-mode.spec.ts`

## References

- `e2e/app-layout.spec.ts` — pattern reference
- `playwright.config.ts` — webServer config (builds before run)
