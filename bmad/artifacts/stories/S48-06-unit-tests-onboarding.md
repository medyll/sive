---
id: S48-06
sprint: 48
title: unit-tests-onboarding
status: done
---

# S48-06 — Unit Tests — onboardingStore & Tour Step Logic

## Goal
Unit tests covering onboarding store state transitions and step navigation logic.

## Acceptance Criteria
- [ ] start() sets currentStep=0 and isCompleted=false
- [ ] next() increments step; does not exceed max
- [ ] skip() sets isCompleted=true and writes localStorage
- [ ] complete() on last step sets isCompleted=true
- [ ] Store initialises isCompleted=true when localStorage flag present

## Notes
Test file: `src/lib/onboardingStore.spec.ts`.
