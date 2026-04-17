---
id: S19-05
sprint: 19
title: guest-convert-endpoint
status: done
---

# S19-05 — POST /api/guest/convert Endpoint

## Goal
Implement POST /api/guest/convert that validates payload and stubs conversion logic.

## Acceptance Criteria
- [ ] POST /api/guest/convert validates payload
- [ ] Conversion logic stubbed (no real DB writes in MVP)
- [ ] ALLOW_GUESTS flag checked

## Notes
src/routes/api/guest/convert/+server.ts. Cookie-only MVP.
