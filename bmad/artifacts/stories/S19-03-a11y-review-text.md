---
id: S19-03
sprint: 19
title: a11y-review-text
status: done
---

# S19-03 — Remove a11y svelte-ignore Suppressions in ReviewText

## Goal
Remove all svelte-ignore a11y suppressions from ReviewText and add proper keyboard support.

## Acceptance Criteria
- [ ] No svelte-ignore a11y suppressions remain in ReviewText
- [ ] mark elements have role="button" and onkeydown handler
- [ ] Space key supported alongside Enter for activation

## Notes
mark elements already have onkeydown; add Space key support.
