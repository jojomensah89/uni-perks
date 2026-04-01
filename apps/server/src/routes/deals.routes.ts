import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import {
  getDeals,
  getDealDetail,
  trackDealView,
} from "../services/deal.service";
import { BadRequestError } from "../lib/errors";
import { withEdgeCache } from "../lib/edge-cache";
import { sanitizeSearchQuery } from "../lib/sanitize";
import { captureEvent } from "../lib/posthog";

const app = new OpenAPIHono();

// Routes
const listDealsRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Deals"],
  summary: "List Deals",
  description:
    "Get a paginated list of deals, optionally filtered by category, featured status, collection, or search query.",
  request: {
    query: z.object({
      category: z.string().optional(),
      collectionId: z.string().optional(),
      featured: z.string().optional().openapi({ example: "true" }),
      q: z.string().max(200).optional(),
      brandId: z.string().optional(),
      excludeDealId: z.string().optional(),
      sort: z.enum(["popular", "new", "expiring"]).optional().default("popular"),
      limit: z
        .string()
        .regex(/^\d+$/)
        .refine((val) => parseInt(val) <= 100, "Maximum limit is 100")
        .optional()
        .default("50"),
      offset: z.string().regex(/^\d+$/).optional().default("0"),
    }),
  },
  responses: {
    200: {
      description: "Successful response",
      content: {
        "application/json": {
          schema: z.any(),
        },
      },
    },
  },
});

app.openapi(listDealsRoute, async (c) => {
  const query = c.req.valid("query");

  const categorySlug = query.category;
  const collectionId = query.collectionId;
  const featured =
    query.featured === "true"
      ? true
      : query.featured === "false"
        ? false
        : undefined;
  const searchQuery = query.q ? sanitizeSearchQuery(query.q) : undefined;
  const brandId = query.brandId;
  const excludeDealId = query.excludeDealId;
  const sortBy = query.sort satisfies "popular" | "new" | "expiring";
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || "50")));
  const offset = Math.max(0, parseInt(query.offset || "0"));

  const fetchDeals = async () => {
    const results = await getDeals({
      categorySlug,
      collectionId,
      featured,
      searchQuery,
      brandId,
      excludeDealId,
      sortBy,
      limit,
      offset,
    });

    return {
      deals: results,
      meta: {
        total: results.length,
        limit,
        offset,
      },
    };
  };

  const shouldCache =
    !searchQuery &&
    !brandId &&
    !excludeDealId &&
    (featured !== undefined || !!categorySlug);

  if (shouldCache) {
    const ttl = featured ? 600 : 300;
    const { data } = await withEdgeCache(c, ttl, fetchDeals);
    return c.json(data);
  }

  const result = await fetchDeals();
  return c.json(result, 200);
});

const getDealRoute = createRoute({
  method: "get",
  path: "/{slug}",
  tags: ["Deals"],
  summary: "Get Deal Detail",
  description: "Get detailed information for a specific deal by its slug.",
  request: {
    params: z.object({
      slug: z.string(),
    }),
    query: z.object({
      country: z.string().optional(),
    }),
  },
  responses: {
    200: {
      description: "Deal details",
      content: {
        "application/json": {
          schema: z.any(),
        },
      },
    },
  },
});

app.openapi(getDealRoute, async (c) => {
  const { slug } = c.req.valid("param");
  const query = c.req.valid("query");

  if (!slug) {
    throw new BadRequestError("Deal slug is required");
  }

  const country = query.country;
  const referrer = c.req.header("referer") ?? null;
  const path = c.req.path;
  const executionCtx = c.executionCtx;
  const cacheKey = new Request(`${c.req.url}`);

  const fetchDeal = async () => {
    const result = await getDealDetail({ slug });

    if (executionCtx) {
      executionCtx.waitUntil(trackDealView(result.deal.id));
      executionCtx.waitUntil(
        captureEvent("deal_viewed", {
          deal_id: result.deal.id,
          deal_slug: result.deal.slug,
          brand_id: result.brand.id,
          category_id: result.category.id,
          country,
          referrer,
          path,
        }),
      );
    } else {
      void trackDealView(result.deal.id);
      void captureEvent("deal_viewed", {
        deal_id: result.deal.id,
        deal_slug: result.deal.slug,
        brand_id: result.brand.id,
        category_id: result.category.id,
        country,
        referrer,
        path,
      });
    }

    return result;
  };

  const { data } = await withEdgeCache(c, 300, fetchDeal, cacheKey);
  return c.json(data);
});

export default app;
