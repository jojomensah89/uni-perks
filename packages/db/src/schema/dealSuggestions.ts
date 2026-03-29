import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const dealSuggestions = sqliteTable('deal_suggestions', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    brandName: text('brand_name').notNull(),
    dealTitle: text('deal_title').notNull(),
    description: text('description').notNull(),
    discountLabel: text('discount_label').notNull(),
    claimUrl: text('claim_url').notNull(),
    category: text('category'),
    source: text('source', { enum: ['ai', 'user'] }).notNull().default('user'),
    status: text('status', { enum: ['pending', 'approved', 'rejected'] }).notNull().default('pending'),
    submittedBy: text('submitted_by'), // User ID or AI agent name e.g. 'rss-agent-v1'
    submittedAt: integer('submitted_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    reviewedAt: integer('reviewed_at', { mode: 'timestamp' }),
    reviewedBy: text('reviewed_by'), // Admin user ID
    rejectionReason: text('rejection_reason'),

    // Agent-resolved fields (populated when source='ai')
    resolvedBrandId: text('resolved_brand_id'),       // Matched brands.id (nullable = not found)
    resolvedCategoryId: text('resolved_category_id'), // Matched categories.id (nullable = not found)
    confidenceScore: real('confidence_score'),          // LLM confidence 0.0–1.0
    sourceUrl: text('source_url'),                      // RSS feed URL that produced this suggestion
    rawEntryJson: text('raw_entry_json'),               // JSON.stringify of original RSS entry for audit
});

export type DealSuggestion = typeof dealSuggestions.$inferSelect;
export type NewDealSuggestion = typeof dealSuggestions.$inferInsert;
