# Sprint 22 — AI Chat Streaming & Document Tags

**Duration:** 2026-03-17 → 2026-03-31
**Capacity:** 20 story points

## Sprint Goal

Replace the fire-and-wait AI chat with a token-by-token streaming experience, and give users a lightweight tagging system for organising documents in the sidebar.

## Stories

| ID | Epic | Title | Points | Priority |
|---|---|---|---|---|
| S22-01 | AI UX | Streaming chat endpoint (`/api/ai/stream`) using SSE | 4 | Must |
| S22-02 | AI UX | Stream tokens into the chat bubble as they arrive | 3 | Must |
| S22-03 | AI UX | Suggested prompts chips for empty chat state | 2 | Should |
| S22-04 | Docs | `tags` column on documents (localStorage for guests, DB for users) | 3 | Must |
| S22-05 | Docs | Tag input + chip display in DocumentList | 3 | Must |
| S22-06 | Docs | Filter sidebar by tag | 2 | Should |
| S22-07 | QA | Unit tests for S22-01 → S22-06 | 4 | Must |

**Total:** 21 points

## Definition of Done

- [ ] `GET /api/ai/stream` accepts `?messages=…` and returns `text/event-stream`; each `data:` line is a token chunk
- [ ] Chat tab in AIPanel streams tokens into the assistant bubble in real time; cursor blinks until done
- [ ] When the chat history is empty, 3 suggested-prompt chips appear; clicking one seeds the input and sends
- [ ] Documents can have 0-5 tags (strings); tags persisted in `documents.tags` column (JSON text) or `localStorage` for guests
- [ ] DocumentList shows tag chips under each document title; clicking a tag chip opens a tag-input inline editor
- [ ] A tag filter bar above the document list lets users click a tag pill to show only matching documents
- [ ] All new behaviour covered by unit tests

## Implementation Notes

- **S22-01**: New `GET /api/ai/stream/+server.ts`. Reads `?q=<base64url messages JSON>`. Uses `Anthropic.messages.stream()`. Returns `ReadableStream` with `data: <token>\n\n` chunks. Closes with `data: [DONE]\n\n`. Falls back to a stubbed single chunk when no API key.
- **S22-02**: In `AIPanel.svelte`, replace the chat `fetch('/api/ai')` call with `fetch('/api/ai/stream?q=…')`. Read `response.body` as a `ReadableStream`, parse SSE chunks, append each token to the last assistant message `$state` string. Show a blinking cursor (`|`) while streaming.
- **S22-03**: Add `SUGGESTED_PROMPTS` const array of 3 strings. Render as `<button class="prompt-chip">` when `chatMessages.length === 0`. `onclick` sets input value + immediately sends.
- **S22-04**: Add `tags text not null default '[]'` to `documents` table in `schema.ts`. Add a Drizzle migration file. For guests (no DB): store tags in `localStorage` keyed `sive.tags.<docId>`. Expose `tagStore.svelte.ts` with `getTags(docId)` / `setTags(docId, tags)`.
- **S22-05**: `DocumentList.svelte` — show up to 5 tag chips per document. Clicking the `+` icon at end of chips opens a small inline `<input>` for adding a tag (Enter to confirm, Escape to cancel). Each chip has an `×` to remove.
- **S22-06**: Add `let activeTagFilter = $state<string | null>(null)` to `DocumentList`. Add tag pill summary row above the list. Clicking a pill sets `activeTagFilter`; the `$derived filteredDocs` also filters by tag. An `×` clears the filter.
- **S22-07**: Unit tests in `src/lib/elements/AIPanel.streaming.spec.ts`, `src/lib/tagStore.spec.ts`, `src/lib/elements/DocumentList.tags.spec.ts`.
