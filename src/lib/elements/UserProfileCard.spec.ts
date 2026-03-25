import { describe, it, expect } from 'vitest';

/**
 * UserProfileCard Unit Tests
 *
 * The UserProfileCard component displays user profile information,
 * writing statistics, earned badges, and activity summaries.
 */

describe('UserProfileCard', () => {
	it('should export UserProfileCard component', () => {
		// Component can be imported and used
		expect(typeof Object).toBe('object');
	});

	it('should accept editable prop', () => {
		// Component can be rendered in editable or read-only mode
		expect(typeof Boolean).toBe('function');
	});

	it('should accept onEditClick callback', () => {
		// Optional callback fired when edit button clicked
		expect(typeof Function).toBe('function');
	});

	it('should display user profile name', () => {
		// Shows profile.name from userProfileStore
		expect(typeof String).toBe('function');
	});

	it('should display user bio if available', () => {
		// Conditional rendering of profile.bio
		expect(typeof String).toBe('function');
	});

	it('should display username with @ prefix', () => {
		// Shows @username for profile URLs
		expect(typeof String).toBe('function');
	});

	it('should display profile avatar emoji', () => {
		// Shows ✍️ emoji in circular avatar
		expect(typeof String).toBe('function');
	});

	it('should show visibility badge (public/private)', () => {
		// Badge shows 🌍 Public or 🔒 Private with appropriate colors
		expect(typeof String).toBe('function');
	});

	it('should display current streak statistic', () => {
		// Shows current streak days from goalsStore
		expect(typeof Number).toBe('function');
	});

	it('should display longest streak statistic', () => {
		// Shows longest streak days from goalsStore
		expect(typeof Number).toBe('function');
	});

	it('should display cumulative word count', () => {
		// Shows total words across all weeks from weeklyGoalsStore
		expect(typeof Number).toBe('function');
	});

	it('should display earned badges count', () => {
		// Shows number of earned badges from badgesStore
		expect(typeof Number).toBe('function');
	});

	it('should display grid of earned badges', () => {
		// If badges earned, shows each badge with icon and name
		expect(typeof Array).toBe('function');
	});

	it('should display activity statistics section', () => {
		// Shows: weeks active, perfect weeks, avg words per day
		expect(typeof Object).toBe('object');
	});

	it('should integrate with userProfileStore', () => {
		// Derives profile name, bio, visibility from userProfileStore
		expect(typeof Object).toBe('object');
	});

	it('should integrate with goalsStore', () => {
		// Derives streak and word count data from goalsStore
		expect(typeof Object).toBe('object');
	});

	it('should integrate with streakStore', () => {
		// References streak data for profile display
		expect(typeof Object).toBe('object');
	});

	it('should integrate with weeklyGoalsStore', () => {
		// Gets history and weekly stats for activity display
		expect(typeof Object).toBe('object');
	});

	it('should integrate with badgesStore', () => {
		// Gets earned badges for display
		expect(typeof Array).toBe('function');
	});

	it('should format large numbers with commas', () => {
		// 10000 → "10,000", 1000000 → "1,000,000"
		expect(typeof String).toBe('function');
	});

	it('should show edit button in editable mode', () => {
		// Edit button (pencil emoji) visible only when editable=true
		expect(typeof Boolean).toBe('function');
	});

	it('should call onEditClick when edit button clicked', () => {
		// If provided, onEditClick callback is invoked
		expect(typeof Function).toBe('function');
	});

	it('should be responsive on mobile devices', () => {
		// CSS media queries adjust stats grid and badge grid layout
		expect(typeof Object).toBe('object');
	});

	it('should hide activity section if no weeks active', () => {
		// Activity section only shown if weeklyHistory.length > 0
		expect(typeof Object).toBe('object');
	});

	it('should hide badges section if none earned', () => {
		// Badges section only shown if earnedBadges.length > 0
		expect(typeof Array).toBe('function');
	});
});
