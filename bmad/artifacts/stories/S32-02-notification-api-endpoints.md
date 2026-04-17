---
id: S32-02
sprint: 32
title: notification-api-endpoints
status: done
---

# S32-02 — Notification API Endpoints

## Goal
Create /api/notifications endpoints for GET, PATCH, DELETE, and SSE stream with heartbeat.

## Acceptance Criteria
- [ ] GET /api/notifications returns { notifications[], unreadCount }
- [ ] PATCH /api/notifications/:id marks single as read
- [ ] DELETE /api/notifications clears all
- [ ] GET /api/notifications/stream SSE with heartbeat every 30s
- [ ] Rate limited, auth required

## Notes
Sprint 32.
