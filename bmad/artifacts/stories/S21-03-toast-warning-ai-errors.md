---
id: S21-03
sprint: 21
title: toast-warning-ai-errors
status: done
---

# S21-03 — Toast Warning Type + Error Toasts on AI Failures

## Goal
Add a warning toast type to toastStore and show warning toasts instead of silently stubbing on AI failures.

## Acceptance Criteria
- [ ] toastStore exposes .warning() method
- [ ] AI fetch errors show a warning toast
- [ ] Warning toast styled amber

## Notes
Extend toastStore with warning type; call in catch blocks.
