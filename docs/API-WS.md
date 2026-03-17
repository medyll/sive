# WebSocket API Reference

## Endpoint

```
ws://localhost:3000/api/ws?documentId=<id>
wss://your-domain.com/api/ws?documentId=<id>  // Production with SSL
```

## Authentication

All WebSocket connections require an active user session. Connection will be rejected if:
- No session/user found
- Session expired
- documentId parameter missing

## Message Types

### 1. Presence

**Client → Server**
```typescript
{
  type: 'presence',
  clientId: 'c1',
  documentId: 'doc1',
  userId: 'user1',
  payload: {
    action: 'join' | 'leave',
    userId: 'user1',
    clientId: 'c1'
  },
  timestamp: 1704067200000
}
```

**Server → Client (broadcast)**
```typescript
{
  type: 'presence',
  clientId: 'c2',
  documentId: 'doc1',
  userId: 'user2',
  payload: {
    action: 'join' | 'leave',
    userId: 'user2',
    clientId: 'c2'
  },
  timestamp: 1704067200000
}
```

### 2. Cursor

**Client → Server**
```typescript
{
  type: 'cursor',
  clientId: 'c1',
  documentId: 'doc1',
  userId: 'user1',
  payload: {
    line: 5,
    column: 10,
    selection?: {
      startLine: 5,
      startColumn: 8,
      endLine: 5,
      endColumn: 10
    }
  },
  timestamp: 1704067200000
}
```

**Server → Client (broadcast)**
```typescript
{
  type: 'cursor',
  clientId: 'c1',
  documentId: 'doc1',
  userId: 'user1',
  payload: {
    line: 5,
    column: 10
  },
  timestamp: 1704067200000
}
```

### 3. Edit

**Client → Server**
```typescript
{
  type: 'edit',
  clientId: 'c1',
  documentId: 'doc1',
  userId: 'user1',
  payload: {
    type: 'insert' | 'delete',
    pos: 100,
    text?: 'new text',
    length?: 8
  },
  timestamp: 1704067200000
}
```

**Server → Client (broadcast)**
```typescript
{
  type: 'edit',
  clientId: 'c1',
  documentId: 'doc1',
  userId: 'user1',
  payload: {
    type: 'insert' | 'delete',
    pos: 100,
    text?: 'new text',
    length?: 8
  },
  timestamp: 1704067200000
}
```

### 4. Conflict

**Server → Client**
```typescript
{
  type: 'conflict',
  clientId: 'c2',
  documentId: 'doc1',
  userId: 'user2',
  payload: {
    type: 'concurrent_edit',
    position: 50,
    remoteChange: { type: 'insert', text: 'remote' },
    localChange: { type: 'insert', text: 'local' },
    resolution: 'server_wins' | 'client_wins' | 'manual'
  },
  timestamp: 1704067200000
}
```

### 5. Heartbeat

**Server → Client**
```typescript
{
  type: 'heartbeat',
  timestamp: 1704067200000
}
```

**Client → Server (response)**
```typescript
{
  type: 'heartbeat',
  timestamp: 1704067200000
}
```

## Client-Side Usage

### Connect to WebSocket

```typescript
import { getWebSocketServer } from '$lib/server/ws';
import { createCursorSyncStore } from '$lib/editor/cursor-sync';
import { createPresenceStore } from '$lib/editor/presence-store';

// In a SvelteKit component
<script>
  import { onMount } from 'svelte';

  let ws: WebSocket;
  const cursorStore = createCursorSyncStore();
  const presenceStore = createPresenceStore();

  onMount(() => {
    // Connect
    const documentId = 'doc1';
    ws = new WebSocket(`ws://localhost:3000/api/ws?documentId=${documentId}`);

    ws.onopen = () => {
      console.log('Connected');
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case 'presence':
          presenceStore.updatePresence(message);
          break;
        case 'cursor':
          cursorStore.updateRemoteCursor(message.clientId, message.payload);
          break;
        case 'edit':
          handleRemoteEdit(message.payload);
          break;
        case 'heartbeat':
          // Respond to heartbeat
          ws.send(JSON.stringify({
            type: 'heartbeat',
            timestamp: Date.now()
          }));
          break;
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('Disconnected');
      // Attempt reconnection
      setTimeout(connect, 1000);
    };

    return () => {
      ws.close();
    };
  });
</script>
```

### Send Cursor Update

```typescript
// Listen for editor cursor changes and send updates
editor.onCursorMove = (line, column) => {
  const message = {
    type: 'cursor',
    clientId: clientId,
    documentId: documentId,
    userId: userId,
    payload: { line, column },
    timestamp: Date.now()
  };

  ws.send(JSON.stringify(message));
};
```

### Listen to Presence

```typescript
// Store automatically updates on presence events
// In component:
import { presenceStore } from '$lib/editor/presence-store';

{#each $presenceStore.users as user}
  <div>{user.name} ({user.status})</div>
{/each}
```

## Error Handling

### Connection Failures

```typescript
ws.onerror = (error) => {
  console.error('Connection error:', error);
  // Implement reconnection logic
};

ws.onclose = (event) => {
  if (!event.wasClean) {
    console.error('Unexpected closure');
    reconnectWithBackoff();
  }
};
```

### Reconnection Strategy

```typescript
let reconnectAttempts = 0;
const MAX_RETRIES = 10;
const INITIAL_DELAY = 1000;

function reconnectWithBackoff() {
  if (reconnectAttempts >= MAX_RETRIES) {
    console.error('Max reconnection attempts reached');
    return;
  }

  const delay = INITIAL_DELAY * Math.pow(2, reconnectAttempts);
  console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts + 1})`);

  setTimeout(() => {
    connect();
    reconnectAttempts++;
  }, delay);
}
```

## Rate Limiting

- Max 1000 messages per minute per connection
- Connections limited to 100 per server (configurable)
- Message queue size: 1000 (drops oldest if exceeded)

## Configuration

See [DEPLOYMENT.md](./DEPLOYMENT.md) for:
- Environment variables
- Performance tuning
- SSL/TLS setup
- Scaling configuration

## Examples

See [EXAMPLES.md](./EXAMPLES.md) for complete code examples.

## Troubleshooting

See [TROUBLESHOOTING-WS.md](./TROUBLESHOOTING-WS.md) for common issues and solutions.
