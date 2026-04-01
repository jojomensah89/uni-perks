import { relations } from "drizzle-orm";
import { brands, categories, brandFaqs } from "./brands";
import { deals } from "./deals";
import { collections, collectionDeals } from "./collections";
import { clicks, pageViews } from "./analytics";

// ===== BRAND RELATIONS =====
export const brandsRelations = relations(brands, ({ many }) => ({
    deals: many(deals),
    clicks: many(clicks),
    faqs: many(brandFaqs),
}));

// ===== BRAND FAQ RELATIONS =====
export const brandFaqsRelations = relations(brandFaqs, ({ one }) => ({
    brand: one(brands, { fields: [brandFaqs.brandId], references: [brands.id] }),
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
    collectionDeals: many(collectionDeals),
    clicks: many(clicks),
    pageViews: many(pageViews),
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
