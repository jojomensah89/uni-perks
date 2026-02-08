import { Hono } from "hono";
import { trackPerkClick } from "../services/perk.service";
import { BadRequestError } from "../lib/errors";

const app = new Hono();

/**
 * POST /api/clicks/:perkId
 * Track a click on a perk
 */
app.post("/:perkId", async (c) => {
    const perkId = c.req.param("perkId");

    if (!perkId) {
        throw new BadRequestError("Perk ID is required");
    }

    await trackPerkClick(perkId);
    return c.json({ success: true });
});

export default app;
