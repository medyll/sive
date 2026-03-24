---
id: S49-05
sprint: 49
title: fix-pdf-sanitization-tests
status: done
---

# S49-05 — Fix PDF Sanitization Tests

## Goal
Fix PDF sanitization tests by correcting Unicode character removal mock and adding mixed-content test cases.

## Acceptance Criteria
- [ ] Regex sanitization matches expected output
- [ ] Test case with mixed unicode + ASCII added
- [ ] Sanitization behaviour documented

## Notes
Sprint 49. File: src/routes/api/export/pdf/pdf.spec.ts.
