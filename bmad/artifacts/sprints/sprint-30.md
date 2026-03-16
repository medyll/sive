# Sprint 30 — Full-Text Search & Advanced Filtering

**Status:** planned
**Focus:** Implement full-text search with document indexing + advanced filtering (tags, date range, sort options)
**Dates:** 2026-03-18 → 2026-03-31

---

## Stories

### S30-01: Full-Text Search Index & Query Engine
Create `src/lib/server/search.ts`:
- Build search index on document load (title + content, up to 10,000 words per doc)
- Implement simple substring + regex matching (no external deps)
- Support phrase search with quotes ("exact phrase")
- Return ranked results (title matches weighted higher than content)
- Highlight matching text in results (mark relevant sections)
- Performance: <200ms for typical queries on 100+ documents

### S30-02: Document Search Store & Client State
Create `src/lib/searchStore.svelte.ts`:
- Store search query, results, selected filters (tags, date range)
- Persist last search to localStorage (resume from where user left off)
- Track search history (last 20 searches)
- Debounce search input (300ms) to reduce indexing calls
- Expose results, isSearching, error states to UI

### S30-03: Search UI in Document Sidebar
Create/enhance `src/lib/elements/DocumentSearch.svelte`:
- Search input with debounce
- Display "X results for 'query'" with matched snippet preview
- Result list with title + snippet + tag chips + date
- Click result → jump to document
- Clear search button
- "No results" empty state

### S30-04: Advanced Filtering UI & Logic
Enhance `src/lib/elements/DocumentList.svelte` sidebar:
- **Filter by tags:** Multi-select chip filter (max 5 tags shown, +more button)
- **Filter by date:** Start/end date picker (optional both)
- **Sort options:** Modified date (↓ default), Created date (↓), Title (↑ A-Z)
- Combine search + filters (AND logic: search results filtered by selected tags/dates)
- "X documents" count updates as filters change
- Store filter state in localStorage (persist between sessions)

### S30-05: Search Integration with Document Store
Wire search index into `src/lib/documentStore.svelte.ts`:
- Re-index when document is created/updated/deleted
- Batch updates (debounce 1s) to avoid re-indexing on every keystroke
- Clear search results when user navigates away
- Reset search when switching between collaborative vs. local mode

### S30-06: Unit Tests & E2E Tests
**Unit tests:**
- Search index creation & ranking (phrase match, substring, relevance)
- Filter logic (tags, date range, sort)
- Search store state updates, localStorage persistence, debounce

**E2E tests:**
- Create 3+ documents with varied tags/dates
- Search for keyword → results appear in <300ms
- Filter by tag → only tagged docs shown
- Combine search + tag filter → correct intersection
- Sort by date → newest first
- Verify localStorage persistence (refresh → search state restored)
- Test empty state (no results, no documents)

---

## Acceptance Criteria

- [ ] Search query matches title + content (case-insensitive)
- [ ] Phrase search with quotes works ("exact phrase" returns only exact matches)
- [ ] Results ranked: title matches > content matches
- [ ] Search <200ms for 100 documents
- [ ] Filters (tags, date range) work independently + combined
- [ ] Sort options (date, title) apply correctly
- [ ] Search state persists in localStorage (last query, results, filters)
- [ ] Search highlights matching text in snippet preview
- [ ] UI responsive on mobile (search input full-width, results stack)
- [ ] All unit tests pass (index, filters, store)
- [ ] All E2E tests pass (search, filters, persistence)
- [ ] No console errors or warnings
- [ ] Code review approved

---

## Notes

- **Search scope:** Title + first 10,000 chars of content (avoid indexing huge documents)
- **Index strategy:** In-memory; rebuild on document changes (no persistence needed yet)
- **Regex support:** Use simple patterns only (no lookahead/lookbehind) for safety
- **Tag filtering:** Use exact match (not fuzzy)
- **Date filtering:** Inclusive range (date ≥ start AND date ≤ end)
- **Future:** Could add full Lucene-style syntax, trigram indexing, or persistent search DB (deferred to S31+)
