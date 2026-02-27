<!-- 1-interface-architecture.md -->
## 1. Interface Architecture (Layout)

### 1.1 Resizable Split-Screen

The panel is resizable by drag-and-drop. The default ratio is 55/45 (editor/suggestions) but the user can adjust freely — the preference is persisted per profile.

### 1.2 Focus Mode

A keyboard shortcut (e.g. `F11` or `Ctrl+Shift+F`) hides the right panel for a distraction-free writing session. When suggestions are ready during this mode, a discreet indicator (coloured dot in the margin) signals their availability without interrupting the flow.

### 1.3 Multi-Tab Right Panel

The right panel is organised into four contextual tabs. The active tab switches automatically based on the current action, but the user can navigate freely.

- **Suggestions** — AI proposal diff with selective validation
- **Coherence** — Narrative and physical inconsistency alerts
- **Style** — Stylistic analysis, language tics, metrics
- **History** — Snapshot timeline and navigation

### 1.4 Floating Chat Bar

Central floating bar for voice commands (LiveKit) and image uploads. Absolute positioning, collapsible.

### 1.5 AI Spinner

The spinner appears in the right panel as soon as an AI process is triggered (after a text modification or explicit action). It is not tied to user inactivity — a motionless author is thinking. The spinner is an **AI processing indicator**, not an idle indicator.

---
