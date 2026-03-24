---
id: S19-04
sprint: 19
title: guest-status-endpoint
status: done
---

# S19-04 — GET /api/guest/status Endpoint

## Goal
Implement GET /api/guest/status returning { guestId, canConvert } for guest sessions.

## Acceptance Criteria
- [ ] GET /api/guest/status returns { guestId, canConvert }
- [ ] ALLOW_GUESTS flag checked
- [ ] Cookie-only MVP — no DB writes

## Notes
src/routes/api/guest/status/+server.ts.
