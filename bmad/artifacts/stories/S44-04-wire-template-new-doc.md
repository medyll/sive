---
id: S44-04
sprint: 44
title: wire-template-new-doc
status: done
---

# S44-04 — Wire Template Selection into New-Document Flow

## Goal
Integrate TemplatePickerModal into the existing new-document creation flow in the app page.

## Acceptance Criteria
- [ ] "New document" button opens TemplatePickerModal before creating doc
- [ ] Selected template content pre-fills EditorPanel
- [ ] Document title defaults to template name
- [ ] Blank option creates empty document as before

## Notes
Modify `src/routes/app/+page.svelte`.
