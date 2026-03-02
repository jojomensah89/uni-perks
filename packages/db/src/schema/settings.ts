import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// ===== SITE SETTINGS =====
// Key-value store for site-wide configuration
export const siteSettings = sqliteTable("site_settings", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    key: text("key").notNull().unique(), // e.g., "ticker_messages", "site_name", etc.
    value: text("value"), // JSON string for complex values, plain text for simple ones
    description: text("description"), // Human-readable description of what this setting does
    
    createdAt: integer("created_at", { mode: "timestamp_ms" })
        .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
        .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
        .$onUpdate(() => new Date())
        .notNull(),
});

export type SiteSetting = typeof siteSettings.$inferSelect;
