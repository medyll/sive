import { integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';

export const task = sqliteTable('task', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	title: text('title').notNull(),
	priority: integer('priority').notNull().default(1)
});

export const documents = sqliteTable('documents', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	user_id: text('user_id').notNull(),
	title: text('title').notNull().default('Untitled'),
	content: text('content').notNull().default(''),
	tags: text('tags').notNull().default('[]'),
	created_at: integer('created_at').notNull().$defaultFn(() => Date.now()),
	updated_at: integer('updated_at').notNull().$defaultFn(() => Date.now())
});

export const user_preferences = sqliteTable('user_preferences', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	user_id: text('user_id').notNull().unique(),
	prefs: text('prefs').notNull().default('{}'),
	updated_at: integer('updated_at').notNull().$defaultFn(() => Date.now())
});

export const document_shares = sqliteTable(
	'document_shares',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		document_id: text('document_id').notNull(),
		user_id: text('user_id').notNull(),
		role: text('role', { enum: ['owner', 'editor', 'viewer'] })
			.notNull()
			.default('viewer'),
		created_at: integer('created_at').notNull().$defaultFn(() => Date.now())
	},
	(t) => [unique('uq_doc_user').on(t.document_id, t.user_id)]
);

// Export all schemas
export * from './auth.schema';
export * from './schema/challenges';
export * from './schema/discovery';
