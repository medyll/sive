---
id: S35-04
sprint: 35
title: save-as-template
status: done
---

# S35-04 — "Save as Template" Action

## Goal
Add Save as Template action to document actions menu/command palette with name+description modal.

## Acceptance Criteria
- [ ] "Save as Template" in document actions or command palette
- [ ] Modal with name + description inputs
- [ ] On confirm → POST /api/templates → success toast "Template saved"
- [ ] template:apply event wired → createDocument then populate content

## Notes
Sprint 35.
