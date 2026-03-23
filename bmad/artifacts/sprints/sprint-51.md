# Sprint 51 — Command Palette, Notifications & SummaryPanel Fix

**Sprint Duration:** 2026-03-23
**Status:** 🚀 Active
**Goal:** Wire up existing unconnected components (CommandPalette, NotificationBell, WritingGoalBar) and fix the SummaryPanel browser test crash.

---

## Stories

### S51-01: Fix SummaryPanel browser test crash
**File:** `src/lib/elements/SummaryPanel.svelte.spec.ts`
**Problem:** Browser pool crashes when running SummaryPanel tests — `ReadableStream` in `makeSseStream` causes the Playwright worker to close unexpectedly.
**Fix:** Replace `ReadableStream` constructor in the test helper with a simpler mock that returns a pre-encoded body, or use `vi.fn()` to stub fetch entirely without streaming.

### S51-02: Wire CommandPalette with Ctrl+K
**File:** `src/lib/elements/CommandPalette.svelte`
**Task:** Verify CommandPalette is mounted in the app layout and responds to `Ctrl+K`. If not mounted, add it to `+layout.svelte`. Add commands: New Document, Search, Open Settings, Toggle Focus Mode.

### S51-03: Wire NotificationBell with unread count
**File:** `src/lib/elements/NotificationBell.svelte`
**Task:** Ensure NotificationBell is in the toolbar. Create `notificationStore.svelte.ts` if missing — tracks unread count (new share invites, collaboration activity). Show badge when count > 0.

### S51-04: WritingGoalBar integration
**File:** `src/lib/elements/WritingGoalBar.svelte`
**Task:** Connect WritingGoalBar to the WordCountBadge data. Allow user to set a daily word goal in settings. Show progress bar in editor toolbar.

### S51-05: Unit tests for S51-01 through S51-04
- SummaryPanel browser tests (fixed)
- CommandPalette: test open/close, command execution
- NotificationStore: unread count increment/dismiss
- WritingGoalBar: goal persistence, progress calculation

### S51-06: E2E smoke for new integrations
- Ctrl+K opens command palette
- Notification bell shows badge on new notification
- Writing goal bar visible in editor

---

## Acceptance Criteria
- [ ] Browser pool: 22/22 files passing (SummaryPanel fixed)
- [ ] CommandPalette opens on Ctrl+K
- [ ] NotificationBell wired in toolbar
- [ ] WritingGoalBar shows progress
- [ ] 0 new test failures introduced
