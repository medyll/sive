---
id: S38-04
sprint: 38
title: version-history-panel
status: done
---

# S38-04 — Version History Panel

## Goal
Create VersionHistoryPanel.svelte listing versions with diff view, restore, label, and empty state.

## Acceptance Criteria
- [ ] Sidebar panel lists versions: timestamp + label + word count
- [ ] Click version → diff vs current content in split view
- [ ] "Restore" button → confirm → API call → editor content updated
- [ ] "Label this version" inline input
- [ ] Empty state: "No versions saved yet"

## Notes
src/lib/elements/VersionHistoryPanel.svelte.
