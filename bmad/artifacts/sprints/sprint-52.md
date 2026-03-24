# Sprint 52 — Notification Triggers, Settings Writing Goal & UX Wiring

**Sprint Duration:** 2026-03-24
**Status:** 🗓 Planned
**Goal:** Close the loop on Sprint 51 integrations — wire real notification events from app actions, add writing goal to Settings page, and handle `notification:navigate` routing.

---

## Stories

### S52-01: Wire notification events from app actions
**File:** `src/routes/app/+page.svelte` + `src/routes/api/notifications/+server.ts`
**Task:** Dispatch real server-side notifications when:
- A document is shared (`doc_shared`) → triggered after `ShareModal` confirms
- A conflict is detected (`conflict`) → triggered from `ConflictIndicator` when a concurrent edit is detected
Push these to the SSE stream so `NotificationBell` shows a live badge.

### S52-02: Handle `notification:navigate` event in app page
**File:** `src/routes/app/+page.svelte`
**Task:** Listen to the `notification:navigate` CustomEvent dispatched by `NotificationBell` when a notification is clicked. Set `activeDocumentId` to `event.detail.docId` to jump to the referenced document.

### S52-03: Writing goal target in Settings page
**File:** `src/routes/settings/+page.svelte`
**Task:** Add a "Daily Writing Goal" field to the settings form. Read/write via `goalsStore.setDailyTarget()`. Show current streak next to the field.

### S52-04: Palette command — Search Documents
**File:** `src/lib/commandRegistry.ts`
**Task:** Add a `doc:search` command that opens / focuses the document search input in the sidebar (dispatch `CustomEvent('palette:focusSearch')`). Wire the handler in `+page.svelte` to focus the `DocumentList` search input.

### S52-05: Unit tests for S52-01 to S52-04
- Notification event dispatching: verify POST to `/api/notifications` on share
- `notification:navigate` handler: verify `activeDocumentId` update
- Settings writing goal: verify `goalsStore.setDailyTarget` is called
- Command registry: verify `doc:search` command exists and dispatches event

### S52-06: E2E smoke for Sprint 52
- Share a document → notification bell badge appears
- Click notification → app jumps to referenced doc
- Settings page shows writing goal field
- Palette `doc:search` focuses sidebar search

---

## Acceptance Criteria
- [ ] Sharing a doc triggers a notification visible in the bell
- [ ] `notification:navigate` routes to the correct document
- [ ] Settings page has writing goal input persisted via `goalsStore`
- [ ] `doc:search` command registered and functional
- [ ] 0 new test failures introduced
