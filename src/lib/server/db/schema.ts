import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

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
	created_at: integer('created_at').notNull().$defaultFn(() => Date.now()),
	updated_at: integer('updated_at').notNull().$defaultFn(() => Date.now())
});

export * from './auth.schema';
