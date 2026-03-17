# Sprint 35 — Document Templates

**Status:** planned
**Focus:** Create, use, and manage document templates — starter content for new documents.
**Dates:** 2026-03-17

---

## Stories

### S35-01: Template store (server)
Create `src/lib/server/templates.ts`:
- Built-in templates: Short Story, Novel Chapter, Blog Post, Essay, Meeting Notes, Poem
- Schema: `{ id, name, description, content, category, builtIn }`
- In-memory user template store: Map<userId, Template[]>
- `getBuiltIn()` — returns built-in templates
- `getUserTemplates(userId)` — returns user's custom templates
- `getAllTemplates(userId)` — built-in + user combined
- `saveUserTemplate(userId, template)` — max 20 user templates
- `deleteUserTemplate(userId, id)` — user templates only
- `applyTemplate(template, title?)` — returns `{ title, content }`

### S35-02: Templates API
Create `src/routes/api/templates/+server.ts`:
- `GET /api/templates` — list all (built-in + user)
- `POST /api/templates` — save custom template from current doc content
- `DELETE /api/templates/:id` — delete user template
- Rate-limited, auth-required for write ops

### S35-03: Template picker UI
Create `src/lib/elements/TemplatePicker.svelte`:
- Modal triggered by "New from template" button (or command palette command)
- Two tabs: Built-in | My Templates
- Grid of template cards: name + description + category badge + preview snippet
- Click → confirm dialog "Create document from template?"
- Confirm → dispatches `template:apply` event with `{ templateId, title }`
- Empty state for My Templates: "Save your first template from any document"

### S35-04: "Save as template" action
Add to document actions menu / command palette:
- "Save as Template" → modal with name + description inputs
- On confirm → POST /api/templates
- Success toast: "Template saved"
- Wire `template:apply` event in app layout → calls `createDocument` action then populates content

### S35-05: Unit tests
- Built-in templates exist and have non-empty content
- `saveUserTemplate` respects max 20 limit
- `deleteUserTemplate` only deletes user-owned templates
- `applyTemplate` returns correct title + content

### S35-06: E2E tests
- Open template picker → see built-in templates
- Select a template → new document created with template content
- Save current doc as template → appears in My Templates tab
- Delete user template → removed from list
- Command palette "New from template" triggers picker
