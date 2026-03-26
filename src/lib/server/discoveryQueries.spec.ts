import { describe, it, expect, beforeEach } from 'vitest';
import {
	submitDiscoveryProfile,
	listDiscoveryProfiles,
	removeDiscoveryProfile,
	__resetDiscovery
} from './discoveryQueries';

const makeProfile = (userId: string, currentStreak = 0) => ({
	userId,
	displayName: `@user${userId}`,
	currentStreak,
	longestStreak: currentStreak,
	totalWords: 0,
	topBadgeIcon: '✍️',
	topBadgeName: 'Writer',
	submittedAt: new Date().toISOString()
});

beforeEach(() => __resetDiscovery());

describe('submitDiscoveryProfile', () => {
	it('adds a profile', () => {
		submitDiscoveryProfile(makeProfile('u1'));
		expect(listDiscoveryProfiles()).toHaveLength(1);
	});

	it('updates existing profile for same userId', () => {
		submitDiscoveryProfile(makeProfile('u1', 5));
		submitDiscoveryProfile(makeProfile('u1', 10));
		const list = listDiscoveryProfiles();
		expect(list).toHaveLength(1);
		expect(list[0].currentStreak).toBe(10);
	});
});

describe('listDiscoveryProfiles', () => {
	it('returns empty array initially', () => {
		expect(listDiscoveryProfiles()).toEqual([]);
	});

	it('sorts by currentStreak descending', () => {
		submitDiscoveryProfile(makeProfile('u1', 3));
		submitDiscoveryProfile(makeProfile('u2', 10));
		submitDiscoveryProfile(makeProfile('u3', 1));
		const list = listDiscoveryProfiles();
		expect(list[0].userId).toBe('u2');
		expect(list[1].userId).toBe('u1');
		expect(list[2].userId).toBe('u3');
	});
});

describe('removeDiscoveryProfile', () => {
	it('removes a profile', () => {
		submitDiscoveryProfile(makeProfile('u1'));
		removeDiscoveryProfile('u1');
		expect(listDiscoveryProfiles()).toHaveLength(0);
	});

	it('is a no-op for unknown userId', () => {
		submitDiscoveryProfile(makeProfile('u1'));
		removeDiscoveryProfile('unknown');
		expect(listDiscoveryProfiles()).toHaveLength(1);
	});
});
