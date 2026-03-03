CREATE TABLE `personas` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`short_name` text NOT NULL,
	`description` text,
	`pain_points` text,
	`relevant_tag_slugs` text,
	`relevant_category_slugs` text,
	`meta_title` text,
	`meta_description` text,
	`display_order` integer DEFAULT 0,
	`is_active` integer DEFAULT true,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `personas_slug_unique` ON `personas` (`slug`);--> statement-breakpoint
CREATE INDEX `personas_slug_idx` ON `personas` (`slug`);--> statement-breakpoint
CREATE TABLE `pseo_pages` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`playbook_type` text NOT NULL,
	`title` text,
	`meta_title` text,
	`meta_description` text,
	`introduction` text,
	`content_sections` text,
	`faqs` text,
	`category_slug` text,
	`tag_slug` text,
	`region_code` text,
	`brand_a_slug` text,
	`brand_b_slug` text,
	`persona_slug` text,
	`is_published` integer DEFAULT true,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pseo_pages_slug_unique` ON `pseo_pages` (`slug`);--> statement-breakpoint
CREATE INDEX `pseo_pages_slug_idx` ON `pseo_pages` (`slug`);--> statement-breakpoint
CREATE INDEX `pseo_pages_playbook_idx` ON `pseo_pages` (`playbook_type`);--> statement-breakpoint
CREATE INDEX `pseo_pages_category_idx` ON `pseo_pages` (`category_slug`);--> statement-breakpoint
CREATE INDEX `pseo_pages_region_idx` ON `pseo_pages` (`region_code`);