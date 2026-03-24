---
id: S25-02
sprint: 25
title: api-ai-summary-endpoint
status: done
---

# S25-02 — /api/ai/summary Streaming Endpoint

## Goal
Implement /api/ai/summary endpoint that streams summaries via SSE for a given docId and length.

## Acceptance Criteria
- [ ] Accepts docId and length params
- [ ] ctx param with base64 doc excerpt (up to 2000 chars)
- [ ] Returns streaming SSE/NDJSON summary
- [ ] Falls back to mock in dev

## Notes
Sprint 25. Rate-limits and retry logic on client.
