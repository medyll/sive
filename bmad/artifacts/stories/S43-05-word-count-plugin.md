---
id: S43-05
sprint: 43
title: word-count-plugin
status: done
---

# S43-05 — Built-in Word-Count Plugin (Reference Implementation)

## Goal
Implement a first-party word-count plugin that adds a live word counter to the toolbar via the plugin system.

## Acceptance Criteria
- [ ] Plugin registers with id `sive.word-count`, permission `toolbar`
- [ ] Toolbar shows live word count updating on every keystroke
- [ ] Count displayed as "NNN words"
- [ ] Plugin can be disabled via settings toggle

## Notes
Plugin at `src/lib/plugins/wordCount.plugin.ts`.
