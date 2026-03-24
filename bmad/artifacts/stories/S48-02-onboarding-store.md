---
id: S48-02
sprint: 48
title: onboarding-store
status: done
---

# S48-02 — onboardingStore — Track Completion, localStorage

## Goal
Svelte store that persists onboarding completion state in localStorage.

## Acceptance Criteria
- [ ] Store exposes `isCompleted`, `currentStep`, `start()`, `next()`, `skip()`, `complete()`
- [ ] `isCompleted` initialised from localStorage on store creation
- [ ] `complete()` writes `onboarding_done=true` to localStorage
- [ ] Store resets cleanly for testing (reset() method)

## Notes
Store at `src/lib/onboardingStore.svelte.ts`.
