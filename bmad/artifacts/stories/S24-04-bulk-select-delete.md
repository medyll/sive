---
id: S24-04
sprint: 24
title: bulk-select-delete
status: done
---

# S24-04 — Bulk Select + Delete

## Goal
Allow selecting multiple documents and deleting them in bulk.

## Acceptance Criteria
- [ ] Checkbox per doc item (visible in bulkMode)
- [ ] Select all / Deselect all toggle in header when ≥1 item checked
- [ ] "Delete selected (N)" danger button in header
- [ ] Bulk mode activates on Shift+click or Ctrl+Shift+X

## Notes
onBulkDelete(ids) prop; page serially calls deleteDocument for each.
