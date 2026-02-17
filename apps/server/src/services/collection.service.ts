import { findAllCollections, findCollectionBySlug } from "../repositories/collection.repository";

export async function getCollections(options: { featured?: boolean } = {}) {
    return await findAllCollections(options);
}

export async function getCollectionBySlug(slug: string) {
    return await findCollectionBySlug(slug);
}
