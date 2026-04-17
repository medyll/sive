---
id: S7-05
sprint: 7
title: unit-tests-suggestion-card
status: done
---

# S7-05 — Unit Tests — SuggestionCard

## Goal
Cover SuggestionCard rendering and callback behaviour with Vitest unit tests.

## Acceptance Criteria
- [ ] Renders category badge with correct label
- [ ] Renders severity indicator with correct CSS class
- [ ] Clicking Apply fires onApply with suggestion text
- [ ] Clicking Dismiss fires onDismiss with suggestion id
- [ ] Snapshot test for default props

## Notes
Test file: `src/lib/elements/SuggestionCard.spec.ts`.
