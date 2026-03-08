# Sprint 14 - Real-time Collaboration Foundation

Focus: Implement WebSocket server, presence indicators, and cursor synchronization for multi-user collaborative editing.

## Stories

- **S14-01**: WebSocket server setup — Implement connection management, message routing, and heartbeat mechanism
- **S14-02**: Presence indicators — Display list of online collaborators with status (active/idle/offline)
- **S14-03**: Cursor sync — Real-time cursor position tracking and visualization across clients
- **S14-04**: Conflict detection — Detect and resolve edit conflicts (already implemented)
- **S14-05**: Unit tests for collaboration features
- **S14-06**: E2E tests for multi-user scenarios

## Status
- S14-01: ✅ Done
- S14-02: ✅ Done
- S14-03: ✅ Done
- S14-04: ✅ Done
- S14-05: ⏳ In progress
- S14-06: ⏳ Pending

## Key Features
- WebSocket server with client connection management
- Presence tracking (active/idle/offline states)
- Real-time cursor position synchronization with color coding
- Conflict detection for concurrent edits
- Heartbeat mechanism for connection health monitoring

## Architecture
- Server: `/src/lib/server/ws.ts` — WebSocketServer class
- Components: `/src/lib/elements/PresenceList.svelte` — Online users display
- Stores: `/src/lib/editor/cursor-sync.ts` — Cursor state management
- Utilities: Conflict detection logic
