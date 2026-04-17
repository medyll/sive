---
id: S21-02
sprint: 21
title: ai-fetch-abort
status: done
---

# S21-02 — AI Fetch Cancel (AbortController) with Cancel Button

## Goal
Allow in-flight AI requests to be cancelled with an AbortController; button toggles to "Cancel" while in-flight.

## Acceptance Criteria
- [ ] Each AI action uses an AbortController
- [ ] Button label toggles to "Cancel" while request is in-flight
- [ ] Cancelling aborts the request and resets state

## Notes
One AbortController per action in AIPanel.svelte.
