import { findAllCategories, findCategoryBySlug } from "../repositories/category.repository";

/**
 * Get all categories
 */
export async function getAllCategories() {
    return await findAllCategories();
}

/**
 * Get category by slug with deals
 */
export async function getCategoryBySlug(slug: string) {
    return await findCategoryBySlug(slug);
}
