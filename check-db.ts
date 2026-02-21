import { db, deals, categories, brands } from "@uni-perks/db";

async function checkDb() {
    const allDeals = await db.select().from(deals);
    const allCategories = await db.select().from(categories);
    const allBrands = await db.select().from(brands);

    console.log(`Deals: ${allDeals.length}`);
    console.log(`Categories: ${allCategories.length}`);
    console.log(`Brands: ${allBrands.length}`);

    if (allDeals.length > 0) {
        console.log(allDeals[0]);
    }
}

checkDb().catch(console.error);
