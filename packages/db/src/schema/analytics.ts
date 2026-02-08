import { relations, sql } from "drizzle-orm";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { perks } from "./perks";

// ===== SUBSCRIBERS =====
export const subscribers = sqliteTable("subscribers", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    email: text("email").notNull().unique(),
    isVerified: integer("is_verified", { mode: "boolean" }).default(false),
    verifiedAt: integer("verified_at", { mode: "timestamp_ms" }),

    // Preferences
    frequency: text("frequency").default("weekly"),

    // === GEO PREFERENCES ===
    country: text("country"), // User's country (from signup or IP)
    preferredCountries: text("preferred_countries", { mode: "json" }).$type<string[]>(),
    notifyGlobalPerks: integer("notify_global_perks", { mode: "boolean" }).default(true),
    // === END GEO ===

    subscribedAt: integer("subscribed_at", { mode: "timestamp_ms" })
        .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
        .notNull(),
    unsubscribedAt: integer("unsubscribed_at", { mode: "timestamp_ms" }),
});

// ===== CLICKS =====
export const clicks = sqliteTable("clicks", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    perkId: text("perk_id").notNull(),

    // Tracking
    referrer: text("referrer"),
    userAgent: text("user_agent"),

    // === GEO TRACKING ===
    country: text("country"), // CF-IPCountry header
    region: text("region"), // Derived from country
    city: text("city"), // CF-IPCity header (optional)
    // === END GEO ===

    clickedAt: integer("clicked_at", { mode: "timestamp_ms" })
        .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
        .notNull(),
}, (table) => ({
    countryIdx: index("clicks_country_idx").on(table.country),
    perkCountryIdx: index("clicks_perk_country_idx").on(table.perkId, table.country),
}));

export const clicksRelations = relations(clicks, ({ one }) => ({
    perk: one(perks, {
        fields: [clicks.perkId],
        references: [perks.id],
    }),
}));
