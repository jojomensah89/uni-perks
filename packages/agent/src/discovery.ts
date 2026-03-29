import { 
  db, 
  brands, 
  categories, 
  dealSuggestions, 
  deals, 
  and, 
  eq, 
  sql, 
  like 
} from "@uni-perks/db";
import { fetchAndParseFeed } from "./parser.js";
import { CreateSuggestionSchema, sanitizeUrl } from "./sanitize.js";
import type { CreateSuggestionInput } from "./sanitize.js";
import { TRUSTED_FEEDS } from "./feeds.js";

/**
 * Core discovery logic used by both the MCP server and the cron worker.
 */
export async function discoverNewDeals(feedUrl: string) {
  const isTrusted = TRUSTED_FEEDS.some((f) => f.url === feedUrl);
  if (!isTrusted) throw new Error("Feed URL not in allowlist.");

  const items = await fetchAndParseFeed(feedUrl);
  return items;
}

export async function resolveBrand(name: string) {
  return await db
    .select({ id: brands.id, name: brands.name })
    .from(brands)
    .where(like(brands.name, `%${name}%`))
    .limit(5);
}

export async function resolveCategory(name: string) {
  return await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .where(like(categories.name, `%${name}%`))
    .limit(5);
}

function normalizeTitle(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export async function checkDuplicate(input: { claimUrl?: string; title?: string }) {
  const normalizedTitle = input.title ? normalizeTitle(input.title) : undefined;
  if (!input.claimUrl && !normalizedTitle) {
    throw new Error("checkDuplicate requires claimUrl or title");
  }

  if (input.claimUrl) {
    const existingDeals = await db
      .select({ id: deals.id })
      .from(deals)
      .where(eq(deals.claimUrl, input.claimUrl))
      .limit(1);

    const existingSuggestions = await db
      .select({ id: dealSuggestions.id })
      .from(dealSuggestions)
      .where(
        and(
          eq(dealSuggestions.claimUrl, input.claimUrl),
          sql`${dealSuggestions.status} != 'rejected'`
        )
      )
      .limit(1);

    if (existingDeals.length > 0 || existingSuggestions.length > 0) {
      return true;
    }
  }

  if (!normalizedTitle) {
    return false;
  }

  const matchingDealsByTitle = await db
    .select({ id: deals.id })
    .from(deals)
    .where(sql`lower(trim(${deals.title})) = ${normalizedTitle}`)
    .limit(1);

  const matchingSuggestionsByTitle = await db
    .select({ id: dealSuggestions.id })
    .from(dealSuggestions)
    .where(
      and(
        sql`lower(trim(${dealSuggestions.dealTitle})) = ${normalizedTitle}`,
        sql`${dealSuggestions.status} != 'rejected'`
      )
    )
    .limit(1);

  return matchingDealsByTitle.length > 0 || matchingSuggestionsByTitle.length > 0;
}

export async function createSuggestion(input: CreateSuggestionInput) {
  const validated = CreateSuggestionSchema.parse(input);
  const sourceHost = new URL(validated.sourceUrl).hostname;
  const sanitizedClaimUrl = sanitizeUrl(validated.claimUrl, sourceHost);
  return await db
    .insert(dealSuggestions)
    .values({
      ...validated,
      claimUrl: sanitizedClaimUrl,
      source: "ai",
      status: "pending",
      submittedBy: "rss-agent-v1",
    })
    .returning();
}
