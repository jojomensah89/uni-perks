import { defineConfig } from "drizzle-kit";
import fs from "fs";
import path from "path";

function getLocalD1DB() {
  // Priority 1: Look for Alchemy's D1 database (D1DatabaseObject folder, not cache)
  const alchemyD1Paths = [
    path.resolve("../../.alchemy/miniflare/v3/d1"),
    path.resolve("../infra/.alchemy/miniflare/v3/d1"),
  ];

  for (const basePath of alchemyD1Paths) {
    try {
      const files = fs.readdirSync(basePath, { recursive: true });
      const d1DbFile = files.find((file: any) =>
        file.toString().includes("D1DatabaseObject") &&
        file.toString().endsWith('.sqlite')
      );
      if (d1DbFile) {
        const url = path.resolve(basePath, d1DbFile as string);
        return `file:${url}`;
      }
    } catch (e) { }
  }

  // Priority 2: Wrangler D1 database
  const wranglerPaths = [
    path.resolve(".wrangler"),
    path.resolve("../../.wrangler"),
  ];

  for (const basePath of wranglerPaths) {
    try {
      const files = fs.readdirSync(basePath, { recursive: true });
      const dbFile = files.find((file: any) =>
        file.toString().endsWith('.sqlite') &&
        !file.toString().includes("CacheObject")
      );
      if (dbFile) {
        const url = path.resolve(basePath, dbFile as string);
        return `file:${url}`;
      }
    } catch (e) { }
  }

  // Priority 3: Legacy Alchemy fallback (root .alchemy)
  const legacyPaths = [
    path.resolve("../../.alchemy"),
    path.resolve("../infra/.alchemy"),
  ];

  for (const basePath of legacyPaths) {
    try {
      const files = fs.readdirSync(basePath, { recursive: true });
      const dbFile = files.find((file: any) =>
        file.toString().endsWith('.sqlite') &&
        !file.toString().includes("CacheObject") &&
        !file.toString().includes("KVNamespace") &&
        !file.toString().includes("R2Bucket")
      );
      if (dbFile) {
        const url = path.resolve(basePath, dbFile as string);
        return `file:${url}`;
      }
    } catch (e) { }
  }

  return "";
}

const localUrl = getLocalD1DB();

export default defineConfig({
  schema: "./src/schema",
  out: "./src/migrations",
  dialect: "sqlite",
  // If we have Cloudflare credentials, use d1-http driver (Remote/Prod)
  // Otherwise, fallback to the discovered local SQLite file (Dev)
  driver: process.env.CLOUDFLARE_D1_TOKEN ? "d1-http" : undefined,
  dbCredentials:
    process.env.CLOUDFLARE_D1_TOKEN
      ? {
        accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
        databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
        token: process.env.CLOUDFLARE_D1_TOKEN!,
      }
      : {
        url: localUrl,
      },
});
