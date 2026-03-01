# Story S5-05 — Unit tests — StyleSliders + StyleSignal

**Epic:** Testing
**Sprint:** Sprint 5
**Points:** 3
**Priority:** Should

## Test Coverage

### StyleSliders.svelte.spec.ts (target: 5 tests)

1. Renders 4 sliders
2. All sliders start at value 50
3. Labels: Cynicism, Syntactic complexity, Rhythm, Narrative density present
4. Slider input fires change; value badge updates
5. `values` prop controls initial values

### StyleSignal.svelte.spec.ts (target: 4 tests)

1. Renders location, signal, suggestion
2. role="article" present
3. Signal badge renders for known types
4. Long suggestion text truncates gracefully

## Technical Notes

- Follow existing spec pattern: `import { render } from 'vitest-browser-svelte'; import { page } from 'vitest/browser';`
- Files: `src/lib/elements/StyleSliders.svelte.spec.ts` and `src/lib/elements/StyleSignal.svelte.spec.ts`

## Dependencies

- S5-01, S5-02

## Definition of Done

- [ ] 9 unit tests pass
- [ ] `npm run test:unit` green
