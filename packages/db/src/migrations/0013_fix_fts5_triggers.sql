-- Fix FTS5 triggers: drop all and recreate using the correct external content table pattern.
-- SQLite FTS5 docs: to modify an external content FTS table, use the special 'delete'
-- auxiliary insert command instead of UPDATE/DELETE, which cause "no such column: T.*" errors.
DROP TRIGGER IF EXISTS deals_fts_insert;
DROP TRIGGER IF EXISTS deals_fts_update;
DROP TRIGGER IF EXISTS deals_fts_delete;

-- INSERT trigger: add new row to FTS index
CREATE TRIGGER IF NOT EXISTS deals_fts_insert AFTER INSERT ON deals
BEGIN
    INSERT INTO deals_fts(rowid, deal_id, title, short_description, brand_name, category_name)
    SELECT new.rowid, new.id, new.title, new.short_description, b.name, c.name
    FROM brands b, categories c
    WHERE b.id = new.brand_id AND c.id = new.category_id;
END;

-- UPDATE trigger: mark old entry as deleted, then insert updated entry
CREATE TRIGGER IF NOT EXISTS deals_fts_update AFTER UPDATE ON deals
BEGIN
    INSERT INTO deals_fts(deals_fts, rowid, deal_id, title, short_description, brand_name, category_name)
    VALUES('delete', old.rowid, old.id, old.title, old.short_description,
        (SELECT name FROM brands WHERE id = old.brand_id),
        (SELECT name FROM categories WHERE id = old.category_id));
    INSERT INTO deals_fts(rowid, deal_id, title, short_description, brand_name, category_name)
    SELECT new.rowid, new.id, new.title, new.short_description, b.name, c.name
    FROM brands b, categories c
    WHERE b.id = new.brand_id AND c.id = new.category_id;
END;

-- DELETE trigger: mark entry as deleted in FTS index
CREATE TRIGGER IF NOT EXISTS deals_fts_delete AFTER DELETE ON deals
BEGIN
    INSERT INTO deals_fts(deals_fts, rowid, deal_id, title, short_description, brand_name, category_name)
    VALUES('delete', old.rowid, old.id, old.title, old.short_description,
        (SELECT name FROM brands WHERE id = old.brand_id),
        (SELECT name FROM categories WHERE id = old.category_id));
END;
