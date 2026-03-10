import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

// ===== SUBSCRIBERS =====
export const subscribers = sqliteTable("subscribers", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    email: text("email").notNull().unique(),
    source: text("source").default("website"),
    isVerified: integer("is_verified", { mode: "boolean" }).default(false),
    verificationToken: text("verification_token"),
    verifiedAt: integer("verified_at", { mode: "timestamp_ms" }),

    // Preferences
    frequency: text("frequency").default("weekly"),
    audience: text("audience"), // "cs-students", "designers", "all"

    // Geo preferences
    country: text("country"),
    preferredCountries: text("preferred_countries", { mode: "json" }).$type<string[]>(),
    notifyGlobalDeals: integer("notify_global_deals", { mode: "boolean" }).default(true),

    subscribedAt: integer("subscribed_at", { mode: "timestamp_ms" })
        .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
        .notNull(),
    unsubscribedAt: integer("unsubscribed_at", { mode: "timestamp_ms" }),
});

// ===== CLICKS =====
export const clicks = sqliteTable("clicks", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    dealId: text("deal_id").notNull(),
    brandId: text("brand_id"),

    // Tracking
    source: text("source"), // "homepage", "category", "search", "collection"
    referrer: text("referrer"),
    userAgent: text("user_agent"),
    device: text("device"), // "mobile", "desktop", "tablet"

    // Geo tracking
    country: text("country"), // CF-IPCountry
    regionCode: text("region_code"), // ISO region code
    city: text("city"), // CF-IPCity

    clickedAt: integer("clicked_at", { mode: "timestamp_ms" })
        .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
        .notNull(),
}, (table) => ({
    dealIdx: index("clicks_deal_idx").on(table.dealId),
    brandIdx: index("clicks_brand_idx").on(table.brandId),
    countryIdx: index("clicks_country_idx").on(table.country),
    sourceIdx: index("clicks_source_idx").on(table.source),
}));

// ===== PAGE_VIEWS =====
export const pageViews = sqliteTable("page_views", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    path: text("path").notNull(),
    dealId: text("deal_id"), // null for non-deal pages

    // Tracking
    referrer: text("referrer"),
    userAgent: text("user_agent"),
    device: text("device"),

    // Geo
    country: text("country"),

    viewedAt: integer("viewed_at", { mode: "timestamp_ms" })
        .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
        .notNull(),
}, (table) => ({
    dealIdx: index("page_views_deal_idx").on(table.dealId),
    pathIdx: index("page_views_path_idx").on(table.path),
    countryIdx: index("page_views_country_idx").on(table.country),
}));

export type Subscriber = typeof subscribers.$inferSelect;
export type Click = typeof clicks.$inferSelect;
export type PageView = typeof pageViews.$inferSelect;
