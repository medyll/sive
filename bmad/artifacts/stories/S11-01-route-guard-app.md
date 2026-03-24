---
id: S11-01
sprint: 11
title: route-guard-app
status: done
---

# S11-01 — Route Guard on /app

## Goal
Redirect unauthenticated users from /app to /auth when not in mock mode.

## Acceptance Criteria
- [ ] Guard redirects to /auth when !isMock && !user
- [ ] Mock mode bypasses the guard
- [ ] Authenticated users pass through

## Notes
Sprint 11 auth hardening.
