import { db, regions } from "@uni-perks/db";
import { tryCatch } from "../lib/async-handler";

/**
 * Get all regions
 */
export async function findAllRegions() {
    return tryCatch(async () => {
        return await db.select().from(regions).all();
    }, "Failed to fetch regions");
}
