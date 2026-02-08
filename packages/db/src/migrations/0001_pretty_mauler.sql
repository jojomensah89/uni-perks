CREATE TABLE `clicks` (
	`id` text PRIMARY KEY NOT NULL,
	`perk_id` text NOT NULL,
	`referrer` text,
	`user_agent` text,
	`country` text,
	`region` text,
	`city` text,
	`clicked_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `clicks_country_idx` ON `clicks` (`country`);--> statement-breakpoint
CREATE INDEX `clicks_perk_country_idx` ON `clicks` (`perk_id`,`country`);--> statement-breakpoint
CREATE TABLE `subscribers` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`is_verified` integer DEFAULT false,
	`verified_at` integer,
	`frequency` text DEFAULT 'weekly',
	`country` text,
	`preferred_countries` text,
	`notify_global_perks` integer DEFAULT true,
	`subscribed_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`unsubscribed_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subscribers_email_unique` ON `subscribers` (`email`);--> statement-breakpoint
CREATE TABLE `countries` (
	`code` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`region` text NOT NULL,
	`continent` text NOT NULL,
	`flag` text NOT NULL,
	`currency` text DEFAULT 'USD',
	`currency_symbol` text DEFAULT '$',
	`is_popular` integer DEFAULT false,
	`slug` text NOT NULL,
	`meta_title` text,
	`meta_description` text,
	`perk_count` integer DEFAULT 0,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `countries_slug_unique` ON `countries` (`slug`);--> statement-breakpoint
CREATE TABLE `regions` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`country_codes` text,
	`meta_title` text,
	`meta_description` text,
	`perk_count` integer DEFAULT 0,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `regions_name_unique` ON `regions` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `regions_slug_unique` ON `regions` (`slug`);--> statement-breakpoint
CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`icon` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_slug_unique` ON `categories` (`slug`);--> statement-breakpoint
CREATE TABLE `perks` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`short_description` text NOT NULL,
	`long_description` text NOT NULL,
	`company` text NOT NULL,
	`company_logo` text,
	`value_amount` real,
	`value_currency` text DEFAULT 'USD',
	`category_id` text NOT NULL,
	`available_countries` text,
	`excluded_countries` text,
	`is_global` integer DEFAULT false,
	`region` text,
	`region_notes` text,
	`display_priority` integer DEFAULT 0,
	`country_urls` text,
	`country_values` text,
	`verification_method` text NOT NULL,
	`eligibility_note` text,
	`claim_url` text NOT NULL,
	`affiliate_url` text,
	`is_featured` integer DEFAULT false,
	`is_active` integer DEFAULT true,
	`expiration_date` integer,
	`last_verified` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)),
	`meta_title` text,
	`meta_description` text,
	`click_count` integer DEFAULT 0,
	`view_count` integer DEFAULT 0,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `perks_slug_unique` ON `perks` (`slug`);--> statement-breakpoint
CREATE INDEX `region_idx` ON `perks` (`region`);--> statement-breakpoint
CREATE INDEX `is_global_idx` ON `perks` (`is_global`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `perks` (`category_id`);--> statement-breakpoint
CREATE INDEX `slug_idx` ON `perks` (`slug`);