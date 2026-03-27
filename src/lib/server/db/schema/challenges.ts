/**
 * challenges — Database schema for writing challenges
 * 
 * S74-01: Database Schema for Challenges
 */

import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';

export const challenges = sqliteTable('challenges', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => `ch_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`),
	title: text('title').notNull(),
	description: text('description').notNull().default(''),
	targetWords: integer('target_words').notNull(),
	durationDays: integer('duration_days').notNull(),
	creatorId: text('creator_id').notNull(),
	createdAt: integer('created_at').notNull().$defaultFn(() => Date.now()),
	endsAt: integer('ends_at').notNull()
});

export const challengeParticipants = sqliteTable('challenge_participants', {
	challengeId: text('challenge_id').notNull(),
	userId: text('user_id').notNull(),
	joinedAt: integer('joined_at').notNull().$defaultFn(() => Date.now()),
	wordsContributed: integer('words_contributed').notNull().default(0)
}, (t) => [
	primaryKey({ columns: [t.challengeId, t.userId] })
]);

// Type inference helpers
export type Challenge = typeof challenges.$inferSelect;
export type NewChallenge = typeof challenges.$inferInsert;
export type ChallengeParticipant = typeof challengeParticipants.$inferSelect;
export type NewChallengeParticipant = typeof challengeParticipants.$inferInsert;
