---
id: S36-02
sprint: 36
title: debounced-document-save
status: done
---

# S36-02 — Debounced Document Save

## Goal
Debounce auto-save to 1500ms after last keystroke with Saving/Saved indicator and beforeunload flush.

## Acceptance Criteria
- [ ] Auto-save debounced 1500ms after last keystroke
- [ ] "Saving…" → "Saved ✓" indicator with 2s fade
- [ ] Queue concurrent saves — only send latest content
- [ ] beforeunload flushes pending save immediately

## Notes
Sprint 36.
