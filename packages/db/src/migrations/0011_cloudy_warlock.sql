DROP TABLE `brand_products`;--> statement-breakpoint
DROP TABLE `personas`;--> statement-breakpoint
DROP TABLE `pseo_pages`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_deals` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`brand_id` text NOT NULL,
	`category_id` text NOT NULL,
	`title` text NOT NULL,
	`short_description` text NOT NULL,
	`long_description` text,
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
	`cover_image_url` text,
	`is_featured` integer DEFAULT false,
	`status` text DEFAULT 'draft' NOT NULL,
	`expiration_date` integer,
	`last_verified` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)),
	`meta_title` text,
	`meta_description` text,
	`click_count` integer DEFAULT 0,
	`view_count` integer DEFAULT 0,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_deals`("id", "slug", "brand_id", "category_id", "title", "short_description", "long_description", "how_to_redeem", "discount_type", "discount_value", "discount_label", "original_price", "student_price", "currency", "minimum_spend", "is_new_customer_only", "conditions", "terms_url", "verification_method", "eligibility_note", "claim_url", "affiliate_url", "cover_image_url", "is_featured", "status", "expiration_date", "last_verified", "meta_title", "meta_description", "click_count", "view_count", "created_at", "updated_at") SELECT "id", "slug", "brand_id", "category_id", "title", "short_description", "long_description", "how_to_redeem", "discount_type", "discount_value", "discount_label", "original_price", "student_price", "currency", "minimum_spend", "is_new_customer_only", "conditions", "terms_url", "verification_method", "eligibility_note", "claim_url", "affiliate_url", "cover_image_url", "is_featured", "status", "expiration_date", "last_verified", "meta_title", "meta_description", "click_count", "view_count", "created_at", "updated_at" FROM `deals`;--> statement-breakpoint
DROP TABLE `deals`;--> statement-breakpoint
ALTER TABLE `__new_deals` RENAME TO `deals`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `deals_slug_unique` ON `deals` (`slug`);--> statement-breakpoint
CREATE INDEX `deals_slug_idx` ON `deals` (`slug`);--> statement-breakpoint
CREATE INDEX `deals_brand_idx` ON `deals` (`brand_id`);--> statement-breakpoint
CREATE INDEX `deals_category_idx` ON `deals` (`category_id`);--> statement-breakpoint
CREATE INDEX `deals_featured_idx` ON `deals` (`is_featured`);--> statement-breakpoint
CREATE INDEX `deals_status_idx` ON `deals` (`status`);--> statement-breakpoint
ALTER TABLE `collections` ADD `cover_image_url` text;--> statement-breakpoint
ALTER TABLE `collections` ADD `icon` text;

-- Rebuild deals FTS for the new schema (status, removed popularity/geo)
DROP TRIGGER IF EXISTS deals_fts_insert;
DROP TRIGGER IF EXISTS deals_fts_update;
DROP TRIGGER IF EXISTS deals_fts_delete;
DROP TABLE IF EXISTS deals_fts;

CREATE VIRTUAL TABLE IF NOT EXISTS deals_fts USING fts5(
    deal_id UNINDEXED,
    title,
    short_description,
    brand_name,
    category_name,
    content='deals',
    content_rowid='rowid'
);

INSERT INTO deals_fts(deal_id, title, short_description, brand_name, category_name)
SELECT d.id, d.title, d.short_description, b.name, c.name
FROM deals d
JOIN brands b ON d.brand_id = b.id
JOIN categories c ON d.category_id = c.id;

CREATE TRIGGER IF NOT EXISTS deals_fts_insert AFTER INSERT ON deals
BEGIN
    INSERT INTO deals_fts(rowid, deal_id, title, short_description, brand_name, category_name)
    SELECT new.rowid, new.id, new.title, new.short_description, b.name, c.name
    FROM brands b, categories c
    WHERE b.id = new.brand_id AND c.id = new.category_id;
END;

CREATE TRIGGER IF NOT EXISTS deals_fts_update AFTER UPDATE ON deals
BEGIN
    INSERT INTO deals_fts(deals_fts, rowid, deal_id, title, short_description, brand_name, category_name)
    VALUES('delete', old.rowid, old.id, old.title, old.short_description,
        (SELECT name FROM brands WHERE id = old.brand_id),
        (SELECT name FROM categories WHERE id = old.category_id));
    INSERT INTO deals_fts(rowid, deal_id, title, short_description, brand_name, category_name)
    SELECT new.rowid, new.id, new.title, new.short_description, b.name, c.name
    FROM brands b, categories c
    WHERE b.id = new.brand_id AND c.id = new.category_id;
END;

CREATE TRIGGER IF NOT EXISTS deals_fts_delete AFTER DELETE ON deals
BEGIN
    INSERT INTO deals_fts(deals_fts, rowid, deal_id, title, short_description, brand_name, category_name)
    VALUES('delete', old.rowid, old.id, old.title, old.short_description,
        (SELECT name FROM brands WHERE id = old.brand_id),
        (SELECT name FROM categories WHERE id = old.category_id));
END;
