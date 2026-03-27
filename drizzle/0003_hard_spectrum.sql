CREATE TABLE `challenge_participants` (
	`challenge_id` text NOT NULL,
	`user_id` text NOT NULL,
	`joined_at` integer NOT NULL,
	`words_contributed` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`challenge_id`, `user_id`)
);
--> statement-breakpoint
CREATE TABLE `challenges` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`target_words` integer NOT NULL,
	`duration_days` integer NOT NULL,
	`creator_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`ends_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `activity_events` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`user_id` text NOT NULL,
	`display_name` text NOT NULL,
	`timestamp` integer NOT NULL,
	`payload` text
);
--> statement-breakpoint
CREATE INDEX `idx_activity_user` ON `activity_events` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_activity_timestamp` ON `activity_events` (`timestamp`);--> statement-breakpoint
CREATE INDEX `idx_activity_type` ON `activity_events` (`type`);--> statement-breakpoint
CREATE TABLE `writer_discovery` (
	`user_id` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`current_streak` integer DEFAULT 0 NOT NULL,
	`longest_streak` integer DEFAULT 0 NOT NULL,
	`total_words` integer DEFAULT 0 NOT NULL,
	`top_badge_icon` text DEFAULT '✍️',
	`top_badge_name` text DEFAULT 'Writer',
	`opted_in` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_discovery_opted_in` ON `writer_discovery` (`opted_in`);