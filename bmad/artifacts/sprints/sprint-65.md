# Sprint 65 — Goals Refinement & Social

**Goal:** Expand writing goals system with templates, achievements, and social sharing to increase user engagement and motivation.

**Duration:** 2026-03-25 – 2026-03-31
**Status:** Planning
**Target Progress:** 100%

---

## User Stories

### S65-01: Goal Templates System
**Story:** As a user, I want to choose from pre-built goal templates so I can quickly set realistic writing targets.

**Acceptance Criteria:**
- [ ] Create `goalTemplates.ts` with template definitions:
  - NaNoWriMo: 50,000 words in November (1,667/day)
  - Daily Minimum: 500 words/day (configurable)
  - Weekly Target: 5,000 words/week (714/day)
  - Short Sprint: 10,000 words in 2 weeks (714/day)
  - Custom: User enters target + duration
- [ ] Add template picker modal to settings
- [ ] "Apply Template" button pre-fills daily target & name
- [ ] Show template progress bar with name (e.g., "NaNoWriMo: 15,342 / 50,000")
- [ ] Template history: user can view/switch between applied templates

**Files to create/modify:**
- `src/lib/goalTemplates.ts` (new)
- `src/lib/elements/GoalTemplateModal.svelte` (new)
- `src/routes/settings/+page.svelte` (modify)

---

### S65-02: Achievement Badges & Milestones
**Story:** As a user, I want to earn badges for streak milestones so I can see my progress and feel motivated.

**Acceptance Criteria:**
- [ ] Define badge tiers:
  - 7-day streak: 🥉 Bronze
  - 30-day streak: 🥈 Silver
  - 100-day streak: 🥇 Gold
  - 365-day streak: 👑 Platinum
  - 10,000 words written: 📚 Bookworm
  - 50,000 words written: 🚀 Novelist
- [ ] Create `badgesStore.svelte.ts` to track earned badges
- [ ] Display badges on GoalsDashboard (earned only)
- [ ] Show "next badge" progress (e.g., "3 more days to Silver")
- [ ] Badge popup with achievement date & description

**Files to create/modify:**
- `src/lib/badgesStore.svelte.ts` (new)
- `src/lib/elements/BadgeDisplay.svelte` (new)
- `src/lib/elements/GoalsDashboard.svelte` (modify)

---

### S65-03: Share Goals & Streaks
**Story:** As a user, I want to share my writing goals and streaks with others so I can celebrate progress and get support.

**Acceptance Criteria:**
- [ ] "Share" button on GoalsDashboard
- [ ] Generate shareable text:
  - "I'm on a 🔥 7-day writing streak! Join me at [app-url]"
  - "My goal: 500 words/day. Current streak: 7 days ✨"
  - Include badges earned in share message
- [ ] Social share buttons: Twitter, Copy to clipboard, Email
- [ ] Generate unique share URL (optional, links to public goal profile)
- [ ] Share modal with preview before posting
- [ ] Track share count (optional analytics)

**Files to create/modify:**
- `src/lib/elements/ShareGoalsModal.svelte` (new)
- `src/lib/shareGoals.ts` (new utility)
- `src/lib/elements/GoalsDashboard.svelte` (modify)

---

### S65-04: Weekly Goal Reset & History
**Story:** As a user, I want to see my weekly progress and reset goals on schedule so I can track patterns over time.

**Acceptance Criteria:**
- [ ] Weekly summary view: Mon–Sun progress bars
- [ ] Goal reset schedule: Default Sunday 11:59 PM (timezone-aware)
- [ ] Configurable reset day (settings)
- [ ] Weekly history: Last 12 weeks of goal attainment
- [ ] Stats: "Weeks goal met: 8/12", "Best week: 12,450 words"
- [ ] Store weekly snapshots in localStorage: `sive:goals:weekly-history`
- [ ] Visual: Calendar heatmap of weekly achievement

**Files to create/modify:**
- `src/lib/weeklyGoalsStore.svelte.ts` (new)
- `src/lib/elements/WeeklyGoalsPanel.svelte` (new)
- `src/lib/elements/GoalsDashboard.svelte` (modify)
- `src/routes/settings/+page.svelte` (add reset schedule picker)

---

### S65-05: Unit Tests & E2E Smoke
**Story:** Verify all goal templates, badges, and sharing features work correctly across browsers.

**Acceptance Criteria:**
- [ ] Unit tests: goalTemplates, badgesStore, weeklyGoalsStore
- [ ] Component tests: GoalTemplateModal, BadgeDisplay, ShareGoalsModal, WeeklyGoalsPanel
- [ ] E2E smoke: Apply template → earn badge → share goal
- [ ] Test coverage: ≥80% for new files
- [ ] All tests pass: `npm run test:unit && npm run test:e2e`

**Files to create:**
- `src/lib/goalTemplates.spec.ts`
- `src/lib/badgesStore.spec.ts`
- `src/lib/weeklyGoalsStore.spec.ts`
- `src/lib/elements/GoalTemplateModal.spec.ts`
- `e2e/goals-templates.spec.ts`

---

## Technical Decisions

**Storage Strategy:**
- Templates: Hardcoded in `goalTemplates.ts` (no DB needed)
- Badges: Computed from `goalsStore` & `streakStore` (no separate storage)
- Weekly history: localStorage in `sive:goals:weekly-history`
- Shares: No persistence needed (stateless share URLs)

**Timezone Handling:**
- Weekly reset uses user's local timezone
- All dates stored as YYYY-MM-DD (UTC normalized)
- Reset schedule checked daily on app load

**UI Integration:**
- All new features added to GoalsDashboard or settings
- No new routes required (settings expansion)
- Modal-based for templates & sharing (non-blocking)

---

## Success Criteria

- ✅ All 5 stories implemented & tested
- ✅ Settings page shows template picker + reset schedule
- ✅ GoalsDashboard displays badges & share button
- ✅ Streak sharing generates pre-formatted message
- ✅ Weekly history tracks 12-week performance
- ✅ Unit & E2E tests pass (≥80% coverage)

---

## Estimation

| Story | Complexity | Est. Hours |
|-------|-----------|-----------|
| S65-01 | Medium | 4h |
| S65-02 | Medium | 3h |
| S65-03 | Low | 2h |
| S65-04 | High | 5h |
| S65-05 | Medium | 4h |
| **Total** | | **18h** |

---

## Blockers / Risks

- **None identified** — all features can be implemented with existing architecture
- Timezone handling requires JS Date API (standard support)
- localStorage quota: Badge/weekly data minimal (~1KB)

---

## Next Steps

1. [DEV] Implement S65-01 (templates)
2. [DEV] Implement S65-02 (badges)
3. [DEV] Implement S65-03 (sharing)
4. [DEV] Implement S65-04 (weekly history)
5. [TEST] Write & run all tests
6. [REVIEW] Code quality & UX review
7. [READY] Sprint complete, plan Sprint 66
