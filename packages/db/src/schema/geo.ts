import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, index, primaryKey } from "drizzle-orm/sqlite-core";
import { deals } from "./deals";

// ===== REGIONS =====
// Stores ISO 3166-1 alpha-2 country codes
// Flags fetched at runtime from REST Countries API: https://restcountries.com/v3.1/alpha/{code}?fields=flag
export const regions = sqliteTable("regions", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    code: text("code").notNull().unique(), // ISO 3166-1 alpha-2: "US", "GB", "CA"
    name: text("name").notNull(), // "United States", "United Kingdom"
    isActive: integer("is_active", { mode: "boolean" }).default(true),

    createdAt: integer("created_at", { mode: "timestamp_ms" })
        .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
        .notNull(),
}, (table) => ({
    codeIdx: index("regions_code_idx").on(table.code),
}));

// ===== DEAL_REGIONS (M2M Junction) =====
export const dealRegions = sqliteTable("deal_regions", {
    dealId: text("deal_id").notNull().references(() => deals.id, { onDelete: "cascade" }),
    regionId: text("region_id").notNull().references(() => regions.id, { onDelete: "cascade" }),

    createdAt: integer("created_at", { mode: "timestamp_ms" })
        .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
        .notNull(),
}, (table) => ({
    pk: primaryKey({ columns: [table.dealId, table.regionId] }),
    dealIdx: index("deal_regions_deal_idx").on(table.dealId),
    regionIdx: index("deal_regions_region_idx").on(table.regionId),
}));

export type Region = typeof regions.$inferSelect;
export type DealRegion = typeof dealRegions.$inferSelect;
