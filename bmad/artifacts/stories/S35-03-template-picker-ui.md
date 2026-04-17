---
id: S35-03
sprint: 35
title: template-picker-ui
status: done
---

# S35-03 — Template Picker UI

## Goal
Create TemplatePicker.svelte modal with Built-in and My Templates tabs and template card grid.

## Acceptance Criteria
- [ ] Modal with Built-in | My Templates tabs
- [ ] Grid of template cards: name + description + category badge + preview snippet
- [ ] Click → confirm dialog "Create document from template?"
- [ ] Dispatches template:apply event with { templateId, title }
- [ ] Empty state for My Templates

## Notes
src/lib/elements/TemplatePicker.svelte.
