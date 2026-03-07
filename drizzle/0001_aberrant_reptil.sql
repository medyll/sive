CREATE TABLE `user_preferences` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`prefs` text DEFAULT '{}' NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_preferences_user_id_unique` ON `user_preferences` (`user_id`);