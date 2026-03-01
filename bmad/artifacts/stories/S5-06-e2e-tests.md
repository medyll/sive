# Story S5-06 — E2E — Style tab flow

**Epic:** Testing
**Sprint:** Sprint 5
**Points:** 3
**Priority:** Should

## Test Coverage

### e2e/style-tab.spec.ts (target: 7 tests)

1. Style tab button is visible
2. Clicking Style tab shows StyleSliders panel
3. All 4 slider labels are visible
4. "Analyse this passage" button is visible (locator: `.btn-analyse`)
5. Clicking Analyse shows "Analysing…" loading state
6. After analysis, 3 result cards are visible
7. Clicking Analyse again clears old results before showing new ones

## Technical Notes

- Build + preview approach (same as other E2E tests): `pnpm build && pnpm preview`
- Navigate to `/app` then click "Style" tab
- Use `.btn-analyse` locator for loading state assertions
- Stub signals always return 3 items — assert `getByRole('article').count()` === 3

## Dependencies

- S5-04

## Definition of Done

- [ ] 7 E2E tests pass
- [ ] `npm run test:e2e` green
