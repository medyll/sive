# S15-03 - Cursor Visualization

**Status**: 🚀 In Progress
**Priority**: High
**Points**: 3
**Branch**: `s15-01-websocket-api`

## Description

Render remote cursor overlays in the editor with color coding, user names, and real-time position updates. Display cursors for all active remote clients with smooth animations.

## Acceptance Criteria

- [x] RemoteCursor component displaying cursor overlays
- [x] Color-coded by client ID (consistent with S14-03)
- [x] Show user name tooltip on hover
- [x] Real-time position updates
- [x] Smooth animations for cursor movement
- [x] Fade out after 5 seconds of inactivity
- [x] Position calculated relative to editor
- [x] >80% test coverage

## Implementation Details

**File**: `/src/lib/elements/RemoteCursor.svelte`

### Component Props
```typescript
export interface CursorState {
  clientId: string;
  userId: string;
  line: number;
  column: number;
  color: string;
  isVisible: boolean;
}

export let cursors: CursorState[] = [];
export let lineHeight: number = 20;
export let charWidth: number = 8;
```

### Positioning
- Calculate position from line/column
- Use character-based positioning
- Top = (line - 1) * lineHeight
- Left = column * charWidth

### Styling
- Cursor bar: 2px wide, color-coded
- Label: small badge with username
- Animation: fade-in 200ms, position transitions 100ms

### Events
- Listen to cursor-update events
- Update visible cursors reactively
- Handle cleanup on disconnect

## Testing

Tests cover:
- Renders cursors with correct colors
- Positions calculated correctly
- User names display in tooltips
- Visibility toggle on inactivity
- Smooth animations
- Cleanup on cursor removal

## Files to Create

- `/src/lib/elements/RemoteCursor.svelte` (new)
- `/src/lib/elements/RemoteCursor.svelte.spec.ts` (new)

## Integration Points

- Depends on: S14-03 (cursor-sync store), S15-01 (WebSocket)
- Uses: cursor-sync store for reactive updates
- Positioned: Absolutely within Editor container

## Styling

- Z-index: 100 (above text)
- Blend mode: multiply (see-through)
- Cursor width: 2px
- Label: 12px font, padding 2px 4px

## Related Stories

- Depends on: S14-03, S15-01
- Part of: Sprint 15
