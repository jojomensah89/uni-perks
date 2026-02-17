import { Hono } from 'hono';
import { db, dealSuggestions, eq } from '@uni-perks/db';

const app = new Hono();

// Submit new suggestion
app.post('/', async (c) => {
    const body = await c.req.json();

    // Manual validation
    if (!body.brandName || !body.dealTitle || !body.description || !body.discountLabel || !body.claimUrl) {
        return c.json({ error: 'Missing required fields' }, 400);
    }

    if (body.description.length < 10) {
        return c.json({ error: 'Description must be at least 10 characters' }, 400);
    }

    try {
        new URL(body.claimUrl);
    } catch {
        return c.json({ error: 'Invalid claim URL' }, 400);
    }

    const data = {
        brandName: body.brandName,
        dealTitle: body.dealTitle,
        description: body.description,
        discountLabel: body.discountLabel,
        claimUrl: body.claimUrl,
        category: body.category,
        source: body.source || 'user',
        submittedBy: body.submittedBy,
    };

    const [suggestion] = await db.insert(dealSuggestions).values(data).returning();

    return c.json({ success: true, suggestion }, 201);
});

// List suggestions (public - pending only, admin - all)
app.get('/', async (c) => {
    const status = c.req.query('status') as 'pending' | 'approved' | 'rejected' | undefined;
    const source = c.req.query('source') as 'ai' | 'user' | undefined;
    const limit = parseInt(c.req.query('limit') || '50');
    const offset = parseInt(c.req.query('offset') || '0');

    let query = db.select().from(dealSuggestions);

    // Apply filters
    if (status) {
        query = query.where(eq(dealSuggestions.status, status)) as any;
    } else {
        // Default to pending for public
        query = query.where(eq(dealSuggestions.status, 'pending')) as any;
    }

    if (source) {
        query = query.where(eq(dealSuggestions.source, source)) as any;
    }

    const suggestions = await query.limit(limit).offset(offset);

    return c.json({ suggestions, count: suggestions.length });
});

// Get single suggestion
app.get('/:id', async (c) => {
    const id = c.req.param('id');

    const [suggestion] = await db
        .select()
        .from(dealSuggestions)
        .where(eq(dealSuggestions.id, id))
        .limit(1);

    if (!suggestion) {
        return c.json({ error: 'Suggestion not found' }, 404);
    }

    return c.json({ suggestion });
});

export default app;
