import { findAllCategories } from "../repositories/category.repository";

/**
 * Get all categories
 */
export async function getAllCategories() {
    return await findAllCategories();
}
