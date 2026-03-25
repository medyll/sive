/**
 * badgesStore — Track user achievements via badges & milestones.
 *
 * Badges are earned through:
 * - Streak milestones: 7, 30, 100, 365 consecutive days
 * - Word count milestones: 10,000, 50,000, 100,000 total words
 * - Special achievements (future: first document, social share, etc.)
 *
 * Badges are derived from goalsStore & streakStore, no separate persistence.
 */

export interface Badge {
	id: string;
	name: string;
	description: string;
	icon: string;
	category: 'streak' | 'words' | 'special';
	earnedAt?: number; // Timestamp when badge was earned
	progress?: {
		current: number;
		target: number;
	};
}

export const BADGE_DEFINITIONS: Badge[] = [
	// Streak milestones
	{
		id: 'streak-7',
		name: 'One Week Wonder',
		description: '7-day writing streak',
		icon: '🥉',
		category: 'streak'
	},
	{
		id: 'streak-30',
		name: 'Monthly Master',
		description: '30-day writing streak',
		icon: '🥈',
		category: 'streak'
	},
	{
		id: 'streak-100',
		name: 'Century Club',
		description: '100-day writing streak',
		icon: '🥇',
		category: 'streak'
	},
	{
		id: 'streak-365',
		name: 'Eternal Wordsmith',
		description: '365-day writing streak',
		icon: '👑',
		category: 'streak'
	},

	// Word count milestones
	{
		id: 'words-10k',
		name: 'Bookworm',
		description: '10,000 words written',
		icon: '📚',
		category: 'words'
	},
	{
		id: 'words-50k',
		name: 'Novelist',
		description: '50,000 words written',
		icon: '🚀',
		category: 'words'
	},
	{
		id: 'words-100k',
		name: 'Literary Legend',
		description: '100,000 words written',
		icon: '📖',
		category: 'words'
	}
];

function createBadgesStore() {
	// Import stores to compute badges
	// Note: We lazy-import to avoid circular dependencies
	let earnedBadges = $state<Map<string, Badge>>(new Map());
	let allBadges = $derived.by(() => {
		const badges: Badge[] = [];
		for (const def of BADGE_DEFINITIONS) {
			const earned = earnedBadges.get(def.id);
			badges.push(earned || def);
		}
		return badges;
	});

	function updateBadges(streakData: { currentStreak: number; longestStreak: number }, wordCount: number) {
		const now = Date.now();

		// Check streak milestones
		if (streakData.longestStreak >= 365 && !earnedBadges.has('streak-365')) {
			earnedBadges.set('streak-365', {
				...BADGE_DEFINITIONS.find((b) => b.id === 'streak-365')!,
				earnedAt: now
			});
		}
		if (streakData.longestStreak >= 100 && !earnedBadges.has('streak-100')) {
			earnedBadges.set('streak-100', {
				...BADGE_DEFINITIONS.find((b) => b.id === 'streak-100')!,
				earnedAt: now
			});
		}
		if (streakData.longestStreak >= 30 && !earnedBadges.has('streak-30')) {
			earnedBadges.set('streak-30', {
				...BADGE_DEFINITIONS.find((b) => b.id === 'streak-30')!,
				earnedAt: now
			});
		}
		if (streakData.longestStreak >= 7 && !earnedBadges.has('streak-7')) {
			earnedBadges.set('streak-7', {
				...BADGE_DEFINITIONS.find((b) => b.id === 'streak-7')!,
				earnedAt: now
			});
		}

		// Check word count milestones
		if (wordCount >= 100000 && !earnedBadges.has('words-100k')) {
			earnedBadges.set('words-100k', {
				...BADGE_DEFINITIONS.find((b) => b.id === 'words-100k')!,
				earnedAt: now
			});
		}
		if (wordCount >= 50000 && !earnedBadges.has('words-50k')) {
			earnedBadges.set('words-50k', {
				...BADGE_DEFINITIONS.find((b) => b.id === 'words-50k')!,
				earnedAt: now
			});
		}
		if (wordCount >= 10000 && !earnedBadges.has('words-10k')) {
			earnedBadges.set('words-10k', {
				...BADGE_DEFINITIONS.find((b) => b.id === 'words-10k')!,
				earnedAt: now
			});
		}
	}

	function getEarnedBadges(): Badge[] {
		return Array.from(earnedBadges.values());
	}

	function getNextBadge(category: 'streak' | 'words', currentValue: number): Badge | null {
		const badges = BADGE_DEFINITIONS.filter((b) => b.category === category).sort((a, b) => {
			const aThreshold = category === 'streak' ? parseInt(a.id.split('-')[1]) : parseInt(a.id.split('-')[1]);
			const bThreshold = category === 'streak' ? parseInt(b.id.split('-')[1]) : parseInt(b.id.split('-')[1]);
			return aThreshold - bThreshold;
		});

		for (const badge of badges) {
			const threshold = category === 'streak' ? parseInt(badge.id.split('-')[1]) : parseInt(badge.id.split('-')[1]);
			if (currentValue < threshold && !earnedBadges.has(badge.id)) {
				return {
					...badge,
					progress: {
						current: currentValue,
						target: threshold
					}
				};
			}
		}

		return null;
	}

	function getBadgeProgress(category: 'streak' | 'words', currentValue: number): { badge: Badge; progress: number } | null {
		const nextBadge = getNextBadge(category, currentValue);
		if (!nextBadge || !nextBadge.progress) return null;

		const progress = Math.min(1, currentValue / nextBadge.progress.target);
		return { badge: nextBadge, progress };
	}

	function hasBadge(badgeId: string): boolean {
		return earnedBadges.has(badgeId);
	}

	function reset() {
		earnedBadges = new Map();
	}

	return {
		get allBadges() {
			return allBadges;
		},
		get earnedBadges() {
			return getEarnedBadges();
		},
		updateBadges,
		getEarnedBadges,
		getNextBadge,
		getBadgeProgress,
		hasBadge,
		reset
	};
}

export const badgesStore = createBadgesStore();
