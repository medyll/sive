/**
 * discovery & activity — Database schema for writer discovery and activity feed
 * 
 * S74-02: Database Schema for Discovery & Activity
 */

import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

export const writerDiscovery = sqliteTable('writer_discovery', {
	userId: text('user_id').primaryKey(),
	displayName: text('display_name').notNull(),
	currentStreak: integer('current_streak').notNull().default(0),
	longestStreak: integer('longest_streak').notNull().default(0),
	totalWords: integer('total_words').notNull().default(0),
	topBadgeIcon: text('top_badge_icon').default('✍️'),
	topBadgeName: text('top_badge_name').default('Writer'),
	optedIn: integer('opted_in').notNull().default(0), // 0 = false, 1 = true
	updatedAt: integer('updated_at').notNull().$defaultFn(() => Date.now())
}, (t) => [
	index('idx_discovery_opted_in').on(t.optedIn)
]);

export const activityEvents = sqliteTable('activity_events', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => `act_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`),
	type: text('type').notNull(), // badge_earned, streak_milestone, challenge_progress, goal_completed
	userId: text('user_id').notNull(),
	displayName: text('display_name').notNull(),
	timestamp: integer('timestamp').notNull().$defaultFn(() => Date.now()),
	payload: text('payload') // JSON string
}, (t) => [
	index('idx_activity_user').on(t.userId),
	index('idx_activity_timestamp').on(t.timestamp),
	index('idx_activity_type').on(t.type)
]);

// Type inference helpers
export type WriterDiscovery = typeof writerDiscovery.$inferSelect;
export type NewWriterDiscovery = typeof writerDiscovery.$inferInsert;
export type ActivityEvent = typeof activityEvents.$inferSelect;
export type NewActivityEvent = typeof activityEvents.$inferInsert;
