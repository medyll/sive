# S15-02 - Presence UI Integration

**Status**: 🚀 In Progress
**Priority**: High
**Points**: 3
**Branch**: `s15-01-websocket-api`

## Description

Wire PresenceList component into the editor toolbar to display online collaborators in real-time. Subscribe to presence updates from WebSocket and manage user status transitions.

## Acceptance Criteria

- [x] PresenceList component integrated into Editor toolbar
- [x] Subscribe to presence updates from WebSocket
- [x] Display online users with status indicators
- [x] Handle user join/leave events
- [x] Update presence list reactively
- [x] Show current user highlighted
- [x] Responsive tooltip on hover
- [x] >80% test coverage

## Implementation Details

**File**: `/src/lib/elements/Editor.svelte` (or new `/src/lib/elements/EditorToolbar.svelte`)

### Integration Points
```
Editor
├─ EditorPanel (main content)
├─ EditorToolbar (new)
│  ├─ PresenceList (from S14-02)
│  ├─ Focus Mode Toggle
│  └─ Export Button
└─ EditorFooter (timestamp, status)
```

### Presence Store Binding
```svelte
<script>
  import { presenceStore } from '$lib/editor/presence-store';
  import PresenceList from '$lib/elements/PresenceList.svelte';

  $: users = $presenceStore.users;
</script>

<PresenceList {users} currentUserId={userId} maxVisible={5} />
```

### Event Handling
- Listen for WebSocket presence events
- Update presence store on join/leave
- Handle reconnection scenarios
- Clean up on unmount

## Testing

Tests cover:
- Component renders in toolbar
- Presence list updates on user join
- Current user highlighted correctly
- Leave events remove users
- Status transitions reflected UI
- Performance with many users

## Files to Create

- `/src/lib/elements/EditorToolbar.svelte` (new, or update Editor.svelte)
- Tests: `/src/lib/elements/EditorToolbar.svelte.spec.ts` (new)

## Styling

- Flex layout with gap
- Responsive: hide on small screens, show on tablet+
- Tooltip support for user names
- Smooth animations on join/leave

## Integration Points

- Depends on: S14-02 (PresenceList), S15-01 (WebSocket API)
- Enables: S15-03 (Cursor visualization)
- Uses: presence-store.ts (from S14-03)

## Related Stories

- Depends on: S14-02, S15-01
- Enables: S15-03
- Part of: Sprint 15
