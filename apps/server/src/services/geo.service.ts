import { extractGeoData } from "../utils/geo.utils";
import type { GeoData } from "../utils/geo.utils";

/**
 * Get geo data from request
 */
export function getGeoData(request: Request): GeoData {
    return extractGeoData(request);
}
