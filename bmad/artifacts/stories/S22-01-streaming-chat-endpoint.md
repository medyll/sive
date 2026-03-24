---
id: S22-01
sprint: 22
title: streaming-chat-endpoint
status: done
---

# S22-01 — Streaming Chat Endpoint (/api/ai/stream) Using SSE

## Goal
Create GET /api/ai/stream endpoint that returns token-by-token streaming via SSE.

## Acceptance Criteria
- [ ] GET /api/ai/stream returns text/event-stream
- [ ] Each data: line is a token chunk
- [ ] Closes with data: [DONE]
- [ ] Falls back to stubbed single chunk when no API key

## Notes
Reads ?q=<base64url messages JSON>. Uses Anthropic.messages.stream().
