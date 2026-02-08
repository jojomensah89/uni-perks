import { extractGeoData } from "../utils/geo.utils";
import type { GeoData } from "../utils/geo.utils";
import { findAllRegions } from "../repositories/geo.repository";

/**
 * Get geo data from request
 */
export function getGeoData(request: Request): GeoData {
    return extractGeoData(request);
}

/**
 * Get all available regions
 */
export async function getRegions() {
    return await findAllRegions();
}
