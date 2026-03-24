---
id: S20-02
sprint: 20
title: arrow-key-navigation-document-list
status: done
---

# S20-02 — Arrow-Key Navigation in DocumentList

## Goal
Enable ArrowUp/Down keyboard navigation through the document list with Enter to select.

## Acceptance Criteria
- [ ] ArrowUp/Down keys change focusedIndex in document list
- [ ] Enter key fires onSelect for focused document
- [ ] role="listbox" on .doc-list-items container

## Notes
onkeydown on .doc-list-items with ArrowUp/ArrowDown logic.
