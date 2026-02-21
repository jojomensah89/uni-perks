import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

// ===== BRANDS =====
export const brands = sqliteTable("brands", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    tagline: text("tagline"),
    description: text("description"),

    // Images
    logoUrl: text("logo_url"),
    coverImageUrl: text("cover_image_url"),

    // Links
    website: text("website"),

    // Rich profile content
    whyWeLoveIt: text("why_we_love_it"), // Staff editorial note e.g. "Huel is perfect for busy students..."

    // Status
    isVerified: integer("is_verified", { mode: "boolean" }).default(false),

    // SEO
    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),

    // Analytics - denormalized
    totalClickCount: integer("total_click_count").default(0),

    // Timestamps
    createdAt: integer("created_at", { mode: "timestamp_ms" })
        .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
        .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
        .$onUpdate(() => new Date())
        .notNull(),
}, (table) => ({
    slugIdx: index("brands_slug_idx").on(table.slug),
}));

// ===== CATEGORIES =====
export const categories = sqliteTable("categories", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    icon: text("icon"), // lucide icon name
    color: text("color"), // hex color for UI
    coverImageUrl: text("cover_image_url"),
    displayOrder: integer("display_order").default(0),

    // SEO
    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),

    createdAt: integer("created_at", { mode: "timestamp_ms" })
        .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
        .notNull(),
}, (table) => ({
    slugIdx: index("categories_slug_idx").on(table.slug),
    displayOrderIdx: index("categories_display_order_idx").on(table.displayOrder),
}));

export type Brand = typeof brands.$inferSelect;
export type Category = typeof categories.$inferSelect;

// ===== BRAND FAQS =====
export const brandFaqs = sqliteTable("brand_faqs", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    brandId: text("brand_id").notNull().references(() => brands.id, { onDelete: "cascade" }),
    question: text("question").notNull(),
    answer: text("answer").notNull(),
    displayOrder: integer("display_order").default(0),
}, (table) => ({
    brandIdx: index("brand_faqs_brand_idx").on(table.brandId),
    orderIdx: index("brand_faqs_order_idx").on(table.displayOrder),
}));

export type BrandFaq = typeof brandFaqs.$inferSelect;

// ===== BRAND FEATURED PRODUCTS =====
// Trending products from a brand shown on the brand profile page (e.g. Huel's Daily Greens, Apple's iPad Air)
export const brandProducts = sqliteTable("brand_products", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    brandId: text("brand_id").notNull().references(() => brands.id, { onDelete: "cascade" }),
    name: text("name").notNull(),           // "Daily Greens"
    imageUrl: text("image_url"),            // Product image
    productUrl: text("product_url"),        // Direct link to product
    displayOrder: integer("display_order").default(0),
}, (table) => ({
    brandIdx: index("brand_products_brand_idx").on(table.brandId),
    orderIdx: index("brand_products_order_idx").on(table.displayOrder),
}));

export type BrandProduct = typeof brandProducts.$inferSelect;
