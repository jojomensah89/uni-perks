CREATE TABLE `deal_geo_config` (
	`id` text PRIMARY KEY NOT NULL,
	`deal_id` text NOT NULL,
	`country_code` text NOT NULL,
	`affiliate_url` text,
	`claim_url` text,
	`student_price` real,
	`original_price` real,
	`currency` text,
	`discount_label` text,
	`is_available` integer DEFAULT true,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`deal_id`) REFERENCES `deals`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `deal_geo_config_deal_country_uidx` ON `deal_geo_config` (`deal_id`,`country_code`);--> statement-breakpoint
CREATE INDEX `deal_geo_config_deal_idx` ON `deal_geo_config` (`deal_id`);--> statement-breakpoint
CREATE INDEX `deal_geo_config_country_idx` ON `deal_geo_config` (`country_code`);
