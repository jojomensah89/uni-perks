import { findBrandBySlug, findAllBrands } from "../repositories/brand.repository";

export async function getBrandBySlug(slug: string) {
    return await findBrandBySlug(slug);
}

export async function getAllBrands() {
    return await findAllBrands();
}
