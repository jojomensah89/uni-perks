import { sql } from "drizzle-orm";
// Schema definition for deals
import { sqliteTable, text, integer, real, index, uniqueIndex } from "drizzle-orm/sqlite-core";
import { brands } from "./brands";
import { categories } from "./brands";

export const deals = sqliteTable("deals", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    slug: text("slug").notNull().unique(),

    brandId: text("brand_id").notNull().references(() => brands.id),
    categoryId: text("category_id").notNull().references(() => categories.id),

    title: text("title").notNull(),
    shortDescription: text("short_description").notNull(),
    longDescription: text("long_description"),
    howToRedeem: text("how_to_redeem"),

    discountType: text("discount_type").notNull(),
    discountValue: real("discount_value"),
    discountLabel: text("discount_label").notNull(),
    originalPrice: real("original_price"),
    currency: text("currency").default("USD"),
    minimumSpend: real("minimum_spend"),

    conditions: text("conditions"),
    termsUrl: text("terms_url"),

    claimUrl: text("claim_url").notNull(),
    affiliateLink: text("affiliate_link"),
    coverImageUrl: text("cover_image_url"),

    isFeatured: integer("is_featured", { mode: "boolean" }).default(false),
    status: text("status", { enum: ["pending", "approved", "rejected", "published", "archived"] }).default("pending").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }),
    hotnessScore: integer("hotness_score").default(50),
    approvedAt: integer("approved_at", { mode: "timestamp_ms" }),
    lastVerified: integer("last_verified", { mode: "timestamp_ms" })
        .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),

    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),

    clickCount: integer("click_count").default(0),
    viewCount: integer("view_count").default(0),

    createdAt: integer("created_at", { mode: "timestamp_ms" })
        .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
        .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
        .$onUpdate(() => new Date())
        .notNull(),
}, (table) => ({
    slugIdx: index("deals_slug_idx").on(table.slug),
    brandIdx: index("deals_brand_idx").on(table.brandId),
    categoryIdx: index("deals_category_idx").on(table.categoryId),
    featuredIdx: index("deals_featured_idx").on(table.isFeatured),
    statusIdx: index("deals_status_idx").on(table.status),
    hotnessIdx: index("deals_hotness_idx").on(table.hotnessScore),
}));

export type Deal = typeof deals.$inferSelect;
