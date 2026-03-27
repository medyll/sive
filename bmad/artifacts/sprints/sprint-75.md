# Sprint 75 Planning — Mobile Polish & Touch Optimization

**Status:** Planning  
**Target Date:** 2026-03-30  
**Planned Stories:** 6  
**Estimated Effort:** 2-3 days

---

## Sprint Goal

Optimize the writing experience for mobile and touch devices with responsive improvements, touch gestures, and mobile-first UI patterns.

---

## Context

**Current State:**
- ✅ Basic responsive layout (works on mobile)
- ✅ Touch-friendly tap targets (44px minimum)
- ✅ Mobile panel positioning (S27-04)

**Gaps:**
- ❌ No touch gestures (swipe, pinch)
- ❌ Virtual keyboard not optimized
- ❌ Mobile editor lacks toolbar shortcuts
- ❌ No offline indicator for mobile networks
- ❌ Landscape mode not optimized
- ❌ Mobile navigation could be smoother

**User Feedback:**
- "Hard to type and access toolbar on phone"
- "Want to swipe between documents"
- "Keyboard covers half the screen"

---

## Stories

### S75-01: Mobile Navigation Drawer

**Goal:** Replace desktop tabs with slide-out navigation drawer on mobile.

**Acceptance Criteria:**
- [ ] Hamburger menu icon visible on mobile (<768px)
- [ ] Drawer slides in from left with smooth animation
- [ ] Navigation items: Documents, Discover, Challenges, Leaderboard, Settings
- [ ] Active page highlighted
- [ ] Drawer closes on outside click or Escape
- [ ] Swipe gesture to open/close (touch devices)

**Files to Create:**
- `src/lib/elements/MobileNavDrawer.svelte`
- `src/lib/mobileNavStore.svelte.ts`

**Estimated Time:** 3-4 hours

---

### S75-02: Touch Gestures for Editor

**Goal:** Add swipe gestures for document navigation and actions.

**Acceptance Criteria:**
- [ ] Swipe left → Next document
- [ ] Swipe right → Previous document
- [ ] Swipe down → Hide toolbar (focus mode)
- [ ] Swipe up → Show toolbar
- [ ] Visual feedback during swipe
- [ ] Gesture sensitivity adjustable

**Files to Create:**
- `src/lib/gestures/swipe.ts` — Swipe gesture detector
- `src/lib/gestures/index.ts` — Gesture exports

**Estimated Time:** 4-5 hours

---

### S75-03: Mobile Editor Toolbar

**Goal:** Floating toolbar optimized for thumb reach on mobile.

**Acceptance Criteria:**
- [ ] Toolbar positioned at bottom (thumb-friendly)
- [ ] Common actions: Bold, Italic, Undo, Redo, AI Rewrite
- [ ] Toolbar collapsible to save space
- [ ] Hides on scroll, shows on tap
- [ ] Landscape mode: moves to side

**Files to Create:**
- `src/lib/elements/MobileEditorToolbar.svelte`

**Estimated Time:** 3-4 hours

---

### S75-04: Virtual Keyboard Optimization

**Goal:** Improve typing experience with virtual keyboard.

**Acceptance Criteria:**
- [ ] Editor scrolls to keep cursor visible above keyboard
- [ ] Toolbar doesn't overlap keyboard
- [ ] Enter key creates new paragraph (not submit)
- [ ] Tab key inserts spaces (not focus change)
- [ ] iOS Safari keyboard height handled

**Files to Modify:**
- `src/lib/elements/EditorPanel.svelte` — Keyboard handling

**Estimated Time:** 3-4 hours

---

### S75-05: Offline Indicator & Mobile Network Handling

**Goal:** Show clear offline status for mobile users on spotty networks.

**Acceptance Criteria:**
- [ ] Offline banner visible when connection lost
- [ ] Auto-retry saves when connection restored
- [ ] Queue pending saves offline
- [ ] Sync indicator when reconnecting
- [ ] Works with existing OfflineBanner (S21-01)

**Files to Modify:**
- `src/lib/elements/OfflineBanner.svelte` — Enhance with sync status
- `src/lib/offlineStore.svelte.ts` — Add save queue

**Estimated Time:** 2-3 hours

---

### S75-06: Mobile E2E Tests

**Goal:** Test mobile UI and gestures with Playwright mobile emulation.

**Acceptance Criteria:**
- [ ] Test navigation drawer open/close
- [ ] Test swipe gestures
- [ ] Test mobile toolbar
- [ ] Test offline indicator
- [ ] Test on mobile viewport (375x667 iPhone SE)
- [ ] 80%+ mobile UI coverage

**Files to Create:**
- `e2e/mobile-flow.spec.ts` — Mobile E2E tests

**Estimated Time:** 3-4 hours

---

## Risk & Mitigations

| Risk | Mitigation |
|------|-----------|
| Gesture conflicts with browser | Use edge swipes only, add sensitivity threshold |
| Keyboard handling varies by device | Test on iOS Safari, Chrome Android, Firefox Mobile |
| Performance issues on low-end devices | Debounce gesture detection, use CSS transforms |
| Offline queue grows too large | Limit to 10 pending saves, warn user |

---

## Dependencies

- ✅ S21-01: Offline Banner (existing component)
- ✅ S27-04: Mobile Panel Positioning (existing patterns)
- ✅ S73: AI Features (toolbar integration)

---

## Success Metrics

- ✅ Navigation drawer works smoothly on mobile
- ✅ Swipe gestures recognized reliably
- ✅ Keyboard doesn't cover editor
- ✅ Offline status clearly indicated
- ✅ Mobile E2E tests passing
- ✅ Lighthouse mobile score >90

---

## Alternative: Test Hardening Sprint

If mobile polish blocked by device testing:

### Sprint 75B — E2E Test Hardening

**Stories:**
- S75B-01: E2E Tests for Challenge Features (S69)
- S75B-02: E2E Tests for AI Features (S73)
- S75B-03: E2E Tests for Server-Side Sync (S74)
- S75B-04: Fix Flaky Parallel Tests
- S75B-05: E2E Performance Improvements

---

## Recommendation

**Proceed with Mobile Polish (S75)** because:
1. Mobile writers are growing segment
2. Touch optimization improves all device UX
3. Offline handling critical for mobile networks
4. Can pivot to E2E tests if gesture testing blocked

---

**Created:** 2026-03-29  
**Planning Role:** PM  
**Review:** Ready for dev
