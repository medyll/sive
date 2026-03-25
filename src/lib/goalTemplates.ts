/**
 * goalTemplates — Pre-built writing goal templates for quick setup.
 *
 * Templates provide preset daily targets and descriptions to help users
 * choose realistic goals without manual calculation.
 */

export interface GoalTemplate {
	id: string;
	name: string;
	description: string;
	dailyTarget: number;
	totalTarget?: number;
	duration?: string; // e.g., "November", "30 days", "Per week"
	icon: string;
	category: 'challenge' | 'daily' | 'weekly' | 'custom';
}

export const GOAL_TEMPLATES: GoalTemplate[] = [
	{
		id: 'nanowrimo',
		name: 'NaNoWriMo',
		description: 'Complete a 50,000 word novel in November',
		dailyTarget: 1667,
		totalTarget: 50000,
		duration: 'November (30 days)',
		icon: '📚',
		category: 'challenge'
	},
	{
		id: 'daily-minimum',
		name: 'Daily Minimum',
		description: 'Write at least 500 words every day',
		dailyTarget: 500,
		duration: 'Every day',
		icon: '✍️',
		category: 'daily'
	},
	{
		id: 'daily-1k',
		name: 'Thousand Words',
		description: 'Push yourself with 1,000 words daily',
		dailyTarget: 1000,
		duration: 'Every day',
		icon: '🚀',
		category: 'daily'
	},
	{
		id: 'weekly-goal',
		name: 'Weekly Writer',
		description: 'Write 5,000 words per week (714/day avg)',
		dailyTarget: 714,
		totalTarget: 5000,
		duration: 'Per week',
		icon: '📖',
		category: 'weekly'
	},
	{
		id: 'weekly-heavy',
		name: 'Weekly Pro',
		description: 'Serious writing: 10,000 words/week (1,429/day avg)',
		dailyTarget: 1429,
		totalTarget: 10000,
		duration: 'Per week',
		icon: '⚡',
		category: 'weekly'
	},
	{
		id: 'novella',
		name: 'Novella Sprint',
		description: 'Write a 20,000 word novella in 2 weeks',
		dailyTarget: 1429,
		totalTarget: 20000,
		duration: '2 weeks',
		icon: '🎯',
		category: 'challenge'
	},
	{
		id: 'short-story',
		name: 'Short Story',
		description: 'Complete a 5,000 word short story in one week',
		dailyTarget: 714,
		totalTarget: 5000,
		duration: '1 week',
		icon: '📝',
		category: 'challenge'
	}
];

/**
 * Get a template by ID
 */
export function getTemplate(id: string): GoalTemplate | undefined {
	return GOAL_TEMPLATES.find((t) => t.id === id);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: GoalTemplate['category']): GoalTemplate[] {
	return GOAL_TEMPLATES.filter((t) => t.category === category);
}

/**
 * Format template description with calculated metrics
 */
export function formatTemplateDescription(template: GoalTemplate): string {
	if (template.totalTarget && template.duration) {
		return `${template.description} — ${template.totalTarget.toLocaleString()} words in ${template.duration}`;
	}
	return template.description;
}

/**
 * Get all available templates grouped by category
 */
export function getTemplatesByGrouping(): Record<string, GoalTemplate[]> {
	return {
		challenges: getTemplatesByCategory('challenge'),
		daily: getTemplatesByCategory('daily'),
		weekly: getTemplatesByCategory('weekly')
	};
}
