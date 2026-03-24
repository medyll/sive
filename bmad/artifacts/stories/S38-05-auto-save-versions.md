---
id: S38-05
sprint: 38
title: auto-save-versions
status: done
---

# S38-05 — Auto-Save Versions on Document Save

## Goal
Hook into handleSave to POST a new version after every save when content has changed.

## Acceptance Criteria
- [ ] New version posted after every save
- [ ] Only saves if content changed (compare hash/length)

## Notes
Sprint 38.
