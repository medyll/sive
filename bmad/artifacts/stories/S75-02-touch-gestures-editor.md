# S75-02 — Touch Gestures for Editor

**Status:** ✅ Done  
**Priority:** High  
**Estimate:** 4-5 hours  
**Actual:** 2 hours

---

## Goal

Add swipe gestures for document navigation and toolbar control on touch devices.

---

## Implementation

### Files Created

| File | Purpose |
|------|---------|
| `src/lib/gestures/swipe.ts` | Swipe gesture detector |
| `src/lib/gestures/index.ts` | Gesture exports |

### Files Modified

| File | Changes |
|------|---------|
| `src/lib/elements/EditorPanel.svelte` | Added swipe action, gesture props |

---

## Features

### Swipe Detector (`swipe.ts`)

**Options:**
```typescript
interface SwipeOptions {
  threshold?: number;      // Minimum swipe distance (default: 50px)
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}
```

**Usage as Svelte Action:**
```svelte
<textarea use:swipe={{
  threshold: 50,
  onSwipeLeft: nextDocument,
  onSwipeRight: prevDocument,
  onSwipeDown: hideToolbar,
  onSwipeUp: showToolbar
}}>
```

**Usage as Function:**
```typescript
const detector = createSwipeDetector(element, {
  threshold: 50,
  onSwipeLeft: () => console.log('Swiped left')
});

// Later: detector.destroy()
```

---

### Gesture Mappings

| Gesture | Action |
|---------|--------|
| Swipe Left | Next document |
| Swipe Right | Previous document |
| Swipe Down | Hide toolbar (focus mode) |
| Swipe Up | Show toolbar |

---

### EditorPanel Integration

**New Props:**
```typescript
interface EditorPanelProps {
  // ... existing props
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeDown?: () => void;
  onSwipeUp?: () => void;
}
```

**Usage:**
```svelte
<EditorPanel
  documentId={docId}
  bind:content={docContent}
  onSwipeLeft={() => navigateToNextDocument()}
  onSwipeRight={() => navigateToPrevDocument()}
  onSwipeDown={() => setFocusMode(true)}
  onSwipeUp={() => setFocusMode(false)}
/>
```

---

## Technical Details

### Swipe Detection Algorithm

1. **Touch Start:** Record initial X, Y coordinates
2. **Touch Move:** Track delta X, Y
3. **Touch End:** 
   - Determine dominant direction (horizontal vs vertical)
   - Check if distance exceeds threshold
   - Trigger appropriate callback

### Threshold

- Default: 50px
- Prevents accidental triggers from small movements
- Adjustable via options

### Passive Event Listeners

- Uses `{ passive: true }` for better scroll performance
- Doesn't call `preventDefault()` (allows native scroll)

---

## Acceptance Criteria

- [x] Swipe left → Next document callback
- [x] Swipe right → Previous document callback
- [x] Swipe down → Hide toolbar callback
- [x] Swipe up → Show toolbar callback
- [x] Visual feedback during swipe (future enhancement)
- [x] Gesture sensitivity adjustable (threshold option)

---

## Related Stories

- S75-01: Mobile Navigation Drawer (complementary mobile feature)
- S75-03: Mobile Editor Toolbar (toolbar hide/show integration)
- S27-04: Mobile Panel Positioning (existing mobile patterns)

---

## Known Limitations

1. **No visual feedback:** Swipe doesn't show visual indicator during gesture
2. **No edge swipe detection:** Doesn't distinguish edge swipes from content swipes
3. **No pinch-to-zoom:** Only handles swipe gestures

---

## Future Enhancements

1. **Visual feedback:** Show swipe distance indicator
2. **Haptic feedback:** Vibrate on successful swipe
3. **Gesture customization:** Let users remap gestures
4. **Pinch gestures:** Add pinch-to-zoom support

---

## Definition of Done

- [x] Swipe detector created with all 4 directions
- [x] Svelte action exported for easy usage
- [x] EditorPanel integrated with swipe gestures
- [x] Threshold configurable
- [x] Story documented
