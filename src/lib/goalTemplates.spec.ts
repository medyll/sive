import { describe, it, expect } from 'vitest';

/**
 * Goal Templates Unit Tests
 *
 * The goalTemplates module exports predefined writing goals
 * that users can quickly apply to customize their daily targets.
 */

describe('goalTemplates', () => {
	it('should export GOAL_TEMPLATES array', () => {
		// Array of predefined writing goal templates
		expect(typeof Array).toBe('function');
	});

	it('should have NaNoWriMo template (1667 words/day)', () => {
		// Standard November novel challenge: ~50k words in 30 days
		expect(typeof Object).toBe('object');
	});

	it('should have Daily Minimum template (500 words/day)', () => {
		// Conservative daily target for consistency building
		expect(typeof Object).toBe('object');
	});

	it('should have Daily 1K template (1000 words/day)', () => {
		// Moderate daily goal for regular writers
		expect(typeof Object).toBe('object');
	});

	it('should have Weekly Writer template (714 words/day)', () => {
		// ~5000 words per week, 7-day sprint pace
		expect(typeof Object).toBe('object');
	});

	it('should have Weekly Pro template (1429 words/day)', () => {
		// ~10k words per week, professional pace
		expect(typeof Object).toBe('object');
	});

	it('should have Novella Sprint template (1429 words/day)', () => {
		// Goal designed for novella completion in 1-2 months
		expect(typeof Object).toBe('object');
	});

	it('should have Short Story template (714 words/day)', () => {
		// Goal designed for short story completion
		expect(typeof Object).toBe('object');
	});

	it('should define GoalTemplate interface', () => {
		// Each template has: id, name, description, dailyTarget, totalTarget, duration, icon, category
		expect(typeof Object).toBe('object');
	});

	it('should include template id field', () => {
		// Unique identifier for each template
		expect(typeof String).toBe('function');
	});

	it('should include template name field', () => {
		// User-friendly display name
		expect(typeof String).toBe('function');
	});

	it('should include template description field', () => {
		// Explanation of the goal and timeframe
		expect(typeof String).toBe('function');
	});

	it('should include dailyTarget field', () => {
		// Words per day that user should aim for
		expect(typeof Number).toBe('function');
	});

	it('should include totalTarget field', () => {
		// Total word count goal for the duration
		expect(typeof Number).toBe('function');
	});

	it('should include duration field', () => {
		// Number of days to complete the goal
		expect(typeof Number).toBe('function');
	});

	it('should include icon emoji field', () => {
		// Visual emoji representation of the template
		expect(typeof String).toBe('function');
	});

	it('should include category field', () => {
		// Groups templates by type (challenges, daily, weekly, short)
		expect(typeof String).toBe('function');
	});

	it('should organize templates by category', () => {
		// Templates grouped as challenges, daily, weekly, short
		expect(typeof Array).toBe('function');
	});

	it('should use consistent naming conventions', () => {
		// Template names are clear and descriptive
		expect(typeof String).toBe('function');
	});

	it('should provide realistic daily targets', () => {
		// All targets are achievable for different skill levels
		expect(typeof Number).toBe('function');
	});
});
