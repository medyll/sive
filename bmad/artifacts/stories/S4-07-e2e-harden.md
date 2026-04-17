# Story S4-07 — E2E — Harden flow

**Epic:** Testing
**Sprint:** Sprint 4
**Points:** 2
**Priority:** Should

## User Story

As a **tester**, I want end-to-end tests for the full Harden flow, so that the versioning UI works correctly in a real browser.

## Context

Following the E2E pattern from S2-07 and S3-07. Playwright tests against the production build (`npm run build && npm run preview`).

## Acceptance Criteria

```gherkin
Given the app is open
When I click "💾 New version"
Then the HardenModal opens

Given the modal is open with label filled
When I click Confirm
Then the modal closes and a new entry appears in the History tab timeline

Given the modal is open
When I click Cancel
Then the modal closes with no new entry

Given the History tab is active
When the timeline renders
Then at least one Harden stub point is visible

Given the History tab is active with ≥ 2 versions
When I select version A and version B and click "View differences"
Then the diff panel becomes visible
```

## Technical Notes

- File: `e2e/harden.spec.ts`
- Use `.locator('.harden-modal')` for modal detection
- Use `page.getByRole('dialog')` to assert modal open/closed
- History tab: `page.getByRole('button', { name: 'History' }).click()`
- Diff launch: `page.getByRole('button', { name: 'View differences' }).click()`

## Dependencies

- S4-05 (full flow must be wired)

## Definition of Done

- [ ] ≥ 5 E2E scenarios pass
- [ ] `pnpm test:e2e -- e2e/harden.spec.ts` exits 0
