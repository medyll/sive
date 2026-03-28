/**
 * goalTemplates Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { GOAL_TEMPLATES, type GoalTemplate } from './goalTemplates';

describe('goalTemplates', () => {
	it('should export GOAL_TEMPLATES array', () => {
		expect(Array.isArray(GOAL_TEMPLATES)).toBe(true);
		expect(GOAL_TEMPLATES.length).toBeGreaterThan(0);
	});

	it('should have NaNoWriMo template (1667 words/day)', () => {
		const nano = GOAL_TEMPLATES.find(t => t.id === 'nanowrimo');
		expect(nano).toBeDefined();
		expect(nano?.dailyTarget).toBe(1667);
	});

	it('should have Daily Minimum template (500 words/day)', () => {
		const daily = GOAL_TEMPLATES.find(t => t.id === 'daily-minimum');
		expect(daily).toBeDefined();
		expect(daily?.dailyTarget).toBe(500);
	});

	it('should have Daily 1K template (1000 words/day)', () => {
		const daily1k = GOAL_TEMPLATES.find(t => t.id === 'daily-1k');
		expect(daily1k).toBeDefined();
		expect(daily1k?.dailyTarget).toBe(1000);
	});

	it('should have Weekly Writer template (714 words/day)', () => {
		const weekly = GOAL_TEMPLATES.find(t => t.id === 'weekly-goal');
		expect(weekly).toBeDefined();
		expect(weekly?.dailyTarget).toBe(714);
	});

	it('should have Weekly Pro template (1429 words/day)', () => {
		const weeklyPro = GOAL_TEMPLATES.find(t => t.id === 'weekly-heavy');
		expect(weeklyPro).toBeDefined();
		expect(weeklyPro?.dailyTarget).toBe(1429);
	});

	it('should have Novella Sprint template (1429 words/day)', () => {
		const novella = GOAL_TEMPLATES.find(t => t.id === 'novella');
		expect(novella).toBeDefined();
		expect(novella?.dailyTarget).toBe(1429);
	});

	it('should have Short Story template (714 words/day)', () => {
		const shortStory = GOAL_TEMPLATES.find(t => t.id === 'short-story');
		expect(shortStory).toBeDefined();
		expect(shortStory?.dailyTarget).toBe(714);
	});

	it('should define GoalTemplate interface', () => {
		// All templates should have required fields
		for (const template of GOAL_TEMPLATES) {
			expect(template.id).toBeDefined();
			expect(template.name).toBeDefined();
			expect(template.description).toBeDefined();
			expect(template.dailyTarget).toBeDefined();
			expect(template.category).toBeDefined();
		}
	});

	it('should include template id field', () => {
		for (const template of GOAL_TEMPLATES) {
			expect(typeof template.id).toBe('string');
		}
	});

	it('should include template name field', () => {
		for (const template of GOAL_TEMPLATES) {
			expect(typeof template.name).toBe('string');
		}
	});

	it('should include template description field', () => {
		for (const template of GOAL_TEMPLATES) {
			expect(typeof template.description).toBe('string');
		}
	});

	it('should include dailyTarget field', () => {
		for (const template of GOAL_TEMPLATES) {
			expect(typeof template.dailyTarget).toBe('number');
		}
	});

	it('should include totalTarget field', () => {
		// Some templates have totalTarget (challenges), some don't (daily goals)
		const withTotal = GOAL_TEMPLATES.filter(t => t.totalTarget !== undefined);
		expect(withTotal.length).toBeGreaterThan(0);
		withTotal.forEach(t => {
			expect(typeof t.totalTarget).toBe('number');
		});
	});

	it('should include duration field', () => {
		// All templates should have duration
		for (const template of GOAL_TEMPLATES) {
			expect(template.duration).toBeDefined();
			expect(typeof template.duration).toBe('string');
		}
	});

	it('should include icon emoji field', () => {
		for (const template of GOAL_TEMPLATES) {
			expect(typeof template.icon).toBe('string');
		}
	});

	it('should include category field', () => {
		for (const template of GOAL_TEMPLATES) {
			expect(typeof template.category).toBe('string');
		}
	});

	it('should organize templates by category', () => {
		const categories = new Set(GOAL_TEMPLATES.map(t => t.category));
		expect(categories.size).toBeGreaterThan(1);
	});

	it('should use consistent naming conventions', () => {
		for (const template of GOAL_TEMPLATES) {
			expect(template.id).toMatch(/^[a-z0-9-]+$/);
		}
	});

	it('should provide realistic daily targets', () => {
		for (const template of GOAL_TEMPLATES) {
			expect(template.dailyTarget).toBeGreaterThan(0);
			expect(template.dailyTarget).toBeLessThan(10000);
		}
	});
});
