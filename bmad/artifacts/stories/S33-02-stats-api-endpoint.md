---
id: S33-02
sprint: 33
title: stats-api-endpoint
status: done
---

# S33-02 — Stats API Endpoint

## Goal
Create /api/stats and /api/stats/doc/:id endpoints returning UserStats and DocStats respectively.

## Acceptance Criteria
- [ ] GET /api/stats returns UserStats for authenticated user
- [ ] GET /api/stats/doc/:id returns DocStats for one document
- [ ] Rate-limited; guest returns zeroed stats

## Notes
src/routes/api/stats/+server.ts.
