---
id: S32-05
sprint: 32
title: wire-notification-pushes
status: done
---

# S32-05 — Wire Notification Pushes into Existing Events

## Goal
Integrate push() calls at key server events: doc shared, collaborator edit, conflict detection.

## Acceptance Criteria
- [ ] doc_shared pushed when doc shared in /api/shares/+server.ts
- [ ] doc_edited pushed when collaborator saves
- [ ] conflict pushed from hooks.server.ts conflict detection

## Notes
No UI changes needed — server-side push() calls only.
