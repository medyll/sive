---
id: S48-03
sprint: 48
title: wire-tour-first-time
status: done
---

# S48-03 — Wire Tour Auto-Launch for First-Time Users

## Goal
Automatically start the onboarding tour on app load when the user has not completed it yet.

## Acceptance Criteria
- [ ] App page checks `onboardingStore.isCompleted` on mount
- [ ] If not completed, `onboardingStore.start()` is called after 500 ms delay
- [ ] OnboardingTour component rendered in app layout conditionally
- [ ] E2E fixture sets localStorage to skip tour in tests

## Notes
Modify `src/routes/app/+page.svelte`. E2E fixture already sets `onboarding_done=true`.
