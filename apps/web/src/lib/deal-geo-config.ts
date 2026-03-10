export interface DealGeoOverrideInput {
    countryCode: string;
    affiliateUrl?: string | null;
    claimUrl?: string | null;
    studentPrice?: number | null;
    originalPrice?: number | null;
    currency?: string | null;
    discountLabel?: string | null;
    isAvailable?: boolean;
}

const COUNTRY_CODE_REGEX = /^(GLOBAL|[A-Z]{2})$/;

function asNullableString(value: unknown): string | null | undefined {
    if (value === undefined) return undefined;
    if (value === null) return null;
    if (typeof value !== "string") {
        throw new Error("Expected string values for URL/text fields.");
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function asNullableNumber(value: unknown): number | null | undefined {
    if (value === undefined) return undefined;
    if (value === null || value === "") return null;
    if (typeof value !== "number" || Number.isNaN(value)) {
        throw new Error("Expected numeric values for price fields.");
    }
    return value;
}

export function parseGeoOverridesFromText(raw: string): DealGeoOverrideInput[] {
    if (!raw.trim()) return [];

    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        throw new Error("Geo overrides must be valid JSON.");
    }

    if (!Array.isArray(parsed)) {
        throw new Error("Geo overrides JSON must be an array.");
    }

    return parsed.map((row, index) => {
        if (!row || typeof row !== "object") {
            throw new Error(`Geo override at index ${index} must be an object.`);
        }

        const item = row as Record<string, unknown>;
        const countryCode = String(item.countryCode || "")
            .trim()
            .toUpperCase();

        if (!COUNTRY_CODE_REGEX.test(countryCode)) {
            throw new Error(`Invalid countryCode at index ${index}. Use \"GLOBAL\" or ISO alpha-2 codes.`);
        }

        const normalized: DealGeoOverrideInput = {
            countryCode,
            affiliateUrl: asNullableString(item.affiliateUrl),
            claimUrl: asNullableString(item.claimUrl),
            studentPrice: asNullableNumber(item.studentPrice),
            originalPrice: asNullableNumber(item.originalPrice),
            currency: asNullableString(item.currency)?.toUpperCase() ?? null,
            discountLabel: asNullableString(item.discountLabel),
            isAvailable: item.isAvailable === undefined ? true : Boolean(item.isAvailable),
        };

        return normalized;
    });
}

export function serializeGeoOverrides(overrides: DealGeoOverrideInput[]): string {
    return JSON.stringify(overrides, null, 2);
}
