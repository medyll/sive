---
id: S10-01
sprint: 10
title: install-sdk-api-ai-endpoint
status: done
---

# S10-01 — Install SDK + /api/ai Server Endpoint

## Goal
Install @anthropic-ai/sdk and create the POST /api/ai endpoint handling suggestions, coherence, style, and chat actions.

## Acceptance Criteria
- [ ] @anthropic-ai/sdk installed and importable
- [ ] POST /api/ai handles all 4 actions: suggestions, coherence, style, chat
- [ ] Mock fallback returns stubs when ANTHROPIC_API_KEY absent

## Notes
Model: claude-haiku-4-5. Must be done before S10-02, S10-03, S10-04, S10-05.
