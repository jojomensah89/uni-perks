import { Database } from "bun:sqlite";
const db = new Database(".alchemy/miniflare/v3/d1/miniflare-D1DatabaseObject/9120643eafd6f6216a2ccb66fe260b4af25b45162a46e2a1e65503c992cfa1b8.sqlite", { readonly: true });
const tables = db.query("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log("Tables:", JSON.stringify(tables, null, 2));
const migs = db.query("SELECT * FROM d1_migrations").all();
console.log("Migrations:", JSON.stringify(migs, null, 2));
db.close();
