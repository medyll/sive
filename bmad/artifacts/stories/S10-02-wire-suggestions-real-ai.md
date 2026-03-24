---
id: S10-02
sprint: 10
title: wire-suggestions-real-ai
status: done
---

# S10-02 — Wire Suggestions to Real AI Call

## Goal
Connect the Suggestions tab in AIPanel to the real Anthropic API via /api/ai.

## Acceptance Criteria
- [ ] "Generate suggestions" calls /api/ai with action=suggestions
- [ ] Real AI response populates the suggestions store
- [ ] Mock fallback used when no API key

## Notes
Depends on S10-01.
