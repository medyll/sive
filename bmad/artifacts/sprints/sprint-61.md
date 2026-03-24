# Sprint 61 — PWA Polish & Install Flow

**Sprint Duration:** 2026-03-24
**Status:** 🚀 Active
**Goal:** Make Sive a first-class PWA — wire the existing InstallPrompt component, complete the service worker cache strategy, and surface an offline-ready badge in the toolbar.

---

## Stories

### S61-01 — Wire InstallPrompt component
**File:** `src/lib/elements/InstallPrompt.svelte`
- Listen for `beforeinstallprompt` event on `window`
- Store the deferred prompt event; show the InstallPrompt banner after the user has made 2 document saves (engagement gate)
- On "Install" click: call `prompt()` on the deferred event, track outcome in localStorage (`sive:pwa:installed`)
- On dismiss: hide and don't show again for 7 days

### S61-02 — Mount InstallPrompt in app layout
**File:** `src/routes/+layout.svelte`
- Import and mount `<InstallPrompt />` at root layout level
- Only render when not already installed (`sive:pwa:installed !== 'true'`)

### S61-03 — Service worker cache strategy
**File:** `src/service-worker.ts`
- Cache-first for static assets (`/_app/immutable/**`)
- Network-first with offline fallback for API routes (`/api/**`)
- Precache the app shell on install
- On activate: delete old caches

### S61-04 — Offline-ready badge in toolbar
**File:** `src/lib/elements/EditorToolbar.svelte`
- Show a small "Offline ready ✓" chip when service worker is active and cache is warm
- Use `navigator.serviceWorker.ready` + a custom `sw:cached` postMessage event
- Hide chip while online (only show as reassurance when offline)

### S61-05 — Unit tests Sprint 61
- InstallPrompt: engagement gate (shows after 2 saves), dismiss sets cooldown, install clears prompt
- `pwaStore`: engagement count increment, installed flag, cooldown logic

### S61-06 — E2E Sprint 61
- After 2 saves, install banner appears
- Dismiss hides banner
- Offline banner + offline-ready chip both visible when network is offline

---

## Acceptance Criteria
- [ ] Install prompt appears after 2 document saves
- [ ] Dismissing sets 7-day cooldown
- [ ] Service worker caches static assets on install
- [ ] Offline-ready chip shown in toolbar when SW active
- [ ] 0 new test failures
