import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

// ===== PSEO PAGES =====
// Stores optional overrides for programmatically generated SEO pages
export const pseoPages = sqliteTable("pseo_pages", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    slug: text("slug").notNull().unique(),
    playbookType: text("playbook_type").notNull(), // 'curation' | 'comparison' | 'location' | 'persona'

    // Override fields (null = use template-generated content)
    title: text("title"),
    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),
    introduction: text("introduction"),
    contentSections: text("content_sections"), // JSON array of {heading, body}
    faqs: text("faqs"), // JSON array of {question, answer}

    // Reference IDs for the page type
    categorySlug: text("category_slug"),
    tagSlug: text("tag_slug"),
    regionCode: text("region_code"),
    brandASlug: text("brand_a_slug"),
    brandBSlug: text("brand_b_slug"),
    personaSlug: text("persona_slug"),

    isPublished: integer("is_published", { mode: "boolean" }).default(true),

    createdAt: integer("created_at", { mode: "timestamp_ms" })
        .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
        .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
        .$onUpdate(() => new Date())
        .notNull(),
}, (table) => ({
    slugIdx: index("pseo_pages_slug_idx").on(table.slug),
    playbookIdx: index("pseo_pages_playbook_idx").on(table.playbookType),
    categoryIdx: index("pseo_pages_category_idx").on(table.categorySlug),
    regionIdx: index("pseo_pages_region_idx").on(table.regionCode),
}));

export type PseoPage = typeof pseoPages.$inferSelect;
export type PlaybookType = 'curation' | 'comparison' | 'location' | 'persona';

// ===== PERSONAS =====
// Defines persona types for targeted pages (e.g., "CS Students", "Design Students")
export const personas = sqliteTable("personas", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(), // "Computer Science Students"
    shortName: text("short_name").notNull(), // "CS Students"
    description: text("description"),
    painPoints: text("pain_points"), // JSON array of strings
    relevantTagSlugs: text("relevant_tag_slugs"), // JSON array of tag slugs
    relevantCategorySlugs: text("relevant_category_slugs"), // JSON array of category slugs

    // SEO
    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),

    displayOrder: integer("display_order").default(0),
    isActive: integer("is_active", { mode: "boolean" }).default(true),

    createdAt: integer("created_at", { mode: "timestamp_ms" })
        .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
        .notNull(),
}, (table) => ({
    slugIdx: index("personas_slug_idx").on(table.slug),
}));

export type Persona = typeof personas.$inferSelect;
