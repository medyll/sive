/**
 * discoveryQueries.spec.ts — Tests for writer discovery in-memory store
 * 
 * S69-06: Unit Tests (Sprint Coverage)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
	submitDiscoveryProfile,
	listDiscoveryProfiles,
	removeDiscoveryProfile,
	__resetDiscovery,
	type DiscoveryProfile
} from './discoveryQueries';

function makeProfile(overrides: Partial<DiscoveryProfile> = {}): DiscoveryProfile {
	return {
		userId: 'user_' + Math.random().toString(36).slice(2, 7),
		displayName: '@writer' + Math.floor(Math.random() * 1000),
		currentStreak: 0,
		longestStreak: 0,
		totalWords: 0,
		topBadgeIcon: '✍️',
		topBadgeName: 'Writer',
		submittedAt: new Date().toISOString(),
		...overrides
	};
}

describe('discoveryQueries', () => {
	beforeEach(() => {
		__resetDiscovery();
	});

	describe('submitDiscoveryProfile', () => {
		it('adds a new profile to the store', () => {
			const profile = makeProfile({
				userId: 'user1',
				displayName: '@alice',
				currentStreak: 7
			});

			submitDiscoveryProfile(profile);

			const profiles = listDiscoveryProfiles();
			expect(profiles).toHaveLength(1);
			expect(profiles[0].userId).toBe('user1');
			expect(profiles[0].displayName).toBe('@alice');
		});

		it('updates existing profile with same userId', () => {
			const profile1 = makeProfile({ userId: 'user1', currentStreak: 5 });
			const profile2 = makeProfile({ userId: 'user1', currentStreak: 10 });

			submitDiscoveryProfile(profile1);
			submitDiscoveryProfile(profile2);

			const profiles = listDiscoveryProfiles();
			expect(profiles).toHaveLength(1);
			expect(profiles[0].currentStreak).toBe(10);
		});

		it('sets submittedAt timestamp automatically', () => {
			const before = Date.now();
			const profile = makeProfile({ userId: 'user1' });
			submitDiscoveryProfile(profile);

			const profiles = listDiscoveryProfiles();
			const submittedAt = new Date(profiles[0].submittedAt).getTime();

			expect(submittedAt).toBeGreaterThanOrEqual(before);
			expect(submittedAt).toBeLessThanOrEqual(Date.now());
		});

		it('stores all profile fields correctly', () => {
			const profile = makeProfile({
				userId: 'user1',
				displayName: '@bob',
				currentStreak: 14,
				longestStreak: 30,
				totalWords: 50000,
				topBadgeIcon: '🏆',
				topBadgeName: 'Novelist'
			});

			submitDiscoveryProfile(profile);

			const profiles = listDiscoveryProfiles();
			expect(profiles[0]).toMatchObject({
				userId: 'user1',
				displayName: '@bob',
				currentStreak: 14,
				longestStreak: 30,
				totalWords: 50000,
				topBadgeIcon: '🏆',
				topBadgeName: 'Novelist'
			});
		});
	});

	describe('listDiscoveryProfiles', () => {
		it('returns empty array when no profiles submitted', () => {
			const profiles = listDiscoveryProfiles();
			expect(profiles).toEqual([]);
		});

		it('sorts profiles by currentStreak descending', () => {
			submitDiscoveryProfile(makeProfile({ userId: 'user1', currentStreak: 5 }));
			submitDiscoveryProfile(makeProfile({ userId: 'user2', currentStreak: 15 }));
			submitDiscoveryProfile(makeProfile({ userId: 'user3', currentStreak: 10 }));

			const profiles = listDiscoveryProfiles();

			expect(profiles).toHaveLength(3);
			expect(profiles[0].currentStreak).toBe(15);
			expect(profiles[1].currentStreak).toBe(10);
			expect(profiles[2].currentStreak).toBe(5);
		});

		it('handles equal streaks (stable order)', () => {
			submitDiscoveryProfile(makeProfile({ userId: 'user1', currentStreak: 10 }));
			submitDiscoveryProfile(makeProfile({ userId: 'user2', currentStreak: 10 }));
			submitDiscoveryProfile(makeProfile({ userId: 'user3', currentStreak: 10 }));

			const profiles = listDiscoveryProfiles();

			expect(profiles).toHaveLength(3);
			expect(profiles.map(p => p.currentStreak)).toEqual([10, 10, 10]);
		});
	});

	describe('removeDiscoveryProfile', () => {
		it('removes profile by userId', () => {
			submitDiscoveryProfile(makeProfile({ userId: 'user1' }));
			submitDiscoveryProfile(makeProfile({ userId: 'user2' }));

			removeDiscoveryProfile('user1');

			const profiles = listDiscoveryProfiles();
			expect(profiles).toHaveLength(1);
			expect(profiles[0].userId).toBe('user2');
		});

		it('is a no-op for non-existent userId', () => {
			submitDiscoveryProfile(makeProfile({ userId: 'user1' }));

			removeDiscoveryProfile('nonexistent');

			const profiles = listDiscoveryProfiles();
			expect(profiles).toHaveLength(1);
			expect(profiles[0].userId).toBe('user1');
		});

		it('removes all profiles when called for each', () => {
			submitDiscoveryProfile(makeProfile({ userId: 'user1' }));
			submitDiscoveryProfile(makeProfile({ userId: 'user2' }));
			submitDiscoveryProfile(makeProfile({ userId: 'user3' }));

			removeDiscoveryProfile('user1');
			removeDiscoveryProfile('user2');
			removeDiscoveryProfile('user3');

			const profiles = listDiscoveryProfiles();
			expect(profiles).toEqual([]);
		});
	});

	describe('__resetDiscovery', () => {
		it('clears all profiles from the store', () => {
			submitDiscoveryProfile(makeProfile({ userId: 'user1' }));
			submitDiscoveryProfile(makeProfile({ userId: 'user2' }));
			submitDiscoveryProfile(makeProfile({ userId: 'user3' }));

			__resetDiscovery();

			const profiles = listDiscoveryProfiles();
			expect(profiles).toEqual([]);
		});

		it('allows re-submitting after reset', () => {
			submitDiscoveryProfile(makeProfile({ userId: 'user1' }));
			__resetDiscovery();
			submitDiscoveryProfile(makeProfile({ userId: 'user2' }));

			const profiles = listDiscoveryProfiles();
			expect(profiles).toHaveLength(1);
			expect(profiles[0].userId).toBe('user2');
		});
	});

	describe('DiscoveryProfile type', () => {
		it('has all required fields', () => {
			const profile: DiscoveryProfile = {
				userId: 'user1',
				displayName: '@test',
				currentStreak: 5,
				longestStreak: 10,
				totalWords: 1000,
				topBadgeIcon: '✍️',
				topBadgeName: 'Writer',
				submittedAt: new Date().toISOString()
			};

			expect(Object.keys(profile)).toEqual([
				'userId',
				'displayName',
				'currentStreak',
				'longestStreak',
				'totalWords',
				'topBadgeIcon',
				'topBadgeName',
				'submittedAt'
			]);
		});
	});
});
