---
id: S45-04
sprint: 45
title: export-modal-format-selector
status: done
---

# S45-04 — ExportModal — Format Selector (PDF/DOCX/EPUB)

## Goal
Extend ExportModal with a format selector radio group supporting PDF, DOCX, and EPUB.

## Acceptance Criteria
- [ ] Radio group with three options: PDF, DOCX, EPUB
- [ ] Default selection is PDF (existing behaviour preserved)
- [ ] Selecting DOCX or EPUB calls the appropriate export endpoint
- [ ] Download triggered with correct file extension

## Notes
Modify `src/lib/elements/ExportModal.svelte`.
