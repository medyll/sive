import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Minimal auth schema compatible with Better-Auth's drizzle adapter
export const users = sqliteTable('users', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	email: text('email').notNull(),
	name: text('name'),
	password_hash: text('password_hash'),
	created_at: integer('created_at').notNull().$defaultFn(() => Date.now())
});

export const sessions = sqliteTable('sessions', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	user_id: text('user_id').notNull(),
	session_token: text('session_token').notNull(),
	expires_at: integer('expires_at').notNull()
});

export const accounts = sqliteTable('accounts', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	user_id: text('user_id').notNull(),
	provider: text('provider').notNull(),
	provider_account_id: text('provider_account_id').notNull(),
	access_token: text('access_token'),
	refresh_token: text('refresh_token'),
	expires_at: integer('expires_at')
});

// Export names for drizzle schema import
export const authSchema = {
	users,
	sessions,
	accounts
};
