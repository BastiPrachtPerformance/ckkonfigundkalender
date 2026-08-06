CREATE TABLE `booking_dates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`hall` text NOT NULL,
	`event_date` text NOT NULL,
	`status` text DEFAULT 'reserved' NOT NULL,
	`request_id` text NOT NULL,
	`source` text DEFAULT 'customer' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_booking_dates_hall_event_date` ON `booking_dates` (`hall`,`event_date`);--> statement-breakpoint
CREATE TABLE `booking_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`event_date` text NOT NULL,
	`hall` text NOT NULL,
	`guest_count` integer NOT NULL,
	`configuration` text NOT NULL,
	`total` integer NOT NULL,
	`status` text DEFAULT 'neu' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
