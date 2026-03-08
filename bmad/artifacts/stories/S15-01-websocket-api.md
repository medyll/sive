# S15-01 - WebSocket API Endpoint

**Status**: 🚀 In Progress
**Priority**: High
**Points**: 2
**Branch**: `s15-01-websocket-api`

## Description

Create `/api/ws` route handler for WebSocket connections. Integrate with the WebSocketServer singleton from S14-01, handle authentication, and manage client lifecycle.

## Acceptance Criteria

- [x] WebSocket endpoint at `/src/routes/api/ws/+server.ts`
- [x] Handle WebSocket upgrade requests
- [x] Authenticate with session/user
- [x] Route messages to WebSocketServer
- [x] Handle disconnections gracefully
- [x] Support multiple documents
- [x] Error handling and logging
- [x] Unit tests with >80% coverage

## Implementation Details

**File**: `/src/routes/api/ws/+server.ts`

### Endpoint Structure
```typescript
POST /api/ws
  - Upgrade: websocket
  - Auth: Session-based (must be logged in)
  - Query: ?documentId=<id>
  - Returns: WebSocket connection
```

### Connection Flow
1. Client requests WebSocket upgrade
2. Server validates session/user
3. Server extracts documentId and userId
4. Server creates unique clientId
5. Server registers client with WebSocketServer
6. Server attaches message handlers
7. Client-server bidirectional communication

### Message Handling
- Receive message from client
- Validate message structure
- Pass to WebSocketServer.handleMessage()
- Broadcast to document subscribers
- Handle errors and malformed messages

### Disconnection
- Remove client from WebSocketServer
- Broadcast 'leave' presence event
- Clean up resources

## Testing

Unit tests cover:
- Successful WebSocket upgrade
- Authentication validation
- Message routing
- Client registration/cleanup
- Error handling
- Multiple concurrent connections

## Files to Create

- `/src/routes/api/ws/+server.ts` (new)
- `/src/routes/api/ws/ws.spec.ts` (new)

## Integration Points

- Depends on: S14-01 (WebSocketServer)
- Enables: S15-02, S15-03 (UI integration)
- Uses: Session authentication from auth system

## Notes

- Server-side rendered (SvelteKit native WebSocket support)
- No external WebSocket library needed (built-in support)
- Automatic reconnection handled by client
- Heartbeat inherited from S14-01

## Related Stories

- Depends on: S14-01 → S14-06
- Enables: S15-02, S15-03, S15-04
- Part of: Sprint 15
