import { db, collections, collectionDeals, deals, brands, categories, eq, and, desc } from "@uni-perks/db";
import { NotFoundError } from "../lib/errors";

export async function findAllCollections(options: { featured?: boolean } = {}) {
    let query = db.select().from(collections).$dynamic();

    if (options.featured) {
        query = query.where(eq(collections.isFeatured, true));
    }

    return await query.orderBy(collections.displayOrder);
}

export async function findCollectionBySlug(slug: string) {
    const result = await db
        .select()
        .from(collections)
        .where(eq(collections.slug, slug))
        .limit(1);

    if (!result[0]) {
        throw new NotFoundError("Collection not found");
    }

    // Get all deals in this collection
    const collectionDealsResult = await db
        .select({
            deal: deals,
            brand: brands,
            category: categories,
            displayOrder: collectionDeals.displayOrder,
        })
        .from(collectionDeals)
        .innerJoin(deals, eq(collectionDeals.dealId, deals.id))
        .innerJoin(brands, eq(deals.brandId, brands.id))
        .innerJoin(categories, eq(deals.categoryId, categories.id))
        .where(and(
            eq(collectionDeals.collectionId, result[0].id),
            eq(deals.isActive, true)
        ))
        .orderBy(collectionDeals.displayOrder);

    return {
        collection: result[0],
        deals: collectionDealsResult,
    };
}
