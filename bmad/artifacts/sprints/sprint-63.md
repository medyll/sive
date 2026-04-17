# Sprint 63 — AI Outline Generator & Document Structure

**Sprint Duration:** 2026-03-25
**Status:** 🚀 Active
**Goal:** Add an Outline tab to the AI panel that generates a structured document outline from either a topic prompt or the current document content, displayed as a collapsible tree. Users can insert heading blocks directly from the outline into the editor.

---

## Stories

### S63-01 — `/api/ai/outline` SSE endpoint
**File:** `src/routes/api/ai/outline/+server.ts`
- GET endpoint accepting `?topic=<text>&ctx=<base64 doc content>`
- Streams SSE tokens in the same format as `/api/ai/stream`
- Returns a structured outline as markdown headings (## Section\n### Subsection)
- If `ctx` provided: derive outline from existing content
- If `topic` provided: generate outline for that topic from scratch

### S63-02 — `outlineStore.svelte.ts`
**File:** `src/lib/outlineStore.svelte.ts`
- Svelte 5 runes store
- `outline: OutlineNode[]` — parsed tree of `{ level: number; text: string; children: OutlineNode[] }`
- `isGenerating: boolean`
- `generate(topic: string, docContent?: string)` — calls SSE endpoint, streams into store
- `cancel()` — aborts in-flight request
- `parseOutline(markdown: string): OutlineNode[]` — converts heading markdown to tree

### S63-03 — `OutlinePanel` component
**File:** `src/lib/elements/OutlinePanel.svelte`
- Props: `docId: string`, `content: string`
- Text input: "Enter a topic or generate from document"
- "Generate" button + "From document" shortcut button
- Renders `OutlineNode[]` as a collapsible tree (`<details>`/`<summary>`)
- Each node has an "Insert" button that dispatches `outline:insert` custom event with the heading text
- Shows streaming skeleton while generating
- Empty state: "Enter a topic above to generate an outline"

### S63-04 — Wire OutlinePanel as Outline tab in AIPanel
**File:** `src/lib/elements/AIPanel.svelte`
- Add "Outline" tab (🗂️) alongside existing AI tabs
- Render `OutlinePanel` when Outline tab is active
- Pass `editorContent` and `docId` props

### S63-05 — Unit tests Sprint 63
- `outlineStore`: `parseOutline` with h2/h3 markdown, generate sets `isGenerating`, cancel aborts
- `OutlinePanel`: renders empty state, shows input, generate button present

### S63-06 — E2E Sprint 63
- Navigate to app → AI panel → Outline tab visible
- Enter topic → click Generate → outline tree appears
- "From document" button generates outline from current content
- Click Insert on a node → heading inserted into editor

---

## Acceptance Criteria
- [ ] `/api/ai/outline` streams markdown headings
- [ ] OutlinePanel renders collapsible tree
- [ ] Insert button fires `outline:insert` event
- [ ] Outline tab visible in AIPanel
- [ ] 0 new test failures introduced
