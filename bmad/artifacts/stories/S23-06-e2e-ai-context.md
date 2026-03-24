---
id: S23-06
sprint: 23
title: e2e-ai-context
status: done
---

# S23-06 — E2E Tests — AI Context and Prompt History

## Goal
E2E tests for context toggle behaviour and prompt history recall after page reload.

## Acceptance Criteria
- [ ] Chat with context ON returns response (stub mode)
- [ ] Chat with context OFF omits ctx param from fetch URL
- [ ] Send message → reload → ArrowUp → original message reappears

## Notes
File: e2e/ai-context.spec.ts.
