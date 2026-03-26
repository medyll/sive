import { describe, it, expect, beforeEach } from 'vitest';
import { GET } from './alltime/+server';
import { submitWeeklyStats, __resetLeaderboard } from '$lib/server/leaderboardQueries';

describe('GET /api/leaderboard/alltime', () => {
	beforeEach(() => {
		__resetLeaderboard();
	});

	it('should return empty list when no entries', async () => {
		const event = { url: new URL('http://x/api/leaderboard/alltime'), locals: {} } as any;
		const res = await GET(event);
		const body = await res.json();
		expect(body.entries).toHaveLength(0);
	});

	it('should default to streak view', async () => {
		submitWeeklyStats('u1', { weeklyWords: 1000, currentStreak: 30, totalWords: 100000 }, false, '');
		const event = { url: new URL('http://x/api/leaderboard/alltime'), locals: {} } as any;
		const res = await GET(event);
		const body = await res.json();
		expect(body.view).toBe('streak');
	});

	it('should switch to words view', async () => {
		const event = {
			url: new URL('http://x/api/leaderboard/alltime?view=words'),
			locals: {}
		} as any;
		const res = await GET(event);
		const body = await res.json();
		expect(body.view).toBe('words');
	});

	it('should rank by streak in streak view', async () => {
		submitWeeklyStats('u1', { weeklyWords: 500, currentStreak: 5, totalWords: 5000 }, false, '');
		submitWeeklyStats('u2', { weeklyWords: 500, currentStreak: 50, totalWords: 5000 }, false, '');
		const event = { url: new URL('http://x/api/leaderboard/alltime'), locals: {} } as any;
		const res = await GET(event);
		const body = await res.json();
		expect(body.entries[0].userId).toBe('u2'); // Higher streak first
	});

	it('should rank by total words in words view', async () => {
		submitWeeklyStats('u1', { weeklyWords: 500, currentStreak: 5, totalWords: 200000 }, false, '');
		submitWeeklyStats('u2', { weeklyWords: 500, currentStreak: 50, totalWords: 10000 }, false, '');
		const event = {
			url: new URL('http://x/api/leaderboard/alltime?view=words'),
			locals: {}
		} as any;
		const res = await GET(event);
		const body = await res.json();
		expect(body.entries[0].userId).toBe('u1'); // More total words first
	});

	it('should include user rank when authenticated', async () => {
		submitWeeklyStats('user-99', { weeklyWords: 2000, currentStreak: 10, totalWords: 20000 }, false, '');
		const event = {
			url: new URL('http://x/api/leaderboard/alltime'),
			locals: { user: { id: 'user-99' } }
		} as any;
		const res = await GET(event);
		const body = await res.json();
		expect(body.userRank).not.toBeNull();
		expect(body.userRank.streakRank).toBe(1);
	});
});
