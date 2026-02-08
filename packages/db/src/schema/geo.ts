import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

// ===== COUNTRIES =====
export const countries = sqliteTable("countries", {
    code: text("code").primaryKey(), // ISO 3166-1 alpha-2 (US, UK, CA)
    name: text("name").notNull(), // "United States"
    region: text("region").notNull(), // "North America"
    continent: text("continent").notNull(), // "Americas"
    flag: text("flag").notNull(), // 🇺🇸 emoji

    // Currency for displaying values
    currency: text("currency").default("USD"),
    currencySymbol: text("currency_symbol").default("$"),

    // Popular for prioritization
    isPopular: integer("is_popular", { mode: "boolean" }).default(false),

    // SEO
    slug: text("slug").notNull().unique(), // "united-states"
    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),

    // Stats
    perkCount: integer("perk_count").default(0),

    createdAt: integer("created_at", { mode: "timestamp_ms" })
        .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
        .notNull(),
});

// ===== REGIONS =====
export const regions = sqliteTable("regions", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull().unique(), // "North America"
    slug: text("slug").notNull().unique(), // "north-america"
    description: text("description"),

    // Countries in this region (JSON array)
    countryCodes: text("country_codes", { mode: "json" }).$type<string[]>(),

    // SEO
    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),

    // Stats
    perkCount: integer("perk_count").default(0),

    createdAt: integer("created_at", { mode: "timestamp_ms" })
        .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
        .notNull(),
});
