---
id: S42-04
sprint: 42
title: analytics-panel-component
status: done
---

# S42-04 — AnalyticsPanel Component — Word Count Chart

## Goal
Build an AnalyticsPanel Svelte component rendering a 7-day bar chart of daily word counts.

## Acceptance Criteria
- [ ] Fetches data from `/api/analytics` on mount
- [ ] Renders a bar chart with day labels (Mon–Sun)
- [ ] Highlights today's bar
- [ ] Shows total words written this week below the chart
- [ ] Loading and empty states handled

## Notes
Component at `src/lib/elements/AnalyticsPanel.svelte`.
