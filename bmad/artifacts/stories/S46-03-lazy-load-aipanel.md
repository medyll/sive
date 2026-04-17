---
id: S46-03
sprint: 46
title: lazy-load-aipanel
status: done
---

# S46-03 — Lazy-Load AIPanel Tabs (Dynamic Import)

## Goal
Replace static imports of AIPanel tab components with dynamic imports triggered on first tab activation.

## Acceptance Criteria
- [ ] Suggestions, Coherence, Style tab components loaded on first click
- [ ] Loading spinner shown in tab content area while importing
- [ ] Subsequent activations use cached module (no re-import)
- [ ] Initial page JS bundle reduced measurably

## Notes
Modify `src/lib/elements/AIPanel.svelte` using Svelte `{#await import(...)}`.
