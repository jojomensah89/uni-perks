-- FTS5 virtual table for full-text search on deals
CREATE VIRTUAL TABLE IF NOT EXISTS deals_fts USING fts5(
    deal_id UNINDEXED,
    title,
    short_description,
    brand_name,
    category_name,
    content='deals',
    content_rowid='rowid'
);

-- Populate FTS table with existing deals data
INSERT INTO deals_fts(deal_id, title, short_description, brand_name, category_name)
SELECT d.id, d.title, d.short_description, b.name, c.name
FROM deals d
JOIN brands b ON d.brand_id = b.id
JOIN categories c ON d.category_id = c.id;

-- Trigger to keep FTS in sync on INSERT
CREATE TRIGGER IF NOT EXISTS deals_fts_insert AFTER INSERT ON deals
BEGIN
    INSERT INTO deals_fts(deal_id, title, short_description, brand_name, category_name)
    SELECT new.id, new.title, new.short_description, b.name, c.name
    FROM brands b, categories c
    WHERE b.id = new.brand_id AND c.id = new.category_id;
END;

-- Trigger to keep FTS in sync on UPDATE
CREATE TRIGGER IF NOT EXISTS deals_fts_update AFTER UPDATE ON deals
BEGIN
    UPDATE deals_fts SET 
        title = new.title,
        short_description = new.short_description,
        brand_name = (SELECT name FROM brands WHERE id = new.brand_id),
        category_name = (SELECT name FROM categories WHERE id = new.category_id)
    WHERE deal_id = new.id;
END;

-- Trigger to keep FTS in sync on DELETE
CREATE TRIGGER IF NOT EXISTS deals_fts_delete AFTER DELETE ON deals
BEGIN
    DELETE FROM deals_fts WHERE deal_id = old.id;
END;
