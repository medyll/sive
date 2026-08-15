CREATE TABLE `document_shares` (
	`id` text PRIMARY KEY NOT NULL,
	`document_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'viewer' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_doc_user` ON `document_shares` (`document_id`,`user_id`);--> statement-breakpoint
ALTER TABLE `documents` ADD `tags` text DEFAULT '[]' NOT NULL;