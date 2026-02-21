CREATE TABLE `page_views` (
	`id` text PRIMARY KEY NOT NULL,
	`path` text NOT NULL,
	`deal_id` text,
	`referrer` text,
	`user_agent` text,
	`device` text,
	`country` text,
	`viewed_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `page_views_deal_idx` ON `page_views` (`deal_id`);--> statement-breakpoint
CREATE INDEX `page_views_path_idx` ON `page_views` (`path`);--> statement-breakpoint
CREATE INDEX `page_views_country_idx` ON `page_views` (`country`);--> statement-breakpoint
CREATE TABLE `brand_faqs` (
	`id` text PRIMARY KEY NOT NULL,
	`brand_id` text NOT NULL,
	`question` text NOT NULL,
	`answer` text NOT NULL,
	`display_order` integer DEFAULT 0,
	FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `brand_faqs_brand_idx` ON `brand_faqs` (`brand_id`);--> statement-breakpoint
CREATE INDEX `brand_faqs_order_idx` ON `brand_faqs` (`display_order`);--> statement-breakpoint
CREATE TABLE `brand_products` (
	`id` text PRIMARY KEY NOT NULL,
	`brand_id` text NOT NULL,
	`name` text NOT NULL,
	`image_url` text,
	`product_url` text,
	`display_order` integer DEFAULT 0,
	FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `brand_products_brand_idx` ON `brand_products` (`brand_id`);--> statement-breakpoint
CREATE INDEX `brand_products_order_idx` ON `brand_products` (`display_order`);--> statement-breakpoint
CREATE TABLE `brands` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`tagline` text,
	`description` text,
	`logo_url` text,
	`cover_image_url` text,
	`website` text,
	`why_we_love_it` text,
	`is_verified` integer DEFAULT false,
	`meta_title` text,
	`meta_description` text,
	`total_click_count` integer DEFAULT 0,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `brands_slug_unique` ON `brands` (`slug`);--> statement-breakpoint
CREATE INDEX `brands_slug_idx` ON `brands` (`slug`);--> statement-breakpoint
CREATE TABLE `collection_deals` (
	`collection_id` text NOT NULL,
	`deal_id` text NOT NULL,
	`display_order` integer DEFAULT 0,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	PRIMARY KEY(`collection_id`, `deal_id`),
	FOREIGN KEY (`collection_id`) REFERENCES `collections`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`deal_id`) REFERENCES `deals`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `collection_deals_collection_idx` ON `collection_deals` (`collection_id`);--> statement-breakpoint
CREATE INDEX `collection_deals_deal_idx` ON `collection_deals` (`deal_id`);--> statement-breakpoint
CREATE TABLE `collections` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`audience` text,
	`is_featured` integer DEFAULT false,
	`display_order` integer DEFAULT 0,
	`meta_title` text,
	`meta_description` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `collections_slug_unique` ON `collections` (`slug`);--> statement-breakpoint
CREATE INDEX `collections_slug_idx` ON `collections` (`slug`);--> statement-breakpoint
CREATE INDEX `collections_featured_idx` ON `collections` (`is_featured`);--> statement-breakpoint
CREATE INDEX `collections_display_order_idx` ON `collections` (`display_order`);--> statement-breakpoint
CREATE TABLE `deals` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`brand_id` text NOT NULL,
	`category_id` text NOT NULL,
	`title` text NOT NULL,
	`short_description` text NOT NULL,
	`long_description` text NOT NULL,
	`how_to_redeem` text,
	`discount_type` text NOT NULL,
	`discount_value` real,
	`discount_label` text NOT NULL,
	`original_price` real,
	`student_price` real,
	`currency` text DEFAULT 'USD',
	`minimum_spend` real,
	`is_new_customer_only` integer DEFAULT false,
	`conditions` text,
	`terms_url` text,
	`verification_method` text NOT NULL,
	`eligibility_note` text,
	`claim_url` text NOT NULL,
	`affiliate_url` text,
	`is_featured` integer DEFAULT false,
	`is_exclusive` integer DEFAULT false,
	`is_active` integer DEFAULT true,
	`expiration_date` integer,
	`last_verified` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)),
	`meta_title` text,
	`meta_description` text,
	`click_count` integer DEFAULT 0,
	`view_count` integer DEFAULT 0,
	`popularity` integer DEFAULT 0,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `deals_slug_unique` ON `deals` (`slug`);--> statement-breakpoint
CREATE INDEX `deals_slug_idx` ON `deals` (`slug`);--> statement-breakpoint
CREATE INDEX `deals_brand_idx` ON `deals` (`brand_id`);--> statement-breakpoint
CREATE INDEX `deals_category_idx` ON `deals` (`category_id`);--> statement-breakpoint
CREATE INDEX `deals_featured_idx` ON `deals` (`is_featured`);--> statement-breakpoint
CREATE INDEX `deals_active_idx` ON `deals` (`is_active`);--> statement-breakpoint
CREATE INDEX `deals_popularity_idx` ON `deals` (`popularity`);--> statement-breakpoint
CREATE TABLE `deal_suggestions` (
	`id` text PRIMARY KEY NOT NULL,
	`brand_name` text NOT NULL,
	`deal_title` text NOT NULL,
	`description` text NOT NULL,
	`discount_label` text NOT NULL,
	`claim_url` text NOT NULL,
	`category` text,
	`source` text DEFAULT 'user' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`submitted_by` text,
	`submitted_at` integer,
	`reviewed_at` integer,
	`reviewed_by` text,
	`rejection_reason` text
);
--> statement-breakpoint
CREATE TABLE `deal_regions` (
	`deal_id` text NOT NULL,
	`region_id` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	PRIMARY KEY(`deal_id`, `region_id`),
	FOREIGN KEY (`deal_id`) REFERENCES `deals`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`region_id`) REFERENCES `regions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `deal_regions_deal_idx` ON `deal_regions` (`deal_id`);--> statement-breakpoint
CREATE INDEX `deal_regions_region_idx` ON `deal_regions` (`region_id`);--> statement-breakpoint
CREATE TABLE `deal_tags` (
	`deal_id` text NOT NULL,
	`tag_id` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	PRIMARY KEY(`deal_id`, `tag_id`),
	FOREIGN KEY (`deal_id`) REFERENCES `deals`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `deal_tags_deal_idx` ON `deal_tags` (`deal_id`);--> statement-breakpoint
CREATE INDEX `deal_tags_tag_idx` ON `deal_tags` (`tag_id`);--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`audience` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_slug_unique` ON `tags` (`slug`);--> statement-breakpoint
CREATE INDEX `tags_slug_idx` ON `tags` (`slug`);--> statement-breakpoint
DROP TABLE `countries`;--> statement-breakpoint
DROP TABLE `perks`;--> statement-breakpoint
DROP INDEX `clicks_perk_country_idx`;--> statement-breakpoint
ALTER TABLE `clicks` ADD `deal_id` text NOT NULL;--> statement-breakpoint
ALTER TABLE `clicks` ADD `brand_id` text;--> statement-breakpoint
ALTER TABLE `clicks` ADD `source` text;--> statement-breakpoint
ALTER TABLE `clicks` ADD `device` text;--> statement-breakpoint
ALTER TABLE `clicks` ADD `region_code` text;--> statement-breakpoint
CREATE INDEX `clicks_deal_idx` ON `clicks` (`deal_id`);--> statement-breakpoint
CREATE INDEX `clicks_brand_idx` ON `clicks` (`brand_id`);--> statement-breakpoint
CREATE INDEX `clicks_source_idx` ON `clicks` (`source`);--> statement-breakpoint
ALTER TABLE `clicks` DROP COLUMN `perk_id`;--> statement-breakpoint
ALTER TABLE `clicks` DROP COLUMN `region`;--> statement-breakpoint
DROP INDEX `regions_name_unique`;--> statement-breakpoint
DROP INDEX `regions_slug_unique`;--> statement-breakpoint
ALTER TABLE `regions` ADD `code` text NOT NULL;--> statement-breakpoint
ALTER TABLE `regions` ADD `is_active` integer DEFAULT true;--> statement-breakpoint
CREATE UNIQUE INDEX `regions_code_unique` ON `regions` (`code`);--> statement-breakpoint
CREATE INDEX `regions_code_idx` ON `regions` (`code`);--> statement-breakpoint
ALTER TABLE `regions` DROP COLUMN `slug`;--> statement-breakpoint
ALTER TABLE `regions` DROP COLUMN `description`;--> statement-breakpoint
ALTER TABLE `regions` DROP COLUMN `country_codes`;--> statement-breakpoint
ALTER TABLE `regions` DROP COLUMN `meta_title`;--> statement-breakpoint
ALTER TABLE `regions` DROP COLUMN `meta_description`;--> statement-breakpoint
ALTER TABLE `regions` DROP COLUMN `perk_count`;--> statement-breakpoint
ALTER TABLE `subscribers` ADD `audience` text;--> statement-breakpoint
ALTER TABLE `subscribers` ADD `notify_global_deals` integer DEFAULT true;--> statement-breakpoint
ALTER TABLE `subscribers` DROP COLUMN `notify_global_perks`;--> statement-breakpoint
ALTER TABLE `categories` ADD `color` text;--> statement-breakpoint
ALTER TABLE `categories` ADD `cover_image_url` text;--> statement-breakpoint
ALTER TABLE `categories` ADD `display_order` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `categories` ADD `meta_title` text;--> statement-breakpoint
ALTER TABLE `categories` ADD `meta_description` text;--> statement-breakpoint
CREATE INDEX `categories_slug_idx` ON `categories` (`slug`);--> statement-breakpoint
CREATE INDEX `categories_display_order_idx` ON `categories` (`display_order`);