---
id: S52-03
sprint: 52
title: settings-writing-goal
status: done
---

# S52-03 — Writing Goal Target in Settings Page

## Goal
Add a "Daily Writing Goal" input to the Settings page that reads/writes via goalsStore and shows the current streak.

## Acceptance Criteria
- [ ] Settings page has a "Daily Writing Goal" number input (words/day)
- [ ] Input reads initial value from `goalsStore.dailyTarget`
- [ ] Changing the value calls `goalsStore.setDailyTarget(value)`
- [ ] Current streak displayed next to the input field
- [ ] Value persisted across page reloads

## Notes
File: `src/routes/settings/+page.svelte`.
