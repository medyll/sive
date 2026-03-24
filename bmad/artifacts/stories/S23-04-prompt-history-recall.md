---
id: S23-04
sprint: 23
title: prompt-history-recall
status: done
---

# S23-04 — Prompt History Recall (Up/Down Arrow in Chat Input)

## Goal
Wire promptHistoryStore into the chat input so ArrowUp/Down cycles through past prompts.

## Acceptance Criteria
- [ ] ArrowUp (when input empty or cursor at 0) cycles backward through history
- [ ] ArrowDown cycles forward toward empty
- [ ] Enter to send calls promptHistoryStore.add(msg) before clearing
- [ ] "↑ history" micro-text shown below input when history non-empty

## Notes
Sprint 23.
