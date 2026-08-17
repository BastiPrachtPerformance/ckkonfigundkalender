CREATE TABLE `request_rate_limits` (
	`scope` text NOT NULL,
	`client_key` text NOT NULL,
	`window_started` integer NOT NULL,
	`count` integer NOT NULL,
	PRIMARY KEY(`scope`, `client_key`)
);
