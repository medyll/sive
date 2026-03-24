# Sprint 48 — Onboarding Tour & Help System

**Sprint Duration:** 2026-03-17 → 2026-03-19
**Status:** ✅ Done
**Goal:** Guide new users through core app features with a step-by-step onboarding tour and provide a persistent help system (keyboard shortcuts modal + contextual tooltips).

---

## Stories

| ID | Epic | Title | Points | Priority |
|---|---|---:|---|---|
| S48-01 | Onboarding | OnboardingTour component — 5-step guided overlay | 3 | Must |
| S48-02 | Onboarding | onboardingStore — track completion, localStorage | 2 | Must |
| S48-03 | Onboarding | Wire tour auto-launch for first-time users | 2 | Must |
| S48-04 | Help | KeyboardShortcutsHelp modal (`?` key trigger) | 2 | Must |
| S48-05 | Help | Contextual tooltips on toolbar & AI panel buttons | 2 | Should |
| S48-06 | Testing | Unit tests — onboardingStore & tour step logic | 2 | Should |

**Total:** 13 points

---

## Acceptance Criteria
- [x] First-time users see the onboarding tour automatically on app load
- [x] Tour has 5 steps covering: editor, DocumentList, AI panel, export, settings
- [x] Completed state persisted in localStorage — tour does not repeat
- [x] Pressing `?` opens the keyboard shortcuts modal
- [x] Toolbar buttons show descriptive tooltips on hover
- [x] Unit tests cover store state transitions and step navigation
