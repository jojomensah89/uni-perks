import { z } from "zod";

/**
 * Zod schema for validating the deal data extracted by the LLM.
 * This ensures that no malformed data is inserted into the DB.
 */
export const CreateSuggestionSchema = z.object({
  brandName: z.string().min(1).max(100),
  dealTitle: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  discountLabel: z.string().min(1).max(100),
  claimUrl: z.string().url().max(500),
  category: z.string().min(1).max(50),
  resolvedBrandId: z.string().optional(),
  resolvedCategoryId: z.string().optional(),
  confidenceScore: z.number().min(0).max(1),
  sourceUrl: z.string().url(),
  rawEntryJson: z.string(),
});

export type CreateSuggestionInput = z.infer<typeof CreateSuggestionSchema>;

/**
 * Validates and sanitizes a URL.
 */
export function sanitizeUrl(url: string, baseDomain?: string): string {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:") {
    throw new Error("Only HTTPS URLs are allowed.");
  }

  // Optional: check if the URL matches the source feed's domain for extra security
  if (baseDomain && !parsed.hostname.endsWith(baseDomain)) {
      // This is a strict check, maybe too strict for some feeds that link to other domains
      // For now we'll just log it
      console.warn(`URL domain mismatch. Expected ${baseDomain}, got ${parsed.hostname}`);
  }

  return parsed.toString();
}
