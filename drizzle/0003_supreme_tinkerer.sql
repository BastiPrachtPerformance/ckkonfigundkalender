CREATE TABLE `booking_date_details` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`hall` text NOT NULL,
	`event_date` text NOT NULL,
	`customer_name` text DEFAULT '' NOT NULL,
	`customer_email` text DEFAULT '' NOT NULL,
	`customer_phone` text DEFAULT '' NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_booking_date_details_hall_event_date` ON `booking_date_details` (`hall`,`event_date`);