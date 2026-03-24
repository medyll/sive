---
id: S13-03
sprint: 13
title: preferences-persistence-server
status: done
---

# S13-03 — Preferences Persistence Server

## Goal
Add a server action to persist user preferences when logged in and load them on session start.

## Acceptance Criteria
- [ ] Server action saves preferences to DB for authenticated users
- [ ] Preferences loaded into session on login
- [ ] Falls back to localStorage for unauthenticated users

## Notes
Keep server persistence behind auth.
