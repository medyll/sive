---
id: S21-01
sprint: 21
title: offline-banner
status: done
---

# S21-01 — Offline/Online Network Banner

## Goal
Show an OfflineBanner at the top of the app when the network is offline, disappearing when online.

## Acceptance Criteria
- [ ] Banner appears when navigator.onLine is false or offline event fires
- [ ] Banner disappears on online event
- [ ] OfflineBanner.svelte rendered in +layout.svelte

## Notes
Uses $effect to attach window.addEventListener('online'/'offline'). Initial state from navigator.onLine.
