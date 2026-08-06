CREATE TABLE `booking_date_notes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`hall` text NOT NULL,
	`event_date` text NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_booking_date_notes_hall_event_date` ON `booking_date_notes` (`hall`,`event_date`);--> statement-breakpoint
CREATE TABLE `booking_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
