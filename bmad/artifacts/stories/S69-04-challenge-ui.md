# S69-04 — Challenge UI (Create & Join)

**Status:** ✅ Done  
**Date:** 2026-03-26

## Goal

Create UI for browsing, creating, and joining writing challenges.

## Implementation

### Files Created

- `src/routes/challenges/+page.svelte` — Challenges page
- `src/lib/elements/ChallengeCard.svelte` — Challenge card component

### Features

#### Challenges Page (`/challenges`)

- **Create Button:** Opens inline form to create new challenge
- **Tab Navigation:** "All Active" vs "Joined" filter
- **Create Form:**
  - Title (max 80 chars)
  - Description (max 300 chars)
  - Target Words (number input)
  - Duration Days (number input)
- **Challenge Grid:** Responsive card layout
- **Empty States:** Helpful messages for no challenges

#### Challenge Card

- **Header:** Title + days remaining
- **Description:** Challenge details
- **Meta:** Target words + duration
- **Progress Bar:** Visual progress (joined only)
- **Progress Label:** "X / Y words (Z%)"
- **Join/Leave Button:** Toggle membership

### Challenge Card Design

```svelte
<div class="challenge-card" class:joined>
  <div class="card-header">
    <h3>{challenge.title}</h3>
    <span class="days-left">{daysLeft}d left</span>
  </div>
  
  <p class="card-desc">{challenge.description}</p>
  
  <div class="card-meta">
    <span>🎯 {challenge.targetWords.toLocaleString()} words</span>
    <span>📅 {challenge.durationDays} days</span>
  </div>
  
  {#if joined}
    <div class="progress-bar">
      <div class="progress-fill" style="width: {pct}%"></div>
    </div>
    <p class="progress-label">{progress.wordsContributed} / {target} ({pct}%)</p>
  {/if}
  
  <button class="btn-join">{joined ? '✓ Joined' : '+ Join'}</button>
</div>
```

### Tab Logic

```typescript
$: active = challengeStore.getActive();
$: joined = active.filter((c) => challengeStore.isJoined(c.id));
$: displayed = tab === 'joined' ? joined : active;
```

## Acceptance Criteria

- [x] `/challenges` page with active/joined tabs
- [x] "Create challenge" button → inline form
- [x] `ChallengeCard.svelte` showing progress bar, participant count, days left
- [x] Join/leave button on each card
- [ ] Unit tests — **Deferred to S69-06**

## Files Created

| File | Purpose |
|------|---------|
| `src/routes/challenges/+page.svelte` | Challenges page UI |
| `src/lib/elements/ChallengeCard.svelte` | Card component |

## Related Stories

- S69-03: Community Writing Challenge Store
- S69-05: Wire Challenge Progress to Writing Activity
- S27-04: Mobile Panel Positioning (responsive design)

## Styling

**Card Hover Effect:**
```css
.challenge-card:hover {
  border-color: var(--color-primary, #7c3aed);
  box-shadow: 0 2px 10px rgba(124, 58, 237, 0.08);
}
```

**Progress Bar:**
```css
.progress-fill {
  height: 100%;
  background: var(--color-primary, #7c3aed);
  transition: width 0.3s;
}
```

## Testing Notes

Manual test:
1. Visit `/challenges`
2. Click "+ Create" — form should appear
3. Fill form, submit — challenge should appear in grid
4. Click "+ Join Challenge" — button should change to "✓ Joined"
5. Progress bar should appear
6. Write words (via editor) — progress bar should update
7. Click "✓ Joined" — should leave challenge

Unit tests to add (S69-06):
- ChallengeCard component — progress display, join/leave toggle
- Challenges page — tab filtering, create form submission
