import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

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
    submittedBy: text('submitted_by'), // User ID or AI agent name
    submittedAt: integer('submitted_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    reviewedAt: integer('reviewed_at', { mode: 'timestamp' }),
    reviewedBy: text('reviewed_by'), // Admin user ID
    rejectionReason: text('rejection_reason'),
});
