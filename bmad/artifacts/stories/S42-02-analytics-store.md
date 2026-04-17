---
id: S42-02
sprint: 42
title: analytics-store
status: done
---

# S42-02 — analyticsStore — Record Session Events

## Goal
Svelte store that tracks active writing session start/end and posts events to the analytics API.

## Acceptance Criteria
- [ ] startSession() records timestamp and initial word count
- [ ] endSession() calculates duration and posts to `/api/analytics`
- [ ] Word milestone events fired at 100, 500, 1000 word counts
- [ ] Store resets cleanly between document switches

## Notes
Store at `src/lib/analyticsStore.svelte.ts`.
