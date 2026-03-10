import { db, regions } from "@uni-perks/db";

/**
 * Get all regions
 */
export async function findAllRegions() {
    return await db.select().from(regions).all();
}
