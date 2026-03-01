# Story S5-02 — StyleSignal component

**Epic:** Style
**Sprint:** Sprint 5
**Points:** 2
**Priority:** Must

## User Story

As an **author**, I want to see individual style signal cards after passage analysis, so that I know exactly what to improve and where.

## Acceptance Criteria

```gherkin
Given a StyleSignal is rendered
When I view the card
Then I see: location (e.g. "Para. 3"), signal type (e.g. "Repetition"), and a suggestion text

Given multiple StyleSignals are in a list
When all are visible
Then each is visually distinct with a signal-type icon or colour badge
```

## Technical Notes

- Create `src/lib/elements/StyleSignal.svelte`
- Props: `location: string`, `signal: string`, `suggestion: string`
- Signal type → colour/icon mapping (at least 4 types): Repetition, Sentence length, Rhythm break, Lexical density
- `role="article"` on the card container

## Out of Scope

- Click-to-navigate to the location in editor

## Dependencies

- None

## Definition of Done

- [ ] location, signal, suggestion render
- [ ] Signal type has colour badge
- [ ] role="article" present
- [ ] Build + autofixer clean
