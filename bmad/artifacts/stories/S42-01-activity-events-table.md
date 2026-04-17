---
id: S42-01
sprint: 42
title: activity-events-table
status: done
---

# S42-01 — activity_events DB Table + Drizzle Schema

## Goal
Define the `activity_events` Drizzle table to store per-session writing activity.

## Acceptance Criteria
- [ ] Table has columns: id, userId, documentId, eventType, wordCount, duration, createdAt
- [ ] Migration applied successfully against SQLite
- [ ] Schema exported from `src/lib/server/db/schema.ts`

## Notes
eventType enum: session_start, session_end, word_milestone.
