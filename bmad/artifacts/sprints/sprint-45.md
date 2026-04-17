# Sprint 45 — Advanced Export (EPUB & DOCX)

**Sprint Duration:** 2026-03-17 → 2026-03-21
**Status:** ✅ Done
**Goal:** Extend the export system with EPUB and DOCX format support, including metadata (title, author) and basic chapter structure derived from headings.

---

## Stories

| ID | Epic | Title | Points | Priority |
|---|---|---:|---|---|
| S45-01 | Export | DOCX export handler (`/api/export/docx`) | 3 | Must |
| S45-02 | Export | EPUB export handler (`/api/export/epub`) | 3 | Must |
| S45-03 | Export | Heading-based chapter detection utility | 2 | Must |
| S45-04 | Export | ExportModal — format selector (PDF/DOCX/EPUB) | 3 | Must |
| S45-05 | Export | Metadata fields (title, author) in ExportModal | 2 | Should |
| S45-06 | Testing | Unit tests — DOCX/EPUB handlers & chapter detection | 2 | Should |

**Total:** 15 points

---

## Acceptance Criteria
- [x] DOCX export downloads a valid `.docx` file with document content
- [x] EPUB export downloads a valid `.epub` file with metadata
- [x] Headings (h1–h3) map to chapters in EPUB output
- [x] ExportModal lets user choose PDF, DOCX, or EPUB
- [x] Author and title metadata embedded in exported files
- [x] Unit tests cover both export handlers
