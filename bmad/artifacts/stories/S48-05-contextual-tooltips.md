---
id: S48-05
sprint: 48
title: contextual-tooltips
status: done
---

# S48-05 — Contextual Tooltips on Toolbar & AI Panel Buttons

## Goal
Add descriptive tooltips to all toolbar and AI panel icon buttons to improve discoverability.

## Acceptance Criteria
- [ ] All toolbar icon buttons have `title` attribute and visible tooltip on hover
- [ ] AI panel tab buttons show tooltip with tab name and keyboard shortcut
- [ ] Tooltips do not interfere with click targets
- [ ] Tooltips respect reduced-motion preferences (no animation if prefers-reduced-motion)

## Notes
Use a lightweight Tooltip Svelte action or CSS `[title]` attribute styling.
