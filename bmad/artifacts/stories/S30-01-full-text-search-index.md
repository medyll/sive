---
id: S30-01
sprint: 30
title: full-text-search-index
status: done
---

# S30-01 — Full-Text Search Index & Query Engine

## Goal
Create a server-side search engine with substring/phrase matching, ranking, and highlight support for 100+ documents.

## Acceptance Criteria
- [ ] Search index built from title + content (up to 10,000 words per doc)
- [ ] Phrase search with quotes supported
- [ ] Title matches ranked higher than content
- [ ] Matching text highlighted in results
- [ ] Performance: <200ms for typical queries on 100+ docs

## Notes
src/lib/server/search.ts. No external deps.
