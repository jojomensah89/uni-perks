import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, index, primaryKey } from "drizzle-orm/sqlite-core";
import { deals } from "./deals";

// ===== COLLECTIONS =====
export const collections = sqliteTable("collections", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    description: text("description"),
    audience: text("audience"), // "cs-students", "designers", "all"
    coverImageUrl: text("cover_image_url"),
    icon: text("icon"),

    // Display
    isFeatured: integer("is_featured", { mode: "boolean" }).default(false),
    displayOrder: integer("display_order").default(0),

    // SEO
    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),

    createdAt: integer("created_at", { mode: "timestamp_ms" })
        .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
        .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
        .$onUpdate(() => new Date())
        .notNull(),
}, (table) => ({
    slugIdx: index("collections_slug_idx").on(table.slug),
    featuredIdx: index("collections_featured_idx").on(table.isFeatured),
    displayOrderIdx: index("collections_display_order_idx").on(table.displayOrder),
}));

// ===== COLLECTION_DEALS (M2M Junction) =====
export const collectionDeals = sqliteTable("collection_deals", {
    collectionId: text("collection_id").notNull().references(() => collections.id, { onDelete: "cascade" }),
    dealId: text("deal_id").notNull().references(() => deals.id, { onDelete: "cascade" }),
    displayOrder: integer("display_order").default(0),

    createdAt: integer("created_at", { mode: "timestamp_ms" })
        .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
        .notNull(),
}, (table) => ({
    pk: primaryKey({ columns: [table.collectionId, table.dealId] }),
    collectionIdx: index("collection_deals_collection_idx").on(table.collectionId),
    dealIdx: index("collection_deals_deal_idx").on(table.dealId),
}));

export type Collection = typeof collections.$inferSelect;
export type CollectionDeal = typeof collectionDeals.$inferSelect;
