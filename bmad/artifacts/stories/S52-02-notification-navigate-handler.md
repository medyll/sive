---
id: S52-02
sprint: 52
title: notification-navigate-handler
status: done
---

# S52-02 — Handle notification:navigate Event in App Page

## Goal
Listen to the `notification:navigate` CustomEvent from NotificationBell and jump to the referenced document.

## Acceptance Criteria
- [ ] App page listens for `notification:navigate` CustomEvent
- [ ] `event.detail.docId` sets `activeDocumentId` in the document store
- [ ] The referenced document becomes active in EditorPanel
- [ ] Works for both `doc_shared` and `conflict` notification types

## Notes
File: `src/routes/app/+page.svelte`.
