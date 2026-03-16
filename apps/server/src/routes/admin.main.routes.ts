import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import {
  db,
  deals,
  brands,
  categories,
  collections,
  siteSettings,
  user,
  eq,
  desc,
  sql,
} from "@uni-perks/db";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware";
import { invalidateKV } from "../lib/kv-cache";
import adminDealsRouter from "./admin/deals.routes";
import adminBrandsRouter from "./admin/brands.routes";
import adminCollectionsRouter from "./admin/collections.routes";
import adminCategoriesRouter from "./admin/categories.routes";

const app = new OpenAPIHono();

app.use("*", requireAuth, requireAdmin);
app.route("/", adminDealsRouter);
app.route("/", adminBrandsRouter);
app.route("/", adminCollectionsRouter);
app.route("/", adminCategoriesRouter);

const getStatsRoute = createRoute({
  method: "get",
  path: "/stats",
  tags: ["Admin"],
  summary: "Get Admin Stats",
  description: "Get dashboard statistics (Admin only).",
  responses: {
    200: {
      description: "Stats",
      content: {
        "application/json": {
          schema: z.object({
            totalDeals: z.number(),
            activeDeals: z.number(),
            totalBrands: z.number(),
            totalCategories: z.number(),
            totalCollections: z.number(),
            totalViews: z.number(),
            totalClicks: z.number(),
          }),
        },
      },
    },
  },
});

app.openapi(getStatsRoute, async (c) => {
  const [dealStats] = await db
    .select({
      total: sql<number>`count(*)`,
      active: sql<number>`sum(case when ${deals.isActive} = 1 then 1 else 0 end)`,
      totalViews: sql<number>`sum(${deals.viewCount})`,
      totalClicks: sql<number>`sum(${deals.clickCount})`,
    })
    .from(deals);

  const [brandCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(brands);

  const [categoryCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(categories);

  const [collectionCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(collections);

  return c.json(
    {
      totalDeals: dealStats?.total || 0,
      activeDeals: dealStats?.active || 0,
      totalBrands: brandCount?.count || 0,
      totalCategories: categoryCount?.count || 0,
      totalCollections: collectionCount?.count || 0,
      totalViews: dealStats?.totalViews || 0,
      totalClicks: dealStats?.totalClicks || 0,
    },
    200,
  );
});

const updateTickerRoute = createRoute({
  method: "put",
  path: "/settings/ticker",
  tags: ["Admin"],
  summary: "Update Ticker Messages",
  description: "Update the site ticker messages (Admin only).",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            messages: z.array(z.string()),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Ticker updated",
      content: {
        "application/json": { schema: z.object({ success: z.boolean() }) },
      },
    },
  },
});

app.openapi(updateTickerRoute, async (c) => {
  const { messages } = c.req.valid("json");
  const value = JSON.stringify(messages);

  const existing = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.key, "ticker_messages"))
    .limit(1);

  if (existing[0]) {
    await db
      .update(siteSettings)
      .set({ value, updatedAt: new Date() })
      .where(eq(siteSettings.id, existing[0].id));
  } else {
    await db.insert(siteSettings).values({
      key: "ticker_messages",
      value,
      description: "Messages displayed in the scrolling ticker banner",
    });
  }

  await invalidateKV((c.env as { KV?: KVNamespace }).KV, "settings:ticker");
  return c.json({ success: true }, 200);
});

const listUsersRoute = createRoute({
  method: "get",
  path: "/users",
  tags: ["Admin"],
  summary: "List Users (Admin)",
  description: "Get all users (Admin only).",
  responses: {
    200: {
      description: "List of users",
      content: {
        "application/json": {
          schema: z.object({
            users: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
                email: z.string(),
                role: z.string(),
                emailVerified: z.boolean(),
                image: z.string().nullable().optional(),
                createdAt: z.string().optional(),
              }),
            ),
          }),
        },
      },
    },
  },
});

app.openapi(listUsersRoute, async (c) => {
  const results = await db.select().from(user).orderBy(desc(user.createdAt));
  return c.json({ users: results }, 200);
});

export default app;
