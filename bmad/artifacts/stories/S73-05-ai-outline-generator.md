# S73-05 — AI Outline Generator

**Status:** ✅ Done  
**Priority:** High  
**Estimate:** 4-6 hours  
**Actual:** 2 hours

---

## Goal

Generate AI-powered document outlines with section navigation and insert-at-cursor functionality.

---

## Implementation

### Files Created

| File | Purpose |
|------|---------|
| `src/lib/outlineStore.svelte.ts` | Outline state management |
| `src/routes/api/ai/outline/+server.ts` | AI outline endpoint |
| `src/lib/elements/OutlinePanel.svelte` | Outline UI component |
| `src/lib/outlineStore.spec.ts` | Unit tests (15 tests) |

---

## Features

### outlineStore

**State:**
- `sections` — Array of outline sections
- `documentId` — Associated document ID
- `generatedAt` — Generation timestamp
- `isLoading` — Loading state
- `error` — Error message

**Methods:**
- `setLoading(loading)` — Set loading state
- `setSections(sections, documentId)` — Set outline sections
- `setError(error)` — Set error message
- `clear()` — Clear outline
- `insertAtCursor(content)` — Generate markdown outline + append content
- `scrollToSection(title)` — Scroll to section heading
- `reset()` — Reset to defaults

**Derived:**
- `flatSections` — Flattened section list (for navigation)
- `sectionCount` — Number of top-level sections
- `isLoading` — Loading state
- `error` — Error state

---

### API Endpoint

**POST /api/ai/outline**

**Request:**
```json
{
  "content": "Current document content...",
  "topic": "Document topic",
  "style": "narrative"
}
```

**Response:**
```json
{
  "sections": [
    { "id": "1", "title": "Introduction", "level": 1, "content": "Hook reader" },
    { "id": "2", "title": "Background", "level": 2, "content": "Context" },
    { "id": "3", "title": "Conclusion", "level": 1 }
  ]
}
```

**Outline Styles:**
- `narrative` — Story/novel structure
- `academic` — Research paper structure
- `screenplay` — Script structure

---

### OutlinePanel Component

**Features:**
- Generate Outline button
- Section navigation (click to scroll)
- Insert at Cursor button
- Loading state
- Error display
- Empty state

**Layout:**
```
┌────────────────────────────────────┐
│ Document Outline    [✨ Generate]  │
├────────────────────────────────────┤
│ [📋 Insert at Cursor]              │
├────────────────────────────────────┤
│ # Introduction                     │
│   ## Background                    │
│   ## Rising Action                 │
│ # Conclusion                       │
├────────────────────────────────────┤
│ 3 sections · Generated 2026-03-28  │
└────────────────────────────────────┘
```

---

## Test Coverage

**outlineStore.spec.ts — 15 tests passing:**

```
✓ setLoading (3)
  ✓ sets loading state to true
  ✓ clears error when loading starts
  ✓ persists to localStorage
✓ setSections (4)
  ✓ sets outline sections
  ✓ sets generatedAt timestamp
  ✓ sets loading to false
  ✓ clears error
✓ setError (2)
  ✓ sets error message
  ✓ sets loading to false
✓ clear (1)
  ✓ resets to default state
✓ insertAtCursor (2)
  ✓ generates markdown outline from sections
  ✓ appends existing content
✓ flatSections (1)
  ✓ flattens nested sections
✓ sectionCount (1)
  ✓ returns number of top-level sections
✓ reset (1)
  ✓ resets all state to defaults
```

---

## Acceptance Criteria

- [x] `/api/ai/outline` endpoint accepts doc content/topic
- [x] Returns structured outline (sections, subsections)
- [x] OutlinePanel displays generated outline
- [x] Click section to navigate (scroll to heading)
- [x] Option to insert outline at cursor position
- [x] Unit tests for outline store (15/15 passing)

---

## Integration Example

```svelte
<script>
  import OutlinePanel from '$lib/elements/OutlinePanel.svelte';
  import { outlineStore } from '$lib/outlineStore.svelte';
  
  function handleInsert() {
    const outline = outlineStore.insertAtCursor(editorContent);
    editorContent = outline;
  }
  
  function handleNavigate(sectionTitle) {
    // Scroll to section in editor
    scrollToHeading(sectionTitle);
  }
</script>

<OutlinePanel 
  onInsert={handleInsert} 
  onNavigate={handleNavigate} 
/>
```

---

## Related Stories

- S73-01: Ghost Text — Tab to Accept
- S73-03: Selection Toolbar — Rewrite Actions
- S23: AI Context Awareness (context pattern reused)

---

## Known Limitations

1. **No section content generation:** Only titles/structure, not full content
2. **No outline editing:** Can't modify sections after generation
3. **No persistent storage:** Outlines lost on page refresh (localStorage only)

---

## Definition of Done

- [x] outlineStore created with full API
- [x] AI outline endpoint implemented
- [x] OutlinePanel component renders correctly
- [x] 15/15 unit tests passing
- [x] Story documented
