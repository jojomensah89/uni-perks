import { sql } from "drizzle-orm";
// Schema definition for deals
import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";
import { brands } from "./brands";
import { categories } from "./brands";

// ===== DEALS =====
export const deals = sqliteTable("deals", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    slug: text("slug").notNull().unique(),

    // Foreign keys
    brandId: text("brand_id").notNull().references(() => brands.id),
    categoryId: text("category_id").notNull().references(() => categories.id),

    // Content
    title: text("title").notNull(),
    shortDescription: text("short_description").notNull(),
    longDescription: text("long_description").notNull(),

    // Discount details
    discountType: text("discount_type").notNull(), // "percentage", "fixed", "free", "trial"
    discountValue: real("discount_value"), // 50 (for 50%)
    discountLabel: text("discount_label").notNull(), // "50% OFF", "Free for 6 months"
    originalPrice: real("original_price"),
    studentPrice: real("student_price"),
    currency: text("currency").default("USD"),

    // Verification
    verificationMethod: text("verification_method").notNull(), // "edu_email", "student_beans", "unidays", "sheerid"
    eligibilityNote: text("eligibility_note"),

    // URLs
    claimUrl: text("claim_url").notNull(),
    affiliateUrl: text("affiliate_url"),

    // Status
    isFeatured: integer("is_featured", { mode: "boolean" }).default(false),
    isExclusive: integer("is_exclusive", { mode: "boolean" }).default(false),
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
    popularity: integer("popularity").default(0), // Computed score for sorting

    // Timestamps
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
    activeIdx: index("deals_active_idx").on(table.isActive),
    popularityIdx: index("deals_popularity_idx").on(table.popularity),
}));

export type Deal = typeof deals.$inferSelect;
