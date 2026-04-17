---
id: S20-03
sprint: 20
title: keyboard-shortcuts-expand
status: done
---

# S20-03 — Expand Keyboard Shortcuts (New Doc, Toggle Sidebar, Next/Prev Doc)

## Goal
Add Ctrl+N (new doc), Ctrl+B (toggle sidebar), and Ctrl+]/[ (cycle documents) keyboard shortcuts.

## Acceptance Criteria
- [ ] Ctrl+N creates a new document
- [ ] Ctrl+B toggles sidebar
- [ ] Ctrl+] and Ctrl+[ cycle between documents
- [ ] Shortcuts guarded against firing when focused in input/textarea/contenteditable

## Notes
Extend globalKeyboardShortcuts in +page.svelte.
