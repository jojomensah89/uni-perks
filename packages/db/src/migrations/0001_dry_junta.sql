ALTER TABLE `deal_suggestions` ADD `resolved_brand_id` text;--> statement-breakpoint
ALTER TABLE `deal_suggestions` ADD `resolved_category_id` text;--> statement-breakpoint
ALTER TABLE `deal_suggestions` ADD `confidence_score` real;--> statement-breakpoint
ALTER TABLE `deal_suggestions` ADD `source_url` text;--> statement-breakpoint
ALTER TABLE `deal_suggestions` ADD `raw_entry_json` text;