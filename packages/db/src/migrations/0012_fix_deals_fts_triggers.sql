-- Fix FTS5 triggers: use the correct delete+insert pattern for external content tables.
-- Plain UPDATE/DELETE on an FTS5 virtual table with content='' causes SQLite to
-- rewrite the WHERE clause as T.<col>, which fails when the col doesn't exist on the
-- content table. The official FTS5 pattern is to use the special 'delete' command.
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

-- UPDATE trigger: remove old entry then add updated entry
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

-- DELETE trigger: remove entry from FTS index
CREATE TRIGGER IF NOT EXISTS deals_fts_delete AFTER DELETE ON deals
BEGIN
    INSERT INTO deals_fts(deals_fts, rowid, deal_id, title, short_description, brand_name, category_name)
    VALUES('delete', old.rowid, old.id, old.title, old.short_description,
        (SELECT name FROM brands WHERE id = old.brand_id),
        (SELECT name FROM categories WHERE id = old.category_id));
END;
