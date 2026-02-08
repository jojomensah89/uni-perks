import { relations, sql } from "drizzle-orm";
import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";

// ===== CATEGORIES =====
export const categories = sqliteTable("categories", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    icon: text("icon"), // lucide icon name
    createdAt: integer("created_at", { mode: "timestamp_ms" })
        .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
        .notNull(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
    perks: many(perks),
}));

// ===== PERKS (Enhanced with Geo) =====
export const perks = sqliteTable("perks", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    shortDescription: text("short_description").notNull(),
    longDescription: text("long_description").notNull(),
    company: text("company").notNull(),
    companyLogo: text("company_logo"),

    // Value
    valueAmount: real("value_amount"),
    valueCurrency: text("value_currency").default("USD"),

    // Category
    categoryId: text("category_id").notNull().references(() => categories.id),

    // === GEO-LOCATION FIELDS ===
    // Country availability (JSON array of ISO country codes e.g. ["US", "CA"])
    availableCountries: text("available_countries", { mode: "json" }).$type<string[]>(),

    // Excluded countries (JSON array)
    excludedCountries: text("excluded_countries", { mode: "json" }).$type<string[]>(),

    // Is this perk available globally?
    isGlobal: integer("is_global", { mode: "boolean" }).default(false),

    // Regional grouping (for easier filtering)
    region: text("region"), // "North America", "Europe", "Asia Pacific", "Global"

    // Specific region notes
    regionNotes: text("region_notes"),

    // Display priority per region (higher = shown first)
    displayPriority: integer("display_priority").default(0),

    // Country-specific claim URLs (JSON object)
    countryUrls: text("country_urls", { mode: "json" }).$type<Record<string, string>>(),

    // Country-specific value amounts (JSON object)
    countryValues: text("country_values", { mode: "json" }).$type<Record<string, number>>(),
    // === END GEO FIELDS ===

    // Verification
    verificationMethod: text("verification_method").notNull(),
    eligibilityNote: text("eligibility_note"),

    // URLs
    claimUrl: text("claim_url").notNull(),
    affiliateUrl: text("affiliate_url"),

    // Status
    isFeatured: integer("is_featured", { mode: "boolean" }).default(false),
    isActive: integer("is_active", { mode: "boolean" }).default(true),
    expirationDate: integer("expiration_date", { mode: "timestamp_ms" }),
    lastVerified: integer("last_verified", { mode: "timestamp_ms" })
        .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),

    // SEO
    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),

    // Analytics - denormalized counters
    clickCount: integer("click_count").default(0),
    viewCount: integer("view_count").default(0),

    // Timestamps
    createdAt: integer("created_at", { mode: "timestamp_ms" })
        .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
        .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
}, (table) => ({
    regionIdx: index("region_idx").on(table.region),
    isGlobalIdx: index("is_global_idx").on(table.isGlobal),
    categoryIdx: index("category_idx").on(table.categoryId),
    slugIdx: index("slug_idx").on(table.slug),
}));

export const perksRelations = relations(perks, ({ one }) => ({
    category: one(categories, {
        fields: [perks.categoryId],
        references: [categories.id],
    }),
}));

export type Category = typeof categories.$inferSelect;
export type Perk = typeof perks.$inferSelect;
