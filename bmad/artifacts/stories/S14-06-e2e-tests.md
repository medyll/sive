# S14-06 - E2E Tests for Multi-User Collaboration

**Status**: 🚀 In Progress
**Priority**: High
**Points**: 8
**Branch**: `s14-01-websocket-server`

## Description

Write end-to-end tests using Playwright that verify real-time collaborative editing across multiple browser contexts. Test realistic user workflows with concurrent editing, presence updates, and cursor synchronization.

## Acceptance Criteria

- [x] Multi-user document editing scenario (2+ users)
- [x] Real-time cursor position visibility
- [x] Presence list updates on join/leave
- [x] Concurrent text edits with proper state
- [x] User status transitions (active/idle)
- [x] Network resilience testing (simulated latency)
- [x] Document isolation testing
- [x] All E2E tests passing
- [x] Tests complete in <30 seconds

## Test Scenarios

### Scenario 1: Two Users Edit Same Document
1. User A opens document
2. User B joins same document
3. Both see each other in presence list
4. User A types text at position 0-10
5. User B types at position 50-60 (concurrent)
6. Both receive real-time updates
7. Document state consistent

### Scenario 2: Presence Updates
1. User A in doc1
2. User B joins doc1 → A sees B appear
3. User C joins doc1 → A and B see C appear
4. User B leaves → A and C see B disappear
5. All get notifications

### Scenario 3: Cursor Visibility
1. User A opens document
2. User B joins with cursor at (5, 0)
3. User A sees blue cursor for B
4. User B cursor not updated for 5s → cursor fades
5. User B types → cursor visible again

### Scenario 4: Document Isolation
1. User A edits doc1
2. User B edits doc2 (different document)
3. A's edits don't affect B's doc
4. Presence lists separate

### Scenario 5: Disconnect & Reconnect
1. User A in doc1
2. User B in doc1
3. A disconnects
4. B sees A disappear from presence
5. A reconnects
6. B sees A reappear
7. Document state synced

## Files to Create

- `/e2e/collaboration.spec.ts` — Multi-user collaboration tests

## Fixtures & Utilities

- `fixtures/multi-user.ts` — Helper for managing multiple user contexts
- `fixtures/presence-assertions.ts` — Assertion helpers for presence tracking
- Custom Playwright fixture for dismissing onboarding modal

## Coverage

- Multi-user concurrent editing
- Real-time synchronization
- Presence tracking lifecycle
- Document isolation
- Network resilience
- State consistency

## Success Criteria

- All E2E tests pass
- No flaky tests (run 3x stable)
- <30 second test suite duration
- Proper async handling for real-time updates
- Clean fixture setup/teardown

## Related Stories

- Depends on: S14-01, S14-02, S14-03, S14-05
- Completes: Sprint 14
