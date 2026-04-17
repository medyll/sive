# Sprint 42 — Analytics & Activity Tracking

**Sprint Duration:** 2026-03-17 → 2026-03-21
**Status:** ✅ Done
**Goal:** Track and surface per-document writing activity (word count history, session duration, daily stats) via an Analytics panel and server-side event log.

---

## Stories

| ID | Epic | Title | Points | Priority |
|---|---|---:|---|---|
| S42-01 | Analytics | `activity_events` DB table + Drizzle schema | 3 | Must |
| S42-02 | Analytics | analyticsStore — record session events | 3 | Must |
| S42-03 | Analytics | `/api/analytics` endpoint (GET summary, POST event) | 3 | Must |
| S42-04 | Analytics | AnalyticsPanel component — word count chart | 3 | Must |
| S42-05 | Analytics | Wire AnalyticsPanel into settings sidebar | 2 | Should |
| S42-06 | Testing | Unit tests — analyticsStore & API handler | 2 | Should |

**Total:** 16 points

---

## Acceptance Criteria
- [x] Writing sessions are logged to `activity_events` table
- [x] AnalyticsPanel shows daily word count for the last 7 days
- [x] GET `/api/analytics` returns aggregated stats per document
- [x] POST `/api/analytics` records a new activity event
- [x] Unit tests cover store logic and API handler
