# S14-01 - WebSocket Server Setup

**Status**: ✅ Done
**Priority**: High
**Points**: 5
**Branch**: `s14-01-websocket-server`

## Description

Implement a WebSocket server for real-time document collaboration. The server manages client connections, routes messages between collaborators, and maintains presence state.

## Acceptance Criteria

- [x] WebSocketServer class with connection management
- [x] Client registration/unregistration with document subscription
- [x] Message broadcasting to document subscribers
- [x] Heartbeat mechanism (30s interval, 60s timeout)
- [x] Support for message types: presence, cursor, edit, conflict, heartbeat
- [x] Error handling for dead connections
- [x] Unit tests with >80% coverage
- [x] Singleton pattern with getWebSocketServer()

## Implementation Details

**File**: `/src/lib/server/ws.ts`

### Key Classes

- **WebSocketServer**: Main server class
  - `registerClient()`: Add client to document
  - `unregisterClient()`: Remove client and notify others
  - `broadcastToDocument()`: Send message to all subscribers
  - `handleMessage()`: Parse and route incoming messages
  - `getDocumentPresence()`: List active users on document
  - `shutdown()`: Cleanup on server stop

### Message Types

```typescript
type CollaborationMessage = {
  type: 'presence' | 'cursor' | 'edit' | 'conflict' | 'heartbeat';
  clientId: string;
  documentId: string;
  userId: string;
  payload?: Record<string, unknown>;
  timestamp: number;
};
```

### Connection Management

- Clients are tracked by `clientId` (unique per browser tab)
- Documents track subscriber sets for efficient broadcasting
- Heartbeat monitor runs every 30s, removes stale clients after 60s
- On connection loss, presence 'leave' event is broadcast

## Testing

Unit tests cover:
- Client registration and presence events
- Message broadcast to subscribers
- Heartbeat and timeout detection
- Connection cleanup
- Document subscription management

## Files Modified

- `/src/lib/server/ws.ts` (new)
- `/src/lib/server/ws.spec.ts` (new)

## Related Stories

- Depends on: None
- Blocked by: None
- Enables: S14-02, S14-03, S14-04
