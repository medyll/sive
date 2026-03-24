---
id: S22-02
sprint: 22
title: stream-tokens-chat-bubble
status: done
---

# S22-02 — Stream Tokens into Chat Bubble as They Arrive

## Goal
Replace fire-and-wait chat with streaming token-by-token display in the assistant bubble.

## Acceptance Criteria
- [ ] Chat input fetches /api/ai/stream instead of /api/ai
- [ ] Tokens appended to assistant message in real time
- [ ] Blinking cursor shown while streaming

## Notes
Read response.body as ReadableStream, parse SSE chunks.
