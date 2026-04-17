# Story S4-06 — Unit tests — HardenModal + HardenTimeline

**Epic:** Testing
**Sprint:** Sprint 4
**Points:** 2
**Priority:** Should

## User Story

As a **developer**, I want unit tests for HardenModal and HardenTimeline, so that regressions are caught automatically.

## Context

Following the pattern from S2-06 and S3-06. Use `vitest-browser-svelte` + `vitest/browser`.

## Acceptance Criteria

```gherkin
Given HardenModal tests
Then: modal renders label + message fields
Then: Confirm button disabled when label empty
Then: Confirm button enabled when label has value
Then: clicking Confirm calls onConfirm with correct args
Then: clicking Cancel calls onCancel

Given HardenTimeline tests
Then: renders one point per snapshot
Then: clicking a point calls onSelectVersion with correct id
Then: empty state shows placeholder text
Then: selected snapshot has visual distinction (aria-current or class)
```

## Technical Notes

- `src/lib/elements/HardenModal.svelte.spec.ts`
- `src/lib/elements/HardenTimeline.svelte.spec.ts`
- Import pattern: `import { page, userEvent } from 'vitest/browser'`
- Use `render().container.querySelector()` for class-based assertions

## Dependencies

- S4-01 (HardenModal must exist)
- S4-03 (HardenTimeline must exist)

## Definition of Done

- [ ] ≥ 5 tests for HardenModal
- [ ] ≥ 4 tests for HardenTimeline
- [ ] All tests pass with `pnpm test:unit -- --run --project=client`
