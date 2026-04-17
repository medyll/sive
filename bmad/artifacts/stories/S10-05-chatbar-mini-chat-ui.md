---
id: S10-05
sprint: 10
title: chatbar-mini-chat-ui
status: done
---

# S10-05 — ChatBar Mini-Chat UI + chatStore

## Goal
Create a chatStore and wire the ChatBar component to display user/AI message bubbles with scroll history.

## Acceptance Criteria
- [ ] chatStore manages messages[] and sending state
- [ ] ChatBar shows user bubbles (right) and AI bubbles (left)
- [ ] Messages scroll within max-200px container
- [ ] AI reply fetched from /api/ai with action=chat

## Notes
Depends on S10-01. chatStore in src/lib/chatStore.svelte.ts.
