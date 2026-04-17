# S2-05 — ChatBar Floating Overlay

**Sprint:** 2 | **Epic:** UI Shell | **Points:** 2 | **Priority:** Should
**Depends on:** S2-01

## Goal

Wire `ChatBar` as a floating overlay at the bottom-center of the app layout. The overlay is collapsible (toggle open/closed). Voice and image upload buttons are stubbed.

## Acceptance Criteria

- [ ] `ChatBar` renders inside an overlay div at the bottom-center of the viewport (fixed/absolute positioning)
- [ ] A collapse/expand toggle button shows/hides the chat input; icon changes accordingly (`▲` / `▼`)
- [ ] When expanded: ChatBar is visible with text input + Send button
- [ ] When collapsed: only the toggle button is visible
- [ ] Typing + pressing Enter or clicking Send logs the message to console (AI wiring in a later sprint)
- [ ] Overlay does not overlap toolbar or main content in normal mode; `z-index` is appropriate
- [ ] Voice toggle button (`🎤`) and image upload button (`🖼`) are present but `aria-disabled` (LiveKit wiring is out of scope)

## Implementation Notes

- Use `src/lib/elements/mockups/overlay.svelte` as the reference for positioning/styling
- Update `ChatBar.svelte` or wrap it in an `OverlayChatBar` layout component at the page level
- `$state chatBarOpen: boolean = true` in `src/routes/app/+page.svelte`
- The `onSend` callback should `console.log` for now with a TODO comment for AI wiring

---

## Implementation Notes

**Date:** 2026-03-01
**Files changed:**
- `src/routes/app/+page.svelte` — Ajout overlay `.chat-overlay` fixed bottom-center; `chatBarOpen: boolean = true`; bouton toggle `▲/▼` (`aria-expanded`); `ChatBar` avec `onSend → console.log`; boutons 🎤 et 🖼 stubs (`aria-disabled`)

**Notable decisions:**
- ChatBar intégré dans `.chat-bar-inner` avec border-radius `2rem` pour le look "pill" flottant, ombré
- `chatBarOpen` non persisté localStorage (préférence volatile de session)
- Les boutons voice/image sont stubs avec `aria-disabled` + `opacity: 0.5` — câblage LiveKit en Sprint 3+

**Known limitations:**
- `onSend` logue en console — wiring AI Command Bus en Sprint 3+
- Pas de drag pour repositionner l'overlay (spec: draggable) — déféré Sprint 3+

