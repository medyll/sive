# S3-06 — Unit Tests: ReviewToolbar & ReviewReport

**Sprint:** 3 | **Epic:** QA | **Points:** 2 | **Priority:** Should
**Depends on:** S3-02, S3-04

## Goal

Write Vitest browser component tests for `ReviewToolbar` and `ReviewReport`.

## Acceptance Criteria

### ReviewToolbar (`src/lib/elements/ReviewToolbar.svelte.spec.ts`)
- [ ] Renders scope selector with 3 options
- [ ] Default scope is `'current chapter'`
- [ ] Clicking `Run analysis` calls `onRunAnalysis`
- [ ] Clicking `← Back to writing` calls `onExitReview`
- [ ] When `analysisRunning=true`, Run analysis button is visually disabled/loading

### ReviewReport (`src/lib/elements/ReviewReport.svelte.spec.ts`)
- [ ] Renders all 7 section headings
- [ ] When `report=null`, shows placeholder message
- [ ] When `report` has stub data, renders at least 1 item per section

## Test File Locations

- `src/lib/elements/ReviewToolbar.svelte.spec.ts`
- `src/lib/elements/ReviewReport.svelte.spec.ts`

## References

- `src/lib/elements/TabBar.svelte.spec.ts` — pattern reference
- `vite.config.ts` — vitest browser config (`.svelte.spec.ts` → client project)
