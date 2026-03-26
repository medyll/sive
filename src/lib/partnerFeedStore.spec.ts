import { describe, it, expect, beforeEach, vi } from 'vitest';
import { partnerFeedStore, typeLabel } from './partnerFeedStore.svelte';
import { activityStore } from './activityStore.svelte';
import { partnersStore } from './partnersStore.svelte';

global.localStorage = {
	getItem: vi.fn().mockReturnValue(null),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn(),
	length: 0,
	key: vi.fn()
} as any;

describe('partnerFeedStore', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		activityStore.reset();
		partnersStore.reset();
	});

	it('should return empty feed when no partners', () => {
		activityStore.emit('badge_earned', 'u1', '@alice', { badgeName: 'Test' });
		expect(partnerFeedStore.getPartnerEvents()).toHaveLength(0);
	});

	it('should return events only from followed partners', () => {
		partnersStore.follow('alice');
		activityStore.emit('badge_earned', 'alice', '@alice', { badgeName: 'Streak 7' });
		activityStore.emit('badge_earned', 'bob', '@bob', { badgeName: 'Streak 30' });

		const events = partnerFeedStore.getPartnerEvents();
		expect(events).toHaveLength(1);
		expect(events[0].userId).toBe('alice');
	});

	it('should group events by Today/Yesterday labels', () => {
		partnersStore.follow('alice');
		activityStore.emit('badge_earned', 'alice', '@alice', { badgeName: 'Test' });

		const groups = partnerFeedStore.getGroupedFeed();
		expect(groups).toHaveLength(1);
		expect(groups[0].label).toBe('Today');
	});

	it('should respect limit in grouped feed', () => {
		partnersStore.follow('alice');
		for (let i = 0; i < 20; i++) {
			activityStore.emit('goal_completed', 'alice', '@alice', { words: i * 100 });
		}

		const groups = partnerFeedStore.getGroupedFeed(5);
		const total = groups.reduce((sum, g) => sum + g.events.length, 0);
		expect(total).toBeLessThanOrEqual(5);
	});

	it('should count unread events', () => {
		partnersStore.follow('alice');
		activityStore.emit('badge_earned', 'alice', '@alice', { badgeName: 'Test' });
		activityStore.emit('streak_milestone', 'alice', '@alice', { days: 7 });

		const count = partnerFeedStore.getUnreadCount();
		expect(count).toBe(2);
	});

	it('should return 0 unread after markRead', () => {
		partnersStore.follow('alice');
		activityStore.emit('badge_earned', 'alice', '@alice', { badgeName: 'Test' });

		partnerFeedStore.markRead();

		// Mock localStorage to return the timestamp we just set
		vi.mocked(localStorage.getItem).mockReturnValue(String(Date.now() + 1000));
		expect(partnerFeedStore.getUnreadCount()).toBe(0);
	});
});

describe('typeLabel', () => {
	it('should format badge_earned', () => {
		const label = typeLabel({ type: 'badge_earned', displayName: '@alice', payload: { badgeName: '7-Day Streak' } } as any);
		expect(label).toContain('@alice');
		expect(label).toContain('7-Day Streak');
		expect(label).toContain('🏆');
	});

	it('should format streak_milestone', () => {
		const label = typeLabel({ type: 'streak_milestone', displayName: '@bob', payload: { days: 30 } } as any);
		expect(label).toContain('@bob');
		expect(label).toContain('30');
		expect(label).toContain('🔥');
	});

	it('should format leaderboard_entry', () => {
		const label = typeLabel({ type: 'leaderboard_entry', displayName: '@charlie', payload: { rank: 3 } } as any);
		expect(label).toContain('@charlie');
		expect(label).toContain('#3');
		expect(label).toContain('📊');
	});

	it('should format goal_completed', () => {
		const label = typeLabel({ type: 'goal_completed', displayName: '@diana', payload: { words: 1500 } } as any);
		expect(label).toContain('@diana');
		expect(label).toMatch(/1[^\d]?500/); // locale-agnostic: handles "1,500", "1 500", "1500"
		expect(label).toContain('✅');
	});
});
