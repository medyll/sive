---
id: S44-05
sprint: 44
title: save-as-template
status: done
---

# S44-05 — Custom Template Save ("Save as template" Action)

## Goal
Allow users to save the current document as a custom template via a toolbar action.

## Acceptance Criteria
- [ ] "Save as template" action in document toolbar menu
- [ ] Prompts user for template name
- [ ] POSTs to `/api/templates` and stores in DB
- [ ] New template immediately available in TemplatePickerModal

## Notes
POST handler added to `src/routes/api/templates/+server.ts`.
