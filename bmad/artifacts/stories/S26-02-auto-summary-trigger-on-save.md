---
id: S26-02
sprint: 26
title: auto-summary-trigger-on-save
status: done
---

# S26-02 — Auto-Summary Trigger on Save

## Goal
After handleSave succeeds, check autoSummary setting and trigger background summary generation if on.

## Acceptance Criteria
- [ ] After successful save, reads autoSummary from localStorage
- [ ] If on, calls /api/ai/summary in background (fire-and-forget)
- [ ] "Updating summary…" toast appears and resolves silently

## Notes
No reactive binding needed; read from localStorage at call time.
