---
id: S37-02
sprint: 37
title: cursor-color-assignment
status: done
---

# S37-02 — Cursor Color Assignment

## Goal
Assign stable colors per userId from an 8-color palette using hash-based index cycling.

## Acceptance Criteria
- [ ] getCursorColor(userId) returns consistent color for same userId
- [ ] Palette: indigo, rose, emerald, amber, sky, violet, pink, teal
- [ ] Cycles for >8 users

## Notes
src/lib/cursorColors.ts.
