# S14-05 - Integration Tests for Collaboration Features

**Status**: 🚀 In Progress
**Priority**: High
**Points**: 5
**Branch**: `s14-01-websocket-server`

## Description

Write integration tests that verify WebSocket server, presence indicators, and cursor sync work together in multi-client scenarios. Test real-world collaboration workflows including joins, leaves, cursor updates, and presence state changes.

## Acceptance Criteria

- [x] Integration test suite for WebSocket + presence flow
- [x] Test multi-client join/leave scenarios
- [x] Test cursor sync across multiple clients
- [x] Test presence state transitions (active → idle → offline)
- [x] Test message ordering and consistency
- [x] Test network error recovery
- [x] Test document-level isolation (multiple documents)
- [x] >80% code coverage for collaboration modules
- [x] All integration tests passing

## Test Scenarios

### Scenario 1: Basic Multi-Client Join
- Client A connects to doc1
- Client B connects to doc1
- Both receive presence updates
- Presence list accurate

### Scenario 2: Cursor Sync During Editing
- Client A updates cursor position
- Broadcast to Client B immediately
- Client B receives and updates store
- Color coding consistent

### Scenario 3: Client Disconnect
- Client A connected to doc1
- Client A disconnects
- Client B receives 'leave' event
- Presence updated

### Scenario 4: Multiple Documents
- Client A on doc1, Client B on doc2
- Each receives only their document's messages
- No cross-document interference

### Scenario 5: Presence State Machine
- Join → Active
- No updates for 5s → Idle
- No updates for 30s → Removed
- Reconnect → Active again

### Scenario 6: Concurrent Edits
- Client A edits at pos 0-10
- Client B edits at pos 50-60 (concurrent)
- Both edits broadcast and received
- No data loss

## Files to Create

- `/src/lib/server/collaboration.spec.ts` — Integration tests
- `/src/lib/editor/presence-store.spec.ts` — Presence state management tests

## Key Utilities

- Mock WebSocket clients
- Fake delay simulation (latency)
- Message capture and verification
- State snapshot comparisons

## Success Criteria

- All integration tests pass
- Coverage >80% for:
  - `ws.ts`
  - `cursor-sync.ts`
  - `PresenceList.svelte` (via store tests)
- No flaky tests
- Tests complete in <5 seconds

## Related Stories

- Depends on: S14-01, S14-02, S14-03, S14-04
- Enables: S14-06 (E2E tests)
