# Sprint 23 — AI Context Awareness & Prompt History

**Status:** done
**Dates:** 2026-03-16
**Theme:** Ground AI responses in the user's actual document content; surface prompt history for power users.

---

## Problem Statement

The AI chat stream (`/api/ai/stream`) receives only the conversation history — it has **no knowledge of the document being written**. Responses are generic writing advice rather than specific feedback on the user's actual text. Separately, users repeatedly type the same prompts with no recall mechanism.

---

## Stories

### S23-01 — `promptHistoryStore` (Svelte 5 runes)
Create `src/lib/promptHistoryStore.svelte.ts`.
- Stores last 10 unique non-empty prompts in `localStorage` under `sive.promptHistory`.
- Exports: `promptHistoryStore.add(text)`, `.items` (readonly array, most-recent-first), `.clear()`.
- Persists across page reloads; deduplicates consecutive identical entries.

### S23-02 — `/api/ai/stream` accepts `docContext`
Extend the GET handler to read an optional `ctx` query param (base64-encoded document excerpt, max 2 000 chars).
- If present, prepend a context block to the system prompt:
  `"The user is currently writing the following document excerpt:\n\n<document>\n{ctx}\n</document>\n\nUse it as context when answering. Do not repeat it back verbatim."`
- Stub mode: include context mention in stub reply when `ctx` is set.
- Unit-test the system prompt construction.

### S23-03 — AIPanel: "Use document as context" toggle + wire context into chat
Add a small toggle above the chat input: **"📄 Use document as context"** (default: on).
- When on, encode `editorContent.slice(0, 2000)` as base64 and pass as `ctx` param on the stream URL.
- Toggle state persisted in `localStorage` under `sive.aiUseDocContext`.
- Visual indicator in chat header: subtle "Doc context active" pill when toggled on and `editorContent` is non-empty.

### S23-04 — Prompt history recall (up/down arrow in chat input)
Wire `promptHistoryStore` into the chat input:
- On **ArrowUp** (when input is empty or cursor is at position 0): cycle backward through history.
- On **ArrowDown**: cycle forward (back toward empty).
- On **Enter** to send: call `promptHistoryStore.add(msg)` before clearing input.
- Visual hint: show "↑ history" micro-text below input when history is non-empty.

### S23-05 — Unit tests
File: `src/lib/promptHistoryStore.spec.ts`
- `add()` prepends; deduplicates consecutive; caps at 10.
- `clear()` empties store and localStorage.
- Persistence: simulate reload via `localStorage` pre-seed.

File: `src/routes/api/ai/stream/stream.context.spec.ts`
- System prompt includes document excerpt when `ctx` is provided.
- System prompt is unchanged when `ctx` is absent.
- Excerpt is truncated to 2 000 chars.

### S23-06 — E2E tests
File: `e2e/ai-context.spec.ts`
- Chat with context toggle ON returns a response (stub mode, no API key needed).
- Chat with context toggle OFF omits `ctx` param from the fetch URL.
- Prompt history: send a message, reload page, press ArrowUp in chat input — original message reappears.

---

## Acceptance Criteria
- [ ] Document context flows from editor → AIPanel → SSE endpoint → Anthropic system prompt.
- [ ] Context toggle persists across reloads.
- [ ] Prompt history cycles correctly with up/down arrows.
- [ ] All unit tests pass; E2E tests run green in stub mode.
- [ ] No regressions on existing Chat/Suggestions/Coherence/Style tabs.
