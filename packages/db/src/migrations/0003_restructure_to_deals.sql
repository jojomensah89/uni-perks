-- Migration: Restructure from perks to brands+deals model
-- Drop old tables
DROP TABLE IF EXISTS perks;
DROP TABLE IF EXISTS countries;

-- Create brands table
CREATE TABLE `brands` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`tagline` text,
	`description` text,
	`logo_url` text,
	`cover_image_url` text,
	`website` text,
	`is_verified` integer DEFAULT 0,
	`meta_title` text,
	`meta_description` text,
	`total_click_count` integer DEFAULT 0,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);

CREATE UNIQUE INDEX `brands_slug_idx` ON `brands` (`slug`);

-- Create deals table
CREATE TABLE `deals` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`brand_id` text NOT NULL,
	`category_id` text NOT NULL,
	`title` text NOT NULL,
	`short_description` text NOT NULL,
	`long_description` text NOT NULL,
	`discount_type` text NOT NULL,
	`discount_value` real,
	`discount_label` text NOT NULL,
	`original_price` real,
	`student_price` real,
	`currency` text DEFAULT 'USD',
	`verification_method` text NOT NULL,
	`eligibility_note` text,
	`claim_url` text NOT NULL,
	`affiliate_url` text,
	`is_featured` integer DEFAULT 0,
	`is_exclusive` integer DEFAULT 0,
	`is_active` integer DEFAULT 1,
	`expiration_date` integer,
	`last_verified` integer,
	`meta_title` text,
	`meta_description` text,
	`click_count` integer DEFAULT 0,
	`view_count` integer DEFAULT 0,
	`popularity` integer DEFAULT 0,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE UNIQUE INDEX `deals_slug_idx` ON `deals` (`slug`);
CREATE INDEX `deals_brand_idx` ON `deals` (`brand_id`);
CREATE INDEX `deals_category_idx` ON `deals` (`category_id`);
CREATE INDEX `deals_featured_idx` ON `deals` (`is_featured`);
CREATE INDEX `deals_active_idx` ON `deals` (`is_active`);
CREATE INDEX `deals_popularity_idx` ON `deals` (`popularity`);

-- Update categories table (add new fields)
ALTER TABLE `categories` ADD COLUMN `color` text;
ALTER TABLE `categories` ADD COLUMN `cover_image_url` text;
ALTER TABLE `categories` ADD COLUMN `display_order` integer DEFAULT 0;
ALTER TABLE `categories` ADD COLUMN `meta_title` text;
ALTER TABLE `categories` ADD COLUMN `meta_description` text;

CREATE INDEX `categories_display_order_idx` ON `categories` (`display_order`);

-- Create tags table
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`audience` text,
	`created_at` integer NOT NULL
);

CREATE UNIQUE INDEX `tags_slug_idx` ON `tags` (`slug`);

-- Create deal_tags junction table
CREATE TABLE `deal_tags` (
	`deal_id` text NOT NULL,
	`tag_id` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`deal_id`, `tag_id`),
	FOREIGN KEY (`deal_id`) REFERENCES `deals`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE INDEX `deal_tags_deal_idx` ON `deal_tags` (`deal_id`);
CREATE INDEX `deal_tags_tag_idx` ON `deal_tags` (`tag_id`);

-- Create collections table
CREATE TABLE `collections` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`audience` text,
	`is_featured` integer DEFAULT 0,
	`display_order` integer DEFAULT 0,
	`meta_title` text,
	`meta_description` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);

CREATE UNIQUE INDEX `collections_slug_idx` ON `collections` (`slug`);
CREATE INDEX `collections_featured_idx` ON `collections` (`is_featured`);
CREATE INDEX `collections_display_order_idx` ON `collections` (`display_order`);

-- Create collection_deals junction table
CREATE TABLE `collection_deals` (
	`collection_id` text NOT NULL,
	`deal_id` text NOT NULL,
	`display_order` integer DEFAULT 0,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`collection_id`, `deal_id`),
	FOREIGN KEY (`collection_id`) REFERENCES `collections`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`deal_id`) REFERENCES `deals`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE INDEX `collection_deals_collection_idx` ON `collection_deals` (`collection_id`);
CREATE INDEX `collection_deals_deal_idx` ON `collection_deals` (`deal_id`);

-- Recreate regions table (simplified)
DROP TABLE IF EXISTS regions;
CREATE TABLE `regions` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`is_active` integer DEFAULT 1,
	`created_at` integer NOT NULL
);

CREATE UNIQUE INDEX `regions_code_idx` ON `regions` (`code`);

-- Create deal_regions junction table
CREATE TABLE `deal_regions` (
	`deal_id` text NOT NULL,
	`region_id` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`deal_id`, `region_id`),
	FOREIGN KEY (`deal_id`) REFERENCES `deals`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`region_id`) REFERENCES `regions`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE INDEX `deal_regions_deal_idx` ON `deal_regions` (`deal_id`);
CREATE INDEX `deal_regions_region_idx` ON `deal_regions` (`region_id`);

-- Update clicks table
DROP TABLE IF EXISTS clicks;
CREATE TABLE `clicks` (
	`id` text PRIMARY KEY NOT NULL,
	`deal_id` text NOT NULL,
	`brand_id` text,
	`source` text,
	`referrer` text,
	`user_agent` text,
	`device` text,
	`country` text,
	`region_code` text,
	`city` text,
	`clicked_at` integer NOT NULL
);

CREATE INDEX `clicks_deal_idx` ON `clicks` (`deal_id`);
CREATE INDEX `clicks_brand_idx` ON `clicks` (`brand_id`);
CREATE INDEX `clicks_country_idx` ON `clicks` (`country`);
CREATE INDEX `clicks_source_idx` ON `clicks` (`source`);

-- Create page_views table
CREATE TABLE `page_views` (
	`id` text PRIMARY KEY NOT NULL,
	`path` text NOT NULL,
	`deal_id` text,
	`referrer` text,
	`user_agent` text,
	`device` text,
	`country` text,
	`viewed_at` integer NOT NULL
);

CREATE INDEX `page_views_deal_idx` ON `page_views` (`deal_id`);
CREATE INDEX `page_views_path_idx` ON `page_views` (`path`);
CREATE INDEX `page_views_country_idx` ON `page_views` (`country`);

-- Update subscribers table
ALTER TABLE `subscribers` ADD COLUMN `audience` text;
ALTER TABLE `subscribers` RENAME COLUMN `notify_global_perks` TO `notify_global_deals`;
