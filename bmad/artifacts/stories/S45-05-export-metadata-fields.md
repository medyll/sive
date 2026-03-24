---
id: S45-05
sprint: 45
title: export-metadata-fields
status: done
---

# S45-05 — Metadata Fields (Title, Author) in ExportModal

## Goal
Add title and author input fields to ExportModal, pre-filled from document and user profile.

## Acceptance Criteria
- [ ] Title field pre-filled with current document title
- [ ] Author field pre-filled with logged-in user's display name
- [ ] Both fields editable before export
- [ ] Values passed to export endpoint in request body

## Notes
Modify `src/lib/elements/ExportModal.svelte`.
