import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, index, primaryKey } from "drizzle-orm/sqlite-core";
import { deals } from "./deals";

// ===== TAGS =====
export const tags = sqliteTable("tags", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    audience: text("audience"), // "cs-students", "designers", "all"

    createdAt: integer("created_at", { mode: "timestamp_ms" })
        .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
        .notNull(),
}, (table) => ({
    slugIdx: index("tags_slug_idx").on(table.slug),
}));

// ===== DEAL_TAGS (M2M Junction) =====
export const dealTags = sqliteTable("deal_tags", {
    dealId: text("deal_id").notNull().references(() => deals.id, { onDelete: "cascade" }),
    tagId: text("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),

    createdAt: integer("created_at", { mode: "timestamp_ms" })
        .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
        .notNull(),
}, (table) => ({
    pk: primaryKey({ columns: [table.dealId, table.tagId] }),
    dealIdx: index("deal_tags_deal_idx").on(table.dealId),
    tagIdx: index("deal_tags_tag_idx").on(table.tagId),
}));

export type Tag = typeof tags.$inferSelect;
export type DealTag = typeof dealTags.$inferSelect;
