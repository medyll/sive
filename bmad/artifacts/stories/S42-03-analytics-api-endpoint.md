---
id: S42-03
sprint: 42
title: analytics-api-endpoint
status: done
---

# S42-03 — /api/analytics Endpoint

## Goal
REST endpoint for reading aggregated stats and writing new activity events.

## Acceptance Criteria
- [ ] GET `/api/analytics?docId=X` returns 7-day word count summary
- [ ] POST `/api/analytics` inserts a new activity_event row
- [ ] Responses are JSON with appropriate status codes
- [ ] Auth guard: only authenticated users can access

## Notes
Handler at `src/routes/api/analytics/+server.ts`.
