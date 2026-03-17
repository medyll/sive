# Sprint 28 — Presence Enhancements & Collaborative UX Polish

**Status:** done
**Focus:** Build on Sprints 14–15 presence/cursor foundation with enhanced UX, conflict detection, and performance optimizations.
**Dates:** 2026-03-17
**Context:** Sprints 14–15 implemented WebSocket server, PresenceList component, cursor visualization, and E2E validation. Sprint 28 adds collaborative awareness features.

---

## Stories

### S28-01: Activity indicator in document list
Enhance DocumentList to show presence badges per document:
- Show "N people viewing" count next to document title when shared.
- Color-code: green (1 viewer), blue (2–5), red (5+).
- Click to see live viewer names and their status (active/idle/offline).

### S28-02: Last-editor awareness & conflict UI
Create `ConflictIndicator` component:
- Show which user last saved the document and when.
- If another user is actively editing, warn with inline badge ("User X is editing…").
- Track unsaved changes per user (pending sync indicator).

### S28-03: Idle timeout & presence cleanup
Enhance presence system:
- Auto-mark user as idle after 30s of no cursor movement.
- Broadcast idle state to other viewers (fade remote cursor opacity).
- Clean up offline users after 2 minutes without heartbeat.

### S28-04: Collaborative edit history
Extend version timeline to show edits per user:
- Each version snapshot captures `{ userId, userName, timestamp }`.
- Timeline shows "User X saved at 3:45pm" instead of generic timestamps.
- Filter timeline by user.

### S28-05: Unit tests
- Activity badge calculation logic.
- Idle detection and cleanup timing.
- Conflict detection scenarios.

### S28-06: E2E tests
- Two users open same doc; verify activity badge updates.
- Simulate idle (no cursor movement); verify presence fades.
- Verify conflict indicator appears when both users are active.
- Close one client; verify cleanup after timeout.
