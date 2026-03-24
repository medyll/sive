# Sprint 44 — Template Engine

**Sprint Duration:** 2026-03-17 → 2026-03-21
**Status:** ✅ Done
**Goal:** Allow users to create new documents from predefined templates (blog post, short story, essay) with pre-filled structure and placeholder text.

---

## Stories

| ID | Epic | Title | Points | Priority |
|---|---|---:|---|---|
| S44-01 | Templates | `templates` DB table + seed data (3 templates) | 3 | Must |
| S44-02 | Templates | `/api/templates` GET endpoint | 2 | Must |
| S44-03 | Templates | TemplatePickerModal component | 3 | Must |
| S44-04 | Templates | Wire template selection into new-document flow | 3 | Must |
| S44-05 | Templates | Custom template save ("Save as template" action) | 2 | Should |
| S44-06 | Testing | Unit tests — template API handler & TemplatePickerModal | 2 | Should |

**Total:** 15 points

---

## Acceptance Criteria
- [x] 3 built-in templates available (blog post, short story, essay)
- [x] TemplatePickerModal opens when creating a new document
- [x] Selecting a template pre-fills EditorPanel with placeholder content
- [x] Users can save the current document as a custom template
- [x] Templates persisted in DB and reloaded on next session
- [x] Unit tests cover API handler and modal rendering
