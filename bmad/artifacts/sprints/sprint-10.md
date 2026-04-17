# Sprint 10 — AI Integration MVP

**Duration:** 2026-03-01 → 2026-03-10
**Capacity:** ~18 story points

## Sprint Goal

Connect all AI panel features (Suggestions, Coherence, Style) and ChatBar to a real Anthropic claude-haiku backend. Users can send prompts and receive real AI responses. Graceful mock fallback when `ANTHROPIC_API_KEY` is absent (dev/test).

## Provider

- **SDK:** `@anthropic-ai/sdk`
- **Model:** `claude-haiku-4-5` (fast + cheap)
- **Env var:** `ANTHROPIC_API_KEY`
- **Fallback:** if key missing → return static stubs (dev/test safe)

## Stories

| ID | Title | Points | Priority |
|---|---|---:|---|
| S10-01 | Install SDK + `/api/ai` server endpoint | 3 | Must |
| S10-02 | Wire Suggestions → real AI call | 3 | Must |
| S10-03 | Wire Coherence → real AI call | 3 | Must |
| S10-04 | Wire Style → real AI call | 2 | Must |
| S10-05 | ChatBar mini-chat UI + `chatStore` | 4 | Must |
| S10-06 | Unit tests — `/api/ai` endpoint (mock SDK) | 2 | Should |
| S10-07 | E2E — Suggestions, ChatBar smoke test | 1 | Should |

**Total:** 18 pts

## Endpoint Design

`POST /api/ai` — `src/routes/api/ai/+server.ts`

Request body:
```json
{ "action": "suggestions" | "coherence" | "style" | "chat", "content": "...", "messages": [...] }
```

Response:
- `suggestions` → `{ suggestions: SuggestionData[] }`
- `coherence` → `{ alerts: CoherenceAlertData[] }`
- `style` → `{ signals: StyleSignalData[] }`
- `chat` → `{ reply: string }`

Fallback (no API key): returns stubs from existing store constants.

## ChatStore Design

`src/lib/chatStore.svelte.ts`
```ts
interface ChatMessage { role: 'user' | 'assistant'; text: string; }
// State: messages[], sending bool
// Actions: send(msg) → calls /api/ai, appends response
```

ChatBar display: messages list above input (max 200px scroll), user bubbles right, AI bubbles left.

## Dependencies

- S10-01 must be done before S10-02, S10-03, S10-04, S10-05
- S10-05 depends on S10-01

## Definition of Done

- [ ] `@anthropic-ai/sdk` installed and importable
- [ ] `POST /api/ai` endpoint handles all 4 actions, returns JSON
- [ ] Mock fallback active when `ANTHROPIC_API_KEY` missing
- [ ] "Generate suggestions" in AIPanel calls real API (or mock) and populates store
- [ ] "Run coherence check" calls real API (or mock) and shows alerts
- [ ] "Analyse this passage" calls real API (or mock) and shows signals
- [ ] ChatBar shows user/AI message bubbles with scroll history
- [ ] Unit tests pass for endpoint (mocked SDK, no real key needed)
- [ ] E2E smoke test passes for Suggestions flow
