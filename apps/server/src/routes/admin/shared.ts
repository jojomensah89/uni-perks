export function normalizeConditions(input?: string[] | string | null): string | null {
    if (!input) return null;
    if (Array.isArray(input)) return input.length > 0 ? JSON.stringify(input) : null;
    const lines = input
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
    return lines.length > 0 ? JSON.stringify(lines) : null;
}

export function normalizeExpiresAt(input?: string | number | null): Date | null {
    if (input === undefined || input === null) return null;
    if (typeof input === "number") return new Date(input);
    const parsed = Date.parse(input);
    return Number.isNaN(parsed) ? null : new Date(parsed);
}
