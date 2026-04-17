# Story S5-01 — StyleSliders component

**Epic:** Style
**Sprint:** Sprint 5
**Points:** 3
**Priority:** Must

## User Story

As an **author**, I want to adjust style sliders (Cynicism, Complexity, Rhythm, Density) so that AI suggestions match my intended tone and narrative pace.

## Acceptance Criteria

```gherkin
Given the Style tab is open
When the StyleSliders component renders
Then I see 4 labelled sliders: Cynicism, Syntactic complexity, Rhythm, Narrative density

Given a slider is at value 50 by default
When I drag it to a new value
Then the displayed value updates in real time

Given all sliders render
Then each shows its current numeric value next to the label
```

## Technical Notes

- Create `src/lib/elements/StyleSliders.svelte`
- Props: `values: StyleValues` (bindable), where `StyleValues = { cynicism: number; complexity: number; rhythm: number; density: number }`
- Each slider: `<input type="range" min="0" max="100" step="1" />` + label + value badge
- Slider labels: "Cynicism", "Syntactic complexity", "Rhythm", "Narrative density"
- Export `StyleValues` type from this file or from `styleStore.svelte.ts`

## Out of Scope

- Persistence to disk / backend
- Real AI use of values

## Dependencies

- None

## Definition of Done

- [ ] 4 sliders render with correct labels
- [ ] Default value = 50 for all
- [ ] Value badge updates on drag
- [ ] Build + autofixer clean
