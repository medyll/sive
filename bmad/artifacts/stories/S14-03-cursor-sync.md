# S14-03 - Cursor Synchronization

**Status**: ✅ Done
**Priority**: High
**Points**: 5
**Branch**: `s14-01-websocket-server`

## Description

Implement real-time cursor position synchronization across collaborators. Track local and remote cursor positions with color coding, visibility debouncing, and stale cursor cleanup.

## Acceptance Criteria

- [x] Cursor store with local and remote tracking
- [x] Local cursor update with debouncing (100ms)
- [x] Remote cursor update and removal
- [x] Custom event dispatch ('cursor:sync')
- [x] Visibility calculation (hide after 5s of inactivity)
- [x] Stale cursor pruning (30s timeout)
- [x] Deterministic color assignment per clientId
- [x] Global store singleton pattern
- [x] Custom event listener setup/cleanup
- [x] Unit tests with >80% coverage

## Implementation Details

**File**: `/src/lib/editor/cursor-sync.ts`

### Core Types

```typescript
export interface CursorPosition {
  clientId: string;
  userId: string;
  line: number;
  column: number;
  selection?: {
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
  };
  color: string;
  lastUpdated: number;
}

export interface RemoteCursor extends CursorPosition {
  isVisible: boolean;
}
```

### Store Functions

- **createCursorSyncStore()**: Main store factory
  - `updateLocalCursor(line, column, selection)`: Update local cursor with debounce
  - `broadcastLocalCursor()`: Emit custom event
  - `updateRemoteCursor(clientId, cursor)`: Track remote cursor
  - `removeRemoteCursor(clientId)`: Delete remote cursor
  - `pruneStale()`: Remove cursors not updated in 30s
  - `getCursorColor(clientId)`: Hash-based color assignment
  - `clearRemoteCursors()`: Reset all remote cursors

### Derived Store

- **createVisibleCursorsStore()**: Filters to visible (recently updated) cursors

### Event Listener

- **createCursorSyncListener()**: Setup/cleanup for 'cursor:sync' events

### Color Palette

8 distinct colors for up to 8 simultaneous collaborators:
- `#FF6B6B`, `#4ECDC4`, `#FFE66D`, `#95E1D3`
- `#C7CEEA`, `#FF8B94`, `#A8D8EA`, `#AA96DA`

## Behavior

1. Local cursor updates debounced at 100ms intervals
2. Visibility timeout: 5s after last update
3. Complete removal: 30s after last update
4. Color assigned deterministically via clientId hash
5. Selection ranges tracked for multi-line selections

## Testing

Unit tests cover:
- Local cursor update and debouncing
- Remote cursor tracking
- Visibility calculation
- Stale cursor pruning
- Color assignment consistency
- Event listener lifecycle
- Store subscription

## Files Modified

- `/src/lib/editor/cursor-sync.ts` (new)
- `/src/lib/editor/cursor-sync.spec.ts` (new)

## Related Stories

- Depends on: S14-01
- Blocked by: None
- Enables: Cursor visualization component, S14-05, S14-06

## Integration Points

- Receives cursor updates from WebSocket messages
- Broadcasts via custom 'cursor:sync' event
- Used by editor component to render remote cursors
- Compatible with any editor (textarea, CodeMirror, Monaco, etc.)

## Performance Considerations

- Debounced local updates reduce network traffic
- 5s visibility timeout prevents cluttering
- 30s stale cleanup prevents memory leaks
- Derived store for efficient reactive updates
