# S73-02 — Ghost Text: Partial Accept (Word-by-Word)

**Status:** ✅ Done  
**Priority:** High  
**Estimate:** 2-3 hours  
**Actual:** 1.5 hours

---

## Goal

Accept ghost text word-by-word with repeated Tab presses. First Tab accepts first word, second Tab accepts second word, etc.

---

## Implementation

### Files Modified

| File | Changes |
|------|---------|
| `src/lib/elements/EditorPanel.svelte` | Added ghost text integration |
| `src/lib/elements/GhostText.svelte` | Updated positioning props |

### Features Added to EditorPanel

**New Props:**
- `enableGhostText?: boolean` — Toggle ghost text (default: true)

**New State:**
- `ghostTextTimer` — Debounce timer for AI fetch
- `ghostTextX`, `ghostTextY` — Ghost text positioning

**New Functions:**
- `scheduleGhostTextFetch()` — Debounced AI completion fetch (500ms)
- `fetchGhostText()` — Fetches completion from /api/ai/complete
- `handleKeydown()` — Tab (accept), Escape (dismiss)

**Keyboard Shortcuts:**
| Key | Action |
|-----|--------|
| Tab | Accept next word of ghost text |
| Escape | Dismiss ghost text |

---

## Ghost Text Flow

```
User types → 500ms debounce → Fetch AI completion → Show ghost text
                                                              ↓
User presses Tab → Accept next word → Update content → Repeat
                                                              ↓
User presses Escape → Dismiss ghost text → Continue typing
```

---

## Acceptance Criteria

- [x] Ghost text appears after user pauses typing (500ms debounce)
- [x] Tab key accepts next word of ghost text
- [x] Escape key dismisses ghost text
- [x] Ghost text styled as faded/gray text
- [x] Cursor positioned at end of accepted word
- [x] Partial accept works word-by-word
- [x] Ghost text hides when all words accepted

---

## Integration Example

```svelte
<EditorPanel
  documentId={docId}
  bind:content={docContent}
  onSave={handleSave}
  enableGhostText={true}
/>
```

---

## Code Structure

### EditorPanel Ghost Text Logic

```typescript
// Debounced fetch (500ms after typing stops)
function scheduleGhostTextFetch() {
  if (ghostTextTimer) clearTimeout(ghostTextTimer);
  ghostTextTimer = setTimeout(() => {
    fetchGhostText();
  }, 500);
}

// Fetch from AI endpoint
async function fetchGhostText() {
  const res = await fetch('/api/ai/complete', {
    method: 'POST',
    body: JSON.stringify({
      prompt: content.slice(-100),
      context: content.slice(0, 500)
    })
  });
  const data = await res.json();
  ghostTextStore.show(data.completion, content.length);
}

// Tab handler - accept next word
function handleKeydown(e: KeyboardEvent) {
  if (ghostTextStore.isVisible && e.key === 'Tab') {
    e.preventDefault();
    const text = ghostTextStore.acceptNextWord();
    if (text) {
      // Insert at cursor position
      content = content.slice(0, pos) + text + content.slice(pos);
    }
  }
}
```

---

## Related Stories

- S73-01: Ghost Text — Tab to Accept (foundation)
- S73-03: Selection Toolbar — Rewrite Actions
- S20: Keyboard Shortcuts (Tab, Escape handling pattern)

---

## Known Limitations

1. **Positioning:** Ghost text uses fixed position (100, 200). Precise positioning requires textarea ref and caret coordinates.
2. **No loading indicator:** Ghost text fetch is silent. Could add subtle indicator.
3. **No retry logic:** Failed fetches are silently ignored.

---

## Definition of Done

- [x] EditorPanel integrated with ghostTextStore
- [x] Tab key accepts words word-by-word
- [x] Escape key dismisses ghost text
- [x] 500ms debounce prevents excessive API calls
- [x] Ghost text renders in editor
- [x] Story documented
