import { relations } from "drizzle-orm";
import { brands, categories } from "./brands";
import { deals } from "./deals";
import { tags, dealTags } from "./tags";
import { collections, collectionDeals } from "./collections";
import { regions, dealRegions } from "./geo";
import { clicks, pageViews } from "./analytics";

// ===== BRAND RELATIONS =====
export const brandsRelations = relations(brands, ({ many }) => ({
    deals: many(deals),
    clicks: many(clicks),
}));

// ===== CATEGORY RELATIONS =====
export const categoriesRelations = relations(categories, ({ many }) => ({
    deals: many(deals),
}));

// ===== DEAL RELATIONS =====
export const dealsRelations = relations(deals, ({ one, many }) => ({
    brand: one(brands, {
        fields: [deals.brandId],
        references: [brands.id],
    }),
    category: one(categories, {
        fields: [deals.categoryId],
        references: [categories.id],
    }),
    dealTags: many(dealTags),
    dealRegions: many(dealRegions),
    collectionDeals: many(collectionDeals),
    clicks: many(clicks),
    pageViews: many(pageViews),
}));

// ===== TAG RELATIONS =====
export const tagsRelations = relations(tags, ({ many }) => ({
    dealTags: many(dealTags),
}));

export const dealTagsRelations = relations(dealTags, ({ one }) => ({
    deal: one(deals, {
        fields: [dealTags.dealId],
        references: [deals.id],
    }),
    tag: one(tags, {
        fields: [dealTags.tagId],
        references: [tags.id],
    }),
}));

// ===== COLLECTION RELATIONS =====
export const collectionsRelations = relations(collections, ({ many }) => ({
    collectionDeals: many(collectionDeals),
}));

export const collectionDealsRelations = relations(collectionDeals, ({ one }) => ({
    collection: one(collections, {
        fields: [collectionDeals.collectionId],
        references: [collections.id],
    }),
    deal: one(deals, {
        fields: [collectionDeals.dealId],
        references: [deals.id],
    }),
}));

// ===== REGION RELATIONS =====
export const regionsRelations = relations(regions, ({ many }) => ({
    dealRegions: many(dealRegions),
}));

export const dealRegionsRelations = relations(dealRegions, ({ one }) => ({
    deal: one(deals, {
        fields: [dealRegions.dealId],
        references: [deals.id],
    }),
    region: one(regions, {
        fields: [dealRegions.regionId],
        references: [regions.id],
    }),
}));

// ===== ANALYTICS RELATIONS =====
export const clicksRelations = relations(clicks, ({ one }) => ({
    deal: one(deals, {
        fields: [clicks.dealId],
        references: [deals.id],
    }),
    brand: one(brands, {
        fields: [clicks.brandId],
        references: [brands.id],
    }),
}));

export const pageViewsRelations = relations(pageViews, ({ one }) => ({
    deal: one(deals, {
        fields: [pageViews.dealId],
        references: [deals.id],
    }),
}));
