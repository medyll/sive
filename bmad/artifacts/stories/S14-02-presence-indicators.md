# S14-02 - Presence Indicators

**Status**: ✅ Done
**Priority**: High
**Points**: 3
**Branch**: `s14-01-websocket-server`

## Description

Display a list of online collaborators in the UI with visual indicators for their status (active, idle, offline). Show user initials in colored avatars with status dots.

## Acceptance Criteria

- [x] PresenceList component displaying online users
- [x] User avatars with initials and status indicators
- [x] Status colors: green (active), yellow (idle), gray (offline)
- [x] Current user highlighted with distinct styling
- [x] "More collaborators" indicator when list exceeds maxVisible
- [x] Hover tooltip showing user name and status
- [x] Responsive layout with negative margin overlap
- [x] Unit tests with >80% coverage
- [x] Accessibility features (title attributes, aria-hidden)

## Implementation Details

**File**: `/src/lib/elements/PresenceList.svelte`

### Component Props

```typescript
export interface OnlineUser {
  userId: string;
  clientId: string;
  name?: string;
  status: 'active' | 'idle' | 'offline';
  lastSeen?: number;
}

export let users: OnlineUser[] = [];
export let currentUserId: string | null = null;
export let maxVisible: number = 5;
```

### Features

- Avatar background uses CSS variable `--color-primary`
- Status dot positioned bottom-right with 10px size
- Overlapping avatars via negative margin (-0.5rem)
- Hover scale animation (1.15x) with shadow
- Current user gets double-ring border effect
- Count badge shows "+N" for hidden collaborators

### Styling

- Flexbox layout with gap 0.25rem
- Avatar: 32px circle with white border
- Status dot: 10px circle with background color
- Transition: 0.2s ease on all properties
- CSS variables: --color-primary, --color-background, --color-surface, --color-border, --color-text

## Testing

Unit tests cover:
- Rendering users with correct initials
- Status color assignment
- Current user highlighting
- Hidden count calculation
- Tooltip generation
- Edge cases (empty list, single user)

## Files Modified

- `/src/lib/elements/PresenceList.svelte` (new)
- `/src/lib/elements/PresenceList.svelte.spec.ts` (new)

## Related Stories

- Depends on: S14-01
- Blocked by: None
- Enables: Integration tests in S14-05, S14-06

## Integration Points

- Receives user list from WebSocket presence events
- Updates reactively as users join/leave
- Positioned in editor toolbar or status bar
