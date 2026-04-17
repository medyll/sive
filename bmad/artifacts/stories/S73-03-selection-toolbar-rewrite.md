# S73-03 — Selection Toolbar: Rewrite Actions

**Status:** ✅ Done  
**Priority:** High  
**Estimate:** 4-6 hours  
**Actual:** 1.5 hours

---

## Goal

Show floating toolbar when text is selected with AI rewrite actions: Rewrite, Expand, Condense, and Tone options.

---

## Implementation

### Files Modified

| File | Changes |
|------|---------|
| `src/lib/elements/SelectionToolbar.svelte` | Added Expand, Condense buttons; Updated tone menu |

### Features Added

**New Actions:**
| Button | Action | Description |
|--------|--------|-------------|
| ✏️ Rewrite | `rewrite` | Rewrite selection with AI |
| 📝 Expand | `expand` | Add more detail to selection |
| 📌 Condense | `condense` | Make selection more concise |
| 💬 Comment | `comment` | Add comment to selection |
| 🎨 Tone | `tone` | Change tone (submenu) |

**Tone Options (Updated):**
- Formal
- Casual
- Professional (NEW)
- Creative (NEW)
- Academic (NEW)

---

## Toolbar Layout

```
┌────────────────────────────────────────────────────────┐
│  ✏️ Rewrite  │  📝 Expand  │  📌 Condense  │  💬 Comment  │  🎨 Tone ▾  │
└────────────────────────────────────────────────────────┘
```

**Tone Menu (dropdown):**
```
┌─────────────────┐
│  Formal         │
│  Casual         │
│  Professional   │
│  Creative       │
│  Academic       │
└─────────────────┘
```

---

## Integration with EditorPanel

The toolbar is already integrated in EditorPanel:

```svelte
{#if selectionText}
  <SelectionToolbar
    selection={selectionText}
    context={content}
    x={toolbarX}
    y={toolbarY}
    onDismiss={() => (selectionText = '')}
  />
{/if}
```

**Positioning:**
- Appears above selected text
- Centered horizontally on selection
- `toolbarX` = selection center
- `toolbarY` = selection top

---

## Action Handlers

### handleRewrite()
```typescript
function handleRewrite() {
  requestSuggestionNow(context, 'rewrite', selection);
  onDismiss?.();
}
```

### handleExpand()
```typescript
function handleExpand() {
  requestSuggestionNow(context, 'expand', selection);
  onDismiss?.();
}
```

### handleCondense()
```typescript
function handleCondense() {
  requestSuggestionNow(context, 'condense', selection);
  onDismiss?.();
}
```

### handleTone(tone)
```typescript
function handleTone(tone: string) {
  requestSuggestionNow(context, 'tone', tone + ':' + selection);
  showToneMenu = false;
  onDismiss?.();
}
```

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Escape | Dismiss toolbar and tone menu |

---

## Acceptance Criteria

- [x] Toolbar appears above selected text
- [x] Actions: "Rewrite", "Expand", "Condense", "Change Tone"
- [x] Rewrite replaces selection with AI version
- [x] Expand adds more detail to selection
- [x] Condense makes selection more concise
- [x] Tone submenu with 5 options (Formal, Casual, Professional, Creative, Academic)
- [x] Escape dismisses toolbar

---

## Related Stories

- S73-01: Ghost Text — Tab to Accept
- S73-02: Ghost Text — Partial Accept
- S73-04: Tone Submenu Actions (included in this story)
- S7: Suggestions Tab UI (requestSuggestionNow pattern)

---

## Known Limitations

1. **No diff preview:** Changes applied directly without preview. Could add Harden modal integration.
2. **No undo button:** Users must use browser undo (Ctrl+Z) or Harden timeline.
3. **Fixed positioning:** Toolbar uses absolute X/Y. May need adjustment for edge cases.

---

## Definition of Done

- [x] Expand button added
- [x] Condense button added
- [x] Tone menu expanded with 5 options
- [x] All handlers call requestSuggestionNow correctly
- [x] Escape key dismisses toolbar
- [x] Story documented
