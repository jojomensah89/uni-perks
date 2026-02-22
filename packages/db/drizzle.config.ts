import { defineConfig } from "drizzle-kit";
import fs from "fs";
import path from "path";

function getLocalD1DB() {
  try {
    const basePath = path.resolve(".wrangler");
    const dbFile = fs.readdirSync(basePath, { recursive: true }).find((file: any) => file.endsWith('.sqlite'));
    if (dbFile) {
      const url = path.resolve(basePath, dbFile as string);
      return `file:${url}`;
    }
  } catch (e) { }
  try {
    const basePath = path.resolve("../../.wrangler");
    const dbFile = fs.readdirSync(basePath, { recursive: true }).find((file: any) => file.endsWith('.sqlite'));
    if (dbFile) {
      const url = path.resolve(basePath, dbFile as string);
      return `file:${url}`;
    }
  } catch (e) { }

  // Alchemy specific fallsbacks
  try {
    const basePath = path.resolve("../../.alchemy");
    const dbFile = fs.readdirSync(basePath, { recursive: true }).find((file: any) => file.endsWith('.sqlite'));
    if (dbFile) {
      const url = path.resolve(basePath, dbFile as string);
      return `file:${url}`;
    }
  } catch (e) { }
  try {
    const basePath = path.resolve("../infra/.alchemy");
    const dbFile = fs.readdirSync(basePath, { recursive: true }).find((file: any) => file.endsWith('.sqlite'));
    if (dbFile) {
      const url = path.resolve(basePath, dbFile as string);
      return `file:${url}`;
    }
  } catch (e) { }
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
