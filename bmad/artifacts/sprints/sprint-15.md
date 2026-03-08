# Sprint 15 - Real-time Collaboration Integration

Focus: Integrate WebSocket server with UI, deploy collaboration features, and test in multi-user environment.

## Stories

- **S15-01**: WebSocket API endpoint — Create `/api/ws` route handler for real WebSocket connections
- **S15-02**: Presence UI integration — Wire PresenceList component into editor toolbar
- **S15-03**: Cursor sync UI visualization — Render remote cursors in editor with color coding
- **S15-04**: Server deployment setup — Configure WebSocket server for production
- **S15-05**: Performance optimization — Optimize for high-latency networks, stress testing
- **S15-06**: Documentation & E2E validation — Update docs, final E2E tests with real server

## Status

- S15-01: ⏳ Pending
- S15-02: ⏳ Pending
- S15-03: ⏳ Pending
- S15-04: ⏳ Pending
- S15-05: ⏳ Pending
- S15-06: ⏳ Pending

## Key Objectives

- ✅ Integrate WebSocket foundation (S14) with UI
- ✅ Real-time presence visibility in editor
- ✅ Remote cursor rendering with proper styling
- ✅ Production-ready server setup
- ✅ Performance validated under load
- ✅ Comprehensive documentation

## Technical Requirements

### WebSocket API Route
- File: `/src/routes/api/ws/+server.ts`
- Handle WebSocket upgrade requests
- Route to WebSocketServer singleton
- Implement authentication (session-based)
- Error handling and reconnection logic

### Presence Integration
- File: `/src/lib/elements/Editor.svelte` or toolbar
- Display PresenceList component
- Subscribe to presence updates
- Handle join/leave notifications

### Cursor Visualization
- File: `/src/lib/elements/RemoteCursor.svelte` (new)
- Render remote cursor overlays
- Color-coded by client ID
- Update position in real-time
- Fade out after 5s inactivity

### Server Setup
- Files: WebSocket server configuration
- Port assignment (default: 3000 for dev, configurable)
- Process management (pm2 or equivalent)
- Health check endpoint
- Connection limit handling

## Dependencies

- Depends on: S14-01 → S14-06 (all foundation stories)
- Architecture: Single WebSocket server instance per deployment
- Auth: Integrated with existing session management
- UI: Svelte components with reactive stores

## Success Criteria

- WebSocket connections work in browser
- Presence list updates in real-time across tabs/windows
- Remote cursors visible and synchronized
- Server handles 10+ concurrent connections
- No memory leaks over 1-hour sustained use
- Documentation complete
- All E2E tests pass with real server

## Estimated Timeline

- S15-01: 2 points (API endpoint)
- S15-02: 3 points (UI integration)
- S15-03: 3 points (Cursor rendering)
- S15-04: 2 points (Server setup)
- S15-05: 3 points (Performance)
- S15-06: 2 points (Documentation)
- **Total: 15 points**

## Blockers

- None (S14 foundation complete)

## Notes

- S14-01 through S14-06 must be fully tested before integration
- Real WebSocket server will replace mock/event-based testing
- Performance baseline needed before optimization
- Consider load testing with Artillery or k6
