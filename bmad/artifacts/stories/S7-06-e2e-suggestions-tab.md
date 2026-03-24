---
id: S7-06
sprint: 7
title: e2e-suggestions-tab
status: done
---

# S7-06 — E2E — Suggestions Tab Flow

## Goal
Playwright tests verifying the full suggestions tab user journey.

## Acceptance Criteria
- [ ] Tab is visible and clickable in AIPanel
- [ ] Clicking "Get suggestions" shows loading spinner then cards
- [ ] Dismissing a card removes it from the DOM
- [ ] Applying a card updates editor content
- [ ] Empty state renders when all cards dismissed
- [ ] Tests import from `./fixtures` and pass in CI

## Notes
E2E file: `e2e/suggestions.spec.ts`.
