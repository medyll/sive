# Sprint 14 - Real-time Collaboration Foundation

This sprint establishes the foundation for real-time multi-user document collaboration, adding WebSocket infrastructure, presence indicators, and concurrent editing safeguards.

## Todos

- **s14-01**: WebSocket server setup — Implement WebSocket server for real-time communication; set up connection management and heartbeat. Files: `src/lib/server/ws.ts`, `src/api/ws` (pending)
- **s14-02**: Presence indicators — Show online users in document header with avatars and status; emit presence events on connect/disconnect. Files: `src/lib/elements/PresenceList.svelte` (pending)
- **s14-03**: Real-time cursor sync — Broadcast cursor positions and selections from all connected users. Files: `src/lib/editor/cursor-sync.ts` (pending)
- **s14-04**: Conflict detection — Detect concurrent edits and warn users; implement simple operational transform (OT) basics. Files: `src/lib/editor/ot-adapter.ts` (pending)
- **s14-05**: Unit tests for collaboration — Test WebSocket server, presence, cursor sync, and conflict detection (pending)
- **s14-06**: E2E collaboration flow — Multi-tab Playwright tests for concurrent editing scenarios (pending)

## Notes

- WebSocket logic should be stateless where possible (use Redis or in-memory store for dev)
- Presence should timeout after 30s of inactivity
- Conflict detection should be non-destructive (highlight conflicts, ask user to resolve)
- E2E tests should simulate multiple users joining the same document

## Success Criteria

- WebSocket connects on document open
- Presence list updates in real-time
- Cursor positions sync across tabs/windows
- Conflict warnings appear when simultaneous edits detected
- All tests pass

