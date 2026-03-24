---
id: S23-02
sprint: 23
title: stream-doc-context
status: done
---

# S23-02 — /api/ai/stream Accepts docContext

## Goal
Extend the stream endpoint to read optional ctx query param (base64 doc excerpt, max 2000 chars) and prepend it to the system prompt.

## Acceptance Criteria
- [ ] ctx query param read and base64-decoded
- [ ] System prompt prepended with document excerpt block
- [ ] Stub mode includes context mention when ctx set
- [ ] Excerpt truncated to 2000 chars

## Notes
System prompt format: "The user is currently writing the following document excerpt: <document>{ctx}</document>"
