---
id: S31-01
sprint: 31
title: inline-suggestion-api
status: done
---

# S31-01 — Inline Suggestion API Endpoint

## Goal
Create GET /api/ai/suggest endpoint supporting complete, rewrite, and tone modes via SSE streaming.

## Acceptance Criteria
- [ ] GET /api/ai/suggest?ctx=&cursor=&mode=complete|rewrite|tone
- [ ] Streams SSE tokens with [DONE] terminator
- [ ] Stub when no API key (lorem-style words)
- [ ] Rate limiting and input validation applied

## Notes
src/routes/api/ai/suggest/+server.ts.
