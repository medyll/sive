---
id: S33-01
sprint: 33
title: stats-computation-engine
status: done
---

# S33-01 — Stats Computation Engine

## Goal
Create src/lib/server/stats.ts with word/sentence/paragraph/reading-time computations and user-level aggregation with streaks.

## Acceptance Criteria
- [ ] countWords, countSentences, countParagraphs, readingTimeMinutes implemented
- [ ] computeDocStats returns all metrics + charCount
- [ ] computeUserStats returns totalWords, totalDocs, longestDoc, activityByDay, currentStreak, longestStreak

## Notes
src/lib/server/stats.ts. Activity based on updated_at dates.
