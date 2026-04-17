---
id: S23-03
sprint: 23
title: aipanel-doc-context-toggle
status: done
---

# S23-03 — AIPanel "Use Document as Context" Toggle + Wire Context into Chat

## Goal
Add a toggle above chat input that passes document content as ctx param to the stream endpoint.

## Acceptance Criteria
- [ ] Toggle "Use document as context" above chat input (default: on)
- [ ] When on, encodes editorContent.slice(0,2000) as base64 and passes as ctx
- [ ] Toggle state persisted in localStorage (sive.aiUseDocContext)
- [ ] "Doc context active" pill shown in chat header when toggled on with content

## Notes
Sprint 23.
