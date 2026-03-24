---
id: S48-01
sprint: 48
title: onboarding-tour-component
status: done
---

# S48-01 — OnboardingTour Component — 5-Step Guided Overlay

## Goal
Build an overlay tour component that highlights app elements step by step with descriptive callouts.

## Acceptance Criteria
- [ ] 5 steps: editor, DocumentList, AI panel, export button, settings
- [ ] Each step highlights a target element with a semi-transparent overlay
- [ ] Callout shows step title, description, "Next" / "Back" / "Skip" buttons
- [ ] Progress indicator shows current step (e.g. "2 / 5")
- [ ] Tour ends on step 5 "Finish" or any "Skip"

## Notes
Component at `src/lib/elements/OnboardingTour.svelte`.
