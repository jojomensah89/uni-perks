export interface GeoData {
    country: string;
    region: string;
    continent: string;
    city?: string;
}

/**
 * Extract geo data from Cloudflare headers
 */
export function extractGeoData(request: Request): GeoData {
    return {
        country: request.headers.get("CF-IPCountry") || "US",
        region: request.headers.get("CF-Region") || "",
        continent: request.headers.get("CF-Continent") || "NA",
        city: request.headers.get("CF-IPCity") || undefined,
    };
}

/**
 * Get region name from country code
 */
export function getRegionFromCountry(country: string): string {
    const regionMap: Record<string, string> = {
        // North America
        US: "North America",
        CA: "North America",
        MX: "North America",

        // Europe
        UK: "Europe",
        DE: "Europe",
        FR: "Europe",
        ES: "Europe",
        IT: "Europe",
        NL: "Europe",
        SE: "Europe",
        NO: "Europe",

        // Asia Pacific
        AU: "Asia Pacific",
        NZ: "Asia Pacific",
        SG: "Asia Pacific",
        JP: "Asia Pacific",
        KR: "Asia Pacific",
        IN: "Asia Pacific",

        // Latin America
        BR: "Latin America",
        AR: "Latin America",
        CL: "Latin America",

        // Middle East & Africa
        ZA: "Middle East & Africa",
        AE: "Middle East & Africa",
        SA: "Middle East & Africa",
    };

    return regionMap[country] || "Other";
}

/**
 * Get country name from country code
 */
export function getCountryName(countryCode: string): string {
    const names: Record<string, string> = {
        US: "United States",
        UK: "United Kingdom",
        CA: "Canada",
        AU: "Australia",
        DE: "Germany",
        FR: "France",
        ES: "Spain",
        IT: "Italy",
        NL: "Netherlands",
        JP: "Japan",
        IN: "India",
        BR: "Brazil",
    };

    return names[countryCode] || countryCode;
}
