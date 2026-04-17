---
id: S35-01
sprint: 35
title: template-store-server
status: done
---

# S35-01 — Template Store (Server)

## Goal
Create templates.ts with 6 built-in templates, user template store, and apply/save/delete operations.

## Acceptance Criteria
- [ ] 6 built-in templates: Short Story, Novel Chapter, Blog Post, Essay, Meeting Notes, Poem
- [ ] User template store: Map<userId, Template[]>, max 20
- [ ] getBuiltIn(), getUserTemplates(), getAllTemplates(), saveUserTemplate(), deleteUserTemplate(), applyTemplate()

## Notes
src/lib/server/templates.ts.
